import { MinMaxPrice } from '@/firebase/firestore/types';
import { getMinMaxPriceForOneMonth } from '@/firebase/firestore/utils';
import { MinMaxPriceForMonth } from '@/pages/products/[id]/[slug]';
import { Chart as ChartJS, CategoryScale, LineController, LineElement, registerables } from 'chart.js';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LineController, LineElement, ...registerables);



export default function PriceChart({ minMaxPriceForMonth }: { minMaxPriceForMonth: MinMaxPriceForMonth}) {
  const router = useRouter();


  const [showingDate, setShowingDate] = useState<string | undefined>();
  const [daySourcetData, setDaySourceData] = useState<Array<MinMaxPrice> | undefined>();

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
      onClick: (event, elements, chart) => {
        if (elements[0]) {
          setShowingDate(chart.data.labels[elements[0].index]);
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
      onClick: (event, elements, chart) => {
        // 일별 지점 클릭하면 해당 날짜의 가격들 리스트로 렌더링

        // if (elements[0]) {
        //   setShowingDate(chart.data.labels[elements[0].index]);
        // }
      }
    };
  }, []);


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
      if (showingDate) {

        // firestore에 일별 통계 요청
        const result = await getMinMaxPriceForOneMonth(router.query.id as string, showingDate);
        console.log(result);
        setDaySourceData(result);

      }
    })();


    return () => {

    }
  }, [showingDate]);

  
  const dayChartData = useMemo(() => {
    if (!daySourcetData) {
      return;
    }
    return {
      labels: daySourcetData.map((data) => data.date),
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
    }
  }, [daySourcetData]);


  



  return (
    <>
      {
        !showingDate 
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
          <li>리스트</li>
        </>
      }
    </>
  )
}