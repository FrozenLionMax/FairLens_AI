import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { S } from '../components/styles';

const SETTINGS_KEY = 'fairlens_settings';

const DEFAULT_SETTINGS = {
  sensitivity: 'High (Strict)',
  eeocThreshold: 'Standard (0.80)',
  exportFormat: 'PDF Report',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [toast, setToast] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const fields = [
    { key: 'sensitivity', label: 'Analysis Sensitivity', options: ['High (Strict)', 'Medium (Balanced)', 'Low (Lenient)'] },
    { key: 'eeocThreshold', label: 'EEOC Threshold Override', options: ['Standard (0.80)', 'Strict (0.85)', 'Custom'] },
    { key: 'exportFormat', label: 'Default Export Format', options: ['PDF Report', 'JSON Data'] },
  ];

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: 0 }}>Settings</h2>
        {fields.map((field) => (
          <div key={field.key}>
            <label style={{ display: 'block', color: '#94a3b8', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{field.label}</label>
            <select
              value={settings[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              style={{ width: '100%', background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}
            >
              {field.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <button
          onClick={handleSave}
          style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: '#fff', fontWeight: 700, padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', fontSize: 15 }}
        >
          Save Settings
        </button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ✅ Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
