import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export const useAPI = () => {
  const { getToken } = useAuth();
  
  const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001",
    withCredentials: true,
    timeout: 30000,
  });

  API.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    getMessages: async ({ user1, user2 }) => {
      const res = await API.get(`/messages/${user1}/${user2}`);
      return res.data;
    },
    sendMessage: async (data) => {
      const res = await API.post('/messages', data);
      return res.data;
    },
    getConversations: async (userId) => {
      const res = await API.get(`/messages/conversations/${userId}`);
      return res.data;
    },
  };
};