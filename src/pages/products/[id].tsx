import { AreaChartOutlined, ArrowDownOutlined, ArrowUpOutlined, DollarOutlined, LineChartOutlined, LineOutlined, RiseOutlined } from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Space, Statistic, Typography } from 'antd';
import { useRouter } from 'next/router';
import { GetStaticPaths,GetStaticProps } from 'next';
import { getMinMaxPriceForTwoYears, getProductName } from '@/firebase/firestore/utils';
import { Chart as ChartJS, CategoryScale, LineController, LineElement, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Place } from '@/components/KakaoMap';
import KakaoMapSearchWrapper from '@/components/KakaoMapSearchWrapper';

const { Title } = Typography;

type MinMaxPriceForMonth = Array<{
  date: string,
  minPrice: number,
  maxPrice: number
}>

ChartJS.register(CategoryScale, LineController, LineElement, ...registerables);


export default function ProductName({ name, minMaxPriceForMonth }: { name: string, minMaxPriceForMonth: MinMaxPriceForMonth}) {
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

  /* chart.js */
  const chartData = {
    labels: minMaxPriceForMonth.map((data) => data.date),
    datasets: [
      {
        label: "최저 가격",
        data: minMaxPriceForMonth.map((data) => data.minPrice < Infinity ? data.minPrice : null),
        fill: 1,
      },
      {
        label: "최고 가격",
        data: minMaxPriceForMonth.map((data) => data.maxPrice > 0 ? data.maxPrice : null),
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: 0
      }
    },
    interaction: {
      mode: 'index' as 'index',
      intersect: false
    },
    responsive: true,
  };

  const lowestPriceThisMonth = minMaxPriceForMonth.at(-1)?.minPrice;
  const lowestPriceLastMonth = minMaxPriceForMonth.at(-2)?.minPrice;
  let priceDifferencePercent = 0;
  if (lowestPriceThisMonth && lowestPriceLastMonth && lowestPriceLastMonth < Infinity) {
    priceDifferencePercent = (lowestPriceThisMonth - lowestPriceLastMonth) / lowestPriceLastMonth * 100;
  }

  const onChangePlace = (place: Place) => {
    
  }

  return (
    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
      <Title level={3}>{name}</Title>
      <Row gutter={16}>
        <Col>
          <Card bordered={false}>
            <Statistic
              // loading
              title="이번달 최저가"   // 최근 가격         
              value={lowestPriceThisMonth}
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

      {/* label을 dataset을 구별하는 key로 사용 (re-render) */}
      <div>
        <Title level={5}>
          가격 추이
        </Title>
        <Line
          data={chartData}
          options={chartOptions}
          style={{ width: "100%", maxHeight: "20rem" }}
        />
      </div>

      <div>
        <Title level={5}>
          판매 지점
        </Title>
        <KakaoMapSearchWrapper onChange={onChangePlace} />
        {/* TODO: 해당 장소에 등록된 가격 리스트 */}
        
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
  /* TODO: 예외 처리해서 보여주기 */
  if (!id) {
    return {
      props: {
        name: null,
        minMaxPriceForMonth: null,
      }
    };
  }
  const name = await getProductName(id as string);

  /* 달마다 최저, 최대 가격 쿼리 (2년치) */
  // 현재 달 1일 0시
  const minMaxPriceForMonth = await getMinMaxPriceForTwoYears(id as string);

  return {
    props:{
      name,
      minMaxPriceForMonth
    }
  }
}
