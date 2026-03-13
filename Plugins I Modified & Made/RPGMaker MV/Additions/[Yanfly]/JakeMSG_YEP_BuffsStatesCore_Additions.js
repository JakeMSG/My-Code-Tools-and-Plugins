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
 * @plugindesc (Requires YEP_BuffsStatesCore.js) Additions to the base
 * BuffsStates Core yanfly Plugin, such as multiple counters per state and new AuxVal value
 * (for background logic, not shown on screen)
 * @author JakeMSG
 * v1.1
 * 
============ Change Log ============
1.1 - 3.13th.2026
 * Added a new State notetag, <Reapply Rule: X>, that can be used to override the global 
Reapply Rules plugin parameter for specific states, with the same options possible (0/1/2 / Ignore/Reset/Add)
 * Added a fix for a bug in the original plugin with <Custom Regenerate Effect> 
triggering constantly, instead of only when a positive regen value exists 
 * Added option to specify states by their names, in stead of just their IDs, in all s
script calls added by both the original plugin and this plugin
 * Added a number of new state eval timings, revolving around hp/mp/tp stat changes,
including even an eval timing for stat changes from taking hits or heals
 * Added NexTurn temporary states, that can be used to initialize a state for the next turn and 
have it show in the meantime as a "preview" version of the state, with its own turn count, 
counters, AuxVal and even notetag-based visual changes, separate from the normal version of the state. 
 * Also added a number of script calls revolving around these temporary states. "_NexT" version of the normal script calls
 * Also added new state eval timings for the NextTurn lifecycle timings
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
 * Fixes
 * ============================================================================
 * ======== Fixed a bug in the original plugin with <Custom Regenerate Effect> triggering constantly, instead of only when a positive regen value exists 
 * 
 * 
 * ============================================================================
 * Compatibilities
 * ============================================================================
 * ======== Compatible with YEP_X_InBattleStatus.js:
 *   NextTurn preview states appear in actor in-battle status state list.
 * ======== Compatible with JakeMSG_YEP_X_InBattleStatus_Additions.js:
 *   NextTurn preview states appear in enemy in-battle status state list.
 * ======== Compatible with Olivia_StateTooltipDisplay.js:
 *   NextTurn preview states appear in state tooltip text.
 * 
 * 
 * ============================================================================
 * New Features
 * ============================================================================
 *
 * ================================
 * State Reference (ID or Name)
 * ================================
 *
 * Most state-based script calls in this addon now accept either:
 * - numeric State ID, or
 * - State name (case-insensitive)
 *
 * Name lookup rules:
 * - For battler-owned operations (turn edits), name resolves only among states
 *   currently on that battler.
 * - If multiple owned states share the same name, the highest State ID is used.
 * 
 * 
 * ================================
 * State Turn Script Calls
 * ================================
 *
 *   battler.addStateTurns(stateIdOrName, value);
 *   - Adds value to current turn count of an owned state.
 *   - Value may be negative.
 *   - If resulting turns <= 0, state is removed.
 *
 *   battler.addStateTurns_NexT(stateIdOrName, value);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.setStateTurns(stateIdOrName, value);
 *   - Sets current turn count of an owned state.
 *   - If value <= 0, state is removed.
 *
 *   battler.setStateTurns_NexT(stateIdOrName, value);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 * ================================
 * State Add original Script Calls's extension
 * ================================
 *
 *   battler.addState(stateIdOrName, optionalTurns);
 *   - Extends default addState to accept State ID or State name.
 *   - also adds an optional parameter, "optionalTurns", that can overwrite the starting turn count
 *
 *   battler.addState_NexT(stateIdOrName, optionalTurns);
 *   - Creates or reapplies the NextTurn temporary version of the state.
 *   - If optionalTurns is given, it overwrites the temporary state's turn count.
 *
 * ================================
 * State Add - Next Turn
 * ================================
 * 
 *   battler.addStateNextTurn(stateIdOrName, optionalTurns);
 *   - Queues a NextTurn preview version of the state.
 *   - At the end of the current battle round, after everyone has finished
 *     acting and turn-end processing is done, the preview is consumed and the
 *     normal state is applied.
 *   - If the normal state already exists, it follows normal reapply rules.
 *   - Preview entries appear as separate state entries in menus/status lists.
 *   - If the temporary version already exists, <Custom NextTurn ReApplied Effect>
 *     is used instead of <Custom NextTurn Applied Effect>.
 *   - If optionalTurns is given, it overwrites the temporary state's turns.
 * 
 * 
 * ================================
 * State Multi-Counters
 * ================================
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
 * ======== New Script Calls (use on a battler):
 * ==== Keep in mind, Counters on NexT temporary states are separate from the
 * normal states, and don't automatically transfer to them when converting to 
 * normal states next turn (you will have to organize that Counter transfer manually,
 * with script calls in the eval timings for NextTurns, if you wish for it)
 * == The only thing that transfers is the Turn Count normally 
 * 
 * Existing clear behavior updates:
 *   battler.clearStateCounters();
 *   - Now clears only counter index 0 for all states.
 *
 *   battler.getStateCounter(stateIdOrName);
 *   - Original YEP-style script call for Counter Index 0.
 *   - Returns the Counter value for index 0, or 'undefined'.
 *
 *   battler.setStateCounter_NexT(stateIdOrName, value);
 *   battler.addStateCounter_NexT(stateIdOrName, value);
 *   battler.clampStateCounter_NexT(stateIdOrName, min, max);
 *   battler.removeStateCounter_NexT(stateIdOrName);
 *   battler.getStateCounter_NexT(stateIdOrName);
 *   - These match the original YEP state-counter script calls, but target the
 *     owned NextTurn temporary version.
 *
 *   battler.clearStateCounters_NexT();
 *   - Clears counter index 0 for all owned NextTurn temporary states.
 * 
 * 
 *
 *   battler.setStateXCounter(stateIdOrName, counterIndex, value);
 *   - Sets counter 'counterIndex' for state 'stateIdOrName' to 'value'.
 *
 *   battler.setStateXCounter_NexT(stateIdOrName, counterIndex, value);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.addStateXCounter(stateIdOrName, counterIndex, value);
 *   - Adds 'value' to counter 'counterIndex'.
 *
 *   battler.addStateXCounter_NexT(stateIdOrName, counterIndex, value);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.clampStateXCounter(stateIdOrName, counterIndex, min, max);
 *   - Clamps counter 'counterIndex' between 'min' and 'max'.
 *
 *   battler.clampStateXCounter_NexT(stateIdOrName, counterIndex, min, max);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.removeStateXCounter(stateIdOrName, counterIndex);
 *   - Clears counter 'counterIndex' for that state.
 *
 *   battler.removeStateXCounter_NexT(stateIdOrName, counterIndex);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.getStateXCounter(stateIdOrName, counterIndex);
 *   - Returns counter 'counterIndex' value, or 'undefined'.
 *
 *   battler.getStateXCounter_NexT(stateIdOrName, counterIndex);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.clearStateXCountersOnly();
 *   - Clears all counters except index 0 for all states.
 *
 *   battler.clearStateXCountersOnly_NexT();
 *   - Clears all counters except index 0 for all owned NextTurn temporary states.
 *
 *   battler.clearStateXCountersAll();
 *   - Clears all counter indices, including index 0, for all states.
 *
 *   battler.clearStateXCountersAll_NexT();
 *   - Clears all counter indices for all owned NextTurn temporary states.
 *

 *
 * 
 * ================================
 * State AuxVal Functions
 * ================================
 *
 * This plugin adds a hidden per-state value, called AuxVal, similar to state Counters, that can be used for any purpose.
 * AuxVals are not rendered on screen and are intended for background logic.
 *
 * Script Calls (use on a battler object) (similar to state counters):
 *
 *   battler.clearStateAuxVals();
 *   - Clears all AuxVal values for all states on that battler.
 *
 *   battler.setStateAuxVal(stateIdOrName, value);
 *   - Sets the AuxVal for a specific state ID to 'value'.
 *
 *   battler.setStateAuxVal_NexT(stateIdOrName, value);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.addStateAuxVal(stateIdOrName, value);
 *   - Adds 'value' to the current AuxVal of the specified state.
 *   - If no AuxVal exists yet, it is treated as 0 before adding.
 *
 *   battler.addStateAuxVal_NexT(stateIdOrName, value);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.clampStateAuxVal(stateIdOrName, min, max);
 *   - Clamps the current AuxVal to stay between 'min' and 'max'.
 *   - Make sure an AuxVal already exists before calling this.
 *
 *   battler.clampStateAuxVal_NexT(stateIdOrName, min, max);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.removeStateAuxVal(stateIdOrName);
 *   - Removes/clears the AuxVal for only the specified state ID.
 *
 *   battler.removeStateAuxVal_NexT(stateIdOrName);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.getStateAuxVal(stateIdOrName);
 *   - Returns the current AuxVal for the specified state ID.
 *   - Returns 'undefined' if none is set.
 *
 *   battler.getStateAuxVal_NexT(stateIdOrName);
 *   - Same as above, but targets the owned NextTurn temporary version.
 *
 *   battler.clearStateCountersAndAuxVals();
 *   - Clears counter index 0 for all states and clears all AuxVals.
 *
 *   battler.clearStateCountersAndAuxVals_NexT();
 *   - Clears counter index 0 and AuxVals for all owned NextTurn temporary states.
 *
 *   battler.clearStateXCountersOnlyAndAuxVals();
 *   - Clears all counters except index 0 for all states and clears all AuxVals.
 *
 *   battler.clearStateXCountersOnlyAndAuxVals_NexT();
 *   - Clears all counters except index 0 and AuxVals for all owned NextTurn temporary states.
 *
 *   battler.clearStateXCountersAllAndAuxVals();
 *   - Clears all counters including index 0 for all states and clears all AuxVals.
 *
 *   battler.clearStateXCountersAllAndAuxVals_NexT();
 *   - Clears all counters and AuxVals for all owned NextTurn temporary states.
 *
 *
 * ================================
 * Reapply Rule Notetag
 * ================================
 *
 *   <Reapply Rule: X>
 *   Overrides the global "Reapply Rules" plugin parameter for this specific state.
 *   X can be:
 *     0 or Ignore  - Re-applying the state does nothing to its turn count.
 *     1 or Reset   - Re-applying resets the turn count to the default amount.
 *     2 or Add     - Re-applying adds to the current turn count.
 *
 *
 * ================================
 * Extra Lunatic Timing Notetags
 * ================================
 *
 * New custom timing notetags for states (each has a pair to end the eval block, with a matching tag with "/" 
 * at the beginning, like in the original plugin):
 *
 * Regen / Degen:
 *   <Custom Degeneration Effect>
 *   <Custom Regen/Degen Effect>
 *   <Custom HP Regen Effect>
 *   <Custom MP Regen Effect>
 *   <Custom TP Regen Effect>
 *   <Custom HP Degen Effect>
 *   <Custom MP Degen Effect>
 *   <Custom TP Degen Effect>
 *
 * Increase / Decrease (actual stat delta):
 *   <Custom Any Increase Effect>
 *   <Custom HP Increase Effect>
 *   <Custom MP Increase Effect>
 *   <Custom TP Increase Effect>
 *   <Custom Any Decrease Effect>
 *   <Custom HP Decrease Effect>
 *   <Custom MP Decrease Effect>
 *   <Custom TP Decrease Effect>
 *
 * Skill hit/heal received (attempted skill intent, even if capped):
 *   <Custom Any Hit Taken Effect>
 *   <Custom HP Hit Taken Effect>
 *   <Custom MP Hit Taken Effect>
 *   <Custom TP Hit Taken Effect>
 *   <Custom Any Heal Taken Effect>
 *   <Custom HP Heal Taken Effect>
 *   <Custom MP Heal Taken Effect>
 *   <Custom TP Heal Taken Effect>
 *
 * Note:
 * - All of these timings, including the original plugin's Regeneration, ignore changes to these stats from script calls
 * or other auxiliary methods (will only consider changes from the core game mechanics, such as natural regen or damage from attacks).
 * - Degeneration/Regeneration timings are triggered by the presence of a positive/negative regen value
 * - Increase/Decrease timings are triggered by an actual stat change, so they won't trigger if the stat is capped (ex: HP full for increase, HP 0 for decrease).
 * - Hit/Heal Taken timings are triggered by skill-use intent and can trigger
 *   even if the target stat is capped (ex: HP full for heal, HP 0 for hit).
 * - HP/MP Drain count as Hit Taken for the target and Heal Taken for the user.
 * - Missed or evaded skills do not trigger Hit/Heal Taken timings, but defended damage (0 damage) still trigger them.
 * - Hit/Heal Taken timings are triggered each time a Hit/Heal is taken, not just once per state per turn
 *
 * 
 * 
 * 
 * ======== NextTurn lifecycle:
 *   <Custom NextTurn Applied Effect>
 *   - Runs when a NextTurn temporary state is created for the first time.
 *   - This happens when addStateNextTurn or addState_NexT creates a new
 *     temporary entry.
 *
 *   <Custom NextTurn ReApplied Effect>
 *   - Runs when addStateNextTurn or addState_NexT is used on a NextTurn
 *     temporary state that already exists.
 *   - This timing fires immediately on the reapplication of the temporary state,
 *     after the initial "Applied" timing fires too
 *
 *   <Custom NextTurn Arrived Effect>
 *   - Runs at the end of the current battle round, right before the temporary
 *     state is consumed and converted into the normal state.
 *
 *   <Custom NextTurn AlreadyExists Effect>
 *   - Runs at NextTurn arrival only if the normal version of the state is
 *     already on the battler before the conversion/reapply step, 
 *     after the initial "Arrived" timing fires too
 *
 * Notes for all four NextTurn timings:
 * - They run against the temporary NextTurn state object, not the normal one.
 * - That temporary state has its own state ID, turns, counters, AuxVal
 * - The temporary state inherits all notetags and plugin-added properties from
 *   the base state.
 * 
 * 
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @param NextTurn Icon Opacity
 * @type number
 * @min 0
 * @max 255
 * @desc Opacity used by NextTurn preview state icons in windows.
 * @default 127
 */
//=============================================================================

if (Imported.YEP_BuffsStatesCore) {

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.BuffsStates_JakeMSGAdd.Parameters =
    PluginManager.parameters('JakeMSG_YEP_BuffsStatesCore_Additions');
Yanfly.Param = Yanfly.Param || {};
Yanfly.Param.JakeNextTurnIconOpacity = Number(
    Yanfly.BuffsStates_JakeMSGAdd.Parameters['NextTurn Icon Opacity'] || 127
);

Yanfly.BuffsStates_JakeMSGAdd.nextTurnIconOpacity = function() {
    return Math.max(0, Math.min(255, Number(Yanfly.Param.JakeNextTurnIconOpacity || 127)));
};

Yanfly.BuffsStates_JakeMSGAdd.nextTurnPrefix = function() {
    return '(nextTurn) ';
};

Yanfly.BuffsStates_JakeMSGAdd.nextTurnTempStateId = function(baseStateId) {
    baseStateId = Number(baseStateId || 0);
    return baseStateId > 0 ? -Math.abs(baseStateId) : 0;
};

Yanfly.BuffsStates_JakeMSGAdd.nextTurnBaseStateId = function(stateId) {
    stateId = Number(stateId || 0);
    if (stateId < 0) return Math.abs(stateId);
    return stateId > 0 ? stateId : 0;
};

Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId = function(stateId) {
    stateId = Number(stateId || 0);
    return stateId < 0 && !!$dataStates[Math.abs(stateId)];
};

Yanfly.BuffsStates_JakeMSGAdd.getStateData = function(stateId) {
    stateId = Number(stateId || 0);
    if (stateId > 0) return $dataStates[stateId] || null;
    if (!Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateId)) return null;

    this._nextTurnStateCache = this._nextTurnStateCache || {};
    if (this._nextTurnStateCache[stateId]) return this._nextTurnStateCache[stateId];

    var baseStateId = Yanfly.BuffsStates_JakeMSGAdd.nextTurnBaseStateId(stateId);
    var baseState = $dataStates[baseStateId];
    if (!baseState) return null;

    var preview = Object.create(baseState);
    preview.id = stateId;
    preview.note = String(baseState.note || '');
    preview.description = String(baseState.description || '');
    preview.name = Yanfly.BuffsStates_JakeMSGAdd.nextTurnPrefix() + String(baseState.name || '');
    preview._jakeNextTurnPreview = true;
    preview._jakeBaseStateId = baseStateId;
    preview._jakePrefixText = Yanfly.BuffsStates_JakeMSGAdd.nextTurnPrefix();
    preview._jakeBaseNameText = String(baseState.name || '');
    preview._jakeOriginalState = baseState;

    this._nextTurnStateCache[stateId] = preview;
    $dataStates[stateId] = preview;
    return preview;
};

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

Yanfly.BuffsStates_JakeMSGAdd._extraStateEvalKeys = [
    'degenerateState',
    'regenDegenState',
    'hpRegenState',
    'mpRegenState',
    'tpRegenState',
    'hpDegenState',
    'mpDegenState',
    'tpDegenState',
    'anyIncreaseState',
    'hpIncreaseState',
    'mpIncreaseState',
    'tpIncreaseState',
    'anyDecreaseState',
    'hpDecreaseState',
    'mpDecreaseState',
    'tpDecreaseState',
    'anyHitTakenState',
    'hpHitTakenState',
    'mpHitTakenState',
    'tpHitTakenState',
    'anyHealTakenState',
    'hpHealTakenState',
    'mpHealTakenState',
    'tpHealTakenState',
    'nextTurnAppliedState',
    'nextTurnReAppliedState',
    'nextTurnArrivedState',
    'nextTurnAlreadyExistsState'
];

Yanfly.BuffsStates_JakeMSGAdd._ensureExtraStateEvalKeys = function(state) {
    if (!state.customEffectEval) DataManager.initStateEval(state);
    var keys = Yanfly.BuffsStates_JakeMSGAdd._extraStateEvalKeys;
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (state.customEffectEval[key] === undefined) {
            state.customEffectEval[key] = '';
        }
    }
};

Yanfly.BuffsStates_JakeMSGAdd._customTimingToEvalKey = function(rawName) {
    var name = String(rawName || '').toUpperCase();
    name = name.replace(/[ ]*\/[ ]*/g, '/').replace(/\s+/g, ' ').trim();

    if (name === 'DEGENERATION' || name === 'DEGEN') return 'degenerateState';
    if (name === 'REGEN/DEGEN' || name === 'REGEN DEGEN') return 'regenDegenState';

    if (name === 'HP REGENERATION' || name === 'HP REGEN') return 'hpRegenState';
    if (name === 'MP REGENERATION' || name === 'MP REGEN') return 'mpRegenState';
    if (name === 'TP REGENERATION' || name === 'TP REGEN') return 'tpRegenState';

    if (name === 'HP DEGENERATION' || name === 'HP DEGEN') return 'hpDegenState';
    if (name === 'MP DEGENERATION' || name === 'MP DEGEN') return 'mpDegenState';
    if (name === 'TP DEGENERATION' || name === 'TP DEGEN') return 'tpDegenState';

    if (name === 'ANY INCREASE') return 'anyIncreaseState';
    if (name === 'HP INCREASE') return 'hpIncreaseState';
    if (name === 'MP INCREASE') return 'mpIncreaseState';
    if (name === 'TP INCREASE') return 'tpIncreaseState';

    if (name === 'ANY DECREASE') return 'anyDecreaseState';
    if (name === 'HP DECREASE') return 'hpDecreaseState';
    if (name === 'MP DECREASE') return 'mpDecreaseState';
    if (name === 'TP DECREASE') return 'tpDecreaseState';

    if (name === 'ANY HIT TAKEN') return 'anyHitTakenState';
    if (name === 'HP HIT TAKEN') return 'hpHitTakenState';
    if (name === 'MP HIT TAKEN') return 'mpHitTakenState';
    if (name === 'TP HIT TAKEN') return 'tpHitTakenState';

    if (name === 'ANY HEAL TAKEN') return 'anyHealTakenState';
    if (name === 'HP HEAL TAKEN') return 'hpHealTakenState';
    if (name === 'MP HEAL TAKEN') return 'mpHealTakenState';
    if (name === 'TP HEAL TAKEN') return 'tpHealTakenState';

    if (name === 'NEXTTURN APPLIED' || name === 'NEXT TURN APPLIED') {
        return 'nextTurnAppliedState';
    }
    if (name === 'NEXTTURN REAPPLIED' || name === 'NEXT TURN REAPPLIED') {
        return 'nextTurnReAppliedState';
    }
    if (name === 'NEXTTURN ARRIVED' || name === 'NEXT TURN ARRIVED') {
        return 'nextTurnArrivedState';
    }
    if (name === 'NEXTTURN ALREADYEXISTS' || name === 'NEXT TURN ALREADY EXISTS') {
        return 'nextTurnAlreadyExistsState';
    }

    return null;
};

Yanfly.BuffsStates_JakeMSGAdd._processExtraCustomTimingNotetags = function(state) {
    Yanfly.BuffsStates_JakeMSGAdd._ensureExtraStateEvalKeys(state);
    var notedata = state.note.split(/[\r\n]+/);
    var evalType = null;
    for (var i = 0; i < notedata.length; i++) {
        var line = notedata[i];
        if (line.match(/<CUSTOM[ ](.*)[ ]EFFECT>/i)) {
            evalType = Yanfly.BuffsStates_JakeMSGAdd._customTimingToEvalKey(RegExp.$1);
        } else if (line.match(/<\/CUSTOM[ ](.*)[ ]EFFECT>/i)) {
            evalType = null;
        } else if (evalType) {
            state.customEffectEval[evalType] = state.customEffectEval[evalType] + line + '\n';
        }
    }
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
                        } else if (line.match(/<REAPPLY[ ]RULE:[ ](.+)>/i)) {
                                var ruleVal = String(RegExp.$1).trim().toLowerCase();
                                if (ruleVal === '0' || ruleVal === 'ignore') {
                                    state.reapplyRules = 0;
                                } else if (ruleVal === '1' || ruleVal === 'reset') {
                                    state.reapplyRules = 1;
                                } else if (ruleVal === '2' || ruleVal === 'add') {
                                    state.reapplyRules = 2;
                                }
                        }
                }
                state.stateCounterSettings = map[0];
                Yanfly.BuffsStates_JakeMSGAdd._processExtraCustomTimingNotetags(state);
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
    this.initNextTurnStateQueue();
};

Game_BattlerBase.prototype.initNextTurnStateQueue = function() {
    this._nextTurnStateQueue = {};
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

if (!Game_BattlerBase.prototype.getStateCounter) {
    Game_BattlerBase.prototype.getStateCounter = function(stateId) {
        if (this._stateCounter === undefined) this.initStateCounter();
        return this._stateCounter[stateId];
    };
}

Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_resetStateCounts =
  Game_BattlerBase.prototype.resetStateCounts;
Game_BattlerBase.prototype.resetStateCounts = function(stateId) {
    if (Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateId)) {
        Yanfly.BuffsStates_JakeMSGAdd.getStateData(stateId);
    }
    return Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_resetStateCounts.call(this, stateId);
};

Game_BattlerBase.prototype._stateIdByName = function(name, ownedOnly) {
    var targetName = String(name || '').trim().toUpperCase();
    if (!targetName) return 0;

    var selected = 0;
    var group;
    if (ownedOnly && this.states) {
        group = this.states();
        for (var i = 0; i < group.length; i++) {
            var state = group[i];
            if (!state || !state.name) continue;
            if (String(state.name).trim().toUpperCase() === targetName) {
                selected = Math.max(selected, state.id || 0);
            }
        }
        return selected;
    }

    group = $dataStates || [];
    for (var j = 1; j < group.length; j++) {
        var dbState = group[j];
        if (!dbState || !dbState.name) continue;
        if (String(dbState.name).trim().toUpperCase() === targetName) {
            selected = Math.max(selected, j);
        }
    }
    return selected;
};

Game_BattlerBase.prototype._nextTurnStateIdByName = function(name, ownedOnly) {
    var targetName = String(name || '').trim().toUpperCase();
    if (!targetName) return 0;

    var selected = 0;
    if (ownedOnly) {
        var ids = this.getNextTurnStateIds ? this.getNextTurnStateIds() : [];
        for (var i = 0; i < ids.length; i++) {
            var tempState = Yanfly.BuffsStates_JakeMSGAdd.getStateData(ids[i]);
            if (!tempState) continue;
            var compareName = String(tempState._jakeBaseNameText || tempState.name || '').trim().toUpperCase();
            if (compareName === targetName) {
                selected = Math.max(selected, Yanfly.BuffsStates_JakeMSGAdd.nextTurnBaseStateId(ids[i]));
            }
        }
        return selected > 0 ? Yanfly.BuffsStates_JakeMSGAdd.nextTurnTempStateId(selected) : 0;
    }

    var group = $dataStates || [];
    for (var j = 1; j < group.length; j++) {
        var dbState = group[j];
        if (!dbState || !dbState.name) continue;
        if (String(dbState.name).trim().toUpperCase() === targetName) {
            selected = Math.max(selected, j);
        }
    }
    return selected > 0 ? Yanfly.BuffsStates_JakeMSGAdd.nextTurnTempStateId(selected) : 0;
};

Game_BattlerBase.prototype.resolveStateRef = function(stateRef, ownedOnly) {
    if (stateRef === null || stateRef === undefined) return 0;

    if (typeof stateRef === 'object' && stateRef.id !== undefined) {
        stateRef = Number(stateRef.id || 0);
        if (stateRef > 0 || Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateRef)) {
            return stateRef;
        }
    }

    if (typeof stateRef === 'number') {
        stateRef = Math.floor(stateRef);
        if (stateRef > 0) return stateRef;
        return Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateRef) ? stateRef : 0;
    }

    var asNumber = Number(stateRef);
    if (!isNaN(asNumber) && String(stateRef).trim() !== '') {
        asNumber = Math.floor(asNumber);
        if (asNumber > 0) return asNumber;
        return Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(asNumber) ? asNumber : 0;
    }

    return this._stateIdByName(stateRef, !!ownedOnly);
};

Game_BattlerBase.prototype._hasNextTurnStateId = function(stateId) {
    if (this._nextTurnStateQueue === undefined) this.initNextTurnStateQueue();
    return !!this._nextTurnStateQueue[stateId];
};

Game_BattlerBase.prototype.resolveStateRef_NexT = function(stateRef, ownedOnly) {
    if (stateRef === null || stateRef === undefined) return 0;

    if (typeof stateRef === 'object' && stateRef.id !== undefined) {
        stateRef = Number(stateRef.id || 0);
        if (Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateRef)) {
            return (!ownedOnly || this._hasNextTurnStateId(stateRef)) ? stateRef : 0;
        }
    }

    if (typeof stateRef === 'number') {
        stateRef = Math.floor(stateRef);
        if (Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateRef)) {
            return (!ownedOnly || this._hasNextTurnStateId(stateRef)) ? stateRef : 0;
        }
        if (stateRef > 0) {
            stateRef = Yanfly.BuffsStates_JakeMSGAdd.nextTurnTempStateId(stateRef);
            return (!ownedOnly || this._hasNextTurnStateId(stateRef)) ? stateRef : 0;
        }
        return 0;
    }

    var asNumber = Number(stateRef);
    if (!isNaN(asNumber) && String(stateRef).trim() !== '') {
        asNumber = Math.floor(asNumber);
        if (Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(asNumber)) {
            return (!ownedOnly || this._hasNextTurnStateId(asNumber)) ? asNumber : 0;
        }
        if (asNumber > 0) {
            asNumber = Yanfly.BuffsStates_JakeMSGAdd.nextTurnTempStateId(asNumber);
            return (!ownedOnly || this._hasNextTurnStateId(asNumber)) ? asNumber : 0;
        }
        return 0;
    }

    return this._nextTurnStateIdByName(stateRef, !!ownedOnly);
};

Game_BattlerBase.prototype._normalizeNextTurnStateId = function(stateRef) {
    return this.resolveStateRef_NexT(stateRef, false);
};

Game_BattlerBase.prototype.addStateNextTurn = function(stateRef, turnsOverride) {
    var stateId = this._normalizeNextTurnStateId(stateRef);
    if (!stateId) return false;
    if (this._nextTurnStateQueue === undefined) this.initNextTurnStateQueue();
    var alreadyQueued = this._hasNextTurnStateId(stateId);
    this._nextTurnStateQueue[stateId] = true;
    this.setStateOrigin(stateId);

    this._stateTurns = this._stateTurns || [];
    if (turnsOverride !== undefined && turnsOverride !== null) {
        var turns = Number(turnsOverride);
        if (!isNaN(turns)) {
            if (turns <= 0) {
                this.removeStateNextTurn(stateId);
                return true;
            }
            var actualTurns = turns + 1;
            if (this.setStateTurns) {
                this.setStateTurns(stateId, actualTurns);
            } else {
                this._stateTurns[stateId] = actualTurns;
            }
        }
    } else if (!alreadyQueued || this._stateTurns[stateId] === undefined) {
        // New temporary states should start with the same default turn setup as normal states.
        if (this.resetStateCounts) {
            Yanfly.BuffsStates_JakeMSGAdd.getStateData(stateId);
            this.resetStateCounts(stateId);
            if (this._stateTurns[stateId] > 0) {
                this._stateTurns[stateId] += 1;
            }
        } else {
            var state = Yanfly.BuffsStates_JakeMSGAdd.getStateData(stateId);
            var minTurns = state ? Number(state.minTurns || 0) : 0;
            var maxTurns = state ? Number(state.maxTurns || minTurns) : minTurns;
            var variance = 1 + Math.max(maxTurns - minTurns, 0);
            this._stateTurns[stateId] = minTurns + Math.randomInt(variance) + 1;
        }
    }

    if (this.customEffectEval) {
        this.customEffectEval(
            stateId,
            alreadyQueued ? 'nextTurnReAppliedState' : 'nextTurnAppliedState'
        );
    }
    this.refresh();
    return true;
};

Game_BattlerBase.prototype.getNextTurnStateIds = function() {
    if (this._nextTurnStateQueue === undefined) this.initNextTurnStateQueue();
    var ids = [];
    var keys = Object.keys(this._nextTurnStateQueue);
    for (var i = 0; i < keys.length; i++) {
        var stateId = Number(keys[i] || 0);
        if (stateId > 0 && this._nextTurnStateQueue[stateId]) {
            var migrated = Yanfly.BuffsStates_JakeMSGAdd.nextTurnTempStateId(stateId);
            this._nextTurnStateQueue[migrated] = true;
            this._nextTurnStateQueue[stateId] = undefined;
            if (this._stateTurns && this._stateTurns[migrated] === undefined) {
                var legacyTurns = Number(this._stateTurns[stateId] || 0);
                this._stateTurns[migrated] = legacyTurns > 0 ? legacyTurns + 1 : legacyTurns;
            }
            if (this._stateTurns) this._stateTurns[stateId] = undefined;
            if (this._stateCounter && this._stateCounter[migrated] === undefined) {
                this._stateCounter[migrated] = this._stateCounter[stateId];
            }
            if (this._stateCounter) this._stateCounter[stateId] = undefined;
            if (this._stateAuxVals && this._stateAuxVals[migrated] === undefined) {
                this._stateAuxVals[migrated] = this._stateAuxVals[stateId];
            }
            if (this._stateAuxVals) this._stateAuxVals[stateId] = undefined;
            if (this._stateOrigin && this._stateOrigin[migrated] === undefined) {
                this._stateOrigin[migrated] = this._stateOrigin[stateId];
            }
            if (this._stateOrigin) this._stateOrigin[stateId] = undefined;
            stateId = migrated;
        }
        if (Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateId) && this._nextTurnStateQueue[stateId]) {
            ids.push(stateId);
        }
    }
    ids.sort(function(a, b) {
        return Yanfly.BuffsStates_JakeMSGAdd.nextTurnBaseStateId(a) -
            Yanfly.BuffsStates_JakeMSGAdd.nextTurnBaseStateId(b);
    });
    return ids;
};

Game_BattlerBase.prototype.hasNextTurnState = function(stateRef) {
    return !!this.resolveStateRef_NexT(stateRef, true);
};

Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_stateTurns =
  Game_BattlerBase.prototype.stateTurns;
Game_BattlerBase.prototype.stateTurns = function(stateId) {
    var turns;
    if (Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_stateTurns) {
        turns = Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_stateTurns.call(this, stateId);
    } else {
        turns = this._stateTurns ? this._stateTurns[stateId] : undefined;
    }
    if (!Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateId)) return turns;
    turns = Number(turns || 0);
    return Math.max(0, turns - 1);
};

Game_BattlerBase.prototype.getNextTurnPreviewStates = function() {
    var ids = this.getNextTurnStateIds();
    var result = [];
    for (var i = 0; i < ids.length; i++) {
        var preview = Yanfly.BuffsStates_JakeMSGAdd.getStateData(ids[i]);
        if (preview) result.push(preview);
    }
    return result;
};

Game_BattlerBase.prototype._clearNextTurnStateData = function(stateId) {
    if (!Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateId)) return;
    if (this._nextTurnStateQueue === undefined) this.initNextTurnStateQueue();
    this._nextTurnStateQueue[stateId] = undefined;
    if (this._stateTurns) this._stateTurns[stateId] = undefined;
    if (this._stateCounter) this._stateCounter[stateId] = undefined;
    if (this._stateAuxVals) this._stateAuxVals[stateId] = undefined;
    if (this._stateOrigin) this._stateOrigin[stateId] = undefined;
};

Game_BattlerBase.prototype.removeStateNextTurn = function(stateRef) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) stateId = this.resolveStateRef_NexT(stateRef, false);
    if (!stateId) return false;
    this._clearNextTurnStateData(stateId);
    this.refresh();
    return true;
};

Game_BattlerBase.prototype.getStateIconEntriesWithPreview = function() {
    var entries = [];
    var states = this.states ? this.states() : [];
    for (var i = 0; i < states.length; i++) {
        var state = states[i];
        if (!state || state.iconIndex <= 0) continue;
        entries.push({
            iconIndex: state.iconIndex,
            opacity: 255,
            stateId: state.id,
            nextTurn: false
        });
    }
    var previewStates = this.getNextTurnPreviewStates();
    var previewOpacity = Yanfly.BuffsStates_JakeMSGAdd.nextTurnIconOpacity();
    for (var j = 0; j < previewStates.length; j++) {
        var preview = previewStates[j];
        if (!preview || preview.iconIndex <= 0) continue;
        entries.push({
            iconIndex: preview.iconIndex,
            opacity: previewOpacity,
            stateId: preview.id,
            nextTurn: true
        });
    }
    return entries;
};

Game_BattlerBase.prototype._ensureStateCounterArray = function(stateId) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return [];
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
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
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
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var arr = this._ensureStateCounterArray(stateId);
    arr[index] = value;
    this.refresh();
};

Game_BattlerBase.prototype.addStateXCounter = function(stateId, counterIndex, value) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var current = this.getStateXCounter(stateId, index) || 0;
    this.setStateXCounter(stateId, index, value + current);
};

Game_BattlerBase.prototype.clampStateXCounter = function(stateId, counterIndex, min, max) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var current = this.getStateXCounter(stateId, index);
    if (current === undefined || current === null) return;
    var value = current.clamp(min, max);
    this.setStateXCounter(stateId, index, value);
};

Game_BattlerBase.prototype.removeStateXCounter = function(stateId, counterIndex) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var arr = this._ensureStateCounterArray(stateId);
    arr[index] = undefined;
};

Game_BattlerBase.prototype.getStateXCounter = function(stateId, counterIndex) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return undefined;
    var index = Yanfly.BuffsStates_JakeMSGAdd._normalizeCounterIndex(counterIndex);
    var arr = this._ensureStateCounterArray(stateId);
    return arr[index];
};

Game_BattlerBase.prototype.getStateXCounterIndices = function(stateId) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return [];
    var arr = this._ensureStateCounterArray(stateId);
    var indices = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] !== undefined) indices.push(i);
    }
    return indices;
};

Game_BattlerBase.prototype.setStateAuxVal = function(stateId, value) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    this._stateAuxVals[stateId] = value;
};

Game_BattlerBase.prototype.addStateAuxVal = function(stateId, value) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    this.setStateAuxVal(stateId, value + (this.getStateAuxVal(stateId) || 0));
};

Game_BattlerBase.prototype.clampStateAuxVal = function(stateId, min, max) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
    var current = this.getStateAuxVal(stateId);
    if (current === undefined || current === null) return;
    var value = current.clamp(min, max);
    this.setStateAuxVal(stateId, value);
};

Game_BattlerBase.prototype.removeStateAuxVal = function(stateId) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return;
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    this._stateAuxVals[stateId] = undefined;
};

Game_BattlerBase.prototype.getStateAuxVal = function(stateId) {
    stateId = this.resolveStateRef(stateId, false);
    if (!stateId) return undefined;
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    return this._stateAuxVals[stateId];
};

Game_BattlerBase.prototype.addStateTurns = function(stateRef, value) {
    var stateId = this.resolveStateRef(stateRef, true);
    if (!stateId) return false;
    if (this._stateTurns === undefined) this._stateTurns = [];

    var amount = Number(value || 0);
    var current = Number(this._stateTurns[stateId] || 0);
    var next = current + amount;

    if (next <= 0) {
        if (this.removeState) this.removeState(stateId);
        return true;
    }

    if (this.setStateTurns) {
        this.setStateTurns(stateId, next);
    } else {
        this._stateTurns[stateId] = next;
    }
    return true;
};

Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_setStateTurns =
    Game_BattlerBase.prototype.setStateTurns;
Game_BattlerBase.prototype.setStateTurns = function(stateRef, value) {
    var stateId = this.resolveStateRef(stateRef, true);
    if (!stateId) return false;
    if (this._stateTurns === undefined) this._stateTurns = [];

    var next = Number(value || 0);
    if (next <= 0) {
        if (this.removeState) this.removeState(stateId);
        return true;
    }

    if (Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_setStateTurns) {
        Yanfly.BuffsStates_JakeMSGAdd.Game_BattlerBase_setStateTurns.call(this, stateId, next);
    } else {
        this._stateTurns[stateId] = next;
    }
    return true;
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

Game_BattlerBase.prototype.addState_NexT = function(stateRef, turnsOverride) {
    return this.addStateNextTurn(stateRef, turnsOverride);
};

Game_BattlerBase.prototype.addStateTurns_NexT = function(stateRef, value) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return false;
    var currentVisible = this.stateTurns ? Number(this.stateTurns(stateId) || 0) : 0;
    var nextVisible = currentVisible + Number(value || 0);
    return this.setStateTurns_NexT(stateId, nextVisible);
};

Game_BattlerBase.prototype.setStateTurns_NexT = function(stateRef, value) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return false;
    var turns = Number(value || 0);
    if (turns <= 0) {
        this.removeStateNextTurn(stateId);
        return true;
    }
    return this.setStateTurns(stateId, turns + 1);
};

Game_BattlerBase.prototype.setStateCounter_NexT = function(stateRef, value) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.setStateCounter(stateId, value);
};

Game_BattlerBase.prototype.addStateCounter_NexT = function(stateRef, value) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.addStateCounter(stateId, value);
};

Game_BattlerBase.prototype.clampStateCounter_NexT = function(stateRef, min, max) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.clampStateCounter(stateId, min, max);
};

Game_BattlerBase.prototype.removeStateCounter_NexT = function(stateRef) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.removeStateCounter(stateId);
};

Game_BattlerBase.prototype.getStateCounter_NexT = function(stateRef) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return undefined;
    return this.getStateCounter(stateId);
};

Game_BattlerBase.prototype.clearStateCounters_NexT = function() {
    var ids = this.getNextTurnStateIds();
    for (var i = 0; i < ids.length; i++) {
        this.removeStateCounter(ids[i]);
    }
};

Game_BattlerBase.prototype.setStateXCounter_NexT = function(stateRef, counterIndex, value) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.setStateXCounter(stateId, counterIndex, value);
};

Game_BattlerBase.prototype.addStateXCounter_NexT = function(stateRef, counterIndex, value) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.addStateXCounter(stateId, counterIndex, value);
};

Game_BattlerBase.prototype.clampStateXCounter_NexT = function(stateRef, counterIndex, min, max) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.clampStateXCounter(stateId, counterIndex, min, max);
};

Game_BattlerBase.prototype.removeStateXCounter_NexT = function(stateRef, counterIndex) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.removeStateXCounter(stateId, counterIndex);
};

Game_BattlerBase.prototype.getStateXCounter_NexT = function(stateRef, counterIndex) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return undefined;
    return this.getStateXCounter(stateId, counterIndex);
};

Game_BattlerBase.prototype.clearStateXCountersOnly_NexT = function() {
    var ids = this.getNextTurnStateIds();
    for (var i = 0; i < ids.length; i++) {
        var arr = this._ensureStateCounterArray(ids[i]);
        for (var j = 1; j < arr.length; j++) {
            arr[j] = undefined;
        }
    }
};

Game_BattlerBase.prototype.clearStateXCountersAll_NexT = function() {
    var ids = this.getNextTurnStateIds();
    for (var i = 0; i < ids.length; i++) {
        this.removeStateXCountersAllForState(ids[i]);
    }
};

Game_BattlerBase.prototype.setStateAuxVal_NexT = function(stateRef, value) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.setStateAuxVal(stateId, value);
};

Game_BattlerBase.prototype.addStateAuxVal_NexT = function(stateRef, value) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.addStateAuxVal(stateId, value);
};

Game_BattlerBase.prototype.clampStateAuxVal_NexT = function(stateRef, min, max) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.clampStateAuxVal(stateId, min, max);
};

Game_BattlerBase.prototype.removeStateAuxVal_NexT = function(stateRef) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return;
    this.removeStateAuxVal(stateId);
};

Game_BattlerBase.prototype.getStateAuxVal_NexT = function(stateRef) {
    var stateId = this.resolveStateRef_NexT(stateRef, true);
    if (!stateId) return undefined;
    return this.getStateAuxVal(stateId);
};

Game_BattlerBase.prototype.clearStateAuxVals_NexT = function() {
    if (this._stateAuxVals === undefined) this.initStateAuxVals();
    var ids = this.getNextTurnStateIds();
    for (var i = 0; i < ids.length; i++) {
        this._stateAuxVals[ids[i]] = undefined;
    }
};

Game_BattlerBase.prototype.clearStateCountersAndAuxVals_NexT = function() {
    this.clearStateCounters_NexT();
    this.clearStateAuxVals_NexT();
};

Game_BattlerBase.prototype.clearStateXCountersOnlyAndAuxVals_NexT = function() {
    this.clearStateXCountersOnly_NexT();
    this.clearStateAuxVals_NexT();
};

Game_BattlerBase.prototype.clearStateXCountersAllAndAuxVals_NexT = function() {
    this.clearStateXCountersAll_NexT();
    this.clearStateAuxVals_NexT();
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

Yanfly.BuffsStates_JakeMSGAdd.Window_Base_drawItemName =
    Window_Base.prototype.drawItemName;
Window_Base.prototype.drawItemName = function(item, x, y, width) {
    if (!item || !item._jakeNextTurnPreview) {
        Yanfly.BuffsStates_JakeMSGAdd.Window_Base_drawItemName.call(this, item, x, y, width);
        return;
    }
    width = width || 312;
    var iconBoxWidth = Window_Base._iconWidth + 4;
    this.resetTextColor();

    var oldOpacity = this.contents.paintOpacity;
    if (item.iconIndex > 0) {
        this.contents.paintOpacity = Yanfly.BuffsStates_JakeMSGAdd.nextTurnIconOpacity();
        this.drawIcon(item.iconIndex, x + 2, y + 2);
        this.contents.paintOpacity = oldOpacity;
    }

    var prefix = String(item._jakePrefixText || Yanfly.BuffsStates_JakeMSGAdd.nextTurnPrefix());
    var baseName = String(item._jakeBaseNameText || item.name || '');
    var textX = x + iconBoxWidth;
    var textWidth = Math.max(0, width - iconBoxWidth);
    var normalSize = this.contents.fontSize;
    var smallSize = Math.max(10, normalSize - 2);

    this.contents.fontSize = smallSize;
    var prefixWidth = Math.min(textWidth, this.textWidth(prefix));
    this.drawText(prefix, textX, y, prefixWidth);
    this.contents.fontSize = normalSize;
    this.drawText(baseName, textX + prefixWidth, y, Math.max(0, textWidth - prefixWidth));
};

Yanfly.BuffsStates_JakeMSGAdd.Window_Base_drawActorIcons =
    Window_Base.prototype.drawActorIcons;
Window_Base.prototype.drawActorIcons = function(actor, x, y, width) {
    if (!actor || !actor.getStateIconEntriesWithPreview || !actor.buffIcons) {
        Yanfly.BuffsStates_JakeMSGAdd.Window_Base_drawActorIcons.call(this, actor, x, y, width);
        return;
    }
    width = width || 144;
    var maxIcons = Math.floor(width / Window_Base._iconWidth);
    var entries = actor.getStateIconEntriesWithPreview();
    var buffs = actor.buffIcons();
    for (var i = 0; i < buffs.length; i++) {
        entries.push({ iconIndex: buffs[i], opacity: 255, nextTurn: false });
    }
    entries = entries.slice(0, maxIcons);

    var oldOpacity = this.contents.paintOpacity;
    for (var j = 0; j < entries.length; j++) {
        var entry = entries[j];
        if (!entry || entry.iconIndex <= 0) continue;
        this.contents.paintOpacity = Math.max(0, Math.min(255, Number(entry.opacity || 255)));
        this.drawIcon(entry.iconIndex, x + Window_Base._iconWidth * j, y + 2);
    }
    this.contents.paintOpacity = oldOpacity;
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
// Compatibility Hooks
//=============================================================================

if (Imported.YEP_X_InBattleStatus && typeof Window_InBattleStateList !== 'undefined') {
    Yanfly.BuffsStates_JakeMSGAdd.Window_InBattleStateList_makeItemList =
        Window_InBattleStateList.prototype.makeItemList;
    Window_InBattleStateList.prototype.makeItemList = function() {
        Yanfly.BuffsStates_JakeMSGAdd.Window_InBattleStateList_makeItemList.call(this);
        if (!this._battler || !this._battler.getNextTurnPreviewStates) return;

        var previews = this._battler.getNextTurnPreviewStates();
        if (!previews || previews.length <= 0) return;

        if (this._data && this._data.length === 1 && this._data[0] === null) {
            this._data = [];
        }

        var insertAt = this._data.length;
        for (var i = 0; i < this._data.length; i++) {
            if (typeof this._data[i] === 'string' && this._data[i].match(/BUFF[ ]\d+/i)) {
                insertAt = i;
                break;
            }
        }

        for (var j = 0; j < previews.length; j++) {
            var preview = previews[j];
            if (!this.includes || !this.includes(preview)) continue;
            this._data.splice(insertAt, 0, preview);
            insertAt += 1;
        }

        if (this._data.length <= 0) this._data.push(null);
    };
}

if (Imported.JakeMSG_YEP_X_InBattleStatus_Additions &&
    typeof Window_EnemyInBattleStateList !== 'undefined') {
    Yanfly.BuffsStates_JakeMSGAdd.Window_EnemyInBattleStateList_makeItemList =
        Window_EnemyInBattleStateList.prototype.makeItemList;
    Window_EnemyInBattleStateList.prototype.makeItemList = function() {
        Yanfly.BuffsStates_JakeMSGAdd.Window_EnemyInBattleStateList_makeItemList.call(this);
        if (!this._battler || !this._battler.getNextTurnPreviewStates) return;

        var previews = this._battler.getNextTurnPreviewStates();
        if (!previews || previews.length <= 0) return;

        if (this._data && this._data.length === 1 && this._data[0] === null) {
            this._data = [];
        }

        var insertAt = this._data.length;
        for (var i = 0; i < this._data.length; i++) {
            if (typeof this._data[i] === 'string' && this._data[i].match(/BUFF[ ]\d+/i)) {
                insertAt = i;
                break;
            }
        }

        for (var j = 0; j < previews.length; j++) {
            var preview = previews[j];
            if (!this.includes || !this.includes(preview)) continue;
            this._data.splice(insertAt, 0, preview);
            insertAt += 1;
        }

        if (this._data.length <= 0) this._data.push(null);
    };
}

if (Imported.Olivia_StateOlivia_StateTooltipDisplay &&
    typeof Window_StateIconTooltip !== 'undefined') {
    Yanfly.BuffsStates_JakeMSGAdd.Window_StateIconTooltip_setupStateText =
        Window_StateIconTooltip.prototype.setupStateText;
    Window_StateIconTooltip.prototype.setupStateText = function() {
        Yanfly.BuffsStates_JakeMSGAdd.Window_StateIconTooltip_setupStateText.call(this);
        if (!this._battler || !this._battler.getNextTurnPreviewStates) return;

        var previews = this._battler.getNextTurnPreviewStates();
        if (!previews || previews.length <= 0) return;
        var textFmt = Olivia.StateTooltipDisplay.Window.textFmt;
        var durationFmt = Olivia.StateTooltipDisplay.Window.durationFmt;

        for (var i = 0; i < previews.length; i++) {
            var state = previews[i];
            if (!state) continue;
            if (Olivia.SetupStateIconTooltipDescription) {
                Olivia.SetupStateIconTooltipDescription(state);
            }
            if (this.meetStateTooltipRequirements && !this.meetStateTooltipRequirements(state)) {
                continue;
            }

            var iconText = '\\i[' + state.iconIndex + ']';
            var nameText = state.name;
            var descText = state.description;
            var turns = this._battler.stateTurns ? this._battler.stateTurns(state.id) : (this._battler._stateTurns[state.id] || 0);
            var turnsText = durationFmt.format(turns);
            if (turns <= 0) turnsText = '';
            if (state.autoRemovalTiming <= 0) turnsText = '';
            this._text += textFmt.format(iconText, nameText, descText, turnsText) + '\n';
        }
    };
}

//=============================================================================
// Game_Battler
//=============================================================================

Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_customEffectEval =
    Game_Battler.prototype.customEffectEval;
Game_Battler.prototype.customEffectEval = function(stateId, type) {
        stateId = this.resolveStateRef ? this.resolveStateRef(stateId, false) : stateId;
        var state = Yanfly.BuffsStates_JakeMSGAdd.getStateData(stateId);
        if (!state || !state.customEffectEval) return;
        if (state.customEffectEval[type] === '') return;
        var a = this;
        var user = this;
        var target = this;
        var origin = this.stateOrigin(stateId);
        var s = $gameSwitches._data;
        var v = $gameVariables._data;
        var code = state.customEffectEval[type];
        try {
            eval(code);
        } catch (e) {
            Yanfly.Util.displayError(e, code,
                'CUSTOM STATE ' + stateId + ' CODE ERROR');
        }
};

Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_removeState =
  Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
    stateId = this.resolveStateRef ? this.resolveStateRef(stateId, false) : stateId;
        if (Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateId)) {
                this.removeStateNextTurn(stateId);
                return;
        }
    Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_removeState.call(this, stateId);
    this.removeStateXCountersAllForState(stateId);
    this.removeStateAuxVal(stateId);
};

Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_addState =
  Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateRef, turnsOverride) {
    var stateId = this.resolveStateRef ? this.resolveStateRef(stateRef, false) : Number(stateRef || 0);
    if (!stateId) return;

    if (Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateId)) {
        this.addStateNextTurn(stateId, turnsOverride);
        return;
    }

    Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_addState.call(this, stateId);

    if (turnsOverride === undefined || turnsOverride === null) return;
    if (!this.isStateAffected || !this.isStateAffected(stateId)) return;

    var turns = Number(turnsOverride);
    if (isNaN(turns)) return;
    if (turns <= 0) {
        this.removeState(stateId);
        return;
    }
    if (this.setStateTurns) {
        this.setStateTurns(stateId, turns);
    } else {
        this._stateTurns = this._stateTurns || [];
        this._stateTurns[stateId] = turns;
    }
};

Game_Battler.prototype._processNextTurnStateQueue = function() {
    if (this._nextTurnStateQueue === undefined) this.initNextTurnStateQueue();
    var ids = this.getNextTurnStateIds();
    if (ids.length <= 0) return false;

    var changed = false;
    for (var i = 0; i < ids.length; i++) {
        var tempStateId = ids[i];
        var baseStateId = Yanfly.BuffsStates_JakeMSGAdd.nextTurnBaseStateId(tempStateId);
        var alreadyExists = this.isStateAffected && this.isStateAffected(baseStateId);
        var tempActualTurns = this.stateTurns ? Number(this.stateTurns(tempStateId) || 0) : Number((this._stateTurns && this._stateTurns[tempStateId]) || 0);
        this.customEffectEval(tempStateId, 'nextTurnArrivedState');
        if (alreadyExists) this.customEffectEval(tempStateId, 'nextTurnAlreadyExistsState');
        this._clearNextTurnStateData(tempStateId);
        this.addState(baseStateId);
        if (!alreadyExists && tempActualTurns > 0 && this.isStateAffected && this.isStateAffected(baseStateId)) {
            if (this.setStateTurns) {
                this.setStateTurns(baseStateId, tempActualTurns);
            } else {
                this._stateTurns = this._stateTurns || [];
                this._stateTurns[baseStateId] = tempActualTurns;
            }
        }
        changed = true;
    }
    this.refresh();
    return changed;
};

Yanfly.BuffsStates_JakeMSGAdd.BattleManager_startTurn = BattleManager.startTurn;
BattleManager.startTurn = function() {
    this._jakeNextTurnRoundProcessed = false;
    Yanfly.BuffsStates_JakeMSGAdd.BattleManager_startTurn.call(this);
};

BattleManager.processNextTurnStateQueues = function() {
    if (!$gameParty.inBattle()) return false;
    var members = this.allBattleMembers ? this.allBattleMembers() : [];
    var changed = false;
    for (var i = 0; i < members.length; i++) {
        var battler = members[i];
        if (!battler || !battler._processNextTurnStateQueue) continue;
        changed = battler._processNextTurnStateQueue() || changed;
    }
    if (changed) {
        if (this.refreshStatus) this.refreshStatus();
        if (this.refreshAllMembers) this.refreshAllMembers();
    }
    return changed;
};

Yanfly.BuffsStates_JakeMSGAdd.BattleManager_updateTurnEnd = BattleManager.updateTurnEnd;
BattleManager.updateTurnEnd = function() {
    if (!this._jakeNextTurnRoundProcessed) {
        this._jakeNextTurnRoundProcessed = true;
        this.processNextTurnStateQueues();
    }
    Yanfly.BuffsStates_JakeMSGAdd.BattleManager_updateTurnEnd.call(this);
};

Game_Battler.prototype.hasPositiveNaturalRegeneration = function() {
    var regen = this.naturalRegenValues();
    return regen.hp > 0 || regen.mp > 0 || regen.tp > 0;
};

Game_Battler.prototype.naturalRegenValues = function() {
    var hpValue = Math.floor(this.mhp * this.hrg);
    hpValue = Math.max(hpValue, -this.maxSlipDamage());
    var mpValue = Math.floor(this.mmp * this.mrg);
    var tpValue = Math.floor(100 * this.trg);
    return {
        hp: hpValue,
        mp: mpValue,
        tp: tpValue
    };
};

Game_Battler.prototype.hasNegativeNaturalDegeneration = function() {
    var regen = this.naturalRegenValues();
    return regen.hp < 0 || regen.mp < 0 || regen.tp < 0;
};

Game_Battler.prototype._runValueChangeStateEffects = function(hpDelta, mpDelta, tpDelta, skillBased) {
    if (!$gameParty.inBattle()) return;
    if (!hpDelta && !mpDelta && !tpDelta) return;

    var anyIncrease = hpDelta > 0 || mpDelta > 0 || tpDelta > 0;
    var anyDecrease = hpDelta < 0 || mpDelta < 0 || tpDelta < 0;
    var states = this.states();
    var length = states.length;

    for (var i = 0; i < length; ++i) {
        var state = states[i];
        if (!state) continue;
        var stateId = state.id;

        if (hpDelta > 0) this.customEffectEval(stateId, 'hpIncreaseState');
        if (mpDelta > 0) this.customEffectEval(stateId, 'mpIncreaseState');
        if (tpDelta > 0) this.customEffectEval(stateId, 'tpIncreaseState');
        if (anyIncrease) this.customEffectEval(stateId, 'anyIncreaseState');

        if (hpDelta < 0) this.customEffectEval(stateId, 'hpDecreaseState');
        if (mpDelta < 0) this.customEffectEval(stateId, 'mpDecreaseState');
        if (tpDelta < 0) this.customEffectEval(stateId, 'tpDecreaseState');
        if (anyDecrease) this.customEffectEval(stateId, 'anyDecreaseState');

    }
};

Game_Battler.prototype._runSkillTakenStateEffects = function(hpIntent, mpIntent, tpIntent) {
    if (!$gameParty.inBattle()) return;
    hpIntent = Number(hpIntent || 0);
    mpIntent = Number(mpIntent || 0);
    tpIntent = Number(tpIntent || 0);
    if (!hpIntent && !mpIntent && !tpIntent) return;

    var anyHit = hpIntent < 0 || mpIntent < 0 || tpIntent < 0;
    var anyHeal = hpIntent > 0 || mpIntent > 0 || tpIntent > 0;
    var states = this.states();
    var length = states.length;
    for (var i = 0; i < length; ++i) {
        var state = states[i];
        if (!state) continue;
        var stateId = state.id;

        if (hpIntent < 0) this.customEffectEval(stateId, 'hpHitTakenState');
        if (mpIntent < 0) this.customEffectEval(stateId, 'mpHitTakenState');
        if (tpIntent < 0) this.customEffectEval(stateId, 'tpHitTakenState');
        if (anyHit) this.customEffectEval(stateId, 'anyHitTakenState');

        if (hpIntent > 0) this.customEffectEval(stateId, 'hpHealTakenState');
        if (mpIntent > 0) this.customEffectEval(stateId, 'mpHealTakenState');
        if (tpIntent > 0) this.customEffectEval(stateId, 'tpHealTakenState');
        if (anyHeal) this.customEffectEval(stateId, 'anyHealTakenState');
    }
};

Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_regenerateStateEffects =
    Game_Battler.prototype.regenerateStateEffects;
Game_Battler.prototype.regenerateStateEffects = function(stateId) {
    var regen = this._jakeNaturalRegenValues || this.naturalRegenValues();
    var hpRegen = regen.hp > 0;
    var mpRegen = regen.mp > 0;
    var tpRegen = regen.tp > 0;
    var hpDegen = regen.hp < 0;
    var mpDegen = regen.mp < 0;
    var tpDegen = regen.tp < 0;
    var anyRegen = hpRegen || mpRegen || tpRegen;
    var anyDegen = hpDegen || mpDegen || tpDegen;
    if (!anyRegen && !anyDegen) return;

    if ($gameParty.inBattle()) this.clearResult();
    var lifeState = this.isAlive();

    if (hpRegen) this.customEffectEval(stateId, 'hpRegenState');
    if (mpRegen) this.customEffectEval(stateId, 'mpRegenState');
    if (tpRegen) this.customEffectEval(stateId, 'tpRegenState');
    if (hpDegen) this.customEffectEval(stateId, 'hpDegenState');
    if (mpDegen) this.customEffectEval(stateId, 'mpDegenState');
    if (tpDegen) this.customEffectEval(stateId, 'tpDegenState');

    if (anyRegen) this.customEffectEval(stateId, 'regenerateState');
    if (anyDegen) this.customEffectEval(stateId, 'degenerateState');
    this.customEffectEval(stateId, 'regenDegenState');

    if ($gameParty.inBattle() && this.isDead() && lifeState === true) {
        this.performCollapse();
    }
    if (Imported.YEP_BattleEngineCore && $gameParty.inBattle()) {
        this.startDamagePopup();
    }
};

Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_regenerateAll =
    Game_Battler.prototype.regenerateAll;
Game_Battler.prototype.regenerateAll = function() {
    if (!$gameParty.inBattle()) {
        Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_regenerateAll.call(this);
        return;
    }

    var hpBefore = this.hp;
    var mpBefore = this.mp;
    var tpBefore = this.tp;
    this._jakeNaturalRegenValues = this.naturalRegenValues();

    Yanfly.BuffsStates_JakeMSGAdd.Game_Battler_regenerateAll.call(this);

    var hpDelta = this.hp - hpBefore;
    var mpDelta = this.mp - mpBefore;
    var tpDelta = this.tp - tpBefore;
    this._jakeNaturalRegenValues = undefined;
    this._runValueChangeStateEffects(hpDelta, mpDelta, tpDelta, false);
};

//=============================================================================
// Game_Action
//=============================================================================

Yanfly.BuffsStates_JakeMSGAdd.Game_Action_executeDamage =
    Game_Action.prototype.executeDamage;
Game_Action.prototype.executeDamage = function(target, value) {
    var hpBefore = target.hp;
    var mpBefore = target.mp;
    var tpBefore = target.tp;

    Yanfly.BuffsStates_JakeMSGAdd.Game_Action_executeDamage.call(this, target, value);

    if (!target || !target._runValueChangeStateEffects) return;
    var hpDelta = target.hp - hpBefore;
    var mpDelta = target.mp - mpBefore;
    var tpDelta = target.tp - tpBefore;
    var skillBased = this.isSkill && this.isSkill();
    target._runValueChangeStateEffects(hpDelta, mpDelta, tpDelta, skillBased);

    var hitConfirmed = target.result && target.result() && target.result().isHit();
    if (skillBased && hitConfirmed && target._runSkillTakenStateEffects) {
        var intent = this._skillDamageIntent();
        var hpIntent = intent.hp;
        var mpIntent = intent.mp;
        target._runSkillTakenStateEffects(hpIntent, mpIntent, 0);

        var subject = this.subject ? this.subject() : null;
        if (subject && subject._runSkillTakenStateEffects) {
            var drainIntent = this._skillDrainUserIntent();
            subject._runSkillTakenStateEffects(drainIntent.hp, drainIntent.mp, 0);
        }
    }
};

Game_Action.prototype._skillDamageIntent = function() {
    var intent = { hp: 0, mp: 0 };
    var item = this.item ? this.item() : null;
    var dmg = item && item.damage ? item.damage : null;
    var type = dmg ? Number(dmg.type || 0) : 0;

    if (type === 1 || type === 5) {
        intent.hp = -1;
    } else if (type === 3) {
        intent.hp = 1;
    } else if (type === 2 || type === 6) {
        intent.mp = -1;
    } else if (type === 4) {
        intent.mp = 1;
    }

    return intent;
};

Game_Action.prototype._skillDrainUserIntent = function() {
    var intent = { hp: 0, mp: 0 };
    var item = this.item ? this.item() : null;
    var dmg = item && item.damage ? item.damage : null;
    var type = dmg ? Number(dmg.type || 0) : 0;

    if (type === 5) {
        intent.hp = 1;
    } else if (type === 6) {
        intent.mp = 1;
    }

    return intent;
};

Game_Action.prototype._skillEffectIntent = function(target, effect) {
    var intent = { hp: 0, mp: 0, tp: 0 };
    if (!effect) return intent;

    if (effect.code === Game_Action.EFFECT_RECOVER_HP) {
        var hpValue = (target.mhp * effect.value1 + effect.value2) * target.rec;
        if (this.isItem && this.isItem()) hpValue *= this.subject().pha;
        hpValue = Math.floor(hpValue);
        if (hpValue > 0) intent.hp = 1;
        if (hpValue < 0) intent.hp = -1;
    } else if (effect.code === Game_Action.EFFECT_RECOVER_MP) {
        var mpValue = (target.mmp * effect.value1 + effect.value2) * target.rec;
        if (this.isItem && this.isItem()) mpValue *= this.subject().pha;
        mpValue = Math.floor(mpValue);
        if (mpValue > 0) intent.mp = 1;
        if (mpValue < 0) intent.mp = -1;
    } else if (effect.code === Game_Action.EFFECT_GAIN_TP) {
        var tpValue = Math.floor(effect.value1);
        if (tpValue > 0) intent.tp = 1;
        if (tpValue < 0) intent.tp = -1;
    }

    return intent;
};

Yanfly.BuffsStates_JakeMSGAdd.Game_Action_applyItemEffect =
    Game_Action.prototype.applyItemEffect;
Game_Action.prototype.applyItemEffect = function(target, effect) {
    var hpBefore = target.hp;
    var mpBefore = target.mp;
    var tpBefore = target.tp;

    Yanfly.BuffsStates_JakeMSGAdd.Game_Action_applyItemEffect.call(this, target, effect);

    if (!target || !target._runValueChangeStateEffects) return;
    var hpDelta = target.hp - hpBefore;
    var mpDelta = target.mp - mpBefore;
    var tpDelta = target.tp - tpBefore;
    var skillBased = this.isSkill && this.isSkill();
    target._runValueChangeStateEffects(hpDelta, mpDelta, tpDelta, skillBased);

    var hitConfirmed = target.result && target.result() && target.result().isHit();
    if (skillBased && hitConfirmed && target._runSkillTakenStateEffects) {
        var intent = this._skillEffectIntent(target, effect);
        target._runSkillTakenStateEffects(intent.hp, intent.mp, intent.tp);
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
