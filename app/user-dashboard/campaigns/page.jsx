"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@clerk/nextjs"

const CampaignJoinPage = () => {
  const queryClient = useQueryClient()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const { getToken, userId } = useAuth()

  // Convert MongoDB ObjectId to string
  const parseId = (id) => id?.$oid ? id.$oid : id.toString()

  // Fetch all active campaigns with normalized IDs
  const { data: campaigns, isLoading, isError } = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: async () => {
      const { data } = await axios.get(`${backendUrl}/campaigns/all`)
      return data.map(campaign => ({
        ...campaign,
        _id: parseId(campaign._id),
        applicationDeadline: new Date(campaign.applicationDeadline)
      }))
    }
  })

  // Fetch applied campaign IDs with proper parsing
  const { data: appliedCampaignIds = [] } = useQuery({
    queryKey: ["applied-campaign-ids", userId],
    queryFn: async () => {
      const token = await getToken()
      const { data } = await axios.get(`${backendUrl}/campaigns/applied`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Parse IDs and filter applications
      const ids = data.flatMap(campaign => {
        const campaignId = parseId(campaign._id)
        const hasApplied = campaign.applications?.some(app => 
          parseId(app.creatorId) === userId
        )
        return hasApplied ? [campaignId] : []
      })

      console.log("Applied Campaign IDs:", ids)
      return ids
    },
    enabled: !!userId
  })

  // Apply mutation with proper ID handling
  const applyMutation = useMutation({
    mutationFn: async (campaignId) => {
      const token = await getToken()
      return axios.post(
        `${backendUrl}/campaigns/apply/${campaignId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    },
    onMutate: async (campaignId) => {
      await queryClient.cancelQueries(["applied-campaign-ids", userId])
      const previousIds = queryClient.getQueryData(["applied-campaign-ids", userId]) || []
      queryClient.setQueryData(["applied-campaign-ids", userId], [...previousIds, campaignId])
      return { previousIds }
    },
    onError: (error, campaignId, context) => {
      queryClient.setQueryData(["applied-campaign-ids", userId], context.previousIds)
      toast.error(error.response?.data?.message || "Application failed")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applied-campaign-ids", userId],
        exact: true
      })
      toast.success("Application submitted!")
    }
  })

  const handleApply = (campaignId) => {
    if (appliedCampaignIds.includes(campaignId)) {
      toast.error("You've already applied to this campaign")
      return
    }
    applyMutation.mutate(campaignId)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl bg-gray-100/50" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load campaigns. Please try again later.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Campaigns</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns?.map((campaign) => {
          const isApplied = appliedCampaignIds.includes(campaign._id)
          const isApplying = applyMutation.isPending && applyMutation.variables === campaign._id

          return (
            <div
              key={campaign._id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
              <p className="text-gray-600 mb-4 flex-grow">{campaign.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-700 mr-2">Budget:</span>
                  <span className="text-emerald-600">${campaign.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-700 mr-2">Deadline:</span>
                  <span className="text-gray-600">
                    {format(campaign.applicationDeadline, "MMM dd, yyyy")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleApply(campaign._id)}
                disabled={isApplied || isApplying}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {isApplied ? "Applied" : isApplying ? "Applying..." : "Apply Now"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CampaignJoinPage