import React, { useEffect } from "react";

export default function Layout({ children }) {
  useEffect(() => {
    document.title = "Rangers Dream Sheet 2026";
  }, []);

  return (
    <div className="dark app-shell-bg min-h-screen text-white" style={{ background: '#0A1628', color: '#E2E8F0' }}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}