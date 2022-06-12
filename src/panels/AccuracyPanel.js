import { Button, Card, Empty, Space, Table, Tooltip, Typography } from 'antd';
import { useCallback, useState } from 'react';

const { Title, Text } = Typography;

const AccuracyPanel = (props) => {
    const { gestureData, classifierData } = props;

    const [panelDim, setPanelDim] = useState([0, 0]);

    const panelAreaRef = useCallback(node => {
        if (node !== null) {
            setPanelDim([node.clientWidth, node.clientHeight]);
            window.onresize = () => {
                console.log(node.height);
                if (node) {
                    console.log(node.clientWidth, node.clientHeight);
                    setPanelDim([node.clientWidth, node.clientHeight]);
                }
            };
        }
    }, []);

    const generateConfusionMatrixUI = () => {
        const side = panelDim[0] * 0.9 / gestureData.labels.length;
        const matrix = [];
        for (let i = 0; i < gestureData.labels.length; i++) {
            const matrixRow = [];
            for (let j = 0; j < gestureData.labels.length; j++) {
                const totalClassification = classifierData.confusionMatrix[i].reduce((partialSum, a) => partialSum + a, 0);
                const alpha = classifierData.confusionMatrix[i][j] / totalClassification;
                
                if (classifierData.confusionMatrix[i][j] === 0) {
                    matrixRow.push(
                        <Button disabled type={'text'} style={{ width: side, height: side, margin: '1px', background: 'rgba(0, 0, 0, 0.0)', border: '1px solid #eee' }}>0</Button>
                    );
                }
                else if (i === j) {
                    matrixRow.push(
                        <Tooltip title={gestureData.labels[i]} mouseEnterDelay={0.3}>
                            <Button type={'text'} style={{ width: side, height: side, margin: '1px', background: 'rgba(44, 143, 255, ' + alpha + ')', border: '1px solid #eee' }}>{classifierData.confusionMatrix[i][j]}</Button>
                        </Tooltip>
                    );
                }
                else {
                    matrixRow.push(
                        <Tooltip title={<><b>True:</b> {gestureData.labels[i]}<br /><b>Predicted:</b> {gestureData.labels[j]}</>} mouseEnterDelay={0.3}>
                            <Button type={'text'} style={{ width: side, height: side, margin: '1px', background: 'rgba(186, 73, 73, ' + alpha + ')', border: '1px solid #eee' }}>{classifierData.confusionMatrix[i][j]}</Button>
                        </Tooltip>
                    );
                }
            }
            matrix.push(<Space direction='horizontal' size={0} style={{ display: 'flex' }}>{matrixRow}</Space>);
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

    const gestureTableHeader = [
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

    return (
        <div ref={panelAreaRef} className='scrollable-div' style={{ padding: '8px' }}>
            {
                gestureData.processed &&
                <>
                    <Title level={2} style={{ marginBottom: '0px' }}>Classification Result</Title>

                    {/* Overall Accuracy */}
                    {/* <Card size={'small'} style={{ marginTop: '16px' }}>
                        <Text strong>Overall Accuracy</Text>
                    </Card>
                    <Card size={'small'} style={{ marginTop: '0px', borderTop: '0px'}}>
                        {(classifierData.accuracy * 100).toFixed(2) + '%'}
                    </Card> */}

                    {/* Gesture Accuracy */}
                    <Card size={'small'} style={{ marginTop: '16px' }} bodyStyle={{ padding: '0px' }} className='scrollable-section full-height-card-body'>
                        {generateAccuracyTableUI()}
                    </Card>

                    {/* Confusion Matrix */}
                    <Card size={'small'} style={{ marginTop: '16px' }}>
                        <Text strong>Confusion Matrix</Text>
                    </Card>
                    <Card ref={panelAreaRef} size={'small'} style={{ borderTop: '0px', display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
                        {generateConfusionMatrixUI()}
                    </Card>
                </>
            }
        </div>
    );
}

export default AccuracyPanel;