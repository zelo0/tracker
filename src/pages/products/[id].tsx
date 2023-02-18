import { ArrowUpOutlined, DollarOutlined, LineChartOutlined } from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Space, Statistic, Typography } from 'antd';
import { useRouter } from 'next/router';
import { GetStaticPaths,GetStaticProps } from 'next';
import { getMinMaxPriceBetweenRange, getProductName } from '@/firebase/firestore/utils';

const { Title } = Typography;

type MinMaxPriceForMonth = Array<{
  date: string,
  minPrice: number,
  maxPrice: number
}>

export default function ProductName({ name, minMaxPriceForMonth }: { name: string, minMaxPriceForMonth: MinMaxPriceForMonth}) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
      <Space>
        <Skeleton.Node active>
          <DollarOutlined />
        </Skeleton.Node>
        <Skeleton.Node active>
          <LineChartOutlined />
        </Skeleton.Node>
      </Space>
      </>
    )
  }

  return (
    <>
      <Title level={3}>{name}</Title>
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
  const id = ctx.params?.id;
  /* TODO: 예외 처리해서 보여주기 */
  if (!id) {
    return {
      props: {}
    };
  }
  const name = await getProductName(id as string);

  /* 달마다 최저, 최대 가격 쿼리 (2년치) */
  // 현재 달 1일 0시
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  let curMonth = new Date(startOfThisMonth.getTime());
  curMonth.setMonth(startOfThisMonth.getDate() - 12 * 2);

  let startTimeCursor, endTimeCursor; 
  let minMaxPriceForMonth = [];
  while (curMonth.getTime() < now.getTime()) {
    startTimeCursor = curMonth.getTime();
    curMonth.setMonth(curMonth.getMonth() + 1);
    // 다음 달 첫 날 
    endTimeCursor = curMonth.getTime();

    const result = await getMinMaxPriceBetweenRange(id as string, new Date(startTimeCursor), new Date(endTimeCursor));
    console.log(result);
    const minPrice = result?.minPrice;
    const maxPrice = result?.maxPrice;
    
    const displayDate = new Date(startTimeCursor);
    minMaxPriceForMonth.push({
      date: `${displayDate.getFullYear()}.${displayDate.getMonth() + 1}`,
      minPrice,
      maxPrice
    });
  }

  return {
    props:{
      name,
      minMaxPriceForMonth
    }
  }
}
