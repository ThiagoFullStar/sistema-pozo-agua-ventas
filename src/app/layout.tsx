import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Ventas - Pozo de Agua",
  description: "Aplicación para registrar ventas de agua del pozo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pozo Agua" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="description" content="Sistema de registro de ventas de agua - SISTEMAS POZO DE AGUA JUAN MONTALVO" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiMzYjgyZjYiLz4KPHN2ZyB4PSI0OCIgeT0iNDgiIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Im0xMiAzLTEuOTEyIDUuODEzYTIgMiAwIDAgMS0xLjI3NSAxLjI3NUwzIDEyaDEuOTEybDQuODEzLTEuOTEyYTIgMiAwIDAgMSAxLjI3NS0xLjI3NUwxMiAzWiIvPgo8cGF0aCBkPSJtMTIgMjEgMS45MTItNS44MTNhMiAyIDAgMCAxIDEuMjc1LTEuMjc1TDIxIDEyaC0xLjkxMmwtNC44MTMgMS45MTJhMiAyIDAgMCAxLTEuMjc1IDEuMjc1TDEyIDIxWiIvPgo8L3N2Zz4KPC9zdmc+" />
      </head>
      <body className={inter.className}>
        <AppProvider>
          <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>
            
            {/* Mobile Header */}
            <MobileHeader />
            
            {/* Main content - Full width on mobile, with margin on desktop */}
            <main className="flex-1 lg:ml-64 p-3 lg:p-6 pb-20 lg:pb-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            
            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
