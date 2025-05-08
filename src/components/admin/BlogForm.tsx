
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface BlogFormCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

const BlogFormCheckbox = ({ id, checked, onCheckedChange, label }: BlogFormCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2 mt-2">
      <Checkbox 
        id={id} 
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(!!checked)}
      />
      <label 
        htmlFor={id} 
        className="text-sm cursor-pointer">
        {label}
      </label>
    </div>
  );
};

export default BlogFormCheckbox;
