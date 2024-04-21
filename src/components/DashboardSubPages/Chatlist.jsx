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
  import { Input } from "@/components/ui/input"
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import { Button } from "@/components/ui/button"
  import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
    
import {
    Card,
    CardDescription,
    CardFooter,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

const Chatlist = () => {
  return (
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
              className="w-full rounded-lg bg-background pl-8 sm:w-[300px] md:w-auto lg:w-[230px]"
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
  )
}

export default Chatlist