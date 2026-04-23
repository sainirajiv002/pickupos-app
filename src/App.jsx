import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Home, Upload, Users, BarChart, MapPin } from 'lucide-react';
import FileImport from './FileImport';

// ═══════════════════ SUPABASE CONFIG ═══════════════════
const supabase = createClient(
  'https://ivkektiowfhmvkjwzgcz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2VrdGlvd2ZobXZrand6Z2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTAzMDEsImV4cCI6MjA5MjMyNjMwMX0.5wt7bNO5Z0mFVTHi6X8Tj8nySy6WjAWCQ8z9cIKmUQw'
);

/* ═══════════════════ MAIN APP ═══════════════════ */
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleImportSuccess = (validRows, pickupType) => {
    alert(`✅ Successfully uploaded ${validRows.length} ${pickupType} assignments!`);
    // Refresh assignments if on that page
    if (currentPage === 'assignments') {
      setCurrentPage('assignments-refresh');
      setTimeout(() => setCurrentPage('assignments'), 100);
    }
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'import', label: 'Daily Import', icon: Upload },
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart },
    { id: 'map', label: 'Live Map', icon: MapPin },
  ];

  const pages = {
    dashboard: <Dashboard supabase={supabase} />,
    import: <FileImport supabase={supabase} onImportSuccess={handleImportSuccess} />,
    assignments: <Assignments supabase={supabase} />,
    reports: <Reports supabase={supabase} />,
    map: <LiveMap />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F3F4F6' }}>
      {/* Sidebar */}
      <div style={{
        width: 256,
        background: '#fff',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            margin: 0,
            color: '#111827',
            letterSpacing: '-0.5px'
          }}>
            PickupOS
          </h1>
          <p style={{ 
            fontSize: 13, 
            color: '#6B7280', 
            margin: '4px 0 0 0',
            fontWeight: 500
          }}>
            Logistics Management
          </p>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '16px 0' }}>
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  border: 'none',
                  background: isActive ? '#F9FAFB' : 'transparent',
                  color: isActive ? '#111827' : '#6B7280',
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #111827' : '3px solid transparent',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F9FAFB';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6B7280';
                  }
                }}
              >
                <Icon size={20} strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid #E5E7EB',
          fontSize: 13,
          color: '#6B7280'
        }}>
          Logged in as Admin
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', background: '#F3F4F6' }}>
        {pages[currentPage] || pages.dashboard}
      </div>
    </div>
  );
}

/* ═══════════════════ DASHBOARD PAGE ═══════════════════ */
function Dashboard({ supabase }) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('status')
        .gte('assigned_at', new Date().toISOString().split('T')[0]);

      if (assignments) {
        setStats({
          total: assignments.length,
          active: assignments.filter(a => a.status === 'active').length,
          completed: assignments.filter(a => a.status.includes('completed') || a.status.includes('reached_origin')).length,
          pending: assignments.filter(a => a.status === 'active').length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ 
          fontSize: 28, 
          fontWeight: 700, 
          margin: 0, 
          marginBottom: 8,
          color: '#111827'
        }}>
          Dashboard
        </h2>
        <p style={{ 
          fontSize: 15, 
          color: '#6B7280', 
          margin: 0 
        }}>
          Overview of today's operations
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 20 
      }}>
        <StatCard 
          title="Total Assignments" 
          value={stats.total} 
          color="#3B82F6"
          bg="#EFF6FF"
        />
        <StatCard 
          title="Active Riders" 
          value={stats.active} 
          color="#10B981"
          bg="#ECFDF5"
        />
        <StatCard 
          title="Completed" 
          value={stats.completed} 
          color="#F59E0B"
          bg="#FEF3C7"
        />
        <StatCard 
          title="Pending" 
          value={stats.pending} 
          color="#EF4444"
          bg="#FEE2E2"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, color, bg }) {
  return (
    <div style={{
      background: '#fff',
      padding: 24,
      borderRadius: 12,
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      <div style={{ 
        fontSize: 13, 
        color: '#6B7280', 
        marginBottom: 12,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: 36, 
        fontWeight: 700, 
        color,
        fontVariantNumeric: 'tabular-nums'
      }}>
        {value}
      </div>
    </div>
  );
}

/* ═══════════════════ ASSIGNMENTS PAGE ═══════════════════ */
function Assignments({ supabase }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .order('assigned_at', { ascending: false })
        .limit(100);

      setAssignments(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24 
      }}>
        <div>
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 700, 
            margin: 0, 
            marginBottom: 8,
            color: '#111827'
          }}>
            Assignments
          </h2>
          <p style={{ fontSize: 15, color: '#6B7280', margin: 0 }}>
            {assignments.length} total assignments
          </p>
        </div>
        <button
          onClick={fetchAssignments}
          style={{
            padding: '10px 20px',
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ 
          background: '#fff', 
          padding: 60, 
          borderRadius: 12,
          textAlign: 'center',
          color: '#6B7280'
        }}>
          Loading...
        </div>
      ) : assignments.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: 60,
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6B7280', margin: 0, fontSize: 15 }}>
            No assignments found. Upload some using Daily Import!
          </p>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rider</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cutoff</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, idx) => (
                <tr key={a.id} style={{ 
                  borderBottom: idx < assignments.length - 1 ? '1px solid #F3F4F6' : 'none'
                }}>
                  <td style={{ padding: '16px', fontSize: 14, color: '#111827', fontWeight: 500 }}>{a.client_name}</td>
                  <td style={{ padding: '16px', fontSize: 14, color: '#6B7280' }}>{a.rider_name || a.rider_id}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: a.pickup_type === 'SDD' ? '#DBEAFE' : a.pickup_type === 'AIR' ? '#FEF3C7' : '#E0E7FF',
                      color: a.pickup_type === 'SDD' ? '#1E40AF' : a.pickup_type === 'AIR' ? '#92400E' : '#3730A3'
                    }}>
                      {a.pickup_type}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#ECFDF5',
                      color: '#065F46'
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: 14, color: '#6B7280' }}>{a.cutoff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ REPORTS PAGE ═══════════════════ */
function Reports({ supabase }) {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ 
        fontSize: 28, 
        fontWeight: 700, 
        margin: 0, 
        marginBottom: 8,
        color: '#111827'
      }}>
        Reports
      </h2>
      <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32 }}>
        Generate and download reports
      </p>

      <div style={{
        background: '#fff',
        padding: 60,
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6B7280', margin: 0, fontSize: 15 }}>
          Reports feature coming soon
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════ LIVE MAP PAGE ═══════════════════ */
function LiveMap() {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ 
        fontSize: 28, 
        fontWeight: 700, 
        margin: 0, 
        marginBottom: 8,
        color: '#111827'
      }}>
        Live Map
      </h2>
      <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32 }}>
        Track riders in real-time
      </p>

      <div style={{
        background: '#fff',
        padding: 60,
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        textAlign: 'center',
        minHeight: 500
      }}>
        <p style={{ color: '#6B7280', margin: 0, fontSize: 15 }}>
          Live map view coming soon
        </p>
      </div>
    </div>
  );
}
