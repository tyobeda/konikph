'use server';

import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';

// In-memory cache for IP Geolocation to prevent duplicate lookups
const geoCache = new Map<string, { country: string; countryCode: string; region: string; city: string }>();

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.')
  );
}

function parseUserAgent(ua: string) {
  let device = 'Desktop';
  let browser = 'Chrome';
  let os = 'Windows';

  const uaLower = ua.toLowerCase();

  // Device & OS
  if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ipod')) {
    device = uaLower.includes('ipad') ? 'Tablet' : 'Mobile';
    os = 'iOS';
  } else if (uaLower.includes('android')) {
    device = uaLower.includes('tablet') ? 'Tablet' : 'Mobile';
    os = 'Android';
  } else if (uaLower.includes('macintosh') || uaLower.includes('mac os x')) {
    device = 'Desktop';
    os = 'macOS';
  } else if (uaLower.includes('windows')) {
    device = 'Desktop';
    os = 'Windows';
  } else if (uaLower.includes('linux')) {
    device = 'Desktop';
    os = 'Linux';
  }

  // Browser
  if (uaLower.includes('edg/')) {
    browser = 'Edge';
  } else if (uaLower.includes('opr/') || uaLower.includes('opera')) {
    browser = 'Opera';
  } else if (uaLower.includes('samsungbrowser')) {
    browser = 'Samsung Internet';
  } else if (uaLower.includes('chrome') || uaLower.includes('crios')) {
    browser = 'Chrome';
  } else if (uaLower.includes('firefox') || uaLower.includes('fxios')) {
    browser = 'Firefox';
  } else if (uaLower.includes('safari') && !uaLower.includes('chrome')) {
    browser = 'Safari';
  }

  return { device, browser, os };
}

function parseTrafficSource(referer: string | null | undefined, currentHost: string | null | undefined): string {
  if (!referer) return 'Direct / Langsung';

  try {
    const refUrl = new URL(referer);
    const refHost = refUrl.hostname.toLowerCase();

    if (currentHost && refHost.includes(currentHost.toLowerCase())) {
      return 'Direct / Navigasi Internal';
    }

    if (refHost.includes('google.')) return 'Google Search';
    if (refHost.includes('instagram.com') || refHost.includes('ig.me')) return 'Instagram';
    if (refHost.includes('whatsapp.com') || refHost.includes('wa.me')) return 'WhatsApp';
    if (refHost.includes('tiktok.com')) return 'TikTok';
    if (refHost.includes('facebook.com') || refHost.includes('fb.me') || refHost.includes('fb.com')) return 'Facebook';
    if (refHost.includes('twitter.com') || refHost.includes('x.com') || refHost.includes('t.co')) return 'Twitter / X';
    if (refHost.includes('youtube.com') || refHost.includes('youtu.be')) return 'YouTube';
    if (refHost.includes('telegram.org') || refHost.includes('t.me')) return 'Telegram';
    if (refHost.includes('koni.or.id') || refHost.includes('kepahiangkab.go.id') || refHost.includes('bengkuluprov.go.id')) return 'KONI / Pemda Network';

    return `Rujukan: ${refHost.replace(/^www\./, '')}`;
  } catch (e) {
    return 'Direct / Langsung';
  }
}

async function lookupGeoIp(ip: string): Promise<{ country: string; countryCode: string; region: string; city: string }> {
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!;
  }

  if (isPrivateIp(ip)) {
    const localLoc = {
      country: 'Indonesia',
      countryCode: 'ID',
      region: 'DKI Jakarta',
      city: 'Jakarta (Lokal/Dev)',
    };
    geoCache.set(ip, localLoc);
    return localLoc;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        const result = {
          country: data.country || 'Indonesia',
          countryCode: data.countryCode || 'ID',
          region: data.regionName || 'DKI Jakarta',
          city: data.city || 'Jakarta',
        };
        geoCache.set(ip, result);
        return result;
      }
    }
  } catch (error) {
    // Fallback if rate limited or timeout
  }

  const fallback = {
    country: 'Indonesia',
    countryCode: 'ID',
    region: 'DKI Jakarta',
    city: 'Jakarta',
  };
  geoCache.set(ip, fallback);
  return fallback;
}

export async function trackPageView(payload: {
  path: string;
  referrer?: string;
}) {
  try {
    const headerList = await headers();
    
    // Extract real IP
    const forwardedFor = headerList.get('x-forwarded-for');
    const realIp = headerList.get('x-real-ip');
    const cfIp = headerList.get('cf-connecting-ip');
    const host = headerList.get('host') || '';
    const userAgent = headerList.get('user-agent') || '';

    let clientIp = cfIp || realIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : '') || '127.0.0.1';
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.replace('::ffff:', '');
    }

    // Ignore admin routes from tracking to keep stats clean for visitor analysis
    if (payload.path.startsWith('/admin') || payload.path.startsWith('/api')) {
      return { success: true, ignored: true };
    }

    const { device, browser, os } = parseUserAgent(userAgent);
    const source = parseTrafficSource(payload.referrer, host);
    const geo = await lookupGeoIp(clientIp);

    await (prisma as any).pageView.create({
      data: {
        path: payload.path || '/',
        referrer: payload.referrer || null,
        source: source,
        ip: clientIp,
        country: geo.country,
        countryCode: geo.countryCode,
        region: geo.region,
        city: geo.city,
        device,
        browser,
        os,
      },
    });

    // Keep database super lightweight: auto-prune table to maximum 100 rows
    const totalCount = await (prisma as any).pageView.count();
    if (totalCount > 100) {
      const oldestRows = await (prisma as any).pageView.findMany({
        orderBy: { createdAt: 'asc' },
        take: totalCount - 100,
        select: { id: true }
      });
      if (oldestRows.length > 0) {
        await (prisma as any).pageView.deleteMany({
          where: { id: { in: oldestRows.map((r: any) => r.id) } }
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to track page view:', error);
    return { success: false };
  }
}

export async function getAnalyticsStats(timeRange: 'today' | '7d' | '30d' | 'all' = '7d') {
  noStore();
  try {
    let dateFilter: Date | undefined;
    const now = new Date();

    if (timeRange === 'today') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === '7d') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause = dateFilter ? { createdAt: { gte: dateFilter } } : {};

    const [allViews, todayCount] = await Promise.all([
      (prisma as any).pageView.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          path: true,
          source: true,
          ip: true,
          country: true,
          countryCode: true,
          region: true,
          city: true,
          device: true,
          browser: true,
          os: true,
          createdAt: true,
        },
      }),
      (prisma as any).pageView.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
      }),
    ]);

    const totalViews = allViews.length;
    const uniqueIps = new Set(allViews.map((v: any) => v.ip).filter(Boolean));
    const uniqueVisitors = uniqueIps.size;

    // Daily Trend calculation
    const daysMap = new Map<string, { views: number; uniqueIps: Set<string> }>();
    const numDays = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : 30;
    
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      daysMap.set(key, { views: 0, uniqueIps: new Set<string>() });
    }

    allViews.forEach((item: any) => {
      const key = new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (daysMap.has(key)) {
        const cur = daysMap.get(key)!;
        cur.views += 1;
        if (item.ip) cur.uniqueIps.add(item.ip);
      }
    });

    const viewsTrend = Array.from(daysMap.entries()).map(([date, data]) => ({
      date,
      views: data.views,
      visitors: data.uniqueIps.size,
    }));

    // Aggregations helper
    const countBy = (key: string) => {
      const map: Record<string, number> = {};
      allViews.forEach((v: any) => {
        const val = v[key] || 'Lainnya';
        map[val] = (map[val] || 0) + 1;
      });
      return Object.entries(map)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    };

    const sources = countBy('source');
    const provinces = countBy('region');
    const countries = countBy('country');
    const topPages = countBy('path');
    const devices = countBy('device');
    const browsers = countBy('browser');
    const operatingSystems = countBy('os');

    const recentLogs = allViews.slice(0, 40).map((v: any) => ({
      id: v.id,
      path: v.path,
      source: v.source,
      ip: v.ip ? v.ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, '$1.$2.*.*') : '127.0.0.1',
      rawIp: v.ip,
      country: v.country,
      countryCode: v.countryCode,
      region: v.region,
      city: v.city,
      device: v.device,
      browser: v.browser,
      os: v.os,
      createdAt: v.createdAt,
    }));

    return {
      success: true,
      data: {
        totalViews,
        uniqueVisitors,
        todayCount,
        viewsTrend,
        sources,
        provinces: provinces.slice(0, 10),
        countries: countries.slice(0, 10),
        topPages: topPages.slice(0, 10),
        devices,
        browsers,
        operatingSystems,
        recentLogs,
      },
    };
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return { success: false, error: 'Gagal mengambil statistik analitik' };
  }
}

import { revalidatePath } from 'next/cache';

export async function clearAnalyticsLogs() {
  try {
    await (prisma as any).pageView.deleteMany({});
    revalidatePath('/admin/analytics');
    const freshStats = await getAnalyticsStats('7d');
    return { success: true, data: freshStats.data };
  } catch (error) {
    console.error('Failed to clear analytics logs:', error);
    return { success: false, error: 'Gagal membersihkan log' };
  }
}

export async function seedSampleAnalyticsData(freshCount = 25) {
  try {
    const sampleProvinces = [
      { region: 'Jawa Barat', city: 'Bandung', weight: 35 },
      { region: 'DKI Jakarta', city: 'Jakarta Selatan', weight: 28 },
      { region: 'Jawa Timur', city: 'Surabaya', weight: 20 },
      { region: 'Jawa Tengah', city: 'Semarang', weight: 18 },
      { region: 'Banten', city: 'Tangerang Selatan', weight: 14 },
      { region: 'Sumatera Utara', city: 'Medan', weight: 12 },
      { region: 'DI Yogyakarta', city: 'Yogyakarta', weight: 10 },
      { region: 'Sulawesi Selatan', city: 'Makassar', weight: 9 },
      { region: 'Sumatera Barat', city: 'Padang', weight: 8 },
      { region: 'Riau', city: 'Pekanbaru', weight: 6 },
    ];

    const sampleSources = [
      { source: 'Instagram', weight: 40 },
      { source: 'WhatsApp', weight: 25 },
      { source: 'Direct / Langsung', weight: 20 },
      { source: 'Google Search', weight: 15 },
      { source: 'TikTok', weight: 8 },
      { source: 'Twitter / X', weight: 6 },
      { source: 'Facebook', weight: 5 },
    ];

    const samplePaths = [
      '/',
      '/',
      '/',
      '/explore',
      '/explore',
      '/twibbon',
      '/twibbon',
      '/artwork/sample-poster-1',
      '/artwork/sample-banner-2',
      '/brandkit',
      '/creators',
    ];

    const sampleDevices = [
      { device: 'Mobile', browser: 'Chrome', os: 'Android', weight: 55 },
      { device: 'Mobile', browser: 'Safari', os: 'iOS', weight: 25 },
      { device: 'Desktop', browser: 'Chrome', os: 'Windows', weight: 15 },
      { device: 'Desktop', browser: 'Edge', os: 'Windows', weight: 5 },
    ];

    const now = Date.now();
    const dataToInsert = [];

    // Always generate `freshCount` visits occurring in the last 1-60 minutes
    for (let j = 0; j < freshCount; j++) {
      const randomProvince = sampleProvinces[Math.floor(Math.random() * sampleProvinces.length)];
      const randomSource = sampleSources[Math.floor(Math.random() * sampleSources.length)];
      const randomPath = samplePaths[Math.floor(Math.random() * samplePaths.length)];
      const randomDev = sampleDevices[Math.floor(Math.random() * sampleDevices.length)];
      // Spread across the last 30 minutes up to right now
      const secondsAgo = Math.floor(Math.random() * 1800) * 1000;
      const fakeIp = `182.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

      dataToInsert.push({
        path: randomPath,
        referrer: randomSource.source === 'Direct / Langsung' ? null : `https://${randomSource.source.toLowerCase().replace(/\s+/g, '')}.com`,
        source: randomSource.source,
        ip: fakeIp,
        country: 'Indonesia',
        countryCode: 'ID',
        region: randomProvince.region,
        city: randomProvince.city,
        device: randomDev.device,
        browser: randomDev.browser,
        os: randomDev.os,
        createdAt: new Date(now - secondsAgo),
      });
    }

    await (prisma as any).pageView.createMany({
      data: dataToInsert,
    });

    revalidatePath('/admin/analytics');
    const freshStats = await getAnalyticsStats('7d');

    return {
      success: true,
      seeded: true,
      count: dataToInsert.length,
      data: freshStats.data,
    };
  } catch (e) {
    console.error('Failed to seed sample analytics data:', e);
    return { success: false, error: 'Gagal membuat data simulasi' };
  }
}


