
"use client";

import { Bell, Menu,Zap,Bot, ChevronDown,AlertTriangle,CheckCircle2,FileText,Mail, Settings, User, LogOut, HelpCircle, Download, Upload, BarChart3 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
getAgentStatus,
getNotifications,
} from "@/app/lib/api";
  
 
export default function Header({ setIsOpen, isOpen }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [liveAgents, setLiveAgents] = useState([]);
  const [standbyAgents, setStandbyAgents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

const notificationRef = useRef(null);

useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser && storedUser !== "undefined") {
    setUser(JSON.parse(storedUser));
  }
}, []);

  useEffect(() => {
  const loadAgents = async () => {
    try {
      const data = await getAgentStatus();

      const agents = data?.agents || [];

      const live = agents.filter((agent) =>
        agent.agent_id?.startsWith("A")
      );

      const standby = agents.filter((agent) =>
        agent.agent_id?.startsWith("S")
      );

      setLiveAgents(live);
      setStandbyAgents(standby);

    } catch (error) {
      console.error("Agent API Error:", error);
    }
  };

  loadAgents();
}, []);
useEffect(() => {
  const loadNotifications = async () => {
    try {
      const data = await getNotifications();

      setNotifications(data?.notifications || []);

    } catch (error) {
      console.error("Notification API Error:", error);
    }
  };

  loadNotifications();
}, []);
  const [agentsOpen,   setAgentsOpen]   = useState(false);
  const [standbyOpen,  setStandbyOpen]  = useState(false);

  const dropdownRef = useRef(null);
   const agentsRef  = useRef(null);
  const standbyRef = useRef(null);


  useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target)
    ) {
      setProfileOpen(false);
    }

    if (
      agentsRef.current &&
      !agentsRef.current.contains(e.target)
    ) {
      setAgentsOpen(false);
    }

    if (
      standbyRef.current &&
      !standbyRef.current.contains(e.target)
    ) {
      setStandbyOpen(false);
    }

    if (
      notificationRef.current &&
      !notificationRef.current.contains(e.target)
    ) {
      setNotificationOpen(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);
  let title = "Home";

  if (pathname) {
    if (pathname === "/home") title = "Collections Dashboard";
    else if (pathname === "/cases") title = "Cases";
    else if (pathname === "/recoveries") title = "Recoveries";
    else if (pathname === "/vendor") title = "Vendor Deviations ";
    else if (pathname === "/audit") title = "Audit Log";
    // else if (pathname === "/reports") title = "Reports & Analytics";
    // else if (pathname === "/settings") title = "Configuration";
    // else if (pathname === "/users-roles") title = "Users & Roles";
  }

  const headerActions = [
    { label: "Export Audit Log", icon: Download },
    { label: "Upload File", icon: Upload },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 gap-3">
        {/* Left section */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-dgem-blue hover:shadow-md"
            type="button"
            aria-label="Toggle Sidebar"
            title="Toggle Sidebar"
          >
            <Menu size={17} />
          </button>

          <div className="text-[17px] font-semibold tracking-tight text-slate-900">
            {title}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          
          <div className="relative" ref={agentsRef}>
            <button
              type="button"
              onClick={() => { setAgentsOpen((v) => !v); setStandbyOpen(false); }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 hover:shadow-md cursor-pointer"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Agents Live
              <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">
                {liveAgents.length}
              </span>
            </button>

            {/* Live agents dropdown */}
            <div className={`absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl transition-all duration-200 z-50 ${
              agentsOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"
            }`}>
              <div className="border-b border-slate-100 bg-emerald-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Zap size={13} className="text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">Live Agents ({liveAgents.length})</span>
                </div>
              </div>
              {liveAgents.map((agent, index) => (
                <div
                  key={agent.agent_id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                    {index + 1}
                    </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-slate-800">
                      {agent.agent_name}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Agent ID: {agent.agent_id}
                    </p>
                  </div>

                  <span className="relative flex h-2 w-2 mt-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Standby pill + dropdown */}
          <div className="relative" ref={standbyRef}>
            <button
              type="button"
              onClick={() => { setStandbyOpen((v) => !v); setAgentsOpen(false); }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 shadow-sm transition-all hover:bg-amber-100 hover:shadow-md cursor-pointer"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Standby
              <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                {standbyAgents.length}
              </span>
            </button>

            {/* Standby agents dropdown */}
            <div className={`absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-xl transition-all duration-200 z-50 ${
              standbyOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"
            }`}>
              <div className="border-b border-slate-100 bg-amber-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Bot size={13} className="text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wide text-amber-700">Standby Agents ({standbyAgents.length})</span>
                </div>
              </div>
              {standbyAgents.map((agent, index) => (
                <div
                  key={agent.agent_id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                    {index + 1}
                    </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-slate-800">
                      {agent.agent_name}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Agent ID: {agent.agent_id}
                    </p>
                  </div>

                  <span className="h-2 w-2 mt-1.5 rounded-full bg-amber-500" />
                </div>
              ))}
            </div>
          </div>

          {/* <button
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-dgem-blue hover:shadow-md"
            type="button"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute -right-0.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white text-xs bg-red-500 select-none">{notifications.length}</span>
          </button> */}

          <div className="relative" ref={notificationRef}>
  <button
    type="button"
    onClick={() => setNotificationOpen((v) => !v)}
    className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
  >
    <Bell size={16} />

    {notifications.length > 0 && (
      <span className="absolute -right-0.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white">
        {notifications.length}
      </span>
    )}
  </button>

  <div
    className={`absolute right-0 top-full mt-2 w-[380px] overflow-hidden rounded-2xl border border-red-100 bg-white shadow-xl transition-all duration-200 z-50 ${
      notificationOpen
        ? "visible translate-y-0 opacity-100"
        : "invisible -translate-y-2 opacity-0 pointer-events-none"
    }`}
  >
    {/* Header */}
    <div className="border-b border-slate-100 bg-red-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Bell size={13} className="text-red-600" />
        <span className="text-xs font-bold uppercase tracking-wide text-red-700">
          Notifications ({notifications.length})
        </span>
      </div>
    </div>

    {/* Notification List */}
    <div className="max-h-[420px] overflow-y-auto">
      {notifications.map((item, index) => (
        <div
          key={item.notification_id || index}
          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
        >
          {/* Number Circle */}
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700">
            {index + 1}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-slate-800">
              {item.title}
            </p>

            <p className="text-[11px] text-slate-500 mt-1">
              {item.message || item.description}
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              {item.notification_id}
            </p>
          </div>

          {/* Status Dot */}
          <span className="relative flex h-2 w-2 mt-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        </div>
      ))}

      {notifications.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-500">
          No notifications found
        </div>
      )}
    </div>
  </div>
</div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-2 text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
              type="button"
              title="Profile"
            >
              <img
                src="/logo.svg"
                alt="User avatar"
                className="h-7 w-7 rounded-full border border-slate-200 object-cover"
              />
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-[12px] font-semibold text-slate-900">
                  {user?.first_name || "User"}
                </span>
                <span className="text-[10px] text-slate-500">{user?.role || ""}</span>
              </span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>

            <div
              className={`absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-200 ${
                profileOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0 pointer-events-none"
              }`}
            >
              <a
                // href="/profile"
                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-dgem-blue"
              >
                <User size={16} />
                My Profile
              </a>
              {/* <a
                href="/settings"
                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-dgem-blue"
              >
                <Settings size={16} />
                Settings
              </a> */}
              <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-1">
            <img src="/cgI.png" alt="Brand" className="h-[34px]" />
          </div>
        </div>
      </div>
    </header>
  );
}
