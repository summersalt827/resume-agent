import { useState } from 'react';
import { Table, Tag, Typography, Card, Tabs, Space, Input, Drawer, Descriptions, Statistic, Row, Col, Button } from 'antd';
import { SearchOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { crowdPackages } from '../mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { CrowdPackage as CrowdPackageType } from '../types';

const { Title, Text } = Typography;

const categoryLabels: Record<string, string> = {
  lifecycle: '用户生命周期',
  trading: '交易行为',
  channel_source: '渠道来源',
  region: '区域市场',
  asset: '资产等级',
  activity: '活跃度',
};

const columns: ColumnsType<CrowdPackageType> = [
  { title: '人群包名称', dataIndex: 'crowd_name', key: 'name', render: (name: string) => <Text strong>{name}</Text> },
  { title: '标识', dataIndex: 'crowd_code', key: 'code', render: (code: string) => <Tag color="blue">{code}</Tag> },
  { title: '筛选规则', dataIndex: 'filter_rules', key: 'rules', ellipsis: true, width: 280 },
  { title: '典型场景', dataIndex: 'typical_scenario', key: 'scenario', ellipsis: true, width: 200 },
  { title: '预估人数', dataIndex: 'estimated_users', key: 'users', width: 100, render: (v: number) => v.toLocaleString() },
  { title: '关联资源位', dataIndex: 'linked_positions', key: 'linked', width: 90 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag> },
];

export default function CrowdPackage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CrowdPackageType | null>(null);

  const filterData = (data: CrowdPackageType[]) =>
    data.filter((c) => c.crowd_name.includes(search) || c.crowd_code.includes(search) || c.filter_rules.includes(search));

  const tabItems = Object.entries(categoryLabels).map(([key, label]) => {
    const items = filterData(crowdPackages.filter((c) => c.crowd_category === key));
    return {
      key,
      label: <Space>{label}<Tag>{items.length}</Tag></Space>,
      children: (
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          size="middle"
          pagination={false}
          onRow={(record) => ({
            onClick: () => setSelected(record),
            style: { cursor: 'pointer' },
          })}
        />
      ),
    };
  });

  return (
    <div>
      <Title level={4} className="page-header"><TeamOutlined /> 人群包管理</Title>
      <Card className="section-card">
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索人群包名称/标识/规则"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Button type="primary">新增人群包</Button>
        </Space>
        <Tabs items={tabItems} />
      </Card>

      <Drawer
        title={selected ? `人群包详情` : ''}
        open={!!selected}
        onClose={() => setSelected(null)}
        width={600}
      >
        {selected && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}><Card size="small"><Statistic title="预估覆盖用户" value={selected.estimated_users} prefix={<UserOutlined />} suffix="人" /></Card></Col>
              <Col span={12}><Card size="small"><Statistic title="关联资源位" value={selected.linked_positions} suffix="个" /></Card></Col>
            </Row>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="人群包名称">{selected.crowd_name}</Descriptions.Item>
              <Descriptions.Item label="人群包标识"><Tag color="blue">{selected.crowd_code}</Tag></Descriptions.Item>
              <Descriptions.Item label="分类"><Tag color="purple">{categoryLabels[selected.crowd_category]}</Tag></Descriptions.Item>
              <Descriptions.Item label="筛选规则">{selected.filter_rules}</Descriptions.Item>
              <Descriptions.Item label="典型应用场景">{selected.typical_scenario}</Descriptions.Item>
              <Descriptions.Item label="定向逻辑"><Tag>{selected.logic_type}</Tag></Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={selected.status === 'active' ? 'green' : 'default'}>{selected.status === 'active' ? '启用' : '停用'}</Tag></Descriptions.Item>
              <Descriptions.Item label="创建时间">{selected.created_at}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selected.updated_at}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </div>
  );
}
