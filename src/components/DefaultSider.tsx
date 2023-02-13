import { LineChartOutlined } from "@ant-design/icons";
import { Menu, Layout } from "antd";
import type { MenuProps } from "antd";
import { useCallback, useMemo } from "react";
import Link from "next/link";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

export default function DefaultSider() {

  const makeMenuItem = useCallback(
    (
      label?: React.ReactNode,
      key?: React.Key,
      icon?: React.ReactNode,
    ): MenuItem => ({
      label,
      key,
      icon,
    } as MenuItem),
    [],
  );

  const menuItems = useMemo(() => 
    [
      makeMenuItem(<Link href='/prices'>가격 추이</Link>, 'price', <LineChartOutlined />),
    ]
  , []);
  

  return (
    <Sider 
      collapsible
    >
      <Menu
        theme="dark"
        items={menuItems}
      />
    </Sider>
  );
}