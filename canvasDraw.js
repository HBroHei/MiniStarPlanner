function drawCanvasSpaceIcon(img,x,y,z,sx,sz){
    return new Promise((after) => {
        img.onload = () => {
            console.log(img)
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
            console.log(img)
            getElement("2ndCanvas").getContext("2d").drawImage(img,x,z,sx,sz);
            after();
        };
        img.onerror = (evt) => {
            console.error("ERROR LOADING " + evt.target.src)
            console.error(evt.target)
        };
    });
}