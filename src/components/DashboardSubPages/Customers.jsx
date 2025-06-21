import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronDown, Loader, Instagram, MessageCircle, Phone } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Sidebar from '../Sidebar';
import Header from '../Header';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const itemsPerPage = 10;

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers when search term changes
  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.get('https://api.automation365.io/customers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Process the response data - flatten all platforms into a single array
      const data = response.data;
      const allCustomers = [];

      // Process each platform
      ['Instagram', 'WhatsApp', 'Messenger'].forEach(platform => {
        if (data[platform] && Array.isArray(data[platform])) {
          data[platform].forEach(customer => {
            // Create a unique customer object that preserves all original data
            const customerData = {
              ...customer, // Keep all original fields including transactions
              platform,
              id: `${platform}-${customer.username}`, // Create unique ID
              name: customer.username || 'Unknown User',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.username || 'U')}&background=${getPlatformColor(platform)}&color=fff`,
              // Keep both formatted and raw values
              transactionVolume: `$${customer.total_price.toFixed(2)}`,
              total_price: customer.total_price, // Keep raw value for calculations
              completedOrders: customer.total_items,
              address: customer.address || 'No address provided',
              email: customer.email || 'No email provided',
              phone: customer.phone || 'No phone provided'
            };
            allCustomers.push(customerData);
          });
        }
      });

      // Sort by transaction volume (descending)
      allCustomers.sort((a, b) => b.total_price - a.total_price);

      setCustomers(allCustomers);
      setFilteredCustomers(allCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load customers');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Instagram':
        return 'E4405F';
      case 'WhatsApp':
        return '25D366';
      case 'Messenger':
        return '0084FF';
      default:
        return '6B7280';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-4 h-4" />;
      case 'WhatsApp':
        return <Phone className="w-4 h-4" />;
      case 'Messenger':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleCustomerClick = (customer) => {
    // Navigate to single customer page with complete customer data
    navigate(`/customer/${customer.id}`, { state: { customer } });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const currentPageCustomerIds = currentCustomers.map(c => c.id);
      setSelectedCustomers(currentPageCustomerIds);
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId, checked) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const handleExport = () => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Platform', 'Total Spent', 'Total Orders'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone,
        customer.address.replace(/,/g, ';'), // Replace commas in address
        customer.platform,
        customer.transactionVolume,
        customer.completedOrders
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Customer list exported successfully');
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Customers" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search customers..." 
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={fetchCustomers}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  onClick={handleExport}
                  disabled={filteredCustomers.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export List
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
                {/* No Customers Message */}
                {filteredCustomers.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      {searchTerm 
                        ? 'No customers found matching your search'
                        : 'No customers found'
                      }
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-4 text-left w-12">
                              <Checkbox 
                                checked={selectedCustomers.length === currentCustomers.length && currentCustomers.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            </th>
                            <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                Customer Name
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </th>
                            <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">Platform</th>
                            <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">Contact</th>
                            <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">Address</th>
                            <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                Total Spent
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </th>
                            <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">Orders</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {currentCustomers.map((customer) => (
                            <tr 
                              key={customer.id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleCustomerClick(customer)}
                            >
                              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                <Checkbox 
                                  checked={selectedCustomers.includes(customer.id)}
                                  onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked)}
                                />
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={customer.avatar} 
                                    alt={customer.name}
                                    className="w-10 h-10 rounded-full"
                                  />
                                  <span className="font-medium">{customer.name}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className={`text-${customer.platform === 'Instagram' ? 'pink-500' : customer.platform === 'WhatsApp' ? 'green-500' : 'blue-500'}`}>
                                    {getPlatformIcon(customer.platform)}
                                  </span>
                                  <span className="text-gray-600">{customer.platform}</span>
                                </div>
                              </td>
                              <td className="p-4 text-gray-600">
                                <div className="space-y-1">
                                  <div className="text-sm">{customer.email}</div>
                                  <div className="text-sm">{customer.phone}</div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-600 max-w-xs truncate">{customer.address}</td>
                              <td className="p-4">
                                <span className="text-green-600 font-medium">{customer.transactionVolume}</span>
                              </td>
                              <td className="p-4 text-gray-600">{customer.completedOrders}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
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
                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(endIndex, filteredCustomers.length)}</span> of{' '}
                                <span className="font-medium">{filteredCustomers.length}</span> customers
                              </p>
                            </div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                              <Button
                                variant="outline"
                                className="rounded-l-md"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`${
                                      currentPage === pageNum
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white z-10'
                                        : 'text-gray-900'
                                    } -ml-px`}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                              <Button
                                variant="outline"
                                className="rounded-r-md -ml-px"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </Button>
                            </nav>
                          </div>
                        </div>
                      )}
                    </div>
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

export default Customers;