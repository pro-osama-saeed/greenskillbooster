import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        // Allow ESC to close inputs
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // Global shortcuts
      switch (e.key) {
        case '/':
          e.preventDefault();
          // Focus search input if available
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;
        
        case 'Escape':
          e.preventDefault();
          // Close any open modals or dialogs
          const closeButton = document.querySelector('[role="dialog"] button[aria-label*="Close"], [role="dialog"] button:has(svg)') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
          break;

        // Navigation shortcuts with Alt key
        case 'h':
          if (e.altKey) {
            e.preventDefault();
            navigate('/');
          }
          break;
        
        case 'l':
          if (e.altKey) {
            e.preventDefault();
            navigate('/lessons');
          }
          break;
        
        case 'c':
          if (e.altKey) {
            e.preventDefault();
            navigate('/community');
          }
          break;
        
        case 'b':
          if (e.altKey) {
            e.preventDefault();
            navigate('/badges');
          }
          break;
        
        case 'd':
          if (e.altKey) {
            e.preventDefault();
            navigate('/dashboard');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
};
