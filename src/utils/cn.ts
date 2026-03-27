import { clsx, type ClassValue } from "clsx";

/**
 * cn — Tailwind-aware class name merger.
 * Combines clsx conditional logic with tailwind-merge deduplication.
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-blue-500", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
