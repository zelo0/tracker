import { PlusOutlined } from '@ant-design/icons';
import { Button, FloatButton, Form, Input, InputNumber, Modal, Typography, message } from 'antd';
import type { Rule } from 'antd/es/form';
import { useState } from 'react';
import { addProduct } from '@/firebase/firestore/utils'
import { useSession } from 'next-auth/react';
 
const { Title } = Typography;
const { TextArea } = Input;


export default function AddingModal() {
  const [open, setOpen] = useState(false);
  const [uploading, setuploading] = useState(false);
  const { data: session, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const showModal = () => {
    setOpen(true);
  };

  const okHandler = () => {
    if (uploading) {
      return;
    } 
    
    form
      .validateFields()
      .then(async (formData) => {
        setuploading(true);
        // TODO: upload to firebase
        await addProduct(formData, session?.user);

        // after uploading
        messageApi.open({
          type: 'success',
          content: '등록 완료',
        });
        setuploading(false);
        form.resetFields();
      })
      .catch((reason) => {
        // TODO: 예외 처리
        messageApi.open({
          type: 'error',
          content: '등록 실패',
        });
        setuploading(false);
        console.error(reason);
      });

    
  };

  const cancelHandler = () => {
    setOpen(false);
  };

  const finishHandler = () => {
    alert('finish')
  };

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
      {contextHolder}
      <FloatButton
        icon={<PlusOutlined />}
        onClick={showModal}
      />
      <Modal 
        open={open}
        cancelText="취소"
        centered={true}
        confirmLoading={uploading}
        okText="등록"
        title={<Title level={2}>가격 등록</Title>}
        onOk={okHandler}
        onCancel={cancelHandler}
      >
        <Form
          form={form}
          labelAlign='right'
          labelWrap={true}
          labelCol={{span: 3, offset: 0}}
          name="price-enroll"
          scrollToFirstError={true}
          onFinish={finishHandler}
        >
          <Form.Item 
            label="제품명"
            name="name"
            rules={[nameRule]}
            hasFeedback
          >
            <Input placeholder="와퍼" />
          </Form.Item>

          <Form.Item 
            label="가격"
            name="price"
            rules={[priceRule]}  
            hasFeedback
          >
            <InputNumber 
              style={{width: '100%'}}
              placeholder="4500"
              controls={false}
              formatter={(value) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/(,*)/g, '')}
              prefix='₩'
            />
          </Form.Item>

          <Form.Item 
            label="리뷰"
            name="review"
          >
            <TextArea 
              style={{width: '100%'}}
              maxLength={1000}
              placeholder="간단한 리뷰"
              showCount
              allowClear
              autoSize
              defaultValue={''}
            />
          </Form.Item>
        </Form>
        
      </Modal>
    </>
  );
}