"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Gift,
  DollarSign,
  Users,
  Clock3,

} from "lucide-react";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "/home", icon: Home },
  { name: "Collector WorkBench ", href: "/cases", icon: Gift },
  { name: "Promise to pay", href: "/recoveries", icon: DollarSign },
  { name: "Account 360", href: "/vendor", icon: Users },
  // { name: "Audit Trail", href: "/audit", icon: Clock3 },
  // { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  // { name: "Audit & Compliance", href: "/audit", icon: ShieldCheck },
  // { name: "Configuration", href: "/settings", icon: Settings },
  // { name: "Users & Roles", href: "/users-roles", icon: Users },
];

export default function Navbar({ isSidebarOpen }) {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const pathname = usePathname();

  const itemKey = (item, parentKey = "") => `${parentKey}/${item.href ?? item.name}`;

  const toggle = (key) => {
    setOpenDropdowns((s) => ({ ...s, [key]: !s[key] }));
  };

  const isActive = (href) =>
    !!href && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav className="flex w-full flex-col gap-1 text-sm font-medium">
      {navItems.map((item) => (
        <MenuNode
          key={itemKey(item)}
          item={item}
          parentKey=""
          itemKeyFn={itemKey}
          isActive={isActive}
          openDropdowns={openDropdowns}
          toggle={toggle}
          pathname={pathname}
          isSidebarOpen={isSidebarOpen}
        />
      ))}
    </nav>
  );
}

function MenuNode({
  item,
  parentKey,
  itemKeyFn,
  openDropdowns,
  toggle,
  pathname,
  isSidebarOpen,
}) {
  const key = itemKeyFn(item, parentKey);
  const Icon = item.icon;
  const hasChildren = !!(item.subItems && item.subItems.length > 0);
  const open = !!openDropdowns[key];

  const active =
    !!item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`));

  const textVisibilityClass = `transition-all duration-200 whitespace-nowrap ${
    isSidebarOpen
      ? "opacity-100 visible"
      : "lg:opacity-0 lg:invisible lg:group-hover:opacity-100 lg:group-hover:visible"
  }`;

  const baseItemClass =
    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200";

  const activeClass =
    "bg-white text-dgem-dark-blue shadow-sm ring-1 ring-white/20";

  const inactiveClass =
    "text-white/75 hover:bg-white/10 hover:text-white";

  const disabledClass =
    "text-white/40 cursor-not-allowed pointer-events-none opacity-70";

  if (hasChildren) {
    return (
      <div className="w-full">
        <button
          type="button"
          className={`${baseItemClass} justify-between ${
            active ? activeClass : inactiveClass
          } ${item.inactive ? disabledClass : ""}`}
          onClick={() => !item.inactive && toggle(key)}
          disabled={item.inactive}
          aria-expanded={open}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Icon
              className={`h-5 w-5 shrink-0 ${
                active
                  ? "text-dgem-dark-blue"
                  : "text-white/70 group-hover:text-white"
              }`}
            />
            <span className={textVisibilityClass}>{item.name}</span>
          </div>

          <div className={textVisibilityClass}>
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </button>
      </div>
    );
  }

  const external = !!item.href && item.href.startsWith("http");

  return (
    <Link
      href={item.inactive ? "#" : item.href || "#"}
      target={external ? "_blank" : "_self"}
      className={`${baseItemClass} ${
        active ? activeClass : inactiveClass
      } ${item.inactive ? disabledClass : ""}`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${
          active
            ? "text-dgem-dark-blue"
            : "text-white/70 group-hover:text-white"
        }`}
      />

      <span className={`${textVisibilityClass} flex-1`}>{item.name}</span>

      {item.badge && (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold transition-opacity duration-200 ${
            active
              ? "bg-[#070D22] text-white"
              : "bg-dgem-turquoise text-dgem-dark-blue"
          } ${isSidebarOpen ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100"}`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}