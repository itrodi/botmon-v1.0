import React from 'react';
import { Mail, Phone, MapPin, Package, Instagram, Twitter, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Sidebar from '../Sidebar';
import Header from '../Header';

const SingleCustomerPage = () => {
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="hidden lg:block w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <Header title="Customers" />

        {/* Main Content Area with Scroll */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Customers Details</h1>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export List
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
                      src="https://ui-avatars.com/api/?name=Ahmad+Garba&background=f0fdf4&color=166534&size=128"
                      alt="Ahmad Garba"
                      className="w-24 h-24 rounded-full mb-4"
                    />
                    <h2 className="text-xl font-semibold">Ahmad Garba</h2>
                    <div className="flex items-center gap-3 text-gray-500 mt-2">
                      <Package className="w-4 h-4" />
                      <span>24 Products</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>ahmady012@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>+234 847 363 3738</span>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">ADDRESS</h3>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>No 20, Palmgroove road, Lagos, Nigeria</span>
                  </div>
                </div>

                {/* Social Media Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">OTHER DETAILS</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>24 Product</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span>@joe2023</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <span>@joe2023</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Transaction History</h3>
                  </div>
                  
                  <div className="divide-y">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <img 
                            src="/api/placeholder/50/50"
                            alt="Product"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">Laptop</h4>
                                <p className="text-sm text-gray-500">12th, May, 2023</p>
                              </div>
                              <div className="text-right">
                                <span className="font-medium">$300</span>
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Successful
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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