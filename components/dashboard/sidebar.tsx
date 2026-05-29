"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown } from "lucide-react"
import { menuItems } from "@/lib/navigation-config"
import { getUserProfile, type UserProfile } from "@/lib/api/user"

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["자료 관리"])
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    if (token) {
      getUserProfile().then(setUser).catch(() => {})
    }
  }, [])

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string | null) => {
    if (!href) return false
    return pathname === href
  }

  const isChildActive = (children?: { href: string }[]) => {
    if (!children) return false
    return children.some(child => pathname === child.href)
  }

  const visibleItems = menuItems.filter(item => !item.mobileOnly)

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-2xl font-bold text-foreground">passroute</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const isExpanded = expandedItems.includes(item.label)
          const hasActiveChild = isChildActive(item.children)
          const itemActive = isActive(item.href) || hasActiveChild

          if (item.expandable && item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    hasActiveChild
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4.5 w-4.5" />
                    {item.label}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )} />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          isActive(child.href)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <child.icon className="h-4 w-4" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href || item.label}
              href={item.href || "/dashboard"}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                itemActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary">
          <Avatar className="h-9 w-9 ring-2 ring-border">
            <AvatarImage src={undefined} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {user?.name?.slice(0, 2) ?? "—"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-foreground">
              {user?.name ?? "—"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
