'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const CROP_OPTIONS = [
  { value: 'rice', label: 'Rice', icon: 'rice_bowl', season: 'Kharif', premium: '₹180/ha' },
  { value: 'wheat', label: 'Wheat', icon: 'grass', season: 'Rabi', premium: '₹120/ha' },
  { value: 'pulses', label: 'Pulses', icon: 'spa', season: 'Kharif', premium: '₹95/ha' },
  { value: 'cotton', label: 'Cotton', icon: 'park', season: 'Kharif', premium: '₹150/ha' },
  { value: 'sugarcane', label: 'Sugarcane', icon: 'yard', season: 'Annual', premium: '₹200/ha' },
];

const DEMO_PLOTS = [
  { name: 'Sonipat, Haryana', lat: 28.96, lng: 77.04, crop: 'rice', area: 2.5 },
  { name: 'Salem, Tamil Nadu', lat: 11.66, lng: 78.16, crop: 'rice', area: 1.8 },
  { name: 'Jaipur, Rajasthan', lat: 27.04, lng: 75.83, crop: 'pulses', area: 3.0 },
  { name: 'Cuttack, Odisha', lat: 20.49, lng: 85.89, crop: 'wheat', area: 2.2 },
  { name: 'Bhopal, MP', lat: 23.27, lng: 77.44, crop: 'sugarcane', area: 4.5 },
  { name: 'Ahmednagar, Maharashtra', lat: 19.07, lng: 74.77, crop: 'cotton', area: 1.5 },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedPlot, setSelectedPlot] = useState(DEMO_PLOTS[0]);
  const [area, setArea] = useState(2.5);
  const [premium, setPremium] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (step !== 1) return;
    import('leaflet').then((L) => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      const el = document.getElementById('register-map');
      if (!el) return;
      const map = L.map('register-map', { zoomControl: false }).setView([selectedPlot.lat, selectedPlot.lng], 10);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap', maxZoom: 18,
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      DEMO_PLOTS.forEach(p => {
        const marker = L.marker([p.lat, p.lng]).addTo(map);
        marker.bindPopup(`<div style="font-family:Inter;font-size:12px;"><b>${p.name}</b><br/>${p.area} ha</div>`);
      });

      // Draw plot boundary polygon
      const center = [selectedPlot.lat, selectedPlot.lng];
      const offset = 0.01;
      const polygon = L.polygon([
        [center[0] - offset, center[1] - offset],
        [center[0] - offset, center[1] + offset],
        [center[0] + offset, center[1] + offset],
        [center[0] + offset, center[1] - offset],
      ], { color: '#123C2A', fillColor: '#123C2A', fillOpacity: 0.2, weight: 2 }).addTo(map);
      setTimeout(() => {
        try {
          if (mapRef.current) {
            mapRef.current.fitBounds(polygon.getBounds(), { padding: [50, 50] });
          }
        } catch (e) { /* Leaflet container may have been removed */ }
        setMapReady(true);
      }, 100);
    });
  }, [step, selectedPlot]);

  useEffect(() => {
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (selectedCrop && area) {
      const crop = CROP_OPTIONS.find(c => c.value === selectedCrop);
      if (crop) {
        const baseRate = parseInt(crop.premium.replace(/[^0-9]/g, ''));
        setPremium(baseRate * area);
      }
    }
  }, [selectedCrop, area]);

  return (
    <div className="min-h-screen bg-background">
      {/* Spacer for fixed header */}
      <div className="h-14" />
      {/* Simple Header */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface-container-lowest">
        <Link href="/landing" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#3e6752]">shield</span>
          <span className="text-lg font-bold font-['Space_Grotesk'] text-primary">KshetraX</span>
        </Link>
        <Link href="/landing">
          <Button variant="ghost" size="sm" className="gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </Button>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-primary text-white' : step > s ? 'bg-[#4D8B64] text-white' : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-primary' : 'text-on-surface-variant'}`}>
                {s === 1 ? 'Select Plot' : s === 2 ? 'Choose Crop' : 'Confirm'}
              </span>
              {s < 3 && <span className="material-symbols-outlined text-outline-variant text-lg">chevron_right</span>}
            </div>
          ))}
        </div>

        {/* Step 1: Select Plot */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-primary mb-1">Where is your farm?</h1>
              <p className="text-sm text-on-surface-variant">Select your plot location on the map or choose a demo location</p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div id="register-map" className="h-[300px] w-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DEMO_PLOTS.map((p, i) => (
                <button key={i} onClick={() => setSelectedPlot(p)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedPlot === p ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant hover:border-primary/30'
                  }`}>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[11px] opacity-70">{p.area} ha</p>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-medium text-on-surface block mb-1">Plot Area (hectares)</label>
              <input type="number" value={area} onChange={e => setArea(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary" />
            </div>

            <Button onClick={() => setStep(2)} className="w-full border-primary/40 text-primary hover:bg-primary-container/10" size="lg" variant="outline">
              Continue
              <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
            </Button>
          </div>
        )}

        {/* Step 2: Choose Crop */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-primary mb-1">What do you grow?</h1>
              <p className="text-sm text-on-surface-variant">Select your crop type for accurate premium calculation</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CROP_OPTIONS.map(crop => (
                <button key={crop.value} onClick={() => setSelectedCrop(crop.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCrop === crop.value ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant hover:border-primary/30'
                  }`}>
                  <span className="material-symbols-outlined text-2xl mb-2">{crop.icon}</span>
                  <p className="text-sm font-medium">{crop.label}</p>
                  <p className="text-[11px] opacity-70">{crop.season}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedCrop} className="flex-1">
                Calculate Premium
                <span className="material-symbols-outlined text-[18px] ml-1">calculate</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Premium */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-primary mb-1">Your Premium</h1>
              <p className="text-sm text-on-surface-variant">Based on your plot location, crop type, and risk assessment</p>
            </div>

            <Card className="border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">Plot</p>
                    <p className="text-sm font-medium">{selectedPlot.name}</p>
                  </div>
                  <Badge>{area} ha</Badge>
                </div>
                <Separator className="mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">Crop</p>
                    <p className="text-sm font-medium">{CROP_OPTIONS.find(c => c.value === selectedCrop)?.label}</p>
                  </div>
                  <Badge variant="secondary">{CROP_OPTIONS.find(c => c.value === selectedCrop)?.season}</Badge>
                </div>
                <Separator className="mb-4" />
                <div className="text-center py-4">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Season Premium</p>
                  <p className="text-4xl font-bold font-['Space_Grotesk'] text-primary">₹{premium.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-on-surface-variant mt-1">for your {area} ha plot this season</p>
                </div>
                <Separator className="mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Coverage</span>
                    <span className="font-medium">Drought + Flood + NDVI Drop</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Trigger Threshold</span>
                    <span className="font-medium">30% rainfall deficit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Max Payout</span>
                    <span className="font-medium">100% of sum insured</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-[#F4FFEC] border border-[#4D8B64]/20">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#4D8B64]">visibility</span>
                <div>
                  <p className="text-sm font-medium mb-1">How Payout Works</p>
                  <p className="text-xs text-on-surface-variant">
                    If rainfall drops 30% below normal, you receive 25% of your insured amount. At 60% deficit, you receive 50%. At 80%+, you receive 100%. The formula is transparent — you can verify it anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
              <Link href="/" className="flex-1">
                <Button className="w-full" size="lg">
                  <span className="material-symbols-outlined text-[18px] mr-1">check_circle</span>
                  Confirm & Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
