//=============================================================================
// JakeMSG_ThresholdsForGauges
// JakeMSG_ThresholdsForGauges.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_ThresholdsForGauges = true;

var JakeMSG = JakeMSG || {};
JakeMSG.ThresholdsForGauges = JakeMSG.ThresholdsForGauges || {};

//=============================================================================
/*:
 * @plugindesc v1.2 Adds customizable threshold lines and script timings to battle gauges.
 * @author JakeMSG
 * v1.2
 *
============ Change Log ============
1.2 - 7.1st.2026
 * Fixed Barrier / Custom Barrier threshold triggers on initial application
 * Fixed Barrier / Custom Barrier threshold line positions on combined HP gauges
 * Percentage-only Barrier thresholds without a max no longer draw or trigger
1.1 - 6.25th.2026
 * Fixed a crash upon Saving
1.0 - 6.23rd.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 *
 * This plugin adds Threshold markers to battle gauges (HP, MP, TP, and
 * optionally Barrier / Custom Barrier gauges). Each threshold is a vertical
 * line drawn on its gauge at a chosen value, and can optionally run a script
 * the moment the gauge fill reaches or bypasses that value.
 *
 * Thresholds are defined in Actor and Enemy note boxes using paired notetags.
 *
 * Compatible gauge-drawing plugins (threshold lines appear on their gauges):
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
 * Use an opening and closing tag pair. The gauge type is specified in the tag.
 *
 *   <Threshold HP: OptionalName>
 *    [Color: #FF0000; Threshold: 50%]
 *    $gameMessage.add('Half HP threshold crossed!');
 *   </Threshold HP>
 *
 * Supported gauge types in the tag:
 *   HP
 *   MP
 *   TP
 *   Barrier              (requires YEP_AbsorptionBarrier)
 *   CustomBarrier[X]       (requires JakeMSG_YEP_AbsorptionBarrier_Additions;
 *                           X is the Custom Barrier ID)
 *
 * The opening tag may include an optional name after ":". If omitted, the
 * threshold cannot be accessed later from outside unless you set a Name
 * property inside the block.
 *
 * ---------------------------------------------------------------------------
 * Merging repeated tags
 * ---------------------------------------------------------------------------
 *
 * If the same optional name is used in multiple opening tags of the same gauge
 * type, all of their contents are merged into one threshold.
 *
 * If the opening tag has no name, each pair defines a separate threshold,
 * unless a Name property inside the block matches another threshold's Name
 * (same gauge type), in which case they are merged.
 *
 * ---------------------------------------------------------------------------
 * Properties (inside [brackets])
 * ---------------------------------------------------------------------------
 *
 * Properties must appear before script lines. One or more per bracket pair,
 * separated by semicolons. Use ":" or "=" between name and value.
 *
 *   [Color: #000000; Thickness: 2; Threshold: 25 + 10%]
 *   [Color: #000000; Thickness: 2; Threshold: 25 - 10%]
 *
 * All properties are optional.
 *
 *   Name               String identifier for external access. Default: none.
 *   Color              Hex color for the line. Default: #000000 (black).
 *   Thickness          Line thickness in pixels. Default: 2.
 *   Top Height Mod.    Extra pixels above the gauge (negative = shorter top).
 *                      Default: 0.
 *   Bottom Height Mod. Extra pixels below the gauge (negative = shorter bottom).
 *                      Default: 0.
 *   Thres. Orientation Normal (from left / standard fill) or Reverse (from
 *                      right / inverted fill). Default: Normal.
 *   Threshold          Position value and script trigger point.
 *                      Formats: flat number (50), percentage (50%), or combination
 *                      with + (10 + 25%) or - (10 - 25%). With +, flat is added to
 *                      the percentage portion; with -, flat is subtracted from the
 *                      percentage portion. Values cannot be negative. Default: 0.
 *                      For Barrier / CustomBarrier without a defined maximum,
 *                      any percentage portion is treated as 0%.
 *                      Threshold will trigger if this value is reached (equal) or crossed over
 *   OnReachDisable     True / False. If True, disables the threshold after its
 *                      script runs once (sets Enabled to false). Default: False.
 *   Condition          JavaScript condition string. Threshold is visible and
 *                      can trigger only when this is true. Default: true.
 *   Invisible          True / False. Hides the line but keeps script timing.
 *                      Default: False.
 *   Enabled            True / False. Whether the threshold is active.
 *                      Default: True. Set to False by OnReachDisable.
 *
 * ---------------------------------------------------------------------------
 * Script block
 * ---------------------------------------------------------------------------
 *
 * After all property lines, any remaining lines (until the closing tag) are
 * executed as a script call when the threshold is crossed. Script execution is
 * deferred to the next scene update so that messages and other effects do not
 * interrupt battle input or map events mid-instruction.
 *
 * Thresholds trigger anywhere except the title screen (map events, menus,
 * battle, and debug/console commands are all supported).
 *
 * ============================================================================
 * Accessing thresholds from other script calls
 * ============================================================================
 *
 * Each battler (party member or troop enemy) has a member object:
 *
 *   battler.thresholds
 *
 * This is a keymap whose keys are threshold Name strings. The Name comes from
 * the opening notetag (e.g. <Threshold HP: LowHP>) or from the Name property
 * inside the block. If no Name was set, a random 20-character key is assigned.
 *
 * Each threshold is itself a keymap of property names to values. Properties
 * are readable and writable:
 *
 *   // Read from a property
 *   var color = battler.thresholds['LowHP']['Color'];
 *   var color = battler.thresholds.LowHP.Color;
 *
 *   // Write to a property
 *   battler.thresholds['LowHP']['Enabled'] = true;
 *   battler.thresholds.LowHP.Enabled = true;
 *
 * Helper variables from eval timings are also stored on the threshold object:
 *
 *   battler.thresholds['LowHP']['currentVal']
 *   battler.thresholds.LowHP.currentVal    
 * 
 *   battler.thresholds['LowHP']['previousVal']
 *   battler.thresholds.LowHP.previousVal
 * 
 *   battler.thresholds['LowHP']['rawThreshold']
 *   battler.thresholds.LowHP.rawThreshold
 *
 * rawThreshold is the flat gauge position resolved from Threshold (including
 * percentage and combination values). Assigning a flat number to rawThreshold
 * sets Threshold to that flat value directly.
 *
 * ============================================================================
 * Helper Variables (inside threshold script blocks)
 * ============================================================================
 *
 *   currentVal         Current fill value of this threshold's gauge. Can be
 *                      assigned to in order to change the gauge fill directly.
 *   previousVal        Gauge fill value immediately before the latest change
 *                      that caused this threshold check.
 *   rawThreshold       Flat gauge position resolved from Threshold (percentage
 *                      and combination values are calculated). Assign only a flat
 *                      number to change Threshold directly.
 *   propertyCheck(name) Read a threshold property: propertyCheck('Color')
 *   propertySet(name,val) Write a threshold property: propertySet('Enabled', false)
 *
 * When modifying Threshold inside a script block, pass a flat number, a
 * percentage string ('50%'), or a combination string ('10 + 25%' or '10 - 25%').
 * Assigning rawThreshold accepts only flat numbers and writes Threshold as that value.
 * Visual and functional updates apply at the end of that script execution.
 *
 * Standard script-call aliases (a, b, actor, enemy, s, v, etc.) refer to the
 * battler that owns the threshold.
 * 
 */
//=============================================================================

(function($) {
'use strict';

$.version = 1.2;

//=============================================================================
// Defaults and Constants
//=============================================================================

$.DEFAULTS = {
    'Name': undefined,
    'Color': '#000000',
    'Thickness': 2,
    'Top Height Mod.': 0,
    'Bottom Height Mod.': 0,
    'Thres. Orientation': 'Normal',
    'Threshold': '0',
    'OnReachDisable': false,
    'Condition': 'true',
    'Invisible': false,
    'Enabled': true
};

$.PROPERTY_NAMES = [
    'Name', 'Color', 'Thickness', 'Top Height Mod.', 'Bottom Height Mod.',
    'Thres. Orientation', 'Threshold', 'OnReachDisable', 'Condition',
    'Invisible', 'Enabled'
];

$.OPEN_TAG_REGEX =
    /<Threshold[ ](CustomBarrier\[(\d+)\]|HP|MP|TP|Barrier)(?:[:=][ ]*(.+?))?[ ]*>/i;
$.CLOSE_TAG_REGEX =
    /<\/Threshold[ ](CustomBarrier\[(\d+)\]|HP|MP|TP|Barrier)(?:[:=][ ]*(.+?))?[ ]*>/i;
$.PROPERTY_LINE_REGEX = /^\s*\[([\s\S]+)\]\s*$/;
$.PROPERTY_PAIR_REGEX = /([^;=]+?)[ ]*[:=][ ]*([\s\S]*)/;

//=============================================================================
// Utilities
//=============================================================================

$.splitLines = function(text) {
    return String(text || '').split(/[\r\n]+/);
};

$.randomKey = function() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var key = '';
    for (var i = 0; i < 20; i++) {
        key += chars.charAt(Math.randomInt(chars.length));
    }
    return key;
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

$.normalizeOrientation = function(value) {
    var text = String(value || 'Normal').trim().toLowerCase();
    return (text === 'reverse') ? 'Reverse' : 'Normal';
};

$.parsePropertyLine = function(line, target) {
    var match = line.match($.PROPERTY_LINE_REGEX);
    if (!match) return false;
    var parts = match[1].split(';');
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        if (!part) continue;
        var pair = part.match($.PROPERTY_PAIR_REGEX);
        if (!pair) continue;
        var name = pair[1].trim();
        var value = pair[2].trim();
        if (name === 'Thickness' || name === 'Top Height Mod.' ||
            name === 'Bottom Height Mod.') {
            target[name] = Number(value) || 0;
        } else if (name === 'OnReachDisable' || name === 'Invisible' ||
            name === 'Enabled') {
            target[name] = $.parseBoolean(value, $.DEFAULTS[name]);
        } else if (name === 'Thres. Orientation') {
            target[name] = $.normalizeOrientation(value);
        } else if (name === 'Name') {
            target[name] = value;
        } else {
            target[name] = value;
        }
    }
    return true;
};

$.parseThresholdValue = function(text, max) {
    var raw = String(text || '0').trim();
    if (!raw) return 0;
    var flat = 0;
    var percent = 0;
    var pctMax = (max > 0) ? max : 0;
    var result;
    if (raw.indexOf('+') >= 0) {
        var addPieces = raw.split('+');
        for (var i = 0; i < addPieces.length; i++) {
            var addPiece = addPieces[i].trim();
            if (!addPiece) continue;
            if (/%|％/.test(addPiece)) {
                percent += parseFloat(addPiece) || 0;
            } else {
                flat += parseFloat(addPiece) || 0;
            }
        }
        result = flat + pctMax * (percent / 100);
    } else if (raw.indexOf('-') >= 0) {
        var subPieces = raw.split('-');
        for (var j = 0; j < subPieces.length; j++) {
            var subPiece = subPieces[j].trim();
            if (!subPiece) continue;
            if (/%|％/.test(subPiece)) {
                percent += parseFloat(subPiece) || 0;
            } else {
                flat += parseFloat(subPiece) || 0;
            }
        }
        result = pctMax * (percent / 100) - flat;
    } else if (/%|％/.test(raw)) {
        percent = parseFloat(raw) || 0;
        result = pctMax * (percent / 100);
    } else {
        flat = parseFloat(raw) || 0;
        result = flat;
    }
    if (flat < 0) flat = 0;
    if (percent < 0) percent = 0;
    return Math.max(0, result);
};

$.resolveThresholdPosition = function(thresholdObj, max) {
    return $.parseThresholdValue(thresholdObj['Threshold'], max);
};

$.thresholdHasPercentComponent = function(text) {
    return /%|％/.test(String(text || ''));
};

$.hasResolvableThreshold = function(thresh, battler) {
    if (!thresh || !battler) return false;
    var gaugeType = thresh._gaugeType;
    if (gaugeType !== 'Barrier' && gaugeType !== 'CustomBarrier') return true;
    var text = thresh['Threshold'];
    var definedMax = $.getGaugeMax(battler, gaugeType, thresh._customBarrierId);
    if ($.thresholdHasPercentComponent(text) && definedMax <= 0) {
        return false;
    }
    return true;
};

$.resolveThresholdForBattler = function(thresh, battler) {
    if (!$.hasResolvableThreshold(thresh, battler)) return -1;
    var max = $.getGaugeMax(battler, thresh._gaugeType, thresh._customBarrierId);
    return $.resolveThresholdPosition(thresh, max);
};

$.getRawThreshold = function(thresh, battler) {
    if (!thresh || !battler) return 0;
    var resolved = $.resolveThresholdForBattler(thresh, battler);
    return resolved < 0 ? 0 : resolved;
};

$.isFlatThresholdValue = function(value) {
    if (typeof value === 'number') return isFinite(value);
    var text = String(value).trim();
    if (!text || /%|％|\+|-/.test(text)) return false;
    return !isNaN(parseFloat(text));
};

$.setRawThreshold = function(thresh, battler, value) {
    if (!thresh || !$.isFlatThresholdValue(value)) return false;
    var flat = Math.max(0, Number(value) || 0);
    thresh['Threshold'] = String(flat);
    thresh._tfgThresholdPending = true;
    return true;
};

$.orientedFill = function(value, max, orientation) {
    var val = Math.max(0, Number(value) || 0);
    var cap = Math.max(0, Number(max) || 0);
    if ($.normalizeOrientation(orientation) === 'Reverse') {
        return Math.max(0, cap - val);
    }
    return val;
};

$.gaugeTypeKey = function(gaugeType, customId) {
    if (gaugeType === 'CustomBarrier') {
        return 'CustomBarrier[' + customId + ']';
    }
    return gaugeType;
};

$.logError = function(context, e, code) {
    console.error('JakeMSG_ThresholdsForGauges ' + context + ': ' + e.message);
    if (code) console.error(code);
};

$.dataFromBattler = function(battler) {
    if (!battler) return null;
    if (battler.isActor && battler.isActor()) {
        return $dataActors[battler.actorId()];
    }
    if (battler.isEnemy && battler.isEnemy()) {
        return $dataEnemies[battler.enemyId()];
    }
    return null;
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

//=============================================================================
// Notetag Parsing
//=============================================================================

$.newThresholdDraft = function(gaugeType, customId, tagName) {
    return {
        gaugeType: gaugeType,
        customId: customId,
        tagName: tagName ? String(tagName).trim() : '',
        properties: {},
        scriptLines: []
    };
};

$.mergeDraft = function(target, source) {
    var props = source.properties || {};
    var keys = Object.keys(props);
    for (var i = 0; i < keys.length; i++) {
        target.properties[keys[i]] = props[keys[i]];
    }
    if (source.scriptLines && source.scriptLines.length > 0) {
        target.scriptLines = target.scriptLines.concat(source.scriptLines);
    }
};

$.draftMergeKey = function(draft) {
    var name = draft.properties.Name || draft.tagName || '';
    if (name) {
        return $.gaugeTypeKey(draft.gaugeType, draft.customId) + '::' + name;
    }
    return $.gaugeTypeKey(draft.gaugeType, draft.customId) + '::__' + draft._uid;
};

$.parseThresholdBlock = function(lines) {
    var draft = $.newThresholdDraft(lines.gaugeType, lines.customId, lines.tagName);
    draft._uid = $.randomKey();
    var inScript = false;
    for (var i = 0; i < lines.content.length; i++) {
        var line = lines.content[i];
        if (!inScript && $.parsePropertyLine(line, draft.properties)) {
            continue;
        }
        inScript = true;
        draft.scriptLines.push(line);
    }
    return draft;
};

$.finalizeThresholdDefs = function(drafts) {
    var merged = {};
    var order = [];
    for (var i = 0; i < drafts.length; i++) {
        var draft = drafts[i];
        if (draft.properties.Name && !draft.tagName) {
            draft.tagName = draft.properties.Name;
        }
        var key = $.draftMergeKey(draft);
        if (!merged[key]) {
            merged[key] = $.newThresholdDraft(draft.gaugeType, draft.customId,
                draft.tagName || draft.properties.Name || '');
            merged[key]._uid = draft._uid;
            order.push(key);
        }
        $.mergeDraft(merged[key], draft);
    }
    var result = [];
    for (var j = 0; j < order.length; j++) {
        var item = merged[order[j]];
        var props = {};
        var names = $.PROPERTY_NAMES;
        for (var k = 0; k < names.length; k++) {
            var prop = names[k];
            if (item.properties[prop] !== undefined) {
                props[prop] = item.properties[prop];
            }
        }
        result.push({
            gaugeType: item.gaugeType,
            customId: item.customId,
            tagName: item.tagName || item.properties.Name || '',
            properties: props,
            script: item.scriptLines.join('\n')
        });
    }
    return result;
};

$.parseThresholdNotetags = function(dataObj) {
    if (!dataObj) return;
    var lines = $.splitLines(dataObj.note || '');
    var drafts = [];
    var open = null;
    var content = [];

    var flush = function() {
        if (!open) return;
        drafts.push($.parseThresholdBlock({
            gaugeType: open.gaugeType,
            customId: open.customId,
            tagName: open.tagName,
            content: content
        }));
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
            open = {
                gaugeType: gaugeType,
                customId: customId,
                tagName: openMatch[3] ? String(openMatch[3]).trim() : ''
            };
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
    dataObj.jakeTFGThresholds = $.finalizeThresholdDefs(drafts);
};

$.processDatabase = function() {
    if (!$dataActors || !$dataEnemies) return;
    for (var i = 1; i < $dataActors.length; i++) {
        $.parseThresholdNotetags($dataActors[i]);
    }
    for (var j = 1; j < $dataEnemies.length; j++) {
        $.parseThresholdNotetags($dataEnemies[j]);
    }
};

$.databaseLoaded = false;
var JakeTFG_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!JakeTFG_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!$.databaseLoaded) {
        $.processDatabase();
        $.databaseLoaded = true;
    }
    return true;
};

//=============================================================================
// Battler Threshold Runtime
//=============================================================================

$.defineHidden = function(obj, key, value, writable) {
    Object.defineProperty(obj, key, {
        value: value,
        writable: writable !== false,
        enumerable: false,
        configurable: true
    });
};

$.bindThresholdAccessors = function(thresh, battler) {
    var gaugeType = thresh._gaugeType;
    var customId = thresh._customBarrierId;
    // Non-enumerable so JsonEx.save does not invoke battler-dependent getters mid-encode.
    Object.defineProperty(thresh, 'currentVal', {
        get: function() {
            return $.getGaugeValue(battler, gaugeType, customId);
        },
        set: function(value) {
            $.setGaugeValue(battler, gaugeType, customId, value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(thresh, 'previousVal', {
        get: function() {
            return thresh._previousVal || 0;
        },
        set: function(value) {
            thresh._previousVal = Number(value) || 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(thresh, 'rawThreshold', {
        get: function() {
            return $.getRawThreshold(thresh, battler);
        },
        set: function(value) {
            $.setRawThreshold(thresh, battler, value);
        },
        enumerable: false,
        configurable: true
    });
};

$.syncThresholdSaveEntry = function(battler, thresh) {
    if (!battler || !thresh || !thresh._accessKey) return;
    if (!battler._tfgThresholdData) {
        battler._tfgThresholdData = {};
    }
    var entry = {};
    for (var i = 0; i < $.PROPERTY_NAMES.length; i++) {
        var prop = $.PROPERTY_NAMES[i];
        if (thresh[prop] !== undefined) {
            entry[prop] = thresh[prop];
        }
    }
    battler._tfgThresholdData[thresh._accessKey] = entry;
};

$.applyThresholdSaveData = function(battler) {
    var saved = battler._tfgThresholdData;
    var map = battler._thresholdMap;
    if (!saved || !map) return;
    for (var key in saved) {
        if (!saved.hasOwnProperty(key)) continue;
        var thresh = map[key];
        if (!thresh) continue;
        var entry = saved[key];
        for (var i = 0; i < $.PROPERTY_NAMES.length; i++) {
            var prop = $.PROPERTY_NAMES[i];
            if (entry[prop] !== undefined) {
                thresh[prop] = entry[prop];
            }
        }
    }
};

$.setThresholdMap = function(battler, map) {
    Object.defineProperty(battler, '_thresholdMap', {
        value: map,
        writable: true,
        enumerable: false,
        configurable: true
    });
};

$.restoreBattlerThresholds = function(battler) {
    if (!battler) return;
    if (!battler._tfgThresholdData) {
        battler._tfgThresholdData = {};
    }
    $.refreshThresholdMap(battler, true);
    $.applyThresholdSaveData(battler);
    $.snapshotGaugeValues(battler);
};

$.restoreAllActorThresholds = function() {
    if (!$gameActors) return;
    for (var i = 1; i < $gameActors._data.length; i++) {
        var actor = $gameActors._data[i];
        if (actor) {
            $.restoreBattlerThresholds(actor);
        }
    }
};

$.createRuntimeThreshold = function(battler, def) {
    var thresh = {};
    var names = $.PROPERTY_NAMES;
    for (var i = 0; i < names.length; i++) {
        var key = names[i];
        if (def.properties[key] !== undefined) {
            thresh[key] = def.properties[key];
        } else if ($.DEFAULTS[key] !== undefined) {
            thresh[key] = $.DEFAULTS[key];
        }
    }
    var tagName = String(def.tagName || '').trim();
    if ((thresh.Name === undefined || String(thresh.Name).trim() === '') && tagName) {
        thresh.Name = tagName;
    }
    var accessName = (thresh.Name !== undefined && String(thresh.Name).trim() !== '') ?
        String(thresh.Name).trim() : '';
    var accessKey = accessName || $.randomKey();

    $.defineHidden(thresh, '_accessKey', accessKey);
    $.defineHidden(thresh, '_gaugeType', def.gaugeType);
    $.defineHidden(thresh, '_customBarrierId', def.customId);
    $.defineHidden(thresh, '_script', String(def.script || ''));
    $.defineHidden(thresh, '_tfgThresholdPending', false);
    $.defineHidden(thresh, '_previousVal', 0);
    $.defineHidden(thresh, '_tfgLastFireFrame', -1);
    $.defineHidden(thresh, 'propertyCheck', function(name) {
        return thresh[name];
    }, false);
    $.defineHidden(thresh, 'propertySet', function(name, value) {
        thresh[name] = value;
        if (name === 'Threshold') thresh._tfgThresholdPending = true;
        $.syncThresholdSaveEntry(battler, thresh);
        return value;
    }, false);

    $.bindThresholdAccessors(thresh, battler);
    $.syncThresholdSaveEntry(battler, thresh);
    return thresh;
};

$.refreshThresholdMap = function(battler, replace) {
    if (!battler) return {};
    if (!replace && battler._thresholdMap) {
        return battler._thresholdMap;
    }
    var map = {};
    $.defineHidden(map, '_battler', battler);
    var data = $.dataFromBattler(battler);
    if (data && data.jakeTFGThresholds) {
        for (var i = 0; i < data.jakeTFGThresholds.length; i++) {
            var def = data.jakeTFGThresholds[i];
            var thresh = $.createRuntimeThreshold(battler, def);
            map[thresh._accessKey] = thresh;
        }
    }
    $.setThresholdMap(battler, map);
    $.applyThresholdSaveData(battler);
    return map;
};

$.ensureThresholdMap = function(battler) {
    if (!battler) return {};
    if (!battler._thresholdMap) {
        $.refreshThresholdMap(battler, true);
    }
    return battler._thresholdMap;
};

$.initBattlerThresholds = function(battler) {
    $.refreshThresholdMap(battler, true);
};

$.installBattlerThresholdMember = function() {
    if (Game_Battler.prototype._jakeTFGThresholdMemberInstalled) return;

    var JakeTFG_Battler_initMembers = Game_Battler.prototype.initMembers;
    Game_Battler.prototype.initMembers = function() {
        JakeTFG_Battler_initMembers.call(this);
        this._tfgThresholdData = {};
        $.defineHidden(this, '_thresholdMap', null);
        $.defineHidden(this, '_tfgPrevGauge', null);
    };

    Object.defineProperty(Game_Battler.prototype, 'thresholds', {
        get: function() {
            return $.ensureThresholdMap(this);
        },
        set: function(value) {
            $.setThresholdMap(this, value);
        },
        configurable: true,
        enumerable: false
    });

    Game_Battler.prototype._jakeTFGThresholdMemberInstalled = true;
};

$.snapshotGaugeValues = function(battler) {
    var snap = {};
    snap.HP = battler.hp;
    snap.MP = battler.mp;
    snap.TP = battler.tp;
    if (Imported.YEP_AbsorptionBarrier && battler.barrierPoints) {
        snap.Barrier = battler.barrierPoints();
    }
    snap.CustomBarrier = {};
    if (Imported.JakeMSG_YEP_AbsorptionBarrier_Additions && battler.cBarrierPoints &&
        Yanfly.ABR_JakeMSGAdd && Yanfly.ABR_JakeMSGAdd.customIds) {
        var ids = Yanfly.ABR_JakeMSGAdd.customIds();
        for (var i = 0; i < ids.length; i++) {
            snap.CustomBarrier[ids[i]] = battler.cBarrierPoints(ids[i]);
        }
    }
    battler._tfgPrevGauge = snap;
};

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

$.setGaugeValue = function(battler, gaugeType, customId, value) {
    if (!battler) return;
    value = Math.max(0, Math.floor(Number(value) || 0));
    switch (gaugeType) {
    case 'HP':
        battler.setHp(value);
        break;
    case 'MP':
        battler.setMp(value);
        break;
    case 'TP':
        battler.setTp(value);
        break;
    case 'Barrier':
        if (battler.setBarrierTotal) {
            battler.setBarrierTotal(value);
        } else if (battler.gainBarrier) {
            var cur = $.getGaugeValue(battler, 'Barrier');
            battler.gainBarrier(value - cur);
        }
        break;
    case 'CustomBarrier':
        if (battler.setCBarrierTotal) {
            battler.setCBarrierTotal(customId, value);
        } else if (battler.gainCBarrier) {
            var cCur = $.getGaugeValue(battler, 'CustomBarrier', customId);
            battler.gainCBarrier(customId, value - cCur);
        }
        break;
    }
};

$.evaluateCondition = function(thresh, battler) {
    var code = String(thresh.Condition || 'true');
    try {
        var a = battler;
        var b = battler;
        var actor = (battler.isActor && battler.isActor()) ? battler : null;
        var enemy = (battler.isEnemy && battler.isEnemy()) ? battler : null;
        var subject = battler;
        var user = battler;
        var target = battler;
        var owningMember = $.getOwningMemberIndex(battler);
        var s = $gameSwitches ? $gameSwitches._data : [];
        var v = $gameVariables ? $gameVariables._data : [];
        var threshold = thresh;
        var propertyCheck = thresh.propertyCheck;
        var propertySet = thresh.propertySet;
        var currentVal = thresh.currentVal;
        var previousVal = thresh.previousVal;
        var rawThreshold = $.getRawThreshold(thresh, battler);
        return !!eval(code);
    } catch (e) {
        $.logError('Condition', e, code);
        return false;
    }
};

$.thresholdCrossed = function(thresh, prev, cur, max, battler) {
    if (battler && !$.hasResolvableThreshold(thresh, battler)) return false;
    var orientation = thresh['Thres. Orientation'];
    var thresholdVal = battler ?
        $.resolveThresholdForBattler(thresh, battler) :
        $.resolveThresholdPosition(thresh, max);
    if (thresholdVal < 0) return false;
    var prevO = $.orientedFill(prev, max, orientation);
    var curO = $.orientedFill(cur, max, orientation);
    if (prevO === curO) return false;
    return (prevO < thresholdVal && curO >= thresholdVal) ||
        (prevO > thresholdVal && curO <= thresholdVal);
};

$.isTitleScene = function() {
    return typeof Scene_Title !== 'undefined' &&
        SceneManager._scene instanceof Scene_Title;
};

$.canTrackThresholdChanges = function() {
    return !!SceneManager._scene && !$.isTitleScene();
};

$.pendingThresholdQueue = [];
$.pendingThresholdWaitMessage = false;

$.queueThresholdExecution = function(thresh, battler, prev, cur) {
    $.pendingThresholdQueue.push({
        thresh: thresh,
        battler: battler,
        prev: prev,
        cur: cur
    });
};

$.restoreBattleInputAfterThresholdMessage = function() {
    if (!(SceneManager._scene instanceof Scene_Battle)) return;
    if (!BattleManager.isInputting()) return;
    if ($gameMessage && $gameMessage.isBusy()) return;
    SceneManager._scene.changeInputWindow();
};

$.canProcessThresholdQueue = function() {
    if ($.pendingThresholdWaitMessage) {
        if ($gameMessage && $gameMessage.isBusy()) return false;
        $.pendingThresholdWaitMessage = false;
        $.restoreBattleInputAfterThresholdMessage();
    }
    if ($.pendingThresholdQueue.length <= 0) return false;
    if ($.isTitleScene()) return false;
    if ($gameMessage && $gameMessage.isBusy()) return false;
    if (SceneManager._scene instanceof Scene_Battle && BattleManager.isBusy()) {
        return false;
    }
    return true;
};

$.processThresholdQueue = function() {
    if (!$.canProcessThresholdQueue()) return;
    var item = $.pendingThresholdQueue.shift();
    if (!item) return;
    $.executeThresholdScript(item.thresh, item.battler, item.prev, item.cur);
    if ($gameMessage && $gameMessage.isBusy()) {
        $.pendingThresholdWaitMessage = true;
    }
};

$.executeThresholdScript = function(thresh, battler, prev, cur) {
    var code = String(thresh._script || '').trim();
    if (!code) return;
    var beforeVal = cur;
    try {
        var a = battler;
        var b = battler;
        var actor = (battler.isActor && battler.isActor()) ? battler : null;
        var enemy = (battler.isEnemy && battler.isEnemy()) ? battler : null;
        var subject = battler;
        var user = battler;
        var target = battler;
        var owningMember = $.getOwningMemberIndex(battler);
        var s = $gameSwitches ? $gameSwitches._data : [];
        var v = $gameVariables ? $gameVariables._data : [];
        var threshold = thresh;
        var propertyCheck = thresh.propertyCheck;
        var propertySet = thresh.propertySet;
        var previousVal = prev;
        var currentVal = cur;
        var beforeRaw = $.getRawThreshold(thresh, battler);
        var rawThreshold = beforeRaw;
        eval(code);
        thresh._previousVal = previousVal;
        if (rawThreshold !== beforeRaw) {
            $.setRawThreshold(thresh, battler, rawThreshold);
        }
        if (currentVal !== beforeVal) {
            battler._tfgSkipThresholdCheck = true;
            $.setGaugeValue(battler, thresh._gaugeType, thresh._customBarrierId,
                currentVal);
            battler._tfgSkipThresholdCheck = false;
            var newCur = $.getGaugeValue(battler, thresh._gaugeType,
                thresh._customBarrierId);
            $.storeGaugePrev(battler, thresh._gaugeType, thresh._customBarrierId,
                newCur);
        }
    } catch (e) {
        $.logError('Threshold script', e, code);
    }
    if (thresh._tfgThresholdPending) {
        thresh._tfgThresholdPending = false;
    }
    if ($.parseBoolean(thresh.OnReachDisable, false)) {
        thresh.Enabled = false;
    }
};

$.checkThresholdsForGauge = function(battler, gaugeType, customId, prev, cur) {
    if (!battler || !battler.thresholds || battler._tfgSkipThresholdCheck) return;
    var max = $.getGaugeMax(battler, gaugeType, customId);
    var frame = Graphics.frameCount;
    var keys = Object.keys(battler.thresholds);
    for (var i = 0; i < keys.length; i++) {
        var thresh = battler.thresholds[keys[i]];
        if (!thresh || thresh._gaugeType !== gaugeType) continue;
        if (gaugeType === 'CustomBarrier' &&
            Number(thresh._customBarrierId) !== Number(customId)) {
            continue;
        }
        if (!$.parseBoolean(thresh.Enabled, true)) continue;
        if (thresh._tfgLastFireFrame === frame) continue;
        thresh._previousVal = prev;
        thresh.currentVal = cur;
        if (!$.evaluateCondition(thresh, battler)) continue;
        if (!$.hasResolvableThreshold(thresh, battler)) continue;
        if (!$.thresholdCrossed(thresh, prev, cur, max, battler)) continue;
        thresh._tfgLastFireFrame = frame;
        $.queueThresholdExecution(thresh, battler, prev, cur);
    }
};

$.storeGaugePrev = function(battler, gaugeType, customId, value) {
    battler._tfgPrevGauge = battler._tfgPrevGauge || {};
    if (gaugeType === 'CustomBarrier') {
        battler._tfgPrevGauge.CustomBarrier =
            battler._tfgPrevGauge.CustomBarrier || {};
        battler._tfgPrevGauge.CustomBarrier[customId] = value;
    } else {
        battler._tfgPrevGauge[gaugeType] = value;
    }
};

$.readGaugePrev = function(battler, gaugeType, customId) {
    battler._tfgPrevGauge = battler._tfgPrevGauge || {};
    if (gaugeType === 'CustomBarrier') {
        battler._tfgPrevGauge.CustomBarrier =
            battler._tfgPrevGauge.CustomBarrier || {};
        var cPrev = battler._tfgPrevGauge.CustomBarrier[customId];
        if (cPrev === undefined) {
            return $.getGaugeValue(battler, gaugeType, customId);
        }
        return cPrev;
    }
    var prev = battler._tfgPrevGauge[gaugeType];
    if (prev === undefined) {
        return $.getGaugeValue(battler, gaugeType, customId);
    }
    return prev;
};

$.wrapGaugeMutation = function(target, methodName, gaugeType, customIdFromArgs) {
    if (!target || !target[methodName]) return;
    var original = target[methodName];
    if (original._jakeTFGGaugeWrapped) return;
    var wrapped = function() {
        var battler = this;
        if (battler._tfgSkipThresholdCheck) {
            return original.apply(this, arguments);
        }
        var customId = customIdFromArgs ?
            customIdFromArgs.apply(null, arguments) : null;
        var prev = $.getGaugeValue(battler, gaugeType, customId);
        battler._tfgGaugeCheckDepth = (battler._tfgGaugeCheckDepth || 0) + 1;
        var result;
        try {
            result = original.apply(this, arguments);
        } finally {
            battler._tfgGaugeCheckDepth = Math.max(0,
                (battler._tfgGaugeCheckDepth || 1) - 1);
        }
        if (battler._tfgGaugeCheckDepth === 0 && !battler._tfgSkipThresholdCheck &&
            $.canTrackThresholdChanges()) {
            var cur = $.getGaugeValue(battler, gaugeType, customId);
            if (prev !== cur) {
                var skipCross = (gaugeType === 'Barrier' ||
                    gaugeType === 'CustomBarrier') && prev === 0 && cur > 0;
                if (!skipCross) {
                    $.checkThresholdsForGauge(battler, gaugeType, customId, prev, cur);
                }
                $.storeGaugePrev(battler, gaugeType, customId, cur);
            }
        }
        return result;
    };
    wrapped._jakeTFGGaugeWrapped = true;
    target[methodName] = wrapped;
};

$.installSceneUpdateHooks = function() {
    if (Scene_Base.prototype.update._jakeTFGThresholdQueue) return;
    var JakeTFG_Scene_Base_update = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        JakeTFG_Scene_Base_update.call(this);
        $.processThresholdQueue();
    };
    Scene_Base.prototype.update._jakeTFGThresholdQueue = true;
};

$.installBattlerHooks = function() {
    $.wrapGaugeMutation(Game_BattlerBase.prototype, 'setHp', 'HP');
    $.wrapGaugeMutation(Game_BattlerBase.prototype, 'setMp', 'MP');
    $.wrapGaugeMutation(Game_BattlerBase.prototype, 'setTp', 'TP');
    if (Imported.YEP_AbsorptionBarrier) {
        $.wrapGaugeMutation(Game_Battler.prototype, 'gainBarrier', 'Barrier');
        $.wrapGaugeMutation(Game_Battler.prototype, 'loseBarrier', 'Barrier');
        if (Game_Battler.prototype.setBarrierTotal) {
            $.wrapGaugeMutation(Game_Battler.prototype, 'setBarrierTotal', 'Barrier');
        }
    }
    if (Imported.JakeMSG_YEP_AbsorptionBarrier_Additions) {
        var idFromFirstArg = function() { return arguments[0]; };
        $.wrapGaugeMutation(Game_Battler.prototype, 'gainCBarrier', 'CustomBarrier',
            idFromFirstArg);
        $.wrapGaugeMutation(Game_Battler.prototype, 'loseCBarrier', 'CustomBarrier',
            idFromFirstArg);
        if (Game_Battler.prototype.setCBarrierTotal) {
            $.wrapGaugeMutation(Game_Battler.prototype, 'setCBarrierTotal',
                'CustomBarrier', idFromFirstArg);
        }
    }
};

$.hooksInstalled = false;
$.installAllHooks = function() {
    if (!$.hooksInstalled) {
        $.installBattlerThresholdMember();
        $.installBattlerHooks();
        $.installGaugeDrawHooks();
        $.installSceneUpdateHooks();
        $.hooksInstalled = true;
    }
};

var JakeTFG_Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function() {
    JakeTFG_Game_Battler_onBattleStart.call(this);
    $.initBattlerThresholds(this);
    $.snapshotGaugeValues(this);
};

var JakeTFG_Game_Enemy_setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function(enemyId, x, y) {
    JakeTFG_Game_Enemy_setup.call(this, enemyId, x, y);
    $.initBattlerThresholds(this);
};

var JakeTFG_Game_Actor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
    JakeTFG_Game_Actor_setup.call(this, actorId);
    $.initBattlerThresholds(this);
    $.snapshotGaugeValues(this);
};

if (typeof Scene_Map !== 'undefined') {
    var JakeTFG_Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        JakeTFG_Scene_Map_onMapLoaded.call(this);
        if (!$gameParty) return;
        var members = $gameParty.members();
        for (var i = 0; i < members.length; i++) {
            var member = members[i];
            $.ensureThresholdMap(member);
            $.snapshotGaugeValues(member);
        }
    };
}

$.syncAllThresholdSaveData = function(battler) {
    var map = battler._thresholdMap;
    if (!map) return;
    for (var key in map) {
        if (map.hasOwnProperty(key)) {
            $.syncThresholdSaveEntry(battler, map[key]);
        }
    }
};

$.syncAllActorThresholdSaveData = function() {
    if (!$gameActors) return;
    for (var i = 1; i < $gameActors._data.length; i++) {
        var actor = $gameActors._data[i];
        if (actor) {
            $.syncAllThresholdSaveData(actor);
        }
    }
};

var JakeTFG_DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    $.syncAllActorThresholdSaveData();
    return JakeTFG_DataManager_makeSaveContents.call(this);
};

var JakeTFG_DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    JakeTFG_DataManager_extractSaveContents.call(this, contents);
    $.restoreAllActorThresholds();
};

var JakeTFG_Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
    $.installAllHooks();
    JakeTFG_Scene_Boot_start.call(this);
};

//=============================================================================
// Gauge Layout + Drawing
//=============================================================================

$.hpCombinedTotalMax = function(battler) {
    return $.barrierGaugeLayout(battler).max;
};

$.barrierGaugeLayout = function(battler) {
    var mhp = Math.max(1, battler.mhp);
    var hp = Math.max(0, battler.hp);
    var segments = [];
    var totalBarrier = 0;

    if (Imported.JakeMSG_YEP_AbsorptionBarrier_Additions &&
        battler.cBarrierPoints && Yanfly.ABR_JakeMSGAdd &&
        Yanfly.ABR_JakeMSGAdd.channelVisualOrder) {
        var order = Yanfly.ABR_JakeMSGAdd.channelVisualOrder();
        for (var i = 0; i < order.length; i++) {
            var ch = order[i];
            var pts = (ch === 'default') ?
                (battler.barrierPoints ? Math.max(0, battler.barrierPoints()) : 0) :
                Math.max(0, battler.cBarrierPoints(ch));
            if (pts > 0) {
                segments.push({
                    channel: ch,
                    customId: ch === 'default' ? null : ch,
                    pts: pts
                });
                totalBarrier += pts;
            }
        }
    } else if (Imported.YEP_AbsorptionBarrier && battler.barrierPoints) {
        var bPts = Math.max(0, battler.barrierPoints());
        if (bPts > 0) {
            segments.push({ channel: 'default', customId: null, pts: bPts });
            totalBarrier = bPts;
        }
    }

    var total = hp + totalBarrier;
    var max = total > mhp ? total : mhp;
    var cum = hp;
    for (var j = 0; j < segments.length; j++) {
        var seg = segments[j];
        seg.startRate = cum / max;
        cum += seg.pts;
        seg.endRate = cum / max;
        seg.widthRate = seg.endRate - seg.startRate;
    }
    return { mhp: mhp, hp: hp, max: max, segments: segments };
};

$.findBarrierSegment = function(battler, gaugeType, customId) {
    var layout = $.barrierGaugeLayout(battler);
    for (var i = 0; i < layout.segments.length; i++) {
        var seg = layout.segments[i];
        if (gaugeType === 'Barrier' && seg.channel === 'default') return seg;
        if (gaugeType === 'CustomBarrier' &&
            Number(seg.customId) === Number(customId)) {
            return seg;
        }
    }
    return null;
};

$.barrierThresholdMarkerRate = function(thresh, battler) {
    if (!$.hasResolvableThreshold(thresh, battler)) return -1;
    var gaugeType = thresh._gaugeType;
    var customId = thresh._customBarrierId;
    var seg = $.findBarrierSegment(battler, gaugeType, customId);
    if (!seg || seg.widthRate <= 0 || seg.pts <= 0) return -1;

    var definedMax = $.getGaugeMax(battler, gaugeType, customId);
    var resolveMax = definedMax > 0 ? definedMax : 0;
    var thresholdVal = $.resolveThresholdPosition(thresh, resolveMax);
    var displayScale = definedMax > 0 ? definedMax : seg.pts;
    if (displayScale <= 0) return -1;
    var orient = thresh['Thres. Orientation'];
    var oriented = $.orientedFill(thresholdVal, displayScale, orient);
    return seg.startRate + seg.widthRate * (oriented / displayScale);
};

$.thresholdMarkerRate = function(thresh, battler, drawMode) {
    var orient = thresh['Thres. Orientation'];
    var gaugeType = thresh._gaugeType;

    if (gaugeType === 'HP') {
        var mhp = Math.max(1, battler.mhp);
        var thresholdVal = $.resolveThresholdPosition(thresh, mhp);
        var oriented = $.orientedFill(thresholdVal, mhp, orient);
        if (drawMode === 'hpCombined') {
            var totalMax = $.hpCombinedTotalMax(battler);
            return oriented / totalMax;
        }
        return oriented / mhp;
    }

    if (gaugeType === 'MP' || gaugeType === 'TP') {
        var max = Math.max(1, $.getGaugeMax(battler, gaugeType));
        var tVal = $.resolveThresholdPosition(thresh, max);
        var oVal = $.orientedFill(tVal, max, orient);
        return oVal / max;
    }

    if ((gaugeType === 'Barrier' || gaugeType === 'CustomBarrier') &&
        drawMode === 'hpCombined') {
        return $.barrierThresholdMarkerRate(thresh, battler);
    }

    return -1;
};

$.thresholdMatchesDrawMode = function(thresh, drawMode, simpleGaugeType) {
    var gaugeType = thresh._gaugeType;
    if (drawMode === 'hpCombined') {
        return gaugeType === 'HP' || gaugeType === 'Barrier' ||
            gaugeType === 'CustomBarrier';
    }
    return gaugeType === simpleGaugeType;
};

$.gaugeHeightForWindow = function(win) {
    if (win.gaugeHeight) return win.gaugeHeight();
    return 6;
};

$.isGaugeOutline = function(win) {
    if (win.isGaugeOutline) return !!win.isGaugeOutline();
    return false;
};

$.gaugeRect = function(win, dx, dy, dw, yB) {
    var gaugeH = $.gaugeHeightForWindow(win) - 2;
    var gaugeY = dy + win.lineHeight() - gaugeH - 2 + (yB || 0);
    var x = dx;
    var w = dw;
    if ($.isGaugeOutline(win)) {
        x += 1;
        w -= 2;
        gaugeY -= 2;
    }
    return { x: x, y: gaugeY, w: w, h: gaugeH };
};

$.drawThresholdLine = function(win, x, y, h, color, thickness, topMod, bottomMod) {
    var t = Math.max(1, Number(thickness) || 2);
    var top = Math.floor(y - (Number(topMod) || 0));
    var bottom = Math.floor(y + h + (Number(bottomMod) || 0));
    var height = Math.max(1, bottom - top);
    var left = Math.floor(x - Math.floor(t / 2));
    win.contents.fillRect(left, top, t, height, color);
};

$.drawThresholdsForBattler = function(win, battler, dx, dy, dw, yB, drawMode,
    simpleGaugeType) {
    if (!battler || !battler.thresholds) return;
    var rect = $.gaugeRect(win, dx, dy, dw, yB);
    var keys = Object.keys(battler.thresholds);
    for (var i = 0; i < keys.length; i++) {
        var thresh = battler.thresholds[keys[i]];
        if (!thresh) continue;
        if (!$.thresholdMatchesDrawMode(thresh, drawMode, simpleGaugeType)) continue;
        if (!$.parseBoolean(thresh.Enabled, true)) continue;
        if ($.parseBoolean(thresh.Invisible, false)) continue;
        if (!$.hasResolvableThreshold(thresh, battler)) continue;
        thresh.currentVal = $.getGaugeValue(battler, thresh._gaugeType,
            thresh._customBarrierId);
        if (!$.evaluateCondition(thresh, battler)) continue;
        var rate = $.thresholdMarkerRate(thresh, battler, drawMode);
        if (rate < 0) continue;
        rate = rate.clamp(0, 1);
        var lineX = rect.x + Math.floor(rect.w * rate);
        $.drawThresholdLine(win, lineX, rect.y, rect.h, thresh.Color,
            thresh.Thickness, thresh['Top Height Mod.'],
            thresh['Bottom Height Mod.']);
    }
};

$.drawHpGaugeThresholds = function(win, battler, x, y, width, yB) {
    if (!battler) return;
    $.drawThresholdsForBattler(win, battler, x, y, width, yB, 'hpCombined', null);
};

$.drawSimpleGaugeThresholds = function(win, battler, gaugeType, customId, x, y,
    width, yB) {
    if (!battler) return;
    $.drawThresholdsForBattler(win, battler, x, y, width, yB, 'simple', gaugeType);
};

$.wrapGaugeDrawMethod = function(proto, methodName, afterDrawFn) {
    if (!proto || typeof proto[methodName] !== 'function') return;
    if (proto[methodName]._jakeTFGDrawAliased) return;
    var previous = proto[methodName];
    proto[methodName] = function() {
        var battler = arguments[0];
        var x = arguments[1];
        var y = arguments[2];
        var width = arguments[3];
        var yB = (this._enableYBuffer && Imported.YEP_BattleStatusWindow) ?
            (Yanfly.Param.BSWParamYBuffer || 0) : 0;
        var result = previous.apply(this, arguments);
        afterDrawFn.call(this, battler, x, y, width, yB);
        return result;
    };
    proto[methodName]._jakeTFGDrawAliased = true;
    if (previous._jakeMSGBarrierValueWrapped) {
        proto[methodName]._jakeMSGBarrierValueWrapped = true;
    }
};

$.installGaugeDrawHooks = function() {
    $.wrapGaugeDrawMethod(Window_Base.prototype, 'drawActorHp',
        function(b, x, y, w, yB) { $.drawHpGaugeThresholds(this, b, x, y, w, yB); });
    $.wrapGaugeDrawMethod(Window_Base.prototype, 'drawActorMp',
        function(b, x, y, w, yB) {
            $.drawSimpleGaugeThresholds(this, b, 'MP', null, x, y, w, yB);
        });
    $.wrapGaugeDrawMethod(Window_Base.prototype, 'drawActorTp',
        function(b, x, y, w, yB) {
            $.drawSimpleGaugeThresholds(this, b, 'TP', null, x, y, w, yB);
        });

    if (typeof Window_VisualHPGauge !== 'undefined') {
        $.wrapGaugeDrawMethod(Window_VisualHPGauge.prototype, 'drawActorHp',
            function(b, x, y, w) { $.drawHpGaugeThresholds(this, b, x, y, w, 1); });
        if (Window_VisualHPGauge.prototype.drawJakeMSGActorMp) {
            $.wrapGaugeDrawMethod(Window_VisualHPGauge.prototype, 'drawJakeMSGActorMp',
                function(b, x, y, w) {
                    $.drawSimpleGaugeThresholds(this, b, 'MP', null, x, y, w, 1);
                });
        }
        if (Window_VisualHPGauge.prototype.drawJakeMSGActorTp) {
            $.wrapGaugeDrawMethod(Window_VisualHPGauge.prototype, 'drawJakeMSGActorTp',
                function(b, x, y, w) {
                    $.drawSimpleGaugeThresholds(this, b, 'TP', null, x, y, w, 1);
                });
        }
    }

    if (typeof Window_EnemyInBattleStatus !== 'undefined') {
        $.wrapGaugeDrawMethod(Window_EnemyInBattleStatus.prototype, 'drawEnemyHp',
            function(b, x, y, w) { $.drawHpGaugeThresholds(this, b, x, y, w, 0); });
        $.wrapGaugeDrawMethod(Window_EnemyInBattleStatus.prototype, 'drawEnemyMp',
            function(b, x, y, w) {
                $.drawSimpleGaugeThresholds(this, b, 'MP', null, x, y, w, 0);
            });
        $.wrapGaugeDrawMethod(Window_EnemyInBattleStatus.prototype, 'drawEnemyTp',
            function(b, x, y, w) {
                $.drawSimpleGaugeThresholds(this, b, 'TP', null, x, y, w, 0);
            });
    }

    if (typeof Window_Help !== 'undefined') {
        $.wrapGaugeDrawMethod(Window_Help.prototype, 'drawJakeMSGEnemyHp',
            function(b, x, y, w) { $.drawHpGaugeThresholds(this, b, x, y, w, 0); });
        $.wrapGaugeDrawMethod(Window_Help.prototype, 'drawJakeMSGEnemyMp',
            function(b, x, y, w) {
                $.drawSimpleGaugeThresholds(this, b, 'MP', null, x, y, w, 0);
            });
        $.wrapGaugeDrawMethod(Window_Help.prototype, 'drawJakeMSGEnemyTp',
            function(b, x, y, w) {
                $.drawSimpleGaugeThresholds(this, b, 'TP', null, x, y, w, 0);
            });
    }
};

//=============================================================================
// End of File
//=============================================================================

})(JakeMSG.ThresholdsForGauges);

JakeMSG.ThresholdsForGauges.installBattlerThresholdMember();
