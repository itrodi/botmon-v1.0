import { Link } from 'react-router-dom';
import { MoreHorizontal, PlusCircle, Facebook, Instagram, Upload, Package2, Search, Share2, Twitter } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import DiscountsVariation from '../DiscountsVariation';


const StoreSettings = () => {
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
            <Link to="/StoreSetting" className="font-semibold text-primary">Store settings</Link>
            <Link to="/Bank" >Payments</Link>
            <Link to="/LinkAccount">Connect Social channels</Link>
            <Link href="#">Advance</Link>
          </nav>
          <div className="grid gap-6" id="discounts">
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Discounts</CardTitle>
                <CardDescription>
                  Create Discounts or coupons for customers
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Discount Name</TableHead>
                          <TableHead className="w-[300px]">Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold">
                            Black friday
                          </TableCell>
                          <TableCell>
                            10th october 2024 
                          </TableCell>
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
                              <Link to="/EditProduct">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                          New customer
                          </TableCell>
                          <TableCell>
                            7 days
                          </TableCell>
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
                              <Link to="/EditProduct">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                           Flash sales
                          </TableCell>
                          <TableCell>
                             anytime
                          </TableCell>
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
                              <Link to="/EditProduct">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        </TableRow>
                      </TableBody>
               </Table>
              </CardContent>
              <CardFooter className="justify-center border-t p-4">
              <Dialog>
                 <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      Create Discounts
                    </Button>
                    </DialogTrigger>
             <DiscountsVariation/>
    </Dialog>
              </CardFooter>
            </Card>
            <Card x-chunk="dashboard-04-chunk-2">
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
              <div className="flex items-center gap-4">
              <img
                  src="/Images/whatsapp.png"
                  width={40}
                  height={40}
                  alt="Avatar"
                  className=""
                />
                <div>whatsapp</div>
                 <div className="ml-auto">
                  <Switch id="Whatsapp" />
                 </div>
              </div>
          
              </CardContent>
              <CardFooter className=" px-6 py-4">
                <Link to="/AddBank">
                <Button>Save Changes</Button>
                </Link>
              </CardFooter>
            </Card>
             
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Other Settings</CardTitle>
                <CardDescription>
                 other store settings
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid gap-3 ">
           <Label htmlFor="name">Payments</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Enable or disable online payments collection</div>
        <div className="ml-auto">
            <Switch id="Payments collection" />
            </div>
      
      </div>
          </div>
          <div className="grid gap-3 mt-4">
           <Label htmlFor="name">Receipts</Label>
            <div className="flex items-center gap-4 ">
         <div className="text-muted-foreground">Enable or disable automatic receipt generation for your customers</div>
        <div className="ml-auto">
            <Switch id="Receipts" />
            </div>
      
      </div>
          </div>
              </CardContent>
              <CardFooter className=" px-6 py-4">
                <Link to="/AddBank">
                <Button>Save Changes</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>

  )
}

export default StoreSettings