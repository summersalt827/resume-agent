import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, message, Spin, Tabs } from 'antd';
import { materialsApi } from '../../services/api';

const LANGUAGES = [
  { key: 'zh', label: '简体中文' },
  { key: 'en', label: 'English' },
  { key: 'zh-TW', label: '繁體中文' },
  { key: 'ja', label: '日本語' },
  { key: 'ko', label: '한국어' },
];

export default function MaterialForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const materialType = Form.useWatch('type', form);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      materialsApi.get(id!)
        .then((res: any) => {
          const d = res.data;
          const content = typeof d.content === 'string' ? JSON.parse(d.content) : d.content;
          form.setFieldsValue({ ...d, content });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      if (isEdit) {
        await materialsApi.update(id!, values);
        message.success('更新成功');
      } else {
        await materialsApi.create(values);
        message.success('创建成功');
      }
      navigate('/materials');
    } catch (e: any) {
      message.error(e.message);
    }
    setSaving(false);
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card title={isEdit ? '编辑素材' : '上传素材'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'image', status: 'online' }}>
        <Form.Item name="name" label="素材名称" rules={[{ required: true }]}>
          <Input placeholder="例如：跟单交易推广Banner" />
        </Form.Item>
        <Form.Item name="type" label="素材类型" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="image">图片</Select.Option>
            <Select.Option value="text">文字</Select.Option>
            <Select.Option value="link">链接</Select.Option>
            <Select.Option value="video">视频</Select.Option>
          </Select>
        </Form.Item>

        {materialType === 'image' || materialType === 'video' ? (
          <>
            <Form.Item name="file_url" label="主URL (CDN)">
              <Input placeholder="https://cdn.xt.com/materials/..." />
            </Form.Item>
            <Form.Item name="fallback_url" label="降级URL (备用CDN)">
              <Input placeholder="降级兜底图片地址" />
            </Form.Item>
          </>
        ) : null}

        <Form.Item label="多语言内容">
          <Tabs items={LANGUAGES.map((lang) => ({
            key: lang.key,
            label: lang.label,
            children: (
              <div>
                {materialType === 'text' ? (
                  <Form.Item name={['content', lang.key, 'text']} label="文案内容" style={{ marginBottom: 8 }}>
                    <Input.TextArea rows={2} placeholder={`${lang.label} 文案`} />
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item name={['content', lang.key, 'title']} label="标题" style={{ marginBottom: 8 }}>
                      <Input placeholder="资源位主标题" />
                    </Form.Item>
                    <Form.Item name={['content', lang.key, 'subtitle']} label="副标题">
                      <Input placeholder="资源位副标题" />
                    </Form.Item>
                  </>
                )}
              </div>
            ),
          }))} />
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="online">上线</Select.Option>
            <Select.Option value="offline">下线</Select.Option>
            <Select.Option value="expired">过期</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              {isEdit ? '保存修改' : '创建素材'}
            </Button>
            <Button onClick={() => navigate('/materials')}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
