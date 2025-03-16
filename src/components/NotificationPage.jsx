import React, { useState } from 'react';
import { Calendar as CalendarIcon, User, BadgeCheck, MessageCircle, XCircle, ShoppingBag, DollarSign, Filter, Mail, MessageSquare, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import Sidebar from '../components/Sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import Header from '../components/Header';

const NotificationPage = () => {
  const [date, setDate] = useState(new Date());
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Notifications" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Today</h2>
                  <div className="flex items-center gap-2">
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
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      All
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                  {/* New Customer Notification */}
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-purple-100">
                      <img 
                        src="https://ui-avatars.com/api/?name=Ibrahim+Kabir&background=6d28d9&color=fff"
                        alt="Ibrahim Kabir"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">Ibrahim Kabir</h3>
                      <p className="text-gray-500 text-sm">New Customer</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 hidden sm:block">2 Minutes ago</span>
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>

                  {/* Successful Transaction Notification */}
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-green-100">
                      <img 
                        src="https://ui-avatars.com/api/?name=Joe+Tunji&background=22c55e&color=fff"
                        alt="Joe Tunji"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">Joe Tunji</h3>
                      <p className="text-gray-500 text-sm">Successful Transaction</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 hidden sm:block">2 Minutes ago</span>
                      <BadgeCheck className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  {/* New Chat Notification */}
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-yellow-100">
                      <img 
                        src="https://ui-avatars.com/api/?name=Joe+Tunji&background=eab308&color=fff"
                        alt="Joe Tunji"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">Joe Tunji</h3>
                      <p className="text-gray-500 text-sm">New Chat</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 hidden sm:block">2 Minutes ago</span>
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                  <h3 className="font-semibold">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-600" />
                        <span>Email</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span>SMS</span>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span>WhatsApp</span>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-purple-600" />
                        <span>Call</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationPage;