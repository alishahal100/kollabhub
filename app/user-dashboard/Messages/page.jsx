"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ChatComponent from "@/components/ChatComponent";
import { useAPI } from "@/lib/api";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { getConversations } = useAPI();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!isLoaded || !user?.id) return;
    setLoading(true);

    try {
      const data = await getConversations(user.id);

      // Fetch user details from Clerk
      const userDetails = await Promise.all(
        data.map(async (conv) => {
          try {
            const res = await fetch(`/api/user-details?userId=${conv.userId}`);
            const userData = await res.json();

            return {
              ...conv,
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              image: userData.imageUrl,
            };
          } catch {
            return { ...conv, name: "Unknown User", email: "", image: "" };
          }
        })
      );

      setConversations(userDetails);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchConversations();
    }
  }, [user?.id, isLoaded]);

  const openChat = (conversation) => {
    setSelectedConversation({
      receiverId: conversation.userId,
      campaignId: conversation.campaignId,
    });
    setOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-semibold mb-4">Messages</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv, index) => (
            <div
              key={index}
              onClick={() => openChat(conv)}
              className="cursor-pointer p-4 border rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                {conv.image && (
                  <img
                    src={conv.image}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex flex-col">
                  <p className="font-medium">{conv.name}</p>
                  <p className="text-sm text-gray-500">{conv.email}</p>
                  <p className="text-sm mt-1">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(conv.createdAt).toLocaleString()}
                  </p>
                  {conv.campaignId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">
                      Campaign: {conv.campaignId.substring(0, 6)}...
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl w-full">
          <DialogTitle className="text-lg font-semibold">
             Chat with{" "}
          {selectedConversation && (
            <ChatComponent
              receiverId={selectedConversation.receiverId}
              campaignId={selectedConversation.campaignId}
            />
          )}
          </DialogTitle>
        </DialogContent>
      </Dialog>
    </div>
  );
}
