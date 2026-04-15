"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { base, aircraftPositions, geofences } from "@/lib/mock-data";

interface Props {
  centerOn: [number, number] | null;
}

export default function FleetMap({ centerOn }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [base.longitude, base.latitude],
      zoom: 9,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-left");

    map.current.on("load", () => {
      setLoaded(true);
      addMarkers();
      addGeofences();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (centerOn && map.current) {
      map.current.flyTo({ center: centerOn, zoom: 11, duration: 1500 });
    }
  }, [centerOn]);

  function addMarkers() {
    if (!map.current) return;

    // Base marker
    const baseEl = document.createElement("div");
    baseEl.className = "base-marker";
    baseEl.style.cssText = "width:16px;height:16px;background:#f59e0b;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(245,158,11,0.6)";
    new maplibregl.Marker({ element: baseEl })
      .setLngLat([base.longitude, base.latitude])
      .setPopup(new maplibregl.Popup().setHTML(`<div style="color:#000;font-size:12px"><b>${base.name}</b><br/>Home Field</div>`))
      .addTo(map.current);

    // Aircraft markers
    aircraftPositions.forEach(ac => {
      if (ac.altitudeFt === 0 && !ac.isSchoolAircraft) return; // skip non-school ground traffic

      const el = document.createElement("div");
      const isSchool = ac.isSchoolAircraft;
      const size = isSchool ? 28 : 16;
      el.style.cssText = `width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${isSchool ? 16 : 10}px;transform:rotate(${ac.headingDeg}deg);cursor:pointer`;
      el.textContent = "✈";
      el.style.color = isSchool ? "#3b82f6" : "#9ca3af";

      if (isSchool) {
        el.style.filter = "drop-shadow(0 0 4px rgba(59,130,246,0.8))";
      }

      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div style="color:#000;font-size:12px;min-width:120px">
          <b>${ac.tailNumber ?? ac.callsign}</b><br/>
          Alt: ${ac.altitudeFt.toLocaleString()} ft<br/>
          Spd: ${ac.groundSpeedKts} kts<br/>
          Hdg: ${ac.headingDeg}&deg;
          ${ac.verticalRateFpm !== 0 ? `<br/>VS: ${ac.verticalRateFpm > 0 ? "+" : ""}${ac.verticalRateFpm} fpm` : ""}
        </div>
      `);

      new maplibregl.Marker({ element: el })
        .setLngLat([ac.longitude, ac.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Label for school aircraft
      if (isSchool && ac.altitudeFt > 0) {
        const label = document.createElement("div");
        label.style.cssText = "color:#3b82f6;font-size:10px;font-weight:600;white-space:nowrap;text-shadow:0 0 3px rgba(0,0,0,0.8)";
        label.textContent = ac.tailNumber ?? ac.callsign;
        new maplibregl.Marker({ element: label, anchor: "top" })
          .setLngLat([ac.longitude, ac.latitude])
          .addTo(map.current!);
      }
    });
  }

  function addGeofences() {
    if (!map.current) return;

    const nmToKm = 1.852;
    const circlePoints = 64;

    geofences.forEach((gf, idx) => {
      let coords: [number, number][];
      let labelLng: number;
      let labelLat: number;

      if (gf.kind === "circle" && gf.centerLat != null && gf.centerLng != null && gf.radiusNm != null) {
        const radiusKm = gf.radiusNm * nmToKm;
        coords = [];
        for (let i = 0; i <= circlePoints; i++) {
          const angle = (i / circlePoints) * 2 * Math.PI;
          const dx = radiusKm * Math.cos(angle);
          const dy = radiusKm * Math.sin(angle);
          const lat = gf.centerLat + (dy / 111.32);
          const lng = gf.centerLng + (dx / (111.32 * Math.cos(gf.centerLat * Math.PI / 180)));
          coords.push([lng, lat]);
        }
        labelLng = gf.centerLng;
        labelLat = gf.centerLat + (radiusKm / 111.32) * 0.85; // label near top of circle
      } else if (gf.kind === "polygon" && gf.geometry) {
        // geometry is [lat, lng][] — convert to [lng, lat][] for GeoJSON
        coords = gf.geometry.map(([lat, lng]) => [lng, lat] as [number, number]);
        // Close the polygon ring
        const first = coords[0];
        const last = coords[coords.length - 1];
        if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
          coords.push([...first] as [number, number]);
        }
        labelLng = gf.centerLng ?? coords.reduce((s, c) => s + c[0], 0) / (coords.length - 1);
        labelLat = gf.centerLat ?? coords.reduce((s, c) => s + c[1], 0) / (coords.length - 1);
      } else {
        return; // invalid geofence, skip
      }

      const isRestricted = gf.label.toLowerCase().includes("restrict");
      const color = isRestricted ? "#ef4444" : "#3b82f6";
      const sourceId = `geofence-${idx}`;

      map.current!.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { label: gf.label },
          geometry: { type: "Polygon", coordinates: [coords] },
        },
      });

      map.current!.addLayer({
        id: `${sourceId}-fill`,
        type: "fill",
        source: sourceId,
        paint: { "fill-color": color, "fill-opacity": isRestricted ? 0.1 : 0.05 },
      });

      map.current!.addLayer({
        id: `${sourceId}-border`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 1.5,
          "line-dasharray": isRestricted ? [2, 2] : [4, 4],
          "line-opacity": isRestricted ? 0.7 : 0.5,
        },
      });

      // Label marker
      const labelEl = document.createElement("div");
      labelEl.style.cssText = `color:${color};font-size:10px;font-weight:600;white-space:nowrap;text-shadow:0 0 4px rgba(0,0,0,0.9);pointer-events:none`;
      labelEl.textContent = gf.label;
      new maplibregl.Marker({ element: labelEl, anchor: "center" })
        .setLngLat([labelLng, labelLat])
        .addTo(map.current!);
    });
  }

  return <div ref={mapContainer} className="w-full h-full" />;
}
