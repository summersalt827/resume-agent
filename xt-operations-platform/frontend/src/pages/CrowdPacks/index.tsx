import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { crowdPacksApi } from '../../services/api';
import { CrowdPack, STATUS_COLORS } from '../../types';

export default function CrowdPacksIndex() {
  const [data, setData] = useState<CrowdPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    crowdPacksApi.list({ search: search || undefined })
      .then((res: any) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleDelete = async (id: string) => {
    await crowdPacksApi.delete(id);
    message.success('已删除');
    fetchData();
  };

  const columns = [
    { title: '人群包名称', dataIndex: 'name', width: 200 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '规则数', dataIndex: 'rules', width: 80,
      render: (v: string) => {
        try { return JSON.parse(v).length; } catch { return 0; }
      },
    },
    {
      title: '逻辑', dataIndex: 'logic', width: 70,
      render: (v: string) => <Tag color={v === 'AND' ? 'blue' : 'orange'}>{v}</Tag>,
    },
    { title: '预估覆盖', dataIndex: 'user_count', width: 100, render: (v: number) => v?.toLocaleString() },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v: string) => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag>,
    },
    {
      title: '操作', width: 150,
      render: (_: any, record: CrowdPack) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/crowd-packs/${record.id}`)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="人群包管理 (人)"
      extra={
        <Space>
          <Input
            placeholder="搜索人群包..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/crowd-packs/new')}>
            新建人群包
          </Button>
        </Space>
      }
    >
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
        onRow={(r) => ({ onClick: () => navigate(`/crowd-packs/${r.id}`), style: { cursor: 'pointer' } })}
      />
    </Card>
  );
}
