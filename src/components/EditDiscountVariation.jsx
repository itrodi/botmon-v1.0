import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditDiscountVariation = ({ discountId, initialData, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [discountData, setDiscountData] = useState({
    name: '',
    coupon: '',
    duration: '',
    percent: ''
  });

  useEffect(() => {
    // Initialize form with provided data when component mounts
    if (initialData) {
      setDiscountData({
        name: initialData.name || '',
        coupon: initialData.coupon || '',
        duration: initialData.duration || '',
        percent: initialData.percent ? initialData.percent.toString() : ''
      });
    }
  }, [initialData]);

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setDiscountData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle duration selection
  const handleDurationChange = (value) => {
    setDiscountData(prev => ({
      ...prev,
      duration: value
    }));
  };

  // Submit discount updates to backend
  const handleSubmit = async () => {
    // Validate all fields are filled
    if (!discountData.name.trim() || !discountData.coupon.trim() || 
        !discountData.duration || !discountData.percent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate percent is a valid number
    let percentValue = discountData.percent.replace('%', '');
    if (isNaN(percentValue) || Number(percentValue) <= 0 || Number(percentValue) > 100) {
      toast.error('Discount percentage must be a number between 1 and 100');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/edit-discount',
        {
          'discount-id': discountId,
          Names: discountData.name,
          Coupons: discountData.coupon,
          Durations: discountData.duration,
          Percents: percentValue
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success === "Discount updated successfully") {
        toast.success('Discount updated successfully');
        // Call success callback to refresh parent component
        onSuccess?.();
        // Close the dialog
        onClose?.();
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error(error.response?.data?.error || 'Failed to update discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Discount</DialogTitle>
        <DialogDescription>
          Update your discount or coupon details
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Discount Name */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Discount Name
          </Label>
          <Input
            id="name"
            value={discountData.name}
            onChange={handleInputChange}
            placeholder="e.g. Summer Sale"
            className="ml-auto col-span-3"
          />
        </div>
        
        {/* Coupon Code */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="coupon" className="text-right">
            Coupon
          </Label>
          <Input
            id="coupon"
            value={discountData.coupon}
            onChange={handleInputChange}
            placeholder="e.g. SUMMER2025"
            className="ml-auto col-span-3"
          />
        </div>
        
        {/* Duration */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="duration" className="text-right">
            Duration
          </Label>
          <div className="ml-auto col-span-3">
            <Select 
              value={discountData.duration}
              onValueChange={handleDurationChange}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 day">1 day</SelectItem>
                <SelectItem value="2 days">2 days</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
                <SelectItem value="1 month">1 month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Discount Percentage */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="percent" className="text-right">
            Discount Percentage
          </Label>
          <Input
            id="percent"
            value={discountData.percent}
            onChange={handleInputChange}
            placeholder="e.g. 15%"
            className="ml-auto col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? 'Updating...' : 'Update Discount'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditDiscountVariation;