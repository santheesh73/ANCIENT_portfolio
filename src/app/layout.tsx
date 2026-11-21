import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { Header } from "../components/site";

export const metadata: Metadata = {
  title: {
    default: "Santheesh S — The Archive of Intelligence",
    template: "%s — The Archive of Intelligence",
  },
  description:
    "Explore Santheesh S's engineering portfolio through an ancient observatory, an animated bronze armillary, and seven software case studies.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
      </body>
    </html>
  );
}
