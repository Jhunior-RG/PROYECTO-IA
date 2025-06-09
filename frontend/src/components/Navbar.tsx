"use client";
import Link from "next/link";

export default function Navbar() {
    const links = [
        { name: "Inicio", href: "/" },
        { name: "Reconocimiento", href: "/reconocimiento" },
        { name: "Ubicaciones", href: "/ubicaciones" },
        { name: "registro", href: "/registro" },
    ];

    return (
        <nav className="fixed top-0 w-full  bg-white bg-opacity-90 backdrop-blur-md shadow-md z-50 flex justify-between items-center px-5 h-14">
            <Link href="/" className="text-2xl font-bold text-teal-600">
                AsisTec
            </Link>
            <ul className="flex gap-5">
                {links.map((l) => (
                    <li key={l.href} className="py-2 px-4 md:p-0 text-center">
                        <Link
                            href={l.href}
                            className="text-gray-700 hover:text-teal-600"
                        >
                            {l.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
