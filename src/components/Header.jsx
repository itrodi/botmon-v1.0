import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, HelpCircle, LogOut, Package, Briefcase, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Header = ({ 
  title = "Botmon Dashboard"
}) => {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState({
    bname: 'Your Business',
    blogo: '/api/placeholder/40/40'
  });
  const [userName, setUserName] = useState('User');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Format current date
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch business data on component mount
  useEffect(() => {
    fetchBusinessData();
    
    // Add click outside listener to close search results
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchBusinessData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('https://api.automation365.io/settings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setBusinessData({
          bname: response.data.bname || 'Your Business',
          blogo: response.data.blogo || '/api/placeholder/40/40'
        });
        
        // Set user name from business name or use a default
        setUserName(response.data.bname || 'User');
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      // Silently fail and use defaults
    }
  };

  // Debounced search function
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // Fetch both products and services
      const [productsResponse, servicesResponse] = await Promise.all([
        axios.get('https://api.automation365.io/products', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://api.automation365.io/services', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const products = productsResponse.data || [];
      const services = servicesResponse.data || [];

      // Filter products and services based on search query
      const searchTerm = query.toLowerCase();
      
      const filteredProducts = products
        .filter(product => 
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.category?.toLowerCase().includes(searchTerm)
        )
        .map(product => ({
          ...product,
          type: 'product',
          displayName: product.name || 'Untitled Product',
          id: product.id || product._id // Ensure we have an ID
        }))
        .slice(0, 5); // Limit to 5 results

      const filteredServices = services
        .filter(service => 
          service.name?.toLowerCase().includes(searchTerm) ||
          service.description?.toLowerCase().includes(searchTerm) ||
          service.category?.toLowerCase().includes(searchTerm)
        )
        .map(service => ({
          ...service,
          type: 'service',
          displayName: service.name || 'Untitled Service',
          id: service.id || service._id // Ensure we have an ID
        }))
        .slice(0, 5); // Limit to 5 results

      // Combine and sort results
      const combinedResults = [...filteredProducts, ...filteredServices]
        .filter(item => item.id) // Only include items with valid IDs
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .slice(0, 8); // Total limit of 8 results

      console.log('Search results:', combinedResults);
      setSearchResults(combinedResults);
      setShowSearchResults(combinedResults.length > 0);
    } catch (error) {
      console.error('Error searching:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        // Clear all localStorage on session expiry
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
      } else {
        console.error('Search failed silently');
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms delay
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    console.log('Search result clicked:', result);
    
    setShowSearchResults(false);
    setSearchQuery('');
    
    try {
      if (result.type === 'product') {
        console.log('Navigating to product:', `/product/${result.id}`);
        navigate(`/product/${result.id}`);
      } else if (result.type === 'service') {
        console.log('Navigating to service:', `/service/${result.id}`);
        navigate(`/service/${result.id}`);
      } else {
        console.warn('Unknown result type:', result.type);
        // Fallback: navigate to products page with search
        navigate(`/products?search=${encodeURIComponent(result.displayName)}`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to item');
      // Fallback navigation
      navigate('/products');
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0]); // Navigate to first result
    } else if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  // UPDATED LOGOUT FUNCTION - Clears ALL localStorage data
  const handleLogout = () => {
    try {
      // Clear ALL local storage data
      localStorage.clear();
      
      // Clear session storage as well
      sessionStorage.clear();
      
      // Optional: Clear any cookies if you're using them
      // document.cookie.split(";").forEach((c) => {
      //   document.cookie = c
      //     .replace(/^ +/, "")
      //     .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      // });
      
      // Cancel any pending API requests if using axios cancel tokens
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login page
      navigate('/login');
      
      // Optional: Force page reload to ensure clean state
      // window.location.href = '/login';
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, still try to clear storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const ProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="relative">
          <img
            src={businessData.blogo}
            alt={businessData.bname}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              e.target.src = '/api/placeholder/40/40';
            }}
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium">{userName}</div>
          <div className="text-xs text-gray-500">{businessData.bname}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/ManageStore" className="flex items-center gap-2 w-full">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/notifications" className="flex items-center gap-2 w-full">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link to="#" className="flex items-center gap-2 w-full">
            <HelpCircle className="h-4 w-4" />
            <span>Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="w-full bg-white border-b border-gray-200 relative z-50">
      <div className="px-6 py-4">
        {/* Desktop and Tablet Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <h1 className="text-xl font-semibold text-gray-900 lg:pl-0 pl-12">{title}</h1>
            
            <div className="max-w-md flex-1 relative" ref={searchResultsRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search products and services..."
                  className="pl-10 pr-10 w-full bg-gray-50 border-gray-200"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-shrink-0">
                            {result.type === 'product' ? (
                              <Package className="h-5 w-5 text-purple-600" />
                            ) : (
                              <Briefcase className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.displayName}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {result.type} • {result.price ? `₦${result.price}` : 'Price not set'}
                            </p>
                          </div>
                          {result.image && (
                            <img
                              src={result.image}
                              alt={result.displayName}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      ))}
                      {searchQuery && (
                        <div 
                          onClick={() => {
                            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="p-3 text-center text-purple-600 hover:bg-purple-50 cursor-pointer border-t border-gray-100"
                        >
                          View all results for "{searchQuery}"
                        </div>
                      )}
                    </>
                  ) : searchQuery ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No products or services found for "{searchQuery}"</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          navigate('/products');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="mt-2 text-purple-600"
                      >
                        Browse all products
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-gray-600">{getCurrentDate()}</span>
            
            <Link to="/notifications" className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{userName}</div>
                <div className="text-xs text-gray-500">{businessData.bname}</div>
              </div>
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden flex items-center justify-between">
          <div className="w-full pl-12" ref={searchResultsRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-10 w-full bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Mobile Search Results */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 mx-4">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((result) => (
                      <div
                        key={`mobile-${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          {result.type === 'product' ? (
                            <Package className="h-4 w-4 text-purple-600" />
                          ) : (
                            <Briefcase className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.displayName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {result.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-gray-500">
                    No results found
                  </div>
                ) : null}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;