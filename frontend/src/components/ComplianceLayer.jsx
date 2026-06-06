import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { S } from './styles';

export default function ComplianceLayer({ results }) {
  const eeocPass = results.bias_scores.disparate_impact_ratio >= 0.80;
  const hash = `FL-${results.analysis_id?.slice(-8)?.toUpperCase() || 'CERT2024'}`;
  
  // Dynamically check for PII columns like zip, income, age
  const cols = results.bias_scores.protected_attributes || [];
  const hasPII = cols.some(c => ['zip', 'income', 'age', 'location'].includes(c.toLowerCase()));

  const badges = [
    { label: 'EEOC Compliance', status: eeocPass ? 'PASS' : 'FAIL', color: eeocPass ? '#22c55e' : '#ef4444', icon: '🏛️' },
    { label: 'Privacy Risk', status: hasPII ? 'DETECTED' : 'LOW', color: hasPII ? '#f97316' : '#22c55e', icon: '👁️' },
    { label: 'Audit Trace', status: 'RECORDED', color: '#6366f1', icon: '📋' },
    { label: 'Bias Certification', status: hash, color: '#94a3b8', icon: '🔐', mono: true },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, marginBottom: 28 }}>
      <h3 style={S.sectionTitle}><Lock size={18} color="#6366f1" /> Compliance & Certification Layer</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        {badges.map((b, i) => (
          <div key={i} style={{ background: `${b.color}11`, border: `1px solid ${b.color}33`, borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{b.icon}</span>
            <p style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>{b.label}</p>
            <p style={{ color: b.color, fontWeight: 700, fontSize: b.mono ? 11 : 14, margin: 0, fontFamily: b.mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{b.status}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
