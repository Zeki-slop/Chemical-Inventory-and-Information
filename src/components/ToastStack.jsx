import React, { useEffect, useState } from 'react';

// A minimal pub/sub so any component can trigger a toast via
// `import { pushToast } from './ToastStack.jsx'; pushToast('Saved!', 'success')`
// without needing a Context provider wrapping the whole app.
let listeners = [];
export function pushToast(message, variant = 'primary') {
  const toast = { id: crypto.randomUUID(), message, variant };
  listeners.forEach((fn) => fn(toast));
}

export default function ToastStack() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
      {toasts.map((t) => (
        <div key={t.id} className={`toast show text-bg-${t.variant} mb-2`} role="alert">
          <div className="d-flex">
            <div className="toast-body">{t.message}</div>
            <button
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
