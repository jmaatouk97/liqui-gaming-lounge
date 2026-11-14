import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Coffee, DollarSign, Monitor, Timer, TriangleAlert } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Kpi, Panel, PageHeader, Row, SectionHead, Scroll, Trend, chartAxis, tooltipStyle, usd, usd0, type Tone } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/ui/meter";
import { Tabs, TabsIndicator, TabsList, TabsTab } from "@/components/ui/tabs";
import { activity as _a, alerts, hourlyRevenue, revenueSeries, topProducts, ZONES } from "@/data";
import { useApp } from "@/store";

void _a;
const sevTone: Record<string, Tone> = { critical: "bad", warning: "warn", info: "info" };

export default function Overview() {
  const navigate = useNavigate();
  const stations = useApp((s) => s.stations);
  const orders = useApp((s) => s.orders);
  const revenue = useApp((s) => s.revenueToday);
  const activity = useApp((s) => s.activity);
  const [range, setRange] = useState("14");
  const [view, setView] = useState("daily");
  const live = stations.filter((s) => s.status === "in-use").length;
  const series = revenueSeries.slice(-Number(range));

  return (
    <div>
      <PageHeader
        title="Overview"
        right={
          <>
            <Tabs value={range} onValueChange={(v) => setRange(String(v))} className="w-[150px]">
              <TabsList>
                <TabsIndicator />
                <TabsTab value="7">7D</TabsTab>
                <TabsTab value="14">14D</TabsTab>
              </TabsList>
            </Tabs>
            <Button variant="accent" size="sm" onClick={() => navigate("/cafe")}>
              Start Session
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Revenue" value={usd0(revenue)} foot="vs $3,812" trend={<Trend value="12.4%" />} icon={<DollarSign size={16} />} />
        <Kpi label="Active Stations" value={`${live}/${stations.length}`} foot={`${Math.round((live / stations.length) * 100)}% load`} trend={<Trend value="8.1%" />} icon={<Monitor size={16} />} />
        <Kpi label="Cafe Orders" value={orders} foot="Today" trend={<Trend value="5.6%" />} icon={<Coffee size={16} />} />
        <Kpi label="Avg Session" value="3h 42m" foot="Peak 18–22" trend={<Trend value="2.3%" up={false} />} icon={<Timer size={16} />} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <SectionHead
            title="Revenue"
            right={
              <Tabs value={view} onValueChange={(v) => setView(String(v))} className="w-[170px]">
                <TabsList>
                  <TabsIndicator />
                  <TabsTab value="daily">Daily</TabsTab>
                  <TabsTab value="hourly">Hourly</TabsTab>
                </TabsList>
              </Tabs>
            }
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              {view === "daily" ? (
                <AreaChart data={series} margin={{ left: -12, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-secondary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--theme-secondary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="color-mix(in srgb, var(--lq-text) 8%, transparent)" />
                  <XAxis dataKey="day" {...chartAxis} />
                  <YAxis {...chartAxis} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip {...tooltipStyle} formatter={(v) => usd0(Number(v))} />
                  <Area isAnimationActive={false} type="monotone" dataKey="expenses" stroke="color-mix(in srgb, var(--lq-text) 40%, transparent)" strokeWidth={1.5} fill="none" />
                  <Area isAnimationActive={false} type="monotone" dataKey="revenue" stroke="var(--theme-secondary)" strokeWidth={2.2} fill="url(#rev)" />
                </AreaChart>
              ) : (
                <BarChart data={hourlyRevenue} margin={{ left: -12, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} stroke="color-mix(in srgb, var(--lq-text) 8%, transparent)" />
                  <XAxis dataKey="hour" {...chartAxis} />
                  <YAxis {...chartAxis} />
                  <Tooltip {...tooltipStyle} formatter={(v) => usd0(Number(v))} />
                  <Bar isAnimationActive={false} dataKey="revenue" fill="var(--theme-secondary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Zones" right={<Badge tone="ok">Live</Badge>} />
          <div className="flex flex-col gap-4">
            {ZONES.map((zone) => {
              const nodes = stations.filter((s) => s.zone === zone);
              const busy = nodes.filter((s) => s.status === "in-use").length;
              const pct = Math.round((busy / nodes.length) * 100);
              return (
                <Meter key={zone} value={pct}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <MeterLabel className="text-[13px] font-semibold">{zone}</MeterLabel>
                    <MeterValue className="f-mono">{() => `${busy}/${nodes.length}`}</MeterValue>
                  </div>
                  <MeterTrack>
                    <MeterIndicator className="bg-[color-mix(in_srgb,var(--theme-secondary)_80%,transparent)]" />
                  </MeterTrack>
                </Meter>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-4 gap-1.5">
            {stations.map((s) => (
              <span
                key={s.id}
                title={`${s.id} · ${s.status}`}
                className="h-5 rounded-md"
                style={{
                  background:
                    s.status === "in-use"
                      ? "color-mix(in srgb, var(--theme-secondary) 70%, transparent)"
                      : s.status === "maintenance"
                        ? "color-mix(in srgb, var(--lq-danger) 60%, transparent)"
                        : s.status === "reserved"
                          ? "color-mix(in srgb, #f59e0b 55%, transparent)"
                          : "color-mix(in srgb, var(--lq-text) 12%, transparent)",
                }}
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel>
          <SectionHead title="Activity" right={<Activity size={16} className="text-[var(--lq-text-dim)]" />} />
          <Scroll className="h-[300px]">
            <div className="flex flex-col gap-1.5 pr-2">
              {activity.map((a) => (
                <Row key={a.id}>
                  <span className="f-mono w-14 flex-none text-[12px] font-semibold">{a.station}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px]">{a.detail}</span>
                  <span className="f-mono flex-none text-[12px] text-[var(--lq-text-dim)]">{a.amount ? usd(a.amount) : "—"}</span>
                  <span className="f-mono w-8 flex-none text-right text-[11px] text-[var(--lq-text-dim)]">{a.at}</span>
                </Row>
              ))}
            </div>
          </Scroll>
        </Panel>

        <Panel>
          <SectionHead
            title="Alerts"
            right={
              <Button size="sm" onClick={() => navigate("/monitoring")}>
                View <ArrowRight size={13} />
              </Button>
            }
          />
          <div className="flex flex-col gap-1.5">
            {alerts.slice(0, 5).map((a) => (
              <Row key={a.id}>
                <TriangleAlert size={15} className="flex-none text-[var(--lq-text-dim)]" />
                <span className="f-mono w-14 flex-none text-[12px] font-semibold">{a.station}</span>
                <span className="min-w-0 flex-1 truncate text-[13px]">{a.kind}</span>
                <Badge tone={sevTone[a.severity]}>{a.severity}</Badge>
              </Row>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Top Sellers" />
          <div className="flex flex-col gap-1.5">
            {topProducts.map((p, i) => (
              <Row key={p.name}>
                <span className="f-mono w-5 flex-none text-[12px] text-[var(--lq-text-dim)]">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{p.name}</span>
                <span className="f-mono flex-none text-[12px] text-[var(--lq-text-dim)]">{p.units}u</span>
                <span className="f-mono w-16 flex-none text-right text-[12.5px] font-semibold">{usd0(p.revenue)}</span>
              </Row>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
