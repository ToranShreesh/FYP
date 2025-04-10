import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReportPDF = ({ data, reportType, timeRange }) => {
  const exportPDF = () => {
    if (!data.length) {
      alert("No data available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text(`${reportType.toUpperCase()} REPORT (${timeRange.toUpperCase()})`, 10, 10);

    const tableData = data.map(row => Object.values(row));
    const tableHeaders = [Object.keys(data[0])];

    doc.autoTable({
      head: tableHeaders,
      body: tableData,
      startY: 20,
    });

    doc.save(`${reportType}_${timeRange}_report.pdf`);
  };

  return (
    <button
      onClick={exportPDF}
      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
    >
      Export PDF
    </button>
  );
};

export default ReportPDF;
