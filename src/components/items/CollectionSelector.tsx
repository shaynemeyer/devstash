"use client";

interface Collection {
  id: string;
  name: string;
}

interface CollectionSelectorProps {
  collections: Collection[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function CollectionSelector({ collections, selected, onChange }: CollectionSelectorProps) {
  if (collections.length === 0) return null;

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <section>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
        Collections
      </p>
      <div className="flex flex-wrap gap-1.5">
        {collections.map((col) => {
          const isSelected = selected.includes(col.id);
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => toggle(col.id)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent hover:border-muted-foreground/40"
              }`}
            >
              {col.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
