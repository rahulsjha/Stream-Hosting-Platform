import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../api/endpoints';

const Destinations = () => {
  const { user, fetchProfile } = useAuth();
  const [ytUrl, setYtUrl] = useState('');
  const [twUrl, setTwUrl] = useState('');
  const [kkUrl, setKkUrl] = useState('');
  const [ytKey, setYtKey] = useState('');
  const [twKey, setTwKey] = useState('');
  const [kkKey, setKkKey] = useState('');
  const [saving, setSaving] = useState(false);

  const extractKey = useCallback((value) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';
    try {
      const url = new URL(raw);
      const segments = url.pathname.split('/').filter(Boolean);
      return segments.length ? segments[segments.length - 1] : raw;
    } catch {
      const segments = raw.split('/').filter(Boolean);
      return segments.length ? segments[segments.length - 1] : raw;
    }
  }, []);

  const loadSavedDestinations = useCallback((profile = {}) => {
    setYtUrl(profile.youtube_url || '');
    setTwUrl(profile.twitch_url || '');
    setKkUrl(profile.kick_url || '');
    setYtKey(extractKey(profile.youtube_url));
    setTwKey(extractKey(profile.twitch_url));
    setKkKey(extractKey(profile.kick_url));
  }, [extractKey]);

  useEffect(() => {
    let active = true;

    const syncProfile = async () => {
      try {
        if (!user?.username) return;
        const response = await fetchProfile({ clearOnFailure: false });
        if (!active) return;
        loadSavedDestinations(response || user || {});
      } catch {
        if (active) loadSavedDestinations(user || {});
      }
    };

    syncProfile();

    return () => {
      active = false;
    };
  }, [fetchProfile, loadSavedDestinations, user]);

  const savedSummary = useMemo(() => ([
    { label: 'YouTube', url: ytUrl, key: ytKey },
    { label: 'Twitch', url: twUrl, key: twKey },
    { label: 'Kick', url: kkUrl, key: kkKey },
  ]), [kkKey, kkUrl, twKey, twUrl, ytKey, ytUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // If the user provided platform keys, construct the platform ingest URLs
      const buildYt = ytKey && !ytUrl ? `rtmp://a.rtmp.youtube.com/live2/${ytKey}` : ytUrl;
      const buildTw = twKey && !twUrl ? `rtmp://live.twitch.tv/app/${twKey}` : twUrl;
      const buildKk = kkKey && !kkUrl ? `rtmps://global-contribute.live-video.net:443/app/${kkKey}` : kkUrl;

      await userAPI.updateDestinations(buildYt, buildTw, buildKk, !!(buildYt), !!(buildTw), !!(buildKk));
      const refreshed = await fetchProfile({ clearOnFailure: false });
      loadSavedDestinations(refreshed || {
        youtube_url: buildYt,
        twitch_url: buildTw,
        kick_url: buildKk,
      });
      alert('Destinations updated successfully!');
    } catch (error) {
      alert('Failed to update destinations');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-destinations">
      <div className="card">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-satellite-dish"></i> Streaming Destinations
          </h3>
        </div>

        <form onSubmit={handleSave} style={{ maxWidth: '600px' }}>
          {/* YouTube */}
          <div className="form-group">
            <label htmlFor="yt_url">YouTube RTMP URL</label>
            <input
              id="yt_url"
              type="url"
              placeholder="rtmp://a.rtmp.youtube.com/live2/..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
            />
              <small className="muted">Or enter only your YouTube stream key below</small>
              <input
                id="yt_key"
                type="text"
                placeholder="YouTube stream key (e.g. xxxxx-xxxx-xxxx)"
                value={ytKey}
                onChange={(e) => setYtKey(e.target.value)}
                style={{ marginTop: '6px' }}
              />
          </div>

          {/* Twitch */}
          <div className="form-group">
            <label htmlFor="tw_url">Twitch RTMP URL</label>
            <input
              id="tw_url"
              type="url"
              placeholder="rtmp://live.twitch.tv/app/..."
              value={twUrl}
              onChange={(e) => setTwUrl(e.target.value)}
            />
            <small className="muted">Or enter only your Twitch stream key below</small>
            <input
              id="tw_key"
              type="text"
              placeholder="Twitch stream key"
              value={twKey}
              onChange={(e) => setTwKey(e.target.value)}
              style={{ marginTop: '6px' }}
            />
          </div>

          {/* Kick */}
          <div className="form-group">
            <label htmlFor="kk_url">Kick RTMPS URL</label>
            <input
              id="kk_url"
              type="url"
              placeholder="rtmps://fa723fc1b171.global-contribute.live-video.net:443/app/..."
              value={kkUrl}
              onChange={(e) => setKkUrl(e.target.value)}
            />
            <small className="muted">Or enter only your Kick stream key below</small>
            <input
              id="kk_key"
              type="text"
              placeholder="Kick stream key"
              value={kkKey}
              onChange={(e) => setKkKey(e.target.value)}
              style={{ marginTop: '6px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Destinations'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ marginBottom: '10px', fontWeight: 600 }}>Stored in your dashboard</p>
          <div style={{ display: 'grid', gap: '10px' }}>
            {savedSummary.map((item) => (
              <div key={item.label} style={{ display: 'grid', gap: '4px' }}>
                <div style={{ fontSize: '12px', color: 'var(--dash-muted)' }}>{item.label}</div>
                <div style={{ fontSize: '13px' }}>
                  URL: {item.url || 'Not saved yet'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--dash-muted)' }}>
                  Key: {item.key || 'Not saved yet'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
