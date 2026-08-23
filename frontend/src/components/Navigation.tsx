'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/plots', label: 'Land Plots', icon: 'potted_plant' },
  { href: '/map', label: 'Yield Maps', icon: 'map' },
  { href: '/triggers', label: 'Claims', icon: 'verified_user' },
  { href: '/payouts', label: 'Reports', icon: 'analytics' },
];

const toolLinks = [
  { href: '/landing', label: 'Landing', icon: 'home' },
  { href: '/register', label: 'Register Plot', icon: 'add_location' },
  { href: '/journey', label: 'Farmer Journey', icon: 'route' },
  { href: '/demo', label: 'Live Demo', icon: 'play_circle' },
  { href: '/storyboard', label: 'Impact Story', icon: 'auto_stories' },
  { href: '/tech', label: 'Tech Stack', icon: 'code' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold font-grotesk text-primary tracking-tight">KshetraX</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-on-surface-variant hover:text-primary hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-on-surface-variant hover:text-primary hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9 px-2 hover:bg-surface-container-high">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] bg-primary text-white font-semibold">SK</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-on-surface hidden md:inline">Saatvik</span>
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">expand_more</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">person</span> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">settings</span> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-on-surface-variant cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">logout</span> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex fixed left-0 top-14 h-[calc(100vh-56px)] w-60 z-40 flex-col bg-surface-container-lowest border-r border-outline-variant">
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            <p className="text-overline text-on-surface-variant px-3 mb-2">Navigation</p>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-[inset_0_0_0_1px_rgba(124,167,143,0.2)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  )}
                >
                  <span className={cn('material-symbols-outlined text-[20px]', isActive && 'text-on-primary-container')}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Separator className="mx-4 my-4" />

          <nav className="px-3 space-y-1">
            <p className="text-overline text-on-surface-variant px-3 mb-2">Tools</p>
            {toolLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-[inset_0_0_0_1px_rgba(124,167,143,0.2)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  )}
                >
                  <span className={cn('material-symbols-outlined text-[20px]', isActive && 'text-on-primary-container')}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-outline-variant">
          <Link href="/register">
            <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary-container/10" size="default">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Register Plot
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant z-50 flex items-center justify-around px-1 safe-area-inset-bottom">
        {[...navLinks.slice(0, 4), toolLinks[3]].map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-xl transition-all touch-target',
                isActive ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              <span className={cn('material-symbols-outlined text-[24px] transition-all', isActive && 'text-primary')}>{link.icon}</span>
              <span className="text-[10px] font-medium leading-tight">{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
