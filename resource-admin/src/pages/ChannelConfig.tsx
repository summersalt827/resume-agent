import { Table, Tag, Typography, Card, Progress, Space, Descriptions, Statistic, Row, Col, Button } from 'antd';
import { SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { channels } from '../mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { Channel } from '../types';

const { Title, Text } = Typography;

const columns: ColumnsType<Channel> = [
  { title: '渠道ID', dataIndex: 'id', key: 'id', width: 80, render: (id: string) => <Tag color="blue" style={{ fontSize: 16 }}>{id}</Tag> },
  { title: '渠道名称', dataIndex: 'name', key: 'name', render: (name: string) => <Text strong>{name}</Text> },
  { title: '描述', dataIndex: 'description', key: 'desc' },
  {
    title: '覆盖用户比例', dataIndex: 'coverage_ratio', key: 'coverage', width: 200,
    render: (ratio: number) => <Progress percent={ratio} size="small" strokeColor="#1890ff" />,
  },
  { title: '关联资源位', dataIndex: 'linked_positions', key: 'linked', width: 100, render: (v: number) => <Text strong>{v}</Text> },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag> },
];

const channelRelationData = [
  { position: '弹窗运营位', channels: ['A', 'B'] },
  { position: '首页跑马灯', channels: ['A', 'B', 'C', 'D'] },
  { position: '顶部运营头图', channels: ['A', 'B', 'C'] },
  { position: '底部运营四宫图', channels: ['A', 'B', 'C', 'D'] },
  { position: '新人专享任务', channels: ['A', 'B', 'C', 'D'] },
  { position: '成长任务', channels: ['A', 'B', 'C', 'D'] },
  { position: '新用户引导弹窗', channels: ['A', 'B', 'C', 'D'] },
  { position: '行情区资源位', channels: ['A', 'B', 'C', 'D'] },
  { position: 'PUSH推送-Meme', channels: ['A', 'C'] },
];

export default function ChannelConfig() {
  const totalCoverage = channels.reduce((sum, c) => sum + c.coverage_ratio, 0);

  return (
    <div>
      <Title level={4} className="page-header"><SendOutlined /> 投放渠道配置</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="渠道总数" value={channels.length} prefix={<SendOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="覆盖总用户比例" value={totalCoverage} suffix="%" prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="关联资源位总数" value={34} prefix={<SendOutlined />} /></Card>
        </Col>
      </Row>

      <Card title="渠道列表" className="section-card" style={{ marginTop: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary">新增渠道</Button>
        </Space>
        <Table columns={columns} dataSource={channels} rowKey="id" size="middle" pagination={false} />
      </Card>

      <Card title="渠道-资源位关联关系" className="section-card" style={{ marginTop: 16 }}>
        <Table
          dataSource={channelRelationData}
          rowKey="position"
          size="middle"
          pagination={false}
          columns={[
            { title: '资源位', dataIndex: 'position' },
            {
              title: '投放渠道',
              dataIndex: 'channels',
              render: (chs: string[]) => (
                <Space>{chs.map((ch) => <Tag key={ch} color="blue">渠道 {ch}</Tag>)}</Space>
              ),
            },
            { title: '渠道数', dataIndex: 'channels', render: (chs: string[]) => chs.length },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {channels.map((ch) => (
          <Col xs={24} sm={12} key={ch.id}>
            <Card title={<Space><Tag color="blue" style={{ fontSize: 16 }}>{ch.id}</Tag> {ch.name}</Space>} size="small">
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="描述">{ch.description}</Descriptions.Item>
                <Descriptions.Item label="状态"><Tag color="green">启用</Tag></Descriptions.Item>
                <Descriptions.Item label="覆盖用户比例">
                  <Progress percent={ch.coverage_ratio} size="small" />
                </Descriptions.Item>
                <Descriptions.Item label="关联资源位">{ch.linked_positions} 个</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
