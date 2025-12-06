import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Users as UsersIcon, Globe } from "lucide-react";
import {
  LayoutMain,
  LayoutMobileHeader,
  LayoutMobileOverlay,
  LayoutSidebar,
} from "./components";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useAuth } from "@/features/auth";

type PrimaryLayoutProps = {
  children: React.ReactNode;
};

export const PrimaryLayout: React.FC<PrimaryLayoutProps> = ({ children }) => {
  const { logout: onLogout, user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { isDarkMode, toggle: toggleTheme } = useDarkMode();
  const theme = isDarkMode ? "dark" : "light";

  const location = useLocation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [location]);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    ...(user?.role === "admin"
      ? [{ path: "/users", label: "Usuários", icon: UsersIcon }]
      : []),
    { path: "/explore", label: "Explorar API", icon: Globe },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <LayoutMobileHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {isSidebarOpen && <LayoutMobileOverlay onClose={() => setIsSidebarOpen(false)} />}

      <LayoutSidebar
        navItems={navItems}
        theme={theme}
        onToggleTheme={toggleTheme}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
        currentPath={location.pathname}
      />

      <LayoutMain>{children}</LayoutMain>
    </div>
  );
};
