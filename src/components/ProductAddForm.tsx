import { Form, Input, InputNumber } from "antd";
import { FormInstance, Rule } from "antd/es/form";
import React from "react";

const { TextArea } = Input;

function ProductAddForm({ form }: { form: FormInstance}) {


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
          label="제품명"
          name="goodName"
          rules={[nameRule]}
          hasFeedback
        >
          <Input placeholder="와퍼" />
        </Form.Item>

        <Form.Item 
          label="설명"
          name="description"
          initialValue={''}
        >
          <TextArea 
            style={{width: '100%'}}
            maxLength={1000}
            placeholder="간단하게 적어주세요"
            showCount
            allowClear
            autoSize
          />
        </Form.Item>
      </Form>
    </>
  );
}

export default React.memo(ProductAddForm)