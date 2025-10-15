'use client'

import AdminSidebar from "@/components/ui/admin/sidebar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <AdminSidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "transition-all duration-300 min-h-screen",isMobile && 'ml-[20%] w-[80%',
          !isMobile && (isSidebarOpen ? "ml-64" : "ml-16")
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
