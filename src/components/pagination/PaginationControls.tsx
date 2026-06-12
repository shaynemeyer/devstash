import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function PaginationControls({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 py-4" aria-label="Pagination">
      <PaginationLink
        href={buildHref(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationLink>

      {pages.map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground select-none">
            …
          </span>
        ) : (
          <PaginationLink
            key={p}
            href={buildHref(p)}
            active={p === page}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </PaginationLink>
        )
      )}

      <PaginationLink
        href={buildHref(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </nav>
  );
}

interface LinkProps {
  href: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
}

function PaginationLink({ href, disabled, active, children, ...props }: LinkProps) {
  const base =
    "inline-flex items-center justify-center h-8 min-w-8 px-2 rounded text-sm transition-colors";
  const activeClass = "bg-primary text-primary-foreground font-medium";
  const normalClass = "text-foreground hover:bg-accent";
  const disabledClass = "text-muted-foreground pointer-events-none opacity-50";

  if (disabled) {
    return (
      <span className={`${base} ${disabledClass}`} {...props}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={`${base} ${active ? activeClass : normalClass}`} {...props}>
      {children}
    </Link>
  );
}

export function getPageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | null)[] = [1];

  if (current > 3) pages.push(null);

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push(null);

  pages.push(total);
  return pages;
}
