import { useState } from 'react'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import defaultAvatar from '@/assets/default-avatar.png'

export function Header() {
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex h-20 shrink-0 items-center justify-end gap-5 border-b border-border bg-white px-8">
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-heading/70 hover:bg-tint"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-green-500" />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3"
        >
          <img
            src={defaultAvatar}
            alt=""
            className="h-10 w-10 rounded-full border border-border object-cover"
          />
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight text-heading">
              {user?.name ?? 'User'}
            </p>
            <p className="text-xs capitalize leading-tight text-muted">{user?.role ?? ''}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-heading/60" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-lg border border-border bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-heading hover:bg-tint"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
