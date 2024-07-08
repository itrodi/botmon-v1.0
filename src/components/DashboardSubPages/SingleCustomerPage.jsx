import { Link, useNavigate } from 'react-router-dom';
import {
  File,
  Home,
  LineChart,
  ListFilter,
  ArrowUpRight,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  PlusCircle,
  ShoppingCart,
  Users2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import MobileSidebar from '../MobileSidebar';
import Sidebar from '../Sidebar';

export function SingleCustomerPage() {

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
                  <Link to="/Overview">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/Shop">Shop</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/Customers">Customers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>View Customer</BreadcrumbPage>
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
                  src="/Public/Images/testimage.png"
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
              <Link to="/ManageStore">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              </Link>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export 
                  </span>
                </Button>
              </div>
            </div>
            </Tabs>
              <Card>
                <CardHeader>
                  
                </CardHeader>
                <CardContent>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Customer Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col items-start max-w-[549px]">
  <div className="self-stretch mt-8 w-full max-md:max-w-full">
    <div className="flex gap-5 max-md:flex-col max-md:gap-0">
      <div className="flex flex-col w-[19%] max-md:ml-0 max-md:w-full">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/77b3f86e123c4396a0c693f7dee92e9c988986d893f6053a52550453d3941f3a?apiKey=2c70127cfa78431083e64757115c9f8b&"
          className="shrink-0 max-w-full rounded-full aspect-square w-[100px] max-md:mt-6"
        />
      </div>
      <div className="flex flex-col ml-0 w-[81%] max-md:ml-0 max-md:w-full">
        <div className="flex flex-col self-stretch  my-auto max-md:mt-10 max-md:max-w-full">
          <div className="text-xl font-medium text-slate-900 max-md:max-w-full">
            Ahmad Garba
          </div>
          <div className="flex gap-2  mt-4 text-base text-neutral-400 max-md:flex-wrap">
            <div className="flex gap-1 justify-center whitespace-nowrap">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/465ef6195979eddd22307e6b5345501f607fd4ee318ec3d2ab9248e0a372dc1a?apiKey=2c70127cfa78431083e64757115c9f8b&"
                className="shrink-0 self-start w-5 aspect-square"
              />
              <h6>ahmady012@gmail.com</h6>
            </div>
            <div className="flex gap-1 justify-center">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/61339394ee84bca66148d37669457fba04042cbe551527eab3ea4a6e3db2502c?apiKey=2c70127cfa78431083e64757115c9f8b&"
                className="shrink-0 self-start w-5 aspect-square"
              />
              <div>09025100200 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="mt-12 text-base font-medium tracking-wider uppercase text-slate-900 max-md:mt-10">
    address
  </div>
  <div className="flex gap-5 justify-center pr-5 mt-6 text-base text-slate-900">
    <img
      loading="lazy"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/8054c7884b562a0d9d450099082f8c29c4b25af2986d0dd87cafec53a98bbaa9?apiKey=2c70127cfa78431083e64757115c9f8b&"
      className="shrink-0 self-start w-5 aspect-square"
    />
    <div>No 20, Palmgroove road, Lagos, Nigeria</div>
  </div>
  <div className="mt-10 text-base font-medium tracking-wider uppercase text-slate-900">
    other details
  </div>
  <div className="flex gap-5 justify-center pr-5 mt-6 text-base text-slate-900">
    <img
      loading="lazy"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/928c5183422172c7b73cc5017da82cbe98c409ba76b96163fa222b33d5a1857e?apiKey=2c70127cfa78431083e64757115c9f8b&"
      className="shrink-0 self-start w-5 aspect-square"
    />
    <div>24 Product</div>
  </div>
  <div className="flex gap-5 justify-between pr-5 mt-6 text-base whitespace-nowrap text-slate-900">
    <img
      loading="lazy"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/e8c18061c1749457df8ee19232955fcd7097fcc243f29f7f6c5c79782f6f3adc?apiKey=2c70127cfa78431083e64757115c9f8b&"
      className="shrink-0 self-start w-5 aspect-square"
    />
    <div>@joe2023</div>
  </div>
  <div className="flex gap-5 justify-center pr-5 mt-6 text-base whitespace-nowrap text-slate-900">
    <img
      loading="lazy"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/9f54e375c3a690ecb03ad3cf3f70f96497fa334db221da40944aed1c467976f6?apiKey=2c70127cfa78431083e64757115c9f8b&"
      className="shrink-0 self-start w-5 aspect-square"
    />
    <div>@joe2023</div>
  </div>
</div>
            </CardContent>
          </Card>
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="#">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden xl:table-column">
                      Type
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Status
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Iphone pro max</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        12th may 2022
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      Sale
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      <Badge className="text-xs" variant="outline">
                        Approved
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                      2023-06-23
                    </TableCell>
                    <TableCell className="text-right">₦250000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Mac book pro</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        10th april 2022
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      Refund
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      <Badge className="text-xs" variant="outline">
                        Declined
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                      2023-06-24
                    </TableCell>
                    <TableCell className="text-right">₦150000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">samsung s7 edge</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        1 april 2022
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      Subscription
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      <Badge className="text-xs" variant="outline">
                        Approved
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                      2023-06-25
                    </TableCell>
                    <TableCell className="text-right">₦350000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">ps5 pro</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        30th march 2022
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      Sale
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      <Badge className="text-xs" variant="outline">
                        Approved
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                      2023-06-26
                    </TableCell>
                    <TableCell className="text-right">₦450000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Air pod Max</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        22th march 2022
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      Sale
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      <Badge className="text-xs" variant="outline">
                        Approved
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                      2023-06-27
                    </TableCell>
                    <TableCell className="text-right">₦55000.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
                </CardContent>

              </Card>
        </main>
      </div>
    </div>
  )
}
export default SingleCustomerPage;