//=============================================================================
// JakeMSG_BattleAutoModes
// JakeMSG_BattleAutoModes.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_BattleAutoModes = true;

var JakeMSG = JakeMSG || {};
JakeMSG.BattleAutoModes = JakeMSG.BattleAutoModes || {};

//=============================================================================
/*:
 * @plugindesc Adds auto-mode modes for battles, for both the whole Party and
each individual Actor. Includes customizable "XAuto" mode, that allows to set,
then load, automatic turn actions (in separate slots), and even allows Importing /
Exporting of XAuto slots.
 * @author JakeMSG
 * v1.0
 *
============ Change Log ============
1.0 - 8.12th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 *
 * This plugin adds an "Auto" battle command for:
 *   - Team-Wide Auto  (Party Command menu)
 *   - Individual Auto (each Actor Command menu)
 *
 * Both open the same submenu structure:
 *   Auto
 *     -> Auto   (Repeat / Random / N.Attack / Defend / BLANK)
 *     -> XAuto  (Save / Load / Rename / Export / Import)
 *
 * Team-Wide Auto sets actions for the entire active party, then starts the
 * turn. Individual Auto sets actions only for the current actor, then moves
 * on to the next party member (same flow as finishing that actor's input).
 *
 * Cursor positions in Auto menus are remembered when the Options setting
 * "Remember Command" is ON. Opening a submenu closes its parent; Cancel
 * reopens the parent menu (vanilla battle-command behavior).
 *
 * ============================================================================
 * Action Rules (all modes)
 * ============================================================================
 *
 * - Multi-action actors: every available action slot is processed.
 * - If a setting provides fewer actions than the actor has: remaining slots
 *   are left blank (no action).
 * - If a setting provides more actions than available: only as many as the
 *   actor currently has are applied, in order; the rest are omitted.
 * - If a chosen action cannot be used (missing cost, sealed skill, YEP_SkillCore
 *   HP/MP/TP/custom cost restrictions, etc.): that slot is left blank.
 * - Saved actions are keyed by Actor ID, not party formation position.
 * - Settings for actors not in the active party are ignored when applying.
 * - If a party-wide setting has no entry for an actor who is now in the
 *   active party: that actor gets blank actions.
 *
 * ============================================================================
 * Auto Submenu
 * ============================================================================
 *
 * Repeat   - Repeats action(s) done last turn.
 * Random   - Chooses usable action(s) at random (attack + usable skills).
 * N.Attack - Only Normal Attacks (if available); otherwise blank.
 * Defend   - Only Defends (if available); otherwise blank.
 * BLANK    - No actions at all.
 *
 * ============================================================================
 * XAuto Submenu (20 slots)
 * ============================================================================
 *
 * Default slot names: "Slot 1" ... "Slot 20".
 * Default unset actor setting: BLANK (empty action list).
 *
 * Save    - Saves last-turn action(s) into the chosen slot, then returns to
 *           the XAuto menu (does not advance the turn / next actor).
 *           Team-Wide: merges by Actor ID (updates actors currently able to
 *           act; leaves other actor entries in that slot untouched).
 *           Individual: always overrides that actor's slot.
 * Load    - Loads the slot's action(s) and advances (team turn start /
 *           next actor). Missing/blank slot data => blank actions.
 * Rename  - Renames a slot via text input, then returns to XAuto.
 *           (Cancel with an empty name exits text input back to XAuto.)
 * Export  - Writes the slot to the game's Save folder as:
 *             XAuto_TeamWide_<SlotName>.json
 *             XAuto_Individual_<ActorID>_<SlotName>.json
 *           Then returns to XAuto.
 * Import  - Imports into the chosen slot from a Save-folder file. The text
 *           prompt defaults to the matching Export filename for that slot.
 *           Team-Wide import merges by Actor ID (override on same ID).
 *           Individual import always overrides.
 *           Then returns to XAuto.
 *           (Cancel with an empty name exits text input back to XAuto.)
 *
 * All XAuto changes are stored in the current save file.
 * Individual XAuto slot data is only created in the save when Save or Rename
 * is used for that actor (avoids savefile bloat).
 *
 * ============================================================================
 * Disabling Auto Modes
 * ============================================================================
 *
 * Script calls (globals) and an actor notetag can temporarily disable Auto.
 * Global-scope settings are stored in the save file. CurrentBattle-scope
 * settings last only for the battle they are set in, and override Global
 * for that battle only.
 *
 * ------------------------------------------------
 * autoBattleModes(scope, options, availability)
 * ------------------------------------------------
 * scope        - "CurrentBattle" (default) or "Global"
 * options      - "TeamWide", "Individual", or "Both" (default)
 * availability - true/false (default false = disable)
 *
 * Examples:
 *   autoBattleModes()
 *   autoBattleModes("Global", "TeamWide", false)
 *   autoBattleModes("CurrentBattle", "Both", true)
 *
 * ------------------------------------------------
 * memberAutoBattleMode(partyMemberID, scope, availability)
 * ------------------------------------------------
 * Affects Individual Auto for one active party member.
 * partyMemberID - 0-based index in the active party (default 0 = leader).
 * Remembered globally by Actor ID (not formation slot).
 *
 * Example:
 *   memberAutoBattleMode(1, "Global", false)
 *
 * ------------------------------------------------
 * actorAutoBattleMode(actorID, scope, availability)
 * ------------------------------------------------
 * Same as above, but targets a database Actor ID directly.
 *
 * Example:
 *   actorAutoBattleMode(5, "CurrentBattle", false)
 *
 * ------------------------------------------------
 * Actor Notetag: <Disable Auto Mode>
 * ------------------------------------------------
 * Same as: actorAutoBattleMode(id, "Global", false)
 * Can still be overridden for one battle with a CurrentBattle script call.
 *
 * ============================================================================
 * Compatible Plugins
 * ============================================================================
 *
 * YEP_SkillCore - skill usability / cost checks (HP cost, custom costs,
 *                 eval requirements, etc.) are respected when deciding
 *                 whether an auto-chosen or loaded action can be set.
 *
 * Place this plugin below YEP_SkillCore in the Plugin Manager.
 *
 * ============================================================================
 * Module Plugins
 * ============================================================================
 *
 * (none)
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @param --- PARAMETERS ---
 * @default
 *
 */
//=============================================================================

(function() {

'use strict';

var BAM = JakeMSG.BattleAutoModes;
BAM.SLOT_COUNT = 20;
BAM.SLOT_VISIBLE = 4;

//-----------------------------------------------------------------------------
// Utility
//-----------------------------------------------------------------------------

BAM.normalizeScope = function(scope) {
    if (scope === 'Global' || scope === 'CurrentBattle') return scope;
    return 'CurrentBattle';
};

BAM.normalizeOptions = function(options) {
    if (options === 'TeamWide' || options === 'Individual' || options === 'Both') {
        return options;
    }
    return 'Both';
};

BAM.normalizeAvailability = function(availability) {
    if (availability === true || availability === 'true' || availability === 1 ||
        availability === '1' || availability === 'True') {
        return true;
    }
    return false;
};

BAM.normalizeActorId = function(actorId) {
    var id = Number(actorId);
    return isNaN(id) || id < 1 ? 0 : Math.floor(id);
};

BAM.normalizePartyMemberId = function(partyMemberID) {
    var id = Number(partyMemberID);
    if (isNaN(id) || id < 0) return 0;
    return Math.floor(id);
};

BAM.defaultSlotName = function(index) {
    return 'Slot ' + (index + 1);
};

BAM.sanitizeFileName = function(name) {
    return String(name || 'Slot').replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_').trim() || 'Slot';
};

BAM.exportFileName = function(teamWide, actorId, slotName) {
    if (teamWide) {
        return 'XAuto_TeamWide_' + BAM.sanitizeFileName(slotName) + '.json';
    }
    return 'XAuto_Individual_' + actorId + '_' + BAM.sanitizeFileName(slotName) + '.json';
};

BAM.saveDirPath = function() {
    if (StorageManager.isLocalMode && StorageManager.isLocalMode()) {
        return StorageManager.localFileDirectoryPath();
    }
    return null;
};

BAM.writeSaveFolderJson = function(fileName, object) {
    var json = JSON.stringify(object, null, 2);
    var dir = BAM.saveDirPath();
    if (dir) {
        var fs = require('fs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        fs.writeFileSync(dir + fileName, json, 'utf8');
        return true;
    }
    try {
        localStorage.setItem('BAM_XAuto_' + fileName, json);
        return true;
    } catch (e) {
        return false;
    }
};

BAM.readSaveFolderJson = function(fileName) {
    var dir = BAM.saveDirPath();
    if (dir) {
        var fs = require('fs');
        var path = dir + fileName;
        if (!fs.existsSync(path)) return null;
        try {
            return JSON.parse(fs.readFileSync(path, 'utf8'));
        } catch (e) {
            return null;
        }
    }
    try {
        var raw = localStorage.getItem('BAM_XAuto_' + fileName);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
};

BAM.serializeAction = function(action) {
    if (!action || !action.item()) {
        return { type: 'blank', itemId: 0, targetIndex: -1 };
    }
    return {
        type: action.isSkill() ? 'skill' : (action.isItem() ? 'item' : 'blank'),
        itemId: action.item().id,
        targetIndex: action._targetIndex
    };
};

BAM.serializeActorActions = function(actor) {
    var list = [];
    if (!actor) return list;
    for (var i = 0; i < actor.numActions(); i++) {
        list.push(BAM.serializeAction(actor.action(i)));
    }
    return list;
};

BAM.applySerializedAction = function(actor, actionIndex, data) {
    var action = actor.action(actionIndex);
    if (!action) return;
    action.clear();
    if (!data || data.type === 'blank' || !data.itemId) return;
    if (data.type === 'skill') {
        var skill = $dataSkills[data.itemId];
        if (skill && actor.canUse(skill)) {
            action.setSkill(data.itemId);
            action.setTarget(data.targetIndex);
        }
    } else if (data.type === 'item') {
        var item = $dataItems[data.itemId];
        if (item && actor.canUse(item)) {
            action.setItem(data.itemId);
            action.setTarget(data.targetIndex);
        }
    }
};

BAM.clearActorActions = function(actor) {
    for (var i = 0; i < actor.numActions(); i++) {
        actor.action(i).clear();
    }
};

BAM.applyActionListToActor = function(actor, actionList) {
    BAM.clearActorActions(actor);
    if (!actionList || !actionList.length) return;
    var max = actor.numActions();
    for (var i = 0; i < max && i < actionList.length; i++) {
        BAM.applySerializedAction(actor, i, actionList[i]);
    }
};

BAM.makeRandomActionData = function(actor) {
    var list = [];
    if (actor.canAttack()) {
        list.push({ type: 'skill', itemId: actor.attackSkillId(), targetIndex: -1 });
    }
    actor.usableSkills().forEach(function(skill) {
        list.push({ type: 'skill', itemId: skill.id, targetIndex: -1 });
    });
    if (list.length === 0) return { type: 'blank', itemId: 0, targetIndex: -1 };
    var pick = list[Math.randomInt(list.length)];
    if (pick.type === 'skill') {
        var action = new Game_Action(actor);
        action.setSkill(pick.itemId);
        if (action.needsSelection()) {
            if (action.isForOpponent()) {
                var enemy = $gameTroop.randomTarget();
                pick.targetIndex = enemy ? enemy.index() : -1;
            } else {
                var friend = action.isForDeadFriend() ?
                    $gameParty.randomDeadTarget() : $gameParty.randomTarget();
                pick.targetIndex = friend ? friend.index() : -1;
            }
        }
    }
    return pick;
};

BAM.applyModeToActor = function(actor, mode) {
    if (!actor) return;
    var n = actor.numActions();
    var i, data, history;
    BAM.clearActorActions(actor);
    switch (mode) {
    case 'repeat':
        history = BAM.getLastActions(actor.actorId());
        for (i = 0; i < n && i < history.length; i++) {
            BAM.applySerializedAction(actor, i, history[i]);
        }
        break;
    case 'random':
        for (i = 0; i < n; i++) {
            data = BAM.makeRandomActionData(actor);
            BAM.applySerializedAction(actor, i, data);
        }
        break;
    case 'attack':
        for (i = 0; i < n; i++) {
            if (actor.canAttack()) {
                actor.action(i).setAttack();
                var foe = $gameTroop.randomTarget();
                if (foe) actor.action(i).setTarget(foe.index());
            }
        }
        break;
    case 'defend':
        for (i = 0; i < n; i++) {
            if (actor.canGuard()) {
                actor.action(i).setGuard();
            }
        }
        break;
    case 'blank':
    default:
        break;
    }
    actor.setActionState('waiting');
};

BAM.snapshotPartyActions = function() {
    if (!$gameParty) return;
    $gameParty.members().forEach(function(actor) {
        if (!actor) return;
        BAM.setLastActions(actor.actorId(), BAM.serializeActorActions(actor));
    });
};

BAM.setLastActions = function(actorId, list) {
    if (!$gameTemp._bamLastActions) $gameTemp._bamLastActions = {};
    $gameTemp._bamLastActions[actorId] = list || [];
};

BAM.getLastActions = function(actorId) {
    if (!$gameTemp._bamLastActions) return [];
    return $gameTemp._bamLastActions[actorId] || [];
};

//-----------------------------------------------------------------------------
// Disable / Availability
//-----------------------------------------------------------------------------

BAM.ensureSystemData = function() {
    if (!$gameSystem._bamData) {
        $gameSystem._bamData = {
            teamWideSlots: null,
            individualSlots: {},
            disable: {
                teamWide: true,
                individual: true,
                actors: {}
            },
            lastIndex: {
                party: {},
                actors: {}
            }
        };
    }
    var d = $gameSystem._bamData;
    if (!d.disable) d.disable = { teamWide: true, individual: true, actors: {} };
    if (d.disable.teamWide === undefined) d.disable.teamWide = true;
    if (d.disable.individual === undefined) d.disable.individual = true;
    if (!d.disable.actors) d.disable.actors = {};
    if (!d.individualSlots) d.individualSlots = {};
    if (!d.lastIndex) d.lastIndex = { party: {}, actors: {} };
    if (!d.lastIndex.party) d.lastIndex.party = {};
    if (!d.lastIndex.actors) d.lastIndex.actors = {};
    return d;
};

BAM.ensureTempData = function() {
    if (!$gameTemp._bamBattleDisable) {
        $gameTemp._bamBattleDisable = {
            teamWide: undefined,
            individual: undefined,
            actors: {}
        };
    }
    if (!$gameTemp._bamLastActions) $gameTemp._bamLastActions = {};
    return $gameTemp._bamBattleDisable;
};

BAM.actorHasDisableNotetag = function(actorId) {
    var data = $dataActors[actorId];
    return !!(data && data.meta && data.meta.bamDisableAutoMode);
};

BAM.isTeamWideAvailable = function() {
    BAM.ensureSystemData();
    BAM.ensureTempData();
    var battle = $gameTemp._bamBattleDisable;
    if (battle.teamWide !== undefined) return !!battle.teamWide;
    return !!$gameSystem._bamData.disable.teamWide;
};

BAM.isIndividualAvailable = function(actor) {
    if (!actor) return false;
    BAM.ensureSystemData();
    BAM.ensureTempData();
    var actorId = actor.actorId();
    var battle = $gameTemp._bamBattleDisable;
    var global = $gameSystem._bamData.disable;
    if (battle.actors[actorId] !== undefined) return !!battle.actors[actorId];
    if (global.actors[actorId] !== undefined) return !!global.actors[actorId];
    if (BAM.actorHasDisableNotetag(actorId)) return false;
    if (battle.individual !== undefined) return !!battle.individual;
    return !!global.individual;
};

BAM.setDisableOption = function(scope, options, availability) {
    scope = BAM.normalizeScope(scope);
    options = BAM.normalizeOptions(options);
    availability = BAM.normalizeAvailability(availability);
    BAM.ensureSystemData();
    BAM.ensureTempData();
    var target = scope === 'Global' ? $gameSystem._bamData.disable : $gameTemp._bamBattleDisable;
    if (options === 'TeamWide' || options === 'Both') {
        target.teamWide = availability;
    }
    if (options === 'Individual' || options === 'Both') {
        target.individual = availability;
    }
};

BAM.setActorDisable = function(actorId, scope, availability) {
    actorId = BAM.normalizeActorId(actorId);
    if (!actorId) return;
    scope = BAM.normalizeScope(scope);
    availability = BAM.normalizeAvailability(availability);
    BAM.ensureSystemData();
    BAM.ensureTempData();
    if (scope === 'Global') {
        $gameSystem._bamData.disable.actors[actorId] = availability;
    } else {
        $gameTemp._bamBattleDisable.actors[actorId] = availability;
    }
};

//-----------------------------------------------------------------------------
// XAuto Slot Storage
//-----------------------------------------------------------------------------

BAM.ensureTeamWideSlots = function() {
    var d = BAM.ensureSystemData();
    if (!d.teamWideSlots || d.teamWideSlots.length !== BAM.SLOT_COUNT) {
        d.teamWideSlots = [];
        for (var i = 0; i < BAM.SLOT_COUNT; i++) {
            d.teamWideSlots.push({ name: BAM.defaultSlotName(i), actors: {} });
        }
    }
    return d.teamWideSlots;
};

BAM.ensureIndividualSlots = function(actorId, create) {
    var d = BAM.ensureSystemData();
    if (!d.individualSlots[actorId]) {
        if (!create) return null;
        d.individualSlots[actorId] = [];
        for (var i = 0; i < BAM.SLOT_COUNT; i++) {
            d.individualSlots[actorId].push({
                name: BAM.defaultSlotName(i),
                actions: []
            });
        }
    }
    return d.individualSlots[actorId];
};

BAM.getTeamWideSlot = function(index) {
    var slots = BAM.ensureTeamWideSlots();
    return slots[index] || null;
};

BAM.getIndividualSlot = function(actorId, index, create) {
    var slots = BAM.ensureIndividualSlots(actorId, create);
    if (!slots) {
        return { name: BAM.defaultSlotName(index), actions: [] };
    }
    return slots[index] || { name: BAM.defaultSlotName(index), actions: [] };
};

BAM.getSlotDisplayName = function(teamWide, actorId, index) {
    if (teamWide) {
        var slot = BAM.getTeamWideSlot(index);
        return slot ? slot.name : BAM.defaultSlotName(index);
    }
    return BAM.getIndividualSlot(actorId, index, false).name;
};

BAM.saveLastTurnToSlot = function(teamWide, actorId, slotIndex) {
    if (teamWide) {
        var slot = BAM.getTeamWideSlot(slotIndex);
        if (!slot) return;
        $gameParty.members().forEach(function(actor) {
            if (!actor || !actor.canInput()) return;
            var id = actor.actorId();
            slot.actors[id] = BAM.getLastActions(id).slice();
        });
    } else {
        var ind = BAM.ensureIndividualSlots(actorId, true);
        ind[slotIndex].actions = BAM.getLastActions(actorId).slice();
    }
};

BAM.loadSlotToActor = function(actor, teamWide, slotIndex) {
    if (!actor) return;
    var list = [];
    if (teamWide) {
        var slot = BAM.getTeamWideSlot(slotIndex);
        if (slot && slot.actors && slot.actors[actor.actorId()]) {
            list = slot.actors[actor.actorId()];
        }
    } else {
        list = BAM.getIndividualSlot(actor.actorId(), slotIndex, false).actions || [];
    }
    BAM.applyActionListToActor(actor, list);
    actor.setActionState('waiting');
};

BAM.renameSlot = function(teamWide, actorId, slotIndex, newName) {
    newName = String(newName || '').trim();
    if (!newName) newName = BAM.defaultSlotName(slotIndex);
    if (teamWide) {
        var slot = BAM.getTeamWideSlot(slotIndex);
        if (slot) slot.name = newName;
    } else {
        var ind = BAM.ensureIndividualSlots(actorId, true);
        ind[slotIndex].name = newName;
    }
};

BAM.exportSlot = function(teamWide, actorId, slotIndex) {
    var payload;
    var name;
    if (teamWide) {
        var slot = BAM.getTeamWideSlot(slotIndex);
        name = slot ? slot.name : BAM.defaultSlotName(slotIndex);
        payload = {
            version: 1,
            scope: 'TeamWide',
            name: name,
            actors: slot && slot.actors ? JSON.parse(JSON.stringify(slot.actors)) : {}
        };
    } else {
        var ind = BAM.getIndividualSlot(actorId, slotIndex, false);
        name = ind.name;
        payload = {
            version: 1,
            scope: 'Individual',
            actorId: actorId,
            name: name,
            actions: (ind.actions || []).slice()
        };
    }
    var fileName = BAM.exportFileName(teamWide, actorId, name);
    return BAM.writeSaveFolderJson(fileName, payload) ? fileName : null;
};

BAM.importSlot = function(teamWide, actorId, slotIndex, fileName) {
    var data = BAM.readSaveFolderJson(fileName);
    if (!data) return false;
    if (teamWide) {
        var slot = BAM.getTeamWideSlot(slotIndex);
        if (!slot) return false;
        if (data.name) slot.name = String(data.name);
        var actors = data.actors || {};
        Object.keys(actors).forEach(function(key) {
            slot.actors[key] = actors[key];
        });
        return true;
    }
    var ind = BAM.ensureIndividualSlots(actorId, true);
    if (data.name) ind[slotIndex].name = String(data.name);
    ind[slotIndex].actions = (data.actions || []).slice();
    return true;
};

BAM.getRememberIndex = function(teamWide, actorId, key) {
    if (!ConfigManager.commandRemember) return 0;
    BAM.ensureSystemData();
    var store = teamWide ? $gameSystem._bamData.lastIndex.party :
        $gameSystem._bamData.lastIndex.actors[actorId];
    if (!teamWide) {
        if (!$gameSystem._bamData.lastIndex.actors[actorId]) {
            $gameSystem._bamData.lastIndex.actors[actorId] = {};
        }
        store = $gameSystem._bamData.lastIndex.actors[actorId];
    }
    return store[key] || 0;
};

BAM.setRememberIndex = function(teamWide, actorId, key, index) {
    if (!ConfigManager.commandRemember) return;
    BAM.ensureSystemData();
    if (teamWide) {
        $gameSystem._bamData.lastIndex.party[key] = index;
    } else {
        if (!$gameSystem._bamData.lastIndex.actors[actorId]) {
            $gameSystem._bamData.lastIndex.actors[actorId] = {};
        }
        $gameSystem._bamData.lastIndex.actors[actorId][key] = index;
    }
};

//-----------------------------------------------------------------------------
// Global Script Calls
//-----------------------------------------------------------------------------

window.autoBattleModes = function(scope, options, availability) {
    BAM.setDisableOption(scope, options, availability);
};

window.memberAutoBattleMode = function(partyMemberID, scope, availability) {
    partyMemberID = BAM.normalizePartyMemberId(partyMemberID);
    var member = $gameParty.members()[partyMemberID];
    if (!member) return;
    BAM.setActorDisable(member.actorId(), scope, availability);
};

window.actorAutoBattleMode = function(actorID, scope, availability) {
    BAM.setActorDisable(actorID, scope, availability);
};

//-----------------------------------------------------------------------------
// DataManager - Notetags
//-----------------------------------------------------------------------------

BAM.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!BAM.DataManager_isDatabaseLoaded.call(this)) return false;
    if (!BAM._notetagsLoaded) {
        BAM.processNotetags();
        BAM._notetagsLoaded = true;
    }
    return true;
};

BAM.processNotetags = function() {
    for (var i = 1; i < $dataActors.length; i++) {
        var actor = $dataActors[i];
        if (!actor) continue;
        actor.meta = actor.meta || {};
        actor.meta.bamDisableAutoMode = false;
        var notedata = actor.note ? actor.note.split(/[\r\n]+/) : [];
        for (var n = 0; n < notedata.length; n++) {
            if (notedata[n].match(/<Disable\s*Auto\s*Mode>/i)) {
                actor.meta.bamDisableAutoMode = true;
            }
        }
    }
};

BAM.DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    BAM.DataManager_createGameObjects.call(this);
    BAM.ensureSystemData();
    BAM.ensureTempData();
};

BAM.DataManager_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function() {
    BAM.DataManager_setupNewGame.call(this);
    BAM.ensureSystemData();
    BAM.ensureTempData();
};

//-----------------------------------------------------------------------------
// BattleManager - snapshot last actions / clear battle disables
//-----------------------------------------------------------------------------

BAM.BattleManager_startTurn = BattleManager.startTurn;
BattleManager.startTurn = function() {
    BAM.snapshotPartyActions();
    BAM.BattleManager_startTurn.call(this);
};

BAM.BattleManager_endBattle = BattleManager.endBattle;
BattleManager.endBattle = function(result) {
    $gameTemp._bamBattleDisable = {
        teamWide: undefined,
        individual: undefined,
        actors: {}
    };
    BAM.BattleManager_endBattle.call(this, result);
};

//-----------------------------------------------------------------------------
// Windows - Help
//-----------------------------------------------------------------------------

function Window_BAM_Help() {
    this.initialize.apply(this, arguments);
}

Window_BAM_Help.prototype = Object.create(Window_Help.prototype);
Window_BAM_Help.prototype.constructor = Window_BAM_Help;

Window_BAM_Help.prototype.initialize = function() {
    Window_Help.prototype.initialize.call(this, 2);
    this.openness = 0;
    this.deactivate();
};

//-----------------------------------------------------------------------------
// Windows - Base Auto Command
//-----------------------------------------------------------------------------

function Window_BAM_Command() {
    this.initialize.apply(this, arguments);
}

Window_BAM_Command.prototype = Object.create(Window_Command.prototype);
Window_BAM_Command.prototype.constructor = Window_BAM_Command;

Window_BAM_Command.prototype.initialize = function() {
    var y = Graphics.boxHeight - this.windowHeight();
    Window_Command.prototype.initialize.call(this, 0, y);
    this.openness = 0;
    this.deactivate();
    this._helpWindow = null;
    this._descriptions = {};
};

Window_BAM_Command.prototype.windowWidth = function() {
    return 192;
};

Window_BAM_Command.prototype.numVisibleRows = function() {
    return 4;
};

Window_BAM_Command.prototype.setHelpWindow = function(helpWindow) {
    this._helpWindow = helpWindow;
};

Window_BAM_Command.prototype.updateHelp = function() {
    if (!this._helpWindow) return;
    var symbol = this.currentSymbol();
    var text = this._descriptions[symbol] || '';
    this._helpWindow.setText(text);
};

Window_BAM_Command.prototype.select = function(index) {
    Window_Command.prototype.select.call(this, index);
    this.updateHelp();
};

Window_BAM_Command.prototype.setup = function(selectIndex) {
    this.clearCommandList();
    this.makeCommandList();
    this.refresh();
    this.select(selectIndex || 0);
    this.activate();
    this.open();
    if (this._helpWindow) {
        this._helpWindow.open();
        this._helpWindow.show();
        this.updateHelp();
    }
};

Window_BAM_Command.prototype.closeWithHelp = function() {
    this.close();
    this.deactivate();
    if (this._helpWindow) {
        this._helpWindow.close();
        this._helpWindow.clear();
    }
};

//-----------------------------------------------------------------------------
// Windows - Root (Auto / XAuto)
//-----------------------------------------------------------------------------

function Window_BAM_RootCommand() {
    this.initialize.apply(this, arguments);
}

Window_BAM_RootCommand.prototype = Object.create(Window_BAM_Command.prototype);
Window_BAM_RootCommand.prototype.constructor = Window_BAM_RootCommand;

Window_BAM_RootCommand.prototype.numVisibleRows = function() {
    return 2;
};

Window_BAM_RootCommand.prototype.makeCommandList = function() {
    this.addCommand('Auto', 'auto');
    this.addCommand('XAuto', 'xauto');
    this._descriptions = {
        auto: 'Automatic battle action presets.',
        xauto: 'Save, load, and manage custom auto setups.'
    };
};

//-----------------------------------------------------------------------------
// Windows - Auto Modes
//-----------------------------------------------------------------------------

function Window_BAM_AutoModes() {
    this.initialize.apply(this, arguments);
}

Window_BAM_AutoModes.prototype = Object.create(Window_BAM_Command.prototype);
Window_BAM_AutoModes.prototype.constructor = Window_BAM_AutoModes;

Window_BAM_AutoModes.prototype.numVisibleRows = function() {
    return 5;
};

Window_BAM_AutoModes.prototype.makeCommandList = function() {
    this.addCommand('Repeat', 'repeat');
    this.addCommand('Random', 'random');
    this.addCommand('N.Attack', 'attack');
    this.addCommand('Defend', 'defend');
    this.addCommand('BLANK', 'blank');
    this._descriptions = {
        repeat: 'Repeats the action(s) done last turn.',
        random: 'Chooses action(s) at random.',
        attack: 'Only does Normal Attacks.',
        defend: 'Only Defends.',
        blank: 'No actions, nothing.'
    };
};

//-----------------------------------------------------------------------------
// Windows - XAuto Modes
//-----------------------------------------------------------------------------

function Window_BAM_XAutoModes() {
    this.initialize.apply(this, arguments);
}

Window_BAM_XAutoModes.prototype = Object.create(Window_BAM_Command.prototype);
Window_BAM_XAutoModes.prototype.constructor = Window_BAM_XAutoModes;

Window_BAM_XAutoModes.prototype.numVisibleRows = function() {
    return 5;
};

Window_BAM_XAutoModes.prototype.makeCommandList = function() {
    this.addCommand('Save', 'save');
    this.addCommand('Load', 'load');
    this.addCommand('Rename', 'rename');
    this.addCommand('Export', 'export');
    this.addCommand('Import', 'import');
    this._descriptions = {
        save: 'Saves the action(s) done last turn to a slot.',
        load: 'Loads the action(s) previously set to a slot.',
        rename: 'Renames XAuto slots.',
        export: 'Exports the chosen slot\'s saved settings to an external file (in the game\'s Save folder).',
        import: 'Imports settings to the chosen slot\'s from an external file (in the game\'s Save folder).'
    };
};

//-----------------------------------------------------------------------------
// Windows - Slot List
//-----------------------------------------------------------------------------

function Window_BAM_SlotList() {
    this.initialize.apply(this, arguments);
}

Window_BAM_SlotList.prototype = Object.create(Window_BAM_Command.prototype);
Window_BAM_SlotList.prototype.constructor = Window_BAM_SlotList;

Window_BAM_SlotList.prototype.numVisibleRows = function() {
    return BAM.SLOT_VISIBLE;
};

Window_BAM_SlotList.prototype.setContext = function(teamWide, actorId, mode) {
    this._teamWide = teamWide;
    this._actorId = actorId;
    this._mode = mode;
};

Window_BAM_SlotList.prototype.makeCommandList = function() {
    this._descriptions = {};
    for (var i = 0; i < BAM.SLOT_COUNT; i++) {
        var name = BAM.getSlotDisplayName(this._teamWide, this._actorId, i);
        this.addCommand(name, 'slot', true, i);
        this._descriptions['slot'] = this.modeHelpText();
    }
};

Window_BAM_SlotList.prototype.modeHelpText = function() {
    switch (this._mode) {
    case 'save':
        return 'Saves the action(s) done last turn to a slot.';
    case 'load':
        return 'Loads the action(s) previously set to a slot.';
    case 'rename':
        return 'Renames XAuto slots.';
    case 'export':
        return 'Exports the chosen slot\'s saved settings to an external file (in the game\'s Save folder).';
    case 'import':
        return 'Imports settings to the chosen slot\'s from an external file (in the game\'s Save folder).';
    default:
        return '';
    }
};

Window_BAM_SlotList.prototype.updateHelp = function() {
    if (!this._helpWindow) return;
    this._helpWindow.setText(this.modeHelpText());
};

Window_BAM_SlotList.prototype.refreshNames = function() {
    this.clearCommandList();
    this.makeCommandList();
    this.refresh();
};

//-----------------------------------------------------------------------------
// Windows - Text Edit (Rename / Import filename)
//-----------------------------------------------------------------------------

function Window_BAM_TextEdit() {
    this.initialize.apply(this, arguments);
}

Window_BAM_TextEdit.prototype = Object.create(Window_Base.prototype);
Window_BAM_TextEdit.prototype.constructor = Window_BAM_TextEdit;

Window_BAM_TextEdit.prototype.initialize = function(maxLength) {
    var width = 480;
    var height = this.fittingHeight(2);
    var x = (Graphics.boxWidth - width) / 2;
    var y = (Graphics.boxHeight - height - this.fittingHeight(9) - 8) / 2;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._maxLength = maxLength || 24;
    this._name = '';
    this._index = 0;
    this._defaultName = '';
    this.openness = 0;
    this.deactivate();
    this.refresh();
};

Window_BAM_TextEdit.prototype.windowWidth = function() {
    return this.width;
};

Window_BAM_TextEdit.prototype.name = function() {
    return this._name;
};

Window_BAM_TextEdit.prototype.setup = function(text, maxLength) {
    this._maxLength = maxLength || this._maxLength;
    this._defaultName = String(text || '');
    this._name = this._defaultName.slice(0, this._maxLength);
    this._index = this._name.length;
    this.refresh();
    this.open();
    this.show();
};

Window_BAM_TextEdit.prototype.restoreDefault = function() {
    this._name = this._defaultName.slice(0, this._maxLength);
    this._index = this._name.length;
    this.refresh();
    return this._name.length > 0;
};

Window_BAM_TextEdit.prototype.add = function(ch) {
    if (this._index < this._maxLength) {
        this._name = this._name.slice(0, this._index) + ch + this._name.slice(this._index);
        this._index++;
        this.refresh();
        return true;
    }
    return false;
};

Window_BAM_TextEdit.prototype.back = function() {
    if (this._index > 0) {
        this._index--;
        this._name = this._name.slice(0, this._index) + this._name.slice(this._index + 1);
        this.refresh();
        return true;
    }
    return false;
};

Window_BAM_TextEdit.prototype.charWidth = function() {
    var text = $gameSystem.isJapanese() ? '\uff21' : 'A';
    return this.textWidth(text);
};

Window_BAM_TextEdit.prototype.left = function() {
    var nameCenter = this.contentsWidth() / 2;
    var nameWidth = (this._maxLength + 1) * this.charWidth();
    return Math.min(nameCenter - nameWidth / 2, this.contentsWidth() - nameWidth);
};

Window_BAM_TextEdit.prototype.itemRect = function(index) {
    return {
        x: this.left() + index * this.charWidth(),
        y: 18,
        width: this.charWidth(),
        height: this.lineHeight()
    };
};

Window_BAM_TextEdit.prototype.underlineRect = function(index) {
    var rect = this.itemRect(index);
    rect.x++;
    rect.y += rect.height - 4;
    rect.width -= 2;
    rect.height = 2;
    return rect;
};

Window_BAM_TextEdit.prototype.underlineColor = function() {
    return this.normalColor();
};

Window_BAM_TextEdit.prototype.drawUnderline = function(index) {
    var rect = this.underlineRect(index);
    var color = this.underlineColor();
    this.contents.paintOpacity = 48;
    this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
    this.contents.paintOpacity = 255;
};

Window_BAM_TextEdit.prototype.drawChar = function(index) {
    var rect = this.itemRect(index);
    this.resetTextColor();
    this.drawText(this._name[index] || '', rect.x, rect.y);
};

Window_BAM_TextEdit.prototype.refresh = function() {
    this.contents.clear();
    for (var i = 0; i < this._maxLength; i++) {
        this.drawUnderline(i);
    }
    for (var j = 0; j < this._name.length; j++) {
        this.drawChar(j);
    }
    var cursor = this.itemRect(this._index);
    this.setCursorRect(cursor.x, cursor.y, cursor.width, cursor.height);
};

//-----------------------------------------------------------------------------
// Windows - Name Input (Cancel exits when text is empty)
//-----------------------------------------------------------------------------

function Window_BAM_NameInput() {
    this.initialize.apply(this, arguments);
}

Window_BAM_NameInput.prototype = Object.create(Window_NameInput.prototype);
Window_BAM_NameInput.prototype.constructor = Window_BAM_NameInput;

Window_BAM_NameInput.prototype.processHandling = function() {
    if (this.isOpen() && this.active) {
        if (Input.isTriggered('shift')) {
            this.processJump();
        }
        if (Input.isRepeated('cancel')) {
            if (this._editWindow.name().length === 0) {
                this.processCancelExit();
            } else {
                this.processBack();
            }
        }
        if (Input.isRepeated('ok')) {
            this.processOk();
        }
    }
};

Window_BAM_NameInput.prototype.processCancel = function() {
    this.processCancelExit();
};

Window_BAM_NameInput.prototype.processCancelExit = function() {
    SoundManager.playCancel();
    this.updateInputData();
    this.deactivate();
    this.callHandler('cancel');
};

//-----------------------------------------------------------------------------
// Party / Actor Command integration
//-----------------------------------------------------------------------------

BAM.Window_PartyCommand_makeCommandList = Window_PartyCommand.prototype.makeCommandList;
Window_PartyCommand.prototype.makeCommandList = function() {
    BAM.Window_PartyCommand_makeCommandList.call(this);
    if (!BAM.isTeamWideAvailable()) return;
    var escapeIndex = -1;
    for (var i = 0; i < this._list.length; i++) {
        if (this._list[i].symbol === 'escape') {
            escapeIndex = i;
            break;
        }
    }
    var cmd = { name: 'Auto', symbol: 'bamAuto', enabled: true, ext: null };
    if (escapeIndex >= 0) {
        this._list.splice(escapeIndex, 0, cmd);
    } else {
        this._list.push(cmd);
    }
};

BAM.Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
Window_ActorCommand.prototype.makeCommandList = function() {
    BAM.Window_ActorCommand_makeCommandList.call(this);
    if (this._actor && BAM.isIndividualAvailable(this._actor)) {
        this.addCommand('Auto', 'bamAuto');
    }
};

//-----------------------------------------------------------------------------
// Scene_Battle
//-----------------------------------------------------------------------------

BAM.Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    BAM.Scene_Battle_createAllWindows.call(this);
    this.createBamWindows();
};

BAM.Scene_Battle_createPartyCommandWindow = Scene_Battle.prototype.createPartyCommandWindow;
Scene_Battle.prototype.createPartyCommandWindow = function() {
    BAM.Scene_Battle_createPartyCommandWindow.call(this);
    this._partyCommandWindow.setHandler('bamAuto', this.commandBamTeamAuto.bind(this));
};

BAM.Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
Scene_Battle.prototype.createActorCommandWindow = function() {
    BAM.Scene_Battle_createActorCommandWindow.call(this);
    this._actorCommandWindow.setHandler('bamAuto', this.commandBamIndividualAuto.bind(this));
};

Scene_Battle.prototype.createBamWindows = function() {
    this._bamHelpWindow = new Window_BAM_Help();
    this.addWindow(this._bamHelpWindow);

    this._bamRootWindow = new Window_BAM_RootCommand();
    this._bamRootWindow.setHelpWindow(this._bamHelpWindow);
    this._bamRootWindow.setHandler('auto', this.onBamRootAuto.bind(this));
    this._bamRootWindow.setHandler('xauto', this.onBamRootXAuto.bind(this));
    this._bamRootWindow.setHandler('cancel', this.onBamRootCancel.bind(this));
    this.addWindow(this._bamRootWindow);

    this._bamAutoWindow = new Window_BAM_AutoModes();
    this._bamAutoWindow.setHelpWindow(this._bamHelpWindow);
    this._bamAutoWindow.setHandler('repeat', this.onBamAutoMode.bind(this, 'repeat'));
    this._bamAutoWindow.setHandler('random', this.onBamAutoMode.bind(this, 'random'));
    this._bamAutoWindow.setHandler('attack', this.onBamAutoMode.bind(this, 'attack'));
    this._bamAutoWindow.setHandler('defend', this.onBamAutoMode.bind(this, 'defend'));
    this._bamAutoWindow.setHandler('blank', this.onBamAutoMode.bind(this, 'blank'));
    this._bamAutoWindow.setHandler('cancel', this.onBamAutoCancel.bind(this));
    this.addWindow(this._bamAutoWindow);

    this._bamXAutoWindow = new Window_BAM_XAutoModes();
    this._bamXAutoWindow.setHelpWindow(this._bamHelpWindow);
    this._bamXAutoWindow.setHandler('save', this.onBamXAutoMode.bind(this, 'save'));
    this._bamXAutoWindow.setHandler('load', this.onBamXAutoMode.bind(this, 'load'));
    this._bamXAutoWindow.setHandler('rename', this.onBamXAutoMode.bind(this, 'rename'));
    this._bamXAutoWindow.setHandler('export', this.onBamXAutoMode.bind(this, 'export'));
    this._bamXAutoWindow.setHandler('import', this.onBamXAutoMode.bind(this, 'import'));
    this._bamXAutoWindow.setHandler('cancel', this.onBamXAutoCancel.bind(this));
    this.addWindow(this._bamXAutoWindow);

    this._bamSlotWindow = new Window_BAM_SlotList();
    this._bamSlotWindow.setHelpWindow(this._bamHelpWindow);
    this._bamSlotWindow.setHandler('slot', this.onBamSlotOk.bind(this));
    this._bamSlotWindow.setHandler('cancel', this.onBamSlotCancel.bind(this));
    this.addWindow(this._bamSlotWindow);

    this._bamTextEditWindow = new Window_BAM_TextEdit(48);
    this.addWindow(this._bamTextEditWindow);

    this._bamNameInputWindow = new Window_BAM_NameInput(this._bamTextEditWindow);
    this._bamNameInputWindow.setHandler('ok', this.onBamTextInputOk.bind(this));
    this._bamNameInputWindow.setHandler('cancel', this.onBamTextInputCancel.bind(this));
    this._bamNameInputWindow.openness = 0;
    this._bamNameInputWindow.deactivate();
    this.addWindow(this._bamNameInputWindow);

    this._bamTeamWide = true;
    this._bamActorId = 0;
    this._bamSlotMode = '';
    this._bamTextMode = '';
    this._bamPendingSlotIndex = 0;
};

BAM.Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
Scene_Battle.prototype.isAnyInputWindowActive = function() {
    return BAM.Scene_Battle_isAnyInputWindowActive.call(this) ||
        this._bamRootWindow.active ||
        this._bamAutoWindow.active ||
        this._bamXAutoWindow.active ||
        this._bamSlotWindow.active ||
        this._bamNameInputWindow.active;
};

Scene_Battle.prototype.bamCloseAllMenus = function() {
    this._bamRootWindow.closeWithHelp();
    this._bamAutoWindow.closeWithHelp();
    this._bamXAutoWindow.closeWithHelp();
    this._bamSlotWindow.closeWithHelp();
    this._bamTextEditWindow.close();
    this._bamTextEditWindow.deactivate();
    this._bamNameInputWindow.close();
    this._bamNameInputWindow.deactivate();
};

Scene_Battle.prototype.bamActorId = function() {
    if (this._bamTeamWide) return 0;
    var actor = BattleManager.actor();
    return actor ? actor.actorId() : this._bamActorId;
};

Scene_Battle.prototype.commandBamTeamAuto = function() {
    this._bamTeamWide = true;
    this._bamActorId = 0;
    this._partyCommandWindow.close();
    this._partyCommandWindow.deactivate();
    this.openBamRoot();
};

Scene_Battle.prototype.commandBamIndividualAuto = function() {
    this._bamTeamWide = false;
    var actor = BattleManager.actor();
    this._bamActorId = actor ? actor.actorId() : 0;
    this._actorCommandWindow.close();
    this._actorCommandWindow.deactivate();
    this.openBamRoot();
};

Scene_Battle.prototype.openBamRoot = function() {
    var index = BAM.getRememberIndex(this._bamTeamWide, this.bamActorId(), 'root');
    this._bamRootWindow.setup(index);
};

Scene_Battle.prototype.onBamRootCancel = function() {
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'root', this._bamRootWindow.index());
    this._bamRootWindow.closeWithHelp();
    if (this._bamTeamWide) {
        this._partyCommandWindow.setup();
    } else {
        this._actorCommandWindow.setup(BattleManager.actor());
    }
};

Scene_Battle.prototype.onBamRootAuto = function() {
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'root', this._bamRootWindow.index());
    this._bamRootWindow.closeWithHelp();
    var index = BAM.getRememberIndex(this._bamTeamWide, this.bamActorId(), 'auto');
    this._bamAutoWindow.setup(index);
};

Scene_Battle.prototype.onBamRootXAuto = function() {
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'root', this._bamRootWindow.index());
    this._bamRootWindow.closeWithHelp();
    var index = BAM.getRememberIndex(this._bamTeamWide, this.bamActorId(), 'xauto');
    this._bamXAutoWindow.setup(index);
};

Scene_Battle.prototype.onBamAutoCancel = function() {
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'auto', this._bamAutoWindow.index());
    this._bamAutoWindow.closeWithHelp();
    this.openBamRoot();
};

Scene_Battle.prototype.onBamXAutoCancel = function() {
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'xauto', this._bamXAutoWindow.index());
    this._bamXAutoWindow.closeWithHelp();
    this.openBamRoot();
};

Scene_Battle.prototype.onBamAutoMode = function(mode) {
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'auto', this._bamAutoWindow.index());
    this._bamAutoWindow.closeWithHelp();
    this.applyBamModeAndContinue(mode);
};

Scene_Battle.prototype.applyBamModeAndContinue = function(mode) {
    if (this._bamTeamWide) {
        $gameParty.members().forEach(function(actor) {
            if (actor && actor.canInput()) {
                BAM.applyModeToActor(actor, mode);
            }
        });
        this.bamStartTeamTurn();
    } else {
        var actor = BattleManager.actor();
        if (actor) BAM.applyModeToActor(actor, mode);
        this.bamFinishIndividualActor();
    }
};

Scene_Battle.prototype.onBamXAutoMode = function(mode) {
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'xauto', this._bamXAutoWindow.index());
    this._bamSlotMode = mode;
    this._bamXAutoWindow.closeWithHelp();
    this.openBamSlotList(mode);
};

Scene_Battle.prototype.openBamSlotList = function(mode) {
    var actorId = this.bamActorId();
    this._bamSlotWindow.setContext(this._bamTeamWide, actorId, mode);
    var index = BAM.getRememberIndex(this._bamTeamWide, actorId, 'slot_' + mode);
    this._bamSlotWindow.setup(index);
};

Scene_Battle.prototype.onBamSlotCancel = function() {
    var mode = this._bamSlotMode;
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'slot_' + mode, this._bamSlotWindow.index());
    this._bamSlotWindow.closeWithHelp();
    var index = BAM.getRememberIndex(this._bamTeamWide, this.bamActorId(), 'xauto');
    this._bamXAutoWindow.setup(index);
};

Scene_Battle.prototype.onBamSlotOk = function() {
    var mode = this._bamSlotMode;
    var slotIndex = this._bamSlotWindow.currentExt();
    BAM.setRememberIndex(this._bamTeamWide, this.bamActorId(), 'slot_' + mode, this._bamSlotWindow.index());
    this._bamPendingSlotIndex = slotIndex;
    var actorId = this.bamActorId();

    switch (mode) {
    case 'save':
        BAM.saveLastTurnToSlot(this._bamTeamWide, actorId, slotIndex);
        this._bamSlotWindow.closeWithHelp();
        this._bamXAutoWindow.setup(BAM.getRememberIndex(this._bamTeamWide, actorId, 'xauto'));
        break;
    case 'load':
        this._bamSlotWindow.closeWithHelp();
        this.applyBamLoadSlot(slotIndex);
        break;
    case 'rename':
        this._bamSlotWindow.closeWithHelp();
        this.openBamTextInput('rename', BAM.getSlotDisplayName(this._bamTeamWide, actorId, slotIndex), 24);
        break;
    case 'export':
        if (BAM.exportSlot(this._bamTeamWide, actorId, slotIndex)) {
            SoundManager.playOk();
        } else {
            SoundManager.playBuzzer();
        }
        this._bamSlotWindow.closeWithHelp();
        this._bamXAutoWindow.setup(BAM.getRememberIndex(this._bamTeamWide, actorId, 'xauto'));
        break;
    case 'import':
        this._bamSlotWindow.closeWithHelp();
        var defName = BAM.exportFileName(
            this._bamTeamWide, actorId,
            BAM.getSlotDisplayName(this._bamTeamWide, actorId, slotIndex)
        );
        this.openBamTextInput('import', defName, 64);
        break;
    }
};

Scene_Battle.prototype.applyBamLoadSlot = function(slotIndex) {
    if (this._bamTeamWide) {
        $gameParty.members().forEach(function(actor) {
            if (actor && actor.canInput()) {
                BAM.loadSlotToActor(actor, true, slotIndex);
            }
        });
        this.bamStartTeamTurn();
    } else {
        var actor = BattleManager.actor();
        if (actor) BAM.loadSlotToActor(actor, false, slotIndex);
        this.bamFinishIndividualActor();
    }
};

Scene_Battle.prototype.openBamTextInput = function(mode, defaultText, maxLength) {
    this._bamTextMode = mode;
    this._bamHelpWindow.close();
    this._bamHelpWindow.clear();
    this._bamTextEditWindow.setup(defaultText, maxLength);
    this._bamNameInputWindow.x = this._bamTextEditWindow.x;
    this._bamNameInputWindow.y = this._bamTextEditWindow.y + this._bamTextEditWindow.height + 8;
    this._bamNameInputWindow.width = this._bamTextEditWindow.width;
    this._bamNameInputWindow.createContents();
    this._bamNameInputWindow.refresh();
    this._bamNameInputWindow.open();
    this._bamNameInputWindow.activate();
    this._bamNameInputWindow.select(0);
};

Scene_Battle.prototype.onBamTextInputOk = function() {
    var text = this._bamTextEditWindow.name();
    var actorId = this.bamActorId();
    var slotIndex = this._bamPendingSlotIndex;
    this.closeBamTextInput();
    if (this._bamTextMode === 'rename') {
        BAM.renameSlot(this._bamTeamWide, actorId, slotIndex, text);
        SoundManager.playOk();
    } else if (this._bamTextMode === 'import') {
        if (BAM.importSlot(this._bamTeamWide, actorId, slotIndex, text)) {
            SoundManager.playOk();
        } else {
            SoundManager.playBuzzer();
        }
    }
    this._bamXAutoWindow.setup(BAM.getRememberIndex(this._bamTeamWide, actorId, 'xauto'));
};

Scene_Battle.prototype.onBamTextInputCancel = function() {
    this.closeBamTextInput();
    this._bamXAutoWindow.setup(BAM.getRememberIndex(this._bamTeamWide, this.bamActorId(), 'xauto'));
};

Scene_Battle.prototype.closeBamTextInput = function() {
    this._bamTextEditWindow.close();
    this._bamTextEditWindow.deactivate();
    this._bamNameInputWindow.close();
    this._bamNameInputWindow.deactivate();
};

Scene_Battle.prototype.bamStartTeamTurn = function() {
    this.bamCloseAllMenus();
    this.endCommandSelection();
    BattleManager.startTurn();
};

Scene_Battle.prototype.bamFinishIndividualActor = function() {
    this.bamCloseAllMenus();
    var actor = BattleManager.actor();
    if (actor) {
        actor._actionInputIndex = Math.max(0, actor.numActions() - 1);
    }
    this.selectNextCommand();
};

})();

//=============================================================================
// End of File
//=============================================================================
