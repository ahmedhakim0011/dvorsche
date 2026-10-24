import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductAdmin } from "@/lib/admin-data";
import { deleteProduct } from "../../../actions";
import { requireStaff } from "@/lib/auth";
import ProductForm from "@/components/admin/ProductForm";
import ConfirmButton from "@/components/admin/ConfirmButton";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [p, staff] = await Promise.all([getProductAdmin(id), requireStaff()]);
  if (!p) notFound();
  return (
    <>
      <header className="a-head">
        <div><p className="a-crumb"><Link href="/admin/products">Products</Link> /</p><h1>{p.name}</h1></div>
        <div className="a-actions">
          <Link href={`/product/${p.slug}`} target="_blank" className="a-btn">View in store ↗</Link>
          {staff.role === "super_admin" && (
            <form action={deleteProduct}><input type="hidden" name="id" value={p.id} /><ConfirmButton message={`Permanently delete “${p.name}”? Past orders keep their line items. Consider hiding it instead.`}>Delete</ConfirmButton></form>
          )}
        </div>
      </header>
      <ProductForm product={p} />
    </>
  );
}
