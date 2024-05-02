import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

const DiscountsVariation = () => {
  return (
    <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Add discounts</DialogTitle>
      <DialogDescription>
        Create various discounts for your products and services 
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
    <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Discount Name
        </Label>
        <Input
          id="name"
          defaultValue="large"
          className="ml-auto col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
         coupon
        </Label>
        <Input
          id="username"
          defaultValue="input a coupon code"
          className="ml-auto col-span-3"
        />

      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
         Duration
        </Label>
        <Select className="ml-auto col-span-4">
                          <SelectTrigger
                            id="Duration"
                            aria-label="duration"
                          >
                            <SelectValue placeholder="duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nigeria">1 day</SelectItem>
                            <SelectItem value="Ghana">
                              2 days
                            </SelectItem>
                            <SelectItem value="South Africa">
                              a week
                            </SelectItem>
                            <SelectItem value="Kenya">
                             a month
                            </SelectItem>
                          </SelectContent>
              </Select>
        
        
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
         discount percentage
        </Label>
        <Input
          id="username"
          defaultValue="15%"
          className="ml-auto col-span-3"
        />
        
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Add</Button>
    </DialogFooter>
  </DialogContent>
  )
}

export default DiscountsVariation