//=============================================================================
// Addition to YEP plugin "Item Core", made by JakeMSG
// JakeMSG_YEP_ItemCoreAdditions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_ItemCoreAdditions = true;

var Yanfly = Yanfly || {};
Yanfly.Item_JakeMSGAdd = Yanfly.Item_JakeMSGAdd || {};
Yanfly.Item_JakeMSGAdd.version = 1.0;

//=============================================================================
 /*:
 * @plugindesc v1.0 (Requires YEP_ItemCore.js) Additions to the base
 * Item Core yanfly Plugin
 * @author JakeMSG
 *
 * 
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_ItemCore.
 * Make sure this plugin is located under YEP_ItemCore in the plugin list.
 *
 * This plugin simply deals with the Save bloat the Independent items can
 * create, by adding a check on making a Save that checks if any independent
 * item is unused (not equipped and also not in party inventory).
 * 
 * Normally, Yanfly handles this internally by adding this check on using the 
 * normal Shop menu, but if you remove independent items through other means
 * (Script calls, other Plugins), you circumvent the normal check, thus 
 * requiring this new check from this Addition
 * 
 * COMPATIBLE WITH:
 * ---- PH_Warehouse
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.05:
 * - Fixed an issue that made the Plugin's parameters not doing anything (not hiding the costs)
 * 
 * Version 1.00:
 * - First release of Plugin.
 */
//=============================================================================




if (Imported.YEP_ItemCore) {

//=============================================================================
// GLOBAL
//=============================================================================

// ======== Compatibility with PH_Warehouse => This function checks, for the given item id (and its specific "categ"), if it exists in any existing Warehouses
// ==== First, we check if the Plugin exists / is enabled
if ($plugins.find(plugin => plugin.name == "PH_Warehouse")) {
    if ($plugins.find(plugin => plugin.name == "PH_Warehouse").status) {
        var PHWarehouse_allWarehouses_hasItemsBool = function(id,categ) {
                for (var wh_name in PHPlugins.PHWarehouse._warehouses) {
                    if(PHPlugins.PHWarehouse._warehouses.hasOwnProperty(wh_name)) {
                        if(PHPlugins.PHWarehouse._warehouses[wh_name].items[categ].indexOf(id) > -1) return true;
                    }
                }
                return false;
        };
    }
}
// ======== Checks, per each independent item type, if it's equipped / held by the Party (if it's neither, it's an empty entry that needs to be deleted)
// ==== Compatibility with PH_Warehouse => Will also check all the existing Warehouses if the item is in them
var removeUnusedItem_Items = function(item) {
    if (item){
        // ==== First, we check if the Plugin exists / is enabled
        if ($plugins.find(plugin => plugin.name == "PH_Warehouse")){
            if ($plugins.find(plugin => plugin.name == "PH_Warehouse").status){
                if (PHWarehouse_allWarehouses_hasItemsBool(item.id,'item'))
                    return 0;
            }
        }
        if ($gameParty.hasItem(item)) return 0;
        // ==== If it got to this point (no Return used), then it can remove the Independent Item
        DataManager.removeIndependentItem(item);
    }
};
var removeUnusedItem_Weapons = function(item) {
    if (item){
        // ==== First, we check if the Plugin exists / is enabled
        if ($plugins.find(plugin => plugin.name == "PH_Warehouse")){
            if ($plugins.find(plugin => plugin.name == "PH_Warehouse").status){
                if (PHWarehouse_allWarehouses_hasItemsBool(item.id,'weapon')){
                    return 0;
                }
            }
        }
        if ($gameParty.hasItem(item)) return 0;
        // ==== If it got to this point (no Return used), then it can remove the Independent Item
        DataManager.removeIndependentItem(item);
    }
};
var removeUnusedItem_Armors = function(item) {
    if (item){
        // ==== First, we check if the Plugin exists / is enabled
        if ($plugins.find(plugin => plugin.name == "PH_Warehouse")){
            if ($plugins.find(plugin => plugin.name == "PH_Warehouse").status){
                if (PHWarehouse_allWarehouses_hasItemsBool(item.id,'armor'))
                    return 0;
            }
        }
        if ($gameParty.hasItem(item)) return 0;
        // ==== If it got to this point (no Return used), then it can remove the Independent Item
        DataManager.removeIndependentItem(item);
    }
};


//=============================================================================
// DataManager
//=============================================================================

Yanfly.Item_JakeMSGAdd.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    // ==== Goes in to check, for each item type that can be independent, if it's present in the Warehouse
    // == Separated on types for compatibility with Warehouse/Storage plugins (when such compatibility is added by me)
    this._independentItems.forEach(removeUnusedItem_Items);
    this._independentWeapons.forEach(removeUnusedItem_Weapons);
    this._independentArmors.forEach(removeUnusedItem_Armors);

    var contents = Yanfly.Item_JakeMSGAdd.DataManager_makeSaveContents.call(this);
    return contents;
};


//=============================================================================
// Utilities
//=============================================================================

Yanfly.Util = Yanfly.Util || {};

if (!Yanfly.Util.toGroup) {
    Yanfly.Util.toGroup = function(inVal) {
        return inVal;
    }
};

//=============================================================================
// End of File
//=============================================================================
};
