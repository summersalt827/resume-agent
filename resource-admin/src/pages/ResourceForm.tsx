import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Typography, Button, Space, Tag, Table,
  Divider, Empty,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import {
  resourcePositionDefs, popupConfigs, marqueeConfigs, bannerConfigs,
  gridConfigs, depositTaskConfigs, tradeTaskConfigs, newUserTaskConfigs,
  growthTaskConfigs, exclusiveTaskConfigs, challengeConfigs, guidePopupConfigs,
  welfareEntryConfigs, activityCalendarConfigs, couponCenterConfigs,
  marketBannerConfigs, tradingPairRecConfigs, searchBarConfigs, pushConfigs,
  navMenuItems,
} from '../mock/data';
const { Title, Text } = Typography;

const resourceCodeToConfig: Record<string, any[]> = {
  popup_operation: popupConfigs,
  marquee: marqueeConfigs,
  top_banner: bannerConfigs,
  bottom_grid: gridConfigs,
  welfare_entry: welfareEntryConfigs,
  new_user_task: newUserTaskConfigs,
  growth_task: growthTaskConfigs,
  exclusive_task: exclusiveTaskConfigs,
  time_challenge: challengeConfigs,
  first_deposit_task: depositTaskConfigs,
  first_trade_task: tradeTaskConfigs,
  new_user_guide_popup: guidePopupConfigs,
  activity_calendar: activityCalendarConfigs,
  coupon_center: couponCenterConfigs,
  market_banner: marketBannerConfigs,
  trading_pair_rec: tradingPairRecConfigs,
  search_bar: searchBarConfigs,
  push: pushConfigs,
};

function OperationControlDisplay({ control }: { control: any }) {
  if (!control) return <Empty description="无运营控制配置" />;
  return (
    <Descriptions size="small" column={3} bordered>
      <Descriptions.Item label="上线开关"><Tag color={control.is_active ? 'green' : 'red'}>{control.is_active ? '已开启' : '已关闭'}</Tag></Descriptions.Item>
      <Descriptions.Item label="灰度比例">{control.grayscale_ratio ?? 100}%</Descriptions.Item>
      <Descriptions.Item label="设备定向">{(control.device_type || ['all']).join(' / ')}</Descriptions.Item>
      <Descriptions.Item label="人群定向">{control.crowd_targeting?.length ? control.crowd_targeting.join(', ') : '不限'}</Descriptions.Item>
      <Descriptions.Item label="地域定向">{control.region_targeting ? '已配置' : '不限'}</Descriptions.Item>
      <Descriptions.Item label="AB测试分组">{control.ab_group || '未关联'}</Descriptions.Item>
      <Descriptions.Item label="频次上限">{control.frequency_cap || 0}</Descriptions.Item>
      <Descriptions.Item label="频次周期">{control.frequency_period || '-'}</Descriptions.Item>
      <Descriptions.Item label="关联实验ID">{control.experiment_id || '-'}</Descriptions.Item>
      {control.trigger_timing !== undefined && <Descriptions.Item label="展示时机">{control.trigger_timing}</Descriptions.Item>}
      {control.show_delay !== undefined && <Descriptions.Item label="展示延迟">{control.show_delay}秒</Descriptions.Item>}
      {control.task_validity_period !== undefined && <Descriptions.Item label="任务有效期">{control.task_validity_period}天</Descriptions.Item>}
    </Descriptions>
  );
}

export default function ResourceForm() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const def = resourcePositionDefs.find((r) => r.code === code);
  const configs = code ? (resourceCodeToConfig[code] || []) : [];

  if (!def) {
    return (
      <Card>
        <Empty description="资源位不存在">
          <Button onClick={() => navigate('/resource-positions')}>返回列表</Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/resource-positions')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>{def.name} - 配置详情</Title>
        <Tag color="blue">{def.code}</Tag>
        {def.is_required && <Tag color="red">必配</Tag>}
      </Space>

      <Card title="基本信息" className="section-card" size="small">
        <Descriptions column={3} size="small">
          <Descriptions.Item label="资源位名称">{def.name}</Descriptions.Item>
          <Descriptions.Item label="资源位编码">{def.code}</Descriptions.Item>
          <Descriptions.Item label="展示位置">{def.position}</Descriptions.Item>
          <Descriptions.Item label="默认优先级">{def.default_priority || '—'}</Descriptions.Item>
          <Descriptions.Item label="分类">{def.category}</Descriptions.Item>
          <Descriptions.Item label="是否必配">{def.is_required ? '是' : '否'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {configs.length === 0 && code && navMenuItems.some(n => n.code === code) ? (
        <Card title="导航菜单配置" className="section-card" style={{ marginTop: 16 }}>
          <Table
            dataSource={navMenuItems.filter(n => n.code === code)}
            rowKey="id"
            size="small"
            pagination={false}
            columns={[
              { title: '名称', dataIndex: 'name' },
              { title: '链接', dataIndex: 'link' },
              { title: '是否NEW', dataIndex: 'is_new', render: (v: boolean) => v ? <Tag color="green">NEW</Tag> : '—' },
              { title: '排序', dataIndex: 'sort_order' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag> },
            ]}
          />
        </Card>
      ) : configs.length === 0 ? (
        <Card style={{ marginTop: 16 }}>
          <Empty description="暂无配置数据，点击下方按钮新增">
            <Button type="primary" icon={<EditOutlined />}>新增配置</Button>
          </Empty>
        </Card>
      ) : (
        configs.map((config: any, idx: number) => (
          <Card
            key={config.id || idx}
            title={<Space>{config.resource_position || config.push_name || `配置 #${idx + 1}`}<Tag color="green">启用中</Tag></Space>}
            className="section-card"
            style={{ marginTop: 16 }}
            extra={<Button type="primary" size="small" icon={<EditOutlined />}>编辑</Button>}
          >
            {/* 通用字段 */}
            <Descriptions size="small" column={3} bordered>
              {config.priority !== undefined && <Descriptions.Item label="优先级">{config.priority}</Descriptions.Item>}
              {config.remark && <Descriptions.Item label="备注">{config.remark}</Descriptions.Item>}
              {config.start_time && <Descriptions.Item label="投放开始">{config.start_time}</Descriptions.Item>}
              {config.end_time && <Descriptions.Item label="投放结束">{config.end_time}</Descriptions.Item>}
              {config.channels && <Descriptions.Item label="投放渠道">{config.channels.join(', ')}</Descriptions.Item>}
              {config.status && <Descriptions.Item label="状态"><Tag color={config.status === 'active' ? 'green' : config.status === 'draft' ? 'default' : 'orange'}>{config.status}</Tag></Descriptions.Item>}
              {config.frequency_limit && <Descriptions.Item label="展示频控">{config.frequency_limit}</Descriptions.Item>}
            </Descriptions>

            {/* 弹窗特有字段 */}
            {(config.popup_title || config.popup_bg_image) && (
              <>
                <Divider plain>弹窗内容</Divider>
                <Descriptions size="small" column={2} bordered>
                  <Descriptions.Item label="弹窗标题">{config.popup_title}</Descriptions.Item>
                  <Descriptions.Item label="跳转按钮文案">{config.btn_text}</Descriptions.Item>
                  <Descriptions.Item label="引导文案" span={2}>{config.popup_guide_text}</Descriptions.Item>
                  <Descriptions.Item label="背景图">{config.popup_bg_image}</Descriptions.Item>
                  <Descriptions.Item label="跳转链接">{config.btn_link || config.link}</Descriptions.Item>
                  {config.activity_name && <Descriptions.Item label="活动名称">{config.activity_name}</Descriptions.Item>}
                </Descriptions>
              </>
            )}

            {/* 四宫格子表 */}
            {config.grid_items && (
              <>
                <Divider plain>宫格列表</Divider>
                <Table
                  dataSource={config.grid_items}
                  rowKey="grid_order"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '序号', dataIndex: 'grid_order', width: 60 },
                    { title: '活动名称', dataIndex: 'activity_name' },
                    { title: '图标', dataIndex: 'grid_icon', render: (v: string) => <a href={v} target="_blank">查看</a> },
                    { title: '跳转链接', dataIndex: 'link', ellipsis: true },
                  ]}
                />
              </>
            )}

            {/* 奖励阶段子表 */}
            {config.reward_stages && (
              <>
                <Divider plain>奖励阶段</Divider>
                <Table
                  dataSource={config.reward_stages}
                  rowKey="stage_order"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '阶段', dataIndex: 'stage_order', width: 60 },
                    { title: '人数规模', dataIndex: 'crowd_size' },
                    { title: '奖品名称', dataIndex: 'prize_name' },
                    { title: '奖品价值(元)', dataIndex: 'prize_value' },
                    { title: '数量', dataIndex: 'prize_count' },
                    { title: '中奖概率(‰)', dataIndex: 'win_rate' },
                  ]}
                />
              </>
            )}

            {/* 任务阶段子表 */}
            {config.task_stages && (
              <>
                <Divider plain>任务阶段</Divider>
                <Table
                  dataSource={config.task_stages}
                  rowKey="stage_order"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '阶段', dataIndex: 'stage_order', width: 60 },
                    { title: '阶段名称', dataIndex: 'stage_name' },
                    { title: '奖励范围', dataIndex: 'reward_range' },
                    { title: '奖励文案', dataIndex: 'stage_reward_text' },
                    { title: '按钮', dataIndex: 'btn_text' },
                  ]}
                />
              </>
            )}

            {/* 任务列表子表 */}
            {config.task_list && (
              <>
                <Divider plain>任务列表</Divider>
                <Table
                  dataSource={config.task_list}
                  rowKey="task_order"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '序号', dataIndex: 'task_order', width: 60 },
                    { title: '任务名称', dataIndex: 'task_name' },
                    { title: '描述', dataIndex: 'task_description', ellipsis: true },
                    { title: '奖励', dataIndex: 'reward_text' },
                    { title: '目标值', dataIndex: 'target_value' },
                    { title: '按钮', dataIndex: 'btn_text' },
                  ]}
                />
              </>
            )}

            {/* 活动日历 */}
            {config.activity_list && (
              <>
                <Divider plain>活动列表</Divider>
                <Table
                  dataSource={config.activity_list}
                  rowKey="activity_order"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '序号', dataIndex: 'activity_order', width: 60 },
                    { title: '活动名称', dataIndex: 'activity_name', ellipsis: true },
                    { title: '类型', dataIndex: 'activity_type', render: (v: string) => <Tag>{v}</Tag> },
                    { title: '开始时间', dataIndex: 'start_time' },
                    { title: '结束时间', dataIndex: 'end_time' },
                    { title: '标签', dataIndex: 'activity_tags', render: (tags: string[]) => tags.map(t => <Tag key={t} color="blue">{t}</Tag>) },
                  ]}
                />
              </>
            )}

            {/* 卡券列表 */}
            {config.coupon_list && (
              <>
                <Divider plain>卡券列表</Divider>
                <Table
                  dataSource={config.coupon_list}
                  rowKey="coupon_order"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '序号', dataIndex: 'coupon_order', width: 60 },
                    { title: '卡券名称', dataIndex: 'coupon_name' },
                    { title: '面值', dataIndex: 'coupon_value' },
                    { title: '使用条件', dataIndex: 'use_condition', ellipsis: true },
                    { title: '剩余数量', dataIndex: 'remaining_count' },
                    { title: '状态', dataIndex: 'coupon_status', render: (s: string) => <Tag color={s === '可领取' ? 'green' : 'default'}>{s}</Tag> },
                  ]}
                />
              </>
            )}

            {/* PUSH特有字段 */}
            {config.push_type && (
              <>
                <Divider plain>推送详情</Divider>
                <Descriptions size="small" column={3} bordered>
                  <Descriptions.Item label="推送类型"><Tag color="blue">{config.push_type}</Tag></Descriptions.Item>
                  <Descriptions.Item label="推送标题">{config.push_title}</Descriptions.Item>
                  <Descriptions.Item label="推送优先级"><Tag color={config.push_priority === 'high' ? 'red' : config.push_priority === 'medium' ? 'orange' : 'default'}>{config.push_priority}</Tag></Descriptions.Item>
                  <Descriptions.Item label="推送内容" span={3}>{config.push_body}</Descriptions.Item>
                  <Descriptions.Item label="DeepLink" span={2}>{config.deeplink}</Descriptions.Item>
                  <Descriptions.Item label="推送渠道">{config.push_channel?.join(', ')}</Descriptions.Item>
                  <Descriptions.Item label="触发方式"><Tag>{config.trigger_type}</Tag></Descriptions.Item>
                  <Descriptions.Item label="分批投递">{config.batch_delivery ? `是 (每批${config.batch_ratio}%)` : '否'}</Descriptions.Item>
                  <Descriptions.Item label="每日上限">{config.daily_cap}条</Descriptions.Item>
                  <Descriptions.Item label="每周上限">{config.weekly_cap}条</Descriptions.Item>
                  <Descriptions.Item label="每月上限">{config.monthly_cap}条</Descriptions.Item>
                  <Descriptions.Item label="优先级穿透">{config.priority_override ? '开启' : '关闭'}</Descriptions.Item>
                  {config.time_window && <Descriptions.Item label="推送时段">{config.time_window[0]} - {config.time_window[1]}</Descriptions.Item>}
                  {config.dnd_time_range && <Descriptions.Item label="免打扰">{config.dnd_time_range[0]} - {config.dnd_time_range[1]}</Descriptions.Item>}
                </Descriptions>
              </>
            )}

            {/* 运营控制配置 */}
            <Divider plain>运营控制配置</Divider>
            <OperationControlDisplay control={config.control} />

            {/* 时间戳 */}
            <Divider plain />
            <Space>
              <Text type="secondary">创建时间: {config.created_at}</Text>
              <Text type="secondary">更新时间: {config.updated_at}</Text>
            </Space>
          </Card>
        ))
      )}
    </div>
  );
}
