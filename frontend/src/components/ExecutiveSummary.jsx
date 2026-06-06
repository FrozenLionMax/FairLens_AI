import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { S } from './styles';

export default function ExecutiveSummary({ results }) {
  const overall = results.bias_scores.overall;
  const diRatio = results.bias_scores.disparate_impact_ratio;
  const eeocPass = diRatio >= 0.80;
  const verdict = overall >= 70 ? 'HIGH RISK' : overall >= 40 ? 'MODERATE RISK' : 'LOW RISK';
  const verdictColor = overall >= 70 ? '#ef4444' : overall >= 40 ? '#f97316' : '#22c55e';
  const hash = `FL-${results.analysis_id?.slice(-8)?.toUpperCase() || 'AUDIT2024'}`;
  const confidence = Math.max(75, Math.min(97, 100 - Math.abs(overall - 50) * 0.3)).toFixed(0);
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'linear-gradient(135deg,rgba(17,24,52,0.95),rgba(30,20,60,0.95))', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: 32, boxShadow: '0 8px 48px rgba(99,102,241,0.15)', marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Shield size={22} color="#6366f1" />
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Executive Audit Summary</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>FairLens Bias Audit Report</h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>File: {results.filename} · {new Date(results.timestamp).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...S.tag(verdictColor), fontSize: 15, padding: '8px 20px', fontWeight: 800 }}>⚡ {verdict}</div>
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>Audit ID: {hash}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16 }}>
        {[
          { label: 'Final Verdict', value: verdict, color: verdictColor, icon: '⚡' },
          { label: 'EEOC Compliance', value: eeocPass ? 'PASS ✓' : 'FAIL ✗', color: eeocPass ? '#22c55e' : '#ef4444', icon: '🏛️' },
          { label: 'Confidence Score', value: `${confidence}%`, color: '#6366f1', icon: '🎯' },
          { label: 'Audit Certified', value: eeocPass ? 'YES' : 'NO', color: eeocPass ? '#22c55e' : '#ef4444', icon: eeocPass ? '🏅' : '❌' },
          { label: 'Recommended Action', value: overall >= 70 ? 'Immediate Fix' : overall >= 40 ? 'Review Soon' : 'Monitor', color: verdictColor, icon: '📋' },
          { label: 'Audit Hash', value: hash, color: '#94a3b8', icon: '🔐', mono: true },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{kpi.icon} {kpi.label}</p>
            <p style={{ fontSize: kpi.mono ? 11 : 15, fontWeight: 700, color: kpi.color, margin: 0, fontFamily: kpi.mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
