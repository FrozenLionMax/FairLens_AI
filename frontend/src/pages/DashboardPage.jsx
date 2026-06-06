import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Eye, Shield, ArrowRight } from 'lucide-react';
import { S } from '../components/styles';

export default function DashboardPage({ setTab, results, history }) {
  const auditCount = history ? history.length : (results ? 1 : 0);
  const fairnessScore = results?.bias_scores?.overall ? (100 - results.bias_scores.overall) : null;

  const stats = results ? [
    { label: 'Datasets Analyzed', value: auditCount.toString(), icon: '📊', color: '#6366f1' },
    { label: 'Bias Cases Found', value: results.bias_scores?.overall >= 40 ? '1' : '0', icon: '⚠️', color: '#f97316' },
    { label: 'Fairness Score', value: fairnessScore !== null ? `${fairnessScore.toFixed(0)}%` : '—', icon: '✅', color: '#22c55e' },
    { label: 'EEOC Compliance', value: results.bias_scores?.disparate_impact_ratio >= 0.80 ? 'Pass' : 'Fail', icon: '🔒', color: results.bias_scores?.disparate_impact_ratio >= 0.80 ? '#22c55e' : '#ef4444' },
  ] : [
    { label: 'Datasets Analyzed', value: '—', icon: '📊', color: '#6366f1' },
    { label: 'Bias Cases Found', value: '—', icon: '⚠️', color: '#f97316' },
    { label: 'Fairness Score', value: '—', icon: '✅', color: '#22c55e' },
    { label: 'EEOC Compliance', value: '—', icon: '🔒', color: '#06b6d4' },
  ];

  const steps = [
    { num: '01', label: 'Upload Dataset', desc: 'CSV, JSON, or Excel with hiring, loan, or scholarship data', icon: '📁', color: '#6366f1' },
    { num: '02', label: 'AI Analysis', desc: 'ML algorithms detect bias patterns and proxy features', icon: '🤖', color: '#8b5cf6' },
    { num: '03', label: 'EEOC Check', desc: 'Automated compliance against federal fairness standards', icon: '🏛️', color: '#3b82f6' },
    { num: '04', label: 'Get Report', desc: 'Actionable insights and certified audit report', icon: '📋', color: '#06b6d4' },
  ];

  return (
    <>
      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.gradCard, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative gradient orb */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Shield size={20} color="#6366f1" />
              <span style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>AI Fairness Platform</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px', lineHeight: 1.2 }}>Welcome to FairLens AI</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
              Enterprise-grade bias detection for hiring, loans, scholarships, and any automated decision system. Fully EEOC compliant.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(99,102,241,0.1)' }}>
              <p style={{ color: '#a5b4fc', fontSize: 13, margin: 0, lineHeight: 1.7 }}>
                💡 <strong>Simply put:</strong> FairLens checks if your AI treats everyone fairly — regardless of gender, age, or ethnicity.
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab('upload')}
            style={{
              background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
              color: '#fff', fontWeight: 700, padding: '14px 28px',
              borderRadius: 12, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 15, boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
              flexShrink: 0,
            }}
          >
            <Upload size={18} /> Start Audit <ArrowRight size={16} style={{ opacity: 0.7 }} />
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            style={{
              ...S.card,
              borderTop: `3px solid ${stat.color}`,
              cursor: 'default',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <p style={{ fontSize: 22, margin: '0 0 8px' }}>{stat.icon}</p>
            <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, margin: '0 0 4px' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontSize: 28, fontWeight: 900, margin: 0 }}>{stat.value}</p>
            {!results && stat.value === '—' && (
              <p style={{ color: '#475569', fontSize: 11, margin: '6px 0 0' }}>Upload a dataset to see stats</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...S.card }}>
        <h3 style={{ ...S.sectionTitle, marginBottom: 16 }}>
          <Eye size={18} color="#6366f1" /> How FairLens Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          {steps.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2, borderColor: item.color + '44' }}
              style={{
                background: 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(99,102,241,0.1)',
                borderRadius: 12, padding: 18,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{
                  color: item.color, fontSize: 10, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '.1em',
                  background: item.color + '15', padding: '2px 8px', borderRadius: 4,
                }}>Step {item.num}</span>
              </div>
              <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>{item.label}</p>
              <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
