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


const LinkAccount = () => {
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
            <Link to="/LinkAccount" className="font-semibold text-primary">Connect Social channels</Link>
            <Link href="#">Advance</Link>
          </nav>
          <div className="grid gap-6">
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <CardTitle>Link and Unlink Accounts</CardTitle>
                <CardDescription>
                 Link and unlink social media accounts
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
             
            
          </div>
        </div>
      </main>
    </div>

  )
}

export default LinkAccount