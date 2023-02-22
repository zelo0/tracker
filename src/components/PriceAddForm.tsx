

import { searchProduct } from "@/firebase/firestore/utils";
import { AutoComplete, Form, Input, InputNumber } from "antd";
import { FormInstance, Rule } from "antd/es/form";
import { useRef, useState } from "react";
import ProductSearch from "./ProductSearch";

const { TextArea } = Input;

export default function PriceAddForm({ form }: { form: FormInstance}) {

  const nameRule: Rule = {
    type: 'string',
    min: 1,
    max: 50,
    required: true,
    whitespace: true, // failed if only has whitespace ,
    message: '1글자 이상 50자 이하로 작성해주세요'
  };

  const priceRule: Rule = {
    type: 'number',
    min: 0,
    max: 1e10,
    required: true,
    message: '0 이상 100억 이하의 숫자를 작성해주세요'
  };

  return (
    <>
      <Form
        form={form}
        labelAlign='right'
        labelWrap={true}
        labelCol={{span: 3, offset: 0}}
        name="price-enroll"
        scrollToFirstError={true}
      >
        <Form.Item 
          label="제품"
          name="goodId"
          required
          rules={[nameRule]}
          hasFeedback
        >
          <ProductSearch/>
        </Form.Item>

        <Form.Item 
          label="가격"
          name="goodPrice"
          rules={[priceRule]}  
          hasFeedback
        >
          <InputNumber 
            style={{width: '100%'}}
            placeholder="낱개 가격"
            controls={false}
            formatter={(value) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/(,*)/g, '')}
            prefix='₩'
          />
        </Form.Item>

        <Form.Item 
          label="리뷰"
          name="review"
          initialValue={''}
        >
          <TextArea 
            style={{width: '100%'}}
            maxLength={1000}
            placeholder="간단한 리뷰"
            showCount
            allowClear
            autoSize
          />
        </Form.Item>
      </Form>
    </>
  );
}