import { useState, useEffect } from "react";


function CanvasDraw({_canvasTypes, canvasSize, splitSpace}) {
    const [canvas1, setCanvas1] = useState({});
    const [canvas2, setCanvas2] = useState({});
    const [ctx1, setCtx1] = useState({});
    const [ctx2, setCtx2] = useState({});
    const [matrix1, setMatrix1] = useState({});
    const [matrix2, setMatrix2] = useState({});
    const [canWidth1, setCanWidth1] = useState(canvasSize);
    const [canWidth2, setCanWidth2] = useState(0);
    const [splitImg, setSplitImg] = useState("./icons/split.png");

    const [name, setName] = useState("");
    const [activeSite, setActiveSite] = useState(false)
    const [isSplit, setIsSplit] = useState(false);

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isEraser, setIsEraser] = useState(false);

    const img = new Image();
    img.src = 'images/testImage01.jpg';

    // init the matrices
    useEffect(() => {
        img.src = 'images/testImage01.jpg';
        ctx1['image'].drawImage(img, 0, 0, canvasSize, canvasSize);
        CanvasTypes.map((name) => {
            matrix1[name] = new Array();
            matrix2[name] = new Array();
            for(var j = 0; j < canvasSize; j++)
            {
                matrix1[name][j] = new Array(canvasSize).fill(0);
                matrix2[name][j] = new Array(canvasSize).fill(0);
            }
        });
    }, []);

    useEffect(() => {
        img.src = 'images/testImage01.jpg';
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

        ctx1["image"].fillStyle = '#000000';
        ctx1["image"].fillRect(0,0,ctx1["image"].canvas.width, ctx1["image"].canvas.height);
        ctx2["image"].fillStyle = '#000000';
        ctx2["image"].fillRect(0,0,ctx2["image"].canvas.width, ctx2["image"].canvas.height);

        ctx1["image"].drawImage(img, 0,0,img.width,img.height,spaceX,spaceY+Math.floor((canvasSize - canWidth1) / 2),sizeX,sizeY);
        ctx2["image"].drawImage(img, 0,0,img.width,img.height,spaceX,spaceY+Math.floor((canvasSize - canWidth2) / 2),sizeX,sizeY);
    }, [canWidth1, canWidth2]);



    const handleClear = () => {
        var activeCtx = activeSite ? ctx2 : ctx1;
        var activeCanvas = activeSite ? canvas2 : canvas1;
        var activeMatrix = activeSite ? matrix2 : canvas2;
        activeCtx[name].clearRect(0, 0, activeCanvas[name].width, activeCanvas[name].height);
        for(var i = 0; i < activeMatrix[name].length; i++){
            activeMatrix[name][i].fill(0);
        }
    };

    const handleDrawStart = (e) => {
        setIsMouseDown(true);
        setActiveSite(e.target.getAttribute('name') != "1");
    };

    const handleDrawMove = (e) => {

    };

    const handleDrawEnd = (e) => {
        setIsMouseDown(false);
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
    };

    const CanvasTypes = ["image", "mod", ..._canvasTypes, "interface"];
    const leftScreen = Math.floor(canvasSize / 2) + splitSpace;
    const leftButton = canvasSize-60;

    return(
        <div className="flex">
            <div className="rounded-full bg-gray-200 w-14 py-2 mr-4">
                {_canvasTypes.map((name) => {
                    return (
                        <div className="py-2">
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
                        <div>
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
                                onMouseLeave={isInterface ? handleDrawEnd : undefined}
                                onMouseOut={isInterface ? handleDrawEnd : undefined}
                                onTouchStart={isInterface ? handleDrawStart : undefined}
                                onTouchMove={isInterface ? handleDrawMove : undefined}
                                onTouchEnd={isInterface ? handleDrawEnd : undefined}
                                onTouchCancel={isInterface ? handleDrawEnd : undefined}        
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
