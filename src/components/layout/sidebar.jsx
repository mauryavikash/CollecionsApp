"use client";

import React from "react";
import {
  ShieldAlert,TrendingUp
} from "lucide-react";
import Navbar from "./navbar";
import UserProfile from "./UserProfile";
import { X } from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#070D22]/30 transition-opacity duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`
          group fixed inset-y-0 left-0 z-50 flex h-full flex-col overflow-hidden
          bg-[linear-gradient(180deg,#111A38_0%,#0F89D1_55%,#01D4D1_100%)] text-dgem-white
          border-r border-white/10
          shadow-[0_10px_40px_rgba(18,26,56,0.18)]
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          lg:translate-x-0 lg:absolute
          ${isOpen ? "lg:w-64" : "lg:w-16 lg:hover:w-64 lg:hover:shadow-2xl lg:hover:z-50"}
        `}
      >
        <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 bg-[#072a4d00] px-4 py-4">
          <div
            className={`
              w-full flex items-center gap-3  whitespace-nowrap transition-all duration-200
              ${isOpen ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100"}
            `}
          >
         

              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    CollectIQ
                  </h2>
                  <p className="text-xs text-white/70">
                    Collections Dashboard
                  </p>
                </div>
              </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-white/70 transition-colors hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

          {!isOpen && (
            <div className="absolute left-1/2 top-1/2 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center lg:flex lg:group-hover:hidden">
              <div className="h-10 w-12 rounded-xl bg-[#2563EB] flex items-center justify-center"><ShieldAlert /></div>
            </div>
          )}
        </div>

        <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-thin">
          <Navbar isSidebarOpen={isOpen} />
        </div>
  
        <UserProfile isSidebarOpen={isOpen} />
      </aside>
    </>
  );
}