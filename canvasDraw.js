function drawCanvasSpaceIcon(imgNo,x,y,z,sx,sz){
    canCtx.drawImage(spacesImgs[imgNo],x,z,sx,sz);
}

async function drawSecCanvasSpaceIcon(img,x,y,z,sx,sz){
    getElement("2ndCanvas").getContext("2d").drawImage(img,x,z,sx,sz);
            
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

function fromRenderCoord_point(coord){
    const canvasRect = getElement("2ndCanvas").getBoundingClientRect();
    return [
        (coord[0] / (can2Ctx.canvas.width  / can2Ctx.canvas.clientWidth)) + canvasRect.left,
        (coord[1] / (can2Ctx.canvas.height / can2Ctx.canvas.clientHeight)) + canvasRect.top
    ];
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

function nodeStarDrag(evt){

}
function drawMovingIcon(evt){

}

function debugDrawRect(x,y){
    getElement("2ndCanvas").getContext("2d").fillRect(x,y,50,50);
}