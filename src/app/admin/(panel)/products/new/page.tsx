import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "New product" };

export default function NewProduct() {
  return (
    <>
      <header className="a-head"><div><p className="a-crumb"><Link href="/admin/products">Products</Link> /</p><h1>New product</h1></div></header>
      <ProductForm />
    </>
  );
}
