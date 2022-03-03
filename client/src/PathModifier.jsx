import React, {  } from 'react'
import { useSelector } from 'react-redux'
import { fabric } from "fabric";
import { v4 as uuidv4 } from 'uuid';
import { shadowOptions, options } from './common'

var currentValue = [];

const PathModifier = () => {
    const canvas = useSelector(state => state.canvasReducer.canvas);

    const startPath = () => {
        window.editor.canvas.off('mouse:down');
        currentValue = [];
        setTimeout(() => {
            window.editor.canvas.on('mouse:down', eventHandlerMouseDown);
        }, 1000);
    }
    const eventHandlerMouseDown = (e) => {
        if (currentValue.length === 0) {
            currentValue.push(['M', e.pointer.x, e.pointer.y])
        }
        else {
            if (currentValue[currentValue.length - 1][0] === 'M') {
                currentValue.push(['Q', (currentValue[currentValue.length - 1][1] + e.pointer.x) / 2, (currentValue[currentValue.length - 1][2] + e.pointer.y) / 2, e.pointer.x, e.pointer.y])
            }
            else {
                currentValue.push(['Q', (currentValue[currentValue.length - 1][3] + e.pointer.x) / 2, (currentValue[currentValue.length - 1][4] + e.pointer.y) / 2, e.pointer.x, e.pointer.y])
            }
        }
    }

    const addCirclestoPath = () => {
        if (canvas.getActiveObjects()[0]?.type === 'path') {
            makecircles(canvas.getActiveObjects()[0], canvas.getActiveObjects()[0].id)
        }
    }

    const removeCirclesfromPath = () => {
        if (canvas.getActiveObjects()[0]?.type === 'path') {
            (canvas.getObjects()).forEach(element => {
                if (element.id === (canvas.getActiveObjects()[0].id + '__')) {
                    canvas.remove(element);
                }
            });
        }
    }

    const closePath = () => {
        if (currentValue.length !== 0) {
            currentValue.push(['z'])
            const id1 = 'id_' + uuidv4();
            const rect = new fabric.Path(currentValue, {
                id: id1,
                shadow: shadowOptions,
                opacity: 1,
                fill: 'red',
                hasRotatingPoint: true,
                objectCaching: false,
                stroke: 'yellow',
                strokeWidth: 2,
                strokeUniform: true,
                strokeLineJoin: 'round',
            });
            canvas.add(rect).setActiveObject(rect);

            rect.on('mousedown', rectMouseDown);
            rect.on('mouseup', rectMouseUp);

            function rectMouseDown() {
                this.origPos = this.getCenterPoint();
                const aa1 = canvas?.getActiveObjects()[0]?.path;
                currentValue = aa1;
            }
            function rectMouseUp() {
                const delta = this.getCenterPoint().subtract(this.origPos);
                (canvas.getObjects()).forEach(element => {
                    if (element.id === (canvas.getActiveObjects()[0].id + '__')) {
                        element.left += delta.x;
                        element.top += delta.y;

                    }
                });
                if ((delta.x !== 0) || (delta.y !== 0)) {
                    const updatedPath = currentValue.map((val, index1) => {
                        return val.map((val1, index2) => {
                            return (0 === index2) ? val1 : ((index2 === 1) || (index2 === 3)) ? val1 + delta.x : val1 + delta.y;
                        })
                    })
                    currentValue = updatedPath;
                    canvas.getActiveObjects()[0].set({ path: updatedPath });
                    canvas?.requestRenderAll();
                }

                console.log(this.getBoundingRect());
            }

            makecircles(rect, id1)
            canvas.requestRenderAll();
        }
        window.editor.canvas.off('mouse:down');

    }
    const makecircles = (rect1, id) => {
        currentValue.forEach((element, i) => {
            if (i < currentValue.length - 1) {
                const circle = new fabric.Circle({
                    id: id + '__',
                    shadow: shadowOptions,
                    left: (element.length < 4) ? element[1] - 4 : element[3] - 4,
                    top: (element.length < 4) ? element[2] - 4 : element[4] - 4,
                    radius: 4,
                    fill: 'yellow',
                    cornerSize: 7,
                    stroke: options.stroke,
                    strokeWidth: 1,
                    strokeUniform: true,
                    hasControls: false
                })

                canvas.add(circle);

                circle.on('moving', (e) => {
                    var updatedPath;
                    if (i === 0) {
                        updatedPath = currentValue.map((val, index1) => {
                            return (i !== index1) ? val : val.map((val1, index2) => {
                                return (index2 === 0) ? val1 : ((index2 === 1) ? e.pointer.x : e.pointer.y)
                            })
                        })
                    }
                    else {
                        updatedPath = currentValue.map((val, index1) => {
                            return (i !== index1) ? val : val.map((val1, index2) => {
                                return (index2 < 3) ? val1 : ((index2 === 3) ? e.pointer.x : e.pointer.y)
                            })
                        })
                    }

                    rect1.set({ path: updatedPath });
                    canvas?.requestRenderAll();
                    currentValue = updatedPath;
                })
            }
        });
        //for anchor points
        currentValue.forEach((element, i) => {
            if ((i < currentValue.length - 1) && (i !== 0)) {
                const circle = new fabric.Circle({
                    id: id + '__',
                    shadow: shadowOptions,
                    left: element[1] - 4,
                    top: element[2] - 4,
                    radius: 4,
                    fill: 'blue',
                    cornerSize: 7,
                    stroke: options.stroke,
                    strokeWidth: 1,
                    strokeUniform: true,
                    hasControls: false
                })

                canvas.add(circle);

                circle.on('moving', (e) => {
                    var updatedPath;

                    updatedPath = currentValue.map((val, index1) => {
                        return (i !== index1) ? val : val.map((val1, index2) => {
                            return ((index2 === 0) || (index2 > 2)) ? val1 : ((index2 === 1) ? e.pointer.x : e.pointer.y)
                        })
                    })

                    rect1.set({ path: updatedPath });
                    canvas?.requestRenderAll();
                    currentValue = updatedPath;
                })
            }
        });
    }

    return (<div>
        <div style={{ paddingBottom: 10 }}>
        
            <div>
                <button onClick={startPath}>Start Drawing Path by clicking on canvas</button>
                <button onClick={closePath}>Finish Drawing path</button>
                </div>
            <div>

                <button onClick={addCirclestoPath}>Add circles to selected path</button>
                <button onClick={removeCirclesfromPath}>Remove circles from selected path</button>
            </div>
        </div>
    
    </div>)
}

export default PathModifier