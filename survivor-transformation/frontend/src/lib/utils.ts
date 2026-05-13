/**
 * Simple class-name joiner. Use for combining module classes and conditional classes.
 * No Tailwind / clsx / tailwind-merge.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
