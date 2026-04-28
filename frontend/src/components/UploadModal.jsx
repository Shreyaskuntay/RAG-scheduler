import React from 'react';

/**
 * Simple modal shown while the CSV is being ingested.
 * Conditional rendering pattern: the parent decides whether to mount it.
 */
export default function UploadModal({ message = 'Loading schedule…' }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="spinner" />
        <p>{message}</p>
        <small>This can take a few seconds while embeddings are computed.</small>
      </div>
    </div>
  );
}
