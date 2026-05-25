'use strict';

const PLATFORM_BASES = {
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
  twitch: 'rtmp://live.twitch.tv/app',
  kick: 'rtmps://fa723fc1b171.global-contribute.live-video.net:443/app',
};

function normalizePlatformUrl(raw, platform) {
  if (!raw) return null;

  const base = PLATFORM_BASES[platform];
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
      const key = segments[segments.length - 1] || '';
      return buildUrl(key) || value;
    } catch {
      return value;
    }
  }

  return buildUrl(value.replace(/^\/+/, '').replace(/^(app|live2)\//i, '')) || value;
}

module.exports = {
  normalizePlatformUrl,
};