import { forwardRef, type ReactNode } from "react";
import { LiquiGlass, type LiquiGlassProps } from "@liqui-design/glass";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area";

export const usd = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });
export const usd0 = (n: number) => usd(n, 0);

/** Glass panel — the one refractive layer. Inner rows stay flat. */
export const Panel = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string; pad?: string; glass?: Partial<LiquiGlassProps> }
>(function Panel({ children, className, pad = "p-4", glass }, ref) {
  return (
    <LiquiGlass
      ref={ref}
      radius={22}
      blur={1}
      refraction={70}
      bezel={20}
      frost={0.5}
      {...glass}
      className={cn("min-w-0", className)}
      contentClassName={cn("size-full rounded-[inherit]", pad)}
    >
      {children}
    </LiquiGlass>
  );
});

export function SectionHead({
  title,
  right,
  className,
}: {
  title: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex min-h-8 items-center justify-between gap-3", className)}>
      <h3 className="f-display text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>
      {right}
    </div>
  );
}

export function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="f-display text-[26px] leading-none font-bold tracking-[-0.02em]">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}

export function Trend({ value, up = true }: { value: string; up?: boolean }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-0.5 text-[12px] font-semibold",
        up ? "text-emerald-500" : "text-[var(--lq-danger-text)]",
      )}
    >
      <Icon size={14} strokeWidth={2.4} />
      {value}
    </span>
  );
}

export type Tone = "ok" | "warn" | "bad" | "info" | "idle" | "accent";
const TONE: Record<Tone, string> = {
  ok: "#22c55e",
  warn: "#f59e0b",
  bad: "var(--lq-danger)",
  info: "var(--theme-secondary)",
  idle: "color-mix(in srgb, var(--lq-text) 40%, transparent)",
  accent: "var(--lq-accent)",
};

export function Badge({ tone = "idle", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[11px] leading-none font-semibold whitespace-nowrap"
      style={{
        background: `color-mix(in srgb, ${TONE[tone]} 16%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${TONE[tone]} 28%, transparent)`,
      }}
    >
      {dot && <span className="size-1.5 rounded-full" style={{ background: TONE[tone] }} />}
      {children}
    </span>
  );
}

export function LiveDot({ tone = "ok" }: { tone?: Tone }) {
  return <span className="live-dot inline-block size-2 rounded-full" style={{ background: TONE[tone] }} />;
}

export const statusTone: Record<string, Tone> = {
  available: "ok",
  "in-use": "accent",
  reserved: "warn",
  maintenance: "bad",
};

export function Kpi({
  label,
  value,
  foot,
  trend,
  icon,
}: {
  label: string;
  value: ReactNode;
  foot?: ReactNode;
  trend?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Panel pad="p-4" className="h-full">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <span className="text-[var(--lq-text-dim)]">{icon}</span>
      </div>
      <div className="f-display num mt-2 text-[30px] leading-none font-bold tracking-[-0.02em]">{value}</div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[12px] text-[var(--lq-text-dim)]">
        <span className="num truncate">{foot}</span>
        {trend}
      </div>
    </Panel>
  );
}

/** Overlay-scroll wrapper using the liqui ScrollArea. */
export function Scroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ScrollArea className={cn("min-h-0 min-w-0", className)}>
      <ScrollAreaViewport>
        <ScrollAreaContent>{children}</ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="py-8 text-center text-[13px] text-[var(--lq-text-dim)]">{children}</div>;
}

/** Horizontal data row used in lists/tables — flat, translucent. */
export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("row-flat flex items-center gap-3 px-3 py-2.5", className)}>{children}</div>;
}

export const chartAxis = {
  stroke: "color-mix(in srgb, var(--lq-text) 45%, transparent)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const tooltipStyle = {
  contentStyle: {
    background: "var(--lq-tint)",
    backdropFilter: "blur(18px)",
    border: "1px solid var(--lq-rim-lo)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--lq-text)",
    boxShadow: "var(--lq-shadow)",
  },
  labelStyle: { color: "var(--lq-text-dim)", fontWeight: 600 },
  itemStyle: { color: "var(--lq-text)" },
  cursor: { stroke: "color-mix(in srgb, var(--lq-text) 25%, transparent)" },
} as const;
