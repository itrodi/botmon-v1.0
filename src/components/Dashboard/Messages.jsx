import { Link } from 'react-router-dom';
import {
  Bird,
  Bell,
  Bot,
  Code2,
  CornerDownLeft,
  LifeBuoy,
  Mic,
  Paperclip,
  Rabbit,
  Search,
  Settings,
  Settings2,
  Share,
  SquareTerminal,
  SquareUser,
  Triangle,
  Turtle,
  ListFilter,
  Calendar,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Sidebar from "../Sidebar"
import MobileSidebar from "../MobileSidebar"
import { ScrollArea } from "../ui/scroll-area"
import {
  Card,
  CardDescription,
  CardFooter,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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



const Messages = () => {
return (
  
  <div className="grid h-screen w-full pl-[56px]">
    <Sidebar />
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
        <MobileSidebar />
        <h1 className="text-xl font-semibold">Messages</h1>
            <Link to="/Chats">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Settings className="size-4" />
              <span className="sr-only">Settings</span>
            </Button>
            </Link>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5 text-sm"
        >
          <Share className="size-3.5" />
          Share
        </Button>
      </header>
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          className="relative hidden flex-col items-start gap-8 md:flex" x-chunk="dashboard-03-chunk-0"
        >
          <form className="grid w-full items-start gap-6">
            <ScrollArea>
            
          <Card>
            <CardHeader>
              <CardTitle>Chat List</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
            <div className="flex">
            <div className="relative md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[180px] lg:w-[230px]"
            />
          </div>
          <Link to="/Notifications">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button  variant="outline" size="icon" className="ml-2">
            <ListFilter className="h-5 w-5" />
             <span className="sr-only">Toggle navigation menu</span>
         </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Facebook
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Whatsapp</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Instagram
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
         </DropdownMenu>
        </Link>
        <Link to="/Notifications">
          <Button  variant="outline" size="icon" className="ml-2">
            <Calendar className="h-5 w-5" />
             <span className="sr-only">Toggle navigation menu</span>
         </Button>
        </Link>
          </div>
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
                    Hello can i......
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
                    where can i.....
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
                    yes of course....
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
                    good when can i get ....
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
                    why can i not....
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">2 hours ago</div>
              </div>
            </CardContent>
          </Card>
            </ScrollArea>
          </form>
        </div>
        <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
          <Badge variant="outline" className="absolute right-3 top-3">
            Pause chatbot 
          </Badge>
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
                   Facebook
                  </p>
                </div>
              </div>
          <div className="mt-10">hello mate</div>
          <div className="flex-1" />
          
          <form
            className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring" x-chunk="dashboard-03-chunk-1"
          >
            
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="size-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Attach File</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Mic className="size-4" />
                    <span className="sr-only">Use Microphone</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Use Microphone</TooltipContent>
              </Tooltip>
              </TooltipProvider>
              <Button type="submit" size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>

)
}

export default Messages