'use client';

import { useState, useEffect, useRef } from 'react';
import { getMapData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface MapPlot {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  cropType: string;
  areaHectares: number;
  farmerName: string;
  insurance: { status: string; sumInsured: number; riskScore: number } | null;
  latestTrigger: { severity: string; date: string; triggerType: string } | null;
  status: string;
}

const CROP_LABELS: Record<string, string> = {
  rice: 'Rice', wheat: 'Wheat', pulses: 'Pulses', cotton: 'Cotton', sugarcane: 'Sugarcane',
};

const MARKER_COLORS: Record<string, string> = {
  safe: '#167208',
  near_trigger: '#7EDE56',
  triggered: '#dc2626',
  no_insurance: '#9ca3af',
};

export default function MapView() {
  const [plots, setPlots] = useState<MapPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMapData();
        setPlots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && plots.length > 0) initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, plots]);

  function initMap() {
    import('leaflet').then((L) => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      mapContainer.innerHTML = '';
      const map = L.map('map').setView([22.5, 78.5], 5);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      plots.forEach((plot) => {
        const color = MARKER_COLORS[plot.status] || '#9ca3af';
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([plot.centerLat, plot.centerLng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:180px;font-family:system-ui;font-size:13px;">
            <div style="font-weight:600;margin-bottom:4px;">${plot.name}</div>
            <div style="color:#666;font-size:12px;margin-bottom:6px;">
              ${plot.farmerName} &middot; ${plot.areaHectares} ha
            </div>
            <div style="font-size:12px;color:#555;">
              ${CROP_LABELS[plot.cropType] || plot.cropType}
              ${plot.insurance ? ` &middot; INR ${plot.insurance.sumInsured.toLocaleString('en-IN')}` : ''}
            </div>
          </div>
        `);
      });

      const LegendControl = L.Control.extend({
        onAdd: function () {
          const div = L.DomUtil.create('div');
          div.style.cssText = 'background:white;padding:8px 12px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.12);font-size:12px;font-family:system-ui;';
          div.innerHTML = `
            <div style="font-weight:600;margin-bottom:4px;">Legend</div>
            <div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
              <span style="width:8px;height:8px;border-radius:50%;background:#167208;flex-shrink:0;"></span>Safe
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
              <span style="width:8px;height:8px;border-radius:50%;background:#7EDE56;flex-shrink:0;"></span>Near Trigger
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
              <span style="width:8px;height:8px;border-radius:50%;background:#dc2626;flex-shrink:0;"></span>Triggered
            </div>
          `;
          return div;
        },
      });
      new LegendControl({ position: 'bottomright' }).addTo(map);
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen pt-14">
        <aside className="hidden md:block w-60 flex-shrink-0" />
        <main className="flex-1 p-4 md:p-10">
          <Card>
            <CardContent className="p-6">
              <div className="h-96 animate-pulse rounded-md bg-surface-container-high" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const safeCount = plots.filter((p) => p.status === 'safe').length;
  const nearCount = plots.filter((p) => p.status === 'near_trigger').length;
  const triggeredCount = plots.filter((p) => p.status === 'triggered').length;

  return (
    <div className="flex min-h-screen pt-14">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <div className="flex-1 overflow-y-auto p-4 md:p-10 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Map View</h1>
        <p className="text-sm text-muted-foreground">
          All insured plots with real-time status indicators
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <Badge variant="outline" className="bg-[#F4FFEC] text-[#4D8B64] border-[#4D8B64]/20">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#4D8B64]" />
          Safe ({safeCount})
        </Badge>
        <Badge variant="outline" className="bg-[#FFF8E1] text-[#B8860B] border-[#E2A93B]/20">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#E2A93B]" />
          Near Trigger ({nearCount})
        </Badge>
        <Badge variant="outline" className="bg-[#FFDAD6] text-[#C9574F] border-[#C9574F]/20">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#C9574F]" />
          Triggered ({triggeredCount})
        </Badge>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div id="map" className="h-[500px] w-full" />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">All Plots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium text-left">Plot</th>
                  <th className="pb-2 font-medium text-left">Farmer</th>
                  <th className="pb-2 font-medium text-left">Crop</th>
                  <th className="pb-2 font-medium text-right">Area</th>
                  <th className="pb-2 font-medium text-left">Status</th>
                  <th className="pb-2 font-medium text-right">Insurance</th>
                </tr>
              </thead>
              <tbody>
                {plots.map((plot) => (
                  <tr key={plot.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 pr-2">
                      <Link href={`/plots/${plot.id}`} className="font-medium text-foreground hover:underline block truncate">
                        {plot.name}
                      </Link>
                    </td>
                    <td className="py-3 text-muted-foreground truncate">{plot.farmerName}</td>
                    <td className="py-3 text-foreground capitalize">{CROP_LABELS[plot.cropType] || plot.cropType}</td>
                    <td className="py-3 text-foreground text-right">{plot.areaHectares} ha</td>
                    <td className="py-3">
                      {plot.status === 'safe' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4FFEC] text-[#4D8B64] border border-[#4D8B64]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4D8B64]" />
                          Safe
                        </span>
                      ) : plot.status === 'near_trigger' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF8E1] text-[#B8860B] border border-[#E2A93B]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E2A93B]" />
                          Near Trigger
                        </span>
                      ) : plot.status === 'triggered' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFDAD6] text-[#C9574F] border border-[#C9574F]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9574F]" />
                          Triggered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          No Insurance
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-muted-foreground text-right">
                      {plot.insurance ? `INR ${plot.insurance.sumInsured.toLocaleString('en-IN')}` : '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
