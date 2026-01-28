import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, Edit2, Settings, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const AddProductPage = () => {
  const navigate = useNavigate();
  
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
  // statusOption: 'active' | 'inactive' | 'draft'
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    weight: '',
    link: '',
    category: '',
    sub: '',
    statusOption: 'active' // 'active', 'inactive', or 'draft'
  });
  
  // Product image state
  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  
  // Variants state - arrays to match backend getlist expectation
  const [variants, setVariants] = useState({
    vname: [],
    vprice: [],
    vquantity: [],
    vsize: [],
    vcolor: [],
    vtype: [],
    vimages: [] // Store actual file objects
  });
  
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
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);

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

      const response = await fetch('https://api.automation365.io/add-products', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Categories response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      console.log('Categories response:', data);

      // Store full objects with IDs for editing
      if (data.categories && Array.isArray(data.categories)) {
        // Filter out duplicates based on name
        const uniqueCategories = data.categories.reduce((acc, cat) => {
          if (cat && cat.name && !acc.find(c => c.name === cat.name)) {
            acc.push(cat);
          }
          return acc;
        }, []);
        setCategories(uniqueCategories);
      }
      
      if (data.subs && Array.isArray(data.subs)) {
        // Filter out empty subcategories and duplicates
        const uniqueSubs = data.subs.reduce((acc, sub) => {
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
        navigate('/login');
        return;
      }

      const response = await fetch(
        'https://api.automation365.io/product/edit-category',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cat_id: editCategoryForm.cat_id,
            category: editCategoryForm.category
          })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to edit category');
      }

      const result = await response.json();

      if (result.message === "Category updated successfully") {
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
      toast.error(error.message || 'Failed to edit category');
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
        navigate('/login');
        return;
      }

      const response = await fetch(
        'https://api.automation365.io/product/edit-sub',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sub_id: editCategoryForm.sub_id,
            sub: editCategoryForm.sub
          })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to edit subcategory');
      }

      const result = await response.json();

      if (result.message === "Sub updated successfully") {
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
      toast.error(error.message || 'Failed to edit subcategory');
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

  // Handle status change - now handles 'active', 'inactive', 'draft'
  const handleStatusChange = (value) => {
    setProductData(prev => ({
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

  // Add a new variant (locally, not to backend yet)
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
        navigate('/login');
        return;
      }

      const response = await fetch(
        'https://api.automation365.io/add-category',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCategory)
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error('Failed to add category');
      }

      const result = await response.json();

      if (result.message === "Category and subcategory added") {
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

  // Handle discard - navigate back to products page
  const handleDiscard = () => {
    navigate('/ProductPage?tab=products');
  };

  // Submit the form to add a product
  const handleSubmit = async () => {
    const isDraftMode = productData.statusOption === 'draft';
    
    // Different validation for draft vs publish
    if (isDraftMode) {
      // For drafts, only name is required
      if (!productData.name.trim()) {
        toast.error('Please enter a product name to save as draft');
        return;
      }
    } else {
      // For active/inactive, all required fields must be filled
      if (!productData.name || !productData.price || !productData.quantity || !productImage) {
        toast.error('Please fill in all required fields and upload an image');
        return;
      }
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
      const { status, draft } = getStatusAndDraft(productData.statusOption);

      // Create form data exactly as backend expects
      const formData = new FormData();
      
      // Add product details
      formData.append('name', productData.name);
      formData.append('description', productData.description || '');
      formData.append('price', productData.price || '0');
      formData.append('quantity', productData.quantity || '0');
      formData.append('weight', productData.weight || '');
      formData.append('link', productData.link || '');
      formData.append('sub', productData.sub || '');
      formData.append('category', productData.category || '');
      
      // Send status and draft as strings
      formData.append('status', status.toString());
      formData.append('draft', draft.toString());
      
      // Add product image if available
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
      
      // Add variant images
      variants.vimages.forEach(image => {
        if (image) {
          formData.append('vimage', image);
        }
      });

      console.log('Submitting product with:', {
        statusOption: productData.statusOption,
        status,
        draft,
        variantCount: variants.vname.length,
        hasProductImage: !!productImage
      });

      // Submit the product
      const response = await fetch(
        'https://api.automation365.io/upload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add product');
      }

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.message === "done") {
        const successMessage = isDraftMode 
          ? 'Product saved as draft' 
          : 'Product added successfully';
        toast.success(successMessage);
        
        // Navigate to ProductPage with products tab selected
        navigate('/ProductPage?tab=products');
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      toast.error(error.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const isDraft = productData.statusOption === 'draft';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Add Product" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="space-y-8">
              
              {/* Save Options Section - Prominent at top */}
              <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-medium">Save Options</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('active')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      productData.statusOption === 'active'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${
                        productData.statusOption === 'active' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium">Active</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Publish immediately and make visible in store
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleStatusChange('inactive')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      productData.statusOption === 'inactive'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${
                        productData.statusOption === 'inactive' ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium">Inactive</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Save but keep hidden from store
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleStatusChange('draft')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      productData.statusOption === 'draft'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${
                        productData.statusOption === 'draft' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium">Draft</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Save as work in progress (only name required)
                    </p>
                  </button>
                </div>

                {isDraft && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Draft mode:</strong> Only the product name is required. You can complete the other details later.
                    </p>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium border-b pb-2">Product Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <Input 
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name" 
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
                      Price {!isDraft && '*'}
                    </label>
                    <Input 
                      name="price"
                      value={productData.price}
                      onChange={handleInputChange}
                      type="number" 
                      step="0.01"
                      placeholder="Enter price" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity {!isDraft && '*'}
                    </label>
                    <Input 
                      name="quantity"
                      value={productData.quantity}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="Enter quantity" 
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
                <h3 className="text-lg font-medium border-b pb-2 mb-4">
                  Product Image {!isDraft && '*'}
                </h3>
                
                {productImagePreview ? (
                  <div className="relative">
                    <img 
                      src={productImagePreview} 
                      alt="Product preview" 
                      className="w-full max-h-64 object-contain mb-4 border rounded" 
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-white rounded-full p-1"
                      onClick={() => {
                        setProductImage(null);
                        setProductImagePreview(null);
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
                    {isDraft && (
                      <p className="text-xs text-yellow-600 mt-2">Optional for drafts</p>
                    )}
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
                                <span className="text-green-600 text-sm">✓ Image</span>
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
                  onClick={handleDiscard}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  className={`text-white ${
                    isDraft 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading 
                    ? (isDraft ? 'Saving Draft...' : 'Uploading Product...') 
                    : (isDraft ? 'Save as Draft' : 'Upload Product')
                  }
                </Button>
              </div>
            </div>
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
              {isAddingCategory ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProductPage;