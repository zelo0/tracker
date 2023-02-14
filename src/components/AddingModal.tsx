import { PlusOutlined } from '@ant-design/icons';
import { Button, FloatButton, Form, Input, InputNumber, Modal, Typography, message, Tabs } from 'antd';
import type { FormInstance, Rule } from 'antd/es/form';
import { useState } from 'react';
import { addPrice, addProduct } from '@/firebase/firestore/utils'
import { useSession } from 'next-auth/react';
import ProductAdd from './ProductAddForm';
import ProductAddForm from './ProductAddForm';
import PriceAddForm from './PriceAddForm';
 
const { Title } = Typography;


export default function AddingModal() {
  const [open, setOpen] = useState(false);
  const [uploading, setuploading] = useState(false);
  const [tab, setTab] = useState('');

  const { data: session, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [productForm] = Form.useForm();
  const [priceForm] = Form.useForm();


  const showModal = () => {
    setOpen(true);
  };

  const okHandler = () => {
    if (uploading) {
      return;
    } 

    let form: FormInstance;
    if (tab === 'product') {
      form = productForm;
    } else {
      form = priceForm;
    }
    
    form
      .validateFields()
      .then(async (formData) => {
        setuploading(true);

        if (tab === 'product') {
          await addProduct(formData, session?.user);
        } else {
          await addPrice(formData, session?.user);
        }

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
        title={<Title level={2}>등록해주세요</Title>}
        onOk={okHandler}
        onCancel={cancelHandler}
      >
        <Tabs
          items={[
            {
              label: '제품',
              key: 'product',
              children: <ProductAddForm form={productForm} />
            },
            {
              label: '가격',
              key: 'price',
              children: <PriceAddForm form={priceForm} />
            }
          ]}
          onChange={(activeKey) => {setTab(activeKey)}}
        />
      </Modal>
    </>
  );
}