//=============================================================================
// JakeMSG_HO_FieldEffects_Additions
// JakeMSG_HO_FieldEffects_Additions
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_HO_FieldEffects_Additions = true;

var JakeMSG = JakeMSG || {};
JakeMSG.HO_FieldEffects = JakeMSG.HO_FieldEffects || {};

//=============================================================================
/*:
 * @plugindesc Adds compatibility for "HO_FieldEffects" older saves, and adds
 * new features, including new parameters to the plugin, to the Fields (called "Advanced Fields"
 * when defined in this plugin's parameters) and a new Battle Command to inspect active fields during battle.
 * REQUIRES: "HO_FieldEffects" plugin!
 * The new Battle Command's description is compatible with "JakeMSG_MoreDescriptionsWithConditions" plugin!
 * @author JakeMSG
 * v1.0
 *
 * ============ Change Log ============
 *
 * 1.0 - 3.6th.2026
 * - initial release
 * ====================================
 * @help
 * ================================================================ Issue Fixes:
 * ================================ Rare bug with Black background in battle:
 * ================ Fixed a rare bug where the battle background could turn black,
 * even if you didn't use Field Effects
 * ================================================================ Compatibility Fixes:
 * ================================ Compatibility with old saves:
 * ================ Old saves from before HO_FieldEffects are handled safely.
 *
 * 
 * ================================================================ New Features:
 * ================================ New Parameters:
 * ================ Battle Command: Field Effects parameters:
 * ==== Field Effects Command Text
 * == Text shown in the Party Command window for opening the Field Effects list.
 *
 * ==== Show Field Effects Command
 * == If true, the command is visible by default.
 * == You can toggle this at runtime with plugin commands:
 * == ShowFieldEffectsInBattle / HideFieldEffectsInBattle
 *
 * ==== Field Effects Window X / Y / Width / Height
 * == Formula-based placement and size for the battle field-list window.
 * == These behave like standard formula parameters used by YEP-style plugins.
 *
 * ==== Field HUD X / Y
 * == Position for the active Field icons shown directly in battle.
 * == This on-screen icon HUD is only used if Olivia_StateTooltipDisplay is present.
 * == Default X: middle of screen. Default Y: top of screen.
 *
 * ==== Field HUD Layout
 * == Controls whether Field HUD icons are arranged horizontally or vertically.
 * == Default: Horizontal
 *
 * ==== No Fields Icon
 * == Icon used for the fallback entry when there are no active fields.
 *
 * ==== No Fields Text
 * == Text used for the fallback entry when there are no active fields.
 *
 * ==== No Fields Help
 * == Help window description shown for that fallback entry.
 *
 * ==== Turns Left Text Format
 * == Format string for the right-side turns text in the Field Effects list.
 * == Use %1 as placeholder for the turns value.
 * == Default: Turns left: %1
 *
 * ==== Turns Left Infinite Text
 * == Text used for never-ending fields (turns = 0).
 * == Default: infinity sign
 *
 * ================ Advanced Field parameter addition:
 * ==== AdvFieldEffect -> Icon
 * == IconSet ID shown beside each field entry in the Field Effects list.
 * == If set to 0, the field is hidden from the Field HUD and Field Effects command list.
 *
 * ================ Turns-left display in Field Effects list:
 * == Each field entry displays remaining turns at the right side.
 * == If turns left are 0 (never-ending), the entry shows the infinity sign.
 *
 * ================ Conditional Field Description lines (Condition/Resume tags):
 * == Field descriptions shown in the Field Effects help window and Field HUD tooltip
 * == support <Condition: javascript_expression> and <Resume> lines.
 * == If the condition evaluates false, description output is paused until <Resume> is met.
 * 
 * 
 * ================================ Advanced Fields (Fields in the Parameters of this plugin, similar to the Fields from HO_FieldEffects' parameters, but separate and with their own unique IDs).
 * ======== Parameter declaration:
 * ==== Add field entries in this plugin's "Adv Fields" parameter list. 
 * ==== They have all the features of the original plugin's Fields, with some additions.
 * ==== Use these IDs via:
 * 
 * ======== Map Notetags:
 *   <AdvField: x>
 *   <AdvField: "Field Name">
 * 
 * ======== Skill/Item notetags:
 *   <Set Adv Field: x>
 *   <Set Adv Field: x, y>
 *   <Set Adv Field: "Field Name">
 *   <Set Adv Field: "Field Name", y>
 *   <Add Adv Field: x>
 *   <Add Adv Field: x, y>
 *   <Add Adv Field: "Field Name">
 *   <Add Adv Field: "Field Name", y>
 *   <Rem Adv Field: x>
 *   <Rem Adv Field: x, y>
 *   <Rem Adv Field: "Field Name">
 *   <Rem Adv Field: "Field Name", y>
 *   <RemAllAdvField: x>
 *   <RemAllAdvField: x, y>
 *   <RemAllAdvField: "Field Name">
 *   <RemAllAdvField: "Field Name", y>
 *   <Add Turns Adv Field: x, y>
 *   <Add Turns Adv Field: "Field Name", y>
 *   <Set Turns Adv Field: x, y>
 *   <Set Turns Adv Field: "Field Name", y>
 * 
 * ======== Plugin Commands:
 *   SetAdvField x
 *   SetAdvField x y
 *   SetAdvField "Field Name"
 *   SetAdvField "Field Name" y
 *   AddAdvField x
 *   AddAdvField x y
 *   AddAdvField "Field Name"
 *   AddAdvField "Field Name" y
 *   RemAdvField x
 *   RemAdvField x y
 *   RemAdvField "Field Name"
 *   RemAdvField "Field Name" y
 *   RemAllAdvField x
 *   RemAllAdvField x y
 *   RemAllAdvField "Field Name"
 *   RemAllAdvField "Field Name" y
 *   AddTurnsAdvField x y
 *   AddTurnsAdvField "Field Name" y
 *   SetTurnsAdvField x y
 *   SetTurnsAdvField "Field Name" y
 *
 * ======== Script Calls:
 * ==== fieldExists(fieldNameOrId)
 * == Returns true if at least one active field matches the given name or ID.
 * == Returns false if no match is found, if there are no active fields,
 * == or if called when map/battle field data is unavailable.
 *
 * ==== fieldCopyCount(fieldNameOrId)
 * == Returns how many active field entries match the given name or ID.
 * == Returns 0 if no match is found or when no fields are active.
 *
 * ==== fieldTurnCount(fieldNameOrId)
 * == Returns the turns left on the first (oldest) matching active field.
 * == Returns 0 if no match is found, no fields are active, or unavailable context.
 *
 * ==== fieldSearch(fieldNameOrId)
 * == Returns the index of the first (oldest) matching active field entry.
 * == Returns -1 if no match is found or when map/battle field data is unavailable.
 *
 * ==== fieldTurnIsInfinite(fieldNameOrId)
 * == Checks if the first (oldest) matching active field has infinite turns.
 * == Returns true when that field's turns are infinite, otherwise false.
 * == Returns false if no match is found or when map/battle field data is unavailable.
 *
 * ==== remLastField([fieldNameOrId])
 * == If no argument is given, removes the most recently added active field.
 * == If an argument is given, removes the last matching active field.
 * == Returns true if a field was removed, otherwise false.
 *
 * ==== remFirstField([fieldNameOrId])
 * == If no argument is given, removes the oldest active field.
 * == If an argument is given, removes the first matching active field.
 * == Returns true if a field was removed, otherwise false.
 *
 * ==== remFieldAtIndex(index)
 * == Removes the active field at the specified array position.
 * == Index is clamped to [0, fields.length - 1].
 * == Returns true if a field was removed, otherwise false.
 * == When no fields are active, returns false safely.
 * 
 * 
 * == Unlike in the original plugin, the plugin command "SetAdvField" can now overwrite the number of turns the field lasts
 * == Also, as a new feature, you can also call a Field by its set Name, instead of its ID, in both the Plugin Command and the notetags.
 * ==== These IDs are mapped internally to unique field IDs, separate from "HO_FieldEffects" own parameter field IDs.
 * ==== "ResetField" plugin command (from the original plugin) still works and can reset maps that use <AdvField: x>.
 * ==== If you use field transitions/expiration IDs in Adv fields, use Adv IDs. (They are auto-mapped to internal IDs)
 * ==== The Field IDs of the Advanced Fields are appended after the base field IDs. So if you have 10 base fields and 5 advanced fields, the advanced fields will have internal IDs 11-15, if called by the original plugin's notetags or plugin commands.
 * == Eg: "SetAdvField 15" is equal to "Set Field 25" if there are 10 Fields in the original plugin parameters and 15 in this plugin's parameters. 
 *
 * 
 * ================================ Add/Rem/RemAll/AddTurns/SetTurns Advanced Field Operations:
 * ================ Add Adv Field (append one active field to the array):
 * ==== Notetag:
 *   <Add Adv Field: x>
 *   <Add Adv Field: x, y>
 *   <Add Adv Field: "Field Name">
 *   <Add Adv Field: "Field Name", y>
 * ==== Plugin command:
 *   AddAdvField x
 *   AddAdvField x y
 *   AddAdvField "Field Name"
 *   AddAdvField "Field Name" y
 * ==== Behavior:
 * == Adds one new active field entry without clearing existing active fields.
 * == Duplicates are allowed (same field can appear multiple times in the array).
 * == y controls initial turns (same as SetField semantics):
 * == y > 0: expiring field with y turns.
 * == y = 0: non-expiring field.
 * == y omitted or -1: use field's default expiration turns.
 *
 * ================ RemAdvField / Remove Adv Field (remove FIRST matching entry):
 * ==== Notetag:
 *   <Rem Adv Field: x>
 *   <Rem Adv Field: x, y>
 *   <Rem Adv Field: "Field Name">
 *   <Rem Adv Field: "Field Name", y>
 * ==== Plugin command:
 *   RemAdvField x
 *   RemAdvField x y
 *   RemAdvField "Field Name"
 *   RemAdvField "Field Name" y
 * ==== Behavior:
 * == Targets the first matching active field entry only.
 * == If y <= 0 or omitted: remove that first matching entry immediately.
 * == If y > 0: reduce turns of the first matching expiring entry by y.
 * == If turns drop to 0 or less, that entry is removed.
 * == If turns stay above 0, it is kept.
 * == Non-expiring entries are skipped for turn-reduction removal.
 *
 * ================ RemAllAdvField (remove ALL matching entries):
 * ==== Notetag:
 *   <RemAllAdvField: x>
 *   <RemAllAdvField: x, y>
 *   <RemAllAdvField: "Field Name">
 *   <RemAllAdvField: "Field Name", y>
 * ==== Plugin command:
 *   RemAllAdvField x
 *   RemAllAdvField x y
 *   RemAllAdvField "Field Name"
 *   RemAllAdvField "Field Name" y
 * ==== Behavior:
 * == Same rules as RemAdvField, but applied to all matching active entries.
 * == With y <= 0 (or omitted): all matching entries are removed immediately.
 * == With y > 0: each matching expiring entry is reduced by y, and removed only if it reaches 0 or less.
 *
 * ================ AddTurnsAdvField (add turns to ALL matching entries):
 * ==== Notetag:
 *   <Add Turns Adv Field: x, y>
 *   <Add Turns Adv Field: "Field Name", y>
 * ==== Plugin command:
 *   AddTurnsAdvField x y
 *   AddTurnsAdvField "Field Name" y
 * ==== Behavior:
 * == Finds all active entries matching the ID/name and adds y turns to each (can take a negative value, to subtract instead)
 * == Entries that currently have 0 turns (never-ending) are skipped.
 *
 * ================ SetTurnsAdvField (set turns for ALL matching entries):
 * ==== Notetag:
 *   <Set Turns Adv Field: x, y>
 *   <Set Turns Adv Field: "Field Name", y>
 * ==== Plugin command:
 *   SetTurnsAdvField x y
 *   SetTurnsAdvField "Field Name" y
 * ==== Behavior:
 * == Finds all active entries matching the ID/name and sets turns left to y.
 * == Entries that currently have 0 turns (never-ending) are skipped.
 *
 * ======== New Field properties (used in the Advanced Fields):
 * ==== Advanced Fields can have, as an Eval timing, also "Field Start", which runs custom code when the field is applied or changed into.
 *
 * ================================ Battle Party Command: Field Effects
 * ================ Adds a new Party Command option to inspect active fields during battle.
 * ==== By default the command name is "Field Effects" and can be changed in plugin parameters.
 * ==== The list shows the active field names, and selecting one displays its field description in the Help Window.
 * ==== You can toggle command visibility during gameplay with plugin commands:
 *   ShowFieldEffectsInBattle
 *   HideFieldEffectsInBattle
 *
 * 
 * 
 * 
 * ================================ Field Eval Locals (variables usable in the evals):
 * ================ Normal eval locals (from the original plugin):
 * ==== s: switch array ($gameSwitches._data)
 * ==== v: variable array ($gameVariables._data)
 * ==== a: acting battler (alias of subject when available)
 * ==== user: alias of subject
 * ==== b: target battler in contexts that provide one
 * ==== subject: acting battler when available
 * ==== target: target battler when available
 * ==== item: current action item when available
 *
 * ================ New locals/helpers, that are Field-specific (for evals in Advanced Fields):
 * ==== field / fieldObj: active Game_Field instance being evaluated
 * ==== fieldData: field database object ($dataFields[fieldId])
 * ==== fieldId: numeric ID of the active field
 * ==== fieldName: current field name (snapshot at eval start)
 * ==== fieldTurnsLeft: current turns left (snapshot at eval start)
 * ==== fieldIsExpiring: whether this field currently expires (snapshot)
 *
 * ==== getFieldName(): returns latest field name
 * ==== setFieldName(name): sets fieldData.name and returns the new name
 * ==== getFieldTurnsLeft(): returns latest turns left
 * ==== setFieldTurnsLeft(n): sets turns left (clamped to integer >= 0), returns new value
 * ==== addFieldTurns(delta): adds/subtracts turns (if using negative value), returns new value
 * ==== resetFieldTurns(): resets turns to this field's default expiration turns
 * ==== isFieldExpiring(): returns latest expiration state
 *
 * ================ Notes:
 * ==== Snapshot locals (fieldName/fieldTurnsLeft/fieldIsExpiring) are read at eval start.
 * ==== If you modify data during eval, use getters to read the updated values.
 * ==== setFieldName(name) edits the field definition for that field ID (global), not only one instance.
 *
 * ================ Quick Example:
 * ==== if (isFieldExpiring()) addFieldTurns(1);
 * ==== if (getFieldTurnsLeft() <= 1) setFieldName(getFieldName() + ' (Fading)');
 *
 * ======================================
 * Param Declarations
 * ======================================
 * @param data
 * @text --- Data ---
 * @default

 * @param generalFieldEffects
 * @text --- Battle Command: Field Effects ---
 * @default

 * @param fieldEffectsCommandText
 * @text Field Effects Command Text
 * @parent generalFieldEffects
 * @desc Display name for the Party Command option that opens the active field list.
 * @default Field Effects

 * @param showFieldEffectsCommand
 * @text Show Field Effects Command
 * @parent generalFieldEffects
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the Party Command option by default?
 * @default true

 * @param fieldEffectsWindowX
 * @text Field Effects Window X
 * @parent generalFieldEffects
 * @desc X position formula for the field list window.
 * @default 0

 * @param fieldEffectsWindowY
 * @text Field Effects Window Y
 * @parent generalFieldEffects
 * @desc Y position formula for the field list window.
 * @default this.fittingHeight(2)

 * @param fieldEffectsWindowWidth
 * @text Field Effects Window Width
 * @parent generalFieldEffects
 * @desc Width formula for the field list window.
 * @default Graphics.boxWidth

 * @param fieldEffectsWindowHeight
 * @text Field Effects Window Height
 * @parent generalFieldEffects
 * @desc Height formula for the field list window.
 * @default Graphics.boxHeight - this.fittingHeight(2) - this.fittingHeight(4)

 * @param fieldEffectsHudX
 * @text Field HUD X
 * @parent generalFieldEffects
 * @desc X position formula for on-screen active Field icons (battle only).
 * @default Graphics.boxWidth / 2

 * @param fieldEffectsHudY
 * @text Field HUD Y
 * @parent generalFieldEffects
 * @desc Y position formula for on-screen active Field icons (battle only).
 * @default 0

 * @param fieldEffectsHudLayout
 * @text Field HUD Layout
 * @parent generalFieldEffects
 * @type select
 * @option Horizontal
 * @value horizontal
 * @option Vertical
 * @value vertical
 * @desc Layout of on-screen active Field icons (battle only).
 * @default horizontal

 * @param fieldEffectsEmptyIcon
 * @text No Fields Icon
 * @parent generalFieldEffects
 * @type number
 * @min 0
 * @desc Icon shown when there are no active fields.
 * @default 127

 * @param fieldEffectsEmptyText
 * @text No Fields Text
 * @parent generalFieldEffects
 * @desc Text shown when there are no active fields.
 * @default No Active Fields

 * @param fieldEffectsEmptyHelp
 * @text No Fields Help
 * @parent generalFieldEffects
 * @desc Help text shown when there are no active fields.
 * @default There are currently no active field effects.

 * @param fieldEffectsTurnsTextFormat
 * @text Turns Left Text Format
 * @parent generalFieldEffects
 * @desc Right-side turns text format. Use %1 for turns value.
 * @default Turns left: %1

 * @param fieldEffectsTurnsInfiniteText
 * @text Turns Left Infinite Text
 * @parent generalFieldEffects
 * @desc Text used for never-ending fields (turns = 0).
 * @default \u221e
 *
 * @param advFieldData
 * @text Adv Fields
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []
 */

/*~struct~AdvFieldEffect:
 *
 * @param name
 * @text Field Name
 * @desc The field's name.
 * @type text
 * @default
 *
 * @param battlebacks
 * @text Battle Backgrounds
 * @desc
 * @type struct<AdvBattleBackgrounds>
 * @default
 *
 * @param passives
 * @text Passive States
 * @desc Requires YEP_AutoPassiveStates. Passive states that are applied to battlers while in the field.
 * @type struct<AdvPassiveStates>
 * @default
 *
 * @param skillMods
 * @text Skill Modifications
 * @desc List of skill modifications.
 * @type struct<AdvSkillModification>[]
 * @default []
 *
 * @param itemMods
 * @text Item Modifications
 * @desc List of item modifications.
 * @type struct<AdvItemModification>[]
 * @default []
 *
 * @param transitions
 * @text Field Transformations
 * @desc List of field transformations.
 * @type struct<AdvFieldTransition>[]
 * @default []
 *
 * @param expiration
 * @text Expiration
 * @desc Specify the field's expiration behaviour here.
 * @type struct<AdvFieldExpiration>
 * @default
 *
 * @param evals
 * @text Field Evals
 * @desc Custom code that is evaluated at certain points throughout a battle, while this field is active.
 * @type struct<AdvFieldEvals>
 * @default
 *
 * @param message
 * @text Field Message
 * @desc Shown on battle start and field transform.
 * %1: Field name
 * @type note
 * @default "%1"
 *
 * @param description
 * @text Description
 * @desc Requires HO_FieldBook. A human-readable description for this field.
 * @type note
 * @default
 *
 * @param icon
 * @text Icon
 * @desc Icon ID from IconSet. If 0, this field is hidden from Field HUD and Field Effects command list.
 * @type number
 * @min 0
 * @default 0
 *
 */

/*~struct~AdvBattleBackgrounds:
 *
 * @param battleback1
 * @text Battle Background 1
 * @desc
 * @type file
 * @dir /img/battlebacks1
 * @default
 *
 * @param battleback2
 * @text Battle Background 2
 * @desc
 * @type file
 * @dir /img/battlebacks2
 * @default
 *
 */

/*~struct~AdvPassiveStates:
 *
 * @param globalPassives
 * @text Global
 * @desc List of states that are applied to all battlers.
 * @type state[]
 * @default []
 *
 * @param actorPassives
 * @text Actors
 * @desc List of states that are applied to all actors.
 * @type state[]
 * @default []
 *
 * @param enemyPassives
 * @text Enemies
 * @desc List of states that are applied to all enemies.
 * @type state[]
 * @default []
 *
 */

/*~struct~AdvSkillModification:
 *
 * @param index
 * @text Skill ID
 * @desc ID of the affected skill. If set to 0, this becomes a global field effect that affects all skills.
 * @type skill
 * @default 1
 *
 * @param damageMod
 * @text Damage/Heal Value
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param mpCostMod
 * @text MP Cost
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param tpCostMod
 * @text TP Cost
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param hitMod
 * @text Accuracy
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param criMod
 * @text Critical Chance
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param speedMod
 * @text Speed
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param elementMod
 * @text Element
 * @desc If YEP_ElementCore is NOT used, ONLY the first element will be used for damage calculation.
 * @type number[]
 * @default []
 *
 * @param evals
 * @text Evals
 * @desc Custom evals for this skill.
 * @type struct<AdvItemEvals>
 * @default
 *
 * @param message
 * @text Message
 * @desc Message that is displayed when the skill is used while the field is active.
 * @type note
 * @default
 *
 */

/*~struct~AdvItemModification:
 *
 * @param index
 * @text Item ID
 * @desc ID of the affected item. If set to 0, this becomes a global field effect that affects all items.
 * @type item
 * @default 1
 *
 * @param damageMod
 * @text Damage/Heal Value
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param hitMod
 * @text Accuracy
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param criMod
 * @text Critical Chance
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param speedMod
 * @text Speed
 * @desc
 * @type note
 * @default "value = value * 1.0 + 0.0"
 *
 * @param elementMod
 * @text Element
 * @desc
 * @type number[]
 * @default []
 *
 * @param evals
 * @text Evals
 * @desc Custom evals for this item.
 * @type struct<AdvItemEvals>
 * @default
 *
 * @param message
 * @text Message
 * @desc Message that is displayed when the item is used while the field is active.
 * @type note
 * @default
 *
 */

/*~struct~AdvFieldTransition:
 *
 * @param fieldId
 * @text Field ID
 * @desc ID of the field that will be transformed into.
 * @type number
 * @default 0
 *
 * @param turns
 * @text Expiration Turns
 * @desc Expire the new field after this many turns.
 * -1 = Default,  0 = Never
 * @type number
 * @min -1
 * @default -1
 *
 * @param skills
 * @text Skills
 * @desc List of skills that cause this transformation.
 * @type skill[]
 * @default []
 *
 * @param items
 * @text Items
 * @desc List of items that cause this transformation.
 * @type item[]
 * @default []
 *
 */

/*~struct~AdvFieldExpiration:
 *
 * @param turns
 * @text Default Turns
 * @desc By default, expire the field after this many turns.
 * 0 = Never.
 * @type number
 * @default 0
 *
 * @param fieldId
 * @text Field ID
 * @desc When the field expires, transform into this field.
 * 0 = Destroy.
 * @type number
 * @default 0
 *
 */

/*~struct~AdvFieldEvals:
 *
 * @param fieldStart
 * @text Field Start
 * @desc This is executed when this field is created or changed into.
 * @type note
 * @default
 *
 * @param battleStart
 * @text Battle Start
 * @desc This is executed on battle start AND on field transformation.
 * @type note
 * @default
 *
 * @param battleEnd
 * @text Battle End
 * @desc This is executed on battle start AND before field transformation/destruction.
 * @type note
 * @default
 *
 * @param turnStart
 * @text Turn Start
 * @desc This is executed at the start of each turn.
 * @type note
 * @default
 *
 * @param turnEnd
 * @text Turn End
 * @desc This is executed at the end of each turn.
 * @type note
 * @default
 *
 * @param actionStart
 * @text Action Start
 * @desc This is executed at the start of each action.
 * @type note
 * @default
 *
 * @param actionEnd
 * @text Action End
 * @desc This is executed at the end of each action.
 * @type note
 * @default
 *
 * @param transformIn
 * @text Transform (Into)
 * @desc This is executed when another field is transformed into this one.
 * @type note
 * @default
 *
 * @param transformOut
 * @text Transform (Out of)
 * @desc This is executed when this field transforms into another one.
 * @type note
 * @default
 *
 * @param expiration
 * @text Expiration
 * @desc This is executed when the field naturally expires.
 * @type note
 * @default
 *
 * @param destruction
 * @text Destruction
 * @desc This is executed when the field is destroyed.
 * @type note
 * @default
 *
 */

/*~struct~AdvItemEvals:
 *
 * @param actionStart
 * @text Action Start
 * @desc This is executed once at the start of the action when using this item/skill.
 * @type note
 * @default
 *
 * @param actionEnd
 * @text Action End
 * @desc This is executed once at the end of the action when using this item/skill.
 * @type note
 * @default
 *
 * @param beforeEval
 * @text Before Eval
 * @desc Custom eval that is executed for each target, before all other skill effects.
 * @type note
 * @default
 *
 * @param afterEval
 * @text After Eval
 * @desc Custom eval that is executed for each target, after all other skill effects.
 * @type note
 * @default
 *
 */
//=============================================================================

if (Imported.HO_FieldEffects) {

(function($) {

const pluginName = 'JakeMSG_HO_FieldEffects_Additions';
const parameters = PluginManager.parameters(pluginName);

$.decodeEscapedParameterText = function(text) {
    const raw = String(text || '');
    return raw
        .replace(/\\u([0-9a-fA-F]{4})/g, function(_, hex) {
            return String.fromCharCode(parseInt(hex, 16));
        })
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
};

$.advFieldData = parameters.advFieldData || '[]';
$.fieldEffectsCommandText = String(parameters.fieldEffectsCommandText || 'Field Effects');
$.showFieldEffectsCommand = String(parameters.showFieldEffectsCommand || 'true') === 'true';
$.fieldEffectsWindowX = String(parameters.fieldEffectsWindowX || '0');
$.fieldEffectsWindowY = String(parameters.fieldEffectsWindowY || 'this.fittingHeight(2)');
$.fieldEffectsWindowWidth = String(parameters.fieldEffectsWindowWidth || 'Graphics.boxWidth');
$.fieldEffectsWindowHeight = String(parameters.fieldEffectsWindowHeight || 'Graphics.boxHeight - this.fittingHeight(2) - this.fittingHeight(4)');
$.fieldEffectsHudX = String(parameters.fieldEffectsHudX || 'Graphics.boxWidth / 2');
$.fieldEffectsHudY = String(parameters.fieldEffectsHudY || '0');
$.fieldEffectsHudLayout = String(parameters.fieldEffectsHudLayout || 'horizontal').toLowerCase();
$.fieldEffectsEmptyIcon = Number(parameters.fieldEffectsEmptyIcon || 127);
$.fieldEffectsEmptyText = String(parameters.fieldEffectsEmptyText || 'No Active Fields');
$.fieldEffectsEmptyHelp = String(parameters.fieldEffectsEmptyHelp || 'There are currently no active field effects.');
$.fieldEffectsTurnsTextFormat = String(parameters.fieldEffectsTurnsTextFormat || 'Turns left: %1');
$.fieldEffectsTurnsInfiniteText = $.decodeEscapedParameterText(parameters.fieldEffectsTurnsInfiniteText || '\\u221e');
$.advFieldStartId = 0;
$.advFieldCount = 0;
$.advFieldsLoaded = false;

$.toBaseFieldId = function(advFieldId) {
    advFieldId = Number(advFieldId || 0);
    if (advFieldId <= 0) return 0;
    if ($.advFieldStartId <= 0) return 0;
    return $.advFieldStartId + advFieldId - 1;
};

$.toAdvFieldId = function(baseFieldId) {
    baseFieldId = Number(baseFieldId || 0);
    if (baseFieldId <= 0) return 0;
    if ($.advFieldStartId <= 0) return 0;
    return baseFieldId - $.advFieldStartId + 1;
};

$.isValidLoadedFieldId = function(fieldId) {
    fieldId = Number(fieldId || 0);
    if (fieldId <= 0) return false;
    if (!$dataFields || !$dataFields[fieldId]) return false;
    return Game_Field.exists(fieldId);
};

$.remapTransitionIds = function(transitionMap) {
    if (!transitionMap) return;
    const keys = Object.keys(transitionMap);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        transitionMap[key] = $.toBaseFieldId(transitionMap[key]);
    }
};

$.parseAdvFieldEvals = function(data) {
    let evals = {};
    let evalsData = null;

    if (data && typeof data === 'object') {
        evalsData = data;
        evals = Horsti.FieldEffects.parseFieldEvals(JSON.stringify(data)) || {};
    } else {
        const raw = String(data || '').trim();
        // Empty eval structs are valid and should not spam parse errors.
        if (raw.length <= 0) {
            evals = Horsti.FieldEffects.parseFieldEvals('{}') || {};
            evals.fieldStart = '';
            return evals;
        }

        evals = Horsti.FieldEffects.parseFieldEvals(raw) || {};
        evalsData = Horsti.Utils.parseJson(raw);
    }

    evals.fieldStart = Horsti.FieldEffects.parseNote(evalsData ? evalsData.fieldStart : null);
    return evals;
};

$.resolveFieldForEval = function(fieldId, preferredField) {
    if (preferredField) return preferredField;
    if (!$gameMap || !$gameMap.fields) {
        return $gameMap && $gameMap.field ? $gameMap.field() : null;
    }

    const list = $gameMap.fields();
    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (field && field.fieldId && field.fieldId() === fieldId) {
            return field;
        }
    }

    return $gameMap && $gameMap.field ? $gameMap.field() : null;
};

$.buildFieldEvalContext = function(field, subject, item) {
    const s = $gameSwitches ? $gameSwitches._data : [];
    const v = $gameVariables ? $gameVariables._data : [];
    const a = subject || null;
    const user = subject || null;
    const b = null;
    const target = null;
    const actionItem = item || null;
    const fieldObj = field || null;
    const fieldData = fieldObj && fieldObj.object ? fieldObj.object() : null;
    const fieldId = fieldObj && fieldObj.fieldId ? Number(fieldObj.fieldId() || 0) : 0;
    let fieldName = fieldObj && fieldObj.getName ? String(fieldObj.getName() || '') : '';

    const refreshFieldName = function() {
        fieldName = fieldObj && fieldObj.getName ? String(fieldObj.getName() || '') : '';
        return fieldName;
    };

    const getFieldTurnsLeft = function() {
        return fieldObj && fieldObj.turnsLeft ? Number(fieldObj.turnsLeft() || 0) : 0;
    };

    const isFieldExpiring = function() {
        return !!(fieldObj && fieldObj.isExpiring && fieldObj.isExpiring());
    };

    const setFieldTurnsLeft = function(turns) {
        if (!fieldObj) return 0;
        const parsed = Number(turns);
        if (Number.isNaN(parsed)) return getFieldTurnsLeft();
        const normalized = Math.max(0, Math.floor(parsed));
        fieldObj._turnsLeft = normalized;
        fieldObj._isExpiring = normalized > 0 && ($gameMap ? fieldObj.fieldId() !== $gameMap.defaultFieldId() : true);
        return fieldObj._turnsLeft;
    };

    const addFieldTurns = function(delta) {
        const parsedDelta = Number(delta);
        if (Number.isNaN(parsedDelta)) return getFieldTurnsLeft();
        return setFieldTurnsLeft(getFieldTurnsLeft() + parsedDelta);
    };

    const resetFieldTurns = function() {
        if (!fieldObj || !fieldObj.resetTurnsLeft) return 0;
        fieldObj.resetTurnsLeft();
        return getFieldTurnsLeft();
    };

    const setFieldName = function(newName) {
        if (!fieldData) return refreshFieldName();
        fieldData.name = String(newName || '');
        return refreshFieldName();
    };

    return {
        s: s,
        v: v,
        a: a,
        user: user,
        b: b,
        subject: subject || null,
        target: target,
        item: item || null,
        actionItem: actionItem,
        field: fieldObj,
        fieldObj: fieldObj,
        fieldData: fieldData,
        fieldId: fieldId,
        fieldName: fieldName,
        fieldTurnsLeft: getFieldTurnsLeft(),
        fieldIsExpiring: isFieldExpiring(),
        getFieldName: refreshFieldName,
        setFieldName: setFieldName,
        getFieldTurnsLeft: getFieldTurnsLeft,
        setFieldTurnsLeft: setFieldTurnsLeft,
        addFieldTurns: addFieldTurns,
        resetFieldTurns: resetFieldTurns,
        isFieldExpiring: isFieldExpiring
    };
};

$.runFieldStartEval = function(fieldId, preferredField) {
    if (!fieldId || !Game_Field.exists(fieldId)) return;
    const fieldData = $dataFields[fieldId];
    if (!fieldData || !fieldData.evals) return;
    const code = fieldData.evals.fieldStart || '';
    if (!code) return;

    try {
        const field = $.resolveFieldForEval(fieldId, preferredField);
        const context = $.buildFieldEvalContext(field, null, null);
        const s = context.s;
        const v = context.v;
        const a = context.a;
        const user = context.user;
        const b = context.b;
        const subject = context.subject;
        const target = context.target;
        const item = context.item;
        const actionItem = context.actionItem;
        const fieldObj = context.fieldObj;
        const fieldData = context.fieldData;
        const fieldName = context.fieldName;
        const fieldTurnsLeft = context.fieldTurnsLeft;
        const fieldIsExpiring = context.fieldIsExpiring;
        const getFieldName = context.getFieldName;
        const setFieldName = context.setFieldName;
        const getFieldTurnsLeft = context.getFieldTurnsLeft;
        const setFieldTurnsLeft = context.setFieldTurnsLeft;
        const addFieldTurns = context.addFieldTurns;
        const resetFieldTurns = context.resetFieldTurns;
        const isFieldExpiring = context.isFieldExpiring;
        eval(code);
    } catch (e) {
        console.error('Failed to evaluate fieldStart eval for field ' + fieldId + ':');
        console.error(code);
        console.error(e);
    }
};

$.parseSetAdvFieldArgs = function(args) {
    const out = {
        fieldArg: '',
        turns: -1,
        hasTurns: false
    };
    if (!args || args.length <= 0) return out;

    const first = String(args[0] || '');
    if (first.length <= 0) return out;

    let nextIndex = 1;
    const quote = first[0];
    if ((quote === '"' || quote === "'") && first.length > 1) {
        let value = first;
        while (nextIndex < args.length && !value.endsWith(quote)) {
            value += ' ' + String(args[nextIndex] || '');
            nextIndex += 1;
        }
        if (value.endsWith(quote)) {
            value = value.substring(1, value.length - 1);
        } else {
            value = value.substring(1);
        }
        out.fieldArg = value;
    } else {
        out.fieldArg = first;
    }

    if (nextIndex < args.length) {
        const parsedTurns = Number(args[nextIndex]);
        if (!Number.isNaN(parsedTurns)) {
            out.turns = parsedTurns;
            out.hasTurns = true;
        }
    }
    return out;
};

$.findAdvFieldIdByName = function(name) {
    const target = String(name || '').trim().toLowerCase();
    if (!target) return 0;
    if ($.advFieldStartId <= 0 || $.advFieldCount <= 0) return 0;

    for (let advId = 1; advId <= $.advFieldCount; ++advId) {
        const baseFieldId = $.toBaseFieldId(advId);
        const fieldObj = $dataFields && $dataFields[baseFieldId] ? $dataFields[baseFieldId] : null;
        if (!fieldObj) continue;
        const fieldName = String(fieldObj.name || '').trim().toLowerCase();
        if (fieldName === target) return advId;
    }
    return 0;
};

$.resolveAdvFieldArg = function(rawFieldArg) {
    const raw = String(rawFieldArg || '').trim();
    if (!raw) return 0;

    const numericArg = Number(raw);
    if (!Number.isNaN(numericArg)) {
        // Adv-local IDs are primary. If a global/base ID is passed,
        // convert it back to local Adv ID by subtracting the base offset.
        return numericArg >= $.advFieldStartId ? $.toAdvFieldId(numericArg) : numericArg;
    }

    return $.findAdvFieldIdByName(raw);
};

$.fieldNameFromObjectById = function(fieldId) {
    const id = Number(fieldId || 0);
    if (id <= 0 || !$dataFields || !$dataFields[id]) return '';
    return String($dataFields[id].name || '').trim();
};

$.fieldNameFromInstance = function(field) {
    if (!field) return '';
    if (field.getName) {
        return String(field.getName() || '').trim();
    }
    if (field.fieldId) {
        return $.fieldNameFromObjectById(field.fieldId());
    }
    return '';
};

$.parseFieldQuery = function(rawFieldArg) {
    if (rawFieldArg === undefined || rawFieldArg === null) {
        return { hasValue: false, type: 'any', id: 0, name: '' };
    }

    const raw = String(rawFieldArg).trim();
    if (!raw) {
        return { hasValue: false, type: 'any', id: 0, name: '' };
    }

    if (/^-?\d+$/.test(raw)) {
        const numeric = Math.floor(Number(raw));
        let resolvedId = 0;

        if ($.isValidLoadedFieldId(numeric)) {
            resolvedId = numeric;
        } else {
            const mappedAdvId = $.toBaseFieldId(numeric);
            if ($.isValidLoadedFieldId(mappedAdvId)) {
                resolvedId = mappedAdvId;
            }
        }

        return { hasValue: true, type: 'id', id: resolvedId, name: '' };
    }

    return { hasValue: true, type: 'name', id: 0, name: raw.toLowerCase() };
};

$.doesFieldMatchQuery = function(field, query) {
    if (!field) return false;
    if (!query || !query.hasValue || query.type === 'any') return true;

    if (query.type === 'id') {
        if (query.id <= 0) return false;
        return field.fieldId && field.fieldId() === query.id;
    }

    if (query.type === 'name') {
        const fieldName = $.fieldNameFromInstance(field).toLowerCase();
        return !!fieldName && fieldName === query.name;
    }

    return false;
};

$.parseAdvFieldNotetagArgs = function(payload, allowTurns) {
    const out = {
        fieldArg: '',
        turns: -1,
        hasTurns: false
    };
    const raw = String(payload || '').trim();
    if (!raw) return out;

    let remainder = '';
    if ((raw[0] === '"' || raw[0] === "'") && raw.length > 1) {
        const quote = raw[0];
        let closingIndex = -1;
        for (let i = 1; i < raw.length; ++i) {
            if (raw[i] === quote) {
                closingIndex = i;
                break;
            }
        }
        if (closingIndex >= 1) {
            out.fieldArg = raw.substring(1, closingIndex);
            remainder = raw.substring(closingIndex + 1).trim();
        } else {
            out.fieldArg = raw.substring(1);
            remainder = '';
        }
    } else {
        const match = raw.match(/^(.+?)(?:\s*,\s*(-?\d+))?$/);
        if (match) {
            out.fieldArg = String(match[1] || '').trim();
            if (allowTurns && match[2] !== undefined) {
                const parsedTurns = Number(match[2]);
                if (!Number.isNaN(parsedTurns)) {
                    out.turns = parsedTurns;
                    out.hasTurns = true;
                }
            }
            return out;
        }
        out.fieldArg = raw;
        return out;
    }

    if (allowTurns && remainder) {
        const turnsMatch = remainder.match(/^,\s*(-?\d+)$/);
        if (turnsMatch) {
            const parsedTurns = Number(turnsMatch[1]);
            if (!Number.isNaN(parsedTurns)) {
                out.turns = parsedTurns;
                out.hasTurns = true;
            }
        }
    }

    return out;
};

// ================================ Compatibility Fixes for old saves
// ======== Method Re-initialization
Game_Map.prototype.field = function() {
    return this._field || null;
};

// ======== Method Re-initialization
Game_Map.prototype.defaultFieldId = function() {
    return this._defaultFieldId || 0;
};

// ======== Method Re-initialization
Game_Map.prototype.isAnyFieldActive = function() {
    if (!$gameParty.inBattle() && !$gameSystem.isFieldsAlwaysActive()) return false;
    return !!this.field();
};

const DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!DataManager_isDatabaseLoaded.call(this)) return false;
    // HO_FieldEffects recreates $dataFields during database load checks.
    // Re-append Adv fields every successful pass so they are not lost.
    this.loadAdvFields($.advFieldData);
    $.advFieldsLoaded = true;
    return true;
};

DataManager.loadAdvFields = function(rawFieldData) {
    if (!rawFieldData) return;
    const fieldData = Horsti.Utils.parseJson(rawFieldData);
    if (!fieldData || !Array.isArray(fieldData) || fieldData.length <= 0) {
        return;
    }

    // Keep Adv IDs appended to base IDs by index.
    // Example: base IDs 1..9 and Adv ID 9 => internal/base ID 18.
    $.advFieldStartId = $dataFields.length;
    $.advFieldCount = fieldData.length;

    for (let i = 0; i < fieldData.length; ++i) {
        const data = fieldData[i];
        if (!data) {
            $dataFields.push(null);
            continue;
        }
        try {
            const fieldDataObj = Horsti.Utils.parseJson(data);
            const field = {
                id: $dataFields.length,
                name: Horsti.FieldEffects.parseString(fieldDataObj.name),
                message: Horsti.FieldEffects.parseNote(fieldDataObj.message),
                icon: Horsti.FieldEffects.parseNumber(fieldDataObj.icon, 0),
                battlebacks: Horsti.FieldEffects.parseBattlebacks(fieldDataObj.battlebacks),
                passives: Horsti.FieldEffects.parsePassives(fieldDataObj.passives),
                skillMods: Horsti.FieldEffects.parseModificationsList(fieldDataObj.skillMods),
                itemMods: Horsti.FieldEffects.parseModificationsList(fieldDataObj.itemMods),
                transitions: Horsti.FieldEffects.parseTransitionsList(fieldDataObj.transitions),
                expiration: Horsti.FieldEffects.parseExpiration(fieldDataObj.expiration),
                evals: $.parseAdvFieldEvals(fieldDataObj.evals),
                description: Horsti.FieldEffects.parseNote(fieldDataObj.description)
            };

            field.expiration.fieldId = $.toBaseFieldId(field.expiration.fieldId);
            $.remapTransitionIds(field.transitions.skills);
            $.remapTransitionIds(field.transitions.items);

            $dataFields.push(field);
        } catch (e) {
            console.error('Failed to parse advanced field effect data for entry #' + i);
            console.error(e);
            $dataFields.push(null);
        }
    }
};

const DataManager_processFieldNotetags = DataManager.processFieldNotetags;
DataManager.processFieldNotetags = function(group) {
    DataManager_processFieldNotetags.call(this, group);
    for (let i = 1; i < group.length; ++i) {
        const obj = group[i];
        if (!obj) continue;
        const lines = String(obj.note || '').split(/[\r\n]/);
        for (let j = 0; j < lines.length; ++j) {
            const line = lines[j];
            const setAdvFieldMatch = line.match(/<SET[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
            if (setAdvFieldMatch) {
                const parsed = $.parseAdvFieldNotetagArgs(setAdvFieldMatch[1], true);
                const advFieldId = $.resolveAdvFieldArg(parsed.fieldArg);
                const baseFieldId = $.toBaseFieldId(advFieldId);
                if (!$.isValidLoadedFieldId(baseFieldId)) {
                    console.warn('Ignored <Set Adv Field>: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
                    continue;
                }
                obj.fieldOverride = {
                    fieldId: baseFieldId,
                    turns: parsed.turns
                };
            }
        }
    }
};

const Game_Map_processFieldNotetags = Game_Map.prototype.processFieldNotetags;
Game_Map.prototype.processFieldNotetags = function() {
    Game_Map_processFieldNotetags.call(this);
    const lines = $dataMap.note.split(/[\r\n]+/);
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        const advFieldMatch = line.match(/<ADV[-_ ]?FIELD:\s*([^>]+)>/i);
        if (advFieldMatch) {
            const parsed = $.parseAdvFieldNotetagArgs(advFieldMatch[1], false);
            const advFieldId = $.resolveAdvFieldArg(parsed.fieldArg);
            const baseFieldId = $.toBaseFieldId(advFieldId);
            if (!$.isValidLoadedFieldId(baseFieldId)) {
                console.warn('Ignored <AdvField>: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
                return;
            }
            this._defaultFieldId = baseFieldId;
            this.setField(baseFieldId, -1);
            return;
        }
    }
};

const Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    if (command.match(/SET[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const rawFieldArg = String(parsed.fieldArg || '');
        const turns = parsed.turns;

        const advFieldId = $.resolveAdvFieldArg(rawFieldArg);
        const baseFieldId = $.toBaseFieldId(advFieldId);

        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('SetAdvField ignored: "' + rawFieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }

        $gameMap.setField(baseFieldId, turns);
    } else {
        Game_Interpreter_pluginCommand.call(this, command, args);
    }
};

const Game_Map_setField = Game_Map.prototype.setField;
Game_Map.prototype.setField = function(fieldId, turns) {
    const previousFieldId = this.field() ? this.field().fieldId() : 0;
    Game_Map_setField.call(this, fieldId, turns);
    const newField = this.field();
    const newFieldId = newField ? newField.fieldId() : 0;
    if (newFieldId > 0 && newFieldId !== previousFieldId) {
        $.runFieldStartEval(newFieldId, newField);
    }
};

//=============================================================================
// Field Effects Party Command UI
//=============================================================================

$.activeFieldsForDisplay = function() {
    if (!$gameMap) return [];
    if ($gameMap.fields) {
        const list = $gameMap.fields();
        return Array.isArray(list) ? list.filter(Boolean) : [];
    }
    const singleField = $gameMap.field ? $gameMap.field() : null;
    return singleField ? [singleField] : [];
};

$.fieldNameForDisplay = function(field) {
    if (!field) return '';
    if (field.getName) return String(field.getName() || '');
    const objectData = field.object ? field.object() : null;
    return String(objectData && objectData.name ? objectData.name : '');
};

$.applyConditionalDescriptionTags = function(rawDescription) {
    const text = String(rawDescription || '');
    if (!text) return '';

    const s = $gameSwitches ? $gameSwitches._data : [];
    const v = $gameVariables ? $gameVariables._data : [];
    const lines = text.split(/[\r\n]+/);
    const result = [];
    let tempStop = false;

    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        const conditionMatch = line.match(/^\s*<(?:COND|CONDITION)\s*:\s*(.*?)>\s*$/i);
        if (conditionMatch) {
            try {
                if (!eval(conditionMatch[1])) {
                    tempStop = true;
                }
            } catch (e) {
                console.error('JakeMSG_HO_FieldEffects_Additions condition eval error: ' + e.message);
                tempStop = true;
            }
            continue;
        }

        if (line.match(/^\s*<RESUME>\s*$/i)) {
            tempStop = false;
            continue;
        }

        if (!tempStop) {
            result.push(line);
        }
    }

    return result.join('\n');
};

$.fieldDescriptionForDisplay = function(field) {
    if (!field) return '';
    if (field.getDescription) {
        return $.applyConditionalDescriptionTags(field.getDescription());
    }
    const objectData = field.object ? field.object() : null;
    const rawDescription = objectData && objectData.description ? objectData.description : '';
    return $.applyConditionalDescriptionTags(rawDescription);
};

$.fieldIconForDisplay = function(field) {
    if (!field) return 0;
    if (field.getIcon) return Number(field.getIcon() || 0);
    const objectData = field.object ? field.object() : null;
    return Number(objectData && objectData.icon ? objectData.icon : 0);
};

$.fieldTurnsTextForDisplay = function(field) {
    if (!field || !field.turnsLeft) return '';
    const turns = Number(field.turnsLeft() || 0);
    const valueText = turns <= 0
        ? $.fieldEffectsTurnsInfiniteText
        : String(turns);
    return $.fieldEffectsTurnsTextFormat.format(valueText);
};

if (!Window_Command.prototype.addCommandAt) {
    Window_Command.prototype.addCommandAt = function(index, name, symbol, enabled, ext) {
        this._list.splice(index, 0, { name: name, symbol: symbol, enabled: enabled, ext: ext });
    };
}

const Game_System_initialize_FieldEffectsCommand = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    Game_System_initialize_FieldEffectsCommand.call(this);
    this.initFieldEffectsCommandSettings();
};

Game_System.prototype.initFieldEffectsCommandSettings = function() {
    this._showFieldEffectsInBattle = $.showFieldEffectsCommand;
};

Game_System.prototype.isShowFieldEffectsInBattle = function() {
    if (this._showFieldEffectsInBattle === undefined) {
        this.initFieldEffectsCommandSettings();
    }
    return this._showFieldEffectsInBattle;
};

Game_System.prototype.setShowFieldEffectsInBattle = function(value) {
    if (this._showFieldEffectsInBattle === undefined) {
        this.initFieldEffectsCommandSettings();
    }
    this._showFieldEffectsInBattle = !!value;
};

const Window_PartyCommand_makeCommandList_FieldEffects = Window_PartyCommand.prototype.makeCommandList;
Window_PartyCommand.prototype.makeCommandList = function() {
    Window_PartyCommand_makeCommandList_FieldEffects.call(this);
    this.makeFieldEffectsCommand();
};

Window_PartyCommand.prototype.makeFieldEffectsCommand = function() {
    if (!$gameSystem || !$gameSystem.isShowFieldEffectsInBattle || !$gameSystem.isShowFieldEffectsInBattle()) return;
    if (this.findSymbol && this.findSymbol('fieldEffectsStatus') >= 0) return;

    const text = $.fieldEffectsCommandText;
    const escapeIndex = this.findSymbol ? this.findSymbol('escape') : -1;
    if (escapeIndex >= 0 && this.addCommandAt) {
        this.addCommandAt(escapeIndex, text, 'fieldEffectsStatus', true);
    } else {
        this.addCommand(text, 'fieldEffectsStatus', true);
    }
};

function Window_FieldEffectsList() {
    this.initialize.apply(this, arguments);
}

Window_FieldEffectsList.prototype = Object.create(Window_Selectable.prototype);
Window_FieldEffectsList.prototype.constructor = Window_FieldEffectsList;

Window_FieldEffectsList.prototype.initialize = function() {
    const x = eval($.fieldEffectsWindowX);
    const y = eval($.fieldEffectsWindowY);
    const width = eval($.fieldEffectsWindowWidth);
    const height = eval($.fieldEffectsWindowHeight);
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._data = [];
    this.hide();
    this.deactivate();
    this.refresh();
};

Window_FieldEffectsList.prototype.maxItems = function() {
    return this._data ? this._data.length : 0;
};

Window_FieldEffectsList.prototype.item = function() {
    const index = this.index();
    if (!this._data || index < 0 || index >= this._data.length) return null;
    return this._data[index];
};

Window_FieldEffectsList.prototype.makeItemList = function() {
    this._data = $.activeFieldsForDisplay().filter(function(field) {
        return $.fieldIconForDisplay(field) > 0;
    });
    if (!this._data || this._data.length <= 0) {
        this._data = [null];
    }
};

Window_FieldEffectsList.prototype.drawItem = function(index) {
    const rect = this.itemRect(index);
    rect.width -= this.textPadding();

    const field = this._data[index];
    if (!field) {
        if ($.fieldEffectsEmptyIcon > 0) {
            this.drawIcon($.fieldEffectsEmptyIcon, rect.x + 2, rect.y + 2);
            this.drawText($.fieldEffectsEmptyText, rect.x + Window_Base._iconWidth + 8, rect.y, rect.width - Window_Base._iconWidth - 8);
        } else {
            this.drawText($.fieldEffectsEmptyText, rect.x, rect.y, rect.width);
        }
        return;
    }

    const icon = $.fieldIconForDisplay(field);
    const name = $.fieldNameForDisplay(field);
    const turnsText = $.fieldTurnsTextForDisplay(field);
    const turnsWidth = Math.max(36, this.textWidth('0000'));
    const nameWidth = Math.max(0, rect.width - turnsWidth - 8);

    this.changeTextColor(this.systemColor());
    this.drawText(turnsText, rect.x, rect.y, rect.width, 'right');
    this.resetTextColor();

    if (icon > 0) {
        this.drawIcon(icon, rect.x + 2, rect.y + 2);
        this.drawText(name, rect.x + Window_Base._iconWidth + 8, rect.y, nameWidth - Window_Base._iconWidth - 8);
    } else {
        this.drawText(name, rect.x, rect.y, nameWidth);
    }
};

Window_FieldEffectsList.prototype.updateHelp = function() {
    if (!this._helpWindow) return;
    const field = this.item();
    if (!field) {
        this._helpWindow.setText($.fieldEffectsEmptyHelp);
        return;
    }
    this._helpWindow.setText($.fieldDescriptionForDisplay(field));
};

Window_FieldEffectsList.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};

const Scene_Battle_createAllWindows_FieldEffects = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    Scene_Battle_createAllWindows_FieldEffects.call(this);
    this.createFieldEffectsListWindow();
};

Scene_Battle.prototype.createFieldEffectsListWindow = function() {
    this._fieldEffectsListWindow = new Window_FieldEffectsList();
    if (this._helpWindow) {
        this._fieldEffectsListWindow.setHelpWindow(this._helpWindow);
    }
    this._fieldEffectsListWindow.setHandler('cancel', this.onFieldEffectsStatusCancel.bind(this));
    this.addWindow(this._fieldEffectsListWindow);
};

const Scene_Battle_createPartyCommandWindow_FieldEffects = Scene_Battle.prototype.createPartyCommandWindow;
Scene_Battle.prototype.createPartyCommandWindow = function() {
    Scene_Battle_createPartyCommandWindow_FieldEffects.call(this);
    this._partyCommandWindow.setHandler('fieldEffectsStatus', this.commandFieldEffectsStatus.bind(this));
};

Scene_Battle.prototype.commandFieldEffectsStatus = function() {
    if (this._helpWindow) {
        this._helpWindow.show();
    }
    this._fieldEffectsListWindow.refresh();
    this._fieldEffectsListWindow.show();
    this._fieldEffectsListWindow.activate();
    this._fieldEffectsListWindow.select(0);
    this._fieldEffectsListWindow.updateHelp();
};

Scene_Battle.prototype.onFieldEffectsStatusCancel = function() {
    if (this._helpWindow) {
        this._helpWindow.hide();
        this._helpWindow.clear();
    }
    this._fieldEffectsListWindow.deactivate();
    this._fieldEffectsListWindow.hide();
    this._partyCommandWindow.activate();
};

const Scene_Battle_isAnyInputWindowActive_FieldEffects = Scene_Battle.prototype.isAnyInputWindowActive;
Scene_Battle.prototype.isAnyInputWindowActive = function() {
    if (Scene_Battle_isAnyInputWindowActive_FieldEffects.call(this)) return true;
    return !!(this._fieldEffectsListWindow && this._fieldEffectsListWindow.active);
};

//=============================================================================
// Olivia Tooltip Integration - On-screen Field HUD
//=============================================================================

if (Imported.Olivia_StateOlivia_StateTooltipDisplay) {

function Sprite_FieldEffectIcon() {
    this.initialize.apply(this, arguments);
}

Sprite_FieldEffectIcon.prototype = Object.create(Sprite.prototype);
Sprite_FieldEffectIcon.prototype.constructor = Sprite_FieldEffectIcon;

Sprite_FieldEffectIcon.prototype.initialize = function(field) {
    Sprite.prototype.initialize.call(this);
    this.bitmap = ImageManager.loadSystem('IconSet');
    this.anchor.x = 0.5;
    this.anchor.y = 0;
    this.updateField(field);
};

Sprite_FieldEffectIcon.prototype.updateField = function(field) {
    this._fieldEffectData = {
        id: field && field.fieldId ? Number(field.fieldId() || 0) : 0,
        icon: $.fieldIconForDisplay(field),
        name: $.fieldNameForDisplay(field),
        description: $.fieldDescriptionForDisplay(field)
    };
    this.updateFrame();
};

Sprite_FieldEffectIcon.prototype.updateFrame = function() {
    const iconIndex = Number(this._fieldEffectData.icon || 0);
    if (iconIndex <= 0) {
        this.visible = false;
        this.setFrame(0, 0, 0, 0);
        return;
    }
    this.visible = true;
    const pw = Window_Base._iconWidth;
    const ph = Window_Base._iconHeight;
    const sx = (iconIndex % 16) * pw;
    const sy = Math.floor(iconIndex / 16) * ph;
    this.setFrame(sx, sy, pw, ph);
};

Sprite_FieldEffectIcon.prototype.canvasToLocalX = function(x) {
    let node = this;
    while (node) {
        x -= node.x;
        node = node.parent;
    }
    return x;
};

Sprite_FieldEffectIcon.prototype.canvasToLocalY = function(y) {
    let node = this;
    while (node) {
        y -= node.y;
        node = node.parent;
    }
    return y;
};

Sprite_FieldEffectIcon.prototype.isMouseOver = function() {
    if (!this.visible) return false;
    let node = this;
    while (node) {
        if (!node.visible) return false;
        if (node.opacity !== undefined && node.opacity <= 0) return false;
        node = node.parent;
    }
    const x = this.canvasToLocalX(TouchInput._mouseOverX || 0);
    const y = this.canvasToLocalY(TouchInput._mouseOverY || 0);
    return x >= -Window_Base._iconWidth * this.anchor.x &&
           y >= -Window_Base._iconHeight * this.anchor.y &&
           x < Window_Base._iconWidth * (1 - this.anchor.x) &&
           y < Window_Base._iconHeight * (1 - this.anchor.y);
};

function Sprite_FieldEffectsHud() {
    this.initialize.apply(this, arguments);
}

Sprite_FieldEffectsHud.prototype = Object.create(Sprite.prototype);
Sprite_FieldEffectsHud.prototype.constructor = Sprite_FieldEffectsHud;

Sprite_FieldEffectsHud.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this._signature = '';
    this._icons = [];
    this._spacing = 36;
    this.refreshIfNeeded(true);
};

Sprite_FieldEffectsHud.prototype.currentFields = function() {
    return $.activeFieldsForDisplay().filter(function(field) {
        return $.fieldIconForDisplay(field) > 0;
    });
};

Sprite_FieldEffectsHud.prototype.makeSignature = function(fields) {
    const parts = [];
    parts.push($.fieldEffectsHudLayout === 'vertical' ? 'vertical' : 'horizontal');
    for (let i = 0; i < fields.length; ++i) {
        const f = fields[i];
        parts.push([
            f.fieldId ? f.fieldId() : 0,
            $.fieldIconForDisplay(f),
            $.fieldNameForDisplay(f),
            $.fieldDescriptionForDisplay(f)
        ].join(':'));
    }
    return parts.join('|');
};

Sprite_FieldEffectsHud.prototype.evalNumberFormula = function(formula, fallback) {
    try {
        const value = Number(eval(formula));
        return Number.isNaN(value) ? fallback : value;
    } catch (e) {
        return fallback;
    }
};

Sprite_FieldEffectsHud.prototype.refreshIfNeeded = function(force) {
    const fields = this.currentFields();
    const signature = this.makeSignature(fields);
    if (!force && signature === this._signature) {
        this.x = this.evalNumberFormula($.fieldEffectsHudX, Graphics.boxWidth / 2);
        this.y = this.evalNumberFormula($.fieldEffectsHudY, 0);
        return;
    }
    this._signature = signature;

    for (let i = 0; i < this._icons.length; ++i) {
        this.removeChild(this._icons[i]);
    }
    this._icons = [];

    const start = -((fields.length - 1) * this._spacing) / 2;
    const isVertical = $.fieldEffectsHudLayout === 'vertical';
    for (let i = 0; i < fields.length; ++i) {
        const icon = new Sprite_FieldEffectIcon(fields[i]);
        icon.x = isVertical ? 0 : start + i * this._spacing;
        icon.y = isVertical ? start + i * this._spacing : 0;
        this._icons.push(icon);
        this.addChild(icon);
    }

    this.x = this.evalNumberFormula($.fieldEffectsHudX, Graphics.boxWidth / 2);
    this.y = this.evalNumberFormula($.fieldEffectsHudY, 0);
    this.visible = this._icons.length > 0;
};

Sprite_FieldEffectsHud.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.refreshIfNeeded(false);
    this.updateTooltipHover();
};

Sprite_FieldEffectsHud.prototype.updateTooltipHover = function() {
    const scene = SceneManager._scene;
    if (!scene || !scene._stateIconTooltipWindow) return;

    for (let i = this._icons.length - 1; i >= 0; --i) {
        const icon = this._icons[i];
        if (icon && icon.isMouseOver && icon.isMouseOver()) {
            scene._stateIconTooltipWindow.setTargetHost(icon);
            return;
        }
    }
};

const Window_StateIconTooltip_setupText_FieldEffects = Window_StateIconTooltip.prototype.setupText;
Window_StateIconTooltip.prototype.setupText = function() {
    const host = this._targetHost;
    if (host && host._fieldEffectData) {
        const data = host._fieldEffectData;
        const iconText = Number(data.icon || 0) > 0 ? '\\i[' + Number(data.icon || 0) + ']' : '';
        const nameText = String(data.name || '');
        const descText = String(data.description || '');
        const fmt = Olivia.StateTooltipDisplay && Olivia.StateTooltipDisplay.Window
            ? Olivia.StateTooltipDisplay.Window.textFmt
            : '\\c[27]%1%2:\\c[0] %3 %4';
        this._battler = undefined;
        // Olivia's tooltip height logic expects at least one newline-terminated line.
        this._text = fmt.format(iconText, nameText, descText, '') + '\n';
        return;
    }
    Window_StateIconTooltip_setupText_FieldEffects.call(this);
};

const Scene_Battle_createAllWindows_FieldEffectsHud = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    Scene_Battle_createAllWindows_FieldEffectsHud.call(this);
    this.createFieldEffectsHudSprite();
};

Scene_Battle.prototype.createFieldEffectsHudSprite = function() {
    this._fieldEffectsHudSprite = new Sprite_FieldEffectsHud();
    this.addChild(this._fieldEffectsHudSprite);
};

}

//=============================================================================
// Multi-field extension layer
//=============================================================================

$.parseAdvNotetagAction = function(payload, allowTurns) {
    const parsed = $.parseAdvFieldNotetagArgs(payload, allowTurns);
    return {
        fieldArg: String(parsed.fieldArg || ''),
        turns: Number(parsed.turns || 0),
        hasTurns: !!parsed.hasTurns
    };
};

$.resolveAdvActionToBaseFieldId = function(actionEntry) {
    if (!actionEntry) return 0;
    const advFieldId = $.resolveAdvFieldArg(actionEntry.fieldArg);
    return $.toBaseFieldId(advFieldId);
};

$.evalFieldCodeForField = function(field, phase, subject, item) {
    if (!field) return;
    const code = field.getEval ? field.getEval(phase) : '';
    if (!code) return;
    try {
        const context = $.buildFieldEvalContext(field, subject, item);
        const s = context.s;
        const v = context.v;
        const a = context.a;
        const user = context.user;
        const b = context.b;
        const target = context.target;
        const fieldObj = context.fieldObj;
        const actionItem = context.actionItem;
        const fieldId = context.fieldId;
        const fieldData = context.fieldData;
        const fieldName = context.fieldName;
        const fieldTurnsLeft = context.fieldTurnsLeft;
        const fieldIsExpiring = context.fieldIsExpiring;
        const getFieldName = context.getFieldName;
        const setFieldName = context.setFieldName;
        const getFieldTurnsLeft = context.getFieldTurnsLeft;
        const setFieldTurnsLeft = context.setFieldTurnsLeft;
        const addFieldTurns = context.addFieldTurns;
        const resetFieldTurns = context.resetFieldTurns;
        const isFieldExpiring = context.isFieldExpiring;
        eval(code);
    } catch (e) {
        console.error('Failed to evaluate field effect code for phase "' + phase + '"');
        console.error(code);
        console.error(e);
    }
};

$.evalFieldDestructionForField = function(field, subject, item) {
    $.evalFieldCodeForField(field, 'destruction', subject, item);
};

$.refreshFieldMembers = function() {
    $gameParty.refreshMembers();
    $gameTroop.refreshMembers();
};

Game_Map.prototype.fields = function() {
    if (!Array.isArray(this._fields)) this._fields = [];
    return this._fields;
};

Game_Map.prototype._syncPrimaryField = function() {
    const list = this.fields();
    this._field = list.length > 0 ? list[0] : null;
};

Game_Map.prototype.field = function() {
    this._syncPrimaryField();
    return this._field || null;
};

Game_Map.prototype.isAnyFieldActive = function() {
    if (!$gameParty.inBattle() && !$gameSystem.isFieldsAlwaysActive()) return false;
    return this.fields().length > 0;
};

Game_Map.prototype.isField = function(fieldId) {
    if (!this.isAnyFieldActive()) return false;
    const list = this.fields();
    for (let i = 0; i < list.length; ++i) {
        if (list[i] && list[i].fieldId() === fieldId) return true;
    }
    return false;
};

Game_Map.prototype.fieldId = function() {
    const f = this.field();
    return f ? f.fieldId() : 0;
};

Game_Map.prototype.setField = function(fieldId, turns) {
    const normalizedTurns = turns === undefined ? -1 : Number(turns);
    const list = this.fields();
    list.length = 0;

    if (fieldId > 0) {
        list.push(new Game_Field(fieldId, normalizedTurns));
    } else if ($gameSystem.isFieldsAlwaysActive() && this.defaultFieldId() > 0) {
        list.push(new Game_Field(this.defaultFieldId(), 0));
    }

    this._syncPrimaryField();
    $.refreshFieldMembers();
};

Game_Map.prototype.addField = function(fieldId, turns) {
    const normalizedTurns = turns === undefined ? -1 : Number(turns);
    if (fieldId <= 0) return false;
    this.fields().push(new Game_Field(fieldId, normalizedTurns));
    this._syncPrimaryField();
    $.refreshFieldMembers();
    return true;
};

Game_Map.prototype._removeAtIndex = function(index) {
    const list = this.fields();
    if (index < 0 || index >= list.length) return null;
    const removed = list.splice(index, 1)[0] || null;
    this._syncPrimaryField();
    $.refreshFieldMembers();
    return removed;
};

Game_Map.prototype.removeFirstFieldMatch = function(fieldId, turnsReduction) {
    const list = this.fields();
    const reduction = Number(turnsReduction || 0);
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;

        if (reduction > 0) {
            if (!field.isExpiring() || field.turnsLeft() <= 0) {
                return { removed: false, skipped: true, count: 0 };
            }
            field._turnsLeft -= reduction;
            if (field.turnsLeft() > 0) {
                return { removed: false, skipped: false, count: 0 };
            }
        }

        this._removeAtIndex(i);
        return { removed: true, skipped: false, count: 1, field: field };
    }
    return { removed: false, skipped: false, count: 0 };
};

Game_Map.prototype.removeAllFieldMatches = function(fieldId, turnsReduction) {
    const list = this.fields();
    const reduction = Number(turnsReduction || 0);
    const removed = [];

    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;

        if (reduction > 0) {
            if (!field.isExpiring() || field.turnsLeft() <= 0) continue;
            field._turnsLeft -= reduction;
            if (field.turnsLeft() > 0) continue;
        }

        removed.push(field);
        list.splice(i, 1);
    }

    if (removed.length > 0) {
        this._syncPrimaryField();
        $.refreshFieldMembers();
    }
    return removed;
};

Game_Map.prototype.addTurnsAllFieldMatches = function(fieldId, turnsToAdd) {
    const list = this.fields();
    const delta = Number(turnsToAdd);
    if (Number.isNaN(delta)) {
        return { matched: 0, changed: 0, skipped: 0 };
    }

    let matched = 0;
    let changed = 0;
    let skipped = 0;

    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;
        matched += 1;

        if (field.turnsLeft() <= 0) {
            skipped += 1;
            continue;
        }

        const updatedTurns = Math.max(0, Math.floor(field.turnsLeft() + delta));
        field._turnsLeft = updatedTurns;
        field._isExpiring = updatedTurns > 0 && (field.fieldId() !== this.defaultFieldId());
        changed += 1;
    }

    return { matched: matched, changed: changed, skipped: skipped };
};

Game_Map.prototype.setTurnsAllFieldMatches = function(fieldId, turnsToSet) {
    const list = this.fields();
    const turns = Number(turnsToSet);
    if (Number.isNaN(turns)) {
        return { matched: 0, changed: 0, skipped: 0 };
    }

    const normalizedTurns = Math.max(0, Math.floor(turns));
    let matched = 0;
    let changed = 0;
    let skipped = 0;

    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;
        matched += 1;

        if (field.turnsLeft() <= 0) {
            skipped += 1;
            continue;
        }

        field._turnsLeft = normalizedTurns;
        field._isExpiring = normalizedTurns > 0 && (field.fieldId() !== this.defaultFieldId());
        changed += 1;
    }

    return { matched: matched, changed: changed, skipped: skipped };
};

Game_Map.prototype.removeFirstFieldByQuery = function(rawFieldArg) {
    const list = this.fields();
    if (list.length <= 0) return null;

    const query = $.parseFieldQuery(rawFieldArg);
    for (let i = 0; i < list.length; ++i) {
        if (!$.doesFieldMatchQuery(list[i], query)) continue;
        return this._removeAtIndex(i);
    }

    return null;
};

Game_Map.prototype.removeLastFieldByQuery = function(rawFieldArg) {
    const list = this.fields();
    if (list.length <= 0) return null;

    const query = $.parseFieldQuery(rawFieldArg);
    for (let i = list.length - 1; i >= 0; --i) {
        if (!$.doesFieldMatchQuery(list[i], query)) continue;
        return this._removeAtIndex(i);
    }

    return null;
};

Game_Map.prototype.removeFieldAtIndexClamped = function(rawIndex) {
    const list = this.fields();
    if (list.length <= 0) return null;

    let index = Math.floor(Number(rawIndex));
    if (Number.isNaN(index)) index = 0;
    index = Math.max(0, Math.min(index, list.length - 1));

    return this._removeAtIndex(index);
};

// ================================ Issue fix: for the occasional Black background bug
const Game_Map_battleback1Name = Game_Map.prototype.battleback1Name;
Game_Map.prototype.battleback1Name = function() {
    if (this.field() && this.field().battleback1Name()) {
        return this.field().battleback1Name();
    } else {
        return Game_Map_battleback1Name.call(this);
    }
};

const Game_Map_battleback2Name = Game_Map.prototype.battleback2Name;
Game_Map.prototype.battleback2Name = function() {
    if (this.field() && this.field().battleback2Name()) {
        return this.field().battleback2Name();
    } else {
        return Game_Map_battleback2Name.call(this);
    }
};
// ================================ End issue fix

const Game_Map_battleback1Name_Multi = Game_Map.prototype.battleback1Name;
Game_Map.prototype.battleback1Name = function() {
    const list = this.fields();
    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (field && field.battleback1Name()) return field.battleback1Name();
    }
    return Game_Map_battleback1Name_Multi.call(this);
};

const Game_Map_battleback2Name_Multi = Game_Map.prototype.battleback2Name;
Game_Map.prototype.battleback2Name = function() {
    const list = this.fields();
    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (field && field.battleback2Name()) return field.battleback2Name();
    }
    return Game_Map_battleback2Name_Multi.call(this);
};

// Final fallback fix:
// If no field provides a battleback, return the current runtime map battleback
// values directly instead of flowing back into HO's reset-to-$dataMap fallback.
const Game_Map_battleback1Name_RuntimeSafe = Game_Map.prototype.battleback1Name;
Game_Map.prototype.battleback1Name = function() {
    const list = this.fields();
    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (field && field.battleback1Name()) return field.battleback1Name();
    }
    if (this._battleback1Name !== undefined) return this._battleback1Name;
    return Game_Map_battleback1Name_RuntimeSafe.call(this);
};

const Game_Map_battleback2Name_RuntimeSafe = Game_Map.prototype.battleback2Name;
Game_Map.prototype.battleback2Name = function() {
    const list = this.fields();
    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (field && field.battleback2Name()) return field.battleback2Name();
    }
    if (this._battleback2Name !== undefined) return this._battleback2Name;
    return Game_Map_battleback2Name_RuntimeSafe.call(this);
};

const DataManager_processFieldNotetags_Multi = DataManager.processFieldNotetags;
DataManager.processFieldNotetags = function(group) {
    DataManager_processFieldNotetags_Multi.call(this, group);
    for (let i = 1; i < group.length; ++i) {
        const obj = group[i];
        if (!obj) continue;

        obj.jakeAdvSet = null;
        obj.jakeAdvAdds = [];
        obj.jakeAdvRemoves = [];
        obj.jakeAdvRemoveAll = [];
        obj.jakeAdvAddTurns = [];
        obj.jakeAdvSetTurns = [];

        const lines = String(obj.note || '').split(/[\r\n]/);
        for (let j = 0; j < lines.length; ++j) {
            const line = lines[j];

            const setMatch = line.match(/<SET[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
            if (setMatch) {
                obj.jakeAdvSet = $.parseAdvNotetagAction(setMatch[1], true);
                continue;
            }

            const addMatch = line.match(/<ADD[-_ ]?ADV[-_ ]?(?:FIELD|ARRAY):\s*([^>]+)>/i);
            if (addMatch) {
                obj.jakeAdvAdds.push($.parseAdvNotetagAction(addMatch[1], true));
                continue;
            }

            const remAllMatch = line.match(/<REM[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
            if (remAllMatch) {
                obj.jakeAdvRemoveAll.push($.parseAdvNotetagAction(remAllMatch[1], true));
                continue;
            }

            const remMatch = line.match(/<REM(?:OVE)?[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
            if (remMatch) {
                obj.jakeAdvRemoves.push($.parseAdvNotetagAction(remMatch[1], true));
                continue;
            }

            const addTurnsMatch = line.match(/<ADD[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
            if (addTurnsMatch) {
                obj.jakeAdvAddTurns.push($.parseAdvNotetagAction(addTurnsMatch[1], true));
                continue;
            }

            const setTurnsMatch = line.match(/<SET[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
            if (setTurnsMatch) {
                obj.jakeAdvSetTurns.push($.parseAdvNotetagAction(setTurnsMatch[1], true));
            }
        }
    }
};

const Game_Map_processFieldNotetags_Multi = Game_Map.prototype.processFieldNotetags;
Game_Map.prototype.processFieldNotetags = function() {
    Game_Map_processFieldNotetags_Multi.call(this);
    const lines = String($dataMap.note || '').split(/[\r\n]+/);

    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];

        const addMatch = line.match(/<ADD[-_ ]?ADV[-_ ]?(?:FIELD|ARRAY):\s*([^>]+)>/i);
        if (addMatch) {
            const parsed = $.parseAdvNotetagAction(addMatch[1], true);
            const baseFieldId = $.resolveAdvActionToBaseFieldId(parsed);
            if (!$.isValidLoadedFieldId(baseFieldId)) continue;
            if (this.addField(baseFieldId, parsed.turns)) {
                $.runFieldStartEval(baseFieldId);
            }
            continue;
        }

        const remAllMatch = line.match(/<REM[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
        if (remAllMatch) {
            const parsed = $.parseAdvNotetagAction(remAllMatch[1], true);
            const baseFieldId = $.resolveAdvActionToBaseFieldId(parsed);
            if (!$.isValidLoadedFieldId(baseFieldId)) continue;
            const removed = this.removeAllFieldMatches(baseFieldId, parsed.turns);
            for (let r = 0; r < removed.length; ++r) {
                $.evalFieldDestructionForField(removed[r], null, null);
            }
            continue;
        }

        const remMatch = line.match(/<REM(?:OVE)?[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
        if (remMatch) {
            const parsed = $.parseAdvNotetagAction(remMatch[1], true);
            const baseFieldId = $.resolveAdvActionToBaseFieldId(parsed);
            if (!$.isValidLoadedFieldId(baseFieldId)) continue;
            const result = this.removeFirstFieldMatch(baseFieldId, parsed.turns);
            if (result.removed && result.field) {
                $.evalFieldDestructionForField(result.field, null, null);
            }
            continue;
        }

        const addTurnsMatch = line.match(/<ADD[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
        if (addTurnsMatch) {
            const parsed = $.parseAdvNotetagAction(addTurnsMatch[1], true);
            const baseFieldId = $.resolveAdvActionToBaseFieldId(parsed);
            if (!$.isValidLoadedFieldId(baseFieldId)) continue;
            if (!parsed.hasTurns) continue;
            this.addTurnsAllFieldMatches(baseFieldId, parsed.turns);
            continue;
        }

        const setTurnsMatch = line.match(/<SET[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
        if (setTurnsMatch) {
            const parsed = $.parseAdvNotetagAction(setTurnsMatch[1], true);
            const baseFieldId = $.resolveAdvActionToBaseFieldId(parsed);
            if (!$.isValidLoadedFieldId(baseFieldId)) continue;
            if (parsed.turns < 0) continue;
            this.setTurnsAllFieldMatches(baseFieldId, parsed.turns);
        }
    }
};

BattleManager.fields = function() {
    return $gameMap && $gameMap.fields ? $gameMap.fields() : [];
};

BattleManager.field = function() {
    return $gameMap && $gameMap.field ? $gameMap.field() : null;
};

BattleManager.isFieldAffectItem = function(item) {
    if (!item) return false;
    if (!$gameMap.isAnyFieldActive()) return false;
    const fields = this.fields();
    for (let i = 0; i < fields.length; ++i) {
        if (fields[i] && fields[i].isItemAffected(item)) return true;
    }
    return false;
};

BattleManager.isFieldAffectAll = function(item) {
    if (!item) return false;
    if (!$gameMap.isAnyFieldActive()) return false;
    const fields = this.fields();
    for (let i = 0; i < fields.length; ++i) {
        if (fields[i] && fields[i].isAllAffected(item)) return true;
    }
    return false;
};

BattleManager.evalFieldModEval = function(code, value, item, subject, target, errorMessage, sourceField) {
    if (!code) return value;
    if (!errorMessage) errorMessage = 'Failed to evaluate field modification eval:';
    try {
        const field = sourceField || this.field();
        const s = $gameSwitches ? $gameSwitches._data : [];
        const v = $gameVariables ? $gameVariables._data : [];
        const a = subject;
        const user = subject;
        const b = target;
        eval(code);
    } catch (e) {
        console.error(errorMessage);
        console.error(code);
        console.error(e);
    }
    return value;
};

BattleManager.processFieldEffect = function(value, item, subject, target, modType, errorMessage) {
    const fields = this.fields();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!field) continue;
        if (field.isAllAffected(item)) {
            const globalMods = field.getGlobalItemMods(item);
            value = this.evalFieldModEval(globalMods ? globalMods[modType] : '', value, item, subject, target, errorMessage, field);
        }
        if (field.isItemAffected(item)) {
            const itemMods = field.getItemMods(item);
            value = this.evalFieldModEval(itemMods ? itemMods[modType] : '', value, item, subject, target, errorMessage, field);
        }
    }
    return value;
};

BattleManager.evalFieldEval = function(phase) {
    if (!$gameMap.isAnyFieldActive()) return;
    const fields = this.fields();
    for (let i = 0; i < fields.length; ++i) {
        $.evalFieldCodeForField(fields[i], phase, this._subject, this._action ? this._action._item : null);
    }
};

BattleManager.evalFieldItemEval = function(phase) {
    const action = this._action;
    if (!action) return;
    const item = action._item;
    const subject = this._subject;
    const fields = this.fields();

    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!field) continue;
        if (field.isAllAffected(item)) {
            const globalMods = field.getGlobalItemMods(item);
            const code = globalMods && globalMods.evals ? globalMods.evals[phase] : '';
            this.evalFieldModEval(code, 0, item, subject, subject, 'Failed to eval global item eval for phase ' + phase, field);
        }
        if (field.isItemAffected(item)) {
            const itemMods = field.getItemMods(item);
            const code = itemMods && itemMods.evals ? itemMods.evals[phase] : '';
            this.evalFieldModEval(code, 0, item, subject, subject, 'Failed to eval item eval for phase ' + phase, field);
        }
    }
};

BattleManager.displayFieldStartMessage = function() {
    if (!$gameMap.isAnyFieldActive()) return;
    const fields = this.fields();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!field) continue;
        const message = field.getMessage().format(field.getName());
        this.displayFieldMessage(message);
    }
};

BattleManager.displayFieldActionMessage = function() {
    if (!$gameMap.isAnyFieldActive()) return;
    if (!this._action) return;
    const item = this._action._item;
    const fields = this.fields();

    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!field || !field.isItemAffected(item)) continue;
        const mods = field.getItemMods(item);
        const message = mods && mods.message ? mods.message.format(field.getName()) : '';
        this.displayFieldMessage(message);
    }
};

BattleManager.expireField = function() {
    const fields = this.fields();
    if (!fields || fields.length <= 0) return;

    for (let i = fields.length - 1; i >= 0; --i) {
        const field = fields[i];
        if (!field || !field.isExpiring()) continue;
        field.reduceTurnsLeft();
        if (!field.isExpired()) continue;

        $.evalFieldCodeForField(field, 'expiration', this._subject, this._action ? this._action._item : null);
        let nextFieldId = field.expirationFieldId();
        if ($gameSystem.isFieldsAlwaysActive() && nextFieldId === 0) {
            nextFieldId = $gameMap.defaultFieldId();
        }

        if (nextFieldId > 0 && Game_Field.exists(nextFieldId)) {
            fields[i] = new Game_Field(nextFieldId, -1);
            $.runFieldStartEval(nextFieldId, fields[i]);
        } else {
            $.evalFieldDestructionForField(field, this._subject, this._action ? this._action._item : null);
            fields.splice(i, 1);
        }
    }

    $gameMap._syncPrimaryField();
    $.refreshFieldMembers();
};

BattleManager._applyAdvActionList = function(actionList, isRemoveAll, subject, actionItem) {
    if (!actionList || actionList.length <= 0) return;
    for (let i = 0; i < actionList.length; ++i) {
        const entry = actionList[i];
        const baseFieldId = $.resolveAdvActionToBaseFieldId(entry);
        if (!$.isValidLoadedFieldId(baseFieldId)) continue;
        const turns = Number(entry.turns || 0);

        if (isRemoveAll) {
            const removed = $gameMap.removeAllFieldMatches(baseFieldId, turns);
            for (let r = 0; r < removed.length; ++r) {
                $.evalFieldDestructionForField(removed[r], subject, actionItem);
            }
        } else {
            const result = $gameMap.removeFirstFieldMatch(baseFieldId, turns);
            if (result.removed && result.field) {
                $.evalFieldDestructionForField(result.field, subject, actionItem);
            }
        }
    }
};

BattleManager._applyAdvTurnsActionList = function(actionList, isSet) {
    if (!actionList || actionList.length <= 0) return;
    for (let i = 0; i < actionList.length; ++i) {
        const entry = actionList[i];
        const baseFieldId = $.resolveAdvActionToBaseFieldId(entry);
        if (!$.isValidLoadedFieldId(baseFieldId)) continue;
        const turns = Number(entry.turns);
        if (!entry.hasTurns || Number.isNaN(turns)) continue;

        if (isSet) {
            $gameMap.setTurnsAllFieldMatches(baseFieldId, turns);
        } else {
            $gameMap.addTurnsAllFieldMatches(baseFieldId, turns);
        }
    }
};

BattleManager.checkFieldTransform = function() {
    if (!this._action || !this._action.item()) return;
    if (!this._subject) return;
    const item = this._action._item;
    const itemObject = item && item.object ? item.object() : null;

    if (itemObject && itemObject.jakeAdvSet) {
        const baseFieldId = $.resolveAdvActionToBaseFieldId(itemObject.jakeAdvSet);
        if ($.isValidLoadedFieldId(baseFieldId)) {
            $gameMap.setField(baseFieldId, itemObject.jakeAdvSet.turns);
            $.runFieldStartEval(baseFieldId, $gameMap.field());
        }
        return;
    }

    if (itemObject && itemObject.fieldOverride !== null && itemObject.fieldOverride !== undefined) {
        const baseFieldId = Number(itemObject.fieldOverride.fieldId || 0);
        const turns = Number(itemObject.fieldOverride.turns || -1);
        if (baseFieldId > 0 && $.isValidLoadedFieldId(baseFieldId)) {
            $gameMap.setField(baseFieldId, turns);
            $.runFieldStartEval(baseFieldId, $gameMap.field());
        } else {
            $gameMap.setField(0, 0);
        }
        return;
    }

    if (itemObject) {
        this._applyAdvActionList(itemObject.jakeAdvRemoveAll, true, this._subject, item);
        this._applyAdvActionList(itemObject.jakeAdvRemoves, false, this._subject, item);
        this._applyAdvTurnsActionList(itemObject.jakeAdvAddTurns, false);
        this._applyAdvTurnsActionList(itemObject.jakeAdvSetTurns, true);

        const adds = itemObject.jakeAdvAdds || [];
        for (let i = 0; i < adds.length; ++i) {
            const baseFieldId = $.resolveAdvActionToBaseFieldId(adds[i]);
            if (!$.isValidLoadedFieldId(baseFieldId)) continue;
            if ($gameMap.addField(baseFieldId, adds[i].turns)) {
                $.runFieldStartEval(baseFieldId);
            }
        }
    }

    const fields = $gameMap.fields();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!field || !field.isCauseTransform(item)) continue;

        const nextFieldId = field.getTransitionFieldId(item);
        $.evalFieldCodeForField(field, 'transformOut', this._subject, item);

        if (nextFieldId <= 0 || !Game_Field.exists(nextFieldId)) {
            $.evalFieldDestructionForField(field, this._subject, item);
            fields.splice(i, 1);
            i -= 1;
        } else {
            fields[i] = new Game_Field(nextFieldId, -1);
            if (Horsti.FieldEffects.varFieldId > 0) {
                $gameVariables.setValue(Horsti.FieldEffects.varFieldId, nextFieldId);
            }
            $.evalFieldCodeForField(fields[i], 'transformIn', this._subject, item);
        }
    }

    $gameMap._syncPrimaryField();
    $.refreshFieldMembers();
};

Game_Action.prototype.apply = function(target) {
    const errorMessage = 'Failed to evaluate custom field modification eval:';
    const fields = BattleManager.fields ? BattleManager.fields() : [];

    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!field) continue;
        if (field.isAllAffected(this._item)) {
            const gMods = field.getGlobalItemMods(this._item);
            const code = gMods && gMods.evals ? gMods.evals.beforeEval : '';
            BattleManager.evalFieldModEval(code, 0, this._item, this.subject(), target, errorMessage, field);
        }
        if (field.isItemAffected(this._item)) {
            const iMods = field.getItemMods(this._item);
            const code = iMods && iMods.evals ? iMods.evals.beforeEval : '';
            BattleManager.evalFieldModEval(code, 0, this._item, this.subject(), target, errorMessage, field);
        }
    }

    // Base RPG Maker MV apply flow so custom field evals are not duplicated.
    const result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = (result.used && Math.random() >= this.itemHit(target));
    result.evaded = (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) {
        if (this.item().damage.type > 0) {
            result.critical = (Math.random() < this.itemCri(target));
            const value = this.makeDamageValue(target, result.critical);
            this.executeDamage(target, value);
        }
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target);
    }
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!field) continue;
        if (field.isAllAffected(this._item)) {
            const gMods = field.getGlobalItemMods(this._item);
            const code = gMods && gMods.evals ? gMods.evals.afterEval : '';
            BattleManager.evalFieldModEval(code, 0, this._item, this.subject(), target, errorMessage, field);
        }
        if (field.isItemAffected(this._item)) {
            const iMods = field.getItemMods(this._item);
            const code = iMods && iMods.evals ? iMods.evals.afterEval : '';
            BattleManager.evalFieldModEval(code, 0, this._item, this.subject(), target, errorMessage, field);
        }
    }
};

if (Imported.YEP_ElementCore) {
    const Game_Action_getItemElements_Multi = Game_Action.prototype.getItemElements;
    Game_Action.prototype.getItemElements = function() {
        const base = Game_Action_getItemElements_Multi.call(this);
        const fields = BattleManager.fields ? BattleManager.fields() : [];
        let elements = [];

        for (let i = 0; i < fields.length; ++i) {
            const field = fields[i];
            if (!field || !field.isOverrideElements(this._item)) continue;
            const itemMods = field.getItemMods(this._item);
            const globalMods = field.getGlobalItemMods(this._item);
            if (itemMods && itemMods.elementMod) elements = elements.concat(itemMods.elementMod);
            if (globalMods && globalMods.elementMod) elements = elements.concat(globalMods.elementMod);
        }

        if (elements.length <= 0) return base;
        return elements.filter(Horsti.Utils.filterUnique);
    };
} else {
    const Game_Action_calcElementRate_Multi = Game_Action.prototype.calcElementRate;
    Game_Action.prototype.calcElementRate = function(target) {
        const fields = BattleManager.fields ? BattleManager.fields() : [];
        for (let i = fields.length - 1; i >= 0; --i) {
            const field = fields[i];
            if (!field || !field.isOverrideElements(this._item)) continue;
            const itemMods = field.getItemMods(this._item);
            const globalMods = field.getGlobalItemMods(this._item);
            const elementId = (itemMods && itemMods.elementMod.length > 0)
                ? itemMods.elementMod[0]
                : (globalMods && globalMods.elementMod.length > 0 ? globalMods.elementMod[0] : 0);
            if (elementId > 0) return target.elementRate(elementId);
        }
        return Game_Action_calcElementRate_Multi.call(this, target);
    };
}

if (Imported.YEP_AutoPassiveStates) {
    const Game_Actor_passiveStatesRaw_Multi = Game_Actor.prototype.passiveStatesRaw;
    Game_Actor.prototype.passiveStatesRaw = function() {
        this._passiveStatesRaw = Game_Actor_passiveStatesRaw_Multi.call(this);
        if ($gameMap.isAnyFieldActive()) {
            const fields = $gameMap.fields();
            for (let i = 0; i < fields.length; ++i) {
                const field = fields[i];
                if (!field) continue;
                this._passiveStatesRaw = this._passiveStatesRaw.concat(field.globalPassivesRaw());
                this._passiveStatesRaw = this._passiveStatesRaw.concat(field.actorPassivesRaw());
            }
            this._passiveStatesRaw = this._passiveStatesRaw.filter(Yanfly.Util.onlyUnique);
        }
        return this._passiveStatesRaw;
    };

    const Game_Enemy_passiveStatesRaw_Multi = Game_Enemy.prototype.passiveStatesRaw;
    Game_Enemy.prototype.passiveStatesRaw = function() {
        this._passiveStatesRaw = Game_Enemy_passiveStatesRaw_Multi.call(this);
        if ($gameMap.isAnyFieldActive()) {
            const fields = $gameMap.fields();
            for (let i = 0; i < fields.length; ++i) {
                const field = fields[i];
                if (!field) continue;
                this._passiveStatesRaw = this._passiveStatesRaw.concat(field.globalPassivesRaw());
                this._passiveStatesRaw = this._passiveStatesRaw.concat(field.enemyPassivesRaw());
            }
            this._passiveStatesRaw = this._passiveStatesRaw.filter(Yanfly.Util.onlyUnique);
        }
        return this._passiveStatesRaw;
    };
}

//=============================================================================
// Script Calls
//=============================================================================

$.getActiveFieldListSafe = function() {
    if (!$gameMap || !$gameMap.fields) return [];
    const list = $gameMap.fields();
    return Array.isArray(list) ? list : [];
};

$.removeFieldAndRunDestruction = function(removedField) {
    if (!removedField) return false;
    $.evalFieldDestructionForField(removedField, null, null);
    return true;
};

const scriptCallScope = (typeof window !== 'undefined') ? window : globalThis;

scriptCallScope.fieldExists = function(fieldNameOrId) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return false;

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        if ($.doesFieldMatchQuery(fields[i], query)) return true;
    }
    return false;
};

scriptCallScope.fieldCopyCount = function(fieldNameOrId) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return 0;

    const fields = $.getActiveFieldListSafe();
    let count = 0;
    for (let i = 0; i < fields.length; ++i) {
        if ($.doesFieldMatchQuery(fields[i], query)) count += 1;
    }
    return count;
};

scriptCallScope.fieldTurnCount = function(fieldNameOrId) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return 0;

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        if (!field || !field.turnsLeft) return 0;
        return Number(field.turnsLeft() || 0);
    }
    return 0;
};

scriptCallScope.fieldSearch = function(fieldNameOrId) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return -1;

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        if ($.doesFieldMatchQuery(fields[i], query)) return i;
    }
    return -1;
};

scriptCallScope.fieldTurnIsInfinite = function(fieldNameOrId) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return false;

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        if (!field || !field.turnsLeft) return false;
        return Number(field.turnsLeft() || 0) <= 0;
    }
    return false;
};

scriptCallScope.remLastField = function(fieldNameOrId) {
    if (!$gameMap || !$gameMap.removeLastFieldByQuery) return false;
    const removed = $gameMap.removeLastFieldByQuery(fieldNameOrId);
    return $.removeFieldAndRunDestruction(removed);
};

scriptCallScope.remFirstField = function(fieldNameOrId) {
    if (!$gameMap || !$gameMap.removeFirstFieldByQuery) return false;
    const removed = $gameMap.removeFirstFieldByQuery(fieldNameOrId);
    return $.removeFieldAndRunDestruction(removed);
};

scriptCallScope.remFieldAtIndex = function(index) {
    if (!$gameMap || !$gameMap.removeFieldAtIndexClamped) return false;
    const removed = $gameMap.removeFieldAtIndexClamped(index);
    return $.removeFieldAndRunDestruction(removed);
};

const Game_Interpreter_pluginCommand_Multi = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    if (command === 'ShowFieldEffectsInBattle') {
        $gameSystem.setShowFieldEffectsInBattle(true);
        return;
    }

    if (command === 'HideFieldEffectsInBattle') {
        $gameSystem.setShowFieldEffectsInBattle(false);
        return;
    }

    if (command.match(/ADD[-_ ]?ADV[-_ ]?(?:FIELD|ARRAY)(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('AddAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        if ($gameMap.addField(baseFieldId, parsed.turns)) {
            $.runFieldStartEval(baseFieldId);
        }
        return;
    }

    if (command.match(/REM[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('RemAllAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const removed = $gameMap.removeAllFieldMatches(baseFieldId, parsed.turns);
        for (let i = 0; i < removed.length; ++i) {
            $.evalFieldDestructionForField(removed[i], null, null);
        }
        return;
    }

    if (command.match(/REM(?:OVE)?[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('RemAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const result = $gameMap.removeFirstFieldMatch(baseFieldId, parsed.turns);
        if (result.removed && result.field) {
            $.evalFieldDestructionForField(result.field, null, null);
        }
        return;
    }

    if (command.match(/ADD[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('AddTurnsAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        if (!parsed.hasTurns) {
            console.warn('AddTurnsAdvField ignored: missing or invalid turns argument.');
            return;
        }
        $gameMap.addTurnsAllFieldMatches(baseFieldId, parsed.turns);
        return;
    }

    if (command.match(/SET[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('SetTurnsAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        if (parsed.turns < 0) {
            console.warn('SetTurnsAdvField ignored: missing or invalid turns argument.');
            return;
        }
        $gameMap.setTurnsAllFieldMatches(baseFieldId, parsed.turns);
        return;
    }

    Game_Interpreter_pluginCommand_Multi.call(this, command, args);
};

})(JakeMSG.HO_FieldEffects);

}

//=============================================================================
// End of File
//=============================================================================
