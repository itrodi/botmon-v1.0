import React from 'react';
import { Instagram, Send } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';

const Message = ({ isUser, content, image }) => (
  <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
    <div className="relative">
      <img 
        src={image || "/api/placeholder/40/40"}
        alt="Profile"
        className="w-10 h-10 rounded-full"
      />
      {!isUser && (
        <div className="absolute -right-1 bottom-0">
          <Instagram className="w-4 h-4 text-pink-500" />
        </div>
      )}
    </div>
    <div className={`max-w-[70%] ${isUser ? 'bg-green-50' : 'bg-white'} p-3 rounded-lg shadow-sm`}>
      {!isUser && image && (
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">Jenifer</span>
          <span className="text-green-500 text-sm">Online</span>
        </div>
      )}
      <p className="text-gray-700">{content}</p>
    </div>
  </div>
);

const PermissionToggle = ({ title, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100">
    <div className="space-y-1">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <Switch checked={enabled} onCheckedChange={onChange} />
  </div>
);

const Chatbot = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Chat Bot" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b p-4">
                <Button variant="outline" className="text-purple-600">
                  Edit Chat Bot Template
                </Button>
              </div>
              
              <div className="h-[calc(100vh-300px)] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <Message 
                    image="/api/placeholder/40/40"
                    content="Hello, How may we help you?"
                  />
                  <Message 
                    isUser={true}
                    content="I want to get an phone 14"
                    image="/api/placeholder/40/40"
                  />
                  <Message 
                    image="/api/placeholder/40/40"
                    content="Alright, What space capacity do you need?"
                  />
                  <Message 
                    isUser={true}
                    content="256GB Memory Space"
                    image="/api/placeholder/40/40"
                  />
                  <div className="flex justify-center my-4">
                    <img 
                      src="/api/placeholder/200/400"
                      alt="iPhone 14"
                      className="max-w-[200px] rounded-lg shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type Something..."
                      className="flex-1"
                    />
                    <Button className="bg-purple-600 text-white px-8">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Set Permission</h2>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <PermissionToggle
                    title="Access Chat Bot Messages"
                    description="Whether new user can access bot messages and change bot settings"
                    enabled={true}
                  />
                  <PermissionToggle
                    title="Access Payment"
                    description="This confirms if user can have access to the payment feature on the dashboard."
                    enabled={true}
                  />
                  <PermissionToggle
                    title="Access Chat Bot Template"
                    description="Whether new user can access chatbot template page and settings"
                    enabled={false}
                  />
                  <PermissionToggle
                    title="Access Product Page"
                    description="Whether new user can access product page to perform actions like edit product, add product, and create product."
                    enabled={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chatbot;