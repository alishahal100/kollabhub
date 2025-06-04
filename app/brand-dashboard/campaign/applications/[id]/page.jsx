"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import CreatorProfileModal from "@/components/CreatorProfileModal";
import ChatComponent from "@/components/ChatComponent";

export default function ApplicationsPage() {
  const { id: campaignId } = useParams();
  const { getCampaignById, updateApplicationStatus } = useAPI();

  const [campaign, setCampaign] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);

  // Chat Modal State
  const [openChat, setOpenChat] = useState(false);
  const [chatWith, setChatWith] = useState(null); // creatorId

  const fetchCampaign = async () => {
    try {
      if (!campaignId) return;
      const data = await getCampaignById(campaignId);
      setCampaign(data);
    } catch {
      toast.error("Failed to fetch campaign details.");
    }
  };

  const handleApplicationStatus = async (creatorId, status) => {
    try {
      await updateApplicationStatus(campaignId, creatorId, status);
      await fetchCampaign();
      toast.success(`Application ${status}!`);
    } catch {
      toast.error("Failed to update application status.");
    }
  };

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    setOpenProfile(true);
  };

  const openChatModal = (creatorId) => {
    setChatWith(creatorId);
    setOpenChat(true);
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  if (!campaign) {
    return (
      <div className="flex items-center w-screen justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[#fefefe]">
      <h1 className="text-3xl font-bold mb-6 text-[#1B5E20]">
        Applications for "{campaign.title}"
      </h1>

      {campaign.applications.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {campaign.applications.map((app) => (
            <Card
              key={app._id}
              className="px-6 py-4 shadow border rounded-lg"
            >
              <div className="flex justify-between flex-wrap gap-4 items-center">
                <div>
                  <p className="font-semibold">Creator ID: {app.creatorId}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    Status: {app.status}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openProfileModal(app.creatorProfile)}
                  >
                    View Profile
                  </Button>

                  <Button
                    size="sm"
                    variant={app.status === "accepted" ? "default" : "outline"}
                    onClick={() =>
                      handleApplicationStatus(app.creatorId, "accepted")
                    }
                  >
                    Accept
                  </Button>

                  <Button
                    size="sm"
                    variant={app.status === "rejected" ? "default" : "outline"}
                    onClick={() =>
                      handleApplicationStatus(app.creatorId, "rejected")
                    }
                  >
                    Reject
                  </Button>

                  {app.status === "accepted" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openChatModal(app.creatorId)}
                    >
                      💬 Message
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Creator Profile */}
      <CreatorProfileModal
        open={openProfile}
        setOpen={setOpenProfile}
        profile={selectedProfile}
      />

      {/* Modal: Chat */}
      <Dialog open={openChat} onOpenChange={setOpenChat}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chat with Creator</DialogTitle>
          </DialogHeader>
          {chatWith && (
            <ChatComponent receiverId={chatWith} campaignId={campaignId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
