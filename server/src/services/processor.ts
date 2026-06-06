import {
  baseStations,
  rawMetrics,
  aggregatedMetrics,
  broadcast,
} from '../store/index.js';
import { provinces } from '../data/regions.js';
import type { RawStationMetrics, NetworkMetrics } from '../types/index.js';

const cleanRawMetrics = (metrics: RawStationMetrics[]): RawStationMetrics[] => {
  const seen = new Map<string, RawStationMetrics>();

  for (const m of metrics) {
    const key = `${m.stationId}-${m.timestamp}`;
    if (!seen.has(key)) {
      seen.set(key, m);
    }
  }

  const deduplicated = Array.from(seen.values());

  return deduplicated.filter((m) => {
    if (m.signalStrength < -140 || m.signalStrength > -50) return false;
    if (m.dropCallCount < 0) return false;
    if (m.totalCallCount < 0) return false;
    if (m.trafficGB < 0) return false;
    if (m.complaintCount < 0) return false;
    return true;
  });
};

interface RegionGroup {
  code: string;
  type: 'province' | 'city' | 'district';
  stations: string[];
}

const buildRegionGroups = (): RegionGroup[] => {
  const groups: RegionGroup[] = [];

  const districtStations = new Map<string, string[]>();
  const cityStations = new Map<string, string[]>();
  const provinceStations = new Map<string, string[]>();

  for (const st of baseStations) {
    if (!districtStations.has(st.districtCode)) districtStations.set(st.districtCode, []);
    districtStations.get(st.districtCode)!.push(st.id);

    if (!cityStations.has(st.cityCode)) cityStations.set(st.cityCode, []);
    cityStations.get(st.cityCode)!.push(st.id);

    if (!provinceStations.has(st.provinceCode)) provinceStations.set(st.provinceCode, []);
    provinceStations.get(st.provinceCode)!.push(st.id);
  }

  for (const prov of provinces) {
    if (provinceStations.has(prov.code)) {
      groups.push({
        code: prov.code,
        type: 'province',
        stations: provinceStations.get(prov.code)!,
      });
    }
    for (const city of prov.cities) {
      if (cityStations.has(city.code)) {
        groups.push({
          code: city.code,
          type: 'city',
          stations: cityStations.get(city.code)!,
        });
      }
      for (const dist of city.districts) {
        if (districtStations.has(dist.code)) {
          groups.push({
            code: dist.code,
            type: 'district',
            stations: districtStations.get(dist.code)!,
          });
        }
      }
    }
  }

  return groups;
};

const regionGroups = buildRegionGroups();

const getTimeSlot = (isoTime: string): string => {
  const d = new Date(isoTime);
  return `${String(d.getHours()).padStart(2, '0')}:${String(Math.floor(d.getMinutes() / 5) * 5).padStart(2, '0')}`;
};

const aggregateForRegion = (
  group: RegionGroup,
  timeBucket: string,
  relevantMetrics: RawStationMetrics[]
): NetworkMetrics | null => {
  const stationSet = new Set(group.stations);
  const regionMetrics = relevantMetrics.filter((m) => stationSet.has(m.stationId));

  if (regionMetrics.length === 0) {
    return null;
  }

  const totalStations = group.stations.length;
  const goodSignalStationIds = new Set(
    regionMetrics.filter((m) => m.signalStrength > -100).map((m) => m.stationId)
  );
  const signalCoverage = (goodSignalStationIds.size / Math.max(totalStations, 1)) * 100;

  const totalDropCalls = regionMetrics.reduce((s, m) => s + m.dropCallCount, 0);
  const totalCalls = regionMetrics.reduce((s, m) => s + m.totalCallCount, 0);
  const dropRate = totalCalls > 0 ? (totalDropCalls / totalCalls) * 100 : 0;

  const totalTrafficGB = regionMetrics.reduce((s, m) => s + m.trafficGB, 0);
  const avgDownloadSpeed = Math.min(200, Math.max(10, 10 + (totalTrafficGB / Math.max(regionMetrics.length, 1)) * 0.5));

  const totalComplaints = regionMetrics.reduce((s, m) => s + m.complaintCount, 0);
  const complaintFactor = Math.min(1, totalComplaints / (group.stations.length * 3));
  const dropFactor = Math.min(1, dropRate / 10);
  const satisfactionScore = Math.min(100, Math.max(60, 100 - dropFactor * 25 - complaintFactor * 15));

  const d = new Date(timeBucket);
  const totalUsers = Math.floor(50000 + group.stations.length * 15000 + Math.random() * 100000);

  return {
    id: `agg-${group.code}-${d.getTime()}`,
    regionCode: group.code,
    regionType: group.type,
    timestamp: timeBucket,
    timeSlot: getTimeSlot(timeBucket),
    signalCoverage: Math.round(signalCoverage * 100) / 100,
    dropRate: Math.round(dropRate * 100) / 100,
    avgDownloadSpeed: Math.round(avgDownloadSpeed * 100) / 100,
    satisfactionScore: Math.round(satisfactionScore * 100) / 100,
    totalUsers,
    trafficVolume: Math.round(totalTrafficGB * 100) / 100,
    complaintCount: totalComplaints,
    dropCallCount: totalDropCalls,
    totalCallCount: totalCalls,
  };
};

const aggregateMetricsByRegion = (timeBucket: string): NetworkMetrics[] => {
  const bucketDate = new Date(timeBucket);
  const bucketMs = bucketDate.getTime();
  const windowMs = 5 * 60 * 1000;

  const relevantMetrics = cleanRawMetrics(
    rawMetrics.filter((m) => {
      const t = new Date(m.timestamp).getTime();
      return t >= bucketMs && t < bucketMs + windowMs;
    })
  );

  const results: NetworkMetrics[] = [];

  for (const group of regionGroups) {
    const agg = aggregateForRegion(group, timeBucket, relevantMetrics);
    if (agg) {
      results.push(agg);
    }
  }

  for (const agg of results) {
    const existingIdx = aggregatedMetrics.findIndex(
      (m) => m.regionCode === agg.regionCode && m.timestamp === agg.timestamp
    );
    if (existingIdx >= 0) {
      aggregatedMetrics[existingIdx] = agg;
    } else {
      aggregatedMetrics.push(agg);
    }
  }

  const twentyFourHoursAgo = Date.now() - 24 * 3600 * 1000;
  const cutoff = new Date(twentyFourHoursAgo).toISOString();
  for (let i = aggregatedMetrics.length - 1; i >= 0; i--) {
    if (aggregatedMetrics[i].timestamp < cutoff) {
      aggregatedMetrics.splice(i, 1);
    }
  }

  aggregatedMetrics.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (results.length > 0) {
    broadcast({
      type: 'aggregated_metrics',
      data: {
        count: results.length,
        timeBucket,
        regions: results.map((r) => ({
          code: r.regionCode,
          type: r.regionType,
          coverage: r.signalCoverage,
          dropRate: r.dropRate,
        })),
      },
    });
  }

  return results;
};

export {
  cleanRawMetrics,
  aggregateMetricsByRegion,
};
