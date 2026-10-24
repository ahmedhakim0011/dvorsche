import { CartProvider } from "@/lib/cart";
import { getCatalog } from "@/lib/catalog";
import { navFor } from "@/lib/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const catalog = await getCatalog();
  const nav = navFor(catalog);
  return (
    <CartProvider catalog={catalog}>
      <Header nav={nav} />
      <main id="main">{children}</main>
      <Footer nav={nav.filter((n) => n.href.startsWith("/shop"))} />
      <CartDrawer />
    </CartProvider>
  );
}
