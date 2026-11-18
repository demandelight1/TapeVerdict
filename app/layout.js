import "./globals.css";

export const metadata = {
  title: "TapeVerdict",
  description: "A transparent security assessment layer for TapeOut websites.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
