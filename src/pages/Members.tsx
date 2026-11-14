import { useMemo, useState } from "react";
import { Plus, Search, Wallet } from "lucide-react";
import { Badge, Empty, Kpi, PageHeader, Panel, Scroll, usd, usd0, type Tone } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Autocomplete, AutocompleteContent, AutocompleteInput, AutocompleteInputGroup, AutocompleteItem, AutocompleteList } from "@/components/ui/autocomplete";
import { Dialog, DialogActions, DialogContent, DialogDismiss, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Checkbox, CheckboxLabel } from "@/components/ui/checkbox";
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@/components/ui/number-field";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import type { Member } from "@/data";
import { useApp } from "@/store";

const TIERS = ["All", "Platinum", "Gold", "Silver", "Bronze"];
const tierTone: Record<string, Tone> = { Platinum: "accent", Gold: "warn", Silver: "info", Bronze: "idle" };
const statusTone: Record<string, Tone> = { active: "ok", idle: "idle", banned: "bad" };
const PRESETS = [10, 20, 50, 100];
const initials = (n: string) => n.split(" ").map((x) => x[0]).join("").slice(0, 2);

export default function Members() {
  const members = useApp((s) => s.members);
  const topUp = useApp((s) => s.topUp);
  const addMember = useApp((s) => s.addMember);
  const toast = useToast();
  const [tier, setTier] = useState("All");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Member | null>(null);
  const [amount, setAmount] = useState<number | null>(20);
  const [newOpen, setNewOpen] = useState(false);
  const [nTier, setNTier] = useState("Bronze");

  const rows = useMemo(
    () =>
      members.filter(
        (m) =>
          (tier === "All" || m.tier === tier) &&
          (m.name + m.handle + m.id).toLowerCase().includes(q.toLowerCase()),
      ),
    [members, tier, q],
  );
  const live = active ? (members.find((m) => m.id === active.id) ?? active) : null;
  const total = members.reduce((n, m) => n + m.balance, 0);

  return (
    <div>
      <PageHeader
        title="Members"
        right={
          <Button variant="accent" size="sm" onClick={() => setNewOpen(true)}>
            <Plus size={14} /> New Member
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Members" value={members.length} foot="Registered" />
        <Kpi label="Active" value={members.filter((m) => m.status === "active").length} foot="Last 7 days" />
        <Kpi label="Balances" value={usd0(total)} foot="Prepaid" />
        <Kpi label="Platinum" value={members.filter((m) => m.tier === "Platinum").length} foot="Top tier" />
      </div>

      <Panel className="mt-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ToggleGroup value={[tier]} onValueChange={(v) => v[0] && setTier(v[0])} className="max-w-full overflow-x-auto" aria-label="Tier">
            {TIERS.map((t) => (
              <Toggle key={t} value={t} className="px-3 text-[12.5px]">
                {t}
              </Toggle>
            ))}
          </ToggleGroup>
          <div className="ml-auto w-full sm:w-[240px]">
            <Autocomplete items={members.map((m) => m.name)} value={q} onValueChange={(v) => setQ(v)}>
              <AutocompleteInputGroup>
                <Search size={15} className="flex-none text-[var(--lq-text-dim)]" />
                <AutocompleteInput aria-label="Search members" placeholder="Search" />
              </AutocompleteInputGroup>
              <AutocompleteContent>
                <AutocompleteList>
                  {(name: string) => (
                    <AutocompleteItem key={name} value={name}>
                      {name}
                    </AutocompleteItem>
                  )}
                </AutocompleteList>
              </AutocompleteContent>
            </Autocomplete>
          </div>
        </div>
        <Scroll className="max-h-[calc(100dvh-440px)] min-h-[300px]">
          <div className="min-w-[720px] pr-2">
            <div className="label grid grid-cols-[1.6fr_100px_100px_80px_90px_90px_100px] items-center gap-3 px-3 pb-2">
              <span>Member</span>
              <span>Tier</span>
              <span className="text-right">Balance</span>
              <span className="text-right">Hours</span>
              <span>Last</span>
              <span>Status</span>
              <span />
            </div>
            <div className="flex flex-col gap-1.5">
              {rows.map((m) => (
                <div key={m.id} className="row-flat grid grid-cols-[1.6fr_100px_100px_80px_90px_90px_100px] items-center gap-3 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size={34}>
                      <AvatarFallback>{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-semibold">{m.name}</div>
                      <div className="f-mono truncate text-[11.5px] text-[var(--lq-text-dim)]">
                        @{m.handle} · {m.id}
                      </div>
                    </div>
                  </div>
                  <Badge tone={tierTone[m.tier]}>{m.tier}</Badge>
                  <span className="f-mono text-right text-[13px] font-semibold">{usd(m.balance)}</span>
                  <span className="f-mono text-right text-[12.5px]">{m.hours}h</span>
                  <span className="text-[12px] text-[var(--lq-text-dim)]">{m.lastVisit}</span>
                  <Badge tone={statusTone[m.status]}>{m.status}</Badge>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button size="sm" disabled={m.status === "banned"} onClick={() => { setActive(m); setAmount(20); }}>
                          <Wallet size={13} /> Top up
                        </Button>
                      }
                    />
                    <TooltipContent>Add balance</TooltipContent>
                  </Tooltip>
                </div>
              ))}
              {rows.length === 0 && <Empty>No members</Empty>}
            </div>
          </div>
        </Scroll>
      </Panel>

      <Drawer open={!!live} onOpenChange={(o) => !o && setActive(null)} swipeDirection="right">
        <DrawerContent side="right">
          {live && (
            <DrawerBody className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <Avatar size={48}>
                  <AvatarFallback>{initials(live.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <DrawerTitle className="f-display text-[20px]">{live.name}</DrawerTitle>
                  <DrawerDescription className="f-mono text-[12px]">{live.id}</DrawerDescription>
                </div>
              </div>
              <div className="row-flat p-4 text-center">
                <div className="label">Balance</div>
                <div className="f-display num mt-1 text-[34px] leading-none font-bold">{usd(live.balance)}</div>
              </div>
              <ToggleGroup value={[String(amount)]} onValueChange={(v) => v[0] && setAmount(Number(v[0]))} aria-label="Amount">
                {PRESETS.map((p) => (
                  <Toggle key={p} value={String(p)} className="flex-1 justify-center px-2 text-[12.5px]">
                    ${p}
                  </Toggle>
                ))}
              </ToggleGroup>
              <NumberField value={amount} onValueChange={setAmount} min={1} max={1000}>
                <NumberFieldGroup className="w-full">
                  <NumberFieldDecrement />
                  <NumberFieldInput aria-label="Custom amount" />
                  <NumberFieldIncrement />
                </NumberFieldGroup>
              </NumberField>
              <Button
                variant="accent"
                onClick={() => {
                  if (amount) {
                    topUp(live.id, amount);
                    toast.add({ title: "Balance updated", description: `${live.name} +${usd(amount)}` });
                  }
                  setActive(null);
                }}
              >
                Add {amount ? usd(amount) : ""}
              </Button>
              <DrawerClose render={<Button className="mt-auto">Close</Button>} />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogDismiss />
          <DialogTitle>New Member</DialogTitle>
          <Form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const name = String(f.get("name") || "").trim();
              if (!name) return;
              addMember({
                id: `MB-${2400 + Math.floor(Math.random() * 500)}`,
                name,
                handle: String(f.get("handle") || name.split(" ")[0].toLowerCase()),
                tier: nTier as Member["tier"],
                balance: 0,
                hours: 0,
                visits: 0,
                lastVisit: "Now",
                status: "active",
              });
              toast.add({ title: "Member added", description: name });
              setNewOpen(false);
            }}
          >
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input name="name" required placeholder="Full name" />
            </Field>
            <Field>
              <FieldLabel>Handle</FieldLabel>
              <Input name="handle" placeholder="gamertag" />
            </Field>
            <div>
              <div className="label mb-2">Tier</div>
              <RadioGroup value={nTier} onValueChange={(v) => setNTier(v as string)} className="grid grid-cols-2 gap-2">
                {TIERS.slice(1).map((t) => (
                  <label key={t} className="row-flat flex items-center gap-2 px-3 py-2 text-[13px] font-medium">
                    <Radio value={t} />
                    {t}
                  </label>
                ))}
              </RadioGroup>
            </div>
            <CheckboxLabel>
              <Checkbox defaultChecked />
              Send welcome message
            </CheckboxLabel>
            <DialogActions>
              <Button type="button" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent">
                Create
              </Button>
            </DialogActions>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
