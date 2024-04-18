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


const ServiceVariation = () => {
  return (
    <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Variant</DialogTitle>
      <DialogDescription>
        Create different size or color variation for your product.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
    <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          defaultValue="large"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
         Cost
        </Label>
        <Input
          id="username"
          defaultValue="0"
          className="col-span-3"
        />
        
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
         Img
        </Label>
         <button>
                      <img
                        alt="Product image"
                        className="aspect-square w-full rounded-md object-cover"
                        height="84"
                        src="/Images/testimage.png"
                        width="84"
                      />
                    </button>
        
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Add</Button>
    </DialogFooter>
  </DialogContent>
  )
}

export default ServiceVariation