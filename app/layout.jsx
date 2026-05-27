import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { getCurrentUser } from "@/src/services/authService";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TaskFlow - Gerenciamento de Projetos e Tarefas",
  description:
    "Organize seus projetos e tarefas em um so lugar. Gerencie projetos, acompanhe prazos, defina prioridades e visualize o progresso com um quadro Kanban simples e eficiente.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser()

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}
