"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // You could also add analytics tracking here
    console.log("Payment successful");
  }, []);

  return (
    <div className="container max-w-md mx-auto py-16">
      <Card className="border-green-100 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-green-600">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Your order has been processed successfully. You'll receive a
            confirmation email shortly.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => router.push("/")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Return to Store
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
