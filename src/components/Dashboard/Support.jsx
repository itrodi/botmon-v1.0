import { Link } from 'react-router-dom';
import { 
  ShoppingCart,
  Package,
  ChevronLeft,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import Header from '../Header';
import { Button } from "@/components/ui/button"


export function Support () {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle>
        <Link to="/Overview">
              <Button variant="outline" size="icon" className="h-7 w-7 mr-4">
                <ChevronLeft className="h-4 w-4 " />
                <span className="sr-only mb-10">Back</span>
              </Button>
              </Link>Need help ?</CardTitle>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          Can't find answers to questions that you have our support team is on stand by to resolve your issues.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button>Get Support</Button>
      </CardFooter>
    </Card>

          
        </div>
      </main>
    </div>
  )
}

export default Support;
