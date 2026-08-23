'use client';

import { useState, useEffect } from 'react';
import { getPlots, generateWeatherData, monitorPlot } from '@/lib/api';

interface Plot {
  id: string; name: string; cropType: string; areaHectares: number;
  farmer: { name: string };
}

interface MonitorResult {
  weatherSummary: { avgRainfall: number; normalRainfall: number; avgTemp: number; avgNdvi: number | null; avgSoilMoisture: number | null };
  riskAssessment: { rainfallDeviation: number; compositeRisk: number; severity: string };
  triggerResult: {
    triggered: boolean; severity: string; payoutPercentage: number; payoutMultiplier: number;
    explanation: string; formulaBreakdown: string;
  } | null;
}

const SCENARIOS = [
  { id: 'normal', label: 'Normal Season', desc: 'Average rainfall, healthy crops' },
  { id: 'mild_deficit', label: 'Mild Deficit', desc: '25-35% below normal rainfall' },
  { id: 'severe_deficit', label: 'Severe Drought', desc: '50-65% below normal rainfall' },
  { id: 'extreme_deficit', label: 'Extreme Drought', desc: '75-90% below normal, crop failure' },
];

export default function DemoPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('severe_deficit');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<MonitorResult | null>(null);

  useEffect(() => {
    getPlots().then(setPlots).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function runDemo() {
    if (!selectedPlot) return;
    setStep(1);
    await generateWeatherData(selectedPlot, 60, selectedScenario);
    setStep(2);
    const r = await monitorPlot(selectedPlot);
    setResult(r);
    setStep(3);
  }

  return (
    <div className="flex h-screen pt-16">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
        <header className="mb-md flex justify-between items-end border-b border-outline-variant pb-sm">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary">Demo Impact UI</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Live simulation: Active Insurance Trigger</p>
          </div>
          {step === 3 && result?.triggerResult?.triggered && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-2 rounded-full border border-error pulse-alert">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span className="font-label-md text-label-md font-bold">Trigger Activated</span>
            </div>
          )}
        </header>

        {/* Step 0: Select */}
        {step === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Select Plot & Weather Scenario</h3>
              <div className="mb-4">
                <label className="font-label-md text-label-md text-on-surface block mb-2">Farmer Plot</label>
                <select value={selectedPlot} onChange={(e) => setSelectedPlot(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none">
                  <option value="">Select a plot</option>
                  {plots.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.farmer.name} ({p.cropType}, {p.areaHectares} ha)</option>
                  ))}
                </select>
              </div>
              <label className="font-label-md text-label-md text-on-surface block mb-2">Weather Scenario</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mb-6">
                {SCENARIOS.map(s => (
                  <button key={s.id} onClick={() => setSelectedScenario(s.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedScenario === s.id
                        ? 'border-primary bg-primary-container text-on-primary-container'
                        : 'border-outline-variant bg-surface hover:bg-surface-variant'
                    }`}>
                    <p className="font-label-md text-label-md">{s.label}</p>
                    <p className="font-caption text-caption text-on-surface-variant mt-1">{s.desc}</p>
                  </button>
                ))}
              </div>
              <button onClick={runDemo} disabled={!selectedPlot}
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-tint transition-colors disabled:opacity-50">
                Run Simulation
              </button>
            </div>
            <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
              <h3 className="font-label-md text-label-md text-on-surface mb-4">Transparency</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant">
                  <div className="w-10 h-10 rounded-full bg-[#E8F4FD] text-[#2196F3] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">satellite_alt</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Satellite Source</h4>
                    <p className="font-caption text-caption text-on-surface-variant font-mono mt-1">Sentinel-2 L2A</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant">
                  <div className="w-10 h-10 rounded-full bg-[#FFF8E1] text-[#F57C00] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">thermostat</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Weather Station</h4>
                    <p className="font-caption text-caption text-on-surface-variant font-mono mt-1">IMD Synoptic</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant">
                  <div className="w-10 h-10 rounded-full bg-[#F4FFEC] text-[#4D8B64] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">calculate</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Payout Formula</h4>
                    <p className="font-caption text-caption text-on-surface-variant mt-1">Transparent, farmer-visible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Steps 1 & 2: Loading */}
        {(step === 1 || step === 2) && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4">progress_activity</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              {step === 1 ? 'Ingesting Data...' : 'Running Risk Assessment...'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {step === 1 ? 'Fetching satellite NDVI, rainfall, and soil moisture' : 'Computing composite risk index and checking thresholds'}
            </p>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
            {/* Trigger Alert Card */}
            <div className={`col-span-1 md:col-span-4 rounded-xl p-md flex flex-col justify-center items-center relative overflow-hidden ${
              result.triggerResult?.triggered
                ? 'bg-surface-container-lowest border border-trigger-alert shadow-[0px_4px_12px_rgba(201,87,79,0.15)]'
                : 'bg-surface-container-lowest border border-accent-safe'
            }`}>
              {result.triggerResult?.triggered && (
                <div className="absolute top-0 left-0 w-full h-1 bg-trigger-alert pulse-alert" />
              )}
              <div className="text-center">
                <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Rainfall Deficit</h2>
                <div className={`font-headline-md text-[44px] leading-tight font-bold mb-2 ${
                  result.triggerResult?.triggered ? 'text-trigger-alert' : 'text-primary'
                }`}>{result.riskAssessment.rainfallDeviation.toFixed(0)}% Deficit</div>
                <p className="font-caption text-caption text-on-surface-variant">
                  {result.triggerResult?.triggered ? 'Threshold exceeded' : 'Within safe range'}
                </p>
              </div>
            </div>

            {/* Payout Notification */}
            <div className="col-span-1 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-center">
              <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">payments</span>
                Payout Trigger Notification
              </h3>
              {result.triggerResult?.triggered ? (
                <>
                  <div className="bg-surface-container rounded-lg p-sm border-l-4 border-trigger-alert font-body-lg text-body-lg text-on-surface">
                    <strong>Rainfall deficit = {result.riskAssessment.rainfallDeviation.toFixed(0)}%</strong>, payout = <strong className="text-primary">{result.triggerResult.payoutPercentage}% of sum insured</strong>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <button className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">Process Claim</button>
                    <button className="bg-surface text-primary border border-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-surface-variant transition-colors">View Contract</button>
                  </div>
                </>
              ) : (
                <div className="bg-surface-container rounded-lg p-sm border-l-4 border-accent-safe font-body-lg text-body-lg text-on-surface">
                  All clear. Risk score: <strong>{result.riskAssessment.compositeRisk.toFixed(1)}/100</strong>. No thresholds crossed.
                </div>
              )}
            </div>

            {/* Threshold Visual */}
            <div className="col-span-1 md:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-md min-h-[300px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-md text-label-md text-on-surface-variant">Threshold Crossing Visual</h3>
                <span className="font-caption text-caption px-2 py-1 bg-surface-variant rounded text-on-surface-variant">Real-time</span>
              </div>
              <div className="flex-1 relative bg-surface rounded-lg border border-outline-variant overflow-hidden p-4 flex flex-col justify-end">
                <div className="absolute left-4 top-4 bottom-4 w-8 flex flex-col justify-between text-caption text-on-surface-variant">
                  <span>0%</span><span>20%</span><span className="text-trigger-alert font-bold">30%</span><span>40%</span>
                </div>
                <div className="absolute left-12 right-4 bottom-[75%] h-px border-b-2 border-dashed border-trigger-alert">
                  <span className="absolute -top-6 right-0 text-caption text-trigger-alert font-bold bg-surface px-1">Trigger (30%)</span>
                </div>
                <div className="pl-12 h-full flex items-end justify-around gap-2">
                  {[20, 40, 60, Math.min(95, result.riskAssessment.rainfallDeviation * 2.5)].map((h, i) => (
                    <div key={i} className={`w-1/6 rounded-t-sm transition-all duration-1000 ${
                      i === 3 && result.riskAssessment.rainfallDeviation > 30
                        ? 'bg-error-container border border-error shadow-[0_0_15px_rgba(201,87,79,0.4)]'
                        : 'bg-primary-fixed'
                    }`} style={{ height: `${h}%` }}>
                      {i === 3 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-trigger-alert text-on-error text-caption font-bold px-2 py-1 rounded">
                          {result.riskAssessment.rainfallDeviation.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transparency Breakdown */}
            <div className="col-span-1 md:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-4">Transparency Breakdown</h3>
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#E8F4FD] text-[#2196F3] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">satellite_alt</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Satellite Tile</h4>
                    <p className="font-caption text-caption text-on-surface-variant font-mono mt-1">Sentinel-2 L2A</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#FFF8E1] text-[#F57C00] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">thermostat</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Weather Station</h4>
                    <p className="font-caption text-caption text-on-surface-variant font-mono mt-1">IMD Synoptic Network</p>
                  </div>
                </div>
                {result.triggerResult && (
                  <div className="mt-auto pt-4 bg-surface-container-low rounded-lg p-3 border border-outline-variant">
                    <p className="font-label-md text-label-md text-on-surface mb-2">Formula</p>
                    <pre className="text-caption font-caption text-on-surface-variant whitespace-pre-wrap">{result.triggerResult.formulaBreakdown}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reset */}
        {step === 3 && (
          <button onClick={() => { setStep(0); setResult(null); }}
            className="mt-md w-full bg-surface text-primary border border-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-variant transition-colors">
            Run Another Scenario
          </button>
        )}
      </main>
    </div>
  );
}
