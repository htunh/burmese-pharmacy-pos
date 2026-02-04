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
      <span className="text-xs font-medium mt-1">{label}</span>
    </Link>
  );
};

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-6 gap-4 shrink-0 z-20">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-4 shadow-md">
          Rx
        </div>

        <NavItem to="/" icon={ShoppingBag} label="POS" />
        <NavItem to="/product/add" icon={Plus} label="New" />
        <NavItem to="/stock/receive" icon={ClipboardCheck} label="Stock" />
        <NavItem to="/stock/history" icon={HistoryIcon} label="History" />
        <NavItem to="/report/profit" icon={TrendingUp} label="Profit" />
        <NavItem to="/ledger" icon={BookOpen} label="Ledger" />
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
