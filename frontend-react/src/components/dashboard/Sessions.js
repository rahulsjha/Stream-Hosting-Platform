import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../api/endpoints';

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      if (user?.username) {
        const response = await userAPI.getSessions(user.username);
        setSessions(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className="section-sessions">
      <div className="card">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-chart-simple"></i> Stream History
          </h3>
        </div>

        {loading ? (
          <p style={{ color: 'var(--dash-muted)' }}>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p style={{ color: 'var(--dash-muted)', textAlign: 'center', padding: '40px' }}>
            No stream sessions yet. Start streaming to see history here.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dash-border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', fontSize: '13px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', fontSize: '13px' }}>Duration</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', fontSize: '13px' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', fontSize: '13px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {new Date(session.started_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {session.duration_seconds ? `${Math.floor(session.duration_seconds / 3600)}h ${Math.floor((session.duration_seconds % 3600) / 60)}m` : '–'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      <span style={{ textTransform: 'uppercase', fontSize: '12px', color: 'var(--dash-accent)' }}>
                        {session.ingest_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {session.is_active ? (
                        <span className="badge badge-live">
                          <i className="fa-solid fa-circle-dot"></i> LIVE
                        </span>
                      ) : (
                        <span className="badge badge-offline">Offline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
