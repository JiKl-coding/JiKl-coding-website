import type { Metadata } from "next";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL)
};

// app/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


