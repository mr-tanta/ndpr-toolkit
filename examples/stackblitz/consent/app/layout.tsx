import "@tantainnovative/ndpr-toolkit/styles";

export const metadata = {
  title: "NDPR Consent Demo",
  description: "Minimal Next.js demo for @tantainnovative/ndpr-toolkit consent banner",
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
