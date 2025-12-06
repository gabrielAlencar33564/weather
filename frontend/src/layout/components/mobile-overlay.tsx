import React from "react";

type LayoutMobileOverlayProps = {
  onClose: () => void;
};

export const LayoutMobileOverlay: React.FC<LayoutMobileOverlayProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
      onClick={onClose}
    />
  );
};
