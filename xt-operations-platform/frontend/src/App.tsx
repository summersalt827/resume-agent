import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CrowdPacksIndex from './pages/CrowdPacks/index';
import CrowdPackForm from './pages/CrowdPacks/CrowdPackForm';
import MaterialsIndex from './pages/Materials/index';
import MaterialForm from './pages/Materials/MaterialForm';
import PositionsIndex from './pages/ResourcePositions/index';
import PositionDetail from './pages/ResourcePositions/PositionDetail';
import ConfigsIndex from './pages/Configs/index';
import ConfigForm from './pages/Configs/ConfigForm';
import Rules from './pages/Rules';
import Analytics from './pages/Analytics';
import Delivery from './pages/Delivery';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/crowd-packs" element={<CrowdPacksIndex />} />
        <Route path="/crowd-packs/new" element={<CrowdPackForm />} />
        <Route path="/crowd-packs/:id" element={<CrowdPackForm />} />
        <Route path="/materials" element={<MaterialsIndex />} />
        <Route path="/materials/new" element={<MaterialForm />} />
        <Route path="/materials/:id" element={<MaterialForm />} />
        <Route path="/positions" element={<PositionsIndex />} />
        <Route path="/positions/:id" element={<PositionDetail />} />
        <Route path="/configs" element={<ConfigsIndex />} />
        <Route path="/configs/new" element={<ConfigForm />} />
        <Route path="/configs/:id" element={<ConfigForm />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/delivery" element={<Delivery />} />
      </Route>
    </Routes>
  );
}
