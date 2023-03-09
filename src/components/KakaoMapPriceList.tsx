import { Price } from "@/firebase/firestore/types";
import { getPricesPaginationByPlace } from "@/firebase/firestore/utils";
import {  QueryDocumentSnapshot } from "@firebase/firestore";
import { List, Skeleton } from "antd";
import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";
import InfiniteScroll from 'react-infinite-scroller';
import { Place } from "./KakaoMap";
import KakaoMapSearchWrapper from "./KakaoMapSearchWrapper";

interface DataType extends Price {

}

export default function KakaoMapPriceList() {
  const router = useRouter();
  const productId = router.query.id;
  console.log('product', productId);

  let lastData = useRef<QueryDocumentSnapshot | undefined>();
  let hasMore = useRef<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [place, setPlace] = useState<Place | undefined>();


  const onChangePlace = useCallback(
    (newPlace: Place) => {
      setPlace((prevPlace) => {
        console.log('prevPlace', prevPlace);
        if (prevPlace?.id === newPlace.id) {
          return prevPlace;
        } else {
          setData([]);
          lastData.current = undefined;
          hasMore.current = true;
          return newPlace;
        }
      });
    },
    []
  );



  const loadMoreData = async () => {
    
    if (loading) {
      return;
    }

    if (!place) {
      setLoading(false);
      hasMore.current = false;
      return;
    }

    setLoading(true);

    try {
      let response;
      if (!lastData.current) { // 첫 fetch
        response = await getPricesPaginationByPlace(productId as String, place.id)
      } else {
        response = await getPricesPaginationByPlace(productId as String, place.id, lastData.current)
      }

      let priceList = response.data;
      console.log(priceList);
      setData([...data, ...priceList]);
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
      <KakaoMapSearchWrapper onChange={onChangePlace} mapId={"price-list"} />

      {/* 해당 장소에 등록된 가격 리스트 */}
      <InfiniteScroll 
        loadMore={loadMoreData}
        hasMore={hasMore.current}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
      >
        <List
          dataSource={data}
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
  )
}