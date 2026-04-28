import React from 'react';

/**
 * A single chat bubble.
 * Memoizing here would be a sensible micro-optimization for very long
 * chat histories - mention it if asked about performance.
 */
export default function MessageBubble({ message }) {
  const { role, text, sources, isError } = message;

  return (
    <div
      className={`bubble bubble--${role}${isError ? ' bubble--error' : ''}`}
    >
      <div className="bubble__text">{text}</div>

      {sources && sources.length > 0 && (
        <details className="bubble__sources">
          <summary>{sources.length} source{sources.length > 1 ? 's' : ''}</summary>
          <ul>
            {sources.map((src, i) => (
              <li key={i}>
                <code>
                  {typeof src === 'string'
                    ? src
                    : src.page_content ?? JSON.stringify(src)}
                </code>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
