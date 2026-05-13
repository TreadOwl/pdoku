import { Header } from '@/components/header'

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-full w-full items-center">
      <Header />
      <div className="mt-14 flex-1 w-full">{children}</div>
    </main>
  )
}
