import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import {
  User, Home, Shield, Bell, Settings2, CreditCard,
  AlertTriangle, LogOut, CheckCircle2, Monitor, Smartphone, Link2
} from "lucide-react";

const TABS = [
  { id: "profile",       label: "Profile",       Icon: User },
  { id: "clinic",        label: "Clinic",        Icon: Home },
  { id: "security",      label: "Security",      Icon: Shield },
  { id: "notifications", label: "Alerts",        Icon: Bell },
  { id: "preferences",   label: "Preferences",   Icon: Settings2 },
  { id: "billing",       label: "Billing",       Icon: CreditCard },
  { id: "danger",        label: "Danger",        Icon: AlertTriangle },
];

const Toggle = ({ defaultChecked = false, onChange }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label className="relative w-10 h-[22px] flex-shrink-0 cursor-pointer inline-block"
      onClick={() => { setOn(!on); onChange && onChange(!on); }}>
      <input type="checkbox" readOnly checked={on} className="opacity-0 w-0 h-0 absolute" />
      <div className={`absolute inset-0 rounded-full border transition-all duration-250 ${on ? 'bg-[#3f8b8c] border-[#3f8b8c]' : 'bg-[rgba(180,165,145,0.4)] border-[rgba(180,165,145,0.5)]'}`} />
      <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-transform duration-250 pointer-events-none ${on ? 'translate-x-[22px] left-[2px]' : 'left-[2px]'}`} />
    </label>
  );
};

const Field = ({ label, note, full, children }) => (
  <div className={full ? "col-span-2" : ""}>
    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a09080] mb-2">{label}</label>
    {children}
    {note && <p className="text-[11.5px] text-[#b0a090] mt-1.5">{note}</p>}
  </div>
);

const Inp = ({ className = "", ...props }) => (
  <input {...props} className={`w-full bg-white/62 border border-[rgba(200,185,165,0.5)] rounded-xl px-3.5 py-3 text-[13.5px] text-[#1e1a14] outline-none transition-all duration-200 backdrop-blur-sm placeholder-[#c0b0a0] focus:border-[#3f8b8c] focus:shadow-[0_0_0_3px_rgba(63,139,140,0.11)] focus:bg-white/88 disabled:opacity-45 disabled:cursor-not-allowed disabled:bg-[rgba(235,230,222,0.5)] ${className}`} />
);

const Sel = ({ children, ...props }) => (
  <div className="relative">
    <select {...props} className="w-full appearance-none bg-white/62 border border-[rgba(200,185,165,0.5)] rounded-xl px-3.5 py-3 text-[13.5px] text-[#1e1a14] outline-none transition-all duration-200 cursor-pointer focus:border-[#3f8b8c] focus:shadow-[0_0_0_3px_rgba(63,139,140,0.11)]">
      {children}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-[5px] border-l-transparent border-r-transparent border-t-[#a09080] w-0 h-0" />
  </div>
);

const SectionCard = ({ children, danger = false }) => (
  <div className={`rounded-[22px] overflow-hidden bg-white/62 border border-white/90 backdrop-blur-[32px] mb-[18px] shadow-[0_6px_36px_rgba(80,60,30,0.07),0_0_0_0.5px_rgba(200,185,165,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] ${danger ? 'border-[rgba(226,75,74,0.2)]' : ''}`}>
    {children}
  </div>
);

const SectionHead = ({ icon: Icon, title, desc, danger = false }) => (
  <div className={`flex items-center gap-2.5 px-7 py-5 border-b border-[rgba(200,185,165,0.25)] ${danger ? 'bg-[rgba(252,235,235,0.35)]' : 'bg-[rgba(248,244,238,0.45)]'}`}>
    <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 border ${danger ? 'bg-[rgba(252,235,235,0.7)] border-[rgba(226,75,74,0.25)]' : 'bg-[rgba(63,139,140,0.1)] border-[rgba(63,139,140,0.18)]'}`}>
      <Icon size={16} color={danger ? "#a32d2d" : "#3f8b8c"} />
    </div>
    <div>
      <div className={`text-sm font-semibold flex items-center gap-2 ${danger ? 'text-[#791f1f]' : 'text-[#1e1a14]'}`}>{title}</div>
      <div className="text-xs text-[#9a8a78] mt-px">{desc}</div>
    </div>
  </div>
);

const SectionBody = ({ children }) => <div className="px-7 py-6">{children}</div>;
const SectionFoot = ({ children }) => (
  <div className="flex items-center justify-end gap-2.5 px-7 pt-3.5 pb-5 bg-[rgba(248,244,238,0.35)] border-t border-[rgba(200,185,165,0.2)]">
    {children}
  </div>
);

// FIX: BtnPri no longer intercepts the click when used as type="submit" inside a form.
// Previously it had an onClick that called e.preventDefault() equivalent by returning early,
// preventing the parent form's onSubmit from ever firing.
const BtnPri = ({ children, disabled, onClick, type = "button" }) => {
  const [s, setS] = useState("idle");
  const handle = async (e) => {
    if (type === "submit") return; // let the form's onSubmit handle it — don't intercept
    if (onClick) { await onClick(e); }
    setS("saving");
    setTimeout(() => setS("saved"), 900);
    setTimeout(() => setS("idle"), 2500);
  };
  return (
    <button
      type={type}
      disabled={disabled || s === "saving"}
      onClick={type !== "submit" ? handle : undefined}
      className="text-[13px] font-semibold text-white bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] border-none rounded-xl px-6 py-2.5 cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.3)] transition-all duration-200 disabled:opacity-60 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(63,139,140,0.36)]"
    >
      {s === "saving" ? "Saving…" : s === "saved" ? "Saved ✓" : children}
    </button>
  );
};

const BtnSec = ({ children, onClick, type = "button" }) => (
  <button type={type} onClick={onClick} className="text-[13px] font-medium text-[#8a7d6e] bg-transparent border border-[rgba(200,185,165,0.55)] rounded-xl px-5 py-2.5 cursor-pointer transition-all duration-200 whitespace-nowrap hover:border-[#3f8b8c] hover:text-[#3f8b8c]">{children}</button>
);
const BtnDanger = ({ children, onClick, type = "button" }) => (
  <button type={type} onClick={onClick} className="text-[12.5px] font-semibold text-[#a32d2d] bg-[rgba(252,235,235,0.7)] border border-[rgba(226,75,74,0.3)] rounded-[10px] px-4 py-2 cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-[rgba(246,193,193,0.7)] hover:border-[rgba(226,75,74,0.5)] flex-shrink-0">{children}</button>
);

const ToggleRow = ({ label, desc, defaultChecked = false }) => (
  <div className="flex items-start justify-between py-3.5 border-b border-[rgba(200,185,165,0.2)] gap-4 last:border-b-0 last:pb-0 first:pt-0">
    <div>
      <p className="text-[13.5px] font-medium text-[#1e1a14]">{label}</p>
      <p className="text-xs text-[#9a8a78] mt-0.5">{desc}</p>
    </div>
    <Toggle defaultChecked={defaultChecked} />
  </div>
);

const DangerRow = ({ label, desc, btn, isDanger }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-[rgba(200,185,165,0.2)] gap-4 last:border-b-0 last:pb-0 first:pt-0">
    <div>
      <p className="text-[13.5px] font-medium text-[#1e1a14]">{label}</p>
      <p className="text-xs text-[#9a8a78] mt-0.5">{desc}</p>
    </div>
    {isDanger ? <BtnDanger>{btn}</BtnDanger> : <BtnSec>{btn}</BtnSec>}
  </div>
);

export default function Settings() {
  const { user, logout, updateUserInfo } = useAuth();
  const [tab,     setTab]     = useState("profile");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [tfaOn,   setTfaOn]   = useState(true);
  const [sessions, setSessions] = useState([
    { id: 1, name: "MacBook Pro · Chrome 124", loc: "San Francisco, CA · Now",       current: true,  Icon: Monitor },
    { id: 2, name: "iPhone 15 Pro · Safari",   loc: "San Francisco, CA · 2 hours ago", current: false, Icon: Smartphone },
    { id: 3, name: "Windows PC · Firefox 125", loc: "New York, NY · Yesterday",       current: false, Icon: Monitor },
  ]);
  const [apps, setApps] = useState([
    { id: 1, emoji: "📅", name: "Google Calendar",       perm: "Read & write calendar events" },
    { id: 2, emoji: "💊", name: "DrFirst e-Prescribing", perm: "Send prescriptions electronically" },
    { id: 3, emoji: "🔬", name: "Quest Diagnostics",     perm: "Receive lab results automatically" },
  ]);
  const [pwFill,  setPwFill]  = useState(0);
  const [pwColor, setPwColor] = useState("#3f8b8c");

  const pwStrength = (v) => {
    const score = [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
    setPwFill([0, 30, 55, 78, 100][score]);
    setPwColor(["#3f8b8c", "#EF9F27", "#EF9F27", "#3f8b8c", "#22c55e"][score]);
  };

  // ── Profile save ────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      name:           formData.get("name"),
      phone:          formData.get("phone"),
      dateOfBirth:    formData.get("dateOfBirth"),
      specialization: formData.get("specialization"),
    };

    try {
      const response = await fetch("http://localhost:5001/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (result.status === "SUCCESS") {
        // Update global user state AND localStorage so the new name/specialization
        // appear immediately everywhere in the app (sidebar, dashboard, header)
        updateUserInfo(result.user_info);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(result.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ebe3] font-[Outfit,sans-serif]"
      style={{ backgroundImage: "radial-gradient(ellipse 70% 50% at 80% 10%,rgba(63,139,140,.15) 0%,transparent 65%),radial-gradient(ellipse 50% 60% at 10% 85%,rgba(160,130,200,.12) 0%,transparent 60%)" }}>

      {/* Topbar */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.08] bg-[#0a1118]/5">
        <span className="italic text-[15px] text-[#7a6e5e] tracking-[0.02em] font-[Outfit,sans-serif]">Your Profile</span>
        <button onClick={logout} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[rgba(180,165,145,0.5)] bg-white/50 backdrop-blur-sm text-[12.5px] font-medium text-[#8a7d6e] cursor-pointer transition-all duration-200 hover:text-red-500 hover:border-[rgba(192,57,43,0.35)] hover:bg-white/75">
          <LogOut size={13} /> Sign out
        </button>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-12">

        {/* Hero */}
        <div className="flex items-center justify-between p-7 rounded-[22px] mb-6 bg-white/55 border border-white/85 backdrop-blur-2xl shadow-[0_4px_28px_rgba(80,60,30,0.07),inset_0_0_0_0.5px_rgba(255,255,255,0.7)]">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-[62px] h-[62px] rounded-[18px] bg-gradient-to-br from-[#4a9e9f] via-[#2d6667] to-[#1c4040] flex items-center justify-center text-2xl font-bold text-white shadow-[0_6px_20px_rgba(63,139,140,0.28)] flex-shrink-0">
                {user?.name?.[0] || "D"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-[2.5px] border-[#f0ebe3]" />
            </div>
            <div>
              {/* These update immediately when updateUserInfo is called */}
              <div className="text-xl font-semibold text-[#1e1a14] leading-tight">{user?.name || "Doctor"}</div>
              <div className="text-[12.5px] text-[#9a8a78] mt-0.5">
                {user?.specialization || "General Practice"} &nbsp;·&nbsp;
                <span className="text-[#3f8b8c] font-medium">Active</span> &nbsp;·&nbsp; Pro Plan
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[rgba(63,139,140,0.09)] border border-[rgba(63,139,140,0.22)] text-[11.5px] font-semibold text-[#2d7071] tracking-[0.05em] uppercase">
            <Shield size={12} /> Pro
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-[18px] py-2.5 rounded-full border text-[13px] font-medium cursor-pointer transition-all duration-200 whitespace-nowrap backdrop-blur-[10px] font-[Outfit,sans-serif]
                ${tab === id
                  ? 'bg-white/85 text-[#1e1a14] border-[rgba(180,165,145,0.6)] shadow-[0_2px_12px_rgba(80,60,30,0.09)]'
                  : 'bg-white/42 text-[#8a7d6e] border-[rgba(180,165,145,0.4)] hover:bg-white/65 hover:text-[#3f8b8c] hover:border-[rgba(63,139,140,0.3)]'
                }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <form onSubmit={handleSave}>
            <SectionCard>
              <SectionHead icon={User} title="General Profile" desc="Your personal and professional identity" />
              <SectionBody>
                <div className="flex items-center gap-5 mb-6 pb-5 border-b border-[rgba(200,185,165,0.2)]">
                  <div className="w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-[#4a9e9f] to-[#1c4040] flex items-center justify-center text-3xl font-bold text-white shadow-[0_6px_20px_rgba(63,139,140,0.22)] flex-shrink-0">
                    {user?.name?.[0] || "D"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1e1a14]">Profile Photo</p>
                    <p className="text-xs text-[#9a8a78] mt-0.5 mb-3">JPG, GIF or PNG · Max 1MB</p>
                    <div className="flex gap-2">
                      <BtnSec type="button">Upload photo</BtnSec>
                      <BtnDanger type="button">Remove</BtnDanger>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[18px]">
                  <Field label="Full Name" full>
                    <Inp name="name" type="text" defaultValue={user?.name} placeholder="Dr. Full Name" />
                  </Field>
                  <Field label="Email Address" note="Email cannot be changed.">
                    <div className="relative">
                      <Inp name="email" type="email" defaultValue={user?.email} disabled className="pr-10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <CheckCircle2 size={15} color="#22c55e" />
                      </span>
                    </div>
                  </Field>
                  <Field label="Phone Number">
                    <Inp name="phone" type="tel" defaultValue={user?.phone} placeholder="+1 (555) 000-0000" />
                  </Field>
                  <Field label="Date of Birth">
                    <Inp name="dateOfBirth" type="date" defaultValue={user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ""} />
                  </Field>
                  <Field label="Medical License">
                    <div className="relative">
                      <Inp name="licenseNumber" type="text" defaultValue={user?.licenseNumber} placeholder="License No." disabled className="pr-10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <CheckCircle2 size={15} color="#22c55e" />
                      </span>
                    </div>
                  </Field>
                  <Field label="Specialization" full>
                    <Inp name="specialization" type="text" defaultValue={user?.specialization} placeholder="e.g. Cardiology" />
                  </Field>
                </div>
              </SectionBody>
              <SectionFoot>
                {saved && (
                  <span className="text-[12.5px] text-green-600 font-semibold flex items-center gap-1.5 mr-2">
                    <CheckCircle2 size={14} /> Changes saved
                  </span>
                )}
                <BtnSec type="button">Cancel</BtnSec>
                {/* type="submit" — clicking triggers form onSubmit directly, no onClick interceptor */}
                <button
                  type="submit"
                  disabled={saving}
                  className="text-[13px] font-semibold text-white bg-gradient-to-br from-[#3f8b8c] to-[#2d6667] border-none rounded-xl px-6 py-2.5 cursor-pointer shadow-[0_3px_14px_rgba(63,139,140,0.3)] transition-all duration-200 disabled:opacity-60 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(63,139,140,0.36)]"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </SectionFoot>
            </SectionCard>
          </form>
        )}

        {/* ── CLINIC ── */}
        {tab === "clinic" && (
          <SectionCard>
            <SectionHead icon={Home} title="Clinic Information" desc="Location, hours, and contact details" />
            <SectionBody>
              <div className="grid grid-cols-2 gap-[18px]">
                <Field label="Clinic Name" full><Inp type="text" defaultValue="Chen Cardiology Center" /></Field>
                <Field label="Street Address" full><Inp type="text" defaultValue="450 Sutter Street, Suite 1108" /></Field>
                <Field label="City"><Inp type="text" defaultValue="San Francisco" /></Field>
                <Field label="State / Region"><Inp type="text" defaultValue="California" /></Field>
                <Field label="ZIP / Postal Code"><Inp type="text" defaultValue="94108" /></Field>
                <Field label="Country"><Sel><option>United States</option><option>Canada</option><option>United Kingdom</option><option>India</option></Sel></Field>
                <Field label="Clinic Phone"><Inp type="tel" defaultValue="+1 (415) 555-0100" /></Field>
                <Field label="Clinic Email"><Inp type="email" defaultValue="contact@chencardiocenter.com" /></Field>
                <Field label="Website"><Inp type="url" defaultValue="https://chencardiocenter.com" /></Field>
                <Field label="Consultation Hours"><Inp type="text" defaultValue="Mon–Fri, 9:00 AM – 5:00 PM" /></Field>
              </div>
            </SectionBody>
            <SectionFoot><BtnSec>Cancel</BtnSec><BtnPri>Save changes</BtnPri></SectionFoot>
          </SectionCard>
        )}

        {/* ── SECURITY ── */}
        {tab === "security" && (<>
          <SectionCard>
            <SectionHead icon={Shield} title="Change Password" desc="We recommend using a strong, unique password" />
            <SectionBody>
              <div className="flex flex-col gap-4 max-w-md">
                {[["Current Password", "current-password", "Enter current password"], ["New Password", "new-password", "Min 8 chars, 1 uppercase, 1 number"], ["Confirm New Password", "confirm-password", "Repeat new password"]].map(([label, name, ph], i) => (
                  <Field key={label} label={label}>
                    <Inp name={name} type="password" placeholder={ph}
                      onChange={i === 1 ? e => pwStrength(e.target.value) : undefined} />
                  </Field>
                ))}
                <div>
                  <div className="h-1.5 rounded-full bg-[rgba(200,185,165,0.35)] overflow-hidden">
                    <div style={{ width: `${pwFill}%`, background: pwColor }} className="h-full rounded-full transition-all duration-300" />
                  </div>
                  <p className="text-[11px] text-[#b0a090] mt-1">Password strength</p>
                </div>
              </div>
            </SectionBody>
            <SectionFoot><BtnSec>Cancel</BtnSec><BtnPri>Update password</BtnPri></SectionFoot>
          </SectionCard>
          <SectionCard>
            <SectionHead icon={Shield} title="Two-Factor Authentication" desc="Extra layer of security on your account" />
            <SectionBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] font-medium text-[#1e1a14]">Authenticator App</p>
                  <p className="text-xs text-[#9a8a78] mt-0.5">Use Google Authenticator or Authy</p>
                </div>
                <Toggle defaultChecked={tfaOn} onChange={setTfaOn} />
              </div>
            </SectionBody>
          </SectionCard>
          <SectionCard>
            <SectionHead icon={Monitor} title="Active Sessions" desc="Devices currently signed into your account" />
            <SectionBody>
              {sessions.map(({ id, name, loc, current, Icon }) => (
                <div key={id} className="flex items-center justify-between py-3.5 border-b border-[rgba(200,185,165,0.2)] last:border-b-0 last:pb-0 first:pt-0 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] bg-[rgba(63,139,140,0.09)] border border-[rgba(63,139,140,0.18)] flex items-center justify-center flex-shrink-0">
                      <Icon size={16} color="#3f8b8c" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1e1a14] flex items-center gap-2">
                        {name} {current && <span className="text-[10px] font-semibold text-[#3f8b8c] bg-[rgba(63,139,140,0.1)] border border-[rgba(63,139,140,0.2)] px-2 py-0.5 rounded-full">Current</span>}
                      </p>
                      <p className="text-[11.5px] text-[#9a8a78] mt-px">{loc}</p>
                    </div>
                  </div>
                  {!current && <BtnDanger onClick={() => setSessions(s => s.filter(x => x.id !== id))}>Revoke</BtnDanger>}
                </div>
              ))}
            </SectionBody>
            <SectionFoot><BtnDanger onClick={() => setSessions(s => s.filter(x => x.current))}>Revoke all other sessions</BtnDanger></SectionFoot>
          </SectionCard>
        </>)}

        {/* ── NOTIFICATIONS ── */}
        {tab === "notifications" && (<>
          {[
            { title: "Email Notifications", desc: "Control which emails you receive", items: [
              { l: "Appointment Reminders",    d: "24-hour and 1-hour reminders for upcoming appointments", def: true },
              { l: "New Patient Registration", d: "Alert when a new patient completes their profile",        def: true },
              { l: "Lab Results Ready",        d: "Notify when patient lab reports are uploaded",            def: true },
              { l: "Prescription Updates",     d: "Confirmations and status changes for prescriptions",      def: false },
              { l: "Weekly Summary Report",    d: "Activity digest every Monday at 8:00 AM",                 def: true },
              { l: "Product & Feature Updates",d: "News about MediPanel improvements",                       def: false },
            ]},
            { title: "Push Notifications", desc: "In-app and mobile alerts", items: [
              { l: "Urgent Patient Alerts", d: "Critical updates that require immediate attention", def: true },
              { l: "Chat Messages",         d: "Messages from patients and colleagues",            def: true },
              { l: "Schedule Changes",      d: "Cancellations, reschedules, new bookings",         def: true },
              { l: "Billing & Payment Alerts", d: "Invoice status and payment confirmations",      def: false },
            ]},
          ].map(({ title, desc, items }) => (
            <SectionCard key={title}>
              <SectionHead icon={Bell} title={title} desc={desc} />
              <SectionBody>{items.map(({ l, d, def }) => <ToggleRow key={l} label={l} desc={d} defaultChecked={def} />)}</SectionBody>
            </SectionCard>
          ))}
        </>)}

        {/* ── PREFERENCES ── */}
        {tab === "preferences" && (<>
          <SectionCard>
            <SectionHead icon={Settings2} title="Regional & Display" desc="Language, timezone, and appearance" />
            <SectionBody>
              <div className="grid grid-cols-2 gap-[18px]">
                {[
                  ["Language",    ["English (US)", "English (UK)", "Spanish", "French", "Hindi", "Tamil"]],
                  ["Timezone",    ["Pacific Time (PT) — UTC−8", "Eastern Time (ET) — UTC−5", "IST — UTC+5:30", "GMT — UTC+0"]],
                  ["Date Format", ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]],
                  ["Time Format", ["12-hour (AM/PM)", "24-hour"]],
                  ["Currency",    ["USD — US Dollar", "EUR — Euro", "GBP — British Pound", "INR — Indian Rupee"]],
                  ["Units",       ["Imperial (lbs, ft)", "Metric (kg, cm)"]],
                ].map(([label, opts]) => (
                  <Field key={label} label={label}><Sel>{opts.map(o => <option key={o}>{o}</option>)}</Sel></Field>
                ))}
              </div>
            </SectionBody>
            <SectionFoot><BtnSec>Reset defaults</BtnSec><BtnPri>Save preferences</BtnPri></SectionFoot>
          </SectionCard>
          <SectionCard>
            <SectionHead icon={Settings2} title="Application Preferences" desc="Behaviour and accessibility" />
            <SectionBody>
              <ToggleRow label="Compact View"           desc="Show more records per page with reduced spacing"             defaultChecked={false} />
              <ToggleRow label="Keyboard Shortcuts"     desc="Enable global keyboard navigation shortcuts"                 defaultChecked={true} />
              <ToggleRow label="Auto-save Drafts"       desc="Automatically save form progress every 30 seconds"           defaultChecked={true} />
              <ToggleRow label="Analytics & Usage Data" desc="Help us improve by sending anonymous usage statistics"       defaultChecked={true} />
            </SectionBody>
          </SectionCard>
        </>)}

        {/* ── BILLING ── */}
        {tab === "billing" && (<>
          <SectionCard>
            <SectionHead icon={CreditCard} title="Current Plan" desc="Your subscription and usage" />
            <SectionBody>
              <div className="flex items-center justify-between p-5 mb-4 rounded-[14px] bg-[rgba(63,139,140,0.07)] border border-[rgba(63,139,140,0.2)]">
                <div><p className="text-[15px] font-semibold text-[#1e1a14]">Pro Plan</p><p className="text-[12.5px] text-[#3f8b8c] mt-0.5">$79 / month · Renews Apr 20, 2026</p></div>
                <BtnSec>Manage plan</BtnSec>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ label: "Patients", val: "342", max: "500", pct: 68 }, { label: "Storage", val: "4.2 GB", max: "20 GB", pct: 21 }].map(({ label, val, max, pct }) => (
                  <div key={label} className="bg-[rgba(248,244,238,0.6)] border border-[rgba(200,185,165,0.3)] rounded-xl p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a09080] mb-1.5">{label}</p>
                    <p className="text-xl font-semibold text-[#1e1a14]">{val} <span className="text-sm font-normal text-[#9a8a78]">/ {max}</span></p>
                    <div className="h-1 rounded-sm bg-[rgba(200,185,165,0.35)] mt-2"><div style={{ width: `${pct}%` }} className="h-full rounded-sm bg-[#3f8b8c]" /></div>
                  </div>
                ))}
              </div>
            </SectionBody>
          </SectionCard>
          <SectionCard>
            <SectionHead icon={CreditCard} title="Payment Method" desc="Card on file for billing" />
            <SectionBody>
              <div className="flex items-center justify-between p-4 bg-[rgba(248,244,238,0.6)] border border-[rgba(200,185,165,0.3)] rounded-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-[30px] rounded-[7px] bg-[#1a1f71] flex items-center justify-center text-[10px] font-bold text-white tracking-[0.04em]">VISA</div>
                  <div><p className="text-[13.5px] font-medium text-[#1e1a14]">•••• •••• •••• 4242</p><p className="text-xs text-[#9a8a78] mt-px">Expires 08 / 2027</p></div>
                </div>
                <BtnSec>Update card</BtnSec>
              </div>
            </SectionBody>
          </SectionCard>
          <SectionCard>
            <SectionHead icon={Link2} title="Connected Apps" desc="Third-party integrations with account access" />
            <SectionBody>
              {apps.map(({ id, emoji, name, perm }) => (
                <div key={id} className="flex items-center justify-between py-3.5 border-b border-[rgba(200,185,165,0.2)] last:border-b-0 last:pb-0 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg border border-[rgba(200,185,165,0.4)] bg-white/70">{emoji}</div>
                    <div><p className="text-[13px] font-medium text-[#1e1a14]">{name}</p><p className="text-[11.5px] text-[#9a8a78] mt-px">{perm}</p></div>
                  </div>
                  <BtnDanger onClick={() => setApps(a => a.filter(x => x.id !== id))}>Disconnect</BtnDanger>
                </div>
              ))}
            </SectionBody>
            <SectionFoot><BtnSec>Add integration</BtnSec></SectionFoot>
          </SectionCard>
        </>)}

        {/* ── DANGER ── */}
        {tab === "danger" && (
          <SectionCard danger>
            <SectionHead icon={AlertTriangle} title="Danger Zone" desc="Irreversible actions — proceed with caution" danger />
            <SectionBody>
              <DangerRow label="Export All Data"   desc="Download a full archive of your account data as a ZIP file"                                      btn="Export data"    isDanger={false} />
              <DangerRow label="Transfer Account"  desc="Transfer ownership of this clinic to another administrator"                                       btn="Transfer"       isDanger={false} />
              <DangerRow label="Suspend Account"   desc="Temporarily disable login and hide your profile from patients"                                    btn="Suspend account" isDanger={true} />
              <DangerRow label="Delete Account"    desc="Permanently delete your account, all patient records, and data. Cannot be undone."               btn="Delete account"  isDanger={true} />
            </SectionBody>
          </SectionCard>
        )}

      </div>
    </div>
  );
}