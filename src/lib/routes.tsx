import App from '@/App';
import { RegistrationForm } from '@/components/RegistrationForm';
import { RegistrationSuccess } from '@/components/RegistrationSuccess';
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/register',
    element: <RegistrationForm />,
  },
  {
    path: '/registration-success',
    element: <RegistrationSuccess />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);