import React, { FC } from 'react';
import loader from '../../assets/svg/eclipse.svg';

interface PreloaderProps {
  isLoading: boolean;
  children?: React.ReactNode;
}

const Preloader: FC<PreloaderProps> = ({ isLoading, children }) => {
  return (
    <div>
      {isLoading && <img src={loader} alt="imgAltText" />}
      {children}
    </div>
  );
};

export default Preloader;