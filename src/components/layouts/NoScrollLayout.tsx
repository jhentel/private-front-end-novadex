// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
export default function NoScrollLayout({
  children,
  mobileOnWhichBreakpoint = "lg",
}: {
  children: React.ReactNode;
  mobileOnWhichBreakpoint?: "lg" | "xl";
}) {
  return (
    <main
      className={cn(
        "flex w-full grow flex-col",
        mobileOnWhichBreakpoint === "lg" ? "lg:px-4" : "xl:px-4",
      )}
    >
      {children}
    </main>
  );
}
