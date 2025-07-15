"use client";

import { useEffect, useState } from "react";
import { useAPI } from "@/lib/api";
import AddCampaignModal from "@/components/AddCampaignModal";
import EditCampaignModal from "@/components/EditCampaignModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deactivateTarget, setDeactivateTarget] = useState(null); // campaign to deactivate
  const { user } = useUser();
  const { getCampaignsByUser, updateCampaignStatus } = useAPI();

  const fetchCampaigns = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);
      const data = await getCampaignsByUser(user.id);
      setCampaigns(data);
    } catch (error) {
      toast.error("Failed to fetch campaigns.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (campaignId, nextStatus) => {
    try {
      await updateCampaignStatus(campaignId, { isActive: nextStatus });
      await fetchCampaigns();
      toast.success(`Campaign ${nextStatus ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      toast.error("Failed to update campaign status.");
    } finally {
      setDeactivateTarget(null); // reset state
    }
  };

  useEffect(() => {
    if (user?.id) fetchCampaigns();
  }, [user]);

  return (
    <div className="min-h-screen w-screen px-6 py-10 bg-[#f9f9f9]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-[#1B5E20]">My Campaigns</h1>
        <Button onClick={() => setOpenAddModal(true)}>+ Add Campaign</Button>
      </div>

      <AddCampaignModal open={openAddModal} setOpen={setOpenAddModal} refreshCampaigns={fetchCampaigns} />

      {selectedCampaign && (
        <EditCampaignModal
          open={openEditModal}
          setOpen={setOpenEditModal}
          campaign={selectedCampaign}
          refreshCampaigns={fetchCampaigns}
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : campaigns.length === 0 ? (
        <p className="text-center text-gray-500">No campaigns posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign._id} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{campaign.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setOpenEditModal(true);
                  }}
                >
                  ✏️ Edit
                </Button>
              </div>

              <div className="text-sm text-gray-500 mt-2">
                <strong>Deadline:</strong> {format(new Date(campaign.applicationDeadline), "MMM dd, yyyy")}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span
                  className={`text-sm font-semibold ${
                    campaign.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {campaign.isActive ? "Active" : "Inactive"}
                </span>

                {campaign.isActive ? (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeactivateTarget(campaign)}
                        >
                          Deactivate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to deactivate this campaign?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeactivateTarget(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusUpdate(campaign._id, false)}
                          >
                            Yes, Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(campaign._id, true)}
                  >
                    Activate
                  </Button>
                )}
              </div>

              <div className="pt-4">
                <Link href={`/brand-dashboard/campaign/applications/${campaign._id}`}>
                  <Button size="sm" className="w-full">
                    📄 View Applications
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
