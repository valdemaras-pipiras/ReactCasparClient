import React, { useState } from 'react'
import { endpoint } from './common'
import { v4 as uuidv4 } from 'uuid';
import { FaPlay, FaStop } from "react-icons/fa";
import { iniplayerList1, iniplayerList2 } from './hockeyData'
import { useSelector, useDispatch } from 'react-redux'
import { fabric } from "fabric";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';



const generalayer = 500;
const scoreLayer = 501;
const clockLayer = 502;

// import moment from 'moment'

const Hockey = () => {
    const [playerList1, setPlayerList1] = useState(iniplayerList1)
    const [playerList2, setPlayerList2] = useState(iniplayerList2)


    const canvasList = useSelector(state => state.canvasListReducer.canvasList);
    const canvas = useSelector(state => state.canvasReducer.canvas);
    const dispatch = useDispatch();
    const currentscreenSize = localStorage.getItem('RCC_currentscreenSize');
    const [currentPlayer1, setCurrentPlayer1] = useState('Vimlesh Kumar 1')
    const [currentPlayer2, setCurrentPlayer2] = useState('Vimlesh Kumar 2')
    const [team1, setTeam1] = useState('Mumbai')
    const [team1Goal, setTeam1Goal] = useState(88)
    const [team1Logo, setTeam1Logo] = useState('http://localhost:8080/media/anchor.png')
    const [team2Logo, setTeam2Logo] = useState('http://localhost:8080/media/hd_frame.png')

    const [team2, setTeam2] = useState('Delhi')
    const [team2Goal, setTeam2Goal] = useState(77)

    const [initialMinute, setInitilaMinute] = useState(45)
    const [initialSecond, setInitialSecond] = useState(0)

    const [countUp, setCountUp] = useState(false)

    const onDragEnd1 = (result) => {
        const aa = [...playerList1]
        if (result.destination != null) {
            aa.splice(result.destination?.index, 0, aa.splice(result.source?.index, 1)[0])
            setPlayerList1(aa);
        }
    }
    const onDragEnd2 = (result) => {
        const aa = [...playerList2]
        if (result.destination != null) {
            aa.splice(result.destination?.index, 0, aa.splice(result.source?.index, 1)[0])
            setPlayerList1(aa);
        }
    }

    const recallPage = (layerNumber, pageName, data) => {
        const index = canvasList.findIndex(val => val.pageName === pageName);
        if (index !== -1) {
            dispatch({ type: 'CHANGE_CURRENT_PAGE', payload: index })
            const data1 = data;
            canvas.loadFromJSON(canvasList[index].pageValue, () => {
                data1.forEach(data2 => {
                    canvas.getObjects().forEach((element) => {
                        try {
                            if (element.id === data2.key) {
                                if (data2.type === 'text') {
                                    element.set({ objectCaching: false, text: data2.value.toString() })
                                    canvas.requestRenderAll();
                                }
                                else if (data2.type === 'image') {
                                    var i = new Image();
                                    i.onload = function () {
                                        const originalWidth = (element.width) * (element.scaleX);
                                        const originalHeight = (element.height) * (element.scaleY);
                                        element.set({ objectCaching: false, scaleX: (originalWidth / i.width), scaleY: (originalHeight / i.height) })
                                        if (element.type === 'image') {
                                            element.setSrc(data2.value)
                                        }
                                        else if (element.type === 'rect') {
                                            element.set({ width: i.width, height: i.height, fill: new fabric.Pattern({ source: data2.value, repeat: 'no-repeat' }) })
                                        }
                                        canvas.requestRenderAll();
                                    };
                                    i.src = data2.value;
                                }
                            }
                            canvas.requestRenderAll();
                        } catch (error) {
                        }
                    });
                });
                sendToCasparcg(layerNumber)
            });
        }
        else { alert(`${pageName} page not found in canvas list. Make a page with this name, add ${data.length}  text and set id of texts as ${data.map(val => { return val.key })} then update the page`) }
    }

    const sendToCasparcg = (layerNumber) => {
        endpoint(`mixer ${window.chNumber}-${layerNumber} fill 0 0 0 1 6 ${window.animationMethod}`)
        setTimeout(() => {
            endpoint(`play ${window.chNumber}-${layerNumber} [HTML] xyz.html`);
        }, 250);
        setTimeout(() => {
            endpoint(`call ${window.chNumber}-${layerNumber} "
        var aa = document.createElement('div');
        aa.style.position='absolute';
        aa.innerHTML='${(canvas.toSVG()).replaceAll('"', '\\"')}';
        document.body.appendChild(aa);
        document.body.style.margin='0';
        document.body.style.padding='0';
        aa.style.zoom=(${currentscreenSize * 100}/1024)+'%';
        document.body.style.overflow='hidden';
        "`)
        }, 300);
        setTimeout(() => {
            endpoint(`mixer ${window.chNumber}-${layerNumber} fill 0 0 1 1 10 ${window.animationMethod}`)
        }, 800);

        setTimeout(() => {
            updateGraphics(layerNumber);
        }, 1100);
    }
    const showClock = (pageName) => {
        const index = canvasList.findIndex(val => val.pageName === pageName);
        if (index !== -1) {
            dispatch({ type: 'CHANGE_CURRENT_PAGE', payload: index })
            canvas.loadFromJSON(canvasList[index].pageValue, () => {
                canvas.requestRenderAll();
            });

            const layerNumber = clockLayer;
            endpoint(`mixer ${window.chNumber}-${layerNumber} fill 0 0 0 1 6 ${window.animationMethod}`)
            setTimeout(() => {
                endpoint(`play ${window.chNumber}-${layerNumber} [HTML] xyz.html`);
            }, 250);
            setTimeout(() => {
                endpoint(`call ${window.chNumber}-${layerNumber} "
                var aa = document.createElement('div');
                aa.style.position='absolute';
                aa.innerHTML='${(canvas.toSVG()).replaceAll('"', '\\"')}';
                document.body.appendChild(aa);
                document.body.style.margin='0';
                document.body.style.padding='0';
                aa.style.zoom=(${currentscreenSize * 100}/1024)+'%';
                document.body.style.overflow='hidden';
                var cc=document.getElementsByTagName('tspan')[0];
                cc.textContent='';
                var startTime = new Date();
                startTime.setMinutes(${initialMinute});
                startTime.setSeconds(${initialSecond});
                setInterval(()=>{
                   startTime.setSeconds(startTime.getSeconds() ${countUp ? '+' : '-'} 1);
                    var ss1 =  ((startTime.getMinutes()).toString()).padStart(2, '0') + ':' + ((startTime.getSeconds()).toString()).padStart(2, '0');
                    cc.textContent  =ss1;
                  }, 1000);
                "`)
            }, 300);

            setTimeout(() => {
                endpoint(`mixer ${window.chNumber}-${layerNumber} fill 0 0 1 1 10 ${window.animationMethod}`)
            }, 800);

            setTimeout(() => {
                // updateGraphics(layerNumber);
            }, 1100);
        }
        else { alert(`${pageName} page not found in canvas list. Make a page with this name, add a text and set id of text as f0 then update the page`) }

    }

    const updateGraphics = layerNumber => {
        endpoint(`call ${window.chNumber}-${layerNumber} "
            aa.innerHTML='${(canvas.toSVG()).replaceAll('"', '\\"')}';
            "`)
    }
    const stopGraphics = layerNumber => {
        endpoint(`mixer ${window.chNumber}-${layerNumber} fill 0 0 0 1 12 ${window.animationMethod}`)
        setTimeout(() => {
            endpoint(`stop ${window.chNumber}-${layerNumber}`)
        }, 1000);
    }


    return (
        <div>
            <div style={{ display: 'flex', width: 830, }}>
                <div>
                    <DragDropContext onDragEnd={onDragEnd1}>
                        <Droppable droppableId="droppable-1" type="PERSON">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={{ backgroundColor: snapshot.isDraggingOver ? 'yellow' : 'yellowgreen' }}
                                    {...provided.droppableProps}
                                >
                                    <table border='1'>
                                        <tbody>
                                            {playerList1.map((val, i) => {

                                                return (

                                                    <Draggable draggableId={"draggable" + i} key={val + i} index={i}>
                                                        {(provided, snapshot) => (
                                                            <tr
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    backgroundColor: snapshot.isDragging ? 'red' : 'white',
                                                                    boxShadow: snapshot.isDragging ? "0 0 .4rem #666" : "none",
                                                                    // margin: '10px'
                                                                }}
                                                            >

                                                                <td {...provided.dragHandleProps} onClick={() => setCurrentPlayer1(val)}
                                                                    onDoubleClick={() => {
                                                                        setCurrentPlayer1(val);
                                                                        recallPage(generalayer, 'PlayerId1', [{ key: 'f0', value: val, type: 'text' }])
                                                                    }}>{val}</td>
                                                            </tr>
                                                        )
                                                        }
                                                    </Draggable>
                                                )
                                            })}
                                            {provided.placeholder}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {currentPlayer1}
                    <br /><button onClick={() => recallPage(generalayer, 'PlayerId1', [{ key: 'f0', value: currentPlayer1, type: 'text' }])}>PlayerId1 <FaPlay /></button>
                    <br />    <button onClick={() => recallPage(500, 'TeamList', [

                        { key: 'f0', value: team1, type: 'text' },
                        { key: 'f1', value: playerList1[0], type: 'text' },
                        { key: 'f2', value: playerList1[1], type: 'text' },
                        { key: 'f3', value: playerList1[2], type: 'text' },
                        { key: 'f4', value: playerList1[3], type: 'text' },
                        { key: 'f5', value: playerList1[4], type: 'text' },
                        { key: 'f6', value: playerList1[5], type: 'text' },
                        { key: 'f7', value: playerList1[6], type: 'text' },
                        { key: 'f8', value: playerList1[7], type: 'text' },
                        { key: 'f9', value: playerList1[8], type: 'text' },
                        { key: 'f10', value: playerList1[9], type: 'text' },
                        { key: 'f11', value: playerList1[10], type: 'text' },
                        { key: 'f12', value: playerList1[11], type: 'text' },

                    ])}>TeamList 1 <FaPlay /></button>

                </div>
                <div>

                    <DragDropContext onDragEnd={onDragEnd2}>
                        <Droppable droppableId="droppable-1" type="PERSON">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={{ backgroundColor: snapshot.isDraggingOver ? 'yellow' : 'yellowgreen' }}
                                    {...provided.droppableProps}
                                >
                                    <table border='1'>
                                        <tbody>
                                            {playerList2.map((val, i) => {
                                                return (
                                                    <Draggable draggableId={"draggable" + i} key={val + i} index={i}>
                                                        {(provided, snapshot) => (
                                                            <tr
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    backgroundColor: snapshot.isDragging ? 'red' : 'white',
                                                                    boxShadow: snapshot.isDragging ? "0 0 .4rem #666" : "none",
                                                                    // margin: '10px'
                                                                }}
                                                            >
                                                                <td {...provided.dragHandleProps} onClick={() => setCurrentPlayer2(val)}
                                                                    onDoubleClick={() => {
                                                                        setCurrentPlayer2(val);
                                                                        recallPage(generalayer, 'PlayerId2', [{ key: 'f0', value: val, type: 'text' }])
                                                                    }}>{val}</td>
                                                            </tr>
                                                        )
                                                        }
                                                    </Draggable>
                                                )
                                            })}
                                            {provided.placeholder}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {currentPlayer2}
                    <br /> <button onClick={() => recallPage(generalayer, 'PlayerId2', [{ key: 'f0', value: currentPlayer2, type: 'text' }])}>PlayerId2<FaPlay /></button>
                    <br />  <button onClick={() => recallPage(generalayer, 'TeamList', [

                        { key: 'f0', value: team2, type: 'text' },
                        { key: 'f1', value: playerList2[0], type: 'text' },
                        { key: 'f2', value: playerList2[1], type: 'text' },
                        { key: 'f3', value: playerList2[2], type: 'text' },
                        { key: 'f4', value: playerList2[3], type: 'text' },
                        { key: 'f5', value: playerList2[4], type: 'text' },
                        { key: 'f6', value: playerList2[5], type: 'text' },
                        { key: 'f7', value: playerList2[6], type: 'text' },
                        { key: 'f8', value: playerList2[7], type: 'text' },
                        { key: 'f9', value: playerList2[8], type: 'text' },
                        { key: 'f10', value: playerList2[9], type: 'text' },
                        { key: 'f11', value: playerList2[10], type: 'text' },
                        { key: 'f12', value: playerList2[11], type: 'text' },

                    ])}>TeamList 2 <FaPlay /></button>
                    <br /> <button onClick={() => recallPage(generalayer, 'InOut', [{ key: 'f0', value: currentPlayer1, type: 'text' }, { key: 'f1', value: currentPlayer2, type: 'text' }])}>IN OUT <FaPlay /></button>

                </div>

                <br /> <button style={{ backgroundColor: 'red' }} onClick={() => { stopGraphics(generalayer); }} ><FaStop /></button>

                <div>
                    <div style={{ display: 'flex', border: '1px solid blue' }}>
                        <div>
                            Team1 <br />
                            <label>
                                <img src={team1Logo} alt='' width='80' height='80' style={{ border: '3px solid red' }} />
                                <input type="file" onChange={e => {
                                    var reader = new FileReader();
                                    reader.onloadend = () => {
                                        setTeam1Logo(reader.result)
                                    }
                                    reader.readAsDataURL(e.target.files[0]);
                                }} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div>
                            Team2 <br />
                            <label>
                                <img src={team2Logo} alt='' width='80' height='80' style={{ border: '3px solid red' }} />
                                <input type="file" onChange={e => {
                                    var reader = new FileReader();
                                    reader.onloadend = () => {
                                        setTeam2Logo(reader.result)
                                    }
                                    reader.readAsDataURL(e.target.files[0]);
                                }} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <button onClick={() => recallPage(generalayer, 'Versus', [{ key: 'f0', value: team1, type: 'text' }, { key: 'f1', value: team2, type: 'text' }, { key: 'img1', value: team1Logo, type: 'image' }, { key: 'img2', value: team2Logo, type: 'image' }])}>Versus</button>
                    </div>
                    <div style={{ display: 'flex', border: '1px solid blue' }}>
                        <div>
                            <input type='text' size="8" value={team1} onChange={e => setTeam1(e.target.value)} /><input type='text' size="1" value={team1Goal} onChange={e => setTeam1Goal(e.target.value)} />
                            <br /><input type='text' size="8" value={team2} onChange={e => setTeam2(e.target.value)} /><input type='text' size="1" value={team2Goal} onChange={e => setTeam2Goal(e.target.value)} />
                        </div>
                        <div>
                            <button onClick={() => recallPage(scoreLayer, 'Score', [{ key: 'f0', value: team1, type: 'text' }, { key: 'f1', value: team2, type: 'text' }, { key: 'f2', value: team1Goal, type: 'text' }, { key: 'f3', value: team2Goal, type: 'text' }])}>Score <FaPlay /></button>
                            <button onClick={() => updateGraphics(scoreLayer)} >Update</button>
                            <button onClick={() => stopGraphics(scoreLayer)} > <FaStop /></button>


                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', border: '1px solid blue' }}>

                            <span>Ini. Min</span> <input type='text' size="1" value={initialMinute} onChange={e => setInitilaMinute(e.target.value)} />
                            <span>Ini. Sec</span> <input type='text' size="1" value={initialSecond} onChange={e => setInitialSecond(e.target.value)} />
                            <span>countUp</span> <input type='checkbox' checked={countUp} onChange={e => setCountUp(val => !val)} />
                            <button onClick={() => showClock('Clock')}>Clock <FaPlay /></button>
                            <button onClick={() => stopGraphics(clockLayer)} ><FaStop /></button>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hockey
