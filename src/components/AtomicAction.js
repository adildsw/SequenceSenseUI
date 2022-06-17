import { Image, Space } from 'antd';
import { useDrag } from 'react-dnd';

import '../App.css';

import firstShape from '../assets/shapes/shape-first.svg';
import midShape from '../assets/shapes/shape-mid.svg';
import lastShape from '../assets/shapes/shape-last.svg';
import { useEffect, useState } from 'react';

const AtomicAction = (props) => {
    const { type, selectedAtomicAction, setSelectedAtomicAction, gestureSequence } = props;

    const [srcImg, setSrcImg] = useState(midShape);

    useEffect(() => {
        if (gestureSequence.length === 0) {
            setSrcImg(firstShape);
        }
        else if (gestureSequence.length === 6) {
            setSrcImg(lastShape);
        }
        console.log('hjell');
    }, [gestureSequence]);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'atomic-action',
        item: { type: type },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }));

    const onAtomicActionClick = () => {
        setSelectedAtomicAction(prevState => {
            if (prevState === type) {
                return null;
            }
            return type;
        });
    }

    const getClassName = () => {
        var className = 'atomic-action';
        if (selectedAtomicAction === type) {
            className += ' selected';
        }
        return className;
    }

    const getSrcImg = () => {
        var srcImg = midShape;
        if (gestureSequence.length === 0) {
            srcImg = firstShape;
        }
        else if (gestureSequence.length === 6) {
            srcImg = lastShape;
        }
        return srcImg;
    }

    return (
        <div ref={drag} direction='horizontal' className={getClassName()} onClick={() => onAtomicActionClick()} style={{ opacity: isDragging ? '0.4' : '1'}}>
            <Image id={'atomic-action-img'} src={srcImg} height={'30px'} preview={false} style={{ filter: 'invert(10%)' }} />
            <span id={'atomic-action-type'} style={{ marginLeft: '16px'}}>{type}</span>
        </div>
    )
}

export default AtomicAction;