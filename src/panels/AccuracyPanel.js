import { useCallback, useState } from 'react';
import { InfoCircleFilled, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Image, Card, Space, Table, Tooltip, Typography, Row, Col, Modal } from 'antd';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, Label } from "recharts";

import { generateYAxisLabel, getChartLines } from "../utils/ChartUtils";

import banner from '../assets/sequence-sense-banner.svg';
import axisReference from '../assets/axis-ref.png';

const { Title, Text } = Typography;

const AccuracyPanel = (props) => {
    const { 
        gestureData, 
        classifierData, 
        screenConfig, 
        selectedClassification, 
        setSelectedClassification, 
        isFetchingClassificationResult, 
        isFetchingConfusionMatrixAnalysis, 
        setIsFetchingConfusionMatrixAnalysis, 
        setConfusionMatrixPanelResizeFunc, 
        setConfusionMatrixChartResizeFunc, 
        serverAddress 
    } = props;

    const [classificationVisualizationModalVisibility, setClassificationVisualizationModalVisibility] = useState(false);
    const [axisReferenceModalVisibility, setAxisReferenceModalVisibility] = useState(false);

    const [confusionMatrixPanelDim, setConfusionMatrixPanelDim] = useState([0, 0]);
    const [confusionMatrixChartDim, setConfusionMatrixChartDim] = useState([0, 0]);

    const confusionMatrixPanelAreaRef = useCallback(node => {
        if (node !== null) {
            const resizeFunc = () => {
                if (node) {
                    setConfusionMatrixPanelDim([node.clientWidth, node.clientHeight]);
                }
            }
            setConfusionMatrixPanelDim([node.clientWidth, node.clientHeight]);
            setConfusionMatrixPanelResizeFunc(prevState => {
                window.removeEventListener('resize', prevState);
                window.addEventListener('resize', resizeFunc);
                return resizeFunc;
            });
        }
    }, [setConfusionMatrixPanelResizeFunc]);

    const confusionMatrixChartAreaRef = useCallback(node => {
        if (node !== null) {
            const resizeFunc = () => {
                if (node) {
                    setConfusionMatrixChartDim([node.clientWidth, node.clientHeight]);
                }
            }
            setConfusionMatrixChartDim([node.clientWidth, node.clientHeight]);
            setConfusionMatrixChartResizeFunc(prevState => {
                window.removeEventListener('resize', prevState);
                window.addEventListener('resize', resizeFunc);
                return resizeFunc;
            });
        }
    }, [setConfusionMatrixChartResizeFunc]);

    const fetchConfusionMatrixChartData = (actualIdx, predictedIdx) => {
        const actualLabel = gestureData.labels[actualIdx];
        const predictedLabel = gestureData.labels[predictedIdx];
        const requestOptions = {
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actualLabel: actualLabel, predictedLabel: predictedLabel })
        };
        fetch(serverAddress + '/analyzeconfusionmatrix', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setClassificationVisualizationModalVisibility(() => {
                    setSelectedClassification({ actualIdx: actualIdx, predictedIdx: predictedIdx, actual: data.actual, predicted: data.predicted });
                    return true; 
                }); 
                setIsFetchingConfusionMatrixAnalysis(false);
            }, error => {
                console.log(error);
                setClassificationVisualizationModalVisibility(() => {
                    setSelectedClassification({actualIdx: -1, predictedIdx: -1, actual: {}, predicted: {}});
                    return false; 
                }); 
                setIsFetchingConfusionMatrixAnalysis(false);
            });
    }

    const generateConfusionMatrixUI = () => {
        const side = confusionMatrixPanelDim[0] * 0.9 / gestureData.labels.length;
        const matrix = [];
        for (let i = 0; i < gestureData.labels.length; i++) {
            const matrixRow = [];
            for (let j = 0; j < gestureData.labels.length; j++) {
                const totalClassification = classifierData.confusionMatrix[i].reduce((partialSum, a) => partialSum + a, 0);
                const alpha = classifierData.confusionMatrix[i][j] / totalClassification;
                const bgColor = classifierData.confusionMatrix[i][j] === 0 ? 'rgba(0, 0, 0, 0.0)' : i === j ? 'rgba(44, 143, 255, ' + alpha + ')' : 'rgba(186, 73, 73, ' + alpha + ')';
                const buttonParams = {
                    type: 'text',
                    disabled: classifierData.confusionMatrix[i][j] === 0,
                    style: {
                        width: side,
                        height: side,
                        margin: '1px',
                        border: i === selectedClassification.actualIdx && j === selectedClassification.predictedIdx ? '1px solid #000': '1px solid #eee',
                        background: bgColor
                    },
                    onClick: () => {
                        if (i === selectedClassification.actualIdx && j === selectedClassification.predictedIdx) {
                            setClassificationVisualizationModalVisibility(() => {
                                setSelectedClassification({actualIdx: -1, predictedIdx: -1, actual: {}, predicted: {}});
                                return false; 
                            });
                        }
                        else {
                            setIsFetchingConfusionMatrixAnalysis(true);
                            fetchConfusionMatrixChartData(i, j);
                        }
                    }
                }
                const tooltipParams = {
                    title: classifierData.confusionMatrix[i][j] === 0 ? '' : i === j ? gestureData.labels[i] : <><b>True:</b> {gestureData.labels[i]}<br /><b>Predicted:</b> {gestureData.labels[j]}</>,
                    mouseEnterDelay: 0.3
                }
                matrixRow.push(
                    <Tooltip key={j} {...tooltipParams}>
                        <Button key={j} {...buttonParams}>{classifierData.confusionMatrix[i][j]}</Button>
                    </Tooltip>
                );
            }
            matrix.push(<Space key={i} direction='horizontal' size={0} style={{ display: 'flex' }}>{matrixRow}</Space>);
        }
        return (
            <Space direction='vertical' size={0} style={{ display: 'flex' }}>
                {matrix}
            </Space>
        )
    }

    const generateAccuracyTableUI = () => {
        const column = [
            {
                title: 'Gesture',
                dataIndex: 'label',
                key: 'label',
            },
            {
                title: 'Accuracy',
                dataIndex: 'accuracy',
                key: 'accuracy',
            }
        ];

        var data = [];
        data.push({
            key: 'Overall Accuracy',
            label: <b>Overall Accuracy</b>,
            accuracy: <b>{(classifierData.accuracy * 100).toFixed(2) + '%'}</b>
        })
        for (let i = 0; i < gestureData.labels.length; i++) {
            var accuracy = classifierData.confusionMatrix[i][i] / classifierData.confusionMatrix[i].reduce((partialSum, a) => partialSum + a, 0);
            if (isNaN(accuracy)) {
                accuracy = 'N/A';
            }
            else {
                accuracy = (accuracy * 100).toFixed(2) + '%';
            }
            data.push({
                key: gestureData.labels[i],
                label: gestureData.labels[i],
                accuracy: accuracy
            });
        }

        return (
            <Table dataSource={data} columns={column} pagination={false} sticky style={{ margin: '0px' }} />
        )
    }

    const getConfusionMatrixChartData = (predictionType, chartType) => {
        var data = [];
        var rawData = selectedClassification[predictionType][chartType];
        if (selectedClassification.actualIdx !== -1 && selectedClassification.predictedIdx !== -1) {
            for (var idx = 0; idx < selectedClassification[predictionType]['sample'].length; idx++) {
                var entry = {
                    sample: selectedClassification[predictionType]['sample'][idx],
                };
                for (var item of Object.keys(rawData)) {
                    entry[item] = rawData[item][idx];
                }
                data.push(entry);
            }
        }
        return data;
    }

    const generateConfusionMatrixChart = (predictionType, chartType) => {
        var data = getConfusionMatrixChartData(predictionType, chartType);
        var lines = getChartLines(chartType, false);
        var width = confusionMatrixChartDim[0] * 0.95 * 0.5;
        var height = confusionMatrixChartDim[1] * 0.95;
        var minTickGap = 50;

        if (!screenConfig.xxl) {
            width = window.innerWidth * 0.7 * 0.5;
            height = window.innerHeight * 0.5 * 0.5;
        }
        
        return (
            <LineChart width={width} height={height} data={data} margin={{ top: 5, bottom: 5, right: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sample" minTickGap={minTickGap}>
                    <Label value="Sample" offset={-3} position='insideBottom' />
                </XAxis>
                <YAxis minTickGap={minTickGap}>
                    <Label value={generateYAxisLabel(chartType)} angle={-90} />
                </YAxis>
                <ChartTooltip formatter={(value) => Math.round(value * 10000) / 10000} labelFormatter={(value) => 'Sample: ' + value}/>
                <Legend verticalAlign="top" />
                {lines}
            </LineChart>
        );
    }

    return (
        <>
            {
                !gestureData.processed &&
                <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                    { 
                        isFetchingClassificationResult ? 
                        <>
                            <LoadingOutlined style={{ fontSize: 24 }} spin />
                            <Text type={'secondary'}>Classifying gesture samples...</Text>
                        </> :
                        <>
                            <Image src={banner} preview={false} />
                            <Text type={'secondary'}>
                                <InfoCircleOutlined /> <b>Tip:</b> { 
                                    gestureData.labels.length === 0 ? 'Begin by uploading gesture samples.' : <>Click on the <i>Classify Samples</i> to initiate gesture classification.</>
                                } 
                            </Text>
                        </>
                    }
                </Space>
            }
            {
                gestureData.processed &&
                <Row style={{ height: '100vh' }}>
                    {
                        screenConfig.xxl ? 
                        // LARGE SCREEN SIZE
                        <>
                            <Col ref={confusionMatrixPanelAreaRef} span={9} style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '8px', borderRight: '1px solid #f0f0f0' }} >
                                <Title level={2} style={{ marginBottom: '0px' }}>Classification Result</Title>
                                <Card size={'small'} style={{ marginTop: '12px' }} bodyStyle={{ padding: '0px' }} className='scrollable-section full-height-card-body'>
                                    {generateAccuracyTableUI()}
                                </Card>
                                <Card ref={confusionMatrixPanelAreaRef} size={'small'} style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
                                    {generateConfusionMatrixUI()}
                                </Card>
                            </Col>
                            <Col span={15} style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '8px', borderRight: '1px solid #f0f0f0' }}>
                                {
                                    isFetchingConfusionMatrixAnalysis ? 
                                    <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                                        <Text type={'secondary'}>Fetching confusion matrix analysis...</Text>
                                    </Space> :
                                    selectedClassification.actualIdx === -1 || selectedClassification.predictedIdx === -1 ?
                                    <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                                        <Image src={banner} preview={false} />
                                        <Text type={'secondary'}>
                                            <InfoCircleOutlined /> <b>Tip:</b> Click on the confusion matrix to visualize the classification result.
                                        </Text>
                                    </Space> :
                                    <>
                                        <Space direction={'horizontal'} size={8} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Space direction={'horizontal'} size={8} style={{ display: 'flex' }}>
                                            <Title level={2} style={{ marginBottom: '12px' }}>Visualization</Title>
                                            </Space>
                                            <Space direction={'horizontal'} size={8} style={{ display: 'flex' }}>
                                            <Tooltip title='Axis Frame Reference'>
                                                <Button shape="circle" icon={<InfoCircleFilled />} size={'middle'} style={{ marginBottom: '12px' }} onClick={() => { setAxisReferenceModalVisibility(true); }} />
                                            </Tooltip>
                                            </Space>
                                        </Space>
                                        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
                                            <div style={{ flexGrow: '1', paddingBottom: '12px' }}>
                                                <Card 
                                                    title={
                                                    <>
                                                        <Text strong>Actual Gesture: </Text>
                                                        <Text style={{ fontWeight: 'normal' }}>{gestureData.labels[selectedClassification.actualIdx]}</Text>
                                                    </>
                                                    } 
                                                    size={'small'} 
                                                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }} 
                                                    bodyStyle={{ flexGrow: 1 }}>
                                                    <div ref={confusionMatrixChartAreaRef} style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                                                        <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
                                                            { generateConfusionMatrixChart('actual', 'distance') }
                                                        </div>
                                                        <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center'  }}>
                                                            { generateConfusionMatrixChart('actual', 'orientation') }
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                            <div style={{ flexGrow: '1' }}>
                                                <Card 
                                                    title={
                                                        <>
                                                            <Text strong>Predicted Gesture: </Text>
                                                            <Text style={{ fontWeight: 'normal' }}>{gestureData.labels[selectedClassification.predictedIdx]}</Text>
                                                        </>
                                                    } 
                                                    size={'small'} 
                                                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }} 
                                                    bodyStyle={{ flexGrow: 1 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                                                        <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
                                                            { generateConfusionMatrixChart('predicted', 'distance') }
                                                        </div>
                                                        <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center'  }}>
                                                            { generateConfusionMatrixChart('predicted', 'orientation') }
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    </>
                                }
                            </Col>
                        </> : 
                        // SMALL SCREEN SIZE
                        <>
                            <Col span={15} style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '8px' }} >
                                <Title level={2} style={{ marginBottom: '0px' }}>Classification Result</Title>
                                <Card ref={confusionMatrixPanelAreaRef} size={'small'} style={{ marginTop: '12px', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
                                    {generateConfusionMatrixUI()}
                                </Card>
                                <Card size={'small'} style={{ height: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {
                                        isFetchingConfusionMatrixAnalysis ? 
                                        <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <LoadingOutlined style={{ fontSize: 24 }} spin />
                                            <Text type={'secondary'}>Fetching confusion matrix analysis...</Text>
                                        </Space> :
                                        <>
                                            <Text type={'secondary'}>
                                                <InfoCircleOutlined /> <b>Tip:</b> Click on the confusion matrix to visualize the classification result.
                                            </Text>
                                        </>
                                    }
                                </Card>
                            </Col>
                            <Col span={9} style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '8px', borderRight: '1px solid #f0f0f0' }} >
                                <Card size={'small'} style={{ marginTop: '0px' }} bodyStyle={{ padding: '0px' }} className='scrollable-section full-height-card-body'>
                                    {generateAccuracyTableUI()}
                                </Card>
                            </Col>
                            <Modal 
                                centered 
                                mask={true} 
                                maskClosable={true} 
                                visible={classificationVisualizationModalVisibility && !screenConfig.xxl} 
                                footer={null} 
                                width={'80vw'}
                                bodyStyle={{ minHeight: '70vh' }}
                                title={
                                <>
                                    <Space direction={'horizontal'} size={8} style={{ display: 'flex' }}>
                                        <Title level={2} style={{ marginBottom: '12px' }}>Visualization</Title>
                                        <Tooltip title="Axis Frame Reference">
                                            <Button shape="circle" icon={<InfoCircleFilled />} size={'middle'} style={{ marginBottom: '12px' }} onClick={() => { setAxisReferenceModalVisibility(true); }} />
                                        </Tooltip>
                                    </Space>
                                </>}
                                onCancel={() => { 
                                    setSelectedClassification({ actualIdx: -1, predictedIdx: -1, actual: {}, predicted: {} });
                                    setClassificationVisualizationModalVisibility(false); 
                                }}>
                                <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ flexGrow: '1', paddingBottom: '8px' }}>
                                        <Card 
                                            title={
                                                <>
                                                    <Text strong>Actual Gesture: </Text>
                                                    <Text style={{ fontWeight: 'normal' }}>{gestureData.labels[selectedClassification.actualIdx]}</Text>
                                                </>
                                            } 
                                            size={'small'} 
                                            style={{ display: 'flex', flexDirection: 'column', height: '100%' }} 
                                            bodyStyle={{ flexGrow: 1 }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                                                <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
                                                    { generateConfusionMatrixChart('actual', 'distance') }
                                                </div>
                                                <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center'  }}>
                                                    { generateConfusionMatrixChart('actual', 'orientation') }
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                    <div style={{ flexGrow: '1', paddingTop: '8px' }}>
                                        <Card 
                                            title={
                                                <>
                                                    <Text strong>Predicted Gesture: </Text>
                                                    <Text style={{ fontWeight: 'normal' }}>{gestureData.labels[selectedClassification.predictedIdx]}</Text>
                                                </>
                                            } 
                                            size={'small'} 
                                            style={{ display: 'flex', flexDirection: 'column', height: '100%' }} 
                                            bodyStyle={{ flexGrow: 1 }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                                                <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
                                                    { generateConfusionMatrixChart('predicted', 'distance') }
                                                </div>
                                                <div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center'  }}>
                                                    { generateConfusionMatrixChart('predicted', 'orientation') }
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </Modal>
                        </>
                    }
                </Row>
            }
            <Modal centered mask={true} maskClosable={true} onCancel={() => { setAxisReferenceModalVisibility(false); }} visible={axisReferenceModalVisibility} footer={null}>
                <Image src={axisReference} preview={false} />
            </Modal>
        </>
    );
}

export default AccuracyPanel;