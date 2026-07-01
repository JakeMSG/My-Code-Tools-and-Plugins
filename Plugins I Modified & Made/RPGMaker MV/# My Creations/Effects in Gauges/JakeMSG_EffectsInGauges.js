//=============================================================================
// JakeMSG_EffectsInGauges
// JakeMSG_EffectsInGauges.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_EffectsInGauges = true;

var JakeMSG = JakeMSG || {};
JakeMSG.EffectsInGauges = JakeMSG.EffectsInGauges || {};

//=============================================================================
/*:
 * @plugindesc v1.0 Adds visual gauge effects from State notetags in battle.
 * @author JakeMSG
 * v1.0
 *
============ Change Log ============
1.0 - 7.1st.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 *
 * This plugin adds visual effects to battle gauges (HP, MP, TP, and optionally
 * Barrier / Custom Barrier gauges) based on State database entries. Each effect
 * draws a colored or patterned band on its gauge, sized by a dynamic script
 * value. Effects can optionally reduce how far the gauge fill can reach.
 *
 * State notetags are evaluated with the same helper variables used by
 * YEP_BuffsStatesCore and JakeMSG_YEP_BuffsStatesCore_Additions (user, target,
 * origin, stateID, a, b, s, v, etc.). Value scripts are re-evaluated every frame
 * while the state is active and the gauge is drawn.
 *
 * Gauge effects appear wherever compatible gauges are drawn (battle, map, menu,
 * etc.) for any battler that currently has the relevant State active.
 *
 * Compatible gauge-drawing plugins:
 *   - Default RPG Maker MV battle gauges
 *   - YEP_BattleStatusWindow
 *   - YEP_X_VisualHpGauge
 *   - JakeMSG_YEP_X_VisualHpGauge_Additions
 *   - YEP_X_InBattleStatus
 *   - JakeMSG_YEP_X_InBattleStatus_Additions
 *   - JakeMSG_MoreDescriptionsWithConditions
 *   - YEP_AbsorptionBarrier (Barrier gauge appended to HP)
 *   - JakeMSG_YEP_AbsorptionBarrier_Additions (Custom Barrier gauges)
 *
 * ============================================================================
 * Notetag Format
 * ============================================================================
 *
 * Place paired tags in a State's note box. The gauge type is in the tag name.
 * A State may contain multiple pairs for different gauges or multiple effects
 * on the same gauge.
 *
 *   <HP Gauge Effect>
 *   ID: 1
 *   Value: user._stateTurns[4]
 *   Color: #000000
 *   Position: InsideBottomLeft
 *   Height: 50
 *   reduceMaximum: False
 *   </HP Gauge Effect>
 *
 *   <MP Gauge Effect>
 *   Value: 25.%; Color: #0aba3c
 *   </MP Gauge Effect>
 *
 * Supported gauge types in the tag:
 *   HP
 *   MP
 *   TP
 *   Barrier              (requires YEP_AbsorptionBarrier)
 *   CustomBarrier[X]       (requires JakeMSG_YEP_AbsorptionBarrier_Additions;
 *                           X is the Custom Barrier ID)
 *
 * ---------------------------------------------------------------------------
 * Properties
 * ---------------------------------------------------------------------------
 *
 * Properties appear on separate lines inside the tag pair, or multiple on one
 * line separated by semicolons. Use ":" or "=" between name and value (spaces
 * optional). All properties are optional.
 *
 *   ID                 Draw priority when effects overlap. Higher ID is drawn
 *                      on top. Default: 0.
 *
 *   Value              JavaScript expression returning the effect size in gauge
 *                      units (same scale as HP/MP/TP values). Re-evaluated each
 *                      frame. Default: user._stateTurns[<stateId>] where
 *                      <stateId> is this State's database ID.
 *                      Consider YEP_BuffsStatesCore State Counter script calls
 *                      such as user.getStateCounter(n), user.setStateCounter,
 *                      user.addStateCounter, and JakeMSG additions.
 *                      Use .% on a number or parenthesized expression to convert
 *                      a percentage of the gauge maximum into gauge units, e.g.
 *                      10.% on an HP gauge with MaxHP 250 returns 25.
 *                      (2+5).% and (user._stateTurns[4]).% are valid.
 *                      If the gauge has no defined maximum (some Barrier types),
 *                      .% yields 0.
 *            Helper variable "stateID" — the database ID of the State
 *            entry that owns this gauge effect notetag.
 *
 *   Color              Hex color when no Pattern is used. Default: #000000.
 *
 *   Pattern            Picture filename (with or without .png / .webp) from
 *                      img/pictures. When valid, loops the image over the effect
 *                      area and ignores Color. Default: undefined.
 *
 *   PatternZoomX       Horizontal zoom for Pattern tiling. Default: 1.0.
 *   PatternZoomY       Vertical zoom for Pattern tiling. Default: 1.0.
 *
 *   Position           Where the effect anchors on the gauge. Default:
 *                      InsideBottomLeft.
 *                      InsideBottomLeft / InsideBottomRight — height grows upward
 *                      InsideTopLeft / InsideTopRight — height grows downward
 *                      OutsideBottomLeft / OutsideBottomRight — height grows
 *                        downward outside the gauge (drawn behind value text)
 *                      OutsideTopLeft / OutsideTopRight — height grows upward
 *                        outside the gauge (drawn behind value text)
 *
 *   Height             Effect height as a percent of gauge height (50 = half).
 *                      Default: 50.
 *
 *   reduceMaximum      True / False. Default: False.
 *                      When True, caps the battler's current gauge value at
 *                      (Max − Value) and hides fill under the effect band.
 *                      The cap is enforced on heal/gain and when the state is
 *                      applied. Does not apply to Barrier or CustomBarrier[X]
 *                      gauges that have no defined maximum value.
 *
 * ============================================================================
 * Helper Variables (inside Value scripts)
 * ============================================================================
 *
 *   user, target, origin, a, b, actor, enemy, subject, s, v
 *   stateID            Database ID of the State entry that owns this effect.
 *   owningMember       Party/troop member index of the battler.
 *
 * ============================================================================
 * Save / Load
 * ============================================================================
 *
 * Effects are derived from active States and their counters at runtime. No
 * extra save data is required; loading a save restores counters and States
 * from YEP_BuffsStatesCore as usual.
 *
 */
//=============================================================================

(function($) {
'use strict';

$.version = 1.0;

//=============================================================================
// Defaults and Constants
//=============================================================================

$.DEFAULTS = {
    'ID': 0,
    'Value': null,
    'Color': '#000000',
    'Pattern': undefined,
    'PatternZoomX': 1.0,
    'PatternZoomY': 1.0,
    'Position': 'InsideBottomLeft',
    'Height': 50,
    'reduceMaximum': false
};

$.PROPERTY_NAMES = [
    'ID', 'Value', 'Color', 'Pattern', 'PatternZoomX', 'PatternZoomY',
    'Position', 'Height', 'reduceMaximum'
];

$.POSITIONS = {
    'INSIDEBOTTOMLEFT': 'InsideBottomLeft',
    'INSIDEBOTTOMRIGHT': 'InsideBottomRight',
    'INSIDETOPLEFT': 'InsideTopLeft',
    'INSIDETOPRIGHT': 'InsideTopRight',
    'OUTSIDEBOTTOMLEFT': 'OutsideBottomLeft',
    'OUTSIDEBOTTOMRIGHT': 'OutsideBottomRight',
    'OUTSIDETOPLEFT': 'OutsideTopLeft',
    'OUTSIDETOPRIGHT': 'OutsideTopRight'
};

$.OPEN_TAG_REGEX =
    /<(HP|MP|TP|Barrier|CustomBarrier\[(\d+)\])[ ]+Gauge[ ]+Effect[ ]*>/i;
$.CLOSE_TAG_REGEX =
    /<\/(HP|MP|TP|Barrier|CustomBarrier\[(\d+)\])[ ]+Gauge[ ]+Effect[ ]*>/i;
$.PROPERTY_PAIR_REGEX = /([^;=]+?)[ ]*[:=][ ]*([\s\S]*)/;

$.patternCache = {};

//=============================================================================
// Utilities
//=============================================================================

$.splitLines = function(text) {
    return String(text || '').split(/[\r\n]+/);
};

$.parseBoolean = function(value, defaultValue) {
    if (value === undefined || value === null || String(value).trim() === '') {
        return !!defaultValue;
    }
    var text = String(value).trim().toLowerCase();
    if (text === 'true' || text === 'yes' || text === '1') return true;
    if (text === 'false' || text === 'no' || text === '0') return false;
    return !!defaultValue;
};

$.normalizePosition = function(value) {
    var key = String(value || 'InsideBottomLeft').replace(/\s+/g, '');
    return $.POSITIONS[key.toUpperCase()] || 'InsideBottomLeft';
};

$.normalizeColor = function(value) {
    var text = String(value || '#000000').trim();
    if (text.charAt(0) !== '#') text = '#' + text;
    return text;
};

$.parsePropertyContent = function(content, target) {
    var parts = String(content || '').split(';');
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        if (!part) continue;
        var pair = part.match($.PROPERTY_PAIR_REGEX);
        if (!pair) continue;
        var name = pair[1].trim();
        var value = pair[2].trim();
        if (name === 'ID') {
            target[name] = Number(value) || 0;
        } else if (name === 'PatternZoomX' || name === 'PatternZoomY' ||
            name === 'Height') {
            target[name] = Number(value);
            if (isNaN(target[name])) target[name] = $.DEFAULTS[name];
        } else if (name === 'reduceMaximum') {
            target[name] = $.parseBoolean(value, false);
        } else if (name === 'Position') {
            target[name] = $.normalizePosition(value);
        } else if (name === 'Color') {
            target[name] = $.normalizeColor(value);
        } else {
            target[name] = value;
        }
    }
};

$.parsePropertyLine = function(line, target) {
    var text = String(line || '').trim();
    if (!text) return false;
    if (text.charAt(0) === '<') return false;
    $.parsePropertyContent(text, target);
    return true;
};

$.logError = function(context, e, code) {
    console.error('JakeMSG_EffectsInGauges ' + context + ': ' + e.message);
    if (code) console.error(code);
};

$.getOwningMemberIndex = function(battler) {
    if (!battler) return -1;
    if (battler.isActor && battler.isActor()) {
        var actorId = battler.actorId ? battler.actorId() : battler._actorId;
        if ($gameParty && $gameParty._actors) {
            var idx = $gameParty._actors.indexOf(actorId);
            if (idx >= 0) return idx;
        }
        return $gameParty ? $gameParty.battleMembers().indexOf(battler) : -1;
    }
    if (battler.isEnemy && battler.isEnemy()) {
        if ($gameTroop && $gameTroop._enemies) {
            var tIdx = $gameTroop._enemies.indexOf(battler);
            if (tIdx >= 0) return tIdx;
        }
        return $gameTroop ? $gameTroop.members().indexOf(battler) : -1;
    }
    return -1;
};

$.defaultValueCode = function(stateId) {
    return 'user._stateTurns[' + stateId + ']';
};

$.finalizeEffectProps = function(props, stateId) {
    var result = {};
    for (var i = 0; i < $.PROPERTY_NAMES.length; i++) {
        var key = $.PROPERTY_NAMES[i];
        if (props[key] !== undefined) {
            result[key] = props[key];
        } else if ($.DEFAULTS[key] !== undefined) {
            result[key] = $.DEFAULTS[key];
        }
    }
    if (result.Value === null || result.Value === undefined ||
        String(result.Value).trim() === '') {
        result.Value = $.defaultValueCode(stateId);
    }
    result.Value = String(result.Value);
    result.ID = Number(result.ID) || 0;
    result.PatternZoomX = Number(result.PatternZoomX) || 1.0;
    result.PatternZoomY = Number(result.PatternZoomY) || 1.0;
    result.Height = Number(result.Height);
    if (isNaN(result.Height)) result.Height = 50;
    result.Color = $.normalizeColor(result.Color);
    result.Position = $.normalizePosition(result.Position);
    result.reduceMaximum = $.parseBoolean(result.reduceMaximum, false);
    return result;
};

//=============================================================================
// Notetag Parsing (States)
//=============================================================================

$.parseEffectBlock = function(gaugeType, customId, stateId, lines) {
    var props = {};
    for (var i = 0; i < lines.length; i++) {
        $.parsePropertyLine(lines[i], props);
    }
    return {
        gaugeType: gaugeType,
        customId: customId,
        stateId: stateId,
        properties: $.finalizeEffectProps(props, stateId)
    };
};

$.parseStateGaugeEffects = function(state) {
    if (!state) return;
    var lines = $.splitLines(state.note || '');
    var effects = [];
    var open = null;
    var content = [];

    var flush = function() {
        if (!open) return;
        effects.push($.parseEffectBlock(open.gaugeType, open.customId,
            state.id, content));
        open = null;
        content = [];
    };

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var openMatch = line.match($.OPEN_TAG_REGEX);
        if (openMatch) {
            flush();
            var rawType = String(openMatch[1]);
            var gaugeType;
            var customId = null;
            if (/^CustomBarrier\[/i.test(rawType)) {
                gaugeType = 'CustomBarrier';
                customId = Number(openMatch[2]);
            } else {
                gaugeType = rawType.toUpperCase();
                if (gaugeType === 'BARRIER') gaugeType = 'Barrier';
            }
            open = { gaugeType: gaugeType, customId: customId };
            continue;
        }
        var closeMatch = line.match($.CLOSE_TAG_REGEX);
        if (closeMatch && open) {
            flush();
            continue;
        }
        if (open) content.push(line);
    }
    flush();
    state.jakeEIGGaugeEffects = effects;
};

$.processDatabase = function() {
    if (!$dataStates) return;
    for (var i = 1; i < $dataStates.length; i++) {
        $.parseStateGaugeEffects($dataStates[i]);
    }
    $.reserveAllStatePatterns();
};

$.databaseLoaded = false;
var JakeEIG_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!JakeEIG_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!$.databaseLoaded) {
        $.processDatabase();
        $.databaseLoaded = true;
    }
    return true;
};

//=============================================================================
// Gauge Value Helpers
//=============================================================================

$.getGaugeMax = function(battler, gaugeType, customId) {
    if (!battler) return 0;
    switch (gaugeType) {
    case 'HP':
        return Math.max(0, battler.mhp);
    case 'MP':
        return Math.max(0, battler.mmp);
    case 'TP':
        return Math.max(0, battler.maxTp ? battler.maxTp() : 100);
    case 'Barrier':
        if (battler.barrierMaxValue) {
            var bMax = battler.barrierMaxValue();
            return (bMax >= 0) ? bMax : 0;
        }
        return 0;
    case 'CustomBarrier':
        if (battler.cBarrierMaxValue) {
            var cMax = battler.cBarrierMaxValue(customId);
            return (cMax >= 0) ? cMax : 0;
        }
        return 0;
    default:
        return 0;
    }
};

$.getGaugeValue = function(battler, gaugeType, customId) {
    if (!battler) return 0;
    switch (gaugeType) {
    case 'HP':
        return battler.hp;
    case 'MP':
        return battler.mp;
    case 'TP':
        return battler.tp;
    case 'Barrier':
        return (battler.barrierPoints) ? battler.barrierPoints() : 0;
    case 'CustomBarrier':
        return (battler.cBarrierPoints) ? battler.cBarrierPoints(customId) : 0;
    default:
        return 0;
    }
};

$.hpCombinedTotalMax = function(battler) {
    var mhp = Math.max(1, battler.mhp);
    var hp = Math.max(0, battler.hp);
    var barrierTotal = 0;

    if (Imported.JakeMSG_YEP_AbsorptionBarrier_Additions &&
        battler.cBarrierPoints && Yanfly.ABR_JakeMSGAdd &&
        Yanfly.ABR_JakeMSGAdd.channelVisualOrder) {
        var order = Yanfly.ABR_JakeMSGAdd.channelVisualOrder();
        for (var i = 0; i < order.length; i++) {
            var ch = order[i];
            var pts = (ch === 'default') ?
                (battler.barrierPoints ? battler.barrierPoints() : 0) :
                battler.cBarrierPoints(ch);
            if (pts > 0) barrierTotal += pts;
        }
    } else if (Imported.YEP_AbsorptionBarrier && battler.barrierPoints) {
        barrierTotal = Math.max(0, battler.barrierPoints());
    }

    if (hp + barrierTotal > mhp) return hp + barrierTotal;
    return mhp;
};

$.combinedBarrierTotal = function(battler) {
    var total = 0;
    if (Imported.JakeMSG_YEP_AbsorptionBarrier_Additions &&
        Yanfly.ABR_JakeMSGAdd && Yanfly.ABR_JakeMSGAdd.channelVisualOrder &&
        battler) {
        var order = Yanfly.ABR_JakeMSGAdd.channelVisualOrder();
        for (var i = 0; i < order.length; i++) {
            var ch = order[i];
            var pts = (ch === 'default') ?
                (battler.barrierPoints ? battler.barrierPoints() : 0) :
                (battler.cBarrierPoints ? battler.cBarrierPoints(ch) : 0);
            if (pts > 0) total += pts;
        }
        return total;
    }
    if (Imported.YEP_AbsorptionBarrier && battler.barrierPoints) {
        return Math.max(0, battler.barrierPoints());
    }
    return 0;
};

$.combinedGaugeDrawMax = function(battler) {
    var hp = Math.max(0, battler.hp);
    var mhp = Math.max(1, battler.mhp);
    var totalBarrier = $.combinedBarrierTotal(battler);
    var total = hp + totalBarrier;
    return (total > mhp) ? Math.max(1, total) : mhp;
};

$.channelBarrierPoints = function(battler, channelId) {
    if (!battler) return 0;
    if (channelId === 'default' || channelId === null || channelId === undefined) {
        return (battler.barrierPoints) ? Math.max(0, battler.barrierPoints()) : 0;
    }
    return (battler.cBarrierPoints) ?
        Math.max(0, battler.cBarrierPoints(channelId)) : 0;
};

$.getCombinedGaugeZone = function(battler, gaugeType, customId) {
    if (!battler) return null;
    var drawMax = $.combinedGaugeDrawMax(battler);
    var hp = Math.max(0, battler.hp);
    var mhp = Math.max(1, battler.mhp);
    var totalBarrier = $.combinedBarrierTotal(battler);

    if (gaugeType === 'HP') {
        var hpWidthRate = (hp + totalBarrier > mhp) ? (hp / drawMax) : 1;
        return {
            start: 0,
            width: hpWidthRate,
            max: mhp,
            drawMax: drawMax
        };
    }

    if (Imported.JakeMSG_YEP_AbsorptionBarrier_Additions &&
        Yanfly.ABR_JakeMSGAdd && Yanfly.ABR_JakeMSGAdd.channelVisualOrder) {
        var order = Yanfly.ABR_JakeMSGAdd.channelVisualOrder();
        var cursor = hp / drawMax;
        for (var i = 0; i < order.length; i++) {
            var ch = order[i];
            var pts = $.channelBarrierPoints(battler, ch);
            if (pts <= 0) continue;
            var zoneMax;
            if (ch === 'default') {
                zoneMax = $.getGaugeMax(battler, 'Barrier');
            } else {
                zoneMax = $.getGaugeMax(battler, 'CustomBarrier', ch);
            }
            var scaleMax = zoneMax > 0 ? zoneMax : Math.max(1, pts);
            var widthRate = pts / drawMax;
            var isMatch = (gaugeType === 'Barrier' && ch === 'default') ||
                (gaugeType === 'CustomBarrier' && Number(customId) === Number(ch));
            if (isMatch) {
                return {
                    start: cursor,
                    width: widthRate,
                    max: scaleMax,
                    drawMax: drawMax
                };
            }
            cursor += widthRate;
        }
        return null;
    }

    if (gaugeType === 'Barrier') {
        var zone = $.barrierZoneOnCombinedGauge(battler, drawMax);
        if (zone.width <= 0) return null;
        return {
            start: zone.start,
            width: zone.width,
            max: zone.max,
            drawMax: drawMax
        };
    }

    return null;
};

$.barrierZoneOnCombinedGauge = function(battler, totalMax) {
    var mhp = Math.max(1, battler.mhp);
    var hp = Math.max(0, battler.hp);
    var barrierMax = $.getGaugeMax(battler, 'Barrier');
    var barrierPts = (battler.barrierPoints) ?
        Math.max(0, battler.barrierPoints()) : 0;
    var scaleMax = barrierMax > 0 ? barrierMax : Math.max(1, barrierPts);
    var barUnits = barrierMax > 0 ? barrierMax : barrierPts;
    if (barUnits <= 0) {
        return { start: 1, width: 0, max: scaleMax, x: 0, w: 0 };
    }
    if (hp + barrierPts > mhp) {
        return {
            start: mhp / totalMax,
            width: barUnits / totalMax,
            max: scaleMax
        };
    }
    return {
        start: hp / mhp,
        width: barUnits / mhp,
        max: scaleMax
    };
};

$.customBarrierZoneOnCombinedGauge = function(battler, customId, totalMax, zoneStart) {
    var cMax = $.getGaugeMax(battler, 'CustomBarrier', customId);
    var cPts = (battler.cBarrierPoints) ?
        Math.max(0, battler.cBarrierPoints(customId)) : 0;
    var barUnits = cMax > 0 ? cMax : cPts;
    var scaleMax = cMax > 0 ? cMax : Math.max(1, cPts);
    if (barUnits <= 0) {
        return { start: zoneStart, width: 0, max: scaleMax };
    }
    return {
        start: zoneStart,
        width: barUnits / totalMax,
        max: scaleMax
    };
};

$.effectMatchesDrawMode = function(effect, drawMode, simpleGaugeType) {
    if (drawMode === 'hpCombined') {
        return effect.gaugeType === 'HP' || effect.gaugeType === 'Barrier' ||
            effect.gaugeType === 'CustomBarrier';
    }
    return effect.gaugeType === simpleGaugeType;
};

$.collectActiveEffects = function(battler, drawMode, simpleGaugeType) {
    var list = [];
    if (!battler || !battler.states) return list;
    var states = battler.states();
    for (var i = 0; i < states.length; i++) {
        var state = states[i];
        if (!state || !state.jakeEIGGaugeEffects) continue;
        for (var j = 0; j < state.jakeEIGGaugeEffects.length; j++) {
            var def = state.jakeEIGGaugeEffects[j];
            if (!$.effectMatchesDrawMode(def, drawMode, simpleGaugeType)) continue;
            list.push({
                gaugeType: def.gaugeType,
                customId: def.customId,
                stateId: def.stateId,
                props: def.properties
            });
        }
    }
    list.sort(function(a, b) {
        return (a.props.ID || 0) - (b.props.ID || 0);
    });
    return list;
};

//=============================================================================
// Value Script Evaluation
//=============================================================================

$.scanPercentOperand = function(code, dotIndex) {
    var end = dotIndex - 1;
    while (end >= 0 && /\s/.test(code.charAt(end))) end--;
    if (end < 0) return null;
    if (code.charAt(end) === ')') {
        var depth = 1;
        var start = end - 1;
        while (start >= 0) {
            var ch = code.charAt(start);
            if (ch === ')') depth++;
            else if (ch === '(') {
                depth--;
                if (depth === 0) break;
            }
            start--;
        }
        if (start < 0) return null;
        return { text: code.substring(start, end + 1), start: start };
    }
    var numEnd = end;
    while (numEnd >= 0 && /[\d.]/.test(code.charAt(numEnd))) numEnd--;
    if (numEnd === end) return null;
    return { text: code.substring(numEnd + 1, end + 1), start: numEnd + 1 };
};

$.transformPercentOperator = function(code) {
    var text = String(code || '');
    var out = '';
    var i = 0;
    while (i < text.length) {
        if (text.charAt(i) === '.' && i + 1 < text.length && text.charAt(i + 1) === '%') {
            var operand = $.scanPercentOperand(text, i);
            if (operand) {
                out = out.substring(0, out.length - (i - operand.start));
                out += '__eigPct(' + operand.text + ')';
                i += 2;
                continue;
            }
        }
        out += text.charAt(i);
        i++;
    }
    return out;
};

$.evaluateEffectValue = function(battler, stateId, code, gaugeType, customId,
    zoneMaxOverride) {
    var max = (zoneMaxOverride !== undefined) ?
        zoneMaxOverride : $.getGaugeMax(battler, gaugeType, customId);
    var state = $dataStates[stateId];
    try {
        var a = battler;
        var b = battler;
        var actor = (battler.isActor && battler.isActor()) ? battler : null;
        var enemy = (battler.isEnemy && battler.isEnemy()) ? battler : null;
        var subject = battler;
        var user = battler;
        var target = battler;
        var origin = battler.stateOrigin ?
            battler.stateOrigin(stateId) : battler;
        var stateID = stateId;
        var owningMember = $.getOwningMemberIndex(battler);
        var s = $gameSwitches ? $gameSwitches._data : [];
        var v = $gameVariables ? $gameVariables._data : [];
        var __eigGaugeMax = max;
        var __eigPct = function(n) {
            var num = Number(n) || 0;
            return max > 0 ? num * max / 100 : 0;
        };
        var evalCode = $.transformPercentOperator(code);
        var result = eval(evalCode);
        return Math.max(0, Number(result) || 0);
    } catch (e) {
        $.logError('Value (state ' + stateId + ')', e, code);
        return 0;
    }
};

$.isTitleScene = function() {
    return typeof Scene_Title !== 'undefined' &&
        SceneManager._scene instanceof Scene_Title;
};

$.shouldApplyGaugeEffects = function(battler, drawMode, gaugeType) {
    if (!battler || $.isTitleScene()) return false;
    if (drawMode === 'hpCombined') {
        return $.collectActiveEffects(battler, 'hpCombined', 'HP').length > 0;
    }
    return $.collectActiveEffects(battler, drawMode, gaugeType).length > 0;
};

$.battlerHasAnyGaugeEffects = function(battler) {
    if (!battler || $.isTitleScene()) return false;
    if ($.collectActiveEffects(battler, 'hpCombined', 'HP').length > 0) {
        return true;
    }
    if ($.collectActiveEffects(battler, 'simple', 'MP').length > 0) {
        return true;
    }
    if ($.collectActiveEffects(battler, 'simple', 'TP').length > 0) {
        return true;
    }
    return false;
};

$.yBufferForWindow = function(win) {
    if (win._enableYBuffer && Imported.YEP_BattleStatusWindow) {
        return Yanfly.Param.BSWParamYBuffer || 0;
    }
    if (typeof Window_VisualHPGauge !== 'undefined' &&
        win instanceof Window_VisualHPGauge) {
        return 1;
    }
    return 0;
};

$.effectValueOnDraw = function(effectEntry, battler, drawMode) {
    var gaugeType = effectEntry.gaugeType;
    var customId = effectEntry.customId;
    var zoneMax = $.getGaugeMax(battler, gaugeType, customId);
    if (drawMode === 'hpCombined') {
        var zone = $.getCombinedGaugeZone(battler, gaugeType, customId);
        if (zone) zoneMax = zone.max;
        else if (gaugeType === 'HP') zoneMax = Math.max(1, battler.mhp);
    }
    return $.evaluateEffectValue(battler, effectEntry.stateId,
        effectEntry.props.Value, gaugeType, customId, zoneMax);
};

//=============================================================================
// Effect Geometry
//=============================================================================

$.gaugeHeightForWindow = function(win, battler, gaugeType) {
    return $.resolveGaugeHeight(win, battler, gaugeType);
};

$.resolveGaugeHeight = function(win, battler, gaugeType) {
    if (typeof Window_VisualHPGauge !== 'undefined' &&
        win instanceof Window_VisualHPGauge && battler) {
        if (gaugeType === 'MP' && battler.mpGaugeHeight) {
            return battler.mpGaugeHeight();
        }
        if (gaugeType === 'TP' && battler.tpGaugeHeight) {
            return battler.tpGaugeHeight();
        }
        if (battler.hpGaugeHeight) return battler.hpGaugeHeight();
    }
    if (win && win.gaugeHeight) return win.gaugeHeight();
    return 6;
};

$.isGaugeOutline = function(win) {
    if (win.isGaugeOutline) return !!win.isGaugeOutline();
    return !!(Imported.YEP_CoreEngine && Yanfly.Param.GaugeOutline);
};

$.gaugeRect = function(win, dx, dy, dw, yB, battler, gaugeType) {
    var rawH = $.resolveGaugeHeight(win, battler, gaugeType);
    var gaugeY = dy + win.lineHeight() - rawH - 2 + (yB || 0);
    var x = dx;
    var w = dw;
    if ($.isGaugeOutline(win)) {
        x += 1;
        w -= 2;
        gaugeY -= 2;
    }
    return { x: x, y: gaugeY, w: w, h: rawH, rawH: rawH };
};

$.gaugeZoneRect = function(rect, effect, battler, drawMode) {
    if (drawMode !== 'hpCombined') {
        return { x: rect.x, y: rect.y, w: rect.w, h: rect.h, rawH: rect.rawH };
    }
    var zone = $.getCombinedGaugeZone(battler, effect.gaugeType, effect.customId);
    if (!zone || zone.width <= 0) {
        return { x: rect.x, y: rect.y, w: 0, h: rect.h, rawH: rect.rawH };
    }
    return {
        x: rect.x + Math.floor(rect.w * zone.start),
        y: rect.y,
        w: Math.floor(rect.w * zone.width),
        h: rect.h,
        rawH: rect.rawH
    };
};

$.computeEffectRect = function(rect, position, widthPx, heightPct, rawGaugeH) {
    var basisH = rawGaugeH || rect.rawH || rect.h;
    var effectH = Math.max(1, Math.floor(basisH * (heightPct / 100)));
    var w = Math.max(0, Math.floor(widthPx));
    var x, y, h;
    switch (position) {
    case 'InsideBottomRight':
        x = rect.x + rect.w - w;
        y = rect.y + rect.h - effectH;
        h = effectH;
        break;
    case 'InsideTopLeft':
        x = rect.x;
        y = rect.y;
        h = effectH;
        break;
    case 'InsideTopRight':
        x = rect.x + rect.w - w;
        y = rect.y;
        h = effectH;
        break;
    case 'OutsideBottomLeft':
        x = rect.x;
        y = rect.y + rect.h;
        h = effectH;
        break;
    case 'OutsideBottomRight':
        x = rect.x + rect.w - w;
        y = rect.y + rect.h;
        h = effectH;
        break;
    case 'OutsideTopLeft':
        x = rect.x;
        y = rect.y - effectH;
        h = effectH;
        break;
    case 'OutsideTopRight':
        x = rect.x + rect.w - w;
        y = rect.y - effectH;
        h = effectH;
        break;
    default:
        x = rect.x;
        y = rect.y + rect.h - effectH;
        h = effectH;
        break;
    }
    return { x: x, y: y, w: w, h: h };
};

$.computeEffectRectOnGauge = function(win, rect, effectEntry, battler, drawMode) {
    var value = $.effectValueOnDraw(effectEntry, battler, drawMode);
    var zoneRect = $.gaugeZoneRect(rect, effectEntry, battler, drawMode);
    var zoneMax;
    if (drawMode === 'hpCombined') {
        var zone = $.getCombinedGaugeZone(battler, effectEntry.gaugeType,
            effectEntry.customId);
        zoneMax = zone ? zone.max : $.getGaugeMax(battler, effectEntry.gaugeType,
            effectEntry.customId);
    } else {
        zoneMax = $.getGaugeMax(battler, effectEntry.gaugeType, effectEntry.customId);
    }
    var widthPx = zoneMax > 0 ?
        Math.floor(zoneRect.w * (value / zoneMax).clamp(0, 1)) : 0;
    widthPx = Math.min(widthPx, zoneRect.w);
    var effectRect = $.computeEffectRect(zoneRect, effectEntry.props.Position,
        widthPx, effectEntry.props.Height, zoneRect.rawH);
    return { rect: effectRect, value: value, zoneMax: zoneMax };
};

$.isOutsidePosition = function(position) {
    return /^Outside/i.test(position || '');
};

//=============================================================================
// Pattern Drawing
//=============================================================================

$.patternBitmapName = function(path) {
    var name = String(path || '').trim();
    name = name.replace(/\.(png|webp)$/i, '');
    return name;
};

$.ensurePatternLoaded = function(path) {
    var name = $.patternBitmapName(path);
    if (!name) return null;
    ImageManager.reservePicture(name);
    if (!$.patternCache[name]) {
        $.patternCache[name] = ImageManager.loadPicture(name);
    }
    var bitmap = $.patternCache[name];
    if (bitmap && !bitmap.isReady() && !bitmap._jakeEIGLoadHooked) {
        bitmap._jakeEIGLoadHooked = true;
        bitmap.addLoadListener(function() {
            $.requestPatternRefresh();
        });
    }
    return bitmap;
};

$.reserveAllStatePatterns = function() {
    if (!$dataStates) return;
    for (var i = 1; i < $dataStates.length; i++) {
        var state = $dataStates[i];
        if (!state || !state.jakeEIGGaugeEffects) continue;
        for (var j = 0; j < state.jakeEIGGaugeEffects.length; j++) {
            var pattern = state.jakeEIGGaugeEffects[j].properties.Pattern;
            if (pattern !== undefined && pattern !== null &&
                String(pattern).trim() !== '') {
                $.ensurePatternLoaded(pattern);
            }
        }
    }
};

$.preloadBattlerPatterns = function(battler) {
    if (!battler || !battler.states) return;
    var states = battler.states();
    for (var i = 0; i < states.length; i++) {
        var state = states[i];
        if (!state || !state.jakeEIGGaugeEffects) continue;
        for (var j = 0; j < state.jakeEIGGaugeEffects.length; j++) {
            var pattern = state.jakeEIGGaugeEffects[j].properties.Pattern;
            if (pattern !== undefined && pattern !== null &&
                String(pattern).trim() !== '') {
                $.ensurePatternLoaded(pattern);
            }
        }
    }
};

$.preloadBattleGaugePatterns = function() {
    if ($gameParty) {
        var members = $gameParty.members();
        for (var i = 0; i < members.length; i++) {
            $.preloadBattlerPatterns(members[i]);
        }
        var battleMembers = $gameParty.battleMembers();
        for (var j = 0; j < battleMembers.length; j++) {
            $.preloadBattlerPatterns(battleMembers[j]);
        }
    }
    if ($gameTroop) {
        var enemies = $gameTroop.members();
        for (var k = 0; k < enemies.length; k++) {
            $.preloadBattlerPatterns(enemies[k]);
        }
    }
};

$.requestPatternRefresh = function() {
    var scene = SceneManager._scene;
    if (scene instanceof Scene_Battle && scene._statusWindow &&
        scene._statusWindow.refresh) {
        scene._statusWindow.refresh();
    } else if (typeof BattleManager !== 'undefined' &&
        BattleManager._statusWindow && BattleManager._statusWindow.refresh) {
        BattleManager._statusWindow.refresh();
    }
    if (scene instanceof Scene_Map && $gameParty) {
        var members = $gameParty.members();
        for (var i = 0; i < members.length; i++) {
            $.enforceReduceMaximumCaps(members[i]);
        }
    }
};

$.loadPatternBitmap = function(path) {
    var bitmap = $.ensurePatternLoaded(path);
    if (bitmap && bitmap.isReady() && bitmap.width > 0 && bitmap.height > 0) {
        return bitmap;
    }
    return null;
};

$.drawTiledPattern = function(win, bitmap, rect, zoomX, zoomY) {
    var tileW = Math.max(1, Math.floor(bitmap.width * zoomX));
    var tileH = Math.max(1, Math.floor(bitmap.height * zoomY));
    var contents = win.contents;
    var right = rect.x + rect.w;
    var bottom = rect.y + rect.h;
    for (var py = rect.y; py < bottom; py += tileH) {
        var dh = Math.min(tileH, bottom - py);
        var sh = dh / zoomY;
        for (var px = rect.x; px < right; px += tileW) {
            var dw = Math.min(tileW, right - px);
            var sw = dw / zoomX;
            contents.blt(bitmap, 0, 0, sw, sh, px, py, dw, dh);
        }
    }
};

$.drawEffectFill = function(win, effectRect, props) {
    if (effectRect.w <= 0 || effectRect.h <= 0) return;
    var pattern = props.Pattern;
    if (pattern !== undefined && pattern !== null &&
        String(pattern).trim() !== '') {
        var bitmap = $.loadPatternBitmap(pattern);
        if (bitmap) {
            $.drawTiledPattern(win, bitmap, effectRect, props.PatternZoomX,
                props.PatternZoomY);
            return;
        }
    }
    win.contents.fillRect(effectRect.x, effectRect.y, effectRect.w,
        effectRect.h, props.Color);
};

//=============================================================================
// reduceMaximum — functional cap + position-aware fill
//=============================================================================

$.isLeftAnchoredPosition = function(position) {
    return /BottomLeft|TopLeft/i.test(position || '');
};

$.isRightAnchoredPosition = function(position) {
    return /BottomRight|TopRight/i.test(position || '');
};

$.canUseReduceMaximum = function(battler, gaugeType, customId) {
    if (gaugeType === 'Barrier' || gaugeType === 'CustomBarrier') {
        return $.getGaugeMax(battler, gaugeType, customId) > 0;
    }
    return gaugeType === 'HP' || gaugeType === 'MP' || gaugeType === 'TP';
};

$.getReduceMaximumCapInfo = function(battler, gaugeType, customId, drawMode) {
    if (!battler || !$.canUseReduceMaximum(battler, gaugeType, customId)) {
        return null;
    }
    var max = $.getGaugeMax(battler, gaugeType, customId);
    if (drawMode === 'hpCombined' && gaugeType === 'HP') {
        max = Math.max(1, battler.mhp);
    }
    if (max <= 0) return null;

    var cap = max;
    var effects = [];
    var states = battler.states();
    for (var i = 0; i < states.length; i++) {
        var state = states[i];
        if (!state || !state.jakeEIGGaugeEffects) continue;
        for (var j = 0; j < state.jakeEIGGaugeEffects.length; j++) {
            var def = state.jakeEIGGaugeEffects[j];
            if (def.gaugeType !== gaugeType) continue;
            if (gaugeType === 'CustomBarrier' &&
                Number(def.customId) !== Number(customId)) continue;
            if (!def.properties.reduceMaximum) continue;
            var effectVal = $.effectValueOnDraw({
                gaugeType: def.gaugeType,
                customId: def.customId,
                stateId: def.stateId,
                props: def.properties
            }, battler, drawMode);
            cap = Math.min(cap, Math.max(0, max - effectVal));
            effects.push({
                value: effectVal,
                position: def.properties.Position
            });
        }
    }
    if (effects.length === 0) return null;
    return { max: max, cap: cap, effects: effects };
};

$.getGaugeCap = function(battler, gaugeType, customId) {
    var info = $.getReduceMaximumCapInfo(battler, gaugeType, customId, 'simple');
    return info ? info.cap : null;
};

$.clampGaugeValueForSet = function(battler, gaugeType, value) {
    var cap = $.getGaugeCap(battler, gaugeType, null);
    if (cap === null) return value;
    return Math.min(value, cap);
};

$.enforceReduceMaximumCaps = function(battler) {
    if (!battler || battler._jakeEIGEnforcingCap) return;
    battler._jakeEIGEnforcingCap = true;
    try {
        var capHp = $.getGaugeCap(battler, 'HP', null);
        if (capHp !== null && battler.hp > capHp) {
            battler._jakeEIGSkipClamp = true;
            battler.setHp(capHp);
            battler._jakeEIGSkipClamp = false;
        }
        var capMp = $.getGaugeCap(battler, 'MP', null);
        if (capMp !== null && battler.mp > capMp) {
            battler._jakeEIGSkipClamp = true;
            battler.setMp(capMp);
            battler._jakeEIGSkipClamp = false;
        }
        var capTp = $.getGaugeCap(battler, 'TP', null);
        if (capTp !== null && battler.tp > capTp) {
            battler._jakeEIGSkipClamp = true;
            battler.setTp(capTp);
            battler._jakeEIGSkipClamp = false;
        }
    } finally {
        battler._jakeEIGEnforcingCap = false;
    }
};

$.computeReduceMaximumFillSpan = function(capInfo, fillValue, max, dw) {
    var leftReserve = 0;
    var rightReserve = 0;
    var effects = capInfo.effects;
    for (var i = 0; i < effects.length; i++) {
        var eff = effects[i];
        var effectRate = max > 0 ? eff.value / max : 0;
        if ($.isLeftAnchoredPosition(eff.position)) {
            leftReserve = Math.max(leftReserve, effectRate);
        }
        if ($.isRightAnchoredPosition(eff.position)) {
            rightReserve = Math.max(rightReserve, effectRate);
        }
    }
    var usableWidth = 1 - leftReserve - rightReserve;
    if (usableWidth <= 0) {
        return { startPx: 0, fillW: 0 };
    }
    var cap = Math.max(0, capInfo.cap);
    var fillInUsable = cap > 0 ? (Math.min(fillValue, cap) / cap).clamp(0, 1) : 0;
    var startRate = leftReserve;
    var endRate = leftReserve + usableWidth * fillInUsable;
    if (endRate <= startRate) {
        return { startPx: 0, fillW: 0 };
    }
    return {
        startPx: Math.floor(dw * startRate),
        fillW: Math.max(0, Math.floor(dw * endRate) - Math.floor(dw * startRate))
    };
};

$.drawGaugeFillWithReduceMaximum = function(win, dx, gaugeY, dw, gaugeH,
    fillValue, max, battler, gaugeType, customId, drawMode, color1, color2) {
    var capInfo = $.getReduceMaximumCapInfo(battler, gaugeType, customId, drawMode);
    if (!capInfo) {
        var fillW = Math.floor(dw * (max > 0 ? fillValue / max : 0)).clamp(0, dw);
        if (fillW > 0) {
            win.contents.gradientFillRect(dx, gaugeY, fillW, gaugeH, color1, color2);
        }
        return;
    }
    fillValue = Math.min(fillValue, capInfo.cap);
    var span = $.computeReduceMaximumFillSpan(capInfo, fillValue, max, dw);
    if (span.fillW > 0) {
        win.contents.gradientFillRect(dx + span.startPx, gaugeY, span.fillW, gaugeH,
            color1, color2);
    }
};

$.installPatternHooks = function() {
    if ($.patternHooksInstalled) return;
    $.patternHooksInstalled = true;

    var JakeEIG_BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        JakeEIG_BattleManager_startBattle.call(this);
        $.preloadBattleGaugePatterns();
        $.requestPatternRefresh();
    };

    if (typeof Scene_Battle !== 'undefined') {
        var JakeEIG_Scene_Battle_createStatusWindow =
            Scene_Battle.prototype.createStatusWindow;
        Scene_Battle.prototype.createStatusWindow = function() {
            JakeEIG_Scene_Battle_createStatusWindow.call(this);
            $.reserveAllStatePatterns();
        };
    }
};

$.patternHooksInstalled = false;

$.installBattlerReduceMaximumHooks = function() {
    if (Game_BattlerBase.prototype.setHp._jakeEIGReduceMaxWrapped) return;

    var JakeEIG_setHp = Game_BattlerBase.prototype.setHp;
    Game_BattlerBase.prototype.setHp = function(hp) {
        if (!this._jakeEIGSkipClamp) {
            hp = $.clampGaugeValueForSet(this, 'HP', hp);
        }
        JakeEIG_setHp.call(this, hp);
    };
    Game_BattlerBase.prototype.setHp._jakeEIGReduceMaxWrapped = true;

    var JakeEIG_setMp = Game_BattlerBase.prototype.setMp;
    Game_BattlerBase.prototype.setMp = function(mp) {
        if (!this._jakeEIGSkipClamp) {
            mp = $.clampGaugeValueForSet(this, 'MP', mp);
        }
        JakeEIG_setMp.call(this, mp);
    };
    Game_BattlerBase.prototype.setMp._jakeEIGReduceMaxWrapped = true;

    var JakeEIG_setTp = Game_BattlerBase.prototype.setTp;
    Game_BattlerBase.prototype.setTp = function(tp) {
        if (!this._jakeEIGSkipClamp) {
            tp = $.clampGaugeValueForSet(this, 'TP', tp);
        }
        JakeEIG_setTp.call(this, tp);
    };
    Game_BattlerBase.prototype.setTp._jakeEIGReduceMaxWrapped = true;

    var JakeEIG_Battler_addState = Game_Battler.prototype.addState;
    Game_Battler.prototype.addState = function(stateId) {
        JakeEIG_Battler_addState.call(this, stateId);
        if (this.isStateAffected && this.isStateAffected(stateId)) {
            $.enforceReduceMaximumCaps(this);
        }
    };

    if (Game_BattlerBase.prototype.setStateCounter) {
        var JakeEIG_setStateCounter = Game_BattlerBase.prototype.setStateCounter;
        Game_BattlerBase.prototype.setStateCounter = function(stateId, value) {
            JakeEIG_setStateCounter.call(this, stateId, value);
            $.enforceReduceMaximumCaps(this);
        };
    }
    if (Game_BattlerBase.prototype.addStateCounter) {
        var JakeEIG_addStateCounter = Game_BattlerBase.prototype.addStateCounter;
        Game_BattlerBase.prototype.addStateCounter = function(stateId, value) {
            JakeEIG_addStateCounter.call(this, stateId, value);
            $.enforceReduceMaximumCaps(this);
        };
    }

    var JakeEIG_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
    Game_Battler.prototype.onBattleStart = function() {
        JakeEIG_Battler_onBattleStart.call(this);
        $.enforceReduceMaximumCaps(this);
    };

    var JakeEIG_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        JakeEIG_Actor_setup.call(this, actorId);
        $.enforceReduceMaximumCaps(this);
    };

    if (typeof Scene_Map !== 'undefined') {
        var JakeEIG_Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
        Scene_Map.prototype.onMapLoaded = function() {
            JakeEIG_Scene_Map_onMapLoaded.call(this);
            if (!$gameParty) return;
            var members = $gameParty.members();
            for (var i = 0; i < members.length; i++) {
                $.enforceReduceMaximumCaps(members[i]);
            }
        };
    }

    var JakeEIG_extractSave = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        JakeEIG_extractSave.call(this, contents);
        if (!$gameActors) return;
        for (var i = 1; i < $gameActors._data.length; i++) {
            var actor = $gameActors._data[i];
            if (actor) $.enforceReduceMaximumCaps(actor);
        }
    };
};

//=============================================================================
// Effect Drawing Pass
//=============================================================================

$.drawGaugeEffects = function(win, battler, dx, dy, dw, yB, drawMode,
    simpleGaugeType, phase) {
    if (!battler) return;
    var rectGaugeType = (drawMode === 'hpCombined') ? 'HP' : simpleGaugeType;
    var rect = $.gaugeRect(win, dx, dy, dw, yB, battler, rectGaugeType);
    var effects = $.collectActiveEffects(battler, drawMode, simpleGaugeType);
    for (var i = 0; i < effects.length; i++) {
        var entry = effects[i];
        if (phase === 'outside' && !$.isOutsidePosition(entry.props.Position)) {
            continue;
        }
        if (phase === 'inside' && $.isOutsidePosition(entry.props.Position)) {
            continue;
        }
        if (drawMode === 'simple' && entry.gaugeType !== simpleGaugeType) {
            continue;
        }
        if (drawMode === 'hpCombined' && entry.gaugeType === 'Barrier' &&
            $.channelBarrierPoints(battler, 'default') <= 0) {
            continue;
        }
        if (drawMode === 'hpCombined' && entry.gaugeType === 'CustomBarrier' &&
            $.channelBarrierPoints(battler, entry.customId) <= 0) {
            continue;
        }
        var geom = $.computeEffectRectOnGauge(win, rect, entry, battler, drawMode);
        $.drawEffectFill(win, geom.rect, entry.props);
    }
};

$.drawAllGaugeEffects = function(win, battler, dx, dy, dw, yB, drawMode,
    simpleGaugeType) {
    $.drawGaugeEffects(win, battler, dx, dy, dw, yB, drawMode,
        simpleGaugeType, 'outside');
    $.drawGaugeEffects(win, battler, dx, dy, dw, yB, drawMode,
        simpleGaugeType, 'inside');
};

//=============================================================================
// drawGauge Hook
//=============================================================================

$.getDrawContext = function(win) {
    return win._jakeEIGCtx || null;
};

$.fillGaugeBackground = function(win, dx, gaugeY, dw, gaugeH, outline) {
    var color3 = win.gaugeBackColor();
    if (outline) {
        if (color3 && typeof color3 === 'object' && 'paintOpacity' in color3) {
            color3.paintOpacity = win.translucentOpacity();
            win.contents.fillRect(dx, gaugeY - 1, dw, gaugeH, color3);
        } else {
            win.changePaintOpacity(false);
            win.contents.fillRect(dx, gaugeY - 1, dw, gaugeH, color3);
            win.changePaintOpacity(true);
        }
        return {
            dx: dx + 1,
            gaugeY: gaugeY,
            dw: dw,
            gaugeH: gaugeH - 2
        };
    }
    win.contents.fillRect(dx, gaugeY, dw, gaugeH, color3);
    return { dx: dx, gaugeY: gaugeY, dw: dw, gaugeH: gaugeH };
};

$.installDrawGaugeHook = function() {
    if (Window_Base.prototype.drawGauge._jakeEIGHooked) return;

    var JakeEIG_Window_Base_drawGauge = Window_Base.prototype.drawGauge;
    Window_Base.prototype.drawGauge = function(dx, dy, dw, rate, color1, color2) {
        if (this._jakeEIGSuppress || !this._jakeEIGCtx) {
            return JakeEIG_Window_Base_drawGauge.call(this, dx, dy, dw, rate,
                color1, color2);
        }
        var ctx = this._jakeEIGCtx;
        var battler = ctx.battler;
        var gaugeType = ctx.gaugeType;
        var customId = ctx.customId;
        var drawMode = ctx.drawMode;
        var max = $.getGaugeMax(battler, gaugeType, customId);
        if (drawMode === 'hpCombined' && gaugeType === 'HP') {
            max = Math.max(1, battler.mhp);
        }
        var fillValue = max > 0 ? rate * max : 0;

        var gaugeH = $.resolveGaugeHeight(this, battler, gaugeType);
        var gaugeY = dy + this.lineHeight() - gaugeH - 2 + (ctx.yB || 0);
        var outline = $.isGaugeOutline(this);
        var bg = $.fillGaugeBackground(this, dx, gaugeY, dw, gaugeH, outline);
        dx = bg.dx;
        gaugeY = bg.gaugeY;
        dw = bg.dw;
        gaugeH = bg.gaugeH;

        $.drawGaugeFillWithReduceMaximum(this, dx, gaugeY, dw, gaugeH, fillValue,
            max, battler, gaugeType, customId, drawMode, color1, color2);
    };
    Window_Base.prototype.drawGauge._jakeEIGHooked = true;
};

$.installSimpleGaugeHook = function() {
    if (typeof Window_VisualHPGauge === 'undefined') return;
    if (Window_VisualHPGauge.prototype.jakeMSGDrawSimpleGauge &&
        Window_VisualHPGauge.prototype.jakeMSGDrawSimpleGauge._jakeEIGHooked) {
        return;
    }
    var proto = Window_VisualHPGauge.prototype;
    if (!proto.jakeMSGDrawSimpleGauge) return;
    var JakeEIG_jakeMSGDrawSimpleGauge = proto.jakeMSGDrawSimpleGauge;
    proto.jakeMSGDrawSimpleGauge = function(dx, dy, dw, rate, backColor,
        color1, color2, gaugeH) {
        if (this._jakeEIGSuppress || !this._jakeEIGCtx) {
            return JakeEIG_jakeMSGDrawSimpleGauge.call(this, dx, dy, dw, rate,
                backColor, color1, color2, gaugeH);
        }
        var ctx = this._jakeEIGCtx;
        var battler = ctx.battler;
        var gaugeType = ctx.gaugeType;
        var customId = ctx.customId;
        var drawMode = ctx.drawMode;
        var max = $.getGaugeMax(battler, gaugeType, customId);
        var fillValue = max > 0 ? rate * max : 0;
        var h = gaugeH || this.gaugeHeight();
        var gaugeY = dy + this.lineHeight() - h - 2 + (ctx.yB || 0);
        this.contents.fillRect(dx, gaugeY, dw, h, backColor);
        $.drawGaugeFillWithReduceMaximum(this, dx, gaugeY, dw, h, fillValue, max,
            battler, gaugeType, customId, drawMode, color1, color2);
    };
    proto.jakeMSGDrawSimpleGauge._jakeEIGHooked = true;
};

$.wrapBarrierGaugeDraw = function() {
    if (!Window_Base.prototype.drawBarrierGauge) return;
    if (Window_Base.prototype.drawBarrierGauge._jakeEIGWrapped) return;
    var JakeEIG_drawBarrierGauge = Window_Base.prototype.drawBarrierGauge;
    Window_Base.prototype.drawBarrierGauge = function(battler, wx, wy, ww) {
        this._jakeEIGSuppress = (this._jakeEIGSuppress || 0) + 1;
        var result = JakeEIG_drawBarrierGauge.call(this, battler, wx, wy, ww);
        this._jakeEIGSuppress = Math.max(0, (this._jakeEIGSuppress || 1) - 1);
        return result;
    };
    Window_Base.prototype.drawBarrierGauge._jakeEIGWrapped = true;
};

$.setDrawContext = function(win, ctx) {
    win._jakeEIGCtx = ctx;
};

$.clearDrawContext = function(win) {
    win._jakeEIGCtx = null;
};

$.wrapGaugeDrawMethod = function(proto, methodName, drawMode, gaugeType) {
    if (!proto || typeof proto[methodName] !== 'function') return;
    if (proto[methodName]._jakeEIGDrawAliased) return;
    var previous = proto[methodName];
    proto[methodName] = function() {
        var battler = arguments[0];
        var drawModeArg = drawMode;
        var gaugeTypeArg = gaugeType;
        if (!$.shouldApplyGaugeEffects(battler, drawModeArg, gaugeTypeArg)) {
            return previous.apply(this, arguments);
        }
        var x = arguments[1];
        var y = arguments[2];
        var width = arguments[3];
        var yB = $.yBufferForWindow(this);
        $.setDrawContext(this, {
            battler: battler,
            gaugeType: gaugeType,
            customId: null,
            drawMode: drawMode,
            yB: yB
        });
        $.drawGaugeEffects(this, battler, x, y, width, yB, drawMode, gaugeType,
            'outside');
        var result = previous.apply(this, arguments);
        $.drawGaugeEffects(this, battler, x, y, width, yB, drawMode, gaugeType,
            'inside');
        $.clearDrawContext(this);
        return result;
    };
    proto[methodName]._jakeEIGDrawAliased = true;
    if (previous._jakeMSGBarrierValueWrapped) {
        proto[methodName]._jakeMSGBarrierValueWrapped = true;
    }
    if (previous._jakeTFGDrawAliased) {
        proto[methodName]._jakeTFGDrawAliased = true;
    }
};

$.installVisualHpGaugeUpdateHook = function() {
    if (typeof Window_VisualHPGauge === 'undefined') return;
    if (Window_VisualHPGauge.prototype.update._jakeEIGRefreshHooked) return;
    var JakeEIG_Window_VisualHPGauge_update =
        Window_VisualHPGauge.prototype.update;
    Window_VisualHPGauge.prototype.update = function() {
        JakeEIG_Window_VisualHPGauge_update.call(this);
        if (this._battler && $.battlerHasAnyGaugeEffects(this._battler)) {
            this._requestRefresh = true;
        }
    };
    Window_VisualHPGauge.prototype.update._jakeEIGRefreshHooked = true;
};

$.ensureVisualHpGaugeHooks = function() {
    if (typeof Window_VisualHPGauge === 'undefined') return;
    var entries = [
        ['drawActorHp', 'hpCombined', 'HP'],
        ['drawJakeMSGActorMp', 'simple', 'MP'],
        ['drawJakeMSGActorTp', 'simple', 'TP']
    ];
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var methodName = entry[0];
        if (!Window_VisualHPGauge.prototype[methodName]) continue;
        if (!Window_VisualHPGauge.prototype[methodName]._jakeEIGDrawAliased) {
            $.wrapGaugeDrawMethod(Window_VisualHPGauge.prototype, methodName,
                entry[1], entry[2]);
        }
    }
    if (Window_VisualHPGauge.prototype.jakeMSGDrawSimpleGauge &&
        !Window_VisualHPGauge.prototype.jakeMSGDrawSimpleGauge._jakeEIGHooked) {
        $.installSimpleGaugeHook();
    }
    $.installVisualHpGaugeUpdateHook();
};

$.installGaugeDrawHooks = function() {
    $.installDrawGaugeHook();
    $.installSimpleGaugeHook();
    $.wrapBarrierGaugeDraw();

    $.wrapGaugeDrawMethod(Window_Base.prototype, 'drawActorHp', 'hpCombined', 'HP');
    $.wrapGaugeDrawMethod(Window_Base.prototype, 'drawActorMp', 'simple', 'MP');
    $.wrapGaugeDrawMethod(Window_Base.prototype, 'drawActorTp', 'simple', 'TP');

    $.ensureVisualHpGaugeHooks();

    if (typeof Window_EnemyInBattleStatus !== 'undefined') {
        $.wrapGaugeDrawMethod(Window_EnemyInBattleStatus.prototype, 'drawEnemyHp',
            'hpCombined', 'HP');
        $.wrapGaugeDrawMethod(Window_EnemyInBattleStatus.prototype, 'drawEnemyMp',
            'simple', 'MP');
        $.wrapGaugeDrawMethod(Window_EnemyInBattleStatus.prototype, 'drawEnemyTp',
            'simple', 'TP');
    }

    if (typeof Window_Help !== 'undefined') {
        if (Window_Help.prototype.drawJakeMSGEnemyHp) {
            $.wrapGaugeDrawMethod(Window_Help.prototype, 'drawJakeMSGEnemyHp',
                'hpCombined', 'HP');
        }
        if (Window_Help.prototype.drawJakeMSGEnemyMp) {
            $.wrapGaugeDrawMethod(Window_Help.prototype, 'drawJakeMSGEnemyMp',
                'simple', 'MP');
        }
        if (Window_Help.prototype.drawJakeMSGEnemyTp) {
            $.wrapGaugeDrawMethod(Window_Help.prototype, 'drawJakeMSGEnemyTp',
                'simple', 'TP');
        }
    }
};

$.hooksInstalled = false;
$.installAllHooks = function() {
    if (!$.hooksInstalled) {
        $.installGaugeDrawHooks();
        $.installBattlerReduceMaximumHooks();
        $.installPatternHooks();
        $.hooksInstalled = true;
    }
    $.ensureVisualHpGaugeHooks();
};

var JakeEIG_Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
    $.installAllHooks();
    JakeEIG_Scene_Boot_start.call(this);
};

//=============================================================================
// End of File
//=============================================================================

})(JakeMSG.EffectsInGauges);
