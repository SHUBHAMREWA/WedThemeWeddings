import Image from "next/image";
import { cn } from "@/lib/utils";

/** WedTheme Weddings logo. Use "pink" on light backgrounds and "white" on dark or pink backgrounds. */
export default function Logo({
  variant = "pink",
  className,
  priority,
}: {
  variant?: "pink" | "white";
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={variant === "white" ? "/brand/logo-white.png" : "/brand/logo-pink.png"}
      alt="WedTheme Weddings"
      width={798}
      height={325}
      priority={priority}
      className={cn("h-12 w-auto", className)}
    />
  );
}
