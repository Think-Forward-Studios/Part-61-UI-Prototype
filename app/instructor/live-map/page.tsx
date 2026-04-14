"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Home, AlertTriangle, Plane, Wind, Eye, Thermometer, Gauge } from "lucide-react";
import { base, aircraftPositions, metarReports, weatherWarnings, reservations, users } from "@/lib/mock-data";
import type { AircraftPosition, MetarReport } from "@/lib/types";

const FleetMapComponent = dynamic(() => import("./fleet-map"), { ssr: false, loading: () => <div className="h-full bg-muted animate-pulse rounded-lg" /> });

const categoryColors: Record<string, string> = {
  VFR: "bg-green-500 text-white",
  MVFR: "bg-blue-500 text-white",
  IFR: "bg-red-500 text-white",
  LIFR: "bg-purple-600 text-white",
};

export default function LiveMapPage() {
  const [centerOn, setCenterOn] = useState<[number, number] | null>(null);
  const [expandedMetar, setExpandedMetar] = useState<string>("KAUS");

  const flyingAircraft = aircraftPositions.filter(a => a.isSchoolAircraft && a.altitudeFt > 0);
  const baseMetar = metarReports.find(m => m.station === "KAUS")!;
  const nearbyMetars = metarReports.filter(m => m.station !== "KAUS");

  const handleRecenter = useCallback(() => {
    setCenterOn([base.longitude, base.latitude]);
  }, []);

  const handleSnapToAircraft = useCallback((pos: AircraftPosition) => {
    setCenterOn([pos.longitude, pos.latitude]);
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar */}
      <div className="w-80 border-r flex flex-col shrink-0">
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {/* METAR - Base */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Weather</h3>
              <MetarCard metar={baseMetar} expanded onToggle={() => {}} />
            </div>

            {/* Nearby */}
            <div className="space-y-1">
              <h4 className="text-xs text-muted-foreground">Nearby Fields</h4>
              {nearbyMetars.map(m => (
                <MetarCard
                  key={m.station}
                  metar={m}
                  expanded={expandedMetar === m.station}
                  onToggle={() => setExpandedMetar(expandedMetar === m.station ? "" : m.station)}
                />
              ))}
            </div>

            {/* Weather Warnings */}
            {weatherWarnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs text-muted-foreground">Active Warnings</h4>
                {weatherWarnings.map(w => (
                  <Alert key={w.id} variant="destructive" className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-xs">{w.title}</AlertTitle>
                    <AlertDescription className="text-xs">{w.description}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Map + Controls */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1">
          <FleetMapComponent centerOn={centerOn} />
        </div>

        {/* Re-center button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 z-10 shadow-md"
          onClick={handleRecenter}
        >
          <Home className="h-4 w-4 mr-1" />Re-center
        </Button>

        {/* Bottom bar - Flying Aircraft */}
        <div className="border-t bg-card p-2">
          <div className="flex gap-2 overflow-x-auto">
            {flyingAircraft.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No school aircraft currently flying</p>
            ) : (
              flyingAircraft.map(ac => {
                const matchingRes = reservations.find(r =>
                  r.aircraftId === ac.aircraftId && r.status === "dispatched"
                );
                const student = matchingRes ? users.find(u => u.id === matchingRes.studentId) : null;

                return (
                  <Card
                    key={ac.icaoHex}
                    className="shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleSnapToAircraft(ac)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Plane className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{ac.tailNumber ?? ac.callsign}</p>
                        <p className="text-xs text-muted-foreground">
                          {ac.altitudeFt.toLocaleString()}ft | {ac.groundSpeedKts}kts | {ac.headingDeg}&deg;
                        </p>
                        {student && <p className="text-xs text-muted-foreground">{student.fullName}</p>}
                      </div>
                      <Badge variant="outline" className="text-xs ml-2">
                        {matchingRes ? "On Schedule" : "Flying"}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetarCard({ metar, expanded, onToggle }: { metar: MetarReport; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      className="w-full text-left rounded-md border p-2 hover:bg-muted/50 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono font-semibold">{metar.station}</span>
        <Badge className={`text-[10px] ${categoryColors[metar.flightCategory]}`}>
          {metar.flightCategory}
        </Badge>
      </div>
      {expanded && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <p className="font-mono text-[10px] break-all">{metar.raw}</p>
          <div className="grid grid-cols-2 gap-1 mt-2">
            <div className="flex items-center gap-1"><Wind className="h-3 w-3" />{metar.windDirection}&deg; @ {metar.windSpeed}kt{metar.windGust ? ` G${metar.windGust}` : ""}</div>
            <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{metar.visibility} SM</div>
            <div className="flex items-center gap-1"><Thermometer className="h-3 w-3" />{metar.temperature}/{metar.dewpoint}&deg;C</div>
            <div className="flex items-center gap-1"><Gauge className="h-3 w-3" />{metar.altimeter}&quot; Hg</div>
          </div>
          <p className="mt-1">Clouds: {metar.clouds}</p>
        </div>
      )}
    </button>
  );
}
