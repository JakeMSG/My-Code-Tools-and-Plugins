//=============================================================================
// JakeMSG_SRD_TimedAttackAdditions
// JakeMSG_SRD_TimedAttackAdditions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_SRD_TimedAttackAdditions = true;


//=============================================================================
 /*:
 * @plugindesc Adds a method to modify TimedAttack properties within the game events
 * @author JakeMSG
 * v2.1
 * 
============ Change Log ============
2.1 - 5.25th.2026
 * Fixed a bug that made script calls reset default values for Properties not specfiied in those script calls
2.0 - 5.14th.2026
 * Added a fkton of new Properties, for each of the SRD Timed Attack types, and some that work for all types.
 * New properties, such as new Modes per Bar Timed Attack and Mash Timed Attack
 * Also new properties, for manipulating the visuals of Timed Attacks
 * For each of the new properties (and some of the old ones), added Default Plugin parameters, to set their default values
 * Added more script calls, to allow for using Timed Attacks directly, even outside of battles and without using skills
 * Finally, wrote 2 new Module plugins:
 * - JakeMSG_SRD_TimedAttackAdditions_Balance, which adds a new type of Timed Attack (Balance) and related properties and script calls
 * - JakeMSG_SRD_TimedAttackAdditions_XParallel, which adds new script calls to run multiple Timed Attacks in parallel, and control them during their execution 
1.1 - 3.25th.2026
 * Fixed runtime `$gameMap.changeTA()` parsing for custom visual properties.
 * Renamed angle property to `Angle Offset`.
 * Angle Offset now affects all supported Timed Attack types (Default, Circle, Clock, Arrows, Mash, Wheel).
 * Fixed Wheel runtime property assignment for `Ring Image` and `Target Image`.
 * Angle Offset now rotates around each Timed Attack visual center instead of top-left anchoring.
1.0 - 2.27th.2026
 * initial release
====================================
 * 
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * (This plugin needs to be loaded next to the other TimedAttack ones (preferably below them))
 *
 * Split modules load order:
 * 1) JakeMSG_SRD_TimedAttackAdditions
 * 2) JakeMSG_SRD_TimedAttackAdditions_Balance (optional)
 * 3) JakeMSG_SRD_TimedAttackAdditions_XParallel (optional)
 * 
 * This plugins makes it possible to modify, for already-prepared TimedAttack on data entries, their properties, via a new GameMap method.
 * Compatible with ALL SRD Timed Attack plugins!
 * 
 * Can be used both in and out of Combat.
 * Can also modify multiple properties at once, within the same method (split by ";").
 * 
 * Keep in mind to first prepare the TimedAttack on the data entry of your choice by placing the tags in the Editor first.
 * Also keep in mind this method WON'T be able to change the TimedAttack type (eg: from Default to Clock), you'll still have to use
 * different skills per each TimedAttack type.
 * 
 * 
 * Also adds support (Parameters) for Non-Sideview battles, when it comes to the visuals of the Timed Attacks (which are normally alligned with Sideview characters)
 * On this point, adds Properties for individual visual X&Y offsets for the TimedAttacks (usable by any type of TimedAttacks)
 * 
 * 
 * ==========================================================================
 *  New Parameters
 * ==========================================================================
 * 
 * New Parameters, first to set if Battle system is Sideview or not (to then use the rest of the parameters), 
 * then parameters for the X&Y offsets per Timed Attacks (both all TimedAttacks, and each type separatedly)
 * If Non-sideview, default 0,0 position of the Visuals is the Center of the screen
 * 
 * Then, default values for the new properties added in this plugin, for each of the Timed Attack types (Default, Circle, Clock, Arrows, Mash, Wheel) and some that work for all types.
 * 
 * ==========================================================================
 *  New Properties
 * ==========================================================================
 * 
 * ======== Individual Visual X/Y Offsets (for a specific TimedAttack, instead of for All) 
 * Visual X Offset: (Input a Positive Number or JavaScript Formula)*
 * Visual Y Offset: (Input a Positive Number or JavaScript Formula)*
 * Angle Offset: (Input a Number (Positive or Negative) or JavaScript Formula, degrees)
 * Visual Angle: alias of Angle Offset
 * - Also works as alias for prefixed angle-offset properties,
 *   keeping the rest of the property name unchanged.
 * 
 * *The JavaScript Formula can use 'f' to represent "Frame Count".
 * **Leave blank to use rectangle or circle image
 * 
 * 
 * ======================================
 * (Java)Script Methods
 * ======================================
 * 
 *   $gameMap.changeTA(objectType, objectID, notesTA)
 * 
 *   objectType = (String) The type of the data entry to change the TimedAttack of (written between quotes) 
 *                Possible values: - "skill" (the most common type to use)
 *                                 - "weapon"
 *                                 - "class"
 *                                 - "armor"
 *   objectID = (Integer) The ID of the data entry to change, from the database (can be seen from the editor)
 *   notesTA = (String) The Property(/ies) to change, written between quotes.
 *             - Should be written exactly as you'd normally write them between the Tags.
 *             - If you write multiple Properties within the same String, make sure to put ";" IMMEDIATELY AFTER each of their Values (unless at the end of the String)
 *               (the ";" sign is essential to delimit the properties' values)
 *               eg: "Speed: 5; Width=200;Direction: Left; Opacity=100"
 *             - Property/value separator supports both ":" and "=".
 *             - If you write the same Property multiple times within the same string, ONLY THE 1ST INSTANCE WILL BE USED
 *             - Invalid text within the String will be ignored (so long as it doesn't get in between the Properties, their values, or the ";" at the end of each Value)
 *
 * ======== Notes:
 * ==== The changes done via this script call last until the game is reloaded
 * == Thus, you should consider resetting the properties back manually when needed (by using the script call again, with the original properties inside)
 * ==== To better organize the changes, you can also repeatedly call this script call (with different "notesTA" inside), as each change remains until the game is reloaded, and thus you can change properties for different data entries at different times of the game.
 * 
 * ============================================================================
 * v2.0 Additions
 * ============================================================================
 * 
 * -------------------------------
 * [All Timed Attack Types]
 * -------------------------------
 * Angle Offset and Visual Angle are aliases of each other.
 * - This also applies to prefixed angle properties (for example:
 *   Cursor Angle Offset <=> Cursor Visual Angle).
 *
 * Visual Scale X: (Number or JavaScript Formula) default 1.0
 * Visual Scale Y: (Number or JavaScript Formula) default 1.0
 *
 * Opacity / Main Opacity: 0..255
 * - Controls the main Timed Attack visual opacity.
 * - Default comes from each Timed Attack type's default Opacity parameter.
 * - Runtime and note-based Opacity/Main Opacity always override plugin defaults.
 *
 * Sub-element Opacity properties:
 * - Use the format: <Sub-Element Name> Opacity
 * - If present in notes/runtime, sub-element opacity overrides main Opacity for that sub-element.
 * - Default sub-element opacity parameters are only fallback values.
 * - Common examples:
 *   Cursor Opacity, Text Opacity, Picture Opacity,
 *   Keys Opacity, Stop Key Opacity, Command Opacity,
 *   Ring Opacity, Target Opacity, Main Bar Opacity, Markers Opacity,
 *   Stability Bar Opacity, Boost Bar Opacity, Focus Bar Opacity,
 *   Stick Bar Opacity, Nitro Bar Opacity, Concentrate Bar Opacity,
 *   Freeze Bar Opacity.
 * 
 * Shown Text: (String)
 * - If not specified: uses the type's normal/default text behavior.
 * - If set to "": hides text.
 * - Supports helper variables: $t_f (frames left), $t_s (seconds left).
 * 
 * Text X Offset / Text Y Offset / Text Angle / Text Scale X / Text Scale Y
 * - Optional text-only transforms.
 * - Applied after the main visual offset/angle/scale transforms.
 * 
 * Shown Picture: (Picture filename from /img/pictures/) (supports filepaths to subfolders in that folder, too!)
 * - If not specified: no extra picture is shown.
 * - If set to "": no picture is shown.
 * 
 * Picture X Offset / Picture Y Offset / Picture Angle / Picture Scale X / Picture Scale Y
 * - Optional picture-only transforms.
 * - Applied after the main visual offset/angle/scale transforms.
 * 
 * Reset on Use: true/false (default false)
 * Reset on Battle End: true/false (default false)
 * 
 * Independent Text: true/false (default false)
 * Independent Picture: true/false (default false)
 * Independent Icons: true/false (default false)
 * 
 * (only  Timed Attack / Balance Timed Attack)
 * Independent Cursor: true/false (default false)
 * 
 * Keys X Offset / Keys Y Offset / Keys Angle / Keys Scale X / Keys Scale Y
 * - Applies to key prompts (Mash/Arrows).

 * No Skill Use: true/false (default false)
 * - If true, the TA still runs and formula is still evaluated, but normal skill-use
 *   effects and action phase are skipped.
 * 
 * -------------------------------
 * [Default (Bar) Timed Attack]
 * -------------------------------
 * (Window Width (default main bar width) )
 * 
 * Mode: Set Hitzone | Custom Hitzones
 * - Default: Set Hitzone
 * 
 * Background Color: (Hex or CSS color) default #ffffff
 * - Used in Custom Hitzones mode.
 * Cursor Color: (Hex or CSS color)
 * - Used when Cursor Image is empty.
 * - Default is #000000 (black).
 * Cursor Thickness: (Number, default 4)
 * - Used when Cursor Image is empty.
 * - Also used by Circle Shape Mode cursor ring thickness.
 * Shape Mode: Bar (default) | Circle 
 * - Bar: normal bar visuals.
 * - Circle: visual-only circle mode. Mechanics stay Bar-based.
 * - Circle mode maps cursor movement to circle diameter:
 *   leftmost cursor = largest circle, rightmost cursor = smallest circle.
 * - Largest cursor diameter is Window Width / 2.
 * - Circle-mode cursor and markers are hollow circles.
 * - Circle-mode cursor circles stay perfectly round.
 * - In Circle mode, Cursor Image is ignored. Cursor Color is always used.
 * - In Circle mode, custom hitzones and moving hitzones are drawn as circles.
 * - Circle-mode hitzone circles are hollow rings, where ring thickness follows
 *   the original bar-area size converted to circle radii.
 * - In Circle mode, hit markers are drawn as circles.
 *
 * Bar Nodes:
 * - Optional visual path override  mode only.
 * - Ignored when Shape Mode is Circle.
 * - Format: [length, angle], [length, angle, arcHeight], ...
 * - length: distance from previous node (or bar start for first node).
 * - angle: continuation angle applied at that node, relative to current path angle.
 * - For first node, relative base is Visual Angle (Angle Offset).
 * - arcHeight (optional, default 0): peak height of circular arc segment before node,
 *   measured perpendicularly from straight line between previous point and node.
 * - Positive arcHeight draws arc below that straight line.
 * - Negative arcHeight draws arc above that straight line.
 * - Bar-node hitzone visuals keep hard corners at node joints (no automatic corner rounding).
 *
 * Example:
 * Bar Nodes: [120,25],[80,-40,24],[140,10]
 * Cursor Visual X Offset / Cursor Visual Y Offset / Cursor Angle / Cursor Scale X / Cursor Scale Y
 * - Optional cursor-only transform controls  visuals.
 * Hit keys: comma-separated keycodes.
 * - Use -1 to include mouse-left / touch trigger.
 * 
 * Hitzone 1..20:
 * - Format: hitPosition, hitArea, closeArea, hitAreaColor, closeAreaColor
 * - Example: Hitzone 1: 0.0, 16, 24, #e60c0c, #88ccff
 * - hitPosition is clamped to [-1.0, 1.0]
 * - hitArea and closeArea are clamped to >= 0
 * - Alternate position format: [absoluteX]
 * - Alternate hit/close area format: [leftPixels,rightPixels]
 *   (asymmetric extension around the hitzone center)

 * Incomplete Value: true/false (default true)
 * - true: keep the partial result when the TA ends before all hits are used.
 * - false: if not all required hits are used, result power is forced to zero.

 * Repeat amount: (of the cursor movement across the bar, not per hit) integer >= -1 (default 1)
 * - -1 = infinite repeats
 * - 0 = no repeats (single pass)
 * 
 * ****In Custom Hitzones mode, $gameTemp.tas_power becomes an Array:
 * - Index 1 => Hitzone 1 power
 * - Index 2 => Hitzone 2 power
 * - ...
 * - Index 10 => Hitzone 10 power

 * Hitzone Movement X: (X = 1..20)
 * - Uses movement-sequence format:
 *   [force, time], [(-2,2), 140], [5, (65,95)], [reset, 60], [*4]
 * - force can be a fixed number, random range (min,max), reset, or pool reference [*X].
 * - time is in frames (minimum 0), fixed or random range.
 * - reset snaps the moving Hitzone back to its initial position for that step duration.

 * Random Movement X: (X = 1..100)
 * - Defines reusable movement pools for Hitzone Movement X (and Balance movements).
 * - Pool step references use [*X].

 * **** Visual Priority Rule:
 * -  Custom Hitzones, later Hitzones are drawn on top of earlier Hitzones.
 * 
 * Hit Markers: true/false (default true)
 * - Sets if there should be Markers left behind after each hit (similar to Clock targets).
 * Markers Opacity: integer 0..255 (default 127)
 * - Controls the opacity of Bar hit markers left behind after each hit.
 * Max Hit Markers / Max Markers: integer (default -1)
 * - Maximum markers shown at once.
 * - -1 = no limit.
 * - If exceeded, keeps removing the oldest marker each time
 * 
 * ------------------------------- 
 * [Mash Timed Attack]
 * -------------------------------
 * Mode:
 * - Default Mash
 * - Custom Mash
 * - Multi Mash
 * - Alternative Mash
 * - Sequence Mash
 * - Random Mash
 * - Random Multi Mash
 * - Random Alternative Mash
 * - Random Sequence Mash
 * 
 * Mash Keys: (keyCode or comma-separated keyCodes)
 * Frames: (Integer) optional. If > 0, Mash timer uses frames.
 * Seconds: (Integer) optional. Used when Frames is 0.
 * - Timer is still tracked internally in frames.
 * - If both Frames and Seconds are specified, whichever appears latest is used.
 * 
 * Random Keys 1..20: (comma-separated keyCodes)
 * Random Keys 1..20 Texts: (comma-separated display texts)
 * Random Keys 1..20 Icons: (comma-separated picture names from /img/pictures/) (supports filepaths to subfolders in that folder, too!)
 * 
 * Random Once: true/false (default false)
 * Random Specified Once: comma-separated true/false list (per random pool)
 * Random No Repeat: true/false (default true)
 * 
 * Unending: true/false (default false)
 * Unstarting: true/false (default false)
 * Timeless: true/false (default false)
 * 
 * Power Value: Last Value | Highest Value | Lowest Value
 * - Last Value: uses the final mash gauge value.
 * - Highest Value: uses max mash value reached during the minigame.
 * - Lowest Value: uses min mash value reached during the minigame.
 * 
 * Stop key: keyCode (default null)
 * Stop key Color: (Color string)
 * Stop key Text: text override for stop prompt
 * Stop key Icon: picture override for stop prompt (priority over text)
 * Stop Key X Offset / Stop Key Y Offset / Stop Key Angle / Stop Key Scale X / Stop Key Scale Y
 * Independent Stop Key Icon: true/false (default false)
 * HighLow Marker Color / Invalid Key Color
 * Invalid Tap Loss
 * Tap Gain Fade
 * Mash SE / Invalid Mash SE
 * 
 * Mash also updates:
 * - $gameTemp.tas_frames_left
 * - $gameTemp.tas_seconds_left
 * - Remaining time when ended early/successfully.
 * - 0 when timer expires.
 * 
 * -------------------------------
 * [Arrows Timed Attack]
 * -------------------------------
 * Randomize Commands now accepts:
 * - Arrow names (up, right, down, left)
 * - keyCodes (example: 90)
 * - Random pool slots as [X] (example: [3])
 * 
 * Randomize Commands Texts: comma-separated per-slot text override
 * Randomize Commands Icons: comma-separated per-slot icon override (/img/pictures/) (supports filepaths to subfolders in that folder, too!)
 * 
 * Random Keys 1..20: keycode pools
 * Random Keys 1..20 Texts: text list for that pool
 * Random Keys 1..20 Icons: icon list for that pool (/img/pictures/) (supports filepaths to subfolders in that folder, too!)
 * Seconds: (Integer) optional (converted to frames internally)
 * Frames: (Integer) optional (priority over Seconds)
 * - If both Frames and Seconds are specified, whichever appears latest is used.
 * Timeless: true/false (default false)
 * - true disables timeout-ending for Arrows.
 * Penalty supports negative values.
 * - Negative Penalty increases remaining time on mistakes.
 * Ignore Keys for Invalid: comma-separated keycodes.
 * - These keys are ignored only for the wrong-key penalty check.
 * - They are still valid if they are the expected next key in the sequence.
 *
 * Shown Keys: integer (default -1)
 * - -1: show all keys in the sequence.
 * - 0: hide all key visuals.
 * - >0: show only that many upcoming keys.
 *
 * Unshown Keys: integer (default -1)
 * - If >0, overrides Shown Keys behavior.
 * - Shows all keys visually, but the first N upcoming keys are hidden
 *   behind the unshown rectangle visual.
 * - As keys are pressed, remaining keys shift left and the hidden window updates.
 *
 * Unshown Rectangle Image: picture filename from /img/pictures/.
 * - If empty, a colored rectangle is used.
 * Unshown Rectangle Color: color string (default #000000).
 * - Used only when Unshown Rectangle Image is empty.
 * 
 * Arrows also updates:
 * - $gameTemp.tas_frames_left
 * - $gameTemp.tas_seconds_left
 * - Remaining frames on success.
 * - 0 on timeout.
 * 
 * -------------------------------
 * [Clock Timed Attack]
 * -------------------------------
 * Target properties are extended from 5 total targets to 20 total targets:
 * - Target 1 ... Target 20

 * Power Value: One Value | Multiple Targets | Multiple Hits
 * Hit Markers: true/false
 * Incomplete Value: true/false (default true)
 * Clock Opacity: integer 0..255
 * - Controls the opacity of the drawn clock visual (face/targets/hands/base).
 * Hit keys: comma-separated keycodes.
 * - Use -1 to include mouse-left / touch trigger.

 * Visual Priority Rule:
 * - For Clock targets, later Target entries (higher order in notetags/properties) are drawn on top of earlier ones.

 * Target syntax example:
 * Target 1: 100, 170, #3DC236, 1
 * - start, end, color, power

 * -------------------------------
 * [Circle Timed Attack]
 * -------------------------------
 * Hit keys: comma-separated keycodes.
 * - Use -1 to include mouse-left / touch trigger.

 * -------------------------------
 * [Balance Timed Attack]
 * -------------------------------
 * Balance documentation and setup examples were moved to:
 * JakeMSG_SRD_TimedAttackAdditions_Balance
 *
 * This base plugin keeps runtime compatibility and will use Balance when
 * that module plugin is enabled.
 * 
 * -------------------------------
 * [Remembering TAS Values]
 * -------------------------------
 * At timed-attack formula time, this plugin also snapshots:
 * - $gameTemp.qte_power
 * - $gameTemp.qte_frames_left
 * - $gameTemp.qte_seconds_left

 * You can store TAS values in your own variables in damage formulas.
 * Example (single value):
 * (function(){
 *   $gameTemp.qte_acc = $gameTemp.tas_power;
 *   $gameTemp.qte_time_f = $gameTemp.tas_frames_left;
 *   $gameTemp.qte_time_s = $gameTemp.tas_seconds_left;
 *   return (a.atk * 4 - b.def * 2) * $gameTemp.tas_power;
 * })()
 * 
 * Example (custom hitzones array):
 * (function(){
 *   $gameTemp.qte_acc = JSON.parse(JSON.stringify($gameTemp.tas_power));
 *   $gameTemp.qte_time_f = $gameTemp.tas_frames_left;
 *   $gameTemp.qte_time_s = $gameTemp.tas_seconds_left;
 *   var hz1 = Array.isArray($gameTemp.tas_power) ? ($gameTemp.tas_power[1] || 0) : 0;
 *   return (a.atk * 4 - b.def * 2) * hz1;
 * })()

 * -------------------------------
 * [Global Script Calls]
 * -------------------------------
 * changeTA(skillId, notesTA)
 * - Global alias for changing a Skill Timed Attack directly.
 * - Equivalent to: $gameMap.changeTA('skill', skillId, notesTA)
 * - Backward-compatible form still supported:
 *   changeTA(objectType, objectID, notesTA)

 * forceTA(skillId [, tempNotesTA]) 
 * - Runs a skill's timed attack directly (supports map and battle scenes).
 * - Blocks following event commands until this TA ends (when called from interpreter script commands).
 * - If multiple forceTA calls are made inside one Script command block,
 *   they are queued and run strictly in call order (not in parallel).
 * - No normal skill-use effects are applied.
 * - Damage formula is still evaluated so TAS/QTE values can be stored.
 * - "tempNotesTA" is optional and applies only for that forceTA call.
 * - tempNotesTA is parsed with the same property parser used by changeTA,
 *   so both core SRD properties and extension properties can be overridden.
 *
 * XParallel script calls are moved to:
 * JakeMSG_SRD_TimedAttackAdditions_XParallel
 * - parallelTA(skillId [, tempNotesTA])
 * - parallelXTAs(skillIdArray [, waitMode])
 * - addParXTA(skillId [, tempNotesTA] [, waitMode])
 * - waitXTA()
 * - clearXTAResults()
 * - logXTAs(enabled)

 * Example script calls:
 * forceTA(12, "No Skill Use: true; Timeless: false; Frames: 120");
 * parallelTA(13, "Mode: Custom Hitzones; Hitzone 1: 0,16,24,#f00,#faa"); // XParallel plugin required
 * parallelXTAs([4,7,9], true); // XParallel plugin required
 * addParXTA(15, "Stop key: 90", false); // XParallel plugin required
 * waitXTA(); // XParallel plugin required
 * logXTAs(true); // XParallel plugin required
 * clearXTAResults(); // XParallel plugin required
 * 
 * 
 * 
 * 
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * 
 * @param ==== Non-Sideview options ====
 * @desc Balance Timed Attack parameters were moved to JakeMSG_SRD_TimedAttackAdditions_Balance.
 * @default
 * 
 * 
 * @param Is the Battle Sideview?
 * @parent ==== Non-Sideview options ====
 * @type boolean
 * @desc If set to 'true', visuals of TimedAttacks are shown for the Sideview Battle (how SRD intended the plugins).
 * If set 'false', will instead show at the middle of the screen (to work for non-Sideview and be more visually-pleasing)
 * (This does not affect the Default (Bar) Timed Attack)
 * If Non-sideview, default 0,0 position of the Visuals is the Center of the screen
 * Default, in this plugin, is 'false' (since I don't use Sideview as much)
 * @default false
 *
 * @param Global Non-Sideview X Offset
 * @parent ==== Non-Sideview options ====
 * @desc A value added to the X of all Timed Attack visuals in non-sideview.
 * @default 0
 *
 * @param Global Non-Sideview Y Offset
 * @parent ==== Non-Sideview options ====
 * @desc A value added to the Y of all Timed Attack visuals in non-sideview.
 * @default 0
 *
 * @param Global Default (Bar) Non-Sideview X Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview X offset for Default (Bar) Timed Attack.
 * @default 0
 *
 * @param Global Default (Bar) Non-Sideview Y Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview Y offset for Default (Bar) Timed Attack.
 * @default 0
 *
 * @param Global Clock Non-Sideview X Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview X offset for Clock Timed Attack.
 * @default 0
 *
 * @param Global Clock Non-Sideview Y Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview Y offset for Clock Timed Attack.
 * @default 0
 *
 * @param Global Arrows Non-Sideview X Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview X offset for Arrows Timed Attack.
 * @default 0
 *
 * @param Global Arrows Non-Sideview Y Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview Y offset for Arrows Timed Attack.
 * @default 0
 *
 * @param Global Circle Non-Sideview X Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview X offset for Circle Timed Attack.
 * @default 0
 *
 * @param Global Circle Non-Sideview Y Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview Y offset for Circle Timed Attack.
 * @default 0
 *
 * @param Global Mash Non-Sideview X Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview X offset for Mash Timed Attack.
 * @default 0
 *
 * @param Global Mash Non-Sideview Y Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview Y offset for Mash Timed Attack.
 * @default 0
 *
 * @param Global Wheel Non-Sideview X Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview X offset for Wheel Timed Attack.
 * @default 0
 *
 * @param Global Wheel Non-Sideview Y Offset
 * @parent ==== Non-Sideview options ====
 * @desc Extra non-sideview Y offset for Wheel Timed Attack.
 * @default 0
 *
 *
 * 
 * 
 * @param ==== Timed Attacks new Properties ====
 * @default


 * @param == Default (Bar) Timed Attack ==
 * @parent ==== Timed Attacks new Properties ====
 * @default

 * @param Default (Bar) Mode
 * @text Mode
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Mode for Default (Bar) TA.
 * @default Default

 * @param Default (Bar) Opacity
 * @text Opacity
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Opacity.
 * @default 255
 * 
 * @param Default (Bar) Background Color
 * @text Background Color
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Background Color for Default (Bar) TA.
 * @default #FFFFFF

 * @param Default (Bar) Thickness
 * @text Thickness
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Thickness for Default (Bar) TA.
 * @default 12

 * @param Default (Bar) Power Value
 * @text Power Value
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Power Value for Default (Bar) TA.
 * @default 1

 * @param Default (Bar) Repeat
 * @text Repeat
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Repeat for Default (Bar) TA.
 * @default false

 * @param Default (Bar) Repeat Bounce
 * @text Repeat Bounce
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Repeat Bounce for Default (Bar) TA.
 * @default false

 * @param Default (Bar) Repeat amount
 * @text Repeat amount
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Repeat amount for Default (Bar) TA.
 * @default 1

 * @param Default (Bar) Incomplete Value
 * @text Incomplete Value
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Incomplete Value for Default (Bar) TA.
 * @default 0

 * @param Default (Bar) Hit Markers
 * @text Hit Markers
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Hit Markers for Default (Bar) TA.
 * @default 1

 * @param Default (Bar) Max Hit Markers
 * @text Max Hit Markers
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Max Hit Markers for Default (Bar) TA.
 * @default 100

 * @param Cursor Opacity
 * @text Cursor Opacity
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Cursor Opacity.
 * @default 255

 * @param Text Opacity
 * @text Text Opacity
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Text Opacity.
 * @default 255

 * @param Picture Opacity
 * @text Picture Opacity
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Picture Opacity.
 * @default 255

 * @param Main Bar Opacity
 * @text Main Bar Opacity
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Main Bar Opacity.
 * @default 255

 * @param Markers Opacity
 * @text Markers Opacity
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Markers Opacity.
 * @default 127
 *
 * @param Cursor Visual X Offset
 * @text Cursor Visual X Offset
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Cursor Visual X Offset.
 * @default 0
 *
 * @param Cursor Visual Y Offset
 * @text Cursor Visual Y Offset
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Cursor Visual Y Offset.
 * @default 0
 *
 * @param Cursor Angle
 * @text Cursor Angle
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Cursor Angle.
 * @default 0
 *
 * @param Cursor Scale X
 * @text Cursor Scale X
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Cursor Scale X .
 * @default 1
 *
 * @param Cursor Scale Y
 * @text Cursor Scale Y
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Cursor Scale Y .
 * @default 1
 *
 * @param Cursor Color
 * @text Cursor Color
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Cursor Color  when Cursor Image is empty.
 * @default #000000

 * @param Cursor Thickness
 * @text Cursor Thickness
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Cursor Thickness  when Cursor Image is empty (also used in Circle Shape Mode).
 * @default 4

 * @param Shape Mode
 * @text Shape Mode
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Shape Mode  visuals: Bar or Circle.
 * @default Bar

 * @param Bar Nodes
 * @text Nodes
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Bar Nodes string. Format: [length,angle] or [length,angle,arcHeight]. Ignored in Circle mode.
 * @default
 *
 * @param Bar Hit Keys
 * @text Hit Keys
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default hit keys  as comma-separated keycodes. Use -1 for mouse-left.
 * @default 13, 90, -1

 * @param Bar Hit Count
 * @text Hit Count
 * @parent == Default (Bar) Timed Attack ==
 * @desc Required hit count: 0=default behavior, >0=fixed required hits, -1=infinite.
 * @default 0

 * @param Bar Independent Cursor
 * @text Independent Cursor
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc If true, Bar cursor and hit markers ignore the main visual angle/scale transforms.
 * @default false

 * @param Default (Bar) No Skill Use
 * @text No Skill Use
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default No Skill Use for Default (Bar) TA.
 * @default false

 * @param Default (Bar) Reset on Use
 * @text Reset on Use
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Reset on Use for Default (Bar) TA.
 * @default false

 * @param Default (Bar) Reset on Battle End
 * @text Reset on Battle End
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Reset on Battle End for Default (Bar) TA.
 * @default false

 * @param Default (Bar) Independent Text
 * @text Independent Text
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Independent Text for Default (Bar) TA.
 * @default false

 * @param Default (Bar) Independent Picture
 * @text Independent Picture
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Independent Picture for Default (Bar) TA.
 * @default false

 * @param Default (Bar) Independent Icons
 * @text Independent Icons
 * @parent == Default (Bar) Timed Attack ==
 * @type boolean
 * @desc Default Independent Icons for Default (Bar) TA.
 * @default false

 * @param Default (Bar) Keys X Offset
 * @text Keys X Offset
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Keys X Offset for Default (Bar) TA.
 * @default 0

 * @param Default (Bar) Keys Y Offset
 * @text Keys Y Offset
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Keys Y Offset for Default (Bar) TA.
 * @default 0

 * @param Default (Bar) Keys Angle
 * @text Keys Angle
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Keys Angle for Default (Bar) TA.
 * @default 0

 * @param Default (Bar) Keys Scale X
 * @text Keys Scale X
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Keys Scale X for Default (Bar) TA.
 * @default 1

 * @param Default (Bar) Keys Scale Y
 * @text Keys Scale Y
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Keys Scale Y for Default (Bar) TA.
 * @default 1

 * @param Default (Bar) Visual Scale X
 * @text Visual Scale X
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Visual Scale X for Default (Bar) TA.
 * @default 1

 * @param Default (Bar) Visual Scale Y
 * @text Visual Scale Y
 * @parent == Default (Bar) Timed Attack ==
 * @desc Default Visual Scale Y for Default (Bar) TA.
 * @default 1



 * 
 * @param Mash Timed Attack
 * @parent ==== Timed Attacks new Properties ====
 * @default


 * @param Default Mash Opacity
 * @text Opacity
 * @parent Mash Timed Attack
 * @desc Default main Opacity/Main Opacity for Mash Timed Attack.
 * @default 255

 * @param Default Mash Cursor Opacity
 * @text Cursor Opacity
 * @parent Mash Timed Attack
 * @desc Default Cursor Opacity for Mash Timed Attack.
 * @default 255

 * @param Default Mash Text Opacity
 * @text Text Opacity
 * @parent Mash Timed Attack
 * @desc Default Text Opacity for Mash Timed Attack.
 * @default 255

 * @param Default Mash Picture Opacity
 * @text Picture Opacity
 * @parent Mash Timed Attack
 * @desc Default Picture Opacity for Mash Timed Attack.
 * @default 255

 * @param Default Mash Main Bar Opacity
 * @text Main Bar Opacity
 * @parent Mash Timed Attack
 * @desc Default Main Bar Opacity for Mash Timed Attack.
 * @default 255

 * @param Default Mash Keys Opacity
 * @text Keys Opacity
 * @parent Mash Timed Attack
 * @desc Default Keys Opacity for Mash Timed Attack.
 * @default 255

 * @param Default Mash Stop Key Opacity
 * @text Stop Key Opacity
 * @parent Mash Timed Attack
 * @desc Default Stop Key Opacity for Mash Timed Attack.
 * @default 255

 * @param Default Mash No Skill Use
 * @text No Skill Use
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default No Skill Use for Mash TA.
 * @default false

 * @param Default Mash Reset on Use
 * @text Reset on Use
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Reset on Use for Mash TA.
 * @default false

 * @param Default Mash Reset on Battle End
 * @text Reset on Battle End
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Reset on Battle End for Mash TA.
 * @default false

 * @param Default Mash Independent Text
 * @text Independent Text
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Independent Text for Mash TA.
 * @default false

 * @param Default Mash Independent Picture
 * @text Independent Picture
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Independent Picture for Mash TA.
 * @default false

 * @param Default Mash Independent Icons
 * @text Independent Icons
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Independent Icons for Mash TA.
 * @default false

 * @param Default Mash Keys X Offset
 * @text Keys X Offset
 * @parent Mash Timed Attack
 * @desc Default Keys X Offset for Mash TA.
 * @default 0

 * @param Default Mash Keys Y Offset
 * @text Keys Y Offset
 * @parent Mash Timed Attack
 * @desc Default Keys Y Offset for Mash TA.
 * @default 0

 * @param Default Mash Keys Angle
 * @text Keys Angle
 * @parent Mash Timed Attack
 * @desc Default Keys Angle for Mash TA.
 * @default 0

 * @param Default Mash Keys Scale X
 * @text Keys Scale X
 * @parent Mash Timed Attack
 * @desc Default Keys Scale X for Mash TA.
 * @default 1

 * @param Default Mash Keys Scale Y
 * @text Keys Scale Y
 * @parent Mash Timed Attack
 * @desc Default Keys Scale Y for Mash TA.
 * @default 1

 * @param Default Mash Visual Scale X
 * @text Visual Scale X
 * @parent Mash Timed Attack
 * @desc Default Visual Scale X for Mash TA.
 * @default 1

 * @param Default Mash Visual Scale Y
 * @text Visual Scale Y
 * @parent Mash Timed Attack
 * @desc Default Visual Scale Y for Mash TA.
 * @default 1

 * @param Default Mash Mode
 * @text Mode
 * @parent Mash Timed Attack
 * @desc Default Mode for Mash TA.
 * @default false

 * @param Default Mash Keys
 * @text Keys
 * @parent Mash Timed Attack
 * @desc Default Mash Keys for Mash TA.
 * @default 13, 90, -1

 * @param Default Mash Frames
 * @text Frames
 * @parent Mash Timed Attack
 * @desc Default Frames for Mash TA.
 * @default 0

 * @param Default Mash Seconds
 * @text Seconds
 * @parent Mash Timed Attack
 * @desc Default Seconds for Mash TA.
 * @default 0

 * @param Default Mash Random Once
 * @text Random Once
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Random Once for Mash TA.
 * @default false

 * @param Default Mash Random Specified Once
 * @text Random Specified Once
 * @parent Mash Timed Attack
 * @desc Default Random Specified Once for Mash TA.
 * @default false

 * @param Default Mash Random No Repeat
 * @text Random No Repeat
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Random No Repeat for Mash TA.
 * @default false

 * @param Default Mash Unending
 * @text Unending
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Unending for Mash TA.
 * @default false

 * @param Default Mash Unstarting
 * @text Unstarting
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Unstarting for Mash TA.
 * @default false

 * @param Default Mash Timeless
 * @text Timeless
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Timeless for Mash TA.
 * @default false

 * @param Default Mash Power Value
 * @text Power Value
 * @parent Mash Timed Attack
 * @desc Default Power Value for Mash TA.
 * @default 1

 * @param Default Mash Tap Gain Fade
 * @text Tap Gain Fade
 * @parent Mash Timed Attack
 * @desc Default Tap Gain Fade for Mash TA.
 * @default false

 * @param Default Mash SE
 * @text SE
 * @parent Mash Timed Attack
 * @desc Default Mash SE for Mash TA.
 * @default

 * @param Default Mash Invalid Mash SE
 * @text Invalid Mash SE
 * @parent Mash Timed Attack
 * @desc Default Invalid Mash SE for Mash TA.
 * @default

 * @param Default Mash HighLow Marker Color
 * @text HighLow Marker Color
 * @parent Mash Timed Attack
 * @desc Default HighLow Marker Color for Mash TA.
 * @default #8b0000

 * @param Default Mash Invalid Key Color
 * @text Invalid Key Color
 * @parent Mash Timed Attack
 * @desc Default Invalid Key Color for Mash TA.
 * @default #ff8c00

 * @param Default Mash Stop Key Color
 * @text Stop Key Color
 * @parent Mash Timed Attack
 * @desc Default Stop Key Color for Mash TA.
 * @default #0000ff

 * @param Default Mash Stop Key
 * @text Stop Key
 * @parent Mash Timed Attack
 * @desc Default Stop Key for Mash TA.
 * @default -1

 * @param Default Mash Stop Key Text
 * @text Stop Key Text
 * @parent Mash Timed Attack
 * @desc Default Stop Key Text for Mash TA.
 * @default

 * @param Default Mash Stop Key Icon
 * @text Stop Key Icon
 * @parent Mash Timed Attack
 * @desc Default Stop Key Icon for Mash TA.
 * @default 0

 * @param Default Mash Invalid Tap Loss
 * @text Invalid Tap Loss
 * @parent Mash Timed Attack
 * @desc Default Invalid Tap Loss for Mash TA.
 * @default 0

 * @param Default Mash Stop Key X Offset
 * @text Stop Key X Offset
 * @parent Mash Timed Attack
 * @desc Default Stop Key X Offset for Mash TA.
 * @default 0

 * @param Default Mash Stop Key Y Offset
 * @text Stop Key Y Offset
 * @parent Mash Timed Attack
 * @desc Default Stop Key Y Offset for Mash TA.
 * @default 0

 * @param Default Mash Stop Key Angle
 * @text Stop Key Angle
 * @parent Mash Timed Attack
 * @desc Default Stop Key Angle for Mash TA.
 * @default 0

 * @param Default Mash Stop Key Scale X
 * @text Stop Key Scale X
 * @parent Mash Timed Attack
 * @desc Default Stop Key Scale X for Mash TA.
 * @default 1

 * @param Default Mash Stop Key Scale Y
 * @text Stop Key Scale Y
 * @parent Mash Timed Attack
 * @desc Default Stop Key Scale Y for Mash TA.
 * @default 1

 * @param Default Mash Independent Stop Key Icon
 * @text Independent Stop Key Icon
 * @parent Mash Timed Attack
 * @type boolean
 * @desc Default Independent Stop Key Icon for Mash TA.
 * @default false
 * 
 * 
 * 
 * 
 * @param Arrows Timed Attack
 * @parent ==== Timed Attacks new Properties ====
 * @default


 * @param Default Arrows Opacity
 * @text Opacity
 * @parent Arrows Timed Attack
 * @desc Default main Opacity/Main Opacity for Arrows Timed Attack.
 * @default 255

 * @param Default Arrows Text Opacity
 * @text Text Opacity
 * @parent Arrows Timed Attack
 * @desc Default Text Opacity for Arrows Timed Attack.
 * @default 255

 * @param Default Arrows Picture Opacity
 * @text Picture Opacity
 * @parent Arrows Timed Attack
 * @desc Default Picture Opacity for Arrows Timed Attack.
 * @default 255

 * @param Default Arrows Keys Opacity
 * @text Keys Opacity
 * @parent Arrows Timed Attack
 * @desc Default Keys Opacity for Arrows Timed Attack.
 * @default 255

 * @param Default Arrows Arrow Opacity
 * @text Arrow Opacity
 * @parent Arrows Timed Attack
 * @desc Default Arrow/Arrows Opacity for Arrows Timed Attack.
 * @default 255

 * @param Default Arrows Command Opacity
 * @text Command Opacity
 * @parent Arrows Timed Attack
 * @desc Default Command Opacity for Arrows Timed Attack.
 * @default 255

 * @param Arrows Shown Keys
 * @text Shown Keys
 * @parent Arrows Timed Attack
 * @desc Default value for Shown Keys (-1 all, 0 hidden, >0 shown count).
 * @default -1

 * @param Arrows Unshown Keys
 * @text Unshown Keys
 * @parent Arrows Timed Attack
 * @desc Default value for Unshown Keys (-1 disabled, >0 hidden count window).
 * @default -1

 * @param Arrows Unshown Rectangle Image
 * @text Unshown Rectangle Image
 * @parent Arrows Timed Attack
 * @desc Default image from /img/pictures/ for hidden keys. Empty uses color rectangle.
 * @default

 * @param Arrows Unshown Rectangle Color
 * @text Unshown Rectangle Color
 * @parent Arrows Timed Attack
 * @desc Default color for hidden keys rectangle when image is empty.
 * @default #000000

 * @param Default Arrows No Skill Use
 * @text No Skill Use
 * @parent Arrows Timed Attack
 * @type boolean
 * @desc Default No Skill Use for Arrows TA.
 * @default false

 * @param Default Arrows Reset on Use
 * @text Reset on Use
 * @parent Arrows Timed Attack
 * @type boolean
 * @desc Default Reset on Use for Arrows TA.
 * @default false

 * @param Default Arrows Reset on Battle End
 * @text Reset on Battle End
 * @parent Arrows Timed Attack
 * @type boolean
 * @desc Default Reset on Battle End for Arrows TA.
 * @default false

 * @param Default Arrows Independent Text
 * @text Independent Text
 * @parent Arrows Timed Attack
 * @type boolean
 * @desc Default Independent Text for Arrows TA.
 * @default false

 * @param Default Arrows Independent Picture
 * @text Independent Picture
 * @parent Arrows Timed Attack
 * @type boolean
 * @desc Default Independent Picture for Arrows TA.
 * @default false

 * @param Default Arrows Independent Icons
 * @text Independent Icons
 * @parent Arrows Timed Attack
 * @type boolean
 * @desc Default Independent Icons for Arrows TA.
 * @default false

 * @param Default Arrows Keys X Offset
 * @text Keys X Offset
 * @parent Arrows Timed Attack
 * @desc Default Keys X Offset for Arrows TA.
 * @default 0

 * @param Default Arrows Keys Y Offset
 * @text Keys Y Offset
 * @parent Arrows Timed Attack
 * @desc Default Keys Y Offset for Arrows TA.
 * @default 0

 * @param Default Arrows Keys Angle
 * @text Keys Angle
 * @parent Arrows Timed Attack
 * @desc Default Keys Angle for Arrows TA.
 * @default 0

 * @param Default Arrows Keys Scale X
 * @text Keys Scale X
 * @parent Arrows Timed Attack
 * @desc Default Keys Scale X for Arrows TA.
 * @default 1

 * @param Default Arrows Keys Scale Y
 * @text Keys Scale Y
 * @parent Arrows Timed Attack
 * @desc Default Keys Scale Y for Arrows TA.
 * @default 1

 * @param Default Arrows Visual Scale X
 * @text Visual Scale X
 * @parent Arrows Timed Attack
 * @desc Default Visual Scale X for Arrows TA.
 * @default 1

 * @param Default Arrows Visual Scale Y
 * @text Visual Scale Y
 * @parent Arrows Timed Attack
 * @desc Default Visual Scale Y for Arrows TA.
 * @default 1

 * @param Default Arrows Frames
 * @text Frames
 * @parent Arrows Timed Attack
 * @desc Default Frames for Arrows TA.
 * @default 0

 * @param Default Arrows Seconds
 * @text Seconds
 * @parent Arrows Timed Attack
 * @desc Default Seconds for Arrows TA.
 * @default 0

 * @param Default Arrows Timeless
 * @text Timeless
 * @parent Arrows Timed Attack
 * @type boolean
 * @desc Default Timeless for Arrows TA.
 * @default false

 * @param Default Arrows Ignore Keys for Invalid
 * @text Ignore Keys for Invalid
 * @parent Arrows Timed Attack
 * @desc Default Ignore Keys for Invalid for Arrows TA.
 * @default false

 * @param Default Arrows Command Texts
 * @text Command Texts
 * @parent Arrows Timed Attack
 * @desc Default command texts list for Arrows TA.
 * @default left, down, up, right

 * @param Default Arrows Command Icons
 * @text Command Icons
 * @parent Arrows Timed Attack
 * @desc Default command icon list for Arrows TA.
 * @default
 * 
 * 
 * 
 * 
 * @param Clock Timed Attack
 * @parent ==== Timed Attacks new Properties ====
 * @default


 * @param Default Clock Opacity
 * @text Opacity
 * @parent Clock Timed Attack
 * @desc Default main Opacity/Main Opacity for Clock Timed Attack.
 * @default 255

 * @param Default Clock Visual Opacity
 * @text Visual Opacity
 * @parent Clock Timed Attack
 * @desc Default Clock Opacity (clock visual face/targets/hands/base).
 * @default 255

 * @param Default Clock Text Opacity
 * @text Text Opacity
 * @parent Clock Timed Attack
 * @desc Default Text Opacity for Clock Timed Attack.
 * @default 255

 * @param Default Clock Picture Opacity
 * @text Picture Opacity
 * @parent Clock Timed Attack
 * @desc Default Picture Opacity for Clock Timed Attack.
 * @default 255

 * @param Default Clock Ring Opacity
 * @text Ring Opacity
 * @parent Clock Timed Attack
 * @desc Default Ring Opacity for Clock Timed Attack.
 * @default 255

 * @param Default Clock Target Opacity
 * @text Target Opacity
 * @parent Clock Timed Attack
 * @desc Default Target Opacity for Clock Timed Attack.
 * @default 255
 *
 * @param Clock Hit Keys
 * @text Hit Keys
 * @parent Clock Timed Attack
 * @desc Default hit keys for Clock as comma-separated keycodes. Use -1 for mouse-left.
 * @default 13, 90, -1

 * @param Default Clock No Skill Use
 * @text No Skill Use
 * @parent Clock Timed Attack
 * @type boolean
 * @desc Default No Skill Use for Clock TA.
 * @default false

 * @param Default Clock Reset on Use
 * @text Reset on Use
 * @parent Clock Timed Attack
 * @type boolean
 * @desc Default Reset on Use for Clock TA.
 * @default false

 * @param Default Clock Reset on Battle End
 * @text Reset on Battle End
 * @parent Clock Timed Attack
 * @type boolean
 * @desc Default Reset on Battle End for Clock TA.
 * @default false

 * @param Default Clock Independent Text
 * @text Independent Text
 * @parent Clock Timed Attack
 * @type boolean
 * @desc Default Independent Text for Clock TA.
 * @default false

 * @param Default Clock Independent Picture
 * @text Independent Picture
 * @parent Clock Timed Attack
 * @type boolean
 * @desc Default Independent Picture for Clock TA.
 * @default false

 * @param Default Clock Independent Icons
 * @text Independent Icons
 * @parent Clock Timed Attack
 * @type boolean
 * @desc Default Independent Icons for Clock TA.
 * @default false

 * @param Default Clock Keys X Offset
 * @text Keys X Offset
 * @parent Clock Timed Attack
 * @desc Default Keys X Offset for Clock TA.
 * @default 0

 * @param Default Clock Keys Y Offset
 * @text Keys Y Offset
 * @parent Clock Timed Attack
 * @desc Default Keys Y Offset for Clock TA.
 * @default 0

 * @param Default Clock Keys Angle
 * @text Keys Angle
 * @parent Clock Timed Attack
 * @desc Default Keys Angle for Clock TA.
 * @default 0

 * @param Default Clock Keys Scale X
 * @text Keys Scale X
 * @parent Clock Timed Attack
 * @desc Default Keys Scale X for Clock TA.
 * @default 1

 * @param Default Clock Keys Scale Y
 * @text Keys Scale Y
 * @parent Clock Timed Attack
 * @desc Default Keys Scale Y for Clock TA.
 * @default 1

 * @param Default Clock Visual Scale X
 * @text Visual Scale X
 * @parent Clock Timed Attack
 * @desc Default Visual Scale X for Clock TA.
 * @default 1

 * @param Default Clock Visual Scale Y
 * @text Visual Scale Y
 * @parent Clock Timed Attack
 * @desc Default Visual Scale Y for Clock TA.
 * @default 1

 * @param Default Clock Power Value
 * @text Power Value
 * @parent Clock Timed Attack
 * @desc Default Power Value for Clock TA.
 * @default 1

 * @param Default Clock Hit Markers
 * @text Hit Markers
 * @parent Clock Timed Attack
 * @type boolean
 * @desc Default Hit Markers for Clock TA.
 * @default 1

 * @param Default Clock Incomplete Value
 * @text Incomplete Value
 * @parent Clock Timed Attack
 * @type boolean
 * @desc Default Incomplete Value for Clock TA.
 * @default 0
 * 
 * @param Circle Timed Attack
 * @parent ==== Timed Attacks new Properties ====
 * @default

 * @param Default Circle Opacity
 * @text Opacity
 * @parent Circle Timed Attack
 * @desc Default main Opacity/Main Opacity for Circle Timed Attack.
 * @default 255

 * @param Default Circle Ring Opacity
 * @text Ring Opacity
 * @parent Circle Timed Attack
 * @desc Default Ring Opacity for Circle Timed Attack.
 * @default 255

 * @param Default Circle Text Opacity
 * @text Text Opacity
 * @parent Circle Timed Attack
 * @desc Default Text Opacity for Circle Timed Attack.
 * @default 255

 * @param Default Circle Picture Opacity
 * @text Picture Opacity
 * @parent Circle Timed Attack
 * @desc Default Picture Opacity for Circle Timed Attack.
 * @default 255
 *
 * @param Circle Hit Keys
 * @text Hit Keys
 * @parent Circle Timed Attack
 * @desc Default hit keys for Circle as comma-separated keycodes. Use -1 for mouse-left.
 * @default 13, 90, -1

 * @param Default Circle No Skill Use
 * @text No Skill Use
 * @parent Circle Timed Attack
 * @type boolean
 * @desc Default No Skill Use for Circle TA.
 * @default false

 * @param Default Circle Reset on Use
 * @text Reset on Use
 * @parent Circle Timed Attack
 * @type boolean
 * @desc Default Reset on Use for Circle TA.
 * @default false

 * @param Default Circle Reset on Battle End
 * @text Reset on Battle End
 * @parent Circle Timed Attack
 * @type boolean
 * @desc Default Reset on Battle End for Circle TA.
 * @default false

 * @param Default Circle Independent Text
 * @text Independent Text
 * @parent Circle Timed Attack
 * @type boolean
 * @desc Default Independent Text for Circle TA.
 * @default false

 * @param Default Circle Independent Picture
 * @text Independent Picture
 * @parent Circle Timed Attack
 * @type boolean
 * @desc Default Independent Picture for Circle TA.
 * @default false

 * @param Default Circle Independent Icons
 * @text Independent Icons
 * @parent Circle Timed Attack
 * @type boolean
 * @desc Default Independent Icons for Circle TA.
 * @default false

 * @param Default Circle Keys X Offset
 * @text Keys X Offset
 * @parent Circle Timed Attack
 * @desc Default Keys X Offset for Circle TA.
 * @default 0

 * @param Default Circle Keys Y Offset
 * @text Keys Y Offset
 * @parent Circle Timed Attack
 * @desc Default Keys Y Offset for Circle TA.
 * @default 0

 * @param Default Circle Keys Angle
 * @text Keys Angle
 * @parent Circle Timed Attack
 * @desc Default Keys Angle for Circle TA.
 * @default 0

 * @param Default Circle Keys Scale X
 * @text Keys Scale X
 * @parent Circle Timed Attack
 * @desc Default Keys Scale X for Circle TA.
 * @default 1

 * @param Default Circle Keys Scale Y
 * @text Keys Scale Y
 * @parent Circle Timed Attack
 * @desc Default Keys Scale Y for Circle TA.
 * @default 1

 * @param Default Circle Visual Scale X
 * @text Visual Scale X
 * @parent Circle Timed Attack
 * @desc Default Visual Scale X for Circle TA.
 * @default 1

 * @param Default Circle Visual Scale Y
 * @text Visual Scale Y
 * @parent Circle Timed Attack
 * @desc Default Visual Scale Y for Circle TA.
 * @default 1
 * 
 * @param Wheel Timed Attack
 * @parent ==== Timed Attacks new Properties ====
 * @default

 * @param Default Wheel Opacity
 * @text Opacity
 * @parent Wheel Timed Attack
 * @desc Default main Opacity/Main Opacity for Wheel Timed Attack.
 * @default 255

 * @param Default Wheel Ring Opacity
 * @text Ring Opacity
 * @parent Wheel Timed Attack
 * @desc Default Ring Opacity for Wheel Timed Attack.
 * @default 255

 * @param Default Wheel Target Opacity
 * @text Target Opacity
 * @parent Wheel Timed Attack
 * @desc Default Target Opacity for Wheel Timed Attack.
 * @default 255

 * @param Default Wheel Command Opacity
 * @text Command Opacity
 * @parent Wheel Timed Attack
 * @desc Default Command Opacity for Wheel Timed Attack.
 * @default 255

 * @param Default Wheel Text Opacity
 * @text Text Opacity
 * @parent Wheel Timed Attack
 * @desc Default Text Opacity for Wheel Timed Attack.
 * @default 255

 * @param Default Wheel Picture Opacity
 * @text Picture Opacity
 * @parent Wheel Timed Attack
 * @desc Default Picture Opacity for Wheel Timed Attack.
 * @default 255

 * @param Default Wheel No Skill Use
 * @text No Skill Use
 * @parent Wheel Timed Attack
 * @type boolean
 * @desc Default No Skill Use for Wheel TA.
 * @default false

 * @param Default Wheel Reset on Use
 * @text Reset on Use
 * @parent Wheel Timed Attack
 * @type boolean
 * @desc Default Reset on Use for Wheel TA.
 * @default false

 * @param Default Wheel Reset on Battle End
 * @text Reset on Battle End
 * @parent Wheel Timed Attack
 * @type boolean
 * @desc Default Reset on Battle End for Wheel TA.
 * @default false

 * @param Default Wheel Independent Text
 * @text Independent Text
 * @parent Wheel Timed Attack
 * @type boolean
 * @desc Default Independent Text for Wheel TA.
 * @default false

 * @param Default Wheel Independent Picture
 * @text Independent Picture
 * @parent Wheel Timed Attack
 * @type boolean
 * @desc Default Independent Picture for Wheel TA.
 * @default false

 * @param Default Wheel Independent Icons
 * @text Independent Icons
 * @parent Wheel Timed Attack
 * @type boolean
 * @desc Default Independent Icons for Wheel TA.
 * @default false

 * @param Default Wheel Keys X Offset
 * @text Keys X Offset
 * @parent Wheel Timed Attack
 * @desc Default Keys X Offset for Wheel TA.
 * @default 0

 * @param Default Wheel Keys Y Offset
 * @text Keys Y Offset
 * @parent Wheel Timed Attack
 * @desc Default Keys Y Offset for Wheel TA.
 * @default 0

 * @param Default Wheel Keys Angle
 * @text Keys Angle
 * @parent Wheel Timed Attack
 * @desc Default Keys Angle for Wheel TA.
 * @default 0

 * @param Default Wheel Keys Scale X
 * @text Keys Scale X
 * @parent Wheel Timed Attack
 * @desc Default Keys Scale X for Wheel TA.
 * @default 1

 * @param Default Wheel Keys Scale Y
 * @text Keys Scale Y
 * @parent Wheel Timed Attack
 * @desc Default Keys Scale Y for Wheel TA.
 * @default 1

 * @param Default Wheel Visual Scale X
 * @text Visual Scale X
 * @parent Wheel Timed Attack
 * @desc Default Visual Scale X for Wheel TA.
 * @default 1

 * @param Default Wheel Visual Scale Y
 * @text Visual Scale Y
 * @parent Wheel Timed Attack
 * @desc Default Visual Scale Y for Wheel TA.
 * @default 1
 * 
 */
//=============================================================================

// ======== Parameters of the Plugin
    var params = PluginManager.parameters('JakeMSG_SRD_TimedAttackAdditions');
var isSideview = String(params['Is the Battle Sideview?']).trim().toLowerCase() === 'true';
var globalNonSideXOffset = eval(String(params['Global Non-Sideview X Offset']));
var globalNonSideYOffset = eval(String(params['Global Non-Sideview Y Offset']));
var globalNonSideXOffsetBar = eval(String(params['Global Default (Bar) Non-Sideview X Offset']));
var globalNonSideYOffsetBar = eval(String(params['Global Default (Bar) Non-Sideview Y Offset']));
var globalNonSideXOffsetClock = eval(String(params['Global Clock Non-Sideview X Offset']));
var globalNonSideYOffsetClock = eval(String(params['Global Clock Non-Sideview Y Offset']));
var globalNonSideXOffsetArrows = eval(String(params['Global Arrows Non-Sideview X Offset']));
var globalNonSideYOffsetArrows = eval(String(params['Global Arrows Non-Sideview Y Offset']));
var globalNonSideXOffsetCircle = eval(String(params['Global Circle Non-Sideview X Offset']));
var globalNonSideYOffsetCircle = eval(String(params['Global Circle Non-Sideview Y Offset']));
var globalNonSideXOffsetMash = eval(String(params['Global Mash Non-Sideview X Offset']));
var globalNonSideYOffsetMash = eval(String(params['Global Mash Non-Sideview Y Offset']));
var globalNonSideXOffsetWheel = eval(String(params['Global Wheel Non-Sideview X Offset']));
var globalNonSideYOffsetWheel = eval(String(params['Global Wheel Non-Sideview Y Offset']));

//=============================================================================
// Game_Map
//=============================================================================
// ==== This function is copied from the "SRD_TimedAttack" plugins (to be used within this context)
Game_Map.prototype.loadImage = function(file, hue) {
	return ImageManager.loadBitmap('img/SumRndmDde/tas/', file, hue, true);
};


// ================ ChangeTA
// ======== This method Changes the already-specified TimeAttack on given entry (does NOT do anything to unspecified Properties)
// $gameMap.changeTA(objectType, objectID, notesTA)
Game_Map.prototype.changeTA = function(objectType, objectID, notesTA) {
	if (objectType.match(/skill(s)*/im)) {$gameMap.NotesProcChangeTA($dataSkills[objectID].meta["SRD TAS"],notesTA);}
    else if (objectType.match(/weapon(s)*/im)) {$gameMap.NotesProcChangeTA($dataWeapons[objectID].meta["SRD TAS"],notesTA);}
    else if (objectType.match(/class(es)*/im)) {$gameMap.NotesProcChangeTA($dataClasses[objectID].meta["SRD TAS"],notesTA);}
    else if (objectType.match(/actor(s)*/im)) {$gameMap.NotesProcChangeTA($dataActors[objectID].meta["SRD TAS"],notesTA);}
}
// ==== Method used to process the "notesTA" specified to change the properties of the TimeAttack, from the previous method
Game_Map.prototype.NotesProcChangeTA = function(o,notesTA) {
    // ==== Slightly modified the RegEx used to be able to check multiple properties within the same string (properties that can either end at the ";" sign, or at theend of the string)
	// == Replaced "\s*(.*)/" with "\s*([^;]*|.*$)/"
    // == If using the same property multiple times within the same string (within the same method), ONLY THE FIRST USE WILL TAKE EFFECT

    // ==== "Default" (Bar) TimeAttack - Standard Properties
    if(notesTA.match(/Sound[ ]?Effect:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
    if(notesTA.match(/Cursor[ ]?Image:\s*([^;]*|.*$)/im)) o.image = String(RegExp.$1);
    if(notesTA.match(/Background[ ]?Image:\s*([^;]*|.*$)/im)) o.bi = String(RegExp.$1);
    if(notesTA.match(/Window[ ]?Opacity:\s*([^;]*|.*$)/im)) o.opacity = parseInt(RegExp.$1);
    if(notesTA.match(/Target[ ]?Location:\s*([^;]*|.*$)/im)) o.target = String(RegExp.$1);
    if(notesTA.match(/Repeat[ ]?Type:\s*([^;]*|.*$)/im)) o.rt = String(RegExp.$1).trim().toLowerCase();
    if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) {o.speed = String(RegExp.$1);}
    if(notesTA.match(/Main[ ]?Color:\s*([^;]*|.*$)/im)) o.color = String(RegExp.$1);
    if(notesTA.match(/Shape:\s*([^;]*|.*$)/im)) o.shape = String(RegExp.$1).trim().toLowerCase();
    if(notesTA.match(/Width:\s*([^;]*|.*$)/im)) o.width = parseInt(RegExp.$1);
    if(notesTA.match(/Outline[ ]?Color:\s*([^;]*|.*$)/im)) o.outline = String(RegExp.$1);
    if(notesTA.match(/Outline[ ]?Size:\s*([^;]*|.*$)/im)) o.size = parseInt(RegExp.$1);
    if(notesTA.match(/Direction:\s*([^;]*|.*$)/im)) o.direction = String(RegExp.$1).trim().toLowerCase();
    if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);

    // ==== "Clock" TimeAttack - Unique Properties
    // if(notesTA.match(/Length:\s*([^;]*|.*$)/im)) o.length = parseInt(RegExp.$1);
	if(notesTA.match(/Length:\s*([^;]*|.*$)/im)) o.length = parseInt(RegExp.$1);
    if(notesTA.match(/Height:\s*([^;]*|.*$)/im)) o.height = parseInt(RegExp.$1);
    if(notesTA.match(/Hand\s*Color:\s*([^;]*|.*$)/im)) o.color = String(RegExp.$1);
    if(notesTA.match(/Base\s*Color:\s*([^;]*|.*$)/im)) o.baseColor = String(RegExp.$1);
    if(notesTA.match(/Fade\s*Color:\s*([^;]*|.*$)/im)) o.fadeColor = String(RegExp.$1);
    if(notesTA.match(/Background\s*Color:\s*([^;]*|.*$)/im)) o.backColor = String(RegExp.$1);
    if(notesTA.match(/Outline\s*Width:\s*([^;]*|.*$)/im)) o.outWidth = parseInt(RegExp.$1);
    if(notesTA.match(/Start[ ]?Position:\s*([^;]*|.*$)/im)) o.start = parseInt(RegExp.$1);
    if(notesTA.match(/End[ ]?Position:\s*([^;]*|.*$)/im)) o.finish = parseInt(RegExp.$1);
    if(notesTA.match(/Thickness:\s*([^;]*|.*$)/im)) o.thickness = parseInt(RegExp.$1);
    if(notesTA.match(/Cooldown:\s*([^;]*|.*$)/im)) o.cool = parseInt(RegExp.$1);
    if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);
    if(notesTA.match(/Target[ ]?1:\s*([^;]*|.*$)/im)) o.targets[0] = String(RegExp.$1);
    if(notesTA.match(/Target[ ]?2:\s*([^;]*|.*$)/im)) o.targets[1] = String(RegExp.$1);
    if(notesTA.match(/Target[ ]?3:\s*([^;]*|.*$)/im)) {o.targets[2] = String(RegExp.$1);}
    if(notesTA.match(/Target[ ]?4:\s*([^;]*|.*$)/im)) o.targets[3] = String(RegExp.$1);
    if(notesTA.match(/Target[ ]?5:\s*([^;]*|.*$)/im)) o.targets[4] = String(RegExp.$1);

    // ==== "Arrows" TimeAttack - Unique Properties
	if(notesTA.match(/Normal[ ]?SE:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
	if(notesTA.match(/Miss[ ]?SE:\s*([^;]*|.*$)/im)) o.fse = String(RegExp.$1);
	if(notesTA.match(/Success[ ]?SE:\s*([^;]*|.*$)/im)) o.vse = String(RegExp.$1);
	if(notesTA.match(/Fail[ ]?SE:\s*([^;]*|.*$)/im)) o.f2se = String(RegExp.$1);
	if(notesTA.match(/Phrase:\s*([^;]*|.*$)/im)) o.phrase = String(RegExp.$1);
	if(notesTA.match(/Command[ ]?Amount:\s*([^;]*|.*$)/im)) o.amount = parseInt(RegExp.$1);
	if(notesTA.match(/Randomize[ ]?Commands:\s*([^;]*|.*$)/im)) o.random = String(RegExp.$1);
	if(notesTA.match(/Image:\s*([^;]*|.*$)/im)) o.image = String(RegExp.$1);
	if(notesTA.match(/Frames:\s*([^;]*|.*$)/im)) o.frames = parseInt(RegExp.$1);
	if(notesTA.match(/Penalty:\s*([^;]*|.*$)/im)) o.penatly = parseInt(RegExp.$1);
	if(notesTA.match(/Success[ ]?Power:\s*([^;]*|.*$)/im)) o.successPower = String(RegExp.$1);
	if(notesTA.match(/Fail[ ]?Power:\s*([^;]*|.*$)/im)) o.failPower = String(RegExp.$1);
	if(notesTA.match(/Above[ ]?Height:\s*([^;]*|.*$)/im)) o.aboveHeight = parseInt(RegExp.$1);
	if(notesTA.match(/Animation:\s*([^;]*|.*$)/im)) o.animation = String(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);

	// ==== "Circle" TimeAttack - Unique Properties
	if(notesTA.match(/Sound[ ]?Effect:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
	if(notesTA.match(/Circle[ ]?Image:\s*([^;]*|.*$)/im)) o.image = String(RegExp.$1);
	if(notesTA.match(/Background[ ]?Image:\s*([^;]*|.*$)/im)) o.back = String(RegExp.$1);
	if(notesTA.match(/Repeat[ ]?Type:\s*([^;]*|.*$)/im)) o.rt = String(RegExp.$1).trim().toLowerCase();
	if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) o.speed = String(RegExp.$1);
	if(notesTA.match(/Color:\s*([^;]*|.*$)/im)) o.color = String(RegExp.$1);
	if(notesTA.match(/Initial[ ]?Radius:\s*([^;]*|.*$)/im)) o.radius = parseInt(RegExp.$1);
	if(notesTA.match(/Ring[ ]?Thickness:\s*([^;]*|.*$)/im)) o.thickness = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);
	if(notesTA.match(/Time[ ]?Limit:\s*([^;]*|.*$)/im)) o.timeLimit = parseInt(RegExp.$1);

	// ==== "Mash" TimeAttack - Unique Properties
	if(notesTA.match(/Normal[ ]?SE:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
	if(notesTA.match(/Success[ ]?SE:\s*([^;]*|.*$)/im)) o.vse = String(RegExp.$1);
	if(notesTA.match(/Fail[ ]?SE:\s*([^;]*|.*$)/im)) o.fse = String(RegExp.$1);
	if(notesTA.match(/Phrase:\s*([^;]*|.*$)/im)) o.phrase = String(RegExp.$1);
	if(notesTA.match(/Smooth[ ]?Mode:\s*([^;]*|.*$)/im)) o.mode = String(RegExp.$1).trim().toLowerCase() === 'true';
	if(notesTA.match(/Start[ ]?Amount:\s*([^;]*|.*$)/im)) o.start = String(RegExp.$1);
	if(notesTA.match(/Max[ ]?Amount:\s*([^;]*|.*$)/im)) o.max = String(RegExp.$1);
	if(notesTA.match(/Seconds:\s*([^;]*|.*$)/im)) o.seconds = parseInt(RegExp.$1);
	if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) o.speed = String(RegExp.$1);
	if(notesTA.match(/Tap[ ]?Gain:\s*([^;]*|.*$)/im)) o.tap = String(RegExp.$1);
	if(notesTA.match(/Width:\s*([^;]*|.*$)/im)) o.width = parseInt(RegExp.$1);
	if(notesTA.match(/Height:\s*([^;]*|.*$)/im)) o.height = parseInt(RegExp.$1);
	if(notesTA.match(/Above[ ]?Height:\s*([^;]*|.*$)/im)) o.aboveHeight = parseInt(RegExp.$1);
	if(notesTA.match(/Color[ ]?1:\s*([^;]*|.*$)/im)) o.color1 = String(RegExp.$1);
	if(notesTA.match(/Color[ ]?2:\s*([^;]*|.*$)/im)) o.color2 = String(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);

	// ==== "Wheel" TimeAttack - Unique Properties
	if(notesTA.match(/Normal[ ]?SE:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
	if(notesTA.match(/Miss[ ]?SE:\s*([^;]*|.*$)/im)) o.fse = String(RegExp.$1);
	if(notesTA.match(/Success[ ]?SE:\s*([^;]*|.*$)/im)) o.vse = String(RegExp.$1);
	if(notesTA.match(/Fail[ ]?SE:\s*([^;]*|.*$)/im)) o.f2se = String(RegExp.$1);
	if(notesTA.match(/Command[ ]?Amount:\s*([^;]*|.*$)/im)) o.amount = parseInt(RegExp.$1);
	if(notesTA.match(/Randomize[ ]?Commands:\s*([^;]*|.*$)/im)) o.random = String(RegExp.$1);
	if(notesTA.match(/Button[ ]?Image:\s*([^;]*|.*$)/im)) o.button = String(RegExp.$1);
	if(notesTA.match(/Ring[ ]?Image:\s*([^;]*|.*$)/im)) o.ring = String(RegExp.$1);
	if(notesTA.match(/Target[ ]?Image:\s*([^;]*|.*$)/im)) o.target = String(RegExp.$1);
	if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) o.speed = Number(RegExp.$1);
	if(notesTA.match(/Penalty:\s*([^;]*|.*$)/im)) o.penatly = Number(RegExp.$1);
	if(notesTA.match(/Radius:\s*([^;]*|.*$)/im)) o.radius = parseInt(RegExp.$1);
	if(notesTA.match(/Above[ ]?Height:\s*([^;]*|.*$)/im)) o.aboveHeight = parseInt(RegExp.$1);
	if(notesTA.match(/Animation:\s*([^;]*|.*$)/im)) o.animation = String(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);

	// ==== My own added Properties
	// == Individual X/Y Offsets (for specific TimedAttacks, instead of for All)
	if(notesTA.match(/(?:^|[;\r\n])[ \t]*Visual[ ]?X[ ]?Offset:\s*([^;\r\n]*)/im)) {o.visualXOffset = eval(String(RegExp.$1));}
	if(notesTA.match(/(?:^|[;\r\n])[ \t]*Visual[ ]?Y[ ]?Offset:\s*([^;\r\n]*)/im)) {o.visualYOffset = eval(String(RegExp.$1));}
	if(notesTA.match(/(?:^|[;\r\n])[ \t]*Angle[ ]?Offset:\s*([^;\r\n]*)/im)) {o.angleOffset = eval(String(RegExp.$1));}

    // ==== These properties need to be loaded through LoadImage (if they are directly set through the method)
	// Keep this type-scoped so similarly named fields (like target) do not conflict across TA types.
	if (o.type === 'default') {
		if (o.image) $gameMap.loadImage(o.image);
		if (o.bi) $gameMap.loadImage(o.bi);
		if (o.image && o.image.trim && o.image.trim().length > 0) o.shape = 'image';
	}
	if (o.type === 'wheel') {
		if (o.button) SRD.TimedAttack.loadImage(o.button);
		if (o.ring) SRD.TimedAttack.loadImage(o.ring);
		if (o.target) SRD.TimedAttack.loadImage(o.target);
	}
	//if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) {o.speed = String(RegExp.$1);}
}



// o.type === 'default'
// o.type === 'arrows' || o.type === 'circle' || o.type === 'clock' || o.type === 'mash' || o.type === 'wheel'


// ================ [General] Methods (that Apply for all the other Timed Attacks)
// ======== Adds the new properties to the Notetag Loading
var _JakeMSG_organizeInfo = SRD.TimedAttack.organizeInfo;
SRD.TimedAttack.organizeInfo = function(o) {
	_JakeMSG_organizeInfo.call(this, o);
	if(o.info.match(/(?:^|[;\r\n])[ \t]*Visual[ ]?X[ ]?Offset:\s*([^;\r\n]*)/im)) {o.visualXOffset = eval(String(RegExp.$1));}
	else {o.visualXOffset = 0;}
	if(o.info.match(/(?:^|[;\r\n])[ \t]*Visual[ ]?Y[ ]?Offset:\s*([^;\r\n]*)/im)) {o.visualYOffset = eval(String(RegExp.$1));}
	else {o.visualYOffset = 0;}
	if(o.info.match(/(?:^|[;\r\n])[ \t]*Angle[ ]?Offset:\s*([^;\r\n]*)/im)) {o.angleOffset = eval(String(RegExp.$1));}
	else {o.angleOffset = 0;}
};




// ================ Default (Bar) Timed Attack methods
// ======== Does the "insert X&Y position", for the Default (Bar) TimedAttack
// ======== Also Creates the "_"-prefixed variables for use of the "Individual X/Y Offsets" for the other types of Timed Attack
// (For use within the "TimedAttackSystem" scope) 
// helper for rotating around the visual center using the current angleOffset
TimedAttackSystem.prototype._applyAngleOffsetToCoords = function(centerX, centerY) {
	if (this._angleOffset) {
		this.pivot.x = centerX;
		this.pivot.y = centerY;
		this.x = centerX;
		this.y = centerY;
		this.rotation = this._angleOffset * Math.PI / 180;
	} else {
		this.pivot.x = 0;
		this.pivot.y = 0;
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
	}
};

var _TimedAttackSystem_loadItem = TimedAttackSystem.prototype.loadItem;
TimedAttackSystem.prototype.loadItem = function(item) {
	_TimedAttackSystem_loadItem.call(this, item);
	
	// ==== Creating the Variables for use with the other types of Timed Attack
    this._visualXOffset = item.visualXOffset;
	this._visualYOffset = item.visualYOffset;
	this._angleOffset = item.angleOffset || 0;

	// Reset transform state before applying per-type angle behavior.
	this.rotation = 0;
	this.pivot.x = 0;
	this.pivot.y = 0;
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this._window.pivot.x = 0;
	this._window.pivot.y = 0;
	this._window.rotation = 0;

    // ==== Re-does the initialization of the X/Y, present in the "createAllWindows" aliased method from the TimedAttackCore plugin,
	// so that uses of multiple consecutive skills don't end up adding up to previous X/Y values, instead of having separate ones
	if(SRD.TimedAttack.xAlign === 'left') this._window.x = 0;
	else if(SRD.TimedAttack.xAlign === 'right') this._window.x = Graphics.width - this._window.width;
	else this._window.x = (Graphics.width/2) - (this._window.width/2); // 'center'
	if(SRD.TimedAttack.yAlign === 'top') this._window.y = 0;
	else if(SRD.TimedAttack.yAlign === 'bottom') this._window.y = Graphics.height - this._window.height;
	else this._window.y = (Graphics.height/2) - (this._window.height/2); // 'center'
    // ==== The Insert for Individual Offsets
	this._window.x += item.visualXOffset;
	this._window.y += item.visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._window.x += globalNonSideXOffset + globalNonSideXOffsetBar;
		this._window.y += globalNonSideYOffset + globalNonSideYOffsetBar;
	}

	// ==== Rotate the default window around its visual center.
	if (item.type === SRD.TimedAttack.TAS_ID && this._angleOffset) {
		var windowCenterX = this._window.x + this._window.width / 2;
		var windowCenterY = this._window.y + this._window.height / 2;
		this._window.pivot.x = this._window.width / 2;
		this._window.pivot.y = this._window.height / 2;
		this._window.x = windowCenterX;
		this._window.y = windowCenterY;
		this._window.rotation = this._angleOffset * Math.PI / 180;
	}
}




// ================ Circle Timed Attack methods
// ======== Does the "insert X&Y position", for the Circle TimedAttack
// ==== The inserts for Individual Offset are NOT done if it's Sideview, since it doesn't work well with that
// (so only works with my Non-Sideview mode)
var _TimedAttackSystem_playCircleGame = TimedAttackSystem.prototype.playCircleGame;
TimedAttackSystem.prototype.playCircleGame = function() {
	// ==== All the Inserts (done only if Non-Sideview)
	if (!isSideview){
		// == Re-initializes the arrays for X&Y as mono-element, for the Offsets to work properly
        // = First, sets the Default (Offset 0) to the Center of the screen
	    this._x = [(Graphics.width/2)];
	    this._y = [(Graphics.height/2)];
		// = Now, adds the Offsets themselves
		this._x[0] += this._visualXOffset + globalNonSideXOffset + globalNonSideXOffsetCircle;
		this._y[0] += this._visualYOffset + globalNonSideYOffset + globalNonSideYOffsetCircle;
	}

	_TimedAttackSystem_playCircleGame.call(this);
	if (this._x && this._x.length > 0 && this._y && this._y.length > 0) {
		this._applyAngleOffsetToCoords(this._x[0], this._y[0]);
	}
}


// ================ Arrow Timed Attack methods
// ======== Does the "insert X&Y position", for the Arrows TimedAttack
var _TimedAttackSystem_drawArrowGame = TimedAttackSystem.prototype.drawArrowGame;
TimedAttackSystem.prototype.drawArrowGame = function() {
	// ==== First, sets the Default (Offset 0) to the Center of the screen
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
    // ==== The Insert for Individual Offsets
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetArrows;
		this._y += globalNonSideYOffset + globalNonSideYOffsetArrows;
	}
	// ==== apply rotation around the visual center
	this._applyAngleOffsetToCoords(this._x + ((this._width || 0) / 2), this._y + ((this._height || 0) / 2));

	_TimedAttackSystem_drawArrowGame.call(this);
};




// ================ Clock Timed Attack methods
// ======== Does the "insert X&Y position", for the Clock TimedAttack
// ==== Have to replace the whole method since the "this._x" and "this._y" are used in the middle
TimedAttackSystem.prototype.playClockGame = function() {
	//Movement
	if(this._notPressed) {
		var f = this._frame;
		this._xPosition += Number(eval(this._item.speed) * this._mul);
		if(this._xPosition <= this._startRadius || this._xPosition >= this._endRadius) {
			if(this._rt === 'repeat') {
				this._xPosition = this._startRadius;
			} else if(this._rt === 'reverse') {
				this._mul *= (-1);
			} else {
				this.setPower(0);
				this._flashTime = this._time;
				this._notPressed = false;
			}
		}
	} else {
		this._flashTime++;
	}

	//Draw
	// ======== This is where we insert the X&Y position 
	// ==== First, sets the Default (Offset 0) to the Center of the screen
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
	// ==== The Insert for Individual Offsets
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetClock;
		this._y += globalNonSideYOffset + globalNonSideYOffsetClock;
	}
	// ==== apply rotation around the visual center
	this._applyAngleOffsetToCoords(this._x, this._y);

	this._content.bitmap.clear();
	if(this._image.trim().length > 0 && this._xPosition > 0) {
		var bitmap = SRD.TimedAttack.loadImage(this._image);
		this._content.bitmap.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 
			this._x - (bitmap.width/2), this._y - (bitmap.height/2));
	} else {
		this._content.bitmap.drawCircle(this._x, this._y, this._length + this._outWidth, this._outColor);
		this._content.bitmap.drawCircle(this._x, this._y, this._length, this._backColor);
	}
	for(var i = 0; i < this._targets.length; i++) {
		this._content.bitmap.drawPizzaSlice(this._x, this._y, this._length, this._targets[i][0] * (Math.PI / 180), this._targets[i][1] * (Math.PI / 180), this._targets[i][2]);
	}
	if(this._flashTime % this._flash < Math.floor(this._flash / 2)) {
		this._content.bitmap.drawHand(this._x, this._y, this._xPosition, this._length, this._thickness, this._color);
		for(var i = 0; i < this._setTargets.length; i++) {
			this._content.bitmap.drawHand(this._x, this._y, this._setTargets[i], this._length, this._thickness, this._fadeColor);
		}
	}
	this._content.bitmap.drawCircle(this._x, this._y, this._length / 10, this._baseColor)

	if(this._flashTime >= this._time && !this._notPressed) {
		this._content.bitmap.clear();
		BattleManager.endTASAttackThing();
		this.close();
	}

	//Input
	if(this._jakeActivationTriggered() && this._notPressed && this._cooldown === 0) {
		if(this._targetCount > 0) this._targetCount--;
		this._setTargets.push(this._xPosition);
		AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
		if(this._targetCount <= 0) {
			this._notPressed = false;
			var temp = 0;
			for(var i = 0; i < this._setTargets.length; i++) {
				for(var j = 0; j < this._targets.length; j++) {
					if(this._setTargets[i] > this._targets[j][0] && this._setTargets[i] < this._targets[j][1]) {
						temp += this._targets[j][3];
					}
				}
			}
			this.setPower(temp / this._setTargets.length);
		}
	}
	if(this._cooldown > 0) this._cooldown--;
};




// ================ Mash Timed Attack methods
// ======== Does the "insert X&Y position", for the Mash TimedAttack
// ==== Have to replace the whole method since the "this._x" and "this._y" are used in the middle
TimedAttackSystem.prototype.playMashGame = function() {
	//Movement
	if(this._notPressed) {
		var f = this._frame;
		this._xPosition -= Number(eval(this._item.speed)) - this._tempSpeed;
		if(this._xPosition <= 0 || this._xPosition > this._maxPosition) {
			if(this._xPosition > this._maxPosition) {
				AudioManager.playSe({"name":this._item.vse,"pan":0,"pitch":100,"volume":100});
				this._xPosition = this._maxPosition;
				this.setPower(1);
			} else {
				AudioManager.playSe({"name":this._item.fse,"pan":0,"pitch":100,"volume":100});
				this._xPosition = 0;
				this.setPower(0);
			}
			this._notPressed = false;
		}
	} else {
		this._flashTime++;
	}

	//Draw
	// ======== This is where we insert the X&Y position 
	// ==== First, sets the Default (Offset 0) to the Center of the screen
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
	// ==== The Insert for Individual Offsets
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetMash;
		this._y += globalNonSideYOffset + globalNonSideYOffsetMash;
	}
	// ==== apply rotation around the visual center
	this._applyAngleOffsetToCoords(this._x + (this._width / 2), this._y + (this._height / 2));

	this._content.bitmap.clear();
	this.drawGaugeUpgrade(this._x, this._y, this._width, this._height, this._xPosition / this._maxPosition, this._color1, this._color2);
	if(this._flashTime % this._flash < Math.floor(this._flash / 2)) {
		var text = this._phrase.replace(/%1/g, this._seconds);
		this._content.bitmap.drawText(text, this._x + (this._width/2) - (this.textWidth(text)/2), this._y - this._height, this.textWidth(text), this.lineHeight(), 'left');
	}

	if(this._flashTime >= this._time && !this._notPressed) {
		this._content.bitmap.clear();
		BattleManager.endTASAttackThing();
		this.close();
	}

	if(this._notPressed) {

		if(this._jakeActivationTriggered()) {
			if(this._mode) {
				this._tempSpeed = eval(this._item.tap);
			} else {
				this._xPosition += eval(this._item.tap);
			}
		}

		if(this._frame % 60 === 0) {
			this._seconds--;
		}

		//Input
		if(this._seconds === 0) {
			this._notPressed = false;
			AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
			this.setPower(this._xPosition / this._maxPosition);
		}

		if(this._tempSpeed > 0) this._tempSpeed--;
	}
};




// ================ Wheel Timed Attack methods
// ======== Does the "insert X&Y position", for the Wheel TimedAttack
// ==== Have to replace the whole method since the "this._x" and "this._y" are used in the middle
TimedAttackSystem.prototype.playWheelGame = function() {
	// compute base coordinates and apply offsets/rotation right away so the initial sprites are placed correctly
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetWheel;
		this._y += globalNonSideYOffset + globalNonSideYOffsetWheel;
	}
	this._applyAngleOffsetToCoords(this._x, this._y);

	//Initialise
	if(this._oneUpdate) {
		this._sprites = [];
		for(var i = 0; i < this._commands.length; i++) {
			var bit = SRD.TimedAttack.loadImage(this._button);
			this._bitWidth = bit.width;
			var h = bit.height;
			this._sprites[i] = new Sprite(new Bitmap(h, h));
			this._sprites[i].bitmap.blt(bit, this._commands[i] * (this._bitWidth/2), 0, h, h, 0, 0);
			this._sprites[i].opacity = 0;
			this.addChild(this._sprites[i]);
		}
		this._backSprite = new Sprite(new Bitmap((this._radius*2) + (this._ringThickness*2), (this._radius*2) + (this._ringThickness*2)));
		var bit2 = SRD.TimedAttack.loadImage(this._ring);
		this._backSprite.bitmap.blt(bit2, 0, 0, bit2.width, bit2.height, 0, 0, (this._radius*2) + (this._ringThickness), (this._radius*2) + (this._ringThickness));
		this._backSprite.x = this._x - (this._backSprite.width/2) + (this._ringThickness*3);
		this._backSprite.y = this._y - (this._backSprite.height/2) + (this._ringThickness*3);
		this.addChildAt(this._backSprite, 0);

		this._targetSprite = new Sprite(SRD.TimedAttack.loadImage(this._target));
		this._targetSprite.x = this._x - ((this._targetSprite.width/2) - (this._sprites[0].width/2));
		this._targetSprite.y = this._y - this._radius - ((this._targetSprite.height/2) - (this._sprites[0].height/2));
		this.addChildAt(this._targetSprite, 1);
		this._oneUpdate = false;
	} else {
		for(var i = 0; i < this._commands.length; i++) {
			if(this._maxCount - this._countDown > i) {
				if(this._sprites[i].opacity > 0) {
					this._sprites[i].opacity += this._ani[0];
					this._sprites[i].scale.x += this._ani[1];
					this._sprites[i].scale.y += this._ani[2];
					this._sprites[i].x += this._ani[3];
					this._sprites[i].y += this._ani[4];
				}
			} else {
				var coods = this.getWheelCoordinates(i);
				this._sprites[i].x = this._x + coods.x;
				this._sprites[i].y = this._y + coods.y;
				if(this._sprites[i].opacity === 0) this._sprites[i].opacity = 255;
			}
		}
		this._backSprite.x = this._x - (this._backSprite.width/2) + (this._ringThickness*3);
		this._backSprite.y = this._y - (this._backSprite.height/2) + (this._ringThickness*3);

		this._targetSprite.x = this._x - ((this._targetSprite.width/2) - (this._sprites[0].width/2));
		this._targetSprite.y = this._y - this._radius - ((this._targetSprite.height/2) - (this._sprites[0].height/2));
	}


	//Movement
	if(this._notPressed) {
		var f = this._frame;
	} else {
		this._flashTime++;
	}

	if(this._flashTime >= this._time && !this._notPressed) {
		this._content.bitmap.clear();
		for(var i = 0; i < this._sprites.length; i++) {
			this.removeChild(this._sprites[i]);
		}
		this.removeChild(this._backSprite);
		this.removeChild(this._targetSprite);
		BattleManager.endTASAttackThing();
		this.close();
	}

	//Draw
	// ======== This is where we insert the X&Y position 
	// ==== First, sets the Default (Offset 0) to the Center of the screen
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
	// ==== The Insert for Individual Offsets
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetWheel;
		this._y += globalNonSideYOffset + globalNonSideYOffsetWheel;
	}
	// ==== apply rotation around the visual center
	this._applyAngleOffsetToCoords(this._x, this._y);

	if(this._notPressed) {

		if(eval(this._evals[this._commands[this._maxCount - this._countDown]])) {
			var power = Math.abs(this._animationCycle - this._moments[this._maxCount - this._countDown]) / 1;
			this._powers.push(Math.max(1 - power, 0));
			this._countDown--;
			if(this._countDown === 0) {
				AudioManager.playSe({"name":this._item.vse,"pan":0,"pitch":100,"volume":100});
				var tasPower = 0;
				for(var i = 0; i < this._powers.length; i++) {
					tasPower += this._powers[i];
				}
				tasPower /= this._powers.length;
				this.setPower(tasPower);
				this._notPressed = false;
			} else {
				AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
				
			}
			if(!this._startMovement && this._countDown > 0) this._startMovement = true;
		} else if(eval(this._evals[0]) || eval(this._evals[1])) {
			this._speed += this._penatly;
			if(!this._startMovement) this._startMovement = true;
			AudioManager.playSe({"name":this._item.fse,"pan":0,"pitch":100,"volume":100});
		}

		if(this._startMovement) this._animationCycle += (this._speed);

		if(this._animationCycle > Math.PI * 2) {
			this._notPressed = false;
			AudioManager.playSe({"name":this._item.f2se,"pan":0,"pitch":100,"volume":100});
			this.setPower(0);
		}
	}
};


//=============================================================================
// v2.0 Extended Runtime Layer
//=============================================================================
(function() {
	"use strict";

	if (typeof SRD === 'undefined' || !SRD.TimedAttack || typeof TimedAttackSystem === 'undefined') {
		return;
	}

	var J = {};

	var jakeTACoreRoot = (typeof globalThis !== 'undefined') ? globalThis : ((typeof window !== 'undefined') ? window : this);
	var jakeTACore = jakeTACoreRoot.JakeMSG_SRD_TA_Core || {};
	jakeTACoreRoot.JakeMSG_SRD_TA_Core = jakeTACore;
	jakeTACore.J = J;
	jakeTACore.mainParams = params;
	jakeTACore.sharedVisual = {
		isSideview: isSideview,
		globalNonSideXOffset: globalNonSideXOffset,
		globalNonSideYOffset: globalNonSideYOffset
	};

	J.clamp = function(value, min, max) {
		return Math.min(Math.max(value, min), max);
	};

	J.toNumber = function(value, defaultValue) {
		var n = Number(value);
		return isNaN(n) ? defaultValue : n;
	};

	J.toEvalNumber = function(value, defaultValue) {
		try {
			var n = Number(eval(String(value)));
			return isNaN(n) ? defaultValue : n;
		} catch (e) {
			return defaultValue;
		}
	};

	J.parseBool = function(value, defaultValue) {
		if (value === undefined || value === null || value === '') {
			return defaultValue;
		}
		var s = String(value).trim().toLowerCase();
		if (s === 'true') return true;
		if (s === 'false') return false;
		return defaultValue;
	};

	J.parseModeValue = function(value, defaultValue) {
		var raw = (value === undefined || value === null || value === '') ? defaultValue : value;
		if (typeof J.normalizeDefaultMode === 'function') {
			return J.normalizeDefaultMode(raw);
		}
		var s = String(raw || '').trim().toLowerCase();
		return s || String(defaultValue || '').trim().toLowerCase();
	};

	J.isBalanceModuleEnabled = function() {
		return !!Imported.JakeMSG_SRD_TimedAttackAdditions_Balance;
	};

	J.isXParallelModuleEnabled = function() {
		return !!Imported.JakeMSG_SRD_TimedAttackAdditions_XParallel;
	};

	J.getBalanceParams = function() {
		if (typeof PluginManager !== 'undefined' && PluginManager.parameters) {
			var splitParams = PluginManager.parameters('JakeMSG_SRD_TimedAttackAdditions_Balance');
			if (splitParams && Object.keys(splitParams).length > 0) return splitParams;
		}
		return params || {};
	};

	J.toOpacity = function(value, defaultValue) {
		var n = parseInt(value);
		if (isNaN(n)) return defaultValue;
		return J.clamp(n, 0, 255);
	};

	J.opacityKey = function(name) {
		return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
	};

	J._subOpacityPatterns = [
		{key:'Window', pattern:'Window[ ]?Opacity'},
		{key:'Cursor', pattern:'Cursor[ ]?Opacity'},
		{key:'Text', pattern:'Text[ ]?Opacity'},
		{key:'Picture', pattern:'Picture[ ]?Opacity'},
		{key:'Keys', pattern:'Keys[ ]?Opacity'},
		{key:'Stop Key', pattern:'Stop[ ]?Key[ ]?Opacity'},
		{key:'Command', pattern:'Commands?[ ]?Opacity'},
		{key:'Arrow', pattern:'Arrows?[ ]?Opacity'},
		{key:'Clock', pattern:'Clock[ ]?Opacity'},
		{key:'Ring', pattern:'Ring[ ]?Opacity'},
		{key:'Target', pattern:'Target[ ]?Opacity'},
		{key:'Main Bar', pattern:'Main[ ]?Bar[ ]?Opacity'},
		{key:'Markers', pattern:'Hit[ ]?Marker[s]?[ ]?Opacity'},
		{key:'Markers', pattern:'Markers?[ ]?Opacity'},
		{key:'Stability Bar', pattern:'Stability[ ]?Bar[ ]?Opacity'},
		{key:'Boost Bar', pattern:'Boost[ ]?Bar[ ]?Opacity'},
		{key:'Focus Bar', pattern:'Focus[ ]?Bar[ ]?Opacity'},
		{key:'Stick Bar', pattern:'Stick[ ]?Bar[ ]?Opacity'},
		{key:'Nitro Bar', pattern:'Nitro[ ]?Bar[ ]?Opacity'},
		{key:'Concentrate Bar', pattern:'Concentrate[ ]?Bar[ ]?Opacity'},
		{key:'Freeze Bar', pattern:'Freeze[ ]?Bar[ ]?Opacity'}
	];

	J.applySubOpacityProps = function(o, source, semicolonMode) {
		if (!o) return;
		if (!o.jakeSubOpacities) o.jakeSubOpacities = {};
		if (!o.jakeExplicitSubOpacityKeys) o.jakeExplicitSubOpacityKeys = {};
		if (!o.jakeDefaultSubOpacityKeys) o.jakeDefaultSubOpacityKeys = {};
		for (var i = 0; i < J._subOpacityPatterns.length; i++) {
			var entry = J._subOpacityPatterns[i];
			var v = J.getValue(source, entry.pattern, semicolonMode);
			if (v !== null) {
				var mapKey = J.opacityKey(entry.key);
				o.jakeSubOpacities[mapKey] = J.toOpacity(v, 255);
				o.jakeExplicitSubOpacityKeys[mapKey] = true;
				delete o.jakeDefaultSubOpacityKeys[mapKey];
			}
		}
	};

	J._mainOpacityParamSpecs = {
		'default': {param:'Default (Bar) Opacity', legacy:'Default Opacity', fallback:255},
		'mash': {param:'Default Mash Opacity', legacy:'Default Opacity', fallback:255},
		'arrows': {param:'Default Arrows Opacity', legacy:'Default Opacity', fallback:255},
		'clock': {param:'Default Clock Opacity', legacy:'Default Opacity', fallback:255},
		'circle': {param:'Default Circle Opacity', legacy:'Default Opacity', fallback:255},
		'wheel': {param:'Default Wheel Opacity', legacy:'Default Opacity', fallback:255}
	};

	J._subOpacityParamSpecs = {
		'default': [
			{key:'Cursor', param:'Default (Bar) Cursor Opacity', legacy:'Default Cursor Opacity', fallback:255},
			{key:'Text', param:'Default (Bar) Text Opacity', legacy:'Default Text Opacity', fallback:255},
			{key:'Picture', param:'Default (Bar) Picture Opacity', legacy:'Default Picture Opacity', fallback:255},
			{key:'Main Bar', param:'Default (Bar) Main Bar Opacity', legacy:'Default Main Bar Opacity', fallback:255},
			{key:'Markers', param:'Default (Bar) Markers Opacity', legacy:'Default Markers Opacity', fallback:127}
		],
		'mash': [
			{key:'Cursor', param:'Default Mash Cursor Opacity', legacy:'Default Cursor Opacity', fallback:255},
			{key:'Text', param:'Default Mash Text Opacity', legacy:'Default Text Opacity', fallback:255},
			{key:'Picture', param:'Default Mash Picture Opacity', legacy:'Default Picture Opacity', fallback:255},
			{key:'Main Bar', param:'Default Mash Main Bar Opacity', legacy:'Default Main Bar Opacity', fallback:255},
			{key:'Keys', param:'Default Mash Keys Opacity', legacy:'Default Keys Opacity', fallback:255},
			{key:'Stop Key', param:'Default Mash Stop Key Opacity', legacy:'Default Stop Key Opacity', fallback:255}
		],
		'arrows': [
			{key:'Text', param:'Default Arrows Text Opacity', legacy:'Default Text Opacity', fallback:255},
			{key:'Picture', param:'Default Arrows Picture Opacity', legacy:'Default Picture Opacity', fallback:255},
			{key:'Keys', param:'Default Arrows Keys Opacity', legacy:'Default Keys Opacity', fallback:255},
			{key:'Arrow', param:'Default Arrows Arrow Opacity', legacy:'Default Arrow Opacity', fallback:255},
			{key:'Command', param:'Default Arrows Command Opacity', legacy:'Default Command Opacity', fallback:255}
		],
		'clock': [
			{key:'Clock', param:'Default Clock Visual Opacity', legacy:null, fallback:255},
			{key:'Ring', param:'Default Clock Ring Opacity', legacy:'Default Ring Opacity', fallback:255},
			{key:'Target', param:'Default Clock Target Opacity', legacy:'Default Target Opacity', fallback:255},
			{key:'Text', param:'Default Clock Text Opacity', legacy:'Default Text Opacity', fallback:255},
			{key:'Picture', param:'Default Clock Picture Opacity', legacy:'Default Picture Opacity', fallback:255}
		],
		'circle': [
			{key:'Ring', param:'Default Circle Ring Opacity', legacy:'Default Ring Opacity', fallback:255},
			{key:'Text', param:'Default Circle Text Opacity', legacy:'Default Text Opacity', fallback:255},
			{key:'Picture', param:'Default Circle Picture Opacity', legacy:'Default Picture Opacity', fallback:255}
		],
		'wheel': [
			{key:'Ring', param:'Default Wheel Ring Opacity', legacy:'Default Ring Opacity', fallback:255},
			{key:'Target', param:'Default Wheel Target Opacity', legacy:'Default Target Opacity', fallback:255},
			{key:'Command', param:'Default Wheel Command Opacity', legacy:'Default Command Opacity', fallback:255},
			{key:'Text', param:'Default Wheel Text Opacity', legacy:'Default Text Opacity', fallback:255},
			{key:'Picture', param:'Default Wheel Picture Opacity', legacy:'Default Picture Opacity', fallback:255}
		]
	};

	J._resolveOpacityType = function(typeName) {
		var type = String(typeName || '').trim().toLowerCase();
		var base = String((SRD && SRD.TimedAttack && SRD.TimedAttack.TAS_ID) || 'default').trim().toLowerCase();
		if (type === base || type === 'default') return 'default';
		if (J._mainOpacityParamSpecs[type]) return type;
		return 'default';
	};

	J._typeDefaultPrefixes = {
		'default': 'Default (Bar)',
		'mash': 'Default Mash',
		'arrows': 'Default Arrows',
		'clock': 'Default Clock',
		'circle': 'Default Circle',
		'wheel': 'Default Wheel',
		'balance': 'Balance Default'
	};

	J._resolveTypeDefaultKey = function(typeName) {
		var type = String(typeName || '').trim().toLowerCase();
		var base = String((SRD && SRD.TimedAttack && SRD.TimedAttack.TAS_ID) || 'default').trim().toLowerCase();
		if (type === base || type === 'default') return 'default';
		if (J._typeDefaultPrefixes[type]) return type;
		return 'default';
	};

	J._getTypeDefaultParamMap = function(typeName) {
		var key = J._resolveTypeDefaultKey(typeName);
		if (key === 'balance' && J.getBalanceParams) return J.getBalanceParams();
		return params;
	};

	J._getTypeDefaultRaw = function(typeName, suffix, fallback) {
		var key = J._resolveTypeDefaultKey(typeName);
		var prefix = J._typeDefaultPrefixes[key] || J._typeDefaultPrefixes['default'];
		var map = J._getTypeDefaultParamMap(typeName) || {};
		var paramName = prefix + ' ' + String(suffix || '');
		var raw = map[paramName];
		if (raw === undefined || raw === null || String(raw).trim().length === 0) return fallback;
		return raw;
	};

	J._getTypeDefaultBool = function(typeName, suffix, fallback) {
		return J.parseBool(J._getTypeDefaultRaw(typeName, suffix, fallback ? 'true' : 'false'), fallback);
	};

	J._getTypeDefaultEvalNumber = function(typeName, suffix, fallback) {
		return J.toEvalNumber(J._getTypeDefaultRaw(typeName, suffix, String(fallback)), fallback);
	};

	J._getTypeDefaultInt = function(typeName, suffix, fallback) {
		var raw = J._getTypeDefaultRaw(typeName, suffix, String(fallback));
		var n = parseInt(raw);
		return isNaN(n) ? fallback : n;
	};

	J.getParamOpacity = function(sourceParams, paramName, fallback) {
		var map = sourceParams || {};
		var raw = map[paramName];
		if (raw === undefined || raw === null || String(raw).trim().length === 0) return fallback;
		return J.toOpacity(raw, fallback);
	};

	J.getParamOpacityAny = function(sourceParams, names, fallback) {
		var map = sourceParams || {};
		var list = Array.isArray(names) ? names : [names];
		for (var i = 0; i < list.length; i++) {
			var name = list[i];
			if (!name) continue;
			var raw = map[name];
			if (raw === undefined || raw === null || String(raw).trim().length === 0) continue;
			return J.toOpacity(raw, fallback);
		}
		return fallback;
	};

	J.applyDefaultOpacityParams = function(o) {
		if (!o) return;
		if (String(o.type || '').trim().toLowerCase() === 'balance') return;
		var typeKey = J._resolveOpacityType(o.type);
		var mainSpec = J._mainOpacityParamSpecs[typeKey] || J._mainOpacityParamSpecs['default'];
		var subSpecs = J._subOpacityParamSpecs[typeKey] || [];
		if (o.jakeVisualOpacity === undefined) {
			o.jakeVisualOpacity = J.getParamOpacityAny(params, [mainSpec.param, mainSpec.legacy], mainSpec.fallback);
		}
		if (o.jakeMainOpacityExplicit === undefined) o.jakeMainOpacityExplicit = false;
		if (!o.jakeSubOpacities) o.jakeSubOpacities = {};
		if (!o.jakeExplicitSubOpacityKeys) o.jakeExplicitSubOpacityKeys = {};
		if (!o.jakeDefaultSubOpacityKeys) o.jakeDefaultSubOpacityKeys = {};
		for (var i = 0; i < subSpecs.length; i++) {
			var spec = subSpecs[i];
			var key = J.opacityKey(spec.key);
			if (o.jakeExplicitSubOpacityKeys[key]) continue;
			if (o.jakeMainOpacityExplicit) {
				if (o.jakeDefaultSubOpacityKeys[key]) {
					delete o.jakeSubOpacities[key];
					delete o.jakeDefaultSubOpacityKeys[key];
				}
				continue;
			}
			var value = J.getParamOpacityAny(params, [spec.param, spec.legacy], spec.fallback);
			if (spec.fallback === 255 && value === 255) {
				if (o.jakeDefaultSubOpacityKeys[key]) {
					delete o.jakeSubOpacities[key];
					delete o.jakeDefaultSubOpacityKeys[key];
				}
				continue;
			}
			if (o.jakeSubOpacities[key] !== undefined && !o.jakeDefaultSubOpacityKeys[key]) continue;
			o.jakeSubOpacities[key] = value;
			o.jakeDefaultSubOpacityKeys[key] = true;
		}
	};

	J.applyBalanceOpacityParams = function(o, source, semicolonMode, bpv) {
		if (!o) return;
		if (!o.jakeSubOpacities) o.jakeSubOpacities = {};
		if (!o.jakeExplicitSubOpacityKeys) o.jakeExplicitSubOpacityKeys = {};
		if (!o.jakeDefaultSubOpacityKeys) o.jakeDefaultSubOpacityKeys = {};

		var setDefault = function(key, pattern, paramName, fallback) {
			var mapKey = J.opacityKey(key);
			if (J.getValue(source, pattern, semicolonMode) !== null) return;
			if (o.jakeExplicitSubOpacityKeys[mapKey]) return;
			if (o.jakeMainOpacityExplicit) {
				if (o.jakeDefaultSubOpacityKeys[mapKey]) {
					delete o.jakeSubOpacities[mapKey];
					delete o.jakeDefaultSubOpacityKeys[mapKey];
				}
				return;
			}
			var value = J.toOpacity(bpv(paramName, fallback), fallback);
			if (fallback === 255 && value === 255) {
				if (o.jakeDefaultSubOpacityKeys[mapKey]) {
					delete o.jakeSubOpacities[mapKey];
					delete o.jakeDefaultSubOpacityKeys[mapKey];
				}
				return;
			}
			if (o.jakeSubOpacities[mapKey] !== undefined && !o.jakeDefaultSubOpacityKeys[mapKey]) return;
			o.jakeSubOpacities[mapKey] = value;
			o.jakeDefaultSubOpacityKeys[mapKey] = true;
		};

		setDefault('Cursor', 'Cursor[ ]?Opacity', 'Cursor Opacity', 255);
		setDefault('Keys', 'Keys[ ]?Opacity', 'Keys Opacity', 255);
		setDefault('Stop Key', 'Stop[ ]?Key[ ]?Opacity', 'Stop Key Opacity', 255);
		setDefault('Main Bar', 'Main[ ]?Bar[ ]?Opacity', 'Main Bar Opacity', 255);
		setDefault('Stability Bar', 'Stability[ ]?Bar[ ]?Opacity', 'Stability Bar Opacity', 255);
		setDefault('Boost Bar', 'Boost[ ]?Bar[ ]?Opacity', 'Boost Bar Opacity', 255);
		setDefault('Focus Bar', 'Focus[ ]?Bar[ ]?Opacity', 'Focus Bar Opacity', 255);
		setDefault('Stick Bar', 'Stick[ ]?Bar[ ]?Opacity', 'Stick Bar Opacity', 255);
		setDefault('Nitro Bar', 'Nitro[ ]?Bar[ ]?Opacity', 'Nitro Bar Opacity', 255);
		setDefault('Concentrate Bar', 'Concentrate[ ]?Bar[ ]?Opacity', 'Concentrate Bar Opacity', 255);
		setDefault('Freeze Bar', 'Freeze[ ]?Bar[ ]?Opacity', 'Freeze Bar Opacity', 255);
	};

	J.splitCsv = function(text) {
		if (text === undefined || text === null) return [];
		var s = String(text).trim();
		if (!s.length) return [];
		return s.split(/\s*,\s*/);
	};

	J.getValue = function(source, pattern, semicolonMode) {
		var body = semicolonMode ? '([^;]*)(?:;|$)' : '([^\\n\\r]*)';
		var re = new RegExp(pattern + '\\s*:\\s*' + body, 'im');
		var m = String(source || '').match(re);
		return m ? String(m[1]).trim() : null;
	};

	J.getFirstValue = function(source, patterns, semicolonMode) {
		for (var i = 0; i < patterns.length; i++) {
			var v = J.getValue(source, patterns[i], semicolonMode);
			if (v !== null) return v;
		}
		return null;
	};

	J.findKeyCodeByNames = function(names, fallback) {
		if (typeof Input === 'undefined' || !Input.keyMapper) return fallback;
		var found = [];
		for (var key in Input.keyMapper) {
			if (!Input.keyMapper.hasOwnProperty(key)) continue;
			var name = String(Input.keyMapper[key] || '').toLowerCase();
			for (var i = 0; i < names.length; i++) {
				if (name === names[i]) {
					found.push(Number(key));
					break;
				}
			}
		}
		if (!found.length) return fallback;
		found.sort(function(a, b) { return a - b; });
		return found[0];
	};

	J.defaultOkKeyCode = function() {
		return J.findKeyCodeByNames(['ok'], 90);
	};

	J.defaultCancelKeyCode = function() {
		return J.findKeyCodeByNames(['cancel', 'escape'], 88);
	};

	J.keyCodeToLabel = function(code) {
		var map = {
			8: 'Backspace', 9: 'Tab', 13: 'Enter', 16: 'Shift', 17: 'Ctrl', 18: 'Alt',
			27: 'Esc', 32: 'Space', 37: 'Left', 38: 'Up', 39: 'Right', 40: 'Down',
			46: 'Del'
		};
		if (map[code]) return map[code];
		if (code >= 48 && code <= 90) return String.fromCharCode(code);
		return 'Key ' + code;
	};

	J.parseKeyCodeList = function(raw, fallback) {
		var arr = J.splitCsv(raw);
		var out = [];
		var named = {
			enter: 13,
			ok: 13,
			z: 90,
			space: 32,
			left: 37,
			right: 39,
			up: 38,
			down: 40,
			shift: 16,
			ctrl: 17,
			control: 17,
			alt: 18,
			esc: 27,
			escape: 27,
			mouse: -1,
			touch: -1,
			click: -1,
			mouseleft: -1,
			leftclick: -1
		};
		for (var i = 0; i < arr.length; i++) {
			var token = String(arr[i] || '').trim();
			if (!token.length) continue;
			var n = parseInt(token);
			if (!isNaN(n)) {
				out.push(n);
				continue;
			}
			var key = token.toLowerCase();
			if (named.hasOwnProperty(key)) out.push(named[key]);
		}
		if (!out.length && fallback && fallback.length) {
			return fallback.slice();
		}
		return out;
	};

	J.parseKeyCodeArray = function(raw, fallback) {
		return J.parseKeyCodeList(raw, Array.isArray(fallback) ? fallback : []);
	};

	J.parseKeyCodeOrString = function(raw, fallback) {
		if (raw === undefined || raw === null || raw === '') {
			return fallback;
		}
		var token = String(raw).trim();
		if (!token.length) {
			return fallback;
		}
		var n = parseInt(token);
		if (!isNaN(n)) {
			return n;
		}
		var parsed = J.parseKeyCodeList(token, []);
		if (parsed.length > 0) {
			return parsed[0];
		}
		return fallback;
	};

	J.parseIntArray = function(raw, fallback) {
		var arr = J.splitCsv(raw);
		var out = [];
		for (var i = 0; i < arr.length; i++) {
			var n = parseInt(String(arr[i] || '').trim());
			if (!isNaN(n)) out.push(n);
		}
		if (!out.length && Array.isArray(fallback)) {
			return fallback.slice();
		}
		return out;
	};

	J.parseStringList = function(raw, fallback) {
		var out = J.splitCsv(raw);
		if (!out.length && Array.isArray(fallback)) {
			return fallback.slice();
		}
		return out;
	};

	J.normalizeDefaultMode = function(raw) {
		var s = String(raw || '').trim().toLowerCase();
		if (s === 'custom hitzones') return 'custom hitzones';
		return 'set hitzone';
	};

	J.normalizeMashMode = function(raw) {
		var s = String(raw || '').trim().toLowerCase();
		switch (s) {
		case 'custom mash':
		case 'multi mash':
		case 'alternative mash':
		case 'sequence mash':
		case 'random mash':
		case 'random multi mash':
		case 'random alternative mash':
		case 'random sequence mash':
			return s;
		default:
			return 'default mash';
		}
	};

	J.normalizePowerValue = function(raw) {
		var s = String(raw || '').trim().toLowerCase();
		if (s === 'highest value') return 'highest value';
		if (s === 'lowest value') return 'lowest value';
		return 'last value';
	};

	J.defaultHitzones = function() {
		var list = [];
		for (var i = 0; i < 20; i++) {
			list.push({
				position: 0,
				hitArea: 0,
				closeArea: 0,
				hitColor: '#ffffff',
				closeColor: '#ffffff'
			});
		}
		return list;
	};

	J.parseHitzone = function(raw) {
		var out = {
			position: 0,
			hitArea: 0,
			closeArea: 0,
			hitColor: '#ffffff',
			closeColor: '#ffffff'
		};
		if (raw === undefined || raw === null || String(raw).trim() === '') {
			return out;
		}
		var parts = String(raw).split(/\s*,\s*/);
		if (parts.length > 0) out.position = J.clamp(J.toNumber(parts[0], 0), -1, 1);
		if (parts.length > 1) out.hitArea = Math.max(0, parseInt(parts[1]) || 0);
		if (parts.length > 2) out.closeArea = Math.max(0, parseInt(parts[2]) || 0);
		if (parts.length > 3 && parts[3] !== '') out.hitColor = String(parts[3]);
		if (parts.length > 4 && parts[4] !== '') out.closeColor = String(parts[4]);
		return out;
	};

	J.evaluateHitzonePower = function(zone, cursorX, totalWidth) {
		var center = (totalWidth / 2) + (zone.position * (totalWidth / 2));
		var dist = Math.abs(cursorX - center);
		if (dist <= zone.hitArea) return 1;
		if (zone.closeArea > 0 && dist <= zone.hitArea + zone.closeArea) {
			return J.clamp(1 - ((dist - zone.hitArea) / zone.closeArea), 0, 1);
		}
		return 0;
	};

	J.applyGeneralProps = function(o, source, semicolonMode) {
		var v;

		v = J.getValue(source, 'Visual[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.visualXOffset = J.toEvalNumber(v, 0);
		else if (o.visualXOffset === undefined) o.visualXOffset = 0;

		v = J.getValue(source, 'Visual[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.visualYOffset = J.toEvalNumber(v, 0);
		else if (o.visualYOffset === undefined) o.visualYOffset = 0;

		v = J.getValue(source, 'Angle[ ]?Offset', semicolonMode);
		if (v !== null) o.angleOffset = J.toEvalNumber(v, 0);
		else if (o.angleOffset === undefined) o.angleOffset = 0;

		var vOpacity = J.getFirstValue(source, ['Main[ ]?Opacity', 'Opacity'], semicolonMode);
		if (vOpacity !== null) {
			o.jakeVisualOpacity = J.toOpacity(vOpacity, 255);
			o.jakeMainOpacityExplicit = true;
		} else if (o.jakeMainOpacityExplicit === undefined) {
			o.jakeMainOpacityExplicit = false;
		}

		var vWindowOpacity = J.getValue(source, 'Window[ ]?Opacity', semicolonMode);
		if (vWindowOpacity !== null) {
			o.opacity = J.toOpacity(vWindowOpacity, J.toOpacity(o.opacity, 255));
		}

		var vOpacity = J.getValue(source, 'Opacity', semicolonMode);
		var vWindowOpacity = J.getValue(source, 'Window[ ]?Opacity', semicolonMode);
		if (vOpacity !== null) {
			o.jakeVisualOpacity = J.toOpacity(vOpacity, J.toOpacity(o.opacity, 255));
		} else if (vWindowOpacity !== null) {
			o.jakeVisualOpacity = J.toOpacity(vWindowOpacity, J.toOpacity(o.opacity, 255));
		} else if (o.jakeVisualOpacity === undefined) {
			o.jakeVisualOpacity = J.toOpacity(o.opacity, 255);
		}

		v = J.getValue(source, 'Visual[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.visualScaleX = J.toEvalNumber(v, 1.0);
		else if (o.visualScaleX === undefined) o.visualScaleX = 1.0;

		v = J.getValue(source, 'Visual[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.visualScaleY = J.toEvalNumber(v, 1.0);
		else if (o.visualScaleY === undefined) o.visualScaleY = 1.0;

		v = J.getValue(source, 'Shown[ ]?Text', semicolonMode);
		if (v !== null) {
			o.shownText = String(v);
			o.jakeHasShownText = true;
		} else if (o.jakeHasShownText === undefined) {
			o.jakeHasShownText = false;
			o.shownText = '';
		}

		v = J.getValue(source, 'Shown[ ]?Picture', semicolonMode);
		if (v !== null) {
			o.shownPicture = String(v);
			o.jakeHasShownPicture = true;
			if (o.shownPicture && o.shownPicture.length > 0) {
				ImageManager.loadPicture(o.shownPicture);
			}
		} else if (o.jakeHasShownPicture === undefined) {
			o.jakeHasShownPicture = false;
			o.shownPicture = '';
		}

		v = J.getFirstValue(source, ['Text[ ]?X[ ]?Offset', 'Text[ ]?Visual[ ]?X[ ]?Offset'], semicolonMode);
		if (v !== null) o.textXOffset = J.toEvalNumber(v, 0);
		else if (o.textXOffset === undefined) o.textXOffset = 0;

		v = J.getFirstValue(source, ['Text[ ]?Y[ ]?Offset', 'Text[ ]?Visual[ ]?Y[ ]?Offset'], semicolonMode);
		if (v !== null) o.textYOffset = J.toEvalNumber(v, 0);
		else if (o.textYOffset === undefined) o.textYOffset = 0;

		v = J.getValue(source, 'Text[ ]?Angle', semicolonMode);
		if (v !== null) o.textAngleOffset = J.toEvalNumber(v, 0);
		else if (o.textAngleOffset === undefined) o.textAngleOffset = 0;

		v = J.getFirstValue(source, ['Text[ ]?Scale[ ]?X', 'Text[ ]?Visual[ ]?Scale[ ]?X'], semicolonMode);
		if (v !== null) o.textScaleX = J.toEvalNumber(v, 1.0);
		else if (o.textScaleX === undefined) o.textScaleX = 1.0;

		v = J.getFirstValue(source, ['Text[ ]?Scale[ ]?Y', 'Text[ ]?Visual[ ]?Scale[ ]?Y'], semicolonMode);
		if (v !== null) o.textScaleY = J.toEvalNumber(v, 1.0);
		else if (o.textScaleY === undefined) o.textScaleY = 1.0;

		v = J.getFirstValue(source, ['Picture[ ]?X[ ]?Offset', 'Picture[ ]?Visual[ ]?X[ ]?Offset'], semicolonMode);
		if (v !== null) o.pictureXOffset = J.toEvalNumber(v, 0);
		else if (o.pictureXOffset === undefined) o.pictureXOffset = 0;

		v = J.getFirstValue(source, ['Picture[ ]?Y[ ]?Offset', 'Picture[ ]?Visual[ ]?Y[ ]?Offset'], semicolonMode);
		if (v !== null) o.pictureYOffset = J.toEvalNumber(v, 0);
		else if (o.pictureYOffset === undefined) o.pictureYOffset = 0;

		v = J.getValue(source, 'Picture[ ]?Angle', semicolonMode);
		if (v !== null) o.pictureAngleOffset = J.toEvalNumber(v, 0);
		else if (o.pictureAngleOffset === undefined) o.pictureAngleOffset = 0;

		v = J.getFirstValue(source, ['Picture[ ]?Scale[ ]?X', 'Picture[ ]?Visual[ ]?Scale[ ]?X'], semicolonMode);
		if (v !== null) o.pictureScaleX = J.toEvalNumber(v, 1.0);
		else if (o.pictureScaleX === undefined) o.pictureScaleX = 1.0;

		v = J.getFirstValue(source, ['Picture[ ]?Scale[ ]?Y', 'Picture[ ]?Visual[ ]?Scale[ ]?Y'], semicolonMode);
		if (v !== null) o.pictureScaleY = J.toEvalNumber(v, 1.0);
		else if (o.pictureScaleY === undefined) o.pictureScaleY = 1.0;

		J.applySubOpacityProps(o, source, semicolonMode);
	};

	J.applyDefaultProps = function(o, source, semicolonMode) {
		if (!o || o.type !== SRD.TimedAttack.TAS_ID) return;

		var v = J.getValue(source, 'Mode', semicolonMode);
		if (v !== null) o.jakeDefaultMode = J.normalizeDefaultMode(v);
		else if (!o.jakeDefaultMode) o.jakeDefaultMode = 'set hitzone';

		v = J.getValue(source, 'Background[ ]?Color', semicolonMode);
		if (v !== null) o.jakeBarBackgroundColor = String(v);
		else if (!o.jakeBarBackgroundColor) o.jakeBarBackgroundColor = '#ffffff';

		if (!o.jakeHitzones) o.jakeHitzones = J.defaultHitzones();
		for (var i = 1; i <= 10; i++) {
			v = J.getValue(source, 'Hitzone[ ]?' + i, semicolonMode);
			if (v !== null) o.jakeHitzones[i - 1] = J.parseHitzone(v);
		}
	};

	J.applyMashProps = function(o, source, semicolonMode) {
		if (!o || o.type !== 'mash') return;

		var v = J.getValue(source, 'Mode', semicolonMode);
		if (v !== null) o.jakeMashMode = J.normalizeMashMode(v);
		else if (!o.jakeMashMode) o.jakeMashMode = 'default mash';

		v = J.getValue(source, 'Mash[ ]?Keys', semicolonMode);
		if (v !== null) o.jakeMashKeys = String(v);

		if (!o.jakeMashRandomKeys) o.jakeMashRandomKeys = [];
		if (!o.jakeMashRandomKeysTexts) o.jakeMashRandomKeysTexts = [];
		if (!o.jakeMashRandomKeysIcons) o.jakeMashRandomKeysIcons = [];
		for (var i = 1; i <= 20; i++) {
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i, semicolonMode);
			if (v !== null) o.jakeMashRandomKeys[i - 1] = String(v);
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i + '[ ]?Texts', semicolonMode);
			if (v !== null) o.jakeMashRandomKeysTexts[i - 1] = String(v);
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i + '[ ]?Icons', semicolonMode);
			if (v !== null) o.jakeMashRandomKeysIcons[i - 1] = String(v);
		}

		v = J.getValue(source, 'Random[ ]?Once', semicolonMode);
		if (v !== null) o.jakeMashRandomOnce = J.parseBool(v, false);
		else if (o.jakeMashRandomOnce === undefined) o.jakeMashRandomOnce = false;

		v = J.getValue(source, 'Random[ ]?Specified[ ]?Once', semicolonMode);
		if (v !== null) o.jakeMashRandomSpecifiedOnce = String(v);
		else if (o.jakeMashRandomSpecifiedOnce === undefined) o.jakeMashRandomSpecifiedOnce = '';

		var lowerSource = String(source || '').toLowerCase();
		var idxRandomOnce = lowerSource.lastIndexOf('random once');
		var idxRandomSpecifiedOnce = lowerSource.lastIndexOf('random specified once');
		if (idxRandomOnce >= 0 || idxRandomSpecifiedOnce >= 0) {
			o.jakeMashOncePriority = (idxRandomSpecifiedOnce > idxRandomOnce) ? 'specified' : 'global';
		} else if (o.jakeMashOncePriority === undefined) {
			o.jakeMashOncePriority = 'specified';
		}

		v = J.getValue(source, 'Unending', semicolonMode);
		if (v !== null) o.jakeMashUnending = J.parseBool(v, false);
		else if (o.jakeMashUnending === undefined) o.jakeMashUnending = false;

		v = J.getValue(source, 'Timeless', semicolonMode);
		if (v !== null) o.jakeMashTimeless = J.parseBool(v, false);
		else if (o.jakeMashTimeless === undefined) o.jakeMashTimeless = false;

		v = J.getValue(source, 'Power[ ]?Value', semicolonMode);
		if (v !== null) o.jakeMashPowerValue = J.normalizePowerValue(v);
		else if (!o.jakeMashPowerValue) o.jakeMashPowerValue = 'last value';

		v = J.getValue(source, 'Stop[ ]?key', semicolonMode);
		if (v !== null) {
			var keyCode = parseInt(v);
			o.jakeMashStopKey = isNaN(keyCode) ? null : keyCode;
		} else if (o.jakeMashStopKey === undefined) {
			o.jakeMashStopKey = null;
		}

		v = J.getValue(source, 'Stop[ ]?key[ ]?Text', semicolonMode);
		if (v !== null) o.jakeMashStopText = String(v);
		else if (o.jakeMashStopText === undefined) o.jakeMashStopText = '';

		v = J.getValue(source, 'Stop[ ]?key[ ]?Icon', semicolonMode);
		if (v !== null) o.jakeMashStopIcon = String(v);
		else if (o.jakeMashStopIcon === undefined) o.jakeMashStopIcon = '';
	};

	J.applyArrowsProps = function(o, source, semicolonMode) {
		if (!o || o.type !== 'arrows') return;

		var v = J.getValue(source, 'Randomize[ ]?Commands[ ]?Texts', semicolonMode);
		if (v !== null) o.jakeArrowCommandTexts = String(v);
		else if (o.jakeArrowCommandTexts === undefined) o.jakeArrowCommandTexts = '';

		v = J.getValue(source, 'Randomize[ ]?Commands[ ]?Icons', semicolonMode);
		if (v !== null) o.jakeArrowCommandIcons = String(v);
		else if (o.jakeArrowCommandIcons === undefined) o.jakeArrowCommandIcons = '';

		if (!o.jakeArrowRandomKeys) o.jakeArrowRandomKeys = [];
		if (!o.jakeArrowRandomKeysTexts) o.jakeArrowRandomKeysTexts = [];
		if (!o.jakeArrowRandomKeysIcons) o.jakeArrowRandomKeysIcons = [];
		for (var i = 1; i <= 20; i++) {
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i, semicolonMode);
			if (v !== null) o.jakeArrowRandomKeys[i - 1] = String(v);
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i + '[ ]?Texts', semicolonMode);
			if (v !== null) o.jakeArrowRandomKeysTexts[i - 1] = String(v);
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i + '[ ]?Icons', semicolonMode);
			if (v !== null) o.jakeArrowRandomKeysIcons[i - 1] = String(v);
		}
	};

	J.applyClockTargets = function(o, source, semicolonMode) {
		if (!o || o.type !== 'clock') return;

		if (!o.targets) o.targets = [];
		for (var i = 0; i < 20; i++) {
			if (o.targets[i] === undefined || o.targets[i] === null) o.targets[i] = '';
		}

		for (var t = 1; t <= 20; t++) {
			var v = J.getValue(source, 'Target[ ]?' + t, semicolonMode);
			if (v !== null) o.targets[t - 1] = String(v);
		}
	};

	J.applyExtendedProps = function(o, source, semicolonMode) {
		J.applyGeneralProps(o, source, semicolonMode);
		J.applyDefaultProps(o, source, semicolonMode);
		J.applyMashProps(o, source, semicolonMode);
		J.applyArrowsProps(o, source, semicolonMode);
		J.applyClockTargets(o, source, semicolonMode);
	};

	if (typeof Input !== 'undefined' && !Input._jakeTAKeyTrackingPatched) {
		Input._jakeTAKeyTrackingPatched = true;
		Input._jakeTAKeyFrame = {};
		var _Input_onKeyDown = Input._onKeyDown;
		Input._onKeyDown = function(event) {
			_Input_onKeyDown.call(this, event);
			if (!event || event.keyCode === undefined || event.keyCode === null) return;
			if (!event.repeat) {
				this._jakeTAKeyFrame[event.keyCode] = Graphics.frameCount;
			}
		};
	}

	J.isKeyCodeTriggered = function(code) {
		if (!Input || !Input._jakeTAKeyFrame) return false;
		return Input._jakeTAKeyFrame[code] === Graphics.frameCount;
	};

	J.getTriggeredFrom = function(codes) {
		for (var i = 0; i < codes.length; i++) {
			if (J.isKeyCodeTriggered(Number(codes[i]))) return Number(codes[i]);
		}
		return null;
	};

	if (typeof Game_Temp !== 'undefined' && !Game_Temp.prototype._jakeTAV2Patched) {
		Game_Temp.prototype._jakeTAV2Patched = true;
		var _Game_Temp_initialize_v2 = Game_Temp.prototype.initialize;
		Game_Temp.prototype.initialize = function() {
			_Game_Temp_initialize_v2.call(this);
			if (this._tasTimeLeft === undefined) this._tasTimeLeft = 0;
		};

		Object.defineProperty(Game_Temp.prototype, 'tas_power', {
			get: function() {
				return this._tasDamageRation;
			},
			set: function(value) {
				if (Array.isArray(value)) {
					this._tasDamageRation = value.slice();
					return;
				}
				var n = Number(value);
				if (isNaN(n)) n = 0;
				this._tasDamageRation = J.clamp(n, 0, 999);
			},
			configurable: true
		});

		Object.defineProperty(Game_Temp.prototype, 'tas_time_left', {
			get: function() {
				return this._tasTimeLeft || 0;
			},
			set: function(value) {
				var n = Number(value);
				if (isNaN(n)) n = 0;
				this._tasTimeLeft = Math.max(0, n);
			},
			configurable: true
		});
	}

	if (typeof $gameTemp !== 'undefined' && $gameTemp && $gameTemp._tasTimeLeft === undefined) {
		$gameTemp._tasTimeLeft = 0;
	}

	var _jBattleLog_showAnimation = Window_BattleLog.prototype.showAnimation;
	Window_BattleLog.prototype.showAnimation = function(subject, targets, animationId) {
		if (subject && subject.isActor && subject.isActor() && Array.isArray($gameTemp.tas_power)) {
			var allow = false;
			for (var i = 1; i < $gameTemp.tas_power.length; i++) {
				if (Number($gameTemp.tas_power[i]) > 0) {
					allow = true;
					break;
				}
			}
			if (!allow) return;
			if (animationId < 0) {
				this.showAttackAnimation(subject, targets);
			} else {
				this.showNormalAnimation(targets, animationId, false);
			}
			return;
		}
		_jBattleLog_showAnimation.call(this, subject, targets, animationId);
	};

	var _jOldOrganizeInfo = SRD.TimedAttack.organizeInfo;
	SRD.TimedAttack.organizeInfo = function(o) {
		_jOldOrganizeInfo.call(this, o);
		if (!o) return;
		var source = (o.info && typeof o.info === 'string') ? o.info : '';
		J.applyExtendedProps(o, source, false);
	};

	Game_Map.prototype.changeTA = function(objectType, objectID, notesTA) {
		var type = String(objectType || '').trim().toLowerCase();
		var entry = null;
		if (type.match(/skill(s)*/im)) entry = $dataSkills[objectID];
		else if (type.match(/weapon(s)*/im)) entry = $dataWeapons[objectID];
		else if (type.match(/class(es)*/im)) entry = $dataClasses[objectID];
		else if (type.match(/actor(s)*/im)) entry = $dataActors[objectID];
		else if (type.match(/armor(s)*/im)) entry = $dataArmors[objectID];
		if (!entry || !entry.meta || !entry.meta['SRD TAS']) return;
		this.NotesProcChangeTA(entry.meta['SRD TAS'], notesTA);
	};

	var _jOldNotesProcChangeTA = Game_Map.prototype.NotesProcChangeTA;
	Game_Map.prototype.NotesProcChangeTA = function(o, notesTA) {
		if (!o || notesTA === undefined || notesTA === null) return;
		var normalized = J.normalizePropertyAssignments(notesTA);
		var legacyError = null;
		if (_jOldNotesProcChangeTA) {
			try {
				_jOldNotesProcChangeTA.call(this, o, normalized);
			} catch (e) {
				legacyError = e;
			}
		}

		J.applyExtendedProps(o, normalized, true);

		if (o.type === 'default') {
			if (o.image && o.image.trim && o.image.trim().length > 0) this.loadImage(o.image);
			if (o.bi && o.bi.trim && o.bi.trim().length > 0) this.loadImage(o.bi);
		}
		if (o.type === 'wheel') {
			if (o.button) SRD.TimedAttack.loadImage(o.button);
			if (o.ring) SRD.TimedAttack.loadImage(o.ring);
			if (o.target) SRD.TimedAttack.loadImage(o.target);
		}
		if (o.jakeHasShownPicture && o.shownPicture && o.shownPicture.length > 0) {
			ImageManager.loadPicture(o.shownPicture);
		}

		if (legacyError && typeof console !== 'undefined' && console.warn) {
			console.warn('[JakeTA] Legacy NotesProcChangeTA parse failed; using extended parser result.', legacyError);
		}
	};

	TimedAttackSystem.prototype._jakeResetVisualTransform = function() {
		this.pivot.x = 0;
		this.pivot.y = 0;
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.scale.x = 1;
		this.scale.y = 1;
	};

	TimedAttackSystem.prototype._jakeApplyVisualTransform = function(centerX, centerY) {
		var angle = this._angleOffset || 0;
		var sx = (this._visualScaleX !== undefined) ? this._visualScaleX : 1;
		var sy = (this._visualScaleY !== undefined) ? this._visualScaleY : 1;
		if (angle || sx !== 1 || sy !== 1) {
			this.pivot.x = centerX;
			this.pivot.y = centerY;
			this.x = centerX;
			this.y = centerY;
			this.rotation = angle * Math.PI / 180;
			this.scale.x = sx;
			this.scale.y = sy;
		} else {
			this._jakeResetVisualTransform();
		}
	};

	TimedAttackSystem.prototype._applyAngleOffsetToCoords = function(centerX, centerY) {
		this._jakeApplyVisualTransform(centerX, centerY);
	};

	TimedAttackSystem.prototype._jakeEnsureOverlaySprites = function() {
		if (!this._jakeTextSprite) {
			this._jakeTextSprite = new Sprite(new Bitmap(1, 1));
			this._jakeTextSprite.anchor.x = 0.5;
			this._jakeTextSprite.anchor.y = 0.5;
			this.addChild(this._jakeTextSprite);
		}
		if (!this._jakePictureSprite) {
			this._jakePictureSprite = new Sprite();
			this._jakePictureSprite.anchor.x = 0.5;
			this._jakePictureSprite.anchor.y = 0.5;
			this.addChild(this._jakePictureSprite);
		}
		if (this._jakeTextSprite.parent === this) {
			this.setChildIndex(this._jakeTextSprite, this.children.length - 1);
		}
		if (this._jakePictureSprite.parent === this) {
			this.setChildIndex(this._jakePictureSprite, this.children.length - 1);
		}
	};

	TimedAttackSystem.prototype._jakeHideOverlaySprites = function() {
		if (this._jakeTextSprite) this._jakeTextSprite.visible = false;
		if (this._jakePictureSprite) this._jakePictureSprite.visible = false;
	};

	TimedAttackSystem.prototype._jakeResolveShownText = function(defaultText) {
		if (!this._item) return null;
		if (this._item.jakeHasShownText) return String(this._item.shownText || '');
		return defaultText;
	};

	TimedAttackSystem.prototype._jakeUpdateOverlayText = function(defaultText, baseX, baseY) {
		this._jakeEnsureOverlaySprites();
		var text = this._jakeResolveShownText(defaultText);
		if (text === null || text === undefined || text === '') {
			this._jakeTextSprite.visible = false;
			return;
		}

		var width = Math.max(24, this.textWidth(text) + 12);
		var height = this.lineHeight() + 8;
		if (!this._jakeTextSprite.bitmap || this._jakeTextSprite.bitmap.width !== width || this._jakeTextSprite.bitmap.height !== height) {
			this._jakeTextSprite.bitmap = new Bitmap(width, height);
		}

		this._jakeTextSprite.bitmap.clear();
		this._jakeTextSprite.bitmap.drawText(text, 0, 0, width, height, 'center');
		this._jakeTextSprite.x = baseX + (this._textXOffset || 0);
		this._jakeTextSprite.y = baseY + (this._textYOffset || 0);
		this._jakeTextSprite.rotation = (this._textAngleOffset || 0) * Math.PI / 180;
		this._jakeTextSprite.scale.x = (this._textScaleX !== undefined) ? this._textScaleX : 1;
		this._jakeTextSprite.scale.y = (this._textScaleY !== undefined) ? this._textScaleY : 1;
		this._jakeTextSprite.visible = true;
	};

	TimedAttackSystem.prototype._jakeUpdateOverlayPicture = function(baseX, baseY) {
		this._jakeEnsureOverlaySprites();
		if (!this._item || !this._item.jakeHasShownPicture || !this._item.shownPicture || this._item.shownPicture.length === 0) {
			this._jakePictureSprite.visible = false;
			return;
		}

		this._jakePictureSprite.bitmap = ImageManager.loadPicture(this._item.shownPicture);
		this._jakePictureSprite.x = baseX + (this._pictureXOffset || 0);
		this._jakePictureSprite.y = baseY + (this._pictureYOffset || 0);
		this._jakePictureSprite.rotation = (this._pictureAngleOffset || 0) * Math.PI / 180;
		this._jakePictureSprite.scale.x = (this._pictureScaleX !== undefined) ? this._pictureScaleX : 1;
		this._jakePictureSprite.scale.y = (this._pictureScaleY !== undefined) ? this._pictureScaleY : 1;
		this._jakePictureSprite.visible = true;
	};

	TimedAttackSystem.prototype._jakeCleanupArrowSprites = function() {
		if (!this._jArrowSprites) return;
		for (var i = 0; i < this._jArrowSprites.length; i++) {
			if (this._jArrowSprites[i] && this._jArrowSprites[i].parent === this) {
				this.removeChild(this._jArrowSprites[i]);
			}
		}
		this._jArrowSprites = null;
	};

	TimedAttackSystem.prototype._jakeBuildZeroHitzoneArray = function() {
		var arr = [0];
		for (var i = 0; i < 10; i++) arr[i + 1] = 0;
		return arr;
	};

	TimedAttackSystem.prototype._jakeEvaluateCustomHitzones = function(cursorX, totalWidth) {
		var list = this._jHitzones || J.defaultHitzones();
		var out = [0];
		for (var i = 0; i < 10; i++) {
			out[i + 1] = J.evaluateHitzonePower(list[i], cursorX, totalWidth);
		}
		return out;
	};

	var _jOldLoadItem = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		_jOldLoadItem.call(this, item);

		this._visualXOffset = J.toNumber(item.visualXOffset, 0);
		this._visualYOffset = J.toNumber(item.visualYOffset, 0);
		this._angleOffset = J.toNumber(item.angleOffset, 0);
		this._visualScaleX = J.toNumber(item.visualScaleX, 1);
		this._visualScaleY = J.toNumber(item.visualScaleY, 1);

		this._textXOffset = J.toNumber(item.textXOffset, 0);
		this._textYOffset = J.toNumber(item.textYOffset, 0);
		this._textAngleOffset = J.toNumber(item.textAngleOffset, 0);
		this._textScaleX = J.toNumber(item.textScaleX, 1);
		this._textScaleY = J.toNumber(item.textScaleY, 1);

		this._pictureXOffset = J.toNumber(item.pictureXOffset, 0);
		this._pictureYOffset = J.toNumber(item.pictureYOffset, 0);
		this._pictureAngleOffset = J.toNumber(item.pictureAngleOffset, 0);
		this._pictureScaleX = J.toNumber(item.pictureScaleX, 1);
		this._pictureScaleY = J.toNumber(item.pictureScaleY, 1);

		this._jakeHideOverlaySprites();
		this._jakeResetVisualTransform();
		this._window.rotation = 0;
		this._window.pivot.x = 0;
		this._window.pivot.y = 0;

		if (item.type === SRD.TimedAttack.TAS_ID) {
			if (SRD.TimedAttack.xAlign === 'left') this._window.x = 0;
			else if (SRD.TimedAttack.xAlign === 'right') this._window.x = Graphics.width - this._window.width;
			else this._window.x = (Graphics.width / 2) - (this._window.width / 2);

			if (SRD.TimedAttack.yAlign === 'top') this._window.y = 0;
			else if (SRD.TimedAttack.yAlign === 'bottom') this._window.y = Graphics.height - this._window.height;
			else this._window.y = (Graphics.height / 2) - (this._window.height / 2);

			try {
				this._window.x += eval(SRD.TimedAttack.xPos);
			} catch (e) {
			}
			try {
				this._window.y += eval(SRD.TimedAttack.yPos);
			} catch (e2) {
			}

			this._window.x += this._visualXOffset;
			this._window.y += this._visualYOffset;

			if (!isSideview) {
				this._window.x += globalNonSideXOffset + globalNonSideXOffsetBar;
				this._window.y += globalNonSideYOffset + globalNonSideYOffsetBar;
			}

			this._jDefaultMode = item.jakeDefaultMode || 'set hitzone';
			this._jBarBackgroundColor = item.jakeBarBackgroundColor || '#ffffff';
			this._jHitzones = item.jakeHitzones || J.defaultHitzones();
		}

		if (item.type === 'mash') {
			this._jakeSetupMashItem(item);
		}

		if (item.type === 'arrows') {
			this._jakeSetupArrowsItem(item);
		}

		if (item.type === 'clock' && item.targets) {
			for (var i = 0; i < 20; i++) {
				if (item.targets[i] === undefined || item.targets[i] === null) item.targets[i] = '';
			}
		}
	};

	var _jOldLoadStart = TimedAttackSystem.prototype.loadStart;
	TimedAttackSystem.prototype.loadStart = function() {
		_jOldLoadStart.call(this);
		this._jakeHideOverlaySprites();
		this._jakeResetVisualTransform();
		if (this._item) {
			if (J.setTasTimeLeftFromFrames) J.setTasTimeLeftFromFrames(0);
		}

		if (this._item && this._item.type === 'mash') {
			this._jakeInitMashRuntime();
		}

		if (this._item && this._item.type === 'arrows') {
			this._jakeCleanupArrowSprites();
			this._oneUpdate = true;
		}
	};

	var _jOldClose = TimedAttackSystem.prototype.close;
	TimedAttackSystem.prototype.close = function() {
		this._jakeCleanupArrowSprites();
		this._jakeHideOverlaySprites();
		this._jakeResetVisualTransform();
		_jOldClose.call(this);
		this._jakeHideOverlaySprites();
		this._jakeResetVisualTransform();
	};

	var _jOldPlayDefaultGame = TimedAttackSystem.prototype.playDefaultGame;
	TimedAttackSystem.prototype.playDefaultGame = function() {
		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID && this._jDefaultMode === 'custom hitzones') {
			this._jakePlayDefaultCustomHitzones();
			return;
		}

		_jOldPlayDefaultGame.call(this);

		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID) {
			var centerX = this._window.x + (this._window.width / 2);
			var centerY = this._window.y + (this._window.height / 2);
			this._jakeApplyVisualTransform(centerX, centerY);
			this._jakeUpdateOverlayText(null, centerX, this._window.y - (this.lineHeight() / 2));
			this._jakeUpdateOverlayPicture(centerX, centerY);
		}
	};

	TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones = function() {
		if (this._notPressed && this._jakeUpdateDefaultHitzoneMovements) {
			this._jakeUpdateDefaultHitzoneMovements();
		}

		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._xSpeed);
			if (this._xPosition > this.windowWidth() || this._xPosition < -(this._item.width)) {
				if (this._rt === 'repeat') {
					this._xPosition = this._origin;
				} else if (this._rt === 'reverse') {
					this._xSpeed *= (-1);
				} else {
					this.setPower(this._jakeBuildZeroHitzoneArray());
					this._flashTime = 45;
				}
			}
		} else {
			this._flashTime++;
		}

		if (this._flashTime === 45) {
			BattleManager.endTASAttackThing();
			this.close();
		}

		this._window.contents.clear();
		var totalWidth = this.windowWidth();
		var contentWidth = this._window.contentsWidth();
		var contentHeight = this._window.contentsHeight();
		var scaleRatio = contentWidth / Math.max(totalWidth, 1);
		this._window.contents.fillRect(0, 0, contentWidth, contentHeight, this._jBarBackgroundColor || '#ffffff');

		var zones = this._jHitzones || J.defaultHitzones();
		for (var i = 0; i < zones.length; i++) {
			var zone = zones[i];
			var zoneCenter = (totalWidth / 2) + (zone.position * (totalWidth / 2));
			var drawCenter = zoneCenter * scaleRatio;
			var closeRadius = zone.hitArea + zone.closeArea;
			if (closeRadius > 0) {
				var closeLeft = Math.floor(drawCenter - (closeRadius * scaleRatio));
				var closeWidth = Math.floor((closeRadius * 2) * scaleRatio);
				this._window.contents.fillRect(closeLeft, 0, closeWidth, contentHeight, zone.closeColor);
			}
			if (zone.hitArea > 0) {
				var hitLeft = Math.floor(drawCenter - (zone.hitArea * scaleRatio));
				var hitWidth = Math.floor((zone.hitArea * 2) * scaleRatio);
				this._window.contents.fillRect(hitLeft, 0, hitWidth, contentHeight, zone.hitColor);
			}
		}

		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			var drawX = this._xPosition * scaleRatio;
			if (this._shape === 'image' && this._image !== undefined) {
				var bitmap = SRD.TimedAttack.loadImage(this._image);
				this._window.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, (drawX - (bitmap.width / 2)), 0);
			} else if (this._shape === 'rectangle') {
				var drawWidth = this._item.width * scaleRatio;
				var drawSize = this._size * scaleRatio;
				this.contents.fillRect(drawX - (drawWidth / 2), 0, drawWidth,
					this.height - (this._window.standardPadding() * 2), this._item.outline);
				this.contents.fillRect(drawX + drawSize - (drawWidth / 2), drawSize,
					drawWidth - (drawSize * 2), this.height - (this._window.standardPadding() * 2) - (drawSize * 2), this._item.color);
			} else if (this._shape === 'oval') {
				var height = this.height - (this._window.standardPadding() * 2);
				var ovalWidth = this._item.width * scaleRatio;
				var ovalSize = this._size * scaleRatio;
				this._window.contents.drawCircle(drawX - (ovalWidth / 2), height / 2, ovalWidth, this._item.outline);
				this._window.contents.drawCircle(drawX + (ovalSize / 2) - 1 - (ovalWidth / 2),
					(height / 2) + (ovalSize / 2) - 1, ovalWidth - ovalSize, this._item.color);
			}
		}

		if (this._jakeActivationTriggered() && this._notPressed) {
			this._notPressed = false;
			AudioManager.playSe({"name":this._se,"pan":0,"pitch":100,"volume":100});
			this.setPower(this._jakeEvaluateCustomHitzones(this._xPosition, totalWidth));
		}

		var centerX = this._window.x + (this._window.width / 2);
		var centerY = this._window.y + (this._window.height / 2);
		this._jakeApplyVisualTransform(centerX, centerY);
		this._jakeUpdateOverlayText(null, centerX, this._window.y - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(centerX, centerY);
	};

	TimedAttackSystem.prototype._jakeSetupMashItem = function(item) {
		this._jMashMode = J.normalizeMashMode(item.jakeMashMode || 'default mash');

		var ok = J.defaultOkKeyCode();
		var cancel = J.defaultCancelKeyCode();
		this._jMashKeys = J.parseKeyCodeList(item.jakeMashKeys, []);
		if (this._jMashMode === 'custom mash' && this._jMashKeys.length === 0) this._jMashKeys = [ok];
		if (this._jMashMode === 'multi mash' && this._jMashKeys.length === 0) this._jMashKeys = [ok];
		if ((this._jMashMode === 'alternative mash' || this._jMashMode === 'sequence mash') && this._jMashKeys.length === 0) {
			this._jMashKeys = [ok, cancel];
		}

		this._jMashPools = [];
		for (var i = 0; i < 10; i++) {
			var rawKeys = item.jakeMashRandomKeys ? item.jakeMashRandomKeys[i] : null;
			var hasData = rawKeys !== undefined && rawKeys !== null && String(rawKeys).trim().length > 0;
			if (i === 0 || hasData) {
				var keys = J.parseKeyCodeList(rawKeys, (i === 0) ? [ok] : []);
				if (keys.length > 0) {
					this._jMashPools.push({
						keys: keys,
						texts: J.splitCsv(item.jakeMashRandomKeysTexts ? item.jakeMashRandomKeysTexts[i] : ''),
						icons: J.splitCsv(item.jakeMashRandomKeysIcons ? item.jakeMashRandomKeysIcons[i] : '')
					});
				}
			}
		}
		if (!this._jMashPools.length) {
			this._jMashPools.push({keys:[ok], texts:[], icons:[]});
		}

		this._jMashRandomOnce = J.parseBool(item.jakeMashRandomOnce, false);
		this._jMashOncePriority = item.jakeMashOncePriority || 'specified';
		this._jMashSpecifiedOnce = [];
		var specified = J.splitCsv(item.jakeMashRandomSpecifiedOnce);
		for (var s = 0; s < specified.length; s++) {
			this._jMashSpecifiedOnce[s] = J.parseBool(specified[s], false);
		}
		this._jMashHasSpecifiedOnce = specified.length > 0;

		this._jMashUnending = J.parseBool(item.jakeMashUnending, false);
		this._jMashTimeless = J.parseBool(item.jakeMashTimeless, false);
		this._jMashPowerValue = J.normalizePowerValue(item.jakeMashPowerValue || 'last value');

		var stopKey = parseInt(item.jakeMashStopKey);
		this._jMashStopKey = isNaN(stopKey) ? null : stopKey;
		this._jMashStopText = (item.jakeMashStopText !== undefined && item.jakeMashStopText !== null) ? String(item.jakeMashStopText) : '';
		this._jMashStopIcon = (item.jakeMashStopIcon !== undefined && item.jakeMashStopIcon !== null) ? String(item.jakeMashStopIcon) : '';
	};

	TimedAttackSystem.prototype._jakeInitMashRuntime = function() {
		this._jMashPoolStates = [];
		for (var i = 0; i < this._jMashPools.length; i++) {
			var pool = this._jMashPools[i];
			var once = this._jMashRandomOnce;
			if (this._jMashHasSpecifiedOnce && this._jMashOncePriority === 'specified') {
				once = J.parseBool(this._jMashSpecifiedOnce[i], false);
			}
			var state = {
				keys: pool.keys.slice(),
				texts: pool.texts.slice(),
				icons: pool.icons.slice(),
				once: once,
				selected: 0,
				currentKey: pool.keys[0]
			};
			this._jMashPoolStates.push(state);
			this._jakeSelectMashPoolKey(i, true);
		}

		this._jMashLastPressedKey = null;
		this._jMashLastPool = -1;
		this._jMashSeqIndex = 0;
		this._jMashSeqPoolIndex = 0;
		this._jMashSeqPressedPools = [];
		for (var j = 0; j < this._jMashPoolStates.length; j++) {
			this._jMashSeqPressedPools[j] = false;
		}

		var ratio = (this._maxPosition > 0) ? J.clamp(this._xPosition / this._maxPosition, 0, 1) : 0;
		this._jMashLastRatio = ratio;
		this._jMashHighestRatio = ratio;
		this._jMashLowestRatio = ratio;
	};

	TimedAttackSystem.prototype._jakeSelectMashPoolKey = function(poolIndex, force) {
		var state = this._jMashPoolStates[poolIndex];
		if (!state || !state.keys || !state.keys.length) return;
		if (!force && state.once) return;
		state.selected = Math.randomInt(state.keys.length);
		state.currentKey = state.keys[state.selected];
	};

	TimedAttackSystem.prototype._jakeGetMashPoolDisplay = function(state) {
		var icon = state.icons[state.selected];
		if (icon && icon.length > 0) return {type:'icon', value:icon};
		var text = state.texts[state.selected];
		if (text && text.length > 0) return {type:'text', value:text};
		return {type:'text', value:J.keyCodeToLabel(state.currentKey)};
	};

	TimedAttackSystem.prototype._jakeMashIsRandomMode = function() {
		return this._jMashMode === 'random mash' ||
			this._jMashMode === 'random multi mash' ||
			this._jMashMode === 'random alternative mash' ||
			this._jMashMode === 'random sequence mash';
	};

	TimedAttackSystem.prototype._jakeMashPoolBlocked = function(index) {
		if (this._jMashMode === 'random alternative mash') {
			return index === this._jMashLastPool;
		}
		if (this._jMashMode === 'random sequence mash') {
			return !!this._jMashSeqPressedPools[index];
		}
		return false;
	};

	TimedAttackSystem.prototype._jakeProcessRandomMashInput = function() {
		if (!this._jMashPoolStates || !this._jMashPoolStates.length) return false;

		var triggeredPool = -1;
		for (var i = 0; i < this._jMashPoolStates.length; i++) {
			if (J.isKeyCodeTriggered(this._jMashPoolStates[i].currentKey)) {
				triggeredPool = i;
				break;
			}
		}
		if (triggeredPool < 0) return false;

		if (this._jMashMode === 'random mash') {
			if (triggeredPool !== 0) return false;
			this._jakeSelectMashPoolKey(0, false);
			return true;
		}

		if (this._jMashMode === 'random multi mash') {
			this._jakeSelectMashPoolKey(triggeredPool, false);
			return true;
		}

		if (this._jMashMode === 'random alternative mash') {
			if (triggeredPool === this._jMashLastPool) {
				return false;
			}
			this._jMashLastPool = triggeredPool;
			this._jakeSelectMashPoolKey(triggeredPool, false);
			return true;
		}

		if (this._jMashMode === 'random sequence mash') {
			if (triggeredPool !== this._jMashSeqPoolIndex) {
				return false;
			}
			this._jMashSeqPressedPools[triggeredPool] = true;
			this._jakeSelectMashPoolKey(triggeredPool, false);
			this._jMashSeqPoolIndex++;
			if (this._jMashSeqPoolIndex >= this._jMashPoolStates.length) {
				this._jMashSeqPoolIndex = 0;
				for (var j = 0; j < this._jMashSeqPressedPools.length; j++) {
					this._jMashSeqPressedPools[j] = false;
				}
			}
			return true;
		}

		return false;
	};

	TimedAttackSystem.prototype._jakeProcessMashInput = function() {
		switch (this._jMashMode) {
		case 'default mash':
			return !!this._jakeActivationTriggered();
		case 'custom mash':
			return J.getTriggeredFrom([this._jMashKeys[0]]) !== null;
		case 'multi mash':
			return J.getTriggeredFrom(this._jMashKeys) !== null;
		case 'alternative mash':
			var alt = J.getTriggeredFrom(this._jMashKeys);
			if (alt !== null && alt !== this._jMashLastPressedKey) {
				this._jMashLastPressedKey = alt;
				return true;
			}
			return false;
		case 'sequence mash':
			if (!this._jMashKeys.length) return false;
			var expected = this._jMashKeys[this._jMashSeqIndex];
			if (J.isKeyCodeTriggered(expected)) {
				this._jMashSeqIndex = (this._jMashSeqIndex + 1) % this._jMashKeys.length;
				this._jMashLastPressedKey = expected;
				return true;
			}
			return false;
		case 'random mash':
		case 'random multi mash':
		case 'random alternative mash':
		case 'random sequence mash':
			return this._jakeProcessRandomMashInput();
		default:
			return !!this._jakeActivationTriggered();
		}
	};

	TimedAttackSystem.prototype._jakeUpdateMashPowerTracking = function() {
		var ratio = (this._maxPosition > 0) ? J.clamp(this._xPosition / this._maxPosition, 0, 1) : 0;
		this._jMashLastRatio = ratio;
		if (ratio > this._jMashHighestRatio) this._jMashHighestRatio = ratio;
		if (ratio < this._jMashLowestRatio) this._jMashLowestRatio = ratio;
	};

	TimedAttackSystem.prototype._jakeResolveMashPower = function() {
		if (this._jMashPowerValue === 'highest value') return this._jMashHighestRatio;
		if (this._jMashPowerValue === 'lowest value') return this._jMashLowestRatio;
		return this._jMashLastRatio;
	};

	TimedAttackSystem.prototype._jakeFinishMash = function(reason) {
		if (!this._notPressed) return;
		this._notPressed = false;

		if (reason === 'fill') {
			AudioManager.playSe({"name":this._item.vse,"pan":0,"pitch":100,"volume":100});
		} else if (reason === 'drain') {
			AudioManager.playSe({"name":this._item.fse,"pan":0,"pitch":100,"volume":100});
		} else {
			AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
		}

		this.setPower(this._jakeResolveMashPower());
		if ((reason === 'fill' || reason === 'stop') && !this._jMashTimeless) {
			$gameTemp.tas_time_left = Math.max(this._seconds, 0);
		} else {
			$gameTemp.tas_time_left = 0;
		}
	};

	TimedAttackSystem.prototype._jakeMashStopDisplay = function() {
		if (this._jMashStopIcon && this._jMashStopIcon.length > 0) {
			return {type:'icon', value:this._jMashStopIcon};
		}
		if (this._jMashStopText && this._jMashStopText.length > 0) {
			return {type:'text', value:this._jMashStopText};
		}
		return {type:'text', value:J.keyCodeToLabel(this._jMashStopKey)};
	};

	TimedAttackSystem.prototype._jakeDrawMashToken = function(centerX, centerY, size, display, blocked, baseColor, iconFrameColor) {
		var bmp = this._content.bitmap;
		var left = Math.round(centerX - (size / 2));
		var top = Math.round(centerY - (size / 2));
		var isIcon = display && display.type === 'icon';

		if (isIcon) {
			bmp.fillRect(left - 2, top - 2, size + 4, size + 4, blocked ? '#aa0000' : iconFrameColor);
			var iconBmp = ImageManager.loadPicture(display.value);
			if (iconBmp && iconBmp.width > 0) {
				bmp.blt(iconBmp, 0, 0, iconBmp.width, iconBmp.height, left, top, size, size);
			} else {
				bmp.fillRect(left, top, size, size, 'rgba(255,255,255,0.2)');
				bmp.drawText('...', left, top, size, size, 'center');
			}
		} else {
			bmp.fillRect(left, top, size, size, blocked ? 'rgba(255,0,0,0.35)' : baseColor);
			bmp.drawText(String(display.value || ''), left, top, size, size, 'center');
		}
	};

	TimedAttackSystem.prototype._jakeDrawMashIndicators = function() {
		var size = Math.max(24, this._height + 8);
		var gap = 6;
		var gaugeY = this._y + this.lineHeight() - 8 + Math.floor(this._height / 2);

		if (this._jakeMashIsRandomMode()) {
			var poolCount = (this._jMashMode === 'random mash') ? 1 : this._jMashPoolStates.length;
			for (var i = 0; i < poolCount; i++) {
				var state = this._jMashPoolStates[i];
				var cx = this._x - ((poolCount - i) * (size + gap));
				var blocked = this._jakeMashPoolBlocked(i);
				var display = this._jakeGetMashPoolDisplay(state);
				this._jakeDrawMashToken(cx, gaugeY, size, display, blocked, 'rgba(30,30,30,0.35)', '#222222');
			}
		}

		if (this._jMashStopKey !== null) {
			var stopDisplay = this._jakeMashStopDisplay();
			var stopX = this._x + this._width + size;
			this._jakeDrawMashToken(stopX, gaugeY, size, stopDisplay, false, 'rgba(0,120,255,0.35)', '#2255cc');
		}
	};

	TimedAttackSystem.prototype.playMashGame = function() {
		if (this._notPressed) {
			var f = this._frame;
			this._xPosition -= Number(eval(this._item.speed)) - this._tempSpeed;
			if (this._xPosition <= 0) {
				this._xPosition = 0;
				this._jakeUpdateMashPowerTracking();
				this._jakeFinishMash('drain');
			}
			if (this._xPosition >= this._maxPosition) {
				this._xPosition = this._maxPosition;
				this._jakeUpdateMashPowerTracking();
				if (!this._jMashUnending) {
					this._jakeFinishMash('fill');
				}
			}
		} else {
			this._flashTime++;
		}

		this._x = (Graphics.width / 2);
		this._y = (Graphics.height / 2);
		this._x += this._visualXOffset;
		this._y += this._visualYOffset;
		if (!isSideview) {
			this._x += globalNonSideXOffset + globalNonSideXOffsetMash;
			this._y += globalNonSideYOffset + globalNonSideYOffsetMash;
		}

		this._content.bitmap.clear();
		this.drawGaugeUpgrade(this._x, this._y, this._width, this._height, this._xPosition / this._maxPosition, this._color1, this._color2);

		if (this._jMashPowerValue === 'highest value') {
			var gaugeY = this._y + this.lineHeight() - 8;
			var highestX = this._x + Math.floor(this._width * this._jMashHighestRatio);
			this._content.bitmap.fillRect(highestX, gaugeY - 2, 2, this._height + 4, '#ff0000');
		}

		this._jakeDrawMashIndicators();

		var defaultText = null;
		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			defaultText = this._phrase.replace(/%1/g, this._seconds);
		}
		this._jakeApplyVisualTransform(this._x + (this._width / 2), this._y + (this._height / 2));
		this._jakeUpdateOverlayText(defaultText, this._x + (this._width / 2), this._y - this._height + (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(this._x + (this._width / 2), this._y + (this._height / 2));

		if (this._flashTime >= this._time && !this._notPressed) {
			this._content.bitmap.clear();
			BattleManager.endTASAttackThing();
			this.close();
		}

		if (this._notPressed) {
			if (this._jMashStopKey !== null && J.isKeyCodeTriggered(this._jMashStopKey)) {
				this._jakeUpdateMashPowerTracking();
				this._jakeFinishMash('stop');
			} else {
				if (this._jakeProcessMashInput()) {
					if (this._mode) {
						this._tempSpeed = eval(this._item.tap);
					} else {
						this._xPosition += eval(this._item.tap);
					}
				}

				if (!this._jMashTimeless && this._frame % 60 === 0) {
					this._seconds--;
					if (this._seconds <= 0) {
						this._seconds = 0;
						this._jakeUpdateMashPowerTracking();
						this._jakeFinishMash('timeout');
					}
				}
			}

			if (this._tempSpeed > 0) this._tempSpeed--;
			this._xPosition = J.clamp(this._xPosition, 0, this._maxPosition);
			this._jakeUpdateMashPowerTracking();
		}
	};

	J.arrowNameToIndex = {
		up: 0,
		right: 1,
		down: 2,
		left: 3
	};

	TimedAttackSystem.prototype._jakeSetupArrowsItem = function(item) {
		this._jArrowCommandTexts = J.splitCsv(item.jakeArrowCommandTexts);
		this._jArrowCommandIcons = J.splitCsv(item.jakeArrowCommandIcons);

		this._jArrowPools = [];
		for (var i = 0; i < 20; i++) {
			this._jArrowPools[i] = {
				keys: J.parseKeyCodeList(item.jakeArrowRandomKeys ? item.jakeArrowRandomKeys[i] : null, []),
				texts: J.splitCsv(item.jakeArrowRandomKeysTexts ? item.jakeArrowRandomKeysTexts[i] : ''),
				icons: J.splitCsv(item.jakeArrowRandomKeysIcons ? item.jakeArrowRandomKeysIcons[i] : '')
			};
		}
		if (!this._jArrowPools[0].keys.length) {
			this._jArrowPools[0].keys = [J.defaultOkKeyCode()];
		}

		this._commands = this._jakeBuildArrowCommands(item);
		if (!this._commands.length) {
			this._commands.push({kind:'arrow', arrowIndex:Math.randomInt(4)});
		}

		this._countDown = this._commands.length;
		this._maxCount = this._countDown;

		this._jArrowSlotSize = 40;
		this._width = Math.max(this.textWidth(this._phrase + '000'), this._commands.length * this._jArrowSlotSize);

		this._jArrowKeyCodes = [];
		for (var c = 0; c < this._commands.length; c++) {
			if (this._commands[c].kind === 'key') {
				if (this._jArrowKeyCodes.indexOf(this._commands[c].keyCode) < 0) {
					this._jArrowKeyCodes.push(this._commands[c].keyCode);
				}
			}
		}
	};

	TimedAttackSystem.prototype._jakeBuildArrowCommands = function(item) {
		var list = [];
		var randomSource = String(item.random || '').trim();
		var pureRandom = randomSource.toLowerCase() === 'true';
		if (pureRandom) {
			for (var i = 0; i < item.amount; i++) {
				list.push({kind:'arrow', arrowIndex:Math.randomInt(4)});
			}
			return list;
		}

		var tokens = J.splitCsv(item.random);
		if (!tokens.length) return list;

		for (var t = 0; t < item.amount; t++) {
			if (tokens[t] === undefined) break;
			var token = String(tokens[t]).trim();
			var lower = token.toLowerCase();
			if (J.arrowNameToIndex.hasOwnProperty(lower)) {
				list.push({kind:'arrow', arrowIndex:J.arrowNameToIndex[lower]});
				continue;
			}

			var poolMatch = lower.match(/^\[(\d+)\]$/);
			if (poolMatch) {
				var poolIndex = parseInt(poolMatch[1]) - 1;
				if (poolIndex < 0) poolIndex = 0;
				if (poolIndex > 19) poolIndex = 19;
				var pool = this._jArrowPools[poolIndex] || this._jArrowPools[0];
				if (!pool.keys.length) pool = this._jArrowPools[0];
				if (!pool.keys.length) continue;
				var pick = Math.randomInt(pool.keys.length);
				var keyCode = pool.keys[pick];
				var icon = pool.icons[pick] || this._jArrowCommandIcons[t] || '';
				var text = pool.texts[pick] || this._jArrowCommandTexts[t] || J.keyCodeToLabel(keyCode);
				list.push({
					kind:'key',
					keyCode:keyCode,
					iconName: icon,
					label: text
				});
				continue;
			}

			var keyCodeNum = parseInt(token);
			if (!isNaN(keyCodeNum)) {
				var iconName = this._jArrowCommandIcons[t] || '';
				var labelText = this._jArrowCommandTexts[t] || J.keyCodeToLabel(keyCodeNum);
				list.push({
					kind:'key',
					keyCode:keyCodeNum,
					iconName: iconName,
					label: labelText
				});
			}
		}

		return list;
	};

	TimedAttackSystem.prototype._jakeRefreshArrowSpriteBitmap = function(sprite, cmd) {
		sprite.bitmap.clear();
		var slot = this._jArrowSlotSize;
		if (cmd.kind === 'arrow') {
			var bit = SRD.TimedAttack.loadImage(this._image);
			var sw = bit.width / 4;
			var sh = bit.height;
			sprite.bitmap.blt(bit, cmd.arrowIndex * sw, 0, sw, sh, 0, 0, slot, slot);
			return;
		}

		sprite.bitmap.fillRect(0, 0, slot, slot, 'rgba(30,30,30,0.35)');
		if (cmd.iconName && cmd.iconName.length > 0) {
			var icon = ImageManager.loadPicture(cmd.iconName);
			if (icon && icon.width > 0) {
				sprite.bitmap.blt(icon, 0, 0, icon.width, icon.height, 0, 0, slot, slot);
				return;
			}
		}
		sprite.bitmap.drawText(String(cmd.label || ''), 0, 0, slot, slot, 'center');
	};

	TimedAttackSystem.prototype._jakeCreateArrowSprites = function() {
		this._jArrowSprites = [];
		for (var i = 0; i < this._commands.length; i++) {
			var sprite = new Sprite(new Bitmap(this._jArrowSlotSize, this._jArrowSlotSize));
			this._jakeRefreshArrowSpriteBitmap(sprite, this._commands[i]);
			sprite.opacity = 0;
			this._jArrowSprites.push(sprite);
			this.addChild(sprite);
		}
	};

	TimedAttackSystem.prototype._jakeArrowCommandTriggered = function(cmd) {
		if (!cmd) return false;
		if (cmd.kind === 'arrow') {
			return !!eval(this._evals[cmd.arrowIndex]);
		}
		return J.isKeyCodeTriggered(cmd.keyCode);
	};

	TimedAttackSystem.prototype._jakeArrowAnyInputTriggered = function() {
		if (eval(this._evals[0]) || eval(this._evals[1]) || eval(this._evals[2]) || eval(this._evals[3])) {
			return true;
		}
		for (var i = 0; i < this._jArrowKeyCodes.length; i++) {
			if (J.isKeyCodeTriggered(this._jArrowKeyCodes[i])) return true;
		}
		return false;
	};

	TimedAttackSystem.prototype.playArrowGame = function() {
		if (this._oneUpdate) {
			this._jakeCleanupArrowSprites();
			this._jakeCreateArrowSprites();
			this._jArrowCenter = (this._width / 2) - ((this._commands.length * this._jArrowSlotSize) / 2);
			this._oneUpdate = false;
		} else {
			var passed = this._maxCount - this._countDown;
			for (var i = 0; i < this._jArrowSprites.length; i++) {
				var s = this._jArrowSprites[i];
				if (passed > i) {
					if (s.opacity > 0) {
						s.opacity += this._ani[0];
						s.scale.x += this._ani[1];
						s.scale.y += this._ani[2];
						s.x += this._ani[3];
						s.y += this._ani[4];
					}
				} else {
					var relativeIndex = i - passed;
					s.x = this._x + (relativeIndex * this._jArrowSlotSize) + this._jArrowCenter;
					s.y = this._y + this.lineHeight();
					if (s.opacity === 0) s.opacity = 255;

					var hideSlot = false;
					if (this._jArrowUnshownKeys > 0) {
						hideSlot = relativeIndex < this._jArrowUnshownKeys;
					} else if (this._jArrowShownKeys === 0) {
						hideSlot = true;
					} else if (this._jArrowShownKeys > 0) {
						hideSlot = relativeIndex >= this._jArrowShownKeys;
					}

					var shouldRefreshSlot = (s._jMaskHidden !== hideSlot || s._jCmdRef !== this._commands[i]);
					if (!shouldRefreshSlot && hideSlot && this._jArrowUnshownRectImage && this._jArrowUnshownRectImage.length > 0) {
						shouldRefreshSlot = true;
					}
					if (shouldRefreshSlot) {
						if (hideSlot) this._jakeRefreshArrowHiddenBitmap(s);
						else this._jakeRefreshArrowSpriteBitmap(s, this._commands[i]);
						s._jMaskHidden = hideSlot;
						s._jCmdRef = this._commands[i];
					}
				}
			}
		}

		if (this._notPressed) {
			var f = this._frame;
		} else {
			this._flashTime++;
		}

		if (this._flashTime >= this._time && !this._notPressed) {
			this._content.bitmap.clear();
			this._jakeCleanupArrowSprites();
			BattleManager.endTASAttackThing();
			this.close();
		}

		this._x = (Graphics.width / 2);
		this._y = (Graphics.height / 2);
		this._x += this._visualXOffset;
		this._y += this._visualYOffset;
		if (!isSideview) {
			this._x += globalNonSideXOffset + globalNonSideXOffsetArrows;
			this._y += globalNonSideYOffset + globalNonSideYOffsetArrows;
		}

		this._content.bitmap.clear();
		this._jakeApplyVisualTransform(this._x + (this._width / 2), this._y + this.lineHeight());

		var text = null;
		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			text = this._phrase.replace(/%1/g, (this._milis).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping:false}));
		}
		this._jakeUpdateOverlayText(text, this._x + (this._width / 2), this._y + (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(this._x + (this._width / 2), this._y + this.lineHeight());

		if (this._notPressed) {
			var idx = this._maxCount - this._countDown;
			var current = this._commands[idx];
			if (this._jakeArrowCommandTriggered(current)) {
				this._countDown--;
				if (this._countDown === 0) {
					AudioManager.playSe({"name":this._item.vse,"pan":0,"pitch":100,"volume":100});
					this.setPower(eval(this._successPower));
					$gameTemp.tas_time_left = Math.max(this._milis, 0);
					this._notPressed = false;
				} else {
					AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
				}
			} else if (this._jakeArrowAnyInputTriggered()) {
				this._milis -= this._penatly;
				AudioManager.playSe({"name":this._item.fse,"pan":0,"pitch":100,"volume":100});
			}

			this._milis--;
			if (this._milis < 0) this._milis = 0;

			if (this._milis <= 0) {
				this._notPressed = false;
				AudioManager.playSe({"name":this._item.f2se,"pan":0,"pitch":100,"volume":100});
				this.setPower(eval(this._failPower));
				$gameTemp.tas_time_left = 0;
			}
		}
	};

	var _jOldPlayCircleGame = TimedAttackSystem.prototype.playCircleGame;
	TimedAttackSystem.prototype.playCircleGame = function() {
		_jOldPlayCircleGame.call(this);
		if (this._item && this._item.type === 'circle') {
			var cx = (this._x && this._x.length > 0) ? this._x[0] : (Graphics.width / 2);
			var cy = (this._y && this._y.length > 0) ? this._y[0] : (Graphics.height / 2);
			this._jakeApplyVisualTransform(cx, cy);
			this._jakeUpdateOverlayText(null, cx, cy - (this._radius || 0));
			this._jakeUpdateOverlayPicture(cx, cy);
		}
	};

	var _jOldPlayClockGame = TimedAttackSystem.prototype.playClockGame;
	TimedAttackSystem.prototype.playClockGame = function() {
		_jOldPlayClockGame.call(this);
		if (this._item && this._item.type === 'clock') {
			this._jakeApplyVisualTransform(this._x, this._y);
			this._jakeUpdateOverlayText(null, this._x, this._y - (this._length || 0) - (this.lineHeight() / 2));
			this._jakeUpdateOverlayPicture(this._x, this._y);
		}
	};

	var _jOldPlayWheelGame = TimedAttackSystem.prototype.playWheelGame;
	TimedAttackSystem.prototype.playWheelGame = function() {
		_jOldPlayWheelGame.call(this);
		if (this._item && this._item.type === 'wheel') {
			this._jakeApplyVisualTransform(this._x, this._y);
			this._jakeUpdateOverlayText(null, this._x, this._y - (this._radius || 0) - (this.lineHeight() / 2));
			this._jakeUpdateOverlayPicture(this._x, this._y);
		}
	};

	//-----------------------------------------------------------------------------
	// v2.1 Runtime Fixes and Expansions
	//-----------------------------------------------------------------------------

	J.deepClone = function(obj) {
		if (typeof JsonEx !== 'undefined' && JsonEx.makeDeepCopy) {
			return JsonEx.makeDeepCopy(obj);
		}
		return JSON.parse(JSON.stringify(obj));
	};

	J.transformPoint = function(px, py, cx, cy, angleRad, sx, sy) {
		var dx = px - cx;
		var dy = py - cy;
		var cos = Math.cos(angleRad);
		var sin = Math.sin(angleRad);
		return {
			x: cx + (dx * sx * cos) - (dy * sy * sin),
			y: cy + (dx * sx * sin) + (dy * sy * cos)
		};
	};

	J.normalizeDefaultMode = function(raw) {
		var s = String(raw || '').trim().toLowerCase();
		if (s === 'custom hitzones') return 'custom hitzones';
		return 'center hit';
	};

	J.normalizeDefaultPowerValue = function(raw) {
		var s = String(raw || '').trim().toLowerCase();
		if (s === 'multiple hits') return 'multiple hits';
		return 'multiple hitzones';
	};

	J.normalizeClockPowerValue = function(raw) {
		var s = String(raw || '').trim().toLowerCase();
		if (s === 'multiple targets') return 'multiple targets';
		if (s === 'multiple hits') return 'multiple hits';
		return 'one value';
	};

	J.defaultHitzones = function() {
		var list = [];
		for (var i = 0; i < 10; i++) {
			list.push({
				position: 0,
				hitArea: 0,
				closeArea: 0,
				hitColor: '#ffffff',
				closeColor: '#ffffff',
				initialized: false
			});
		}
		return list;
	};

	J.parseHitzone = function(raw) {
		var out = {
			position: 0,
			hitArea: 0,
			closeArea: 0,
			hitColor: '#ffffff',
			closeColor: '#ffffff',
			initialized: false
		};
		if (raw === undefined || raw === null || String(raw).trim() === '') {
			return out;
		}
		var parts = String(raw).split(/\s*,\s*/);
		out.initialized = true;
		if (parts.length > 0) out.position = J.clamp(J.toNumber(parts[0], 0), -1, 1);
		if (parts.length > 1) out.hitArea = Math.max(0, parseInt(parts[1]) || 0);
		if (parts.length > 2) out.closeArea = Math.max(0, parseInt(parts[2]) || 0);
		if (parts.length > 3 && parts[3] !== '') out.hitColor = String(parts[3]);
		if (parts.length > 4 && parts[4] !== '') out.closeColor = String(parts[4]);
		return out;
	};

	J._battleEndResetQueue = [];

	J.captureBaseSnapshot = function(o) {
		if (!o || o._jakeBaseSnapshot) return;
		var clone = J.deepClone(o);
		if (clone._jakeBaseSnapshot) delete clone._jakeBaseSnapshot;
		o._jakeBaseSnapshot = clone;
	};

	J.resetToBaseSnapshot = function(o) {
		if (!o || !o._jakeBaseSnapshot) return;
		var base = J.deepClone(o._jakeBaseSnapshot);
		for (var key in o) {
			if (!o.hasOwnProperty(key)) continue;
			if (key === '_jakeBaseSnapshot') continue;
			delete o[key];
		}
		for (var k in base) {
			if (!base.hasOwnProperty(k)) continue;
			o[k] = base[k];
		}
		o._jakeBaseSnapshot = J.deepClone(base);
	};

	J.queueResetOnBattleEnd = function(o) {
		if (!o) return;
		for (var i = 0; i < J._battleEndResetQueue.length; i++) {
			if (J._battleEndResetQueue[i] === o) return;
		}
		J._battleEndResetQueue.push(o);
	};

	J.applyBattleEndResets = function() {
		while (J._battleEndResetQueue.length > 0) {
			var o = J._battleEndResetQueue.shift();
			J.resetToBaseSnapshot(o);
		}
	};

	J.setTasTimeLeftFromFrames = function(frames) {
		var f = Math.max(0, Math.floor(Number(frames) || 0));
		if (!$gameTemp) return;
		$gameTemp.tas_frames_left = f;
		$gameTemp.tas_seconds_left = Math.floor(f / 60);
	};

	J.getActionKeyCodes = function(actionName) {
		var out = [];
		if (!Input || !Input.keyMapper) return out;
		for (var key in Input.keyMapper) {
			if (!Input.keyMapper.hasOwnProperty(key)) continue;
			if (String(Input.keyMapper[key] || '').toLowerCase() === String(actionName || '').toLowerCase()) {
				out.push(Number(key));
			}
		}
		return out;
	};

	J.consumeKeyCode = function(code) {
		if (!Input || !Input._jakeTAKeyQueue) return false;
		for (var i = 0; i < Input._jakeTAKeyQueue.length; i++) {
			if (Number(Input._jakeTAKeyQueue[i]) === Number(code)) {
				Input._jakeTAKeyQueue.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	J.consumeOneOf = function(codes) {
		for (var i = 0; i < codes.length; i++) {
			if (J.consumeKeyCode(Number(codes[i]))) return Number(codes[i]);
		}
		return null;
	};

	J.consumeHitKeys = function(codes) {
		var list = Array.isArray(codes) ? codes : [];
		var keyboard = [];
		var allowMouse = false;
		for (var i = 0; i < list.length; i++) {
			var code = Number(list[i]);
			if (isNaN(code)) continue;
			if (code === -1) allowMouse = true;
			else keyboard.push(code);
		}
		if (keyboard.length > 0 && J.consumeOneOf(keyboard) !== null) return true;
		if (allowMouse && typeof TouchInput !== 'undefined' && TouchInput && TouchInput.isTriggered && TouchInput.isTriggered()) return true;
		return false;
	};

	J.consumeAnyKey = function() {
		if (!Input || !Input._jakeTAKeyQueue || Input._jakeTAKeyQueue.length === 0) return null;
		return Number(Input._jakeTAKeyQueue.shift());
	};

	if (typeof Input !== 'undefined' && !Input._jakeTAKeyQueuePatched) {
		Input._jakeTAKeyQueuePatched = true;
		Input._jakeTAKeyQueue = [];
		Input._jakeTAPressedCodes = {};
		var _Input_onKeyDown_v21 = Input._onKeyDown;
		Input._onKeyDown = function(event) {
			_Input_onKeyDown_v21.call(this, event);
			if (!event || event.keyCode === undefined || event.keyCode === null) return;
			this._jakeTAPressedCodes[Number(event.keyCode)] = true;
			if (!event.repeat) {
				this._jakeTAKeyQueue.push(Number(event.keyCode));
			}
		};
		var _Input_onKeyUp_v21 = Input._onKeyUp;
		Input._onKeyUp = function(event) {
			if (_Input_onKeyUp_v21) _Input_onKeyUp_v21.call(this, event);
			if (!event || event.keyCode === undefined || event.keyCode === null) return;
			delete this._jakeTAPressedCodes[Number(event.keyCode)];
		};
		var _Input_clear_v21 = Input.clear;
		Input.clear = function() {
			_Input_clear_v21.call(this);
			this._jakeTAKeyQueue = [];
			this._jakeTAPressedCodes = {};
		};
	}

	J.isKeyCodeTriggered = function(code) {
		return J.consumeKeyCode(code);
	};

	J.getTriggeredFrom = function(codes) {
		return J.consumeOneOf(codes || []);
	};

	J.applyGeneralProps = function(o, source, semicolonMode) {
		var v;

		v = J.getValue(source, 'Visual[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.visualXOffset = J.toEvalNumber(v, 0);
		else if (o.visualXOffset === undefined) o.visualXOffset = 0;

		v = J.getValue(source, 'Visual[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.visualYOffset = J.toEvalNumber(v, 0);
		else if (o.visualYOffset === undefined) o.visualYOffset = 0;

		v = J.getValue(source, 'Angle[ ]?Offset', semicolonMode);
		if (v !== null) o.angleOffset = J.toEvalNumber(v, 0);
		else if (o.angleOffset === undefined) o.angleOffset = 0;

		var vOpacity = J.getFirstValue(source, ['Main[ ]?Opacity', 'Opacity'], semicolonMode);
		if (vOpacity !== null) {
			o.jakeVisualOpacity = J.toOpacity(vOpacity, 255);
			o.jakeMainOpacityExplicit = true;
		} else if (o.jakeMainOpacityExplicit === undefined) {
			o.jakeMainOpacityExplicit = false;
		}

		var vWindowOpacity = J.getValue(source, 'Window[ ]?Opacity', semicolonMode);
		if (vWindowOpacity !== null) {
			o.opacity = J.toOpacity(vWindowOpacity, J.toOpacity(o.opacity, 255));
		}

		v = J.getValue(source, 'Visual[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.visualScaleX = J.toEvalNumber(v, 1.0);
		else if (o.visualScaleX === undefined) o.visualScaleX = 1.0;

		v = J.getValue(source, 'Visual[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.visualScaleY = J.toEvalNumber(v, 1.0);
		else if (o.visualScaleY === undefined) o.visualScaleY = 1.0;

		v = J.getValue(source, 'Shown[ ]?Text', semicolonMode);
		if (v !== null) {
			o.shownText = String(v);
			o.jakeHasShownText = true;
		} else if (o.jakeHasShownText === undefined) {
			o.jakeHasShownText = false;
			o.shownText = '';
		}

		v = J.getValue(source, 'Shown[ ]?Picture', semicolonMode);
		if (v !== null) {
			o.shownPicture = String(v);
			o.jakeHasShownPicture = true;
			if (o.shownPicture && o.shownPicture.length > 0) {
				ImageManager.loadPicture(o.shownPicture);
			}
		} else if (o.jakeHasShownPicture === undefined) {
			o.jakeHasShownPicture = false;
			o.shownPicture = '';
		}

		v = J.getFirstValue(source, ['Text[ ]?X[ ]?Offset', 'Text[ ]?Visual[ ]?X[ ]?Offset'], semicolonMode);
		if (v !== null) o.textXOffset = J.toEvalNumber(v, 0);
		else if (o.textXOffset === undefined) o.textXOffset = 0;

		v = J.getFirstValue(source, ['Text[ ]?Y[ ]?Offset', 'Text[ ]?Visual[ ]?Y[ ]?Offset'], semicolonMode);
		if (v !== null) o.textYOffset = J.toEvalNumber(v, 0);
		else if (o.textYOffset === undefined) o.textYOffset = 0;

		v = J.getFirstValue(source, ['Text[ ]?Angle[ ]?Offset', 'Text[ ]?Angle'], semicolonMode);
		if (v !== null) o.textAngleOffset = J.toEvalNumber(v, 0);
		else if (o.textAngleOffset === undefined) o.textAngleOffset = 0;

		v = J.getFirstValue(source, ['Text[ ]?Scale[ ]?X', 'Text[ ]?Visual[ ]?Scale[ ]?X'], semicolonMode);
		if (v !== null) o.textScaleX = J.toEvalNumber(v, 1.0);
		else if (o.textScaleX === undefined) o.textScaleX = 1.0;

		v = J.getFirstValue(source, ['Text[ ]?Scale[ ]?Y', 'Text[ ]?Visual[ ]?Scale[ ]?Y'], semicolonMode);
		if (v !== null) o.textScaleY = J.toEvalNumber(v, 1.0);
		else if (o.textScaleY === undefined) o.textScaleY = 1.0;

		v = J.getFirstValue(source, ['Picture[ ]?X[ ]?Offset', 'Picture[ ]?Visual[ ]?X[ ]?Offset'], semicolonMode);
		if (v !== null) o.pictureXOffset = J.toEvalNumber(v, 0);
		else if (o.pictureXOffset === undefined) o.pictureXOffset = 0;

		v = J.getFirstValue(source, ['Picture[ ]?Y[ ]?Offset', 'Picture[ ]?Visual[ ]?Y[ ]?Offset'], semicolonMode);
		if (v !== null) o.pictureYOffset = J.toEvalNumber(v, 0);
		else if (o.pictureYOffset === undefined) o.pictureYOffset = 0;

		v = J.getFirstValue(source, ['Picture[ ]?Angle[ ]?Offset', 'Picture[ ]?Angle'], semicolonMode);
		if (v !== null) o.pictureAngleOffset = J.toEvalNumber(v, 0);
		else if (o.pictureAngleOffset === undefined) o.pictureAngleOffset = 0;

		v = J.getFirstValue(source, ['Picture[ ]?Scale[ ]?X', 'Picture[ ]?Visual[ ]?Scale[ ]?X'], semicolonMode);
		if (v !== null) o.pictureScaleX = J.toEvalNumber(v, 1.0);
		else if (o.pictureScaleX === undefined) o.pictureScaleX = 1.0;

		v = J.getFirstValue(source, ['Picture[ ]?Scale[ ]?Y', 'Picture[ ]?Visual[ ]?Scale[ ]?Y'], semicolonMode);
		if (v !== null) o.pictureScaleY = J.toEvalNumber(v, 1.0);
		else if (o.pictureScaleY === undefined) o.pictureScaleY = 1.0;

		v = J.getValue(source, 'Reset[ ]?on[ ]?Use', semicolonMode);
		if (v !== null) o.jakeResetOnUse = J.parseBool(v, false);
		else if (o.jakeResetOnUse === undefined) o.jakeResetOnUse = false;

		v = J.getValue(source, 'Reset[ ]?on[ ]?Battle[ ]?End', semicolonMode);
		if (v !== null) o.jakeResetOnBattleEnd = J.parseBool(v, false);
		else if (o.jakeResetOnBattleEnd === undefined) o.jakeResetOnBattleEnd = false;

		v = J.getValue(source, 'Independent[ ]?Text', semicolonMode);
		if (v !== null) o.jakeIndependentText = J.parseBool(v, false);
		else if (o.jakeIndependentText === undefined) o.jakeIndependentText = false;

		v = J.getValue(source, 'Independent[ ]?Picture', semicolonMode);
		if (v !== null) o.jakeIndependentPicture = J.parseBool(v, false);
		else if (o.jakeIndependentPicture === undefined) o.jakeIndependentPicture = false;

		v = J.getValue(source, 'Independent[ ]?Icons', semicolonMode);
		if (v !== null) o.jakeIndependentIcons = J.parseBool(v, false);
		else if (o.jakeIndependentIcons === undefined) o.jakeIndependentIcons = false;

		v = J.getValue(source, 'Keys[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeKeysXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeKeysXOffset === undefined) o.jakeKeysXOffset = 0;

		v = J.getValue(source, 'Keys[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeKeysYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeKeysYOffset === undefined) o.jakeKeysYOffset = 0;

		v = J.getFirstValue(source, ['Keys[ ]?Angle', 'Keys[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeKeysAngle = J.toEvalNumber(v, 0);
		else if (o.jakeKeysAngle === undefined) o.jakeKeysAngle = 0;

		v = J.getValue(source, 'Keys[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeKeysScaleX = J.toEvalNumber(v, 1.0);
		else if (o.jakeKeysScaleX === undefined) o.jakeKeysScaleX = 1.0;

		v = J.getValue(source, 'Keys[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeKeysScaleY = J.toEvalNumber(v, 1.0);
		else if (o.jakeKeysScaleY === undefined) o.jakeKeysScaleY = 1.0;

		J.applySubOpacityProps(o, source, semicolonMode);
		J.applyDefaultOpacityParams(o);
	};

	J.applyDefaultProps = function(o, source, semicolonMode) {
		if (!o || o.type !== SRD.TimedAttack.TAS_ID) return;

		var v = J.getValue(source, 'Mode', semicolonMode);
		if (v !== null) o.jakeDefaultMode = J.normalizeDefaultMode(v);
		else if (!o.jakeDefaultMode) o.jakeDefaultMode = 'center hit';

		v = J.getValue(source, 'Background[ ]?Color', semicolonMode);
		if (v !== null) o.jakeBarBackgroundColor = String(v);
		else if (!o.jakeBarBackgroundColor) o.jakeBarBackgroundColor = '#ffffff';

		v = J.getValue(source, 'Thickness', semicolonMode);
		if (v !== null) o.jakeBarThickness = Math.max(1, parseInt(v) || 16);
		else if (o.jakeBarThickness === undefined) o.jakeBarThickness = 16;

		v = J.getValue(source, 'Hit[ ]?Markers', semicolonMode);
		if (v !== null) o.jakeBarHitMarkers = J.parseBool(v, true);
		else if (o.jakeBarHitMarkers === undefined) o.jakeBarHitMarkers = true;

		v = J.getFirstValue(source, ['Markers?[ ]?Opacity', 'Hit[ ]?Marker[s]?[ ]?Opacity'], semicolonMode);
		if (v !== null) o.jakeBarHitMarkerOpacity = J.toOpacity(v, 127);
		else if (o.jakeBarHitMarkerOpacity === undefined) o.jakeBarHitMarkerOpacity = J.getParamOpacityAny(params, ['Default (Bar) Markers Opacity', 'Default Markers Opacity'], 127);

		v = J.getValue(source, 'Power[ ]?Value', semicolonMode);
		if (v !== null) o.jakeBarPowerValue = J.normalizeDefaultPowerValue(v);
		else if (!o.jakeBarPowerValue) o.jakeBarPowerValue = 'multiple hitzones';

		v = J.getValue(source, 'Repeat(?![ ]?Type)(?![ ]?Bounce)(?![ ]?amount)', semicolonMode);
		if (v !== null) o.jakeBarRepeat = J.parseBool(v, false);
		else if (o.jakeBarRepeat === undefined) o.jakeBarRepeat = false;

		v = J.getValue(source, 'Repeat[ ]?Bounce', semicolonMode);
		if (v !== null) o.jakeBarRepeatBounce = J.parseBool(v, true);
		else if (o.jakeBarRepeatBounce === undefined) o.jakeBarRepeatBounce = true;

		v = J.getValue(source, 'Repeat[ ]?amount', semicolonMode);
		if (v !== null) o.jakeBarRepeatAmount = Math.max(0, parseInt(v) || 0);
		else if (o.jakeBarRepeatAmount === undefined) o.jakeBarRepeatAmount = 0;

		if (!o.jakeHitzones) o.jakeHitzones = J.defaultHitzones();
		for (var i = 1; i <= 10; i++) {
			v = J.getValue(source, 'Hitzone[ ]?' + i, semicolonMode);
			if (v !== null) o.jakeHitzones[i - 1] = J.parseHitzone(v);
		}
	};

	J.applyMashProps = function(o, source, semicolonMode) {
		if (!o || o.type !== 'mash') return;

		var v = J.getValue(source, 'Mode', semicolonMode);
		if (v !== null) o.jakeMashMode = J.normalizeMashMode(v);
		else if (!o.jakeMashMode) o.jakeMashMode = 'default mash';

		v = J.getValue(source, 'Mash[ ]?Keys', semicolonMode);
		if (v !== null) o.jakeMashKeys = String(v);

		v = J.getValue(source, 'Frames', semicolonMode);
		if (v !== null) o.jakeMashFrames = Math.max(0, parseInt(v) || 0);
		else if (o.jakeMashFrames === undefined) o.jakeMashFrames = 0;

		v = J.getValue(source, 'Seconds', semicolonMode);
		if (v !== null) o.jakeMashSeconds = Math.max(0, parseInt(v) || 0);
		else if (o.jakeMashSeconds === undefined) o.jakeMashSeconds = 0;

		if (!o.jakeMashRandomKeys) o.jakeMashRandomKeys = [];
		if (!o.jakeMashRandomKeysTexts) o.jakeMashRandomKeysTexts = [];
		if (!o.jakeMashRandomKeysIcons) o.jakeMashRandomKeysIcons = [];
		for (var i = 1; i <= 20; i++) {
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i, semicolonMode);
			if (v !== null) o.jakeMashRandomKeys[i - 1] = String(v);
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i + '[ ]?Texts', semicolonMode);
			if (v !== null) o.jakeMashRandomKeysTexts[i - 1] = String(v);
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i + '[ ]?Icons', semicolonMode);
			if (v !== null) o.jakeMashRandomKeysIcons[i - 1] = String(v);
		}

		v = J.getValue(source, 'Random[ ]?Once', semicolonMode);
		if (v !== null) o.jakeMashRandomOnce = J.parseBool(v, false);
		else if (o.jakeMashRandomOnce === undefined) o.jakeMashRandomOnce = false;

		v = J.getValue(source, 'Random[ ]?Specified[ ]?Once', semicolonMode);
		if (v !== null) o.jakeMashRandomSpecifiedOnce = String(v);
		else if (o.jakeMashRandomSpecifiedOnce === undefined) o.jakeMashRandomSpecifiedOnce = '';

		v = J.getValue(source, 'Random[ ]?No[ ]?Repeat', semicolonMode);
		if (v !== null) o.jakeMashRandomNoRepeat = J.parseBool(v, true);
		else if (o.jakeMashRandomNoRepeat === undefined) o.jakeMashRandomNoRepeat = true;

		v = J.getValue(source, 'Unending', semicolonMode);
		if (v !== null) o.jakeMashUnending = J.parseBool(v, false);
		else if (o.jakeMashUnending === undefined) o.jakeMashUnending = false;

		v = J.getValue(source, 'Unstarting', semicolonMode);
		if (v !== null) o.jakeMashUnstarting = J.parseBool(v, false);
		else if (o.jakeMashUnstarting === undefined) o.jakeMashUnstarting = false;

		v = J.getValue(source, 'Timeless', semicolonMode);
		if (v !== null) o.jakeMashTimeless = J.parseBool(v, false);
		else if (o.jakeMashTimeless === undefined) o.jakeMashTimeless = false;

		v = J.getValue(source, 'Power[ ]?Value', semicolonMode);
		if (v !== null) o.jakeMashPowerValue = J.normalizePowerValue(v);
		else if (!o.jakeMashPowerValue) o.jakeMashPowerValue = 'last value';

		v = J.getValue(source, 'Tap[ ]?Gain[ ]?Fade', semicolonMode);
		if (v !== null) o.jakeMashTapGainFade = Math.max(0, J.toEvalNumber(v, 1));
		else if (o.jakeMashTapGainFade === undefined) o.jakeMashTapGainFade = 1;

		v = J.getValue(source, 'Mash[ ]?SE', semicolonMode);
		if (v !== null) o.jakeMashSE = String(v);
		else if (o.jakeMashSE === undefined) o.jakeMashSE = '';

		v = J.getValue(source, 'Invalid[ ]?Mash[ ]?SE', semicolonMode);
		if (v !== null) o.jakeMashInvalidSE = String(v);
		else if (o.jakeMashInvalidSE === undefined) o.jakeMashInvalidSE = '';

		v = J.getValue(source, 'HighLow[ ]?Marker[ ]?Color', semicolonMode);
		if (v !== null) o.jakeMashHighLowMarkerColor = String(v);
		else if (!o.jakeMashHighLowMarkerColor) o.jakeMashHighLowMarkerColor = '#ff0000';

		v = J.getValue(source, 'Invalid[ ]?Key[ ]?Color', semicolonMode);
		if (v !== null) o.jakeMashInvalidKeyColor = String(v);
		else if (!o.jakeMashInvalidKeyColor) o.jakeMashInvalidKeyColor = '#ff0000';

		v = J.getValue(source, 'Stop[ ]?Key[ ]?Color', semicolonMode);
		if (v !== null) o.jakeMashStopKeyColor = String(v);
		else if (!o.jakeMashStopKeyColor) o.jakeMashStopKeyColor = '#0000ff';

		v = J.getValue(source, 'Stop[ ]?key', semicolonMode);
		if (v !== null) {
			var keyCode = parseInt(v);
			o.jakeMashStopKey = isNaN(keyCode) ? null : keyCode;
		} else if (o.jakeMashStopKey === undefined) {
			o.jakeMashStopKey = null;
		}

		v = J.getValue(source, 'Stop[ ]?key[ ]?Text', semicolonMode);
		if (v !== null) o.jakeMashStopText = String(v);
		else if (o.jakeMashStopText === undefined) o.jakeMashStopText = '';

		v = J.getValue(source, 'Stop[ ]?key[ ]?Icon', semicolonMode);
		if (v !== null) o.jakeMashStopIcon = String(v);
		else if (o.jakeMashStopIcon === undefined) o.jakeMashStopIcon = '';
	};

	J.applyArrowsProps = function(o, source, semicolonMode) {
		if (!o || o.type !== 'arrows') return;

		var v = J.getValue(source, 'Seconds', semicolonMode);
		if (v !== null) o.jakeArrowSeconds = Math.max(0, parseInt(v) || 0);
		else if (o.jakeArrowSeconds === undefined) o.jakeArrowSeconds = 0;

		v = J.getValue(source, 'Frames', semicolonMode);
		if (v !== null) o.jakeArrowFrames = Math.max(0, parseInt(v) || 0);
		else if (o.jakeArrowFrames === undefined) o.jakeArrowFrames = 0;

		v = J.getValue(source, 'Randomize[ ]?Commands[ ]?Texts', semicolonMode);
		if (v !== null) o.jakeArrowCommandTexts = String(v);
		else if (o.jakeArrowCommandTexts === undefined) o.jakeArrowCommandTexts = '';

		v = J.getValue(source, 'Randomize[ ]?Commands[ ]?Icons', semicolonMode);
		if (v !== null) o.jakeArrowCommandIcons = String(v);
		else if (o.jakeArrowCommandIcons === undefined) o.jakeArrowCommandIcons = '';

		if (!o.jakeArrowRandomKeys) o.jakeArrowRandomKeys = [];
		if (!o.jakeArrowRandomKeysTexts) o.jakeArrowRandomKeysTexts = [];
		if (!o.jakeArrowRandomKeysIcons) o.jakeArrowRandomKeysIcons = [];
		for (var i = 1; i <= 20; i++) {
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i, semicolonMode);
			if (v !== null) o.jakeArrowRandomKeys[i - 1] = String(v);
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i + '[ ]?Texts', semicolonMode);
			if (v !== null) o.jakeArrowRandomKeysTexts[i - 1] = String(v);
			v = J.getValue(source, 'Random[ ]?Keys[ ]?' + i + '[ ]?Icons', semicolonMode);
			if (v !== null) o.jakeArrowRandomKeysIcons[i - 1] = String(v);
		}
	};

	J.applyClockTargets = function(o, source, semicolonMode) {
		if (!o || o.type !== 'clock') return;

		if (!o.targets) o.targets = [];
		for (var i = 0; i < 20; i++) {
			if (o.targets[i] === undefined || o.targets[i] === null) o.targets[i] = '';
		}

		for (var t = 1; t <= 20; t++) {
			var v = J.getValue(source, 'Target[ ]?' + t, semicolonMode);
			if (v !== null) o.targets[t - 1] = String(v);
		}

		var pv = J.getValue(source, 'Power[ ]?Value', semicolonMode);
		if (pv !== null) o.jakeClockPowerValue = J.normalizeClockPowerValue(pv);
		else if (!o.jakeClockPowerValue) o.jakeClockPowerValue = 'one value';

		var hm = J.getValue(source, 'Hit[ ]?Markers', semicolonMode);
		if (hm !== null) o.jakeClockHitMarkers = J.parseBool(hm, true);
		else if (o.jakeClockHitMarkers === undefined) o.jakeClockHitMarkers = true;
	};

	J.applyExtendedProps = function(o, source, semicolonMode) {
		J.applyGeneralProps(o, source, semicolonMode);
		J.applyDefaultProps(o, source, semicolonMode);
		J.applyMashProps(o, source, semicolonMode);
		J.applyArrowsProps(o, source, semicolonMode);
		J.applyClockTargets(o, source, semicolonMode);
	};

	if (typeof Game_Temp !== 'undefined') {
		if (Game_Temp.prototype.hasOwnProperty('tas_time_left')) {
			delete Game_Temp.prototype.tas_time_left;
		}
		var _Game_Temp_initialize_v21 = Game_Temp.prototype.initialize;
		Game_Temp.prototype.initialize = function() {
			_Game_Temp_initialize_v21.call(this);
			if (this._tasFramesLeft === undefined) this._tasFramesLeft = 0;
			if (this._tasSecondsLeft === undefined) this._tasSecondsLeft = 0;
		};
		Object.defineProperty(Game_Temp.prototype, 'tas_frames_left', {
			get: function() {
				return this._tasFramesLeft || 0;
			},
			set: function(value) {
				this._tasFramesLeft = Math.max(0, Math.floor(Number(value) || 0));
			},
			configurable: true
		});
		Object.defineProperty(Game_Temp.prototype, 'tas_seconds_left', {
			get: function() {
				return this._tasSecondsLeft || 0;
			},
			set: function(value) {
				this._tasSecondsLeft = Math.max(0, Math.floor(Number(value) || 0));
			},
			configurable: true
		});
	}

	if (typeof $gameTemp !== 'undefined' && $gameTemp) {
		if ($gameTemp._tasFramesLeft === undefined) $gameTemp._tasFramesLeft = 0;
		if ($gameTemp._tasSecondsLeft === undefined) $gameTemp._tasSecondsLeft = 0;
	}

	var _jOrganizeInfo_v21 = SRD.TimedAttack.organizeInfo;
	SRD.TimedAttack.organizeInfo = function(o) {
		_jOrganizeInfo_v21.call(this, o);
		if (!o) return;
		J.captureBaseSnapshot(o);
	};

	var _jNotesProcChangeTA_v21 = Game_Map.prototype.NotesProcChangeTA;
	Game_Map.prototype.NotesProcChangeTA = function(o, notesTA) {
		if (!o) return;
		J.captureBaseSnapshot(o);
		_jNotesProcChangeTA_v21.call(this, o, notesTA);
	};

	if (typeof BattleManager !== 'undefined' && BattleManager.endBattle) {
		var _BattleManager_endBattle_v21 = BattleManager.endBattle;
		BattleManager.endBattle = function(result) {
			_BattleManager_endBattle_v21.call(this, result);
			J.applyBattleEndResets();
		};
	}

	//-----------------------------------------------------------------------------
	// v2.1 Gameplay Overrides
	//-----------------------------------------------------------------------------

	TimedAttackSystem.prototype._jakeCurrentFramesLeft = function() {
		if (!this._item) return 0;
		if (this._item.type === 'arrows') return Math.max(0, Math.floor(this._milis || 0));
		if (this._item.type === 'mash') {
			if (this._jMashTimeless) return 0;
			if (this._jMashUseFrames) return Math.max(0, Math.floor(this._jMashFramesLeft || 0));
			return Math.max(0, Math.floor(this._seconds || 0) * 60);
		}
		return 0;
	};

	TimedAttackSystem.prototype._jakeCurrentSecondsLeft = function() {
		return Math.floor(this._jakeCurrentFramesLeft() / 60);
	};

	TimedAttackSystem.prototype._jakeExpandShownTextHelpers = function(text) {
		var t = String(text || '');
		t = t.replace(/\$t_f/gi, String(this._jakeCurrentFramesLeft()));
		t = t.replace(/\$t_s/gi, String(this._jakeCurrentSecondsLeft()));
		return t;
	};

	TimedAttackSystem.prototype._jakeResolveShownText = function(defaultText) {
		if (!this._item) return null;
		var text = this._item.jakeHasShownText ? String(this._item.shownText || '') : defaultText;
		if (text === null || text === undefined) return text;
		return this._jakeExpandShownTextHelpers(text);
	};

	TimedAttackSystem.prototype._jakeOverlayRoot = function() {
		return this.parent || this;
	};

	TimedAttackSystem.prototype._jakeEnsureOverlaySprites = function() {
		var root = this._jakeOverlayRoot();
		if (!this._jakeTextSprite) {
			this._jakeTextSprite = new Sprite(new Bitmap(1, 1));
			this._jakeTextSprite.anchor.x = 0.5;
			this._jakeTextSprite.anchor.y = 0.5;
		}
		if (!this._jakePictureSprite) {
			this._jakePictureSprite = new Sprite();
			this._jakePictureSprite.anchor.x = 0.5;
			this._jakePictureSprite.anchor.y = 0.5;
		}
		if (this._jakeTextSprite.parent !== root) root.addChild(this._jakeTextSprite);
		if (this._jakePictureSprite.parent !== root) root.addChild(this._jakePictureSprite);
		root.setChildIndex(this._jakeTextSprite, root.children.length - 1);
		root.setChildIndex(this._jakePictureSprite, root.children.length - 1);
	};

	TimedAttackSystem.prototype._jakeEnsureKeysLayer = function() {
		var root = this._jakeOverlayRoot();
		if (!this._jakeKeysLayer) {
			this._jakeKeysLayer = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		}
		if (!this._jakeArrowContainer) {
			this._jakeArrowContainer = new Sprite();
			this._jakeKeysLayer.addChild(this._jakeArrowContainer);
		}
		if (this._jakeKeysLayer.parent !== root) root.addChild(this._jakeKeysLayer);
		root.setChildIndex(this._jakeKeysLayer, root.children.length - 1);
	};

	TimedAttackSystem.prototype._jakeHideOverlaySprites = function() {
		if (this._jakeTextSprite) this._jakeTextSprite.visible = false;
		if (this._jakePictureSprite) this._jakePictureSprite.visible = false;
		if (this._jakeKeysLayer) {
			this._jakeKeysLayer.visible = false;
			if (this._jakeKeysLayer.bitmap) this._jakeKeysLayer.bitmap.clear();
		}
	};

	TimedAttackSystem.prototype._jakeResetVisualTransform = function() {
		this.pivot.x = 0;
		this.pivot.y = 0;
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.scale.x = 1;
		this.scale.y = 1;
		this._jVisualCenterX = 0;
		this._jVisualCenterY = 0;
	};

	TimedAttackSystem.prototype._jakeApplyVisualTransform = function(centerX, centerY) {
		this._jVisualCenterX = centerX;
		this._jVisualCenterY = centerY;
		var angle = this._angleOffset || 0;
		var sx = (this._visualScaleX !== undefined) ? this._visualScaleX : 1;
		var sy = (this._visualScaleY !== undefined) ? this._visualScaleY : 1;
		if (angle || sx !== 1 || sy !== 1) {
			this.pivot.x = centerX;
			this.pivot.y = centerY;
			this.x = centerX;
			this.y = centerY;
			this.rotation = angle * Math.PI / 180;
			this.scale.x = sx;
			this.scale.y = sy;
		} else {
			this._jakeResetVisualTransform();
		}
	};

	TimedAttackSystem.prototype._jakeApplyOverlayTransform = function(sprite, baseX, baseY, offsetX, offsetY, extraAngle, extraScaleX, extraScaleY, independent) {
		var includeMain = !independent;
		var mainAngle = includeMain ? ((this._angleOffset || 0) * Math.PI / 180) : 0;
		var mainScaleX = includeMain ? ((this._visualScaleX !== undefined) ? this._visualScaleX : 1) : 1;
		var mainScaleY = includeMain ? ((this._visualScaleY !== undefined) ? this._visualScaleY : 1) : 1;
		var cx = this._jVisualCenterX || baseX;
		var cy = this._jVisualCenterY || baseY;

		var p = {x: baseX, y: baseY};
		if (includeMain) {
			p = J.transformPoint(baseX, baseY, cx, cy, mainAngle, mainScaleX, mainScaleY);
		}

		sprite.x = p.x + (offsetX || 0);
		sprite.y = p.y + (offsetY || 0);
		sprite.rotation = mainAngle + ((extraAngle || 0) * Math.PI / 180);
		sprite.scale.x = mainScaleX * ((extraScaleX !== undefined) ? extraScaleX : 1);
		sprite.scale.y = mainScaleY * ((extraScaleY !== undefined) ? extraScaleY : 1);
		sprite.visible = true;
	};

	TimedAttackSystem.prototype._jakeUpdateOverlayText = function(defaultText, baseX, baseY) {
		this._jakeEnsureOverlaySprites();
		var text = this._jakeResolveShownText(defaultText);
		if (text === null || text === undefined || text === '') {
			this._jakeTextSprite.visible = false;
			return;
		}

		var width = Math.max(24, this.textWidth(text) + 12);
		var height = this.lineHeight() + 8;
		if (!this._jakeTextSprite.bitmap || this._jakeTextSprite.bitmap.width !== width || this._jakeTextSprite.bitmap.height !== height) {
			this._jakeTextSprite.bitmap = new Bitmap(width, height);
		}

		this._jakeTextSprite.bitmap.clear();
		this._jakeTextSprite.bitmap.drawText(text, 0, 0, width, height, 'center');
		this._jakeApplyOverlayTransform(
			this._jakeTextSprite,
			baseX,
			baseY,
			this._textXOffset || 0,
			this._textYOffset || 0,
			this._textAngleOffset || 0,
			(this._textScaleX !== undefined) ? this._textScaleX : 1,
			(this._textScaleY !== undefined) ? this._textScaleY : 1,
			!!this._jIndependentText
		);
	};

	TimedAttackSystem.prototype._jakeUpdateOverlayPicture = function(baseX, baseY) {
		this._jakeEnsureOverlaySprites();
		if (!this._item || !this._item.jakeHasShownPicture || !this._item.shownPicture || this._item.shownPicture.length === 0) {
			this._jakePictureSprite.visible = false;
			return;
		}

		this._jakePictureSprite.bitmap = ImageManager.loadPicture(this._item.shownPicture);
		this._jakeApplyOverlayTransform(
			this._jakePictureSprite,
			baseX,
			baseY,
			this._pictureXOffset || 0,
			this._pictureYOffset || 0,
			this._pictureAngleOffset || 0,
			(this._pictureScaleX !== undefined) ? this._pictureScaleX : 1,
			(this._pictureScaleY !== undefined) ? this._pictureScaleY : 1,
			!!this._jIndependentPicture
		);
	};

	TimedAttackSystem.prototype._jakeApplyKeysLayerTransform = function(centerX, centerY) {
		this._jakeEnsureKeysLayer();
		var includeMain = !this._jIndependentIcons;
		var mainAngle = includeMain ? ((this._angleOffset || 0) * Math.PI / 180) : 0;
		var mainScaleX = includeMain ? ((this._visualScaleX !== undefined) ? this._visualScaleX : 1) : 1;
		var mainScaleY = includeMain ? ((this._visualScaleY !== undefined) ? this._visualScaleY : 1) : 1;

		this._jakeKeysLayer.visible = true;
		this._jakeKeysLayer.pivot.x = centerX;
		this._jakeKeysLayer.pivot.y = centerY;
		this._jakeKeysLayer.x = centerX + (this._keysXOffset || 0);
		this._jakeKeysLayer.y = centerY + (this._keysYOffset || 0);
		this._jakeKeysLayer.rotation = mainAngle + ((this._keysAngle || 0) * Math.PI / 180);
		this._jakeKeysLayer.scale.x = mainScaleX * ((this._keysScaleX !== undefined) ? this._keysScaleX : 1);
		this._jakeKeysLayer.scale.y = mainScaleY * ((this._keysScaleY !== undefined) ? this._keysScaleY : 1);
	};

	TimedAttackSystem.prototype._jakeCleanupArrowSprites = function() {
		if (this._jArrowSprites) {
			for (var i = 0; i < this._jArrowSprites.length; i++) {
				if (this._jArrowSprites[i] && this._jArrowSprites[i].parent) {
					this._jArrowSprites[i].parent.removeChild(this._jArrowSprites[i]);
				}
			}
		}
		this._jArrowSprites = [];
	};

	var _jLoadItem_v21 = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		_jLoadItem_v21.call(this, item);

		J.captureBaseSnapshot(item);
		this._jTADataRef = item;
		this._jResetOnUse = !!item.jakeResetOnUse;
		this._jResetOnBattleEnd = !!item.jakeResetOnBattleEnd;

		this._jIndependentText = !!item.jakeIndependentText;
		this._jIndependentPicture = !!item.jakeIndependentPicture;
		this._jIndependentIcons = !!item.jakeIndependentIcons;
		this._keysXOffset = J.toNumber(item.jakeKeysXOffset, 0);
		this._keysYOffset = J.toNumber(item.jakeKeysYOffset, 0);
		this._keysAngle = J.toNumber(item.jakeKeysAngle, 0);
		this._keysScaleX = J.toNumber(item.jakeKeysScaleX, 1);
		this._keysScaleY = J.toNumber(item.jakeKeysScaleY, 1);

		if (item.type === SRD.TimedAttack.TAS_ID) {
			this._jDefaultMode = item.jakeDefaultMode || 'center hit';
			this._jBarBackgroundColor = item.jakeBarBackgroundColor || '#ffffff';
			this._jBarThickness = J.toNumber(item.jakeBarThickness, 16);
			this._jBarHitMarkersEnabled = (item.jakeBarHitMarkers !== false);
			var markerOpacityRaw = (item.jakeBarHitMarkerOpacity !== undefined && item.jakeBarHitMarkerOpacity !== null)
				? item.jakeBarHitMarkerOpacity
				: J.getParamOpacityAny(params, ['Default (Bar) Markers Opacity', 'Default Markers Opacity'], 127);
			this._jBarHitMarkerOpacity = J.toOpacity(markerOpacityRaw, 127);
			this._jBarPowerValue = item.jakeBarPowerValue || 'multiple hitzones';
			this._jBarRepeat = !!item.jakeBarRepeat;
			this._jBarRepeatBounce = (item.jakeBarRepeatBounce !== false);
			this._jBarRepeatAmount = Math.max(0, parseInt(item.jakeBarRepeatAmount || 0));
			this._jHitzones = item.jakeHitzones || J.defaultHitzones();
		}

		if (item.type === 'clock') {
			this._jClockPowerValue = item.jakeClockPowerValue || 'one value';
			this._jClockHitMarkers = (item.jakeClockHitMarkers !== false);
		}
	};

	var _jLoadStart_v21 = TimedAttackSystem.prototype.loadStart;
	TimedAttackSystem.prototype.loadStart = function() {
		_jLoadStart_v21.call(this);
		this._jakeHideOverlaySprites();
		J.setTasTimeLeftFromFrames(0);
		if (Input && Input._jakeTAKeyQueue) Input._jakeTAKeyQueue = [];

		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID && this._jDefaultMode === 'custom hitzones') {
			this._jBarZonePowers = this._jakeBuildZeroHitzoneArray();
			this._jBarHitPowers = [0];
			this._jBarMarkers = [];
			this._jBarHitsDone = 0;
			this._jBarRepeatCount = 0;
			this._jBarStartSpeed = this._xSpeed;
			this._jBarRequiredHits = 0;
			for (var z = 0; z < this._jHitzones.length; z++) {
				if (this._jHitzones[z] && this._jHitzones[z].initialized) this._jBarRequiredHits++;
			}
			if (this._jBarRequiredHits <= 0) this._jBarRequiredHits = 1;
		}
	};

	var _jClose_v21 = TimedAttackSystem.prototype.close;
	TimedAttackSystem.prototype.close = function() {
		var ref = this._jTADataRef;
		if (ref) {
			if (this._jResetOnUse) J.resetToBaseSnapshot(ref);
			else if (this._jResetOnBattleEnd) J.queueResetOnBattleEnd(ref);
		}
		_jClose_v21.call(this);
		this._jTADataRef = null;
	};

	TimedAttackSystem.prototype._jakeDrawCapsule = function(bitmap, x, y, width, height, color) {
		var h = Math.max(2, Math.floor(height));
		var w = Math.max(2, Math.floor(width));
		var r = Math.floor(h / 2);
		if (w <= h) {
			bitmap.drawCircle(x + Math.floor(w / 2), y + r, r, color);
			return;
		}
		bitmap.fillRect(x + r, y, w - (r * 2), h, color);
		bitmap.drawCircle(x + r, y + r, r, color);
		bitmap.drawCircle(x + w - r, y + r, r, color);
	};

	TimedAttackSystem.prototype._jakeDrawDefaultCustomCursor = function(drawX, barY, barH, scaleFactor, targetOverride, opacityOverride, orientationOverrideDeg, shapeOverride, disableImage) {
		var isBarType = !!(this._item && this._item.type === SRD.TimedAttack.TAS_ID);
		var target = targetOverride || null;
		if (!target) {
			if (isBarType && this._window && this._window.contents) target = this._window.contents;
			else if (this._content && this._content.bitmap) target = this._content.bitmap;
			else if (this._window && this._window.contents) target = this._window.contents;
			else if (this.contents) target = this.contents;
		}
		if (!target) return;

		var mainOpacity = this._jakeResolveElementOpacity ? this._jakeResolveElementOpacity(null) : 255;
		var cursorOpacity = this._jakeResolveElementOpacity ? this._jakeResolveElementOpacity('Cursor', mainOpacity) : mainOpacity;
		if (opacityOverride !== undefined && opacityOverride !== null) {
			cursorOpacity = J.toOpacity(opacityOverride, cursorOpacity);
		}
		var oldTargetPaintOpacity = target.paintOpacity;
		if (oldTargetPaintOpacity !== undefined) {
			var cappedTargetOpacity = J.toOpacity(oldTargetPaintOpacity, 255);
			target.paintOpacity = Math.min(cappedTargetOpacity, J.toOpacity(cursorOpacity, cappedTargetOpacity));
		}

		var sf = J.toNumber(scaleFactor, 1);
		if (!isFinite(sf) || sf <= 0) sf = 1;

		var visualX = J.toNumber(this._cursorVisualXOffset, 0);
		var visualY = J.toNumber(this._cursorVisualYOffset, 0);
		var angleDeg = J.toNumber(this._cursorAngleOffset, 0);
		if (orientationOverrideDeg !== undefined && orientationOverrideDeg !== null) angleDeg += J.toNumber(orientationOverrideDeg, 0);
		var angle = angleDeg * (Math.PI / 180);
		var scaleX = J.toNumber(this._cursorScaleX, 1);
		var scaleY = J.toNumber(this._cursorScaleY, 1);
		if (!isFinite(scaleX) || scaleX === 0) scaleX = 1;
		if (!isFinite(scaleY) || scaleY === 0) scaleY = 1;
		var localShape = String((shapeOverride !== undefined && shapeOverride !== null) ? shapeOverride : this._shape || '').trim().toLowerCase();
		var barShapeMode = (isBarType && this._jakeBarGetShapeMode) ? this._jakeBarGetShapeMode() : 'bar';
		var forceCircleMode = isBarType && barShapeMode === 'circle';
		var forceRoundCircle = forceCircleMode && localShape === 'oval';

		var centerX = drawX + visualX;
		var centerY = barY + Math.floor(barH / 2) + visualY;

		var useBarOverlay = !!(isBarType && targetOverride && this._jakeCursorLayer && this._jakeCursorLayer.bitmap && target === this._jakeCursorLayer.bitmap);
		if (useBarOverlay && !this._jIndependentCursor) {
			var mainAngleDeg = J.toNumber(this._angleOffset, 0);
			var mainAngle = mainAngleDeg * (Math.PI / 180);
			var mainScaleX = J.toNumber((this._visualScaleX !== undefined) ? this._visualScaleX : 1, 1);
			var mainScaleY = J.toNumber((this._visualScaleY !== undefined) ? this._visualScaleY : 1, 1);
			if (!isFinite(mainScaleX) || mainScaleX === 0) mainScaleX = 1;
			if (!isFinite(mainScaleY) || mainScaleY === 0) mainScaleY = 1;
			var mainCx = this._window ? (this._window.x + (this._window.width / 2)) : centerX;
			var mainCy = this._window ? (this._window.y + (this._window.height / 2)) : centerY;
			var transformedCenter = J.transformPoint(centerX, centerY, mainCx, mainCy, mainAngle, mainScaleX, mainScaleY);
			centerX = transformedCenter.x;
			centerY = transformedCenter.y;
			if (!forceRoundCircle) {
				angleDeg += mainAngleDeg;
				angle = angleDeg * (Math.PI / 180);
				scaleX *= mainScaleX;
				scaleY *= mainScaleY;
			}
		}
		if (forceRoundCircle) {
			angleDeg = 0;
			angle = 0;
			scaleX = 1;
			scaleY = 1;
		}

		var transformed = (Math.abs(angle) > 0.000001) || (Math.abs(scaleX - 1) > 0.000001) || (Math.abs(scaleY - 1) > 0.000001) || (Math.abs(sf - 1) > 0.000001);
		var ctx = target._context;

		var imageName = (disableImage || forceCircleMode) ? '' : String(this._image || '').trim();
		if (imageName.length > 0) {
			var bitmap = SRD.TimedAttack.loadImage(imageName);
			if (bitmap && bitmap.width > 0 && bitmap.height > 0) {
				if (transformed && this._jakeDrawBitmapTransformed) {
					var temp = new Bitmap(Math.max(2, bitmap.width + 2), Math.max(2, bitmap.height + 2));
					temp.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 1, 1);
					this._jakeDrawBitmapTransformed(target, temp, centerX, centerY, angleDeg, scaleX * sf, scaleY * sf);
				} else {
					var dw = Math.max(1, Math.floor(bitmap.width * sf * Math.abs(scaleX)));
					var dh = Math.max(1, Math.floor(bitmap.height * sf * Math.abs(scaleY)));
					target.blt(bitmap, 0, 0, bitmap.width, bitmap.height, centerX - (dw / 2), centerY - (dh / 2), dw, dh);
				}
				if (oldTargetPaintOpacity !== undefined) target.paintOpacity = oldTargetPaintOpacity;
				return;
			}
		}

		var outlineColor = (this._item && this._item.outline) ? this._item.outline : '#000000';
		var mainColor = this._cursorColor || ((this._item && this._item.color) ? this._item.color : '#ffffff');
		var defaultOutlineSize = Math.max(0, Math.floor((this._size || 0) * sf));
		var cursorThicknessBase = J.toNumber(this._jBarCursorThickness, this._size || 4);
		if (!isFinite(cursorThicknessBase) || cursorThicknessBase <= 0) cursorThicknessBase = 4;
		var thicknessOutlineSize = Math.max(1, Math.floor(cursorThicknessBase * sf));
		var useCursorThickness = isBarType && (imageName.length <= 0 || forceCircleMode);
		var outlineSize = useCursorThickness ? thicknessOutlineSize : defaultOutlineSize;
		var cursorH = Math.max(1, Math.floor(barH * sf));

		if (localShape === 'oval') {
			var r = Math.max(2, Math.floor(cursorH / 2));
			if (forceRoundCircle && ctx) {
				var ringThickness = Math.max(1, outlineSize);
				var ringRadius = Math.max(1, r - (ringThickness / 2));
				ctx.save();
				if (transformed) {
					ctx.translate(centerX, centerY);
					ctx.rotate(angle);
					ctx.scale(scaleX, scaleY);
				} else {
					ctx.translate(centerX, centerY);
				}
				ctx.strokeStyle = mainColor;
				ctx.lineWidth = ringThickness;
				ctx.beginPath();
				ctx.arc(0, 0, ringRadius, 0, Math.PI * 2, false);
				ctx.stroke();
				ctx.restore();
				target._setDirty();
				if (oldTargetPaintOpacity !== undefined) target.paintOpacity = oldTargetPaintOpacity;
				return;
			}

			var innerR = Math.max(1, r - outlineSize);
			if (transformed && ctx) {
				ctx.save();
				ctx.translate(centerX, centerY);
				ctx.rotate(angle);
				ctx.scale(scaleX, scaleY);
				ctx.fillStyle = outlineColor;
				ctx.beginPath();
				ctx.arc(0, 0, r, 0, Math.PI * 2, false);
				ctx.fill();
				ctx.fillStyle = mainColor;
				ctx.beginPath();
				ctx.arc(0, 0, innerR, 0, Math.PI * 2, false);
				ctx.fill();
				ctx.restore();
				target._setDirty();
			} else {
				target.drawCircle(centerX, centerY, r, outlineColor);
				target.drawCircle(centerX, centerY, innerR, mainColor);
			}
			if (oldTargetPaintOpacity !== undefined) target.paintOpacity = oldTargetPaintOpacity;
			return;
		}

		var cw = Math.max(2, Math.floor(((this._item && this._item.width) ? this._item.width : 12) * sf));
		var innerW = Math.max(1, cw - (outlineSize * 2));
		var innerH = Math.max(1, cursorH - (outlineSize * 2));
		if (transformed && ctx) {
			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.rotate(angle);
			ctx.scale(scaleX, scaleY);
			ctx.fillStyle = outlineColor;
			ctx.fillRect(-cw / 2, -cursorH / 2, cw, cursorH);
			ctx.fillStyle = mainColor;
			ctx.fillRect((-cw / 2) + outlineSize, (-cursorH / 2) + outlineSize, innerW, innerH);
			ctx.restore();
			target._setDirty();
		} else {
			var top = centerY - Math.floor(cursorH / 2);
			target.fillRect(centerX - Math.floor(cw / 2), top, cw, cursorH, outlineColor);
			target.fillRect(centerX - Math.floor(cw / 2) + outlineSize, top + outlineSize, innerW, innerH, mainColor);
		}
		if (oldTargetPaintOpacity !== undefined) target.paintOpacity = oldTargetPaintOpacity;
	};

	TimedAttackSystem.prototype._jakeEvaluateDefaultHitData = function(cursorX, totalWidth) {
		var zonePowers = [];
		var sum = 0;
		for (var i = 0; i < this._jHitzones.length; i++) {
			var p = J.evaluateHitzonePower(this._jHitzones[i], cursorX, totalWidth);
			zonePowers[i + 1] = p;
			sum += p;
		}
		return {zonePowers: zonePowers, sum: sum};
	};

	TimedAttackSystem.prototype._jakeFinalizeDefaultCustom = function() {
		if (this._jBarPowerValue === 'multiple hits') {
			this.setPower(this._jBarHitPowers);
		} else {
			this.setPower(this._jBarZonePowers);
		}
		this._notPressed = false;
		this._flashTime = 45;
	};

	TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones = function() {
		if (this._notPressed && this._jakeUpdateDefaultHitzoneMovements) {
			this._jakeUpdateDefaultHitzoneMovements();
		}

		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._xSpeed);
			var minX = -(this._item.width || 0);
			var maxX = this.windowWidth();
			if (this._xPosition > maxX || this._xPosition < minX) {
				if (this._jBarRepeat) {
					if (this._jBarRepeatAmount > 0 && this._jBarRepeatCount >= this._jBarRepeatAmount) {
						this._jakeFinalizeDefaultCustom();
					} else {
						this._jBarRepeatCount++;
						if (this._jBarRepeatBounce) {
							this._xSpeed *= (-1);
							this._xPosition = J.clamp(this._xPosition, minX, maxX);
						} else {
							this._xPosition = this._origin;
							this._xSpeed = this._jBarStartSpeed;
						}
					}
				} else {
					this._jakeFinalizeDefaultCustom();
				}
			}
		} else {
			this._flashTime++;
		}

		if (this._flashTime === 45) {
			BattleManager.endTASAttackThing();
			this.close();
		}

		this._window.contents.clear();
		var totalWidth = this.windowWidth();
		var contentWidth = this._window.contentsWidth();
		var contentHeight = this._window.contentsHeight();
		var scaleRatio = contentWidth / Math.max(totalWidth, 1);
		var barHeight = Math.max(2, Math.floor(this._jBarThickness || 16));
		var barY = Math.floor((contentHeight - barHeight) / 2);

		if (this._shape === 'oval') {
			this._jakeDrawCapsule(this._window.contents, 0, barY, contentWidth, barHeight, this._jBarBackgroundColor || '#ffffff');
		} else {
			this._window.contents.fillRect(0, barY, contentWidth, barHeight, this._jBarBackgroundColor || '#ffffff');
		}

		for (var i = 0; i < this._jHitzones.length; i++) {
			var zone = this._jHitzones[i];
			var zoneCenter = (totalWidth / 2) + (zone.position * (totalWidth / 2));
			var drawCenter = zoneCenter * scaleRatio;
			var closeRadius = zone.hitArea + zone.closeArea;
			if (closeRadius > 0) {
				var closeLeft = Math.floor(drawCenter - (closeRadius * scaleRatio));
				var closeWidth = Math.floor((closeRadius * 2) * scaleRatio);
				this._window.contents.fillRect(closeLeft, barY, closeWidth, barHeight, zone.closeColor);
			}
			if (zone.hitArea > 0) {
				var hitLeft = Math.floor(drawCenter - (zone.hitArea * scaleRatio));
				var hitWidth = Math.floor((zone.hitArea * 2) * scaleRatio);
				this._window.contents.fillRect(hitLeft, barY, hitWidth, barHeight, zone.hitColor);
			}
		}

		if (this._jBarHitMarkersEnabled && this._jBarMarkers && this._jBarMarkers.length > 0) {
			var oldOpacity = this._window.contents.paintOpacity;
			this._window.contents.paintOpacity = this._jBarHitMarkerOpacity;
			for (var m = 0; m < this._jBarMarkers.length; m++) {
				this._jakeDrawDefaultCustomCursor(this._jBarMarkers[m] * scaleRatio, barY, barHeight, scaleRatio);
			}
			this._window.contents.paintOpacity = oldOpacity;
		}

		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			this._jakeDrawDefaultCustomCursor(this._xPosition * scaleRatio, barY, barHeight, scaleRatio);
		}

		if (this._jakeActivationTriggered() && this._notPressed) {
			var hitData = this._jakeEvaluateDefaultHitData(this._xPosition, totalWidth);
			if (this._jBarPowerValue === 'multiple hits') {
				this._jBarHitPowers[this._jBarHitsDone + 1] = hitData.sum;
			} else {
				for (var z = 1; z < hitData.zonePowers.length; z++) {
					if (hitData.zonePowers[z] > 0) this._jBarZonePowers[z] = hitData.zonePowers[z];
				}
			}

			this._jakePushBarMarker(this._xPosition);
			this._jBarHitsDone++;
			AudioManager.playSe({"name":this._se,"pan":0,"pitch":100,"volume":100});

			if (this._jBarRequiredHits !== -1 && this._jBarHitsDone >= this._jBarRequiredHits) {
				this._jakeFinalizeDefaultCustom();
			}
		}

		var centerX = this._window.x + (this._window.width / 2);
		var centerY = this._window.y + (this._window.height / 2);
		this._jakeApplyVisualTransform(centerX, centerY);
		this._jakeUpdateOverlayText(null, centerX, this._window.y - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(centerX, centerY);
	};

	var _jPlayDefault_v21 = TimedAttackSystem.prototype.playDefaultGame;
	TimedAttackSystem.prototype.playDefaultGame = function() {
		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID && this._jDefaultMode === 'custom hitzones') {
			this._jakePlayDefaultCustomHitzones();
			return;
		}
		_jPlayDefault_v21.call(this);
	};

	TimedAttackSystem.prototype._jakeSetupMashItem = function(item) {
		this._jMashMode = J.normalizeMashMode(item.jakeMashMode || 'default mash');
		var ok = J.defaultOkKeyCode();
		var cancel = J.defaultCancelKeyCode();

		this._jMashKeys = J.parseKeyCodeList(item.jakeMashKeys, []);
		if (this._jMashMode === 'custom mash' && this._jMashKeys.length === 0) this._jMashKeys = [ok];
		if (this._jMashMode === 'multi mash' && this._jMashKeys.length === 0) this._jMashKeys = [ok];
		if ((this._jMashMode === 'alternative mash' || this._jMashMode === 'sequence mash') && this._jMashKeys.length === 0) {
			this._jMashKeys = [ok, cancel];
		}

		this._jMashFramesProp = Math.max(0, parseInt(item.jakeMashFrames || 0));
		this._jMashSecondsProp = Math.max(0, parseInt(item.jakeMashSeconds || item.seconds || 0));
		this._jMashUseFrames = this._jMashFramesProp > 0;

		this._jMashPools = [];
		for (var i = 0; i < 10; i++) {
			var rawKeys = item.jakeMashRandomKeys ? item.jakeMashRandomKeys[i] : null;
			var hasData = rawKeys !== undefined && rawKeys !== null && String(rawKeys).trim().length > 0;
			if (i === 0 || hasData) {
				var keys = J.parseKeyCodeList(rawKeys, (i === 0) ? [ok] : []);
				if (keys.length > 0) {
					this._jMashPools.push({
						keys: keys,
						texts: J.splitCsv(item.jakeMashRandomKeysTexts ? item.jakeMashRandomKeysTexts[i] : ''),
						icons: J.splitCsv(item.jakeMashRandomKeysIcons ? item.jakeMashRandomKeysIcons[i] : '')
					});
				}
			}
		}
		if (!this._jMashPools.length) this._jMashPools.push({keys:[ok], texts:[], icons:[]});

		this._jMashRandomOnce = J.parseBool(item.jakeMashRandomOnce, false);
		this._jMashRandomNoRepeat = (item.jakeMashRandomNoRepeat !== false);
		this._jMashSpecifiedOnce = J.splitCsv(item.jakeMashRandomSpecifiedOnce);
		this._jMashHasSpecifiedOnce = this._jMashSpecifiedOnce.length > 0;

		this._jMashUnending = J.parseBool(item.jakeMashUnending, false);
		this._jMashUnstarting = J.parseBool(item.jakeMashUnstarting, false);
		this._jMashTimeless = J.parseBool(item.jakeMashTimeless, false);
		this._jMashPowerValue = J.normalizePowerValue(item.jakeMashPowerValue || 'last value');
		this._jMashTapGainFade = Math.max(0, Number(item.jakeMashTapGainFade || 1));

		this._jMashSE = String(item.jakeMashSE || '');
		this._jMashInvalidSE = String(item.jakeMashInvalidSE || '');
		this._jMashMarkerColor = String(item.jakeMashHighLowMarkerColor || '#ff0000');
		this._jMashInvalidColor = String(item.jakeMashInvalidKeyColor || '#ff0000');
		this._jMashStopColor = String(item.jakeMashStopKeyColor || '#0000ff');

		var stopKey = parseInt(item.jakeMashStopKey);
		this._jMashStopKey = isNaN(stopKey) ? null : stopKey;
		this._jMashStopText = String(item.jakeMashStopText || '');
		this._jMashStopIcon = String(item.jakeMashStopIcon || '');
	};

	TimedAttackSystem.prototype._jakeInitMashRuntime = function() {
		this._jMashPoolStates = [];
		for (var i = 0; i < this._jMashPools.length; i++) {
			var pool = this._jMashPools[i];
			var once = this._jMashRandomOnce;
			if (this._jMashHasSpecifiedOnce) {
				once = J.parseBool(this._jMashSpecifiedOnce[i], false);
			}
			this._jMashPoolStates.push({
				keys: pool.keys.slice(),
				texts: pool.texts.slice(),
				icons: pool.icons.slice(),
				once: once,
				selected: 0,
				currentKey: pool.keys[0]
			});
			this._jakeSelectMashPoolKey(i, true);
		}

		this._jMashLastPressedKey = null;
		this._jMashLastPool = -1;
		this._jMashSeqIndex = 0;
		this._jMashSeqPoolIndex = 0;
		this._jMashLastInputInvalid = false;

		this._jMashSeqPressedPools = [];
		for (var j = 0; j < this._jMashPoolStates.length; j++) this._jMashSeqPressedPools[j] = false;

		if (this._jMashUseFrames) {
			this._jMashFramesLeft = this._jMashFramesProp;
			this._seconds = Math.ceil(this._jMashFramesLeft / 60);
		} else {
			this._jMashFramesLeft = Math.max(0, this._jMashSecondsProp * 60);
			this._seconds = this._jMashSecondsProp;
		}

		var ratio = (this._maxPosition > 0) ? J.clamp(this._xPosition / this._maxPosition, 0, 1) : 0;
		this._jMashLastRatio = ratio;
		this._jMashHighestRatio = ratio;
		this._jMashLowestRatio = ratio;
	};

	TimedAttackSystem.prototype._jakeSelectMashPoolKey = function(poolIndex, force) {
		var state = this._jMashPoolStates[poolIndex];
		if (!state || !state.keys || !state.keys.length) return;
		if (!force && state.once) return;
		var prev = state.selected;
		var next = Math.randomInt(state.keys.length);
		if (this._jMashRandomNoRepeat && state.keys.length > 1) {
			while (next === prev) next = Math.randomInt(state.keys.length);
		}
		state.selected = next;
		state.currentKey = state.keys[state.selected];
	};

	TimedAttackSystem.prototype._jakeMashPoolBlocked = function(index) {
		if (this._jMashMode === 'random alternative mash') return index === this._jMashLastPool;
		if (this._jMashMode === 'random sequence mash') return index !== this._jMashSeqPoolIndex;
		return false;
	};

	TimedAttackSystem.prototype._jakeProcessRandomMashInput = function() {
		this._jMashLastInputInvalid = false;
		if (!this._jMashPoolStates || !this._jMashPoolStates.length) return false;

		var triggeredPool = -1;
		for (var i = 0; i < this._jMashPoolStates.length; i++) {
			if (J.consumeKeyCode(this._jMashPoolStates[i].currentKey)) {
				triggeredPool = i;
				break;
			}
		}
		if (triggeredPool < 0) return false;

		if (this._jMashMode === 'random mash') {
			if (triggeredPool !== 0) {
				this._jMashLastInputInvalid = true;
				return false;
			}
			this._jakeSelectMashPoolKey(0, false);
			return true;
		}

		if (this._jMashMode === 'random multi mash') {
			this._jakeSelectMashPoolKey(triggeredPool, false);
			return true;
		}

		if (this._jMashMode === 'random alternative mash') {
			if (triggeredPool === this._jMashLastPool) {
				this._jMashLastInputInvalid = true;
				return false;
			}
			this._jMashLastPool = triggeredPool;
			this._jakeSelectMashPoolKey(triggeredPool, false);
			return true;
		}

		if (this._jMashMode === 'random sequence mash') {
			if (triggeredPool !== this._jMashSeqPoolIndex) {
				this._jMashLastInputInvalid = true;
				return false;
			}
			this._jMashSeqPressedPools[triggeredPool] = true;
			this._jakeSelectMashPoolKey(triggeredPool, false);
			this._jMashSeqPoolIndex++;
			if (this._jMashSeqPoolIndex >= this._jMashPoolStates.length) {
				this._jMashSeqPoolIndex = 0;
				for (var j = 0; j < this._jMashSeqPressedPools.length; j++) this._jMashSeqPressedPools[j] = false;
			}
			return true;
		}

		return false;
	};

	TimedAttackSystem.prototype._jakeProcessMashInput = function() {
		this._jMashLastInputInvalid = false;
		switch (this._jMashMode) {
		case 'default mash':
			var okCodes = J.getActionKeyCodes('ok');
			if (okCodes.length > 0) return J.consumeOneOf(okCodes) !== null;
			return !!this._jakeActivationTriggered();
		case 'custom mash':
			return J.getTriggeredFrom([this._jMashKeys[0]]) !== null;
		case 'multi mash':
			return J.getTriggeredFrom(this._jMashKeys) !== null;
		case 'alternative mash':
			var a = J.getTriggeredFrom(this._jMashKeys);
			if (a === null) return false;
			if (a === this._jMashLastPressedKey) {
				this._jMashLastInputInvalid = true;
				return false;
			}
			this._jMashLastPressedKey = a;
			return true;
		case 'sequence mash':
			if (!this._jMashKeys.length) return false;
			var trig = J.getTriggeredFrom(this._jMashKeys);
			if (trig === null) return false;
			var expected = this._jMashKeys[this._jMashSeqIndex];
			if (trig !== expected) {
				this._jMashLastInputInvalid = true;
				return false;
			}
			this._jMashSeqIndex = (this._jMashSeqIndex + 1) % this._jMashKeys.length;
			this._jMashLastPressedKey = trig;
			return true;
		case 'random mash':
		case 'random multi mash':
		case 'random alternative mash':
		case 'random sequence mash':
			return this._jakeProcessRandomMashInput();
		default:
			return !!this._jakeActivationTriggered();
		}
	};

	TimedAttackSystem.prototype._jakeGetMashPoolDisplay = function(state) {
		var icon = state.icons[state.selected];
		if (icon && icon.length > 0) return {type:'icon', value:icon};
		var text = state.texts[state.selected];
		if (text && text.length > 0) return {type:'text', value:text};
		return {type:'text', value:J.keyCodeToLabel(state.currentKey)};
	};

	TimedAttackSystem.prototype._jakeMashStopDisplay = function() {
		if (this._jMashStopIcon && this._jMashStopIcon.length > 0) return {type:'icon', value:this._jMashStopIcon};
		if (this._jMashStopText && this._jMashStopText.length > 0) return {type:'text', value:this._jMashStopText};
		return {type:'text', value:J.keyCodeToLabel(this._jMashStopKey)};
	};

	TimedAttackSystem.prototype._jakeDrawMashToken = function(bmp, centerX, centerY, size, display, blocked, baseColor, frameColor, angleDeg, scaleX, scaleY) {
		var tokenSize = Math.max(1, Math.floor(size || 0));
		var ang = J.toNumber(angleDeg, 0);
		var sx = J.toNumber(scaleX, 1);
		var sy = J.toNumber(scaleY, 1);
		if (!isFinite(sx) || sx === 0) sx = 1;
		if (!isFinite(sy) || sy === 0) sy = 1;
		var transformed = (Math.abs(ang) > 0.000001) || (Math.abs(sx - 1) > 0.000001) || (Math.abs(sy - 1) > 0.000001);

		var updateBounds = function(left, top, right, bottom) {
			if (!(this._jakeKeysLayer && bmp === this._jakeKeysLayer.bitmap)) return;
			if (!this._jakeKeysBounds) {
				this._jakeKeysBounds = {minX: left, minY: top, maxX: right, maxY: bottom};
				return;
			}
			if (left < this._jakeKeysBounds.minX) this._jakeKeysBounds.minX = left;
			if (top < this._jakeKeysBounds.minY) this._jakeKeysBounds.minY = top;
			if (right > this._jakeKeysBounds.maxX) this._jakeKeysBounds.maxX = right;
			if (bottom > this._jakeKeysBounds.maxY) this._jakeKeysBounds.maxY = bottom;
		};

		if (transformed && bmp && bmp._context) {
			var pad = 6;
			var tempW = tokenSize + pad;
			var tempH = tokenSize + pad;
			var temp = new Bitmap(tempW, tempH);
			this._jakeDrawMashToken(temp, Math.floor(tempW / 2), Math.floor(tempH / 2), tokenSize, display, blocked, baseColor, frameColor, 0, 1, 1);

			var rad = ang * (Math.PI / 180);
			var aw = tempW * Math.abs(sx);
			var ah = tempH * Math.abs(sy);
			var cos = Math.abs(Math.cos(rad));
			var sin = Math.abs(Math.sin(rad));
			var halfW = ((aw * cos) + (ah * sin)) / 2;
			var halfH = ((aw * sin) + (ah * cos)) / 2;
			updateBounds.call(this, centerX - halfW, centerY - halfH, centerX + halfW, centerY + halfH);

			var src = temp._canvas || temp.canvas || temp._image;
			var ctx = bmp._context;
			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.rotate(rad);
			ctx.scale(sx, sy);
			ctx.drawImage(src, -tempW / 2, -tempH / 2);
			ctx.restore();
			bmp._setDirty();
			return;
		}

		var left = Math.round(centerX - (tokenSize / 2));
		var top = Math.round(centerY - (tokenSize / 2));
		var boundLeft = left;
		var boundTop = top;
		var boundRight = left + tokenSize;
		var boundBottom = top + tokenSize;

		if (display && display.type === 'icon') {
			boundLeft = left - 2;
			boundTop = top - 2;
			boundRight = left + tokenSize + 2;
			boundBottom = top + tokenSize + 2;
			bmp.fillRect(left - 2, top - 2, tokenSize + 4, tokenSize + 4, blocked ? this._jMashInvalidColor : frameColor);
			var iconBmp = ImageManager.loadPicture(display.value);
			if (iconBmp && iconBmp.width > 0) {
				bmp.blt(iconBmp, 0, 0, iconBmp.width, iconBmp.height, left, top, tokenSize, tokenSize);
			} else {
				bmp.fillRect(left, top, tokenSize, tokenSize, 'rgba(255,255,255,0.2)');
				bmp.drawText('...', left, top, tokenSize, tokenSize, 'center');
			}
		} else {
			bmp.fillRect(left, top, tokenSize, tokenSize, blocked ? this._jMashInvalidColor : baseColor);
			bmp.drawText(String(display.value || ''), left, top, tokenSize, tokenSize, 'center');
		}

		updateBounds.call(this, boundLeft, boundTop, boundRight, boundBottom);
	};

	TimedAttackSystem.prototype._jakeDrawMashIndicators = function() {
		this._jakeEnsureKeysLayer();
		var bmp = this._jakeKeysLayer.bitmap;
		bmp.clear();
		var hasAny = false;

		var size = Math.max(24, this._height + 8);
		var gap = 6;
		var gaugeY = this._y + this.lineHeight() - 8 + Math.floor(this._height / 2);

		if (this._jakeMashIsRandomMode()) {
			var poolCount = (this._jMashMode === 'random mash') ? 1 : this._jMashPoolStates.length;
			for (var i = 0; i < poolCount; i++) {
				var state = this._jMashPoolStates[i];
				var cx = this._x - ((poolCount - i) * (size + gap));
				var blocked = this._jakeMashPoolBlocked(i);
				var display = this._jakeGetMashPoolDisplay(state);
				this._jakeDrawMashToken(bmp, cx, gaugeY, size, display, blocked, 'rgba(30,30,30,0.35)', '#222222');
				hasAny = true;
			}
		}

		if (this._jMashStopKey !== null) {
			var stopDisplay = this._jakeMashStopDisplay();
			var stopX = this._x + this._width + size;
			this._jakeDrawMashToken(bmp, stopX, gaugeY, size, stopDisplay, false, this._jMashStopColor, this._jMashStopColor);
			hasAny = true;
		}

		if (hasAny) {
			this._jakeApplyKeysLayerTransform(this._x + (this._width / 2), gaugeY);
		} else {
			this._jakeKeysLayer.visible = false;
		}
	};

	TimedAttackSystem.prototype._jakeUpdateMashPowerTracking = function() {
		var ratio = (this._maxPosition > 0) ? J.clamp(this._xPosition / this._maxPosition, 0, 1) : 0;
		this._jMashLastRatio = ratio;
		if (ratio > this._jMashHighestRatio) this._jMashHighestRatio = ratio;
		if (ratio < this._jMashLowestRatio) this._jMashLowestRatio = ratio;
	};

	TimedAttackSystem.prototype._jakeResolveMashPower = function() {
		if (this._jMashPowerValue === 'highest value') return this._jMashHighestRatio;
		if (this._jMashPowerValue === 'lowest value') return this._jMashLowestRatio;
		return this._jMashLastRatio;
	};

	TimedAttackSystem.prototype._jakeFinishMash = function(reason) {
		if (!this._notPressed) return;
		this._notPressed = false;

		if (reason === 'fill') AudioManager.playSe({"name":this._item.vse,"pan":0,"pitch":100,"volume":100});
		else if (reason === 'drain') AudioManager.playSe({"name":this._item.fse,"pan":0,"pitch":100,"volume":100});
		else AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});

		this.setPower(this._jakeResolveMashPower());

		if ((reason === 'fill' || reason === 'stop') && !this._jMashTimeless) {
			J.setTasTimeLeftFromFrames(this._jakeCurrentFramesLeft());
		} else {
			J.setTasTimeLeftFromFrames(0);
		}
	};

	TimedAttackSystem.prototype.playMashGame = function() {
		if (this._notPressed) {
			var f = this._frame;
			this._xPosition -= Number(eval(this._item.speed)) - this._tempSpeed;
			if (this._xPosition <= 0) {
				this._xPosition = 0;
				this._jakeUpdateMashPowerTracking();
				if (!this._jMashUnstarting) this._jakeFinishMash('drain');
			}
			if (this._xPosition >= this._maxPosition) {
				this._xPosition = this._maxPosition;
				this._jakeUpdateMashPowerTracking();
				if (!this._jMashUnending) this._jakeFinishMash('fill');
			}
		} else {
			this._flashTime++;
		}

		this._x = (Graphics.width / 2);
		this._y = (Graphics.height / 2);
		this._x += this._visualXOffset;
		this._y += this._visualYOffset;
		if (!isSideview) {
			this._x += globalNonSideXOffset + globalNonSideXOffsetMash;
			this._y += globalNonSideYOffset + globalNonSideYOffsetMash;
		}

		this._content.bitmap.clear();
		this.drawGaugeUpgrade(this._x, this._y, this._width, this._height, this._xPosition / this._maxPosition, this._color1, this._color2);

		if (this._jMashPowerValue === 'highest value' || this._jMashPowerValue === 'lowest value') {
			var markerRatio = (this._jMashPowerValue === 'highest value') ? this._jMashHighestRatio : this._jMashLowestRatio;
			var gaugeY = this._y + this.lineHeight() - 8;
			var markerX = this._x + Math.floor(this._width * markerRatio);
			this._content.bitmap.fillRect(markerX, gaugeY - 2, 2, this._height + 4, this._jMashMarkerColor);
		}

		this._jakeDrawMashIndicators();

		var defaultText = null;
		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			defaultText = this._phrase.replace(/%1/g, this._seconds);
		}

		this._jakeApplyVisualTransform(this._x + (this._width / 2), this._y + (this._height / 2));
		this._jakeUpdateOverlayText(defaultText, this._x + (this._width / 2), this._y - this._height + (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(this._x + (this._width / 2), this._y + (this._height / 2));

		if (this._flashTime >= this._time && !this._notPressed) {
			this._content.bitmap.clear();
			BattleManager.endTASAttackThing();
			this.close();
		}

		if (this._notPressed) {
			if (this._jMashStopKey !== null && J.consumeKeyCode(this._jMashStopKey)) {
				this._jakeUpdateMashPowerTracking();
				this._jakeFinishMash('stop');
			} else {
				var validMash = this._jakeProcessMashInput();
				if (validMash) {
					if (this._jMashSE && this._jMashSE.length > 0) {
						AudioManager.playSe({"name":this._jMashSE,"pan":0,"pitch":100,"volume":100});
					}
					if (this._mode) this._tempSpeed = eval(this._item.tap);
					else this._xPosition += eval(this._item.tap);
				} else if (this._jMashLastInputInvalid && this._jMashInvalidSE && this._jMashInvalidSE.length > 0) {
					AudioManager.playSe({"name":this._jMashInvalidSE,"pan":0,"pitch":100,"volume":100});
				}

				if (!this._jMashTimeless) {
					if (this._jMashUseFrames) {
						this._jMashFramesLeft = Math.max(0, this._jMashFramesLeft - 1);
						this._seconds = Math.ceil(this._jMashFramesLeft / 60);
						if (this._jMashFramesLeft <= 0) this._jakeFinishMash('timeout');
					} else if (this._frame % 60 === 0) {
						this._seconds--;
						if (this._seconds <= 0) {
							this._seconds = 0;
							this._jakeFinishMash('timeout');
						}
					}
				}
			}

			if (this._tempSpeed > 0) {
				this._tempSpeed = Math.max(0, this._tempSpeed - this._jMashTapGainFade);
			}
			this._xPosition = J.clamp(this._xPosition, 0, this._maxPosition);
			this._jakeUpdateMashPowerTracking();
		}
	};

	TimedAttackSystem.prototype._jakeSetupArrowsItem = function(item) {
		this._jArrowCommandTexts = J.splitCsv(item.jakeArrowCommandTexts);
		this._jArrowCommandIcons = J.splitCsv(item.jakeArrowCommandIcons);

		this._jArrowPools = [];
		for (var i = 0; i < 20; i++) {
			this._jArrowPools[i] = {
				keys: J.parseKeyCodeList(item.jakeArrowRandomKeys ? item.jakeArrowRandomKeys[i] : null, []),
				texts: J.splitCsv(item.jakeArrowRandomKeysTexts ? item.jakeArrowRandomKeysTexts[i] : ''),
				icons: J.splitCsv(item.jakeArrowRandomKeysIcons ? item.jakeArrowRandomKeysIcons[i] : '')
			};
		}
		if (!this._jArrowPools[0].keys.length) this._jArrowPools[0].keys = [J.defaultOkKeyCode()];

		this._commands = this._jakeBuildArrowCommands(item);
		if (!this._commands.length) this._commands.push({kind:'arrow', arrowIndex:Math.randomInt(4)});

		this._countDown = this._commands.length;
		this._maxCount = this._countDown;
		this._jArrowSlotSize = 40;
		this._width = Math.max(this.textWidth(this._phrase + '000'), this._commands.length * this._jArrowSlotSize);

		var framesFromSeconds = Math.max(0, parseInt(item.jakeArrowSeconds || 0)) * 60;
		var framesExplicit = Math.max(0, parseInt(item.jakeArrowFrames || 0));
		this._jArrowTotalFrames = framesExplicit > 0 ? framesExplicit : (framesFromSeconds > 0 ? framesFromSeconds : Math.max(0, parseInt(item.frames || 0)));
		this._milis = this._jArrowTotalFrames;
		this._jArrowTimeless = !!item.jakeArrowTimeless;
		this._jArrowIgnoreInvalidKeys = J.parseKeyCodeList(item.jakeArrowIgnoreInvalidKeys, []);
		this._jArrowShownKeys = Math.floor(Number(item.jakeArrowShownKeys));
		if (!isFinite(this._jArrowShownKeys)) this._jArrowShownKeys = -1;
		if (this._jArrowShownKeys < -1) this._jArrowShownKeys = -1;
		this._jArrowUnshownKeys = Math.floor(Number(item.jakeArrowUnshownKeys));
		if (!isFinite(this._jArrowUnshownKeys)) this._jArrowUnshownKeys = -1;
		if (this._jArrowUnshownKeys < -1) this._jArrowUnshownKeys = -1;
		this._jArrowUnshownRectImage = String(item.jakeArrowUnshownRectImage || '').trim();
		this._jArrowUnshownRectColor = String(item.jakeArrowUnshownRectColor || '#000000').trim();
		if (!this._jArrowUnshownRectColor.length) this._jArrowUnshownRectColor = '#000000';
		this._jArrowIgnoreInvalidMap = {};
		for (var k = 0; k < this._jArrowIgnoreInvalidKeys.length; k++) {
			this._jArrowIgnoreInvalidMap[this._jArrowIgnoreInvalidKeys[k]] = true;
		}

		this._jArrowActionCodes = [
			J.getActionKeyCodes('up'),
			J.getActionKeyCodes('right'),
			J.getActionKeyCodes('down'),
			J.getActionKeyCodes('left')
		];
	};

	TimedAttackSystem.prototype._jakeRefreshArrowSpriteBitmap = function(sprite, cmd) {
		sprite.bitmap.clear();
		var slot = this._jArrowSlotSize;
		if (cmd.kind === 'arrow') {
			var bit = SRD.TimedAttack.loadImage(this._image);
			var sw = bit.width / 4;
			var sh = bit.height;
			sprite.bitmap.blt(bit, cmd.arrowIndex * sw, 0, sw, sh, 0, 0, slot, slot);
			return;
		}
		sprite.bitmap.fillRect(0, 0, slot, slot, 'rgba(30,30,30,0.35)');
		if (cmd.iconName && cmd.iconName.length > 0) {
			var icon = ImageManager.loadPicture(cmd.iconName);
			if (icon && icon.width > 0) {
				sprite.bitmap.blt(icon, 0, 0, icon.width, icon.height, 0, 0, slot, slot);
				return;
			}
		}
		sprite.bitmap.drawText(String(cmd.label || ''), 0, 0, slot, slot, 'center');
	};

	TimedAttackSystem.prototype._jakeRefreshArrowHiddenBitmap = function(sprite) {
		sprite.bitmap.clear();
		var slot = this._jArrowSlotSize;
		if (this._jArrowUnshownRectImage && this._jArrowUnshownRectImage.length > 0) {
			var maskImage = ImageManager.loadPicture(this._jArrowUnshownRectImage);
			if (maskImage && maskImage.width > 0) {
				sprite.bitmap.blt(maskImage, 0, 0, maskImage.width, maskImage.height, 0, 0, slot, slot);
				return;
			}
		}
		sprite.bitmap.fillRect(0, 0, slot, slot, this._jArrowUnshownRectColor || '#000000');
	};

	TimedAttackSystem.prototype._jakeCreateArrowSprites = function() {
		this._jakeEnsureKeysLayer();
		this._jakeCleanupArrowSprites();
		this._jArrowSprites = [];
		for (var i = 0; i < this._commands.length; i++) {
			var sprite = new Sprite(new Bitmap(this._jArrowSlotSize, this._jArrowSlotSize));
			this._jakeRefreshArrowSpriteBitmap(sprite, this._commands[i]);
			sprite.opacity = 0;
			this._jArrowSprites.push(sprite);
			this._jArrowContainer.addChild(sprite);
		}
	};

	TimedAttackSystem.prototype._jakeArrowCommandTriggered = function(cmd) {
		if (!cmd) return false;
		if (cmd.kind === 'arrow') {
			var codes = this._jArrowActionCodes[cmd.arrowIndex] || [];
			return J.consumeOneOf(codes) !== null;
		}
		return J.consumeKeyCode(cmd.keyCode);
	};

	TimedAttackSystem.prototype._jakeArrowAnyInputTriggered = function() {
		if (!Input || !Array.isArray(Input._jakeTAKeyQueue)) {
			return J.consumeAnyKey() !== null;
		}

		var queue = Input._jakeTAKeyQueue;
		var ignoreMap = this._jArrowIgnoreInvalidMap || {};
		var activeTa = J._activeInputConsumer;

		if (activeTa && activeTa._jXTAInputReadOnly) {
			var start = Math.max(0, Number(activeTa._jInputReadPos || 0));
			for (var i = start; i < queue.length; i++) {
				if (queue[i] === null || queue[i] === undefined) continue;
				var roCode = Number(queue[i]);
				activeTa._jInputReadPos = i + 1;
				if (ignoreMap[roCode]) continue;
				return true;
			}
			return false;
		}

		for (var j = 0; j < queue.length; j++) {
			if (queue[j] === null || queue[j] === undefined) continue;
			var code = Number(queue[j]);
			queue[j] = null;
			if (ignoreMap[code]) continue;
			return true;
		}
		return false;
	};

	TimedAttackSystem.prototype.playArrowGame = function() {
		if (this._oneUpdate) {
			this._jakeCreateArrowSprites();
			this._jArrowCenter = (this._width / 2) - ((this._commands.length * this._jArrowSlotSize) / 2);
			this._oneUpdate = false;
		} else {
			var passed = this._maxCount - this._countDown;
			for (var i = 0; i < this._jArrowSprites.length; i++) {
				var s = this._jArrowSprites[i];
				if (passed > i) {
					if (s.opacity > 0) {
						s.opacity += this._ani[0];
						s.scale.x += this._ani[1];
						s.scale.y += this._ani[2];
						s.x += this._ani[3];
						s.y += this._ani[4];
					}
				} else {
					var relativeIndex = i - passed;
					s.x = this._x + (relativeIndex * this._jArrowSlotSize) + this._jArrowCenter;
					s.y = this._y + this.lineHeight();
					if (s.opacity === 0) s.opacity = 255;

					var hideSlot = false;
					if (this._jArrowUnshownKeys > 0) {
						hideSlot = relativeIndex < this._jArrowUnshownKeys;
					} else if (this._jArrowShownKeys === 0) {
						hideSlot = true;
					} else if (this._jArrowShownKeys > 0) {
						hideSlot = relativeIndex >= this._jArrowShownKeys;
					}

					var shouldRefreshSlot = (s._jMaskHidden !== hideSlot || s._jCmdRef !== this._commands[i]);
					if (!shouldRefreshSlot && hideSlot && this._jArrowUnshownRectImage && this._jArrowUnshownRectImage.length > 0) {
						shouldRefreshSlot = true;
					}
					if (shouldRefreshSlot) {
						if (hideSlot) this._jakeRefreshArrowHiddenBitmap(s);
						else this._jakeRefreshArrowSpriteBitmap(s, this._commands[i]);
						s._jMaskHidden = hideSlot;
						s._jCmdRef = this._commands[i];
					}
				}
			}
		}

		if (this._notPressed) {
			var f = this._frame;
		} else {
			this._flashTime++;
		}

		if (this._flashTime >= this._time && !this._notPressed) {
			this._content.bitmap.clear();
			this._jakeCleanupArrowSprites();
			BattleManager.endTASAttackThing();
			this.close();
		}

		this._x = (Graphics.width / 2);
		this._y = (Graphics.height / 2);
		this._x += this._visualXOffset;
		this._y += this._visualYOffset;
		if (!isSideview) {
			this._x += globalNonSideXOffset + globalNonSideXOffsetArrows;
			this._y += globalNonSideYOffset + globalNonSideYOffsetArrows;
		}

		this._content.bitmap.clear();
		this._jakeEnsureKeysLayer();
		this._jakeKeysLayer.bitmap.clear();
		this._jakeKeysBounds = null;
		this._jakeApplyKeysLayerTransform(this._x + (this._width / 2), this._y + this.lineHeight());
		this._jakeApplyVisualTransform(this._x + (this._width / 2), this._y + this.lineHeight());

		var text = null;
		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			text = this._phrase.replace(/%1/g, (this._milis).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping:false}));
		}
		this._jakeUpdateOverlayText(text, this._x + (this._width / 2), this._y + (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(this._x + (this._width / 2), this._y + this.lineHeight());

		if (this._notPressed) {
			var idx = this._maxCount - this._countDown;
			var current = this._commands[idx];
			if (this._jakeArrowCommandTriggered(current)) {
				this._countDown--;
				if (this._countDown === 0) {
					AudioManager.playSe({"name":this._item.vse,"pan":0,"pitch":100,"volume":100});
					this.setPower(eval(this._successPower));
					J.setTasTimeLeftFromFrames(this._milis);
					this._notPressed = false;
				} else {
					AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
				}
			} else if (this._jakeArrowAnyInputTriggered()) {
				this._milis -= this._penatly;
				AudioManager.playSe({"name":this._item.fse,"pan":0,"pitch":100,"volume":100});
			}

			if (this._milis < 0) this._milis = 0;

			if (!this._jArrowTimeless) {
				this._milis--;
				if (this._milis < 0) this._milis = 0;

				if (this._milis <= 0) {
					this._notPressed = false;
					AudioManager.playSe({"name":this._item.f2se,"pan":0,"pitch":100,"volume":100});
					this.setPower(eval(this._failPower));
					J.setTasTimeLeftFromFrames(0);
				}
			}
		}
	};

	TimedAttackSystem.prototype._jakeResolveClockPower = function() {
		if (this._jClockPowerValue === 'one value') {
			var total = 0;
			for (var i = 0; i < this._setTargets.length; i++) {
				for (var j = 0; j < this._targets.length; j++) {
					if (this._setTargets[i] > this._targets[j][0] && this._setTargets[i] < this._targets[j][1]) total += this._targets[j][3];
				}
			}
			return total / Math.max(1, this._setTargets.length);
		}

		if (this._jClockPowerValue === 'multiple targets') {
			var arrTargets = [0];
			for (var t = 0; t < this._targets.length; t++) arrTargets[t + 1] = 0;
			for (var h = 0; h < this._setTargets.length; h++) {
				for (var k = 0; k < this._targets.length; k++) {
					if (this._setTargets[h] > this._targets[k][0] && this._setTargets[h] < this._targets[k][1]) {
						arrTargets[k + 1] = this._targets[k][3];
					}
				}
			}
			return arrTargets;
		}

		var arrHits = [0];
		for (var m = 0; m < this._setTargets.length; m++) {
			var sum = 0;
			for (var n = 0; n < this._targets.length; n++) {
				if (this._setTargets[m] > this._targets[n][0] && this._setTargets[m] < this._targets[n][1]) sum += this._targets[n][3];
			}
			arrHits[m + 1] = sum;
		}
		return arrHits;
	};

	TimedAttackSystem.prototype.playClockGame = function() {
		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._mul);
			if (this._xPosition <= this._startRadius || this._xPosition >= this._endRadius) {
				if (this._rt === 'repeat') this._xPosition = this._startRadius;
				else if (this._rt === 'reverse') this._mul *= (-1);
				else {
					this.setPower(0);
					this._flashTime = this._time;
					this._notPressed = false;
				}
			}
		} else {
			this._flashTime++;
		}

		this._x = (Graphics.width / 2);
		this._y = (Graphics.height / 2);
		this._x += this._visualXOffset;
		this._y += this._visualYOffset;
		if (!isSideview) {
			this._x += globalNonSideXOffset + globalNonSideXOffsetClock;
			this._y += globalNonSideYOffset + globalNonSideYOffsetClock;
		}

		this._content.bitmap.clear();
		var mainClockOpacity = this._jakeResolveElementOpacity ? this._jakeResolveElementOpacity(null) : 255;
		var clockVisualOpacity = this._jakeResolveElementOpacity ? this._jakeResolveElementOpacity('Clock', mainClockOpacity) : mainClockOpacity;
		var oldClockPaintOpacity = this._content.bitmap.paintOpacity;
		if (oldClockPaintOpacity !== undefined) {
			var cappedClockPaint = J.toOpacity(oldClockPaintOpacity, 255);
			this._content.bitmap.paintOpacity = Math.min(cappedClockPaint, J.toOpacity(clockVisualOpacity, cappedClockPaint));
		}
		if (this._image.trim().length > 0 && this._xPosition > 0) {
			var bitmap = SRD.TimedAttack.loadImage(this._image);
			this._content.bitmap.blt(bitmap, 0, 0, bitmap.width, bitmap.height, this._x - (bitmap.width/2), this._y - (bitmap.height/2));
		} else {
			this._content.bitmap.drawCircle(this._x, this._y, this._length + this._outWidth, this._outColor);
			this._content.bitmap.drawCircle(this._x, this._y, this._length, this._backColor);
		}
		for (var i = 0; i < this._targets.length; i++) {
			this._content.bitmap.drawPizzaSlice(this._x, this._y, this._length, this._targets[i][0] * (Math.PI / 180), this._targets[i][1] * (Math.PI / 180), this._targets[i][2]);
		}
		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			this._content.bitmap.drawHand(this._x, this._y, this._xPosition, this._length, this._thickness, this._color);
			if (this._jClockHitMarkers) {
				for (var s = 0; s < this._setTargets.length; s++) {
					this._content.bitmap.drawHand(this._x, this._y, this._setTargets[s], this._length, this._thickness, this._fadeColor);
				}
			}
		}
		this._content.bitmap.drawCircle(this._x, this._y, this._length / 10, this._baseColor);
		if (oldClockPaintOpacity !== undefined) this._content.bitmap.paintOpacity = oldClockPaintOpacity;

		this._jakeApplyVisualTransform(this._x, this._y);
		this._jakeUpdateOverlayText(null, this._x, this._y - (this._length || 0) - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(this._x, this._y);

		if (this._flashTime >= this._time && !this._notPressed) {
			this._content.bitmap.clear();
			BattleManager.endTASAttackThing();
			this.close();
		}

		if (this._jakeActivationTriggered() && this._notPressed && this._cooldown === 0) {
			if (this._targetCount > 0) this._targetCount--;
			this._setTargets.push(this._xPosition);
			AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
			if (this._targetCount <= 0) {
				this._notPressed = false;
				this.setPower(this._jakeResolveClockPower());
			}
		}
		if (this._cooldown > 0) this._cooldown--;
	};

	//-----------------------------------------------------------------------------
	// v2.3 Hotfixes + Parallel XTAs + Movement Extensions
	//-----------------------------------------------------------------------------

	J.splitTopLevelCsvAny = function(text) {
		var s = String(text || '').trim();
		if (!s.length) return [];
		var out = [];
		var cur = '';
		var square = 0;
		var round = 0;
		for (var i = 0; i < s.length; i++) {
			var ch = s.charAt(i);
			if (ch === '[') square++;
			else if (ch === ']' && square > 0) square--;
			else if (ch === '(') round++;
			else if (ch === ')' && round > 0) round--;

			if (ch === ',' && square === 0 && round === 0) {
				out.push(cur.trim());
				cur = '';
			} else {
				cur += ch;
			}
		}
		if (cur.length > 0) out.push(cur.trim());
		return out;
	};

	J.parseMovementValueSpec = function(raw, allowReset, defaultValue) {
		var s = String(raw || '').trim();
		if (!s.length) return {type:'fixed', value:defaultValue || 0};
		if (allowReset && /^reset$/i.test(s)) return {type:'reset'};
		var m = s.match(/^\(\s*([^,]+)\s*,\s*([^,]+)\s*\)$/);
		if (m) {
			return {
				type: 'range',
				min: J.toEvalNumber(m[1], defaultValue || 0),
				max: J.toEvalNumber(m[2], defaultValue || 0)
			};
		}
		return {type:'fixed', value:J.toEvalNumber(s, defaultValue || 0)};
	};

	J.resolveMovementValue = function(spec, asFrames) {
		if (!spec) return 0;
		if (spec.type === 'reset') return 0;
		if (spec.type === 'range') {
			var a = Number(spec.min || 0);
			var b = Number(spec.max || 0);
			if (isNaN(a)) a = 0;
			if (isNaN(b)) b = 0;
			if (a > b) {
				var t = a;
				a = b;
				b = t;
			}
			var v = a + (Math.random() * (b - a));
			if (asFrames) return Math.max(0, Math.floor(v));
			return v;
		}
		var n = Number(spec.value || 0);
		if (isNaN(n)) n = 0;
		if (asFrames) return Math.max(0, Math.floor(n));
		return n;
	};

	J.parseMovementSequence = function(raw) {
		var s = String(raw || '');
		var out = [];
		var re = /\[([^\]]*)\]/g;
		var m;
		while ((m = re.exec(s)) !== null) {
			var token = String(m[1] || '').trim();
			if (!token.length) continue;

			var ref = token.match(/^\*\s*(\d+)\s*$/i);
			if (ref) {
				out.push({type:'ref', pool: Math.max(1, Math.min(100, parseInt(ref[1]) || 1))});
				continue;
			}

			var parts = J.splitTopLevelCsvAny(token);
			if (parts.length < 2) continue;

			out.push({
				type: 'move',
				forceSpec: J.parseMovementValueSpec(parts[0], true, 0),
				timeSpec: J.parseMovementValueSpec(parts[1], false, 0)
			});
		}
		return out;
	};

	J.pickMovementToken = function(sequence, pools, indexRef, depth) {
		if (!sequence || !sequence.length) return null;
		var depthCount = depth || 0;
		if (depthCount > 10) return null;
		var tries = Math.max(1, sequence.length * 3);

		for (var i = 0; i < tries; i++) {
			var idx = indexRef.value;
			var tok = sequence[idx];
			indexRef.value = (idx + 1) % sequence.length;
			if (!tok) continue;

			if (tok.type === 'move') return tok;

			if (tok.type === 'ref') {
				var pool = pools ? pools[tok.pool] : null;
				if (!pool || !pool.length) continue;
				var choice = pool[Math.randomInt(pool.length)];
				if (!choice) continue;
				if (choice.type === 'move') return choice;
				if (choice.type === 'ref') {
					var tempRef = {value: 0};
					var nested = J.pickMovementToken([choice], pools, tempRef, depthCount + 1);
					if (nested) return nested;
				}
			}
		}

		return null;
	};

	J.createMovementState = function(sequence, pools) {
		return {
			sequence: sequence || [],
			pools: pools || {},
			indexRef: {value: 0},
			framesLeft: 0,
			currentForce: 0,
			currentReset: false
		};
	};

	J.stepMovementState = function(state, target, offsetKey) {
		if (!state || !state.sequence || !state.sequence.length || !target) return;

		if (state.framesLeft <= 0) {
			var tok = J.pickMovementToken(state.sequence, state.pools, state.indexRef, 0);
			if (!tok) return;
			state.currentReset = (tok.forceSpec && tok.forceSpec.type === 'reset');
			state.currentForce = state.currentReset ? 0 : J.resolveMovementValue(tok.forceSpec, false);
			state.framesLeft = J.resolveMovementValue(tok.timeSpec, true);
			if (state.currentReset) target[offsetKey] = 0;
			if (state.framesLeft <= 0) return;
		}

		if (!state.currentReset) {
			target[offsetKey] = J.toNumber(target[offsetKey], 0) + state.currentForce;
		}
		state.framesLeft = Math.max(0, state.framesLeft - 1);
	};

	// XParallel runtime moved to JakeMSG_SRD_TimedAttackAdditions_XParallel.

	TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones = function() {
		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._xSpeed);
			var minX = -(this._item.width || 0);
			var maxX = this.windowWidth();
			if (this._xPosition > maxX || this._xPosition < minX) {
				if (this._jBarRepeat) {
					var infinite = (this._jBarRepeatAmount === -1);
					var canRepeat = infinite || (this._jBarRepeatCount < this._jBarRepeatAmount);
					if (!canRepeat) {
						this._jakeFinalizeDefaultCustom(false);
					} else {
						this._jBarRepeatCount++;
						if (this._jBarRepeatBounce) {
							this._xSpeed *= (-1);
							this._xPosition = J.clamp(this._xPosition, minX, maxX);
						} else {
							this._xPosition = this._origin;
							this._xSpeed = this._jBarStartSpeed;
						}
					}
				} else {
					this._jakeFinalizeDefaultCustom(false);
				}
			}
			this._jakeUpdateDefaultHitzoneMovements();
		} else {
			this._flashTime++;
		}

		if (this._flashTime >= 45) {
			BattleManager.endTASAttackThing();
			this.close();
			return;
		}

		this._window.contents.clear();
		var totalWidth = this.windowWidth();
		var contentWidth = this._window.contentsWidth();
		var contentHeight = this._window.contentsHeight();
		var scaleRatio = contentWidth / Math.max(totalWidth, 1);
		var barHeight = Math.max(2, Math.floor(this._jBarThickness || 16));
		var barY = Math.floor((contentHeight - barHeight) / 2);
		var shape = String(this._jBarShape || this._shape || '').trim().toLowerCase();
		var isOvalBar = (shape === 'oval');

		if (isOvalBar) {
			this._jakeDrawCapsule(this._window.contents, 0, barY, contentWidth, barHeight, this._jBarBackgroundColor || '#ffffff');
		} else {
			this._window.contents.fillRect(0, barY, contentWidth, barHeight, this._jBarBackgroundColor || '#ffffff');
		}

		for (var i = 0; i < this._jHitzones.length; i++) {
			var zone = this._jHitzones[i];
			if (!zone || !zone.initialized) continue;
			var m = J.getHitzoneMetrics(zone, totalWidth);

			var closeStart = (m.center - m.hitLeft - m.closeLeft) * scaleRatio;
			var closeEnd = (m.center + m.hitRight + m.closeRight) * scaleRatio;
			var closeWidth = Math.floor(closeEnd - closeStart);
			if (closeWidth > 0) {
				if (isOvalBar) this._jakeDrawCapsule(this._window.contents, Math.floor(closeStart), barY, closeWidth, barHeight, zone.closeColor);
				else this._window.contents.fillRect(Math.floor(closeStart), barY, closeWidth, barHeight, zone.closeColor);
			}

			var hitStart = (m.center - m.hitLeft) * scaleRatio;
			var hitEnd = (m.center + m.hitRight) * scaleRatio;
			var hitWidth = Math.floor(hitEnd - hitStart);
			if (hitWidth > 0) {
				if (isOvalBar) this._jakeDrawCapsule(this._window.contents, Math.floor(hitStart), barY, hitWidth, barHeight, zone.hitColor);
				else this._window.contents.fillRect(Math.floor(hitStart), barY, hitWidth, barHeight, zone.hitColor);
			}
		}

		if (this._jBarHitMarkersEnabled && this._jBarMarkers && this._jBarMarkers.length > 0) {
			var oldOpacity = this._window.contents.paintOpacity;
			this._window.contents.paintOpacity = this._jBarHitMarkerOpacity;
			for (var mIdx = 0; mIdx < this._jBarMarkers.length; mIdx++) {
				this._jakeDrawDefaultCustomCursor(this._jBarMarkers[mIdx] * scaleRatio, barY, barHeight, scaleRatio);
			}
			this._window.contents.paintOpacity = oldOpacity;
		}

		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			this._jakeDrawDefaultCustomCursor(this._xPosition * scaleRatio, barY, barHeight, scaleRatio);
		}

		if (this._jakeActivationTriggered() && this._notPressed) {
			var hitData = this._jakeEvaluateDefaultHitData(this._xPosition, totalWidth);
			if (this._jBarPowerValue === 'multiple hits') {
				this._jBarHitPowers[this._jBarHitsDone + 1] = hitData.sum;
			} else {
				for (var z = 1; z < hitData.zonePowers.length; z++) {
					if (hitData.zonePowers[z] > 0) this._jBarZonePowers[z] = hitData.zonePowers[z];
				}
			}

			this._jakePushBarMarker(this._xPosition);
			this._jBarHitsDone++;
			AudioManager.playSe({"name":this._se,"pan":0,"pitch":100,"volume":100});

			if (this._jBarRequiredHits !== -1 && this._jBarHitsDone >= this._jBarRequiredHits) {
				this._jakeFinalizeDefaultCustom(true);
			}
		}

		var centerX = this._window.x + (this._window.width / 2);
		var centerY = this._window.y + (this._window.height / 2);
		this._jakeApplyVisualTransform(centerX, centerY);
		this._jakeUpdateOverlayText(null, centerX, this._window.y - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(centerX, centerY);
	};

	J.copyTasPower = function(value) {
		if (Array.isArray(value)) return J.deepClone(value);
		return value;
	};

	J.syncQteTempValues = function() {
		if (!$gameTemp) return;
		$gameTemp.qte_power = J.copyTasPower($gameTemp.tas_power);
		$gameTemp.qte_frames_left = Math.max(0, Math.floor(Number($gameTemp.tas_frames_left || 0)));
		$gameTemp.qte_seconds_left = Math.max(0, Math.floor(Number($gameTemp.tas_seconds_left || 0)));
	};

	if (typeof Game_Temp !== 'undefined') {
		var _Game_Temp_initialize_v22_qte = Game_Temp.prototype.initialize;
		Game_Temp.prototype.initialize = function() {
			_Game_Temp_initialize_v22_qte.call(this);
			if (this.qte_power === undefined) this.qte_power = 0;
			if (this.qte_frames_left === undefined) this.qte_frames_left = 0;
			if (this.qte_seconds_left === undefined) this.qte_seconds_left = 0;
		};
	}

	var _jSetPower_v22 = TimedAttackSystem.prototype.setPower;
	TimedAttackSystem.prototype.setPower = function(value) {
		_jSetPower_v22.call(this, value);
		J.syncQteTempValues();
	};

	if (typeof Game_Action !== 'undefined' && Game_Action.prototype.evalDamageFormula) {
		var _Game_Action_evalDamageFormula_v22 = Game_Action.prototype.evalDamageFormula;
		Game_Action.prototype.evalDamageFormula = function(target) {
			var value = _Game_Action_evalDamageFormula_v22.call(this, target);
			var item = this.item ? this.item() : null;
			if (item && item.meta && item.meta['SRD TAS']) {
				J.syncQteTempValues();
			}
			return value;
		};
	}

	J.runCurrentActionFormulaOnly = function() {
		if (typeof BattleManager === 'undefined' || !BattleManager) return;
		var pass = (SRD && SRD.TimedAttack && SRD.TimedAttack.pass) ? SRD.TimedAttack.pass : 'SumRndmDde Timed Attack Core';

		var action = BattleManager._action;
		if (!action && BattleManager._subject && BattleManager._subject.currentAction) action = BattleManager._subject.currentAction();
		if (!action && BattleManager[pass + 'Temp Action']) action = BattleManager[pass + 'Temp Action'];
		if (!action || !action.evalDamageFormula) {
			J.syncQteTempValues();
			return;
		}

		var targets = [];
		if (BattleManager._targets && BattleManager._targets.length) targets = BattleManager._targets.slice();
		if (!targets.length && BattleManager[pass + 'Temp Targets']) targets = BattleManager[pass + 'Temp Targets'].slice();
		if (!targets.length && action.makeTargets) {
			try {
				targets = action.makeTargets();
			} catch (e) {
				targets = [];
			}
		}
		if (!targets.length && BattleManager._subject) targets = [BattleManager._subject];

		for (var i = 0; i < targets.length; i++) {
			try {
				action.evalDamageFormula(targets[i]);
			} catch (e2) {
			}
		}

		J.syncQteTempValues();
	};

	J.runStandaloneSkillFormula = function(skill) {
		if (!skill || typeof Game_Action === 'undefined') {
			J.syncQteTempValues();
			return;
		}

		var subject = null;
		if ($gameParty && $gameParty.members && $gameParty.members().length > 0) subject = $gameParty.members()[0];
		if (!subject && $gameActors && $gameActors.actor) subject = $gameActors.actor(1);
		if (!subject) {
			J.syncQteTempValues();
			return;
		}

		var action = new Game_Action(subject, false);
		action.setSkill(skill.id);

		var targets = [];
		try {
			targets = action.makeTargets();
		} catch (e) {
			targets = [];
		}
		if (!targets || !targets.length) targets = [subject];

		for (var i = 0; i < targets.length; i++) {
			try {
				action.evalDamageFormula(targets[i]);
			} catch (e2) {
			}
		}

		J.syncQteTempValues();
	};

	J._skipSkillUseAfterTA = false;

	J.tryConsumeSkipSkillUse = function(manager) {
		if (!J._skipSkillUseAfterTA) return false;
		J._skipSkillUseAfterTA = false;
		if (manager && manager._subject) {
			manager.endAction();
			return true;
		}
		return false;
	};

	if (typeof BattleManager !== 'undefined' && BattleManager.updatePhase) {
		var _BattleManager_updatePhase_v22_skip = BattleManager.updatePhase;
		BattleManager.updatePhase = function() {
			if (J.tryConsumeSkipSkillUse(this)) return;
			_BattleManager_updatePhase_v22_skip.call(this);
		};
	}

	if (typeof BattleManager !== 'undefined' && BattleManager.updateAction) {
		var _BattleManager_updateAction_v22_skip = BattleManager.updateAction;
		BattleManager.updateAction = function() {
			if (J.tryConsumeSkipSkillUse(this)) return;
			_BattleManager_updateAction_v22_skip.call(this);
		};
	}

	if (typeof BattleManager !== 'undefined' && BattleManager.endTASAttackThing) {
		var _BattleManager_endTASAttackThing_v22 = BattleManager.endTASAttackThing;
		BattleManager.endTASAttackThing = function() {
			var pass = (SRD && SRD.TimedAttack && SRD.TimedAttack.pass) ? SRD.TimedAttack.pass : 'SumRndmDde Timed Attack Core';
			if (!this[pass + 'Allow TAS']) this[pass + 'Allow TAS'] = [true, true];
			_BattleManager_endTASAttackThing_v22.call(this);
		};
	}

	J.makeForceTABattleContext = function() {
		if ($gameParty && $gameParty.inBattle && $gameParty.inBattle()) return null;
		if (typeof BattleManager === 'undefined') return null;

		var backup = {
			subject: BattleManager._subject,
			targets: BattleManager._targets,
			spriteset: BattleManager._spriteset
		};

		BattleManager._subject = {
			index: function() { return 0; },
			isActor: function() { return true; },
			currentAction: function() { return null; }
		};

		BattleManager._targets = [{
			isEnemy: function() { return true; },
			screenX: function() { return Graphics.width / 2; },
			screenY: function() { return Graphics.height / 2; }
		}];

		BattleManager._spriteset = {
			_actorSprites: [{x: Graphics.width / 2, y: Graphics.height / 2, width: 48, height: 48, _actor: null}],
			_enemySprites: [{height: 48}]
		};

		return backup;
	};

	J.restoreForceTABattleContext = function(backup) {
		if (!backup || typeof BattleManager === 'undefined') return;
		BattleManager._subject = backup.subject;
		BattleManager._targets = backup.targets;
		BattleManager._spriteset = backup.spriteset;
	};

	var _jClose_v22 = TimedAttackSystem.prototype.close;
	TimedAttackSystem.prototype.close = function() {
		var forced = !!this._jForceTAStandalone;
		var forceSkill = this._jForceTASkill || null;
		var forceBackup = this._jForceTABattleBackup || null;

		if (forced) {
			if (forceSkill) J.runStandaloneSkillFormula(forceSkill);
		} else if (this._jNoSkillUse) {
			J.runCurrentActionFormulaOnly();
			J._skipSkillUseAfterTA = true;
		}

		_jClose_v22.call(this);

		if (forced) {
			if (forceBackup) J.restoreForceTABattleContext(forceBackup);
			if (this.parent) this.parent.removeChild(this);
		}

		this._jForceTAStandalone = false;
		this._jForceTASkill = null;
		this._jForceTABattleBackup = null;
	};

	J.forceTA = function(skillId, tempNotesTA) {
		var sid = (skillId === undefined || skillId === null) ? 1 : parseInt(skillId);
		if (isNaN(sid) || sid <= 0) sid = 1;

		if (!$dataSkills || !$dataSkills[sid]) return false;
		var skill = $dataSkills[sid];
		if (!skill.meta || !skill.meta['SRD TAS']) return false;

		var taData = J.deepClone(skill.meta['SRD TAS']);
		if (tempNotesTA !== undefined && tempNotesTA !== null && String(tempNotesTA).trim().length > 0) {
			var tempNotes = String(tempNotesTA);
			if ($gameMap && $gameMap.NotesProcChangeTA) {
				$gameMap.NotesProcChangeTA(taData, tempNotes);
			} else {
				J.applyExtendedProps(taData, tempNotes, true);
			}
		}
		taData.jakeNoSkillUse = true;

		if (!SceneManager || !SceneManager._scene || !SceneManager._scene.addChild) return false;

		var tas = new TimedAttackSystem(0, 0);
		tas._jForceTAStandalone = true;
		tas._jForceTASkill = skill;
		tas._jForceTABattleBackup = J.makeForceTABattleContext();

		SceneManager._scene.addChild(tas);
		tas.setItem(taData);
		tas.open();
		tas.start();
		return true;
	};

	if (typeof globalThis !== 'undefined') {
		globalThis.changeTA = function(arg1, arg2, arg3) {
			if (!($gameMap && $gameMap.changeTA)) return false;

			var legacyType = null;
			if (arguments.length >= 3) {
				legacyType = (arg1 === undefined || arg1 === null) ? 'skill' : String(arg1);
			}

			if (legacyType !== null) {
				var legacyId = parseInt((arg2 === undefined || arg2 === null) ? 1 : arg2);
				if (isNaN(legacyId) || legacyId <= 0) legacyId = 1;
				var legacyNotes = (arg3 === undefined || arg3 === null) ? '' : String(arg3);
				$gameMap.changeTA(legacyType, legacyId, legacyNotes);
				return true;
			}

			var skillId = parseInt((arg1 === undefined || arg1 === null) ? 1 : arg1);
			if (isNaN(skillId) || skillId <= 0) skillId = 1;
			var notes = (arg2 === undefined || arg2 === null) ? '' : String(arg2);
			$gameMap.changeTA('skill', skillId, notes);
			return true;
		};

		globalThis.forceTA = function(skillId, tempNotesTA) {
			return J.forceTA(skillId, tempNotesTA);
		};
	}

	//-----------------------------------------------------------------------------
	// v2.2 Parser, Runtime, and Script-Call Overrides
	//-----------------------------------------------------------------------------

	J._withVisualAngleAliasPattern = function(pattern) {
		var p = String(pattern || '');
		if (!p.length) return p;
		if (p.indexOf('Visual[ ]?Angle') >= 0) return p;
		if (p.indexOf('Angle[ ]?Offset') >= 0) {
			return p.split('Angle[ ]?Offset').join('(?:Angle[ ]?Offset|Visual[ ]?Angle)');
		}
		if (p.indexOf('Angle') >= 0) {
			return p.split('Angle').join('(?:Angle|Visual[ ]?Angle)');
		}
		return p;
	};

	J._valueRegex = function(pattern, semicolonMode) {
		var body = semicolonMode ? '([^;]*)(?:;|$)' : '([^\\n\\r]*)';
		var effectivePattern = J._withVisualAngleAliasPattern(pattern);
		return new RegExp('(?:^|[;\\n\\r])\\s*(?:' + effectivePattern + ')\\s*(?::|=)\\s*' + body, 'ig');
	};

	J.normalizePropertyAssignments = function(source) {
		var text = String(source || '');
		return text.replace(/(^|[;\n\r])\s*([^;:=\n\r<>][^:=\n\r]*?)\s*=\s*/g, function(_, lead, name) {
			return lead + String(name || '').trim() + ': ';
		});
	};

	J.getValueInfo = function(source, pattern, semicolonMode, useLast) {
		var text = String(source || '');
		var re = J._valueRegex(pattern, semicolonMode);
		var m;
		var picked = null;
		while ((m = re.exec(text)) !== null) {
			picked = {
				value: String(m[1]).trim(),
				index: m.index
			};
			if (!useLast) break;
		}
		return picked;
	};

	J.getValue = function(source, pattern, semicolonMode) {
		var info = J.getValueInfo(source, pattern, semicolonMode, false);
		return info ? info.value : null;
	};

	J.getLastValue = function(source, pattern, semicolonMode) {
		var info = J.getValueInfo(source, pattern, semicolonMode, true);
		return info ? info.value : null;
	};

	J.getFirstValue = function(source, patterns, semicolonMode) {
		for (var i = 0; i < patterns.length; i++) {
			var v = J.getValue(source, patterns[i], semicolonMode);
			if (v !== null) return v;
		}
		return null;
	};

	J.splitTopLevelCsv = function(text) {
		var s = String(text || '').trim();
		if (!s.length) return [];
		var out = [];
		var cur = '';
		var depth = 0;
		for (var i = 0; i < s.length; i++) {
			var ch = s.charAt(i);
			if (ch === '[') depth++;
			if (ch === ']' && depth > 0) depth--;
			if (ch === ',' && depth === 0) {
				out.push(cur.trim());
				cur = '';
			} else {
				cur += ch;
			}
		}
		if (cur.length > 0) out.push(cur.trim());
		return out;
	};

	J.parseBracketSingle = function(raw) {
		var m = String(raw || '').trim().match(/^\[\s*(.*?)\s*\]$/);
		if (!m) return null;
		return J.toEvalNumber(m[1], 0);
	};

	J.parseBracketPair = function(raw) {
		var m = String(raw || '').trim().match(/^\[\s*(.*?)\s*,\s*(.*?)\s*\]$/);
		if (!m) return null;
		return [Math.max(0, J.toEvalNumber(m[1], 0)), Math.max(0, J.toEvalNumber(m[2], 0))];
	};

	J.defaultHitzones = function() {
		var list = [];
		for (var i = 0; i < 20; i++) {
			list.push({
				position: 0,
				positionMode: 'relative',
				absoluteX: 0,
				hitArea: 0,
				closeArea: 0,
				hitLeft: 0,
				hitRight: 0,
				closeLeft: 0,
				closeRight: 0,
				hitColor: '#ffffff',
				closeColor: '#ffffff',
				initialized: i === 0
			});
		}
		return list;
	};

	J.parseHitzone = function(raw) {
		var out = {
			position: 0,
			positionMode: 'relative',
			absoluteX: 0,
			hitArea: 0,
			closeArea: 0,
			hitLeft: 0,
			hitRight: 0,
			closeLeft: 0,
			closeRight: 0,
			hitColor: '#ffffff',
			closeColor: '#ffffff',
			initialized: false
		};
		if (raw === undefined || raw === null || String(raw).trim() === '') return out;

		var parts = J.splitTopLevelCsv(raw);
		out.initialized = true;

		if (parts.length > 0) {
			var posBracket = J.parseBracketSingle(parts[0]);
			if (posBracket !== null) {
				out.positionMode = 'absolute';
				out.absoluteX = Math.max(0, posBracket);
			} else {
				out.positionMode = 'relative';
				out.position = J.clamp(J.toNumber(parts[0], 0), -1, 1);
			}
		}

		if (parts.length > 1) {
			var hitPair = J.parseBracketPair(parts[1]);
			if (hitPair) {
				out.hitLeft = hitPair[0];
				out.hitRight = hitPair[1];
				var hitArea = Math.max(out.hitLeft, out.hitRight);
				out.hitArea = hitArea;
			} else {
				out.hitArea = Math.max(0, parseInt(parts[1]) || 0);
				out.hitLeft = out.hitArea;
				out.hitRight = out.hitArea;
			}
		}

		if (parts.length > 2) {
			var closePair = J.parseBracketPair(parts[2]);
			if (closePair) {
				out.closeLeft = closePair[0];
				out.closeRight = closePair[1];
				out.closeArea = Math.max(out.closeLeft, out.closeRight);
			} else {
				out.closeArea = Math.max(0, parseInt(parts[2]) || 0);
				out.closeLeft = out.closeArea;
				out.closeRight = out.closeArea;
			}
		}

		if (parts.length > 3 && parts[3] !== '') out.hitColor = String(parts[3]);
		if (parts.length > 4 && parts[4] !== '') out.closeColor = String(parts[4]);
		return out;
	};

	J.getHitzoneMetrics = function(zone, totalWidth) {
		var z = zone || {};
		var center = 0;
		if (String(z.positionMode || 'relative') === 'absolute') {
			center = Math.max(0, J.toNumber(z.absoluteX, 0));
		} else {
			center = (totalWidth / 2) + (J.toNumber(z.position, 0) * (totalWidth / 2));
		}
		var hl = Math.max(0, J.toNumber(z.hitLeft, J.toNumber(z.hitArea, 0)));
		var hr = Math.max(0, J.toNumber(z.hitRight, J.toNumber(z.hitArea, 0)));
		var cl = Math.max(0, J.toNumber(z.closeLeft, J.toNumber(z.closeArea, 0)));
		var cr = Math.max(0, J.toNumber(z.closeRight, J.toNumber(z.closeArea, 0)));
		return {
			center: center,
			hitLeft: hl,
			hitRight: hr,
			closeLeft: cl,
			closeRight: cr
		};
	};

	J.clampHitzoneOffsetToBar = function(zone, totalWidth, offset) {
		if (!zone) return J.toNumber(offset, 0);
		var width = Math.max(1, J.toNumber(totalWidth, 1));
		var baseCenter = 0;
		if (String(zone.positionMode || 'relative') === 'absolute') {
			baseCenter = Math.max(0, J.toNumber(zone.absoluteX, 0));
		} else {
			baseCenter = (width / 2) + (J.toNumber(zone.position, 0) * (width / 2));
		}

		var hl = Math.max(0, J.toNumber(zone.hitLeft, J.toNumber(zone.hitArea, 0)));
		var hr = Math.max(0, J.toNumber(zone.hitRight, J.toNumber(zone.hitArea, 0)));
		var cl = Math.max(0, J.toNumber(zone.closeLeft, J.toNumber(zone.closeArea, 0)));
		var cr = Math.max(0, J.toNumber(zone.closeRight, J.toNumber(zone.closeArea, 0)));

		var minCenter = hl + cl;
		var maxCenter = width - (hr + cr);
		if (maxCenter < minCenter) {
			var half = width / 2;
			minCenter = half;
			maxCenter = half;
		}

		var desiredCenter = baseCenter + J.toNumber(offset, 0);
		var clampedCenter = J.clamp(desiredCenter, minCenter, maxCenter);
		return clampedCenter - baseCenter;
	};

	J.evaluateHitzonePower = function(zone, cursorX, totalWidth) {
		if (!zone || !zone.initialized) return 0;
		var m = J.getHitzoneMetrics(zone, totalWidth);
		var d = cursorX - m.center;

		if (d >= -m.hitLeft && d <= m.hitRight) return 1;

		if (d < -m.hitLeft && m.closeLeft > 0 && d >= -(m.hitLeft + m.closeLeft)) {
			return J.clamp(1 - ((-m.hitLeft - d) / m.closeLeft), 0, 1);
		}

		if (d > m.hitRight && m.closeRight > 0 && d <= (m.hitRight + m.closeRight)) {
			return J.clamp(1 - ((d - m.hitRight) / m.closeRight), 0, 1);
		}

		return 0;
	};

	J.parseClockTarget = function(raw) {
		if (Array.isArray(raw)) {
			if (raw.length < 4) return null;
			var arrStart = parseInt(J.toEvalNumber(raw[0], 0));
			var arrEnd = parseInt(J.toEvalNumber(raw[1], 0));
			var arrColor = String(raw[2] || '#ffffff').trim();
			var arrPower = Number(J.toEvalNumber(raw[3], 0));
			if (isNaN(arrPower)) arrPower = 0;
			return [arrStart, arrEnd, arrColor, arrPower];
		}

		var s = String(raw || '').trim();
		if (!s.length) return null;
		var m = s.match(/^\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(rgba?\([^\)]*\)|[^,]+)\s*,\s*([^,]+?)(?:\s*,.*)?\s*$/i);
		if (!m) return null;

		var start = parseInt(J.toEvalNumber(m[1], 0));
		var end = parseInt(J.toEvalNumber(m[2], 0));
		var color = String(m[3] || '#ffffff').trim();
		var power = Number(J.toEvalNumber(m[4], 0));
		if (isNaN(power)) power = 0;
		return [start, end, color, power];
	};

	J.normalizeAngle = function(angle) {
		var a = J.toNumber(angle, 0) % 360;
		if (a < 0) a += 360;
		return a;
	};

	J.angleInRange = function(angle, start, end) {
		var a = J.normalizeAngle(angle);
		var s = J.normalizeAngle(start);
		var e = J.normalizeAngle(end);
		if (s <= e) return a >= s && a <= e;
		return a >= s || a <= e;
	};

	J.forwardAngleDistance = function(fromAngle, toAngle) {
		var f = J.normalizeAngle(fromAngle);
		var t = J.normalizeAngle(toAngle);
		return (t - f + 360) % 360;
	};

	J.drawClockSliceDegrees = function(bitmap, x, y, radius, startDeg, endDeg, color) {
		if (!bitmap || !bitmap.drawPizzaSlice) return;
		var sRaw = J.toNumber(startDeg, 0);
		var eRaw = J.toNumber(endDeg, 0);
		var span = eRaw - sRaw;
		if (Math.abs(span) < 0.000001) return;

		if (Math.abs(span) >= 360) {
			bitmap.drawPizzaSlice(x, y, radius, 0, Math.PI * 2, color);
			return;
		}

		var s = J.normalizeAngle(sRaw);
		var e = J.normalizeAngle(eRaw);
		if (J.forwardAngleDistance(s, e) <= 0) return;

		if (s <= e) {
			bitmap.drawPizzaSlice(x, y, radius, s * (Math.PI / 180), e * (Math.PI / 180), color);
		} else {
			bitmap.drawPizzaSlice(x, y, radius, s * (Math.PI / 180), 2 * Math.PI, color);
			bitmap.drawPizzaSlice(x, y, radius, 0, e * (Math.PI / 180), color);
		}
	};

	J.clockPixelsToDegrees = function(pixels, radius) {
		var px = Math.max(0, J.toNumber(pixels, 0));
		var r = Math.max(1, J.toNumber(radius, 1));
		return (px * 180) / (Math.PI * r);
	};
	
	J.evaluateClockTargetPower = function(target, angle, radius) {
		if (!target) return 0;
		var start = J.normalizeAngle(target[0]);
		var end = J.normalizeAngle(target[1]);
		var power = J.toNumber(target[3], 0);
		var a = J.normalizeAngle(angle);
		if (J.angleInRange(a, start, end)) return power;
		return 0;
	};

	var _jApplyGeneralProps_v22 = J.applyGeneralProps;
	J.applyGeneralProps = function(o, source, semicolonMode) {
		_jApplyGeneralProps_v22.call(this, o, source, semicolonMode);
		var v = J.getValue(source, 'No[ ]?Skill[ ]?Use', semicolonMode);
		if (v !== null) o.jakeNoSkillUse = J.parseBool(v, false);
		else if (o.jakeNoSkillUse === undefined) o.jakeNoSkillUse = false;

		if (o && o.type === 'circle') {
			var dCircleHitKeys = J.parseKeyCodeList(params['Circle Hit Keys'], [13, 90, -1]);
			v = J.getValue(source, 'Hit[ ]?keys?', semicolonMode);
			if (v !== null) o.jakeCircleHitKeys = J.parseKeyCodeList(v, dCircleHitKeys);
			else if (o.jakeCircleHitKeys === undefined) o.jakeCircleHitKeys = dCircleHitKeys.slice(0);
		}

		if (o && o.type === 'clock') {
			var dClockHitKeys = J.parseKeyCodeList(params['Clock Hit Keys'], [13, 90, -1]);
			v = J.getValue(source, 'Hit[ ]?keys?', semicolonMode);
			if (v !== null) o.jakeClockHitKeys = J.parseKeyCodeList(v, dClockHitKeys);
			else if (o.jakeClockHitKeys === undefined) o.jakeClockHitKeys = dClockHitKeys.slice(0);
		}
	};

	var _jApplyDefaultProps_v22 = J.applyDefaultProps;
	J.applyDefaultProps = function(o, source, semicolonMode) {
		_jApplyDefaultProps_v22.call(this, o, source, semicolonMode);
		if (!o || o.type !== SRD.TimedAttack.TAS_ID) return;

		var v = J.getValue(source, 'Repeat[ ]?amount', semicolonMode);
		if (v !== null) {
			var repeatAmount = parseInt(v);
			o.jakeBarRepeatAmount = isNaN(repeatAmount) ? 0 : repeatAmount;
		} else if (o.jakeBarRepeatAmount === undefined) {
			o.jakeBarRepeatAmount = 0;
		}

		v = J.getValue(source, 'Incomplete[ ]?Value', semicolonMode);
		if (v !== null) o.jakeBarIncompleteValue = J.parseBool(v, true);
		else if (o.jakeBarIncompleteValue === undefined) o.jakeBarIncompleteValue = true;

		if (!o.jakeHitzones) o.jakeHitzones = J.defaultHitzones();
		for (var i = 1; i <= 20; i++) {
			v = J.getValue(source, 'Hitzone[ ]?' + i, semicolonMode);
			if (v !== null) o.jakeHitzones[i - 1] = J.parseHitzone(v);
		}
	};

	var _jApplyMashProps_v22 = J.applyMashProps;
	J.applyMashProps = function(o, source, semicolonMode) {
		_jApplyMashProps_v22.call(this, o, source, semicolonMode);
		if (!o || o.type !== 'mash') return;

		var fInfo = J.getValueInfo(source, 'Frames', semicolonMode, true);
		var sInfo = J.getValueInfo(source, 'Seconds', semicolonMode, true);
		if (fInfo || sInfo) {
			if (!sInfo || (fInfo && fInfo.index > sInfo.index)) {
				o.jakeMashFrames = Math.max(0, parseInt(fInfo.value) || 0);
				o.jakeMashSeconds = 0;
				o.jakeMashTimeMode = 'frames';
			} else {
				o.jakeMashSeconds = Math.max(0, parseInt(sInfo.value) || 0);
				o.jakeMashFrames = 0;
				o.jakeMashTimeMode = 'seconds';
			}
		} else if (!o.jakeMashTimeMode) {
			o.jakeMashTimeMode = (o.jakeMashFrames > 0) ? 'frames' : 'seconds';
		}

		var v = J.getValue(source, 'Invalid[ ]?Tap[ ]?Loss', semicolonMode);
		if (v !== null) o.jakeMashInvalidTapLoss = Math.max(0, J.toEvalNumber(v, 0));
		else if (o.jakeMashInvalidTapLoss === undefined) o.jakeMashInvalidTapLoss = 0;

		v = J.getValue(source, 'Stop[ ]?Key[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeStopKeyXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeStopKeyXOffset === undefined) o.jakeStopKeyXOffset = 0;

		v = J.getValue(source, 'Stop[ ]?Key[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeStopKeyYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeStopKeyYOffset === undefined) o.jakeStopKeyYOffset = 0;

		v = J.getFirstValue(source, ['Stop[ ]?Key[ ]?Angle', 'Stop[ ]?Key[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeStopKeyAngle = J.toEvalNumber(v, 0);
		else if (o.jakeStopKeyAngle === undefined) o.jakeStopKeyAngle = 0;

		v = J.getValue(source, 'Stop[ ]?Key[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeStopKeyScaleX = J.toEvalNumber(v, 1.0);
		else if (o.jakeStopKeyScaleX === undefined) o.jakeStopKeyScaleX = 1.0;

		v = J.getValue(source, 'Stop[ ]?Key[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeStopKeyScaleY = J.toEvalNumber(v, 1.0);
		else if (o.jakeStopKeyScaleY === undefined) o.jakeStopKeyScaleY = 1.0;

		v = J.getValue(source, 'Independent[ ]?Stop[ ]?Key[ ]?Icon', semicolonMode);
		if (v !== null) o.jakeIndependentStopKeyIcon = J.parseBool(v, false);
		else if (o.jakeIndependentStopKeyIcon === undefined) o.jakeIndependentStopKeyIcon = false;
	};

	var _jApplyArrowsProps_v22 = J.applyArrowsProps;
	J.applyArrowsProps = function(o, source, semicolonMode) {
		_jApplyArrowsProps_v22.call(this, o, source, semicolonMode);
		if (!o || o.type !== 'arrows') return;

		var fInfo = J.getValueInfo(source, 'Frames', semicolonMode, true);
		var sInfo = J.getValueInfo(source, 'Seconds', semicolonMode, true);
		if (fInfo || sInfo) {
			if (!sInfo || (fInfo && fInfo.index > sInfo.index)) {
				o.jakeArrowFrames = Math.max(0, parseInt(fInfo.value) || 0);
				o.jakeArrowSeconds = 0;
				o.jakeArrowTimeMode = 'frames';
			} else {
				o.jakeArrowSeconds = Math.max(0, parseInt(sInfo.value) || 0);
				o.jakeArrowFrames = 0;
				o.jakeArrowTimeMode = 'seconds';
			}
		} else if (!o.jakeArrowTimeMode) {
			o.jakeArrowTimeMode = (o.jakeArrowFrames > 0) ? 'frames' : 'seconds';
		}

		var v = J.getValue(source, 'Timeless', semicolonMode);
		if (v !== null) o.jakeArrowTimeless = J.parseBool(v, false);
		else if (o.jakeArrowTimeless === undefined) o.jakeArrowTimeless = false;

		v = J.getValue(source, 'Ignore[ ]?Keys?[ ]?for[ ]?Invalid', semicolonMode);
		if (v !== null) o.jakeArrowIgnoreInvalidKeys = String(v || '');
		else if (o.jakeArrowIgnoreInvalidKeys === undefined) o.jakeArrowIgnoreInvalidKeys = '';

		var dShown = parseInt(params['Arrows Shown Keys']);
		if (isNaN(dShown)) dShown = -1;
		if (dShown < -1) dShown = -1;
		var dUnshown = parseInt(params['Arrows Unshown Keys']);
		if (isNaN(dUnshown)) dUnshown = -1;
		if (dUnshown < -1) dUnshown = -1;
		var dUnshownImage = String(params['Arrows Unshown Rectangle Image'] || '').trim();
		var dUnshownColor = String(params['Arrows Unshown Rectangle Color'] || '#000000').trim();
		if (!dUnshownColor.length) dUnshownColor = '#000000';

		v = J.getValue(source, 'Shown[ ]?Keys?', semicolonMode);
		if (v !== null) {
			o.jakeArrowShownKeys = parseInt(v);
			if (isNaN(o.jakeArrowShownKeys)) o.jakeArrowShownKeys = dShown;
			if (o.jakeArrowShownKeys < -1) o.jakeArrowShownKeys = -1;
		} else if (o.jakeArrowShownKeys === undefined) {
			o.jakeArrowShownKeys = dShown;
		}

		v = J.getValue(source, 'Unshown[ ]?Keys?', semicolonMode);
		if (v !== null) {
			o.jakeArrowUnshownKeys = parseInt(v);
			if (isNaN(o.jakeArrowUnshownKeys)) o.jakeArrowUnshownKeys = dUnshown;
			if (o.jakeArrowUnshownKeys < -1) o.jakeArrowUnshownKeys = -1;
		} else if (o.jakeArrowUnshownKeys === undefined) {
			o.jakeArrowUnshownKeys = dUnshown;
		}

		v = J.getValue(source, 'Unshown[ ]?Rectangle[ ]?Image', semicolonMode);
		if (v !== null) o.jakeArrowUnshownRectImage = String(v || '').trim();
		else if (o.jakeArrowUnshownRectImage === undefined) o.jakeArrowUnshownRectImage = dUnshownImage;

		v = J.getValue(source, 'Unshown[ ]?Rectangle[ ]?Colou?r', semicolonMode);
		if (v !== null) {
			o.jakeArrowUnshownRectColor = String(v || '').trim();
			if (!o.jakeArrowUnshownRectColor.length) o.jakeArrowUnshownRectColor = '#000000';
		} else if (o.jakeArrowUnshownRectColor === undefined) {
			o.jakeArrowUnshownRectColor = dUnshownColor;
		}
	};

	var _jApplyClockTargets_v22 = J.applyClockTargets;
	J.applyClockTargets = function(o, source, semicolonMode) {
		_jApplyClockTargets_v22.call(this, o, source, semicolonMode);
		if (!o || o.type !== 'clock') return;

		var v = J.getValue(source, 'Incomplete[ ]?Value', semicolonMode);
		if (v !== null) o.jakeClockIncompleteValue = J.parseBool(v, true);
		else if (o.jakeClockIncompleteValue === undefined) o.jakeClockIncompleteValue = true;
	};

	var _jBuildZeroHitzoneArray_v22 = TimedAttackSystem.prototype._jakeBuildZeroHitzoneArray;
	TimedAttackSystem.prototype._jakeBuildZeroHitzoneArray = function() {
		var count = (this._jHitzones && this._jHitzones.length) ? this._jHitzones.length : 20;
		var arr = [0];
		for (var i = 0; i < count; i++) arr[i + 1] = 0;
		return arr;
	};

	TimedAttackSystem.prototype._jakeEnsureStopKeyLayer = function() {
		var root = this._jakeOverlayRoot();
		if (!this._jakeStopKeyLayer) {
			this._jakeStopKeyLayer = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		}
		if (this._jakeStopKeyLayer.parent !== root) root.addChild(this._jakeStopKeyLayer);
		root.setChildIndex(this._jakeStopKeyLayer, root.children.length - 1);
	};

	TimedAttackSystem.prototype._jakeEnsureCursorLayer = function() {
		var root = this._jakeOverlayRoot();
		if (!this._jakeCursorLayer) {
			this._jakeCursorLayer = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		}
		if (this._jakeCursorLayer.parent !== root) root.addChild(this._jakeCursorLayer);
		root.setChildIndex(this._jakeCursorLayer, root.children.length - 1);
	};

	TimedAttackSystem.prototype._jakePrepareCursorLayer = function() {
		this._jakeEnsureCursorLayer();
		this._jakeCursorLayer.visible = true;
		if (this._jakeCursorLayer.bitmap) this._jakeCursorLayer.bitmap.clear();
		return this._jakeCursorLayer.bitmap;
	};

	TimedAttackSystem.prototype._jakeEnsureBalanceFeatureLayer = function() {
		var root = this._jakeOverlayRoot();
		if (!this._jakeBalanceFeatureLayer) {
			this._jakeBalanceFeatureLayer = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		}
		if (this._jakeBalanceFeatureLayer.parent !== root) root.addChild(this._jakeBalanceFeatureLayer);
		root.setChildIndex(this._jakeBalanceFeatureLayer, root.children.length - 1);
		this._jakeBalanceFeatureLayer.pivot.x = 0;
		this._jakeBalanceFeatureLayer.pivot.y = 0;
		this._jakeBalanceFeatureLayer.x = 0;
		this._jakeBalanceFeatureLayer.y = 0;
		this._jakeBalanceFeatureLayer.rotation = 0;
		this._jakeBalanceFeatureLayer.scale.x = 1;
		this._jakeBalanceFeatureLayer.scale.y = 1;
	};

	TimedAttackSystem.prototype._jakePrepareBalanceFeatureLayer = function() {
		this._jakeEnsureBalanceFeatureLayer();
		this._jakeBalanceFeatureLayer.visible = true;
		if (this._jakeBalanceFeatureLayer.bitmap) this._jakeBalanceFeatureLayer.bitmap.clear();
		return this._jakeBalanceFeatureLayer.bitmap;
	};

	var _jHideOverlaySprites_v22 = TimedAttackSystem.prototype._jakeHideOverlaySprites;
	TimedAttackSystem.prototype._jakeHideOverlaySprites = function() {
		_jHideOverlaySprites_v22.call(this);
		if (this._jakeStopKeyLayer) {
			this._jakeStopKeyLayer.visible = false;
			if (this._jakeStopKeyLayer.bitmap) this._jakeStopKeyLayer.bitmap.clear();
		}
		if (this._jakeCursorLayer) {
			this._jakeCursorLayer.visible = false;
			if (this._jakeCursorLayer.bitmap) this._jakeCursorLayer.bitmap.clear();
		}
		if (this._jakeBalanceFeatureLayer) {
			this._jakeBalanceFeatureLayer.visible = false;
			if (this._jakeBalanceFeatureLayer.bitmap) this._jakeBalanceFeatureLayer.bitmap.clear();
		}
	};

	TimedAttackSystem.prototype._jakeApplyStopKeyLayerTransform = function(centerX, centerY) {
		this._jakeEnsureStopKeyLayer();
		var includeMain = !this._jIndependentStopKeyIcon;
		var mainAngle = includeMain ? ((this._angleOffset || 0) * Math.PI / 180) : 0;
		var mainScaleX = includeMain ? ((this._visualScaleX !== undefined) ? this._visualScaleX : 1) : 1;
		var mainScaleY = includeMain ? ((this._visualScaleY !== undefined) ? this._visualScaleY : 1) : 1;

		this._jakeStopKeyLayer.visible = true;
		this._jakeStopKeyLayer.pivot.x = centerX;
		this._jakeStopKeyLayer.pivot.y = centerY;
		this._jakeStopKeyLayer.x = centerX + (this._stopKeyXOffset || 0);
		this._jakeStopKeyLayer.y = centerY + (this._stopKeyYOffset || 0);
		this._jakeStopKeyLayer.rotation = mainAngle + ((this._stopKeyAngle || 0) * Math.PI / 180);
		this._jakeStopKeyLayer.scale.x = mainScaleX * ((this._stopKeyScaleX !== undefined) ? this._stopKeyScaleX : 1);
		this._jakeStopKeyLayer.scale.y = mainScaleY * ((this._stopKeyScaleY !== undefined) ? this._stopKeyScaleY : 1);
	};

	var _jLoadItem_v22 = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		_jLoadItem_v22.call(this, item);
		if (!item) return;

		this._jNoSkillUse = !!item.jakeNoSkillUse;

		if (item.type === SRD.TimedAttack.TAS_ID) {
			var repeatAmount = parseInt(item.jakeBarRepeatAmount);
			this._jBarRepeatAmount = isNaN(repeatAmount) ? 0 : repeatAmount;
			this._jBarIncompleteValue = (item.jakeBarIncompleteValue !== false);
			if (!this._jHitzones) this._jHitzones = J.defaultHitzones();
		}

		if (item.type === 'mash') {
			this._jMashInvalidTapLoss = Math.max(0, Number(item.jakeMashInvalidTapLoss || 0));
			this._stopKeyXOffset = J.toNumber(item.jakeStopKeyXOffset, 0);
			this._stopKeyYOffset = J.toNumber(item.jakeStopKeyYOffset, 0);
			this._stopKeyAngle = J.toNumber(item.jakeStopKeyAngle, 0);
			this._stopKeyScaleX = J.toNumber(item.jakeStopKeyScaleX, 1);
			this._stopKeyScaleY = J.toNumber(item.jakeStopKeyScaleY, 1);
			this._jIndependentStopKeyIcon = !!item.jakeIndependentStopKeyIcon;
		}

		if (item.type === 'clock') {
			this._jClockIncompleteValue = (item.jakeClockIncompleteValue !== false);
			this._jakeRebuildClockTargets(item);
			this._jClockRequiredHits = Math.max(1, this._targetCount || 1);
		}
	};

	TimedAttackSystem.prototype._jakeRebuildClockTargets = function(item) {
		if (!item || item.type !== 'clock') return;
		this._targets = [];
		this._targetCount = 0;
		this._setTargets = [];
		if (!item.targets) item.targets = [];

		for (var i = 0; i < item.targets.length; i++) {
			if (!item.targets[i] || String(item.targets[i]).trim().length === 0) continue;
			var parsed = J.parseClockTarget(item.targets[i]);
			if (!parsed) continue;
			this._targets.push(parsed);
			this._targetCount++;
		}
		if (this._targetCount <= 0) this._targetCount = 1;
	};

	var _jLoadStart_v22 = TimedAttackSystem.prototype.loadStart;
	TimedAttackSystem.prototype.loadStart = function() {
		_jLoadStart_v22.call(this);

		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID && this._jDefaultMode === 'custom hitzones') {
			this._jBarRequiredHits = 0;
			for (var i = 0; i < this._jHitzones.length; i++) {
				if (this._jHitzones[i] && this._jHitzones[i].initialized) this._jBarRequiredHits++;
			}
			if (this._jBarRequiredHits <= 0) this._jBarRequiredHits = 1;
		}

		if (this._item && this._item.type === 'mash') {
			this._seconds = Math.ceil(Math.max(0, this._jMashFramesLeft || 0) / 60);
		}

		if (this._item && this._item.type === 'clock') {
			this._jClockRequiredHits = Math.max(1, this._targetCount || 1);
		}
	};

	TimedAttackSystem.prototype._jakeCurrentFramesLeft = function() {
		if (!this._item) return 0;
		if (this._item.type === 'arrows') return Math.max(0, Math.floor(this._milis || 0));
		if (this._item.type === 'mash') {
			if (this._jMashTimeless) return 0;
			return Math.max(0, Math.floor(this._jMashFramesLeft || 0));
		}
		return 0;
	};

	TimedAttackSystem.prototype._jakeCurrentSecondsLeft = function() {
		return Math.floor(this._jakeCurrentFramesLeft() / 60);
	};

	TimedAttackSystem.prototype._jakeDefaultCustomZeroPower = function() {
		if (this._jBarPowerValue === 'multiple hits') {
			var count = Math.max(this._jBarRequiredHits || 1, this._jBarHitsDone || 0, 1);
			var arr = [0];
			for (var i = 0; i < count; i++) arr[i + 1] = 0;
			return arr;
		}
		return this._jakeBuildZeroHitzoneArray();
	};

	TimedAttackSystem.prototype._jakeFinalizeDefaultCustom = function(completed) {
		if (!this._jBarIncompleteValue && !completed) {
			this.setPower(this._jakeDefaultCustomZeroPower());
		} else if (this._jBarPowerValue === 'multiple hits') {
			this.setPower(this._jBarHitPowers);
		} else {
			this.setPower(this._jBarZonePowers);
		}
		this._notPressed = false;
		this._flashTime = 45;
	};

	TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones = function() {
		if (this._notPressed && this._jakeUpdateDefaultHitzoneMovements) {
			this._jakeUpdateDefaultHitzoneMovements();
		}

		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._xSpeed);
			var minX = -(this._item.width || 0);
			var maxX = this.windowWidth();
			if (this._xPosition > maxX || this._xPosition < minX) {
				if (this._jBarRepeat) {
					var infinite = (this._jBarRepeatAmount === -1);
					var canRepeat = infinite || (this._jBarRepeatCount < this._jBarRepeatAmount);
					if (!canRepeat) {
						this._jakeFinalizeDefaultCustom(false);
					} else {
						this._jBarRepeatCount++;
						if (this._jBarRepeatBounce) {
							this._xSpeed *= (-1);
							this._xPosition = J.clamp(this._xPosition, minX, maxX);
						} else {
							this._xPosition = this._origin;
							this._xSpeed = this._jBarStartSpeed;
						}
					}
				} else {
					this._jakeFinalizeDefaultCustom(false);
				}
			}
		} else {
			this._flashTime++;
		}

		if (this._flashTime >= 45) {
			BattleManager.endTASAttackThing();
			this.close();
			return;
		}

		this._window.contents.clear();
		var totalWidth = this.windowWidth();
		var contentWidth = this._window.contentsWidth();
		var contentHeight = this._window.contentsHeight();
		var scaleRatio = contentWidth / Math.max(totalWidth, 1);
		var barHeight = Math.max(2, Math.floor(this._jBarThickness || 16));
		var barY = Math.floor((contentHeight - barHeight) / 2);
		var shape = String(this._shape || '').trim().toLowerCase();
		var isOvalBar = (shape === 'oval');
		var useIndependentCursor = true;
		var contentPad = 0;
		if (this._window) {
			if (this._window.padding !== undefined) contentPad = J.toNumber(this._window.padding, 0);
			else if (this._window.standardPadding) contentPad = J.toNumber(this._window.standardPadding(), 0);
		}
		var independentCursorBaseY = this._window.y + contentPad + barY;
		var cursorBitmap = this._jakePrepareCursorLayer();

		if (isOvalBar) {
			this._jakeDrawCapsule(this._window.contents, 0, barY, contentWidth, barHeight, this._jBarBackgroundColor || '#ffffff');
		} else {
			this._window.contents.fillRect(0, barY, contentWidth, barHeight, this._jBarBackgroundColor || '#ffffff');
		}

		for (var i = 0; i < this._jHitzones.length; i++) {
			var zone = this._jHitzones[i];
			if (!zone || !zone.initialized) continue;
			var m = J.getHitzoneMetrics(zone, totalWidth);

			var closeStart = (m.center - m.hitLeft - m.closeLeft) * scaleRatio;
			var closeEnd = (m.center + m.hitRight + m.closeRight) * scaleRatio;
			var closeWidth = Math.floor(closeEnd - closeStart);
			if (closeWidth > 0) {
				if (isOvalBar) this._jakeDrawCapsule(this._window.contents, Math.floor(closeStart), barY, closeWidth, barHeight, zone.closeColor);
				else this._window.contents.fillRect(Math.floor(closeStart), barY, closeWidth, barHeight, zone.closeColor);
			}

			var hitStart = (m.center - m.hitLeft) * scaleRatio;
			var hitEnd = (m.center + m.hitRight) * scaleRatio;
			var hitWidth = Math.floor(hitEnd - hitStart);
			if (hitWidth > 0) {
				if (isOvalBar) this._jakeDrawCapsule(this._window.contents, Math.floor(hitStart), barY, hitWidth, barHeight, zone.hitColor);
				else this._window.contents.fillRect(Math.floor(hitStart), barY, hitWidth, barHeight, zone.hitColor);
			}
		}

		if (this._jBarHitMarkersEnabled && this._jBarMarkers && this._jBarMarkers.length > 0) {
			var markerTarget = useIndependentCursor ? cursorBitmap : this._window.contents;
			var oldOpacity = markerTarget.paintOpacity;
			markerTarget.paintOpacity = this._jBarHitMarkerOpacity;
			for (var mIdx = 0; mIdx < this._jBarMarkers.length; mIdx++) {
				if (useIndependentCursor) {
					var markerX = this._window.x + contentPad + (this._jBarMarkers[mIdx] * scaleRatio);
					this._jakeDrawDefaultCustomCursor(markerX, independentCursorBaseY, barHeight, scaleRatio, cursorBitmap);
				} else {
					this._jakeDrawDefaultCustomCursor(this._jBarMarkers[mIdx] * scaleRatio, barY, barHeight, scaleRatio);
				}
			}
			markerTarget.paintOpacity = oldOpacity;
		}

		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			if (useIndependentCursor) {
				var liveX = this._window.x + contentPad + (this._xPosition * scaleRatio);
				this._jakeDrawDefaultCustomCursor(liveX, independentCursorBaseY, barHeight, scaleRatio, cursorBitmap);
			} else {
				this._jakeDrawDefaultCustomCursor(this._xPosition * scaleRatio, barY, barHeight, scaleRatio);
			}
		}

		if (this._jakeActivationTriggered() && this._notPressed) {
			var hitData = this._jakeEvaluateDefaultHitData(this._xPosition, totalWidth);
			if (this._jBarPowerValue === 'multiple hits') {
				this._jBarHitPowers[this._jBarHitsDone + 1] = hitData.sum;
			} else {
				for (var z = 1; z < hitData.zonePowers.length; z++) {
					if (hitData.zonePowers[z] > 0) this._jBarZonePowers[z] = hitData.zonePowers[z];
				}
			}

			this._jakePushBarMarker(this._xPosition);
			this._jBarHitsDone++;
			AudioManager.playSe({"name":this._se,"pan":0,"pitch":100,"volume":100});

			if (this._jBarRequiredHits !== -1 && this._jBarHitsDone >= this._jBarRequiredHits) {
				this._jakeFinalizeDefaultCustom(true);
			}
		}

		var centerX = this._window.x + (this._window.width / 2);
		var centerY = this._window.y + (this._window.height / 2);
		this._jakeApplyVisualTransform(centerX, centerY);
		this._jakeUpdateOverlayText(null, centerX, this._window.y - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(centerX, centerY);
	};

	var _jSetupMashItem_v22 = TimedAttackSystem.prototype._jakeSetupMashItem;
	TimedAttackSystem.prototype._jakeSetupMashItem = function(item) {
		_jSetupMashItem_v22.call(this, item);

		var ok = J.defaultOkKeyCode();
		for (var i = 10; i < 20; i++) {
			var rawKeys = item.jakeMashRandomKeys ? item.jakeMashRandomKeys[i] : null;
			var hasData = rawKeys !== undefined && rawKeys !== null && String(rawKeys).trim().length > 0;
			if (!hasData) continue;
			var keys = J.parseKeyCodeList(rawKeys, [ok]);
			if (keys.length > 0) {
				this._jMashPools.push({
					keys: keys,
					texts: J.splitCsv(item.jakeMashRandomKeysTexts ? item.jakeMashRandomKeysTexts[i] : ''),
					icons: J.splitCsv(item.jakeMashRandomKeysIcons ? item.jakeMashRandomKeysIcons[i] : '')
				});
			}
		}

		this._jMashFramesProp = Math.max(0, parseInt(item.jakeMashFrames || 0));
		this._jMashSecondsProp = Math.max(0, parseInt(item.jakeMashSeconds || item.seconds || 0));
		this._jMashTimeMode = String(item.jakeMashTimeMode || ((this._jMashFramesProp > 0) ? 'frames' : 'seconds')).toLowerCase();
		if (this._jMashTimeMode !== 'frames' && this._jMashTimeMode !== 'seconds') this._jMashTimeMode = (this._jMashFramesProp > 0) ? 'frames' : 'seconds';
		this._jMashUseFrames = true;

		this._jMashInvalidTapLoss = Math.max(0, Number(item.jakeMashInvalidTapLoss || 0));
		this._stopKeyXOffset = J.toNumber(item.jakeStopKeyXOffset, 0);
		this._stopKeyYOffset = J.toNumber(item.jakeStopKeyYOffset, 0);
		this._stopKeyAngle = J.toNumber(item.jakeStopKeyAngle, 0);
		this._stopKeyScaleX = J.toNumber(item.jakeStopKeyScaleX, 1);
		this._stopKeyScaleY = J.toNumber(item.jakeStopKeyScaleY, 1);
		this._jIndependentStopKeyIcon = !!item.jakeIndependentStopKeyIcon;
	};

	var _jInitMashRuntime_v22 = TimedAttackSystem.prototype._jakeInitMashRuntime;
	TimedAttackSystem.prototype._jakeInitMashRuntime = function() {
		_jInitMashRuntime_v22.call(this);
		if (this._jMashTimeMode === 'frames') {
			this._jMashFramesLeft = Math.max(0, this._jMashFramesProp);
		} else {
			this._jMashFramesLeft = Math.max(0, this._jMashSecondsProp * 60);
		}
		this._seconds = Math.ceil(this._jMashFramesLeft / 60);
	};

	TimedAttackSystem.prototype._jakeDrawMashIndicators = function() {
		this._jakeEnsureKeysLayer();
		this._jakeEnsureStopKeyLayer();

		var keysBmp = this._jakeKeysLayer.bitmap;
		var stopBmp = this._jakeStopKeyLayer.bitmap;
		keysBmp.clear();
		stopBmp.clear();
		this._jakeKeysBounds = null;

		var size = Math.max(24, this._height + 8);
		var gap = 6;
		var gaugeY = this._y + this.lineHeight() - 8 + Math.floor(this._height / 2);

		var hasNormalKeys = false;
		if (this._jakeMashIsRandomMode()) {
			var poolCount = (this._jMashMode === 'random mash') ? 1 : this._jMashPoolStates.length;
			for (var i = 0; i < poolCount; i++) {
				var state = this._jMashPoolStates[i];
				var cx = this._x - ((poolCount - i) * (size + gap));
				var blocked = this._jakeMashPoolBlocked(i);
				var display = this._jakeGetMashPoolDisplay(state);
				this._jakeDrawMashToken(keysBmp, cx, gaugeY, size, display, blocked, 'rgba(30,30,30,0.35)', '#222222');
				hasNormalKeys = true;
			}
		}

		if (hasNormalKeys) this._jakeApplyKeysLayerTransform(this._x + (this._width / 2), gaugeY);
		else this._jakeKeysLayer.visible = false;

		if (this._jMashStopKey !== null) {
			var stopDisplay = this._jakeMashStopDisplay();
			var stopX = this._x + this._width + size;
			this._jakeDrawMashToken(stopBmp, stopX, gaugeY, size, stopDisplay, false, this._jMashStopColor, this._jMashStopColor);
			this._jakeApplyStopKeyLayerTransform(stopX, gaugeY);
		} else {
			this._jakeStopKeyLayer.visible = false;
		}
	};

	TimedAttackSystem.prototype.playMashGame = function() {
		if (this._notPressed) {
			var f = this._frame;
			this._xPosition -= Number(eval(this._item.speed)) - this._tempSpeed;
			if (this._xPosition <= 0) {
				this._xPosition = 0;
				this._jakeUpdateMashPowerTracking();
				if (!this._jMashUnstarting) this._jakeFinishMash('drain');
			}
			if (this._xPosition >= this._maxPosition) {
				this._xPosition = this._maxPosition;
				this._jakeUpdateMashPowerTracking();
				if (!this._jMashUnending) this._jakeFinishMash('fill');
			}
		} else {
			this._flashTime++;
		}

		this._x = (Graphics.width / 2);
		this._y = (Graphics.height / 2);
		this._x += this._visualXOffset;
		this._y += this._visualYOffset;
		if (!isSideview) {
			this._x += globalNonSideXOffset + globalNonSideXOffsetMash;
			this._y += globalNonSideYOffset + globalNonSideYOffsetMash;
		}

		this._content.bitmap.clear();
		this.drawGaugeUpgrade(this._x, this._y, this._width, this._height, this._xPosition / this._maxPosition, this._color1, this._color2);

		if (this._jMashPowerValue === 'highest value' || this._jMashPowerValue === 'lowest value') {
			var markerRatio = (this._jMashPowerValue === 'highest value') ? this._jMashHighestRatio : this._jMashLowestRatio;
			var gaugeY = this._y + this.lineHeight() - 8;
			var markerX = this._x + Math.floor(this._width * markerRatio);
			this._content.bitmap.fillRect(markerX, gaugeY - 2, 2, this._height + 4, this._jMashMarkerColor);
		}

		this._jakeDrawMashIndicators();

		var defaultText = null;
		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			defaultText = this._phrase.replace(/%1/g, this._seconds);
		}

		this._jakeApplyVisualTransform(this._x + (this._width / 2), this._y + (this._height / 2));
		this._jakeUpdateOverlayText(defaultText, this._x + (this._width / 2), this._y - this._height + (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(this._x + (this._width / 2), this._y + (this._height / 2));

		if (this._flashTime >= this._time && !this._notPressed) {
			this._content.bitmap.clear();
			BattleManager.endTASAttackThing();
			this.close();
			return;
		}

		if (this._notPressed) {
			if (this._jMashStopKey !== null && J.consumeKeyCode(this._jMashStopKey)) {
				this._jakeUpdateMashPowerTracking();
				this._jakeFinishMash('stop');
			} else {
				var validMash = this._jakeProcessMashInput();
				if (validMash) {
					if (this._jMashSE && this._jMashSE.length > 0) {
						AudioManager.playSe({"name":this._jMashSE,"pan":0,"pitch":100,"volume":100});
					}
					if (this._mode) this._tempSpeed = eval(this._item.tap);
					else this._xPosition += eval(this._item.tap);
				} else if (this._jMashLastInputInvalid) {
					if (this._jMashInvalidSE && this._jMashInvalidSE.length > 0) {
						AudioManager.playSe({"name":this._jMashInvalidSE,"pan":0,"pitch":100,"volume":100});
					}
					if (this._jMashInvalidTapLoss > 0) {
						this._xPosition -= this._jMashInvalidTapLoss;
					}
				}

				if (!this._jMashTimeless) {
					this._jMashFramesLeft = Math.max(0, this._jMashFramesLeft - 1);
					this._seconds = Math.ceil(this._jMashFramesLeft / 60);
					if (this._jMashFramesLeft <= 0) this._jakeFinishMash('timeout');
				}
			}

			if (this._tempSpeed > 0) {
				this._tempSpeed = Math.max(0, this._tempSpeed - this._jMashTapGainFade);
			}
			this._xPosition = J.clamp(this._xPosition, 0, this._maxPosition);
			this._jakeUpdateMashPowerTracking();
		}
	};

	var _jSetupArrowsItem_v22 = TimedAttackSystem.prototype._jakeSetupArrowsItem;
	TimedAttackSystem.prototype._jakeSetupArrowsItem = function(item) {
		_jSetupArrowsItem_v22.call(this, item);
		this._jArrowTimeMode = String(item.jakeArrowTimeMode || ((item.jakeArrowFrames > 0) ? 'frames' : 'seconds')).toLowerCase();
		if (this._jArrowTimeMode === 'frames') this._jArrowTotalFrames = Math.max(0, parseInt(item.jakeArrowFrames || 0));
		else if (this._jArrowTimeMode === 'seconds') this._jArrowTotalFrames = Math.max(0, parseInt(item.jakeArrowSeconds || 0) * 60);
		else this._jArrowTotalFrames = Math.max(0, parseInt(item.frames || 0));
		this._milis = this._jArrowTotalFrames;
	};

	TimedAttackSystem.prototype._jakeCreateArrowSprites = function() {
		this._jakeEnsureKeysLayer();
		if (!this._jArrowContainer || !this._jArrowContainer.addChild) {
			this._jArrowContainer = new Sprite();
			if (this._jakeKeysLayer) this._jakeKeysLayer.addChild(this._jArrowContainer);
		}
		this._jakeCleanupArrowSprites();
		this._jArrowSprites = [];
		for (var i = 0; i < this._commands.length; i++) {
			var sprite = new Sprite(new Bitmap(this._jArrowSlotSize, this._jArrowSlotSize));
			this._jakeRefreshArrowSpriteBitmap(sprite, this._commands[i]);
			sprite.opacity = 0;
			this._jArrowSprites.push(sprite);
			this._jArrowContainer.addChild(sprite);
		}
	};

	TimedAttackSystem.prototype._jakeClockZeroPower = function() {
		if (this._jClockPowerValue === 'one value') return 0;
		if (this._jClockPowerValue === 'multiple targets') {
			var zt = [0];
			for (var i = 0; i < this._targets.length; i++) zt[i + 1] = 0;
			return zt;
		}
		var zh = [0];
		var count = Math.max(this._jClockRequiredHits || 1, this._setTargets.length || 0, 1);
		for (var j = 0; j < count; j++) zh[j + 1] = 0;
		return zh;
	};

	TimedAttackSystem.prototype._jakeResolveClockPower = function() {
		var radius = Math.max(1, J.toNumber(this._length, 1));
		if (this._jClockPowerValue === 'one value') {
			if (!this._setTargets.length) return 0;
			var total = 0;
			for (var i = 0; i < this._setTargets.length; i++) {
				var hitSum = 0;
				for (var j = 0; j < this._targets.length; j++) {
					hitSum += J.evaluateClockTargetPower(this._targets[j], this._setTargets[i], radius);
				}
				total += hitSum;
			}
			return total / Math.max(1, this._setTargets.length);
		}

		if (this._jClockPowerValue === 'multiple targets') {
			var arrTargets = [0];
			for (var t = 0; t < this._targets.length; t++) arrTargets[t + 1] = 0;
			for (var h = 0; h < this._setTargets.length; h++) {
				for (var k = 0; k < this._targets.length; k++) {
					var p = J.evaluateClockTargetPower(this._targets[k], this._setTargets[h], radius);
					if (p > arrTargets[k + 1]) arrTargets[k + 1] = p;
				}
			}
			return arrTargets;
		}

		var arrHits = [0];
		for (var m = 0; m < this._setTargets.length; m++) {
			var sum = 0;
			for (var n = 0; n < this._targets.length; n++) {
				sum += J.evaluateClockTargetPower(this._targets[n], this._setTargets[m], radius);
			}
			arrHits[m + 1] = sum;
		}
		return arrHits;
	};

	TimedAttackSystem.prototype._jakeResolveClockFinalPower = function(completed) {
		if (!this._jClockIncompleteValue && !completed) return this._jakeClockZeroPower();
		return this._jakeResolveClockPower();
	};

	TimedAttackSystem.prototype.playClockGame = function() {
		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._mul);
			if (this._xPosition <= this._startRadius || this._xPosition >= this._endRadius) {
				if (this._rt === 'repeat') this._xPosition = this._startRadius;
				else if (this._rt === 'reverse') this._mul *= (-1);
				else {
					this.setPower(this._jakeResolveClockFinalPower(false));
					this._flashTime = this._time;
					this._notPressed = false;
				}
			}
		} else {
			this._flashTime++;
		}

		this._x = (Graphics.width / 2);
		this._y = (Graphics.height / 2);
		this._x += this._visualXOffset;
		this._y += this._visualYOffset;
		if (!isSideview) {
			this._x += globalNonSideXOffset + globalNonSideXOffsetClock;
			this._y += globalNonSideYOffset + globalNonSideYOffsetClock;
		}

		this._content.bitmap.clear();
		var mainClockOpacity = this._jakeResolveElementOpacity ? this._jakeResolveElementOpacity(null) : 255;
		var clockVisualOpacity = this._jakeResolveElementOpacity ? this._jakeResolveElementOpacity('Clock', mainClockOpacity) : mainClockOpacity;
		var oldClockPaintOpacity = this._content.bitmap.paintOpacity;
		if (oldClockPaintOpacity !== undefined) {
			var cappedClockPaint = J.toOpacity(oldClockPaintOpacity, 255);
			this._content.bitmap.paintOpacity = Math.min(cappedClockPaint, J.toOpacity(clockVisualOpacity, cappedClockPaint));
		}
		if (this._image.trim().length > 0 && this._xPosition > 0) {
			var bitmap = SRD.TimedAttack.loadImage(this._image);
			this._content.bitmap.blt(bitmap, 0, 0, bitmap.width, bitmap.height, this._x - (bitmap.width/2), this._y - (bitmap.height/2));
		} else {
			this._content.bitmap.drawCircle(this._x, this._y, this._length + this._outWidth, this._outColor);
			this._content.bitmap.drawCircle(this._x, this._y, this._length, this._backColor);
		}

		for (var i = 0; i < this._targets.length; i++) {
			var t = this._targets[i];
			J.drawClockSliceDegrees(this._content.bitmap, this._x, this._y, this._length, t[0], t[1], t[2]);
		}

		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			this._content.bitmap.drawHand(this._x, this._y, this._xPosition, this._length, this._thickness, this._color);
			if (this._jClockHitMarkers) {
				for (var s = 0; s < this._setTargets.length; s++) {
					this._content.bitmap.drawHand(this._x, this._y, this._setTargets[s], this._length, this._thickness, this._fadeColor);
				}
			}
		}
		this._content.bitmap.drawCircle(this._x, this._y, this._length / 10, this._baseColor);
		if (oldClockPaintOpacity !== undefined) this._content.bitmap.paintOpacity = oldClockPaintOpacity;

		this._jakeApplyVisualTransform(this._x, this._y);
		this._jakeUpdateOverlayText(null, this._x, this._y - (this._length || 0) - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(this._x, this._y);

		if (this._flashTime >= this._time && !this._notPressed) {
			this._content.bitmap.clear();
			BattleManager.endTASAttackThing();
			this.close();
			return;
		}

		if (this._jakeActivationTriggered() && this._notPressed && this._cooldown === 0) {
			if (this._targetCount > 0) this._targetCount--;
			this._setTargets.push(this._xPosition);
			AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
			if (this._targetCount <= 0) {
				this._notPressed = false;
				this.setPower(this._jakeResolveClockFinalPower(true));
			}
		}
		if (this._cooldown > 0) this._cooldown--;
	};

	// Balance runtime moved to JakeMSG_SRD_TimedAttackAdditions_Balance.

	//-----------------------------------------------------------------------------
	// v2.3 Final Tail Overrides (ensures latest layer wins)
	//-----------------------------------------------------------------------------

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

	var _jForceTA_v23_tail = J.forceTA;
	J.forceTA = function(skillId, tempNotesTA) {
		if (!J.startForcedTA) {
			if (_jForceTA_v23_tail) return _jForceTA_v23_tail.call(this, skillId, tempNotesTA);
			return false;
		}
		var run = J.startForcedTA(skillId, tempNotesTA, {isXTA:false});
		if (!run) return false;
		J.requestInterpreterWaitRun(run.id);
		return true;
	};

	if (typeof globalThis !== 'undefined') {
		globalThis.forceTA = function(skillId, tempNotesTA) {
			return J.forceTA(skillId, tempNotesTA);
		};
		globalThis.parallelTA = function(skillId, tempNotesTA) {
			if (!J.parallelTA) return false;
			return J.parallelTA(skillId, tempNotesTA);
		};
		globalThis.parallelXTAs = function(skillIds, waitMode) {
			if (!J.parallelXTAs) return 0;
			return J.parallelXTAs(skillIds, waitMode === true);
		};
		globalThis.addParXTA = function(skillId, tempNotesTA, waitMode) {
			if (!J.addParXTA) return false;
			return J.addParXTA(skillId, tempNotesTA, waitMode === true);
		};
		globalThis.waitXTA = function() {
			if (!J.waitXTA) return false;
			return J.waitXTA();
		};
		globalThis.clearXTAResults = function() {
			if (!J.clearXTAResults) return false;
			return J.clearXTAResults();
		};
		globalThis.logXTAs = function(enabled) {
			if (!J.logXTAs) return false;
			return J.logXTAs(enabled);
		};
	}

	if (typeof Input !== 'undefined' && !Input._jakeTAXtaClearGuard) {
		Input._jakeTAXtaClearGuard = true;
		var _Input_clear_v23_tail = Input.clear;
		Input.clear = function() {
			var queued = Array.isArray(this._jakeTAKeyQueue) ? this._jakeTAKeyQueue.slice(0) : [];
			_Input_clear_v23_tail.call(this);
			if (!Array.isArray(this._jakeTAKeyQueue)) this._jakeTAKeyQueue = [];
			if (J.hasActiveXtas && J.hasActiveXtas()) this._jakeTAKeyQueue = queued;
		};
	}

	var _jApplyDefaultProps_v23_tail = J.applyDefaultProps;
	J.applyDefaultProps = function(o, source, semicolonMode) {
		var prevVisualX = o ? o.visualXOffset : undefined;
		var prevVisualY = o ? o.visualYOffset : undefined;
		var prevAngleOffset = o ? o.angleOffset : undefined;
		_jApplyDefaultProps_v23_tail.call(this, o, source, semicolonMode);
		if (!o || o.type !== SRD.TimedAttack.TAS_ID) return;

		var rawBarCursorVisualX = params['Bar Cursor Visual X Offset'];
		if (rawBarCursorVisualX === undefined || rawBarCursorVisualX === null || String(rawBarCursorVisualX).trim().length === 0) rawBarCursorVisualX = params['Bar Cursor X Offset'];
		var rawBarCursorVisualY = params['Bar Cursor Visual Y Offset'];
		if (rawBarCursorVisualY === undefined || rawBarCursorVisualY === null || String(rawBarCursorVisualY).trim().length === 0) rawBarCursorVisualY = params['Bar Cursor Y Offset'];
		var dBarCursorVisualX = J.toEvalNumber(rawBarCursorVisualX, 0);
		var dBarCursorVisualY = J.toEvalNumber(rawBarCursorVisualY, 0);
		var dBarCursorAngle = J.toEvalNumber(params['Bar Cursor Angle'], 0);
		var dBarCursorScaleX = J.toEvalNumber(params['Bar Cursor Scale X'], 1);
		var dBarCursorScaleY = J.toEvalNumber(params['Bar Cursor Scale Y'], 1);
		var rawBarCursorColor = String(params['Bar Cursor Color'] || '').trim();
		var dBarCursorColor = rawBarCursorColor.length > 0 ? rawBarCursorColor : '#000000';
		var dBarCursorThickness = Math.max(1, J.toEvalNumber(params['Bar Cursor Thickness'], 4));
		var dBarHitKeys = J.parseKeyCodeList(params['Bar Hit Keys'], [13, 90, -1]);
		var dBarHitCount = parseInt(params['Bar Hit Count']);
		var dBarIndependentCursor = String(params['Bar Independent Cursor'] || 'false').trim().toLowerCase() === 'true';
		if (isNaN(dBarHitCount)) dBarHitCount = 0;
		if (dBarHitCount < -1) dBarHitCount = -1;

		var v = J.getValue(source, 'Shape', semicolonMode);
		if (v !== null) o.jakeBarShape = String(v).trim().toLowerCase();
		else if (o.jakeBarShape === undefined) o.jakeBarShape = String(o.shape || 'rectangle').trim().toLowerCase();

		v = J.getValue(source, 'Cursor[ ]?Color', semicolonMode);
		if (v !== null) o.jakeCursorColor = String(v);
		else if (o.jakeCursorColor === undefined) o.jakeCursorColor = dBarCursorColor;

		v = J.getFirstValue(source, ['Bar[ ]?Cursor[ ]?Thickness', 'Cursor[ ]?Thickness'], semicolonMode);
		if (v !== null) o.jakeCursorThickness = Math.max(1, J.toEvalNumber(v, dBarCursorThickness));
		else if (o.jakeCursorThickness === undefined) o.jakeCursorThickness = dBarCursorThickness;

		v = J.getFirstValue(source, ['Cursor[ ]?Visual[ ]?X[ ]?Offset', 'Cursor[ ]?X[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeCursorVisualXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeCursorVisualXOffset === undefined) o.jakeCursorVisualXOffset = dBarCursorVisualX;

		v = J.getFirstValue(source, ['Cursor[ ]?Visual[ ]?Y[ ]?Offset', 'Cursor[ ]?Y[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeCursorVisualYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeCursorVisualYOffset === undefined) o.jakeCursorVisualYOffset = dBarCursorVisualY;

		v = J.getFirstValue(source, ['Cursor[ ]?Angle[ ]?Offset', 'Cursor[ ]?Angle'], semicolonMode);
		if (v !== null) o.jakeCursorAngleOffset = J.toEvalNumber(v, 0);
		else if (o.jakeCursorAngleOffset === undefined) o.jakeCursorAngleOffset = dBarCursorAngle;

		v = J.getValue(source, 'Cursor[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeCursorScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeCursorScaleX === undefined) o.jakeCursorScaleX = dBarCursorScaleX;

		v = J.getValue(source, 'Cursor[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeCursorScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeCursorScaleY === undefined) o.jakeCursorScaleY = dBarCursorScaleY;

		v = J.getValue(source, 'Hit[ ]?keys?', semicolonMode);
		if (v !== null) o.jakeBarHitKeys = J.parseKeyCodeList(v, dBarHitKeys);
		else if (o.jakeBarHitKeys === undefined) o.jakeBarHitKeys = dBarHitKeys.slice(0);

		v = J.getValue(source, 'Hit[ ]?count', semicolonMode);
		if (v !== null) {
			var barHitCount = parseInt(v);
			o.jakeBarHitCount = isNaN(barHitCount) ? 0 : barHitCount;
		} else if (o.jakeBarHitCount === undefined) {
			o.jakeBarHitCount = dBarHitCount;
		}
		if (o.jakeBarHitCount < -1) o.jakeBarHitCount = -1;
		v = J.getFirstValue(source, ['Max[ ]?Hit[ ]?Markers', 'Max[ ]?Markers'], semicolonMode);
		if (v !== null) {
			var maxBarHitMarkers = parseInt(v);
			o.jakeBarMaxHitMarkers = isNaN(maxBarHitMarkers) ? -1 : maxBarHitMarkers;
		} else if (o.jakeBarMaxHitMarkers === undefined) {
			o.jakeBarMaxHitMarkers = -1;
		}
		if (o.jakeBarMaxHitMarkers < -1) o.jakeBarMaxHitMarkers = -1;

		v = J.getFirstValue(source, ['Independent[ ]?Cursor', 'Bar[ ]?Independent[ ]?Cursor'], semicolonMode);
		if (v !== null) o.jakeIndependentCursor = J.parseBool(v, false);
		else if (o.jakeIndependentCursor === undefined) o.jakeIndependentCursor = dBarIndependentCursor;

		var mainVisualX = J.getValue(source, '(?:^|[;\\n\\r])\\s*Visual[ ]?X[ ]?Offset', semicolonMode);
		var mainVisualY = J.getValue(source, '(?:^|[;\\n\\r])\\s*Visual[ ]?Y[ ]?Offset', semicolonMode);
		var mainAngle = J.getValue(source, '(?:^|[;\\n\\r])\\s*Angle[ ]?Offset', semicolonMode);
		var cursorVisualX = J.getFirstValue(source, ['(?:^|[;\\n\\r])\\s*Cursor[ ]?Visual[ ]?X[ ]?Offset', '(?:^|[;\\n\\r])\\s*Cursor[ ]?X[ ]?Offset'], semicolonMode);
		var cursorVisualY = J.getFirstValue(source, ['(?:^|[;\\n\\r])\\s*Cursor[ ]?Visual[ ]?Y[ ]?Offset', '(?:^|[;\\n\\r])\\s*Cursor[ ]?Y[ ]?Offset'], semicolonMode);
		var cursorAngle = J.getFirstValue(source, ['(?:^|[;\\n\\r])\\s*Cursor[ ]?Angle[ ]?Offset', '(?:^|[;\\n\\r])\\s*Cursor[ ]?Angle'], semicolonMode);
		if (mainVisualX === null && cursorVisualX !== null) o.visualXOffset = (prevVisualX !== undefined) ? prevVisualX : 0;
		if (mainVisualY === null && cursorVisualY !== null) o.visualYOffset = (prevVisualY !== undefined) ? prevVisualY : 0;
		if (mainAngle === null && cursorAngle !== null) o.angleOffset = (prevAngleOffset !== undefined) ? prevAngleOffset : 0;

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

	if (!J._jakeHitzoneMetricsMoveOffsetWrapped) {
		var _jGetHitzoneMetrics_v23_tail = J.getHitzoneMetrics;
		J.getHitzoneMetrics = function(zone, totalWidth) {
			var m = _jGetHitzoneMetrics_v23_tail.call(this, zone, totalWidth);
			if (!m) return m;
			m.center += J.toNumber(zone ? zone._jMoveOffsetX : 0, 0);
			return m;
		};
		J._jakeHitzoneMetricsMoveOffsetWrapped = true;
	}

	var _jClockRebuild_v23_tail = TimedAttackSystem.prototype._jakeRebuildClockTargets;
	TimedAttackSystem.prototype._jakeRebuildClockTargets = function(item) {
		if (!item || item.type !== 'clock') {
			if (_jClockRebuild_v23_tail) _jClockRebuild_v23_tail.call(this, item);
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

	var _jLoadItem_v23_tail = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		if (item && item.type === 'clock' && item.targets && item.targets.length) {
			item._jakeClockRawTargets = item.targets.slice(0);
			for (var i = 0; i < item.targets.length; i++) {
				var raw = item.targets[i];
				if (!raw || String(raw).trim().length === 0) continue;
				var parsed = J.parseClockTarget(raw);
				if (parsed) item.targets[i] = String(parsed[0]) + ', ' + String(parsed[1]) + ', ' + String(parsed[2]) + ', ' + String(parsed[3]);
				else item.targets[i] = '';
			}
		}

		_jLoadItem_v23_tail.call(this, item);

		if (item && item.type === SRD.TimedAttack.TAS_ID) {
			this._jBarShape = String(item.jakeBarShape || this._shape || item.shape || '').trim().toLowerCase();
			this._jBarRandomMovementPools = item.jakeRandomMovementPools || {};
			this._jIndependentCursor = !!item.jakeIndependentCursor;
			var barMaxHitMarkers = parseInt(item.jakeBarMaxHitMarkers);
			this._jBarMaxHitMarkers = isNaN(barMaxHitMarkers) ? -1 : barMaxHitMarkers;
			if (this._jBarMaxHitMarkers < -1) this._jBarMaxHitMarkers = -1;
			var rawCursorVisualX = (item.jakeCursorVisualXOffset !== undefined) ? item.jakeCursorVisualXOffset : item.jakeCursorXOffset;
			var rawCursorVisualY = (item.jakeCursorVisualYOffset !== undefined) ? item.jakeCursorVisualYOffset : item.jakeCursorYOffset;
			var rawCursorAngle = (item.jakeCursorAngleOffset !== undefined) ? item.jakeCursorAngleOffset : item.jakeCursorAngle;
			var rawCursorScaleX = (item.jakeCursorScaleX !== undefined) ? item.jakeCursorScaleX : 1;
			var rawCursorScaleY = (item.jakeCursorScaleY !== undefined) ? item.jakeCursorScaleY : 1;
			this._cursorColor = String(item.jakeCursorColor || item.color || '#000000');
			this._jBarCursorThickness = Math.max(1, J.toEvalNumber(item.jakeCursorThickness, J.toEvalNumber(params['Bar Cursor Thickness'], 4)));
			this._cursorVisualXOffset = J.toEvalNumber(rawCursorVisualX, 0);
			this._cursorVisualYOffset = J.toEvalNumber(rawCursorVisualY, 0);
			this._cursorAngleOffset = J.toEvalNumber(rawCursorAngle, 0);
			this._cursorScaleX = J.toEvalNumber(rawCursorScaleX, 1);
			this._cursorScaleY = J.toEvalNumber(rawCursorScaleY, 1);
			this._jBarHitKeys = J.parseKeyCodeList(item.jakeBarHitKeys, J.parseKeyCodeList(params['Bar Hit Keys'], [13, 90, -1]));
			var barHitCount = parseInt(item.jakeBarHitCount);
			this._jBarHitCount = isNaN(barHitCount) ? 0 : barHitCount;
			if (this._jBarHitCount < -1) this._jBarHitCount = -1;
			this._jBarStandardLastPower = 0;
			if (!isFinite(this._cursorScaleX) || this._cursorScaleX === 0) this._cursorScaleX = 1;
			if (!isFinite(this._cursorScaleY) || this._cursorScaleY === 0) this._cursorScaleY = 1;
		}
		if (item && item.type === 'circle') {
			this._jCircleHitKeys = J.parseKeyCodeList(item.jakeCircleHitKeys, J.parseKeyCodeList(params['Circle Hit Keys'], [13, 90, -1]));
		}
		if (item && item.type === 'clock') {
			this._jClockHitKeys = J.parseKeyCodeList(item.jakeClockHitKeys, J.parseKeyCodeList(params['Clock Hit Keys'], [13, 90, -1]));
			this._jakeRebuildClockTargets(item);
		}
	};

	var _jLoadStart_v23_tail = TimedAttackSystem.prototype.loadStart;
	TimedAttackSystem.prototype.loadStart = function() {
		_jLoadStart_v23_tail.call(this);
		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID) {
			if (this._jDefaultMode === 'custom hitzones') this._jakeInitDefaultHitzoneMovements();

			this._jBarHitPowers = [0];
			if (this._jakeBuildZeroHitzoneArray) this._jBarZonePowers = this._jakeBuildZeroHitzoneArray();
			else this._jBarZonePowers = [0];
			this._jBarHitsDone = 0;
			this._jBarRepeatCount = 0;
			this._jBarMarkers = [];
			this._jBarStartSpeed = this._xSpeed;
			this._jBarStandardLastPower = 0;

			var configuredHitCount = parseInt(this._jBarHitCount);
			if (isNaN(configuredHitCount)) configuredHitCount = 0;

			if (configuredHitCount === -1) {
				this._jBarRequiredHits = -1;
			} else if (configuredHitCount > 0) {
				this._jBarRequiredHits = configuredHitCount;
			} else if (this._jDefaultMode === 'custom hitzones') {
				this._jBarRequiredHits = 0;
				for (var i = 0; i < this._jHitzones.length; i++) {
					if (this._jHitzones[i] && this._jHitzones[i].initialized) this._jBarRequiredHits++;
				}
				if (this._jBarRequiredHits <= 0) this._jBarRequiredHits = 1;
			} else {
				this._jBarRequiredHits = 1;
			}
		}
	};

	var _jPlayDefault_v23_tail = TimedAttackSystem.prototype.playDefaultGame;
	TimedAttackSystem.prototype.playDefaultGame = function() {
		if (!(this._item && this._item.type === SRD.TimedAttack.TAS_ID)) {
			_jPlayDefault_v23_tail.call(this);
			return;
		}

		if (this._jDefaultMode === 'custom hitzones') {
			_jPlayDefault_v23_tail.call(this);
			return;
		}

		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._xSpeed);
			if (this._xPosition > this.windowWidth() || this._xPosition < -(this._item.width)) {
				if (this._rt === 'repeat') {
					this._xPosition = this._origin;
				} else if (this._rt === 'reverse') {
					this._xSpeed *= (-1);
				} else {
					if (this._jBarPowerValue === 'multiple hits') {
						if (this._jBarIncompleteValue === false && this._jakeDefaultCustomZeroPower) this.setPower(this._jakeDefaultCustomZeroPower());
						else this.setPower(this._jBarHitPowers || [0]);
					} else {
						var failPower = 0;
						if (this._jBarIncompleteValue !== false && (this._jBarHitsDone || 0) > 0) failPower = Number(this._jBarStandardLastPower || 0);
						this.setPower(J.clamp(failPower, 0, 1));
					}
					this._flashTime = 45;
				}
			}
		} else {
			this._flashTime++;
		}

		if (this._flashTime === 45) {
			BattleManager.endTASAttackThing();
			this.close();
			return;
		}

		this._window.contents.clear();
		var bit = SRD.TimedAttack.loadImage(this._background);
		this._window.contents.blt(bit, 0, 0, bit.width, bit.height, 0, 0, this._window.contentsWidth(), this._window.contentsHeight());

		var oldShape = this._shape;
		if (this._jBarShape) this._shape = this._jBarShape;
		var useIndependentCursor = true;
		var cursorBaseH = Math.max(2, Math.floor(J.toNumber(this._jBarThickness, 16)));
		if (!isFinite(cursorBaseH)) cursorBaseH = 16;
		cursorBaseH = Math.min(this._window.contentsHeight(), cursorBaseH);
		var cursorBaseY = Math.floor((this._window.contentsHeight() - cursorBaseH) / 2);
		var contentPad = 0;
		if (this._window) {
			if (this._window.padding !== undefined) contentPad = J.toNumber(this._window.padding, 0);
			else if (this._window.standardPadding) contentPad = J.toNumber(this._window.standardPadding(), 0);
		}
		var independentCursorBaseY = this._window.y + contentPad + cursorBaseY;
		var cursorBitmap = this._jakePrepareCursorLayer();

		if (this._jBarHitMarkersEnabled && this._jBarMarkers && this._jBarMarkers.length > 0) {
			var markerTarget = useIndependentCursor ? cursorBitmap : this._window.contents;
			var markerOpacity = markerTarget.paintOpacity;
			markerTarget.paintOpacity = this._jBarHitMarkerOpacity;
			for (var mIdx = 0; mIdx < this._jBarMarkers.length; mIdx++) {
				if (useIndependentCursor) {
					var markerX = this._window.x + contentPad + this._jBarMarkers[mIdx];
					this._jakeDrawDefaultCustomCursor(markerX, independentCursorBaseY, cursorBaseH, 1, cursorBitmap);
				} else {
					this._jakeDrawDefaultCustomCursor(this._jBarMarkers[mIdx], cursorBaseY, cursorBaseH, 1);
				}
			}
			markerTarget.paintOpacity = markerOpacity;
		}

		if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
			if (useIndependentCursor) {
				var liveX = this._window.x + contentPad + this._xPosition;
				this._jakeDrawDefaultCustomCursor(liveX, independentCursorBaseY, cursorBaseH, 1, cursorBitmap);
			} else {
				this._jakeDrawDefaultCustomCursor(this._xPosition, cursorBaseY, cursorBaseH, 1);
			}
		}

		this._shape = oldShape;

		if (this._jakeActivationTriggered() && this._notPressed) {
			AudioManager.playSe({"name":this._se,"pan":0,"pitch":100,"volume":100});
			var x = this._xPosition;
			var entireLength = this.width;
			var target = eval(this._target);
			var denom = Number(entireLength - target);
			if (!isFinite(denom) || Math.abs(denom) < 0.000001) denom = 1;
			var power = Number(1 - (Math.abs(target - x) / denom));
			if (!isFinite(power)) power = 0;
			power = J.clamp(power, 0, 1);
			this._jBarStandardLastPower = power;

			if (!Array.isArray(this._jBarHitPowers)) this._jBarHitPowers = [0];
			this._jBarHitPowers[(this._jBarHitsDone || 0) + 1] = power;

			this._jakePushBarMarker(this._xPosition);

			this._jBarHitsDone = (this._jBarHitsDone || 0) + 1;

			var requiredHits = Number(this._jBarRequiredHits);
			if (!isFinite(requiredHits)) requiredHits = 1;
			if (requiredHits !== -1 && this._jBarHitsDone >= Math.max(1, requiredHits)) {
				if (this._jBarPowerValue === 'multiple hits') this.setPower(this._jBarHitPowers);
				else this.setPower(power);
				this._notPressed = false;
				this._flashTime = 0;
			}
		}

		var centerX = this._window.x + (this._window.width / 2);
		var centerY = this._window.y + (this._window.height / 2);
		this._jakeApplyVisualTransform(centerX, centerY);
		this._jakeUpdateOverlayText(null, centerX, this._window.y - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(centerX, centerY);
	};

	var _jPlayDefaultCustom_v23_tail = TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones;
	TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones = function() {
		var oldShape = this._shape;
		if (this._jBarShape) this._shape = this._jBarShape;
		_jPlayDefaultCustom_v23_tail.call(this);
		this._shape = oldShape;
	};

	TimedAttackSystem.prototype._jakeActivationTriggered = function() {
		var type = this._item && this._item.type ? String(this._item.type).trim().toLowerCase() : '';
		var barType = String(SRD.TimedAttack.TAS_ID || 'default').trim().toLowerCase();
		if (type === barType || type === 'clock' || type === 'circle') {
			var keys = [];
			if (type === barType) keys = this._jBarHitKeys;
			else if (type === 'clock') keys = this._jClockHitKeys;
			else if (type === 'circle') keys = this._jCircleHitKeys;

			if (!keys || !keys.length) {
				if (type === barType) keys = J.parseKeyCodeList(params['Bar Hit Keys'], [13, 90, -1]);
				else if (type === 'clock') keys = J.parseKeyCodeList(params['Clock Hit Keys'], [13, 90, -1]);
				else keys = J.parseKeyCodeList(params['Circle Hit Keys'], [13, 90, -1]);
			}
			return J.consumeHitKeys(keys);
		}

		var triggered = false;
		try {
			triggered = !!eval(SRD.TimedAttack.activateCondition);
		} catch (e) {
			triggered = false;
		}
		if (triggered) return true;

		if (!(J.hasActiveXtas && J.hasActiveXtas())) return false;
		var cond = String(SRD.TimedAttack.activateCondition || '').toLowerCase();
		if (cond.indexOf("'ok'") < 0 && cond.indexOf('"ok"') < 0) return false;
		var okCodes = J.getActionKeyCodes ? J.getActionKeyCodes('ok') : [];
		if (!okCodes || !okCodes.length) return false;
		return J.consumeOneOf(okCodes) !== null;
	};

	TimedAttackSystem.prototype._jakePushBarMarker = function(xPos) {
		if (!this._jBarHitMarkersEnabled) return;
		if (!this._jBarMarkers) this._jBarMarkers = [];
		this._jBarMarkers.push(xPos);

		var maxMarkers = parseInt(this._jBarMaxHitMarkers);
		if (isNaN(maxMarkers)) maxMarkers = -1;
		if (maxMarkers >= 0) {
			while (this._jBarMarkers.length > maxMarkers) {
				this._jBarMarkers.shift();
			}
		}
	};

	J.parseBarShapeMode = function(value, fallback) {
		var raw = (value === undefined || value === null) ? fallback : value;
		var mode = String(raw || '').trim().toLowerCase();
		if (mode === 'circle') return 'circle';
		return 'bar';
	};

	J.parseBarNodes = function(raw) {
		var text = String(raw || '').trim();
		if (!text.length) return [];

		var tokens = J.splitTopLevelCsvAny ? J.splitTopLevelCsvAny(text) : text.split(',');
		var out = [];
		for (var i = 0; i < tokens.length; i++) {
			var token = String(tokens[i] || '').trim();
			if (!token.length) continue;

			var wrapped = token.match(/^\[\s*([\s\S]*?)\s*\]$/);
			if (wrapped) token = wrapped[1];

			var parts = J.splitTopLevelCsvAny ? J.splitTopLevelCsvAny(token) : token.split(',');
			if (parts.length < 2) continue;

			var segLength = Math.max(0, J.toEvalNumber(parts[0], 0));
			var turnAngle = J.toEvalNumber(parts[1], 0);
			var arcHeight = 0;
			if (parts.length > 2 && String(parts[2]).trim().length > 0) arcHeight = J.toEvalNumber(parts[2], 0);

			if (!isFinite(segLength)) segLength = 0;
			if (!isFinite(turnAngle)) turnAngle = 0;
			if (!isFinite(arcHeight)) arcHeight = 0;

			out.push({
				length: segLength,
				turn: turnAngle,
				arcHeight: arcHeight
			});
		}
		return out;
	};

	TimedAttackSystem.prototype._jakeBarGetShapeMode = function() {
		return J.parseBarShapeMode(this._jBarShapeMode, 'bar');
	};

	TimedAttackSystem.prototype._jakeBarHasNodePath = function() {
		return Array.isArray(this._jBarNodes) && this._jBarNodes.length > 0;
	};

	TimedAttackSystem.prototype._jakeBarBuildArcGeometry = function(startX, startY, endX, endY, arcHeight) {
		var h = J.toNumber(arcHeight, 0);
		if (!isFinite(h) || Math.abs(h) < 0.000001) return null;

		var dx = endX - startX;
		var dy = endY - startY;
		var chord = Math.sqrt((dx * dx) + (dy * dy));
		if (!isFinite(chord) || chord < 0.000001) return null;

		var ux = dx / chord;
		var uy = dy / chord;
		var nx = -uy;
		var ny = ux;

		var absH = Math.abs(h);
		var radius = ((chord * chord) / (8 * absH)) + (absH / 2);
		if (!isFinite(radius) || radius <= 0.000001) return null;

		var mx = (startX + endX) / 2;
		var my = (startY + endY) / 2;
		var d = radius - absH;
		var sign = h >= 0 ? 1 : -1;

		var cx = mx - (nx * sign * d);
		var cy = my - (ny * sign * d);

		var a0 = Math.atan2(startY - cy, startX - cx);
		var a1 = Math.atan2(endY - cy, endX - cx);
		var peakX = mx + (nx * h);
		var peakY = my + (ny * h);
		var ap = Math.atan2(peakY - cy, peakX - cx);

		var twoPi = Math.PI * 2;
		var normalizeAngle = function(v) {
			var n = v % twoPi;
			if (n < 0) n += twoPi;
			return n;
		};
		var ccwSpan = function(from, to) {
			return normalizeAngle(to - from);
		};
		var onCcwArc = function(from, to, test) {
			return ccwSpan(from, test) <= (ccwSpan(from, to) + 0.000001);
		};
		var sideForDelta = function(delta) {
			var midAng = a0 + (delta * 0.5);
			var px = cx + (Math.cos(midAng) * radius);
			var py = cy + (Math.sin(midAng) * radius);
			return ((px - mx) * nx) + ((py - my) * ny);
		};

		var deltaCCW = ccwSpan(a0, a1);
		var deltaCW = -ccwSpan(a1, a0);
		var candidates = [deltaCCW, deltaCW];
		var bestDelta = 0;
		var bestScore = -Infinity;

		for (var i = 0; i < candidates.length; i++) {
			var delta = candidates[i];
			var containsPeak = delta >= 0 ? onCcwArc(a0, a1, ap) : onCcwArc(a1, a0, ap);
			var side = sideForDelta(delta);
			var sameSide = (side * h) >= -0.000001;
			var score = 0;
			if (containsPeak) score += 4;
			if (sameSide) score += 2;
			score += 1 / (1 + Math.abs(delta));
			if (score > bestScore) {
				bestScore = score;
				bestDelta = delta;
			}
		}

		if (Math.abs(bestDelta) < 0.000001) return null;

		return {
			centerX: cx,
			centerY: cy,
			radius: radius,
			startAngle: a0,
			deltaAngle: bestDelta
		};
	};

	TimedAttackSystem.prototype._jakeBarMakeVisualSegment = function(startX, startY, endX, endY, heading, arcHeight, startS, endS) {
		var length = Math.max(0, endS - startS);
		var seg = {
			startX: startX,
			startY: startY,
			endX: endX,
			endY: endY,
			angle: heading,
			length: length,
			arcHeight: arcHeight,
			kind: 'line',
			startS: startS,
			endS: endS
		};

		if (length <= 0.000001) return seg;

		var arc = this._jakeBarBuildArcGeometry(startX, startY, endX, endY, arcHeight);
		if (arc) {
			seg.kind = 'arc';
			seg.centerX = arc.centerX;
			seg.centerY = arc.centerY;
			seg.radius = arc.radius;
			seg.startAngle = arc.startAngle;
			seg.deltaAngle = arc.deltaAngle;
		}

		return seg;
	};

	TimedAttackSystem.prototype._jakeBarPathPointOnSegment = function(seg, u) {
		if (!seg) return {x: 0, y: 0, angleDeg: 0};
		var t = J.clamp(J.toNumber(u, 0), 0, 1);

		if (seg.kind === 'arc' && isFinite(seg.radius) && seg.radius > 0.000001) {
			var ang = seg.startAngle + (seg.deltaAngle * t);
			var x = seg.centerX + (Math.cos(ang) * seg.radius);
			var y = seg.centerY + (Math.sin(ang) * seg.radius);
			var tangent = ang + ((seg.deltaAngle >= 0) ? (Math.PI / 2) : -(Math.PI / 2));
			return {
				x: x,
				y: y,
				angleDeg: tangent * 180 / Math.PI
			};
		}

		var sx = seg.startX + ((seg.endX - seg.startX) * t);
		var sy = seg.startY + ((seg.endY - seg.startY) * t);
		var sa = Math.atan2(seg.endY - seg.startY, seg.endX - seg.startX);
		return {
			x: sx,
			y: sy,
			angleDeg: sa * 180 / Math.PI
		};
	};

	TimedAttackSystem.prototype._jakeBarBuildVisualPath = function(totalWidth, startX, centerY, scaleRatio) {
		var ratio = J.toNumber(scaleRatio, 1);
		if (!isFinite(ratio) || ratio <= 0) ratio = 1;

		var totalLength = Math.max(0, J.toNumber(totalWidth, 0) * ratio);
		var path = {
			segments: [],
			totalLength: totalLength,
			startX: J.toNumber(startX, 0),
			startY: J.toNumber(centerY, 0)
		};

		var nodes = Array.isArray(this._jBarNodes) ? this._jBarNodes : [];
		var x = path.startX;
		var y = path.startY;
		var heading = 0;
		var used = 0;

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i] || {};
			var remaining = Math.max(0, totalLength - used);
			var segLength = Math.max(0, J.toNumber(node.length, 0) * ratio);
			if (!isFinite(segLength)) segLength = 0;
			if (segLength > remaining) segLength = remaining;
			var arcHeight = J.toNumber(node.arcHeight, 0) * ratio;
			if (!isFinite(arcHeight)) arcHeight = 0;

			if (segLength > 0) {
				var nextX = x + (Math.cos(heading) * segLength);
				var nextY = y + (Math.sin(heading) * segLength);
				path.segments.push(this._jakeBarMakeVisualSegment(x, y, nextX, nextY, heading, arcHeight, used, used + segLength));
				x = nextX;
				y = nextY;
				used += segLength;
			}

			heading += (J.toNumber(node.turn, 0) * Math.PI / 180);
			if (used >= totalLength) break;
		}

		var tailLength = Math.max(0, totalLength - used);
		if (tailLength > 0.000001) {
			var tailX = x + (Math.cos(heading) * tailLength);
			var tailY = y + (Math.sin(heading) * tailLength);
			path.segments.push(this._jakeBarMakeVisualSegment(x, y, tailX, tailY, heading, 0, used, used + tailLength));
		}

		return path;
	};

	TimedAttackSystem.prototype._jakeBarPathPointAt = function(path, s) {
		if (!path || !Array.isArray(path.segments) || path.segments.length <= 0) {
			var px = J.toNumber(s, 0);
			return {x: px, y: 0, angleDeg: 0};
		}

		var total = Math.max(0, J.toNumber(path.totalLength, 0));
		var ss = J.clamp(J.toNumber(s, 0), 0, total);
		var seg = path.segments[path.segments.length - 1];
		for (var i = 0; i < path.segments.length; i++) {
			if (ss <= path.segments[i].endS + 0.000001) {
				seg = path.segments[i];
				break;
			}
		}

		if (!seg || seg.length <= 0.000001) {
			var segAngle = seg ? (seg.angle * 180 / Math.PI) : 0;
			return {x: seg ? seg.startX : 0, y: seg ? seg.startY : 0, angleDeg: segAngle};
		}

		var t = J.clamp((ss - seg.startS) / seg.length, 0, 1);
		return this._jakeBarPathPointOnSegment(seg, t);
	};

	TimedAttackSystem.prototype._jakeBarDrawPathBand = function(bitmap, path, s0, s1, thickness, color) {
		if (!bitmap || !path || !Array.isArray(path.segments) || path.segments.length <= 0) return;

		var bandThickness = Math.max(1, J.toNumber(thickness, 1));
		var total = Math.max(0, J.toNumber(path.totalLength, 0));
		var a = J.clamp(J.toNumber(s0, 0), 0, total);
		var b = J.clamp(J.toNumber(s1, 0), 0, total);
		if (b < a) {
			var temp = a;
			a = b;
			b = temp;
		}

		if (Math.abs(b - a) < 0.000001) {
			var p = this._jakeBarPathPointAt(path, a);
			bitmap.drawCircle(p.x, p.y, Math.max(1, Math.floor(bandThickness / 2)), color);
			return;
		}

		var ctx = bitmap._context;
		if (!ctx) {
			var step = Math.max(1, bandThickness * 0.5);
			var count = Math.max(1, Math.ceil((b - a) / step));
			for (var i = 0; i <= count; i++) {
				var ss = a + ((b - a) * (i / count));
				var point = this._jakeBarPathPointAt(path, ss);
				bitmap.drawCircle(point.x, point.y, Math.max(1, Math.floor(bandThickness / 2)), color);
			}
			return;
		}

		ctx.save();
		ctx.strokeStyle = color || '#ffffff';
		ctx.lineWidth = bandThickness;
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 10;
		ctx.beginPath();

		var started = false;
		for (var sIdx = 0; sIdx < path.segments.length; sIdx++) {
			var seg = path.segments[sIdx];
			if (!seg || seg.length <= 0.000001) continue;

			var segA = Math.max(a, seg.startS);
			var segB = Math.min(b, seg.endS);
			if (segB <= segA + 0.000001) continue;

			var u0 = J.clamp((segA - seg.startS) / seg.length, 0, 1);
			var u1 = J.clamp((segB - seg.startS) / seg.length, 0, 1);
			var p0 = this._jakeBarPathPointOnSegment(seg, u0);

			if (!started) {
				ctx.moveTo(p0.x, p0.y);
				started = true;
			} else {
				ctx.lineTo(p0.x, p0.y);
			}

			if (seg.kind === 'arc' && isFinite(seg.radius) && seg.radius > 0.000001) {
				var ang0 = seg.startAngle + (seg.deltaAngle * u0);
				var ang1 = seg.startAngle + (seg.deltaAngle * u1);
				ctx.arc(seg.centerX, seg.centerY, seg.radius, ang0, ang1, seg.deltaAngle < 0);
			} else {
				var p1 = this._jakeBarPathPointOnSegment(seg, u1);
				ctx.lineTo(p1.x, p1.y);
			}
		}

		if (started) ctx.stroke();
		ctx.restore();
		bitmap._setDirty();
	};

	TimedAttackSystem.prototype._jakeBarCircleRadiusFor = function(cursorX, totalWidth, scaleRatio) {
		var width = Math.max(1, J.toNumber(totalWidth, 1));
		var ratio = J.toNumber(scaleRatio, 1);
		if (!isFinite(ratio) || ratio <= 0) ratio = 1;
		var maxDiameter = (width * ratio) / 2;
		var clampedX = J.clamp(J.toNumber(cursorX, 0), 0, width);
		var progress = clampedX / width;
		var diameter = maxDiameter * (1 - progress);
		if (!isFinite(diameter) || diameter < 0) diameter = 0;
		return diameter / 2;
	};

	TimedAttackSystem.prototype._jakeBarDrawRing = function(bitmap, centerX, centerY, outerRadius, innerRadius, outerColor, innerColor) {
		if (!bitmap) return;
		var outR = Math.max(0, J.toNumber(outerRadius, 0));
		var inR = Math.max(0, J.toNumber(innerRadius, 0));
		if (inR > outR) {
			var t = outR;
			outR = inR;
			inR = t;
		}
		if (outR <= 0) return;

		var ringThickness = outR - inR;
		if (!isFinite(ringThickness) || ringThickness <= 0.000001) return;
		var drawThickness = Math.max(1, ringThickness);
		var ringRadius = Math.max(0.5, outR - (drawThickness / 2));

		var ctx = bitmap._context;
		if (!ctx) return;

		ctx.save();
		ctx.strokeStyle = outerColor || '#ffffff';
		ctx.lineWidth = drawThickness;
		ctx.beginPath();
		ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2, false);
		ctx.stroke();
		ctx.restore();
		bitmap._setDirty();
	};

	TimedAttackSystem.prototype._jakePlayDefaultCustomHitzonesVisualOverride = function(shapeMode) {
		var oldShape = this._shape;
		if (this._jBarShape) this._shape = this._jBarShape;
		try {
		if (this._notPressed && this._jakeUpdateDefaultHitzoneMovements) {
			this._jakeUpdateDefaultHitzoneMovements();
		}

		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._xSpeed);
			var minX = -(this._item.width || 0);
			var maxX = this.windowWidth();
			if (this._xPosition > maxX || this._xPosition < minX) {
				if (this._jBarRepeat) {
					var infinite = (this._jBarRepeatAmount === -1);
					var canRepeat = infinite || (this._jBarRepeatCount < this._jBarRepeatAmount);
					if (!canRepeat) {
						if (this._jakeFinalizeDefaultCustom) this._jakeFinalizeDefaultCustom(false);
						else {
							this._notPressed = false;
							this._flashTime = 45;
						}
					} else {
						this._jBarRepeatCount++;
						if (this._jBarRepeatBounce) {
							this._xSpeed *= (-1);
							this._xPosition = J.clamp(this._xPosition, minX, maxX);
						} else {
							this._xPosition = this._origin;
							this._xSpeed = this._jBarStartSpeed;
						}
					}
				} else {
					if (this._jakeFinalizeDefaultCustom) this._jakeFinalizeDefaultCustom(false);
					else {
						this._notPressed = false;
						this._flashTime = 45;
					}
				}
			}
		} else {
			this._flashTime++;
		}

		if (this._flashTime >= 45) {
			BattleManager.endTASAttackThing();
			this.close();
			return;
		}

		this._window.contents.clear();
		var totalWidth = this.windowWidth();
		var contentWidth = this._window.contentsWidth();
		var contentHeight = this._window.contentsHeight();
		var scaleRatio = contentWidth / Math.max(totalWidth, 1);
		var barHeight = Math.max(2, Math.floor(this._jBarThickness || 16));
		var barY = Math.floor((contentHeight - barHeight) / 2);
		var contentPad = 0;
		if (this._window) {
			if (this._window.padding !== undefined) contentPad = J.toNumber(this._window.padding, 0);
			else if (this._window.standardPadding) contentPad = J.toNumber(this._window.standardPadding(), 0);
		}
		var absBaseX = this._window.x + contentPad;
		var absBaseY = this._window.y + contentPad;
		var cursorBitmap = this._jakePrepareCursorLayer();
		var barColor = this._jBarBackgroundColor || '#ffffff';

		if (shapeMode === 'circle') {
			var cX = Math.floor(contentWidth / 2);
			var cY = barY + Math.floor(barHeight / 2);
			var absCX = absBaseX + cX;
			var absCY = absBaseY + cY;
			var ringCenterX = absCX;
			var ringCenterY = absCY;
			if (!this._jIndependentCursor) {
				var mainAngleDeg = J.toNumber(this._angleOffset, 0);
				var mainAngle = mainAngleDeg * (Math.PI / 180);
				var mainScaleX = J.toNumber((this._visualScaleX !== undefined) ? this._visualScaleX : 1, 1);
				var mainScaleY = J.toNumber((this._visualScaleY !== undefined) ? this._visualScaleY : 1, 1);
				if (!isFinite(mainScaleX) || mainScaleX === 0) mainScaleX = 1;
				if (!isFinite(mainScaleY) || mainScaleY === 0) mainScaleY = 1;
				var mainCx = this._window ? (this._window.x + (this._window.width / 2)) : ringCenterX;
				var mainCy = this._window ? (this._window.y + (this._window.height / 2)) : ringCenterY;
				var transformedCenter = J.transformPoint(ringCenterX, ringCenterY, mainCx, mainCy, mainAngle, mainScaleX, mainScaleY);
				ringCenterX = transformedCenter.x;
				ringCenterY = transformedCenter.y;
			}

			for (var z = 0; z < this._jHitzones.length; z++) {
				var zone = this._jHitzones[z];
				if (!zone || !zone.initialized) continue;
				var m = J.getHitzoneMetrics(zone, totalWidth);

				var closeStart = m.center - m.hitLeft - m.closeLeft;
				var closeEnd = m.center + m.hitRight + m.closeRight;
				var closeOuter = this._jakeBarCircleRadiusFor(closeStart, totalWidth, scaleRatio);
				var closeInner = this._jakeBarCircleRadiusFor(closeEnd, totalWidth, scaleRatio);
				this._jakeBarDrawRing(cursorBitmap, ringCenterX, ringCenterY, closeOuter, closeInner, zone.closeColor, null);

				var hitStart = m.center - m.hitLeft;
				var hitEnd = m.center + m.hitRight;
				var hitOuter = this._jakeBarCircleRadiusFor(hitStart, totalWidth, scaleRatio);
				var hitInner = this._jakeBarCircleRadiusFor(hitEnd, totalWidth, scaleRatio);
				this._jakeBarDrawRing(cursorBitmap, ringCenterX, ringCenterY, hitOuter, hitInner, zone.hitColor, null);
			}

			if (this._jBarHitMarkersEnabled && this._jBarMarkers && this._jBarMarkers.length > 0) {
				var markerOpacityCircle = cursorBitmap.paintOpacity;
				cursorBitmap.paintOpacity = this._jBarHitMarkerOpacity;
				for (var mc = 0; mc < this._jBarMarkers.length; mc++) {
					var markerRadius = this._jakeBarCircleRadiusFor(this._jBarMarkers[mc], totalWidth, scaleRatio);
					var markerDiameter = Math.max(2, markerRadius * 2);
					this._jakeDrawDefaultCustomCursor(absCX, absCY - (markerDiameter / 2), markerDiameter, 1, cursorBitmap, null, 0, 'oval', true);
				}
				cursorBitmap.paintOpacity = markerOpacityCircle;
			}

			if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
				var liveRadius = this._jakeBarCircleRadiusFor(this._xPosition, totalWidth, scaleRatio);
				var liveDiameter = Math.max(2, liveRadius * 2);
				this._jakeDrawDefaultCustomCursor(absCX, absCY - (liveDiameter / 2), liveDiameter, 1, cursorBitmap, null, 0, 'oval', true);
			}
		} else {
			var path = this._jakeBarBuildVisualPath(totalWidth, 0, barY + Math.floor(barHeight / 2), scaleRatio);
			this._jakeBarDrawPathBand(this._window.contents, path, 0, path.totalLength, barHeight, barColor);

			for (var i = 0; i < this._jHitzones.length; i++) {
				var hz = this._jHitzones[i];
				if (!hz || !hz.initialized) continue;
				var hm = J.getHitzoneMetrics(hz, totalWidth);

				var closeS0 = (hm.center - hm.hitLeft - hm.closeLeft) * scaleRatio;
				var closeS1 = (hm.center + hm.hitRight + hm.closeRight) * scaleRatio;
				this._jakeBarDrawPathBand(this._window.contents, path, closeS0, closeS1, barHeight, hz.closeColor);

				var hitS0 = (hm.center - hm.hitLeft) * scaleRatio;
				var hitS1 = (hm.center + hm.hitRight) * scaleRatio;
				this._jakeBarDrawPathBand(this._window.contents, path, hitS0, hitS1, barHeight, hz.hitColor);
			}

			if (this._jBarHitMarkersEnabled && this._jBarMarkers && this._jBarMarkers.length > 0) {
				var markerOpacityPath = cursorBitmap.paintOpacity;
				cursorBitmap.paintOpacity = this._jBarHitMarkerOpacity;
				for (var mp = 0; mp < this._jBarMarkers.length; mp++) {
					var markerPoint = this._jakeBarPathPointAt(path, this._jBarMarkers[mp] * scaleRatio);
					this._jakeDrawDefaultCustomCursor(
						absBaseX + markerPoint.x,
						absBaseY + markerPoint.y - (barHeight / 2),
						barHeight,
						1,
						cursorBitmap,
						null,
						markerPoint.angleDeg
					);
				}
				cursorBitmap.paintOpacity = markerOpacityPath;
			}

			if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
				var livePoint = this._jakeBarPathPointAt(path, this._xPosition * scaleRatio);
				this._jakeDrawDefaultCustomCursor(
					absBaseX + livePoint.x,
					absBaseY + livePoint.y - (barHeight / 2),
					barHeight,
					1,
					cursorBitmap,
					null,
					livePoint.angleDeg
				);
			}
		}

		if (this._jakeActivationTriggered() && this._notPressed) {
			var hitData = this._jakeEvaluateDefaultHitData(this._xPosition, totalWidth);
			if (this._jBarPowerValue === 'multiple hits') {
				this._jBarHitPowers[this._jBarHitsDone + 1] = hitData.sum;
			} else {
				for (var h = 1; h < hitData.zonePowers.length; h++) {
					if (hitData.zonePowers[h] > 0) this._jBarZonePowers[h] = hitData.zonePowers[h];
				}
			}

			this._jakePushBarMarker(this._xPosition);
			this._jBarHitsDone++;
			AudioManager.playSe({"name":this._se,"pan":0,"pitch":100,"volume":100});

			if (this._jBarRequiredHits !== -1 && this._jBarHitsDone >= this._jBarRequiredHits) {
				if (this._jakeFinalizeDefaultCustom) this._jakeFinalizeDefaultCustom(true);
				else {
					this.setPower(this._jBarPowerValue === 'multiple hits' ? this._jBarHitPowers : this._jBarZonePowers);
					this._notPressed = false;
					this._flashTime = 45;
				}
			}
		}

		var centerX = this._window.x + (this._window.width / 2);
		var centerY = this._window.y + (this._window.height / 2);
		this._jakeApplyVisualTransform(centerX, centerY);
		this._jakeUpdateOverlayText(null, centerX, this._window.y - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(centerX, centerY);
		} finally {
			this._shape = oldShape;
		}
	};

	TimedAttackSystem.prototype._jakePlayDefaultSetHitzoneVisualOverride = function(shapeMode) {
		var oldShape = this._shape;
		if (this._jBarShape) this._shape = this._jBarShape;
		try {
		if (this._notPressed) {
			var f = this._frame;
			this._xPosition += Number(eval(this._item.speed) * this._xSpeed);
			if (this._xPosition > this.windowWidth() || this._xPosition < -(this._item.width)) {
				if (this._rt === 'repeat') {
					this._xPosition = this._origin;
				} else if (this._rt === 'reverse') {
					this._xSpeed *= (-1);
				} else {
					if (this._jBarPowerValue === 'multiple hits') {
						if (this._jBarIncompleteValue === false && this._jakeDefaultCustomZeroPower) this.setPower(this._jakeDefaultCustomZeroPower());
						else this.setPower(this._jBarHitPowers || [0]);
					} else {
						var failPower = 0;
						if (this._jBarIncompleteValue !== false && (this._jBarHitsDone || 0) > 0) failPower = Number(this._jBarStandardLastPower || 0);
						this.setPower(J.clamp(failPower, 0, 1));
					}
					this._flashTime = 45;
				}
			}
		} else {
			this._flashTime++;
		}

		if (this._flashTime === 45) {
			BattleManager.endTASAttackThing();
			this.close();
			return;
		}

		this._window.contents.clear();
		var totalWidth = this.windowWidth();
		var contentWidth = this._window.contentsWidth();
		var contentHeight = this._window.contentsHeight();
		var cursorBaseH = Math.max(2, Math.floor(J.toNumber(this._jBarThickness, 16)));
		if (!isFinite(cursorBaseH)) cursorBaseH = 16;
		cursorBaseH = Math.min(contentHeight, cursorBaseH);
		var cursorBaseY = Math.floor((contentHeight - cursorBaseH) / 2);
		var contentPad = 0;
		if (this._window) {
			if (this._window.padding !== undefined) contentPad = J.toNumber(this._window.padding, 0);
			else if (this._window.standardPadding) contentPad = J.toNumber(this._window.standardPadding(), 0);
		}
		var absBaseX = this._window.x + contentPad;
		var absBaseY = this._window.y + contentPad;
		var cursorBitmap = this._jakePrepareCursorLayer();
		var barColor = this._jBarBackgroundColor || '#ffffff';

		if (shapeMode === 'circle') {
			var cX = Math.floor(contentWidth / 2);
			var cY = cursorBaseY + Math.floor(cursorBaseH / 2);
			var absCX = absBaseX + cX;
			var absCY = absBaseY + cY;

			if (this._jBarHitMarkersEnabled && this._jBarMarkers && this._jBarMarkers.length > 0) {
				var markerOpacityCircle = cursorBitmap.paintOpacity;
				cursorBitmap.paintOpacity = this._jBarHitMarkerOpacity;
				for (var mc = 0; mc < this._jBarMarkers.length; mc++) {
					var markerRadius = this._jakeBarCircleRadiusFor(this._jBarMarkers[mc], totalWidth, 1);
					var markerDiameter = Math.max(2, markerRadius * 2);
					this._jakeDrawDefaultCustomCursor(absCX, absCY - (markerDiameter / 2), markerDiameter, 1, cursorBitmap, null, 0, 'oval', true);
				}
				cursorBitmap.paintOpacity = markerOpacityCircle;
			}

			if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
				var liveRadius = this._jakeBarCircleRadiusFor(this._xPosition, totalWidth, 1);
				var liveDiameter = Math.max(2, liveRadius * 2);
				this._jakeDrawDefaultCustomCursor(absCX, absCY - (liveDiameter / 2), liveDiameter, 1, cursorBitmap, null, 0, 'oval', true);
			}
		} else {
			var path = this._jakeBarBuildVisualPath(totalWidth, 0, cursorBaseY + Math.floor(cursorBaseH / 2), 1);
			this._jakeBarDrawPathBand(this._window.contents, path, 0, path.totalLength, cursorBaseH, barColor);

			if (this._jBarHitMarkersEnabled && this._jBarMarkers && this._jBarMarkers.length > 0) {
				var markerOpacityPath = cursorBitmap.paintOpacity;
				cursorBitmap.paintOpacity = this._jBarHitMarkerOpacity;
				for (var mp = 0; mp < this._jBarMarkers.length; mp++) {
					var markerPoint = this._jakeBarPathPointAt(path, this._jBarMarkers[mp]);
					this._jakeDrawDefaultCustomCursor(
						absBaseX + markerPoint.x,
						absBaseY + markerPoint.y - (cursorBaseH / 2),
						cursorBaseH,
						1,
						cursorBitmap,
						null,
						markerPoint.angleDeg
					);
				}
				cursorBitmap.paintOpacity = markerOpacityPath;
			}

			if (this._flashTime % this._flash < Math.floor(this._flash / 2)) {
				var livePoint = this._jakeBarPathPointAt(path, this._xPosition);
				this._jakeDrawDefaultCustomCursor(
					absBaseX + livePoint.x,
					absBaseY + livePoint.y - (cursorBaseH / 2),
					cursorBaseH,
					1,
					cursorBitmap,
					null,
					livePoint.angleDeg
				);
			}
		}

		if (this._jakeActivationTriggered() && this._notPressed) {
			AudioManager.playSe({"name":this._se,"pan":0,"pitch":100,"volume":100});
			var x = this._xPosition;
			var entireLength = this.width;
			var target = eval(this._target);
			var denom = Number(entireLength - target);
			if (!isFinite(denom) || Math.abs(denom) < 0.000001) denom = 1;
			var power = Number(1 - (Math.abs(target - x) / denom));
			if (!isFinite(power)) power = 0;
			power = J.clamp(power, 0, 1);
			this._jBarStandardLastPower = power;

			if (!Array.isArray(this._jBarHitPowers)) this._jBarHitPowers = [0];
			this._jBarHitPowers[(this._jBarHitsDone || 0) + 1] = power;
			this._jakePushBarMarker(this._xPosition);
			this._jBarHitsDone = (this._jBarHitsDone || 0) + 1;

			var requiredHits = Number(this._jBarRequiredHits);
			if (!isFinite(requiredHits)) requiredHits = 1;
			if (requiredHits !== -1 && this._jBarHitsDone >= Math.max(1, requiredHits)) {
				if (this._jBarPowerValue === 'multiple hits') this.setPower(this._jBarHitPowers);
				else this.setPower(power);
				this._notPressed = false;
				this._flashTime = 0;
			}
		}

		var centerX = this._window.x + (this._window.width / 2);
		var centerY = this._window.y + (this._window.height / 2);
		this._jakeApplyVisualTransform(centerX, centerY);
		this._jakeUpdateOverlayText(null, centerX, this._window.y - (this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(centerX, centerY);
		} finally {
			this._shape = oldShape;
		}
	};

	TimedAttackSystem.prototype._jakeApplyOverlayTransform = function(sprite, baseX, baseY, offsetX, offsetY, extraAngle, extraScaleX, extraScaleY, independent) {
		if (!sprite) return;
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

		var anchorX = centerX;
		var anchorY = centerY;
		var kb = this._jakeKeysBounds;
		if (kb && isFinite(kb.minX) && isFinite(kb.maxX) && isFinite(kb.minY) && isFinite(kb.maxY)) {
			anchorX = (kb.minX + kb.maxX) / 2;
			anchorY = (kb.minY + kb.maxY) / 2;
		} else if (this._jArrowSprites && this._jArrowSprites.length > 0) {
			var minX = Infinity;
			var minY = Infinity;
			var maxX = -Infinity;
			var maxY = -Infinity;
			for (var i = 0; i < this._jArrowSprites.length; i++) {
				var sp = this._jArrowSprites[i];
				if (!sp) continue;
				if (sp.opacity <= 0) continue;
				var sx = J.toNumber(sp.x, 0);
				var sy = J.toNumber(sp.y, 0);
				var scx = sp.scale ? Math.abs(J.toNumber(sp.scale.x, 1)) : 1;
				var scy = sp.scale ? Math.abs(J.toNumber(sp.scale.y, 1)) : 1;
				var sw = (sp.bitmap && sp.bitmap.width > 0) ? (sp.bitmap.width * scx) : J.toNumber(this._jArrowSlotSize, 0);
				var sh = (sp.bitmap && sp.bitmap.height > 0) ? (sp.bitmap.height * scy) : J.toNumber(this._jArrowSlotSize, 0);
				if (sx < minX) minX = sx;
				if (sy < minY) minY = sy;
				if (sx + sw > maxX) maxX = sx + sw;
				if (sy + sh > maxY) maxY = sy + sh;
			}
			if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
				anchorX = (minX + maxX) / 2;
				anchorY = (minY + maxY) / 2;
			}
		}

		var cx = this._jVisualCenterX || centerX;
		var cy = this._jVisualCenterY || centerY;
		var px = anchorX + (this._keysXOffset || 0);
		var py = anchorY + (this._keysYOffset || 0);
		var p = includeMain ? J.transformPoint(px, py, cx, cy, mainAngle, mainScaleX, mainScaleY) : {x:px, y:py};
		this._jakeKeysLayer.visible = true;
		this._jakeKeysLayer.pivot.x = anchorX;
		this._jakeKeysLayer.pivot.y = anchorY;
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

	//-----------------------------------------------------------------------------
	// v2.3.1 Bar Cursor Runtime Override
	// Replaces Bar cursor value resolution with a Balance-style runtime application.
	//-----------------------------------------------------------------------------
	var _jApplyDefaultProps_v231_cursorOverride = J.applyDefaultProps;
	J.applyDefaultProps = function(o, source, semicolonMode) {
		_jApplyDefaultProps_v231_cursorOverride.call(this, o, source, semicolonMode);
		if (!o || o.type !== SRD.TimedAttack.TAS_ID) return;
		o._jakeBarCursorSource = String(source || '');
		o._jakeBarCursorSemicolonMode = !!semicolonMode;
	};

	J._readLastBarProperty = function(source, patterns, semicolonMode) {
		var text = String(source || '');
		var list = Array.isArray(patterns) ? patterns : [patterns];
		var best = null;
		for (var i = 0; i < list.length; i++) {
			var info = J.getValueInfo(text, list[i], semicolonMode, true);
			if (info && (!best || info.index >= best.index)) best = info;
		}
		return best ? best.value : null;
	};

	TimedAttackSystem.prototype._jakeApplyBarCursorRuntime = function(item) {
		if (!item || item.type !== SRD.TimedAttack.TAS_ID) return;

		var info = '';
		var semicolonMode = false;
		if (item._jakeBarCursorSource !== undefined && item._jakeBarCursorSource !== null && String(item._jakeBarCursorSource).length > 0) {
			info = String(item._jakeBarCursorSource);
			semicolonMode = !!item._jakeBarCursorSemicolonMode;
		} else if (item.info !== undefined && item.info !== null) {
			info = String(item.info);
		}

		var dRawX = params['Bar Cursor Visual X Offset'];
		if (dRawX === undefined || dRawX === null || String(dRawX).trim().length === 0) dRawX = params['Bar Cursor X Offset'];
		var dRawY = params['Bar Cursor Visual Y Offset'];
		if (dRawY === undefined || dRawY === null || String(dRawY).trim().length === 0) dRawY = params['Bar Cursor Y Offset'];
		var dX = J.toEvalNumber(dRawX, 0);
		var dY = J.toEvalNumber(dRawY, 0);
		var dAngle = J.toEvalNumber(params['Bar Cursor Angle'], 0);
		var dScaleX = J.toEvalNumber(params['Bar Cursor Scale X'], 1);
		var dScaleY = J.toEvalNumber(params['Bar Cursor Scale Y'], 1);
		var dColorRaw = String(params['Bar Cursor Color'] || '').trim();
		var dColor = dColorRaw.length > 0 ? dColorRaw : '#000000';
		var dThickness = Math.max(1, J.toEvalNumber(params['Bar Cursor Thickness'], 4));
		var dIndependent = String(params['Bar Independent Cursor'] || 'false').trim().toLowerCase() === 'true';

		var nX = J._readLastBarProperty(info, [
			'Bar[ ]?Cursor[ ]?Visual[ ]?X[ ]?Offset',
			'Bar[ ]?Cursor[ ]?X[ ]?Offset',
			'Cursor[ ]?Visual[ ]?X[ ]?Offset',
			'Cursor[ ]?X[ ]?Offset'
		], semicolonMode);
		var nY = J._readLastBarProperty(info, [
			'Bar[ ]?Cursor[ ]?Visual[ ]?Y[ ]?Offset',
			'Bar[ ]?Cursor[ ]?Y[ ]?Offset',
			'Cursor[ ]?Visual[ ]?Y[ ]?Offset',
			'Cursor[ ]?Y[ ]?Offset'
		], semicolonMode);
		var nAngle = J._readLastBarProperty(info, [
			'Bar[ ]?Cursor[ ]?Angle[ ]?Offset',
			'Bar[ ]?Cursor[ ]?Angle',
			'Cursor[ ]?Angle[ ]?Offset',
			'Cursor[ ]?Angle'
		], semicolonMode);
		var nScaleX = J._readLastBarProperty(info, ['Bar[ ]?Cursor[ ]?Scale[ ]?X', 'Cursor[ ]?Scale[ ]?X'], semicolonMode);
		var nScaleY = J._readLastBarProperty(info, ['Bar[ ]?Cursor[ ]?Scale[ ]?Y', 'Cursor[ ]?Scale[ ]?Y'], semicolonMode);
		var nColor = J._readLastBarProperty(info, ['Bar[ ]?Cursor[ ]?Color', 'Cursor[ ]?Color'], semicolonMode);
		var nThickness = J._readLastBarProperty(info, ['Bar[ ]?Cursor[ ]?Thickness', 'Cursor[ ]?Thickness'], semicolonMode);
		var nIndependent = J._readLastBarProperty(info, ['Independent[ ]?Cursor', 'Bar[ ]?Independent[ ]?Cursor', 'Bar[ ]?Cursor[ ]?Independent'], semicolonMode);

		var itemX = (item.jakeCursorVisualXOffset !== undefined) ? item.jakeCursorVisualXOffset : item.jakeCursorXOffset;
		var itemY = (item.jakeCursorVisualYOffset !== undefined) ? item.jakeCursorVisualYOffset : item.jakeCursorYOffset;
		var itemAngle = (item.jakeCursorAngleOffset !== undefined) ? item.jakeCursorAngleOffset : item.jakeCursorAngle;
		var itemScaleX = (item.jakeCursorScaleX !== undefined) ? item.jakeCursorScaleX : 1;
		var itemScaleY = (item.jakeCursorScaleY !== undefined) ? item.jakeCursorScaleY : 1;
		var itemColor = (item.jakeCursorColor !== undefined) ? item.jakeCursorColor : dColor;
		var itemThickness = (item.jakeCursorThickness !== undefined) ? item.jakeCursorThickness : dThickness;

		this._cursorVisualXOffset = J.toEvalNumber(nX !== null ? nX : ((itemX !== undefined) ? itemX : dX), dX);
		this._cursorVisualYOffset = J.toEvalNumber(nY !== null ? nY : ((itemY !== undefined) ? itemY : dY), dY);
		this._cursorAngleOffset = J.toEvalNumber(nAngle !== null ? nAngle : ((itemAngle !== undefined) ? itemAngle : dAngle), dAngle);
		this._cursorScaleX = J.toEvalNumber(nScaleX !== null ? nScaleX : ((itemScaleX !== undefined) ? itemScaleX : dScaleX), dScaleX);
		this._cursorScaleY = J.toEvalNumber(nScaleY !== null ? nScaleY : ((itemScaleY !== undefined) ? itemScaleY : dScaleY), dScaleY);

		var resolvedColor = (nColor !== null) ? String(nColor).trim() : String(itemColor || '').trim();
		if (!resolvedColor.length) resolvedColor = String(item.color || '#000000');
		this._cursorColor = resolvedColor;
		this._jBarCursorThickness = Math.max(1, J.toEvalNumber(nThickness !== null ? nThickness : itemThickness, dThickness));

		if (nIndependent !== null) {
			this._jIndependentCursor = J.parseBool(nIndependent, dIndependent);
		} else if (item.jakeIndependentCursor !== undefined) {
			this._jIndependentCursor = !!item.jakeIndependentCursor;
		} else {
			this._jIndependentCursor = dIndependent;
		}

		if (!isFinite(this._cursorScaleX) || this._cursorScaleX === 0) this._cursorScaleX = 1;
		if (!isFinite(this._cursorScaleY) || this._cursorScaleY === 0) this._cursorScaleY = 1;
	};

	var _jLoadItem_v231_cursorOverride = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		_jLoadItem_v231_cursorOverride.call(this, item);
		this._jakeApplyBarCursorRuntime(item);
	};

	var _jPlayDefault_v231_cursorOverride = TimedAttackSystem.prototype.playDefaultGame;
	TimedAttackSystem.prototype.playDefaultGame = function() {
		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID) {
			this._jakeApplyBarCursorRuntime(this._item);
		}
		_jPlayDefault_v231_cursorOverride.call(this);
	};

	var _jApplyDefaultProps_v232_shapeModeNodes = J.applyDefaultProps;
	J.applyDefaultProps = function(o, source, semicolonMode) {
		_jApplyDefaultProps_v232_shapeModeNodes.call(this, o, source, semicolonMode);
		if (!o || o.type !== SRD.TimedAttack.TAS_ID) return;

		var defaultShapeMode = J.parseBarShapeMode(params['Bar Shape Mode'], 'bar');
		var defaultCursorThickness = Math.max(1, J.toEvalNumber(params['Bar Cursor Thickness'], 4));
		var modeRaw = J.getFirstValue(source, ['Shape[ ]?Mode', 'Bar[ ]?Shape[ ]?Mode'], semicolonMode);
		o.jakeBarShapeMode = J.parseBarShapeMode(modeRaw !== null ? modeRaw : o.jakeBarShapeMode, defaultShapeMode);

		var cursorThicknessRaw = J.getFirstValue(source, ['Bar[ ]?Cursor[ ]?Thickness', 'Cursor[ ]?Thickness'], semicolonMode);
		if (cursorThicknessRaw !== null) o.jakeCursorThickness = Math.max(1, J.toEvalNumber(cursorThicknessRaw, defaultCursorThickness));
		else if (o.jakeCursorThickness === undefined) o.jakeCursorThickness = defaultCursorThickness;

		var nodesRaw = J.getValue(source, 'Bar[ ]?Nodes', semicolonMode);
		if (nodesRaw === null && o.jakeBarNodesRaw === undefined) nodesRaw = String(params['Bar Nodes'] || '');
		if (nodesRaw !== null) o.jakeBarNodesRaw = String(nodesRaw || '');
		o.jakeBarNodes = J.parseBarNodes(o.jakeBarNodesRaw || '');

		if (!String(o.jakeCursorColor || '').trim().length) o.jakeCursorColor = '#000000';
	};

	var _jLoadItem_v232_shapeModeNodes = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		_jLoadItem_v232_shapeModeNodes.call(this, item);
		if (!(item && item.type === SRD.TimedAttack.TAS_ID)) return;

		this._jBarShapeMode = J.parseBarShapeMode(item.jakeBarShapeMode, 'bar');
		this._jBarCursorThickness = Math.max(1, J.toEvalNumber(item.jakeCursorThickness, J.toEvalNumber(params['Bar Cursor Thickness'], 4)));
		if (Array.isArray(item.jakeBarNodes)) this._jBarNodes = J.deepClone(item.jakeBarNodes);
		else this._jBarNodes = J.parseBarNodes(item.jakeBarNodesRaw || params['Bar Nodes'] || '');
	};

	var _jPlayDefault_v232_shapeModeNodes = TimedAttackSystem.prototype.playDefaultGame;
	TimedAttackSystem.prototype.playDefaultGame = function() {
		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID && this._jDefaultMode !== 'custom hitzones') {
			var shapeMode = this._jakeBarGetShapeMode();
			if (shapeMode === 'circle' || this._jakeBarHasNodePath()) {
				this._jakePlayDefaultSetHitzoneVisualOverride(shapeMode);
				return;
			}
		}
		_jPlayDefault_v232_shapeModeNodes.call(this);
	};

	var _jPlayDefaultCustom_v232_shapeModeNodes = TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones;
	TimedAttackSystem.prototype._jakePlayDefaultCustomHitzones = function() {
		if (this._item && this._item.type === SRD.TimedAttack.TAS_ID && this._jDefaultMode === 'custom hitzones') {
			var shapeMode = this._jakeBarGetShapeMode();
			if (shapeMode === 'circle' || this._jakeBarHasNodePath()) {
				this._jakePlayDefaultCustomHitzonesVisualOverride(shapeMode);
				return;
			}
		}
		_jPlayDefaultCustom_v232_shapeModeNodes.call(this);
	};

	TimedAttackSystem.prototype._jakeSetupOpacityRuntime = function(item) {
		var baseFromWindow = J.toOpacity(item && item.opacity, 255);
		var mainRaw = (item && item.jakeVisualOpacity !== undefined) ? item.jakeVisualOpacity : 255;
		this._jMainVisualOpacity = J.toOpacity(mainRaw, 255);
		this._jWindowVisualOpacity = baseFromWindow;
		this._jMainVisualOpacityExplicit = !!(item && item.jakeMainOpacityExplicit);

		this._jSubVisualOpacity = {};
		this._jExplicitSubOpacityKeys = {};
		this._jDefaultSubOpacityKeys = {};
		if (item) {
			if (item.jakeExplicitSubOpacityKeys) {
				for (var explicitKey in item.jakeExplicitSubOpacityKeys) {
					if (!item.jakeExplicitSubOpacityKeys.hasOwnProperty(explicitKey)) continue;
					var runtimeExplicitKey = J.opacityKey(explicitKey);
					if (!runtimeExplicitKey.length) continue;
					this._jExplicitSubOpacityKeys[runtimeExplicitKey] = !!item.jakeExplicitSubOpacityKeys[explicitKey];
				}
			}
			if (item.jakeDefaultSubOpacityKeys) {
				for (var defaultKey in item.jakeDefaultSubOpacityKeys) {
					if (!item.jakeDefaultSubOpacityKeys.hasOwnProperty(defaultKey)) continue;
					var runtimeDefaultKey = J.opacityKey(defaultKey);
					if (!runtimeDefaultKey.length) continue;
					this._jDefaultSubOpacityKeys[runtimeDefaultKey] = !!item.jakeDefaultSubOpacityKeys[defaultKey];
				}
			}
			if (item.jakeSubOpacities) {
				for (var key in item.jakeSubOpacities) {
					if (!item.jakeSubOpacities.hasOwnProperty(key)) continue;
					this._jSubVisualOpacity[J.opacityKey(key)] = J.toOpacity(item.jakeSubOpacities[key], this._jMainVisualOpacity);
				}
			}
		}

		if (item && item.type === SRD.TimedAttack.TAS_ID) {
			var markerFallback = (item.jakeBarHitMarkerOpacity !== undefined && item.jakeBarHitMarkerOpacity !== null)
				? item.jakeBarHitMarkerOpacity
				: J.getParamOpacityAny(params, ['Default (Bar) Markers Opacity', 'Default Markers Opacity'], 127);
			var markerBaseFallback = this._jMainVisualOpacityExplicit ? this._jMainVisualOpacity : markerFallback;
			this._jBarHitMarkerOpacity = this._jakeResolveElementOpacity(['Markers', 'Hit Marker'], markerBaseFallback);
		}
	};

	TimedAttackSystem.prototype._jakeResolveElementOpacity = function(names, fallback) {
		var base = J.toOpacity((this._jMainVisualOpacity !== undefined) ? this._jMainVisualOpacity : (this._item ? this._item.opacity : 255), 255);
		var map = this._jSubVisualOpacity || {};
		var explicitMap = this._jExplicitSubOpacityKeys || {};
		var hasMainExplicit = !!this._jMainVisualOpacityExplicit;
		if (names !== undefined && names !== null) {
			var list = Array.isArray(names) ? names : [names];
			for (var i = 0; i < list.length; i++) {
				var key = J.opacityKey(list[i]);
				if (!key.length) continue;
				if (!map.hasOwnProperty(key)) continue;
				if (hasMainExplicit && !explicitMap[key]) continue;
				return J.toOpacity(map[key], base);
			}
		}
		if (fallback !== undefined) return J.toOpacity(fallback, base);
		return base;
	};

	TimedAttackSystem.prototype._jakeApplyConfiguredOpacities = function() {
		if (!this._item) return;

		var mainOpacity = this._jakeResolveElementOpacity(null);
		var baseWindowOpacity = (this._jWindowVisualOpacity !== undefined) ? this._jWindowVisualOpacity : J.toOpacity(this._item.opacity, 255);
		var windowOpacity = this._jakeResolveElementOpacity('Window', baseWindowOpacity);
		var itemType = String(this._item.type || '').trim().toLowerCase();
		var defaultType = String(SRD.TimedAttack.TAS_ID || 'default').trim().toLowerCase();

		var contentOpacity = mainOpacity;
		if (itemType === 'mash') contentOpacity = this._jakeResolveElementOpacity('Main Bar', mainOpacity);
		if (itemType === 'clock') contentOpacity = 255;
		if (itemType === 'balance') contentOpacity = 255;

		if (this.opacity !== undefined) this.opacity = windowOpacity;
		if (this._window && this._window.opacity !== undefined) this._window.opacity = windowOpacity;
		if (this._content) this._content.opacity = contentOpacity;
		if (this._window && this._window.contentsOpacity !== undefined) {
			if (itemType === defaultType) this._window.contentsOpacity = this._jakeResolveElementOpacity('Main Bar', mainOpacity);
			else this._window.contentsOpacity = mainOpacity;
		}

		if (this._jakeTextSprite) this._jakeTextSprite.opacity = this._jakeResolveElementOpacity('Text', mainOpacity);
		if (this._jakePictureSprite) this._jakePictureSprite.opacity = this._jakeResolveElementOpacity('Picture', mainOpacity);
		if (this._jakeKeysLayer) this._jakeKeysLayer.opacity = this._jakeResolveElementOpacity('Keys', mainOpacity);
		if (this._jakeStopKeyLayer) this._jakeStopKeyLayer.opacity = this._jakeResolveElementOpacity('Stop Key', mainOpacity);
		if (this._jakeCursorLayer) this._jakeCursorLayer.opacity = this._jakeResolveElementOpacity('Cursor', mainOpacity);
		if (this._jakeBalanceFeatureLayer) this._jakeBalanceFeatureLayer.opacity = mainOpacity;

		if (this._backSprite) this._backSprite.opacity = this._jakeResolveElementOpacity('Ring', mainOpacity);
		if (this._targetSprite) this._targetSprite.opacity = this._jakeResolveElementOpacity('Target', mainOpacity);

		var commandOpacity = this._jakeResolveElementOpacity(['Command', 'Commands', 'Arrow', 'Arrows'], mainOpacity);
		if (Array.isArray(this._sprites)) {
			for (var i = 0; i < this._sprites.length; i++) {
				var sp = this._sprites[i];
				if (!sp) continue;
				sp.opacity = Math.min(J.toOpacity(sp.opacity, commandOpacity), commandOpacity);
			}
		}
		if (Array.isArray(this._jArrowSprites)) {
			for (var j = 0; j < this._jArrowSprites.length; j++) {
				var asp = this._jArrowSprites[j];
				if (!asp) continue;
				asp.opacity = Math.min(J.toOpacity(asp.opacity, commandOpacity), commandOpacity);
			}
		}
		if (this._jArrowContainer) this._jArrowContainer.opacity = commandOpacity;
	};

	function jSourceHasValue(source, pattern, semicolonMode) {
		return J.getValue(source, pattern, semicolonMode) !== null;
	}

	function jApplyTypeDefault(o, propName, source, pattern, semicolonMode, applyFn) {
		if (!o || o[propName] !== undefined) return;
		if (jSourceHasValue(source, pattern, semicolonMode)) return;
		applyFn();
	}

	var _jApplyGeneralProps_v232_typeDefaults = J.applyGeneralProps;
	J.applyGeneralProps = function(o, source, semicolonMode) {
		_jApplyGeneralProps_v232_typeDefaults.call(this, o, source, semicolonMode);
		if (!o) return;

		var typeName = o.type;

		jApplyTypeDefault(o, 'jakeNoSkillUse', source, 'No Skill Use', semicolonMode, function() {
			o.jakeNoSkillUse = J._getTypeDefaultBool(typeName, 'No Skill Use', !!o.jakeNoSkillUse);
		});
		jApplyTypeDefault(o, 'jakeResetOnUse', source, 'Reset on Use', semicolonMode, function() {
			o.jakeResetOnUse = J._getTypeDefaultBool(typeName, 'Reset on Use', !!o.jakeResetOnUse);
		});
		jApplyTypeDefault(o, 'jakeResetOnBattleEnd', source, 'Reset on (?:Battle End|End Battle)', semicolonMode, function() {
			o.jakeResetOnBattleEnd = J._getTypeDefaultBool(typeName, 'Reset on Battle End', !!o.jakeResetOnBattleEnd);
		});

		jApplyTypeDefault(o, 'jakeIndependentText', source, 'Independent Text', semicolonMode, function() {
			o.jakeIndependentText = J._getTypeDefaultBool(typeName, 'Independent Text', !!o.jakeIndependentText);
		});
		jApplyTypeDefault(o, 'jakeIndependentPicture', source, 'Independent Picture', semicolonMode, function() {
			o.jakeIndependentPicture = J._getTypeDefaultBool(typeName, 'Independent Picture', !!o.jakeIndependentPicture);
		});
		jApplyTypeDefault(o, 'jakeIndependentIcons', source, 'Independent Icons', semicolonMode, function() {
			o.jakeIndependentIcons = J._getTypeDefaultBool(typeName, 'Independent Icons', !!o.jakeIndependentIcons);
		});

		jApplyTypeDefault(o, 'jakeKeysXOffset', source, 'Keys X Offset', semicolonMode, function() {
			o.jakeKeysXOffset = J._getTypeDefaultEvalNumber(typeName, 'Keys X Offset', J.toEvalNumber(o.jakeKeysXOffset, 0));
		});
		jApplyTypeDefault(o, 'jakeKeysYOffset', source, 'Keys Y Offset', semicolonMode, function() {
			o.jakeKeysYOffset = J._getTypeDefaultEvalNumber(typeName, 'Keys Y Offset', J.toEvalNumber(o.jakeKeysYOffset, 0));
		});
		jApplyTypeDefault(o, 'jakeKeysAngle', source, 'Keys Angle(?: Offset)?', semicolonMode, function() {
			o.jakeKeysAngle = J._getTypeDefaultEvalNumber(typeName, 'Keys Angle', J.toEvalNumber(o.jakeKeysAngle, 0));
		});
		jApplyTypeDefault(o, 'jakeKeysScaleX', source, 'Keys Scale X', semicolonMode, function() {
			o.jakeKeysScaleX = J._getTypeDefaultEvalNumber(typeName, 'Keys Scale X', J.toEvalNumber(o.jakeKeysScaleX, 1));
		});
		jApplyTypeDefault(o, 'jakeKeysScaleY', source, 'Keys Scale Y', semicolonMode, function() {
			o.jakeKeysScaleY = J._getTypeDefaultEvalNumber(typeName, 'Keys Scale Y', J.toEvalNumber(o.jakeKeysScaleY, 1));
		});
		jApplyTypeDefault(o, 'visualScaleX', source, 'Visual Scale X', semicolonMode, function() {
			o.visualScaleX = J._getTypeDefaultEvalNumber(typeName, 'Visual Scale X', J.toEvalNumber(o.visualScaleX, 1));
		});
		jApplyTypeDefault(o, 'visualScaleY', source, 'Visual Scale Y', semicolonMode, function() {
			o.visualScaleY = J._getTypeDefaultEvalNumber(typeName, 'Visual Scale Y', J.toEvalNumber(o.visualScaleY, 1));
		});
	};

	var _jApplyDefaultProps_v232_typeDefaults = J.applyDefaultProps;
	J.applyDefaultProps = function(o, source, semicolonMode) {
		_jApplyDefaultProps_v232_typeDefaults.call(this, o, source, semicolonMode);
		if (!o || J._resolveTypeDefaultKey(o.type) !== 'default') return;

		jApplyTypeDefault(o, 'jakeDefaultMode', source, 'Mode', semicolonMode, function() {
			o.jakeDefaultMode = J.normalizeDefaultMode(J._getTypeDefaultRaw(o.type, 'Mode', (o.jakeDefaultMode !== undefined ? String(o.jakeDefaultMode) : 'center hit')));
		});
		jApplyTypeDefault(o, 'jakeBarBackgroundColor', source, 'Background[ ]?Color', semicolonMode, function() {
			o.jakeBarBackgroundColor = String(J._getTypeDefaultRaw(o.type, 'Background Color', (o.jakeBarBackgroundColor !== undefined ? String(o.jakeBarBackgroundColor) : '#ffffff')));
		});
		jApplyTypeDefault(o, 'jakeBarThickness', source, 'Thickness', semicolonMode, function() {
			o.jakeBarThickness = Math.max(1, J._getTypeDefaultInt(o.type, 'Thickness', (o.jakeBarThickness !== undefined ? o.jakeBarThickness : 16)));
		});
		jApplyTypeDefault(o, 'jakeBarPowerValue', source, 'Power[ ]?Value', semicolonMode, function() {
			o.jakeBarPowerValue = J.normalizeDefaultPowerValue(J._getTypeDefaultRaw(o.type, 'Power Value', (o.jakeBarPowerValue !== undefined ? String(o.jakeBarPowerValue) : 'multiple hitzones')));
		});
		jApplyTypeDefault(o, 'jakeBarRepeat', source, 'Repeat(?![ ]?Type)(?![ ]?Bounce)(?![ ]?amount)', semicolonMode, function() {
			o.jakeBarRepeat = J._getTypeDefaultBool(o.type, 'Repeat', !!o.jakeBarRepeat);
		});
		jApplyTypeDefault(o, 'jakeBarRepeatBounce', source, 'Repeat[ ]?Bounce', semicolonMode, function() {
			o.jakeBarRepeatBounce = J._getTypeDefaultBool(o.type, 'Repeat Bounce', !!o.jakeBarRepeatBounce);
		});
		jApplyTypeDefault(o, 'jakeBarRepeatAmount', source, 'Repeat[ ]?amount', semicolonMode, function() {
			o.jakeBarRepeatAmount = J._getTypeDefaultInt(o.type, 'Repeat amount', (o.jakeBarRepeatAmount !== undefined ? o.jakeBarRepeatAmount : 0));
		});
		jApplyTypeDefault(o, 'jakeBarIncompleteValue', source, 'Incomplete[ ]?Value', semicolonMode, function() {
			o.jakeBarIncompleteValue = J._getTypeDefaultBool(o.type, 'Incomplete Value', (o.jakeBarIncompleteValue !== false));
		});
		jApplyTypeDefault(o, 'jakeBarHitMarkers', source, 'Hit[ ]?Markers', semicolonMode, function() {
			o.jakeBarHitMarkers = J._getTypeDefaultBool(o.type, 'Hit Markers', (o.jakeBarHitMarkers !== false));
		});
		if (o.jakeBarMaxHitMarkers === undefined && !jSourceHasValue(source, 'Max[ ]?Hit[ ]?Markers', semicolonMode) && !jSourceHasValue(source, 'Max[ ]?Markers', semicolonMode)) {
			var maxBarHitMarkers = J._getTypeDefaultInt(o.type, 'Max Hit Markers', (o.jakeBarMaxHitMarkers !== undefined ? o.jakeBarMaxHitMarkers : -1));
			if (maxBarHitMarkers < -1) maxBarHitMarkers = -1;
			o.jakeBarMaxHitMarkers = maxBarHitMarkers;
		}
	};

	var _jApplyMashProps_v232_typeDefaults = J.applyMashProps;
	J.applyMashProps = function(o, source, semicolonMode) {
		_jApplyMashProps_v232_typeDefaults.call(this, o, source, semicolonMode);
		if (!o || J._resolveTypeDefaultKey(o.type) !== 'mash') return;

		jApplyTypeDefault(o, 'jakeMashMode', source, 'Mode', semicolonMode, function() {
			o.jakeMashMode = J.normalizeMashMode(J._getTypeDefaultRaw(o.type, 'Mode', (o.jakeMashMode !== undefined ? String(o.jakeMashMode) : 'default mash')));
		});
		jApplyTypeDefault(o, 'jakeMashKeys', source, 'Mash[ ]?Keys', semicolonMode, function() {
			o.jakeMashKeys = String(J._getTypeDefaultRaw(o.type, 'Keys', (o.jakeMashKeys !== undefined ? String(o.jakeMashKeys) : '13, 90, -1')));
		});
		jApplyTypeDefault(o, 'jakeMashFrames', source, 'Frames', semicolonMode, function() {
			o.jakeMashFrames = J._getTypeDefaultInt(o.type, 'Frames', (o.jakeMashFrames !== undefined ? o.jakeMashFrames : 0));
		});
		jApplyTypeDefault(o, 'jakeMashSeconds', source, 'Seconds', semicolonMode, function() {
			o.jakeMashSeconds = J._getTypeDefaultInt(o.type, 'Seconds', (o.jakeMashSeconds !== undefined ? o.jakeMashSeconds : 0));
		});
		jApplyTypeDefault(o, 'jakeMashRandomOnce', source, 'Random[ ]?Once', semicolonMode, function() {
			o.jakeMashRandomOnce = J._getTypeDefaultBool(o.type, 'Random Once', !!o.jakeMashRandomOnce);
		});
		jApplyTypeDefault(o, 'jakeMashRandomSpecifiedOnce', source, 'Random[ ]?Specified[ ]?Once', semicolonMode, function() {
			o.jakeMashRandomSpecifiedOnce = String(J._getTypeDefaultRaw(o.type, 'Random Specified Once', (o.jakeMashRandomSpecifiedOnce !== undefined ? String(o.jakeMashRandomSpecifiedOnce) : '')));
		});
		jApplyTypeDefault(o, 'jakeMashRandomNoRepeat', source, 'Random[ ]?No[ ]?Repeat', semicolonMode, function() {
			o.jakeMashRandomNoRepeat = J._getTypeDefaultBool(o.type, 'Random No Repeat', !!o.jakeMashRandomNoRepeat);
		});
		jApplyTypeDefault(o, 'jakeMashUnending', source, 'Unending', semicolonMode, function() {
			o.jakeMashUnending = J._getTypeDefaultBool(o.type, 'Unending', !!o.jakeMashUnending);
		});
		jApplyTypeDefault(o, 'jakeMashUnstarting', source, 'Unstarting', semicolonMode, function() {
			o.jakeMashUnstarting = J._getTypeDefaultBool(o.type, 'Unstarting', !!o.jakeMashUnstarting);
		});
		jApplyTypeDefault(o, 'jakeMashTimeless', source, 'Timeless', semicolonMode, function() {
			o.jakeMashTimeless = J._getTypeDefaultBool(o.type, 'Timeless', !!o.jakeMashTimeless);
		});
		jApplyTypeDefault(o, 'jakeMashPowerValue', source, 'Power[ ]?Value', semicolonMode, function() {
			o.jakeMashPowerValue = J.normalizePowerValue(J._getTypeDefaultRaw(o.type, 'Power Value', (o.jakeMashPowerValue !== undefined ? String(o.jakeMashPowerValue) : 'last value')));
		});
		jApplyTypeDefault(o, 'jakeMashTapGainFade', source, 'Tap[ ]?Gain[ ]?Fade', semicolonMode, function() {
			o.jakeMashTapGainFade = Math.max(0, J._getTypeDefaultEvalNumber(o.type, 'Tap Gain Fade', J.toEvalNumber(o.jakeMashTapGainFade, 1)));
		});
		jApplyTypeDefault(o, 'jakeMashSE', source, 'Mash[ ]?SE', semicolonMode, function() {
			o.jakeMashSE = String(J._getTypeDefaultRaw(o.type, 'SE', (o.jakeMashSE !== undefined ? String(o.jakeMashSE) : '')));
		});
		jApplyTypeDefault(o, 'jakeMashInvalidSE', source, 'Invalid[ ]?Mash[ ]?SE', semicolonMode, function() {
			o.jakeMashInvalidSE = String(J._getTypeDefaultRaw(o.type, 'Invalid Mash SE', (o.jakeMashInvalidSE !== undefined ? String(o.jakeMashInvalidSE) : '')));
		});
		jApplyTypeDefault(o, 'jakeMashHighLowMarkerColor', source, 'HighLow[ ]?Marker[ ]?Color', semicolonMode, function() {
			o.jakeMashHighLowMarkerColor = String(J._getTypeDefaultRaw(o.type, 'HighLow Marker Color', (o.jakeMashHighLowMarkerColor !== undefined ? String(o.jakeMashHighLowMarkerColor) : '#8b0000')));
		});
		jApplyTypeDefault(o, 'jakeMashInvalidKeyColor', source, 'Invalid[ ]?Key[ ]?Color', semicolonMode, function() {
			o.jakeMashInvalidKeyColor = String(J._getTypeDefaultRaw(o.type, 'Invalid Key Color', (o.jakeMashInvalidKeyColor !== undefined ? String(o.jakeMashInvalidKeyColor) : '#ff8c00')));
		});
		jApplyTypeDefault(o, 'jakeMashStopKeyColor', source, 'Stop[ ]?Key[ ]?Color', semicolonMode, function() {
			o.jakeMashStopKeyColor = String(J._getTypeDefaultRaw(o.type, 'Stop Key Color', (o.jakeMashStopKeyColor !== undefined ? String(o.jakeMashStopKeyColor) : '#0000ff')));
		});
		jApplyTypeDefault(o, 'jakeMashStopKey', source, 'Stop[ ]?key', semicolonMode, function() {
			var stopKeyRaw = J._getTypeDefaultRaw(o.type, 'Stop Key', (o.jakeMashStopKey !== undefined && o.jakeMashStopKey !== null ? String(o.jakeMashStopKey) : '-1'));
			var stopKey = parseInt(stopKeyRaw);
			o.jakeMashStopKey = isNaN(stopKey) ? null : stopKey;
		});
		jApplyTypeDefault(o, 'jakeMashStopText', source, 'Stop[ ]?key[ ]?Text', semicolonMode, function() {
			o.jakeMashStopText = String(J._getTypeDefaultRaw(o.type, 'Stop Key Text', (o.jakeMashStopText !== undefined ? String(o.jakeMashStopText) : '')));
		});
		jApplyTypeDefault(o, 'jakeMashStopIcon', source, 'Stop[ ]?key[ ]?Icon', semicolonMode, function() {
			var stopKeyIconRaw = String(J._getTypeDefaultRaw(o.type, 'Stop Key Icon', (o.jakeMashStopIcon !== undefined ? String(o.jakeMashStopIcon) : '')));
			o.jakeMashStopIcon = (stopKeyIconRaw.trim() === '0') ? '' : stopKeyIconRaw;
		});
		jApplyTypeDefault(o, 'jakeMashInvalidTapLoss', source, 'Invalid[ ]?Tap[ ]?Loss', semicolonMode, function() {
			o.jakeMashInvalidTapLoss = J._getTypeDefaultEvalNumber(o.type, 'Invalid Tap Loss', J.toEvalNumber(o.jakeMashInvalidTapLoss, 0));
		});
		jApplyTypeDefault(o, 'jakeStopKeyXOffset', source, 'Stop[ ]?Key[ ]?X[ ]?Offset', semicolonMode, function() {
			o.jakeStopKeyXOffset = J._getTypeDefaultEvalNumber(o.type, 'Stop Key X Offset', J.toEvalNumber(o.jakeStopKeyXOffset, 0));
		});
		jApplyTypeDefault(o, 'jakeStopKeyYOffset', source, 'Stop[ ]?Key[ ]?Y[ ]?Offset', semicolonMode, function() {
			o.jakeStopKeyYOffset = J._getTypeDefaultEvalNumber(o.type, 'Stop Key Y Offset', J.toEvalNumber(o.jakeStopKeyYOffset, 0));
		});
		jApplyTypeDefault(o, 'jakeStopKeyAngle', source, 'Stop[ ]?Key[ ]?Angle(?:[ ]?Offset)?', semicolonMode, function() {
			o.jakeStopKeyAngle = J._getTypeDefaultEvalNumber(o.type, 'Stop Key Angle', J.toEvalNumber(o.jakeStopKeyAngle, 0));
		});
		jApplyTypeDefault(o, 'jakeStopKeyScaleX', source, 'Stop[ ]?Key[ ]?Scale[ ]?X', semicolonMode, function() {
			o.jakeStopKeyScaleX = J._getTypeDefaultEvalNumber(o.type, 'Stop Key Scale X', J.toEvalNumber(o.jakeStopKeyScaleX, 1));
		});
		jApplyTypeDefault(o, 'jakeStopKeyScaleY', source, 'Stop[ ]?Key[ ]?Scale[ ]?Y', semicolonMode, function() {
			o.jakeStopKeyScaleY = J._getTypeDefaultEvalNumber(o.type, 'Stop Key Scale Y', J.toEvalNumber(o.jakeStopKeyScaleY, 1));
		});
		jApplyTypeDefault(o, 'jakeIndependentStopKeyIcon', source, 'Independent[ ]?Stop[ ]?Key[ ]?Icon', semicolonMode, function() {
			o.jakeIndependentStopKeyIcon = J._getTypeDefaultBool(o.type, 'Independent Stop Key Icon', !!o.jakeIndependentStopKeyIcon);
		});
	};

	var _jApplyArrowsProps_v232_typeDefaults = J.applyArrowsProps;
	J.applyArrowsProps = function(o, source, semicolonMode) {
		_jApplyArrowsProps_v232_typeDefaults.call(this, o, source, semicolonMode);
		if (!o || J._resolveTypeDefaultKey(o.type) !== 'arrows') return;

		jApplyTypeDefault(o, 'jakeArrowFrames', source, 'Frames', semicolonMode, function() {
			o.jakeArrowFrames = J._getTypeDefaultInt(o.type, 'Frames', (o.jakeArrowFrames !== undefined ? o.jakeArrowFrames : 0));
		});
		jApplyTypeDefault(o, 'jakeArrowSeconds', source, 'Seconds', semicolonMode, function() {
			o.jakeArrowSeconds = J._getTypeDefaultInt(o.type, 'Seconds', (o.jakeArrowSeconds !== undefined ? o.jakeArrowSeconds : 0));
		});
		jApplyTypeDefault(o, 'jakeArrowTimeless', source, 'Timeless', semicolonMode, function() {
			o.jakeArrowTimeless = J._getTypeDefaultBool(o.type, 'Timeless', !!o.jakeArrowTimeless);
		});
		jApplyTypeDefault(o, 'jakeArrowIgnoreInvalidKeys', source, 'Ignore[ ]?Keys?[ ]?for[ ]?Invalid', semicolonMode, function() {
			var ignoreInvalidRaw = String(J._getTypeDefaultRaw(o.type, 'Ignore Keys for Invalid', (o.jakeArrowIgnoreInvalidKeys !== undefined ? String(o.jakeArrowIgnoreInvalidKeys) : '')) || '');
			if (/^(?:true|false)$/i.test(ignoreInvalidRaw.trim())) ignoreInvalidRaw = '';
			o.jakeArrowIgnoreInvalidKeys = ignoreInvalidRaw;
		});
		jApplyTypeDefault(o, 'jakeArrowCommandTexts', source, 'Randomize[ ]?Commands[ ]?Texts', semicolonMode, function() {
			o.jakeArrowCommandTexts = String(J._getTypeDefaultRaw(o.type, 'Command Texts', (o.jakeArrowCommandTexts !== undefined ? String(o.jakeArrowCommandTexts) : 'left, down, up, right')));
		});
		jApplyTypeDefault(o, 'jakeArrowCommandIcons', source, 'Randomize[ ]?Commands[ ]?Icons', semicolonMode, function() {
			o.jakeArrowCommandIcons = String(J._getTypeDefaultRaw(o.type, 'Command Icons', (o.jakeArrowCommandIcons !== undefined ? String(o.jakeArrowCommandIcons) : '')));
		});
	};

	var _jApplyClockTargets_v232_typeDefaults = J.applyClockTargets;
	J.applyClockTargets = function(o, source, semicolonMode) {
		_jApplyClockTargets_v232_typeDefaults.call(this, o, source, semicolonMode);
		if (!o || J._resolveTypeDefaultKey(o.type) !== 'clock') return;

		jApplyTypeDefault(o, 'jakeClockPowerValue', source, 'Power[ ]?Value', semicolonMode, function() {
			o.jakeClockPowerValue = J.normalizeClockPowerValue(J._getTypeDefaultRaw(o.type, 'Power Value', (o.jakeClockPowerValue !== undefined ? String(o.jakeClockPowerValue) : 'one value')));
		});
		jApplyTypeDefault(o, 'jakeClockHitMarkers', source, 'Hit[ ]?Markers', semicolonMode, function() {
			o.jakeClockHitMarkers = J._getTypeDefaultBool(o.type, 'Hit Markers', (o.jakeClockHitMarkers !== false));
		});
		jApplyTypeDefault(o, 'jakeClockIncompleteValue', source, 'Incomplete[ ]?Value', semicolonMode, function() {
			o.jakeClockIncompleteValue = J._getTypeDefaultBool(o.type, 'Incomplete Value', (o.jakeClockIncompleteValue !== false));
		});
	};

	var _jLoadItem_v232_opacityRuntime = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		_jLoadItem_v232_opacityRuntime.call(this, item);
		this._jakeSetupOpacityRuntime(item);
	};

	var _jUpdateGames_v232_opacityRuntime = TimedAttackSystem.prototype.updateGames;
	TimedAttackSystem.prototype.updateGames = function() {
		_jUpdateGames_v232_opacityRuntime.call(this);
		this._jakeApplyConfiguredOpacities();
	};

})();


//=============================================================================
// End of File
//=============================================================================



