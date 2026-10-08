import Link from "next/link";

/** Shell of the connected app: header with the brand. Navigation (tab bar) arrives with the first features. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="flex min-h-tap items-center border-b border-line px-gutter">
        <Link href="/" prefetch={false} className="text-lg font-semibold tracking-tight">
          DrawToday
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-section p-gutter">{children}</main>
    </>
  );
}
