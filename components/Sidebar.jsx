'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { signOutAction } from '@/app/actions/auth'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projetos' },
  { href: '/tasks', label: 'Tarefas' },
  { href: '/settings', label: 'Configuracoes' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await signOutAction()
  }

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-screen p-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <span className="font-bold text-xl text-gray-900">TaskFlow</span>
        </Link>

        <nav className="space-y-1 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 pt-4 mt-4">
          {!loading && user && (
            <div className="px-3 mb-3">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                isActive(link.href)
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center px-3 py-1 text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>
    </>
  )
}
