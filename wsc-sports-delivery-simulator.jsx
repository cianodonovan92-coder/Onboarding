import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0e17", surface: "#111827", surfaceAlt: "#1a2235",
  border: "#1e293b", borderHover: "#334155",
  accent: "#f97316", accentDim: "#c2410c", accentGlow: "rgba(249,115,22,0.15)",
  green: "#22c55e", greenDim: "#15803d", greenGlow: "rgba(34,197,94,0.12)",
  red: "#ef4444", redDim: "#b91c1c", redGlow: "rgba(239,68,68,0.12)",
  yellow: "#eab308", yellowDim: "#a16207", yellowGlow: "rgba(234,179,8,0.12)",
  blue: "#3b82f6", blueDim: "#1d4ed8", blueGlow: "rgba(59,130,246,0.12)",
  purple: "#a855f7", purpleGlow: "rgba(168,85,247,0.12)",
  textPrimary: "#f1f5f9", textSecondary: "#94a3b8", textMuted: "#64748b",
};
const F = { display: "'DM Sans', sans-serif", mono: "'JetBrains Mono', 'Fira Code', monospace" };

const NBA_TEAMS = [
  { name: "LA Lakers", logo: "🏀", conf: "Western" },
  { name: "Boston Celtics", logo: "☘️", conf: "Eastern" },
  { name: "Golden State Warriors", logo: "⚡", conf: "Western" },
  { name: "Miami Heat", logo: "🔥", conf: "Eastern" },
];
const CONTENT_GOALS = ["TikTok / Reels", "YouTube Highlights", "OTT / Streaming App", "Website Embeds", "Push Notifications"];
const AUDIENCE_TYPES = ["Gen Z (16-24)", "Millennials (25-40)", "Core Fans (Season Ticket)", "International / Growth", "Fantasy Players"];

// Real game: Lakers 124-116 Rockets, March 18 2026 — LeBron 30pts on 13/14 FG, 6 dunks
// Using verified NBA & Lakers official YouTube clips for embeds
const GAME = {
  away: "LA Lakers", home: "Houston Rockets", date: "March 18, 2026",
  awayScore: 124, homeScore: 116,
  plays: [
    { time: "Q1 10:22", type: "3PT", player: "LeBron James", team: "LAL", pts: 3, exc: 88, desc: "Pull-up three from the top — opening salvo", vid: "Jo918IkVRms", vs: 0 },
    { time: "Q1 8:45", type: "3PT", player: "LeBron James", team: "LAL", pts: 3, exc: 85, desc: "Stepback three from the wing — back-to-back", vid: "T-DG1QtT0HI", vs: 0 },
    { time: "Q2 11:30", type: "DUNK", player: "LeBron James", team: "LAL", pts: 2, exc: 97, desc: "MONSTER alley-oop — the building went silent", vid: "v6WtNc_NMic", vs: 0 },
    { time: "Q2 9:15", type: "DUNK", player: "LeBron James", team: "LAL", pts: 2, exc: 98, desc: "Transition tomahawk slam — 41 years old", vid: "mCqU0S1qjoQ", vs: 0 },
    { time: "Q2 7:02", type: "DUNK", player: "LeBron James", team: "LAL", pts: 2, exc: 96, desc: "Third dunk — 8/8 FG at the half", vid: "ASgX9LyNuBU", vs: 0 },
    { time: "Q3 4:18", type: "DUNK", player: "LeBron James", team: "LAL", pts: 2, exc: 94, desc: "Alley-oop from Doncic — tied at 81", vid: "5Zx7peklVLs", vs: 0 },
    { time: "Q3 2:55", type: "3PT", player: "Luka Dončić", team: "LAL", pts: 3, exc: 82, desc: "Stepback three to retake the lead", vid: "spKTwC9WrWU", vs: 0 },
    { time: "Q4 8:42", type: "LAYUP", player: "LeBron James", team: "LAL", pts: 2, exc: 80, desc: "Strong drive — 102-96 Lakers", vid: "VcsqEQQxJew", vs: 0 },
    { time: "Q4 3:15", type: "3PT", player: "Luka Dončić", team: "LAL", pts: 3, exc: 92, desc: "DAGGER three — 120-111 under a minute", vid: "790EvAfAuI8", vs: 0 },
    { time: "Q4 1:32", type: "DUNK", player: "LeBron James", team: "LAL", pts: 2, exc: 95, desc: "Alley-oop to seal it — LeBron 13/14 FG", vid: "Fax2kk6IXPQ", vs: 0 },
  ],
};

const CLIENTS = [
  { id: 1, name: "LA Lakers", sport: "NBA", phase: "Live", health: 97, cpd: 47, eng: "2.4M", dtl: 0, status: "live" },
  { id: 2, name: "FC Barcelona", sport: "La Liga", phase: "QA & Testing", health: 82, cpd: 0, eng: "—", dtl: 8, status: "onboarding" },
  { id: 3, name: "NFL Network", sport: "NFL", phase: "Integration", health: 64, cpd: 0, eng: "—", dtl: 21, status: "at-risk" },
  { id: 4, name: "Cricket Australia", sport: "Cricket", phase: "Scoping", health: 100, cpd: 0, eng: "—", dtl: 45, status: "onboarding" },
];

const ENDPOINTS = [
  { path: "/v1/games", method: "GET", status: "ok", ms: 42, desc: "Live & historical game data" },
  { path: "/v1/games/{id}/events", method: "GET", status: "ok", ms: 38, desc: "Play-by-play events" },
  { path: "/v1/content/highlights", method: "POST", status: "ok", ms: 156, desc: "Generate highlight clips" },
  { path: "/v1/content/distribute", method: "POST", status: "warning", ms: 312, desc: "Push to channels" },
  { path: "/v1/players/{id}/stats", method: "GET", status: "ok", ms: 27, desc: "Player statistics" },
  { path: "/v1/analytics/engagement", method: "GET", status: "error", ms: null, desc: "Engagement metrics" },
  { path: "/v1/webhooks/events", method: "POST", status: "ok", ms: 15, desc: "Real-time webhooks" },
  { path: "/v1/content/tags", method: "GET", status: "ok", ms: 33, desc: "Content metadata" },
];

const FMTS = [
  { key: "16:9", label: "Landscape", icon: "🖥️", ch: "YouTube", w: 56, h: 32, color: C.red },
  { key: "9:16", label: "Vertical", icon: "📱", ch: "TikTok", w: 22, h: 40, color: C.purple },
  { key: "1:1", label: "Square", icon: "📷", ch: "IG Feed", w: 40, h: 40, color: C.blue },
  { key: "4:5", label: "Portrait", icon: "📲", ch: "Stories", w: 32, h: 40, color: C.green },
];

// Utilities
function Badge({ children, color = C.accent, glow }) {
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 20, background: glow || `${color}22`, color, fontSize: 11, fontWeight: 600, fontFamily: F.mono, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{children}</span>;
}
function Bar({ value, max = 100, color = C.accent, h = 6, showPct }) {
  const p = Math.min(100, (value / max) * 100);
  return <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}><div style={{ flex: 1, height: h, borderRadius: h, background: `${color}15`, overflow: "hidden" }}><div style={{ width: `${p}%`, height: "100%", borderRadius: h, background: `linear-gradient(90deg, ${color}cc, ${color})`, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 12px ${color}40` }} /></div>{showPct && <span style={{ fontSize: 11, color: C.textMuted, fontFamily: F.mono, minWidth: 36 }}>{Math.round(p)}%</span>}</div>;
}
function Dot({ s }) {
  const c = s === "ok" || s === "live" ? C.green : s === "warning" || s === "at-risk" ? C.yellow : C.red;
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}80` }} />;
}
function Card({ children, style, onClick, hover }) {
  const [h, setH] = useState(false);
  return <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ background: C.surface, border: `1px solid ${h && hover ? C.borderHover : C.border}`, borderRadius: 12, padding: 20, transition: "all 0.2s", cursor: onClick ? "pointer" : "default", transform: h && hover ? "translateY(-2px)" : "none", ...style }}>{children}</div>;
}
function Hdr({ icon, title, sub }) {
  return <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, fontFamily: F.mono, color: C.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{icon}</div><h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: C.textPrimary, fontFamily: F.display, letterSpacing: -0.5 }}>{title}</h2>{sub && <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{sub}</p>}</div>;
}
function Chip({ label, sel, onClick, sm }) {
  return <button onClick={onClick} style={{ padding: sm ? "4px 10px" : "6px 14px", borderRadius: 20, border: `1px solid ${sel ? C.accent : C.border}`, background: sel ? C.accentGlow : "transparent", color: sel ? C.accent : C.textSecondary, fontSize: sm ? 11 : 12, fontWeight: 500, cursor: "pointer", fontFamily: F.display, transition: "all 0.2s" }}>{label}</button>;
}
function ANum({ v }) {
  const [d, setD] = useState(0); const ref = useRef();
  useEffect(() => { const s = d, diff = v - s, st = Date.now(); const t = () => { const e = Date.now() - st; if (e >= 800) { setD(v); return; } setD(Math.round(s + diff * (1 - Math.pow(1 - e / 800, 3)))); ref.current = requestAnimationFrame(t); }; ref.current = requestAnimationFrame(t); return () => cancelAnimationFrame(ref.current); }, [v]); return <>{d.toLocaleString()}</>;
}

// CONFETTI — canvas particle burst for high-excitement plays
function Confetti({ trigger }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const raf = useRef(null);
  const prevTrigger = useRef(0);

  const spawn = useCallback(() => {
    const cols = [C.accent, C.green, C.blue, C.purple, C.yellow, C.red, "#fff"];
    const p = [];
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      p.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.35,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 4,
        size: 3 + Math.random() * 5,
        color: cols[Math.floor(Math.random() * cols.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
        decay: 0.008 + Math.random() * 0.008,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }
    particles.current = p;
  }, []);

  useEffect(() => {
    if (trigger > prevTrigger.current) {
      spawn();
      prevTrigger.current = trigger;
    }
  }, [trigger, spawn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const loop = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.current.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (alive) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  });

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 9999 }} />;
}

// DISTRIBUTION MAP — SVG world map with animated delivery pulses
const MAP_POINTS = [
  { name: "Los Angeles", x: 18, y: 38, region: "NA" },
  { name: "New York", x: 28, y: 35, region: "NA" },
  { name: "London", x: 47, y: 28, region: "EU" },
  { name: "Tokyo", x: 82, y: 35, region: "APAC" },
  { name: "Sydney", x: 85, y: 68, region: "APAC" },
  { name: "São Paulo", x: 32, y: 62, region: "LATAM" },
  { name: "Dubai", x: 60, y: 40, region: "ME" },
  { name: "Mumbai", x: 67, y: 42, region: "APAC" },
  { name: "Lagos", x: 48, y: 50, region: "AF" },
  { name: "Berlin", x: 50, y: 27, region: "EU" },
  { name: "Seoul", x: 80, y: 34, region: "APAC" },
  { name: "Mexico City", x: 20, y: 46, region: "LATAM" },
];

function DistMap({ active }) {
  const [pulses, setPulses] = useState([]);
  const pulseId = useRef(0);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      const pt = MAP_POINTS[Math.floor(Math.random() * MAP_POINTS.length)];
      const channels = ["YouTube", "TikTok", "IG", "App", "Web"];
      pulseId.current++;
      setPulses(prev => [...prev.slice(-15), { id: pulseId.current, ...pt, ch: channels[Math.floor(Math.random() * channels.length)] }]);
    }, 600);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div style={{ position: "relative", background: `linear-gradient(180deg, #0a0e17 0%, #0f1520 100%)`, borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.mono }}>GLOBAL DISTRIBUTION — LIVE</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["NA", "EU", "APAC", "LATAM"].map(r => <span key={r} style={{ fontSize: 9, fontFamily: F.mono, color: C.textMuted, padding: "2px 6px", borderRadius: 4, background: `${C.accent}15` }}>{r}</span>)}
        </div>
      </div>
      <svg viewBox="0 0 100 75" style={{ width: "100%", height: "auto" }}>
        {/* Grid lines */}
        {[20, 40, 60, 80].map(x => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={75} stroke={C.border} strokeWidth={0.15} />)}
        {[15, 30, 45, 60].map(y => <line key={`h${y}`} x1={0} y1={y} x2={100} y2={y} stroke={C.border} strokeWidth={0.15} />)}
        {/* Static location dots */}
        {MAP_POINTS.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={0.6} fill={C.textMuted} opacity={0.5} />
            <text x={p.x} y={p.y - 1.5} textAnchor="middle" fontSize={1.8} fill={C.textMuted} fontFamily={F.mono} opacity={0.6}>{p.name}</text>
          </g>
        ))}
        {/* Animated pulses */}
        {pulses.map(p => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={0.8} fill={C.green}>
              <animate attributeName="r" from="0.8" to="5" dur="1.5s" fill="freeze" />
              <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" fill="freeze" />
            </circle>
            <circle cx={p.x} cy={p.y} r={0.5} fill={C.green}>
              <animate attributeName="opacity" from="1" to="0" dur="2s" fill="freeze" />
            </circle>
            <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize={1.6} fill={C.green} fontFamily={F.mono} fontWeight="bold">
              {p.ch}
              <animate attributeName="opacity" from="1" to="0" dur="2s" fill="freeze" />
            </text>
          </g>
        ))}
        {/* Connection lines from LA (source) to active pulses */}
        {pulses.slice(-5).map(p => (
          <line key={`l${p.id}`} x1={18} y1={38} x2={p.x} y2={p.y} stroke={C.accent} strokeWidth={0.2} opacity={0.3} strokeDasharray="1,1">
            <animate attributeName="opacity" from="0.4" to="0" dur="2s" fill="freeze" />
          </line>
        ))}
      </svg>
    </div>
  );
}

// LIVE NOTIFICATION FEED — toast stack for delivery events
function NotifFeed({ items }) {
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9998, display: "flex", flexDirection: "column-reverse", gap: 8, maxHeight: "40vh", overflow: "hidden", pointerEvents: "none" }}>
      {items.slice(-6).map((n, i) => (
        <div key={n.id} style={{
          background: "linear-gradient(135deg, #1a2235ee, #111827ee)", backdropFilter: "blur(12px)",
          border: `1px solid ${n.color}44`, borderRadius: 10, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10, minWidth: 280, maxWidth: 340,
          animation: "notifIn 0.4s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 4px 20px ${n.color}20`,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${n.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F.mono, marginTop: 1 }}>{n.sub}</div>
          </div>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.color, boxShadow: `0 0 8px ${n.color}`, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

// INTRO — personal pitch landing
function Intro({ onEnter }) {
  const [vis, setVis] = useState(false);
  const [pillarsVis, setPillarsVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 150); setTimeout(() => setPillarsVis(true), 600); }, []);

  const pillars = [
    { title: "Client Onboarding", desc: "Repeatable, milestone-driven launch framework — from scoping to go-live in under 3 weeks.", icon: "01", color: C.accent },
    { title: "Content Automation", desc: "AI-powered highlight detection, multi-format rendering, and automated distribution at scale.", icon: "02", color: C.blue },
    { title: "Delivery Operations", desc: "Health scoring, risk management, and escalation protocols across the entire client portfolio.", icon: "03", color: C.green },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, overflow: "hidden" }}>
      {/* HERO */}
      <div style={{ position: "relative", minHeight: "85vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1504450758481-7338bbe75005?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center 30%" }} />
        {/* Dark overlay gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,14,23,0.92) 0%, rgba(10,14,23,0.7) 40%, rgba(10,14,23,0.85) 100%)" }} />
        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: "relative", width: "100%", maxWidth: 1100, margin: "0 auto", padding: "60px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          {/* Left — text */}
          <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)", transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 6, background: `${C.accent}18`, border: `1px solid ${C.accent}33`, fontSize: 11, fontFamily: F.mono, color: C.accent, letterSpacing: 1.5, marginBottom: 24 }}>APPLICATION PROJECT</div>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 8px", fontFamily: F.display, letterSpacing: -2 }}>Cian O'Donovan</h1>
            <h2 style={{ fontSize: 26, fontWeight: 600, color: C.textSecondary, lineHeight: 1.3, margin: "0 0 24px", fontFamily: F.display, letterSpacing: -0.5 }}>Client Solutions &<br />Delivery Team Lead</h2>
            <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.75, margin: "0 0 36px", maxWidth: 440 }}>
              An interactive simulator showing how I'd approach client delivery at <span style={{ color: "#fff", fontWeight: 600 }}>WSC Sports</span> — from onboarding through to automated content at scale.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={onEnter} style={{ padding: "14px 36px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.display, letterSpacing: -0.3, boxShadow: `0 4px 24px ${C.accent}40`, transition: "all 0.2s" }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 32px ${C.accent}50`; }} onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 4px 24px ${C.accent}40`; }}>
                Explore the Simulator
              </button>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: F.mono }}>Built with real NBA data</span>
            </div>
          </div>

          {/* Right — stats/credibility block */}
          <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(40px)", transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s" }}>
            <div style={{ background: `${C.surface}cc`, backdropFilter: "blur(16px)", borderRadius: 16, border: `1px solid ${C.border}`, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 10, fontFamily: F.mono, color: C.accent, letterSpacing: 2, marginBottom: 16 }}>WHAT'S INSIDE</div>
              {[
                { label: "Onboarding Flow", desc: "3-step client configuration wizard", num: "01" },
                { label: "AI Content Engine", desc: "Live highlight processing with real game data", num: "02" },
                { label: "Delivery Command Center", desc: "Portfolio tracking, risk management, ROI", num: "03" },
                { label: "Integration Health", desc: "API testing and endpoint validation", num: "04" },
                { label: "My Approach", desc: "Delivery leadership framework and philosophy", num: "05" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 10, fontFamily: F.mono, color: C.accent, fontWeight: 700, marginTop: 2 }}>{item.num}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PILLARS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: pillarsVis ? 1 : 0, transform: pillarsVis ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ fontSize: 10, fontFamily: F.mono, color: C.accent, letterSpacing: 2, marginBottom: 8 }}>CORE CAPABILITIES</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: F.display, letterSpacing: -0.5 }}>Three Pillars of Client Delivery</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {pillars.map((p, i) => (
            <div key={i} style={{ padding: 28, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, opacity: pillarsVis ? 1 : 0, transform: pillarsVis ? "translateY(0)" : "translateY(30px)", transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.12}s`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: `${p.color}22`, fontFamily: F.mono, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 8, fontFamily: F.display }}>{p.title}</div>
              <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div style={{ textAlign: "center", padding: "40px 40px 80px", opacity: pillarsVis ? 1 : 0, transition: "opacity 0.7s ease 0.5s" }}>
        <button onClick={onEnter} style={{ padding: "14px 40px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.display, boxShadow: `0 4px 24px ${C.accent}40`, transition: "all 0.2s" }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}>
          Enter the Simulator
        </button>
        <div style={{ marginTop: 16, fontSize: 11, color: C.textMuted }}>Lakers 124-116 Rockets — March 18, 2026 — Real game data throughout</div>
      </div>
    </div>
  );
}

// NAV
function Nav({ tab, setTab, isX, setIsX }) {
  const tabs = [{ id: "onboard", l: "Onboarding" }, { id: "engine", l: "Content Engine" }, { id: "delivery", l: "Delivery" }, { id: "integration", l: "Integration" }, { id: "approach", l: "My Approach" }];
  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>W</div>
        <div><div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.3, lineHeight: 1.1 }}>WSC Sports</div><div style={{ fontSize: 9, fontFamily: F.mono, color: C.textMuted, letterSpacing: 1 }}>DELIVERY SIMULATOR</div></div>
      </div>
      <div style={{ display: "flex", gap: 2, background: C.bg, borderRadius: 10, padding: 3 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t.id ? C.surfaceAlt : "transparent", color: tab === t.id ? C.textPrimary : C.textMuted, fontSize: 12, fontWeight: 600, fontFamily: F.display, display: "flex", alignItems: "center", gap: 6, borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent", transition: "all 0.2s" }}><span>{t.l}</span></button>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontFamily: F.mono }}>{isX ? "EXEC" : "TECH"}</span>
        <button onClick={() => setIsX(!isX)} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: isX ? C.accent : C.border, position: "relative", transition: "background 0.3s" }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: isX ? 23 : 3, transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} /></button>
      </div>
    </nav>
  );
}

// 1. ONBOARDING — Lakers-focused
function Onboarding({ isX, onDone }) {
  const team = { name: "LA Lakers", logo: "🏀", conf: "Western" };
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [auds, setAuds] = useState([]);
  const [fin, setFin] = useState(false);
  const tog = (a, s, v) => s(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const ok = step === 0 ? goals.length > 0 : auds.length > 0;

  if (fin) return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Hdr icon="Complete" title="Onboarding Complete" sub="Content strategy for the LA Lakers" />
      {isX ? <Card><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, textAlign: "center", marginBottom: 16 }}>{[{ l: "Daily Clips", v: goals.length * 12, c: C.accent }, { l: "Reach", v: `${(auds.length * 1.8).toFixed(1)}M`, c: C.blue }, { l: "Launch", v: "14 days", c: C.green }, { l: "Revenue", v: "+$2.1M/yr", c: C.purple }].map(m => <div key={m.l}><div style={{ fontSize: 28, fontWeight: 800, color: m.c }}>{m.v}</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{m.l}</div></div>)}</div><p style={{ color: C.textSecondary, fontSize: 13, lineHeight: 1.7, margin: 0 }}>For <strong style={{ color: C.textPrimary }}>LA Lakers</strong>: <strong style={{ color: C.accent }}>{goals.length}-channel</strong> strategy → <strong style={{ color: C.green }}>+35%</strong> engagement, <strong style={{ color: C.green }}>60%</strong> faster publish.</p></Card>
      : <Card><div style={{ fontFamily: F.mono, fontSize: 12, color: C.textSecondary, lineHeight: 2 }}><div><span style={{ color: C.green }}>✓</span> Client: <span style={{ color: C.textPrimary }}>LA Lakers</span> | NBA</div><div><span style={{ color: C.green }}>✓</span> Channels: <span style={{ color: C.accent }}>{goals.join(", ")}</span></div><div><span style={{ color: C.green }}>✓</span> Audiences: <span style={{ color: C.blue }}>{auds.join(", ")}</span></div><div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8 }}>{["API Key: Pending", "Webhook: TBD", "CDN: Akamai/Fastly TBC", `Rules: ${goals.length} sets`].map((l, i) => <div key={i}><span style={{ color: C.yellow }}>→</span> {l}</div>)}</div></div></Card>}
      <button onClick={onDone} style={{ marginTop: 16, padding: "12px 28px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 16px ${C.accent}40` }}>Continue to Content Engine →</button>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Hdr icon="Onboarding" title="Onboarding the LA Lakers" sub="Configure content strategy and distribution for the Lakers' WSC Sports integration" />

      {/* Client summary card */}
      <Card style={{ marginBottom: 24, background: "linear-gradient(135deg, #1a1030 0%, #0f1925 100%)", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "#FDB92722", border: "2px solid #FDB92744", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏀</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#FDB927" }}>Los Angeles Lakers</div>
            <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>NBA • Western Conference • 2025-26 Season</div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[{ l: "Games/yr", v: "82" }, { l: "Avg Attendance", v: "18.9K" }, { l: "Social Following", v: "92M" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, fontFamily: F.mono }}>{s.v}</div>
                <div style={{ fontSize: 9, color: C.textMuted }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Steps */}
      <div style={{ display: "flex", marginBottom: 28 }}>{["Content Goals", "Target Audience"].map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}><div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i <= step ? C.accent : C.surfaceAlt, color: i <= step ? "#fff" : C.textMuted, fontSize: 12, fontWeight: 700, fontFamily: F.mono, boxShadow: i === step ? `0 0 12px ${C.accent}60` : "none" }}>{i + 1}</div><span style={{ marginLeft: 8, fontSize: 12, fontWeight: i === step ? 600 : 400, color: i <= step ? C.textPrimary : C.textMuted }}>{s}</span>{i < 1 && <div style={{ flex: 1, height: 1, background: i < step ? C.accent : C.border, margin: "0 12px" }} />}</div>)}</div>

      {step === 0 && <div>
        <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 12 }}>What content formats should WSC generate for the Lakers?</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{CONTENT_GOALS.map(g => <Chip key={g} label={g} sel={goals.includes(g)} onClick={() => tog(goals, setGoals, g)} />)}</div>
      </div>}
      {step === 1 && <div>
        <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 12 }}>Who are the primary audiences for Lakers content?</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{AUDIENCE_TYPES.map(a => <Chip key={a} label={a} sel={auds.includes(a)} onClick={() => tog(auds, setAuds, a)} />)}</div>
      </div>}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ padding: "10px 24px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: step === 0 ? C.textMuted : C.textSecondary, cursor: step === 0 ? "not-allowed" : "pointer", fontSize: 13 }}>Back</button>
        <button onClick={() => step < 1 ? setStep(s => s + 1) : setFin(true)} disabled={!ok} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: ok ? `linear-gradient(135deg, ${C.accent}, ${C.accentDim})` : C.surfaceAlt, color: ok ? "#fff" : C.textMuted, cursor: ok ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600, boxShadow: ok ? `0 4px 16px ${C.accent}40` : "none" }}>{step === 1 ? "Generate Strategy →" : "Next →"}</button>
      </div>
    </div>
  );
}

// 2. CONTENT ENGINE — the star of the show
function Engine({ isX }) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [pipes, setPipes] = useState({});
  const [filter, setFilter] = useState("all");
  const [confettiCount, setConfettiCount] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const notifId = useRef(0);

  const run = () => {
    setProcessing(true); setProcessed([]); setPipes({}); setExpanded(null); setNotifs([]);
    let i = 0;
    const iv = setInterval(() => {
      if (i >= GAME.plays.length) { clearInterval(iv); setProcessing(false); return; }
      const p = GAME.plays[i];
      const clips = [];
      if (p.exc >= 95) clips.push({ n: "Top 10 Play", f: "16:9", ch: "YouTube" }, { n: "Social Clip", f: "9:16", ch: "TikTok" }, { n: "Player Reel", f: "16:9", ch: "App" }, { n: "Push Alert", f: "1:1", ch: "Mobile" });
      else if (p.exc >= 85) clips.push({ n: "Highlight", f: "16:9", ch: "YouTube" }, { n: "Social Clip", f: "9:16", ch: "TikTok" }, { n: "Story", f: "4:5", ch: "IG" });
      else clips.push({ n: "Highlight", f: "16:9", ch: "YouTube" }, { n: "Feed Post", f: "1:1", ch: "IG" });
      if (p.type === "DUNK") clips.push({ n: "Dunk Reel", f: "9:16", ch: "TikTok" });
      const idx = i;
      setProcessed(prev => [...prev, { ...p, clips, idx }]);
      if (p.exc >= 95) setConfettiCount(c => c + 1);
      const addNotif = (icon, title, sub, color) => { notifId.current++; setNotifs(prev => [...prev.slice(-8), { id: notifId.current, icon, title, sub, color }]); };
      setTimeout(() => { setPipes(prev => ({ ...prev, [idx]: 1 })); addNotif("📥", `Ingesting ${p.type}`, `${p.player} • ${p.time}`, C.yellow); }, 200);
      setTimeout(() => { setPipes(prev => ({ ...prev, [idx]: 2 })); addNotif("🤖", "AI Tagging complete", `${p.exc}/100 excitement • ${clips.length} clips`, C.blue); }, 700);
      setTimeout(() => { setPipes(prev => ({ ...prev, [idx]: 3 })); addNotif("🎬", `Rendering ${clips.length} formats`, clips.map(c => c.f).join(", "), C.purple); }, 1200);
      setTimeout(() => { setPipes(prev => ({ ...prev, [idx]: 4 })); addNotif("📡", "Transcoding complete", `${clips.length} variants ready`, C.accent); }, 1700);
      setTimeout(() => { setPipes(prev => ({ ...prev, [idx]: 5 })); addNotif("✅", `Delivered to ${clips.length} channels`, clips.map(c => c.ch).join(", "), C.green); }, 2200);
      i++;
    }, 500);
  };

  const fil = filter === "all" ? processed : filter === "dunks" ? processed.filter(p => p.type === "DUNK") : processed.filter(p => p.exc >= 95);
  const totClips = processed.reduce((s, p) => s + p.clips.length, 0);
  const delivered = Object.values(pipes).filter(v => v >= 5).length;
  const stages = ["Ingest", "AI Tag", "Render", "Transcode", "Distribute"];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Confetti trigger={confettiCount} />
      <NotifFeed items={notifs} />
      <Hdr icon="Content Engine" title="AI Content Generation Engine" sub={`${GAME.away} ${GAME.awayScore} @ ${GAME.home} ${GAME.homeScore} — ${GAME.date}`} />

      <Card style={{ marginBottom: 20, background: "linear-gradient(135deg, #1a1030 0%, #0f1925 100%)", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.mono }}>AWAY</div><div style={{ fontSize: 18, fontWeight: 800, color: "#FDB927" }}>LAL</div><div style={{ fontSize: 32, fontWeight: 800, color: C.textPrimary }}>{GAME.awayScore}</div></div>
            <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600 }}>@</div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.mono }}>HOME</div><div style={{ fontSize: 18, fontWeight: 800, color: "#CE1141" }}>HOU</div><div style={{ fontSize: 32, fontWeight: 800, color: C.textPrimary }}>{GAME.homeScore}</div></div>
          </div>
          {isX ? <div style={{ display: "flex", gap: 24 }}>{[{ l: "Plays", v: processed.length, c: C.accent }, { l: "Clips", v: totClips, c: C.blue }, { l: "Delivered", v: delivered, c: C.green }, { l: "Saved", v: `${processed.length * 8}m`, c: C.purple }].map(m => <div key={m.l} style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: m.c }}>{typeof m.v === "number" ? <ANum v={m.v} /> : m.v}</div><div style={{ fontSize: 10, color: C.textMuted }}>{m.l}</div></div>)}</div>
          : <div style={{ fontFamily: F.mono, fontSize: 11, color: C.textSecondary, maxWidth: 340 }}><div style={{ color: C.accent, marginBottom: 4 }}>ENGINE RULES:</div><div>exc ≥ 95 → Top Play + Social + Reel + Push</div><div>exc ≥ 85 → Highlight + Social + Story</div><div>type == DUNK → +Dunk Reel (9:16)</div><div>default → Highlight + Feed Post</div></div>}
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={run} disabled={processing} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: processing ? C.surfaceAlt : `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`, color: processing ? C.textMuted : "#fff", fontSize: 13, fontWeight: 600, cursor: processing ? "not-allowed" : "pointer" }}>
          {processing ? "⏳ Processing live feed..." : processed.length ? "↻ Re-run Engine" : "▶ Run Content Engine"}
        </button>
        {processed.length > 0 && <><Chip sm label={`All (${processed.length})`} sel={filter === "all"} onClick={() => setFilter("all")} /><Chip sm label="High Impact" sel={filter === "high"} onClick={() => setFilter("high")} /><Chip sm label="Dunks" sel={filter === "dunks"} onClick={() => setFilter("dunks")} /></>}
      </div>

      {processed.length > 0 && <div style={{ marginBottom: 16 }}><Bar value={processed.length} max={GAME.plays.length} color={C.accent} showPct /></div>}

      {processed.length > 0 && <div style={{ marginBottom: 16 }}><DistMap active={processing || delivered > 0} /></div>}

      <div style={{ display: "grid", gap: 10 }}>
        {fil.map(play => {
          const isExp = expanded === play.idx;
          const pipe = pipes[play.idx] || 0;
          const pColors = [C.textMuted, C.yellow, C.yellow, C.blue, C.purple, C.green];
          const pLabels = ["QUEUED", "INGESTING...", "TAGGING...", "RENDERING...", "DISTRIBUTING...", "✓ DELIVERED"];
          return (
            <div key={play.idx} style={{ animation: "fs 0.4s ease-out" }}>
              <div onClick={() => setExpanded(isExp ? null : play.idx)} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto", gap: 12, padding: "14px 16px", background: C.surface, border: `1px solid ${isExp ? C.accent + "66" : C.border}`, borderRadius: isExp ? "12px 12px 0 0" : 12, alignItems: "center", cursor: "pointer" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>{play.time}</div><div style={{ fontSize: 20, fontWeight: 800, color: play.exc >= 95 ? C.accent : play.exc >= 85 ? C.yellow : C.textSecondary }}>{play.exc}</div></div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{play.player}</span><Badge color={play.type === "DUNK" ? C.red : play.type === "3PT" ? C.blue : C.textMuted}>{play.type}</Badge>{play.pts > 0 && <Badge color={C.green}>+{play.pts}</Badge>}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 6 }}>{play.desc}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{play.clips.map((cl, ci) => <Badge key={ci} color={C.green} glow={C.greenGlow}>{cl.n}</Badge>)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, fontFamily: F.mono, color: pColors[pipe], fontWeight: 600 }}>{pLabels[pipe]}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{play.clips.length} clips</div>
                  <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>{isExp ? "▲" : "▼"}</div>
                </div>
              </div>

              {isExp && (
                <div style={{ background: "#0c1018", border: `1px solid ${C.accent}33`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: 20, animation: "fs 0.3s ease-out" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, minHeight: 0 }}>
                    {/* Video + AI Tag Overlay */}
                    <div>
                      <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.mono, marginBottom: 8 }}>SOURCE CLIP + AI DETECTION</div>
                      <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: 8, overflow: "hidden", background: "#000", border: `1px solid ${C.border}` }}>
                        <iframe src={`https://www.youtube.com/embed/${play.vid}?start=${play.vs}&rel=0&modestbranding=1`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={`${play.player} ${play.type}`} />
                        {/* AI Detection Overlay — simulated player tracking */}
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                          {/* Scanning line */}
                          <div style={{ position: "absolute", left: 0, width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${C.green}, transparent)`, animation: "scanLine 2.5s ease-in-out infinite", opacity: 0.6 }} />
                          {/* Player tracking box — moves around to simulate CV tracking */}
                          <div style={{ position: "absolute", width: "30%", height: "55%", border: `1.5px solid ${C.green}aa`, borderRadius: 4, animation: "trackPlayer 4s ease-in-out infinite", boxShadow: `0 0 8px ${C.green}33, inset 0 0 8px ${C.green}11` }}>
                            {/* Corner brackets for tracking look */}
                            <div style={{ position: "absolute", top: -1, left: -1, width: 8, height: 8, borderTop: `2px solid ${C.green}`, borderLeft: `2px solid ${C.green}` }} />
                            <div style={{ position: "absolute", top: -1, right: -1, width: 8, height: 8, borderTop: `2px solid ${C.green}`, borderRight: `2px solid ${C.green}` }} />
                            <div style={{ position: "absolute", bottom: -1, left: -1, width: 8, height: 8, borderBottom: `2px solid ${C.green}`, borderLeft: `2px solid ${C.green}` }} />
                            <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderBottom: `2px solid ${C.green}`, borderRight: `2px solid ${C.green}` }} />
                            {/* ID label follows the box */}
                            <div style={{ position: "absolute", top: -18, left: 0, display: "flex", gap: 4, alignItems: "center" }}>
                              <span style={{ background: `${C.green}dd`, padding: "1px 6px", borderRadius: 3, fontSize: 8, fontFamily: F.mono, color: "#000", fontWeight: 700 }}>ID: {play.player.split(" ")[1]?.toUpperCase() || "PLAYER"} #{play.player === "Luka Dončić" ? "77" : "23"}</span>
                              <span style={{ background: `${C.accent}dd`, padding: "1px 6px", borderRadius: 3, fontSize: 8, fontFamily: F.mono, color: "#000", fontWeight: 700 }}>{play.type}</span>
                            </div>
                            {/* Confidence bar inside box */}
                            <div style={{ position: "absolute", bottom: -14, left: 0, width: "100%", display: "flex", alignItems: "center", gap: 4 }}>
                              <div style={{ flex: 1, height: 3, borderRadius: 2, background: `${C.green}33`, overflow: "hidden" }}><div style={{ width: `${Math.min(99, play.exc + 2)}%`, height: "100%", background: C.green, borderRadius: 2 }} /></div>
                              <span style={{ fontSize: 7, fontFamily: F.mono, color: C.green, fontWeight: 700 }}>{Math.min(99, play.exc + 2)}%</span>
                            </div>
                          </div>
                          {/* Secondary detection — ball tracking */}
                          <div style={{ position: "absolute", width: 12, height: 12, borderRadius: "50%", border: `1px solid ${C.yellow}aa`, animation: "trackBall 3s ease-in-out infinite", boxShadow: `0 0 6px ${C.yellow}44` }}>
                            <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 6, fontFamily: F.mono, color: C.yellow, whiteSpace: "nowrap" }}>BALL</span>
                          </div>
                          {/* Tag chips — bottom bar */}
                          <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", padding: "6px 8px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))", display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                            {[
                              { label: `EXC ${play.exc}/100`, color: play.exc >= 95 ? C.accent : C.yellow, delay: "0s" },
                              { label: play.team, color: "#FDB927", delay: "0.15s" },
                              { label: play.type === "DUNK" ? "HIGH IMPACT" : play.type === "3PT" ? "PERIMETER" : "PAINT", color: C.blue, delay: "0.3s" },
                              { label: play.exc >= 95 ? "CROWD: ROAR" : play.exc >= 85 ? "CROWD: LOUD" : "CROWD: MID", color: C.purple, delay: "0.45s" },
                              { label: "BROADCAST READY", color: C.green, delay: "0.6s" },
                            ].map((tag, ti) => (
                              <span key={ti} style={{ background: `${tag.color}cc`, color: "#000", fontSize: 7, fontFamily: F.mono, fontWeight: 700, padding: "2px 5px", borderRadius: 2, animation: `tagFadeIn 0.4s ease-out ${tag.delay} both` }}>{tag.label}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontFamily: F.mono, fontSize: 10, color: C.textMuted }}>Source: NBA Official • AI Detected at {play.time} • Confidence: {Math.min(99, play.exc + 2)}% • Score: {play.exc}/100</div>
                    </div>
                    {/* Formats */}
                    <div>
                      <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.mono, marginBottom: 8 }}>GENERATED FORMATS ({play.clips.length})</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {play.clips.map((cl, ci) => {
                          const fmt = FMTS.find(f => f.key === cl.f) || FMTS[0];
                          return <div key={ci} style={{ padding: 10, background: C.surfaceAlt, borderRadius: 8, border: `1px solid ${C.border}`, animation: `formatMorph${ci % 4} 0.6s cubic-bezier(0.34,1.56,0.64,1) ${ci * 0.1}s both`, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${fmt.color}, transparent)`, animation: `morphShine 1.5s ease-in-out ${ci * 0.15}s` }} />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 46, marginBottom: 4 }}>
                              <div style={{ width: fmt.w, height: fmt.h, background: `${fmt.color}22`, border: `2px solid ${fmt.color}55`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: `0 0 12px ${fmt.color}30` }}>{fmt.icon}</div>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, textAlign: "center" }}>{cl.n}</div>
                            <div style={{ fontSize: 10, color: fmt.color, textAlign: "center", fontFamily: F.mono }}>{cl.f} → {cl.ch}</div>
                          </div>;
                        })}
                      </div>
                      {/* Pipeline */}
                      <div style={{ marginTop: 12, padding: 10, background: C.bg, borderRadius: 8 }}>
                        <div style={{ fontSize: 10, fontFamily: F.mono, color: C.textMuted, marginBottom: 6 }}>PIPELINE</div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {stages.map((st, si) => {
                            const active = si < pipe;
                            return <div key={si} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <div style={{ width: "100%", height: 4, borderRadius: 2, background: active ? C.green : C.border, transition: "all 0.5s", boxShadow: si === pipe - 1 ? `0 0 8px ${C.green}` : "none" }} />
                              <span style={{ fontSize: 8, color: active ? C.green : C.textMuted, fontFamily: F.mono }}>{st}</span>
                            </div>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes fs { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes notifIn { from { opacity:0; transform:translateX(80px) scale(0.9); } to { opacity:1; transform:translateX(0) scale(1); } }
@keyframes scanLine { 0% { top:0%; opacity:0.6; } 50% { top:92%; opacity:0.2; } 100% { top:0%; opacity:0.6; } }
@keyframes trackPlayer { 0% { top:18%; left:30%; width:28%; height:52%; } 15% { top:15%; left:38%; width:30%; height:55%; } 35% { top:20%; left:22%; width:26%; height:48%; } 55% { top:12%; left:45%; width:32%; height:58%; } 75% { top:22%; left:28%; width:27%; height:50%; } 100% { top:18%; left:30%; width:28%; height:52%; } }
@keyframes trackBall { 0% { top:50%; left:55%; } 20% { top:35%; left:40%; } 40% { top:55%; left:65%; } 60% { top:30%; left:50%; } 80% { top:45%; left:35%; } 100% { top:50%; left:55%; } }
@keyframes tagFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
@keyframes formatMorph0 { from { opacity:0; transform:scale(0.3) rotate(-8deg); } to { opacity:1; transform:scale(1) rotate(0); } }
@keyframes formatMorph1 { from { opacity:0; transform:scale(0.3) rotate(8deg); } to { opacity:1; transform:scale(1) rotate(0); } }
@keyframes formatMorph2 { from { opacity:0; transform:scaleX(0.1); } to { opacity:1; transform:scaleX(1); } }
@keyframes formatMorph3 { from { opacity:0; transform:scaleY(0.1); } to { opacity:1; transform:scaleY(1); } }
@keyframes morphShine { 0% { left:-100%; } 50% { left:100%; } 100% { left:100%; } }`}</style>
    </div>
  );
}

// BEFORE/AFTER — animated timer race showing manual vs WSC
function BeforeAfter() {
  const [running, setRunning] = useState(false);
  const [manualPct, setManualPct] = useState(0);
  const [wscPct, setWscPct] = useState(0);
  const [wscDone, setWscDone] = useState(false);

  const race = () => {
    setRunning(true); setManualPct(0); setWscPct(0); setWscDone(false);
    let m = 0, w = 0;
    const iv = setInterval(() => {
      m = Math.min(100, m + 0.4 + Math.random() * 0.3);
      w = Math.min(100, w + 6 + Math.random() * 4);
      setManualPct(m);
      setWscPct(w);
      if (w >= 100 && !wscDone) setWscDone(true);
      if (m >= 100) { clearInterval(iv); setRunning(false); }
    }, 50);
  };

  const manualSteps = ["Open editing software", "Scrub through footage", "Find highlight moment", "Trim clip boundaries", "Add lower-third graphics", "Export 16:9 version", "Re-edit for 9:16", "Re-edit for 1:1", "Upload to YouTube", "Upload to TikTok", "Upload to Instagram", "Write captions x3", "Schedule posts"];
  const wscSteps = ["AI detects highlight", "Auto-tag & score", "Render all formats", "Distribute everywhere"];
  const manualDone = Math.floor(manualPct / 100 * manualSteps.length);
  const wscStepsDone = Math.floor(wscPct / 100 * wscSteps.length);

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>Manual vs. WSC Engine</div><div style={{ fontSize: 11, color: C.textMuted }}>Same highlight, two workflows</div></div>
        <button onClick={race} disabled={running} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: running ? C.surfaceAlt : `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`, color: running ? C.textMuted : "#fff", fontSize: 12, fontWeight: 600, cursor: running ? "not-allowed" : "pointer" }}>{running ? "Racing..." : "Start Race"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Manual */}
        <div style={{ padding: 14, borderRadius: 10, background: `${C.red}08`, border: `1px solid ${C.red}22` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>Manual Workflow</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.red, fontFamily: F.mono }}>{Math.round(manualPct * 45 / 100)}m / 45m</span>
          </div>
          <Bar value={manualPct} color={C.red} h={8} />
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
            {manualSteps.map((s, i) => (
              <div key={i} style={{ fontSize: 10, fontFamily: F.mono, color: i < manualDone ? C.red : i === manualDone && running ? C.yellow : C.textMuted, transition: "color 0.3s" }}>
                {i < manualDone ? "✓" : i === manualDone && running ? "▶" : "○"} {s}
              </div>
            ))}
          </div>
        </div>
        {/* WSC */}
        <div style={{ padding: 14, borderRadius: 10, background: `${C.green}08`, border: `1px solid ${C.green}22` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>WSC Engine</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.green, fontFamily: F.mono }}>{wscPct >= 100 ? "12s" : `${Math.round(wscPct * 12 / 100)}s`} / 12s</span>
          </div>
          <Bar value={wscPct} color={C.green} h={8} />
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
            {wscSteps.map((s, i) => (
              <div key={i} style={{ fontSize: 10, fontFamily: F.mono, color: i < wscStepsDone ? C.green : i === wscStepsDone && running ? C.yellow : C.textMuted, transition: "color 0.3s" }}>
                {i < wscStepsDone ? "✓" : i === wscStepsDone && running ? "▶" : "○"} {s}
              </div>
            ))}
          </div>
          {wscPct >= 100 && <div style={{ marginTop: 12, padding: 8, borderRadius: 6, background: `${C.green}15`, textAlign: "center", fontSize: 11, fontWeight: 700, color: C.green, animation: "fs 0.4s ease-out" }}>DELIVERED — {manualPct < 100 ? `${Math.round(45 - manualPct * 45 / 100)}m ahead of manual` : "225x faster"}</div>}
        </div>
      </div>
    </Card>
  );
}

// ROI CALCULATOR — interactive sliders with animated outputs
function ROICalc() {
  const [games, setGames] = useState(4);
  const [platforms, setPlatforms] = useState(3);
  const [editors, setEditors] = useState(3);

  const clipsPerGame = platforms * 12;
  const totalClips = games * clipsPerGame;
  const manualHrs = games * platforms * 1.5 * editors * 0.3;
  const wscHrs = games * 0.5;
  const savedHrs = Math.max(0, manualHrs - wscHrs);
  const savedCost = Math.round(savedHrs * 65);
  const reachMultiplier = platforms * 0.8;
  const addedRevenue = Math.round(totalClips * 280);

  const Slider = ({ label, value, onChange, min, max, unit }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: C.textSecondary }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: F.mono }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: C.accent, height: 6, cursor: "pointer" }} />
    </div>
  );

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>ROI Calculator</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 16 }}>Drag the sliders to model your content operation</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <Slider label="Games per week" value={games} onChange={setGames} min={1} max={15} unit="/wk" />
          <Slider label="Distribution platforms" value={platforms} onChange={setPlatforms} min={1} max={8} unit="" />
          <Slider label="Current editorial staff" value={editors} onChange={setEditors} min={1} max={10} unit="" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { l: "Weekly Clips", v: totalClips.toLocaleString(), c: C.accent, sub: `${clipsPerGame}/game` },
            { l: "Hours Saved/wk", v: Math.round(savedHrs), c: C.green, sub: `${Math.round(manualHrs)}h → ${Math.round(wscHrs)}h` },
            { l: "Cost Saved/mo", v: `$${(savedCost * 4).toLocaleString()}`, c: C.blue, sub: `@ $65/hr avg` },
            { l: "Added Revenue/yr", v: `$${(addedRevenue * 52).toLocaleString()}`, c: C.purple, sub: `${reachMultiplier.toFixed(1)}x reach` },
          ].map(m => (
            <div key={m.l} style={{ padding: 12, borderRadius: 8, background: `${m.c}08`, border: `1px solid ${m.c}22`, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.c, fontFamily: F.mono }}>{m.v}</div>
              <div style={{ fontSize: 10, color: C.textPrimary, fontWeight: 600, marginTop: 2 }}>{m.l}</div>
              <div style={{ fontSize: 9, color: C.textMuted, fontFamily: F.mono, marginTop: 2 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// 3. DELIVERY
function Delivery({ isX }) {
  const [sel, setSel] = useState(null);
  const ms = [{ n: "Scoping", p: 100, s: "done" }, { n: "API Setup", p: 100, s: "done" }, { n: "Data Ingestion", p: 100, s: "done" }, { n: "Content Rules", p: 85, s: "active" }, { n: "QA", p: 30, s: "active" }, { n: "Soft Launch", p: 0, s: "pending" }, { n: "Go-Live", p: 0, s: "pending" }];
  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Hdr icon="Delivery" title="Delivery Command Center" sub="End-to-end client delivery tracking" />
      <BeforeAfter />
      <ROICalc />
      {isX && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>{[{ l: "Active", v: "4", c: C.accent }, { l: "On Track", v: "3", c: C.green }, { l: "At Risk", v: "1", c: C.red }, { l: "Avg Launch", v: "18d", c: C.blue }].map(m => <Card key={m.l} style={{ textAlign: "center", padding: 16 }}><div style={{ fontSize: 32, fontWeight: 800, color: m.c }}>{m.v}</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{m.l}</div></Card>)}</div>}
      <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        {CLIENTS.map(cl => (
          <Card key={cl.id} hover onClick={() => setSel(sel?.id === cl.id ? null : cl)} style={{ border: `1px solid ${sel?.id === cl.id ? C.accent : C.border}`, padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 16, alignItems: "center" }}>
              <div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Dot s={cl.status} /><span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{cl.name}</span><Badge color={cl.status === "live" ? C.green : cl.status === "at-risk" ? C.red : C.yellow}>{cl.phase}</Badge></div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, marginLeft: 16 }}>{cl.sport}</div></div>
              {isX ? <><div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{cl.cpd || "—"}</div><div style={{ fontSize: 10, color: C.textMuted }}>clips/day</div></div><div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{cl.eng}</div><div style={{ fontSize: 10, color: C.textMuted }}>engagement</div></div></> : <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: cl.health >= 80 ? C.green : cl.health >= 60 ? C.yellow : C.red }}>{cl.health}%</div><div style={{ fontSize: 10, color: C.textMuted }}>health</div></div>}
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: cl.dtl === 0 ? C.green : C.textPrimary }}>{cl.dtl === 0 ? "LIVE" : `${cl.dtl}d`}</div><div style={{ fontSize: 10, color: C.textMuted }}>to launch</div></div>
            </div>
          </Card>
        ))}
      </div>
      {sel && <Card style={{ animation: "fs 0.3s ease-out" }}><div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 16 }}>{sel.name} — Detail</div>
        {isX ? <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7, margin: 0 }}>{sel.status === "live" ? `Producing ${sel.cpd} clips/day, ${sel.eng} monthly engagement. +35% content, -60% publish time.` : sel.status === "at-risk" ? "At risk: missing event tagging schema. Escalation Thu 3PM ET. ~1 week delay." : `On track — ${sel.phase}, ${sel.dtl} days to go-live.`}</p>
        : <div style={{ display: "grid", gap: 10 }}>{ms.map((m, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 50px", gap: 12, alignItems: "center" }}><span style={{ fontSize: 12, color: m.s === "done" ? C.green : m.s === "active" ? C.accent : C.textMuted, fontFamily: F.mono }}>{m.s === "done" ? "✓" : m.s === "active" ? "▶" : "○"} {m.n}</span><Bar value={m.p} color={m.s === "done" ? C.green : m.s === "active" ? C.accent : C.border} h={4} /><span style={{ fontSize: 11, color: C.textMuted, fontFamily: F.mono, textAlign: "right" }}>{m.p}%</span></div>)}
          {sel.status === "at-risk" && <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: C.redGlow, border: `1px solid ${C.redDim}` }}><div style={{ fontSize: 12, fontWeight: 600, color: C.red, marginBottom: 4 }}>⚠ Blocker</div><div style={{ fontSize: 12, color: C.textSecondary }}>Missing event schema. /v1/events → 422. Fields event_type, player_id unmapped.</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontFamily: F.mono }}>ESCALATION: CTO call Thu 3PM ET</div></div>}
        </div>}
      </Card>}
      <style>{`@keyframes fs { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// 4. INTEGRATION
function Integ({ isX }) {
  const [running, setRunning] = useState(false);
  const [res, setRes] = useState([]);
  const [exp, setExp] = useState(null);
  const run = () => { setRunning(true); setRes([]); setExp(null); let i = 0; const iv = setInterval(() => { if (i >= ENDPOINTS.length) { clearInterval(iv); setRunning(false); return; } setRes(p => [...p, ENDPOINTS[i]]); i++; }, 350); };
  const ok = res.filter(r => r.status === "ok").length, w = res.filter(r => r.status === "warning").length, e = res.filter(r => r.status === "error").length;
  const samples = {
    "/v1/games": `{\n  "games": [{\n    "id": "nba_2026_lal_hou_0318",\n    "away": "LAL", "home": "HOU",\n    "score": { "away": 124, "home": 116 },\n    "status": "final"\n  }]\n}`,
    "/v1/games/{id}/events": `{\n  "events": [{\n    "type": "DUNK",\n    "player_id": "lbj_23",\n    "time": "Q2 11:30",\n    "excitement": 97,\n    "tags": ["alley-oop", "highlight"]\n  }]\n}`,
    "/v1/content/highlights": `{\n  "job_id": "hl_8a3f2b",\n  "clips_queued": 4,\n  "formats": ["16:9","9:16","1:1"],\n  "eta_seconds": 12\n}`,
    "/v1/content/distribute": `{\n  "status": "partial",\n  "channels": {\n    "tiktok": "queued",\n    "youtube": "delivered",\n    "app": "error: CDN timeout"\n  }\n}`,
    "/v1/analytics/engagement": `{\n  "error": "503 Service Unavailable",\n  "message": "Pipeline backfill. ETA: 45m"\n}`,
  };
  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Hdr icon="Integration" title="Integration Health Simulator" sub="Test API endpoints and validate data flow" />
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={run} disabled={running} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: running ? C.surfaceAlt : `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`, color: running ? C.textMuted : "#fff", fontSize: 13, fontWeight: 600, cursor: running ? "not-allowed" : "pointer" }}>{running ? "Testing..." : res.length ? "Re-run" : "▶ Run Tests"}</button>
        {res.length > 0 && <div style={{ display: "flex", gap: 12, fontSize: 12, fontFamily: F.mono }}><span style={{ color: C.green }}>✓ {ok}</span><span style={{ color: C.yellow }}>⚠ {w}</span><span style={{ color: C.red }}>✗ {e}</span></div>}
      </div>
      {isX && res.length > 0 && <Card style={{ marginBottom: 20 }}><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, textAlign: "center" }}><div><div style={{ fontSize: 32, fontWeight: 800, color: ok === ENDPOINTS.length ? C.green : C.yellow }}>{Math.round((ok / ENDPOINTS.length) * 100)}%</div><div style={{ fontSize: 11, color: C.textMuted }}>Healthy</div></div><div><div style={{ fontSize: 32, fontWeight: 800, color: C.blue }}>{res.filter(r => r.ms).reduce((s, r) => s + r.ms, 0)}ms</div><div style={{ fontSize: 11, color: C.textMuted }}>Total Latency</div></div><div><div style={{ fontSize: 32, fontWeight: 800, color: e > 0 ? C.red : C.green }}>{e}</div><div style={{ fontSize: 11, color: C.textMuted }}>Critical</div></div></div>{e > 0 && <div style={{ marginTop: 12, padding: 10, background: C.redGlow, borderRadius: 8, fontSize: 12, color: C.textSecondary }}><strong style={{ color: C.red }}>Action:</strong> Analytics down. Escalate to Platform Eng.</div>}</Card>}
      <div style={{ display: "grid", gap: 6 }}>
        {res.map((ep, i) => (
          <div key={i} style={{ animation: "fs 0.3s ease-out" }}>
            <div onClick={() => setExp(exp === i ? null : i)} style={{ display: "grid", gridTemplateColumns: "auto 60px 1fr auto auto", gap: 12, padding: "10px 16px", background: C.surface, border: `1px solid ${exp === i ? C.borderHover : C.border}`, borderRadius: exp === i ? "10px 10px 0 0" : 10, alignItems: "center", cursor: "pointer" }}>
              <Dot s={ep.status} /><Badge color={ep.method === "GET" ? C.blue : C.green}>{ep.method}</Badge><span style={{ fontSize: 13, fontFamily: F.mono, color: C.textPrimary }}>{ep.path}</span><span style={{ fontSize: 11, color: C.textMuted }}>{ep.desc}</span>{ep.ms ? <span style={{ fontSize: 11, fontFamily: F.mono, color: ep.ms > 200 ? C.yellow : C.green }}>{ep.ms}ms</span> : <span style={{ fontSize: 11, fontFamily: F.mono, color: C.red }}>TIMEOUT</span>}
            </div>
            {exp === i && !isX && <div style={{ padding: 16, background: "#0d1117", border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 10px 10px" }}>
              <pre style={{ margin: 0, padding: 12, background: C.bg, borderRadius: 6, fontSize: 11, fontFamily: F.mono, color: C.textSecondary, overflow: "auto", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{samples[ep.path] || `{ "status": "ok" }`}</pre>
              {ep.status === "warning" && <div style={{ marginTop: 8, fontSize: 11, color: C.yellow, fontFamily: F.mono }}>⚠ Exceeds 300ms SLA. Optimize CDN.</div>}
              {ep.status === "error" && <div style={{ marginTop: 8, fontSize: 11, color: C.red, fontFamily: F.mono }}>✗ 503 — Pipeline backfill. Notify client.</div>}
            </div>}
          </div>
        ))}
      </div>
      <style>{`@keyframes fs { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// APP
// MY APPROACH — delivery leadership framing
function Approach() {
  const pillars = [
    { title: "Structured Onboarding", desc: "Every client gets a repeatable, milestone-driven onboarding — scoping, integration, content rules, QA, soft launch, go-live. No ambiguity on what happens next.", color: C.accent },
    { title: "Proactive Risk Management", desc: "Health scores, blocker tracking, and escalation protocols before things go sideways. The at-risk client scenario in the Delivery tab is modeled on real delivery risk patterns I've seen.", color: C.red },
    { title: "Technical Fluency", desc: "I can sit in an API integration call, debug a webhook payload, and then walk into a QBR with the same client's VP of Digital. The tech/exec toggle in this demo reflects how I think about communication.", color: C.blue },
    { title: "Measurable Outcomes", desc: "Every client engagement ties back to content volume, time-to-publish, engagement lift, and revenue impact. The ROI calculator isn't hypothetical — it's the conversation I'd have in every kickoff.", color: C.green },
    { title: "Scalable Playbooks", desc: "What works for one client becomes a template for the next. Content rules, distribution configs, and QA checklists should compound across the portfolio, not restart from scratch.", color: C.purple },
    { title: "Cross-Functional Ownership", desc: "Delivery isn't just project management. It's product feedback loops, engineering coordination, and client success — all in one seat. That's what this role requires and what I'm built for.", color: C.yellow },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontFamily: F.mono, color: C.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>My Approach</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.textPrimary, margin: "0 0 8px", fontFamily: F.display, letterSpacing: -0.5 }}>How I'd Lead Client Delivery</h2>
        <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.7, margin: 0, maxWidth: 600 }}>
          Everything in this simulator reflects how I think about the role — from onboarding structure to delivery ops to technical depth. Here's the framework behind it.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {pillars.map((p, i) => (
          <div key={i} style={{ padding: 20, borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.color}`, transition: "border-color 0.2s" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.65 }}>{p.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, padding: 20, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}08, ${C.purple}08)`, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}>
          <span style={{ fontWeight: 700, color: C.textPrimary }}>Why this demo exists:</span> I don't think a CV tells you how someone thinks about delivery. This simulator is my answer to "show, don't tell" — it's built with real game data, real platform logic, and the same operational mindset I'd bring to WSC Sports on day one.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("onboard");
  const [isX, setIsX] = useState(false);

  if (!started) return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textPrimary, fontFamily: F.display }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Intro onEnter={() => setStarted(true)} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textPrimary, fontFamily: F.display }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Nav tab={tab} setTab={setTab} isX={isX} setIsX={setIsX} />
      {tab === "onboard" && <Onboarding isX={isX} onDone={() => setTab("engine")} />}
      {tab === "engine" && <Engine isX={isX} />}
      {tab === "delivery" && <Delivery isX={isX} />}
      {tab === "integration" && <Integ isX={isX} />}
      {tab === "approach" && <Approach />}
    </div>
  );
}
