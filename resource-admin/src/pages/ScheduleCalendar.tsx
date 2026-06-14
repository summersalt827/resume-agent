import { useState } from 'react';
import {
  Table, Tag, Typography, Card, Space, Badge, Segmented, Timeline,
  Row, Col, Button, Alert,
} from 'antd';
import { CalendarOutlined, WarningOutlined } from '@ant-design/icons';
import { schedules } from '../mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { Schedule } from '../types';

const { Title, Text } = Typography;

const scheduleColumns: ColumnsType<Schedule> = [
  { title: '排期名称', dataIndex: 'schedule_name', key: 'name', render: (name: string) => <Text strong>{name}</Text> },
  { title: '模式', dataIndex: 'schedule_mode', key: 'mode', width: 80, render: (m: string) => <Tag color={m === 'fixed' ? 'blue' : 'green'}>{m === 'fixed' ? '固定排期' : '循环排期'}</Tag> },
  { title: '关联资源位', dataIndex: 'bound_position_names', key: 'positions', render: (names: string[]) => names.map(n => <Tag key={n}>{n}</Tag>) },
  { title: '开始时间', dataIndex: 'schedule_start', key: 'start', width: 160 },
  { title: '结束时间', dataIndex: 'schedule_end', key: 'end', width: 160 },
  { title: '循环规则', dataIndex: 'repeat_rule', key: 'repeat', width: 120, render: (r: string) => r || <Tag>—</Tag> },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Badge status={s === 'active' ? 'success' : 'default'} text={s === 'active' ? '生效中' : '草稿'} /> },
  { title: '冲突检测', dataIndex: 'conflict_check', key: 'conflict', width: 90, render: (c: boolean) => c ? <Tag color="green">已开启</Tag> : <Tag>已关闭</Tag> },
];

// Simulated calendar days
const daysInMay = 31;
const today = 23;
const scheduleColors: Record<string, string> = {
  'sch-001': '#1890ff',
  'sch-002': '#ff6b6b',
  'sch-003': '#52c41a',
  'sch-004': '#722ed1',
  'sch-005': '#fa8c16',
};

function getScheduleForDay(day: number): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  schedules.forEach((s) => {
    const startDay = parseInt(s.schedule_start.split('-')[2] || '1');
    const endDay = parseInt(s.schedule_end.split('-')[2] || '31');
    if (day >= startDay && day <= endDay) {
      result.push({ id: s.id, name: s.schedule_name });
    }
  });
  return result;
}

export default function ScheduleCalendar() {
  const [view, setView] = useState<string>('月视图');
  const [selectedDay, setSelectedDay] = useState<number>(today);

  const daySchedules = getScheduleForDay(selectedDay);

  return (
    <div>
      <Title level={4} className="page-header"><CalendarOutlined /> 排期管理</Title>

      <Space style={{ marginBottom: 16 }}>
        <Segmented
          options={['月视图', '周视图', '列表']}
          value={view}
          onChange={(v) => setView(v as string)}
        />
        <Button type="primary">新增排期</Button>
      </Space>

      {view !== '列表' && (
        <Card className="section-card">
          {/* Calendar Header */}
          <Row gutter={[4, 4]} style={{ marginBottom: 12 }}>
            <Col span={24} style={{ textAlign: 'center' }}>
              <Title level={5}>2026年5月</Title>
            </Col>
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <Col span={3} key={d} style={{ textAlign: 'center', padding: '4px 0' }}>
                <Text type="secondary" strong>{d}</Text>
              </Col>
            ))}
          </Row>

          {/* Calendar Grid */}
          <Row gutter={[4, 4]}>
            {Array.from({ length: daysInMay }, (_, i) => i + 1).map((day) => {
              const dayScheds = getScheduleForDay(day);
              const isToday = day === today;
              const isSelected = day === selectedDay;
              return (
                <Col span={3} key={day}>
                  <div
                    onClick={() => setSelectedDay(day)}
                    style={{
                      border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
                      borderRadius: 8,
                      padding: '6px 4px',
                      minHeight: 60,
                      cursor: 'pointer',
                      background: isToday ? '#e6f7ff' : isSelected ? '#f0f5ff' : '#fff',
                      textAlign: 'center',
                    }}
                  >
                    <Text strong style={{ color: isToday ? '#1890ff' : undefined }}>{day}</Text>
                    <div style={{ marginTop: 4 }}>
                      {dayScheds.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          style={{
                            background: scheduleColors[s.id] || '#d9d9d9',
                            color: '#fff',
                            fontSize: 10,
                            padding: '1px 4px',
                            borderRadius: 2,
                            marginBottom: 2,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {s.name}
                        </div>
                      ))}
                      {dayScheds.length > 2 && <Text style={{ fontSize: 10 }} type="secondary">+{dayScheds.length - 2} 更多</Text>}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

          {/* Selected Day Detail */}
          <Card size="small" style={{ marginTop: 16 }} title={`${selectedDay}日 排期详情`}>
            {daySchedules.length > 0 ? (
              <Timeline
                items={daySchedules.map((s) => ({
                  color: scheduleColors[s.id] || '#1890ff',
                  children: <Text>{s.name}</Text>,
                }))}
              />
            ) : (
              <Text type="secondary">当日无排期</Text>
            )}
          </Card>
        </Card>
      )}

      {/* Conflict Warning */}
      <Alert
        message="排期冲突提示"
        description={`检测到 2 个潜在冲突：弹窗运营位与顶部头图在 2026-06-01 ~ 2026-06-10 时间段优先级重叠，请检查。`}
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginTop: 16 }}
      />

      {/* List View */}
      <Card title="排期列表" className="section-card" style={{ marginTop: 16 }}>
        <Table
          columns={scheduleColumns}
          dataSource={schedules}
          rowKey="id"
          size="middle"
          pagination={false}
        />
      </Card>
    </div>
  );
}
