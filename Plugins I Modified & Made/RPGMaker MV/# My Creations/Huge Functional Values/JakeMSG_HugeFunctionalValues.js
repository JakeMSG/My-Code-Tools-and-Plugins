//=============================================================================
// JakeMSG_HugeFunctionalValues
// JakeMSG_HugeFunctionalValues.js
//=============================================================================
var Imported = Imported || {};
Imported.JakeMSG_HugeFunctionalValues = true;
var JakeMSG = JakeMSG || {};
JakeMSG.HugeFunctionalValues = JakeMSG.HugeFunctionalValues || {};
//=============================================================================
/*:
 * @plugindesc v1.0 Raises functional numeric limits for stats, gold, damage, variables, and more.
 * @author JakeMSG
 * v1.0
 *
============ Change Log ============
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 *
 * This plugin raises the functional (gameplay) numeric limits used by RPG
 * Maker MV so that actors, enemies, gold, damage, and growth bonuses can
 * reach much larger values than the engine defaults.
 *
 * It does NOT change how numbers are displayed on screen. Use a separate
 * huge-number display plugin for abbreviated text (e.g. "1.234 Trl.").
 *
 * Place this plugin BELOW YEP_CoreEngine (if used) and BELOW
 * HIME_ParameterTables / HIME_ExpTables (if used).
 *
 * ============================================================================
 * JavaScript / RMMV Numeric Limit
 * ============================================================================
 *
 * Default parameter values use JavaScript's maximum *safe* integer:
 *
 *   9,007,199,254,740,991  (Number.MAX_SAFE_INTEGER, or 2^53 - 1)
 *
 * Each parameter may be raised up to the largest finite JavaScript number:
 *
 *   1.7976931348623157e+308  (Number.MAX_VALUE)
 *
 * RPG Maker MV stores and calculates these values as standard JavaScript
 * numbers (IEEE 754 double-precision). There is no separate engine cap below
 * MAX_VALUE for the values this plugin controls.
 *
 * Precision (important):
 *
 *   - At or below MAX_SAFE_INTEGER: every integer is stored and compared
 *     exactly. This is the recommended range for reliable gameplay.
 *
 *   - Above MAX_SAFE_INTEGER and up to MAX_VALUE: values can still be stored,
 *     read back, and used in comparisons, but not every integer is distinct.
 *     The gap between representable integers grows as magnitude increases (e.g.
 *     MAX_SAFE_INTEGER + 1 and + 2 both become 9007199254740992). Addition,
 *     subtraction, multiplication, and display may round or overflow toward
 *     Infinity unpredictably.
 *
 *   - Above MAX_VALUE: arithmetic becomes Infinity or NaN.
 *
 * Defaults stay at MAX_SAFE_INTEGER so limits work exactly unless you
 * deliberately raise a parameter toward MAX_VALUE and accept precision loss.
 *
 * ============================================================================
 * Vanilla MV Defaults (for reference)
 * ============================================================================
 *
 *   Actor Max HP .............. 9,999
 *   Actor Max MP / params ..... 9,999 / 999
 *   Enemy Max HP .............. 999,999
 *   Enemy Max MP / params ..... 9,999 / 999
 *   Max TP .................... 100
 *   Max level ................. 99 (per actor database entry)
 *   Gold ...................... 99,999,999
 *   Growth bonuses (_paramPlus)  no cap
 *   Damage .................... no explicit cap (bounded by stats)
 *   Variable values ........... no explicit cap (JavaScript number limits apply)
 *   Variable / switch IDs ....... 1 to 5000 (database size; script calls gated)
 *
 * ============================================================================
 * Variable Values
 * ============================================================================
 *
 * Vanilla MV does not clamp variable values in Game_Variables.setValue — only
 * the variable ID is checked against the database size (5000 by default).
 *
 * Values are stored as JavaScript numbers. Configurable range:
 *
 *   Recommended (exact) ..... ±MAX_SAFE_INTEGER
 *   Maximum (finite) ........ ±MAX_VALUE (precision loss above MAX_SAFE_INTEGER)
 *
 * This plugin clamps variable values to ±Variable Max (default MAX_SAFE_INTEGER).
 *
 * ============================================================================
 * Switch / Variable IDs (script calls)
 * ============================================================================
 *
 * By default, $gameVariables.setValue(id) and $gameSwitches.setValue(id) only
 * accept IDs below $dataSystem.variables.length (5001 entries = IDs 1–5000).
 * $gameVariables.value(id) and $gameSwitches.value(id) can read any array index
 * but setValue silently ignores out-of-range IDs.
 *
 * This plugin allows setValue for IDs from 1 up to Max Switch/Variable ID.
 * IDs above 5000 do not need database names; they use sparse array storage.
 * Event-editor Control Variable/Switch commands still use the database range.
 *
 * ============================================================================
 * Level Cap (with "HIME_ParameterTables" / "HIME_ExpTables" compatibility)
 * ============================================================================
 *
 * HIME_ParameterTables already supports parameter rows beyond level 99; it
 * does not impose a hardcoded level ceiling below 9,999.
 *
 * HIME_ExpTables sets each actor/class max level from the last row of its
 * CSV exp table. That value can be any positive integer and is left unchanged
 * by this plugin.
 *
 * When an actor does NOT use a HIME actor exp table, this plugin raises the
 * actor database max level from the engine default (99) up to the "Max Level"
 * parameter (default 9,999), unless the actor already has a higher custom cap
 * (e.g. via <Max Level: x> notetag). Actors with an explicit notetag cap
 * below 9,999 are not modified.
 *
 * ============================================================================
 * Growth Bonuses
 * ============================================================================
 *
 * "Growth" refers to permanent bonuses stored in _paramPlus, added by Grow
 * item/skill effects and the Change Parameter event command. Each standard
 * parameter (Max HP through Luck) has its own growth cap.
 *
 * The TP growth cap is provided for consistency. Standard MV Grow effects only
 * affect parameters 0-7 (Max HP through Luck), not TP directly.
 *
 *
 * ============================================================================
 * Setting Limits Above MAX_SAFE_INTEGER (need outside editing)
 * ============================================================================
 *
 * The in-game Plugin Manager cannot enter values above 9,007,199,254,740,991.
 * Edit plugins.js in a text editor instead. Keep values as JSON strings, e.g.:
 *
 *   "Actor Max HP": "1.7976931348623157e+20"
 *   "Actor Max HP": "179769313486231570000"
 *
 *   "Actor Max HP": "1.7976931348623157e+308"
 *
 * Avoid saving the plugin from the Plugin Manager after editing externally, or
 * the editor may reset values to the default. Re-open plugins.js to confirm.
 * 
 * I recommend using my own program "Plugin and Parameter Manger" for this:
 * https://github.com/JakeMSG/My-Code-Tools-and-Plugins/tree/main/Standalone%20Programs/Plugin%20and%20Parameter%20Manager%20(PAPM)
 * 
 * ============================================================================
 * Damage Cap (plugin compatibility)
 * ============================================================================
 *
 * Vanilla MV does not cap damage in makeDamageValue. However, YEP_DamageCore may
 * cap this value with Enable Cap / Maximum Damage / Maximum Healing.
 *
 * This plugin overrides those YEP_DamageCore caps so Damage Max and Healing Max
 * become the effective ceilings for dealt damage and healing (including legacy
 * 9,999 action-sequence or notetag caps). Lower intentional per-skill or
 * per-action caps below those limits are still respected.
 *
 * Place this plugin below YEP_DamageCore.
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 *
 * @param --- General Values ---
 * @default
 *
 * @param Max Level
 * @parent --- General Values ---
 * @desc Maximum actor level when not capped lower by HIME exp tables or notetags. Default engine cap is 99.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9999
 *
 * @param Gold Max
 * @parent --- General Values ---
 * @desc Maximum party gold.
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Damage Max
 * @parent --- General Values ---
 * @desc Max HP damage per hit. Overrides YEP_DamageCore Maximum Damage when present.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Healing Max
 * @parent --- General Values ---
 * @desc Max HP healing per hit (absolute value). Overrides YEP_DamageCore Maximum Healing when present.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Variable Max
 * @parent --- General Values ---
 * @desc Maximum absolute value for game variables (stored via setValue).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Max Switch/Variable ID
 * @parent --- General Values ---
 * @desc Highest switch or variable ID allowed in script calls (setValue/value).
 * @type number
 * @min 5000
 * @max 1.7976931348623157e+308
 * @default 999999
 *
 * @param --- Actor Stats ---
 * @default
 *
 * @param Actor Max HP
 * @parent --- Actor Stats ---
 * @desc Maximum Max HP for actors.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Actor Max MP
 * @parent --- Actor Stats ---
 * @desc Maximum Max MP for actors.
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Actor Max TP
 * @parent --- Actor Stats ---
 * @desc Maximum TP for actors.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Actor Max ATK
 * @parent --- Actor Stats ---
 * @desc Maximum Attack for actors.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Actor Max DEF
 * @parent --- Actor Stats ---
 * @desc Maximum Defense for actors.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Actor Max MAT
 * @parent --- Actor Stats ---
 * @desc Maximum M.Attack for actors.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Actor Max MDF
 * @parent --- Actor Stats ---
 * @desc Maximum M.Defense for actors.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Actor Max AGI
 * @parent --- Actor Stats ---
 * @desc Maximum Agility for actors.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Actor Max LUK
 * @parent --- Actor Stats ---
 * @desc Maximum Luck for actors.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param --- Enemy Stats ---
 * @default
 *
 * @param Enemy Max HP
 * @parent --- Enemy Stats ---
 * @desc Maximum Max HP for enemies.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Enemy Max MP
 * @parent --- Enemy Stats ---
 * @desc Maximum Max MP for enemies.
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Enemy Max TP
 * @parent --- Enemy Stats ---
 * @desc Maximum TP for enemies.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Enemy Max ATK
 * @parent --- Enemy Stats ---
 * @desc Maximum Attack for enemies.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Enemy Max DEF
 * @parent --- Enemy Stats ---
 * @desc Maximum Defense for enemies.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Enemy Max MAT
 * @parent --- Enemy Stats ---
 * @desc Maximum M.Attack for enemies.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Enemy Max MDF
 * @parent --- Enemy Stats ---
 * @desc Maximum M.Defense for enemies.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Enemy Max AGI
 * @parent --- Enemy Stats ---
 * @desc Maximum Agility for enemies.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Enemy Max LUK
 * @parent --- Enemy Stats ---
 * @desc Maximum Luck for enemies.
 * @type number
 * @min 1
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param --- Growth Bonuses ---
 * @default
 *
 * @param Growth Max HP
 * @parent --- Growth Bonuses ---
 * @desc Max permanent HP growth bonus (_paramPlus[0]).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Growth Max MP
 * @parent --- Growth Bonuses ---
 * @desc Max permanent MP growth bonus (_paramPlus[1]).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Growth Max TP
 * @parent --- Growth Bonuses ---
 * @desc Reserved cap (standard Grow effects do not modify TP).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Growth Max ATK
 * @parent --- Growth Bonuses ---
 * @desc Max permanent Attack growth bonus (_paramPlus[2]).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Growth Max DEF
 * @parent --- Growth Bonuses ---
 * @desc Max permanent Defense growth bonus (_paramPlus[3]).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Growth Max MAT
 * @parent --- Growth Bonuses ---
 * @desc Max permanent M.Attack growth bonus (_paramPlus[4]).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Growth Max MDF
 * @parent --- Growth Bonuses ---
 * @desc Max permanent M.Defense growth bonus (_paramPlus[5]).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Growth Max AGI
 * @parent --- Growth Bonuses ---
 * @desc Max permanent Agility growth bonus (_paramPlus[6]).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 * @param Growth Max LUK
 * @parent --- Growth Bonuses ---
 * @desc Max permanent Luck growth bonus (_paramPlus[7]).
 * @type number
 * @min 0
 * @max 1.7976931348623157e+308
 * @default 9007199254740991
 *
 */
//=============================================================================
(function($) {

'use strict';

$.version = 1.0;

//=============================================================================
// Defaults and Constants
//=============================================================================

$.SAFE_MAX = Number.MAX_SAFE_INTEGER;
$.ABS_MAX = Number.MAX_VALUE;

$.ENGINE_DEFAULT_MAX_LEVEL = 99;

$.rawParams = PluginManager.parameters('JakeMSG_HugeFunctionalValues');

$.parseLimit = function(value, fallback) {
    var number = Number(value);
    if (!isFinite(number) || number < 0) {
        return fallback;
    }
    return Math.min(Math.floor(number), $.ABS_MAX);
};

$.parsePositiveLimit = function(value, fallback) {
    return Math.max(1, $.parseLimit(value, fallback));
};

$.limits = {
    maxLevel: $.parsePositiveLimit($.rawParams['Max Level'], 9999),
    gold: $.parseLimit($.rawParams['Gold Max'], $.SAFE_MAX),
    damage: $.parsePositiveLimit($.rawParams['Damage Max'], $.SAFE_MAX),
    healing: $.parsePositiveLimit($.rawParams['Healing Max'], $.SAFE_MAX),
    variable: $.parseLimit($.rawParams['Variable Max'], $.SAFE_MAX),
    maxSwitchVariableId: Math.max(5000, $.parsePositiveLimit($.rawParams['Max Switch/Variable ID'], 999999)),
    actor: {
        0: $.parsePositiveLimit($.rawParams['Actor Max HP'], $.SAFE_MAX),
        1: $.parseLimit($.rawParams['Actor Max MP'], $.SAFE_MAX),
        2: $.parsePositiveLimit($.rawParams['Actor Max ATK'], $.SAFE_MAX),
        3: $.parsePositiveLimit($.rawParams['Actor Max DEF'], $.SAFE_MAX),
        4: $.parsePositiveLimit($.rawParams['Actor Max MAT'], $.SAFE_MAX),
        5: $.parsePositiveLimit($.rawParams['Actor Max MDF'], $.SAFE_MAX),
        6: $.parsePositiveLimit($.rawParams['Actor Max AGI'], $.SAFE_MAX),
        7: $.parsePositiveLimit($.rawParams['Actor Max LUK'], $.SAFE_MAX),
        tp: $.parsePositiveLimit($.rawParams['Actor Max TP'], $.SAFE_MAX)
    },
    enemy: {
        0: $.parsePositiveLimit($.rawParams['Enemy Max HP'], $.SAFE_MAX),
        1: $.parseLimit($.rawParams['Enemy Max MP'], $.SAFE_MAX),
        2: $.parsePositiveLimit($.rawParams['Enemy Max ATK'], $.SAFE_MAX),
        3: $.parsePositiveLimit($.rawParams['Enemy Max DEF'], $.SAFE_MAX),
        4: $.parsePositiveLimit($.rawParams['Enemy Max MAT'], $.SAFE_MAX),
        5: $.parsePositiveLimit($.rawParams['Enemy Max MDF'], $.SAFE_MAX),
        6: $.parsePositiveLimit($.rawParams['Enemy Max AGI'], $.SAFE_MAX),
        7: $.parsePositiveLimit($.rawParams['Enemy Max LUK'], $.SAFE_MAX),
        tp: $.parsePositiveLimit($.rawParams['Enemy Max TP'], $.SAFE_MAX)
    },
    growth: {
        0: $.parseLimit($.rawParams['Growth Max HP'], $.SAFE_MAX),
        1: $.parseLimit($.rawParams['Growth Max MP'], $.SAFE_MAX),
        2: $.parseLimit($.rawParams['Growth Max ATK'], $.SAFE_MAX),
        3: $.parseLimit($.rawParams['Growth Max DEF'], $.SAFE_MAX),
        4: $.parseLimit($.rawParams['Growth Max MAT'], $.SAFE_MAX),
        5: $.parseLimit($.rawParams['Growth Max MDF'], $.SAFE_MAX),
        6: $.parseLimit($.rawParams['Growth Max AGI'], $.SAFE_MAX),
        7: $.parseLimit($.rawParams['Growth Max LUK'], $.SAFE_MAX),
        tp: $.parseLimit($.rawParams['Growth Max TP'], $.SAFE_MAX)
    }
};

$.actorParamMax = function(paramId) {
    if ($.limits.actor.hasOwnProperty(paramId)) {
        return $.limits.actor[paramId];
    }
    return $.ABS_MAX;
};

$.enemyParamMax = function(paramId) {
    if ($.limits.enemy.hasOwnProperty(paramId)) {
        return $.limits.enemy[paramId];
    }
    return $.ABS_MAX;
};

$.growthParamMax = function(paramId) {
    if ($.limits.growth.hasOwnProperty(paramId)) {
        return $.limits.growth[paramId];
    }
    return $.ABS_MAX;
};

$.clampDamageValue = function(value) {
    if (value > 0) {
        return Math.min(value, $.limits.damage);
    }
    if (value < 0) {
        return -Math.min(Math.abs(value), $.limits.healing);
    }
    return value;
};

$.hfvHitLimit = function(baseDamage, preCap) {
    if (baseDamage < 0 || preCap < 0) {
        return $.limits.healing;
    }
    return $.limits.damage;
};

$.wrapMaximumDamage = function(proto, methodName) {
    var aliasKey = 'hfv' + methodName;
    if (proto[aliasKey]) {
        return;
    }
    proto[aliasKey] = proto[methodName];
    proto[methodName] = function() {
        return Math.min($.limits.damage, proto[aliasKey].call(this));
    };
};

$.wrapMaximumHealing = function(proto, methodName) {
    var aliasKey = 'hfv' + methodName;
    if (proto[aliasKey]) {
        return;
    }
    proto[aliasKey] = proto[methodName];
    proto[methodName] = function() {
        return Math.max(-$.limits.healing, proto[aliasKey].call(this));
    };
};

$.installDamageCapOverrides = function() {
    if (!Imported.YEP_DamageCore) {
        return;
    }

    Yanfly.Param.DMGMaxDamage = $.limits.damage;
    Yanfly.Param.DMGMaxHealing = $.limits.healing;

    if (!Game_System.prototype.hfvMaximumDamage) {
        Game_System.prototype.hfvMaximumDamage = Game_System.prototype.maximumDamage;
        Game_System.prototype.maximumDamage = function() {
            var cap = $.limits.damage;
            if (this._newDamageCap !== undefined) {
                cap = Math.min(cap, this._newDamageCap);
            }
            return cap;
        };

        Game_System.prototype.hfvMaximumHealing = Game_System.prototype.maximumHealing;
        Game_System.prototype.maximumHealing = function() {
            var cap = -$.limits.healing;
            if (this._newHealingCap !== undefined) {
                cap = Math.max(cap, this._newHealingCap);
            }
            return cap;
        };
    }

    $.wrapMaximumDamage(Game_Battler.prototype, 'maximumDamage');
    $.wrapMaximumHealing(Game_Battler.prototype, 'maximumHealing');
    $.wrapMaximumDamage(Game_Actor.prototype, 'maximumDamage');
    $.wrapMaximumHealing(Game_Actor.prototype, 'maximumHealing');
    $.wrapMaximumDamage(Game_Enemy.prototype, 'maximumDamage');
    $.wrapMaximumHealing(Game_Enemy.prototype, 'maximumHealing');

    if (!Game_Action.prototype.hfvApplyMinimumDamage) {
        Game_Action.prototype.hfvApplyMinimumDamage = Game_Action.prototype.applyMinimumDamage;
        Game_Action.prototype.applyMinimumDamage = function(value, baseDamage, target) {
            var preCap = value;
            value = this.hfvApplyMinimumDamage.call(this, value, baseDamage, target);
            if (!this.isDamageCapped()) {
                return $.clampDamageValue(value);
            }

            var legacyYepCap = 9999;
            var actCap = $gameSystem.getActSeqDamageCap && $gameSystem.getActSeqDamageCap();
            var itemCap = this.item() && this.item().damageCap;
            var intentionalCap;
            var hfvLimit = $.hfvHitLimit(baseDamage, preCap);

            if (actCap !== undefined && actCap !== legacyYepCap && actCap < hfvLimit) {
                intentionalCap = actCap;
            } else if (itemCap !== undefined && itemCap !== legacyYepCap && itemCap < hfvLimit) {
                intentionalCap = itemCap;
            }

            if (intentionalCap !== undefined) {
                return $.clampDamageValue(preCap.clamp(-intentionalCap, intentionalCap));
            }

            var max = this.subject().maximumDamage();
            var min = this.subject().maximumHealing();
            return $.clampDamageValue(preCap.clamp(min, max));
        };
    }
};

$.installDamageCapOverrides();

$.clampVariableValue = function(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return value;
    }
    return value.clamp(-$.limits.variable, $.limits.variable);
};

$.isValidSwitchVariableId = function(id) {
    return id > 0 && id <= $.limits.maxSwitchVariableId;
};

$.hasHimeActorExpTable = function(actorData) {
    return Imported.ExpTables &&
        TH.ExpTables.hasExpTable &&
        TH.ExpTables.hasExpTable(actorData);
};

$.shouldRaiseActorLevelCap = function(actorData) {
    if (!actorData) {
        return false;
    }
    if ($.hasHimeActorExpTable(actorData)) {
        return false;
    }
    if (actorData.maxLevel >= $.limits.maxLevel) {
        return false;
    }
    if (actorData.maxLevel > $.ENGINE_DEFAULT_MAX_LEVEL) {
        return false;
    }
    return true;
};

$.appliedLevelCap = false;

$.applyLevelCap = function() {
    if (!$.appliedLevelCap) {
        for (var i = 1; i < $dataActors.length; i++) {
            var actorData = $dataActors[i];
            if ($.shouldRaiseActorLevelCap(actorData)) {
                actorData.maxLevel = $.limits.maxLevel;
            }
        }
        $.appliedLevelCap = true;
    }
};




//=============================================================================
// DataManager - raise default actor level cap after database (and HIME) load
//=============================================================================

var HFV_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    var loaded = HFV_DataManager_isDatabaseLoaded.call(this);
    if (loaded) {
        $.applyLevelCap();
    }
    return loaded;
};




//=============================================================================
// Game_BattlerBase - enemy stat caps, growth caps, TP
//=============================================================================
Game_BattlerBase.prototype.hfvMaxParamPlus = function(paramId) {
    return $.growthParamMax(paramId);
};

Game_BattlerBase.prototype.paramMax = function(paramId) {
    return $.enemyParamMax(paramId);
};

var HFV_Game_BattlerBase_maxTp = Game_BattlerBase.prototype.maxTp;
Game_BattlerBase.prototype.maxTp = function() {
    if (this.isEnemy && this.isEnemy()) {
        return $.limits.enemy.tp;
    }
    return HFV_Game_BattlerBase_maxTp.call(this);
};

Game_BattlerBase.prototype.addParam = function(paramId, value) {
    var maxPlus = this.hfvMaxParamPlus(paramId);
    this._paramPlus[paramId] = (this._paramPlus[paramId] + value).clamp(0, maxPlus);
    this.refresh();
};



//=============================================================================
// Game_Actor - actor stat caps and TP
//=============================================================================

Game_Actor.prototype.paramMax = function(paramId) {
    return $.actorParamMax(paramId);
};

Game_Actor.prototype.maxTp = function() {
    return $.limits.actor.tp;
};



//=============================================================================
// Game_Variables / Game_Switches - value cap and extended IDs
//=============================================================================

Game_Variables.prototype.setValue = function(variableId, value) {
    if (!$.isValidSwitchVariableId(variableId)) {
        return;
    }
    if (typeof value === 'number') {
        value = Math.floor($.clampVariableValue(value));
    }
    this._data[variableId] = value;
    this.onChange();
};

Game_Switches.prototype.setValue = function(switchId, value) {
    if (!$.isValidSwitchVariableId(switchId)) {
        return;
    }
    this._data[switchId] = value;
    this.onChange();
};

//=============================================================================
// Game_Party - gold cap
//=============================================================================

Game_Party.prototype.maxGold = function() {
    return $.limits.gold;
};



//=============================================================================
// Game_Action - damage cap
//=============================================================================

var HFV_Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
    var value = HFV_Game_Action_makeDamageValue.call(this, target, critical);
    return $.clampDamageValue(value);
};



//=============================================================================
// Game_Interpreter - event HP changes
//=============================================================================

var HFV_Game_Interpreter_changeHp = Game_Interpreter.prototype.changeHp;
Game_Interpreter.prototype.changeHp = function(target, value, allowDeath) {
    HFV_Game_Interpreter_changeHp.call(this, target, $.clampDamageValue(value), allowDeath);
};




//=============================================================================
// End of File
//=============================================================================
})(JakeMSG.HugeFunctionalValues);
