import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ShopKart` : 'ShopKart';
    return () => { document.title = 'ShopKart'; };
  }, [title]);
}