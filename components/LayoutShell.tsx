"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SellerConflictModal from "./SellerConflictModal";

const AUTH_ROUTES = ["/login", "/register"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth   = AUTH_ROUTES.includes(pathname);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: "14px", maxWidth: "380px" },
          error: { duration: 5000 },
        }}
      />
      {!isAuth && <Navbar />}
      <SellerConflictModal />
      <main className={isAuth ? "flex-grow" : "flex-grow"}>{children}</main>
      {!isAuth && <Footer />}
    </>
  );
}