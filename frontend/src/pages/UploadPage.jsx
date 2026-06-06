import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Zap, SlidersHorizontal, X, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { S } from '../components/styles';

export default function UploadPage({ loading, progress, handleUpload, handleSampleData, previewData, onQuickAudit, onChooseColumns, onCancelUpload }) {
  return (
    <div style={{ maxWidth: 860 }}>
      <AnimatePresence mode="wait">
        {/* STATE: File has been uploaded → show preview card with 2 buttons */}
        {previewData && !loading ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={S.card}
          >
            {/* File Info Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
                  padding: 12, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={26} color="#22c55e" />
                </div>
                <div>
                  <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: 0 }}>
                    Dataset Ready!
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
                    {previewData.filename}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancelUpload}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: '#94a3b8', padding: '6px 12px', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <X size={14} /> Change File
              </motion.button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Rows', value: previewData.total_rows.toLocaleString(), icon: '📊' },
                { label: 'Columns', value: previewData.total_columns, icon: '📐' },
                { label: 'Numeric', value: previewData.columns.filter(c => c.is_numeric).length, icon: '🔢' },
                { label: 'Categorical', value: previewData.columns.filter(c => c.is_categorical).length, icon: '🏷️' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
                  borderRadius: 10, padding: '12px 14px', textAlign: 'center',
                }}>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 2px', fontWeight: 600 }}>{s.icon} {s.label}</p>
                  <p style={{ fontSize: 22, color: '#e2e8f0', margin: 0, fontWeight: 800 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Mini Data Table */}
            <div style={{
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
              overflow: 'hidden', marginBottom: 28,
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      {previewData.columns.slice(0, 7).map((col, i) => (
                        <th key={i} style={{
                          background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                          padding: '8px 12px', textAlign: 'left', fontWeight: 700,
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          whiteSpace: 'nowrap', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.03em',
                        }}>
                          {col.name}
                          {col.suggested_role === 'target' && <span style={{ marginLeft: 4, color: '#93c5fd' }}>🎯</span>}
                          {col.suggested_role === 'protected' && <span style={{ marginLeft: 4, color: '#fca5a5' }}>🛡️</span>}
                        </th>
                      ))}
                      {previewData.columns.length > 7 && (
                        <th style={{
                          background: 'rgba(99,102,241,0.1)', color: '#64748b',
                          padding: '8px 12px', fontSize: 10, fontStyle: 'italic',
                        }}>
                          +{previewData.columns.length - 7} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.preview_rows.slice(0, 3).map((row, ri) => (
                      <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.2)' }}>
                        {previewData.columns.slice(0, 7).map((col, ci) => (
                          <td key={ci} style={{
                            padding: '6px 12px', color: '#94a3b8', fontFamily: "'DM Mono', monospace",
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {row[col.name]}
                          </td>
                        ))}
                        {previewData.columns.length > 7 && (
                          <td style={{ padding: '6px 12px', color: '#475569', fontSize: 10 }}>…</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Two Action Buttons */}
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
              How would you like to run the bias audit?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Quick Audit Button */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onQuickAudit}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  border: 'none', borderRadius: 14, padding: '24px 20px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Zap size={22} color="#fff" />
                  <span style={{ color: '#fff', fontSize: 17, fontWeight: 800 }}>Quick Audit</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  Let AI automatically detect the outcome and protected columns. Fastest option.
                </p>
              </motion.button>

              {/* Choose Columns Button */}
              <motion.button
                whileHover={{ scale: 1.02, borderColor: 'rgba(139,92,246,0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onChooseColumns}
                style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '2px solid rgba(139,92,246,0.25)', borderRadius: 14, padding: '24px 20px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <SlidersHorizontal size={22} color="#a78bfa" />
                  <span style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 800 }}>Choose Columns</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  Manually pick the outcome & protected attribute columns for full control.
                </p>
              </motion.button>
            </div>
          </motion.div>

        ) : (
          /* STATE: No file uploaded yet → show standard upload UI */
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={S.card}
          >
            <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Upload Dataset for ML Bias Analysis</h2>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>Supports hiring data, loan applications, scholarship datasets, and any decision-making system data.</p>
            <div onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }} onDragLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.background = 'rgba(99,102,241,0.03)'; }} onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.background = 'rgba(99,102,241,0.03)'; e.dataTransfer.files[0] && handleUpload(e.dataTransfer.files[0]); }}
              style={{ border: '2px dashed rgba(99,102,241,0.25)', borderRadius: 14, padding: '48px 28px', textAlign: 'center', cursor: 'pointer', background: 'rgba(99,102,241,0.03)', transition: 'all .3s ease' }}>
              <input type="file" accept=".csv,.json,.xlsx" onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} disabled={loading} style={{ display: 'none' }} id="file-input" />
              <label htmlFor="file-input" style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Upload size={28} color="#6366f1" />
                </div>
                <p style={{ color: '#f1f5f9', fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>{loading ? 'Reading file...' : 'Click or drag & drop your dataset'}</p>
                <p style={{ color: '#64748b', margin: '0 0 18px', fontSize: 13 }}>CSV, JSON, or XLSX · Max 50MB</p>
                {!loading && <span style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: '#fff', padding: '10px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>Choose File</span>}
              </label>
            </div>
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>— or —</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={handleSampleData}
                disabled={loading}
                style={{
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
                  color: '#a5b4fc', fontWeight: 700, padding: '12px 28px', borderRadius: 10,
                  cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14,
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                🧪 Try with Sample Hiring Dataset
              </motion.button>
              <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>
                200-row hiring dataset with intentional gender bias — no upload needed
              </p>
            </div>

            {/* Loading bar */}
            {loading && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>🤖 {progress > 0 ? 'Running ML bias analysis...' : 'Reading your dataset...'}</span>
                  {progress > 0 && <span style={{ color: '#6366f1', fontSize: 13, fontWeight: 700 }}>{progress}%</span>}
                </div>
                {progress > 0 && (
                  <div style={{ width: '100%', background: '#1e293b', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${progress}%` }} style={{ background: 'linear-gradient(to right,#6366f1,#3b82f6)', height: '100%', borderRadius: 999 }} />
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginTop: 28 }}>
              {[
                { label: 'Hiring Data', desc: 'Applicant demographics & outcomes', icon: '👥' },
                { label: 'Loan Approvals', desc: 'Financial decisions by group', icon: '🏦' },
                { label: 'Scholarships', desc: 'Academic selection data', icon: '🎓' },
                { label: 'Custom Dataset', desc: 'Any decision-making CSV', icon: '📊' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, margin: 0 }}>{item.label}</p>
                    <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar for analysis after picking an option */}
      {loading && previewData && progress > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>🤖 Running ML bias analysis...</span>
            <span style={{ color: '#6366f1', fontSize: 13, fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', background: '#1e293b', borderRadius: 999, height: 8, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${progress}%` }} style={{ background: 'linear-gradient(to right,#6366f1,#3b82f6)', height: '100%', borderRadius: 999 }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
