import { AreaChartOutlined, ArrowDownOutlined, ArrowUpOutlined, DollarOutlined, LineChartOutlined, LineOutlined, RiseOutlined } from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Space, Statistic, Typography } from 'antd';
import { useRouter } from 'next/router';
import { GetStaticPaths,GetStaticProps } from 'next';
import { getMinMaxPriceForTwoYears, getProductName } from '@/firebase/firestore/utils';
import { Chart as ChartJS, CategoryScale, LineController, LineElement, registerables } from 'chart.js';
import KakaoMapPriceList from '@/components/KakaoMapPriceList';
import PriceChart from '@/components/PriceChart';

const { Title } = Typography;

export type MinMaxPriceForMonth = Array<{
  date: string,
  minPrice: number,
  maxPrice: number
}>

ChartJS.register(CategoryScale, LineController, LineElement, ...registerables);


export default function ProductDetail({ name, minMaxPriceForMonth }: { name: string, minMaxPriceForMonth: MinMaxPriceForMonth}) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
        <Space 
          direction='vertical'
        >
          <Skeleton 
            active 
            title 
            paragraph={false}
          />
          <Space>
            <Skeleton.Node active>
              <DollarOutlined />
            </Skeleton.Node>
            <Skeleton.Node active>
              <RiseOutlined />
            </Skeleton.Node>
          </Space>

          <Row>
            <Skeleton.Node 
              active 
            >
              <AreaChartOutlined/>
            </Skeleton.Node>
          </Row>
        </Space>
      </>
    )
  }


  const lowestPriceThisMonth = minMaxPriceForMonth.at(-1)?.minPrice;
  const lowestPriceLastMonth = minMaxPriceForMonth.at(-2)?.minPrice;
  let priceDifferencePercent = 0;
  if (lowestPriceThisMonth && lowestPriceLastMonth && lowestPriceLastMonth < Infinity) {
    priceDifferencePercent = (lowestPriceThisMonth - lowestPriceLastMonth) / lowestPriceLastMonth * 100;
  }



  return (
    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }} key={router.asPath}>
      <Title level={3}>{name}</Title>
      <Row gutter={16}>
        <Col>
          <Card bordered={false}>
            <Statistic
              // loading
              title="????????? ?????????"   // ?????? ??????         
              value={lowestPriceThisMonth}
              suffix="???"
            />
          </Card>
        </Col>
        <Col>
          <Card
            bordered={false}
          >
            <Statistic
              // loading
              title="?????? ??????"            
              value={Math.abs(priceDifferencePercent)}
              valueStyle={
                (priceDifferencePercent > 0) 
                ? { color: 'red' } 
                : ((priceDifferencePercent === 0) ? { color: 'black'} : { color: 'blue' }
              )}
              precision={2}
              prefix={
                (priceDifferencePercent > 0) 
                ? <ArrowUpOutlined/>
                : ((priceDifferencePercent === 0) ? <LineOutlined/> : <ArrowDownOutlined/>
              )}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* label??? dataset??? ???????????? key??? ?????? (re-render) */}
      <div>
        <Title level={5}>
          ?????? ??????
        </Title>
        <PriceChart productId={router.query.id as string} minMaxPriceForMonth={minMaxPriceForMonth}/>
      </div>

      <div>
        <Title level={5}>
          ?????? ??????
        </Title>

        <KakaoMapPriceList/>
      </div>
    </div>
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
  /* TODO: ?????? ???????????? ???????????? */
  if (!id) {
    return {
      props: {
        name: null,
        minMaxPriceForMonth: null,
      }
    };
  }
  const name = await getProductName(id as string);

  /* ????????? ??????, ?????? ?????? ?????? (2??????) */
  // ?????? ??? 1??? 0???
  const minMaxPriceForMonth = await getMinMaxPriceForTwoYears(id as string);

  return {
    props:{
      name,
      minMaxPriceForMonth
    }
  }
}
