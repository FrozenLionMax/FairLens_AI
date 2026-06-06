import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { S } from './styles';

export default function EEOCPanel({ results }) {
  const metrics = [
    { label: 'Fairness Ratio', sublabel: '(Disparate Impact Ratio)', value: results.bias_scores.disparate_impact_ratio, threshold: '≥ 0.80', pass: results.bias_scores.disparate_impact_ratio >= 0.80, explain: 'Compares the selection rate of the least-selected group to the most-selected. Below 0.80 = illegal bias under EEOC rules.' },
    { label: 'Selection Difference', sublabel: '(Statistical Parity Diff)', value: results.bias_scores.statistical_parity_diff, threshold: '< ±0.10', pass: Math.abs(results.bias_scores.statistical_parity_diff) < 0.10, explain: 'How much the selection rates differ between groups.' },
    { label: 'Group Selection Gap', sublabel: '(Demographic Parity Gap)', value: results.bias_scores.demographic_parity_gap, threshold: '< ±0.10', pass: Math.abs(results.bias_scores.demographic_parity_gap) < 0.10, explain: 'The absolute gap between how often different groups receive positive outcomes.' },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, marginBottom: 28 }}>
      <h3 style={S.sectionTitle}><Shield size={18} color="#6366f1" /> EEOC Fairness Metrics Explained</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        {metrics.map((m, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02 }} style={{ background: m.pass ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${m.pass ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {m.pass ? <CheckCircle2 size={18} color="#22c55e" /> : <AlertTriangle size={18} color="#ef4444" />}
              <div>
                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, margin: 0 }}>{m.label}</p>
                <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{m.sublabel}</p>
              </div>
              <span style={{ ...S.tag(m.pass ? '#22c55e' : '#ef4444'), marginLeft: 'auto', fontSize: 11 }}>{m.pass ? 'PASS' : 'FAIL'}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: m.pass ? '#22c55e' : '#ef4444', margin: '0 0 6px' }}>{typeof m.value === 'number' ? m.value.toFixed(3) : m.value}</p>
            <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 10px' }}>Threshold: {m.threshold}</p>
            <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: 0, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>{m.explain}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
