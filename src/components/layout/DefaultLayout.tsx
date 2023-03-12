import { Layout } from 'antd';
import { ReactElement } from 'react';
import AddingModal from '../AddingModal';
import { useSession } from 'next-auth/react';
import React from 'react';
import { DefaultHeader } from '../DefaultHeader';

const { Header, Content, Footer } = Layout;

function DefaultLayout({ children }: { children: ReactElement }) {
  /* context의 status가 loading -> unauthorized로 바뀜 
  * context를 사용하는 컴포넌트는 context가 바뀌면 re render
  */
  const { data: session, status } = useSession();

  return (
    <Layout className='height-100'> 
      <DefaultHeader/>
      <Layout hasSider>
        {/* <DefaultSider/> */}
        <Layout>
          <Content className='height-100 content-padding'>
            {children}
          </Content>

          {/* state를 유지하기 위해 modal 사용
            * 세션이 있을 때만 렌더링
          */}
          { session && <AddingModal/>}
          <Footer>by Mapal</Footer>
        </Layout>
      </Layout>

      
    </Layout>
  );
}

export default React.memo(DefaultLayout);