import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import { RegistrationForm } from '@/components/RegistrationForm';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/register/:token',
    element: <RegistrationForm />,
  },
]);