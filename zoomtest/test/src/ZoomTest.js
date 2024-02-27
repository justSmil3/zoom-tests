import React, { useEffect, useRef, useState } from "react";
import { canHaveModifiers, collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

// TODO Zooming to mouse position does not properly work on the test with spaces ! 
function ZoomTest(){

    const disableZoomDefault = (e) => {
        e.preventDefault();
    }; 
    const disableZoom = () => {
        window.addEventListener('wheel', disableZoomDefault, {passive: false});
    }
    const enableZoom = () => {
        window.removeEventListener('wheel', disableZoomDefault);
    }

    const canvRef = useRef(null);

    const [ctx, setCtx] = useState(null);
    const [canvas, setCanvas] = useState(null);
    const [imgHeight, setImgHeight] = useState(0);
    const [imgWidth, setImgWidth] = useState(0);
    const [imgOffset, setImgOffset] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(0);
    const [mousePos, setMousePos] = useState({x: 0, y: 0});
    const [isMouseDown, SetIsMouseDown] = useState(false);
    const [movement, setMovement] = useState({x: 0, y: 0});
    const [deltaMovement, setDeltaMovement] = useState({x: 0, y: 0});
    const CanvasWidth = 512;
    const CanvasHeight = 512;
    const speed = 1;
    const touchSpeed = .05;
    const testImgSrc = "test5.png";


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

            var _mousePos = {x: e.pageX - e.target.offsetLeft, y: e.pageY - e.target.offsetTop};
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

    const handleMouseDown = (e) => {
        if(e.button != 0)
        {
            return;
        }
        SetIsMouseDown(e.buttons != 0);
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

    var img = new Image();
    img.src = testImgSrc;

    const clamp = (x, min, max) => {
        return Math.max(Math.min(x, max), min);
    };

    useEffect(() => { // positioning does not work currently 
        img = new Image();
        img.src = testImgSrc;

        if(canvas == null || ctx == null) return;
        var spaceX = 0;
        var spaceY = 0;
        var sizeX = CanvasWidth;
        var sizeY = CanvasHeight;
        // need to make sure that part works, but I think the idea of zooming this way is right 
        var _width = imgWidth;
        var _height = imgHeight;
        var tmpSpaceX = 0;
        var tmpSpaceY = 0;
        var longside = 0;
        var imgOffsetX = imgOffset.x;
        var imgOffsetY = imgOffset.y;

        // clear the rect
        ctx.clearRect(0,0,CanvasWidth,CanvasHeight);

        // handle the scrolling in
        var zoomMultX = 1;//img.width/img.height;
        var zoomMultY = img.height/img.width;
        var per = 1;
        
        if (img.width / CanvasWidth > img.height / CanvasHeight){
            per = _width / CanvasWidth;
            sizeY = Math.min(img.height / _width * CanvasWidth, CanvasHeight);
            spaceY = (CanvasHeight - sizeY) / 2;
            zoomMultY = CanvasHeight / CanvasWidth;
        }else {
            per = _height / CanvasHeight;
            sizeX = Math.min(img.width / _height * CanvasHeight, CanvasWidth);
            spaceX = (CanvasWidth - sizeX) / 2;
            zoomMultX = img.height / img.width* (CanvasWidth/CanvasHeight);
        };
        
        var absoluteSpaceX = ((CanvasWidth - Math.min(img.width / img.height * CanvasHeight, CanvasWidth)));
        var absoluteSpaceY = ((CanvasHeight - Math.min(img.height / img.width * CanvasWidth, CanvasHeight)));
        var _imgOffsetX = (imgOffsetX - absoluteSpaceX * per) / 2;
        var _imgOffsetY = (imgOffsetY - absoluteSpaceY * per) / 2;

        // handle movment while scrolled in 
        var offsetHolderX = Math.max(_imgOffsetX, 0);
        var offsetHolderY = Math.max(_imgOffsetY, 0);

        var relativeMousePos = {x: (mousePos.x) / CanvasWidth, y: (mousePos.y) / CanvasHeight};
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
        
        ctx.drawImage(img,_imgOffsetX,_imgOffsetY,per * sizeX, per * sizeY, _spaceX, _spaceY, sizeX, sizeY);

    },[imgOffset, imgHeight, imgWidth, mousePos, deltaMovement]);

    useEffect(() => {
        img = new Image();
        img.src = testImgSrc;
        var canvas = canvRef.current;
        var ctx = canvRef.current.getContext('2d'); 
        setCanvas(canvas);
        setCtx(ctx);
        setImgHeight(img.height);
        setImgWidth(img.width);
    }, []);

    return(
	    <div>
            <canvas 
                style={{ background: "#232323"}}
                onMouseMove={(e)=>moveMouse(e)} 
                onMouseUp={handleMouseDown} 
                onMouseDown={handleMouseDown}    
                onMouseEnter={disableZoom}
                onMouseLeave={enableZoom} 
                onWheel={handleZoom} 
                width={CanvasWidth} height={CanvasHeight} ref={canvRef}/>
        </div>
    );
}
 
export default ZoomTest;
