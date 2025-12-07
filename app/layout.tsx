import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Destination College – First-Gen Student Support & FAFSA Help",
  description:
    "Destination College supports first-generation and low-income students at Summit High School with mentorship, workshops, and FAFSA guidance.",
  openGraph: {
    title: "Destination College – First-Gen Student Support & FAFSA Help",
    description:
      "Mentorship, academic coaching, and financial-aid support for Summit High School students and families.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body id="top" className={`${sourceSerif.variable} antialiased bg-white text-gray-900`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
