import React, { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function MenuLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isSettingsActive = currentPath === "/settings";
  const { user } = useAuth();

  const menus = [
    {
      title: "Dashboard",
      icon_act: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
          <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
        </svg>
      ),
      icon_not_act: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      path: "/dashboard",
    },
    {
      title: "Voice Capture",
      icon_act: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
        </svg>
      ),
      icon_not_act: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
      ),
      path: "/voicecapture",
    },
    {
      title: "Templates",
      icon_act: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
          <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
          <path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z" />
        </svg>
      ),
      icon_not_act: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
        </svg>
      ),
      path: "/templates",
    },
    {
      title: "History",
      icon_act: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
        </svg>
      ),
      icon_not_act: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      path: "/history",
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden font-[Outfit,sans-serif]">

      {/* ── SIDEBAR ── */}
      <div className={`relative flex flex-col flex-shrink-0 h-screen overflow-hidden transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(30,68,69,0.18)] ${sidebarOpen ? 'w-56' : 'w-[72px]'}`}
        style={{ background: "linear-gradient(180deg,#3a8485 0%,#2d6667 60%,#1e4445 100%)" }}>

        {/* Decorative blobs */}
        <div className="absolute -top-[60px] -right-[60px] w-[180px] h-[180px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.07) 0%,transparent 70%)" }} />
        <div className="absolute bottom-[60px] -left-[40px] w-[130px] h-[130px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.05) 0%,transparent 70%)" }} />

        {/* Top: logo + toggle */}
        <div className={`flex items-center px-5 py-7 border-b border-white/[0.08] mb-2 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <img src="/assets/Drassist white logo.png" className="h-[38px] object-contain flex-shrink-0" alt="logo" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/[0.12] text-white/85 cursor-pointer transition-all duration-200 hover:bg-white/[0.18] hover:text-white flex-shrink-0"
          >
            {sidebarOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 px-3 py-2 overflow-y-auto scrollbar-none">
          {sidebarOpen && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35 px-3 pt-2 pb-1.5">Menu</p>
          )}
          {menus.map((item, index) => {
            const isActive = currentPath === item.path;
            return (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer border transition-all duration-200 overflow-hidden whitespace-nowrap group
                  ${isActive
                    ? 'bg-white/15 text-white border-white/[0.18] shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]'
                    : 'text-white/65 border-transparent hover:bg-white/10 hover:text-white hover:border-white/[0.08] hover:translate-x-0.5'
                  }
                  ${!sidebarOpen ? 'justify-center' : ''}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                )}
                <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {isActive ? item.icon_act : item.icon_not_act}
                </span>
                {sidebarOpen && (
                  <span className="text-[13.5px] font-medium">{item.title}</span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1e3a3b] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.2)] pointer-events-none z-50">
                    {item.title}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-white/[0.08] mx-3" />

        {/* Profile / Settings */}
        <div className="p-3">
          <div
            onClick={() => navigate("/settings")}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer border transition-all duration-200 overflow-hidden group
              ${isSettingsActive
                ? 'bg-white/15 text-white border-white/[0.18] shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-white/65 border-transparent hover:bg-white/10 hover:text-white hover:border-white/[0.08] hover:translate-x-0.5'
              }
              ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            {isSettingsActive && (
              <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            )}
            <div className="w-9 h-9 rounded-[10px] bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-[1.08]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name || "Doctor"}</p>
                <p className="text-[11px] text-white/50 truncate">View Profile</p>
              </div>
            )}
            {!sidebarOpen && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1e3a3b] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.2)] pointer-events-none z-50">
                Settings
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto h-full bg-[#f4efe8]"
        style={{ backgroundImage: "radial-gradient(ellipse 60% 40% at 80% 5%,rgba(63,139,140,0.1) 0%,transparent 60%),radial-gradient(ellipse 40% 50% at 5% 90%,rgba(160,130,200,0.07) 0%,transparent 55%)" }}>
        <Outlet />
      </main>
    </div>
  );
}