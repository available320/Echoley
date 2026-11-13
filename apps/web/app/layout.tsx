import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Echoley™ — AI video clipping studio", description: "Turn long videos into short clips with AI-assisted editing." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
