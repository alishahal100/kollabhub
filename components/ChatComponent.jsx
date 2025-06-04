"use client";
import { useEffect, useState } from "react";
import { useAPI } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

export default function ChatComponent({ receiverId, campaignId }) {
  const { user } = useUser();
  const senderId = user?.id;

  const { getMessages, sendMessage } = useAPI();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const fetchMessages = async () => {
    if (!senderId || !receiverId) return;
    try {
      const data = await getMessages({ senderId, receiverId });
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !senderId) return;
    try {
      await sendMessage({
        senderId,
        receiverId,
        content: newMsg,
        campaignId,
      });
      setNewMsg("");
      fetchMessages();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [receiverId, senderId]);

  return (
    <div className="w-full max-w-lg mx-auto bg-white border rounded p-4 mt-4 shadow">
      <div className="h-64 overflow-y-auto space-y-2 mb-4 px-1">
        {messages.map((msg, i) => {
          const isSender = msg.senderId === senderId;
          return (
            <div
              key={i}
              className={`text-sm p-2 rounded max-w-xs ${
                isSender
                  ? "bg-green-100 text-right ml-auto"
                  : "bg-gray-200 text-left"
              }`}
            >
              {msg.content}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring focus:border-green-500"
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
