import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { fabric } from "fabric";
import { VscPrimitiveSquare, VscCircleFilled, VscTriangleUp, VscEdit, VscTrash, VscLock, VscUnlock } from "react-icons/vsc";
import { AiOutlineRedo, AiOutlineUndo } from "react-icons/ai";
import { endpoint } from './common'
import { useDispatch, useSelector } from 'react-redux'
import "fabric-history";

fabric.Object.prototype.noScaleCache = false;

const options = {
    currentMode: "",
    currentColor: "#ff0000",
    currentFont: 'Arial',
    currentFontSize: 25,
    backgroundColor: "#ffff00",
    // currentWidth: 5,
    group: {},
    stroke: '#ffffff',
    strokeWidth: 3,
};
export var gradient = new fabric.Gradient({
    type: 'linear',
    // gradientUnits: 'pixels', // or 'percentage'
    gradientUnits: 'percentage', // or 'percentage'
    coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
    colorStops: [
        { offset: 0, color: 'red' },
        { offset: 0.2, color: 'orange' },
        { offset: 0.4, color: 'yellow' },
        { offset: 0.6, color: 'green' },
        { offset: 0.8, color: 'blue' },
        { offset: 1, color: 'purple' }
    ]
});
export const createText = (canvas) => {
    canvas.isDrawingMode = false;
    const text = new fabric.Textbox("Vimlesh Kumar From Doordarshan", {
        left: 60,
        top: 0,
        width: 300,
        fill: options.currentColor,
        backgroundColor: options.backgroundColor,
        fontFamily: options.currentFont,
        fontWeight: 'bold',
        fontSize: options.currentFontSize,
        editable: true,
        objectCaching: false,
        textAlign: 'left'

    });
    canvas.add(text).setActiveObject(text);;
    canvas.renderAll();
    text.animate('top', 350, { onChange: canvas.renderAll.bind(canvas) })
};

// const loadPattern = url => {
//     fabric.util.loadImage(url, (img) => {
//         shape.set('fill', new fabric.Pattern({
//             source: img,
//         }));
//         window.editor.canvas.renderAll();
//     });
// }
// var shape = new fabric.Rect({
//     width: 200,
//     height: 100,
//     left: 10,
//     top: 300,
// });
// setTimeout(() => {
//     fabric.Image.fromURL('http://localhost:8080/media/ndi.jpg', function (myImg) {
//         //i create an extra var for to change some image properties
//         var img1 = myImg.set({ left: 0, top: 0 });
//         window.editor.canvas.add(img1);
//         window.editor.canvas.renderAll();

//     });

// }, 8000);
export const addImage = canvas => {
    fabric.Image.fromURL(window.imageName, myImg => {
        // fabric.Image.fromURL('/png/test00161.png', function (myImg) {
        var img1 = myImg.set({ left: 0, top: 0 });
        window.editor.canvas.add(img1);
        window.editor.canvas.renderAll();

    });
}

export const setGradientColor = canvas => {
    if (window.editor.canvas.getActiveObject()) { canvas.getActiveObject().fill = gradient };
}

export const createRect = (canvas) => {
    const rect = new fabric.Rect({
        top: -100,
        left: 100,
        width: 200,
        height: 70,
        // fill: options.currentColor,
        fill: new fabric.Pattern({
            source: 'img/pine-wood-500x500.jpg',
        }),
        hasRotatingPoint: true,
        objectCaching: false,
        stroke: options.stroke,
        strokeWidth: 3,
        strokeUniform: true,
    });
    canvas.add(rect).setActiveObject(rect);
    canvas.requestRenderAll();
    rect.animate('top', 270, { onChange: canvas.renderAll.bind(canvas) })
};

export const createCircle = (canvas) => {
    const circle = new fabric.Circle({
        top: 160,
        left: -100,
        radius: 50,
        fill: options.currentColor,
        cornerSize: 7,
        objectCaching: false,
        hasRotatingPoint: true,
        stroke: options.stroke,
        strokeWidth: 3,
        strokeUniform: true,
    });

    canvas.add(circle).setActiveObject(circle);;
    canvas.requestRenderAll();
    circle.animate('left', 150, { onChange: canvas.renderAll.bind(canvas) })

};

export const createTriangle = (canvas) => {
    canvas.isDrawingMode = false;
    const triangle = new fabric.Triangle({
        top: 50,
        left: -100,
        width: 100,
        height: 100,
        fill: options.currentColor,
        cornerSize: 7,
        objectCaching: false,
        hasRotatingPoint: true,
        stroke: options.stroke,
        strokeWidth: 3,
        strokeUniform: true,
    });

    canvas.add(triangle).setActiveObject(triangle);;
    canvas.requestRenderAll();
    triangle.animate('left', 150, { onChange: canvas.renderAll.bind(canvas) })

};
export const alignLeft = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().textAlign = 'left' };
export const alignRight = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().textAlign = 'right' };
export const alignCenter = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().textAlign = 'center' };

export const textUnderline = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().underline = true };
export const textLineThrough = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().linethrough = true };
export const textItalic = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().fontStyle = 'italic' };
export const txtBold = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().fontWeight = 'bold' };
export const textNormal = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().fontWeight = 'normal' };

export const removeBg = canvas => { if (window.editor.canvas.getActiveObject()) canvas.getActiveObject().set('backgroundColor', '') };

// export const deleteItem = canvas => canvas.remove(canvas.getActiveObject())

export const deleteItem = canvas => {
    const aa = canvas.getActiveObjects()
    aa.forEach(element => { canvas.remove(element) });
}
export const bringToFront = canvas => canvas.bringToFront(canvas.getActiveObject())
export const sendToBack = canvas => canvas.sendToBack(canvas.getActiveObject())
export const undo = canvas => canvas.undo()
export const redo = canvas => canvas.redo()



export const lock = canvas => {
    const aa = canvas.getActiveObjects()
    aa.forEach(element => element.selectable = false);
}


export const unlockAll = canvas => {
    const aa = canvas.getObjects()
    aa.forEach(element => element.selectable = true);
}

export const toggleMode = (mode, canvas) => {
    canvas.freeDrawingBrush.color = options.stroke;
    canvas.freeDrawingBrush.width = options.strokeWidth;

    canvas.isDrawingMode = !(canvas.isDrawingMode);
};

const changeCurrentColor = (e) => {
    options.currentColor = e.target.value;
    window.editor.canvas.freeDrawingBrush.color = e.target.value;

    if (window.editor.canvas.getActiveObject()) { window.editor.canvas.getActiveObject().fill = e.target.value; }
    window.editor.canvas.requestRenderAll();
};

const changeBackGroundColor = (e) => {
    options.backgroundColor = e.target.value;
    if (window.editor.canvas.getActiveObject()) { window.editor.canvas.getActiveObject().backgroundColor = e.target.value; }
    window.editor.canvas.requestRenderAll();
}

const changeStrokeCurrentColor = e => {
    options.stroke = e.target.value;
    if (window.editor.canvas.getActiveObject()) { window.editor.canvas.getActiveObject().stroke = e.target.value; }
    window.editor.canvas.requestRenderAll();
}

const onstrokeSizeChange = e => {
    if (window.editor.canvas.getActiveObject()) {
        window.editor.canvas.getActiveObject().strokeWidth = e.target.value;
    }
    options.strokeWidth = e.target.value
    window.editor.canvas.freeDrawingBrush.width = parseInt(e.target.value);

    window.editor.canvas.requestRenderAll();
}

const onFontChange = (e) => {
    options.currentFont = e.target.value;
    if (window.editor.canvas.getActiveObject()) {
        window.editor.canvas.getActiveObject().fontFamily = e.target.value;
    }
    window.editor.canvas.requestRenderAll();
}

const onSizeChange = (e) => {
    if (window.editor.canvas.getActiveObject()) { window.editor.canvas.getActiveObject().fontSize = e.target.value; }
    options.currentFontSize = e.target.value
    window.editor.canvas.requestRenderAll();
}

// export const groupObjects = (canvas, shouldGroup) => {
//     if (shouldGroup) {
//         const objects = canvas.getObjects();
//         options.group.value = new fabric.Group(objects);
//         canvas.clear()
//         canvas.add(options.group.value);
//     } else {
//         if (options.group.value) {
//             options.group.value.destroy();
//             const oldGroup = options.group.value.getObjects();
//             canvas.remove(options.group.value);
//             canvas.add(...oldGroup);
//             options.group.value = null;
//             canvas.requestRenderAll();
//         }
//     }
// };

export const groupObjects = (canvas, shouldGroup) => {
    if (shouldGroup) {
        const objects = canvas.getObjects();
        options.group.value = new fabric.Group(objects);
        canvas.clear()
        canvas.add(options.group.value);
    } else {
        if (options.group.value) {
            options.group.value.destroy();
            const oldGroup = options.group.value.getObjects();
            canvas.remove(options.group.value);
            canvas.add(...oldGroup);
            options.group.value = null;
            canvas.requestRenderAll();
        }
    }
};


export const savetoCasparcgStore = () => {
    var dd = window.editor.canvas.toJSON()
    // dd.objects.forEach(element => {
    //     element.left = (element.left) * (1920 / 1024);
    //     element.top = (element.top) * (1080 / 576);
    //     element.width = (element.width) * (1920 / 1024);
    //     element.height = (element.height) * (1080 / 576);
    //     element.fontSize = (element.fontSize) * (1080 / 576);

    //     console.log(element);
    // });

    // const data = (JSON.stringify(window.editor.canvas.toJSON())).replaceAll('"', String.fromCharCode(2)).replaceAll(' ', String.fromCharCode(3)).replaceAll('/', String.fromCharCode(4)).replaceAll('%', String.fromCharCode(5))
    const data = (JSON.stringify(dd)).replaceAll('"', String.fromCharCode(2)).replaceAll(' ', String.fromCharCode(3)).replaceAll('/', String.fromCharCode(4)).replaceAll('%', String.fromCharCode(5))

    endpoint(`call 1-109 store.dispatch({type:'CHANGE_CANVAS1',payload:'${data}'})`)
    setTimeout(() => {
        endpoint(`call 1-109 ReadToCasparcgfromStore()`)
    }, 200);
}
var _clipboard;
export function copy() {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    window.editor.canvas.getActiveObject().clone(cloned => {
        _clipboard = cloned;
    });
}

export function paste() {
    // clone again, so you can do multiple copies.
    _clipboard.clone(clonedObj => {
        window.editor.canvas.discardActiveObject();
        clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
        });
        if (clonedObj.type === 'activeSelection') {
            // active selection needs a reference to the canvas.
            clonedObj.canvas = window.editor.canvas;
            clonedObj.forEachObject(obj => {
                window.editor.canvas.add(obj);
            });
            // this should solve the unselectability
            clonedObj.setCoords();
        } else {
            window.editor.canvas.add(clonedObj);
        }
        _clipboard.top += 10;
        _clipboard.left += 10;
        window.editor.canvas.setActiveObject(clonedObj);
        window.editor.canvas.requestRenderAll();
    });
}

const DrawingController = () => {
    const [fontList, setFontList] = useState([])
    const [canvaslist, setCanvaslist] = useState([])
    const [currentPage, setCurentPage] = useState()

    const drawingFileSave = () => {
        const element = document.createElement("a");
        var aa = ''
        canvaslist.forEach(val => {
            aa += val + '\r\n'
        });
        const file = new Blob([aa], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        var ss = new Date().toLocaleTimeString('en-US', { year: "numeric", month: "numeric", day: "numeric", hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
        var retVal = prompt("Enter  file name to save : ", ss + "_FileName");
        if (retVal !== null) {
            element.download = retVal;
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
        }


    }
    const drawingFileNew = () => setCanvaslist([])

    let fileReader;
    const handleFileRead = (e) => {
        const content = fileReader.result;
        var aa = content.split('\r\n')
        aa.splice(-1)
        setCanvaslist([...aa])

    };
    const handleFileChosen = (file) => {
        if (file) {
            fileReader = new FileReader();
            fileReader.onloadend = handleFileRead;
            fileReader.readAsText(file);
        }

    };

    const dispatch = useDispatch()
    // eslint-disable-next-line
    const canvasToJson = (canvas) => {
        dispatch({ type: 'CHANGE_CANVAS1', payload: (JSON.stringify(canvas.toJSON())) })
    };

    const state1 = useSelector(state => state.canvas1Reducer.aa)
    // eslint-disable-next-line
    const canvasFromJson = (canvas) => {
        var state2 = state1.replace(new RegExp('asdfgh', "g"), ' ')
        const data = JSON.parse(state2);
        canvas.loadFromJSON(data);
        canvas.requestRenderAll();
    };
    const recallPage = (json, canvas, i) => {
        canvas.loadFromJSON(json);
        canvas.requestRenderAll();
        setCurentPage(i)
    }
    const updatePage = (canvas) => {
        const updatedCanvasList = canvaslist.map((val, i) => {
            return (i === currentPage) ? canvas.toJSON() : val;
        });
        setCanvaslist([...updatedCanvasList])
    }
    const deletePage = e => {
        if (currentPage > e.target.getAttribute('key1')) {
            setCurentPage(currentPage => currentPage - 1)
        }
        else if (currentPage === parseInt(e.target.getAttribute('key1'))) {
            setCurentPage(null)
            // alert('pp')
        }
        const updatedCanvasList = canvaslist.filter((_, i) => {
            return (parseInt(e.target.getAttribute('key1')) !== i)
        });
        setCanvaslist([...updatedCanvasList])
    }

    const clearCanvas = canvas => {
        canvas.getObjects().forEach(item => {
            if (item !== canvas.backgroundImage) {
                canvas.remove(item);
            }
        });
    };

    useEffect(() => {

        axios.post('http://localhost:8080/getfonts').then((aa) => {
            setFontList(aa.data)
        }).catch((aa) => { console.log('Error', aa) });
        return () => {
        }
    }, [])

    return (<>
        <div>
            <button onClick={() => savetoCasparcgStore()}>Show To Casparcg</button>
            <div>
                <button onClick={() => createText(window.editor.canvas)}>T</button>
                <button onClick={() => createRect(window.editor.canvas)}> <VscPrimitiveSquare />   </button>
                <button onClick={() => createCircle(window.editor?.canvas)}>  <VscCircleFilled /> </button>
                <button onClick={() => createTriangle(window.editor.canvas)}><VscTriangleUp />  </button>
                <button onClick={() => toggleMode("drawing", window.editor.canvas)}> Toggle <VscEdit />   </button>
            </div>
            <div>
                Face <input type="color" defaultValue='#ff0000' onChange={e => changeCurrentColor(e)} />
                BG <input type="color" defaultValue='#ffff00' onChange={e => changeBackGroundColor(e)} />
                stroke<input type="color" defaultValue='#ffffff' onChange={e => changeStrokeCurrentColor(e)} />
                Stroke/Brush width<input style={{ width: '30px' }} onChange={e => onstrokeSizeChange(e)} type="number" id='strokeSizeOSD' min='0' max='100' step='1' defaultValue='3' />
            </div>


            <div>
                <button onClick={() => clearCanvas(window.editor.canvas)}><VscTrash /> all</button>
                <button onClick={() => deleteItem(window.editor.canvas)}><VscTrash /></button>
            </div>


            <button onClick={() => bringToFront(window.editor.canvas)}>Bring To Front</button>
            <button onClick={() => sendToBack(window.editor.canvas)}>Send To Back</button>
            <button onClick={() => lock(window.editor.canvas)}><VscLock /></button>
            <button onClick={() => unlockAll(window.editor.canvas)}><VscUnlock /> All</button>
            <button onClick={() => groupObjects(window.editor.canvas, true)}>group all objects</button>
            <button onClick={() => groupObjects(window.editor.canvas, false)}>ungroup</button>
            <button onClick={() => undo(window.editor.canvas)}><AiOutlineUndo /></button>
            <button onClick={() => redo(window.editor.canvas)}><AiOutlineRedo /></button>

            <div>
                Font:  <select onChange={e => onFontChange(e)}>
                    <option value="Arial" selected>Arial</option>
                    {fontList.map((val) => { return <option key={val} option value={val}>{val}</option> })}
                </select>
                Size<input style={{ width: '35px' }} onChange={e => onSizeChange(e)} type="number" id='fontSizeOSD' min='0' max='100' step='2' defaultValue='25' />
            </div>
            <div>

                <div>

                </div>
                <div style={{ height: 200, overflow: 'scroll', border: '2px solid black' }}>
                    <button onClick={() => drawingFileNew(window.editor.canvas)}>File New</button>
                    <button onClick={() => drawingFileSave(window.editor.canvas)}>File Save</button>

                    <input
                        type='file'
                        id='file'
                        className='input-file'
                        accept='.txt'
                        onChange={e => handleFileChosen(e.target.files[0])}
                    />
                    <button onClick={() => setCanvaslist([...canvaslist, `${JSON.stringify((window.editor?.canvas.toJSON()))}`])}>Save in New Page</button>
                    <button onClick={() => updatePage(window.editor.canvas)}>Update Page</button>
                    <table border='1'>
                        <tbody>
                            {canvaslist.map((val, i) => {
                                return (<>
                                    <tr key={i}><td style={{ backgroundColor: currentPage === i ? 'green' : 'white', color: currentPage === i ? 'white' : 'black' }} onClick={(e) => {
                                        recallPage(val, window.editor.canvas, i);
                                    }}>Page {i}</td><td><button key1={i} onClick={(e) => deletePage(e)}>  <VscTrash style={{ pointerEvents: 'none' }} /></button ></td></tr>
                                </>)
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>


    </>)
}

export default DrawingController
