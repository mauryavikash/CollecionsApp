import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
const poppins = localFont({
  src: [
    {
      path: "../fonts/Poppins-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Poppins-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Poppins-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Poppins-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Collections",
  description: "Automate your Collections process with our solution",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} light h-full antialiased`}>
      <body className="m-0 p-0 bg-bgdeep text-text">
        <Toaster position="top-center" richColors />
        {children}
        </body>
    </html>
  );
}
