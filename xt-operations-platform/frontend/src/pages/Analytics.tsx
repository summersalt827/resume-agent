import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Select, Table, Spin, Tag } from 'antd';
import { ArrowUpOutlined, EyeOutlined, AimOutlined, CheckOutlined } from '@ant-design/icons';
import { analyticsApi, positionsApi } from '../services/api';
import type { AnalyticsOverview, ResourcePosition } from '../types';

export default function Analytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [positions, setPositions] = useState<ResourcePosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [positionAnalytics, setPositionAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    analyticsApi.overview(timeRange).then((res: any) => {
      setOverview(res.data);
      setLoading(false);
    });
    positionsApi.list().then((res: any) => setPositions(res.data || []));
  }, [timeRange]);

  useEffect(() => {
    if (!selectedPosition) return;
    analyticsApi.position(selectedPosition, '7d').then((res: any) => {
      setPositionAnalytics(res.data);
    });
  }, [selectedPosition]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const funnelColumns = [
    { title: '日期', dataIndex: 'day', width: 120 },
    { title: '曝光', dataIndex: 'exposure', width: 100 },
    { title: '点击', dataIndex: 'click', width: 100 },
    { title: '转化', dataIndex: 'conversion', width: 100 },
    {
      title: 'CTR', dataIndex: 'ctr', width: 80,
      render: (_: any, r: any) => {
        const ctr = r.exposure > 0 ? ((r.click / r.exposure) * 100).toFixed(1) : '0';
        return `${ctr}%`;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>数据监控看板</h2>
        <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}
          options={[
            { value: 'today', label: '今日' },
            { value: 'yesterday', label: '昨日' },
            { value: '7d', label: '近7天' },
            { value: '30d', label: '近30天' },
          ]}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="曝光量" value={overview?.total_exposures || 0} prefix={<EyeOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="点击量" value={overview?.total_clicks || 0} prefix={<AimOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="转化数" value={overview?.total_conversions || 0} prefix={<CheckOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="点击率 CTR"
              value={overview?.ctr || '0'} suffix="%"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: Number(overview?.ctr) > 3 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="资源位漏斗分析">
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="选择资源位查看漏斗数据"
            style={{ width: 300 }}
            value={selectedPosition || undefined}
            onChange={setSelectedPosition}
            allowClear
            options={positions.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` }))}
          />
        </div>

        {positionAnalytics && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}><Statistic title="总曝光" value={positionAnalytics.totals.exposure} /></Col>
              <Col span={6}><Statistic title="总点击" value={positionAnalytics.totals.click} /></Col>
              <Col span={6}><Statistic title="CTR" value={positionAnalytics.totals.ctr} suffix="%" /></Col>
              <Col span={6}><Statistic title="CVR" value={positionAnalytics.totals.cvr} suffix="%" /></Col>
            </Row>
            <Table
              dataSource={positionAnalytics.series || []}
              columns={funnelColumns}
              rowKey="day"
              size="small"
              pagination={false}
            />
          </>
        )}

        {!positionAnalytics && selectedPosition && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>正在加载...</div>
        )}
      </Card>

      <Card title="告警规则" style={{ marginTop: 16 }}>
        <Table
          dataSource={[
            { key: '1', name: 'CTR低于阈值', condition: 'CTR < 1.0%', action: '企业微信通知', status: 'active' },
            { key: '2', name: '曝光量为0', condition: 'exposure = 0', action: '邮件+企微通知', status: 'active' },
            { key: '3', name: '转化率异常下降', condition: 'CVR环比下降 > 50%', action: '告警风暴合并', status: 'active' },
            { key: '4', name: '配置异常', condition: '人群定向服务超时', action: '降级+企微通知', status: 'active' },
          ]}
          columns={[
            { title: '规则名称', dataIndex: 'name' },
            { title: '触发条件', dataIndex: 'condition' },
            { title: '通知方式', dataIndex: 'action' },
            { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color="green">{v}</Tag> },
          ]}
          pagination={false}
        />
      </Card>
    </div>
  );
}
