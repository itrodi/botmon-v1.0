import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"



const Onboarding1 = () => {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className=" ">
        <Card>
      <CardHeader>
        <CardTitle>Business Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
      <div className="flex gap-5 max-md:flex-col max-md:gap-0">
      <div className="flex flex-col w-[19%] max-md:ml-0 max-md:w-full">
      <img
                  src="/Images/testimage.png"
                  width={50}
                  height={50}
                  alt="Avatar"
                  className="overflow-hidden"
                />
      </div>
      <div className="flex flex-col ml-0 w-[81%] max-md:ml-0 max-md:w-full">
        <div className="flex flex-col self-stretch  my-auto max-md:mt-10 max-md:max-w-full">
          <div className="text-lg font-medium text-slate-900 max-md:max-w-full">
            Upload logo
          </div>
          <div className="flex gap-2  mt-4 text-base text-neutral-400 max-md:flex-wrap">
            <div className="flex gap-1 justify-center whitespace-nowrap">
              
            <Button size="sm" variant="outline" className="h-8 gap-1">
                    <span className=" xl:not-sr-only xl:whitespace-nowrap">
                    Upload Image
                    </span>
                  </Button>
            </div>
            <div className="flex gap-1 justify-center">
            <Button size="sm" variant="outline" className="h-8 gap-1">
                    <span className=" xl:not-sr-only xl:whitespace-nowrap">
                    Remove
                    </span>
                  </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
          <div className="grid gap-3">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              type="text"
              className="w-full"
              defaultValue="Enter Business Name"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              defaultValue="Enter Business Description ."
              className="min-h-32"
            />
          </div>
          <div className="grid gap-3">
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
      </CardContent>
    </Card>
  
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
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than
              ever before.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
  </div>
  )
}

export default Onboarding1