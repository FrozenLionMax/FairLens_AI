import React from 'react';
import { Menu, X, Shield, Users } from 'lucide-react';
import { S, getRiskLevel } from './styles';

const tabTitles = {
  dashboard: 'Executive Dashboard',
  upload: 'Upload Dataset',
  results: 'Bias Audit Results',
  explainability: 'Explainable AI Insights',
  analytics: 'Trends & Analytics',
  studio: 'Mitigation Studio',
  history: 'Audit History Logs',
  compare: 'Model Comparison',
  settings: 'System Settings',
};

export default function Header({ sidebarOpen, setSidebarOpen, currentTab, results, isMobile }) {
  const offsetLeft = sidebarOpen && !isMobile ? 272 : 0;

  return (
    <div style={{
      ...S.header,
      position: 'sticky', top: 0, left: 0, right: 0,
      marginLeft: offsetLeft,
      transition: 'margin-left 0.3s, padding 0.3s',
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            ...S.btn,
            background: 'rgba(99,102,241,0.12)',
            color: '#a5b4fc',
            padding: '8px 10px',
            borderRadius: 8,
            flexShrink: 0,
            cursor: 'pointer'
          }}
          title={sidebarOpen ? "Collapse Navigation" : "Expand Navigation"}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isMobile && <Shield size={18} color="#6366f1" style={{ flexShrink: 0 }} />}
          <span style={{
            fontSize: isMobile ? 16 : 20,
            fontWeight: 800,
            background: 'linear-gradient(to right,#f8fafc,#cbd5e1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            {tabTitles[currentTab] || 'FairLens AI'}
          </span>
          {!isMobile && <span style={{ ...S.tag('#6366f1'), fontSize: 10, letterSpacing: '.05em' }}>ENTERPRISE</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {results && (
          <span style={{ ...S.tag(getRiskLevel(results.bias_scores.overall).color), fontSize: 11 }}>
            {getRiskLevel(results.bias_scores.overall).dot} {getRiskLevel(results.bias_scores.overall).label}
          </span>
        )}
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 0 0 2px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Users size={16} color="#fff" />
        </div>
      </div>
    </div>
  );
}


