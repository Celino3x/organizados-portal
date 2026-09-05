import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando...</p>
      </div>
    </div>
  );
};

export default Loading;