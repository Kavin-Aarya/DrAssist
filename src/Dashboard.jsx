import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  MicrophoneIcon, BellIcon, ShieldCheckIcon,
  ClockIcon, UserGroupIcon, DocumentCheckIcon,
  ChevronUpIcon, ChevronDownIcon
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const data7d  = { labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], notes:[18,24,19,32,28,14,21], rx:[8,11,9,14,12,6,9] };
const data30d = { labels:["Week 1","Week 2","Week 3","Week 4"], notes:[82,97,76,110], rx:[38,44,35,51] };
const data90d = { labels:["January","February","March"], notes:[310,280,365], rx:[142,128,168] };

const APPOINTMENTS = [
  { time:"09:00", initials:"MK", name:"Maya Krishnan",  type:"Cardiology · Follow-up",  color:"rgba(63,139,140,.1)",  textColor:"#2d7071",  badge:"Done",    badgeBg:"#E1F5EE", badgeText:"#085041" },
  { time:"10:30", initials:"RP", name:"Raj Patel",       type:"ECG · New patient",        color:"rgba(186,117,23,.1)", textColor:"#633806",  badge:"Now",     badgeBg:"#FAEEDA", badgeText:"#633806" },
  { time:"12:00", initials:"AL", name:"Amara Luo",       type:"Stress Test · Review",     color:"rgba(83,74,183,.1)", textColor:"#3C3489",  badge:"Next",    badgeBg:"#EEEDFE", badgeText:"#3C3489" },
  { time:"14:30", initials:"JC", name:"James Chen",      type:"Holter · Results",         color:"rgba(212,83,126,.1)",textColor:"#72243E",  badge:"Pending", badgeBg:"#F1EFE8", badgeText:"#5F5E5A" },
  { time:"16:00", initials:"SN", name:"Sofia Nguyen",    type:"Hypertension · Check",     color:"rgba(15,110,86,.1)", textColor:"#085041",  badge:"Pending", badgeBg:"#F1EFE8", badgeText:"#5F5E5A" },
];

const NOTES = [
  { name:"Maya Krishnan",  time:"2h ago",    tag:"Cardiology",   tagBg:"#E1F5EE", tagText:"#085041", rxCount:1, preview:"Patient presented with palpitations. ECG normal sinus rhythm. Metformin 500mg prescribed BID..." },
  { name:"Arjun Sharma",   time:"Yesterday", tag:"Hypertension", tagBg:"#EEEDFE", tagText:"#3C3489", rxCount:2, preview:"BP 142/88 mmHg. Lifestyle counselling provided. Amlodipine 5mg OD continued..." },
  { name:"Priya Menon",    time:"2 days ago",tag:"Diabetes",     tagBg:"#FAEEDA", tagText:"#633806", rxCount:3, preview:"HbA1c 7.8%. Medication adherence reviewed. Insulin dosage adjusted per protocol..." },
];

const INSIGHTS = [
  { iconColor:"#3f8b8c", iconBg:"rgba(63,139,140,.1)", text:<><b>3 patients</b> are due for follow-up this week with unreviewed lab results pending from last visit.</> },
  { iconColor:"#ba7517",  iconBg:"rgba(186,117,23,.1)", text:<><b>Raj Patel's</b> current appointment shows elevated risk markers — review prior cardiac history before consultation.</> },
  { iconColor:"#0f6e56",  iconBg:"rgba(15,110,86,.1)",  text:<>Voice note generation is <b>↑ 23% this week</b>, saving an estimated 2.4 hours of documentation time daily.</> },
  { iconColor:"#534AB7",  iconBg:"rgba(83,74,183,.1)",  text:<><b>Prescription template</b> "Cardiology Standard" was used 18 times today — your most-used template.</> },
];

const glassCard = "bg-white/58 border border-white/88 backdrop-blur-2xl rounded-[20px] shadow-[0_4px_24px_rgba(80,60,30,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]";
const glassDeep = "bg-white/68 border border-white/92 backdrop-blur-[32px] rounded-[20px] shadow-[0_6px_32px_rgba(80,60,30,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]";

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#a09080] mb-4">
    {children}
    <span className="flex-1 h-px bg-[rgba(200,185,165,0.35)]" />
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState("7d");

  const today = new Date().toLocaleDateString("en-US", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const periodData = period === "7d" ? data7d : period === "30d" ? data30d : data90d;

  const barData = {
    labels: periodData.labels,
    datasets: [
      { label:"Voice Notes",    data:periodData.notes, backgroundColor:"rgba(63,139,140,0.75)",  borderRadius:6, borderSkipped:false },
      { label:"Prescriptions",  data:periodData.rx,    backgroundColor:"rgba(186,117,23,0.65)", borderRadius:6, borderSkipped:false },
    ],
  };

  const barOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:"rgba(30,26,20,0.88)", titleFont:{ family:"Outfit", size:12 }, bodyFont:{ family:"Outfit", size:12 }, cornerRadius:10, padding:10 } },
    scales:{
      x:{ grid:{ display:false }, ticks:{ color:"#a09080", font:{ family:"Outfit", size:11 } }, border:{ display:false } },
      y:{ grid:{ color:"rgba(200,185,165,0.2)" }, ticks:{ color:"#a09080", font:{ family:"Outfit", size:11 } }, border:{ display:false } },
    },
  };

  const donutData = {
    datasets:[{ data:[99.2, 0.8], backgroundColor:["#3f8b8c","rgba(200,185,165,0.3)"], borderWidth:0, hoverOffset:0 }],
  };
  const donutOptions = { responsive:true, maintainAspectRatio:false, cutout:"78%", plugins:{ legend:{ display:false }, tooltip:{ enabled:false } } };

  const kpis = [
    { icon:<UserGroupIcon className="w-[18px] h-[18px]" />, iconBg:"rgba(63,139,140,.1)", iconColor:"#3f8b8c", val:"48",    label:"Patients Today",          change:"↑ 12% vs yesterday", up:true, blob:"#3f8b8c" },
    { icon:<DocumentCheckIcon className="w-[18px] h-[18px]" />, iconBg:"rgba(15,110,86,.1)", iconColor:"#0f6e56", val:"127",  label:"Notes Generated",          change:"↑ 8% this week",     up:true, blob:"#0f6e56" },
    { icon:<ClockIcon className="w-[18px] h-[18px]" />, iconBg:"rgba(186,117,23,.1)", iconColor:"#ba7517", val:"2.4h", label:"Time Saved",                change:"↑ 18 min vs avg",    up:true, blob:"#ba7517" },
    { icon:<ShieldCheckIcon className="w-[18px] h-[18px]" />, iconBg:"rgba(226,75,74,.1)", iconColor:"#e24b4a", val:"99.2%",label:"Transcription Accuracy",   change:"↓ 0.3% vs last wk", up:false,blob:"#e24b4a" },
  ];

  const quickActions = [
    { label:"Voice Capture", sub:"Start recording",   bg:"rgba(63,139,140,.1)",  color:"#3f8b8c",  path:"/voicecapture" },
    { label:"Templates",     sub:"Prescription forms", bg:"rgba(15,110,86,.1)",   color:"#0f6e56",  path:"/templates" },
    { label:"History",       sub:"Past records",       bg:"rgba(186,117,23,.1)",  color:"#ba7517",  path:"/history" },
    { label:"Settings",      sub:"Profile & clinic",   bg:"rgba(83,74,183,.1)",   color:"#534AB7",  path:"/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#f0ebe3] font-[Outfit,sans-serif] p-7"
      style={{ backgroundImage:"radial-gradient(ellipse 70% 50% at 80% 10%,rgba(63,139,140,.13) 0%,transparent 65%),radial-gradient(ellipse 45% 55% at 5% 90%,rgba(160,130,200,.09) 0%,transparent 55%)" }}>

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a8a78] mb-1.5">Good morning</p>
          <h1 className="text-[26px] font-bold text-[#1e1a14] tracking-[-0.02em] leading-none">{user?.name || "Dr. Sarah Chen"}</h1>
          <p className="text-[13px] text-[#9a8a78] mt-1">{today} · {user?.specialization || "Cardiology"}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative w-[38px] h-[38px] rounded-[11px] bg-white/62 border border-[rgba(200,185,165,0.5)] flex items-center justify-center cursor-pointer backdrop-blur-sm">
            <BellIcon className="w-4 h-4 text-[#7a6e5e]" />
            <div className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-[#e24b4a] border-[1.5px] border-[#f0ebe3]" />
          </div>
          <button onClick={() => navigate("/voicecapture")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] text-white border-none rounded-xl text-[13px] font-semibold cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.32)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(63,139,140,0.4)] font-[Outfit,sans-serif]">
            <MicrophoneIcon className="w-[14px] h-[14px]" />
            New Voice Note
          </button>
        </div>
      </div>

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {kpis.map(({ icon, iconBg, iconColor, val, label, change, up, blob }) => (
          <div key={label} className={`${glassCard} p-5 relative overflow-hidden`}>
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3.5 flex-shrink-0" style={{ background:iconBg, color:iconColor }}>{icon}</div>
            <div className="text-[28px] font-bold tracking-[-0.03em] text-[#1e1a14] leading-none">{val}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a09080] mt-1.5">{label}</div>
            <div className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-[6px] mt-2 ${up ? "text-[#085041] bg-[#E1F5EE]" : "text-[#791f1f] bg-[#FCEBEB]"}`}>{change}</div>
            <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full opacity-[0.12]" style={{ background:blob }} />
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns:"1fr 340px" }}>

        {/* Activity chart */}
        <div className={`${glassDeep} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[15px] font-semibold text-[#1e1a14]">Clinical Activity</div>
              <div className="text-xs text-[#9a8a78] mt-0.5">Voice notes & prescriptions generated</div>
            </div>
            <div className="flex bg-[rgba(240,235,228,0.7)] rounded-[9px] p-[3px] gap-0.5">
              {["7d","30d","90d"].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-[7px] border-none cursor-pointer font-[Outfit,sans-serif] transition-all duration-200 ${period===p ? "bg-white text-[#1e1a14] shadow-[0_1px_6px_rgba(80,60,30,0.1)]" : "bg-transparent text-[#9a8a78] hover:text-[#1e1a14]"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            {[["#3f8b8c","Voice Notes"],["#ba7517","Prescriptions"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-[#9a8a78]">
                <div className="w-2 h-2 rounded-sm" style={{ background:c }} />{l}
              </div>
            ))}
          </div>
          <div className="relative h-[200px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Quick actions + donut */}
        <div className={`${glassDeep} p-[22px]`}>
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map(({ label, sub, bg, color, path }) => (
              <button key={label} onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-[14px] cursor-pointer border border-[rgba(200,185,165,0.4)] bg-white/50 transition-all duration-200 hover:border-[#3f8b8c] hover:bg-[rgba(63,139,140,0.06)] hover:-translate-y-px font-[Outfit,sans-serif] text-center">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background:bg }}>
                  <MicrophoneIcon className="w-[18px] h-[18px]" style={{ color }} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#2c2416]">{label}</div>
                  <div className="text-[10.5px] text-[#a09080] mt-px">{sub}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(200,185,165,0.25)]">
            <SectionLabel>AI Performance</SectionLabel>
            <div className="flex items-center gap-4">
              <div className="relative w-[80px] h-[80px] flex-shrink-0">
                <Doughnut data={donutData} options={donutOptions} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-[#1e1a14] tracking-[-0.02em]">99.2%</div>
                <div className="text-[11px] text-[#9a8a78] mt-0.5">Transcription accuracy</div>
                <div className="flex gap-2.5 mt-2">
                  <span className="text-[11px] text-[#9a8a78]">Processed: <b className="text-[#1e1a14]">1,247</b></span>
                  <span className="text-[11px] text-[#9a8a78]">Errors: <b className="text-[#e24b4a]">10</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Appointments */}
        <div className={`${glassDeep} p-[22px]`}>
          <SectionLabel>Today's Schedule</SectionLabel>
          {APPOINTMENTS.map(({ time, initials, name, type, color, textColor, badge, badgeBg, badgeText }) => (
            <div key={name} className="flex items-center gap-3 py-[11px] border-b border-[rgba(200,185,165,0.2)] last:border-b-0 last:pb-0 first:pt-0">
              <div className="text-[11px] font-bold text-[#9a8a78] w-[46px] flex-shrink-0 tracking-[0.03em]">{time}</div>
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[13px] font-bold flex-shrink-0" style={{ background:color, color:textColor }}>{initials}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1e1a14] truncate">{name}</div>
                <div className="text-[11px] text-[#9a8a78] mt-px">{type}</div>
              </div>
              <div className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] whitespace-nowrap flex-shrink-0" style={{ background:badgeBg, color:badgeText }}>{badge}</div>
            </div>
          ))}
        </div>

        {/* Recent Notes */}
        <div className={`${glassDeep} p-[22px]`}>
          <SectionLabel>Recent Clinical Notes</SectionLabel>
          {NOTES.map(({ name, time, tag, tagBg, tagText, rxCount, preview }) => (
            <div key={name} className="p-3.5 rounded-xl bg-[rgba(248,244,238,0.6)] border border-[rgba(200,185,165,0.3)] mb-2 last:mb-0 cursor-pointer transition-all duration-200 hover:bg-white/80 hover:border-[rgba(63,139,140,0.25)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-[#1e1a14]">{name}</span>
                <span className="text-[10.5px] text-[#b0a090]">{time}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] uppercase tracking-[0.05em]" style={{ background:tagBg, color:tagText }}>{tag}</span>
                <span className="text-[10px] text-[#9a8a78]">· {rxCount} prescription{rxCount>1?"s":""}</span>
              </div>
              <div className="text-[11.5px] text-[#9a8a78] whitespace-nowrap overflow-hidden text-ellipsis">{preview}</div>
            </div>
          ))}
        </div>

        {/* AI Insights */}
        <div className={`${glassDeep} p-[22px]`}>
          <SectionLabel>AI Insights</SectionLabel>
          {INSIGHTS.map(({ iconColor, iconBg, text }, i) => (
            <div key={i} className="flex gap-3 py-[11px] border-b border-[rgba(200,185,165,0.2)] items-start last:border-b-0 last:pb-0 first:pt-0">
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0 mt-px" style={{ background:iconBg }}>
                <ShieldCheckIcon className="w-3.5 h-3.5" style={{ color:iconColor }} />
              </div>
              <div className="text-[12.5px] text-[#2c2416] leading-[1.55]">{text}</div>
            </div>
          ))}

          {/* Status bar */}
          <div className="flex items-center justify-between mt-4 px-5 py-3 rounded-[14px] bg-[rgba(63,139,140,0.07)] border border-[rgba(63,139,140,0.18)]">
            {[["AI Model Online"],["HIPAA Secure"],["v1.0.5"]].map(([label]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-[#2d7071]">
                <div className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />{label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}