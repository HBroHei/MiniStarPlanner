function save(){
    alert("This functionality will be available soon!")
}

function save_() {
    for(const [space,spaceName] in spacesList){
        // Update max / min value
        jsonObj.min_x = Math.min(space.x, jsonObj.min_x);
        jsonObj.max_x = Math.max(space.x, jsonObj.max_x);
        jsonObj.min_y = Math.min(space.y, jsonObj.min_y);
        jsonObj.max_y = Math.max(space.y, jsonObj.max_y);
        jsonObj.min_z = Math.min(space.z, jsonObj.min_z);
        jsonObj.max_z = Math.max(space.z, jsonObj.max_z);

        var pathArray = space.path.split("/");
        var newObj = {};

        // Reconstruct the json obj path
        // TODO Unfinished: put newObj into the main jsonObj
        pathArray.reduce(function(node, path) {
            return node[path] = {}
        }, newObj)

        jsonObj.Nodes[spaceName] = {
            ms_type: space.ms_type,
            ms_attribute: space.ms_attribute,
            ms_link: space.ms_link,
            ms_camera: space.ms_camera,
            ms_free8: space.ms_free8,
            x: space.x,
            y: space.y,
            z: space.z,
        };
    }

    return jsonObj;
}

getElement("jFile").onchange = function(e){
    var fr = new FileReader();
        
    fr.onload = function(){
        canCtx.clearRect(0,0,canCtx.canvas.width,canCtx.canvas.height)
        can2Ctx.clearRect(0,0,can2Ctx.canvas.width,can2Ctx.canvas.height)
        can3Ctx.clearRect(0,0,can3Ctx.canvas.width,can3Ctx.canvas.height)
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
        getElement("3rdCanvas").style.width   = styleWidth;
        getElement("3rdCanvas").style.height  = styleHeight;

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
        can3Ctx.canvas.width  = canvasWidth;
        can3Ctx.canvas.height = canvasHeight;
        min_x = jsonObj.min_x*-1.5;
        min_z = jsonObj.min_z*-1.5;
        console.log(getElement("mainCanvas").style.width + " " + canCtx.canvas.width);
        /**/

        // Set Y filter max
        getElement("inp_y_filter").max =   (jsonObj.max_y+200)/size_reduce_mod;
        getElement("inp_y_filter").min =   (jsonObj.min_y-200)/size_reduce_mod;
        getElement("inp_y_filter").value = (jsonObj.max_y+10 )/size_reduce_mod;
        //getElement("lbl_y_filter_val").textContent = getElement("inp_y_filter").value;
        getElement("inp_y_filter").disabled = false;
        getElement("btn_rerender").disabled = false;
        getElement("btn_save").disabled = false;

        getElement("div_action_btns").style.display = "inline";

        drawSpace(jsonObj,jsonObj.max_y+1000,"",false);
        //

        //getElement("curSpace").src = "./icons/" + 13 + ".png"
        
    }
    fr.readAsText(e.target.files[0]);
    filename = e.target.files[0].name
    document.getElementById("a_export").download = filename + ".png";
    // Set the file name
    getElement("lbl_curFile").textContent = "Opened: " + filename;
}