import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { S } from './styles';

const ROLE_COLORS = {
  target: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#93c5fd', label: '🎯 Outcome', desc: 'The decision column (e.g., Hired, Approved)' },
  protected: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#fca5a5', label: '🛡️ Protected', desc: 'Demographic trait to check for bias' },
};

export default function DataPreviewModal({ preview, onConfirm, onCancel, loading }) {
  const [targetCol, setTargetCol] = useState(() => {
    const suggested = preview.columns.find(c => c.suggested_role === 'target');
    return suggested?.name || '';
  });
  const [protectedCol, setProtectedCol] = useState(() => {
    const suggested = preview.columns.find(c => c.suggested_role === 'protected');
    return suggested?.name || '';
  });

  const targetCandidates = useMemo(() =>
    preview.columns.filter(c => c.is_binary || c.is_numeric), [preview]);
  const protectedCandidates = useMemo(() =>
    preview.columns.filter(c => c.name !== targetCol), [preview, targetCol]);

  const canSubmit = targetCol && protectedCol && targetCol !== protectedCol;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            background: 'linear-gradient(135deg, #0d1535, #111934)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 20, width: '100%', maxWidth: 920,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.1)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '28px 32px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(59,130,246,0.25))',
                  padding: 12, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 24 }}>📋</span>
                </div>
                <div>
                  <h2 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 800, margin: 0 }}>Dataset Preview</h2>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
                    {preview.filename} · {preview.total_rows.toLocaleString()} rows · {preview.total_columns} columns
                  </p>
                </div>
              </div>
              <button onClick={onCancel} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#94a3b8', padding: '6px 14px', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              }}>
                ✕ Cancel
              </button>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'flex', gap: 16, paddingBottom: 20 }}>
              {[
                { label: 'Rows', value: preview.total_rows.toLocaleString(), icon: '📊' },
                { label: 'Columns', value: preview.total_columns, icon: '📐' },
                { label: 'Numeric', value: preview.columns.filter(c => c.is_numeric).length, icon: '🔢' },
                { label: 'Categorical', value: preview.columns.filter(c => c.is_categorical).length, icon: '🏷️' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '10px 16px', flex: 1, textAlign: 'center',
                }}>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.icon} {s.label}</p>
                  <p style={{ fontSize: 20, color: '#e2e8f0', margin: 0, fontWeight: 800 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Table Preview */}
          <div style={{ padding: '20px 32px', overflowX: 'auto' }}>
            <p style={{ ...S.label, marginBottom: 10 }}>First 5 Rows</p>
            <div style={{
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {preview.columns.map((col, i) => (
                      <th key={i} style={{
                        background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                        padding: '10px 14px', textAlign: 'left', fontWeight: 700,
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em',
                      }}>
                        {col.name}
                        {col.name === targetCol && <span style={{ marginLeft: 6, fontSize: 10, color: '#93c5fd' }}>🎯</span>}
                        {col.name === protectedCol && <span style={{ marginLeft: 6, fontSize: 10, color: '#fca5a5' }}>🛡️</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview_rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.2)' }}>
                      {preview.columns.map((col, ci) => (
                        <td key={ci} style={{
                          padding: '8px 14px', color: '#cbd5e1', fontFamily: "'DM Mono', monospace",
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          whiteSpace: 'nowrap', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis',
                          background: col.name === targetCol ? 'rgba(59,130,246,0.05)' :
                                     col.name === protectedCol ? 'rgba(239,68,68,0.05)' : 'transparent',
                        }}>
                          {row[col.name]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column Picker */}
          <div style={{ padding: '0 32px 28px' }}>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 24 }} />
            
            <h3 style={{ color: '#f1f5f9', fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>
              Choose Columns for Bias Analysis
            </h3>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>
              Tell FairLens which column is the <strong style={{ color: '#93c5fd' }}>decision outcome</strong> and which column represents a <strong style={{ color: '#fca5a5' }}>protected demographic trait</strong>. We've pre-selected the most likely ones.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Target Column */}
              <div style={{
                background: ROLE_COLORS.target.bg, border: `1px solid ${ROLE_COLORS.target.border}`,
                borderRadius: 14, padding: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <div>
                    <p style={{ color: ROLE_COLORS.target.text, fontSize: 14, fontWeight: 700, margin: 0 }}>Outcome Column</p>
                    <p style={{ color: '#64748b', fontSize: 11, margin: '2px 0 0' }}>{ROLE_COLORS.target.desc}</p>
                  </div>
                </div>
                <select
                  value={targetCol}
                  onChange={e => setTargetCol(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0',
                    border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8,
                    padding: '10px 14px', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">Select a column...</option>
                  {targetCandidates.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.nunique} unique · {c.dtype})
                      {c.suggested_role === 'target' ? ' ← Suggested' : ''}
                    </option>
                  ))}
                </select>
                {targetCol && (
                  <p style={{ color: '#94a3b8', fontSize: 11, margin: '8px 0 0' }}>
                    Sample: {preview.columns.find(c => c.name === targetCol)?.sample_values.join(', ')}
                  </p>
                )}
              </div>

              {/* Protected Column */}
              <div style={{
                background: ROLE_COLORS.protected.bg, border: `1px solid ${ROLE_COLORS.protected.border}`,
                borderRadius: 14, padding: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🛡️</span>
                  <div>
                    <p style={{ color: ROLE_COLORS.protected.text, fontSize: 14, fontWeight: 700, margin: 0 }}>Protected Attribute</p>
                    <p style={{ color: '#64748b', fontSize: 11, margin: '2px 0 0' }}>{ROLE_COLORS.protected.desc}</p>
                  </div>
                </div>
                <select
                  value={protectedCol}
                  onChange={e => setProtectedCol(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
                    padding: '10px 14px', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">Select a column...</option>
                  {protectedCandidates.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.nunique} unique · {c.dtype})
                      {c.suggested_role === 'protected' ? ' ← Suggested' : ''}
                    </option>
                  ))}
                </select>
                {protectedCol && (
                  <p style={{ color: '#94a3b8', fontSize: 11, margin: '8px 0 0' }}>
                    Sample: {preview.columns.find(c => c.name === protectedCol)?.sample_values.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#94a3b8', padding: '12px 24px',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={canSubmit ? { scale: 1.03, boxShadow: '0 8px 32px rgba(99,102,241,0.4)' } : {}}
                whileTap={canSubmit ? { scale: 0.97 } : {}}
                onClick={() => canSubmit && onConfirm(targetCol, protectedCol)}
                disabled={!canSubmit || loading}
                style={{
                  background: canSubmit
                    ? 'linear-gradient(135deg, #6366f1, #3b82f6)'
                    : 'rgba(255,255,255,0.05)',
                  border: 'none', borderRadius: 10,
                  color: canSubmit ? '#fff' : '#475569',
                  padding: '12px 32px', cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontSize: 15, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {loading ? '⏳ Analyzing...' : '🚀 Run Bias Audit'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
