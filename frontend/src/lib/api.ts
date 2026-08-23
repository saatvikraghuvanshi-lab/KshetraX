/**
 * KshetraX API Client
 */

import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Farmers ───────────────────────────────────────

export async function getFarmers() {
  const { data } = await api.get('/farmers');
  return data;
}

export async function getFarmer(id: string) {
  const { data } = await api.get(`/farmers/${id}`);
  return data;
}

export async function createFarmer(farmer: {
  name: string;
  phone: string;
  email?: string;
  village: string;
  district: string;
  state: string;
}) {
  const { data } = await api.post('/farmers', farmer);
  return data;
}

// ─── Plots ─────────────────────────────────────────

export async function getPlots() {
  const { data } = await api.get('/plots');
  return data;
}

export async function getPlot(id: string) {
  const { data } = await api.get(`/plots/${id}`);
  return data;
}

export async function createPlot(plot: {
  name: string;
  areaHectares: number;
  centerLat: number;
  centerLng: number;
  cropType: string;
  cropSeason: string;
  sowingDate: string;
  farmerId: string;
}) {
  const { data } = await api.post('/plots', plot);
  return data;
}

// ─── Weather & Monitoring ──────────────────────────

export async function generateWeatherData(plotId: string, days?: number, scenario?: string) {
  const { data } = await api.post('/weather/generate', { plotId, days, scenario });
  return data;
}

export async function monitorPlot(plotId: string) {
  const { data } = await api.post('/weather/monitor', { plotId });
  return data;
}

export async function getWeatherData(plotId: string) {
  const { data } = await api.get(`/weather/${plotId}`);
  return data;
}

// ─── Insurance ─────────────────────────────────────

export async function createInsurance(policy: {
  plotId: string;
  startDate: string;
  endDate: string;
  rainfallThreshold?: number;
  ndviThreshold?: number;
}) {
  const { data } = await api.post('/insurance/create', policy);
  return data;
}

export async function getInsurance(plotId: string) {
  const { data } = await api.get(`/insurance/${plotId}`);
  return data;
}

export async function getPolicies() {
  const { data } = await api.get('/insurance');
  return data;
}

// ─── Payouts ───────────────────────────────────────

export async function getPayouts() {
  const { data } = await api.get('/payouts');
  return data;
}

export async function getPayout(id: string) {
  const { data } = await api.get(`/payouts/${id}`);
  return data;
}

export async function disbursePayout(id: string, transactionId?: string) {
  const { data } = await api.patch(`/payouts/${id}/disburse`, { transactionId });
  return data;
}

// ─── Dashboard ─────────────────────────────────────

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  return data;
}

export async function getRecentActivity() {
  const { data } = await api.get('/dashboard/recent-activity');
  return data;
}

export async function getMapData() {
  const { data } = await api.get('/dashboard/map-data');
  return data;
}

export async function getCropSummary() {
  const { data } = await api.get('/dashboard/crop-summary');
  return data;
}

export default api;
