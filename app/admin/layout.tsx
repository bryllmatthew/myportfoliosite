import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        offset={16}
        theme="dark"
        closeButton
        toastOptions={{
          classNames: {
            toast: "!bg-surface !border-line-strong !text-paper !rounded-xl",
            description: "!text-muted",
          },
        }}
      />
    </>
  );
}
