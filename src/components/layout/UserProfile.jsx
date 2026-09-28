"use client";

import { LogOut, Settings, UserCircle2 } from "lucide-react";
import React from "react";

export default function UserProfile({ isSidebarOpen = true }) {
  const handleLogout = () => {
    console.log("Logout will be connected later.");
  };

  return (
    // <div className="m-4 flex items-center justify-center">
    //   <div
    //     className={`
    //       flex w-full items-center overflow-hidden rounded-2xl border
    //       border-white/10 bg-white/10 text-white transition-all duration-300
    //       shadow-sm backdrop-blur-sm
    //       ${
    //         isSidebarOpen
    //           ? "justify-between p-2"
    //           : "justify-center p-2 lg:h-10 lg:w-10 lg:p-0 lg:bg-transparent lg:border-transparent lg:group-hover:h-auto lg:group-hover:w-full lg:group-hover:justify-between lg:group-hover:bg-white/10 lg:group-hover:border-white/10 lg:group-hover:p-2"
    //       }
    //     `}
    //   >
    //     <div className="flex shrink-0 items-center justify-center gap-3">
    //       <img
    //         src="/avatar.jpg"
    //         alt="User avatar"
    //         className="h-9 w-9 rounded-full border border-white/10 object-cover shadow-sm"
    //       />

    //       <span
    //         className={`whitespace-nowrap text-sm font-semibold tracking-wide transition-opacity duration-200
    //           ${isSidebarOpen ? "block opacity-100" : "hidden lg:group-hover:block lg:opacity-100"}
    //         `}
    //       >
    //         Vigneshwaran
    //       </span>
    //     </div>

    //     <div className={`flex items-center gap-1 ${isSidebarOpen ? "flex" : "hidden lg:group-hover:flex"}`}>
    //       {/* <button
    //         type="button"
    //         title="My Profile"
    //         className="rounded-lg border border-white/10 bg-white/10 p-1.5 text-white/80 transition-all duration-200 hover:bg-white hover:text-dgem-dark-blue"
    //       >
    //         <UserCircle2 size={14} />
    //       </button> */}

    //       {/* <button
    //         type="button"
    //         title="Settings"
    //         className="rounded-lg border border-white/10 bg-white/10 p-1.5 text-white/80 transition-all duration-200 hover:bg-white hover:text-dgem-dark-blue"
    //       >
    //         <Settings size={14} />
    //       </button> */}

    //       <button
    //         onClick={handleLogout}
    //         type="button"
    //         title="Log Out"
    //         className="rounded-lg border border-white/10 bg-white/10 p-1.5 text-white/80 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
    //       >
    //         <LogOut size={14} />
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <></>
  );
}