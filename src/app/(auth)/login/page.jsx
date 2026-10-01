"use client";
import { useState,useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Eye,EyeOff, LockKeyhole, Mail } from "lucide-react";
import { loginUser } from "@/app/lib/api";
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    localStorage.setItem("isLoggedIn", "true");
    router.replace("/home");
  }, [router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
//   function handleSubmit(event) {
//     event.preventDefault();
//     router.push("/home");
//   }

async function handleSubmit(event) {
  event.preventDefault();

  try {
    setLoading(true);
    setError("");

    const data = await loginUser(email, password);

    // localStorage.setItem("access_token", data.access_token);
    // localStorage.setItem("refresh_token", data.refresh_token);
    //     localStorage.setItem(
    //         "user",
    //         JSON.stringify({
    //             first_name: data.first_name,
    //             role: data.role,
    //             email: data.email,
    //         })
    //         );
    //     router.push("/home");
    localStorage.setItem("isLoggedIn", "true");

localStorage.setItem(
  "user",
  JSON.stringify({
    user_id: data.user_id,
    first_name: data.first_name,
    role: data.role,
    email: data.email,
  })
);

router.replace("/home");
    } catch (err) {
        setError(
        err.response?.data?.detail ||
        "Invalid Email or Password"
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
          <h1 className="mt-2 text-[36px] font-semibold leading-tight tracking-normal text-black">
            Intelligent Insights.<br />
            <span className="text-indigo-600">Stronger Decisions</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-7 text-black">
            Agentic AI that automates, analyzes and accelerates your finance operations end-to-end
          </p>
        </section>

        <section className="mx-auto w-full max-w-[440px] rounded-2xl bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.2)]">
          <h2 className="text-lg font-semibold text-black">Sign in</h2>
          <p className="mt-1 text-sm text-neutral-500">Access the Finance Analytics Solutions</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10 pr-10 text-sm text-neutral-700 outline-none"
                /> */}
               <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl bg-neutral-100 px-4 pl-10 pr-10"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-black">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
                Remember Me
              </label>
              <button type="button" className="font-medium text-blue-600">Forget Password?</button>
            </div>

            {/* <button type="submit" className="h-11 w-full cursor-pointer rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700">
              Sign In
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
                {loading ? "Signing In..." : "Sign In"}
                </button>
          </form>

          <Link href="/register" className="mt-3 block text-center text-sm font-medium text-blue-600">
            Create a new account
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
