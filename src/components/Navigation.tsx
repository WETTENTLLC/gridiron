import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Gamepad2,
  FileText,
  MonitorPlay,
  Users,
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronRight,
  Activity,
  Crown,
  BookOpen,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/games", label: "Predictor Scores", icon: Gamepad2 },
  { path: "/narratives", label: "Narratives", icon: FileText },
  { path: "/studio", label: "Studio", icon: MonitorPlay },
  { path: "/analysts", label: "Analysts", icon: Users },
  { path: "/blog", label: "Insights", icon: BookOpen },
  { path: "/pricing", label: "Pricing", icon: Crown },
];

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/GridIronIQ Logo.png"
            alt="GridIron IQ"
            className="h-9 w-9 rounded-lg object-contain"
            style={{ mixBlendMode: "screen" }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">
              GRIDIRON
            </span>
            <span className="text-[10px] font-medium tracking-widest text-amber-400 uppercase leading-none mt-0.5">
              IQ
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-amber-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name ?? ""}
                    className="h-7 w-7 rounded-full border border-white/10"
                  />
                )}
                <span className="text-sm text-slate-300">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-400 hover:text-white hover:bg-white/5"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex text-slate-400 hover:text-white hover:bg-white/5"
              asChild
            >
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-1" />
                Sign in
              </Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 bg-[#0a0f1c] border-l border-white/10 p-0"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/GridIronIQ Logo.png"
                      alt="GridIron IQ"
                      className="h-8 w-8 rounded-lg object-contain"
                      style={{ mixBlendMode: "screen" }}
                    />
                    <span className="text-sm font-bold text-white">
                      GRIDIRON IQ
                    </span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="text-slate-400">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => (
                    <SheetClose key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                          isActive(item.path)
                            ? "text-white bg-amber-500/10 border border-amber-500/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {user?.avatar && (
                          <img
                            src={user.avatar}
                            alt={user.name ?? ""}
                            className="h-8 w-8 rounded-full border border-white/10"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{user?.name}</p>
                          <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                        onClick={() => { logout(); setMobileOpen(false); }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      asChild
                    >
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign in
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
