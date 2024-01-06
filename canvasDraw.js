async function drawCanvasSpaceIcon(img,x,y,z,sx,sz){
    //console.log("Drawing at: " + x + ", " + z)
    return new Promise((after) => {
        img.onload = () => {
            canCtx.drawImage(img,x,z,sx,sz);
            after();
        };
        img.onerror = (evt) => {
            console.error("ERROR LOADING " + evt.target.src)
            console.error(evt.target)
        };
    });
}

async function drawSecCanvasSpaceIcon(img,x,y,z,sx,sz){
    return new Promise((after) => {
        img.onload = () => {
            getElement("2ndCanvas").getContext("2d").drawImage(img,x,z,sx,sz);
            after();
        };
        img.onerror = (evt) => {
            console.error("ERROR LOADING " + evt.target.src)
            console.error(evt.target)
        };
    });
}

function debugDrawRect(x,y){
    getElement("2ndCanvas").getContext("2d").fillRect(x,y,50,50);
}