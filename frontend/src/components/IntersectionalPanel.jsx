import React from 'react';
import { motion } from 'framer-motion';
import { S, getRiskLevel } from './styles';

export default function IntersectionalPanel({ results }) {
  const intersections = results?.bias_scores?.intersectional_bias || [];
  
  if (intersections.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, marginBottom: 28, border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(135deg, rgba(17,25,52,0.95), rgba(139,92,246,0.05))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '8px', borderRadius: 8 }}>
          <span style={{ fontSize: 20 }}>🧬</span>
        </div>
        <h3 style={{ ...S.sectionTitle, margin: 0 }}>Intersectional Bias Analysis</h3>
      </div>
      
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Traditional AI audits look at one trait at a time (e.g., just Gender). However, bias is often hidden at the <strong>intersection</strong> of multiple traits. Here are the highest risk combined groups we detected in your model:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {intersections.map((item, i) => {
          const risk = getRiskLevel(item.score);
          return (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.02 }}
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                border: `1px solid ${risk.color}44`, 
                borderRadius: 12, 
                padding: 20,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: risk.color }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px', fontWeight: 600 }}>Intersecting Features</p>
                  <h4 style={{ color: '#e2e8f0', fontSize: 15, margin: 0, fontWeight: 700 }}>{item.features}</h4>
                </div>
                <span style={{ ...S.tag(risk.color), fontSize: 12, padding: '4px 10px' }}>{item.score}% Bias</span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <p style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, margin: '0 0 2px' }}>✓ MOST FAVORED</p>
                    <p style={{ color: '#e2e8f0', fontSize: 13, margin: 0, fontWeight: 600 }}>{item.highest_selection_group}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#4ade80', fontSize: 20, fontWeight: 800, margin: 0 }}>{item.highest_rate}%</p>
                  </div>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, margin: '0 0 2px' }}>✕ LEAST FAVORED</p>
                    <p style={{ color: '#e2e8f0', fontSize: 13, margin: 0, fontWeight: 600 }}>{item.lowest_selection_group}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#f87171', fontSize: 20, fontWeight: 800, margin: 0 }}>{item.lowest_rate}%</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
                  The most favored group is selected <strong>{Math.round(item.highest_rate / item.lowest_rate)}x</strong> more often than the least favored group.
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
