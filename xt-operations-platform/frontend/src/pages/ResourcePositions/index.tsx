import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Space, Select, Spin, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { positionsApi } from '../../services/api';
import { ResourcePosition, CATEGORY_LABELS, CATEGORY_COLORS } from '../../types';

export default function PositionsIndex() {
  const [data, setData] = useState<ResourcePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    positionsApi.list({ category: categoryFilter })
      .then((res: any) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [categoryFilter]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  // Group by category
  const grouped: Record<string, ResourcePosition[]> = {};
  data.forEach((pos) => {
    if (!grouped[pos.category]) grouped[pos.category] = [];
    grouped[pos.category].push(pos);
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>资源位资产目录 (场)</h2>
        <Select
          placeholder="筛选分类" allowClear style={{ width: 160 }}
          value={categoryFilter} onChange={setCategoryFilter}
          options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
        />
      </div>

      {Object.entries(grouped).map(([cat, positions]) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h3 style={{ color: CATEGORY_COLORS[cat] || '#666', marginBottom: 12 }}>
            <Tag color={CATEGORY_COLORS[cat]}>{CATEGORY_LABELS[cat] || cat}</Tag>
            {positions.length} 个资源位
          </h3>
          <Row gutter={[16, 16]}>
            {positions.map((pos) => (
              <Col xs={24} sm={12} md={8} lg={6} key={pos.id}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => navigate(`/positions/${pos.id}`)}
                  style={{ borderTop: `3px solid ${CATEGORY_COLORS[cat] || '#1677ff'}` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>{pos.name}</strong>
                    <Badge status={pos.status === 'online' ? 'success' : 'default'} text={pos.status} />
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    <div>Code: <Tag>{pos.code}</Tag></div>
                    <div>优先级: {pos.priority_base}</div>
                    {pos.description && <div style={{ marginTop: 4 }}>{pos.description}</div>}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
}
