import React, { useState } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProductVariation = ({ isOpen, onClose, onVariantAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [variantData, setVariantData] = useState({
    vname: '',
    vsize: '',
    vtype: '',
    vcolor: '',
    vquantity: '',
    vprice: ''
  });
  const [variantImage, setVariantImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVariantData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate image file
  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Image size should be less than 10MB');
      return false;
    }

    return true;
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setVariantImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setVariantImage(null);
    setImagePreview(null);
  };

  // Reset form
  const resetForm = () => {
    setVariantData({
      vname: '',
      vsize: '',
      vtype: '',
      vcolor: '',
      vquantity: '',
      vprice: ''
    });
    setVariantImage(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!variantData.vname || !variantData.vprice || !variantData.vquantity) {
      toast.error('Please fill in name, price, and quantity');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      Object.entries(variantData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (variantImage) {
        formData.append('vimage', variantImage);
      }

      console.log('Submitting variant:', variantData);

      const response = await axios.post(
        'https://api.automation365.io/varian',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data === "done") {
        toast.success('Variant added successfully');
        
        // Call the callback to refresh variants if provided
        if (onVariantAdded) {
          onVariantAdded();
        }
        
        // Reset form and close dialog
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      toast.error(error.response?.data?.error || 'Failed to add variant');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Product Variant</DialogTitle>
          <DialogDescription>
            Create different size, color, or type variations for your product.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Variant Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vname" className="text-right font-medium">
              Name *
            </Label>
            <Input
              id="vname"
              name="vname"
              value={variantData.vname}
              onChange={handleInputChange}
              placeholder="e.g., Large Blue"
              className="col-span-3"
              required
            />
          </div>

          {/* Size and Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vsize" className="text-right font-medium">
              Size
            </Label>
            <Input
              id="vsize"
              name="vsize"
              value={variantData.vsize}
              onChange={handleInputChange}
              placeholder="e.g., XL"
              className="col-span-1"
            />
            <Label htmlFor="vtype" className="text-right font-medium">
              Type
            </Label>
            <Input
              id="vtype"
              name="vtype"
              value={variantData.vtype}
              onChange={handleInputChange}
              placeholder="e.g., Cotton"
              className="col-span-1"
            />
          </div>

          {/* Color */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vcolor" className="text-right font-medium">
              Color
            </Label>
            <Input
              id="vcolor"
              name="vcolor"
              value={variantData.vcolor}
              onChange={handleInputChange}
              placeholder="e.g., Blue"
              className="col-span-3"
            />
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vquantity" className="text-right font-medium">
              Quantity *
            </Label>
            <Input
              id="vquantity"
              name="vquantity"
              type="number"
              min="0"
              value={variantData.vquantity}
              onChange={handleInputChange}
              placeholder="0"
              className="col-span-1"
              required
            />
            <Label htmlFor="vprice" className="text-right font-medium">
              Price *
            </Label>
            <Input
              id="vprice"
              name="vprice"
              type="number"
              min="0"
              step="0.01"
              value={variantData.vprice}
              onChange={handleInputChange}
              placeholder="0.00"
              className="col-span-1"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right font-medium">
              Image
            </Label>
            <div className="col-span-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Variant preview"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-1 right-1 bg-white rounded-full p-1"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Upload image</span>
                        <input 
                          type="file" 
                          className="sr-only" 
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF, WebP up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Variant'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVariation;