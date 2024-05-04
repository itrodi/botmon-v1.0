import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

const Withdraw = () => {
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
          Bank
        </Label>
        <div className="w-full">
        <Select className="ml-auto">
                          <SelectTrigger
                            id="Bank"
                            aria-label="Select Bank"
                          >
                            <SelectValue placeholder="Select Bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="firstbank">oyetunji joshua|first bank</SelectItem>
                            <SelectItem value="access">
                            oyetunji joshua|Access Bank
                            </SelectItem>
                            <SelectItem value="gtb">
                            oyetunji joshua|GTB
                            </SelectItem>
                          </SelectContent>
              </Select>
     </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
         Amount
        </Label>
        <Input
          id="username"
          defaultValue=""
          className="ml-auto col-span-3"
        />

      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Withdraw</Button>
    </DialogFooter>
  </DialogContent>
  )
}

export default Withdraw