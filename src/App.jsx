import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import FileImport from './FileImport';

// ═══════════════════ SUPABASE CONFIG ═══════════════════
const SUPABASE_URL = 'https://ivkektiowfhmvkjwzgcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2VrdGlvd2ZobXZrand6Z2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTAzMDEsImV4cCI6MjA5MjMyNjMwMX0.5wt7bNO5Z0mFVTHi6X8Tj8nySy6WjAWCQ8z9cIKmUQw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ═══════════════════ MAIN APP ═══════════════════ */
export default function App() {
  const handleImportSuccess = (validRows, pickupType) => {
    alert(`✅ Success! Uploaded ${validRows.length} ${pickupType} assignments to database!`);
    console.log('Uploaded assignments:', validRows);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 24, 
          fontWeight: 800,
          color: '#111827'
        }}>
          PickupOS - Daily Import
        </h1>
        <p style={{ 
          margin: '4px 0 0 0', 
          fontSize: 14, 
          color: '#6B7280' 
        }}>
          Upload daily rider assignments
        </p>
      </div>

      {/* Main Content */}
      <div>
        <FileImport 
          supabase={supabase} 
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </div>
  );
}
