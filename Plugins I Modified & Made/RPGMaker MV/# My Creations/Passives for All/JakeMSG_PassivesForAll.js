//=============================================================================
// JakeMSG_PassivesForAll
// JakeMSG_PassivesForAll.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_PassivesForAll = true;

var JakeMSG = JakeMSG || {};
JakeMSG.PassivesForAll = JakeMSG.PassivesForAll || {};


//=============================================================================
 /*:
 * @plugindesc Adds passive eval timings for owned data entries + visual passives menus in battle.
 * @author JakeMSG
 * v1.1
 *
============ Change Log ============
1.1 - 6.19th.2026
 * Added plugin parameters for setting the size settings for the Description (Help) Window in both menus
 * Removed the stats showing for Party and Enemies (this is already done by the "YEP_X_InBattleStatus" and "JakeMSG_X_InBattleStatus_Additions" plugins)
1.0 - 6.3rd.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 * ======== This plugin adds:
 * ==== Passive eval timings on skills/items/weapons/armors/states/actors/enemies.
 * ==== Visual passives on actors/enemies.
 * ==== In-battle Party Command entries for Party (Visual) Passives and Enemy (Visual) Passives,
 * with optional grouped parent command.
 *
 * ======== Passive evals can be written directly in notetags, or defined in plugin
 * parameters and attached with <Passive: Name> notetag
 *
 * 
 * 
 * 
 * ============================================================================
 * Eval Timing notetags
 * ============================================================================
 * ================================ General Info
 * ================ All Eval Timing Notetags are written between this paired notetags:
 *  <Passives>
 *   
 *  </Passives>
 * ================ Each Eval Timing Notetag is paired, and you write the javascript code in-between it (on separate lines)
 * ======== Eg:
 *  <While Owned> 
 *
 *  </While Owned>
 * 
 * 
 * ================================ For Skills / Items / Weapons / Armors / States:
 * ================ <While Owned>
 *   <While Owned> 
 * 
 *   </While Owned>
 * ======== Triggers Constantly each frame, while the given data entry is owned (in the inventory, or for States, by a Party member)
 * 
 * ================ <On Obtain> 
 *  <On Obtain> 
 * 
 *  </On Obtain>
 * ======== Triggers Once, on obtaining the given data entry
 * 
 * ================ <On Loss> 
 *  <On Loss> 
 * 
 *  </On Loss>
 * ======== Triggers Once, on losing the given data entry
 * 
 * 
 * ================================ For Actors / Enemies:
 * ================ <While Alive>
 *   <While Alive> 
 * 
 *   </While Alive>
 * ======== Triggers Constantly each frame, while the given party/enemy member is Alive
 * 
 * ================ <While Dead>
 *   <While Dead> 
 * 
 *   </While Dead>
 * ======== Triggers Constantly each frame, while the given party/enemy member is Dead
 *
 * ================ <On Death>
 *   <On Death> 
 * 
 *   </On Death>
 * ======== Triggers Once, on the given party/enemy member dying
 *   <On Death> ... </On Death>
 *
 * 
 * ================================ For Weapons / Armors:
 * ================ <While Equipped>
 *   <While Equipped> 
 * 
 *   </While Equipped>
 * ======== Triggers Constantly each frame, while the given data entry is Equipped
 * 
 * ================ <On Equip> 
 *  <On Equip> 
 * 
 *  </On Equip>
 * ======== Triggers Once, on Equipping the given data entry
 * 
 * ================ <On UnEquip> 
 *  <On UnEquip> 
 * 
 *  </On UnEquip>
 * ======== Triggers Once, on UnEquipping the given data entry
 * 
 * 
 * 
 *
 * ============================================================================
 * Helper Variables (inside of Eval Timings script calls)
 * ============================================================================
 * ================================ General Info
 * ================ These helper variables can be used inside eval timings
 * ======== Usually, they are relevant to the specific eval timing, and can help with script calls
 * 
 * 
 * ================================ The Helper Variables
 * ================ "owningMember"
 * ======== owningMember is available in passive eval script calls for:
 * ==== all Skill eval timings
 * ==== all State eval timings
 * ==== from Weapon/Armor timings: While Equipped, On Equip, On UnEquip
 *
 * ======== owningMember value:
 * ==== party member index (starting at 0) for actors
 * ==== troop member index (starting at 0) for enemies
 * ==== -1 when no owning battler exists for the given eval timing
 *
 * 
 * ================ Bonus extra Helper Variables available in eval timings:
 * ==== passiveSource (database object that owns timing)
 * ==== passiveOwner (current battler owner or null)
 * ==== a, user, subject (aliases of passiveOwner)
 * ==== s ($gameSwitches._data), v ($gameVariables._data)
 * ==== timing (timing key string)
 *
 * 
 * 
 * 
 * ============================================================================
 * Visual Passives (Actors + Enemies)
 * ============================================================================
 * ================ Visual passives notetags only apply to Actors and Enemies.
 * ======== They are strictly visual/flavor, useful to show additional info to the Player
 * ======== They are shown in the Party Command options, depending on how you set the Plugin Parameter Settings for their Party Command options
 * ================ They all need to be written inside these notetag pair:
 *   <Visual Passives>
 *     
 *   </Visual Passives>
 * ======== Multiple Visual passives can be written in the same notetag pair for Visual Passives
 * ================ Each one is defined by this notetag pair:
 *     <Name: [Passive Name]>
 *        [Text inside]
 *     </Name>
 * ======== Where:
 * ==== [Passive Name] => The given name for the Passive (try to make it unique)
 * ==== [Text inside] => The text to show in the Visual Passive, can be multiple lines
 * == Works like a MessageBox, so has support for codes like "\V[X]" inside of it
 * == Has similar functionality to how the plugin "JakeMSG_MoreDescriptionsWithConditions" has with its notetags "<Extended Description>", and how the plugin "Olivia_StateTooltipDisplay" works with its notetags "<Help Description>"
 * ================ Inside of each Visual Passive, you can use the following notetags for additional control:
 * ======== <Condition: [javascript_condition_to_evaluate]>
 * ==== [javascript_condition_to_evaluate] => The Javascript condition to check if it's True/False
 * ==== If the condition is False, the rest of the Passive's text (from subsequent lines) will not show
 * ==== You can use multiple <Condition: ...> notetags, and the moment one of the is False, the subsequent text will not show 
 * ======== <Resume>
 * ==== If a preceding "<Condition: ...>" notetag was False, this notetag once again resumes showing text lines after it
 * ======== <Disable IF: [javascript_condition_to_evaluate]>
 * ==== [javascript_condition_to_evaluate] => The Javascript condition to check if it's True/False
 * ==== If this notetag is True, the whole Visual Passive will not show up anymore in lists
 * 
 * ================ Example of visual passive usage:
 *   <Visual Passives>
 *     <Name: Passive Name>
 *       text line
 *       <Condition: javascript_boolean>
 *       text line after condition
 *       <Resume>
 *       <Disable If: javascript_boolean>
 *     </Name>
 * 
 *     <Name: Passive Name 2>
 *       text line
 *     </Name>
 *   </Visual Passives>
 *
 *
 * 
 * 
 * ============================================================================
 * Plugin Parameter-Defined Passives
 * ============================================================================
 * ================ Use Passives1..Passives20 parameter lists.
 * ======== I created multiple separate lists, so that you can organize your Passives as you wish
 *
 * ================ Each Passive entry contains:
 * ======== Name 
 * ==== Used as an identifier for the Passive
 * ==== Also for the Name of its Visual Passive function, if used
 * ======== Eval Timings list 
 * ==== Per each Eval Timing, choose one of 9 timing options
 * == Then, add the Script Call for it
 * ==== The same Passive can have multiple Eval Timings (as added within this list)
 * ======== use as Visual Passive
 * ==== If "True", then this Passive can also be used as a Visual Passive
 * ======== Visual Passive Text
 * ==== This is used if the "use as Visual Passive" was set to True
 * ==== It's used for the text of the Visual Passive
 * ======== Visual Disable Condition
 * ==== The same as using the "<Disable If: ...>" notetag
 *
 * ================ To use any Plugin Parameter-Defined Passive in any data entry (that supports it), use this notetag in them:
 *   <Passive: [Passive Name]>
 * ======== Where [Passive Name] is the Name of the Passive from the Plugin Parameters
 *
 * ================ Data types that can use Plugin Parameter-Defined Passives:
 * ======== Skills, Items, Weapons, Armors, States, Actors, Enemies
 * ==== Certain Eval Timings only support some of these
 * ==== Visual Passives only work for Actors and Enemies
 * 
 * 
 * 
 *
 * ============================================================================
 * In-Battle Menus
 * ============================================================================
 * ================ Based on plugin parameters, the plugin adds:
 * ======== Party Passives command
 * ======== Enemy Passives command
 * ======== optional grouped parent command
 *
 * ================ Party/Enemy passives menus show visual passive names on list window and
 * descriptions on help window.
 *
 * ================ If the plugin "JakeMSG_MoreDescriptionsWithConditions" is installed, its expand-help
 * hotkey works with these descriptions, too
 * 
 * 
 * 
 *
 * ============================================================================
 * Notes
 * ============================================================================
 * - Unknown <Passive: Name> refs are ignored and logged once in console.
 * - Eval errors are caught and logged once per timing/script source.
 * - On Obtain/On Loss for item/weapon/armor uses ownership transition checks.
 *   Re-triggers after ownership returns from zero to owned again.
 *
 * 
 * 
 * 
 * ======================================
 * Param Declarations
 * ======================================
 *
 * @param --- Party Command Options ---
 * @default
 *
 * @param - Description Window Settings -
 * @parent --- Party Command Options ---
 * @default
 * 
 * @param Window X
 * @parent - Description Window Settings -
 * @desc The default X location used for the passives description window.
 * You can use formulas.
 * @default 0
 *
 * @param Window Y
 * @parent - Description Window Settings -
 * @desc The default Y location used for the passives description window.
 * You can use formulas.
 * @default this.fittingHeight(2)
 *
 * @param Window Width
 * @parent - Description Window Settings -
 * @desc The default width used for the passives description window.
 * You can use formulas.
 * @default Graphics.boxWidth
 *
 * @param Window Height
 * @parent - Description Window Settings -
 * @desc The default height used for the passives description window.
 * You can use formulas.
 * @default Graphics.boxHeight - this.fittingHeight(2) - this.fittingHeight(4)
 *
 * 
 * @param Enable the Party Passives Option
 * @parent --- Party Command Options ---
 * @type boolean
 * @on Show
 * @off Hide
 * @desc If true, Enables showing the Party Passives option
 * NO - false     YES - true
 * @default true
 *
 * @param Party Passives Command Text
 * @parent --- Party Command Options ---
 * @desc (only if "Enable the Party Passives Option" is true) Text used for party passives command.
 * @default Party Passives
 *
 * @param Enable the Enemy Passives Option
 * @parent --- Party Command Options ---
 * @type boolean
 * @on Show
 * @off Hide
 * @desc If true, Enables showing the Enemy Passives option
 * NO - false     YES - true
 * @default true
 *
 * @param Enemy Passives Command Text
 * @parent --- Party Command Options ---
 * @desc (only if "Enable the Enemy Passives Option" is true) Text used for enemy passives command.
 * @default Enemy Passives
 *
 * @param Group the Passives Commands
 * @parent --- Party Command Options ---
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Whether to group the in battle passives commands together in the Party Command Window.
 * NO - false     YES - true
 * @default true
 *
 * @param Parent Passives Command Text
 * @parent --- Party Command Options ---
 * @desc (only if "Group the Passives Commands" is true) Text used for parent passives command.
 * @default Passives
 *
 *
 * @param --- Passives ---
 * @default
 *
 * @param Passives1
 * @text Passives 1
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives2
 * @text Passives 2
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives3
 * @text Passives 3
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives4
 * @text Passives 4
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives5
 * @text Passives 5
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives6
 * @text Passives 6
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives7
 * @text Passives 7
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives8
 * @text Passives 8
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives9
 * @text Passives 9
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives10
 * @text Passives 10
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives11
 * @text Passives 11
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives12
 * @text Passives 12
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives13
 * @text Passives 13
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives14
 * @text Passives 14
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives15
 * @text Passives 15
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives16
 * @text Passives 16
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives17
 * @text Passives 17
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives18
 * @text Passives 18
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives19
 * @text Passives 19
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []

 * @param Passives20
 * @text Passives 20
 * @parent --- Passives ---
 * @desc List of passives definitions.
 * @type struct<Passives>[]
 * @default []
 *
 *
 *
 */


/*~struct~Passives:
 * @param Name
 * @type text
 * @default
 * @desc Name used by <Passive: Name> to attach this passive.
 *
 * @param Eval Timings
 * @type struct<PassiveTiming>[]
 * @default []
 * @desc List of eval timings + script calls for this passive.
 *
 * @param use as Visual Passive
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc If true, this passive can also appear as visual passive on actor/enemy.
 *
 * @param Visual Passive Text
 * @type note
 * @default ""
 * @desc Description text for visual passive. Supports <Condition:>, <Resume>, <Disable If:> lines.
 *
 * @param Visual Disable Condition
 * @type note
 * @default ""
 * @desc Javascript boolean. If true, hide this visual passive entry.
 *
 */

/*~struct~PassiveTiming:
 * @param Timing
 * @type select
 * @option <While Owned>
 * @value whileOwned
 * @option <On Obtain>
 * @value onObtain
 * @option <On Loss>
 * @value onLoss
 * @option <While Alive>
 * @value whileAlive
 * @option <While Dead>
 * @value whileDead
 * @option <On Death>
 * @value onDeath
 * @option <While Equipped>
 * @value whileEquipped
 * @option <On Equip>
 * @value onEquip
 * @option <On UnEquip>
 * @value onUnequip
 * @default whileOwned
 * @desc Timing used for this script call.
 *
 * @param Script Call
 * @type note
 * @default ""
 * @desc Javascript script call to execute on selected timing.
 *
 */
//=============================================================================



(function($) {

$.version = 1.0;
$.pluginName = 'JakeMSG_PassivesForAll';
$.paramsRaw = PluginManager.parameters($.pluginName);

$.databaseProcessed = false;
$.errorCache = {};
$.warnedUnknownPassives = {};

$.ownershipCacheReady = false;
$.ownershipState = {
    item: {},
    weapon: {},
    armor: {}
};

$.trackedOwnershipIds = {
    item: [],
    weapon: [],
    armor: []
};

$.trackedOwnershipLookup = {
    item: {},
    weapon: {},
    armor: {}
};

$.allTimingKeys = [
    'whileOwned',
    'onObtain',
    'onLoss',
    'whileAlive',
    'whileDead',
    'onDeath',
    'whileEquipped',
    'onEquip',
    'onUnequip'
];

$.timingTagDefinitions = [
    {
        key: 'whileOwned',
        start: /^<\s*WHILE\s+OWNED\s*>/i,
        end: /^<\s*\/\s*WHILE\s+OWNED\s*>/i
    },
    {
        key: 'onObtain',
        start: /^<\s*ON\s+OBTAIN\s*>/i,
        end: /^<\s*\/\s*ON\s+OBTAIN\s*>/i
    },
    {
        key: 'onLoss',
        start: /^<\s*ON\s+LOSS\s*>/i,
        end: /^<\s*\/\s*ON\s+LOSS\s*>/i
    },
    {
        key: 'whileAlive',
        start: /^<\s*WHILE\s+ALIVE\s*>/i,
        end: /^<\s*\/\s*WHILE\s+ALIVE\s*>/i
    },
    {
        key: 'whileDead',
        start: /^<\s*WHILE\s+DEAD\s*>/i,
        end: /^<\s*\/\s*WHILE\s+DEAD\s*>/i
    },
    {
        key: 'onDeath',
        start: /^<\s*ON\s+DEATH\s*>/i,
        end: /^<\s*\/\s*ON\s+DEATH\s*>/i
    },
    {
        key: 'whileEquipped',
        start: /^<\s*WHILE\s+EQUIPPED\s*>/i,
        end: /^<\s*\/\s*WHILE\s+EQUIPPED\s*>/i
    },
    {
        key: 'onEquip',
        start: /^<\s*ON\s+EQUIP\s*>/i,
        end: /^<\s*\/\s*ON\s+EQUIP\s*>/i
    },
    {
        key: 'onUnequip',
        start: /^<\s*ON\s+UN\s*EQUIP\s*>/i,
        end: /^<\s*\/\s*ON\s+UN\s*EQUIP\s*>/i
    }
];

$.passiveWrapperStartRegex = /^<\s*PASSIVES\s*>/i;
$.passiveWrapperEndRegex = /^<\s*\/\s*PASSIVES\s*>/i;

$.passiveReferenceRegex = /<\s*PASSIVE\s*:\s*(.+?)\s*>/i;

$.visualWrapperStartRegex = /^<\s*VISUAL\s+PASSIVES\s*>/i;
$.visualWrapperEndRegex = /^<\s*\/\s*VISUAL\s+PASSIVES\s*>/i;
$.visualNameStartRegex = /^<\s*NAME\s*:\s*(.+?)\s*>/i;
$.visualNameEndRegex = /^<\s*\/\s*NAME\s*>/i;

$.visualConditionRegex = /<\s*(?:COND|CONDITION)\s*:\s*(.*)\s*>/i;
$.visualResumeRegex = /<\s*RESUME\s*>/i;
$.visualDisableRegex = /<\s*DISABLE\s+IF\s*:\s*(.*)\s*>/i;

$.noVisualPassivesName = 'No Visual Passives';
$.noVisualPassivesHelp = 'No visual passive description.';

$.toBool = function(value, defaultValue) {
    if (value === undefined || value === null || value === '') {
        return !!defaultValue;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    return String(value).trim().toLowerCase() === 'true';
};

$.safeJsonParse = function(value, defaultValue) {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }
    try {
        return JSON.parse(value);
    } catch (e) {
        return defaultValue;
    }
};

$.parseParameterNoteText = function(value) {
    if (value === undefined || value === null) {
        return '';
    }
    if (typeof value !== 'string') {
        return String(value);
    }
    if (value === '') {
        return '';
    }

    var parsed = $.safeJsonParse(value, null);
    if (typeof parsed === 'string') {
        return parsed;
    }
    return value;
};

$.sanitizeCommandText = function(text, fallback) {
    var result = String(text || '').trim();
    if (!result || /^(?:true|false)$/i.test(result)) {
        return fallback;
    }
    return result;
};

$.sanitizeFormulaText = function(text, fallback) {
    var result = String(text || '').trim();
    if (!result) {
        return fallback;
    }
    return result;
};

$.splitLines = function(text) {
    if (!text) {
        return [];
    }
    return String(text).split(/[\r\n]+/);
};

$.createTimingMap = function() {
    var map = {};
    for (var i = 0; i < $.allTimingKeys.length; i++) {
        map[$.allTimingKeys[i]] = [];
    }
    return map;
};

$.mergeTimingMap = function(targetMap, sourceMap) {
    if (!targetMap || !sourceMap) {
        return;
    }
    for (var i = 0; i < $.allTimingKeys.length; i++) {
        var key = $.allTimingKeys[i];
        if (!sourceMap[key] || sourceMap[key].length <= 0) {
            continue;
        }
        for (var j = 0; j < sourceMap[key].length; j++) {
            var code = String(sourceMap[key][j] || '');
            if (code.trim().length > 0) {
                targetMap[key].push(code);
            }
        }
    }
};

$.normalizeTimingValue = function(value) {
    if (!value) {
        return '';
    }
    var text = String(value).trim();
    if (!text) {
        return '';
    }

    for (var i = 0; i < $.allTimingKeys.length; i++) {
        if (text === $.allTimingKeys[i]) {
            return text;
        }
    }

    text = text.replace(/[<>]/g, '');
    text = text.replace(/\s+/g, ' ').trim().toLowerCase();

    if (text === 'while owned') return 'whileOwned';
    if (text === 'on obtain') return 'onObtain';
    if (text === 'on loss') return 'onLoss';
    if (text === 'while alive') return 'whileAlive';
    if (text === 'while dead') return 'whileDead';
    if (text === 'on death') return 'onDeath';
    if (text === 'while equipped') return 'whileEquipped';
    if (text === 'on equip') return 'onEquip';
    if (text === 'on unequip' || text === 'on un equip') return 'onUnequip';

    return '';
};

$.formatDataName = function(dataObj) {
    if (!dataObj) {
        return 'Unknown';
    }
    if (dataObj.name) {
        return dataObj.name;
    }
    if (dataObj.id !== undefined) {
        return 'ID ' + dataObj.id;
    }
    return 'Unknown';
};

$.logScriptError = function(kind, dataObj, timingKey, index, errorObj) {
    var key = [
        kind,
        timingKey,
        dataObj && dataObj.id !== undefined ? dataObj.id : 'none',
        index,
        errorObj && errorObj.message ? errorObj.message : String(errorObj)
    ].join('|');
    if ($.errorCache[key]) {
        return;
    }
    $.errorCache[key] = true;
    console.error(
        $.pluginName + ': ' + kind + ' error in ' +
        $.formatDataName(dataObj) + ' [' + timingKey + '] #' + index +
        ' -> ' + (errorObj && errorObj.message ? errorObj.message : String(errorObj))
    );
};

$.warnUnknownPassive = function(name) {
    var key = String(name || '').toLowerCase();
    if (!key || $.warnedUnknownPassives[key]) {
        return;
    }
    $.warnedUnknownPassives[key] = true;
    console.warn($.pluginName + ': Passive reference not found: ' + name);
};

$.params = {
    descriptionWindowX: $.sanitizeFormulaText($.paramsRaw['Window X'], '0'),
    descriptionWindowY: $.sanitizeFormulaText($.paramsRaw['Window Y'], 'this.fittingHeight(2)'),
    descriptionWindowWidth: $.sanitizeFormulaText($.paramsRaw['Window Width'], 'Graphics.boxWidth'),
    descriptionWindowHeight: $.sanitizeFormulaText(
        $.paramsRaw['Window Height'],
        'Graphics.boxHeight - this.fittingHeight(2) - this.fittingHeight(4)'
    ),
    showPartyPassivesOption: $.toBool($.paramsRaw['Enable the Party Passives Option'], true),
    partyPassivesCommandText: $.sanitizeCommandText(
        $.paramsRaw['Party Passives Command Text'],
        'Party Passives'
    ),
    showEnemyPassivesOption: $.toBool($.paramsRaw['Enable the Enemy Passives Option'], true),
    enemyPassivesCommandText: $.sanitizeCommandText(
        $.paramsRaw['Enemy Passives Command Text'],
        'Enemy Passives'
    ),
    groupPassivesCommands: $.toBool($.paramsRaw['Group the Passives Commands'], true),
    parentPassivesCommandText: $.sanitizeCommandText(
        $.paramsRaw['Parent Passives Command Text'],
        'Passives'
    )
};

$.parameterPassives = {};

$.newParameterPassive = function(name) {
    return {
        name: name,
        timings: $.createTimingMap(),
        useAsVisualPassive: true,
        visualPassiveText: '',
        visualDisableCondition: ''
    };
};

$.parseParameterTimingStruct = function(structData, timingMap) {
    if (!structData || !timingMap) {
        return;
    }
    var timingKey = $.normalizeTimingValue(structData['Timing']);
    if (!timingKey) {
        return;
    }
    var script = $.parseParameterNoteText(structData['Script Call'] || structData['Script'] || '');
    if (typeof script !== 'string') {
        script = String(script || '');
    }
    if (script.trim().length <= 0) {
        return;
    }
    timingMap[timingKey].push(script);
};

$.parseParameterPassiveStruct = function(structData) {
    if (!structData) {
        return null;
    }
    var name = String(structData['Name'] || '').trim();
    if (!name) {
        return null;
    }

    var passive = $.newParameterPassive(name);
    passive.useAsVisualPassive = $.toBool(structData['use as Visual Passive'], true);
    passive.visualPassiveText = $.parseParameterNoteText(structData['Visual Passive Text'] || '');
    passive.visualDisableCondition = $.parseParameterNoteText(structData['Visual Disable Condition'] || '').trim();

    var timingEntries = $.safeJsonParse(structData['Eval Timings'], []);
    if (!Array.isArray(timingEntries)) {
        timingEntries = [];
    }

    for (var i = 0; i < timingEntries.length; i++) {
        var timingStruct = timingEntries[i];
        if (typeof timingStruct === 'string') {
            timingStruct = $.safeJsonParse(timingStruct, null);
        }
        if (!timingStruct) {
            continue;
        }
        $.parseParameterTimingStruct(timingStruct, passive.timings);
    }

    return passive;
};

$.mergeParameterPassive = function(targetPassive, sourcePassive) {
    if (!targetPassive || !sourcePassive) {
        return;
    }
    $.mergeTimingMap(targetPassive.timings, sourcePassive.timings);

    targetPassive.useAsVisualPassive = sourcePassive.useAsVisualPassive;
    if (String(sourcePassive.visualPassiveText || '').trim().length > 0) {
        targetPassive.visualPassiveText = sourcePassive.visualPassiveText;
    }
    if (String(sourcePassive.visualDisableCondition || '').trim().length > 0) {
        targetPassive.visualDisableCondition = sourcePassive.visualDisableCondition;
    }
};

$.loadParameterPassives = function() {
    $.parameterPassives = {};

    for (var i = 1; i <= 20; i++) {
        var key = 'Passives' + i;
        var list = $.safeJsonParse($.paramsRaw[key], []);
        if (!Array.isArray(list)) {
            list = [];
        }

        for (var j = 0; j < list.length; j++) {
            var structData = list[j];
            if (typeof structData === 'string') {
                structData = $.safeJsonParse(structData, null);
            }
            if (!structData) {
                continue;
            }

            var passive = $.parseParameterPassiveStruct(structData);
            if (!passive) {
                continue;
            }

            var lookup = passive.name.toLowerCase();
            if (!$.parameterPassives[lookup]) {
                $.parameterPassives[lookup] = $.newParameterPassive(passive.name);
            }
            $.mergeParameterPassive($.parameterPassives[lookup], passive);
        }
    }
};

$.prepareDataEntry = function(dataObj, dataType) {
    if (!dataObj) {
        return;
    }
    dataObj.jakePFAType = dataType;
    dataObj.jakePFATimings = $.createTimingMap();
    dataObj.jakePFARefs = [];
    dataObj.jakePFARefLookup = {};
    dataObj.jakePFAVisual = [];
};

$.addPassiveRefToData = function(dataObj, passiveName) {
    if (!dataObj) {
        return;
    }
    var cleaned = String(passiveName || '').trim();
    if (!cleaned) {
        return;
    }
    var key = cleaned.toLowerCase();
    if (dataObj.jakePFARefLookup[key]) {
        return;
    }
    dataObj.jakePFARefLookup[key] = true;
    dataObj.jakePFARefs.push(cleaned);
};

$.matchTimingStart = function(line) {
    for (var i = 0; i < $.timingTagDefinitions.length; i++) {
        var def = $.timingTagDefinitions[i];
        if (def.start.test(line)) {
            return def.key;
        }
    }
    return '';
};

$.isTimingEnd = function(line, timingKey) {
    for (var i = 0; i < $.timingTagDefinitions.length; i++) {
        var def = $.timingTagDefinitions[i];
        if (def.key === timingKey) {
            return def.end.test(line);
        }
    }
    return false;
};

$.parsePassiveNotetagsForData = function(dataObj) {
    if (!dataObj) {
        return;
    }

    var lines = $.splitLines(dataObj.note || '');
    var inPassives = false;
    var currentTiming = '';
    var currentLines = [];

    var flushTimingBuffer = function() {
        if (!currentTiming) {
            return;
        }
        var code = currentLines.join('\n');
        if (code.trim().length > 0) {
            dataObj.jakePFATimings[currentTiming].push(code);
        }
        currentTiming = '';
        currentLines = [];
    };

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        var refMatch = line.match($.passiveReferenceRegex);
        if (refMatch) {
            $.addPassiveRefToData(dataObj, refMatch[1]);
        }

        if ($.passiveWrapperStartRegex.test(line)) {
            inPassives = true;
            flushTimingBuffer();
            continue;
        }

        if ($.passiveWrapperEndRegex.test(line)) {
            flushTimingBuffer();
            inPassives = false;
            continue;
        }

        if (!inPassives) {
            continue;
        }

        var startTiming = $.matchTimingStart(line);
        if (startTiming) {
            flushTimingBuffer();
            currentTiming = startTiming;
            currentLines = [];
            continue;
        }

        if (currentTiming && $.isTimingEnd(line, currentTiming)) {
            flushTimingBuffer();
            continue;
        }

        if (currentTiming) {
            currentLines.push(line);
        }
    }

    flushTimingBuffer();
};

$.pushVisualPassive = function(dataObj, visualEntry) {
    if (!dataObj || !visualEntry) {
        return;
    }

    var name = String(visualEntry.name || '').trim();
    if (!name) {
        return;
    }

    var lines = visualEntry.lines || [];
    if (!Array.isArray(lines)) {
        lines = $.splitLines(lines);
    }

    dataObj.jakePFAVisual.push({
        name: name,
        lines: lines.slice(0),
        disableCondition: String(visualEntry.disableCondition || '').trim()
    });
};

$.parseVisualNotetagsForData = function(dataObj) {
    if (!dataObj) {
        return;
    }

    var lines = $.splitLines(dataObj.note || '');
    var inVisualBlock = false;
    var currentVisual = null;

    var flushVisual = function() {
        if (!currentVisual) {
            return;
        }
        $.pushVisualPassive(dataObj, currentVisual);
        currentVisual = null;
    };

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        if ($.visualWrapperStartRegex.test(line)) {
            inVisualBlock = true;
            flushVisual();
            continue;
        }

        if ($.visualWrapperEndRegex.test(line)) {
            flushVisual();
            inVisualBlock = false;
            continue;
        }

        if (!inVisualBlock) {
            continue;
        }

        var visualStartMatch = line.match($.visualNameStartRegex);
        if (visualStartMatch) {
            flushVisual();
            currentVisual = {
                name: visualStartMatch[1],
                lines: [],
                disableCondition: ''
            };
            continue;
        }

        if ($.visualNameEndRegex.test(line)) {
            flushVisual();
            continue;
        }

        if (currentVisual) {
            currentVisual.lines.push(line);
        }
    }

    flushVisual();
};

$.applyParameterPassivesToData = function(dataObj) {
    if (!dataObj || !dataObj.jakePFARefs) {
        return;
    }

    var isVisualData = dataObj.jakePFAType === 'actor' || dataObj.jakePFAType === 'enemy';

    for (var i = 0; i < dataObj.jakePFARefs.length; i++) {
        var refName = dataObj.jakePFARefs[i];
        var passive = $.parameterPassives[String(refName).toLowerCase()];
        if (!passive) {
            $.warnUnknownPassive(refName);
            continue;
        }

        $.mergeTimingMap(dataObj.jakePFATimings, passive.timings);

        if (isVisualData && passive.useAsVisualPassive) {
            $.pushVisualPassive(dataObj, {
                name: passive.name,
                lines: $.splitLines(passive.visualPassiveText),
                disableCondition: passive.visualDisableCondition
            });
        }
    }
};

$.hasTimingScripts = function(dataObj, timingKey) {
    if (!dataObj || !dataObj.jakePFATimings) {
        return false;
    }
    var list = dataObj.jakePFATimings[timingKey];
    return !!(list && list.length > 0);
};

$.registerOwnershipTracking = function(dataObj, dataType) {
    if (!dataObj) {
        return;
    }
    if (dataType !== 'item' && dataType !== 'weapon' && dataType !== 'armor') {
        return;
    }
    if (!$.hasTimingScripts(dataObj, 'onObtain') && !$.hasTimingScripts(dataObj, 'onLoss')) {
        return;
    }

    var id = dataObj.id;
    if (!id || $.trackedOwnershipLookup[dataType][id]) {
        return;
    }

    $.trackedOwnershipLookup[dataType][id] = true;
    $.trackedOwnershipIds[dataType].push(id);
};

$.processDataGroup = function(group, dataType) {
    if (!group) {
        return;
    }
    for (var i = 1; i < group.length; i++) {
        var obj = group[i];
        if (!obj) {
            continue;
        }

        $.prepareDataEntry(obj, dataType);
        $.parsePassiveNotetagsForData(obj);

        if (dataType === 'actor' || dataType === 'enemy') {
            $.parseVisualNotetagsForData(obj);
        }

        $.applyParameterPassivesToData(obj);
        $.registerOwnershipTracking(obj, dataType);
    }
};

$.resetRuntimeCaches = function() {
    $.ownershipCacheReady = false;
    $.ownershipState = {
        item: {},
        weapon: {},
        armor: {}
    };
};

$.processDatabaseNotetags = function() {
    $.loadParameterPassives();

    $.trackedOwnershipIds = {
        item: [],
        weapon: [],
        armor: []
    };
    $.trackedOwnershipLookup = {
        item: {},
        weapon: {},
        armor: {}
    };

    $.processDataGroup($dataSkills, 'skill');
    $.processDataGroup($dataItems, 'item');
    $.processDataGroup($dataWeapons, 'weapon');
    $.processDataGroup($dataArmors, 'armor');
    $.processDataGroup($dataStates, 'state');
    $.processDataGroup($dataActors, 'actor');
    $.processDataGroup($dataEnemies, 'enemy');

    $.databaseProcessed = true;
    $.resetRuntimeCaches();
};

$.isRuntimeReady = function() {
    return !!(
        $.databaseProcessed &&
        $gameParty &&
        $gameTroop &&
        $gameSwitches &&
        $gameVariables
    );
};

$.isTitleSceneActive = function() {
    if (!SceneManager || !SceneManager._scene) {
        return false;
    }
    return (typeof Scene_Title !== 'undefined') && (SceneManager._scene instanceof Scene_Title);
};

$.shouldRunTimingEvals = function() {
    return !$.isTitleSceneActive();
};

$.partyMembersForIndex = function() {
    if (!$gameParty) {
        return [];
    }
    return $gameParty.members();
};

$.battlePartyMembers = function() {
    if (!$gameParty) {
        return [];
    }
    return $gameParty.battleMembers();
};

$.troopMembers = function() {
    if (!$gameTroop) {
        return [];
    }
    return $gameTroop.members();
};

$.getOwningMemberIndex = function(battler) {
    if (!battler) {
        return -1;
    }
    if (battler.isActor && battler.isActor()) {
        var actorId = battler.actorId ? battler.actorId() : battler._actorId;
        if ($gameParty && Array.isArray($gameParty._actors)) {
            var partyIndex = $gameParty._actors.indexOf(actorId);
            if (partyIndex >= 0) {
                return partyIndex;
            }
        }
        return $.partyMembersForIndex().indexOf(battler);
    }
    if (battler.isEnemy && battler.isEnemy()) {
        if ($gameTroop && Array.isArray($gameTroop._enemies)) {
            var troopIndex = $gameTroop._enemies.indexOf(battler);
            if (troopIndex >= 0) {
                return troopIndex;
            }
        }
        return $.troopMembers().indexOf(battler);
    }
    return -1;
};

$.dataFromBattler = function(battler) {
    if (!battler) {
        return null;
    }
    if (battler.isActor && battler.isActor()) {
        return $dataActors[battler.actorId()];
    }
    if (battler.isEnemy && battler.isEnemy()) {
        return $dataEnemies[battler.enemyId()];
    }
    return null;
};

$.executeTimingScripts = function(dataObj, timingKey, ownerBattler, owningMemberIndex) {
    if (!$.shouldRunTimingEvals()) {
        return;
    }
    if (!dataObj || !dataObj.jakePFATimings) {
        return;
    }
    var scripts = dataObj.jakePFATimings[timingKey];
    if (!scripts || scripts.length <= 0) {
        return;
    }

    for (var i = 0; i < scripts.length; i++) {
        var code = String(scripts[i] || '');
        if (code.trim().length <= 0) {
            continue;
        }

        try {
            var owningMember = owningMemberIndex;
            var passiveSource = dataObj;
            var passiveOwner = ownerBattler || null;
            var source = passiveSource;
            var owner = passiveOwner;
            var user = passiveOwner;
            var subject = passiveOwner;
            var a = passiveOwner;
            var b = null;
            var actor = (passiveOwner && passiveOwner.isActor && passiveOwner.isActor()) ? passiveOwner : null;
            var enemy = (passiveOwner && passiveOwner.isEnemy && passiveOwner.isEnemy()) ? passiveOwner : null;
            var s = $gameSwitches ? $gameSwitches._data : [];
            var v = $gameVariables ? $gameVariables._data : [];
            var timing = timingKey;

            eval(code);
        } catch (e) {
            $.logScriptError('timing', dataObj, timingKey, i, e);
        }
    }
};

$.evaluateBooleanScript = function(code, dataObj, ownerBattler, owningMemberIndex, timingKey, listIndex, defaultValue) {
    if (!code || String(code).trim().length <= 0) {
        return !!defaultValue;
    }
    try {
        var owningMember = owningMemberIndex;
        var passiveSource = dataObj;
        var passiveOwner = ownerBattler || null;
        var source = passiveSource;
        var owner = passiveOwner;
        var user = passiveOwner;
        var subject = passiveOwner;
        var a = passiveOwner;
        var b = null;
        var actor = (passiveOwner && passiveOwner.isActor && passiveOwner.isActor()) ? passiveOwner : null;
        var enemy = (passiveOwner && passiveOwner.isEnemy && passiveOwner.isEnemy()) ? passiveOwner : null;
        var s = $gameSwitches ? $gameSwitches._data : [];
        var v = $gameVariables ? $gameVariables._data : [];
        var timing = timingKey;

        return !!eval(code);
    } catch (e) {
        $.logScriptError('condition', dataObj, timingKey, listIndex, e);
        return !!defaultValue;
    }
};

$.evaluateVisualPassive = function(entry, dataObj, ownerBattler, owningMemberIndex) {
    var lines = entry && entry.lines ? entry.lines : [];
    var output = [];
    var blocked = false;
    var disabled = false;

    for (var i = 0; i < lines.length; i++) {
        var line = String(lines[i] || '');

        var disableMatch = line.match($.visualDisableRegex);
        if (disableMatch) {
            var disableNow = $.evaluateBooleanScript(
                disableMatch[1],
                dataObj,
                ownerBattler,
                owningMemberIndex,
                'visualDisable',
                i,
                false
            );
            if (disableNow) {
                disabled = true;
                break;
            }
            continue;
        }

        var condMatch = line.match($.visualConditionRegex);
        if (condMatch) {
            var cond = $.evaluateBooleanScript(
                condMatch[1],
                dataObj,
                ownerBattler,
                owningMemberIndex,
                'visualCondition',
                i,
                false
            );
            if (!cond) {
                blocked = true;
            }
            continue;
        }

        if ($.visualResumeRegex.test(line)) {
            blocked = false;
            continue;
        }

        if (!blocked) {
            output.push(line);
        }
    }

    if (!disabled && entry && entry.disableCondition) {
        disabled = $.evaluateBooleanScript(
            entry.disableCondition,
            dataObj,
            ownerBattler,
            owningMemberIndex,
            'visualDisable',
            lines.length,
            false
        );
    }

    return {
        disabled: disabled,
        description: output.join('\n')
    };
};

$.collectVisualPassivesForBattler = function(battler) {
    var dataObj = $.dataFromBattler(battler);
    if (!dataObj || !dataObj.jakePFAVisual) {
        return [];
    }

    var result = [];
    var owningMemberIndex = $.getOwningMemberIndex(battler);

    for (var i = 0; i < dataObj.jakePFAVisual.length; i++) {
        var entry = dataObj.jakePFAVisual[i];
        var evaluated = $.evaluateVisualPassive(entry, dataObj, battler, owningMemberIndex);
        if (evaluated.disabled) {
            continue;
        }
        result.push({
            name: String(entry.name || ''),
            description: evaluated.description
        });
    }

    return result;
};

$.partyOwnedCount = function(item) {
    if (!$gameParty || !item) {
        return 0;
    }

    var count = $gameParty.numItems(item);

    if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
        var members = $.partyMembersForIndex();
        for (var i = 0; i < members.length; i++) {
            var actor = members[i];
            if (!actor || !actor.equips) {
                continue;
            }
            var equips = actor.equips();
            for (var j = 0; j < equips.length; j++) {
                if (equips[j] === item) {
                    count += 1;
                }
            }
        }
    }

    return count;
};

$.primeOwnershipCache = function() {
    var types = ['item', 'weapon', 'armor'];
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var ids = $.trackedOwnershipIds[type];
        for (var j = 0; j < ids.length; j++) {
            var id = ids[j];
            var dataObj = null;
            if (type === 'item') dataObj = $dataItems[id];
            if (type === 'weapon') dataObj = $dataWeapons[id];
            if (type === 'armor') dataObj = $dataArmors[id];
            $.ownershipState[type][id] = $.partyOwnedCount(dataObj) > 0;
        }
    }
    $.ownershipCacheReady = true;
};

$.updateOwnershipTransitionsForType = function(type, group) {
    var ids = $.trackedOwnershipIds[type];
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var dataObj = group[id];
        if (!dataObj) {
            continue;
        }

        var wasOwned = !!$.ownershipState[type][id];
        var isOwned = $.partyOwnedCount(dataObj) > 0;

        if (!wasOwned && isOwned) {
            $.executeTimingScripts(dataObj, 'onObtain', null, -1);
        } else if (wasOwned && !isOwned) {
            $.executeTimingScripts(dataObj, 'onLoss', null, -1);
        }

        $.ownershipState[type][id] = isOwned;
    }
};

$.updateOwnershipTransitions = function() {
    if (!$.ownershipCacheReady) {
        $.primeOwnershipCache();
        return;
    }

    $.updateOwnershipTransitionsForType('item', $dataItems);
    $.updateOwnershipTransitionsForType('weapon', $dataWeapons);
    $.updateOwnershipTransitionsForType('armor', $dataArmors);
};

$.collectOwnedEquipData = function(isWeapon) {
    var result = [];
    var lookup = {};
    var list = isWeapon ? $gameParty.weapons() : $gameParty.armors();

    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (item && !lookup[item.id]) {
            lookup[item.id] = true;
            result.push(item);
        }
    }

    var members = $.partyMembersForIndex();
    for (var j = 0; j < members.length; j++) {
        var actor = members[j];
        if (!actor || !actor.equips) {
            continue;
        }
        var equips = actor.equips();
        for (var k = 0; k < equips.length; k++) {
            var equip = equips[k];
            if (!equip) {
                continue;
            }
            if (isWeapon && !DataManager.isWeapon(equip)) {
                continue;
            }
            if (!isWeapon && !DataManager.isArmor(equip)) {
                continue;
            }
            if (!lookup[equip.id]) {
                lookup[equip.id] = true;
                result.push(equip);
            }
        }
    }

    return result;
};

$.collectEnemySkillIds = function(enemyBattler) {
    var ids = [];
    var lookup = {};
    if (!enemyBattler || !enemyBattler.enemy) {
        return ids;
    }
    var enemyData = enemyBattler.enemy();
    if (!enemyData || !enemyData.actions) {
        return ids;
    }

    for (var i = 0; i < enemyData.actions.length; i++) {
        var action = enemyData.actions[i];
        if (!action || !action.skillId || lookup[action.skillId]) {
            continue;
        }
        lookup[action.skillId] = true;
        ids.push(action.skillId);
    }

    return ids;
};

$.runWhileOwnedItems = function() {
    var list = $gameParty.items();
    for (var i = 0; i < list.length; i++) {
        $.executeTimingScripts(list[i], 'whileOwned', null, -1);
    }
};

$.runWhileOwnedWeapons = function() {
    var list = $.collectOwnedEquipData(true);
    for (var i = 0; i < list.length; i++) {
        $.executeTimingScripts(list[i], 'whileOwned', null, -1);
    }
};

$.runWhileOwnedArmors = function() {
    var list = $.collectOwnedEquipData(false);
    for (var i = 0; i < list.length; i++) {
        $.executeTimingScripts(list[i], 'whileOwned', null, -1);
    }
};

$.runWhileEquipped = function() {
    var members = $.partyMembersForIndex();
    for (var i = 0; i < members.length; i++) {
        var actor = members[i];
        if (!actor || !actor.equips) {
            continue;
        }
        var equips = actor.equips();
        for (var j = 0; j < equips.length; j++) {
            var item = equips[j];
            if (!item) {
                continue;
            }
            if (!DataManager.isWeapon(item) && !DataManager.isArmor(item)) {
                continue;
            }
            $.executeTimingScripts(item, 'whileEquipped', actor, i);
        }
    }
};

$.runWhileOwnedSkills = function() {
    var partyMembers = $.partyMembersForIndex();
    for (var i = 0; i < partyMembers.length; i++) {
        var actor = partyMembers[i];
        if (!actor || !actor.skills) {
            continue;
        }
        var skills = actor.skills();
        for (var j = 0; j < skills.length; j++) {
            $.executeTimingScripts(skills[j], 'whileOwned', actor, i);
        }
    }

    if (!$gameParty.inBattle()) {
        return;
    }

    var enemies = $.troopMembers();
    for (var e = 0; e < enemies.length; e++) {
        var enemy = enemies[e];
        if (!enemy) {
            continue;
        }
        var skillIds = $.collectEnemySkillIds(enemy);
        for (var s = 0; s < skillIds.length; s++) {
            var skill = $dataSkills[skillIds[s]];
            if (skill) {
                $.executeTimingScripts(skill, 'whileOwned', enemy, e);
            }
        }
    }
};

$.runWhileOwnedStates = function() {
    var partyMembers = $.partyMembersForIndex();
    for (var i = 0; i < partyMembers.length; i++) {
        var actor = partyMembers[i];
        if (!actor || !actor.states) {
            continue;
        }
        var states = actor.states();
        for (var j = 0; j < states.length; j++) {
            $.executeTimingScripts(states[j], 'whileOwned', actor, i);
        }
    }

    if (!$gameParty.inBattle()) {
        return;
    }

    var enemies = $.troopMembers();
    for (var e = 0; e < enemies.length; e++) {
        var enemy = enemies[e];
        if (!enemy || !enemy.states) {
            continue;
        }
        var enemyStates = enemy.states();
        for (var s = 0; s < enemyStates.length; s++) {
            $.executeTimingScripts(enemyStates[s], 'whileOwned', enemy, e);
        }
    }
};

$.runActorAliveDeadTimings = function() {
    var members = $.partyMembersForIndex();
    for (var i = 0; i < members.length; i++) {
        var actor = members[i];
        if (!actor) {
            continue;
        }
        var dataObj = $dataActors[actor.actorId()];
        if (!dataObj) {
            continue;
        }
        if (actor.isAlive()) {
            $.executeTimingScripts(dataObj, 'whileAlive', actor, i);
        } else {
            $.executeTimingScripts(dataObj, 'whileDead', actor, i);
        }
    }
};

$.runEnemyAliveDeadTimings = function() {
    if (!$gameParty.inBattle()) {
        return;
    }

    var members = $.troopMembers();
    for (var i = 0; i < members.length; i++) {
        var enemy = members[i];
        if (!enemy) {
            continue;
        }
        if (enemy.isAppeared && !enemy.isAppeared()) {
            continue;
        }
        var dataObj = $dataEnemies[enemy.enemyId()];
        if (!dataObj) {
            continue;
        }
        if (enemy.isAlive()) {
            $.executeTimingScripts(dataObj, 'whileAlive', enemy, i);
        } else {
            $.executeTimingScripts(dataObj, 'whileDead', enemy, i);
        }
    }
};

$.updateFramePassives = function() {
    if (!$.isRuntimeReady() || !$.shouldRunTimingEvals()) {
        return;
    }

    $.updateOwnershipTransitions();
    $.runWhileOwnedItems();
    $.runWhileOwnedWeapons();
    $.runWhileOwnedArmors();
    $.runWhileOwnedSkills();
    $.runWhileOwnedStates();
    $.runWhileEquipped();
    $.runActorAliveDeadTimings();
    $.runEnemyAliveDeadTimings();
};

//=============================================================================
// DataManager
//=============================================================================

$.stringifyHookHandlers = $.stringifyHookHandlers || {};
$.stringifyOriginalMethods = $.stringifyOriginalMethods || {};

$.runStringifyPatchedMethod = function(handlerKey, context, argsLike) {
    var handler = $.stringifyHookHandlers[handlerKey];
    var original = $.stringifyOriginalMethods[handlerKey];
    if (typeof handler !== 'function' || typeof original !== 'function') {
        return undefined;
    }
    return handler.call(context, original, argsLike || []);
};

$.patchMethodWithStringify = function(targetObj, methodName, handlerKey) {
    if (!targetObj || typeof targetObj[methodName] !== 'function') {
        return false;
    }
    if (!$.stringifyHookHandlers[handlerKey]) {
        return false;
    }

    var currentFn = targetObj[methodName];
    if (currentFn && currentFn.__jakePFAStringifyHandlerKey === handlerKey) {
        return true;
    }

    var source = currentFn.toString();
    var marker = '__JAKEMSG_PFA_STRINGIFY_' + handlerKey;
    if (source.indexOf(marker) >= 0) {
        return true;
    }

    if (source.indexOf('runStringifyPatchedMethod') >= 0 && source.indexOf(handlerKey) >= 0) {
        return true;
    }

    if (source.indexOf('[native code]') >= 0) {
        console.warn($.pluginName + ': cannot stringify-patch native method ' + methodName + ' (' + handlerKey + ')');
        return false;
    }

    $.stringifyOriginalMethods[handlerKey] = currentFn;

    var replacement = [
        '{',
        '/*' + marker + '*/',
        'return $.runStringifyPatchedMethod(' + JSON.stringify(handlerKey) + ', this, arguments);',
        '}'
    ].join('\n');

    var patchedSource = source.replace(/\{[\s\S]*\}\s*$/, replacement);
    if (patchedSource === source) {
        console.warn($.pluginName + ': could not stringify-patch ' + methodName + ' (' + handlerKey + ')');
        return false;
    }

    try {
        targetObj[methodName] = eval('(' + patchedSource + ')');
        targetObj[methodName].__jakePFAStringifyHandlerKey = handlerKey;
        return true;
    } catch (e) {
        console.error($.pluginName + ': failed to install stringify patch ' + handlerKey + ':', e);
        delete $.stringifyOriginalMethods[handlerKey];
        return false;
    }
};

$.learnSkillFallback = function(actor, skillId) {
    if (!actor || !actor._skills) {
        return;
    }
    if (!actor._skills.contains(skillId)) {
        actor._skills.push(skillId);
        actor._skills.sort(function(a, b) {
            return a - b;
        });
    }
};

$.processEquipChangeTimings = function(actor, oldItem, newItem) {
    if (!actor || oldItem === newItem) {
        return;
    }
    var index = $.getOwningMemberIndex(actor);

    if (oldItem && (DataManager.isWeapon(oldItem) || DataManager.isArmor(oldItem))) {
        $.executeTimingScripts(oldItem, 'onUnequip', actor, index);
    }

    if (newItem && (DataManager.isWeapon(newItem) || DataManager.isArmor(newItem))) {
        $.executeTimingScripts(newItem, 'onEquip', actor, index);
    }
};

$.stringifyHookHandlers.DataManager_isDatabaseLoaded = function(original, args) {
    var result = original.apply(this, args);
    if (!result) {
        return false;
    }
    if (!$.databaseProcessed) {
        $.processDatabaseNotetags();
    }
    return true;
};

$.stringifyHookHandlers.DataManager_createGameObjects = function(original, args) {
    var result = original.apply(this, args);
    $.resetRuntimeCaches();
    return result;
};

$.stringifyHookHandlers.DataManager_extractSaveContents = function(original, args) {
    var result = original.apply(this, args);
    $.resetRuntimeCaches();
    return result;
};

$.stringifyHookHandlers.SceneManager_updateScene = function(original, args) {
    var result = original.apply(this, args);
    $.updateFramePassives();
    return result;
};

$.stringifyHookHandlers.Game_Actor_learnSkill = function(original, args) {
    var skillId = args[0];
    if (!this._jakePFAActiveLearnSkills) {
        this._jakePFAActiveLearnSkills = [];
    }
    if (this._jakePFAActiveLearnSkills.contains(skillId)) {
        $.learnSkillFallback(this, skillId);
        return;
    }

    this._jakePFAActiveLearnSkills.push(skillId);
    try {
        var hadSkill = this.isLearnedSkill(skillId);
        var result = original.apply(this, args);
        var hasSkill = this.isLearnedSkill(skillId);
        if (!hadSkill && hasSkill) {
            $.executeTimingScripts($dataSkills[skillId], 'onObtain', this, $.getOwningMemberIndex(this));
        }
        return result;
    } finally {
        var stackIndex = this._jakePFAActiveLearnSkills.indexOf(skillId);
        if (stackIndex >= 0) {
            this._jakePFAActiveLearnSkills.splice(stackIndex, 1);
        }
    }
};

$.stringifyHookHandlers.Game_Actor_forgetSkill = function(original, args) {
    var skillId = args[0];
    var hadSkill = this.isLearnedSkill(skillId);
    var result = original.apply(this, args);
    var hasSkill = this.isLearnedSkill(skillId);
    if (hadSkill && !hasSkill) {
        $.executeTimingScripts($dataSkills[skillId], 'onLoss', this, $.getOwningMemberIndex(this));
    }
    return result;
};

$.stringifyHookHandlers.Game_Actor_changeEquip = function(original, args) {
    var slotId = args[0];
    var oldItem = this.equips ? this.equips()[slotId] : null;
    var result = original.apply(this, args);
    var newItem = this.equips ? this.equips()[slotId] : null;
    $.processEquipChangeTimings(this, oldItem, newItem);
    return result;
};

$.stringifyHookHandlers.Game_Actor_forceChangeEquip = function(original, args) {
    var slotId = args[0];
    var oldItem = this.equips ? this.equips()[slotId] : null;
    var result = original.apply(this, args);
    var newItem = this.equips ? this.equips()[slotId] : null;
    $.processEquipChangeTimings(this, oldItem, newItem);
    return result;
};

$.stringifyHookHandlers.Game_BattlerBase_addNewState = function(original, args) {
    var stateId = args[0];
    var hadState = this.isStateAffected ? this.isStateAffected(stateId) : false;
    var result = original.apply(this, args);
    var hasState = this.isStateAffected ? this.isStateAffected(stateId) : false;
    if (!hadState && hasState) {
        $.executeTimingScripts($dataStates[stateId], 'onObtain', this, $.getOwningMemberIndex(this));
    }
    return result;
};

$.stringifyHookHandlers.Game_BattlerBase_eraseState = function(original, args) {
    var stateId = args[0];
    var hadState = this.isStateAffected ? this.isStateAffected(stateId) : false;
    var result = original.apply(this, args);
    var hasState = this.isStateAffected ? this.isStateAffected(stateId) : false;
    if (hadState && !hasState) {
        $.executeTimingScripts($dataStates[stateId], 'onLoss', this, $.getOwningMemberIndex(this));
    }
    return result;
};

$.stringifyHookHandlers.Game_BattlerBase_clearStates = function(original, args) {
    // During initMembers, state containers may not exist yet. Avoid alias-chain recursion.
    if (!this._states || !this._stateTurns) {
        this._states = [];
        this._stateTurns = {};
        if (this._stateSteps !== undefined) {
            this._stateSteps = {};
        }
        return undefined;
    }

    if (this._jakePFAInClearStatesHook) {
        // Emergency recursion break: clear core state containers directly.
        this._states = [];
        this._stateTurns = {};
        if (this._stateSteps !== undefined) {
            this._stateSteps = {};
        }
        return undefined;
    }

    this._jakePFAInClearStatesHook = true;
    try {
        var removedStateIds = this._states ? this._states.slice(0) : [];
        var result;
        try {
            result = original.apply(this, args);
        } catch (e) {
            if (e && e.name === 'RangeError') {
                // Final safety valve if third-party aliasing re-enters clearStates recursively.
                this._states = [];
                this._stateTurns = {};
                if (this._stateSteps !== undefined) {
                    this._stateSteps = {};
                }
                return undefined;
            }
            throw e;
        }

        if (!$.databaseProcessed || removedStateIds.length <= 0) {
            return result;
        }

        var index = $.getOwningMemberIndex(this);
        for (var i = 0; i < removedStateIds.length; i++) {
            var stateId = removedStateIds[i];
            var state = $dataStates[stateId];
            if (state) {
                $.executeTimingScripts(state, 'onLoss', this, index);
            }
        }
        return result;
    } finally {
        this._jakePFAInClearStatesHook = false;
    }
};

$.stringifyHookHandlers.Game_BattlerBase_die = function(original, args) {
    var wasAlive = this.isAlive ? this.isAlive() : false;
    var result = original.apply(this, args);
    var isDeadNow = this.isDead ? this.isDead() : false;

    if (wasAlive && isDeadNow) {
        var dataObj = $.dataFromBattler(this);
        $.executeTimingScripts(dataObj, 'onDeath', this, $.getOwningMemberIndex(this));
    }
    return result;
};

$.stringifyHookHandlers.Window_PartyCommand_makeCommandList = function(original, args) {
    var result = original.apply(this, args);
    this.makeJakeMSGPassivesCommands();
    return result;
};

$.stringifyHookHandlers.Scene_Battle_createAllWindows = function(original, args) {
    var result = original.apply(this, args);
    this.createJakeMSGPassivesForAllWindows();
    this._jakePassivesReturnToGroup = false;
    return result;
};

$.stringifyHookHandlers.Scene_Battle_createPartyCommandWindow = function(original, args) {
    var result = original.apply(this, args);

    var win = this._partyCommandWindow;
    if (win) {
        win.setHandler('jakePartyPassives', this.commandJakeMSGPartyPassives.bind(this));
        win.setHandler('jakeEnemyPassives', this.commandJakeMSGEnemyPassives.bind(this));
        win.setHandler('jakePassivesCommandGroup',
            this.commandJakeMSGPassivesCommandGroup.bind(this));
    }

    this.createJakeMSGPassivesCommandGroupWindow();
    return result;
};

$.stringifyHookHandlers.Scene_Battle_isAnyInputWindowActive = function(original, args) {
    if (this._passivesForAllCommandGroupWindow && this._passivesForAllCommandGroupWindow.active) {
        return true;
    }
    if (this._partyPassivesForAllListWindow && this._partyPassivesForAllListWindow.active) {
        return true;
    }
    if (this._enemyPassivesForAllListWindow && this._enemyPassivesForAllListWindow.active) {
        return true;
    }
    return original.apply(this, args);
};

$.installStringifyHooks = function() {
    $.patchMethodWithStringify(DataManager, 'isDatabaseLoaded', 'DataManager_isDatabaseLoaded');
    $.patchMethodWithStringify(DataManager, 'createGameObjects', 'DataManager_createGameObjects');
    $.patchMethodWithStringify(DataManager, 'extractSaveContents', 'DataManager_extractSaveContents');
    $.patchMethodWithStringify(SceneManager, 'updateScene', 'SceneManager_updateScene');

    $.patchMethodWithStringify(Game_Actor.prototype, 'learnSkill', 'Game_Actor_learnSkill');
    $.patchMethodWithStringify(Game_Actor.prototype, 'forgetSkill', 'Game_Actor_forgetSkill');
    $.patchMethodWithStringify(Game_Actor.prototype, 'changeEquip', 'Game_Actor_changeEquip');
    $.patchMethodWithStringify(Game_Actor.prototype, 'forceChangeEquip', 'Game_Actor_forceChangeEquip');

    $.patchMethodWithStringify(Game_BattlerBase.prototype, 'addNewState', 'Game_BattlerBase_addNewState');
    $.patchMethodWithStringify(Game_BattlerBase.prototype, 'eraseState', 'Game_BattlerBase_eraseState');
    $.patchMethodWithStringify(Game_Battler.prototype, 'clearStates', 'Game_BattlerBase_clearStates');
    $.patchMethodWithStringify(Game_BattlerBase.prototype, 'die', 'Game_BattlerBase_die');

    $.patchMethodWithStringify(Window_PartyCommand.prototype, 'makeCommandList', 'Window_PartyCommand_makeCommandList');
    $.patchMethodWithStringify(Scene_Battle.prototype, 'createAllWindows', 'Scene_Battle_createAllWindows');
    $.patchMethodWithStringify(Scene_Battle.prototype, 'createPartyCommandWindow', 'Scene_Battle_createPartyCommandWindow');
    $.patchMethodWithStringify(Scene_Battle.prototype, 'isAnyInputWindowActive', 'Scene_Battle_isAnyInputWindowActive');
};

$.installStringifyHooks();

//=============================================================================
// Battle command UI helpers
//=============================================================================

if (!Window_Command.prototype.addCommandAt) {
Window_Command.prototype.addCommandAt = function(index, name, symbol, enabled, ext) {
    if (enabled === undefined) {
        enabled = true;
    }
    if (ext === undefined) {
        ext = null;
    }
    var obj = {
        name: name,
        symbol: symbol,
        enabled: enabled,
        ext: ext
    };
    this._list.splice(index, 0, obj);
};
}

$.evalFormula = function(formula, fallback, context) {
    var text = String(formula || '').trim();
    if (!text) {
        return fallback;
    }
    if (text[text.length - 1] === ';') {
        text = text.substring(0, text.length - 1).trim();
    }
    try {
        var value = Function('return (' + text + ');').call(context);
        var num = Number(value);
        return isNaN(num) ? fallback : num;
    } catch (e) {
        return fallback;
    }
};

$.partyWindowFormulas = function() {
    return {
        x: $.params.descriptionWindowX,
        y: $.params.descriptionWindowY,
        w: $.params.descriptionWindowWidth,
        h: $.params.descriptionWindowHeight
    };
};

$.enemyWindowFormulas = function() {
    return {
        x: $.params.descriptionWindowX,
        y: $.params.descriptionWindowY,
        w: $.params.descriptionWindowWidth,
        h: $.params.descriptionWindowHeight
    };
};

$.firstPartyBattlerForMenu = function() {
    var members = $.battlePartyMembers();
    if (members.length <= 0) {
        return null;
    }
    return members[0];
};

$.firstEnemyBattlerForMenu = function() {
    var members = $.troopMembers();
    if (members.length <= 0) {
        return null;
    }
    for (var i = 0; i < members.length; i++) {
        if (members[i] && members[i].isAlive()) {
            return members[i];
        }
    }
    return members[0];
};

//=============================================================================
// Party command entries
//=============================================================================

Window_PartyCommand.prototype.makeJakeMSGPassivesCommands = function() {
    if ($.params.groupPassivesCommands) {
        this.makeJakeMSGGroupedPassivesCommands();
    } else {
        this.makeJakeMSGPartyPassivesCommand();
        this.makeJakeMSGEnemyPassivesCommand();
    }
};

Window_PartyCommand.prototype.makeJakeMSGPartyPassivesCommand = function() {
    if (!$.params.showPartyPassivesOption) {
        return;
    }
    if (this.findSymbol('jakePartyPassives') >= 0) {
        return;
    }
    var index = this.findSymbol('escape');
    if (index < 0) {
        index = this._list.length;
    }
    this.addCommandAt(index, $.params.partyPassivesCommandText, 'jakePartyPassives', true);
};

Window_PartyCommand.prototype.makeJakeMSGEnemyPassivesCommand = function() {
    if (!$.params.showEnemyPassivesOption) {
        return;
    }
    if (this.findSymbol('jakeEnemyPassives') >= 0) {
        return;
    }
    var index = this.findSymbol('escape');
    if (index < 0) {
        index = this._list.length;
    }
    this.addCommandAt(index, $.params.enemyPassivesCommandText, 'jakeEnemyPassives', true);
};

Window_PartyCommand.prototype.removeJakeMSGCommandBySymbol = function(symbol) {
    this._list = this._list.filter(function(cmd) {
        return cmd.symbol !== symbol;
    });
};

Window_PartyCommand.prototype.makeJakeMSGGroupedPassivesCommands = function() {
    this.removeJakeMSGCommandBySymbol('jakePartyPassives');
    this.removeJakeMSGCommandBySymbol('jakeEnemyPassives');

    if (!$.params.showPartyPassivesOption && !$.params.showEnemyPassivesOption) {
        return;
    }

    if (this.findSymbol('jakePassivesCommandGroup') >= 0) {
        return;
    }

    var index = this.findSymbol('escape');
    if (index < 0) {
        index = this._list.length;
    }
    this.addCommandAt(index, $.params.parentPassivesCommandText,
        'jakePassivesCommandGroup', true);
};

//=============================================================================
// Window_PassivesForAllCommandGroup
//=============================================================================

function Window_PassivesForAllCommandGroup() {
    this.initialize.apply(this, arguments);
}

Window_PassivesForAllCommandGroup._lastCommandSymbol = null;

Window_PassivesForAllCommandGroup.prototype = Object.create(Window_Command.prototype);
Window_PassivesForAllCommandGroup.prototype.constructor = Window_PassivesForAllCommandGroup;

Window_PassivesForAllCommandGroup.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.hide();
    this.deactivate();
};

Window_PassivesForAllCommandGroup.prototype.windowWidth = function() {
    return 280;
};

Window_PassivesForAllCommandGroup.prototype.numVisibleRows = function() {
    return Math.max(1, this.maxItems());
};

Window_PassivesForAllCommandGroup.prototype.makeCommandList = function() {
    if ($.params.showPartyPassivesOption) {
        this.addCommand($.params.partyPassivesCommandText, 'jakePartyPassives', true);
    }
    if ($.params.showEnemyPassivesOption) {
        this.addCommand($.params.enemyPassivesCommandText, 'jakeEnemyPassives', true);
    }
};

Window_PassivesForAllCommandGroup.prototype.selectLast = function() {
    if (this.maxItems() <= 0) {
        return;
    }
    var symbol = Window_PassivesForAllCommandGroup._lastCommandSymbol;
    if (symbol) {
        this.selectSymbol(symbol);
    } else {
        this.select(0);
    }
};

Window_PassivesForAllCommandGroup.prototype.processOk = function() {
    Window_PassivesForAllCommandGroup._lastCommandSymbol = this.currentSymbol();
    Window_Command.prototype.processOk.call(this);
};

//=============================================================================
// Window_PartyPassivesForAllStatus
//=============================================================================

function Window_PartyPassivesForAllStatus() {
    this.initialize.apply(this, arguments);
}

Window_PartyPassivesForAllStatus.prototype = Object.create(Window_Base.prototype);
Window_PartyPassivesForAllStatus.prototype.constructor = Window_PartyPassivesForAllStatus;

Window_PartyPassivesForAllStatus.prototype.initialize = function() {
    var formulas = $.partyWindowFormulas();
    var x = $.evalFormula(formulas.x, 0, this);
    var y = $.evalFormula(formulas.y, this.fittingHeight(2), this);
    var w = $.evalFormula(formulas.w, Graphics.boxWidth, this);
    var h = $.evalFormula(formulas.h,
        Graphics.boxHeight - this.fittingHeight(2) - this.fittingHeight(4), this);
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this._listContentWidth = this.contents.width;
    this._battler = $.firstPartyBattlerForMenu();
    this.hide();
};

Window_PartyPassivesForAllStatus.prototype.setBattler = function(battler) {
    this._battler = battler;
    this.refresh();
};

Window_PartyPassivesForAllStatus.prototype.refresh = function() {
    this.contents.clear();
};

//=============================================================================
// Window_PartyPassivesForAllList
//=============================================================================

function Window_PartyPassivesForAllList() {
    this.initialize.apply(this, arguments);
}

Window_PartyPassivesForAllList.prototype = Object.create(Window_Selectable.prototype);
Window_PartyPassivesForAllList.prototype.constructor = Window_PartyPassivesForAllList;

Window_PartyPassivesForAllList.prototype.initialize = function(parentWindow) {
    this._parentWindow = parentWindow;
    this._battler = $.firstPartyBattlerForMenu();

    var x = parentWindow.x;
    var y = parentWindow.y;
    var width = Math.ceil(parentWindow._listContentWidth + this.standardPadding() * 2);
    var height = parentWindow.height;

    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.hide();
    this.deactivate();
    this.opacity = 0;
    this.backOpacity = 0;
    this._data = [];
};

Window_PartyPassivesForAllList.prototype.maxItems = function() {
    return this._data ? this._data.length : 0;
};

Window_PartyPassivesForAllList.prototype.item = function() {
    var idx = this.index();
    if (!this._data || idx < 0) {
        return null;
    }
    return this._data[idx];
};

Window_PartyPassivesForAllList.prototype.makeItemList = function() {
    this._data = [];
    if (this._battler) {
        this._data = $.collectVisualPassivesForBattler(this._battler);
    }
    if (this._data.length <= 0) {
        this._data.push(null);
    }
};

Window_PartyPassivesForAllList.prototype.setBattler = function(battler) {
    this._battler = battler;
    if (this._parentWindow) {
        this._parentWindow.setBattler(battler);
    }
    this.refresh();
    this.select(0);
    this.callUpdateHelp();
};

Window_PartyPassivesForAllList.prototype.drawItem = function(index) {
    var item = this._data[index];
    var rect = this.itemRect(index);
    rect.width -= this.textPadding();
    if (!item) {
        this.changePaintOpacity(false);
        this.drawText($.noVisualPassivesName, rect.x, rect.y, rect.width);
        this.changePaintOpacity(true);
        return;
    }
    this.resetTextColor();
    this.drawText(item.name, rect.x, rect.y, rect.width);
};

Window_PartyPassivesForAllList.prototype.updateHelp = function() {
    if (!this._helpWindow) {
        return;
    }
    if (this._helpWindow._jakeMSGEnemyForDesc !== undefined) {
        this._helpWindow._jakeMSGEnemyForDesc = null;
    }

    var item = this.item();
    if (!item) {
        this._helpWindow.setText($.noVisualPassivesHelp);
    } else {
        this._helpWindow.setText(item.description || '');
    }
};

Window_PartyPassivesForAllList.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};

Window_PartyPassivesForAllList.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (this.active) {
        this.updateLeftRight();
    }
};

Window_PartyPassivesForAllList.prototype.updateLeftRight = function() {
    var members = $.battlePartyMembers();
    if (members.length <= 0 || !this._battler) {
        return;
    }

    var index = members.indexOf(this._battler);
    var current = index;

    if (Input.isRepeated('left')) {
        index -= 1;
    } else if (Input.isRepeated('right')) {
        index += 1;
    }

    index = index.clamp(0, members.length - 1);
    if (index !== current && members[index]) {
        this.setBattler(members[index]);
        SoundManager.playCursor();
    }
};

//=============================================================================
// Window_EnemyPassivesForAllStatus
//=============================================================================

function Window_EnemyPassivesForAllStatus() {
    this.initialize.apply(this, arguments);
}

Window_EnemyPassivesForAllStatus.prototype = Object.create(Window_Base.prototype);
Window_EnemyPassivesForAllStatus.prototype.constructor = Window_EnemyPassivesForAllStatus;

Window_EnemyPassivesForAllStatus.prototype.initialize = function() {
    var formulas = $.enemyWindowFormulas();
    var x = $.evalFormula(formulas.x, 0, this);
    var y = $.evalFormula(formulas.y, this.fittingHeight(2), this);
    var w = $.evalFormula(formulas.w, Graphics.boxWidth, this);
    var h = $.evalFormula(formulas.h,
        Graphics.boxHeight - this.fittingHeight(2) - this.fittingHeight(4), this);
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this._listContentWidth = this.contents.width;
    this._battler = $.firstEnemyBattlerForMenu();
    this.hide();
};

Window_EnemyPassivesForAllStatus.prototype.setBattler = function(battler) {
    this._battler = battler;
    this.refresh();
};

Window_EnemyPassivesForAllStatus.prototype.refresh = function() {
    this.contents.clear();
};

//=============================================================================
// Window_EnemyPassivesForAllList
//=============================================================================

function Window_EnemyPassivesForAllList() {
    this.initialize.apply(this, arguments);
}

Window_EnemyPassivesForAllList.prototype = Object.create(Window_Selectable.prototype);
Window_EnemyPassivesForAllList.prototype.constructor = Window_EnemyPassivesForAllList;

Window_EnemyPassivesForAllList.prototype.initialize = function(parentWindow) {
    this._parentWindow = parentWindow;
    this._battler = $.firstEnemyBattlerForMenu();

    var x = parentWindow.x;
    var y = parentWindow.y;
    var width = Math.ceil(parentWindow._listContentWidth + this.standardPadding() * 2);
    var height = parentWindow.height;

    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.hide();
    this.deactivate();
    this.opacity = 0;
    this.backOpacity = 0;
    this._data = [];
};

Window_EnemyPassivesForAllList.prototype.maxItems = function() {
    return this._data ? this._data.length : 0;
};

Window_EnemyPassivesForAllList.prototype.item = function() {
    var idx = this.index();
    if (!this._data || idx < 0) {
        return null;
    }
    return this._data[idx];
};

Window_EnemyPassivesForAllList.prototype.makeItemList = function() {
    this._data = [];
    if (this._battler) {
        this._data = $.collectVisualPassivesForBattler(this._battler);
    }
    if (this._data.length <= 0) {
        this._data.push(null);
    }
};

Window_EnemyPassivesForAllList.prototype.setBattler = function(battler) {
    this._battler = battler;
    if (this._parentWindow) {
        this._parentWindow.setBattler(battler);
    }
    if ($gameTroop && $gameTroop.select) {
        $gameTroop.select(battler || null);
    }
    this.refresh();
    this.select(0);
    this.callUpdateHelp();
};

Window_EnemyPassivesForAllList.prototype.drawItem = function(index) {
    var item = this._data[index];
    var rect = this.itemRect(index);
    rect.width -= this.textPadding();
    if (!item) {
        this.changePaintOpacity(false);
        this.drawText($.noVisualPassivesName, rect.x, rect.y, rect.width);
        this.changePaintOpacity(true);
        return;
    }
    this.resetTextColor();
    this.drawText(item.name, rect.x, rect.y, rect.width);
};

Window_EnemyPassivesForAllList.prototype.updateHelp = function() {
    if (!this._helpWindow) {
        return;
    }
    if (this._helpWindow._jakeMSGEnemyForDesc !== undefined) {
        this._helpWindow._jakeMSGEnemyForDesc = null;
    }

    var item = this.item();
    if (!item) {
        this._helpWindow.setText($.noVisualPassivesHelp);
    } else {
        this._helpWindow.setText(item.description || '');
    }
};

Window_EnemyPassivesForAllList.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};

Window_EnemyPassivesForAllList.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (this.active) {
        this.updateLeftRight();
    }
};

Window_EnemyPassivesForAllList.prototype.updateLeftRight = function() {
    var members = $.troopMembers();
    if (members.length <= 0 || !this._battler) {
        return;
    }

    var index = members.indexOf(this._battler);
    var current = index;

    if (Input.isRepeated('left')) {
        index -= 1;
    } else if (Input.isRepeated('right')) {
        index += 1;
    }

    while (index >= 0 && index < members.length && members[index] && !members[index].isAlive()) {
        if (current < index) {
            index += 1;
        } else {
            index -= 1;
        }
    }

    index = index.clamp(0, members.length - 1);
    if (index !== current && members[index] && members[index].isAlive()) {
        this.setBattler(members[index]);
        SoundManager.playCursor();
    }
};

//=============================================================================
// Scene_Battle
//=============================================================================

Scene_Battle.prototype.createJakeMSGPassivesForAllWindows = function() {
    this._partyPassivesForAllStatusWindow = new Window_PartyPassivesForAllStatus();
    this.addChild(this._partyPassivesForAllStatusWindow);

    this._partyPassivesForAllListWindow = new Window_PartyPassivesForAllList(
        this._partyPassivesForAllStatusWindow
    );
    this._partyPassivesForAllListWindow.setHelpWindow(this._helpWindow);
    this._partyPassivesForAllListWindow.setHandler(
        'cancel',
        this.onJakeMSGPartyPassivesCancel.bind(this)
    );
    this.addChild(this._partyPassivesForAllListWindow);

    this._enemyPassivesForAllStatusWindow = new Window_EnemyPassivesForAllStatus();
    this.addChild(this._enemyPassivesForAllStatusWindow);

    this._enemyPassivesForAllListWindow = new Window_EnemyPassivesForAllList(
        this._enemyPassivesForAllStatusWindow
    );
    this._enemyPassivesForAllListWindow.setHelpWindow(this._helpWindow);
    this._enemyPassivesForAllListWindow.setHandler(
        'cancel',
        this.onJakeMSGEnemyPassivesCancel.bind(this)
    );
    this.addChild(this._enemyPassivesForAllListWindow);
};

Scene_Battle.prototype.createJakeMSGPassivesCommandGroupWindow = function() {
    this._passivesForAllCommandGroupWindow = new Window_PassivesForAllCommandGroup();
    this._passivesForAllCommandGroupWindow.setHandler(
        'jakePartyPassives',
        this.commandJakeMSGPartyPassives.bind(this)
    );
    this._passivesForAllCommandGroupWindow.setHandler(
        'jakeEnemyPassives',
        this.commandJakeMSGEnemyPassives.bind(this)
    );
    this._passivesForAllCommandGroupWindow.setHandler(
        'cancel',
        this.onJakeMSGPassivesCommandGroupCancel.bind(this)
    );
    this.addWindow(this._passivesForAllCommandGroupWindow);
};

Scene_Battle.prototype.commandJakeMSGPassivesCommandGroup = function() {
    this._jakePassivesReturnToGroup = false;
    this.openJakeMSGPassivesCommandGroupWindow();
};

Scene_Battle.prototype.openJakeMSGPassivesCommandGroupWindow = function() {
    var win = this._passivesForAllCommandGroupWindow;
    if (!win) {
        return;
    }

    win.refresh();
    if (win.maxItems() <= 0) {
        this._partyCommandWindow.show();
        this._partyCommandWindow.activate();
        return;
    }

    win.x = this._partyCommandWindow.x;
    win.y = this._partyCommandWindow.y;
    win.show();
    win.activate();
    win.selectLast();

    this._partyCommandWindow.hide();
    this._partyCommandWindow.deactivate();
};

Scene_Battle.prototype.hideJakeMSGPassivesCommandGroupWindow = function() {
    var win = this._passivesForAllCommandGroupWindow;
    if (!win) {
        return;
    }
    win.hide();
    win.deactivate();
    win.deselect();
    this._partyCommandWindow.show();
};

Scene_Battle.prototype.onJakeMSGPassivesCommandGroupCancel = function() {
    this._jakePassivesReturnToGroup = false;
    this.hideJakeMSGPassivesCommandGroupWindow();
    this._partyCommandWindow.activate();
};

Scene_Battle.prototype.prepareJakeMSGPassivesGroupChild = function() {
    var win = this._passivesForAllCommandGroupWindow;
    if (!win || !win.visible) {
        this._jakePassivesReturnToGroup = false;
        return false;
    }

    Window_PassivesForAllCommandGroup._lastCommandSymbol = win.currentSymbol();
    this._jakePassivesReturnToGroup = true;
    win.deactivate();
    win.hide();
    return true;
};

Scene_Battle.prototype.restoreJakeMSGPassivesGroupAfterChild = function() {
    if (!this._jakePassivesReturnToGroup) {
        return false;
    }

    this._jakePassivesReturnToGroup = false;
    this.openJakeMSGPassivesCommandGroupWindow();

    var win = this._passivesForAllCommandGroupWindow;
    return !!(win && win.visible && win.active);
};

Scene_Battle.prototype.hideJakeMSGAllPassivesWindows = function() {
    if (this._partyPassivesForAllStatusWindow) this._partyPassivesForAllStatusWindow.hide();
    if (this._partyPassivesForAllListWindow) {
        this._partyPassivesForAllListWindow.hide();
        this._partyPassivesForAllListWindow.deactivate();
    }
    if (this._enemyPassivesForAllStatusWindow) this._enemyPassivesForAllStatusWindow.hide();
    if (this._enemyPassivesForAllListWindow) {
        this._enemyPassivesForAllListWindow.hide();
        this._enemyPassivesForAllListWindow.deactivate();
    }
    if ($gameTroop && $gameTroop.select) {
        $gameTroop.select(null);
    }
};

Scene_Battle.prototype.commandJakeMSGPartyPassives = function() {
    this.prepareJakeMSGPassivesGroupChild();
    this.hideJakeMSGAllPassivesWindows();

    if (this._helpWindow) {
        this._helpWindow.show();
    }

    if (this._partyPassivesForAllStatusWindow) this._partyPassivesForAllStatusWindow.show();
    if (this._partyPassivesForAllListWindow) {
        this._partyPassivesForAllListWindow.show();
        this._partyPassivesForAllListWindow.activate();
        this._partyPassivesForAllListWindow.setBattler($.firstPartyBattlerForMenu());
    }

    this._partyCommandWindow.hide();
    this._partyCommandWindow.deactivate();
};

Scene_Battle.prototype.onJakeMSGPartyPassivesCancel = function() {
    this.hideJakeMSGAllPassivesWindows();
    if (this._helpWindow) {
        this._helpWindow.hide();
    }
    if (this.restoreJakeMSGPassivesGroupAfterChild()) {
        return;
    }
    this._partyCommandWindow.show();
    this._partyCommandWindow.activate();
};

Scene_Battle.prototype.commandJakeMSGEnemyPassives = function() {
    this.prepareJakeMSGPassivesGroupChild();
    this.hideJakeMSGAllPassivesWindows();

    if (this._helpWindow) {
        this._helpWindow.show();
    }

    if (this._enemyPassivesForAllStatusWindow) this._enemyPassivesForAllStatusWindow.show();
    if (this._enemyPassivesForAllListWindow) {
        this._enemyPassivesForAllListWindow.show();
        this._enemyPassivesForAllListWindow.activate();
        this._enemyPassivesForAllListWindow.setBattler($.firstEnemyBattlerForMenu());
    }

    this._partyCommandWindow.hide();
    this._partyCommandWindow.deactivate();
};

Scene_Battle.prototype.onJakeMSGEnemyPassivesCancel = function() {
    this.hideJakeMSGAllPassivesWindows();
    if (this._helpWindow) {
        this._helpWindow.hide();
    }
    if (this.restoreJakeMSGPassivesGroupAfterChild()) {
        return;
    }
    this._partyCommandWindow.show();
    this._partyCommandWindow.activate();
};

})(JakeMSG.PassivesForAll);







//=============================================================================
// End of File
//=============================================================================
