
var debug = false;

var canCtx = getElement("mainCanvas").getContext("2d");
var can2Ctx = getElement("2ndCanvas").getContext("2d");

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

const lineColors = [
    "Red","Green","Blue"
]

//
//TODO Make option to scale the map
//

async function drawSpace(node, max_render_y,isRecursive){
    let keyList = Object.keys(node);

    if(!isRecursive)
        showLoading();

    for(const key of keyList){
        console.log("Loading " + key)
        if(typeof node[key]=="object"){ // If the object is not the space list
            await drawSpace(node[key],max_render_y,true);
            console.log("waited for " + key);
        }
        else if(key=="__dummy__"){
            continue;
        }
        else if(key.includes("max_") || key.includes("min_")){
           // This is the "max_" or "min_" node which stores the values
        }
        else{
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
            spacesList[key] = props_space;

            if(typeof props_space.ms_type!=="undefined"){
                //TODO Fix Y sometimes incorrectly skipping
                if(Number(props_space.y)>=max_render_y){
                    console.log("Skipping: " + props_space.y + ">" + max_render_y + " = " + (props_space.y>=max_render_y))
                    continue;
                }
                
                await fetch("./icons/" + props_space.ms_type + ".png").then(async function(r){
                    if(r.status==404){
                        console.log("Warning: File returned 404, skipping")
                        return;
                    }
                    var drawSpaceImg = new Image();
                    drawSpaceImg.src = "icons/" + props_space.ms_type + ".png"

                    // Draw the space on the canvas
                    
                    await drawCanvasSpaceIcon(
                        drawSpaceImg,
                        ((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
                        Number(props_space.y)/size_reduce_mod,
                        ((Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod,
                        (50*space_size_mod),(50*space_size_mod)
                    )
                    

                    //debugDrawRect((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50,(Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)

                    //can2Ctx.save(); // Disabled for performance
                }).catch((err)=>{
                    console.log(err)
                })
                // Check the space will be converted to a Bowser space
                // FFFF FFFF 8000 0000 in Hex
                if(props_space.ms_attribute=="-2147483648"){
                    var toBowserSpaceImg = new Image();
                        toBowserSpaceImg.src = "icons/to37.png"
                        // Draw the space on the canvas
                        await drawSecCanvasSpaceIcon(
                            toBowserSpaceImg,
                            (Number(props_space.x)+min_x)*SPACE_DIST_MOD+50,
                            Number(props_space.y),
                            (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50,
                            (50*space_size_mod),(50*space_size_mod)
                        )
                        
                } 
                
            }

            //getElement("curSpace").src = "./icons/" + props_space.ms_type + ".png"
        }
    }

    if(!isRecursive){
        style_size_mod = getElement("inp_canvas_style_size_mod").value;
        hideLoading();
    }
        

}


getElement("jFile").onchange = function(e){
    var fr = new FileReader();
        
    fr.onload = function(){
        canCtx.clearRect(0,0,canCtx.canvas.width,canCtx.canvas.height)
        can2Ctx.clearRect(0,0,can2Ctx.canvas.width,can2Ctx.canvas.height)
        jsonObj = JSON.parse(fr.result);

        //console.log(jsonObj.max_x*1.5 + "-" + jsonObj.min_x*1.5)

        // Initalise this variable in case of oversizing
        size_reduce_mod = 1;
        space_size_mod = 1;

        /**/
        // Set the element size
        let styleWidth = (jsonObj.max_x - jsonObj.min_x)*SIZE_MOD + "px";
        let styleHeight = (jsonObj.max_z - jsonObj.min_z)*SIZE_MOD + "px";
        getElement("mainCanvas").style.width  = styleWidth;
        getElement("mainCanvas").style.height = styleHeight;
        getElement("2ndCanvas").style.width   = styleWidth;
        getElement("2ndCanvas").style.height  = styleHeight;

        // Set the canvas size
        let canvasWidth = (jsonObj.max_x - jsonObj.min_x)*SIZE_MOD*SPACE_DIST_MOD+/*Extra Padding*/150;
        let canvasHeight = (jsonObj.max_z - jsonObj.min_z)*SIZE_MOD*SPACE_DIST_MOD+/*Extra Padding*/150;
        // Check if it exceed the max limit
        if(canvasHeight>16384 || canvasWidth>16384){
            size_reduce_mod = Math.max(canvasWidth,canvasHeight)/16384;
            //console.log(canvasWidth + "/" + size_reduce_mod);
            canvasWidth /= size_reduce_mod;
            canvasHeight /= size_reduce_mod;
        }
        canCtx.canvas.width   = canvasWidth;
        canCtx.canvas.height  = canvasHeight;
        can2Ctx.canvas.width  = canvasWidth;
        can2Ctx.canvas.height = canvasHeight;
        min_x = jsonObj.min_x*-1.5;
        min_z = jsonObj.min_z*-1.5;
        console.log(getElement("mainCanvas").style.width + " " + canCtx.canvas.width);
        /**/

        // Set Y filter max
        getElement("inp_y_filter").max =   (jsonObj.max_y+200)/size_reduce_mod;
        getElement("inp_y_filter").min =   (jsonObj.min_y-200)/size_reduce_mod;
        getElement("inp_y_filter").value = (jsonObj.max_y+10 )/size_reduce_mod;
        getElement("lbl_y_filter_val").textContent = getElement("inp_y_filter").value;
        getElement("inp_y_filter").disabled = false;
        getElement("btn_rerender").disabled = false;

        getElement("div_action_btns").style.display = "inline-block";

        drawSpace(jsonObj,jsonObj.max_y+1000,false);
        //

        //getElement("curSpace").src = "./icons/" + 13 + ".png"
        
    }
    fr.readAsText(e.target.files[0]);
    filename = e.target.files[0].name
    document.getElementById("a_export").download = filename + ".png";
}

getElement("curSpace").onload = function(){
    canCtx.drawImage(getElement("curSpace"),0,0,10,10);
}

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

async function drawPath(curPt,prevCode){
    let linkedSpaces = curPt.ms_link.split(' ');

    // Iterate over linked space, in case of split path
    for(let i=0; i<linkedSpaces.length; i++) {
        let nextPt = spacesList[linkedSpaces[i]];
        if(nextPt===undefined){
            console.log("Next space: " + linkedSpaces[i] + "=undefined. Returning")
            return;
        }
        
        // Draw line between current space and next space
        can2Ctx.beginPath();
        can2Ctx.moveTo(
            ((Number(curPt.x)+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
            ((Number(curPt.z)+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod
        );
        can2Ctx.lineTo(
            ((Number(nextPt.x)+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
            ((Number(nextPt.z)+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod
        );
        can2Ctx.lineWidth = 10;
        //can2Ctx.strokeStyle = lineColors[i%3];
        can2Ctx.stroke();
        if(i!=0 && prevCode==0){
            console.log(prevCode + " >> " + i)
            prevCode = i;
        }
        console.log(linkedSpaces + " " + prevCode)
        // Recursively continue drawing branch paths from the next point
        await drawPath(nextPt,prevCode);
    }
}

/**
 * DEPRECATED: only able to draw paths with no split.
 */
function showPath_legacy(){
    const spacesNameList = Object.keys(spacesList)
    
    var curPt = spacesList[spacesNameList[0]]
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
// ON Click event
getElement("2ndCanvas").onclick = evt => {
    // IDK why it is 1.025 but the pointer will be inaccurate if I dont add it
    var evtX = (evt.pageX - getElement("2ndCanvas").offsetLeft)*SIZE_MOD*1.025/size_reduce_mod/style_size_mod;
    var evtY = (evt.pageY - getElement("2ndCanvas").offsetTop )*SIZE_MOD*1.025/size_reduce_mod/style_size_mod;
    console.log(evtX + " " + evtY)

    if(debug)
        getElement("2ndCanvas").getContext("2d").fillRect(evtX,evtY,25,25);

    for (const [key, props_space] of Object.entries(spacesList)) {
        //console.log((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50 + " " + (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)
        // IF clicked on a space
        if(
            evtX > ((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50                    )/size_reduce_mod && // Check X Pos
            evtX < ((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50+(50*space_size_mod))/size_reduce_mod &&
            evtY > ((Number(props_space.z)+min_z)*SPACE_DIST_MOD+50                    )/size_reduce_mod && // Check Y Pos
            evtY < ((Number(props_space.z)+min_z)*SPACE_DIST_MOD+50+(50*space_size_mod))/size_reduce_mod
        ){
            console.log(key)
            console.log(props_space)
        }
    }
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
}
getElement("inp_canvas_space_size_mod").onchange = () => {
    space_size_mod = getElement("inp_canvas_space_size_mod").value;
}