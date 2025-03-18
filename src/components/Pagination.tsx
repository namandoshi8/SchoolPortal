"use client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

function Pagination({ page, count }: { page: number; count: number }) {
  const router = useRouter();

  const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;
  const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  }
  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-purple-600 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageChange(page - 1)}
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        {Array.from({ length: Math.ceil(count / ITEM_PER_PAGE) }, (_, i) => {
          const pageIndex = i + 1;
          return (
            <button
              key={pageIndex}
              className={`px-2 rounded-sm bg-Sky ${
                pageIndex === page ? "bg-Sky" : "bg-slate-200"
              }`}
              onClick={() => handlePageChange(pageIndex)}
            >
              {pageIndex}
            </button>
          );
        })}
        {/* <button className="px-2 rounded-sm bg-Sky">1</button> */}
      </div>
      <button
        disabled={!hasNext}
        onClick={() => handlePageChange(page + 1)}
        className="py-2 px-4 rounded-md bg-purple-600 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
