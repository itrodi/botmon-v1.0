import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight } from 'lucide-react';

const Onboarding2 = () => {
  return (
    <div className="h-screen flex">
      {/* Left Section with gray background */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="font-bold text-xl">BOTMON</div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto space-y-8">
            <img 
              src="/api/placeholder/500/500"
              alt="Social Media Connection"
              className="w-full max-w-md"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Link Account</h1>
              <p className="text-gray-600">
                Kindly select your preferred social media platform to continue onboarding
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section with white background */}
      <div className="w-full md:w-1/2 bg-white flex flex-col">
        {/* Mobile Logo + Language Selector */}
        <div className="p-6 flex justify-between items-center md:justify-end">
          <div className="font-bold text-xl md:hidden">BOTMON</div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span>English</span>
          </div>
        </div>

        {/* Mobile Only Title */}
        <div className="md:hidden p-6 space-y-2">
          <h1 className="text-2xl font-bold">Link Account</h1>
          <p className="text-gray-600">
            Kindly select your preferred social media platform to continue onboarding
          </p>
        </div>

        {/* Social Media Links Section */}
        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {/* Facebook */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                  <img 
                    src="/api/placeholder/24/24"
                    alt="Facebook"
                    className="w-6 h-6"
                  />
                </div>
                <span className="font-medium">Link Facebook Account</span>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>

            {/* Twitter */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg">
                  <img 
                    src="/api/placeholder/24/24"
                    alt="Twitter"
                    className="w-6 h-6"
                  />
                </div>
                <span className="font-medium">Link Twitter Account</span>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>

            {/* Instagram */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-pink-50 rounded-lg">
                  <img 
                    src="/api/placeholder/24/24"
                    alt="Instagram"
                    className="w-6 h-6"
                  />
                </div>
                <span className="font-medium">Link Instagram Account</span>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-green-50 rounded-lg">
                  <img 
                    src="/api/placeholder/24/24"
                    alt="WhatsApp"
                    className="w-6 h-6"
                  />
                </div>
                <span className="font-medium">Link Whatsapp Account</span>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>

            {/* Continue Button */}
            <div className="pt-6">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding2;