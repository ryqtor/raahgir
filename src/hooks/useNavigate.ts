import { useState, useEffect } from 'react';

type Page = 'landing' | 'login' | 'register' | 'dashboard';

export function useNavigate() {
  const navigate = (page: Page) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
  };

  return navigate;
}

export function useCurrentPage() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    const handler = (e: CustomEvent<Page>) => {
      setCurrentPage(e.detail);
    };

    window.addEventListener('navigate' as any, handler);
    return () => window.removeEventListener('navigate' as any, handler);
  }, []);

  return currentPage;
}
