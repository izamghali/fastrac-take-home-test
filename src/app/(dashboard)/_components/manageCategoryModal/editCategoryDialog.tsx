'use client'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PiPencilSimpleLineFill } from "react-icons/pi";
import { EditCategoryForm } from "./editCategoryForm";
import { useState } from "react";

export function EditCatagoryDialog({gender, type, category,  getCategoryData, isSuper}:{isSuper:boolean, gender:string, type:string, category:string, getCategoryData: () => void}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={isSuper ? '' : 'hidden'}>
          <PiPencilSimpleLineFill className='text-gray-400 hover:text-black'/>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">

        <EditCategoryForm 
        gender={gender}
        type={type}
        category={category}
        getCategoryData={getCategoryData}
        setOpen={setOpen}
        />

      </DialogContent>
    </Dialog>
  )
}
