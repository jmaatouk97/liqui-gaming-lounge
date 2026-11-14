import { useState } from "react";
import { Banknote, FileText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Kpi, PageHeader, Panel, Row, SectionHead, chartAxis, tooltipStyle, usd, usd0 } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogActions, AlertDialogClose, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/toast";
import { loans as loanSeed, paymentMix, revenueSeries, shifts } from "@/data";
import { useApp } from "@/store";

export default function Finance() {
  const revenue = useApp((s) => s.revenueToday);
  const toast = useToast();
  const [loans, setLoans] = useState(loanSeed);
  const [settle, setSettle] = useState<string | null>(null);
  const [tab, setTab] = useState("ledger");
  const week = revenueSeries.slice(-7);
  const exp = week.reduce((n, d) => n + d.expenses, 0);
  const rev = week.reduce((n, d) => n + d.revenue, 0);
  const owed = loans.reduce((n, l) => n + l.amount, 0);
  const target = loans.find((l) => l.id === settle);

  return (
    <div>
      <PageHeader
        title="Finance"
        right={
          <Button size="sm" onClick={() => toast.add({ title: "Z-report exported", description: "PDF · Today" })}>
            <FileText size={14} /> Z-Report
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Today" value={usd0(revenue)} foot="Gross" />
        <Kpi label="7D Revenue" value={usd0(rev)} foot={`${usd0(rev / 7)}/day`} />
        <Kpi label="7D Costs" value={usd0(exp)} foot={`${Math.round((exp / rev) * 100)}% of revenue`} />
        <Kpi label="Debt" value={usd(owed)} foot={`${loans.length} open`} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <SectionHead title="Revenue vs Cost" />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week} margin={{ left: -12, right: 8, top: 8 }} barGap={4}>
                <CartesianGrid vertical={false} stroke="color-mix(in srgb, var(--lq-text) 8%, transparent)" />
                <XAxis dataKey="day" {...chartAxis} />
                <YAxis {...chartAxis} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip {...tooltipStyle} formatter={(v) => usd0(Number(v))} />
                <Bar isAnimationActive={false} dataKey="revenue" fill="var(--theme-secondary)" radius={[6, 6, 0, 0]} />
                <Bar isAnimationActive={false} dataKey="expenses" fill="color-mix(in srgb, var(--lq-text) 28%, transparent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <SectionHead title="Payment Mix" />
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie isAnimationActive={false} data={paymentMix} dataKey="value" innerRadius={48} outerRadius={74} paddingAngle={3} stroke="none">
                  {paymentMix.map((p) => (
                    <Cell key={p.name} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {paymentMix.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-[12.5px]">
                <span className="size-2.5 rounded-full" style={{ background: p.color }} />
                <span className="flex-1">{p.name}</span>
                <span className="f-mono font-semibold">{p.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-3">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList className="mb-4 max-w-[320px]">
            <TabsIndicator />
            <TabsTab value="ledger">Shift Ledger</TabsTab>
            <TabsTab value="debt">Debt</TabsTab>
          </TabsList>
          <TabsPanel value="ledger">
            <Accordion>
              {shifts.map((s) => (
                <AccordionItem key={s.id} value={s.id}>
                  <AccordionTrigger>
                    <span className="flex w-full items-center gap-3 pr-2">
                      <span className="f-mono w-16 text-[12px]">{s.id}</span>
                      <span className="flex-1 text-left text-[13.5px] font-semibold">{s.label}</span>
                      <span className="f-mono hidden text-[12px] text-[var(--lq-text-dim)] sm:inline">{s.window}</span>
                      <Badge tone={s.status === "open" ? "ok" : "idle"}>{s.status}</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionPanel>
                    <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
                      {[
                        ["Cash", s.cash],
                        ["Card", s.card],
                        ["Tab", s.tab],
                        ["Variance", s.variance],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="row-flat p-3">
                          <div className="label">{k}</div>
                          <div className="f-mono mt-1 text-[15px] font-semibold">{usd(Number(v))}</div>
                        </div>
                      ))}
                    </div>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsPanel>
          <TabsPanel value="debt">
            <div className="flex flex-col gap-1.5">
              {loans.length === 0 && <div className="py-6 text-center text-[13px] text-[var(--lq-text-dim)]">Settled</div>}
              {loans.map((l) => (
                <Row key={l.id} className="flex-wrap">
                  <span className="f-mono w-16 text-[12px]">{l.id}</span>
                  <span className="min-w-[120px] flex-1 text-[13.5px] font-semibold">{l.member}</span>
                  <span className="f-mono text-[12px] text-[var(--lq-text-dim)]">Due {l.due}</span>
                  <Badge tone={l.status === "overdue" ? "bad" : "warn"}>{l.status}</Badge>
                  <span className="f-mono w-20 text-right text-[13px] font-semibold">{usd(l.amount)}</span>
                  <Button size="sm" onClick={() => setSettle(l.id)}>
                    <Banknote size={13} /> Settle
                  </Button>
                </Row>
              ))}
            </div>
          </TabsPanel>
        </Tabs>
      </Panel>

      <AlertDialog open={!!settle} onOpenChange={(o) => !o && setSettle(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Settle debt</AlertDialogTitle>
          <AlertDialogDescription>
            {target?.member} · {target ? usd(target.amount) : ""}
          </AlertDialogDescription>
          <AlertDialogActions>
            <AlertDialogClose render={<Button>Cancel</Button>} />
            <AlertDialogClose
              render={
                <Button
                  variant="accent"
                  onClick={() => {
                    if (target) {
                      setLoans((ls) => ls.filter((l) => l.id !== target.id));
                      toast.add({ title: "Debt settled", description: `${target.member} · ${usd(target.amount)}` });
                    }
                  }}
                >
                  Confirm
                </Button>
              }
            />
          </AlertDialogActions>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
