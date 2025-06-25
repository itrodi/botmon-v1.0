import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Tag, DollarSign, Layers, Image, Loader, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from './Sidebar';
import Header from './Header';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const IndividualProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Fetch all products and find the specific one
      const response = await axios.get('https://api.automation365.io/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const products = response.data || [];
      const foundProduct = products.find(p => p.id === id || p._id === id);

      if (foundProduct) {
        setProduct({
          ...foundProduct,
          id: foundProduct.id || foundProduct._id,
          status: typeof foundProduct.status === 'boolean' 
            ? (foundProduct.status ? 'active' : 'inactive')
            : (foundProduct.status || 'active'),
          quantity: foundProduct.quantity || 0,
          price: foundProduct.price || 0,
          name: foundProduct.name || 'Untitled Product',
          description: foundProduct.description || 'No description available',
          category: foundProduct.category || 'Uncategorized',
          image: foundProduct.image || '',
          vname: foundProduct.vname || [],
          vprice: foundProduct.vprice || [],
          vquantity: foundProduct.vquantity || [],
          vsize: foundProduct.vsize || [],
          vcolor: foundProduct.vcolor || [],
          vtype: foundProduct.vtype || [],
          vimage: foundProduct.vimage || []
        });
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/EditProduct?id=${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Product Details" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/products')} variant="outline">
                  Back to Products
                </Button>
                <Button onClick={fetchProductDetails}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Product Details" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">Product not found</p>
              <Button onClick={() => navigate('/products')} variant="outline">
                Back to Products
              </Button>
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
        <Header title="Product Details" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Navigation */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Products
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Product
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Image */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-80 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${product.image ? 'hidden' : 'flex'} w-full h-80 items-center justify-center bg-gray-100`}>
                    <Image className="w-16 h-16 text-gray-400" />
                  </div>
                </div>

                {/* Variant Images */}
                {product.vimage && product.vimage.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Variant Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {product.vimage.slice(0, 6).map((image, index) => (
                        <div key={index} className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
                          <img
                            src={image}
                            alt={`Variant ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                        <span className="text-sm text-gray-500">#{product.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">₦{product.price.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Price</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">{product.description}</p>
                </div>

                {/* Product Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-8 h-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">{product.quantity}</div>
                        <div className="text-sm text-gray-500">Quantity</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Tag className="w-8 h-8 text-green-600" />
                      <div>
                        <div className="text-lg font-medium">{product.category}</div>
                        <div className="text-sm text-gray-500">Category</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Layers className="w-8 h-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">{product.vname?.length || 0}</div>
                        <div className="text-sm text-gray-500">Variants</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants */}
                {product.vname && product.vname.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Product Variants</h3>
                    <div className="space-y-4">
                      {product.vname.map((variantName, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Name</label>
                              <p className="text-gray-900">{variantName}</p>
                            </div>
                            {product.vprice && product.vprice[index] && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Price</label>
                                <p className="text-gray-900">₦{product.vprice[index]}</p>
                              </div>
                            )}
                            {product.vquantity && product.vquantity[index] && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Quantity</label>
                                <p className="text-gray-900">{product.vquantity[index]}</p>
                              </div>
                            )}
                            {product.vcolor && product.vcolor[index] && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Color</label>
                                <p className="text-gray-900">{product.vcolor[index]}</p>
                              </div>
                            )}
                            {product.vsize && product.vsize[index] && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Size</label>
                                <p className="text-gray-900">{product.vsize[index]}</p>
                              </div>
                            )}
                            {product.vtype && product.vtype[index] && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Type</label>
                                <p className="text-gray-900">{product.vtype[index]}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IndividualProductPage;