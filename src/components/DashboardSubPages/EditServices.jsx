import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Upload,
  MoreHorizontal,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import MobileSidebar from '../MobileSidebar';
import Sidebar from '../Sidebar';
import ServiceVariation from '../ServiceVariation';

export function EditServices() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
    <Sidebar />
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <MobileSidebar />
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <img
                src="/Images/testimage.png"
                width={36}
                height={36}
                alt="Avatar"
                className="overflow-hidden"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
          <div className="flex items-center gap-4">
            <Link to="/ProductPage">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            </Link>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Edit Services
            </h1>
            
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button variant="outline" size="sm">
                Discard
              </Button>
              <Button size="sm">Save Service</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                  <CardDescription>
                    Lipsum dolor sit amet, consectetur adipiscing elit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="name">Service Name</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        defaultValue="Enter Service Name"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="description">Service Description</Label>
                      <Textarea
                        id="description"
                        defaultValue="Enter Service Description."
                        className="min-h-32"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Label htmlFor="stock-1" className="sr-only">
                            Stock
                          </Label>
                          <Input
                            id="stock-1"
                            type="number"
                            defaultValue="100"
                            className="col-span-2"
                          />
                        </TableCell>
                      </TableRow>
                         </TableBody>
                         </Table>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="name">Product link</Label>
                      <Input
                        id="Productlink"
                        type="text"
                        className="w-full"
                        defaultValue="https://googledrive.com"
                      />
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Service variation</CardTitle>
                  <CardDescription>
                    Enter the properties for different variation of your products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead>Image</TableHead>
                        <TableHead className="w-[100px]">Name</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                      <TableCell >
                      <img
                        alt="Product image"
                        
                        height="50"
                        src="/Images/testimage.png"
                        width="50"
                      />
                        </TableCell>
                        <TableCell className="font-semibold">
                          Afro cut
                        </TableCell>
                        <TableCell>
                          <Label htmlFor="price-1" className="sr-only">
                            Price
                          </Label>
                          <div>99.99</div>
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
                      <TableCell >
                      <img
                        alt="Product image"
                        
                        height="50"
                        src="/Images/testimage.png"
                        width="50"
                      />
                        </TableCell>
                        <TableCell className="font-semibold">
                         Hair Carving
                        </TableCell>
                        <TableCell>
                          <Label htmlFor="price-2" className="sr-only">
                            Price
                          </Label>
                          <div>99.99</div>
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
                      <TableCell >
                      <img
                        alt="Product image"
                        
                        height="50"
                        src="/Images/testimage.png"
                        width="50"
                      />
                        </TableCell>
                        <TableCell className="font-semibold">
                         Hair dying
                        </TableCell>
                        <TableCell>
                          <Label htmlFor="price-3" className="sr-only">
                            Stock
                          </Label>
                          <div>99.99</div>
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
                    Add Variant
                  </Button>
                  </DialogTrigger>
           <ServiceVariation/>
  </Dialog>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Service Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="grid gap-3">
                      <Label htmlFor="category">Category</Label>
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
                    <div className="grid gap-3">
                      <Label htmlFor="subcategory">
                        Subcategory (optional)
                      </Label>
                      <Select>
                        <SelectTrigger
                          id="subcategory"
                          aria-label="Select subcategory"
                        >
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="t-shirts">T-Shirts</SelectItem>
                          <SelectItem value="hoodies">Hoodies</SelectItem>
                          <SelectItem value="sweatshirts">
                            Sweatshirts
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="status">Status</Label>
                      <Select>
                        <SelectTrigger id="status" aria-label="Select status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Service Images</CardTitle>
                  <CardDescription>
                    Lipsum dolor sit amet, consectetur adipiscing elit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <img
                      alt="Product image"
                      className="aspect-square w-full rounded-md object-cover"
                      height="300"
                      src="/Images/testimage.png"
                      width="300"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <button>
                        <img
                          alt="Product image"
                          className="aspect-square w-full rounded-md object-cover"
                          height="84"
                          src="/Images/testimage.png"
                          width="84"
                        />
                      </button>
                      <button>
                        <img
                          alt="Product image"
                          className="aspect-square w-full rounded-md object-cover"
                          height="84"
                          src="/Images/testimage.png"
                          width="84"
                        />
                      </button>
                      <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 md:hidden">
            <Button variant="outline" size="sm">
              Discard
            </Button>
            <Button size="sm">Save Service</Button>
          </div>
        </div>
      </main>
    </div>
  </div>
  )
}
export default EditServices;