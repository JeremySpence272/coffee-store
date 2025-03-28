"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CancelPage() {
  const router = useRouter();

  useEffect(() => {
    console.log("Payment cancelled");
  }, []);

  return (
    <div className="container max-w-md mx-auto py-16">
      <Card className="border-red-100 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-red-600">
            Your order was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Your payment was cancelled and you have not been charged. If you
            experienced any issues during checkout, please try again.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            Return to Store
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
