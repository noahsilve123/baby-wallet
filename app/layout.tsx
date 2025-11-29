import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

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
      <body className={`${sourceSerif.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
