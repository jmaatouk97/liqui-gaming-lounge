import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Badge, PageHeader, Panel, Row, SectionHead, usd } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress, ProgressTrack } from "@/components/ui/progress";
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@/components/ui/number-field";
import { OTPField, OTPFieldRow, OTPFieldSlots } from "@/components/ui/otp-field";
import { Dialog, DialogActions, DialogContent, DialogDescription, DialogDismiss, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { shifts } from "@/data";
import { cn } from "@/lib/utils";

const STEPS = ["Count", "Reconcile", "Handover", "Confirm"];
const DENOMS = [
  { label: "$50", v: 50, n: 4 },
  { label: "$20", v: 20, n: 9 },
  { label: "$10", v: 10, n: 12 },
  { label: "$5", v: 5, n: 8 },
  { label: "$1", v: 1, n: 14 },
];
const EXPECTED = 386.75 + 224.1;

export default function Reports() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>(Object.fromEntries(DENOMS.map((d) => [d.label, d.n])));
  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");
  const [z, setZ] = useState<(typeof shifts)[number] | null>(null);
  const [done, setDone] = useState(false);

  const counted = DENOMS.reduce((n, d) => n + d.v * (counts[d.label] ?? 0), 0);
  const variance = Math.round((counted - EXPECTED) * 100) / 100;
  const canNext = step < 3 || pin.length === 4;

  return (
    <div>
      <PageHeader title="Shift Reports" />
      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <SectionHead title="Close Shift" right={<Badge tone={done ? "ok" : "accent"}>{done ? "Closed" : "SH-116"}</Badge>} />
          <ol className="mb-3 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "f-mono flex size-7 flex-none items-center justify-center rounded-full text-[12px] font-semibold",
                    i <= step || done ? "text-white" : "text-[var(--lq-text-dim)]",
                  )}
                  style={{ background: i <= step || done ? "var(--lq-accent)" : "color-mix(in srgb, var(--lq-text) 10%, transparent)" }}
                >
                  {i < step || done ? <Check size={14} /> : i + 1}
                </span>
                <span className={cn("hidden truncate text-[12.5px] font-semibold sm:inline", i === step ? "" : "text-[var(--lq-text-dim)]")}>{s}</span>
              </li>
            ))}
          </ol>
          <Progress value={done ? 100 : ((step + 1) / STEPS.length) * 100}>
            <ProgressTrack className="h-2" />
          </Progress>
          <Separator className="my-4" />

          {done ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full text-white" style={{ background: "var(--lq-accent)" }}>
                <Check size={22} />
              </span>
              <div className="f-display text-[18px] font-bold">Shift closed</div>
              <Button size="sm" onClick={() => { setDone(false); setStep(0); setPin(""); }}>
                Reopen
              </Button>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {DENOMS.map((d) => (
                    <Row key={d.label} className="justify-between">
                      <span className="f-mono w-10 text-[14px] font-semibold">{d.label}</span>
                      <NumberField value={counts[d.label]} min={0} onValueChange={(v) => setCounts((c) => ({ ...c, [d.label]: v ?? 0 }))}>
                        <NumberFieldGroup className="w-[130px]">
                          <NumberFieldDecrement />
                          <NumberFieldInput aria-label={`${d.label} count`} />
                          <NumberFieldIncrement />
                        </NumberFieldGroup>
                      </NumberField>
                    </Row>
                  ))}
                  <Row className="justify-between sm:col-span-2">
                    <span className="label">Counted</span>
                    <span className="f-mono text-[16px] font-semibold">{usd(counted)}</span>
                  </Row>
                </div>
              )}
              {step === 1 && (
                <div className="flex flex-col gap-2">
                  <Row className="justify-between">
                    <span className="label">Expected</span>
                    <span className="f-mono text-[14px] font-semibold">{usd(EXPECTED)}</span>
                  </Row>
                  <Row className="justify-between">
                    <span className="label">Counted</span>
                    <span className="f-mono text-[14px] font-semibold">{usd(counted)}</span>
                  </Row>
                  <Row className="justify-between">
                    <span className="label">Variance</span>
                    <span className="flex items-center gap-2">
                      <Badge tone={variance === 0 ? "ok" : Math.abs(variance) < 10 ? "warn" : "bad"}>{variance === 0 ? "Balanced" : "Check"}</Badge>
                      <span className="f-mono text-[16px] font-semibold">{variance > 0 ? "+" : ""}{usd(variance)}</span>
                    </span>
                  </Row>
                </div>
              )}
              {step === 2 && (
                <Field>
                  <FieldLabel>Handover note</FieldLabel>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="VIP-03 fan, restock nachos" />
                </Field>
              )}
              {step === 3 && (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="label">Manager PIN</div>
                  <OTPField length={4} value={pin} onValueChange={(v) => setPin(String(v))}>
                    <OTPFieldRow>
                      <OTPFieldSlots length={4} />
                    </OTPFieldRow>
                  </OTPField>
                </div>
              )}
              <div className="mt-5 flex justify-between">
                <Button size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft size={14} /> Back
                </Button>
                {step < 3 ? (
                  <Button variant="accent" size="sm" onClick={() => setStep((s) => s + 1)}>
                    Next <ChevronRight size={14} />
                  </Button>
                ) : (
                  <Button
                    variant="accent"
                    size="sm"
                    disabled={!canNext}
                    onClick={() => {
                      setDone(true);
                      toast.add({ title: "Shift closed", description: `SH-116 · ${usd(counted)}` });
                    }}
                  >
                    Close Shift
                  </Button>
                )}
              </div>
            </>
          )}
        </Panel>

        <Panel>
          <SectionHead title="Archive" />
          <div className="flex flex-col gap-1.5">
            {shifts.map((s) => (
              <Row key={s.id} className="flex-wrap">
                <span className="f-mono w-16 text-[12px] font-semibold">{s.id}</span>
                <span className="min-w-[70px] flex-1 text-[13.5px] font-medium">{s.label}</span>
                <span className="f-mono text-[12.5px]">{usd(s.cash + s.card + s.tab, 0)}</span>
                <Button size="sm" onClick={() => setZ(s)}>
                  <FileText size={13} /> Z
                </Button>
              </Row>
            ))}
          </div>
        </Panel>
      </div>

      <Dialog open={!!z} onOpenChange={(o) => !o && setZ(null)}>
        <DialogContent>
          <DialogDismiss />
          <DialogTitle>Z-Report · {z?.id}</DialogTitle>
          <DialogDescription>
            {z?.staff} · {z?.window}
          </DialogDescription>
          {z && (
            <div className="f-mono mt-4 flex flex-col gap-1.5 text-[13px]">
              {[
                ["Cash", z.cash],
                ["Card", z.card],
                ["Tab", z.tab],
                ["Variance", z.variance],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-[var(--lq-text-dim)]">{k}</span>
                  <span>{usd(Number(v))}</span>
                </div>
              ))}
              <Separator className="my-1" />
              <div className="flex justify-between text-[15px] font-semibold">
                <span>Total</span>
                <span>{usd(z.cash + z.card + z.tab)}</span>
              </div>
            </div>
          )}
          <DialogActions>
            <Button onClick={() => setZ(null)}>Close</Button>
            <Button variant="accent" onClick={() => { toast.add({ title: "Exported", description: `${z?.id} · PDF` }); setZ(null); }}>
              Export
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
}
