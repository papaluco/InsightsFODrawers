import { Routes, Route, Navigate } from 'react-router-dom';
import LayoutMenu from './LayoutMen'; // Corrected import name
import InsightsPage from '../../pages/InsightsPage';
import SettingsPage from '../../pages/SettingPage';
import ReportsPage from '../../pages/ReportsPage';

export default function RoutesProvider() {
  return (
    <Routes>
      <Route path="/" element={<LayoutMenu />}>
        {/* Land on Insights by default */}
        <Route index element={<Navigate to="/insights" replace />} />
        
        {/* Your two active pages */}
        <Route path="insights" element={<InsightsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        
        {/* Catch-all to keep the user inside the app */}
        <Route path="*" element={<Navigate to="/insights" replace />} />
      </Route>
    </Routes>
  );
}