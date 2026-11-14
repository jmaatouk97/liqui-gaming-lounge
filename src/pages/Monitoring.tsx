import { useState } from "react";
import { Cpu, Download, Lock, Power, RefreshCw, Thermometer } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Kpi, LiveDot, PageHeader, Panel, Row, SectionHead, Scroll, chartAxis, statusTone, tooltipStyle, type Tone } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter";
import { Progress, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/ui/progress";
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/ui/preview-card";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxInputGroup, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { useToast } from "@/components/ui/toast";
import { alerts, specs, ZONES, type Station } from "@/data";
import { useApp } from "@/store";
import { cn } from "@/lib/utils";

const sevTone: Record<string, Tone> = { critical: "bad", warning: "warn", info: "info" };

function Metric({ label, value, unit, pct }: { label: string; value: number; unit: string; pct: number }) {
  const hot = pct > 85;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="label !text-[10px]">{label}</span>
        <span className={cn("f-mono font-semibold", hot && "text-[var(--lq-danger-text)]")}>
          {value}
          {unit}
        </span>
      </div>
      <Meter value={pct}>
        <MeterTrack className="h-2">
          <MeterIndicator
            className={
              hot
                ? "bg-[color-mix(in_srgb,var(--lq-danger)_80%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--theme-secondary)_80%,transparent)]"
            }
          />
        </MeterTrack>
      </Meter>
    </div>
  );
}

function Node({ s, onOpen, update }: { s: Station; onOpen: () => void; update?: number }) {
  const t = s.telemetry;
  const online = s.status !== "maintenance";
  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={
          <button type="button" onClick={onOpen} style={{ textDecoration: "none", color: "inherit" }} className="press row-flat flex flex-col gap-2 p-3 text-left">
            <span className="flex items-center justify-between">
              <span className="f-mono text-[13px] font-semibold">{s.id}</span>
              {s.status === "in-use" ? <LiveDot tone="accent" /> : <Badge dot tone={statusTone[s.status]}>{""}</Badge>}
            </span>
            {online ? (
              <>
                <Metric label="CPU" value={t.cpu} unit="%" pct={t.cpu} />
                <Metric label="GPU" value={t.gpu} unit="%" pct={t.gpu} />
                {update !== undefined && (
                  <span className="f-mono text-[11px] text-[var(--lq-accent)]">Updating {Math.round(update)}%</span>
                )}
              </>
            ) : (
              <span className="py-3 text-[12px] text-[var(--lq-text-dim)]">Offline</span>
            )}
          </button>
        }
      />
      <PreviewCardContent>
        <div className="f-mono grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
          <span className="text-[var(--lq-text-dim)]">Ping</span>
          <span className="text-right">{t.ping} ms</span>
          <span className="text-[var(--lq-text-dim)]">FPS</span>
          <span className="text-right">{t.fps}</span>
          <span className="text-[var(--lq-text-dim)]">RAM</span>
          <span className="text-right">{t.ram}%</span>
          <span className="text-[var(--lq-text-dim)]">Uptime</span>
          <span className="text-right">{t.uptime}</span>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  );
}

export default function Monitoring() {
  const { stations, net, updates, pushUpdate, restartStation } = useApp();
  const toast = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState("grid");
  const [pick, setPick] = useState<string | null>(null);
  const open = stations.find((s) => s.id === openId) ?? null;
  const online = stations.filter((s) => s.status !== "maintenance");
  const avgPing = Math.round(online.reduce((n, s) => n + s.telemetry.ping, 0) / online.length);
  const avgGpu = Math.round(online.reduce((n, s) => n + s.telemetry.gpu, 0) / online.length);
  const last = net[net.length - 1];
  const updating = Object.keys(updates);
  const avgUpdate = updating.length ? updating.reduce((n, k) => n + updates[k], 0) / updating.length : 0;

  return (
    <div>
      <PageHeader
        title="Monitoring"
        right={
          <Toolbar aria-label="Fleet actions">
            <ToolbarGroup>
              <ToolbarButton
                onClick={() => {
                  pushUpdate(online.map((s) => s.id));
                  toast.add({ title: "Update queued", description: `${online.length} stations` });
                }}
              >
                <Download size={14} /> Push Update
              </ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => toast.add({ title: "Locked", description: "Idle stations" })}>
                <Lock size={14} /> Lock Idle
              </ToolbarButton>
              <ToolbarButton onClick={() => toast.add({ title: "Rescan started", description: "Fleet" })}>
                <RefreshCw size={14} /> Rescan
              </ToolbarButton>
            </ToolbarGroup>
          </Toolbar>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Online" value={`${online.length}/${stations.length}`} foot="Nodes" icon={<Power size={16} />} />
        <Kpi label="Avg GPU" value={`${avgGpu}%`} foot="Fleet" icon={<Cpu size={16} />} />
        <Kpi label="Avg Ping" value={`${avgPing}ms`} foot="LAN" icon={<RefreshCw size={16} />} />
        <Kpi label="Alerts" value={alerts.filter((a) => a.severity !== "info").length} foot="Open" icon={<Thermometer size={16} />} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <SectionHead
            title="Network"
            right={
              <span className="f-mono flex items-center gap-3 text-[12px]">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: "var(--theme-secondary)" }} />↓ {last.down} Mb
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: "color-mix(in srgb, var(--lq-text) 45%, transparent)" }} />↑ {last.up} Mb
                </span>
              </span>
            }
          />
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={net} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="color-mix(in srgb, var(--lq-text) 8%, transparent)" />
                <XAxis dataKey="t" hide />
                <YAxis {...chartAxis} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="down" stroke="var(--theme-secondary)" strokeWidth={2.2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="up" stroke="color-mix(in srgb, var(--lq-text) 45%, transparent)" strokeWidth={1.6} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <SectionHead title="Rollout" />
          {updating.length ? (
            <Progress value={avgUpdate}>
              <div className="flex items-center justify-between">
                <ProgressLabel>Client v4.2</ProgressLabel>
                <ProgressValue>{(_f, v) => `${Math.round(v ?? 0)}%`}</ProgressValue>
              </div>
              <ProgressTrack />
            </Progress>
          ) : (
            <div className="py-6 text-center text-[13px] text-[var(--lq-text-dim)]">Idle</div>
          )}
          <div className="mt-4">
            <div className="label mb-1.5">Target</div>
            <Combobox items={stations.map((s) => s.id)} value={pick} onValueChange={(v) => setPick(v as string | null)}>
              <ComboboxInputGroup>
                <ComboboxInput aria-label="Station" placeholder="Station" />
              </ComboboxInputGroup>
              <ComboboxContent>
                <ComboboxEmpty>No match</ComboboxEmpty>
                <ComboboxList>
                  {(id: string) => (
                    <ComboboxItem key={id} value={id}>
                      {id}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Button
              variant="accent"
              size="sm"
              className="mt-2 w-full"
              disabled={!pick}
              onClick={() => {
                if (pick) {
                  pushUpdate([pick]);
                  toast.add({ title: "Update queued", description: pick });
                }
              }}
            >
              Push Update
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="mt-3">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList className="mb-4 max-w-[420px]">
            <TabsIndicator />
            <TabsTab value="grid">Telemetry</TabsTab>
            <TabsTab value="alerts">Alerts</TabsTab>
            <TabsTab value="inventory">Systems</TabsTab>
          </TabsList>
          <TabsPanel value="grid">
            {ZONES.map((z) => (
              <div key={z} className="mb-4 last:mb-0">
                <div className="label mb-2">{z}</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                  {stations
                    .filter((s) => s.zone === z)
                    .map((s) => (
                      <Node key={s.id} s={s} onOpen={() => setOpenId(s.id)} update={updates[s.id]} />
                    ))}
                </div>
              </div>
            ))}
          </TabsPanel>
          <TabsPanel value="alerts">
            <div className="flex flex-col gap-1.5">
              {alerts.map((a) => (
                <Row key={a.id} className="flex-wrap">
                  <Badge tone={sevTone[a.severity]}>{a.severity}</Badge>
                  <span className="f-mono w-16 text-[12px] font-semibold">{a.station}</span>
                  <span className="w-20 text-[12.5px] font-medium">{a.kind}</span>
                  <span className="min-w-[160px] flex-1 truncate text-[13px] text-[var(--lq-text-dim)]">{a.message}</span>
                  <span className="f-mono text-[11.5px] text-[var(--lq-text-dim)]">{a.at}</span>
                  <Button size="sm" onClick={() => toast.add({ title: "Acknowledged", description: a.station })}>
                    Ack
                  </Button>
                </Row>
              ))}
            </div>
          </TabsPanel>
          <TabsPanel value="inventory">
            <Scroll className="max-h-[380px]">
              <div className="min-w-[640px] pr-2">
                <div className="label grid grid-cols-[80px_1.2fr_1fr_1fr_1fr_1fr] gap-3 px-3 pb-2">
                  <span>Node</span>
                  <span>CPU</span>
                  <span>GPU</span>
                  <span>RAM</span>
                  <span>Disk</span>
                  <span>OS</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {specs.map((s) => (
                    <div key={s.station} className="row-flat f-mono grid grid-cols-[80px_1.2fr_1fr_1fr_1fr_1fr] gap-3 px-3 py-2.5 text-[12px]">
                      <span className="font-semibold">{s.station}</span>
                      <span>{s.cpu}</span>
                      <span>{s.gpu}</span>
                      <span>{s.ram}</span>
                      <span>{s.storage}</span>
                      <span>{s.os}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Scroll>
          </TabsPanel>
        </Tabs>
      </Panel>

      <Drawer open={!!open} onOpenChange={(o) => !o && setOpenId(null)} swipeDirection="right">
        <DrawerContent side="right">
          {open && (
            <DrawerBody className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <DrawerTitle className="f-display text-[22px]">{open.id}</DrawerTitle>
                  <DrawerDescription className="f-mono text-[12px]">{open.spec}</DrawerDescription>
                </div>
                <Badge tone={statusTone[open.status]}>{open.status.replace("-", " ")}</Badge>
              </div>
              <div className="flex flex-col gap-3">
                <Metric label="CPU" value={open.telemetry.cpu} unit="%" pct={open.telemetry.cpu} />
                <Metric label="GPU" value={open.telemetry.gpu} unit="%" pct={open.telemetry.gpu} />
                <Metric label="RAM" value={open.telemetry.ram} unit="%" pct={open.telemetry.ram} />
                <Metric label="Disk" value={open.telemetry.disk} unit="%" pct={open.telemetry.disk} />
              </div>
              <div className="f-mono grid grid-cols-3 gap-2 text-center">
                {[
                  ["Ping", `${open.telemetry.ping}ms`],
                  ["FPS", String(open.telemetry.fps)],
                  ["Up", open.telemetry.uptime],
                ].map(([k, v]) => (
                  <div key={k} className="row-flat p-2.5">
                    <div className="label !text-[10px]">{k}</div>
                    <div className="mt-0.5 text-[14px] font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <Button
                  variant="accent"
                  onClick={() => {
                    pushUpdate([open.id]);
                    toast.add({ title: "Update queued", description: open.id });
                  }}
                >
                  Push Update
                </Button>
                <Button
                  onClick={() => {
                    restartStation(open.id);
                    toast.add({ title: "Restarting", description: open.id });
                  }}
                >
                  <Power size={14} /> Restart
                </Button>
                <DrawerClose render={<Button>Close</Button>} />
              </div>
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
