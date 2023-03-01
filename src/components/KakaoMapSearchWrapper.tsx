import KakaoMap from "./KakaoMap";
import { Input, Typography } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Place } from "./KakaoMap"

const { Search } = Input;
const { Text } = Typography;


interface Props {
  onChange: (place: Place) => void
}

export default function KakaoMapSearchWrapper({ onChange }: Props) {
  const mapRef = useRef<{ keywordSearch: (keyword: string) => void }>(null);
  const [place, setPlace] = useState<Place | null>(null)

  const onSearchPlace = useCallback(
    (keyword: string) => {
      // searchKeyword.current = keyword;
      if (mapRef.current) {
        mapRef.current.keywordSearch(keyword)
      }
    },
    []
  );
   

  const onClickMarker = useCallback(
    (place: Place) => {
      onChange(place);
      setPlace(place);
    },
    [],
  )

  
  
  return (
    <div>
      <Text strong>{place ? place.place_name : ''}</Text>

      <Search placeholder="키워드를 검색해주세요"  onSearch={onSearchPlace} style={{ width: "100%" }} />
      <KakaoMap ref={mapRef} onClickMarker={onClickMarker} />
    </div>
  )
}