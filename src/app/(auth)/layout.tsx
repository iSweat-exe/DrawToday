/** Shell of the sign-in pages: a single centered column, no tab bar (nothing to navigate to before signing in). */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-section p-gutter py-10">
      {children}
    </main>
  );
}
