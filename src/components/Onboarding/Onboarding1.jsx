import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, PlusCircle, Facebook, Instagram, Upload, Package2, Search, Share2, Twitter } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export function Onboarding1() {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Business Setup</h1>
            <p className="text-balance text-muted-foreground">
              Welcome Toyin, Lets setup your business
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
            <Label htmlFor="name">Logo</Label>
            <button className="flex aspect-square h-[100px] w-[100px] items-center justify-center rounded-md border border-dashed">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Upload</span>
              </button>
            </div>
            <div className="grid gap-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="Enter Business Name"
            />

            </div>
            <div className="grid gap-2">
            <Label htmlFor="name">Business Phone Number</Label>
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="+234"
            />
            </div>
            <div className="grid gap-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              defaultValue="Enter Business Description ."
              className="min-h-32"
            />
            </div>
            <div className="grid gap-2">
            <Label htmlFor="status">Category</Label>
            <Select>
              <SelectTrigger id="status" aria-label="Select business category">
                <SelectValue placeholder="Select business category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Clothing and Acessories</SelectItem>
                <SelectItem value="published">Electronics and Gadgets</SelectItem>
                <SelectItem value="archived">Freelancer</SelectItem>
                <SelectItem value="archived">food</SelectItem>
              </SelectContent>
            </Select>

            </div>
            <div className="flex items-center justify-center gap-2 ">
              <Link to="/">
              <Button variant="outline" size="sm">
                Back
              </Button>
              </Link>
              <Link to="/Onboarding2">
              <Button size="sm"> Next</Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Botmon
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Create an Account to start selling and offering your products and services  and manage your business more efficiently  .&rdquo;
              </p>
              <footer className="text-sm">Botmon</footer>
            </blockquote>
          </div>
        </div>
    </div>
  )
}

export default Onboarding1;