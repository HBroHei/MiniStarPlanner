__author__ = "HammerBroHei"
__version__ = "1.0.0"

# Ref / docs: soopercool101.github.io/BrawlCrate

from BrawlCrate.API import *
from BrawlLib.SSBB.ResourceNodes import *
from BrawlLib.SSBB.Types import *
from System.IO import *

nodeList = {"Nodes" : {}}

range_x = [0,0]
range_y = [0,0]
range_z = [0,0]

def printDebug(msg):
    BrawlAPI.ShowMessage(str(msg),"DEBUG")

def printMsg(msg,title="Message"):
    BrawlAPI.ShowMessage(str(msg),title)

def processAttribute(user_data_class):
    return_val = {}
    return_val[user_data_class.Name] = user_data_class.Entries if len(user_data_class.Entries)>1 else user_data_class.Entries[0]
    # if len(user_data_class.Entries)>1:
    #     return_val += '{' + ', '.join(user_data_class.Entries) + '}'
    # else:
    #     return_val += "\"" + user_data_class.Entries[0] + "\","
 
    return return_val

def openChildNode(rNode,isRecursed = False):
    returnDict = {}
    if len(rNode.Children)>0:
        for cNode in rNode.Children:
            # Loop and add sub nodes
            returnDict[cNode.Name] = openChildNode(cNode,True) 

        return returnDict
    else:
        for prop in rNode.UserEntries:
            returnDict[prop.Name] = list(prop.Entries) if len(prop.Entries)>1 else prop.Entries[0]
            
        returnDict["x"] = str(rNode.Translation._x)
        returnDict["y"] = str(rNode.Translation._y)
        returnDict["z"] = str(rNode.Translation._z)

        # Check for min/max
        if rNode.Translation._x < range_x[0]:
            range_x[0] = rNode.Translation._x
        elif rNode.Translation._x > range_x[1]:
            range_x[1] = rNode.Translation._x
        if rNode.Translation._y < range_y[0]:
            range_y[0] = rNode.Translation._y
        elif rNode.Translation._y > range_y[1]:
            range_y[1] = rNode.Translation._y
        if rNode.Translation._z < range_z[0]:
            range_z[0] = rNode.Translation._z
        elif rNode.Translation._z > range_z[1]:
            range_z[1] = rNode.Translation._z

        return returnDict

def exportNode(mdl0Node):
    finalDict = {"Nodes":[]}
    # Test if the node is a valid MDL0 node
    try:
        selectedNodeBones = mdl0Node.AllBones  # https://soopercool101.github.io/BrawlCrate/class_brawl_lib_1_1_s_s_b_b_1_1_resource_nodes_1_1_m_d_l0_bone_node.html
    except:
        BrawlAPI.ShowError("Error: make sure you have selected the mdl0 node","Message")
        exit()
    selectedNodeFirstBones = mdl0Node.BoneList

    for ele in selectedNodeFirstBones:
        finalDict["Nodes"].append({ele.Name : openChildNode(ele)})

    finalDict["max_x"] = range_x[1]
    finalDict["min_x"] = range_x[0]
    finalDict["max_y"] = range_y[1]
    finalDict["min_y"] = range_y[0]
    finalDict["max_z"] = range_z[1]
    finalDict["min_z"] = range_z[0]

    # Write the JSON to file
    fUEdata = open(exportLoc + "\\" + str(mdl0Node)+".json","w")
    fUEdata.write(str(finalDict).replace("'","\""))
    fUEdata.close()

    printMsg("File Exported to: " + exportLoc + "\\" + str(mdl0Node)+".json")

##### MAIN CODE #####

exportLoc = BrawlAPI.OpenFolderDialog("Select export location")

# Check if the node is the root node. If yes, iterate through every mdl0 nodes
if isinstance(BrawlAPI.SelectedNode,BRRESNode):
    for mdl0Node in BrawlAPI.SelectedNode.FindChildrenByType("./",ResourceType.MDL0):
        exportNode(mdl0Node)
else:
    exportNode(BrawlAPI.SelectedNode)
