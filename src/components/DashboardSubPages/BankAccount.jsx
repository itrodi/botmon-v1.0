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


const BankAccount = () => {
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
            <Link to="/PersonalDetails">Personal details</Link>
            <Link to="/StoreSetting">Store settings</Link>
            <Link to="/Bank" className="font-semibold text-primary">Payments</Link>
            <Link to="/Link">Connect Social channels</Link>
            <Link to="/Advance" >Advance</Link>
          </nav>
          <div className="grid gap-6">
   
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Bank Account</CardTitle>
                <CardDescription>
                 Information from your bank accounts for payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
          
              </CardContent>
              <CardFooter className=" px-6 py-4">
                <Link to="/AddBank">
                <Button>Add Bank Account</Button>
                </Link>
              </CardFooter>
            </Card>
            
          </div>
        </div>
      </main>
    </div>

  )
}

export default BankAccount