# MiniStarPlanner
 A Mario Party 9 board space layout viewer \
 Currently still in development, but I figured to release this for other's convenient sake (Although MP9 modding isn't very active)

## How to use
 1. Open the board space BRRES file (should be located in common/bd0#, and contains `mass` in its name) with BrawlCrate \
 (Skip Step 2 and 3 if the plugin is already installed)
 2. Move the folder `MP9BoardExporter` to BrawlCrate's plugin folder (In BrawlCrate > Tools > Open API Folder > Plugins)
 3. Reload BrawlCrate plugins (Tools > Reload Plugins)
 4. Navigate to the mdl0 file in the BRRES file (Located in the 3DModel folder), and highlight (select) it
 5. Export the spaces to a JSON file by going to Plugin > MP9BoardExporter > export_board. Choose the folder that the JSON file will be exported to
 6. Open the [viewer](https://hbrohei.github.io/MiniStarPlanner), and choose the exported JSON file.
