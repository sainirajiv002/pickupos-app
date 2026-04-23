import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function FileImport({ supabase, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [pickupType, setPickupType] = useState('SDD');
  const [validationResult, setValidationResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const REQUIRED_COLUMNS = [
    'client_name', 'rider_name', 'rider_id', 'pickup_type',
    'cutoff', 'client_category', 'vehicle_no', 'lat_long'
  ];

  const VALID_CATEGORIES = [
    'Myntra PPMP', 'PPMP Myntra', 'C1 Feeder', 'Other Feeders',
    'AIR NDD Feeders', 'Airport Feeder', 'FK/ MYN Feeders',
    'FM SDD Feeders', 'Large NDD Feeders', 'NDD Feeders',
    'C1 Feeder (SDD)', 'C1 Feeder(Air NDD)', 'C1 Feeder (Intra&zonal)'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setValidationResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      row._rowNumber = index + 2;
      return row;
    });
  };

  const validateRow = (row, rowNum) => {
    const errors = [];

    REQUIRED_COLUMNS.forEach(col => {
      if (!row[col] || row[col].trim() === '') {
        errors.push(`Missing ${col}`);
      }
    });

    if (row.pickup_type && !['SDD', 'AIR', 'NDD'].includes(row.pickup_type.toUpperCase())) {
      errors.push('Invalid pickup_type (must be SDD, AIR, or NDD)');
    }

    if (row.client_category && !VALID_CATEGORIES.includes(row.client_category)) {
      errors.push(`Invalid client_category: "${row.client_category}"`);
    }

    if (row.lat_long) {
      const latLongPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
      if (!latLongPattern.test(row.lat_long)) {
        errors.push('Invalid lat_long format (should be: latitude,longitude)');
      }
    }

    return errors;
  };

  const handleValidate = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    const text = await file.text();
    const rows = parseCSV(text);

    const headers = text.trim().split('\n')[0].split(',').map(h => h.trim());
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      setValidationResult({
        success: false,
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        validRows: [],
        errorRows: []
      });
      setUploading(false);
      return;
    }

    const validRows = [];
    const errorRows = [];

    rows.forEach(row => {
      const errors = validateRow(row, row._rowNumber);
      if (errors.length === 0) {
        validRows.push(row);
      } else {
        errorRows.push({ ...row, errors: errors.join('; ') });
      }
    });

    setValidationResult({
      success: errorRows.length === 0,
      message: errorRows.length === 0
        ? `✅ All ${validRows.length} rows are valid!`
        : `⚠️ ${validRows.length} valid, ${errorRows.length} errors found`,
      validRows,
      errorRows
    });

    setUploading(false);

    if (errorRows.length === 0 && validRows.length > 0) {
      await uploadToSupabase(validRows);
    }
  };

  const uploadToSupabase = async (validRows) => {
    try {
      setUploading(true);

      const { data: batchData, error: batchError } = await supabase
        .from('upload_batches')
        .insert([{
          pickup_type: pickupType,
          total_records: validRows.length,
          uploaded_by: 'system',
          status: 'completed'
        }])
        .select()
        .single();

      if (batchError) throw batchError;

      const assignmentsToInsert = validRows.map(row => ({
        batch_id: batchData.id,
        client_name: row.client_name,
        rider_name: row.rider_name,
        rider_id: row.rider_id,
        pickup_type: row.pickup_type,
        cutoff: row.cutoff,
        client_category: row.client_category,
        vehicle_no: row.vehicle_no,
        lat_long: row.lat_long,
        status: 'pending'
      }));

      const { error: assignmentError } = await supabase
        .from('assignments')
        .insert(assignmentsToInsert);

      if (assignmentError) throw assignmentError;

      alert(`✅ Successfully uploaded ${validRows.length} assignments!`);
      
      if (onImportSuccess) {
        onImportSuccess(validRows, pickupType);
      }

      setFile(null);
      setValidationResult(null);
      document.getElementById('csv-upload').value = '';

    } catch (error) {
      console.error('Upload error:', error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadErrorCSV = () => {
    if (!validationResult || validationResult.errorRows.length === 0) return;

    const headers = [...REQUIRED_COLUMNS, 'errors'];
    const csvContent = [
      headers.join(','),
      ...validationResult.errorRows.map(row =>
        headers.map(h => row[h] || '').join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upload_errors.csv';
    a.click();
  };

  const downloadTemplate = () => {
    const headers = REQUIRED_COLUMNS.join(',');
    const example = 'Myntra PPMP,John Doe,R001,SDD,10:00,Myntra PPMP,DL-01-AB-1234,28.7041,77.1025';
    const csvContent = `${headers}\n${example}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment_template.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daily Assignment Upload</h2>
              <p className="text-gray-500">Upload CSV file with rider assignments for SDD pickups</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Pickup Type
            </label>
            <div className="flex gap-3">
              {['SDD', 'AIR', 'NDD'].map(type => (
                <button
                  key={type}
                  onClick={() => setPickupType(type)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    pickupType === type
                      ? 'bg-amber-400 text-gray-900 shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleValidate}
              disabled={!file || uploading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Processing...' : 'Upload & Validate'}
            </button>
            <button
              onClick={downloadTemplate}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Template
            </button>
          </div>

          {validationResult && (
            <div className={`p-4 rounded-lg mb-6 ${
              validationResult.success ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                {validationResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${validationResult.success ? 'text-green-900' : 'text-amber-900'}`}>
                    {validationResult.message}
                  </p>
                  {validationResult.errorRows.length > 0 && (
                    <button
                      onClick={downloadErrorCSV}
                      className="mt-2 text-sm text-amber-700 hover:text-amber-900 flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download errors for fixing
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">📋 CSV Format</p>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Columns:</strong> {REQUIRED_COLUMNS.join(', ')}
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Categories:</strong> {VALID_CATEGORIES.slice(0, 3).join(', ')}, ...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
