"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockOrders } from "@/lib/mock-data";

// Define Order interface with timestamp as number
interface Order {
  id: string;
  product_name: string;
  amount: number;
  timestamp: number;
  customer_email?: string;
}
import { orderApi } from "@/lib/api";

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await orderApi.getAllOrders();
        setOrders(data["orders"]);
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Convert mock data timestamp strings to numbers if needed
        const typedMockOrders = mockOrders.map(order => ({
          ...order,
          timestamp: typeof order.timestamp === 'string' ? new Date(order.timestamp).getTime() / 1000 : order.timestamp
        }));
        setOrders(typedMockOrders);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const formatDate = (timestamp: number) => {
    try {
      // Convert Unix timestamp (seconds since epoch) to milliseconds for JavaScript Date
      return format(new Date(timestamp * 1000), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

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
                  <TableCell className="font-medium">
                    {order.product_name}
                  </TableCell>
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
  );
}
