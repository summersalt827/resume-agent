import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Typography, Input, Select, Card, Space, Badge } from 'antd';
import { SearchOutlined, AppstoreOutlined } from '@ant-design/icons';
import { resourcePositionDefs } from '../mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { ResourcePositionDef } from '../types';

const { Title } = Typography;

const categoryLabels: Record<string, string> = {
  popup: '弹窗类',
  homepage: '首页类',
  welfare: '福利中心类',
  task: '任务类',
  nav: '导航类',
  other: '其他',
};

const categoryColors: Record<string, string> = {
  popup: 'magenta',
  homepage: 'blue',
  welfare: 'green',
  task: 'orange',
  nav: 'purple',
  other: 'default',
};

export default function ResourcePosition() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = resourcePositionDefs.filter((r) => {
    const matchSearch = r.name.includes(search) || r.code.includes(search) || r.position.includes(search);
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const columns: ColumnsType<ResourcePositionDef> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_: string, __: ResourcePositionDef, idx: number) => idx + 1,
    },
    {
      title: '资源位名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ResourcePositionDef) => (
        <a onClick={() => navigate(`/resource-positions/${record.code}`)}>
          <Space>
            {name}
            {record.is_required && <Badge status="error" text="必配" />}
          </Space>
        </a>
      ),
    },
    {
      title: '资源位编码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat: string) => <Tag color={categoryColors[cat]}>{categoryLabels[cat]}</Tag>,
      filters: Object.entries(categoryLabels).map(([k, v]) => ({ text: v, value: k })),
      onFilter: (value: any, record: ResourcePositionDef) => record.category === value,
    },
    {
      title: '展示位置',
      dataIndex: 'position',
      key: 'position',
      ellipsis: true,
    },
    {
      title: '默认优先级',
      dataIndex: 'default_priority',
      key: 'default_priority',
      width: 100,
      render: (p: number) => p > 0 ? p : <Tag>—</Tag>,
      sorter: (a: ResourcePositionDef, b: ResourcePositionDef) => a.default_priority - b.default_priority,
    },
  ];

  return (
    <div>
      <Title level={4} className="page-header">
        <AppstoreOutlined /> 资源位配置
      </Title>
      <Card className="section-card">
        <Space style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索资源位名称/编码/位置"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: '全部分类' },
              ...Object.entries(categoryLabels).map(([k, v]) => ({ value: k, label: v })),
            ]}
          />
          <Tag color="blue">共 {filtered.length} 个资源位</Tag>
        </Space>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `共 ${t} 个资源位` }}
        />
      </Card>
    </div>
  );
}
