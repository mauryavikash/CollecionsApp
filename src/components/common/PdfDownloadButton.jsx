"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function PdfDownloadButton({ fileName }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadPdf() {
    const content = document.querySelector("[data-pdf-content]");
    if (!content || isDownloading) {
      return;
    }

    setIsDownloading(true);
    const hiddenElements = [...content.querySelectorAll("[data-pdf-exclude]")];
    hiddenElements.forEach((element) => {
      element.dataset.pdfPreviousDisplay = element.style.display;
      element.style.display = "none";
    });

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(content, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        windowWidth: content.scrollWidth,
      });
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
    } finally {
      hiddenElements.forEach((element) => {
        element.style.display = element.dataset.pdfPreviousDisplay ?? "";
        delete element.dataset.pdfPreviousDisplay;
      });
      setIsDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={downloadPdf}
      disabled={isDownloading}
      data-pdf-exclude
      className="flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-[#2563EB] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download size={15} />
      {isDownloading ? "Preparing..." : "Download"}
    </button>
  );
}
