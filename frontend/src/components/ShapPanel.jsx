import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { S } from './styles';

const POSITIVE_COLOR = '#22c55e';
const NEGATIVE_COLOR = '#ef4444';
const NEUTRAL_COLOR = '#6366f1';

export default function ShapPanel({ results }) {
  const shapData = results?.bias_scores?.shap_values || [];
  const [showInfo, setShowInfo] = useState(false);
  
  if (shapData.length === 0) return null;

  const maxImpact = Math.max(...shapData.map(d => d.impact));
  const positiveCount = shapData.filter(d => d.direction === 'positive').length;
  const negativeCount = shapData.filter(d => d.direction === 'negative').length;
  const topFeature = shapData[0];
  const topNegative = shapData.find(d => d.direction === 'negative');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      style={{ 
        ...S.card, 
        marginBottom: 28, 
        border: '1px solid rgba(59, 130, 246, 0.25)', 
        background: 'linear-gradient(135deg, rgba(17,25,52,0.95), rgba(59,130,246,0.04))',
        padding: 0,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.25))', 
              padding: 10, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: 22 }}>🧠</span>
            </div>
            <div>
              <h3 style={{ ...S.sectionTitle, margin: 0, fontSize: 20 }}>SHAP Explainability</h3>
              <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0', fontWeight: 500 }}>Powered by SHapley Additive exPlanations</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInfo(!showInfo)}
            style={{ 
              background: showInfo ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(59,130,246,0.3)', 
              borderRadius: 8, padding: '6px 14px', 
              color: '#93c5fd', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {showInfo ? '✕ Close' : 'ℹ️ What is SHAP?'}
          </motion.button>
        </div>

        {/* Expandable Info */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ 
                background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', 
                borderRadius: 10, padding: 18, margin: '16px 0 0', lineHeight: 1.7 
              }}>
                <p style={{ color: '#cbd5e1', fontSize: 13, margin: '0 0 8px' }}>
                  <strong style={{ color: '#93c5fd' }}>SHAP</strong> is a Nobel Prize–winning game theory technique adapted for machine learning. 
                  It answers a simple question: <em>"How much did each feature contribute to the AI's final decision?"</em>
                </p>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 8px' }}>
                  Think of it like splitting a restaurant bill fairly — SHAP assigns each feature its fair share of the AI's prediction, 
                  so you can see exactly what pushed the model to approve or reject a candidate.
                </p>
                <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, fontStyle: 'italic' }}>
                  📚 Based on: Lundberg & Lee, "A Unified Approach to Interpreting Model Predictions" (NeurIPS 2017)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats Row */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, 
        margin: '20px 28px', borderRadius: 10, overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)'
      }}>
        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '14px 18px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Features Analyzed</p>
          <p style={{ color: '#e2e8f0', fontSize: 24, fontWeight: 800, margin: 0 }}>{shapData.length}</p>
        </div>
        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '14px 18px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Positive Drivers</p>
          <p style={{ color: POSITIVE_COLOR, fontSize: 24, fontWeight: 800, margin: 0 }}>{positiveCount}</p>
        </div>
        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '14px 18px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Negative Drivers</p>
          <p style={{ color: NEGATIVE_COLOR, fontSize: 24, fontWeight: 800, margin: 0 }}>{negativeCount}</p>
        </div>
      </div>

      {/* Custom Waterfall Chart */}
      <div style={{ padding: '0 28px 24px' }}>
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: 12, padding: '20px 24px' 
        }}>
          {shapData.map((d, i) => {
            const barWidth = maxImpact > 0 ? (d.impact / maxImpact) * 100 : 0;
            const barColor = d.direction === 'positive' ? POSITIVE_COLOR : NEGATIVE_COLOR;
            const isTop = i === 0;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{ 
                  display: 'grid', gridTemplateColumns: '140px 1fr 80px', 
                  alignItems: 'center', gap: 16,
                  padding: '10px 0',
                  borderBottom: i < shapData.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'
                }}
              >
                {/* Feature Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isTop && <span style={{ fontSize: 14 }}>👑</span>}
                  <span style={{ 
                    color: isTop ? '#f8fafc' : '#cbd5e1', 
                    fontSize: 13, fontWeight: isTop ? 700 : 500,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {d.feature}
                  </span>
                </div>

                {/* Bar */}
                <div style={{ position: 'relative', height: 28, background: 'rgba(255,255,255,0.03)', borderRadius: 6, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${barColor}44, ${barColor}aa)`,
                      borderRadius: 6,
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute', right: 0, top: 0, bottom: 0, width: 3,
                      background: barColor, borderRadius: '0 6px 6px 0'
                    }} />
                  </motion.div>
                </div>

                {/* Value + Direction */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{ 
                    color: barColor, fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace" 
                  }}>
                    {d.impact.toFixed(3)}
                  </span>
                  <span style={{ 
                    fontSize: 10, 
                    color: d.direction === 'positive' ? '#4ade80' : '#f87171',
                  }}>
                    {d.direction === 'positive' ? '▲' : '▼'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 24, marginTop: 12, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: `linear-gradient(135deg, ${POSITIVE_COLOR}66, ${POSITIVE_COLOR})` }} />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>Increases approval chance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: `linear-gradient(135deg, ${NEGATIVE_COLOR}66, ${NEGATIVE_COLOR})` }} />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>Decreases approval chance</span>
          </div>
        </div>
      </div>

      {/* Insights Footer */}
      <div style={{ 
        background: 'rgba(15,23,42,0.7)', borderTop: '1px solid rgba(255,255,255,0.05)', 
        padding: '20px 28px', 
        display: 'grid', gridTemplateColumns: topNegative ? '1fr 1fr' : '1fr', gap: 16
      }}>
        {topFeature && (
          <div style={{ 
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', 
            borderRadius: 10, padding: 16 
          }}>
            <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👑 Strongest Driver
            </p>
            <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>
              {topFeature.feature}
            </p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
              This feature has the highest influence on the AI's decisions. 
              It pushes outcomes in a <strong style={{ color: topFeature.direction === 'positive' ? '#4ade80' : '#f87171' }}>{topFeature.direction}</strong> direction 
              with an impact weight of <strong>{topFeature.impact.toFixed(3)}</strong>.
            </p>
          </div>
        )}

        {topNegative && (
          <div style={{ 
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', 
            borderRadius: 10, padding: 16 
          }}>
            <p style={{ color: '#f87171', fontSize: 11, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚠️ Top Risk Factor
            </p>
            <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>
              {topNegative.feature}
            </p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
              This feature actively pushes the AI toward rejecting candidates. 
              If it correlates with a protected attribute, this may indicate an unfair model.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
