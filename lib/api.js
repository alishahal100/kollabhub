import axios from "axios";


// For client-side requests, use this version:
import { useAuth } from "@clerk/nextjs";

// Create a custom hook for client-side API calls
export const useAPI = () => {
  const { getToken } = useAuth();
  
  const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // Add request interceptor to inject Clerk token
  API.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    // —— Brand (logged-in) ——
    getBrandCampaigns: async () => {
      const res = await API.get("/campaigns/brand");
      return res.data;
    },


    getCampaignsByUser: async (userId) => {
      const res = await API.get(`/campaigns/brand/${userId}`);
      return res.data;
    },
    
    postNewCampaign: async (campaignData) => {
      const res = await API.post("/campaigns/new", campaignData);
      console.log("Campaign created:", res.data);
      return res.data;
    },

    

    // —— Creator (logged-in) ——
    applyToCampaign: async (campaignId) => {
      const res = await API.post(`/campaigns/apply/${campaignId}`);
      return res.data;
    },

    getAppliedCampaigns: async () => {
      const res = await API.get("/campaigns/applied");
      return res.data;
    },

    // —— Public ——
    getAllCampaigns: async () => {
      const res = await API.get("/campaigns/all");
      return res.data;
    },
    getCampaignById: async (campaignId) => {
      const res = await API.get(`/campaigns/${campaignId}`);
      return res.data;
    },
    updateApplicationStatus : async (campaignId, creatorId, status) => {
      const res = await API.put(`/campaigns/${campaignId}/${status}/${creatorId}`);
      return res.data;
    },
    updateCampaignStatus : async (campaignId, data) => {
      const res = await API.put(`/campaigns/${campaignId}`, data);
      return res.data;
    },
    
  };
};




