'use client';

import { useState, useEffect } from 'react';
import { getRecentActivity } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Trigger {
  id: string; date: string; severity: string; rainfallDeviation: number;
  ndviDrop: number | null; explanation: string; payoutPercentage: number; status: string;
  plot: { id: string; name: string; cropType: string };
}

const CROP_ICONS: Record<string, string> = { rice: 'rice_bowl', wheat: 'grass', pulses: 'spa', cotton: 'park', sugarcane: 'yard' };
const SEVERITY_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  severe: { bg: 'bg-trigger-alert-bg', text: 'text-trigger-alert', border: 'border-trigger-alert/20', label: 'Severe' },
  moderate: { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/20', label: 'Moderate' },
  minor: { bg: 'bg-safe-bg', text: 'text-safe', border: 'border-safe/20', label: 'Minor' },
};

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getRecentActivity().then(d => setTriggers(d.recentTriggers || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? triggers : triggers.filter(t => t.severity === filter);
  const filters = [
    { value: 'all', label: 'All', count: triggers.length },
    { value: 'severe', label: 'Severe', count: triggers.filter(t => t.severity === 'severe').length },
    { value: 'moderate', label: 'Moderate', count: triggers.filter(t => t.severity === 'moderate').length },
    { value: 'minor', label: 'Minor', count: triggers.filter(t => t.severity === 'minor').length },
  ];

  return (
    <div className="flex min-h-screen pt-14">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 animate-slide-up">
        <div className="mb-6">
          <h1 className="text-headline-xl text-primary mb-1">Claims</h1>
          <p className="text-body-md text-on-surface-variant">Trigger events and claim history.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-label-md font-semibold transition-all whitespace-nowrap ${
                filter === f.value ? 'bg-primary text-white shadow-card' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant'
              }`}>
              {f.label}
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                filter === f.value ? 'bg-white/20' : 'bg-surface-container-high'
              }`}>{f.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-container-high" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-safe mb-3">check_circle</span>
              <h3 className="text-headline-md mb-1">No Triggers</h3>
              <p className="text-body-md text-on-surface-variant">All plots are within safe thresholds.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((trigger) => {
              const sev = SEVERITY_CONFIG[trigger.severity] || SEVERITY_CONFIG.minor;
              return (
                <Card key={trigger.id} className={`card-interactive ${sev.border} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Crop Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sev.bg}`}>
                        <span className={`material-symbols-outlined text-[20px] ${sev.text}`}>{CROP_ICONS[trigger.plot.cropType] || 'eco'}</span>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-title-sm truncate">{trigger.plot.name}</p>
                          <Badge variant="secondary" className="text-[10px] capitalize">{trigger.plot.cropType}</Badge>
                        </div>
                        <p className="text-caption-md text-on-surface-variant line-clamp-2 mb-3">{trigger.explanation}</p>

                        {/* Metrics Row */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">water_drop</span>
                            <span className="text-label-sm font-semibold text-trigger-alert">-{trigger.rainfallDeviation.toFixed(0)}%</span>
                          </div>
                          {trigger.ndviDrop && (
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">eco</span>
                              <span className="text-label-sm font-semibold text-warning">-{trigger.ndviDrop.toFixed(0)}%</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">payments</span>
                            <span className="text-label-sm font-semibold text-primary">{trigger.payoutPercentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Status + Date */}
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className={`text-[10px] mb-1 ${trigger.status === 'paid' ? 'bg-[#F4FFEC] text-[#4D8B64] border-[#4D8B64]/20' : 'text-on-surface-variant'}`}>
                          {trigger.status === 'paid' ? '✓ Paid' : trigger.status}
                        </Badge>
                        <p className="text-caption-sm text-on-surface-variant">{new Date(trigger.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
