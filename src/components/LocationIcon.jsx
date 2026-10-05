import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationIcon = ({ size = '1.1em', className = '', style = {} }) => {
  const defaultStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ef4444',
    filter: 'drop-shadow(0 3px 6px rgba(239, 68, 68, 0.45))'
  };

  return (
    <span 
      className={`location-pin-icon ${className}`}
      style={Object.assign({}, defaultStyle, style)}
    >
      <FaMapMarkerAlt style={{ fontSize: size }} />
    </span>
  );
};

export default LocationIcon;
