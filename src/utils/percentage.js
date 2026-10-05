export const calcPercentage = (present, total) => {
  if (!total) return 0;
  return parseFloat(((present / total) * 100).toFixed(2));
};

export const getStatusColor = (pct) => {
  if (pct >= 75) return 'success';
  if (pct >= 60) return 'warning';
  return 'danger';
};

export const getStatusLabel = (pct) => {
  if (pct >= 75) return 'Good Standing';
  if (pct >= 60) return 'At Risk';
  return 'Below 75% ⚠️';
};
