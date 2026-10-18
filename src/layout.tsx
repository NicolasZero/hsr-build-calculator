import { Outlet } from "react-router";
import Header from "@/components/layers/header";
import Footer from "@/components/layers/footer";

export default function Layout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}