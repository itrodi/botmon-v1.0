import React, { useState } from 'react';
import { Search, Instagram, Send, Paperclip, Smile, Image, Calendar, Mic, Pause, Menu, ArrowLeft } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from '../Sidebar';
import Header from '../Header';

const Messages = () => {
  const [showChatList, setShowChatList] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Toggle functions for mobile view
  const handleChatSelect = () => {
    setShowChatList(false);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setShowChat(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Messages" />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Chat List */}
          <div className={`w-full md:w-80 border-r bg-white flex-shrink-0 overflow-hidden flex flex-col
            ${(showChatList ? 'flex' : 'hidden')} md:flex`}>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-4">Chat List</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search" 
                  className="pl-9 bg-gray-50"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Chat List Items */}
              <div onClick={handleChatSelect} className="cursor-pointer md:cursor-default">
                <ChatItem 
                  name="Jennifer"
                  message="Do you have Iphone 13"
                  time="Just now"
                  avatar="https://ui-avatars.com/api/?name=Jennifer&background=f472b6&color=fff"
                  platform="instagram"
                  active={true}
                />
              </div>
              <ChatItem 
                name="Joe Tunde"
                message="I need a Macbook Pro"
                time="Just now"
                avatar="https://ui-avatars.com/api/?name=Joe+Tunde&background=22c55e&color=fff"
                platform="whatsapp"
              />
              <ChatItem 
                name="Tunji Olamide"
                message="Is google Pixel Available?"
                time="Just now"
                avatar="https://ui-avatars.com/api/?name=Tunji&background=3b82f6&color=fff"
                platform="facebook"
              />
              <ChatItem 
                name="Ahmad Garba"
                message="Hello"
                time="Just now"
                avatar="https://ui-avatars.com/api/?name=Ahmad&background=f472b6&color=fff"
                platform="instagram"
              />
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col bg-white
            ${(showChat ? 'flex' : 'hidden')} md:flex`}>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToList}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <img 
                      src="https://ui-avatars.com/api/?name=Jennifer&background=f472b6&color=fff"
                      alt="Jennifer"
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-medium">Jenifer</h3>
                    <div className="flex items-center gap-1 text-green-500 text-sm">
                      <span>Online</span>
                      <Instagram className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="hidden sm:flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  <span className="hidden lg:inline">Pause Chat Bot Automation</span>
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex gap-3">
                <img 
                  src="https://ui-avatars.com/api/?name=Jennifer&background=f472b6&color=fff"
                  alt="Jennifer"
                  className="w-10 h-10 rounded-full"
                />
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] sm:max-w-md">
                  <p>Hello, How may we help you?</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-purple-50 rounded-lg p-3 max-w-[80%] sm:max-w-md">
                  <p>I want to get an phone 14</p>
                </div>
              </div>

              <div className="flex gap-3">
                <img 
                  src="https://ui-avatars.com/api/?name=Jennifer&background=f472b6&color=fff"
                  alt="Jennifer"
                  className="w-10 h-10 rounded-full"
                />
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] sm:max-w-md">
                  <p>Alright, What space capacity do you need?</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-purple-50 rounded-lg p-3 max-w-[80%] sm:max-w-md">
                  <p>256GB Memory Space</p>
                </div>
              </div>

              <div className="flex justify-center">
                <img 
                  src="/api/placeholder/200/400"
                  alt="iPhone 14"
                  className="max-w-[150px] sm:max-w-[200px] rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                  <Mic className="w-5 h-5 text-gray-400 hidden sm:block" />
                  <Input 
                    placeholder="Type Something..." 
                    className="border-0 bg-transparent focus-visible:ring-0"
                  />
                  <div className="flex items-center gap-2 text-gray-400">
                    <button className="hover:text-gray-600">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="hover:text-gray-600 hidden sm:block">
                      <Image className="w-5 h-5" />
                    </button>
                    <button className="hover:text-gray-600 hidden sm:block">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button className="hover:text-gray-600 hidden sm:block">
                      <Calendar className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatItem = ({ name, message, time, avatar, platform, active }) => {
  const getPlatformIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'whatsapp':
        return <Instagram className="w-4 h-4 text-green-500" />;
      case 'facebook':
        return <Instagram className="w-4 h-4 text-blue-500" />;
      case 'twitter':
        return <Instagram className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 hover:bg-gray-50 ${active ? 'bg-purple-50' : ''}`}>
      <div className="relative">
        <img 
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full"
        />
        <span className="absolute -bottom-1 -right-1">
          {getPlatformIcon()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-gray-500 truncate">{message}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
};

export default Messages;