import React from "react";

type LayoutMainProps = {
  children: React.ReactNode;
};

export const LayoutMain: React.FC<LayoutMainProps> = ({ children }) => {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <div className="h-16 md:hidden shrink-0" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto pb-10">{children}</div>
      </div>
    </main>
  );
};
