import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, Loader, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  DialogTrigger,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditServicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceId = queryParams.get('id');
  
  // State for modals
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Main service state
  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    price: '',
    link: '',
    category: '',
    sub: '',
    status: 'published'
  });
  
  // Service image state
  const [serviceImage, setServiceImage] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState(null);
  
  // Variants state
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    price: ''
  });
  const [variantImage, setVariantImage] = useState(null);
  const [variantImagePreview, setVariantImagePreview] = useState(null);
  
  // Category state
  const [newCategory, setNewCategory] = useState({
    category: '',
    sub: ''
  });
  
  // Available categories and subcategories
  const [categories, setCategories] = useState([]);
  const [subs, setSubs] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch service data, categories, and variants on mount
  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
      fetchCategories();
    } else {
      toast.error("No service ID provided");
      navigate('/ProductPage');
    }
  }, [serviceId]);

  // Fetch service data
  const fetchServiceData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/get-services',
        { id: serviceId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const service = response.data;
      if (!service || Object.keys(service).length === 0) {
        toast.error('Service not found');
        navigate('/ProductPage');
        return;
      }

      // Set service data
      setServiceData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        link: service.link || '',
        category: service.category || '',
        sub: service.sub || '',
        status: service.status !== false ? 'published' : 'draft'
      });

      // Set image preview if available
      if (service.image) {
        setServiceImagePreview(`data:image/jpeg;base64,${service.image}`);
      }

      // Set variants if available
      if (service.vname && Array.isArray(service.vname)) {
        const loadedVariants = service.vname.map((name, index) => ({
          name,
          price: service.vprice?.[index] || '',
          vimage: service.vimage?.[index] || null
        }));
        setVariants(loadedVariants);
      }

    } catch (error) {
      console.error('Error fetching service data:', error);
      toast.error('Failed to load service data');
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch categories and subcategories
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.get('https://api.automation365.io/add-services', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.categories) {
        setCategories(response.data.categories);
      }
      if (response.data.subs) {
        setSubs(response.data.subs);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
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

  // Handle service image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 3 * 1024 * 1024) { // 3MB limit
      setServiceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Image size should be less than 3MB');
    }
  };

  // Handle variant image upload
  const handleVariantImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 3 * 1024 * 1024) { // 3MB limit
      setVariantImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariantImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Image size should be less than 3MB');
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

  // Add a new variant
  const handleAddVariant = async () => {
    // Validate variant data
    if (!currentVariant.name || !currentVariant.price || !variantImage) {
      toast.error('Please fill in all required variant fields and upload an image');
      return;
    }

    setIsAddingVariant(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('vname', currentVariant.name);
      formData.append('vprice', currentVariant.price);
      
      if (variantImage) {
        formData.append('vimage', variantImage);
      }

      // Submit the variant to the backend
      const response = await axios.post(
        'https://api.automation365.io/svarian',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data === "done") {
        // Add to local state with the preview image
        const newVariant = {
          ...currentVariant,
          vimage: variantImagePreview
        };
        
        setVariants(prev => [...prev, newVariant]);
        
        // Reset the form
        setCurrentVariant({
          name: '',
          price: ''
        });
        setVariantImage(null);
        setVariantImagePreview(null);
        
        // Close the modal
        setShowVariantModal(false);
        toast.success('Variant added successfully');
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      toast.error('Failed to add variant');
    } finally {
      setIsAddingVariant(false);
    }
  };

  // Handle variant deletion
  const handleDeleteVariant = async (index) => {
    setIsDeleting(true);
    try {
      // Here you would typically call an API to delete the variant
      // For now, we'll just update the local state
      setVariants(prev => prev.filter((_, i) => i !== index));
      toast.success('Variant removed');
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    } finally {
      setIsDeleting(false);
    }
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

      if (response.data === "done") {
        // Update local categories and subs lists
        if (newCategory.category && !categories.includes(newCategory.category)) {
          setCategories(prev => [...prev, newCategory.category]);
        }
        if (newCategory.sub && !subs.includes(newCategory.sub)) {
          setSubs(prev => [...prev, newCategory.sub]);
        }

        // Reset the form
        setNewCategory({
          category: '',
          sub: ''
        });
        
        // Close the modal
        setShowCategoryModal(false);
        toast.success('Category added successfully');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Submit form to update the service
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!serviceData.name || !serviceData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // Create form data
      const formData = new FormData();
      
      // Add service ID
      formData.append('id', serviceId);
      
      // Add service details
      Object.entries(serviceData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add service image if a new one was selected
      if (serviceImage) {
        formData.append('image', serviceImage);
      }
      
      // Add variants data
      variants.forEach((variant, index) => {
        formData.append(`vname[${index}]`, variant.name);
        formData.append(`vprice[${index}]`, variant.price);
      });

      // Submit the service update
      const response = await axios.post(
        'https://api.automation365.io/edit-service',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.message === "service updated successfully") {
        toast.success('Service updated successfully');
        navigate('/ProductPage');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    navigate('/ProductPage'); // Navigate back to the product page
  };

  if (isFetching) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Edit Service" />
          <div className="flex-1 flex items-center justify-center">
            <Loader className="w-10 h-10 animate-spin text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Edit Service" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/ProductPage">
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Edit Service
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
                  ) : (
                    'Save Changes'
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
                        Edit the basic information for your service
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="name">Service Name</Label>
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
                          <Label htmlFor="price">Service Price</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* Variations Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Variations</CardTitle>
                      <CardDescription>
                        Manage different options for your service
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variants.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan="4" className="py-4 text-center text-gray-500">
                                No variants added yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            variants.map((variant, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {variant.vimage ? (
                                    <img
                                      src={typeof variant.vimage === 'string' && variant.vimage.startsWith('data:') ? 
                                        variant.vimage : 
                                        `data:image/jpeg;base64,${variant.vimage}`}
                                      alt={variant.name}
                                      className="w-12 h-12 object-cover rounded-md"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md">
                                      <span className="text-xs text-gray-400">No image</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="font-semibold">{variant.name}</TableCell>
                                <TableCell>${parseFloat(variant.price).toFixed(2)}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem>Edit</DropdownMenuItem>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            Delete
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will remove the variant from your service.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => handleDeleteVariant(index)}
                                              className="bg-red-600 text-white hover:bg-red-700"
                                              disabled={isDeleting}
                                            >
                                              {isDeleting ? 'Deleting...' : 'Delete'}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
                                <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                              ) : categories.length === 0 ? (
                                <SelectItem value="no_categories" disabled>No categories available</SelectItem>
                              ) : (
                                categories.map((cat, idx) => {
                                  // Check if this category is a duplicate (based on previous items)
                                  const value = cat && cat.trim() !== '' ? 
                                    (categories.indexOf(cat) === idx ? cat : `${cat}_${idx}`) : 
                                    `category_${idx}`;
                                  
                                  return (
                                    <SelectItem key={`cat_${idx}`} value={value}>
                                      {cat || `Category ${idx + 1}`}
                                    </SelectItem>
                                  );
                                })
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
                                <SelectItem value="loading_subs" disabled>Loading subcategories...</SelectItem>
                              ) : subs.length === 0 ? (
                                <SelectItem value="no_subcategories" disabled>No subcategories available</SelectItem>
                              ) : (
                                subs.map((sub, idx) => {
                                  // Check if this subcategory is a duplicate
                                  const value = sub && sub.trim() !== '' ? 
                                    (subs.indexOf(sub) === idx ? sub : `${sub}_${idx}`) : 
                                    `subcategory_${idx}`;
                                  
                                  return (
                                    <SelectItem key={`sub_${idx}`} value={value}>
                                      {sub || `Subcategory ${idx + 1}`}
                                    </SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
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
                          value={serviceData.status}
                          onValueChange={(value) => handleSelectChange('status', value)}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Image Upload Section */}
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>Service Image</CardTitle>
                      <CardDescription>
                        Update the image for your service
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {serviceImagePreview ? (
                        <div className="relative">
                          <img
                            src={serviceImagePreview}
                            alt="Service preview"
                            className="aspect-square w-full rounded-md object-cover"
                            height="300"
                            width="300"
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
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 3MB</p>
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
                  {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Variant Modal */}
      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Variant Name</Label>
              <Input
                id="name"
                name="name"
                value={currentVariant.name}
                onChange={handleVariantInputChange}
                placeholder="e.g. Basic Package"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={currentVariant.price}
                onChange={handleVariantInputChange}
                placeholder="e.g. 99.99"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Variant Image</Label>
              {variantImagePreview ? (
                <div className="relative mt-1">
                  <img
                    src={variantImagePreview}
                    alt="Variant preview"
                    className="w-full h-40 object-cover rounded-md"
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
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 3MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleAddVariant}
              disabled={isAddingVariant}
              className="bg-purple-600 text-white"
            >
              {isAddingVariant ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Variant'
              )}
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
              <Label htmlFor="category">Category Name</Label>
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
          <div className="flex justify-end">
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
    </div>
  );
};

export default EditServicePage;