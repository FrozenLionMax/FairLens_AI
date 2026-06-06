import React from 'react';
import { motion } from 'framer-motion';
import { S, getRiskLevel } from '../components/styles';

export default function HistoryPage({ history, onViewResult, onCompare }) {
  const hasHistory = history && history.length > 0;

  return (
    <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: 0 }}>Audit History</h2>
          {hasHistory && <p style={{ color: '#64748b', fontSize: 12, margin: '6px 0 0' }}>{history.length} audit{history.length !== 1 ? 's' : ''} recorded</p>}
        </div>
        {hasHistory && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCompare}
            style={{ 
              background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff', border: 'none', 
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 
            }}
          >
            Compare Audits
          </motion.button>
        )}
      </div>
      {hasHistory ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
            <tr>{['Audit ID', 'Date', 'File', 'Bias Score', 'EEOC', 'Status', 'Action'].map(h => (
              <th key={h} style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {history.map((row, i) => {
              const score = row.overall_score ?? row.score ?? 0;
              const risk = getRiskLevel(score);
              const eeocPass = row.eeoc_pass ?? (row.eeoc === 'PASS');
              const realId = row.analysis_id || row.id;
              const displayId = realId ? `FL-${realId.slice(-8).toUpperCase()}` : `FL-${i + 1}`;
              const displayDate = row.timestamp
                ? new Date(row.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : (row.date || '—');
              const displayFile = row.filename || row.file || '—';
              return (
                <tr key={i} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => realId && onViewResult && onViewResult(realId)}
                >
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{displayId}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 13 }}>{displayDate}</td>
                  <td style={{ padding: '14px 20px', color: '#e2e8f0', fontSize: 13 }}>{displayFile}</td>
                  <td style={{ padding: '14px 20px', color: risk.color, fontWeight: 700 }}>{score}%</td>
                  <td style={{ padding: '14px 20px' }}><span style={{ ...S.tag(eeocPass ? '#22c55e' : '#ef4444'), fontSize: 11 }}>{eeocPass ? 'PASS' : 'FAIL'}</span></td>
                  <td style={{ padding: '14px 20px' }}><span style={{ ...S.tag(risk.color), fontSize: 11 }}>{risk.label}</span></td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ color: '#6366f1', fontSize: 12, fontWeight: 600 }}>View →</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>📋</p>
          <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No audits yet</h3>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Upload a dataset to get started — your audit history will appear here.</p>
        </div>
      )}
    </div>
  );
}
