import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Upload, X, User } from 'lucide-react';
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
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign up first');
      navigate('/');
    }
  }, [navigate]);

  // Generate initials for preview when business name changes
  const generateInitials = (name) => {
    if (!name) return '';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File size should be less than 10MB');
      return false;
    }

    return true;
  };

  const handleImageChange = (file) => {
    if (file && validateImage(file)) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
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

      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('name', formData['buisness-name']);
      submitData.append('description', formData['buisness-des']);
      submitData.append('number', formData.bphone);
      submitData.append('category', formData.bcategory);
      
      // Only append image if one was selected
      // Backend will generate initials image if no image is provided
      if (image) {
        submitData.append('image', image);
      }

      // Debug log of data being sent
      console.log('Submitting business data:', {
        name: formData['buisness-name'],
        description: formData['buisness-des'],
        number: formData.bphone,
        category: formData.bcategory,
        hasCustomImage: !!image,
        imageSize: image ? `${(image.size / 1024 / 1024).toFixed(2)}MB` : 'Will generate initials'
      });

      const response = await axios.post('https://api.automation365.io/auth/buisness', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Backend response:', response.data);

      if (response.data === "done") {
        toast.success(image ? 
          'Business details and logo saved successfully!' : 
          'Business details saved! Logo created with your initials.'
        );
        navigate('/Onboarding2');
      }
    } catch (error) {
      console.error('Error submitting business details:', {
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
                Set up your business profile to get started. If you don't upload a logo, 
                we'll create one with your business initials.
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
                
                {/* Image Preview or Upload Area */}
                {imagePreview ? (
                  <div className="relative">
                    <div className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                      <img 
                        src={imagePreview} 
                        alt="Logo preview" 
                        className="max-h-32 max-w-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Custom logo will be uploaded
                    </p>
                  </div>
                ) : (
                  <div 
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                      dragActive 
                        ? 'border-purple-400 bg-purple-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-2 text-center">
                      <div className="flex justify-center">
                        {formData['buisness-name'] ? (
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-200">
                            <span className="text-purple-600 font-bold text-lg">
                              {generateInitials(formData['buisness-name'])}
                            </span>
                          </div>
                        ) : (
                          <Upload className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept="image/*"
                            onChange={handleFileInputChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                      {formData['buisness-name'] && (
                        <p className="text-xs text-purple-600 font-medium">
                          No logo? We'll create one with "{generateInitials(formData['buisness-name'])}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Name *
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
                  Business Phone Number *
                </label>
                <Input 
                  name="bphone"
                  value={formData.bphone}
                  onChange={handleInputChange}
                  placeholder="+234" 
                  className="w-full"
                  type="tel"
                  required
                />
              </div>

              {/* Business Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Description *
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
                  Category *
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