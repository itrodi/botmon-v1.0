import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Globe } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Onboarding1 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    'buisness-name': '',
    'buisness-des': '',
    'bphone': '',
    'bcategory': '',
  });
  const [image, setImage] = useState(null);

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign up first');
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setImage(file);
    } else {
      toast.error('File size should be less than 10MB');
    }
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      bcategory: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation check
    if (!formData['buisness-name'] || !formData['buisness-des'] || !formData.bphone || !formData.bcategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const submitData = new FormData();
      submitData.append('name', formData['buisness-name']);
      submitData.append('description', formData['buisness-des']);
      submitData.append('number', formData.bphone);
      submitData.append('category', formData.bcategory);
      if (image) {
        submitData.append('image', image);
      }

      // Debug log of data being sent
      console.log('Submitting data:', {
        name: formData['buisness-name'],
        description: formData['buisness-des'],
        number: formData.bphone,
        category: formData.bcategory,
        hasImage: !!image
      });

      const response = await axios.post('https://api.automation365.io/auth/buisness', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Debug log of response
      console.log('Response:', response.data);

      if (response.data === "done") {
        toast.success('Business details saved successfully');
        navigate('/Onboarding2');
      }
    } catch (error) {
      // Debug log of error
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      const errorMessage = error.response?.data?.error || 'Failed to save business details';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Section with gray background */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col">
        <div className="p-6">
          <div className="font-bold text-xl">BOTMON</div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-8">
            <img 
              src="/api/placeholder/500/500"
              alt="Business Setup"
              className="w-full max-w-md"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Business Details</h1>
              <p className="text-gray-600">
                Set up your business profile to get started
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section with white background */}
      <div className="w-full md:w-1/2 bg-white flex flex-col">
        <div className="p-6 flex justify-between items-center md:justify-end">
          <div className="font-bold text-xl md:hidden">BOTMON</div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span>English</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Logo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Logo (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Upload a file</span>
                        <input 
                          type="file" 
                          className="sr-only" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <Input 
                  name="buisness-name"
                  value={formData['buisness-name']}
                  onChange={handleInputChange}
                  placeholder="Enter Business Name" 
                  className="w-full"
                  required
                />
              </div>

              {/* Business Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Phone Number
                </label>
                <Input 
                  name="bphone"
                  value={formData.bphone}
                  onChange={handleInputChange}
                  placeholder="+234" 
                  className="w-full"
                  required
                />
              </div>

              {/* Business Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Description
                </label>
                <Textarea 
                  name="buisness-des"
                  value={formData['buisness-des']}
                  onChange={handleInputChange}
                  placeholder="Describe your business..."
                  className="w-full min-h-[100px]"
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <Select onValueChange={handleCategoryChange} value={formData.bcategory} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freelancing">Freelancing</SelectItem>
                    <SelectItem value="clothing">Clothing and Accessories</SelectItem>
                    <SelectItem value="electronics">Electronics and Gadgets</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Continue Button */}
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding1;