import { ArrowUpOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { useRouter } from 'next/router';

const { Title } = Typography;

export default function productName() {
  const router = useRouter();
  const { name } = router.query
  
  return (
    <>
      <Title level={3}>{name}</Title>
      <Row gutter={16}>
        <Col>
          <Card bordered={false}>
            <Statistic
              loading
              title="최근 가격"            
              value={5000}
              suffix="원"
            />
          </Card>
        </Col>
        <Col>
          <Card
            bordered={false}
          >
            <Statistic
              loading
              title="변화 추이"            
              value={13.256}
              valueStyle={{ color: 'red' }}
              precision={2}
              prefix={<ArrowUpOutlined/>}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}