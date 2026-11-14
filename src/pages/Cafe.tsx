import { useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingBag, Trash2, Wrench } from "lucide-react";
import { Badge, Empty, LiveDot, PageHeader, Panel, Row, SectionHead, Scroll, statusTone, usd } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsIndicator, TabsList, TabsTab } from "@/components/ui/tabs";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Switch, SwitchLabel } from "@/components/ui/switch";
import { Field, FieldLabel } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { products, ZONES, type Station } from "@/data";
import { cartTotal, useApp } from "@/store";
import { fmtClock, useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const CATS = ["All", "Gaming", "Hot Drinks", "Cold Drinks", "Snacks", "Meals"];

export default function Cafe() {
  const mode = useApp((s) => s.cafeMode);
  const setMode = useApp((s) => s.setCafeMode);
  return (
    <div>
      <PageHeader
        title="Cafe & Floor"
        right={
          <Tabs value={mode} onValueChange={(v) => setMode(v as "pos" | "floor")} className="w-[190px]">
            <TabsList>
              <TabsIndicator />
              <TabsTab value="pos">POS</TabsTab>
              <TabsTab value="floor">Floor</TabsTab>
            </TabsList>
          </Tabs>
        }
      />
      {mode === "pos" ? <Pos /> : <Floor />}
    </div>
  );
}

/* ───────────────────────── POS ───────────────────────── */
function Pos() {
  const { activeCategory, setCategory, cafeQuery, setCafeQuery, cart, addItem, decItem, removeLine, clearCart, cartTarget, setCartTarget, checkout } = useApp();
  const stations = useApp((s) => s.stations);
  const toast = useToast();
  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (activeCategory === "All" || p.category === activeCategory) &&
          p.name.toLowerCase().includes(cafeQuery.toLowerCase()),
      ),
    [activeCategory, cafeQuery],
  );
  const total = cartTotal(cart);
  const targets = [
    { label: "Counter", value: "counter" },
    ...stations.filter((s) => s.status === "in-use").map((s) => ({ label: `${s.id} · ${s.member}`, value: s.id })),
  ];

  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
      <Panel>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ToggleGroup
            value={[activeCategory]}
            onValueChange={(v) => v[0] && setCategory(v[0])}
            className="max-w-full overflow-x-auto"
            aria-label="Category"
          >
            {CATS.map((c) => (
              <Toggle key={c} value={c} className="px-3 text-[12.5px]">
                {c}
              </Toggle>
            ))}
          </ToggleGroup>
          <Input
            aria-label="Search products"
            placeholder="Search"
            value={cafeQuery}
            onChange={(e) => setCafeQuery(e.target.value)}
            start={<Search size={15} />}
            className="ml-auto w-full sm:w-[200px]"
          />
        </div>
        {list.length === 0 ? (
          <Empty>No items</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-4">
            {list.map((p) => {
              const low = p.stock <= 10;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItem(p.id)}
                  className="press row-flat flex min-h-[88px] flex-col justify-between p-3 text-left"
                >
                  <span className="text-[13.5px] leading-tight font-semibold">{p.name}</span>
                  <span className="flex items-end justify-between">
                    <span className="f-mono text-[15px] font-semibold">{usd(p.price)}</span>
                    {low ? (
                      <Badge tone="warn">{p.stock} left</Badge>
                    ) : (
                      <span className="f-mono text-[11px] text-[var(--lq-text-dim)]">{p.stock}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel className="xl:sticky xl:top-0 xl:self-start">
        <SectionHead
          title="Cart"
          right={
            cart.length > 0 && (
              <Button size="sm" onClick={clearCart}>
                <Trash2 size={13} /> Clear
              </Button>
            )
          }
        />
        <Field className="mb-3">
          <FieldLabel>Charge to</FieldLabel>
          <Select
            items={targets}
            value={cartTarget ?? "counter"}
            onValueChange={(v) => setCartTarget(v === "counter" ? null : (v as string))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {targets.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-[var(--lq-text-dim)]">
            <ShoppingBag size={24} />
            <span className="text-[13px]">Empty</span>
          </div>
        ) : (
          <Scroll className="max-h-[300px]">
            <div className="flex flex-col gap-1.5 pr-2">
              {cart.map((l) => {
                const p = products.find((x) => x.id === l.productId)!;
                return (
                  <Row key={l.productId} className="gap-2">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{p.name}</span>
                    <button type="button" aria-label="Decrease" onClick={() => decItem(l.productId)} className="press flex size-6 items-center justify-center rounded-lg">
                      <Minus size={13} />
                    </button>
                    <span className="f-mono w-5 text-center text-[13px]">{l.qty}</span>
                    <button type="button" aria-label="Increase" onClick={() => addItem(l.productId)} className="press flex size-6 items-center justify-center rounded-lg">
                      <Plus size={13} />
                    </button>
                    <span className="f-mono w-14 text-right text-[12.5px] font-semibold">{usd(p.price * l.qty)}</span>
                    <button type="button" aria-label="Remove" onClick={() => removeLine(l.productId)} className="press flex size-6 items-center justify-center rounded-lg text-[var(--lq-text-dim)]">
                      <Trash2 size={13} />
                    </button>
                  </Row>
                );
              })}
            </div>
          </Scroll>
        )}
        <div className="hair mt-4 flex items-end justify-between border-t pt-3">
          <span className="label">Total</span>
          <span className="f-display num text-[28px] leading-none font-bold">{usd(total)}</span>
        </div>
        <Button
          variant="accent"
          className="mt-3 w-full"
          disabled={cart.length === 0}
          onClick={() => {
            const r = checkout();
            toast.add({ title: "Order placed", description: `${r.count} items · ${usd(r.total)}${r.target ? ` → ${r.target}` : ""}` });
          }}
        >
          Checkout
        </Button>
      </Panel>
    </div>
  );
}

/* ───────────────────────── Floor ───────────────────────── */
function Floor() {
  const stations = useApp((s) => s.stations);
  const [openId, setOpenId] = useState<string | null>(null);
  const station = stations.find((s) => s.id === openId) ?? null;
  const counts = {
    "in-use": stations.filter((s) => s.status === "in-use").length,
    available: stations.filter((s) => s.status === "available").length,
    reserved: stations.filter((s) => s.status === "reserved").length,
    maintenance: stations.filter((s) => s.status === "maintenance").length,
  };
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
          <Badge key={k} tone={statusTone[k]}>
            <span className="capitalize">{k.replace("-", " ")}</span>
            <span className="f-mono">{counts[k]}</span>
          </Badge>
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {ZONES.map((zone, zi) => (
          <Panel key={zone} className={zi === 0 ? "xl:col-span-2" : ""}>
            <SectionHead title={zone} />
            <div className={cn("grid gap-2", zone === "Main Hall" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6" : "grid-cols-2 sm:grid-cols-3")}>
              {stations
                .filter((s) => s.zone === zone)
                .map((s) => (
                  <StationTile key={s.id} s={s} onOpen={() => setOpenId(s.id)} />
                ))}
            </div>
          </Panel>
        ))}
      </div>
      <StationDrawer station={station} onClose={() => setOpenId(null)} />
    </>
  );
}

function StationTile({ s, onOpen }: { s: Station; onOpen: () => void }) {
  const now = useNow();
  const { extendSession, endSession, setMaintenance, startSession } = useApp();
  const left = s.endsAt ? s.endsAt - now : 0;
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <button type="button" onClick={onOpen} className="press row-flat flex min-h-[92px] flex-col justify-between p-3 text-left">
            <span className="flex items-center justify-between">
              <span className="f-mono text-[13px] font-semibold">{s.id}</span>
              {s.status === "in-use" ? (
                <LiveDot tone="accent" />
              ) : (
                <span
                  className="size-2 rounded-full"
                  style={{ background: s.status === "available" ? "#22c55e" : s.status === "reserved" ? "#f59e0b" : "var(--lq-danger)" }}
                />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] text-[var(--lq-text-dim)]">
                {s.member ?? (s.status === "maintenance" ? "Offline" : s.status === "reserved" ? "Reserved" : "Free")}
              </span>
              {s.status === "in-use" && <span className="f-mono text-[14px] font-semibold">{fmtClock(left)}</span>}
            </span>
          </button>
        }
      />
      <ContextMenuContent>
        {s.status === "in-use" ? (
          <>
            <ContextMenuItem onClick={() => extendSession(s.id, 30)}>Extend 30m</ContextMenuItem>
            <ContextMenuItem onClick={() => extendSession(s.id, 60)}>Extend 1h</ContextMenuItem>
            <ContextMenuItem variant="danger" onClick={() => endSession(s.id)}>
              End session
            </ContextMenuItem>
          </>
        ) : s.status !== "maintenance" ? (
          <ContextMenuItem onClick={() => startSession(s.id, 60)}>Start 1h</ContextMenuItem>
        ) : null}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => setMaintenance(s.id, s.status !== "maintenance")}>
          <Wrench size={14} /> {s.status === "maintenance" ? "Return to service" : "Maintenance"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

const DURATIONS = [
  { label: "1 hour", value: "60" },
  { label: "2 hours", value: "120" },
  { label: "3 hours", value: "180" },
  { label: "5 hours", value: "300" },
];

function StationDrawer({ station, onClose }: { station: Station | null; onClose: () => void }) {
  const now = useNow();
  const toast = useToast();
  const members = useApp((s) => s.members);
  const { startSession, extendSession, endSession, setMaintenance, setCartTarget, setCafeMode } = useApp();
  const [dur, setDur] = useState("60");
  const [who, setWho] = useState("Walk-in");
  const memberItems = [
    { label: "Walk-in", value: "Walk-in" },
    ...members.filter((m) => m.status !== "banned").map((m) => ({ label: m.name, value: m.name })),
  ];
  const s = station;
  return (
    <Drawer open={!!s} onOpenChange={(o) => !o && onClose()} swipeDirection="right">
      <DrawerContent side="right">
        {s && (
          <DrawerBody className="flex h-full flex-col gap-4 p-5">
            <div className="flex items-start justify-between">
              <div>
                <DrawerTitle className="f-display text-[22px]">{s.id}</DrawerTitle>
                <DrawerDescription className="f-mono text-[12px]">{s.spec}</DrawerDescription>
              </div>
              <Badge tone={statusTone[s.status]}>{s.status.replace("-", " ")}</Badge>
            </div>

            {s.status === "in-use" ? (
              <>
                <div className="row-flat p-4 text-center">
                  <div className="label">Remaining</div>
                  <div className="f-mono mt-1 text-[34px] leading-none font-semibold">{fmtClock((s.endsAt ?? now) - now)}</div>
                  <div className="mt-2 text-[12.5px] text-[var(--lq-text-dim)]">{s.member}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => extendSession(s.id, 30)}>+30m</Button>
                  <Button onClick={() => extendSession(s.id, 60)}>+1h</Button>
                </div>
                <Button
                  onClick={() => {
                    setCartTarget(s.id);
                    setCafeMode("pos");
                    onClose();
                  }}
                >
                  Order food
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    endSession(s.id);
                    toast.add({ title: "Session ended", description: s.id });
                    onClose();
                  }}
                >
                  End session
                </Button>
              </>
            ) : s.status === "maintenance" ? null : (
              <>
                <Field>
                  <FieldLabel>Member</FieldLabel>
                  <Select items={memberItems} value={who} onValueChange={(v) => setWho(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {memberItems.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Duration</FieldLabel>
                  <Select items={DURATIONS} value={dur} onValueChange={(v) => setDur(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Button
                  variant="accent"
                  onClick={() => {
                    startSession(s.id, Number(dur), who);
                    toast.add({ title: "Session started", description: `${s.id} · ${who}` });
                    onClose();
                  }}
                >
                  Start Session
                </Button>
              </>
            )}

            <div className="mt-auto flex flex-col gap-3">
              <SwitchLabel>
                Maintenance
                <Switch checked={s.status === "maintenance"} onCheckedChange={(c) => setMaintenance(s.id, c)} />
              </SwitchLabel>
              <DrawerClose render={<Button>Close</Button>} />
            </div>
          </DrawerBody>
        )}
      </DrawerContent>
    </Drawer>
  );
}
