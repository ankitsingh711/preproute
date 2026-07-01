import { NavLink } from 'react-router-dom'
import { ClipboardCheck, SquarePen, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import logo from '@/assets/logo.png'

const navItems = [
  { to: '/', label: 'Dashboard', icon: TrendingUp, end: true },
  { to: '/tests/new', label: 'Test Creation', icon: SquarePen, end: false },
  { to: '/tracking', label: 'Test Tracking', icon: ClipboardCheck, end: false },
]

export function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-white px-4 py-6">
      <img src={logo} alt="PrepRoute" className="mb-10 ml-2 h-7 w-auto" />
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg border-l-4 border-transparent px-3 py-2.5 text-sm font-medium text-heading/70 transition-colors hover:bg-tint',
                isActive && 'border-primary-strong bg-tint text-primary-strong',
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
