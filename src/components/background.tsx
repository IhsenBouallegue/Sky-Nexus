export function DotBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full w-full dark:bg-background bg-white dark:bg-dot-white/[0.2] bg-dot-background/[0.2] relative flex overflow-auto shadow-dark rounded-lg">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-background bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,background)]" />
      <div className="absolute w-full">{children}</div>
    </div>
  );
}
