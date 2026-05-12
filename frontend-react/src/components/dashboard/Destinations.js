import React, { useState } from 'react';
import { userAPI } from '../../api/endpoints';

const Destinations = () => {
  const [ytUrl, setYtUrl] = useState('');
  const [twUrl, setTwUrl] = useState('');
  const [kkUrl, setKkUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateDestinations(ytUrl, twUrl, kkUrl, true, true, true);
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
