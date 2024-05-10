import { Link } from 'react-router-dom';
import {
  Activity,
  ListFilter,
  CreditCard,
  DollarSign,
  Users,
  Zap,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Header from '../Header';
import OverviewData from '../Overviewdata';


export function Overview() {
  return (
    <div className="flex min-h-screen w-full flex-col">
       <div>
        <Header />
        </div>
       
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="ml-auto flex items-center gap-2">
      <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      <span className=" sm:whitespace-nowrap">
                        Quick Actions
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                   <Link to="/ProductPage"> 
                    <DropdownMenuCheckboxItem>
                      View Products
                    </DropdownMenuCheckboxItem>
                    </Link>
                    <Link to="/ServicesPage"> 
                    <DropdownMenuCheckboxItem>View Services</DropdownMenuCheckboxItem>
                    </Link>
                    <Link to="/Customers">
                    <DropdownMenuCheckboxItem>
                      View Customers
                    </DropdownMenuCheckboxItem>
                    </Link>
                    <Link to="/Orders">
                    <DropdownMenuCheckboxItem>
                      View Orders
                    </DropdownMenuCheckboxItem>
                    </Link>
                    <Link to="/Bookings">
                    <DropdownMenuCheckboxItem>
                      View Bookings
                    </DropdownMenuCheckboxItem>
                    </Link>
                    <Link to="/StoreSetting/#discounts">
                    <DropdownMenuCheckboxItem>
                     Manage Discount
                    </DropdownMenuCheckboxItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">   
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscriptions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total visits</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>
       
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Overview</CardTitle>                
              </div>
            </CardHeader>
            <CardContent>
              <OverviewData />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia Martin
                  </p>
                  <p className="text-sm text-muted-foreground">
                    New Customer
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">2 minutes ago</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/02.png" alt="Avatar" />
                  <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sucessful transaction
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">15 minutes ago</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/03.png" alt="Avatar" />
                  <AvatarFallback>IN</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella Nguyen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    New chat
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">30 minutes ago</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/04.png" alt="Avatar" />
                  <AvatarFallback>WK</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Unsucessful Transaction
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">1 hour ago</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/05.png" alt="Avatar" />
                  <AvatarFallback>SD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    New Order
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">2 hours ago</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Overview;
