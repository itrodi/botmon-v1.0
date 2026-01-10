import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, Loader, ChevronLeft, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const AddServicesPage = () => {
  const navigate = useNavigate();
  
  // State for modals
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditSubModal, setShowEditSubModal] = useState(false);
  
  // Main service state - matching backend exactly
  // statusOption: 'active' | 'inactive' | 'draft'
  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    price: '',
    link: '',
    category: '',
    sub: '',
    statusOption: 'active', // 'active', 'inactive', or 'draft'
    payment: true // Backend field
  });
  
  // Service image state
  const [serviceImage, setServiceImage] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState(null);
  
  // Variants state - arrays to match backend getlist expectation
  const [variants, setVariants] = useState({
    vname: [],
    vprice: [],
    vimages: [] // Store actual file objects
  });
  
  // Current variant being added
  const [currentVariant, setCurrentVariant] = useState({
    vname: '', // Backend uses vname
    vprice: '' // Backend uses vprice
  });
  const [variantImage, setVariantImage] = useState(null);
  const [variantImagePreview, setVariantImagePreview] = useState(null);
  
  // Category state
  const [newCategory, setNewCategory] = useState({
    category: '',
    sub: ''
  });
  
  // Edit category/sub state
  const [editingCategory, setEditingCategory] = useState({
    id: '',
    name: ''
  });
  
  const [editingSub, setEditingSub] = useState({
    id: '',
    name: ''
  });
  
  // Available categories and subcategories with IDs
  const [categories, setCategories] = useState([]);
  const [subs, setSubs] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingSub, setIsEditingSub] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories and subcategories
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.get('https://api.automation365.io/add-services', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Categories response:', response.data);

      // Parse categories with IDs and filter out empty ones
      if (response.data.categories) {
        const categoriesData = response.data.categories;
        let validCategories = [];
        
        if (Array.isArray(categoriesData)) {
          // Filter out items with empty names or invalid data
          validCategories = categoriesData.filter(cat => 
            cat && cat.id && cat.name && cat.name.trim() !== ''
          );
        } else if (typeof categoriesData === 'object') {
          // Convert object to array and filter
          validCategories = Object.keys(categoriesData)
            .map(key => {
              const cat = categoriesData[key];
              if (cat && typeof cat === 'object' && cat.id && cat.name && cat.name.trim() !== '') {
                return cat;
              }
              return null;
            })
            .filter(Boolean);
        }
        
        console.log('Parsed categories:', validCategories);
        setCategories(validCategories);
      }
      
      // Parse subcategories with IDs and filter out empty ones
      if (response.data.subs) {
        const subsData = response.data.subs;
        let validSubs = [];
        
        if (Array.isArray(subsData)) {
          // Filter out items with empty names or invalid data
          validSubs = subsData.filter(sub => 
            sub && sub.id && sub.name && sub.name.trim() !== ''
          );
        } else if (typeof subsData === 'object') {
          // Convert object to array and filter
          validSubs = Object.keys(subsData)
            .map(key => {
              const sub = subsData[key];
              if (sub && typeof sub === 'object' && sub.id && sub.name && sub.name.trim() !== '') {
                return sub;
              }
              return null;
            })
            .filter(Boolean);
        }
        
        console.log('Parsed subs:', validSubs);
        setSubs(validSubs);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to load categories');
      }
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Handle input changes for main service
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes for main service
  const handleSelectChange = (name, value) => {
    setServiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle status change - now handles 'active', 'inactive', 'draft'
  const handleStatusChange = (value) => {
    setServiceData(prev => ({
      ...prev,
      statusOption: value
    }));
  };

  // Helper function to get status and draft values for backend
  const getStatusAndDraft = (statusOption) => {
    switch (statusOption) {
      case 'active':
        return { status: true, draft: false };
      case 'inactive':
        return { status: false, draft: false };
      case 'draft':
        return { status: false, draft: true };
      default:
        return { status: true, draft: false };
    }
  };

  // Validate image file
  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB to match backend

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

  // Handle service image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setServiceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle variant image upload
  const handleVariantImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setVariantImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariantImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle variant input changes
  const handleVariantInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVariant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle category input changes
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new variant (locally, will be sent with service)
  const handleAddVariant = () => {
    // Validate variant data
    if (!currentVariant.vname || !currentVariant.vprice) {
      toast.error('Please fill in name and price for the variant');
      return;
    }

    // Add to variants arrays
    setVariants(prev => ({
      vname: [...prev.vname, currentVariant.vname],
      vprice: [...prev.vprice, currentVariant.vprice],
      vimages: [...prev.vimages, variantImage] // Store the actual file (can be null)
    }));
    
    // Reset the form
    setCurrentVariant({
      vname: '',
      vprice: ''
    });
    setVariantImage(null);
    setVariantImagePreview(null);
    
    // Close the modal
    setShowVariantModal(false);
    toast.success('Variant added successfully');
  };

  // Remove variant
  const removeVariant = (index) => {
    setVariants(prev => ({
      vname: prev.vname.filter((_, i) => i !== index),
      vprice: prev.vprice.filter((_, i) => i !== index),
      vimages: prev.vimages.filter((_, i) => i !== index)
    }));
  };

  // Add a new category
  const handleAddCategory = async () => {
    // Validate category data
    if (!newCategory.category) {
      toast.error('Please provide a category name');
      return;
    }

    setIsAddingCategory(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/sadd-category',
        newCategory,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Category and subcategory added") {
        // Reset the form
        setNewCategory({
          category: '',
          sub: ''
        });
        
        // Close the modal
        setShowCategoryModal(false);
        toast.success('Category added successfully');
        
        // Refresh categories to ensure consistency
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to add category');
      }
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Edit category
  const handleEditCategory = async () => {
    if (!editingCategory.name) {
      toast.error('Please provide a category name');
      return;
    }

    setIsEditingCategory(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/service/edit-category',
        {
          cat_id: editingCategory.id,
          category: editingCategory.name
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Category updated successfully") {
        toast.success('Category updated successfully');
        setShowEditCategoryModal(false);
        setEditingCategory({ id: '', name: '' });
        
        // Update local state
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: editingCategory.name }
            : cat
        ));
        
        // Refresh categories
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error editing category:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Category not found');
      } else {
        toast.error('Failed to update category');
      }
    } finally {
      setIsEditingCategory(false);
    }
  };

  // Edit subcategory
  const handleEditSub = async () => {
    if (!editingSub.name) {
      toast.error('Please provide a subcategory name');
      return;
    }

    setIsEditingSub(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/service/edit-sub',
        {
          sub_id: editingSub.id,
          sub: editingSub.name
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Sub updated successfully") {
        toast.success('Subcategory updated successfully');
        setShowEditSubModal(false);
        setEditingSub({ id: '', name: '' });
        
        // Update local state
        setSubs(prev => prev.map(sub => 
          sub.id === editingSub.id 
            ? { ...sub, name: editingSub.name }
            : sub
        ));
        
        // Refresh categories
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error editing subcategory:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Subcategory not found');
      } else {
        toast.error('Failed to update subcategory');
      }
    } finally {
      setIsEditingSub(false);
    }
  };

  // Open edit category modal
  const openEditCategoryModal = (category) => {
    setEditingCategory({
      id: category.id,
      name: category.name
    });
    setShowEditCategoryModal(true);
  };

  // Open edit sub modal
  const openEditSubModal = (sub) => {
    setEditingSub({
      id: sub.id,
      name: sub.name
    });
    setShowEditSubModal(true);
  };

  // Submit the form to add a service
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!serviceData.name || !serviceData.price || !serviceImage) {
      toast.error('Please fill in all required fields and upload an image');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Get status and draft values based on statusOption
      const { status, draft } = getStatusAndDraft(serviceData.statusOption);

      // Create form data exactly as backend expects
      const formData = new FormData();
      
      // Add service details
      formData.append('name', serviceData.name);
      formData.append('description', serviceData.description);
      formData.append('price', serviceData.price);
      formData.append('link', serviceData.link || '');
      formData.append('category', serviceData.category || '');
      formData.append('sub', serviceData.sub || '');
      formData.append('status', status.toString());
      formData.append('draft', draft.toString());
      formData.append('payment', serviceData.payment.toString());
      
      // Add service image
      formData.append('image', serviceImage);
      
      // Add variants data as arrays (backend uses getlist())
      variants.vname.forEach(name => formData.append('vname', name));
      variants.vprice.forEach(price => formData.append('vprice', price));
      
      // Add variant images
      variants.vimages.forEach(image => {
        if (image) {
          formData.append('vimage', image);
        }
      });

      console.log('Submitting service with:', {
        statusOption: serviceData.statusOption,
        status,
        draft,
        variantCount: variants.vname.length,
        hasServiceImage: !!serviceImage,
        variantImageCount: variants.vimages.filter(img => img).length
      });

      // Submit the service to correct endpoint
      const response = await axios.post(
        'https://api.automation365.io/supload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.message === "done") {
        const successMessage = serviceData.statusOption === 'draft' 
          ? 'Service saved as draft' 
          : 'Service added successfully';
        toast.success(successMessage);
        navigate('/ProductPage?tab=services'); // Navigate back to products page
      }
    } catch (error) {
      console.error('Error uploading service:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Failed to add service');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    navigate('/ProductPage?tab=services'); // Navigate back to products page
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Add Service" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/products">
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Add Service
              </h1>
              
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-purple-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : serviceData.statusOption === 'draft' ? (
                    'Save as Draft'
                  ) : (
                    'Save Service'
                  )}
                </Button>
              </div>
            </div>
            
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Details</CardTitle>
                      <CardDescription>
                        Enter the basic information for your service
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="name">Service Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={serviceData.name}
                            onChange={handleInputChange}
                            placeholder="Enter service name"
                            className="w-full"
                            required
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="description">Service Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={serviceData.description}
                            onChange={handleInputChange}
                            placeholder="Enter service description"
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="price">Service Price *</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={serviceData.price}
                            onChange={handleInputChange}
                            placeholder="Enter price"
                            className="w-full"
                            required
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="link">Service Link (Optional)</Label>
                          <Input
                            id="link"
                            name="link"
                            value={serviceData.link}
                            onChange={handleInputChange}
                            placeholder="Enter service link"
                            className="w-full"
                          />
                          <p className="text-sm text-gray-500">
                            Add a link if this service has additional resources or information
                          </p>
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="payment">Payment Required</Label>
                          <Select
                            value={serviceData.payment.toString()}
                            onValueChange={(value) => handleSelectChange('payment', value === 'true')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes, payment required</SelectItem>
                              <SelectItem value="false">No, free service</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Variations Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Variations (Optional)</CardTitle>
                      <CardDescription>
                        Add different options for your service
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variants.vname.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan="4" className="py-4 text-center text-gray-500">
                                No variants added yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            variants.vname.map((name, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-semibold">{name}</TableCell>
                                <TableCell>${parseFloat(variants.vprice[index]).toFixed(2)}</TableCell>
                                <TableCell>
                                  {variants.vimages[index] ? (
                                    <span className="text-green-600 text-sm">✓ Image</span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">No image</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariant(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="justify-center border-t p-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => setShowVariantModal(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Variant
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Category Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Category</CardTitle>
                      <CardDescription>
                        Categorize your service for better organization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="grid gap-3">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={serviceData.category}
                            onValueChange={(value) => handleSelectChange('category', value)}
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingCategories ? (
                                <SelectItem value="_loading" disabled>Loading categories...</SelectItem>
                              ) : categories.length === 0 ? (
                                <SelectItem value="_no_categories" disabled>No categories available</SelectItem>
                              ) : (
                                categories.map((cat) => {
                                  // Double-check validity before rendering
                                  if (!cat || !cat.id || !cat.name || cat.name.trim() === '') {
                                    return null;
                                  }
                                  return (
                                    <SelectItem key={cat.id} value={cat.name}>
                                      {cat.name}
                                    </SelectItem>
                                  );
                                }).filter(Boolean)
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="sub">Subcategory (optional)</Label>
                          <Select
                            value={serviceData.sub}
                            onValueChange={(value) => handleSelectChange('sub', value)}
                          >
                            <SelectTrigger id="sub">
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingCategories ? (
                                <SelectItem value="_loading_subs" disabled>Loading subcategories...</SelectItem>
                              ) : subs.length === 0 ? (
                                <SelectItem value="_no_subcategories" disabled>No subcategories available</SelectItem>
                              ) : (
                                subs.map((sub) => {
                                  // Double-check validity before rendering
                                  if (!sub || !sub.id || !sub.name || sub.name.trim() === '') {
                                    return null;
                                  }
                                  return (
                                    <SelectItem key={sub.id} value={sub.name}>
                                      {sub.name}
                                    </SelectItem>
                                  );
                                }).filter(Boolean)
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => setShowCategoryModal(true)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add New Category
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => setShowManageCategoriesModal(true)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Manage Categories
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                  {/* Status Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Status</CardTitle>
                      <CardDescription>
                        Control the visibility of your service
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={serviceData.statusOption}
                          onValueChange={handleStatusChange}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                          {serviceData.statusOption === 'active' && 'Active services will be visible in your store'}
                          {serviceData.statusOption === 'inactive' && 'Inactive services will be hidden from your store'}
                          {serviceData.statusOption === 'draft' && 'Draft services are saved but not published yet'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Image Upload Section */}
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>Service Image *</CardTitle>
                      <CardDescription>
                        Upload an image for your service
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {serviceImagePreview ? (
                        <div className="relative">
                          <img
                            src={serviceImagePreview}
                            alt="Service preview"
                            className="aspect-square w-full rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 bg-white rounded-full p-1"
                            onClick={() => {
                              setServiceImage(null);
                              setServiceImagePreview(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <div className="mx-auto w-12 h-12 mb-4">
                            <Upload className="w-12 h-12 text-gray-400" />
                          </div>
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                className="sr-only"
                                onChange={handleImageUpload}
                                accept="image/*"
                                required
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF, WebP up to 10MB</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex items-center justify-center gap-2 md:hidden">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
                <Button 
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-purple-600 text-white"
                >
                  {isLoading 
                    ? 'Saving...' 
                    : serviceData.statusOption === 'draft' 
                      ? 'Save as Draft' 
                      : 'Save Service'
                  }
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Variant Modal */}
      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Service Variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="vname">Variant Name *</Label>
              <Input
                id="vname"
                name="vname"
                value={currentVariant.vname}
                onChange={handleVariantInputChange}
                placeholder="e.g. Basic Package"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="vprice">Price *</Label>
              <Input
                id="vprice"
                name="vprice"
                type="number"
                step="0.01"
                value={currentVariant.vprice}
                onChange={handleVariantInputChange}
                placeholder="e.g. 99.99"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Variant Image (Optional)</Label>
              {variantImagePreview ? (
                <div className="relative mt-1">
                  <img
                    src={variantImagePreview}
                    alt="Variant preview"
                    className="w-full h-40 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white rounded-full p-1"
                    onClick={() => {
                      setVariantImage(null);
                      setVariantImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleVariantImageUpload}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVariantModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddVariant}
              className="bg-purple-600 text-white"
            >
              Add Variant
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="category">Category Name *</Label>
              <Input
                id="category"
                name="category"
                value={newCategory.category}
                onChange={handleCategoryInputChange}
                placeholder="e.g. Hair Services"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="sub">Subcategory Name (Optional)</Label>
              <Input
                id="sub"
                name="sub"
                value={newCategory.sub}
                onChange={handleCategoryInputChange}
                placeholder="e.g. Coloring"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddCategory}
              disabled={isAddingCategory}
              className="bg-purple-600 text-white"
            >
              {isAddingCategory ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Category'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Modal */}
      <Dialog open={showManageCategoriesModal} onOpenChange={setShowManageCategoriesModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="2" className="text-center text-gray-500">
                        No categories available
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditCategoryModal(category)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="subcategories" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subcategory Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="2" className="text-center text-gray-500">
                        No subcategories available
                      </TableCell>
                    </TableRow>
                  ) : (
                    subs.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditSubModal(sub)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManageCategoriesModal(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={showEditCategoryModal} onOpenChange={setShowEditCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-category">Category Name *</Label>
              <Input
                id="edit-category"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                className="mt-1"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditCategoryModal(false);
                setEditingCategory({ id: '', name: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditCategory}
              disabled={isEditingCategory}
              className="bg-purple-600 text-white"
            >
              {isEditingCategory ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Category'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Modal */}
      <Dialog open={showEditSubModal} onOpenChange={setShowEditSubModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-sub">Subcategory Name *</Label>
              <Input
                id="edit-sub"
                value={editingSub.name}
                onChange={(e) => setEditingSub(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter subcategory name"
                className="mt-1"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditSubModal(false);
                setEditingSub({ id: '', name: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditSub}
              disabled={isEditingSub}
              className="bg-purple-600 text-white"
            >
              {isEditingSub ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Subcategory'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddServicesPage;