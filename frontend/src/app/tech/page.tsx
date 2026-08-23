'use client';

import { useState, useEffect } from 'react';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

function DataSourcesStatus() {
  const [sources, setSources] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/datasources')
      .then(r => r.json())
      .then(setSources)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Data Sources</h2>
      <div className="h-24 animate-pulse rounded-lg bg-surface-container-high" />
    </div>
  );

  if (!sources) return null;

  const StatusDot = ({ status }: { status: string }) => (
    <span className={`w-2.5 h-2.5 rounded-full inline-block ${
      status === 'available' ? 'bg-[#4D8B64]' :
      status?.includes('synthetic') ? 'bg-[#E2A93B]' : 'bg-[#717973]'

    }`} />
  );

  const StatusLabel = ({ status }: { status: string }) => (
    <span className={`font-caption text-caption ${
      status === 'available' ? 'text-[#4D8B64]' :
      status?.includes('synthetic') ? 'text-[#E2A93B]' : 'text-[#717973]'

    }`}>
      {status === 'available' ? 'Live' : status.includes('synthetic') ? 'Synthetic' : 'Not Integrated'}

    </span>
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Data Sources (Live Status)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
        {/* Satellite */}
        <div className="bg-surface rounded-lg border border-outline-variant p-md">
          <h3 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">satellite_alt</span> Satellite Imagery
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.satellite?.sentinel2?.status} /><span className="font-caption text-caption text-on-surface">Sentinel-2 (Copernicus)</span></div><StatusLabel status={sources.satellite?.sentinel2?.status} /></div>
            <p className="font-caption text-[10px] text-on-surface-variant ml-5">{sources.satellite?.sentinel2?.capability}</p>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.satellite?.landsat?.status} /><span className="font-caption text-caption text-on-surface">Landsat-8/9 (USGS)</span></div><StatusLabel status={sources.satellite?.landsat?.status} /></div>
            <p className="font-caption text-[10px] text-on-surface-variant ml-5">{sources.satellite?.landsat?.capability}</p>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.satellite?.smap?.status} /><span className="font-caption text-caption text-on-surface">SMAP Soil Moisture (NASA)</span></div><StatusLabel status={sources.satellite?.smap?.status} /></div>
            <p className="font-caption text-[10px] text-on-surface-variant ml-5">{sources.satellite?.smap?.capability}</p>
          </div>
        </div>
        {/* Weather */}
        <div className="bg-surface rounded-lg border border-outline-variant p-md">
          <h3 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">cloud</span> Weather Data
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.weather?.openMeteo?.status} /><span className="font-caption text-caption text-on-surface">Open-Meteo API</span></div><StatusLabel status={sources.weather?.openMeteo?.status} /></div>
            <p className="font-caption text-[10px] text-on-surface-variant ml-5">{sources.weather?.openMeteo?.capability}</p>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.weather?.imd?.status} /><span className="font-caption text-caption text-on-surface">IMD Synoptic Network</span></div><StatusLabel status={sources.weather?.imd?.status} /></div>
            <p className="font-caption text-[10px] text-on-surface-variant ml-5">{sources.weather?.imd?.capability}</p>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.weather?.noaa?.status} /><span className="font-caption text-caption text-on-surface">NOAA Climate Data</span></div><StatusLabel status={sources.weather?.noaa?.status} /></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.weather?.copernicusClimate?.status} /><span className="font-caption text-caption text-on-surface">Copernicus Climate</span></div><StatusLabel status={sources.weather?.copernicusClimate?.status} /></div>
          </div>
        </div>
        {/* Geospatial */}
        <div className="bg-surface rounded-lg border border-outline-variant p-md">
          <h3 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">map</span> Geospatial
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.geospatial?.openStreetMap?.status} /><span className="font-caption text-caption text-on-surface">OpenStreetMap Tiles</span></div><StatusLabel status={sources.geospatial?.openStreetMap?.status} /></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.geospatial?.plotCoordinates?.status} /><span className="font-caption text-caption text-on-surface">Plot GPS Coordinates</span></div><StatusLabel status={sources.geospatial?.plotCoordinates?.status} /></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.geospatial?.cadastralMaps?.status} /><span className="font-caption text-caption text-on-surface">Cadastral Maps (GeoJSON)</span></div><StatusLabel status={sources.geospatial?.cadastralMaps?.status} /></div>
          </div>
        </div>
        {/* Database */}
        <div className="bg-surface rounded-lg border border-outline-variant p-md">
          <h3 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">storage</span> Data Storage
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.databases?.prisma?.status} /><span className="font-caption text-caption text-on-surface">Prisma + SQLite</span></div><StatusLabel status={sources.databases?.prisma?.status} /></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.databases?.plotCoordinates?.status} /><span className="font-caption text-caption text-on-surface">12 Plots with GPS</span></div><StatusLabel status={sources.databases?.plotCoordinates?.status} /></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusDot status={sources.databases?.yieldHistory?.status} /><span className="font-caption text-caption text-on-surface">5-Year Yield History</span></div><StatusLabel status={sources.databases?.yieldHistory?.status} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TechPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [apiCount, setApiCount] = useState(0);

  useEffect(() => {
    fetch('http://localhost:4000/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen pt-16">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
        <header className="mb-md">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Tech Stack</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Architecture and technology behind KshetraX</p>
        </header>

        {/* Architecture Diagram */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-md">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">System Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {/* Data Layer */}
            <div className="bg-surface rounded-xl border border-outline-variant p-md">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">satellite_alt</span>
                <h3 className="font-headline-md text-headline-md text-primary">Data Layer</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Sentinel-2 (Copernicus)', desc: 'NDVI satellite imagery', tag: 'STAC API' },
                  { name: 'IMD Weather Stations', desc: 'Rainfall, temperature, humidity', tag: '10 stations' },
                  { name: 'Open-Meteo', desc: 'Historical weather data', tag: 'REST API' },
                  { name: 'Copernicus SMAP', desc: 'Soil moisture index', tag: 'Satellite' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-surface-container-low border border-outline-variant">
                    <div className="flex-1">
                      <p className="font-label-md text-label-md text-on-surface">{item.name}</p>
                      <p className="font-caption text-caption text-on-surface-variant">{item.desc}</p>
                    </div>
                    <span className="font-caption text-caption text-primary bg-primary/10 px-2 py-0.5 rounded">{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backend */}
            <div className="bg-surface rounded-xl border border-outline-variant p-md">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">dns</span>
                <h3 className="font-headline-md text-headline-md text-primary">Backend</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Node.js + Express', desc: 'REST API server, rate limiting, CORS' },
                  { name: 'Prisma ORM', desc: 'Type-safe database queries, schema migrations' },
                  { name: 'SQLite / PostgreSQL', desc: '8-table relational schema, seeded with 12 plots' },
                  { name: 'Payout Engine', desc: 'Risk calculation, trigger detection, tiered slabs' },
                  { name: 'STAC Search', desc: 'Sentinel-2 tile discovery via earth-search API' },
                ].map((item, i) => (
                  <div key={i} className="p-2 rounded-lg bg-surface-container-low border border-outline-variant">
                    <p className="font-label-md text-label-md text-on-surface">{item.name}</p>
                    <p className="font-caption text-caption text-on-surface-variant">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Frontend */}
            <div className="bg-surface rounded-xl border border-outline-variant p-md">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">web</span>
                <h3 className="font-headline-md text-headline-md text-primary">Frontend</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Next.js 14 (App Router)', desc: 'Server-rendered pages, static generation' },
                  { name: 'Leaflet + OpenStreetMap', desc: 'Interactive plot map with markers' },
                  { name: 'Chart.js', desc: 'Rainfall trends, yield correlation charts' },
                  { name: 'Tailwind CSS', desc: 'Material Design 3-inspired design system' },
                  { name: 'Material Symbols', desc: 'Consistent icon system across all pages' },
                ].map((item, i) => (
                  <div key={i} className="p-2 rounded-lg bg-surface-container-low border border-outline-variant">
                    <p className="font-label-md text-label-md text-on-surface">{item.name}</p>
                    <p className="font-caption text-caption text-on-surface-variant">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-md">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">API Endpoints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left">
                  <th className="pb-2 font-label-md text-label-md text-on-surface-variant">Method</th>
                  <th className="pb-2 font-label-md text-label-md text-on-surface-variant">Endpoint</th>
                  <th className="pb-2 font-label-md text-label-md text-on-surface-variant">Description</th>
                  <th className="pb-2 font-label-md text-label-md text-on-surface-variant">Phase</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { method: 'GET', path: '/api/health', desc: 'Server health check', phase: '1' },
                  { method: 'GET', path: '/api/plots', desc: 'List all registered plots', phase: '1' },
                  { method: 'POST', path: '/api/plots', desc: 'Register new plot with coordinates', phase: '1' },
                  { method: 'POST', path: '/api/weather/generate', desc: 'Generate weather time series for a plot', phase: '1' },
                  { method: 'GET', path: '/api/weather/:plotId', desc: 'Get weather data for a plot', phase: '1' },
                  { method: 'POST', path: '/api/weather/monitor', desc: 'Run risk assessment and trigger detection', phase: '1' },
                  { method: 'POST', path: '/api/insurance/create', desc: 'Create insurance policy with premium calculation', phase: '1' },
                  { method: 'GET', path: '/api/dashboard/stats', desc: 'System-wide statistics', phase: '1' },
                  { method: 'GET', path: '/api/dashboard/map-data', desc: 'Plot data for map display', phase: '1' },
                  { method: 'GET', path: '/api/yield-history/:plotId', desc: 'Historical yield with correlation analysis', phase: '2' },
                  { method: 'GET', path: '/api/crop-sensitivity', desc: 'Per-crop risk weights and sensitivity curves', phase: '2' },
                  { method: 'GET', path: '/api/stations?lat=&lng=', desc: 'Multi-station lookup with redundancy', phase: '2' },
                  { method: 'GET', path: '/api/risk-trends', desc: 'Historical risk index trends over time', phase: '2' },
                  { method: 'GET', path: '/api/payouts', desc: 'List all payouts with formula breakdown', phase: '1' },
                  { method: 'PATCH', path: '/api/payouts/:id/disburse', desc: 'Process payout disbursement', phase: '1' },
                ].map((ep, i) => (
                  <tr key={i} className="border-b border-outline-variant last:border-0 hover:bg-surface-variant transition-colors">
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        ep.method === 'GET' ? 'bg-[#4D8B64]/10 text-[#4D8B64]' : ep.method === 'POST' ? 'bg-primary/10 text-primary' : 'bg-[#E2A93B]/10 text-[#E2A93B]'
                      }`}>{ep.method}</span>
                    </td>
                    <td className="py-2 font-caption text-caption text-on-surface font-mono">{ep.path}</td>
                    <td className="py-2 font-caption text-caption text-on-surface-variant">{ep.desc}</td>
                    <td className="py-2"><span className="font-caption text-caption text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">Phase {ep.phase}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Schema */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-md">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Database Schema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
            {[
              { name: 'Farmer', fields: 'name, phone, village, district, state', icon: 'person' },
              { name: 'Plot', fields: 'coordinates, cropType, area, station', icon: 'potted_plant' },
              { name: 'Insurance', fields: 'policy, premium, sumInsured, thresholds', icon: 'verified_user' },
              { name: 'WeatherData', fields: 'rainfall, temp, NDVI, soil moisture', icon: 'cloud' },
              { name: 'Trigger', fields: 'type, severity, deviation, explanation', icon: 'warning' },
              { name: 'Payout', fields: 'amount, percentage, formula, status', icon: 'payments' },
              { name: 'RiskIndex', fields: 'composite, rainfall, NDVI, soil risks', icon: 'analytics' },
              { name: 'YieldHistory', fields: 'actual vs expected yield, drought events', icon: 'trending_up' },
            ].map((table, i) => (
              <div key={i} className="bg-surface rounded-lg border border-outline-variant p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-lg">{table.icon}</span>
                  <p className="font-label-md text-label-md text-on-surface">{table.name}</p>
                </div>
                <p className="font-caption text-caption text-on-surface-variant">{table.fields}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources Status */}
        <DataSourcesStatus />

        {/* Live System Status */}
        {health && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F4FFEC] border border-[#4D8B64]/20">
                <span className="w-3 h-3 rounded-full bg-[#4D8B64] animate-pulse" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Backend API</p>
                  <p className="font-caption text-caption text-[#4D8B64]">Healthy &mdash; v{health.version}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F4FFEC] border border-[#4D8B64]/20">
                <span className="w-3 h-3 rounded-full bg-[#4D8B64] animate-pulse" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Database</p>
                  <p className="font-caption text-caption text-[#4D8B64]">Connected &mdash; SQLite</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F4FFEC] border border-[#4D8B64]/20">
                <span className="w-3 h-3 rounded-full bg-[#4D8B64] animate-pulse" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Frontend</p>
                  <p className="font-caption text-caption text-[#4D8B64]">Next.js 14 &mdash; {health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'active'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
