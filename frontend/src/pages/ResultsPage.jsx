import React from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Download, FileText } from 'lucide-react';
import { S, COLORS } from '../components/styles';
import TrafficLight from '../components/TrafficLight';
import ExecutiveSummary from '../components/ExecutiveSummary';
import BeginnerExplainer from '../components/BeginnerExplainer';
import BeforeAfter from '../components/BeforeAfter';
import EEOCPanel from '../components/EEOCPanel';
import ConfidencePanel from '../components/ConfidencePanel';
import ComplianceLayer from '../components/ComplianceLayer';
import RecommendationsPanel from '../components/RecommendationsPanel';

export default function ResultsPage({ results, handleExport }) {
  const biasData = [];
  if (results?.bias_scores) {
    biasData.push({ name: 'Overall', value: results.bias_scores.overall || 0, fill: '#ef4444' });
    const cols = results.bias_scores.column_bias || [];
    cols.forEach((col, i) => {
      const color = COLORS[(i + 1) % COLORS.length];
      biasData.push({ name: col.attribute || col.column, value: col.bias_score || 0, fill: color });
    });
  }


  const radarData = biasData.map(d => ({ name: d.name, value: d.value }));

  return (
    <>
      <ExecutiveSummary results={results} />
      <BeginnerExplainer results={results} />
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ ...S.sectionTitle, marginBottom: 16 }}>🚦 Bias by Category — Traffic Light View</h3>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>🟢 Green = Safe (under 40%) &nbsp;&nbsp; 🟡 Yellow = Moderate Risk (40–70%) &nbsp;&nbsp; 🔴 Red = High Risk (above 70%)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
          {biasData.map((d, i) => <TrafficLight key={i} label={d.name.toLowerCase()} score={d.value} />)}
        </div>
      </div>
      <BeforeAfter results={results} />


      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...S.card, marginBottom: 28 }}>
        <h3 style={{ color: '#f1f5f9', fontWeight: 700, margin: '0 0 16px' }}>🕸️ Bias Distribution Profile (Radar View)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Radar name="Bias Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
      <EEOCPanel results={results} />
      <ConfidencePanel results={results} />
      <ComplianceLayer results={results} />
      <RecommendationsPanel recommendations={results.recommendations} />

      {/* Export Buttons */}
      <div style={{ marginTop: 40, marginBottom: 20, textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.4) 100%)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.02)' }}>
        <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: 24, margin: '0 0 12px' }}>Generate Official Reports</h3>
        <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          Download a legally compliant executive certificate for stakeholders, or structured machine-readable data for your engineering pipelines.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 12px 40px -10px rgba(99,102,241,0.7)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleExport('pdf')}
            style={{ 
              background: 'linear-gradient(135deg, #4f46e5, #2563eb)', 
              color: '#fff', fontWeight: 800, padding: '18px 40px', 
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: 12, fontSize: 17,
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            <Download size={22} /> Download Compliance Certificate (PDF)
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleExport('json')}
            style={{ 
              background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', 
              fontWeight: 700, padding: '18px 32px', 
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 16,
              transition: 'background 0.2s'
            }}
          >
            <FileText size={20} /> Raw Data (JSON)
          </motion.button>
        </div>
      </div>
    </>
  );
}
