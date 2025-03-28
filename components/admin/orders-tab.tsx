"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Order {
  id: string
  product_name: string
  amount: number
  timestamp: string
  customer_email?: string
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:8000/orders")
        if (!response.ok) throw new Error("Failed to fetch orders")
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        // For demo purposes, we'll add some sample orders if the fetch fails
        setOrders([
          {
            id: "1",
            product_name: "Small Coffee",
            amount: 3,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            customer_email: "john@example.com",
          },
          {
            id: "2",
            product_name: "Medium Coffee",
            amount: 5,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            customer_email: "sarah@example.com",
          },
          {
            id: "3",
            product_name: "Large Coffee",
            amount: 7,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            customer_email: "mike@example.com",
          },
          {
            id: "4",
            product_name: "Coffee Bundle",
            amount: 15,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.product_name}</TableCell>
                  <TableCell>${order.amount.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(order.timestamp)}</TableCell>
                  <TableCell>{order.customer_email || "Anonymous"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

