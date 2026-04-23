import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Home, Upload, BarChart, Users, MapPin, LogOut } from 'lucide-react';
import FileImport from './FileImport';  // ← IMPORT THE NEW COMPONENT

// Initialize Supabase
const supabase = createClient(
  'YOUR_SUPABASE_URL',  // Replace with your Supabase URL
  'YOUR_SUPABASE_ANON_KEY'  // Replace with your Supabase anon key
);

/* ═══════════════════ MAIN APP COMPONENT ═══════════════════ */
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle successful file import
  const handleImportSuccess = (validRows, pickupType) => {
    console.log(`✅ Successfully imported ${validRows.length} ${pickupType} assignments`);
    // Optionally refresh your data or show notification
    alert(`✅ ${validRows.length} ${pickupType} assignments uploaded successfully!`);
  };

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // If not logged in, show login
  if (!user) {
    return <LoginPage supabase={supabase} />;
  }

  // Navigation items
  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'import', label: 'Daily Import', icon: Upload },  // ← NEW PAGE
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart },
    { id: 'map', label: 'Live Map', icon: MapPin },
  ];

  // Page components
  const pages = {
    dashboard: <DashboardPage />,
    import: <FileImport 
              supabase={supabase} 
              onImportSuccess={handleImportSuccess} 
            />,  // ← NEW COMPONENT
    assignments: <AssignmentsPage />,
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
        {/* Logo/Title */}
        <div style={{ padding: '0 24px', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
            PickupOS
          </h1>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
            Logistics Management
          </p>
        </div>

        {/* Navigation Items */}
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

        {/* User Info & Logout */}
        <div style={{ padding: '0 24px', borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 16px',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              background: '#fff',
              color: '#6B7280',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {pages[currentPage]}
      </div>
    </div>
  );
}

/* ═══════════════════ PLACEHOLDER COMPONENTS ═══════════════════ */
// Replace these with your actual components

function LoginPage({ supabase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#F9FAFB'
    }}>
      <div style={{
        background: '#fff',
        padding: 40,
        borderRadius: 12,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: 400
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: '#111827' }}>
          Login to PickupOS
        </h2>
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 16,
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              fontSize: 14
            }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 24,
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              fontSize: 14
            }}
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              background: '#F59E0B',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Dashboard</h2>
      <p style={{ color: '#6B7280' }}>Your dashboard content here</p>
    </div>
  );
}

function AssignmentsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Assignments</h2>
      <p style={{ color: '#6B7280' }}>View all assignments here</p>
    </div>
  );
}

function ReportsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Reports</h2>
      <p style={{ color: '#6B7280' }}>Generate reports here</p>
    </div>
  );
}

function MapPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Live Map</h2>
      <p style={{ color: '#6B7280' }}>Track riders in real-time here</p>
    </div>
  );
}
