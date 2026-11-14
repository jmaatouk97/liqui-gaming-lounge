import { useMemo, useState } from "react";
import { PackagePlus, Plus, Search, TriangleAlert } from "lucide-react";
import { Badge, Empty, PageHeader, Panel, Scroll, usd, type Tone } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogActions, DialogContent, DialogDescription, DialogDismiss, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@/components/ui/number-field";
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/toast";
import type { InventoryItem } from "@/data";
import { useApp } from "@/store";

const CATS = ["All", "Cafe", "Hardware", "Supplies", "Merch"];
const STATUS = [
  { label: "All status", value: "all" },
  { label: "Low stock", value: "low" },
  { label: "Healthy", value: "ok" },
];
const catItems = CATS.slice(1).map((c) => ({ label: c, value: c }));

function health(i: InventoryItem): { tone: Tone; label: string } {
  if (i.stock <= i.reorder * 0.6) return { tone: "bad", label: "Critical" };
  if (i.stock <= i.reorder) return { tone: "warn", label: "Low" };
  return { tone: "ok", label: "OK" };
}

export default function Stock() {
  const stock = useApp((s) => s.stock);
  const restock = useApp((s) => s.restock);
  const addStockItem = useApp((s) => s.addStockItem);
  const toast = useToast();
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [qty, setQty] = useState<number | null>(12);
  const [newOpen, setNewOpen] = useState(false);
  const [nCat, setNCat] = useState("Cafe");

  const low = stock.filter((i) => i.stock <= i.reorder);
  const rows = useMemo(
    () =>
      stock.filter((i) => {
        const h = health(i).tone;
        return (
          (cat === "All" || i.category === cat) &&
          (status === "all" || (status === "low" ? h !== "ok" : h === "ok")) &&
          (i.name + i.sku).toLowerCase().includes(q.toLowerCase())
        );
      }),
    [stock, cat, status, q],
  );
  const value = stock.reduce((n, i) => n + i.stock * i.unitCost, 0);
  const allSel = rows.length > 0 && rows.every((r) => sel.includes(r.id));

  return (
    <div>
      <PageHeader
        title="Stock"
        right={
          <>
            <span className="f-mono text-[13px] text-[var(--lq-text-dim)]">Value {usd(value, 0)}</span>
            <Button variant="accent" size="sm" onClick={() => setNewOpen(true)}>
              <Plus size={14} /> New Item
            </Button>
          </>
        }
      />

      {low.length > 0 && (
        <Panel className="mb-3" pad="p-3">
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <span className="flex w-full items-center gap-2.5 text-[13.5px] font-semibold">
                <TriangleAlert size={16} className="text-amber-500" />
                {low.length} items below reorder
              </span>
            </CollapsibleTrigger>
            <CollapsiblePanel>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {low.map((i) => (
                  <button key={i.id} type="button" onClick={() => setRestockItem(i)} className="press row-flat f-mono px-2.5 py-1.5 text-[12px] font-semibold">
                    {i.sku} · {i.stock}/{i.reorder}
                  </button>
                ))}
              </div>
            </CollapsiblePanel>
          </Collapsible>
        </Panel>
      )}

      <Panel>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ToggleGroup value={[cat]} onValueChange={(v) => v[0] && setCat(v[0])} className="max-w-full overflow-x-auto" aria-label="Category">
            {CATS.map((c) => (
              <Toggle key={c} value={c} className="px-3 text-[12.5px]">
                {c}
              </Toggle>
            ))}
          </ToggleGroup>
          <Select items={STATUS} value={status} onValueChange={(v) => setStatus(v as string)}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input aria-label="Search stock" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} start={<Search size={15} />} className="ml-auto w-full sm:w-[200px]" />
        </div>

        {sel.length > 0 && (
          <div className="row-flat mb-2 flex items-center justify-between px-3 py-2">
            <span className="f-mono text-[12.5px]">{sel.length} selected</span>
            <Button
              size="sm"
              onClick={() => {
                toast.add({ title: "Purchase order drafted", description: `${sel.length} items` });
                setSel([]);
              }}
            >
              Draft PO
            </Button>
          </div>
        )}

        <Scroll className="max-h-[calc(100dvh-420px)] min-h-[280px]">
          <div className="min-w-[760px] pr-2">
            <div className="label grid grid-cols-[28px_1.6fr_110px_90px_1.1fr_90px_90px_90px] items-center gap-3 px-3 pb-2">
              <Checkbox aria-label="Select all" checked={allSel} onCheckedChange={(c) => setSel(c ? rows.map((r) => r.id) : [])} />
              <span>Item</span>
              <span>SKU</span>
              <span className="text-right">Stock</span>
              <span>Level</span>
              <span className="text-right">Cost</span>
              <span>Status</span>
              <span />
            </div>
            <div className="flex flex-col gap-1.5">
              {rows.map((i) => {
                const h = health(i);
                const pct = Math.min(100, Math.round((i.stock / (i.reorder * 2)) * 100));
                return (
                  <div key={i.id} className="row-flat grid grid-cols-[28px_1.6fr_110px_90px_1.1fr_90px_90px_90px] items-center gap-3 px-3 py-2.5">
                    <Checkbox
                      aria-label={`Select ${i.name}`}
                      checked={sel.includes(i.id)}
                      onCheckedChange={(c) => setSel((s) => (c ? [...s, i.id] : s.filter((x) => x !== i.id)))}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-semibold">{i.name}</div>
                      <div className="truncate text-[11.5px] text-[var(--lq-text-dim)]">{i.supplier}</div>
                    </div>
                    <span className="f-mono text-[12px]">{i.sku}</span>
                    <span className="f-mono text-right text-[13px] font-semibold">{i.stock}</span>
                    <Meter value={pct}>
                      <MeterTrack className="h-2.5">
                        <MeterIndicator className="bg-[color-mix(in_srgb,var(--theme-secondary)_80%,transparent)]" />
                      </MeterTrack>
                    </Meter>
                    <span className="f-mono text-right text-[12.5px]">{usd(i.unitCost)}</span>
                    <Badge tone={h.tone}>{h.label}</Badge>
                    <Button size="sm" onClick={() => { setRestockItem(i); setQty(Math.max(i.reorder, 6)); }}>
                      Restock
                    </Button>
                  </div>
                );
              })}
              {rows.length === 0 && <Empty>No items</Empty>}
            </div>
          </div>
        </Scroll>
      </Panel>

      <Dialog open={!!restockItem} onOpenChange={(o) => !o && setRestockItem(null)}>
        <DialogContent>
          <DialogDismiss />
          <DialogTitle>Restock</DialogTitle>
          <DialogDescription>{restockItem?.name}</DialogDescription>
          <div className="mt-4">
            <NumberField value={qty} onValueChange={setQty} min={1} max={500}>
              <NumberFieldGroup>
                <NumberFieldDecrement />
                <NumberFieldInput aria-label="Quantity" />
                <NumberFieldIncrement />
              </NumberFieldGroup>
            </NumberField>
          </div>
          <DialogActions>
            <Button onClick={() => setRestockItem(null)}>Cancel</Button>
            <Button
              variant="accent"
              onClick={() => {
                if (restockItem && qty) {
                  restock(restockItem.id, qty);
                  toast.add({ title: "Restocked", description: `${restockItem.sku} +${qty}` });
                }
                setRestockItem(null);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogDismiss />
          <DialogTitle>
            <span className="inline-flex items-center gap-2">
              <PackagePlus size={17} /> New Item
            </span>
          </DialogTitle>
          <Form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const name = String(f.get("name") || "").trim();
              if (!name) return;
              addStockItem({
                id: `i${Date.now()}`,
                name,
                sku: String(f.get("sku") || "NEW-001").toUpperCase(),
                category: nCat as InventoryItem["category"],
                stock: 10,
                reorder: 8,
                unitCost: Number(f.get("cost") || 1),
                supplier: "Unassigned",
              });
              toast.add({ title: "Item added", description: name });
              setNewOpen(false);
            }}
          >
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input name="name" required placeholder="Item name" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>SKU</FieldLabel>
                <Input name="sku" placeholder="XX-000" />
              </Field>
              <Field>
                <FieldLabel>Unit cost</FieldLabel>
                <Input name="cost" type="number" step="0.01" placeholder="0.00" />
              </Field>
            </div>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select items={catItems} value={nCat} onValueChange={(v) => setNCat(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {catItems.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <DialogActions>
              <Button type="button" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent">
                Add Item
              </Button>
            </DialogActions>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
