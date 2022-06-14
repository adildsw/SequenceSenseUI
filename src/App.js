import { useEffect, useState } from 'react';
import { Layout, Space, Image, Menu, Row, Col, Grid, Typography } from 'antd';
import { DatabaseOutlined, LineChartOutlined, MonitorOutlined } from '@ant-design/icons';

import { getAntdMenuItem } from './utils/AntdUtils';
import DatasetPanel from './panels/DatasetPanel';

import icon from './assets/sequence-sense-icon.svg';
import banner from './assets/sequence-sense-banner.svg';

import './App.css';
import VisualizePanel from './panels/VisualizationPanel';
import ConflictPanel from './panels/ConflictPanel';
import AccuracyPanel from './panels/AccuracyPanel';

const { Content, Sider } = Layout;
const { Text } = Typography;

const MIN_ALLOWED_HEIGHT = 800;

const SERVER_ADDRESS = 'http://192.168.192.39:3001';

const App = () => {

    const [menuSelection, setMenuSelection] = useState('dataset');
    const [gestureData, setGestureData] = useState({'processed': false, 'labels': [], 'files': {}, 'data': {}});
    const [classifierData, setClassifierData] = useState({});
    const [selectedClassification, setSelectedClassification] = useState({ actualIdx: -1, predictedIdx: -1, actual: {}, predicted: {} });
    const [isVisualizationChartIsolated, setIsVisualizationChartIsolated] = useState(false);

    // Loading Variables
    const [isFetchingClassificationResult, setIsFetchingClassificationResult] = useState(false);
    const [isFetchingConfusionMatrixAnalysis, setIsFetchingConfusionMatrixAnalysis] = useState(false);
    const [isFetchingConflictAnalysis, setIsFetchingConflictAnalysis] = useState(false);

    // Resize Functions
    const [confusionMatrixPanelResizeFunc, setConfusionMatrixPanelResizeFunc] = useState(null);
    const [confusionMatrixChartResizeFunc, setConfusionMatrixChartResizeFunc] = useState(null);
    const [isolatedChartResizeFunc, setIsolatedChartResizeFunc] = useState(null);
    const [mergedChartResizeFunc, setMergedChartResizeFunc] = useState(null);

    const { useBreakpoint } = Grid;

    const screenConfig = useBreakpoint();
    const [availHeight, setAvailHeight] = useState(0);

    useEffect(() => {
        setAvailHeight(window.innerHeight);
        window.addEventListener('resize', () => {
            setAvailHeight(window.innerHeight);
        });
    }, []);

    const sidebarItems = [
        getAntdMenuItem('Manage Gesture Dataset', 'dataset', <DatabaseOutlined />),
        getAntdMenuItem('Visualize Gesture Dataset', 'visualization', <LineChartOutlined />, !gestureData.processed),
        getAntdMenuItem('Analyze Gesture Conflicts', 'conflicts', <MonitorOutlined />, !gestureData.processed)
    ];

    return (
        <>
            { 
                ((!screenConfig.xl && !screenConfig.xxl) || (availHeight < MIN_ALLOWED_HEIGHT)) && 
                <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                    <Image src={banner} preview={false} />
                    <Text strong>ERROR: Unsupported Screen Size</Text>
                </Space>
            }
            {
                (screenConfig.xl || screenConfig.xxl) && 
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
                            selectedKeys={[menuSelection]}
                        />
                    </Sider>
                    <Layout>
                        <Content style={{ background: '#fff' }}>
                            {
                                menuSelection === 'dataset' &&
                                <Row>
                                    <Col xl={6} xxl={4} style={{ height: '100vh', borderRight: '1px solid #f0f0f0' }}>
                                        <DatasetPanel 
                                            gestureData={gestureData} 
                                            setGestureData={setGestureData} 
                                            setClassifierData={setClassifierData} 
                                            setSelectedClassification={setSelectedClassification}
                                            serverAddress={SERVER_ADDRESS} 
                                            isFetchingClassificationResult={isFetchingClassificationResult} 
                                            setIsFetchingClassificationResult={setIsFetchingClassificationResult}
                                        />
                                    </Col>
                                    <Col xl={18} xxl={20} style={{ height: '100vh' }}>
                                        <AccuracyPanel 
                                            screenConfig={screenConfig} 
                                            gestureData={gestureData} 
                                            classifierData={classifierData} 
                                            setAvailHeight={setAvailHeight} 
                                            selectedClassification={selectedClassification} 
                                            setSelectedClassification={setSelectedClassification} 
                                            serverAddress={SERVER_ADDRESS}
                                            setConfusionMatrixPanelResizeFunc={setConfusionMatrixPanelResizeFunc}
                                            setConfusionMatrixChartResizeFunc={setConfusionMatrixChartResizeFunc}
                                            isFetchingClassificationResult={isFetchingClassificationResult} 
                                            isFetchingConfusionMatrixAnalysis={isFetchingConfusionMatrixAnalysis}
                                            setIsFetchingConfusionMatrixAnalysis={setIsFetchingConfusionMatrixAnalysis}
                                        />
                                    </Col>
                                </Row>
                            }
                            {
                                menuSelection === 'visualization' &&
                                <Row>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} style={{ height: '100vh', maxHeight: '100vh' }}>
                                        <VisualizePanel 
                                            gestureData={gestureData} 
                                            classifierData={classifierData} 
                                            setIsolatedChartResizeFunc={setIsolatedChartResizeFunc}
                                            setMergedChartResizeFunc={setMergedChartResizeFunc} 
                                            isChartIsolated={isVisualizationChartIsolated}
                                            setIsChartIsolated={setIsVisualizationChartIsolated}
                                        />
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
            }
        </> 
    );
}

export default App;
