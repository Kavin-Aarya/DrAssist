import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const navigation = [
  { name: 'Home', href: '#' },
  { name: 'About Us', href: '#stats_section' },
  { name: 'Features', href: '#feature_section' },
  { name: 'Pricing', href: '#pricing_section' },
  { name: 'FAQs', href: '#faq_section' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 px-1 transition-all duration-300 md:px-7 ${
        isScrolled 
          ? "bg-white/5 backdrop-blur-lg shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border-b border-white/10" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-full mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
          <img 
            src="/assets/DrAssist.png" 
            alt="Logo" 
            className={`${isScrolled ? "w-32" : "w-32"}`} 
          />
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-10 items-center">
          {navigation.map((link) => (
            <li key={link.name}>
              <a 
                href={link.href} 
                className="text-white text-base font-medium px-3 py-3 rounded-full hover:text-white transition-colors hover:bg-white/5 hover:backdrop-blur-lg hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
                hover:border-b hover: border-white/10 "
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Side Action Button */}
        <div className="hidden md:block">
          <button 
            onClick={() => navigate("/login")} 
            className="px-6 py-2 rounded-full bg-[#3f8b8c] text-white border-[#3f8b8c] hover:bg-white hover:text-[#3f8b8c]">
            Sign Up / Login
          </button>
        </div>

        {/* Mobile Menu Button (Hamburger/Close SVGs) */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-white hover:text-[#3f8b8c] focus:outline-none transition-colors"
          >
            {isOpen ? (
              // X (Close) Icon
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger (Menu) Icon
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`
        ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"} 
        md:hidden absolute top-full left-0 w-full bg-black transition-all duration-300 ease-in-out py-8 px-10 shadow-xl border-t border-gray-800
      `}>
        <ul className="flex flex-col space-y-6">
          {navigation.map((link) => (
            <li key={link.name}>
              <a 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-white text-lg block border-b border-gray-800 pb-2 active:text-[#3f8b8c] hover:text-[#429193]"
              >
                {link.name}
              </a>
            </li>
          ))}
          <li>
            <button 
              onClick={() => { navigate("/login"); setIsOpen(false); }} 
              className="w-full mt-4 bg-[#3f8b8c] text-white py-3 rounded-lg font-bold hover:bg-white hover:text-[#3f8b8c]"
            >
              Sign Up / Login
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}