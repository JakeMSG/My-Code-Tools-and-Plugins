//=============================================================================
// JakeMSG_SRD_TimedAttackAdditions_XParallel
// JakeMSG_SRD_TimedAttackAdditions_XParallel.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_SRD_TimedAttackAdditions_XParallel = true;

//=============================================================================
/*:
 * @plugindesc [Module] XParallel timed attack module for JakeMSG_SRD_TimedAttackAdditions
 * @author JakeMSG
 * v1.1
 * 
============ Change Log ============
1.1 - 7.14th.2026
 * Fixed Olivia_StateTooltipDisplay compatibility during parallel forced TAs:
   keep the state tooltip window above XTA scene layers and keep XTA overlay
   sprites parented under the TA container instead of the scene root.
1.0 - 5.14th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * JakeMSG_SRD_TimedAttackAdditions_XParallel
 * ============================================================================
 * This plugin enables the XParallel timed attack script-call module for:
 * JakeMSG_SRD_TimedAttackAdditions.js
 *
 * Required load order:
 * 1) JakeMSG_SRD_TimedAttackAdditions
 * 2) JakeMSG_SRD_TimedAttackAdditions_XParallel
 *
 * ---------------------------------------------------------------------------
 * Script Calls
 * ---------------------------------------------------------------------------
 * parallelTA(skillId [, tempNotesTA])
 * - Runs one forced timed attack in parallel without blocking event flow.
 *
 * parallelXTAs(skillIdArray [, waitMode])
 * - Starts multiple forced timed attacks in parallel.
 * - waitMode default is false.
 * - waitMode true waits for all runs started by that call.
 *
 * addParXTA(skillId [, tempNotesTA] [, waitMode])
 * - Adds one more X Timed Attack to the current parallel XTA flow.
 * - If no XTA flow exists yet, it creates one.
 * - waitMode true waits for only this added run.
 *
 * waitXTA()
 * - Adds interpreter wait until all ongoing X Timed Attacks finish.
 *
 * clearXTAResults()
 * - Clears $gameTemp.parXTAs and $gameTemp.parXTAControls,
 *   then resets the next index to 1.
 *
 * logXTAs(enabled)
 * - enabled=true: enables live current_* updates in $gameTemp.parXTAs.
 * - enabled=false: disables live updates.

 * ---------------------------------------------------------------------------
 * Runtime Control Storage
 * ---------------------------------------------------------------------------
 * Parallel-XTA runtime control now uses:
 * - $gameTemp.parXTAControls
 *
 * It is indexed in tandem with $gameTemp.parXTAs.
 * Each control entry contains:
 * - stopped (boolean)
 *   - true: force-finishes the associated XTA immediately.
 *   - auto-set to true when the associated XTA finishes.
 * - disabledControl (boolean)
 *   - true: blocks keyboard and mouse hit input for the associated XTA.
 * - individualVariables (object)
 *   - currently active for Balance XTAs:
 *     stab, boost, focus, stick, nitro, concentrate, freeze
 *     exh_boo, exh_foc, exh_sti, exh_nit, exh_con, exh_fre
 *   - These values are synchronized in real-time with the active Balance XTA.

 * ---------------------------------------------------------------------------
 * Eval Timing Properties
 * ---------------------------------------------------------------------------
 * Eval-timing properties run JavaScript during specific XTA runtime timings.
 * For script values, use braces to safely include semicolons:
 * ET On Hit: { hitPower = Math.min(1, hitPower + 0.1); }
 *
 * Supported properties:
 * - ET On Hit (Bar, Circle, Clock)
 *   Helper variable: hitPower
 *
 * - ET On Valid Mash (Mash)
 *   Helper variable: mashAdd
 *
 * - ET On Key press (Arrows)
 *   Helper variable: validKey
 *
 * - ET On Key Hold start (Balance)
 * - ET On Key Hold end (Balance)
 *   Helper variable: keyPressed
 *   keyPressed values:
 *   leftMove, rightMove, boost, focus, stick, nitro, concentrate, freeze
 *
 * - ET On Enter Balance Area X (Balance)
 * - ET On Exit Balance Area X (Balance)
 * - ET While In Balance Area X (Balance)
 *
 * - ET On Enter Hitzone Area X (Bar)
 * - ET On Exit Hitzone Area X (Bar)
 * - ET While In Hitzone Area X (Bar)
 *
 * Extra helper variables:
 * - Bar eval timings: cursorPosition
 * - Balance eval timings:
 *   cursorPosition, stab, boost, focus, stick, nitro, concentrate, freeze,
 *   exh_boo, exh_foc, exh_sti, exh_nit, exh_con, exh_fre
 *
 * forceTA(skillId [, tempNotesTA]) note:
 * - forceTA belongs to JakeMSG_SRD_TimedAttackAdditions.
 * - When this XParallel module is active, multiple forceTA calls issued inside
 *   one Script command block are queued and executed sequentially in call order.
 * - Use parallelTA/parallelXTAs/addParXTA for true parallel runs.
 *
 * ---------------------------------------------------------------------------
 * Result Storage
 * ---------------------------------------------------------------------------
 * $gameTemp.parXTAs index starts at 1.
 * Each entry stores:
 * - tas_power, tas_frames_left, tas_seconds_left
 * - qte_power, qte_frames_left, qte_seconds_left
 * - current_power, current_frames_left, current_seconds_left
 * - skillId, runId, finished
 *
 * $gameTemp.parXTAControls index starts at 1.
 * Each entry stores:
 * - stopped, disabledControl
 * - stopped auto-flips true once that XTA run finishes
 * - individualVariables (Balance live variables)
 *
 * Example:
 * parallelTA(13, "Mode: Custom Hitzones; Hitzone 1: 0,16,24,#f00,#faa");
 * parallelXTAs([4,7,9], true);
 * addParXTA(15, "Stop key: 90", false);
 * waitXTA();
 * logXTAs(true);
 * clearXTAResults();
 * 
 * 
 * 
 * 
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @param ET Defaults
 * @type string
 * @default
 *
 * @param Default ET On Hit
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Hit (Bar/Circle/Clock). Use plain code or { ... }.
 *
 * @param Default ET On Valid Mash
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Valid Mash.
 *
 * @param Default ET On Key press
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Key press (Arrows).
 *
 * @param Default ET On Key Hold start
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Key Hold start (Balance).
 *
 * @param Default ET On Key Hold end
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Key Hold end (Balance).
 *
 * @param Default ET On Enter Balance Area
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Enter Balance Area X when a specific X code is not set.
 *
 * @param Default ET On Exit Balance Area
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Exit Balance Area X when a specific X code is not set.
 *
 * @param Default ET While In Balance Area
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET While In Balance Area X when a specific X code is not set.
 *
 * @param Default ET On Enter Hitzone Area
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Enter Hitzone Area X when a specific X code is not set.
 *
 * @param Default ET On Exit Hitzone Area
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET On Exit Hitzone Area X when a specific X code is not set.
 *
 * @param Default ET While In Hitzone Area
 * @parent ET Defaults
 * @type string
 * @default
 * @desc Default code for ET While In Hitzone Area X when a specific X code is not set.
 * 
 */
//=============================================================================

(function() {
"use strict";

if (!Imported.JakeMSG_SRD_TimedAttackAdditions) {
if (typeof console !== 'undefined' && console.warn) {
console.warn('JakeMSG_SRD_TimedAttackAdditions_XParallel: load below JakeMSG_SRD_TimedAttackAdditions.');
}
return;
}

var root = (typeof globalThis !== 'undefined') ? globalThis : ((typeof window !== 'undefined') ? window : this);
var core = root.JakeMSG_SRD_TA_Core;
if (!core || !core.J) {
if (typeof console !== 'undefined' && console.warn) {
console.warn('JakeMSG_SRD_TimedAttackAdditions_XParallel: missing shared core from JakeMSG_SRD_TimedAttackAdditions.');
}
return;
}

var J = core.J;

	J._taRuns = J._taRuns || {};
	J._taRunSeq = J._taRunSeq || 1;
	J._xtaGroupSeq = J._xtaGroupSeq || 1;
	J._currentXtaGroup = J._currentXtaGroup || 0;
	J._logXTAsEnabled = !!J._logXTAsEnabled;
	J._forceTAQueue = Array.isArray(J._forceTAQueue) ? J._forceTAQueue : [];
	J._forceTAActiveRunId = J._forceTAActiveRunId || 0;

	var xpParams = (typeof PluginManager !== 'undefined' && PluginManager.parameters)
		? (PluginManager.parameters('JakeMSG_SRD_TimedAttackAdditions_XParallel') || {})
		: {};

	J._xtaEvalFnCache = J._xtaEvalFnCache || {};

	J.normalizeEvalCode = function(raw) {
		if (raw === null || raw === undefined) return '';
		var s = String(raw).trim();
		if (!s.length) return '';
		if ((s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') ||
			(s.charAt(0) === "'" && s.charAt(s.length - 1) === "'")) {
			try {
				s = JSON.parse(s);
			} catch (e) {
			}
			s = String(s || '').trim();
		}
		if (s.length >= 2 && s.charAt(0) === '{' && s.charAt(s.length - 1) === '}') {
			s = s.substring(1, s.length - 1).trim();
		}
		return s;
	};

	J._readBalancedBraceBlock = function(text, openIndex) {
		if (!text || openIndex < 0 || text.charAt(openIndex) !== '{') return null;
		var depth = 0;
		var quote = '';
		for (var i = openIndex; i < text.length; i++) {
			var ch = text.charAt(i);
			if (quote) {
				if (ch === '\\') {
					i++;
					continue;
				}
				if (ch === quote) quote = '';
				continue;
			}
			if (ch === '"' || ch === "'" || ch === '`') {
				quote = ch;
				continue;
			}
			if (ch === '{') depth++;
			else if (ch === '}') {
				depth--;
				if (depth === 0) {
					return {
						value: text.substring(openIndex + 1, i),
						end: i
					};
				}
			}
		}
		return null;
	};

	J._readFirstBracedProperty = function(source, keyPattern) {
		if (source === null || source === undefined) return null;
		var text = String(source);
		var re = new RegExp(keyPattern + '\\s*:\\s*\\{', 'i');
		var m = re.exec(text);
		if (!m) return null;
		var openIndex = text.indexOf('{', m.index);
		if (openIndex < 0) return null;
		var block = J._readBalancedBraceBlock(text, openIndex);
		if (!block) return null;
		return J.normalizeEvalCode(block.value);
	};

	J._readAllIndexedBracedProperties = function(source, keyPatternWithIndex) {
		var out = {};
		if (source === null || source === undefined) return out;
		var text = String(source);
		var re = new RegExp(keyPatternWithIndex + '\\s*:\\s*\\{', 'ig');
		while (true) {
			var m = re.exec(text);
			if (!m) break;
			var idx = parseInt(m[1]);
			if (isNaN(idx) || idx <= 0) continue;
			var openIndex = re.lastIndex - 1;
			if (openIndex < 0 || text.charAt(openIndex) !== '{') {
				openIndex = text.indexOf('{', m.index);
				if (openIndex < 0) continue;
			}
			var block = J._readBalancedBraceBlock(text, openIndex);
			if (!block) continue;
			out[idx] = J.normalizeEvalCode(block.value);
			re.lastIndex = block.end + 1;
		}
		return out;
	};

	J._readEvalTimingCode = function(source, keyPattern, semicolonMode, fallbackCode) {
		var v = J._readFirstBracedProperty(source, keyPattern);
		if (v === null) {
			var flat = J.getValue(source, keyPattern, semicolonMode);
			if (flat !== null) v = J.normalizeEvalCode(flat);
		}
		if (v === null || v === undefined || !String(v).trim().length) {
			return J.normalizeEvalCode(fallbackCode);
		}
		return J.normalizeEvalCode(v);
	};

	J._readIndexedEvalTimingCodes = function(source, basePatternNoIndex, maxIndex, semicolonMode) {
		var out = J._readAllIndexedBracedProperties(source, basePatternNoIndex + '[ ]*(\\d+)');
		var max = Math.max(1, parseInt(maxIndex) || 1);
		for (var i = 1; i <= max; i++) {
			if (out[i] && String(out[i]).trim().length) continue;
			var flat = J.getValue(source, basePatternNoIndex + '[ ]*' + i, semicolonMode);
			if (flat !== null) {
				var code = J.normalizeEvalCode(flat);
				if (code.length) out[i] = code;
			}
		}
		return out;
	};

	J.runXtaEvalCode = function(ta, code, vars) {
		var src = J.normalizeEvalCode(code);
		if (!src.length) return vars || {};
		var payload = vars || {};
		var keys = Object.keys(payload);
		var cacheKey = keys.join('|') + '::' + src;
		var fn = J._xtaEvalFnCache[cacheKey];
		if (!fn) {
			var prolog = '';
			var epilog = '';
			for (var i = 0; i < keys.length; i++) {
				var k = keys[i];
				prolog += 'var ' + k + ' = __vars[' + JSON.stringify(k) + '];\n';
				epilog += '__vars[' + JSON.stringify(k) + '] = ' + k + ';\n';
			}
			var body = prolog + '\n' + src + '\n' + epilog + 'return __vars;';
			fn = new Function('__vars', body);
			J._xtaEvalFnCache[cacheKey] = fn;
		}
		try {
			fn.call(ta || null, payload);
		} catch (e) {
		}
		return payload;
	};

	J._xtaEvalDefaults = J._xtaEvalDefaults || {
		onHit: J.normalizeEvalCode(xpParams['Default ET On Hit']),
		onValidMash: J.normalizeEvalCode(xpParams['Default ET On Valid Mash']),
		onKeyPress: J.normalizeEvalCode(xpParams['Default ET On Key press']),
		onKeyHoldStart: J.normalizeEvalCode(xpParams['Default ET On Key Hold start']),
		onKeyHoldEnd: J.normalizeEvalCode(xpParams['Default ET On Key Hold end']),
		onEnterBalanceArea: J.normalizeEvalCode(xpParams['Default ET On Enter Balance Area']),
		onExitBalanceArea: J.normalizeEvalCode(xpParams['Default ET On Exit Balance Area']),
		whileInBalanceArea: J.normalizeEvalCode(xpParams['Default ET While In Balance Area']),
		onEnterHitzoneArea: J.normalizeEvalCode(xpParams['Default ET On Enter Hitzone Area']),
		onExitHitzoneArea: J.normalizeEvalCode(xpParams['Default ET On Exit Hitzone Area']),
		whileInHitzoneArea: J.normalizeEvalCode(xpParams['Default ET While In Hitzone Area'])
	};

	J._xtaBarTypeId = String(SRD.TimedAttack.TAS_ID || 'default').trim().toLowerCase();

	J.getRunFromTa = function(ta) {
		if (!ta || !ta._jRunId) return null;
		return J._taRuns[ta._jRunId] || null;
	};

	J.isXtaRuntimeTa = function(ta) {
		var run = J.getRunFromTa(ta);
		return !!(run && run.isXTA);
	};

	J.isForcedStandaloneTa = function(ta) {
		return !!(ta && ta._jForceTAStandalone);
	};

	J.hasActiveForcedStandaloneTas = function() {
		for (var id in J._taRuns) {
			if (!J._taRuns.hasOwnProperty(id)) continue;
			var run = J._taRuns[id];
			if (!run || !run.tas || !run.tas._jForceTAStandalone) continue;
			if (J._isRunEntryActive(id)) return true;
		}
		return false;
	};

	J._oliviaStateTooltipAvailable = function() {
		return !!(Imported.Olivia_StateOlivia_StateTooltipDisplay &&
			SceneManager._scene &&
			SceneManager._scene._stateIconTooltipWindow);
	};

	J._ensureStateIconTooltipOnTop = function() {
		if (!J._oliviaStateTooltipAvailable()) return;
		var scene = SceneManager._scene;
		var tooltip = scene._stateIconTooltipWindow;
		if (!tooltip || !tooltip.parent) return;
		scene.setChildIndex(tooltip, scene.children.length - 1);
	};

	J._insertForcedTaIntoScene = function(scene, tas) {
		if (!scene || !tas) return;
		if (scene._stateIconTooltipWindow) {
			var idx = scene.children.indexOf(scene._stateIconTooltipWindow);
			if (idx >= 0) {
				scene.addChildAt(tas, idx);
				J._ensureStateIconTooltipOnTop();
				return;
			}
		}
		scene.addChild(tas);
	};

	J._xtaBalanceFeatureDefs = [
		{name: 'Boost', short: 'boo'},
		{name: 'Focus', short: 'foc'},
		{name: 'Stick', short: 'sti'},
		{name: 'Nitro', short: 'nit'},
		{name: 'Concentrate', short: 'con'},
		{name: 'Freeze', short: 'fre'}
	];

	J._isBalanceTa = function(ta) {
		return !!(ta && ta._item && String(ta._item.type || '').trim().toLowerCase() === 'balance');
	};

	J._syncBalanceVarsToControl = function(ta, controlEntry) {
		if (!J._isBalanceTa(ta) || !controlEntry) return;
		controlEntry = J.normalizeParXtaControlEntry(controlEntry);
		var iv = controlEntry.individualVariables;
		var mirror = controlEntry._jMirror || (controlEntry._jMirror = {});
		iv.stab = Number(ta._jBalanceStability || 0);
		iv.boost = Number(ta._jBalanceBoostCurrent || 0);
		iv.focus = Number(ta._jBalanceFocusCurrent || 0);
		iv.stick = Number(ta._jBalanceStickCurrent || 0);
		iv.nitro = Number(ta._jBalanceNitroCurrent || 0);
		iv.concentrate = Number(ta._jBalanceConcentrateCurrent || 0);
		iv.freeze = Number(ta._jBalanceFreezeCurrent || 0);

		iv.exh_boo = !!ta._jBalanceBoostExhausted;
		iv.exh_foc = !!ta._jBalanceFocusExhausted;
		iv.exh_sti = !!ta._jBalanceStickExhausted;
		iv.exh_nit = !!ta._jBalanceNitroExhausted;
		iv.exh_con = !!ta._jBalanceConcentrateExhausted;
		iv.exh_fre = !!ta._jBalanceFreezeExhausted;

		for (var k in iv) {
			if (!iv.hasOwnProperty(k)) continue;
			mirror[k] = iv[k];
		}
	};

	J._updateBalanceFeatureExhaustState = function(ta, featureName) {
		if (!ta) return;
		var base = '_jBalance' + featureName;
		var limit = Number(ta[base + 'Limit']);
		if (!isFinite(limit) || limit < 0) {
			ta[base + 'Exhausted'] = false;
			return;
		}
		if (!ta[base + 'ExhaustEnable']) {
			ta[base + 'Exhausted'] = false;
			return;
		}
		var current = Number(ta[base + 'Current']);
		if (!isFinite(current)) current = 0;
		var recoverAt = Number(ta[base + 'ExhaustLimit']);
		if (!isFinite(recoverAt) || recoverAt < 0) recoverAt = 0;
		recoverAt = J.clamp(recoverAt, 0, limit);
		if (!ta[base + 'Exhausted'] && current <= 0) ta[base + 'Exhausted'] = true;
		if (ta[base + 'Exhausted'] && current >= recoverAt) ta[base + 'Exhausted'] = false;
	};

	J._applyBalanceVarsFromControl = function(ta, controlEntry) {
		if (!J._isBalanceTa(ta) || !controlEntry) return;
		var iv = controlEntry.individualVariables;
		if (!iv || typeof iv !== 'object') return;
		var mirror = controlEntry._jMirror || {};

		if (iv.stab !== mirror.stab && iv.stab !== undefined && iv.stab !== null && isFinite(Number(iv.stab))) {
			ta._jBalanceStability = J.clamp(Number(iv.stab), 0, Math.max(1, Number(ta._jBalanceMaxStability || 1)));
		}

		for (var i = 0; i < J._xtaBalanceFeatureDefs.length; i++) {
			var fd = J._xtaBalanceFeatureDefs[i];
			var key = fd.name.toLowerCase();
			var base = '_jBalance' + fd.name;
			var valueChanged = (iv[key] !== mirror[key]);
			var exKey = 'exh_' + fd.short;
			var exChanged = (iv[exKey] !== mirror[exKey]);
			if (valueChanged && iv[key] !== undefined && iv[key] !== null && isFinite(Number(iv[key]))) {
				var limit = Number(ta[base + 'Limit']);
				var nextValue = Number(iv[key]);
				if (isFinite(limit) && limit >= 0) nextValue = J.clamp(nextValue, 0, limit);
				ta[base + 'Current'] = nextValue;
				if (!exChanged) J._updateBalanceFeatureExhaustState(ta, fd.name);
			}
			if (exChanged && iv[exKey] !== undefined && iv[exKey] !== null) {
				ta[base + 'Exhausted'] = !!iv[exKey];
			}
		}
	};

	J.forceStopTimedAttack = function(ta) {
		if (!ta || !ta._notPressed) return;
		try {
			var type = ta._item && ta._item.type ? String(ta._item.type).trim().toLowerCase() : '';
			if (type === 'mash' && ta._jakeFinishMash) {
				ta._jakeFinishMash('stop');
				return;
			}
			if (type === 'balance' && ta._jakeFinishBalance) {
				ta._jakeFinishBalance();
				return;
			}
			if (type === J._xtaBarTypeId && ta._jDefaultMode === 'custom hitzones' && ta._jakeFinalizeDefaultCustom) {
				ta._jakeFinalizeDefaultCustom(true);
				return;
			}
		} catch (e) {
		}

		var estimated = ta._jakeEstimateCurrentPower ? ta._jakeEstimateCurrentPower() : 0;
		ta.setPower(J.copyTasPower(estimated));
		if (J.setTasTimeLeftFromFrames) {
			var framesLeft = ta._jakeCurrentFramesLeft ? ta._jakeCurrentFramesLeft() : 0;
			J.setTasTimeLeftFromFrames(framesLeft);
		}
		ta._notPressed = false;
		ta._flashTime = Math.max(Number(ta._flashTime || 0), Number(ta._time || 45));
	};

	J.applyParXtaControlsToTA = function(ta) {
		if (!ta || !ta._jParXControlIndex) return;
		var control = J.getParXtaControlEntry(ta._jParXControlIndex);
		if (!control) return;
		ta._jXTADisabledControl = !!control.disabledControl;
		if (J._isBalanceTa(ta)) J._applyBalanceVarsFromControl(ta, control);
		if (control.stopped && ta._notPressed) {
			J.forceStopTimedAttack(ta);
		}
	};

	J.syncParXtaControlsFromTA = function(ta) {
		if (!ta || !ta._jParXControlIndex) return;
		var control = J.getParXtaControlEntry(ta._jParXControlIndex);
		if (!control) return;
		if (J._isBalanceTa(ta)) J._syncBalanceVarsToControl(ta, control);
	};

	J.ensureParXtaStorage = function() {
		if (!$gameTemp) return;
		if (!Array.isArray($gameTemp.parXTAs)) $gameTemp.parXTAs = [null];
		if (!Array.isArray($gameTemp.parXTAControls)) $gameTemp.parXTAControls = [null];
		var targetLen = Math.max($gameTemp.parXTAs.length, $gameTemp.parXTAControls.length, 1);
		while ($gameTemp.parXTAs.length < targetLen) $gameTemp.parXTAs.push(null);
		while ($gameTemp.parXTAControls.length < targetLen) $gameTemp.parXTAControls.push(null);
		if (!$gameTemp._jParXTANextIndex || $gameTemp._jParXTANextIndex < 1) {
			$gameTemp._jParXTANextIndex = Math.max(1, targetLen);
		}
	};

	J.makeParXtaControlEntry = function() {
		var vars = {
			stab: 0,
			boost: 0,
			focus: 0,
			stick: 0,
			nitro: 0,
			concentrate: 0,
			freeze: 0,
			exh_boo: false,
			exh_foc: false,
			exh_sti: false,
			exh_nit: false,
			exh_con: false,
			exh_fre: false
		};
		return {
			stopped: false,
			disabledControl: false,
			individualVariables: J.deepClone ? J.deepClone(vars) : JSON.parse(JSON.stringify(vars)),
			_jMirror: J.deepClone ? J.deepClone(vars) : JSON.parse(JSON.stringify(vars))
		};
	};

	J.normalizeParXtaControlEntry = function(entry) {
		var out = entry || J.makeParXtaControlEntry();
		out.stopped = !!out.stopped;
		out.disabledControl = !!out.disabledControl;
		if (!out.individualVariables || typeof out.individualVariables !== 'object') {
			out.individualVariables = {};
		}
		var defaults = J.makeParXtaControlEntry().individualVariables;
		for (var k in defaults) {
			if (!defaults.hasOwnProperty(k)) continue;
			if (out.individualVariables[k] === undefined) out.individualVariables[k] = defaults[k];
		}
		if (!out._jMirror || typeof out._jMirror !== 'object') out._jMirror = {};
		for (var mk in defaults) {
			if (!defaults.hasOwnProperty(mk)) continue;
			if (out._jMirror[mk] === undefined) out._jMirror[mk] = out.individualVariables[mk];
		}
		return out;
	};

	J.getParXtaControlEntry = function(index) {
		J.ensureParXtaStorage();
		if (!$gameTemp || !Array.isArray($gameTemp.parXTAControls) || index <= 0) return null;
		var entry = $gameTemp.parXTAControls[index];
		if (!entry) {
			entry = J.makeParXtaControlEntry();
			$gameTemp.parXTAControls[index] = entry;
		}
		return J.normalizeParXtaControlEntry(entry);
	};

	J.clearXTAResults = function() {
		if (!J.isXParallelModuleEnabled()) return false;
		if (!$gameTemp) return true;
		$gameTemp.parXTAs = [null];
		$gameTemp.parXTAControls = [null];
		$gameTemp._jParXTANextIndex = 1;
		return true;
	};

	J.createParXtaEntry = function(skillId, runId) {
		J.ensureParXtaStorage();
		if (!$gameTemp) return 0;
		var idx = $gameTemp._jParXTANextIndex;
		$gameTemp._jParXTANextIndex++;
		$gameTemp.parXTAs[idx] = {
			skillId: skillId,
			runId: runId,
			finished: false,
			tas_power: 0,
			tas_frames_left: 0,
			tas_seconds_left: 0,
			qte_power: 0,
			qte_frames_left: 0,
			qte_seconds_left: 0,
			current_power: 0,
			current_frames_left: 0,
			current_seconds_left: 0
		};
		$gameTemp.parXTAControls[idx] = J.normalizeParXtaControlEntry($gameTemp.parXTAControls[idx]);
		return idx;
	};

	J._isRunEntryActive = function(runId) {
        var run = J._taRuns[runId];
        if (!run || !run.active) return false;
        if (!run.tas) {
                run.active = false;
                run.finished = true;
                return false;
        }
        if (!run.tas.parent && run.tas._window && run.tas._window.openness <= 0) {
                J.finishTARun(run.id || runId, run.tas);
                return false;
        }
        return true;
};

J.isRunActive = function(runId) {
        return J._isRunEntryActive(runId);
};
	J.isGroupActive = function(groupId) {
        if (!groupId) return false;
        for (var id in J._taRuns) {
                if (!J._taRuns.hasOwnProperty(id)) continue;
                var run = J._taRuns[id];
                if (!run || run.groupId !== groupId) continue;
                if (J._isRunEntryActive(id)) return true;
        }
        return false;
};
	J.hasActiveXtas = function() {
        for (var id in J._taRuns) {
                if (!J._taRuns.hasOwnProperty(id)) continue;
                var run = J._taRuns[id];
                if (!run || !run.isXTA) continue;
                if (J._isRunEntryActive(id)) return true;
        }
        return false;
};
	J.getCurrentInterpreter = function() {
		if (J._activeInterpreter && J._activeInterpreter.setWaitMode) return J._activeInterpreter;
		if (typeof $gameTroop !== 'undefined' && $gameTroop && $gameTroop._interpreter && $gameTroop._interpreter.isRunning && $gameTroop._interpreter.isRunning()) {
			return $gameTroop._interpreter;
		}
		if (typeof $gameMap !== 'undefined' && $gameMap && $gameMap._interpreter && $gameMap._interpreter.isRunning && $gameMap._interpreter.isRunning()) {
			return $gameMap._interpreter;
		}
		return null;
	};

	J.requestInterpreterWaitRun = function(runId) {
		var it = J.getCurrentInterpreter();
		if (!it || !it.setWaitMode) return;
		it._jakeTAWaitRunId = runId;
		it.setWaitMode('jake_ta_run');
	};

	J.requestInterpreterWaitGroup = function(groupId) {
		var it = J.getCurrentInterpreter();
		if (!it || !it.setWaitMode) return;
		it._jakeTAWaitGroupId = groupId;
		it.setWaitMode('jake_ta_group');
	};

	J.requestInterpreterWaitAllXtas = function() {
		var it = J.getCurrentInterpreter();
		if (!it || !it.setWaitMode) return false;
		it.setWaitMode('jake_ta_all');
		return true;
	};

	J.requestInterpreterWaitForceQueue = function(interpreter) {
		var it = interpreter || J.getCurrentInterpreter();
		if (!it || !it.setWaitMode) return false;
		it._jakeTAWaitForceQueue = true;
		it.setWaitMode('jake_ta_force_queue');
		return true;
	};

	if (typeof Game_Interpreter !== 'undefined' && !Game_Interpreter.prototype._jakeTA_v23ScriptScope) {
		Game_Interpreter.prototype._jakeTA_v23ScriptScope = true;
		var _Game_Interpreter_command355_v23 = Game_Interpreter.prototype.command355;
		Game_Interpreter.prototype.command355 = function() {
			var prev = J._activeInterpreter;
			J._activeInterpreter = this;
			try {
				return _Game_Interpreter_command355_v23.call(this);
			} finally {
				J._activeInterpreter = prev;
			}
		};
	}

	if (typeof Game_Interpreter !== 'undefined' && !Game_Interpreter.prototype._jakeTA_v23WaitMode) {
		Game_Interpreter.prototype._jakeTA_v23WaitMode = true;
		var _Game_Interpreter_updateWaitMode_v23 = Game_Interpreter.prototype.updateWaitMode;
		Game_Interpreter.prototype.updateWaitMode = function() {
			if (this._waitMode === 'jake_ta_run') {
				var runActive = J.isRunActive(this._jakeTAWaitRunId);
				if (!runActive) this._jakeTAWaitRunId = 0;
				return runActive;
			}
			if (this._waitMode === 'jake_ta_force_queue') {
				if (J._startNextQueuedForceTA) J._startNextQueuedForceTA();
				var forceActive = J._isForceTAActive ? J._isForceTAActive() : false;
				var forcePending = J._hasPendingForceTAQueue ? J._hasPendingForceTAQueue() : false;
				var forceWaiting = forceActive || forcePending;
				if (!forceWaiting) this._jakeTAWaitForceQueue = false;
				return forceWaiting;
			}
			if (this._waitMode === 'jake_ta_group') {
				var groupActive = J.isGroupActive(this._jakeTAWaitGroupId);
				if (!groupActive) this._jakeTAWaitGroupId = 0;
				return groupActive;
			}
			if (this._waitMode === 'jake_ta_all') {
				return J.hasActiveXtas();
			}
			return _Game_Interpreter_updateWaitMode_v23.call(this);
		};
	}

	if (typeof Game_Temp !== 'undefined') {
		var _Game_Temp_initialize_v23_par = Game_Temp.prototype.initialize;
		Game_Temp.prototype.initialize = function() {
			_Game_Temp_initialize_v23_par.call(this);
			if (!Array.isArray(this.parXTAs)) this.parXTAs = [null];
			if (!Array.isArray(this.parXTAControls)) this.parXTAControls = [null];
			var targetLen = Math.max(this.parXTAs.length, this.parXTAControls.length, 1);
			while (this.parXTAs.length < targetLen) this.parXTAs.push(null);
			while (this.parXTAControls.length < targetLen) this.parXTAControls.push(null);
			if (!this._jParXTANextIndex || this._jParXTANextIndex < 1) this._jParXTANextIndex = Math.max(1, this.parXTAs.length);
		};
	}

	J.makeForceTABattleContext = function() {
        if (typeof BattleManager === 'undefined' || !BattleManager) return null;

        var backup = {
                subject: BattleManager._subject,
                targets: BattleManager._targets,
                spriteset: BattleManager._spriteset
        };

        var inBattle = !!($gameParty && $gameParty.inBattle && $gameParty.inBattle());
        var dummyActor = {
                index: function() { return 0; },
                isActor: function() { return true; },
                isEnemy: function() { return false; },
                currentAction: function() { return null; },
                screenX: function() { return Graphics.width / 2; },
                screenY: function() { return Graphics.height / 2; },
                actorId: function() { return 0; },
                enemyId: function() { return 0; }
        };
        var dummyEnemy = {
                index: function() { return 0; },
                isActor: function() { return false; },
                isEnemy: function() { return true; },
                currentAction: function() { return null; },
                screenX: function() { return Graphics.width / 2; },
                screenY: function() { return Graphics.height / 2; },
                actorId: function() { return 0; },
                enemyId: function() { return 0; }
        };

        var subject = BattleManager._subject;
        var subjectValid = subject && typeof subject.index === 'function' && typeof subject.isActor === 'function' && typeof subject.isEnemy === 'function';
        if (!subjectValid) {
                if (inBattle && $gameParty && $gameParty.members && $gameParty.members().length > 0) subject = $gameParty.members()[0];
                if ((!subject || typeof subject.isEnemy !== 'function') && inBattle && $gameTroop && $gameTroop.members && $gameTroop.members().length > 0) subject = $gameTroop.members()[0];
                if (!subject || typeof subject.index !== 'function' || typeof subject.isActor !== 'function' || typeof subject.isEnemy !== 'function') subject = dummyActor;
                BattleManager._subject = subject;
        }

        var targetsOk = Array.isArray(BattleManager._targets) && BattleManager._targets.length > 0;
        if (targetsOk) {
                for (var i = 0; i < BattleManager._targets.length; i++) {
                        var t = BattleManager._targets[i];
                        if (!t || typeof t.isEnemy !== 'function') {
                                targetsOk = false;
                                break;
                        }
                }
        }
        if (!targetsOk) {
                if (inBattle && subject && typeof subject.isEnemy === 'function') BattleManager._targets = [subject];
                else BattleManager._targets = [dummyEnemy];
        }

        if (!BattleManager._spriteset) BattleManager._spriteset = {};
        if (!BattleManager._spriteset._actorSprites || !BattleManager._spriteset._actorSprites.length) {
                BattleManager._spriteset._actorSprites = [{x: Graphics.width / 2, y: Graphics.height / 2, width: 48, height: 48, _actor: null}];
        }
        if (!BattleManager._spriteset._enemySprites || !BattleManager._spriteset._enemySprites.length) {
                BattleManager._spriteset._enemySprites = [{height: 48}];
        }

        return backup;
};
J.makeForceTABattleContext._jakeForceTAContextV23TailSafe = true;
	J.restoreForceTABattleContext = function(backup) {
		if (!backup || typeof BattleManager === 'undefined' || !BattleManager) return;
		BattleManager._subject = backup.subject;
		BattleManager._targets = backup.targets;
		BattleManager._spriteset = backup.spriteset;
	};

	J.captureParXtaResults = function(index, ta) {
		if (!$gameTemp || !Array.isArray($gameTemp.parXTAs) || index <= 0) return;
		var entry = $gameTemp.parXTAs[index];
		if (!entry) return;
		var control = J.getParXtaControlEntry ? J.getParXtaControlEntry(index) : null;

		entry.tas_power = J.copyTasPower($gameTemp.tas_power);
		entry.tas_frames_left = Math.max(0, Math.floor(Number($gameTemp.tas_frames_left || 0)));
		entry.tas_seconds_left = Math.max(0, Math.floor(Number($gameTemp.tas_seconds_left || 0)));
		entry.qte_power = J.copyTasPower($gameTemp.qte_power);
		entry.qte_frames_left = Math.max(0, Math.floor(Number($gameTemp.qte_frames_left || 0)));
		entry.qte_seconds_left = Math.max(0, Math.floor(Number($gameTemp.qte_seconds_left || 0)));
		entry.current_power = J.copyTasPower(entry.tas_power);
		entry.current_frames_left = entry.tas_frames_left;
		entry.current_seconds_left = entry.tas_seconds_left;
		entry.finished = true;
		if (control) control.stopped = true;
		if (ta) entry.type = ta._item ? ta._item.type : '';
	};

	J.finishTARun = function(runId, ta) {
		var run = J._taRuns[runId];
		if (!run) return;
		run.active = false;
		run.finished = true;
		run.tas = null;
		if (run.parIndex > 0) {
			J.captureParXtaResults(run.parIndex, ta);
		}
		if (!run.isXTA && Number(J._forceTAActiveRunId || 0) === Number(runId)) {
			J._forceTAActiveRunId = 0;
			if (J._startNextQueuedForceTA) J._startNextQueuedForceTA();
		}
	};

	J.toSkillIdArray = function(input) {
		if (Array.isArray(input)) {
			var out = [];
			for (var i = 0; i < input.length; i++) {
				var id = parseInt(input[i]);
				if (!isNaN(id) && id > 0) out.push(id);
			}
			return out;
		}

		var s = String(input || '').trim();
		if (!s.length) return [];

		if (s.charAt(0) === '[' && s.charAt(s.length - 1) === ']') {
			try {
				var arr = JSON.parse(s);
				return J.toSkillIdArray(arr);
			} catch (e) {
			}
		}

		return J.toSkillIdArray(s.split(','));
	};

	J.startForcedTA = function(skillId, tempNotesTA, options) {
		var opts = options || {};
		var sid = (skillId === undefined || skillId === null) ? 1 : parseInt(skillId);
		if (isNaN(sid) || sid <= 0) sid = 1;

		if (!$dataSkills || !$dataSkills[sid]) return null;
		var skill = $dataSkills[sid];
		if (!skill.meta || !skill.meta['SRD TAS']) return null;
		if (!SceneManager || !SceneManager._scene || !SceneManager._scene.addChild) return null;

		var taData = J.deepClone(skill.meta['SRD TAS']);
		J.applyXtaEvalTimingProps(taData, '', true);
		if (tempNotesTA !== undefined && tempNotesTA !== null && String(tempNotesTA).trim().length > 0) {
			var tempNotes = String(tempNotesTA);
			if ($gameMap && $gameMap.NotesProcChangeTA) {
				$gameMap.NotesProcChangeTA(taData, tempNotes);
			} else {
				J.applyExtendedProps(taData, tempNotes, true);
			}
		}
		taData.jakeNoSkillUse = true;

		var tas = new TimedAttackSystem(0, 0);
		tas._jForceTAStandalone = true;
		tas._jForceTASkill = skill;
		tas._jForceTABattleBackup = J.makeForceTABattleContext();

		var runId = J._taRunSeq++;
		var run = {
			id: runId,
			skillId: sid,
			groupId: opts.groupId || 0,
			isXTA: !!opts.isXTA,
			active: true,
			finished: false,
			parIndex: 0,
			tas: tas
		};

		if (run.isXTA) {
			run.parIndex = J.createParXtaEntry(sid, runId);
			tas._jParXResultIndex = run.parIndex;
			tas._jParXControlIndex = run.parIndex;
			tas._jXTAInputReadOnly = true;
			tas._jInputReadPos = 0;
		}

		tas._jRunId = runId;
		J._taRuns[runId] = run;

		J._insertForcedTaIntoScene(SceneManager._scene, tas);
		tas.setItem(taData);
		tas.open();
		tas.start();
		J._ensureStateIconTooltipOnTop();
		return run;
	};

	J._hasPendingForceTAQueue = function() {
		return Array.isArray(J._forceTAQueue) && J._forceTAQueue.length > 0;
	};

	J._isForceTAActive = function() {
		if (!J._forceTAActiveRunId) return false;
		if (J.isRunActive(J._forceTAActiveRunId)) return true;
		J._forceTAActiveRunId = 0;
		return false;
	};

	J._startNextQueuedForceTA = function() {
		if (J._isForceTAActive()) return true;
		if (!Array.isArray(J._forceTAQueue)) J._forceTAQueue = [];

		while (J._forceTAQueue.length > 0) {
			var req = J._forceTAQueue.shift();
			if (!req) continue;
			var run = J.startForcedTA(req.skillId, req.tempNotesTA, {isXTA:false});
			if (!run) continue;
			J._forceTAActiveRunId = run.id;
			return true;
		}

		J._forceTAActiveRunId = 0;
		return false;
	};

	J.forceTA = function(skillId, tempNotesTA) {
		if (!Array.isArray(J._forceTAQueue)) J._forceTAQueue = [];
		J._forceTAQueue.push({
			skillId: skillId,
			tempNotesTA: tempNotesTA
		});
		J.requestInterpreterWaitForceQueue();
		J._startNextQueuedForceTA();
		return J._isForceTAActive() || J._hasPendingForceTAQueue();
	};

	J.parallelTA = function(skillId, tempNotesTA) {
		if (!J.isXParallelModuleEnabled()) return false;
		return !!J.startForcedTA(skillId, tempNotesTA, {isXTA:false});
	};

	J.parallelXTAs = function(skillIds, waitMode) {
		if (!J.isXParallelModuleEnabled()) return 0;
		var ids = J.toSkillIdArray(skillIds);
		if (!ids.length) return 0;

		var groupId = J._xtaGroupSeq++;
		J._currentXtaGroup = groupId;

		var started = 0;
		for (var i = 0; i < ids.length; i++) {
			var run = J.startForcedTA(ids[i], null, {isXTA:true, groupId:groupId});
			if (run) started++;
		}

		if (waitMode === true) {
			J.requestInterpreterWaitGroup(groupId);
		}

		return started;
	};

	J.addParXTA = function(skillId, tempNotesTA, waitMode) {
		if (!J.isXParallelModuleEnabled()) return false;
		if (!J._currentXtaGroup || !J.isGroupActive(J._currentXtaGroup)) {
			J._currentXtaGroup = J._xtaGroupSeq++;
		}

		var run = J.startForcedTA(skillId, tempNotesTA, {isXTA:true, groupId:J._currentXtaGroup});
		if (!run) return false;

		if (waitMode === true) {
			J.requestInterpreterWaitRun(run.id);
		}

		return true;
	};

	J.waitXTA = function() {
		if (!J.isXParallelModuleEnabled()) return false;
		if (!J.hasActiveXtas()) return false;
		return J.requestInterpreterWaitAllXtas();
	};

	J.logXTAs = function(enabled) {
		if (!J.isXParallelModuleEnabled()) {
			J._logXTAsEnabled = false;
			return false;
		}
		J._logXTAsEnabled = (enabled === undefined) ? false : !!enabled;
		return J._logXTAsEnabled;
	};

	if (typeof globalThis !== 'undefined') {
		globalThis.forceTA = function(skillId, tempNotesTA) {
			return J.forceTA(skillId, tempNotesTA);
		};
		globalThis.parallelTA = function(skillId, tempNotesTA) {
			return J.parallelTA(skillId, tempNotesTA);
		};
		globalThis.parallelXTAs = function(skillIds, waitMode) {
			return J.parallelXTAs(skillIds, waitMode === true);
		};
		globalThis.addParXTA = function(skillId, tempNotesTA, waitMode) {
			return J.addParXTA(skillId, tempNotesTA, waitMode === true);
		};
		globalThis.waitXTA = function() {
			return J.waitXTA();
		};
		globalThis.clearXTAResults = function() {
			return J.clearXTAResults();
		};
		globalThis.logXTAs = function(enabled) {
			return J.logXTAs(enabled);
		};
	}

	var _jApplyDefaultProps_v23 = J.applyDefaultProps;
	J.applyDefaultProps = function(o, source, semicolonMode) {
		_jApplyDefaultProps_v23.call(this, o, source, semicolonMode);
		if (!o || o.type !== SRD.TimedAttack.TAS_ID) return;

		var v = J.getValue(source, 'Shape', semicolonMode);
		if (v !== null) o.jakeBarShape = String(v).trim().toLowerCase();
		else if (o.jakeBarShape === undefined) o.jakeBarShape = String(o.shape || 'rectangle').trim().toLowerCase();

		if (!o.jakeRandomMovementPools) o.jakeRandomMovementPools = {};
		for (var p = 1; p <= 100; p++) {
			v = J.getValue(source, 'Random[ ]?Movement[ ]?' + p, semicolonMode);
			if (v !== null) o.jakeRandomMovementPools[p] = J.parseMovementSequence(v);
		}

		if (!o.jakeHitzones) o.jakeHitzones = J.defaultHitzones();
		for (var i = 1; i <= 20; i++) {
			v = J.getValue(source, 'Hitzone[ ]?Movement[ ]?' + i, semicolonMode);
			if (v !== null) {
				if (!o.jakeHitzones[i - 1]) o.jakeHitzones[i - 1] = J.parseHitzone('');
				o.jakeHitzones[i - 1].moveSequence = J.parseMovementSequence(v);
			}
		}
	};

	J.applyXtaEvalTimingProps = function(o, source, semicolonMode) {
		if (!o) return;
		var type = String(o.type || '').trim().toLowerCase();
		var barType = J._xtaBarTypeId;

		if (type === barType || type === 'circle' || type === 'clock') {
			var hitCode = J._readEvalTimingCode(source, 'ET[ ]*On[ ]*Hit', semicolonMode, J._xtaEvalDefaults.onHit);
			if (hitCode.length || o.jakeEtOnHit === undefined) o.jakeEtOnHit = hitCode;
		}

		if (type === 'mash') {
			var mashCode = J._readEvalTimingCode(source, 'ET[ ]*On[ ]*Valid[ ]*Mash', semicolonMode, J._xtaEvalDefaults.onValidMash);
			if (mashCode.length || o.jakeEtOnValidMash === undefined) o.jakeEtOnValidMash = mashCode;
		}

		if (type === 'arrows') {
			var arrowCode = J._readEvalTimingCode(source, 'ET[ ]*On[ ]*Key[ ]*press', semicolonMode, J._xtaEvalDefaults.onKeyPress);
			if (arrowCode.length || o.jakeEtOnKeyPress === undefined) o.jakeEtOnKeyPress = arrowCode;
		}

		if (type === 'balance') {
			var startCode = J._readEvalTimingCode(source, 'ET[ ]*On[ ]*Key[ ]*Hold[ ]*start', semicolonMode, J._xtaEvalDefaults.onKeyHoldStart);
			if (startCode.length || o.jakeEtOnKeyHoldStart === undefined) o.jakeEtOnKeyHoldStart = startCode;

			var endCode = J._readEvalTimingCode(source, 'ET[ ]*On[ ]*Key[ ]*Hold[ ]*end', semicolonMode, J._xtaEvalDefaults.onKeyHoldEnd);
			if (endCode.length || o.jakeEtOnKeyHoldEnd === undefined) o.jakeEtOnKeyHoldEnd = endCode;

			var onEnterBal = J._readIndexedEvalTimingCodes(source, 'ET[ ]*On[ ]*Enter[ ]*Balance[ ]*Area', 100, semicolonMode);
			if (Object.keys(onEnterBal).length > 0 || o.jakeEtOnEnterBalanceArea === undefined) o.jakeEtOnEnterBalanceArea = onEnterBal;

			var onExitBal = J._readIndexedEvalTimingCodes(source, 'ET[ ]*On[ ]*Exit[ ]*Balance[ ]*Area', 100, semicolonMode);
			if (Object.keys(onExitBal).length > 0 || o.jakeEtOnExitBalanceArea === undefined) o.jakeEtOnExitBalanceArea = onExitBal;

			var whileBal = J._readIndexedEvalTimingCodes(source, 'ET[ ]*While[ ]*In[ ]*Balance[ ]*Area', 100, semicolonMode);
			if (Object.keys(whileBal).length > 0 || o.jakeEtWhileInBalanceArea === undefined) o.jakeEtWhileInBalanceArea = whileBal;

			if (o.jakeEtOnEnterBalanceAreaDefault === undefined) o.jakeEtOnEnterBalanceAreaDefault = J._xtaEvalDefaults.onEnterBalanceArea;
			if (o.jakeEtOnExitBalanceAreaDefault === undefined) o.jakeEtOnExitBalanceAreaDefault = J._xtaEvalDefaults.onExitBalanceArea;
			if (o.jakeEtWhileInBalanceAreaDefault === undefined) o.jakeEtWhileInBalanceAreaDefault = J._xtaEvalDefaults.whileInBalanceArea;
		}

		if (type === barType) {
			var onEnterHz = J._readIndexedEvalTimingCodes(source, 'ET[ ]*On[ ]*Enter[ ]*Hitzone[ ]*Area', 100, semicolonMode);
			if (Object.keys(onEnterHz).length > 0 || o.jakeEtOnEnterHitzoneArea === undefined) o.jakeEtOnEnterHitzoneArea = onEnterHz;

			var onExitHz = J._readIndexedEvalTimingCodes(source, 'ET[ ]*On[ ]*Exit[ ]*Hitzone[ ]*Area', 100, semicolonMode);
			if (Object.keys(onExitHz).length > 0 || o.jakeEtOnExitHitzoneArea === undefined) o.jakeEtOnExitHitzoneArea = onExitHz;

			var whileHz = J._readIndexedEvalTimingCodes(source, 'ET[ ]*While[ ]*In[ ]*Hitzone[ ]*Area', 100, semicolonMode);
			if (Object.keys(whileHz).length > 0 || o.jakeEtWhileInHitzoneArea === undefined) o.jakeEtWhileInHitzoneArea = whileHz;

			if (o.jakeEtOnEnterHitzoneAreaDefault === undefined) o.jakeEtOnEnterHitzoneAreaDefault = J._xtaEvalDefaults.onEnterHitzoneArea;
			if (o.jakeEtOnExitHitzoneAreaDefault === undefined) o.jakeEtOnExitHitzoneAreaDefault = J._xtaEvalDefaults.onExitHitzoneArea;
			if (o.jakeEtWhileInHitzoneAreaDefault === undefined) o.jakeEtWhileInHitzoneAreaDefault = J._xtaEvalDefaults.whileInHitzoneArea;
		}
	};

	var _jApplyExtendedProps_v23_xparallelEt = J.applyExtendedProps;
	J.applyExtendedProps = function(o, source, semicolonMode) {
		_jApplyExtendedProps_v23_xparallelEt.call(this, o, source, semicolonMode);
		J.applyXtaEvalTimingProps(o, source, semicolonMode);
	};

	J.getIndexedEtCode = function(mapObj, index, fallbackCode) {
		var idx = Math.max(1, parseInt(index) || 1);
		var map = (mapObj && typeof mapObj === 'object') ? mapObj : {};
		var code = map[idx];
		if (code === undefined || code === null || !String(code).trim().length) {
			return J.normalizeEvalCode(fallbackCode);
		}
		return J.normalizeEvalCode(code);
	};

	J._buildBalanceEvalVars = function(ta, extraVars) {
		var vars = {
			stab: Number(ta._jBalanceStability || 0),
			boost: Number(ta._jBalanceBoostCurrent || 0),
			focus: Number(ta._jBalanceFocusCurrent || 0),
			stick: Number(ta._jBalanceStickCurrent || 0),
			nitro: Number(ta._jBalanceNitroCurrent || 0),
			concentrate: Number(ta._jBalanceConcentrateCurrent || 0),
			freeze: Number(ta._jBalanceFreezeCurrent || 0),
			exh_boo: !!ta._jBalanceBoostExhausted,
			exh_foc: !!ta._jBalanceFocusExhausted,
			exh_sti: !!ta._jBalanceStickExhausted,
			exh_nit: !!ta._jBalanceNitroExhausted,
			exh_con: !!ta._jBalanceConcentrateExhausted,
			exh_fre: !!ta._jBalanceFreezeExhausted,
			cursorPosition: Number(ta._jBalanceCursorX || 0)
		};
		if (extraVars && typeof extraVars === 'object') {
			for (var k in extraVars) {
				if (!extraVars.hasOwnProperty(k)) continue;
				vars[k] = extraVars[k];
			}
		}
		return vars;
	};

	J._applyBalanceEvalVars = function(ta, vars, preserveExhaustBooleans) {
		if (!ta || !vars || typeof vars !== 'object') return;
		if (vars.stab !== undefined && vars.stab !== null && isFinite(Number(vars.stab))) {
			ta._jBalanceStability = J.clamp(Number(vars.stab), 0, Math.max(1, Number(ta._jBalanceMaxStability || 1)));
		}
		if (vars.cursorPosition !== undefined && vars.cursorPosition !== null && isFinite(Number(vars.cursorPosition))) {
			ta._jBalanceCursorX = J.clamp(Number(vars.cursorPosition), 0, Math.max(0, Number(ta._jBalanceWidth || 0)));
		}

		for (var i = 0; i < J._xtaBalanceFeatureDefs.length; i++) {
			var fd = J._xtaBalanceFeatureDefs[i];
			var key = fd.name.toLowerCase();
			var base = '_jBalance' + fd.name;
			if (vars[key] !== undefined && vars[key] !== null && isFinite(Number(vars[key]))) {
				var limit = Number(ta[base + 'Limit']);
				var value = Number(vars[key]);
				if (isFinite(limit) && limit >= 0) value = J.clamp(value, 0, limit);
				ta[base + 'Current'] = value;
				if (!preserveExhaustBooleans) J._updateBalanceFeatureExhaustState(ta, fd.name);
			}
			var exhKey = 'exh_' + fd.short;
			if (vars[exhKey] !== undefined && vars[exhKey] !== null) {
				ta[base + 'Exhausted'] = !!vars[exhKey];
			}
		}
	};

	J._balanceRoleToKeyProp = {
		leftMove: '_jBalanceLeftKey',
		rightMove: '_jBalanceRightKey',
		boost: '_jBalanceBoostKey',
		focus: '_jBalanceFocusKey',
		stick: '_jBalanceStickKey',
		nitro: '_jBalanceNitroKey',
		concentrate: '_jBalanceConcentrateKey',
		freeze: '_jBalanceFreezeKey'
	};

	J._balanceRoleList = ['leftMove', 'rightMove', 'boost', 'focus', 'stick', 'nitro', 'concentrate', 'freeze'];

	J.normalizeBalanceRoleName = function(roleName) {
		var s = String(roleName || '').trim();
		if (!s.length) return '';
		for (var i = 0; i < J._balanceRoleList.length; i++) {
			if (s.toLowerCase() === J._balanceRoleList[i].toLowerCase()) return J._balanceRoleList[i];
		}
		return '';
	};

	J._setBalanceRoleKeyCode = function(ta, roleName, keyCode) {
		var prop = J._balanceRoleToKeyProp[roleName];
		if (!prop) return;
		ta[prop] = (keyCode === null || keyCode === undefined) ? null : Number(keyCode);
	};

	J._ensureBalanceRoleTracking = function(ta) {
		if (!ta || ta._jXtaBalanceRoleTrackingReady) return;
		ta._jXtaBalanceRoleTrackingReady = true;
		ta._jXtaBalanceBaseRoleCode = {};
		ta._jXtaBalanceRoleByCode = {};
		ta._jXtaBalancePrevPressed = {};
		ta._jXtaBalanceRedirectByCode = {};

		for (var i = 0; i < J._balanceRoleList.length; i++) {
			var role = J._balanceRoleList[i];
			var prop = J._balanceRoleToKeyProp[role];
			var code = ta[prop];
			if (code === null || code === undefined || isNaN(parseInt(code))) {
				ta._jXtaBalanceBaseRoleCode[role] = null;
				continue;
			}
			code = parseInt(code);
			ta._jXtaBalanceBaseRoleCode[role] = code;
			if (ta._jXtaBalanceRoleByCode[code] === undefined) ta._jXtaBalanceRoleByCode[code] = role;
			ta._jXtaBalancePrevPressed[code] = false;
		}
	};

	J._restoreBalanceRoleCodes = function(ta) {
		if (!ta || !ta._jXtaBalanceBaseRoleCode) return;
		for (var i = 0; i < J._balanceRoleList.length; i++) {
			var role = J._balanceRoleList[i];
			J._setBalanceRoleKeyCode(ta, role, ta._jXtaBalanceBaseRoleCode[role]);
		}
	};

	J._applyBalanceRoleRedirects = function(ta) {
		if (!ta || !ta._jXtaBalanceRedirectByCode) return;
		for (var codeKey in ta._jXtaBalanceRedirectByCode) {
			if (!ta._jXtaBalanceRedirectByCode.hasOwnProperty(codeKey)) continue;
			var targetRole = J.normalizeBalanceRoleName(ta._jXtaBalanceRedirectByCode[codeKey]);
			if (!targetRole) continue;
			var code = Number(codeKey);
			var sourceRole = ta._jXtaBalanceRoleByCode[code];
			if (sourceRole && sourceRole !== targetRole) {
				if (Number(ta[J._balanceRoleToKeyProp[sourceRole]]) === code) J._setBalanceRoleKeyCode(ta, sourceRole, null);
				J._setBalanceRoleKeyCode(ta, targetRole, code);
			}
		}
	};

	J._runBalanceHoldEval = function(ta, code, roleName, allowRoleWrite) {
		if (!code || !String(code).trim().length) return roleName;
		var vars = J._buildBalanceEvalVars(ta, {keyPressed: roleName});
		J.runXtaEvalCode(ta, code, vars);
		J._applyBalanceEvalVars(ta, vars, true);
		if (!allowRoleWrite) return roleName;
		var nextRole = J.normalizeBalanceRoleName(vars.keyPressed);
		return nextRole || roleName;
	};

	if (!J._jakeHitzoneMetricsMoveOffsetWrapped) {
        var _jGetHitzoneMetrics_v23 = J.getHitzoneMetrics;
        J.getHitzoneMetrics = function(zone, totalWidth) {
                var m = _jGetHitzoneMetrics_v23.call(this, zone, totalWidth);
                if (!m) return m;
                m.center += J.toNumber(zone ? zone._jMoveOffsetX : 0, 0);
                return m;
        };
        J._jakeHitzoneMetricsMoveOffsetWrapped = true;
}
	TimedAttackSystem.prototype._jakeInitDefaultHitzoneMovements = function() {
		if (!this._jHitzones || !this._jHitzones.length) return;
		var pools = this._jBarRandomMovementPools || {};
		for (var i = 0; i < this._jHitzones.length; i++) {
			var z = this._jHitzones[i];
			if (!z) continue;
			z._jMoveOffsetX = 0;
			z._jMoveState = J.createMovementState(z.moveSequence || [], pools);
		}
	};

	TimedAttackSystem.prototype._jakeUpdateDefaultHitzoneMovements = function() {
		if (!this._jHitzones || !this._jHitzones.length) return;
		for (var i = 0; i < this._jHitzones.length; i++) {
			var z = this._jHitzones[i];
			if (!z || !z._jMoveState) continue;
			J.stepMovementState(z._jMoveState, z, '_jMoveOffsetX');
			z._jMoveOffsetX = J.clampHitzoneOffsetToBar(z, this.windowWidth(), z._jMoveOffsetX);
		}
	};

	var _jRebuildClockTargets_v23 = TimedAttackSystem.prototype._jakeRebuildClockTargets;
	TimedAttackSystem.prototype._jakeRebuildClockTargets = function(item) {
		if (!item || item.type !== 'clock') {
			if (_jRebuildClockTargets_v23) _jRebuildClockTargets_v23.call(this, item);
			return;
		}
		this._targets = [];
		this._targetCount = 0;
		this._setTargets = [];

		var sourceTargets = item._jakeClockRawTargets || item.targets || [];
		for (var i = 0; i < sourceTargets.length; i++) {
			if (!sourceTargets[i] || String(sourceTargets[i]).trim().length === 0) continue;
			var parsed = J.parseClockTarget(sourceTargets[i]);
			if (!parsed) continue;
			this._targets.push(parsed);
			this._targetCount++;
		}
		if (this._targetCount <= 0) this._targetCount = 1;
	};

	var _jLoadItem_v23 = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		if (item && item.type === 'clock' && item.targets && item.targets.length) {
			item._jakeClockRawTargets = item.targets.slice(0);
			for (var i = 0; i < item.targets.length; i++) {
				var raw = item.targets[i];
				if (!raw || String(raw).trim().length === 0) continue;
				var parsed = J.parseClockTarget(raw);
				if (parsed) {
					item.targets[i] = String(parsed[0]) + ', ' + String(parsed[1]) + ', ' + String(parsed[2]) + ', ' + String(parsed[3]);
				} else {
					item.targets[i] = '';
				}
			}
		}

		_jLoadItem_v23.call(this, item);
		if (!item) return;

		if (item.type === SRD.TimedAttack.TAS_ID) {
			this._jBarShape = String(item.jakeBarShape || this._shape || item.shape || '').trim().toLowerCase();
			this._jBarRandomMovementPools = item.jakeRandomMovementPools || {};
		}

		if (item.type === 'clock') {
			this._jakeRebuildClockTargets(item);
		}
	};

	var _jLoadStart_v23 = TimedAttackSystem.prototype.loadStart;
	TimedAttackSystem.prototype.loadStart = function() {
		_jLoadStart_v23.call(this);
		if (this._jXTAInputReadOnly) this._jInputReadPos = 0;
		this._jXTADisabledControl = false;
		this._jXtaPendingCircleEtOnHit = false;
		this._jXtaMashTapRestoreNeeded = false;
		this._jXtaMashTapBackup = undefined;
		this._jXtaClockHitContribs = [];
		this._jXtaBarHitContribs = [null];
		this._jXtaBarAreaInside = {};
		this._jXtaBalanceAreaInside = {};
		this._jXtaBalanceRoleTrackingReady = false;
		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID && this._jDefaultMode === 'custom hitzones') {
			this._jakeInitDefaultHitzoneMovements();
		}
		if (J._isBalanceTa(this)) J._ensureBalanceRoleTracking(this);
	};

	var _jApplyOverlayTransform_v23 = TimedAttackSystem.prototype._jakeApplyOverlayTransform;
	TimedAttackSystem.prototype._jakeApplyOverlayTransform = function(sprite, baseX, baseY, offsetX, offsetY, extraAngle, extraScaleX, extraScaleY, independent) {
		if (!sprite) {
			if (_jApplyOverlayTransform_v23) {
				_jApplyOverlayTransform_v23.call(this, sprite, baseX, baseY, offsetX, offsetY, extraAngle, extraScaleX, extraScaleY, independent);
			}
			return;
		}

		var includeMain = !independent;
		var mainAngle = includeMain ? ((this._angleOffset || 0) * Math.PI / 180) : 0;
		var mainScaleX = includeMain ? ((this._visualScaleX !== undefined) ? this._visualScaleX : 1) : 1;
		var mainScaleY = includeMain ? ((this._visualScaleY !== undefined) ? this._visualScaleY : 1) : 1;
		var cx = this._jVisualCenterX || baseX;
		var cy = this._jVisualCenterY || baseY;

		var px = baseX + (offsetX || 0);
		var py = baseY + (offsetY || 0);
		var p = includeMain ? J.transformPoint(px, py, cx, cy, mainAngle, mainScaleX, mainScaleY) : {x:px, y:py};

		sprite.x = p.x;
		sprite.y = p.y;
		sprite.rotation = mainAngle + ((extraAngle || 0) * Math.PI / 180);
		sprite.scale.x = mainScaleX * ((extraScaleX !== undefined) ? extraScaleX : 1);
		sprite.scale.y = mainScaleY * ((extraScaleY !== undefined) ? extraScaleY : 1);
		sprite.visible = true;
	};

	TimedAttackSystem.prototype._jakeApplyKeysLayerTransform = function(centerX, centerY) {
		this._jakeEnsureKeysLayer();
		var includeMain = !this._jIndependentIcons;
		var mainAngle = includeMain ? ((this._angleOffset || 0) * Math.PI / 180) : 0;
		var mainScaleX = includeMain ? ((this._visualScaleX !== undefined) ? this._visualScaleX : 1) : 1;
		var mainScaleY = includeMain ? ((this._visualScaleY !== undefined) ? this._visualScaleY : 1) : 1;
		var cx = this._jVisualCenterX || centerX;
		var cy = this._jVisualCenterY || centerY;

		var px = centerX + (this._keysXOffset || 0);
		var py = centerY + (this._keysYOffset || 0);
		var p = includeMain ? J.transformPoint(px, py, cx, cy, mainAngle, mainScaleX, mainScaleY) : {x:px, y:py};

		this._jakeKeysLayer.visible = true;
		this._jakeKeysLayer.pivot.x = centerX;
		this._jakeKeysLayer.pivot.y = centerY;
		this._jakeKeysLayer.x = p.x;
		this._jakeKeysLayer.y = p.y;
		this._jakeKeysLayer.rotation = mainAngle + ((this._keysAngle || 0) * Math.PI / 180);
		this._jakeKeysLayer.scale.x = mainScaleX * ((this._keysScaleX !== undefined) ? this._keysScaleX : 1);
		this._jakeKeysLayer.scale.y = mainScaleY * ((this._keysScaleY !== undefined) ? this._keysScaleY : 1);
	};

	TimedAttackSystem.prototype._jakeApplyStopKeyLayerTransform = function(centerX, centerY) {
		this._jakeEnsureStopKeyLayer();
		var includeMain = !this._jIndependentStopKeyIcon;
		var mainAngle = includeMain ? ((this._angleOffset || 0) * Math.PI / 180) : 0;
		var mainScaleX = includeMain ? ((this._visualScaleX !== undefined) ? this._visualScaleX : 1) : 1;
		var mainScaleY = includeMain ? ((this._visualScaleY !== undefined) ? this._visualScaleY : 1) : 1;
		var cx = this._jVisualCenterX || centerX;
		var cy = this._jVisualCenterY || centerY;

		var px = centerX + (this._stopKeyXOffset || 0);
		var py = centerY + (this._stopKeyYOffset || 0);
		var p = includeMain ? J.transformPoint(px, py, cx, cy, mainAngle, mainScaleX, mainScaleY) : {x:px, y:py};

		this._jakeStopKeyLayer.visible = true;
		this._jakeStopKeyLayer.pivot.x = centerX;
		this._jakeStopKeyLayer.pivot.y = centerY;
		this._jakeStopKeyLayer.x = p.x;
		this._jakeStopKeyLayer.y = p.y;
		this._jakeStopKeyLayer.rotation = mainAngle + ((this._stopKeyAngle || 0) * Math.PI / 180);
		this._jakeStopKeyLayer.scale.x = mainScaleX * ((this._stopKeyScaleX !== undefined) ? this._stopKeyScaleX : 1);
		this._jakeStopKeyLayer.scale.y = mainScaleY * ((this._stopKeyScaleY !== undefined) ? this._stopKeyScaleY : 1);
	};

	TimedAttackSystem.prototype._jakeEstimateCurrentPower = function() {
		if (!this._item) return 0;
		if (this._item.type === 'mash') {
			if (this._maxPosition > 0) return J.clamp(this._xPosition / this._maxPosition, 0, 1);
			return 0;
		}
		if (this._item.type === 'arrows') {
			if (this._maxCount > 0) {
				return J.clamp((this._maxCount - this._countDown) / this._maxCount, 0, 1);
			}
			return 0;
		}
		if (this._item.type === SRD.TimedAttack.TAS_ID && this._jDefaultMode === 'custom hitzones') {
			var hd = this._jakeEvaluateDefaultHitData(this._xPosition, this.windowWidth());
			return hd ? hd.sum : 0;
		}
		if (this._item.type === 'clock') {
			return this._jakeResolveClockPower ? this._jakeResolveClockPower() : 0;
		}
		return 0;
	};

	J.peekQueuedInputForTa = function(ta) {
		if (!Input || !Array.isArray(Input._jakeTAKeyQueue)) return null;
		var queue = Input._jakeTAKeyQueue;
		if (ta && ta._jXTAInputReadOnly) {
			var start = Math.max(0, Number(ta._jInputReadPos || 0));
			for (var i = start; i < queue.length; i++) {
				if (queue[i] === null || queue[i] === undefined) continue;
				return {index: i, code: Number(queue[i]), readOnly: true};
			}
			return null;
		}
		for (var j = 0; j < queue.length; j++) {
			if (queue[j] === null || queue[j] === undefined) continue;
			return {index: j, code: Number(queue[j]), readOnly: false};
		}
		return null;
	};

	J.consumeQueuedInputAt = function(ta, index) {
		if (!Input || !Array.isArray(Input._jakeTAKeyQueue)) return null;
		var queue = Input._jakeTAKeyQueue;
		var idx = parseInt(index);
		if (isNaN(idx) || idx < 0 || idx >= queue.length) return null;
		if (queue[idx] === null || queue[idx] === undefined) return null;
		var code = Number(queue[idx]);
		if (ta && ta._jXTAInputReadOnly) {
			ta._jInputReadPos = Math.max(Number(ta._jInputReadPos || 0), idx + 1);
		} else {
			queue[idx] = null;
		}
		return code;
	};

	J._isArrowCodeValidForCommand = function(ta, cmd, code) {
		if (!cmd) return false;
		if (cmd.kind === 'arrow') {
			var codes = (ta && ta._jArrowActionCodes && ta._jArrowActionCodes[cmd.arrowIndex]) ? ta._jArrowActionCodes[cmd.arrowIndex] : [];
			for (var i = 0; i < codes.length; i++) {
				if (Number(codes[i]) === Number(code)) return true;
			}
			return false;
		}
		return Number(code) === Number(cmd.keyCode);
	};

	J._isBarCustomHitzoneTa = function(ta) {
		return !!(ta && ta._item && String(ta._item.type || '').trim().toLowerCase() === J._xtaBarTypeId && ta._jDefaultMode === 'custom hitzones');
	};

	J._rebuildBarOutputsFromContribs = function(ta) {
		if (!ta || !Array.isArray(ta._jXtaBarHitContribs)) return;
		if (String(ta._jBarPowerValue || '').toLowerCase() === 'multiple hits') {
			var hitOut = [0];
			for (var i = 1; i < ta._jXtaBarHitContribs.length; i++) {
				var c = ta._jXtaBarHitContribs[i];
				hitOut[i] = c ? Number(c.sum || 0) : 0;
			}
			ta._jBarHitPowers = hitOut;
			return;
		}

		var zoneCount = ta._jHitzones ? ta._jHitzones.length : 0;
		var zoneOut = [0];
		for (var z = 0; z < zoneCount; z++) zoneOut[z + 1] = 0;
		for (var h = 1; h < ta._jXtaBarHitContribs.length; h++) {
			var contrib = ta._jXtaBarHitContribs[h];
			if (!contrib || !Array.isArray(contrib.zonePowers)) continue;
			for (var zi = 1; zi < contrib.zonePowers.length; zi++) {
				var p = Number(contrib.zonePowers[zi] || 0);
				if (p > zoneOut[zi]) zoneOut[zi] = p;
			}
		}
		ta._jBarZonePowers = zoneOut;
	};

	J._processBarAreaEval = function(ta) {
		if (!J._isBarCustomHitzoneTa(ta)) return;
		if (!ta._notPressed) return;
		var item = ta._item || {};
		var enterMap = item.jakeEtOnEnterHitzoneArea || {};
		var exitMap = item.jakeEtOnExitHitzoneArea || {};
		var whileMap = item.jakeEtWhileInHitzoneArea || {};
		var enterDef = item.jakeEtOnEnterHitzoneAreaDefault || '';
		var exitDef = item.jakeEtOnExitHitzoneAreaDefault || '';
		var whileDef = item.jakeEtWhileInHitzoneAreaDefault || '';
		var hasAnyCode = !!(Object.keys(enterMap).length || Object.keys(exitMap).length || Object.keys(whileMap).length || String(enterDef).trim().length || String(exitDef).trim().length || String(whileDef).trim().length);
		if (!hasAnyCode) return;

		if (!ta._jXtaBarAreaInside) ta._jXtaBarAreaInside = {};
		var totalWidth = ta.windowWidth ? ta.windowWidth() : 0;
		for (var i = 0; i < (ta._jHitzones ? ta._jHitzones.length : 0); i++) {
			var zone = ta._jHitzones[i];
			if (!zone || !zone.initialized) continue;
			var idx = i + 1;
			var inZone = J.evaluateHitzonePower(zone, ta._xPosition, totalWidth) > 0;
			var prev = !!ta._jXtaBarAreaInside[idx];

			var runAreaCode = function(code) {
				var src = J.normalizeEvalCode(code);
				if (!src.length) return;
				var vars = {cursorPosition: Number(ta._xPosition || 0)};
				J.runXtaEvalCode(ta, src, vars);
				if (vars.cursorPosition !== undefined && vars.cursorPosition !== null && isFinite(Number(vars.cursorPosition))) {
					ta._xPosition = J.clamp(Number(vars.cursorPosition), 0, totalWidth);
				}
			};

			if (inZone && !prev) runAreaCode(J.getIndexedEtCode(enterMap, idx, enterDef));
			if (!inZone && prev) runAreaCode(J.getIndexedEtCode(exitMap, idx, exitDef));
			if (inZone) runAreaCode(J.getIndexedEtCode(whileMap, idx, whileDef));
			ta._jXtaBarAreaInside[idx] = inZone;
		}
	};

	J._processBarHitEval = function(ta, beforeHitCount) {
		if (!J._isBarCustomHitzoneTa(ta)) return;
		var code = ta._item ? ta._item.jakeEtOnHit : '';
		code = J.normalizeEvalCode(code);
		if (!code.length) return;

		var prev = Math.max(0, parseInt(beforeHitCount) || 0);
		var now = Math.max(0, parseInt(ta._jBarHitsDone || 0));
		if (now <= prev) return;

		var totalWidth = ta.windowWidth ? ta.windowWidth() : 0;
		if (!Array.isArray(ta._jXtaBarHitContribs) || ta._jXtaBarHitContribs.length <= 0) ta._jXtaBarHitContribs = [null];

		for (var h = prev + 1; h <= now; h++) {
			var marker = (ta._jBarMarkers && ta._jBarMarkers[h - 1] !== undefined) ? Number(ta._jBarMarkers[h - 1]) : Number(ta._xPosition || 0);
			var hd = ta._jakeEvaluateDefaultHitData ? ta._jakeEvaluateDefaultHitData(marker, totalWidth) : null;
			var rawSum = hd ? Number(hd.sum || 0) : 0;
			var vars = {
				hitPower: rawSum,
				cursorPosition: marker
			};
			J.runXtaEvalCode(ta, code, vars);
			var finalPower = isFinite(Number(vars.hitPower)) ? Number(vars.hitPower) : rawSum;
			var ratio = (rawSum !== 0) ? (finalPower / rawSum) : 0;
			var zones = [0];
			if (hd && Array.isArray(hd.zonePowers)) {
				for (var z = 1; z < hd.zonePowers.length; z++) zones[z] = Number(hd.zonePowers[z] || 0) * ratio;
			}
			ta._jXtaBarHitContribs[h] = {
				sum: finalPower,
				zonePowers: zones
			};
			if (vars.cursorPosition !== undefined && vars.cursorPosition !== null && isFinite(Number(vars.cursorPosition))) {
				ta._xPosition = J.clamp(Number(vars.cursorPosition), 0, totalWidth);
			}
		}

		J._rebuildBarOutputsFromContribs(ta);
		if (!ta._notPressed) {
			if (String(ta._jBarPowerValue || '').toLowerCase() === 'multiple hits') ta.setPower(ta._jBarHitPowers);
			else ta.setPower(ta._jBarZonePowers);
		}
	};

	J._computeClockHitContribution = function(ta, angle) {
		var radius = Math.max(1, J.toNumber(ta._length, 1));
		var perTarget = [0];
		var sum = 0;
		for (var i = 0; i < (ta._targets ? ta._targets.length : 0); i++) {
			var p = J.evaluateClockTargetPower(ta._targets[i], angle, radius);
			perTarget[i + 1] = p;
			sum += p;
		}
		return {sum: sum, perTarget: perTarget};
	};

	J._resolveClockPowerFromContribs = function(ta) {
		if (!ta || !Array.isArray(ta._jXtaClockHitContribs) || ta._jXtaClockHitContribs.length <= 1) return null;
		var mode = String(ta._jClockPowerValue || 'one value').toLowerCase();
		if (mode === 'one value') {
			var total = 0;
			var count = 0;
			for (var i = 1; i < ta._jXtaClockHitContribs.length; i++) {
				var c = ta._jXtaClockHitContribs[i];
				if (!c) continue;
				total += Number(c.sum || 0);
				count++;
			}
			if (count <= 0) return 0;
			return total / count;
		}
		if (mode === 'multiple targets') {
			var outTargets = [0];
			for (var t = 0; t < (ta._targets ? ta._targets.length : 0); t++) outTargets[t + 1] = 0;
			for (var h = 1; h < ta._jXtaClockHitContribs.length; h++) {
				var hit = ta._jXtaClockHitContribs[h];
				if (!hit || !hit.perTarget) continue;
				for (var k = 1; k < hit.perTarget.length; k++) {
					var pv = Number(hit.perTarget[k] || 0);
					if (pv > outTargets[k]) outTargets[k] = pv;
				}
			}
			return outTargets;
		}
		var outHits = [0];
		for (var m = 1; m < ta._jXtaClockHitContribs.length; m++) {
			var hc = ta._jXtaClockHitContribs[m];
			outHits[m] = hc ? Number(hc.sum || 0) : 0;
		}
		return outHits;
	};

	J._processBalanceHoldEvalBefore = function(ta) {
		if (!J._isBalanceTa(ta) || !ta._item) return;
		if (!ta._notPressed) return;
		var startCode = J.normalizeEvalCode(ta._item.jakeEtOnKeyHoldStart);
		var endCode = J.normalizeEvalCode(ta._item.jakeEtOnKeyHoldEnd);
		if (!startCode.length && !endCode.length) return;

		J._ensureBalanceRoleTracking(ta);
		J._restoreBalanceRoleCodes(ta);
		J._applyBalanceRoleRedirects(ta);

		var codes = {};
		for (var baseCode in ta._jXtaBalanceRoleByCode) {
			if (!ta._jXtaBalanceRoleByCode.hasOwnProperty(baseCode)) continue;
			codes[baseCode] = true;
		}
		for (var redCode in ta._jXtaBalanceRedirectByCode) {
			if (!ta._jXtaBalanceRedirectByCode.hasOwnProperty(redCode)) continue;
			codes[redCode] = true;
		}

		var current = {};
		for (var codeKey in codes) {
			if (!codes.hasOwnProperty(codeKey)) continue;
			var nCode = Number(codeKey);
			if (isNaN(nCode)) continue;
			if (J.isKeyCodePressed) current[codeKey] = !!J.isKeyCodePressed(nCode);
			else current[codeKey] = !!(Input && Input._jakeTAPressedCodes && Input._jakeTAPressedCodes[nCode]);
		}

		for (var sCode in current) {
			if (!current.hasOwnProperty(sCode)) continue;
			var was = !!ta._jXtaBalancePrevPressed[sCode];
			var now = !!current[sCode];
			if (!now || was) continue;
			var startRole = ta._jXtaBalanceRedirectByCode[sCode] || ta._jXtaBalanceRoleByCode[sCode] || '';
			var mappedRole = startRole;
			if (startCode.length) mappedRole = J._runBalanceHoldEval(ta, startCode, startRole, true);
			ta._jXtaBalanceRedirectByCode[sCode] = mappedRole;
		}

		for (var pCode in ta._jXtaBalancePrevPressed) {
			if (!ta._jXtaBalancePrevPressed.hasOwnProperty(pCode)) continue;
			if (!ta._jXtaBalancePrevPressed[pCode]) continue;
			if (!!current[pCode]) continue;
			var endRole = ta._jXtaBalanceRedirectByCode[pCode] || ta._jXtaBalanceRoleByCode[pCode] || '';
			if (endCode.length) J._runBalanceHoldEval(ta, endCode, endRole, false);
			delete ta._jXtaBalanceRedirectByCode[pCode];
		}

		ta._jXtaBalancePrevPressed = current;
		J._restoreBalanceRoleCodes(ta);
		J._applyBalanceRoleRedirects(ta);
	};

	J._processBalanceAreaEvalAfter = function(ta) {
		if (!J._isBalanceTa(ta)) return;
		if (!ta._notPressed) return;
		var item = ta._item || {};
		var enterMap = item.jakeEtOnEnterBalanceArea || {};
		var exitMap = item.jakeEtOnExitBalanceArea || {};
		var whileMap = item.jakeEtWhileInBalanceArea || {};
		var enterDef = item.jakeEtOnEnterBalanceAreaDefault || '';
		var exitDef = item.jakeEtOnExitBalanceAreaDefault || '';
		var whileDef = item.jakeEtWhileInBalanceAreaDefault || '';
		var hasAny = !!(Object.keys(enterMap).length || Object.keys(exitMap).length || Object.keys(whileMap).length || String(enterDef).trim().length || String(exitDef).trim().length || String(whileDef).trim().length);
		if (!hasAny) return;

		if (!ta._jXtaBalanceAreaInside) ta._jXtaBalanceAreaInside = {};
		for (var i = 0; i < (ta._jBalanceAreas ? ta._jBalanceAreas.length : 0); i++) {
			var area = ta._jBalanceAreas[i];
			if (!area || !area.initialized) continue;
			var idx = i + 1;
			var inArea = J.evaluateHitzonePower(area, ta._jBalanceCursorX, ta._jBalanceWidth) > 0;
			var prev = !!ta._jXtaBalanceAreaInside[idx];

			var runAreaCode = function(code) {
				var src = J.normalizeEvalCode(code);
				if (!src.length) return;
				var vars = J._buildBalanceEvalVars(ta);
				J.runXtaEvalCode(ta, src, vars);
				J._applyBalanceEvalVars(ta, vars, true);
			};

			if (inArea && !prev) runAreaCode(J.getIndexedEtCode(enterMap, idx, enterDef));
			if (!inArea && prev) runAreaCode(J.getIndexedEtCode(exitMap, idx, exitDef));
			if (inArea) runAreaCode(J.getIndexedEtCode(whileMap, idx, whileDef));
			ta._jXtaBalanceAreaInside[idx] = inArea;
		}
	};

	var _jActivationTriggered_v23_xparallelEt = TimedAttackSystem.prototype._jakeActivationTriggered;
	TimedAttackSystem.prototype._jakeActivationTriggered = function() {
		var triggered = _jActivationTriggered_v23_xparallelEt.call(this);
		if (triggered && J.isXtaRuntimeTa(this) && this._item && String(this._item.type || '').trim().toLowerCase() === 'circle') {
			if (J.normalizeEvalCode(this._item.jakeEtOnHit).length) this._jXtaPendingCircleEtOnHit = true;
		}
		return triggered;
	};

	var _jSetPower_v23_xparallelEt = TimedAttackSystem.prototype.setPower;
	TimedAttackSystem.prototype.setPower = function(power) {
		if (this._jXtaPendingCircleEtOnHit && J.isXtaRuntimeTa(this) && this._item && String(this._item.type || '').trim().toLowerCase() === 'circle') {
			var code = J.normalizeEvalCode(this._item.jakeEtOnHit);
			if (code.length) {
				var vars = {hitPower: J.copyTasPower(power)};
				J.runXtaEvalCode(this, code, vars);
				power = vars.hitPower;
			}
			this._jXtaPendingCircleEtOnHit = false;
		}
		_jSetPower_v23_xparallelEt.call(this, power);
	};

	var _jProcessMashInput_v23_xparallelEt = TimedAttackSystem.prototype._jakeProcessMashInput;
	TimedAttackSystem.prototype._jakeProcessMashInput = function() {
		var valid = _jProcessMashInput_v23_xparallelEt.call(this);
		if (!valid || !J.isXtaRuntimeTa(this) || !this._item || String(this._item.type || '').trim().toLowerCase() !== 'mash') return valid;
		var code = J.normalizeEvalCode(this._item.jakeEtOnValidMash);
		if (!code.length) return valid;
		var mashAdd = 0;
		try {
			mashAdd = Number(eval(this._item.tap));
		} catch (e) {
			mashAdd = Number(this._item.tap || 0);
		}
		if (!isFinite(mashAdd)) mashAdd = 0;
		var vars = {mashAdd: mashAdd};
		J.runXtaEvalCode(this, code, vars);
		var finalAdd = Number(vars.mashAdd);
		if (!isFinite(finalAdd)) finalAdd = mashAdd;
		if (this._jXtaMashTapBackup === undefined) this._jXtaMashTapBackup = this._item.tap;
		this._item.tap = String(finalAdd);
		this._jXtaMashTapRestoreNeeded = true;
		return valid;
	};

	var _jPlayMashGame_v23_xparallelEt = TimedAttackSystem.prototype.playMashGame;
	TimedAttackSystem.prototype.playMashGame = function() {
		try {
			_jPlayMashGame_v23_xparallelEt.call(this);
		} finally {
			if (this._jXtaMashTapRestoreNeeded) {
				if (this._item) this._item.tap = this._jXtaMashTapBackup;
				this._jXtaMashTapBackup = undefined;
				this._jXtaMashTapRestoreNeeded = false;
			}
		}
	};

	var _jArrowCommandTriggered_v23_xparallelEt = TimedAttackSystem.prototype._jakeArrowCommandTriggered;
	TimedAttackSystem.prototype._jakeArrowCommandTriggered = function(cmd) {
		if (!J.isXtaRuntimeTa(this) || !this._item || String(this._item.type || '').trim().toLowerCase() !== 'arrows') {
			return _jArrowCommandTriggered_v23_xparallelEt.call(this, cmd);
		}
		if (this._jXTADisabledControl) return false;
		var code = J.normalizeEvalCode(this._item.jakeEtOnKeyPress);
		if (!code.length) return _jArrowCommandTriggered_v23_xparallelEt.call(this, cmd);

		var probe = J.peekQueuedInputForTa(this);
		if (!probe) return false;
		var vars = {validKey: J._isArrowCodeValidForCommand(this, cmd, probe.code)};
		J.runXtaEvalCode(this, code, vars);
		if (!!vars.validKey) {
			J.consumeQueuedInputAt(this, probe.index);
			return true;
		}
		return false;
	};

	var _jArrowAnyInputTriggered_v23_xparallelEt = TimedAttackSystem.prototype._jakeArrowAnyInputTriggered;
	TimedAttackSystem.prototype._jakeArrowAnyInputTriggered = function() {
		if (J.isXtaRuntimeTa(this) && this._item && String(this._item.type || '').trim().toLowerCase() === 'arrows') {
			if (this._jXTADisabledControl) return false;
		}
		return _jArrowAnyInputTriggered_v23_xparallelEt.call(this);
	};

	var _jPlayDefaultCustomHitzones_v23_xparallelEt = TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones;
	TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones = function() {
		var beforeHits = Number(this._jBarHitsDone || 0);
		_jPlayDefaultCustomHitzones_v23_xparallelEt.call(this);
		if (!J.isXtaRuntimeTa(this)) return;
		J._processBarAreaEval(this);
		J._processBarHitEval(this, beforeHits);
	};

	var _jPlayClockGame_v23_xparallelEt = TimedAttackSystem.prototype.playClockGame;
	TimedAttackSystem.prototype.playClockGame = function() {
		var beforeCount = (this._setTargets && this._setTargets.length) ? this._setTargets.length : 0;
		_jPlayClockGame_v23_xparallelEt.call(this);
		if (!J.isXtaRuntimeTa(this) || !this._item || String(this._item.type || '').trim().toLowerCase() !== 'clock') return;
		var code = J.normalizeEvalCode(this._item.jakeEtOnHit);
		if (!code.length) return;

		var afterCount = (this._setTargets && this._setTargets.length) ? this._setTargets.length : 0;
		if (afterCount <= beforeCount) return;
		if (!Array.isArray(this._jXtaClockHitContribs) || this._jXtaClockHitContribs.length <= 0) this._jXtaClockHitContribs = [null];

		for (var i = beforeCount + 1; i <= afterCount; i++) {
			var angle = Number(this._setTargets[i - 1] || 0);
			var raw = J._computeClockHitContribution(this, angle);
			var vars = {hitPower: Number(raw.sum || 0)};
			J.runXtaEvalCode(this, code, vars);
			var finalPower = isFinite(Number(vars.hitPower)) ? Number(vars.hitPower) : Number(raw.sum || 0);
			var ratio = (Number(raw.sum || 0) !== 0) ? (finalPower / Number(raw.sum || 0)) : 0;
			var perTarget = [0];
			for (var k = 1; k < raw.perTarget.length; k++) perTarget[k] = Number(raw.perTarget[k] || 0) * ratio;
			this._jXtaClockHitContribs[i] = {
				sum: finalPower,
				perTarget: perTarget
			};
		}

		if (!this._notPressed && Number(this._targetCount || 0) <= 0 && this._jakeResolveClockFinalPower) {
			this.setPower(this._jakeResolveClockFinalPower(true));
		}
	};

	var _jResolveClockPower_v23_xparallelEt = TimedAttackSystem.prototype._jakeResolveClockPower;
	TimedAttackSystem.prototype._jakeResolveClockPower = function() {
		if (J.isXtaRuntimeTa(this) && this._item && String(this._item.type || '').trim().toLowerCase() === 'clock') {
			if (J.normalizeEvalCode(this._item.jakeEtOnHit).length) {
				var rebuilt = J._resolveClockPowerFromContribs(this);
				if (rebuilt !== null && rebuilt !== undefined) return rebuilt;
			}
		}
		return _jResolveClockPower_v23_xparallelEt.call(this);
	};

	J.updateParXtaCurrent = function(ta) {
		if (!J._logXTAsEnabled || !ta || !ta._jParXResultIndex) return;
		if (!$gameTemp || !Array.isArray($gameTemp.parXTAs)) return;
		var entry = $gameTemp.parXTAs[ta._jParXResultIndex];
		if (!entry || entry.finished) return;
		entry.current_frames_left = Math.max(0, Math.floor(ta._jakeCurrentFramesLeft ? ta._jakeCurrentFramesLeft() : 0));
		entry.current_seconds_left = Math.max(0, Math.floor(ta._jakeCurrentSecondsLeft ? ta._jakeCurrentSecondsLeft() : 0));
		entry.current_power = J.copyTasPower(ta._jakeEstimateCurrentPower ? ta._jakeEstimateCurrentPower() : 0);
	};

	if (TimedAttackSystem.prototype._jakeOverlayRoot) {
		var _jakeOverlayRoot_xparallelOlivia = TimedAttackSystem.prototype._jakeOverlayRoot;
		TimedAttackSystem.prototype._jakeOverlayRoot = function() {
			if (J.isForcedStandaloneTa(this)) return this;
			return _jakeOverlayRoot_xparallelOlivia.call(this);
		};
	}

	if (typeof Window_StateIconTooltip !== 'undefined' &&
		!Window_StateIconTooltip.prototype._jakeXParallelTooltipThrottlePatched) {
		Window_StateIconTooltip.prototype._jakeXParallelTooltipThrottlePatched = true;
		var _jWindowStateIconTooltipUpdateNewData_xparallel = Window_StateIconTooltip.prototype.updateNewData;
		Window_StateIconTooltip.prototype.updateNewData = function() {
			if (J.hasActiveForcedStandaloneTas()) {
				var frame = Graphics.frameCount;
				if (this._jakeXParallelTooltipRefreshFrame === frame) return;
				this._jakeXParallelTooltipRefreshFrame = frame;
			}
			_jWindowStateIconTooltipUpdateNewData_xparallel.call(this);
		};
	}

	var _jUpdateGames_v23 = TimedAttackSystem.prototype.updateGames;
	TimedAttackSystem.prototype.updateGames = function() {
		J._activeInputConsumer = this;
		try {
			if (J.isXtaRuntimeTa(this)) {
				J.applyParXtaControlsToTA(this);
				if (J._isBalanceTa(this)) J._processBalanceHoldEvalBefore(this);
			}
			_jUpdateGames_v23.call(this);
		} finally {
			J._activeInputConsumer = null;
		}
		if (J.isXtaRuntimeTa(this)) {
			if (J._isBalanceTa(this)) J._processBalanceAreaEvalAfter(this);
			J.syncParXtaControlsFromTA(this);
		}
		J.updateParXtaCurrent(this);
		if (J.isForcedStandaloneTa(this)) J._ensureStateIconTooltipOnTop();
	};

	var _jConsumeKeyCode_v23 = J.consumeKeyCode;
	J.consumeKeyCode = function(code) {
		if (!Input || !Input._jakeTAKeyQueue) return false;
		var queue = Input._jakeTAKeyQueue;
		var activeTa = J._activeInputConsumer;
		if (activeTa && activeTa._jXTADisabledControl) return false;

		if (activeTa && activeTa._jXTAInputReadOnly) {
			var start = Math.max(0, Number(activeTa._jInputReadPos || 0));
			for (var i = start; i < queue.length; i++) {
				if (queue[i] === null || queue[i] === undefined) continue;
				if (Number(queue[i]) === Number(code)) {
					activeTa._jLastConsumedInput = {index: i, code: Number(queue[i]), readOnly: true, prevReadPos: start};
					activeTa._jInputReadPos = i + 1;
					return true;
				}
			}
			return false;
		}

		if (J.hasActiveXtas()) {
			for (var j = 0; j < queue.length; j++) {
				if (queue[j] === null || queue[j] === undefined) continue;
				if (Number(queue[j]) === Number(code)) {
					if (activeTa) activeTa._jLastConsumedInput = {index: j, code: Number(queue[j]), readOnly: false};
					queue[j] = null;
					return true;
				}
			}
			return false;
		}

		return _jConsumeKeyCode_v23.call(this, code);
	};

	var _jConsumeAnyKey_v23 = J.consumeAnyKey;
	J.consumeAnyKey = function() {
		if (!Input || !Input._jakeTAKeyQueue) return null;
		var queue = Input._jakeTAKeyQueue;
		var activeTa = J._activeInputConsumer;
		if (activeTa && activeTa._jXTADisabledControl) return null;

		if (activeTa && activeTa._jXTAInputReadOnly) {
			var start = Math.max(0, Number(activeTa._jInputReadPos || 0));
			for (var i = start; i < queue.length; i++) {
				if (queue[i] === null || queue[i] === undefined) continue;
				activeTa._jLastConsumedInput = {index: i, code: Number(queue[i]), readOnly: true, prevReadPos: start};
				activeTa._jInputReadPos = i + 1;
				return Number(queue[i]);
			}
			return null;
		}

		if (J.hasActiveXtas()) {
			for (var j = 0; j < queue.length; j++) {
				if (queue[j] === null || queue[j] === undefined) continue;
				var key = Number(queue[j]);
				if (activeTa) activeTa._jLastConsumedInput = {index: j, code: key, readOnly: false};
				queue[j] = null;
				return key;
			}
			return null;
		}

		return _jConsumeAnyKey_v23.call(this);
	};

	var _jConsumeHitKeys_v23 = J.consumeHitKeys;
	J.consumeHitKeys = function(codes) {
		var activeTa = J._activeInputConsumer;
		if (activeTa && activeTa._jXTADisabledControl) return false;
		return _jConsumeHitKeys_v23.call(this, codes);
	};

	if (J.isKeyCodePressed) {
		var _jIsKeyCodePressed_v23 = J.isKeyCodePressed;
		J.isKeyCodePressed = function(code) {
			var activeTa = J._activeInputConsumer;
			if (activeTa && activeTa._jXTADisabledControl) return false;
			return _jIsKeyCodePressed_v23.call(this, code);
		};
	}

	var _jClose_v23 = TimedAttackSystem.prototype.close;
	TimedAttackSystem.prototype.close = function() {
		var runId = this._jRunId || 0;
		_jClose_v23.call(this);
		if (runId > 0) J.finishTARun(runId, this);
	};
})();
