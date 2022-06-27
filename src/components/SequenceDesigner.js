import { SettingOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Button, Card, Image, message, Typography, Popover } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDrop } from "react-dnd";

import firstShape from '../assets/shapes/shape-first.svg';
import midShape from '../assets/shapes/shape-mid.svg';
import lastShape from '../assets/shapes/shape-last.svg';

const { Text } = Typography;

const SequenceDesigner = (props) => {
    const { gestureSequence, setGestureSequence, selectedGesture, setSpecificGestureVisualization, classifierData, setClassifierData, setConflictData, setIsSequencePreviewing, setSequencePreviewIdx, screenConfig, setSequenceDesignerResizeFunc, serverAddress, setIsFetchingConflictAnalysis } = props;

    const [popoverVisible, setPopoverVisible] = useState(false);
    const [sequenceDesignerDim, setSequenceDesignerDim] = useState([0, 0]);

    const sequenceDesignerAreaRef = useCallback(node => {
        if (node !== null) {
            const resizeFunc = () => {
                if (node) {
                    setSequenceDesignerDim([node.clientWidth, node.clientHeight]);
                }
            }
            setSequenceDesignerDim([node.clientWidth, node.clientHeight]);
            setSequenceDesignerResizeFunc(prevState => {
                window.removeEventListener('resize', prevState);
                window.addEventListener('resize', resizeFunc);
                return resizeFunc;
            });
        }
    }, [setSequenceDesignerResizeFunc]);

    useEffect(() => {
        window.addEventListener('click', (e) => {
            if (!String(e.target.className).includes('ant-popover')) {
                setPopoverVisible(prevState => {
                    if (prevState.visible === true)
                        return {...prevState, 'visible': false};
                    else
                        return prevState;
                });
            }
        });
    }, []);

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'atomic-action', 
        drop: (item) => {
            setGestureSequence(prevState => {
                const newGestureSequence = [...prevState];
                if (prevState.length < 8) newGestureSequence.push(item.type);
                return newGestureSequence;
            })
            return {'droppedOn': gestureSequence};
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }), []);
    const isActive = canDrop && isOver;

    const generateGestureSequenceFlow = (gestureSequence) => {
        var gestureSequenceFlow = [];
        for (var i = 0; i < gestureSequence.length; i++) {
            var srcImg = midShape;
            if (i === 0) srcImg = firstShape;
            else if (i === 7) srcImg = lastShape;

            var marginRight = '0px';
            if (i === 0) marginRight = '-' + sequenceDesignerDim[0] / 16 + 'px';
            else if (i === 6) marginRight = '-' + sequenceDesignerDim[0] / 34 + 'px';
            else {
                marginRight = '-' + sequenceDesignerDim[0] / 32 + 'px';
            }

            var marginLeft = '0px';
            if (i === 0) marginLeft = sequenceDesignerDim[0] / 150 + 'px';

            var imgStyle = {
                position: 'relative',
                filter: 'invert(10%)', 
                width: sequenceDesignerDim[0] / 6.3 + 'px',
                marginRight: marginRight,
                marginLeft: marginLeft
            }
            var textStyle = {
                position: 'absolute',
                top: '50%', 
                left: '50%', 
                transform: i === 0 ? 'translate(-50%, -50%)' : i === 7 ? 'translate(50%, -50%)' : 'translate(100%, -50%)'
            }

            gestureSequenceFlow.push(
                <div className={i} style={{ position: 'relative' }}>
                    {/* <Tooltip key={i} title={gestureSequence[i]}> */}
                        <Image className={'sequence-atomic-action gesture-' + i} src={srcImg} preview={false} style={imgStyle} onClick={(e) => { handleSequenceActionClick(e); }} />
                        <p style={textStyle}><Text strong>{gestureSequence[i]}</Text></p>
                    {/* </Tooltip> */}
                </div>
            )
        }
        return gestureSequenceFlow;
    }

    const handleSequenceActionClick = (event) => {
        var actionIdx = -1;
        for (var c of event.target.className.split(' ')) {
            if (c.startsWith('gesture-')) {
                actionIdx = parseInt(c.split('-')[1]);
            }
        }
        console.log(actionIdx);
        // setPopoverVisible(true);
    }

    const dropSpaceParams = {
        flexGrow: '1',  
        display: 'flex', 
        flexDirection: 'column', 
        marginBottom: '12px', 
        borderStyle: 'dashed', 
        borderColor: isActive && gestureSequence.length < 8 ? '#111' : '#ddd'
    }

    const generateSequenceDesignerTitle = () => {
        var title = 'Sequence Designer';
        if (gestureSequence.length > 0) {
            title = 'Sequence Designer | ' + gestureSequence.join('-');
        }
        return title;
    }

    const analyzeConflict = () => {
        if (classifierData.atomicSeq[selectedGesture] === gestureSequence) {
            setSpecificGestureVisualization(prevState => {
                var newState = { ...prevState };
                for (var gesture of Object.keys(newState)) {
                    if (gesture !== selectedGesture) newState[gesture] = false;
                    else newState[gesture] = true;
                }
                return newState;
            });
            setIsFetchingConflictAnalysis(false);
        }
        else {
            setIsFetchingConflictAnalysis(true);
            const requestOptions = {
                method: 'POST',
                header: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'sequence': gestureSequence })
            };
            fetch(serverAddress + '/analyzeconflict', requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (!Object.keys(data).includes('status')) {
                        message.error('Error: Invalid response from server.')
                        setIsFetchingConflictAnalysis(false);
                        setConflictData({ gestureSequence: [], chartData: {}})
                        setClassifierData(prevState => {
                            var newClassifierData = { ...prevState };
                            newClassifierData.gestureSequence = [];
                            return newClassifierData;
                        });
                    }
                    else if (data.status !== 'Ok') {
                        message.error('Error: ' + data.message);
                        setIsFetchingConflictAnalysis(false);
                        setConflictData({ gestureSequence: [], chartData: {}})
                        setClassifierData(prevState => {
                            var newClassifierData = { ...prevState };
                            newClassifierData.gestureSequence = [];
                            return newClassifierData;
                        });
                    }
                    else {
                        console.log(data);
                        setConflictData({ gestureSequence: gestureSequence, chartData: data});
                        var newClassifierData = { ...classifierData };
                        newClassifierData.gestureSequence = gestureSequence;
                        newClassifierData['avgConflictAnalysis'] = data['avgConflictAnalysis'];
                        newClassifierData['conflictAnalysis']['custom_seq'] = data['conflictAnalysis']['custom_seq'];
                        setClassifierData(prevState => {
                            console.log(prevState);
                            console.log(newClassifierData);
                            return newClassifierData
                        });
                        setSpecificGestureVisualization(prevState => {
                            var newState = { ...prevState };
                            for (var gesture of Object.keys(newState)) {
                                if (gesture !== 'custom_seq') newState[gesture] = false;
                                else newState[gesture] = true;
                            }
                            return newState;
                        })
                        setIsFetchingConflictAnalysis(false);
                    }
                }, error => {
                    console.log(error);
                    setIsFetchingConflictAnalysis(false);
                    setConflictData({ gestureSequence: [], chartData: {}})
                    setClassifierData(prevState => {
                        var newClassifierData = { ...prevState };
                        newClassifierData.gestureSequence = [];
                        return newClassifierData;
                    });
                });
        }
    }
    
    return (
        <>
            <Card ref={drop} title={generateSequenceDesignerTitle()} size='small' style={dropSpaceParams} bodyStyle={{ flexGrow: '1', display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <div ref={sequenceDesignerAreaRef} style={{ flexGrow: '1', display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    { 
                        gestureSequence.length === 0 ? 
                        isActive ?
                        <Text type={'secondary'}>
                            Drop Atomic Action Here
                        </Text> :
                        <Text type={'secondary'}>
                            Drag and Drop Atomic Actions Here
                        </Text> : 
                        <div style={{ width: '100%', flexGrow: '1', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            { generateGestureSequenceFlow(gestureSequence) }
                        </div>
                    }
                </div>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Button disabled={gestureSequence.length === 0} type='danger' style={{ marginRight: '12px' }} onClick={() => { setGestureSequence([]); }}>Clear All</Button>
                {/* <Tooltip title='Move Atomic Action Left'>
                    <Button disabled style={{ borderRight: '0px' }}><LeftOutlined /></Button>
                </Tooltip>
                <Tooltip title='Delete Atomic Action'>
                    <Button disabled type='default' danger style={{ borderRadius: '0px' }} ><DeleteOutlined /></Button>
                </Tooltip>
                <Tooltip title='Move Atomic Action Right'>
                    <Button disabled style={{ borderLeft: '0px', marginRight: '12px', borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}><RightOutlined /></Button>
                </Tooltip> */}
                <Button disabled={gestureSequence.length === 0} style={{ flexGrow: '1', marginRight: '12px' }} onClick={() => { analyzeConflict(); }}><SettingOutlined />Calculate Conflict</Button>
                <Button 
                    disabled={gestureSequence.length === 0} 
                    onClick={() => {
                        setIsSequencePreviewing(prevState => {
                            setSequencePreviewIdx(0);
                            return true;
                        })
                    }}>
                    <VideoCameraOutlined />{'Preview Sequence'}</Button>
                <Popover
                    content={<a onClick={() => { setPopoverVisible(false); }}>Close</a>}
                    title="Title"
                    visible={popoverVisible}
                    onVisibleChange={(value) => { setPopoverVisible(value); }}
                />
            </div>
        </>
    );
}

export default SequenceDesigner;