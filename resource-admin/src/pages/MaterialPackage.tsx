import { useState } from 'react';
import { Table, Tag, Typography, Card, Space, Input, Select, Drawer, Descriptions, Image, Divider, Button } from 'antd';
import { SearchOutlined, PictureOutlined, EyeOutlined } from '@ant-design/icons';
import { materialPackages } from '../mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { MaterialPackage as MaterialPackageType } from '../types';

const { Title, Text } = Typography;

const typeLabels: Record<string, string> = {
  popup: '弹窗素材',
  banner: 'Banner素材',
  grid: '宫格素材',
  task: '任务素材',
  push: 'PUSH素材',
};

export default function MaterialPackage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<MaterialPackageType | null>(null);

  const filtered = materialPackages.filter((m) => {
    const matchSearch = m.name.includes(search) || m.resource_position_name.includes(search);
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const columns: ColumnsType<MaterialPackageType> = [
    { title: '素材包名称', dataIndex: 'name', key: 'name', render: (name: string) => <Text strong>{name}</Text> },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (t: string) => <Tag color="blue">{typeLabels[t] || t}</Tag> },
    { title: '关联资源位', dataIndex: 'resource_position_name', key: 'pos', render: (name: string) => <Tag>{name}</Tag> },
    { title: '图片数量', key: 'images', width: 80, render: (_: any, r: MaterialPackageType) => r.images.length },
    { title: '文本配置', key: 'texts', width: 80, render: (_: any, r: MaterialPackageType) => r.texts.length },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag> },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', width: 160 },
    { title: '操作', key: 'action', width: 80, render: (_: any, r: MaterialPackageType) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)}>详情</Button> },
  ];

  return (
    <div>
      <Title level={4} className="page-header"><PictureOutlined /> 素材包管理</Title>
      <Card className="section-card">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索素材包名称或关联资源位"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 140 }}
            options={[{ value: 'all', label: '全部类型' }, ...Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v }))]}
          />
          <Button type="primary">新增素材包</Button>
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer
        title={selected ? `素材包详情 - ${selected.name}` : ''}
        open={!!selected}
        onClose={() => setSelected(null)}
        width={640}
      >
        {selected && (
          <>
            <Descriptions size="small" column={2} bordered>
              <Descriptions.Item label="素材包名称">{selected.name}</Descriptions.Item>
              <Descriptions.Item label="类型"><Tag color="blue">{typeLabels[selected.type]}</Tag></Descriptions.Item>
              <Descriptions.Item label="关联资源位">{selected.resource_position_name}</Descriptions.Item>
              <Descriptions.Item label="资源位编码">{selected.resource_position_code}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={selected.status === 'active' ? 'green' : 'default'}>{selected.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="更新时间">{selected.updated_at}</Descriptions.Item>
            </Descriptions>

            <Divider >图片素材</Divider>
            <Space wrap>
              {selected.images.map((img, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <Image src={img.url} width={120} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <div><Tag>{img.lang}</Tag></div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{img.desc}</Text>
                </div>
              ))}
            </Space>

            <Divider >文案多语言配置</Divider>
            <Table
              dataSource={selected.texts}
              rowKey={(_, i) => String(i)}
              size="small"
              pagination={false}
              columns={[
                { title: '字段', dataIndex: 'field' },
                { title: '语言', dataIndex: 'lang', render: (l: string) => <Tag>{l}</Tag> },
                { title: '文案', dataIndex: 'value' },
              ]}
            />

            <Divider >跳转链接</Divider>
            {selected.links.map((link, i) => (
              <Descriptions key={i} size="small" column={1} bordered style={{ marginBottom: 8 }}>
                <Descriptions.Item label="语言"><Tag>{link.lang}</Tag></Descriptions.Item>
                <Descriptions.Item label="链接">{link.url}</Descriptions.Item>
              </Descriptions>
            ))}
          </>
        )}
      </Drawer>
    </div>
  );
}
