import { useState, useEffect, useMemo } from "react";
import LoginPage from "./LoginPage.jsx";
import UserManagement from "./UserManagement.jsx";
import { createClient } from '@supabase/supabase-js';
import {
  LayoutDashboard, Building2, GitFork, Users, Map, BarChart2,
  Shield, Search, Bell, Plus, Phone, Package, LogOut, Download,
  X, Truck, ChevronRight, Check, AlertTriangle, Clock, Navigation,
  Activity, RefreshCw, MapPin, XCircle, ChevronDown, Zap, Wind,
  Moon, Sun, Filter, Eye, MoreHorizontal, Edit2, Trash2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts";

/* ═══════════════════ SUPABASE CONFIG ═══════════════════ */
// TODO: Add your Supabase credentials after setup
const SUPABASE_URL = "https://ivkektiowfhmvkjwzgcz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2VrdGlvd2ZobXZrand6Z2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTAzMDEsImV4cCI6MjA5MjMyNjMwMX0.5wt7bNO5Z0mFVTHi6X8Tj8nySy6WjAWCQ8z9cIKmUQw";

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ═══════════════════ MODELS ═══════════════════ */
const MODELS = {
  SDD: { key:"SDD", label:"Same Day Delivery", short:"SDD", icon:"☀️", color:"#F59E0B", bg:"#FEF3C7", text:"#92400E", border:"#FCD34D", desc:"Morning cutoff · Delivered same day" },
  AIR: { key:"AIR", label:"Air Freight",       short:"AIR", icon:"✈️", color:"#06B6D4", bg:"#CFFAFE", text:"#164E63", border:"#67E8F9", desc:"Midday cutoff · Air priority"         },
  NDD: { key:"NDD", label:"Next Day Delivery",  short:"NDD", icon:"🌙", color:"#6366F1", bg:"#EEF2FF", text:"#3730A3", border:"#A5B4FC", desc:"Night cutoff · Delivered next day"    },
};

/* ═══════════════════ TOKENS ═══════════════════ */
const C = {
  sidebar:"#0C111D", sidebarHover:"rgba(255,255,255,0.06)",
  accent:"#F59E0B", accentBg:"rgba(245,158,11,0.10)",
  bg:"#F4F6FA", card:"#FFFFFF", border:"#E4E7EC", borderMid:"#D1D5DB",
  text:"#101828", textSub:"#344054", textMuted:"#667085",
  success:"#12B76A", successBg:"#D1FADF",
  warning:"#F79009", warningBg:"#FEF0C7",
  danger:"#F04438", dangerBg:"#FEE4E2",
  info:"#2E90FA", infoBg:"#D1E9FF",
  purple:"#7F56D9", purpleBg:"#F4EBFF",
};

const STATUS_META = {
  completed:    { label:"Completed",   dot:"#12B76A", bg:"#D1FADF", text:"#027A48" },
  "in-progress":{ label:"In Progress", dot:"#F79009", bg:"#FEF0C7", text:"#B54708" },
  pending:      { label:"Pending",     dot:"#F04438", bg:"#FEE4E2", text:"#B42318" },
  idle:         { label:"Idle",        dot:"#98A2B3", bg:"#F2F4F7", text:"#344054" },
  transit:      { label:"In Transit",  dot:"#2E90FA", bg:"#D1E9FF", text:"#1849A9" },
};

/* ═══════════════════ MOCK DATA (will be replaced by Supabase) ═══════════════════ */
const CLIENTS_INIT = [
  { id:"C1", name:"Flipkart - Noida WH",   address:"A-20, Sector 18, Noida",         lat:28.5714, lng:77.3219, spoc:"Amit Kumar",  contact:"9876543210",
    models:{ SDD:{enabled:true,cutoff:"09:00–13:00"}, AIR:{enabled:true,cutoff:"11:00–15:00"}, NDD:{enabled:true,cutoff:"17:00–21:00"} } },
  { id:"C2", name:"Meesho Sortation",       address:"Plot 5B, Sector 62, Noida",       lat:28.6241, lng:77.3780, spoc:"Priya Singh",  contact:"9876543211",
    models:{ SDD:{enabled:true,cutoff:"10:00–13:30"}, AIR:{enabled:false,cutoff:""}, NDD:{enabled:true,cutoff:"18:00–22:00"} } },
  { id:"C3", name:"Amazon FC Kundli",       address:"NH-44, Kundli, Sonipat",          lat:28.8955, lng:77.1167, spoc:"Rahul Verma",  contact:"9876543212",
    models:{ SDD:{enabled:true,cutoff:"08:30–12:30"}, AIR:{enabled:true,cutoff:"12:00–16:00"}, NDD:{enabled:true,cutoff:"19:00–23:00"} } },
  { id:"C4", name:"Myntra Hub Gurgaon",     address:"Udyog Vihar Ph-4, Gurugram",      lat:28.4989, lng:77.0769, spoc:"Neha Gupta",   contact:"9876543213",
    models:{ SDD:{enabled:false,cutoff:""}, AIR:{enabled:true,cutoff:"13:00–17:00"}, NDD:{enabled:true,cutoff:"20:00–23:00"} } },
  { id:"C5", name:"Snapdeal Jasola",         address:"Jasola Industrial, South Delhi",  lat:28.5494, lng:77.2842, spoc:"Vikram Rathi", contact:"9876543214",
    models:{ SDD:{enabled:true,cutoff:"09:30–13:00"}, AIR:{enabled:false,cutoff:""}, NDD:{enabled:true,cutoff:"18:30–22:00"} } },
  { id:"C6", name:"Delhivery - Rai",         address:"Rai Industrial, Sonipat",         lat:28.9167, lng:77.0833, spoc:"Ankit Sharma", contact:"9876543215",
    models:{ SDD:{enabled:true,cutoff:"08:00–12:00"}, AIR:{enabled:true,cutoff:"11:00–15:00"}, NDD:{enabled:false,cutoff:""} } },
  { id:"C7", name:"Zomato Dark Store CP",    address:"Connaught Place, New Delhi",      lat:28.6292, lng:77.2082, spoc:"Mohit Bansal", contact:"9876543217",
    models:{ SDD:{enabled:true,cutoff:"10:00–13:00"}, AIR:{enabled:false,cutoff:""}, NDD:{enabled:true,cutoff:"21:00–23:30"} } },
  { id:"C8", name:"AJIO WH Noida",           address:"Sector 83, Noida",                lat:28.5480, lng:77.3900, spoc:"Tanvi Arora",  contact:"9876543218",
    models:{ SDD:{enabled:true,cutoff:"09:00–13:00"}, AIR:{enabled:true,cutoff:"12:00–16:00"}, NDD:{enabled:true,cutoff:"19:00–22:00"} } },
];

const CLUSTERS_INIT = [
  { id:"CL1", name:"SDD-Noida-1",   model:"SDD", clientIds:["C1","C2","C8"], riderId:"R1", color:"#F59E0B" },
  { id:"CL2", name:"SDD-Sonipat",   model:"SDD", clientIds:["C3","C6"],       riderId:"R2", color:"#F59E0B" },
  { id:"CL3", name:"AIR-Noida",     model:"AIR", clientIds:["C1","C3","C8"], riderId:"R3", color:"#06B6D4" },
  { id:"CL4", name:"AIR-Gurgaon",   model:"AIR", clientIds:["C4"],            riderId:null, color:"#06B6D4" },
  { id:"CL5", name:"NDD-Noida",     model:"NDD", clientIds:["C1","C2","C8"], riderId:"R4", color:"#6366F1" },
  { id:"CL6", name:"NDD-Delhi-S",   model:"NDD", clientIds:["C5","C7"],       riderId:null, color:"#6366F1" },
];

const RIDERS_INIT = [
  { id:"R1", name:"Raju Singh",    code:"PB-001", phone:"9876541001", vehicle:"DL-1C-1234", shift:"A" },
  { id:"R2", name:"Suresh Kumar",  code:"PB-002", phone:"9876541002", vehicle:"HR-26-5678", shift:"A" },
  { id:"R3", name:"Mahesh Yadav",  code:"PB-003", phone:"9876541003", vehicle:"DL-2C-9012", shift:"A" },
  { id:"R4", name:"Deepak Nath",   code:"PB-004", phone:"9876541004", vehicle:"UP-14-3456", shift:"B" },
  { id:"R5", name:"Ajay Bhatt",    code:"PB-005", phone:"9876541005", vehicle:"DL-7C-7890", shift:"A" },
  { id:"R6", name:"Vikas Sharma",  code:"PB-006", phone:"9876541006", vehicle:"DL-5P-2345", shift:"B" },
];

const PICKUPS_INIT = {
  "R1-C1":{ status:"completed",   packets:45, arrivedAt:"10:15", completedAt:"10:45" },
  "R1-C2":{ status:"completed",   packets:28, arrivedAt:"11:10", completedAt:"11:38" },
  "R1-C8":{ status:"in-progress", packets:0,  arrivedAt:"12:10", completedAt:null    },
  "R2-C3":{ status:"completed",   packets:32, arrivedAt:"09:20", completedAt:"09:55" },
  "R2-C6":{ status:"completed",   packets:46, arrivedAt:"10:30", completedAt:"11:10" },
  "R3-C1":{ status:"pending",     packets:0,  arrivedAt:null,     completedAt:null   },
  "R3-C3":{ status:"pending",     packets:0,  arrivedAt:null,     completedAt:null   },
  "R4-C1":{ status:"pending",     packets:0,  arrivedAt:null,     completedAt:null   },
  "R4-C2":{ status:"pending",     packets:0,  arrivedAt:null,     completedAt:null   },
};

// Mock rider locations (will be real-time from Supabase)
const RIDER_LOCATIONS_INIT = {
  R1: { lat: 28.5714, lng: 77.3219, accuracy: 15, timestamp: new Date().toISOString() },
  R2: { lat: 28.8955, lng: 77.1167, accuracy: 20, timestamp: new Date().toISOString() },
  R3: { lat: 28.6241, lng: 77.3780, accuracy: 12, timestamp: new Date().toISOString() },
  R4: { lat: 28.5494, lng: 77.2842, accuracy: 18, timestamp: new Date().toISOString() },
  R5: { lat: 28.5480, lng: 77.3900, accuracy: 25, timestamp: new Date().toISOString() },
};

const TREND = [
  { day:"Mon", SDD:14, AIR:5, NDD:9  },
  { day:"Tue", SDD:17, AIR:7, NDD:12 },
  { day:"Wed", SDD:11, AIR:4, NDD:8  },
  { day:"Thu", SDD:19, AIR:8, NDD:14 },
  { day:"Fri", SDD:15, AIR:6, NDD:11 },
  { day:"Sat", SDD:9,  AIR:3, NDD:7  },
  { day:"Now", SDD:6,  AIR:3, NDD:4  },
];

const USERS_INIT = [
  { id:"U1", name:"Rajesh Tiwari",  email:"rajesh@shadowfax.in",  role:"supervisor", perms:["clients","clusters","riders","status","reports"], active:true },
  { id:"U2", name:"Pradeep Mishra", email:"pradeep@shadowfax.in", role:"supervisor", perms:["clients","clusters"],                              active:true },
  { id:"U3", name:"Sunita Rao",     email:"sunita@shadowfax.in",  role:"supervisor", perms:["status","reports"],                               active:false },
];

/* ═══════════════════ DATABASE HELPERS (Supabase) ═══════════════════ */
// These functions will replace mock data once Supabase is connected

async function fetchClients() {
  if (!supabase) return CLIENTS_INIT;
  const { data, error } = await supabase.from('clients').select('*');
  if (error) { console.error('Error fetching clients:', error); return CLIENTS_INIT; }
  return data;
}

async function fetchClusters() {
  if (!supabase) return CLUSTERS_INIT;
  const { data, error } = await supabase.from('clusters').select('*');
  if (error) { console.error('Error fetching clusters:', error); return CLUSTERS_INIT; }
  return data;
}

async function fetchRiders() {
  if (!supabase) return RIDERS_INIT;
  const { data, error } = await supabase.from('riders').select('*');
  if (error) { console.error('Error fetching riders:', error); return RIDERS_INIT; }
  return data;
}

async function fetchPickups() {
  if (!supabase) return PICKUPS_INIT;
  const { data, error } = await supabase.from('pickups').select('*');
  if (error) { console.error('Error fetching pickups:', error); return PICKUPS_INIT; }
  // Convert array to keyed object
  return data.reduce((acc, p) => ({ ...acc, [`${p.rider_id}-${p.client_id}`]: p }), {});
}

async function fetchRiderLocations() {
  if (!supabase) return RIDER_LOCATIONS_INIT;
  const { data, error } = await supabase.from('rider_locations').select('*');
  if (error) { console.error('Error fetching locations:', error); return RIDER_LOCATIONS_INIT; }
  return data.reduce((acc, loc) => ({ ...acc, [loc.rider_id]: loc }), {});
}

// Real-time subscription setup (activate after Supabase setup)
function subscribeToRiderLocations(callback) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('rider-locations')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rider_locations' }, payload => {
      callback(payload.new);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/* ═══════════════════ HELPERS ═══════════════════ */
function getRiderStatus(riderId, clusters, pickups) {
  const cl = clusters.find(c => c.riderId === riderId);
  if (!cl || !cl.clientIds.length) return "idle";
  const cids = cl.clientIds;
  const done = cids.filter(cid => pickups[`${riderId}-${cid}`]?.status === "completed").length;
  const inP  = cids.some(cid => pickups[`${riderId}-${cid}`]?.status === "in-progress");
  if (done === cids.length) return "completed";
  if (done > 0 || inP) return "in-progress";
  return "pending";
}

/* ═══════════════════ ATOMS (UI Components) ═══════════════════ */
function GS() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      *{box-sizing:border-box;margin:0;padding:0}
      html,body,#root{height:100%;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px}
      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:#D0D5DD;border-radius:4px}
      input,button,select,textarea{font-family:'Plus Jakarta Sans',sans-serif}
      a{text-decoration:none;color:inherit}
      .row-h:hover{background:#F9FAFB!important;transition:background 0.1s}
      .nav-h:hover{background:rgba(255,255,255,0.07)!important;color:#F2F4F7!important}
      .c-btn:hover{opacity:0.88}
      .s-btn:hover{background:#F9FAFB!important}
      .chip-h:hover{opacity:0.75;cursor:pointer}
      .tab-h:hover{color:#344054!important}
      .leaflet-container{height:100%;border-radius:12px}
    `}</style>
  );
}

function ModelBadge({ model, size="sm" }) {
  const m = MODELS[model];
  if (!m) return null;
  const p = size === "sm" ? "2px 9px" : size === "md" ? "4px 12px" : "6px 16px";
  const fs = size === "sm" ? 10 : size === "md" ? 11 : 13;
  return (
    <span style={{ background:m.bg, color:m.text, fontSize:fs, fontWeight:700,
      padding:p, borderRadius:20, whiteSpace:"nowrap", border:`1px solid ${m.border}`,
      display:"inline-flex", alignItems:"center", gap:4, letterSpacing:"0.02em" }}>
      <span style={{ fontSize:fs-1 }}>{m.icon}</span>{m.short}
    </span>
  );
}

function ModelTabs({ active, onChange, counts }) {
  return (
    <div style={{ display:"flex", gap:4, background:"#F2F4F7", borderRadius:10, padding:4 }}>
      { Object.values(MODELS).map(m => {
        const isA = active === m.key;
        const cnt = counts?.[m.key] ?? "";
        return (
          <button key={m.key} onClick={() => onChange(m.key)}
            style={{ flex:1, padding:"7px 14px", borderRadius:7, border:"none", cursor:"pointer",
              background: isA ? "#fff" : "transparent",
              color: isA ? m.color : "#667085",
              fontWeight: isA ? 700 : 500, fontSize:12, transition:"all 0.15s",
              boxShadow: isA ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            <span style={{ fontSize:13 }}>{m.icon}</span>
            {m.short}
            {cnt !== "" && (
              <span style={{ background: isA ? m.bg : "#E4E7EC", color: isA ? m.text : "#667085",
                fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:9, minWidth:16, textAlign:"center" }}>
                {cnt}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.idle;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:m.bg, color:m.text,
      fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:m.dot, display:"inline-block" }}/>
      {m.label}
    </span>
  );
}

function Av({ name, size=32, bg="#1E3A5F" }) {
  const ini = (name || "??").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, color:"#fff",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.36, fontWeight:700, flexShrink:0, letterSpacing:"-0.01em" }}>
      {ini}
    </div>
  );
}

function KpiCard({ icon:Icon, label, value, sub, color=C.accent, delta }) {
  return (
    <div style={{ background:C.card, borderRadius:12, padding:"18px 20px",
      border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <span style={{ fontSize:10, fontWeight:700, color:C.textMuted, letterSpacing:"0.07em",
          textTransform:"uppercase", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{label}</span>
        <div style={{ width:32, height:32, borderRadius:8, background:`${color}18`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={14} color={color}/>
        </div>
      </div>
      <div>
        <div style={{ fontSize:28, fontWeight:800, color:C.text, lineHeight:1,
          fontFamily:"Syne,sans-serif" }}>{value}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5 }}>
          {sub && <div style={{ fontSize:11, color:C.textMuted }}>{sub}</div>}
          {delta && <span style={{ fontSize:10, fontWeight:700, color:delta.startsWith("+")?C.success:C.danger }}>{delta}</span>}
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant="primary", icon:Icon, size="md", style:ex={} }) {
  const V = {
    primary:   { background:C.accent,   color:"#fff",      border:"none", cls:"c-btn" },
    secondary: { background:"#fff",     color:C.textSub,   border:`1px solid ${C.border}`, cls:"s-btn" },
    ghost:     { background:"transparent",color:C.textMuted,border:"none", cls:"s-btn" },
    danger:    { background:C.danger,   color:"#fff",      border:"none", cls:"c-btn" },
    dark:      { background:"#101828",  color:"#fff",      border:"none", cls:"c-btn" },
  };
  const SZ = { sm:{padding:"6px 12px",fontSize:11,gap:5}, md:{padding:"8px 16px",fontSize:13,gap:6}, lg:{padding:"10px 20px",fontSize:14,gap:7} };
  const v = V[variant]; const s = SZ[size];
  return (
    <button onClick={onClick} className={v.cls}
      style={{ ...v, ...s, borderRadius:8, fontWeight:600, cursor:"pointer",
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.15s", gap:s.gap, fontFamily:"'Plus Jakarta Sans',sans-serif", ...ex }}>
      {Icon && <Icon size={size==="sm"?11:13}/>}{children}
    </button>
  );
}

function CardWrap({ children, style:ex={}, noPad, onClick }) {
  return (
    <div onClick={onClick} style={{ background:C.card, borderRadius:12,
      border:`1px solid ${C.border}`, ...(noPad?{}:{padding:"20px 22px"}), ...ex }}>
      {children}
    </div>
  );
}

function Modal({ show, onClose, title, width=560, children }) {
  if (!show) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(16,24,40,0.6)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
      <div style={{ background:C.card, borderRadius:16, width, maxWidth:"95vw",
        maxHeight:"90vh", display:"flex", flexDirection:"column",
        boxShadow:"0 24px 72px rgba(0,0,0,0.24)" }}>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:"Syne,sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer",
            color:C.textMuted, padding:4, borderRadius:6, display:"flex" }}>
            <X size={16}/>
          </button>
        </div>
        <div style={{ padding:"22px 24px", overflowY:"auto", flex:1 }}>{children}</div>
      </div>
    </div>
  );
}

function FF({ label, required, children, full, hint }) {
  return (
    <div style={{ marginBottom:13, ...(full ? { gridColumn:"1/-1" } : {}) }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted,
        marginBottom:5, letterSpacing:"0.05em", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:C.danger }}> *</span>}
        {hint && <span style={{ fontWeight:400, textTransform:"none", marginLeft:6, letterSpacing:0 }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function FI({ value, onChange, placeholder, type="text", disabled }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      disabled={disabled}
      style={{ width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:8,
        fontSize:13, color:disabled?"#98A2B3":C.text, background:disabled?"#F9FAFB":"#fff",
        outline:"none", cursor:disabled?"not-allowed":"text" }}
      onFocus={e=>{ if(!disabled) e.target.style.borderColor=C.accent; }}
      onBlur={e=>e.target.style.borderColor=C.border}
    />
  );
}

function SH({ children, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:C.textSub, letterSpacing:"0.01em" }}>{children}</div>
      {action}
    </div>
  );
}

function Table({ columns, rows, actions, emptyMsg="No records" }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ borderBottom:`2px solid ${C.border}`, background:"#F9FAFB" }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding:"10px 16px", color:C.textMuted, fontSize:10, fontWeight:700,
                letterSpacing:"0.08em", textTransform:"uppercase", textAlign:"left", whiteSpace:"nowrap" }}>
                {c.label}
              </th>
            ))}
            {actions && <th style={{ padding:"10px 16px", width:140 }}/>}
          </tr>
        </thead>
        <tbody>
          {!rows.length
            ? <tr><td colSpan={columns.length+1} style={{ padding:32, textAlign:"center", color:C.textMuted, fontSize:13 }}>{emptyMsg}</td></tr>
            : rows.map((row, i) => (
              <tr key={row.id} className="row-h"
                style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?"#fff":"#FAFBFC" }}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding:"12px 16px", fontSize:13, color:C.text, verticalAlign:"middle" }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════ SIDEBAR ═══════════════════ */
const NAV = [
  { id:"dashboard", icon:LayoutDashboard, label:"Dashboard"         },
  { id:"clients",   icon:Building2,       label:"Client Master"     },
  { id:"clusters",  icon:GitFork,         label:"Cluster Board"     },
  { id:"riders",    icon:Users,           label:"Rider Management"  },
  { id:"map",       icon:Map,             label:"Live Tracking"     },
  { id:"reports",   icon:BarChart2,       label:"Reports"           },
  { id:"roles",     icon:Shield,          label:"User & Roles"      },
  { id:"users",     icon:Users,           label:"User Management"   },
];

function Sidebar({ view, setView, role, setRole }) {
  return (
    <div style={{ width:230, background:C.sidebar, display:"flex", flexDirection:"column", flexShrink:0, height:"100vh" }}>
      <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:C.accent, borderRadius:9,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Truck size={16} color="#fff"/>
          </div>
          <div>
            <div style={{ color:"#F2F4F7", fontWeight:800, fontSize:15, fontFamily:"Syne,sans-serif", letterSpacing:"-0.01em" }}>PickupOS</div>
            <div style={{ color:"#3D4A5C", fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}>Shadowfax · NCR Ops</div>
          </div>
        </div>
      </div>

      <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#2D3A4A", letterSpacing:"0.14em",
          textTransform:"uppercase", padding:"8px 10px 4px", marginBottom:2 }}>Operations</div>
        {NAV.map(item => {
          const isA = view === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)} className={isA?"":"nav-h"}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"8px 11px",
                borderRadius:8, border:"none", cursor:"pointer", marginBottom:1, textAlign:"left",
                background: isA ? "rgba(245,158,11,0.12)" : "transparent",
                color: isA ? C.accent : "#4D5B6E",
                fontWeight: isA ? 600 : 400, fontSize:13, transition:"all 0.12s", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              <item.icon size={15} style={{ flexShrink:0 }}/>
              <span style={{ flex:1 }}>{item.label}</span>
              {isA && <ChevronRight size={11}/>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"12px 10px 16px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:9, color:"#3D4A5C", fontWeight:700, letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:6 }}>View As</div>
          <div style={{ display:"flex", gap:4 }}>
            {["admin","supervisor"].map(r => (
              <button key={r} onClick={() => setRole(r)}
                style={{ flex:1, padding:"5px 0", borderRadius:6, border:"none", cursor:"pointer",
                  background: role===r ? C.accent : "rgba(255,255,255,0.06)",
                  color: role===r ? "#fff" : "#4D5B6E",
                  fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em",
                  fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.15s" }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <Av name="Arjun Sharma" size={30} bg="#1E293B"/>
          <div style={{ flex:1, overflow:"hidden" }}>
            <div style={{ color:"#C8D0DC", fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Arjun Sharma</div>
            <div style={{ color:"#3D4A5C", fontSize:10 }}>NCR Director</div>
          </div>
          <button style={{ background:"none", border:"none", cursor:"pointer", color:"#3D4A5C", padding:2 }}>
            <LogOut size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ TOPBAR ═══════════════════ */
const TITLES = {
  dashboard:"Dashboard", clients:"Client Master", clusters:"Cluster Board",
  riders:"Rider Management", map:"Live Tracking", reports:"Reports & Analytics", roles:"User & Roles",
  users:"User Management",
};

function TopBar({ view, role }) {
  const t = new Date();
  return (
    <div style={{ height:56, background:"#fff", borderBottom:`1px solid ${C.border}`,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 24px", flexShrink:0, zIndex:10 }}>
      <div>
        <div style={{ fontSize:10, color:C.textMuted, fontWeight:500, marginBottom:1 }}>
          Shadowfax › NCR › Middle Mile Ops
        </div>
        <div style={{ fontSize:16, fontWeight:800, color:C.text, fontFamily:"Syne,sans-serif", lineHeight:1 }}>
          {TITLES[view]}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ position:"relative" }}>
          <Search size={12} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.textMuted }}/>
          <input placeholder="Search anything..." style={{ paddingLeft:28, paddingRight:10,
            padding:"7px 10px 7px 28px", border:`1px solid ${C.border}`, borderRadius:8,
            fontSize:12, color:C.text, background:"#F9FAFB", outline:"none", width:220 }}/>
        </div>
        <button style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8,
          padding:"7px 9px", cursor:"pointer", color:C.textMuted, display:"flex", position:"relative" }}>
          <Bell size={14}/>
          <span style={{ position:"absolute", top:7, right:7, width:6, height:6,
            background:C.danger, borderRadius:"50%", border:"1.5px solid #fff" }}/>
        </button>
        <div style={{ width:1, height:22, background:C.border }}/>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.textMuted }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:C.success, display:"inline-block" }}/>
          {t.toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" })}
        </div>
        <span style={{ background:C.accentBg, color:C.accent, fontSize:10, fontWeight:800,
          padding:"3px 10px", borderRadius:20, letterSpacing:"0.06em", textTransform:"uppercase" }}>
          {role}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════ DASHBOARD (same as before) ═══════════════════ */
function Dashboard({ clients, clusters, riders, pickups }) {
  const total   = Object.keys(pickups).length;
  const done    = Object.values(pickups).filter(p=>p.status==="completed").length;
  const packets = Object.values(pickups).reduce((s,p)=>s+(p.packets||0),0);
  const rate    = total ? Math.round(done/total*100) : 0;

  const modelCounts = Object.values(MODELS).reduce((acc,m) => {
    acc[m.key] = clusters.filter(c=>c.model===m.key).length;
    return acc;
  }, {});

  const pieData = [
    { name:"Completed",   value:done,         color:C.success },
    { name:"In Progress", value:Object.values(pickups).filter(p=>p.status==="in-progress").length, color:C.warning },
    { name:"Pending",     value:total-done,   color:C.danger  },
  ];

  return (
    <div style={{ padding:"22px 24px", overflowY:"auto", flex:1 }}>
      {/* Model Summary Strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:18 }}>
        {Object.values(MODELS).map(m => {
          const mClusters = clusters.filter(c=>c.model===m.key);
          const mClients  = [...new Set(mClusters.flatMap(c=>c.clientIds))].length;
          return (
            <div key={m.key} style={{ background:m.bg, border:`1px solid ${m.border}`,
              borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:26 }}>{m.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:800, color:m.text, fontFamily:"Syne,sans-serif" }}>{m.short} — {m.label}</div>
                <div style={{ fontSize:10, color:m.text, opacity:0.7, marginTop:1 }}>{m.desc}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:22, fontWeight:800, color:m.text, fontFamily:"Syne,sans-serif", lineHeight:1 }}>{mClusters.length}</div>
                <div style={{ fontSize:9, color:m.text, opacity:0.6 }}>clusters · {mClients} clients</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        <KpiCard icon={Package}       label="Total Pickups"    value={total}     sub={`${done} completed today`}    color={C.info}    delta="+3 vs yesterday"/>
        <KpiCard icon={Activity}      label="Completion Rate"  value={`${rate}%`} sub="Across all models"           color={C.success} delta="+4%"/>
        <KpiCard icon={Truck}         label="Packets Picked"   value={packets}   sub="All active clusters"          color={C.accent}  />
        <KpiCard icon={AlertTriangle} label="Pending Stops"    value={total-done} sub={`${riders.filter(r=>clusters.some(c=>c.riderId===r.id)).length} riders active`} color={C.danger} />
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:14 }}>
        <CardWrap>
          <SH action={<Btn variant="secondary" size="sm" icon={Download}>Export</Btn>}>
            Weekly Pickup Volume — by Model
          </SH>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={TREND} barSize={11} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:C.textMuted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:C.textMuted }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:8, border:`1px solid ${C.border}`, fontSize:11 }}/>
              <Legend wrapperStyle={{ fontSize:10 }}/>
              <Bar dataKey="SDD" fill={MODELS.SDD.color} radius={[3,3,0,0]} name="SDD"/>
              <Bar dataKey="AIR" fill={MODELS.AIR.color} radius={[3,3,0,0]} name="AIR"/>
              <Bar dataKey="NDD" fill={MODELS.NDD.color} radius={[3,3,0,0]} name="NDD"/>
            </BarChart>
          </ResponsiveContainer>
        </CardWrap>

        <CardWrap>
          <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:14, color:C.text, marginBottom:3 }}>Status Split</div>
          <div style={{ fontSize:11, color:C.textMuted, marginBottom:8 }}>Today · All models</div>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={4} dataKey="value">
                {pieData.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius:8, border:`1px solid ${C.border}`, fontSize:11 }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:4 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:d.color }}/>
                <span style={{ fontSize:11, color:C.textMuted, flex:1 }}>{d.name}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:C.text }}>{d.value}</span>
              </div>
            ))}
          </div>
        </CardWrap>
      </div>

      {/* Rider table */}
      <CardWrap noPad>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:14, color:C.text }}>Live Rider Activity</div>
          <span style={{ fontSize:10, color:C.success, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.success, display:"inline-block" }}/> Live
          </span>
        </div>
        <div style={{ maxHeight:220, overflowY:"auto" }}>
          {riders.map(rider => {
            const status = getRiderStatus(rider.id, clusters, pickups);
            const cl = clusters.find(c=>c.riderId===rider.id);
            const cids = cl?.clientIds||[];
            const rDone = cids.filter(cid=>pickups[`${rider.id}-${cid}`]?.status==="completed").length;
            const rPkts = cids.reduce((s,cid)=>s+(pickups[`${rider.id}-${cid}`]?.packets||0),0);
            return (
              <div key={rider.id} style={{ padding:"10px 20px", borderBottom:`1px solid ${C.border}`,
                display:"flex", alignItems:"center", gap:12 }}>
                <Av name={rider.name} size={32} bg={cl ? MODELS[cl.model]?.color||"#1E3A5F" : "#94A3B8"}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{rider.name}</div>
                  <div style={{ fontSize:10, color:C.textMuted, display:"flex", alignItems:"center", gap:6 }}>
                    {rider.code}
                    {cl && <><span>·</span><ModelBadge model={cl.model} size="sm"/><span>·</span>{cl.name}</>}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                  <StatusPill status={status}/>
                  {cl && <span style={{ fontSize:9, color:C.textMuted }}>{rDone}/{cids.length} stops</span>}
                </div>
              </div>
            );
          })}
        </div>
      </CardWrap>
    </div>
  );
}

/* ═══════════════════ CLIENT MASTER (unchanged from v2) ═══════════════════ */
function ClientMaster({ clients, setClients, clusters }) {
  const [q, setQ]           = useState("");
  const [mFilter, setMFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const blankForm = () => ({
    name:"", address:"", lat:"", lng:"", spoc:"", contact:"",
    models:{
      SDD:{ enabled:false, cutoff:"" },
      AIR:{ enabled:false, cutoff:"" },
      NDD:{ enabled:false, cutoff:"" },
    }
  });
  const [form, setForm] = useState(blankForm());

  const ff = k => v => setForm(p=>({...p,[k]:v}));
  const setModelEnabled = (m, val) => setForm(p=>({ ...p, models:{ ...p.models, [m]:{ ...p.models[m], enabled:val } } }));
  const setModelCutoff  = (m, val) => setForm(p=>({ ...p, models:{ ...p.models, [m]:{ ...p.models[m], cutoff:val } } }));

  const filtered = useMemo(() => clients.filter(c => {
    const matchQ = c.name.toLowerCase().includes(q.toLowerCase()) ||
                   c.address.toLowerCase().includes(q.toLowerCase()) ||
                   c.spoc.toLowerCase().includes(q.toLowerCase());
    const matchM = mFilter === "ALL" || c.models[mFilter]?.enabled;
    return matchQ && matchM;
  }), [clients, q, mFilter]);

  const getCluster = (cid, model) => clusters.find(cl=>cl.model===model && cl.clientIds.includes(cid));

  const handleSave = async () => {
    if (!form.name||!form.address) return;
    const clientData = {...form, lat:parseFloat(form.lat), lng:parseFloat(form.lng)};
    if (editClient) {
      // Update
      if (supabase) {
        await supabase.from('clients').update(clientData).eq('id', editClient);
      }
      setClients(p=>p.map(c=>c.id===editClient?{...clientData,id:editClient}:c));
      setEditClient(null);
    } else {
      // Create
      const newId = `C${Date.now()}`;
      if (supabase) {
        await supabase.from('clients').insert({...clientData, id:newId});
      }
      setClients(p=>[...p,{...clientData,id:newId}]);
    }
    setForm(blankForm()); setShowAdd(false);
  };

  const handleEdit = (c) => {
    setForm({ name:c.name, address:c.address, lat:c.lat.toString(), lng:c.lng.toString(),
      spoc:c.spoc, contact:c.contact, models:JSON.parse(JSON.stringify(c.models)) });
    setEditClient(c.id); setShowAdd(true);
  };

  const mCounts = { ALL:clients.length, ...Object.keys(MODELS).reduce((a,m)=>({...a,[m]:clients.filter(c=>c.models[m]?.enabled).length}),{}) };

  const cols = [
    { key:"name", label:"Client / Address", render:r=>(
      <div>
        <div style={{ fontWeight:600, fontSize:13, color:C.text, marginBottom:2 }}>{r.name}</div>
        <div style={{ fontSize:11, color:C.textMuted }}>📍 {r.address}</div>
      </div>
    )},
    { key:"models", label:"Active Models", render:r=>(
      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
        {Object.entries(r.models).filter(([,v])=>v.enabled).map(([m])=>(
          <ModelBadge key={m} model={m} size="sm"/>
        ))}
        {!Object.values(r.models).some(v=>v.enabled) && <span style={{ color:C.textMuted, fontSize:11 }}>None</span>}
      </div>
    )},
    { key:"cutoffs", label:"Cutoff Windows", render:r=>(
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        {Object.entries(r.models).filter(([,v])=>v.enabled&&v.cutoff).map(([m,v])=>(
          <div key={m} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:9, background:MODELS[m].bg, color:MODELS[m].text,
              padding:"1px 5px", borderRadius:4, fontWeight:700 }}>{m}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.textSub }}>{v.cutoff}</span>
          </div>
        ))}
      </div>
    )},
    { key:"spoc", label:"SPOC", render:r=>(
      <div>
        <div style={{ fontSize:12, color:C.text }}>{r.spoc}</div>
        <a href={`tel:${r.contact}`} style={{ fontSize:10, color:C.info, fontFamily:"'JetBrains Mono',monospace" }}>{r.contact}</a>
      </div>
    )},
    { key:"clusters", label:"Clusters (SDD·AIR·NDD)", render:r=>(
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        {Object.keys(MODELS).map(m=>{
          const cl = getCluster(r.id, m);
          return r.models[m]?.enabled ? (
            <div key={m} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10 }}>
              <span style={{ fontSize:8, fontWeight:800, color:MODELS[m].text }}>{m}</span>
              {cl
                ? <span style={{ color:C.info, fontWeight:600 }}>{cl.name}</span>
                : <span style={{ color:C.textMuted }}>Unassigned</span>}
            </div>
          ) : null;
        })}
      </div>
    )},
  ];

  return (
    <div style={{ padding:"22px 24px", overflowY:"auto", flex:1 }}>
      {/* Filter strip */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          {["ALL",...Object.keys(MODELS)].map(m => (
            <button key={m} onClick={()=>setMFilter(m)} className="tab-h"
              style={{ padding:"5px 14px", borderRadius:20, border:`1px solid ${mFilter===m?(MODELS[m]?.border||C.accent):C.border}`,
                background: mFilter===m ? (MODELS[m]?.bg||C.accentBg) : "#fff",
                color: mFilter===m ? (MODELS[m]?.text||C.accent) : C.textMuted,
                fontSize:11, fontWeight:mFilter===m?700:500, cursor:"pointer",
                fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
              {MODELS[m] && <span style={{ fontSize:11 }}>{MODELS[m].icon}</span>}
              {m === "ALL" ? "All Models" : MODELS[m].short}
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, opacity:0.7 }}>({mCounts[m]})</span>
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <Search size={12} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.textMuted }}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search clients, SPOC..."
              style={{ paddingLeft:28, paddingRight:10, padding:"7px 10px 7px 28px",
                border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, outline:"none", width:220 }}/>
          </div>
          <Btn variant="secondary" size="md" icon={Download}>Export</Btn>
          <Btn variant="primary" size="md" icon={Plus} onClick={()=>{ setForm(blankForm()); setEditClient(null); setShowAdd(true); }}>
            Add Client
          </Btn>
        </div>
      </div>

      <div style={{ fontSize:11, color:C.textMuted, marginBottom:10 }}>
        Showing {filtered.length} of {clients.length} clients
        {mFilter!=="ALL" && <span> · Filtered by <ModelBadge model={mFilter} size="sm"/></span>}
      </div>

      <CardWrap noPad>
        <Table columns={cols} rows={filtered}
          actions={r=>[
            <button key="e" onClick={()=>handleEdit(r)}
              style={{ padding:"4px 10px", background:"#F9FAFB", color:C.textSub, border:`1px solid ${C.border}`,
                borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              <Edit2 size={10}/> Edit
            </button>,
            <a key="m" href={`https://maps.google.com/?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer"
              style={{ padding:"4px 10px", background:C.infoBg, color:C.info,
                borderRadius:6, fontSize:11, fontWeight:600, display:"inline-flex", alignItems:"center", gap:4 }}>
              <Navigation size={10}/> Maps
            </a>,
          ]}
        />
      </CardWrap>

      {/* Add/Edit Modal */}
      <Modal show={showAdd} onClose={()=>{ setShowAdd(false); setEditClient(null); }}
        title={editClient ? "Edit Client" : "Add New Client"} width={620}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          <FF label="Client Name" required full><FI value={form.name} onChange={ff("name")} placeholder="e.g. Flipkart — Noida WH"/></FF>
          <FF label="Full Address" required full><FI value={form.address} onChange={ff("address")} placeholder="Complete address with city"/></FF>
          <FF label="Latitude"><FI value={form.lat} onChange={ff("lat")} placeholder="28.5714"/></FF>
          <FF label="Longitude"><FI value={form.lng} onChange={ff("lng")} placeholder="77.3219"/></FF>
          <FF label="SPOC Name"><FI value={form.spoc} onChange={ff("spoc")} placeholder="Contact person name"/></FF>
          <FF label="SPOC Contact"><FI value={form.contact} onChange={ff("contact")} placeholder="10 digit mobile"/></FF>
        </div>

        {/* Model-wise cutoffs */}
        <div style={{ marginTop:8, marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.06em",
            textTransform:"uppercase", marginBottom:10 }}>Pickup Model Configuration</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {Object.values(MODELS).map(m => {
              const en = form.models[m.key]?.enabled;
              return (
                <div key={m.key} style={{ border:`1.5px solid ${en?m.border:C.border}`,
                  borderRadius:10, padding:"12px 14px", background:en?m.bg:"#FAFBFC",
                  transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:en?10:0 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:en?m.color:"#E4E7EC",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.15s" }}>
                      <span style={{ fontSize:14 }}>{m.icon}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:en?m.text:C.textMuted }}>{m.short} — {m.label}</div>
                      <div style={{ fontSize:10, color:en?m.text:C.textMuted, opacity:0.7 }}>{m.desc}</div>
                    </div>
                    <button onClick={()=>setModelEnabled(m.key,!en)}
                      style={{ width:38, height:22, borderRadius:11, border:"none", cursor:"pointer",
                        background:en?m.color:"#D1D5DB", display:"flex", alignItems:"center",
                        padding:"2px", transition:"all 0.2s", justifyContent:en?"flex-end":"flex-start" }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff",
                        boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
                    </button>
                  </div>
                  {en && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:6 }}>
                      <FF label={`${m.short} Pickup Cutoff Window`} hint="e.g. 09:00–13:00">
                        <FI value={form.models[m.key].cutoff} onChange={v=>setModelCutoff(m.key,v)} placeholder="HH:MM–HH:MM"/>
                      </FF>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="secondary" onClick={()=>{ setShowAdd(false); setEditClient(null); }} ex={{ flex:1 }}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} ex={{ flex:1 }}>{editClient?"Save Changes":"Add Client"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════ CLUSTER BOARD (unchanged from v2) ═══════════════════ */
const CL_COLORS_BY_MODEL = { SDD:["#F59E0B","#D97706","#B45309"], AIR:["#06B6D4","#0891B2","#0E7490"], NDD:["#6366F1","#4F46E5","#4338CA"] };

function ClusterBoard({ clients, clusters, setClusters, riders }) {
  const [activeModel, setActiveModel] = useState("SDD");
  const [showCreate, setShowCreate]   = useState(false);
  const [showAssign, setShowAssign]   = useState(null);
  const [newName, setNewName]         = useState("");
  const [selC, setSelC]               = useState([]);

  const m = MODELS[activeModel];
  const eligibleClients = clients.filter(c=>c.models[activeModel]?.enabled);
  const modelClusters   = clusters.filter(c=>c.model===activeModel);
  const modelCounts = Object.keys(MODELS).reduce((acc,mk)=>({...acc,[mk]:clusters.filter(c=>c.model===mk).length}),{});
  const unassignedInModel = eligibleClients.filter(c=>!modelClusters.some(cl=>cl.clientIds.includes(c.id)));

  const toggleClient = id => setSelC(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const handleCreate = async () => {
    if (!newName) return;
    const idx = modelClusters.length % 3;
    const color = CL_COLORS_BY_MODEL[activeModel][idx];
    const newCluster = { id:`CL${Date.now()}`, name:newName, model:activeModel, clientIds:selC, riderId:null, color };
    if (supabase) {
      await supabase.from('clusters').insert(newCluster);
    }
    setClusters(p=>[...p,newCluster]);
    setNewName(""); setSelC([]); setShowCreate(false);
  };

  const handleAssign = async (clusterId, riderId) => {
    // Remove rider from all clusters of this model first
    const updates = clusters.map(cl=>cl.model===activeModel && cl.riderId===riderId ? {...cl,riderId:null} : cl);
    const final = updates.map(cl=>cl.id===clusterId ? {...cl,riderId} : cl);
    if (supabase) {
      await supabase.from('clusters').upsert(final.filter(cl=>cl.model===activeModel));
    }
    setClusters(final);
    setShowAssign(null);
  };

  const deleteCluster = async (id) => {
    if (supabase) {
      await supabase.from('clusters').delete().eq('id', id);
    }
    setClusters(p=>p.filter(c=>c.id!==id));
  };

  return (
    <div style={{ padding:"22px 24px", overflowY:"auto", flex:1 }}>
      {/* Model selector */}
      <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:12,
        padding:"14px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.06em",
          textTransform:"uppercase", whiteSpace:"nowrap", flexShrink:0 }}>Select Model</div>
        <div style={{ flex:1 }}>
          <ModelTabs active={activeModel} onChange={m=>{ setActiveModel(m); setSelC([]); }} counts={modelCounts}/>
        </div>
        <div style={{ width:1, height:28, background:C.border }}/>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:m.text }}>{m.icon} {m.label}</div>
          <div style={{ fontSize:10, color:C.textMuted }}>{m.desc}</div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:"flex", gap:10, marginBottom:18 }}>
        {[
          [`${modelClusters.length}`, "Clusters", m.color],
          [`${eligibleClients.length}`, `${activeModel} Clients`, C.textSub],
          [`${modelClusters.filter(c=>c.riderId).length}`, "Assigned Riders", C.success],
          [`${unassignedInModel.length}`, "Unassigned Clients", unassignedInModel.length?C.danger:C.success],
        ].map(([v,l,color])=>(
          <div key={l} style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:9,
            padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:"Syne,sans-serif", fontSize:18, fontWeight:800, color }}>{v}</span>
            <span style={{ fontSize:11, color:C.textMuted }}>{l}</span>
          </div>
        ))}
        <div style={{ marginLeft:"auto" }}>
          <Btn variant="primary" icon={Plus} onClick={()=>setShowCreate(true)}
            ex={{ background:m.color }}>
            New {activeModel} Cluster
          </Btn>
        </div>
      </div>

      {/* Cluster Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
        {modelClusters.map(cl => {
          const clClients = cl.clientIds.map(id=>clients.find(c=>c.id===id)).filter(Boolean);
          const rider = riders.find(r=>r.id===cl.riderId);
          return (
            <div key={cl.id} style={{ background:"#fff", borderRadius:14,
              border:`1px solid ${C.border}`, overflow:"hidden", display:"flex", flexDirection:"column",
              boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              {/* Header */}
              <div style={{ background:cl.color, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ color:"#fff", fontWeight:800, fontSize:15, fontFamily:"Syne,sans-serif" }}>{cl.name}</div>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontSize:10, marginTop:2 }}>
                    {clClients.length} client{clClients.length!==1?"s":""} · {m.desc}
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ background:"rgba(0,0,0,0.18)", borderRadius:6, padding:"3px 8px",
                    color:"rgba(255,255,255,0.75)", fontSize:9, fontWeight:800,
                    fontFamily:"'JetBrains Mono',monospace" }}>{cl.id}</span>
                  <button onClick={()=>deleteCluster(cl.id)}
                    style={{ background:"rgba(0,0,0,0.18)", border:"none", borderRadius:6,
                      padding:"4px", cursor:"pointer", color:"rgba(255,255,255,0.7)", display:"flex" }}>
                    <Trash2 size={11}/>
                  </button>
                </div>
              </div>

              {/* Clients */}
              <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, flex:1 }}>
                <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, letterSpacing:"0.1em",
                  textTransform:"uppercase", marginBottom:7 }}>Clients & Cutoffs</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {clClients.map(c => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      background:"#F9FAFB", borderRadius:7, padding:"6px 10px" }}>
                      <div style={{ fontSize:11, fontWeight:600, color:C.text, overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{c.name.split(" - ")[0]}</div>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.textMuted,
                        background:"#fff", border:`1px solid ${C.border}`, padding:"2px 6px", borderRadius:5,
                        flexShrink:0, marginLeft:6 }}>{c.models[activeModel]?.cutoff||"—"}</span>
                    </div>
                  ))}
                  {!clClients.length && <div style={{ fontSize:11, color:C.textMuted }}>No clients assigned yet</div>}
                </div>
              </div>

              {/* Rider */}
              <div style={{ padding:"11px 14px" }}>
                <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, letterSpacing:"0.1em",
                  textTransform:"uppercase", marginBottom:7 }}>Assigned Rider</div>
                {rider ? (
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <Av name={rider.name} size={34} bg={cl.color}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{rider.name}</div>
                      <div style={{ fontSize:10, color:C.textMuted }}>{rider.code} · Shift {rider.shift} · {rider.vehicle}</div>
                    </div>
                    <button onClick={()=>setShowAssign(cl.id)}
                      style={{ background:"#F9FAFB", border:`1px solid ${C.border}`, borderRadius:6,
                        padding:"4px 10px", cursor:"pointer", fontSize:11, fontWeight:600,
                        color:C.textMuted, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Reassign</button>
                  </div>
                ) : (
                  <button onClick={()=>setShowAssign(cl.id)}
                    style={{ width:"100%", background:"#FAFBFC", border:`1.5px dashed ${C.border}`,
                      borderRadius:8, padding:"10px", cursor:"pointer", color:C.textMuted, fontSize:12,
                      fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center",
                      justifyContent:"center", gap:6 }}>
                    <Plus size={13}/> Assign Rider
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Unassigned warning */}
        {unassignedInModel.length > 0 && (
          <div style={{ background:"#FFFBF5", border:`1.5px dashed ${m.border}`, borderRadius:14, padding:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:m.text, display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <AlertTriangle size={13}/> {unassignedInModel.length} {activeModel} Client{unassignedInModel.length!==1?"s":""} Not Yet Clustered
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {unassignedInModel.map(c => (
                <div key={c.id} style={{ background:m.bg, border:`1px solid ${m.border}`, borderRadius:6,
                  padding:"3px 10px", fontSize:11, color:m.text, fontWeight:500 }}>
                  {c.name.split(" - ")[0]}
                  <span style={{ marginLeft:6, opacity:0.6, fontSize:9 }}>{c.models[activeModel]?.cutoff}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:10, color:C.textMuted, marginTop:8 }}>Create a new {activeModel} cluster to include these clients.</div>
          </div>
        )}
      </div>

      {/* Create Cluster Modal */}
      <Modal show={showCreate} onClose={()=>{ setShowCreate(false); setSelC([]); setNewName(""); }}
        title={`Create New ${activeModel} Cluster`} width={560}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
          background:m.bg, border:`1px solid ${m.border}`, borderRadius:9, marginBottom:14 }}>
          <span style={{ fontSize:20 }}>{m.icon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:m.text }}>{m.label} Cluster</div>
            <div style={{ fontSize:10, color:m.text, opacity:0.7 }}>{m.desc}</div>
          </div>
        </div>
        <FF label="Cluster Name" required>
          <FI value={newName} onChange={setNewName} placeholder={`e.g. ${activeModel}-Noida-2, ${activeModel}-Gurgaon-1`}/>
        </FF>
        <FF label={`Select Clients (${activeModel}-enabled only · ${selC.length} selected)`}>
          <div style={{ border:`1px solid ${C.border}`, borderRadius:9, maxHeight:280, overflowY:"auto" }}>
            {eligibleClients.length === 0 ? (
              <div style={{ padding:"20px", textAlign:"center", color:C.textMuted, fontSize:12 }}>
                No clients enabled for {activeModel}. Enable {activeModel} in client settings first.
              </div>
            ) : eligibleClients.map(c => {
              const inOther = modelClusters.some(cl=>cl.clientIds.includes(c.id));
              const sel = selC.includes(c.id);
              return (
                <div key={c.id} onClick={()=>!inOther&&toggleClient(c.id)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
                    borderBottom:`1px solid ${C.border}`, cursor:inOther?"not-allowed":"pointer",
                    background:sel?"#EFF6FF":inOther?"#FAFBFC":"#fff", opacity:inOther?0.5:1 }}>
                  <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${sel?m.color:C.border}`,
                    background:sel?m.color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {sel && <Check size={9} color="#fff"/>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.name}</div>
                    <div style={{ fontSize:10, color:C.textMuted }}>
                      {m.icon} Cutoff: <span style={{ fontFamily:"'JetBrains Mono',monospace", color:m.text, fontWeight:600 }}>
                        {c.models[activeModel]?.cutoff || "Not set"}
                      </span> · SPOC: {c.spoc}
                    </div>
                  </div>
                  {inOther && <span style={{ fontSize:9, color:C.textMuted, fontStyle:"italic" }}>Already in cluster</span>}
                </div>
              );
            })}
          </div>
        </FF>
        <div style={{ display:"flex", gap:10, marginTop:8 }}>
          <Btn variant="secondary" onClick={()=>{ setShowCreate(false); setSelC([]); setNewName(""); }} ex={{ flex:1 }}>Cancel</Btn>
          <Btn variant="primary" onClick={handleCreate} ex={{ flex:1, background:m.color }}>
            Create {activeModel} Cluster ({selC.length} clients)
          </Btn>
        </div>
      </Modal>

      {/* Assign Rider Modal */}
      <Modal show={!!showAssign} onClose={()=>setShowAssign(null)} title={`Assign Rider — ${activeModel} Cluster`} width={420}>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
          background:m.bg, border:`1px solid ${m.border}`, borderRadius:8, marginBottom:12, fontSize:11, color:m.text, fontWeight:600 }}>
          {m.icon} Only Shift A riders should handle SDD/AIR · Shift B for NDD is recommended
        </div>
        <div onClick={()=>handleAssign(showAssign, null)}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px",
            border:`1px solid ${C.dangerBg}`, borderRadius:8, cursor:"pointer", color:C.danger, fontSize:13, fontWeight:600, marginBottom:10 }}>
          <XCircle size={14}/> Remove Assignment
        </div>
        {riders.map(r => {
          const busy = clusters.some(c=>c.model===activeModel && c.riderId===r.id && c.id!==showAssign);
          const shift_mismatch = (activeModel==="NDD" && r.shift==="A") || ((activeModel==="SDD"||activeModel==="AIR") && r.shift==="B");
          return (
            <div key={r.id} onClick={()=>!busy&&handleAssign(showAssign,r.id)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                border:`1px solid ${C.border}`, borderRadius:8, marginBottom:6,
                cursor:busy?"not-allowed":"pointer", background:busy?"#FAFBFC":"#fff", opacity:busy?0.55:1 }}>
              <Av name={r.name} size={36} bg={busy?"#94A3B8":m.color}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, display:"flex", alignItems:"center", gap:7 }}>
                  {r.name}
                  {shift_mismatch && !busy && (
                    <span style={{ fontSize:9, background:C.warningBg, color:C.warning,
                      padding:"1px 6px", borderRadius:6, fontWeight:700 }}>⚠ Shift mismatch</span>
                  )}
                </div>
                <div style={{ fontSize:10, color:C.textMuted }}>{r.code} · Shift {r.shift} · {r.vehicle}</div>
              </div>
              {busy ? <span style={{ fontSize:9, color:C.textMuted }}>In use</span> : <ChevronRight size={13} color={C.textMuted}/>}
            </div>
          );
        })}
      </Modal>
    </div>
  );
}

/* ═══════════════════ RIDER MANAGEMENT (same as v2) ═══════════════════ */
function RiderMgmt({ riders, setRiders, clusters, setClusters }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ name:"", code:"", phone:"", vehicle:"", shift:"A" });
  const ff = k => v => setForm(p=>({...p,[k]:v}));

  const handleAdd = async () => {
    if (!form.name||!form.code) return;
    const newId = `R${Date.now()}`;
    if (supabase) {
      await supabase.from('riders').insert({...form, id:newId});
    }
    setRiders(p=>[...p,{...form,id:newId}]);
    setForm({ name:"", code:"", phone:"", vehicle:"", shift:"A" }); setShowAdd(false);
  };

  const getAssignments = riderId => clusters.filter(c=>c.riderId===riderId);

  const cols = [
    { key:"name", label:"Rider", render:r=>(
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Av name={r.name} size={34} bg="#1E3A5F"/>
        <div>
          <div style={{ fontWeight:600, fontSize:13, color:C.text }}>{r.name}</div>
          <div style={{ fontSize:10, color:C.info, fontFamily:"'JetBrains Mono',monospace" }}>{r.code}</div>
        </div>
      </div>
    )},
    { key:"vehicle", label:"Vehicle", render:r=>(
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11,
        background:"#F2F4F7", padding:"3px 9px", borderRadius:6, color:C.textSub }}>{r.vehicle}</span>
    )},
    { key:"shift", label:"Shift", render:r=>(
      <span style={{ background:r.shift==="A"?C.infoBg:MODELS.NDD.bg, color:r.shift==="A"?C.info:MODELS.NDD.text,
        fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
        {r.shift==="A"?"☀️":"🌙"} Shift {r.shift}
      </span>
    )},
    { key:"clusters", label:"Model Assignments", render:r=>{
      const asgn = getAssignments(r.id);
      return asgn.length ? (
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {asgn.map(cl=>(
            <div key={cl.id} style={{ display:"flex", alignItems:"center", gap:4,
              background:MODELS[cl.model].bg, border:`1px solid ${MODELS[cl.model].border}`,
              borderRadius:6, padding:"2px 8px" }}>
              <span style={{ fontSize:9 }}>{MODELS[cl.model].icon}</span>
              <span style={{ fontSize:10, fontWeight:700, color:MODELS[cl.model].text }}>{cl.name}</span>
            </div>
          ))}
        </div>
      ) : <span style={{ color:C.textMuted, fontSize:11 }}>— Unassigned</span>;
    }},
    { key:"phone", label:"Contact", render:r=>(
      <a href={`tel:${r.phone}`} style={{ color:C.info, fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>{r.phone}</a>
    )},
  ];

  return (
    <div style={{ padding:"22px 24px", overflowY:"auto", flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", gap:12 }}>
          {[
            ["Total",riders.length,C.text],
            ["Assigned",riders.filter(r=>clusters.some(c=>c.riderId===r.id)).length,C.success],
            ["Shift A",riders.filter(r=>r.shift==="A").length,MODELS.SDD.text],
            ["Shift B",riders.filter(r=>r.shift==="B").length,MODELS.NDD.text],
          ].map(([l,v,color])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontFamily:"Syne,sans-serif", fontSize:17, fontWeight:800, color }}>{v}</span>
              <span style={{ fontSize:11, color:C.textMuted }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant="secondary" icon={Download}>Export</Btn>
          <Btn variant="primary" icon={Plus} onClick={()=>setShowAdd(true)}>Add Rider</Btn>
        </div>
      </div>

      <CardWrap noPad>
        <Table columns={cols} rows={riders}
          actions={r=>[
            <button key="u" onClick={()=>setClusters(p=>p.map(cl=>({...cl,riderId:cl.riderId===r.id?null:cl.riderId})))}
              style={{ padding:"4px 10px", background:C.dangerBg, color:C.danger, border:"none",
                borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              Unassign All
            </button>
          ]}
        />
      </CardWrap>

      <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="Add New Rider">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          <FF label="Full Name" required><FI value={form.name} onChange={ff("name")} placeholder="Rider full name"/></FF>
          <FF label="Rider Code" required><FI value={form.code} onChange={ff("code")} placeholder="e.g. PB-007"/></FF>
          <FF label="Phone Number"><FI value={form.phone} onChange={ff("phone")} placeholder="10 digit mobile"/></FF>
          <FF label="Vehicle Number"><FI value={form.vehicle} onChange={ff("vehicle")} placeholder="e.g. DL-1C-9999"/></FF>
          <FF label="Shift Assignment" full>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[["A","☀️ Shift A — 09:00 to 19:00","SDD / AIR"],["B","🌙 Shift B — 19:00 to 09:00","NDD"]].map(([s,l,note])=>(
                <button key={s} onClick={()=>setForm(p=>({...p,shift:s}))}
                  style={{ padding:"11px 14px", border:`2px solid ${form.shift===s?m_color(s):C.border}`,
                    borderRadius:9, background:form.shift===s?m_bg(s):"#fff",
                    fontWeight:600, cursor:"pointer", color:form.shift===s?m_text(s):C.textMuted,
                    fontFamily:"'Plus Jakarta Sans',sans-serif", textAlign:"left" }}>
                  <div style={{ fontSize:13 }}>{l}</div>
                  <div style={{ fontSize:10, opacity:0.7, marginTop:2 }}>Best for: {note}</div>
                </button>
              ))}
            </div>
          </FF>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:10 }}>
          <Btn variant="secondary" onClick={()=>setShowAdd(false)} ex={{ flex:1 }}>Cancel</Btn>
          <Btn variant="primary" onClick={handleAdd} ex={{ flex:1 }}>Add Rider</Btn>
        </div>
      </Modal>
    </div>
  );
}
function m_color(s){ return s==="A"?MODELS.SDD.color:MODELS.NDD.color; }
function m_bg(s)   { return s==="A"?MODELS.SDD.bg:MODELS.NDD.bg; }
function m_text(s) { return s==="A"?MODELS.SDD.text:MODELS.NDD.text; }

/* ═══════════════════ LIVE MAP WITH REAL GPS ═══════════════════ */
function LiveMap({ riders, clusters, pickups, riderLocations }) {
  const [sel, setSel]      = useState(null);
  const [modelFilter, setMF] = useState("ALL");
  const mapRef = React.useRef(null);
  const markersRef = React.useRef({});

  // Initialize Leaflet map
  useEffect(() => {
    if (!window.L || mapRef.current) return;
    
    // Create map centered on NCR
    const map = window.L.map('live-map').setView([28.6139, 77.2090], 10);
    
    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    mapRef.current = map;
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update rider markers
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    const visRiders = modelFilter === "ALL" ? riders
      : riders.filter(r=>clusters.some(c=>c.riderId===r.id && c.model===modelFilter));

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Add new markers
    visRiders.forEach(rider => {
      const loc = riderLocations[rider.id];
      if (!loc) return;

      const status = getRiderStatus(rider.id, clusters, pickups);
      const cl = clusters.find(c=>c.riderId===rider.id);
      const DOT_C = { completed:"#12B76A","in-progress":"#F79009",pending:"#F04438",idle:"#98A2B3" };
      const color = DOT_C[status];

      const icon = window.L.divIcon({
        className: 'rider-marker',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);font-family:'Plus Jakarta Sans',sans-serif">${rider.code.split("-")[1]}</div>`,
        iconSize: [32, 32]
      });

      const marker = window.L.marker([loc.lat, loc.lng], { icon })
        .addTo(mapRef.current)
        .on('click', () => setSel(rider.id));

      markersRef.current[rider.id] = marker;
    });
  }, [riders, clusters, riderLocations, modelFilter, pickups]);

  const selRider = sel ? riders.find(r=>r.id===sel) : null;
  const selClusters = selRider ? clusters.filter(c=>c.riderId===selRider.id) : [];

  return (
    <div style={{ padding:"22px 24px", flex:1, overflow:"hidden", display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", gap:6 }}>
          {["ALL",...Object.keys(MODELS)].map(mk => {
            const m = MODELS[mk];
            return (
              <button key={mk} onClick={()=>setMF(mk)}
                style={{ padding:"5px 14px", borderRadius:20, border:`1px solid ${modelFilter===mk?(m?.border||C.accent):C.border}`,
                  background:modelFilter===mk?(m?.bg||C.accentBg):"#fff",
                  color:modelFilter===mk?(m?.text||C.accent):C.textMuted,
                  fontSize:11, fontWeight:modelFilter===mk?700:500, cursor:"pointer",
                  fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                {m && <span style={{ fontSize:11 }}>{m.icon}</span>}
                {mk === "ALL" ? "All Models" : m.short}
              </button>
            );
          })}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          {Object.entries({ completed:"Completed", "in-progress":"In Progress", pending:"Pending", idle:"Idle" }).map(([s,l])=>{
            const colors={completed:"#12B76A","in-progress":"#F79009",pending:"#F04438",idle:"#98A2B3"};
            return (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.textMuted }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:colors[s] }}/>
                {l}
              </div>
            );
          })}
          <Btn variant="ghost" icon={RefreshCw} size="sm" onClick={()=>window.location.reload()}>Refresh</Btn>
        </div>
      </div>

      <div style={{ display:"flex", gap:14, flex:1, overflow:"hidden", minHeight:0 }}>
        {/* Map */}
        <div id="live-map" style={{ flex:1, borderRadius:12, border:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", bottom:10, right:14, background:"rgba(255,255,255,0.9)",
            padding:"6px 10px", borderRadius:8, fontSize:9, color:C.textMuted, zIndex:1000,
            boxShadow:"0 2px 8px rgba(0,0,0,0.1)", fontWeight:600 }}>
            🟢 Live GPS Tracking
          </div>
        </div>

        {/* Side panel */}
        <div style={{ width:276, display:"flex", flexDirection:"column", gap:10, overflowY:"auto" }}>
          {selRider ? (
            <CardWrap noPad>
              <div style={{ background:"#0C111D", padding:"14px 16px", borderRadius:"12px 12px 0 0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <Av name={selRider.name} size={40} bg={C.accent}/>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#F2F4F7", fontWeight:700, fontSize:14 }}>{selRider.name}</div>
                    <div style={{ color:"#4D5B6E", fontSize:10 }}>{selRider.code} · Shift {selRider.shift}</div>
                  </div>
                  <StatusPill status={getRiderStatus(selRider.id,clusters,pickups)}/>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {selClusters.map(cl=><ModelBadge key={cl.id} model={cl.model} size="sm"/>)}
                </div>
              </div>
              <div style={{ padding:"12px 16px" }}>
                {selClusters.map(cl=>(
                  <div key={cl.id} style={{ marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <ModelBadge model={cl.model} size="sm"/>
                      <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{cl.name}</span>
                    </div>
                    {cl.clientIds.map(cid=>{
                      const c = CLIENTS_INIT.find(client=>client.id===cid);
                      const pk = pickups[`${selRider.id}-${cid}`];
                      return (
                        <div key={cid} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 0" }}>
                          <div style={{ flex:1, fontSize:11, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {c?.name.split(" - ")[0]||cid}
                          </div>
                          <StatusPill status={pk?.status||"pending"}/>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.border}` }}>
                <a href={`tel:${selRider.phone}`} style={{ display:"flex", justifyContent:"center", alignItems:"center",
                  gap:6, width:"100%", background:C.accent, color:"#fff", borderRadius:8, padding:"9px",
                  textDecoration:"none", fontSize:12, fontWeight:700 }}>
                  <Phone size={13}/> Call {selRider.name.split(" ")[0]}
                </a>
              </div>
            </CardWrap>
          ) : (
            <CardWrap style={{ textAlign:"center", padding:"24px 16px" }}>
              <MapPin size={28} color={C.textMuted} style={{ margin:"0 auto 8px", display:"block" }}/>
              <div style={{ fontSize:13, fontWeight:600, color:C.textMuted }}>Select a rider</div>
              <div style={{ fontSize:11, color:C.textMuted, marginTop:4, lineHeight:1.6 }}>Click any rider marker on the map to see details and stop-level progress</div>
            </CardWrap>
          )}

          <CardWrap noPad>
            <div style={{ padding:"9px 14px", borderBottom:`1px solid ${C.border}`, fontSize:10, fontWeight:700,
              color:C.textMuted, letterSpacing:"0.08em", textTransform:"uppercase" }}>All Riders</div>
            {riders.map(r => {
              const status = getRiderStatus(r.id, clusters, pickups);
              const rClusters = clusters.filter(c=>c.riderId===r.id);
              const DOT_C = { completed:"#12B76A","in-progress":"#F79009",pending:"#F04438",idle:"#98A2B3" };
              return (
                <div key={r.id} onClick={()=>setSel(r.id===sel?null:r.id)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px",
                    borderBottom:`1px solid ${C.border}`, cursor:"pointer",
                    background:sel===r.id?"#EFF6FF":"#fff", transition:"background 0.1s" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:DOT_C[status], flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</div>
                    <div style={{ display:"flex", gap:3, marginTop:2 }}>
                      {rClusters.map(cl=><ModelBadge key={cl.id} model={cl.model} size="sm"/>)}
                      {!rClusters.length && <span style={{ fontSize:9, color:C.textMuted }}>Unassigned</span>}
                    </div>
                  </div>
                  <StatusPill status={status}/>
                </div>
              );
            })}
          </CardWrap>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ REPORTS (same as v2) ═══════════════════ */
function Reports({ clients, clusters, riders, pickups }) {
  const total   = Object.keys(pickups).length;
  const done    = Object.values(pickups).filter(p=>p.status==="completed").length;
  const packets = Object.values(pickups).reduce((s,p)=>s+(p.packets||0),0);

  return (
    <div style={{ padding:"22px 24px", overflowY:"auto", flex:1 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:14, marginBottom:14 }}>
        <CardWrap>
          <SH action={<Btn variant="secondary" size="sm" icon={Download}>Export CSV</Btn>}>
            Weekly Volume — by Model
          </SH>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TREND} barSize={10} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:C.textMuted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:C.textMuted }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:8, border:`1px solid ${C.border}`, fontSize:11 }}/>
              <Legend wrapperStyle={{ fontSize:10 }}/>
              <Bar dataKey="SDD" fill={MODELS.SDD.color} radius={[3,3,0,0]} name="SDD ☀️"/>
              <Bar dataKey="AIR" fill={MODELS.AIR.color} radius={[3,3,0,0]} name="AIR ✈️"/>
              <Bar dataKey="NDD" fill={MODELS.NDD.color} radius={[3,3,0,0]} name="NDD 🌙"/>
            </BarChart>
          </ResponsiveContainer>
        </CardWrap>
        <CardWrap>
          <SH>Today's KPIs</SH>
          {[
            ["Pickups Assigned",total,C.info],["Completed",done,C.success],
            ["Pending",total-done,C.danger],["Packets Picked",packets,C.accent],
            ["Clusters Active",clusters.filter(c=>c.clientIds.length>0).length,MODELS.SDD.color],
            ["Riders on Field",riders.filter(r=>clusters.some(c=>c.riderId===r.id)).length,MODELS.AIR.color],
          ].map(([l,v,color])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.textMuted }}>{l}</span>
              <span style={{ fontFamily:"Syne,sans-serif", fontSize:16, fontWeight:800, color }}>{v}</span>
            </div>
          ))}
        </CardWrap>
      </div>

      <CardWrap noPad>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:14, color:C.text }}>Client Performance — All Models</div>
          <Btn variant="secondary" size="sm" icon={Download}>Download</Btn>
        </div>
        <Table
          columns={[
            { key:"name", label:"Client", render:r=><span style={{ fontWeight:600 }}>{r.name}</span> },
            { key:"models", label:"Models", render:r=>(
              <div style={{ display:"flex", gap:3 }}>
                {Object.entries(r.models).filter(([,v])=>v.enabled).map(([m])=><ModelBadge key={m} model={m} size="sm"/>)}
              </div>
            )},
            { key:"cutoffs", label:"Cutoff Windows", render:r=>(
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                {Object.entries(r.models).filter(([,v])=>v.enabled&&v.cutoff).map(([m,v])=>(
                  <div key={m} style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ fontSize:8, background:MODELS[m].bg, color:MODELS[m].text,
                      padding:"1px 5px", borderRadius:4, fontWeight:800 }}>{m}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>{v.cutoff}</span>
                  </div>
                ))}
              </div>
            )},
            { key:"spoc", label:"SPOC" },
          ]}
          rows={clients}
        />
      </CardWrap>
    </div>
  );
}

/* ═══════════════════ USER ROLES (same as v2) ═══════════════════ */
function UserRoles() {
  const [users, setUsers] = useState(USERS_INIT);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", perms:[] });
  const ALL_PERMS = ["clients","clusters","riders","status","analytics","reports"];
  const togglePerm = p => setForm(f=>({...f,perms:f.perms.includes(p)?f.perms.filter(x=>x!==p):[...f.perms,p]}));
  const handleAdd = () => {
    if (!form.name||!form.email) return;
    setUsers(p=>[...p,{...form,id:`U${Date.now()}`,role:"supervisor",active:true}]);
    setForm({name:"",email:"",perms:[]}); setShowAdd(false);
  };
  return (
    <div style={{ padding:"22px 24px", overflowY:"auto", flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <span style={{ fontSize:12, color:C.textMuted }}>{users.length} supervisors · {users.filter(u=>u.active).length} active</span>
        <Btn variant="primary" icon={Plus} onClick={()=>setShowAdd(true)}>Add Supervisor</Btn>
      </div>
      <CardWrap noPad>
        <Table
          columns={[
            { key:"name", label:"User", render:r=>(
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Av name={r.name} size={34} bg="#1E3A5F"/>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:C.text }}>{r.name}</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{r.email}</div>
                </div>
              </div>
            )},
            { key:"role", label:"Role", render:()=>(
              <span style={{ background:C.infoBg, color:C.info, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>SUPERVISOR</span>
            )},
            { key:"perms", label:"Module Access", render:r=>(
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {r.perms.map(p=>(
                  <span key={p} style={{ background:C.purpleBg, color:C.purple, fontSize:9, fontWeight:700,
                    padding:"2px 8px", borderRadius:10, textTransform:"uppercase", letterSpacing:"0.04em" }}>{p}</span>
                ))}
              </div>
            )},
            { key:"active", label:"Status", render:r=>(
              <button onClick={()=>setUsers(p=>p.map(u=>u.id===r.id?{...u,active:!u.active}:u))}
                style={{ padding:"4px 12px", borderRadius:20, border:"none",
                  background:r.active?C.successBg:C.dangerBg, color:r.active?C.success:C.danger,
                  cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                {r.active?"● Active":"● Inactive"}
              </button>
            )},
          ]}
          rows={users} actions={()=>[]}
        />
      </CardWrap>
      <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="Add Supervisor">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          <FF label="Full Name" required><FI value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="e.g. Rajesh Kumar"/></FF>
          <FF label="Work Email" required><FI value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} placeholder="user@shadowfax.in"/></FF>
          <FF label="Module Permissions" full>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {ALL_PERMS.map(p=>(
                <div key={p} onClick={()=>togglePerm(p)} className="chip-h"
                  style={{ padding:"5px 14px", borderRadius:20, border:`1px solid ${form.perms.includes(p)?C.purple:C.border}`,
                    background:form.perms.includes(p)?C.purpleBg:"#fff",
                    color:form.perms.includes(p)?C.purple:C.textMuted,
                    fontSize:12, fontWeight:600, textTransform:"capitalize" }}>{p}</div>
              ))}
            </div>
          </FF>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:10 }}>
          <Btn variant="secondary" onClick={()=>setShowAdd(false)} ex={{ flex:1 }}>Cancel</Btn>
          <Btn variant="primary" onClick={handleAdd} ex={{ flex:1 }}>Add Supervisor</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════ ROOT ═══════════════════ */
// ═══════════════════ AUTHENTICATION WRAPPER ═══════════════════
export default function PickupOSDesktop() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('pickupos_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('pickupos_user');
      }
    }
    setLoading(false);
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('pickupos_user', JSON.stringify(userData));
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pickupos_user');
  };

  // Show loading spinner
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh",
        background: "#F4F6FA",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            fontSize: 18, 
            fontWeight: 600, 
            color: "#344054",
            marginBottom: 8
          }}>
            Loading PickupOS...
          </div>
          <div style={{ fontSize: 14, color: "#667085" }}>
            Please wait
          </div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} supabase={supabase} />;
  }

  // Show main app if authenticated
  return <MainApp user={user} onLogout={handleLogout} />;
}

// ═══════════════════ MAIN APP (After Authentication) ═══════════════════
function MainApp({ user, onLogout }) {
  const [view, setView]     = useState("dashboard");
  const [role, setRole]     = useState("admin");
  const [clients, setClients]   = useState(CLIENTS_INIT);
  const [clusters, setClusters] = useState(CLUSTERS_INIT);
  const [riders, setRiders]     = useState(RIDERS_INIT);
  const [pickups]               = useState(PICKUPS_INIT);
  const [riderLocations, setRiderLocations] = useState(RIDER_LOCATIONS_INIT);

  // Load Leaflet script
  useEffect(() => {
    if (window.L) return;
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Real-time location subscription (activate after Supabase setup)
  useEffect(() => {
    if (!supabase) return;
    const unsubscribe = subscribeToRiderLocations((newLoc) => {
      setRiderLocations(prev => ({ ...prev, [newLoc.rider_id]: newLoc }));
    });
    return unsubscribe;
  }, []);

  // Load data from Supabase on mount (activate after setup)
  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      fetchClients().then(setClients),
      fetchClusters().then(setClusters),
      fetchRiders().then(setRiders),
      fetchRiderLocations().then(setRiderLocations),
    ]);
  }, []);

  const content = {
    dashboard: <Dashboard  clients={clients} clusters={clusters} riders={riders} pickups={pickups}/>,
    clients:   <ClientMaster clients={clients} setClients={setClients} clusters={clusters}/>,
    clusters:  <ClusterBoard clients={clients} clusters={clusters} setClusters={setClusters} riders={riders}/>,
    riders:    <RiderMgmt riders={riders} setRiders={setRiders} clusters={clusters} setClusters={setClusters}/>,
    map:       <LiveMap    riders={riders} clusters={clusters} pickups={pickups} riderLocations={riderLocations}/>,
    reports:   <Reports    clients={clients} clusters={clusters} riders={riders} pickups={pickups}/>,
    roles:     <UserRoles/>,
    users:     <UserManagement supabase={supabase}/>,
  };

  return (
    <>
      <GS/>
      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:C.bg }}>
        <Sidebar view={view} setView={setView} role={role} setRole={setRole}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
          <TopBar view={view} role={role}/>
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            {content[view]}
          </div>
        </div>
      </div>
    </>
  );
}
