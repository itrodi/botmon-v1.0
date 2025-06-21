import React, { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Loader, Package, Truck, CheckCircle } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Sidebar from '../Sidebar';
import Header from '../Header';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Orders = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'rejected', label: 'Rejected' },
  ];

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders when tab, search term, or orders change
  useEffect(() => {
    filterOrdersByTab();
  }, [activeTab, orders, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.get('https://api.automation365.io/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Process the response data
      const ordersData = response.data || [];
      const processedOrders = ordersData.map(order => {
        // Determine platform from source or platform field
        let platform = order.platform;
        if (!platform && order.source) {
          // Capitalize the source to match backend expectations
          if (order.source === 'instagram') platform = 'Instagram';
          else if (order.source === 'whatsapp') platform = 'Whatsapp';
          else if (order.source === 'messenger') platform = 'Messenger';
          else platform = order.source;
        } else if (!platform) {
          platform = 'Unknown';
        }
        
        // Normalize status - if no status, it's Pending
        let status = order.status || 'Pending';
        
        return {
          ...order,
          platform,
          status,
          ids: order.ids || order.id || order._id,
          email: order.email || 'No email provided',
          'product-name': order['product-name'] || order.product_name || order.name || 'Product',
          price: order.price || 0,
          quantity: order.quantity || 1,
          customer_name: order.customer_name || order.customer || 'Customer',
          address: order.address || 'No address provided',
          phone: order.phone || 'No phone provided',
          image: order.image || order.images?.[0] || '',
          images: order.images || [order.image].filter(Boolean),
          created_at: order.created_at || order.timestamp || new Date().toISOString()
        };
      });

      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByTab = () => {
    let filtered = [...orders];

    // Filter by status - handle backend status values properly
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => {
        const status = order.status; // Keep original case
        
        if (activeTab === 'pending') {
          // Orders without status or explicitly "Pending"
          return !status || status === 'Pending';
        }
        if (activeTab === 'confirmed') {
          // Backend uses "Confirmed" with capital C
          return status === 'Confirmed';
        }
        if (activeTab === 'rejected') {
          // Backend uses "Rejected" with capital R
          return status === 'Rejected';
        }
        return false;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order['product-name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.ids?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setCurrentImageIndex(0);
  };

  const handleTrackOrder = () => {
    setShowTrackingModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/confirm-order',
        {
          ids: selectedOrder.ids,
          'product-name': selectedOrder['product-name'],
          platform: selectedOrder.platform,
          email: selectedOrder.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'successful') {
        toast.success('Order confirmed successfully');
        // Update local state with proper status
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.ids === selectedOrder.ids 
              ? { ...order, status: 'Confirmed' } // Use capital C to match backend
              : order
          )
        );
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to confirm order');
      }
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;

    const reason = window.prompt('Please provide a reason for rejecting this order:');
    if (reason === null) return; // User cancelled

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/reject-order',
        {
          ids: selectedOrder.ids,
          'product-name': selectedOrder['product-name'],
          platform: selectedOrder.platform,
          email: selectedOrder.email,
          reason: reason || 'No reason provided'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'successful') {
        toast.success('Order rejected successfully');
        // Update local state with proper status
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.ids === selectedOrder.ids 
              ? { ...order, status: 'Rejected' } // Use capital R to match backend
              : order
          )
        );
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to reject order');
      }
    }
  };

  const getStatusColor = (status) => {
    // Handle backend status values with proper casing
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return `${seconds} secs ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    return format(date, 'MMM dd, yyyy');
  };

  // Get order stats for display
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => !o.status || o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed').length,
      rejected: orders.filter(o => o.status === 'Rejected').length
    };
    return stats;
  };

  const stats = getOrderStats();

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button 
            key={i}
            variant={currentPage === i ? "default" : "outline"} 
            className={`w-8 h-8 p-0 ${currentPage === i ? 'bg-purple-600' : ''}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      // Add logic for more pages with ellipsis
      buttons.push(
        <Button 
          key={1}
          variant={currentPage === 1 ? "default" : "outline"} 
          className={`w-8 h-8 p-0 ${currentPage === 1 ? 'bg-purple-600' : ''}`}
          onClick={() => setCurrentPage(1)}
        >
          1
        </Button>
      );
      
      if (currentPage > 3) {
        buttons.push(<span key="ellipsis1" className="px-2">...</span>);
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        buttons.push(
          <Button 
            key={i}
            variant={currentPage === i ? "default" : "outline"} 
            className={`w-8 h-8 p-0 ${currentPage === i ? 'bg-purple-600' : ''}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>
        );
      }
      
      if (currentPage < totalPages - 2) {
        buttons.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      
      if (totalPages > 1) {
        buttons.push(
          <Button 
            key={totalPages}
            variant={currentPage === totalPages ? "default" : "outline"} 
            className={`w-8 h-8 p-0 ${currentPage === totalPages ? 'bg-purple-600' : ''}`}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </Button>
        );
      }
    }
    
    return buttons;
  };

  return (
    <div className="h-screen flex">
      <Sidebar />
      
      <div className="flex-1">
        <Header title="Orders" />

        <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-4 flex-wrap">
                <div className="relative w-full sm:w-auto max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-9 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={fetchOrders}
                >
                  Refresh
                </Button>
              </div>
              
              {/* Order Stats */}
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  Total: {stats.total}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  Pending: {stats.pending}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  Confirmed: {stats.confirmed}
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                  Rejected: {stats.rejected}
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-lg w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                  {tab.id !== 'all' && (
                    <span className="ml-2">
                      ({tab.id === 'pending' ? stats.pending : 
                        tab.id === 'confirmed' ? stats.confirmed :
                        tab.id === 'rejected' ? stats.rejected : 0})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* No Orders Message */}
                {currentOrders.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <div className="text-gray-500 mb-4">
                      {searchTerm 
                        ? 'No orders found matching your search'
                        : `No ${activeTab === 'all' ? '' : activeTab} orders found`
                      }
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Orders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {currentOrders.map((order) => (
                        <div
                          key={order.ids}
                          onClick={() => handleOrderClick(order)}
                          className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="relative mb-4">
                            {order.image ? (
                              <img 
                                src={order.image}
                                alt={order['product-name']}
                                className="w-full h-48 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(order['product-name'])}&background=6B7280&color=fff&size=400`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status || 'Pending'}
                            </span>
                            <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {order.platform}
                            </span>
                          </div>
                          <h3 className="font-medium line-clamp-1">{order['product-name']}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            ${order.price} × {order.quantity}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-gray-500">{getTimeAgo(order.created_at)}</span>
                            <span className="font-medium line-clamp-1">{order.customer_name}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              Order ID: {order.ids}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg mt-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                          <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                              <span className="font-medium">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of{' '}
                              <span className="font-medium">{filteredOrders.length}</span> results
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {renderPaginationButtons()}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Order Details</span>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setSelectedOrder(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Product Image Carousel */}
              <div className="relative">
                {selectedOrder.images && selectedOrder.images.length > 0 ? (
                  <>
                    <img 
                      src={selectedOrder.images[currentImageIndex] || selectedOrder.image}
                      alt={selectedOrder['product-name']}
                      className="w-full h-64 object-contain rounded-lg bg-gray-50"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedOrder['product-name'])}&background=6B7280&color=fff&size=400`;
                      }}
                    />
                    {selectedOrder.images.length > 1 && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-between px-4">
                          <Button
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => prev === 0 ? selectedOrder.images.length - 1 : prev - 1);
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => prev === selectedOrder.images.length - 1 ? 0 : prev + 1);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {selectedOrder.images.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors
                                ${currentImageIndex === index ? 'bg-purple-600' : 'bg-white'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(index);
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Product</h4>
                    <p className="font-medium">{selectedOrder['product-name']}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Platform</h4>
                    <p className="font-medium">{selectedOrder.platform}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Price</h4>
                    <p className="text-lg font-semibold">${selectedOrder.price}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                    <p className="text-lg font-semibold">{selectedOrder.quantity}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                  <p className="text-xl font-bold text-purple-600">
                    ${(selectedOrder.price * selectedOrder.quantity).toFixed(2)}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order ID</h4>
                  <p className="font-mono text-sm">{selectedOrder.ids}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Customer & Delivery Details */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Customer & Delivery Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 min-w-[24px]">👤</span>
                    <div>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                      <p className="text-gray-600">{selectedOrder.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 min-w-[24px]">📍</span>
                    <p className="text-gray-600">{selectedOrder.address}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 min-w-[24px]">📞</span>
                    <p className="text-gray-600">{selectedOrder.phone}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {(!selectedOrder.status || selectedOrder.status === 'Pending') && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={handleTrackOrder}
                  >
                    Track Order
                  </Button>
                  <Button
                    className="flex-1 bg-red-100 text-red-600 hover:bg-red-200"
                    variant="ghost"
                    onClick={handleRejectOrder}
                  >
                    Reject Order
                  </Button>
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleConfirmOrder}
                  >
                    Confirm
                  </Button>
                </div>
              )}

              {/* Show appropriate message for confirmed/rejected orders */}
              {selectedOrder.status === 'Confirmed' && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">This order has been confirmed</p>
                </div>
              )}

              {selectedOrder.status === 'Rejected' && (
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <X className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-red-700 font-medium">This order has been rejected</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Tracking Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Tracking</span>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setShowTrackingModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-8">
              <div className="relative flex items-center">
                <div className="h-8 w-8 rounded-full border-2 border-purple-600 flex items-center justify-center bg-purple-600">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-purple-600 font-medium">Order Confirmed</p>
                  <p className="text-sm text-gray-500">Your order has been confirmed</p>
                </div>
              </div>
              
              <div className="relative flex items-center">
                <div className="h-8 w-8 rounded-full border-2 border-purple-200 flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-200" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400">Packaging</p>
                  <p className="text-sm text-gray-400">Order is being packaged</p>
                </div>
                <div className="absolute h-12 border-l-2 border-purple-200 left-4 -top-8 z-[-1]" />
              </div>
              
              <div className="relative flex items-center">
                <div className="h-8 w-8 rounded-full border-2 border-purple-200 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-purple-200" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400">In Transit</p>
                  <p className="text-sm text-gray-400">Order is on the way</p>
                </div>
                <div className="absolute h-12 border-l-2 border-purple-200 left-4 -top-8 z-[-1]" />
              </div>
              
              <div className="relative flex items-center">
                <div className="h-8 w-8 rounded-full border-2 border-purple-200 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-200" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400">Delivered</p>
                  <p className="text-sm text-gray-400">Order has been delivered</p>
                </div>
                <div className="absolute h-12 border-l-2 border-purple-200 left-4 -top-8 z-[-1]" />
              </div>
            </div>
            <Button 
              className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowTrackingModal(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;