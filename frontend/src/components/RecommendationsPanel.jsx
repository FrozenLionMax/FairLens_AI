import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { S } from './styles';

export default function RecommendationsPanel({ recommendations }) {
  const apiRecs = recommendations || [];
  
  // If API provided no recommendations, show a fallback
  if (apiRecs.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, marginBottom: 28 }}>
        <h3 style={S.sectionTitle}><FileText size={18} color="#22c55e" /> Actionable Recommendations</h3>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>No specific recommendations generated for this dataset.</p>
      </motion.div>
    );
  }

  const enhanced = apiRecs.slice(0, 6);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, marginBottom: 28 }}>
      <h3 style={S.sectionTitle}><FileText size={18} color="#22c55e" /> Actionable Recommendations</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {enhanced.map((rec, i) => {
          const color = rec.severity === 'high' ? '#ef4444' : rec.severity === 'medium' ? '#f97316' : '#22c55e';
          const priority = rec.severity === 'high' ? 'URGENT' : rec.severity === 'medium' ? 'IMPORTANT' : 'ROUTINE';
          return (
            <motion.div key={i} whileHover={{ x: 4 }} style={{ borderLeft: `4px solid ${color}`, background: `${color}09`, padding: '14px 18px', borderRadius: '0 10px 10px 0', cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ ...S.tag(color), fontSize: 10 }}>{priority}</span>
                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, margin: 0 }}>{rec.action}</p>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{rec.details}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
