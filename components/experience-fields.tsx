"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AIRCRAFT_CATEGORIES = [
  { key: "se-airplane", label: "SE Airplane" },
  { key: "multi-engine", label: "Multi-Engine Airplane" },
  { key: "rotary-wing", label: "Rotary Wing" },
] as const;

type CategoryKey = (typeof AIRCRAFT_CATEGORIES)[number]["key"];

interface CategoryHours {
  totalTime: string;
  picTime: string;
  dualReceived: string;
  solo: string;
  crossCountry: string;
  night: string;
  instrument: string;
  simulator: string;
  dayLandings: string;
  nightLandings: string;
  nightGoggle: string;
}

function emptyCategoryHours(): CategoryHours {
  return {
    totalTime: "0",
    picTime: "0",
    dualReceived: "0",
    solo: "0",
    crossCountry: "0",
    night: "0",
    instrument: "0",
    simulator: "0",
    dayLandings: "0",
    nightLandings: "0",
    nightGoggle: "0",
  };
}

const HOUR_FIELDS: { key: keyof CategoryHours; label: string; type: "hours" | "count"; rotaryOnly?: boolean }[] = [
  { key: "totalTime", label: "Total Time", type: "hours" },
  { key: "picTime", label: "PIC Time", type: "hours" },
  { key: "dualReceived", label: "Dual Received", type: "hours" },
  { key: "solo", label: "Solo", type: "hours" },
  { key: "crossCountry", label: "Cross-Country", type: "hours" },
  { key: "night", label: "Night", type: "hours" },
  { key: "instrument", label: "Instrument", type: "hours" },
  { key: "simulator", label: "Simulator", type: "hours" },
  { key: "dayLandings", label: "Day Landings", type: "count" },
  { key: "nightLandings", label: "Night Landings", type: "count" },
  { key: "nightGoggle", label: "Night Goggle", type: "hours", rotaryOnly: true },
];

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  "se-airplane": "SE Airplane Experience",
  "multi-engine": "Multi-Engine Experience",
  "rotary-wing": "Rotary Wing Experience",
};

export function ExperienceFields() {
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryKey>>(new Set());
  const [categoryData, setCategoryData] = useState<Record<CategoryKey, CategoryHours>>({
    "se-airplane": emptyCategoryHours(),
    "multi-engine": emptyCategoryHours(),
    "rotary-wing": emptyCategoryHours(),
  });

  function toggleCategory(key: CategoryKey) {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function updateField(category: CategoryKey, field: keyof CategoryHours, value: string) {
    setCategoryData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Aircraft Categories</Label>
        <div className="space-y-2">
          {AIRCRAFT_CATEGORIES.map(cat => (
            <div key={cat.key} className="flex items-center justify-between">
              <Label className="text-sm font-normal">{cat.label}</Label>
              <Switch
                checked={selectedCategories.has(cat.key)}
                onCheckedChange={() => toggleCategory(cat.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedCategories.size > 0 && <Separator />}

      {AIRCRAFT_CATEGORIES.filter(cat => selectedCategories.has(cat.key)).map(cat => (
        <Card key={cat.key} size="sm">
          <CardHeader>
            <CardTitle>{CATEGORY_LABELS[cat.key]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {HOUR_FIELDS.filter(f => !f.rotaryOnly || cat.key === "rotary-wing").map(field => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs">{field.label} {field.type === "hours" ? "(hrs)" : ""}</Label>
                  <Input
                    type="number"
                    min="0"
                    step={field.type === "hours" ? "0.1" : "1"}
                    value={categoryData[cat.key][field.key]}
                    onChange={e => updateField(cat.key, field.key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedCategories.size === 0 && (
        <p className="text-xs text-muted-foreground">Toggle one or more aircraft categories to enter experience.</p>
      )}
    </div>
  );
}
