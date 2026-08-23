'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDashboardStats, getRecentActivity, getMapData, getCropSummary } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Stats {
  totalFarmers: number; totalPlots: number; activePolicies: number;
  totalTriggers: number; pendingPayouts: number; disbursedPayouts: number;
  totalPayoutAmount: number; totalAreaInsured: number;
}

interface Trigger {
  id: string; date: string; severity: string; rainfallDeviation: number;
  explanation: string; payoutPercentage: number;
  plot: { name: string; cropType: string };
}

interface CropSummary {
  cropType: string; plotCount: number; totalArea: number;
  triggerCount: number; totalPayoutDisbursed: number;
}

interface MapPlot {
  id: string; name: string; centerLat: number; centerLng: number;
  cropType: string; areaHectares: number; farmerName: string; status: string;
}

const CROP_LABELS: Record<string, string> = { rice: 'Rice', wheat: 'Wheat', pulses: 'Pulses', cotton: 'Cotton', sugarcane: 'Sugarcane' };
const CROP_ICONS: Record<string, string> = { rice: 'rice_bowl', wheat: 'grass', pulses: 'spa', cotton: 'park', sugarcane: 'yard' };
const STATUS_COLORS: Record<string, string> = { safe: '#4D8B64', near_trigger: '#E2A93B', triggered: '#C9574F', no_insurance: '#717973' };

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [cropSummary, setCropSummary] = useState<CropSummary[]>([]);
  const [mapPlots, setMapPlots] = useState<MapPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, a, c, m] = await Promise.all([getDashboardStats(), getRecentActivity(), getCropSummary(), getMapData()]);
        setStats(s); setTriggers(a.recentTriggers || []); setCropSummary(c); setMapPlots(m);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  // Leaflet map
  useEffect(() => {
    if (loading || mapPlots.length === 0) return;
    import('leaflet').then((L) => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      const el = document.getElementById('dashboard-map');
      if (!el) return;
      const map = L.map('dashboard-map', { zoomControl: false }).setView([22.5, 78.5], 5);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap', maxZoom: 18,
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapPlots.forEach((plot) => {
        const color = STATUS_COLORS[plot.status] || '#717973';
        const icon = L.divIcon({
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
          html: `<div style="width:14px;height:14px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>`,
        });
        L.marker([plot.centerLat, plot.centerLng], { icon }).addTo(map)
          .bindPopup(`<div style="font-family:Inter;font-size:12px;padding:4px;"><b>${plot.name}</b><br/>${plot.farmerName} · ${plot.areaHectares}ha</div>`);
      });

      setTimeout(() => {
        try {
          if (mapPlots.length > 0 && mapRef.current) {
            mapRef.current.fitBounds(L.latLngBounds(mapPlots.map(p => [p.centerLat, p.centerLng])), { padding: [40, 40] });
          }
        } catch (e) { /* Leaflet container may have been removed */ }
      }, 100);
    });
  }, [loading, mapPlots]);

  // Chart.js
  useEffect(() => {
    if (loading || !chartRef.current) return;
    import('chart.js').then((chartjs) => {
      chartjs.Chart.register(chartjs.LineElement, chartjs.PointElement, chartjs.LineController,
        chartjs.LinearScale, chartjs.CategoryScale, chartjs.Filler, chartjs.Tooltip);
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;
      chartInstanceRef.current = new chartjs.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            { label: 'Actual', data: [45, 52, 38, 65, 80, 55], borderColor: '#123C2A', backgroundColor: 'rgba(18,60,42,0.08)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#123C2A' },
            { label: 'Normal', data: [50, 48, 45, 60, 70, 60], borderColor: '#C1C8C2', borderWidth: 2, borderDash: [4, 4], tension: 0.4, fill: false, pointRadius: 0 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#191C1A', titleFont: { family: 'Inter', size: 11 }, bodyFont: { family: 'Inter', size: 11 }, padding: 10, cornerRadius: 8, displayColors: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#E7E9E4' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#717973' } },
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 }, color: '#717973' } },
          },
          interaction: { intersect: false, mode: 'index' as const },
        },
      });
    });
  }, [loading]);

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } if (chartInstanceRef.current) { chartInstanceRef.current.destroy(); } }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen pt-14">
        <aside className="hidden md:block w-60 flex-shrink-0" />
        <main className="flex-1 p-4 md:p-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-surface-container-high rounded-lg" />
            <div className="h-4 w-64 bg-surface-container-high rounded-lg" />
            <div className="h-[400px] bg-surface-container-high rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  const safeCount = mapPlots.filter(p => p.status === 'safe').length;
  const nearCount = mapPlots.filter(p => p.status === 'near_trigger').length;
  const triggeredCount = mapPlots.filter(p => p.status === 'triggered').length;

  return (
    <div className="flex min-h-screen pt-14">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 animate-slide-up">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-headline-xl text-primary mb-1">Plot Overview</h1>
          <p className="text-body-md text-on-surface-variant">Real-time geospatial monitoring and premium valuation.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Farmers', value: stats?.totalFarmers || 0, icon: 'group', color: 'text-primary' },
            { label: 'Plots', value: stats?.totalPlots || 0, icon: 'potted_plant', color: 'text-primary' },
            { label: 'Active Policies', value: stats?.activePolicies || 0, icon: 'verified_user', color: 'text-safe' },
            { label: 'Total Payouts', value: `₹${((stats?.totalPayoutAmount || 0) / 100000).toFixed(1)}L`, icon: 'payments', color: 'text-primary' },
          ].map((stat, i) => (
            <Card key={i} className="card-interactive">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined text-[18px] ${stat.color}`}>{stat.icon}</span>
                  <span className="text-overline text-on-surface-variant">{stat.label}</span>
                </div>
                <p className={`text-headline-md font-grotesk font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                  <div className="flex items-center gap-3">
                    <span className="text-title-sm">All Plots</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-caption-sm"><span className="w-2 h-2 rounded-full bg-safe" />{safeCount}</span>
                      <span className="flex items-center gap-1 text-caption-sm"><span className="w-2 h-2 rounded-full bg-warning" />{nearCount}</span>
                      <span className="flex items-center gap-1 text-caption-sm"><span className="w-2 h-2 rounded-full bg-trigger-alert" />{triggeredCount}</span>
                    </div>
                  </div>
                </div>
                <div id="dashboard-map" className="h-[350px] md:h-[450px]" />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
                  <span className="text-title-sm">Premium Valuation</span>
                </div>
                <p className="text-display-md font-grotesk font-bold text-primary mb-1">₹{(stats?.totalPayoutAmount || 0).toLocaleString('en-IN')}</p>
                <p className="text-caption-md text-on-surface-variant mb-3">Total disbursed</p>
                <Separator className="mb-3" />
                <div className="space-y-2 text-body-sm">
                  <div className="flex justify-between"><span className="text-on-surface-variant">Active Policies</span><span className="font-semibold">{stats?.activePolicies || 0}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Farmers</span><span className="font-semibold">{stats?.totalFarmers || 0}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Area Insured</span><span className="font-semibold">{stats?.totalAreaInsured?.toFixed(1)} ha</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">water_drop</span>
                    <span className="text-title-sm">Rainfall Index</span>
                  </div>
                  <span className="text-caption-sm text-on-surface-variant">Last 6 Mos</span>
                </div>
                <div className="h-[180px]"><canvas ref={chartRef} /></div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Crop Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {cropSummary.map((crop) => (
            <Card key={crop.cropType} className="card-interactive">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-[16px]">{CROP_ICONS[crop.cropType] || 'eco'}</span>
                  <span className="text-overline text-on-surface-variant">{CROP_LABELS[crop.cropType]}</span>
                </div>
                <p className="text-headline-sm font-grotesk font-bold text-primary">{crop.plotCount}</p>
                <p className="text-caption-sm text-on-surface-variant">{crop.totalArea.toFixed(1)} ha</p>
                {crop.triggerCount > 0 && <Badge variant="destructive" className="mt-2 text-[10px]">{crop.triggerCount} triggers</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Triggers */}
        {triggers.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-title-sm">Recent Triggers</span>
                <Link href="/triggers"><Button variant="ghost" size="sm" className="text-primary gap-1">View All<span className="material-symbols-outlined text-[16px]">arrow_forward</span></Button></Link>
              </div>
              <div className="space-y-3">
                {triggers.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      t.severity === 'severe' ? 'bg-trigger-alert-bg text-trigger-alert' :
                      t.severity === 'moderate' ? 'bg-warning-bg text-warning' : 'bg-safe-bg text-safe'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-title-sm truncate">{t.plot.name}</p>
                      <p className="text-caption-md text-on-surface-variant line-clamp-1">{t.explanation}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-headline-sm font-grotesk font-bold text-trigger-alert">-{t.rainfallDeviation.toFixed(0)}%</p>
                      <p className="text-caption-sm text-on-surface-variant">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
