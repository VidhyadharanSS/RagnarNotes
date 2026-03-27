import { useState } from "react";
import { cn } from "@utils/cn";

/* ─────────────────────────────────────────────────────────────
 * ResizeHandle — Drag handle between resizable panels
 * ───────────────────────────────────────────────────────────── */

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  className?: string;
}

export function ResizeHandle({ onMouseDown, className }: ResizeHandleProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex-shrink-0 w-[5px] cursor-col-resize",
        "transition-colors duration-150",
        isHovered ? "bg-ragnar-accent/30" : "bg-ragnar-border-subtle",
        className,
      )}
    >
      {/* Visual indicator dot */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "h-8 w-[3px] rounded-full transition-all duration-150",
          isHovered ? "bg-ragnar-accent opacity-80" : "bg-ragnar-border opacity-0 group-hover:opacity-100",
        )}
      />
    </div>
  );
}
