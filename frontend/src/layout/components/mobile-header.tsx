import React from "react";
import { CloudSun, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui";

type LayoutMobileHeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenSidebar: () => void;
};

export const LayoutMobileHeader: React.FC<LayoutMobileHeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSidebar,
}) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-30 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg">
          <CloudSun className="text-primary-foreground h-5 w-5" />
        </div>
        <span className="font-bold text-lg text-sidebar-foreground">GDash</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="text-sidebar-foreground"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <button
          onClick={onOpenSidebar}
          className="p-2 -mr-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
