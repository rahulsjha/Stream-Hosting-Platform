import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../api/endpoints';

const Destinations = () => {
  const { user: authUser, fetchProfile } = useAuth();
  const username = authUser?.username || '';
  const initialYoutubeUrl = authUser?.youtube_url || '';
  const initialTwitchUrl = authUser?.twitch_url || '';
  const initialKickUrl = authUser?.kick_url || '';
  const [ytUrl, setYtUrl] = useState('');
  const [twUrl, setTwUrl] = useState('');
  const [kkUrl, setKkUrl] = useState('');
  const [ytKey, setYtKey] = useState('');
  const [twKey, setTwKey] = useState('');
  const [kkKey, setKkKey] = useState('');
  const [saving, setSaving] = useState(false);
  const initialProfileLoaded = useRef(false);
  const hasUserEdited = useRef(false);

  const extractKey = useCallback((value, platform) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';
    try {
      const url = new URL(raw);
      const segments = url.pathname.split('/').filter(Boolean);

      if (platform === 'youtube') {
        return segments.length >= 2 && segments[0] === 'live2' ? segments[1] : '';
      }

      if ((platform === 'twitch' || platform === 'kick') && segments.length >= 2 && segments[0] === 'app') {
        return segments[1];
      }

      return '';
    } catch {
      return '';
    }
  }, []);

  const loadSavedDestinations = useCallback((profile = {}) => {
    setYtUrl(profile.youtube_url || '');
    setTwUrl(profile.twitch_url || '');
    setKkUrl(profile.kick_url || '');
    setYtKey(extractKey(profile.youtube_url, 'youtube'));
    setTwKey(extractKey(profile.twitch_url, 'twitch'));
    setKkKey(extractKey(profile.kick_url, 'kick'));
  }, [extractKey]);

  useEffect(() => {
    let active = true;

    const syncProfile = async () => {
      try {
        if (!username) return;

        if (initialProfileLoaded.current) return;

        // If we already have values from the context, use them and mark loaded.
        if (initialYoutubeUrl || initialTwitchUrl || initialKickUrl) {
          initialProfileLoaded.current = true;
          loadSavedDestinations({
            youtube_url: initialYoutubeUrl,
            twitch_url: initialTwitchUrl,
            kick_url: initialKickUrl,
          });
          return;
        }

        // Mark as loaded now to avoid starting multiple concurrent fetches while
        // the user is typing (which could repeatedly overwrite inputs).
        initialProfileLoaded.current = true;

        const response = await fetchProfile({ clearOnFailure: false });
        if (!active) return;
        if (hasUserEdited.current) return;
        loadSavedDestinations(response || {
          youtube_url: initialYoutubeUrl,
          twitch_url: initialTwitchUrl,
          kick_url: initialKickUrl,
        });
      } catch {
        if (active && !hasUserEdited.current) {
          loadSavedDestinations({
            youtube_url: initialYoutubeUrl,
            twitch_url: initialTwitchUrl,
            kick_url: initialKickUrl,
          });
        }
      }
    };

    syncProfile();

    return () => {
      active = false;
    };
  }, [fetchProfile, initialYoutubeUrl, initialTwitchUrl, initialKickUrl, loadSavedDestinations, username]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Prefer stream keys when present; otherwise save the full ingest URL.
      const buildYt = ytKey?.trim()
        ? `rtmp://a.rtmp.youtube.com/live2/${ytKey.trim()}`
        : ytUrl.trim();
      const buildTw = twKey?.trim()
        ? `rtmp://live.twitch.tv/app/${twKey.trim()}`
        : twUrl.trim();
      const buildKk = kkKey?.trim()
        ? `rtmps://fa723fc1b171.global-contribute.live-video.net:443/app/${kkKey.trim()}`
        : kkUrl.trim();

      await userAPI.updateDestinations(buildYt, buildTw, buildKk, !!(buildYt), !!(buildTw), !!(buildKk));
      hasUserEdited.current = false;
      initialProfileLoaded.current = true;
      loadSavedDestinations({
        youtube_url: buildYt,
        twitch_url: buildTw,
        kick_url: buildKk,
      });
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
              onChange={(e) => {
                hasUserEdited.current = true;
                setYtUrl(e.target.value);
              }}
            />
              <small className="muted">Or enter only your YouTube stream key below</small>
              <input
                id="yt_key"
                type="text"
                placeholder="YouTube stream key (e.g. xxxxx-xxxx-xxxx)"
                value={ytKey}
                onChange={(e) => {
                  hasUserEdited.current = true;
                  setYtKey(e.target.value);
                }}
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
              onChange={(e) => {
                hasUserEdited.current = true;
                setTwUrl(e.target.value);
              }}
            />
            <small className="muted">Or enter only your Twitch stream key below</small>
            <input
              id="tw_key"
              type="text"
              placeholder="Twitch stream key"
              value={twKey}
              onChange={(e) => {
                hasUserEdited.current = true;
                setTwKey(e.target.value);
              }}
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
              onChange={(e) => {
                hasUserEdited.current = true;
                setKkUrl(e.target.value);
              }}
            />
            <small className="muted">Or enter only your Kick stream key below</small>
            <input
              id="kk_key"
              type="text"
              placeholder="Kick stream key"
              value={kkKey}
              onChange={(e) => {
                hasUserEdited.current = true;
                setKkKey(e.target.value);
              }}
              style={{ marginTop: '6px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Destinations'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Destinations;
