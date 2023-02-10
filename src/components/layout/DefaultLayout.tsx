import { Layout, Menu } from 'antd';
import type { ReactElement } from 'react';
import AddingModal from '../AddingModal';
import { primaryColor } from '@/styles/variables.module.scss';

const { Header, Content, Footer, Sider } = Layout;

export default function DefaultLayout({ children }: { children: ReactElement }) {
  return (
    <Layout className='height-100'> 
      <Header style={{color: primaryColor}}>가격 추적기</Header>
      <Layout hasSider>
        <Sider collapsible>사이드바</Sider>

        <Layout>
          <Content className='height-100 content-padding'>
            {children}
          </Content>

          {/* state를 유지하기 위해 modal 사용 */}
          <AddingModal/>
          <Footer>by mapal</Footer>
        </Layout>
      </Layout>

      
    </Layout>
  );
}