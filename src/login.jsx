import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function FullPageLogin() {
  const slides=[
    { id: 0, image: "assets/doctor1.png", title: "Effortless Hands-Free Prescriptions", desc: "Transform your clinical workflow and generate professional prescription sheets in just three simple steps." },
    { id: 1, image: "assets/doctor2.png", title: "Seamless Patient Check-ups", desc: "Conduct your physical examinations without the distraction of manual note-taking." },
    { id: 2, image: "assets/doctor3.png", title: "Smart AI Voice Documentation", desc: "Simply speak your diagnosis and treatment plan into the microphone. Our advanced AI captures your clinical notes in real-time with medical-grade accuracy." },
    { id: 3, image: "assets/doctor4.png", title: "Instant Prescription Generation", desc: "Watch as your spoken words are instantly formatted into a structured, professional prescription sheet." },
    { id: 4, image: "assets/doctor5.png", title: "Finalize & Deliver Care", desc: "Review and print the digitally generated sheet to hand over to your patient immediately." }
  ]

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();           // stop page reload
    navigate("/dashboard");    // go to video/voice capture page
  };

  // Function to handle slide change (used by timer AND click)
  const goToSlide = useCallback((index) => {
    setIsFading(true); // 1. Start Fade Out
    setTimeout(() => {
      setCurrentSlide(index); // 2. Swap Content
      setIsFading(false); // 3. Start Fade In
    }, 300); // This delay should be slightly shorter than the duration-500 class
  }, []);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      goToSlide(nextSlide);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, goToSlide]);
  

  return (
    /* 'min-h-screen' ensures the page is at least as tall as the window */
    /* 'flex-col' stacks items vertically on small screens */
    /* 'md:flex-row' puts them side-by-side on medium screens and up */
    <div className="min-h-screen flex flex-col md:flex-row">
       {/* Left and Right sections will go here */}
       <div className="absolute flex-shrink-0 cursor-pointer z-50">
          <img 
            src="assets/Drassist copy.png" 
            alt="Logo" 
            className={"transition-all duration-300 h-7 ml-5 mt-10"} 
          />
        </div>
       
       {/* LEFT SECTION */}
        <div className="w-full md:w-1/2 bg-[#a3c4bc] flex flex-col items-center p-12 text-white overflow-hidden relative">
          {/* We use 'justify-between' to keep the dots at the bottom and content in the middle */}
          
          
          <div key={currentSlide} className={`flex-1 flex flex-col justify-center items-center text-center transition-opacity duration-300 ${
    isFading ? "opacity-0" : "opacity-100 animate-slide-flow"
  }`}>
            {/* Illustration */}
            <img src={slides[currentSlide].image} alt="doctor-image" className="w-64 md:w-120 mb-8" />
            
            <h2 className="text-4xl font-semibold mb-4">{slides[currentSlide].title}</h2>
            <p className="text-lg opacity-90 max-w-sm leading-relaxed">
            {slides[currentSlide].desc}
            </p>
          </div>

          {/* CLICKABLE DOTS */}
          <div className="flex justify-center space-x-3 mt-8 z-10">
            {slides.map((slide, index) => (
              <button
                key={slide.id || index} 
                onClick={() => goToSlide(index)}
                type="button" // Prevents accidental form submission
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 transition-all duration-500 ease-in-out rounded-full cursor-pointer ${
                  currentSlide === index 
                    ? "w-7 bg-white"          // This makes the active one a long pill/rectangle
                    : "w-2 bg-white/40"       // This keeps inactive ones as small circles
                }`}
              />
            ))}
          </div>
        </div>


        {/* RIGHT SECTION */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 md:p-20 ">
            <div className="w-full max-w-md">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-semibold text-gray-700 mb-8">Welcome back!</h1>
                <h3 className="text-gray-400 font-medium text-xl">Sign in to get started</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-8">
                  
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-400 font-semibold mb-2">Users name or Email</label>
                    <input 
                      type="text" 
                      placeholder="David Brooks"
                      className="border-b-2 border-gray-100 py-3 focus:outline-none focus:border-[#3f8b8c] transition-all text-lg text-gray-700"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-400 font-semibold mb-2">Password</label>
                    <input 
                      type="password" placeholder="Enter your Password"
                      className="border-b-2 border-gray-100 py-3 focus:outline-none focus:border-[#3f8b8c] transition-all text-lg text-gray-700"
                    />
                    <a href="#" className="text-right text-xs text-gray-400 mt-2 hover:text-gray-600 italic">Forgot password?</a>
                  </div>

                  <button type="submit" className="w-full bg-gray-800  text-white py-4 rounded-full font-bold text-xl hover:bg-[#6b6b6b] transition-all shadow-xl">
                    Sign in
                  </button>

                </div>

              </form>

              {/* Bottom Decorations */}
              <div className="mt-12">
                <div className="flex items-center mb-8">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="px-4 text-sm text-gray-300 italic">or</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <button className="flex items-center justify-center w-full border border-gray-200 py-4 rounded-2xl hover:bg-gray-50 transition-colors mb-10">
                  <img src="assets/googlelogo.png" className="w-5 h-5 mr-3" alt="Google" />
                  <span className="text-gray-600 font-semibold">Sign in with Google</span>
                </button>

                <p className="text-center text-sm text-gray-400">
                  New User? 
                  <a href="#" className="ml-3 font-bold border-b border-gray-300 text-gray-500 hover:text-[#3f8b8c] transition-colors">Create Account</a>
                </p>
              </div>
            </div>
        </div>
    </div>
  );
}