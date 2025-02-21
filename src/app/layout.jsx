import './globals.css'

export const metadata = {
  title: 'Dot Effect Processor',
  description: 'Transform your images into dot patterns',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}
