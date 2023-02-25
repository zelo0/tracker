import { Button, Menu, MenuProps, Layout } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import ProductSearch from "./ProductSearch";
import variables from '@/styles/variables.module.scss';
import { useRouter } from "next/router";

const { Header } = Layout;


export function DefaultHeader() {
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
    <Header  style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link 
          href='/'
          style={{flexGrow: 1}}
        >
          <Button
            type='text'
            style={{ color: variables.primaryColor }}
            size='large'
          >
            가격 추적기
          </Button>
        </Link>
        <ProductSearch 
          onChange={(productId) => {router.push(`products/${productId}`)}}
          style={{ flexGrow: 2, minWidth: 0 }}
          key="menuSearchBar"
        />
        <Menu 
          mode='horizontal'
          theme='dark'
          items={session ? authItems : unauthItems}
          style={{ flexGrow: 1, justifyContent: "flex-end" }}
        />
      </Header>
  )
}