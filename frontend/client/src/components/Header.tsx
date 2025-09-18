import React from 'react';

interface HeaderProps {
  onResetClick: () => void;
  allowReset: boolean;
  resetPending?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onResetClick, allowReset, resetPending = false }) => {
  return (
    <header className="bg-white border-b-2 border-neutral-200 shadow-sm">

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        <div className="flex items-center">
          <div className="text-[#FFD166] text-3xl mr-2">
            <span role="img" aria-label="math symbol" className="text-2xl">🧮</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 font-['Nunito']">MathBuddy</h1>
          <div className="hidden sm:block ml-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            AI Tutor
          </div>
        </div>

        {allowReset &&
          <div className="flex items-center">

          <button
            className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center transition-colors duration-200 disabled:opacity-50 shadow-sm"
            onClick={onResetClick}
            disabled={resetPending}
            aria-label="Start a new tutoring session"
          >
            {resetPending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                Resetting...
              </>
            ) : (
              <>
                <span className="mr-2">🔄</span>
                New Session
              </>
            )}
          </button>
        </div>
        }
      </div>
    </header>
  );
};

export default Header;
