"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useAPI } from "@/lib/api";
import { toast } from "sonner";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");

export default function ChatComponent({ receiverId, campaignId }) {
  const { user } = useUser();
  const senderId = user?.id;

  const { getMessages, sendMessage } = useAPI();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const audioRef = useRef(null);

  // Join socket room
  useEffect(() => {
    if (senderId) {
      socket.emit("join", { userId: senderId });
    }
  }, [senderId]);

  // Handle incoming messages
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      // Show toast
      toast.success("New message received!");

      // Play sound
      if (audioRef.current) {
        audioRef.current.play();
      }

      // Update chat UI if the message is relevant
      if (
        (message.senderId === receiverId && message.receiverId === senderId) ||
        (message.receiverId === receiverId && message.senderId === senderId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [receiverId, senderId]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!senderId || !receiverId) return;
    const data = await getMessages({ senderId, receiverId });
    setMessages(data);
  };

  // Send message
  const handleSend = async () => {
    if (!newMsg.trim()) return;
    const messageData = {
      senderId,
      receiverId,
      content: newMsg,
      campaignId,
    };
    await sendMessage(messageData);
    socket.emit("sendMessage", messageData);
    setNewMsg("");
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, [receiverId, senderId]);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white border rounded p-4 mt-4 shadow">
      <audio ref={audioRef} src="/notify.mp3" preload="auto" />
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
