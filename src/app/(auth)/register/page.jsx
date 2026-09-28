"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Eye,EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { registerUser } from "@/app/lib/api";
import { toast } from "sonner";
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   function handleSubmit(event) {
//     event.preventDefault();
//     router.push("/home");
//   }
async function handleSubmit(event) {
  event.preventDefault();

  setError("");

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    setLoading(true);

    const data = await registerUser(
      email,
      password,
      confirmPassword
    );

    // alert(data.message || "Registration Successful");
    toast.success("Action completed successfully");
    router.push("/login");
    } catch (err) {
       toast.error(error?.response?.data?.message || "Something went wrong");
       setError(
        err.response?.data?.detail ||
        "Registration Failed"
        );
    } finally {
        setLoading(false);
    }
    }
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-indigo-300 px-6 py-5 text-slate-950">
      <div className="absolute right-8 top-5 flex items-center gap-1">
        <img src="/cgI.png" alt="Brand" className="h-[34px]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-40px)] max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden text-center lg:block">
          <Image src="/LoginImg.png" width={460} height={300} alt="Finance analytics illustration" className="mx-auto object-contain" priority />
          <h1 className="mt-5 text-[36px] font-semibold leading-tight tracking-normal text-black">
            Intelligent Insights.<br />
            <span className="text-indigo-600">Stronger Decisions</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-7 text-black">
            Agentic AI that automates, analyzes and accelerates your finance operations end-to-end
          </p>
        </section>

        <section className="mx-auto w-full max-w-[440px] rounded-2xl bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.2)]">
          <h2 className="text-lg font-semibold text-black">Create account</h2>
          <p className="mt-1 text-sm text-neutral-500">Register for the Finance Analytics Solutions</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-black">Full Name</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Full Name" className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10 text-sm text-neutral-700 outline-none" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-black">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                {/* <input type="email" defaultValue="VigneshwaranD@capgemini.com" className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10 text-sm text-neutral-700 outline-none" /> */}
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10"
                />
              </div>
            </label>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-black">
                Password
                </span>
                
                <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                
                {/* <input
                type={showPassword ? "text" : "password"}
                defaultValue="12345"
                className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10 pr-10 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-blue-500"
                /> */}
                 <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10 pr-10 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-blue-500"

                    />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                {showPassword ? (
                <EyeOff className="h-4 w-4" />
                ) : (
                <Eye className="h-4 w-4" />
                )}
                </button>
                </div>
                </label>
                
                {/* Confirm Password */}
                <label className="block">
                <span className="mb-2 block text-sm font-semibold text-black">
                Confirm Password
                </span>
                
                <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                
                {/* <input
                type={showConfirmPassword ? "text" : "password"}
                defaultValue="12345"
                className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10 pr-10 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-blue-500"
                /> */}
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                    setConfirmPassword(e.target.value)
                    }
                    className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10 pr-10 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                <button
                type="button"
                onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
                ) : (
                <Eye className="h-4 w-4" />
                )}
                </button>
                </div>
                </label>

            {/* <button type="submit" className="h-11 w-full cursor-pointer rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700">
              Register
            </button> */}
            {error && (
                <p className="text-sm text-red-500">
                {error}
                </p>
                )}
            <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-md bg-blue-600 text-white"
                >
                {loading ? "Registering..." : "Register"}
                </button>
          </form>

          <Link href="/login" className="mt-3 block text-center text-sm font-medium text-blue-600">
            Already have an account? Sign in
          </Link>

          <div className="my-5 flex items-center gap-4 text-sm text-neutral-500">
            <span className="h-px flex-1 bg-neutral-300" />
            OR
            <span className="h-px flex-1 bg-neutral-300" />
          </div>

          <button type="button" onClick={() => router.push("/home")} className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700">
            <BarChart3 size={16} />
            Continue with Corporate SSO
          </button>
        </section>
      </div>
    </main>
  );
}
