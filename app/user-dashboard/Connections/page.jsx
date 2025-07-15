"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function ConnectionsPage() {
  const { user } = useUser();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userCache, setUserCache] = useState({});

  const fetchUserDetails = async (userId) => {
    if (!userId?.startsWith("user_")) return null;
    if (userCache[userId]) return userCache[userId];

    try {
      const res = await axios.get(`/api/user-details?userId=${userId}`);
      const userData = res.data;
      setUserCache((prev) => ({ ...prev, [userId]: userData }));
      return userData;
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      return null;
    }
  };

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/connections/user/${user.id}`);
      const rawConnections = res.data;

      const enrichedConnections = await Promise.all(
        rawConnections.map(async (conn) => {
          const sender = await fetchUserDetails(conn.senderId);
          const receiver = await fetchUserDetails(conn.receiverId);
          return { ...conn, sender, receiver };
        })
      );

      setConnections(enrichedConnections);
    } catch (error) {
      toast.error("Failed to fetch connections.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (connectionId, status) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/connections/${connectionId}/status`, { status });
      toast.success(`Connection ${status}`);
      fetchConnections();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  useEffect(() => {
    if (user?.id) fetchConnections();
  }, [user]);

  // Separate pending received & connected connections
  const pendingReceived = connections.filter(
    (conn) => conn.status === "pending" && conn.receiverId === user.id
  );

  const connected = connections.filter((conn) => conn.status === "connected");

  const renderCard = (conn) => {
    const isSender = conn.senderId === user.id;
    const otherUser = isSender ? conn.receiver : conn.sender;

    return (
      <Card key={conn._id} className="shadow-lg bg-white rounded-xl">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Image
              src={otherUser?.imageUrl || "/placeholder.jpg"}
              alt="profile"
              width={50}
              height={50}
              className="rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">
                {otherUser?.firstName || "Unnamed"} {otherUser?.lastName || ""}
              </h2>
              <p className="text-sm text-gray-500">
                {conn.status === "pending"
                  ? isSender
                    ? "You requested to connect"
                    : "Requested to connect with you"
                  : "You are now connected"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600">{conn.message}</p>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          {conn.status === "pending" && !isSender ? (
            <>
              <Button variant="outline" onClick={() => handleStatusUpdate(conn._id, "rejected")}>
                Reject
              </Button>
              <Button onClick={() => handleStatusUpdate(conn._id, "connected")}>
                Accept
              </Button>
            </>
          ) : conn.status === "connected" ? (
            <Link href={`/messages/${otherUser?.id}`}>
              <Button>Message</Button>
            </Link>
          ) : (
            <p className="text-sm text-red-500 font-medium">Connection Rejected</p>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-[#f9f9f9]">
      <h1 className="text-3xl font-bold text-[#1B5E20] mb-6">Connections</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Pending Requests Section */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Pending Requests</h2>
            {pendingReceived.length === 0 ? (
              <p className="text-gray-500">No incoming requests.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingReceived.map(renderCard)}
              </div>
            )}
          </section>

          {/* Connected Users Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Connected</h2>
            {connected.length === 0 ? (
              <p className="text-gray-500">No connections yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {connected.map(renderCard)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
