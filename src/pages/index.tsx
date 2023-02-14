import { Button, Card, Space, Typography } from 'antd';
import { GetStaticProps } from 'next';
import type { Prices, Products } from '@/firebase/firestore/types'
import { getRecentFivePrices, readRecentFiveProducts } from '@/firebase/firestore/utils';
import { useRouter } from 'next/router';
 
const { Title } = Typography;
const { Meta } = Card;

const PRICE_SYMBOL = '₩';

export default function Index({ products, recentPrices }: { products: Products, recentPrices: Prices}) {
  const router = useRouter();

  const cardClickHandler = (goodName: string) => {
    router.push({
      pathname: `/products/[name]`,
      query: { name: goodName } 
    });
  }

  return (
    <>
      <Title level={3}>최근 등록된 가격</Title>

      <Space
        direction='horizontal'
      >
        {/* 최근 등록된 가격 5개 */}
        {
          recentPrices.map((price) => 
            <Card 
              hoverable
              bordered={false}
              key={price.id}
              onClick={() => {cardClickHandler(price.goodName)}}
            >
              <Meta
                title={price.goodName}
                description={`${PRICE_SYMBOL}${price.goodPrice}`}
              />
              <p>{price.date}</p>
            </Card>
          )
        }
      </Space>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const recentPrices = await getRecentFivePrices();
  return {
    props:{
      recentPrices
    }
  }
}