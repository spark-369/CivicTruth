import { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useToast } from "../components/shared/Toast";

function ShieldIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11.5 14.5 16 9.5" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function BadgeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M16 8l-4 4-4-4" />
      <rect x="3" y="12" width="18" height="8" rx="1" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function VisibilityIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function VisibilityOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function XCircleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13 2 4" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 18l-1.5-5.5L5 10l5.5-1.5z" />
    </svg>
  );
}

function PasswordStrengthMeter({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score / 6, 1);
  };

  const score = getStrength(password);
  const percentage = score * 100;
  let label = "Very Weak";
  let barColor = "bg-red-500";
  let bgColor = "bg-red-50 dark:bg-red-500/10";
  let borderColor = "border-red-200 dark:border-red-500/20";
  let textColor = "text-red-600 dark:text-red-400";
  if (percentage >= 80) {
    label = "Very Strong";
    barColor = "bg-emerald-500";
    bgColor = "bg-emerald-50 dark:bg-emerald-500/10";
    borderColor = "border-emerald-200 dark:border-emerald-500/20";
    textColor = "text-emerald-600 dark:text-emerald-400";
  } else if (percentage >= 60) {
    label = "Strong";
    barColor = "bg-emerald-500";
    bgColor = "bg-emerald-50 dark:bg-emerald-500/10";
    borderColor = "border-emerald-200 dark:border-emerald-500/20";
    textColor = "text-emerald-600 dark:text-emerald-400";
  } else if (percentage >= 40) {
    label = "Good";
    barColor = "bg-amber-500";
    bgColor = "bg-amber-50 dark:bg-amber-500/10";
    borderColor = "border-amber-200 dark:border-amber-500/20";
    textColor = "text-amber-600 dark:text-amber-400";
  } else if (percentage >= 20) {
    label = "Fair";
    barColor = "bg-amber-500";
    bgColor = "bg-amber-50 dark:bg-amber-500/10";
    borderColor = "border-amber-200 dark:border-amber-500/20";
    textColor = "text-amber-600 dark:text-amber-400";
  }

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span
          className={`px-2.5 py-1 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider border ${bgColor} ${borderColor} ${textColor}`}
        >
          {label}
        </span>
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">
        {[
          { text: "8+ chars", test: (pwd) => pwd.length >= 8 },
          { text: "Uppercase", test: (pwd) => /[A-Z]/.test(pwd) },
          { text: "Lowercase", test: (pwd) => /[a-z]/.test(pwd) },
          { text: "Number", test: (pwd) => /[0-9]/.test(pwd) },
          { text: "Symbol", test: (pwd) => /[^A-Za-z0-9]/.test(pwd) },
        ].map((req) => {
          const met = req.test(password);
          return (
            <div
              key={req.text}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[0.7rem] font-medium border ${met ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20 text-gray-500 dark:text-gray-400"}`}
            >
              {met ? (
                <CheckCircleIcon className="text-emerald-500" />
              ) : (
                <XCircleIcon className="text-gray-400" />
              )}
              {req.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const steps = [
  { label: "Personal Info", icon: <PersonIcon /> },
  { label: "Identity", icon: <BadgeIcon /> },
  { label: "Security", icon: <LockIcon /> },
];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const step0InputRef = useRef(null);
  const step1InputRef = useRef(null);
  const step2InputRef = useRef(null);

  useEffect(() => {
    const refs = [step0InputRef, step1InputRef, step2InputRef];
    if (refs[activeStep]?.current) refs[activeStep].current.focus();
  }, [activeStep]);

  const isStepInvalid = () => {
    if (activeStep === 0) return !fullName.trim();
    if (activeStep === 1) return !nationalId.trim();
    if (activeStep === 2)
      return (
        !password.trim() ||
        password.length < 8 ||
        password !== confirmPassword ||
        !agreeTerms
      );
    return false;
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setServerError("");
    const errors = {};
    if (activeStep === 0 && !fullName.trim())
      errors.fullName = "Full name is required";
    if (activeStep === 1 && !nationalId.trim())
      errors.nationalId = "National ID is required";
    if (activeStep === 2) {
      if (!password.trim()) errors.password = "Password is required";
      else if (password.length < 8)
        errors.password = "Password must be at least 8 characters";
      else if (password !== confirmPassword)
        errors.confirmPassword = "Passwords do not match";
      if (!agreeTerms)
        errors.terms =
          "You must accept the Terms of Service and Privacy Policy";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    try {
      await authAPI.register({
        full_name: fullName,
        national_id: nationalId,
        password,
        email: email || undefined,
        dob: dob || undefined,
        bio: bio || undefined,
      });
      setSuccess(true);
      toast({
        message: "Participant registered successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : JSON.stringify(detail);
      setServerError(msg);
      toast({ message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none transition-all text-sm";
  const inputError = "border-red-500 focus:border-red-500";
  const labelClass =
    "block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider";
  const hintClass = "text-xs text-gray-400 dark:text-gray-500 mb-2 block";

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 bg-[length:200%_200%] animate-[gradientShift_8s_ease_infinite] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div
        className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] pointer-events-none animate-[float_6s_ease-in-out_infinite]"
        style={{ top: "-40%", right: "-15%" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.15)_0%,transparent_70%)] pointer-events-none animate-[float_8s_ease-in-out_infinite]"
        style={{ bottom: "-30%", left: "-10%" }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="text-center mb-8 animate-[fadeIn_0.6s_ease]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white mb-5 shadow-lg shadow-black/20">
            <ShieldIcon />
          </div>
          <h1
            className="font-bold text-white text-2xl sm:text-3xl mb-2 tracking-tight"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
          >
            Create Account
          </h1>
          <p className="text-white/80 text-sm max-w-md mx-auto leading-relaxed font-light">
            Register to access the CivicTruth immutable blockchain and AI
            verification platform
          </p>
        </div>

        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 p-6 sm:p-8 shadow-2xl shadow-black/20 animate-[slideInUp_0.5s_ease]">
          <div className="w-full mb-8">
            <div className="flex items-start justify-between">
              {steps.map((step, idx) => (
                <div
                  key={step.label}
                  className="flex-1 flex flex-col items-center relative"
                >
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute top-5 left-[50%] right-[-50%] h-1 -translate-y-1/2 z-0 transition-all duration-500 ${
                        idx < activeStep
                          ? "bg-indigo-500"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                      idx < activeStep
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                        : idx === activeStep
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-100 dark:ring-indigo-500/30"
                          : "bg-gray-100 text-gray-400 border-2 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <span className="leading-none flex items-center justify-center">
                      {idx < activeStep ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                  </div>

                  <span
                    className={`mt-2 text-[0.7rem] sm:text-xs font-semibold text-center transition-colors duration-300 ${
                      idx <= activeStep
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {success ? (
            <div className="text-center py-6 animate-[fadeIn_0.5s_ease]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckIcon />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-2">
                Account Created
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your participant account has been registered successfully.
                Redirecting to sign in...
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <SparkleIcon />
                <span>Secured by immutable blockchain</span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-6"
            >
              <div className="transition-all duration-300">
                {activeStep === 0 && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label htmlFor="fullName" className={labelClass}>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <p className={hintClass}>
                        Enter your full legal name as it appears on official
                        documents
                      </p>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <PersonIcon />
                        </div>
                        <input
                          id="fullName"
                          ref={step0InputRef}
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="e.g. John Doe"
                          autoComplete="name"
                          className={`${inputBase} pl-12 placeholder-gray-500 dark:placeholder-gray-400 ${fieldErrors.fullName ? inputError : ""}`}
                        />
                      </div>
                      {fieldErrors.fullName && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <p className={hintClass}>
                        Used for account recovery and notifications
                      </p>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <EmailIcon />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          autoComplete="email"
                          className={`${inputBase} pl-12 placeholder-gray-500 dark:placeholder-gray-400`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label htmlFor="nationalId" className={labelClass}>
                        National ID <span className="text-red-500">*</span>
                      </label>
                      <p className={hintClass}>
                        Your unique identifier stored as a secure cryptographic
                        hash
                      </p>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <BadgeIcon />
                        </div>
                        <input
                          id="nationalId"
                          ref={step1InputRef}
                          type="text"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          required
                          placeholder="Enter your unique national identifier"
                          autoComplete="off"
                          className={`${inputBase} pl-12 placeholder-gray-500 dark:placeholder-gray-400 ${fieldErrors.nationalId ? inputError : ""}`}
                        />
                      </div>
                      {fieldErrors.nationalId && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.nationalId}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="dob" className={labelClass}>
                        Date of Birth
                      </label>
                      <p className={hintClass}>
                        Optional — used for identity verification
                      </p>
                      <input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        autoComplete="bday"
                        className={`${inputBase} text-gray-900 dark:text-gray-100`}
                      />
                    </div>
                    <div>
                      <label htmlFor="bio" className={labelClass}>
                        Bio
                      </label>
                      <p className={hintClass}>
                        Tell us a little about yourself
                      </p>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="Brief description about yourself..."
                        autoComplete="off"
                        className={`${inputBase} resize-none placeholder-gray-500 dark:placeholder-gray-400`}
                      />
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label htmlFor="password" className={labelClass}>
                        Password <span className="text-red-500">*</span>
                      </label>
                      <p className={hintClass}>
                        Create a strong password to secure your account
                      </p>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <LockIcon />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          className={`${inputBase} pl-12 pr-12 placeholder-gray-500 dark:placeholder-gray-400 ${fieldErrors.password ? inputError : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg p-1 transition-colors"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </button>
                      </div>
                      <PasswordStrengthMeter password={password} />
                      {fieldErrors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className={labelClass}>
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <p className={hintClass}>
                        Re-enter your password to confirm
                      </p>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <LockIcon />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          className={`${inputBase} pl-12 pr-12 placeholder-gray-500 dark:placeholder-gray-400 ${confirmPassword.length > 0 && password !== confirmPassword ? "border-red-500 focus:border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg p-1 transition-colors"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </button>
                      </div>
                      {confirmPassword.length > 0 &&
                        password !== confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">
                            Passwords do not match
                          </p>
                        )}
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-indigo-500">
                          <ShieldIcon />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1">
                            Your data is protected
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Your information will be securely hashed using
                            SHA-256 and stored on the immutable blockchain. All
                            data is encrypted and cannot be altered once
                            registered.
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500 mt-0.5 transition-colors"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-indigo-500 font-semibold no-underline hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-indigo-500 font-semibold no-underline hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {fieldErrors.terms && (
                      <p className="text-red-500 text-xs">
                        {fieldErrors.terms}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {serverError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircleIcon />
                  {serverError}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                {activeStep > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                )}
                {activeStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isStepInvalid()}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                  >
                    Next
                    <ArrowRightIcon />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isStepInvalid() || loading}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                    {!loading && <ArrowRightIcon />}
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Already have an account?{" "}
              <RouterLink
                to="/login"
                className="text-indigo-500 font-semibold no-underline hover:underline"
              >
                Sign in
              </RouterLink>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-white/60">
          <a
            href="#"
            className="hover:text-white/90 transition-colors no-underline flex items-center gap-1.5"
          >
            <GlobeIcon /> Terms of Service
          </a>
          <span className="hidden sm:inline text-white/30">|</span>
          <a
            href="#"
            className="hover:text-white/90 transition-colors no-underline flex items-center gap-1.5"
          >
            <ShieldIcon /> Privacy Policy
          </a>
          <span className="hidden sm:inline text-white/30">|</span>
          <a
            href="#"
            className="hover:text-white/90 transition-colors no-underline flex items-center gap-1.5"
          >
            <SparkleIcon /> Powered by Blockchain
          </a>
        </div>
      </div>
    </div>
  );
}
