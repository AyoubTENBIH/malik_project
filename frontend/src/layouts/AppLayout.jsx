import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/app-shell.css";

export default function AppLayout() {
  return (
    <div className="app-root">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
