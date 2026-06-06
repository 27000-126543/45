import type { Station } from '../types/index.js';
import { provinces } from './regions.js';

interface StationSeed {
  districtCode: string;
  latBase: number;
  lngBase: number;
}

const stationSeeds: StationSeed[] = [];

const provinceCoordMap: Record<string, { lat: number; lng: number }> = {
  '110000': { lat: 39.9042, lng: 116.4074 },
  '310000': { lat: 31.2304, lng: 121.4737 },
  '440000': { lat: 23.1291, lng: 113.2644 },
  '320000': { lat: 32.0603, lng: 118.7969 },
  '330000': { lat: 30.2741, lng: 120.1551 },
  '510000': { lat: 30.5728, lng: 104.0668 },
  '420000': { lat: 30.5928, lng: 114.3055 },
  '370000': { lat: 36.6512, lng: 117.1201 },
};

const cityCoordOffsets: Record<string, { lat: number; lng: number }> = {
  '110100': { lat: 0, lng: 0 },
  '310100': { lat: 0, lng: 0 },
  '440100': { lat: 0, lng: 0 },
  '440300': { lat: 0.9, lng: 1.2 },
  '440600': { lat: -0.15, lng: -0.4 },
  '320100': { lat: 0, lng: 0 },
  '320500': { lat: 1.3, lng: 2.4 },
  '320200': { lat: 1.5, lng: 1.5 },
  '330100': { lat: 0, lng: 0 },
  '330200': { lat: 0.8, lng: 2.0 },
  '330300': { lat: -0.5, lng: 1.8 },
  '510100': { lat: 0, lng: 0 },
  '510300': { lat: -1.0, lng: 1.5 },
  '510400': { lat: -2.5, lng: 3.0 },
  '420100': { lat: 0, lng: 0 },
  '420200': { lat: -1.5, lng: 2.2 },
  '420300': { lat: 1.5, lng: -2.0 },
  '370100': { lat: 0, lng: 0 },
  '370200': { lat: 3.5, lng: 3.5 },
  '370300': { lat: 0.5, lng: 0.5 },
};

let stationCounter = 0;

for (const province of provinces) {
  const baseCoord = provinceCoordMap[province.code] || { lat: 30, lng: 110 };
  for (const city of province.cities) {
    const cityOffset = cityCoordOffsets[city.code] || { lat: 0, lng: 0 };
    let districtIdx = 0;
    for (const district of city.districts) {
      const latJitter = (districtIdx % 2 === 0 ? 0.05 : -0.05) * (districtIdx + 1);
      const lngJitter = (districtIdx % 2 === 0 ? -0.05 : 0.05) * (districtIdx + 1);
      stationSeeds.push({
        districtCode: district.code,
        latBase: baseCoord.lat + cityOffset.lat + latJitter,
        lngBase: baseCoord.lng + cityOffset.lng + lngJitter,
      });
      districtIdx++;
    }
  }
}

function generateStation(seed: StationSeed, idx: number): Station {
  const district = provinces
    .flatMap(p => p.cities)
    .flatMap(c => c.districts)
    .find(d => d.code === seed.districtCode)!;
  const city = provinces
    .flatMap(p => p.cities)
    .find(c => c.code === district.cityCode)!;
  const province = provinces.find(p => p.code === city.provinceCode)!;

  const stationTypes: ('4G' | '5G')[] = ['4G', '5G'];
  const statuses: ('online' | 'offline' | 'maintenance')[] = ['online', 'online', 'online', 'online', 'maintenance', 'offline'];

  return {
    id: `ST-${String(idx + 1).padStart(4, '0')}`,
    name: `${district.name}基站${idx % 3 + 1}号`,
    code: `BS${seed.districtCode}${String(idx + 1).padStart(2, '0')}`,
    provinceCode: province.code,
    cityCode: city.code,
    districtCode: district.code,
    latitude: Math.round((seed.latBase + (Math.random() * 0.08 - 0.04)) * 10000) / 10000,
    longitude: Math.round((seed.lngBase + (Math.random() * 0.08 - 0.04)) * 10000) / 10000,
    type: stationTypes[idx % 2],
    status: statuses[idx % statuses.length],
    capacity: 500 + Math.floor(Math.random() * 1500),
    currentLoad: Math.floor(Math.random() * 900),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000).toISOString(),
  };
}

export const stations: Station[] = stationSeeds.map((seed, idx) => generateStation(seed, idx));

export function getStationById(id: string): Station | undefined {
  return stations.find(s => s.id === id);
}

export function getStationsByDistrict(districtCode: string): Station[] {
  return stations.filter(s => s.districtCode === districtCode);
}

export function getStationsByCity(cityCode: string): Station[] {
  return stations.filter(s => s.cityCode === cityCode);
}

export function getStationsByProvince(provinceCode: string): Station[] {
  return stations.filter(s => s.provinceCode === provinceCode);
}
