// components/CreatorProfileModal.jsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingSpinner from "./LoadingSpinner";
export default function CreatorProfileModal({ open, setOpen, profile }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Creator Profile</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-4 space-y-2">
              {profile ? (
                <>
                  <p><strong>Name:</strong> {profile.name}</p>
                  <p>
                    <strong>Instagram:</strong>{" "}
                    <a
                      href={profile.instagram}
                      className="text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile.instagram}
                    </a>
                  </p>
                  <p><strong>Niche:</strong> {profile.niche}</p>
                  <p><strong>Followers:</strong> {profile.followers}</p>
                  <p><strong>Verified:</strong> {profile.verifiedBadge ? "Yes" : "No"}</p>

                  {profile.portfolio?.length > 0 && (
                    <>
                      <p className="font-semibold mt-2">Portfolio:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {profile.portfolio.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt="Portfolio"
                            className="w-full h-auto rounded-md"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
