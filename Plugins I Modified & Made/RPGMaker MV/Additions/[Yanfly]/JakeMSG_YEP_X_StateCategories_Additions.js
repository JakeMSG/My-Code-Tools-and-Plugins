//=============================================================================
// Addition to YEP plugin "BuffsStates Core", made by JakeMSG
// JakeMSG_YEP_X_StateCategories_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_X_StateCategories_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.StateCategories_JakeMSGAdd = Yanfly.StateCategories_JakeMSGAdd || {};
Yanfly.StateCategories_JakeMSGAdd.version = 1.2;

//=============================================================================
/*:
 * @plugindesc v1.0 (Requires YEP_StateCategories.js) Additions to the State Categories 
 * yanfly Plugin, currently only adding 2 script calls to modify turns of states by their categories.
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
 * This plugin requires YEP_StateCategories.
 * Make sure this plugin is located under YEP_StateCategories in the plugin list.
 *
 * This plugin adds script calls to modify or set the Turn count of States by their categories.
 *
 * Script Calls:
 * battler.addTurnsStateCategory('text', turns, x)
 * - Adds 'turns' to x matching category states on the battler.
 * - If turns is negative, it subtracts turns.
 * - If resulting turns are 0 or less, the state is removed.
 *
 * battler.addTurnsStateCategoryAll('text', turns)
 * - Adds 'turns' to all matching category states on the battler.
 * - If turns is negative, it subtracts turns.
 * - If resulting turns are 0 or less, the state is removed.
 *
 * battler.setTurnsStateCategory('text', turns, x)
 * - Sets turns to 'turns' for x matching category states on the battler.
 * - If turns is 0 or less, the state is removed.
 *
 * battler.setTurnsStateCategoryAll('text', turns)
 * - Sets turns to 'turns' for all matching category states on the battler.
 * - If turns is 0 or less, the state is removed.
 *
 *
 * ============================================================================
 * S
 * ============================================================================
 * 
 * 
 * 
 * 
 */
//=============================================================================

if (Imported.YEP_X_StateCategories) {

//=============================================================================
// DataManager
//=============================================================================


//=============================================================================
// Game_Battler
//=============================================================================

Game_Battler.prototype.addTurnsStateCategoryAll = function(category, turns) {
    category = String(category || '').toUpperCase().trim();
    turns = Number(turns) || 0;
    if (!category || turns === 0) return;
    var states = JsonEx.makeDeepCopy(this._states || []);
    var length = states.length;
    for (var i = 0; i < length; ++i) {
        var stateId = states[i];
        var state = $dataStates[stateId];
        if (!state || !state.category || !state.category.contains(category)) continue;
        this.addTurnsToStateCategoryState(stateId, turns);
    }
};

Game_Battler.prototype.addTurnsStateCategory = function(category, turns, count) {
    category = String(category || '').toUpperCase().trim();
    turns = Number(turns) || 0;
    count = Math.max(0, Math.floor(Number(count) || 0));
    if (!category || turns === 0 || count <= 0) return;
    var states = JsonEx.makeDeepCopy(this._states || []);
    var length = states.length;
    var value = 0;
    for (var i = 0; i < length; ++i) {
        if (value >= count) return;
        var stateId = states[i];
        var state = $dataStates[stateId];
        if (!state || !state.category || !state.category.contains(category)) continue;
        this.addTurnsToStateCategoryState(stateId, turns);
        value += 1;
    }
};

Game_Battler.prototype.addTurnsToStateCategoryState = function(stateId, turns) {
    if (!this.isStateAffected(stateId)) return;
    var currentTurns = Number(this._stateTurns[stateId]) || 0;
    var newTurns = Math.floor(currentTurns + turns);
    if (newTurns <= 0) {
        this.removeState(stateId);
    } else if (this.setStateTurns) {
        this.setStateTurns(stateId, newTurns);
    } else {
        this._stateTurns[stateId] = newTurns;
    }
};

Game_Battler.prototype.setTurnsStateCategoryAll = function(category, turns) {
    category = String(category || '').toUpperCase().trim();
    turns = Math.floor(Number(turns) || 0);
    if (!category) return;
    var states = JsonEx.makeDeepCopy(this._states || []);
    var length = states.length;
    for (var i = 0; i < length; ++i) {
        var stateId = states[i];
        var state = $dataStates[stateId];
        if (!state || !state.category || !state.category.contains(category)) continue;
        this.setTurnsToStateCategoryState(stateId, turns);
    }
};

Game_Battler.prototype.setTurnsStateCategory = function(category, turns, count) {
    category = String(category || '').toUpperCase().trim();
    turns = Math.floor(Number(turns) || 0);
    count = Math.max(0, Math.floor(Number(count) || 0));
    if (!category || count <= 0) return;
    var states = JsonEx.makeDeepCopy(this._states || []);
    var length = states.length;
    var value = 0;
    for (var i = 0; i < length; ++i) {
        if (value >= count) return;
        var stateId = states[i];
        var state = $dataStates[stateId];
        if (!state || !state.category || !state.category.contains(category)) continue;
        this.setTurnsToStateCategoryState(stateId, turns);
        value += 1;
    }
};

Game_Battler.prototype.setTurnsToStateCategoryState = function(stateId, turns) {
    if (!this.isStateAffected(stateId)) return;
    if (turns <= 0) {
        this.removeState(stateId);
    } else if (this.setStateTurns) {
        this.setStateTurns(stateId, turns);
    } else {
        this._stateTurns[stateId] = turns;
    }
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
