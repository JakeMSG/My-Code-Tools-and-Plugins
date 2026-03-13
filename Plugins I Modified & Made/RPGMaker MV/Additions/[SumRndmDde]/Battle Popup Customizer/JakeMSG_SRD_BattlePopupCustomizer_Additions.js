//=============================================================================
// Addition to SRD plugin "BattlePopupCustomizer", made by JakeMSG
// JakeMSG_SRD_BattlePopupCustomizer_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_SRD_BattlePopupCustomizer_Additions = true;

var SRD = SRD || {};
SRD.BattlePopupCustomizer_JakeMSGAdd = SRD.BattlePopupCustomizer_JakeMSGAdd || {};
SRD.BattlePopupCustomizer_JakeMSGAdd.version = 1.0;

//=============================================================================
/*:
 * @plugindesc (Requires SRD_BattlePopupCustomizer.js) Additions to the Battle Popup Customizer
 *  SRD Plugin
 * @author JakeMSG
 * v1.0
 *
============ Change Log ============
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
 * == Their defaults are screenWidth / 2 and screenHeight / 2.
 * == They can be numbers or formula strings using "screenW" and "screenH" as possible variables inside the formulas
 * ==== For the battler script call "battlePopup", xPos and yPos still behave like Location parameter (relative to the battler sprite and can be formulas).
 * ==== colorBase and colorOutline behave like Colors parameter
 *
 * ======== Example:
 * showPopup(
 *   'COUNTER',
 *   'screenW * 0.5',
 *   'screenH * 0.25',
 *   60,
 *   'float',
 *   '#FFFFFF',
 *   '#000000',
 *   '255, 0, 0, 160, 60'
 * );
 *
 * 
 * 
 * ======================================
 * Param Declarations
 * ======================================
 * @param 
 * 
 * 
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
	return _Game_Battler_isDamagePopupRequested.call(this) || _.ensurePopupQueue(this).length > 0;
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
	return popup;
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

Sprite_Damage.prototype.createTextCodeBitmap = function(info, text) {
	var maxWidth = Math.max(64, Graphics.boxWidth);
	var measureWindow = new Window_Base(0, 0, maxWidth + 64, baseCustomizer.size + 64);
	measureWindow.resetFontSettings();
	measureWindow.contents.fontFace = baseCustomizer.font;
	measureWindow.contents.fontSize = baseCustomizer.size;
	measureWindow.contents.textColor = info.color;
	measureWindow.contents.outlineColor = info.outline;
	if (Imported.YEP_AbsorptionBarrier && this._result && this._result._barrierAffected) {
		measureWindow.contents.textColor = '#FFFFFF';
	}
	var converted = measureWindow.convertEscapeCharacters(String(text || ''));
	var textState = { index: 0, text: converted };
	var textHeight = Math.max(measureWindow.contents.fontSize, measureWindow.calcTextHeight(textState, false));
	var textWidth = Math.max(1, Math.ceil(measureWindow.drawTextEx(String(text || ''), 0, 0)));
	var bitmap = new Bitmap(textWidth + 20, textHeight + 6);
	var renderWindow = new Window_Base(0, 0, bitmap.width + 64, bitmap.height + 64);
	renderWindow.contents = bitmap;
	renderWindow.resetFontSettings();
	renderWindow.contents.fontFace = baseCustomizer.font;
	renderWindow.contents.fontSize = baseCustomizer.size;
	renderWindow.contents.textColor = info.color;
	renderWindow.contents.outlineColor = info.outline;
	if (Imported.YEP_AbsorptionBarrier && this._result && this._result._barrierAffected) {
		renderWindow.contents.textColor = '#FFFFFF';
	}
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

Sprite_Damage.prototype.createJakeMSGCustomPopup = function(info) {
	var bitmap;
	if (this.hasPopupTextCodes && this.hasPopupTextCodes(info.text)) {
		bitmap = this.createTextCodeBitmap(info, info.text);
	} else {
		bitmap = this.createChildBitmap(info, info.text.length || 1);
	}
	var sprite = this.createChildSprite(bitmap);
	if (!(this.hasPopupTextCodes && this.hasPopupTextCodes(info.text))) {
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

var _Sprite_Damage_update = Sprite_Damage.prototype.update;
Sprite_Damage.prototype.update = function() {
	_Sprite_Damage_update.call(this);
	if (this._jakeMsgGlobalPopup && !this.isPlaying() && this.parent) {
		this.parent.removeChild(this);
	}
	};

})(SRD.BattlePopupCustomizer_JakeMSGAdd);

//=============================================================================
// End of File
//=============================================================================
}
