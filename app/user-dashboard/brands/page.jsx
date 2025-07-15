"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import useStore from "@/store";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

// ✅ Fetch all brands (each with Clerk user ID as their _id or id)
const fetchBrands = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/brands`
  );
  return res.data;
};

// ✅ Fetch current user's sent connection requests
const fetchUserConnections = async (userId) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/connections/sent/${userId}`
  );
  return res.data;
};

export default function BrandTablePage() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { isModalOpen, selectedBrand, openModal, closeModal } = useStore();

  const {
    data: brands = [],
    isLoading: loadingBrands,
    isError,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  const { data: connections = [], isLoading: loadingConnections } = useQuery({
    queryKey: ["connections", user?.id],
    queryFn: () => fetchUserConnections(user.id),
    enabled: !!user?.id,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async ({ senderId, receiverId, senderRole, message }) => {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/connections/send`,
        {
          senderId, // e.g., user_123
          receiverId, // e.g., user_456
          senderRole,
          message,
        }
      );
    },
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries(["connections", user?.id]);
      closeModal();
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || "Failed to send request.";
      toast.error(msg);
    },
  });

  const hasRequested = (brandId) => {
    return connections.some(
      (conn) =>
        conn.senderId === user?.id &&
        conn.receiverId === brandId &&
        (conn.status === "pending" || conn.status === "accepted")
    );
  };

  const handleRequestConnection = () => {
    if (!user || !selectedBrand) return toast.error("Something went wrong");

    const receiverId = selectedBrand.id || selectedBrand._id; // Clerk user ID

    sendRequestMutation.mutate({
      senderId: user.id, // Clerk user ID
      receiverId,
      senderRole: "creator",
      message: "Hi, I'd love to collaborate!",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1B5E20]">Brands</h2>

      {loadingBrands || loadingConnections ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-red-500">Error loading brands.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => {
            const brandId = brand.id || brand._id; // Clerk ID
            const isRequested = hasRequested(brandId);

            return (
              <div
                key={brandId}
                className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-transform hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src={brand.brandProfile?.logo || "/default-logo.png"}
                    alt="Brand Logo"
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">
                      {brand.brandProfile?.name}
                    </span>
                    <Button className="mt-2" onClick={() => openModal(brand)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Brand Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBrand?.brandProfile?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Image
              src={selectedBrand?.brandProfile?.logo || "/default-logo.png"}
              alt="Brand Logo"
              width={80}
              height={80}
              className="rounded-md object-cover"
            />
            <div>
              <strong>Website:</strong>{" "}
              <a
                href={selectedBrand?.brandProfile?.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {selectedBrand?.brandProfile?.website || "-"}
              </a>
            </div>
            <div>
              <strong>Category:</strong>{" "}
              {selectedBrand?.brandProfile?.category || "-"}
            </div>
            <div>
              <strong>Campaigns Posted:</strong>{" "}
              {selectedBrand?.brandProfile?.campaignsPosted || 0}
            </div>
            <div>
              <strong>Past Collaborations:</strong>{" "}
              {selectedBrand?.brandProfile?.pastCollaborations || 0}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>

            {!hasRequested(selectedBrand?.id || selectedBrand?._id) && (
              <Button onClick={handleRequestConnection}>Send Request</Button>
            )}

            {hasRequested(selectedBrand?.id || selectedBrand?._id) && (
              <Button disabled variant="outline">
                Already Requested
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
