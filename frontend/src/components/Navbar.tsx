"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    const links = [
        { name: "Inicio", href: "/" },
        { name: "Historial", href: "/historial" },
        { name: "Ubicaciones", href: "/ubicaciones" },
        { name: "Registro", href: "/registro" },
    ];

    return (
        <nav className=" w-full bg-white/80 backdrop-blur-lg shadow-sm z-50">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    <Link
                        href="/"
                        className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent hover:from-teal-500 hover:to-teal-300 transition-all duration-300"
                    >
                        AsisTec
                    </Link>
                    <ul className="flex gap-1">
                        {links.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pathname === link.href
                                            ? "bg-teal-50 text-teal-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
