import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Home, Activity, Clock, Settings, TrendingUp, SlidersHorizontal, BrainCircuit
} from 'lucide-react';
import { S, getRiskLevel } from './styles';

export default function Sidebar({ tab, setTab, results, sidebarOpen }) {
  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          initial={{ x: -272 }}
          animate={{ x: 0 }}
          exit={{ x: -272 }}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
          style={{
            ...S.sidebar,
            width: 272,
            maxWidth: '85vw',
            boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 4 }}>
            {/* Custom Logo Mark */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #3b82f6 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                {/* Outer lens ring */}
                <circle cx="13" cy="13" r="11" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" fill="none" />
                <circle cx="13" cy="13" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
                {/* Balance scale */}
                <line x1="13" y1="5.5" x2="13" y2="17" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="7.5" y1="9" x2="18.5" y2="9" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                {/* Scale pans */}
                <path d="M6 9 L7.5 9 L6.5 12.5 C6.5 13.2 7.3 13.5 7.5 13.5 C7.7 13.5 8.5 13.2 8.5 12.5 L7.5 9" fill="rgba(255,255,255,0.85)" />
                <path d="M18 9 L19.5 9 L18.5 12.5 C18.5 13.2 19.3 13.5 19.5 13.5 C19.7 13.5 20.5 13.2 20.5 12.5 L19.5 9" fill="rgba(255,255,255,0.85)" />
                {/* Base */}
                <line x1="10" y1="17" x2="16" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                {/* Lens crosshair dots */}
                <circle cx="13" cy="13" r="1.2" fill="rgba(255,255,255,0.6)" />
              </svg>
            </div>
            {/* Brand Text */}
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                <span style={{ background: 'linear-gradient(135deg, #f1f5f9, #c7d2fe)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>Fair</span><span style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>Lens</span>
                <span style={{ color: '#3b82f6', fontSize: 14, fontWeight: 700, marginLeft: 4 }}>AI</span>
              </h1>
              <p style={{ color: '#475569', fontSize: 10, margin: '2px 0 0', fontWeight: 600, letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                Bias Audit Platform
                <span style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: '#fff', fontSize: 8, padding: '1px 6px', borderRadius: 3, fontWeight: 800, letterSpacing: '.06em' }}>v2.0</span>
              </p>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'upload', label: 'Upload Dataset', icon: Upload },
              { id: 'results', label: 'Audit Results', icon: Activity, disabled: !results },
              { id: 'explainability', label: 'Explainable AI', icon: BrainCircuit, disabled: !results },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp, disabled: !results },
              { id: 'studio', label: 'Mitigation Studio', icon: SlidersHorizontal, disabled: !results },
              { id: 'history', label: 'Audit History', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(item => (
              <button key={item.id} onClick={() => !item.disabled && setTab(item.id)} disabled={item.disabled}
                style={{ ...S.btn, background: tab === item.id ? 'rgba(99,102,241,0.2)' : 'transparent', color: tab === item.id ? '#a5b4fc' : '#64748b', borderLeft: tab === item.id ? '3px solid #6366f1' : '3px solid transparent', opacity: item.disabled ? 0.4 : 1, cursor: item.disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}>
                <item.icon size={18} /><span>{item.label}</span>
              </button>
            ))}
          </nav>
          {results && (
            <div style={{ marginTop: 'auto', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' }}>
              <p style={{ color: '#94a3b8', fontSize: 11, margin: '0 0 6px', textTransform: 'uppercase' }}>Last Audit</p>
              <p style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{results.filename}</p>
              <p style={{ ...S.tag(getRiskLevel(results.bias_scores.overall).color), marginTop: 8, fontSize: 11 }}>{getRiskLevel(results.bias_scores.overall).label}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


