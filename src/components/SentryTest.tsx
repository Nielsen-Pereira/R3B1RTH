import React from 'react';
import * as Sentry from "@sentry/react";

export function SentryTest() {
  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <button 
        onClick={() => { throw new Error("Sentry R3B1RTH test error"); }}
        style={{ padding: '10px', background: '#ff0000', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Test Error
      </button>
      <button 
        onClick={() => Sentry.captureMessage("Sentry test message", "info")}
        style={{ padding: '10px', background: '#0000ff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}
      >
        Test Message
      </button>
    </div>
  );
}
