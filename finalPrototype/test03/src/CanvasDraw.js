// Important fact: The code from the multicanvas draw test is adjusted to the fact that I am constraining the drawing itself just to the fist context

import { useState, useEffect } from "react";

const MAX_IMG_VALUE = 1024;

const strokeColors = ["rgba(255, 10, 10, 0.3)", "rgba(10, 10, 255, 0.3)", "rgba(10, 255, 10, 0.3)"];

function CanvasDraw({_canvasTypes, canvasSize, splitSpace}) {

    const clamp = (x, min, max) => {
        return Math.max(Math.min(x, max), min);
    };
    const dist = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2));
    }

    const [canvas1, setCanvas1] = useState({});
    const [canvas2, setCanvas2] = useState({});
    const [ctx1, setCtx1] = useState({});
    const [ctx2, setCtx2] = useState({});
    const [matrix1, setMatrix1] = useState({});
    const [matrix2, setMatrix2] = useState({});
    const [canWidth1, setCanWidth1] = useState(canvasSize);
    const [canWidth2, setCanWidth2] = useState(0);
    const [splitImg, setSplitImg] = useState("./icons/split.png");
    const [imgHeight, setImgHeight] = useState(0);
    const [imgWidth, setImgWidth] = useState(0);
    const [movement, setMovement] = useState({x: 0, y: 0});
    const [deltaMovement, setDeltaMovement] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(0);
    const [mousePos, setMousePos] = useState({x: 0, y: 0});
    const [imgOffset, setImgOffset] = useState({x: 0, y: 0});

    const [name, setName] = useState("");
    const [activeSite, setActiveSite] = useState(false)
    const [isSplit, setIsSplit] = useState(false);

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isEraser, setIsEraser] = useState(false);

    const speed = 1;
    const touchSpeed = .05;

    const canvasHeight = canvasSize;
    const img = new Image();
    img.src = 'images/testImage01.jpg';
    //img.src = 'images/test5.png';

    const CanvasTypes = ["image", "mod", ..._canvasTypes, "interface"];

    const maskColors = CanvasTypes.map(typeName => {
        return 1;
    });


    const leftScreen = Math.floor(canvasSize / 2) + splitSpace;
    const leftButton = canvasSize-60;
    // init the matrices
    useEffect(() => {
        console.log(maskColors);
        ctx1['image'].drawImage(img, 0, 0, canvasSize, canvasSize);
        CanvasTypes.map((name) => {
            matrix1[name] = new Array();
            matrix2[name] = new Array();

            var matrixWidth = 0;
            var matrixHeight = 0;

            var matrixSizeScalar = (function(){
                var longSide = Math.max(img.width, img.height);
                var rest = longSide - MAX_IMG_VALUE;
                if(rest <= 0) {
                    return 1;
                }
                else {
                    return 1 - (rest / longSide);
                }
            })();

            matrixWidth = img.width / matrixSizeScalar;
            matrixHeight = img.height / matrixSizeScalar;
            
            for(var j = 0; j < matrixWidth; j++)
            { // TODO this causes an error, FIX THIS 
                matrix1[name][j] = new Array(matrixHeight).fill(0); // CHANGED: used to use the canvas size to determain the size of the matricies, 
                //matrix2[name][j] = new Array(matrixHeight).fill(0); // This change was made first of all because just the image dimensions are drawn on
                                                                    // as well as the image is the thing that is important for the drawn masks.
                // matrix2 commented out for now because it is never actually intended to draw on the second canvas itself !
            }
        });
        setImgHeight(img.height);
        setImgWidth(img.width);
    }, []);


    useEffect(() => {
        var spaceX = 0;
        var spaceY = 0;
        var sizeX = canWidth1;
        var sizeY = canWidth1;
        if (img.width > img.height){
            spaceY = (img.width - img.height) % canvasSize;
            spaceY = Math.floor(spaceY / 2);
            if(isSplit){
                spaceY = Math.floor(spaceY / 2);
            }
            sizeY = sizeX * (img.height / img.width);
        }else {     
            spaceX = (img.height - img.width) % canWidth1;
            spaceX = Math.floor(spaceX / 2);
            sizeX = sizeY * (img.width / img.height);
            if(isSplit){
                sizeX = sizeY * (img.width / img.height);
            }
        };

        ctx1["image"].drawImage(img, 0,0,img.width,img.height,spaceX,spaceY+Math.floor((canvasSize - canWidth1) / 2),sizeX,sizeY);
        ctx2["image"].drawImage(img, 0,0,img.width,img.height,spaceX,spaceY+Math.floor((canvasSize - canWidth2) / 2),sizeX,sizeY);
    }, [canWidth1, canWidth2]);

    useEffect(() => { // positioning does not work currently 
        //if(canvas == null || ctx == null) return;
        var spaceX = 0;
        var spaceY = 0;
        var sizeX = canWidth1;
        var sizeY = canvasHeight;
        // need to make sure that part works, but I think the idea of zooming this way is right 
        var _width = imgWidth;
        var _height = imgHeight;
        var imgOffsetX = imgOffset.x;
        var imgOffsetY = imgOffset.y;
        // var activeCtx = activeSite ? ctx2 : ctx1; // not needed if drawing is only possible on the first canvas 

        // clear the rect
        ctx1["image"].clearRect(0,0,canWidth1,canvasHeight);
        ctx2["image"].clearRect(0,0,canWidth1,canvasHeight);

        // handle the scrolling in
        var zoomMultX = 1;//img.width/img.height;
        var zoomMultY = img.height/img.width;
        var per = 1;
        
        if (img.width / canWidth1 > img.height / canvasHeight){
            per = _width / canWidth1;
            sizeY = Math.min(img.height / _width * canWidth1, canvasHeight);
            spaceY = (canvasHeight - sizeY) / 2;
            zoomMultY = canvasHeight / canWidth1;
        }else {
            per = _height / canvasHeight;
            sizeX = Math.min(img.width / _height * canvasHeight, canWidth1);
            spaceX = (canWidth1 - sizeX) / 2;
            zoomMultX = img.height / img.width* (canWidth1/canvasHeight);
        };
        
        var absoluteSpaceX = ((canWidth1 - Math.min(img.width / img.height * canvasHeight, canWidth1)));
        var absoluteSpaceY = ((canvasHeight - Math.min(img.height / img.width * canWidth1, canvasHeight)));
        var _imgOffsetX = (imgOffsetX - absoluteSpaceX * per) / 2;
        var _imgOffsetY = (imgOffsetY - absoluteSpaceY * per) / 2;

        // handle movment while scrolled in 
        var offsetHolderX = Math.max(_imgOffsetX, 0);
        var offsetHolderY = Math.max(_imgOffsetY, 0);

        var relativeMousePos = {x: (mousePos.x) / canWidth1, y: (mousePos.y) / canvasHeight};
        var mvmX = movement.x + deltaMovement.x + zoom * zoomMultX / 2 * (relativeMousePos.x * 2 - 1); // TODO continue from here
        var mvmY = movement.y + deltaMovement.y + zoom * zoomMultY / 2 * (relativeMousePos.y * 2 - 1);
        setZoom(0);
        
        var _movement = {x:clamp(mvmX, -spaceX-offsetHolderX ,spaceX+offsetHolderX), 
                         y:clamp(mvmY, -spaceY-offsetHolderY ,spaceY+offsetHolderY)};
                         
        var _spaceX = clamp(spaceX + _movement.x, 0, spaceX*2);
        var offMvmx= _movement.x - (_spaceX - spaceX);
        _imgOffsetX -= offMvmx;

        var _spaceY = clamp(spaceY + _movement.y, 0, spaceY*2);
        var offMvmy= _movement.y - (_spaceY - spaceY);
        _imgOffsetY -= offMvmy;
        
        setMovement(_movement);
        _imgOffsetX = Math.max(_imgOffsetX, 0);
        _imgOffsetY = Math.max(_imgOffsetY, 0);
        
        ctx1["image"].drawImage(img,_imgOffsetX,_imgOffsetY,per * sizeX, per * sizeY, _spaceX, _spaceY, sizeX, sizeY);
        // ctx2["image"].drawImage(img,_imgOffsetX,_imgOffsetY,per * sizeX, per * sizeY, _spaceX, _spaceY, sizeX, sizeY); // commented out becaused This is zoom

    },[imgOffset, imgHeight, imgWidth, mousePos, deltaMovement]);

    const disableZoomDefault = (e) => {
        e.preventDefault();
    }; 
    const disableZoom = (e) => {
        window.addEventListener('wheel', disableZoomDefault, {passive: false});
        setActiveSite(e.target.getAttribute('name') != "1");
    };
    const enableZoom = () => {
        window.removeEventListener('wheel', disableZoomDefault);
    };

    const ResetZoom = () =>
    {
        setImgOffset({x: 0, y: 0}); 
        setMovement({x: 0, y:0});
        setImgHeight(img.height); 
        setImgWidth(img.width);
        setZoom(0);
    }

    const handleZoom = (e) => {
        if(e.nativeEvent.wheelDeltaX == 0 && Math.abs(e.nativeEvent.wheelDeltaY) == 240)
        {
            var deltaZoom = e.nativeEvent.deltaY;
            var multiplier = img.height / img.width; // this is so that the zoom gets applied evenly

            var minimumSize = 1;
            var _width = clamp(imgWidth+deltaZoom,minimumSize, img.width);
            var _height = clamp(imgHeight+(deltaZoom * multiplier),minimumSize * multiplier, img.height);
            if(_width <= minimumSize || _height <= minimumSize * multiplier)
            {
                return;
            }

            //var _mousePos = {x: e.pageX - e.target.offsetLeft, y: e.pageY - e.target.offsetTop};
            var _mousePos = {x: e.pageX - e.target.getBoundingClientRect().left, y: e.pageY - e.target.getBoundingClientRect().top};
            var _zoom = deltaZoom;

            // lines are half commented so I can handle all the spacing in the function below
            var _imgOffsetX = (img.width - _width);
            var _imgOffsetY = (img.height - _height);


            var _imgOffset = {
                x: clamp(_imgOffsetX, 0, img.width - _width), 
                y: clamp(_imgOffsetY, 0, img.height - _height) 
            };

            setDeltaMovement({x: 0, y: 0});
            setMousePos(_mousePos);
            setImgOffset({x: _imgOffset.x, y: _imgOffset.y}); 
            setImgHeight(_height); 
            setImgWidth(_width);
            setZoom(_zoom);
        }
        else
        {
            moveMouse(e, true, {x: e.nativeEvent.wheelDeltaX, y: e.nativeEvent.wheelDeltaY});
        }
    };

    // TODO Implement this funcion! 
    function Draw(mouseDelta, last, cp){
        if(ctx1[name] == null) {
            return;
        }
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
                            ctx1[name].clearRect(mp.x, mp.y, 1, 1);
                            ctx2[name].clearRect(mp.x, mp.y, 1, 1);
                            matrix1[name][mp.x][mp.y] = 0;
                            matrix2[name][mp.x][mp.y] = 0;
                        }
                        else if(matrix1[name][mp.x][mp.y] == 0)
                        {
                            var color = strokeColors[tmp - 1]; // TODO these are the colors of the different modes, randomize them 
                            ctx1[name].fillStyle = color;
                            ctx1[name].fillRect(mp.x, mp.y, 1, 1);
                            ctx2[name].fillStyle = color;
                            ctx2[name].fillRect(mp.x, mp.y, 1, 1);
                            matrix1[name][mp.x][mp.y] = tmp;
                            matrix2[name][mp.x][mp.y] = tmp;
                        }
                    }
                }
            }
        }
    }

    function moveMouse(e, bActive = false, mousemove = {x: 0, y: 0}){
        if(!bActive && !isMouseDown){
            setDeltaMovement({x: 0, y: 0});
            return;
        }
        
        var dm = bActive ? {
            x: - mousemove.x * touchSpeed, 
            y: - mousemove.y * touchSpeed
        } : {
            x: e.movementX * speed, 
            y: e.movementY * speed
        };
        setDeltaMovement(dm);
    }

    const handleClear = () => { // TODO change needed here 
        // var activeCtx = activeSite ? ctx2 : ctx1;
        // var activeCanvas = activeSite ? canvas2 : canvas1;
        // var activeMatrix = activeSite ? matrix2 : canvas2;
        // activeCtx[name].clearRect(0, 0, activeCanvas[name].width, activeCanvas[name].height);
        // for(var i = 0; i < activeMatrix[name].length; i++){
        //     activeMatrix[name][i].fill(0);
        // }
    };

    const handleMouseLeave = (e) => {
        handleDrawEnd(e);
        enableZoom();
    };

    const handleMouseMove = (e) => {
        handleDrawStart(e);
        moveMouse(e);
    }

    const handleDrawStart = (e) => {
        setIsMouseDown(true);
        //setActiveSite(e.target.getAttribute('name') != "1");
    };

    const handleDrawMove = (e) => {

    };

    const handleDrawEnd = (e) => {
        setIsMouseDown(false);
        // if(e.button != 0)
        // {
        //     return;
        // }
        // SetIsMouseDown(e.buttons != 0);
    };

    function HandleSwitchCanvas(_name){
        setName(_name);
        setIsEraser(false);
    }

    const toggleCanvas = () => {
        setIsSplit(!isSplit);
        if(isSplit)
        {
            setSplitImg("./icons/split.png");
            setCanWidth1(canvasSize);
            setCanWidth2(0);
        }
        else
        {
            setSplitImg("./icons/nonsplit.png");
            setCanWidth1(Math.floor(canvasSize/2) - splitSpace);
            setCanWidth2(Math.floor(canvasSize/2) - splitSpace);
        }
        ResetZoom();
    };


    return(
        <div className="flex">
            <div className="rounded-full bg-gray-200 w-14 py-2 mr-4">
                {_canvasTypes.map((name) => {
                    return (
                        <div className="py-2" key={name}>
                            <button onClick={() => {HandleSwitchCanvas(name)}} className="w-12 h-12 bg-transparent hover:bg-gray-500 rounded-full">
                                <img src={"./icons/" + name + ".png"} alt={name} className="w-8 h-8 m-auto"/>
                            </button>
                        </div>
                    );
                })}
                <div className="py-2">
                    <button onClick={() => {setIsEraser(true)}} className="w-12 h-12 bg-transparent hover:bg-gray-500 rounded-full">
                        <img src={"./icons/eraser.png"} alt="eraser" className="w-8 h-8 m-auto"/>
                    </button>
                </div>
            </div>
            <div className="relative">
                {CanvasTypes.map((name) => {
                    const isInterface = name == "interface";
                    return(
                        <div key={name}>
                            <canvas
                                width={canWidth1}
                                height={canvasSize}
                                className="rounded-lg absolute block"
                                name={"1"}
                                ref={ (c) => {
                                    if(c != null){
                                        canvas1[name] = c;
                                        ctx1[name] = c.getContext('2d');
                                    }
                                }}
                                onMouseDown={isInterface ? handleDrawStart : undefined}
                                onMouseMove={isInterface ? handleDrawMove : undefined}
                                onMouseUp={isInterface ? handleDrawEnd : undefined}
                                onMouseLeave={isInterface ? handleMouseLeave : undefined}
                                onMouseOut={isInterface ? handleDrawEnd : undefined}
                                onTouchStart={isInterface ? handleDrawStart : undefined}
                                onTouchMove={isInterface ? handleDrawMove : undefined}
                                onTouchEnd={isInterface ? handleDrawEnd : undefined}
                                onTouchCancel={isInterface ? handleDrawEnd : undefined}
                                onMouseEnter={isInterface ? disableZoom : undefined}
                                onWheel={isInterface ? handleZoom : undefined}    
                            />
                            <canvas 
                                width={canWidth2}
                                height={canvasSize}
                                className="rounded-lg absolute block"
                                style={{left: `${leftScreen}px`}}
                                name={"2"}
                                ref={ (c) => {
                                    if(c != null){
                                        canvas2[name] = c;
                                        ctx2[name] = c.getContext('2d');
                                    }
                                }}
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
                        </div>
                    );
                })}
                <button className="absolute top-5  rounded-full bg-gray-500 hover:bg-gray-700 w-10 h-10" style={{left: `${leftButton}px`}}
                    onClick={toggleCanvas}
                >
                    <img src={splitImg} alt="split" className="w-6 h-6 m-auto"/>
                </button>
            </div>
        </div>
    );
}

export default CanvasDraw;
