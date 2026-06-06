import React from 'react';
import { motion } from 'framer-motion';
import { S, getRiskLevel } from './styles';

export default function ColumnBiasPanel({ results }) {
  const cols = results?.bias_scores?.column_bias || [];
  if (cols.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, marginBottom: 28 }}>
      <h3 style={S.sectionTitle}>🔬 Column-Level Bias Analysis</h3>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
        These specific columns in your dataset were identified as sources of bias:
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 14 }}>
        {cols.map((col, i) => {
          const risk = getRiskLevel(col.bias_score);
          return (
            <motion.div key={i} whileHover={{ scale: 1.02 }}
              style={{ background: `${risk.color}11`, border: `1px solid ${risk.color}33`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>"{col.column}"</span>
                <span style={{ ...S.tag(risk.color), fontSize: 10 }}>{col.bias_score}%</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 8px' }}>
                Attribute: <strong style={{ color: '#a5b4fc', textTransform: 'capitalize' }}>{col.attribute}</strong>
              </p>
              <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 8px' }}>
                Most favored: <strong style={{ color: '#e2e8f0' }}>{col.highest_selection_group || 'N/A'}</strong>
              </p>
              <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 8px' }}>
                Least favored: <strong style={{ color: '#e2e8f0' }}>{col.lowest_selection_group || 'N/A'}</strong>
              </p>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${col.bias_score}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  style={{ height: '100%', background: risk.color, borderRadius: 2 }} />
              </div>
            </motion.div>
          );
        })}
      </div>
      {results?.bias_scores?.outcome_column && (
        <div style={{ marginTop: 16, background: 'rgba(99,102,241,0.08)', borderRadius: 10, padding: '10px 16px' }}>
          <p style={{ color: '#a5b4fc', fontSize: 13, margin: 0 }}>
            🎯 Outcome column detected: <strong>"{results.bias_scores.outcome_column}"</strong> — bias calculated against actual selection rates
          </p>
        </div>
      )}
    </motion.div>
  );
}
