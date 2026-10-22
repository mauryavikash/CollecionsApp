import React from "react";

export default function Footer() {
  return (
    <footer className="w-full px-4 py-3 text-center text-[0.75rem] font-medium text-slate-400">
      &copy; {new Date().getFullYear()} Predictive Collection &amp; Prioritisation. All rights reserved.
    </footer>
  );
}