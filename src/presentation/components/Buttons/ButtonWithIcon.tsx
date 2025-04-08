import React, { CSSProperties } from 'react';
import { ButtonError } from '../../../shared/utils/errorHandling';

interface ButtonWithIconProps {
  icon: string;
  altText: string;
  style?: CSSProperties;
  onClick?: () => void;
  id:string;
}

const ButtonWithIcon: React.FC<ButtonWithIconProps> = ({ icon, altText, style, onClick, id}) => {
  if (!icon || !altText) {
    throw new ButtonError('ButtonWithIcon component requires both "icon" and "altText" props.');
  }

  return (
    <div style={style} data-testid="button-with-icon">
      <button type="button" onClick={onClick} style={{ border: 'none', background: 'none', padding: 0, margin: 0, cursor: 'pointer' }}>
        <img src={icon} alt={altText} data-testid={`icon-button-${id}`}/>
      </button>
    </div>
  );
};

export default ButtonWithIcon;