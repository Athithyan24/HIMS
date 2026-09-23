import { motion } from "framer-motion";

export function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}

export function Card({ children, className = "", onClick }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={onClick}
      className={`surface hairline rounded-[20px] p-5 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-brand text-white shadow-apple hover:brightness-110",
    ghost: "bg-transparent text-ink hover:bg-black/5 dark:hover:bg-white/5",
    soft: "bg-brand-soft text-brand",
    danger: "bg-[#EF4444] text-white",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-medium disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Badge({ children, tone = "slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-rose-50 text-rose-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}>{children}</span>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-[16px] bg-slate-200/70 dark:bg-white/10 ${className}`} />;
}

export function Empty({ title, copy, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-line px-6 py-16 text-center">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-mute">{copy}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-mute">{label}</span>
      {children}
    </label>
  );
}
