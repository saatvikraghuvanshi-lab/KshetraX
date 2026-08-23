'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Farmer {
  id: string; name: string; village: string; district: string; state: string;
  plots: { id: string; name: string; cropType: string; areaHectares: number; centerLat: number; centerLng: number }[];
}

interface PlotDetail {
  id: string; name: string; areaHectares: number; cropType: string; centerLat: number; centerLng: number;
  farmer: { name: string; village: string; district: string; state: string };
  insurance: { policyNumber: string; sumInsured: number; premiumAmount: number; riskScore: number; rainfallDeviationThreshold: number } | null;
  weatherData: { date: string; rainfallMm: number; temperatureC: number; ndvi: number | null; soilMoisture: number | null; rainfallDeviation: number }[];
  triggers: { id: string; date: string; severity: string; explanation: string; payoutPercentage: number }[];
  payouts: { id: string; payoutNumber: string; payoutAmount: number; status: string }[];
}

interface SatelliteData {
  totalScenes: number; source: string;
  scenes: { id: string; cloudCover: number; platform: string }[];
}

interface WeatherData {
  weather: { source: string; dataPoints: number; sample: { date: string; rainfall: number; temperature: number }[] };
  soilMoisture: { source: string; dataPoints: number };
}

const CROP_LABELS: Record<string, string> = { rice: 'Rice', wheat: 'Wheat', pulses: 'Pulses', cotton: 'Cotton', sugarcane: 'Sugarcane' };

export default function JourneyPage() {
  const [step, setStep] = useState(0);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<PlotDetail | null>(null);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);
  const [realWeather, setRealWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/farmers`).then(r => r.json()).then(setFarmers).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function selectFarmer(farmer: Farmer) {
    setSelectedFarmer(farmer);
    if (farmer.plots.length > 0) {
      const plotId = farmer.plots[0].id;
      const [plotRes, satRes, weatherRes] = await Promise.all([
        fetch(`${API_URL}/plots/${plotId}`).then(r => r.json()),
        fetch(`${API_URL}/satellite/search?lat=${farmer.plots[0].centerLat}&lng=${farmer.plots[0].centerLng}`).then(r => r.json()).catch(() => null),
        fetch(`${API_URL}/weather/fetch-real`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plotId, days: 7 }) }).then(r => r.json()).catch(() => null),
      ]);
      setSelectedPlot(plotRes);
      setSatelliteData(satRes);
      setRealWeather(weatherRes);
      setStep(1);
    }
  }

  async function runSimulation(scenario: string) {
    if (!selectedPlot) return;
    setSimulationRunning(true);
    setStep(3);
    try {
      // Generate weather
      await fetch(`${API_URL}/weather/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plotId: selectedPlot.id, days: 60, scenario }),
      });
      // Monitor
      const result = await fetch(`${API_URL}/weather/monitor`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plotId: selectedPlot.id }),
      }).then(r => r.json());
      setSimulationResult(result);
    } catch (err) { console.error(err); }
    finally { setSimulationRunning(false); }
  }

  const steps = [
    { num: 1, title: 'Plot Registration', desc: 'Farmer provides GPS coordinates', icon: 'add_location' },
    { num: 2, title: 'Premium Calculation', desc: 'System computes risk and premium', icon: 'calculate' },
    { num: 3, title: 'Live Monitoring', desc: 'Satellite + weather data ingestion', icon: 'satellite_alt' },
    { num: 4, title: 'Trigger & Payout', desc: 'Automatic payout on threshold breach', icon: 'bolt' },
  ];

  return (
    <div className="flex h-screen pt-16">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-background">
        <header className="mb-6">
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-primary mb-1">Farmer Journey</h1>
          <p className="text-sm text-on-surface-variant">Complete walkthrough: from registration to instant payout — with real data sources</p>
        </header>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => s.num <= step + 1 && setStep(Math.max(0, s.num - 1))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  step === s.num - 1 ? 'bg-primary text-white' :
                  step > s.num - 1 ? 'bg-[#4D8B64]/10 text-[#4D8B64]' :
                  'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {step > s.num - 1 ? (
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-[10px] font-bold">{s.num}</span>
                )}
                <span className="hidden md:inline">{s.title}</span>
              </button>
              {i < steps.length - 1 && <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>}
            </div>
          ))}
        </div>

        {/* Step 0: Onboarding */}
        {step === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                  Select a Farmer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-container-high" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {farmers.map(f => (
                      <button key={f.id} onClick={() => selectFarmer(f)}
                        className="w-full text-left p-3 rounded-lg border border-outline-variant hover:bg-surface-variant hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{f.name}</p>
                            <p className="text-xs text-on-surface-variant">{f.village}, {f.district}, {f.state}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{f.plots.length} plot{f.plots.length > 1 ? 's' : ''}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">map</span>
                  What Happens at Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-on-surface-variant">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#2196F3] text-lg">add_location</span>
                  <div><p className="font-medium text-on-surface">GPS Coordinates</p><p>Farmer provides plot boundaries via mobile app or cadastral map</p></div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#F57C00] text-lg">wifi</span>
                  <div><p className="font-medium text-on-surface">Nearest Station</p><p>System links plot to closest weather station for redundancy</p></div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#4D8B64] text-lg">satellite_alt</span>
                  <div><p className="font-medium text-on-surface">Satellite Tile</p><p>STAC API finds Sentinel-2 tile covering the plot</p></div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#7B1FA2] text-lg">calculate</span>
                  <div><p className="font-medium text-on-surface">Premium Computed</p><p>Risk index calculated from crop type, area, and historical weather</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 1: Premium */}
        {step === 1 && selectedPlot && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calculate</span>
                  Premium for {selectedPlot.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-surface border border-outline-variant">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Farmer</p>
                    <p className="text-sm font-medium">{selectedPlot.farmer.name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-outline-variant">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Crop</p>
                    <p className="text-sm font-medium">{CROP_LABELS[selectedPlot.cropType]}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-outline-variant">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Area</p>
                    <p className="text-sm font-medium">{selectedPlot.areaHectares} ha</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-outline-variant">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Coordinates</p>
                    <p className="text-xs font-mono">{selectedPlot.centerLat.toFixed(2)}, {selectedPlot.centerLng.toFixed(2)}</p>
                  </div>
                </div>

                {selectedPlot.insurance ? (
                  <div className="p-4 rounded-lg bg-primary-container text-on-primary-container">
                    <p className="text-xs uppercase tracking-wider mb-2 opacity-70">Insurance Policy</p>
                    <p className="text-lg font-bold">{selectedPlot.insurance.policyNumber}</p>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      <div><p className="opacity-70">Sum Insured</p><p className="font-bold">INR {selectedPlot.insurance.sumInsured.toLocaleString('en-IN')}</p></div>
                      <div><p className="opacity-70">Risk Score</p><p className="font-bold">{selectedPlot.insurance.riskScore}/100</p></div>
                      <div><p className="opacity-70">Trigger Threshold</p><p className="font-bold">{selectedPlot.insurance.rainfallDeviationThreshold}%</p></div>
                      <div><p className="opacity-70">Status</p><p className="font-bold">Active</p></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">No active insurance. Register first.</p>
                )}

                <Button onClick={() => setStep(2)} className="w-full">
                  Continue to Monitoring
                  <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">satellite_alt</span>
                  Live Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border border-outline-variant">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">Sentinel-2 (STAC API)</p>
                    <Badge variant="secondary" className="text-[10px]">{satelliteData?.source || 'Checking...'}</Badge>
                  </div>
                  {satelliteData && (
                    <p className="text-[11px] text-on-surface-variant">
                      {satelliteData.totalScenes} scene{satelliteData.totalScenes !== 1 ? 's' : ''} found
                      {satelliteData.scenes?.[0] && ` — Latest: ${satelliteData.scenes[0].id} (${satelliteData.scenes[0].cloudCover.toFixed(0)}% cloud)`}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-outline-variant">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">Open-Meteo Weather</p>
                    <Badge variant="secondary" className="text-[10px]">{realWeather?.weather?.source || 'Checking...'}</Badge>
                  </div>
                  {realWeather?.weather?.sample?.[0] && (
                    <p className="text-[11px] text-on-surface-variant">
                      {realWeather.weather.dataPoints} data points — Latest: {realWeather.weather.sample[0].rainfall}mm rain, {realWeather.weather.sample[0].temperature.toFixed(1)}°C
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-outline-variant">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">SMAP Soil Moisture</p>
                    <Badge variant="secondary" className="text-[10px]">{realWeather?.soilMoisture?.source || 'Checking...'}</Badge>
                  </div>
                  {realWeather?.soilMoisture && (
                    <p className="text-[11px] text-on-surface-variant">{realWeather.soilMoisture.dataPoints} hourly readings (0-7cm depth)</p>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-outline-variant">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">Nearest Weather Station</p>
                    <Badge variant="secondary" className="text-[10px]">IMD Network</Badge>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">10 stations across India with nearest-station lookup</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Monitoring */}
        {step === 2 && selectedPlot && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Rainfall', icon: 'water_drop', value: selectedPlot.weatherData?.length ? `${selectedPlot.weatherData[selectedPlot.weatherData.length - 1].rainfallMm}mm` : 'No data', sub: 'Last measurement' },
                { label: 'NDVI', icon: 'eco', value: selectedPlot.weatherData?.length ? (selectedPlot.weatherData[selectedPlot.weatherData.length - 1].ndvi?.toFixed(2) || 'N/A') : 'No data', sub: 'Crop health index' },
                { label: 'Soil Moisture', icon: 'grass', value: selectedPlot.weatherData?.length ? `${selectedPlot.weatherData[selectedPlot.weatherData.length - 1].soilMoisture?.toFixed(1) || 'N/A'}%` : 'No data', sub: 'Volumetric water content' },
              ].map((m, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary">{m.icon}</span>
                      <p className="text-xs font-medium text-on-surface-variant">{m.label}</p>
                    </div>
                    <p className="text-2xl font-bold font-['Space_Grotesk'] text-primary">{m.value}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">{m.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                  Run Weather Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-on-surface-variant mb-4">Select a weather scenario to simulate. The system will generate 60 days of data and run risk assessment.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { scenario: 'normal', label: 'Normal Season', desc: 'Average rainfall', color: 'border-[#4D8B64]' },
                    { scenario: 'mild_deficit', label: 'Mild Deficit', desc: '25-35% below normal', color: 'border-[#E2A93B]' },
                    { scenario: 'severe_deficit', label: 'Severe Drought', desc: '50-65% below normal', color: 'border-[#C9574F]' },
                    { scenario: 'extreme_deficit', label: 'Extreme Drought', desc: '75-90% below normal', color: 'border-error' },
                  ].map(s => (
                    <button key={s.scenario} onClick={() => runSimulation(s.scenario)} disabled={simulationRunning}
                      className={`p-4 rounded-lg border-2 ${s.color} text-left transition-all hover:bg-surface-variant disabled:opacity-50`}>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">{s.desc}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={() => setStep(3)} className="w-full mt-4" variant="outline">
                  Skip to Results
                  <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Trigger & Payout */}
        {step === 3 && (
          <div className="space-y-6">
            {simulationRunning ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4">progress_activity</span>
                  <h2 className="text-xl font-bold mb-2">Running Risk Assessment</h2>
                  <p className="text-sm text-on-surface-variant">Generating weather data → Computing risk indices → Checking thresholds</p>
                </CardContent>
              </Card>
            ) : simulationResult ? (
              <>
                {/* Trigger Alert */}
                {simulationResult.triggerResult?.triggered && (
                  <div className="p-4 rounded-xl bg-error-container border border-error flex items-center gap-3 pulse-alert">
                    <span className="material-symbols-outlined text-error">warning</span>
                    <div>
                      <p className="font-bold text-on-error-container">Trigger Activated</p>
                      <p className="text-sm text-on-error-container/80">Rainfall deficit of {simulationResult.riskAssessment.rainfallDeviation.toFixed(0)}% detected — payout auto-triggered</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Rainfall Deficit</p>
                      <p className={`text-3xl font-bold font-['Space_Grotesk'] ${simulationResult.riskAssessment.rainfallDeviation > 30 ? 'text-[#C9574F]' : 'text-primary'}`}>
                        {simulationResult.riskAssessment.rainfallDeviation.toFixed(0)}%
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Threshold: {selectedPlot?.insurance?.rainfallDeviationThreshold || 30}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">NDVI Drop</p>
                      <p className="text-3xl font-bold font-['Space_Grotesk'] text-primary">{simulationResult.riskAssessment.ndviDrop.toFixed(0)}%</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Crop health decline</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Composite Risk</p>
                      <p className="text-3xl font-bold font-['Space_Grotesk'] text-primary">{simulationResult.riskAssessment.compositeRisk.toFixed(1)}<span className="text-base font-normal text-on-surface-variant">/100</span></p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Severity: {simulationResult.riskAssessment.severity}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Formula Transparency */}
                {simulationResult.triggerResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">visibility</span>
                        Formula Breakdown (Farmer-Visible)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-4 rounded-lg bg-surface border-l-4 border-primary">
                        <p className="text-sm font-medium mb-2">Payout Formula</p>
                        <pre className="text-xs text-on-surface-variant whitespace-pre-wrap font-mono leading-relaxed">
                          {simulationResult.triggerResult.formulaBreakdown}
                        </pre>
                      </div>
                      <div className="p-4 rounded-lg bg-surface border-l-4 border-[#E2A93B]">
                        <p className="text-sm font-medium mb-2">Plain Language Explanation</p>
                        <p className="text-sm text-on-surface-variant">{simulationResult.triggerResult.explanation}</p>
                      </div>
                      {simulationResult.triggerResult.triggered && (
                        <div className="p-4 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-between">
                          <div>
                            <p className="text-xs opacity-70">Payout Amount</p>
                            <p className="text-2xl font-bold font-['Space_Grotesk']">{simulationResult.triggerResult.payoutPercentage}% of Sum Insured</p>
                          </div>
                          <Button>Process Claim</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Data Source Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">verified</span>
                      Data Source Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { name: 'Sentinel-2 L2A', desc: 'NDVI from earth-search STAC', icon: 'satellite_alt', status: 'Real' },
                        { name: 'Open-Meteo Weather', desc: 'Rainfall + temperature API', icon: 'cloud', status: 'Real' },
                        { name: 'SMAP Soil Moisture', desc: 'Volumetric water content', icon: 'grass', status: 'Real' },
                      ].map((ds, i) => (
                        <div key={i} className="p-3 rounded-lg border border-outline-variant">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-[18px]">{ds.icon}</span>
                            <p className="text-xs font-medium">{ds.name}</p>
                            <Badge variant="secondary" className="text-[9px] ml-auto">{ds.status}</Badge>
                          </div>
                          <p className="text-[11px] text-on-surface-variant ml-7">{ds.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => { setStep(0); setSelectedFarmer(null); setSelectedPlot(null); setSimulationResult(null); }} variant="outline" className="flex-1">
                    Start New Journey
                  </Button>
                  <Link href="/demo" className="flex-1">
                    <Button className="w-full">
                      Try Interactive Demo
                      <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-on-surface-variant">Select a scenario to see trigger results</p>
                  <Button onClick={() => setStep(2)} className="mt-4" variant="outline">Go Back</Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
