import { searchProduct } from "@/firebase/firestore/utils";
import { AutoComplete } from "antd";
import { useState } from "react";


export default function ProductSearch() {
  /* auto complete */
  // state 변화로 rerendering 되는 지 확인
  const [productOptions, setproductOptions] = useState<{label: string, value: string}[]>([]);

  async function onSearch(searchText: string) {
    // 처음에 모든 제품을 보여주는 건 리소스 낭비
    if (!searchText) {
      setproductOptions([]);
      return;
    }
    const searchResults = await searchProduct(searchText);
    if (!searchResults) {
      setproductOptions([]);
      return;
    }
    /* TODO: 선택해도 value 값을 보여준다. label을 보여주기를 원한다 */
    setproductOptions(searchResults.map((product) => ({
      label: product.goodName,
      value: product.id,
    })));
  }

  return (
    <AutoComplete
      allowClear
      options={productOptions}
      // onSelect={onSelect}
      onSearch={onSearch}
      placeholder="제품 검색"
    />
  )
}