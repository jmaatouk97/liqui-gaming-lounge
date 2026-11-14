import { RotateCcw } from "lucide-react";
import { PageHeader, Panel, SectionHead } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Switch, SwitchLabel } from "@/components/ui/switch";
import { Slider, SliderControl, SliderLabel, SliderThumb, SliderTrack, SliderValue } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fieldset, FieldsetLegend } from "@/components/ui/fieldset";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FONTS, THEMES, useUI } from "@/theme";
import { usePrefs } from "@/settings";
import { AppearanceToggle, ColorPicker, FontSwitcher } from "@/components/Controls";
import { useToast } from "@/components/ui/toast";

const MATERIAL = [
  { label: "Refraction (auto)", value: "auto" },
  { label: "Frosted", value: "frost" },
  { label: "Clear", value: "clear" },
];
const INTERVAL = [
  { label: "1 s", value: "1000" },
  { label: "1.8 s", value: "1800" },
  { label: "3 s", value: "3000" },
  { label: "5 s", value: "5000" },
];

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row-flat flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="text-[13.5px] font-semibold">{label}</span>
      {children}
    </div>
  );
}

export default function Settings() {
  const p = usePrefs();
  const fontId = useUI((s) => s.fontId);
  const themeId = useUI((s) => s.themeId);
  const toast = useToast();
  const font = FONTS.find((f) => f.id === fontId)!;
  const theme = THEMES.find((t) => t.id === themeId)!;

  return (
    <div>
      <PageHeader
        title="Settings"
        right={
          <Button
            size="sm"
            onClick={() => {
              p.reset();
              toast.add({ title: "Defaults restored" });
            }}
          >
            <RotateCcw size={13} /> Reset
          </Button>
        }
      />
      <div className="grid gap-3 xl:grid-cols-2">
        <Panel>
          <SectionHead title="Appearance" />
          <div className="flex flex-col gap-2">
            <Line label="Mode">
              <AppearanceToggle />
            </Line>
            <Line label={`Type · ${font.name}`}>
              <FontSwitcher />
            </Line>
            <Line label={`Colors · ${theme.name}`}>
              <ColorPicker />
            </Line>
            <Line label="Ambient backdrop">
              <Switch checked={p.ambient} onCheckedChange={(v) => p.set("ambient", v)} aria-label="Ambient backdrop" />
            </Line>
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Glass" />
          <div className="flex flex-col gap-2">
            <Line label="Material">
              <Select items={MATERIAL} value={p.material} onValueChange={(v) => p.set("material", v as "auto" | "frost" | "clear")}>
                <SelectTrigger className="min-w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Line>
            <div className="row-flat px-3 py-3">
              <Slider value={p.refractionScale} min={0.4} max={1.6} step={0.05} onValueChange={(v) => p.set("refractionScale", v as number)}>
                <div className="mb-2 flex items-center justify-between">
                  <SliderLabel>Refraction</SliderLabel>
                  <SliderValue className="f-mono" />
                </div>
                <SliderControl>
                  <SliderTrack />
                  <SliderThumb aria-label="Refraction" />
                </SliderControl>
              </Slider>
            </div>
            <div className="row-flat px-3 py-3">
              <Slider value={p.specular} min={0} max={1} step={0.05} onValueChange={(v) => p.set("specular", v as number)}>
                <div className="mb-2 flex items-center justify-between">
                  <SliderLabel>Specular</SliderLabel>
                  <SliderValue className="f-mono" />
                </div>
                <SliderControl>
                  <SliderTrack />
                  <SliderThumb aria-label="Specular" />
                </SliderControl>
              </Slider>
            </div>
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Floor" />
          <div className="flex flex-col gap-2">
            <Line label="Telemetry rate">
              <Select items={INTERVAL} value={String(p.telemetryMs)} onValueChange={(v) => p.set("telemetryMs", Number(v))}>
                <SelectTrigger className="min-w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Line>
            <Fieldset className="row-flat px-3 py-3">
              <FieldsetLegend>Density</FieldsetLegend>
              <RadioGroup value={p.compact ? "compact" : "comfy"} onValueChange={(v) => p.set("compact", v === "compact")} className="mt-2 flex-row gap-5">
                <label className="flex items-center gap-2 text-[13px] font-medium">
                  <Radio value="comfy" /> Comfortable
                </label>
                <label className="flex items-center gap-2 text-[13px] font-medium">
                  <Radio value="compact" /> Compact
                </label>
              </RadioGroup>
            </Fieldset>
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Alerts" />
          <div className="flex flex-col gap-2">
            <Line label="Session sounds">
              <Switch checked={p.sound} onCheckedChange={(v) => p.set("sound", v)} aria-label="Session sounds" />
            </Line>
            <Line label="Auto-lock idle">
              <Switch checked={p.autoLock} onCheckedChange={(v) => p.set("autoLock", v)} aria-label="Auto-lock idle" />
            </Line>
            <Line label="Low-stock alerts">
              <Switch checked={p.lowStockAlerts} onCheckedChange={(v) => p.set("lowStockAlerts", v)} aria-label="Low-stock alerts" />
            </Line>
            <Fieldset className="row-flat px-3 py-3">
              <FieldsetLegend>Notify</FieldsetLegend>
              <CheckboxGroup defaultValue={["thermal", "network"]} className="mt-2 flex-row flex-wrap gap-x-5 gap-y-2">
                {["thermal", "network", "storage", "power"].map((k) => (
                  <label key={k} className="flex items-center gap-2 text-[13px] font-medium capitalize">
                    <Checkbox value={k} /> {k}
                  </label>
                ))}
              </CheckboxGroup>
            </Fieldset>
          </div>
        </Panel>
      </div>
    </div>
  );
}
