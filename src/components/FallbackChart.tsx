import React from 'react';

export function FallbackChart() {
  return (
    <div style={{ width: '100%', height: '300px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <p>Fallback Chart - If you see this, the Chart component is not rendering</p>
    </div>
  );
}
