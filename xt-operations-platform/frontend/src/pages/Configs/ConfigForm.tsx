import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, message, Spin, Slider,
  InputNumber, Radio, Steps, Divider, Tag, Row, Col, Typography, Switch,
  Descriptions, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, AppstoreOutlined, TeamOutlined, PictureOutlined,
  CheckCircleOutlined, ExperimentOutlined, SendOutlined,
} from '@ant-design/icons';
import { configsApi, positionsApi, crowdPacksApi, materialsApi } from '../../services/api';
import type { ResourcePosition, CrowdPack, Material } from '../../types';

const { Text, Title } = Typography;

const DEVICE_OPTIONS = [
  { value: 'all', label: '全平台' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
];

const FREQ_OPTIONS = [
  { value: 'none', label: '不限' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'campaign', label: '活动期内' },
];

const STEP_ITEMS = [
  { title: '选场域', description: 'APP资源位', icon: <AppstoreOutlined /> },
  { title: '选人群', description: '目标受众', icon: <TeamOutlined /> },
  { title: '选素材', description: '投放物料', icon: <PictureOutlined /> },
  { title: '投放设置', description: '规则与排期', icon: <ExperimentOutlined /> },
];

export default function ConfigForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [positions, setPositions] = useState<ResourcePosition[]>([]);
  const [crowdPacks, setCrowdPacks] = useState<CrowdPack[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const freqType = Form.useWatch('freq_limit_type', form);
  const selectedPosId = Form.useWatch('resource_position_id', form);
  const selectedCrowdId = Form.useWatch('crowd_pack_id', form);
  const selectedMaterialId = Form.useWatch('material_id', form);

  const selectedPosition = positions.find((p) => p.id === selectedPosId);
  const selectedCrowd = crowdPacks.find((c) => c.id === selectedCrowdId);
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  useEffect(() => {
    Promise.all([
      positionsApi.list(),
      crowdPacksApi.list(),
      materialsApi.list(),
    ]).then(([p, c, m]: any) => {
      setPositions(p.data || []);
      setCrowdPacks(c.data || []);
      setMaterials(m.data || []);
    });

    if (isEdit) {
      setLoading(true);
      configsApi.get(id!)
        .then((res: any) => {
          const d = res.data;
          form.setFieldsValue({
            ...d,
            channels: typeof d.channels === 'string' ? JSON.parse(d.channels) : d.channels,
            regions: typeof d.regions === 'string' ? JSON.parse(d.regions) : d.regions,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      const posId = searchParams.get('position_id');
      if (posId) form.setFieldValue('resource_position_id', posId);
    }
  }, [id]);

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        channels: values.channels || [],
        regions: (values.regions || []).map((r: any) => (typeof r === 'string' ? { code: r } : r)),
      };
      if (isEdit) {
        await configsApi.update(id!, payload);
        message.success('更新成功');
      } else {
        await configsApi.create(payload);
        message.success('配置已创建');
      }
      navigate('/configs');
    } catch (e: any) {
      message.error(e.message);
    }
    setSaving(false);
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/configs')} style={{ marginBottom: 16 }}>
        返回配置列表
      </Button>

      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          人货场动态配置 {isEdit ? '(编辑)' : ''}
        </Title>
        <Text type="secondary">
          {isEdit ? '修改资源位的人群定向和素材绑定' : '按步骤完成：选择场域 → 选择人群 → 选择素材 → 投放控制'}
        </Text>
      </div>

      {!isEdit && (
        <Steps
          current={currentStep}
          onChange={setCurrentStep}
          style={{ marginBottom: 24 }}
          items={STEP_ITEMS.map((s, i) => ({
            title: s.title,
            description: s.description,
            status: currentStep > i ? 'finish' : currentStep === i ? 'process' : 'wait',
          }))}
        />
      )}

      {/* 当前绑定预览 */}
      {(selectedPosition || selectedCrowd || selectedMaterial) && (
        <Alert
          type="info"
          style={{ marginBottom: 16 }}
          message={
            <Space size={40}>
              <span>
                <AppstoreOutlined style={{ color: '#1677ff', marginRight: 4 }} />
                <strong>场：</strong>
                {selectedPosition ? `${selectedPosition.name} (${selectedPosition.code})` : <Text type="secondary">未选择</Text>}
              </span>
              <span>
                <TeamOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                <strong>人：</strong>
                {selectedCrowd ? selectedCrowd.name : <Text type="secondary">全量用户</Text>}
              </span>
              <span>
                <PictureOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                <strong>货：</strong>
                {selectedMaterial ? `${selectedMaterial.name} [${selectedMaterial.type}]` : <Text type="secondary">未选择</Text>}
              </span>
            </Space>
          }
        />
      )}

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}
          initialValues={{
            device_type: 'all', gray_ratio: 100, priority: 340,
            freq_limit_type: 'none', freq_limit_count: 3, region_type: 'whitelist',
            status: 'draft', channels: [], regions: [],
          }}
        >
          {/* Step 1: 场 */}
          <div style={{ display: currentStep === 0 || currentStep >= 0 ? 'block' : 'none', marginBottom: 16 }}>
            <div style={{ background: '#f0f5ff', padding: '12px 16px', borderRadius: 8, marginBottom: 16, borderLeft: '4px solid #1677ff' }}>
              <Space>
                <AppstoreOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                <div>
                  <Text strong style={{ fontSize: 15 }}>场 — 选择 APP 资源位</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>确定在APP的哪个位置（场域）展示内容</Text>
                </div>
              </Space>
            </div>
            <Form.Item name="resource_position_id" label="资源位" rules={[{ required: true, message: '请选择资源位' }]}>
              <Select
                showSearch size="large"
                placeholder="选择投放的资源位..."
                optionFilterProp="label"
                onChange={() => setCurrentStep(1)}
                options={positions.map((p) => ({
                  value: p.id, key: p.id,
                  label: `${p.name} (${p.code}) [${p.category}]`,
                }))}
              />
            </Form.Item>
            {selectedPosition && (
              <Descriptions size="small" column={4} bordered style={{ background: '#fafafa' }}>
                <Descriptions.Item label="编码">{selectedPosition.code}</Descriptions.Item>
                <Descriptions.Item label="分类"><Tag>{selectedPosition.category}</Tag></Descriptions.Item>
                <Descriptions.Item label="基础优先级">{selectedPosition.priority_base}</Descriptions.Item>
                <Descriptions.Item label="描述">{selectedPosition.description || '-'}</Descriptions.Item>
              </Descriptions>
            )}
          </div>

          {/* Step 2: 人 */}
          <div style={{ display: currentStep === 1 || currentStep >= 1 ? 'block' : 'none', marginBottom: 16 }}>
            <div style={{ background: '#f9f0ff', padding: '12px 16px', borderRadius: 8, marginBottom: 16, borderLeft: '4px solid #722ed1' }}>
              <Space>
                <TeamOutlined style={{ color: '#722ed1', fontSize: 20 }} />
                <div>
                  <Text strong style={{ fontSize: 15 }}>人 — 选择目标人群包</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>确定哪些用户能看到这个内容（留空=全量用户）</Text>
                </div>
              </Space>
            </div>
            <Form.Item name="crowd_pack_id" label="人群包（留空=全量用户）">
              <Select
                allowClear size="large"
                showSearch
                placeholder="选择目标人群包..."
                optionFilterProp="label"
                onChange={() => setCurrentStep(2)}
                options={[
                  { value: '', label: '全量用户（不限定向）', key: 'all' },
                  ...crowdPacks.map((c) => ({
                    value: c.id, key: c.id,
                    label: `${c.name} — 覆盖 ${c.user_count?.toLocaleString()} 人`,
                  })),
                ]}
              />
            </Form.Item>
            {selectedCrowd && (
              <Descriptions size="small" column={3} bordered style={{ background: '#fafafa' }}>
                <Descriptions.Item label="人群包">{selectedCrowd.name}</Descriptions.Item>
                <Descriptions.Item label="组合逻辑"><Tag color={selectedCrowd.logic === 'AND' ? 'blue' : 'orange'}>{selectedCrowd.logic}</Tag></Descriptions.Item>
                <Descriptions.Item label="预估覆盖">{selectedCrowd.user_count?.toLocaleString()} 人</Descriptions.Item>
              </Descriptions>
            )}
          </div>

          {/* Step 3: 货 */}
          <div style={{ display: currentStep === 2 || currentStep >= 2 ? 'block' : 'none', marginBottom: 16 }}>
            <div style={{ background: '#fff7e6', padding: '12px 16px', borderRadius: 8, marginBottom: 16, borderLeft: '4px solid #fa8c16' }}>
              <Space>
                <PictureOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                <div>
                  <Text strong style={{ fontSize: 15 }}>货 — 选择投放素材</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>素材ID直接从后台素材库引用，支持多语言、CDN降级</Text>
                </div>
              </Space>
            </div>
            <Form.Item name="material_id" label="素材（引用后台素材库ID）" rules={[{ required: true, message: '请选择素材' }]}>
              <Select
                showSearch size="large"
                placeholder="选择要投放的素材..."
                optionFilterProp="label"
                onChange={() => setCurrentStep(3)}
                options={materials.map((m) => ({
                  value: m.id, key: m.id,
                  label: `${m.name} [${m.type}] — ID: ${m.id.slice(0, 12)}...`,
                }))}
              />
            </Form.Item>
            {selectedMaterial && (
              <Descriptions size="small" column={4} bordered style={{ background: '#fafafa' }}>
                <Descriptions.Item label="素材ID"><Text code>{selectedMaterial.id.slice(0, 16)}...</Text></Descriptions.Item>
                <Descriptions.Item label="名称">{selectedMaterial.name}</Descriptions.Item>
                <Descriptions.Item label="类型"><Tag color="orange">{selectedMaterial.type}</Tag></Descriptions.Item>
                <Descriptions.Item label="CDN">
                  {selectedMaterial.file_url ? (
                    <Text code style={{ fontSize: 11 }}>{selectedMaterial.file_url.slice(0, 30)}...</Text>
                  ) : '-'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>

          {/* Step 4: 投放设置 */}
          <div style={{ display: currentStep === 3 || currentStep >= 3 || isEdit ? 'block' : 'none', marginBottom: 16 }}>
            <div style={{ background: '#f6ffed', padding: '12px 16px', borderRadius: 8, marginBottom: 16, borderLeft: '4px solid #52c41a' }}>
              <Space>
                <ExperimentOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                <div>
                  <Text strong style={{ fontSize: 15 }}>投放控制 — 精细化运营设置</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>灰度比例、AB测试、频次控制、地域定向、排期管理</Text>
                </div>
              </Space>
            </div>

            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item name="priority" label="展示优先级 (330-363)">
                  <Slider min={330} max={363}
                    marks={{ 330: '低(330)', 340: '中', 350: '高', 360: '最高', 363: '任务' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gray_ratio" label="灰度比例 (%)">
                  <Slider min={0} max={100} step={10}
                    marks={{ 0: '0', 30: '30', 50: '50', 80: '80', 100: '100' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col span={6}>
                <Form.Item name="device_type" label="设备定向">
                  <Select options={DEVICE_OPTIONS} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="ab_group" label="AB实验分组">
                  <Select allowClear placeholder="无"
                    options={[{ value: 'A', label: '实验组A' }, { value: 'B', label: '实验组B' }]} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="freq_limit_type" label="频次控制">
                  <Select options={FREQ_OPTIONS} />
                </Form.Item>
              </Col>
              <Col span={6}>
                {freqType && freqType !== 'none' && (
                  <Form.Item name="freq_limit_count" label="上限次数">
                    <InputNumber min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                )}
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item name="region_type" label="地域定向策略">
                  <Radio.Group>
                    <Radio.Button value="whitelist">白名单（仅展示指定地区）</Radio.Button>
                    <Radio.Button value="blacklist">黑名单（排除指定地区）</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="regions" label="地区列表">
                  <Select mode="tags" placeholder="输入地区代码，如 CN, US, JP" tokenSeparators={[',']} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="channels" label="投放渠道">
                  <Select mode="multiple" placeholder="选择渠道"
                    options={[
                      { value: 'all', label: '全部渠道' },
                      { value: 'app', label: 'App' },
                      { value: 'h5', label: 'H5' },
                      { value: 'web', label: 'Web' },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="start_time" label="投放开始时间">
                  <Input type="datetime-local" />
                </Form.Item>
                <Form.Item name="end_time" label="投放结束时间">
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="status" label="配置状态">
              <Select style={{ width: 200 }}>
                <Select.Option value="draft">
                  <Space><Tag color="blue">草稿</Tag> 保存但不生效</Space>
                </Select.Option>
                <Select.Option value="online">
                  <Space><Tag color="green">上线</Tag> 立即生效</Space>
                </Select.Option>
                <Select.Option value="offline">
                  <Space><Tag>下线</Tag> 停止展示</Space>
                </Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Divider />
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              {!isEdit && currentStep > 0 && (
                <Button size="large" onClick={() => setCurrentStep(currentStep - 1)}>上一步</Button>
              )}
              <Button type="primary" size="large" htmlType="submit" loading={saving} icon={<SendOutlined />}>
                {isEdit ? '保存修改' : '完成 — 创建人货场配置'}
              </Button>
              <Button size="large" onClick={() => navigate('/configs')}>取消</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
