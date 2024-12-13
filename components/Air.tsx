import React from 'react';

const Air: React.FC = () => {
  const grafanaSnapshotUrl = 'https://snapshots.raintank.io/dashboard/snapshot/rK9ovaLY7Kw6N0rph7NNKdhe6CPa5tKZ';

  return (
    <div id="Air" style={{ width: '100%', height: '100vh', overflow: 'hidden', marginTop: '10px' }}>
      {/* Air Monitor Section Content */}
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2rem', fontWeight: 'bold' }}>
        Air Monitor
      </h2>
      <iframe 
        src={grafanaSnapshotUrl} 
        title="Grafana Snapshot" 
        style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none' }} 
        allowFullScreen
      />
    </div>
  );
};

export default Air;
