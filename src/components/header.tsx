import { ModeToggle } from "@/components/mode-toggle";
import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import logo from "@/assets/doro_buki.webp"

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Siempre visible si estamos en la parte superior o si el menú móvil está abierto
            if (currentScrollY <= 10) {
                setIsVisible(true);
            } else if (isOpen) {
                setIsVisible(true);
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolleando hacia arriba
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                // Scrolleando hacia abajo
                setIsVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isOpen]);

    const publicLinks = [
        { name: "Personajes", path: "/" },
        // { name: "Build", path: "/build-calc" },
        { name: "Daño", path: "/dmg-calc" },
        { name: "Velocidad", path: "/speed-calc" },
        // { name: "Archivos", path: "/files" },
    ];

    return (
        <header
            className={`sticky top-0 bg-muted p-4 z-50 transition-transform duration-300 ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <nav className="flex justify-between items-center w-full">
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 -ml-2 rounded-md hover:bg-black/20 focus:outline-none transition-colors"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
                </button>

                <img src={logo} alt="logo" className="h-10 w-10 rounded-full mx-1" />

                {/* Desktop Menu */}
                <ul className="hidden md:flex flex-row items-center flex-1">
                    {publicLinks.map((link) => (
                        <li key={link.path} className="rounded-md overflow-hidden">
                            <NavLink
                                className={({ isActive }) =>
                                    `px-4 py-2 block transition-colors duration-200 hover:bg-black/20 ${isActive ? "text-primary dark:text-fuchsia-500 font-bold" : ""}`
                                }
                                to={link.path}
                            >
                                {link.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <ModeToggle />
            </nav>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-muted animate-in slide-in-from-top-4 duration-500 ease-out shadow-xl border-t border-white/10 flex flex-col">
                    <ul className="flex flex-col">
                        {publicLinks.map((link) => (
                            <li key={link.path} className="px-3">
                                <NavLink
                                    className={({ isActive }) =>
                                        `px-6 py-4 block transition-colors duration-200 hover:bg-black/20 rounded-xl ${isActive ? "text-primary dark:text-fuchsia-500 font-bold" : ""}`
                                    }
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </header>
    )
}