'use client'
import React, { useState } from "react";

const components = [
  {
    title: "Short Track",
    href: "/Short-Track",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
];

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-amber-100 px-4 py-2 flex justify-between items-center md:min-h-[50px]">
      <h1 className="text-black font-bold text-sm">O Blogueirinho</h1>
      <nav
        className="relative"
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <button className="text-black text-sm bg-amber-100 hover:bg-amber-200 focus:bg-amber-200 px-4 py-2 rounded-md flex items-center">
          Projetos
          <span className="ml-2">▼</span> {/* Arrow indicating dropdown */}
        </button>
        {isDropdownOpen && (
          <ul className="absolute right-0 w-60 bg-white shadow-lg rounded-md p-2 z-10">
            {components.map((component) => (
              <li
                key={component.title}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <a
                  href={component.href}
                  className="text-black text-sm no-underline"
                >
                  <div className="font-medium">{component.title}</div>
                  <p className="text-muted-foreground text-sm">
                    {component.description}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
