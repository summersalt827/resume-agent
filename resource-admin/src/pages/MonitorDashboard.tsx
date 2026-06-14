import {
  Row, Col, Card, Statistic, Typography, Table, Tag, Space,
  List, Badge, Segmented, Button,
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, MonitorOutlined,
  BellOutlined, AlertOutlined,
} from '@ant-design/icons';
import { metricData, monitorConfigs, alertHistories } from '../mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { MonitorConfig, AlertHistory } from '../types';

const { Title, Text } = Typography;

const alertColumns: ColumnsType<AlertHistory> = [
  { title: '监控名称', dataIndex: 'monitor_name', width: 160 },
  { title: '指标', dataIndex: 'metric', width: 100 },
  { title: '条件', dataIndex: 'condition', width: 80 },
  { title: '阈值', dataIndex: 'threshold', width: 80 },
  { title: '实际值', dataIndex: 'actual_value', width: 80, render: (v: number) => <Text strong style={{ color: '#ff4d4f' }}>{v}</Text> },
  { title: '级别', dataIndex: 'level', width: 70, render: (l: string) => <Tag color={l === '高' ? 'red' : 'orange'}>{l}</Tag> },
  { title: '通知渠道', dataIndex: 'channel', width: 130 },
  { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Badge status={s === '已处理' ? 'success' : 'processing'} text={s} /> },
  { title: '时间', dataIndex: 'created_at', width: 160 },
];

const monitorColumns: ColumnsType<MonitorConfig> = [
  { title: '监控名称', dataIndex: 'monitor_name', render: (n: string) => <Text strong>{n}</Text> },
  { title: '关联资源位', dataIndex: 'bound_positions', render: (p: string[]) => p.map(n => <Tag key={n}>{n}</Tag>) },
  { title: '监控指标', dataIndex: 'metrics', render: (m: string[]) => m.map(n => <Tag key={n} color="blue">{n}</Tag>) },
  { title: '刷新频率', dataIndex: 'refresh_interval', render: (r: string) => <Tag>{r}</Tag> },
  { title: '告警', dataIndex: 'alert_enabled', render: (a: boolean) => a ? <Tag color="orange">已开启</Tag> : <Tag>未开启</Tag> },
  { title: '告警规则', dataIndex: 'alert_rules', render: (r: any[]) => `${r.length} 条` },
];

export default function MonitorDashboard() {
  return (
    <div>
      <Title level={4} className="page-header"><MonitorOutlined /> 数据监控</Title>

      {/* Metric Cards */}
      <Row gutter={[16, 16]}>
        {metricData.slice(0, 8).map((m) => (
          <Col xs={12} sm={6} key={m.metric_code}>
            <Card className="section-card" size="small">
              <Statistic
                title={m.metric_name}
                value={m.value}
                suffix={m.unit === '%' ? '%' : m.unit}
                precision={m.unit === '%' ? 1 : 0}
                valueStyle={{ fontSize: 24 }}
                prefix={m.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              />
              <div className="stat-change">
                <Text type={m.change >= 0 ? 'success' : 'danger'}>
                  {m.change >= 0 ? '+' : ''}{m.change}% vs 上周
                </Text>
              </div>
              {/* Simple bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 32, marginTop: 8 }}>
                {m.trend.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${(v / Math.max(...m.trend)) * 100}%`,
                      background: m.change >= 0 ? '#52c41a' : '#ff4d4f',
                      borderRadius: '2px 2px 0 0',
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
              <Text type="secondary" style={{ fontSize: 10, marginTop: 4, display: 'block' }}>近7天趋势</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Monitoring Configs */}
      <Card
        title={<Space><MonitorOutlined /> 监控配置</Space>}
        className="section-card"
        style={{ marginTop: 16 }}
        extra={<Button type="primary" size="small">新增监控</Button>}
      >
        <Table columns={monitorColumns} dataSource={monitorConfigs} rowKey="id" size="middle" pagination={false} />
      </Card>

      {/* Active monitors detail */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {monitorConfigs.map((config) => (
          <Col xs={24} md={12} key={config.id}>
            <Card
              title={config.monitor_name}
              size="small"
              extra={config.alert_enabled ? <Badge status="processing" text="告警中" /> : <Badge status="default" text="未告警" />}
            >
              <Space wrap>
                {config.metrics.map((m) => (
                  <Tag key={m} color="blue">{m}</Tag>
                ))}
              </Space>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">刷新频率: {config.refresh_interval}</Text>
              </div>
              {config.alert_rules.length > 0 && (
                <List
                  size="small"
                  style={{ marginTop: 8 }}
                  dataSource={config.alert_rules}
                  renderItem={(rule) => (
                    <List.Item>
                      <Space>
                        <AlertOutlined style={{ color: '#faad14' }} />
                        <Text>{rule.metric}</Text>
                        <Tag>{rule.condition}</Tag>
                        <Text strong>{rule.threshold}{rule.unit}</Text>
                        <Text type="secondary">持续{rule.duration}分钟</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              )}
              {config.alert_channel.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">通知方式: </Text>
                  {config.alert_channel.map((ch) => <Tag key={ch}>{ch}</Tag>)}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Alert History */}
      <Card
        title={<Space><BellOutlined /> 告警历史</Space>}
        className="section-card"
        style={{ marginTop: 16 }}
        extra={<Segmented size="small" options={['全部', '高', '中', '低']} />}
      >
        <Table columns={alertColumns} dataSource={alertHistories} rowKey="id" size="middle" pagination={false} />
      </Card>
    </div>
  );
}
