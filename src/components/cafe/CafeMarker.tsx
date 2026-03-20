/** Custom coffee cup SVG marker for cafe map pins */

export function CoffeeCupIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm14 2H4v10h12V7zm2 4h2V9h-2v4z" />
    </svg>
  );
}
