import { Button, Layout, Menu, MenuProps } from 'antd';
import type { ReactElement } from 'react';
import AddingModal from '../AddingModal';
import variables from '@/styles/variables.module.scss';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const { Header, Content, Footer, Sider } = Layout;

export default function DefaultLayout({ children }: { children: ReactElement }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  

  const unauthItems: MenuProps['items'] = [
    {
      label: <div onClick={() => {signIn()}}>로그인</div>,
      key: "login",
    },
  ];

  const authItems: MenuProps["items"] = [
    {
      label: session?.user?.name,
      key: "userName"
    },
    {
      label: <div onClick={() => {signOut()}}>로그아웃</div>,
      key: "logout"
    },
  ];

  return (
    <Layout className='height-100'> 
      <Header  style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type='text'
          style={{ color: variables.primaryColor }}
          size='large'
        >
          <div onClick={() => {router.push('/')}}>가격 추적기</div>
        </Button>
        <Menu 
          disabledOverflow
          mode='horizontal'
          theme='dark'
          items={session ? authItems : unauthItems}
        />

      </Header>
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