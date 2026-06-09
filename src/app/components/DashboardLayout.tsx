import { ChevronRight, LogOut, Loader2 } from "lucide-react";
import { ReefLogo } from "./ReefLogo";
import type { AuthUser } from "../api/client";

export interface DashboardTab {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface DashboardLayoutProps {
  title: string;
  user: AuthUser;
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onBack: () => void;
  onLogout: () => void;
  actionMsg?: string;
  loading?: boolean;
  error?: string;
  profileCard?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({
  title,
  user,
  tabs,
  activeTab,
  onTabChange,
  onBack,
  onLogout,
  actionMsg,
  loading,
  error,
  profileCard,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col" dir="rtl">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
            الرئيسية
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <ReefLogo height={36} />
            <div className="text-right min-w-0 hidden sm:block">
              <p className="text-sm font-bold text-foreground truncate">لوحتي — {title}</p>
              <p className="text-[10px] text-primary font-semibold">{user.roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden md:inline">{user.name}</span>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex gap-1 overflow-x-auto px-4 pb-2 border-t border-border/50 pt-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors relative ${
                activeTab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground bg-muted/50"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.badge ? (
                <span className="w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6">
        <aside className="hidden md:flex flex-col w-52 shrink-0 gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors text-right ${
                activeTab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <t.icon className="w-4 h-4" />
                {t.label}
              </span>
              {t.badge ? (
                <span className="w-5 h-5 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </aside>

        <main className="flex-1 min-w-0">
          {actionMsg && (
            <p className="text-sm text-center py-2.5 mb-4 bg-primary/10 text-primary rounded-xl font-semibold">
              {actionMsg}
            </p>
          )}

          {profileCard}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              جاري التحميل...
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center py-12 bg-destructive/10 rounded-xl">
              {error}
            </p>
          )}

          {!loading && !error && children}
        </main>
      </div>
    </div>
  );
}
