import React, { useState } from 'react';
import { useWorkspace } from '../hooks/useWorkspace';

export const WorkspaceView: React.FC = () => {
  const [inputPath, setInputPath] = useState('');
  const { files, errorMessage, loading, loadFolder } = useWorkspace();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPath.trim()) {
      loadFolder(inputPath.trim());
    }
  };

  return (
    <div className="workspace-container" style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h2>Local Workspace Scanner</h2>
      <form onSubmit={handleScan} style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="/path/to/trust/workspace"
          value={inputPath}
          onChange={(e) => setInputPath(e.target.value)}
          style={{ width: '320px', padding: '8px', marginRight: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Scanning...' : 'Scan Directory'}
        </button>
      </form>

      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          {errorMessage}
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {files.map((file) => (
          <li
            key={file.path}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{file.name}</span>
            <span style={{ color: '#6b7280' }}>{(file.size_bytes / 1024).toFixed(1)} KB</span>
          </li>
        ))}
      </ul>
    </div>
  );
};