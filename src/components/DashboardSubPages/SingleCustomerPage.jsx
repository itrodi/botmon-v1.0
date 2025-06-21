import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Package, Instagram, MessageCircle, Download, ArrowLeft, DollarSign, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const SingleCustomerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    // Get customer data from navigation state
    if (location.state?.customer) {
      setCustomer(location.state.customer);
    } else {
      // If no customer data, redirect back to customers page
      toast.error('No customer data found');
      navigate('/customers');
    }
  }, [location, navigate]);

  if (!customer) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading customer details...</div>
      </div>
    );
  }

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Instagram':
        return 'text-pink-500';
      case 'WhatsApp':
        return 'text-green-500';
      case 'Messenger':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
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

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('confirmed') || statusLower.includes('accepted') || statusLower.includes('successful')) {
      return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower.includes('cancelled') || statusLower.includes('rejected')) {
      return 'bg-red-100 text-red-800';
    } else if (statusLower.includes('rescheduled')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const handleExportCustomer = () => {
    // Create detailed customer report
    const report = {
      customerInfo: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        platform: customer.platform,
        totalSpent: customer.transactionVolume,
        totalOrders: customer.completedOrders
      },
      transactions: customer.transactions || []
    };

    // Convert to JSON and download
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customer_${customer.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Customer data exported successfully');
  };

  // Calculate summary statistics using the raw total_price value
  const totalTransactions = customer.transactions?.length || 0;
  const successfulTransactions = customer.transactions?.filter(t => 
    t.status?.toLowerCase().includes('confirmed') || 
    t.status?.toLowerCase().includes('accepted') || 
    t.status?.toLowerCase().includes('successful')
  ).length || 0;
  
  // Use the raw total_price for calculations
  const averageOrderValue = totalTransactions > 0 
    ? (customer.total_price / totalTransactions).toFixed(2)
    : '0.00';

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="hidden lg:block w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <Header title="Customer Details" />

        {/* Main Content Area with Scroll */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/customers')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <h1 className="text-2xl font-semibold">Customer Details</h1>
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                onClick={handleExportCustomer}
              >
                <Download className="w-4 h-4" />
                Export Details
              </Button>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Details Section */}
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col items-center text-center mb-6">
                    <img 
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-24 h-24 rounded-full mb-4"
                    />
                    <h2 className="text-xl font-semibold">{customer.name}</h2>
                    <div className={`flex items-center gap-2 mt-2 ${getPlatformColor(customer.platform)}`}>
                      {getPlatformIcon(customer.platform)}
                      <span>{customer.platform}</span>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm break-all">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">ADDRESS</h3>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                </div>

                {/* Statistics Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">STATISTICS</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Total Spent</span>
                      </div>
                      <span className="font-semibold text-green-600">{customer.transactionVolume}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-gray-600">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Total Orders</span>
                      </div>
                      <span className="font-semibold">{customer.completedOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>Avg. Order Value</span>
                      </div>
                      <span className="font-semibold">${averageOrderValue}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3 text-purple-900">Customer Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Total Transactions</span>
                      <span className="font-medium text-purple-900">{totalTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Successful</span>
                      <span className="font-medium text-purple-900">{successfulTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Success Rate</span>
                      <span className="font-medium text-purple-900">
                        {totalTransactions > 0 
                          ? `${((successfulTransactions / totalTransactions) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Transaction History</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {customer.transactions && customer.transactions.length > 0 ? (
                      customer.transactions.map((transaction, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {transaction.name || 'Unknown Item'}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Type: {transaction.type || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(transaction.timestamp)}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-medium text-lg">
                                    ${transaction.price?.toFixed(2) || '0.00'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Qty: {transaction.quantity || 1}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                      {transaction.status || 'Unknown'}
                                    </span>
                                    {transaction.paid !== undefined && (
                                      <div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          transaction.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {transaction.paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No transactions found for this customer
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCustomerPage;