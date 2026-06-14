import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Tag } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  PictureOutlined,
  AppstoreOutlined,
  SettingOutlined,
  NodeIndexOutlined,
  BarChartOutlined,
  SendOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems: any[] = [
  { key: '/', icon: <DashboardOutlined />, label: '运营概览' },
  { type: 'divider' as const },
  { key: '/configs', icon: <SettingOutlined />, label: '人货场动态配置' },
  { type: 'divider' as const },
  { key: '/crowd-packs', icon: <TeamOutlined />, label: '人群包管理 (人)' },
  { key: '/materials', icon: <PictureOutlined />, label: '素材库管理 (货)' },
  { key: '/positions', icon: <AppstoreOutlined />, label: '资源位目录 (场)' },
  { type: 'divider' as const },
  { key: '/rules', icon: <NodeIndexOutlined />, label: '规则引擎' },
  { key: '/analytics', icon: <BarChartOutlined />, label: '数据监控' },
  { key: '/delivery', icon: <SendOutlined />, label: '下发调试' },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: token.colorBgContainer }}
        width={220}
      >
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`, fontWeight: 700,
          fontSize: collapsed ? 14 : 18, color: token.colorPrimary,
        }}>
          {collapsed ? 'XT' : 'XT 数字化运营'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: token.colorBgContainer, padding: '0 24px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              人 · 货 · 场 数字化运营后台
            </span>
            <Tag color="blue">动态配置</Tag>
            <Tag color="purple">精准投放</Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
              <ApiOutlined /> API v1.0
            </span>
          </div>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: token.colorBgContainer, borderRadius: 8, overflow: 'auto', minHeight: 'calc(100vh - 88px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
