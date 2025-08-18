// src/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Messages from '@/pages/Messages';
import Logs from '@/pages/Logs';
import Tasks from '@/pages/Tasks';
import Notices from '@/pages/Notices';
import Ledger from '@/pages/Ledger';
import AgencyDetail from '@/pages/AgencyDetail';
import App from '@/App';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <App />, // contains Sidebar/Topbar + <Outlet/>
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'messages', element: <Messages /> },
      { path: 'logs', element: <Logs /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'notices', element: <Notices /> },
      { path: 'ledger', element: <Ledger /> },
      { path: 'agencies/:id', element: <AgencyDetail /> },
    ],
  },
]);