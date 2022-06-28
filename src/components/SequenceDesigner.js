import { DeleteOutlined, LeftOutlined, RightOutlined, SettingOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Button, Card, Image, message, Typography, Popover } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDrop } from "react-dnd";

import { getRenderedShape } from "../utils/ShapeUtil";

// import firstShape from '../assets/shapes/shape-first.svg';
// import midShape from '../assets/shapes/shape-mid.svg';
// import lastShape from '../assets/shapes/shape-last.svg';

const { Text } = Typography;

const SequenceDesigner = (props) => {
    const { 
        gestureSequence, 
        setGestureSequence, 
        selectedGesture, 
        setSpecificGestureVisualization, 
        classifierData, 
        setClassifierData, 
        setConflictData, 
        setIsSequencePreviewing, 
        setSequencePreviewIdx, 
        setSequenceDesignerResizeFunc, 
        serverAddress, 
        setIsFetchingConflictAnalysis 
    } = props;

    const [actionPopoverProps, setActionPopoverProps] = useState({'visible': false, 'idx': '-1', 'action': '', 'x': 0, 'y': 0});
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
        window.onclick = (e) => {
            if (!String(e.target.className).includes('ant-popover')) {
                setActionPopoverProps(prevState => {
                    if (prevState.visible === true)
                        return {...prevState, 'visible': false};
                    else
                        return prevState;
                });
            }
        }
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
            var srcImg = getRenderedShape(gestureSequence[i], 'mid');
            if (i === 0) srcImg = getRenderedShape(gestureSequence[i], 'first');
            else if (i === 7) srcImg = getRenderedShape(gestureSequence[i], 'last');

            var marginRight = '0px';
            if (i === 0) marginRight = '-' + sequenceDesignerDim[0] / 34 + 'px';
            else if (i === 6) marginRight = '-' + sequenceDesignerDim[0] / 34 + 'px';
            else {
                marginRight = '-' + sequenceDesignerDim[0] / 32 + 'px';
            }

            var marginLeft = '0px';
            if (i === 0) marginLeft = sequenceDesignerDim[0] / 150 + 'px';

            var width = sequenceDesignerDim[0] / 6.3 + 'px';
            if (i === 0 || i === 7) width = sequenceDesignerDim[0] / 7.9 + 'px';

            var imgStyle = {
                position: 'relative',
                filter: 'invert(10%)', 
                width: width,
                marginRight: marginRight,
                marginLeft: marginLeft
            }

            gestureSequenceFlow.push(
                <Image 
                    key={i}
                    className={'sequence-atomic-action gesture-' + i} 
                    src={srcImg} 
                    preview={false} 
                    style={{...imgStyle, imageRendering: '-webkit-optimize-contrast'}} 
                    onClick={() => {
                        message.destroy();
                        message.warning('Right click on atomic action for more options.');
                    }} 
                    onContextMenu={(e) => { handleSequenceActionClick(e); }} 
                />
            )
        }
        return gestureSequenceFlow;
    }

    const handleSequenceActionClick = (event) => {
        event.preventDefault();
        var actionIdx = -1;
        for (var c of event.target.className.split(' ')) {
            if (c.startsWith('gesture-')) {
                actionIdx = parseInt(c.split('-')[1]);
            }
        }
        setActionPopoverProps({
            ...actionPopoverProps, 
            visible: true, 
            idx: actionIdx, 
            x: event.clientX, 
            y: event.clientY,
            action: gestureSequence[actionIdx]
        });
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
        for (var atomicSeqKey of Object.keys(classifierData.atomicSeq)) {
            console.log(classifierData.atomicSeq[atomicSeqKey], gestureSequence);
            if (JSON.stringify(classifierData.atomicSeq[atomicSeqKey]) === JSON.stringify(gestureSequence)) {
                setSpecificGestureVisualization(prevState => {
                    var newState = { ...prevState };
                    for (var gesture of Object.keys(newState)) {
                        if (gesture !== selectedGesture) newState[gesture] = false;
                        else newState[gesture] = true;
                    }
                    return newState;
                });
                setIsFetchingConflictAnalysis(false);
                return;
            }
        }

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
                    setConflictData({ gestureSequence: [], chartData: {}});
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
                    console.log(data, classifierData);
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

    const moveAtomicActionLeft = () => {
        if (actionPopoverProps.idx === 0) return;
        var newGestureSequence = [...gestureSequence];
        var temp = newGestureSequence[actionPopoverProps.idx];
        newGestureSequence[actionPopoverProps.idx] = newGestureSequence[actionPopoverProps.idx - 1];
        newGestureSequence[actionPopoverProps.idx - 1] = temp;
        setGestureSequence(newGestureSequence);
    }

    const moveAtomicActionRight = () => {
        if (actionPopoverProps.idx === gestureSequence.length - 1) return;
        var newGestureSequence = [...gestureSequence];
        var temp = newGestureSequence[actionPopoverProps.idx];
        newGestureSequence[actionPopoverProps.idx] = newGestureSequence[actionPopoverProps.idx + 1];
        newGestureSequence[actionPopoverProps.idx + 1] = temp;
        setGestureSequence(newGestureSequence);
    }

    const deleteAtomicAction = () => {
        var newGestureSequence = [...gestureSequence];
        newGestureSequence.splice(actionPopoverProps.idx, 1);
        setGestureSequence(newGestureSequence);
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
                <Button disabled={gestureSequence.length === 0} style={{ flexGrow: '1', marginRight: '12px' }} onClick={() => { analyzeConflict(); }}><SettingOutlined />Calculate Conflict</Button>
                <Button 
                    disabled={gestureSequence.length === 0} 
                    onClick={() => {
                        setSequencePreviewIdx(0);
                        setIsSequencePreviewing(true);
                    }}>
                    <VideoCameraOutlined />{'Preview Sequence'}</Button>
            </div>
            <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: -1 }}>
                <Popover
                    overlayInnerStyle={{ position: 'relative', 'top': actionPopoverProps.y + 'px', 'left': actionPopoverProps.x + 'px', background: '#ffffffdd' }}
                    title={
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Text strong>Atomic Action:&nbsp;</Text>
                            <Text style={{ fontWeight: 'normal' }}>{actionPopoverProps.action} ({actionPopoverProps.idx + 1}) </Text>
                        </div>
                    }
                    content={
                        <div direction='horizontal' size={0} style={{ display: 'flex', flexDirection: 'row' }}>
                            <Button disabled={actionPopoverProps.idx === 0} style={{ flexGrow: '1', borderRight: '0px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px'  }} onClick={() => { moveAtomicActionLeft(); }}><LeftOutlined /></Button>
                            <Button type='default' danger style={{ flexGrow: '1', borderRadius: '0px' }} onClick={() => { deleteAtomicAction(); }}><DeleteOutlined /></Button>
                            <Button disabled={actionPopoverProps.idx === gestureSequence.length - 1} style={{ flexGrow: '1', borderLeft: '0px', borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }} onClick={() => { moveAtomicActionRight(); }}><RightOutlined /></Button>
                        </div>
                    }
                    visible={actionPopoverProps.visible}
                />
            </div>
        </>
    );
}

export default SequenceDesigner;