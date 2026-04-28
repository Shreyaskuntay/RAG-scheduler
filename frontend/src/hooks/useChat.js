import { useState, useCallback } from 'react';
import { askQuestion } from '../services/api';

/**
 * Custom hook that owns all chat-related state and side effects.
 *
 * Why a custom hook?
 *   - Keeps <App /> small and declarative.
 *   - Makes the chat logic reusable and unit-testable independently of UI.
 *   - Demonstrates composition of React primitives (useState + useCallback).
 */
export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! Upload your course schedule CSV, then ask me anything about it.",
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Optimistically add the user message so the UI feels instant.
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);
    setError(null);

    try {
      const data = await askQuestion(trimmed);
      const botMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.response ?? '(no response)',
        sources: data.source_documents ?? [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ Error: ${err.message}`,
          isError: true,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  }, []);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Chat cleared. Ask me anything about your schedule.',
      },
    ]);
    setError(null);
  }, []);

  return { messages, isAsking, error, sendMessage, resetChat };
}
