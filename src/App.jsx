import { useState, useRef, lazy, Suspense } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView, } from 'motion/react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from './login';
import Navbar from './navbar';
import { CheckIcon } from '@heroicons/react/20/solid'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { AuthProvider } from "./AuthContext.jsx";

const MenuLayout = lazy(() => import('./MenuLayout'));
const Dashboard = lazy(() => import('./Dashboard'));
const VoiceCapture = lazy(() => import('./VoiceCapture'));
const Settings = lazy(() => import('./Settings'));
const Templates = lazy(() => import('./Templates'));
const History = lazy(() => import('./History'));


// ─────────────────────────────────────────────────────────────────────────────
// Reusable animation primitives
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FadeUp — wraps children in a motion.div that fades + slides up when it
 * enters the viewport. `delay` lets you stagger siblings.
 */
function FadeUp({ children, delay = 0, duration = 0.6, className, style }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

/**
 * FadeIn — pure opacity fade, no y movement. Good for dividers, images.
 */
function FadeIn({ children, delay = 0, duration = 0.7, className, style }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

/**
 * SlideIn — slides in from left or right
 */
function SlideIn({ children, from = "left", delay = 0, className, style }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const x = from === "left" ? -60 : 60

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, x }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

/**
 * StaggerContainer — parent that triggers stagger on children when in view
 */
const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
}

function StaggerList({ children, className, style }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger child — wrap any element
function StaggerChild({ children, className, style, as: Tag = "div" }) {
  const MotionTag = motion[Tag] || motion.div
  return (
    <MotionTag className={className} style={style} variants={staggerItem}>
      {children}
    </MotionTag>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll Zoom Hero
// ─────────────────────────────────────────────────────────────────────────────

function HeroScrollZoom({ navigate }) {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })

  const scale        = useTransform(smooth, [0, 1], [1, 1.5])
  const blur         = useTransform(smooth, [0, 1], [0, 12])
  const overlayAlpha = useTransform(smooth, [0, 1], [0.72, 0.95])
  const textOpacity  = useTransform(smooth, [0, 0.4], [1, 0])
  const textY        = useTransform(smooth, [0, 0.4], [0, -60])

  return (
    <div ref={containerRef} style={{ position: "relative", height: "200vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Background — zooms + blurs on scroll */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('assets/hospital.jpg')",
            backgroundSize: "cover", backgroundPosition: "center",
            scale,
            filter: useTransform(blur, v => `blur(${v}px)`),
          }}
        />

        {/* Overlay — darkens on scroll */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            backgroundColor: useTransform(overlayAlpha, v => `rgba(4,13,13,${v})`),
          }}
        />

        {/* Radial teal glow */}
        <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(63,139,140,.18) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* Hero content — fades up on mount, fades out on scroll */}
        <motion.div
          style={{
            position: "relative", zIndex: 20,
            display: "flex", height: "100%",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "0 24px", textAlign: "center",
            opacity: textOpacity, y: textY,
          }}
        >
          <div style={{ maxWidth: 780 }}>

            {/* Eyebrow — bounces in */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "backOut" }}
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", borderRadius:50, border:"1px solid rgba(63,139,140,.35)", background:"rgba(63,139,140,.1)", marginBottom:28 }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ width:6, height:6, borderRadius:"50%", background:"#3f8b8c" }}
              />
              <span style={{ fontSize:12, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#5bb5b6" }}>AI-Powered Clinical Documentation</span>
            </motion.div>

            {/* Headline — staggered word reveal */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ fontSize:"clamp(32px, 5vw, 60px)", fontWeight:700, color:"#fff", lineHeight:1.15, margin:"0 0 24px", letterSpacing:"-.02em" }}
            >
              Use Voice Activation to Generate Prescriptions,{" "}
              <motion.span
                initial={{ color: "#ffffff" }}
                animate={{ color: "#3f8b8c" }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                No Writing Required.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              style={{ fontSize:"clamp(16px, 2vw, 20px)", color:"rgba(255,255,255,.7)", fontWeight:400, lineHeight:1.6, maxWidth:600, margin:"0 auto 40px" }}
            >
              Speak the medication order to instantly create and finalize the prescription sheet.
            </motion.p>

            {/* CTA buttons — slide in with spring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}
            >
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center justify-center bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] text-white font-[Outfit,sans-serif] text-sm font-semibold px-7 py-3 rounded-xl border-none cursor-pointer shadow-[0_4px_18px_rgba(63,139,140,0.35)]"
              >
                Get Started Free
              </motion.button>
              <motion.a
                href="#feature_section"
                whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.12)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center justify-center bg-white/[0.06] text-white font-[Outfit,sans-serif] text-sm font-medium px-7 py-3 rounded-xl border border-white/[0.12] cursor-pointer no-underline"
              >
                See How It Works
              </motion.a>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8, zIndex:20 }}
        >
          <span style={{ fontSize:11, color:"rgba(255,255,255,.35)", letterSpacing:".12em", textTransform:"uppercase" }}>scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ width:1, height:32, background:"linear-gradient(to bottom, rgba(63,139,140,.7), transparent)" }}
          />
        </motion.div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated divider
// ─────────────────────────────────────────────────────────────────────────────
function Divider() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
      transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ transformOrigin: "center" }}
      className="h-px bg-gradient-to-r from-transparent via-[rgba(63,139,140,0.4)] to-transparent"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated stat counter
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedStatCard({ stat, delay }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, scale: 1.02, transition: { type: "spring", stiffness: 350, damping: 20 } }}
      className="relative overflow-hidden bg-white/[0.05] border border-white/[0.09] rounded-[18px] px-6 py-7 backdrop-blur-xl cursor-default"
    >
      {/* Glow blob */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ repeat: Infinity, duration: 3, delay, ease: "easeInOut" }}
        style={{ position:"absolute", top:-8, right:-8, width:60, height:60, borderRadius:"50%", background:"#3f8b8c", filter:"blur(20px)" }}
      />
      <p style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,.5)", marginBottom:10, letterSpacing:".02em" }}>{stat.description}</p>
      <p style={{ fontSize:38, fontWeight:700, color:"#fff", letterSpacing:"-.02em", margin:0 }}>{stat.value}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated logo
// ─────────────────────────────────────────────────────────────────────────────
function LogoCloud({ logos }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <div ref={ref} style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", alignItems:"center", gap:"24px 32px", maxWidth:900, margin:"0 auto" }}>
      {logos.map((name, i) => (
        <motion.img
          key={name}
          alt={name}
          src={`https://tailwindcss.com/plus-assets/img/logos/158x48/${name}-logo-white.svg`}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 0.55, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 * i }}
          whileHover={{ opacity: 1, scale: 1.08, transition: { duration: 0.2 } }}
          style={{ width:"100%", height:32, objectFit:"contain", cursor:"pointer" }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated feature item
// ─────────────────────────────────────────────────────────────────────────────
function FeatureItem({ feature, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ x: 4, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      style={{ position:"relative", paddingLeft:32, cursor:"default" }}
    >
      <dt style={{ fontWeight:600, color:"#fff", fontSize:15, marginBottom:4 }}>
        {feature.icon}
        {feature.name}
      </dt>
      <dd style={{ fontSize:14, color:"rgba(255,255,255,.5)", lineHeight:1.7, margin:0 }}>{feature.description}</dd>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated pricing card
// ─────────────────────────────────────────────────────────────────────────────
function PricingCard({ tier, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      key={tier.id}
      className={`relative flex flex-col justify-between backdrop-blur-2xl rounded-[22px] px-7 py-8 ${tier.mostPopular ? "bg-[rgba(63,139,140,0.08)] border-2 border-[#3f8b8c] shadow-[0_0_0_1px_#3f8b8c,0_8px_40px_rgba(63,139,140,0.2)]" : "bg-white/[0.05] border border-white/10"}`}
      style={{ transform: tier.mostPopular ? "scale(1.03)" : "none" }}
    >
      {tier.mostPopular && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.2 }}
          style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#3f8b8c,#2d6667)", color:"#fff", fontSize:11, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", padding:"4px 16px", borderRadius:50, whiteSpace:"nowrap", boxShadow:"0 4px 12px rgba(63,139,140,.4)" }}
        >
          Most Popular
        </motion.div>
      )}
      <div>
        <h3 style={{ fontSize:18, fontWeight:600, color:"#fff", margin:"0 0 12px", letterSpacing:"-.01em" }}>{tier.name}</h3>
        <p style={{ fontSize:13.5, color:"rgba(255,255,255,.5)", lineHeight:1.6, marginBottom:24 }}>{tier.description}</p>
        <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:28 }}>
          <span style={{ fontSize:44, fontWeight:700, color:"#fff", letterSpacing:"-.03em" }}>{tier.priceMonthly}</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,.4)", fontWeight:500 }}>/month</span>
        </div>
        <ul style={{ listStyle:"none", padding:0, margin:"0 0 28px", display:"flex", flexDirection:"column", gap:12 }}>
          {tier.features.map((feature, i) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: delay + 0.05 * i, duration: 0.4 }}
              style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13.5, color:"rgba(255,255,255,.65)" }}
            >
              <CheckIcon style={{ width:16, height:16, color:"#3f8b8c", flexShrink:0, marginTop:1 }} aria-hidden="true" />
              {feature}
            </motion.li>
          ))}
        </ul>
      </div>
      <motion.a
        href={tier.href}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={tier.mostPopular ? "inline-flex items-center justify-center w-full bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] text-white text-sm font-semibold px-0 py-3 rounded-xl border-none cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.3)] no-underline" : "inline-flex items-center justify-center w-full bg-white/[0.06] text-white text-sm font-medium py-3 rounded-xl border border-white/[0.12] cursor-pointer no-underline"}
        style={{ textDecoration:"none", display:"block", textAlign:"center", borderRadius:12, padding:"12px 0", fontSize:14, fontWeight:600 }}
      >
        Buy plan
      </motion.a>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated testimonial card
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, delay }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.08)", transition: { duration: 0.25 } }}
      className="bg-white/[0.05] border border-white/10 rounded-[20px] p-8 backdrop-blur-2xl m-0"
    >
      {/* Stars — stagger in */}
      <div style={{ display:"flex", gap:4, marginBottom:16 }}>
        {[...Array(5)].map((_, i) => (
          <motion.svg
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.06 * i, type: "spring", stiffness: 400, damping: 15 }}
            width="14" height="14" viewBox="0 0 24 24" fill="#3f8b8c"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </motion.svg>
        ))}
      </div>
      <blockquote style={{ fontSize:16, fontWeight:500, color:"#fff", lineHeight:1.65, margin:"0 0 20px" }}>
        <p style={{ margin:0 }}>{quote}</p>
      </blockquote>
      <figcaption style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:"rgba(63,139,140,.2)", border:"1px solid rgba(63,139,140,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#3f8b8c" }}>
          {name.charAt(0)}
        </div>
        <div>
          <p style={{ fontSize:13.5, fontWeight:600, color:"#fff", margin:0 }}>{name}</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.4)", margin:0 }}>{role}</p>
        </div>
      </figcaption>
    </motion.figure>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated FAQ item
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedFAQ({ faq, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay }}
    >
      <Disclosure as="div" className="border-b border-white/10">
        {({ open }) => (
          <>
            <dt>
              <DisclosureButton className="w-full flex items-start justify-between text-left bg-none border-none cursor-pointer py-6 text-white font-[Outfit,sans-serif]">
                <span className="flex-1 text-base font-medium leading-snug text-white pr-6">{faq.question}</span>
                <motion.span
                  animate={{ rotate: open ? 180 : 0, backgroundColor: open ? "rgba(63,139,140,0.2)" : "rgba(255,255,255,0.06)" }}
                  transition={{ duration: 0.25 }}
                  style={{ flexShrink:0, width:28, height:28, borderRadius:8, border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}
                >
                  {open
                    ? <MinusIcon style={{ width:14, height:14, color:"#3f8b8c" }} aria-hidden="true" />
                    : <PlusIcon style={{ width:14, height:14, color:"rgba(255,255,255,.5)" }} aria-hidden="true" />
                  }
                </motion.span>
              </DisclosureButton>
            </dt>
            <DisclosurePanel as="dd">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-[15px] leading-[1.7] text-white/60 pb-6 pr-12"
              >
                {faq.answer}
              </motion.p>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header helper
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle, center = true, delay = 0 }) {
  return (
    <div style={{ textAlign: center ? "center" : "left" }}>
      <FadeUp delay={delay}>
        <p className="text-[13px] font-semibold tracking-[0.1em] uppercase text-[#3f8b8c]">{eyebrow}</p>
      </FadeUp>
      <FadeUp delay={delay + 0.1}>
        <h2 style={{ fontSize:"clamp(28px, 4vw, 48px)", fontWeight:700, color:"#fff", margin:"12px 0 16px", letterSpacing:"-.02em" }}>
          {title}
        </h2>
      </FadeUp>
      {subtitle && (
        <FadeUp delay={delay + 0.2}>
          <p style={{ fontSize:16, color:"rgba(255,255,255,.55)", maxWidth: center ? 700 : "unset", margin: center ? "0 auto 60px" : "0 0 60px", lineHeight:1.7 }}>
            {subtitle}
          </p>
        </FadeUp>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main HeroSection (landing page)
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate();

  const features = [
    {
      name: 'Instant Voice-to-Document Conversion.',
      description: 'Transform spoken input into polished, professional medical prescriptions through a seamless end-to-end workflow.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ position:"absolute", left:4, top:4, width:18, height:18, color:"#3f8b8c" }}>
          <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
          <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
        </svg>
      ),
    },
    {
      name: 'Precision Voice Capture.',
      description: 'Advanced audio intake technology ensures every word is recorded clearly and accurately — reducing errors and rework.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ position:"absolute", left:4, top:4, width:18, height:18, color:"#3f8b8c" }}>
          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
        </svg>
      ),
    },
    {
      name: 'Secure & Structured Output.',
      description: 'Industry-grade security combined with custom templates delivers consistent, compliant, and professional results every time.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ position:"absolute", left:4, top:4, width:18, height:18, color:"#3f8b8c" }}>
          <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
        </svg>
      ),
    }
  ];

  const tiers = [
    {
      name: 'Essential', id: 'tier-essential', href: '#', priceMonthly: '$49',
      description: 'Perfect for solo practitioners streamlining their daily documentation.',
      features: ['Unlimited voice-to-text','Basic clinical entity mapping','Standard SOAP note templates','Secure cloud storage','Email support (24h response)'],
      mostPopular: false,
    },
    {
      name: 'Professional', id: 'tier-professional', href: '#', priceMonthly: '$99',
      description: 'Advanced features for growing clinics requiring high-precision data.',
      features: ['Everything in Essential','Advanced medical coding support','Customizable documentation templates','EHR integration assistance','Priority 24/7 support','Multi-device synchronization'],
      mostPopular: true,
    },
    {
      name: 'Institutional', id: 'tier-institutional', href: '#', priceMonthly: 'Custom',
      description: 'Enterprise-grade security and scale for large hospital networks.',
      features: ['Unlimited departmental seats','Full API & On-premise options','Dedicated success manager','Custom security audits & compliance','Advanced population health analytics','White-label documentation portals'],
      mostPopular: false,
    },
  ];

  const stats = [
    { id: "stat1", value: "12,000+", description: "Medical professionals onboarded" },
    { id: "stat2", value: "2.5 hrs",  description: "Average time saved per shift" },
    { id: "stat3", value: "99.9%",   description: "System availability & uptime" },
    { id: "stat4", value: "1.2M+",   description: "Clinical notes securely generated" },
  ];

  const faqs = [
    { question: "How accurate is the medical transcription?", answer: "Our system is optimized for clinical terminology and various accents, ensuring high-precision documentation that captures complex medical terms accurately." },
    { question: "Is patient data secure and encrypted?", answer: "Yes, all data is processed with end-to-end encryption. We prioritize security and privacy to ensure that sensitive information remains protected at all times." },
    { question: "Does it support multiple speakers during a consultation?", answer: "Yes, the system is designed to distinguish between clinician and patient voices to provide a clear, structured transcript of the encounter." },
    { question: "Does the system recognize complex medical terminology?", answer: "Yes. The engine is specifically trained on extensive clinical datasets, allowing it to accurately capture and transcribe complex pharmacological terms, anatomical references, and specialized medical jargon across various specialties." },
    { question: "How does this improve the patient-doctor encounter?", answer: "By automating the documentation process, clinicians can maintain direct eye contact and engage more deeply with patients. The system works in the background to ensure every clinical detail is captured without the distraction of manual data entry." },
    { question: "Is the documentation process compliant with healthcare standards?", answer: "Security is our cornerstone. We utilize industry-standard encryption protocols and secure data handling practices to ensure that all generated clinical notes meet the rigorous privacy and confidentiality requirements of modern healthcare environments." },
  ];

  const navigation = {
    main: [
      { name: 'About', href: '#' }, { name: 'Blog', href: '#' }, { name: 'Jobs', href: '#' },
      { name: 'Press', href: '#' }, { name: 'Accessibility', href: '#' }, { name: 'Partners', href: '#' },
    ],
    social: [
      {
        name: 'Facebook', href: '#',
        icon: (props) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        name: 'X', href: '#',
        icon: (props) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823Z" />
          </svg>
        ),
      },
      {
        name: 'Instagram', href: '#',
        icon: (props) => (
          <svg fill="currentColor" viewBox="-2 -2 28 28" {...props}>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.282.975.95 1.245 2.217 1.307 3.583.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.282 3.608-.95.975-2.217 1.245-3.583 1.307-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.282-.975-.95-1.245-2.217-1.307-3.583C2.012 15.584 2 15.204 2 12s.012-3.584.07-4.85c.062-1.366.332-2.633 1.282-3.608.95-.975 2.217-1.245 3.583-1.307 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.072 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.353 2.62 6.777 6.98 6.977 1.28.057 1.688.072 4.948.072s3.668-.015 4.948-.072c4.351-.2 6.777-2.62 6.977-6.977.058-1.28.072-1.688.072-4.947s-.015-3.668-.072-4.947C23.728 2.62 21.306.2 16.946.072 15.667.014 15.259 0 12 0z" />
            <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" />
            <path d="M18.406 4.155a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
          </svg>
        ),
      },
    ],
  };

  return (
    <div className="w-full bg-[#040d0d] font-[Outfit,sans-serif]">

      <Navbar />

      {/* ── HERO (Scroll Zoom) ── */}
      <HeroScrollZoom navigate={navigate} />

      <Divider />

      {/* ── STATS ── */}
      <div id="stats_section" style={{ background:"#040d0d", padding:"96px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", textAlign:"center" }}>

          <SectionHeader
            eyebrow="Our Track Record"
            title="Trusted by thousands of doctors worldwide"
            subtitle="Transforming unstructured clinical dialogue into precision-mapped medical documentation for enhanced provider productivity."
          />

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:80 }}>
            {stats.map((stat, i) => (
              <AnimatedStatCard key={stat.id} stat={stat} delay={0.1 * i} />
            ))}
          </div>

          {/* Logo cloud */}
          <FadeIn delay={0.2}>
            <div style={{ padding:"60px 0 0" }}>
              <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.4)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:36 }}>
                Trusted by the world's most innovative hospitals
              </p>
              <LogoCloud logos={["transistor","reform","tuple","savvycal","statamic"]} />
            </div>
          </FadeIn>
        </div>
      </div>

      <Divider />

      {/* ── FEATURES ── */}
      <div id="feature_section" style={{ background:"#040d0d", padding:"96px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>

          {/* Left — text */}
          <SlideIn from="left">
            <div>
              <p className="text-[13px] font-semibold tracking-[0.1em] uppercase text-[#3f8b8c]">Voice Intelligence</p>
              <h2 style={{ fontSize:"clamp(28px, 3.5vw, 44px)", fontWeight:700, color:"#fff", margin:"12px 0 20px", letterSpacing:"-.02em", lineHeight:1.2 }}>
                A Smarter Workflow
              </h2>
              <p style={{ fontSize:16, color:"rgba(255,255,255,.55)", lineHeight:1.75, marginBottom:40 }}>
                Our system delivers a seamless, end-to-end workflow that transforms audio input into a finalized, professional output.
                From initial voice capture to document completion, every stage is designed for accuracy, efficiency, and security.
              </p>
              <dl style={{ display:"flex", flexDirection:"column", gap:28 }}>
                {features.map((feature, i) => (
                  <FeatureItem key={feature.name} feature={feature} delay={0.15 * i} />
                ))}
              </dl>
            </div>
          </SlideIn>

          {/* Right — product image */}
          <SlideIn from="right">
            <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.26, 0.18] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                style={{ position:"absolute", width:"90%", height:"70%", borderRadius:"50%", background:"#3f8b8c", filter:"blur(80px)", zIndex:0 }}
              />
              <motion.img
                alt="Product screenshot"
                src="/assets/ui.png"
                width={2432} height={1442}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 250, damping: 20 } }}
                style={{ position:"relative", zIndex:1, width:"100%", maxWidth:540, borderRadius:16, boxShadow:"0 24px 64px rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.1)" }}
              />
            </div>
          </SlideIn>
        </div>
      </div>

      <Divider />

      {/* ── PRICING ── */}
      <div id="pricing_section" style={{ background:"#040d0d", padding:"96px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>

          <SectionHeader
            eyebrow="Pricing"
            title="Pricing that grows with you"
            subtitle="Choose an affordable plan packed with the best features for clinical workflows."
          />

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20 }}>
            {tiers.map((tier, i) => (
              <PricingCard key={tier.id} tier={tier} delay={0.12 * i} />
            ))}
          </div>

          {/* Testimonials */}
          <div style={{ marginTop:80, display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {[
              { quote: '"DrAssist has completely transformed how I handle patient prescriptions. Accuracy is incredible."', name: "Dr. Sarah Jenkins", role: "Chief of Medicine at Genesis Medical" },
              { quote: '"Automating our clinical entity extraction with DrAssist saved us roughly 10 hours of paperwork per week."', name: "Dr. Joseph Rodriguez", role: "Doctor at Pulse Health" },
            ].map(({ quote, name, role }, i) => (
              <TestimonialCard key={name} quote={quote} name={name} role={role} delay={0.15 * i} />
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* ── FAQ ── */}
      <div id="faq_section" style={{ background:"#040d0d", padding:"96px 24px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <FadeUp>
            <h2 style={{ fontSize:"clamp(28px, 4vw, 44px)", fontWeight:700, color:"#fff", textAlign:"center", marginBottom:60, letterSpacing:"-.02em" }}>
              Frequently asked questions
            </h2>
          </FadeUp>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: "left" }}
            className="border-t border-white/10"
          />
          {faqs.map((faq, i) => (
            <AnimatedFAQ key={faq.question} faq={faq} delay={0.07 * i} />
          ))}
        </div>
      </div>

      <Divider />

      {/* ── FOOTER ── */}
      <footer style={{ background:"#040d0d", padding:"64px 24px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", textAlign:"center" }}>

          <StaggerList style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"8px 32px", marginBottom:40 }}>
            {navigation.main.map((item) => (
              <StaggerChild key={item.name} as="div">
                <motion.a
                  href={item.href}
                  whileHover={{ color: "#3f8b8c", y: -1 }}
                  style={{ fontSize:13.5, color:"rgba(255,255,255,.4)", textDecoration:"none", fontWeight:500, display:"inline-block" }}
                >
                  {item.name}
                </motion.a>
              </StaggerChild>
            ))}
          </StaggerList>

          <StaggerList style={{ display:"flex", justifyContent:"center", gap:24, marginBottom:36 }}>
            {navigation.social.map((item) => (
              <StaggerChild key={item.name} as="div">
                <motion.a
                  href={item.href}
                  whileHover={{ color: "#3f8b8c", scale: 1.2, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  style={{ color:"rgba(255,255,255,.3)", display:"inline-block" }}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon style={{ width:20, height:20 }} aria-hidden="true" />
                </motion.a>
              </StaggerChild>
            ))}
          </StaggerList>

          <FadeIn>
            <div style={{ width:48, height:1, background:"rgba(63,139,140,.3)", margin:"0 auto 24px" }} />
            <p style={{ fontSize:12.5, color:"rgba(255,255,255,.25)", letterSpacing:".04em" }}>
              &copy; {new Date().getFullYear()} DrAssist Inc. All rights reserved.
            </p>
          </FadeIn>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [aiData, setAiData] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <Router> {/* Router must be the outermost wrapper */}
      <AuthProvider>
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-[#fdfcfb]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3f8b8c] border-t-transparent"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HeroSection />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={<MenuLayout/>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/voicecapture" element={<VoiceCapture setAiData={setAiData} aiData={aiData} setSelectedPatientGlobal={setSelectedPatient} />} />
              <Route path="/templates" element={<Templates aiData={aiData} selectedPatient={selectedPatient} />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}