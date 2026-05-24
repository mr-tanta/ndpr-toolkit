import "@tantainnovative/ndpr-toolkit/styles";

export const metadata = {
  title: "NDPR Breach Report Demo",
  description: "Minimal Next.js demo for the NDPR Breach Notification form",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
