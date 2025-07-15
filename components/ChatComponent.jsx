"use client";
import { useEffect, useState, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useAPI } from "@/lib/api";
import { toast } from "sonner";
import { io } from "socket.io-client";

export default function ChatComponent({ receiverId, campaignId }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const senderId = user?.id;

  const { getMessages, sendMessage } = useAPI();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const audioRef = useRef(null);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  // 🧠 Socket Initialization
  useEffect(() => {
    const initSocket = async () => {
      if (!senderId) return;

      const token = await getToken();
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000", {
        auth: { token },
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("🟢 Connected to socket", socketRef.current.id);
        socketRef.current.emit("join", senderId); // Simplified - just send the ID
      });

      socketRef.current.on("receiveMessage", (message) => {
        const isRelevant =
          (message.senderId === receiverId && message.receiverId === senderId) ||
          (message.receiverId === receiverId && message.senderId === senderId);

        if (isRelevant) {
          setMessages(prev => {
            // Check if message already exists (for optimistic updates)
            const exists = prev.some(m => m._id === message._id || 
              (m._id?.includes('temp-') && m.content === message.content));
            
            return exists ? prev : [...prev, message];
          });
          
          if (audioRef.current) audioRef.current.play();
          toast.success("💬 New message received");
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("🔴 Socket disconnected");
      });
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [senderId, receiverId, getToken]);

  // 📨 Fetch Past Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!senderId || !receiverId) return;
      const data = await getMessages({ senderId, receiverId });
      setMessages(data);
    };
    fetchMessages();
  }, [receiverId, senderId, getMessages]);

  // 📬 Handle Send Message
  const handleSend = async () => {
    if (!newMsg.trim()) return;

    const messageData = {
      senderId,
      receiverId,
      content: newMsg,
      campaignId,
      timestamp: new Date().toISOString()
    };

    // Optimistic update with temporary ID
    const tempId = Date.now();
    setMessages(prev => [...prev, { ...messageData, _id: `temp-${tempId}` }]);

    try {
      // Emit via socket
      socketRef.current?.emit("sendMessage", messageData);
      
      // Save to DB and get the actual message with real ID
      const savedMessage = await sendMessage(messageData);
      
      // Replace temporary message with the saved one
      setMessages(prev => prev.map(msg => 
        msg._id === `temp-${tempId}` ? savedMessage : msg
      ));
    } catch (error) {
      // Remove the temporary message if sending fails
      setMessages(prev => prev.filter(msg => msg._id !== `temp-${tempId}`));
      toast.error("Failed to send message");
    }

    setNewMsg("");
  };

  // 🔽 Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white border rounded-lg shadow-lg p-4">
      <audio ref={audioRef} src="/notify.mp3" preload="auto" />
      <div className="h-96 overflow-y-auto space-y-2 mb-4 px-2">
        {messages.map((msg, i) => {
          const isSender = msg.senderId === senderId;
          return (
            <div
              key={msg._id || i} // Use message ID if available
              className={`text-sm p-3 rounded-xl max-w-xs break-words ${
                isSender
                  ? "ml-auto bg-green-500 text-white"
                  : "mr-auto bg-gray-200 text-gray-800"
              }`}
            >
              {msg.content}
              <div className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-green-500"
          placeholder="Type your message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}