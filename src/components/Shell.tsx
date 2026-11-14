import { useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LiquiGlass } from "@liqui-design/glass";
import {
  Activity,
  Bell,
  ClipboardList,
  Coffee,
  Gamepad2,
  LayoutDashboard,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  Search,
  Settings as SettingsIcon,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TabBar, TabBarItem } from "@/components/ui/tab-bar";
import { Drawer, DrawerBody, DrawerContent, DrawerHandle, DrawerTitle } from "@/components/ui/drawer";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AppearanceToggle, ColorPicker, FontSwitcher } from "@/components/Controls";
import { LiveDot } from "@/components/Bits";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}
export const NAV: NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/cafe", label: "Cafe & Floor", icon: Coffee },
  { to: "/stock", label: "Stock", icon: Package },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/members", label: "Members", icon: Users },
  { to: "/monitoring", label: "Monitoring", icon: Activity },
  { to: "/reports", label: "Shift Reports", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function Sidebar() {
  const collapsed = useApp((s) => s.sidebarCollapsed);
  const toggle = useApp((s) => s.toggleSidebar);
  const stations = useApp((s) => s.stations);
  const live = stations.filter((s) => s.status === "in-use").length;
  return (
    <LiquiGlass
      radius={26}
      blur={1}
      refraction={80}
      bezel={22}
      frost={0.55}
      className={cn(
        "hidden h-full flex-none transition-[width] duration-300 ease-[cubic-bezier(0.3,1,0.35,1)] lg:block",
        collapsed ? "w-[76px]" : "w-[240px]",
      )}
      contentClassName="flex size-full flex-col rounded-[inherit] p-3"
    >
      <div className={cn("flex items-center gap-2.5 px-1.5 pt-1 pb-3", collapsed && "justify-center px-0")}>
        <span
          className="flex size-9 flex-none items-center justify-center rounded-xl text-white"
          style={{ background: "var(--lq-accent)" }}
        >
          <Gamepad2 size={19} />
        </span>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="f-display truncate text-[15px] font-bold tracking-[-0.01em]">Liqui Lounge</div>
            <div className="label !text-[10px]">Lounge OS</div>
          </div>
        )}
      </div>
      <Separator />
      <ScrollArea className="mt-3 min-h-0 flex-1">
        <ScrollAreaViewport>
          <ScrollAreaContent>
            <nav aria-label="Main" className="flex flex-col gap-1">
              {NAV.map((item) => (
                <NavRow key={item.to} item={item} collapsed={collapsed} />
              ))}
            </nav>
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
      <div className="mt-2 flex flex-col gap-2">
        <div className={cn("row-flat flex items-center gap-2.5 px-3 py-2.5", collapsed && "justify-center px-0")}>
          <LiveDot />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="f-mono text-[13px] font-semibold">
                {live}/{stations.length}
              </div>
              <div className="label !text-[10px]">Stations live</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "press flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold text-[var(--lq-text-dim)]",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </LiquiGlass>
  );
}

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  const link = (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        cn(
          "press relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold outline-none",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-[color-mix(in_srgb,var(--lq-accent)_18%,transparent)] text-[var(--lq-text)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--lq-accent)_32%,transparent)]"
            : "text-[var(--lq-text-dim)] hover:text-[var(--lq-text)]",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={cn("flex-none", isActive && "text-[var(--lq-accent)]")} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const current = NAV.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to))) ?? NAV[0];
  const activity = useApp((s) => s.activity);
  return (
    <LiquiGlass
      radius={22}
      blur={1}
      refraction={60}
      bezel={18}
      frost={0.55}
      className="relative z-20 flex-none"
      contentClassName="flex items-center gap-2 rounded-[inherit] px-3 py-2.5 sm:gap-3 sm:px-4"
    >
      <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
        <span className="flex size-8 flex-none items-center justify-center rounded-lg text-white" style={{ background: "var(--lq-accent)" }}>
          <Gamepad2 size={17} />
        </span>
      </div>
      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <current.icon size={17} className="text-[var(--lq-text-dim)]" />
        <span className="f-display truncate text-[15px] font-semibold">{current.label}</span>
      </div>
      <div className="hidden min-w-0 flex-1 justify-center lg:flex">
        <Input
          aria-label="Search"
          placeholder="Search stations, members…"
          className="max-w-[360px]"
          start={<Search size={15} />}
        />
      </div>
      <div className="flex-1 lg:hidden" />
      <div className="flex flex-none items-center gap-2">
        <FontSwitcher />
        <ColorPicker />
        <AppearanceToggle />
        <Menu>
          <MenuTrigger
            aria-label="Notifications"
            className="press relative flex size-9 flex-none items-center justify-center rounded-xl outline-none"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full" style={{ background: "var(--lq-danger)" }} />
          </MenuTrigger>
          <MenuContent align="end" className="w-[300px]">
            {activity.slice(0, 4).map((a) => (
              <MenuItem key={a.id}>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-semibold">{a.detail}</span>
                  <span className="f-mono text-[11px] text-[var(--lq-text-dim)]">
                    {a.station} · {a.at}
                  </span>
                </span>
              </MenuItem>
            ))}
            <MenuSeparator />
            <MenuItem>Mark all read</MenuItem>
          </MenuContent>
        </Menu>
        <Avatar size={34}>
          <AvatarFallback>JM</AvatarFallback>
        </Avatar>
      </div>
    </LiquiGlass>
  );
}

function MobileNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [more, setMore] = useState(false);
  const primary = NAV.slice(0, 4);
  const rest = NAV.slice(4);
  const value = primary.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)))?.to ?? "more";
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 lg:hidden">
        <div className="pointer-events-auto w-full max-w-[420px]">
          <TabBar
            value={value}
            onValueChange={(v) => {
              if (v === "more") setMore(true);
              else navigate(String(v));
            }}
          >
            {primary.map((n) => (
              <TabBarItem key={n.to} value={n.to} icon={<n.icon />}>
                {n.label.split(" ")[0]}
              </TabBarItem>
            ))}
            <TabBarItem value="more" icon={<MoreHorizontal />}>
              More
            </TabBarItem>
          </TabBar>
        </div>
      </div>
      <Drawer open={more} onOpenChange={setMore}>
        <DrawerContent side="bottom">
          <DrawerHandle />
          <DrawerBody>
            <DrawerTitle>More</DrawerTitle>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {rest.map((n) => (
                <button
                  key={n.to}
                  type="button"
                  onClick={() => {
                    setMore(false);
                    navigate(n.to);
                  }}
                  className="press row-flat flex items-center gap-3 px-3 py-3 text-[13.5px] font-semibold"
                >
                  <n.icon size={18} className="text-[var(--lq-accent)]" />
                  {n.label}
                </button>
              ))}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function Ambient() {
  return (
    <div className="ambient" aria-hidden>
      <div className="orb o1" />
      <div className="orb o2" />
      <div className="orb o3" />
      <div className="grid" />
      <div className="ring r1" />
      <div className="ring r2" />
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex h-full gap-3 p-3">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Topbar />
        <ScrollArea className="min-h-0 flex-1">
          <ScrollAreaViewport>
            <ScrollAreaContent>
              <main className="pr-1 pb-28 lg:pb-4">{children}</main>
            </ScrollAreaContent>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </ScrollArea>
      </div>
      <MobileNav />
    </div>
  );
}
