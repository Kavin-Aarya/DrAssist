import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";

const PATIENTS = [
  { id:1, initials:"MK", name:"Maya Krishnan",  age:42, gender:"Female", condition:"Cardiology",   dob:"14 Aug 1983", phone:"+91 98765 43210", blood:"O+", tagBg:"#E1F5EE", tagText:"#085041", avBg:"rgba(63,139,140,.12)", avColor:"#2d7071", visits:3,
    records:[{ date:"21 Mar 2026, 09:14 AM", duration:"4m 32s", diagnosis:"Paroxysmal SVT — controlled", bp:"118/74", hr:"72 bpm", ecg:"Normal sinus rhythm", transcript:"Patient presented with mild palpitations and occasional dizziness post-exercise. On examination, BP was 118 over 74 mmHg and heart rate was 72 beats per minute. ECG revealed normal sinus rhythm with no significant ST changes. Patient denies chest pain at rest. Advised to reduce caffeine intake and avoid high-intensity exercise until follow-up. Prescribing Metoprolol 25mg once daily and Aspirin 75mg after dinner, both for 30 days.", meds:[{n:"Metoprolol",d:"25mg · Once daily",dur:"30 days"},{n:"Aspirin",d:"75mg · After dinner",dur:"30 days"}] }] },
  { id:2, initials:"RP", name:"Raj Patel",       age:55, gender:"Male",   condition:"Cardiology",   dob:"3 Jan 1971",  phone:"+91 90123 45678", blood:"B+", tagBg:"#E1F5EE", tagText:"#085041", avBg:"rgba(63,139,140,.18)", avColor:"#085041", visits:1,
    records:[{ date:"21 Mar 2026, 10:45 AM", duration:"6m 11s", diagnosis:"Suspected CAD — under investigation", bp:"138/86", hr:"88 bpm", ecg:"Stress test pending", transcript:"New patient referred for stress ECG evaluation. Family history of coronary artery disease. Reports exertional chest discomfort for the past 3 weeks. On examination BP is 138 over 86 and heart rate 88 per minute. LDL cholesterol 142 mg per dL. Treadmill stress test booked. Initiating Atorvastatin 40mg at bedtime for 60 days. Nitroglycerine spray prescribed for SOS use.", meds:[{n:"Atorvastatin",d:"40mg · Bedtime",dur:"60 days"},{n:"Nitroglycerine",d:"0.5mg spray · SOS",dur:"PRN"}] }] },
  { id:3, initials:"AS", name:"Arjun Sharma",    age:48, gender:"Male",   condition:"Hypertension", dob:"22 May 1977", phone:"+91 87654 32109", blood:"A+", tagBg:"#EEEDFE", tagText:"#3C3489", avBg:"rgba(83,74,183,.1)",  avColor:"#3C3489", visits:5,
    records:[{ date:"20 Mar 2026, 2:30 PM",  duration:"3m 44s", diagnosis:"Essential hypertension — controlled", bp:"136/84", hr:"76 bpm", ecg:"N/A", transcript:"Follow-up for essential hypertension. Patient reports good compliance with medication. BP today is 136 over 84, compared to 152 over 96 six weeks ago — significant improvement. BMI 27.4, classified as overweight. Counselled on sodium restriction and daily walking. Continuing Amlodipine 5mg morning and Telmisartan 40mg morning both for 60 days.", meds:[{n:"Amlodipine",d:"5mg · Morning",dur:"60 days"},{n:"Telmisartan",d:"40mg · Morning",dur:"60 days"}] }] },
  { id:4, initials:"PM", name:"Priya Menon",     age:36, gender:"Female", condition:"Diabetes",     dob:"8 Oct 1989",  phone:"+91 76543 21098", blood:"AB+",tagBg:"#FAEEDA", tagText:"#633806", avBg:"rgba(186,117,23,.1)", avColor:"#633806", visits:4,
    records:[{ date:"20 Mar 2026, 11:00 AM", duration:"5m 08s", diagnosis:"Type 2 DM — suboptimal control", bp:"122/78", hr:"80 bpm", ecg:"N/A", transcript:"Quarterly diabetes review. HbA1c today is 7.8%, slightly above target of under 7%. Fasting blood glucose was 138 mg per dL. Foot examination is normal with no ulcers or peripheral neuropathy detected. Patient has lost 2 kilograms since last visit. Adjusting Metformin to 1000mg twice daily, continuing Glipizide 5mg before breakfast, and adding Vitamin D3 60,000 IU weekly for 8 weeks.", meds:[{n:"Metformin",d:"1000mg · After meals BD",dur:"90 days"},{n:"Glipizide",d:"5mg · Before breakfast",dur:"90 days"},{n:"Vitamin D3",d:"60,000 IU · Weekly",dur:"8 weeks"}] }] },
  { id:5, initials:"JC", name:"James Chen",      age:61, gender:"Male",   condition:"Cardiology",   dob:"17 Feb 1965", phone:"+91 65432 10987", blood:"O-", tagBg:"#E1F5EE", tagText:"#085041", avBg:"rgba(63,139,140,.08)", avColor:"#2d7071", visits:2,
    records:[{ date:"19 Mar 2026, 3:30 PM",  duration:"4m 55s", diagnosis:"PACs — benign, discharged", bp:"126/80", hr:"68 bpm", ecg:"PAC 4.2% — benign", transcript:"Holter monitor results reviewed for James Chen. 24-hour study shows occasional premature atrial contractions with a PAC burden of 4.2%, which is within the benign threshold. Maximum heart rate recorded was 142 beats per minute during exercise. No sustained arrhythmia was detected. Patient is reassured. Discharged with Magnesium Glycinate 400mg at bedtime for 30 days. Follow-up in 3 months.", meds:[{n:"Magnesium Glycinate",d:"400mg · Bedtime",dur:"30 days"}] }] },
  { id:6, initials:"SN", name:"Sofia Nguyen",    age:29, gender:"Female", condition:"Hypertension", dob:"5 Mar 1997",  phone:"+91 54321 09876", blood:"B-", tagBg:"#EEEDFE", tagText:"#3C3489", avBg:"rgba(83,74,183,.08)", avColor:"#534AB7", visits:1,
    records:[{ date:"18 Mar 2026, 4:00 PM",  duration:"3m 21s", diagnosis:"Stage 1 hypertension — new", bp:"148/92", hr:"84 bpm", ecg:"N/A", transcript:"Initial consultation for newly diagnosed Stage 1 hypertension. Clinic BP reads 148 over 92 mmHg. White coat effect is possible. Ambulatory blood pressure monitoring has been ordered. SCORE2 cardiovascular risk is 8%, moderate. Initiating lifestyle modification as first step — sodium restriction, exercise and weight management counselled. Starting Ramipril 2.5mg in the morning for 30 days. Review in 4 weeks.", meds:[{n:"Ramipril",d:"2.5mg · Morning",dur:"30 days"}] }] },
];

const FILTERS = ["All","Cardiology","Hypertension","Diabetes"];
const glassCard = "bg-white/58 border border-white/88 backdrop-blur-2xl rounded-[20px] shadow-[0_4px_24px_rgba(80,60,30,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]";
const glassDeep = "bg-white/68 border border-white/92 backdrop-blur-[32px] rounded-[20px] shadow-[0_6px_32px_rgba(80,60,30,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]";

// Waveform bar heights seeded per patient id
const waveHeights = (id, count) => Array.from({length:count}, (_,i) => 8 + Math.round(Math.abs(Math.sin(i*0.7+id*1.3)*22)));

function MiniWave() {
  const h = [6,10,14,8,18,12,16,9,13,18,7,15,11,17,8,14,10,16];
  return (
    <div className="flex items-center gap-0.5 h-[18px]">
      {h.map((ht,i) => <div key={i} style={{ width:2, height:ht, background:"#3f8b8c", borderRadius:1, opacity:.5 }} />)}
    </div>
  );
}

function AudioPlayer({ patientId, duration }) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const total = 48;
  const heights = waveHeights(patientId, total);
  const intervalRef = useRef(null);

  const toggle = () => {
    if (playing) {
      clearInterval(intervalRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      setPos(0);
    }
  };

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setPos(p => {
          if (p >= total - 1) { clearInterval(intervalRef.current); setPlaying(false); return 0; }
          return p + 1;
        });
      }, 80);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  return (
    <div className="flex items-center gap-2.5 bg-[rgba(63,139,140,0.06)] border border-[rgba(63,139,140,0.18)] rounded-[10px] px-3.5 py-2.5 mb-3">
      <button onClick={toggle}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] border-none flex items-center justify-center cursor-pointer flex-shrink-0 shadow-[0_2px_8px_rgba(63,139,140,0.3)] transition-all duration-200 hover:scale-105">
        {playing
          ? <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          : <svg width="11" height="11" viewBox="0 0 24 24" fill="white" style={{marginLeft:2}}><polygon points="5 3 19 12 5 21 5 3"/></svg>
        }
      </button>
      <div className="flex-1 flex items-center gap-0.5 h-7 cursor-pointer">
        {heights.map((h, i) => (
          <div key={i} onClick={() => setPos(i)}
            style={{ width:4, height:h, borderRadius:2, background:"#3f8b8c", opacity: i <= pos ? 1 : 0.35, flexShrink:0, transition:"opacity .1s" }} />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-[#2d7071] whitespace-nowrap">{duration}</span>
    </div>
  );
}

const Chip = ({ children }) => (
  <div className="flex items-center gap-1 text-[11px] font-medium text-[#9a8a78] bg-[rgba(240,235,228,0.7)] border border-[rgba(200,185,165,0.35)] rounded-[6px] px-2 py-0.5">
    {children}
  </div>
);

const SectionLabel = ({ children, extra }) => (
  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#a09080] mb-3.5">
    {children}<span className="flex-1 h-px bg-[rgba(200,185,165,0.35)]" />
    {extra && <span className="text-[11px] font-normal text-[#b0a090] normal-case tracking-normal">{extra}</span>}
  </div>
);

export default function History() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState(1);
  const [filter,   setFilter]   = useState("All");
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("date");
  const [tab,      setTab]      = useState("clip"); // "clip" | "rx"

  const filtered = useMemo(() => {
    let list = [...PATIENTS];
    if (filter !== "All") list = list.filter(p => p.condition === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q) ||
        p.records.some(r =>
          r.diagnosis.toLowerCase().includes(q) ||
          r.transcript.toLowerCase().includes(q) ||
          r.meds.some(m => m.n.toLowerCase().includes(q))
        )
      );
    }
    if (sort === "name")   list.sort((a,b) => a.name.localeCompare(b.name));
    if (sort === "date")   list.sort((a,b) => new Date(b.records[0].date) - new Date(a.records[0].date));
    if (sort === "visits") list.sort((a,b) => b.visits - a.visits);
    return list;
  }, [filter, search, sort]);

  const active = PATIENTS.find(p => p.id === activeId) || PATIENTS[0];
  const rec = active.records[0];

  // reset tab when patient changes
  useEffect(() => { setTab("clip"); }, [activeId]);

  const STATS = [
    { val:PATIENTS.length, label:"Total Patients",   sub:"This clinic only",        blob:"#3f8b8c" },
    { val:PATIENTS.reduce((s,p)=>s+p.visits,0), label:"Visit Records", sub:"↑ 23 this month", blob:"#0f6e56" },
    { val:PATIENTS.reduce((s,p)=>s+p.records.reduce((x,r)=>x+r.meds.length,0),0), label:"Prescriptions", sub:"Avg 1.3 per visit", blob:"#ba7517" },
    { val:"99.2%", label:"AI Accuracy", sub:"All clips processed", blob:"#534AB7" },
  ];

  return (
    <div className="min-h-screen bg-[#f0ebe3] font-[Outfit,sans-serif] p-7"
      style={{ backgroundImage:"radial-gradient(ellipse 70% 50% at 80% 10%,rgba(63,139,140,.13) 0%,transparent 65%),radial-gradient(ellipse 45% 55% at 5% 90%,rgba(160,130,200,.09) 0%,transparent 55%)" }}>

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a8a78] mb-1.5">{user?.name || "Dr. Sarah Chen"} · {user?.specialization || "Cardiology"}</p>
          <h1 className="text-[26px] font-bold text-[#1e1a14] tracking-[-0.02em] leading-none">Patient History</h1>
          <p className="text-[13px] text-[#9a8a78] mt-1">Voice recordings, AI transcripts and prescriptions</p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-[18px] py-2.5 bg-white/62 border border-[rgba(200,185,165,0.5)] rounded-xl text-[13px] font-medium text-[#5a4e40] cursor-pointer backdrop-blur-sm transition-all duration-200 hover:border-[#3f8b8c] hover:text-[#3f8b8c] font-[Outfit,sans-serif]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button className="flex items-center gap-1.5 px-[18px] py-2.5 bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] text-white border-none rounded-xl text-[13px] font-semibold cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.28)] transition-all duration-200 hover:-translate-y-px font-[Outfit,sans-serif]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print All
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {STATS.map(({ val, label, sub, blob }) => (
          <div key={label} className={`${glassCard} p-[18px_20px] relative overflow-hidden`}>
            <div className="text-[26px] font-bold tracking-[-0.03em] text-[#1e1a14] leading-none">{val}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a09080] mt-1">{label}</div>
            <div className="text-[11.5px] text-[#9a8a78] mt-1.5">{sub}</div>
            <div className="absolute -bottom-[18px] -right-[18px] w-[70px] h-[70px] rounded-full opacity-[0.12]" style={{ background:blob }} />
          </div>
        ))}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex items-center gap-2.5 mb-[18px] flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a090] pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/68 border border-[rgba(200,185,165,0.45)] rounded-[13px] py-2.5 pl-10 pr-4 text-[13.5px] font-[Outfit,sans-serif] text-[#1e1a14] outline-none transition-all duration-200 placeholder-[#b0a090] focus:border-[#3f8b8c] focus:shadow-[0_0_0_3px_rgba(63,139,140,0.1)] focus:bg-white"
            placeholder="Search patient, diagnosis or medication..." />
        </div>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-2.5 rounded-[10px] text-[12.5px] font-medium cursor-pointer border transition-all duration-200 whitespace-nowrap font-[Outfit,sans-serif] ${filter===f ? "bg-[rgba(63,139,140,0.1)] border-[rgba(63,139,140,0.35)] text-[#2d7071] font-semibold" : "bg-white/62 border-[rgba(200,185,165,0.45)] text-[#7a6e5e] backdrop-blur-sm hover:border-[#3f8b8c] hover:text-[#3f8b8c]"}`}>
            {f}
          </button>
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-3.5 py-2.5 bg-white/62 border border-[rgba(200,185,165,0.45)] rounded-xl text-[12.5px] font-[Outfit,sans-serif] text-[#7a6e5e] outline-none cursor-pointer">
          <option value="date">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="visits">Most visits</option>
        </select>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns:"1fr 380px", alignItems:"start" }}>

        {/* Left: patient list */}
        <div>
          <SectionLabel extra={`${filtered.length} patient${filtered.length!==1?"s":""}`}>Patient Records</SectionLabel>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0b0a0" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <p className="text-[14px] text-[#b0a090] mt-3">No patients found</p>
            </div>
          ) : filtered.map(p => {
            const r = p.records[0];
            return (
              <div key={p.id} onClick={() => setActiveId(p.id)}
                className={`${glassCard} p-5 cursor-pointer transition-all duration-200 border-l-[3px] mb-2.5 last:mb-0 hover:translate-x-0.5 ${activeId===p.id ? "border-l-[#3f8b8c] !bg-white/85 !shadow-[0_6px_28px_rgba(63,139,140,0.12)]" : "border-l-transparent"}`}>
                {/* Top */}
                <div className="flex items-start justify-between mb-2.5 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[14px] font-bold flex-shrink-0" style={{ background:p.avBg, color:p.avColor }}>{p.initials}</div>
                    <div>
                      <div className="text-[14.5px] font-semibold text-[#1e1a14]">{p.name}</div>
                      <div className="text-[11.5px] text-[#9a8a78] mt-px">{p.age} yrs · {p.gender} · {p.blood}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-[0.04em] flex-shrink-0" style={{ background:p.tagBg, color:p.tagText }}>{p.condition}</span>
                    <span className="text-[10.5px] text-[#b0a090]">{p.visits} visit{p.visits!==1?"s":""}</span>
                  </div>
                </div>
                {/* Mini waveform */}
                <div className="flex items-center gap-2 bg-[rgba(63,139,140,0.06)] border border-[rgba(63,139,140,0.15)] rounded-[9px] px-3 py-2 mb-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3f8b8c" strokeWidth="2.5"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z"/><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z"/></svg>
                  <MiniWave />
                  <span className="text-[11px] font-semibold text-[#3f8b8c] ml-auto">{r.duration}</span>
                </div>
                {/* Transcript preview */}
                <p className="text-[12.5px] text-[#5a4e40] leading-[1.55] mb-2.5 line-clamp-2 italic">"{r.transcript.slice(0,160)}…"</p>
                {/* Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Chip><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{r.date}</Chip>
                  <Chip><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>{r.meds.length} Rx</Chip>
                  <Chip><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{r.diagnosis}</Chip>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: detail panel */}
        <div className="flex flex-col gap-3.5">
          <div className={`${glassDeep} p-[22px]`}>

            {/* Patient header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[rgba(200,185,165,0.25)]">
              <div className="w-[50px] h-[50px] rounded-[15px] flex items-center justify-center text-[19px] font-bold flex-shrink-0" style={{ background:active.avBg, color:active.avColor }}>{active.initials}</div>
              <div>
                <div className="text-[17px] font-bold text-[#1e1a14] tracking-[-0.01em]">{active.name}</div>
                <div className="text-xs text-[#9a8a78] mt-0.5">{active.age} yrs · {active.gender} · {active.blood} · {active.condition}</div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[["Date of Birth",active.dob],["Phone",active.phone],["Diagnosis",rec.diagnosis],["BP / HR",`${rec.bp} · ${rec.hr}`]].map(([l,v]) => (
                <div key={l} className="bg-[rgba(248,244,238,0.6)] border border-[rgba(200,185,165,0.3)] rounded-[10px] p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#a09080] mb-1">{l}</div>
                  <div className="text-[12.5px] font-semibold text-[#1e1a14]">{v}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-[rgba(240,235,228,0.7)] rounded-xl p-1 gap-1 mb-4">
              {[["clip","Voice Clip"],["rx","Prescription"]].map(([t,label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-center text-[12.5px] rounded-[9px] border-none cursor-pointer font-[Outfit,sans-serif] transition-all duration-200 ${tab===t ? "bg-white text-[#1e1a14] font-semibold shadow-[0_1px_6px_rgba(80,60,30,0.1)]" : "bg-transparent text-[#9a8a78] font-medium hover:text-[#1e1a14]"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Voice clip tab */}
            {tab === "clip" && (<>
              <AudioPlayer patientId={active.id} duration={rec.duration} />
              <div className="bg-[rgba(248,244,238,0.6)] border border-[rgba(200,185,165,0.3)] rounded-xl p-3.5 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#a09080] mb-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3f8b8c" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2z"/></svg>
                  AI Transcript
                </div>
                <p className="text-[12.5px] leading-[1.7] text-[#2c2416] italic">"{rec.transcript}"</p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#3f8b8c] font-semibold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                  99.2% accuracy · {rec.duration} recording
                </div>
              </div>
            </>)}

            {/* Prescription tab */}
            {tab === "rx" && (
              <div className="bg-[rgba(252,250,248,0.9)] border border-[rgba(200,185,165,0.4)] rounded-[14px] p-4 mb-3 text-[12px] leading-[1.7] text-[#2c2416]">
                <div className="flex items-start justify-between mb-3 pb-2.5 border-b border-[rgba(200,185,165,0.4)]">
                  <div>
                    <div className="text-[13px] font-bold text-[#1e1a14]">{user?.name || "Dr. Sarah Chen"}</div>
                    <div className="text-[11px] text-[#9a8a78]">MBBS, MD {user?.specialization || "Cardiology"}</div>
                  </div>
                  <div className="text-right text-[11px] text-[#9a8a78]">{rec.date.split(",")[0]}<br/>Chen Cardiology Center</div>
                </div>
                <div className="mb-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#a09080] mb-1">Patient</div>
                  <div className="text-[13.5px] font-semibold text-[#1e1a14]">{active.name} · {active.age} yrs · {active.blood}</div>
                  <div className="text-[11.5px] text-[#9a8a78]">Dx: {rec.diagnosis}</div>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:10 }}>
                  <thead>
                    <tr style={{ borderBottom:"1.5px solid rgba(200,185,165,0.4)" }}>
                      {["Medicine","Dosage","Duration"].map(h => <th key={h} style={{ fontSize:10, textTransform:"uppercase", letterSpacing:".08em", color:"#a09080", fontWeight:700, padding:"4px", textAlign:"left" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rec.meds.map(m => (
                      <tr key={m.n} style={{ borderBottom:"1px solid rgba(200,185,165,0.2)" }}>
                        <td style={{ padding:"6px 4px", fontSize:12, fontWeight:600, color:"#1e1a14" }}>{m.n}</td>
                        <td style={{ padding:"6px 4px", fontSize:12, color:"#2c2416" }}>{m.d}</td>
                        <td style={{ padding:"6px 4px", fontSize:12, color:"#2c2416" }}>{m.dur}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-[11px] text-[#9a8a78] italic">BP: {rec.bp} · HR: {rec.hr} · ECG: {rec.ecg}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => setTab("rx")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] text-white border-none rounded-xl text-[12.5px] font-semibold cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.28)] transition-all duration-200 hover:-translate-y-px font-[Outfit,sans-serif]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>
                {tab === "rx" ? "Print Prescription" : "View Prescription"}
              </button>
              <button onClick={() => setTab("clip")}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white/62 border border-[rgba(200,185,165,0.5)] rounded-xl text-[12.5px] font-medium text-[#7a6e5e] cursor-pointer backdrop-blur-sm transition-all duration-200 hover:border-[#3f8b8c] hover:text-[#3f8b8c] font-[Outfit,sans-serif]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z"/><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z"/></svg>
                Audio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}