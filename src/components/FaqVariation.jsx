import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea  } from "@/components/ui/textarea"
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


const FaqVariation = () => {
  return (
    <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Add faq</DialogTitle>
      <DialogDescription>
        Create different questions and answers about your business
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
    <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Question
        </Label>
        <Textarea
                    id="content"
                    className="col-span-3 "
                  />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
         Answer
        </Label>
        <Textarea
                    id="content"
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

export default FaqVariation