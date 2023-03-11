import { Card, Space, Typography } from 'antd';

const { Title } = Typography;



interface Props {
  title: string,
  children: React.ReactNode
}

export default function IndexSection({title, children}: Props) {
  return (
    <div>
      <Title level={3}>{title}</Title>

      <Space
        direction='horizontal'
        wrap
      >
        {children}
      </Space>
    </div>
  )
}