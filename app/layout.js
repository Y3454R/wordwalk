export const metadata = {
  title: "WordWalk",
  description: "Minimal vocabulary audiobook app",
};

import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
