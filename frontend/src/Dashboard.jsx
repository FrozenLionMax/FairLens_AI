import React, { useState, useEffect } from 'react';
import { S } from './components/styles';
import { getRiskLevel } from './components/styles';
import { analyzeFile, getSampleData, exportPdf, exportJson, getAnalyses, previewFile, analyzeWithColumns, getAnalysisById } from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DataPreviewModal from './components/DataPreviewModal';
import FairLensChat from './FairLensChat';
import confetti from 'canvas-confetti';

// Pages
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import MitigationStudioPage from './pages/MitigationStudioPage';
import ComparePage from './pages/ComparePage';
import ExplainabilityPage from './pages/ExplainabilityPage';

export default function Dashboard() {
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const [sidebarOpen, setSidebarOpen] = useState(windowWidth >= 768);
  const [history, setHistory] = useState([]);
  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getAnalyses()
      .then(data => { if (Array.isArray(data)) setHistory(data); })
      .catch(() => {});
  }, []);

  const addToHistory = (result) => {
    const entry = {
      analysis_id: result.analysis_id,
      filename: result.filename,
      timestamp: result.timestamp,
      overall_score: result.bias_scores?.overall,
      eeoc_pass: result.bias_scores?.disparate_impact_ratio >= 0.80,
    };
    setHistory(prev => [entry, ...prev]);
  };

  const fireCelebration = () => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#22c55e', '#3b82f6', '#a78bfa'] });
  };

  // Step 1: User picks a file → we preview it and show the two-button state
  const handleUpload = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'json', 'xlsx'].includes(ext) || file.size > 50 * 1024 * 1024) {
      alert('Invalid file. Use CSV, JSON, or XLSX (max 50MB)');
      return;
    }
    setUploadedFile(file);
    setLoading(true);
    try {
      const preview = await previewFile(file);
      setPreviewData(preview);
    } catch (err) {
      alert('Failed to read file: ' + (err.response?.data?.detail || err.message));
      setUploadedFile(null);
    } finally {
      setLoading(false);
    }
  };

  // Option A: "Quick Audit" — auto-detect everything with AI
  const handleQuickAudit = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(old => old >= 95 ? 95 : old + (old < 50 ? 5 : old < 80 ? 2 : 1));
    }, 300);
    try {
      const data = await analyzeFile(uploadedFile);
      setProgress(100);
      clearInterval(timer);
      setResults(data);
      addToHistory(data);
      setPreviewData(null);
      setUploadedFile(null);
      setTab('results');
      if (data.bias_scores?.overall < 40) setTimeout(() => fireCelebration(), 500);
    } catch (err) {
      clearInterval(timer);
      alert('Analysis failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Option B: "Choose Columns" → open modal
  const handleOpenColumnPicker = () => {
    setShowColumnPicker(true);
  };

  // Column picker confirm
  const handlePreviewConfirm = async (targetCol, protectedCol) => {
    if (!previewData) return;
    setLoading(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(old => old >= 95 ? 95 : old + (old < 50 ? 5 : old < 80 ? 2 : 1));
    }, 300);
    try {
      const data = await analyzeWithColumns(previewData.preview_id, targetCol, protectedCol);
      setProgress(100);
      clearInterval(timer);
      setResults(data);
      addToHistory(data);
      setPreviewData(null);
      setUploadedFile(null);
      setShowColumnPicker(false);
      setTab('results');
      if (data.bias_scores?.overall < 40) setTimeout(() => fireCelebration(), 500);
    } catch (err) {
      clearInterval(timer);
      alert('Analysis failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Reset upload state
  const handleCancelUpload = () => {
    setPreviewData(null);
    setUploadedFile(null);
    setShowColumnPicker(false);
  };

  const handleSampleData = async () => {
    setLoading(true);
    try {
      const data = await getSampleData();
      setResults(data);
      addToHistory(data);
      setTab('results');
      if (data.bias_scores?.overall < 40) setTimeout(() => fireCelebration(), 500);
    } catch (err) {
      alert('Failed to load sample data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const blob = format === 'pdf' ? await exportPdf(results?.analysis_id) : await exportJson(results?.analysis_id);
      const mime = format === 'pdf' ? 'application/pdf' : 'application/json';
      const url = window.URL.createObjectURL(new Blob([blob], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `fairlens_report_${results?.analysis_id || 'export'}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const loadPastResult = async (analysisId) => {
    setLoading(true);
    try {
      const data = await getAnalysisById(analysisId);
      setResults(data);
      setTab('results');
    } catch (err) {
      alert('Failed to load past result: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const offsetLeft = sidebarOpen && !isMobile ? 272 : 0;
  const mainStyle = {
    ...S.main,
    marginLeft: offsetLeft,
    padding: isMobile ? '20px 16px' : '32px 36px',
    transition: 'margin-left 0.3s, padding 0.3s',
  };

  const renderPage = () => {
    switch (tab) {
      case 'dashboard':
        return <DashboardPage setTab={setTab} results={results} />;
      case 'upload':
        return (
          <UploadPage
            loading={loading}
            progress={progress}
            handleUpload={handleUpload}
            handleSampleData={handleSampleData}
            previewData={previewData}
            onQuickAudit={handleQuickAudit}
            onChooseColumns={handleOpenColumnPicker}
            onCancelUpload={handleCancelUpload}
          />
        );
      case 'results':
        return results ? (
          <ResultsPage results={results} handleExport={handleExport} />
        ) : (
          <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
            <p style={{ color: '#94a3b8', fontSize: 16 }}>No audit results yet. Upload a dataset to get started.</p>
          </div>
        );
      case 'explainability':
        return results ? (
          <ExplainabilityPage results={results} />
        ) : (
          <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
            <p style={{ color: '#94a3b8', fontSize: 16 }}>Run an audit first to see the AI Brain.</p>
          </div>
        );
      case 'analytics':
        return results ? (
          <AnalyticsPage results={results} history={history} />
        ) : (
          <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
            <p style={{ color: '#94a3b8', fontSize: 16 }}>Run an audit first to see analytics.</p>
          </div>
        );
      case 'history':
        return <HistoryPage history={history} onViewResult={loadPastResult} onCompare={() => setTab('compare')} />;
      case 'compare':
        return <ComparePage history={history} />;
      case 'studio':
        return <MitigationStudioPage results={results} setResults={setResults} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage setTab={setTab} history={history} />;
    }
  };

  return (
    <div style={S.page}>
      {/* Mobile overlay — closes sidebar when tapping outside */}
      {sidebarOpen && isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 49, backdropFilter: 'blur(2px)'
          }}
        />
      )}
      <Sidebar tab={tab} setTab={(t) => { setTab(t); if (isMobile) setSidebarOpen(false); }} results={results} sidebarOpen={sidebarOpen} />
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentTab={tab} results={results} isMobile={isMobile} />
      <main style={mainStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {renderPage()}
        </div>
      </main>
      <FairLensChat auditResults={results} />

      {showColumnPicker && previewData && (
        <DataPreviewModal
          preview={previewData}
          onConfirm={handlePreviewConfirm}
          onCancel={() => setShowColumnPicker(false)}
          loading={loading}
        />
      )}
    </div>
  );
}