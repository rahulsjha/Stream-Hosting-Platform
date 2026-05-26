'use strict';

const PLATFORM_BASES = {
  // Use RTMPS on the official YouTube ingest host. Keep env override for ops.
  youtube: process.env.YOUTUBE_INGEST_BASE || 'rtmps://a.rtmp.youtube.com/live2',
  twitch: 'rtmp://live.twitch.tv/app',
  kick: 'rtmps://fa723fc1b171.global-contribute.live-video.net:443/app',
};

const PLATFORM_PATH_PREFIX = {
  youtube: 'live2',
  twitch: 'app',
  kick: 'app',
};

function normalizePlatformUrl(raw, platform) {
  if (!raw) return null;

  const base = PLATFORM_BASES[platform];
  const pathPrefix = PLATFORM_PATH_PREFIX[platform];
  if (!base) return String(raw).trim() || null;

  const value = String(raw).trim();
  if (!value) return null;

  const buildUrl = (key) => (key ? `${base}/${key}` : null);

  if (/^rtmps?:\/\//i.test(value)) {
    try {
      const parsed = new URL(
        value.replace(/^rtmps/i, 'https').replace(/^rtmp/i, 'http')
      );
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (!segments.length) return null;

      const [firstSegment, ...rest] = segments;
      if (firstSegment.toLowerCase() !== pathPrefix) {
        // Preserve non-standard URLs as-is instead of coercing them.
        return value;
      }

      const key = (rest.join('/') || '').trim();
      return buildUrl(key);
    } catch {
      return value;
    }
  }

  const normalizedKey = value
    .replace(/^\/+/, '')
    .replace(new RegExp(`^${pathPrefix}\/`, 'i'), '')
    .trim();

  return buildUrl(normalizedKey);
}

module.exports = {
  normalizePlatformUrl,
};