import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Card, Switch, Row, Col, Tooltip, Typography, Statistic } from 'antd';
import {
  PlusOutlined, SearchOutlined, CopyOutlined, EditOutlined,
  PlayCircleOutlined, PauseCircleOutlined, AppstoreOutlined,
  TeamOutlined, PictureOutlined, RightOutlined, ExperimentOutlined, SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { configsApi } from '../../services/api';
import type { PositionConfig } from '../../types';
import { STATUS_COLORS } from '../../types';

const { Text } = Typography;

export default function ConfigsIndex() {
  const [data, setData] = useState<PositionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    configsApi.list({ search: search || undefined, status: statusFilter })
      .then((res: any) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, statusFilter]);

  const handleToggle = async (id: string) => {
    await configsApi.toggle(id);
    message.success('状态已切换');
    fetchData();
  };

  const handleDuplicate = async (id: string) => {
    await configsApi.duplicate(id);
    message.success('已复制配置');
    fetchData();
  };

  const columns = [
    {
      title: '场', dataIndex: 'position_name', key: 'position', width: 170,
      render: (v: string, r: PositionConfig) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppstoreOutlined style={{ color: '#1677ff', fontSize: 16 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>{r.position_code}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '', dataIndex: 'arrow1', key: 'arrow1', width: 30,
      render: () => <RightOutlined style={{ color: '#d9d9d9' }} />,
    },
    {
      title: '人', dataIndex: 'crowd_pack_name', key: 'crowd', width: 150,
      render: (v: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamOutlined style={{ color: '#722ed1', fontSize: 16 }} />
          <span>
            {v ? (
              <Tag color="purple" style={{ margin: 0 }}>{v}</Tag>
            ) : (
              <Tag color="default" style={{ margin: 0 }}>全量用户</Tag>
            )}
          </span>
        </div>
      ),
    },
    {
      title: '', dataIndex: 'arrow2', key: 'arrow2', width: 30,
      render: () => <RightOutlined style={{ color: '#d9d9d9' }} />,
    },
    {
      title: '货', dataIndex: 'material_name', key: 'material', width: 200,
      render: (v: string, r: PositionConfig) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PictureOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
          <div>
            <Text strong>{v}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>ID: {r.material_id?.slice(0, 12)}...</Text>
              <Tag color="orange" style={{ fontSize: 10, marginLeft: 4 }}>{r.material_type}</Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '优先级', dataIndex: 'priority', key: 'priority', width: 80,
      render: (v: number) => (
        <Tag color={v >= 360 ? 'red' : v >= 350 ? 'orange' : 'geekblue'} style={{ fontWeight: 600 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: '投放控制', key: 'controls', width: 230,
      render: (_: any, r: PositionConfig) => (
        <Space size={4} wrap>
          <Tag color={r.device_type === 'all' ? 'default' : 'cyan'}>{r.device_type === 'all' ? '全平台' : r.device_type}</Tag>
          {r.gray_ratio < 100 ? (
            <Tooltip title={`灰度 ${r.gray_ratio}%`}>
              <Tag color="orange" icon={<ExperimentOutlined />}>{r.gray_ratio}%</Tag>
            </Tooltip>
          ) : (
            <Tag color="green">全量</Tag>
          )}
          {r.ab_group && <Tag color="purple">AB:{r.ab_group}</Tag>}
          {r.freq_limit_type !== 'none' && (
            <Tag color="red">频控:{r.freq_limit_count}次</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string, r: PositionConfig) => (
        <Space>
          <Tag color={STATUS_COLORS[v] || 'default'}>
            {v === 'online' ? '在线' : v === 'offline' ? '下线' : v === 'draft' ? '草稿' : v === 'expired' ? '过期' : v}
          </Tag>
          <Switch
            size="small"
            checked={v === 'online'}
            onChange={() => handleToggle(r.id)}
            checkedChildren={<PlayCircleOutlined />}
            unCheckedChildren={<PauseCircleOutlined />}
          />
        </Space>
      ),
    },
    {
      title: '操作', key: 'actions', width: 140,
      render: (_: any, r: PositionConfig) => (
        <Space>
          <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => navigate(`/configs/${r.id}`)}>
            编辑
          </Button>
          <Tooltip title="复制配置">
            <Button size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(r.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const onlineCount = data.filter((c) => c.status === 'online').length;
  const draftCount = data.filter((c) => c.status === 'draft').length;

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              <SettingOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              人货场动态配置
            </h2>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>
              场域资源位 × 目标人群包 × 投放素材 → 一站式精准投放配置
            </p>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/configs/new')}>
            新建配置
          </Button>
        </div>
      </div>

      {/* 状态统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="总配置" value={data.length} suffix="个" valueStyle={{ fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title={<span><PlayCircleOutlined style={{ color: '#52c41a' }} /> 在线</span>} value={onlineCount} suffix="个" valueStyle={{ color: '#52c41a', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="草稿" value={draftCount} suffix="个" valueStyle={{ color: '#1677ff', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '3px solid #999' }}>
            <Statistic title="下线" value={data.filter((c) => c.status === 'offline').length} suffix="个" valueStyle={{ fontSize: 24 }} />
          </Card>
        </Col>
      </Row>

      {/* 配置表格 */}
      <Card
        extra={
          <Space>
            <Select
              placeholder="状态筛选" allowClear style={{ width: 110 }}
              value={statusFilter} onChange={setStatusFilter}
              options={[
                { value: 'draft', label: '草稿' },
                { value: 'online', label: '在线' },
                { value: 'offline', label: '下线' },
                { value: 'expired', label: '过期' },
              ]}
            />
            <Input
              placeholder="搜索..." prefix={<SearchOutlined />}
              value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 180 }}
            />
          </Space>
        }
      >
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条配置` }}
          onRow={(r) => ({
            onClick: () => navigate(`/configs/${r.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{ emptyText: '暂无配置，点击右上角「新建配置」开始创建人货场绑定' }}
        />
      </Card>
    </div>
  );
}
