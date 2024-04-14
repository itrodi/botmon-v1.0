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
        <CardTitle>Link Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
        <div className="flex items-center gap-4">
              <img
                  src="/Images/testimage.png"
                  width={32}
                  height={32}
                  alt="Avatar"
                  className="overflow-hidden"
                />
                <div className="ml-auto text-sm text-muted-foreground">Link Facebook Account</div>
              </div>
              <div className="flex items-center gap-4">
              <img
                  src="/Images/testimage.png"
                  width={32}
                  height={32}
                  alt="Avatar"
                  className="overflow-hidden"
                />
                <div className="ml-auto text-sm text-muted-foreground">Link Twitter Account</div>
              </div>
              <div className="flex items-center gap-4">
              <img
                  src="/Images/testimage.png"
                  width={32}
                  height={32}
                  alt="Avatar"
                  className="overflow-hidden"
                />
                <div className="ml-auto text-sm text-muted-foreground">Link Instagram Account</div>
              </div>
              <div className="flex items-center gap-4">
              <img
                  src="/Images/testimage.png"
                  width={32}
                  height={32}
                  alt="Avatar"
                  className="overflow-hidden"
                />
                <div className="ml-auto text-sm  text-muted-foreground">Link Whatsapp Account</div>
              </div>
          
          
          <div className="flex items-center justify-center gap-2 ">
             <Link to="/Onboarding1">
              <Button variant="outline" size="sm">
                Back
              </Button>
              </Link>
              <Link to="/Overview">
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