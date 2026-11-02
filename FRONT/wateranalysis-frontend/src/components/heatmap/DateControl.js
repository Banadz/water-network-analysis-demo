import { useState, useEffect } from 'react';

const DateControl = ({ onDateRangeChange, defaultRange }) => {
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);

  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      onDateRangeChange({ startDate, endDate });
    }
  }, [startDate, endDate, onDateRangeChange]);

  const handleReset = () => {
    setStartDate(defaultRange.startDate);
    setEndDate(defaultRange.endDate);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1000,
      background: 'white',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      minWidth: '250px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>📅 Période du Heatmap</h4>      
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
          Date de début:
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ width: '100%', padding: '4px', fontSize: '12px' }}
        />
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
          Date de fin:
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ width: '100%', padding: '4px', fontSize: '12px' }}
        />
      </div>
      
      <button
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '6px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        ↺ 5 dernières années
      </button>
    </div>
  );
};

export default DateControl;