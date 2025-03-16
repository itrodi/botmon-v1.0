import React, { useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
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

const Orders = () => {
  const [date, setDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'successful', label: 'Successful' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleTrackOrder = () => {
    setShowTrackingModal(true);
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
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Filter by date
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
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  onClick={() => handleOrderClick({
                    id: '6HJ6838GJDB',
                    status: 'pending',
                    product: 'iPhone 14',
                    price: 1200,
                    quantity: 2,
                    customer: 'Samuel Emmanuel',
                    address: 'No 20, Palmgroove road, Lagos, Nigeria',
                    phone: '+234 807 382 7389'
                  })}
                  className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="relative mb-4">
                    <img 
                      src="/api/placeholder/400/300"
                      alt="Product"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
                      ${index % 2 === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {index % 2 === 0 ? 'Pending' : 'Successful'}
                    </span>
                  </div>
                  <h3 className="font-medium">iPhone 14</h3>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">5 Secs ago...</span>
                    <span className="font-medium">Samuel Emmanuel</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button variant="outline">Previous</Button>
                <Button variant="outline">Next</Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{' '}
                    <span className="font-medium">10</span> of{' '}
                    <span className="font-medium">20</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" className="w-8 h-8 p-0">1</Button>
                  <Button variant="outline" className="w-8 h-8 p-0">2</Button>
                  <Button variant="outline" className="w-8 h-8 p-0">3</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Product Details</span>
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
                <img 
                  src="/api/placeholder/400/300"
                  alt="Product"
                  className="w-full h-64 object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white/80"
                    onClick={() => setCurrentImageIndex(prev => Math.max(prev - 1, 0))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white/80"
                    onClick={() => setCurrentImageIndex(prev => prev + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {[0, 1, 2].map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors
                        ${currentImageIndex === index ? 'bg-purple-600' : 'bg-white'}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Price</h4>
                  <p className="text-lg font-semibold">${selectedOrder.price}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                  <p>{selectedOrder.quantity}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Transaction ID</h4>
                  <p>{selectedOrder.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-4">
                <h4 className="font-medium">Delivery Details</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    📍 {selectedOrder.address}
                  </p>
                  <p className="flex items-center gap-2">
                    👤 {selectedOrder.customer}
                  </p>
                  <p className="flex items-center gap-2">
                    📞 {selectedOrder.phone}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
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
                >
                  Cancel Order
                </Button>
                <Button className="flex-1 bg-purple-600 text-white">
                  Confirm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Tracking Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Tracking</span>
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
                <div className="h-8 w-8 rounded-full border-2 border-purple-600 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-purple-600">Packaging</p>
                </div>
              </div>
              <div className="relative flex items-center">
                <div className="h-8 w-8 rounded-full border-2 border-purple-200 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-purple-200" />
                </div>
                <div className="ml-4">
                  <p className="text-purple-200">In Transit</p>
                </div>
                <div className="absolute h-12 border-l-2 border-purple-200 left-4 -top-8 z-[-1]" />
              </div>
              <div className="relative flex items-center">
                <div className="h-8 w-8 rounded-full border-2 border-purple-200 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-purple-200" />
                </div>
                <div className="ml-4">
                  <p className="text-purple-200">Delivered</p>
                </div>
                <div className="absolute h-12 border-l-2 border-purple-200 left-4 -top-8 z-[-1]" />
              </div>
            </div>
            <Button className="w-full mt-8 bg-purple-600 text-white">
              Apply Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;