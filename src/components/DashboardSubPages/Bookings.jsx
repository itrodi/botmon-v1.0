import React, { useState } from 'react';
import { Search, CalendarIcon, X, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Sidebar from '../Sidebar';
import Header from '../Header';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [date, setDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [showRescheduleReason, setShowRescheduleReason] = useState(false);
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false);
  const [showTimeSelect, setShowTimeSelect] = useState(false);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'successful', label: 'Successful' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    setShowCancelReason(true);
  };

  const handleReschedule = () => {
    setShowRescheduleReason(true);
  };

  const handleRescheduleConfirm = () => {
    setShowRescheduleReason(false);
    setShowRescheduleCalendar(true);
  };

  const handleDateSelect = () => {
    setShowRescheduleCalendar(false);
    setShowTimeSelect(true);
  };

  return (
    <div className="h-screen flex">
      <Sidebar />
      
      <div className="flex-1">
        <Header title="Schedule" />

        <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search schedules..." 
                    className="pl-9 pr-4 w-full sm:w-64"
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

            {/* Tabs */}
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

            {/* Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <div
                  key={index}
                  onClick={() => handleScheduleClick({
                    id: index,
                    customer: "@Joe11",
                    email: "jenifer6372@gmail.com",
                    description: "Upgrade to the new iPhone today and experience the best of Apple technology",
                    date: "7th May, 2023",
                    time: "09:00"
                  })}
                  className="bg-white p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=Joe+${index}&background=6d28d9&color=fff`}
                      alt="Customer"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium">@Joe11</h3>
                      <p className="text-gray-500 text-sm">Today</p>
                    </div>
                  </div>
                  <h4 className="font-medium mb-2">Meeting Description</h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    Upgrade to the new iPhone today and experience the best of Apple technology
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> 09:00
                    </span>
                    <span>7th May, 2023</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{' '}
                    <span className="font-medium">6</span> of{' '}
                    <span className="font-medium">12</span> results
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-8 h-8 p-0">1</Button>
                  <Button variant="outline" className="w-8 h-8 p-0">2</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Details Modal */}
      {selectedSchedule && (
        <Dialog open={!!selectedSchedule} onOpenChange={() => setSelectedSchedule(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Accept Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                Are you sure you want to accept schedule from {selectedSchedule.email}?
              </p>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  className="text-red-600"
                  onClick={handleCancel}
                >
                  Reject
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleReschedule}
                >
                  Reschedule
                </Button>
                <Button className="bg-purple-600 text-white">
                  Accept
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Please confirm if you want to cancel your order
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirm(false)}
              >
                No
              </Button>
              <Button 
                className="bg-purple-600 text-white"
                onClick={handleCancelConfirm}
              >
                Yes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Reason Modal */}
      <Dialog open={showCancelReason} onOpenChange={setShowCancelReason}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reason For Cancel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              placeholder="Please provide a reason for cancelling your order"
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button className="bg-purple-600 text-white">
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Reason Modal */}
      <Dialog open={showRescheduleReason} onOpenChange={setShowRescheduleReason}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reason For Reschedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              placeholder="Please provide a reason for rescheduling"
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button 
                className="bg-purple-600 text-white"
                onClick={handleRescheduleConfirm}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Calendar Modal */}
      <Dialog open={showRescheduleCalendar} onOpenChange={setShowRescheduleCalendar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select New Date</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
                handleDateSelect();
              }}
              initialFocus
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Selection Modal */}
      <Dialog open={showTimeSelect} onOpenChange={setShowTimeSelect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Time</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant="outline"
                className="text-sm"
                onClick={() => setShowTimeSelect(false)}
              >
                {time}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;