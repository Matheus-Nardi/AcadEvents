"use client"

import React from "react";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfViewerProps {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [scale, setScale] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(true);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: any) => {
    setNumPages(nextNumPages);
    setLoading(false);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => (page > 1 ? page - 1 : page));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => (page < numPages ? page + 1 : page));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Página {currentPage} de {numPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          src={`${pdfUrl}#page=${currentPage}`}
          className="rounded-lg shadow-lg"
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            border: "none",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
