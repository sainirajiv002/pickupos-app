import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';

/* ═══════════════════ FILE IMPORT WITH SUPABASE ═══════════════════ */
export default function FileImport({ supabase, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [pickupType, setPickupType] = useState("SDD");

  const VALID_CATEGORIES = [
    "Myntra PPMP", "PPMP Myntra", "C1 Feeder", "Other Feeders", "AIR NDD Feeders",
    "Airport Feeder", "FK/ MYN Feeders", "FM SDD Feeders",
    "Large NDD Feeders", "NDD Feeders", "C1 Feeder (SDD)",
    "C1 Feeder(Air NDD)", "C1 Feeder (Intra&zonal)"
  ];

  const fetchExistingData = async () => {
    try {
      const { data: clients } = await supabase
        .from('geofences')
        .select('name, id')
        .eq('type', 'client');
      return { clients: clients || [] };
    } catch (error) {
      console.error('Error fetching data:', error);
      return { clients: [] };
    }
  };

  const validateRow = (row, rowIndex, existingClients) => {
    const errors = [];

    if (!row.client_name || !row.client_name.trim()) {
      errors.push(`Row ${rowIndex}: Client name is required`);
    } else if (existingClients.length > 0) {
      const clientExists = existingClients.find(c =>
        c.name.toLowerCase().trim() === row.client_name.toLowerCase().trim()
      );
      if (!clientExists) {
        errors.push(`Row ${rowIndex}: Client "${row.client_name}" not found`);
      }
    }

    if (!row.rider_name && !row.rider_id) {
      errors.push(`Row ${rowIndex}: Rider name or ID is required`);
    }

    if (!row.pickup_type) {
      errors.push(`Row ${rowIndex}: Pickup type is required`);
    } else if (!["SDD", "NDD", "AIR"].includes(row.pickup_type.toUpperCase())) {
      errors.push(`Row ${rowIndex}: Invalid pickup type "${row.pickup_type}"`);
    }

    if (!row.cutoff) {
      errors.push(`Row ${rowIndex}: Cutoff time is required`);
    } else {
      const cutoffPattern = /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/;
      if (!cutoffPattern.test(row.cutoff.trim())) {
        errors.push(`Row ${rowIndex}: Invalid cutoff format "${row.cutoff}"`);
      }
    }

    if (!row.client_category) {
      errors.push(`Row ${rowIndex}: Client category is required`);
    } else if (!VALID_CATEGORIES.includes(row.client_category.trim())) {
      errors.push(`Row ${rowIndex}: Invalid category "${row.client_category}"`);
    }

    if (!row.vehicle_no || !row.vehicle_no.trim()) {
      errors.push(`Row ${rowIndex}: Vehicle number is required`);
    }

    if (!row.lat_long) {
      errors.push(`Row ${rowIndex}: Lat/Long is required`);
    } else {
      const coords = row.lat_long.split(',').map(c => c.trim());
      if (coords.length !== 2) {
        errors.push(`Row ${rowIndex}: Invalid Lat/Long format "${row.lat_long}"`);
      } else {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          errors.push(`Row ${rowIndex}: Invalid coordinates "${row.lat_long}"`);
        }
      }
    }

    return errors;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setResult(null);
  };

  const processFile = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const { clients: existingClients } = await fetchExistingData();
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        setResult({
          success: false,
          message: "File is empty or has no data rows",
          totalRows: 0,
          validRows: 0,
          errorRows: 0,
          errors: ["No data found in file"]
        });
        setUploading(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
      const rows = [];
      const allErrors = [];
      const validRows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        const rowErrors = validateRow(row, i + 1, existingClients);
        if (rowErrors.length > 0) {
          allErrors.push(...rowErrors);
          rows.push({ ...row, errors: rowErrors });
        } else {
          validRows.push(row);
          rows.push({ ...row, errors: [] });
        }
      }

      if (validRows.length > 0) {
        const batchId = crypto.randomUUID();

        const assignments = validRows.map(row => {
          const [lat, lng] = row.lat_long.split(',').map(c => parseFloat(c.trim()));
          return {
            client_name: row.client_name,
            rider_name: row.rider_name || null,
            rider_id: row.rider_id || row.rider_name || 'UNKNOWN',
            pickup_type: row.pickup_type.toUpperCase(),
            cutoff: row.cutoff,
            client_category: row.client_category,
            vehicle_no: row.vehicle_no,
            lat,
            lng,
            status: 'active',
            upload_batch_id: batchId,
            uploaded_by: 'admin',
            upload_date: new Date().toISOString().split('T')[0]
          };
        });

        const { error: insertError } = await supabase
          .from('assignments')
          .insert(assignments);

        if (insertError) {
          console.error('Insert error:', insertError);
          // ✅ FIX: include totalRows/validRows/errorRows so UI grid renders correctly
          setResult({
            success: false,
            message: `❌ Database Error: ${insertError.message}`,
            totalRows: rows.length,
            validRows: 0,
            errorRows: rows.length,
            errors: [insertError.message]
          });
          setUploading(false);
          return;
        }

        await supabase.from('upload_batches').insert({
          id: batchId,
          pickup_type: pickupType,
          filename: file.name,
          total_rows: rows.length,
          valid_rows: validRows.length,
          error_rows: allErrors.length,
          errors: allErrors,
          uploaded_by: 'admin'
        });
      }

      if (allErrors.length === 0) {
        setResult({
          success: true,
          message: `✅ Success! All ${validRows.length} rows uploaded`,
          totalRows: rows.length,
          validRows: validRows.length,
          errorRows: 0
        });
        if (onImportSuccess) onImportSuccess(validRows, pickupType);
      } else {
        setResult({
          success: validRows.length > 0,
          message: validRows.length > 0
            ? `⚠️ Partial: ${validRows.length} valid, ${allErrors.length} errors`
            : `❌ Failed: ${allErrors.length} errors`,
          totalRows: rows.length,
          validRows: validRows.length,
          errorRows: allErrors.length,
          errors: allErrors,
          errorData: rows.filter(r => r.errors.length > 0)
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "❌ Error processing file",
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
        errors: [error.message]
      });
    }

    setUploading(false);
  };

  const downloadErrorFile = () => {
    if (!result || !result.errorData) return;
    const headers = ['Row', 'Client', 'Rider', 'Type', 'Cutoff', 'Category', 'Vehicle', 'LatLong', 'Errors'];
    const rows = result.errorData.map((row, idx) => [
      idx + 2,
      row.client_name || '',
      row.rider_name || row.rider_id || '',
      row.pickup_type || '',
      row.cutoff || '',
      row.client_category || '',
      row.vehicle_no || '',
      row.lat_long || '',
      row.errors.join('; ')
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `errors_${pickupType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const downloadTemplate = () => {
    const headers = ['client_name', 'rider_name', 'rider_id', 'pickup_type', 'cutoff', 'client_category', 'vehicle_no', 'lat_long'];
    const example = ['Rare Rabbit', 'Manveer Singh', 'R-101', 'SDD', '11:00-12:00', 'PPMP Myntra', 'DL-01-AB-1234', '28.424697,76.822903'];
    const csv = [headers, example].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'template_daily_assignments.csv';
    a.click();
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 8, color: "#111827" }}>
          📤 Daily Assignment Upload
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
          Upload CSV file with rider assignments for {pickupType} pickups
        </p>
      </div>

      {/* Pickup Type Selector */}
      <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #E5E7EB", marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8, display: "block" }}>
          Select Pickup Type
        </label>
        <div style={{ display: "flex", gap: 12 }}>
          {["SDD", "AIR", "NDD"].map(type => (
            <button
              key={type}
              onClick={() => setPickupType(type)}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: `2px solid ${pickupType === type ? "#F59E0B" : "#E5E7EB"}`,
                background: pickupType === type ? "#FEF3C7" : "#fff",
                color: pickupType === type ? "#92400E" : "#6B7280",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #E5E7EB", marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8, display: "block" }}>
            Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{
              // ✅ FIX: box-sizing prevents the input from overflowing its container
              // which was causing horizontal scroll and making sidebar tabs unclickable
              boxSizing: "border-box",
              width: "100%",
              padding: 12,
              border: "2px dashed #D1D5DB",
              borderRadius: 8,
              fontSize: 14,
              cursor: "pointer"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={processFile}
            disabled={!file || uploading}
            style={{
              padding: "12px 24px",
              background: file && !uploading ? "#F59E0B" : "#D1D5DB",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: file && !uploading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <Upload size={16} />
            {uploading ? "Processing..." : "Upload & Validate"}
          </button>

          <button
            onClick={downloadTemplate}
            style={{
              padding: "12px 24px",
              background: "#fff",
              color: "#374151",
              border: "1px solid #D1D5DB",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <Download size={16} />
            Template
          </button>
        </div>

        {file && (
          <div style={{ marginTop: 12, padding: 12, background: "#F9FAFB", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} />
              <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </div>
          </div>
        )}
      </div>

      {/* Result Panel */}
      {result && (
        <div style={{
          background: result.success ? "#ECFDF5" : "#FEF2F2",
          padding: 24,
          borderRadius: 12,
          border: `1px solid ${result.success ? "#10B981" : "#EF4444"}`
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: result.success ? "#065F46" : "#991B1B", display: "flex", alignItems: "center", gap: 8 }}>
            {result.success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            {result.message}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>{result.totalRows ?? 0}</div>
            </div>
            <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Valid</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#10B981" }}>{result.validRows ?? 0}</div>
            </div>
            <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Errors</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#EF4444" }}>{result.errorRows ?? 0}</div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <>
              <div style={{
                background: "#fff",
                padding: 16,
                borderRadius: 8,
                maxHeight: 200,
                overflow: "auto",
                marginBottom: 16
              }}>
                {result.errors.slice(0, 10).map((error, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: "#991B1B", marginBottom: 4 }}>
                    • {error}
                  </div>
                ))}
                {result.errors.length > 10 && (
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>
                    ... and {result.errors.length - 10} more
                  </div>
                )}
              </div>

              {result.errorData && (
                <button
                  onClick={downloadErrorFile}
                  style={{
                    padding: "10px 20px",
                    background: "#EF4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <Download size={16} />
                  Download Errors
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Format Guide */}
      <div style={{ background: "#F9FAFB", padding: 20, borderRadius: 12, marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#374151" }}>
          📋 CSV Format
        </div>
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
          <strong>Columns:</strong> client_name, rider_name, rider_id, pickup_type, cutoff, client_category, vehicle_no, lat_long
          <br /><strong>Categories:</strong> {VALID_CATEGORIES.join(', ')}
        </div>
      </div>
    </div>
  );
}
