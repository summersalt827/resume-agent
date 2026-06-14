import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Table, Button, Space, Spin, Statistic, Row, Col, Modal, Select, Input, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { positionsApi, configsApi, materialsApi } from '../../services/api';
import { ResourcePosition, PositionConfig, CATEGORY_LABELS, STATUS_COLORS } from '../../types';
import type { Material } from '../../types';
import dayjs from 'dayjs';

export default function PositionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState<ResourcePosition | null>(null);
  const [configs, setConfigs] = useState<PositionConfig[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick-edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PositionConfig | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editMaterialId, setEditMaterialId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    Promise.all([
      positionsApi.get(id!),
      configsApi.list({ position_id: id }),
      positionsApi.analytics(id!),
    ]).then(([posRes, configsRes, analyticsRes]: any) => {
      setPosition(posRes.data);
      setConfigs(configsRes.data || []);
      setAnalytics(analyticsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const openEdit = async (config: PositionConfig) => {
    setEditingConfig(config);
    setEditMaterialId(config.material_id);
    setEditStartTime(config.start_time || '');
    setEditEndTime(config.end_time || '');
    setEditOpen(true);
    if (materials.length === 0) {
      try {
        const res: any = await materialsApi.list();
        setMaterials(res.data || []);
      } catch { /* ignore */ }
    }
  };

  const handleSave = async () => {
    if (!editingConfig) return;
    setSaving(true);
    try {
      await configsApi.update(editingConfig.id, {
        material_id: editMaterialId,
        start_time: editStartTime,
        end_time: editEndTime,
      });
      message.success('更新成功');
      setEditOpen(false);
      fetchData();
    } catch (e: any) {
      message.error(e.message || '更新失败');
    }
    setSaving(false);
  };

  const formatTime = (t: string) => {
    if (!t) return '-';
    return dayjs(t).format('YYYY-MM-DD HH:mm');
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!position) return <div>资源位不存在</div>;

  const configColumns = [
    { title: '素材', dataIndex: 'material_name', width: 150 },
    { title: '人群包', dataIndex: 'crowd_pack_name', width: 120, render: (v: string) => v || '全量用户' },
    { title: '优先级', dataIndex: 'priority', width: 80 },
    { title: '灰度', dataIndex: 'gray_ratio', width: 80, render: (v: number) => `${v}%` },
    { title: '设备', dataIndex: 'device_type', width: 80 },
    {
      title: '上线时间', dataIndex: 'start_time', width: 140,
      render: (v: string) => formatTime(v),
    },
    {
      title: '下线时间', dataIndex: 'end_time', width: 140,
      render: (v: string) => formatTime(v),
    },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    {
      title: '操作', width: 80,
      render: (_: any, record: PositionConfig) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEdit(record); }}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/positions')} style={{ marginBottom: 16 }}>返回目录</Button>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions title={position.name} column={3}>
          <Descriptions.Item label="编码"><Tag>{position.code}</Tag></Descriptions.Item>
          <Descriptions.Item label="分类">{CATEGORY_LABELS[position.category] || position.category}</Descriptions.Item>
          <Descriptions.Item label="基础优先级">{position.priority_base}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={STATUS_COLORS[position.status]}>{position.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="配置数">{position.config_count || 0}</Descriptions.Item>
          <Descriptions.Item label="描述">{position.description || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {analytics && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}><Statistic title="曝光量" value={analytics.exposure} /></Col>
            <Col span={6}><Statistic title="点击量" value={analytics.click} /></Col>
            <Col span={6}><Statistic title="转化数" value={analytics.conversion} /></Col>
            <Col span={6}>
              <Statistic title="CTR" value={analytics.ctr} suffix="%" valueStyle={{ color: '#52c41a' }} />
            </Col>
          </Row>
        </Card>
      )}

      <Card title="关联配置" extra={<Button type="primary" onClick={() => navigate(`/configs/new?position_id=${position.id}`)}>新建配置</Button>}>
        <Table dataSource={configs} columns={configColumns} rowKey="id" size="small" pagination={false}
          onRow={(r) => ({ onClick: () => navigate(`/configs/${r.id}`), style: { cursor: 'pointer' } })}
        />
      </Card>

      <Modal
        title="快速编辑配置"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ marginBottom: 8 }}><strong>素材</strong></div>
            <Select
              showSearch
              value={editMaterialId}
              onChange={(v) => setEditMaterialId(v)}
              style={{ width: '100%' }}
              placeholder="选择素材"
              optionFilterProp="label"
              options={materials.map((m) => ({
                value: m.id,
                label: `${m.name} [${m.type}]`,
              }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}><strong>上线时间</strong></div>
            <Input
              type="datetime-local"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}><strong>下线时间</strong></div>
            <Input
              type="datetime-local"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
