import React, { useState } from 'react';
import { Calendar as CalendarIcon, Download, Eye } from 'lucide-react';
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

const TransactionRow = ({ customerName, amount, status, product, onView, onDownload }) => (
  <tr className="border-b border-gray-100">
    <td className="py-4 px-4">
      <span className="font-medium">{customerName}</span>
    </td>
    <td className="py-4 px-4">
      <span className="font-medium">₦{amount.toLocaleString()}</span>
    </td>
    <td className="py-4 px-4">
      <span className={`
        px-3 py-1 rounded-full text-sm
        ${status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
        ${status === 'Successful' ? 'bg-green-100 text-green-800' : ''}
        ${status === 'Failed' ? 'bg-red-100 text-red-800' : ''}
      `}>
        {status}
      </span>
    </td>
    <td className="py-4 px-4">
      <span className="text-gray-600">{product}</span>
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" /> View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download
        </Button>
      </div>
    </td>
  </tr>
);

// Sample transaction data
const sampleTransactions = Array(50).fill(null).map((_, index) => ({
  id: index + 1,
  customerName: `Customer ${index + 1}`,
  amount: Math.floor(Math.random() * 1000000),
  status: ['Pending', 'Successful', 'Failed'][Math.floor(Math.random() * 3)],
  product: ['iPhone 14', 'MacBook Pro', 'AirPods', 'iPad'][Math.floor(Math.random() * 4)]
}));

const Payments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter transactions based on tab and date
  const filteredTransactions = sampleTransactions.filter(transaction => {
    if (activeTab === 'all') return true;
    return transaction.status.toLowerCase() === activeTab;
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
                  <h2 className="text-3xl font-semibold">₦45,231.89</h2>
                  <p className="text-sm text-green-600">+20.1% from last month</p>
                </div>
                <Button 
                  className="mt-4 bg-purple-600 text-white"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Withdraw
                </Button>
              </div>
              
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

            {/* Transactions Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Transactions</h2>
                <div className="flex flex-wrap gap-2">
                  <TabButton 
                    isActive={activeTab === 'all'} 
                    onClick={() => setActiveTab('all')}
                  >
                    All
                  </TabButton>
                  <TabButton 
                    isActive={activeTab === 'pending'} 
                    onClick={() => setActiveTab('pending')}
                  >
                    Pending
                  </TabButton>
                  <TabButton 
                    isActive={activeTab === 'successful'} 
                    onClick={() => setActiveTab('successful')}
                  >
                    Successful
                  </TabButton>
                  <TabButton 
                    isActive={activeTab === 'failed'} 
                    onClick={() => setActiveTab('failed')}
                  >
                    Failed
                  </TabButton>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Customer Name
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
                        customerName={transaction.customerName}
                        amount={transaction.amount}
                        status={transaction.status}
                        product={transaction.product}
                        onView={() => {}}
                        onDownload={() => {}}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
                              ? 'bg-purple-600 text-white'
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
            </div>
          </div>
        </main>
      </div>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <Input type="number" placeholder="Enter amount" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-600 text-white">
              Withdraw
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;