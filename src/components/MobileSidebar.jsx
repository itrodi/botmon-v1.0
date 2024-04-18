import React from 'react'
import { Link } from 'react-router-dom';
import {
  Bot,
  CreditCard,
  Home,
  LineChart,
  Mail,
  Package,
  Package2,
  PanelLeft,
  ShoppingCart,
  Users2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"


const MobileSidebar = () => {
  return (
    <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Botmon</span>
                </Link>
                <Link
                  to="/Overview"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Overview
                </Link>
                <Link
                  to="/Shop"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Shop
                </Link>
                <Link
                to="/Messages"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                >
                  <Mail className="h-5 w-5" />
                  Messages
                </Link>
                <Link
                  to="/Chatbot"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Bot className="h-5 w-5" />
                  Chatbot
                </Link>
                <Link
                  to="/Payments"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <CreditCard className="h-5 w-5" />
                 Payments
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
  )
}

export default MobileSidebar