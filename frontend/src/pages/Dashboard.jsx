import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Dashboard = () => (
  <div>
    <Title level={2}>Dashboard</Title>
    <Paragraph>Bem-vindo ao painel administrativo!</Paragraph>
  </div>
);

export default Dashboard;
