import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "end-gap", totalPages];
  if (page >= totalPages - 3) return [1, "start-gap", ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)];
  return [1, "start-gap", page - 1, page, page + 1, "end-gap", totalPages];
}

export default function Pagination({ page, totalPages, onPageChange }) {
  const buttonBase = "grid h-8 min-w-8 place-items-center rounded-lg px-2 text-[12px] font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${buttonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {getPageItems(page, Math.max(totalPages, 1)).map((item) =>
        typeof item === "string" ? (
          <span key={item} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={`${buttonBase} ${
              item === page ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${buttonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
