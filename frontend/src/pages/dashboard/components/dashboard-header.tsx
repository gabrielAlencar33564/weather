import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components";

type DashboardHeaderProps = {
  onExport: (format: "csv" | "xlsx") => void;
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onExport }) => {
  return (
    <div
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      data-cy="dashboard-header"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard de Clima</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real • São Paulo, SP
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("csv")}
          data-cy="button-export-csv"
        >
          <FileText className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("xlsx")}
          data-cy="button-export-xlsx"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar XLSX
        </Button>
      </div>
    </div>
  );
};
