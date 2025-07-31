import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Agenda Semanal",
  description: "Gestiona tus actividades y el tiempo dedicado a cada una",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
