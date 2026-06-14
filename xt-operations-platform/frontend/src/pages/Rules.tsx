import { useEffect, useState } from 'react';
import { Card, Steps, Tag, Space, Switch, Select, Button, message } from 'antd';
import { NodeIndexOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { rulesApi, configsApi } from '../services/api';
import type { RuleChainStep, PositionConfig } from '../types';

const RULE_LABELS: Record<string, string> = {
  switch: '上线开关', schedule: '投放排期', channel: '渠道校验',
  device: '设备定向', region: '地域定向', crowd: '人群定向',
  gray: '灰度比例', ab: 'AB测试分组', frequency: '频次控制',
  priority: '优先级判断',
};

const RULE_COLORS: Record<string, string> = {
  switch: '#ff4d4f', schedule: '#fa8c16', channel: '#faad14',
  device: '#52c41a', region: '#1890ff', crowd: '#722ed1',
  gray: '#eb2f96', ab: '#13c2c2', frequency: '#fa541c',
  priority: '#1677ff',
};

export default function Rules() {
  const [configs, setConfigs] = useState<PositionConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [chain, setChain] = useState<RuleChainStep[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    configsApi.list({ status: 'online' }).then((res: any) => {
      setConfigs(res.data || []);
    });
  }, []);

  useEffect(() => {
    if (!selectedConfigId) return;
    setLoading(true);
    rulesApi.getByConfig(selectedConfigId)
      .then((res: any) => { setChain(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedConfigId]);

  const handleToggle = async (ruleId: string, enabled: boolean) => {
    await rulesApi.update(ruleId, { enabled: enabled ? 1 : 0 });
    setChain((prev) => prev.map((r) => (r.id === ruleId ? { ...r, enabled: enabled ? 1 : 0 } : r)));
    message.success(enabled ? '已启用' : '已禁用');
  };

  const handleReset = async () => {
    if (!selectedConfigId) return;
    const res: any = await rulesApi.reset(selectedConfigId);
    setChain(res.data || []);
    message.success('已重置为默认规则链');
  };

  const items = chain.map((rule, i) => ({
    title: (
      <Space>
        <Tag color={RULE_COLORS[rule.rule_type]}>{RULE_LABELS[rule.rule_type] || rule.rule_type}</Tag>
        {rule.enabled ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        )}
      </Space>
    ),
    description: (
      <Space>
        <Switch size="small" checked={rule.enabled === 1} onChange={(v) => handleToggle(rule.id, v)} />
        <span style={{ fontSize: 11, color: '#888' }}>Step {rule.step_order}</span>
      </Space>
    ),
  }));

  return (
    <div>
      <Card title="规则引擎 — 10层校验链" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <span>选择配置查看规则链:</span>
          <Select
            placeholder="选择配置"
            style={{ width: 320 }}
            value={selectedConfigId || undefined}
            onChange={setSelectedConfigId}
            options={configs.map((c) => ({
              value: c.id,
              label: `${c.position_name} | ${c.material_name} | ${c.crowd_pack_name || '全量'}`,
            }))}
          />
          {selectedConfigId && (
            <Button onClick={handleReset}>重置为默认</Button>
          )}
        </div>

        {selectedConfigId && (
          <div style={{ marginTop: 24 }}>
            <Steps
              direction="vertical"
              size="small"
              current={chain.length}
              items={items}
            />
            <div style={{
              marginTop: 16, padding: '12px 16px', background: '#f0f5ff',
              borderRadius: 6, borderLeft: '3px solid #1677ff',
            }}>
              <strong>执行逻辑：</strong>
              自上而下逐层校验。任一环节不满足条件则不展示，逐层过滤。所有层通过后，按优先级从高到低选择最终展示配置。
            </div>
          </div>
        )}

        {!selectedConfigId && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <NodeIndexOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>请选择一个配置以查看其规则链</p>
          </div>
        )}
      </Card>

      <Card title="10层规则说明">
        {Object.entries(RULE_LABELS).map(([key, label], i) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Tag color={RULE_COLORS[key]} style={{ minWidth: 28, textAlign: 'center' }}>{i + 1}</Tag>
            <strong style={{ minWidth: 80 }}>{label}</strong>
            <span style={{ color: '#666', fontSize: 13 }}>
              {key === 'switch' && '配置上线/下线开关，一键控制资源位是否展示'}
              {key === 'schedule' && '检查当前时间是否在投放排期内'}
              {key === 'channel' && '验证用户所在渠道是否在配置的渠道列表中'}
              {key === 'device' && '根据用户设备类型(iOS/Android)匹配'}
              {key === 'region' && '根据用户地域进行白名单/黑名单过滤'}
              {key === 'crowd' && '检查用户是否命中目标人群包'}
              {key === 'gray' && '基于UID哈希值判断是否在灰度比例范围内'}
              {key === 'ab' && '判断用户是否在AB实验的目标分组中'}
              {key === 'frequency' && '检查用户是否达到展示频次上限'}
              {key === 'priority' && '按优先级排序，选择最高优配置展示'}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
