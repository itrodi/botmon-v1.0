import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Download, Eye, Loader2, RefreshCw, FileText, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { format } from "date-fns";
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const ITEMS_PER_PAGE = 10;

const TabButton = ({ isActive, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
      ${isActive 
        ? 'bg-purple-600 text-white' 
        : 'text-gray-600 hover:bg-purple-50'
      }`}
  >
    {children}
  </button>
);

const TransactionRow = ({ transaction, onView, onDownload }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Successful':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-4">
        <div title={`Name: ${transaction.actualName} | Email: ${transaction.email}`}>
          <span className="font-medium">{transaction.customerName}</span>
          {transaction.actualName && transaction.actualName !== 'Guest Customer' && (
            <p className="text-xs text-gray-500">{transaction.actualName}</p>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="font-medium">₦{transaction.amount.toLocaleString()}</span>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(transaction.status)}`}>
          {transaction.status}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className="text-gray-600">{transaction.product}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(transaction)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(transaction)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Receipt
          </Button>
        </div>
      </td>
    </tr>
  );
};

const Payments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [date, setDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Get token from localStorage (using 'token' to match Orders component)
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch('https://api.automation365.io/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          return;
        }
        throw new Error('Failed to fetch transactions');
      }

      const ordersData = await response.json();

      // Debug: Log first order to see data structure (remove in production)
      if (ordersData.length > 0) {
        console.log('Sample order data:', ordersData[0]);
      }

      // Transform orders to transactions format
      const transformedTransactions = ordersData.map(order => {
        // Map order status to transaction status
        let transactionStatus = 'Pending';
        if (order.status === 'Confirmed') {
          transactionStatus = 'Successful';
        } else if (order.status === 'Rejected') {
          transactionStatus = 'Failed';
        }

        // Get customer email (this will be displayed as the customer name)
        const customerEmail = order.email || order.customer_email || order.user_email || 
                             order.buyer_email || 'No email provided';

        // Get customer name for tooltip/additional info
        const customerName = order.name || order.customer_name || order.customer || 
                            order.user_name || order.buyer_name || order.client_name || 'Guest Customer';

        // Get phone from various possible fields
        const customerPhone = order.phone || order.customer_phone || order.mobile || 
                             order.contact || order.phone_number || 'No phone provided';

        // Determine platform (set default since backend doesn't provide this)
        const platform = order.platform || 'Multi-Platform';

        return {
          id: order.ids || order.id || order._id,
          customerName: customerEmail, // Using email as the customer name as requested
          actualName: customerName, // Keep actual name for tooltip
          amount: (parseFloat(order.price) || 0) * (parseInt(order.quantity) || 1),
          status: transactionStatus,
          product: order['product-name'] || order.product_name || order.product || 
                  order.item || order.item_name || order.name || order.pname || 'Product',
          platform: platform,
          email: customerEmail,
          phone: customerPhone,
          address: order.address || order.delivery_address || order.shipping_address || 
                  order.location || 'No address provided',
          quantity: parseInt(order.quantity) || 1,
          price: parseFloat(order.price) || 0,
          date: order.created_at || order.timestamp || order.date || order.order_date || new Date().toISOString(),
          orderStatus: order.status || 'Pending' // Keep original order status
        };
      });

      // Sort by date (newest first)
      transformedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(transformedTransactions);

      // Calculate balance (sum of successful transactions)
      const totalBalance = transformedTransactions
        .filter(t => t.status === 'Successful')
        .reduce((sum, t) => sum + t.amount, 0);
      setBalance(totalBalance);

    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on tab, date, and search term
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by status tab
    if (activeTab !== 'all' && transaction.status.toLowerCase() !== activeTab) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        (transaction.customerName || '').toLowerCase().includes(search) ||
        (transaction.actualName || '').toLowerCase().includes(search) ||
        (transaction.email || '').toLowerCase().includes(search) ||
        (transaction.product || '').toLowerCase().includes(search) ||
        (transaction.phone || '').toLowerCase().includes(search) ||
        (transaction.id || '').toLowerCase().includes(search);

      if (!matchesSearch) return false;
    }

    // Filter by selected date (if needed)
    const transactionDate = new Date(transaction.date);
    const selectedDate = new Date(date);
    if (format(transactionDate, 'yyyy-MM-dd') !== format(selectedDate, 'yyyy-MM-dd')) {
      // For now, we'll show all dates. You can uncomment this to filter by date
      // return false;
    }

    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const generatePDFReceipt = (transaction) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('TRANSACTION RECEIPT', 105, 20, { align: 'center' });

    // Company info (you can customize this)
    doc.setFontSize(12);
    doc.text('Automation365', 105, 30, { align: 'center' });
    doc.text('support@automation365.io', 105, 37, { align: 'center' });

    // Line separator
    doc.line(20, 45, 190, 45);

    // Receipt details
    doc.setFontSize(10);
    doc.text(`Receipt No: ${transaction.id}`, 20, 55);
    doc.text(`Date: ${format(new Date(transaction.date), 'PPP')}`, 20, 62);
    doc.text(`Status: ${transaction.status}`, 20, 69);

    // Customer details
    doc.setFontSize(12);
    doc.text('CUSTOMER DETAILS', 20, 85);
    doc.setFontSize(10);
    doc.text(`Name: ${transaction.actualName}`, 20, 95);
    doc.text(`Email: ${transaction.email}`, 20, 102);
    doc.text(`Phone: ${transaction.phone}`, 20, 109);
    doc.text(`Address: ${transaction.address}`, 20, 116);

    // Product details
    doc.setFontSize(12);
    doc.text('PRODUCT DETAILS', 20, 135);
    doc.setFontSize(10);
    doc.text(`Product: ${transaction.product}`, 20, 145);
    doc.text(`Platform: ${transaction.platform}`, 20, 152);
    doc.text(`Quantity: ${transaction.quantity}`, 20, 159);
    doc.text(`Unit Price: ₦${transaction.price.toLocaleString()}`, 20, 166);

    // Line separator
    doc.line(20, 175, 190, 175);

    // Total
    doc.setFontSize(14);
    doc.text(`TOTAL AMOUNT: ₦${transaction.amount.toLocaleString()}`, 20, 185);

    // Status indicator
    doc.setFontSize(10);
    if (transaction.status === 'Successful') {
      doc.setTextColor(0, 128, 0);
      doc.text('✓ Payment Successful', 20, 195);
    } else if (transaction.status === 'Failed') {
      doc.setTextColor(255, 0, 0);
      doc.text('✗ Payment Failed', 20, 195);
    } else {
      doc.setTextColor(255, 165, 0);
      doc.text('⏳ Payment Pending', 20, 195);
    }

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, 250, { align: 'center' });
    doc.text(`Generated on ${format(new Date(), 'PPP')}`, 105, 257, { align: 'center' });

    // Save the PDF
    doc.save(`receipt_${transaction.id}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast.success('Receipt downloaded successfully');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      // Here you would make an API call to process the withdrawal
      toast.success('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (error) {
      toast.error('Failed to process withdrawal');
    }
  };

  // Calculate stats
  const stats = {
    total: transactions.length,
    successful: transactions.filter(t => t.status === 'Successful').length,
    pending: transactions.filter(t => t.status === 'Pending').length,
    failed: transactions.filter(t => t.status === 'Failed').length,
  };

  // Calculate percentage change (mock data - you'd calculate this from actual historical data)
  const percentageChange = '+20.1%';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Payments" />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Balance and Filter Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm flex-1 w-full sm:w-auto sm:mr-4">
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Balance</span>
                  <h2 className="text-3xl font-semibold">₦{balance.toLocaleString()}</h2>
                  <p className="text-sm text-green-600">{percentageChange} from last month</p>
                </div>
                <Button 
                  className="mt-4 bg-purple-600 text-white hover:bg-purple-700"
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={balance === 0}
                >
                  Withdraw
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchTransactions}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {format(date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Transactions</h2>
                    <div className="flex gap-2 text-sm">
                      <span className="px-3 py-1 bg-gray-100 rounded-full">
                        Total: {stats.total}
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search by name, email, phone, product..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TabButton 
                    isActive={activeTab === 'all'} 
                    onClick={() => {
                      setActiveTab('all');
                      setCurrentPage(1);
                    }}
                  >
                    All ({stats.total})
                  </TabButton>
                  <TabButton 
                    isActive={activeTab === 'pending'} 
                    onClick={() => {
                      setActiveTab('pending');
                      setCurrentPage(1);
                    }}
                  >
                    Pending ({stats.pending})
                  </TabButton>
                  <TabButton 
                    isActive={activeTab === 'successful'} 
                    onClick={() => {
                      setActiveTab('successful');
                      setCurrentPage(1);
                    }}
                  >
                    Successful ({stats.successful})
                  </TabButton>
                  <TabButton 
                    isActive={activeTab === 'failed'} 
                    onClick={() => {
                      setActiveTab('failed');
                      setCurrentPage(1);
                    }}
                  >
                    Failed ({stats.failed})
                  </TabButton>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : paginatedTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm ? (
                    <div>
                      <p>No transactions found matching "{searchTerm}"</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchTerm('');
                          setCurrentPage(1);
                        }}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <p>No {activeTab === 'all' ? '' : activeTab} transactions found</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Customer
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Product
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTransactions.map((transaction) => (
                          <TransactionRow 
                            key={transaction.id}
                            transaction={transaction}
                            onView={handleViewDetails}
                            onDownload={generatePDFReceipt}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
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
                            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}
                            </span>{' '}
                            of <span className="font-medium">{filteredTransactions.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <Button
                              variant="outline"
                              className="rounded-l-md"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            {pageNumbers.map((number) => (
                              <Button
                                key={number}
                                variant={currentPage === number ? "default" : "outline"}
                                onClick={() => setCurrentPage(number)}
                                className={`${
                                  currentPage === number
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'text-gray-900'
                                }`}
                              >
                                {number}
                              </Button>
                            ))}
                            <Button
                              variant="outline"
                              className="rounded-r-md"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-sm">{selectedTransaction.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm">{format(new Date(selectedTransaction.date), 'PPP')}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Customer</label>
                <p className="text-sm">{selectedTransaction.actualName}</p>
                <p className="text-sm text-gray-500">{selectedTransaction.email}</p>
                <p className="text-sm text-gray-500">{selectedTransaction.phone}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Product Details</label>
                <p className="text-sm">{selectedTransaction.product}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {selectedTransaction.quantity} × ₦{selectedTransaction.price.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Total Amount</label>
                <p className="text-xl font-semibold">₦{selectedTransaction.amount.toLocaleString()}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${selectedTransaction.status === 'Successful' ? 'bg-green-100 text-green-800' : ''}
                  ${selectedTransaction.status === 'Failed' ? 'bg-red-100 text-red-800' : ''}
                  ${selectedTransaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                `}>
                  {selectedTransaction.status}
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            <Button 
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => {
                generatePDFReceipt(selectedTransaction);
                setShowDetailsModal(false);
              }}
            >
              Download Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Available Balance</label>
              <p className="text-2xl font-semibold">₦{balance.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bank Name</label>
              <Input value="First Bank" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Account Number</label>
              <Input value="0123456789" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Amount to Withdraw</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={balance}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowWithdrawModal(false);
              setWithdrawAmount('');
            }}>
              Cancel
            </Button>
            <Button 
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={handleWithdraw}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
            >
              Withdraw
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;