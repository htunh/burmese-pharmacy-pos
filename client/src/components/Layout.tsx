import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  BookOpen,
  Plus,
  ClipboardCheck,
  TrendingUp,
  History as HistoryIcon,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";

const NavItem = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={clsx(
        "flex flex-col items-center justify-center p-3 rounded-xl transition-all",
        isActive
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-500 hover:bg-white hover:text-blue-600",
      )}
    >
      <Icon size={24} />
      <span className="text-[10px] font-medium mt-1 text-center leading-tight">
        {label}
      </span>
    </Link>
  );
};

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-24 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-6 gap-2 shrink-0 z-20">
        <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-full bg-gray-50 mb-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-[130%] h-[130%] object-cover object-center max-w-none"
          />
        </div>

        <NavItem to="/" icon={ShoppingBag} label="အရောင်း (POS)" />
        <NavItem to="/product/add" icon={Plus} label="အသစ် (New)" />
        <NavItem
          to="/stock/receive"
          icon={ClipboardCheck}
          label="ကုန်လက်ခံ (Stock)"
        />
        <NavItem
          to="/stock/history"
          icon={HistoryIcon}
          label="မှတ်တမ်း (History)"
        />
        <NavItem to="/report/profit" icon={TrendingUp} label="အမြတ် (Profit)" />
        <NavItem to="/ledger" icon={BookOpen} label="စာရင်း (Ledger)" />
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
