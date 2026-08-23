/**
 * KshetraX Database Seed Script
 * 
 * Populates the database with realistic demo data:
 * - 8 farmers from different regions
 * - 12 plots with various crops
 * - Weather data showing different scenarios
 * - Insurance policies
 * - Trigger events and payouts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KshetraX database...\n');

  // Clear existing data
  await prisma.payout.deleteMany();
  await prisma.trigger.deleteMany();
  await prisma.weatherData.deleteMany();
  await prisma.insurance.deleteMany();
  await prisma.plot.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.riskIndex.deleteMany();

  // ─── Farmers ──────────────────────────────────────

  const farmers = await Promise.all([
    prisma.farmer.create({
      data: {
        name: 'Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh@email.com',
        village: 'Sonipat',
        district: 'Sonipat',
        state: 'Haryana',
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Priya Devi',
        phone: '9876543211',
        village: 'Amethi',
        district: 'Amethi',
        state: 'Uttar Pradesh',
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Suresh Patil',
        phone: '9876543212',
        email: 'suresh@email.com',
        village: 'Ahmednagar',
        district: 'Ahmednagar',
        state: 'Maharashtra',
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Anita Sharma',
        phone: '9876543213',
        village: 'Jaipur Rural',
        district: 'Jaipur',
        state: 'Rajasthan',
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Murugan S',
        phone: '9876543214',
        village: 'Salem',
        district: 'Salem',
        state: 'Tamil Nadu',
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Balu Nair',
        phone: '9876543215',
        email: 'balu@email.com',
        village: 'Alappuzha',
        district: 'Alappuzha',
        state: 'Kerala',
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Gopal Das',
        phone: '9876543216',
        village: 'Cuttack',
        district: 'Cuttack',
        state: 'Odisha',
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Meena Bai',
        phone: '9876543217',
        village: 'Bhopal Rural',
        district: 'Bhopal',
        state: 'Madhya Pradesh',
      },
    }),
  ]);

  console.log(`👨‍🌾 Created ${farmers.length} farmers`);

  // ─── Plots ────────────────────────────────────────

  const plots = await Promise.all([
    // Rajesh - Haryana (Rice, kharif, severe drought scenario)
    prisma.plot.create({
      data: {
        name: 'Rajesh Rice Field',
        areaHectares: 5.5,
        coordinates: JSON.stringify([[28.98, 77.02], [28.98, 77.06], [28.94, 77.06], [28.94, 77.02]]),
        centerLat: 28.96,
        centerLng: 77.04,
        cropType: 'rice',
        cropSeason: 'kharif',
        sowingDate: new Date('2025-06-15'),
        stationId: 'IMD-001',
        stationName: 'New Delhi',
        stationDist: 35,
        farmerId: farmers[0].id,
      },
    }),
    // Priya - UP (Wheat, rabi, mild deficit)
    prisma.plot.create({
      data: {
        name: 'Priya Wheat Farm',
        areaHectares: 3.2,
        coordinates: JSON.stringify([[26.25, 81.12], [26.25, 81.15], [26.23, 81.15], [26.23, 81.12]]),
        centerLat: 26.24,
        centerLng: 81.135,
        cropType: 'wheat',
        cropSeason: 'rabi',
        sowingDate: new Date('2025-11-10'),
        stationId: 'IMD-007',
        stationName: 'Lucknow',
        stationDist: 120,
        farmerId: farmers[1].id,
      },
    }),
    // Suresh - Maharashtra (Cotton, normal)
    prisma.plot.create({
      data: {
        name: 'Suresh Cotton Plot',
        areaHectares: 4.0,
        coordinates: JSON.stringify([[19.08, 74.75], [19.08, 74.78], [19.05, 74.78], [19.05, 74.75]]),
        centerLat: 19.065,
        centerLng: 74.765,
        cropType: 'cotton',
        cropSeason: 'kharif',
        sowingDate: new Date('2025-06-20'),
        stationId: 'IMD-009',
        stationName: 'Nagpur',
        stationDist: 150,
        farmerId: farmers[2].id,
      },
    }),
    // Anita - Rajasthan (Pulses, severe deficit - desert area)
    prisma.plot.create({
      data: {
        name: 'Anita Pulses Field',
        areaHectares: 2.8,
        coordinates: JSON.stringify([[27.05, 75.82], [27.05, 75.85], [27.03, 75.85], [27.03, 75.82]]),
        centerLat: 27.04,
        centerLng: 75.835,
        cropType: 'pulses',
        cropSeason: 'kharif',
        sowingDate: new Date('2025-07-01'),
        stationId: 'IMD-005',
        stationName: 'Jaipur',
        stationDist: 45,
        farmerId: farmers[3].id,
      },
    }),
    // Murugan - Tamil Nadu (Rice, normal paddy)
    prisma.plot.create({
      data: {
        name: 'Murugan Paddy Land',
        areaHectares: 2.0,
        coordinates: JSON.stringify([[11.67, 78.15], [11.67, 78.17], [11.65, 78.17], [11.65, 78.15]]),
        centerLat: 11.66,
        centerLng: 78.16,
        cropType: 'rice',
        cropSeason: 'kharif',
        sowingDate: new Date('2025-06-25'),
        stationId: 'IMD-006',
        stationName: 'Chennai',
        stationDist: 200,
        farmerId: farmers[4].id,
      },
    }),
    // Balu - Kerala (Rice, normal - high rainfall area)
    prisma.plot.create({
      data: {
        name: 'Balu Rice Paddy',
        areaHectares: 1.5,
        coordinates: JSON.stringify([[9.40, 76.34], [9.40, 76.36], [9.38, 76.36], [9.38, 76.34]]),
        centerLat: 9.39,
        centerLng: 76.35,
        cropType: 'rice',
        cropSeason: 'kharif',
        sowingDate: new Date('2025-06-10'),
        stationId: 'IMD-006',
        stationName: 'Chennai',
        stationDist: 500,
        farmerId: farmers[5].id,
      },
    }),
    // Gopal - Odisha (Rice, near trigger)
    prisma.plot.create({
      data: {
        name: 'Gopal Kharif Field',
        areaHectares: 3.8,
        coordinates: JSON.stringify([[20.48, 85.90], [20.48, 85.93], [20.46, 85.93], [20.46, 85.90]]),
        centerLat: 20.47,
        centerLng: 85.915,
        cropType: 'rice',
        cropSeason: 'kharif',
        sowingDate: new Date('2025-06-18'),
        stationId: 'IMD-004',
        stationName: 'Patna',
        stationDist: 350,
        farmerId: farmers[6].id,
      },
    }),
    // Meena - MP (Sugarcane, moderate deficit)
    prisma.plot.create({
      data: {
        name: 'Meena Sugarcane Farm',
        areaHectares: 6.0,
        coordinates: JSON.stringify([[23.28, 77.42], [23.28, 77.45], [23.25, 77.45], [23.25, 77.42]]),
        centerLat: 23.265,
        centerLng: 77.435,
        cropType: 'sugarcane',
        cropSeason: 'kharif',
        sowingDate: new Date('2025-05-01'),
        stationId: 'IMD-008',
        stationName: 'Indore',
        stationDist: 80,
        farmerId: farmers[7].id,
      },
    }),
    // Rajesh second plot - Wheat
    prisma.plot.create({
      data: {
        name: 'Rajesh Wheat Plot',
        areaHectares: 3.0,
        coordinates: JSON.stringify([[28.99, 77.07], [28.99, 77.10], [28.97, 77.10], [28.97, 77.07]]),
        centerLat: 28.98,
        centerLng: 77.085,
        cropType: 'wheat',
        cropSeason: 'rabi',
        sowingDate: new Date('2025-11-05'),
        stationId: 'IMD-001',
        stationName: 'New Delhi',
        stationDist: 40,
        farmerId: farmers[0].id,
      },
    }),
    // Suresh second plot - Pulses
    prisma.plot.create({
      data: {
        name: 'Suresh Pulses Plot',
        areaHectares: 2.5,
        coordinates: JSON.stringify([[19.10, 74.78], [19.10, 74.80], [19.08, 74.80], [19.08, 74.78]]),
        centerLat: 19.09,
        centerLng: 74.79,
        cropType: 'pulses',
        cropSeason: 'rabi',
        sowingDate: new Date('2025-11-15'),
        stationId: 'IMD-009',
        stationName: 'Nagpur',
        stationDist: 160,
        farmerId: farmers[2].id,
      },
    }),
    // Priya second plot - Rice
    prisma.plot.create({
      data: {
        name: 'Priya Rice Paddy',
        areaHectares: 2.0,
        coordinates: JSON.stringify([[26.26, 81.10], [26.26, 81.12], [26.24, 81.12], [26.24, 81.10]]),
        centerLat: 26.25,
        centerLng: 81.11,
        cropType: 'rice',
        cropSeason: 'kharif',
        sowingDate: new Date('2025-07-01'),
        stationId: 'IMD-007',
        stationName: 'Lucknow',
        stationDist: 130,
        farmerId: farmers[1].id,
      },
    }),
    // Gopal second plot - Wheat
    prisma.plot.create({
      data: {
        name: 'Gopal Wheat Field',
        areaHectares: 2.5,
        coordinates: JSON.stringify([[20.50, 85.88], [20.50, 85.90], [20.48, 85.90], [20.48, 85.88]]),
        centerLat: 20.49,
        centerLng: 85.89,
        cropType: 'wheat',
        cropSeason: 'rabi',
        sowingDate: new Date('2025-11-08'),
        stationId: 'IMD-004',
        stationName: 'Patna',
        stationDist: 360,
        farmerId: farmers[6].id,
      },
    }),
  ]);

  console.log(`🌾 Created ${plots.length} plots`);

  // ─── Insurance Policies ────────────────────────────

  const policies = await Promise.all(
    plots.map((plot, i) => {
      // Vary risk scores and premiums based on scenario
      const riskScores = [72, 55, 25, 85, 30, 15, 48, 60, 40, 20, 35, 52];
      const riskScore = riskScores[i];
      const premiumRates: Record<string, number> = {
        rice: 28 * 4500, wheat: 22 * 3500, pulses: 80 * 1200, cotton: 65 * 1800, sugarcane: 3.5 * 70000,
      };
      const sumInsured = (premiumRates[plot.cropType] || 100000) * plot.areaHectares;
      const premiumRate = 0.03 + (riskScore / 100) * 0.05;
      const premium = sumInsured * premiumRate;

      return prisma.insurance.create({
        data: {
          plotId: plot.id,
          policyNumber: `PKV-2025-${String(i + 1).padStart(5, '0')}`,
          startDate: new Date(plot.sowingDate),
          endDate: new Date(new Date(plot.sowingDate).getTime() + 180 * 24 * 60 * 60 * 1000),
          premiumAmount: Math.round(premium),
          premiumPerHectare: Math.round(premium / plot.areaHectares),
          sumInsured: Math.round(sumInsured),
          riskScore,
          rainfallDeviationThreshold: 30,
          ndviDropThreshold: 25,
          soilMoistureThreshold: 40,
          status: 'active',
        },
      });
    })
  );

  console.log(`🛡️  Created ${policies.length} insurance policies`);

  // ─── Weather Data & Triggers ──────────────────────

  // Generate weather data for each plot with different scenarios
  const scenarios = [
    'severe_deficit',   // Rajesh rice - drought hit
    'mild_deficit',     // Priya wheat
    'normal',           // Suresh cotton
    'extreme_deficit',  // Anita pulses - desert drought
    'normal',           // Murugan rice
    'normal',           // Balu rice
    'mild_deficit',     // Gopal rice
    'moderate_deficit', // Meena sugarcane
    'normal',           // Rajesh wheat
    'normal',           // Suresh pulses
    'normal',           // Priya rice
    'mild_deficit',     // Gopal wheat
  ] as const;

  // Historical normal parameters
  const normals: Record<string, { rainfall: number; temp: number; ndvi: number; soilMoisture: number }> = {
    kharif: { rainfall: 200, temp: 30, ndvi: 0.68, soilMoisture: 65 },
    rabi: { rainfall: 30, temp: 22, ndvi: 0.55, soilMoisture: 55 },
  };

  let totalWeatherPoints = 0;

  for (let i = 0; i < plots.length; i++) {
    const plot = plots[i];
    const scenario = scenarios[i];
    const norm = normals[plot.cropSeason] || normals.kharif;
    const weatherPoints = [];

    for (let day = 0; day < 60; day++) {
      const date = new Date(plot.sowingDate);
      date.setDate(date.getDate() + day);

      // Progress through season: 0.0 to 1.0
      const progress = day / 60;

      // Scenario-based rainfall factor
      let rainfallFactor: number;
      let tempAdd: number;
      let soilMoistureBase: number;

      switch (scenario) {
        case 'extreme_deficit':
          if (progress < 0.3) { rainfallFactor = 0.9; tempAdd = 0; soilMoistureBase = 65; }
          else if (progress < 0.6) { rainfallFactor = 0.3; tempAdd = 4; soilMoistureBase = 35; }
          else { rainfallFactor = 0.15; tempAdd = 6; soilMoistureBase = 20; }
          break;
        case 'severe_deficit':
          if (progress < 0.3) { rainfallFactor = 0.9; tempAdd = 0; soilMoistureBase = 65; }
          else if (progress < 0.6) { rainfallFactor = 0.4; tempAdd = 3; soilMoistureBase = 40; }
          else { rainfallFactor = 0.25; tempAdd = 5; soilMoistureBase = 25; }
          break;
        case 'mild_deficit':
          rainfallFactor = 0.65 + progress * 0.1;
          tempAdd = 1.5;
          soilMoistureBase = 50;
          break;
        case 'moderate_deficit':
          if (progress < 0.4) { rainfallFactor = 0.8; tempAdd = 1; soilMoistureBase = 55; }
          else { rainfallFactor = 0.45; tempAdd = 3; soilMoistureBase = 38; }
          break;
        default: // normal
          rainfallFactor = 0.9 + Math.random() * 0.2;
          tempAdd = (Math.random() - 0.5) * 2;
          soilMoistureBase = 60 + Math.random() * 15;
      }

      const rainfall = Math.max(0, norm.rainfall * rainfallFactor + (Math.random() - 0.5) * 20);
      const temp = norm.temp + tempAdd + (Math.random() - 0.5) * 3;

      // NDVI simulation
      let ndvi = norm.ndvi;
      if (scenario !== 'normal') {
        if (progress < 0.3) ndvi = 0.5 + progress;
        else ndvi = 0.8 - (progress - 0.3) * (scenario === 'extreme_deficit' ? 1.2 : 0.6);
      } else {
        ndvi = 0.4 + progress * 0.4 + (Math.random() - 0.5) * 0.05;
      }
      ndvi = Math.max(0.1, Math.min(0.95, ndvi));

      const soilMoisture = Math.max(5, Math.min(95, soilMoistureBase + (Math.random() - 0.5) * 10));

      weatherPoints.push({
        plotId: plot.id,
        date,
        rainfallMm: Math.round(rainfall * 10) / 10,
        temperatureC: Math.round(temp * 10) / 10,
        humidity: Math.round(55 + Math.random() * 30),
        soilMoisture: Math.round(soilMoisture),
        windSpeed: Math.round((8 + Math.random() * 12) * 10) / 10,
        normalRainfall: norm.rainfall,
        normalTemperature: norm.temp,
        rainfallDeviation: Math.round(((norm.rainfall - rainfall) / norm.rainfall) * 100),
        ndvi: Math.round(ndvi * 1000) / 1000,
        ndviAnomaly: Math.round(((ndvi - norm.ndvi) / norm.ndvi) * 100 * 10) / 10,
        source: 'synthetic',
      });
    }

    await prisma.weatherData.createMany({ data: weatherPoints });
    totalWeatherPoints += weatherPoints.length;
  }

  console.log(`🌦️  Created ${totalWeatherPoints} weather data points`);

  // ─── Trigger Events & Payouts ─────────────────────

  // Create triggers for plots with deficit scenarios
  const triggerConfigs = [
    { plotIndex: 0, type: 'rainfall_deficit', severity: 'severe', deviation: 65, explanation: 'Rainfall is 65% below normal for rice season. Severe drought conditions detected. Composite risk score: 78/100. Payout triggers at 30% deviation.', payoutPct: 100, multiplier: 1.0 },
    { plotIndex: 3, type: 'combined', severity: 'severe', deviation: 75, explanation: 'Rainfall is 75% below normal and crop health (NDVI) has dropped 40% from expected levels. This indicates SEVERE loss. Composite risk score: 85/100.', payoutPct: 100, multiplier: 1.0 },
    { plotIndex: 1, type: 'rainfall_deficit', severity: 'minor', deviation: 35, explanation: 'Rainfall is 35% below normal for wheat season. Minor stress detected. Composite risk score: 55/100.', payoutPct: 25, multiplier: 0.25 },
    { plotIndex: 7, type: 'rainfall_deficit', severity: 'moderate', deviation: 50, explanation: 'Rainfall is 50% below normal for sugarcane. MODERATE loss. Composite risk score: 62/100. Payout triggers at 30% deviation.', payoutPct: 50, multiplier: 0.50 },
    { plotIndex: 6, type: 'rainfall_deficit', severity: 'minor', deviation: 32, explanation: 'Rainfall is 32% below normal for rice kharif season. Near-trigger conditions. Composite risk score: 48/100.', payoutPct: 25, multiplier: 0.25 },
  ];

  const policyPremiums = policies.map(p => p.premiumAmount);
  const policySumInsured = policies.map(p => p.sumInsured);

  for (const tc of triggerConfigs) {
    const trigger = await prisma.trigger.create({
      data: {
        plotId: plots[tc.plotIndex].id,
        triggerType: tc.type,
        severity: tc.severity,
        rainfallDeviation: tc.deviation,
        ndviDrop: tc.type === 'combined' ? 40 : tc.deviation * 0.5,
        soilMoistureDeficit: tc.deviation * 0.4,
        thresholdCrossed: 30,
        explanation: tc.explanation,
        payoutPercentage: tc.payoutPct,
        status: tc.severity === 'severe' ? 'paid' : 'active',
        acknowledgedAt: tc.severity === 'severe' ? new Date() : null,
      },
    });

    const sumInsured = policySumInsured[tc.plotIndex];
    const payoutAmount = sumInsured * tc.multiplier;

    await prisma.payout.create({
      data: {
        plotId: plots[tc.plotIndex].id,
        triggerId: trigger.id,
        payoutNumber: `PKV-PAY-${String(tc.plotIndex + 1).padStart(4, '0')}`,
        payoutAmount: Math.round(payoutAmount),
        payoutPercentage: tc.payoutPct,
        calculationBasis: `Payout = Sum Insured (₹${sumInsured.toLocaleString()}) × Tier Multiplier (${tc.multiplier})`,
        baseAmount: sumInsured,
        triggerSeverity: tc.severity,
        multiplierApplied: tc.multiplier,
        status: tc.severity === 'severe' ? 'disbursed' : 'pending',
        disbursedAt: tc.severity === 'severe' ? new Date() : null,
        transactionId: tc.severity === 'severe' ? `TXN-${Date.now()}-DEMO` : null,
      },
    });
  }

  console.log(`⚡ Created ${triggerConfigs.length} trigger events with payouts`);

  // ─── Summary ──────────────────────────────────────

  const summary = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*) FROM Farmer) as farmers,
      (SELECT COUNT(*) FROM Plot) as plots,
      (SELECT COUNT(*) FROM Insurance WHERE status = 'active') as policies,
      (SELECT COUNT(*) FROM WeatherData) as weatherPoints,
      (SELECT COUNT(*) FROM Trigger) as triggers,
      (SELECT COUNT(*) FROM Payout) as payouts
  `;

  console.log('\n📊 Seed Summary:', summary);
  console.log('\n✅ Database seeded successfully!');
  console.log('\n🌾 Demo accounts:');
  console.log('  Rajesh Kumar - 9876543210 (Severe drought - rice)');
  console.log('  Priya Devi   - 9876543211 (Mild deficit - wheat)');
  console.log('  Anita Sharma - 9876543213 (Extreme deficit - pulses)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
