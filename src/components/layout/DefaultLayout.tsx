import { Button, Layout, Menu, MenuProps } from 'antd';
import type { ReactElement } from 'react';
import AddingModal from '../AddingModal';
import variables from '@/styles/variables.module.scss';
import { useSession, signOut, signIn } from 'next-auth/react';
import DefaultSider from '../DefaultSider';
import Link from 'next/link';
import React from 'react';

const { Header, Content, Footer } = Layout;

export default function DefaultLayout({ children }: { children: ReactElement }) {
  /* context의 status가 loading -> unauthorized로 바뀜 
  * context를 사용하는 컴포넌트는 context가 바뀌면 re render
  */
  const { data: session, status } = useSession();

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
        <Link href='/'>
          <Button
            type='text'
            style={{ color: variables.primaryColor }}
            size='large'
          >
            가격 추적기
          </Button>
        </Link>
        <Menu 
          disabledOverflow
          mode='horizontal'
          theme='dark'
          items={session ? authItems : unauthItems}
        />
      </Header>

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