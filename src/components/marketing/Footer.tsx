const LINK_COLUMNS = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap"],
  },
  {
    heading: "Resources",
    links: ["Docs", "Blog", "Status", "GitHub"],
  },
  {
    heading: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
]

export default function Footer() {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight mb-3 bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width={24} height={24} aria-label="DevStash" role="img">
                <ellipse cx="16" cy="29.5" rx="10" ry="2" fill="black" opacity="0.14" />
                <polygon points="28,8 16,14 16,26 28,20" fill="#1e40af" />
                <polygon points="4,8 16,14 16,26 4,20" fill="#2563eb" />
                <polygon points="16,2 28,8 16,14 4,8" fill="#60a5fa" />
                <polygon points="14.5,2.75 17.5,2.75 17.5,13.25 14.5,13.25" fill="white" opacity="0.22" />
              </svg>
              DevStash
            </div>
            <p className="text-sm text-muted-foreground max-w-55 leading-relaxed">
              The developer knowledge hub for snippets, prompts, commands, and more.
            </p>
          </div>

          {/* Link columns */}
          {LINK_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6 border-t border-border text-xs text-muted-foreground/70">
          <span>© {new Date().getFullYear()} DevStash. All rights reserved.</span>
          <span>Made for developers, by developers.</span>
        </div>
      </div>
    </footer>
  )
}
