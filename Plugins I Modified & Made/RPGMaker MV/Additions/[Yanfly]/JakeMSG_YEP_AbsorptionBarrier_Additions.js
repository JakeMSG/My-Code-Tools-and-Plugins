//=============================================================================
// Addition to YEP plugin "Absorption Barrier", made by JakeMSG
// JakeMSG_YEP_AbsorptionBarrier_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_AbsorptionBarrier_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.ABR_JakeMSGAdd = Yanfly.ABR_JakeMSGAdd || {};
Yanfly.ABR_JakeMSGAdd.version = 1.0;

//=============================================================================
/*:
 * @plugindesc (Requires YEP_AbsorptionBarrier.js) Additions to the Absorption Barrier
 * yanfly Plugin
 * @author JakeMSG
 * v1.1
 * 
============ Change Log ============
1.1 - 6.25th.2026
 * Added a fix for a possible crash upon Saving
1.0 - 6.19th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_AbsorptionBarrier.
 * Make sure this plugin is located under YEP_AbsorptionBarrier in the plugin list.
 *
 * It extends the Absorption Barrier mechanic with several features:
 *
 *   1. Script-call evaluation timings that fire whenever a barrier is applied,
 *      freshly applied, reduced, or fully broken.
 *
 *   2. An optional maximum value that caps how high a barrier can go.
 *
 *   3. Printing the barrier value (and maximum) next to the HP value on HP
 *      gauges.
 *
 *   4. Custom Barriers: extra, independent barriers (each identified by an ID)
 *      that have every feature the default barrier has.
 *
 * Each feature is described in detail in the "New Features" section below.
 *
 * ============================================================================
 * Fixes
 * ============================================================================
 * ======== 
 * 
 * 
 * 
 * ============================================================================
 * Compatibilities
 * ============================================================================
 * ======== 
 * 
 * 
 * 
 * ============================================================================
 * New Features
 * ============================================================================
 *
 * ================================
 * Barrier Eval Timings
 * ================================
 *
 * You can run custom script calls at specific moments in a barrier's life
 * cycle by using the notetag pairs below. These notetags can be placed on
 * Actor, Enemy, and State entries.
 *
 *   - When placed on an Actor, the script calls run for that actor.
 *   - When placed on an Enemy, the script calls run for that enemy.
 *   - When placed on a State, the script calls only run while the battler is
 *     currently afflicted with that State. The battler the State is attached
 *     to is treated as the owner of the barrier.
 *
 * If multiple sources (the Actor/Enemy entry and one or more active States)
 * define script calls for the same timing, every one of them runs (in the
 * order: active States first, then the Actor/Enemy entry).
 *
 *   --- Notetag Pairs ---
 *
 *   <Barrier OnApply Eval>
 *    ... script calls ...
 *   </Barrier OnApply Eval>
 *   Runs whenever any barrier value is applied (the barrier increases).
 *
 *   <Barrier OnFreshApply Eval>
 *    ... script calls ...
 *   </Barrier OnFreshApply Eval>
 *   Runs whenever any barrier value is applied while there was NO barrier
 *   currently active (i.e. the barrier went from 0 to a positive value). On a
 *   fresh application, OnFreshApply runs first, then OnApply also runs.
 *
 *   <Barrier OnReduce Eval>
 *    ... script calls ...
 *   </Barrier OnReduce Eval>
 *   Runs whenever the barrier value is reduced (for example, absorbing damage).
 *
 *   <Barrier OnBreak Eval>
 *    ... script calls ...
 *   </Barrier OnBreak Eval>
 *   Runs whenever the barrier value is fully depleted (reaches 0). When a
 *   reduction breaks the barrier, OnReduce runs first, then OnBreak.
 *
 *   --- The barrier_value Helper ---
 *
 *   Inside any of the eval timings above, the helper variable 'barrier_value'
 *   holds the battler's current TOTAL barrier value at the time the script
 *   calls execute.
 *
 *   - Read it to check the current barrier value.
 *   - Assign to it to OVERWRITE the current barrier value. After the script
 *     calls finish, the battler's barrier is set to whatever 'barrier_value'
 *     ends up being. The new value is floored, clamped to a minimum of 0, and
 *     clamped to the current Maximum Barrier Value (see below) if one is set.
 *
 *   Example - refill the barrier to 500 when it breaks:
 *
 *     <Barrier OnBreak Eval>
 *      barrier_value = 500;
 *     </Barrier OnBreak Eval>
 *
 *   The usual battler references 'a', 'b', 'user', 'subject', and 'target' all
 *   refer to the battler that owns the barrier. 's' is game switches and 'v'
 *   is game variables.
 *
 *   Note: to avoid infinite loops, the eval timings do not re-trigger one
 *   another. Prefer using 'barrier_value' to change the barrier from within
 *   these evals.
 *
 *   --- The damage_value and change_value Helpers ---
 *
 *   Two more helper variables are available inside every eval timing above.
 *   Like 'barrier_value', they can be read AND assigned to.
 *
 *   IMPORTANT - timing: the OnReduce / OnBreak timings caused by damage run
 *   BEFORE that barrier actually absorbs. Your assignments inside them therefore
 *   decide how the absorption happens. (OnApply / OnFreshApply still run for the
 *   gain that triggered them.)
 *
 *   'damage_value'
 *   - The amount of damage about to be dealt to this barrier at the time of the
 *     eval (the damage that is then distributed: part absorbed by this barrier,
 *     the rest passed on to the barriers that absorb after it and finally to HP).
 *   - It is 0 when the eval was not caused by damage (for example, a barrier
 *     gained from a skill, regen, or battle start).
 *   - Assign to it to change the damage. Because the eval runs before this
 *     barrier absorbs, lowering 'damage_value' makes this barrier absorb less
 *     and sends less onward to later barriers and HP; raising it does the
 *     opposite. (Has no effect in the gain timings, where it is 0.)
 *
 *   'change_value'
 *   - The signed change this barrier is about to undergo: positive when the
 *     barrier increases (OnApply / OnFreshApply) and negative when it decreases
 *     (OnReduce / OnBreak, e.g. from absorbing 'damage_value'). On a damage
 *     reduction it starts at minus the amount this barrier would absorb.
 *   - Assign to it to override how much this barrier changes. The barrier ends
 *     up at (value before the event) + change_value, floored, clamped to a
 *     minimum of 0 and to the Maximum Barrier Value if one is set.
 *
 *   How the values resolve (damage timings):
 *   - If you change 'change_value' (or 'barrier_value'), this barrier is set
 *     accordingly and the amount it absorbs is (before - new value). The damage
 *     passed onward is 'damage_value' minus that absorbed amount.
 *   - If you only change 'damage_value', this barrier re-absorbs from the new
 *     damage (using its penetration), and the rest passes onward.
 *   - If you assign to both 'barrier_value' and 'change_value', 'change_value'
 *     takes precedence for the barrier's final value.
 *
 *   Example - halve the damage before this barrier (and everything after it)
 *   absorbs it:
 *
 *     <Barrier OnReduce Eval>
 *      damage_value = Math.floor(damage_value / 2);
 *     </Barrier OnReduce Eval>
 *
 * ================================
 * Maximum Barrier Value
 * ================================
 *
 * By default a barrier has no maximum value (the original behavior). You can
 * optionally cap how high a battler's barrier can go.
 *
 *   --- Actor, Enemy, State Notetag ---
 *
 *   <Barrier Max Value: x>
 *   Sets the maximum barrier value for the actor / enemy / owner of the state
 *   to x. On a State, this only applies while afflicted with that State.
 *
 *   --- Skill, Item Notetags ---
 *
 *   <User Max Barrier: x>
 *   <Target Max Barrier: x>
 *   When the skill / item is used, sets the maximum barrier value of the user
 *   or target to x.
 *
 *   --- Script Call ---
 *
 *   battler.setMaxBarrier(value)
 *   Sets the maximum barrier value of that battler to 'value'.
 *
 *   --- How the Maximum Behaves ---
 *
 *   - If the maximum is unset, there is no maximum (the default behavior).
 *   - If a barrier value already exists that is over the maximum, it is
 *     immediately reduced down to the maximum. (This clamp does not count as a
 *     reduction for the OnReduce / OnBreak timings.)
 *   - While a maximum is set, any increase over the maximum leaves the barrier
 *     sitting at, at most, the maximum value.
 *   - A negative value (such as -1) is treated as undefined / disabled, so the
 *     barrier once again has no maximum value.
 *
 *   --- Resolving Multiple Sources ---
 *
 *   A maximum set by a skill / item or script call takes precedence over the
 *   intrinsic Actor / Enemy / State maximum, and setting it negative disables
 *   the maximum for that battler. When no such maximum has been set, the
 *   effective maximum is the lowest (most restrictive) non-negative maximum
 *   among the Actor / Enemy entry and all active States.
 *
 *   Maximums set via skills / items / script calls are cleared together with
 *   the battler's barrier.
 *
 * ================================
 * Barrier Value Display on HP Gauges
 * ================================
 *
 * The base plugin only shows the barrier as part of the HP gauge's visuals;
 * the actual barrier value is never printed. This plugin prints the barrier
 * value next to the HP value wherever an HP gauge with values is drawn:
 *
 *     HP / MaxHP | Barrier / MaxBarrier
 *
 *   - The current barrier value is shown first; if a Maximum Barrier Value is
 *     set, a "/" and the maximum are shown to its right.
 *   - The barrier portion is separated from the HP value(s) by the " | "
 *     separator. When multiple barriers exist (see Custom Barriers), each one
 *     is likewise separated from the next by " | ".
 *   - The barrier value text is drawn at the same font size as the HP value it
 *     sits next to, using the font color and border (outline) color configured
 *     per barrier:
 *       - "Barrier Value text color" - text color (default #ffffff).
 *       - "Barrier Value text border color" - outline color (default #000000).
 *   - A barrier's value is only shown while that barrier is actually active.
 *
 * The display is added to every supported plugin that draws HP gauges with
 * values:
 *
 *   - YEP_BattleStatusWindow
 *   - YEP_X_VisualHpGauge
 *   - JakeMSG_YEP_X_VisualHpGauge_Additions
 *   - YEP_X_InBattleStatus
 *   - JakeMSG_YEP_X_InBattleStatus_Additions
 *   - JakeMSG_MoreDescriptionsWithConditions
 *
 * (JakeMSG_PassivesForAll no longer draws HP gauges/values, so there is
 * nothing for it to display.) No other plugins need to be edited; this plugin
 * patches their HP-drawing methods on its own once every plugin has loaded.
 *
 * ================================
 * Custom Barriers
 * ================================
 *
 * Custom Barriers are extra barriers that exist alongside the default barrier.
 * Each Custom Barrier has every option and feature the default barrier has
 * (battle-start points, regen, penetration, timed/unexpiring points, a barrier
 * State, animations, popups, a maximum value, the eval timings above, the
 * value display, etc.), but acts on its own, independent pool of points.
 *
 *   --- Creating Custom Barriers ---
 *
 *   Use the plugin parameters "Barriers 1" through "Barriers 20" (under the
 *   "---- Custom (Normal) Barriers ----" parent). Each is a list; every entry
 *   creates one Custom Barrier and has:
 *
 *     - ID: a number (default 1, may be negative) that identifies the Custom
 *       Barrier and sets its order among the barriers.
 *     - A copy of every default-barrier setting (Barrier State, colors,
 *       animations, popup, Display 0 HP Damage, Clear Per Battle, Clear on
 *       Death, default penetration rate/flat, and the value text colors),
 *       applied to that Custom Barrier specifically.
 *
 *   If two entries share an ID, the later one (higher list number, then later
 *   position) wins.
 *
 *   --- Custom Barrier Notetags ---
 *
 *   Every default-barrier notetag (including the eval-timing notetags added by
 *   this plugin) has a Custom Barrier version. Just replace the word "Barrier"
 *   with "CBarrier[X]", where X is the Custom Barrier's ID. For example:
 *
 *     <Target CBarrier[3]: +x>          (vs  <Target Barrier: +x>)
 *     <User CBarrier[3] 2 Turns: +y>    (vs  <User Barrier 2 Turns: +y>)
 *     <CBarrier[3] Points: +x>          (vs  <Barrier Points: +x>)
 *     <CBarrier[3] Regen: +x>           (vs  <Barrier Regen: +x>)
 *     <CBarrier[3] Penetration: +x%>    (vs  <Barrier Penetration: +x%>)
 *     <Bypass CBarrier[3]>              (vs  <Bypass Barrier>)
 *     <CBarrier[3] Max Value: x>        (vs  <Barrier Max Value: x>)
 *     <User Max CBarrier[3]: x>         (vs  <User Max Barrier: x>)
 *     <CBarrier[3] OnApply Eval> ... </CBarrier[3] OnApply Eval>
 *     <Custom CBarrier[3] Points> ... </Custom CBarrier[3] Points>
 *     ...and so on for every barrier notetag.
 *
 *   Inside a Custom Barrier's eval timings, the helper variable is named
 *   'cBarrier_value' (instead of 'barrier_value'). The 'damage_value' and
 *   'change_value' helpers (see "Barrier Eval Timings" above) are available in
 *   Custom Barrier eval timings too, with the same names and behavior, where
 *   'change_value' refers to the change of that Custom Barrier.
 *
 *   --- Custom Barrier Script Calls ---
 *
 *   Every barrier script call has a Custom Barrier version where "barrier"
 *   becomes "cBarrier", "Barrier" becomes "CBarrier", and a new FIRST argument
 *   is the Custom Barrier's ID:
 *
 *     battler.cBarrierPoints(id)        battler.cBarrierPoints(id, turn)
 *     battler.gainCBarrier(id, value, turn)
 *     battler.loseCBarrier(id, value)
 *     battler.startCBarrierAnimation(id)
 *     battler.updateCBarrierTurns(id)
 *     battler.setMaxCBarrier(id, value)
 *
 *   --- Order and Damage ---
 *
 *   On the HP bar, barriers are shown from left to right by ID, smallest to
 *   largest. The default barrier sits to the LEFT of any barriers with ID >= 0
 *   and to the RIGHT of any barriers with a negative ID. Their printed values
 *   follow the same left-to-right order, separated by " | ".
 *
 *   For incoming damage, the barriers with the HIGHEST ID absorb first, going
 *   down to the lowest. The default barrier absorbs after all ID >= 0 Custom
 *   Barriers and before any negative-ID Custom Barriers.
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * 
 * @param ---- Additional Barrier Settings ----
 * @default
 *
 * @param Barrier Value text color
 * @parent ---- Additional Barrier Settings ----
 * @desc Hex color (e.g. #ffffff) used for the (default) barrier value text,
 * for both the current barrier value and the maximum value.
 * @default #ffffff
 *
 * @param Barrier Value text border color
 * @parent ---- Additional Barrier Settings ----
 * @desc Hex color (e.g. #000000) used for the border/outline of the
 * (default) barrier value text (current value and maximum value).
 * @default #000000
 *
 * @param ---- Custom (Normal) Barriers ----
 * @default
 *
 * @param Barriers 1
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 2
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 3
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 4
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 5
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 6
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 7
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 8
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 9
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 10
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 11
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 12
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 13
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 14
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 15
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 16
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 17
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 18
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 19
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 * @param Barriers 20
 * @parent ---- Custom (Normal) Barriers ----
 * @type struct<CustomBarrier>[]
 * @desc A list of Custom Barriers.
 * @default []
 *
 */
/*~struct~CustomBarrier:
 * @param ID
 * @type number
 * @min -999999
 * @desc The ID used to identify and order this Custom Barrier.
 * May be negative.
 * @default 1
 *
 * @param Barrier State
 * @type state
 * @desc If this Custom Barrier has 1+ points, the battler gains this
 * state. Leave at 0 for no state.
 * @default 0
 *
 * @param Barrier Color 1
 * @type number
 * @min 0
 * @max 31
 * @desc The text code color 1 used for this Custom Barrier's gauge.
 * @default 13
 *
 * @param Barrier Color 2
 * @type number
 * @min 0
 * @max 31
 * @desc The text code color 2 used for this Custom Barrier's gauge.
 * @default 5
 *
 * @param Barrier Animation
 * @type animation
 * @desc Animation played when this Custom Barrier loses points.
 * Leave at 0 for no animation.
 * @default 0
 *
 * @param Break Animation
 * @type animation
 * @desc Animation played when this Custom Barrier is emptied.
 * Leave at 0 for no animation.
 * @default 0
 *
 * @param Barrier Popup
 * @desc Popup color for this Custom Barrier's damage (needs the
 * Battle Engine Core). Red, Green, Blue, Opacity
 * @default 255, 0, 255, 160
 *
 * @param Display 0 HP Damage
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Display 0 HP Damage if 0 Damage is dealt to HP?
 * @default false
 *
 * @param Clear Per Battle
 * @type boolean
 * @on YES
 * @off NO
 * @desc Clear this Custom Barrier at the start and end of battle?
 * @default true
 *
 * @param Clear on Death
 * @type boolean
 * @on YES
 * @off NO
 * @desc Clear this Custom Barrier if the battler dies?
 * @default true
 *
 * @param Default Penetration Rate
 * @desc Default Penetration Rate for this Custom Barrier.
 * Example: 50% is 0.50.
 * @default 0
 *
 * @param Default Penetration Flat
 * @desc Default flat Penetration for this Custom Barrier.
 * @default 0
 *
 * @param Barrier Value text color
 * @desc Hex color (e.g. #ffffff) for this Custom Barrier's value text.
 * @default #ffffff
 *
 * @param Barrier Value text border color
 * @desc Hex color (e.g. #000000) for this Custom Barrier's value text
 * border/outline.
 * @default #000000
 */
//=============================================================================

if (Imported.YEP_AbsorptionBarrier) {

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.ABR_JakeMSGAdd.Parameters =
    PluginManager.parameters('JakeMSG_YEP_AbsorptionBarrier_Additions');

Yanfly.ABR_JakeMSGAdd.barrierValueColor = String(
    Yanfly.ABR_JakeMSGAdd.Parameters['Barrier Value text color'] || '#ffffff');
Yanfly.ABR_JakeMSGAdd.barrierValueBorderColor = String(
    Yanfly.ABR_JakeMSGAdd.Parameters['Barrier Value text border color'] ||
    '#000000');

// Configuration of the default barrier, expressed as a "channel" config so the
// default and Custom Barriers can share the same generic code.
Yanfly.ABR_JakeMSGAdd.defaultConfig = {
    state: Yanfly.Param.ABRState,
    color1: Yanfly.Param.ABRColor1,
    color2: Yanfly.Param.ABRColor2,
    ani1: Yanfly.Param.ABRAni1,
    ani2: Yanfly.Param.ABRAni2,
    popup: Yanfly.Param.ABRPop,
    display0: Yanfly.Param.ABRDisplay0,
    clearPerBattle: Yanfly.Param.ABRClear,
    clearOnDeath: Yanfly.Param.ABRDeath,
    penRate: Yanfly.Param.ABRPenRate,
    penFlat: Yanfly.Param.ABRPenFlat,
    valueColor: Yanfly.ABR_JakeMSGAdd.barrierValueColor,
    valueBorder: Yanfly.ABR_JakeMSGAdd.barrierValueBorderColor
};

Yanfly.ABR_JakeMSGAdd.customConfigs = {};
Yanfly.ABR_JakeMSGAdd.customIdList = [];
Yanfly.ABR_JakeMSGAdd._visualOrder = ['default'];
Yanfly.ABR_JakeMSGAdd._damageOrder = ['default'];

Yanfly.ABR_JakeMSGAdd.parseCustomBarrierConfig = function(o) {
    var id = parseInt(o['ID']);
    if (isNaN(id)) return null;
    var popupStr = (o['Barrier Popup'] !== undefined) ?
        String(o['Barrier Popup']) : '255, 0, 255, 160';
    var popup;
    try {
      popup = eval('[' + popupStr + ']');
    } catch (e) {
      popup = [255, 0, 255, 160];
    }
    return {
      id: id,
      state: Number(o['Barrier State'] || 0),
      color1: (o['Barrier Color 1'] !== undefined) ?
        Number(o['Barrier Color 1']) : 13,
      color2: (o['Barrier Color 2'] !== undefined) ?
        Number(o['Barrier Color 2']) : 5,
      ani1: Number(o['Barrier Animation'] || 0),
      ani2: Number(o['Break Animation'] || 0),
      popup: popup,
      display0: String(o['Display 0 HP Damage']) === 'true',
      clearPerBattle: String(o['Clear Per Battle']) !== 'false',
      clearOnDeath: String(o['Clear on Death']) !== 'false',
      penRate: Number(o['Default Penetration Rate'] || 0),
      penFlat: Number(o['Default Penetration Flat'] || 0),
      valueColor: String(o['Barrier Value text color'] || '#ffffff'),
      valueBorder: String(o['Barrier Value text border color'] || '#000000')
    };
};

Yanfly.ABR_JakeMSGAdd.loadCustomBarriers = function() {
    this.customConfigs = {};
    for (var n = 1; n <= 20; n++) {
      var raw = this.Parameters['Barriers ' + n];
      if (!raw) continue;
      var arr;
      try {
        arr = JSON.parse(raw);
      } catch (e) {
        arr = [];
      }
      for (var k = 0; k < arr.length; k++) {
        var o;
        try {
          o = JSON.parse(arr[k]);
        } catch (e) {
          continue;
        }
        var cfg = this.parseCustomBarrierConfig(o);
        if (cfg) this.customConfigs[cfg.id] = cfg;
      }
    }
    this.customIdList = Object.keys(this.customConfigs).map(Number).sort(
      function(a, b) { return a - b; });
    var neg = this.customIdList.filter(function(i) { return i < 0; });
    var nonneg = this.customIdList.filter(function(i) { return i >= 0; });
    // Visual order (left -> right): negatives asc, default, non-negatives asc.
    this._visualOrder = neg.concat(['default']).concat(nonneg);
    // Damage order (absorb first): highest ID first, default, then negatives.
    this._damageOrder = this._visualOrder.slice().reverse();
};

Yanfly.ABR_JakeMSGAdd.loadCustomBarriers();

Yanfly.ABR_JakeMSGAdd.customIds = function() {
    return this.customIdList;
};

Yanfly.ABR_JakeMSGAdd.channelVisualOrder = function() {
    return this._visualOrder;
};

Yanfly.ABR_JakeMSGAdd.channelDamageOrder = function() {
    return this._damageOrder;
};

Yanfly.ABR_JakeMSGAdd.channelConfig = function(channel) {
    if (channel === 'default') return this.defaultConfig;
    return this.customConfigs[channel] || this.defaultConfig;
};

//=============================================================================
// DataManager
//=============================================================================

Yanfly.ABR_JakeMSGAdd.DataManager_isDatabaseLoaded =
    DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!Yanfly.ABR_JakeMSGAdd.DataManager_isDatabaseLoaded.call(this)) {
    return false;
  }
  if (!Yanfly._loaded_JakeMSG_ABR_Additions) {
    this.processABRJakeAddNotetags1($dataActors);
    this.processABRJakeAddNotetags1($dataEnemies);
    this.processABRJakeAddNotetags1($dataStates);
    this.processABRJakeAddNotetags2($dataSkills);
    this.processABRJakeAddNotetags2($dataItems);
    this.processABRJakeCustomBarrierNotetags($dataSkills);
    this.processABRJakeCustomBarrierNotetags($dataItems);
    this.processABRJakeCustomBarrierNotetags($dataActors);
    this.processABRJakeCustomBarrierNotetags($dataClasses);
    this.processABRJakeCustomBarrierNotetags($dataEnemies);
    this.processABRJakeCustomBarrierNotetags($dataWeapons);
    this.processABRJakeCustomBarrierNotetags($dataArmors);
    this.processABRJakeCustomBarrierNotetags($dataStates);
    Yanfly.ABR_JakeMSGAdd.installBarrierValueDisplay();
    Yanfly._loaded_JakeMSG_ABR_Additions = true;
  }
  return true;
};

// Actor, Enemy, State notetags: default-barrier eval timings + Barrier Max
// Value.
DataManager.processABRJakeAddNotetags1 = function(group) {
  var noteMax = /<BARRIER MAX VALUE:[ ](.*)>/i;
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);

    obj.barrierOnApplyEval = '';
    obj.barrierOnFreshApplyEval = '';
    obj.barrierOnReduceEval = '';
    obj.barrierOnBreakEval = '';
    obj.barrierMaxValue = undefined;
    var evalMode = 'none';

    for (var i = 0; i < notedata.length; i++) {
      var line = notedata[i];
      if (line.match(/<BARRIER ONAPPLY EVAL>/i)) {
        evalMode = 'barrier onapply';
      } else if (line.match(/<\/BARRIER ONAPPLY EVAL>/i)) {
        evalMode = 'none';
      } else if (line.match(/<BARRIER ONFRESHAPPLY EVAL>/i)) {
        evalMode = 'barrier onfreshapply';
      } else if (line.match(/<\/BARRIER ONFRESHAPPLY EVAL>/i)) {
        evalMode = 'none';
      } else if (line.match(/<BARRIER ONREDUCE EVAL>/i)) {
        evalMode = 'barrier onreduce';
      } else if (line.match(/<\/BARRIER ONREDUCE EVAL>/i)) {
        evalMode = 'none';
      } else if (line.match(/<BARRIER ONBREAK EVAL>/i)) {
        evalMode = 'barrier onbreak';
      } else if (line.match(/<\/BARRIER ONBREAK EVAL>/i)) {
        evalMode = 'none';
      } else if (line.match(noteMax)) {
        var value = Number(RegExp.$1);
        if (!isNaN(value)) obj.barrierMaxValue = Math.floor(value);
      } else if (evalMode === 'barrier onapply') {
        obj.barrierOnApplyEval = obj.barrierOnApplyEval + line + '\n';
      } else if (evalMode === 'barrier onfreshapply') {
        obj.barrierOnFreshApplyEval = obj.barrierOnFreshApplyEval + line + '\n';
      } else if (evalMode === 'barrier onreduce') {
        obj.barrierOnReduceEval = obj.barrierOnReduceEval + line + '\n';
      } else if (evalMode === 'barrier onbreak') {
        obj.barrierOnBreakEval = obj.barrierOnBreakEval + line + '\n';
      }
    }
  }
};

// Skill, Item notetags: default-barrier User / Target Max Barrier.
DataManager.processABRJakeAddNotetags2 = function(group) {
  var noteUser = /<USER MAX BARRIER:[ ](.*)>/i;
  var noteTarget = /<TARGET MAX BARRIER:[ ](.*)>/i;
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);

    obj.userMaxBarrier = undefined;
    obj.targetMaxBarrier = undefined;

    for (var i = 0; i < notedata.length; i++) {
      var line = notedata[i];
      if (line.match(noteUser)) {
        var value = Number(RegExp.$1);
        if (!isNaN(value)) obj.userMaxBarrier = Math.floor(value);
      } else if (line.match(noteTarget)) {
        var value = Number(RegExp.$1);
        if (!isNaN(value)) obj.targetMaxBarrier = Math.floor(value);
      }
    }
  }
};

// All Custom Barrier notetags, for every configured Custom Barrier ID.
DataManager.processABRJakeCustomBarrierNotetags = function(group) {
  var ids = Yanfly.ABR_JakeMSGAdd.customIds();
  if (ids.length <= 0) return;
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);
    for (var c = 0; c < ids.length; c++) {
      this.processCBarrierNotetagsForId(obj, notedata, ids[c]);
    }
  }
};

DataManager.processCBarrierNotetagsForId = function(obj, notedata, id) {
  var P = 'CBARRIER\\[' + id + '\\]';
  var reTargetA1 = new RegExp('<TARGET ' + P + ':[ ]([\\+\\-]\\d+)>', 'i');
  var reTargetA2 = new RegExp('<TARGET ' + P +
    '[ ](\\d+)[ ](?:TURN|TURNS):[ ]([\\+\\-]\\d+)>', 'i');
  var reUserB1 = new RegExp('<USER ' + P + ':[ ]([\\+\\-]\\d+)>', 'i');
  var reUserB2 = new RegExp('<USER ' + P +
    '[ ](\\d+)[ ](?:TURN|TURNS):[ ]([\\+\\-]\\d+)>', 'i');
  var reBypass = new RegExp('<BYPASS ' + P + '>', 'i');
  var rePenPctSigned = new RegExp('<' + P +
    ' PENETRATION:[ ]([\\+\\-]\\d+)([%\uFF05])>', 'i');
  var rePenPct = new RegExp('<' + P +
    ' PENETRATION:[ ](\\d+)([%\uFF05])>', 'i');
  var rePenFlatSigned = new RegExp('<' + P +
    ' PENETRATION:[ ]([\\+\\-]\\d+)>', 'i');
  var rePenFlat = new RegExp('<' + P + ' PENETRATION:[ ](\\d+)>', 'i');
  var rePointsA1 = new RegExp('<' + P + ' POINTS:[ ]([\\+\\-]\\d+)>', 'i');
  var rePointsA2 = new RegExp('<' + P +
    ' POINTS[ ](\\d+)[ ](?:TURN|TURNS):[ ]([\\+\\-]\\d+)>', 'i');
  var reRegenA1 = new RegExp('<' + P + ' REGEN:[ ]([\\+\\-]\\d+)>', 'i');
  var reRegenA2 = new RegExp('<' + P +
    ' REGEN[ ](\\d+)[ ](?:TURN|TURNS):[ ]([\\+\\-]\\d+)>', 'i');
  var reMaxValue = new RegExp('<' + P + ' MAX VALUE:[ ](.*)>', 'i');
  var reUserMax = new RegExp('<USER MAX ' + P + ':[ ](.*)>', 'i');
  var reTargetMax = new RegExp('<TARGET MAX ' + P + ':[ ](.*)>', 'i');
  // Open/close tags for the eval blocks.
  var reCTargetT = new RegExp('<CUSTOM TARGET ' + P +
    '[ ](\\d+)[ ](?:TURN|TURNS)>', 'i');
  var reCTargetTEnd = new RegExp('<\\/CUSTOM TARGET ' + P +
    '[ ](\\d+)[ ](?:TURN|TURNS)>', 'i');
  var reCTarget = new RegExp('<CUSTOM TARGET ' + P + '>', 'i');
  var reCTargetEnd = new RegExp('<\\/CUSTOM TARGET ' + P + '>', 'i');
  var reCUserT = new RegExp('<CUSTOM USER ' + P +
    '[ ](\\d+)[ ](?:TURN|TURNS)>', 'i');
  var reCUserTEnd = new RegExp('<\\/CUSTOM USER ' + P +
    '[ ](\\d+)[ ](?:TURN|TURNS)>', 'i');
  var reCUser = new RegExp('<CUSTOM USER ' + P + '>', 'i');
  var reCUserEnd = new RegExp('<\\/CUSTOM USER ' + P + '>', 'i');
  var reCPenRate = new RegExp('<CUSTOM ' + P + ' PENETRATION RATE>', 'i');
  var reCPenRateEnd = new RegExp('<\\/CUSTOM ' + P + ' PENETRATION RATE>', 'i');
  var reCPenFlat = new RegExp('<CUSTOM ' + P + ' PENETRATION FLAT>', 'i');
  var reCPenFlatEnd = new RegExp('<\\/CUSTOM ' + P + ' PENETRATION FLAT>', 'i');
  var reCPointsT = new RegExp('<CUSTOM ' + P +
    ' POINTS[ ](\\d+)[ ](?:TURN|TURNS)>', 'i');
  var reCPointsTEnd = new RegExp('<\\/CUSTOM ' + P +
    ' POINTS[ ](\\d+)[ ](?:TURN|TURNS)>', 'i');
  var reCPoints = new RegExp('<CUSTOM ' + P + ' POINTS>', 'i');
  var reCPointsEnd = new RegExp('<\\/CUSTOM ' + P + ' POINTS>', 'i');
  var reCRegenT = new RegExp('<CUSTOM ' + P +
    ' REGEN[ ](\\d+)[ ](?:TURN|TURNS)>', 'i');
  var reCRegenTEnd = new RegExp('<\\/CUSTOM ' + P +
    ' REGEN[ ](\\d+)[ ](?:TURN|TURNS)>', 'i');
  var reCRegen = new RegExp('<CUSTOM ' + P + ' REGEN>', 'i');
  var reCRegenEnd = new RegExp('<\\/CUSTOM ' + P + ' REGEN>', 'i');
  var reOnApply = new RegExp('<' + P + ' ONAPPLY EVAL>', 'i');
  var reOnApplyEnd = new RegExp('<\\/' + P + ' ONAPPLY EVAL>', 'i');
  var reOnFresh = new RegExp('<' + P + ' ONFRESHAPPLY EVAL>', 'i');
  var reOnFreshEnd = new RegExp('<\\/' + P + ' ONFRESHAPPLY EVAL>', 'i');
  var reOnReduce = new RegExp('<' + P + ' ONREDUCE EVAL>', 'i');
  var reOnReduceEnd = new RegExp('<\\/' + P + ' ONREDUCE EVAL>', 'i');
  var reOnBreak = new RegExp('<' + P + ' ONBREAK EVAL>', 'i');
  var reOnBreakEnd = new RegExp('<\\/' + P + ' ONBREAK EVAL>', 'i');

  var d = {
    targetBarrier: [], userBarrier: [],
    targetBarrierEval: [], userBarrierEval: [],
    barrierPenetrationRate: undefined, barrierPenetrationFlat: undefined,
    barrierPenetrationRateEval: '', barrierPenetrationFlatEval: '',
    battleStartBarrierPoints: [], battleStartBarrierPointsEval: [],
    barrierRegen: [], barrierRegenEval: [],
    onApplyEval: '', onFreshApplyEval: '', onReduceEval: '', onBreakEval: '',
    maxValue: undefined, userMaxBarrier: undefined, targetMaxBarrier: undefined
  };
  var found = false;
  var mode = 'none';
  var turn = 0;

  for (var i = 0; i < notedata.length; i++) {
    var line = notedata[i];
    if (line.match(reTargetA1)) {
      d.targetBarrier[0] = parseInt(RegExp.$1); found = true;
    } else if (line.match(reTargetA2)) {
      d.targetBarrier[parseInt(RegExp.$1)] = parseInt(RegExp.$2); found = true;
    } else if (line.match(reUserB1)) {
      d.userBarrier[0] = parseInt(RegExp.$1); found = true;
    } else if (line.match(reUserB2)) {
      d.userBarrier[parseInt(RegExp.$1)] = parseInt(RegExp.$2); found = true;
    } else if (line.match(reBypass)) {
      d.barrierPenetrationRate = 1; found = true;
    } else if (line.match(rePenPctSigned)) {
      d.barrierPenetrationRate = parseFloat(RegExp.$1) * 0.01; found = true;
    } else if (line.match(rePenPct)) {
      d.barrierPenetrationRate = parseFloat(RegExp.$1) * 0.01; found = true;
    } else if (line.match(rePointsA1)) {
      d.battleStartBarrierPoints[0] = parseInt(RegExp.$1); found = true;
    } else if (line.match(rePointsA2)) {
      d.battleStartBarrierPoints[parseInt(RegExp.$1)] = parseInt(RegExp.$2);
      found = true;
    } else if (line.match(reRegenA1)) {
      d.barrierRegen[0] = parseInt(RegExp.$1); found = true;
    } else if (line.match(reRegenA2)) {
      d.barrierRegen[parseInt(RegExp.$1)] = parseInt(RegExp.$2); found = true;
    } else if (line.match(rePenFlatSigned)) {
      d.barrierPenetrationFlat = parseInt(RegExp.$1); found = true;
    } else if (line.match(rePenFlat)) {
      d.barrierPenetrationFlat = parseInt(RegExp.$1); found = true;
    } else if (line.match(reMaxValue)) {
      var mv = Number(RegExp.$1);
      if (!isNaN(mv)) { d.maxValue = Math.floor(mv); found = true; }
    } else if (line.match(reUserMax)) {
      var um = Number(RegExp.$1);
      if (!isNaN(um)) { d.userMaxBarrier = Math.floor(um); found = true; }
    } else if (line.match(reTargetMax)) {
      var tm = Number(RegExp.$1);
      if (!isNaN(tm)) { d.targetMaxBarrier = Math.floor(tm); found = true; }
    } else if (line.match(reCTargetT)) {
      mode = 'targetEval'; turn = parseInt(RegExp.$1);
      d.targetBarrierEval[turn] = ''; found = true;
    } else if (line.match(reCTargetTEnd)) {
      mode = 'none';
    } else if (line.match(reCTarget)) {
      mode = 'targetEval'; turn = 0; d.targetBarrierEval[0] = ''; found = true;
    } else if (line.match(reCTargetEnd)) {
      mode = 'none';
    } else if (line.match(reCUserT)) {
      mode = 'userEval'; turn = parseInt(RegExp.$1);
      d.userBarrierEval[turn] = ''; found = true;
    } else if (line.match(reCUserTEnd)) {
      mode = 'none';
    } else if (line.match(reCUser)) {
      mode = 'userEval'; turn = 0; d.userBarrierEval[0] = ''; found = true;
    } else if (line.match(reCUserEnd)) {
      mode = 'none';
    } else if (line.match(reCPenRate)) {
      mode = 'penRateEval'; found = true;
    } else if (line.match(reCPenRateEnd)) {
      mode = 'none';
    } else if (line.match(reCPenFlat)) {
      mode = 'penFlatEval'; found = true;
    } else if (line.match(reCPenFlatEnd)) {
      mode = 'none';
    } else if (line.match(reCPointsT)) {
      mode = 'pointsEval'; turn = parseInt(RegExp.$1);
      d.battleStartBarrierPointsEval[turn] = ''; found = true;
    } else if (line.match(reCPointsTEnd)) {
      mode = 'none';
    } else if (line.match(reCPoints)) {
      mode = 'pointsEval'; turn = 0;
      d.battleStartBarrierPointsEval[0] = ''; found = true;
    } else if (line.match(reCPointsEnd)) {
      mode = 'none';
    } else if (line.match(reCRegenT)) {
      mode = 'regenEval'; turn = parseInt(RegExp.$1);
      d.barrierRegenEval[turn] = ''; found = true;
    } else if (line.match(reCRegenTEnd)) {
      mode = 'none';
    } else if (line.match(reCRegen)) {
      mode = 'regenEval'; turn = 0; d.barrierRegenEval[0] = ''; found = true;
    } else if (line.match(reCRegenEnd)) {
      mode = 'none';
    } else if (line.match(reOnApply)) {
      mode = 'onApply'; found = true;
    } else if (line.match(reOnApplyEnd)) {
      mode = 'none';
    } else if (line.match(reOnFresh)) {
      mode = 'onFresh'; found = true;
    } else if (line.match(reOnFreshEnd)) {
      mode = 'none';
    } else if (line.match(reOnReduce)) {
      mode = 'onReduce'; found = true;
    } else if (line.match(reOnReduceEnd)) {
      mode = 'none';
    } else if (line.match(reOnBreak)) {
      mode = 'onBreak'; found = true;
    } else if (line.match(reOnBreakEnd)) {
      mode = 'none';
    } else if (mode === 'targetEval') {
      d.targetBarrierEval[turn] += line + '\n';
    } else if (mode === 'userEval') {
      d.userBarrierEval[turn] += line + '\n';
    } else if (mode === 'penRateEval') {
      d.barrierPenetrationRateEval += line + '\n';
    } else if (mode === 'penFlatEval') {
      d.barrierPenetrationFlatEval += line + '\n';
    } else if (mode === 'pointsEval') {
      d.battleStartBarrierPointsEval[turn] += line + '\n';
    } else if (mode === 'regenEval') {
      d.barrierRegenEval[turn] += line + '\n';
    } else if (mode === 'onApply') {
      d.onApplyEval += line + '\n';
    } else if (mode === 'onFresh') {
      d.onFreshApplyEval += line + '\n';
    } else if (mode === 'onReduce') {
      d.onReduceEval += line + '\n';
    } else if (mode === 'onBreak') {
      d.onBreakEval += line + '\n';
    }
  }

  if (found) {
    obj.jakeCBarrier = obj.jakeCBarrier || {};
    obj.jakeCBarrier[id] = d;
  }
};

//=============================================================================
// Game_BattlerBase
//=============================================================================

Yanfly.ABR_JakeMSGAdd.Game_BattlerBase_clearAbsorptionBarrier =
    Game_BattlerBase.prototype.clearAbsorptionBarrier;
Game_BattlerBase.prototype.clearAbsorptionBarrier = function() {
    Yanfly.ABR_JakeMSGAdd.Game_BattlerBase_clearAbsorptionBarrier.call(this);
    this._barrierMaxValue = undefined;
};

// Add Custom Barrier states.
Yanfly.ABR_JakeMSGAdd.Game_BattlerBase_states =
    Game_BattlerBase.prototype.states;
Game_BattlerBase.prototype.states = function() {
    if (!Array.isArray(this._states)) {
        this._states = [];
    }
    var array = Yanfly.ABR_JakeMSGAdd.Game_BattlerBase_states.call(this);
    var ids = Yanfly.ABR_JakeMSGAdd.customIds();
    if (ids.length <= 0 || !this.cBarrierPoints) return array;
    for (var i = 0; i < ids.length; i++) {
      var cfg = Yanfly.ABR_JakeMSGAdd.channelConfig(ids[i]);
      if (cfg.state > 0 && this.cBarrierPoints(ids[i]) > 0) {
        var st = $dataStates[cfg.state];
        if (st && array.indexOf(st) < 0) array.push(st);
      }
    }
    return array;
};

//=============================================================================
// Game_Battler - default barrier eval timings + max value
//=============================================================================

Game_Battler.prototype.getBarrierEvalObjects = function() {
    return this.states();
};

Game_Battler.prototype.barrierEvalProperty = function(timing) {
    switch (timing) {
    case 'apply':
      return 'barrierOnApplyEval';
    case 'freshApply':
      return 'barrierOnFreshApplyEval';
    case 'reduce':
      return 'barrierOnReduceEval';
    case 'break':
      return 'barrierOnBreakEval';
    }
    return '';
};

Game_Battler.prototype.getBarrierEvalFormulas = function(timing) {
    var key = this.barrierEvalProperty(timing);
    var result = [];
    if (key === '') return result;
    var objects = this.getBarrierEvalObjects();
    for (var i = 0; i < objects.length; ++i) {
      var obj = objects[i];
      if (obj && obj[key] !== undefined && obj[key] !== '') {
        result.push(obj[key]);
      }
    }
    return result;
};

Game_Battler.prototype.runBarrierEval = function(timing, context) {
    if (this._barrierEvalRunning) return;
    var formulas = this.getBarrierEvalFormulas(timing);
    if (!formulas || formulas.length === 0) return;
    this._barrierEvalRunning = true;
    try {
      for (var i = 0; i < formulas.length; ++i) {
        this.processBarrierEval(formulas[i], context);
      }
    } finally {
      this._barrierEvalRunning = false;
    }
};

Game_Battler.prototype.processBarrierEval = function(formula, context) {
    if (formula === '') return;
    this.initAbsorptionBarrier();
    var a = this;
    var b = this;
    var user = this;
    var subject = this;
    var target = this;
    var s = $gameSwitches._data;
    var v = $gameVariables._data;
    var preAbsorb = !!(context && context.preAbsorb);
    var before = context ? context.before : this.barrierPoints();
    var barrier_value = (context && context.projectedBarrier !== undefined) ?
      context.projectedBarrier : this.barrierPoints();
    var origBarrier = barrier_value;
    var damage_value = context ? context.damageValue : 0;
    var origDamage = damage_value;
    var change_value = barrier_value - before;
    var origChange = change_value;
    try {
      eval(formula);
    } catch (e) {
      Yanfly.Util.displayError(e, formula, 'BARRIER TIMING CUSTOM CODE ERROR');
    }
    var changed = (change_value !== origChange) ||
      (barrier_value !== origBarrier);
    var newValue = (change_value !== origChange) ? (before + change_value) :
      barrier_value;
    newValue = Math.floor(newValue);
    if (newValue < 0) newValue = 0;
    var maxValue = this.barrierMaxValue();
    if (maxValue >= 0 && newValue > maxValue) newValue = maxValue;
    if (preAbsorb) {
      if (changed) {
        context.resolvedBarrier = newValue;
        context.barrierResolved = true;
        context.projectedBarrier = newValue;
      }
    } else if (newValue !== this.barrierPoints()) {
      this.setBarrierTotal(newValue);
    }
    if (context && damage_value !== origDamage) {
      context.damageValue = Math.max(0, Math.floor(damage_value));
      context.damageModified = true;
    }
};

Game_Battler.prototype.barrierMaxValue = function() {
    if (this._barrierMaxValue !== undefined) {
      return (this._barrierMaxValue < 0) ? -1 : this._barrierMaxValue;
    }
    var best = -1;
    var objects = this.getBarrierEvalObjects();
    for (var i = 0; i < objects.length; ++i) {
      var obj = objects[i];
      if (obj && obj.barrierMaxValue !== undefined && obj.barrierMaxValue >= 0) {
        best = (best < 0) ? obj.barrierMaxValue :
          Math.min(best, obj.barrierMaxValue);
      }
    }
    return best;
};

Game_Battler.prototype.setBarrierMaxValue = function(value) {
    this.initAbsorptionBarrier();
    this._barrierMaxValue = Math.floor(value);
    this.applyBarrierMaxCap();
};

// Script call alias.
Game_Battler.prototype.setMaxBarrier = function(value) {
    this.setBarrierMaxValue(value);
};

Game_Battler.prototype.applyBarrierMaxCap = function() {
    var maxValue = this.barrierMaxValue();
    if (maxValue < 0) return;
    if (this.barrierPoints() > maxValue) {
      this.setBarrierTotal(maxValue);
    }
};

Game_Battler.prototype.setBarrierTotal = function(value) {
    this.initAbsorptionBarrier();
    value = Math.max(0, Math.floor(value));
    var current = this.barrierPoints();
    if (value === current) return;
    if (value > current) {
      this._permBarrier = (this._permBarrier || 0) + (value - current);
    } else {
      var reduction = current - value;
      var length = this._turnBarrier.length;
      for (var i = 0; i < length; ++i) {
        this._turnBarrier[i] = this._turnBarrier[i] || 0;
        var r = Math.min(this._turnBarrier[i], reduction);
        this._turnBarrier[i] -= r;
        reduction -= r;
        if (reduction <= 0) break;
      }
      if (reduction > 0) {
        this._permBarrier = Math.max(0, (this._permBarrier || 0) - reduction);
      }
    }
    this._barrierAltered = true;
    this.refresh();
};

Yanfly.ABR_JakeMSGAdd.Game_Battler_gainBarrier =
    Game_Battler.prototype.gainBarrier;
Game_Battler.prototype.gainBarrier = function(value, turn) {
    this.initAbsorptionBarrier();
    var before = this.barrierPoints();
    Yanfly.ABR_JakeMSGAdd.Game_Battler_gainBarrier.call(this, value, turn);
    this.applyBarrierMaxCap();
    var after = this.barrierPoints();
    if (after > before) {
      var ctx = { damageValue: 0, before: before };
      if (before <= 0) this.runBarrierEval('freshApply', ctx);
      this.runBarrierEval('apply', ctx);
    } else if (after < before) {
      var ctx2 = { damageValue: 0, before: before };
      this.runBarrierEval('reduce', ctx2);
      if (after <= 0) this.runBarrierEval('break', ctx2);
    }
};

// Reimplemented so the reduce/break eval timings fire BEFORE the barrier
// absorbs. The eval may change damage_value (the incoming damage), barrier_value
// or change_value; the actual absorption is then computed from those values.
Yanfly.ABR_JakeMSGAdd.Game_Battler_loseBarrier =
    Game_Battler.prototype.loseBarrier;
Game_Battler.prototype.loseBarrier = function(value, penRate, penFlat) {
    if (penRate === undefined) penRate = 1;
    if (penFlat === undefined) penFlat = 0;
    value = Math.ceil(value);
    if (value <= 0) return 0;
    this.initAbsorptionBarrier();
    var before = this.barrierPoints();
    if (before <= 0) return value;
    var calcValue = Math.ceil(value * penRate - penFlat);
    if (calcValue < 0) calcValue = 0;
    var projAbsorbed = Math.min(before, calcValue);
    var projAfter = before - projAbsorbed;
    var context = {
      preAbsorb: true,
      before: before,
      projectedBarrier: projAfter,
      damageValue: value
    };
    if (projAbsorbed > 0) {
      this.runBarrierEval('reduce', context);
      if (projAfter <= 0) this.runBarrierEval('break', context);
    }
    return this.jakeApplyBarrierAbsorption('default', context, value, penRate,
      penFlat, before);
};

// Resolves a barrier's absorption after its pre-absorb eval has run, applies it,
// shows the barrier-damage popup, and returns the leftover damage to pass on.
Game_Battler.prototype.jakeApplyBarrierAbsorption = function(channel, context,
    value, penRate, penFlat, before) {
    var damage = context.damageModified ? context.damageValue : value;
    var finalBarrier;
    if (context.barrierResolved) {
      finalBarrier = context.resolvedBarrier;
    } else {
      var cv = Math.ceil(damage * penRate - penFlat);
      if (cv < 0) cv = 0;
      finalBarrier = before - Math.min(before, cv);
    }
    finalBarrier = Math.max(0, Math.floor(finalBarrier));
    var max = (channel === 'default') ? this.barrierMaxValue() :
      this.cBarrierMaxValue(channel);
    if (max >= 0 && finalBarrier > max) finalBarrier = max;
    var absorbed = before - finalBarrier;
    if (absorbed !== 0) {
      if (channel === 'default') this.setBarrierTotal(finalBarrier);
      else this.setCBarrierTotal(channel, finalBarrier);
    }
    if (absorbed > 0) this.jakeShowBarrierDamagePopup(absorbed, channel);
    var leftover = damage - Math.max(0, absorbed);
    if (leftover < 0) leftover = 0;
    return leftover;
};

Game_Battler.prototype.jakeShowBarrierDamagePopup = function(amount, channel) {
    if (channel === 'default') this.startBarrierAnimation();
    else this.startCBarrierAnimation(channel);
    if (Imported.YEP_BattleEngineCore) {
      var saved = JsonEx.makeDeepCopy(this._result);
      this._result = new Game_ActionResult();
      this._result.hpDamage = amount;
      this._result._barrierAffected = true;
      if (channel !== 'default') {
        this._result._jakeCBarrierPopup =
          Yanfly.ABR_JakeMSGAdd.channelConfig(channel).popup;
      }
      this._result.hpAffected = true;
      this.startDamagePopup();
      this._result = saved;
    }
};

//=============================================================================
// Game_Battler - Custom Barriers
//=============================================================================

Game_Battler.prototype.initCustomBarriers = function() {
    this._customBarriers = this._customBarriers || {};
};

Game_Battler.prototype.customBarrierData = function(id) {
    this.initCustomBarriers();
    if (!this._customBarriers[id]) {
      this._customBarriers[id] = {
        turnBarrier: [], permBarrier: 0, maxValue: undefined
      };
    }
    return this._customBarriers[id];
};

Game_Battler.prototype.clearCustomBarrier = function(id) {
    this.initCustomBarriers();
    this._customBarriers[id] = {
      turnBarrier: [], permBarrier: 0, maxValue: undefined
    };
    this._barrierAltered = true;
};

Game_Battler.prototype.jakeBarrierFullSources = function() {
    return this.states();
};

Game_Battler.prototype.cBarrierPoints = function(id, turn) {
    var d = this.customBarrierData(id);
    if (turn < 0) {
      return d.permBarrier || 0;
    } else if (turn >= 0) {
      d.turnBarrier[turn] = d.turnBarrier[turn] || 0;
      return d.turnBarrier[turn];
    }
    var value = d.permBarrier || 0;
    for (var i = 0; i < d.turnBarrier.length; ++i) {
      value += d.turnBarrier[i] || 0;
    }
    return value;
};

Game_Battler.prototype.cBarrierPointsTotal = function(id, turn) {
    var d = this.customBarrierData(id);
    var total = d.permBarrier || 0;
    for (var i = 0; i < turn; ++i) {
      total += d.turnBarrier[i] || 0;
    }
    return total;
};

Game_Battler.prototype.gainCBarrier = function(id, value, turn) {
    var d = this.customBarrierData(id);
    var before = this.cBarrierPoints(id);
    value = Math.floor(value);
    if (turn > 0) {
      turn -= 1;
      d.turnBarrier[turn] = (d.turnBarrier[turn] || 0) + value;
      d.turnBarrier[turn] = Math.max(0, d.turnBarrier[turn]);
    } else {
      d.permBarrier = (d.permBarrier || 0) + value;
      d.permBarrier = Math.max(0, d.permBarrier);
    }
    this._barrierAltered = true;
    this.applyCBarrierMaxCap(id);
    this.refresh();
    var after = this.cBarrierPoints(id);
    if (after > before) {
      var ctx = { damageValue: 0, before: before };
      if (before <= 0) this.runCBarrierEval(id, 'freshApply', ctx);
      this.runCBarrierEval(id, 'apply', ctx);
    } else if (after < before) {
      var ctx2 = { damageValue: 0, before: before };
      this.runCBarrierEval(id, 'reduce', ctx2);
      if (after <= 0) this.runCBarrierEval(id, 'break', ctx2);
    }
};

// Like loseBarrier, the reduce/break eval timings fire BEFORE this Custom
// Barrier absorbs; the absorption is then computed from the (possibly modified)
// damage_value / barrier_value / change_value.
Game_Battler.prototype.loseCBarrier = function(id, value, penRate, penFlat) {
    if (penRate === undefined) penRate = 1;
    if (penFlat === undefined) penFlat = 0;
    value = Math.ceil(value);
    if (value <= 0) return 0;
    var before = this.cBarrierPoints(id);
    if (before <= 0) return value;
    var calcValue = Math.ceil(value * penRate - penFlat);
    if (calcValue < 0) calcValue = 0;
    var projAbsorbed = Math.min(before, calcValue);
    var projAfter = before - projAbsorbed;
    var context = {
      preAbsorb: true,
      before: before,
      projectedBarrier: projAfter,
      damageValue: value
    };
    if (projAbsorbed > 0) {
      this.runCBarrierEval(id, 'reduce', context);
      if (projAfter <= 0) this.runCBarrierEval(id, 'break', context);
    }
    return this.jakeApplyBarrierAbsorption(id, context, value, penRate, penFlat,
      before);
};

Game_Battler.prototype.loseCBarrierTurn = function(id, value, turn) {
    value = Math.abs(value);
    var barrierPoints = this.cBarrierPointsTotal(id, turn);
    var dmg = Math.min(value, barrierPoints);
    this.loseCBarrier(id, dmg);
};

Game_Battler.prototype.setCBarrierTotal = function(id, value) {
    var d = this.customBarrierData(id);
    value = Math.max(0, Math.floor(value));
    var current = this.cBarrierPoints(id);
    if (value === current) return;
    if (value > current) {
      d.permBarrier = (d.permBarrier || 0) + (value - current);
    } else {
      var reduction = current - value;
      for (var i = 0; i < d.turnBarrier.length; ++i) {
        d.turnBarrier[i] = d.turnBarrier[i] || 0;
        var r = Math.min(d.turnBarrier[i], reduction);
        d.turnBarrier[i] -= r;
        reduction -= r;
        if (reduction <= 0) break;
      }
      if (reduction > 0) {
        d.permBarrier = Math.max(0, (d.permBarrier || 0) - reduction);
      }
    }
    this._barrierAltered = true;
    this.refresh();
};

Game_Battler.prototype.cBarrierMaxValue = function(id) {
    var d = this.customBarrierData(id);
    if (d.maxValue !== undefined) {
      return (d.maxValue < 0) ? -1 : d.maxValue;
    }
    var best = -1;
    var objects = this.getBarrierEvalObjects();
    for (var i = 0; i < objects.length; ++i) {
      var obj = objects[i];
      var data = obj && obj.jakeCBarrier && obj.jakeCBarrier[id];
      if (data && data.maxValue !== undefined && data.maxValue >= 0) {
        best = (best < 0) ? data.maxValue : Math.min(best, data.maxValue);
      }
    }
    return best;
};

Game_Battler.prototype.setCBarrierMaxValue = function(id, value) {
    var d = this.customBarrierData(id);
    d.maxValue = Math.floor(value);
    this.applyCBarrierMaxCap(id);
};

// Script call alias.
Game_Battler.prototype.setMaxCBarrier = function(id, value) {
    this.setCBarrierMaxValue(id, value);
};

Game_Battler.prototype.applyCBarrierMaxCap = function(id) {
    var maxValue = this.cBarrierMaxValue(id);
    if (maxValue < 0) return;
    if (this.cBarrierPoints(id) > maxValue) {
      this.setCBarrierTotal(id, maxValue);
    }
};

Game_Battler.prototype.startCBarrierAnimation = function(id) {
    var cfg = Yanfly.ABR_JakeMSGAdd.channelConfig(id);
    if (this.cBarrierPoints(id) > 0) {
      if (cfg.ani1 > 0) this.startAnimation(cfg.ani1);
    } else {
      if (cfg.ani2 > 0) this.startAnimation(cfg.ani2);
    }
};

Game_Battler.prototype.updateCBarrierTurns = function(id) {
    var d = this.customBarrierData(id);
    if (this.cBarrierPoints(id) <= 0) return;
    d.turnBarrier.shift();
    this._barrierAltered = true;
    this.refresh();
};

Game_Battler.prototype.cBarrierEvalProperty = function(timing) {
    switch (timing) {
    case 'apply':
      return 'onApplyEval';
    case 'freshApply':
      return 'onFreshApplyEval';
    case 'reduce':
      return 'onReduceEval';
    case 'break':
      return 'onBreakEval';
    }
    return '';
};

Game_Battler.prototype.getCBarrierEvalFormulas = function(id, timing) {
    var key = this.cBarrierEvalProperty(timing);
    var result = [];
    if (key === '') return result;
    var objects = this.getBarrierEvalObjects();
    for (var i = 0; i < objects.length; ++i) {
      var obj = objects[i];
      var data = obj && obj.jakeCBarrier && obj.jakeCBarrier[id];
      if (data && data[key] !== undefined && data[key] !== '') {
        result.push(data[key]);
      }
    }
    return result;
};

Game_Battler.prototype.runCBarrierEval = function(id, timing, context) {
    if (this._barrierEvalRunning) return;
    var formulas = this.getCBarrierEvalFormulas(id, timing);
    if (!formulas || formulas.length === 0) return;
    this._barrierEvalRunning = true;
    try {
      for (var i = 0; i < formulas.length; ++i) {
        this.processCBarrierEval(id, formulas[i], context);
      }
    } finally {
      this._barrierEvalRunning = false;
    }
};

Game_Battler.prototype.processCBarrierEval = function(id, formula, context) {
    if (formula === '') return;
    var a = this;
    var b = this;
    var user = this;
    var subject = this;
    var target = this;
    var s = $gameSwitches._data;
    var v = $gameVariables._data;
    var preAbsorb = !!(context && context.preAbsorb);
    var before = context ? context.before : this.cBarrierPoints(id);
    var cBarrier_value = (context && context.projectedBarrier !== undefined) ?
      context.projectedBarrier : this.cBarrierPoints(id);
    var origBarrier = cBarrier_value;
    var damage_value = context ? context.damageValue : 0;
    var origDamage = damage_value;
    var change_value = cBarrier_value - before;
    var origChange = change_value;
    try {
      eval(formula);
    } catch (e) {
      Yanfly.Util.displayError(e, formula,
        'CUSTOM BARRIER TIMING CUSTOM CODE ERROR');
    }
    var changed = (change_value !== origChange) ||
      (cBarrier_value !== origBarrier);
    var newValue = (change_value !== origChange) ? (before + change_value) :
      cBarrier_value;
    newValue = Math.floor(newValue);
    if (newValue < 0) newValue = 0;
    var maxValue = this.cBarrierMaxValue(id);
    if (maxValue >= 0 && newValue > maxValue) newValue = maxValue;
    if (preAbsorb) {
      if (changed) {
        context.resolvedBarrier = newValue;
        context.barrierResolved = true;
        context.projectedBarrier = newValue;
      }
    } else if (newValue !== this.cBarrierPoints(id)) {
      this.setCBarrierTotal(id, newValue);
    }
    if (context && damage_value !== origDamage) {
      context.damageValue = Math.max(0, Math.floor(damage_value));
      context.damageModified = true;
    }
};

// --- Custom Barrier penetration ---------------------------------------------

Game_Battler.prototype.cBarrierPenetrationRate = function(id) {
    var rate = 1;
    var objects = this.jakeBarrierFullSources();
    for (var i = 0; i < objects.length; ++i) {
      var data = objects[i] && objects[i].jakeCBarrier &&
        objects[i].jakeCBarrier[id];
      if (data && data.barrierPenetrationRate !== undefined) {
        rate *= (1 - data.barrierPenetrationRate);
      }
    }
    return 1 - rate;
};

Game_Battler.prototype.cBarrierPenetrationFlat = function(id) {
    var value = 0;
    var objects = this.jakeBarrierFullSources();
    for (var i = 0; i < objects.length; ++i) {
      var data = objects[i] && objects[i].jakeCBarrier &&
        objects[i].jakeCBarrier[id];
      if (data && data.barrierPenetrationFlat !== undefined) {
        value += data.barrierPenetrationFlat;
      }
    }
    return value;
};

Game_Battler.prototype.cBarrierPenetrationRateEval = function(id, c1, c2, c3,
    c4) {
    var rate = 1;
    var objects = this.jakeBarrierFullSources();
    for (var i = 0; i < objects.length; ++i) {
      var data = objects[i] && objects[i].jakeCBarrier &&
        objects[i].jakeCBarrier[id];
      if (data && data.barrierPenetrationRateEval) {
        rate *= (1 - this.getbarrierPenRateEval(data.barrierPenetrationRateEval,
          c1, c2, c3, c4));
      }
    }
    return 1 - rate;
};

Game_Battler.prototype.cBarrierPenetrationFlatEval = function(id, c1, c2, c3,
    c4) {
    var value = 0;
    var objects = this.jakeBarrierFullSources();
    for (var i = 0; i < objects.length; ++i) {
      var data = objects[i] && objects[i].jakeCBarrier &&
        objects[i].jakeCBarrier[id];
      if (data && data.barrierPenetrationFlatEval) {
        value += this.getbarrierPenFlatEval(data.barrierPenetrationFlatEval,
          c1, c2, c3, c4);
      }
    }
    return value;
};

// --- Custom Barrier battle start + regen ------------------------------------

Game_Battler.prototype.makeOnBattleStartCBarrierPoints = function() {
    var ids = Yanfly.ABR_JakeMSGAdd.customIds();
    for (var c = 0; c < ids.length; c++) {
      var id = ids[c];
      var barriers = this.cBattleStartBarrierPoints(id);
      for (var i = 0; i < barriers.length; ++i) {
        var value = barriers[i] || 0;
        if (value !== 0) this.gainCBarrier(id, value, i);
      }
    }
};

Game_Battler.prototype.cBattleStartBarrierPoints = function(id) {
    var array = [];
    var objects = this.jakeBarrierFullSources();
    for (var i = 0; i < objects.length; ++i) {
      this.makeCBattleStartBarrierPoints(array, objects[i], id);
    }
    return array;
};

Game_Battler.prototype.makeCBattleStartBarrierPoints = function(array, obj, id) {
    var data = obj && obj.jakeCBarrier && obj.jakeCBarrier[id];
    if (!data) return array;
    if (data.battleStartBarrierPoints !== undefined) {
      for (var i = 0; i < data.battleStartBarrierPoints.length; ++i) {
        array[i] = (array[i] || 0) + (data.battleStartBarrierPoints[i] || 0);
      }
    }
    if (data.battleStartBarrierPointsEval !== undefined) {
      for (var j = 0; j < data.battleStartBarrierPointsEval.length; ++j) {
        var formula = data.battleStartBarrierPointsEval[j] || '';
        array[j] = (array[j] || 0) +
          this.makeBattleStartBarrierPointsEval(formula);
      }
    }
    return array;
};

Game_Battler.prototype.regenCBarriers = function() {
    var ids = Yanfly.ABR_JakeMSGAdd.customIds();
    for (var c = 0; c < ids.length; c++) {
      var id = ids[c];
      var barriers = this.getCRegenBarriers(id);
      for (var i = 0; i < barriers.length; ++i) {
        var value = barriers[i] || 0;
        if (value !== 0) this.gainCBarrier(id, value, i);
      }
    }
};

Game_Battler.prototype.getCRegenBarriers = function(id) {
    var array = [];
    var objects = this.jakeBarrierFullSources();
    for (var i = 0; i < objects.length; ++i) {
      this.makeCRegenBarrierPoints(array, objects[i], id);
    }
    return array;
};

Game_Battler.prototype.makeCRegenBarrierPoints = function(array, obj, id) {
    var data = obj && obj.jakeCBarrier && obj.jakeCBarrier[id];
    if (!data) return;
    if (data.barrierRegen !== undefined) {
      for (var i = 0; i < data.barrierRegen.length; ++i) {
        array[i] = (array[i] || 0) + (data.barrierRegen[i] || 0);
      }
    }
    if (data.barrierRegenEval !== undefined) {
      for (var j = 0; j < data.barrierRegenEval.length; ++j) {
        var formula = data.barrierRegenEval[j] || '';
        array[j] = (array[j] || 0) +
          this.makeBattleStartBarrierPointsEval(formula);
      }
    }
};

// --- Custom Barrier battle hooks --------------------------------------------

Yanfly.ABR_JakeMSGAdd.Game_Battler_onBattleStart =
    Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function() {
    Yanfly.ABR_JakeMSGAdd.Game_Battler_onBattleStart.call(this);
    var ids = Yanfly.ABR_JakeMSGAdd.customIds();
    for (var i = 0; i < ids.length; i++) {
      if (Yanfly.ABR_JakeMSGAdd.channelConfig(ids[i]).clearPerBattle) {
        this.clearCustomBarrier(ids[i]);
      }
    }
    this.makeOnBattleStartCBarrierPoints();
};

Yanfly.ABR_JakeMSGAdd.Game_Battler_onBattleEnd =
    Game_Battler.prototype.onBattleEnd;
Game_Battler.prototype.onBattleEnd = function() {
    Yanfly.ABR_JakeMSGAdd.Game_Battler_onBattleEnd.call(this);
    var ids = Yanfly.ABR_JakeMSGAdd.customIds();
    for (var i = 0; i < ids.length; i++) {
      if (Yanfly.ABR_JakeMSGAdd.channelConfig(ids[i]).clearPerBattle) {
        this.clearCustomBarrier(ids[i]);
      }
    }
};

Yanfly.ABR_JakeMSGAdd.Game_Battler_regenerateAll =
    Game_Battler.prototype.regenerateAll;
Game_Battler.prototype.regenerateAll = function() {
    Yanfly.ABR_JakeMSGAdd.Game_Battler_regenerateAll.call(this);
    if (!$gameParty.inBattle()) return;
    if (this.isAlive()) {
      var ids = Yanfly.ABR_JakeMSGAdd.customIds();
      for (var i = 0; i < ids.length; i++) {
        this.updateCBarrierTurns(ids[i]);
      }
      this.regenCBarriers();
    }
};

Yanfly.ABR_JakeMSGAdd.Game_Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
    var deathState = (stateId === this.deathStateId());
    var lifeState = this.isAlive();
    Yanfly.ABR_JakeMSGAdd.Game_Battler_addState.call(this, stateId);
    if (deathState && lifeState !== this.isAlive()) {
      var ids = Yanfly.ABR_JakeMSGAdd.customIds();
      for (var i = 0; i < ids.length; i++) {
        if (Yanfly.ABR_JakeMSGAdd.channelConfig(ids[i]).clearOnDeath) {
          this.clearCustomBarrier(ids[i]);
        }
      }
    }
};

//=============================================================================
// Game_Actor / Game_Enemy
//=============================================================================

Game_Actor.prototype.getBarrierEvalObjects = function() {
    var objects = Game_Battler.prototype.getBarrierEvalObjects.call(this);
    if (this.actor()) objects.push(this.actor());
    return objects;
};

Game_Actor.prototype.jakeBarrierFullSources = function() {
    var objects = Game_Battler.prototype.jakeBarrierFullSources.call(this);
    var equips = this.equips();
    for (var i = 0; i < equips.length; ++i) {
      if (equips[i]) objects.push(equips[i]);
    }
    if (this.actor()) objects.push(this.actor());
    if (this.currentClass()) objects.push(this.currentClass());
    return objects;
};

Game_Enemy.prototype.getBarrierEvalObjects = function() {
    var objects = Game_Battler.prototype.getBarrierEvalObjects.call(this);
    if (this.enemy()) objects.push(this.enemy());
    return objects;
};

Game_Enemy.prototype.jakeBarrierFullSources = function() {
    var objects = Game_Battler.prototype.jakeBarrierFullSources.call(this);
    if (this.enemy()) objects.push(this.enemy());
    return objects;
};

//=============================================================================
// Game_Action
//=============================================================================

Yanfly.ABR_JakeMSGAdd.Game_Action_applyItemBarrierEffect =
    Game_Action.prototype.applyItemBarrierEffect;
Game_Action.prototype.applyItemBarrierEffect = function(target) {
    this.applyBarrierMaxValueEffect(target);
    Yanfly.ABR_JakeMSGAdd.Game_Action_applyItemBarrierEffect.call(this, target);
    this.applyCustomBarrierEffects(target);
};

Game_Action.prototype.applyBarrierMaxValueEffect = function(target) {
    var item = this.item();
    if (!item) return;
    if (item.userMaxBarrier !== undefined && this.subject()) {
      this.subject().setBarrierMaxValue(item.userMaxBarrier);
    }
    if (item.targetMaxBarrier !== undefined && target) {
      target.setBarrierMaxValue(item.targetMaxBarrier);
    }
};

Game_Action.prototype.applyCustomBarrierEffects = function(target) {
    var item = this.item();
    if (!item) return;
    var ids = Yanfly.ABR_JakeMSGAdd.customIds();
    for (var c = 0; c < ids.length; c++) {
      var id = ids[c];
      var idata = item.jakeCBarrier && item.jakeCBarrier[id];
      if (idata) {
        if (idata.userMaxBarrier !== undefined && this.subject()) {
          this.subject().setCBarrierMaxValue(id, idata.userMaxBarrier);
        }
        if (idata.targetMaxBarrier !== undefined && target) {
          target.setCBarrierMaxValue(id, idata.targetMaxBarrier);
        }
      }
      if (target) this.gainCustomBarrierBonus(target, true, id);
      this.gainCustomBarrierBonus(this.subject(), false, id);
    }
};

Game_Action.prototype.gainCustomBarrierBonus = function(target, isTarget, id) {
    var item = this.item();
    var idata = item.jakeCBarrier && item.jakeCBarrier[id];
    if (!idata) return;
    var barriers = (isTarget ? idata.targetBarrier : idata.userBarrier) || [];
    var evalBarriers =
      (isTarget ? idata.targetBarrierEval : idata.userBarrierEval) || [];
    var length = Math.max(barriers.length, evalBarriers.length);
    if (length <= 0) return;
    for (var i = 0; i < length; ++i) {
      var t = i;
      if (t > 0 && target === this.subject()) t += 1;
      var value = barriers[i] || 0;
      value += target.gainBarrierEval(evalBarriers[i] || '', t, this.subject(),
        target);
      if (value > 0) {
        target.gainCBarrier(id, value, t);
      } else if (value < 0) {
        target.loseCBarrierTurn(id, value, t);
      }
    }
    target.refresh();
};

// Stops the base plugin from handling the default barrier inside its own
// executeHpDamage while this plugin handles every barrier itself.
Yanfly.ABR_JakeMSGAdd.Game_Action_isAffectBarrierPoints =
    Game_Action.prototype.isAffectBarrierPoints;
Game_Action.prototype.isAffectBarrierPoints = function(target, value) {
    if (this._jakeSkipDefaultBarrier) return false;
    return Yanfly.ABR_JakeMSGAdd.Game_Action_isAffectBarrierPoints.call(this,
      target, value);
};

Yanfly.ABR_JakeMSGAdd.Game_Action_executeHpDamage =
    Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
    value = this.jakeApplyAllBarriers(target, value);
    this._jakeSkipDefaultBarrier = true;
    try {
      Yanfly.ABR_JakeMSGAdd.Game_Action_executeHpDamage.call(this, target,
        value);
    } finally {
      this._jakeSkipDefaultBarrier = false;
    }
    if (this._jakeBarrierShowZero) return;
    if (this._jakeBarrierHit && target && target._result.hpDamage === 0) {
      target._result.hpAffected = false;
    }
};

Game_Action.prototype.jakeApplyAllBarriers = function(target, value) {
    this._jakeBarrierHit = false;
    this._jakeBarrierShowZero = false;
    if (value <= 0) return value;
    var order = Yanfly.ABR_JakeMSGAdd.channelDamageOrder();
    for (var i = 0; i < order.length; ++i) {
      if (value <= 0) break;
      var ch = order[i];
      var pts = (ch === 'default') ? target.barrierPoints() :
        (target.cBarrierPoints ? target.cBarrierPoints(ch) : 0);
      if (pts > 0) {
        this._jakeBarrierHit = true;
        if (Yanfly.ABR_JakeMSGAdd.channelConfig(ch).display0) {
          this._jakeBarrierShowZero = true;
        }
        if (ch === 'default') {
          var penRate = this.calcBarrierPenetrationRate(target, value);
          var penFlat = this.calcBarrierPenetrationFlat(target, value);
          value = target.loseBarrier(value, penRate, penFlat);
        } else {
          var cpenRate = this.calcCBarrierPenetrationRate(ch, target, value);
          var cpenFlat = this.calcCBarrierPenetrationFlat(ch, target, value);
          value = target.loseCBarrier(ch, value, cpenRate, cpenFlat);
        }
      }
    }
    return value;
};

Game_Action.prototype.calcCBarrierPenetrationRate = function(id, target,
    value) {
    var item = this.item();
    var idata = item && item.jakeCBarrier && item.jakeCBarrier[id];
    var itemRate = (idata && idata.barrierPenetrationRate !== undefined) ?
      idata.barrierPenetrationRate :
      Yanfly.ABR_JakeMSGAdd.channelConfig(id).penRate;
    var rate = 1 - itemRate;
    rate *= 1 - this.cBarrierItemPenRateEval(id, target, value);
    rate *= 1 - this.subject().cBarrierPenetrationRate(id);
    rate *= 1 - this.subject().cBarrierPenetrationRateEval(id, this,
      this.subject(), target, value);
    return rate.clamp(0, 1);
};

Game_Action.prototype.cBarrierItemPenRateEval = function(id, target, value) {
    var item = this.item();
    var idata = item && item.jakeCBarrier && item.jakeCBarrier[id];
    var formula = idata && idata.barrierPenetrationRateEval;
    if (!formula) return 0;
    return this.subject().getbarrierPenRateEval(formula, item, this.subject(),
      target, value);
};

Game_Action.prototype.calcCBarrierPenetrationFlat = function(id, target,
    value) {
    var item = this.item();
    var idata = item && item.jakeCBarrier && item.jakeCBarrier[id];
    var flat = (idata && idata.barrierPenetrationFlat !== undefined) ?
      idata.barrierPenetrationFlat :
      Yanfly.ABR_JakeMSGAdd.channelConfig(id).penFlat;
    flat += this.cBarrierItemPenFlatEval(id, target, value);
    flat += this.subject().cBarrierPenetrationFlat(id);
    flat += this.subject().cBarrierPenetrationFlatEval(id, this, this.subject(),
      target, value);
    return flat.clamp(0, target.cBarrierPoints(id));
};

Game_Action.prototype.cBarrierItemPenFlatEval = function(id, target, value) {
    var item = this.item();
    var idata = item && item.jakeCBarrier && item.jakeCBarrier[id];
    var formula = idata && idata.barrierPenetrationFlatEval;
    if (!formula) return 0;
    return this.subject().getbarrierPenFlatEval(formula, item, this.subject(),
      target, value);
};

//=============================================================================
// Sprite_Damage - per-Custom-Barrier popup color
//=============================================================================

if (Imported.YEP_BattleEngineCore) {

Yanfly.ABR_JakeMSGAdd.Sprite_Damage_setup = Sprite_Damage.prototype.setup;
Sprite_Damage.prototype.setup = function(target) {
    var result = (target._damagePopup) ? target._damagePopup[0] : null;
    this._jakeCBarrierPopup = result ? result._jakeCBarrierPopup : null;
    Yanfly.ABR_JakeMSGAdd.Sprite_Damage_setup.call(this, target);
};

Yanfly.ABR_JakeMSGAdd.Sprite_Damage_setupBarrierEffect =
    Sprite_Damage.prototype.setupBarrierEffect;
Sprite_Damage.prototype.setupBarrierEffect = function() {
    if (this._jakeCBarrierPopup) {
      this._flashColor = this._jakeCBarrierPopup.slice();
      this._flashDuration = 180;
      return;
    }
    if (Yanfly.ABR_JakeMSGAdd.Sprite_Damage_setupBarrierEffect) {
      Yanfly.ABR_JakeMSGAdd.Sprite_Damage_setupBarrierEffect.call(this);
    }
};

} // Imported.YEP_BattleEngineCore

//=============================================================================
// Barrier Value Display + Multi-Barrier Gauge (HP gauges)
//=============================================================================

// Whether the battler currently has any barrier (default or custom) active.
Yanfly.ABR_JakeMSGAdd.battlerHasAnyBarrier = function(battler) {
    if (!battler) return false;
    if (battler.barrierPoints && battler.barrierPoints() > 0) return true;
    var ids = this.customIds();
    for (var i = 0; i < ids.length; i++) {
      if (battler.cBarrierPoints && battler.cBarrierPoints(ids[i]) > 0) {
        return true;
      }
    }
    return false;
};

// Draws the HP gauge with every active barrier stacked on top, left -> right
// in barrier order.
Window_Base.prototype.drawMultiBarrierGauge = function(battler, wx, wy, ww) {
    var hp = battler.hp;
    var mhp = battler.mhp;
    var order = Yanfly.ABR_JakeMSGAdd.channelVisualOrder();
    var segs = [];
    var totalBarrier = 0;
    for (var i = 0; i < order.length; i++) {
      var ch = order[i];
      var pts = (ch === 'default') ? battler.barrierPoints() :
        (battler.cBarrierPoints ? battler.cBarrierPoints(ch) : 0);
      if (pts > 0) {
        var cfg = Yanfly.ABR_JakeMSGAdd.channelConfig(ch);
        segs.push({
          pts: pts,
          c1: this.textColor(cfg.color1),
          c2: this.textColor(cfg.color2)
        });
        totalBarrier += pts;
      }
    }
    if (segs.length === 0) {
      var hpRate = (mhp > 0) ? battler.hpRate() : 0;
      this.drawGauge(wx, wy, ww, hpRate, this.hpGaugeColor1(),
        this.hpGaugeColor2());
      return ww;
    }
    var total = hp + totalBarrier;
    var max = (total > mhp) ? total : mhp;
    if (max <= 0) max = 1;
    var cum = hp;
    var bounds = [];
    for (var j = 0; j < segs.length; j++) {
      cum += segs[j].pts;
      bounds.push({ rate: cum / max, c1: segs[j].c1, c2: segs[j].c2 });
    }
    var last = bounds.length - 1;
    this.drawGauge(wx, wy, ww, bounds[last].rate, bounds[last].c1,
      bounds[last].c2);
    for (var k = last - 1; k >= 0; k--) {
      this.drawGauge(wx, wy, Math.floor(ww * bounds[k].rate), 1, bounds[k].c1,
        bounds[k].c2);
    }
    this.drawGauge(wx, wy, Math.floor(ww * (hp / max)), 1, this.hpGaugeColor1(),
      this.hpGaugeColor2());
    return ww;
};

// Replace the base single-barrier gauge with the multi-barrier one.
Window_Base.prototype.drawBarrierGauge = function(battler, wx, wy, ww) {
    return this.drawMultiBarrierGauge(battler, wx, wy, ww);
};

// Value display segments: one per active barrier, in barrier order, each with
// its own color/border.
Window_Base.prototype.jakeMSGBarrierValueSegments = function(battler) {
    if (!Imported.YEP_AbsorptionBarrier || !battler) return [];
    var order = Yanfly.ABR_JakeMSGAdd.channelVisualOrder();
    var segs = [];
    for (var i = 0; i < order.length; i++) {
      var ch = order[i];
      var pts;
      var max;
      if (ch === 'default') {
        if (!battler.barrierPoints) continue;
        pts = battler.barrierPoints();
        max = battler.barrierMaxValue ? battler.barrierMaxValue() : -1;
      } else {
        if (!battler.cBarrierPoints) continue;
        pts = battler.cBarrierPoints(ch);
        max = battler.cBarrierMaxValue ? battler.cBarrierMaxValue(ch) : -1;
      }
      if (pts > 0) {
        var cfg = Yanfly.ABR_JakeMSGAdd.channelConfig(ch);
        var text = ' | ' + Yanfly.Util.toGroup(pts);
        if (max >= 0) text = text + '/' + Yanfly.Util.toGroup(max);
        segs.push({ text: text, color: cfg.valueColor, border: cfg.valueBorder });
      }
    }
    return segs;
};

// Total width (at the current font size) of all barrier value segments.
Window_Base.prototype.jakeMSGBarrierValueWidth = function(battler) {
    var segs = this.jakeMSGBarrierValueSegments(battler);
    var w = 0;
    for (var i = 0; i < segs.length; i++) {
      w += this.textWidth(segs[i].text);
    }
    return w;
};

// Draws the barrier value segments flush against the right edge of
// [x, x+width], using each barrier's own colors and the current font size.
Window_Base.prototype.jakeMSGDrawBarrierValueSuffix = function(battler, x, y,
    width) {
    var segs = this.jakeMSGBarrierValueSegments(battler);
    if (segs.length === 0) return;
    var total = 0;
    var i;
    for (i = 0; i < segs.length; i++) {
      total += this.textWidth(segs[i].text);
    }
    var cursor = x + width - total;
    var prevTextColor = this.contents.textColor;
    var prevOutlineColor = this.contents.outlineColor;
    for (i = 0; i < segs.length; i++) {
      var sw = this.textWidth(segs[i].text);
      this.contents.outlineColor = segs[i].border;
      this.changeTextColor(segs[i].color);
      this.drawText(segs[i].text, cursor, y, sw, 'left');
      cursor += sw;
    }
    this.contents.outlineColor = prevOutlineColor;
    this.changeTextColor(prevTextColor);
};

// Wraps an "(battler, x, y, width)" HP-drawing method so that, when any barrier
// exists, the multi-barrier gauge is drawn, the inner drawCurrentAndMax call is
// squeezed to leave room, and the barrier value suffix is drawn.
Yanfly.ABR_JakeMSGAdd.wrapBarrierValueHpMethod = function(proto, methodName) {
    if (!proto) return false;
    var original = proto[methodName];
    if (typeof original !== 'function') return false;
    if (original._jakeMSGBarrierValueWrapped) return true;
    var wrapped = function(battler, x, y, width) {
      if (!Yanfly.ABR_JakeMSGAdd.battlerHasAnyBarrier(battler)) {
        return original.apply(this, arguments);
      }
      var self = this;
      // The barrier value text uses the font size of the context it sits in
      // (the size of the HP value drawn next to it).
      var fontSize = this.contents.fontSize;
      var sfx = this.jakeMSGBarrierValueWidth(battler);
      var defaultBp = (battler.barrierPoints) ? battler.barrierPoints() : 0;

      // When only Custom Barriers exist, the original draws a plain HP gauge
      // via drawGauge; redirect its first drawGauge call to the multi gauge.
      var gaugeShadow = (defaultBp <= 0);
      var hadOwnGauge, realDrawGauge;
      if (gaugeShadow) {
        hadOwnGauge = this.hasOwnProperty('drawGauge');
        realDrawGauge = this.drawGauge;
        this.drawGauge = function(dx, dy, dw, rate, c1, c2) {
          if (hadOwnGauge) self.drawGauge = realDrawGauge;
          else delete self.drawGauge;
          self.drawMultiBarrierGauge(battler, dx, dy, dw);
        };
      }

      var drewValue = false;
      var rx = x;
      var ry = y;
      var rw = width;
      var hadOwnDCM, origDCM;
      if (sfx > 0) {
        hadOwnDCM = this.hasOwnProperty('drawCurrentAndMax');
        origDCM = this.drawCurrentAndMax;
        this.drawCurrentAndMax = function(cur, max, dx, dy, dw, c1, c2) {
          drewValue = true;
          rx = dx;
          ry = dy;
          rw = dw;
          origDCM.call(this, cur, max, dx, dy, Math.max(0, dw - sfx), c1, c2);
        };
      }

      var result;
      try {
        result = original.apply(this, arguments);
      } finally {
        if (sfx > 0) {
          if (hadOwnDCM) this.drawCurrentAndMax = origDCM;
          else delete this.drawCurrentAndMax;
        }
        if (gaugeShadow && this.drawGauge !== realDrawGauge) {
          if (hadOwnGauge) this.drawGauge = realDrawGauge;
          else if (this.hasOwnProperty('drawGauge')) delete this.drawGauge;
        }
      }
      if (drewValue && sfx > 0) {
        var prevFS = this.contents.fontSize;
        this.contents.fontSize = fontSize;
        this.jakeMSGDrawBarrierValueSuffix(battler, rx, ry, rw);
        this.contents.fontSize = prevFS;
      }
      return result;
    };
    wrapped._jakeMSGBarrierValueWrapped = true;
    proto[methodName] = wrapped;
    return true;
};

Yanfly.ABR_JakeMSGAdd.installBarrierValueDisplay = function() {
    this.wrapBarrierValueHpMethod(Window_Base.prototype, 'drawActorHp');
    if (typeof Window_VisualHPGauge !== 'undefined') {
      this.wrapBarrierValueHpMethod(Window_VisualHPGauge.prototype,
        'drawActorHp');
    }
    if (typeof Window_EnemyInBattleStatus !== 'undefined') {
      this.wrapBarrierValueHpMethod(Window_EnemyInBattleStatus.prototype,
        'drawEnemyHp');
    }
    if (typeof Window_Help !== 'undefined' &&
        typeof Window_Help.prototype.drawJakeMSGEnemyHp === 'function') {
      this.wrapBarrierValueHpMethod(Window_Help.prototype,
        'drawJakeMSGEnemyHp');
    }
};

// Backup trigger, in case the DataManager hook is bypassed by load order.
Yanfly.ABR_JakeMSGAdd.Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
    Yanfly.ABR_JakeMSGAdd.installBarrierValueDisplay();
    Yanfly.ABR_JakeMSGAdd.Scene_Boot_start.call(this);
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
