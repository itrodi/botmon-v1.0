import React, { useState } from 'react';
import { Search, Download, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Sidebar from '../Sidebar';
import Header from '../Header';

const Customers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const customers = [
    {
      id: 1,
      name: "Nolan Rhiel Madsen",
      avatar: "https://ui-avatars.com/api/?name=Nolan+Rhiel&background=c7d2fe&color=3730a3",
      address: "4517 Washington Ave. Manchester",
      transactionVolume: "$106.58",
      completedOrders: 15
    },
    {
      id: 2,
      name: "Jordyn Levin",
      avatar: "https://ui-avatars.com/api/?name=Jordyn+Levin&background=bfdbfe&color=1e40af",
      address: "2118 Thornridge Cir. Syracuse",
      transactionVolume: "$710.68",
      completedOrders: 23
    },
    {
      id: 3,
      name: "Madelyn Siphron",
      avatar: "https://ui-avatars.com/api/?name=Madelyn+S&background=fecaca&color=991b1b",
      address: "2715 Ash Dr. San Jose, South Dakota",
      transactionVolume: "$293.01",
      completedOrders: 8
    },
    {
      id: 4,
      name: "Emerson Curtis",
      avatar: "https://ui-avatars.com/api/?name=Emerson+C&background=ddd6fe&color=5b21b6",
      address: "8502 Preston Rd. Inglewood, Maine",
      transactionVolume: "$169.43",
      completedOrders: 12
    },
    {
      id: 5,
      name: "Corey Bergson",
      avatar: "https://ui-avatars.com/api/?name=Corey+B&background=fbcfe8&color=9d174d",
      address: "3517 W. Gray St. Utica, Pennsylvania",
      transactionVolume: "$928.41",
      completedOrders: 31
    }
  ];

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

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
                  placeholder="Search Customer" 
                  className="pl-9 bg-white"
                />
              </div>
              <Button className="bg-purple-600 text-white flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export List
              </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left w-12">
                      <Checkbox />
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        Customer Name
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">Address</th>
                    <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        Transaction Volume
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="p-4 text-sm font-medium text-gray-600 text-left whitespace-nowrap">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <Checkbox />
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
                      <td className="p-4 text-gray-600">{customer.address}</td>
                      <td className="p-4">
                        <span className="text-green-600 font-medium">{customer.transactionVolume}</span>
                      </td>
                      <td className="p-4 text-gray-600">{customer.completedOrders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
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
                      <span className="font-medium">{Math.min(endIndex, customers.length)}</span> of{' '}
                      <span className="font-medium">{customers.length}</span> customers
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
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`${
                          currentPage === i + 1
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        {i + 1}
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
        </main>
      </div>
    </div>
  );
};

export default Customers;