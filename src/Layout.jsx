import React, { useEffect } from "react";

export default function Layout({ children }) {
  useEffect(() => {
    document.title = "Rangers Dream Sheet 2026";
  }, []);

  return (
    <div className="app-shell-bg min-h-screen text-white">
      <div className="relative z-10">{children}</div>
    </div>
  );
}