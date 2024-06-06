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

const AddCategories = () => {
  return (
    <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Add category</DialogTitle>
      <DialogDescription>
        Create New category for your product
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
    <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Category Name
        </Label>
        <Input
          id="name"
          defaultValue="laptops"
          className="col-span-3"
        />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
         Sub category Name
        </Label>
        <Input
          id="name"
          defaultValue="gaming laptops"
          className="col-span-3"
        />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Add</Button>
    </DialogFooter>
  </DialogContent>
  )
}

export default AddCategories