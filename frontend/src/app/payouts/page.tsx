'use client';

import { useState, useEffect } from 'react';
import { getPayouts, disbursePayout } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Payout {
  id: string; payoutNumber: string; payoutAmount: number; payoutPercentage: number;
  calculationBasis: string; triggerSeverity: string; status: string;
  disbursedAt: string | null; transactionId: string | null; date: string;
  plot: { id: string; name: string; cropType: string };
  trigger: { severity: string; explanation: string };
}

const CROP_ICONS: Record<string, string> = { rice: 'rice_bowl', wheat: 'grass', pulses: 'spa', cotton: 'park', sugarcane: 'yard' };

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadPayouts(); }, []);

  async function loadPayouts() {
    try { setPayouts(await getPayouts()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDisburse(id: string) {
    try { await disbursePayout(id); await loadPayouts(); setExpanded(null); }
    catch (err) { console.error(err); }
  }

  const totalDisbursed = payouts.filter(p => p.status === 'disbursed').reduce((s, p) => s + p.payoutAmount, 0);
  const totalPending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.payoutAmount, 0);

  return (
    <div className="flex min-h-screen pt-14">
      <aside className="hidden md:block w-60 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 animate-slide-up">
        <div className="mb-6">
          <h1 className="text-headline-xl text-primary mb-1">Reports</h1>
          <p className="text-body-md text-on-surface-variant">Payout tracking with full transparency.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <Card className="border-safe/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-safe text-[18px]">check_circle</span>
                <span className="text-overline text-on-surface-variant">Disbursed</span>
              </div>
              <p className="text-display-lg font-grotesk font-bold text-safe">₹{totalDisbursed.toLocaleString('en-IN')}</p>
              <p className="text-caption-md text-on-surface-variant mt-1">{payouts.filter(p => p.status === 'disbursed').length} completed</p>
            </CardContent>
          </Card>
          <Card className="border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-warning text-[18px]">schedule</span>
                <span className="text-overline text-on-surface-variant">Pending</span>
              </div>
              <p className="text-display-lg font-grotesk font-bold text-warning">₹{totalPending.toLocaleString('en-IN')}</p>
              <p className="text-caption-md text-on-surface-variant mt-1">{payouts.filter(p => p.status === 'pending').length} awaiting</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
                <span className="text-overline text-on-surface-variant">Total Records</span>
              </div>
              <p className="text-display-lg font-grotesk font-bold text-primary">{payouts.length}</p>
              <p className="text-caption-md text-on-surface-variant mt-1">all payouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout Records */}
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-container-high" />)
          ) : payouts.length === 0 ? (
            <Card><CardContent className="p-12 text-center"><p className="text-on-surface-variant">No payout records yet.</p></CardContent></Card>
          ) : (
            payouts.map((p) => (
              <Card key={p.id} className={`card-interactive ${expanded === p.id ? 'ring-2 ring-primary/20' : ''}`}>
                <CardContent className="p-4">
                  {/* Main Row */}
                  <div onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="flex items-center gap-3 cursor-pointer">
                    {/* Crop Icon + Percentage */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                      p.triggerSeverity === 'severe' ? 'bg-trigger-alert-bg' : p.triggerSeverity === 'moderate' ? 'bg-warning-bg' : 'bg-safe-bg'
                    }`}>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{CROP_ICONS[p.plot.cropType] || 'eco'}</span>
                      <span className="text-[10px] font-bold text-on-surface">{p.payoutPercentage}%</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-title-sm truncate">{p.payoutNumber}</p>
                        <Badge variant="outline" className={`text-[10px] ${p.status === 'disbursed' ? 'bg-[#F4FFEC] text-[#4D8B64] border-[#4D8B64]/20' : p.status === 'pending' ? 'bg-[#FFF8E1] text-[#B8860B] border-[#E2A93B]/20' : 'text-on-surface-variant'}`}>
                          {p.status === 'disbursed' ? '✓ Disbursed' : p.status === 'pending' ? '⏳ Pending' : p.status}
                        </Badge>
                      </div>
                      <p className="text-caption-md text-on-surface-variant">{p.plot.name} · {p.plot.cropType}</p>
                    </div>

                    {/* Amount + Date */}
                    <div className="text-right shrink-0">
                      <p className="text-headline-md font-grotesk font-bold text-primary">₹{p.payoutAmount.toLocaleString('en-IN')}</p>
                      <p className="text-caption-sm text-on-surface-variant">{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expanded === p.id && (
                    <div className="mt-4 pt-4 border-t border-outline-variant space-y-3 animate-slide-up">
                      <div>
                        <p className="text-label-sm text-on-surface-variant mb-1">Formula Breakdown</p>
                        <pre className="text-caption-md bg-surface-container-low p-3 rounded-lg whitespace-pre-wrap text-on-surface font-mono">{p.calculationBasis}</pre>
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant mb-1">Trigger Explanation</p>
                        <p className="text-body-sm text-on-surface-variant">{p.trigger.explanation}</p>
                      </div>
                      {p.transactionId && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-safe-bg">
                          <span className="material-symbols-outlined text-safe text-[16px]">check_circle</span>
                          <span className="text-caption-md text-safe font-medium">Transaction: {p.transactionId}</span>
                        </div>
                      )}
                      {p.status === 'pending' && (
                        <Button onClick={(e) => { e.stopPropagation(); handleDisburse(p.id); }} size="sm" className="gap-1">
                          <span className="material-symbols-outlined text-[16px]">account_balance</span>
                          Process Disbursement
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
