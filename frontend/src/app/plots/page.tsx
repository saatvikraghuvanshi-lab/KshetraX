'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPlots } from '@/lib/api';

interface Plot {
  id: string; name: string; areaHectares: number; cropType: string; cropSeason: string;
  stationName: string; stationDist: number;
  farmer: { id: string; name: string };
  insurance: { status: string; riskScore: number } | null;
}

const CROP_LABELS: Record<string, string> = {
  rice: 'Rice', wheat: 'Wheat', pulses: 'Pulses', cotton: 'Cotton', sugarcane: 'Sugarcane',
};

export default function PlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlots().then(setPlots).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen pt-16">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
        <header className="mb-md">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Land Plots</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{plots.length} registered plots across India.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {plots.map((plot) => (
              <Link key={plot.id} href={`/plots/${plot.id}`}>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0px_4px_12px_rgba(18,60,42,0.05)] hover:shadow-[0px_4px_12px_rgba(18,60,42,0.1)] transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-headline-md text-headline-md text-primary">{plot.name}</h3>
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      plot.insurance ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${plot.insurance ? 'bg-accent-safe' : 'bg-outline'}`} />
                      {plot.insurance ? 'Insured' : 'Not Insured'}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-3">{plot.farmer.name}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-surface-container-low px-2 py-1 rounded text-caption font-caption text-on-surface-variant">{CROP_LABELS[plot.cropType]}</span>
                    <span className="bg-surface-container-low px-2 py-1 rounded text-caption font-caption text-on-surface-variant">{plot.areaHectares} ha</span>
                    <span className="bg-surface-container-low px-2 py-1 rounded text-caption font-caption text-on-surface-variant">{plot.stationName}</span>
                  </div>
                  {plot.insurance && (
                    <div className="border-t border-outline-variant pt-3 flex justify-between text-caption text-on-surface-variant">
                      <span>Risk Score</span>
                      <span className="font-medium text-on-surface">{plot.insurance.riskScore}/100</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
