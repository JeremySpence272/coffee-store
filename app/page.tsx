import { Coffee } from "lucide-react";
import Link from "next/link";

import ProductGrid from "@/components/product-grid";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-cyan-500" />
            <h1 className="text-2xl font-bold text-gray-800">
              Buy Me A Coffee
            </h1>
          </div>
          <Link href="/admin">
            <Button variant="ghost">Admin Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-0">
        <section className="text-center my-12">
          <h2 className="text-5xl md:text-5xl text-gray-800 tracking-tight leading-tight">
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-500 font-extrabold">
              Fake Coffee.<span className="hidden sm:inline">&nbsp;</span>
            </span>
            <span className="block sm:inline text-gray-700 font-extrabold ">
              Real APIs.
            </span>
          </h2>
        </section>

        <ProductGrid />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-4 px-4 text-center text-gray-500 text-sm bg-white/60">
        <p>© 2025 Buy Me a Coffee. All rights reserved.</p>
      </footer>
    </div>
  );
}
