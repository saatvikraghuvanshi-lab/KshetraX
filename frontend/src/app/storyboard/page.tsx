'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/api';

export default function StoryboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="flex h-screen pt-16">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
        <header className="mb-md">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Impact Story</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Before and after parametric crop insurance</p>
        </header>

        {/* Before vs After */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
          {/* Before */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#717973]" />
            <div className="flex items-center gap-3 mb-md">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-[#717973]">history</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Before KshetraX</h2>
                <p className="font-caption text-caption text-on-surface-variant">Traditional Crop Insurance</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: 'schedule', title: '6-12 month payout delay', desc: 'Farmers wait months for claim assessment. Crop loss period extends into next season.' },
                { icon: 'gavel', title: 'Disputed assessments', desc: 'Manual field visits lead to subjective evaluations. 40-60% of claims face disputes.' },
                { icon: 'phone', title: 'Paper-heavy process', desc: 'Physical paperwork, multiple office visits, opaque status tracking.' },
                { icon: 'block', title: 'Limited coverage', desc: 'Only ~25% of Indian farmers have crop insurance. Complex enrollment deters participation.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-outline-variant">
                  <span className="material-symbols-outlined text-on-surface-variant mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{item.title}</p>
                    <p className="font-caption text-caption text-on-surface-variant mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#4D8B64]/30 p-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#4D8B64]" />
            <div className="flex items-center gap-3 mb-md">
              <div className="w-12 h-12 rounded-full bg-[#4D8B64]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4D8B64]">speed</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-[#4D8B64]">After KshetraX</h2>
                <p className="font-caption text-caption text-on-surface-variant">Parametric Insurance</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: 'bolt', title: 'Instant automated payout', desc: 'When rainfall deficit crosses threshold, payout triggers immediately. No manual assessment needed.' },
                { icon: 'visibility', title: '100% transparent formula', desc: 'Farmers see exact formula: deviation % = payout %. Every data source is visible.' },
                { icon: 'smartphone', title: 'Mobile-first dashboard', desc: 'Real-time weather, NDVI, soil moisture data on a simple dashboard. One-tap enrollment.' },
                { icon: 'public', title: 'Scalable coverage', desc: 'Satellite + weather station data covers any plot anywhere. No field visits required.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#F4FFEC] border border-[#4D8B64]/20">
                  <span className="material-symbols-outlined text-[#4D8B64] mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{item.title}</p>
                    <p className="font-caption text-caption text-on-surface-variant mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mb-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Impact Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
            {[
              { label: 'Payout Speed', before: '6-12 months', after: '< 24 hours', icon: 'speed' },
              { label: 'Claim Disputes', before: '40-60%', after: '0%', icon: 'gavel' },
              { label: 'Transparency', before: 'Opaque', after: 'Full formula visibility', icon: 'visibility' },
              { label: 'Coverage', before: '~25% farmers', after: 'Satellite-based, universal', icon: 'public' },
            ].map((metric, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
                <span className="material-symbols-outlined text-primary mb-2">{metric.icon}</span>
                <p className="font-label-md text-label-md text-on-surface mb-3">{metric.label}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#717973]" />
                    <p className="font-caption text-caption text-on-surface-variant">{metric.before}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4D8B64]" />
                    <p className="font-caption text-caption text-[#4D8B64] font-medium">{metric.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Stats from Backend */}
        {stats && (
          <div className="mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">System Stats (Live)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
              {[
                { label: 'Farmers Enrolled', value: stats.totalFarmers, icon: 'group' },
                { label: 'Plots Monitored', value: stats.totalPlots, icon: 'potted_plant' },
                { label: 'Active Policies', value: stats.activePolicies, icon: 'verified_user' },
                { label: 'Payouts Disbursed', value: `INR ${(stats.totalPayoutAmount / 100000).toFixed(1)}L`, icon: 'payments' },
              ].map((stat, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
                  <span className="material-symbols-outlined text-primary mb-2">{stat.icon}</span>
                  <p className="font-display-lg text-display-lg text-primary">{stat.value}</p>
                  <p className="font-caption text-caption text-on-surface-variant">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works Flow */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-sm">
            {[
              { step: '1', title: 'Register Plot', desc: 'Farmer provides GPS coordinates via mobile app', icon: 'add_location' },
              { step: '2', title: 'Risk Assessment', desc: 'System computes rainfall, NDVI, soil moisture indices', icon: 'calculate' },
              { step: '3', title: 'Monitor', desc: 'Satellite + weather data ingested daily via STAC + IMD APIs', icon: 'satellite_alt' },
              { step: '4', title: 'Trigger', desc: 'Threshold crossed? Payout automatically calculated', icon: 'bolt' },
              { step: '5', title: 'Disburse', desc: 'Farmer receives instant transparent payout', icon: 'account_balance' },
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md font-bold mb-3">
                  {step.step}
                </div>
                <span className="material-symbols-outlined text-primary mb-2">{step.icon}</span>
                <p className="font-label-md text-label-md text-on-surface mb-1">{step.title}</p>
                <p className="font-caption text-caption text-on-surface-variant">{step.desc}</p>
                {i < 4 && (
                  <span className="hidden md:block absolute top-8 -right-2 material-symbols-outlined text-outline-variant">chevron_right</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
