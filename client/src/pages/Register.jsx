import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, HeartPulse } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { Button, Field } from "../components/ui";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "female",
    dob: "",
    bloodGroup: "",
  });
  const { setSession } = useAuth();
  const nav = useNavigate();
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", form);
      setSession(data.token, data.user);
      toast.success(`Welcome. Your MRN is ${data.mrn}`);
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not register");
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <motion.aside
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#0b1930] px-10 py-10 text-white lg:flex xl:px-14"
      >
        <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-cyan-200">
            <Activity size={23} />
          </span>
          <div>
            <p className="font-serif text-2xl">Elara</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Connected care</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 max-w-lg"
        >
          <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-200/10 text-cyan-200">
            <HeartPulse size={28} />
          </span>
          <h1 className="font-serif text-4xl leading-tight xl:text-5xl">Your health story, thoughtfully connected.</h1>
          <p className="mt-5 text-sm leading-6 text-white/65">
            Create a secure patient account and keep appointments, prescriptions and electronic health records together.
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Cloud-based HIMS</p>
            <p className="mt-2 font-serif text-xl">Care teams connected around you.</p>
          </div>
        </motion.div>
        <p className="relative z-10 text-xs text-white/40">Electronic health records · Connected care · Elara</p>
      </motion.aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="w-full max-w-xl"
        >
          <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-mute hover:text-brand">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Patient registration</p>
            <h1 className="mt-2 font-serif text-4xl">Create your record</h1>
            <p className="mt-2 text-sm leading-6 text-mute">
              A secure account and electronic health record are created together.
            </p>

            <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </Field>
              <Field label="Email address">
                <input type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </Field>
              <Field label="Password">
                <input type="password" autoComplete="new-password" minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} required />
              </Field>
              <Field label="Phone (optional)">
                <input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="Date of birth (optional)">
                <input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
              </Field>
              <Field label="Gender">
                <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Blood group (optional)">
                <select value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                  <option value="">Not provided</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Button className="w-full !rounded-2xl !py-3">Create patient account <ArrowLeft className="rotate-180" size={16} /></Button>
              </div>
            </form>
            <p className="mt-6 border-t border-slate-100 pt-5 text-sm text-mute">
              Already registered? <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
