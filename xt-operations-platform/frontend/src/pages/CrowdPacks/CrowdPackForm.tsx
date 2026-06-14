import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, message, Spin, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { crowdPacksApi } from '../../services/api';
import { CROWD_DIMENSIONS, CROWD_OPERATORS } from './constants';

const DIMENSIONS = CROWD_DIMENSIONS;
const OPERATORS = CROWD_OPERATORS;

export default function CrowdPackForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      crowdPacksApi.get(id!)
        .then((res: any) => {
          const d = res.data;
          const rules = typeof d.rules === 'string' ? JSON.parse(d.rules) : d.rules;
          form.setFieldsValue({ ...d, rules: rules || [] });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      if (isEdit) {
        await crowdPacksApi.update(id!, values);
        message.success('更新成功');
      } else {
        await crowdPacksApi.create(values);
        message.success('创建成功');
      }
      navigate('/crowd-packs');
    } catch (e: any) {
      message.error(e.message);
    }
    setSaving(false);
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card title={isEdit ? '编辑人群包' : '新建人群包'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ logic: 'AND', status: 'active', rules: [] }}>
        <Form.Item name="name" label="人群包名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="例如：VIP用户(SVIP+LV5)" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={2} placeholder="人群包说明" />
        </Form.Item>

        <Form.Item label="人群规则">
          <Form.List name="rules">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" wrap style={{ marginBottom: 8 }}>
                    <Form.Item {...rest} name={[name, 'dimension']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <Select placeholder="维度" style={{ width: 140 }}>
                        {DIMENSIONS.map((d) => (
                          <Select.Option key={d.key} value={d.key}>{d.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'operator']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <Select placeholder="操作符" style={{ width: 120 }}>
                        {OPERATORS[Form.useWatch(['rules', name, 'dimension'], form) as string]?.map((op: any) => (
                          <Select.Option key={op.key} value={op.key}>{op.label}</Select.Option>
                        )) || []}
                      </Select>
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'value']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <Input placeholder="值" style={{ width: 160 }} />
                    </Form.Item>
                    <Button icon={<DeleteOutlined />} onClick={() => remove(name)} danger size="small" />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add({ dimension: 'user_type', operator: 'eq', value: '' })} icon={<PlusOutlined />} size="small">
                  添加规则
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item name="logic" label="组合逻辑" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio.Button value="AND">AND（全部满足）</Radio.Button>
            <Radio.Button value="OR">OR（任一满足）</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="active">启用</Select.Option>
            <Select.Option value="inactive">停用</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              {isEdit ? '保存修改' : '创建人群包'}
            </Button>
            <Button onClick={() => navigate('/crowd-packs')}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
