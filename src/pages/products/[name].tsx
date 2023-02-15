import { ArrowUpOutlined, DollarOutlined } from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Space, Statistic, Typography } from 'antd';
import { useRouter } from 'next/router';
import { GetStaticPaths,GetStaticProps } from 'next';

const { Title } = Typography;

export default function ProductName({ temp }: { temp: {str: string}}) {
  const router = useRouter();
  const { name } = router.query
  console.log(router.query)
  
  if (router.isFallback) {
    console.log('fallback')
    return (
      <>
      <Space>
        <Skeleton.Node active>
          <DollarOutlined />
        </Skeleton.Node>
        <Skeleton.Node active>
          <DollarOutlined />
        </Skeleton.Node>
      </Space>
      </>
    )
  }

  return (
    <>
      <Title level={3}>{name}</Title>
      <p>{temp.str}</p>
      <Row gutter={16}>
        <Col>
          <Card bordered={false}>
            <Statistic
              // loading
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
              // loading
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


export const getStaticPaths: GetStaticPaths = () => {

  return {
    paths:[],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async (ctx) =>{
  const temp = {str: 'bla'}

  return {
    props:{
      temp
    }
  }
}
