import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Cpu, LineChart } from "lucide-react";
import { useDashboardData } from "../context/DashboardDataContext";

const nav = [
  { to: "/", end: true, label: "Vue générale", icon: LayoutDashboard },
  { to: "/capteurs", label: "Capteurs", icon: Cpu },
  { to: "/graphiques", label: "Graphiques", icon: LineChart }
];

export default function Sidebar() {
  const { isOnline } = useDashboardData();

  return (
    <aside className="sidebar" aria-label="Navigation">
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden>
          ⚡
        </div>
        <div className="sidebar__brand-text">
          <div className="sidebar__title">IoT Print</div>
          <div className="sidebar__subtitle">Maintenance prédictive</div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Pages">
        {nav.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}`
            }
          >
            <Icon className="sidebar__link-icon" size={20} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div
          className={`sidebar__live ${isOnline ? "sidebar__live--on" : ""}`}
          title={isOnline ? "Flux Firebase actif" : "En attente"}
        >
          <span className="sidebar__live-dot" aria-hidden />
          {isOnline ? "Live" : "Hors ligne"}
        </div>
        <div className="sidebar__machine-chip">3D · Atelier Ligne 1</div>
      </div>
    </aside>
  );
}
