import { Link } from 'react-router-dom';
import { CircleUser, Eye, Facebook, Instagram, Menu, Package2, Search, Share2, Twitter } from "lucide-react"

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


const PersonalDetails = () => {
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
            <Link to="/PersonalDetails" className="font-semibold text-primary">Personal details</Link>
            <Link href="#">Store settings</Link>
            <Link href="#">Bank Account</Link>
            <Link href="#">Connect Social channels</Link>
            <Link href="#">Advance</Link>
          </nav>
          <div className="grid gap-6">
   
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                 Edit your Personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
          <div className="grid gap-3">
            <Label htmlFor="name">First Name</Label>
            <Input
              id="Firstname"
              type="text"
              className="w-full"
              defaultValue="Enter Business Name"
            />
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">LastName</Label>
            <Input
              id="Lastname"
              type="text"
              className="w-full"
              defaultValue="okolo"
            />
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Phone Number</Label>
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
            <Label htmlFor="name">Email Address</Label>
            <Input
              id="Email"
              type="Email"
              className="w-full"
              defaultValue="inioluwaventures@gmail.com"
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

export default PersonalDetails