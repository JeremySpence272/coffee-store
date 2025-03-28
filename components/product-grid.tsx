"use client";

import { useEffect, useState } from "react";
import { Coffee } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  price: number;
  price_id: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log("Fetching products from API...");
        const response = await fetch("http://localhost:8000/products");
        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch products: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Products fetched successfully:", data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(String(error));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleBuyCoffee = async (priceId: string) => {
    try {
      const response = await fetch("http://localhost:8000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price_id: priceId }),
      });

      if (!response.ok) throw new Error("Checkout failed");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error during checkout:", error);
      alert(
        "Sorry, there was an error processing your purchase. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mb-4"></div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
          <p className="font-semibold">Error fetching products:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {products.map((product) => (
          <Card
            key={product.id}
            className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow transition-shadow flex flex-col sm:w-full w-[80%] mx-auto"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-start gap-2 text-xl">
                <Coffee className="h-5 w-5 text-cyan-500 mt-1" />
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-2xl font-bold text-gray-800">
                ${product.price}
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                className="text-white w-full bg-cyan-500 hover:bg-cyan-600"
                onClick={() => handleBuyCoffee(product.price_id)}
              >
                Buy Coffee
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
