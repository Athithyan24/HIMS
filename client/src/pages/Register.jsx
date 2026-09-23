import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { Button, Field } from "../components/ui";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", gender: "female" });
  const { setSession } = useAuth();
  const nav = useNavigate();
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <h1 className="font-serif text-4xl">Join Elara</h1>
      <p className="mt-2 text-sm text-mute">We open a medical record the moment you register — no extra paperwork screen.</p>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <Field label="Full name">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </Field>
        <Field label="Password">
          <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Gender">
          <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Button className="w-full">Create record</Button>
      </form>
      <Link to="/login" className="mt-4 text-sm text-brand">
        I already have access
      </Link>
    </div>
  );
}
