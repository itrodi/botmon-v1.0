import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, PlusCircle, Facebook, Instagram, Upload, Package2, Search, Share2, Twitter } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Header from '../Header';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import DiscountsVariation from '../DiscountsVariation';
import EditDiscountVariation from '../EditDiscountVariation';

const StoreSettings = () => {
  // State for discounts
  const [discounts, setDiscounts] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  
  // State for notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: false,
    sms: false,
    whatsapp: false
  });
  
  // State for other settings
  const [otherSettings, setOtherSettings] = useState({
    payment: false,
    receipt: false
  });
  
  // State for loading states
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingOtherSettings, setSavingOtherSettings] = useState(false);
  const [deletingDiscount, setDeletingDiscount] = useState(false);

  // State for edit discount dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Fetch store settings
  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    setLoadingDiscounts(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }
  
      // Get discounts
      const discountsResponse = await axios.get('https://api.automation365.io/ssettings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (discountsResponse.data.discounts) {
        setDiscounts(discountsResponse.data.discounts);
      }
  
      // Get notification preferences
      if (discountsResponse.data.preferences) {
        setNotificationPrefs({
          email: discountsResponse.data.preferences.email || false,
          sms: discountsResponse.data.preferences.sms || false,
          whatsapp: discountsResponse.data.preferences.whatsapp || false
        });
      }
  
      // Get other settings
      if (discountsResponse.data.other) {
        setOtherSettings({
          payment: discountsResponse.data.other.payment || false,
          receipt: discountsResponse.data.other.receipt || false
        });
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
      toast.error('Failed to load store settings');
    } finally {
      setLoadingDiscounts(false);
    }
  };

  // Handle discount edit
  const handleEditDiscount = (discount) => {
    setSelectedDiscount(discount);
    setIsEditDialogOpen(true);
  };

  // Handle discount deletion
  const handleDeleteDiscount = async (id) => {
    setDeletingDiscount(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/delete-discount',
        {
          'discount-id': id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success === "Discount deleted successfully") {
        toast.success('Discount deleted successfully');
        // Update the local state
        setDiscounts(prev => prev.filter(discount => discount.id !== id));
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error(error.response?.data?.error || 'Failed to delete discount');
    } finally {
      setDeletingDiscount(false);
    }
  };

  // Handle notification preferences change
  const handleNotificationChange = (type) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Handle other settings change
  const handleOtherSettingChange = (type) => {
    setOtherSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Save notification preferences
  const saveNotificationPrefs = async () => {
    setSavingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/notification',
        {
          email: notificationPrefs.email,
          sms: notificationPrefs.sms,
          whatsapp: notificationPrefs.whatsapp
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data === "done") {
        toast.success('Notification preferences saved');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  const saveOtherSettings = async () => {
    setSavingOtherSettings(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }
  
      const response = await axios.post(
        'https://api.automation365.io/others',
        {
          payment: otherSettings.payment,
          receipt: otherSettings.receipt
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data === "done") {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSavingOtherSettings(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold"></h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
          >
            <Link to="/ManageStore" className="hover:text-purple-600 transition-colors">
              Business Details
            </Link>
            <Link to="/PersonalDetails" className="hover:text-purple-600 transition-colors">
              Personal details
            </Link>
            <Link to="/StoreSetting" className="font-semibold text-purple-600">
              Store settings
            </Link>
            <Link to="/Bank" className="hover:text-purple-600 transition-colors">
              Payments
            </Link>
            <Link to="/LinkAccount" className="hover:text-purple-600 transition-colors">
              Connect Social channels
            </Link>
            <Link to="#" className="hover:text-purple-600 transition-colors">
              Advance
            </Link>
          </nav>
          
          <div className="grid gap-6" id="discounts">
            {/* Discounts Card */}
            <Card>
              <CardHeader>
                <CardTitle>Discounts</CardTitle>
                <CardDescription>
                  Create Discounts or coupons for customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDiscounts ? (
                  <div className="flex justify-center p-4">
                    <p>Loading discounts...</p>
                  </div>
                ) : discounts.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No discounts found. Add your first discount.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Discount Name</TableHead>
                        <TableHead>Coupon</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discounts.map((discount) => (
                        <TableRow key={discount.id}>
                          <TableCell className="font-semibold">
                            {discount.name}
                          </TableCell>
                          <TableCell>{discount.coupon}</TableCell>
                          <TableCell>{discount.duration}</TableCell>
                          <TableCell>{discount.percent}%</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditDiscount(discount)}>
                                  Edit
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete this discount. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteDiscount(discount.id)}
                                        disabled={deletingDiscount}
                                      >
                                        {deletingDiscount ? 'Deleting...' : 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter className="justify-center border-t p-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      Create Discounts
                    </Button>
                  </DialogTrigger>
                  <DiscountsVariation onSuccess={fetchStoreSettings} />
                </Dialog>

                {/* Edit Discount Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  {selectedDiscount && (
                    <EditDiscountVariation 
                      discountId={selectedDiscount.id}
                      initialData={selectedDiscount}
                      onSuccess={fetchStoreSettings}
                      onClose={() => setIsEditDialogOpen(false)}
                    />
                  )}
                </Dialog>
              </CardFooter>
            </Card>
            
            {/* Notifications Card */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Enable or disable notification channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <img
                    src="/Images/email.png"
                    width={40}
                    height={40}
                    alt="Email"
                    className=""
                  />
                  <div>Email</div>
                  <div className="ml-auto">
                    <Switch 
                      id="email" 
                      checked={notificationPrefs.email}
                      onCheckedChange={() => handleNotificationChange('email')}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <img
                    src="/Images/sms.png"
                    width={40}
                    height={40}
                    alt="SMS"
                    className=""
                  />
                  <div>SMS</div>
                  <div className="ml-auto">
                    <Switch 
                      id="sms" 
                      checked={notificationPrefs.sms}
                      onCheckedChange={() => handleNotificationChange('sms')}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <img
                    src="/Images/whatsapp.png"
                    width={40}
                    height={40}
                    alt="WhatsApp"
                    className=""
                  />
                  <div>WhatsApp</div>
                  <div className="ml-auto">
                    <Switch 
                      id="whatsapp" 
                      checked={notificationPrefs.whatsapp}
                      onCheckedChange={() => handleNotificationChange('whatsapp')}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4">
                <Button 
                  onClick={saveNotificationPrefs}
                  disabled={savingNotifications}
                >
                  {savingNotifications ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Other Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Other Settings</CardTitle>
                <CardDescription>
                  Other store settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Label htmlFor="payment">Payments</Label>
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground">
                      Enable or disable online payments collection
                    </div>
                    <div className="ml-auto">
                      <Switch 
                        id="payment" 
                        checked={otherSettings.payment}
                        onCheckedChange={() => handleOtherSettingChange('payment')}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 mt-4">
                  <Label htmlFor="receipt">Receipts</Label>
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground">
                      Enable or disable automatic receipt generation for your customers
                    </div>
                    <div className="ml-auto">
                      <Switch 
                        id="receipt" 
                        checked={otherSettings.receipt}
                        onCheckedChange={() => handleOtherSettingChange('receipt')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4">
                <Button 
                  onClick={saveOtherSettings}
                  disabled={savingOtherSettings}
                >
                  {savingOtherSettings ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoreSettings;