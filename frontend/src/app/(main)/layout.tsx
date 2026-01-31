import { MainLayout } from '@/components/layout';
import { SearchModal } from '@/components/search';
import { BackToTop } from '@/components/common';

export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      {children}
      <SearchModal />
      <BackToTop />
    </MainLayout>
  );
}
