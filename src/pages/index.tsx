import { Card, Typography, Image, Space } from 'antd';
import { GetStaticProps } from 'next';
import type { Prices, Products } from '@/firebase/firestore/types'
import { getPromotions, getRecentFivePrices, readRecentFiveProducts } from '@/firebase/firestore/utils';
import { useRouter } from 'next/router';
import IndexSection from '@/components/IndexSection';
import { DocumentData, QueryDocumentSnapshot } from '@firebase/firestore';
 
const { Title } = Typography;
const { Meta } = Card;

const PRICE_SYMBOL = '₩';

export default function Index({ recentPrices, promotions }: { recentPrices: Prices, promotions: DocumentData[] }) {
  const router = useRouter();

  const cardClickHandler = (goodName: string, goodId: string) => {
    router.push(`/products/${goodId}/${goodName}`);
  }

  return (
    <Space
      direction='vertical'
      size={'large'}
    >
      <IndexSection
        title='최근 등록된 가격'
      >
        {/* 최근 등록된 가격 5개 */}
        {
          recentPrices.map((price) => 
            <Card 
              hoverable
              bordered={false}
              key={price.id}
              onClick={() => {cardClickHandler(price.goodName, price.goodId)}}
            >
              <Meta
                title={price.goodName}
                description={`${PRICE_SYMBOL}${price.goodPrice}`}
              />
              <p>{price.date}</p>
            </Card>
          )
        }
      </IndexSection>


      <IndexSection
        title='이런 상품은 어때요?'
      >
        {
          promotions.map((promotion) => 
            <Card 
              hoverable
              bordered={false}
              key={promotion.goodId}
              onClick={() => cardClickHandler(promotion.goodName, promotion.goodId)}
              style={{width: 200}}
            >
              <Meta
                title={promotion['goodName']}
              />
              <Image
                alt='상품 이미지'
                placeholder
                preview={false}
                width={100}
                height={100}
                src={promotion['img']}
                onClick={(evt) => {evt.stopPropagation();}}
              />
            </Card>
          )
        }
      </IndexSection>
    </Space>
  )
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const recentPrices = await getRecentFivePrices();
  const promotions = await getPromotions();
  return {
    props:{
      recentPrices,
      promotions
    }
  }
}