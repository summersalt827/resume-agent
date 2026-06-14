import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message, Card, Select, Image } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { materialsApi } from '../../services/api';
import { Material, STATUS_COLORS } from '../../types';

export default function MaterialsIndex() {
  const [data, setData] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    materialsApi.list({ search: search || undefined, type: typeFilter })
      .then((res: any) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, typeFilter]);

  const handleDelete = async (id: string) => {
    await materialsApi.delete(id);
    message.success('已删除');
    fetchData();
  };

  const renderContent = (content: string) => {
    try {
      const c = JSON.parse(content);
      const zh = c.zh || c;
      return zh.title || zh.text || '-';
    } catch { return '-'; }
  };

  const columns = [
    {
      title: '预览', dataIndex: 'file_url', width: 80,
      render: (v: string, r: Material) =>
        r.type === 'image' && v ? <Image src={v} width={48} height={48} style={{ borderRadius: 4 }} preview={{ mask: <EyeOutlined /> }} /> : <Tag>{r.type}</Tag>,
    },
    { title: '素材名称', dataIndex: 'name', width: 180 },
    {
      title: '类型', dataIndex: 'type', width: 80,
      render: (v: string) => <Tag color={v === 'image' ? 'blue' : v === 'text' ? 'green' : 'orange'}>{v}</Tag>,
    },
    { title: '内容', dataIndex: 'content', ellipsis: true, render: renderContent },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v: string) => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag>,
    },
    {
      title: '操作', width: 150,
      render: (_: any, record: Material) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/materials/${record.id}`)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="素材库 (货)"
      extra={
        <Space>
          <Select
            placeholder="素材类型" allowClear style={{ width: 120 }}
            value={typeFilter} onChange={setTypeFilter}
            options={[
              { value: 'image', label: '图片' },
              { value: 'text', label: '文字' },
              { value: 'link', label: '链接' },
              { value: 'video', label: '视频' },
            ]}
          />
          <Input
            placeholder="搜索素材..." prefix={<SearchOutlined />}
            value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/materials/new')}>
            上传素材
          </Button>
        </Space>
      }
    >
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
        onRow={(r) => ({ onClick: () => navigate(`/materials/${r.id}`), style: { cursor: 'pointer' } })}
      />
    </Card>
  );
}
