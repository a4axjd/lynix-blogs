
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

const SubscriptionError = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "unknown";
  
  let errorTitle = "Verification Error";
  let errorMessage = "Something went wrong while verifying your subscription.";
  
  switch(reason) {
    case "invalid-token":
      errorTitle = "Invalid Verification Link";
      errorMessage = "The verification link is invalid or has expired.";
      break;
    case "invalid-subscription":
      errorTitle = "Subscription Not Found";
      errorMessage = "We couldn't find your subscription. The link may be invalid or expired.";
      break;
    case "update-failed":
      errorTitle = "Confirmation Failed";
      errorMessage = "There was a problem confirming your subscription.";
      break;
    case "server-error":
      errorTitle = "Server Error";
      errorMessage = "There was a server error processing your request. Please try again later.";
      break;
  }
  
  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto py-16 px-4">
        <div className="bg-background border rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-6">{errorTitle}</h1>
          
          <p className="text-lg mb-8">{errorMessage}</p>
          
          <div className="mb-8">
            <p className="font-medium mb-4">Would you like to try subscribing again?</p>
            <NewsletterForm className="max-w-md mx-auto" />
          </div>
          
          <Button asChild variant="outline" size="lg" className="mt-4">
            <Link to="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionError;
