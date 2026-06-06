import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { S, getRiskLevel } from '../components/styles';
import { getAnalysisById } from '../api';

export default function ComparePage({ history }) {
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');
  const [leftData, setLeftData] = useState(null);
  const [rightData, setRightData] = useState(null);
  const [loadingLeft, setLoadingLeft] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);

  // Auto-select the two most recent if available and none selected
  useEffect(() => {
    if (history && history.length >= 2 && !leftId && !rightId) {
      setLeftId(history[1].analysis_id); // older one on left
      setRightId(history[0].analysis_id); // newer one on right
    }
  }, [history]);

  useEffect(() => {
    if (leftId) {
      setLoadingLeft(true);
      getAnalysisById(leftId)
        .then(data => setLeftData(data))
        .catch(err => alert("Failed to load left audit: " + err.message))
        .finally(() => setLoadingLeft(false));
    }
  }, [leftId]);

  useEffect(() => {
    if (rightId) {
      setLoadingRight(true);
      getAnalysisById(rightId)
        .then(data => setRightData(data))
        .catch(err => alert("Failed to load right audit: " + err.message))
        .finally(() => setLoadingRight(false));
    }
  }, [rightId]);

  if (!history || history.length < 2) {
    return (
      <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
        <p style={{ fontSize: 48, margin: '0 0 16px' }}>⚖️</p>
        <h3 style={{ color: '#f1f5f9', fontSize: 20, margin: '0 0 8px' }}>Not enough audits to compare</h3>
        <p style={{ color: '#94a3b8' }}>You need at least two audits in your history to run a side-by-side comparison.</p>
      </div>
    );
  }

  const renderDropdown = (value, onChange, label) => (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'rgba(15,23,42,0.6)', color: '#e2e8f0',
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none'
        }}
      >
        <option value="" disabled>Select an audit...</option>
        {history.map((h, i) => (
          <option key={i} value={h.analysis_id}>
            {h.filename} ({new Date(h.timestamp).toLocaleDateString()}) - FL-{h.analysis_id.slice(-6).toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );

  const renderMetric = (label, leftVal, rightVal, betterIsLower = true) => {
    const diff = rightVal - leftVal;
    let color = '#94a3b8';
    let icon = '—';
    if (diff !== 0) {
      const improved = betterIsLower ? diff < 0 : diff > 0;
      color = improved ? '#22c55e' : '#ef4444';
      icon = improved ? (betterIsLower ? '↓' : '↑') : (betterIsLower ? '↑' : '↓');
    }

    return (
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0' }}>
        <div style={{ flex: 1, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ flex: 1, textAlign: 'center', color: '#e2e8f0', fontWeight: 700 }}>
          {typeof leftVal === 'number' ? leftVal.toFixed(1) : leftVal}
        </div>
        <div style={{ flex: 1, textAlign: 'center', color: '#e2e8f0', fontWeight: 700 }}>
          {typeof rightVal === 'number' ? rightVal.toFixed(1) : rightVal}
        </div>
        <div style={{ flex: 0.5, textAlign: 'right', color, fontWeight: 800 }}>
          {diff !== 0 ? `${icon} ${Math.abs(diff).toFixed(1)}` : '—'}
        </div>
      </div>
    );
  };

  const getCols = (data) => data?.bias_scores?.column_bias || [];
  const getColScore = (cols, name) => cols.find(c => (c.attribute || c.column) === name)?.bias_score || 0;
  
  // Get unique columns from both sides
  const allCols = new Set();
  getCols(leftData).forEach(c => allCols.add(c.attribute || c.column));
  getCols(rightData).forEach(c => allCols.add(c.attribute || c.column));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ ...S.card, marginBottom: 20, display: 'flex', gap: 20, alignItems: 'flex-end' }}>
        {renderDropdown(leftId, setLeftId, 'Baseline Audit (Left)')}
        <div style={{ paddingBottom: 10, color: '#6366f1', fontWeight: 800 }}>VS</div>
        {renderDropdown(rightId, setRightId, 'Comparison Audit (Right)')}
      </div>

      {(loadingLeft || loadingRight) && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading analysis data...</div>
      )}

      {leftData && rightData && !loadingLeft && !loadingRight && (() => {
        // Calculate Verdict
        const leftOverall = leftData.bias_scores?.overall || 0;
        const rightOverall = rightData.bias_scores?.overall || 0;
        const overallDiff = rightOverall - leftOverall;
        
        let bestCol = null;
        let bestDiff = 0;
        Array.from(allCols).forEach(colName => {
          const lScore = getColScore(getCols(leftData), colName);
          const rScore = getColScore(getCols(rightData), colName);
          const diff = rScore - lScore; // negative is good (reduced bias)
          if (diff < bestDiff) {
            bestDiff = diff;
            bestCol = colName;
          }
        });

        const isBetter = overallDiff < 0;
        const isWorse = overallDiff > 0;
        const isEqual = overallDiff === 0;

        let verdictTitle = "⚖️ No Change Detected";
        let verdictColor = "#94a3b8"; // gray
        let verdictBg = "rgba(148, 163, 184, 0.1)";
        let verdictText = "Both audits have the identical overall bias score.";

        if (isBetter) {
          verdictTitle = "✅ Mitigation Success";
          verdictColor = "#22c55e"; // green
          verdictBg = "rgba(34, 197, 94, 0.1)";
          verdictText = `The comparison audit is better! Overall bias was reduced by ${Math.abs(overallDiff).toFixed(1)}%.`;
          if (bestCol) {
            verdictText += ` The most improved factor was "${bestCol.charAt(0).toUpperCase() + bestCol.slice(1)}", dropping by ${Math.abs(bestDiff).toFixed(1)}%.`;
          }
        } else if (isWorse) {
          verdictTitle = "⚠️ Regression Warning";
          verdictColor = "#ef4444"; // red
          verdictBg = "rgba(239, 68, 68, 0.1)";
          verdictText = `The comparison audit is worse. Overall bias increased by ${Math.abs(overallDiff).toFixed(1)}%.`;
        }

        return (
          <>
            <div style={{
              background: verdictBg, border: `1px solid ${verdictColor}40`,
              borderRadius: 12, padding: '16px 20px', marginBottom: 20,
              display: 'flex', flexDirection: 'column', gap: 6
            }}>
              <h3 style={{ color: verdictColor, fontSize: 16, fontWeight: 700, margin: 0 }}>{verdictTitle}</h3>
              <p style={{ color: '#e2e8f0', fontSize: 14, margin: 0, lineHeight: 1.5 }}>{verdictText}</p>
            </div>

            <div style={{ ...S.card }}>
              <h3 style={{ ...S.sectionTitle, marginBottom: 24 }}>⚖️ Executive Comparison</h3>
          
          {/* Header Row */}
          <div style={{ display: 'flex', paddingBottom: 12, borderBottom: '2px solid rgba(99,102,241,0.2)', marginBottom: 8 }}>
            <div style={{ flex: 1, textTransform: 'uppercase', fontSize: 11, color: '#64748b', fontWeight: 700 }}>Metric</div>
            <div style={{ flex: 1, textAlign: 'center', textTransform: 'uppercase', fontSize: 11, color: '#a5b4fc', fontWeight: 700 }}>Baseline</div>
            <div style={{ flex: 1, textAlign: 'center', textTransform: 'uppercase', fontSize: 11, color: '#a5b4fc', fontWeight: 700 }}>Comparison</div>
            <div style={{ flex: 0.5, textAlign: 'right', textTransform: 'uppercase', fontSize: 11, color: '#64748b', fontWeight: 700 }}>Change</div>
          </div>

          {/* High Level Metrics */}
          {renderMetric('Overall Bias Score (%)', leftData.bias_scores?.overall || 0, rightData.bias_scores?.overall || 0, true)}
          {renderMetric('Disparate Impact Ratio', leftData.bias_scores?.disparate_impact_ratio || 0, rightData.bias_scores?.disparate_impact_ratio || 0, false)}
          {renderMetric('Statistical Parity Diff', Math.abs(leftData.bias_scores?.statistical_parity_diff || 0), Math.abs(rightData.bias_scores?.statistical_parity_diff || 0), true)}

          <h3 style={{ ...S.sectionTitle, marginTop: 40, marginBottom: 24 }}>📊 Column-Level Bias Comparison</h3>
          
          <div style={{ display: 'flex', paddingBottom: 12, borderBottom: '2px solid rgba(99,102,241,0.2)', marginBottom: 8 }}>
            <div style={{ flex: 1, textTransform: 'uppercase', fontSize: 11, color: '#64748b', fontWeight: 700 }}>Protected Attribute</div>
            <div style={{ flex: 1, textAlign: 'center', textTransform: 'uppercase', fontSize: 11, color: '#a5b4fc', fontWeight: 700 }}>Baseline</div>
            <div style={{ flex: 1, textAlign: 'center', textTransform: 'uppercase', fontSize: 11, color: '#a5b4fc', fontWeight: 700 }}>Comparison</div>
            <div style={{ flex: 0.5, textAlign: 'right', textTransform: 'uppercase', fontSize: 11, color: '#64748b', fontWeight: 700 }}>Change</div>
          </div>

          {Array.from(allCols).map(colName => {
            const lScore = getColScore(getCols(leftData), colName);
            const rScore = getColScore(getCols(rightData), colName);
            return renderMetric(colName.charAt(0).toUpperCase() + colName.slice(1), lScore, rScore, true);
          })}
        </div>
        </>
        );
      })()}
    </motion.div>
  );
}
