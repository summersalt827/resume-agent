import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ResourcePosition from './pages/ResourcePosition';
import ResourceForm from './pages/ResourceForm';
import MaterialPackage from './pages/MaterialPackage';
import CrowdPackage from './pages/CrowdPackage';
import ChannelConfig from './pages/ChannelConfig';
import ScheduleCalendar from './pages/ScheduleCalendar';
import MonitorDashboard from './pages/MonitorDashboard';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resource-positions" element={<ResourcePosition />} />
              <Route path="/resource-positions/:code" element={<ResourceForm />} />
              <Route path="/materials" element={<MaterialPackage />} />
              <Route path="/crowds" element={<CrowdPackage />} />
              <Route path="/channels" element={<ChannelConfig />} />
              <Route path="/schedule" element={<ScheduleCalendar />} />
              <Route path="/monitor" element={<MonitorDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
