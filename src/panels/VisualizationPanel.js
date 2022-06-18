import { Button, Card, Image, Select, Space, Steps, Typography, Tooltip, Modal, Row, Col } from "antd";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, Label } from "recharts";

import { getAntdSelectItem } from "../utils/AntdUtils";

import { generateYAxisLabel, getChartLines, visToChartType } from "../utils/ChartUtils";

import banner from '../assets/sequence-sense-banner.svg';
import axisReference from '../assets/axis-ref.png';
import { useCallback, useEffect, useState } from "react";
import { AppstoreOutlined, InfoCircleFilled, LineChartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Step } = Steps;

const VisualizationPanel = (props) => {

    const { gestureData, classifierData, isChartIsolated, selectedGesture, setSelectedGesture, setGestureSequence, generatedData, setGeneratedData, setIsChartIsolated, setIsolatedChartResizeFunc, setMergedChartResizeFunc } = props;

    const [visualizationSelect, setVisualizationSelect] = useState(0);

    const [axisReferenceModalVisibility, setAxisReferenceModalVisibility] = useState(false);

    const [isolatedChartDim, setIsolatedChartDim] = useState([0, 0]);
    const [mergedChartDim, setMergedChartDim] = useState([0, 0]);

    const isolatedChartAreaRef = useCallback(node => {
        if (node !== null) {
            const resizeFunc = () => {
                if (node) {
                    setIsolatedChartDim([node.clientWidth, node.clientHeight]);
                }
            }
            setIsolatedChartDim([node.clientWidth, node.clientHeight]);
            setIsolatedChartResizeFunc(prevState => {
                window.removeEventListener('resize', prevState);
                window.addEventListener('resize', resizeFunc);
                return resizeFunc;
            });
        }
    }, [setIsolatedChartResizeFunc]);

    const mergedChartAreaRef = useCallback(node => {
        if (node !== null) {
            const resizeFunc = () => {
                if (node) {
                    setMergedChartDim([node.clientWidth, node.clientHeight]);
                }
            }
            setMergedChartDim([node.clientWidth, node.clientHeight]);
            setMergedChartResizeFunc(prevState => {
                window.removeEventListener('resize', prevState);
                window.addEventListener('resize', resizeFunc);
                return resizeFunc;
            });
        }
    }, [setMergedChartResizeFunc]);

    useEffect(() => {
        if (gestureData.processed && selectedGesture === '') {
            setSelectedGesture(gestureData.labels[0]);
        }
    }, [gestureData, selectedGesture, setSelectedGesture]);

    const gestureSelectOptions = gestureData.labels.map(gesture => getAntdSelectItem(gesture, gesture));

    const visualizationStatus = (chartType) => {
        if (chartType === visToChartType(visualizationSelect)) {
            return 'process';
        }
        return 'wait';
    }

    const getChartData = (gesture, type) => {
        if (generatedData.hasOwnProperty('vis-' + selectedGesture + '-' + gesture + '-' + type)) {
            return generatedData['vis-' + selectedGesture + '-' + gesture + '-' + type];
        }

        if (!Object.keys(classifierData).includes('chartData')) return [];
        if (!Object.keys(classifierData.chartData).includes('concat')) return [];
        const chartData = classifierData.chartData.concat;

        var data = [];
        if (gestureData.processed && gesture !== '') {
            for (var idx = 0; idx < chartData[gesture]['timestamp'].length; idx++) {
                var entry = {
                    timestamp: chartData[gesture]['timestamp'][idx]
                };
                for (var item of Object.keys(chartData[gesture][type])) {
                    entry[item] = chartData[gesture][type][item][idx];
                }
                data.push(entry);
            }
        }

        if (data.length !== 0) {
            setGeneratedData(prevState => {
                prevState['vis-' + selectedGesture + '-' + gesture + '-' + type] = data;
                return prevState;
            });
        }
        return data;
    }

    const generateChart = (chartType) => {
        var data = getChartData(selectedGesture, chartType);
        var width = isChartIsolated ? isolatedChartDim[0] * 0.95 : mergedChartDim[0] * 0.95;
        var height = isChartIsolated ? isolatedChartDim[1] * 0.95 : mergedChartDim[1] * 0.5 * 0.8;
        var lines = getChartLines(chartType, isChartIsolated);
        var minTickGap = isChartIsolated ? 100 : 50;

        if (!isChartIsolated) {
            if (chartType === 'raw' || chartType === 'postprocess') {
                width *= 0.5;
            } else {
                width *= 0.33;
                minTickGap = 40;
            }
        }
        
        return (
            <LineChart width={width} height={height} data={data} margin={{ top: 5, bottom: 5, right: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" minTickGap={minTickGap}>
                    <Label value="Timestamp (ms)" offset={-3} position='insideBottom' />
                </XAxis>
                <YAxis >
                    <Label value={generateYAxisLabel(chartType)} angle={-90} />
                </YAxis>
                <ChartTooltip formatter={(value) => Math.round(value * 10000) / 10000} labelFormatter={(value) => 'Timestamp: ' + value + ' ms'}/>
                <Legend verticalAlign="top" />
                {lines}
            </LineChart>
        );
    }

    return (
        <div className='scrollable-div' style={{ padding: '8px' }}>
            { 
                (gestureData.labels.length === 0 || !gestureData.processed) && 
                <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image src={banner} preview={false} />
                </Space>
            }
            {
                (gestureData.labels.length !== 0 && gestureData.processed) &&
                <>
                    <Title level={2} style={{ marginBottom: '0px' }}>Processing Visualization</Title>
                    <Card size='small' style={{ marginTop: '12px' }}>
                        <Space direction={'horizontal'} size={8} style={{ display: 'flex', height: '100%', justifyContent: 'space-between' }}>
                            <Space direction={'horizontal'} size={8} style={{ display: 'flex' }}>
                                <Text strong>Select Gesture</Text>
                                <Select
                                    style={{ width: 320 }}
                                    placeholder='Select Gesture'
                                    options={gestureSelectOptions}
                                    bordered={true}
                                    defaultValue={gestureSelectOptions[0].value}
                                    value={selectedGesture}
                                    onChange={(value) => { setSelectedGesture(value); setGestureSequence(classifierData.atomicSeq[value]); console.log(classifierData.atomicSeq); }}
                                />
                            </Space>
                            <Space direction={'horizontal'} size={8} style={{ display: 'flex' }}>
                                <Tooltip title={isChartIsolated ? "Merge Charts" : "Isolate Charts"} >
                                    <Button shape="circle" icon={isChartIsolated ? <AppstoreOutlined /> : <LineChartOutlined />} size={'middle'} onClick={() => { setIsChartIsolated(!isChartIsolated); }}/>
                                </Tooltip>
                                <Tooltip title="Axis Frame Reference" >
                                    <Button shape="circle" icon={<InfoCircleFilled />} size={'middle'} onClick={() => { setAxisReferenceModalVisibility(true); }} />
                                </Tooltip>
                            </Space>
                        </Space>
                        <Modal centered mask={true} maskClosable={true} onCancel={() => { setAxisReferenceModalVisibility(false); }} visible={axisReferenceModalVisibility} footer={null}>
                            <Image src={axisReference} preview={false} />
                        </Modal>
                    </Card>
                    { 
                        isChartIsolated && 
                        <>
                            <Card ref={isolatedChartAreaRef} size='small' style={{ display: 'flex', borderTop: '0px', borderBottom: '0px', flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
                                { generateChart(visToChartType(visualizationSelect)) }
                            </Card>
                            <Card size='small'>
                                <Steps current={visualizationSelect} size='small' direction='horizontal' type={'default'} onChange={(value) => { setVisualizationSelect(value); }}>
                                    <Step status={visualizationStatus('raw')} title="Acceleration" description="Raw Accelerometer Data" />
                                    <Step status={visualizationStatus('postprocess')} title="Post-Processing" description="Kalman-Filter and Rotation" />
                                    <Step status={visualizationStatus('velocity')} title="Velocity" description="Computed Velocity Data" />
                                    <Step status={visualizationStatus('distance')} title="Distance" description="Computed Relative Distance Data" />
                                    <Step status={visualizationStatus('orientation')} title="Orientation" description="Computed Relative Oritentation Data" />
                                </Steps>
                            </Card>
                        </>
                    }
                    {
                        !isChartIsolated &&
                        <>
                            <div ref={mergedChartAreaRef} style={{ display: 'flex', height: '100%', flexDirection: 'column', flexGrow: '1' }}>
                                <Row style={{ display: 'flex', flexGrow: '1' }}>
                                    <Col span={12}>
                                        <Card size='small' title="Raw Accelerometer Data" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTop: '0px', borderRight: '0px' }}>
                                            { generateChart('raw') }
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size='small' title="Post-Processed with Kalman Filter and Rotation" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTop: '0px' }}>
                                            { generateChart('postprocess') }
                                        </Card>
                                    </Col>
                                </Row>
                                <Row style={{ display: 'flex', flexGrow: '1' }}>
                                    <Col span={8}>
                                        <Card size='small' title="Computed Velocity Data" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTop: '0px', borderRight: '0px' }}>
                                            { generateChart('velocity') }
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card size='small' title="Computed Relative Distance Data" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTop: '0px', borderRight: '0px' }}>
                                            { generateChart('distance') }
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card size='small' title="Computed Orientation Data" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTop: '0px' }}>
                                            { generateChart('orientation') }
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    }
                </>
            }
        </div>
    )
}

export default VisualizationPanel;