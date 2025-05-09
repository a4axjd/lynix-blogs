
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const SubscriptionConfirmed = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const status = searchParams.get("status") || "confirmed";
  
  const isAlreadyConfirmed = status === "already-confirmed";
  
  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto py-16 px-4">
        <div className="bg-background border rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-6">
            {isAlreadyConfirmed ? "Already Subscribed" : "Subscription Confirmed!"}
          </h1>
          
          <p className="text-lg mb-6">
            {isAlreadyConfirmed 
              ? `The email address ${email} is already subscribed to our newsletter.`
              : `Thank you for confirming your email address ${email}.`
            }
          </p>
          
          <p className="text-muted-foreground mb-8">
            {isAlreadyConfirmed 
              ? "You'll continue to receive our newsletter with the latest blog posts and updates."
              : "You will now receive our newsletter with updates about new blog posts."
            }
          </p>
          
          <Button asChild size="lg" className="mb-4">
            <Link to="/">Return to Homepage</Link>
          </Button>
          
          <div className="mt-6 text-muted-foreground text-sm">
            <p>Want to read our latest articles now?</p>
            <Link to="/blogs" className="text-primary hover:underline">
              Browse our blog
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionConfirmed;
