import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, PlusCircle, Facebook, Instagram, Upload, Package2, Search, Share2, Twitter, AlertTriangle, Trash2 } from "lucide-react"

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
import Header from '../Header';
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
      // Get the auth token from localStorage (adjust based on where you store it)
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('https://api.automation365.io/auth/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Success - show success message
      toast({
        title: "Account Deleted",
        description: "Your account and all related data have been permanently deleted.",
        variant: "default",
      });

      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to login or home page after a short delay
      setTimeout(() => {
        navigate('/login'); // Adjust the route as needed
      }, 2000);

    } catch (error) {
      console.error('Delete account error:', error);
      setDeleteError(error.message || 'An error occurred while deleting your account. Please try again.');
      setIsDeleting(false);
    }
  };

  // Function to close dialog and reset state
  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false);
    setConfirmText('');
    setDeleteError('');
    setIsDeleting(false);
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
            className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
          >
             <Link to="/ManageStore" >
              Business Details
            </Link>
            <Link to="/PersonalDetails" >Personal details</Link>
            <Link to="/StoreSetting" >Store settings</Link>
            <Link to="/Bank" >Payments</Link>
            <Link to="/Link">Connect Social channels</Link>
            <Link to="/Advance" className="font-semibold text-primary">Advance</Link>
          </nav>
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
              <div className="grid gap-3 ">
           <Label htmlFor="name">Samsung s7 edge lagos nigeria</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Signed in: 1st april 2024 15:04</div>
        <div className="ml-auto">
            <Switch id="Payments collection" />
            </div>
      
      </div>
          </div>
          <div className="grid gap-3 mt-4">
          <Label htmlFor="name">Chrome Abuja nigeria</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Signed in: 1st april 2024 15:04</div>
        <div className="ml-auto">
            <Switch id="Payments collection" />
            </div>
      
      </div>
          </div>
        
          <div className="grid gap-3 mt-4">
          <Label htmlFor="name">Iphone 12pro lagos nigeria</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Signed in: 1st april 2024 15:04</div>
        <div className="ml-auto">
            <Switch id="Payments collection" />
            </div>
      
      </div>
          </div>

          <div className="grid gap-3 mt-4">
          <Label htmlFor="name">Iphone 6s lagos nigeria</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Signed in: 1st april 2024 15:04</div>
        <div className="ml-auto">
            <Switch id="Payments collection" />
            </div>
      
      </div>
          </div>
              </CardContent>
              <CardFooter className=" px-6 py-4">
                <Button>Save Changes</Button>
              </CardFooter>
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
        </div>
      </main>
    </div>
  )
}

export default AdvanceSetting