"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const fetchUserDetails = async (userId, cache, setCache) => {
  if (!userId?.startsWith("user_")) return null;
  if (cache[userId]) return cache[userId];

  try {
    const res = await axios.get(`/api/user-details?userId=${userId}`);
    setCache((prev) => ({ ...prev, [userId]: res.data }));
    return res.data;
  } catch {
    return null;
  }
};

export default function BrandConnectionsPage() {
  const { user } = useUser();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [userCache, setUserCache] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchConnections = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/connections/received/${user.id}`),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/connections/accepted/${user.id}`),
      ]);

      const enrich = async (conns) =>
        await Promise.all(
          conns.map(async (conn) => {
            const sender = await fetchUserDetails(conn.senderId, userCache, setUserCache);
            return { ...conn, sender };
          })
        );

      setPendingRequests(await enrich(pendingRes.data));
      setConnections(await enrich(acceptedRes.data));
    } catch (err) {
      toast.error("Error fetching connections");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/connections/${id}/status`, { status });
      toast.success(`Connection ${status}`);
      fetchConnections();
    } catch {
      toast.error("Failed to update connection");
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const renderCard = (conn, isPending) => {
    const creator = conn.sender;
    return (
      <Card key={conn._id} className="bg-white shadow-md rounded-xl">
        <CardHeader className="flex gap-3 items-center">
          <Image
            src={creator?.imageUrl || "/placeholder.jpg"}
            alt="Creator"
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">
              {creator?.firstName} {creator?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{creator?.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{conn.message}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isPending ? (
            <>
              <Button variant="outline" onClick={() => handleStatusUpdate(conn._id, "rejected")}>
                Reject
              </Button>
              <Button onClick={() => handleStatusUpdate(conn._id, "connected")}>Accept</Button>
            </>
          ) : (
            <Link href={`/messages/${creator?.id}`}>
              <Button>Message</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-10 min-h-screen bg-[#f9f9f9]">
      <h1 className="text-3xl font-bold text-[#1B5E20]">Creator Connections</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section>
            <h2 className="text-xl font-semibold mb-3">Pending Requests</h2>
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground">No pending requests.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingRequests.map((conn) => renderCard(conn, true))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Connected</h2>
            {connections.length === 0 ? (
              <p className="text-muted-foreground">No accepted connections yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {connections.map((conn) => renderCard(conn, false))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
