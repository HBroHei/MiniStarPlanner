
var debug = false;

var canCtx = getElement("mainCanvas").getContext("2d");
var can2Ctx = getElement("2ndCanvas").getContext("2d");
var can3Ctx = getElement("3rdCanvas").getContext("2d");

//canCtx.canvas.width = 2500;
//canCtx.canvas.height = 2500;

var min_x;
var min_z;

var jsonObj;

var spacesList = {};

var filename = "";
var size_reduce_mod;
var style_size_mod;
const SIZE_MOD = 2
const SPACE_DIST_MOD = 2

var space_size_mod;

var yz_invert = false;

var current_space = "";

const lineColors = [
    "Red","Green","Blue"
]

// Pre-load images
var loadedImgs = 0
var spacesImgs = []
showLoading();
for(var i=0;i<44;i++){
    spacesImgs.push(new Image());
    spacesImgs[i].src = "/icons/" + i + ".png";
    spacesImgs[i].onload = () => {
        if(spacesImgs.length>43){
            document.getElementById("jFile").disabled = false;
            console.log("Loaded");
            hideLoading();
        }
    }
    spacesImgs[i].onerror = (evt) => {
        console.error("ERROR LOADING " + evt.target.src)
        console.error(evt.target)
    };
}
var toBowserSpaceImg = new Image();
toBowserSpaceImg.src = "icons/to37.png"

//
//TODO Make option to scale the map
//


async function drawSpace(node, max_render_y,jsonPath,isRecursive){
    let keyList = Object.keys(node);

    if(!isRecursive)
        showLoading();

    //recursiveStack = keyList
    
    for(const key of keyList){

        console.log("Loading " + key)
        if(typeof node[key]=="object" && node[key].x===undefined){ // If the object is not the space list
            await drawSpace(node[key],max_render_y,jsonPath+"/"+key,true);
            console.log("waited for " + jsonPath);
        }
        else if(key=="__dummy__"){
            continue;
        }
        else if(key.includes("max_") || key.includes("min_")){
           // This is the "max_" or "min_" node which stores the values
        }
        else{
            // Check if legacy file
            if(typeof node[key]==="string"){
                let prop_strs = node[key].split(";");
                var props_space = [];
                for(var prop_str of prop_strs){
                    //Parse the UserData
                    let prop_name_val_arr = prop_str.split(":");
                    let prop_name_val_obj = {};
                    // Convert it to JSON and store it in an array
                    //          Property name           Property value
                    props_space[prop_name_val_arr[0]] = prop_name_val_arr[1];
                }
                // Save a JSON path for saving purpose
                props_space["path"] = jsonPath;
                // Saves the space property alltogether
                spacesList[key] = props_space;
            }
            else{ // new format
                // Shold be able to parse directly
                //console.log(node[key])
                node[key]["path"] = jsonPath
                spacesList[key] = node[key]
            }
            const curProcessingSpace = spacesList[key]
            // Draw the space
            if(typeof curProcessingSpace.ms_type!=="undefined"){
                //TODO Fix Y sometimes incorrectly skipping
                yz_invert = getElement("inp_yz_invert").checked;
                const vert_val = yz_invert ? curProcessingSpace.z : curProcessingSpace.y;
                const hori_val = yz_invert ? curProcessingSpace.y : curProcessingSpace.z;

                if(Number(vert_val)>=max_render_y){
                    console.log("Skipping: " + vert_val + ">" + max_render_y + " = " + (vert_val>=max_render_y))
                    continue;
                }
                
                const renderCoord = toRenderCoord([curProcessingSpace.x,hori_val]);
                drawCanvasSpaceIcon(
                    curProcessingSpace.ms_type,
                    renderCoord[0],
                    Number(vert_val)/size_reduce_mod,
                    renderCoord[1],
                    (50*space_size_mod),(50*space_size_mod)
                );

                // Check the space will be converted to a Bowser space
                // FFFF FFFF 8000 0000 in Hex
                if(curProcessingSpace.ms_attribute=="-2147483648"){
                        // Draw the space on the canvas
                        const renderCoord = toRenderCoord([curProcessingSpace.x,hori_val]);
                        await drawSecCanvasSpaceIcon(
                            toBowserSpaceImg,
                            renderCoord[0],
                            Number(vert_val),
                            renderCoord[1],
                            (50*space_size_mod),(50*space_size_mod)
                        )
                        
                } 
                
            }
        }
        console.log(keyList.length + " " + keyList.indexOf(key))
    }

    console.log(isRecursive)
    if(!isRecursive){
        style_size_mod = getElement("inp_canvas_style_size_mod").value;
        hideLoading();
        can2Ctx.save();
    }
    

}




/*
getElement("curSpace").onload = function(){
    canCtx.drawImage(getElement("curSpace"),0,0,10,10);
}
*/

document.getElementById("btn_genImg").onclick = function(){
    document.getElementById("a_export").href = getElement("mainCanvas").toDataURL("image/png").replace("image/png", "image/octet-stream");
    document.getElementById("a_export").style.display = "inline-block";
}

function findStart(){
    for (const [key, props_space] of Object.entries(spacesList)) {
        //console.log((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50 + " " + (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)
        // IF clicked on a space
        if(props_space.ms_type == "0"){
            return key;
        }
    }
}

async function showPath(){
    showLoading();
    const spacesNameList = Object.keys(spacesList)
    // Reserved in case needing to define the starting point
    let startSpace = spacesList[findStart()];
    //let startSpace = spacesList[spacesNameList[0]];

    await drawPath(startSpace,0);

    hideLoading();
}

var visitedNode = []
async function drawPath(curPt,prevCode){
    let linkedSpaces = curPt.ms_link.split(' ');

    // Iterate over linked space, in case of split path
    for(let i=0; i<linkedSpaces.length; i++) {
        let nextPt = spacesList[linkedSpaces[i]];
        if(nextPt===undefined){
            console.log("Next space: " + linkedSpaces[i] + "=undefined. Returning")
            return;
        }
        if(visitedNode.includes(linkedSpaces[i])){
            console.log("Next space: " + linkedSpaces[i] + " visited. Returning")
            return;
        }

        let ptRenderCoord = toRenderCoord([curPt.x,yz_invert ? curPt.y : curPt.z]);
        // Draw line between current space and next space
        can2Ctx.beginPath();
        can2Ctx.moveTo(
            ptRenderCoord[0],
            ptRenderCoord[1]
        );
        ptRenderCoord = toRenderCoord([nextPt.x,yz_invert ? nextPt.y : nextPt.z])
        can2Ctx.lineTo(
            ptRenderCoord[0],
            ptRenderCoord[1]
        );
        can2Ctx.lineWidth = 10;
        //can2Ctx.strokeStyle = lineColors[i%3];
        can2Ctx.stroke();
        if(i!=0 && prevCode==0){
            console.log(prevCode + " >> " + i)
            prevCode = i;
        }
        try{
            console.log(linkedSpaces + " " + prevCode)
        }
        catch(e){
            alert("Error: Cannot render the full path.");
            hideLoading();            
        }
        // Recursively continue drawing branch paths from the next point
        await drawPath(nextPt,prevCode);

        visitedNode.push(linkedSpaces[i])
    }
}

/**
 * DEPRECATED: only able to draw paths with no split.
 */
function showPath_legacy(){
    const spacesNameList = Object.keys(spacesList)
    
    let curPt = spacesList[spacesNameList[0]]
    curPt.z = yz_invert ? curPt.y : curPt.z;
    var i=0;
    
    getElement("load_filter").style.display = "block";
    do{
        can2Ctx.beginPath();
        can2Ctx.moveTo(
            ((Number(curPt.x)+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
            ((Number(curPt.z)+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod
        );
        i++;
        //console.log(Number(curPt.x)*1.5+min_x+50,Number(curPt.z)*1.5+min_z+50)
        if(curPt.ms_link.includes(" ")){
            let splitPathNodes = curPt.ms_link.split(" ");
            curPt = splitPathNodes[0]; // Temp. fix to view the vanila board path.
            // Requires code rewrite for real board editing
            do{
                can2Ctx.beginPath();
                can2Ctx.moveTo(
                    ((Number(curPt.x)+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
                    ((Number(curPt.z)+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod
                );
                i++; 
                curPt = spacesList[curPt.ms_link];
                can2Ctx.lineTo(
                    ((Number(curPt.x)+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
                    ((Number(curPt.z)+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod
                );
                //console.log(Number(curPt.x)*1.5+min_x+50,Number(curPt.z)*1.5+min_z+50)
                can2Ctx.lineWidth = 10;
                //console.log(lineColors[i%3])
                can2Ctx.strokeStyle = lineColors[i%3];
                //console.log(can2Ctx.strokeStyle)
                can2Ctx.stroke();
                //can2Ctx.closePath();
                //console.log(curPt.ms_link);
            }while(curPt.ms_link!=" ")
        }
        else{
            curPt = spacesList[curPt.ms_link];
        }
        can2Ctx.lineTo(
            ((Number(curPt.x)+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
            ((Number(curPt.z)+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod
        );
        //console.log(Number(curPt.x)*1.5+min_x+50,Number(curPt.z)*1.5+min_z+50)
        can2Ctx.lineWidth = 10;
        //console.log(lineColors[i%3])
        can2Ctx.strokeStyle = lineColors[i%3];
        //console.log(can2Ctx.strokeStyle)
        can2Ctx.stroke();
        //can2Ctx.closePath();
        //console.log(curPt.ms_link);
    }while(curPt.ms_link!=" ")

    getElement("load_filter").style.display = "none";
    //can2Ctx.closePath()
}

function showLoading(){
    getElement("load_filter").style.display = "block";
    document.body.style.overflow = "hidden";
}
function hideLoading(){
    getElement("load_filter").style.display = "none";
    document.body.style.overflow = "auto ";
}

// Shows the properties of a space
function showSpaceProp(key,props_space){
    console.log(key);
    console.log(props_space);

    current_space = key;

    // Gets the coordinate on the display map
    const renderCoord = toRenderCoord([props_space.x,yz_invert ? props_space.y : props_space.z]);

    // Draw rectangle on the selected space
    can3Ctx.clearRect(0, 0, can3Ctx.canvas.width, can3Ctx.canvas.height);

    can3Ctx.beginPath();
    can3Ctx.rect(renderCoord[0], renderCoord[1], (50*space_size_mod), (50*space_size_mod));
    can3Ctx.stroke();

    getElement("div_ms_prop").style.display = "block";
    getElement("div_action_btns").style.display = "none";
    //getElement("div_files").style.display = "none";

    getElement("inp_x").value = props_space.x;
    getElement("inp_y").value = props_space.y;
    getElement("inp_z").value = props_space.z;

    getElement("inp_ms_name").value = key;

    getElement("inp_ms_type").value = props_space.ms_type;
    getElement("inp_ms_free8").value = props_space.ms_free8;
    getElement("inp_ms_cam").value = props_space.ms_camera;
    getElement("inp_ms_attr").value = props_space.ms_attribute;
    getElement("inp_ms_link").value = props_space.ms_link;
}

function camGoToPos(pos){
    console.log(pos[0] + " " + pos[1])
    window.scrollTo(pos[0],pos[1])
}

// ON Click event
getElement("3rdCanvas").onclick = evt => {
    // IDK why it is 1.025 but the pointer will be inaccurate if I dont add it
    const evtCoord = toRenderCoord_point([evt.clientX, evt.clientY]);
    /**/
    var evtX = evtCoord[0]// - getElement("2ndCanvas").offsetLeft;
    var evtY = evtCoord[1]// - getElement("2ndCanvas").offsetTop ;
    
    // 1.025 seems to be a "good enough" value for a fix
    //var evtX = evt.pageX * SIZE_MOD *1.029 / style_size_mod;
    //var evtY = evt.pageY * SIZE_MOD *1.029 / style_size_mod;
    console.log(evt.pageX + " " + evt.pageY)
    console.log(evtX + " " + evtY)

    if(debug)
        getElement("3rdCanvas").getContext("2d").fillRect(evtX,evtY,25,25);

    for (const [key, props_space] of Object.entries(spacesList)) {
        //console.log((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50 + " " + (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)
        // IF clicked on a space
        const hori_val = yz_invert ? props_space.y : props_space.z;
        const renderCoord = toRenderCoord([props_space.x,hori_val]);
        const renderCoord_spaceSize = toRenderCoord_spaceLength([props_space.x,hori_val]);
        if(
            evtX > renderCoord[0] && // Check X Pos
            evtX < renderCoord_spaceSize[0] &&
            evtY > renderCoord[1] && // Check Y Pos
            evtY < renderCoord_spaceSize[1]
        ){
            showSpaceProp(key,props_space);
            break;
        }
        else{
            getElement("div_ms_prop").style.display = "none";
            getElement("div_action_btns").style.display = "block";
            //getElement("div_files").style.display = "block";

            can3Ctx.clearRect(0, 0, can3Ctx.canvas.width, can3Ctx.canvas.height);
        }
    }
}

getElement("btn_ms_link").onclick = () => showSpaceProp(getElement("inp_ms_link").value,spacesList[getElement("inp_ms_link").value]);
getElement("btn_goto").onclick = () => {
    const props_space = spacesList[getElement("inp_goto").value]
    const hori_val = yz_invert ? props_space.y : props_space.z;
    camGoToPos(toRenderCoord_spaceLength([props_space.x, hori_val]))
    showSpaceProp(getElement("inp_goto").value,spacesList[getElement("inp_goto").value]);
}

getElement("btn_rerender").onclick = () => {
    // Re-render the board
    canCtx.clearRect(0,0,canCtx.canvas.width,canCtx.canvas.height)
    can2Ctx.clearRect(0,0,can2Ctx.canvas.width,can2Ctx.canvas.height)
    console.log(getElement("inp_y_filter").value);
    drawSpace(jsonObj,getElement("inp_y_filter").value)
}

getElement("inp_y_filter").onchange = () => getElement("lbl_y_filter_val").textContent = getElement("inp_y_filter").value;
getElement("inp_canvas_style_size_mod").onchange = () => {
    style_size_mod = getElement("inp_canvas_style_size_mod").value;
    let styleWidth =  ((jsonObj.max_x - jsonObj.min_x)*SIZE_MOD * getElement("inp_canvas_style_size_mod").value) + "px";
    let styleHeight = ((jsonObj.max_z - jsonObj.min_z)*SIZE_MOD * getElement("inp_canvas_style_size_mod").value) + "px";
    getElement("mainCanvas").style.width  = styleWidth;
    getElement("mainCanvas").style.height = styleHeight;
    getElement("2ndCanvas").style.width   = styleWidth;
    getElement("2ndCanvas").style.height  = styleHeight;
    getElement("3rdCanvas").style.width   = styleWidth;
    getElement("3rdCanvas").style.height  = styleHeight;
}
getElement("inp_canvas_space_size_mod").onchange = () => {
    space_size_mod = getElement("inp_canvas_space_size_mod").value;
}