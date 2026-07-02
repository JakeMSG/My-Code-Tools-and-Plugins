//=============================================================================
// JakeMSG_StringSavedReplacements
// JakeMSG_StringSavedReplacements.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_StringSavedReplacements = true;

var JakeMSG = JakeMSG || {};
JakeMSG.StringSavedReplacements = JakeMSG.StringSavedReplacements || {};

//=============================================================================
/*:
 * @plugindesc v1.0 Adds saved string replacements for text shown in windows.
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
 * This plugin replaces full text strings in most on-screen window text after
 * RPG Maker MV escape codes are processed (for example \V[n], \N[n], \C[n])
 * but before characters are drawn.
 *
 * Replacements apply to every matching instance in the processed text, not
 * only the first match.
 *
 * Two sources of replacements exist:
 *
 *   1. Plugin-parameter dictionary lists (Dictionary 1 through Dictionary 20)
 *   2. Runtime script calls saved into the current save file
 *
 * Parameter dictionary entries are applied first, in list order from Dictionary 1
 * through Dictionary 20. Runtime replacements are applied afterward, in the order
 * they were added for the current save file.
 *
 * ============================================================================
 * Plugin Parameters — Replacement Dictionary
 * ============================================================================
 *
 * Under "--- Replacement Dictionary ---", configure up to 20 dictionary lists.
 * Each list entry has:
 *
 *   isRegEx .............. False = plain string replace-all; True = RegExp
 *   searched String ...... Text or pattern to find
 *   replacement String ... Text used as the replacement
 *
 * ============================================================================
 * Script Calls
 * ============================================================================
 *
 * stringReplaceAdd(searchedString, replacementString, isRegEx)
 *
 *   Adds or updates a saved replacement for the current save file.
 *   isRegEx is optional and defaults to false when omitted.
 *   If searchedString already exists among saved replacements, its settings
 *   are updated and its order is preserved.
 *
 * stringReplaceRemove(searchedString)
 *
 *   Removes the saved replacement for searchedString from the current save file.
 *
 * Examples:
 *
 *   stringReplaceAdd('Old Town', 'New City');
 *   stringReplaceAdd('HP', 'Health', false);
 *   stringReplaceAdd('\\d+ G', '999 G', true);
 *   stringReplaceRemove('Old Town');
 *
 * ============================================================================
 * Module Plugins
 * ============================================================================
 *
 * JakeMSG_StringSavedReplacements_HugeNumbers can register additional text
 * processing through this plugin's text-processor hook. Place module plugins
 * below this one.
 *
 * ============================================================================
 * Compatible Plugins
 * ============================================================================
 *
 * Text processing also applies to on-screen values drawn by these plugins
 * (place this plugin below them when possible):
 *
 *   YEP_BattleStatusWindow
 *   YEP_X_VisualHpGauge
 *   JakeMSG_YEP_X_VisualHpGauge_Additions
 *   YEP_X_InBattleStatus
 *   JakeMSG_YEP_X_InBattleStatus_Additions
 *   JakeMSG_MoreDescriptionsWithConditions
 *   YEP_AbsorptionBarrier
 *   JakeMSG_YEP_AbsorptionBarrier_Additions
 *   SRD_BattlePopupCustomizer
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @param --- Replacement Dictionary ---
 * @default
 *
 * @param Dictionary 1
 * @text Dictionary 1
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 2
 * @text Dictionary 2
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 3
 * @text Dictionary 3
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 4
 * @text Dictionary 4
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 5
 * @text Dictionary 5
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 6
 * @text Dictionary 6
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 7
 * @text Dictionary 7
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 8
 * @text Dictionary 8
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 9
 * @text Dictionary 9
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 10
 * @text Dictionary 10
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 11
 * @text Dictionary 11
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 12
 * @text Dictionary 12
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 13
 * @text Dictionary 13
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 14
 * @text Dictionary 14
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 15
 * @text Dictionary 15
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 16
 * @text Dictionary 16
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 17
 * @text Dictionary 17
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 18
 * @text Dictionary 18
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 19
 * @text Dictionary 19
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 * @param Dictionary 20
 * @text Dictionary 20
 * @parent --- Replacement Dictionary ---
 * @type struct<StringReplacement>[]
 * @default []
 *
 */
/*~struct~StringReplacement:
 * @param isRegEx
 * @text isRegEx
 * @type boolean
 * @default false
 * @desc True = RegExp replacement; False = plain string replace-all.
 *
 * @param searched String
 * @text searched String
 * @default
 * @desc String (or RegExp pattern when isRegEx is true) to search for.
 *
 * @param replacement String
 * @text replacement String
 * @default
 * @desc Replacement text for each match found.
 *
 */
//=============================================================================

(function($) {
'use strict';

$.version = 1.0;
$.pluginName = 'JakeMSG_StringSavedReplacements';
$.paramsRaw = PluginManager.parameters($.pluginName);

$.parameterReplacements = [];
$.textProcessors = [];
$.hookInstalled = false;
$.bitmapCompatInstalled = false;

//=============================================================================
// Utilities
//=============================================================================

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

$.normalizeRule = function(searched, replacement, isRegEx) {
    if (searched === undefined || searched === null || String(searched) === '') {
        return null;
    }
    return {
        searched: String(searched),
        replacement: replacement === undefined || replacement === null ?
            '' : String(replacement),
        isRegEx: $.toBool(isRegEx, false)
    };
};

$.cloneRule = function(rule) {
    return {
        searched: rule.searched,
        replacement: rule.replacement,
        isRegEx: !!rule.isRegEx
    };
};

//=============================================================================
// Parameter loading
//=============================================================================

$.parseDictionaryEntry = function(structData) {
    if (!structData) {
        return null;
    }
    return $.normalizeRule(
        structData['searched String'],
        structData['replacement String'],
        structData['isRegEx']
    );
};

$.loadParameterReplacements = function() {
    $.parameterReplacements = [];
    for (var d = 1; d <= 20; d++) {
        var raw = $.paramsRaw['Dictionary ' + d];
        var list = $.safeJsonParse(raw, []);
        if (!list || !list.length) {
            continue;
        }
        for (var i = 0; i < list.length; i++) {
            var structData = $.safeJsonParse(list[i], null);
            var rule = $.parseDictionaryEntry(structData);
            if (rule) {
                $.parameterReplacements.push(rule);
            }
        }
    }
};

$.loadParameterReplacements();

//=============================================================================
// Replacement application
//=============================================================================

$.applySingleReplacement = function(text, rule) {
    if (!rule || !rule.searched) {
        return text;
    }
    if (rule.isRegEx) {
        try {
            var regex = new RegExp(rule.searched, 'g');
            return text.replace(regex, rule.replacement);
        } catch (e) {
            return text;
        }
    }
    return text.split(rule.searched).join(rule.replacement);
};

$.savedReplacements = function() {
    if (!$gameSystem) {
        return [];
    }
    return $gameSystem.stringSavedReplacements();
};

$.allReplacements = function() {
    var list = $.parameterReplacements.slice();
    var saved = $.savedReplacements();
    for (var i = 0; i < saved.length; i++) {
        list.push(saved[i]);
    }
    return list;
};

$.applyDictionaryReplacements = function(text) {
    if (!text) {
        return text;
    }
    var rules = $.allReplacements();
    for (var i = 0; i < rules.length; i++) {
        text = $.applySingleReplacement(text, rules[i]);
    }
    return text;
};

$.processText = function(text) {
    if (!text) {
        return text;
    }
    text = $.applyDictionaryReplacements(text);
    for (var i = 0; i < $.textProcessors.length; i++) {
        text = $.textProcessors[i](text);
    }
    return text;
};

$.processDisplayText = function(text) {
    if (text === undefined || text === null) {
        return text;
    }
    return $.processText(String(text));
};

$.shouldProcessDisplayText = function(text) {
    return text !== undefined && text !== null && String(text).length > 1;
};

$.registerTextProcessor = function(fn) {
    if (typeof fn === 'function' && $.textProcessors.indexOf(fn) < 0) {
        $.textProcessors.push(fn);
    }
};

//=============================================================================
// Game_System — saved runtime replacements
//=============================================================================

var JakeSSR_Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    JakeSSR_Game_System_initialize.call(this);
    this._stringSavedReplacements = [];
};

Game_System.prototype.stringSavedReplacements = function() {
    if (!this._stringSavedReplacements) {
        this._stringSavedReplacements = [];
    }
    return this._stringSavedReplacements;
};

$.findSavedReplacementIndex = function(searchedString) {
    var list = $.savedReplacements();
    var key = String(searchedString);
    for (var i = 0; i < list.length; i++) {
        if (list[i].searched === key) {
            return i;
        }
    }
    return -1;
};

$.stringReplaceAdd = function(searchedString, replacementString, isRegEx) {
    if (!$gameSystem) {
        return;
    }
    var rule = $.normalizeRule(searchedString, replacementString, isRegEx);
    if (!rule) {
        return;
    }
    var list = $.savedReplacements();
    var index = $.findSavedReplacementIndex(rule.searched);
    if (index >= 0) {
        list[index] = rule;
    } else {
        list.push(rule);
    }
};

$.stringReplaceRemove = function(searchedString) {
    if (!$gameSystem) {
        return;
    }
    var list = $.savedReplacements();
    var index = $.findSavedReplacementIndex(searchedString);
    if (index >= 0) {
        list.splice(index, 1);
    }
};

window.stringReplaceAdd = function(searchedString, replacementString, isRegEx) {
    $.stringReplaceAdd(searchedString, replacementString, isRegEx);
};

window.stringReplaceRemove = function(searchedString) {
    $.stringReplaceRemove(searchedString);
};

//=============================================================================
// Window_Base hook — after escape processing, before drawing
//=============================================================================

$.installTextHook = function() {
    if ($.hookInstalled) {
        return;
    }
    $.hookInstalled = true;

    var JakeSSR_Window_Base_convertEscapeCharacters =
        Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function(text) {
        text = JakeSSR_Window_Base_convertEscapeCharacters.call(this, text);
        return $.processText(text);
    };
};

$.installTextHook();

//=============================================================================
// Third-party plugin compatibility
//=============================================================================

$.isSRDBattlePopupCustomizerLoaded = function() {
    return !!(typeof SRD !== 'undefined' && SRD.BattlePopupCustomizer &&
        SRD.BattlePopupCustomizer.popups);
};

$.getSRDBattlePopups = function() {
    if (!$.isSRDBattlePopupCustomizerLoaded()) {
        return null;
    }
    return SRD.BattlePopupCustomizer.popups;
};

$.applyDamagePopupSpriteEffects = function(sprite, result, info) {
    if (!sprite || !result) {
        return;
    }
    if (result.critical) {
        sprite.flashColor = [255, 0, 0, 160];
        sprite.flashDuration = 60;
    } else if (Imported.YEP_AbsorptionBarrier && result._barrierAffected) {
        sprite.flashColor = Yanfly.Param.ABRPop.slice();
        sprite.flashDuration = 180;
    } else if (info) {
        sprite.flashColor = info.flashColor.clone();
        sprite.flashDuration = info.flashDuration;
    }
};

$.renderSpriteDamageDigitPopup = function(spriteDamage, info, displayText) {
    if (typeof spriteDamage.hasPopupTextCodes === 'function' &&
        spriteDamage.hasPopupTextCodes(displayText) &&
        typeof spriteDamage.createTextCodeBitmap === 'function') {
        var textBitmap = spriteDamage.createTextCodeBitmap(info, displayText);
        var textSprite = spriteDamage.createChildSprite(textBitmap);
        textSprite.dy = 0;
        textSprite.xBase = spriteDamage._xOffsetDigits;
        textSprite.yBase = spriteDamage._yOffsetDigits;
        textSprite.x = eval(info.x);
        textSprite.y = eval(info.y);
        textSprite.animations = info.animations.clone();
        textSprite.duration = info.duration;
        textSprite.oriDuration = textSprite.duration;
        textSprite.oriX = textSprite.x;
        textSprite.oriY = textSprite.y;
        $.applyDamagePopupSpriteEffects(textSprite, spriteDamage._result, info);
        return;
    }

    var dummy = spriteDamage.createChildBitmap(info);
    var w = spriteDamage.digitWidthFromBitmap(dummy);
    var h = spriteDamage.digitHeightFromBitmap(dummy);
    for (var i = 0; i < displayText.length; i++) {
        var digitBitmap = spriteDamage.createChildBitmap(info);
        digitBitmap.resize(digitBitmap.width + digitBitmap.outlineWidth * 2,
            digitBitmap.height);
        var digitSprite = spriteDamage.createChildSprite(digitBitmap);
        digitSprite.bitmap.drawText(displayText.charAt(i), 2, 0, w, h, 'left');
        digitSprite.xBase = spriteDamage._xOffsetDigits;
        digitSprite.yBase = spriteDamage._yOffsetDigits;
        digitSprite.x = (i - (displayText.length - 1) / 2) * w + eval(info.x);
        digitSprite.y = eval(info.y);
        digitSprite.ry = digitSprite.y;
        digitSprite.dy = -i;
        digitSprite.animations = info.animations.clone();
        digitSprite.duration = info.duration;
        digitSprite.oriDuration = digitSprite.duration;
        digitSprite.oriX = digitSprite.x;
        digitSprite.oriY = digitSprite.y;
        $.applyDamagePopupSpriteEffects(digitSprite, spriteDamage._result, info);
    }
};

$.wrapSpriteDamageCreateDigits = function() {
    if (typeof Sprite_Damage === 'undefined' || !$.isSRDBattlePopupCustomizerLoaded()) {
        return;
    }
    var proto = Sprite_Damage.prototype;
    if (!proto.createDigits || proto.createDigits._jakeSSRWrapped) {
        return;
    }
    var JakeSSR_Sprite_Damage_createDigits = proto.createDigits;
    proto.createDigits = function(baseRow, value) {
        var popups = $.getSRDBattlePopups();
        if (!popups || !popups[baseRow]) {
            return JakeSSR_Sprite_Damage_createDigits.apply(this, arguments);
        }
        var info = popups[baseRow];
        var displayText = $.processDisplayText(
            String(info.text).replace(/%1/, Math.abs(value).toString())
        );
        $.renderSpriteDamageDigitPopup(this, info, displayText);
    };
    proto.createDigits._jakeSSRWrapped = true;
};

$.installCompatibilityHooks = function() {
    if (!$.bitmapCompatInstalled && typeof Bitmap !== 'undefined') {
        $.bitmapCompatInstalled = true;

        if (!Bitmap.prototype.drawText._jakeSSRWrapped) {
            var JakeSSR_Bitmap_drawText = Bitmap.prototype.drawText;
            Bitmap.prototype.drawText = function(text, x, y, maxWidth, maxHeight, align) {
                if ($.shouldProcessDisplayText(text)) {
                    text = $.processDisplayText(text);
                }
                return JakeSSR_Bitmap_drawText.call(this, text, x, y,
                    maxWidth, maxHeight, align);
            };
            Bitmap.prototype.drawText._jakeSSRWrapped = true;
        }

        if (!Bitmap.prototype.measureTextWidth._jakeSSRWrapped) {
            var JakeSSR_Bitmap_measureTextWidth = Bitmap.prototype.measureTextWidth;
            Bitmap.prototype.measureTextWidth = function(text) {
                if ($.shouldProcessDisplayText(text)) {
                    text = $.processDisplayText(text);
                }
                return JakeSSR_Bitmap_measureTextWidth.call(this, text);
            };
            Bitmap.prototype.measureTextWidth._jakeSSRWrapped = true;
        }
    }

    $.wrapSpriteDamageCreateDigits();
};

var JakeSSR_Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
    $.installCompatibilityHooks();
    JakeSSR_Scene_Boot_start.call(this);
};

//=============================================================================
// End of File
//=============================================================================

})(JakeMSG.StringSavedReplacements);
