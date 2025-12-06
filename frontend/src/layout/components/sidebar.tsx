import React from "react";
import { Link } from "react-router-dom";
import { CloudSun, X, LogOut, Sun, Moon } from "lucide-react";

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type LayoutSidebarProps = {
  navItems: NavItem[];
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  onLogout: () => void;
  currentPath: string;
};

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  navItems,
  theme,
  onToggleTheme,
  isSidebarOpen,
  onCloseSidebar,
  onLogout,
  currentPath,
}) => {
  return (
    <aside
      className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-sidebar text-sidebar-foreground
        border-l border-sidebar-border md:border-l-0 md:border-r 
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        md:static md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <CloudSun className="text-primary-foreground h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">GDash</span>
        </div>

        <button
          onClick={onCloseSidebar}
          className="md:hidden text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-sidebar-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          {theme === "light" ? "Modo Escuro" : "Modo Claro"}
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};
