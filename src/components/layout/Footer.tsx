/** Footer for BrewMap */

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} BrewMap. Finding your zen, one cup at a time.</p>
      </div>
    </footer>
  );
}
