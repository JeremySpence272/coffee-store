"use client"

import { useState } from "react"
import { Coffee, LayoutDashboard } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductsTab from "@/components/admin/products-tab"
import OrdersTab from "@/components/admin/orders-tab"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products")

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Storefront
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Tabs defaultValue="products" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="products">Manage Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="products">
              <ProductsTab />
            </TabsContent>
            <TabsContent value="orders">
              <OrdersTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="container mx-auto py-6 px-4 text-center text-gray-500 text-sm">
        <p>© 2025 Buy Me a Coffee. All rights reserved.</p>
      </footer>
    </div>
  )
}

