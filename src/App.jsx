import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Home, Upload, BarChart, Users, MapPin, LogOut } from 'lucide-react';
import FileImport from './FileImport';

// ═══════════════════ SUPABASE CONFIG ═══════════════════
const SUPABASE_URL = 'https://ivkektiowfhmvkjwzgcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2VrdGlvd2ZobXZrand6Z2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTAzMDEsImV4cCI6MjA5MjMyNjMwMX0.5wt7bNO5Z0mFVTHi6X8Tj8nySy6WjAWCQ8z9cIKmUQw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ═══════════════════ MAIN APP COMPONENT ═══════════════════ */
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleImportSuccess = (validRows, pickupType) => {
    alert(`✅ Success! Uploaded ${validRows.length} ${pickupType} assignments!`);
  };

  // Navigation items
  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'import', label: 'Daily Import', icon: Upload },
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart },
    { id: 'map', label: 'Live Map', icon: MapPin },
  ];

  // Page components
  const pages = {
    dashboard: <DashboardPage />,
    import: <FileImport supabase={supabase} onImportSuccess={handleImportSuccess} />,
    assignments: <AssignmentsPage supabase={supabase} />,
    reports: <ReportsPage />,
    map: <MapPage />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F9FAFB' }}>
      {/* Sidebar Navigation */}
      <div style={{
        width: 250,
        background: '#fff',
        borderRight: '1px solid #E5E7EB',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
            PickupOS
          </h1>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
            Logistics Management
          </p>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1 }}>
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  border: 'none',
                  background: isActive ? '#FEF3C7' : 'transparent',
                  color: isActive ? '#92400E' : '#6B7280',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.2s',
                  borderLeft: isActive ? '3px solid #F59E0B' : '3px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* User Info */}
        <div style={{ padding: '0 24px', borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
            Logged in as Admin
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {pages[currentPage]}
      </div>
    </div>
  );
}

/* ═══════════════════ PAGE COMPONENTS ═══════════════════ */

function DashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
        Dashboard
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 24 }}>
        Overview of today's operations
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <StatCard title="Total Assignments" value="0" color="#3B82F6" />
        <StatCard title="Active Riders" value="0" color="#10B981" />
        <StatCard title="Completed" value="0" color="#F59E0B" />
        <StatCard title="Pending" value="0" color="#EF4444" />
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      background: '#fff',
      padding: 20,
      borderRadius: 12,
      border: '1px solid #E5E7EB'
    }}>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function AssignmentsPage({ supabase }) {
  const [assignments, setAssignments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('assigned_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching assignments:', error);
    } else {
      setAssignments(data || []);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            Assignments
          </h2>
          <p style={{ color: '#6B7280', margin: 0 }}>
            View all rider assignments
          </p>
        </div>
        <button
          onClick={fetchAssignments}
          style={{
            padding: '10px 20px',
            background: '#F59E0B',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
          Loading assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: 40,
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6B7280', margin: 0 }}>
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
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Client</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Rider</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Type</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Cutoff</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment, idx) => (
                <tr key={assignment.id} style={{ borderBottom: idx < assignments.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                  <td style={{ padding: 12, fontSize: 14, color: '#111827' }}>{assignment.client_name}</td>
                  <td style={{ padding: 12, fontSize: 14, color: '#111827' }}>{assignment.rider_name || assignment.rider_id}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: assignment.pickup_type === 'SDD' ? '#DBEAFE' : assignment.pickup_type === 'AIR' ? '#FEF3C7' : '#E0E7FF',
                      color: assignment.pickup_type === 'SDD' ? '#1E40AF' : assignment.pickup_type === 'AIR' ? '#92400E' : '#3730A3'
                    }}>
                      {assignment.pickup_type}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 14 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: assignment.status === 'active' ? '#ECFDF5' : '#F3F4F6',
                      color: assignment.status === 'active' ? '#065F46' : '#6B7280'
                    }}>
                      {assignment.status}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 14, color: '#6B7280' }}>{assignment.cutoff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
        Reports
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 24 }}>
        Generate and view reports
      </p>

      <div style={{
        background: '#fff',
        padding: 40,
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6B7280', margin: 0 }}>
          Reports feature coming soon!
        </p>
      </div>
    </div>
  );
}

function MapPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
        Live Map
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 24 }}>
        Track riders in real-time
      </p>

      <div style={{
        background: '#fff',
        padding: 40,
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        textAlign: 'center',
        height: 500
      }}>
        <p style={{ color: '#6B7280', margin: 0 }}>
          Map view coming soon!
        </p>
      </div>
    </div>
  );
}
