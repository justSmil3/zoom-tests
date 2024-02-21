import React, {useState, useRef, useEffect} from 'react';

function DrawCanvas() {
    const [bOneCanvas, setBOneCanvas] = useState(true);
    const [bMousePressed, setBMousePressed] = useState(false);
    const [ctx, setCtx] = useState();

    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const intervalRef = useRef(null);

    const [img, setImg] = useState(new Image());
    img.src = 'images/testImage01.jpg';

    const [canWidth1, setCanWidth1] = useState(512);
    const [canWidth2, setCanWidth2] = useState(0);

    const [ctx1, setCtx1] = useState();
    const [ctx2, setCtx2] = useState();

    const [lastX, setLastX] = useState(-1);
    const [lastY, setLastY] = useState(-1);
    const [lastPX, setLastPX] = useState(-1);
    const [lastPY, setLastPY] = useState(-1);

    // tool stuff 
    const [diameter, setDiameter] = useState(5);

    const [
        prefMousePosition,
        setPrefMousePosition
      ] = React.useState({ x: 0, y: 0 });



    useEffect(() => {
        const canvas1 = canvasRef1.current;
        const ctx1 = canvas1.getContext('2d');
        ctx1.fillStyle = '#000000';
        ctx1.fillRect(0,0,ctx1.canvas.width, ctx1.canvas.height);
        ctx1.drawImage(img, 0,0,img.width,img.height,0,0,canWidth1,512);

        const canvas2 = canvasRef2.current;
        const ctx2 = canvas2.getContext('2d')
        ctx2.fillStyle = '#000022';
        ctx2.fillRect(0,0,ctx2.width, ctx2.height);
        ctx2.drawImage(img, 0,0,img.width,img.height,0,0,canWidth2,512);
    }, [canWidth1, canWidth2]);

    useEffect(()=>{

        const updateMouseDelta = ev => {
            SetDrawingParameters(ev);
            if(bMousePressed);
            setPrefMousePosition({ x: ev.clientX, y: ev.clientY });
            var mouseDelta = ({
                x: ev.clientX - prefMousePosition.x,
                y: ev.clientY - prefMousePosition.y
            });
            setLastPX(lastX);
            setLastPY(lastY);
            setLastX(lastX + mouseDelta.x);
            setLastY(lastY + mouseDelta.y);

        };
        
        window.addEventListener('mousemove', updateMouseDelta);
        return () => {
            window.removeEventListener(
              'mousemove',
              updateMouseDelta
            );
          };

    }, [bMousePressed, prefMousePosition]);

    const handleClear = () => {
	    canvasRef1.current.getContext('2d').clearRect(0,0,canWidth1, 512);
	    canvasRef2.current.getContext('2d').clearRect(0,0,canWidth2, 512);
    };

    function Draw(mouseDelta, last, cp){
        if(ctx == null) return;
        ctx.beginPath();
        ctx.moveTo(last.x,last.y); 
        
        //ctx.quadraticCurveTo(cp.x,cp.y,last.x + mouseDelta.x,last.y + mouseDelta.y);
        var deltaMagnitude = Math.sqrt(Math.pow(mouseDelta.x, 2) + Math.pow(mouseDelta.y, 2));
	var new_pos = ({
		x: last.x + mouseDelta.x,
		y: last.y + mouseDelta.y
	});
        //for(var i = 0; i <= deltaMagnitude; i++)
        //{
        //    var dx = mouseDelta.x * (i / deltaMagnitude);
        //    var dy = mouseDelta.y * (i / deltaMagnitude);
        //    var new_pos = ({
        //        x: last.x + dx,
        //        y: last.y + dy
        //    });
        //    console.log()   
        //    ctx.fillStyle = "rgba(255, 10, 10, 0.05)";
	//    ctx.strokeStyle = "rgba(10, 255, 10, .01)";
        //    // ctx.arc(new_pos.x,  new_pos.y, diameter, 0, 2 * Math.PI, false);
         //   // ctx.fill();
	 //   ctx.moveTo(last.x, last.y);
	 //   ctx.lineJoin = "round";
	 //   ctx.lineCap = "round";
	 //   ctx.lineWidth = 14;
	 //   ctx.lineTo(new_pos.x, new_pos.y);
	 //   ctx.stroke();
        //}
        // ctx.arc(new_pos.x,  new_pos.y, diameter, 0, 2 * Math.PI, false);
        // ctx.fillStyle = 'black';
        // ctx.fill();
        //ctx.drawCircle(last.x + mouseDelta.x, last.y + mouseDelta.y, 10, true);
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(200, 20, 10, .05)";
	ctx.lineTo(new_pos.x,new_pos.y);
        ctx.stroke();   
        ctx.save();
    }

    function ToogleCanvas(){
        setBOneCanvas(!bOneCanvas);
        SplitCanvas();
    }



    function SplitCanvas(){
        if(bOneCanvas)
        {
            setCanWidth1(512);
            setCanWidth2(0);
        }
        else
        {
            setCanWidth1(256);
            setCanWidth2(256);
        }
    }

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

    function HandleMouseDownEvent(e){
        var rect = e.target.getBoundingClientRect();
        var mouseX = clamp(Math.floor(e.pageX - rect.left), 0, 512);
        var mouseY = clamp(Math.floor(e.pageY - rect.top), 0, 512);
        setLastPX(lastX);
        setLastPY(lastY);
        setLastX(mouseX);
        setLastY(mouseY);
        setCtx(e.target.getContext('2d'));
        setBMousePressed(true);
        // if (intervalRef.current) return;
        // intervalRef.current = setInterval(() => {
        //   	SetDrawingParameters(e);
        // }, 100);
    }

    function SetDrawingParameters(ev){
        if(bMousePressed)
        {
            var rect = ev.target.getBoundingClientRect();
            try{
            if (ev.target.getContext('2d') != ctx)
                {
                    return;
                }
            }
            catch
            {
                return;
            }
            ctx.lineWidth = 20;
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

    function HandleMouseUpEvent(){
        setCtx(null);
        setBMousePressed(false);
        // if (intervalRef.current) {
        //     clearInterval(intervalRef.current);
        //     intervalRef.current = null;
        // }
    }
    

    return(
        <div>
        <button onClick={() => ToogleCanvas()} >Toogle Canvas</button>
	<button onClick={handleClear}> clear </button>
        <div>
        <canvas onMouseUp={() => HandleMouseUpEvent()} onMouseDown={(e) => HandleMouseDownEvent(e)} onMouseLeave={() => HandleMouseUpEvent()} width={canWidth1} height='512' ref={canvasRef1}>
	        
	    </canvas>
        <canvas onMouseUp={() => HandleMouseUpEvent()} onMouseDown={(e) => HandleMouseDownEvent(e)} onMouseLeave={() => HandleMouseUpEvent()} width={canWidth2} height='512' ref={canvasRef2}>
	        
	    </canvas>
        </div>
	</div>
    );
}

export default DrawCanvas;
