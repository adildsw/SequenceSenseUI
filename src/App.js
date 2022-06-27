import { useEffect, useState } from 'react';
import { Layout, Space, Image, Menu, Row, Col, Grid, Typography } from 'antd';
import { DatabaseOutlined, LineChartOutlined, MonitorOutlined } from '@ant-design/icons';

import { getAntdMenuItem } from './utils/AntdUtils';
import DatasetPanel from './panels/DatasetPanel';

import icon from './assets/sequence-sense-icon.svg';
import banner from './assets/sequence-sense-banner.svg';

import './App.css';
import VisualizationPanel from './panels/VisualizationPanel';
import ConflictPanel from './panels/ConflictPanel';
import AccuracyPanel from './panels/AccuracyPanel';
import ComponentVisualizationPanel from './panels/ComponentVisualizationPanel';

const { Content, Sider } = Layout;
const { Text } = Typography;

const MIN_ALLOWED_HEIGHT = 800;
const MIN_ALLOWED_WIDTH = 1300;

const SERVER_ADDRESS = 'http://127.0.0.1:3001';

const App = () => {
    const [menuSelection, setMenuSelection] = useState('dataset');
    const [gestureData, setGestureData] = useState({processed: false, labels: [], files: {}, data: {}});
    const [classifierData, setClassifierData] = useState({});
    const [conflictData, setConflictData] = useState({ gestureSequence: [], chartData: {} })
    const [selectedClassification, setSelectedClassification] = useState({ actualIdx: -1, predictedIdx: -1, actual: {}, predicted: {} });
    const [isVisualizationChartIsolated, setIsVisualizationChartIsolated] = useState(true);
    const [selectedGesture, setSelectedGesture] = useState('');
    const [generatedData, setGeneratedData] = useState({});
    const [gestureSequence, setGestureSequence] = useState([]);
    const [isComponentVisualizationVisible, setIsComponentVisualizationVisible] = useState(false);
    const [confidenceValue, setConfidenceValue] = useState(0.8);
    const [isSequencePreviewing, setIsSequencePreviewing] = useState(false);

    // Loading Variables
    const [isFetchingClassificationResult, setIsFetchingClassificationResult] = useState(false);
    const [isFetchingConfusionMatrixAnalysis, setIsFetchingConfusionMatrixAnalysis] = useState(false);
    const [isFetchingConflictAnalysis, setIsFetchingConflictAnalysis] = useState(false);

    // Resize Functions
    const [confusionMatrixPanelResizeFunc, setConfusionMatrixPanelResizeFunc] = useState(null);
    const [confusionMatrixChartResizeFunc, setConfusionMatrixChartResizeFunc] = useState(null);
    const [isolatedChartResizeFunc, setIsolatedChartResizeFunc] = useState(null);
    const [mergedChartResizeFunc, setMergedChartResizeFunc] = useState(null);
    const [componentChartResizeFunc, setComponentChartResizeFunc] = useState(null);
    const [conflictChartResizeFunc, setConflictChartResizeFunc] = useState(null);
    const [sequenceDesignerResizeFunc, setSequenceDesignerResizeFunc] = useState(null);
    const [previewResizeFunc, setPreviewResizeFunc] = useState(null);

    const { useBreakpoint } = Grid;

    const screenConfig = useBreakpoint();
    const [availWindowDim, setAvailWindowDim] = useState([0, 0]);

    useEffect(() => {
        setAvailWindowDim([window.innerWidth, window.innerHeight]);
        window.addEventListener('resize', () => {
            setAvailWindowDim([window.innerWidth, window.innerHeight]);
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
                ((!screenConfig.xl && !screenConfig.xxl) || (availWindowDim[0] < MIN_ALLOWED_WIDTH) || (availWindowDim[1] < MIN_ALLOWED_HEIGHT)) && 
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
                                            setGeneratedData={setGeneratedData}
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
                                        <VisualizationPanel 
                                            gestureData={gestureData} 
                                            classifierData={classifierData} 
                                            selectedGesture={selectedGesture}
                                            setSelectedGesture={setSelectedGesture}
                                            setIsolatedChartResizeFunc={setIsolatedChartResizeFunc}
                                            setMergedChartResizeFunc={setMergedChartResizeFunc} 
                                            isChartIsolated={isVisualizationChartIsolated}
                                            setIsChartIsolated={setIsVisualizationChartIsolated}
                                            generatedData={generatedData}
                                            setGeneratedData={setGeneratedData}
                                            setGestureSequence={setGestureSequence}
                                        />
                                    </Col>
                                </Row>
                            }
                            {
                                menuSelection === 'conflicts' &&
                                <Row>
                                    <Col span={isComponentVisualizationVisible ? 16 : 24} style={{ height: '100vh', maxHeight: '100vh', borderRight: '1px solid #f0f0f0' }}>
                                        <ConflictPanel 
                                            gestureData={gestureData}
                                            classifierData={classifierData}
                                            setClassifierData={setClassifierData}
                                            selectedGesture={selectedGesture}
                                            setSelectedGesture={setSelectedGesture} 
                                            gestureSequence={gestureSequence}
                                            setGestureSequence={setGestureSequence}
                                            setConflictChartResizeFunc={setConflictChartResizeFunc}
                                            setSequenceDesignerResizeFunc={setSequenceDesignerResizeFunc}
                                            setPreviewResizeFunc={setPreviewResizeFunc}
                                            isFetchingConflictAnalysis={isFetchingConflictAnalysis}
                                            setIsFetchingConflictAnalysis={setIsFetchingConflictAnalysis}
                                            conflictData={conflictData}
                                            setConflictData={setConflictData}
                                            screenConfig={screenConfig}
                                            isComponentVisualizationVisible={isComponentVisualizationVisible}
                                            setIsComponentVisualizationVisible={setIsComponentVisualizationVisible}
                                            confidenceValue={confidenceValue}
                                            setConfidenceValue={setConfidenceValue}
                                            isSequencePreviewing={isSequencePreviewing} 
                                            setIsSequencePreviewing={setIsSequencePreviewing}
                                            serverAddress={SERVER_ADDRESS}
                                        />
                                    </Col>
                                    {
                                        isComponentVisualizationVisible &&
                                        <Col span={8} style={{ height: '100vh', maxHeight: '100vh' }}>
                                            <ComponentVisualizationPanel 
                                                gestureData={gestureData}
                                                classifierData={classifierData}
                                                selectedGesture={selectedGesture}
                                                setSelectedGesture={setSelectedGesture}
                                                setComponentChartResizeFunc={setComponentChartResizeFunc}
                                                generatedData={generatedData}
                                                setGeneratedData={setGeneratedData}
                                                isComponentVisualizationVisible={isComponentVisualizationVisible}
                                                setIsComponentVisualizationVisible={setIsComponentVisualizationVisible}
                                            />
                                        </Col>
                                    }
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
