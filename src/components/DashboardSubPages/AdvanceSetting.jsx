import { API_BASE_URL } from '@/config/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, PlusCircle, Facebook, Instagram, Upload, Package2, Search, Share2, Twitter, AlertTriangle, Trash2, Loader2, Laptop } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import SettingsLayout from '../SettingsLayout';
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import DiscountsVariation from '../DiscountsVariation';


const AdvanceSetting = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Devices section state
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const formatSignedIn = (value) => {
    if (!value) return 'Sign-in time not recorded';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Sign-in time not recorded';
    return `Signed in: ${d.toLocaleString()}`;
  };

  useEffect(() => {
    let cancelled = false;
    const loadDevices = async () => {
      setDevicesLoading(true);
      setDevicesError('');
      try {
        const token = getAuthToken();
        if (!token) {
          if (!cancelled) setDevicesError('Please log in to view devices');
          return;
        }
        const response = await fetch(`${API_BASE_URL}/devices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error(`Failed to load devices (${response.status})`);
        }
        const data = await response.json();
        const list = Array.isArray(data?.devices) ? data.devices : [];
        if (!cancelled) setDevices(list);
      } catch (err) {
        if (!cancelled) setDevicesError(err.message || 'Failed to load devices');
      } finally {
        if (!cancelled) setDevicesLoading(false);
      }
    };
    loadDevices();
    return () => { cancelled = true; };
  }, []);

  const handleToggleDevice = async (device, nextActive) => {
    // Backend lookup key is the hashed device_id; the Mongo _id (returned as
    // `id`) is a sensible fallback while the backend response shape settles.
    const lookupKey = device.device_id || device.id;
    if (!lookupKey) return;

    setTogglingId(lookupKey);
    // Optimistic update so the switch feels responsive
    setDevices(prev => prev.map(d => (
      (d.device_id || d.id) === lookupKey ? { ...d, is_active: nextActive } : d
    )));

    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(`${API_BASE_URL}/devices/${encodeURIComponent(lookupKey)}/toggle`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: nextActive })
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || `Toggle failed (${response.status})`);
      }
      toast({
        title: nextActive ? 'Device enabled' : 'Device disabled',
        description: device.device_name || 'Device updated'
      });
    } catch (err) {
      // Revert on failure
      setDevices(prev => prev.map(d => (
        (d.device_id || d.id) === lookupKey ? { ...d, is_active: !nextActive } : d
      )));
      toast({
        variant: 'destructive',
        title: 'Could not update device',
        description: err.message || 'Please try again.'
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Helper function to get auth token from various possible storage keys
  const getAuthToken = () => {
    // Try multiple possible token storage keys
    const possibleKeys = ['authToken', 'token', 'auth_token', 'access_token', 'jwt', 'userToken'];
    
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token) {
        return token;
      }
    }
    
    // Check if token might be stored as part of a user object
    try {
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.token) {
          return user.token;
        }
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    
    return null;
  };

  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    // Clear any previous errors
    setDeleteError('');
    
    // Check if user has typed the confirmation text
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setDeleteError('Please type the confirmation text exactly as shown');
      return;
    }

    setIsDeleting(true);

    try {
      // Get the auth token using the helper function
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }


      const response = await fetch(API_BASE_URL + '/auth/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Add body if your backend expects any additional data
        body: JSON.stringify({}),
      });

      // First check if the response is JSON
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        // If not JSON, read as text
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response format');
      }

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('User account not found.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data.error || `Failed to delete account (Error ${response.status})`);
        }
      }

      // Success - show success message
      toast({
        title: "Account Deleted",
        description: "Your account and all related data have been permanently deleted.",
        variant: "default",
      });

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to login or home page after a short delay
      setTimeout(() => {
        navigate('/login'); // Adjust the route as needed
      }, 2000);

    } catch (error) {
      console.error('Delete account error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An error occurred while deleting your account.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check for network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setDeleteError(errorMessage);
      setIsDeleting(false);
      
      // Show error toast as well
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Function to close dialog and reset state
  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false);
    setConfirmText('');
    setDeleteError('');
    setIsDeleting(false);
  };

  // Debug function to check stored tokens (can be removed in production)
  const debugCheckTokens = () => {
    const token = getAuthToken();
    if (token) {
    }
  };

  // Call debug function when component mounts (remove in production)
  useState(() => {
    debugCheckTokens();
  }, []);

  return (
    <SettingsLayout title="Advance">
      <div className="grid gap-6" id="discounts">
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>2FA</CardTitle>
                <CardDescription>
                 Enable or disable two factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex items-center gap-4">
              <img
                  src="/Images/email.png"
                  width={40}
                  height={40}
                  alt="Avatar"
                  className=""
                />
                <div>Email</div>
                 <div className="ml-auto">
                  <Switch id="Whatsapp" />
                 </div>
              </div>
              <div className="flex items-center gap-4">
              <img
                  src="/Images/sms.png"
                  width={40}
                  height={40}
                  alt="Avatar"
                  className=""
                />
                <div>SMS</div>
                 <div className="ml-auto">
                  <Switch id="Whatsapp" />
                 </div>
              </div>
          
              </CardContent>
              <CardFooter className=" px-6 py-4">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
             
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Advance Notification Settings</CardTitle>
                <CardDescription>
                 some advance settings for your notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid gap-3 ">
           <Label htmlFor="name">Business Email</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Enable or disable if updates should be sent to your business email</div>
        <div className="ml-auto">
            <Switch id="Payments collection" />
            </div>
      
      </div>
          </div>
          <div className="grid gap-3 mt-4">
           <Label htmlFor="name">Personal email</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Enable or disable if updates should be sent to your Personal email</div>
        <div className="ml-auto">
            <Switch id="Receipts" />
            </div>
      
      </div>
          </div>
        
          <div className="grid gap-3 mt-4">
           <Label htmlFor="name">Business Phone number</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Enable or disable if updates should be sent to your business Phone number</div>
        <div className="ml-auto">
            <Switch id="Receipts" />
            </div>
      
      </div>
          </div>

          <div className="grid gap-3 mt-4">
           <Label htmlFor="name">Personal Phone number</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Enable or disable if updates should be sent to your Personal Phone number</div>
        <div className="ml-auto">
            <Switch id="Receipts" />
            </div>
      
      </div>
          </div>
              </CardContent>
              <CardFooter className=" px-6 py-4">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                 Click the button below to update your password
                </CardDescription>
              </CardHeader>
              <CardContent>
          
              </CardContent>
              <CardFooter className=" px-6 py-4">
                <Button>Change password</Button>
              </CardFooter>
            </Card>

            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Devices</CardTitle>
                <CardDescription>
                  Enable or disable devices your account is active on
                </CardDescription>
              </CardHeader>
              <CardContent>
                {devicesLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading devices…
                  </div>
                ) : devicesError ? (
                  <div className="text-sm text-destructive py-4">{devicesError}</div>
                ) : devices.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4">
                    No devices on record yet. They appear here after your next sign-in.
                  </div>
                ) : (
                  devices.map((device, index) => {
                    const lookupKey = device.device_id || device.id;
                    const label = [device.device_name || 'Unknown device', device.location]
                      .filter(Boolean)
                      .join(' — ');
                    const signedIn = formatSignedIn(device.signed_in_at || device.last_login);
                    return (
                      <div key={lookupKey || index} className={`grid gap-3 ${index === 0 ? '' : 'mt-4'}`}>
                        <Label htmlFor={`device-${lookupKey || index}`} className="flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-muted-foreground" />
                          {label}
                        </Label>
                        <div className="flex items-center gap-4">
                          <div className="text-muted-foreground text-sm">{signedIn}</div>
                          <div className="ml-auto flex items-center gap-2">
                            {togglingId === lookupKey && (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                              id={`device-${lookupKey || index}`}
                              checked={!!device.is_active}
                              onCheckedChange={(checked) => handleToggleDevice(device, checked)}
                              disabled={togglingId === lookupKey || !lookupKey}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Delete Account Section */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Deleting your account is permanent and cannot be undone. All your data, including business information, 
                    products, services, orders, and settings will be permanently deleted.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="px-6 py-4">
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Final Warning</AlertTitle>
                        <AlertDescription className="text-sm">
                          You are about to permanently delete:
                          <ul className="mt-2 ml-4 list-disc text-xs">
                            <li>Your business profile and settings</li>
                            <li>All products and services</li>
                            <li>Customer orders and history</li>
                            <li>Payment information</li>
                            <li>Social media connections</li>
                            <li>All other account data</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-delete">
                          Type <span className="font-mono font-semibold">DELETE MY ACCOUNT</span> to confirm
                        </Label>
                        <Input
                          id="confirm-delete"
                          placeholder="Type confirmation text here"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          disabled={isDeleting}
                        />
                        {deleteError && (
                          <p className="text-sm text-destructive">{deleteError}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={handleCloseDialog}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || confirmText !== 'DELETE MY ACCOUNT'}
                        className="gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Delete My Account
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
      </div>
    </SettingsLayout>
  )
}

export default AdvanceSetting
