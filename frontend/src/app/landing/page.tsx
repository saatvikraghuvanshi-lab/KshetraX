'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          {/* Nav */}
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <img src="/kshetrax-logo.png" alt="KshetraX" className="h-10 w-auto" />
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">
              <span className="material-symbols-outlined text-[14px] mr-1">verified</span>
              Powered by Sentinel-2 Satellite Imagery
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold font-['Space_Grotesk'] text-primary leading-tight mb-4">
              Instant, Fair Crop Insurance
            </h1>
            <p className="text-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
              No more waiting months for claim assessment. When rainfall drops below normal, your payout triggers automatically — transparent, verifiable, instant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/journey">
                <Button size="lg" variant="outline" className="gap-2 px-8 text-base border-primary/40 text-primary hover:bg-primary-container/10">
                  <span className="material-symbols-outlined">add_location</span>
                  Register Your Plot
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2 px-8 text-base">
                  <span className="material-symbols-outlined">dashboard</span>
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {[
              { icon: 'satellite_alt', label: 'Sentinel-2 Satellite Data', color: '#2196F3', bg: '#E8F4FD' },
              { icon: 'cloud', label: 'IMD Weather Stations', color: '#F57C00', bg: '#FFF8E1' },
              { icon: 'grass', label: 'SMAP Soil Moisture', color: '#4D8B64', bg: '#F4FFEC' },
              { icon: 'calculate', label: 'Transparent Formula', color: '#7B1FA2', bg: '#F3E5F5' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-outline-variant">
                <span className="material-symbols-outlined text-lg" style={{ color: item.color }}>{item.icon}</span>
                <span className="text-xs font-medium text-on-surface-variant">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-surface-container-low py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-center text-primary mb-2">How It Works</h2>
          <p className="text-sm text-on-surface-variant text-center mb-10">Four simple steps from registration to payout</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: 'add_location', title: 'Register Plot', desc: 'Tap your field on the map. System links to nearest weather station and satellite tile.', color: '#4D8B64' },
              { step: '2', icon: 'calculate', title: 'See Premium', desc: 'Instant premium calculated for your specific plot, crop, and risk level. No paperwork.', color: '#123C2A' },
              { step: '3', icon: 'satellite_alt', title: 'We Monitor', desc: 'Satellite + weather data checked daily. Your plot\'s health tracked in real-time.', color: '#E2A93B' },
              { step: '4', icon: 'bolt', title: 'Auto Payout', desc: 'When threshold crossed, payout triggers instantly. No claim filing needed.', color: '#C9574F' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 h-full">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${item.color}15` }}>
                    <span className="material-symbols-outlined" style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[11px] font-bold">{item.step}</span>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <span className="hidden md:block absolute top-1/2 -right-3 material-symbols-outlined text-outline-variant text-xl">chevron_right</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Light Status Demo */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-center text-primary mb-2">Real-Time Status</h2>
          <p className="text-sm text-on-surface-variant text-center mb-10">Simple traffic-light system — no technical knowledge needed</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-[#4D8B64]/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#4D8B64]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#4D8B64] text-3xl">check_circle</span>
                </div>
                <h3 className="font-bold text-[#4D8B64] mb-1">Safe</h3>
                <p className="text-xs text-on-surface-variant">Rainfall normal, crops healthy. No action needed.</p>
                <div className="mt-3 p-2 rounded-lg bg-[#F4FFEC] border border-[#4D8B64]/20">
                  <p className="text-[10px] text-[#4D8B64] font-medium">Deficit: 8%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E2A93B]/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#E2A93B]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#E2A93B] text-3xl">warning</span>
                </div>
                <h3 className="font-bold text-[#E2A93B] mb-1">Warning</h3>
                <p className="text-xs text-on-surface-variant">Rainfall below normal. Approaching trigger threshold.</p>
                <div className="mt-3 p-2 rounded-lg bg-[#FFF8E1] border border-[#E2A93B]/20">
                  <p className="text-[10px] text-[#E2A93B] font-medium">Deficit: 22%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#C9574F]/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-error text-3xl">bolt</span>
                </div>
                <h3 className="font-bold text-[#C9574F] mb-1">Triggered</h3>
                <p className="text-xs text-on-surface-variant">Threshold crossed. Payout calculated and processing.</p>
                <div className="mt-3 p-2 rounded-lg bg-error-container/50 border border-error/20">
                  <p className="text-[10px] text-error font-medium">Deficit: 35% → Payout: ₹350</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-surface-container-low py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-center text-primary mb-2">Trusted Data Sources</h2>
          <p className="text-sm text-on-surface-variant text-center mb-10">Every payout is backed by verifiable satellite and weather data</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: 'satellite_alt', name: 'Sentinel-2', desc: '10m resolution NDVI', status: 'Live', color: '#2196F3', bg: '#E8F4FD' },
              { icon: 'cloud', name: 'Open-Meteo', desc: 'Rainfall + Temperature', status: 'Live', color: '#F57C00', bg: '#FFF8E1' },
              { icon: 'grass', name: 'SMAP', desc: 'Soil Moisture (0-7cm)', status: 'Live', color: '#4D8B64', bg: '#F4FFEC' },
              { icon: 'cell_tower', name: 'IMD Network', desc: '10 Weather Stations', status: 'Live', color: '#7B1FA2', bg: '#F3E5F5' },
            ].map((ds, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: ds.bg }}>
                  <span className="material-symbols-outlined text-xl" style={{ color: ds.color }}>{ds.icon}</span>
                </div>
                <p className="text-xs font-medium mb-0.5">{ds.name}</p>
                <p className="text-[10px] text-on-surface-variant mb-2">{ds.desc}</p>
                <Badge variant="secondary" className="text-[9px]" style={{ backgroundColor: ds.bg, color: ds.color, borderColor: `${ds.color}20` }}>{ds.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-primary mb-3">Ready to Protect Your Harvest?</h2>
          <p className="text-sm text-on-surface-variant mb-6">Register your plot in under 2 minutes. Premium calculated instantly.</p>
          <Link href="/journey">              <Button size="lg" variant="outline" className="gap-2 px-10 border-primary/40 text-primary hover:bg-primary-container/10">
                <span className="material-symbols-outlined">rocket_launch</span>
                Start Your Journey
              </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-outline-variant py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/kshetrax-logo.png" alt="KshetraX" className="h-6 w-auto" />
            <span className="text-xs text-on-surface-variant">Parametric Crop Insurance</span>
          </div>
          <p className="text-[10px] text-on-surface-variant">Built for Smart India Hackathon 2026</p>
        </div>
      </footer>
    </div>
  );
}
