import { getStatusColor, getStatusLabel } from '../utils/percentage';

const PercentageCard = ({ subject, total, present, absent, percentage }) => {
  const color = getStatusColor(percentage);
  const label = getStatusLabel(percentage);

  const colorMap = {
    success: { text: '#34d399', bar: 'success' },
    warning: { text: '#fbbf24', bar: 'warning' },
    danger: { text: '#f87171', bar: 'danger' },
  };
  const c = colorMap[color];

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{subject?.subjectName}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{subject?.subjectCode}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c.text, lineHeight: 1 }}>{percentage}%</div>
          <div style={{ fontSize: '0.72rem', color: c.text, marginTop: '4px', fontWeight: 600 }}>{label}</div>
        </div>
      </div>
      <div className="percentage-bar-container">
        <div className={`percentage-bar ${c.bar}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>✅ Present: <strong style={{ color: '#34d399' }}>{present}</strong></span>
        <span>❌ Absent: <strong style={{ color: '#f87171' }}>{absent}</strong></span>
        <span>📚 Total: <strong style={{ color: 'var(--text-primary)' }}>{total}</strong></span>
      </div>
    </div>
  );

};

export default PercentageCard;
