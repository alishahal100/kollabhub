"use client"

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";  // Import the Dialog component from ShadCN UI
import Image from "next/image";
import useStore from "@/store";  // Import the Zustand store

// Fetch function
const fetchBrands = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/brands`);
  return res.data;
};

export default function BrandTablePage() {
  const { data: brands, isLoading, isError } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  const { isModalOpen, selectedBrand, openModal, closeModal } = useStore();  // Zustand state

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-[#1B5E20]">Brands</h2>

      {/* Loading or Error states */}
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-red-500">Error loading brands.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="p-4 border rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
              onClick={() => openModal(brand)}
            >
              <div className="flex items-center space-x-4">
                <Image
                  src={brand.brandProfile?.logo}
                  alt="Brand Logo"
                  width={50}
                  height={50}
                  className="rounded-md object-cover"
                />
                <div className="text-lg font-semibold">{brand.brandProfile?.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal from ShadCN UI */}
   <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent> {/* Use DialogContent directly */}
          <DialogHeader> {/* Use DialogHeader directly */}
            <DialogTitle>{selectedBrand?.brandProfile?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
              <div>
                <Image
                  src={selectedBrand?.brandProfile?.logo}
                  alt="Brand Logo"
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
              </div>
              <div>
                <strong>Website: </strong>
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
                <strong>Category: </strong>{selectedBrand?.brandProfile?.category || "-"}
              </div>
              <div>
                <strong>Campaigns Posted: </strong>{selectedBrand?.brandProfile?.campaignsPosted || 0}
              </div>
              <div>
                <strong>Past Collaborations: </strong>{selectedBrand?.brandProfile?.pastCollaborations || 0}
              </div>
            </div>
          <DialogFooter>
            <DialogClose>Close</DialogClose> {/* Use DialogClose directly */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
