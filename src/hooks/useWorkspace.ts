import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface WorkspaceFile {
  name: string;
  path: string;
  size_bytes: number;
}

export type WorkspaceError =
  | { type: 'NotFound'; message: string }
  | { type: 'PermissionDenied'; message: string }
  | { type: 'Unknown'; message: string };

export function useWorkspace() {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFolder = async (folderPath: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await invoke<WorkspaceFile[]>('scan_workspace_folder', { folderPath });
      setFiles(result);
    } catch (err) {
      const error = err as WorkspaceError;
      if (error.type === 'PermissionDenied') {
        setErrorMessage(`Access Denied: Please check OS permissions for "${folderPath}".`);
      } else if (error.type === 'NotFound') {
        setErrorMessage(`Not Found: Directory "${folderPath}" does not exist.`);
      } else {
        setErrorMessage('An unexpected error occurred while accessing workspace files.');
      }
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  return { files, errorMessage, loading, loadFolder };
}