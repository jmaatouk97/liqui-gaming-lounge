import { Check, ChevronDown, Monitor, Moon, Palette, Sun } from "lucide-react";
import { Tabs, TabsIndicator, TabsList, TabsTab } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "@/components/ui/scroll-area";
import { FONTS, THEMES, useUI, type Appearance } from "@/theme";
import { cn } from "@/lib/utils";

/* Control 1 — Light / Dark / System */
export function AppearanceToggle() {
  const appearance = useUI((s) => s.appearance);
  const set = useUI((s) => s.setAppearance);
  const items: { v: Appearance; icon: typeof Sun; label: string }[] = [
    { v: "light", icon: Sun, label: "Light" },
    { v: "dark", icon: Moon, label: "Dark" },
    { v: "system", icon: Monitor, label: "System" },
  ];
  return (
    <Tabs value={appearance} onValueChange={(v) => set(v as Appearance)} className="w-[132px] flex-none">
      <TabsList aria-label="Appearance">
        <TabsIndicator />
        {items.map(({ v, icon: Icon, label }) => (
          <Tooltip key={v}>
            <TooltipTrigger
              render={
                <TabsTab value={v} aria-label={label} className="px-0">
                  <Icon size={15} strokeWidth={2.2} />
                </TabsTab>
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </TabsList>
    </Tabs>
  );
}

/* Control 2 — 6-preset typography switcher */
export function FontSwitcher() {
  const fontId = useUI((s) => s.fontId);
  const setFont = useUI((s) => s.setFont);
  const active = FONTS.find((f) => f.id === fontId) ?? FONTS[0];
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button size="sm" aria-label="Typography">
            <span className="f-display text-[15px] leading-none font-semibold">Aa</span>
            <span className="hidden max-w-28 truncate xl:inline">{active.name}</span>
            <ChevronDown size={13} className="text-[var(--lq-text-dim)]" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-[300px]">
        <div className="label mb-2">Typography</div>
        <ul className="flex flex-col gap-1">
          {FONTS.map((f) => {
            const on = f.id === fontId;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setFont(f.id)}
                  className={cn(
                    "press flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left",
                    on && "bg-[color-mix(in_srgb,var(--lq-accent)_16%,transparent)]",
                  )}
                >
                  <span
                    className="num flex size-10 flex-none items-center justify-center rounded-lg text-[20px] font-semibold"
                    style={{
                      fontFamily: f.display,
                      background: "color-mix(in srgb, var(--lq-text) 8%, transparent)",
                    }}
                  >
                    Aa
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{f.name}</span>
                    <span className="block truncate text-[11.5px] text-[var(--lq-text-dim)]" style={{ fontFamily: f.mono }}>
                      {f.blurb}
                    </span>
                  </span>
                  {on && <Check size={15} className="flex-none text-[var(--lq-accent)]" />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function Swatches({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex flex-none items-center">
      {colors.map((c, i) => (
        <span
          key={i}
          className="size-[18px] rounded-full"
          style={{
            background: c,
            marginLeft: i ? -6 : 0,
            boxShadow: "0 0 0 1.5px color-mix(in srgb, var(--lq-text) 22%, transparent)",
          }}
        />
      ))}
    </span>
  );
}

/* Control 3 — grouped 16-preset theme colour picker */
export function ColorPicker() {
  const themeId = useUI((s) => s.themeId);
  const setTheme = useUI((s) => s.setTheme);
  const active = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const groups = ["Theme Colors", "Curated Palettes"] as const;
  const dark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const tint = (t: (typeof THEMES)[number]) => (dark ? t.tintDark : t.tintLight);
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button size="sm" aria-label="Theme colors">
            <Palette size={14} />
            <Swatches colors={[active.primary, active.secondary, tint(active)]} />
            <ChevronDown size={13} className="text-[var(--lq-text-dim)]" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-[320px]">
        <ScrollArea className="h-[min(420px,60vh)]">
          <ScrollAreaViewport>
            <ScrollAreaContent className="pr-2">
              {groups.map((g) => (
                <div key={g} className="mb-3 last:mb-0">
                  <div className="label mb-1.5">{g}</div>
                  <ul className="grid grid-cols-1 gap-1">
                    {THEMES.filter((t) => t.group === g).map((t) => {
                      const on = t.id === themeId;
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => setTheme(t.id)}
                            className={cn(
                              "press flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left",
                              on && "bg-[color-mix(in_srgb,var(--lq-accent)_16%,transparent)]",
                            )}
                          >
                            <Swatches colors={[t.primary, t.secondary, tint(t)]} />
                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{t.name}</span>
                            {on && <Check size={15} className="flex-none text-[var(--lq-accent)]" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </ScrollAreaContent>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
