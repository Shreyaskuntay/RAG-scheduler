import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import InputBar from './components/InputBar.jsx';
import UploadModal from './components/UploadModal.jsx';
import { useChat } from './hooks/useChat';
import { getStatus, uploadCsv } from './services/api';

/**
 * Top-level component.
 *
 * Owns:
 *   - vectorstoreReady   (whether the backend already has an indexed CSV)
 *   - isUploading        (modal visibility while ingesting)
 *   - chat state         (delegated to the useChat hook)
 *
 * Component tree:
 *   <App>
 *     ├── <Sidebar />          upload + status + clear
 *     └── main
 *         ├── <ChatWindow />   transcript
 *         └── <InputBar />     controlled input
 *     └── <UploadModal />      conditional overlay
 */
export default function App() {
  const [vectorstoreReady, setVectorstoreReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const { messages, isAsking, sendMessage, resetChat } = useChat();

  // On mount: check whether the backend already has a vectorstore so that
  // returning users can chat immediately without re-uploading the CSV.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getStatus();
        if (!cancelled) setVectorstoreReady(Boolean(data.vectorstore_exists));
      } catch (err) {
        if (!cancelled) setStatusError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      await uploadCsv(file);
      setVectorstoreReady(true);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar
        vectorstoreReady={vectorstoreReady}
        onUploadFile={handleUpload}
        isUploading={isUploading}
        onClearChat={resetChat}
      />

      <main className="main">
        {statusError && (
          <div className="banner banner--warn">
            Couldn't reach backend ({statusError}). Make sure FastAPI is running
            at <code>localhost:8000</code>.
          </div>
        )}

        <ChatWindow messages={messages} isAsking={isAsking} />
        <InputBar
          onSend={sendMessage}
          disabled={!vectorstoreReady || isAsking}
        />
      </main>

      {isUploading && <UploadModal message="Processing your CSV…" />}
    </div>
  );
}
