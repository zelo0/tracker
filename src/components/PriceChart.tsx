import { MinMaxPrice, Price } from '@/firebase/firestore/types';
import { getMinMaxPriceForOneMonth, getPricesPaginationByDate } from '@/firebase/firestore/utils';
import { MinMaxPriceForMonth } from '@/pages/products/[id]/[slug]';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { QueryDocumentSnapshot } from '@firebase/firestore';
import { Button, List, Row, Skeleton } from 'antd';
import { Chart as ChartJS, CategoryScale, LineController, LineElement, registerables, ChartEvent  } from 'chart.js';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import InfiniteScroll from 'react-infinite-scroller';


ChartJS.register(CategoryScale, LineController, LineElement, ...registerables);

interface PriceListDataType extends Price {

}

interface ChartDataType {
  labels: string[];
  datasets: ({
      label: string;
      data: (number | null)[];
      fill: number;
  } | {
      label: string;
      data: (number | null)[];
      fill?: undefined;
  })[];
}

export default function PriceChart({ productId, minMaxPriceForMonth }: { productId: string, minMaxPriceForMonth: MinMaxPriceForMonth}) {
  const router = useRouter();


  const [showingMonth, setShowingMonth] = useState<string | undefined>();
  const [minMaxPriceForDaySource, setMinMaxPriceForDaySource] = useState<Array<MinMaxPrice> | undefined>();
  const [loadingScroll, setLoadingScroll] = useState<boolean>(false);
  const [loadingDayChart, setLoadingDayChart] = useState<boolean>(false);
  const [dayChartData, setDayChartData] = useState<ChartDataType | undefined>();

  let hasMore = useRef<boolean>(false);
  let lastData = useRef<QueryDocumentSnapshot | undefined>();
  const [scrollData, setScrollData] = useState<PriceListDataType[]>([]);
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
      spanGaps: true,
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
      spanGaps: true,
      onClick: (event: ChartEvent, elements: any, chart: any) => {
        // ?????? ?????? ???????????? ?????? ????????? ????????? ???????????? ?????????

        if (elements[0]) {
          setShowingDate(chart.data.labels[elements[0].index]);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (loadingScroll) {
      setLoadingScroll(false);
    }
    setScrollData([]);
    lastData.current = undefined;
    if (showingDate) {
      hasMore.current = true;
    }

    return () => {
    }
  }, [showingDate])
  


  const yearChartData = useMemo(() => {
    return {
      labels: minMaxPriceForMonth.map((data) => data.date),
      datasets: [
        {
          label: "?????? ??????",
          data: minMaxPriceForMonth.map((data) => data.minPrice < Infinity ? data.minPrice : null),
          fill: 1,
        },
        {
          label: "?????? ??????",
          data: minMaxPriceForMonth.map((data) => data.maxPrice > 0 ? data.maxPrice : null),
        },
      ],
    };
  }, [minMaxPriceForMonth]);




  useEffect(() => {
    if (showingMonth) {
      setLoadingDayChart(true);
      (async () => {
          // firestore??? ?????? ?????? ??????
          const result = await getMinMaxPriceForOneMonth(router.query.id as string, showingMonth);
          setMinMaxPriceForDaySource(result);
      })();
    }


    return () => {

    }
  }, [showingMonth]);

  
  useEffect(() => {
    if (!minMaxPriceForDaySource) {
      return;
    }

    const nextDayChartData = {
      labels: minMaxPriceForDaySource.map((data) => data.date),
      datasets: [
        {
          label: "?????? ??????",
          data: minMaxPriceForDaySource.map((data) => data.minPrice < Infinity ? data.minPrice : null),
          fill: 1,
        },
        {
          label: "?????? ??????",
          data: minMaxPriceForDaySource.map((data) => data.maxPrice > 0 ? data.maxPrice : null),
        },
      ],
    };


    setDayChartData(nextDayChartData);
    setLoadingDayChart(false);
  }, [minMaxPriceForDaySource]);

  


  const loadMoreData = async () => {
    
    if (loadingScroll) {
      return;
    }

    if (!showingDate) {
      setLoadingScroll(false);
      hasMore.current = false;
      return;
    }

    setLoadingScroll(true);

    try {
      let response;
      if (!lastData.current) { // ??? fetch
        response = await getPricesPaginationByDate(productId as string, showingDate)
      } else {
        response = await getPricesPaginationByDate(productId as string, showingDate, lastData.current)
      }

      let priceList = response.data;
      setScrollData([...scrollData, ...priceList]);
      if (!priceList || !priceList.length) {
        hasMore.current = false;
      } else {
        lastData.current = response.lastDoc;
      }
      setLoadingScroll(false);
    } catch (e) {
      setLoadingScroll(false);
    }
  };


  const onClickBackBtn = function() {
    setShowingMonth(undefined);
    setShowingDate(undefined);
  }
  



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
        showingMonth
        &&
        (
          (!loadingDayChart && dayChartData)
          ?
          <>
            {/* ??? ??? ????????? ?????? ?????? */}
            <div>
              <Button icon={<ArrowLeftOutlined />} onClick={onClickBackBtn}>
                ??? ????????? ??????
              </Button>
              
              
              <Line
                data={dayChartData}
                options={dayChartOptions}
                style={{ width: "100%", maxHeight: "20rem" }}
              /> 
              
              {/* ???????????? ????????? ?????? ????????? */}
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
                        title={item.goodPrice + '???'}
                        description={item.date}
                      />
                      {item.review}
                    </List.Item>
                  )}
                />  
              </InfiniteScroll>
            </div>
          </>
          :
          <Skeleton active/>
        )
      }
        
  
    </>
  )
}