import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { S, getRiskLevel } from '../components/styles';
import { runInteractiveMitigation, exportMitigatedCsv } from '../api';
import { Download } from 'lucide-react';

export default function MitigationStudioPage({ results, setResults }) {
  const [loading, setLoading] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState('');
  
  if (!results) {
    return (
      <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Run an audit first to use the Mitigation Studio.</p>
      </div>
    );
  }

  const overallBias = results.bias_scores?.overall || 0;
  const originalFairness = results.bias_scores?.original?.score ?? Math.max(0, 100 - overallBias);
  const currentMitigatedFairness = results.bias_scores?.mitigated?.score ?? originalFairness;
  const detectedProxy = results.bias_scores?.proxy_detected?.feature || 'None';
  
  const columns = results.bias_scores?.column_bias || [];
  const worstColumn = columns.length > 0 ? columns.reduce((prev, current) => (prev.score > current.score) ? prev : current) : null;

  const handleRun = async () => {
    if (!selectedProxy) {
      alert("Please select a proxy feature to exclude.");
      return;
    }
    
    setLoading(true);
    try {
      const newData = await runInteractiveMitigation(results.analysis_id, selectedProxy);
      setResults(newData);
    } catch (err) {
      alert("Mitigation failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={S.pageTitle}>Interactive Mitigation Studio</h2>
      
      {/* Easy Language Info Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ fontSize: 24, marginTop: 2 }}>💡</div>
        <div>
          <h4 style={{ color: '#e0e7ff', margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>What does Mitigation do?</h4>
          <p style={{ color: '#93c5fd', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            Sometimes, an AI uses a seemingly harmless column (like "ZIP Code" or "Income") to secretly guess a protected trait like Race or Gender. This is called a <strong>Proxy Variable</strong>. <br/>
            This tool lets you test "dropping" (ignoring) different columns to see if the AI becomes fairer without them!
          </p>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ ...S.card, textAlign: 'center' }}>
          <h3 style={S.h3}>Original Fairness Score</h3>
          <div style={{ 
            fontSize: 64, 
            fontWeight: 800, 
            color: getRiskLevel(100 - originalFairness).color,
            margin: '20px 0'
          }}>
            {originalFairness}%
          </div>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Before Any Mitigation</p>
          <div style={{ marginTop: 16, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <p style={{ color: '#cbd5e1', fontSize: 13, margin: 0 }}>
              The baseline fairness of the dataset. A lower score indicates significant algorithmic bias against protected groups.
            </p>
          </div>
        </div>

        <div style={{ ...S.card, textAlign: 'center', border: '1px solid #3b82f6', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #3b82f6)' }} />
          <h3 style={S.h3}>Current Mitigated Score</h3>
          <motion.div 
            key={currentMitigatedFairness + detectedProxy}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              fontSize: 64, 
              fontWeight: 800, 
              color: getRiskLevel(100 - currentMitigatedFairness).color,
              margin: '20px 0'
            }}
          >
            {loading ? '...' : `${currentMitigatedFairness}%`}
          </motion.div>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>After Dropping <strong>{detectedProxy}</strong></p>
          
          <div style={{ marginTop: 16, padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <p style={{ color: '#93c5fd', fontSize: 13, margin: 0, fontWeight: 500 }}>
              {currentMitigatedFairness >= 80 
                ? `✨ Excellent! Removing this proxy boosts fairness by ${currentMitigatedFairness - originalFairness}%. This model is highly recommended for production.`
                : currentMitigatedFairness >= 60 
                ? `⚠️ Moderate improvement. Removing this proxy helps, but the model still carries bias risk.`
                : `❌ Poor result. Removing this proxy did not resolve the underlying bias in the dataset.`}
            </p>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <h3 style={S.h3}>What-If Analysis Configuration</h3>
        
        {worstColumn && (
          <div style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, marginBottom: 20 }}>
            <p style={{ margin: 0, color: '#fca5a5', fontSize: 14 }}>
              <strong>🔥 Action Required:</strong> The <strong>{worstColumn.column}</strong> column is exhibiting the highest bias (Bias Score: {worstColumn.score}/100). We strongly recommend dropping this feature.
            </p>
          </div>
        )}

        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
          The AI automatically detected <strong>{detectedProxy}</strong> as the highest risk proxy. 
          Select a different column to drop below and click Run to recalculate weights.
        </p>
        
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#f8fafc', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Proxy Feature to Drop
            </label>
            <select 
              value={selectedProxy}
              onChange={(e) => setSelectedProxy(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: 'white',
                fontSize: 16
              }}
            >
              <option value="">-- Select a column --</option>
              {columns.map(c => {
                const colName = c.attribute || c.column;
                return <option key={colName} value={colName.toLowerCase()}>{colName}</option>;
              })}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={handleRun}
              disabled={loading || !selectedProxy || selectedProxy === detectedProxy.toLowerCase()}
              style={{ ...S.primaryButton, padding: '12px 24px', opacity: (loading || !selectedProxy || selectedProxy === detectedProxy.toLowerCase()) ? 0.5 : 1 }}
            >
              {loading ? 'Recalculating...' : 'Run Mitigation'}
            </button>
            <button
              onClick={() => {
                if (!selectedProxy) return;
                exportMitigatedCsv(results.analysis_id, selectedProxy).catch(err => alert("Download failed: " + err.message));
              }}
              disabled={loading || !selectedProxy}
              style={{
                background: 'transparent',
                border: '1px solid rgba(99,102,241,0.5)',
                color: '#818cf8',
                borderRadius: 8,
                padding: '12px 20px',
                fontWeight: 600,
                cursor: (loading || !selectedProxy) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: (loading || !selectedProxy) ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              <Download size={16} /> Clean CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
