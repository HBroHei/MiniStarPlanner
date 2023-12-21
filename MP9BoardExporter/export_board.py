__author__ = "HBroHei"
__version__ = "0.0.1"

#soopercool101.github.io

from BrawlCrate.API import *
from BrawlLib.SSBB.ResourceNodes import *
from BrawlLib.SSBB.Types import *
from System.IO import *

nodeList = {}

nodeJsonStr = "\"Nodes\":{"
range_x = [0,0]
range_y = [0,0]
range_z = [0,0]

def openChildNode(rNode,isRecursed = False):
    global nodeJsonStr
    if len(rNode.Children)!=0:
        nodeJsonStr += "{"
        for cNode in rNode.Children:
            nodeJsonStr += "\"" + cNode.Name + "\" :"
            openChildNode(cNode,True) 
            nodeJsonStr += ",\n"
        nodeJsonStr += "\"__dummy__\":\"\""
        
        nodeJsonStr += "}"
    else:
        nodeJsonStr += "\""
        for prop in rNode.UserEntries:
            nodeJsonStr += str(prop) + ";"
        nodeJsonStr += "x:" + str(rNode.Translation._x) + ";y:" + str(rNode.Translation._y) + ";z:" + str(rNode.Translation._z) + ";"
        nodeJsonStr += "\""
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

try:
    selectedNodeBones = BrawlAPI.SelectedNode.AllBones  # https://soopercool101.github.io/BrawlCrate/class_brawl_lib_1_1_s_s_b_b_1_1_resource_nodes_1_1_m_d_l0_bone_node.html
except:
    BrawlAPI.ShowError("Error: make sure you have selected the mdl0 node","Message")
    exit()
selectedNodeFirstBones = BrawlAPI.SelectedNode.BoneList

listUserEntries = ""
i = 0

exportLoc = BrawlAPI.OpenFolderDialog("Select export location")

for ele in selectedNodeFirstBones:
    nodeJsonStr += "\"" + ele.Name + "\" : "
    openChildNode(ele)

'''
for boneNode in selectedNodeBones:
    listUserEntries += boneNode.Name + ":\""
    nodeList[boneNode.Name] = []
    for prop in boneNode.UserEntries:
        listUserEntries += str(prop) + ";"
    listUserEntries += "\",\n"
'''

nodeJsonStr += "},\"max_x\":" + str(range_x[1])
nodeJsonStr += ",\"min_x\":" + str(range_x[0])
nodeJsonStr += ",\"max_y\":" + str(range_y[1])
nodeJsonStr += ",\"min_y\":" + str(range_y[0])
nodeJsonStr += ",\"max_z\":" + str(range_z[1])
nodeJsonStr += ",\"min_z\":" + str(range_z[0])

fUEdata = open(exportLoc + "\\" + str(BrawlAPI.SelectedNode)+".json","w")
fUEdata.write("{"+nodeJsonStr+"}")
fUEdata.close()

BrawlAPI.ShowMessage("File Exported","Message")