import { searchProduct } from "@/firebase/firestore/utils";
import { Empty, Select } from "antd";
import { useState } from "react";


/* auto complete */
export default function ProductSearch({ onChangeHandler, style }: { onChangeHandler: (val: { value: string; label: React.ReactNode }) => void, style: object }) {
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
    
    setproductOptions(searchResults.map((product) => ({
      label: product.goodName,
      value: product.id,
    })));
  }

  return (
    <Select
      filterOption={false}
      notFoundContent={<Empty description="일치하는 제품이 없습니다"/>}
      showSearch
      allowClear
      labelInValue
      onSearch={onSearch}
      options={productOptions}
      onChange={(val: { value: string; label: React.ReactNode }) => {
          if (val) {
            onChangeHandler(val)
          }
        }
      }
      placeholder="제품 검색"
      dropdownMatchSelectWidth={false}
      style={style}
    />
  )
}