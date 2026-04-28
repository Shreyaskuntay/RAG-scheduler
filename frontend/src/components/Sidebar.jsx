import React, { useRef } from 'react';

/**
 * Sidebar with the upload button and basic backend status.
 * Pure presentational component - all state is lifted to <App />.
 */
export default function Sidebar({
  vectorstoreReady,
  onUploadFile,
  isUploading,
  onClearChat,
}) {
  const fileInputRef = useRef(null);

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
    // Reset so selecting the same file again still triggers onChange.
    e.target.value = '';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h1>📚 Schedule RAG</h1>
        <p className="sidebar__subtitle">Your course schedule assistant</p>
      </div>

      <div className="sidebar__section">
        <button
          className="btn btn--primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading…' : '📤 Upload CSV'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          hidden
          onChange={handleFileSelected}
        />
      </div>

      <div className="sidebar__section">
        <div className="status-pill" data-ready={vectorstoreReady}>
          <span className="status-pill__dot" />
          {vectorstoreReady ? 'Schedule loaded' : 'No schedule yet'}
        </div>
      </div>

      <div className="sidebar__section">
        <button className="btn btn--ghost" onClick={onClearChat}>
          🧹 Clear chat
        </button>
      </div>

      <div className="sidebar__footer">
        <small>Built with React + FastAPI</small>
      </div>
    </aside>
  );
}
