import { useState } from 'react';
import { Layout, Image, Menu, Row, Col } from 'antd';
import { DatabaseOutlined, LineChartOutlined, MonitorOutlined } from '@ant-design/icons';

import { getAntdMenuItem } from './utils/AntdUtils';
import DatasetPanel from './panels/DatasetPanel';

import icon from './assets/sequence-sense-icon.svg';

import './App.css';
import VisualizePanel from './panels/VisualizationPanel';
import ConflictPanel from './panels/ConflictPanel';
import AccuracyPanel from './panels/AccuracyPanel';

const { Content, Sider } = Layout;

const App = () => {

    const [menuSelection, setMenuSelection] = useState('dataset');
    const [gestureData, setGestureData] = useState({'processed': false, 'labels': [], 'files': {}, 'data': {}});
    const [classifierData, setClassifierData] = useState({});

    const sidebarItems = [
        getAntdMenuItem('Manage Gesture Dataset', 'dataset', <DatabaseOutlined />),
        getAntdMenuItem('Visualize Gesture Dataset', 'visualization', <LineChartOutlined />),
        getAntdMenuItem('Analyze Gesture Conflicts', 'conflicts', <MonitorOutlined />, !gestureData.processed)
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsed={true}
                trigger={null}
                theme={'light'}
                width={'320'}
                style={{ borderRight: '1px solid #f0f0f0' }}>
                <Image width={80} src={icon} style={{ padding: '24px', filter: 'invert(0%)' }} preview={false} />
                <Menu 
                    style={{ borderRight: '0px' }} 
                    theme='light' 
                    defaultSelectedKeys={['dataset']} 
                    mode='inline' 
                    items={sidebarItems} 
                    onSelect={(item) => { setMenuSelection(item.key) }} 
                />
            </Sider>
            <Layout>
                <Content style={{ background: '#fff' }}>
                    {
                        menuSelection === 'dataset' &&
                        <Row>
                            <Col xs={6} sm={6} md={6} lg={6} xl={6} xxl={4} style={{ height: '100vh', borderRight: '1px solid #f0f0f0' }}>
                                <DatasetPanel gestureData={gestureData} setGestureData={setGestureData} setClassifierData={setClassifierData} />
                            </Col>
                            <Col xs={11} sm={11} md={11} lg={11} xl={11} xxl={7} style={{ height: '100vh', borderRight: '1px solid #f0f0f0' }}>
                                {/* <VisualizePanel gestureData={gestureData} classifierData={classifierData} /> */}
                                <AccuracyPanel gestureData={gestureData} classifierData={classifierData} />
                            </Col>
                            <Col xs={10} sm={10} md={10} lg={10} xl={10} xxl={14} style={{ height: '100vh' }}>
                            </Col>
                        </Row>
                    }
                    {
                        menuSelection === 'visualization' &&
                        <Row>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} style={{ height: '100vh', maxHeight: '100vh' }}>
                                <VisualizePanel gestureData={gestureData} classifierData={classifierData} />
                            </Col>
                        </Row>
                    }
                    {
                        menuSelection === 'conflicts' &&
                        <Row>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} style={{ height: '100vh', maxHeight: '100vh' }}>
                                <ConflictPanel />
                            </Col>
                        </Row>
                    }
                    
                </Content>
            </Layout>
        </Layout>  
    );
}

export default App;
