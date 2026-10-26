import { Outlet } from "react-router";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner"

export default function Layout() {
    return (
        <>
            <Header />
            <Outlet />
            <Toaster />
            <Footer />
        </>
    )
}