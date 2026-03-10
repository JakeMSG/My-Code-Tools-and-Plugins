/*:
 * @plugindesc The basic Iavra Note Files functionality + Global Default Notetags!
 * Global Default Notetags: Allows to set up Default Global Notetags, that are Prepended for each entry of its specific data type.
 * Each Data Type will have its own Global Notetags to be set.
 * Prepending the Notetags makes it behave like a "Default" to the notetags (adding similar notetags manually in a data entry
 * generally results in overwritting the similar tag used above it; thus, overwritting tags Prepended to that data entry).
 * Note: This "Prepended" notetags will be above any other notetags, including ones from Iavra Note Files functionality!
 * 
 * Iavra Note Files default functionality: Allows to store notetags in text files and reference them from database objects and events.
 * 
 * <Iavra Note Files>
 * @author JakeMSG
 *
 * @param Global File Path
 * @desc Path of the file to load the default notetags (format given in example file). Default: js/plugins/Specific Plugin Settings/GlobalDefaultNotetags.json
 * @default js/plugins/Specific Plugin Settings/GlobalDefaultNotetags.json
 * 
 * @param Global Ignore Notetag
 * @desc Tag used to Manually disable Global Default Notetags for a specific Data Entry (Case Sensitive). Default: "GDNignore"
 * @default GDNignore
 *
 * @param Dedicated (Iavra) File Path
 * @desc Path of the file to load. Multiple files can be specified when separated by commas. Default: data/notes.json
 * @default js/plugins/Specific Plugin Settings/Notes.json
 *
 * @param Notetag name for Dedicated Notetags
 * @desc Tag used to load metadata from files. (advice: don't use "textnote" or other generic names, it could conflict with other plugins!) Default: INFnote
 * @default INFnote
 * 
 * @help
 * Note: This plugin has to be placed below everything else that deals with DataManager.extractMetadata().
 * (Currently incompatible with Iavra Note Files, I'll soon fix this)
 *
 * Create one or more files and store their locations inside the "File Path" parameter, separated by comma. The
 * files are formatted like this:
 *
 *  {
 *       "GDN_Actors" : "",
 *       "GDN_Classes" : "", 
 *       "GDN_Skills" : "", 
 *       "GDN_Items" : "", 
 *       "GDN_Weapons" : "", 
 *       "GDN_Armors" : "", 
 *       "GDN_Enemies" : "", 
 *       "GDN_States" : "", 
 *       "GDN_Tilesets" : "", 
 *       "GDN_Map" : "",
 *       "GDN_MapEvents" : ""
 *  }
 * 
 * Don't change the name of those Keys! (only change their values, the "" of each of them)
 * 
 * JSON itself doesn't allow real linebreaks inside Strings, but you can use an array, instead, which will automatically
 * be converted to a single String with linebreaks. Example:
 * 
 *       "GDN_Map" : [
 *           "",
 *           "",
 *           ""
 *       ],
 *
 * You can also write the above in one line, so long as you enclose everything between "[]" brackets.
 * 
 * Also, if you use characters that need to be escaped, don't forget to escape them with a "\" before them 
 * (eg: "\c[4]" should be written "\\c[4]")
 * 
 * 
 * For specific Data Entries that you don't want to follow the Global Default Notetags (and where you don't manually set another
 * similar notetag), use the Global Ignore Notetag that you've set in the Plugin's Parameters (default is "GDN Ignore")
 * 
 */

var Imported = Imported || {};
Imported.JakeMSG_Alterations_GDN = true;

//=============================================================================
// namespace IAVRA
//=============================================================================

var IAVRA = IAVRA || {};

var JakeMSG = JakeMSG || {};
JakeMSG.Alterations_GDN = JakeMSG.Alterations_GDN || {};
JakeMSG.Alterations_GDN.version = 1.13;

(function() {
    "use strict";
    
    /**
     * Load plugin parameters. We don't use the PluginManager to be independent from our file name.
     */
    var _params = $plugins.filter(function(p) { return p.description.contains('<Iavra Note Files>'); })[0].parameters;
    
    /**
     * All files to be loaded. We use an object for two reasons. 1) It automatically eliminates duplicate entries. 2) We
     * need a way to keep track of all files that have already been loaded.
     */

    // ==== This one's for the GDN side
    var _GDNfiles = _params['Global File Path'].split(/\s*,\s*/).reduce(function(map, file) {
        !file || (map[file] = false); return map;
    }, {});

    // ==== This one's for the Iavra Note Files (INF) side
    var _INFfiles = _params['Dedicated (Iavra) File Path'].split(/\s*,\s*/).reduce(function(map, file) {
        !file || (map[file] = false); return map;
    }, {});
    
    /**
     * The notetag, that should be used to ignore Global Notetags manually for specific data entries
     */
    // ======== Strictly GDN
    var _globalIgnore = new RegExp('<[ ]*' + _params['Global Ignore Notetag'] + '[ ]*>', 'g');
   
    /**
     * The notetag, that should be replaced with the loaded data.
     */
    // ======== Strictly INF
    var _regex = new RegExp('<[ ]*' + _params['Notetag name for Dedicated Notetags'] + '[ ]+(.+?)[ ]*>', 'g');
    


    /**
     * Holds the content of all loaded files.
     */
    // ==== GDN side
    var _GDNdata = {};
    // ==== INF side
    var _INFdata = {};

    /**
     * Holds all callbacks to be executed, once the plugin has finished loading files.
     */
    // ==== GDN side
    var _GDNlisteners = [];
    // ==== INF side
    var _INFlisteners = [];

    /**
     * If any file isn't loaded yet, this returns false. Otherwise it returns true. We do this by testing if any file has
     * not yet finished loading and returning the inverse of it, since Array.some could be faster than Array.every for a
     * lot of files, since it only has to run until it encounters the first unloaded file and not all of them.
     */

    // ==== GDN side
    var isGDNReady = function() {
        return !Object.keys(_GDNfiles).some(function(key) { return !_GDNfiles[key]; });
    };
    // ==== INF side
    var isINFReady = function() {
        return !Object.keys(_INFfiles).some(function(key) { return !_INFfiles[key]; });
    };
    // ==== both sides
    var isReady = function() {
        // ==== Combined the 2 of them so that it shows "not ready" if either of the files are not loaded yet
        //return !Object.keys(_GDNfiles).some(function(key) { return !_GDNfiles[key]; });
        //return !Object.keys(_INFfiles).some(function(key) { return !_INFfiles[key]; });
        return !(Object.keys(_GDNfiles).some(function(key) { return !_GDNfiles[key]; }) || Object.keys(_INFfiles).some(function(key) { return !_INFfiles[key]; }) );
    };

    /**
     * Async loads a file, while keeping trace of all files not yet loaded and merges the contained JSON objects in
     * a single data variable to allow for easy access. When a file gets loaded, we test if we are done loading and execute
     * all listeners that have been registered in the meantime.
     */

    // ======== GDN side
    var GDNloadFile = function(file) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file);
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
            _GDNfiles[file] = true;
            var result = JSON.parse(xhr.responseText);
            for(var key in result) {
                _GDNdata[key] = Array.isArray(result[key]) ? result[key].join('\n') : result[key];
            };
            if(isGDNReady()) { 
                while (_GDNlisteners.length > 0) {
                    var listener = _GDNlisteners.shift();
                    listener();
                }
            };
        };
        xhr.onerror = function() { throw new Error("There was an error loading the file '" + file + "'."); };
        xhr.send();
    };
    
    // ======== INF side
    var INFloadFile = function(file) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file);
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
            _INFfiles[file] = true;
            var result = JSON.parse(xhr.responseText);
            for(var key in result) {
                _INFdata[key] = Array.isArray(result[key]) ? result[key].join('\n') : result[key];
            };
            if(isINFReady()) { 
                while (_INFlisteners.length > 0) {
                    var listener = _INFlisteners.shift();
                    listener();
                }
            };
        };
        xhr.onerror = function() { throw new Error("There was an error loading the file '" + file + "'."); };
        xhr.send();
    };

    /**
     * Since our note files start loading at the same time game data is loaded, we need to somehow make it stop 
     * processing, until we are done. We do this be adding a loadListener, which is executed after we are done. This
     * also means, that this plugin has to be placed below everything else that aliases DataManager.extractMetadata.
     */

    // ==== GDN side
    var GDN_addLoadListener = function(callback) {
        isGDNReady() ? callback() : _GDNlisteners.push(callback);
    };

    // ==== INF side
    var INF_addLoadListener = function(callback) {
        isINFReady() ? callback() : _INFlisteners.push(callback);
    };

    /**
     * Recursively replaces all occurrences of our own notetag with the loaded data. Make sure to not have cyclic
     * references or this will cause your game to crash.
     */
    // ======== Strictly INF
    var replace = function(note) {
        if(_regex.test(note)) {
            return replace(note.replace(_regex, function(match, key) { return _INFdata[key] || ''; }));
        }
        return note;
    };  

    
    /**
     * The Function to Prepend the Tags
     */
    // ======== Strictly GDN
    var GDNprepend = function(note, dataType) {
        // ==== Adds the Global Default Notetags, UNLESS you specify the Global Ignore tag.
        if(!_globalIgnore.test(note)) {
            // ==== Adds the proper Global Default Notetags for each Data Type 
            switch (dataType) {
                case "MapEvents": return _GDNdata['GDN_MapEvents'] + note;

                case "Actor": return _GDNdata['GDN_Actors'] + note;
                case "Classes": return _GDNdata['GDN_Classes'] + note;
                case "Skills": return _GDNdata['GDN_Skills'] + note;
                case "Items": return _GDNdata['GDN_Items'] + note;
                case "Weapons": return _GDNdata['GDN_Weapons'] + note;
                case "Armors": return _GDNdata['GDN_Armors'] + note;
                case "Enemies": return _GDNdata['GDN_Enemies'] + note;
                case "States": return _GDNdata['GDN_States'] + note;
                case "Tilesets": return _GDNdata['GDN_Tilesets'] + note;
                case "Map": return _GDNdata['GDN_Map'] + note;
            }
        }
        // ==== This "return" only runs if the Global ignore tag is found
        return note;
    };

// ==== Using ".onLoad" method since it can differenciate between data types
// == The current implementation essentially emulates ".extractMetadata" via a custom Method, but using the ".onLoad" to find the data type

// ================ Strictly GDN
JakeMSG.Alterations_GDN.DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function(object) {
    var array;
    var objectTypeGDN = "_";
    
    if (object === $dataMap) {
        // ==== Maps are separate files for each map, that's why they don't need to be iterated through an Array
        objectTypeGDN = "Map";
        this.GDN_TagPrepend(object, objectTypeGDN);
        // ==== Map Events have their own Notes, thus we keep this in mind for the array iteration
        objectTypeGDN = "MapEvents";
        array = object.events;
    } else {
        array = object;
    }
    if (Array.isArray(array)) {
        // ==== Doing the Object check before the Array iteration, and saving the Object type in "objectTypeGDN"
        if (objectTypeGDN == "MapEvents") {
            // ==== MapEvents have been found from previously, on $dataMap
        } else {
            if (object === $dataActors) {objectTypeGDN = "Actors";}
            else if (object === $dataClasses) {objectTypeGDN = "Classes";}
            else if (object === $dataSkills) {objectTypeGDN = "Skills";}
            else if (object === $dataItems) {objectTypeGDN = "Items";}
            else if (object === $dataWeapons) {objectTypeGDN = "Weapons";}
            else if (object === $dataArmors) {objectTypeGDN = "Armors";}
            else if (object === $dataEnemies) {objectTypeGDN = "Enemies";}
            else if (object === $dataStates) {objectTypeGDN = "States";}
            else if (object === $dataTilesets) {objectTypeGDN = "Tilesets";}
        }
        // ==== Now we iterate through the Array, using the saved Data type for our custom method "GDN_TagPrepend"
        for (var i = 0; i < array.length; i++) {
            var data = array[i];
            if (data && data.note !== undefined) {
                this.GDN_TagPrepend(data, objectTypeGDN);
            }
        }
    }
    // ==== No need for "$dataSystem" or "$dataMapInfos" since those are data Types with only 1 entry each 

    // ==== Now we continue with the standard ".onLoad" method (our instructions come first to Prepend the Tags before anything else)
    JakeMSG.Alterations_GDN.DataManager_onLoad.call(this, object);
};



    //=============================================================================
    // module DataManager
    //=============================================================================
    
    (function($) {
        
        /**
         * We start loading our text files, when everything else is being loaded.
         */
        // ==== both sides
        var _alias_JakeMSG_GDNINF_loadDatabase = $.loadDatabase;
        $.loadDatabase = function() {
            for(var file in _GDNfiles) { GDNloadFile(file); };
            for(var file in _INFfiles) { INFloadFile(file); };
            _alias_JakeMSG_GDNINF_loadDatabase.call(this);
        };

        // ==== Emulating Iavra's implementation of using Callbacks to Prepend the Tags only after our files are also loaded
        // ==== Strictly GDN
        $.GDN_TagPrepend = function(data, dataType) {
            GDN_addLoadListener(GDN_callback.bind(this, data, dataType));
        }
        
        // ===== Continuing with the Callbacks
        // ==== Strictly GDN
        var GDN_callback = function(data, dataType) {
            data.note = GDNprepend(data.note, dataType);
        };

        /**
         * This function would originally been called the moment a data entry is loaded. However, since we have to wait until
         * our own files are loaded, we register a callback, instead. This also means, that this plugin has to be listed after
         * everything else that deals with DataManager.extractMetadata.
         */
        // ==== Strictly INF
        var _alias_extractMetadata = $.extractMetadata;
        $.extractMetadata = function(data) {
            INF_addLoadListener(callback.bind(this, data));
        };
        
        /**
         * Callback to be executed, once all notetags have been loaded.
         */
        // ==== Strictly INF
        var callback = function(data) {
            data.note = replace(data.note);
            _alias_extractMetadata.call(this, data);
        };
        
    })(DataManager);
    
})();