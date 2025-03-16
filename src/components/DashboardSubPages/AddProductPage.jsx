import React, { useState, useEffect } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-hot-toast';
import axios from 'axios';
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

const AddProductPage = () => {
  // State for modals
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Main product state
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    discount: '',
    link: '',
    category: '',
    sub: ''
  });
  
  // Product image state
  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  
  // Variants state
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    size: '',
    type: '',
    color: '',
    quantity: '',
    price: ''
  });
  const [variantImage, setVariantImage] = useState(null);
  
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
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

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
        return;
      }

      const response = await axios.get('https://api.automation365.io/add-products', {
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

  // Handle product image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 3 * 1024 * 1024) { // 3MB limit
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result);
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
    if (!currentVariant.name || !currentVariant.price || !currentVariant.quantity) {
      toast.error('Please fill in all required variant fields');
      return;
    }

    setIsAddingVariant(true);

    try {
      // First, submit the variant to the backend
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const formData = new FormData();
      Object.entries(currentVariant).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (variantImage) {
        formData.append('vimage', variantImage);
      }

      // Submit the variant to the backend
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
        // Add to local state
        setVariants(prev => [...prev, currentVariant]);
        
        // Reset the form
        setCurrentVariant({
          name: '',
          size: '',
          type: '',
          color: '',
          quantity: '',
          price: ''
        });
        setVariantImage(null);
        
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
        'https://api.automation365.io/add-category',
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

  // Submit the form to add a product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!productData.name || !productData.price || !productData.quantity || !productImage) {
      toast.error('Please fill in all required fields and upload an image');
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
      
      // Add product details
      Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add product image
      if (productImage) {
        formData.append('image', productImage);
      }
      
      // Add variants data
      variants.forEach((variant, index) => {
        formData.append(`vname[${index}]`, variant.name);
        formData.append(`vprice[${index}]`, variant.price);
        formData.append(`vquantity[${index}]`, variant.quantity);
        formData.append(`vsize[${index}]`, variant.size || '');
        formData.append(`vcolor[${index}]`, variant.color || '');
        formData.append(`vtype[${index}]`, variant.type || '');
      });

      // Submit the product
      const response = await axios.post(
        'https://api.automation365.io/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.message === "done") {
        toast.success('Product added successfully');
        // Reset form
        setProductData({
          name: '',
          description: '',
          price: '',
          quantity: '',
          discount: '',
          link: '',
          category: '',
          sub: ''
        });
        setProductImage(null);
        setProductImagePreview(null);
        setVariants([]);
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Add Product" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
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
                    placeholder="Enter description" 
                    className="min-h-[100px]" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <Input 
                      name="price"
                      value={productData.price}
                      onChange={handleInputChange}
                      type="number" 
                      placeholder="Enter Price" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <Select 
                      value={productData.quantity}
                      onValueChange={(value) => handleSelectChange('quantity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(100)].map((_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <Input 
                    name="discount"
                    value={productData.discount}
                    onChange={handleInputChange}
                    type="number" 
                    placeholder="Enter discount" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Link
                  </label>
                  <Input 
                    name="link"
                    value={productData.link}
                    onChange={handleInputChange}
                    placeholder="Add product link" 
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Add product link if the product is digital so users can access link if the purchase is successful
                  </p>
                </div>
              </div>

              {/* Variations Section */}
              <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium">Product variation</h3>
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
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-4 text-center text-gray-500">
                            No variants added yet
                          </td>
                        </tr>
                      ) : (
                        variants.map((variant, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{variant.name}</td>
                            <td className="py-2">{variant.price}</td>
                            <td className="py-2">{variant.quantity}</td>
                            <td className="py-2">{variant.size}</td>
                            <td className="py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setVariants(variants.filter((_, i) => i !== index));
                                }}
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

              {/* Category Section */}
              <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium">Product Category</h3>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowCategoryModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Category
                  </Button>
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
  categories.map((cat, idx) => (
    <SelectItem key={idx} value={cat}>
      {cat}
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
  subs.map((sub, idx) => (
    <SelectItem key={idx} value={sub}>
      {sub}
    </SelectItem>
  ))
)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Upload Photos */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                {productImagePreview ? (
                  <div className="relative">
                    <img 
                      src={productImagePreview} 
                      alt="Product preview" 
                      className="w-full max-h-64 object-contain mb-4" 
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
                        <span>Upload Photos</span>
                        <input 
                          type="file" 
                          className="sr-only" 
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">Less than 3MB</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">Cancel</Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading...' : 'Upload Product'}
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
            <DialogTitle>Variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input 
                name="name" 
                value={currentVariant.name}
                onChange={handleVariantInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <Input 
                  name="size" 
                  value={currentVariant.size}
                  onChange={handleVariantInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Input 
                  name="type" 
                  value={currentVariant.type}
                  onChange={handleVariantInputChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <Input 
                name="color" 
                value={currentVariant.color}
                onChange={handleVariantInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <Input 
                  name="quantity" 
                  type="number" 
                  value={currentVariant.quantity}
                  onChange={handleVariantInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <Input 
                  name="price" 
                  type="number" 
                  value={currentVariant.price}
                  onChange={handleVariantInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
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
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              className="bg-purple-600 text-white"
              onClick={handleAddVariant}
              disabled={isAddingVariant}
            >
              {isAddingVariant ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <Input 
                name="category"
                value={newCategory.category}
                onChange={handleCategoryInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub category Name
              </label>
              <Input 
                name="sub"
                value={newCategory.sub}
                onChange={handleCategoryInputChange}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              className="bg-purple-600 text-white"
              onClick={handleAddCategory}
              disabled={isAddingCategory}
            >
              {isAddingCategory ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProductPage;