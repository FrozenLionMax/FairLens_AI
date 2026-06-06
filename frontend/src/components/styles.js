// Shared styles and utility functions for FairLens components

export const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];

export const getRiskLevel = (score) => {
  if (score >= 70) return { label: 'High Risk', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', dot: '🔴' };
  if (score >= 40) return { label: 'Moderate Risk', color: '#f97316', bg: 'rgba(249,115,22,0.12)', dot: '🟡' };
  return { label: 'Safe', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', dot: '🟢' };
};

export const simpleTerm = (key) => ({
  demographic: 'Group Selection Difference',
  gender: 'Gender Fairness Gap',
  ethnicity: 'Ethnicity Fairness Gap',
  socioeconomic: 'Income Group Gap',
  age: 'Age Group Gap',
  overall: 'Overall Bias Score',
  disparate_impact_ratio: 'Fairness Ratio',
  statistical_parity_diff: 'Selection Difference',
  demographic_parity_gap: 'Group Selection Gap',
}[key] || key);

export const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg,#080e1f 0%,#0c1530 40%,#0a1228 100%)',
    fontFamily: "'DM Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#e2e8f0',
  },
  sidebar: {
    position: 'fixed', left: 0, top: 0, width: 272, height: '100vh',
    background: 'rgba(8,14,31,0.97)',
    borderRight: '1px solid rgba(99,102,241,0.2)',
    padding: '28px 20px', overflowY: 'auto', zIndex: 50,
    display: 'flex', flexDirection: 'column', gap: 28,
    backdropFilter: 'blur(20px)',
  },
  main: {
    marginLeft: 272,
    padding: '32px 36px',
    transition: 'margin-left .3s',
    maxWidth: 1440,
    boxSizing: 'border-box',
  },
  mainCollapsed: {
    marginLeft: 0,
    padding: '32px 36px',
    transition: 'margin-left .3s',
    maxWidth: 1440,
    boxSizing: 'border-box',
  },
  header: {
    background: 'rgba(8,14,31,0.85)', backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(99,102,241,0.15)',
    padding: '14px 32px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40,
  },
  card: {
    background: 'rgba(17,25,52,0.85)',
    border: '1px solid rgba(99,102,241,0.12)',
    borderRadius: 14, padding: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(99,102,241,0.05)',
    backdropFilter: 'blur(8px)',
  },
  gradCard: {
    background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(59,130,246,0.06))',
    border: '1px solid rgba(99,102,241,0.12)',
    borderRadius: 14, padding: 24,
    boxShadow: '0 4px 24px rgba(99,102,241,0.08)',
    backdropFilter: 'blur(8px)',
  },
  btn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 14px', borderRadius: 10,
    border: 'none', cursor: 'pointer',
    transition: 'all .2s', fontWeight: 500, fontSize: 14,
  },
  tag: (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 12px', borderRadius: 999,
    fontSize: 12, fontWeight: 600,
    background: color + '22', color: color, border: `1px solid ${color}44`,
  }),
  sectionTitle: {
    fontSize: 18, fontWeight: 700, color: '#f1f5f9',
    margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10,
  },
  label: { fontSize: 12, color: '#94a3b8', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '.05em' },
  bigNum: { fontSize: 36, fontWeight: 800, color: '#f1f5f9', margin: 0, lineHeight: 1 },
  divider: { height: 1, background: 'rgba(99,102,241,0.12)', margin: '24px 0' },
  pageTitle: { fontSize: 28, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' },
  h3: { fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: '0 0 16px 0' },
  primaryButton: { 
    background: 'linear-gradient(135deg,#6366f1,#3b82f6)', 
    color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontWeight: 600, transition: 'all 0.2s', padding: '10px 20px'
  },
};
