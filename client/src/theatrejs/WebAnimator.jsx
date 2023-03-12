import React, { useEffect, useState } from 'react'

import studio from '@theatre/studio'
import { getProject, types, val, onChange } from '@theatre/core'
import { useSelector, useDispatch } from 'react-redux'
import { fabric } from "fabric";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { createRect, createTextBox, createCircle, addImage, createTriangle, alignLeft, alignRight, alignCenter, textUnderline, textLineThrough, textItalic, txtBold, textNormal } from '../DrawingController'
import { VscPrimitiveSquare, VscCircleFilled, VscTriangleUp } from "react-icons/vsc";

import { endpoint, templateLayers, shadowOptions, executeScript, hexToRGB, rgbaObjectToHex, screenSizes } from '../common'

import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

import SavePannelTheatre from './SavePannelTheatre';
import RecordRTC from 'recordrtc';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { v4 as uuidv4 } from 'uuid';


import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Papa from "papaparse";


studio.initialize();
studio.ui.hide();


var project = getProject('Fabricjs Object Animation');
var sheet;

var mouseDown = 0;
document.body.onmousedown = function () {
    mouseDown = 1;
}
document.body.onmouseup = function () {
    mouseDown = 0;
}

const getObjectbyId = id => {
    return arrObject.find(object => object.address.objectKey === id)
}

const changePropOfObject = (id, str1, str2) => {
    const objs = arrObject.filter(object => {
        return (object.address.objectKey === id)
    });
    if (objs[0]) {
        const obj = objs[0];
        studio.transaction(({ set }) => {
            set(obj.props[str1], str2);
        });
    }
};

const DrawingforTheatrejs = () => {
    const { editor, onReady } = useFabricJSEditor();
    const dispatch = useDispatch();

    window.dispatch = dispatch;
    window.editor = editor;

    useEffect(() => {
        setTimeout(() => {
            window.editor.canvas.preserveObjectStacking = true;
            window.editor.canvas.on('selection:cleared', function (e) {
                if (e.deselected) {
                    e.deselected.forEach((element) => {
                        changePropOfObject(element.id, 'left', element.left);
                        changePropOfObject(element.id, 'top', element.top);
                        changePropOfObject(element.id, 'scaleX', element.scaleX);
                        changePropOfObject(element.id, 'scaleY', element.scaleY);
                        changePropOfObject(element.id, 'angle', element.angle);
                    })
                }
            });
        }, 3000);
        return () => {
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        dispatch({ type: 'CHANGE_CANVAS', payload: editor?.canvas });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor])

    return (<div >
        <FabricJSCanvas className={'DrawingforTheatrejs'} onReady={onReady} />
    </div>);
};

const arrObject = [];

const WebAnimator = () => {
    const [recording, setRecording] = useState(false);
    const [transcoding, setTranscoding] = useState(false);
    const [fps, setFps] = useState(25);
    const canvas = useSelector(state => state.canvasReducer.canvas);
    const currentscreenSize = useSelector(state => state.currentscreenSizeReducer.currentscreenSize);

    const [duration, setDuration] = useState(10);
    const [loopcount, setLoopcount] = useState(1);
    const [fabric1, setFabric1] = useState('');
    const [coreAndStudio1, setCoreAndStudio1] = useState('');
    const [projectId, setProjectId] = useState('Fabricjs Object Animation')
    const [htmlfileHandle, sethtmlfileHandle] = useState();
    const [idofElement, setIdofElement] = useState('ccg_1');

    const [visibility, setVisibility] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const [jsfilename, setJsfilename] = useState('main');
    const [showSavePannel, setShowSavePannel] = useState(true);

    const clientId = useSelector(state => state.clientIdReducer.clientId);
    window.clientId = clientId;

    sheet = project.sheet('Sheet 1');

    window.studio = studio;
    window.projectId = projectId;
    window.sheet = sheet;

    const dispatch = useDispatch();

    useEffect(() => {
        if (canvas) {
            fabric.util.addListener(document.body, 'keydown', function (options) {
                if (options.key === 'Delete') {
                    deleteItem();
                }
            })
        }
        return () => {
            fabric.util.removeListener(document.body, 'keydown', function (options) {
                if (options.key === 'Delete') {
                    deleteItem();
                }
            })
        }
        // eslint-disable-next-line 
    }, [canvas])


    useEffect(() => {
        if (localStorage.getItem('RCC_currentscreenSize')) { dispatch({ type: 'CHANGE_CURRENTSCREENSIZE', payload: parseInt(localStorage.getItem('RCC_currentscreenSize')) }) }
        document.title = "RCC Web Animator"
        studio.ui.restore();
        return () => {
            // second  
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        studio.onSelectionChange((newSelection) => {
            if ((newSelection.length > 0) && canvas && (newSelection[0].type === 'Theatre_SheetObject_PublicAPI')) {
                const aa = canvas.getObjects().filter((item) => {
                    return newSelection[0]?.address?.objectKey === item.id;
                })
                canvas.setActiveObject(aa[0]);
                canvas.requestRenderAll()
            }
        })
        return () => {
            // second
        }
    }, [canvas])


    useEffect(() => {
        setTimeout(() => {
            var fetchfabricjs;
            if (window.location.origin !== 'https://vimlesh1975.github.io') {
                fetchfabricjs = `${process.env.PUBLIC_URL}/js/fabric.min.js`;
            }
            else {
                fetchfabricjs = `/ReactCasparClient/js/fabric.min.js`;
            }
            fetch(fetchfabricjs)
                .then((r) => r.text())
                .then(text => {
                    setFabric1(text);
                })
        }, 2000);

        setTimeout(() => {
            var fetchcoreAndStudio1;
            if (window.location.origin !== 'https://vimlesh1975.github.io') {
                fetchcoreAndStudio1 = `${process.env.PUBLIC_URL}/js/core-and-studio.js`;
            }
            else {
                fetchcoreAndStudio1 = `/ReactCasparClient/js/core-and-studio.js`;
            }
            fetch(fetchcoreAndStudio1)
                .then((r) => r.text())
                .then(text => {
                    setCoreAndStudio1(text);
                })
        }, 3000);

        return () => {
            // cleanup
        }
        // eslint-disable-next-line
    }, [])

    const ContextMenu = ({ x, y, visibility }) => {
        const canvas = useSelector(state => state.canvasReducer.canvas);

        const sendToBack = canvas => {
            canvas.getActiveObjects().forEach(element => {
                canvas.sendToBack(element);
            });
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }

        const bringToFront = canvas => {
            canvas.getActiveObjects().forEach(element => {
                canvas.bringToFront(element);
            });
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }

        const allOutofScreen = () => {
            canvas.getObjects().forEach((element, i) => {
                // if (i < canvas.getObjects().length / 2) {
                if (i % 2 === 0) {
                    studio.transaction((api) => {
                        api.set(getObjectbyId(element.id).props.left, -1500);
                    })
                }
                else {
                    studio.transaction((api) => {
                        api.set(getObjectbyId(element.id).props.left, 2500);
                    })
                }
            })
        }
        const allInScreen = () => {
            canvas.getObjects().forEach((element, i) => {
                studio.transaction((api) => {
                    api.unset(getObjectbyId(element.id).props);
                })
                studio.transaction((api) => {
                    api.set(getObjectbyId(element.id).props.left, getObjectbyId(element.id).value.left);
                })
            })
        }



        return (
            <div className='rightClickMenu'
                style={{ position: 'fixed', left: (x > 1595) ? 1595 : x, top: (y > 685) ? 685 : y, color: 'white', display: visibility ? "block" : "none", textAlign: 'left' }}
            >
                <ul>
                    <li>Add<ul >
                        <li onClick={() => addItem(addImage)}>Image</li>
                        <li onClick={() => addItem(createRect)}>Rectangle <VscPrimitiveSquare /></li>
                        <li onClick={() => addItem(createTextBox)}>Text T</li>
                        <li onClick={() => addItem(createCircle)}>Circle <VscCircleFilled /></li>
                        <li onClick={() => addItem(createTriangle)}>Triangle <VscTriangleUp /></li>
                    </ul></li>
                    <li onClick={() => {
                        studio.transaction((api) => {
                            const aa = canvas.getActiveObjects();
                            if (aa.length === 1) {
                                api.unset(getObjectbyId(aa[0].id).props);
                            }
                        })
                    }}>Reset All to Default</li>

                    <li onClick={deleteItem}>Delete</li>
                    <li>Text Align<ul >
                        <li onClick={() => alignLeft(canvas)}>Left</li>
                        <li onClick={() => alignRight(canvas)}>Right</li>
                        <li onClick={() => alignCenter(canvas)}>Center</li>
                    </ul></li>
                    <li>Text Decoration<ul >
                        <li onClick={() => textUnderline(canvas)}>Underline Toggle</li>
                        <li onClick={() => textLineThrough(canvas)}>LineThrough Toggle</li>
                        <li onClick={() => textItalic(canvas)}>Itallic Toggle</li>
                        <li onClick={() => txtBold(canvas)}>Bold</li>
                        <li onClick={() => textNormal(canvas)}>Normal</li>
                    </ul></li>
                    <li onClick={() => bringToFront(canvas)}>Bring To Front</li>
                    <li onClick={() => sendToBack(canvas)}>Send To Back</li>
                    <li onClick={record}>Record</li>
                    <li onClick={() => {
                        setShowSavePannel(val => !val);
                    }}>{showSavePannel ? 'Hide Save Pannel' : 'Show Save Panel'}</li>
                    <li onClick={allOutofScreen}>All Out of Screen</li>
                    <li onClick={allInScreen}>All on Screen</li>

                </ul>
            </div>
        );
    }

    const data1 = `name,age,email
Milind Soman,30,john@example.com
Ramaswami Aiyanger,25,jane@example.com
Vimlesh Kumar,48,Vimlersh1975@gmail.com
Vilash Bhandare,56,vlbhandare@gmail.com
Viresh Kumar,50,Kviresh10@gmail.com`;

    // var initialTop = 100;

    const CsvData = () => {
        const canvas = useSelector(state => state.canvasReducer.canvas);

        const [headers, setHeaders] = useState(Object.keys(Papa.parse(data1, { header: true }).data[0]))
        const [datas, setDatas] = useState(Papa.parse(data1, { header: true }).data)

        const handleChange = e => {
            if (e.target.files[0]) {
                console.log(e.target.files[0])
                Papa.parse(e.target.files[0], {
                    header: true,
                    complete: responses => {
                        console.log(responses);
                        console.log(Object.keys(responses.data[0]));
                        setDatas(responses.data);
                        setHeaders(Object.keys(responses.data[0]))
                    }
                });
            }

        }

        const updateData = (index) => {
            headers.forEach((header, i) => {
                const myelement = canvas.getObjects().find(element => element.id === header)
                myelement.set({ text: datas[index][headers[i]] })
            })
            canvas.requestRenderAll();
            playtoCasparcg(templateLayers.theatrejs, 1, 4);
        }
        const changeToImage = (i, j) => {
            // const updatedData = [...datas]
            // // console.log(updatedData[i][headers[j]])
            // // console.log(i, j)
            // updatedData[i][headers[j]] = "vimlesh"
            // setDatas(updatedData)
        }

        return (<div>
            <input type="file" onChange={handleChange} />
            <table border='1'>
                <tbody>
                    <tr>
                        {headers.map((row, i) => {
                            return (<th key={i}   >{row}</th>)
                        })}
                        <th>Play</th>
                    </tr>

                    {datas.map((row, i) => {
                        return (<tr key={i}  >{headers.map((header, ii) => {
                            return (<td onClick={() => changeToImage(i, ii)} key={ii}>
                                {row[header]}
                            </td>
                            )
                        })}<td><button onClick={() => updateData(i)}>Play</button></td></tr>)
                    })}
                </tbody>
            </table>
            {/* myelement.set({ text: '${datas[3][headers[0]]}'}) */}
            {/* [${headers}].forEach((header, i) => {
                    const myelement = canvas_${templateLayers.theatrejs}.getObjects().find(element => element.id === header);
                    console.log(myelement);
                }) */}
            <button onClick={() => {
                headers.forEach((header) => {
                    setTimeout(() => {
                        addItem(createTextBox, header);
                    }, 100);
                })

            }}>Create Temlplate</button>

            <button onClick={() => {
                // headers.forEach((header, i) => {
                //     const myelement = canvas.getObjects().find(element => element.id === header)
                //     myelement.set({ text: datas[0][headers[i]] })
                // })
                // canvas.requestRenderAll();
                // playtoCasparcg(templateLayers.theatrejs, 1, 4);
                const script1 = "const headers=" + JSON.stringify(headers).replaceAll('"', "'") + "; " +
                    "let i=0;" +
                    "setInterval(() => {" +
                    "sheet_" + templateLayers.theatrejs + ".sequence.position=0;" +
                    "sheet_" + templateLayers.theatrejs + ".sequence.play();" +
                    "headers.forEach(function(header) { " +
                    "const myelement = canvas_" + templateLayers.theatrejs + ".getObjects().find(element => element.id === header); " +
                    "myelement.set({text:" + JSON.stringify(datas).replaceAll('"', "'") + "[i][header]});" +
                    "canvas_" + templateLayers.theatrejs + ".requestRenderAll();" +
                    "});" +
                    " if (i < " + (datas.length - 1) + ") { i += 1; } else { i = 0; }" +
                    " }, 2000);"

                executeScript(`${script1}`);
                endpoint(`call 1-${templateLayers.theatrejs} ${script1}`);


            }}>Play11</button>

        </div>)
    }



    const deleteAllObjects = () => {
        canvas.getObjects().forEach(element => {
            if (getObjectbyId(element.id) !== undefined) {
                sheet.detachObject(element.id);
            }
        })
    }

    const rgbaArrayToObject = (fill) => {
        console.log(fill)
        const color = new fabric.Color(fill);
        const rgbaArray = color.getSource();
        // Normalize the RGBA values to a range between 0 and 1
        const normalizedValues = rgbaArray.map((value) => value / 255);

        // Create an object with properties for red, green, blue, and alpha
        const rgbaObject = {
            r: normalizedValues[0],
            g: normalizedValues[1],
            b: normalizedValues[2],
            a: normalizedValues[3] * 255,
        };

        return rgbaObject;
    }

    const initialiseCore = (jsonContent, importing = false) => {
        canvas.loadFromJSON(jsonContent, () => {
            canvas.getObjects().forEach((element, i) => {
                console.log(element);
                // console.log(element.id);
                // console.log(element.fill);
                // console.log(element.stroke);
                // console.log(element.shadow?.color);

                // console.log((new fabric.Color(element.fill)).getSource());
                // console.log((new fabric.Color(element.stroke)).getSource());
                // console.log((new fabric.Color(element.shadow.color)).getSource());

                if ((element.fill === null)) {
                    element.set({ fill: '#555252' })
                }

                if (element.stroke === null) {
                    element.set({ stroke: '#000000' })
                }

                var obj1 = {};
                var isColorObjectfill;
                var isColorObjectStroke;

                if (importing) {
                    isColorObjectfill = (element.fill.type !== 'linear');
                    isColorObjectStroke = (element.stroke.type !== 'linear');

                    if (element.fill.type === 'pattern') {
                        // do nothing
                    }

                    else if (isColorObjectfill) {
                        obj1 = {
                            ...obj1,
                            // fill: ((element.fill).toString().startsWith("#")) ? types.rgba(hexToRGB(element.fill)) : types.rgba(element.fill),
                            fill: (typeof element.fill === 'object' && element.fill !== null && 'r' in element.fill && 'g' in element.fill && 'b' in element.fill && 'a' in element.fill) ? types.rgba(element.fill) : types.rgba(rgbaArrayToObject(element.fill)),
                        };
                    }
                    else {
                        const colorStops = element.fill.colorStops.map((colorStop) => {
                            return {
                                offset: types.number(parseFloat(colorStop.offset), { range: [0, 1] }),
                                // color: types.rgba(hexToRGB(colorStop.color)),
                                color: ((colorStop.color).toString().startsWith("rgb")) ? types.rgba(rgbaArrayToObject(colorStop.color)) : types.rgba(hexToRGB(colorStop.color)),
                                opacity: types.number(colorStop.opacity ? parseFloat(colorStop.opacity) : 1, { range: [0, 1] })
                            };
                        });
                        obj1 = {
                            ...obj1,
                            ...colorStops,
                            coords: {
                                x1: types.number(element.fill.coords.x1, { range: [0, 1] }),
                                y1: types.number(element.fill.coords.y1, { range: [0, 1] }),
                                x2: types.number(element.fill.coords.x2, { range: [0, 1] }),
                                y2: types.number(element.fill.coords.y2, { range: [0, 1] })
                            }
                        };
                    }

                    if (isColorObjectStroke) {
                        obj1 = {
                            ...obj1,
                            // stroke: ((element.stroke).toString().startsWith("#")) ? types.rgba(hexToRGB(element.stroke)) : types.rgba(element.stroke),
                            stroke: (typeof element.stroke === 'object' && element.stroke !== null && 'r' in element.stroke && 'g' in element.stroke && 'b' in element.stroke && 'a' in element.stroke) ? types.rgba(element.stroke) : types.rgba(rgbaArrayToObject(element.stroke)),
                        };
                    }
                    obj1 = {
                        ...obj1,
                        // shadow: { ...element.shadow, color: ((element.shadow.color).toString().startsWith("#")) ? types.rgba(hexToRGB(element.shadow.color)) : types.rgba(element.shadow.color) },
                        shadow: { ...element.shadow, color: (typeof element.shadow.color === 'object' && element.shadow.color !== null && 'r' in element.shadow.color && 'g' in element.shadow.color && 'b' in element.shadow.color && 'a' in element.shadow.color) ? types.rgba(element.shadow.color) : types.rgba(rgbaArrayToObject(element.shadow.color)) },
                    };

                }
                else {
                    if (!element.shadow?.color.toString().startsWith("#")) {
                        element.set({ shadow: { ...element.shadow, color: '#000000' } })
                    }
                    isColorObjectfill = (typeof (element.fill) !== 'object');
                    isColorObjectStroke = (typeof (element.stroke) !== 'object');
                    if (isColorObjectfill) {
                        obj1 = {
                            ...obj1,
                            fill: types.rgba(hexToRGB(element.fill ? element.fill : '#ff0000')),
                        };
                    }
                    else if (element.fill.type === 'pattern') {
                    }
                    else {
                        const colorStops = element.fill.colorStops.map((colorStop) => {
                            return {
                                offset: types.number(parseFloat(colorStop.offset), { range: [0, 1] }),
                                color: ((colorStop.color).toString().startsWith("rgb")) ? types.rgba(rgbaArrayToObject(colorStop.color)) : types.rgba(hexToRGB(colorStop.color)),
                                opacity: types.number(parseFloat((colorStop.opacity === undefined) ? 1 : colorStop.opacity), { range: [0, 1] })
                            };
                        });
                        obj1 = {
                            ...obj1,
                            ...colorStops,
                            coords: {
                                x1: types.number(element.fill.coords.x1, { range: [0, 1] }),
                                y1: types.number(element.fill.coords.y1, { range: [0, 1] }),
                                x2: types.number(element.fill.coords.x2, { range: [0, 1] }),
                                y2: types.number(element.fill.coords.y2, { range: [0, 1] })
                            }
                        };
                    }

                    if (isColorObjectStroke) {
                        obj1 = {
                            ...obj1,
                            stroke: types.rgba(hexToRGB(element.stroke ? element.stroke : '#000000')),
                        };
                    }
                    obj1 = {
                        ...obj1,
                        shadow: { ...shadowOptions, color: types.rgba(hexToRGB(element.shadow.color)), blur: types.number(parseInt(element.shadow.blur), { range: [0, 100] }) },
                    };

                }

                arrObject[i] = sheet.object(element.id, {
                    left: element.left,
                    top: element.top,
                    scaleX: types.number(element.scaleX, { nudgeMultiplier: 0.01 }),
                    scaleY: types.number(element.scaleY, { nudgeMultiplier: 0.01 }),
                    opacity: types.number(element.opacity, { range: [0, 1] }),
                    angle: element.angle,
                    rx: types.number(element.rx ? parseInt(element.rx) : 10, { range: [-360, 360] }),
                    ry: types.number(element.ry ? parseInt(element.rx) : 10, { range: [-360, 360] }),
                    strokeWidth: types.number(element.strokeWidth, { range: [0, 100] }),
                    fontSize: types.number(element.fontSize ? parseInt(element.fontSize) : 30, { range: [0, 100] }),
                    strkdsar: types.number(element.strokeDashArray ? parseInt(element.strokeDashArray) : 0, { range: [0, 1000] }),
                    strkDsOfst: types.number(element.strokeDashOffset ? parseInt(element.strokeDashOffset) : 0, { range: [-1000, 1000] }),
                    ...obj1,

                    skewX: types.number(element.skewX, { range: [-88, 88] }),
                    skewY: types.number(element.skewY, { range: [-60, 60] }),
                });

                arrObject[i].onValuesChange((val) => {
                    var obj2 = {};
                    if (element.fill.type === 'pattern') {
                        // do nothing
                    }

                    else if (isColorObjectfill) {
                        obj2 = {
                            ...obj2,
                            fill: val.fill,
                        };
                    }

                    else {
                        obj2 = {
                            ...obj2,
                            fill: new fabric.Gradient({
                                type: element.fill.type,
                                gradientUnits: element.fill.gradientUnits,
                                coords: {
                                    x1: val.coords.x1,
                                    y1: val.coords.y1,
                                    x2: val.coords.x2,
                                    y2: val.coords.y2
                                },
                                colorStops: Array.from({
                                    length: element.fill.colorStops.length
                                }).map((_, i) => {
                                    return {
                                        offset: val[i].offset,
                                        color: rgbaObjectToHex(val[i].color),
                                        opacity: val[i].opacity
                                    };
                                }),
                                id: element.fill.id
                            })
                        };
                    }
                    if (isColorObjectStroke) {
                        obj2 = {
                            ...obj2,
                            stroke: val.stroke,
                        };
                    }
                    element.set({
                        left: val.left,
                        top: val.top,
                        scaleX: val.scaleX,
                        scaleY: val.scaleY,
                        opacity: val.opacity,
                        angle: val.angle,
                        rx: val.rx,
                        ry: val.ry,
                        strokeWidth: val.strokeWidth,
                        fontSize: val.fontSize,
                        strokeDashArray: [val.strkdsar, val.strkdsar],
                        strokeDashOffset: val.strkDsOfst,
                        shadow: val.shadow,
                        ...obj2,
                        skewX: val.skewX,
                        skewY: val.skewY,
                    });
                    element.setCoords();
                    canvas.requestRenderAll();
                });
                const onMouseMove = (obj, event) => {
                    if (mouseDown === 1) {
                        studio.transaction(({ set }) => {
                            set(obj.props.left, event.target.left);
                            set(obj.props.top, event.target.top);
                            set(obj.props.angle, event.target.angle);
                        });
                    }
                };
                const onScaling = (obj, event) => {
                    studio.transaction(({ set }) => {
                        set(obj.props.scaleX, event.transform.target.scaleX);
                        set(obj.props.scaleY, event.transform.target.scaleY);
                    });
                };

                element.on('mousedown', () => studio.setSelection([arrObject[i]]), false);
                element.on('mousemove', (e) => onMouseMove(arrObject[i], e), false);
                element.on('scaling', (e) => onScaling(arrObject[i], e), false);
            })
        })
    }
    const reset = () => {
        localStorage.removeItem('theatre-0.4.persistent');
        window.location.reload();
    }

    const pause = layerNumber => {
        endpoint(`call 1-${layerNumber} sheet.sequence.pause()`);
        executeScript(`sheet_${layerNumber}.sequence.pause()`);
    }
    const resume = layerNumber => {
        endpoint(`call 1-${layerNumber} sheet.sequence.play({ iterationCount: ${(parseInt(loopcount) === 0) ? Infinity : parseInt(loopcount)}, range: [0, ${duration}] });
        `)
        executeScript(`sheet_${layerNumber}.sequence.play({ iterationCount: ${(parseInt(loopcount) === 0) ? Infinity : parseInt(loopcount)}, range: [0, ${duration}] })`);
    }
    const playtoCasparcg = (layerNumber, loopcount, duration) => {
        const content = JSON.stringify(canvas.toJSON(['id', 'class', 'selectable']));

        const contentforHtml = content.replaceAll('"', '\\"').replaceAll('\\n', '\\\\n');
        const contentforcasparcg = content.replaceAll('"', '\\"').replaceAll('\\n', ' \\\n');

        const state1 = (JSON.stringify(studio.createContentOfSaveFile(projectId)));

        const scriptforHTML = `
       
        localStorage.removeItem('theatre-0.4.persistent');
        window.canvas_${layerNumber}?.getObjects().forEach(element => {
            sheet_${layerNumber}?.detachObject(element.id);
        });
        var mouseDown = 0;
        document.body.onmousedown = function () {
            mouseDown = 1;
        };
        document.body.onmouseup = function () {
            mouseDown = 0;
        };
        
        document.getElementById('divid_${layerNumber}')?.remove();
        var aa = document.createElement('div');
        aa.style.position='absolute';
        aa.setAttribute('id','divid_' + '${layerNumber}');
        document.body.style.overflow='hidden';
        document.body.style.zoom=(${currentscreenSize * 100}/1920)+'%';
        aa.innerHTML += \`<canvas id='canvas_${layerNumber}' width='1920' height='1080'></canvas>;\`;
        document.body.appendChild(aa);
        var canvas_${layerNumber} = new fabric.Canvas('canvas_${layerNumber}');
       
        window.canvas_${layerNumber}=canvas_${layerNumber};
        canvas_${layerNumber}.preserveObjectStacking = true;
        var content =\`${contentforHtml}\`;
        const shadowOptions = {
            color: '#000000',
            blur: 30,
            offsetX: 0,
            offsetY: 0,
            affectStroke: false
        };
       
        const rgbaObjectToHex = (rgba) => {
            let r = Math.round(rgba.r * 255).toString(16).padStart(2, '0');
            let g = Math.round(rgba.g * 255).toString(16).padStart(2, '0');
            let b = Math.round(rgba.b * 255).toString(16).padStart(2, '0');
            let hex = '#' + r + g + b;
            return hex;
        };
        const arrObject = [];
        window.changePropOfObject = (id, str1, str2) => {
            const objs = arrObject.filter(object => {
                return (object.address.objectKey === id)
            });
            if (objs[0]) {
                const obj = objs[0];
                window.studio.transaction(({ set }) => {
                    set(obj.props[str1], str2);
                });
            }
        };
        canvas_${layerNumber}.loadFromJSON(content,()=>{
            const { core } = __TheatreJS_StudioBundle._studio;
            const { _studio } = __TheatreJS_StudioBundle;
            window.studio=_studio;
           
            window.project = core.getProject('${'project' + fabric.Object.__uid++}', {state:${(state1.replaceAll('"', "'")).replaceAll("\\'", '\\"')}});
            window.sheet_${layerNumber} = project.sheet('Sheet 1');
            project.ready.then(() => {
                sheet_${layerNumber}.sequence.play({ iterationCount: ${(parseInt(loopcount) === 0) ? Infinity : parseInt(loopcount)}, range: [0, ${duration}] });
            });
           
            canvas_${layerNumber}.getObjects().forEach((element,i) => {
              var obj1 = {};
              const isnotGradientfill = (element.fill.type!=='linear');
              if (element.fill.type === 'pattern') {
                }
              else if (isnotGradientfill) {
                  obj1 = {
                      ...obj1,
                      fill: core.types.rgba(element.fill),
                  };
              }
              else {
                const colorStops = element.fill.colorStops.map((colorStop) => {
                    return {
                        offset: core.types.number(colorStop.offset, { range: [0, 1] }),
                        color: core.types.rgba(hexToRGB(colorStop.color)),
                        opacity: core.types.number(colorStop.opacity, { range: [0, 1] })
                    };
                });
                obj1 = {
                    ...obj1,
                    ...colorStops,
                    coords: {
                        x1: core.types.number(element.fill.coords.x1, { range: [0, 1] }),
                        y1: core.types.number(element.fill.coords.y1, { range: [0, 1] }),
                        x2: core.types.number(element.fill.coords.x2, { range: [0, 1] }),
                        y2: core.types.number(element.fill.coords.y2, { range: [0, 1] })
                    }
                };
            }
              const isnotGradientstroke= (element.stroke.type!=='linear');
              if (isnotGradientstroke) {
                  obj1 = {
                      ...obj1,
                      stroke: core.types.rgba(element.stroke),
                  };
              }
              arrObject[i] = sheet_${layerNumber}.object(element.id, {
                    left: element.left,
                    top: element.top,
                    opacity: core.types.number(element.opacity, { nudgeMultiplier: 0.1 }),
                    scaleX: core.types.number(element.scaleX, { nudgeMultiplier: 0.01 }),
                    scaleY: core.types.number(element.scaleY, { nudgeMultiplier: 0.01 }),
                    angle: element.angle,
                    rx: core.types.number(element.rx? element.rx : 10, { range: [0, 100] }),
                    ry: core.types.number(element.ry? element.rx : 10, { range: [0, 100] }),
                    strokeWidth: core.types.number(element.strokeWidth, { range: [0, 100] }),
                    fontSize: core.types.number(element.fontSize? parseInt(element.fontSize) : 30, { range: [0, 100] }),
                    strkdsar: core.types.number(element.strokeDashArray? parseInt(element.strokeDashArray) : 0, { range: [0, 1000] }),
                    strkDsOfst: core.types.number(element.strokeDashOffset? parseInt(element.strokeDashOffset) : 0, { range: [-1000, 1000] }),
                    shadow: { ...shadowOptions, color:(core.types.rgba(element.shadow.color)) , blur: core.types.number(parseInt(element.shadow.blur), { range: [0, 100] }) },
                    ...obj1,
                    skewX: core.types.number(element.skewX, { range: [-60, 60] }),
                    skewY: core.types.number(element.skewY, { range: [-60, 60] }),

                });
                arrObject[i].onValuesChange((val) => {
                    var obj2 = {};
                    if (element.fill.type === 'pattern') {
                    }
                    else if (isnotGradientfill) {
                        obj2 = {
                            ...obj2,
                            fill: val.fill,
                        };
                    }
                    else {
                        obj2 = {
                            ...obj2,
                            fill: new fabric.Gradient({
                                type: element.fill.type,
                                gradientUnits: element.fill.gradientUnits,
                                coords: {
                                    x1: val.coords.x1,
                                    y1: val.coords.y1,
                                    x2: val.coords.x2,
                                    y2: val.coords.y2
                                },
                                colorStops: Array.from({
                                    length: element.fill.colorStops.length
                                }).map((_, i) => {
                                    return {
                                        offset: val[i].offset,
                                        color: rgbaObjectToHex(val[i].color),
                                        opacity: val[i].opacity
                                    };
                                }),
                                id: element.fill.id
                            })
                        };
                    }
                    if (isnotGradientstroke) {
                        obj2 = {
                            ...obj2,
                            stroke: val.stroke,
                        };
                    }
                        element.set({
                            left: val.left,
                            top: val.top,
                          
                            opacity: val.opacity,
                            scaleX: val.scaleX,
                            scaleY: val.scaleY,
                            angle: val.angle,
                            rx: val.rx,
                            ry: val.ry,
                            strokeWidth: val.strokeWidth,
                            fontSize: val.fontSize,
                            strokeDashArray: [val.strkdsar, val.strkdsar],
                            strokeDashOffset: val.strkDsOfst,
                            shadow: val.shadow,
                           ...obj2,
                            skewX: val.skewX,
                            skewY: val.skewY,
                        });
                        element.setCoords();
                        canvas_${layerNumber}.requestRenderAll();
                });
                        const onMouseMove = (obj, event) => {
                            if (mouseDown === 1) {
                                studio.transaction(({ set }) => {
                                    set(obj.props.left, event.target.left);
                                    set(obj.props.top, event.target.top);
                                    set(obj.props.angle, event.target.angle);
                                });
                            }
                        };
                        const onScaling = (obj, event) => {
                            studio.transaction(({ set }) => {
                                set(obj.props.scaleX, event.transform.target.scaleX);
                                set(obj.props.scaleY, event.transform.target.scaleY);
                            });
                        };
                      
                        const onMousedown = (obj, event) => {
                        };
                        element.on('mousedown', (e) => onMousedown(arrObject[i], e), false);
                        element.on('mousemove', (e) => onMouseMove(arrObject[i], e), false);
                        element.on('scaling', (e) => onScaling(arrObject[i], e), false);
            });
        });
        `

        executeScript(scriptforHTML);
        endpoint(`play 1-${layerNumber} [html] "http://localhost:10000/ReactCasparClient/Theatrejs2"`);
        // endpoint(`call 1-${layerNumber} "${scriptforCasparcg}"`)
        endpoint(`call 1-${layerNumber} "
        localStorage.removeItem('theatre-0.4.persistent');
       
        var mouseDown = 0;
        document.body.onmousedown = function () {
            mouseDown = 1;
        };
        document.body.onmouseup = function () {
            mouseDown = 0;
        };
        if(document.getElementById('divid_${layerNumber}')){
            document.getElementById('divid_${layerNumber}').remove();
        }
        var aa = document.createElement('div');
        aa.style.position='absolute';
        aa.setAttribute('id','divid_' + '${layerNumber}');
        document.body.style.overflow='hidden';
        document.body.style.zoom=(${currentscreenSize * 100}/1920)+'%';
        aa.innerHTML += \`<canvas id='canvas' width='1920' height='1080'></canvas>;\`;
        document.body.appendChild(aa);
        var canvas = new fabric.Canvas('canvas');

        window.canvas=canvas;
        window.canvas\\?.getObjects().forEach(element => {
            sheet\\?.detachObject(element.id);
        });
        canvas.preserveObjectStacking = true;
        var content =\`${contentforcasparcg}\`;
        const shadowOptions = {
            color: '#000000',
            blur: 30,
            offsetX: 0,
            offsetY: 0,
            affectStroke: false
        };
        const rgbaObjectToHex = (rgba) => {
            let r = Math.round(rgba.r * 255).toString(16).padStart(2, '0');
            let g = Math.round(rgba.g * 255).toString(16).padStart(2, '0');
            let b = Math.round(rgba.b * 255).toString(16).padStart(2, '0');
            let hex = '#' + r + g + b;
            return hex;
        };
        const arrObject = [];
        window.changePropOfObject = (id, str1, str2) => {
            const objs = arrObject.filter(object => {
                return (object.address.objectKey === id)
            });
            if (objs[0]) {
                const obj = objs[0];
                window.studio.transaction(({ set }) => {
                    set(obj.props[str1], str2);
                });
            }
        };
        canvas.loadFromJSON(content,()=>{
            const { core } = __TheatreJS_StudioBundle._studio;
            const { _studio } = __TheatreJS_StudioBundle;
            window.studio=_studio;

            window.project = core.getProject('${'project' + fabric.Object.__uid++}', {state:${(state1.replaceAll('"', "'")).replaceAll("\\'", '\\"')}});
            window.sheet = project.sheet('Sheet 1');
            project.ready.then(() => {
                sheet.sequence.play({ iterationCount: ${(parseInt(loopcount) === 0) ? Infinity : parseInt(loopcount)}, range: [0, ${duration}] });
            });
            canvas.getObjects().forEach((element,i) => {
                var obj1 = {};
                const isnotGradientfill = (element.fill.type!=='linear');
                if (element.fill.type === 'pattern') {
                }
                else if (isnotGradientfill) {
                    obj1 = {
                        ...obj1,
                        fill: core.types.rgba(element.fill),
                    };
                }
                else {
                    const colorStops = element.fill.colorStops.map((colorStop) => {
                        return {
                            offset: core.types.number(colorStop.offset, { range: [0, 1] }),
                            color: core.types.rgba(hexToRGB(colorStop.color)),
                            opacity: core.types.number(colorStop.opacity, { range: [0, 1] })
                        };
                    });
                    obj1 = {
                        ...obj1,
                        ...colorStops,
                        coords: {
                            x1: core.types.number(element.fill.coords.x1, { range: [0, 1] }),
                            y1: core.types.number(element.fill.coords.y1, { range: [0, 1] }),
                            x2: core.types.number(element.fill.coords.x2, { range: [0, 1] }),
                            y2: core.types.number(element.fill.coords.y2, { range: [0, 1] })
                        }
                    };
                }
                const isnotGradientstroke= (element.stroke.type!=='linear');
                if (isnotGradientstroke) {
                    obj1 = {
                        ...obj1,
                        stroke: core.types.rgba(element.stroke),
                    };
                }

                arrObject[i] = sheet.object(element.id, {
                    left: element.left,
                    top: element.top,
                    opacity: core.types.number(element.opacity, { nudgeMultiplier: 0.1 }),
                    scaleX: core.types.number(element.scaleX, { nudgeMultiplier: 0.01 }),
                    scaleY: core.types.number(element.scaleY, { nudgeMultiplier: 0.01 }),
                    angle: element.angle,
                    rx: core.types.number(element.rx? element.rx : 10, { range: [0, 100] }),
                    ry: core.types.number(element.ry? element.rx : 10, { range: [0, 100] }),
                    strokeWidth: core.types.number(element.strokeWidth, { range: [0, 100] }),
                    fontSize: core.types.number(element.fontSize? parseInt(element.fontSize) : 30, { range: [0, 100] }),
                    strkdsar: core.types.number(element.strokeDashArray? parseInt(element.strokeDashArray) : 0, { range: [0, 1000] }),
                    strkDsOfst: core.types.number(element.strokeDashOffset? parseInt(element.strokeDashOffset) : 0, { range: [-1000, 1000] }),
                    shadow: { ...shadowOptions, color:(core.types.rgba(element.shadow.color)) , blur: core.types.number(parseInt(element.shadow.blur), { range: [0, 100] }) },
                    ...obj1,
                    skewX: core.types.number(element.skewX, { range: [-60, 60] }),
                    skewY: core.types.number(element.skewY, { range: [-60, 60] }),

                });
                arrObject[i].onValuesChange((val) => {
                    var obj2 = {};
                    if (element.fill.type === 'pattern') {
                    }
                    
                    else if (isnotGradientfill) {
                        obj2 = {
                            ...obj2,
                            fill: val.fill,
                        };
                    }
                    else {
                        obj2 = {
                            ...obj2,
                            fill: new fabric.Gradient({
                                type: element.fill.type,
                                gradientUnits: element.fill.gradientUnits,
                                coords: {
                                    x1: val.coords.x1,
                                    y1: val.coords.y1,
                                    x2: val.coords.x2,
                                    y2: val.coords.y2
                                },
                                colorStops: Array.from({
                                    length: element.fill.colorStops.length
                                }).map((_, i) => {
                                    return {
                                        offset: val[i].offset,
                                        color: rgbaObjectToHex(val[i].color),
                                        opacity: val[i].opacity
                                    };
                                }),
                                id: element.fill.id
                            })
                        };
                    }
                    if (isnotGradientstroke) {
                        obj2 = {
                            ...obj2,
                            stroke: val.stroke,
                        };
                    }
                        element.set({
                            left: val.left,
                            top: val.top,
                          
                            opacity: val.opacity,
                            scaleX: val.scaleX,
                            scaleY: val.scaleY,
                            angle: val.angle,
                            rx: val.rx,
                            ry: val.ry,
                            strokeWidth: val.strokeWidth,
                            fontSize: val.fontSize,
                            strokeDashArray: [val.strkdsar, val.strkdsar],
                            strokeDashOffset: val.strkDsOfst,
                            shadow: val.shadow,
                           ...obj2,
                            skewX: val.skewX,
                            skewY: val.skewY,
                        });
                        element.setCoords();
                        canvas.requestRenderAll();
                });
                        const onMouseMove = (obj, event) => {
                            if (mouseDown === 1) {
                                studio.transaction(({ set }) => {
                                    set(obj.props.left, event.target.left);
                                    set(obj.props.top, event.target.top);
                                    set(obj.props.angle, event.target.angle);
                                });
                            }
                        };
                        const onScaling = (obj, event) => {
                            studio.transaction(({ set }) => {
                                set(obj.props.scaleX, event.transform.target.scaleX);
                                set(obj.props.scaleY, event.transform.target.scaleY);
                            });
                        };
                      
                        const onMousedown = (obj, event) => {
                        };
                        element.on('mousedown', (e) => onMousedown(arrObject[i], e), false);
                        element.on('mousemove', (e) => onMouseMove(arrObject[i], e), false);
                        element.on('scaling', (e) => onScaling(arrObject[i], e), false);
            });
        });
        "`)
    }

    const stopGraphics1 = (layerNumber) => {
        endpoint(`stop 1-${layerNumber}`);
        executeScript(`document.getElementById('divid_${layerNumber}')?.remove();`);
    }

    const exportHtml = async (overRide = false) => {
        const xx4 = `
        
        window.changePropOfObject = (id, str1, str2) => {
            const objs = arrObject.filter(object => {
                return (object.address.objectKey === id)
            });
            if (objs[0]) {
                const obj = objs[0];
                window.studio.transaction(({ set }) => {
                    set(obj.props[str1], str2);
                });
            }
        };
        window.getPropOfObject = (id, str1) => {
            const objs = arrObject.filter(object => {
                return (object.address.objectKey === id)
            });
            if (objs[0]) {
                const obj = objs[0];
                return obj.value[str1];
            }
            else{
                return null;
            }
        };

        canvas.getObjects().forEach((element,i) => {
            if(window.caspar || window.casparcg || window.tickAnimations)  {
                if ((element.id).startsWith("ccg")){
                    element.set({visible: false});
                }
            }
            var obj1 = {};
            const isnotGradientfill = (element.fill.type!=='linear');
            if (element.fill.type === 'pattern') {
                
            }
            else if (isnotGradientfill) {
                obj1 = {
                    ...obj1,
                    fill: core.types.rgba(element.fill),
                };
            }
            else {
                const colorStops = element.fill.colorStops.map((colorStop) => {
                    return {
                        offset: core.types.number(colorStop.offset, { range: [0, 1] }),
                        color: core.types.rgba(hexToRGB(colorStop.color)),
                        opacity: core.types.number(colorStop.opacity, { range: [0, 1] })
                    };
                });
                obj1 = {
                    ...obj1,
                    ...colorStops,
                    coords: {
                        x1: core.types.number(element.fill.coords.x1, { range: [0, 1] }),
                        y1: core.types.number(element.fill.coords.y1, { range: [0, 1] }),
                        x2: core.types.number(element.fill.coords.x2, { range: [0, 1] }),
                        y2: core.types.number(element.fill.coords.y2, { range: [0, 1] })
                    }
                };
            }
            const isnotGradientstroke= (element.stroke.type!=='linear');
            if (isnotGradientstroke) {
                obj1 = {
                    ...obj1,
                    stroke: core.types.rgba(element.stroke),
                };
            }
            arrObject[i] = sheet.object(element.id, {
                left: element.left,
                left: element.left,
                top: element.top,
                opacity: core.types.number(element.opacity, { nudgeMultiplier: 0.1 }),
                scaleX: core.types.number(element.scaleX, { nudgeMultiplier: 0.01 }),
                scaleY: core.types.number(element.scaleY, { nudgeMultiplier: 0.01 }),
                angle: element.angle,
               
                rx: core.types.number(element.rx ? element.rx : 10, { range: [0, 100] }),
                ry: core.types.number(element.ry ? element.rx : 10, { range: [0, 100] }),
                strokeWidth: core.types.number(element.strokeWidth, { range: [0, 100] }),
               
                fontSize: core.types.number(element.fontSize ? parseInt(element.fontSize) : 30, { range: [0, 100] }),
                strkdsar: core.types.number(element.strokeDashArray ? parseInt(element.strokeDashArray) : 0, { range: [0, 1000] }),
                strkDsOfst: core.types.number(element.strokeDashOffset ? parseInt(element.strokeDashOffset) : 0, { range: [-1000, 1000] }),
                shadow: { ...shadowOptions, color: core.types.rgba(element.shadow.color), blur: core.types.number(parseInt(element.shadow.blur), { range: [0, 100] }) },
                ...obj1,
                skewX: core.types.number(element.skewX, { range: [-60, 60] }),
                skewY: core.types.number(element.skewY, { range: [-60, 60] }),
            });`

        const xx5 = ` arrObject[i].onValuesChange((val) => {
            var obj2 = {};
            if (element.fill.type === 'pattern') {
            }
            else if (isnotGradientfill) {
                obj2 = {
                    ...obj2,
                    fill: val.fill,
                };
            }
            else {
                obj2 = {
                    ...obj2,
                    fill: new fabric.Gradient({
                        type: element.fill.type,
                        gradientUnits: element.fill.gradientUnits,
                        coords: {
                            x1: val.coords.x1,
                            y1: val.coords.y1,
                            x2: val.coords.x2,
                            y2: val.coords.y2
                        },
                        colorStops: Array.from({
                            length: element.fill.colorStops.length
                        }).map((_, i) => {
                            return {
                                offset: val[i].offset,
                                color: rgbaObjectToHex(val[i].color),
                                opacity: val[i].opacity
                            };
                        }),
                        id: element.fill.id
                    })
                };
            }
            if (isnotGradientstroke) {
                obj2 = {
                    ...obj2,
                    stroke: val.stroke,
                };
            }
                        element.set({
                            left: val.left,
                            top: val.top,
                            opacity: val.opacity,
                            scaleX: val.scaleX,
                            scaleY: val.scaleY,
                            angle: val.angle,
                            rx: val.rx,
                            ry: val.ry,
                            strokeWidth: val.strokeWidth,
                            fontSize: val.fontSize,
                            strokeDashArray: [val.strkdsar, val.strkdsar],
                            strokeDashOffset: val.strkDsOfst,
                            shadow: val.shadow,
                           ...obj2,
                            skewX: val.skewX,
                            skewY: val.skewY,
                });
                element.setCoords();
                canvas.requestRenderAll();
            });
            const onMouseMove = (obj, event) => {
                if (mouseDown === 1) {
                    studio.transaction(({ set }) => {
                        set(obj.props.left, event.target.left);
                        set(obj.props.top, event.target.top);
                        set(obj.props.angle, event.target.angle);
                    });
                }
            };
            const onScaling = (obj, event) => {
                studio.transaction(({ set }) => {
                    set(obj.props.scaleX, event.transform.target.scaleX);
                    set(obj.props.scaleY, event.transform.target.scaleY);
                });
            };
           
            element.on('mousedown', () => studio.setSelection([arrObject[i]]), false);
            element.on('mousemove', (e) => onMouseMove(arrObject[i], e), false);
            element.on('scaling', (e) => onScaling(arrObject[i], e), false);
            `

        const aa =
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <script>${fabric1}<//script>
                <script>${coreAndStudio1}<//script>
        </head>

        <body style='overflow:hidden'>

    <div><canvas id='canvas' width='1920' height='1080'></canvas></div>
    <script>
    var originalCanvas=[];
    const arrObject = [];
    var sheet;
    </script>
    <script type="module">
        localStorage.removeItem('theatre-0.4.persistent');
        var mouseDown = 0;
        document.body.onmousedown = function () {
            mouseDown = 1;
        };
        document.body.onmouseup = function () {
            mouseDown = 0;
        };
    const hexToRGB = hex => {
        const red = parseInt(hex.slice(1, 3), 16)
        const green = parseInt(hex.slice(3, 5), 16)
        const blue = parseInt(hex.slice(5, 7), 16)
        return {r:red/255, g:green/255, b:blue/255, a:1} // return an object
        // return [ r, g, b ]
    }
    const rgbaObjectToHex = (rgba) => {
        let r = Math.round(rgba.r * 255).toString(16).padStart(2, "0");
        let g = Math.round(rgba.g * 255).toString(16).padStart(2, "0");
        let b = Math.round(rgba.b * 255).toString(16).padStart(2, "0");
        let hex = "#" + r + g + b;
        return hex;
    }
         const shadowOptions = {
            color: '#000000',
            blur: 30,
            offsetX: 0,
            offsetY: 0,
            affectStroke: false
        };
        var canvas = new fabric.Canvas('canvas');
        document.body.style.zoom=(${currentscreenSize * 100}/1920)+'%';
        window.canvas=canvas;
        canvas.preserveObjectStacking = true;
        const content =${JSON.stringify(canvas.toJSON(['id', 'class', 'selectable']))};
        const { core, studio } = Theatre;
        studio.initialize();
        studio.ui.hide();
        window.studio=studio;
        const project = core.getProject('${projectId}', {state:${JSON.stringify(studio.createContentOfSaveFile(projectId))}});
        sheet = project.sheet('Sheet 1')
        canvas.loadFromJSON(content, ()=> {
            canvas.forEachObject((obj)=>{
                originalCanvas.push(fabric.util.object.clone(obj,true));
            });
            ${xx4}
            ${xx5}
        })
        });
        project.ready.then(() => {
            sheet.sequence.play({ iterationCount: ${(parseInt(loopcount) === 0) ? Infinity : parseInt(loopcount)}, range: [0, ${duration}] });
        })
         <//script>
         <script>
         var dataCaspar = {};
         function escapeHtml(unsafe) {
             return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
         }
         function parseCaspar(str) {
             var xmlDoc;
             if (window.DOMParser) {
                 parser = new DOMParser();
                 xmlDoc = parser.parseFromString(str, "text/xml");
             }
             dataCaspar = XML2JSON(xmlDoc.documentElement.childNodes);
         }
         function XML2JSON(node) {
             var data = {}; // resulting object
             for (k = 0; k < node.length; k++) {
                 var idCaspar = node[k].getAttribute("id");
                 var valCaspar = node[k].childNodes[0].getAttribute("value");
                 if (idCaspar != undefined && valCaspar != undefined) {
                     data[idCaspar] = valCaspar;
                 };
             }
             return data;
         }
         function dataInsert(dataCaspar) {
             for (var idCaspar in dataCaspar) {
                 const aa = canvas.getObjects().filter((item) => {
                     return item.id === idCaspar;
                 })
                 const element = aa[0];
                 if (element.type === 'image') {
                    fabric.Image.fromURL( escapeHtml(dataCaspar[idCaspar]), img => {
                        img.set({ scaleX: element.width / img.width, scaleY: (element.height / img.height) })
                        img.cloneAsImage(img1 => {
                            element.setSrc(img1.getSrc(), () => {
                                element.set({ visible: true });
                                canvas.requestRenderAll();
                            })
                        })
                    })
                }
                 else {
                    
                    const bb = originalCanvas.filter((item) => {
                        return item.id === idCaspar;
                      })
        
                    const originalWidth = bb[0].width;
                    const originalscaleX = bb[0].scaleX;
                    element.set({ objectCaching: false, text: (dataCaspar[idCaspar]), visible: true, width:originalWidth });
                    changePropOfObject(idCaspar, 'scaleX', originalscaleX);

                    if (element.textLines.length > 1) {
                    do {
                        element.set({ width: element.width + 5 });
                    }
                    while (element.textLines.length > 1);
                    changePropOfObject(idCaspar, 'scaleX', originalWidth / element.width);
                    }
                 }
                 canvas.requestRenderAll()
             }
         }
 
         function update(str) {
             parseCaspar(str); // Parse templateData into an XML object
             dataInsert(dataCaspar); // Insert data
         }
 
         function play(str) {
             parseCaspar(str); // Parse templateData into an XML object
             dataInsert(dataCaspar); // Insert data
         }
         function stop() {
             document.body.innerHTML = '';
         }
 
         function updatestring(str1, str2) {
            const aa = canvas.getObjects().filter((item) => {
              return item.id === str1;
            })
            const element = aa[0];
            const bb = originalCanvas.filter((item) => {
                return item.id === str1;
              })
            const originalWidth = bb[0].width;
            const originalscaleX = bb[0].scaleX;
            element.set({ objectCaching: false, text: str2, visible: true, width:originalWidth });
            changePropOfObject(str1, 'scaleX', originalscaleX);
            if (element.textLines.length > 1) {
              do {
                element.set({ width: element.width + 5 });
              }
              while (element.textLines.length > 1);
              changePropOfObject(str1, 'scaleX', originalWidth / element.width);
            }
            canvas.requestRenderAll();
          }
        function updateimage(str1, str2) {
            const aa = canvas.getObjects().filter((item) => {
                return item.id === str1;
            })
            const element = aa[0];
            fabric.Image.fromURL(str2, img => {
                img.set({ scaleX: element.width / img.width, scaleY: (element.height / img.height) })
                img.cloneAsImage(img1 => {
                    element.setSrc(img1.getSrc(), () => {
                        element.set({ visible: true });
                        canvas.requestRenderAll();
                    })
                })
            })
        }
     <//script>
         </body>
         <script src='${jsfilename}.js'></script>
     </html>`

        const bb = aa.replaceAll('<//', '</')
        const file = new Blob([bb], { type: 'text/html' });
        var ss = new Date().toLocaleTimeString('en-US', { year: "numeric", month: "numeric", day: "numeric", hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
        const options = {
            suggestedName: ss,
            excludeAcceptAllOption: true,
            types: [{
                description: 'Html file',
                accept: { 'text/html': ['.html'] },
            }],
        };
        var aa1;
        if (overRide) {
            aa1 = htmlfileHandle;
        }
        else {
            aa1 = await window.showSaveFilePicker(options);
        }
        sethtmlfileHandle(aa1)
        const writable = await aa1.createWritable();
        await writable.write(file);
        await writable.close();
    }

    const importHtml = async (canvasContent1, animationContetent1) => {
        localStorage.removeItem('theatre-0.4.persistent');
        if (canvasContent1) {
            deleteAllObjects();

            const pid = `project${fabric.Object.__uid++}`;
            if (animationContetent1 === undefined) {
                animationContetent1 = "{\"sheetsById\":{},\"definitionVersion\":\"0.4.0\",\"revisionHistory\":[\"gjjL6UEXDCUdpAe_\",\"nMdlSYh15PYUGb14\"]}";
            }
            project = getProject(pid, { state: JSON.parse(animationContetent1) });
            setProjectId(pid)

            sheet = project.sheet('Sheet 1');
            initialiseCore(canvasContent1, true);

            project.ready.then(() => {
                // sheet.sequence.play({ iterationCount: Infinity, range: [0, 2] });
                sheet.sequence.play({ iterationCount: (parseInt(loopcount) === 0) ? Infinity : parseInt(loopcount), range: [0, parseFloat(duration)] })
            });
        }
        else {
            const pickerOpts = {
                multiple: false,
                excludeAcceptAllOption: true,
                types: [
                    {
                        description: 'HTML files',
                        accept: {
                            'text/html': ['.html']
                        }
                    },
                ],
            };
            const [aa] = await window.showOpenFilePicker(pickerOpts);
            if (aa) {
                sethtmlfileHandle(aa);
                deleteAllObjects();
                const file = await aa.getFile();
                const content = await file.text();
                var canvasContent = content.split('const content =')[1].split(']};')[0] + ']}';
                var animationContetent = content.split('{state:')[1].split('});')[0];
                if ((content.split("<script src='").length > 1) && (content.split("<script src='")[1].split('.')).length > 1) {
                    const jsfilename1 = content.split("<script src='")[1].split('.')[0];
                    setJsfilename(jsfilename1);
                }
                const pid = `project${fabric.Object.__uid++}`;
                project = getProject(pid, { state: JSON.parse(animationContetent) });
                setProjectId(pid)

                sheet = project.sheet('Sheet 1');
                project.ready.then(() => {
                    // sheet.sequence.play({ iterationCount: Infinity, range: [0, 2] });
                });

                initialiseCore(canvasContent, true);
            }
        }

    }

    const addItem = async (name, id = idofElement) => {
        const idAlreadyExists = canvas.getObjects().filter((item) => {
            return item.id === id
        })
        if (idAlreadyExists.length > 0) {
            alert("Id Already exists");
            return
        }

        await name(canvas);

        const element = canvas.getActiveObjects()[0];
        element.set({ id: id.toString(), text: id.toString() });

        setIdofElement('id_' + fabric.Object.__uid++);

        const obj1 = {
            left: 500,
            top: 300,
            opacity: types.number(1, { range: [0, 1] }),
            scaleX: types.number(1, { nudgeMultiplier: 0.01 }),
            scaleY: types.number(1, { nudgeMultiplier: 0.01 }),
            angle: 0,
            rx: types.number(10, { range: [0, 100] }),
            ry: types.number(10, { range: [0, 100] }),
            strokeWidth: types.number(0, { range: [0, 100] }),
            fontSize: types.number(45, { range: [0, 100] }),
            strkdsar: types.number(0, { range: [0, 1000] }, { nudgeMultiplier: 0.1 }),
            strkDsOfst: types.number(0, { range: [-1000, 1000] }),
            fill: types.rgba(hexToRGB(element.type === 'rect' ? '#0000ff' : '#ffffff')),
            stroke: types.rgba(hexToRGB('#000000')),
            shadow: { ...shadowOptions, color: types.rgba(hexToRGB('#000000')), blur: types.number(parseInt(30), { range: [0, 100] }) },
            skewX: types.number(0, { range: [-88, 88] }),
            skewY: types.number(0, { range: [-60, 60] }),
        }



        const i = arrObject.length;
        arrObject[i] = sheet.object(element.id, obj1);
        arrObject[i].onValuesChange((val) => {
            element.set({
                left: val.left,
                top: val.top,
                opacity: val.opacity,
                scaleX: val.scaleX,
                scaleY: val.scaleY,
                angle: val.angle,
                rx: val.rx,
                ry: val.ry,
                strokeWidth: val.strokeWidth,
                fontSize: val.fontSize,
                strokeDashArray: [val.strkdsar, val.strkdsar],
                strokeDashOffset: val.strkDsOfst,
                shadow: val.shadow,
                fill: val.fill,
                stroke: val.stroke,
                skewX: val.skewX,
                skewY: val.skewY,
            });
            element.setCoords();
            canvas.requestRenderAll();
        })
        const onMouseMove = (obj, event) => {
            if (mouseDown === 1) {
                studio.transaction(({ set }) => {
                    set(obj.props.left, event.target.left);
                    set(obj.props.top, event.target.top);
                    set(obj.props.angle, event.target.angle);
                });
            }
        };
        const onScaling = (obj, event) => {
            studio.transaction(({ set }) => {
                set(obj.props.scaleX, event.transform.target.scaleX);
                set(obj.props.scaleY, event.transform.target.scaleY);
            });
        };

        element.on('mousedown', () => studio.setSelection([arrObject[i]]), false);
        element.on('mousemove', (e) => onMouseMove(arrObject[i], e), false);
        element.on('scaling', (e) => onScaling(arrObject[i], e), false);
    }
    const deleteItem = () => {
        const aa = canvas.getActiveObjects();
        aa.forEach(element => {
            canvas.remove(element);
            sheet.detachObject(element.id);
        });
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }

    const saveToLocalStorage = canvas => {
        var aa1 = JSON.stringify(canvas.toJSON(['id', 'class', 'selectable']));
        localStorage.setItem("TheatrepageData", aa1);
    }
    // eslint-disable-next-line 
    const goto = () => {
        sheet.sequence.position = 0.5
        studio.transaction(({ set }) => {
            set(arrObject[0].props.scaleX, 0.5)
        })
        sheet.sequence.play();
        console.log(arrObject[0].value.left)
        onChange(arrObject[0].props.left, (left) => {
            console.log(left)
        })
        console.log('current left is', val(arrObject[0].props.left))
        studio.setSelection([arrObject[1], arrObject[0]])
        canvas.forEachObject((element, i) => {
            studio.transaction(({ set }) => {
                set(arrObject[i].props.left, 50.5)
            })
        })

    }
    const handleClick = e => {
        e.preventDefault();
        setVisibility(true);
        setX(e.clientX);
        setY(e.clientY);
    };
    const record = () => {
        // canvas.setBackgroundColor('#00ff00');
        canvas.discardActiveObject();
        canvas.requestRenderAll()
        var config = {
            type: 'video',
            mimeType: 'video/webm;codecs=vp9',
            canvas: {
                alpha: true
            }
        };

        var recorder = new RecordRTC(canvas.getElement().captureStream(), config);
        sheet.sequence.position = 0;
        sheet.sequence.play({ iterationCount: (parseInt(loopcount) === 0) ? Infinity : parseInt(loopcount), range: [0, parseFloat(duration)] })

        const dd = setInterval(() => {
            canvas.requestRenderAll()
        }, 100);
        recorder.setRecordingDuration(parseFloat(duration) * 1000, () => {
            clearInterval(dd);
            // canvas.setBackgroundColor('#00ff0000');
            canvas.requestRenderAll()
            const blob = recorder.getBlob();
            handleProcess(blob)
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "canvas-recording_for_browser.webm";
            a.click();
            // setRecording(false);
        })
        recorder.startRecording();
        setRecording(true);
    }
    const getTranscodedVideoSize = () => {
        if (currentscreenSize === 1024) {
            return '1024x576';
        } else if (currentscreenSize === 1280) {
            return '1280x720';
        }
        else if (currentscreenSize === 1920) {
            return '1920x1080';
        } else if (currentscreenSize === 2048) {
            return '2048x1080';
        } else if (currentscreenSize === 3840) {
            return '3840x2160';
        } else if (currentscreenSize === 4096) {
            return '4096x2160';
        }
        else {
            // Handle other cases here
            return '1920x1080';
        }
    };

    const handleProcess = async (blob1) => {
        setTranscoding(true);
        const ffmpeg = createFFmpeg({
            // log: true,
            log: false,
        });
        await ffmpeg.load();
        await ffmpeg.FS('writeFile', 'input.webm', await fetchFile(blob1));
        // await ffmpeg.run('-i', 'input.webm', '-codec:v', 'libx264', '-r', fps.toString(), 'output.mp4');
        await ffmpeg.run('-codec:v', 'libvpx-vp9', '-i', 'input.webm', '-codec:v', 'qtrle', '-r', fps.toString(), '-s', getTranscodedVideoSize(), 'output.mov');
        // await ffmpeg.run('-i', 'input.webm', '-codec:v', 'prores_ks', '-pix_fmt', 'yuva444p10le', '-r', '25', 'output.mov');
        const processedData = ffmpeg.FS('readFile', 'output.mov');
        const processedBlob1 = new Blob([processedData.buffer], { type: 'video/mov' });
        const url = URL.createObjectURL(processedBlob1);
        const a = document.createElement("a");
        a.href = url;
        a.download = "canvas-recording_qtrle.mov";
        a.click();
        setRecording(false);
    };

    return (<>

        <div style={{ textAlign: 'center' }} onContextMenu={handleClick} onClick={() => setVisibility(false)}>
            <button title='ReactCasparClient Save to localstorage button' onClick={() => {
                deleteAllObjects();
                initialiseCore(localStorage.getItem('RCCpageData'));
            }}>Data from LocalStorage</button>
            <button onClick={() => saveToLocalStorage(canvas)}>Save To LocalStorage</button>

            <span>Id:</span>
            <input style={{ width: 100 }} value={idofElement} onChange={e => setIdofElement(e.target.value)} />
            <button onClick={() => reset()}>Reset</button>


            <span>Caspar Control:</span>

            <button onClick={() => {
                sheet.sequence.position = 0;
                setTimeout(() => {
                    playtoCasparcg(templateLayers.theatrejs, loopcount, duration);
                }, 100);
            }}><FaPlay /></button>
            <button onClick={() => pause(templateLayers.theatrejs)}><FaPause /></button>
            <button title='Resume' onClick={() => resume(templateLayers.theatrejs)}><FaPause /><FaPlay /></button>

            <button onClick={() => stopGraphics1(templateLayers.theatrejs)}><FaStop /></button>
            <span>Duration:</span><input type="number" value={duration} style={{ width: 40 }} onChange={e => setDuration(e.target.value)} />
            <span title="Put 0 for Infinity">Loop:</span><input title="Put 0 for Infinity" type="number" value={loopcount} style={{ width: 30 }} onChange={e => setLoopcount(e.target.value)} />

            Js:<input type='text' style={{ width: 60 }} value={jsfilename} onChange={e => setJsfilename(e.target.value)} />
            Html:
            <button onClick={() => {
                sheet.sequence.position = 0;
                setTimeout(() => {
                    exportHtml();
                }, 1000);
            }}>Export</button>
            {htmlfileHandle && <button onClick={() => {
                sheet.sequence.position = 0;
                setTimeout(() => {
                    exportHtml(true);
                }, 1000);
            }}>Overwrite</button>}
            {htmlfileHandle?.name}
            <button onClick={() => importHtml()}>Import</button>

            {/* <button onClick={() => goto()}>goto</button> */}
            {/* <button onClick={() => changePropOfObject(studio.selection[0]?.address?.objectKey, 'top', 100)}>changePropOfObject</button> */}

            Client Id<input title='For Html Rendrer. Put Unique Id so that other may not interfere' style={{ width: 100 }} type={'text'} value={clientId} onChange={e => {
                dispatch({ type: 'CHANGE_CLIENTID', payload: e.target.value })
            }} />
            <button onClick={() => {
                setShowSavePannel(val => !val);
            }}>{showSavePannel ? 'Hide Save Pannel' : 'Show Save Panel'}</button>
            <button disabled={recording ? true : false} onClick={() => record()}>{recording ? transcoding ? 'Transcoding' : 'Recoreding' : 'Record'} </button>
            FPS:<input type='text' style={{ width: 40 }} value={fps} onChange={e => setFps(e.target.value)} />

            Size: <select value={currentscreenSize} onChange={e => {
                localStorage.setItem('RCC_currentscreenSize', parseInt(e.target.value))
                dispatch({ type: 'CHANGE_CURRENTSCREENSIZE', payload: parseInt(e.target.value) })
            }
            }>  {screenSizes.map((val) => { return <option key={uuidv4()} value={val}>{val}</option> })} </select>

            <div style={{ position: 'absolute', left: 1540, top: 25, zIndex: 101, backgroundColor: 'white', display: !showSavePannel ? 'none' : '' }}>
                <Tabs forceRenderTabPanel={true} >
                    <TabList>
                        <Tab>Data Pannel</Tab>
                        <Tab>Save Pannel</Tab>
                    </TabList>
                    <TabPanel ><CsvData /></TabPanel>

                    <TabPanel > <SavePannelTheatre
                        importHtml={importHtml}
                        deleteAllObjects={deleteAllObjects}
                        stopGraphics1={stopGraphics1}
                        playtoCasparcg={playtoCasparcg}
                    /></TabPanel>
                </Tabs >
            </div>
            <span style={{ position: 'absolute', left: 960, top: 540, fontSize: 40 }}>.</span>
            <DrawingforTheatrejs />
            <ContextMenu x={x} y={y} visibility={visibility} />
        </div>
    </>)
}

export default WebAnimator