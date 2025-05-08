
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeToNewsletter } from "@/lib/supabase-blogs";

interface NewsletterFormProps {
  className?: string;
}

type FormValues = {
  email: string;
};

const NewsletterForm = ({ className }: NewsletterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await subscribeToNewsletter(data.email);
      
      if (response.alreadyConfirmed) {
        toast({
          title: "Already subscribed",
          description: "Your email is already confirmed for our newsletter.",
        });
      } else {
        toast({
          title: "Confirmation email sent",
          description: "Please check your email to confirm your subscription.",
        });
      }
      
      reset();
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription failed",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className={cn("relative", className)}
    >
      <Input
        type="email"
        placeholder="Enter your email"
        className="pr-16 h-12"
        {...register("email", { 
          required: "Email is required", 
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address"
          }
        })}
        aria-invalid={errors.email ? "true" : "false"}
      />
      
      <Button 
        type="submit" 
        size="sm" 
        disabled={isLoading}
        className="absolute right-1 top-1 bottom-1 h-auto"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        <span className="ml-1 hidden md:inline">Subscribe</span>
      </Button>
      
      {errors.email && (
        <p className="text-red-500 text-xs mt-1">
          {errors.email.message}
        </p>
      )}
    </form>
  );
};

export default NewsletterForm;
