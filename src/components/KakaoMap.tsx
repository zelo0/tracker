import React from "react";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import { ForwardedRef } from "react-chartjs-2/dist/types";

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoPlaceSearch {
  keywordSearch: Function
}

export interface Place {
  x: Number,
  y: Number,
  place_name: String,
  road_address_name: String
}

interface InfoWindow {
  setContent: Function,
  open: Function,
  close: Function
}

interface Map {
  setBounds: Function
}

export type MapRef = {
  keywordSearch: (keyword: string) => void
} | null;

interface Props {
  onClickMarker: (place: Place) => void
}



function KakaoMap({onClickMarker}: Props, ref: ForwardedRef<MapRef>) {
  let ps: KakaoPlaceSearch | undefined;
  let map: Map | undefined;
  let infowindow: InfoWindow | undefined;

  let openedMarker: Object | null = null;

  // 키워드 검색 완료 시 호출되는 콜백함수 입니다
  const placesSearchCB = 
    (data: Array<Place>, status: Number) => {
      openedMarker && infowindow?.close(map, openedMarker);

      if (status === window.kakao.maps.services.Status.OK) {
  
          // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
          // LatLngBounds 객체에 좌표를 추가합니다
          var bounds = new window.kakao.maps.LatLngBounds();
  
          for (var i=0; i<data.length; i++) {
              displayMarker(data[i]);    
              bounds.extend(new window.kakao.maps.LatLng(data[i].y, data[i].x));
          }       
  
          // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
          map?.setBounds(bounds);
      } 
    }
   

  // 지도에 마커를 표시하는 함수입니다
  const displayMarker = 
    (place: Place) => {
    
      // 마커를 생성하고 지도에 표시합니다
      var marker = new window.kakao.maps.Marker({
          map: map,
          position: new window.kakao.maps.LatLng(place.y, place.x) 
      });

      // 마커에 클릭이벤트를 등록합니다
      window.kakao.maps.event.addListener(marker, 'click', function() {
          // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
          infowindow?.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
          infowindow?.open(map, marker);
          openedMarker = marker;

          onClickMarker(place);

      });
    }
  

  const loadHandler = () => {
    window.kakao.maps.load(() => {
      let container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
      let options = { //지도를 생성할 때 필요한 기본 옵션
        center: new window.kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
        level: 3 //지도의 레벨(확대, 축소 정도)
      };

      // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
      infowindow = new window.kakao.maps.InfoWindow({zIndex:1});

      map = new window.kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

      // 장소 검색
      ps = new window.kakao.maps.services.Places(); 
    });
  }

  useEffect(() => {
    /* load map js  */
    let script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer,drawing&autoload=false`;
    script.async = true;

    document.body.appendChild(script);

    script.addEventListener("load", loadHandler);

    return () => {
      script.removeEventListener("load", loadHandler);
      // script 중복 방지
      document.body.removeChild(script);
    }
  }, []);

  
  useImperativeHandle(
    ref,
    () => {
      return {
        keywordSearch(keyword: string) {
          ps && ps.keywordSearch(keyword, placesSearchCB); 
        }
      }
    },
    [],
  );
  
  return (
    <div id="map" style={{ width: "100%", height: "20rem" }}></div>
  ) 
}

export default React.memo(forwardRef<MapRef, Props>(KakaoMap))