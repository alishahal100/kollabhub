import { useEffect,useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAPI } from "@/lib/api";
import { getSocket, connectSocket } from "@/lib/socket";

export default function ChatComponent({ receiverId, campaignId }) {
  const { user } = useUser();
  const senderId = user?.id;
  const { getMessages } = useAPI();

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const scrollRef = useRef();
  const socketRef = useRef(null);

  const fetchMessages = async () => {
    const data = await getMessages({ user1: senderId, user2: receiverId });
    setMessages(data);
  };

  const handleSend = () => {
    if (!newMsg.trim()) return;

    const message = {
      senderId,
      receiverId,
      content: newMsg,
      campaignId,
    };

    socketRef.current.emit("sendMessage", message);
    setMessages((prev) => [...prev, { 
      ...message, 
      _id: Date.now().toString(), 
      status: "sent",
      createdAt: new Date() 
    }]);
    setNewMsg("");
    socketRef.current.emit("stopTyping", { senderId, receiverId });
  };

  const handleTyping = () => {
    socketRef.current.emit("typing", { senderId, receiverId });
    
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", { senderId, receiverId });
    }, 1000);
  };

  const markMessageSeen = (message) => {
    if (!message.seen && message.receiverId === senderId) {
      socketRef.current.emit("markMessageAsSeen", { 
        messageId: message._id, 
        userId: senderId 
      });
    }
  };

  useEffect(() => {
    if (senderId) {
      fetchMessages();
      socketRef.current = connectSocket(senderId);

      socketRef.current.on("receiveMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socketRef.current.on("messageDelivered", (messageId) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, status: "delivered" } : msg
          )
        );
      });

      socketRef.current.on("messageSeenUpdate", ({ messageId }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, seen: true } : msg
          )
        );
      });

      socketRef.current.on("typing", (fromId) => {
        if (fromId === receiverId) setIsTyping(true);
      });

      socketRef.current.on("stopTyping", (fromId) => {
        if (fromId === receiverId) setIsTyping(false);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage");
        socketRef.current.off("messageDelivered");
        socketRef.current.off("messageSeenUpdate");
        socketRef.current.off("typing");
        socketRef.current.off("stopTyping");
      }
    };
  }, [senderId, receiverId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Mark messages as seen
    messages.forEach(msg => {
      if (!msg.seen && msg.receiverId === senderId) {
        markMessageSeen(msg);
      }
    });
  }, [messages]);

  return (
    <div className="w-full max-w-lg mx-auto bg-white border rounded p-4 mt-4 shadow">
      <div className="h-64 overflow-y-auto space-y-2 mb-2 px-1">
        {messages.map((msg, i) => {
          const isSender = msg.senderId === senderId;
          const status = 
            isSender && msg.seen ? "Seen" : 
            isSender && msg.status === "delivered" ? "Delivered" : 
            isSender ? "Sent" : "";

          return (
            <div
              key={i}
              className={`text-sm p-2 rounded max-w-xs ${
                isSender
                  ? "bg-green-100 text-right ml-auto"
                  : "bg-gray-200 text-left"
              }`}
            >
              <div>{msg.content}</div>
              <div className="text-xs mt-1 text-gray-500 text-right">
                {status}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {isTyping && (
        <div className="text-xs italic text-gray-500 mb-2">Typing...</div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring focus:border-green-500"
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={handleTyping}
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