import App from '@/App';
import { RegistrationForm } from '@/components/RegistrationForm';
import { createBrowserRouter } from 'react-router-dom';

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