import React, { useState } from 'react';

/**
 * Controlled input + send button.
 *
 * "Controlled component" is the standard React pattern: the input's value
 * lives in component state, not in the DOM. Worth naming explicitly in
 * an interview - it's the difference from vanilla JS form handling.
 */
export default function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    // Enter sends, Shift+Enter would be a newline (we use <input> so n/a here,
    // but the same pattern works for <textarea>).
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="input-bar">
      <input
        className="input-bar__field"
        type="text"
        placeholder={
          disabled
            ? 'Upload a CSV first to start chatting…'
            : 'Ask about your schedule…'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        className="btn btn--primary"
        onClick={submit}
        disabled={disabled || !text.trim()}
      >
        Send
      </button>
    </div>
  );
}
