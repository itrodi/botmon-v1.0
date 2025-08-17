import React, { useState, useEffect } from 'react';
import { Download, Plus, Edit2, Filter, Loader, Search, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('products');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filterActive, setFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const productsPerPage = 8;

  // Helper function to normalize status values
  const normalizeStatus = (status) => {
    // Convert various status formats to 'true' or 'false' string
    if (status === true || 
        status === 'true' || 
        status === 'active' || 
        status === 'published' || 
        status === 1 || 
        status === '1') {
      return 'true';
    }
    return 'false';
  };

  // Get search query from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  // Fetch products and services on component mount
  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  // Apply filters and pagination when data or filters change
  useEffect(() => {
    applyFiltersAndPagination();
  }, [allProducts, allServices, activeTab, currentPage, filterActive, searchQuery]);

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
      let products = response.data || [];
      
      // Ensure all products have required fields with defaults
      // Normalize status to string 'true' or 'false'
      products = products.map(product => ({
        ...product,
        id: product.id || product._id,
        // Normalize status to 'true' or 'false' string
        status: normalizeStatus(product.status),
        quantity: product.quantity || 0,
        price: product.price || 0,
        name: product.name || 'Untitled Product',
        image: product.image || '',
        category: product.category || '',
        description: product.description || '',
        vname: product.vname || [],
        vprice: product.vprice || [],
        vquantity: product.vquantity || [],
        vsize: product.vsize || [],
        vcolor: product.vcolor || [],
        vtype: product.vtype || [],
        vimage: product.vimage || []
      }));
      
      setAllProducts(products);
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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.get('https://api.automation365.io/services', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Process the response data
      let services = response.data || [];
      
      // Ensure all services have required fields with defaults
      // Normalize status to string 'true' or 'false'
      services = services.map(service => ({
        ...service,
        id: service.id || service._id,
        // Normalize status to 'true' or 'false' string
        status: normalizeStatus(service.status),
        price: service.price || 0,
        name: service.name || 'Untitled Service',
        image: service.image || '',
        category: service.category || '',
        description: service.description || '',
        payment: service.payment !== undefined ? service.payment : true,
        vname: service.vname || [],
        vprice: service.vprice || [],
        vimage: service.vimage || []
      }));
      
      setAllServices(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load services');
      }
    }
  };

  const applyFiltersAndPagination = () => {
    const isProducts = activeTab === 'products';
    const sourceData = isProducts ? allProducts : allServices;
    
    // Apply search filter
    let filteredData = sourceData;
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filteredData = sourceData.filter(item => 
        item.name?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply active filter - handle both boolean and string status values
    if (filterActive) {
      filteredData = filteredData.filter(item => {
        // Normalize status to boolean for comparison
        const itemIsActive = item.status === 'true' || 
                            item.status === true || 
                            item.status === 'active' || 
                            item.status === 'published';
        return itemIsActive;
      });
    }
    
    // Calculate pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / productsPerPage);
    setTotalPages(totalPages);
    
    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      return; // Will re-run with new currentPage
    }
    
    // Paginate the results
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    if (isProducts) {
      setProducts(paginatedData);
    } else {
      setServices(paginatedData);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
    
    // Update URL without triggering a page reload
    const newUrl = query.trim() 
      ? `${location.pathname}?search=${encodeURIComponent(query)}`
      : location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    window.history.replaceState({}, '', location.pathname);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // Determine the correct endpoint based on the active tab
      const endpoint = activeTab === 'services' 
        ? 'https://api.automation365.io/service-status'  // You may need to verify this endpoint
        : 'https://api.automation365.io/product-status';

      const response = await axios.post(
        endpoint,
        {
          id,
          status: newStatus  // This will be 'true' or 'false' as string
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Status updated" || response.data === "done") {
        toast.success('Status updated successfully');
        
        // Update the local state with the new status
        if (activeTab === 'products') {
          setAllProducts(prevProducts => 
            prevProducts.map(product => 
              product.id === id ? { ...product, status: newStatus } : product
            )
          );
        } else {
          setAllServices(prevServices => 
            prevServices.map(service => 
              service.id === id ? { ...service, status: newStatus } : service
            )
          );
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Revert the status in the UI if the API call failed
      if (activeTab === 'products') {
        const product = allProducts.find(p => p.id === id);
        if (product) {
          // Force re-render with original status
          setAllProducts([...allProducts]);
        }
      } else {
        const service = allServices.find(s => s.id === id);
        if (service) {
          // Force re-render with original status
          setAllServices([...allServices]);
        }
      }
      
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
    if (activeTab === 'products') {
      navigate(`/EditProduct?id=${id}`);
    } else {
      navigate(`/EditService?id=${id}`);
    }
  };

  const handleDelete = async (id) => {
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
          setAllProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        } else {
          setAllServices(prevServices => prevServices.filter(service => service.id !== id));
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
    navigate(activeTab === 'products' ? '/AddProductPage' : '/AddServices');
  };

  const handleFilterToggle = () => {
    setFilterActive(!filterActive);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const displayData = activeTab === 'services' ? services : products;
  const hasSearchQuery = searchQuery.trim().length > 0;

  // Pagination helper functions
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    
    buttons.push(
      <PaginationButton
        key="prev"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        active={false}
      >
        &lt;
      </PaginationButton>
    );

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

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder={`Search ${activeTab}...`}
                  className="pl-10 pr-10 bg-white"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {hasSearchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing results for "<span className="font-medium">{searchQuery}</span>"
                  {filterActive && " (active only)"}
                </p>
              )}
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
                      {hasSearchQuery 
                        ? `No ${activeTab} found matching "${searchQuery}"`
                        : filterActive 
                          ? `No active ${activeTab} found`
                          : `No ${activeTab} found`
                      }
                    </div>
                    {hasSearchQuery ? (
                      <Button 
                        variant="outline"
                        onClick={clearSearch}
                        className="mr-2"
                      >
                        Clear search
                      </Button>
                    ) : !filterActive && (
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