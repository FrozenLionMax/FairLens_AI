import React from 'react';
import { motion } from 'framer-motion';
import { S, getRiskLevel } from './styles';

export default function BeginnerExplainer({ results }) {
  const overall = results.bias_scores?.overall || 0;
  const columnBias = results.bias_scores?.column_bias || [];
  const outcomeCol = results.bias_scores?.outcome_column || 'outcome';
  const overallRisk = getRiskLevel(overall);

  // Sort columns by bias score (highest first)
  const sorted = [...columnBias]
    .filter(c => c.bias_score != null)
    .sort((a, b) => (b.bias_score || 0) - (a.bias_score || 0));

  const worst = sorted[0];
  const safest = sorted[sorted.length - 1];
  const highRiskCount = sorted.filter(c => c.bias_score >= 70).length;
  const moderateCount = sorted.filter(c => c.bias_score >= 40 && c.bias_score < 70).length;
  const safeCount = sorted.filter(c => c.bias_score < 40).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(59,130,246,0.04))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 16, padding: 0, marginBottom: 28, overflow: 'hidden',
      }}>

      {/* Header */}
      <div style={{ padding: '24px 28px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.2))',
          padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 22 }}>🔬</span>
        </div>
        <div>
          <h3 style={{ ...S.sectionTitle, margin: 0, fontSize: 18 }}>Bias Breakdown — Plain English</h3>
          <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>
            Here's exactly what we found in your dataset, column by column.
          </p>
        </div>
      </div>

      {/* Main Insight */}
      <div style={{ padding: '0 28px 20px' }}>
        <div style={{
          background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 12, padding: '18px 22px', marginBottom: 16,
        }}>
          <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            We analyzed decisions in the <strong style={{ color: '#a5b4fc' }}>"{outcomeCol}"</strong> column
            across <strong style={{ color: '#e2e8f0' }}>{results.dataset_stats?.total_rows?.toLocaleString() || '—'} records</strong>.
            {worst ? (
              <>
                {' '}The <strong style={{ color: '#f87171' }}>most biased factor</strong> is{' '}
                <strong style={{ color: '#fbbf24' }}>"{worst.attribute || worst.column}"</strong>{' '}
                with a bias score of <strong style={{ color: worst.bias_score >= 70 ? '#ef4444' : worst.bias_score >= 40 ? '#f97316' : '#22c55e' }}>
                  {Math.round(worst.bias_score)}%
                </strong>.
                {worst.highest_selection_group && worst.lowest_selection_group && (
                  <> The group <strong style={{ color: '#4ade80' }}>"{worst.highest_selection_group}"</strong> is being
                  favored over <strong style={{ color: '#f87171' }}>"{worst.lowest_selection_group}"</strong>.</>
                )}
              </>
            ) : (
              <> No significant column-level bias was detected.</>
            )}
          </p>
        </div>

        {/* Column Bias Table */}
        {sorted.length > 0 && (
          <div style={{
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
            overflow: 'hidden', marginBottom: 16,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Factor</th>
                  <th style={thStyle}>Bias Level</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Most Favored</th>
                  <th style={thStyle}>Least Favored</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((col, i) => {
                  const risk = getRiskLevel(col.bias_score || 0);
                  const isWorst = i === 0;
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        background: isWorst
                          ? 'rgba(239,68,68,0.06)'
                          : i % 2 === 0 ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.2)',
                        borderLeft: isWorst ? '3px solid #ef4444' : '3px solid transparent',
                      }}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isWorst && <span style={{ fontSize: 12 }}>⚠️</span>}
                          <span style={{ color: isWorst ? '#fbbf24' : '#e2e8f0', fontWeight: isWorst ? 700 : 500 }}>
                            {(col.attribute || col.column || '').charAt(0).toUpperCase() + (col.attribute || col.column || '').slice(1)}
                          </span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: risk.bg, color: risk.color, border: `1px solid ${risk.color}33`,
                        }}>
                          {risk.dot} {risk.label}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(col.bias_score || 0, 100)}%` }}
                              transition={{ delay: i * 0.06 + 0.2, duration: 0.5 }}
                              style={{ height: '100%', background: risk.color, borderRadius: 3 }}
                            />
                          </div>
                          <span style={{ color: risk.color, fontWeight: 800, fontSize: 14, fontFamily: "'DM Mono', monospace", minWidth: 36 }}>
                            {Math.round(col.bias_score || 0)}%
                          </span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 600 }}>
                          {col.highest_selection_group || '—'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                          {col.lowest_selection_group || '—'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Tags */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 10, padding: '14px 18px',
          background: 'rgba(0,0,0,0.15)', borderRadius: 10,
        }}>
          <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            📋 Summary:
          </span>
          <span style={{ ...S.tag('#6366f1') }}>
            {results.dataset_stats?.total_rows?.toLocaleString() || '—'} records scanned
          </span>
          <span style={{ ...S.tag('#6366f1') }}>
            {sorted.length} factor{sorted.length !== 1 ? 's' : ''} analyzed
          </span>
          {highRiskCount > 0 && (
            <span style={{ ...S.tag('#ef4444') }}>
              🔴 {highRiskCount} high-risk
            </span>
          )}
          {moderateCount > 0 && (
            <span style={{ ...S.tag('#f97316') }}>
              🟡 {moderateCount} moderate
            </span>
          )}
          {safeCount > 0 && (
            <span style={{ ...S.tag('#22c55e') }}>
              🟢 {safeCount} safe
            </span>
          )}
          <span style={{ ...S.tag(overallRisk.color) }}>
            Overall: {Math.round(overall)}% bias
          </span>
        </div>
      </div>
    </motion.div>
  );
}

const thStyle = {
  background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
  padding: '10px 14px', textAlign: 'left', fontWeight: 700,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 14px',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
  fontSize: 13,
};
