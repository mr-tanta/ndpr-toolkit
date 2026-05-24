import "@tantainnovative/ndpr-toolkit/styles";

export const metadata = {
  title: "NDPR Data Subject Rights Demo",
  description: "Minimal Next.js demo for the NDPR Subject Rights portal",
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
