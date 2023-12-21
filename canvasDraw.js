function drawCanvasSpaceIcon(img,x,y,z,sx,sz){
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

function drawSecCanvasSpaceIcon(img,x,y,z,sx,sz){
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