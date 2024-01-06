
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

const lineColors = [
    "Red","Green","Blue"
]

//
//TODO Make option to scale the map
//

async function drawSpace(node, max_render_y,isRecursive){
    let keyList = Object.keys(node);

    if(isRecursive)
        document.getElementById("load_filter").style.display = "block";

    for(const key of keyList){
        console.log("Loading " + key)
        if(typeof node[key]=="object"){ // If the object is not the space list
            await drawSpace(node[key],max_render_y,true);
            console.log("waited for " + key);
        }
        else if(key=="__dummy__"){
            continue;
        }
        else if(key.indexOf("max_")!=-1 || key.indexOf("min_")!=-1){
           
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
            //console.log(props_space)

            spacesList[key] = props_space;

            if(typeof props_space.ms_type!=="undefined"){
                //console.log(props_space)
                if(props_space.y>=max_render_y){
                    console.log("Skipping: " + props_space.y + ">" + max_render_y)
                    continue;
                }

                await fetch("./icons/" + props_space.ms_type + ".png").then((r)=>{
                    if(r.status==404){
                        console.log("Warning: File returned 404, skipping")
                        return;
                    }
                    var drawSpaceImg = new Image();
                    drawSpaceImg.src = "icons/" + props_space.ms_type + ".png"

                    // Draw the space on the canvas
                    drawCanvasSpaceIcon(
                        drawSpaceImg,
                        ((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50)/size_reduce_mod,
                        Number(props_space.y)/size_reduce_mod,
                        ((Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)/size_reduce_mod,
                        50,50
                    )

                    //debugDrawRect((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50,(Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)

                    can2Ctx.save();
                }).catch((err)=>{
                    console.log(err)
                })
                // Check the space will be converted to a Bowser space
                // FFFF FFFF 8000 0000 in Hex
                if(props_space.ms_attribute=="-2147483648"){
                    var toBowserSpaceImg = new Image();
                        toBowserSpaceImg.src = "icons/to37.png"
                        // Draw the space on the canvas
                        drawSecCanvasSpaceIcon(
                            toBowserSpaceImg,
                            (Number(props_space.x)+min_x)*SPACE_DIST_MOD+50,
                            Number(props_space.y),
                            (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50,
                            50,50
                        )
                        
                } 
                
            }

            //getElement("curSpace").src = "./icons/" + props_space.ms_type + ".png"
        }
    }

    if(isRecursive)
        getElement("load_filter").style.display = "none";

    document.getElementById("a_export").href = getElement("mainCanvas").toDataURL("image/png").replace("image/png", "image/octet-stream");
}


getElement("jFile").onchange = function(e){
    var fr = new FileReader();
        
    fr.onload = function(){
        jsonObj = JSON.parse(fr.result);

        //console.log(jsonObj.max_x*1.5 + "-" + jsonObj.min_x*1.5)

        // Initalise this variable in case of oversizing
        size_reduce_mod = 1;

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

function showPath(){
    const spacesNameList = Object.keys(spacesList)
    
    var curPt = spacesList[spacesNameList[0]]
    var i=0;
    do{
        can2Ctx.beginPath();
        can2Ctx.moveTo(Number(curPt.x)*1.5+min_x+50,Number(curPt.z)*1.5+min_z+50)
        i++;
        //console.log(Number(curPt.x)*1.5+min_x+50,Number(curPt.z)*1.5+min_z+50)
        curPt = spacesList[curPt.ms_link]
        can2Ctx.lineTo(Number(curPt.x)*1.5+min_x+50,Number(curPt.z)*1.5+min_z+50)
        //console.log(Number(curPt.x)*1.5+min_x+50,Number(curPt.z)*1.5+min_z+50)
        can2Ctx.lineWidth = 10;
        //console.log(lineColors[i%3])
        can2Ctx.strokeStyle = lineColors[i%3]
        //console.log(can2Ctx.strokeStyle)
        can2Ctx.stroke();
        //can2Ctx.closePath();
        console.log(curPt.ms_link)
    }while(curPt.ms_link!=" ")
    //can2Ctx.closePath()
}

// ON Click event
getElement("2ndCanvas").onclick = evt => {
    // IDK why it is 1.025 but the pointer will be inaccurate if I dont add it
    var evtX = (evt.pageX - getElement("2ndCanvas").offsetLeft)*SIZE_MOD*1.025/size_reduce_mod/style_size_mod;
    var evtY = (evt.pageY - getElement("2ndCanvas").offsetTop )*SIZE_MOD*1.025/size_reduce_mod/style_size_mod;
    console.log(evtX + " " + evtY)

    if(debug)
        getElement("2ndCanvas").getContext("2d").fillRect(evtX,evtY,50,50);

    for (const [key, props_space] of Object.entries(spacesList)) {
        //console.log((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50 + " " + (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)
        // IF clicked on a space
        if(
            evtX > ((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50   )/size_reduce_mod && // Check X Pos
            evtX < ((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50+50)/size_reduce_mod &&
            evtY > ((Number(props_space.z)+min_z)*SPACE_DIST_MOD+50   )/size_reduce_mod && // Check Y Pos
            evtY < ((Number(props_space.z)+min_z)*SPACE_DIST_MOD+50+50)/size_reduce_mod
        ){
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