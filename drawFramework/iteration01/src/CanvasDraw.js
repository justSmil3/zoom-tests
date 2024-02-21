import React, { useEffect, useState, useRef, PureComponent } from 'react';

// Canvas Setup :
// Backgroud Image
// Modifications shown on image
// mask
// marker
// selections 
// interface <- this is just there for the interactions, maybe there are better solutions but i gotta use that one for now
const canvasTypes = ["image", "mod", "mask", "marker", "selection", "interface"];
const strokeColors = ["rgba(255, 10, 10, 0.3)", "rgba(10, 10, 255, 0.3)", "rgba(10, 255, 10, 0.3)"];

const canvasStyle = {
    display: "block",
    position: "absolute",
  };

export default function CanvasDraw() {

    const [canvas, setCanvas] = useState({});
    const [ctx, setCtx] = useState({});
    const [isMouseDown, setIsMouseDown] = useState(false)
    const [name, setName] = useState("");
    const [prefMousePosition, setPrefMousePosition] = useState({x: 0, y: 0});
    const [img, setImg] = useState(new Image());
    const [matrix, setMatrix] = useState([]);
    const [isEraser, setIsEraser] = useState(false);
    

    const handleClear = () => {
        ctx[name].clearRect(0, 0, canvas[name].width, canvas[name].height);
        for(var i = 0; i < matrix[name].length; i++)
        {
            matrix[name][i].fill(0);
        }
    }

    const handleDrawStart = (e) => {
        setIsMouseDown(true);
    }

    const handleDrawMove = (e) => {

    }

    const handleDrawEnd = (e) => {
        setIsMouseDown(false)
    }

    // start
    useEffect(() => {
        setImg(new Image());
        img.src = './images/testimage01.jpg';
        ctx['image'].drawImage(img, 0, 0, 512, 512);
        canvasTypes.map((name) => {
            matrix[name] = new Array();
            for(var j = 0; j < 512; j++)
            {
                matrix[name][j] = new Array(512).fill(0);
            }
        });
        console.log(canvasTypes[2]);
    }, [])

    useEffect(()=>{

        const updateMouseDelta = ev => {
            SetDrawingParameters(ev);
            if(isMouseDown);
            setPrefMousePosition({ x: ev.clientX, y: ev.clientY });
            var mouseDelta = ({
                x: ev.clientX - prefMousePosition.x,
                y: ev.clientY - prefMousePosition.y
            });

        };
        
        // works, but is imperformant as hell. I only wanna update relevant information
        // canvasTypes.map((name) => {
        //     if(name == 'image'){
        //         setImg(new Image());
        //         img.src = './images/testimage01.jpg';
        //         ctx[name].drawImage(img, 0, 0, 512, 512);
        //     }
        //     else if(name != 'interface'){
        //         for(var x = 0; x < matrix[name].length; x++){
        //             for(var y = 0; y < matrix[name][x].length; y++){
        //                 if (matrix[name][x][y] > 0){
        //                     var color = strokeColors[matrix[name][x][y] - 1]
        //                     ctx[name].fillStyle = color;
        //                     ctx[name].rect(x, y, 1, 1);
        //                     ctx[name].fill();
        //                 }
        //             }
        //         }
        //     }
        // });

        window.addEventListener('mousemove', updateMouseDelta);
        return () => {
            window.removeEventListener(
              'mousemove',
              updateMouseDelta
            );
          };

    }, [isMouseDown, prefMousePosition]);


    function Draw(mouseDelta, last, cp){
        if(ctx[name] == null) return;
        //ctx[name].beginPath();
        //ctx[name].moveTo(last.x,last.y); 
        //ctx[name].lineJoin = "round";
        //ctx[name].lineWidth = 10;
        //ctx[name].lineCap = "round";
        //let tmp = "";
        //if(name == "mask"){
        //    tmp = "rgba(255, 10, 10, 0.5)";
        //}
        //else if (name == "mod"){
        //    tmp = "rgba(10, 10, 255, 0.5)";
        //}
        //else {
        //    tmp = "rgba(10, 255, 10, 0.5)";
        //}
        //ctx[name].strokeStyle = tmp;
        //ctx[name].quadraticCurveTo(cp.x,cp.y,last.x + mouseDelta.x,last.y + mouseDelta.y);
        //ctx[name].stroke();

        var deltaMagnitude = Math.sqrt(Math.pow(mouseDelta.x, 2) + Math.pow(mouseDelta.y, 2));
        for(var i = 0; i <= deltaMagnitude; i++)
        {
            var dx = mouseDelta.x * (i / deltaMagnitude);
            var dy = mouseDelta.y * (i / deltaMagnitude);
            var new_pos = ({
                x: last.x + dx,
                y: last.y + dy
            });
            let tmp = 1;
            if (name == "mod"){
                tmp = 2;
            }
            else if (name == "mask") {
                tmp = 3;
            }
            let radius = 5;
            for (var x = -radius; x < radius; x++){
                for(var y = -radius; y < radius; y++){
                    if(dist({x: x, y: y}, {x: 0, y: 0}) <= radius){
                        var mp = {x: clamp(Math.floor(new_pos.x + x), 0, 511), y: clamp(Math.floor(new_pos.y + y), 0, 511)}; // TODO remove hard coded values 
                        if(isNaN(mp.x) || isNaN(mp.y)){
                            return; // this could potentially lead to skips, if it does, change to continue
                        }
                        if(isEraser){
                            ctx[name].clearRect(mp.x, mp.y, 1, 1);
                            matrix[name][mp.x][mp.y] = 0;
                        }
                        else if(matrix[name][mp.x][mp.y] == 0)
                        {
                            var color = strokeColors[tmp - 1];
                            ctx[name].fillStyle = color;
                            ctx[name].fillRect(mp.x, mp.y, 1, 1);
                            matrix[name][mp.x][mp.y] = tmp;
                        }
                    }
                }
            }
            // ctx[name].fillStyle = tmp;
            // ctx[name].arc(new_pos.x,  new_pos.y, 5, 0, 2 * Math.PI, false);
            // ctx[name].fill();
        }
    }
    const dist = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2));
    }

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

    function SetDrawingParameters(ev){
        if(isMouseDown)
        {
            var rect = ev.target.getBoundingClientRect();
            var pos = ({
                x: clamp(Math.floor(ev.pageX - rect.left), 0, 512),
                y: clamp(Math.floor(ev.pageY - rect.top), 0, 512)
            });
            var mouseDelta = ({
                x: ev.clientX - prefMousePosition.x,
                y: ev.clientY - prefMousePosition.y
            });
            var last = ({
                x: pos.x - mouseDelta.x,
                y: pos.y - mouseDelta.y
            })
            var cp = ({
                x: pos.x - mouseDelta.x / 2,
                y: pos.y - mouseDelta.y / 2
            })
            Draw(mouseDelta, last, cp);
        }
    }


    // useEffect(() => {
    //     
    // }, [isMouseDown]);

    return (
        <div
        style={{
            display: "block",
            touchAction: "none",
        }}>
            <div>
                <button onClick={handleClear}>clear</button>
                <button onClick={() => {setName("marker");setIsEraser(false);}}>markRed</button>
                <button onClick={() => {setName("mod");setIsEraser(false);}}>markGreen</button>
                <button onClick={() => {setName("mask");setIsEraser(false);}}>mask</button>
                <button onClick={() => {setIsEraser(true);}}>erase</button>
                <button>select</button>
            </div>
            {
                canvasTypes.map((name) => {
                    const isInterface = name == "interface";
                    return (
                        <canvas 
                        width={512}
                        height={512}
                        key={name}
                        ref={(c) => 
                            {
                                if(c != null){
                                    canvas[name] = c;
                                    ctx[name] = c.getContext('2d');
                                }
                            }}
                        style={{...canvasStyle}}
                        onMouseDown={isInterface ? handleDrawStart : undefined}
                        onMouseMove={isInterface ? handleDrawMove : undefined}
                        onMouseUp={isInterface ? handleDrawEnd : undefined}
                        onMouseLeave={isInterface ? handleDrawEnd : undefined}
                        onMouseOut={isInterface ? handleDrawEnd : undefined}
                        onTouchStart={isInterface ? handleDrawStart : undefined}
                        onTouchMove={isInterface ? handleDrawMove : undefined}
                        onTouchEnd={isInterface ? handleDrawEnd : undefined}
                        onTouchCancel={isInterface ? handleDrawEnd : undefined}
                        />
                    );
                })
            }
        </div>
    );
}