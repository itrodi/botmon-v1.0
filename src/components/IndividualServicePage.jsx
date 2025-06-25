import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Briefcase, Tag, DollarSign, CreditCard, Image, Loader, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from './Sidebar';
import Header from './Header';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const IndividualServicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Fetch all services and find the specific one
      const response = await axios.get('https://api.automation365.io/services', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const services = response.data || [];
      const foundService = services.find(s => s.id === id || s._id === id);

      if (foundService) {
        setService({
          ...foundService,
          id: foundService.id || foundService._id,
          status: foundService.status || 'published',
          price: foundService.price || 0,
          name: foundService.name || 'Untitled Service',
          description: foundService.description || 'No description available',
          category: foundService.category || 'Uncategorized',
          image: foundService.image || '',
          payment: foundService.payment !== undefined ? foundService.payment : true,
          vname: foundService.vname || [],
          vprice: foundService.vprice || [],
          vimage: foundService.vimage || []
        });
      } else {
        setError('Service not found');
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load service details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/EditService?id=${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
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
            <p className="text-gray-500">Loading service details...</p>
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
          <Header title="Service Details" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/products')} variant="outline">
                  Back to Services
                </Button>
                <Button onClick={fetchServiceDetails}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Service Details" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">Service not found</p>
              <Button onClick={() => navigate('/products')} variant="outline">
                Back to Services
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
        <Header title="Service Details" />
        
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
                Back to Services
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Service
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Service Image */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-80 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${service.image ? 'hidden' : 'flex'} w-full h-80 items-center justify-center bg-gray-100`}>
                    <Image className="w-16 h-16 text-gray-400" />
                  </div>
                </div>

                {/* Variant Images */}
                {service.vimage && service.vimage.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Service Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {service.vimage.slice(0, 6).map((image, index) => (
                        <div key={index} className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
                          <img
                            src={image}
                            alt={`Service ${index + 1}`}
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

              {/* Service Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h1>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                        <Badge className={service.payment ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {service.payment ? 'Payment Required' : 'Free'}
                        </Badge>
                        <span className="text-sm text-gray-500">#{service.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {service.payment ? `₦${service.price.toLocaleString()}` : 'Free'}
                      </div>
                      <div className="text-sm text-gray-500">Price</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">{service.description}</p>
                </div>

                {/* Service Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-8 h-8 text-blue-600" />
                      <div>
                        <div className="text-lg font-medium">{service.status}</div>
                        <div className="text-sm text-gray-500">Status</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Tag className="w-8 h-8 text-green-600" />
                      <div>
                        <div className="text-lg font-medium">{service.category}</div>
                        <div className="text-sm text-gray-500">Category</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-purple-600" />
                      <div>
                        <div className="text-lg font-medium">{service.payment ? 'Paid' : 'Free'}</div>
                        <div className="text-sm text-gray-500">Payment Type</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Packages */}
                {service.vname && service.vname.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Service Packages</h3>
                    <div className="space-y-4">
                      {service.vname.map((packageName, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Package Name</label>
                              <p className="text-gray-900 font-medium">{packageName}</p>
                            </div>
                            {service.vprice && service.vprice[index] && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Price</label>
                                <p className="text-gray-900 font-medium">₦{service.vprice[index]}</p>
                              </div>
                            )}
                          </div>
                          {service.vimage && service.vimage[index] && (
                            <div className="mt-3">
                              <img
                                src={service.vimage[index]}
                                alt={packageName}
                                className="w-32 h-24 object-cover rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service ID</label>
                      <p className="text-gray-900">{service.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Required</label>
                      <p className="text-gray-900">{service.payment ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Packages</label>
                      <p className="text-gray-900">{service.vname?.length || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-gray-900">{service.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IndividualServicePage;