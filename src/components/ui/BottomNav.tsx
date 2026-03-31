"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  BarChart3,
  ListChecks,
  Trophy,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "TODAY", icon: House },
  { href: "/stats", label: "STATS", icon: BarChart3 },
  { href: "/tasks", label: "TASKS", icon: ListChecks },
  { href: "/arena", label: "ARENA", icon: Trophy },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full px-5 pt-3 pb-5">
      <div className="flex h-[62px] rounded-[36px] bg-bg-card border border-border-card p-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[26px] transition-colors ${
                isActive
                  ? "bg-gradient-to-br from-accent-emerald to-accent-teal"
                  : ""
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-bg-base" : "text-text-tertiary"}
              />
              <span
                className={`text-[10px] font-medium tracking-wider ${
                  isActive
                    ? "text-bg-base font-semibold"
                    : "text-text-tertiary"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
