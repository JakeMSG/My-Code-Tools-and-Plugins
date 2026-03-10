//=============================================================================
// Addition to YEP plugin "BuffsStates Core", made by JakeMSG
// JakeMSG_YEP_BuffsStatesCore_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_BuffsStatesCore_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.BuffsStates_JakeMSGAdd = Yanfly.BuffsStates_JakeMSGAdd || {};
Yanfly.BuffsStates_JakeMSGAdd.version = 1.2;

//=============================================================================
/*:
 * @plugindesc v1.0 (Requires YEP_BuffsStatesCore.js) Additions to the base
 * BuffsStates Core yanfly Plugin, such as multiple counters per state and new AuxVal value
 * (for background logic, not shown on screen)
 * @author JakeMSG
 * v1.0
 * 
============ Change Log ============
1.0 - 3.10th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_BuffsStatesCore.
 * Make sure this plugin is located under YEP_BuffsStatesCore in the plugin list.
 *
 * This plugin simply adds the functionality of Multiple Counters per state, each with its own visuals and possible visual settings via notetags,
 * as well as a new hidden value called AuxVal for any background logic you may want to use it for.
 *
 *
 * ============================================================================
 * State Multi-Counters
 * ============================================================================
 *
 * State counters are extended to be arrays of counters per state.
 *
 * Backward compatibility:
 * - Existing counter script calls still work exactly the same and always use
 *   counter index 0.
 * - Existing <Counter ...> notetags still configure counter index 0.
 *
 * New Notetags (State notebox):
 *   <Counter X Font Size: y>
 *   <Counter X Alignment: left>
 *   <Counter X Alignment: center>
 *   <Counter X Alignment: right>
 *   <Counter X Buffer X: +y>
 *   <Counter X Buffer X: -y>
 *   <Counter X Buffer Y: +y>
 *   <Counter X Buffer Y: -y>
 *   <Counter X Text Color: y>
 *
 * Replace X with an integer >= 1. By default, every counter index inherits
 * the same visual settings as counter index 0 until overridden.
 *
 * New Script Calls (use on a battler):
 *
 *   battler.setStateXCounter(stateId, counterIndex, value);
 *   - Sets counter 'counterIndex' for state 'stateId' to 'value'.
 *
 *   battler.addStateXCounter(stateId, counterIndex, value);
 *   - Adds 'value' to counter 'counterIndex'.
 *
 *   battler.clampStateXCounter(stateId, counterIndex, min, max);
 *   - Clamps counter 'counterIndex' between 'min' and 'max'.
 *
 *   battler.removeStateXCounter(stateId, counterIndex);
 *   - Clears counter 'counterIndex' for that state.
 *
 *   battler.getStateXCounter(stateId, counterIndex);
 *   - Returns counter 'counterIndex' value, or 'undefined'.
 *
 *   battler.clearStateXCountersOnly();
 *   - Clears all counters except index 0 for all states.
 *
 *   battler.clearStateXCountersAll();
 *   - Clears all counter indices, including index 0, for all states.
 *
 * Existing clear behavior updates:
 *   battler.clearStateCounters();
 *   - Now clears only counter index 0 for all states.
 *
 * ============================================================================
 * State AuxVal Functions
 * ============================================================================
 *
 * This plugin adds a hidden per-state value, called AuxVal, similar to state Counters, that can be used for any purpose.
 * AuxVals are not rendered on screen and are intended for background logic.
 *
 * Script Calls (use on a battler object) (similar to state counters):
 *
 *   battler.clearStateAuxVals();
 *   - Clears all AuxVal values for all states on that battler.
 *
 *   battler.setStateAuxVal(stateId, value);
 *   - Sets the AuxVal for a specific state ID to 'value'.
 *
 *   battler.addStateAuxVal(stateId, value);
 *   - Adds 'value' to the current AuxVal of the specified state.
 *   - If no AuxVal exists yet, it is treated as 0 before adding.
 *
 *   battler.clampStateAuxVal(stateId, min, max);
 *   - Clamps the current AuxVal to stay between 'min' and 'max'.
 *   - Make sure an AuxVal already exists before calling this.
 *
 *   battler.removeStateAuxVal(stateId);
 *   - Removes/clears the AuxVal for only the specified state ID.
 *
 *   battler.getStateAuxVal(stateId);
 *   - Returns the current AuxVal for the specified state ID.
 *   - Returns 'undefined' if none is set.
 *
 *   battler.clearStateCountersAndAuxVals();
 *   - Clears counter index 0 for all states and clears all AuxVals.
 *
 *   battler.clearStateXCountersOnlyAndAuxVals();
 *   - Clears all counters except index 0 for all states and clears all AuxVals.
 *
 *   battler.clearStateXCountersAllAndAuxVals();
 *   - Clears all counters including index 0 for all states and clears all AuxVals.
 *
 */
//=============================================================================

if (Imported.YEP_BuffsStatesCore) {

//=============================================================================
// DataManager
//=============================================================================

Yanfly.BuffsStates_JakeMSGAdd._counterSettingsClone = function(settings) {
        return {
                size: settings.size,
                align: settings.align,
                bufferX: settings.bufferX,
                bufferY: settings.bufferY,
                color: settings.color
        };
};

Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex = function(counterIndex) {
        var index = parseInt(counterIndex);
        if (isNaN(index)) index = 0;
        return Math.max(0, index);
};

Yanfly.BuffsStates_JakeMSGAdd._ensureStateCounterSettingsMap = function(state) {
        if (!state.stateCounterSettings) DataManager.initStateCounter(state);
        if (!state.stateXCounterSettings) state.stateXCounterSettings = {};
        if (!state.stateXCounterSettings[0]) {
                state.stateXCounterSettings[0] =
                    Yanfly.BuffsStates_JakeMSGAdd._counterSettingsClone(
                        state.stateCounterSettings
                    );
        }
        return state.stateXCounterSettings;
};

Yanfly.BuffsStates_JakeMSGAdd.getStateXCounterSettings = function(state, counterIndex) {
        if (!state) return null;
        var map = Yanfly.BuffsStates_JakeMSGAdd._ensureStateCounterSettingsMap(state);
        var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
        if (!map[index]) {
                map[index] = Yanfly.BuffsStates_JakeMSGAdd._counterSettingsClone(map[0]);
        }
        if (index === 0) state.stateCounterSettings = map[0];
        return map[index];
};

Yanfly.BuffsStates_JakeMSGAdd.DataManager_processBSCNotetags1 =
    DataManager.processBSCNotetags1;
DataManager.processBSCNotetags1 = function(group) {
        Yanfly.BuffsStates_JakeMSGAdd.DataManager_processBSCNotetags1.call(this, group);
        for (var n = 1; n < group.length; n++) {
                var state = group[n];
                if (!state) continue;
                var map = Yanfly.BuffsStates_JakeMSGAdd._ensureStateCounterSettingsMap(state);
                var notedata = state.note.split(/[\r\n]+/);
                for (var i = 0; i < notedata.length; i++) {
                        var line = notedata[i];
                        var settings;
                        var index;
                        if (line.match(/<COUNTER[ ](\d+)[ ]FONT SIZE:[ ](\d+)>/i)) {
                                index = parseInt(RegExp.$1);
                                if (index < 1) continue;
                                settings = Yanfly.BuffsStates_JakeMSGAdd.getStateXCounterSettings(
                                    state,
                                    index
                                );
                                settings.size = parseInt(RegExp.$2);
                        } else if (line.match(/<COUNTER[ ](\d+)[ ](?:ALIGNMENT|align):[ ](.*)>/i)) {
                                index = parseInt(RegExp.$1);
                                if (index < 1) continue;
                                settings = Yanfly.BuffsStates_JakeMSGAdd.getStateXCounterSettings(
                                    state,
                                    index
                                );
                                settings.align = String(RegExp.$2).toLowerCase();
                        } else if (line.match(/<COUNTER[ ](\d+)[ ]BUFFER X:[ ]([\+\-]\d+)>/i)) {
                                index = parseInt(RegExp.$1);
                                if (index < 1) continue;
                                settings = Yanfly.BuffsStates_JakeMSGAdd.getStateXCounterSettings(
                                    state,
                                    index
                                );
                                settings.bufferX = parseInt(RegExp.$2);
                        } else if (line.match(/<COUNTER[ ](\d+)[ ]BUFFER Y:[ ]([\+\-]\d+)>/i)) {
                                index = parseInt(RegExp.$1);
                                if (index < 1) continue;
                                settings = Yanfly.BuffsStates_JakeMSGAdd.getStateXCounterSettings(
                                    state,
                                    index
                                );
                                settings.bufferY = parseInt(RegExp.$2);
                        } else if (line.match(/<COUNTER[ ](\d+)[ ]TEXT COLOR:[ ](\d+)>/i)) {
                                index = parseInt(RegExp.$1);
                                if (index < 1) continue;
                                settings = Yanfly.BuffsStates_JakeMSGAdd.getStateXCounterSettings(
                                    state,
                                    index
                                );
                                settings.color = parseInt(RegExp.$2);
                        }
                }
                state.stateCounterSettings = map[0];
        }
};

//=============================================================================
// Game_BattlerBase
//=============================================================================

Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_initMembers =
  Game_BattlerBase.prototype.initMembers;
Game_BattlerBase.prototype.initMembers = function() {
    Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_initMembers.call(this);
    this.initStateAuxVals();
};

Game_BattlerBase.prototype.initStateAuxVals = function() {
    this._stateAuxVals = {};
};

Game_BattlerBase.prototype.clearStateAuxVals = function() {
    this._stateAuxVals = {};
};

Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_initStateCounter =
  Game_BattlerBase.prototype.initStateCounter;
Game_BattlerBase.prototype.initStateCounter = function() {
    this._stateCounter = {};
};

Game_BattlerBase.prototype._ensureStateCounterArray = function(stateId) {
    if (this._stateCounter === undefined) this.initStateCounter();
    var arr = this._stateCounter[stateId];
    if (Array.isArray(arr)) return arr;
    if (arr === undefined) {
        arr = [];
    } else {
        arr = [arr];
    }
    this._stateCounter[stateId] = arr;
    return arr;
};

Game_BattlerBase.prototype.clearStateCounters = function() {
    if (this._stateCounter === undefined) this.initStateCounter();
    var keys = Object.keys(this._stateCounter);
    for (var i = 0; i < keys.length; i++) {
        var stateId = keys[i];
        var arr = this._ensureStateCounterArray(stateId);
        arr[0] = undefined;
    }
};

Game_BattlerBase.prototype.clearStateXCountersOnly = function() {
    if (this._stateCounter === undefined) this.initStateCounter();
    var keys = Object.keys(this._stateCounter);
    for (var i = 0; i < keys.length; i++) {
        var stateId = keys[i];
        var arr = this._ensureStateCounterArray(stateId);
        for (var j = 1; j < arr.length; j++) {
            arr[j] = undefined;
        }
    }
};

Game_BattlerBase.prototype.clearStateXCountersAll = function() {
    this._stateCounter = {};
};

Game_BattlerBase.prototype.removeStateXCountersAllForState = function(stateId) {
    if (this._stateCounter === undefined) this.initStateCounter();
    this._stateCounter[stateId] = undefined;
};

Game_BattlerBase.prototype.setStateCounter = function(stateId, value) {
    this.setStateXCounter(stateId, 0, value);
};

Game_BattlerBase.prototype.addStateCounter = function(stateId, value) {
    this.addStateXCounter(stateId, 0, value);
};

Game_BattlerBase.prototype.clampStateCounter = function(stateId, min, max) {
    this.clampStateXCounter(stateId, 0, min, max);
};

Game_BattlerBase.prototype.removeStateCounter = function(stateId) {
    this.removeStateXCounter(stateId, 0);
};

Game_BattlerBase.prototype.getStateCounter = function(stateId) {
    return this.getStateXCounter(stateId, 0);
};

Game_BattlerBase.prototype.setStateXCounter = function(stateId, counterIndex, value) {
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var arr = this._ensureStateCounterArray(stateId);
    arr[index] = value;
    this.refresh();
};

Game_BattlerBase.prototype.addStateXCounter = function(stateId, counterIndex, value) {
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var current = this.getStateXCounter(stateId, index) || 0;
    this.setStateXCounter(stateId, index, value + current);
};

Game_BattlerBase.prototype.clampStateXCounter = function(stateId, counterIndex, min, max) {
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var value = this.getStateXCounter(stateId, index).clamp(min, max);
    this.setStateXCounter(stateId, index, value);
};

Game_BattlerBase.prototype.removeStateXCounter = function(stateId, counterIndex) {
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var arr = this._ensureStateCounterArray(stateId);
    arr[index] = undefined;
};

Game_BattlerBase.prototype.getStateXCounter = function(stateId, counterIndex) {
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var arr = this._ensureStateCounterArray(stateId);
    return arr[index];
};

Game_BattlerBase.prototype.getStateXCounterIndices = function(stateId) {
    var arr = this._ensureStateCounterArray(stateId);
    var indices = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] !== undefined) indices.push(i);
    }
    return indices;
};

Game_BattlerBase.prototype.setStateAuxVal = function(stateId, value) {
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    this._stateAuxVals[stateId] = value;
};

Game_BattlerBase.prototype.addStateAuxVal = function(stateId, value) {
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    this.setStateAuxVal(stateId, value + (this.getStateAuxVal(stateId) || 0));
};

Game_BattlerBase.prototype.clampStateAuxVal = function(stateId, min, max) {
    var value = this.getStateAuxVal(stateId).clamp(min, max);
    this.setStateAuxVal(stateId, value);
};

Game_BattlerBase.prototype.removeStateAuxVal = function(stateId) {
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    this._stateAuxVals[stateId] = undefined;
};

Game_BattlerBase.prototype.getStateAuxVal = function(stateId) {
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    return this._stateAuxVals[stateId];
};

Game_BattlerBase.prototype.clearStateCountersAndAuxVals = function() {
    this.clearStateCounters();
    this.clearStateAuxVals();
};

Game_BattlerBase.prototype.clearStateXCountersOnlyAndAuxVals = function() {
        this.clearStateXCountersOnly();
        this.clearStateAuxVals();
};

Game_BattlerBase.prototype.clearStateXCountersAllAndAuxVals = function() {
        this.clearStateXCountersAll();
        this.clearStateAuxVals();
};

//=============================================================================
// Window_Base
//=============================================================================

Yanfly.BuffsStates_JakeMSGAdd.Window_Base_drawStateCounter =
    Window_Base.prototype.drawStateCounter;
Window_Base.prototype.drawStateCounter = function(actor, state, wx, wy) {
        var indices = actor.getStateXCounterIndices(state.id);
        for (var i = 0; i < indices.length; i++) {
            this.drawStateXCounter(actor, state, wx, wy, indices[i]);
        }
};

Window_Base.prototype.drawStateXCounter = function(actor, state, wx, wy, counterIndex) {
        var value = actor.getStateXCounter(state.id, counterIndex);
        if (value === undefined) return;
        var settings = Yanfly.BuffsStates_JakeMSGAdd.getStateXCounterSettings(
            state,
            counterIndex
        );
        value = Yanfly.Util.toGroup(value);
        wx += settings.bufferX;
        wy += settings.bufferY;
        this.changePaintOpacity(true);
        this.changeTextColor(this.textColor(settings.color));
        this.contents.fontSize = settings.size;
        this.drawText(value, wx, wy, Window_Base._iconWidth, settings.align);
        this.resetFontSettings();
        this.resetTextColor();
};

//=============================================================================
// Sprite_StateIcon
//=============================================================================

if (Yanfly.Param.BSCShowEnemyIcon) {
        Yanfly.BuffsStates_JakeMSGAdd.Sprite_StateIcon_drawStateCounter =
            Sprite_StateIcon.prototype.drawStateCounter;
        Sprite_StateIcon.prototype.drawStateCounter = function(state) {
            var indices = this._battler.getStateXCounterIndices(state.id);
            for (var i = 0; i < indices.length; i++) {
                this.drawStateXCounter(state, indices[i]);
            }
        };

        Sprite_StateIcon.prototype.drawStateXCounter = function(state, counterIndex) {
                var value = this._battler.getStateXCounter(state.id, counterIndex);
                if (value === undefined) return;
                var settings = Yanfly.BuffsStates_JakeMSGAdd.getStateXCounterSettings(
                    state,
                    counterIndex
                );
                value = Yanfly.Util.toGroup(value);
                var wx = settings.bufferX;
                var wy = settings.bufferY - 2;
                var ww = Window_Base._iconWidth;
                var wh = Window_Base.prototype.lineHeight.call(this);
                var contents = this._turnCounterSprite.bitmap;
                contents.fontSize = settings.size;
                contents.textColor = this.textColor(settings.color);
                contents.drawText(value, wx, wy, ww, wh, settings.align);
        };
}

//=============================================================================
// Game_Battler
//=============================================================================

Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_removeState =
  Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
    Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_removeState.call(this, stateId);
    this.removeStateXCountersAllForState(stateId);
    this.removeStateAuxVal(stateId);
};

//=============================================================================
// Utilities
//=============================================================================

Yanfly.Util = Yanfly.Util || {};

if (!Yanfly.Util.toGroup) {
    Yanfly.Util.toGroup = function(inVal) {
        return inVal;
    };
}

//=============================================================================
// End of File
//=============================================================================
}
