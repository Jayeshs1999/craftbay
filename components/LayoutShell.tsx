"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AUTH_ROUTES = ["/login", "/register"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth   = AUTH_ROUTES.includes(pathname);

  return (
    <>
      {!isAuth && <Navbar />}
      <main className={isAuth ? "flex-grow" : "flex-grow"}>{children}</main>
      {!isAuth && <Footer />}
    </>
  );
}