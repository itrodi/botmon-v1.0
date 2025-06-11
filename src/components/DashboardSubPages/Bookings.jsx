import React, { useState, useEffect } from 'react';
import { Search, CalendarIcon, X, Clock, Loader } from 'lucide-react';
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
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Bookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [date, setDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [showRescheduleReason, setShowRescheduleReason] = useState(false);
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false);
  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'rescheduled', label: 'Rescheduled' },
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  // Fetch bookings on component mount and when activeTab changes
  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookingsByTab();
  }, [activeTab, bookings, searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.get('https://api.automation365.io/bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Process the response data - ensure each booking has a platform
      const bookingsData = response.data || [];
      const processedBookings = bookingsData.map(booking => {
        // Determine platform based on the collection it came from
        let platform = booking.platform;
        if (!platform) {
          // You might need to adjust this based on your actual data structure
          if (booking.source === 'instagram') platform = 'Instagram';
          else if (booking.source === 'whatsapp') platform = 'Whatsapp';
          else if (booking.source === 'messenger') platform = 'Messenger';
          else platform = 'Unknown';
        }
        
        return {
          ...booking,
          platform,
          status: booking.status || 'Pending',
          // Ensure all required fields exist
          ids: booking.ids || booking.id || booking._id,
          email: booking.email || 'No email provided',
          'service-name': booking['service-name'] || booking.service_name || 'Service',
          date: booking.date || 'Not scheduled',
          time: booking.time || 'Not scheduled',
          description: booking.description || 'No description available'
        };
      });

      setBookings(processedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterBookingsByTab = () => {
    let filtered = [...bookings];

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(booking => {
        const status = booking.status?.toLowerCase();
        if (activeTab === 'pending') return !status || status === 'pending';
        if (activeTab === 'accepted') return status === 'accepted';
        if (activeTab === 'rescheduled') return status === 'rescheduled';
        return false;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking['service-name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.ids?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleScheduleClick = (booking) => {
    setSelectedSchedule(booking);
  };

  const handleAccept = async () => {
    if (!selectedSchedule) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/accept-bookings',
        {
          ids: selectedSchedule.ids,
          'service-name': selectedSchedule['service-name'],
          platform: selectedSchedule.platform,
          email: selectedSchedule.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'successful') {
        toast.success('Booking accepted successfully');
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.ids === selectedSchedule.ids 
              ? { ...booking, status: 'Accepted' }
              : booking
          )
        );
        setSelectedSchedule(null);
        // Optionally refresh bookings
        fetchBookings();
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error('Failed to accept booking');
    }
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    setShowCancelReason(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedSchedule) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/reject-bookings',
        {
          ids: selectedSchedule.ids,
          'service-name': selectedSchedule['service-name'],
          platform: selectedSchedule.platform,
          email: selectedSchedule.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'successful') {
        toast.success('Booking rejected successfully');
        // Remove from local state
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking.ids !== selectedSchedule.ids)
        );
        setShowCancelReason(false);
        setCancelReason('');
        setSelectedSchedule(null);
        // Optionally refresh bookings
        fetchBookings();
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
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

  const handleTimeSelect = async (time) => {
    setSelectedTime(time);
    
    if (!selectedSchedule) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      const response = await axios.post(
        'https://api.automation365.io/reschedule-bookings',
        {
          ids: selectedSchedule.ids,
          'service-name': selectedSchedule['service-name'],
          platform: selectedSchedule.platform,
          email: selectedSchedule.email,
          date: formattedDate,
          time: time
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'successful') {
        toast.success('Booking rescheduled successfully');
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.ids === selectedSchedule.ids 
              ? { ...booking, status: 'Rescheduled', date: formattedDate, time: time }
              : booking
          )
        );
        setShowTimeSelect(false);
        setRescheduleReason('');
        setSelectedSchedule(null);
        // Optionally refresh bookings
        fetchBookings();
      }
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast.error('Failed to reschedule booking');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    switch (statusLower) {
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'rescheduled':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getPlatformIcon = (platform) => {
    // You can add platform-specific icons here
    return platform?.substring(0, 1).toUpperCase() || 'B';
  };

  return (
    <div className="h-screen flex">
      <Sidebar />
      
      <div className="flex-1">
        <Header title="Bookings" />

        <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search bookings..." 
                    className="pl-9 pr-4 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={fetchBookings}
                >
                  Refresh
                </Button>
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

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* No Bookings Message */}
                {filteredBookings.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      {searchTerm 
                        ? 'No bookings found matching your search'
                        : `No ${activeTab === 'all' ? '' : activeTab} bookings found`
                      }
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Bookings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredBookings.map((booking) => (
                        <div
                          key={booking.ids}
                          onClick={() => handleScheduleClick(booking)}
                          className="bg-white p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                                {getPlatformIcon(booking.platform)}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{booking.email}</h3>
                                <p className="text-xs text-gray-500">{booking.platform}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status || 'Pending'}
                            </span>
                          </div>
                          
                          <h4 className="font-medium mb-2 text-gray-900">{booking['service-name']}</h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {booking.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {booking.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" /> {booking.date}
                            </span>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              Booking ID: {booking.ids}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Details Modal */}
      {selectedSchedule && (
        <Dialog open={!!selectedSchedule} onOpenChange={() => setSelectedSchedule(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {selectedSchedule.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Service:</span> {selectedSchedule['service-name']}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Platform:</span> {selectedSchedule.platform}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> {selectedSchedule.status || 'Pending'}
                </p>
              </div>
              
              {(!selectedSchedule.status || selectedSchedule.status === 'Pending') && (
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50"
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
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleAccept}
                  >
                    Accept
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Are you sure you want to reject this booking?
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirm(false)}
              >
                No
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancelConfirm}
              >
                Yes, Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Reason Modal */}
      <Dialog open={showCancelReason} onOpenChange={setShowCancelReason}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              placeholder="Please provide a reason for rejecting this booking (optional)"
              className="min-h-[100px]"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowCancelReason(false);
                  setCancelReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleRejectSubmit}
              >
                Reject Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Reason Modal */}
      <Dialog open={showRescheduleReason} onOpenChange={setShowRescheduleReason}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reason for Reschedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              placeholder="Please provide a reason for rescheduling (optional)"
              className="min-h-[100px]"
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowRescheduleReason(false);
                  setRescheduleReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
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
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  handleDateSelect();
                }
              }}
              disabled={(date) => date < new Date()}
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
                className="text-sm hover:bg-purple-50 hover:text-purple-600"
                onClick={() => handleTimeSelect(time)}
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