import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#0E1A33] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center justify-between text-white">
          <p className="font-serif text-3xl">Elara</p>
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">Care OS</span>
        </div>
        <div className="relative">
          <div className="absolute -left-6 -top-6 w-40 opacity-80">
            <Lottie animationData={pulse} loop />
          </div>
          <div className="relative space-y-6 pl-8">
            {[
              ["Cardiology", "Token 12 · Mehta"],
              ["General Medicine", "Two waiting"],
              ["Lab", "ECG tray · 1"],
            ].map(([a, b]) => (
              <div key={a} className="border-l border-white/20 pl-4">
                <p className="text-sm text-white/50">{a}</p>
                <p className="font-serif text-2xl text-white">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="font-serif text-4xl leading-tight text-white">The floor should feel quiet, even when it is not.</p>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Outpatient, records, lab and pharmacy on one canvas — built the way a duty doctor actually moves through the day.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-4"
        >
          <p className="font-serif text-3xl lg:hidden">Elara</p>
          <h1 className="font-serif text-4xl">Sign in</h1>
          <p className="text-sm text-mute">Staff use campus email. Patients use the address from registration.</p>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button className="w-full">Continue</Button>
          <p className="text-sm text-mute">
            New patient?{" "}
            <Link className="text-brand" to="/register">
              Open a chart
            </Link>
          </p>
          <p className="text-xs text-mute">Demo password: Elara@2026 · try maya.rao@elara.care or arjun.mehta@elara.care</p>
        </motion.form>
      </div>
    </div>
  );
}
