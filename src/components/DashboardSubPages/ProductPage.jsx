import React, { useState, useEffect } from 'react';
import { Download, Plus, Edit2, Filter, Loader, Search, X, FileText } from 'lucide-react';
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
  const [drafts, setDrafts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filterActive, setFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const productsPerPage = 8;

  // Helper function to normalize status values
  const normalizeStatus = (status) => {
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

  // Helper function to check if item is a draft
  // UPDATED LOGIC: Item is a draft ONLY if draft=true AND status=false
  // When status becomes true (active), item is no longer considered a draft
  const isDraft = (item) => {
    const hasDraftFlag = item.draft === true || item.draft === 'true';
    const isActive = item.status === 'true' || item.status === true;
    
    // Only show in drafts if draft flag is true AND not active
    return hasDraftFlag && !isActive;
  };

  // Helper to check if item is published (should show in products/services tab)
  const isPublished = (item) => {
    return !isDraft(item);
  };

  // Get search query from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    const tabParam = urlParams.get('tab');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (tabParam && ['products', 'services', 'drafts'].includes(tabParam)) {
      setActiveTab(tabParam);
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

      let products = response.data || [];
      
      products = products.map(product => ({
        ...product,
        id: product.id || product._id,
        status: normalizeStatus(product.status),
        draft: product.draft === true || product.draft === 'true',
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
        vimage: product.vimage || [],
        type: 'product'
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

      let services = response.data || [];
      
      services = services.map(service => ({
        ...service,
        id: service.id || service._id,
        status: normalizeStatus(service.status),
        draft: service.draft === true || service.draft === 'true',
        price: service.price || 0,
        name: service.name || 'Untitled Service',
        image: service.image || '',
        category: service.category || '',
        description: service.description || '',
        payment: service.payment !== undefined ? service.payment : true,
        vname: service.vname || [],
        vprice: service.vprice || [],
        vimage: service.vimage || [],
        type: 'service'
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
    let sourceData = [];
    
    if (activeTab === 'products') {
      // Show products that are published (not drafts, or drafts that are now active)
      sourceData = allProducts.filter(item => isPublished(item));
    } else if (activeTab === 'services') {
      // Show services that are published
      sourceData = allServices.filter(item => isPublished(item));
    } else if (activeTab === 'drafts') {
      // Show only true drafts (draft=true AND status=false)
      const draftProducts = allProducts.filter(item => isDraft(item));
      const draftServices = allServices.filter(item => isDraft(item));
      sourceData = [...draftProducts, ...draftServices];
    }
    
    let filteredData = sourceData;
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filteredData = sourceData.filter(item => 
        item.name?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filterActive && activeTab !== 'drafts') {
      filteredData = filteredData.filter(item => {
        const itemIsActive = item.status === 'true' || 
                            item.status === true || 
                            item.status === 'active' || 
                            item.status === 'published';
        return itemIsActive;
      });
    }
    
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / productsPerPage);
    setTotalPages(totalPages);
    
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      return;
    }
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    if (activeTab === 'products') {
      setProducts(paginatedData);
    } else if (activeTab === 'services') {
      setServices(paginatedData);
    } else if (activeTab === 'drafts') {
      setDrafts(paginatedData);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    
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

  const handleToggleStatus = async (id, newStatus, itemType = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // Determine the correct endpoint based on the active tab or item type
      let endpoint;
      let type;
      
      if (activeTab === 'drafts') {
        type = itemType;
        endpoint = itemType === 'service' 
          ? 'https://api.automation365.io/service-status'
          : 'https://api.automation365.io/product-status';
      } else {
        type = activeTab === 'services' ? 'service' : 'product';
        endpoint = activeTab === 'services' 
          ? 'https://api.automation365.io/service-status'
          : 'https://api.automation365.io/product-status';
      }

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

      if (response.data.message === "Status updated" || response.data === "done") {
        // Show appropriate message based on action
        if (activeTab === 'drafts' && newStatus === 'true') {
          toast.success(`${type === 'service' ? 'Service' : 'Product'} published successfully`);
        } else {
          toast.success('Status updated successfully');
        }
        
        // Update the local state with the new status
        if (type === 'product' || activeTab === 'products') {
          setAllProducts(prevProducts => 
            prevProducts.map(product => 
              product.id === id ? { ...product, status: newStatus } : product
            )
          );
        }
        if (type === 'service' || activeTab === 'services') {
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
        setAllProducts([...allProducts]);
      } else if (activeTab === 'services') {
        setAllServices([...allServices]);
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

  const handleEdit = (id, itemType = null) => {
    if (activeTab === 'drafts') {
      if (itemType === 'service') {
        navigate(`/EditService?id=${id}`);
      } else {
        navigate(`/EditProduct?id=${id}`);
      }
    } else if (activeTab === 'products') {
      navigate(`/EditProduct?id=${id}`);
    } else {
      navigate(`/EditService?id=${id}`);
    }
  };

  const handleDelete = async (id, itemType = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      let endpoint;
      if (activeTab === 'drafts') {
        endpoint = itemType === 'service' 
          ? 'https://api.automation365.io/delete-services'
          : 'https://api.automation365.io/delete-products';
      } else {
        endpoint = activeTab === 'services' 
          ? 'https://api.automation365.io/delete-services'
          : 'https://api.automation365.io/delete-products';
      }

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
        toast.success(`${itemType === 'service' || activeTab === 'services' ? 'Service' : 'Product'} deleted successfully`);
        
        if (activeTab === 'products' || (activeTab === 'drafts' && itemType === 'product')) {
          setAllProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        }
        if (activeTab === 'services' || (activeTab === 'drafts' && itemType === 'service')) {
          setAllServices(prevServices => prevServices.filter(service => service.id !== id));
        }
      }
    } catch (error) {
      console.error(`Error deleting item:`, error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(`Failed to delete item`);
      }
    }
  };

  const handleAddNew = () => {
    navigate(activeTab === 'products' || activeTab === 'drafts' ? '/AddProductPage' : '/AddServices');
  };

  const handleFilterToggle = () => {
    setFilterActive(!filterActive);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setFilterActive(false);
  };

  const getDisplayData = () => {
    switch (activeTab) {
      case 'products':
        return products;
      case 'services':
        return services;
      case 'drafts':
        return drafts;
      default:
        return [];
    }
  };

  const displayData = getDisplayData();
  const hasSearchQuery = searchQuery.trim().length > 0;

  // Count drafts for badge - only count true drafts (draft=true AND status=false)
  const draftCount = allProducts.filter(isDraft).length + allServices.filter(isDraft).length;

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

  const getPageTitle = () => {
    switch (activeTab) {
      case 'products':
        return 'Products';
      case 'services':
        return 'Services';
      case 'drafts':
        return 'Drafts';
      default:
        return 'Products';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title={getPageTitle()} />
        
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
                <TabButton 
                  isActive={activeTab === 'drafts'} 
                  onClick={() => handleTabChange('drafts')}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Drafts
                    {draftCount > 0 && (
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                        {draftCount}
                      </span>
                    )}
                  </div>
                </TabButton>
                {activeTab !== 'drafts' && (
                  <Button 
                    variant={filterActive ? "default" : "outline"} 
                    className={`flex items-center gap-2 ${filterActive ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                    onClick={handleFilterToggle}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Active Only</span>
                  </Button>
                )}
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
                  {filterActive && activeTab !== 'drafts' && " (active only)"}
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
                          : activeTab === 'drafts'
                            ? 'No drafts found'
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
                    ) : !filterActive && activeTab !== 'drafts' && (
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={handleAddNew}
                      >
                        {activeTab === 'services' ? 'Add First Service' : 'Add First Product'}
                      </Button>
                    )}
                    {activeTab === 'drafts' && !hasSearchQuery && (
                      <p className="text-sm text-gray-400 mt-2">
                        Drafts will appear here when you save products or services as drafts
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {displayData.map((item) => {
                        if (activeTab === 'drafts') {
                          if (item.type === 'service') {
                            return (
                              <ServiceCard
                                key={item.id}
                                id={item.id}
                                image={item.image}
                                title={item.name}
                                price={item.price}
                                status={item.status}
                                payment={item.payment}
                                vname={item.vname}
                                isDraft={true}
                                itemType="service"
                                onEdit={(id) => handleEdit(id, 'service')}
                                onToggle={(id, status) => handleToggleStatus(id, status, 'service')}
                                onDelete={(id) => handleDelete(id, 'service')}
                              />
                            );
                          } else {
                            return (
                              <ProductCard
                                key={item.id}
                                id={item.id}
                                image={item.image}
                                title={item.name}
                                price={item.price}
                                quantity={item.quantity}
                                status={item.status}
                                vname={item.vname}
                                isDraft={true}
                                itemType="product"
                                onEdit={(id) => handleEdit(id, 'product')}
                                onToggle={(id, status) => handleToggleStatus(id, status, 'product')}
                                onDelete={(id) => handleDelete(id, 'product')}
                              />
                            );
                          }
                        }
                        
                        return activeTab === 'products' ? (
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
                        );
                      })}
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