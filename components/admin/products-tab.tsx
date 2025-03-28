"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Edit, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  price_id?: string;
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // For demo purposes, we'll add some sample products if the fetch fails
      setProducts([
        { id: "1", name: "Small Coffee", price: 3, price_id: "price_small" },
        { id: "2", name: "Medium Coffee", price: 5, price_id: "price_medium" },
        { id: "3", name: "Large Coffee", price: 7, price_id: "price_large" },
        { id: "4", name: "Coffee Bundle", price: 15, price_id: "price_bundle" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error("Failed to add product");

      // Get the created product data from the response
      const createdProduct = await response.json();
      console.log("Created product:", createdProduct);

      setProducts([...products, createdProduct]);
      setNewProduct({ name: "", price: 0 });
      setIsAddDialogOpen(false);
      toast({
        title: "Product added",
        description: `${createdProduct.name} has been added to your store.`,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await fetch(
        `http://localhost:8000/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingProduct),
        }
      );

      if (!response.ok) throw new Error("Failed to update product");

      setProducts(
        products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
      setEditingProduct(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Product updated",
        description: `${editingProduct.name} has been updated.`,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`http://localhost:8000/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: "Product deleted",
        description: "The product has been removed from your store.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Product Name</Label>
                <Input
                  id="add-name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="e.g. Large Coffee"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-price">Price (USD)</Label>
                <Input
                  id="add-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newProduct.price || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: Number.parseFloat(e.target.value),
                    })
                  }
                  placeholder="5.00"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Add Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No products found. Add your first product using the button
                  above.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog
                        open={
                          isEditDialogOpen && editingProduct?.id === product.id
                        }
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingProduct(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleEditProduct}
                            className="space-y-4 pt-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Product Name</Label>
                              <Input
                                id="edit-name"
                                value={editingProduct?.name || ""}
                                onChange={(e) =>
                                  setEditingProduct((prev) =>
                                    prev
                                      ? { ...prev, name: e.target.value }
                                      : null
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-price">Price (USD)</Label>
                              <Input
                                id="edit-price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={editingProduct?.price || 0}
                                onChange={(e) =>
                                  setEditingProduct((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          price: Number.parseFloat(
                                            e.target.value
                                          ),
                                        }
                                      : null
                                  )
                                }
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Save Changes
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
