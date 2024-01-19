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

/**
 * Convert a in-game coordinate to the coordinate used in canvas rendering
 * @param {Array} coord The coordinate in-game
 * @returns Array the coordinate used in rendering
 */
function toRenderCoord(coord){
    return [
        ((Number(coord[0])+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
        ((Number(coord[1])+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod
    ]
}
/**
 * Convert a in-game coordinate to the coordinate used in canvas rendering
 * This is used for pointer clicking only. SHOULD NOT be used elsewhere
 * @param {Array} coord The coordinate in-game
 * @returns Array the coordinate used in rendering
 */
function toRenderCoord_point(coord){
    const canvasRect = getElement("2ndCanvas").getBoundingClientRect();
    return [
        Number(coord[0] - canvasRect.left) * (can2Ctx.canvas.width  / can2Ctx.canvas.clientWidth),
        Number(coord[1] - canvasRect.top ) * (can2Ctx.canvas.height / can2Ctx.canvas.clientHeight)
    ]
    /**/
    /*
    return [
        Number(coord[0]),
        Number(coord[1])
    ]
    */
}
/**
 * Convert a in-game coordinate to the coordinate used in canvas rendering
 * This is used for pointer clicking only. SHOULD NOT be used elsewhere
 * @param {Array} coord The coordinate in-game
 * @returns Array the coordinate used in rendering
 */
function toRenderCoord_spaceLength(coord){
    return [
        ((Number(coord[0])+min_x)*SPACE_DIST_MOD+50+(50*space_size_mod))/size_reduce_mod,
        ((Number(coord[1])+min_z)*SPACE_DIST_MOD+50+(50*space_size_mod))/size_reduce_mod
    ]
}


function debugDrawRect(x,y){
    getElement("2ndCanvas").getContext("2d").fillRect(x,y,50,50);
}