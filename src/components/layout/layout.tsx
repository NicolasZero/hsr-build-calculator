import { Suspense } from "react";
import { Outlet } from "react-router";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Loader from "@/components/layout/loader";
import { Toaster } from "@/components/ui/sonner"

export default function Layout() {
    return (
        <>
            <Header />
            <Suspense fallback={<Loader />}>
                <Outlet />
            </Suspense>
            <Toaster />
            <Footer />
        </>
    )
}