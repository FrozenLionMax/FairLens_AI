import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { S } from './styles';

export default function WhyBiasExists({ results }) {
  const proxy = results.bias_scores.proxy_detected ? [results.bias_scores.proxy_detected] : [];
  const protectedAttrs = results.bias_scores.protected_attributes || [];
  
  const original = results.bias_scores.original || {};
  const majRate = original.majority_rate != null ? Math.round(original.majority_rate) : 71;
  const minRate = original.minority_rate != null ? Math.round(original.minority_rate) : 42;
  const gap = Math.abs(majRate - minRate);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, marginBottom: 28 }}>
      <h3 style={S.sectionTitle}><AlertTriangle size={18} color="#f97316" /> Why Does Bias Exist in This Data?</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        {protectedAttrs.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 18 }}>
            <p style={{ color: '#fca5a5', fontWeight: 700, margin: '0 0 10px', fontSize: 14 }}>🔴 Sensitive Factors Directly Used</p>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, margin: '0 0 10px' }}>The dataset contains fields that directly represent protected characteristics.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {protectedAttrs.map((a, i) => <span key={i} style={{ ...S.tag('#ef4444'), textTransform: 'capitalize' }}>{a}</span>)}
            </div>
          </div>
        )}
        {proxy.length > 0 && (
          <div style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, padding: 18 }}>
            <p style={{ color: '#fdba74', fontWeight: 700, margin: '0 0 10px', fontSize: 14 }}>🟡 Hidden Proxy Fields Found</p>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, margin: '0 0 10px' }}>These fields look neutral but are strongly linked to sensitive characteristics.</p>
            {proxy.map((p, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>"{p.feature}"</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}> is {Math.round(p.correlation)}% linked to protected groups</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 18 }}>
          <p style={{ color: '#a5b4fc', fontWeight: 700, margin: '0 0 10px', fontSize: 14 }}>📊 Unequal Selection Rates</p>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, margin: '0 0 10px' }}>Different groups are being selected at very different rates, violating the EEOC 80% rule.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#22c55e', fontSize: 24, fontWeight: 800, margin: 0 }}>{majRate}%</p>
              <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>Majority Group</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#475569' }}><ArrowRight size={16} /></div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ef4444', fontSize: 24, fontWeight: 800, margin: 0 }}>{minRate}%</p>
              <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>Minority Group</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ ...S.tag('#ef4444'), fontSize: 11 }}>{gap}% gap</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
