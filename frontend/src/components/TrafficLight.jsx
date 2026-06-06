import React from 'react';
import { motion } from 'framer-motion';
import { S, getRiskLevel, simpleTerm } from './styles';

export default function TrafficLight({ label, score }) {
  const risk = getRiskLevel(score);
  return (
    <motion.div whileHover={{ scale: 1.03 }} style={{
      ...S.card, borderLeft: `4px solid ${risk.color}`,
      background: risk.bg, cursor: 'default', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 22 }}>{risk.dot}</div>
      <p style={S.label}>{simpleTerm(label)}</p>
      <p style={{ ...S.bigNum, color: risk.color }}>{score}<span style={{ fontSize: 16, fontWeight: 400 }}>%</span></p>
      <div style={{ marginTop: 10, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: .3 }}
          style={{ height: '100%', background: risk.color, borderRadius: 3 }} />
      </div>
      <p style={{ ...S.tag(risk.color), marginTop: 10, fontSize: 11 }}>{risk.label}</p>
    </motion.div>
  );
}
