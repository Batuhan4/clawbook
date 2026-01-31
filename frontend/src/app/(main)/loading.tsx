import { Spinner } from '@/components/ui';

export default function MainLoading() {
  return (
    <div className="flex-1 flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );
}
