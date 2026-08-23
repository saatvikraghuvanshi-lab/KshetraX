'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getPlot, getWeatherData, monitorPlot, generateWeatherData } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface WeatherPoint {
  id: string; date: string; rainfallMm: number; temperatureC: number;
  soilMoisture: number | null; normalRainfall: number; rainfallDeviation: number; ndvi: number | null;
}

interface PlotData {
  id: string; name: string; areaHectares: number; cropType: string; cropSeason: string;
  sowingDate: string; stationName: string; stationDist: number;
  farmer: { name: string; village: string; district: string; state: string };
  insurance: { policyNumber: string; sumInsured: number; riskScore: number; rainfallDeviationThreshold: number } | null;
  triggers: Array<{ id: string; date: string; severity: string; explanation: string; payoutPercentage: number }>;
  payouts: Array<{ id: string; payoutNumber: string; payoutAmount: number; status: string }>;
}

interface YieldYear {
  year: number; actualYield: number; expectedYield: number; yieldDeviation: number;
  totalRainfall: number; avgNdvi: number | null; droughtEvents: number;
}

interface CropSensitivity {
  rainfallWeight: number; ndviWeight: number; soilMoistureWeight: number;
  criticalStage: string; baseYieldPerHa: number; pricePerKg: number;
}

const CROP_LABELS: Record<string, string> = {
  rice: 'Rice', wheat: 'Wheat', pulses: 'Pulses', cotton: 'Cotton', sugarcane: 'Sugarcane',
};

export default function PlotDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [plot, setPlot] = useState<PlotData | null>(null);
  const [weather, setWeather] = useState<WeatherPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);
  const [monitorResult, setMonitorResult] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [yieldHistory, setYieldHistory] = useState<YieldYear[]>([]);
  const [cropSensitivity, setCropSensitivity] = useState<CropSensitivity | null>(null);
  const [correlation, setCorrelation] = useState<any>(null);
  const rainfallChartRef = useRef<HTMLCanvasElement>(null);
  const yieldChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [p, w] = await Promise.all([getPlot(id), getWeatherData(id)]);
        setPlot(p);
        setWeather(w);

        // Fetch Phase 2 yield history
        try {
          const yrRes = await fetch(`${API_URL}/yield-history/${id}`);
          if (yrRes.ok) {
            const yrData = await yrRes.json();
            setYieldHistory(yrData.yieldHistory || []);
            setCropSensitivity(yrData.cropSensitivity || null);
            setCorrelation(yrData.correlation || null);
          }
        } catch (e) { /* Phase 2 data optional */ }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  // Initialize charts when weather data changes
  useEffect(() => {
    if (loading || weather.length === 0) return;

    // Cleanup old charts
    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    import('chart.js').then((chartjs) => {
      chartjs.Chart.register(
        chartjs.LineElement, chartjs.PointElement, chartjs.LineController,
        chartjs.LinearScale, chartjs.CategoryScale, chartjs.Filler,
        chartjs.Tooltip, chartjs.Legend, chartjs.BarElement, chartjs.BarController,
      );

      // Rainfall trend chart
      if (rainfallChartRef.current) {
        const ctx = rainfallChartRef.current.getContext('2d');
        if (ctx) {
          const last30 = weather.slice(-30);
          const chart = new chartjs.Chart(ctx, {
            type: 'line',
            data: {
              labels: last30.map(w => new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
              datasets: [
                {
                  label: 'Actual Rainfall (mm)',
                  data: last30.map(w => w.rainfallMm),
                  borderColor: '#123c2a',
                  backgroundColor: 'rgba(18,60,42,0.1)',
                  borderWidth: 2, tension: 0.3, fill: true,
                  pointBackgroundColor: '#123c2a', pointBorderColor: '#fff', pointRadius: 2,
                },
                {
                  label: 'Normal Rainfall (mm)',
                  data: last30.map(w => w.normalRainfall),
                  borderColor: '#c1c8c2', borderWidth: 2, borderDash: [5, 5],
                  tension: 0.3, fill: false, pointRadius: 0,
                },
              ],
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#2e312e', titleFont: { family: 'Inter', size: 11 }, bodyFont: { family: 'Inter', size: 11 } } },
              scales: {
                y: { beginAtZero: true, grid: { color: '#e7e9e4' }, ticks: { font: { size: 10 }, color: '#717973' } },
                x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#717973', maxRotation: 0, maxTicksLimit: 10 } },
              },
              interaction: { intersect: false, mode: 'index' as const },
            },
          });
          chartInstances.current.push(chart);
        }
      }

      // Yield history chart
      if (yieldChartRef.current && yieldHistory.length > 0) {
        const ctx2 = yieldChartRef.current.getContext('2d');
        if (ctx2) {
          const chart2 = new chartjs.Chart(ctx2, {
            type: 'bar',
            data: {
              labels: yieldHistory.map(y => String(y.year)),
              datasets: [
                {
                  label: 'Actual Yield (t/ha)',
                  data: yieldHistory.map(y => y.actualYield),
                  backgroundColor: '#123c2a',
                  borderRadius: 4,
                },
                {
                  label: 'Expected Yield (t/ha)',
                  data: yieldHistory.map(y => y.expectedYield),
                  backgroundColor: '#c1c8c2',
                  borderRadius: 4,
                },
              ],
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#2e312e', titleFont: { family: 'Inter', size: 11 }, bodyFont: { family: 'Inter', size: 11 } } },
              scales: {
                y: { beginAtZero: true, grid: { color: '#e7e9e4' }, ticks: { font: { size: 10 }, color: '#717973' } },
                x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#717973' } },
              },
            },
          });
          chartInstances.current.push(chart2);
        }
      }
    });
  }, [loading, weather, yieldHistory]);

  useEffect(() => {
    return () => { chartInstances.current.forEach(c => c.destroy()); chartInstances.current = []; };
  }, []);

  async function handleMonitor() {
    setMonitoring(true);
    try {
      const r = await monitorPlot(id);
      setMonitorResult(r);
      setWeather(await getWeatherData(id));
    } catch (err) { console.error(err); }
    finally { setMonitoring(false); }
  }

  async function handleGenerate(scenario: string) {
    setGenerating(true);
    try { await generateWeatherData(id, 60, scenario); setWeather(await getWeatherData(id)); }
    catch (err) { console.error(err); }
    finally { setGenerating(false); }
  }

  if (loading || !plot) {
    return (
      <div className="flex h-screen pt-16">
        <aside className="hidden md:block w-60 flex-shrink-0" />
        <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-background">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-container-high" />
        </main>
      </div>
    );
  }

  const avgRainfall = weather.length > 0 ? weather.reduce((s, w) => s + w.rainfallMm, 0) / weather.length : 0;
  const avgNdvi = weather.filter(w => w.ndvi !== null).length > 0
    ? weather.filter(w => w.ndvi !== null).reduce((s, w) => s + (w.ndvi || 0), 0) / weather.filter(w => w.ndvi !== null).length : 0;
  const avgSoil = weather.filter(w => w.soilMoisture !== null).length > 0
    ? weather.filter(w => w.soilMoisture !== null).reduce((s, w) => s + (w.soilMoisture || 0), 0) / weather.filter(w => w.soilMoisture !== null).length : 0;
  const latestDev = weather.length > 0 ? weather[weather.length - 1].rainfallDeviation : 0;
  const triggerDistance = plot.insurance ? Math.max(0, plot.insurance.rainfallDeviationThreshold - latestDev) : 0;
  const risk = monitorResult?.riskAssessment;

  // Thermometer fill level (higher deviation = more filled)
  const thermometerFill = Math.min(100, Math.max(5, latestDev));

  return (
    <div className="flex h-screen pt-16">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
        {/* Header */}
        <header className="mb-md flex justify-between items-end border-b border-outline-variant pb-sm">
          <div>
            <Link href="/plots" className="text-caption text-primary hover:underline flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Plots
            </Link>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">{plot.name}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              {plot.farmer.name} &middot; {plot.farmer.village}, {plot.farmer.district}, {plot.farmer.state}
            </p>
          </div>
          {risk?.severity === 'triggered' && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-2 rounded-full border border-error pulse-alert">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span className="font-label-md text-label-md font-bold">Trigger Activated</span>
            </div>
          )}
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-md mb-md">
          {/* Left: Weather Chart (8 cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-sm md:p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <div className="flex items-center gap-3">
                <span className="font-headline-md text-headline-md text-on-surface text-lg">{plot.name}</span>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${
                  risk?.severity === 'triggered'
                    ? 'bg-error-container text-on-error-container border-error'
                    : 'bg-secondary-container text-on-secondary-container border-outline-variant'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${risk?.severity === 'triggered' ? 'bg-[#C9574F]' : 'bg-[#4D8B64]'}`} />
                  {risk?.severity === 'triggered' ? 'Triggered' : 'Safe'}
                </span>
              </div>
              <span className="font-caption text-caption text-on-surface-variant">{CROP_LABELS[plot.cropType]} &middot; {plot.areaHectares} ha</span>
            </div>
            <div className="p-md min-h-[300px]">
              {weather.length > 0 ? (
                <div className="relative h-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined">water_drop</span> Rainfall Trend (Last 30 days)
                    </h3>
                  </div>
                  <canvas ref={rainfallChartRef} />
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-on-surface-variant font-caption">
                  Generate weather data to see trends
                </div>
              )}
            </div>
          </div>

          {/* Right: Thermometer + Metrics (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-md">
            {/* Thermometer Indicator */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md flex-1">
              <h3 className="font-label-md text-label-md text-on-surface mb-6">Distance to Trigger</h3>
              <div className="flex gap-6 items-center">
                {/* Thermometer bar */}
                <div className="w-8 h-48 bg-surface-container-high rounded-full relative border border-outline-variant flex flex-col justify-end p-1">
                  <div
                    className={`w-full rounded-full transition-all duration-1000 ease-in-out ${
                      thermometerFill > 60 ? 'bg-[#C9574F]' :
                      thermometerFill > 30 ? 'bg-[#E2A93B]' : 'bg-[#4D8B64]'
                    }`}
                    style={{ height: `${thermometerFill}%` }}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="font-caption text-caption text-on-surface-variant">Current Deficit</p>
                    <p className={`font-headline-md text-headline-md font-bold ${
                      latestDev > 60 ? 'text-[#C9574F]' : latestDev > 30 ? 'text-[#E2A93B]' : 'text-primary'
                    }`}>{latestDev.toFixed(0)}%</p>
                  </div>
                  <div className="w-full h-px bg-outline-variant" />
                  <div>
                    <p className="font-caption text-caption text-on-surface-variant">Trigger Threshold</p>
                    <p className="font-headline-md text-headline-md font-bold text-on-surface">{plot.insurance?.rainfallDeviationThreshold || 30}%</p>
                  </div>
                  {triggerDistance < 10 && (
                    <p className="font-caption text-caption text-[#E2A93B] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">warning</span> Approaching Warning Zone
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-label-md text-label-md text-on-surface">Soil Moisture</h3>
                <span className="text-[#4D8B64]"><span className="material-symbols-outlined text-[16px]">trending_up</span></span>
              </div>
              <p className="font-headline-md text-headline-md font-bold text-primary">{avgSoil.toFixed(1)}%</p>
            </div>

            {/* Crop Sensitivity (Phase 2) */}
            {cropSensitivity && (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
                <h3 className="font-label-md text-label-md text-on-surface mb-3">Crop Sensitivity Weights</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Rainfall', weight: cropSensitivity.rainfallWeight, icon: 'water_drop' },
                    { label: 'NDVI', weight: cropSensitivity.ndviWeight, icon: 'eco' },
                    { label: 'Soil Moisture', weight: cropSensitivity.soilMoistureWeight, icon: 'grass' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="font-caption text-caption text-on-surface-variant">{item.label}</span>
                          <span className="font-caption text-caption text-on-surface font-medium">{(item.weight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full">
                          <div className="h-1.5 bg-primary rounded-full" style={{ width: `${item.weight * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="font-caption text-caption text-on-surface-variant mt-3">Critical stage: <span className="text-on-surface font-medium capitalize">{cropSensitivity.criticalStage.replace('_', ' ')}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-md">
          <h3 className="font-label-md text-label-md text-on-surface mb-4">Simulation Controls</h3>
          <div className="flex flex-wrap gap-sm">
            {[
              { scenario: 'normal', label: 'Normal Weather' },
              { scenario: 'mild_deficit', label: 'Mild Deficit' },
              { scenario: 'severe_deficit', label: 'Severe Deficit' },
              { scenario: 'extreme_deficit', label: 'Extreme Drought' },
            ].map((s) => (
              <button key={s.scenario} onClick={() => handleGenerate(s.scenario)} disabled={generating}
                className="bg-surface border border-outline-variant text-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-50">
                {s.label}
              </button>
            ))}
            <div className="w-px bg-outline-variant mx-1" />
            <button onClick={handleMonitor} disabled={monitoring}
              className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              {monitoring ? 'Running...' : 'Run Risk Assessment'}
            </button>
          </div>
        </div>

        {/* Yield History Chart (Phase 2) */}
        {yieldHistory.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-label-md text-label-md text-on-surface">Historical Yield Correlation</h3>
              {correlation && (
                <span className="font-caption text-caption text-on-surface-variant">
                  Rainfall-Yield Correlation: <span className="text-primary font-medium">{correlation.rainfallYieldCorrelation}</span>
                </span>
              )}
            </div>
            <div className="relative h-[250px]">
              <canvas ref={yieldChartRef} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-outline-variant">
              <div>
                <p className="font-caption text-caption text-on-surface-variant">Avg Yield</p>
                <p className="font-headline-md text-headline-md text-primary font-bold">
                  {(yieldHistory.reduce((s, y) => s + y.actualYield, 0) / yieldHistory.length).toFixed(2)} t/ha
                </p>
              </div>
              <div>
                <p className="font-caption text-caption text-on-surface-variant">Drought Years</p>
                <p className="font-headline-md text-headline-md font-bold text-on-surface">
                  {yieldHistory.filter(y => y.droughtEvents > 0).length} / {yieldHistory.length}
                </p>
              </div>
              <div>
                <p className="font-caption text-caption text-on-surface-variant">Expected Price</p>
                <p className="font-headline-md text-headline-md text-primary font-bold">
                  INR {cropSensitivity ? (cropSensitivity.baseYieldPerHa * cropSensitivity.pricePerKg * 1000).toLocaleString('en-IN') : '---'}/ha
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tiered Payout Slabs */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-md">
          <h3 className="font-label-md text-label-md text-on-surface mb-4">Tiered Payout Slabs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
            {[
              { phase: 'Phase 1 Trigger', icon: 'water_drop', amount: '25%', threshold: 'Deficit 30-60%', active: latestDev >= 30 && latestDev < 60 },
              { phase: 'Phase 2 Trigger', icon: 'grain', amount: '50%', threshold: 'Deficit 60-80%', active: latestDev >= 60 && latestDev < 80 },
              { phase: 'Severe Phase', icon: 'storm', amount: '100%', threshold: 'Deficit 80%+', active: latestDev >= 80 },
            ].map((slab, i) => (
              <div key={i} className={`rounded-lg p-4 border border-outline-variant flex flex-col ${
                slab.active ? 'bg-primary-container relative overflow-hidden' : 'bg-surface-container-low'
              }`}>
                {slab.active && <div className="absolute right-0 top-0 w-16 h-16 bg-primary opacity-10 rounded-bl-full" />}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className={`px-2 py-1 rounded text-caption font-caption ${slab.active ? 'bg-surface text-primary' : 'bg-surface-container text-on-surface-variant'}`}>{slab.phase}</span>
                  <span className={`material-symbols-outlined ${slab.active ? 'text-primary' : 'text-outline'}`}>{slab.icon}</span>
                </div>
                <p className={`font-headline-md text-headline-md font-bold mb-1 relative z-10 ${slab.active ? 'text-on-primary-container' : 'text-primary'}`}>
                  {slab.amount} <span className="text-caption font-caption text-on-surface-variant font-normal">of sum insured</span>
                </p>
                <p className={`font-caption text-caption relative z-10 ${slab.active ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>{slab.threshold}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Triggers & Payouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
            <h3 className="font-label-md text-label-md text-on-surface mb-4">Trigger Events ({plot.triggers.length})</h3>
            {plot.triggers.length === 0 ? (
              <p className="font-caption text-caption text-on-surface-variant">No triggers recorded.</p>
            ) : (
              <div className="space-y-3">
                {plot.triggers.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded text-caption font-caption ${
                        t.severity === 'severe' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
                      }`}>{t.severity}</span>
                      <span className="font-caption text-caption text-on-surface-variant">{new Date(t.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant">{t.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
            <h3 className="font-label-md text-label-md text-on-surface mb-4">Payouts ({plot.payouts.length})</h3>
            {plot.payouts.length === 0 ? (
              <p className="font-caption text-caption text-on-surface-variant">No payouts recorded.</p>
            ) : (
              <div className="space-y-3">
                {plot.payouts.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-md text-headline-md text-primary font-bold">INR {p.payoutAmount.toLocaleString('en-IN')}</span>
                      <span className={`px-2 py-0.5 rounded text-caption font-caption ${
                        p.status === 'disbursed' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'
                      }`}>{p.status}</span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant mt-1">{p.payoutNumber}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
