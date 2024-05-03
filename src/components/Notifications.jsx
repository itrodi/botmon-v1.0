import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  ChevronLeft,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const Notifications = () => {
  return (
    <Card>
            <CardHeader>
            <Link to="/Overview">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only mb-10">Back</span>
              </Button>
              </Link>
              <CardTitle>Notifications</CardTitle>
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
              <Separator className="my-4" />
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
              <Separator className="my-4" />
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
              <Separator className="my-4" />
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
              <Separator className="my-4" />
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
  )
}

export default Notifications