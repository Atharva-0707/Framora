import React from 'react';
import { Camera, Disc, Eye, Gauge, Zap } from 'lucide-react';

export const GearBadge = ({ type, value, highlight = false }) => {
  if (!value) return null;

  const getIcon = () => {
    switch (type) {
      case 'camera':
        return <Camera size={12} />;
      case 'lens':
        return <Disc size={12} />;
      case 'aperture':
        return <Eye size={12} />;
      case 'shutter':
        return <Gauge size={12} />;
      case 'iso':
        return <Zap size={12} />;
      default:
        return null;
    }
  };

  return (
    <span className={`gear-badge ${highlight ? 'highlight' : ''}`} title={`${type}: ${value}`}>
      {getIcon()}
      <span>{value}</span>
    </span>
  );
};

export default GearBadge;
