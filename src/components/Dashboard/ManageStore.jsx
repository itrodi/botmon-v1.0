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
import FaqVariation from '../FaqVariation';


const ManageStore = () => {
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
            <Link to="/ManageStore" className="font-semibold text-primary">
              Business Details
            </Link>
            <Link to="/PersonalDetails">Personal details</Link>
            <Link to="/StoreSetting">Store settings</Link>
            <Link to="/Bank">Payments</Link>
            <Link to="/LinkAccount">Connect Social channels</Link>
            <Link to="/AdvanceSettings">Advance</Link>
          </nav>
          <div className="grid gap-6">
   
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                 Edit your business information
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid gap-3">
            <Label htmlFor="name">Logo</Label>
            <button className="flex aspect-square h-[100px] w-[100px] items-center justify-center rounded-md border border-dashed">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Upload</span>
              </button>
          </div>
           <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Banner</Label>
            <button className="flex aspect-square h-[100px] w-[400px] items-center justify-center rounded-md border border-dashed">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Upload</span>
              </button>
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="Enter Business Name"
            />
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Business Phone Number</Label>
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="+2348185893"
            />
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Country</Label>
            <Select>
                          <SelectTrigger
                            id="Country"
                            aria-label="Select country"
                          >
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Ghana">
                              Ghana
                            </SelectItem>
                            <SelectItem value="South Africa">
                              South Africa
                            </SelectItem>
                            <SelectItem value="Kenya">
                              Kenya
                            </SelectItem>
                          </SelectContent>
              </Select>
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Business Email Address</Label>
            <Input
              id="Email"
              type="Email"
              className="w-full"
              defaultValue="inioluwaventures@gmail.com"
            />
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Business Address</Label>
            <Input
              id="Address"
              type="text"
              className="w-full"
              defaultValue="No 15 granger street"
            />
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Business Category</Label>
            <Select>
                          <SelectTrigger
                            id="category"
                            aria-label="Select category"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="electronics">
                              Electronics
                            </SelectItem>
                            <SelectItem value="accessories">
                              Accessories
                            </SelectItem>
                            <SelectItem value="DigitalProduct">
                              Digital product
                            </SelectItem>
                          </SelectContent>
                </Select>
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Default Currency</Label>
            <Select>
                          <SelectTrigger
                            id="Currency"
                            aria-label="Select Currency"
                          >
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nigeria">NGN</SelectItem>
                            <SelectItem value="Ghana">
                              Cedis
                            </SelectItem>
                            <SelectItem value="South Africa">
                              RWD
                            </SelectItem>
                            <SelectItem value="Kenya">
                              KES
                            </SelectItem>
                          </SelectContent>
              </Select>
          </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>
                  Please set the Day and Time which your business is usually Active
                </CardDescription>
              </CardHeader>
              <CardContent>
           <div className="grid gap-3 ">
           <Label htmlFor="name">Sunday</Label>
            <div className="flex items-center gap-4 ">
        <Label htmlFor="name" className="text-right ">
         Open
        </Label>
        <Input
          id="time"
          defaultValue="9:00"
          className="col-span-4 "
        />
         <Label htmlFor="name" className="text-right ">
          Close
        </Label>
        <Input
          id="time"
          defaultValue="18:00"
         className="col-span-4"
        />
        <div className="ml-5">
            <Switch id="Sunday" />
            </div>
      
      </div>
          </div>
           <div className="grid gap-3 mt-4 ">
           <Label htmlFor="name">Monday</Label>
            <div className="flex items-center gap-4 ">
        <Label htmlFor="name" className="text-right ">
         Open
        </Label>
        <Input
          id="time"
          defaultValue="9:00"
          className="col-span-4 "
        />
         <Label htmlFor="name" className="text-right ">
          Close
        </Label>
        <Input
          id="time"
          defaultValue="18:00"
         className="col-span-4"
        />
        <div className="ml-5">
            <Switch id="Sunday" />
            </div>
      
      </div>
          </div>
           <div className="grid gap-3 mt-4 ">
           <Label htmlFor="name">Tuesday</Label>
            <div className="flex items-center gap-4 ">
        <Label htmlFor="name" className="text-right ">
         Open
        </Label>
        <Input
          id="time"
          defaultValue="9:00"
          className="col-span-4 "
        />
         <Label htmlFor="name" className="text-right ">
          Close
        </Label>
        <Input
          id="time"
          defaultValue="18:00"
         className="col-span-4"
        />
        <div className="ml-5">
            <Switch id="Sunday" />
            </div>
      
      </div>
          </div>
            <div className="grid gap-3 mt-4 ">
           <Label htmlFor="name">Wednesday</Label>
            <div className="flex items-center gap-4 ">
        <Label htmlFor="name" className="text-right ">
         Open
        </Label>
        <Input
          id="time"
          defaultValue="9:00"
          className="col-span-4 "
        />
         <Label htmlFor="name" className="text-right ">
          Close
        </Label>
        <Input
          id="time"
          defaultValue="18:00"
         className="col-span-4"
        />
        <div className="ml-5">
            <Switch id="Sunday" />
            </div>
      
      </div>
          </div>
           <div className="grid gap-3 mt-4 ">
           <Label htmlFor="name">Thursday</Label>
            <div className="flex items-center gap-4 ">
        <Label htmlFor="name" className="text-right ">
         Open
        </Label>
        <Input
          id="time"
          defaultValue="9:00"
          className="col-span-4 "
        />
         <Label htmlFor="name" className="text-right ">
          Close
        </Label>
        <Input
          id="time"
          defaultValue="18:00"
         className="col-span-4"
        />
        <div className="ml-5">
            <Switch id="Sunday" />
            </div>
      
      </div>
          </div>
           <div className="grid gap-3 mt-4 ">
           <Label htmlFor="name">Friday</Label>
            <div className="flex items-center gap-4 ">
        <Label htmlFor="name" className="text-right ">
         Open
        </Label>
        <Input
          id="time"
          defaultValue="9:00"
          className="col-span-4 "
        />
         <Label htmlFor="name" className="text-right ">
          Close
        </Label>
        <Input
          id="time"
          defaultValue="18:00"
         className="col-span-4"
        />
        <div className="ml-5">
            <Switch id="Sunday" />
            </div>
      
      </div>
          </div>
           <div className="grid gap-3 mt-4 ">
           <Label htmlFor="name">Saturday</Label>
            <div className="flex items-center gap-4 ">
        <Label htmlFor="name" className="text-right ">
         Open
        </Label>
        <Input
          id="time"
          defaultValue="9:00"
          className="col-span-4 "
        />
         <Label htmlFor="name" className="text-right ">
          Close
        </Label>
        <Input
          id="time"
          defaultValue="18:00"
         className="col-span-4"
        />
        <div className="ml-5">
            <Switch id="Sunday" />
            </div>
      
      </div>
          </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Input questions and answers that your customers usually asks
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Question</TableHead>
                          <TableHead className="w-[300px]">Answer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold">
                            Do we deliver our product nationwide
                          </TableCell>
                          <TableCell>
                            Yes we do 
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
                          How long does it take for you to deliver orders
                          </TableCell>
                          <TableCell>
                            depending on your delivery plan if it is a normal delivery it comes in 3 days while express comes in 24hrs
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
                           How do i track my order
                          </TableCell>
                          <TableCell>
                            you can track your order with the order id on your receipt via our chatbot
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
                      Add Faq
                    </Button>
                    </DialogTrigger>
             <FaqVariation/>
    </Dialog>
              </CardFooter>
            </Card>
             <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Business Description and Socials</CardTitle>
                <CardDescription>
                  Edit business description and socials details
                </CardDescription>
              </CardHeader>
              <CardContent>
          <div className="grid gap-3">
            <Label htmlFor="name">Description</Label>
            <Textarea
                    id="content"
                    className="col-span-2"
                  />
          </div>
          <div className="grid gap-3 mt-5">
            <Label htmlFor="name">Social Media Handles</Label>
            <Instagram className="h-4 w-4" />
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="Enter instagram handle"
            />

  <Twitter className="h-4 w-4 mt-4" />
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="Enter twitter handle"
            />
         <Facebook className="h-4 w-4 mt-4" />
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="Enter Facebook handle"
            />
         <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 24 24">
    <path d="M 12.011719 2 C 6.5057187 2 2.0234844 6.478375 2.0214844 11.984375 C 2.0204844 13.744375 2.4814687 15.462563 3.3554688 16.976562 L 2 22 L 7.2324219 20.763672 C 8.6914219 21.559672 10.333859 21.977516 12.005859 21.978516 L 12.009766 21.978516 C 17.514766 21.978516 21.995047 17.499141 21.998047 11.994141 C 22.000047 9.3251406 20.962172 6.8157344 19.076172 4.9277344 C 17.190172 3.0407344 14.683719 2.001 12.011719 2 z M 12.009766 4 C 14.145766 4.001 16.153109 4.8337969 17.662109 6.3417969 C 19.171109 7.8517969 20.000047 9.8581875 19.998047 11.992188 C 19.996047 16.396187 16.413812 19.978516 12.007812 19.978516 C 10.674812 19.977516 9.3544062 19.642812 8.1914062 19.007812 L 7.5175781 18.640625 L 6.7734375 18.816406 L 4.8046875 19.28125 L 5.2851562 17.496094 L 5.5019531 16.695312 L 5.0878906 15.976562 C 4.3898906 14.768562 4.0204844 13.387375 4.0214844 11.984375 C 4.0234844 7.582375 7.6067656 4 12.009766 4 z M 8.4765625 7.375 C 8.3095625 7.375 8.0395469 7.4375 7.8105469 7.6875 C 7.5815469 7.9365 6.9355469 8.5395781 6.9355469 9.7675781 C 6.9355469 10.995578 7.8300781 12.182609 7.9550781 12.349609 C 8.0790781 12.515609 9.68175 15.115234 12.21875 16.115234 C 14.32675 16.946234 14.754891 16.782234 15.212891 16.740234 C 15.670891 16.699234 16.690438 16.137687 16.898438 15.554688 C 17.106437 14.971687 17.106922 14.470187 17.044922 14.367188 C 16.982922 14.263188 16.816406 14.201172 16.566406 14.076172 C 16.317406 13.951172 15.090328 13.348625 14.861328 13.265625 C 14.632328 13.182625 14.464828 13.140625 14.298828 13.390625 C 14.132828 13.640625 13.655766 14.201187 13.509766 14.367188 C 13.363766 14.534188 13.21875 14.556641 12.96875 14.431641 C 12.71875 14.305641 11.914938 14.041406 10.960938 13.191406 C 10.218937 12.530406 9.7182656 11.714844 9.5722656 11.464844 C 9.4272656 11.215844 9.5585938 11.079078 9.6835938 10.955078 C 9.7955938 10.843078 9.9316406 10.663578 10.056641 10.517578 C 10.180641 10.371578 10.223641 10.267562 10.306641 10.101562 C 10.389641 9.9355625 10.347156 9.7890625 10.285156 9.6640625 C 10.223156 9.5390625 9.737625 8.3065 9.515625 7.8125 C 9.328625 7.3975 9.131125 7.3878594 8.953125 7.3808594 C 8.808125 7.3748594 8.6425625 7.375 8.4765625 7.375 z"></path>
</svg>
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="Enter whatsapp number"
            />
          </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>

  )
}

export default ManageStore