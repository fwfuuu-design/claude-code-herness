"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export function LearnShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChapter = /^\/(en|zh)\/s\d{2}\/?$/.test(pathname);

  if (!isChapter) return <>{children}</>;

  return (
    <div className="flex min-w-0 gap-6 xl:gap-8">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
