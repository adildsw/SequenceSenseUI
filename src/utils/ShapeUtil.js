import firstShape from '../assets/shapes/rendered/shape-first.png';
import midShape from '../assets/shapes/rendered/shape-mid.png';
import lastShape from '../assets/shapes/rendered/shape-last.png';

import a0First from '../assets/shapes/rendered/shape-first-a0.png';
import a1First from '../assets/shapes/rendered/shape-first-a1.png';
import a2First from '../assets/shapes/rendered/shape-first-a2.png';
import a3First from '../assets/shapes/rendered/shape-first-a3.png';
import a4First from '../assets/shapes/rendered/shape-first-a4.png';
import a5First from '../assets/shapes/rendered/shape-first-a5.png';
import a6First from '../assets/shapes/rendered/shape-first-a6.png';
import a7First from '../assets/shapes/rendered/shape-first-a7.png';
import a8First from '../assets/shapes/rendered/shape-first-a8.png';
import a9First from '../assets/shapes/rendered/shape-first-a9.png';
import a10First from '../assets/shapes/rendered/shape-first-a10.png';
import a11First from '../assets/shapes/rendered/shape-first-a11.png';
import a12First from '../assets/shapes/rendered/shape-first-a12.png';
import a13First from '../assets/shapes/rendered/shape-first-a13.png';
import a14First from '../assets/shapes/rendered/shape-first-a14.png';
import aw1First from '../assets/shapes/rendered/shape-first-aw1.png';
import aw2First from '../assets/shapes/rendered/shape-first-aw2.png';
import aw3First from '../assets/shapes/rendered/shape-first-aw3.png';
import aw4First from '../assets/shapes/rendered/shape-first-aw4.png';

import a0Last from '../assets/shapes/rendered/shape-last-a0.png';
import a1Last from '../assets/shapes/rendered/shape-last-a1.png';
import a2Last from '../assets/shapes/rendered/shape-last-a2.png';
import a3Last from '../assets/shapes/rendered/shape-last-a3.png';
import a4Last from '../assets/shapes/rendered/shape-last-a4.png';
import a5Last from '../assets/shapes/rendered/shape-last-a5.png';
import a6Last from '../assets/shapes/rendered/shape-last-a6.png';
import a7Last from '../assets/shapes/rendered/shape-last-a7.png';
import a8Last from '../assets/shapes/rendered/shape-last-a8.png';
import a9Last from '../assets/shapes/rendered/shape-last-a9.png';
import a10Last from '../assets/shapes/rendered/shape-last-a10.png';
import a11Last from '../assets/shapes/rendered/shape-last-a11.png';
import a12Last from '../assets/shapes/rendered/shape-last-a12.png';
import a13Last from '../assets/shapes/rendered/shape-last-a13.png';
import a14Last from '../assets/shapes/rendered/shape-last-a14.png';
import aw1Last from '../assets/shapes/rendered/shape-last-aw1.png';
import aw2Last from '../assets/shapes/rendered/shape-last-aw2.png';
import aw3Last from '../assets/shapes/rendered/shape-last-aw3.png';
import aw4Last from '../assets/shapes/rendered/shape-last-aw4.png';

import a0Mid from '../assets/shapes/rendered/shape-mid-a0.png';
import a1Mid from '../assets/shapes/rendered/shape-mid-a1.png';
import a2Mid from '../assets/shapes/rendered/shape-mid-a2.png';
import a3Mid from '../assets/shapes/rendered/shape-mid-a3.png';
import a4Mid from '../assets/shapes/rendered/shape-mid-a4.png';
import a5Mid from '../assets/shapes/rendered/shape-mid-a5.png';
import a6Mid from '../assets/shapes/rendered/shape-mid-a6.png';
import a7Mid from '../assets/shapes/rendered/shape-mid-a7.png';
import a8Mid from '../assets/shapes/rendered/shape-mid-a8.png';
import a9Mid from '../assets/shapes/rendered/shape-mid-a9.png';
import a10Mid from '../assets/shapes/rendered/shape-mid-a10.png';
import a11Mid from '../assets/shapes/rendered/shape-mid-a11.png';
import a12Mid from '../assets/shapes/rendered/shape-mid-a12.png';
import a13Mid from '../assets/shapes/rendered/shape-mid-a13.png';
import a14Mid from '../assets/shapes/rendered/shape-mid-a14.png';
import aw1Mid from '../assets/shapes/rendered/shape-mid-aw1.png';
import aw2Mid from '../assets/shapes/rendered/shape-mid-aw2.png';
import aw3Mid from '../assets/shapes/rendered/shape-mid-aw3.png';
import aw4Mid from '../assets/shapes/rendered/shape-mid-aw4.png';

export const getRenderedShape = (action, pos) => {
    if (pos === 'first') {
        switch(action) {
            case 'a0':
                return a0First;
            case 'a1':
                return a1First;
            case 'a2':
                return a2First;
            case 'a3':
                return a3First;
            case 'a4':
                return a4First;
            case 'a5':
                return a5First;
            case 'a6':
                return a6First;
            case 'a7':
                return a7First;
            case 'a8':
                return a8First;
            case 'a9':
                return a9First;
            case 'a10':
                return a10First;
            case 'a11':
                return a11First;
            case 'a12':
                return a12First;
            case 'a13':
                return a13First;
            case 'a14':
                return a14First;
            case 'aw1':
                return aw1First;
            case 'aw2':
                return aw2First;
            case 'aw3':
                return aw3First;
            case 'aw4':
                return aw4First;
            default:
                return firstShape;
        }
    }
    else if (pos === 'last') {
        switch(action) {
            case 'a0':
                return a0Last;
            case 'a1':
                return a1Last;
            case 'a2':
                return a2Last;
            case 'a3':
                return a3Last;
            case 'a4':
                return a4Last;
            case 'a5':
                return a5Last;
            case 'a6':
                return a6Last;
            case 'a7':
                return a7Last;
            case 'a8':
                return a8Last;
            case 'a9':
                return a9Last;
            case 'a10':
                return a10Last;
            case 'a11':
                return a11Last;
            case 'a12':
                return a12Last;
            case 'a13':
                return a13Last;
            case 'a14':
                return a14Last;
            case 'aw1':
                return aw1Last;
            case 'aw2':
                return aw2Last;
            case 'aw3':
                return aw3Last;
            case 'aw4':
                return aw4Last;
            default:
                return lastShape;
        }
    }
    else if (pos === 'mid') {
        switch(action) {
            case 'a0':
                return a0Mid;
            case 'a1':
                return a1Mid;
            case 'a2':
                return a2Mid;
            case 'a3':
                return a3Mid;
            case 'a4':
                return a4Mid;
            case 'a5':
                return a5Mid;
            case 'a6':
                return a6Mid;
            case 'a7':
                return a7Mid;
            case 'a8':
                return a8Mid;
            case 'a9':
                return a9Mid;
            case 'a10':
                return a10Mid;
            case 'a11':
                return a11Mid;
            case 'a12':
                return a12Mid;
            case 'a13':
                return a13Mid;
            case 'a14':
                return a14Mid;
            case 'aw1':
                return aw1Mid;
            case 'aw2':
                return aw2Mid;
            case 'aw3':
                return aw3Mid;
            case 'aw4':
                return aw4Mid;
            default:
                return midShape;
        }
    }
    else {
        return midShape;
    }
}