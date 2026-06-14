import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Typography, Avatar, Dropdown, Badge, Space } from 'antd';
import {
  DashboardOutlined,
  PictureOutlined,
  TeamOutlined,
  SendOutlined,
  CalendarOutlined,
  MonitorOutlined,
  AppstoreOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '运营看板' },
  { key: '/resource-positions', icon: <AppstoreOutlined />, label: '资源位配置' },
  { key: '/materials', icon: <PictureOutlined />, label: '素材包管理' },
  { key: '/crowds', icon: <TeamOutlined />, label: '人群包管理' },
  { key: '/channels', icon: <SendOutlined />, label: '投放渠道' },
  { key: '/schedule', icon: <CalendarOutlined />, label: '排期管理' },
  { key: '/monitor', icon: <MonitorOutlined />, label: '数据监控' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const selectedKey = location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Text strong style={{ color: '#fff', fontSize: collapsed ? 14 : 18, whiteSpace: 'nowrap' }}>
            {collapsed ? 'XT' : 'XT 运营配置后台'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8 }}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 220, transition: 'all 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}>
          <Space size="large">
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <Text>运营管理员</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 16, minHeight: 280 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
