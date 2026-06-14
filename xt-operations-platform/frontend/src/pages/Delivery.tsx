import { useState } from 'react';
import { Card, Form, Input, Select, Button, Space, message, Table, Tag, Descriptions, Collapse, Divider } from 'antd';
import { SendOutlined, ExperimentOutlined } from '@ant-design/icons';
import { deliveryApi, positionsApi } from '../services/api';
import type { DeliveryMatchResult, ResourcePosition } from '../types';
import { useEffect } from 'react';

export default function Delivery() {
  const [form] = Form.useForm();
  const [result, setResult] = useState<DeliveryMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<ResourcePosition[]>([]);

  useEffect(() => {
    positionsApi.list().then((res: any) => setPositions(res.data || []));
  }, []);

  const handleMatch = async (values: any) => {
    setLoading(true);
    try {
      const res: any = await deliveryApi.match(values);
      setResult(res.data);
    } catch (e: any) {
      message.error(e.message);
    }
    setLoading(false);
  };

  const matchColumns = [
    {
      title: '状态', dataIndex: 'passed', width: 80,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '命中' : '未命中'}</Tag>,
    },
    { title: '配置ID', dataIndex: 'config_id', width: 100, render: (v: string) => v?.slice(0, 8) + '...' },
    { title: '资源位', dataIndex: 'position_name', width: 120 },
    { title: '素材', dataIndex: 'material_name', width: 130 },
    { title: '优先级', dataIndex: 'priority', width: 70 },
    {
      title: '规则链详情', dataIndex: 'results', width: 300,
      render: (results: any[]) => (
        <Space size={2} wrap>
          {results?.map((r: any, i: number) => (
            <Tag key={i} color={r.passed ? 'green' : 'red'} style={{ fontSize: 10 }}>
              {r.step}.{r.rule}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="下发调试工具" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleMatch}
          initialValues={{ deviceType: 'ios', region: 'CN', channel: 'app', abGroup: 'A', freqCount: 0 }}>
          <Form.Item name="userId" label="用户ID">
            <Input placeholder="test-user-001" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="deviceType" label="设备">
            <Select style={{ width: 100 }}
              options={[{ value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }]} />
          </Form.Item>
          <Form.Item name="region" label="地域">
            <Input placeholder="CN" style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="channel" label="渠道">
            <Select style={{ width: 100 }}
              options={[{ value: 'app', label: 'App' }, { value: 'h5', label: 'H5' }, { value: 'web', label: 'Web' }]} />
          </Form.Item>
          <Form.Item name="positionCode" label="资源位(可选)">
            <Select allowClear style={{ width: 160 }} placeholder="全部资源位"
              options={positions.map((p) => ({ value: p.code, label: `${p.name}` }))} />
          </Form.Item>
          <Form.Item name="abGroup" label="AB分组">
            <Select style={{ width: 80 }}
              options={[{ value: 'A', label: 'A组' }, { value: 'B', label: 'B组' }]} />
          </Form.Item>
          <Form.Item name="freqCount" label="已触达次数">
            <Input type="number" style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<ExperimentOutlined />}>
              模拟匹配
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {result && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Descriptions title="模拟用户信息" size="small" column={6}>
              <Descriptions.Item label="用户ID">{result.user.userId}</Descriptions.Item>
              <Descriptions.Item label="设备">{result.user.deviceType}</Descriptions.Item>
              <Descriptions.Item label="地域">{result.user.region}</Descriptions.Item>
              <Descriptions.Item label="渠道">{result.user.channel}</Descriptions.Item>
              <Descriptions.Item label="AB组">{result.user.abGroup}</Descriptions.Item>
              <Descriptions.Item label="已触达">{result.user.freqCount}次</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Space size="large">
              <span>总配置数: <strong>{result.total_configs}</strong></span>
              <span style={{ color: '#52c41a' }}>命中配置: <strong>{result.matched_count}</strong></span>
              <span style={{ color: '#ff4d4f' }}>未命中: <strong>{result.total_configs - result.matched_count}</strong></span>
            </Space>
          </Card>

          {result.matched.length > 0 && (
            <Card title="最终命中配置 (按优先级排序)" style={{ marginBottom: 16, borderColor: '#52c41a' }}>
              {result.matched.map((m, i) => (
                <Card key={i} size="small" style={{ marginBottom: 8 }} type="inner">
                  <Descriptions size="small" column={4}>
                    <Descriptions.Item label="资源位"><Tag color="blue">{m.position_name}</Tag></Descriptions.Item>
                    <Descriptions.Item label="素材">{m.material_name}</Descriptions.Item>
                    <Descriptions.Item label="优先级">{m.priority}</Descriptions.Item>
                    <Descriptions.Item label="配置ID">{m.config_id?.slice(0, 12)}...</Descriptions.Item>
                  </Descriptions>
                </Card>
              ))}
            </Card>
          )}

          <Card title="完整匹配结果 (所有配置)">
            <Table dataSource={result.results} columns={matchColumns} rowKey="config_id" size="small"
              pagination={false} scroll={{ x: 800 }} />
          </Card>
        </>
      )}
    </div>
  );
}
