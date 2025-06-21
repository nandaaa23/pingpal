import "./globals.css";

export const metadata = {
  title: "PingPal - Task Reminder App",
  description: "A visually expressive, blue-themed task and reminder app with a custom designer font.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="bg-blue-50 text-blue-900 antialiased min-h-screen flex flex-col items-center justify-center px-4 font-extrabold"
      >
        {children}
      </body>
    </html>
  );
}
