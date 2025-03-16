import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

const DetailRow = ({ label, value, bold }) => (
  <div className="flex justify-between py-2">
    <span className="text-gray-600">{label}</span>
    <span className={bold ? "font-semibold" : ""}>{value}</span>
  </div>
);

const DetailSection = ({ title, children }) => (
  <div className="border rounded-lg p-6 space-y-3">
    <h3 className="font-semibold text-lg mb-4">{title}</h3>
    {children}
  </div>
);

const TransactionDetails = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="p-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Order Oe31b70H</h1>
              <p className="text-gray-500">Date: November 23, 2023</p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Receipt
          </Button>
        </div>

        <div className="space-y-6">
          {/* Order Details */}
          <DetailSection title="Order Details">
            <DetailRow 
              label="Glimmer Lamps x 2"
              value="$250.00"
            />
            <DetailRow 
              label="Aqua Filters x 1"
              value="$49.00"
            />
            <div className="border-t mt-4 pt-4 space-y-3">
              <DetailRow 
                label="Subtotal"
                value="$299.00"
              />
              <DetailRow 
                label="Shipping"
                value="$5.00"
              />
              <DetailRow 
                label="Tax"
                value="$25.00"
              />
              <DetailRow 
                label="Total"
                value="$329.00"
                bold
              />
            </div>
          </DetailSection>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Information */}
            <DetailSection title="Shipping Information">
              <div className="space-y-2">
                <p className="font-medium">Liam Johnson</p>
                <p className="text-gray-600">1234 Main St.</p>
                <p className="text-gray-600">Anytown, CA 12345</p>
              </div>
            </DetailSection>

            {/* Billing Information */}
            <DetailSection title="Billing Information">
              <p className="text-gray-600">Same as shipping address</p>
            </DetailSection>
          </div>

          {/* Customer Details */}
          <DetailSection title="Customer Information">
            <DetailRow 
              label="Customer"
              value="Liam Johnson"
            />
            <DetailRow 
              label="Email"
              value="liam@acme.com"
            />
            <DetailRow 
              label="Phone"
              value="+1 234 567 890"
            />
          </DetailSection>

          {/* Payment Information */}
          <DetailSection title="Payment Information">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-blue-600 rounded"></div>
                <span>Visa ending in 4532</span>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Pending
              </span>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;