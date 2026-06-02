import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { Toaster } from '@/components/ui/sonner';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-center" />
    </>
  );
}
