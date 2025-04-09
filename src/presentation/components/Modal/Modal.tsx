import { ReactNode } from 'react';
import style from './modal.module.scss';

interface ModalProps {
  children?: ReactNode;
  isOpen: boolean;
  toggle: () => void;
  className?: string;
}

export const Modal = ({
  children,
  isOpen,
  toggle,
  className = '',
}: ModalProps) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      toggle();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={style.modalOverlay} 
      onClick={toggle} 
      onKeyDown={handleKeyDown}
      data-testid="modal-overlay"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`${style.modalBox} ${className}`}
        data-testid="modal-content"
      >
        {children}
      </div>
    </div>
  );
};