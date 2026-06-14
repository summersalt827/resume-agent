import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Spin, Progress, Space, Typography } from 'antd';
import {
  TeamOutlined, PictureOutlined, AppstoreOutlined, SettingOutlined,
  ArrowUpOutlined, EyeOutlined, AimOutlined, CheckOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { analyticsApi, configsApi } from '../services/api';
import type { AnalyticsOverview, PositionConfig } from '../types';
import { STATUS_COLORS } from '../types';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [configs, setConfigs] = useState<PositionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      analyticsApi.overview('today'),
      configsApi.list({}),
    ]).then(([o, c]: any) => {
      setOverview(o.data);
      setConfigs(c.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const onlineConfigs = configs.filter((c) => c.status === 'online');

  const columns = [
    {
      title: '资源位 (场)', dataIndex: 'position_name', width: 130,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: '人群包 (人)', dataIndex: 'crowd_pack_name', width: 120,
      render: (v: string) => v ? <Tag color="purple">{v}</Tag> : <Tag color="default">全量用户</Tag>,
    },
    {
      title: '素材 (货)', dataIndex: 'material_name', width: 140,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '优先级', dataIndex: 'priority', width: 80, sorter: (a: any, b: any) => b.priority - a.priority,
      render: (v: number) => <Tag color={v >= 360 ? 'red' : v >= 350 ? 'orange' : 'geekblue'}>{v}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v: string) => <Tag color={STATUS_COLORS[v] || 'default'}>{v === 'online' ? '在线' : v === 'draft' ? '草稿' : v === 'offline' ? '下线' : v}</Tag>,
    },
  ];

  return (
    <div>
      {/* 人货场 核心架构卡片 */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => navigate('/positions')}
            style={{
              borderTop: '4px solid #1677ff', height: '100%',
              background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)',
            }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0, color: '#1677ff' }}>场</Title>
                <AppstoreOutlined style={{ fontSize: 32, color: '#1677ff', opacity: 0.3 }} />
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>APP场域 · 资源位资产目录</div>
              <Statistic value={overview?.total_positions || 0} suffix="个资源位" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
              <div style={{ fontSize: 12, color: '#999' }}>
                覆盖弹窗 / Banner / 四宫图 / 跑马灯 / 任务体系
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => navigate('/crowd-packs')}
            style={{
              borderTop: '4px solid #722ed1', height: '100%',
              background: 'linear-gradient(135deg, #f9f0ff 0%, #fff 100%)',
            }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0, color: '#722ed1' }}>人</Title>
                <TeamOutlined style={{ fontSize: 32, color: '#722ed1', opacity: 0.3 }} />
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>人群定向 · 精准投放受众</div>
              <Statistic value={overview?.total_crowd_packs || 0} suffix="个人群包" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
              <div style={{ fontSize: 12, color: '#999' }}>
                8大维度圈选 · AND/OR组合 · 50万+用户覆盖
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => navigate('/materials')}
            style={{
              borderTop: '4px solid #fa8c16', height: '100%',
              background: 'linear-gradient(135deg, #fff7e6 0%, #fff 100%)',
            }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0, color: '#fa8c16' }}>货</Title>
                <PictureOutlined style={{ fontSize: 32, color: '#fa8c16', opacity: 0.3 }} />
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>素材内容 · 多语言投放物料</div>
              <Statistic value={overview?.total_materials || 0} suffix="个素材" valueStyle={{ fontSize: 28, fontWeight: 700 }} />
              <div style={{ fontSize: 12, color: '#999' }}>
                图片 / 文字 / 链接 / 视频 · 5语言 · CDN降级
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 人货场 → 动态配置 箭头 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Space size={40}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#f0f5ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
              border: '2px solid #1677ff',
            }}>
              <AppstoreOutlined style={{ fontSize: 28, color: '#1677ff' }} />
            </div>
            <Text strong style={{ color: '#1677ff' }}>场域</Text>
          </div>
          <RightOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#f9f0ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
              border: '2px solid #722ed1',
            }}>
              <TeamOutlined style={{ fontSize: 28, color: '#722ed1' }} />
            </div>
            <Text strong style={{ color: '#722ed1' }}>人群</Text>
          </div>
          <RightOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#fff7e6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
              border: '2px solid #fa8c16',
            }}>
              <PictureOutlined style={{ fontSize: 28, color: '#fa8c16' }} />
            </div>
            <Text strong style={{ color: '#fa8c16' }}>素材</Text>
          </div>
          <RightOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 64, borderRadius: 12, background: 'linear-gradient(135deg, #1677ff, #722ed1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
              boxShadow: '0 4px 12px rgba(22,119,255,0.3)',
            }}>
              <SettingOutlined style={{ fontSize: 28, color: '#fff' }} />
            </div>
            <Text strong style={{ color: '#1677ff' }}>动态配置</Text>
          </div>
        </Space>
      </div>

      {/* 配置统计 + 数据概览 */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={<span><SettingOutlined /> 配置概览</span>}
            extra={<a onClick={() => navigate('/configs')}>配置管理 <RightOutlined /></a>}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="总配置" value={overview?.total_configs || 0} valueStyle={{ color: '#1677ff' }} />
              </Col>
              <Col span={6}>
                <Statistic title="在线" value={overview?.online_configs || 0} valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={6}>
                <Statistic title="草稿" value={configs.filter((c) => c.status === 'draft').length} valueStyle={{ color: '#1677ff' }} />
              </Col>
              <Col span={6}>
                <Statistic title="下线" value={configs.filter((c) => c.status === 'offline').length} valueStyle={{ color: '#999' }} />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">在线率</Text>
                <Text strong>{overview ? ((overview.online_configs / overview.total_configs) * 100).toFixed(0) : 0}%</Text>
              </div>
              <Progress
                percent={overview ? Number(((overview.online_configs / overview.total_configs) * 100).toFixed(0)) : 0}
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={<span><EyeOutlined /> 今日数据</span>}
            extra={<a onClick={() => navigate('/analytics')}>数据监控 <RightOutlined /></a>}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="曝光" value={overview?.total_exposures || 0} prefix={<EyeOutlined />} valueStyle={{ fontSize: 20 }} />
              </Col>
              <Col span={6}>
                <Statistic title="点击" value={overview?.total_clicks || 0} prefix={<AimOutlined />} valueStyle={{ fontSize: 20 }} />
              </Col>
              <Col span={6}>
                <Statistic title="转化" value={overview?.total_conversions || 0} prefix={<CheckOutlined />} valueStyle={{ fontSize: 20 }} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="CTR"
                  value={overview?.ctr || '0'}
                  suffix="%"
                  prefix={<ArrowUpOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: 20 }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">转化率 CVR</Text>
                <Text strong>{overview?.cvr || '0'}%</Text>
              </div>
              <Progress
                percent={Number(overview?.cvr || '0') * 10}
                strokeColor="#722ed1"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 在线配置列表 */}
      <Card
        title={<span>在线投放配置 <Tag color="green">{onlineConfigs.length}个在线</Tag></span>}
        extra={<a onClick={() => navigate('/configs')}>全部配置 <RightOutlined /></a>}
      >
        <Table
          dataSource={configs}
          columns={columns}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条配置` }}
          onRow={(r) => ({
            onClick: () => navigate(`/configs/${r.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{ emptyText: '暂无配置，点击右上角新建配置' }}
        />
      </Card>
    </div>
  );
}
