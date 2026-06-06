import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, ReferenceLine, Cell, ReferenceArea,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle, BarChart3, Shield, Zap, Award } from 'lucide-react';
import { S, getRiskLevel, COLORS } from '../components/styles';

// ── Helpers ──
const getFairnessGrade = (score) => {
  if (score <= 15) return { grade: 'A+', label: 'Excellent', color: '#22c55e' };
  if (score <= 30) return { grade: 'A', label: 'Great', color: '#22c55e' };
  if (score <= 45) return { grade: 'B', label: 'Good', color: '#eab308' };
  if (score <= 60) return { grade: 'C', label: 'Needs Work', color: '#f97316' };
  if (score <= 75) return { grade: 'D', label: 'Poor', color: '#ef4444' };
  return { grade: 'F', label: 'Critical', color: '#ef4444' };
};

// ── Tooltips (clean & minimal) ──
const TrendTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const risk = getRiskLevel(d.score);
  return (
    <div style={{ background: 'rgba(15,23,42,0.96)', border: `1px solid ${risk.color}44`, borderRadius: 12, padding: '14px 18px', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', minWidth: 200 }}>
      <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 800, margin: '0 0 8px' }}>{d.period}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: risk.color }}>{d.score.toFixed(1)}%</span>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{risk.label}</span>
      </div>
      {d.count > 1 && <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>Avg of {d.count} audits · Best {d.best?.toFixed(0)}% · Worst {d.worst?.toFixed(0)}%</p>}
      {d.change !== undefined && d.change !== null && (
        <p style={{ color: d.change <= 0 ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: 700, margin: '6px 0 0' }}>
          {d.change <= 0 ? '↓' : '↑'} {Math.abs(d.change).toFixed(1)}% vs previous
        </p>
      )}
    </div>
  );
};

const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const s = payload[0].value;
  const r = getRiskLevel(s);
  return (
    <div style={{ background: 'rgba(15,23,42,0.96)', border: `1px solid ${r.color}44`, borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: r.color, fontSize: 16, fontWeight: 900, margin: 0 }}>{s.toFixed(1)}% — {r.label}</p>
    </div>
  );
};

// ── KPI Card ──
function KPI({ label, value, sub, color, icon: Icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      style={{ ...S.card, padding: '18px 22px', borderTop: `3px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', margin: 0 }}>{label}</p>
        {Icon && <div style={{ background: color + '18', padding: 7, borderRadius: 8 }}><Icon size={15} color={color} /></div>}
      </div>
      <p style={{ color: '#f8fafc', fontSize: 26, fontWeight: 900, margin: 0 }}>{value}</p>
      {sub && <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{sub}</p>}
    </motion.div>
  );
}

// ── Main ──
export default function AnalyticsPage({ results, history }) {

  // ── Build trend data grouped by week/month ──
  const buildTrend = () => {
    const raw = (history || []).slice().reverse();
    if (raw.length === 0 && results) {
      return [{ period: 'Current', score: results.bias_scores?.overall || 0, eeoc: (results.bias_scores?.disparate_impact_ratio >= 0.8) ? 1 : 0, count: 1, best: results.bias_scores?.overall || 0, worst: results.bias_scores?.overall || 0, change: null }];
    }
    if (raw.length === 0) return [];

    const ts = raw.filter(h => h.timestamp).map(h => new Date(h.timestamp).getTime());
    const span = ts.length >= 2 ? (Math.max(...ts) - Math.min(...ts)) / 864e5 : 0;
    const byMonth = span > 60;

    const buckets = {};
    raw.forEach((h, i) => {
      let key = `Audit ${i + 1}`;
      if (h.timestamp) {
        const d = new Date(h.timestamp);
        if (!isNaN(d.getTime())) {
          if (byMonth) {
            key = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
          } else {
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const ws = new Date(d); ws.setDate(diff);
            key = `Week of ${ws.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
          }
        }
      }
      if (!buckets[key]) buckets[key] = { scores: [], passes: 0, total: 0 };
      buckets[key].scores.push(h.overall_score || 0);
      buckets[key].total++;
      if (h.eeoc_pass) buckets[key].passes++;
    });

    const entries = Object.entries(buckets);
    return entries.map(([period, b], i) => {
      const avg = Math.round((b.scores.reduce((a, c) => a + c, 0) / b.scores.length) * 10) / 10;
      const prev = i > 0 ? entries[i - 1][1] : null;
      const prevAvg = prev ? Math.round((prev.scores.reduce((a, c) => a + c, 0) / prev.scores.length) * 10) / 10 : null;
      return {
        period,
        score: avg,
        best: Math.min(...b.scores),
        worst: Math.max(...b.scores),
        count: b.total,
        eeoc: b.passes >= b.total / 2 ? 1 : 0,
        change: prevAvg !== null ? Math.round((avg - prevAvg) * 10) / 10 : null,
      };
    });
  };

  const trendData = buildTrend();

  // ── Computed insights (deep logic) ──
  const currentScore = results?.bias_scores?.overall || 0;
  const grade = getFairnessGrade(currentScore);
  const dir = results?.bias_scores?.disparate_impact_ratio;
  const colBias = (results?.bias_scores?.column_bias || []).map((c, i) => ({
    name: (c.attribute || c.column || 'Col').replace(/_/g, ' '),
    score: c.bias_score || 0,
  }));
  const radarData = colBias.map(c => ({ name: c.name, value: c.score }));
  const topRisk = [...colBias].sort((a, b) => b.score - a.score);
  const passCount = (history || []).filter(h => h.eeoc_pass).length;
  const totalCount = Math.max((history || []).length, 1);

  // Velocity: how fast is bias changing per period?
  const velocity = trendData.length >= 3
    ? Math.round(((trendData[trendData.length - 1].score - trendData[0].score) / (trendData.length - 1)) * 10) / 10
    : null;

  // Compliance streak
  const streak = (() => {
    let s = 0;
    for (let i = trendData.length - 1; i >= 0; i--) {
      if (trendData[i].eeoc) s++; else break;
    }
    return s;
  })();

  // Anomaly detection: flag any period with score spike > 15 from moving average
  const anomalies = trendData.map((d, i) => {
    if (i < 1) return false;
    const prevAvg = trendData.slice(Math.max(0, i - 2), i).reduce((a, c) => a + c.score, 0) / Math.min(i, 2);
    return Math.abs(d.score - prevAvg) > 15;
  });

  // Trajectory
  const trajectory = trendData.length >= 2 ? (() => {
    const diff = trendData[trendData.length - 1].score - trendData[0].score;
    if (Math.abs(diff) < 2) return { text: 'Stable — bias levels holding steady', color: '#94a3b8', icon: Minus };
    if (diff < 0) return { text: `Improving — bias dropped ${Math.abs(diff).toFixed(1)}% over ${trendData.length} periods`, color: '#22c55e', icon: TrendingDown };
    return { text: `Worsening — bias rose ${diff.toFixed(1)}% over ${trendData.length} periods`, color: '#ef4444', icon: TrendingUp };
  })() : null;

  const [view, setView] = useState('trend');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ ...S.pageTitle, marginBottom: 4 }}>Analytics</h2>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Fairness intelligence across all your audits.</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <KPI label="Fairness Grade" value={grade.grade} sub={`${grade.label} · ${currentScore.toFixed(0)}% bias`} color={grade.color} icon={Award} />
        <KPI label="EEOC Compliance" value={dir !== undefined && dir !== null ? `${(dir * 100).toFixed(0)}%` : 'N/A'}
          sub={dir >= 0.8 ? '✓ Above 80% threshold' : '✗ Below 80% threshold'} color={dir >= 0.8 ? '#22c55e' : '#ef4444'} icon={Shield} />
        <KPI label="Compliance Rate" value={`${Math.round((passCount / totalCount) * 100)}%`}
          sub={`${passCount} of ${totalCount} audits passed`} color={passCount / totalCount >= 0.7 ? '#22c55e' : '#f97316'} icon={CheckCircle} />
        {velocity !== null && (
          <KPI label="Bias Velocity" value={`${velocity > 0 ? '+' : ''}${velocity}%`}
            sub={velocity <= 0 ? 'Decreasing per period ✓' : 'Increasing per period ✗'}
            color={velocity <= 0 ? '#22c55e' : '#ef4444'} icon={Zap} />
        )}
        {streak > 0 && velocity === null && (
          <KPI label="Compliance Streak" value={`${streak}`}
            sub={`${streak} consecutive compliant period${streak > 1 ? 's' : ''}`}
            color="#22c55e" icon={Zap} />
        )}
      </div>

      {/* Trajectory Banner */}
      {trajectory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: trajectory.color + '0d', border: `1px solid ${trajectory.color}25`,
          borderRadius: 10, padding: '10px 18px', marginBottom: 20,
        }}>
          <trajectory.icon size={16} color={trajectory.color} />
          <span style={{ color: trajectory.color, fontSize: 13, fontWeight: 600 }}>{trajectory.text}</span>
          {streak > 1 && <span style={{ marginLeft: 'auto', color: '#22c55e', fontSize: 12, fontWeight: 700 }}>🔥 {streak} period streak</span>}
        </motion.div>
      )}

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { key: 'trend', label: '📈 Trend' },
          { key: 'columns', label: '📊 Columns' },
          { key: 'radar', label: '🕸️ Radar' },
        ].map(v => (
          <button key={v.key} onClick={() => setView(v.key)} style={{
            background: view === v.key ? 'linear-gradient(135deg,#6366f1,#3b82f6)' : 'transparent',
            color: view === v.key ? '#fff' : '#64748b', border: 'none', borderRadius: 8,
            padding: '8px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
          }}>{v.label}</button>
        ))}
      </div>

      {/* Chart Card */}
      <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        style={{ ...S.card, marginBottom: 24, padding: '24px 20px' }}>

        {/* ── TREND VIEW ── */}
        {view === 'trend' && (
          <>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, margin: '0 0 4px' }}>Bias Score Over Time</h3>
            <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 18px' }}>
              {trendData.length <= 1 ? 'Upload and audit more datasets to see your trend.' : `${trendData.length} periods · Grouped by ${trendData[0]?.period?.startsWith('Week') ? 'week' : 'month'}`}
            </p>

            {trendData.length <= 1 ? (
              /* Single audit — gauge */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
                <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 16 }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="10" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke={grade.color} strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={`${((currentScore) / 100) * 440} 440`}
                      transform="rotate(-90 80 80)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: grade.color }}>{grade.grade}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{currentScore.toFixed(1)}% bias</span>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', maxWidth: 300, margin: 0 }}>
                  Run audits over the coming weeks to track your fairness journey here.
                </p>
              </div>
            ) : (
              /* Multi-period chart */
              <ResponsiveContainer width="100%" height={340}>
                <ComposedChart data={trendData} margin={{ top: 10, right: 16, left: -12, bottom: 5 }}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {/* Risk zone bands */}
                  <ReferenceArea y1={0} y2={40} fill="#22c55e" fillOpacity={0.04} />
                  <ReferenceArea y1={40} y2={70} fill="#f97316" fillOpacity={0.04} />
                  <ReferenceArea y1={70} y2={100} fill="#ef4444" fillOpacity={0.04} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
                  <XAxis dataKey="period" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} tickFormatter={v => `${v}%`}
                    ticks={[0, 20, 40, 60, 80, 100]} />
                  <Tooltip content={<TrendTip />} />
                  <ReferenceLine y={40} stroke="#22c55e" strokeDasharray="4 3" strokeOpacity={0.3} />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 3" strokeOpacity={0.3} />
                  {/* Area fill */}
                  <Area type="monotone" dataKey="score" fill="url(#areaFill)" stroke="none" activeDot={false} legendType="none" tooltipType="none" />
                  {/* Line with smart dots */}
                  <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload, index } = props;
                      if (!cx || !cy) return null;
                      const c = payload.eeoc ? '#22c55e' : '#ef4444';
                      const isAnomaly = anomalies[index];
                      return (
                        <g key={`d-${index}`}>
                          {isAnomaly && <circle cx={cx} cy={cy} r={14} fill={c} fillOpacity={0.08} />}
                          <circle cx={cx} cy={cy} r={isAnomaly ? 6 : 4.5} fill={c} stroke="#0f172a" strokeWidth={2} />
                        </g>
                      );
                    }}
                    activeDot={{ r: 8, fill: '#fff', stroke: '#6366f1', strokeWidth: 2.5 }}
                    name="Bias Score" />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {/* Inline legend */}
            {trendData.length > 1 && (
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10, fontSize: 11, color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Compliant
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> Non-Compliant
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #f97316', background: 'transparent', display: 'inline-block' }} /> Anomaly
                </span>
              </div>
            )}
          </>
        )}

        {/* ── COLUMNS VIEW ── */}
        {view === 'columns' && (
          <>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, margin: '0 0 4px' }}>Bias by Attribute</h3>
            <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 18px' }}>Higher score = more discriminatory. Colors indicate risk level.</p>
            {colBias.length === 0 ? (
              <p style={{ color: '#475569', textAlign: 'center', padding: 40 }}>Run an audit first.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, colBias.length * 48)}>
                <ComposedChart data={colBias} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 12, fill: '#94a3b8' }} width={100} />
                  <Tooltip content={<BarTip />} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20} name="Bias Score">
                    {colBias.map((e, i) => (
                      <Cell key={i} fill={getRiskLevel(e.score).color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </>
        )}

        {/* ── RADAR VIEW ── */}
        {view === 'radar' && (
          <>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, margin: '0 0 4px' }}>Bias Radar</h3>
            <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 18px' }}>Smaller shape = fairer model. Spikes show problem areas.</p>
            {radarData.length === 0 ? (
              <p style={{ color: '#475569', textAlign: 'center', padding: 40 }}>Run an audit first.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(99,102,241,0.12)" />
                  <PolarAngleAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <PolarRadiusAxis stroke="#475569" tick={{ fontSize: 9, fill: '#475569' }} domain={[0, 100]} angle={30} />
                  <Radar name="Bias %" dataKey="value" stroke="#818cf8" fill="#6366f1" fillOpacity={0.25} dot={{ fill: '#a5b4fc', r: 3.5 }} />
                  <Tooltip content={<BarTip />} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </motion.div>

      {/* Risk Table */}
      {topRisk.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, margin: 0 }}>Risk Ranking</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.04)' }}>
                {['#', 'Attribute', 'Score', 'Level', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 18px', textAlign: 'left', color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topRisk.map((col, i) => {
                const r = getRiskLevel(col.score);
                return (
                  <tr key={i} style={{ borderTop: '1px solid rgba(99,102,241,0.05)' }}>
                    <td style={{ padding: '12px 18px', color: '#475569', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: '12px 18px', color: '#f1f5f9', fontWeight: 600, fontSize: 13 }}>{col.name}</td>
                    <td style={{ padding: '12px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 6, width: 90, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${col.score}%`, background: r.color, borderRadius: 99, transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ color: r.color, fontWeight: 800, fontSize: 13 }}>{col.score.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ background: r.color + '18', color: r.color, border: `1px solid ${r.color}33`, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                        {r.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', color: '#64748b', fontSize: 12 }}>
                      {col.score >= 70 ? 'Mitigate immediately' : col.score >= 40 ? 'Monitor before deploy' : 'No action needed'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
