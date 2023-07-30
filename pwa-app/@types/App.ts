import { NextPageContext } from 'next';
import { AppRootStore } from '@/configureStore';

declare global {
  type AppTheme = 'facility' | 'industry' | 'medical' | 'food';
  type AppInitialProps = NextPageContext & { store: AppRootStore };
  type ApiPagination = {
    pageCount?: number;
    page?: number;
    currentPage?: number;
    take?: number;
    resultCount?: number;
  }
}
