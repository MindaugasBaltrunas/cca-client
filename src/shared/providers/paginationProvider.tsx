import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PaginationContextType {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
}

const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

interface PaginationProviderProps {
  children: ReactNode;
}

export const PaginationProvider: React.FC<PaginationProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <PaginationContext.Provider value={{
      currentPage,
      totalPages,
      setCurrentPage,
      setTotalPages
    }}>
      {children}
    </PaginationContext.Provider>
  );
};

export const usePaginationContext = () => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePaginationContext must be used within a PaginationProvider');
  }
  return context;
};