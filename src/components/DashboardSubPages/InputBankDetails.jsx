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


const InputBankDetails = () => {
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
            <Link href="#">Store settings</Link>
            <Link to="/Bank" className="font-semibold text-primary">Bank Account</Link>
            <Link href="#">Connect Social channels</Link>
            <Link href="#">Advance</Link>
          </nav>
          <div className="grid gap-6">
   
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Add Bank Account</CardTitle>
                <CardDescription>
                 Input bank details
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid gap-3 ">
            <Label htmlFor="name">Select Bank</Label>
            <Select>
                          <SelectTrigger
                            id="Banks"
                            aria-label="Select bank"
                          >
                            <SelectValue placeholder="Select Bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Access">Access Bank</SelectItem>
                            <SelectItem value="FirstBank">
                              First Bank
                            </SelectItem>
                            <SelectItem value="Zenith Bank">
                              Zenith 
                            </SelectItem>
                            <SelectItem value="Opay">
                              Opay digital services
                            </SelectItem>
                          </SelectContent>
              </Select>
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Bank Account Name</Label>
            <Input
              id="Firstname"
              type="text"
              className="w-full"
              defaultValue="Enter Account Name"
            />
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Bank Account Number</Label>
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="0067693542"
            />
          </div>
          <div className="grid gap-3 mt-4">
            <Label htmlFor="name">Bvn</Label>
            <Input
              id="Bvn"
              type="text"
              className="w-full"
              defaultValue="input bvn"
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

export default InputBankDetails