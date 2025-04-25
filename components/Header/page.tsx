'use client';
import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Cormorant_SC, DM_Sans } from "next/font/google";

const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  weight: ["700"],
});

const dm = DM_Sans({
  subsets: ["latin"],
  weight: ["400"],
});




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
    <header className={`bg-amber-100 px-4 flex justify-between items-end md:min-h-[50px] ${dm.className}`}>
      <h1 className={`${cormorantSC.className} text-black self-center text-2xl`}>O Blogueirinho</h1>
      <nav
        className="relative"
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <button className="text-black text-md bg-amber-100 hover:bg-amber-200 focus:bg-amber-200 px-4 py-2 rounded-md flex items-center">
          Projetos
          <ChevronDownIcon className="self-center" size={20} />
        </button>
        {isDropdownOpen && (
          <ul className="absolute right-0 w-40 bg-gray-100 p-2 z-10">
            {components.map((component) => (
              <li
                key={component.title}
                className="p-2 hover:bg-gray-100"
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
