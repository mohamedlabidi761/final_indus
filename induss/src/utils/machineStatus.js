export function getMachineStatus(temperature, vibration) {
  if (temperature > 100 || vibration > 80) return 'critical';
  if (temperature > 80 || vibration > 50) return 'warning';
  return 'normal';
} 