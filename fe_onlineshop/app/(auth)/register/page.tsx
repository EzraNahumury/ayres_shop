"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FloatingInput } from "@/components/ui/floating-input";
import { Eye, EyeOff, ChevronLeft, Mail } from "lucide-react";
import { GoogleButton } from "@/components/shop/google-button";

type Step = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function validateForm(): boolean {
    const errs: Record<string, string | null> = {};
    if (!name.trim()) errs.name = "Nama wajib diisi";
    if (!email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Format email tidak valid";
    const phoneClean = phone.replace(/\s|-/g, "");
    if (!phoneClean) errs.phone = "No. HP wajib diisi";
    else if (!/^(\+62|62|0)8\d{7,13}$/.test(phoneClean))
      errs.phone = "Format tidak valid (contoh: 08xxxxxxxxxx)";
    if (!password) errs.password = "Password wajib diisi";
    else if (password.length < 6) errs.password = "Minimal 6 karakter";
    if (password !== confirmPassword)
      errs.confirmPassword = "Password tidak cocok";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal");
        return;
      }
      setStep("otp");
      setInfo(`Kode OTP dikirim ke ${email}`);
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function setOtpDigit(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 0) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    const focusIdx = Math.min(text.length, 5);
    otpRefs.current[focusIdx]?.focus();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Kode OTP harus 6 digit");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verifikasi gagal");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setResending(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengirim ulang");
        return;
      }
      setInfo("Kode OTP baru sudah dikirim.");
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  }

  function backToForm() {
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setInfo("");
  }

  const PrimaryButton = ({
    type = "submit",
    children,
    onClick,
  }: {
    type?: "submit" | "button";
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="relative w-full h-12 rounded-2xl bg-gradient-to-b from-neutral-800 to-black text-white text-sm font-medium shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.4)] hover:from-black hover:to-black transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );

  return (
    <div className="w-full max-w-md animate-auth-card">
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-white/80 p-8 sm:p-10">
        {step === "form" && (
          <div key="form" className="animate-auth-card">
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl sm:text-[2rem] font-medium text-black tracking-tight">
                Buat Akun
              </h1>
              <p className="text-sm text-neutral-500 mt-2">
                Bergabung dengan AYRES untuk akses eksklusif & checkout cepat
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 animate-auth-stagger">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-2xl flex items-start gap-2 animate-auth-card">
                  <span className="block flex-shrink-0 w-1 h-1 rounded-full bg-red-500 mt-1.5" />
                  <span>{error}</span>
                </div>
              )}

              <FloatingInput
                id="name"
                label="Nama Lengkap"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors.name}
                autoComplete="name"
                required
              />

              <FloatingInput
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                autoComplete="email"
                required
              />

              <FloatingInput
                id="phone"
                label="No. HP"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={fieldErrors.phone}
                autoComplete="tel"
                required
              />

              <FloatingInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                autoComplete="new-password"
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <FloatingInput
                id="confirmPassword"
                label="Konfirmasi Password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword}
                autoComplete="new-password"
                required
              />

              <div className="pt-2">
                <PrimaryButton>{loading ? "Mengirim kode…" : "Buat Akun"}</PrimaryButton>
              </div>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
                Atau
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <GoogleButton label="Daftar dengan Google" />

            <p className="mt-8 text-center text-sm text-neutral-500">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-black hover:underline underline-offset-4"
              >
                Masuk
              </Link>
            </p>
          </div>
        )}

        {step === "otp" && (
          <div key="otp" className="animate-auth-card">
            <button
              type="button"
              onClick={backToForm}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-black mb-4 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Kembali
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center shadow-inner">
                <Mail className="h-7 w-7 text-neutral-700" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-medium text-black tracking-tight mb-2">
                Verifikasi Email
              </h1>
              <p className="text-sm text-neutral-500">Kami mengirim kode 6 digit ke</p>
              <p className="text-sm font-semibold text-black mt-1">{email}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-2xl animate-auth-card">
                  {error}
                </div>
              )}
              {info && !error && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-2xl animate-auth-card">
                  {info}
                </div>
              )}

              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={d}
                    onChange={(e) => setOtpDigit(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-semibold bg-white/70 border-2 border-neutral-200 rounded-2xl focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 tabular-nums transition-all hover:border-neutral-300"
                  />
                ))}
              </div>

              <PrimaryButton>Verifikasi & Masuk</PrimaryButton>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-500">
              Tidak menerima kode?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="font-semibold text-black hover:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              >
                {resendCooldown > 0
                  ? `Kirim ulang (${resendCooldown}s)`
                  : resending
                    ? "Mengirim…"
                    : "Kirim ulang"}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400 px-8 leading-relaxed">
        Dengan mendaftar, Anda menyetujui{" "}
        <Link href="/terms" className="text-neutral-600 hover:text-black underline">
          Syarat & Ketentuan
        </Link>{" "}
        dan{" "}
        <Link href="/privacy" className="text-neutral-600 hover:text-black underline">
          Kebijakan Privasi
        </Link>{" "}
        AYRES.
      </p>
    </div>
  );
}
