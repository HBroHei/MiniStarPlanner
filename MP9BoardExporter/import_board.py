__author__ = "HammerBroHei"
__version__ = "1.0.0"

# Ref / docs: soopercool101.github.io/BrawlCrate

from BrawlCrate.API import *
from BrawlLib.SSBB.ResourceNodes import *
from BrawlLib.SSBB import UserDataClass
from BrawlLib.SSBB.Types import *
from System.IO import *
from System.Collections.Generic import List

from copy import deepcopy

nodeList = {"Nodes" : {}}

range_x = [0,0]
range_y = [0,0]
range_z = [0,0]

SAMPLE_NODE = None

def printDebug(msg):
    BrawlAPI.ShowMessage(str(msg),"DEBUG")

def printMsg(msg,title="Message"):
    BrawlAPI.ShowMessage(str(msg),title)

# import sys
# printDebug(sys.version_info)

def toKeyVal(kv_pair):
    return kv_pair.Key, kv_pair.Value

def add_node(name,data,parent):
    new_bone_node = SAMPLE_NODE.Clone()
    new_bone_node.Name = name
    # Check if it is actually a node
    if "ms_type" in data:
        new_bone_node.Translation._x = float(data["x"])
        new_bone_node.Translation._y = float(data["y"])
        new_bone_node.Translation._z = float(data["z"])

        for kv_pair in data:
            k_name, dat = toKeyVal(kv_pair)
            # Check if it has been added
            if k_name not in ["x","y","z"]:
                i_dat = dat
                if type(dat)==str:
                    i_dat = tuple([dat])
                else:
                    i_dat = tuple(dat)
                # if type(dat)==str:
                #     i_dat = int(dat)
                # else:
                #     i_dat = dat
                # Add new User Data
                user_data = UserDataClass()
                user_data.Name = k_name
                user_data.DataType = 0
                user_data.Entries = i_dat
                new_bone_node.UserEntries.Add(user_data)

    else:
        # Add children to the node
        for kv_pair in data:
            key, dat = toKeyVal(kv_pair)
            add_node(key,dat,new_bone_node)
    # Add to parent
    parent.AddChild(new_bone_node)

def process_node(node_dict, base_node):
    global SAMPLE_NODE
    # First check what type of node it is
    if (base_node.Name in node_dict) and base_node.HasChildren: 
        # Oh hey it is the bone group we want to replace!
        # Take 1 sample node
        #printDebug(base_node.Children.Count)
        SAMPLE_NODE = base_node.Children[0].Clone()
        # DELETE ALL FIRST
        base_node.Children.Clear()
        #printDebug("Process: " + base_node.Name)
        # Add back the edited nodes
        for kv_pair in node_dict[base_node.Name]:
            key, dat = toKeyVal(kv_pair)
            add_node(key, dat, base_node)
        pass
    elif base_node.HasChildren:
        #printDebug(base_node.Name)
        # Parent node - recursive it up
        # NOTE Might turn it into iteratve later
        for child_node in base_node.Children:
            process_node(node_dict, child_node)
    else:
        printMsg("No suitable for " + base_node.Name)
        


def import_node(json_file):
    # https://stackoverflow.com/questions/26591740/parse-json-file-with-ironpython-2-5
    # Parse JSON file
    import clr
    clr.AddReference('System.Web.Extensions')
    from System.Web.Script.Serialization import JavaScriptSerializer
    obj = dict(JavaScriptSerializer().DeserializeObject(json_file))

    for bone_list in BrawlAPI.SelectedNode.FindChild("Bones").Children:
        process_node(obj["Nodes"], bone_list)

    printMsg("Done importing")
    if not BrawlAPI.SaveFile(): printMsg("Save failed")
    else: printMsg("Save completed. Please close BrawlCrate and reopen the file for further edits")

    # Inject back to the MDL0Node
    

    pass

import_loc = BrawlAPI.OpenFileDialog("Select JSON file location","JSON files (*.json)|*.json|All files (*.*)|*.*")
if import_loc=="":
    pass
# Check if the node is the root node. If yes, iterate through every mdl0 nodes
elif isinstance(BrawlAPI.SelectedNode,BRRESNode):
    printMsg("Selected node is not a Bone Tree. Please select other list.")
elif isinstance(BrawlAPI.SelectedNode, MDL0Node):
    # printDebug(type(BrawlAPI.SelectedNode))
    f = open(import_loc, encoding="utf-8")
    import_node(f.read())
