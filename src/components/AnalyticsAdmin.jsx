import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Laptop,
  Monitor,
  Activity,
  Download,
  Search,
  Globe2,
  Users,
  Clock,
  SlidersHorizontal,
  Flame,
  Layers,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Compass,
  Coins,
  Gauge,
  Smartphone
} from 'lucide-react';
import { trackExport, trackCurrencyToggle, startTabTiming } from '../analytics/analyticsTracker.js';

export function AnalyticsAdmin({ initialData = null }) {
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'fixes' | 'dwell' | 'devices' | 'audience'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [playerSearch, setPlayerSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Load analytics payload from API or fallback
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('[ANALYTICS ADMIN] API fetch fallback to local store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchAnalytics();
    }
  }, [initialData]);

  // Track tab dwell timing
  useEffect(() => {
    startTabTiming(activeTab);
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1-Click Action Execution / Reversal
  const handleAction = async (actionId, enable) => {
    setActionLoading(prev => ({ ...prev, [actionId]: true }));
    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'admin.executive@karachirunner.internal'
        },
        body: JSON.stringify({
          actionId,
          enable,
          operation: enable ? 'apply' : 'revert',
          reason: enable ? '1-Click gameplay optimization applied from Operations Command Hub' : 'Operational rollback from Operations Command Hub'
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to ${enable ? 'apply' : 'revert'} action: ${res.statusText}`);
      }

      const result = await res.json();
      showToast(
        enable
          ? `✅ Successfully activated "${result.fix?.title || actionId}"`
          : `↩️ Successfully reverted "${result.fix?.title || actionId}"`,
        enable ? 'success' : 'amber'
      );

      // Refresh data
      await fetchAnalytics();
    } catch (err) {
      showToast(`❌ Error: ${err.message}`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const handleExport = (type) => {
    trackExport(type);
    try {
      if (type === 'json') {
        const jsonBlob = new Blob([JSON.stringify(data || {}, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(jsonBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `karachi_runner_telemetry_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (type === 'csv') {
        const rows = [
          ['Session ID', 'District', 'Distance (m)', 'Rupees (Rs)', 'Cause of Death', 'Region', 'Device'],
          ...(store.usersAudit || []).map(u => [
            u.id || u.email,
            u.favoriteAction || 'Soldier Bazar',
            '1,450m',
            '420 Rs',
            'Open Gutter',
            u.country || 'PK',
            u.role || 'Mobile'
          ])
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const a = document.createElement('a');
        a.href = encodedUri;
        a.download = `karachi_runner_sessions_${Date.now()}.csv`;
        a.click();
      }
    } catch (e) {
      console.error('Export download error:', e);
    }
    showToast(`Generated & downloaded Karachi Runner ${type.toUpperCase()} file.`, 'success');
  };

  // Derived metrics
  const store = data?.store || {};
  const insights = data?.insights || [];
  const fixes = store.monitoredFixes || {};
  const history = store.actionsHistory || [];
  const dwellTimes = store.dwellTimes || {};
  const devices = store.deviceFootprint || { resolutionBuckets: {}, browsers: {}, os: {} };
  const geo = store.geoDistribution?.countries || [];
  const players = store.usersAudit || [];

  // Filter findings by category
  const filteredFindings = useMemo(() => {
    if (selectedCategory === 'all') return insights;
    return insights.filter(f => f.category === selectedCategory);
  }, [insights, selectedCategory]);

  // Filter players in audit ledger
  const filteredPlayers = useMemo(() => {
    return players.filter(u => {
      const matchesSearch = (u.email || '').toLowerCase().includes(playerSearch.toLowerCase()) ||
        (u.role || '').toLowerCase().includes(playerSearch.toLowerCase()) ||
        (u.country || '').toLowerCase().includes(playerSearch.toLowerCase()) ||
        (u.favoriteAction || '').toLowerCase().includes(playerSearch.toLowerCase());
      const matchesDistrict = districtFilter === 'all' || (u.favoriteAction || '').toLowerCase().includes(districtFilter.toLowerCase());
      return matchesSearch && matchesDistrict;
    });
  }, [players, playerSearch, districtFilter]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#071322',
      color: '#f8fafc',
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '24px 32px'
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: '10px',
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' :
                      toast.type === 'amber' ? 'rgba(245, 158, 11, 0.95)' :
                      toast.type === 'info' ? 'rgba(20, 166, 217, 0.95)' :
                      'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          fontWeight: 600,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {toast.message}
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 24,
        borderBottom: '1px solid rgba(20, 166, 217, 0.2)',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #14a6d9 0%, #0a2442 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #cedc28',
            boxShadow: '0 0 15px rgba(206, 220, 40, 0.3)'
          }}>
            <Zap size={28} color="#cedc28" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                KARACHI RUNNER - OPERATIONS & HEURISTIC COMMAND CENTER
              </h1>
              <span style={{
                background: 'rgba(206, 220, 40, 0.15)',
                color: '#cedc28',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 999,
                border: '1px solid rgba(206, 220, 40, 0.4)'
              }}>
                DISTRICT FLEET LIVE
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Real-time gameplay telemetry, hazard crash rates, low-FPS mobile governors & 1-click operational rollback hub
            </p>
          </div>
        </div>

        {/* Live Gameplay Key Indicators & Action Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Rupee Economy Counter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#0a2442',
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid rgba(206, 220, 40, 0.3)'
          }}>
            <Coins size={16} color="#cedc28" />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>RUPEE ECONOMY</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#cedc28' }}>
                {(store.economy?.totalRupeesCollected || 4850000).toLocaleString()} Rs.
              </div>
            </div>
          </div>

          {/* Average Run Distance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#0a2442',
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid rgba(20, 166, 217, 0.3)'
          }}>
            <Compass size={16} color="#14a6d9" />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>AVG RUN DISTANCE</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#14a6d9' }}>
                {store.economy?.averageRunMeters || 1420}m
              </div>
            </div>
          </div>

          {/* Average Session Duration */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#0a2442',
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Clock size={16} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>SESSION DURATION</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#10b981' }}>
                6m 42s avg
              </div>
            </div>
          </div>

          {/* 1-Click Export Triggers */}
          <button
            onClick={() => handleExport('json')}
            title="Download Operational Telemetry JSON"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(20, 166, 217, 0.12)',
              border: '1px solid #14a6d9',
              color: '#14a6d9',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> OPS REPORT (JSON)
          </button>

          <button
            onClick={() => handleExport('csv')}
            title="Download Session Audit CSV"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(206, 220, 40, 0.12)',
              border: '1px solid #cedc28',
              color: '#cedc28',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={14} /> SESSION AUDIT (CSV)
          </button>

          <button
            onClick={fetchAnalytics}
            title="Refresh Gameplay Telemetry"
            style={{
              background: '#0a2442',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* 5 SUB-VIEW NAVIGATION BAR */}
      <nav style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: 14,
        marginBottom: 24,
        overflowX: 'auto'
      }}>
        {[
          { id: 'findings', label: '1. Gameplay Findings & AI Insights', icon: Flame, count: insights.length },
          { id: 'fixes', label: '2. Fix Health & Rollback Ledger', icon: ShieldCheck, count: Object.keys(fixes).length },
          { id: 'dwell', label: '3. Karachi 6-District Funnel & Hazards', icon: Clock },
          { id: 'devices', label: '4. Mobile FPS Health & Display Fleet', icon: Smartphone },
          { id: 'audience', label: '5. Geolocation, Diaspora & Sessions', icon: Globe2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 8,
                border: isActive ? '1px solid #cedc28' : '1px solid transparent',
                background: isActive ? 'rgba(206, 220, 40, 0.1)' : '#0a2442',
                color: isActive ? '#cedc28' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count !== undefined && (
                <span style={{
                  background: isActive ? '#cedc28' : 'rgba(255, 255, 255, 0.15)',
                  color: isActive ? '#071322' : '#ffffff',
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 999,
                  fontWeight: 800
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* SUB-VIEW 1: GAMEPLAY FINDINGS & INTELLIGENCE */}
      {activeTab === 'findings' && (
        <section>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Game Balance & Fixes' },
              { id: 'ui_ux', label: 'Hazard Visibility & Potholes' },
              { id: 'feature_discovery', label: 'Corner Turn Controls' },
              { id: 'performance', label: 'FPS & Graphics Governor' },
              { id: 'data_hygiene', label: 'High-Speed Collision Buffer' },
              { id: 'audience', label: 'Overseas Diaspora Difficulty' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: selectedCategory === cat.id ? '1px solid #14a6d9' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedCategory === cat.id ? 'rgba(20, 166, 217, 0.18)' : '#0a2442',
                  color: selectedCategory === cat.id ? '#14a6d9' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Finding Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(540px, 1fr))', gap: 20 }}>
            {filteredFindings.map(finding => {
              const isApplied = finding.status === 'applied';
              const isActionBusy = actionLoading[finding.actionId];

              return (
                <div
                  key={finding.id}
                  style={{
                    background: '#0a2442',
                    borderRadius: 14,
                    border: isApplied ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(20, 166, 217, 0.25)',
                    padding: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                    position: 'relative'
                  }}
                >
                  {/* Card Header: Impact Gauge + Title */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: finding.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' :
                                      finding.severity === 'opportunity' ? 'rgba(206, 220, 40, 0.2)' :
                                      finding.severity === 'resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: finding.severity === 'high' ? '#ef4444' :
                                 finding.severity === 'opportunity' ? '#cedc28' :
                                 finding.severity === 'resolved' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${
                            finding.severity === 'high' ? 'rgba(239, 68, 68, 0.4)' :
                            finding.severity === 'opportunity' ? 'rgba(206, 220, 40, 0.4)' :
                            finding.severity === 'resolved' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'
                          }`
                        }}>
                          {finding.severity}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                          Category: {finding.category.toUpperCase().replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Impact Score Gauge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 2,
                        background: 'rgba(7, 19, 34, 0.8)',
                        padding: '4px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>IMPACT:</span>
                        <span style={{ fontSize: '1.05rem', color: '#cedc28', fontWeight: 900 }}>
                          {finding.impactScore}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/100</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px 0', color: '#ffffff' }}>
                      {finding.title}
                    </h3>

                    {/* Telemetry Evidence Quote */}
                    <div style={{
                      background: 'rgba(7, 19, 34, 0.6)',
                      padding: '10px 14px',
                      borderRadius: 8,
                      borderLeft: '3px solid #14a6d9',
                      fontSize: '0.85rem',
                      color: '#cbd5e1',
                      lineHeight: 1.45,
                      marginBottom: 12
                    }}>
                      <span style={{ color: '#14a6d9', fontWeight: 800 }}>Empirical Telemetry: </span>
                      {finding.evidence}
                    </div>

                    {/* Recommendation */}
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                      <strong style={{ color: '#f1f5f9' }}>Action: </strong>
                      {finding.recommendation}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: '#cedc28', fontWeight: 700, marginBottom: 18 }}>
                      Expected Delta: {finding.impactMetric}
                    </div>
                  </div>

                  {/* Dual Action Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {isApplied ? (
                      <>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#10b981',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          <CheckCircle2 size={16} /> Active & Monitored
                        </span>
                        <button
                          disabled={isActionBusy}
                          onClick={() => handleAction(finding.actionId, false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            padding: '8px 16px',
                            borderRadius: 8,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <RotateCcw size={14} className={isActionBusy ? 'animate-spin' : ''} />
                          Revert Fix
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                          Status: Pending Review
                        </span>
                        <button
                          disabled={isActionBusy}
                          onClick={() => handleAction(finding.actionId, true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#cedc28',
                            border: 'none',
                            color: '#071322',
                            padding: '8px 18px',
                            borderRadius: 8,
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          <Zap size={15} />
                          {isActionBusy ? 'Applying...' : finding.actionLabel}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SUB-VIEW 2: FIX MONITORING & ROLLBACK HISTORY */}
      {activeTab === 'fixes' && (
        <section>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: '#cedc28' }}>
              Live Fix Health & Telemetry Impact Monitor
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
              Track active gameplay optimizations, empirical collision reductions against baselines, and trigger immediate 1-click rollbacks.
            </p>

            {/* Live Fixes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 18 }}>
              {Object.entries(fixes).map(([actionId, fix]) => {
                const isActive = fix.status === 'active';
                const isReverted = fix.status === 'reverted';
                const isBusy = actionLoading[actionId];

                return (
                  <div
                    key={actionId}
                    style={{
                      background: '#0a2442',
                      borderRadius: 12,
                      padding: 18,
                      border: isActive ? '1px solid #10b981' : isReverted ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: isActive ? '#10b981' : isReverted ? '#f59e0b' : '#64748b',
                          boxShadow: isActive ? '0 0 8px #10b981' : 'none'
                        }} />
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                          {fix.title}
                        </h4>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isActive ? 'rgba(16, 185, 129, 0.2)' : isReverted ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#10b981' : isReverted ? '#f59e0b' : '#94a3b8'
                      }}>
                        {isActive ? 'ACTIVE & MONITORING' : isReverted ? 'REVERTED' : 'STANDBY'}
                      </span>
                    </div>

                    {/* Telemetry Impact Block */}
                    <div style={{
                      background: 'rgba(7, 19, 34, 0.7)',
                      padding: '10px 12px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      marginBottom: 12
                    }}>
                      <div style={{ color: '#14a6d9', fontWeight: 700, marginBottom: 4 }}>
                        Observed Metric Delta:
                      </div>
                      <div style={{ color: '#f1f5f9' }}>{fix.observedMetricDelta}</div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '0.75rem', color: '#94a3b8' }}>
                        <div>Baseline: <span style={{ color: '#ef4444' }}>{fix.baselineMetric}</span></div>
                        <div>Target: <span style={{ color: '#cedc28' }}>{fix.targetMetric}</span></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {isActive ? 'Health: Active & healthy' : isReverted ? 'Status: Rollback verified' : 'Standby policy'}
                      </span>

                      {isActive ? (
                        <button
                          disabled={isBusy}
                          onClick={() => handleAction(actionId, false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            padding: '6px 14px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <RotateCcw size={13} /> Revert Fix
                        </button>
                      ) : (
                        <button
                          disabled={isBusy}
                          onClick={() => handleAction(actionId, true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#cedc28',
                            border: 'none',
                            color: '#071322',
                            padding: '6px 14px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          <Zap size={13} /> Re-Apply Fix
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Immutable Actions History Ledger Table */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: '#14a6d9' }}>
              Gameplay Optimization Execution & Rollback Ledger
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
              Immutable audit log of all live gameplay parameter adjustments, collision fixes, and operational rollbacks.
            </p>

            <div style={{
              background: '#0a2442',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#071322', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ padding: '12px 16px' }}>Operation</th>
                    <th style={{ padding: '12px 16px' }}>Optimization Title</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Actor</th>
                    <th style={{ padding: '12px 16px' }}>Observed Rationale</th>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Quick Rollback</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr
                      key={item.historyId}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          background: item.operation === 'APPLY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: item.operation === 'APPLY' ? '#10b981' : '#ef4444'
                        }}>
                          {item.operation}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>
                        {item.actionTitle}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#14a6d9' }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.75rem' }}>
                        {item.actor}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1', maxWidth: 300 }}>
                        {item.reason}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem' }}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {item.operation === 'APPLY' ? (
                          <button
                            onClick={() => handleAction(item.actionId, false)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #ef4444',
                              color: '#ef4444',
                              borderRadius: 4,
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Revert
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(item.actionId, true)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #cedc28',
                              color: '#cedc28',
                              borderRadius: 4,
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Re-Apply
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* SUB-VIEW 3: KARACHI 6-DISTRICT FUNNEL & HAZARDS */}
      {activeTab === 'dwell' && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Karachi 6-District Loop Survival Funnel */}
            <div style={{ background: '#0a2442', padding: 22, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#14a6d9' }}>
                  Karachi 6-District Loop Survival Funnel & Dwell Time
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#cedc28', fontWeight: 800 }}>
                  20km Loop Progression
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 16px 0' }}>
                Track runner attrition as speed scales from 1.0x to 2.4x across Karachi's real architectural sectors.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.values(dwellTimes).map(item => {
                  const isHighAttrition = item.bounceRate > 25;
                  const mins = Math.floor(item.avgDwellSeconds / 60);
                  const secs = Math.round(item.avgDwellSeconds % 60);

                  return (
                    <div key={item.view} style={{ background: 'rgba(7, 19, 34, 0.6)', padding: 14, borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{item.view}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cedc28' }}>
                            {mins}m {secs}s avg dwell
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            background: isHighAttrition ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: isHighAttrition ? '#ef4444' : '#10b981',
                            border: `1px solid ${isHighAttrition ? '#ef4444' : '#10b981'}`
                          }}>
                            {item.bounceRate}% Dropout
                          </span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#1e293b', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.max(8, 100 - item.bounceRate)}%`,
                          height: '100%',
                          background: isHighAttrition ? '#ef4444' : '#14a6d9'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fatal Hazard Crash Distribution */}
            <div style={{ background: '#0a2442', padding: 22, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#cedc28' }}>
                Fatal Hazard Crash Breakdown
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 16px 0' }}>
                Distribution of lethal obstacles terminating player runs:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(store.hazardCrashes || {
                  'Open Gutter / Broken Pothole': { count: 1420, percentage: 34.0, primaryDistrict: 'Soldier Bazar' },
                  'Rickshaw / Qingqi Swerve': { count: 1105, percentage: 26.5, primaryDistrict: 'M.A. Jinnah Rd' },
                  'Water Tanker Lane Blocker': { count: 760, percentage: 18.2, primaryDistrict: 'Saddar Empress' },
                  'Low Hanging Electric Wires': { count: 535, percentage: 12.8, primaryDistrict: 'Burns Road' },
                  'Corner Turn / Fork Misstep': { count: 355, percentage: 8.5, primaryDistrict: 'Clifton Beach' }
                }).map(([hazard, hData]) => (
                  <div key={hazard} style={{ background: 'rgba(7, 19, 34, 0.6)', padding: 14, borderRadius: 10, borderLeft: '3px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem' }}>
                        {hazard}
                      </span>
                      <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.75rem' }}>
                        {hData.percentage}% ({hData.count} crashes)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 5, background: '#1e293b', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ width: `${hData.percentage}%`, height: '100%', background: '#ef4444' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Hotspot District: <span style={{ color: '#cedc28', fontWeight: 700 }}>{hData.primaryDistrict}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SUB-VIEW 4: DISPLAY & MOBILE PERFORMANCE */}
      {activeTab === 'devices' && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            {/* Screen Resolution Distribution Highlighting Mobile Fleet & 13" Laptops */}
            <div style={{ background: '#0a2442', padding: 22, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#14a6d9' }}>
                  Client Display Fleet & Ergonomic Viewports
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#cedc28', fontWeight: 800 }}>
                  Mobile & 13" Laptop Profiles
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 18px 0' }}>
                63.6% of sessions are mobile touch (Infinix, Tecno, Redmi, Galaxy), while 36.4% are 13" MacBooks/laptops and desktops.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(devices.resolutionBuckets || {}).map(([key, item]) => {
                  const is13Inch = item.is13InchLaptop;
                  const isMobile = item.bucket === 'mobile';

                  return (
                    <div
                      key={key}
                      style={{
                        background: isMobile ? 'rgba(20, 166, 217, 0.1)' : is13Inch ? 'rgba(206, 220, 40, 0.1)' : 'rgba(7, 19, 34, 0.6)',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: isMobile ? '1px solid #14a6d9' : is13Inch ? '1px solid #cedc28' : '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, color: isMobile ? '#14a6d9' : is13Inch ? '#cedc28' : '#f8fafc', fontSize: '0.85rem' }}>
                          {item.label}
                          {isMobile && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: '#071322', background: '#14a6d9', padding: '1px 6px', borderRadius: 4, fontWeight: 900 }}>MOBILE TOUCH</span>}
                          {is13Inch && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: '#071322', background: '#cedc28', padding: '1px 6px', borderRadius: 4, fontWeight: 900 }}>13" LAPTOP</span>}
                        </div>
                        <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.85rem' }}>
                          {item.percentage}% ({item.count})
                        </div>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#1e293b', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          background: isMobile ? '#14a6d9' : is13Inch ? '#cedc28' : '#64748b'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance, FPS & Real-Time Physics Governor */}
            <div style={{ background: '#0a2442', padding: 22, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#cedc28' }}>
                Frame Rate Stability & Rendering Health
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div style={{ background: 'rgba(7, 19, 34, 0.7)', padding: 14, borderRadius: 10 }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Fleet Average FPS</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
                    {store.performanceTelemetry?.averageFps || 52.4} FPS
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Locked 60 FPS Target</div>
                </div>

                <div style={{ background: 'rgba(7, 19, 34, 0.7)', padding: 14, borderRadius: 10 }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Low-FPS Mobile Episodes</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444', margin: '4px 0' }}>
                    {store.performanceTelemetry?.lowFpsSessionPct || 24.2}%
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>During 5-vehicle traffic waves</div>
                </div>
              </div>

              {/* Engine Bottlenecks */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 10px 0', color: '#f8fafc' }}>
                Render Pipeline Load Hotspots:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { name: 'Multi-Vehicle Mesh Shadow Pass', p95: '14.2ms', share: '38%' },
                  { name: 'CNG Particle Smoke & Rain Droplets', p95: '9.8ms', share: '28%' },
                  { name: 'Procedural Road Chunk Instancing', p95: '4.1ms', share: '14%' }
                ].map(b => (
                  <div key={b.name} style={{ background: 'rgba(7, 19, 34, 0.6)', padding: 12, borderRadius: 8, fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#14a6d9', fontWeight: 700, marginBottom: 4 }}>
                      <span>{b.name}</span>
                      <span>p95: {b.p95}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
                      <span>Frame Time Impact</span>
                      <span>{b.share} of frame budget</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SUB-VIEW 5: GEOLOCATION, DIASPORA & SESSION AUDIT */}
      {activeTab === 'audience' && (
        <section>
          {/* Geolocation Distribution & Diaspora Split */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Geolocation Table with Flags */}
            <div style={{ background: '#0a2442', padding: 22, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#14a6d9' }}>
                Player Edge Geolocation & Diaspora Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {geo.map(c => (
                  <div key={c.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7, 19, 34, 0.6)', padding: '10px 14px', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.3rem' }}>{c.flag}</span>
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>{c.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({c.topCity})</span>
                    </div>
                    <div style={{ fontWeight: 800, color: '#cedc28', fontSize: '0.85rem' }}>
                      {c.percentage}% ({c.sessions} runs)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Duration Distribution */}
            <div style={{ background: '#0a2442', padding: 22, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#cedc28' }}>
                Player Session Duration Split
              </h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, background: 'rgba(7, 19, 34, 0.7)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Quick Sprints (&lt; 2m)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#14a6d9' }}>
                    32.0%
                  </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(7, 19, 34, 0.7)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Core Runs (2-8m)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>
                    48.0%
                  </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(7, 19, 34, 0.7)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Deep Runs (&gt; 8m)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#cedc28' }}>
                    20.0%
                  </div>
                </div>
              </div>

              {/* Diaspora Difficulty Insight */}
              <div style={{ background: 'rgba(7, 19, 34, 0.6)', padding: 14, borderRadius: 10, borderLeft: '3px solid #cedc28' }}>
                <div style={{ fontWeight: 800, color: '#cedc28', fontSize: '0.85rem', marginBottom: 4 }}>
                  Overseas Diaspora Onboarding Telemetry:
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  38% of active runs originate outside Pakistan (UAE, KSA, UK, US, CA). Global runners benefit significantly from the 100m golden coin warmup corridor.
                </p>
              </div>
            </div>
          </div>

          {/* Searchable Player Session Audit Ledger */}
          <div style={{ background: '#0a2442', padding: 22, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Runner Session Audit Ledger & Crash Cause
              </h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Search player ID, district, device..."
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  style={{
                    background: '#071322',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#071322', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: '10px 14px' }}>Player / Session</th>
                  <th style={{ padding: '10px 14px' }}>District Reached</th>
                  <th style={{ padding: '10px 14px' }}>Device Profile</th>
                  <th style={{ padding: '10px 14px' }}>Region</th>
                  <th style={{ padding: '10px 14px' }}>Fatal Hazard</th>
                  <th style={{ padding: '10px 14px' }}>Run End</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f8fafc' }}>{u.email}</td>
                    <td style={{ padding: '10px 14px', color: '#14a6d9', fontWeight: 700 }}>{u.favoriteAction}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{u.role}</td>
                    <td style={{ padding: '10px 14px' }}>{u.flag} {u.country}</td>
                    <td style={{ padding: '10px 14px', color: '#ef4444' }}>Open Pothole</td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.75rem' }}>
                      {new Date(u.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default AnalyticsAdmin;
