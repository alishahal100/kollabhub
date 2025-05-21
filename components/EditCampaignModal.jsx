"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog,DialogOverlay,DialogTitle, } from "./ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAPI } from "@/lib/api"
import { toast } from "react-hot-toast"

const EditCampaignModal = ({ open, setOpen, campaign, refreshCampaigns }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { updateCampaign } = useAPI()

  useEffect(() => {
    if (campaign) {
      // Set form default values when campaign changes
      reset({
        title: campaign.title,
        description: campaign.description,
        budget: campaign.budget,
        category: campaign.category,
        deliverables: campaign.deliverables?.join(", "),
        applicationDeadline: formatDateForInput(campaign.applicationDeadline)
      })
    }
  }, [campaign, reset])

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString)
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return localDate.toISOString().slice(0, 16)
  }

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        budget: Number(data.budget),
        deliverables: data.deliverables.split(",").map(d => d.trim()),
        applicationDeadline: new Date(data.applicationDeadline)
      }

      await updateCampaign(campaign._id, formattedData)
      toast.success("Campaign updated successfully!")
      refreshCampaigns()
      setOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update campaign")
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <DialogOverlay className="fixed inset-0 bg-black/30" />

        <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <DialogTitle className="text-2xl font-bold mb-6">
            Edit Campaign
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                className="mt-1"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description", { required: "Description is required" })}
                className="mt-1"
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  {...register("budget", {
                    required: "Budget is required",
                    min: { value: 1, message: "Budget must be at least $1" }
                  })}
                  className="mt-1"
                />
                {errors.budget && (
                  <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  {...register("category", { required: "Category is required" })}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select Category</option>
                  <option value="fashion">Fashion</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="technology">Technology</option>
                  <option value="food">Food & Beverage</option>
                  <option value="travel">Travel</option>
                  <option value="fitness">Fitness</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="deliverables">Deliverables (comma separated)</Label>
              <Input
                id="deliverables"
                {...register("deliverables", { required: "Deliverables are required" })}
                className="mt-1"
                placeholder="e.g., 3 Instagram posts, 1 unboxing video"
              />
              {errors.deliverables && (
                <p className="text-red-500 text-sm mt-1">{errors.deliverables.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="datetime-local"
                {...register("applicationDeadline", {
                  required: "Deadline is required",
                  validate: value => new Date(value) > new Date() || "Deadline must be in the future"
                })}
                className="mt-1"
              />
              {errors.applicationDeadline && (
                <p className="text-red-500 text-sm mt-1">{errors.applicationDeadline.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}

export default EditCampaignModal