import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';

/**
 * Chat transcript area.
 * Uses a ref + useEffect to auto-scroll to the bottom whenever messages change -
 * a good talking point on imperative DOM access in React.
 */
export default function ChatWindow({ messages, isAsking }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  return (
    <div className="chat-window">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      {isAsking && (
        <div className="bubble bubble--assistant bubble--typing">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
