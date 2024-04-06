import { Link } from 'react-router-dom';
import { 
  ShoppingCart,
  Package,
  Users,
} from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Header from '../Header';


export function Shop () {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Link to="/ProductPage">  
          <Card>
            <CardHeader className=" items-center  space-y-0 pb-2">       
               <Package className="h-10 w-10  font-bold" />
              <CardTitle className="text-2xl font-bold ">
                Products
              </CardTitle> 
            </CardHeader>
          </Card>
          </Link>
          <Link to="/Customers">
          <Card>
          <CardHeader className=" items-center  space-y-0 pb-2">       
               <Users className="h-10 w-10  font-bold" />
              <CardTitle className="text-2xl font-bold ">
                Customers
              </CardTitle> 
            </CardHeader>
          </Card>
          </Link>
          <Link to="/Orders">
          <Card>
          <CardHeader className=" items-center  space-y-0 pb-2">       
               <ShoppingCart className="h-10 w-10  font-bold" />
              <CardTitle className="text-2xl font-bold ">
                Orders
              </CardTitle> 
            </CardHeader>
          </Card>
          </Link>
          <Link to="/ServicesPage">
          <Card>
          <CardHeader className=" items-center  space-y-0 pb-2">       
               <Users className="h-10 w-10  font-bold" />
              <CardTitle className="text-2xl font-bold ">
               Services
              </CardTitle> 
            </CardHeader>
          </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Shop;
