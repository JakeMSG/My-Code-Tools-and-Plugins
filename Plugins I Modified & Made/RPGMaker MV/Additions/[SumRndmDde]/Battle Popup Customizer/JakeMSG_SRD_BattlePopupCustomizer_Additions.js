//=============================================================================
// Addition to SRD plugin "BattlePopupCustomizer", made by JakeMSG
// JakeMSG_SRD_BattlePopupCustomizer_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_SRD_BattlePopupCustomizer_Additions = true;

var SRD = SRD || {};
SRD.BattlePopupCustomizer_JakeMSGAdd = SRD.BattlePopupCustomizer_JakeMSGAdd || {};
SRD.BattlePopupCustomizer_JakeMSGAdd.version = 1.2;

//=============================================================================
/*:
 * @plugindesc (Requires SRD_BattlePopupCustomizer.js) Additions to the Battle Popup Customizer
 *  SRD Plugin
 * @author JakeMSG
 * v1.2
 *
============ Change Log ============
1.2 - 8.3rd.2026
 * Added Status Effect Infliction / Removal Popouts
1.1 - 6.25th.2026
 * Added Popout Offsets (plugin parameters and Actor/Enemy notetags)
1.0 - 3.13th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires SRD_BattlePopupCustomizer.
 * Make sure this plugin is located under SRD_BattlePopupCustomizer in the plugin list.
 *
 * ============================================================================
 * New Features
 * ============================================================================
 * ================================
 * Support for Text Codes (both in the original plugin's custom popups and in the new script calls)
 * ================================
 * ======== For the "text" parameter (in both the original plugin's parameters, and in the 1st parameter of the script calls below),
 * you can now use text codes (both from vanilla MV engine and from "YEP_MessageCore", if you also have that plugin)
 * ==== Keep in mind, if you use any such text codes in the original plugin's parameters for a specific Popup,
 * it will ignore the "Color Base" argument for the same Popup (setting it to the default white filling)
 * == You can use the text code to change the text color to make up for that
 *
 * 
 * ================================
 * Script Call - show Popup (anywhere)
 * ================================
 *
 * ================ Global script call:
 * showPopup(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash)
 *
 * ================ Script call on a battler:
 * battler.battlePopup(text, xPos, yPos, duration, animation,
 *   colorBase, colorOutline, flash)
 *
 * ======== Explanations:
 * ==== All arguments except "text" are optional.
 * == Their defaults come from SRD_BattlePopupCustomizer's parameter defaults for custom popups.
 * ==== The "text" argument supports text codes from vanilla MV and YEP_MessageCore.
 * ==== For the global script call "showPopup", xPos and yPos are screen coordinates.
 * == Their defaults are screenWidth (Graphics.boxWidth) / 2 and screenHeight (Graphics.boxHeight) / 2.
 * == They can be numbers or formula strings using "Graphics.boxWidth" and "Graphics.boxHeight" as possible variables inside the formulas
 * ==== For the battler script call "battlePopup", xPos and yPos still behave like Location parameter (relative to the battler sprite and can be formulas).
 * ==== colorBase and colorOutline behave like Colors parameter
 *
 * ======== Example:
 * showPopup(
 *   'COUNTER',
 *   'Graphics.boxWidth * 0.5',
 *   'Graphics.boxHeight * 0.25',
 *   60,
 *   'float',
 *   '#FFFFFF',
 *   '#000000',
 *   '255, 0, 0, 160, 60'
 * );
 *
 * 
 * ================================
 * Popout Offsets
 * ================================
 *
 * Plugin parameters under "Popout Offsets" shift where battle popouts appear
 * relative to the battler they belong to. Offsets are measured in pixels.
 * Negative values are allowed.
 *
 * - Actor-affecting Popouts: applies to popouts shown on party members
 *   (actors). This includes Non-Sideview battles whenever actor popouts are
 *   displayed (for example with front-view actor sprites or animations enabled).
 * - Enemy-affecting Popouts: applies to popouts shown on enemies.
 *
 * Each axis (X and Y) can be configured separately in the plugin parameters.
 *
 * ================================
 * Notetags - Popout Offset Override
 * ================================
 *
 * Place these in an Actor or Enemy notebox to override the plugin parameter
 * offsets for that specific database entry only. Each tag overrides one axis;
 * the other axis still uses the matching plugin parameter unless it also has
 * a notetag.
 *
 * <Popout Offset X: n>
 * <Popout Offset Y: n>
 *
 * n is a number in pixels. Negative values are allowed.
 *
 * Example (Actor notebox):
 * <Popout Offset X: 12>
 * <Popout Offset Y: -24>
 *
 * ================================
 * Status Effect Popouts
 * ================================
 *
 * When a status effect (state) is inflicted or removed during battle, an
 * optional popout can appear on the affected battler. This covers normal
 * infliction / removal (skills, items, auto-removal, etc.) and custom calls
 * such as battler.addState / battler.removeState from scripts or plugins
 * like YEP_BuffsStatesCore and JakeMSG_YEP_BuffsStatesCore_Additions.
 *
 * These popouts use the original plugin's normal Damage Popout settings for
 * position, animation, duration, flash, and (by default) color. Your Popout
 * Offsets from this plugin still apply based on whether the battler is an
 * Actor (Party) member or an Enemy, including Non-Sideview actor popouts.
 *
 * Plugin parameters under "Status Effect Popouts":
 *
 * -- Infliction -- / -- Removal --
 *   Master toggles (default: ON). Disable either to turn off that kind of
 *   status popout entirely.
 *
 * Under each of those:
 * - Show Status Icon: show the state's icon in the popout (default: ON)
 * - Show Status Name: show the state's name text (default: ON)
 *   If the icon is also shown, the name appears after the icon.
 * - Show "+" Sign (Infliction) / Show "-" Sign (Removal):
 *   show the matching sign before the icon and/or name (default: ON)
 * - Custom Popout Color: optional Hex color (e.g. #FFFFFF). Leave empty to
 *   use the normal Damage Popout color settings from SRD_BattlePopupCustomizer.
 *
 * If icon, name, and sign are all disabled for a type, no popout is shown
 * for that type. The death state is ignored.
 *
 * 
 * ======================================
 * Param Declarations
 * ======================================
 * @param ---- Popout Offsets ----
 * @default
 * 
 * @param -- Actor-affecting Popouts --
 * @parent ---- Popout Offsets ----
 * @default
 * 
 * @param Actor X Offset
 * @text X Offset
 * @parent -- Actor-affecting Popouts --
 * @desc The X offset of the popout for actor-affecting popouts.
 * @default 0
 * 
 * @param Actor Y Offset
 * @text Y Offset
 * @parent -- Actor-affecting Popouts --
 * @desc The Y offset of the popout for actor-affecting popouts.
 * @default 0
 *
 * 
 * @param -- Enemy-affecting Popouts --
 * @parent ---- Popout Offsets ----
 * @default
 * 
 * @param Enemy X Offset
 * @text X Offset
 * @parent -- Enemy-affecting Popouts --
 * @desc The X offset of the popout for enemy-affecting popouts.
 * @default 0
 * 
 * @param Enemy Y Offset
 * @text Y Offset
 * @parent -- Enemy-affecting Popouts --
 * @desc The Y offset of the popout for enemy-affecting popouts.
 * @default 0
 * 
 * 
 * 
 * @param ---- Status Effect Popouts ----
 * @default
 * 
 * @param -- Infliction --
 * @parent ---- Status Effect Popouts ----
 * @type boolean
 * @on Enable
 * @off Disable
 * @desc Enable popouts when a status effect is inflicted.
 * @default true
 * 
 * @param Infliction Show Status Icon
 * @text Show Status Icon
 * @parent -- Infliction --
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the status effect's icon in infliction popouts.
 * @default true
 * 
 * @param Infliction Show Status Name
 * @text Show Status Name
 * @parent -- Infliction --
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the status effect's name in infliction popouts.
 * @default true
 * 
 * @param Infliction Show Sign
 * @text Show "+" Sign
 * @parent -- Infliction --
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show a "+" sign before the icon/name in infliction popouts.
 * @default true
 * 
 * @param Infliction Custom Popout Color
 * @text Custom Popout Color
 * @parent -- Infliction --
 * @desc Hex color for infliction popouts (e.g. #FFFFFF). Leave empty to use normal Damage Popout colors.
 * @default
 * 
 * @param -- Removal --
 * @parent ---- Status Effect Popouts ----
 * @type boolean
 * @on Enable
 * @off Disable
 * @desc Enable popouts when a status effect is removed.
 * @default true
 * 
 * @param Removal Show Status Icon
 * @text Show Status Icon
 * @parent -- Removal --
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the status effect's icon in removal popouts.
 * @default true
 * 
 * @param Removal Show Status Name
 * @text Show Status Name
 * @parent -- Removal --
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the status effect's name in removal popouts.
 * @default true
 * 
 * @param Removal Show Sign
 * @text Show "-" Sign
 * @parent -- Removal --
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show a "-" sign before the icon/name in removal popouts.
 * @default true
 * 
 * @param Removal Custom Popout Color
 * @text Custom Popout Color
 * @parent -- Removal --
 * @desc Hex color for removal popouts (e.g. #FFFFFF). Leave empty to use normal Damage Popout colors.
 * @default
 * 
 */
//=============================================================================

if (Imported["SumRndmDde Battle Popup Customizer"]) {

(function(_) {

"use strict";

var sourceParams = PluginManager.parameters('SRD_BattlePopupCustomizer');
var addOnParams = PluginManager.parameters('JakeMSG_SRD_BattlePopupCustomizer_Additions');
var baseCustomizer = SRD.BattlePopupCustomizer;

_.nextTurnIconOpacity = Number(addOnParams['NextTurn Icon Opacity'] || 127);

_.parseOffsetParam = function(value) {
	var number = Number(value);
	return isNaN(number) ? 0 : number;
};

_.actorPopoutOffsetX = _.parseOffsetParam(addOnParams['Actor X Offset']);
_.actorPopoutOffsetY = _.parseOffsetParam(addOnParams['Actor Y Offset']);
_.enemyPopoutOffsetX = _.parseOffsetParam(addOnParams['Enemy X Offset']);
_.enemyPopoutOffsetY = _.parseOffsetParam(addOnParams['Enemy Y Offset']);

_.parseBoolParam = function(value, defaultValue) {
	if (value === undefined || value === null || value === '') {
		return !!defaultValue;
	}
	if (typeof value === 'boolean') {
		return value;
	}
	var text = String(value).trim().toLowerCase();
	if (text === 'true') {
		return true;
	}
	if (text === 'false') {
		return false;
	}
	return !!defaultValue;
};

_.parseOptionalColor = function(value) {
	var text = String(value === undefined || value === null ? '' : value).trim();
	if (!text) {
		return '';
	}
	if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(text)) {
		return text;
	}
	return text;
};

_.statusPopouts = {
	infliction: {
		enabled: _.parseBoolParam(addOnParams['-- Infliction --'], true),
		showIcon: _.parseBoolParam(addOnParams['Infliction Show Status Icon'], true),
		showName: _.parseBoolParam(addOnParams['Infliction Show Status Name'], true),
		showSign: _.parseBoolParam(addOnParams['Infliction Show Sign'], true),
		customColor: _.parseOptionalColor(addOnParams['Infliction Custom Popout Color']),
		sign: '+'
	},
	removal: {
		enabled: _.parseBoolParam(addOnParams['-- Removal --'], true),
		showIcon: _.parseBoolParam(addOnParams['Removal Show Status Icon'], true),
		showName: _.parseBoolParam(addOnParams['Removal Show Status Name'], true),
		showSign: _.parseBoolParam(addOnParams['Removal Show Sign'], true),
		customColor: _.parseOptionalColor(addOnParams['Removal Custom Popout Color']),
		sign: '-'
	}
};

_.getBattlerPopoutOffsets = function(battler) {
	if (!battler) {
		return { x: 0, y: 0 };
	}
	var defaultX;
	var defaultY;
	var dbObj;
	if (battler.isActor()) {
		defaultX = _.actorPopoutOffsetX;
		defaultY = _.actorPopoutOffsetY;
		dbObj = battler.actor();
	} else if (battler.isEnemy()) {
		defaultX = _.enemyPopoutOffsetX;
		defaultY = _.enemyPopoutOffsetY;
		dbObj = battler.enemy();
	} else {
		return { x: 0, y: 0 };
	}
	if (!dbObj) {
		return { x: defaultX, y: defaultY };
	}
	return {
		x: dbObj.jakeMSGPopoutOffsetX !== undefined ? dbObj.jakeMSGPopoutOffsetX : defaultX,
		y: dbObj.jakeMSGPopoutOffsetY !== undefined ? dbObj.jakeMSGPopoutOffsetY : defaultY
	};
};

_.parseLocation = function(value) {
	var location = String(value || '0, 0').split(/\s*,\s*/);
	return {
		x: String(location[0] || '0'),
		y: String(location[1] || '0')
	};
};

_.parseColors = function(value) {
	var colors = String(value || '#FFFFFF | #000000').split(/\s*\|\s*/);
	return {
		color: String(colors[0] || '#FFFFFF'),
		outline: String(colors[1] || '#000000')
	};
};

_.parseAnimations = function(value) {
	if (Array.isArray(value)) {
		return value.slice();
	}
	return String(value || '').split(/\s*,\s*/);
};

_.parseFlash = function(value, fallback) {
	var raw;
	var defaults = fallback || {
		flashColor: [0, 0, 0, 0],
		flashDuration: 0
	};
	if (Array.isArray(value)) {
		raw = value.slice(0);
	} else {
		raw = String(value || '').split(/\s*,\s*/);
	}
	var flashColor = [];
	for (var index = 0; index < 4; index++) {
		var parsedValue = parseInt(raw[index], 10);
		flashColor[index] = isNaN(parsedValue) ? defaults.flashColor[index] : parsedValue;
	}
	var flashDuration = parseInt(raw[4], 10);
	return {
		flashColor: flashColor,
		flashDuration: isNaN(flashDuration) ? defaults.flashDuration : flashDuration
	};
};

_.optionalValue = function(value, fallback) {
	return (value === undefined || value === null || value === '') ? fallback : value;
};

_.normalizeScriptTextCodes = function(text) {
	var normalized = String(text === undefined || text === null ? '' : text);
	if (normalized.indexOf('\\') >= 0) {
		return normalized;
	}
	var bracketCodes = [
		'V', 'N', 'P', 'C', 'I', 'w', 'px', 'py', 'oc', 'ow',
		'fs', 'af', 'ac', 'an', 'pf', 'pc', 'pn',
		'ni', 'nw', 'na', 'ns', 'nt', 'ii', 'iw', 'ia', 'is', 'it'
	];
	for (var index = 0; index < bracketCodes.length; index++) {
		var code = bracketCodes[index];
		var bracketRegex = new RegExp('(^|[^A-Za-z0-9_])(' + code + '\\[[^\\]]+\\])', 'g');
		normalized = normalized.replace(bracketRegex, '$1\\\\$2');
	}
	normalized = normalized.replace(/(^|[^A-Za-z0-9_])(G)(?=[^A-Za-z0-9_]|$)/g, '$1\\$2');
	normalized = normalized.replace(/(^|[^A-Za-z0-9_])(fr|fb|fi)(?=[^A-Za-z0-9_]|$)/gi, '$1\\$2');
	normalized = normalized.replace(/(^|[^A-Za-z0-9_])(fn<[^>]*>)/gi, '$1\\$2');
	normalized = normalized.replace(/(^|[^A-Za-z0-9_])(n<[^>]*>)/gi, '$1\\$2');
	normalized = normalized.replace(/(^|[^A-Za-z0-9_])(nc<[^>]*>)/gi, '$1\\$2');
	normalized = normalized.replace(/(^|[^A-Za-z0-9_])(nr<[^>]*>)/gi, '$1\\$2');
	return normalized;
	};

_.hasValidTextCode = function(text) {
	var value = String(text || '');
	if (value.indexOf('\\') < 0) {
		return false;
	}
	return /\\(?:V\[[^\]]+\]|N\[[^\]]+\]|P\[[^\]]+\]|G|C\[[^\]]+\]|I\[[^\]]+\]|w\[[^\]]+\]|px\[[^\]]+\]|py\[[^\]]+\]|oc\[[^\]]+\]|ow\[[^\]]+\]|fr|fs\[[^\]]+\]|fn<[^>]+>|fb|fi|af\[[^\]]+\]|ac\[[^\]]+\]|an\[[^\]]+\]|pf\[[^\]]+\]|pc\[[^\]]+\]|pn\[[^\]]+\]|n<[^>]+>|nc<[^>]+>|nr<[^>]+>|ni\[[^\]]+\]|nw\[[^\]]+\]|na\[[^\]]+\]|ns\[[^\]]+\]|nt\[[^\]]+\]|ii\[[^\]]+\]|iw\[[^\]]+\]|ia\[[^\]]+\]|is\[[^\]]+\]|it\[[^\]]+\]|[\\\$\.\|\^!><\{\}])/i.test(value);
};

_.createEmptyResult = function() {
	var result = new Game_ActionResult();
	result.clear();
	return result;
};

_.evaluateScreenCoordinate = function(value, fallback, screenW, screenH) {
	try {
		var raw = value;
		if (raw === undefined || raw === null || raw === '') {
			return fallback;
		}
		var evaluated = eval(String(raw));
		var number = Number(evaluated);
		return isNaN(number) ? fallback : number;
	} catch (e) {
		return fallback;
	}
};

_.defaultCustom4 = (function() {
	var location = _.parseLocation(sourceParams['Custom 4 Location'] || '24, -48');
	var colors = _.parseColors(sourceParams['Custom 4 Colors'] || '#FFFFFF | #000000');
	var flash = _.parseFlash(sourceParams['Custom 4 Flash'] || '0, 0, 0, 0, 0');
	var duration = parseInt(sourceParams['Custom 4 Duration'], 10);
	return {
		text: String(sourceParams['Custom 4 Text'] || ''),
		x: location.x,
		y: location.y,
		duration: isNaN(duration) ? 60 : duration,
		animations: _.parseAnimations(sourceParams['Custom 4 Animations'] || 'float'),
		color: colors.color,
		outline: colors.outline,
		flashColor: flash.flashColor,
		flashDuration: flash.flashDuration
	};
	})();

_.ensurePopupQueue = function(battler) {
	if (!battler._jakeMsgBattlePopupQueue) {
		battler._jakeMsgBattlePopupQueue = [];
	}
	return battler._jakeMsgBattlePopupQueue;
};

_.ensureYEPBarrierPopupResult = function(battler) {
	if (!Imported.YEP_AbsorptionBarrier || !Imported.YEP_BattleEngineCore || !battler) {
		return;
	}
	if (!battler._damagePopup) {
		if (battler.clearDamagePopup) {
			battler.clearDamagePopup();
		} else {
			battler._damagePopup = [];
		}
	}
	if (Array.isArray(battler._damagePopup) && battler._damagePopup.length === 0) {
		battler._damagePopup.push(_.createEmptyResult());
	}
};

_.buildCustom4Popup = function(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash) {
	var defaults = _.defaultCustom4;
	var popup = {
		text: _.normalizeScriptTextCodes(String(text === undefined || text === null ? defaults.text : text)),
		x: String(_.optionalValue(xPos, defaults.x)),
		y: String(_.optionalValue(yPos, defaults.y)),
		duration: parseInt(_.optionalValue(duration, defaults.duration), 10),
		animations: _.parseAnimations(_.optionalValue(animation, defaults.animations)),
		color: String(_.optionalValue(colorBase, defaults.color)),
		outline: String(_.optionalValue(colorOutline, defaults.outline))
	};
	if (isNaN(popup.duration)) {
		popup.duration = defaults.duration;
	}
	var flashInfo = _.parseFlash(
		_.optionalValue(flash, defaults.flashColor.concat([defaults.flashDuration])),
		defaults
	);
	popup.flashColor = flashInfo.flashColor;
	popup.flashDuration = flashInfo.flashDuration;
	return popup;
	};

_.spawnGlobalPopup = function(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash) {
	var scene = SceneManager._scene;
	if (!scene) {
		return null;
	}
	var parent = scene._spriteset || scene;
	if (!parent || !parent.addChild) {
		return null;
	}
	var screenW = Graphics.width;
	var screenH = Graphics.height;
	var popupX = _.evaluateScreenCoordinate(_.optionalValue(xPos, 'screenW / 2'), screenW / 2, screenW, screenH);
	var popupY = _.evaluateScreenCoordinate(_.optionalValue(yPos, 'screenH / 2'), screenH / 2, screenW, screenH);
	var popupInfo = _.buildCustom4Popup(text, '0', '0', duration, animation, colorBase, colorOutline, flash);

	var sprite = new Sprite_Damage();
	sprite._target = null;
	sprite._sprite = null;
	sprite._result = _.createEmptyResult();
	sprite._xOffsetSpecial = 0;
	sprite._yOffsetSpecial = 0;
	sprite._xOffsetDigits = 0;
	sprite._yOffsetDigits = 0;
	sprite.x = popupX;
	sprite.y = popupY;
	sprite._jakeMsgGlobalPopup = true;
	sprite.createJakeMSGCustomPopup(popupInfo);

	parent.addChild(sprite);
	return sprite;
};

var _Game_Battler_isDamagePopupRequested = Game_Battler.prototype.isDamagePopupRequested;
Game_Battler.prototype.isDamagePopupRequested = function() {
	var hasManualPopup = _.ensurePopupQueue(this).length > 0;
	if (hasManualPopup) {
		_.ensureYEPBarrierPopupResult(this);
	}
	return _Game_Battler_isDamagePopupRequested.call(this) || hasManualPopup;
	};

Game_Battler.prototype.shiftJakeMSGCustomBattlePopup = function() {
	return _.ensurePopupQueue(this).shift();
	};

Game_Battler.prototype.battlePopup = function(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash) {
	if (!$gameParty.inBattle()) {
		return null;
	}
	var popup = _.buildCustom4Popup(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash);
	_.ensurePopupQueue(this).push(popup);
	_.ensureYEPBarrierPopupResult(this);
	_.ensureDamagePopupRequest(this);
	return popup;
	};

_.getDamagePopupDefaults = function() {
	var info = baseCustomizer && baseCustomizer.popups ? baseCustomizer.popups[0] : null;
	if (info) {
		return info;
	}
	return _.defaultCustom4;
};

_.statusEffectSignOffsetY = -2;

_.buildStatusEffectPopupText = function(state, settings) {
	if (!state || !settings) {
		return { sign: '', body: '' };
	}
	var sign = settings.showSign ? String(settings.sign || '') : '';
	var body = '';
	if (settings.showIcon && state.iconIndex > 0) {
		body += '\\I[' + state.iconIndex + ']';
	}
	if (settings.showName && state.name) {
		if (settings.showIcon && state.iconIndex > 0) {
			body += ' ';
		}
		body += state.name;
	}
	return { sign: sign, body: body };
};

_.ensureDamagePopupRequest = function(battler) {
	if (!battler || !$gameParty.inBattle()) {
		return;
	}
	if (Imported.YEP_BattleEngineCore) {
		if (!battler._damagePopup) {
			if (battler.clearDamagePopup) {
				battler.clearDamagePopup();
			} else {
				battler._damagePopup = [];
			}
		}
		if (Array.isArray(battler._damagePopup) && battler._damagePopup.length === 0) {
			battler._damagePopup.push(_.createEmptyResult());
		}
	} else if (battler.startDamagePopup && !battler.isDamagePopupRequested()) {
		battler.startDamagePopup();
	}
};

_.shouldShowStatusEffectPopup = function(battler, stateId, kind) {
	if (!$gameParty || !$gameParty.inBattle()) {
		return false;
	}
	if (!battler || !stateId) {
		return false;
	}
	if (battler.deathStateId && stateId === battler.deathStateId()) {
		return false;
	}
	var settings = _.statusPopouts[kind];
	if (!settings || !settings.enabled) {
		return false;
	}
	if (!settings.showIcon && !settings.showName && !settings.showSign) {
		return false;
	}
	var state = $dataStates[stateId];
	if (!state) {
		return false;
	}
	if (settings.showIcon && !settings.showName && !settings.showSign && state.iconIndex <= 0) {
		return false;
	}
	return true;
};

_.queueStatusEffectPopup = function(battler, stateId, kind) {
	if (!_.shouldShowStatusEffectPopup(battler, stateId, kind)) {
		return null;
	}
	var settings = _.statusPopouts[kind];
	var state = $dataStates[stateId];
	var built = _.buildStatusEffectPopupText(state, settings);
	if (!built.sign && !built.body) {
		return null;
	}
	var defaults = _.getDamagePopupDefaults();
	var color = settings.customColor || defaults.color;
	var outline = defaults.outline;
	var flash = defaults.flashColor.concat([defaults.flashDuration]);
	var popup = battler.battlePopup(
		built.body,
		defaults.x,
		defaults.y,
		defaults.duration,
		defaults.animations,
		color,
		outline,
		flash
	);
	if (popup && built.sign) {
		popup.jakeMSGSign = built.sign;
		popup.jakeMSGSignOffsetY = _.statusEffectSignOffsetY;
	}
	return popup;
};

_.resolveStateIdForPopup = function(battler, stateRef) {
	if (!battler || stateRef === undefined || stateRef === null || stateRef === '') {
		return 0;
	}
	if (battler.resolveStateRef) {
		return battler.resolveStateRef(stateRef, false) || 0;
	}
	var stateId = Number(stateRef);
	return isNaN(stateId) ? 0 : stateId;
};

_.isNextTurnStateId = function(stateId) {
	if (!stateId) {
		return false;
	}
	if (Imported.JakeMSG_YEP_BuffsStatesCore_Additions &&
		Yanfly && Yanfly.BuffsStates_JakeMSGAdd &&
		Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId) {
		return Yanfly.BuffsStates_JakeMSGAdd.isNextTurnStateId(stateId);
	}
	return false;
};

var _Game_Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
	var resolvedId = _.resolveStateIdForPopup(this, stateId);
	var skipPopup = !resolvedId || _.isNextTurnStateId(resolvedId);
	var wasAffected = !skipPopup && this.isStateAffected && this.isStateAffected(resolvedId);
	_Game_Battler_addState.apply(this, arguments);
	if (!skipPopup && !wasAffected && this.isStateAffected && this.isStateAffected(resolvedId)) {
		_.queueStatusEffectPopup(this, resolvedId, 'infliction');
	}
};

var _Game_Battler_removeState = Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
	var resolvedId = _.resolveStateIdForPopup(this, stateId);
	var skipPopup = !resolvedId || _.isNextTurnStateId(resolvedId);
	var wasAffected = !skipPopup && this.isStateAffected && this.isStateAffected(resolvedId);
	_Game_Battler_removeState.apply(this, arguments);
	if (!skipPopup && wasAffected && this.isStateAffected && !this.isStateAffected(resolvedId)) {
		_.queueStatusEffectPopup(this, resolvedId, 'removal');
	}
};


_.showPopup = function(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash) {
	return _.spawnGlobalPopup(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash);
	};

window.showPopup = function(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash) {
	return _.showPopup(text, xPos, yPos, duration, animation, colorBase, colorOutline, flash);
	};

Sprite_Damage.prototype.hasPopupTextCodes = function(text) {
	return _.hasValidTextCode(text);
	};

Sprite_Damage.prototype.applyPopupTextCodeColors = function(window, info) {
	if (!window || !window.contents || !info) {
		return;
	}
	window.contents.fontFace = baseCustomizer.font;
	window.contents.fontSize = baseCustomizer.size;
	window.contents.textColor = info.color;
	window.contents.outlineColor = info.outline;
	if (Imported.YEP_AbsorptionBarrier && this._result && this._result._barrierAffected) {
		window.contents.textColor = '#FFFFFF';
	}
	};

Sprite_Damage.prototype.patchPopupTextCodeReset = function(window, info) {
	if (!window) {
		return;
	}
	var sprite = this;
	var _resetFontSettings = window.resetFontSettings;
	window.resetFontSettings = function() {
		_resetFontSettings.call(this);
		sprite.applyPopupTextCodeColors(this, info);
	};
	};

Sprite_Damage.prototype.createTextCodeBitmap = function(info, text) {
	var maxWidth = Math.max(64, Graphics.boxWidth);
	var measureWindow = new Window_Base(0, 0, maxWidth + 64, baseCustomizer.size + 64);
	this.patchPopupTextCodeReset(measureWindow, info);
	measureWindow.resetFontSettings();
	var converted = measureWindow.convertEscapeCharacters(String(text || ''));
	var textState = { index: 0, text: converted };
	var textHeight = Math.max(measureWindow.contents.fontSize, measureWindow.calcTextHeight(textState, false));
	var textWidth = Math.max(1, Math.ceil(measureWindow.drawTextEx(String(text || ''), 0, 0)));
	var bitmap = new Bitmap(textWidth + 20, textHeight + 6);
	var renderWindow = new Window_Base(0, 0, bitmap.width + 64, bitmap.height + 64);
	renderWindow.contents = bitmap;
	this.patchPopupTextCodeReset(renderWindow, info);
	renderWindow.resetFontSettings();
	renderWindow.drawTextEx(String(text || ''), 2, 0);
	return bitmap;
	};

Sprite_Damage.prototype.createSpecial = function(index) {
	var info = baseCustomizer.popups[index];
	var bitmap = this.hasPopupTextCodes(info.text) ? this.createTextCodeBitmap(info, info.text) : this.createChildBitmap(info, info.text.length);
	var sprite = this.createChildSprite(bitmap);
	if (!this.hasPopupTextCodes(info.text)) {
		sprite.bitmap.drawText(info.text, 2, 0, bitmap.width, bitmap.height, 'left');
	}
	sprite.dy = 0;
	sprite.x = eval(info.x);
	sprite.y = eval(info.y);
	sprite.xBase = this._xOffsetSpecial;
	sprite.yBase = this._yOffsetSpecial;
	sprite.animations = info.animations.clone();
	sprite.duration = info.duration;
	sprite.oriDuration = sprite.duration;
	sprite.flashColor = info.flashColor.clone();
	sprite.flashDuration = info.flashDuration;
	sprite.oriX = sprite.x;
	sprite.oriY = sprite.y;
	};

Sprite_Damage.prototype.createSpecialCustom = function(index) {
	var info = baseCustomizer.customPops[index];
	var bitmap = this.hasPopupTextCodes(info.text) ? this.createTextCodeBitmap(info, info.text) : this.createChildBitmap(info, info.text.length);
	var sprite = this.createChildSprite(bitmap);
	if (!this.hasPopupTextCodes(info.text)) {
		sprite.bitmap.drawText(info.text, 2, 0, bitmap.width, bitmap.height, 'left');
	}
	sprite.dy = 0;
	sprite.x = eval(info.x);
	sprite.y = eval(info.y);
	sprite.xBase = this._xOffsetSpecial;
	sprite.yBase = this._yOffsetSpecial;
	sprite.animations = info.animations.clone();
	sprite.duration = info.duration;
	sprite.oriDuration = sprite.duration;
	sprite.flashColor = info.flashColor.clone();
	sprite.flashDuration = info.flashDuration;
	sprite.oriX = sprite.x;
	sprite.oriY = sprite.y;
	};

Sprite_Damage.prototype.createDigits = function(baseRow, value) {
	var string = Math.abs(value).toString();
	var info = baseCustomizer.popups[baseRow];
	string = info.text.replace(/%1/, string);
	if (this.hasPopupTextCodes(string)) {
		var bitmap = this.createTextCodeBitmap(info, string);
		var sprite = this.createChildSprite(bitmap);
		sprite.dy = 0;
		sprite.xBase = this._xOffsetDigits;
		sprite.yBase = this._yOffsetDigits;
		sprite.x = eval(info.x);
		sprite.y = eval(info.y);
		sprite.animations = info.animations.clone();
		sprite.duration = info.duration;
		sprite.oriDuration = sprite.duration;
		sprite.oriX = sprite.x;
		sprite.oriY = sprite.y;
		if (this._result.critical) {
			sprite.flashColor = [255, 0, 0, 160];
			sprite.flashDuration = 60;
		} else if (Imported.YEP_AbsorptionBarrier && this._result._barrierAffected) {
			sprite.flashColor = Yanfly.Param.ABRPop.slice();
			sprite.flashDuration = 180;
		} else {
			sprite.flashColor = info.flashColor.clone();
			sprite.flashDuration = info.flashDuration;
		}
		return;
	}
	var dummy = this.createChildBitmap(info);
	var w = this.digitWidthFromBitmap(dummy);
	var h = this.digitHeightFromBitmap(dummy);
	for (var i = 0; i < string.length; i++) {
		var digitBitmap = this.createChildBitmap(info);
		digitBitmap.resize(digitBitmap.width + digitBitmap.outlineWidth * 2, digitBitmap.height);
		var digitSprite = this.createChildSprite(digitBitmap);
		digitSprite.bitmap.drawText(string[i], 2, 0, w, h, 'left');
		digitSprite.xBase = this._xOffsetDigits;
		digitSprite.yBase = this._yOffsetDigits;
		digitSprite.x = (i - (string.length - 1) / 2) * w + eval(info.x);
		digitSprite.y = eval(info.y);
		digitSprite.ry = digitSprite.y;
		digitSprite.dy = -i;
		digitSprite.animations = info.animations.clone();
		digitSprite.duration = info.duration;
		digitSprite.oriDuration = digitSprite.duration;
		digitSprite.oriX = digitSprite.x;
		digitSprite.oriY = digitSprite.y;
		if (this._result.critical) {
			digitSprite.flashColor = [255, 0, 0, 160];
			digitSprite.flashDuration = 60;
		} else if (Imported.YEP_AbsorptionBarrier && this._result._barrierAffected) {
			digitSprite.flashColor = Yanfly.Param.ABRPop.slice();
			digitSprite.flashDuration = 180;
		} else {
			digitSprite.flashColor = info.flashColor.clone();
			digitSprite.flashDuration = info.flashDuration;
		}
	}
	};

Sprite_Damage.prototype.setup = function(target) {
	this._target = target;
	this._sprite = Imported.YEP_BattleEngineCore ? target.battler() : target._dpu_sprite;
	this._xOffsetSpecial = 0;
	this._yOffsetSpecial = 0;
	this._xOffsetDigits = 0;
	this._yOffsetDigits = 0;
	if (Imported.YEP_BattleEngineCore) {
		this._result = target.shiftDamagePopup();
	} else {
		this._result = target.result();
	}
	if (!this._result) {
		this._result = _.createEmptyResult();
	}
	var result = this._result;

	if (!eval(baseCustomizer.condition)) return;

	var damages = [result.hpDamage, result.mpDamage, result.tpDamage];
	for (var index = 0; index <= 5; index++) {
		if (eval(baseCustomizer.popups[index].condition)) {
			this.createDigits(index, damages[Math.floor(index / 2)]);
			this.incrementDigits(baseCustomizer.xShift, baseCustomizer.yShift);
		}
	}

	for (index = 6; index <= 9; index++) {
		if (eval(baseCustomizer.popups[index].condition)) {
			this.createSpecial(index);
			this.incrementSpecial(baseCustomizer.xShift, baseCustomizer.yShift);
		}
	}

	for (index = 1; index < baseCustomizer.customPops.length; index++) {
		if (baseCustomizer.customPops[index] && eval(baseCustomizer.customPops[index].condition)) {
			this.createSpecialCustom(index);
			this.incrementSpecial(baseCustomizer.xShift, baseCustomizer.yShift);
		}
	}

	var manualPopup;
	while (target.shiftJakeMSGCustomBattlePopup && (manualPopup = target.shiftJakeMSGCustomBattlePopup())) {
		this.createJakeMSGCustomPopup(manualPopup);
		this.incrementSpecial(baseCustomizer.xShift, baseCustomizer.yShift);
	}
	};

Sprite_Damage.prototype.createJakeMSGBodyBitmap = function(info) {
	var text = String(info.text || '');
	if (!text) {
		return null;
	}
	if (this.hasPopupTextCodes && this.hasPopupTextCodes(text)) {
		return this.createTextCodeBitmap(info, text);
	}
	var bitmap = this.createChildBitmap(info, text.length || 1);
	bitmap.drawText(text, 2, 0, bitmap.width, bitmap.height, 'left');
	return bitmap;
	};

Sprite_Damage.prototype.createJakeMSGSignLiftedBitmap = function(info, bodyBitmap) {
	var sign = String(info.jakeMSGSign || '');
	var offsetY = Number(info.jakeMSGSignOffsetY);
	if (isNaN(offsetY)) {
		offsetY = _.statusEffectSignOffsetY;
	}
	var padTop = Math.max(0, -offsetY);
	var measure = this.createChildBitmap(info, Math.max(1, sign.length));
	var signWidth = Math.max(1, Math.ceil(measure.measureTextWidth(sign)));
	var signHeight = Math.max(1, measure.fontSize);
	var body = bodyBitmap;
	var bodyWidth = body ? body.width : 0;
	var bodyHeight = body ? body.height : 0;
	var width = signWidth + bodyWidth + 4;
	var height = Math.max(bodyHeight + padTop, signHeight + padTop);
	var bitmap = new Bitmap(width, height);
	bitmap.fontFace = baseCustomizer.font;
	bitmap.fontSize = baseCustomizer.size;
	bitmap.textColor = info.color;
	bitmap.outlineColor = info.outline;
	bitmap.drawText(sign, 2, padTop + offsetY, signWidth + 4, signHeight, 'left');
	if (body && bodyWidth > 0 && bodyHeight > 0) {
		bitmap.blt(body, 0, 0, bodyWidth, bodyHeight, 2 + signWidth, padTop);
	}
	return bitmap;
	};

Sprite_Damage.prototype.createJakeMSGCustomPopup = function(info) {
	var bitmap = this.createJakeMSGBodyBitmap(info);
	if (info.jakeMSGSign) {
		bitmap = this.createJakeMSGSignLiftedBitmap(info, bitmap);
	} else if (!bitmap) {
		bitmap = this.createChildBitmap(info, 1);
	}
	var sprite = this.createChildSprite(bitmap);
	sprite.dy = 0;
	sprite.x = eval(info.x);
	sprite.y = eval(info.y);
	sprite.xBase = this._xOffsetSpecial;
	sprite.yBase = this._yOffsetSpecial;
	sprite.animations = info.animations.clone();
	sprite.duration = info.duration;
	sprite.oriDuration = sprite.duration;
	sprite.flashColor = info.flashColor.clone();
	sprite.flashDuration = info.flashDuration;
	sprite.oriX = sprite.x;
	sprite.oriY = sprite.y;
	};

var _Sprite_Damage_update = Sprite_Damage.prototype.update;
Sprite_Damage.prototype.update = function() {
	_Sprite_Damage_update.call(this);
	if (this._jakeMsgGlobalPopup && !this.isPlaying() && this.parent) {
		this.parent.removeChild(this);
	}
	};

var _Sprite_Actor_damageOffsetX = Sprite_Actor.prototype.damageOffsetX;
Sprite_Actor.prototype.damageOffsetX = function() {
	var offset = _Sprite_Actor_damageOffsetX.call(this);
	if (this._battler) {
		offset += _.getBattlerPopoutOffsets(this._battler).x;
	}
	return offset;
};

var _Sprite_Actor_damageOffsetY = Sprite_Actor.prototype.damageOffsetY;
Sprite_Actor.prototype.damageOffsetY = function() {
	var offset = _Sprite_Actor_damageOffsetY.call(this);
	if (this._battler) {
		offset += _.getBattlerPopoutOffsets(this._battler).y;
	}
	return offset;
};

var _Sprite_Enemy_damageOffsetX = Sprite_Enemy.prototype.damageOffsetX;
Sprite_Enemy.prototype.damageOffsetX = function() {
	var offset = _Sprite_Enemy_damageOffsetX.call(this);
	if (this._battler) {
		offset += _.getBattlerPopoutOffsets(this._battler).x;
	}
	return offset;
};

var _Sprite_Enemy_damageOffsetY = Sprite_Enemy.prototype.damageOffsetY;
Sprite_Enemy.prototype.damageOffsetY = function() {
	var offset = _Sprite_Enemy_damageOffsetY.call(this);
	if (this._battler) {
		offset += _.getBattlerPopoutOffsets(this._battler).y;
	}
	return offset;
};

var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!_DataManager_isDatabaseLoaded.call(this)) {
		return false;
	}
	if (!SRD.BattlePopupCustomizer_JakeMSGAdd._loadedPopoutOffsetNotetags) {
		DataManager.processJakeMSGPopoutOffsetNotetags($dataActors);
		DataManager.processJakeMSGPopoutOffsetNotetags($dataEnemies);
		SRD.BattlePopupCustomizer_JakeMSGAdd._loadedPopoutOffsetNotetags = true;
	}
	return true;
};

DataManager.processJakeMSGPopoutOffsetNotetags = function(group) {
	for (var index = 1; index < group.length; index++) {
		var obj = group[index];
		if (!obj) {
			continue;
		}
		obj.jakeMSGPopoutOffsetX = undefined;
		obj.jakeMSGPopoutOffsetY = undefined;
		var notedata = obj.note ? obj.note.split(/[\r\n]+/) : [];
		for (var lineIndex = 0; lineIndex < notedata.length; lineIndex++) {
			var line = notedata[lineIndex];
			if (line.match(/<Popout Offset X:\s*(-?\d+(?:\.\d+)?)\s*>/i)) {
				obj.jakeMSGPopoutOffsetX = Number(RegExp.$1);
			} else if (line.match(/<Popout Offset Y:\s*(-?\d+(?:\.\d+)?)\s*>/i)) {
				obj.jakeMSGPopoutOffsetY = Number(RegExp.$1);
			}
		}
	}
};

})(SRD.BattlePopupCustomizer_JakeMSGAdd);

//=============================================================================
// End of File
//=============================================================================
}
