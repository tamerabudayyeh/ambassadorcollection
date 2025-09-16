import { BookingProvider } from '@/contexts/BookingContext';
import { BookingErrorBoundary } from '@/components/ui/error-boundary';
import { ToastProvider } from '@/components/ui/toast-provider';

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <BookingErrorBoundary>
        <BookingProvider>
          {children}
        </BookingProvider>
      </BookingErrorBoundary>
    </ToastProvider>
  );
}