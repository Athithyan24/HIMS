import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { Button, Field } from "../components/ui";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import pulse from "../assets/pulse.json";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("maya.rao@elara.care");
  const [password, setPassword] = useState("Elara@2026");
  const { setSession } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setSession(data.token, data.user);
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not sign in");
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] lg:grid lg:grid-cols-2">
      <motion.aside
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#0b1930] px-10 py-10 text-white lg:flex xl:px-16"
      >
        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-cyan-200">
            <Activity size={23} />
          </span>
          <div>
            <p className="font-serif text-2xl">Elara</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Connected care</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl py-10">
          <div className="absolute -right-6 -top-24 w-48 opacity-50">
            <Lottie animationData={pulse} loop />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-cyan-100">
              <ShieldCheck size={14} /> One secure care workspace
            </p>
            <h1 className="font-serif text-4xl leading-tight xl:text-5xl">
              Cloud-Based Hospital Information Management System <span className="text-cyan-200">(HIMS)</span>
            </h1>
            <p className="mt-3 text-lg text-white/75">with Electronic Health Records</p>
            <p className="mt-6 max-w-md text-sm leading-6 text-white/60">
              Care teams, patient charts, appointments, diagnostics and billing — connected in one calm, secure workspace.
            </p>
          </motion.div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[
              ["Patient-first", "Connected charts"],
              ["Care teams", "One workspace"],
              ["Every visit", "A clearer record"],
            ].map(([title, copy], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
              >
                <p className="text-xs font-medium text-white">{title}</p>
                <p className="mt-1 text-[11px] text-white/50">{copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/40">A more connected view of every patient journey.</p>
      </motion.aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10"
        >
          <div className="mb-8 lg:hidden">
            <p className="font-serif text-2xl">Elara</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-mute">Cloud-Based Hospital Information Management System (HIMS) with Electronic Health Records</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Welcome back</p>
          <h2 className="mt-2 font-serif text-4xl">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-mute">Use your registered email to securely access your care workspace.</p>

          <div className="mt-8 space-y-5">
            <Field label="Email address">
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <Button className="w-full !rounded-2xl !py-3">
              Continue securely <ArrowRight size={16} />
            </Button>
          </div>
          <div className="mt-7 border-t border-slate-100 pt-5">
            <p className="text-sm text-mute">
              New patient?{" "}
              <Link className="font-medium text-brand hover:underline" to="/register">Create your health record</Link>
            </p>
            <p className="mt-4 text-xs leading-5 text-mute">
              Demo access: <span className="font-medium">maya.rao@elara.care</span> · password <span className="font-medium">Elara@2026</span>
            </p>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
