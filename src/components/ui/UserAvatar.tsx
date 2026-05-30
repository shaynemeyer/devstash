import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
  size?: number;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({ name, image, className, size = 28 }: UserAvatarProps) {
  const initials = name ? getInitials(name) : "?";

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User avatar"}
        width={size}
        height={size}
        className={cn("rounded-full object-cover shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white font-bold uppercase",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
