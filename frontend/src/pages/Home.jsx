import { Link } from "react-router-dom";
import { useSettings } from "../components/shared/SettingsContext";
import { getRoleFromToken } from "../utils/auth";

function ArrowForwardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function AutoAwesomeIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83"/></svg>;
}
function PeopleIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function StorageIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>;
}
function VerifiedUserIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4-8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>;
}
function TrendingUpIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}
function SecurityIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function ChevronRightIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function HowToRegIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
}
function FactCheckIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4-8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>;
}
function NotificationsIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function SettingsIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1 2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function ProfileIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

const STEP_COLORS = {
  indigo: { light: "bg-indigo-100 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  pink: { light: "bg-pink-100 dark:bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
  emerald: { light: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
};

const FEATURE_COLORS = {
  indigo: { light: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  pink: { light: "bg-pink-50 dark:bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
  emerald: { light: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  amber: { light: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  violet: { light: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
  rose: { light: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  cyan: { light: "bg-cyan-50 dark:bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  slate: { light: "bg-slate-50 dark:bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" },
};

const ITEM_COLORS = {
  indigo: { light: "bg-indigo-100 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  pink: { light: "bg-pink-100 dark:bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
  amber: { light: "bg-amber-100 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
};

export default function Home() {
  const { settings, loading: settingsLoading } = useSettings();
  const siteName = settingsLoading ? 'CivicTruth' : (settings['site.name'] || 'CivicTruth');
  const role = getRoleFromToken();

  const features = [
    { to: "/blockchain", icon: <StorageIcon />, title: "Immutable Blockchain", desc: "Immutable blockchain records preserve every participant entry with cryptographic integrity.", color: "from-indigo-500 to-indigo-700", light: FEATURE_COLORS.indigo.light, text: FEATURE_COLORS.indigo.text, roles: ["admin", "participant"] },
    { to: "/verify", icon: <AutoAwesomeIcon />, title: "AI Verification", desc: "Local lightweight model verifies transaction authenticity with real-time analysis.", color: "from-pink-500 to-pink-700", light: FEATURE_COLORS.pink.light, text: FEATURE_COLORS.pink.text, roles: ["admin", "participant"] },
    { to: "/participants", icon: <PeopleIcon />, title: "Participant Registry", desc: "Secure registration with hashed national identity and enterprise-grade encryption.", color: "from-emerald-500 to-emerald-700", light: FEATURE_COLORS.emerald.light, text: FEATURE_COLORS.emerald.text, roles: ["admin"] },
    { to: "/dashboard", icon: <TrendingUpIcon />, title: "Audit Dashboard", desc: "Real-time blockchain validation, transparency metrics, and comprehensive audit trails.", color: "from-amber-500 to-amber-700", light: FEATURE_COLORS.amber.light, text: FEATURE_COLORS.amber.text, roles: ["admin"] },
    { to: "/notifications", icon: <NotificationsIcon />, title: "Notifications", desc: "Stay informed with real-time alerts and system notifications.", color: "from-violet-500 to-violet-700", light: FEATURE_COLORS.violet.light, text: FEATURE_COLORS.violet.text, roles: ["admin", "participant"] },
    { to: "/settings", icon: <SettingsIcon />, title: "Settings", desc: "Manage application configuration, security, and preferences.", color: "from-rose-500 to-rose-700", light: FEATURE_COLORS.rose.light, text: FEATURE_COLORS.rose.text, roles: ["admin"] },
    { to: "/profile", icon: <ProfileIcon />, title: "Profile", desc: "View and manage your personal information and account details.", color: "from-cyan-500 to-cyan-700", light: FEATURE_COLORS.cyan.light, text: FEATURE_COLORS.cyan.text, roles: ["admin", "participant"] },
  ];

  const visibleFeatures = features.filter((f) => !role || f.roles.includes(role));

  return (
    <div className="overflow-hidden">
      <section className="relative py-10 md:py-16 px-4 text-center bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12)_0%,transparent_45%)] bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08)_0%,transparent_45%)] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md mb-5 border border-white/20 shadow-lg">
            <SecurityIcon />
            <span className="font-semibold tracking-widest text-xs uppercase">Blockchain Powered</span>
          </div>
          <h1 className="font-extrabold mb-4 tracking-tight leading-[1.1] text-4xl sm:text-5xl md:text-6xl">
            {siteName}
          </h1>
          <p className="opacity-90 mb-6 font-light max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed">
            Immutable Participant Ledger &amp; AI-Powered Verification Platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/blockchain" className="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Explore Platform
            </Link>
            <Link to="/verify" className="inline-flex items-center justify-center px-8 py-3 bg-white/10 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Verify Document
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-bold text-3xl md:text-4xl mb-4 text-gray-900 dark:text-gray-100">Platform Features</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">Securely manage, verify, and track participant transactions with cutting-edge technology.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleFeatures.map((feature) => (
              <Link key={feature.to} to={feature.to} className="group block p-6 h-full flex flex-col no-underline text-inherit transition-all duration-300 relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: feature.color }} />
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${feature.light} ${feature.text}`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100 text-lg">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 leading-relaxed mb-4">{feature.desc}</p>
                <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  Explore <ArrowForwardIcon className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-bold text-3xl md:text-4xl mb-4 text-gray-900 dark:text-gray-100">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">Getting started with CivicTruth is simple. Follow these three steps to secure your first document.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {[
              { icon: <HowToRegIcon />, title: "Register Identity", desc: "Register with your national ID and personal details. Your identity is secured with SHA-256 hashing.", color: "indigo" },
              { icon: <StorageIcon />, title: "Create Block", desc: "Append transactions to the immutable blockchain. Each block is cryptographically linked.", color: "pink" },
              { icon: <FactCheckIcon />, title: "Verify Authenticity", desc: "Run AI-powered verification against the blockchain. Get instant confidence scores and reports.", color: "emerald" },
            ].map((step, idx) => {
              const colors = STEP_COLORS[step.color] || STEP_COLORS.indigo;
              return (
                <div key={idx} className="text-center p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className={`w-20 h-20 rounded-full ${colors.light} ${colors.text} inline-flex items-center justify-center mb-6 shadow-sm`}>
                    {step.icon}
                  </div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-bold mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-bold text-3xl md:text-4xl mb-4 text-gray-900 dark:text-gray-100">Why CivicTruth?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">Built on blockchain technology with AI-driven verification for maximum trust and transparency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <VerifiedUserIcon />, title: "Blockchain Security", desc: "Every transaction is cryptographically hashed and linked in an immutable blockchain, ensuring data integrity and preventing tampering.", color: "indigo" },
              { icon: <AutoAwesomeIcon />, title: "AI-Powered", desc: "Advanced local AI models perform real-time transaction verification against the blockchain without compromising privacy.", color: "pink" },
              { icon: <SecurityIcon />, title: "Privacy First", desc: "All sensitive data is securely hashed and encrypted, ensuring participant privacy while maintaining full auditability.", color: "amber" },
            ].map((item, i) => {
              const colors = ITEM_COLORS[item.color] || ITEM_COLORS.indigo;
              return (
                <div key={i} className="text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${colors.light} ${colors.text} mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold mb-3 text-gray-900 dark:text-gray-100 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="py-3 px-4 bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-[10px] tracking-tight">{siteName.charAt(0).toUpperCase()}</div>
            <span className="font-semibold text-white text-xs">{siteName}</span>
          </div>
          <p className="text-[11px] text-gray-500">&copy; {new Date().getFullYear()} {siteName}. All rights reserved. Built on distributed ledger technology.</p>
          <div className="flex gap-4 flex-wrap justify-center md:justify-start">
            <span className="text-[11px] text-gray-400">{settings['support.email'] || 'Support'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
