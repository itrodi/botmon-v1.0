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
    status: 'active' // Default status
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
  
  // Available categories and subcategories
  const [categories, setCategories] = useState([]);
  const [subs, setSubs] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
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

      console.log('Categories response:', response.data);

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

      // Create form data exactly as backend expects
      const formData = new FormData();
      
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
      
      // Add product image
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

      console.log('Submitting product with variants:', {
        productData,
        variantCount: variants.vname.length,
        hasProductImage: !!productImage,
        variantImageCount: variants.vimages.filter(img => img).length
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

      console.log('Upload response:', response.data);

      if (response.data.message === "done") {
        toast.success('Product added successfully');
        // Reset form
        setProductData({
          name: '',
          description: '',
          price: '',
          quantity: '',
          weight: '',
          link: '',
          category: '',
          sub: '',
          status: 'active'
        });
        setProductImage(null);
        setProductImagePreview(null);
        setVariants({
          vname: [],
          vprice: [],
          vquantity: [],
          vsize: [],
          vcolor: [],
          vtype: [],
          vimages: []
        });
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      toast.error(error.response?.data?.error || 'Failed to add product');
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={productData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Upload Photos */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Product Image *</h3>
                
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
                          required
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
                <Button type="button" variant="outline">Cancel</Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading Product...' : 'Upload Product'}
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
              {isAddingCategory ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProductPage;