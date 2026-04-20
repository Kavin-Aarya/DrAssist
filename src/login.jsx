import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import Alert from "./alert";
import { AnimatePresence } from 'framer-motion';
import { useAuth } from "./AuthContext";

const Inp = ({ className = "", ...props }) => (
  <input {...props} className={`w-full bg-white/62 border border-[rgba(200,185,165,0.5)] rounded-xl px-3.5 py-3 text-sm text-[#1e1a14] outline-none transition-all duration-200 backdrop-blur-sm placeholder-[#c0b0a0] focus:border-[#3f8b8c] focus:shadow-[0_0_0_3px_rgba(63,139,140,0.11)] focus:bg-white/88 font-[Outfit,sans-serif] ${className}`} />
);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a09080]">{label}</label>
    {children}
  </div>
);

export default function FullPageLogin() {
  const { login } = useAuth();
  const slides = [
    { id: 0, image: "/assets/doctor1.png", title: "Effortless Hands-Free Prescriptions", desc: "Transform your clinical workflow and generate professional prescription sheets in just three simple steps." },
    { id: 1, image: "/assets/doctor2.png", title: "Seamless Patient Check-ups", desc: "Conduct your physical examinations without the distraction of manual note-taking." },
    { id: 2, image: "/assets/doctor3.png", title: "Smart AI Voice Documentation", desc: "Simply speak your diagnosis and treatment plan into the microphone. Our advanced AI captures your clinical notes in real-time with medical-grade accuracy." },
    { id: 3, image: "/assets/doctor4.png", title: "Instant Prescription Generation", desc: "Watch as your spoken words are instantly formatted into a structured, professional prescription sheet." },
    { id: 4, image: "/assets/doctor5.png", title: "Finalize & Deliver Care", desc: "Review and print the digitally generated sheet to hand over to your patient immediately." }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [hidePassword, setHidePassword] = useState(true);
  const [hideRetypePassword, setHideRetypePassword] = useState(true);
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "", reTypedPassword: "", dateOfBirth: "", phone: "", licenseNumber: "", clinicName: "", clinicAddress: "", specialization: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const navigate = useNavigate();

  const handleSubmit = async (s) => {
    s.preventDefault();
    if (isLogin) {
      try {
        const response = await fetch('http://localhost:5001/user/signin', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signInData) });
        const data = await response.json();
        if (data.status === "SUCCESS") 
        { 
          localStorage.setItem('token', data.token);
          login(data.data); 
          showAlert('success', 'Login Successful!'); 
          setTimeout(() => navigate("/dashboard"), 2000); 
        }
        else {
          showAlert('error', data.message);
        }
      } catch (error) { 
        console.error("Error connecting to server:", error); 
        showAlert('error', "Error connecting to server"); }
    } else {
      if (signUpData.password !== signUpData.reTypedPassword) { showAlert('error', "Passwords do not match!"); return; }
      try {
        const response = await fetch('http://localhost:5001/user/signup', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signUpData) });
        const data = await response.json();
        if (data.status === "SUCCESS") { login(data.data); showAlert('success', 'Account created successfully!'); setTimeout(() => navigate("/dashboard"), 2000); }
        else showAlert('error', data.message);
      } catch (error) { showAlert('error', "Error connecting to server"); }
    }
  };

  const goToSlide = useCallback((index) => {
    setIsFading(true);
    setTimeout(() => { setCurrentSlide(index); setIsFading(false); }, 300);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => { goToSlide((currentSlide + 1) % slides.length); }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, goToSlide]);

  

  return (
    <div className="min-h-screen flex font-[Outfit,sans-serif]">

      {/* Logo */}
      <div className="absolute top-7 left-6 z-50">
        <img src="/assets/Drassist white logo.png" alt="logo" className="h-7" />
      </div>

      {/* ══ LEFT PANEL ══ */}
      <div className="w-1/2 flex-shrink-0 flex flex-col items-center justify-between pt-[88px] pb-11 px-[52px] overflow-hidden relative"
        style={{ background: "linear-gradient(180deg,#3f8b8c 0%,#2d6667 50%,#1c4040 100%)" }}>

        {/* Decorative blobs */}
        <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(122,216,217,.18) 0%,transparent 65%)" }} />
        <div className="absolute -bottom-[80px] -left-[80px] w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 65%)" }} />
        <div className="absolute -bottom-[120px] -right-[120px] w-[380px] h-[380px] rounded-full border border-white/[0.06] pointer-events-none" />

        {/* Feature pills */}
        <div className="flex gap-2 flex-wrap justify-center z-10 mb-2">
          {["HIPAA Compliant", "AI-Powered", "Real-time"].map(t => (
            <span key={t} className="inline-flex items-center gap-1.5 bg-white/[0.12] border border-white/20 rounded-full px-3 py-1 text-[11.5px] font-semibold text-white/90 tracking-[0.02em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7dd8d9] flex-shrink-0" />
              {t}
            </span>
          ))}
        </div>

        {/* Slide */}
        <div key={currentSlide}
          className={`flex-1 flex flex-col items-center justify-center text-center z-10 w-full transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-full flex justify-center mb-7">
            <img src={slides[currentSlide].image} alt="doctor-image" className="w-[min(340px,78%)] block drop-shadow-[0_16px_32px_rgba(0,0,0,0.2)]" />
          </div>
          <div className="bg-white/[0.1] border border-white/[0.18] backdrop-blur-xl rounded-[18px] px-7 py-6 max-w-[380px] shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]">
            <h2 className="text-xl font-bold text-white m-0 mb-2.5 leading-snug tracking-[-0.01em]">
              {slides[currentSlide].title}
            </h2>
            <p className="text-[13.5px] text-white/72 leading-[1.7] m-0">
              {slides[currentSlide].desc}
            </p>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 z-10">
          {slides.map((slide, index) => (
            <button key={slide.id || index} type="button" aria-label={`Go to slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full border-none cursor-pointer p-0 transition-all duration-500 ease-in-out ${currentSlide === index ? 'w-8 bg-white' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-[52px] py-[72px] bg-[#f0ebe3]"
        style={{ backgroundImage: "radial-gradient(ellipse 65% 55% at 85% 8%,rgba(63,139,140,.13) 0%,transparent 60%),radial-gradient(ellipse 45% 55% at 8% 92%,rgba(160,130,200,.09) 0%,transparent 55%)" }}>

        {/* ── SIGN IN ── */}
        {isLogin && (
          <div className="w-full max-w-[420px]">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(63,139,140,0.09)] border border-[rgba(63,139,140,0.2)] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3f8b8c]" />
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#2d7071]">DrAssist</span>
              </div>
              <h1 className="text-[32px] font-extrabold text-[#1e1a14] m-0 mb-2 tracking-[-0.03em] leading-tight">Welcome back</h1>
              <p className="text-sm text-[#9a8a78] m-0 leading-snug">Sign in to continue to your clinical workspace</p>
            </div>

            <div className="bg-white/68 border border-white/92 backdrop-blur-[28px] rounded-3xl shadow-[0_8px_40px_rgba(80,60,30,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] px-7 py-7 mb-5">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Field label="Email Address">
                  <Inp type="text" value={signInData.email} onChange={(e) => setSignInData({ ...signInData, email: e.target.value })} placeholder="david@clinic.com" />
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <Inp type={hidePassword ? "password" : "text"} value={signInData.password} onChange={(p) => setSignInData({ ...signInData, password: p.target.value })} placeholder="Enter your password" className="pr-[46px]" />
                    <button type="button" onClick={() => setHidePassword(!hidePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#b0a090] flex p-0 hover:text-[#3f8b8c] transition-colors">
                      {hidePassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {isLogin && <a href="#" className="text-[11.5px] text-[#b0a090] text-right italic mt-0.5 no-underline hover:text-[#3f8b8c] transition-colors block">Forgot password?</a>}
                </Field>
                <button type="submit" className="w-full bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] text-white border-none rounded-xl py-[14px] text-[14.5px] font-bold cursor-pointer shadow-[0_4px_20px_rgba(63,139,140,0.32)] tracking-[0.02em] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_26px_rgba(63,139,140,0.42)]">
                  Sign in
                </button>
              </form>
            </div>

            <div className="flex items-center gap-3.5 my-5">
              <div className="flex-1 h-px bg-[rgba(200,185,165,0.45)]" />
              <span className="text-xs text-[#c0b0a0] italic">or continue with</span>
              <div className="flex-1 h-px bg-[rgba(200,185,165,0.45)]" />
            </div>

            <button className="flex items-center justify-center w-full bg-white/68 border border-[rgba(200,185,165,0.5)] rounded-xl py-[13px] cursor-pointer backdrop-blur-sm shadow-[0_2px_10px_rgba(80,60,30,0.06)] mb-6 transition-all duration-200 hover:bg-white/90 hover:border-[rgba(63,139,140,0.3)]">
              <img src="/assets/googlelogo.png" className="w-[18px] h-[18px] mr-2.5" alt="Google" />
              <span className="text-[13.5px] font-semibold text-[#5a4e40] font-[Outfit,sans-serif]">Sign in with Google</span>
            </button>

            <p className="text-center text-[13px] text-[#9a8a78] m-0">
              New user?{" "}
              <a href="#" className="font-bold text-[#3f8b8c] border-b border-[rgba(63,139,140,0.25)] pb-px no-underline hover:text-[#2d6667] transition-colors"
                onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>
                Create account →
              </a>
            </p>
          </div>
        )}

        {/* ── SIGN UP ── */}
        {!isLogin && (
          <div className="w-full max-w-[420px]">
            <div className="mb-9">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(63,139,140,0.09)] border border-[rgba(63,139,140,0.2)] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3f8b8c]" />
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#2d7071]">DrAssist</span>
              </div>
              <h1 className="text-[32px] font-extrabold text-[#1e1a14] m-0 mb-2 tracking-[-0.03em] leading-tight">Create account</h1>
              <p className="text-sm text-[#9a8a78] m-0 leading-snug">Enter your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
              <Field label="Full Name"><Inp type="text" value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} placeholder="Dr. David Brooks" /></Field>
              <Field label="Date of Birth"><Inp type="date" value={signUpData.dateOfBirth} onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })} /></Field>
              <Field label="Phone Number"><Inp type="tel" value={signUpData.phone} onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })} placeholder="+1 234 567 8900" /></Field>
              <Field label="Email Address"><Inp type="text" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} placeholder="david@clinic.com" /></Field>
              <Field label="Specialization"><Inp type="text" value={signUpData.specialization} onChange={(e) => setSignUpData({ ...signUpData, specialization: e.target.value })} placeholder="e.g. Cardiology" /></Field>
              <Field label="License Number"><Inp type="text" value={signUpData.licenseNumber} onChange={(e) => setSignUpData({ ...signUpData, licenseNumber: e.target.value })} placeholder="MED-2024-XXXX" /></Field>
              <Field label="Clinic Name"><Inp type="text" value={signUpData.clinicName} onChange={(e) => setSignUpData({ ...signUpData, clinicName: e.target.value })} placeholder="Your Clinic Name" /></Field>
              <Field label="Clinic Address"><Inp type="text" value={signUpData.clinicAddress} onChange={(e) => setSignUpData({ ...signUpData, clinicAddress: e.target.value })} placeholder="123 Medical Drive, City" /></Field>
              <Field label="Password">
                <div className="relative">
                  <Inp type={hidePassword ? "password" : "text"} value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} placeholder="Enter your password" className="pr-[46px]" />
                  <button type="button" onClick={() => setHidePassword(!hidePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#b0a090] flex p-0 hover:text-[#3f8b8c] transition-colors">
                    {hidePassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {isLogin && <a href="#" className="text-[11.5px] text-[#b0a090] text-right italic mt-0.5 no-underline block">Forgot password?</a>}
              </Field>
              <Field label="Re-enter Password">
                <div className="relative">
                  <Inp type={hideRetypePassword ? "password" : "text"} value={signUpData.reTypedPassword} onChange={(e) => setSignUpData({ ...signUpData, reTypedPassword: e.target.value })} placeholder="Confirm your password" className="pr-[46px]" />
                  <button type="button" onClick={() => setHideRetypePassword(!hideRetypePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#b0a090] flex p-0 hover:text-[#3f8b8c] transition-colors">
                    {hideRetypePassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {isLogin && <a href="#" className="text-[11.5px] text-[#b0a090] text-right italic mt-0.5 no-underline block">Forgot password?</a>}
              </Field>
              <button type="submit" className="w-full bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] text-white border-none rounded-xl py-[13px] text-sm font-bold cursor-pointer shadow-[0_4px_18px_rgba(63,139,140,0.3)] mt-2 tracking-[0.02em] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_26px_rgba(63,139,140,0.42)]">
                Create Account
              </button>
            </form>

            <div className="mt-6">
              <p className="text-center text-[13px] text-[#9a8a78] m-0">
                Already have an account?{" "}
                <a href="#" className="font-bold text-[#3f8b8c] border-b border-[rgba(63,139,140,0.25)] pb-px no-underline hover:text-[#2d6667] transition-colors"
                  onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>
                  Sign in
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {alert.show && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
        )}
      </AnimatePresence>
    </div>
  );
}