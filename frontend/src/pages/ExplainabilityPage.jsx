import React from 'react';
import { motion } from 'framer-motion';
import { S } from '../components/styles';
import ShapPanel from '../components/ShapPanel';
import IntersectionalPanel from '../components/IntersectionalPanel';
import ColumnBiasPanel from '../components/ColumnBiasPanel';
import WhyBiasExists from '../components/WhyBiasExists';

export default function ExplainabilityPage({ results }) {
  if (!results) {
    return (
      <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Run an audit first to view the Explainability dashboard.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ ...S.h2, margin: '0 0 8px' }}>Inside the AI Brain</h2>
        <p style={{ color: '#94a3b8', fontSize: 15, margin: 0 }}>
          Deep-dive analysis into exactly how the AI weighted your features and where hidden biases exist.
        </p>
      </div>

      {/* SHAP Values (Feature Importance & Explainability) */}
      <ShapPanel results={results} />

      {/* Root Cause AI Analysis */}
      <WhyBiasExists results={results} />

      {/* Deep Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 28 }}>
        <ColumnBiasPanel results={results} />
        <IntersectionalPanel results={results} />
      </div>
    </motion.div>
  );
}
