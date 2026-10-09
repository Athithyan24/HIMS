import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Receipt,
  BarChart3,
  Microscope,
  Pill,
  FileHeart,
  CalendarDays,
  Building2,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth, useUi } from "../store/auth";
import { avatarUrl } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CommandPalette } from "./CommandPalette";
import { useEffect } from "react";

const NAV = {
  admin: [
    { to: "/", icon: LayoutDashboard, label: "Campus" },
    { to: "/patients", icon: FileHeart, label: "Patients" },
    { to: "/staff", icon: Users, label: "People" },
    { to: "/departments", icon: Building2, label: "Floors" },
    { to: "/op", icon: BarChart3, label: "OP pulse" },
    { to: "/billing", icon: Receipt, label: "Ledger" },
  ],
  doctor: [
    { to: "/", icon: LayoutDashboard, label: "Today" },
    { to: "/queue", icon: Stethoscope, label: "Queue" },
    { to: "/appointments", icon: CalendarDays, label: "Diary" },
    { to: "/lab", icon: Microscope, label: "Labs" },
  ],
  nurse: [
    { to: "/", icon: LayoutDashboard, label: "Floor" },
    { to: "/intake", icon: Users, label: "Register" },
    { to: "/queue", icon: Stethoscope, label: "Queue" },
    { to: "/appointments", icon: CalendarDays, label: "Book" },
    { to: "/lab", icon: Microscope, label: "Lab" },
  ],
  pharmacy: [
    { to: "/", icon: LayoutDashboard, label: "Dispense" },
    { to: "/pharmacy", icon: Pill, label: "Counter" },
    { to: "/inventory", icon: FileHeart, label: "Stock" },
  ],
  billing: [
    { to: "/", icon: LayoutDashboard, label: "Front desk" },
    { to: "/billing", icon: Receipt, label: "Invoices" },
  ],
  patient: [
    { to: "/", icon: LayoutDashboard, label: "Home" },
    { to: "/book", icon: CalendarDays, label: "Book" },
    { to: "/records", icon: FileHeart, label: "Chart" },
    { to: "/my-bills", icon: Receipt, label: "Bills" },
  ],
};

export function Shell({ children }) {
  const { user, logout } = useAuth();
  const { toggleDark, dark, setCommand } = useUi();
  const loc = useLocation();
  const crumbs = loc.pathname.split("/").filter(Boolean);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommand(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommand]);

  const { data: notes } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => (await api.get("/notifications")).data.notifications,
  });

  const items = NAV[user.role] || [];

  return (
    <div className="min-h-screen bg-paper dark:bg-[#0b1220]">
      <aside className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-line bg-white/90 px-2 py-2 backdrop-blur md:bottom-auto md:right-auto md:top-0 md:h-screen md:w-[88px] md:flex-col md:items-center md:gap-1 md:border-r md:border-t-0 md:py-5 lg:w-[220px] lg:items-stretch lg:px-3">
        <div className="mb-6 hidden px-2 lg:block">
          <p className="font-serif text-2xl leading-none">Elara</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-mute">Cloud-based HIMS</p>
        </div>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm ${
                isActive ? "bg-brand text-white shadow-apple" : "text-mute hover:bg-black/5 dark:hover:bg-white/5"
              }`
            }
          >
            <item.icon size={18} />
            <span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        ))}
        <button onClick={logout} className="mt-auto hidden items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm text-mute hover:bg-black/5 lg:flex">
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      <div className="md:pl-[88px] lg:pl-[220px]">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-paper/80 px-4 py-3 backdrop-blur dark:bg-[#0b1220]/80">
          <button
            onClick={() => setCommand(true)}
            className="flex flex-1 items-center gap-2 rounded-[16px] border border-line bg-white px-3 py-2 text-sm text-mute shadow-sm dark:bg-[#121a2a]"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search patients, doctors…</span>
            <kbd className="ml-auto hidden rounded-md border border-line px-1.5 text-[10px] sm:inline">⌘K</kbd>
          </button>
          <button onClick={toggleDark} className="rounded-[16px] p-2 hover:bg-black/5">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="relative">
            <Bell size={18} className="text-mute" />
            {notes?.some((n) => !n.read) && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand" />}
          </div>
          <div className="flex items-center gap-2">
            <img src={avatarUrl(user.avatarSeed)} alt="" className="h-9 w-9 rounded-full bg-brand-soft" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-[11px] capitalize text-mute">{user.role}</p>
            </div>
          </div>
        </header>
        <div className="px-4 py-3 text-xs text-mute">
          <span>Elara</span>
          {crumbs.map((c) => (
            <span key={c}>
              <ChevronRight className="mx-1 inline" size={12} />
              {c}
            </span>
          ))}
        </div>
        <main className="px-4 pb-24 md:px-8">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
