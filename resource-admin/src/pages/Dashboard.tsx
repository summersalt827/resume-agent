import { Row, Col, Card, Statistic, Table, Timeline, Tag, List, Typography } from 'antd';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { resourcePositionDefs } from '../mock/data';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;

const activeCount = resourcePositionDefs.filter(r => r.is_required || r.default_priority > 0).length;
const totalCount = resourcePositionDefs.length;

const recentChanges = [
  { time: '2026-05-22 10:00', action: '上线', target: 'Meme币狂欢周跑马灯', operator: '运营小明' },
  { time: '2026-05-21 18:00', action: '创建', target: 'Meme币活动PUSH推送', operator: '运营小红' },
  { time: '2026-05-21 14:00', action: '修改', target: 'BTC突破10万U弹窗-灰度调至50%', operator: '运营小明' },
  { time: '2026-05-20 15:00', action: '创建', target: '6月交易挑战排期', operator: '运营小红' },
  { time: '2026-05-20 09:00', action: '上线', target: 'BTC突破10万U弹窗+头图', operator: '运营小明' },
];

const activeResources = [
  { name: '弹窗运营位', status: 'active', time: '05.20 - 06.20', priority: 352 },
  { name: '首页跑马灯', status: 'active', time: '05.15 - 06.15', priority: '-' },
  { name: '顶部运营头图', status: 'active', time: '05.20 - 06.10', priority: 351 },
  { name: '底部运营四宫图', status: 'active', time: '05.01 - 05.31', priority: 350 },
  { name: '福利中心入口', status: 'active', time: '05.01 - 12.31', priority: 340 },
  { name: '新人专享任务', status: 'active', time: '05.01 - 06.30', priority: 360 },
  { name: '成长任务', status: 'active', time: '05.01 - 12.31', priority: 361 },
  { name: '新用户引导弹窗', status: 'active', time: '05.01 - 12.31', priority: 353 },
  { name: '行情区资源位', status: 'active', time: '05.22 - 06.05', priority: 330 },
  { name: 'PUSH推送-Meme', status: 'sending', time: '05.22 - 05.29', priority: '中' },
];

interface ChangeRecord {
  time: string;
  action: string;
  target: string;
  operator: string;
}

const changeColumns: ColumnsType<ChangeRecord> = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, render: (a: string) => <Tag color={a === '上线' ? 'green' : a === '创建' ? 'blue' : 'orange'}>{a}</Tag> },
  { title: '目标', dataIndex: 'target', key: 'target' },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
];

export default function Dashboard() {
  return (
    <div>
      <Title level={4} className="page-header">运营看板</Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic title="资源位总数" value={totalCount} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic title="启用中" value={activeCount} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic title="告警通知" value={3} valueStyle={{ color: '#faad14' }} prefix={<ExclamationCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic title="今日曝光" value={285} suffix="万" prefix={<ThunderboltOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="当前活跃资源位" className="section-card">
            <List
              dataSource={activeResources}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.status === 'active' ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} /> : <ThunderboltOutlined style={{ color: '#1890ff', fontSize: 18 }} />}
                    title={<Text strong>{item.name}</Text>}
                    description={`投放时段: ${item.time}`}
                  />
                  <Tag color={item.status === 'active' ? 'green' : 'blue'}>{item.status === 'active' ? '启用中' : '发送中'}</Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>优先级: {item.priority}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最近操作记录" className="section-card">
            <Table
              columns={changeColumns}
              dataSource={recentChanges}
              rowKey="time"
              size="small"
              pagination={false}
              showHeader={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="系统告警" className="section-card">
            <Timeline
              items={[
                { color: 'red', children: <><Text strong>[高]</Text> PUSH送达率降至82.3%，低于阈值85% <Tag>2026-05-22 16:00</Tag></> },
                { color: 'orange', children: <><Text strong>[中]</Text> 弹窗CTR降至1.8%，低于阈值2% <Tag>2026-05-22 14:30</Tag></> },
                { color: 'red', children: <><Text strong>[高]</Text> PUSH退订率升至4.2%，超过阈值3% <Tag>2026-05-23 09:00</Tag></> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
