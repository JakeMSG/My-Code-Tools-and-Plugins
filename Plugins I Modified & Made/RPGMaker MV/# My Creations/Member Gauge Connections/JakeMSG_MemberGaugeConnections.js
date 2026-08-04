//=============================================================================
// JakeMSG_MemberGaugeConnections
// JakeMSG_MemberGaugeConnections.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_MemberGaugeConnections = true;

var JakeMSG = JakeMSG || {};
JakeMSG.MemberGaugeConnections = JakeMSG.MemberGaugeConnections || {};

//=============================================================================
/*:
 * @plugindesc  Adds connections between the HP/MP/TP gauges (values) of specified
enemies/allies (thus, you can create "multi-body-parts" enemies/allies)
 * @author JakeMSG
 * v1.0
 *
============ Change Log ============
1.0 - 8.4th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 *
 * This plugin links HP / MP / TP gauge changes and/or Status Effect infliction
 * / removal between enemies and/or allies. When a linked member is affected,
 * a percentage of that gauge change (or a mirrored state change) is applied to
 * the other members in the link.
 *
 * Use cases include multi-body-part bosses, shared HP pools, one-way sacrifice
 * links, shared status effects, and persistent party-wide sharing outside battle.
 *
 * All battle-only links expire automatically at the end of battle.
 * Persist ally links remain until cleared (including across battles and saves).
 *
 * ============================================================================
 * Link Behavior
 * ============================================================================
 *
 * - Bidirectional (BiLink): any linked member that is affected transfers to
 *   every other member in the same link group.
 * - Unidirectional (UniLink): only Sources transfer to Destinations. Effects on
 *   Destinations do not feed back to Sources.
 * - By default, linked transfers do not cascade (Cascading: false). A transfer
 *   will not trigger further non-cascading links. Links with Cascading true can
 *   also be activated by link effects from other links.
 * - If a member is hit directly and also receives linked effects, amounts stack.
 * - Multiple members affected at the same time are all handled.
 * - transferPercentage: 100 = 1:1 copy, 50 = half, 200 = double, etc.
 *   (Used for gauge Damage/Heal; state mirroring always copies the state change.)
 * - GaugeCapped (default true): before applying transferPercentage, the gauge
 *   change is limited to what actually applied on the source (e.g. a Heal that
 *   would exceed MaxHP only transfers the portion up to MaxHP; Damage cannot
 *   consider more than the source's remaining HP/MP/TP).
 * - EffectsLinked filters what is transferred (see Parameter Reference).
 *
 * Troop / Party IDs always start at 0 (member index in the troop or party).
 *
 * ============================================================================
 * Plugin Parameters
 * ============================================================================
 *
 * (None)
 *
 * ============================================================================
 * Script Calls
 * ============================================================================
 *
 * All parameters may be omitted; defaults are used for missing ones.
 *
 * ---------------------------------------------------------------------------
 * Battle-only — Enemies (Troop Member IDs, 0-based)
 * ---------------------------------------------------------------------------
 *
 *   enemyBiLink(GaugesAffected, ArrayOfEnemyIDs, transferPercentage,
 *               EffectsLinked, GaugeCapped, Cascading)
 *
 *     Bidirectional link between the listed troop members.
 *     Defaults: "HP", [], 100, "Both", true, false
 *
 *     Example:
 *       enemyBiLink("HP MP", [0, 1], 100, "Damage");
 *       enemyBiLink("HP,TP", [0, 1, 2], 50, "Both", true, false);
 *       enemyBiLink("HP", [0, 1], 100, "StatesChanges", true, false);
 *
 *   enemyUniLink(GaugesAffected, EnemyIDsSources, EnemyIDsDestinations,
 *                transferPercentage, EffectsLinked, GaugeCapped, Cascading)
 *
 *     Unidirectional link: Sources transfer to Destinations.
 *     Defaults: "HP", [], [], 100, "Both", true, false
 *
 *     Example:
 *       enemyUniLink("HP", [0], [1, 2], 100, "Both");
 *       enemyUniLink("HP", [0], [1], 100, "All", true, true);
 *
 *   clearEnemyLinks(ArrayOfEnemyIDs)
 *
 *     Removes the listed enemies from all existing enemy/member battle links.
 *     Defaults: []
 *
 *     Example:
 *       clearEnemyLinks([0, 1]);
 *
 * ---------------------------------------------------------------------------
 * Battle-only — Allies (Party Member IDs, 0-based)
 * ---------------------------------------------------------------------------
 *
 *   allyBiLink(GaugesAffected, ArrayOfAllyIDs, transferPercentage,
 *              EffectsLinked, GaugeCapped, Cascading)
 *
 *     Bidirectional link between party members. Battle-only (expires at end).
 *     Defaults: "HP", [], 100, "Both", true, false
 *
 *   allyUniLink(GaugesAffected, AllyIDsSources, AllyIDsDestinations,
 *               transferPercentage, EffectsLinked, GaugeCapped, Cascading)
 *
 *     Unidirectional ally link. Battle-only.
 *     Defaults: "HP", [], [], 100, "Both", true, false
 * 
 * ---------------------------------------------------------------------------
 * Battle and on-Map — Allies (Party Member IDs, 0-based)
 * ---------------------------------------------------------------------------
 *
 *   clearAllyLinks(ArrayOfAllyIDs)
 *
 *     Removes the listed allies from battle ally/member links, and also from
 *     persistent ally links. Usable in and out of battle.
 *     Defaults: []
 *
 * ---------------------------------------------------------------------------
 * Battle-only — Mixed Members (Ally + Enemy)
 * ---------------------------------------------------------------------------
 *
 *   Member ID lists are Strings. Parse ID numbers with separators
 *   (" ", "," or ";"). Prefix ally IDs with "a" and enemy IDs with "e".
 *
 *     Examples of ID strings: "a0, e1", "a0 a1; e0", "e0,e1,e2"
 *
 *   memberBiLink(GaugesAffected, ArrayOfMemberIDs, transferPercentage,
 *                EffectsLinked, GaugeCapped, Cascading)
 *
 *     Bidirectional link among mixed allies/enemies.
 *     Defaults: "HP", "", 100, "Both", true, false
 *
 *     Example:
 *       memberBiLink("HP", "a0, e0, e1", 100, "Both");
 *
 *   memberUniLink(GaugesAffected, MemberIDsSources, MemberIDsDestinations,
 *                 transferPercentage, EffectsLinked, GaugeCapped, Cascading)
 *
 *     Unidirectional mixed link.
 *     Defaults: "HP", "", "", 100, "Both", true, false
 *
 *     Example:
 *       memberUniLink("HP MP", "e0", "a0, a1", 50, "Damage");
 *
 *   clearMemberLinks(ArrayOfMemberIDs)
 *
 *     Removes the listed members (a# / e#) from all battle links that involve
 *     them, and clears matching persistent ally links for any "a" IDs listed.
 *     Defaults: ""
 *
 *     Example:
 *       clearMemberLinks("a0, e1");
 *
 * ---------------------------------------------------------------------------
 * Persistent — Allies (in or out of battle)
 * ---------------------------------------------------------------------------
 *
 *   persistAllyBiLink(GaugesAffected, ArrayOfAllyIDs, transferPercentage,
 *                     EffectsLinked, GaugeCapped, Cascading)
 *
 *     Like allyBiLink, but the link persists after battle and can be created
 *     outside battle. Survives save/load until cleared.
 *     Defaults: "HP", [], 100, "Both", true, false
 *
 *   persistAllyUniLink(GaugesAffected, AllyIDsSources, AllyIDsDestinations,
 *                      transferPercentage, EffectsLinked, GaugeCapped, Cascading)
 *
 *     Persistent unidirectional ally link.
 *     Defaults: "HP", [], [], 100, "Both", true, false
 *
 * ============================================================================
 * Parameter Reference
 * ============================================================================
 *
 *   GaugesAffected     String. Substring components: "HP", "MP", "TP".
 *                      Separators: space, comma, semicolon.
 *                      Default: "HP"
 *                      Examples: "HP", "HP MP", "HP,MP,TP", "MP;TP"
 *                      (Ignored for state-only EffectsLinked modes.)
 *
 *   ArrayOfEnemyIDs / ArrayOfAllyIDs / Sources / Destinations
 *                      Array of 0-based member indices.
 *                      Default: []
 *
 *   ArrayOfMemberIDs / Member Sources / Destinations
 *                      String with "a"/"e" prefixed IDs and separators.
 *                      Default: ""
 *
 *   transferPercentage Number. Percent of the (optionally capped) gauge change
 *                      to apply to linked members. Default: 100
 *                      Not used for state infliction/removal mirroring.
 *
 *   EffectsLinked      What this link transfers. Default: "Both"
 *                        "Damage"            - gauge losses only
 *                        "Heal"              - gauge gains only
 *                        "Both"              - gauge damage and healing
 *                        "StatesInfliction"  - status effect infliction
 *                        "StatesRemoval"     - status effect removal
 *                        "StatesChanges"     - infliction and removal
 *                        "All"               - Damage + Heal + state infliction
 *                                              + state removal
 *
 *   GaugeCapped        Boolean. Default: true
 *                      When true, gauge transfers use only the amount that
 *                      actually changed on the source (clamped by min/max of
 *                      that gauge) before applying transferPercentage.
 *
 *   Cascading          Boolean. Default: false
 *                      When true, this link can also be triggered by linked
 *                      effects coming from other links (not only direct hits).
 *
 * ============================================================================
 * Compatible Plugins
 * ============================================================================
 *
 * - YEP_BattleEngineCore (damage application / popup queue)
 * - SRD_BattlePopupCustomizer
 *     Linked members that were not direct skill targets get damage/heal popups
 *     at the same time as the initial hit (not deferred to turn end).
 * - JakeMSG_SRD_BattlePopupCustomizer_Additions
 *     Linked status-effect popups are requested immediately the same way.
 * - YEP_BuffsStatesCore
 * - JakeMSG_YEP_BuffsStatesCore_Additions
 *     State linking mirrors turns, counters (including multi-counters), Aux
 *     values, and state origins when available.
 *
 * Place this plugin below those plugins when using them together.
 *
 */
//=============================================================================

(function() {

//=============================================================================
// Constants & State
//=============================================================================

var MGC = JakeMSG.MemberGaugeConnections;

MGC._transferDepth = 0;
MGC._transferChain = null;
MGC._battleLinks = { bi: [], uni: [] };
MGC._skipStateLink = false;

var GAUGE_HP = 'HP';
var GAUGE_MP = 'MP';
var GAUGE_TP = 'TP';

var MODE_DAMAGE = 'Damage';
var MODE_HEAL = 'Heal';
var MODE_BOTH = 'Both';
var MODE_STATES_INFLICT = 'StatesInfliction';
var MODE_STATES_REMOVAL = 'StatesRemoval';
var MODE_STATES_CHANGES = 'StatesChanges';
var MODE_ALL = 'All';

var TYPE_ALLY = 'ally';
var TYPE_ENEMY = 'enemy';

//=============================================================================
// Helpers
//=============================================================================

MGC.parseGauges = function(gaugesAffected) {
    if (gaugesAffected === undefined || gaugesAffected === null || gaugesAffected === '') {
        gaugesAffected = 'HP';
    }
    var upper = String(gaugesAffected).toUpperCase();
    var gauges = [];
    if (upper.indexOf('HP') >= 0) gauges.push(GAUGE_HP);
    if (upper.indexOf('MP') >= 0) gauges.push(GAUGE_MP);
    if (upper.indexOf('TP') >= 0) gauges.push(GAUGE_TP);
    if (gauges.length === 0) gauges.push(GAUGE_HP);
    return gauges;
};

MGC.parseMode = function(mode) {
    if (mode === undefined || mode === null || mode === '') {
        return MODE_BOTH;
    }
    var text = String(mode);
    var known = [
        MODE_DAMAGE, MODE_HEAL, MODE_BOTH,
        MODE_STATES_INFLICT, MODE_STATES_REMOVAL, MODE_STATES_CHANGES, MODE_ALL
    ];
    for (var i = 0; i < known.length; i++) {
        if (text === known[i]) return known[i];
    }
    var lower = text.toLowerCase().replace(/[\s_-]+/g, '');
    if (lower === 'damage') return MODE_DAMAGE;
    if (lower === 'heal') return MODE_HEAL;
    if (lower === 'both') return MODE_BOTH;
    if (lower === 'statesinfliction' || lower === 'stateinfliction') return MODE_STATES_INFLICT;
    if (lower === 'statesremoval' || lower === 'stateremoval') return MODE_STATES_REMOVAL;
    if (lower === 'stateschanges' || lower === 'statechanges') return MODE_STATES_CHANGES;
    if (lower === 'all') return MODE_ALL;
    return MODE_BOTH;
};

MGC.parsePercentage = function(value) {
    if (value === undefined || value === null || value === '') {
        return 100;
    }
    var n = Number(value);
    return isNaN(n) ? 100 : n;
};

MGC.parseBool = function(value, defaultValue) {
    if (value === undefined || value === null || value === '') {
        return !!defaultValue;
    }
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    var s = String(value).toLowerCase().trim();
    if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'off') return false;
    return !!defaultValue;
};

MGC.parseIdArray = function(arr) {
    if (arr === undefined || arr === null || arr === '') {
        return [];
    }
    if (typeof arr === 'string') {
        return String(arr).split(/[\s,;]+/).filter(function(s) {
            return s !== '';
        }).map(function(s) {
            return Number(s);
        }).filter(function(n) {
            return !isNaN(n);
        });
    }
    if (!Array.isArray(arr)) {
        var single = Number(arr);
        return isNaN(single) ? [] : [single];
    }
    return arr.map(function(v) {
        return Number(v);
    }).filter(function(n) {
        return !isNaN(n);
    });
};

MGC.parseMemberIdString = function(str) {
    if (str === undefined || str === null || str === '') {
        return [];
    }
    if (Array.isArray(str)) {
        str = str.join(',');
    }
    var parts = String(str).split(/[\s,;]+/).filter(function(s) {
        return s !== '';
    });
    var result = [];
    for (var i = 0; i < parts.length; i++) {
        var token = parts[i];
        var match = token.match(/^([aAeE])(\d+)$/);
        if (!match) continue;
        var type = match[1].toLowerCase() === 'a' ? TYPE_ALLY : TYPE_ENEMY;
        result.push({ type: type, id: Number(match[2]) });
    }
    return result;
};

MGC.idsToMembers = function(ids, type) {
    return MGC.parseIdArray(ids).map(function(id) {
        return { type: type, id: id };
    });
};

MGC.memberKey = function(ref) {
    return ref.type + ':' + ref.id;
};

MGC.sameMember = function(a, b) {
    return a && b && a.type === b.type && a.id === b.id;
};

MGC.getBattler = function(ref) {
    if (!ref) return null;
    if (ref.type === TYPE_ALLY) {
        var actors = $gameParty ? $gameParty.members() : null;
        return actors && actors[ref.id] ? actors[ref.id] : null;
    }
    if (ref.type === TYPE_ENEMY) {
        if (!$gameParty || !$gameParty.inBattle()) return null;
        var enemies = $gameTroop ? $gameTroop.members() : null;
        return enemies && enemies[ref.id] ? enemies[ref.id] : null;
    }
    return null;
};

MGC.battlerToRef = function(battler) {
    if (!battler) return null;
    if (battler.isActor && battler.isActor()) {
        var aIndex = battler.index();
        if (aIndex < 0) return null;
        return { type: TYPE_ALLY, id: aIndex };
    }
    if (battler.isEnemy && battler.isEnemy()) {
        var eIndex = battler.index();
        if (eIndex < 0) return null;
        return { type: TYPE_ENEMY, id: eIndex };
    }
    return null;
};

MGC.modeAllowsGauge = function(mode, value) {
    if (value === 0) return false;
    if (mode === MODE_ALL || mode === MODE_BOTH) return true;
    if (mode === MODE_DAMAGE) return value < 0;
    if (mode === MODE_HEAL) return value > 0;
    return false;
};

MGC.modeAllowsStateInflict = function(mode) {
    return mode === MODE_STATES_INFLICT || mode === MODE_STATES_CHANGES || mode === MODE_ALL;
};

MGC.modeAllowsStateRemoval = function(mode) {
    return mode === MODE_STATES_REMOVAL || mode === MODE_STATES_CHANGES || mode === MODE_ALL;
};

MGC.isValidDestination = function(battler, value) {
    if (!battler) return false;
    if (battler.isEnemy && battler.isEnemy() && battler.isAppeared && !battler.isAppeared()) {
        return false;
    }
    if (value < 0 && battler.isDead && battler.isDead()) {
        return false;
    }
    return true;
};

MGC.isValidStateDestination = function(battler) {
    if (!battler) return false;
    if (battler.isEnemy && battler.isEnemy() && battler.isAppeared && !battler.isAppeared()) {
        return false;
    }
    return true;
};

MGC.ensurePersistStore = function() {
    if (!$gameSystem) return null;
    if (!$gameSystem._jakeMSG_MGC_persistAllyLinks) {
        $gameSystem._jakeMSG_MGC_persistAllyLinks = { bi: [], uni: [] };
    }
    return $gameSystem._jakeMSG_MGC_persistAllyLinks;
};

MGC.getBattleLinks = function() {
    if (!MGC._battleLinks) {
        MGC._battleLinks = { bi: [], uni: [] };
    }
    return MGC._battleLinks;
};

MGC.clearBattleLinks = function() {
    MGC._battleLinks = { bi: [], uni: [] };
};

MGC.makeBiLink = function(gauges, members, pct, mode, gaugeCapped, cascading) {
    return {
        gauges: gauges.slice(),
        members: members.slice(),
        pct: pct,
        mode: mode,
        gaugeCapped: !!gaugeCapped,
        cascading: !!cascading
    };
};

MGC.makeUniLink = function(gauges, sources, destinations, pct, mode, gaugeCapped, cascading) {
    return {
        gauges: gauges.slice(),
        sources: sources.slice(),
        destinations: destinations.slice(),
        pct: pct,
        mode: mode,
        gaugeCapped: !!gaugeCapped,
        cascading: !!cascading
    };
};

//=============================================================================
// Script Call Implementations
//=============================================================================

MGC.enemyBiLink = function(gaugesAffected, arrayOfEnemyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    var gauges = MGC.parseGauges(gaugesAffected);
    var members = MGC.idsToMembers(arrayOfEnemyIDs, TYPE_ENEMY);
    var pct = MGC.parsePercentage(transferPercentage);
    var linkMode = MGC.parseMode(effectsLinked);
    var capped = MGC.parseBool(gaugeCapped, true);
    var cascade = MGC.parseBool(cascading, false);
    MGC.getBattleLinks().bi.push(MGC.makeBiLink(gauges, members, pct, linkMode, capped, cascade));
};

MGC.enemyUniLink = function(gaugesAffected, enemyIDsSources, enemyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    var gauges = MGC.parseGauges(gaugesAffected);
    var sources = MGC.idsToMembers(enemyIDsSources, TYPE_ENEMY);
    var destinations = MGC.idsToMembers(enemyIDsDestinations, TYPE_ENEMY);
    var pct = MGC.parsePercentage(transferPercentage);
    var linkMode = MGC.parseMode(effectsLinked);
    var capped = MGC.parseBool(gaugeCapped, true);
    var cascade = MGC.parseBool(cascading, false);
    MGC.getBattleLinks().uni.push(MGC.makeUniLink(gauges, sources, destinations, pct, linkMode, capped, cascade));
};

MGC.allyBiLink = function(gaugesAffected, arrayOfAllyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    var gauges = MGC.parseGauges(gaugesAffected);
    var members = MGC.idsToMembers(arrayOfAllyIDs, TYPE_ALLY);
    var pct = MGC.parsePercentage(transferPercentage);
    var linkMode = MGC.parseMode(effectsLinked);
    var capped = MGC.parseBool(gaugeCapped, true);
    var cascade = MGC.parseBool(cascading, false);
    MGC.getBattleLinks().bi.push(MGC.makeBiLink(gauges, members, pct, linkMode, capped, cascade));
};

MGC.allyUniLink = function(gaugesAffected, allyIDsSources, allyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    var gauges = MGC.parseGauges(gaugesAffected);
    var sources = MGC.idsToMembers(allyIDsSources, TYPE_ALLY);
    var destinations = MGC.idsToMembers(allyIDsDestinations, TYPE_ALLY);
    var pct = MGC.parsePercentage(transferPercentage);
    var linkMode = MGC.parseMode(effectsLinked);
    var capped = MGC.parseBool(gaugeCapped, true);
    var cascade = MGC.parseBool(cascading, false);
    MGC.getBattleLinks().uni.push(MGC.makeUniLink(gauges, sources, destinations, pct, linkMode, capped, cascade));
};

MGC.memberBiLink = function(gaugesAffected, arrayOfMemberIDs, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    var gauges = MGC.parseGauges(gaugesAffected);
    var members = MGC.parseMemberIdString(arrayOfMemberIDs);
    var pct = MGC.parsePercentage(transferPercentage);
    var linkMode = MGC.parseMode(effectsLinked);
    var capped = MGC.parseBool(gaugeCapped, true);
    var cascade = MGC.parseBool(cascading, false);
    MGC.getBattleLinks().bi.push(MGC.makeBiLink(gauges, members, pct, linkMode, capped, cascade));
};

MGC.memberUniLink = function(gaugesAffected, memberIDsSources, memberIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    var gauges = MGC.parseGauges(gaugesAffected);
    var sources = MGC.parseMemberIdString(memberIDsSources);
    var destinations = MGC.parseMemberIdString(memberIDsDestinations);
    var pct = MGC.parsePercentage(transferPercentage);
    var linkMode = MGC.parseMode(effectsLinked);
    var capped = MGC.parseBool(gaugeCapped, true);
    var cascade = MGC.parseBool(cascading, false);
    MGC.getBattleLinks().uni.push(MGC.makeUniLink(gauges, sources, destinations, pct, linkMode, capped, cascade));
};

MGC.persistAllyBiLink = function(gaugesAffected, arrayOfAllyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    var store = MGC.ensurePersistStore();
    if (!store) return;
    var gauges = MGC.parseGauges(gaugesAffected);
    var members = MGC.idsToMembers(arrayOfAllyIDs, TYPE_ALLY);
    var pct = MGC.parsePercentage(transferPercentage);
    var linkMode = MGC.parseMode(effectsLinked);
    var capped = MGC.parseBool(gaugeCapped, true);
    var cascade = MGC.parseBool(cascading, false);
    store.bi.push(MGC.makeBiLink(gauges, members, pct, linkMode, capped, cascade));
};

MGC.persistAllyUniLink = function(gaugesAffected, allyIDsSources, allyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    var store = MGC.ensurePersistStore();
    if (!store) return;
    var gauges = MGC.parseGauges(gaugesAffected);
    var sources = MGC.idsToMembers(allyIDsSources, TYPE_ALLY);
    var destinations = MGC.idsToMembers(allyIDsDestinations, TYPE_ALLY);
    var pct = MGC.parsePercentage(transferPercentage);
    var linkMode = MGC.parseMode(effectsLinked);
    var capped = MGC.parseBool(gaugeCapped, true);
    var cascade = MGC.parseBool(cascading, false);
    store.uni.push(MGC.makeUniLink(gauges, sources, destinations, pct, linkMode, capped, cascade));
};

MGC.removeMembersFromLinkStore = function(store, refsToClear) {
    if (!store || !refsToClear || refsToClear.length === 0) return;

    var shouldClear = function(ref) {
        for (var i = 0; i < refsToClear.length; i++) {
            if (MGC.sameMember(ref, refsToClear[i])) return true;
        }
        return false;
    };

    var filterList = function(list) {
        return (list || []).filter(function(ref) {
            return !shouldClear(ref);
        });
    };

    store.bi = (store.bi || []).map(function(link) {
        link.members = filterList(link.members);
        return link;
    }).filter(function(link) {
        return link.members && link.members.length >= 2;
    });

    store.uni = (store.uni || []).map(function(link) {
        link.sources = filterList(link.sources);
        link.destinations = filterList(link.destinations);
        return link;
    }).filter(function(link) {
        return link.sources && link.sources.length > 0 &&
            link.destinations && link.destinations.length > 0;
    });
};

MGC.clearEnemyLinks = function(arrayOfEnemyIDs) {
    var refs = MGC.idsToMembers(arrayOfEnemyIDs, TYPE_ENEMY);
    MGC.removeMembersFromLinkStore(MGC.getBattleLinks(), refs);
};

MGC.clearAllyLinks = function(arrayOfAllyIDs) {
    var refs = MGC.idsToMembers(arrayOfAllyIDs, TYPE_ALLY);
    MGC.removeMembersFromLinkStore(MGC.getBattleLinks(), refs);
    MGC.removeMembersFromLinkStore(MGC.ensurePersistStore(), refs);
};

MGC.clearMemberLinks = function(arrayOfMemberIDs) {
    var refs = MGC.parseMemberIdString(arrayOfMemberIDs);
    MGC.removeMembersFromLinkStore(MGC.getBattleLinks(), refs);
    var allyRefs = refs.filter(function(ref) {
        return ref.type === TYPE_ALLY;
    });
    if (allyRefs.length > 0) {
        MGC.removeMembersFromLinkStore(MGC.ensurePersistStore(), allyRefs);
    }
};

//=============================================================================
// Popup Compatibility (SRD_BattlePopupCustomizer / JakeMSG Additions / YEP BEC)
//=============================================================================

MGC.isPendingActionTarget = function(battler) {
    if (!battler || !$gameParty || !$gameParty.inBattle()) return false;
    if (BattleManager._targets && BattleManager._targets.indexOf(battler) >= 0) {
        return true;
    }
    return false;
};

MGC.createEmptyPopupResult = function() {
    if (typeof Game_ActionResult === 'function') {
        return new Game_ActionResult();
    }
    return {
        hpAffected: false,
        hpDamage: 0,
        mpDamage: 0,
        tpDamage: 0,
        missed: false,
        evaded: false,
        critical: false
    };
};

MGC.ensureDamagePopupQueue = function(battler) {
    if (!battler) return;
    if (Imported.YEP_BattleEngineCore) {
        if (!battler._damagePopup) {
            if (battler.clearDamagePopup) {
                battler.clearDamagePopup();
            } else {
                battler._damagePopup = [];
            }
        }
    }
};

MGC.requestImmediatePopup = function(battler, options) {
    if (!battler || !$gameParty || !$gameParty.inBattle()) return;
    options = options || {};

    // Direct skill targets get startDamagePopup from Game_Action.apply;
    // keep link flags so their later popup stacks direct + linked amounts.
    if (!options.force && MGC.isPendingActionTarget(battler)) {
        return;
    }

    MGC.ensureDamagePopupQueue(battler);

    if (Imported.YEP_BattleEngineCore) {
        var resultCopy = JsonEx.makeDeepCopy(battler.result());
        if (!resultCopy) resultCopy = MGC.createEmptyPopupResult();
        resultCopy._mgcLinkedPopup = true;

        var queue = battler._damagePopup;
        if (queue.length > 0 && queue[queue.length - 1] && queue[queue.length - 1]._mgcLinkedPopup) {
            queue[queue.length - 1] = resultCopy;
        } else {
            queue.push(resultCopy);
        }
    } else if (battler.startDamagePopup && !battler.isDamagePopupRequested()) {
        battler.startDamagePopup();
    }

    // Status-effect custom popups (JakeMSG_SRD additions) need a queued damage
    // popup request so Sprite_Battler.setupDamagePopup runs immediately.
    if (Imported.JakeMSG_SRD_BattlePopupCustomizer_Additions && Imported.YEP_BattleEngineCore) {
        MGC.ensureDamagePopupQueue(battler);
        if (battler._damagePopup.length === 0) {
            var empty = MGC.createEmptyPopupResult();
            empty._mgcLinkedPopup = true;
            battler._damagePopup.push(empty);
        }
    }

    if (!MGC.isPendingActionTarget(battler)) {
        MGC.clearLinkDamageFlags(battler);
    }
};

//=============================================================================
// Transfer Processing — Gauges
//=============================================================================

MGC.collectGaugeDestinations = function(sourceRef, gauge, value, fromCascade) {
    var destMap = {};

    var addDest = function(ref, pct, gaugeCapped) {
        var key = MGC.memberKey(ref);
        if (!destMap[key]) {
            destMap[key] = { ref: ref, pct: pct, gaugeCapped: !!gaugeCapped };
        } else {
            destMap[key].pct += pct;
            // If any overlapping link wants capping, keep capped behavior
            destMap[key].gaugeCapped = destMap[key].gaugeCapped || !!gaugeCapped;
        }
    };

    var considerBi = function(link) {
        if (!link || !link.gauges || link.gauges.indexOf(gauge) < 0) return;
        if (fromCascade && !link.cascading) return;
        if (!MGC.modeAllowsGauge(link.mode, value)) return;
        var members = link.members || [];
        var included = false;
        for (var i = 0; i < members.length; i++) {
            if (MGC.sameMember(members[i], sourceRef)) {
                included = true;
                break;
            }
        }
        if (!included) return;
        for (var j = 0; j < members.length; j++) {
            if (MGC.sameMember(members[j], sourceRef)) continue;
            addDest(members[j], link.pct, link.gaugeCapped);
        }
    };

    var considerUni = function(link) {
        if (!link || !link.gauges || link.gauges.indexOf(gauge) < 0) return;
        if (fromCascade && !link.cascading) return;
        if (!MGC.modeAllowsGauge(link.mode, value)) return;
        var sources = link.sources || [];
        var isSource = false;
        for (var i = 0; i < sources.length; i++) {
            if (MGC.sameMember(sources[i], sourceRef)) {
                isSource = true;
                break;
            }
        }
        if (!isSource) return;
        var destinations = link.destinations || [];
        for (var j = 0; j < destinations.length; j++) {
            if (MGC.sameMember(destinations[j], sourceRef)) continue;
            addDest(destinations[j], link.pct, link.gaugeCapped);
        }
    };

    var battle = MGC.getBattleLinks();
    if ($gameParty && $gameParty.inBattle()) {
        (battle.bi || []).forEach(considerBi);
        (battle.uni || []).forEach(considerUni);
    }

    var persist = MGC.ensurePersistStore();
    if (persist && sourceRef.type === TYPE_ALLY) {
        (persist.bi || []).forEach(considerBi);
        (persist.uni || []).forEach(considerUni);
    }

    var list = [];
    for (var k in destMap) {
        if (destMap.hasOwnProperty(k)) list.push(destMap[k]);
    }
    return list;
};

MGC.applyTransferToBattler = function(battler, gauge, transferValue) {
    if (!battler || transferValue === 0) return false;
    if (!MGC.isValidDestination(battler, transferValue)) return false;

    var result = battler._result;
    var oldHp = result ? result.hpDamage : 0;
    var oldMp = result ? result.mpDamage : 0;
    var oldTp = result ? result.tpDamage : 0;

    if (gauge === GAUGE_HP) {
        battler._mgcLinkHpDamage = (battler._mgcLinkHpDamage || 0) + (-transferValue);
    } else if (gauge === GAUGE_MP) {
        battler._mgcLinkMpDamage = (battler._mgcLinkMpDamage || 0) + (-transferValue);
    } else if (gauge === GAUGE_TP) {
        battler._mgcLinkTpDamage = (battler._mgcLinkTpDamage || 0) + (-transferValue);
    }

    MGC._transferDepth++;
    try {
        if (gauge === GAUGE_HP) {
            MGC._Game_Battler_gainHp.call(battler, transferValue);
            if (result) {
                result.hpDamage = oldHp + (-transferValue);
                result.hpAffected = true;
            }
            if (transferValue < 0 && battler.onDamage) {
                battler.onDamage(-transferValue);
            }
        } else if (gauge === GAUGE_MP) {
            MGC._Game_Battler_gainMp.call(battler, transferValue);
            if (result) {
                result.mpDamage = oldMp + (-transferValue);
            }
        } else if (gauge === GAUGE_TP) {
            MGC._Game_Battler_gainTp.call(battler, transferValue);
            if (result) {
                result.tpDamage = oldTp + (-transferValue);
            }
        }
    } finally {
        MGC._transferDepth--;
    }
    return true;
};

MGC.processLinksForBattler = function(battler, gauge, rawValue, actualValue, fromCascade) {
    if (!battler || rawValue === 0) return;

    var sourceRef = MGC.battlerToRef(battler);
    if (!sourceRef) return;

    var sourceKey = MGC.memberKey(sourceRef);
    var rootOwner = false;
    if (!MGC._transferChain) {
        MGC._transferChain = {};
        rootOwner = true;
    }
    if (MGC._transferChain[sourceKey]) {
        if (rootOwner) MGC._transferChain = null;
        return;
    }
    MGC._transferChain[sourceKey] = true;

    try {
        var destinations = MGC.collectGaugeDestinations(sourceRef, gauge, rawValue, !!fromCascade);
        for (var i = 0; i < destinations.length; i++) {
            var entry = destinations[i];
            var baseValue = entry.gaugeCapped ? actualValue : rawValue;
            if (baseValue === 0) continue;
            var transferValue = Math.round(baseValue * entry.pct / 100);
            if (transferValue === 0) continue;
            var destBattler = MGC.getBattler(entry.ref);
            if (!destBattler) continue;
            var before = gauge === GAUGE_HP ? destBattler.hp :
                (gauge === GAUGE_MP ? destBattler.mp : destBattler.tp);
            if (!MGC.applyTransferToBattler(destBattler, gauge, transferValue)) continue;

            MGC.requestImmediatePopup(destBattler);

            var after = gauge === GAUGE_HP ? destBattler.hp :
                (gauge === GAUGE_MP ? destBattler.mp : destBattler.tp);
            var actualOnDest = after - before;

            // Cascading: allow other Cascading links to fire from this transfer
            MGC.processLinksForBattler(destBattler, gauge, transferValue, actualOnDest, true);
        }
    } finally {
        if (rootOwner) {
            MGC._transferChain = null;
        }
    }
};

MGC.clearLinkDamageFlags = function(battler) {
    if (!battler) return;
    battler._mgcLinkHpDamage = 0;
    battler._mgcLinkMpDamage = 0;
    battler._mgcLinkTpDamage = 0;
};

//=============================================================================
// Transfer Processing — States
//=============================================================================

MGC.collectStateDestinations = function(sourceRef, kind, fromCascade) {
    var destMap = {};

    var addDest = function(ref) {
        var key = MGC.memberKey(ref);
        destMap[key] = { ref: ref };
    };

    var modeOk = function(mode) {
        if (kind === 'inflict') return MGC.modeAllowsStateInflict(mode);
        if (kind === 'removal') return MGC.modeAllowsStateRemoval(mode);
        return false;
    };

    var considerBi = function(link) {
        if (!link) return;
        if (fromCascade && !link.cascading) return;
        if (!modeOk(link.mode)) return;
        var members = link.members || [];
        var included = false;
        for (var i = 0; i < members.length; i++) {
            if (MGC.sameMember(members[i], sourceRef)) {
                included = true;
                break;
            }
        }
        if (!included) return;
        for (var j = 0; j < members.length; j++) {
            if (MGC.sameMember(members[j], sourceRef)) continue;
            addDest(members[j]);
        }
    };

    var considerUni = function(link) {
        if (!link) return;
        if (fromCascade && !link.cascading) return;
        if (!modeOk(link.mode)) return;
        var sources = link.sources || [];
        var isSource = false;
        for (var i = 0; i < sources.length; i++) {
            if (MGC.sameMember(sources[i], sourceRef)) {
                isSource = true;
                break;
            }
        }
        if (!isSource) return;
        var destinations = link.destinations || [];
        for (var j = 0; j < destinations.length; j++) {
            if (MGC.sameMember(destinations[j], sourceRef)) continue;
            addDest(destinations[j]);
        }
    };

    var battle = MGC.getBattleLinks();
    if ($gameParty && $gameParty.inBattle()) {
        (battle.bi || []).forEach(considerBi);
        (battle.uni || []).forEach(considerUni);
    }

    var persist = MGC.ensurePersistStore();
    if (persist && sourceRef.type === TYPE_ALLY) {
        (persist.bi || []).forEach(considerBi);
        (persist.uni || []).forEach(considerUni);
    }

    var list = [];
    for (var k in destMap) {
        if (destMap.hasOwnProperty(k)) list.push(destMap[k]);
    }
    return list;
};

MGC.deepCopyValue = function(value) {
    if (value === undefined) return undefined;
    if (value === null || typeof value !== 'object') return value;
    try {
        return JsonEx.makeDeepCopy(value);
    } catch (e) {
        if (Array.isArray(value)) return value.slice();
        var out = {};
        for (var k in value) {
            if (value.hasOwnProperty(k)) out[k] = value[k];
        }
        return out;
    }
};

MGC.copyStateExtraData = function(source, dest, stateId) {
    if (!source || !dest || !stateId) return;

    // Turns (YEP_BuffsStatesCore / default)
    if (source._stateTurns && source._stateTurns[stateId] !== undefined) {
        if (!dest._stateTurns) dest._stateTurns = {};
        if (dest.setStateTurns) {
            dest.setStateTurns(stateId, source._stateTurns[stateId]);
        } else {
            dest._stateTurns[stateId] = source._stateTurns[stateId];
        }
    }

    // Counters (YEP single counter / JakeMSG multi-counter arrays)
    if (source._stateCounter && source._stateCounter[stateId] !== undefined) {
        if (dest.initStateCounter && dest._stateCounter === undefined) {
            dest.initStateCounter();
        }
        dest._stateCounter = dest._stateCounter || {};
        dest._stateCounter[stateId] = MGC.deepCopyValue(source._stateCounter[stateId]);
    }

    // Aux values (JakeMSG_YEP_BuffsStatesCore_Additions)
    if (source._stateAuxVals && source._stateAuxVals[stateId] !== undefined) {
        if (dest.initStateAuxVals && dest._stateAuxVals === undefined) {
            dest.initStateAuxVals();
        }
        dest._stateAuxVals = dest._stateAuxVals || {};
        dest._stateAuxVals[stateId] = MGC.deepCopyValue(source._stateAuxVals[stateId]);
    }

    // State origin (YEP_BuffsStatesCore)
    if (source._stateOrigin && source._stateOrigin[stateId] !== undefined) {
        dest._stateOrigin = dest._stateOrigin || {};
        dest._stateOrigin[stateId] = MGC.deepCopyValue(source._stateOrigin[stateId]);
    }
};

MGC.applyStateInflictToBattler = function(source, dest, stateId) {
    if (!MGC.isValidStateDestination(dest)) return false;
    if (dest.isStateAffected && dest.isStateAffected(stateId)) {
        // Refresh mirrored extras, but do not treat as a new infliction
        MGC.copyStateExtraData(source, dest, stateId);
        return false;
    }
    MGC._skipStateLink = true;
    try {
        dest.addState(stateId);
    } finally {
        MGC._skipStateLink = false;
    }
    if (dest.isStateAffected && dest.isStateAffected(stateId)) {
        MGC.copyStateExtraData(source, dest, stateId);
        return true;
    }
    return false;
};

MGC.applyStateRemovalToBattler = function(dest, stateId) {
    if (!MGC.isValidStateDestination(dest)) return false;
    if (!dest.isStateAffected || !dest.isStateAffected(stateId)) return false;
    MGC._skipStateLink = true;
    try {
        dest.removeState(stateId);
    } finally {
        MGC._skipStateLink = false;
    }
    return !dest.isStateAffected(stateId);
};

MGC.processStateLinksForBattler = function(battler, stateId, kind, fromCascade) {
    if (MGC._skipStateLink) return;
    if (!battler || !stateId) return;

    var sourceRef = MGC.battlerToRef(battler);
    if (!sourceRef) return;

    var sourceKey = MGC.memberKey(sourceRef) + '#state:' + kind + ':' + stateId;
    var rootOwner = false;
    if (!MGC._transferChain) {
        MGC._transferChain = {};
        rootOwner = true;
    }
    if (MGC._transferChain[sourceKey]) {
        if (rootOwner) MGC._transferChain = null;
        return;
    }
    MGC._transferChain[sourceKey] = true;

    try {
        var destinations = MGC.collectStateDestinations(sourceRef, kind, !!fromCascade);
        for (var i = 0; i < destinations.length; i++) {
            var destBattler = MGC.getBattler(destinations[i].ref);
            if (!destBattler) continue;

            var changed = false;
            if (kind === 'inflict') {
                changed = MGC.applyStateInflictToBattler(battler, destBattler, stateId);
            } else if (kind === 'removal') {
                changed = MGC.applyStateRemovalToBattler(destBattler, stateId);
            }
            if (!changed) continue;

            // Ensure SRD / JakeMSG status popups appear with the initial action
            MGC.requestImmediatePopup(destBattler, { force: false });

            // Cascading state links
            MGC.processStateLinksForBattler(destBattler, stateId, kind, true);
        }
    } finally {
        if (rootOwner) {
            MGC._transferChain = null;
        }
    }
};

//=============================================================================
// Game_Battler Hooks — Gauges
//=============================================================================

MGC._Game_Battler_gainHp = Game_Battler.prototype.gainHp;
Game_Battler.prototype.gainHp = function(value) {
    var before = this.hp;
    var linkBonus = this._mgcLinkHpDamage || 0;
    MGC._Game_Battler_gainHp.call(this, value);
    if (linkBonus && this._result) {
        this._result.hpDamage += linkBonus;
        this._result.hpAffected = true;
    }
    if (MGC._transferDepth === 0) {
        var actual = this.hp - before;
        MGC.processLinksForBattler(this, GAUGE_HP, value, actual, false);
    }
};

MGC._Game_Battler_gainMp = Game_Battler.prototype.gainMp;
Game_Battler.prototype.gainMp = function(value) {
    var before = this.mp;
    var linkBonus = this._mgcLinkMpDamage || 0;
    MGC._Game_Battler_gainMp.call(this, value);
    if (linkBonus && this._result) {
        this._result.mpDamage += linkBonus;
    }
    if (MGC._transferDepth === 0) {
        var actual = this.mp - before;
        MGC.processLinksForBattler(this, GAUGE_MP, value, actual, false);
    }
};

MGC._Game_Battler_gainTp = Game_Battler.prototype.gainTp;
Game_Battler.prototype.gainTp = function(value) {
    var before = this.tp;
    var linkBonus = this._mgcLinkTpDamage || 0;
    MGC._Game_Battler_gainTp.call(this, value);
    if (linkBonus && this._result) {
        this._result.tpDamage += linkBonus;
    }
    if (MGC._transferDepth === 0) {
        var actual = this.tp - before;
        MGC.processLinksForBattler(this, GAUGE_TP, value, actual, false);
    }
};

MGC._Game_Battler_clearResult = Game_Battler.prototype.clearResult;
Game_Battler.prototype.clearResult = function() {
    MGC._Game_Battler_clearResult.call(this);
    if (this._mgcLinkHpDamage) {
        this._result.hpDamage = this._mgcLinkHpDamage;
        this._result.hpAffected = true;
    }
    if (this._mgcLinkMpDamage) {
        this._result.mpDamage = this._mgcLinkMpDamage;
    }
    if (this._mgcLinkTpDamage) {
        this._result.tpDamage = this._mgcLinkTpDamage;
    }
};

MGC._Game_Battler_onBattleEnd = Game_Battler.prototype.onBattleEnd;
Game_Battler.prototype.onBattleEnd = function() {
    MGC._Game_Battler_onBattleEnd.call(this);
    MGC.clearLinkDamageFlags(this);
};

if (Game_Battler.prototype.startDamagePopup) {
    MGC._Game_Battler_startDamagePopup = Game_Battler.prototype.startDamagePopup;
    Game_Battler.prototype.startDamagePopup = function() {
        MGC._Game_Battler_startDamagePopup.call(this);
        MGC.clearLinkDamageFlags(this);
    };
}

//=============================================================================
// Game_Battler Hooks — States
//=============================================================================

MGC._Game_Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
    var resolvedId = stateId;
    if (this.resolveStateRef) {
        resolvedId = this.resolveStateRef(stateId, false) || stateId;
    }
    var numericId = Number(resolvedId);
    if (isNaN(numericId)) numericId = Number(stateId);
    var wasAffected = this.isStateAffected && this.isStateAffected(numericId);
    MGC._Game_Battler_addState.apply(this, arguments);
    if (!MGC._skipStateLink && !wasAffected && this.isStateAffected && this.isStateAffected(numericId)) {
        MGC.processStateLinksForBattler(this, numericId, 'inflict', MGC._transferDepth > 0);
    }
};

MGC._Game_Battler_removeState = Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
    var resolvedId = stateId;
    if (this.resolveStateRef) {
        resolvedId = this.resolveStateRef(stateId, false) || stateId;
    }
    var numericId = Number(resolvedId);
    if (isNaN(numericId)) numericId = Number(stateId);
    var wasAffected = this.isStateAffected && this.isStateAffected(numericId);
    MGC._Game_Battler_removeState.apply(this, arguments);
    if (!MGC._skipStateLink && wasAffected && this.isStateAffected && !this.isStateAffected(numericId)) {
        MGC.processStateLinksForBattler(this, numericId, 'removal', MGC._transferDepth > 0);
    }
};

//=============================================================================
// Battle Start / End — expire battle-only links
//=============================================================================

MGC._BattleManager_endBattle = BattleManager.endBattle;
BattleManager.endBattle = function(result) {
    MGC.clearBattleLinks();
    MGC._BattleManager_endBattle.call(this, result);
};

MGC._BattleManager_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
    MGC.clearBattleLinks();
    MGC._BattleManager_startBattle.call(this);
};

//=============================================================================
// Global Script Calls
//=============================================================================

window.enemyBiLink = function(gaugesAffected, arrayOfEnemyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    return MGC.enemyBiLink(gaugesAffected, arrayOfEnemyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading);
};

window.enemyUniLink = function(gaugesAffected, enemyIDsSources, enemyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    return MGC.enemyUniLink(gaugesAffected, enemyIDsSources, enemyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading);
};

window.allyBiLink = function(gaugesAffected, arrayOfAllyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    return MGC.allyBiLink(gaugesAffected, arrayOfAllyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading);
};

window.allyUniLink = function(gaugesAffected, allyIDsSources, allyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    return MGC.allyUniLink(gaugesAffected, allyIDsSources, allyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading);
};

window.memberBiLink = function(gaugesAffected, arrayOfMemberIDs, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    return MGC.memberBiLink(gaugesAffected, arrayOfMemberIDs, transferPercentage, effectsLinked, gaugeCapped, cascading);
};

window.memberUniLink = function(gaugesAffected, memberIDsSources, memberIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    return MGC.memberUniLink(gaugesAffected, memberIDsSources, memberIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading);
};

window.persistAllyBiLink = function(gaugesAffected, arrayOfAllyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    return MGC.persistAllyBiLink(gaugesAffected, arrayOfAllyIDs, transferPercentage, effectsLinked, gaugeCapped, cascading);
};

window.persistAllyUniLink = function(gaugesAffected, allyIDsSources, allyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading) {
    return MGC.persistAllyUniLink(gaugesAffected, allyIDsSources, allyIDsDestinations, transferPercentage, effectsLinked, gaugeCapped, cascading);
};

window.clearEnemyLinks = function(arrayOfEnemyIDs) {
    return MGC.clearEnemyLinks(arrayOfEnemyIDs);
};

window.clearAllyLinks = function(arrayOfAllyIDs) {
    return MGC.clearAllyLinks(arrayOfAllyIDs);
};

window.clearMemberLinks = function(arrayOfMemberIDs) {
    return MGC.clearMemberLinks(arrayOfMemberIDs);
};

})();

//=============================================================================
// End of File
//=============================================================================
