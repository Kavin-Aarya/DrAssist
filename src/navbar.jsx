"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as motion from "motion/react-client";
import { stagger, AnimatePresence } from "motion/react";

// ── Navigation items ──────────────────────────────────────────────
const navigation = [
  { name: "Home",     href: "#" },
  { name: "About Us", href: "#stats_section" },
  { name: "Features", href: "#feature_section" },
  { name: "Pricing",  href: "#pricing_section" },
  { name: "FAQs",     href: "#faq_section" },
];

// ── Variants ──────────────────────────────────────────────────────

/**
 * `custom` receives { x, y } — the hamburger button's center in px
 * relative to the mobile menu panel's top-left corner.
 * This mirrors exactly how the original code used `custom={height}`.
 */
const sidebarVariants = {
  open: ({ x, y } = { x: 356, y: 34 }) => ({
    clipPath: `circle(1400px at ${x}px ${y}px)`,
    transition: { type: "spring", stiffness: 20, restDelta: 2 },
  }),
  closed: ({ x, y } = { x: 356, y: 34 }) => ({
    clipPath: `circle(0px at ${x}px ${y}px)`,
    transition: { delay: 0.2, type: "spring", stiffness: 400, damping: 40 },
  }),
};

/** Wrapper that staggers children when opening / closing */
const listVariants = {
  open:   { transition: { delayChildren: stagger(0.07, { startDelay: 0.2 }) } },
  closed: { transition: { delayChildren: stagger(0.05, { from: "last" }) } },
};

/** Each link slides up and fades in */
const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: { y: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    y: 30,
    opacity: 0,
    transition: { y: { stiffness: 1000 } },
  },
};

// ── Animated hamburger paths ──────────────────────────────────────
const Path = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="2.5"
    stroke="rgba(255,255,255,0.85)"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({ toggle }) => (
  <button
    onClick={toggle}
    aria-label="Toggle menu"
    className="flex items-center justify-center p-[7px] rounded-[10px] border border-white/15 bg-transparent text-white/85 cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
  >
    <svg width="20" height="20" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open:   { d: "M 3 16.5 L 17 2.5" },
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open:   { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open:   { d: "M 3 2.5 L 17 16.346" },
        }}
      />
    </svg>
  </button>
);

// ── Main component ────────────────────────────────────────────────
export default function Navbar() {
  const navigate   = useNavigate();
  const [isOpen,     setIsOpen]     = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Ref on the hamburger wrapper so we can measure its exact position
  const hamburgerRef = useRef(null);
  // Stores { x, y } of the hamburger center relative to the menu panel
  const [origin, setOrigin] = useState({ x: 356, y: 34 });

  // Measure on mount and on resize
  useEffect(() => {
    const measure = () => {
      if (!hamburgerRef.current) return;
      const rect = hamburgerRef.current.getBoundingClientRect();
      // x = button center from left edge of viewport
      // y = button center from top of the menu panel (panel starts at 68px nav height)
      setOrigin({
        x: rect.left + rect.width  / 2,
        y: rect.top  + rect.height / 2 - 68,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ── Desktop / scroll-aware nav ──────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 px-7 ${
          isScrolled
            ? "bg-[#040d0d]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center h-[68px]">

          {/* Logo — fades in, subtle lift on hover */}
          <motion.div
            className="flex-shrink-0 cursor-pointer flex items-center"
            onClick={() => navigate("/")}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              src="/assets/DrAssist.png"
              alt="Logo"
              className="h-11 w-auto object-contain"
            />
          </motion.div>

          {/* Desktop links — stagger in on mount */}
          <motion.ul
            className="hidden md:flex items-center gap-1 list-none m-0 p-0"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
            }}
          >
            {navigation.map((link) => (
              <motion.li
                key={link.name}
                variants={{
                  hidden: { opacity: 0, y: -8 },
                  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
                }}
              >
                <motion.a
                  href={link.href}
                  className="font-outfit text-sm font-medium text-white/80 no-underline px-4 py-2 rounded-[10px] border border-transparent whitespace-nowrap"
                  whileHover={{
                    color: "rgba(255,255,255,1)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  {link.name}
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA — fades in, spring hover */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
          >
            <motion.button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-white bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] border-none rounded-[10px] px-[22px] py-[9px] cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.35)] whitespace-nowrap"
              whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(63,139,140,0.45)" }}
              whileTap={{ scale: 0.97, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Sign Up / Login
            </motion.button>
          </motion.div>

          {/* Hamburger — ref measured here, Motion-animated SVG paths */}
          <div className="md:hidden" ref={hamburgerRef}>
            <motion.div animate={isOpen ? "open" : "closed"}>
              <MenuToggle toggle={() => setIsOpen(!isOpen)} />
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile menu ─────────────────────────────────────────── */}
      <motion.nav
        className="md:hidden fixed top-[68px] left-0 w-full z-[49] px-7 pb-7 pt-3"
        initial={false}
        animate={isOpen ? "open" : "closed"}
        custom={origin}
      >
        {/* Background panel — clip-path circle originates from hamburger center */}
        <motion.div
          className="absolute inset-0 bg-[#040d0d]/92 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
          variants={sidebarVariants}
          custom={origin}
        />

        {/* Staggered link list */}
        <motion.ul
          className="relative list-none m-0 p-0"
          variants={listVariants}
        >
          {navigation.map((link) => (
            <motion.li
              key={link.name}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.97 }}
            >
              <a
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-[15px] font-medium text-white/85 no-underline py-[13px] border-b border-white/[0.08] transition-colors duration-200 hover:text-[#5bb5b6]"
              >
                {link.name}
              </a>
            </motion.li>
          ))}

          <motion.li
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-5"
          >
            <motion.button
              onClick={() => { navigate("/login"); setIsOpen(false); }}
              className="w-full text-[15px] font-semibold text-white bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] border-none rounded-[10px] py-[13px] cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.35)]"
              whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(63,139,140,0.45)" }}
              whileTap={{ scale: 0.97, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Sign Up / Login
            </motion.button>
          </motion.li>
        </motion.ul>
      </motion.nav>
    </>
  );
}