import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/PublicShell";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: {
    default: "Nhà Xe Võ Cúc Phương - Vận chuyển hành khách uy tín",
    template: "%s | Nhà Xe Võ Cúc Phương",
  },
  description: "Dịch vụ vận chuyển hành khách liên tỉnh uy tín, an toàn với đội xe hiện đại. Đặt vé online nhanh chóng, giá cả hợp lý. Hotline: 02519 999 975",
  keywords: ["xe khách", "đặt vé xe", "Võ Cúc Phương", "xe liên tỉnh", "vận chuyển hành khách", "đặt vé online", "xe Bình Dương", "xe Sài Gòn"],
  authors: [{ name: "Nhà Xe Võ Cúc Phương" }],
  creator: "Nhà Xe Võ Cúc Phương",
  publisher: "Nhà Xe Võ Cúc Phương",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Nhà Xe Võ Cúc Phương",
    title: "Nhà Xe Võ Cúc Phương - Vận chuyển hành khách uy tín",
    description: "Dịch vụ vận chuyển hành khách liên tỉnh uy tín, an toàn. Đặt vé online nhanh chóng!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nhà Xe Võ Cúc Phương",
    description: "Đặt vé xe khách online - Uy tín, an toàn, giá tốt",
  },
  verification: {
    google: "your-google-verification-code", // Thay bằng mã từ Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <PublicShell>{children}</PublicShell>
        </Providers>
      </body>
    </html>
  );
}
