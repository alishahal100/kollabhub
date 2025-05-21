'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAPI } from "@/lib/api"; // Updated import
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs"; // Add Clerk auth

export default function AddCampaignModal({ open, setOpen, refreshCampaigns }) {
  const { userId } = useAuth(); // Get Clerk user ID
  const { postNewCampaign } = useAPI(); // Use the API hook
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deliverables: "",
    budget: 0,
    category: "",
    applicationDeadline: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? 
      parseFloat(e.target.value) : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Add server-expected fields
      const payload = {
        ...formData,
        brandId: userId, // Use Clerk user ID
        
        applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
      
      };

      await postNewCampaign(payload);
      
      toast.success("Campaign posted successfully!");
      setFormData({
        title: "",
        description: "",
        deliverables: "",
        budget: 0,
        category: "",
        applicationDeadline: ""
      });
      setOpen(false);
      refreshCampaigns();
    } catch (error) {
      console.error('Campaign submission error:', error);
      toast.error(error?.response?.data?.message || "Failed to post campaign. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post New Collaboration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input 
            name="title" 
            placeholder="Title" 
            value={formData.title} 
            onChange={handleChange} 
            required
          />
          
          <Textarea 
            name="description" 
            placeholder="Description" 
            value={formData.description} 
            onChange={handleChange} 
            required
          />
          
          <Input
            name="deliverables"
            placeholder="Deliverables (comma-separated)"
            value={formData.deliverables}
            onChange={handleChange}
            required
          />
          
          <Input
            type="number"
            name="budget"
            placeholder="Budget"
            value={formData.budget}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
          
          <Input
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            required
          />
          
          <Input
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />

          <Button 
            className="w-full" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Collaboration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}