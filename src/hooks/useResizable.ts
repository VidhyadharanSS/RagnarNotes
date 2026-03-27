import { useState, useCallback, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
 * useResizable — Drag-to-resize panel hook
 *
 * Returns a ref to attach to the drag handle and the current
 * width so the consumer can apply it to their panel.
 * ───────────────────────────────────────────────────────────── */

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  direction?: "right" | "left";
}

export function useResizable({
  initialWidth,
  minWidth,
  maxWidth,
  direction = "right",
}: UseResizableOptions) {
  const [width, setWidth] = useState(initialWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(initialWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = direction === "right"
          ? ev.clientX - startX.current
          : startX.current - ev.clientX;
        const newWidth = Math.min(
          maxWidth,
          Math.max(minWidth, startWidth.current + delta),
        );
        setWidth(newWidth);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width, minWidth, maxWidth, direction],
  );

  return { width, handleMouseDown };
}
