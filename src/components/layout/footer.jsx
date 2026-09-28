import React from "react";

export default function Footer() {
  return (
    <footer className="w-full px-4 py-3 text-center text-[0.75rem] font-medium text-slate-500">
      © {new Date().getFullYear()} Overwatch Duplicate & Anomaly Detection Solution. All rights reserved.
    </footer>
  );
}