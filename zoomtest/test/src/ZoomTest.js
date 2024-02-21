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
    const CanvasSize = 512;
    const speed = 1;
    const touchSpeed = .05;
    const testImgSrc = "test5.png";


    const handleZoom = (e) => {
        if(e.nativeEvent.wheelDeltaX == 0 && Math.abs(e.nativeEvent.wheelDeltaY) == 240)
        {
            var zoom = e.nativeEvent.deltaY;
            var multiplier = img.height / img.width; // this is so that the zoom gets applied evenly

            var _width = clamp(imgWidth+zoom,1, img.width);
            var _height = clamp(imgHeight+(zoom * multiplier),1 * multiplier, img.height);
            var per = _width > _height ? _width / CanvasSize : _height / CanvasSize;

            var _mousePos = {x: e.pageX - e.target.offsetLeft, y: e.pageY - e.target.offsetTop};
            var relativeMousePos = {x: mousePos.x / CanvasSize, y: mousePos.y / CanvasSize};
            console.log(per);
            var _canvasSize = {x: 512, y: 512};
            
            var _imgOffsetX = (img.width - _width) - (_canvasSize.x - Math.min(img.width / _height * _canvasSize.x, _canvasSize.x)) * per;
            //var _imgOffsetX = (zoom * multiplier) - (_canvasSize.x - Math.min(img.width / _height * _canvasSize.x, _canvasSize.x)) * per;
            var _imgOffsetY = (img.height - _height) - ((_canvasSize.y - Math.min(img.height / _width * _canvasSize.y, _canvasSize.y)) * per); 
            //var _imgOffsetY = (zoom) - ((_canvasSize.y - Math.min(img.height / _width * _canvasSize.y, _canvasSize.y)) * per); 


            var absoluteSizeY = Math.min(img.height / img.width * CanvasSize, CanvasSize);
            var absoluteSpaceY = (CanvasSize - absoluteSizeY) / 2;
            var absoluteSizeX = Math.min(img.width / img.height * CanvasSize, CanvasSize);
            var absoluteSpaceX = (CanvasSize - absoluteSizeX) / 2;


            var _mouseMult = {
                x: (relativeMousePos.x * _width + imgOffset.x - movement.x + absoluteSpaceX) / img.width,
                y: (relativeMousePos.y * _height + imgOffset.y - movement.y + absoluteSpaceY) / img.height
            };
            _imgOffsetX *= ((_mouseMult.x));// * Math.abs(img.width - _width);// / _canvasSize.x));
            _imgOffsetY *= ((_mouseMult.y));// * Math.abs(img.height - _height);// / _canvasSize.y));

            
            // var _imgOffset = {
            //     x: clamp(imgOffset.x - _imgOffsetX - ((_canvasSize.x - Math.min(img.width/_height*_canvasSize.x, _canvasSize.x))/2), 0, img.width - _width), 
            //     y: clamp(imgOffset.y - _imgOffsetY - ((_canvasSize.y - Math.min(img.height/_width*_canvasSize.y, _canvasSize.y))/2), 0, img.height - _height) // somehwo preven growth here
            // };
            var _imgOffset = {
                x: clamp(_imgOffsetX * relativeMousePos.x, 0, img.width - _width), 
                y: clamp(_imgOffsetY * relativeMousePos.y, 0, img.height - _height) // somehwo preven growth here
            };

            setDeltaMovement({x: 0, y: 0});
            setMousePos(_mousePos);
            setImgOffset({x: _imgOffset.x, y: _imgOffset.y}); 
            setImgHeight(_height); 
            setImgWidth(_width);
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
        var sizeX = CanvasSize;
        var sizeY = CanvasSize;
        // need to make sure that part works, but I think the idea of zooming this way is right 
        var _width = imgWidth;
        var _height = imgHeight;
        var tmpSpaceX = 0;
        var tmpSpaceY = 0;
        var longside = 0;
        var imgOffsetX = imgOffset.x;
        var imgOffsetY = imgOffset.y;

        // clear the rect
        ctx.clearRect(0,0,512,512);

        // handle the scrolling in
        if (img.width > img.height){
            longside = _width;
            sizeY = Math.min(img.height / _width * CanvasSize, CanvasSize);
            spaceY = (CanvasSize - sizeY) / 2;
        }else {longside = _height;
            sizeX = Math.min(img.width / _height * CanvasSize, CanvasSize);
            spaceX = (CanvasSize - sizeX) / 2;
        };

        imgOffsetX = Math.max(imgOffsetX - (CanvasSize - sizeX), 0)
        imgOffsetY = Math.max(imgOffsetY - (CanvasSize - sizeY), 0)
        
        var per = (longside / 512);
        var _imgOffsetX = Math.max((img.width - _width) - ((CanvasSize - Math.min(img.width / img.height * CanvasSize, CanvasSize)) * per), 0);
        var _imgOffsetY = Math.max((img.height - _height) - ((CanvasSize - Math.min(img.height / img.width * CanvasSize, CanvasSize)) * per), 0);

        // handle movment while scrolled in 
        var _movement = movement;
        var tmpSpaceX = spaceX + (movement.x + deltaMovement.x);
        var tmpOffsetX = imgOffsetX - (movement.x + deltaMovement.x);
        var _tmpSpaceX = clamp(tmpSpaceX, 0, CanvasSize - sizeX);
        var _tmpImgOffsetX = clamp(tmpOffsetX, 0, _imgOffsetX);
        movement.x = (_tmpSpaceX - spaceX) - (_tmpImgOffsetX - imgOffsetX);
        spaceX = _tmpSpaceX;
        imgOffsetX = _tmpImgOffsetX;

        var tmpSpaceY = spaceY + (movement.y + deltaMovement.y);
        var tmpOffsetY = imgOffsetY - (movement.y + deltaMovement.y);
        var _tmpSpaceY = clamp(tmpSpaceY, 0, CanvasSize - sizeY);
        var _tmpImgOffsetY = clamp(tmpOffsetY, 0, _imgOffsetY);
        movement.y = (_tmpSpaceY - spaceY) - (_tmpImgOffsetY - imgOffsetY);
        spaceY = _tmpSpaceY;
        imgOffsetY = _tmpImgOffsetY;

        setMovement(_movement);

        // draw the final result
        ctx.drawImage(img,imgOffsetX,imgOffsetY,per * sizeX, per * sizeY, spaceX, spaceY, sizeX, sizeY);

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
                onMouseMove={(e)=>moveMouse(e)} 
                onMouseUp={handleMouseDown} 
                onMouseDown={handleMouseDown}    
                onMouseEnter={disableZoom}
                onMouseLeave={enableZoom} 
                onWheel={handleZoom} 
                width={512} height={512} ref={canvRef}/>
        </div>
    );
}
 
export default ZoomTest;
