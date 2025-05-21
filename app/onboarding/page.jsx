'use client';

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const NICHE_OPTIONS = [
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "travel", label: "Travel" },
  { value: "fitness", label: "Fitness" },
];

const CATEGORY_OPTIONS = [
  { value: "apparel", label: "Apparel" },
  { value: "cosmetics", label: "Cosmetics" },
  { value: "technology", label: "Technology" },
  { value: "food", label: "Food & Beverage" },
];

const creatorSchema = z.object({
  role: z.literal("creator"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  instagram: z.string().url("Invalid Instagram URL"),
  followers: z.coerce.number().min(0, "Followers cannot be negative").optional(),
  niche: z.string().min(1, "Please select a niche"),
  portfolio: z.instanceof(File, { message: "Portfolio is required" })
    .array()
    .min(1, "At least one file required")
    .max(5, "Maximum 5 files allowed"),
});

const brandSchema = z.object({
  role: z.literal("brand"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  website: z.string().url("Invalid website URL"),
  category: z.string().min(1, "Please select a category"),
  logo: z.instanceof(File, { message: "Logo is required" }),
});

const formSchema = z.discriminatedUnion("role", [creatorSchema, brandSchema]);

export default function OnboardingPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("creator");
  const [files, setFiles] = useState({ portfolio: [], logo: null });

  const {
    register,
    handleSubmit,
    formState,
    setValue,
    reset,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    setValue("role", activeTab, { shouldValidate: true });
    trigger(); // re-validate the form
  }, [activeTab, setValue, trigger]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      const entries = {
        ...data,
        clerkUserId: user.id,
        ...(data.role === "creator"
          ? { portfolio: files.portfolio }
          : { logo: files.logo }),
      };

      Object.entries(entries).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((file) => formData.append(key, file));
        } else if (typeof value === "number") {
          formData.append(key, value.toString());
        } else if (value) {
          formData.append(key, value);
        }
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/onboarding`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        alert("Onboarding completed successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.error || "Failed to complete onboarding");
      if (error.response?.status === 401) signOut();
    }
  };

  const handleFileUpload = (e, field) => {
    const files = Array.from(e.target.files || []);

    if (field === "portfolio") {
      const newFiles = [...files];
      setFiles((prev) => ({ ...prev, portfolio: newFiles }));
      setValue("portfolio", newFiles, { shouldValidate: true });
    } else {
      const file = files[0];
      setFiles((prev) => ({ ...prev, logo: file }));
      setValue("logo", file, { shouldValidate: true });
    }
    trigger(field);
  };

  const handleRoleChange = (newRole) => {
    setActiveTab(newRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8EC] p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1B5E20] mb-2">Complete Your Profile</h1>
          <p className="text-[#1B5E20]">Let's set up your {activeTab} profile</p>
        </div>

        <div className="mb-4 flex gap-2">
          {["creator", "brand"].map((role) => (
            <button
              key={role}
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                activeTab === role
                  ? "bg-[#1B5E20] text-white"
                  : "bg-[#FFF8EC] text-[#1B5E20] border border-[#1B5E20] hover:bg-[#F3E9D7]"
              }`}
              onClick={() => handleRoleChange(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" value={activeTab} {...register("role")} />

          {activeTab === "creator" ? (
            <>
              <InputField label="Full Name" error={formState.errors.name?.message}>
                <input
                  {...register("name")}
                  className="w-full p-2 border rounded focus:outline-[#1B5E20]"
                  placeholder="John Doe"
                />
              </InputField>

              <InputField label="Instagram Profile" error={formState.errors.instagram?.message}>
                <input
                  {...register("instagram")}
                  className="w-full p-2 border rounded focus:outline-[#1B5E20]"
                  placeholder="https://instagram.com/username"
                />
              </InputField>

              <InputField label="Niche" error={formState.errors.niche?.message}>
                <select
                  {...register("niche")}
                  className="w-full p-2 border rounded text-[#1B5E20]"
                >
                  <option value="">Select niche</option>
                  {NICHE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Portfolio (Max 5 files)" error={formState.errors.portfolio?.message}>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, "portfolio")}
                  className="w-full p-2 border rounded"
                  accept="image/*,application/pdf"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {files.portfolio.map((file, index) => (
                    <div key={index}>{file.name}</div>
                  ))}
                </div>
              </InputField>
            </>
          ) : (
            <>
              <InputField label="Brand Name" error={formState.errors.brandName?.message}>
                <input
                  {...register("brandName")}
                  className="w-full p-2 border rounded focus:outline-[#1B5E20]"
                  placeholder="Acme Corp"
                />
              </InputField>

              <InputField label="Website" error={formState.errors.website?.message}>
                <input
                  {...register("website")}
                  className="w-full p-2 border rounded focus:outline-[#1B5E20]"
                  placeholder="https://example.com"
                />
              </InputField>

              <InputField label="Category" error={formState.errors.category?.message}>
                <select
                  {...register("category")}
                  className="w-full p-2 border rounded text-[#1B5E20]"
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Logo" error={formState.errors.logo?.message}>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  className="w-full p-2 border rounded"
                  accept="image/*"
                />
                {files.logo && (
                  <div className="text-sm text-gray-600 mt-1">{files.logo.name}</div>
                )}
              </InputField>
            </>
          )}

          <button
            type="submit"
            disabled={formState.isSubmitting || !formState.isValid}
            className="w-full bg-[#1B5E20] text-white py-2 px-4 rounded hover:bg-[#145B16] disabled:opacity-50 transition-colors"
          >
            {formState.isSubmitting ? (
              <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-[#1B5E20]">{label}</label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
