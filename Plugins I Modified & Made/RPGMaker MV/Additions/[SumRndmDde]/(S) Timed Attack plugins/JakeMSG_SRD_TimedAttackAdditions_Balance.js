//=============================================================================
// JakeMSG_SRD_TimedAttackAdditions_Balance
// JakeMSG_SRD_TimedAttackAdditions_Balance.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_SRD_TimedAttackAdditions_Balance = true;

//=============================================================================
/*:
 * @plugindesc [Module] Balance Timed Attack module for JakeMSG_SRD_TimedAttackAdditions
 * @author JakeMSG
 * v1.1
 * 
============ Change Log ============
1.1 - 5.25th.2026
 * Added a "Maneuver Type" property
1.0 - 5.14th.2026
 * initial release
====================================
 * 
 * @help
 * ============================================================================
 * JakeMSG_SRD_TimedAttackAdditions_Balance
 * ============================================================================
 * This plugin enables the Balance Timed Attack module for:
 * JakeMSG_SRD_TimedAttackAdditions.js
 *
 * Required load order:
 * 1) JakeMSG_SRD_TimedAttackAdditions
 * 2) JakeMSG_SRD_TimedAttackAdditions_Balance
 *
 * You can disable this module by turning this plugin OFF while keeping
 * JakeMSG_SRD_TimedAttackAdditions active for all non-Balance features.
 *
 * ---------------------------------------------------------------------------
 * Balance Timed Attack
 * ---------------------------------------------------------------------------
 * Use with notetag:
 * <Timed Attack: balance>
 * <End Timed Attack>
 *
 * Concept:
 * - Cursor continuously moves on a bar.
 * - Player uses Left/Right controls to keep cursor in Balance Areas.
 * - Stability value rises while in areas, decreases passively otherwise.
 * - Final power is Stability / Max Stability, clamped to [0, 1].
 *
 * Core properties and notetags include:
 * - Window Width (default main bar width)
 * - Cursor Start Position
 * - Cursor Color / Cursor Image
 * - Cursor Visual X/Y Offset, Cursor Angle, Cursor Scale X/Y
 * - Visual Angle aliases are supported for angle properties
 *   (for example: Cursor Visual Angle <=> Cursor Angle Offset).
 * - Opacity and Main Opacity are aliases for main Balance visual opacity.
 * - Runtime and note-based Opacity/Main Opacity always override plugin defaults.
 * - <Sub-Element> Opacity in notes/runtime overrides main Opacity for that sub-element.
 * - Sub-element opacity parameters are fallback defaults.
 *   Common Balance examples:
 *   Cursor Opacity, Keys Opacity, Stop Key Opacity, Main Bar Opacity,
 *   Stability Bar Opacity, Boost Bar Opacity, Focus Bar Opacity,
 *   Stick Bar Opacity, Nitro Bar Opacity, Concentrate Bar Opacity,
 *   Freeze Bar Opacity.
 * - Unbalance Movement
 * - Random Movement X pools
 * - Balance Area X (1..40)
 * - Balance Area Movement X (1..40)
 * - Balance Area Effects X
 * - Balance Area Mult-Effects X
 *
 * ---------------------------------------------------------------------------
 * How to Use Properties in Notes
 * ---------------------------------------------------------------------------
 * 1) Add a Balance block:
 *    <Timed Attack: balance>
 *    ...properties...
 *    <End Timed Attack>
 *
 * 2) Use one property per line:
 *    Property Name: value
 *
 * 3) Any property listed in this help/parameter list can also be used
 *    directly in the note block with the same property name.
 *
 * Example:
 * <Timed Attack: balance>
 * Window Width: Graphics.width - 300
 * Cursor Start Position: left
 * Unbalance Movement: 0.01
 * Balance Area 1: [200, 80, #66cc66, #ccffcc]
 * Balance Area Effects 1: 0.004, , , 0.001
 * Balance Area Mult-Effects 1: 1.2
 * <End Timed Attack>
 *
 * Notes:
 * - Runtime aliases are supported (for example Visual Angle aliases and
 *   Opacity/Main Opacity aliases).
 * - If both a plugin parameter and note property exist, the note property wins.
 * - Empty values in comma lists are skipped and keep previous/default behavior.
 *
 * ---------------------------------------------------------------------------
 * Balance Property Groups
 * ---------------------------------------------------------------------------
 * Main window and visual controls:
 * - Window Width, Window Height, Window Opacity
 * - Opacity / Main Opacity
 * - Visual X Offset, Visual Y Offset, Visual Angle, Visual Scale X, Visual Scale Y
 *
 * Cursor controls:
 * - Cursor Start Position, Cursor Color, Cursor Image
 * - Cursor X Offset, Cursor Y Offset
 * - Cursor Visual X Offset, Cursor Visual Y Offset
 * - Cursor Angle / Cursor Angle Offset
 * - Cursor Scale X, Cursor Scale Y
 *
 * Core movement and stability controls:
 * - Unbalance Movement
 * - Unbalance Movement Left / Unbalance Movement Right
 * - Maneuver Type (Hold (default) or Mash)
 * - Maneuver, Maneuver Left, Maneuver Right
 * - Stability, Max Stability, Balance Loss
 * - Random Movement 1..40
 *
 * Balance area controls:
 * - Balance Area X (shape/color/placement per zone)
 * - Balance Area Movement X (movement profile per zone)
 * - Balance Area Effects X (additive zone effects)
 * - Balance Area Mult-Effects X (multiplicative zone effects)
 *
 * Optional feature bars and resources:
 * - Boost, Focus, Stick, Nitro, Concentrate, Freeze
 * - Each supports value, limit, passive recharge, active discharge,
 *   recharge while held, and exhaust controls.
 *
 * Keys and presentation:
 * - Left/Right key visuals and transforms
 * - Stop key settings and transforms
 * - Text and icon transforms (position, angle, scale)
 * - Feature bar shown text/picture and transform controls
 * - Independent shown text/picture toggles
 *
 * 
 * Balance Area Effects value format (comma-separated, in order):
 * 
 * unbalanceMovement, unbalanceMovementLeft, unbalanceMovementRight,
 * maneuver, maneuverLeft, maneuverRight, balanceLoss,
 * boostValue, focusValue, stickValue, nitroValue, concentrateValue, freezeValue,
 * boostPassiveRecharge, focusPassiveRecharge, stickPassiveRecharge,
 * nitroPassiveRecharge, concentratePassiveRecharge, freezePassiveRecharge,
 * boostActiveDischarge, focusActiveDischarge, stickActiveDischarge,
 * nitroActiveDischarge, concentrateActiveDischarge, freezeActiveDischarge
 * 
 *
 * Balance Area Effects X adds/subtracts those aspects while cursor hovers that area.
 * Balance Area Mult-Effects X multiplies those aspects while cursor hovers that area.
 *
 * Empty values are ignored:
 * - blank slot (for example: ",,")
 * - whitespace-only slot
 * - omitted trailing values in shorter lists
 *
 * Feature families:
 * - Boost, Focus, Stick, Nitro, Concentrate, Freeze
 *
 * Feature supports:
 * - key, value, limit
 * - passive recharge, active discharge
 * - recharge while held
 * - exhaust enable and exhaust limit
 * - text/icon transforms
 * - feature bar shown text/picture and transform controls
 * - independent shown text/picture toggles
 *
 * Stop key support:
 * - Stop key
 * - Stop key Text/Icon/Color
 * - Stop key X/Y Offset, Angle, Scale X/Y
 * - Independent Stop Key Icon
 *
 * Text helpers:
 * - $stab, $boost, $focus, $stick, $nitro, $concentrate, $freeze
 * - $exh_boo, $exh_foc, $exh_sti, $exh_nit, $exh_con, $exh_fre
 *
 * 
 * 
 * 
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @param Balance Timed Attack
 * @default
 *
 * @param Window Width
 * @parent Balance Timed Attack
 * @desc Default main bar width for Balance.
 * @default Graphics.width - 200
 *
 * @param Window Height
 * @parent Balance Timed Attack
 * @desc Default main bar height for Balance.
 * @default this.fittingHeight(3)
 *
 * @param Window Opacity
 * @parent Balance Timed Attack
 * @desc Default window opacity for Balance.
 * @default 255

 * @param Opacity
 * @parent Balance Timed Attack
 * @desc Default main Balance visual opacity (alias: Main Opacity).
 * @default 255

 * @param Cursor Opacity
 * @parent Balance Timed Attack
 * @desc Default Balance Cursor Opacity.
 * @default 255

 * @param Keys Opacity
 * @parent Balance Timed Attack
 * @desc Default Balance Keys Opacity.
 * @default 255

 * @param Stop Key Opacity
 * @parent Balance Timed Attack
 * @desc Default Balance Stop Key Opacity.
 * @default 255

 * @param Main Bar Opacity
 * @parent Balance Timed Attack
 * @desc Default Balance Main Bar Opacity.
 * @default 255

 * @param Stability Bar Opacity
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Opacity.
 * @default 255

 * @param Boost Bar Opacity
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Opacity.
 * @default 255

 * @param Focus Bar Opacity
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Opacity.
 * @default 255

 * @param Stick Bar Opacity
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Opacity.
 * @default 255

 * @param Nitro Bar Opacity
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Opacity.
 * @default 255

 * @param Concentrate Bar Opacity
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Opacity.
 * @default 255

 * @param Freeze Bar Opacity
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Opacity.
 * @default 255
 *
 * @param Cursor Image
 * @parent Balance Timed Attack
 * @desc Default cursor image for Balance. Leave empty to use shape cursor.
 * @default
 *
 * @param Shape
 * @parent Balance Timed Attack
 * @desc Default Shape for Balance cursor visuals.
 * @default rectangle
 *
 * @param Width
 * @parent Balance Timed Attack
 * @desc Default Width of Balance cursor.
 * @default 24
 *
 * @param Height
 * @parent Balance Timed Attack
 * @desc Main Balance Height.
 * @default 16
 *
 * @param Main Color
 * @parent Balance Timed Attack
 * @desc Default Main Color for Balance cursor visuals.
 * @default #ffffff
 *
 * @param Balance Cursor Color
 * @parent Balance Timed Attack
 * @desc Default Cursor Color for Balance when Cursor Image is empty.
 * @default
 *
 * @param Outline Color
 * @parent Balance Timed Attack
 * @desc Default Outline Color for Balance cursor visuals.
 * @default #000000
 *
 * @param Outline Size
 * @parent Balance Timed Attack
 * @desc Default Outline Size for Balance cursor visuals.
 * @default 3
 *
 * @param Flash Rate
 * @parent Balance Timed Attack
 * @desc Default Flash Rate for Balance.
 * @default 8
 *
 * @param Background Color
 * @parent Balance Timed Attack
 * @desc Main Balance bar background color.
 * @default #ffffff
 *
 * @param Cursor Start Position
 * @parent Balance Timed Attack
 * @desc Default cursor start X from the left side of the Balance bar.
 * @default (Graphics.width - 200) / 2
 *
 * @param Initial Stability
 * @parent Balance Timed Attack
 * @desc Default initial Stability.
 * @default 100
 *
 * @param Max Stability
 * @parent Balance Timed Attack
 * @desc Default maximum Stability.
 * @default 200
 *
 * @param Stability Passive Decrease
 * @parent Balance Timed Attack
 * @desc Default Stability passive decrease per frame.
 * @default 1
 *
 * @param Left Key
 * @parent Balance Timed Attack
 * @desc Default keyCode for Left control.
 * @default 37
 *
 * @param Right Key
 * @parent Balance Timed Attack
 * @desc Default keyCode for Right control.
 * @default 39
 *
 * @param Boost Key
 * @parent Balance Timed Attack
 * @desc Default keyCode for Boost control. Leave empty for none.
 * @default
 *
 * @param Focus Key
 * @parent Balance Timed Attack
 * @desc Default keyCode for Focus control. Leave empty for none.
 * @default
 *
 * @param Stick Key
 * @parent Balance Timed Attack
 * @desc Default keyCode for Stick control. Leave empty for none.
 * @default
 *
 * @param Nitro Key
 * @parent Balance Timed Attack
 * @desc Default keyCode for Nitro control. Leave empty for none.
 * @default
 *
 * @param Concentrate Key
 * @parent Balance Timed Attack
 * @desc Default keyCode for Concentrate control. Leave empty for none.
 * @default
 *
 * @param Freeze Key
 * @parent Balance Timed Attack
 * @desc Default keyCode for Freeze control. Leave empty for none.
 * @default
 *
 * @param Left Maneuver
 * @parent Balance Timed Attack
 * @desc Default left maneuver value.
 * @default 4
 *
 * @param Right Maneuver
 * @parent Balance Timed Attack
 * @desc Default right maneuver value.
 * @default 4

 * @param Maneuver Type
 * @parent Balance Timed Attack
 * @type select
 * @option Hold
 * @option Mash
 * @desc Default input mode for Left/Right maneuver movement.
 * Hold = movement each frame while held. Mash = movement per key tap.
 * @default Hold
 *
 * @param Timeless
 * @parent Balance Timed Attack
 * @desc Default Timeless behavior for Balance.
 * @default true
 *
 * @param Unstarting
 * @parent Balance Timed Attack
 * @desc Default Unstarting for Balance.
 * @default true
 *
 * @param Unending
 * @parent Balance Timed Attack
 * @desc Default Unending for Balance.
 * @default true
 *
 * @param Stability Unwasting
 * @parent Balance Timed Attack
 * @desc Default Stability Unwasting for Balance.
 * @default false
 *
 * @param Stability Unfilling
 * @parent Balance Timed Attack
 * @desc Default Stability Unfilling for Balance.
 * @default false
 *
 * @param Seconds
 * @parent Balance Timed Attack
 * @desc Default seconds value for non-timeless Balance.
 * @default 5
 *
 * @param Frames
 * @parent Balance Timed Attack
 * @desc Default frames value for non-timeless Balance.
 * @default 0
 *
 * @param Stability Bar Color
 * @parent Balance Timed Attack
 * @desc Default Stability bar color.
 * @default #33ccff
 *
 * @param Stability Bar Outline Color
 * @parent Balance Timed Attack
 * @desc Default Stability bar outline color.
 * @default #000000
 *
 * @param Stability Bar Outline Size
 * @parent Balance Timed Attack
 * @desc Default Stability bar outline size.
 * @default 2
 *
 * @param Stability Bar Height
 * @parent Balance Timed Attack
 * @desc Default Stability bar height.
 * @default 8
 *
 * @param Boost Value
 * @parent Balance Timed Attack
 * @desc Default Boost value.
 * @default 2
 *
 * @param Focus Value
 * @parent Balance Timed Attack
 * @desc Default Focus value.
 * @default 2
 *
 * @param Stick Value
 * @parent Balance Timed Attack
 * @desc Default Stick value.
 * @default 1
 *
 * @param Nitro Value
 * @parent Balance Timed Attack
 * @desc Default Nitro value.
 * @default 1.2
 *
 * @param Concentrate Value
 * @parent Balance Timed Attack
 * @desc Default Concentrate value.
 * @default 1.2
 *
 * @param Freeze Value
 * @parent Balance Timed Attack
 * @desc Default Freeze value.
 * @default 1.2
 *
 * @param Boost Limit
 * @parent Balance Timed Attack
 * @desc Default Boost limit (-1 for infinite).
 * @default -1
 *
 * @param Focus Limit
 * @parent Balance Timed Attack
 * @desc Default Focus limit (-1 for infinite).
 * @default -1
 *
 * @param Stick Limit
 * @parent Balance Timed Attack
 * @desc Default Stick limit (-1 for infinite).
 * @default -1
 *
 * @param Nitro Limit
 * @parent Balance Timed Attack
 * @desc Default Nitro limit (-1 for infinite).
 * @default -1
 *
 * @param Concentrate Limit
 * @parent Balance Timed Attack
 * @desc Default Concentrate limit (-1 for infinite).
 * @default -1
 *
 * @param Freeze Limit
 * @parent Balance Timed Attack
 * @desc Default Freeze limit (-1 for infinite).
 * @default -1
 *
 * @param Boost Exhaust Enable
 * @parent Balance Timed Attack
 * @desc If true, Boost can become exhausted when empty and must recharge before use.
 * @default false
 *
 * @param Focus Exhaust Enable
 * @parent Balance Timed Attack
 * @desc If true, Focus can become exhausted when empty and must recharge before use.
 * @default false
 *
 * @param Stick Exhaust Enable
 * @parent Balance Timed Attack
 * @desc If true, Stick can become exhausted when empty and must recharge before use.
 * @default false
 *
 * @param Nitro Exhaust Enable
 * @parent Balance Timed Attack
 * @desc If true, Nitro can become exhausted when empty and must recharge before use.
 * @default false
 *
 * @param Concentrate Exhaust Enable
 * @parent Balance Timed Attack
 * @desc If true, Concentrate can become exhausted when empty and must recharge before use.
 * @default false
 *
 * @param Freeze Exhaust Enable
 * @parent Balance Timed Attack
 * @desc If true, Freeze can become exhausted when empty and must recharge before use.
 * @default false
 *
 * @param Boost Exhaust Limit
 * @parent Balance Timed Attack
 * @desc Boost recharge amount needed to recover from exhaustion.
 * @default 50
 *
 * @param Focus Exhaust Limit
 * @parent Balance Timed Attack
 * @desc Focus recharge amount needed to recover from exhaustion.
 * @default 50
 *
 * @param Stick Exhaust Limit
 * @parent Balance Timed Attack
 * @desc Stick recharge amount needed to recover from exhaustion.
 * @default 50
 *
 * @param Nitro Exhaust Limit
 * @parent Balance Timed Attack
 * @desc Nitro recharge amount needed to recover from exhaustion.
 * @default 50
 *
 * @param Concentrate Exhaust Limit
 * @parent Balance Timed Attack
 * @desc Concentrate recharge amount needed to recover from exhaustion.
 * @default 50
 *
 * @param Freeze Exhaust Limit
 * @parent Balance Timed Attack
 * @desc Freeze recharge amount needed to recover from exhaustion.
 * @default 50
 *
 * @param Balance Independent Cursor
 * @parent Balance Timed Attack
 * @desc If true, Balance cursor ignores the main visual angle/scale transforms.
 * @default false
 *
 * @param Boost Passive Recharge
 * @parent Balance Timed Attack
 * @desc Default passive recharge for Boost.
 * @default 1
 *
 * @param Focus Passive Recharge
 * @parent Balance Timed Attack
 * @desc Default passive recharge for Focus.
 * @default 1
 *
 * @param Stick Passive Recharge
 * @parent Balance Timed Attack
 * @desc Default passive recharge for Stick.
 * @default 1
 *
 * @param Nitro Passive Recharge
 * @parent Balance Timed Attack
 * @desc Default passive recharge for Nitro.
 * @default 1
 *
 * @param Concentrate Passive Recharge
 * @parent Balance Timed Attack
 * @desc Default passive recharge for Concentrate.
 * @default 1
 *
 * @param Freeze Passive Recharge
 * @parent Balance Timed Attack
 * @desc Default passive recharge for Freeze.
 * @default 1
 *
 * @param Boost Active Discharge
 * @parent Balance Timed Attack
 * @desc Default active discharge for Boost.
 * @default 1
 *
 * @param Focus Active Discharge
 * @parent Balance Timed Attack
 * @desc Default active discharge for Focus.
 * @default 1
 *
 * @param Stick Active Discharge
 * @parent Balance Timed Attack
 * @desc Default active discharge for Stick.
 * @default 1
 *
 * @param Nitro Active Discharge
 * @parent Balance Timed Attack
 * @desc Default active discharge for Nitro.
 * @default 1
 *
 * @param Concentrate Active Discharge
 * @parent Balance Timed Attack
 * @desc Default active discharge for Concentrate.
 * @default 1
 *
 * @param Freeze Active Discharge
 * @parent Balance Timed Attack
 * @desc Default active discharge for Freeze.
 * @default 1
 *
 * @param Boost Recharge while Held
 * @parent Balance Timed Attack
 * @desc If true, Boost also passively recharges while key is held.
 * @default false
 *
 * @param Focus Recharge while Held
 * @parent Balance Timed Attack
 * @desc If true, Focus also passively recharges while key is held.
 * @default false
 *
 * @param Stick Recharge while Held
 * @parent Balance Timed Attack
 * @desc If true, Stick also passively recharges while key is held.
 * @default false
 *
 * @param Nitro Recharge while Held
 * @parent Balance Timed Attack
 * @desc If true, Nitro also passively recharges while key is held.
 * @default false
 *
 * @param Concentrate Recharge while Held
 * @parent Balance Timed Attack
 * @desc If true, Concentrate also passively recharges while key is held.
 * @default false
 *
 * @param Freeze Recharge while Held
 * @parent Balance Timed Attack
 * @desc If true, Freeze also passively recharges while key is held.
 * @default false
 *
 * @param Stop Key
 * @parent Balance Timed Attack
 * @desc Default Stop keyCode. Leave empty for none.
 * @default

 * @param Balance Default Stop Key Color
 * @parent Balance Timed Attack
 * @desc Default Stop Key Color for Balance.
 * @default #ff6666

 * @param Balance Default Stop Key Text
 * @parent Balance Timed Attack
 * @desc Default Stop Key Text for Balance.
 * @default

 * @param Balance Default Stop Key Icon
 * @parent Balance Timed Attack
 * @desc Default Stop Key Icon picture for Balance.
 * @default

 * @param Balance Default Stop Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Stop Key X Offset for Balance.
 * @default 0

 * @param Balance Default Stop Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Stop Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Stop Key Angle
 * @parent Balance Timed Attack
 * @desc Default Stop Key Angle for Balance.
 * @default 0

 * @param Balance Default Stop Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Stop Key Scale X for Balance.
 * @default 1

 * @param Balance Default Stop Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Stop Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Stop Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Stop Key Icon for Balance.
 * @default false

 * @param Balance Default No Skill Use
 * @parent Balance Timed Attack
 * @desc Default No Skill Use for Balance.
 * @default false

 * @param Balance Default Reset on Use
 * @parent Balance Timed Attack
 * @desc Default Reset on Use for Balance.
 * @default false

 * @param Balance Default Reset on Battle End
 * @parent Balance Timed Attack
 * @desc Default Reset on Battle End for Balance.
 * @default false

 * @param Balance Default Independent Text
 * @parent Balance Timed Attack
 * @desc Default Independent Text for Balance.
 * @default false

 * @param Balance Default Independent Picture
 * @parent Balance Timed Attack
 * @desc Default Independent Picture for Balance.
 * @default false

 * @param Balance Default Independent Icons
 * @parent Balance Timed Attack
 * @desc Default Independent Icons for Balance.
 * @default false

 * @param Balance Default Keys X Offset
 * @parent Balance Timed Attack
 * @desc Default Keys X Offset for Balance.
 * @default 0

 * @param Balance Default Keys Y Offset
 * @parent Balance Timed Attack
 * @desc Default Keys Y Offset for Balance.
 * @default 0

 * @param Balance Default Keys Angle
 * @parent Balance Timed Attack
 * @desc Default Keys Angle for Balance.
 * @default 0

 * @param Balance Default Keys Scale X
 * @parent Balance Timed Attack
 * @desc Default Keys Scale X for Balance.
 * @default 1

 * @param Balance Default Keys Scale Y
 * @parent Balance Timed Attack
 * @desc Default Keys Scale Y for Balance.
 * @default 1

 * @param Balance Default Visual Scale X
 * @parent Balance Timed Attack
 * @desc Default Visual Scale X for Balance.
 * @default 1

 * @param Balance Default Visual Scale Y
 * @parent Balance Timed Attack
 * @desc Default Visual Scale Y for Balance.
 * @default 1
 * @param Balance Default Cursor Visual X Offset
 * @parent Balance Timed Attack
 * @desc Default Cursor Visual X Offset for Balance.
 * @default 0

 * @param Balance Default Cursor Visual Y Offset
 * @parent Balance Timed Attack
 * @desc Default Cursor Visual Y Offset for Balance.
 * @default 0

 * @param Balance Default Cursor Angle
 * @parent Balance Timed Attack
 * @desc Default Cursor Angle for Balance.
 * @default 0

 * @param Balance Default Cursor Scale X
 * @parent Balance Timed Attack
 * @desc Default Cursor Scale X for Balance.
 * @default 1

 * @param Balance Default Cursor Scale Y
 * @parent Balance Timed Attack
 * @desc Default Cursor Scale Y for Balance.
 * @default 1

 * @param Balance Default Disable Left
 * @parent Balance Timed Attack
 * @desc Default Disable Left for Balance.
 * @default false

 * @param Balance Default Disable Right
 * @parent Balance Timed Attack
 * @desc Default Disable Right for Balance.
 * @default false

 * @param Balance Default Left Key Text
 * @parent Balance Timed Attack
 * @desc Default Left Key Text for Balance.
 * @default 

 * @param Balance Default Left Key Icon
 * @parent Balance Timed Attack
 * @desc Default Left Key Icon picture for Balance.
 * @default 

 * @param Balance Default Left Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Left Key X Offset for Balance.
 * @default 0

 * @param Balance Default Left Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Left Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Left Key Angle
 * @parent Balance Timed Attack
 * @desc Default Left Key Angle for Balance.
 * @default 0

 * @param Balance Default Left Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Left Key Scale X for Balance.
 * @default 1

 * @param Balance Default Left Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Left Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Left Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Left Key Icon for Balance.
 * @default false

 * @param Balance Default Right Key Text
 * @parent Balance Timed Attack
 * @desc Default Right Key Text for Balance.
 * @default 

 * @param Balance Default Right Key Icon
 * @parent Balance Timed Attack
 * @desc Default Right Key Icon picture for Balance.
 * @default 

 * @param Balance Default Right Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Right Key X Offset for Balance.
 * @default 0

 * @param Balance Default Right Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Right Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Right Key Angle
 * @parent Balance Timed Attack
 * @desc Default Right Key Angle for Balance.
 * @default 0

 * @param Balance Default Right Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Right Key Scale X for Balance.
 * @default 1

 * @param Balance Default Right Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Right Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Right Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Right Key Icon for Balance.
 * @default false

 * @param Balance Default Boost Key Text
 * @parent Balance Timed Attack
 * @desc Default Boost Key Text for Balance.
 * @default 

 * @param Balance Default Boost Key Icon
 * @parent Balance Timed Attack
 * @desc Default Boost Key Icon picture for Balance.
 * @default 

 * @param Balance Default Boost Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Boost Key X Offset for Balance.
 * @default 0

 * @param Balance Default Boost Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Boost Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Boost Key Angle
 * @parent Balance Timed Attack
 * @desc Default Boost Key Angle for Balance.
 * @default 0

 * @param Balance Default Boost Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Boost Key Scale X for Balance.
 * @default 1

 * @param Balance Default Boost Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Boost Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Boost Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Boost Key Icon for Balance.
 * @default false

 * @param Balance Default Focus Key Text
 * @parent Balance Timed Attack
 * @desc Default Focus Key Text for Balance.
 * @default 

 * @param Balance Default Focus Key Icon
 * @parent Balance Timed Attack
 * @desc Default Focus Key Icon picture for Balance.
 * @default 

 * @param Balance Default Focus Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Focus Key X Offset for Balance.
 * @default 0

 * @param Balance Default Focus Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Focus Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Focus Key Angle
 * @parent Balance Timed Attack
 * @desc Default Focus Key Angle for Balance.
 * @default 0

 * @param Balance Default Focus Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Focus Key Scale X for Balance.
 * @default 1

 * @param Balance Default Focus Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Focus Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Focus Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Focus Key Icon for Balance.
 * @default false

 * @param Balance Default Stick Key Text
 * @parent Balance Timed Attack
 * @desc Default Stick Key Text for Balance.
 * @default 

 * @param Balance Default Stick Key Icon
 * @parent Balance Timed Attack
 * @desc Default Stick Key Icon picture for Balance.
 * @default 

 * @param Balance Default Stick Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Stick Key X Offset for Balance.
 * @default 0

 * @param Balance Default Stick Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Stick Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Stick Key Angle
 * @parent Balance Timed Attack
 * @desc Default Stick Key Angle for Balance.
 * @default 0

 * @param Balance Default Stick Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Stick Key Scale X for Balance.
 * @default 1

 * @param Balance Default Stick Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Stick Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Stick Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Stick Key Icon for Balance.
 * @default false

 * @param Balance Default Nitro Key Text
 * @parent Balance Timed Attack
 * @desc Default Nitro Key Text for Balance.
 * @default 

 * @param Balance Default Nitro Key Icon
 * @parent Balance Timed Attack
 * @desc Default Nitro Key Icon picture for Balance.
 * @default 

 * @param Balance Default Nitro Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Nitro Key X Offset for Balance.
 * @default 0

 * @param Balance Default Nitro Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Nitro Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Nitro Key Angle
 * @parent Balance Timed Attack
 * @desc Default Nitro Key Angle for Balance.
 * @default 0

 * @param Balance Default Nitro Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Nitro Key Scale X for Balance.
 * @default 1

 * @param Balance Default Nitro Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Nitro Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Nitro Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Nitro Key Icon for Balance.
 * @default false

 * @param Balance Default Concentrate Key Text
 * @parent Balance Timed Attack
 * @desc Default Concentrate Key Text for Balance.
 * @default 

 * @param Balance Default Concentrate Key Icon
 * @parent Balance Timed Attack
 * @desc Default Concentrate Key Icon picture for Balance.
 * @default 

 * @param Balance Default Concentrate Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Concentrate Key X Offset for Balance.
 * @default 0

 * @param Balance Default Concentrate Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Concentrate Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Concentrate Key Angle
 * @parent Balance Timed Attack
 * @desc Default Concentrate Key Angle for Balance.
 * @default 0

 * @param Balance Default Concentrate Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Concentrate Key Scale X for Balance.
 * @default 1

 * @param Balance Default Concentrate Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Concentrate Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Concentrate Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Concentrate Key Icon for Balance.
 * @default false

 * @param Balance Default Freeze Key Text
 * @parent Balance Timed Attack
 * @desc Default Freeze Key Text for Balance.
 * @default 

 * @param Balance Default Freeze Key Icon
 * @parent Balance Timed Attack
 * @desc Default Freeze Key Icon picture for Balance.
 * @default 

 * @param Balance Default Freeze Key X Offset
 * @parent Balance Timed Attack
 * @desc Default Freeze Key X Offset for Balance.
 * @default 0

 * @param Balance Default Freeze Key Y Offset
 * @parent Balance Timed Attack
 * @desc Default Freeze Key Y Offset for Balance.
 * @default 0

 * @param Balance Default Freeze Key Angle
 * @parent Balance Timed Attack
 * @desc Default Freeze Key Angle for Balance.
 * @default 0

 * @param Balance Default Freeze Key Scale X
 * @parent Balance Timed Attack
 * @desc Default Freeze Key Scale X for Balance.
 * @default 1

 * @param Balance Default Freeze Key Scale Y
 * @parent Balance Timed Attack
 * @desc Default Freeze Key Scale Y for Balance.
 * @default 1

 * @param Balance Default Independent Freeze Key Icon
 * @parent Balance Timed Attack
 * @desc Default Independent Freeze Key Icon for Balance.
 * @default false

 * @param Balance Default Stability Bar Shown Text
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Shown Text for Balance.
 * @default $stab

 * @param Balance Default Stability Bar Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Shown Picture for Balance.
 * @default 

 * @param Balance Default Stability Bar X Offset
 * @parent Balance Timed Attack
 * @desc Default Stability Bar X Offset for Balance.
 * @default 0

 * @param Balance Default Stability Bar Y Offset
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Y Offset for Balance.
 * @default 0

 * @param Balance Default Stability Bar Angle
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Angle for Balance.
 * @default 0

 * @param Balance Default Stability Bar Scale X
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Scale X for Balance.
 * @default 1

 * @param Balance Default Stability Bar Scale Y
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Scale Y for Balance.
 * @default 1

 * @param Balance Default Stability Bar Text X Offset
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Text X Offset for Balance.
 * @default 0

 * @param Balance Default Stability Bar Text Y Offset
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Text Y Offset for Balance.
 * @default 0

 * @param Balance Default Stability Bar Text Angle
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Text Angle for Balance.
 * @default 0

 * @param Balance Default Stability Bar Text Scale X
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Text Scale X for Balance.
 * @default 1

 * @param Balance Default Stability Bar Text Scale Y
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Text Scale Y for Balance.
 * @default 1

 * @param Balance Default Stability Bar Picture X Offset
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Picture X Offset for Balance.
 * @default 0

 * @param Balance Default Stability Bar Picture Y Offset
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Picture Y Offset for Balance.
 * @default 0

 * @param Balance Default Stability Bar Picture Angle
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Picture Angle for Balance.
 * @default 0

 * @param Balance Default Stability Bar Picture Scale X
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Picture Scale X for Balance.
 * @default 1

 * @param Balance Default Stability Bar Picture Scale Y
 * @parent Balance Timed Attack
 * @desc Default Stability Bar Picture Scale Y for Balance.
 * @default 1

 * @param Balance Default Boost Bar Color
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Color for Balance.
 * @default 

 * @param Balance Default Boost Bar Shown Text
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Shown Text for Balance.
 * @default $boost

 * @param Balance Default Boost Bar Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Shown Picture for Balance.
 * @default 

 * @param Balance Default Boost Bar Independent Shown Text
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Independent Shown Text for Balance.
 * @default false

 * @param Balance Default Boost Bar Independent Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Independent Shown Picture for Balance.
 * @default false

 * @param Balance Default Boost Bar X Offset
 * @parent Balance Timed Attack
 * @desc Default Boost Bar X Offset for Balance.
 * @default 0

 * @param Balance Default Boost Bar Y Offset
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Y Offset for Balance.
 * @default 0

 * @param Balance Default Boost Bar Angle
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Angle for Balance.
 * @default 0

 * @param Balance Default Boost Bar Scale X
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Scale X for Balance.
 * @default 1

 * @param Balance Default Boost Bar Scale Y
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Scale Y for Balance.
 * @default 1

 * @param Balance Default Boost Bar Text X Offset
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Text X Offset for Balance.
 * @default 0

 * @param Balance Default Boost Bar Text Y Offset
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Text Y Offset for Balance.
 * @default 0

 * @param Balance Default Boost Bar Text Angle
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Text Angle for Balance.
 * @default 0

 * @param Balance Default Boost Bar Text Scale X
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Text Scale X for Balance.
 * @default 1

 * @param Balance Default Boost Bar Text Scale Y
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Text Scale Y for Balance.
 * @default 1

 * @param Balance Default Boost Bar Picture X Offset
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Picture X Offset for Balance.
 * @default 0

 * @param Balance Default Boost Bar Picture Y Offset
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Picture Y Offset for Balance.
 * @default 0

 * @param Balance Default Boost Bar Picture Angle
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Picture Angle for Balance.
 * @default 0

 * @param Balance Default Boost Bar Picture Scale X
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Picture Scale X for Balance.
 * @default 1

 * @param Balance Default Boost Bar Picture Scale Y
 * @parent Balance Timed Attack
 * @desc Default Boost Bar Picture Scale Y for Balance.
 * @default 1

 * @param Balance Default Focus Bar Color
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Color for Balance.
 * @default 

 * @param Balance Default Focus Bar Shown Text
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Shown Text for Balance.
 * @default $focus

 * @param Balance Default Focus Bar Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Shown Picture for Balance.
 * @default 

 * @param Balance Default Focus Bar Independent Shown Text
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Independent Shown Text for Balance.
 * @default false

 * @param Balance Default Focus Bar Independent Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Independent Shown Picture for Balance.
 * @default false

 * @param Balance Default Focus Bar X Offset
 * @parent Balance Timed Attack
 * @desc Default Focus Bar X Offset for Balance.
 * @default 0

 * @param Balance Default Focus Bar Y Offset
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Y Offset for Balance.
 * @default 0

 * @param Balance Default Focus Bar Angle
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Angle for Balance.
 * @default 0

 * @param Balance Default Focus Bar Scale X
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Scale X for Balance.
 * @default 1

 * @param Balance Default Focus Bar Scale Y
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Scale Y for Balance.
 * @default 1

 * @param Balance Default Focus Bar Text X Offset
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Text X Offset for Balance.
 * @default 0

 * @param Balance Default Focus Bar Text Y Offset
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Text Y Offset for Balance.
 * @default 0

 * @param Balance Default Focus Bar Text Angle
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Text Angle for Balance.
 * @default 0

 * @param Balance Default Focus Bar Text Scale X
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Text Scale X for Balance.
 * @default 1

 * @param Balance Default Focus Bar Text Scale Y
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Text Scale Y for Balance.
 * @default 1

 * @param Balance Default Focus Bar Picture X Offset
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Picture X Offset for Balance.
 * @default 0

 * @param Balance Default Focus Bar Picture Y Offset
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Picture Y Offset for Balance.
 * @default 0

 * @param Balance Default Focus Bar Picture Angle
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Picture Angle for Balance.
 * @default 0

 * @param Balance Default Focus Bar Picture Scale X
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Picture Scale X for Balance.
 * @default 1

 * @param Balance Default Focus Bar Picture Scale Y
 * @parent Balance Timed Attack
 * @desc Default Focus Bar Picture Scale Y for Balance.
 * @default 1

 * @param Balance Default Stick Bar Color
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Color for Balance.
 * @default 

 * @param Balance Default Stick Bar Shown Text
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Shown Text for Balance.
 * @default $stick

 * @param Balance Default Stick Bar Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Shown Picture for Balance.
 * @default 

 * @param Balance Default Stick Bar Independent Shown Text
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Independent Shown Text for Balance.
 * @default false

 * @param Balance Default Stick Bar Independent Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Independent Shown Picture for Balance.
 * @default false

 * @param Balance Default Stick Bar X Offset
 * @parent Balance Timed Attack
 * @desc Default Stick Bar X Offset for Balance.
 * @default 0

 * @param Balance Default Stick Bar Y Offset
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Y Offset for Balance.
 * @default 0

 * @param Balance Default Stick Bar Angle
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Angle for Balance.
 * @default 0

 * @param Balance Default Stick Bar Scale X
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Scale X for Balance.
 * @default 1

 * @param Balance Default Stick Bar Scale Y
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Scale Y for Balance.
 * @default 1

 * @param Balance Default Stick Bar Text X Offset
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Text X Offset for Balance.
 * @default 0

 * @param Balance Default Stick Bar Text Y Offset
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Text Y Offset for Balance.
 * @default 0

 * @param Balance Default Stick Bar Text Angle
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Text Angle for Balance.
 * @default 0

 * @param Balance Default Stick Bar Text Scale X
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Text Scale X for Balance.
 * @default 1

 * @param Balance Default Stick Bar Text Scale Y
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Text Scale Y for Balance.
 * @default 1

 * @param Balance Default Stick Bar Picture X Offset
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Picture X Offset for Balance.
 * @default 0

 * @param Balance Default Stick Bar Picture Y Offset
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Picture Y Offset for Balance.
 * @default 0

 * @param Balance Default Stick Bar Picture Angle
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Picture Angle for Balance.
 * @default 0

 * @param Balance Default Stick Bar Picture Scale X
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Picture Scale X for Balance.
 * @default 1

 * @param Balance Default Stick Bar Picture Scale Y
 * @parent Balance Timed Attack
 * @desc Default Stick Bar Picture Scale Y for Balance.
 * @default 1

 * @param Balance Default Nitro Bar Color
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Color for Balance.
 * @default 

 * @param Balance Default Nitro Bar Shown Text
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Shown Text for Balance.
 * @default $nitro

 * @param Balance Default Nitro Bar Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Shown Picture for Balance.
 * @default 

 * @param Balance Default Nitro Bar Independent Shown Text
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Independent Shown Text for Balance.
 * @default false

 * @param Balance Default Nitro Bar Independent Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Independent Shown Picture for Balance.
 * @default false

 * @param Balance Default Nitro Bar X Offset
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar X Offset for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Y Offset
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Y Offset for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Angle
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Angle for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Scale X
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Scale X for Balance.
 * @default 1

 * @param Balance Default Nitro Bar Scale Y
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Scale Y for Balance.
 * @default 1

 * @param Balance Default Nitro Bar Text X Offset
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Text X Offset for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Text Y Offset
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Text Y Offset for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Text Angle
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Text Angle for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Text Scale X
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Text Scale X for Balance.
 * @default 1

 * @param Balance Default Nitro Bar Text Scale Y
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Text Scale Y for Balance.
 * @default 1

 * @param Balance Default Nitro Bar Picture X Offset
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Picture X Offset for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Picture Y Offset
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Picture Y Offset for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Picture Angle
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Picture Angle for Balance.
 * @default 0

 * @param Balance Default Nitro Bar Picture Scale X
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Picture Scale X for Balance.
 * @default 1

 * @param Balance Default Nitro Bar Picture Scale Y
 * @parent Balance Timed Attack
 * @desc Default Nitro Bar Picture Scale Y for Balance.
 * @default 1

 * @param Balance Default Concentrate Bar Color
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Color for Balance.
 * @default 

 * @param Balance Default Concentrate Bar Shown Text
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Shown Text for Balance.
 * @default $concentrate

 * @param Balance Default Concentrate Bar Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Shown Picture for Balance.
 * @default 

 * @param Balance Default Concentrate Bar Independent Shown Text
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Independent Shown Text for Balance.
 * @default false

 * @param Balance Default Concentrate Bar Independent Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Independent Shown Picture for Balance.
 * @default false

 * @param Balance Default Concentrate Bar X Offset
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar X Offset for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Y Offset
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Y Offset for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Angle
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Angle for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Scale X
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Scale X for Balance.
 * @default 1

 * @param Balance Default Concentrate Bar Scale Y
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Scale Y for Balance.
 * @default 1

 * @param Balance Default Concentrate Bar Text X Offset
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Text X Offset for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Text Y Offset
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Text Y Offset for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Text Angle
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Text Angle for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Text Scale X
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Text Scale X for Balance.
 * @default 1

 * @param Balance Default Concentrate Bar Text Scale Y
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Text Scale Y for Balance.
 * @default 1

 * @param Balance Default Concentrate Bar Picture X Offset
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Picture X Offset for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Picture Y Offset
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Picture Y Offset for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Picture Angle
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Picture Angle for Balance.
 * @default 0

 * @param Balance Default Concentrate Bar Picture Scale X
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Picture Scale X for Balance.
 * @default 1

 * @param Balance Default Concentrate Bar Picture Scale Y
 * @parent Balance Timed Attack
 * @desc Default Concentrate Bar Picture Scale Y for Balance.
 * @default 1

 * @param Balance Default Freeze Bar Color
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Color for Balance.
 * @default 

 * @param Balance Default Freeze Bar Shown Text
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Shown Text for Balance.
 * @default $freeze

 * @param Balance Default Freeze Bar Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Shown Picture for Balance.
 * @default 

 * @param Balance Default Freeze Bar Independent Shown Text
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Independent Shown Text for Balance.
 * @default false

 * @param Balance Default Freeze Bar Independent Shown Picture
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Independent Shown Picture for Balance.
 * @default false

 * @param Balance Default Freeze Bar X Offset
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar X Offset for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Y Offset
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Y Offset for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Angle
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Angle for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Scale X
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Scale X for Balance.
 * @default 1

 * @param Balance Default Freeze Bar Scale Y
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Scale Y for Balance.
 * @default 1

 * @param Balance Default Freeze Bar Text X Offset
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Text X Offset for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Text Y Offset
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Text Y Offset for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Text Angle
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Text Angle for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Text Scale X
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Text Scale X for Balance.
 * @default 1

 * @param Balance Default Freeze Bar Text Scale Y
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Text Scale Y for Balance.
 * @default 1

 * @param Balance Default Freeze Bar Picture X Offset
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Picture X Offset for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Picture Y Offset
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Picture Y Offset for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Picture Angle
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Picture Angle for Balance.
 * @default 0

 * @param Balance Default Freeze Bar Picture Scale X
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Picture Scale X for Balance.
 * @default 1

 * @param Balance Default Freeze Bar Picture Scale Y
 * @parent Balance Timed Attack
 * @desc Default Freeze Bar Picture Scale Y for Balance.
 * @default 1

 */
//=============================================================================

(function() {
"use strict";

if (!Imported.JakeMSG_SRD_TimedAttackAdditions) {
if (typeof console !== 'undefined' && console.warn) {
console.warn('JakeMSG_SRD_TimedAttackAdditions_Balance: load below JakeMSG_SRD_TimedAttackAdditions.');
}
return;
}

var root = (typeof globalThis !== 'undefined') ? globalThis : ((typeof window !== 'undefined') ? window : this);
var core = root.JakeMSG_SRD_TA_Core;
if (!core || !core.J) {
if (typeof console !== 'undefined' && console.warn) {
console.warn('JakeMSG_SRD_TimedAttackAdditions_Balance: missing shared core from JakeMSG_SRD_TimedAttackAdditions.');
}
return;
}

var J = core.J;
var sharedVisual = core.sharedVisual || {};
var isSideview = !!sharedVisual.isSideview;
var globalNonSideXOffset = Number(sharedVisual.globalNonSideXOffset || 0);
var globalNonSideYOffset = Number(sharedVisual.globalNonSideYOffset || 0);

	J.clampNegOne = function(value) {
		var n = Math.floor(Number(value));
		if (isNaN(n)) return -1;
		if (n < -1) return -1;
		return n;
	};

	J.isKeyCodePressed = function(code) {
		if (!Input) return false;
		var key = Number(code);
		if (isNaN(key)) return false;
		if (Input._jakeTAPressedCodes && Input._jakeTAPressedCodes[key]) return true;
		if (!Input.keyMapper || !Input.isPressed) return false;
		var symbol = Input.keyMapper[key];
		if (!symbol) return false;
		return !!Input.isPressed(symbol);
	};

	J.normalizeBalanceManeuverType = function(raw, fallback) {
		var fb = String((fallback === undefined || fallback === null) ? 'hold' : fallback).trim().toLowerCase();
		if (fb !== 'mash' && fb !== 'hold') fb = 'hold';
		var value = String((raw === undefined || raw === null) ? fb : raw).trim().toLowerCase();
		if (value === 'mash') return 'mash';
		return 'hold';
	};

	J.defaultBalanceAreas = function() {
		var list = [];
		for (var i = 0; i < 40; i++) {
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
				balanceValue: 0,
				initialized: false,
				moveSequence: [],
				effects: J.makeBalanceAreaEffects(0),
				multEffects: J.makeBalanceAreaEffects(1)
			});
		}
		return list;
	};

	J.balanceAreaEffectFeatures = ['boost', 'focus', 'stick', 'nitro', 'concentrate', 'freeze'];

	J.balanceAreaEffectOrder = function() {
		if (J._balanceAreaEffectOrderCache) return J._balanceAreaEffectOrderCache.slice();
		var order = [
			'unbalanceMovement',
			'unbalanceMovementLeft',
			'unbalanceMovementRight',
			'maneuver',
			'maneuverLeft',
			'maneuverRight',
			'balanceLoss'
		];
		var features = J.balanceAreaEffectFeatures;
		for (var i = 0; i < features.length; i++) order.push(features[i] + 'Value');
		for (var p = 0; p < features.length; p++) order.push(features[p] + 'PassiveRecharge');
		for (var a = 0; a < features.length; a++) order.push(features[a] + 'ActiveDischarge');
		J._balanceAreaEffectOrderCache = order.slice();
		return order;
	};

	J.makeBalanceAreaEffects = function(defaultValue) {
		var result = {};
		var order = J.balanceAreaEffectOrder();
		for (var i = 0; i < order.length; i++) result[order[i]] = defaultValue;
		return result;
	};

	J.parseBalanceAreaEffects = function(raw, defaultValue) {
		var parts = J.splitTopLevelCsvAny(raw);
		var parsed = J.makeBalanceAreaEffects(defaultValue);
		var order = J.balanceAreaEffectOrder();
		for (var i = 0; i < order.length; i++) {
			if (i >= parts.length) break;
			var token = parts[i];
			if (token === undefined || token === null) continue;
			if (String(token).trim().length === 0) continue;
			parsed[order[i]] = J.toEvalNumber(token, defaultValue);
		}
		return parsed;
	};

	J.weightedBalanceEffectMultiplier = function(value, power) {
		var n = Number(value);
		if (!isFinite(n)) return 1;
		var p = Number(power);
		if (!isFinite(p)) p = 0;
		return 1 + ((n - 1) * p);
	};

	J.parseBalanceArea = function(raw) {
		var parts = J.splitTopLevelCsv(raw);
		var baseRaw = parts.slice(0, 5).join(',');
		var z = J.parseHitzone(baseRaw);
		z.balanceValue = (parts.length > 5) ? J.toEvalNumber(parts[5], 0) : 0;
		if (z.moveSequence === undefined) z.moveSequence = [];
		if (!z.effects) z.effects = J.makeBalanceAreaEffects(0);
		if (!z.multEffects) z.multEffects = J.makeBalanceAreaEffects(1);
		return z;
	};

	J.parseBalanceBfChanges = function(raw) {
		return J.parseBalanceAreaEffects(raw, 0);
	};

	J.applyBalanceIconProps = function(o, source, semicolonMode, label, defaults) {
		var cap = String(label || '');
		if (!cap.length) return;
		var pref = 'jakeBalance' + cap;
		var keyPrefix = cap + '(?:[ ]?Key)?';
		var v;
		defaults = defaults || {};
		var dText = (defaults.text !== undefined) ? String(defaults.text) : '';
		var dIcon = (defaults.icon !== undefined) ? String(defaults.icon) : '';
		var dXOffset = (defaults.xOffset !== undefined) ? Number(defaults.xOffset) : 0;
		var dYOffset = (defaults.yOffset !== undefined) ? Number(defaults.yOffset) : 0;
		var dAngle = (defaults.angle !== undefined) ? Number(defaults.angle) : 0;
		var dScaleX = (defaults.scaleX !== undefined) ? Number(defaults.scaleX) : 1;
		var dScaleY = (defaults.scaleY !== undefined) ? Number(defaults.scaleY) : 1;
		var dIndependent = !!defaults.independent;

		v = J.getValue(source, keyPrefix + '[ ]?Text', semicolonMode);
		if (v !== null) o[pref + 'Text'] = String(v);
		else if (o[pref + 'Text'] === undefined) o[pref + 'Text'] = dText;

		v = J.getValue(source, keyPrefix + '[ ]?Icon', semicolonMode);
		if (v !== null) {
			o[pref + 'Icon'] = String(v);
			if (o[pref + 'Icon'].length > 0) ImageManager.loadPicture(o[pref + 'Icon']);
		} else if (o[pref + 'Icon'] === undefined) {
			o[pref + 'Icon'] = dIcon;
			if (o[pref + 'Icon'].length > 0) ImageManager.loadPicture(o[pref + 'Icon']);
		}

		v = J.getFirstValue(source, [keyPrefix + '[ ]?X[ ]?Offset', cap + '[ ]?X[ ]?Offset', keyPrefix + '[ ]?Icon[ ]?X[ ]?Offset', cap + '[ ]?Icon[ ]?X[ ]?Offset'], semicolonMode);
		if (v !== null) o[pref + 'XOffset'] = J.toEvalNumber(v, 0);
		else if (o[pref + 'XOffset'] === undefined) o[pref + 'XOffset'] = dXOffset;

		v = J.getFirstValue(source, [keyPrefix + '[ ]?Y[ ]?Offset', cap + '[ ]?Y[ ]?Offset', keyPrefix + '[ ]?Icon[ ]?Y[ ]?Offset', cap + '[ ]?Icon[ ]?Y[ ]?Offset'], semicolonMode);
		if (v !== null) o[pref + 'YOffset'] = J.toEvalNumber(v, 0);
		else if (o[pref + 'YOffset'] === undefined) o[pref + 'YOffset'] = dYOffset;

		v = J.getFirstValue(source, [keyPrefix + '[ ]?Angle', keyPrefix + '[ ]?Angle[ ]?Offset', cap + '[ ]?Angle', cap + '[ ]?Angle[ ]?Offset', keyPrefix + '[ ]?Icon[ ]?Angle', cap + '[ ]?Icon[ ]?Angle'], semicolonMode);
		if (v !== null) o[pref + 'Angle'] = J.toEvalNumber(v, 0);
		else if (o[pref + 'Angle'] === undefined) o[pref + 'Angle'] = dAngle;

		v = J.getFirstValue(source, [keyPrefix + '[ ]?Scale[ ]?X', cap + '[ ]?Scale[ ]?X', keyPrefix + '[ ]?Icon[ ]?Scale[ ]?X', cap + '[ ]?Icon[ ]?Scale[ ]?X'], semicolonMode);
		if (v !== null) o[pref + 'ScaleX'] = J.toEvalNumber(v, 1);
		else if (o[pref + 'ScaleX'] === undefined) o[pref + 'ScaleX'] = dScaleX;

		v = J.getFirstValue(source, [keyPrefix + '[ ]?Scale[ ]?Y', cap + '[ ]?Scale[ ]?Y', keyPrefix + '[ ]?Icon[ ]?Scale[ ]?Y', cap + '[ ]?Icon[ ]?Scale[ ]?Y'], semicolonMode);
		if (v !== null) o[pref + 'ScaleY'] = J.toEvalNumber(v, 1);
		else if (o[pref + 'ScaleY'] === undefined) o[pref + 'ScaleY'] = dScaleY;

		v = J.getFirstValue(source, ['Independent[ ]?' + keyPrefix + '[ ]?Icon', 'Independent[ ]?' + cap + '[ ]?Icon'], semicolonMode);
		if (v !== null) o[pref + 'Independent'] = J.parseBool(v, false);
		else if (o[pref + 'Independent'] === undefined) o[pref + 'Independent'] = dIndependent;
	};

	J.applyBalanceProps = function(o, source, semicolonMode) {
		if (!J.isBalanceModuleEnabled()) return;
		if (!o || o.type !== 'balance') return;

		var v;
		var bp = J.getBalanceParams();
		var bpv = function(name, fallback) {
			var prefixed = bp['Balance Default ' + name];
			var plain = bp[name];
			var raw = prefixed;
			if (raw === undefined || raw === null || String(raw).trim().length === 0) raw = plain;
			if (raw === undefined || raw === null || String(raw).trim().length === 0) raw = fallback;
			return raw;
		};

		var dShape = String(bpv('Shape', 'rectangle')).trim().toLowerCase();
		var dWidth = Math.max(1, parseInt(bpv('Width', 24)) || 24);
		var dMainColor = String(bpv('Main Color', '#ffffff'));
		var dOutlineColor = String(bpv('Outline Color', '#000000'));
		var dOutlineSize = Math.max(0, parseInt(bpv('Outline Size', 3)) || 0);
		var dFlash = Math.max(1, parseInt(bpv('Flash Rate', 8)) || 1);
		var dWindowWidth = Math.max(32, J.toEvalNumber(bpv('Window Width', 'Graphics.width'), Graphics.width));
		var dWindowHeight = Math.max(2, J.toEvalNumber(bpv('Window Height', 16), 16));
		var dWindowOpacityRaw = parseInt(bpv('Window Opacity', 255));
		var dWindowOpacity = isNaN(dWindowOpacityRaw) ? 255 : J.clamp(dWindowOpacityRaw, 0, 255);
		var dMainVisualOpacity = J.toOpacity(bpv('Opacity', 255), 255);
		var dCursorImage = String(bpv('Cursor Image', ''));
		var rawBalanceCursorColor = String(bpv('Balance Cursor Color', '')).trim();
		var dCursorColor = rawBalanceCursorColor.length > 0 ? rawBalanceCursorColor : dMainColor;
		var dBarThickness = Math.max(2, parseInt(bpv('Height', dWindowHeight)) || dWindowHeight);
		var dBarBg = String(bpv('Background Color', '#ffffff'));
		var dCursorStart = Math.max(0, Number(J.toEvalNumber(bpv('Cursor Start Position', dWindowWidth / 2), dWindowWidth / 2)));
		var dInitStab = Number(J.toEvalNumber(bpv('Initial Stability', 100), 100));
		var dMaxStab = Math.max(1, Number(J.toEvalNumber(bpv('Max Stability', 200), 200)));
		var dPassiveDec = Number(J.toEvalNumber(bpv('Stability Passive Decrease', 0), 0));
		var dLeftKey = isNaN(parseInt(bpv('Left Key', 37))) ? 37 : parseInt(bpv('Left Key', 37));
		var dRightKey = isNaN(parseInt(bpv('Right Key', 39))) ? 39 : parseInt(bpv('Right Key', 39));
		var dLeftMove = Number(J.toEvalNumber(bpv('Left Maneuver', 3), 3));
		var dRightMove = Number(J.toEvalNumber(bpv('Right Maneuver', 3), 3));
		var dManeuverType = J.normalizeBalanceManeuverType(bpv('Maneuver Type', 'Hold'), 'hold');
		var dTimeless = String(bpv('Timeless', 'true')).trim().toLowerCase() === 'true';
		var dUnstarting = String(bpv('Unstarting', 'true')).trim().toLowerCase() === 'true';
		var dUnending = String(bpv('Unending', 'true')).trim().toLowerCase() === 'true';
		var dUnwasting = String(bpv('Stability Unwasting', 'false')).trim().toLowerCase() === 'true';
		var dUnfilling = String(bpv('Stability Unfilling', 'false')).trim().toLowerCase() === 'true';
		var dSeconds = Math.max(0, parseInt(bpv('Seconds', 5)) || 0);
		var dFrames = Math.max(0, parseInt(bpv('Frames', 0)) || 0);
		var dStabColor = String(bpv('Stability Bar Color', '#33ccff'));
		var dStabOutColor = String(bpv('Stability Bar Outline Color', '#000000'));
		var dStabOutSize = Math.max(0, parseInt(bpv('Stability Bar Outline Size', 2)) || 0);
		var dStabH = Math.max(2, parseInt(bpv('Stability Bar Height', 8)) || 2);
		var dBoostVal = Number(J.toEvalNumber(bpv('Boost Value', 0), 0));
		var dFocusVal = Number(J.toEvalNumber(bpv('Focus Value', 0), 0));
		var dStickVal = Number(J.toEvalNumber(bpv('Stick Value', 1), 1));
		var dNitroVal = Number(J.toEvalNumber(bpv('Nitro Value', 1.2), 1.2));
		var dConcentrateVal = Number(J.toEvalNumber(bpv('Concentrate Value', 1.2), 1.2));
		var dFreezeVal = Number(J.toEvalNumber(bpv('Freeze Value', 1.2), 1.2));
		var dBoostLimit = J.clampNegOne(bpv('Boost Limit', -1));
		var dFocusLimit = J.clampNegOne(bpv('Focus Limit', -1));
		var dStickLimit = J.clampNegOne(bpv('Stick Limit', -1));
		var dNitroLimit = J.clampNegOne(bpv('Nitro Limit', -1));
		var dConcentrateLimit = J.clampNegOne(bpv('Concentrate Limit', -1));
		var dFreezeLimit = J.clampNegOne(bpv('Freeze Limit', -1));
		var dBoostExhaustEnable = String(bpv('Boost Exhaust Enable', 'false')).trim().toLowerCase() === 'true';
		var dFocusExhaustEnable = String(bpv('Focus Exhaust Enable', 'false')).trim().toLowerCase() === 'true';
		var dStickExhaustEnable = String(bpv('Stick Exhaust Enable', 'false')).trim().toLowerCase() === 'true';
		var dNitroExhaustEnable = String(bpv('Nitro Exhaust Enable', 'false')).trim().toLowerCase() === 'true';
		var dConcentrateExhaustEnable = String(bpv('Concentrate Exhaust Enable', 'false')).trim().toLowerCase() === 'true';
		var dFreezeExhaustEnable = String(bpv('Freeze Exhaust Enable', 'false')).trim().toLowerCase() === 'true';
		var dBoostExhaustLimit = Math.max(0, Number(J.toEvalNumber(bpv('Boost Exhaust Limit', 50), 50)));
		var dFocusExhaustLimit = Math.max(0, Number(J.toEvalNumber(bpv('Focus Exhaust Limit', 50), 50)));
		var dStickExhaustLimit = Math.max(0, Number(J.toEvalNumber(bpv('Stick Exhaust Limit', 50), 50)));
		var dNitroExhaustLimit = Math.max(0, Number(J.toEvalNumber(bpv('Nitro Exhaust Limit', 50), 50)));
		var dConcentrateExhaustLimit = Math.max(0, Number(J.toEvalNumber(bpv('Concentrate Exhaust Limit', 50), 50)));
		var dFreezeExhaustLimit = Math.max(0, Number(J.toEvalNumber(bpv('Freeze Exhaust Limit', 50), 50)));
		var dBalanceIndependentCursor = String(bpv('Balance Independent Cursor', bpv('Independent Cursor', 'false'))).trim().toLowerCase() === 'true';
		var dBoostPass = Number(J.toEvalNumber(bpv('Boost Passive Recharge', 0), 0));
		var dFocusPass = Number(J.toEvalNumber(bpv('Focus Passive Recharge', 0), 0));
		var dStickPass = Number(J.toEvalNumber(bpv('Stick Passive Recharge', 0), 0));
		var dNitroPass = Number(J.toEvalNumber(bpv('Nitro Passive Recharge', 0), 0));
		var dConcentratePass = Number(J.toEvalNumber(bpv('Concentrate Passive Recharge', 0), 0));
		var dFreezePass = Number(J.toEvalNumber(bpv('Freeze Passive Recharge', 0), 0));
		var dBoostAct = Number(J.toEvalNumber(bpv('Boost Active Discharge', 1), 1));
		var dFocusAct = Number(J.toEvalNumber(bpv('Focus Active Discharge', 1), 1));
		var dStickAct = Number(J.toEvalNumber(bpv('Stick Active Discharge', 1), 1));
		var dNitroAct = Number(J.toEvalNumber(bpv('Nitro Active Discharge', 1), 1));
		var dConcentrateAct = Number(J.toEvalNumber(bpv('Concentrate Active Discharge', 1), 1));
		var dFreezeAct = Number(J.toEvalNumber(bpv('Freeze Active Discharge', 1), 1));
		var dBoostKey = isNaN(parseInt(bpv('Boost Key', ''))) ? null : parseInt(bpv('Boost Key', ''));
		var dFocusKey = isNaN(parseInt(bpv('Focus Key', ''))) ? null : parseInt(bpv('Focus Key', ''));
		var dStickKey = isNaN(parseInt(bpv('Stick Key', ''))) ? null : parseInt(bpv('Stick Key', ''));
		var dNitroKey = isNaN(parseInt(bpv('Nitro Key', ''))) ? null : parseInt(bpv('Nitro Key', ''));
		var dConcentrateKey = isNaN(parseInt(bpv('Concentrate Key', ''))) ? null : parseInt(bpv('Concentrate Key', ''));
		var dFreezeKey = isNaN(parseInt(bpv('Freeze Key', ''))) ? null : parseInt(bpv('Freeze Key', ''));
		var dBoostRechargeHeld = String(bpv('Boost Recharge while Held', 'false')).trim().toLowerCase() === 'true';
		var dFocusRechargeHeld = String(bpv('Focus Recharge while Held', 'false')).trim().toLowerCase() === 'true';
		var dStickRechargeHeld = String(bpv('Stick Recharge while Held', 'false')).trim().toLowerCase() === 'true';
		var dNitroRechargeHeld = String(bpv('Nitro Recharge while Held', 'false')).trim().toLowerCase() === 'true';
		var dConcentrateRechargeHeld = String(bpv('Concentrate Recharge while Held', 'false')).trim().toLowerCase() === 'true';
		var dFreezeRechargeHeld = String(bpv('Freeze Recharge while Held', 'false')).trim().toLowerCase() === 'true';
		var dStopRaw = String(bpv('Stop Key', '')).trim();
		var dStopColor = String(bpv('Stop Key Color', '#ff6666'));
		var dStopText = String(bpv('Stop Key Text', ''));
		var dStopIcon = String(bpv('Stop Key Icon', ''));
		var dStopKeyXOffset = Number(J.toEvalNumber(bpv('Stop Key X Offset', 0), 0));
		var dStopKeyYOffset = Number(J.toEvalNumber(bpv('Stop Key Y Offset', 0), 0));
		var dStopKeyAngle = Number(J.toEvalNumber(bpv('Stop Key Angle', 0), 0));
		var dStopKeyScaleX = Number(J.toEvalNumber(bpv('Stop Key Scale X', 1), 1));
		var dStopKeyScaleY = Number(J.toEvalNumber(bpv('Stop Key Scale Y', 1), 1));
		var dIndependentStopKeyIcon = String(bpv('Independent Stop Key Icon', 'false')).trim().toLowerCase() === 'true';
		var bpvBool = function(name, fallback) {
			return String(bpv(name, fallback ? 'true' : 'false')).trim().toLowerCase() === 'true';
		};
		var bpvNum = function(name, fallback) {
			return Number(J.toEvalNumber(bpv(name, fallback), fallback));
		};
		var bpvStr = function(name, fallback) {
			return String(bpv(name, fallback));
		};
		var makeBalanceIconDefaults = function(label) {
			var keyName = String(label || '') + ' Key';
			return {
				text: bpvStr(keyName + ' Text', ''),
				icon: bpvStr(keyName + ' Icon', ''),
				xOffset: bpvNum(keyName + ' X Offset', 0),
				yOffset: bpvNum(keyName + ' Y Offset', 0),
				angle: bpvNum(keyName + ' Angle', 0),
				scaleX: bpvNum(keyName + ' Scale X', 1),
				scaleY: bpvNum(keyName + ' Scale Y', 1),
				independent: bpvBool('Independent ' + keyName + ' Icon', false)
			};
		};
		var makeBalanceBarDefaults = function(featureName, shownTextFallback) {
			var base = String(featureName || '') + ' Bar';
			return {
				color: bpvStr(base + ' Color', dStabColor),
				shownText: bpvStr(base + ' Shown Text', shownTextFallback),
				shownPicture: bpvStr(base + ' Shown Picture', ''),
				independentShownText: bpvBool(base + ' Independent Shown Text', false),
				independentShownPicture: bpvBool(base + ' Independent Shown Picture', false),
				xOffset: bpvNum(base + ' X Offset', 0),
				yOffset: bpvNum(base + ' Y Offset', 0),
				angle: bpvNum(base + ' Angle', 0),
				scaleX: bpvNum(base + ' Scale X', 1),
				scaleY: bpvNum(base + ' Scale Y', 1),
				textXOffset: bpvNum(base + ' Text X Offset', 0),
				textYOffset: bpvNum(base + ' Text Y Offset', 0),
				textAngle: bpvNum(base + ' Text Angle', 0),
				textScaleX: bpvNum(base + ' Text Scale X', 1),
				textScaleY: bpvNum(base + ' Text Scale Y', 1),
				pictureXOffset: bpvNum(base + ' Picture X Offset', 0),
				pictureYOffset: bpvNum(base + ' Picture Y Offset', 0),
				pictureAngle: bpvNum(base + ' Picture Angle', 0),
				pictureScaleX: bpvNum(base + ' Picture Scale X', 1),
				pictureScaleY: bpvNum(base + ' Picture Scale Y', 1)
			};
		};

		var dCursorVisualXOffset = bpvNum('Cursor Visual X Offset', 0);
		var dCursorVisualYOffset = bpvNum('Cursor Visual Y Offset', 0);
		var dCursorAngleOffset = bpvNum('Cursor Angle', 0);
		var dCursorScaleX = bpvNum('Cursor Scale X', 1);
		var dCursorScaleY = bpvNum('Cursor Scale Y', 1);
		var dDisableLeft = bpvBool('Disable Left', false);
		var dDisableRight = bpvBool('Disable Right', false);
		var dStabilityBarDefaults = makeBalanceBarDefaults('Stability', '$stab');
		var dBoostBarDefaults = makeBalanceBarDefaults('Boost', '$boost');
		var dFocusBarDefaults = makeBalanceBarDefaults('Focus', '$focus');
		var dStickBarDefaults = makeBalanceBarDefaults('Stick', '$stick');
		var dNitroBarDefaults = makeBalanceBarDefaults('Nitro', '$nitro');
		var dConcentrateBarDefaults = makeBalanceBarDefaults('Concentrate', '$concentrate');
		var dFreezeBarDefaults = makeBalanceBarDefaults('Freeze', '$freeze');
		var dLeftIconDefaults = makeBalanceIconDefaults('Left');
		var dRightIconDefaults = makeBalanceIconDefaults('Right');
		var dBoostIconDefaults = makeBalanceIconDefaults('Boost');
		var dFocusIconDefaults = makeBalanceIconDefaults('Focus');
		var dStickIconDefaults = makeBalanceIconDefaults('Stick');
		var dNitroIconDefaults = makeBalanceIconDefaults('Nitro');
		var dConcentrateIconDefaults = makeBalanceIconDefaults('Concentrate');
		var dFreezeIconDefaults = makeBalanceIconDefaults('Freeze');

		if (o.shape === undefined) o.shape = dShape;
		if (o.width === undefined) o.width = dWidth;
		if (o.color === undefined) o.color = dMainColor;
		if (o.outline === undefined) o.outline = dOutlineColor;
		if (o.size === undefined) o.size = dOutlineSize;
		if (o.flash === undefined) o.flash = dFlash;
		if (o.opacity === undefined) o.opacity = dWindowOpacity;
		if (o.jakeMainOpacityExplicit === undefined) o.jakeMainOpacityExplicit = false;

		v = J.getValue(source, 'Cursor[ ]?Image', semicolonMode);
		if (v !== null) o.image = String(v);
		else if (o.image === undefined) o.image = dCursorImage;

		v = J.getValue(source, 'Cursor[ ]?Color', semicolonMode);
		if (v !== null) o.jakeBalanceCursorColor = String(v);
		else if (o.jakeBalanceCursorColor === undefined) o.jakeBalanceCursorColor = dCursorColor;

		var explicitMainOpacity = J.getFirstValue(source, ['Main[ ]?Opacity', 'Opacity'], semicolonMode);
		if (explicitMainOpacity !== null) {
			o.jakeVisualOpacity = J.toOpacity(explicitMainOpacity, dMainVisualOpacity);
			o.jakeMainOpacityExplicit = true;
		} else if (!o.jakeMainOpacityExplicit) {
			o.jakeVisualOpacity = dMainVisualOpacity;
			o.jakeMainOpacityExplicit = false;
		}
		v = J.getValue(source, 'Window[ ]?Opacity', semicolonMode);
		if (v !== null) o.opacity = J.toOpacity(v, dWindowOpacity);

		J.applyBalanceOpacityParams(o, source, semicolonMode, bpv);

		v = J.getValue(source, 'Window[ ]?Width', semicolonMode);
		if (v !== null) o.jakeBalanceBarWidth = Math.max(32, J.toEvalNumber(v, dWindowWidth));
		else if (o.jakeBalanceBarWidth === undefined) o.jakeBalanceBarWidth = dWindowWidth;

		v = J.getValue(source, 'Window[ ]?Height', semicolonMode);
		if (v !== null) o.jakeBalanceBarThickness = Math.max(2, J.toEvalNumber(v, dBarThickness));
		else if (o.jakeBalanceBarThickness === undefined) o.jakeBalanceBarThickness = dBarThickness;

		v = J.getValue(source, 'Main[ ]?Color', semicolonMode);
		if (v !== null) o.color = String(v);

		v = J.getValue(source, 'Shape', semicolonMode);
		if (v !== null) o.shape = String(v).trim().toLowerCase();

		v = J.getValue(source, 'Width', semicolonMode);
		if (v !== null) o.width = Math.max(1, parseInt(v) || 1);

		v = J.getValue(source, 'Outline[ ]?Color', semicolonMode);
		if (v !== null) o.outline = String(v);

		v = J.getValue(source, 'Outline[ ]?Size', semicolonMode);
		if (v !== null) o.size = Math.max(0, parseInt(v) || 0);

		v = J.getValue(source, 'Flash[ ]?Rate', semicolonMode);
		if (v !== null) o.flash = Math.max(1, parseInt(v) || 1);

		v = J.getValue(source, 'Bar[ ]?Thickness', semicolonMode);
		if (v !== null) o.jakeBalanceBarThickness = Math.max(2, parseInt(v) || 2);
		else if (o.jakeBalanceBarThickness === undefined) o.jakeBalanceBarThickness = dBarThickness;

		v = J.getValue(source, 'Background[ ]?Color', semicolonMode);
		if (v !== null) o.jakeBalanceBackgroundColor = String(v);
		else if (o.jakeBalanceBackgroundColor === undefined) o.jakeBalanceBackgroundColor = dBarBg;

		v = J.getValue(source, 'Cursor[ ]?Start[ ]?Position', semicolonMode);
		if (v !== null) o.jakeBalanceCursorStart = Math.max(0, J.toEvalNumber(v, 0));
		else if (o.jakeBalanceCursorStart === undefined) o.jakeBalanceCursorStart = dCursorStart;

		v = J.getFirstValue(source, ['Cursor[ ]?Visual[ ]?X[ ]?Offset', 'Cursor[ ]?X[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeBalanceCursorVisualXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceCursorVisualXOffset === undefined) o.jakeBalanceCursorVisualXOffset = dCursorVisualXOffset;

		v = J.getFirstValue(source, ['Cursor[ ]?Visual[ ]?Y[ ]?Offset', 'Cursor[ ]?Y[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeBalanceCursorVisualYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceCursorVisualYOffset === undefined) o.jakeBalanceCursorVisualYOffset = dCursorVisualYOffset;

		v = J.getFirstValue(source, ['Cursor[ ]?Angle[ ]?Offset', 'Cursor[ ]?Angle'], semicolonMode);
		if (v !== null) o.jakeBalanceCursorAngleOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceCursorAngleOffset === undefined) o.jakeBalanceCursorAngleOffset = dCursorAngleOffset;

		v = J.getValue(source, 'Cursor[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeBalanceCursorScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeBalanceCursorScaleX === undefined) o.jakeBalanceCursorScaleX = dCursorScaleX;

		v = J.getValue(source, 'Cursor[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeBalanceCursorScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeBalanceCursorScaleY === undefined) o.jakeBalanceCursorScaleY = dCursorScaleY;

		v = J.getFirstValue(source, ['Independent[ ]?Cursor', 'Balance[ ]?Independent[ ]?Cursor'], semicolonMode);
		if (v !== null) o.jakeBalanceIndependentCursor = J.parseBool(v, false);
		else if (o.jakeBalanceIndependentCursor === undefined) o.jakeBalanceIndependentCursor = dBalanceIndependentCursor;

		v = J.getValue(source, 'Unbalance[ ]?Movement', semicolonMode);
		if (v !== null) o.jakeBalanceUnbalanceSeq = J.parseMovementSequence(v);
		else if (!o.jakeBalanceUnbalanceSeq) o.jakeBalanceUnbalanceSeq = [];

		if (!o.jakeRandomMovementPools) o.jakeRandomMovementPools = {};
		for (var p = 1; p <= 100; p++) {
			v = J.getValue(source, 'Random[ ]?Movement[ ]?' + p, semicolonMode);
			if (v !== null) o.jakeRandomMovementPools[p] = J.parseMovementSequence(v);
		}

		if (!o.jakeBalanceAreas) o.jakeBalanceAreas = J.defaultBalanceAreas();
		for (var i = 1; i <= 40; i++) {
			v = J.getValue(source, 'Balance[ ]?Area[ ]?' + i, semicolonMode);
			if (v !== null) o.jakeBalanceAreas[i - 1] = J.parseBalanceArea(v);

			v = J.getValue(source, 'Balance[ ]?Area[ ]?Movement[ ]?' + i, semicolonMode);
			if (v !== null) {
				if (!o.jakeBalanceAreas[i - 1]) o.jakeBalanceAreas[i - 1] = J.parseBalanceArea('');
				o.jakeBalanceAreas[i - 1].moveSequence = J.parseMovementSequence(v);
			}

			v = J.getValue(source, 'Balance[ ]?Area[ ]?Effects[ ]?' + i, semicolonMode);
			if (v !== null) {
				if (!o.jakeBalanceAreas[i - 1]) o.jakeBalanceAreas[i - 1] = J.parseBalanceArea('');
				o.jakeBalanceAreas[i - 1].effects = J.parseBalanceAreaEffects(v, 0);
			}

			v = J.getValue(source, 'Balance[ ]?Area[ ]?Mult[ -]?[ ]?Effects[ ]?' + i, semicolonMode);
			if (v !== null) {
				if (!o.jakeBalanceAreas[i - 1]) o.jakeBalanceAreas[i - 1] = J.parseBalanceArea('');
				o.jakeBalanceAreas[i - 1].multEffects = J.parseBalanceAreaEffects(v, 1);
			}
		}

		v = J.getValue(source, 'Initial[ ]?Stability', semicolonMode);
		if (v !== null) o.jakeBalanceInitialStability = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceInitialStability === undefined) o.jakeBalanceInitialStability = dInitStab;

		v = J.getValue(source, 'Max[ ]?Stability', semicolonMode);
		if (v !== null) o.jakeBalanceMaxStability = Math.max(1, J.toEvalNumber(v, 100));
		else if (o.jakeBalanceMaxStability === undefined) o.jakeBalanceMaxStability = dMaxStab;

		v = J.getValue(source, 'Stability[ ]?passive[ ]?decrease', semicolonMode);
		if (v !== null) o.jakeBalancePassiveDecrease = J.toEvalNumber(v, 0);
		else if (o.jakeBalancePassiveDecrease === undefined) o.jakeBalancePassiveDecrease = dPassiveDec;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Color', semicolonMode);
		if (v !== null) o.jakeStabilityBarColor = String(v);
		else if (o.jakeStabilityBarColor === undefined) o.jakeStabilityBarColor = dStabColor;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Outline[ ]?Color', semicolonMode);
		if (v !== null) o.jakeStabilityBarOutlineColor = String(v);
		else if (o.jakeStabilityBarOutlineColor === undefined) o.jakeStabilityBarOutlineColor = dStabOutColor;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Outline[ ]?Size', semicolonMode);
		if (v !== null) o.jakeStabilityBarOutlineSize = Math.max(0, parseInt(v) || 0);
		else if (o.jakeStabilityBarOutlineSize === undefined) o.jakeStabilityBarOutlineSize = dStabOutSize;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Height', semicolonMode);
		if (v !== null) o.jakeStabilityBarHeight = Math.max(2, parseInt(v) || 2);
		else if (o.jakeStabilityBarHeight === undefined) o.jakeStabilityBarHeight = dStabH;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Shown[ ]?Text', semicolonMode);
		if (v !== null) o.jakeStabilityBarShownText = String(v);
		else if (o.jakeStabilityBarShownText === undefined) o.jakeStabilityBarShownText = dStabilityBarDefaults.shownText;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Shown[ ]?Picture', semicolonMode);
		if (v !== null) {
			o.jakeStabilityBarShownPicture = String(v);
			if (o.jakeStabilityBarShownPicture.length > 0) ImageManager.loadPicture(o.jakeStabilityBarShownPicture);
		} else if (o.jakeStabilityBarShownPicture === undefined) {
			o.jakeStabilityBarShownPicture = dStabilityBarDefaults.shownPicture;
			if (o.jakeStabilityBarShownPicture.length > 0) ImageManager.loadPicture(o.jakeStabilityBarShownPicture);
		}

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeStabilityBarXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarXOffset === undefined) o.jakeStabilityBarXOffset = dStabilityBarDefaults.xOffset;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeStabilityBarYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarYOffset === undefined) o.jakeStabilityBarYOffset = dStabilityBarDefaults.yOffset;

		v = J.getFirstValue(source, ['Stability[ ]?Bar[ ]?Angle', 'Stability[ ]?Bar[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeStabilityBarAngle = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarAngle === undefined) o.jakeStabilityBarAngle = dStabilityBarDefaults.angle;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeStabilityBarScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeStabilityBarScaleX === undefined) o.jakeStabilityBarScaleX = dStabilityBarDefaults.scaleX;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeStabilityBarScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeStabilityBarScaleY === undefined) o.jakeStabilityBarScaleY = dStabilityBarDefaults.scaleY;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Text[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeStabilityBarTextXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarTextXOffset === undefined) o.jakeStabilityBarTextXOffset = dStabilityBarDefaults.textXOffset;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Text[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeStabilityBarTextYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarTextYOffset === undefined) o.jakeStabilityBarTextYOffset = dStabilityBarDefaults.textYOffset;

		v = J.getFirstValue(source, ['Stability[ ]?Bar[ ]?Text[ ]?Angle', 'Stability[ ]?Bar[ ]?Text[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeStabilityBarTextAngle = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarTextAngle === undefined) o.jakeStabilityBarTextAngle = dStabilityBarDefaults.textAngle;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Text[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeStabilityBarTextScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeStabilityBarTextScaleX === undefined) o.jakeStabilityBarTextScaleX = dStabilityBarDefaults.textScaleX;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Text[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeStabilityBarTextScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeStabilityBarTextScaleY === undefined) o.jakeStabilityBarTextScaleY = dStabilityBarDefaults.textScaleY;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Picture[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeStabilityBarPictureXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarPictureXOffset === undefined) o.jakeStabilityBarPictureXOffset = dStabilityBarDefaults.pictureXOffset;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Picture[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeStabilityBarPictureYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarPictureYOffset === undefined) o.jakeStabilityBarPictureYOffset = dStabilityBarDefaults.pictureYOffset;

		v = J.getFirstValue(source, ['Stability[ ]?Bar[ ]?Picture[ ]?Angle', 'Stability[ ]?Bar[ ]?Picture[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeStabilityBarPictureAngle = J.toEvalNumber(v, 0);
		else if (o.jakeStabilityBarPictureAngle === undefined) o.jakeStabilityBarPictureAngle = dStabilityBarDefaults.pictureAngle;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Picture[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeStabilityBarPictureScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeStabilityBarPictureScaleX === undefined) o.jakeStabilityBarPictureScaleX = dStabilityBarDefaults.pictureScaleX;

		v = J.getValue(source, 'Stability[ ]?Bar[ ]?Picture[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeStabilityBarPictureScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeStabilityBarPictureScaleY === undefined) o.jakeStabilityBarPictureScaleY = dStabilityBarDefaults.pictureScaleY;

		v = J.getValue(source, 'Left[ ]?maneuver[ ]?value', semicolonMode);
		if (v !== null) o.jakeBalanceLeftManeuver = J.toEvalNumber(v, 3);
		else if (o.jakeBalanceLeftManeuver === undefined) o.jakeBalanceLeftManeuver = dLeftMove;

		v = J.getValue(source, 'Right[ ]?maneuver[ ]?value', semicolonMode);
		if (v !== null) o.jakeBalanceRightManeuver = J.toEvalNumber(v, 3);
		else if (o.jakeBalanceRightManeuver === undefined) o.jakeBalanceRightManeuver = dRightMove;

		v = J.getFirstValue(source, ['Maneuver[ ]?Type', 'Maneuver[ ]?Input[ ]?Type'], semicolonMode);
		if (v !== null) o.jakeBalanceManeuverType = J.normalizeBalanceManeuverType(v, dManeuverType);
		else if (o.jakeBalanceManeuverType === undefined) o.jakeBalanceManeuverType = dManeuverType;

		v = J.getValue(source, 'Left[ ]?key', semicolonMode);
		if (v !== null) o.jakeBalanceLeftKey = parseInt(v);
		else if (o.jakeBalanceLeftKey === undefined || isNaN(o.jakeBalanceLeftKey)) o.jakeBalanceLeftKey = dLeftKey;

		v = J.getValue(source, 'Right[ ]?key', semicolonMode);
		if (v !== null) o.jakeBalanceRightKey = parseInt(v);
		else if (o.jakeBalanceRightKey === undefined || isNaN(o.jakeBalanceRightKey)) o.jakeBalanceRightKey = dRightKey;

		v = J.getValue(source, 'Disable[ ]?Left', semicolonMode);
		if (v !== null) o.jakeBalanceDisableLeft = J.parseBool(v, false);
		else if (o.jakeBalanceDisableLeft === undefined) o.jakeBalanceDisableLeft = dDisableLeft;

		v = J.getValue(source, 'Disable[ ]?Right', semicolonMode);
		if (v !== null) o.jakeBalanceDisableRight = J.parseBool(v, false);
		else if (o.jakeBalanceDisableRight === undefined) o.jakeBalanceDisableRight = dDisableRight;

		J.applyBalanceIconProps(o, source, semicolonMode, 'Left', dLeftIconDefaults);
		J.applyBalanceIconProps(o, source, semicolonMode, 'Right', dRightIconDefaults);
		J.applyBalanceIconProps(o, source, semicolonMode, 'Boost', dBoostIconDefaults);
		J.applyBalanceIconProps(o, source, semicolonMode, 'Focus', dFocusIconDefaults);
		J.applyBalanceIconProps(o, source, semicolonMode, 'Stick', dStickIconDefaults);
		J.applyBalanceIconProps(o, source, semicolonMode, 'Nitro', dNitroIconDefaults);
		J.applyBalanceIconProps(o, source, semicolonMode, 'Concentrate', dConcentrateIconDefaults);
		J.applyBalanceIconProps(o, source, semicolonMode, 'Freeze', dFreezeIconDefaults);

		v = J.getValue(source, 'Boost[ ]?key', semicolonMode);
		if (v !== null) {
			var bk = parseInt(v);
			o.jakeBalanceBoostKey = isNaN(bk) ? null : bk;
		} else if (o.jakeBalanceBoostKey === undefined) o.jakeBalanceBoostKey = dBoostKey;

		v = J.getValue(source, 'Focus[ ]?key', semicolonMode);
		if (v !== null) {
			var fk = parseInt(v);
			o.jakeBalanceFocusKey = isNaN(fk) ? null : fk;
		} else if (o.jakeBalanceFocusKey === undefined) o.jakeBalanceFocusKey = dFocusKey;

		v = J.getValue(source, 'Boost[ ]?value', semicolonMode);
		if (v !== null) o.jakeBalanceBoostValue = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceBoostValue === undefined) o.jakeBalanceBoostValue = dBoostVal;

		v = J.getValue(source, 'Focus[ ]?value', semicolonMode);
		if (v !== null) o.jakeBalanceFocusValue = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceFocusValue === undefined) o.jakeBalanceFocusValue = dFocusVal;

		v = J.getValue(source, 'Boost[ ]?Limit', semicolonMode);
		if (v !== null) o.jakeBalanceBoostLimit = J.clampNegOne(v);
		else if (o.jakeBalanceBoostLimit === undefined) o.jakeBalanceBoostLimit = dBoostLimit;

		v = J.getValue(source, 'Focus[ ]?Limit', semicolonMode);
		if (v !== null) o.jakeBalanceFocusLimit = J.clampNegOne(v);
		else if (o.jakeBalanceFocusLimit === undefined) o.jakeBalanceFocusLimit = dFocusLimit;

		v = J.getValue(source, 'Boost[ ]?Passive[ ]?Recharge', semicolonMode);
		if (v !== null) o.jakeBalanceBoostPassiveRecharge = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceBoostPassiveRecharge === undefined) o.jakeBalanceBoostPassiveRecharge = dBoostPass;

		v = J.getValue(source, 'Focus[ ]?Passive[ ]?Recharge', semicolonMode);
		if (v !== null) o.jakeBalanceFocusPassiveRecharge = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceFocusPassiveRecharge === undefined) o.jakeBalanceFocusPassiveRecharge = dFocusPass;

		v = J.getValue(source, 'Boost[ ]?Recharge[ ]?while[ ]?Held', semicolonMode);
		if (v !== null) o.jakeBalanceBoostRechargeWhileHeld = J.parseBool(v, false);
		else if (o.jakeBalanceBoostRechargeWhileHeld === undefined) o.jakeBalanceBoostRechargeWhileHeld = dBoostRechargeHeld;

		v = J.getValue(source, 'Focus[ ]?Recharge[ ]?while[ ]?Held', semicolonMode);
		if (v !== null) o.jakeBalanceFocusRechargeWhileHeld = J.parseBool(v, false);
		else if (o.jakeBalanceFocusRechargeWhileHeld === undefined) o.jakeBalanceFocusRechargeWhileHeld = dFocusRechargeHeld;

		v = J.getValue(source, 'Boost[ ]?Active[ ]?Discharge', semicolonMode);
		if (v !== null) o.jakeBalanceBoostActiveDischarge = J.toEvalNumber(v, 1);
		else if (o.jakeBalanceBoostActiveDischarge === undefined) o.jakeBalanceBoostActiveDischarge = dBoostAct;

		v = J.getValue(source, 'Focus[ ]?Active[ ]?Discharge', semicolonMode);
		if (v !== null) o.jakeBalanceFocusActiveDischarge = J.toEvalNumber(v, 1);
		else if (o.jakeBalanceFocusActiveDischarge === undefined) o.jakeBalanceFocusActiveDischarge = dFocusAct;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Color', semicolonMode);
		if (v !== null) o.jakeBoostBarColor = String(v);
		else if (o.jakeBoostBarColor === undefined) o.jakeBoostBarColor = dBoostBarDefaults.color;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Color', semicolonMode);
		if (v !== null) o.jakeFocusBarColor = String(v);
		else if (o.jakeFocusBarColor === undefined) o.jakeFocusBarColor = dFocusBarDefaults.color;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Shown[ ]?Text', semicolonMode);
		if (v !== null) o.jakeBoostBarShownText = String(v);
		else if (o.jakeBoostBarShownText === undefined) o.jakeBoostBarShownText = dBoostBarDefaults.shownText;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Shown[ ]?Picture', semicolonMode);
		if (v !== null) {
			o.jakeBoostBarShownPicture = String(v);
			if (o.jakeBoostBarShownPicture.length > 0) ImageManager.loadPicture(o.jakeBoostBarShownPicture);
		} else if (o.jakeBoostBarShownPicture === undefined) {
			o.jakeBoostBarShownPicture = dBoostBarDefaults.shownPicture;
			if (o.jakeBoostBarShownPicture.length > 0) ImageManager.loadPicture(o.jakeBoostBarShownPicture);
		}

		v = J.getFirstValue(source, ['Boost[ ]?Bar[ ]?Independent[ ]?Shown[ ]?Text', 'Independent[ ]?Boost[ ]?Bar[ ]?Shown[ ]?Text'], semicolonMode);
		if (v !== null) o.jakeBoostBarIndependentShownText = J.parseBool(v, false);
		else if (o.jakeBoostBarIndependentShownText === undefined) o.jakeBoostBarIndependentShownText = dBoostBarDefaults.independentShownText;

		v = J.getFirstValue(source, ['Boost[ ]?Bar[ ]?Independent[ ]?Shown[ ]?Picture', 'Independent[ ]?Boost[ ]?Bar[ ]?Shown[ ]?Picture'], semicolonMode);
		if (v !== null) o.jakeBoostBarIndependentShownPicture = J.parseBool(v, false);
		else if (o.jakeBoostBarIndependentShownPicture === undefined) o.jakeBoostBarIndependentShownPicture = dBoostBarDefaults.independentShownPicture;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeBoostBarXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarXOffset === undefined) o.jakeBoostBarXOffset = dBoostBarDefaults.xOffset;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeBoostBarYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarYOffset === undefined) o.jakeBoostBarYOffset = dBoostBarDefaults.yOffset;

		v = J.getFirstValue(source, ['Boost[ ]?Bar[ ]?Angle', 'Boost[ ]?Bar[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeBoostBarAngle = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarAngle === undefined) o.jakeBoostBarAngle = dBoostBarDefaults.angle;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeBoostBarScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeBoostBarScaleX === undefined) o.jakeBoostBarScaleX = dBoostBarDefaults.scaleX;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeBoostBarScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeBoostBarScaleY === undefined) o.jakeBoostBarScaleY = dBoostBarDefaults.scaleY;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Text[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeBoostBarTextXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarTextXOffset === undefined) o.jakeBoostBarTextXOffset = dBoostBarDefaults.textXOffset;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Text[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeBoostBarTextYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarTextYOffset === undefined) o.jakeBoostBarTextYOffset = dBoostBarDefaults.textYOffset;

		v = J.getFirstValue(source, ['Boost[ ]?Bar[ ]?Text[ ]?Angle', 'Boost[ ]?Bar[ ]?Text[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeBoostBarTextAngle = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarTextAngle === undefined) o.jakeBoostBarTextAngle = dBoostBarDefaults.textAngle;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Text[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeBoostBarTextScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeBoostBarTextScaleX === undefined) o.jakeBoostBarTextScaleX = dBoostBarDefaults.textScaleX;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Text[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeBoostBarTextScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeBoostBarTextScaleY === undefined) o.jakeBoostBarTextScaleY = dBoostBarDefaults.textScaleY;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Picture[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeBoostBarPictureXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarPictureXOffset === undefined) o.jakeBoostBarPictureXOffset = dBoostBarDefaults.pictureXOffset;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Picture[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeBoostBarPictureYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarPictureYOffset === undefined) o.jakeBoostBarPictureYOffset = dBoostBarDefaults.pictureYOffset;

		v = J.getFirstValue(source, ['Boost[ ]?Bar[ ]?Picture[ ]?Angle', 'Boost[ ]?Bar[ ]?Picture[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeBoostBarPictureAngle = J.toEvalNumber(v, 0);
		else if (o.jakeBoostBarPictureAngle === undefined) o.jakeBoostBarPictureAngle = dBoostBarDefaults.pictureAngle;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Picture[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeBoostBarPictureScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeBoostBarPictureScaleX === undefined) o.jakeBoostBarPictureScaleX = dBoostBarDefaults.pictureScaleX;

		v = J.getValue(source, 'Boost[ ]?Bar[ ]?Picture[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeBoostBarPictureScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeBoostBarPictureScaleY === undefined) o.jakeBoostBarPictureScaleY = dBoostBarDefaults.pictureScaleY;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Shown[ ]?Text', semicolonMode);
		if (v !== null) o.jakeFocusBarShownText = String(v);
		else if (o.jakeFocusBarShownText === undefined) o.jakeFocusBarShownText = dFocusBarDefaults.shownText;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Shown[ ]?Picture', semicolonMode);
		if (v !== null) {
			o.jakeFocusBarShownPicture = String(v);
			if (o.jakeFocusBarShownPicture.length > 0) ImageManager.loadPicture(o.jakeFocusBarShownPicture);
		} else if (o.jakeFocusBarShownPicture === undefined) {
			o.jakeFocusBarShownPicture = dFocusBarDefaults.shownPicture;
			if (o.jakeFocusBarShownPicture.length > 0) ImageManager.loadPicture(o.jakeFocusBarShownPicture);
		}

		v = J.getFirstValue(source, ['Focus[ ]?Bar[ ]?Independent[ ]?Shown[ ]?Text', 'Independent[ ]?Focus[ ]?Bar[ ]?Shown[ ]?Text'], semicolonMode);
		if (v !== null) o.jakeFocusBarIndependentShownText = J.parseBool(v, false);
		else if (o.jakeFocusBarIndependentShownText === undefined) o.jakeFocusBarIndependentShownText = dFocusBarDefaults.independentShownText;

		v = J.getFirstValue(source, ['Focus[ ]?Bar[ ]?Independent[ ]?Shown[ ]?Picture', 'Independent[ ]?Focus[ ]?Bar[ ]?Shown[ ]?Picture'], semicolonMode);
		if (v !== null) o.jakeFocusBarIndependentShownPicture = J.parseBool(v, false);
		else if (o.jakeFocusBarIndependentShownPicture === undefined) o.jakeFocusBarIndependentShownPicture = dFocusBarDefaults.independentShownPicture;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeFocusBarXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarXOffset === undefined) o.jakeFocusBarXOffset = dFocusBarDefaults.xOffset;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeFocusBarYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarYOffset === undefined) o.jakeFocusBarYOffset = dFocusBarDefaults.yOffset;

		v = J.getFirstValue(source, ['Focus[ ]?Bar[ ]?Angle', 'Focus[ ]?Bar[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeFocusBarAngle = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarAngle === undefined) o.jakeFocusBarAngle = dFocusBarDefaults.angle;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeFocusBarScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeFocusBarScaleX === undefined) o.jakeFocusBarScaleX = dFocusBarDefaults.scaleX;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeFocusBarScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeFocusBarScaleY === undefined) o.jakeFocusBarScaleY = dFocusBarDefaults.scaleY;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Text[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeFocusBarTextXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarTextXOffset === undefined) o.jakeFocusBarTextXOffset = dFocusBarDefaults.textXOffset;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Text[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeFocusBarTextYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarTextYOffset === undefined) o.jakeFocusBarTextYOffset = dFocusBarDefaults.textYOffset;

		v = J.getFirstValue(source, ['Focus[ ]?Bar[ ]?Text[ ]?Angle', 'Focus[ ]?Bar[ ]?Text[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeFocusBarTextAngle = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarTextAngle === undefined) o.jakeFocusBarTextAngle = dFocusBarDefaults.textAngle;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Text[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeFocusBarTextScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeFocusBarTextScaleX === undefined) o.jakeFocusBarTextScaleX = dFocusBarDefaults.textScaleX;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Text[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeFocusBarTextScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeFocusBarTextScaleY === undefined) o.jakeFocusBarTextScaleY = dFocusBarDefaults.textScaleY;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Picture[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeFocusBarPictureXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarPictureXOffset === undefined) o.jakeFocusBarPictureXOffset = dFocusBarDefaults.pictureXOffset;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Picture[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeFocusBarPictureYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarPictureYOffset === undefined) o.jakeFocusBarPictureYOffset = dFocusBarDefaults.pictureYOffset;

		v = J.getFirstValue(source, ['Focus[ ]?Bar[ ]?Picture[ ]?Angle', 'Focus[ ]?Bar[ ]?Picture[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeFocusBarPictureAngle = J.toEvalNumber(v, 0);
		else if (o.jakeFocusBarPictureAngle === undefined) o.jakeFocusBarPictureAngle = dFocusBarDefaults.pictureAngle;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Picture[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeFocusBarPictureScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeFocusBarPictureScaleX === undefined) o.jakeFocusBarPictureScaleX = dFocusBarDefaults.pictureScaleX;

		v = J.getValue(source, 'Focus[ ]?Bar[ ]?Picture[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeFocusBarPictureScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeFocusBarPictureScaleY === undefined) o.jakeFocusBarPictureScaleY = dFocusBarDefaults.pictureScaleY;

		var parseBalanceFeature = function(featureName, defaults) {
			var balanceBase = 'jakeBalance' + featureName;
			var barBase = 'jake' + featureName + 'Bar';
			defaults = defaults || {};
			var barColorDefault = (defaults.barColor !== undefined) ? String(defaults.barColor) : o.jakeStabilityBarColor;
			var shownTextDefault = (defaults.shownText !== undefined) ? String(defaults.shownText) : '';
			var shownPictureDefault = (defaults.shownPicture !== undefined) ? String(defaults.shownPicture) : '';
			var independentShownTextDefault = !!defaults.independentShownText;
			var independentShownPictureDefault = !!defaults.independentShownPicture;
			var xOffsetDefault = (defaults.xOffset !== undefined) ? Number(defaults.xOffset) : 0;
			var yOffsetDefault = (defaults.yOffset !== undefined) ? Number(defaults.yOffset) : 0;
			var angleDefault = (defaults.angle !== undefined) ? Number(defaults.angle) : 0;
			var scaleXDefault = (defaults.scaleX !== undefined) ? Number(defaults.scaleX) : 1;
			var scaleYDefault = (defaults.scaleY !== undefined) ? Number(defaults.scaleY) : 1;
			var textXOffsetDefault = (defaults.textXOffset !== undefined) ? Number(defaults.textXOffset) : 0;
			var textYOffsetDefault = (defaults.textYOffset !== undefined) ? Number(defaults.textYOffset) : 0;
			var textAngleDefault = (defaults.textAngle !== undefined) ? Number(defaults.textAngle) : 0;
			var textScaleXDefault = (defaults.textScaleX !== undefined) ? Number(defaults.textScaleX) : 1;
			var textScaleYDefault = (defaults.textScaleY !== undefined) ? Number(defaults.textScaleY) : 1;
			var pictureXOffsetDefault = (defaults.pictureXOffset !== undefined) ? Number(defaults.pictureXOffset) : 0;
			var pictureYOffsetDefault = (defaults.pictureYOffset !== undefined) ? Number(defaults.pictureYOffset) : 0;
			var pictureAngleDefault = (defaults.pictureAngle !== undefined) ? Number(defaults.pictureAngle) : 0;
			var pictureScaleXDefault = (defaults.pictureScaleX !== undefined) ? Number(defaults.pictureScaleX) : 1;
			var pictureScaleYDefault = (defaults.pictureScaleY !== undefined) ? Number(defaults.pictureScaleY) : 1;

			v = J.getValue(source, featureName + '[ ]?key', semicolonMode);
			if (v !== null) {
				var keyCode = parseInt(v);
				o[balanceBase + 'Key'] = isNaN(keyCode) ? null : keyCode;
			} else if (o[balanceBase + 'Key'] === undefined) o[balanceBase + 'Key'] = (defaults.key !== undefined) ? defaults.key : null;

			v = J.getValue(source, featureName + '[ ]?value', semicolonMode);
			if (v !== null) o[balanceBase + 'Value'] = J.toEvalNumber(v, defaults.value);
			else if (o[balanceBase + 'Value'] === undefined) o[balanceBase + 'Value'] = defaults.value;

			v = J.getValue(source, featureName + '[ ]?Limit', semicolonMode);
			if (v !== null) o[balanceBase + 'Limit'] = J.clampNegOne(v);
			else if (o[balanceBase + 'Limit'] === undefined) o[balanceBase + 'Limit'] = defaults.limit;

			v = J.getValue(source, featureName + '[ ]?Passive[ ]?Recharge', semicolonMode);
			if (v !== null) o[balanceBase + 'PassiveRecharge'] = J.toEvalNumber(v, defaults.passiveRecharge);
			else if (o[balanceBase + 'PassiveRecharge'] === undefined) o[balanceBase + 'PassiveRecharge'] = defaults.passiveRecharge;

			v = J.getValue(source, featureName + '[ ]?Recharge[ ]?while[ ]?Held', semicolonMode);
			if (v !== null) o[balanceBase + 'RechargeWhileHeld'] = J.parseBool(v, false);
			else if (o[balanceBase + 'RechargeWhileHeld'] === undefined) o[balanceBase + 'RechargeWhileHeld'] = !!defaults.rechargeWhileHeld;

			v = J.getValue(source, featureName + '[ ]?Active[ ]?Discharge', semicolonMode);
			if (v !== null) o[balanceBase + 'ActiveDischarge'] = J.toEvalNumber(v, defaults.activeDischarge);
			else if (o[balanceBase + 'ActiveDischarge'] === undefined) o[balanceBase + 'ActiveDischarge'] = defaults.activeDischarge;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Color', semicolonMode);
			if (v !== null) o[barBase + 'Color'] = String(v);
			else if (o[barBase + 'Color'] === undefined) o[barBase + 'Color'] = barColorDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Shown[ ]?Text', semicolonMode);
			if (v !== null) o[barBase + 'ShownText'] = String(v);
			else if (o[barBase + 'ShownText'] === undefined) o[barBase + 'ShownText'] = shownTextDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Shown[ ]?Picture', semicolonMode);
			if (v !== null) {
				o[barBase + 'ShownPicture'] = String(v);
				if (o[barBase + 'ShownPicture'].length > 0) ImageManager.loadPicture(o[barBase + 'ShownPicture']);
			} else if (o[barBase + 'ShownPicture'] === undefined) {
				o[barBase + 'ShownPicture'] = shownPictureDefault;
				if (o[barBase + 'ShownPicture'].length > 0) ImageManager.loadPicture(o[barBase + 'ShownPicture']);
			}

			v = J.getFirstValue(source, [featureName + '[ ]?Bar[ ]?Independent[ ]?Shown[ ]?Text', 'Independent[ ]?' + featureName + '[ ]?Bar[ ]?Shown[ ]?Text'], semicolonMode);
			if (v !== null) o[barBase + 'IndependentShownText'] = J.parseBool(v, false);
			else if (o[barBase + 'IndependentShownText'] === undefined) o[barBase + 'IndependentShownText'] = independentShownTextDefault;

			v = J.getFirstValue(source, [featureName + '[ ]?Bar[ ]?Independent[ ]?Shown[ ]?Picture', 'Independent[ ]?' + featureName + '[ ]?Bar[ ]?Shown[ ]?Picture'], semicolonMode);
			if (v !== null) o[barBase + 'IndependentShownPicture'] = J.parseBool(v, false);
			else if (o[barBase + 'IndependentShownPicture'] === undefined) o[barBase + 'IndependentShownPicture'] = independentShownPictureDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?X[ ]?Offset', semicolonMode);
			if (v !== null) o[barBase + 'XOffset'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'XOffset'] === undefined) o[barBase + 'XOffset'] = xOffsetDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Y[ ]?Offset', semicolonMode);
			if (v !== null) o[barBase + 'YOffset'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'YOffset'] === undefined) o[barBase + 'YOffset'] = yOffsetDefault;

			v = J.getFirstValue(source, [featureName + '[ ]?Bar[ ]?Angle', featureName + '[ ]?Bar[ ]?Angle[ ]?Offset'], semicolonMode);
			if (v !== null) o[barBase + 'Angle'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'Angle'] === undefined) o[barBase + 'Angle'] = angleDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Scale[ ]?X', semicolonMode);
			if (v !== null) o[barBase + 'ScaleX'] = J.toEvalNumber(v, 1);
			else if (o[barBase + 'ScaleX'] === undefined) o[barBase + 'ScaleX'] = scaleXDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Scale[ ]?Y', semicolonMode);
			if (v !== null) o[barBase + 'ScaleY'] = J.toEvalNumber(v, 1);
			else if (o[barBase + 'ScaleY'] === undefined) o[barBase + 'ScaleY'] = scaleYDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Text[ ]?X[ ]?Offset', semicolonMode);
			if (v !== null) o[barBase + 'TextXOffset'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'TextXOffset'] === undefined) o[barBase + 'TextXOffset'] = textXOffsetDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Text[ ]?Y[ ]?Offset', semicolonMode);
			if (v !== null) o[barBase + 'TextYOffset'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'TextYOffset'] === undefined) o[barBase + 'TextYOffset'] = textYOffsetDefault;

			v = J.getFirstValue(source, [featureName + '[ ]?Bar[ ]?Text[ ]?Angle', featureName + '[ ]?Bar[ ]?Text[ ]?Angle[ ]?Offset'], semicolonMode);
			if (v !== null) o[barBase + 'TextAngle'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'TextAngle'] === undefined) o[barBase + 'TextAngle'] = textAngleDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Text[ ]?Scale[ ]?X', semicolonMode);
			if (v !== null) o[barBase + 'TextScaleX'] = J.toEvalNumber(v, 1);
			else if (o[barBase + 'TextScaleX'] === undefined) o[barBase + 'TextScaleX'] = textScaleXDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Text[ ]?Scale[ ]?Y', semicolonMode);
			if (v !== null) o[barBase + 'TextScaleY'] = J.toEvalNumber(v, 1);
			else if (o[barBase + 'TextScaleY'] === undefined) o[barBase + 'TextScaleY'] = textScaleYDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Picture[ ]?X[ ]?Offset', semicolonMode);
			if (v !== null) o[barBase + 'PictureXOffset'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'PictureXOffset'] === undefined) o[barBase + 'PictureXOffset'] = pictureXOffsetDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Picture[ ]?Y[ ]?Offset', semicolonMode);
			if (v !== null) o[barBase + 'PictureYOffset'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'PictureYOffset'] === undefined) o[barBase + 'PictureYOffset'] = pictureYOffsetDefault;

			v = J.getFirstValue(source, [featureName + '[ ]?Bar[ ]?Picture[ ]?Angle', featureName + '[ ]?Bar[ ]?Picture[ ]?Angle[ ]?Offset'], semicolonMode);
			if (v !== null) o[barBase + 'PictureAngle'] = J.toEvalNumber(v, 0);
			else if (o[barBase + 'PictureAngle'] === undefined) o[barBase + 'PictureAngle'] = pictureAngleDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Picture[ ]?Scale[ ]?X', semicolonMode);
			if (v !== null) o[barBase + 'PictureScaleX'] = J.toEvalNumber(v, 1);
			else if (o[barBase + 'PictureScaleX'] === undefined) o[barBase + 'PictureScaleX'] = pictureScaleXDefault;

			v = J.getValue(source, featureName + '[ ]?Bar[ ]?Picture[ ]?Scale[ ]?Y', semicolonMode);
			if (v !== null) o[barBase + 'PictureScaleY'] = J.toEvalNumber(v, 1);
			else if (o[barBase + 'PictureScaleY'] === undefined) o[barBase + 'PictureScaleY'] = pictureScaleYDefault;
		};

		parseBalanceFeature('Stick', {
			key: dStickKey,
			value: dStickVal,
			limit: dStickLimit,
			passiveRecharge: dStickPass,
			activeDischarge: dStickAct,
			rechargeWhileHeld: dStickRechargeHeld,
			barColor: dStickBarDefaults.color,
			shownText: dStickBarDefaults.shownText,
			shownPicture: dStickBarDefaults.shownPicture,
			independentShownText: dStickBarDefaults.independentShownText,
			independentShownPicture: dStickBarDefaults.independentShownPicture,
			xOffset: dStickBarDefaults.xOffset,
			yOffset: dStickBarDefaults.yOffset,
			angle: dStickBarDefaults.angle,
			scaleX: dStickBarDefaults.scaleX,
			scaleY: dStickBarDefaults.scaleY,
			textXOffset: dStickBarDefaults.textXOffset,
			textYOffset: dStickBarDefaults.textYOffset,
			textAngle: dStickBarDefaults.textAngle,
			textScaleX: dStickBarDefaults.textScaleX,
			textScaleY: dStickBarDefaults.textScaleY,
			pictureXOffset: dStickBarDefaults.pictureXOffset,
			pictureYOffset: dStickBarDefaults.pictureYOffset,
			pictureAngle: dStickBarDefaults.pictureAngle,
			pictureScaleX: dStickBarDefaults.pictureScaleX,
			pictureScaleY: dStickBarDefaults.pictureScaleY
		});
		parseBalanceFeature('Nitro', {
			key: dNitroKey,
			value: dNitroVal,
			limit: dNitroLimit,
			passiveRecharge: dNitroPass,
			activeDischarge: dNitroAct,
			rechargeWhileHeld: dNitroRechargeHeld,
			barColor: dNitroBarDefaults.color,
			shownText: dNitroBarDefaults.shownText,
			shownPicture: dNitroBarDefaults.shownPicture,
			independentShownText: dNitroBarDefaults.independentShownText,
			independentShownPicture: dNitroBarDefaults.independentShownPicture,
			xOffset: dNitroBarDefaults.xOffset,
			yOffset: dNitroBarDefaults.yOffset,
			angle: dNitroBarDefaults.angle,
			scaleX: dNitroBarDefaults.scaleX,
			scaleY: dNitroBarDefaults.scaleY,
			textXOffset: dNitroBarDefaults.textXOffset,
			textYOffset: dNitroBarDefaults.textYOffset,
			textAngle: dNitroBarDefaults.textAngle,
			textScaleX: dNitroBarDefaults.textScaleX,
			textScaleY: dNitroBarDefaults.textScaleY,
			pictureXOffset: dNitroBarDefaults.pictureXOffset,
			pictureYOffset: dNitroBarDefaults.pictureYOffset,
			pictureAngle: dNitroBarDefaults.pictureAngle,
			pictureScaleX: dNitroBarDefaults.pictureScaleX,
			pictureScaleY: dNitroBarDefaults.pictureScaleY
		});
		parseBalanceFeature('Concentrate', {
			key: dConcentrateKey,
			value: dConcentrateVal,
			limit: dConcentrateLimit,
			passiveRecharge: dConcentratePass,
			activeDischarge: dConcentrateAct,
			rechargeWhileHeld: dConcentrateRechargeHeld,
			barColor: dConcentrateBarDefaults.color,
			shownText: dConcentrateBarDefaults.shownText,
			shownPicture: dConcentrateBarDefaults.shownPicture,
			independentShownText: dConcentrateBarDefaults.independentShownText,
			independentShownPicture: dConcentrateBarDefaults.independentShownPicture,
			xOffset: dConcentrateBarDefaults.xOffset,
			yOffset: dConcentrateBarDefaults.yOffset,
			angle: dConcentrateBarDefaults.angle,
			scaleX: dConcentrateBarDefaults.scaleX,
			scaleY: dConcentrateBarDefaults.scaleY,
			textXOffset: dConcentrateBarDefaults.textXOffset,
			textYOffset: dConcentrateBarDefaults.textYOffset,
			textAngle: dConcentrateBarDefaults.textAngle,
			textScaleX: dConcentrateBarDefaults.textScaleX,
			textScaleY: dConcentrateBarDefaults.textScaleY,
			pictureXOffset: dConcentrateBarDefaults.pictureXOffset,
			pictureYOffset: dConcentrateBarDefaults.pictureYOffset,
			pictureAngle: dConcentrateBarDefaults.pictureAngle,
			pictureScaleX: dConcentrateBarDefaults.pictureScaleX,
			pictureScaleY: dConcentrateBarDefaults.pictureScaleY
		});
		parseBalanceFeature('Freeze', {
			key: dFreezeKey,
			value: dFreezeVal,
			limit: dFreezeLimit,
			passiveRecharge: dFreezePass,
			activeDischarge: dFreezeAct,
			rechargeWhileHeld: dFreezeRechargeHeld,
			barColor: dFreezeBarDefaults.color,
			shownText: dFreezeBarDefaults.shownText,
			shownPicture: dFreezeBarDefaults.shownPicture,
			independentShownText: dFreezeBarDefaults.independentShownText,
			independentShownPicture: dFreezeBarDefaults.independentShownPicture,
			xOffset: dFreezeBarDefaults.xOffset,
			yOffset: dFreezeBarDefaults.yOffset,
			angle: dFreezeBarDefaults.angle,
			scaleX: dFreezeBarDefaults.scaleX,
			scaleY: dFreezeBarDefaults.scaleY,
			textXOffset: dFreezeBarDefaults.textXOffset,
			textYOffset: dFreezeBarDefaults.textYOffset,
			textAngle: dFreezeBarDefaults.textAngle,
			textScaleX: dFreezeBarDefaults.textScaleX,
			textScaleY: dFreezeBarDefaults.textScaleY,
			pictureXOffset: dFreezeBarDefaults.pictureXOffset,
			pictureYOffset: dFreezeBarDefaults.pictureYOffset,
			pictureAngle: dFreezeBarDefaults.pictureAngle,
			pictureScaleX: dFreezeBarDefaults.pictureScaleX,
			pictureScaleY: dFreezeBarDefaults.pictureScaleY
		});

		var parseBalanceExhaustion = function(featureName, defaultEnable, defaultLimit) {
			var balanceBase = 'jakeBalance' + featureName;
			var limitValue = Number(defaultLimit);
			if (!isFinite(limitValue) || limitValue < 0) limitValue = 0;

			v = J.getValue(source, featureName + '[ ]?Exhaust[ ]?Enable', semicolonMode);
			if (v !== null) o[balanceBase + 'ExhaustEnable'] = J.parseBool(v, false);
			else if (o[balanceBase + 'ExhaustEnable'] === undefined) o[balanceBase + 'ExhaustEnable'] = !!defaultEnable;

			v = J.getValue(source, featureName + '[ ]?Exhaust[ ]?Limit', semicolonMode);
			if (v !== null) {
				o[balanceBase + 'ExhaustLimit'] = Math.max(0, Number(J.toEvalNumber(v, limitValue)));
			} else if (o[balanceBase + 'ExhaustLimit'] === undefined) {
				o[balanceBase + 'ExhaustLimit'] = limitValue;
			}
		};

		parseBalanceExhaustion('Boost', dBoostExhaustEnable, dBoostExhaustLimit);
		parseBalanceExhaustion('Focus', dFocusExhaustEnable, dFocusExhaustLimit);
		parseBalanceExhaustion('Stick', dStickExhaustEnable, dStickExhaustLimit);
		parseBalanceExhaustion('Nitro', dNitroExhaustEnable, dNitroExhaustLimit);
		parseBalanceExhaustion('Concentrate', dConcentrateExhaustEnable, dConcentrateExhaustLimit);
		parseBalanceExhaustion('Freeze', dFreezeExhaustEnable, dFreezeExhaustLimit);

		v = J.getValue(source, 'Unstarting', semicolonMode);
		if (v !== null) o.jakeBalanceUnstarting = J.parseBool(v, true);
		else if (o.jakeBalanceUnstarting === undefined) o.jakeBalanceUnstarting = dUnstarting;

		v = J.getValue(source, 'Unending', semicolonMode);
		if (v !== null) o.jakeBalanceUnending = J.parseBool(v, true);
		else if (o.jakeBalanceUnending === undefined) o.jakeBalanceUnending = dUnending;

		v = J.getValue(source, 'Stability[ ]?Unwasting', semicolonMode);
		if (v !== null) o.jakeBalanceStabilityUnwasting = J.parseBool(v, false);
		else if (o.jakeBalanceStabilityUnwasting === undefined) o.jakeBalanceStabilityUnwasting = dUnwasting;

		v = J.getValue(source, 'Stability[ ]?Unfilling', semicolonMode);
		if (v !== null) o.jakeBalanceStabilityUnfilling = J.parseBool(v, false);
		else if (o.jakeBalanceStabilityUnfilling === undefined) o.jakeBalanceStabilityUnfilling = dUnfilling;

		v = J.getValue(source, 'Timeless', semicolonMode);
		if (v !== null) o.jakeBalanceTimeless = J.parseBool(v, true);
		else if (o.jakeBalanceTimeless === undefined) o.jakeBalanceTimeless = dTimeless;

		var fInfo = J.getValueInfo(source, 'Frames', semicolonMode, true);
		var sInfo = J.getValueInfo(source, 'Seconds', semicolonMode, true);
		if (fInfo || sInfo) {
			if (!sInfo || (fInfo && fInfo.index > sInfo.index)) {
				o.jakeBalanceFrames = Math.max(0, parseInt(fInfo.value) || 0);
				o.jakeBalanceSeconds = 0;
				o.jakeBalanceTimeMode = 'frames';
			} else {
				o.jakeBalanceSeconds = Math.max(0, parseInt(sInfo.value) || 0);
				o.jakeBalanceFrames = 0;
				o.jakeBalanceTimeMode = 'seconds';
			}
		} else if (!o.jakeBalanceTimeMode) {
			o.jakeBalanceFrames = Math.max(0, parseInt(o.jakeBalanceFrames || dFrames));
			o.jakeBalanceSeconds = Math.max(0, parseInt(o.jakeBalanceSeconds || dSeconds));
			o.jakeBalanceTimeMode = (o.jakeBalanceFrames > 0) ? 'frames' : 'seconds';
		}

		v = J.getValue(source, 'Stop[ ]?key', semicolonMode);
		if (v !== null) {
			var sk = parseInt(v);
			o.jakeBalanceStopKey = isNaN(sk) ? null : sk;
		} else if (o.jakeBalanceStopKey === undefined) o.jakeBalanceStopKey = (dStopRaw.length > 0 && !isNaN(parseInt(dStopRaw))) ? parseInt(dStopRaw) : null;

		v = J.getValue(source, 'Stop[ ]?key[ ]?Color', semicolonMode);
		if (v !== null) o.jakeBalanceStopColor = String(v);
		else if (o.jakeBalanceStopColor === undefined) o.jakeBalanceStopColor = dStopColor;

		v = J.getValue(source, 'Stop[ ]?key[ ]?Text', semicolonMode);
		if (v !== null) o.jakeBalanceStopText = String(v);
		else if (o.jakeBalanceStopText === undefined) o.jakeBalanceStopText = dStopText;

		v = J.getValue(source, 'Stop[ ]?key[ ]?Icon', semicolonMode);
		if (v !== null) {
			o.jakeBalanceStopIcon = String(v);
			if (o.jakeBalanceStopIcon.length > 0) ImageManager.loadPicture(o.jakeBalanceStopIcon);
		} else if (o.jakeBalanceStopIcon === undefined) o.jakeBalanceStopIcon = dStopIcon;

		v = J.getValue(source, 'Stop[ ]?Key[ ]?X[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeBalanceStopKeyXOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceStopKeyXOffset === undefined) o.jakeBalanceStopKeyXOffset = dStopKeyXOffset;

		v = J.getValue(source, 'Stop[ ]?Key[ ]?Y[ ]?Offset', semicolonMode);
		if (v !== null) o.jakeBalanceStopKeyYOffset = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceStopKeyYOffset === undefined) o.jakeBalanceStopKeyYOffset = dStopKeyYOffset;

		v = J.getFirstValue(source, ['Stop[ ]?Key[ ]?Angle', 'Stop[ ]?Key[ ]?Angle[ ]?Offset'], semicolonMode);
		if (v !== null) o.jakeBalanceStopKeyAngle = J.toEvalNumber(v, 0);
		else if (o.jakeBalanceStopKeyAngle === undefined) o.jakeBalanceStopKeyAngle = dStopKeyAngle;

		v = J.getValue(source, 'Stop[ ]?Key[ ]?Scale[ ]?X', semicolonMode);
		if (v !== null) o.jakeBalanceStopKeyScaleX = J.toEvalNumber(v, 1);
		else if (o.jakeBalanceStopKeyScaleX === undefined) o.jakeBalanceStopKeyScaleX = dStopKeyScaleX;

		v = J.getValue(source, 'Stop[ ]?Key[ ]?Scale[ ]?Y', semicolonMode);
		if (v !== null) o.jakeBalanceStopKeyScaleY = J.toEvalNumber(v, 1);
		else if (o.jakeBalanceStopKeyScaleY === undefined) o.jakeBalanceStopKeyScaleY = dStopKeyScaleY;

		v = J.getValue(source, 'Independent[ ]?Stop[ ]?Key[ ]?Icon', semicolonMode);
		if (v !== null) o.jakeBalanceIndependentStopKeyIcon = J.parseBool(v, false);
		else if (o.jakeBalanceIndependentStopKeyIcon === undefined) o.jakeBalanceIndependentStopKeyIcon = dIndependentStopKeyIcon;
	};

	var _jApplyExtendedProps_v23_balance = J.applyExtendedProps;
	J.applyExtendedProps = function(o, source, semicolonMode) {
		_jApplyExtendedProps_v23_balance.call(this, o, source, semicolonMode);
		J.applyBalanceProps(o, source, semicolonMode);
	};

	var _jCurrentFramesLeft_v23_balance = TimedAttackSystem.prototype._jakeCurrentFramesLeft;
	TimedAttackSystem.prototype._jakeCurrentFramesLeft = function() {
		if (J.isBalanceModuleEnabled() && this._item && this._item.type === 'balance') {
			if (this._jBalanceTimeless) return 0;
			return Math.max(0, Math.floor(this._jBalanceFramesLeft || 0));
		}
		return _jCurrentFramesLeft_v23_balance.call(this);
	};

	TimedAttackSystem.prototype._jakeSetupBalanceItem = function(item) {
		if (!J.isBalanceModuleEnabled()) return;
		if (!item || item.type !== 'balance') return;

		this._jBalanceShape = String(item.shape || 'rectangle').trim().toLowerCase();
		this._jBalanceWidth = Math.max(32, Math.floor(Number(item.jakeBalanceBarWidth || this.windowWidth() || 240)));
		this._jBalanceHeight = Math.max(4, Math.floor(Number(item.jakeBalanceBarThickness || 16)));
		this._jBalanceWindowOpacity = J.clamp(parseInt(item.opacity), 0, 255);
		if (isNaN(this._jBalanceWindowOpacity)) this._jBalanceWindowOpacity = 255;
		this._jBalanceBackgroundColor = String(item.jakeBalanceBackgroundColor || '#ffffff');
		this._jBalanceMainColor = String(item.color || '#ffffff');
		this._jBalanceCursorColor = String(item.jakeBalanceCursorColor || this._jBalanceMainColor || '#ffffff');
		this._jBalanceOutlineColor = String(item.outline || '#000000');
		this._jBalanceOutlineSize = Math.max(0, Math.floor(Number(item.size || 3)));
		this._jBalanceFlash = Math.max(1, parseInt(item.flash || 8));
		this._jBalanceTime = Math.max(1, parseInt(item.time || 40));
		this._jBalanceCursorImage = String(item.image || '');

		this._shape = this._jBalanceShape;
		this._image = this._jBalanceCursorImage;
		this._flash = this._jBalanceFlash;
		this._time = this._jBalanceTime;

		this._jBalanceCursorStart = Math.max(0, Number(item.jakeBalanceCursorStart || 0));
		this._jBalanceCursorX = J.clamp(this._jBalanceCursorStart, 0, this._jBalanceWidth);
		this._jBalanceCursorVisualXOffset = Number(item.jakeBalanceCursorVisualXOffset || 0);
		this._jBalanceCursorVisualYOffset = Number(item.jakeBalanceCursorVisualYOffset || 0);
		this._jBalanceCursorAngleOffset = Number(item.jakeBalanceCursorAngleOffset || 0);
		this._jBalanceCursorScaleX = Number((item.jakeBalanceCursorScaleX !== undefined) ? item.jakeBalanceCursorScaleX : 1);
		this._jBalanceCursorScaleY = Number((item.jakeBalanceCursorScaleY !== undefined) ? item.jakeBalanceCursorScaleY : 1);
		this._jBalanceIndependentCursor = !!item.jakeBalanceIndependentCursor;
		if (!isFinite(this._jBalanceCursorScaleX) || this._jBalanceCursorScaleX === 0) this._jBalanceCursorScaleX = 1;
		if (!isFinite(this._jBalanceCursorScaleY) || this._jBalanceCursorScaleY === 0) this._jBalanceCursorScaleY = 1;

		this._jBalanceRandomPools = item.jakeRandomMovementPools || {};
		this._jBalanceUnbalanceState = J.createMovementState(item.jakeBalanceUnbalanceSeq || [], this._jBalanceRandomPools);

		this._jBalanceAreas = J.deepClone(item.jakeBalanceAreas || J.defaultBalanceAreas());
		for (var i = 0; i < this._jBalanceAreas.length; i++) {
			var a = this._jBalanceAreas[i];
			if (!a) continue;
			if (!a.effects) {
				a.effects = J.makeBalanceAreaEffects(0);
				if (a.bfChanges) {
					a.effects.boostPassiveRecharge = Number(a.bfChanges.passiveBoostRecharge || 0);
					a.effects.focusPassiveRecharge = Number(a.bfChanges.passiveFocusRecharge || 0);
					a.effects.stickPassiveRecharge = Number(a.bfChanges.passiveStickRecharge || 0);
					a.effects.nitroPassiveRecharge = Number(a.bfChanges.passiveNitroRecharge || 0);
					a.effects.concentratePassiveRecharge = Number(a.bfChanges.passiveConcentrateRecharge || 0);
					a.effects.freezePassiveRecharge = Number(a.bfChanges.passiveFreezeRecharge || 0);
					a.effects.boostActiveDischarge = Number(a.bfChanges.activeBoostDischarge || 0);
					a.effects.focusActiveDischarge = Number(a.bfChanges.activeFocusDischarge || 0);
					a.effects.stickActiveDischarge = Number(a.bfChanges.activeStickDischarge || 0);
					a.effects.nitroActiveDischarge = Number(a.bfChanges.activeNitroDischarge || 0);
					a.effects.concentrateActiveDischarge = Number(a.bfChanges.activeConcentrateDischarge || 0);
					a.effects.freezeActiveDischarge = Number(a.bfChanges.activeFreezeDischarge || 0);
				}
			}
			if (!a.multEffects) a.multEffects = J.makeBalanceAreaEffects(1);
			a._jMoveOffsetX = 0;
			a._jMoveState = J.createMovementState(a.moveSequence || [], this._jBalanceRandomPools);
		}

		this._jBalanceMaxStability = Math.max(1, Number(item.jakeBalanceMaxStability || 100));
		this._jBalanceStability = J.clamp(Number(item.jakeBalanceInitialStability || 0), 0, this._jBalanceMaxStability);
		this._jBalancePassiveDecrease = Number(item.jakeBalancePassiveDecrease || 0);
		this._jStabilityBarColor = String(item.jakeStabilityBarColor || '#33ccff');
		this._jStabilityBarOutlineColor = String(item.jakeStabilityBarOutlineColor || '#000000');
		this._jStabilityBarOutlineSize = Math.max(0, Number(item.jakeStabilityBarOutlineSize || 2));
		this._jStabilityBarHeight = Math.max(2, Number(item.jakeStabilityBarHeight || 8));
		this._jStabilityBarShownText = String(item.jakeStabilityBarShownText || '$stab');
		this._jStabilityBarShownPicture = String(item.jakeStabilityBarShownPicture || '');
		this._jStabilityBarXOffset = Number(item.jakeStabilityBarXOffset || 0);
		this._jStabilityBarYOffset = Number(item.jakeStabilityBarYOffset || 0);
		this._jStabilityBarAngle = Number(item.jakeStabilityBarAngle || 0);
		this._jStabilityBarScaleX = Number((item.jakeStabilityBarScaleX !== undefined) ? item.jakeStabilityBarScaleX : 1);
		this._jStabilityBarScaleY = Number((item.jakeStabilityBarScaleY !== undefined) ? item.jakeStabilityBarScaleY : 1);
		this._jStabilityBarTextXOffset = Number(item.jakeStabilityBarTextXOffset || 0);
		this._jStabilityBarTextYOffset = Number(item.jakeStabilityBarTextYOffset || 0);
		this._jStabilityBarTextAngle = Number(item.jakeStabilityBarTextAngle || 0);
		this._jStabilityBarTextScaleX = Number((item.jakeStabilityBarTextScaleX !== undefined) ? item.jakeStabilityBarTextScaleX : 1);
		this._jStabilityBarTextScaleY = Number((item.jakeStabilityBarTextScaleY !== undefined) ? item.jakeStabilityBarTextScaleY : 1);
		this._jStabilityBarPictureXOffset = Number(item.jakeStabilityBarPictureXOffset || 0);
		this._jStabilityBarPictureYOffset = Number(item.jakeStabilityBarPictureYOffset || 0);
		this._jStabilityBarPictureAngle = Number(item.jakeStabilityBarPictureAngle || 0);
		this._jStabilityBarPictureScaleX = Number((item.jakeStabilityBarPictureScaleX !== undefined) ? item.jakeStabilityBarPictureScaleX : 1);
		this._jStabilityBarPictureScaleY = Number((item.jakeStabilityBarPictureScaleY !== undefined) ? item.jakeStabilityBarPictureScaleY : 1);
		if (!isFinite(this._jStabilityBarScaleX) || this._jStabilityBarScaleX === 0) this._jStabilityBarScaleX = 1;
		if (!isFinite(this._jStabilityBarScaleY) || this._jStabilityBarScaleY === 0) this._jStabilityBarScaleY = 1;
		if (!isFinite(this._jStabilityBarTextScaleX) || this._jStabilityBarTextScaleX === 0) this._jStabilityBarTextScaleX = 1;
		if (!isFinite(this._jStabilityBarTextScaleY) || this._jStabilityBarTextScaleY === 0) this._jStabilityBarTextScaleY = 1;
		if (!isFinite(this._jStabilityBarPictureScaleX) || this._jStabilityBarPictureScaleX === 0) this._jStabilityBarPictureScaleX = 1;
		if (!isFinite(this._jStabilityBarPictureScaleY) || this._jStabilityBarPictureScaleY === 0) this._jStabilityBarPictureScaleY = 1;

		this._jBalanceLeftKey = isNaN(parseInt(item.jakeBalanceLeftKey)) ? 37 : parseInt(item.jakeBalanceLeftKey);
		this._jBalanceRightKey = isNaN(parseInt(item.jakeBalanceRightKey)) ? 39 : parseInt(item.jakeBalanceRightKey);
		this._jBalanceLeftManeuver = Number(item.jakeBalanceLeftManeuver || 3);
		this._jBalanceRightManeuver = Number(item.jakeBalanceRightManeuver || 3);
		this._jBalanceManeuverType = J.normalizeBalanceManeuverType(item.jakeBalanceManeuverType, 'hold');
		this._jBalLeftWasPressed = false;
		this._jBalRightWasPressed = false;
		this._jBalanceDisableLeft = !!item.jakeBalanceDisableLeft;
		this._jBalanceDisableRight = !!item.jakeBalanceDisableRight;

		this._jBalLeftText = String(item.jakeBalanceLeftText || '');
		this._jBalLeftIcon = String(item.jakeBalanceLeftIcon || '');
		this._jBalLeftXOffset = Number(item.jakeBalanceLeftXOffset || 0);
		this._jBalLeftYOffset = Number(item.jakeBalanceLeftYOffset || 0);
		this._jBalLeftAngle = Number(item.jakeBalanceLeftAngle || 0);
		this._jBalLeftScaleX = Number((item.jakeBalanceLeftScaleX !== undefined) ? item.jakeBalanceLeftScaleX : 1);
		this._jBalLeftScaleY = Number((item.jakeBalanceLeftScaleY !== undefined) ? item.jakeBalanceLeftScaleY : 1);
		if (!isFinite(this._jBalLeftScaleX) || this._jBalLeftScaleX === 0) this._jBalLeftScaleX = 1;
		if (!isFinite(this._jBalLeftScaleY) || this._jBalLeftScaleY === 0) this._jBalLeftScaleY = 1;

		this._jBalRightText = String(item.jakeBalanceRightText || '');
		this._jBalRightIcon = String(item.jakeBalanceRightIcon || '');
		this._jBalRightXOffset = Number(item.jakeBalanceRightXOffset || 0);
		this._jBalRightYOffset = Number(item.jakeBalanceRightYOffset || 0);
		this._jBalRightAngle = Number(item.jakeBalanceRightAngle || 0);
		this._jBalRightScaleX = Number((item.jakeBalanceRightScaleX !== undefined) ? item.jakeBalanceRightScaleX : 1);
		this._jBalRightScaleY = Number((item.jakeBalanceRightScaleY !== undefined) ? item.jakeBalanceRightScaleY : 1);
		if (!isFinite(this._jBalRightScaleX) || this._jBalRightScaleX === 0) this._jBalRightScaleX = 1;
		if (!isFinite(this._jBalRightScaleY) || this._jBalRightScaleY === 0) this._jBalRightScaleY = 1;

		this._jBalanceBoostKey = (item.jakeBalanceBoostKey === null || item.jakeBalanceBoostKey === undefined || isNaN(parseInt(item.jakeBalanceBoostKey))) ? null : parseInt(item.jakeBalanceBoostKey);
		this._jBalanceFocusKey = (item.jakeBalanceFocusKey === null || item.jakeBalanceFocusKey === undefined || isNaN(parseInt(item.jakeBalanceFocusKey))) ? null : parseInt(item.jakeBalanceFocusKey);
		this._jBalanceBoostValue = Number(item.jakeBalanceBoostValue || 0);
		this._jBalanceFocusValue = Number(item.jakeBalanceFocusValue || 0);
		this._jBalanceBoostLimit = J.clampNegOne(item.jakeBalanceBoostLimit);
		this._jBalanceFocusLimit = J.clampNegOne(item.jakeBalanceFocusLimit);
		this._jBalanceBoostCurrent = (this._jBalanceBoostLimit >= 0) ? this._jBalanceBoostLimit : -1;
		this._jBalanceFocusCurrent = (this._jBalanceFocusLimit >= 0) ? this._jBalanceFocusLimit : -1;
		this._jBalanceBoostPassiveRecharge = Number(item.jakeBalanceBoostPassiveRecharge || 0);
		this._jBalanceFocusPassiveRecharge = Number(item.jakeBalanceFocusPassiveRecharge || 0);
		this._jBalanceBoostRechargeWhileHeld = !!item.jakeBalanceBoostRechargeWhileHeld;
		this._jBalanceFocusRechargeWhileHeld = !!item.jakeBalanceFocusRechargeWhileHeld;
		this._jBalanceBoostActiveDischarge = Number(item.jakeBalanceBoostActiveDischarge || 1);
		this._jBalanceFocusActiveDischarge = Number(item.jakeBalanceFocusActiveDischarge || 1);
		this._jBoostBarColor = String(item.jakeBoostBarColor || this._jStabilityBarColor);
		this._jFocusBarColor = String(item.jakeFocusBarColor || this._jStabilityBarColor);
		this._jBoostBarShownText = String(item.jakeBoostBarShownText || '$boost');
		this._jFocusBarShownText = String(item.jakeFocusBarShownText || '$focus');
		this._jBoostBarShownPicture = String(item.jakeBoostBarShownPicture || '');
		this._jFocusBarShownPicture = String(item.jakeFocusBarShownPicture || '');
		this._jBoostBarIndependentShownText = !!item.jakeBoostBarIndependentShownText;
		this._jBoostBarIndependentShownPicture = !!item.jakeBoostBarIndependentShownPicture;
		this._jFocusBarIndependentShownText = !!item.jakeFocusBarIndependentShownText;
		this._jFocusBarIndependentShownPicture = !!item.jakeFocusBarIndependentShownPicture;
		this._jBoostBarXOffset = Number(item.jakeBoostBarXOffset || 0);
		this._jBoostBarYOffset = Number(item.jakeBoostBarYOffset || 0);
		this._jBoostBarAngle = Number(item.jakeBoostBarAngle || 0);
		this._jBoostBarScaleX = Number((item.jakeBoostBarScaleX !== undefined) ? item.jakeBoostBarScaleX : 1);
		this._jBoostBarScaleY = Number((item.jakeBoostBarScaleY !== undefined) ? item.jakeBoostBarScaleY : 1);
		this._jBoostBarTextXOffset = Number(item.jakeBoostBarTextXOffset || 0);
		this._jBoostBarTextYOffset = Number(item.jakeBoostBarTextYOffset || 0);
		this._jBoostBarTextAngle = Number(item.jakeBoostBarTextAngle || 0);
		this._jBoostBarTextScaleX = Number((item.jakeBoostBarTextScaleX !== undefined) ? item.jakeBoostBarTextScaleX : 1);
		this._jBoostBarTextScaleY = Number((item.jakeBoostBarTextScaleY !== undefined) ? item.jakeBoostBarTextScaleY : 1);
		this._jBoostBarPictureXOffset = Number(item.jakeBoostBarPictureXOffset || 0);
		this._jBoostBarPictureYOffset = Number(item.jakeBoostBarPictureYOffset || 0);
		this._jBoostBarPictureAngle = Number(item.jakeBoostBarPictureAngle || 0);
		this._jBoostBarPictureScaleX = Number((item.jakeBoostBarPictureScaleX !== undefined) ? item.jakeBoostBarPictureScaleX : 1);
		this._jBoostBarPictureScaleY = Number((item.jakeBoostBarPictureScaleY !== undefined) ? item.jakeBoostBarPictureScaleY : 1);
		this._jFocusBarXOffset = Number(item.jakeFocusBarXOffset || 0);
		this._jFocusBarYOffset = Number(item.jakeFocusBarYOffset || 0);
		this._jFocusBarAngle = Number(item.jakeFocusBarAngle || 0);
		this._jFocusBarScaleX = Number((item.jakeFocusBarScaleX !== undefined) ? item.jakeFocusBarScaleX : 1);
		this._jFocusBarScaleY = Number((item.jakeFocusBarScaleY !== undefined) ? item.jakeFocusBarScaleY : 1);
		this._jFocusBarTextXOffset = Number(item.jakeFocusBarTextXOffset || 0);
		this._jFocusBarTextYOffset = Number(item.jakeFocusBarTextYOffset || 0);
		this._jFocusBarTextAngle = Number(item.jakeFocusBarTextAngle || 0);
		this._jFocusBarTextScaleX = Number((item.jakeFocusBarTextScaleX !== undefined) ? item.jakeFocusBarTextScaleX : 1);
		this._jFocusBarTextScaleY = Number((item.jakeFocusBarTextScaleY !== undefined) ? item.jakeFocusBarTextScaleY : 1);
		this._jFocusBarPictureXOffset = Number(item.jakeFocusBarPictureXOffset || 0);
		this._jFocusBarPictureYOffset = Number(item.jakeFocusBarPictureYOffset || 0);
		this._jFocusBarPictureAngle = Number(item.jakeFocusBarPictureAngle || 0);
		this._jFocusBarPictureScaleX = Number((item.jakeFocusBarPictureScaleX !== undefined) ? item.jakeFocusBarPictureScaleX : 1);
		this._jFocusBarPictureScaleY = Number((item.jakeFocusBarPictureScaleY !== undefined) ? item.jakeFocusBarPictureScaleY : 1);
		if (!isFinite(this._jBoostBarScaleX) || this._jBoostBarScaleX === 0) this._jBoostBarScaleX = 1;
		if (!isFinite(this._jBoostBarScaleY) || this._jBoostBarScaleY === 0) this._jBoostBarScaleY = 1;
		if (!isFinite(this._jBoostBarTextScaleX) || this._jBoostBarTextScaleX === 0) this._jBoostBarTextScaleX = 1;
		if (!isFinite(this._jBoostBarTextScaleY) || this._jBoostBarTextScaleY === 0) this._jBoostBarTextScaleY = 1;
		if (!isFinite(this._jBoostBarPictureScaleX) || this._jBoostBarPictureScaleX === 0) this._jBoostBarPictureScaleX = 1;
		if (!isFinite(this._jBoostBarPictureScaleY) || this._jBoostBarPictureScaleY === 0) this._jBoostBarPictureScaleY = 1;
		if (!isFinite(this._jFocusBarScaleX) || this._jFocusBarScaleX === 0) this._jFocusBarScaleX = 1;
		if (!isFinite(this._jFocusBarScaleY) || this._jFocusBarScaleY === 0) this._jFocusBarScaleY = 1;
		if (!isFinite(this._jFocusBarTextScaleX) || this._jFocusBarTextScaleX === 0) this._jFocusBarTextScaleX = 1;
		if (!isFinite(this._jFocusBarTextScaleY) || this._jFocusBarTextScaleY === 0) this._jFocusBarTextScaleY = 1;
		if (!isFinite(this._jFocusBarPictureScaleX) || this._jFocusBarPictureScaleX === 0) this._jFocusBarPictureScaleX = 1;
		if (!isFinite(this._jFocusBarPictureScaleY) || this._jFocusBarPictureScaleY === 0) this._jFocusBarPictureScaleY = 1;

		var featureDefaults = {
			Stick: {value: 1, shownText: '$stick'},
			Nitro: {value: 1.2, shownText: '$nitro'},
			Concentrate: {value: 1.2, shownText: '$concentrate'},
			Freeze: {value: 1.2, shownText: '$freeze'}
		};
		var featureList = ['Stick', 'Nitro', 'Concentrate', 'Freeze'];
		for (var fIdx = 0; fIdx < featureList.length; fIdx++) {
			var featureName = featureList[fIdx];
			var fd = featureDefaults[featureName];
			var balanceBase = 'jakeBalance' + featureName;
			var barBase = 'jake' + featureName + 'Bar';
			var tokenBase = 'jakeBalance' + featureName;

			var keyRaw = item[balanceBase + 'Key'];
			this['_jBalance' + featureName + 'Key'] = (keyRaw === null || keyRaw === undefined || isNaN(parseInt(keyRaw))) ? null : parseInt(keyRaw);

			var valueRaw = item[balanceBase + 'Value'];
			this['_jBalance' + featureName + 'Value'] = (valueRaw !== undefined && valueRaw !== null) ? Number(valueRaw) : Number(fd.value);
			if (!isFinite(this['_jBalance' + featureName + 'Value'])) this['_jBalance' + featureName + 'Value'] = Number(fd.value);

			this['_jBalance' + featureName + 'Limit'] = J.clampNegOne(item[balanceBase + 'Limit']);
			this['_jBalance' + featureName + 'Current'] = (this['_jBalance' + featureName + 'Limit'] >= 0) ? this['_jBalance' + featureName + 'Limit'] : -1;

			var passiveRaw = item[balanceBase + 'PassiveRecharge'];
			this['_jBalance' + featureName + 'PassiveRecharge'] = (passiveRaw !== undefined && passiveRaw !== null) ? Number(passiveRaw) : 0;
			if (!isFinite(this['_jBalance' + featureName + 'PassiveRecharge'])) this['_jBalance' + featureName + 'PassiveRecharge'] = 0;

			this['_jBalance' + featureName + 'RechargeWhileHeld'] = !!item[balanceBase + 'RechargeWhileHeld'];

			var activeRaw = item[balanceBase + 'ActiveDischarge'];
			this['_jBalance' + featureName + 'ActiveDischarge'] = (activeRaw !== undefined && activeRaw !== null) ? Number(activeRaw) : 1;
			if (!isFinite(this['_jBalance' + featureName + 'ActiveDischarge'])) this['_jBalance' + featureName + 'ActiveDischarge'] = 1;

			this['_j' + featureName + 'BarColor'] = String(item[barBase + 'Color'] || this._jStabilityBarColor);
			this['_j' + featureName + 'BarShownText'] = String(item[barBase + 'ShownText'] || fd.shownText);
			this['_j' + featureName + 'BarShownPicture'] = String(item[barBase + 'ShownPicture'] || '');
			this['_j' + featureName + 'BarIndependentShownText'] = !!item[barBase + 'IndependentShownText'];
			this['_j' + featureName + 'BarIndependentShownPicture'] = !!item[barBase + 'IndependentShownPicture'];
			this['_j' + featureName + 'BarXOffset'] = Number(item[barBase + 'XOffset'] || 0);
			this['_j' + featureName + 'BarYOffset'] = Number(item[barBase + 'YOffset'] || 0);
			this['_j' + featureName + 'BarAngle'] = Number(item[barBase + 'Angle'] || 0);
			this['_j' + featureName + 'BarScaleX'] = Number((item[barBase + 'ScaleX'] !== undefined) ? item[barBase + 'ScaleX'] : 1);
			this['_j' + featureName + 'BarScaleY'] = Number((item[barBase + 'ScaleY'] !== undefined) ? item[barBase + 'ScaleY'] : 1);
			this['_j' + featureName + 'BarTextXOffset'] = Number(item[barBase + 'TextXOffset'] || 0);
			this['_j' + featureName + 'BarTextYOffset'] = Number(item[barBase + 'TextYOffset'] || 0);
			this['_j' + featureName + 'BarTextAngle'] = Number(item[barBase + 'TextAngle'] || 0);
			this['_j' + featureName + 'BarTextScaleX'] = Number((item[barBase + 'TextScaleX'] !== undefined) ? item[barBase + 'TextScaleX'] : 1);
			this['_j' + featureName + 'BarTextScaleY'] = Number((item[barBase + 'TextScaleY'] !== undefined) ? item[barBase + 'TextScaleY'] : 1);
			this['_j' + featureName + 'BarPictureXOffset'] = Number(item[barBase + 'PictureXOffset'] || 0);
			this['_j' + featureName + 'BarPictureYOffset'] = Number(item[barBase + 'PictureYOffset'] || 0);
			this['_j' + featureName + 'BarPictureAngle'] = Number(item[barBase + 'PictureAngle'] || 0);
			this['_j' + featureName + 'BarPictureScaleX'] = Number((item[barBase + 'PictureScaleX'] !== undefined) ? item[barBase + 'PictureScaleX'] : 1);
			this['_j' + featureName + 'BarPictureScaleY'] = Number((item[barBase + 'PictureScaleY'] !== undefined) ? item[barBase + 'PictureScaleY'] : 1);

			if (!isFinite(this['_j' + featureName + 'BarScaleX']) || this['_j' + featureName + 'BarScaleX'] === 0) this['_j' + featureName + 'BarScaleX'] = 1;
			if (!isFinite(this['_j' + featureName + 'BarScaleY']) || this['_j' + featureName + 'BarScaleY'] === 0) this['_j' + featureName + 'BarScaleY'] = 1;
			if (!isFinite(this['_j' + featureName + 'BarTextScaleX']) || this['_j' + featureName + 'BarTextScaleX'] === 0) this['_j' + featureName + 'BarTextScaleX'] = 1;
			if (!isFinite(this['_j' + featureName + 'BarTextScaleY']) || this['_j' + featureName + 'BarTextScaleY'] === 0) this['_j' + featureName + 'BarTextScaleY'] = 1;
			if (!isFinite(this['_j' + featureName + 'BarPictureScaleX']) || this['_j' + featureName + 'BarPictureScaleX'] === 0) this['_j' + featureName + 'BarPictureScaleX'] = 1;
			if (!isFinite(this['_j' + featureName + 'BarPictureScaleY']) || this['_j' + featureName + 'BarPictureScaleY'] === 0) this['_j' + featureName + 'BarPictureScaleY'] = 1;

			this['_jBal' + featureName + 'Text'] = String(item[tokenBase + 'Text'] || '');
			this['_jBal' + featureName + 'Icon'] = String(item[tokenBase + 'Icon'] || '');
			this['_jBal' + featureName + 'XOffset'] = Number(item[tokenBase + 'XOffset'] || 0);
			this['_jBal' + featureName + 'YOffset'] = Number(item[tokenBase + 'YOffset'] || 0);
			this['_jBal' + featureName + 'Angle'] = Number(item[tokenBase + 'Angle'] || 0);
			this['_jBal' + featureName + 'ScaleX'] = Number((item[tokenBase + 'ScaleX'] !== undefined) ? item[tokenBase + 'ScaleX'] : 1);
			this['_jBal' + featureName + 'ScaleY'] = Number((item[tokenBase + 'ScaleY'] !== undefined) ? item[tokenBase + 'ScaleY'] : 1);
			if (!isFinite(this['_jBal' + featureName + 'ScaleX']) || this['_jBal' + featureName + 'ScaleX'] === 0) this['_jBal' + featureName + 'ScaleX'] = 1;
			if (!isFinite(this['_jBal' + featureName + 'ScaleY']) || this['_jBal' + featureName + 'ScaleY'] === 0) this['_jBal' + featureName + 'ScaleY'] = 1;
		}

		var exhaustFeatureList = ['Boost', 'Focus', 'Stick', 'Nitro', 'Concentrate', 'Freeze'];
		for (var exIdx = 0; exIdx < exhaustFeatureList.length; exIdx++) {
			var exFeature = exhaustFeatureList[exIdx];
			var exItemBase = 'jakeBalance' + exFeature;
			var exRunBase = '_jBalance' + exFeature;
			this[exRunBase + 'ExhaustEnable'] = !!item[exItemBase + 'ExhaustEnable'];

			var exLimit = Number(item[exItemBase + 'ExhaustLimit']);
			if (!isFinite(exLimit) || exLimit < 0) exLimit = 0;
			var resourceLimit = Number(this[exRunBase + 'Limit']);
			if (isFinite(resourceLimit) && resourceLimit >= 0) exLimit = J.clamp(exLimit, 0, resourceLimit);
			this[exRunBase + 'ExhaustLimit'] = exLimit;
			this[exRunBase + 'Exhausted'] = false;
		}

		this._jBalBoostText = String(item.jakeBalanceBoostText || '');
		this._jBalBoostIcon = String(item.jakeBalanceBoostIcon || '');
		this._jBalBoostXOffset = Number(item.jakeBalanceBoostXOffset || 0);
		this._jBalBoostYOffset = Number(item.jakeBalanceBoostYOffset || 0);
		this._jBalBoostAngle = Number(item.jakeBalanceBoostAngle || 0);
		this._jBalBoostScaleX = Number((item.jakeBalanceBoostScaleX !== undefined) ? item.jakeBalanceBoostScaleX : 1);
		this._jBalBoostScaleY = Number((item.jakeBalanceBoostScaleY !== undefined) ? item.jakeBalanceBoostScaleY : 1);
		if (!isFinite(this._jBalBoostScaleX) || this._jBalBoostScaleX === 0) this._jBalBoostScaleX = 1;
		if (!isFinite(this._jBalBoostScaleY) || this._jBalBoostScaleY === 0) this._jBalBoostScaleY = 1;

		this._jBalFocusText = String(item.jakeBalanceFocusText || '');
		this._jBalFocusIcon = String(item.jakeBalanceFocusIcon || '');
		this._jBalFocusXOffset = Number(item.jakeBalanceFocusXOffset || 0);
		this._jBalFocusYOffset = Number(item.jakeBalanceFocusYOffset || 0);
		this._jBalFocusAngle = Number(item.jakeBalanceFocusAngle || 0);
		this._jBalFocusScaleX = Number((item.jakeBalanceFocusScaleX !== undefined) ? item.jakeBalanceFocusScaleX : 1);
		this._jBalFocusScaleY = Number((item.jakeBalanceFocusScaleY !== undefined) ? item.jakeBalanceFocusScaleY : 1);
		if (!isFinite(this._jBalFocusScaleX) || this._jBalFocusScaleX === 0) this._jBalFocusScaleX = 1;
		if (!isFinite(this._jBalFocusScaleY) || this._jBalFocusScaleY === 0) this._jBalFocusScaleY = 1;

		this._jBalanceStopKey = (item.jakeBalanceStopKey === null || item.jakeBalanceStopKey === undefined || isNaN(parseInt(item.jakeBalanceStopKey))) ? null : parseInt(item.jakeBalanceStopKey);
		this._jBalanceStopColor = String(item.jakeBalanceStopColor || '#ff6666');
		this._jBalanceStopText = String(item.jakeBalanceStopText || '');
		this._jBalanceStopIcon = String(item.jakeBalanceStopIcon || '');
		this._stopKeyXOffset = Number(item.jakeBalanceStopKeyXOffset || 0);
		this._stopKeyYOffset = Number(item.jakeBalanceStopKeyYOffset || 0);
		this._stopKeyAngle = Number(item.jakeBalanceStopKeyAngle || 0);
		this._stopKeyScaleX = Number(item.jakeBalanceStopKeyScaleX || 1);
		this._stopKeyScaleY = Number(item.jakeBalanceStopKeyScaleY || 1);
		this._jIndependentStopKeyIcon = !!item.jakeBalanceIndependentStopKeyIcon;

		this._jBalanceUnstarting = (item.jakeBalanceUnstarting !== false);
		this._jBalanceUnending = (item.jakeBalanceUnending !== false);
		this._jBalanceStabilityUnwasting = !!item.jakeBalanceStabilityUnwasting;
		this._jBalanceStabilityUnfilling = !!item.jakeBalanceStabilityUnfilling;

		this._jBalanceTimeless = (item.jakeBalanceTimeless !== false);
		this._jBalanceTimeMode = String(item.jakeBalanceTimeMode || 'seconds').toLowerCase();
		if (this._jBalanceTimeMode === 'frames') this._jBalanceFramesLeft = Math.max(0, parseInt(item.jakeBalanceFrames || 0));
		else this._jBalanceFramesLeft = Math.max(0, parseInt(item.jakeBalanceSeconds || 0) * 60);
	};

	TimedAttackSystem.prototype._jakeInitBalanceStart = function() {
		this.opacity = 0;
		if (this.contents && this.contents.clear) this.contents.clear();
		if (this._window) {
			this._window.opacity = this._jBalanceWindowOpacity;
			this._window.openness = 255;
		}
		this._notPressed = true;
		this._flashTime = 0;
		this._jBalanceCursorX = J.clamp(this._jBalanceCursorStart, 0, this._jBalanceWidth);
		this._jBalLeftWasPressed = false;
		this._jBalRightWasPressed = false;
	};

	TimedAttackSystem.prototype._jakeResolveBalanceTokenDisplay = function(icon, text, keyCode) {
		if (icon && icon.length > 0) return {type:'icon', value:icon};
		if (text && text.length > 0) return {type:'text', value:text};
		return {type:'text', value:J.keyCodeToLabel(keyCode)};
	};

	TimedAttackSystem.prototype._jakeDrawBalanceGauge = function(bitmap, x, y, width, height, rate, color, outlineColor, outlineSize) {
		var out = Math.max(0, Math.floor(outlineSize || 0));
		bitmap.fillRect(x, y, width, height, outlineColor);
		var innerW = Math.max(1, width - (out * 2));
		var innerH = Math.max(1, height - (out * 2));
		bitmap.fillRect(x + out, y + out, innerW, innerH, this.gaugeBackColor ? this.gaugeBackColor() : 'rgba(0,0,0,0.4)');
		var fill = Math.max(0, Math.floor(innerW * J.clamp(rate, 0, 1)));
		if (fill > 0) bitmap.fillRect(x + out, y + out, fill, innerH, color);
	};

	TimedAttackSystem.prototype._jakeDrawBitmapTransformed = function(target, source, centerX, centerY, angleDeg, scaleX, scaleY) {
		if (!target || !source || !target._context) return;
		var sx = Number(scaleX);
		var sy = Number(scaleY);
		if (!isFinite(sx) || sx === 0) sx = 1;
		if (!isFinite(sy) || sy === 0) sy = 1;
		var src = source._canvas || source.canvas || source._image;
		if (!src) return;
		var angle = Number(angleDeg || 0) * (Math.PI / 180);
		var ctx = target._context;
		ctx.save();
		ctx.translate(centerX, centerY);
		ctx.rotate(angle);
		ctx.scale(sx, sy);
		ctx.drawImage(src, -source.width / 2, -source.height / 2);
		ctx.restore();
		target._setDirty();
	};

	TimedAttackSystem.prototype._jakeDrawBalanceGaugeVisual = function(bitmap, x, y, width, height, rate, color, outlineColor, outlineSize, angleDeg, scaleX, scaleY, paintOpacity) {
		var ang = Number(angleDeg || 0);
		var sx = Number((scaleX !== undefined) ? scaleX : 1);
		var sy = Number((scaleY !== undefined) ? scaleY : 1);
		var op = parseInt(paintOpacity);
		if (isNaN(op)) op = 255;
		op = J.clamp(op, 0, 255);
		if (!isFinite(sx) || sx === 0) sx = 1;
		if (!isFinite(sy) || sy === 0) sy = 1;
		if (Math.abs(ang) < 0.000001 && Math.abs(sx - 1) < 0.000001 && Math.abs(sy - 1) < 0.000001) {
			var oldOpacity = bitmap.paintOpacity;
			bitmap.paintOpacity = op;
			this._jakeDrawBalanceGauge(bitmap, x, y, width, height, rate, color, outlineColor, outlineSize);
			bitmap.paintOpacity = oldOpacity;
			return;
		}
		var temp = new Bitmap(Math.max(2, Math.floor(width) + 4), Math.max(2, Math.floor(height) + 4));
		temp.paintOpacity = op;
		this._jakeDrawBalanceGauge(temp, 2, 2, Math.floor(width), Math.floor(height), rate, color, outlineColor, outlineSize);
		this._jakeDrawBitmapTransformed(bitmap, temp, x + (width / 2), y + (height / 2), ang, sx, sy);
	};

	TimedAttackSystem.prototype._jakeDrawBalanceTextVisual = function(bitmap, text, x, y, width, height, align, angleDeg, scaleX, scaleY) {
		var content = String(text || '');
		if (!content.length) return;
		var ang = Number(angleDeg || 0);
		var sx = Number((scaleX !== undefined) ? scaleX : 1);
		var sy = Number((scaleY !== undefined) ? scaleY : 1);
		if (!isFinite(sx) || sx === 0) sx = 1;
		if (!isFinite(sy) || sy === 0) sy = 1;
		if (Math.abs(ang) < 0.000001 && Math.abs(sx - 1) < 0.000001 && Math.abs(sy - 1) < 0.000001) {
			bitmap.drawText(content, x, y, width, height, align || 'center');
			return;
		}
		var temp = new Bitmap(Math.max(2, Math.floor(width) + 4), Math.max(2, Math.floor(height) + 4));
		temp.drawText(content, 2, 2, Math.floor(width), Math.floor(height), align || 'center');
		this._jakeDrawBitmapTransformed(bitmap, temp, x + (width / 2), y + (height / 2), ang, sx, sy);
	};

	TimedAttackSystem.prototype._jakeDrawBalancePictureVisual = function(bitmap, pictureName, centerX, centerY, angleDeg, scaleX, scaleY) {
		var name = String(pictureName || '').trim();
		if (!name.length) return;
		var pic = ImageManager.loadPicture(name);
		if (!pic || pic.width <= 0 || pic.height <= 0) return;
		var ang = Number(angleDeg || 0);
		var sx = Number((scaleX !== undefined) ? scaleX : 1);
		var sy = Number((scaleY !== undefined) ? scaleY : 1);
		if (!isFinite(sx) || sx === 0) sx = 1;
		if (!isFinite(sy) || sy === 0) sy = 1;
		if (Math.abs(ang) < 0.000001 && Math.abs(sx - 1) < 0.000001 && Math.abs(sy - 1) < 0.000001) {
			bitmap.blt(pic, 0, 0, pic.width, pic.height, centerX - (pic.width / 2), centerY - (pic.height / 2));
			return;
		}
		var temp = new Bitmap(Math.max(2, pic.width + 2), Math.max(2, pic.height + 2));
		temp.blt(pic, 0, 0, pic.width, pic.height, 1, 1);
		this._jakeDrawBitmapTransformed(bitmap, temp, centerX, centerY, ang, sx, sy);
	};

	TimedAttackSystem.prototype._jakeApplyBalanceExhaustTextTokens = function(text) {
		var t = String(text || '');
		if (!t.length) return t;
		t = t.replace(/\$exh_boo/gi, this._jBalanceBoostExhausted ? 'true' : 'false');
		t = t.replace(/\$exh_foc/gi, this._jBalanceFocusExhausted ? 'true' : 'false');
		t = t.replace(/\$exh_sti/gi, this._jBalanceStickExhausted ? 'true' : 'false');
		t = t.replace(/\$exh_nit/gi, this._jBalanceNitroExhausted ? 'true' : 'false');
		t = t.replace(/\$exh_con/gi, this._jBalanceConcentrateExhausted ? 'true' : 'false');
		t = t.replace(/\$exh_fre/gi, this._jBalanceFreezeExhausted ? 'true' : 'false');
		return t;
	};

	TimedAttackSystem.prototype._jakeFinishBalance = function() {
		if (!this._notPressed) return;
		this._notPressed = false;
		this._flashTime = 0;
		var max = Math.max(1, this._jBalanceMaxStability || 1);
		var power = J.clamp((this._jBalanceStability || 0) / max, 0, 1);
		this.setPower(power);
		if (this._jBalanceTimeless) J.setTasTimeLeftFromFrames(0);
		else J.setTasTimeLeftFromFrames(this._jBalanceFramesLeft || 0);
	};

	TimedAttackSystem.prototype.playBalanceGame = function() {
		if (!J.isBalanceModuleEnabled()) return;
		if (!this._item || this._item.type !== 'balance') return;

		if (this._notPressed) {
			for (var a = 0; a < this._jBalanceAreas.length; a++) {
				var area = this._jBalanceAreas[a];
				if (!area || !area._jMoveState) continue;
				J.stepMovementState(area._jMoveState, area, '_jMoveOffsetX');
				area._jMoveOffsetX = J.clampHitzoneOffsetToBar(area, this._jBalanceWidth, area._jMoveOffsetX);
			}

			var force = 0;
			if (this._jBalanceUnbalanceState) {
				if (this._jBalanceUnbalanceState.framesLeft <= 0) {
					var tok = J.pickMovementToken(this._jBalanceUnbalanceState.sequence, this._jBalanceUnbalanceState.pools, this._jBalanceUnbalanceState.indexRef, 0);
					if (tok) {
						this._jBalanceUnbalanceState.currentReset = (tok.forceSpec && tok.forceSpec.type === 'reset');
						this._jBalanceUnbalanceState.currentForce = this._jBalanceUnbalanceState.currentReset ? 0 : J.resolveMovementValue(tok.forceSpec, false);
						this._jBalanceUnbalanceState.framesLeft = J.resolveMovementValue(tok.timeSpec, true);
						if (this._jBalanceUnbalanceState.currentReset) this._jBalanceCursorX = this._jBalanceCursorStart;
					}
				}
				if (this._jBalanceUnbalanceState.framesLeft > 0) {
					if (!this._jBalanceUnbalanceState.currentReset) force = this._jBalanceUnbalanceState.currentForce;
					this._jBalanceUnbalanceState.framesLeft--;
				}
			}

			var hoverBoostPassive = 0;
			var hoverFocusPassive = 0;
			var hoverStickPassive = 0;
			var hoverNitroPassive = 0;
			var hoverConcentratePassive = 0;
			var hoverFreezePassive = 0;
			var hoverBoostActive = 0;
			var hoverFocusActive = 0;
			var hoverStickActive = 0;
			var hoverNitroActive = 0;
			var hoverConcentrateActive = 0;
			var hoverFreezeActive = 0;
			var hoverBoostValue = 0;
			var hoverFocusValue = 0;
			var hoverStickValue = 0;
			var hoverNitroValue = 0;
			var hoverConcentrateValue = 0;
			var hoverFreezeValue = 0;
			var hoverUnbalance = 0;
			var hoverUnbalanceLeft = 0;
			var hoverUnbalanceRight = 0;
			var hoverManeuver = 0;
			var hoverManeuverLeft = 0;
			var hoverManeuverRight = 0;
			var hoverBalanceLoss = 0;

			var hoverBoostPassiveMult = 1;
			var hoverFocusPassiveMult = 1;
			var hoverStickPassiveMult = 1;
			var hoverNitroPassiveMult = 1;
			var hoverConcentratePassiveMult = 1;
			var hoverFreezePassiveMult = 1;
			var hoverBoostActiveMult = 1;
			var hoverFocusActiveMult = 1;
			var hoverStickActiveMult = 1;
			var hoverNitroActiveMult = 1;
			var hoverConcentrateActiveMult = 1;
			var hoverFreezeActiveMult = 1;
			var hoverBoostValueMult = 1;
			var hoverFocusValueMult = 1;
			var hoverStickValueMult = 1;
			var hoverNitroValueMult = 1;
			var hoverConcentrateValueMult = 1;
			var hoverFreezeValueMult = 1;
			var hoverUnbalanceMult = 1;
			var hoverUnbalanceLeftMult = 1;
			var hoverUnbalanceRightMult = 1;
			var hoverManeuverMult = 1;
			var hoverManeuverLeftMult = 1;
			var hoverManeuverRightMult = 1;
			var hoverBalanceLossMult = 1;
			var gain = 0;

			for (var i = 0; i < this._jBalanceAreas.length; i++) {
				var z = this._jBalanceAreas[i];
				if (!z || !z.initialized) continue;
				var p = J.evaluateHitzonePower(z, this._jBalanceCursorX, this._jBalanceWidth);
				if (p <= 0) continue;
				gain += Number(z.balanceValue || 0) * p;
				if (z.effects) {
					hoverUnbalance += Number(z.effects.unbalanceMovement || 0) * p;
					hoverUnbalanceLeft += Number(z.effects.unbalanceMovementLeft || 0) * p;
					hoverUnbalanceRight += Number(z.effects.unbalanceMovementRight || 0) * p;
					hoverManeuver += Number(z.effects.maneuver || 0) * p;
					hoverManeuverLeft += Number(z.effects.maneuverLeft || 0) * p;
					hoverManeuverRight += Number(z.effects.maneuverRight || 0) * p;
					hoverBalanceLoss += Number(z.effects.balanceLoss || 0) * p;

					hoverBoostValue += Number(z.effects.boostValue || 0) * p;
					hoverFocusValue += Number(z.effects.focusValue || 0) * p;
					hoverStickValue += Number(z.effects.stickValue || 0) * p;
					hoverNitroValue += Number(z.effects.nitroValue || 0) * p;
					hoverConcentrateValue += Number(z.effects.concentrateValue || 0) * p;
					hoverFreezeValue += Number(z.effects.freezeValue || 0) * p;

					hoverBoostPassive += Number(z.effects.boostPassiveRecharge || 0) * p;
					hoverFocusPassive += Number(z.effects.focusPassiveRecharge || 0) * p;
					hoverStickPassive += Number(z.effects.stickPassiveRecharge || 0) * p;
					hoverNitroPassive += Number(z.effects.nitroPassiveRecharge || 0) * p;
					hoverConcentratePassive += Number(z.effects.concentratePassiveRecharge || 0) * p;
					hoverFreezePassive += Number(z.effects.freezePassiveRecharge || 0) * p;
					hoverBoostActive += Number(z.effects.boostActiveDischarge || 0) * p;
					hoverFocusActive += Number(z.effects.focusActiveDischarge || 0) * p;
					hoverStickActive += Number(z.effects.stickActiveDischarge || 0) * p;
					hoverNitroActive += Number(z.effects.nitroActiveDischarge || 0) * p;
					hoverConcentrateActive += Number(z.effects.concentrateActiveDischarge || 0) * p;
					hoverFreezeActive += Number(z.effects.freezeActiveDischarge || 0) * p;
				}
				if (z.multEffects) {
					hoverUnbalanceMult *= J.weightedBalanceEffectMultiplier(z.multEffects.unbalanceMovement, p);
					hoverUnbalanceLeftMult *= J.weightedBalanceEffectMultiplier(z.multEffects.unbalanceMovementLeft, p);
					hoverUnbalanceRightMult *= J.weightedBalanceEffectMultiplier(z.multEffects.unbalanceMovementRight, p);
					hoverManeuverMult *= J.weightedBalanceEffectMultiplier(z.multEffects.maneuver, p);
					hoverManeuverLeftMult *= J.weightedBalanceEffectMultiplier(z.multEffects.maneuverLeft, p);
					hoverManeuverRightMult *= J.weightedBalanceEffectMultiplier(z.multEffects.maneuverRight, p);
					hoverBalanceLossMult *= J.weightedBalanceEffectMultiplier(z.multEffects.balanceLoss, p);

					hoverBoostValueMult *= J.weightedBalanceEffectMultiplier(z.multEffects.boostValue, p);
					hoverFocusValueMult *= J.weightedBalanceEffectMultiplier(z.multEffects.focusValue, p);
					hoverStickValueMult *= J.weightedBalanceEffectMultiplier(z.multEffects.stickValue, p);
					hoverNitroValueMult *= J.weightedBalanceEffectMultiplier(z.multEffects.nitroValue, p);
					hoverConcentrateValueMult *= J.weightedBalanceEffectMultiplier(z.multEffects.concentrateValue, p);
					hoverFreezeValueMult *= J.weightedBalanceEffectMultiplier(z.multEffects.freezeValue, p);

					hoverBoostPassiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.boostPassiveRecharge, p);
					hoverFocusPassiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.focusPassiveRecharge, p);
					hoverStickPassiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.stickPassiveRecharge, p);
					hoverNitroPassiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.nitroPassiveRecharge, p);
					hoverConcentratePassiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.concentratePassiveRecharge, p);
					hoverFreezePassiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.freezePassiveRecharge, p);
					hoverBoostActiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.boostActiveDischarge, p);
					hoverFocusActiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.focusActiveDischarge, p);
					hoverStickActiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.stickActiveDischarge, p);
					hoverNitroActiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.nitroActiveDischarge, p);
					hoverConcentrateActiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.concentrateActiveDischarge, p);
					hoverFreezeActiveMult *= J.weightedBalanceEffectMultiplier(z.multEffects.freezeActiveDischarge, p);
				}
			}

			if (force < 0) {
				force -= (hoverUnbalance + hoverUnbalanceLeft);
				force *= (hoverUnbalanceMult * hoverUnbalanceLeftMult);
			} else if (force > 0) {
				force += (hoverUnbalance + hoverUnbalanceRight);
				force *= (hoverUnbalanceMult * hoverUnbalanceRightMult);
			}

			var boostValue = (this._jBalanceBoostValue + hoverBoostValue) * hoverBoostValueMult;
			var focusValue = (this._jBalanceFocusValue + hoverFocusValue) * hoverFocusValueMult;
			var stickValue = (this._jBalanceStickValue + hoverStickValue) * hoverStickValueMult;
			var nitroValue = (this._jBalanceNitroValue + hoverNitroValue) * hoverNitroValueMult;
			var concentrateValue = (this._jBalanceConcentrateValue + hoverConcentrateValue) * hoverConcentrateValueMult;
			var freezeValue = (this._jBalanceFreezeValue + hoverFreezeValue) * hoverFreezeValueMult;

			var boostPassiveRate = (this._jBalanceBoostPassiveRecharge + hoverBoostPassive) * hoverBoostPassiveMult;
			var focusPassiveRate = (this._jBalanceFocusPassiveRecharge + hoverFocusPassive) * hoverFocusPassiveMult;
			var stickPassiveRate = (this._jBalanceStickPassiveRecharge + hoverStickPassive) * hoverStickPassiveMult;
			var nitroPassiveRate = (this._jBalanceNitroPassiveRecharge + hoverNitroPassive) * hoverNitroPassiveMult;
			var concentratePassiveRate = (this._jBalanceConcentratePassiveRecharge + hoverConcentratePassive) * hoverConcentratePassiveMult;
			var freezePassiveRate = (this._jBalanceFreezePassiveRecharge + hoverFreezePassive) * hoverFreezePassiveMult;

			var boostActiveRate = (this._jBalanceBoostActiveDischarge + hoverBoostActive) * hoverBoostActiveMult;
			var focusActiveRate = (this._jBalanceFocusActiveDischarge + hoverFocusActive) * hoverFocusActiveMult;
			var stickActiveRate = (this._jBalanceStickActiveDischarge + hoverStickActive) * hoverStickActiveMult;
			var nitroActiveRate = (this._jBalanceNitroActiveDischarge + hoverNitroActive) * hoverNitroActiveMult;
			var concentrateActiveRate = (this._jBalanceConcentrateActiveDischarge + hoverConcentrateActive) * hoverConcentrateActiveMult;
			var freezeActiveRate = (this._jBalanceFreezeActiveDischarge + hoverFreezeActive) * hoverFreezeActiveMult;

			var leftHeld = !this._jBalanceDisableLeft && J.isKeyCodePressed(this._jBalanceLeftKey);
			var rightHeld = !this._jBalanceDisableRight && J.isKeyCodePressed(this._jBalanceRightKey);
			var maneuverType = J.normalizeBalanceManeuverType(this._jBalanceManeuverType, 'hold');
			var isMashManeuverType = (maneuverType === 'mash');
			var leftTap = leftHeld && !this._jBalLeftWasPressed;
			var rightTap = rightHeld && !this._jBalRightWasPressed;
			this._jBalLeftWasPressed = leftHeld;
			this._jBalRightWasPressed = rightHeld;
			var leftManeuverActive = isMashManeuverType ? leftTap : leftHeld;
			var rightManeuverActive = isMashManeuverType ? rightTap : rightHeld;

			var boostHeldRaw = (this._jBalanceBoostKey !== null) && J.isKeyCodePressed(this._jBalanceBoostKey);
			var focusHeldRaw = (this._jBalanceFocusKey !== null) && J.isKeyCodePressed(this._jBalanceFocusKey);
			var stickHeldRaw = (this._jBalanceStickKey !== null) && J.isKeyCodePressed(this._jBalanceStickKey);
			var nitroHeldRaw = (this._jBalanceNitroKey !== null) && J.isKeyCodePressed(this._jBalanceNitroKey);
			var concentrateHeldRaw = (this._jBalanceConcentrateKey !== null) && J.isKeyCodePressed(this._jBalanceConcentrateKey);
			var freezeHeldRaw = (this._jBalanceFreezeKey !== null) && J.isKeyCodePressed(this._jBalanceFreezeKey);

			var boostHeld = boostHeldRaw && !this._jBalanceBoostExhausted;
			var focusHeld = focusHeldRaw && !this._jBalanceFocusExhausted;
			var stickHeld = stickHeldRaw && !this._jBalanceStickExhausted;
			var nitroHeld = nitroHeldRaw && !this._jBalanceNitroExhausted;
			var concentrateHeld = concentrateHeldRaw && !this._jBalanceConcentrateExhausted;
			var freezeHeld = freezeHeldRaw && !this._jBalanceFreezeExhausted;

			if (this._jBalanceBoostLimit >= 0) {
				if (this._jBalanceBoostRechargeWhileHeld || !boostHeld) {
					this._jBalanceBoostCurrent += boostPassiveRate;
				}
				if (boostHeld) this._jBalanceBoostCurrent -= boostActiveRate;
				this._jBalanceBoostCurrent = J.clamp(this._jBalanceBoostCurrent, 0, this._jBalanceBoostLimit);
			}

			if (this._jBalanceFocusLimit >= 0) {
				if (this._jBalanceFocusRechargeWhileHeld || !focusHeld) {
					this._jBalanceFocusCurrent += focusPassiveRate;
				}
				if (focusHeld) this._jBalanceFocusCurrent -= focusActiveRate;
				this._jBalanceFocusCurrent = J.clamp(this._jBalanceFocusCurrent, 0, this._jBalanceFocusLimit);
			}

			if (this._jBalanceStickLimit >= 0) {
				if (this._jBalanceStickRechargeWhileHeld || !stickHeld) {
					this._jBalanceStickCurrent += stickPassiveRate;
				}
				if (stickHeld) this._jBalanceStickCurrent -= stickActiveRate;
				this._jBalanceStickCurrent = J.clamp(this._jBalanceStickCurrent, 0, this._jBalanceStickLimit);
			}

			if (this._jBalanceNitroLimit >= 0) {
				if (this._jBalanceNitroRechargeWhileHeld || !nitroHeld) {
					this._jBalanceNitroCurrent += nitroPassiveRate;
				}
				if (nitroHeld) this._jBalanceNitroCurrent -= nitroActiveRate;
				this._jBalanceNitroCurrent = J.clamp(this._jBalanceNitroCurrent, 0, this._jBalanceNitroLimit);
			}

			if (this._jBalanceConcentrateLimit >= 0) {
				if (this._jBalanceConcentrateRechargeWhileHeld || !concentrateHeld) {
					this._jBalanceConcentrateCurrent += concentratePassiveRate;
				}
				if (concentrateHeld) this._jBalanceConcentrateCurrent -= concentrateActiveRate;
				this._jBalanceConcentrateCurrent = J.clamp(this._jBalanceConcentrateCurrent, 0, this._jBalanceConcentrateLimit);
			}

			if (this._jBalanceFreezeLimit >= 0) {
				if (this._jBalanceFreezeRechargeWhileHeld || !freezeHeld) {
					this._jBalanceFreezeCurrent += freezePassiveRate;
				}
				if (freezeHeld) this._jBalanceFreezeCurrent -= freezeActiveRate;
				this._jBalanceFreezeCurrent = J.clamp(this._jBalanceFreezeCurrent, 0, this._jBalanceFreezeLimit);
			}

			var updateFeatureExhaustion = function(featureName) {
				var base = '_jBalance' + featureName;
				var limit = Number(this[base + 'Limit']);
				if (!isFinite(limit) || limit < 0) {
					this[base + 'Exhausted'] = false;
					return;
				}

				if (!this[base + 'ExhaustEnable']) {
					this[base + 'Exhausted'] = false;
					return;
				}

				var current = Number(this[base + 'Current']);
				if (!isFinite(current)) current = 0;
				var recoverAt = Number(this[base + 'ExhaustLimit']);
				if (!isFinite(recoverAt) || recoverAt < 0) recoverAt = 0;
				recoverAt = J.clamp(recoverAt, 0, limit);

				if (!this[base + 'Exhausted'] && current <= 0) this[base + 'Exhausted'] = true;
				if (this[base + 'Exhausted'] && current >= recoverAt) this[base + 'Exhausted'] = false;
			};

			updateFeatureExhaustion.call(this, 'Boost');
			updateFeatureExhaustion.call(this, 'Focus');
			updateFeatureExhaustion.call(this, 'Stick');
			updateFeatureExhaustion.call(this, 'Nitro');
			updateFeatureExhaustion.call(this, 'Concentrate');
			updateFeatureExhaustion.call(this, 'Freeze');

			var boostActive = boostHeld && this._jBalanceBoostKey !== null && this._jBalanceBoostLimit !== 0 && (this._jBalanceBoostLimit < 0 || this._jBalanceBoostCurrent > 0);
			var focusActive = focusHeld && this._jBalanceFocusKey !== null && this._jBalanceFocusLimit !== 0 && (this._jBalanceFocusLimit < 0 || this._jBalanceFocusCurrent > 0);
			var stickActive = stickHeld && this._jBalanceStickKey !== null && this._jBalanceStickLimit !== 0 && (this._jBalanceStickLimit < 0 || this._jBalanceStickCurrent > 0);
			var nitroActive = nitroHeld && this._jBalanceNitroKey !== null && this._jBalanceNitroLimit !== 0 && (this._jBalanceNitroLimit < 0 || this._jBalanceNitroCurrent > 0);
			var concentrateActive = concentrateHeld && this._jBalanceConcentrateKey !== null && this._jBalanceConcentrateLimit !== 0 && (this._jBalanceConcentrateLimit < 0 || this._jBalanceConcentrateCurrent > 0);
			var freezeActive = freezeHeld && this._jBalanceFreezeKey !== null && this._jBalanceFreezeLimit !== 0 && (this._jBalanceFreezeLimit < 0 || this._jBalanceFreezeCurrent > 0);

			var inputMove = 0;
			if (leftManeuverActive) {
				var leftValue = this._jBalanceLeftManeuver + hoverManeuver + hoverManeuverLeft;
				leftValue *= (hoverManeuverMult * hoverManeuverLeftMult);
				if (boostActive) leftValue += boostValue;
				if (focusActive) leftValue -= focusValue;
				inputMove -= leftValue;
			}
			if (rightManeuverActive) {
				var rightValue = this._jBalanceRightManeuver + hoverManeuver + hoverManeuverRight;
				rightValue *= (hoverManeuverMult * hoverManeuverRightMult);
				if (boostActive) rightValue += boostValue;
				if (focusActive) rightValue -= focusValue;
				inputMove += rightValue;
			}

			if (nitroActive) {
				var nitroFactor = Number(nitroValue || 1);
				if (!isFinite(nitroFactor) || nitroFactor === 0) nitroFactor = 1;
				inputMove *= nitroFactor;
			}

			if (stickActive) {
				var stickFactor = Number(stickValue || 0);
				if (!isFinite(stickFactor)) stickFactor = 0;
				inputMove += (this._jBalanceCursorStart - this._jBalanceCursorX) * (stickFactor / 100);
			}

			if (freezeActive) {
				var freezeFactor = Number(freezeValue || 1);
				if (!isFinite(freezeFactor) || freezeFactor <= 0) freezeFactor = 1;
				var freezeDamp = 1 / freezeFactor;
				force *= freezeDamp;
				inputMove *= freezeDamp;
			}

			this._jBalanceCursorX += force + inputMove;
			this._jBalanceCursorX = J.clamp(this._jBalanceCursorX, 0, this._jBalanceWidth);

			var passiveDecrease = (this._jBalancePassiveDecrease + hoverBalanceLoss) * hoverBalanceLossMult;
			if (concentrateActive) {
				var concentrateFactor = Number(concentrateValue || 1);
				if (!isFinite(concentrateFactor) || concentrateFactor <= 0) concentrateFactor = 1;
				gain *= concentrateFactor;
				passiveDecrease /= concentrateFactor;
			}

			this._jBalanceStability += gain;
			this._jBalanceStability -= passiveDecrease;
			this._jBalanceStability = J.clamp(this._jBalanceStability, 0, this._jBalanceMaxStability);

			if (this._jBalanceStopKey !== null && J.consumeKeyCode(this._jBalanceStopKey)) this._jakeFinishBalance();
			if (!this._jBalanceUnstarting && this._jBalanceCursorX <= 0) this._jakeFinishBalance();
			if (!this._jBalanceUnending && this._jBalanceCursorX >= this._jBalanceWidth) this._jakeFinishBalance();
			if (!this._jBalanceStabilityUnwasting && this._jBalanceStability <= 0) this._jakeFinishBalance();
			if (!this._jBalanceStabilityUnfilling && this._jBalanceStability >= this._jBalanceMaxStability) this._jakeFinishBalance();

			if (!this._jBalanceTimeless) {
				this._jBalanceFramesLeft = Math.max(0, this._jBalanceFramesLeft - 1);
				if (this._jBalanceFramesLeft <= 0) this._jakeFinishBalance();
			}
		} else {
			this._flashTime++;
		}

		this._x = (Graphics.width / 2);
		this._y = (Graphics.height / 2);
		this._x += this._visualXOffset;
		this._y += this._visualYOffset;
		if (!isSideview) {
			this._x += globalNonSideXOffset;
			this._y += globalNonSideYOffset;
		}

		var barW = this._jBalanceWidth;
		var barH = this._jBalanceHeight;
		var barX = Math.floor(this._x - (barW / 2));
		var barY = Math.floor(this._y);

		this._content.bitmap.clear();
		var balanceFeatureBitmap = this._jakePrepareBalanceFeatureLayer();
		this._jakeEnsureKeysLayer();
		this._jakeEnsureStopKeyLayer();
		this._jakeKeysLayer.bitmap.clear();
		this._jakeStopKeyLayer.bitmap.clear();
		this._jakeKeysBounds = null;

		var usedBalanceFeatureLayer = false;
		var self = this;
		var drawContentWithMainOpacity = function(drawFn) {
			var drawBitmap = self._content.bitmap;
			var oldPaintOpacity = drawBitmap.paintOpacity;
			if (oldPaintOpacity !== undefined) {
				var capped = J.toOpacity(oldPaintOpacity, 255);
				drawBitmap.paintOpacity = Math.min(capped, J.toOpacity(balanceMainOpacity, capped));
			}
			drawFn(drawBitmap);
			if (oldPaintOpacity !== undefined) drawBitmap.paintOpacity = oldPaintOpacity;
		};
		var drawBalanceFeatureText = function(text, x, y, width, height, angleDeg, scaleX, scaleY, independent) {
			var drawBitmap = self._content.bitmap;
			if (independent && balanceFeatureBitmap) {
				drawBitmap = balanceFeatureBitmap;
				usedBalanceFeatureLayer = true;
			}
			if (drawBitmap === self._content.bitmap) {
				drawContentWithMainOpacity(function(targetBitmap) {
					self._jakeDrawBalanceTextVisual(targetBitmap, text, x, y, width, height, 'center', angleDeg, scaleX, scaleY);
				});
			} else {
				self._jakeDrawBalanceTextVisual(drawBitmap, text, x, y, width, height, 'center', angleDeg, scaleX, scaleY);
			}
		};
		var drawBalanceFeaturePicture = function(pictureName, centerX, centerY, angleDeg, scaleX, scaleY, independent) {
			var drawBitmap = self._content.bitmap;
			if (independent && balanceFeatureBitmap) {
				drawBitmap = balanceFeatureBitmap;
				usedBalanceFeatureLayer = true;
			}
			if (drawBitmap === self._content.bitmap) {
				drawContentWithMainOpacity(function(targetBitmap) {
					self._jakeDrawBalancePictureVisual(targetBitmap, pictureName, centerX, centerY, angleDeg, scaleX, scaleY);
				});
			} else {
				self._jakeDrawBalancePictureVisual(drawBitmap, pictureName, centerX, centerY, angleDeg, scaleX, scaleY);
			}
		};
		var resolveBalanceOpacity = function(names, fallback) {
			if (self._jakeResolveElementOpacity) return self._jakeResolveElementOpacity(names, fallback);
			return J.toOpacity(fallback, 255);
		};
		var balanceMainOpacity = resolveBalanceOpacity(null);
		var balanceMainBarOpacity = resolveBalanceOpacity('Main Bar', balanceMainOpacity);
		var exhaustedFeatureOpacity = function() {
			return Math.min(balanceMainOpacity, 127);
		};

		var oldContentPaintOpacity = this._content.bitmap.paintOpacity;
		if (oldContentPaintOpacity !== undefined) {
			var cappedContentOpacity = J.toOpacity(oldContentPaintOpacity, 255);
			this._content.bitmap.paintOpacity = Math.min(cappedContentOpacity, J.toOpacity(balanceMainBarOpacity, cappedContentOpacity));
		}

		if (this._jBalanceShape === 'oval') this._jakeDrawCapsule(this._content.bitmap, barX, barY, barW, barH, this._jBalanceBackgroundColor);
		else this._content.bitmap.fillRect(barX, barY, barW, barH, this._jBalanceBackgroundColor);

		for (var aIdx = 0; aIdx < this._jBalanceAreas.length; aIdx++) {
			var area = this._jBalanceAreas[aIdx];
			if (!area || !area.initialized) continue;
			var m = J.getHitzoneMetrics(area, barW);

			var closeStart = Math.floor(barX + (m.center - m.hitLeft - m.closeLeft));
			var closeEnd = Math.floor(barX + (m.center + m.hitRight + m.closeRight));
			var closeWidth = Math.max(0, closeEnd - closeStart);
			if (closeWidth > 0) {
				if (this._jBalanceShape === 'oval') this._jakeDrawCapsule(this._content.bitmap, closeStart, barY, closeWidth, barH, area.closeColor);
				else this._content.bitmap.fillRect(closeStart, barY, closeWidth, barH, area.closeColor);
			}

			var hitStart = Math.floor(barX + (m.center - m.hitLeft));
			var hitEnd = Math.floor(barX + (m.center + m.hitRight));
			var hitWidth = Math.max(0, hitEnd - hitStart);
			if (hitWidth > 0) {
				if (this._jBalanceShape === 'oval') this._jakeDrawCapsule(this._content.bitmap, hitStart, barY, hitWidth, barH, area.hitColor);
				else this._content.bitmap.fillRect(hitStart, barY, hitWidth, barH, area.hitColor);
			}
		}
		if (oldContentPaintOpacity !== undefined) this._content.bitmap.paintOpacity = oldContentPaintOpacity;

		var useIndependentBalanceCursor = !!this._jBalanceIndependentCursor;
		var balanceCursorBitmap = null;
		if (useIndependentBalanceCursor) {
			balanceCursorBitmap = this._jakePrepareCursorLayer();
		} else if (this._jakeCursorLayer) {
			this._jakeCursorLayer.visible = false;
			if (this._jakeCursorLayer.bitmap) this._jakeCursorLayer.bitmap.clear();
		}

		var oldShape = this._shape;
		var oldImage = this._image;
		this._shape = this._jBalanceShape;
		this._image = this._jBalanceCursorImage;
		this._item.color = this._jBalanceCursorColor;
		this._item.outline = this._jBalanceOutlineColor;
		this._item.size = this._jBalanceOutlineSize;
		this._item.width = Math.max(2, this._item.width || 12);
		var oldCursorVisualX = this._cursorVisualXOffset;
		var oldCursorVisualY = this._cursorVisualYOffset;
		var oldCursorAngle = this._cursorAngleOffset;
		var oldCursorScaleX = this._cursorScaleX;
		var oldCursorScaleY = this._cursorScaleY;
		var oldCursorColor = this._cursorColor;
		this._cursorVisualXOffset = this._jBalanceCursorVisualXOffset;
		this._cursorVisualYOffset = this._jBalanceCursorVisualYOffset;
		this._cursorAngleOffset = this._jBalanceCursorAngleOffset;
		this._cursorScaleX = this._jBalanceCursorScaleX;
		this._cursorScaleY = this._jBalanceCursorScaleY;
		this._cursorColor = this._jBalanceCursorColor;
		this._jakeDrawDefaultCustomCursor(barX + this._jBalanceCursorX, barY, barH, 1, useIndependentBalanceCursor ? balanceCursorBitmap : null);
		this._cursorVisualXOffset = oldCursorVisualX;
		this._cursorVisualYOffset = oldCursorVisualY;
		this._cursorAngleOffset = oldCursorAngle;
		this._cursorScaleX = oldCursorScaleX;
		this._cursorScaleY = oldCursorScaleY;
		this._cursorColor = oldCursorColor;
		this._shape = oldShape;
		this._image = oldImage;

		var stabY = barY + barH + 10;
		var stabGaugeX = barX + this._jStabilityBarXOffset;
		var stabGaugeY = stabY + this._jStabilityBarYOffset;
		this._jakeDrawBalanceGaugeVisual(this._content.bitmap, stabGaugeX, stabGaugeY, barW, this._jStabilityBarHeight, this._jBalanceStability / Math.max(1, this._jBalanceMaxStability), this._jStabilityBarColor, this._jStabilityBarOutlineColor, this._jStabilityBarOutlineSize, this._jStabilityBarAngle, this._jStabilityBarScaleX, this._jStabilityBarScaleY, resolveBalanceOpacity('Stability Bar', balanceMainOpacity));

		var stabText = String(this._jStabilityBarShownText || '');
		if (stabText.length > 0) {
			stabText = stabText.replace(/\$stab/gi, String(Math.floor(this._jBalanceStability || 0)));
			stabText = stabText.replace(/\$boost/gi, String(Math.floor(this._jBalanceBoostCurrent >= 0 ? this._jBalanceBoostCurrent : 0)));
			stabText = stabText.replace(/\$focus/gi, String(Math.floor(this._jBalanceFocusCurrent >= 0 ? this._jBalanceFocusCurrent : 0)));
			stabText = stabText.replace(/\$stick/gi, String(Math.floor(this._jBalanceStickCurrent >= 0 ? this._jBalanceStickCurrent : 0)));
			stabText = stabText.replace(/\$nitro/gi, String(Math.floor(this._jBalanceNitroCurrent >= 0 ? this._jBalanceNitroCurrent : 0)));
			stabText = stabText.replace(/\$concentrate/gi, String(Math.floor(this._jBalanceConcentrateCurrent >= 0 ? this._jBalanceConcentrateCurrent : 0)));
			stabText = stabText.replace(/\$freeze/gi, String(Math.floor(this._jBalanceFreezeCurrent >= 0 ? this._jBalanceFreezeCurrent : 0)));
			stabText = this._jakeApplyBalanceExhaustTextTokens(stabText);
			drawContentWithMainOpacity(function(targetBitmap) {
				self._jakeDrawBalanceTextVisual(targetBitmap, stabText, barX + self._jStabilityBarTextXOffset, stabY - self.lineHeight() + self._jStabilityBarTextYOffset, barW, self.lineHeight(), 'center', self._jStabilityBarTextAngle, self._jStabilityBarTextScaleX, self._jStabilityBarTextScaleY);
			});
		}

		if (this._jStabilityBarShownPicture && this._jStabilityBarShownPicture.length > 0) {
			drawContentWithMainOpacity(function(targetBitmap) {
				self._jakeDrawBalancePictureVisual(targetBitmap, self._jStabilityBarShownPicture, barX + Math.floor(barW / 2) + self._jStabilityBarPictureXOffset, stabY + Math.floor(self._jStabilityBarHeight / 2) + self._jStabilityBarPictureYOffset, self._jStabilityBarPictureAngle, self._jStabilityBarPictureScaleX, self._jStabilityBarPictureScaleY);
			});
		}

		var keySize = Math.max(20, Math.floor(barH + 8));
		var keyY = barY + Math.floor(barH / 2);
		var leftX = barX - keySize - 8 + this._jBalLeftXOffset;
		var rightX = barX + barW + keySize + 8 + this._jBalRightXOffset;

		var leftDisplay = this._jakeResolveBalanceTokenDisplay(this._jBalLeftIcon, this._jBalLeftText, this._jBalanceLeftKey);
		var rightDisplay = this._jakeResolveBalanceTokenDisplay(this._jBalRightIcon, this._jBalRightText, this._jBalanceRightKey);
		this._jakeDrawMashToken(this._jakeKeysLayer.bitmap, leftX, keyY + this._jBalLeftYOffset, keySize, leftDisplay, this._jBalanceDisableLeft, 'rgba(30,30,30,0.35)', '#222222', this._jBalLeftAngle, this._jBalLeftScaleX, this._jBalLeftScaleY);
		this._jakeDrawMashToken(this._jakeKeysLayer.bitmap, rightX, keyY + this._jBalRightYOffset, keySize, rightDisplay, this._jBalanceDisableRight, 'rgba(30,30,30,0.35)', '#222222', this._jBalRightAngle, this._jBalRightScaleX, this._jBalRightScaleY);

		var topY = barY - keySize - 8;
		if (this._jBalanceBoostKey !== null) {
			var boostKeyX = this._x + this._jBalBoostXOffset;
			var boostKeyY = topY + this._jBalBoostYOffset;
			var boostDisp = this._jakeResolveBalanceTokenDisplay(this._jBalBoostIcon, this._jBalBoostText, this._jBalanceBoostKey);
			this._jakeDrawMashToken(this._jakeKeysLayer.bitmap, boostKeyX, boostKeyY, keySize, boostDisp, false, 'rgba(30,30,30,0.35)', '#222222', this._jBalBoostAngle, this._jBalBoostScaleX, this._jBalBoostScaleY);
			if (this._jBalanceBoostLimit >= 0) {
				var boostGaugeW = Math.floor(barW / 3);
				var boostRate = this._jBalanceBoostCurrent / Math.max(1, this._jBalanceBoostLimit);
				var boostGaugeX = Math.floor(boostKeyX + Math.floor(keySize / 2) + 8);
				var boostGaugeY = Math.floor(boostKeyY - Math.floor(this._jStabilityBarHeight / 2));
				var boostOpacity = resolveBalanceOpacity(['Boost Bar', 'Feature Bar', 'Bar'], this._jBalanceBoostExhausted ? exhaustedFeatureOpacity() : balanceMainOpacity);
				this._jakeDrawBalanceGaugeVisual(this._content.bitmap, boostGaugeX + this._jBoostBarXOffset, boostGaugeY + this._jBoostBarYOffset, boostGaugeW, this._jStabilityBarHeight, boostRate, this._jBoostBarColor, this._jStabilityBarOutlineColor, this._jStabilityBarOutlineSize, this._jBoostBarAngle, this._jBoostBarScaleX, this._jBoostBarScaleY, boostOpacity);
				var boostBarText = String(this._jBoostBarShownText || '');
				if (boostBarText.length > 0) {
					boostBarText = boostBarText.replace(/\$boost/gi, String(Math.floor(this._jBalanceBoostCurrent >= 0 ? this._jBalanceBoostCurrent : 0)));
					boostBarText = boostBarText.replace(/\$focus/gi, String(Math.floor(this._jBalanceFocusCurrent >= 0 ? this._jBalanceFocusCurrent : 0)));
					boostBarText = boostBarText.replace(/\$stab/gi, String(Math.floor(this._jBalanceStability || 0)));
					boostBarText = boostBarText.replace(/\$stick/gi, String(Math.floor(this._jBalanceStickCurrent >= 0 ? this._jBalanceStickCurrent : 0)));
					boostBarText = boostBarText.replace(/\$nitro/gi, String(Math.floor(this._jBalanceNitroCurrent >= 0 ? this._jBalanceNitroCurrent : 0)));
					boostBarText = boostBarText.replace(/\$concentrate/gi, String(Math.floor(this._jBalanceConcentrateCurrent >= 0 ? this._jBalanceConcentrateCurrent : 0)));
					boostBarText = boostBarText.replace(/\$freeze/gi, String(Math.floor(this._jBalanceFreezeCurrent >= 0 ? this._jBalanceFreezeCurrent : 0)));
					boostBarText = this._jakeApplyBalanceExhaustTextTokens(boostBarText);
					drawBalanceFeatureText(boostBarText, boostGaugeX + this._jBoostBarTextXOffset, boostGaugeY - this.lineHeight() + this._jBoostBarTextYOffset, boostGaugeW, this.lineHeight(), this._jBoostBarTextAngle, this._jBoostBarTextScaleX, this._jBoostBarTextScaleY, this._jBoostBarIndependentShownText);
				}
				if (this._jBoostBarShownPicture && this._jBoostBarShownPicture.length > 0) {
					drawBalanceFeaturePicture(this._jBoostBarShownPicture, boostGaugeX + Math.floor(boostGaugeW / 2) + this._jBoostBarPictureXOffset, boostGaugeY + Math.floor(this._jStabilityBarHeight / 2) + this._jBoostBarPictureYOffset, this._jBoostBarPictureAngle, this._jBoostBarPictureScaleX, this._jBoostBarPictureScaleY, this._jBoostBarIndependentShownPicture);
				}
			}
			topY -= (keySize + 8);
		}

		if (this._jBalanceFocusKey !== null) {
			var focusKeyX = this._x + this._jBalFocusXOffset;
			var focusKeyY = topY + this._jBalFocusYOffset;
			var focusDisp = this._jakeResolveBalanceTokenDisplay(this._jBalFocusIcon, this._jBalFocusText, this._jBalanceFocusKey);
			this._jakeDrawMashToken(this._jakeKeysLayer.bitmap, focusKeyX, focusKeyY, keySize, focusDisp, false, 'rgba(30,30,30,0.35)', '#222222', this._jBalFocusAngle, this._jBalFocusScaleX, this._jBalFocusScaleY);
			if (this._jBalanceFocusLimit >= 0) {
				var focusGaugeW = Math.floor(barW / 3);
				var focusRate = this._jBalanceFocusCurrent / Math.max(1, this._jBalanceFocusLimit);
				var focusGaugeX = Math.floor(focusKeyX + Math.floor(keySize / 2) + 8);
				var focusGaugeY = Math.floor(focusKeyY - Math.floor(this._jStabilityBarHeight / 2));
				var focusOpacity = resolveBalanceOpacity(['Focus Bar', 'Feature Bar', 'Bar'], this._jBalanceFocusExhausted ? exhaustedFeatureOpacity() : balanceMainOpacity);
				this._jakeDrawBalanceGaugeVisual(this._content.bitmap, focusGaugeX + this._jFocusBarXOffset, focusGaugeY + this._jFocusBarYOffset, focusGaugeW, this._jStabilityBarHeight, focusRate, this._jFocusBarColor, this._jStabilityBarOutlineColor, this._jStabilityBarOutlineSize, this._jFocusBarAngle, this._jFocusBarScaleX, this._jFocusBarScaleY, focusOpacity);
				var focusBarText = String(this._jFocusBarShownText || '');
				if (focusBarText.length > 0) {
					focusBarText = focusBarText.replace(/\$focus/gi, String(Math.floor(this._jBalanceFocusCurrent >= 0 ? this._jBalanceFocusCurrent : 0)));
					focusBarText = focusBarText.replace(/\$boost/gi, String(Math.floor(this._jBalanceBoostCurrent >= 0 ? this._jBalanceBoostCurrent : 0)));
					focusBarText = focusBarText.replace(/\$stab/gi, String(Math.floor(this._jBalanceStability || 0)));
					focusBarText = focusBarText.replace(/\$stick/gi, String(Math.floor(this._jBalanceStickCurrent >= 0 ? this._jBalanceStickCurrent : 0)));
					focusBarText = focusBarText.replace(/\$nitro/gi, String(Math.floor(this._jBalanceNitroCurrent >= 0 ? this._jBalanceNitroCurrent : 0)));
					focusBarText = focusBarText.replace(/\$concentrate/gi, String(Math.floor(this._jBalanceConcentrateCurrent >= 0 ? this._jBalanceConcentrateCurrent : 0)));
					focusBarText = focusBarText.replace(/\$freeze/gi, String(Math.floor(this._jBalanceFreezeCurrent >= 0 ? this._jBalanceFreezeCurrent : 0)));
					focusBarText = this._jakeApplyBalanceExhaustTextTokens(focusBarText);
					drawBalanceFeatureText(focusBarText, focusGaugeX + this._jFocusBarTextXOffset, focusGaugeY - this.lineHeight() + this._jFocusBarTextYOffset, focusGaugeW, this.lineHeight(), this._jFocusBarTextAngle, this._jFocusBarTextScaleX, this._jFocusBarTextScaleY, this._jFocusBarIndependentShownText);
				}
				if (this._jFocusBarShownPicture && this._jFocusBarShownPicture.length > 0) {
					drawBalanceFeaturePicture(this._jFocusBarShownPicture, focusGaugeX + Math.floor(focusGaugeW / 2) + this._jFocusBarPictureXOffset, focusGaugeY + Math.floor(this._jStabilityBarHeight / 2) + this._jFocusBarPictureYOffset, this._jFocusBarPictureAngle, this._jFocusBarPictureScaleX, this._jFocusBarPictureScaleY, this._jFocusBarIndependentShownPicture);
				}
			}
			topY -= (keySize + 8);
		}

		if (this._jBalanceStickKey !== null) {
			var stickKeyX = this._x + this._jBalStickXOffset;
			var stickKeyY = topY + this._jBalStickYOffset;
			var stickDisp = this._jakeResolveBalanceTokenDisplay(this._jBalStickIcon, this._jBalStickText, this._jBalanceStickKey);
			this._jakeDrawMashToken(this._jakeKeysLayer.bitmap, stickKeyX, stickKeyY, keySize, stickDisp, false, 'rgba(30,30,30,0.35)', '#222222', this._jBalStickAngle, this._jBalStickScaleX, this._jBalStickScaleY);
			if (this._jBalanceStickLimit >= 0) {
				var stickGaugeW = Math.floor(barW / 3);
				var stickRate = this._jBalanceStickCurrent / Math.max(1, this._jBalanceStickLimit);
				var stickGaugeX = Math.floor(stickKeyX + Math.floor(keySize / 2) + 8);
				var stickGaugeY = Math.floor(stickKeyY - Math.floor(this._jStabilityBarHeight / 2));
				var stickOpacity = resolveBalanceOpacity(['Stick Bar', 'Feature Bar', 'Bar'], this._jBalanceStickExhausted ? exhaustedFeatureOpacity() : balanceMainOpacity);
				this._jakeDrawBalanceGaugeVisual(this._content.bitmap, stickGaugeX + this._jStickBarXOffset, stickGaugeY + this._jStickBarYOffset, stickGaugeW, this._jStabilityBarHeight, stickRate, this._jStickBarColor, this._jStabilityBarOutlineColor, this._jStabilityBarOutlineSize, this._jStickBarAngle, this._jStickBarScaleX, this._jStickBarScaleY, stickOpacity);
				var stickBarText = String(this._jStickBarShownText || '');
				if (stickBarText.length > 0) {
					stickBarText = stickBarText.replace(/\$stick/gi, String(Math.floor(this._jBalanceStickCurrent >= 0 ? this._jBalanceStickCurrent : 0)));
					stickBarText = stickBarText.replace(/\$boost/gi, String(Math.floor(this._jBalanceBoostCurrent >= 0 ? this._jBalanceBoostCurrent : 0)));
					stickBarText = stickBarText.replace(/\$focus/gi, String(Math.floor(this._jBalanceFocusCurrent >= 0 ? this._jBalanceFocusCurrent : 0)));
					stickBarText = stickBarText.replace(/\$nitro/gi, String(Math.floor(this._jBalanceNitroCurrent >= 0 ? this._jBalanceNitroCurrent : 0)));
					stickBarText = stickBarText.replace(/\$concentrate/gi, String(Math.floor(this._jBalanceConcentrateCurrent >= 0 ? this._jBalanceConcentrateCurrent : 0)));
					stickBarText = stickBarText.replace(/\$freeze/gi, String(Math.floor(this._jBalanceFreezeCurrent >= 0 ? this._jBalanceFreezeCurrent : 0)));
					stickBarText = stickBarText.replace(/\$stab/gi, String(Math.floor(this._jBalanceStability || 0)));
					stickBarText = this._jakeApplyBalanceExhaustTextTokens(stickBarText);
					drawBalanceFeatureText(stickBarText, stickGaugeX + this._jStickBarTextXOffset, stickGaugeY - this.lineHeight() + this._jStickBarTextYOffset, stickGaugeW, this.lineHeight(), this._jStickBarTextAngle, this._jStickBarTextScaleX, this._jStickBarTextScaleY, this._jStickBarIndependentShownText);
				}
				if (this._jStickBarShownPicture && this._jStickBarShownPicture.length > 0) {
					drawBalanceFeaturePicture(this._jStickBarShownPicture, stickGaugeX + Math.floor(stickGaugeW / 2) + this._jStickBarPictureXOffset, stickGaugeY + Math.floor(this._jStabilityBarHeight / 2) + this._jStickBarPictureYOffset, this._jStickBarPictureAngle, this._jStickBarPictureScaleX, this._jStickBarPictureScaleY, this._jStickBarIndependentShownPicture);
				}
			}
			topY -= (keySize + 8);
		}

		if (this._jBalanceNitroKey !== null) {
			var nitroKeyX = this._x + this._jBalNitroXOffset;
			var nitroKeyY = topY + this._jBalNitroYOffset;
			var nitroDisp = this._jakeResolveBalanceTokenDisplay(this._jBalNitroIcon, this._jBalNitroText, this._jBalanceNitroKey);
			this._jakeDrawMashToken(this._jakeKeysLayer.bitmap, nitroKeyX, nitroKeyY, keySize, nitroDisp, false, 'rgba(30,30,30,0.35)', '#222222', this._jBalNitroAngle, this._jBalNitroScaleX, this._jBalNitroScaleY);
			if (this._jBalanceNitroLimit >= 0) {
				var nitroGaugeW = Math.floor(barW / 3);
				var nitroRate = this._jBalanceNitroCurrent / Math.max(1, this._jBalanceNitroLimit);
				var nitroGaugeX = Math.floor(nitroKeyX + Math.floor(keySize / 2) + 8);
				var nitroGaugeY = Math.floor(nitroKeyY - Math.floor(this._jStabilityBarHeight / 2));
				var nitroOpacity = resolveBalanceOpacity(['Nitro Bar', 'Feature Bar', 'Bar'], this._jBalanceNitroExhausted ? exhaustedFeatureOpacity() : balanceMainOpacity);
				this._jakeDrawBalanceGaugeVisual(this._content.bitmap, nitroGaugeX + this._jNitroBarXOffset, nitroGaugeY + this._jNitroBarYOffset, nitroGaugeW, this._jStabilityBarHeight, nitroRate, this._jNitroBarColor, this._jStabilityBarOutlineColor, this._jStabilityBarOutlineSize, this._jNitroBarAngle, this._jNitroBarScaleX, this._jNitroBarScaleY, nitroOpacity);
				var nitroBarText = String(this._jNitroBarShownText || '');
				if (nitroBarText.length > 0) {
					nitroBarText = nitroBarText.replace(/\$nitro/gi, String(Math.floor(this._jBalanceNitroCurrent >= 0 ? this._jBalanceNitroCurrent : 0)));
					nitroBarText = nitroBarText.replace(/\$boost/gi, String(Math.floor(this._jBalanceBoostCurrent >= 0 ? this._jBalanceBoostCurrent : 0)));
					nitroBarText = nitroBarText.replace(/\$focus/gi, String(Math.floor(this._jBalanceFocusCurrent >= 0 ? this._jBalanceFocusCurrent : 0)));
					nitroBarText = nitroBarText.replace(/\$stick/gi, String(Math.floor(this._jBalanceStickCurrent >= 0 ? this._jBalanceStickCurrent : 0)));
					nitroBarText = nitroBarText.replace(/\$concentrate/gi, String(Math.floor(this._jBalanceConcentrateCurrent >= 0 ? this._jBalanceConcentrateCurrent : 0)));
					nitroBarText = nitroBarText.replace(/\$freeze/gi, String(Math.floor(this._jBalanceFreezeCurrent >= 0 ? this._jBalanceFreezeCurrent : 0)));
					nitroBarText = nitroBarText.replace(/\$stab/gi, String(Math.floor(this._jBalanceStability || 0)));
					nitroBarText = this._jakeApplyBalanceExhaustTextTokens(nitroBarText);
					drawBalanceFeatureText(nitroBarText, nitroGaugeX + this._jNitroBarTextXOffset, nitroGaugeY - this.lineHeight() + this._jNitroBarTextYOffset, nitroGaugeW, this.lineHeight(), this._jNitroBarTextAngle, this._jNitroBarTextScaleX, this._jNitroBarTextScaleY, this._jNitroBarIndependentShownText);
				}
				if (this._jNitroBarShownPicture && this._jNitroBarShownPicture.length > 0) {
					drawBalanceFeaturePicture(this._jNitroBarShownPicture, nitroGaugeX + Math.floor(nitroGaugeW / 2) + this._jNitroBarPictureXOffset, nitroGaugeY + Math.floor(this._jStabilityBarHeight / 2) + this._jNitroBarPictureYOffset, this._jNitroBarPictureAngle, this._jNitroBarPictureScaleX, this._jNitroBarPictureScaleY, this._jNitroBarIndependentShownPicture);
				}
			}
			topY -= (keySize + 8);
		}

		if (this._jBalanceConcentrateKey !== null) {
			var concentrateKeyX = this._x + this._jBalConcentrateXOffset;
			var concentrateKeyY = topY + this._jBalConcentrateYOffset;
			var concentrateDisp = this._jakeResolveBalanceTokenDisplay(this._jBalConcentrateIcon, this._jBalConcentrateText, this._jBalanceConcentrateKey);
			this._jakeDrawMashToken(this._jakeKeysLayer.bitmap, concentrateKeyX, concentrateKeyY, keySize, concentrateDisp, false, 'rgba(30,30,30,0.35)', '#222222', this._jBalConcentrateAngle, this._jBalConcentrateScaleX, this._jBalConcentrateScaleY);
			if (this._jBalanceConcentrateLimit >= 0) {
				var concentrateGaugeW = Math.floor(barW / 3);
				var concentrateRate = this._jBalanceConcentrateCurrent / Math.max(1, this._jBalanceConcentrateLimit);
				var concentrateGaugeX = Math.floor(concentrateKeyX + Math.floor(keySize / 2) + 8);
				var concentrateGaugeY = Math.floor(concentrateKeyY - Math.floor(this._jStabilityBarHeight / 2));
				var concentrateOpacity = resolveBalanceOpacity(['Concentrate Bar', 'Feature Bar', 'Bar'], this._jBalanceConcentrateExhausted ? exhaustedFeatureOpacity() : balanceMainOpacity);
				this._jakeDrawBalanceGaugeVisual(this._content.bitmap, concentrateGaugeX + this._jConcentrateBarXOffset, concentrateGaugeY + this._jConcentrateBarYOffset, concentrateGaugeW, this._jStabilityBarHeight, concentrateRate, this._jConcentrateBarColor, this._jStabilityBarOutlineColor, this._jStabilityBarOutlineSize, this._jConcentrateBarAngle, this._jConcentrateBarScaleX, this._jConcentrateBarScaleY, concentrateOpacity);
				var concentrateBarText = String(this._jConcentrateBarShownText || '');
				if (concentrateBarText.length > 0) {
					concentrateBarText = concentrateBarText.replace(/\$concentrate/gi, String(Math.floor(this._jBalanceConcentrateCurrent >= 0 ? this._jBalanceConcentrateCurrent : 0)));
					concentrateBarText = concentrateBarText.replace(/\$boost/gi, String(Math.floor(this._jBalanceBoostCurrent >= 0 ? this._jBalanceBoostCurrent : 0)));
					concentrateBarText = concentrateBarText.replace(/\$focus/gi, String(Math.floor(this._jBalanceFocusCurrent >= 0 ? this._jBalanceFocusCurrent : 0)));
					concentrateBarText = concentrateBarText.replace(/\$stick/gi, String(Math.floor(this._jBalanceStickCurrent >= 0 ? this._jBalanceStickCurrent : 0)));
					concentrateBarText = concentrateBarText.replace(/\$nitro/gi, String(Math.floor(this._jBalanceNitroCurrent >= 0 ? this._jBalanceNitroCurrent : 0)));
					concentrateBarText = concentrateBarText.replace(/\$freeze/gi, String(Math.floor(this._jBalanceFreezeCurrent >= 0 ? this._jBalanceFreezeCurrent : 0)));
					concentrateBarText = concentrateBarText.replace(/\$stab/gi, String(Math.floor(this._jBalanceStability || 0)));
					concentrateBarText = this._jakeApplyBalanceExhaustTextTokens(concentrateBarText);
					drawBalanceFeatureText(concentrateBarText, concentrateGaugeX + this._jConcentrateBarTextXOffset, concentrateGaugeY - this.lineHeight() + this._jConcentrateBarTextYOffset, concentrateGaugeW, this.lineHeight(), this._jConcentrateBarTextAngle, this._jConcentrateBarTextScaleX, this._jConcentrateBarTextScaleY, this._jConcentrateBarIndependentShownText);
				}
				if (this._jConcentrateBarShownPicture && this._jConcentrateBarShownPicture.length > 0) {
					drawBalanceFeaturePicture(this._jConcentrateBarShownPicture, concentrateGaugeX + Math.floor(concentrateGaugeW / 2) + this._jConcentrateBarPictureXOffset, concentrateGaugeY + Math.floor(this._jStabilityBarHeight / 2) + this._jConcentrateBarPictureYOffset, this._jConcentrateBarPictureAngle, this._jConcentrateBarPictureScaleX, this._jConcentrateBarPictureScaleY, this._jConcentrateBarIndependentShownPicture);
				}
			}
			topY -= (keySize + 8);
		}

		if (this._jBalanceFreezeKey !== null) {
			var freezeKeyX = this._x + this._jBalFreezeXOffset;
			var freezeKeyY = topY + this._jBalFreezeYOffset;
			var freezeDisp = this._jakeResolveBalanceTokenDisplay(this._jBalFreezeIcon, this._jBalFreezeText, this._jBalanceFreezeKey);
			this._jakeDrawMashToken(this._jakeKeysLayer.bitmap, freezeKeyX, freezeKeyY, keySize, freezeDisp, false, 'rgba(30,30,30,0.35)', '#222222', this._jBalFreezeAngle, this._jBalFreezeScaleX, this._jBalFreezeScaleY);
			if (this._jBalanceFreezeLimit >= 0) {
				var freezeGaugeW = Math.floor(barW / 3);
				var freezeRate = this._jBalanceFreezeCurrent / Math.max(1, this._jBalanceFreezeLimit);
				var freezeGaugeX = Math.floor(freezeKeyX + Math.floor(keySize / 2) + 8);
				var freezeGaugeY = Math.floor(freezeKeyY - Math.floor(this._jStabilityBarHeight / 2));
				var freezeOpacity = resolveBalanceOpacity(['Freeze Bar', 'Feature Bar', 'Bar'], this._jBalanceFreezeExhausted ? exhaustedFeatureOpacity() : balanceMainOpacity);
				this._jakeDrawBalanceGaugeVisual(this._content.bitmap, freezeGaugeX + this._jFreezeBarXOffset, freezeGaugeY + this._jFreezeBarYOffset, freezeGaugeW, this._jStabilityBarHeight, freezeRate, this._jFreezeBarColor, this._jStabilityBarOutlineColor, this._jStabilityBarOutlineSize, this._jFreezeBarAngle, this._jFreezeBarScaleX, this._jFreezeBarScaleY, freezeOpacity);
				var freezeBarText = String(this._jFreezeBarShownText || '');
				if (freezeBarText.length > 0) {
					freezeBarText = freezeBarText.replace(/\$freeze/gi, String(Math.floor(this._jBalanceFreezeCurrent >= 0 ? this._jBalanceFreezeCurrent : 0)));
					freezeBarText = freezeBarText.replace(/\$boost/gi, String(Math.floor(this._jBalanceBoostCurrent >= 0 ? this._jBalanceBoostCurrent : 0)));
					freezeBarText = freezeBarText.replace(/\$focus/gi, String(Math.floor(this._jBalanceFocusCurrent >= 0 ? this._jBalanceFocusCurrent : 0)));
					freezeBarText = freezeBarText.replace(/\$stick/gi, String(Math.floor(this._jBalanceStickCurrent >= 0 ? this._jBalanceStickCurrent : 0)));
					freezeBarText = freezeBarText.replace(/\$nitro/gi, String(Math.floor(this._jBalanceNitroCurrent >= 0 ? this._jBalanceNitroCurrent : 0)));
					freezeBarText = freezeBarText.replace(/\$concentrate/gi, String(Math.floor(this._jBalanceConcentrateCurrent >= 0 ? this._jBalanceConcentrateCurrent : 0)));
					freezeBarText = freezeBarText.replace(/\$stab/gi, String(Math.floor(this._jBalanceStability || 0)));
					freezeBarText = this._jakeApplyBalanceExhaustTextTokens(freezeBarText);
					drawBalanceFeatureText(freezeBarText, freezeGaugeX + this._jFreezeBarTextXOffset, freezeGaugeY - this.lineHeight() + this._jFreezeBarTextYOffset, freezeGaugeW, this.lineHeight(), this._jFreezeBarTextAngle, this._jFreezeBarTextScaleX, this._jFreezeBarTextScaleY, this._jFreezeBarIndependentShownText);
				}
				if (this._jFreezeBarShownPicture && this._jFreezeBarShownPicture.length > 0) {
					drawBalanceFeaturePicture(this._jFreezeBarShownPicture, freezeGaugeX + Math.floor(freezeGaugeW / 2) + this._jFreezeBarPictureXOffset, freezeGaugeY + Math.floor(this._jStabilityBarHeight / 2) + this._jFreezeBarPictureYOffset, this._jFreezeBarPictureAngle, this._jFreezeBarPictureScaleX, this._jFreezeBarPictureScaleY, this._jFreezeBarIndependentShownPicture);
				}
			}
			topY -= (keySize + 8);
		}

		if (this._jakeBalanceFeatureLayer) {
			if (usedBalanceFeatureLayer) this._jakeBalanceFeatureLayer.visible = true;
			else {
				this._jakeBalanceFeatureLayer.visible = false;
				if (this._jakeBalanceFeatureLayer.bitmap) this._jakeBalanceFeatureLayer.bitmap.clear();
			}
		}

		this._jVisualCenterX = this._x;
		this._jVisualCenterY = barY + Math.floor(barH / 2);

		this._jakeApplyKeysLayerTransform(this._x, keyY);

		if (this._jBalanceStopKey !== null) {
			var stopDisp = this._jakeResolveBalanceTokenDisplay(this._jBalanceStopIcon, this._jBalanceStopText, this._jBalanceStopKey);
			this._jakeDrawMashToken(this._jakeStopKeyLayer.bitmap, this._x, topY, keySize, stopDisp, false, this._jBalanceStopColor, this._jBalanceStopColor);
			this._jakeApplyStopKeyLayerTransform(this._x, topY);
		} else {
			this._jakeStopKeyLayer.visible = false;
		}

		this._jakeApplyVisualTransform(this._x, barY + Math.floor(barH / 2));
		this._jakeUpdateOverlayText(null, this._x, barY - Math.floor(this.lineHeight() / 2));
		this._jakeUpdateOverlayPicture(this._x, barY + Math.floor(barH / 2));

		if (this._flashTime >= this._time && !this._notPressed) {
			this._content.bitmap.clear();
			this._jakeKeysLayer.bitmap.clear();
			this._jakeStopKeyLayer.bitmap.clear();
			if (this._jakeCursorLayer && this._jakeCursorLayer.bitmap) this._jakeCursorLayer.bitmap.clear();
			BattleManager.endTASAttackThing();
			this.close();
		}
	};

	var _jEstimateCurrentPower_v23_balance = TimedAttackSystem.prototype._jakeEstimateCurrentPower;
	TimedAttackSystem.prototype._jakeEstimateCurrentPower = function() {
		if (J.isBalanceModuleEnabled() && this._item && this._item.type === 'balance') {
			return J.clamp((this._jBalanceStability || 0) / Math.max(1, this._jBalanceMaxStability || 1), 0, 1);
		}
		return _jEstimateCurrentPower_v23_balance.call(this);
	};

	var _jLoadItem_v23_balance = TimedAttackSystem.prototype.loadItem;
	TimedAttackSystem.prototype.loadItem = function(item) {
		_jLoadItem_v23_balance.call(this, item);
		if (J.isBalanceModuleEnabled() && item && item.type === 'balance') this._jakeSetupBalanceItem(item);
	};

	var _jLoadStart_v23_balance = TimedAttackSystem.prototype.loadStart;
	TimedAttackSystem.prototype.loadStart = function() {
		_jLoadStart_v23_balance.call(this);
		if (J.isBalanceModuleEnabled() && this._item && this._item.type === 'balance') this._jakeInitBalanceStart();
	};

	var _jUpdateGames_v23_balance = TimedAttackSystem.prototype.updateGames;
	TimedAttackSystem.prototype.updateGames = function() {
		if (this._type === 'balance' && !J.isBalanceModuleEnabled()) {
			this.setPower(0);
			BattleManager.endTASAttackThing();
			this.close();
			return;
		}
		J._activeInputConsumer = this;
		try {
			_jUpdateGames_v23_balance.call(this);
			if (J.isBalanceModuleEnabled() && this._type === 'balance') {
				J._activeInputConsumer = this;
				this.playBalanceGame();
			}
		} finally {
			J._activeInputConsumer = null;
		}
		if (J.isBalanceModuleEnabled() && this._type === 'balance' && J.updateParXtaCurrent) J.updateParXtaCurrent(this);
	};
})();

