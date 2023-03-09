import { MinMaxPrice, Price } from '@/firebase/firestore/types';
import { getMinMaxPriceForOneMonth, getPricesPaginationByDate } from '@/firebase/firestore/utils';
import { MinMaxPriceForMonth } from '@/pages/products/[id]/[slug]';
import { QueryDocumentSnapshot } from '@firebase/firestore';
import { List, Skeleton } from 'antd';
import { Chart as ChartJS, CategoryScale, LineController, LineElement, registerables, ChartEvent  } from 'chart.js';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import InfiniteScroll from 'react-infinite-scroller';


ChartJS.register(CategoryScale, LineController, LineElement, ...registerables);

interface DataType extends Price {

}

export default function PriceChart({ productId, minMaxPriceForMonth }: { productId: string, minMaxPriceForMonth: MinMaxPriceForMonth}) {
  const router = useRouter();


  const [showingMonth, setShowingMonth] = useState<string | undefined>();
  const [daySourcetData, setDaySourceData] = useState<Array<MinMaxPrice> | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  let hasMore = useRef<boolean>(false);
  let lastData = useRef<QueryDocumentSnapshot | undefined>();
  const [scrollData, setScrollData] = useState<DataType[]>([]);
  const [showingDate, setShowingDate] = useState<string | undefined>();

  const yearChartOptions = useMemo(() => {
    return {
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
      onClick: (event: ChartEvent, elements: any, chart: any) => {
        if (elements[0]) {
          setShowingMonth(chart.data.labels[elements[0].index]);
        }
      }
    };
  }, []);


  const dayChartOptions = useMemo(() => {
    return {
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
      onClick: (event: ChartEvent, elements: any, chart: any) => {
        // 일별 지점 클릭하면 해당 날짜의 가격들 리스트로 렌더링

        if (elements[0]) {
          setShowingDate(chart.data.labels[elements[0].index]);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (loading) {
      setLoading(false);
    }
    setScrollData([]);
    lastData.current = undefined;
    hasMore.current = true;
    


    return () => {
    }
  }, [showingDate])
  


  const yearChartData = useMemo(() => {
    return {
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
  }, [minMaxPriceForMonth]);




  useEffect(() => {
    (async () => {
      if (showingMonth) {

        // firestore에 일별 통계 요청
        const result = await getMinMaxPriceForOneMonth(router.query.id as string, showingMonth);
        console.log(result);
        setDaySourceData(result);

      }
    })();


    return () => {

    }
  }, [showingMonth, router.query.id]);

  
  const dayChartData = useMemo(() => {
    if (!daySourcetData) {
      return;
    }
    return {
      labels: daySourcetData.map((data) => data.date),
      datasets: [
        {
          label: "최저 가격",
          data: daySourcetData.map((data) => data.minPrice < Infinity ? data.minPrice : null),
          fill: 1,
        },
        {
          label: "최고 가격",
          data: daySourcetData.map((data) => data.maxPrice > 0 ? data.maxPrice : null),
        },
      ],
    }
  }, [daySourcetData]);


  const loadMoreData = async () => {
    
    if (loading) {
      return;
    }

    if (!showingDate) {
      setLoading(false);
      hasMore.current = false;
      return;
    }

    setLoading(true);

    try {
      let response;
      if (!lastData.current) { // 첫 fetch
        response = await getPricesPaginationByDate(productId as string, showingDate)
      } else {
        response = await getPricesPaginationByDate(productId as string, showingDate, lastData.current)
      }

      let priceList = response.data;
      console.log(priceList);
      setScrollData([...scrollData, ...priceList]);
      if (!priceList || !priceList.length) {
        hasMore.current = false;
      } else {
        lastData.current = response.lastDoc;
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };



  return (
    <>
      {
        !showingMonth 
        && 
        <Line
          data={yearChartData}
          options={yearChartOptions}
          style={{ width: "100%", maxHeight: "20rem" }}
        /> 
      }

      {
        dayChartData
        &&
        <>
          {/* 한 달 동안의 일별 가격 */}
          <Line
            data={dayChartData}
            options={dayChartOptions}
            style={{ width: "100%", maxHeight: "20rem" }}
          /> 
          {/* 하루동안 등록된 가격 리스트 */}

          <InfiniteScroll
            loadMore={loadMoreData}
            hasMore={hasMore.current}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          >
            <List
              dataSource={scrollData}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={item.goodPrice + '원'}
                    description={item.date}
                  />
                  {item.review}
                </List.Item>
              )}
            />  
          </InfiniteScroll>
        </>
      }
    </>
  )
}