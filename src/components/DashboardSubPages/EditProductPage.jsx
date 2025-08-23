import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, Loader, Edit2, Settings } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const EditProductPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id'); // Get product ID from query params

  // State for modals
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  
  // Edit category form state
  const [editCategoryForm, setEditCategoryForm] = useState({
    cat_id: '',
    category: '',
    sub_id: '',
    sub: ''
  });
  
  // Main product state - matching backend exactly
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    weight: '',
    link: '',
    category: '',
    sub: '',
    status: 'active' // Backend expects string values
  });
  
  // Product image state
  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  
  // Variants state - arrays to match backend getlist expectation
  const [variants, setVariants] = useState({
    vname: [],
    vprice: [],
    vquantity: [],
    vsize: [],
    vcolor: [],
    vtype: [],
    vimages: [] // Store new variant images
  });
  
  // Existing variant images from backend
  const [existingVariantImages, setExistingVariantImages] = useState([]);
  
  // Current variant being added
  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    price: '',
    quantity: '',
    size: '',
    color: '',
    type: ''
  });
  const [variantImage, setVariantImage] = useState(null);
  const [variantImagePreview, setVariantImagePreview] = useState(null);
  
  // Category state
  const [newCategory, setNewCategory] = useState({
    category: '',
    sub: ''
  });
  
  // Available categories and subcategories - store full objects with IDs
  const [categories, setCategories] = useState([]);
  const [subs, setSubs] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Fetch product data and categories on mount
  useEffect(() => {
    if (productId) {
      fetchProductData();
    } else {
      toast.error("No product ID provided");
      navigate('/ProductPage?tab=products');
    }
    
    fetchCategories();
  }, [productId]);

  // Fetch product data
  const fetchProductData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/get-products',
        { id: productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const product = response.data;
      console.log('Fetched product:', product);

      if (!product || Object.keys(product).length === 0) {
        toast.error('Product not found');
        navigate('/ProductPage?tab=products');
        return;
      }

      // Set product data with backend field alignment
      setProductData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        quantity: product.quantity || '',
        weight: product.weight || '',
        link: product.link || '',
        category: product.category || '',
        sub: product.sub || '',
        status: product.status || 'active'
      });

      // Handle image preview (backend stores S3 URLs)
      if (product.image) {
        setProductImagePreview(product.image);
        setHasExistingImage(true);
      }

      // Set variants if available
      if (product.vname && Array.isArray(product.vname)) {
        setVariants({
          vname: product.vname || [],
          vprice: product.vprice || [],
          vquantity: product.vquantity || [],
          vsize: product.vsize || [],
          vcolor: product.vcolor || [],
          vtype: product.vtype || [],
          vimages: [] // No new images initially
        });
        
        // Store existing variant images separately
        if (product.vimage && Array.isArray(product.vimage)) {
          setExistingVariantImages(product.vimage);
        }
      }

    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error(error.response?.data?.error || 'Failed to load product data');
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

      const response = await axios.get('https://api.automation365.io/add-products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Categories response:', response.data);

      // Store full objects with IDs for editing
      if (response.data.categories && Array.isArray(response.data.categories)) {
        // Filter out duplicates based on name
        const uniqueCategories = response.data.categories.reduce((acc, cat) => {
          if (cat && cat.name && !acc.find(c => c.name === cat.name)) {
            acc.push(cat);
          }
          return acc;
        }, []);
        setCategories(uniqueCategories);
      }
      
      if (response.data.subs && Array.isArray(response.data.subs)) {
        // Filter out empty subcategories and duplicates
        const uniqueSubs = response.data.subs.reduce((acc, sub) => {
          if (sub && sub.name && !acc.find(s => s.name === sub.name)) {
            acc.push(sub);
          }
          return acc;
        }, []);
        setSubs(uniqueSubs);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      // Set empty arrays to prevent crashes
      setCategories([]);
      setSubs([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Handle edit category
  const handleEditCategory = async () => {
    if (!editCategoryForm.cat_id || !editCategoryForm.category) {
      toast.error('Please provide a new category name');
      return;
    }

    setIsEditingCategory(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/product/edit-category',
        {
          cat_id: editCategoryForm.cat_id,
          category: editCategoryForm.category
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Category updated successfully") {
        // Update local state
        setCategories(prev => prev.map(cat => 
          cat.id === editCategoryForm.cat_id 
            ? { ...cat, name: editCategoryForm.category }
            : cat
        ));
        
        // Update product data if it uses this category
        const oldCategory = categories.find(c => c.id === editCategoryForm.cat_id);
        if (oldCategory && productData.category === oldCategory.name) {
          setProductData(prev => ({
            ...prev,
            category: editCategoryForm.category
          }));
        }

        toast.success('Category updated successfully');
        setEditingCategory(null);
        setEditCategoryForm({
          cat_id: '',
          category: '',
          sub_id: '',
          sub: ''
        });
        
        // Refresh categories to ensure consistency
        fetchCategories();
      }
    } catch (error) {
      console.error('Error editing category:', error);
      toast.error(error.response?.data?.error || 'Failed to edit category');
    } finally {
      setIsEditingCategory(false);
    }
  };

  // Handle edit subcategory
  const handleEditSubcategory = async () => {
    if (!editCategoryForm.sub_id || !editCategoryForm.sub) {
      toast.error('Please provide a new subcategory name');
      return;
    }

    setIsEditingCategory(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/product/edit-sub',
        {
          sub_id: editCategoryForm.sub_id,
          sub: editCategoryForm.sub
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Sub updated successfully") {
        // Update local state
        setSubs(prev => prev.map(sub => 
          sub.id === editCategoryForm.sub_id 
            ? { ...sub, name: editCategoryForm.sub }
            : sub
        ));
        
        // Update product data if it uses this subcategory
        const oldSub = subs.find(s => s.id === editCategoryForm.sub_id);
        if (oldSub && productData.sub === oldSub.name) {
          setProductData(prev => ({
            ...prev,
            sub: editCategoryForm.sub
          }));
        }

        toast.success('Subcategory updated successfully');
        setEditingSubcategory(null);
        setEditCategoryForm({
          cat_id: '',
          category: '',
          sub_id: '',
          sub: ''
        });
        
        // Refresh categories to ensure consistency
        fetchCategories();
      }
    } catch (error) {
      console.error('Error editing subcategory:', error);
      toast.error(error.response?.data?.error || 'Failed to edit subcategory');
    } finally {
      setIsEditingCategory(false);
    }
  };

  // Handle input changes for main product
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes for main product
  const handleSelectChange = (name, value) => {
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Handle product image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result);
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

  // Add a new variant (locally, will be sent with product update)
  const handleAddVariant = () => {
    // Validate variant data
    if (!currentVariant.name || !currentVariant.price || !currentVariant.quantity) {
      toast.error('Please fill in name, price, and quantity for the variant');
      return;
    }

    // Add to variants arrays
    setVariants(prev => ({
      vname: [...prev.vname, currentVariant.name],
      vprice: [...prev.vprice, currentVariant.price],
      vquantity: [...prev.vquantity, currentVariant.quantity],
      vsize: [...prev.vsize, currentVariant.size || ''],
      vcolor: [...prev.vcolor, currentVariant.color || ''],
      vtype: [...prev.vtype, currentVariant.type || ''],
      vimages: [...prev.vimages, variantImage] // Store the actual file
    }));
    
    // Reset the form
    setCurrentVariant({
      name: '',
      price: '',
      quantity: '',
      size: '',
      color: '',
      type: ''
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
      vquantity: prev.vquantity.filter((_, i) => i !== index),
      vsize: prev.vsize.filter((_, i) => i !== index),
      vcolor: prev.vcolor.filter((_, i) => i !== index),
      vtype: prev.vtype.filter((_, i) => i !== index),
      vimages: prev.vimages.filter((_, i) => i !== index)
    }));
    
    // Also remove from existing images if applicable
    if (existingVariantImages[index]) {
      setExistingVariantImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Add a new category
  const handleAddCategory = async () => {
    // Validate category data
    if (!newCategory.category) {
      toast.error('Please provide a category name');
      return;
    }

    // Check for duplicate category
    if (categories.some(cat => cat.name === newCategory.category)) {
      toast.error('This category already exists');
      return;
    }

    // Check for duplicate subcategory if provided
    if (newCategory.sub && subs.some(sub => sub.name === newCategory.sub)) {
      toast.error('This subcategory already exists');
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
        'https://api.automation365.io/add-category',
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
        fetchCategories();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Submit form to update the product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!productData.name || !productData.price || !productData.quantity) {
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

      // Create form data exactly as backend expects
      const formData = new FormData();
      
      // Add product ID
      formData.append('id', productId);
      
      // Add product details
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('quantity', productData.quantity);
      formData.append('weight', productData.weight || '');
      formData.append('link', productData.link || '');
      formData.append('sub', productData.sub || '');
      formData.append('category', productData.category || '');
      formData.append('status', productData.status);
      
      // Add product image if a new one was selected
      if (productImage) {
        formData.append('image', productImage);
      }
      
      // Add variants data as arrays (backend uses getlist())
      variants.vname.forEach(name => formData.append('vname', name));
      variants.vprice.forEach(price => formData.append('vprice', price));
      variants.vquantity.forEach(quantity => formData.append('vquantity', quantity));
      variants.vsize.forEach(size => formData.append('vsize', size));
      variants.vcolor.forEach(color => formData.append('vcolor', color));
      variants.vtype.forEach(type => formData.append('vtype', type));
      
      // Add variant images (only new ones)
      variants.vimages.forEach(image => {
        if (image) {
          formData.append('vimage', image);
        }
      });

      console.log('Updating product:', {
        productId,
        productData,
        variantCount: variants.vname.length,
        hasNewImage: !!productImage,
        variantImageCount: variants.vimages.filter(img => img).length
      });

      // Submit the product update
      const response = await axios.post(
        'https://api.automation365.io/edit-product',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Update response:', response.data);

      if (response.data.message === "Product updated successfully") {
        toast.success('Product updated successfully');
        navigate('/ProductPage?tab=products');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.error || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/ProductPage?tab=products');
  };

  // If still fetching data, show loading spinner
  if (isFetching) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Edit Product" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading product data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Edit Product" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium">Product Information</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Select
                        value={productData.status}
                        onValueChange={(value) => handleSelectChange('status', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <Input 
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea 
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description" 
                    className="min-h-[100px]" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <Input 
                      name="price"
                      value={productData.price}
                      onChange={handleInputChange}
                      type="number" 
                      step="0.01"
                      placeholder="Enter price" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <Input 
                      name="quantity"
                      value={productData.quantity}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="Enter quantity" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (optional)
                    </label>
                    <Input 
                      name="weight"
                      value={productData.weight}
                      onChange={handleInputChange}
                      placeholder="Enter weight" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Link (optional)
                  </label>
                  <Input 
                    name="link"
                    value={productData.link}
                    onChange={handleInputChange}
                    placeholder="Add product link for digital products" 
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Add product link if the product is digital so users can access link when purchase is successful
                  </p>
                </div>
              </div>

              {/* Upload Photos */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Product Image</h3>
                
                {productImagePreview ? (
                  <div className="relative">
                    <img 
                      src={productImagePreview} 
                      alt="Product preview" 
                      className="w-full max-h-64 object-contain mb-4 border rounded" 
                      onError={(e) => {
                        console.log('Image failed to load:', productImagePreview);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-64 bg-gray-100 items-center justify-center border rounded mb-4">
                      <span className="text-gray-500">Image not found</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-white rounded-full p-1"
                      onClick={() => {
                        setProductImage(null);
                        setProductImagePreview(null);
                        setHasExistingImage(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {productImage && (
                      <p className="text-xs text-green-600">New image selected - will be uploaded when you save</p>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="mx-auto w-12 h-12 mb-4">
                      <Upload className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Upload Product Image</span>
                        <input 
                          type="file" 
                          className="sr-only" 
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Category Section */}
              <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-medium">Product Category</h3>
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setShowManageCategoriesModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" /> Manage Categories
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setShowCategoryModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Category
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <Select
                      value={productData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="_loading" disabled>Loading categories...</SelectItem>
                        ) : categories.length === 0 ? (
                          <SelectItem value="_empty" disabled>No categories available</SelectItem>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory (optional)
                    </label>
                    <Select
                      value={productData.sub}
                      onValueChange={(value) => handleSelectChange('sub', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="_loading" disabled>Loading subcategories...</SelectItem>
                        ) : subs.length === 0 ? (
                          <SelectItem value="_empty" disabled>No subcategories available</SelectItem>
                        ) : (
                          subs.map((sub) => (
                            <SelectItem key={sub.id} value={sub.name}>
                              {sub.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Variations Section */}
              <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-medium">Product Variations (Optional)</h3>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowVariantModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Variant
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Price</th>
                        <th className="text-left py-2">Quantity</th>
                        <th className="text-left py-2">Size</th>
                        <th className="text-left py-2">Color</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Image</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.vname.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-4 text-center text-gray-500">
                            No variants added yet
                          </td>
                        </tr>
                      ) : (
                        variants.vname.map((name, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{name}</td>
                            <td className="py-2">{variants.vprice[index]}</td>
                            <td className="py-2">{variants.vquantity[index]}</td>
                            <td className="py-2">{variants.vsize[index] || '-'}</td>
                            <td className="py-2">{variants.vcolor[index] || '-'}</td>
                            <td className="py-2">{variants.vtype[index] || '-'}</td>
                            <td className="py-2">
                              {variants.vimages[index] ? (
                                <span className="text-green-600 text-sm">✓ New</span>
                              ) : existingVariantImages[index] ? (
                                <span className="text-blue-600 text-sm">✓ Existing</span>
                              ) : (
                                <span className="text-gray-400 text-sm">No image</span>
                              )}
                            </td>
                            <td className="py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVariant(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Updating Product...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Manage Categories Modal */}
      <Dialog open={showManageCategoriesModal} onOpenChange={setShowManageCategoriesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="categories" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
            </TabsList>
            <TabsContent value="categories" className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No categories available</p>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      {editingCategory === category.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editCategoryForm.category}
                            onChange={(e) => setEditCategoryForm(prev => ({
                              ...prev,
                              category: e.target.value
                            }))}
                            placeholder="New category name"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            onClick={handleEditCategory}
                            disabled={isEditingCategory}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(null);
                              setEditCategoryForm({
                                cat_id: '',
                                category: '',
                                sub_id: '',
                                sub: ''
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{category.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingCategory(category.id);
                              setEditCategoryForm({
                                cat_id: category.id,
                                category: category.name,
                                sub_id: '',
                                sub: ''
                              });
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="subcategories" className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {subs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No subcategories available</p>
                ) : (
                  subs.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      {editingSubcategory === sub.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editCategoryForm.sub}
                            onChange={(e) => setEditCategoryForm(prev => ({
                              ...prev,
                              sub: e.target.value
                            }))}
                            placeholder="New subcategory name"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            onClick={handleEditSubcategory}
                            disabled={isEditingCategory}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSubcategory(null);
                              setEditCategoryForm({
                                cat_id: '',
                                category: '',
                                sub_id: '',
                                sub: ''
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{sub.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingSubcategory(sub.id);
                              setEditCategoryForm({
                                cat_id: '',
                                category: '',
                                sub_id: sub.id,
                                sub: sub.name
                              });
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Variant Modal */}
      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product Variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input 
                name="name" 
                value={currentVariant.name}
                onChange={handleVariantInputChange}
                placeholder="e.g., Large Size"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <Input 
                  name="price" 
                  type="number" 
                  step="0.01"
                  value={currentVariant.price}
                  onChange={handleVariantInputChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <Input 
                  name="quantity" 
                  type="number" 
                  value={currentVariant.quantity}
                  onChange={handleVariantInputChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <Input 
                  name="size" 
                  value={currentVariant.size}
                  onChange={handleVariantInputChange}
                  placeholder="e.g., XL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Input 
                  name="type" 
                  value={currentVariant.type}
                  onChange={handleVariantInputChange}
                  placeholder="e.g., Cotton"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <Input 
                name="color" 
                value={currentVariant.color}
                onChange={handleVariantInputChange}
                placeholder="e.g., Red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variant Image</label>
              {variantImagePreview ? (
                <div className="relative">
                  <img 
                    src={variantImagePreview} 
                    alt="Variant preview" 
                    className="w-full h-32 object-cover rounded border" 
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-1 right-1 bg-white rounded-full p-1"
                    onClick={() => {
                      setVariantImage(null);
                      setVariantImagePreview(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Upload image</span>
                        <input 
                          type="file" 
                          className="sr-only" 
                          onChange={handleVariantImageUpload}
                          accept="image/*"
                        />
                      </label>
                    </div>
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
              className="bg-purple-600 text-white"
              onClick={handleAddVariant}
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
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input 
                name="category"
                value={newCategory.category}
                onChange={handleCategoryInputChange}
                placeholder="Enter category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory Name (optional)
              </label>
              <Input 
                name="sub"
                value={newCategory.sub}
                onChange={handleCategoryInputChange}
                placeholder="Enter subcategory name"
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
              className="bg-purple-600 text-white"
              onClick={handleAddCategory}
              disabled={isAddingCategory}
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

export default EditProductPage;