'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projetos' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
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

        {user && (
          <div className="px-3 mb-6 pb-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name ?? user.email}</p>
            {user.name && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
          </div>
        )}

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

        <button
          onClick={signOut}
          className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition-colors mt-2"
        >
          Sair
        </button>
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
        </div>
      </nav>
    </>
  )
}
