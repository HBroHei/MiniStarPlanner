
var debug = false;

var canCtx = getElement("mainCanvas").getContext("2d");
var can2Ctx = getElement("2ndCanvas").getContext("2d");

//canCtx.canvas.width = 2500;
//canCtx.canvas.height = 2500;

var min_x;
var min_z;

var spacesList = {};

var filename = "";

const SIZE_MOD = 2
const SPACE_DIST_MOD = 2

const lineColors = [
    "Red","Green","Blue"
]

async function drawSpace(node){
    let keyList = Object.keys(node);

    for(const key of keyList){
        console.log("Loading " + key)
        if(typeof node[key]=="object"){
            await drawSpace(node[key]);
            console.log("waited");
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
                await fetch("./icons/" + props_space.ms_type + ".png").then((r)=>{
                    if(r.status==404){
                        return;
                    }
                    var drawSpaceImg = new Image();
                    //console.log(props_space)
                    //console.log((Number(props_space.x)*1.5+min_x)+" "+(Number(props_space.z)*1.5+min_z))

                    drawSpaceImg.src = "icons/" + props_space.ms_type + ".png"

                    // Draw the space on the canvas
                    drawCanvasSpaceIcon(
                        drawSpaceImg,
                        (Number(props_space.x)+min_x)*SPACE_DIST_MOD+50,
                        Number(props_space.y),
                        (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50,
                        50,50
                    )

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
    document.getElementById("a_export").href = getElement("mainCanvas").toDataURL("image/png").replace("image/png", "image/octet-stream");
}


getElement("jFile").onchange = function(e){
    var fr = new FileReader();
        
    fr.onload = function(){
        //console.log(fr.result)
        var jsonObj = JSON.parse(fr.result);

        //console.log(jsonObj.max_x*1.5 + "-" + jsonObj.min_x*1.5)

        /**/
        getElement("mainCanvas").style.width  = (jsonObj.max_x - jsonObj.min_x)*SIZE_MOD + "px";
        getElement("mainCanvas").style.height = (jsonObj.max_z - jsonObj.min_z)*SIZE_MOD + "px";
        getElement("2ndCanvas").style.width   = (jsonObj.max_x - jsonObj.min_x)*SIZE_MOD + "px";
        getElement("2ndCanvas").style.height  = (jsonObj.max_z - jsonObj.min_z)*SIZE_MOD + "px";
        canCtx.canvas.width   = (jsonObj.max_x - jsonObj.min_x)*SIZE_MOD*SPACE_DIST_MOD+/*Extra Padding*/150;
        canCtx.canvas.height  = (jsonObj.max_z - jsonObj.min_z)*SIZE_MOD*SPACE_DIST_MOD+/*Extra Padding*/150;
        can2Ctx.canvas.width  = (jsonObj.max_x - jsonObj.min_x)*SIZE_MOD*SPACE_DIST_MOD+/*Extra Padding*/150;
        can2Ctx.canvas.height = (jsonObj.max_z - jsonObj.min_z)*SIZE_MOD*SPACE_DIST_MOD+/*Extra Padding*/150;
        min_x = jsonObj.min_x*-1.5;
        min_z = jsonObj.min_z*-1.5;
        /**/

        console.log(jsonObj)

        drawSpace(jsonObj)
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
    var evtX = (evt.pageX - getElement("2ndCanvas").offsetLeft)*SIZE_MOD*1.025;
    var evtY = (evt.pageY - getElement("2ndCanvas").offsetTop )*SIZE_MOD*1.025;
    console.log(evtX + " " + evtY)

    if(debug)
        getElement("2ndCanvas").getContext("2d").fillRect(evtX,evtY,50,50);

    for (const [key, props_space] of Object.entries(spacesList)) {
        //console.log((Number(props_space.x)+min_x)*SPACE_DIST_MOD+50 + " " + (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50)
        // IF clicked on a space
        if(
            evtX > (Number(props_space.x)+min_x)*SPACE_DIST_MOD+50 && // Check X Pos
            evtX < (Number(props_space.x)+min_x)*SPACE_DIST_MOD+50+50 &&
            evtY > (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50 && // Check Y Pos
            evtY < (Number(props_space.z)+min_z)*SPACE_DIST_MOD+50+50
        ){
            console.log(props_space)
        }
    }
}