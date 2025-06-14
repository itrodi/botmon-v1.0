import React, { useState, useEffect } from 'react';
import { Download, Plus, Edit2, Filter, Loader } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard';
import ServiceCard from '../ServiceCard';

const TabButton = ({ isActive, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors whitespace-nowrap
      ${isActive 
        ? 'text-purple-600 bg-purple-50' 
        : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
      }`}
  >
    {children}
  </button>
);

const PaginationButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded ${
      active 
        ? 'bg-purple-600 text-white' 
        : 'text-gray-500 hover:bg-purple-50'
    }`}
  >
    {children}
  </button>
);

const ProductPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filterActive, setFilterActive] = useState(false);

  const productsPerPage = 8;

  // Fetch products and services on component mount and tab/filter change
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchServices();
    }
  }, [activeTab, currentPage, filterActive]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.get('https://api.automation365.io/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Process the response data
      let allProducts = response.data || [];
      
      // Ensure all products have required fields with defaults
      allProducts = allProducts.map(product => ({
        ...product,
        id: product.id || product._id,
        // Convert boolean status to string if needed
        status: typeof product.status === 'boolean' 
          ? (product.status ? 'active' : 'inactive')
          : (product.status || 'active'),
        quantity: product.quantity || 0,
        price: product.price || 0,
        name: product.name || 'Untitled Product',
        image: product.image || '',
        // Include variant arrays for ProductCard
        vname: product.vname || [],
        vprice: product.vprice || [],
        vquantity: product.vquantity || [],
        vsize: product.vsize || [],
        vcolor: product.vcolor || [],
        vtype: product.vtype || [],
        vimage: product.vimage || []
      }));
      
      // Apply any active filters
      const filteredProducts = filterActive 
        ? allProducts.filter(p => p.status === 'active') 
        : allProducts;
      
      // Calculate pagination
      const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);
      setTotalPages(totalProductPages);
      
      // Paginate the results
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      setProducts(paginatedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load products');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.get('https://api.automation365.io/services', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Process the response data
      let allServices = response.data || [];
      
      // Ensure all services have required fields with defaults
      allServices = allServices.map(service => ({
        ...service,
        id: service.id || service._id,
        // Services use 'published' instead of 'active'
        status: service.status || 'published',
        price: service.price || 0,
        name: service.name || 'Untitled Service',
        image: service.image || '',
        payment: service.payment !== undefined ? service.payment : true,
        // Include variant arrays for ServiceCard
        vname: service.vname || [],
        vprice: service.vprice || [],
        vimage: service.vimage || []
      }));
      
      // Apply any active filters
      const filteredServices = filterActive 
        ? allServices.filter(s => s.status === 'published' || s.status === 'active') 
        : allServices;
      
      // Calculate pagination
      const totalServicePages = Math.ceil(filteredServices.length / productsPerPage);
      setTotalPages(totalServicePages);
      
      // Paginate the results
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      
      const paginatedServices = filteredServices.slice(startIndex, endIndex);
      setServices(paginatedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load services');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // Services use 'service-status' endpoint, products use 'product-status'
      const endpoint = activeTab === 'services' 
        ? 'https://api.automation365.io/product-status' // Backend uses same endpoint
        : 'https://api.automation365.io/product-status';

      const response = await axios.post(
        endpoint,
        {
          id,
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Status updated") {
        toast.success('Status updated successfully');
        
        // Update the local state immediately for better UX
        if (activeTab === 'products') {
          setProducts(prevProducts => 
            prevProducts.map(product => 
              product.id === id ? { ...product, status: newStatus } : product
            )
          );
        } else {
          setServices(prevServices => 
            prevServices.map(service => 
              service.id === id ? { ...service, status: newStatus } : service
            )
          );
        }
        
        // If filter is active and item is now inactive, it should disappear
        if (filterActive && (newStatus !== 'active' && newStatus !== 'published')) {
          // Re-fetch to update the filtered view
          if (activeTab === 'products') {
            fetchProducts();
          } else {
            fetchServices();
          }
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to update status');
      }
    }
  };

  const handleEdit = (id) => {
    // Navigate to edit page with product/service id as query param
    if (activeTab === 'products') {
      navigate(`/EditProduct?id=${id}`);
    } else {
      navigate(`/EditService?id=${id}`);
    }
  };

  const handleDelete = async (id) => {
    // The ProductCard/ServiceCard component handles the confirmation dialog
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const endpoint = activeTab === 'services' 
        ? 'https://api.automation365.io/delete-services'
        : 'https://api.automation365.io/delete-products';

      const response = await axios.post(
        endpoint,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data === "done") {
        toast.success(`${activeTab === 'services' ? 'Service' : 'Product'} deleted successfully`);
        
        // Update the local state by removing the deleted item
        if (activeTab === 'products') {
          setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        } else {
          setServices(prevServices => prevServices.filter(service => service.id !== id));
        }
        
        // Check if we need to go to previous page after deletion
        const currentItems = activeTab === 'products' ? products : services;
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.error(`Error deleting ${activeTab === 'services' ? 'service' : 'product'}:`, error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(`Failed to delete ${activeTab === 'services' ? 'service' : 'product'}`);
      }
    }
  };

  const handleAddNew = () => {
    // Navigate to add product or service page
    navigate(activeTab === 'products' ? '/AddProductPage' : '/AddServices');
  };

  const handleFilterToggle = () => {
    setFilterActive(!filterActive);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    setFilterActive(false); // Reset filter when changing tabs
  };

  const displayData = activeTab === 'services' ? services : products;

  // Pagination helper functions
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    
    // Previous button
    buttons.push(
      <PaginationButton
        key="prev"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        active={false}
      >
        &lt;
      </PaginationButton>
    );

    // Page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <PaginationButton key={1} onClick={() => setCurrentPage(1)} active={false}>
          1
        </PaginationButton>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="px-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationButton
          key={i}
          onClick={() => setCurrentPage(i)}
          active={i === currentPage}
        >
          {i}
        </PaginationButton>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="px-2">...</span>);
      }
      buttons.push(
        <PaginationButton
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          active={false}
        >
          {totalPages}
        </PaginationButton>
      );
    }

    // Next button
    buttons.push(
      <PaginationButton
        key="next"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        active={false}
      >
        &gt;
      </PaginationButton>
    );

    return buttons;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title={activeTab === 'services' ? 'Services' : 'Products'} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <TabButton 
                  isActive={activeTab === 'services'} 
                  onClick={() => handleTabChange('services')}
                >
                  Services
                </TabButton>
                <TabButton 
                  isActive={activeTab === 'products'} 
                  onClick={() => handleTabChange('products')}
                >
                  Products
                </TabButton>
                <Button 
                  variant={filterActive ? "default" : "outline"} 
                  className={`flex items-center gap-2 ${filterActive ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  onClick={handleFilterToggle}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Active Only</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  onClick={handleAddNew}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {activeTab === 'services' ? 'Add Service' : 'Add Product'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* No Products/Services Message */}
                {displayData.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                    <div className="text-gray-500 mb-4">
                      {filterActive 
                        ? `No active ${activeTab === 'services' ? 'services' : 'products'} found`
                        : `No ${activeTab === 'services' ? 'services' : 'products'} found`
                      }
                    </div>
                    {!filterActive && (
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={handleAddNew}
                      >
                        {activeTab === 'services' ? 'Add First Service' : 'Add First Product'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {displayData.map((item) => (
                        activeTab === 'products' ? (
                          <ProductCard
                            key={item.id}
                            id={item.id}
                            image={item.image}
                            title={item.name}
                            price={item.price}
                            quantity={item.quantity}
                            status={item.status}
                            vname={item.vname}
                            onEdit={handleEdit}
                            onToggle={handleToggleStatus}
                            onDelete={handleDelete}
                          />
                        ) : (
                          <ServiceCard
                            key={item.id}
                            id={item.id}
                            image={item.image}
                            title={item.name}
                            price={item.price}
                            status={item.status}
                            payment={item.payment}
                            vname={item.vname}
                            onEdit={handleEdit}
                            onToggle={handleToggleStatus}
                            onDelete={handleDelete}
                          />
                        )
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2">
                        {renderPaginationButtons()}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductPage;