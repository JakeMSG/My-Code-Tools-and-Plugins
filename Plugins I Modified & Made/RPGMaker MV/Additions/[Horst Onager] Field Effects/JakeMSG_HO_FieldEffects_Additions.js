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
 * when defined in this plugin's parameters), a new Battle Command to inspect active fields during battle,
 * a Field HUD, Field stacks, Field categories, and more! See the help file for details.
 * REQUIRES: "HO_FieldEffects" plugin!
 * The new Battle Command's description is compatible with "JakeMSG_MoreDescriptionsWithConditions" plugin!
 * @author JakeMSG
 * v1.0
 *
 * ============ Change Log ============
 * 1.0 - 3.10th.2026
 * - initial release
 * ====================================
 * @help
 * ================================================================ Issue Fixes:
 * ================================ Rare black battle background:
 * ================ Fixed a rare case where battleback could turn black, even without using fields.
 *
 * ================================================================ Compatibility:
 * ================================ Old save handling:
 * ================ Old saves from before HO_FieldEffects are handled safely.
 *
 * ================================================================ Parameters Overview:
 * ================================ Battle Command: Field Effects:
 * ==== Field Effects Command Text
 * == Party Command text used to open the field list.
 *
 * ==== Show Field Effects Command
 * == Default visibility of the Party Command.
 * == Runtime toggle plugin commands:
 * ==   ShowFieldEffectsInBattle
 * ==   HideFieldEffectsInBattle
 *
 * ==== Field Effects Window X / Y / Width / Height
 * == Formula-based position and size for the battle field list window.
 *
 * ==== No Fields Icon / Text / Help
 * == Fallback list icon/text/help when no fields are active.
 *
 * ==== Turns Left Text Format
 * == Right-side turns format in the field list. Use %1 for turns.
 *
 * ==== Turns Left Infinite Text
 * == Displayed when turns are non-expiring (0).
 *
 * ================================ Field HUD:
 * ==== Field HUD X / Y
 * == Formula-based HUD anchor for active field icons in battle.
 *
 * ==== Field HUD Layout
 * == Horizontal or Vertical icon arrangement.
 *
 * ==== Field HUD Stacks visual Settings
 * == HUD stack counter overrides only:
 * ==   - Stacks Alignment Override ([NoChange], left, center, right)
 * ==   - Stacks Offset X
 * ==   - Stacks Offset Y
 * == [NoChange] keeps alignment from the resolved non-HUD stack visuals.
 *
 * ================================ AdvFieldEffect additions:
 * ==== Icon
 * == IconSet ID shown in Field Effects list and HUD.
 * == 0 hides this field from list/HUD visuals.
 *
 * ==== Max Copies
 * == Max active copies allowed for this Adv field when using Add operations.
 * == 0 means uncapped.
 *
 * ==== Force Copies to become Stacks
 * == If true, Add operations become +1 stack on first matching copy instead of adding a new copy.
 *
 * ==== Stacks Index for Copy-Stacks conversion
 * == Which stack index receives that +1 when Force Copies to become Stacks is true.
 *
 * ==== Stack X Settings (array)
 * == Stacks work like "Counters" for "YEP_BuffStatesCore", and I've added multiple of them, much like my addition plugin "JakeMSG_YEP_BuffStates_Additions" did for yanfly's plugin. 
 * == This array holds settings for each stack index, and each index can be enabled/disabled independently.
 * == Each enabled stack index enables that stack to be shown visually on the screen, and is initialized to 1 on Field creation.
 * == Per-stack-index settings. First array entry is index 0, second is index 1, etc.
 * == Per entry:
 * ==   - Enable this Stacks Index
 * ==   - Max Stacks (for that index only)
 * ==   - Enable Separate Visual Settings + per-index visual values
 *
 * ================================ Stack visual precedence:
 * == For each stack index, visual resolution order is:
 * ==   global Field Stacks visual Settings
 * ==   -> Adv field Note overrides
 * ==   -> Stack X separate visuals (if enabled for that index)
 * == HUD then applies only HUD alignment override (if not [NoChange]) and HUD offsets.
 *
 * ================================ Adv Field Note visual overrides (AdvFieldEffect -> Note):
 *   <Stacks Font Size: x>
 *   <Stacks Alignment: left>
 *   <Stacks Alignment: center>
 *   <Stacks Alignment: right>
 *   <Stacks Buffer X: +x>
 *   <Stacks Buffer X: -x>
 *   <Stacks Buffer Y: +x>
 *   <Stacks Buffer Y: -x>
 *   <Stacks Text Color: x>
 *
 * ================================ Conditional Description tags:
 * == Description text supports:
 * ==   <Condition: javascript_expression>
 * ==   <Resume>
 * == Text output pauses while condition is false until <Resume>.
 *
 * ================================================================ Advanced Fields:
 * ================================ ID usage:
 * == Adv IDs are local to this plugin and are remapped to internal/base IDs at runtime.
 * == You can use either Adv ID or field name in supported notetags/plugin commands.
 * = There are 20 separate Adv Field lists, but they are all merged into one list,
 * with IDs assigned in order of the parameter list, and ingoring the parameters that are empty/not used.        
 * == SetAdvField supports optional turns overwrite.
 *
 * ================================ Global Notetag integration (GDN):
 * == If JakeMSG_GDN_IavraNoteFilesStandalone is active, Adv Fields can use global notetag key "GDN_Fields", :
 * in its loaded files for Global Notetags, to specify a Global notetag for each Field's "Note" parameter.
 * == The GDN_Fields entry is prepended to each AdvFieldEffect Note before this plugin parses it.
 * == Global ignore behavior follows GDN plugin settings (Global Ignore Notetag).
 *
 * ================================ Field Categories:
 * == Categories are read from each Adv Field's Note with:
 *   <Category: text>
 * == A field can have multiple categories, much like a State can for "YEP_X_StateCategories".
 * == Every active field tracks 3 arrays:
 *   Categories, TempCategories, AllCategories
 * == Categories are the base categories read from the Note, and do not change, except within the current eval when using category mutation functions.
 * == TempCategories are for temporary category additions/removals that only last until the current Field expires or is removed.
 * == Category-based logic uses AllCategories.
 *
 * 
 * ================================ Map notetags:
 *   <AdvField: x>
 *   <AdvField: "Field Name">
 *   <Set Adv Field: x>
 *   <Set Adv Field: x, y>
 *   <Set Adv Field: "Field Name">
 *   <Set Adv Field: "Field Name", y>
 *
 * ================================ Skill/Item notetags:
 * ============ Base Adv operations:
 *   <Set Adv Field: x>
 *   <Set Adv Field: x, y>
 *   <Set Adv Field: "Field Name">
 *   <Set Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: replaces the current primary field with the requested Adv field.
 *   Turns behavior: y > 0 sets expiring turns, y = 0 sets non-expiring, omitted uses default.
 *
 * 
 *   <Add Adv Field: x>
 *   <Add Adv Field: x, y>
 *   <Add Adv Field: "Field Name">
 *   <Add Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: appends a new matching active copy (does not clear existing entries).
 *   Max Copies behavior: if Max Copies > 0 and cap is reached, add is ignored.
 *   Force Copies to become Stacks behavior: when enabled and at least one copy exists,
 *   Add becomes +1 stack on configured conversion stack index instead of appending a copy.
 *
 * 
 *   <Rem Adv Field: x>
 *   <Rem Adv Field: x, y>
 *   <Rem Adv Field: "Field Name">
 *   <Rem Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: affects first matching active entry only.
 *   If y <= 0 or omitted: remove immediately.
 *   If y > 0: reduce turns of first matching expiring entry; remove only if turns drop to <= 0.
 *
 * 
 *   <RemAllAdvField: x>
 *   <RemAllAdvField: x, y>
 *   <RemAllAdvField: "Field Name">
 *   <RemAllAdvField: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: same as Rem Adv Field rules, but applied to all matching entries.
 *
 * 
 *   <Add Turns Adv Field: x, y>
 *   <Add Turns Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: adds y turns to all matching expiring entries. Non-expiring entries are skipped.
 *
 * 
 *   <Set Turns Adv Field: x, y>
 *   <Set Turns Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: sets turns to y on all matching expiring entries. Non-expiring entries are skipped.
 * 
 * 
 * ==== Examples:
 *   <Add Adv Field: "Burning Field", 3>
 *   <Rem Adv Field: 4>
 *   <Add Turns Adv Field: 2, -1>
 *
 * 
 * 
 * 
 * ============ Stack index 0 operations (legacy-compatible):
 *   <StackAdd Adv Field: x>
 *   <StackAdd Adv Field: x, y>
 *   <StackAdd Adv Field: "Field Name">
 *   <StackAdd Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: adds stacks on first matching entry, stack index 0.
 *   y default: +1 when omitted.
 *   Removal behavior: if resulting stack index 0 value <= 0, entry is removed.
 *
 * 
 *   <StackAddAll Adv Field: x>
 *   <StackAddAll Adv Field: x, y>
 *   <StackAddAll Adv Field: "Field Name">
 *   <StackAddAll Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: same as StackAdd, but applied to all matching entries.
 *
 * 
 *   <StacksSet Adv Field: x>
 *   <StacksSet Adv Field: x, y>
 *   <StacksSet Adv Field: "Field Name">
 *   <StacksSet Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: sets stack index 0 directly on first matching entry.
 *   y default: 1 when omitted.
 *   Removal behavior: if y <= 0, entry is removed.
 *
 * 
 *   <StacksSetAll Adv Field: x>
 *   <StacksSetAll Adv Field: x, y>
 *   <StacksSetAll Adv Field: "Field Name">
 *   <StacksSetAll Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: same as StacksSet, but applied to all matching entries.
 * 
 * 
 * ==== Examples:
 *   <StackAdd Adv Field: "Bleed Zone", 2>
 *   <StacksSet Adv Field: 5, 7>
 *   <StacksSetAll Adv Field: "Wind Field", 1>
 *
 * 
 * 
 * 
 * ============ Stack X operations (payload: field, stackIndex, stacks):
 *   <StackXAdd Adv Field: x, i, y>
 *   <StackXAdd Adv Field: "Field Name", i, y>
 *   <StackXAddAll Adv Field: x, i, y>
 *   <StackXAddAll Adv Field: "Field Name", i, y>
 *   <StacksXSet Adv Field: x, i, y>
 *   <StacksXSet Adv Field: "Field Name", i, y>
 *   <StacksXSetAll Adv Field: x, i, y>
 *   <StacksXSetAll Adv Field: "Field Name", i, y>
 * ==== Usage / Behavior:
 *   Behavior: same patterns as stack index 0 operations, but target stack index i.
 *   i is zero-based (0 = first entry in Stack X Settings array).
 *   For Add forms, y defaults to 1 when omitted.
 *   Stack index enable behavior: index must be enabled in Stack X Settings to be usable.
 *   "StackX..." and "StacksX..." notetag spellings are accepted.
 * 
 * 
 * ==== Examples:
 *   <StackXAdd Adv Field: "Storm Field", 1, 3>
 *   <StacksXSet Adv Field: 6, 2, 9>
 *   <StacksXSetAll Adv Field: "Radiant Zone", 3, 1>
 *
 * 
 * 
 * 
 * ============ AuxVal operations:
 *   <AuxValAdd Adv Field: x, y>
 *   <AuxValAdd Adv Field: "Field Name", y>
 *   <AuxValAddAll Adv Field: x, y>
 *   <AuxValAddAll Adv Field: "Field Name", y>
 *   <AuxValSet Adv Field: x, y>
 *   <AuxValSet Adv Field: "Field Name", y>
 *   <AuxValSetAll Adv Field: x, y>
 *   <AuxValSetAll Adv Field: "Field Name", y>
 * ==== Usage / Behavior:
 *   Behavior: applies add/set to first or all matching entries.
 *   Required value: y is required; if missing/invalid, action is ignored.
 *   Display behavior: AuxVal is for background logic only and not rendered as UI text. This value is initialized to 0 on Turn creation.
 * 
 * 
 * ==== Examples:
 *   <AuxValAdd Adv Field: "Heat Zone", 5>
 *   <AuxValSet Adv Field: 3, 0>
 *   <AuxValAddAll Adv Field: "Poison Mist", -2>
 *
 *
 * ============ Category operations:
 *   <Rem Adv Field Category: text>
 *   <Rem Adv Field Category: text, y>
 *   <Add Turns Adv Field Category: text, y>
 *   <Set Turns Adv Field Category: text, y>
 *   <StacksAdd Adv Field Category: text>
 *   <StacksAdd Adv Field Category: text, y>
 *   <StacksSet Adv Field Category: text>
 *   <StacksSet Adv Field Category: text, y>
 *   <StacksXAdd Adv Field Category: text, i, y>
 *   <StacksXSet Adv Field Category: text, i, y>
 * ==== Usage / Behavior:
 *   text = Category name. y is optional for add/set stacks, and defaults to 1 for add and 0 for set when omitted.
 *   Same behavior as non-category forms, except they affect ALL active fields
 *   matching the category via AllCategories.
 *
 *
 * ============ Custom category remove eval:
 *   <Custom Remove Field Category: text>
 *    value += user.level;
 *   </Custom Remove Field Category: text>
 * ==== Usage / Behavior:
 *   Mirrors YEP_X_StateCategories custom remove style.
 *   value starts at 1 and removes that many matching fields.
 *
 * 
 * 
 * 
 * 
 * 
 * ================================ Plugin Commands:
 * ============ Base Adv operations:
 *   SetAdvField x [y]
 *   SetAdvField "Field Name" [y]
 *   AddAdvField x [y]
 *   AddAdvField "Field Name" [y]
 *   RemAdvField x [y]
 *   RemAdvField "Field Name" [y]
 *   RemAllAdvField x [y]
 *   RemAllAdvField "Field Name" [y]
 *   AddTurnsAdvField x y
 *   AddTurnsAdvField "Field Name" y
 *   SetTurnsAdvField x y
 *   SetTurnsAdvField "Field Name" y
 * ==== Usage / Behavior:
 *   Behavior: same as corresponding notetags.
 *   Parsing: quoted names with spaces are supported.
 *   Validation: invalid field ID/name resolves to warning and no action.
 * 
 * 
 * ==== Examples:
 *   SetAdvField "Burning Field" 3
 *   AddAdvField 5
 *   RemAllAdvField "Storm Field" 2
 *
 * 
 * 
 * 
 * ============ Stack index 0 operations:
 *   StackAddAdvField x [y]
 *   StackAddAdvField "Field Name" [y]
 *   StackAddAllAdvField x [y]
 *   StackAddAllAdvField "Field Name" [y]
 *   StacksSetAdvField x [y]
 *   StacksSetAdvField "Field Name" [y]
 *   StacksSetAllAdvField x [y]
 *   StacksSetAllAdvField "Field Name" [y]
 * ==== Usage / Behavior:
 *   y default: 1 when omitted.
 * 
 * 
 * ==== Examples:
 *   StackAddAdvField "Bleed Zone" 2
 *   StacksSetAllAdvField 7 4
 *
 * 
 * 
 * 
 * ============ Stack X operations:
 *   StackXAddAdvField x i [y]
 *   StackXAddAdvField "Field Name" i [y]
 *   StackXAddAllAdvField x i [y]
 *   StackXAddAllAdvField "Field Name" i [y]
 *   StacksXSetAdvField x i [y]
 *   StacksXSetAdvField "Field Name" i [y]
 *   StacksXSetAllAdvField x i [y]
 *   StacksXSetAllAdvField "Field Name" i [y]
 * ==== Usage / Behavior:
 *   i is zero-based stack index. y defaults to 1 for Add/Set forms when omitted.
 *   "StackX..." and "StacksX..." spellings are accepted.
 * 
 * 
 * ==== Examples:
 *   StackXAddAdvField "Storm Field" 1 3
 *   StacksXSetAdvField 6 2 9
 *   StacksXSetAllAdvField "Radiant Zone" 3 1
 *
 * 
 * 
 * 
 * ============ AuxVal operations:
 *   AuxValAddAdvField x y
 *   AuxValAddAdvField "Field Name" y
 *   AuxValSetAdvField x y
 *   AuxValSetAdvField "Field Name" y
 *   AuxValAddAllAdvField x y
 *   AuxValAddAllAdvField "Field Name" y
 *   AuxValSetAllAdvField x y
 *   AuxValSetAllAdvField "Field Name" y
 * ==== Usage / Behavior:
 *   y is required. Missing/invalid y causes no action.
 *   Behavior: applies add/set to first or all matching entries.
 *   Required value: y is required; if missing/invalid, action is ignored.
 *   Display behavior: AuxVal is logic-only and not rendered as UI text.
 *
 * ============ Category operations:
 *   RemAdvFieldCategory text [,y]
 *   AddTurnsAdvFieldCategory text, y
 *   SetTurnsAdvFieldCategory text, y
 *   StacksAddAdvFieldCategory text [,y]
 *   StacksSetAdvFieldCategory text [,y]
 *   StacksXAddAdvFieldCategory text, i [,y]
 *   StacksXSetAdvFieldCategory text, i [,y]
 * ==== Usage / Behavior:
 *   text = Category name. y is optional for add/set stacks, and defaults to 1 for add and 0 for set when omitted.
 *   Same as corresponding category notetags and affects all category matches.
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *
 * ================================================================ Script Calls:
 * ==== Query helpers:
 *   fieldExists(fieldNameOrId)
 *   fieldCopyCount(fieldNameOrId)
 *   fieldTurnCount(fieldNameOrId)
 *   fieldStackCount(fieldNameOrId)          // stack index 0
 *   fieldStackXCount(fieldNameOrId, stackIndex)
 * ======== Usage / Behavior:
 *   fieldAuxValCount(fieldNameOrId)
 *   fieldSearch(fieldNameOrId)
 *   fieldTurnIsInfinite(fieldNameOrId)
 *   Query match behavior: searches active field array from oldest to newest and
 * ======== Examples:
 *   if (fieldExists("Burning Field")) { doSomething(); }
 *   var idx = fieldSearch(4);
 *   var c2 = fieldStackXCount("Storm Field", 2);
 *   returns first-match data unless function name explicitly implies count/all.
 *   fieldStackXCount behavior: returns 0 if stack index is disabled or unavailable.
 *   fieldSearch return: index in active field array, or -1 if not found.
 *
 * ==== Removal helpers:
 * ======== Usage / Behavior:
 *   remLastField([fieldNameOrId])
 *   remFirstField([fieldNameOrId])
 * ======== Examples:
 *   remLastField();
 *   remFirstField("Poison Mist");
 *   remFieldAtIndex(0);
 *   remFieldAtIndex(index)
 *   Behavior: returns true only when an entry is actually removed.
 *   Destruction eval behavior: these removal helpers trigger field destruction eval.
 *
 * ==== Per-active-entry mutation helpers (index in active fields array):
 *   addTurnsFieldAtIndex(index, turns)
 *   addStacksFieldAtIndex(index, stacks)              // stack index 0 wrapper
 *   addStacksXFieldAtIndex(index, stackIndex, stacks)
 *   setStacksFieldAtIndex(index, stacks)              // stack index 0 wrapper
 *   setStacksXFieldAtIndex(index, stackIndex, stacks)
 *   addAuxValFieldAtIndex(index, value)
 *   setAuxValFieldAtIndex(index, value)
 *
 * ==== Category helpers:
 *   tempAddCategToField(fieldNameOrId, categ)
 *   tempAddCategToAllFields(fieldNameOrId, categ)
 *   tempRemCategFromField(fieldNameOrId, categ)
 *   tempRemCategFromAllFields(fieldNameOrId, categ)
 *   categoriesOfFieldIndex(index)
 *   tempCategoriesOfFieldIndex(index)
 *   allCategoriesOfFieldIndex(index)
 * ======== Usage / Behavior:
 *   Index behavior: active-field index is clamped to valid bounds.
 *   addTurnsFieldAtIndex behavior: non-expiring entries (turns 0) are not changed.
 *   Stack removal behavior: if stack index 0 reaches <= 0, entry is removed.
 *   Stack index usability: X variants require enabled Stack X index.
 *   Return behavior: returns true when mutation happened, otherwise false.
 * ======== Examples:
 *   addTurnsFieldAtIndex(0, -1);
 *   addStacksXFieldAtIndex(1, 2, 3);
 *   setAuxValFieldAtIndex(0, 10);
 *
 * ================================================================ Evals:
 * ================================ New eval timing keys in Adv Field Evals:
 *   fieldStart
 *   stackIncrease
 *   stackDecrease
 *
 * ================================ Eval locals:
 * == Standard:
 *   s, v, a, user, b, subject, target, item, actionItem
 * ==== Usage:
 *   Use these like regular HO/YEP eval locals to read game state and action context.
 *
 * == Field-specific snapshot locals:
 *   field / fieldObj
 *   fieldData
 *   fieldId
 *   fieldName
 *   fieldTurnsLeft
 *   fieldStacks                      // stack index 0 snapshot
 *   stacks                           // array snapshot of all stack indices
 *   previousStacks                   // array snapshot of previous stack values
 *   Categories / categories
 *   TempCategories / tempCategories
 *   AllCategories / allCategories
 *   fieldAuxVal / auxVal
 *   fieldMaxCopies / maxCopies
 *   fieldMaxStacks / maxStacks       // derived from stack index 0 settings
 *   fieldForceCopiesToStacks / forceCopiesToStacks
 *   fieldIsExpiring
 * ==== Usage / Behavior:
 *   Snapshot meaning: values above are captured at eval start and do not auto-refresh.
 * ==== Example:
 *   if (fieldIsExpiring && fieldTurnsLeft <= 1) {
 *     // read-only snapshot check
 *   }
 *
 * == Field-specific helper functions:
 *   getFieldName(), setFieldName(name)
 *   getFieldCategories(), getFieldTempCategories(), getFieldAllCategories()
 *   refreshFieldCategories(), hasFieldCategory(category)
 *   addTempFieldCategory(category), removeTempFieldCategory(category)
 *   getFieldTurnsLeft(), setFieldTurnsLeft(n), addFieldTurns(delta), resetFieldTurns()
 *   getFieldStacks(), setFieldStacks(n)               // stack index 0
 *   getFieldStacksX(stackIndex), setFieldStacksX(stackIndex, n)
 *   getPreviousStacks(), getPreviousStacksX(stackIndex)
 *   getFieldAuxVal(), setFieldAuxVal(value), addFieldAuxVal(value)
 *   getFieldMaxCopies(), getFieldMaxStacks(), getFieldForceCopiesToStacks(), isFieldExpiring()
 * ==== Usage / Behavior:
 *   setFieldStacks / setFieldStacksX behavior: applies normal stack rules, including
 *   max stack clamping and index-0 removal when value <= 0.
 *   getFieldMaxStacks behavior: reports stack index 0 max from Stack X Settings.
 *   setFieldAuxVal/addFieldAuxVal behavior: numeric logic-only values (not rendered).
 * ==== Examples:
 *   if (isFieldExpiring()) addFieldTurns(1);
 *   setFieldStacksX(2, getFieldStacksX(2) + 1);
 *   addFieldAuxVal(5);
 *
 * ================================ Eval notes:
 * == Snapshot locals are captured at eval start.
 * == Use getters after mutating values in the same eval.
 * == setFieldName(name) edits the field definition object for that field ID.
 * == Suggested pattern: read with getters when chaining multiple writes in one eval.
 *
 * ======================================
 * Param Declarations
 * ======================================
 * @param data
 * @text --- Advanced Fields ---
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
 * 
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
 * @param advFields1
 * @text AdvFields 1
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields2
 * @text AdvFields 2
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields3
 * @text AdvFields 3
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields4
 * @text AdvFields 4
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields5
 * @text AdvFields 5
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields6
 * @text AdvFields 6
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields7
 * @text AdvFields 7
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields8
 * @text AdvFields 8
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields9
 * @text AdvFields 9
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields10
 * @text AdvFields 10
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields11
 * @text AdvFields 11
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields12
 * @text AdvFields 12
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields13
 * @text AdvFields 13
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields14
 * @text AdvFields 14
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields15
 * @text AdvFields 15
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields16
 * @text AdvFields 16
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields17
 * @text AdvFields 17
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields18
 * @text AdvFields 18
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields19
 * @text AdvFields 19
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param advFields20
 * @text AdvFields 20
 * @parent data
 * @desc List of advanced field definitions appended after base HO fields.
 * @type struct<AdvFieldEffect>[]
 * @default []

 * @param fieldStacksVisualSettings
 * @text --- Field Stacks visual Settings ---
 * @parent data
 * @default

 * @param fieldStacksCounterSize
 * @text Stacks Font Size
 * @parent fieldStacksVisualSettings
 * @type number
 * @min 1
 * @desc The default font size used for field stacks counters.
 * @default 16

 * @param fieldStacksCounterAlign
 * @text Stacks Alignment
 * @parent fieldStacksVisualSettings
 * @type combo
 * @option left
 * @option center
 * @option right
 * @desc How to align the field stack counter text.
 * @default center

 * @param fieldStacksCounterBufferX
 * @text Stacks Buffer X
 * @parent fieldStacksVisualSettings
 * @desc Buffer the x position of the field stack counter by this much.
 * @default 0

 * @param fieldStacksCounterBufferY
 * @text Stacks Buffer Y
 * @parent fieldStacksVisualSettings
 * @desc Buffer the y position of the field stack counter by this much.
 * @default 8

 * @param fieldStacksCounterColor
 * @text Stacks Color
 * @parent fieldStacksVisualSettings
 * @type number
 * @min 0
 * @max 31
 * @desc The default text color used for field stack counters.
 * @default 0

 * @param fieldHud
 * @text --- Field HUD ---
 * @parent generalFieldEffects
 * @default

 * @param fieldEffectsHudX
 * @text Field HUD X
 * @parent fieldHud
 * @desc X position formula for on-screen active Field icons (battle only).
 * @default Graphics.boxWidth / 2

 * @param fieldEffectsHudY
 * @text Field HUD Y
 * @parent fieldHud
 * @desc Y position formula for on-screen active Field icons (battle only).
 * @default 0

 * @param fieldEffectsHudLayout
 * @text Field HUD Layout
 * @parent fieldHud
 * @type select
 * @option Horizontal
 * @value horizontal
 * @option Vertical
 * @value vertical
 * @desc Layout of on-screen active Field icons (battle only).
 * @default horizontal

 * @param fieldHudStacksVisualSettings
 * @text --- Field HUD Stacks visual Settings ---
 * @parent fieldHud
 * @default

 * @param fieldHudStacksCounterAlign
 * @text Stacks Alignment Override
 * @parent fieldHudStacksVisualSettings
 * @type combo
 * @option [NoChange]
 * @value nochange
 * @option left
 * @option center
 * @option right
 * @desc Overwrite HUD stack alignment. [NoChange] keeps alignment from other visual settings.
 * @default nochange

 * @param fieldHudStacksCounterOffsetX
 * @text Stacks Offset X
 * @parent fieldHudStacksVisualSettings
 * @desc Extra X offset for HUD stack text after all other visual settings. Can be negative.
 * @default 0

 * @param fieldHudStacksCounterOffsetY
 * @text Stacks Offset Y
 * @parent fieldHudStacksVisualSettings
 * @desc Extra Y offset for HUD stack text after all other visual settings. Can be negative.
 * @default 0
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
 * @param note
 * @text Note
 * @desc Optional raw note/notetag text. Supports tags like <Category: text>.
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
 * @param maxCopies
 * @text Max Copies
 * @desc Max active copies for this field when using Add operations. 0 = no cap.
 * @type number
 * @min 0
 * @default 0
 *
 * @param forceCopiesToStacks
 * @text Force Copies to become Stacks
 * @desc If true, Add operations become StackAdd +1 on the first matching copy.
 * @type boolean
 * @on True
 * @off False
 * @default false
 *
 * @param stackIndexForCopyStacksConversion
 * @text Stacks Index for Copy-Stacks conversion
 * @parent forceCopiesToStacks
 * @desc If Force Copies to become Stacks is true, copy adds become +1 stacks on this stack index.
 * @type number
 * @min 0
 * @default 0
 *
 * @param stackXSettings
 * @text Stack X Settings
 * @desc Per-index stack settings. First entry is Stacks index 0, second is index 1, and so on.
 * @type struct<AdvStacksXSettings>[]
 * @default ["{\"enabled\":\"false\",\"maxStacks\":\"0\",\"enableSeparateVisualSettings\":\"false\",\"counterSize\":\"16\",\"counterAlign\":\"center\",\"counterBufferX\":\"0\",\"counterBufferY\":\"8\",\"counterColor\":\"0\"}"]
 *
 */

/*~struct~AdvStacksXSettings:
 *
 * @param enabled
 * @text Enable this Stacks Index
 * @desc If true, this stack index is enabled and initializes to 1 on field creation.
 * @type boolean
 * @on True
 * @off False
 * @default false
 *
 * @param maxStacks
 * @text Max Stacks
 * @parent enabled
 * @desc Max stacks for this specific stack index. 0 = no cap.
 * @type number
 * @min 0
 * @default 0
 *
 * @param enableSeparateVisualSettings
 * @text Enable Separate Visual Settings
 * @parent enabled
 * @desc If true, the settings below overwrite this stack index's visual settings.
 * @type boolean
 * @on True
 * @off False
 * @default false
 *
 * @param counterSize
 * @text Stacks Font Size
 * @parent enableSeparateVisualSettings
 * @type number
 * @min 1
 * @default 16
 *
 * @param counterAlign
 * @text Stacks Alignment
 * @parent enableSeparateVisualSettings
 * @type combo
 * @option left
 * @option center
 * @option right
 * @default center
 *
 * @param counterBufferX
 * @text Stacks Buffer X
 * @parent enableSeparateVisualSettings
 * @type number
 * @default 0
 *
 * @param counterBufferY
 * @text Stacks Buffer Y
 * @parent enableSeparateVisualSettings
 * @type number
 * @default 8
 *
 * @param counterColor
 * @text Stacks Color
 * @parent enableSeparateVisualSettings
 * @type number
 * @min 0
 * @max 31
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
 * @param stackIncrease
 * @text Stack Increase
 * @desc This is executed when this field's stacks increase.
 * @type note
 * @default
 *
 * @param stackDecrease
 * @text Stack Decrease
 * @desc This is executed when this field's stacks decrease.
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

$.collectAdvFieldDataBlocks = function() {
    const out = [];
    for (let i = 1; i <= 20; ++i) {
        out.push(parameters['advFields' + i] || '[]');
    }
    // Backward compatibility with projects that still have the old single parameter.
    if (out.every(function(raw) { return String(raw || '[]') === '[]'; })) {
        out[0] = parameters.advFieldData || '[]';
    }
    return out;
};

$.advFieldDataBlocks = $.collectAdvFieldDataBlocks();
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
$.fieldStacksCounterSize = Number(parameters.fieldStacksCounterSize || 16);
$.fieldStacksCounterAlign = String(parameters.fieldStacksCounterAlign || 'center').toLowerCase();
$.fieldStacksCounterBufferX = Number(parameters.fieldStacksCounterBufferX || 0);
$.fieldStacksCounterBufferY = Number(parameters.fieldStacksCounterBufferY || 8);
$.fieldStacksCounterColor = Number(parameters.fieldStacksCounterColor || 0);
$.fieldHudStacksCounterAlign = String(parameters.fieldHudStacksCounterAlign || 'nochange').toLowerCase();
$.fieldHudStacksCounterOffsetX = Number(parameters.fieldHudStacksCounterOffsetX || 0);
$.fieldHudStacksCounterOffsetY = Number(parameters.fieldHudStacksCounterOffsetY || 8);
$.advFieldStartId = 0;
$.advFieldCount = 0;
$.advFieldsLoaded = false;

$.gdnFieldsIntegration = {
    enabled: false,
    loaded: true,
    loading: false,
    files: {},
    data: {},
    ignoreTag: 'GDNignore'
};

$.setupGdnFieldsIntegration = function() {
    const state = $.gdnFieldsIntegration;
    if (state.enabled || state.loading) return;

    if (!Imported.JakeMSG_Alterations_GDN || !Array.isArray($plugins)) {
        state.loaded = true;
        return;
    }

    const gdnPlugin = $plugins.filter(function(p) {
        return p && p.description && String(p.description).indexOf('<Iavra Note Files>') >= 0;
    })[0];

    if (!gdnPlugin || !gdnPlugin.parameters) {
        state.loaded = true;
        return;
    }

    const gdnParams = gdnPlugin.parameters;
    const rawPaths = String(gdnParams['Global File Path'] || '').split(/\s*,\s*/);
    const files = {};
    for (let i = 0; i < rawPaths.length; ++i) {
        const file = String(rawPaths[i] || '').trim();
        if (!file) continue;
        files[file] = false;
    }

    state.ignoreTag = String(gdnParams['Global Ignore Notetag'] || 'GDNignore');
    state.files = files;
    state.data = {};
    state.enabled = true;
    state.loaded = Object.keys(files).length <= 0;
};

$.isGdnFieldsIntegrationReady = function() {
    const state = $.gdnFieldsIntegration;
    if (!state.enabled) return true;
    return !!state.loaded;
};

$.startGdnFieldsIntegrationLoad = function() {
    $.setupGdnFieldsIntegration();
    const state = $.gdnFieldsIntegration;
    if (!state.enabled || state.loaded || state.loading) return;
    state.loading = true;

    const files = Object.keys(state.files);
    if (files.length <= 0) {
        state.loaded = true;
        state.loading = false;
        return;
    }

    const checkDone = function() {
        const keys = Object.keys(state.files);
        for (let i = 0; i < keys.length; ++i) {
            if (!state.files[keys[i]]) return;
        }
        state.loaded = true;
        state.loading = false;
    };

    const onFileLoaded = function(file, text) {
        state.files[file] = true;
        const parsed = JSON.parse(text || '{}');
        for (const key in parsed) {
            if (!Object.prototype.hasOwnProperty.call(parsed, key)) continue;
            const value = parsed[key];
            state.data[key] = Array.isArray(value) ? value.join('\n') : value;
        }
        checkDone();
    };

    for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        const xhr = new XMLHttpRequest();
        xhr.open('GET', file);
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
            onFileLoaded(file, xhr.responseText);
        };
        xhr.onerror = function() {
            throw new Error("There was an error loading the file '" + file + "'.");
        };
        xhr.send();
    }
};

$.prependGdnFieldsGlobalNote = function(noteText) {
    const state = $.gdnFieldsIntegration;
    const note = String(noteText || '');
    if (!state.enabled) return note;

    const ignoreTag = String(state.ignoreTag || 'GDNignore');
    if (ignoreTag) {
        const ignoreRegex = new RegExp('<[ ]*' + ignoreTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[ ]*>');
        if (ignoreRegex.test(note)) return note;
    }

    const prepend = String(state.data.GDN_Fields || '');
    if (!prepend) return note;
    return prepend + "\n" + note;
};

$.normalizeFieldStacksAlign = function(align) {
    const value = String(align || '').toLowerCase();
    return ['left', 'center', 'right'].indexOf(value) >= 0 ? value : 'center';
};

$.defaultFieldStacksVisualSettings = function() {
    const size = Math.max(1, Math.floor(Number($.fieldStacksCounterSize || 16)));
    const align = $.normalizeFieldStacksAlign($.fieldStacksCounterAlign || 'center');
    const bufferX = Math.floor(Number($.fieldStacksCounterBufferX || 0));
    const bufferY = Math.floor(Number($.fieldStacksCounterBufferY || 8));
    const color = Math.max(0, Math.floor(Number($.fieldStacksCounterColor || 0)));
    return {
        size: Number.isFinite(size) ? size : 16,
        align: align,
        bufferX: Number.isFinite(bufferX) ? bufferX : 0,
        bufferY: Number.isFinite(bufferY) ? bufferY : 8,
        color: Number.isFinite(color) ? color : 0
    };
};

$.defaultFieldHudStacksVisualSettings = function() {
    const rawAlign = String($.fieldHudStacksCounterAlign || 'nochange').toLowerCase();
    const alignOverride = ['left', 'center', 'right'].indexOf(rawAlign) >= 0 ? rawAlign : 'nochange';
    const offsetX = Math.floor(Number($.fieldHudStacksCounterOffsetX || 0));
    const offsetY = Math.floor(Number($.fieldHudStacksCounterOffsetY || 8));
    return {
        alignOverride: alignOverride,
        offsetX: Number.isFinite(offsetX) ? offsetX : 0,
        offsetY: Number.isFinite(offsetY) ? offsetY : 8
    };
};

$.cloneFieldStacksVisualSettings = function(settings) {
    const source = settings || {};
    return {
        size: Number(source.size),
        align: String(source.align || ''),
        bufferX: Number(source.bufferX),
        bufferY: Number(source.bufferY),
        color: Number(source.color)
    };
};

$.normalizeFieldStacksVisualSettings = function(settings) {
    const defaults = $.defaultFieldStacksVisualSettings();
    const data = $.cloneFieldStacksVisualSettings(settings || defaults);

    const size = Math.floor(Number(data.size));
    data.size = Number.isFinite(size) && size > 0 ? size : defaults.size;

    data.align = $.normalizeFieldStacksAlign(data.align || defaults.align);

    const bufferX = Math.floor(Number(data.bufferX));
    data.bufferX = Number.isFinite(bufferX) ? bufferX : defaults.bufferX;

    const bufferY = Math.floor(Number(data.bufferY));
    data.bufferY = Number.isFinite(bufferY) ? bufferY : defaults.bufferY;

    const color = Math.floor(Number(data.color));
    data.color = Number.isFinite(color) && color >= 0 ? color : defaults.color;

    return data;
};

$.parseFieldStacksVisualSettings = function(noteText, baseSettings) {
    const settings = $.normalizeFieldStacksVisualSettings(baseSettings || $.defaultFieldStacksVisualSettings());
    const lines = String(noteText || '').split(/[\r\n]+/);

    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        if (!line) continue;

        if (line.match(/<STACKS FONT SIZE:[ ](\d+)>/i)) {
            settings.size = Math.max(1, parseInt(RegExp.$1));
        } else if (line.match(/<STACKS[ ](?:ALIGNMENT|align):[ ](.*)>/i)) {
            settings.align = $.normalizeFieldStacksAlign(RegExp.$1);
        } else if (line.match(/<STACKS BUFFER X:[ ]([\+\-]\d+)>/i)) {
            settings.bufferX = parseInt(RegExp.$1);
        } else if (line.match(/<STACKS BUFFER Y:[ ]([\+\-]\d+)>/i)) {
            settings.bufferY = parseInt(RegExp.$1);
        } else if (line.match(/<STACKS TEXT COLOR:[ ](\d+)>/i)) {
            settings.color = Math.max(0, parseInt(RegExp.$1));
        }
    }

    return $.normalizeFieldStacksVisualSettings(settings);
};

$.splitCsvArgs = function(text) {
    const raw = String(text || '');
    if (!raw) return [];
    const out = [];
    let current = '';
    let quote = '';
    for (let i = 0; i < raw.length; ++i) {
        const ch = raw[i];
        if (quote) {
            if (ch === quote) {
                quote = '';
            } else {
                current += ch;
            }
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
        }
        if (ch === ',') {
            out.push(String(current).trim());
            current = '';
            continue;
        }
        current += ch;
    }
    out.push(String(current).trim());
    return out;
};

$.normalizeFieldCategoryName = function(category) {
    return String(category || '').toUpperCase().trim();
};

$.parseFieldCategoriesFromNote = function(noteText) {
    const lines = String(noteText || '').split(/[\r\n]+/);
    const out = [];
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        if (!line) continue;
        if (line.match(/<CATEGORY:[ ](.*)>/i)) {
            const category = $.normalizeFieldCategoryName(RegExp.$1);
            if (!category || out.contains(category)) continue;
            out.push(category);
        }
    }
    return out;
};

$.syncFieldAllCategories = function(field) {
    if (!field) return [];

    if (!Array.isArray(field.Categories)) {
        field.Categories = Array.isArray(field.categories) ? field.categories.slice() : [];
    }
    if (!Array.isArray(field.TempCategories)) {
        field.TempCategories = Array.isArray(field.tempCategories) ? field.tempCategories.slice() : [];
    }

    const categories = [];
    const pushCategory = function(rawCategory) {
        const category = $.normalizeFieldCategoryName(rawCategory);
        if (!category || categories.contains(category)) return;
        categories.push(category);
    };

    for (let i = 0; i < field.Categories.length; ++i) {
        pushCategory(field.Categories[i]);
    }
    for (let i = 0; i < field.TempCategories.length; ++i) {
        pushCategory(field.TempCategories[i]);
    }

    field.Categories = field.Categories.map($.normalizeFieldCategoryName).filter(function(c) { return !!c; }).filter(function(c, i, arr) { return arr.indexOf(c) === i; });
    field.TempCategories = field.TempCategories.map($.normalizeFieldCategoryName).filter(function(c) { return !!c; }).filter(function(c, i, arr) { return arr.indexOf(c) === i; });
    field.AllCategories = categories;

    field.categories = field.Categories;
    field.tempCategories = field.TempCategories;
    field.allCategories = field.AllCategories;
    return field.AllCategories;
};

$.ensureFieldCategoryState = function(field) {
    if (!field) return;

    if ((!Array.isArray(field.Categories) || field.Categories.length <= 0) && field.object) {
        const data = field.object();
        if (data && Array.isArray(data.Categories)) {
            field.Categories = data.Categories.slice();
        }
    }

    if (!Array.isArray(field.Categories) && Array.isArray(field.categories)) {
        field.Categories = field.categories.slice();
    }
    if (!Array.isArray(field.Categories)) field.Categories = [];
    if (!Array.isArray(field.TempCategories) && Array.isArray(field.tempCategories)) {
        field.TempCategories = field.tempCategories.slice();
    }
    if (!Array.isArray(field.TempCategories)) field.TempCategories = [];

    $.syncFieldAllCategories(field);
};

$.fieldHasCategory = function(field, category) {
    if (!field) return false;
    $.ensureFieldCategoryState(field);
    const normalized = $.normalizeFieldCategoryName(category);
    if (!normalized) return false;
    return field.AllCategories.contains(normalized);
};

$.parseAdvCategoryAction = function(payload, allowTurns) {
    const tokens = $.splitCsvArgs(payload);
    const out = {
        category: '',
        turns: 0,
        hasTurns: false
    };
    if (tokens.length <= 0) return out;

    out.category = $.normalizeFieldCategoryName(tokens[0]);
    if (allowTurns && tokens.length >= 2) {
        const parsedTurns = Number(tokens[1]);
        if (!Number.isNaN(parsedTurns)) {
            out.turns = parsedTurns;
            out.hasTurns = true;
        }
    }
    return out;
};

$.parseAdvStackXCategoryAction = function(payload, allowStacks) {
    const tokens = $.splitCsvArgs(payload);
    const out = {
        category: '',
        stackIndex: 0,
        turns: 1,
        hasTurns: false
    };
    if (tokens.length <= 0) return out;

    out.category = $.normalizeFieldCategoryName(tokens[0]);
    if (tokens.length >= 2) {
        out.stackIndex = $.normalizeStacksIndex(tokens[1]);
    }
    if (allowStacks && tokens.length >= 3) {
        const parsedStacks = Number(tokens[2]);
        if (!Number.isNaN(parsedStacks)) {
            out.turns = parsedStacks;
            out.hasTurns = true;
        }
    }
    return out;
};

$.parseAdvStacksXSetting = function(rawSetting, index) {
    const settingObj = (rawSetting === undefined || rawSetting === null || rawSetting === '')
        ? {}
        : (Horsti.Utils.parseJson(rawSetting) || {});
    const defaults = $.defaultFieldStacksVisualSettings();
    const enabled = String(settingObj && settingObj.enabled || 'false') === 'true';
    const maxStacks = Math.max(0, Horsti.FieldEffects.parseNumber(settingObj && settingObj.maxStacks, 0));
    const separateVisual = String(settingObj && settingObj.enableSeparateVisualSettings || 'false') === 'true';
    const visual = {
        size: Math.max(1, Horsti.FieldEffects.parseNumber(settingObj && settingObj.counterSize, defaults.size)),
        align: $.normalizeFieldStacksAlign(settingObj && settingObj.counterAlign || defaults.align),
        bufferX: Horsti.FieldEffects.parseNumber(settingObj && settingObj.counterBufferX, defaults.bufferX),
        bufferY: Horsti.FieldEffects.parseNumber(settingObj && settingObj.counterBufferY, defaults.bufferY),
        color: Math.max(0, Horsti.FieldEffects.parseNumber(settingObj && settingObj.counterColor, defaults.color))
    };

    return {
        index: Math.max(0, Math.floor(Number(index || 0))),
        enabled: enabled,
        maxStacks: maxStacks,
        separateVisual: separateVisual,
        visual: $.normalizeFieldStacksVisualSettings(visual)
    };
};

$.parseAdvStacksXSettingsList = function(rawSettings) {
    if (rawSettings === undefined || rawSettings === null || rawSettings === '') return [];
    const parsed = Horsti.Utils.parseJson(rawSettings);
    if (!Array.isArray(parsed)) return [];
    const out = [];
    for (let i = 0; i < parsed.length; ++i) {
        out[i] = $.parseAdvStacksXSetting(parsed[i], i);
    }
    return out;
};

$.getFieldStacksXSettingData = function(fieldId, stackIndex) {
    const fieldData = $dataFields && $dataFields[fieldId] ? $dataFields[fieldId] : null;
    const list = fieldData && Array.isArray(fieldData.stackXSettings) ? fieldData.stackXSettings : [];
    const index = Math.max(0, Math.floor(Number(stackIndex || 0)));
    return list[index] || null;
};

$.isFieldStacksXEnabled = function(fieldId, stackIndex) {
    const index = Math.max(0, Math.floor(Number(stackIndex || 0)));
    if (index === 0) return true;
    const setting = $.getFieldStacksXSettingData(fieldId, index);
    return !!(setting && setting.enabled);
};

$.fieldMaxStacksAtIndex = function(fieldId, stackIndex) {
    const index = Math.max(0, Math.floor(Number(stackIndex || 0)));
    const setting = $.getFieldStacksXSettingData(fieldId, index);
    if (!setting) return 0;
    if (index > 0 && !setting.enabled) return 0;
    return Math.max(0, Math.floor(Number(setting.maxStacks || 0)));
};

$.fieldCopyToStacksIndex = function(fieldId) {
    const fieldData = $dataFields && $dataFields[fieldId] ? $dataFields[fieldId] : null;
    const raw = Math.floor(Number(fieldData && fieldData.stackIndexForCopyStacksConversion || 0));
    if (!Number.isFinite(raw) || raw < 0) return 0;
    return raw;
};

$.oliviaTooltipPinPluginNames = [
    'JakeMSG_Olivia_StateTooltipDisplay_Additions'
];

$.isOliviaTooltipPinAdditionsEnabled = function() {
    if (!Imported.Olivia_StateOlivia_StateTooltipDisplay) return false;
    if (!Imported.JakeMSG_Olivia_StateTooltipDisplay_Additions) return false;
    if (!Array.isArray($plugins)) return false;
    for (let i = 0; i < $plugins.length; ++i) {
        const entry = $plugins[i];
        if (!entry || !entry.status) continue;
        const name = String(entry.name || '');
        if ($.oliviaTooltipPinPluginNames.indexOf(name) >= 0) {
            return true;
        }
    }
    return false;
};

$.getOliviaTooltipPinKeyCode = function() {
    let params = null;
    for (let i = 0; i < $.oliviaTooltipPinPluginNames.length; ++i) {
        const pluginName = $.oliviaTooltipPinPluginNames[i];
        const candidate = PluginManager.parameters(pluginName);
        if (candidate && Object.keys(candidate).length > 0) {
            params = candidate;
            break;
        }
    }
    const keyCode = Number(params && params['Alt-key for Pinning Tooltip']);
    return Number.isFinite(keyCode) ? keyCode : 79;
};

$.fieldHudTooltipWindow = function() {
    const scene = SceneManager._scene;
    if (!scene || !scene._stateIconTooltipWindow) return null;
    return scene._stateIconTooltipWindow;
};

$.canPinFieldHudTooltip = function() {
    if (!$.isOliviaTooltipPinAdditionsEnabled()) return false;
    const tooltipWindow = $.fieldHudTooltipWindow();
    if (!tooltipWindow || !tooltipWindow.visible) return false;
    const host = tooltipWindow._targetHost;
    return !!(host && host._fieldEffectData);
};

$.pinFieldHudTooltip = function() {
    const tooltipWindow = $.fieldHudTooltipWindow();
    if (!tooltipWindow) return;
    tooltipWindow._pinned = true;
};

$.fieldMaxCopies = function(fieldId) {
    const fieldData = $dataFields && $dataFields[fieldId] ? $dataFields[fieldId] : null;
    const maxCopies = Math.floor(Number(fieldData && fieldData.maxCopies || 0));
    if (!Number.isFinite(maxCopies) || maxCopies < 0) return 0;
    return maxCopies;
};

$.fieldMaxStacks = function(fieldId) {
    return $.fieldMaxStacksAtIndex(fieldId, 0);
};

$.fieldForceCopiesToStacks = function(fieldId) {
    const fieldData = $dataFields && $dataFields[fieldId] ? $dataFields[fieldId] : null;
    return !!(fieldData && fieldData.forceCopiesToStacks);
};

$.normalizeStacksValue = function(value) {
    const parsed = Math.floor(Number(value));
    if (!Number.isFinite(parsed)) return 0;
    return parsed;
};

$.normalizeStacksIndex = function(index) {
    const parsed = Math.floor(Number(index));
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
};

$.ensureFieldStackState = function(field) {
    if (!field) return;
    if (!Array.isArray(field._stacks)) {
        if (field._stacks === undefined || field._stacks === null || Number.isNaN(Number(field._stacks))) {
            field._stacks = [1];
        } else {
            field._stacks = [$.normalizeStacksValue(field._stacks)];
        }
    }
    if (!Array.isArray(field._previousStacks)) {
        if (field._previousStacks === undefined || field._previousStacks === null || Number.isNaN(Number(field._previousStacks))) {
            field._previousStacks = [0];
        } else {
            field._previousStacks = [$.normalizeStacksValue(field._previousStacks)];
        }
    }

    if (field._auxVal === undefined || field._auxVal === null || Number.isNaN(Number(field._auxVal))) {
        field._auxVal = 0;
    }

    for (let i = 0; i < field._stacks.length; ++i) {
        if (field._stacks[i] !== undefined) {
            field._stacks[i] = $.normalizeStacksValue(field._stacks[i]);
        }
    }
    for (let i = 0; i < field._previousStacks.length; ++i) {
        if (field._previousStacks[i] !== undefined) {
            field._previousStacks[i] = $.normalizeStacksValue(field._previousStacks[i]);
        }
    }

    field._stacks[0] = field._stacks[0] === undefined ? 1 : $.normalizeStacksValue(field._stacks[0]);
    field._previousStacks[0] = field._previousStacks[0] === undefined ? 0 : $.normalizeStacksValue(field._previousStacks[0]);

    const fieldId = field.fieldId ? Number(field.fieldId() || 0) : 0;
    if (fieldId > 0) {
        const fieldData = $dataFields && $dataFields[fieldId] ? $dataFields[fieldId] : null;
        const settings = fieldData && Array.isArray(fieldData.stackXSettings) ? fieldData.stackXSettings : [];
        for (let i = 1; i < settings.length; ++i) {
            const setting = settings[i];
            if (!setting || !setting.enabled) continue;
            if (field._stacks[i] === undefined || field._stacks[i] === null || Number.isNaN(Number(field._stacks[i]))) {
                field._stacks[i] = 1;
            }
            if (field._previousStacks[i] === undefined || field._previousStacks[i] === null || Number.isNaN(Number(field._previousStacks[i]))) {
                field._previousStacks[i] = 0;
            }
            field._stacks[i] = $.normalizeStacksForFieldIndex(field, i, field._stacks[i]);
            field._previousStacks[i] = $.normalizeStacksValue(field._previousStacks[i]);
        }
    }

    field._auxVal = Number(field._auxVal || 0);
};

$.isFieldStacksIndexUsable = function(field, stackIndex) {
    if (!field || !field.fieldId) return false;
    const index = $.normalizeStacksIndex(stackIndex);
    if (index === 0) return true;
    return $.isFieldStacksXEnabled(field.fieldId(), index);
};

$.getFieldStacksX = function(field, stackIndex) {
    if (!field) return 0;
    $.ensureFieldStackState(field);
    const index = $.normalizeStacksIndex(stackIndex);
    if (!$.isFieldStacksIndexUsable(field, index)) return 0;
    return Number(field._stacks[index] || 0);
};

$.getFieldStacks = function(field) {
    return $.getFieldStacksX(field, 0);
};

$.getFieldStacksAll = function(field) {
    if (!field) return [];
    $.ensureFieldStackState(field);
    const out = [];
    const length = Math.max(field._stacks.length, field._previousStacks.length);
    for (let i = 0; i < length; ++i) {
        out[i] = $.getFieldStacksX(field, i);
    }
    return out;
};

$.getFieldPreviousStacksX = function(field, stackIndex) {
    if (!field) return 0;
    $.ensureFieldStackState(field);
    const index = $.normalizeStacksIndex(stackIndex);
    if (!$.isFieldStacksIndexUsable(field, index)) return 0;
    return Number(field._previousStacks[index] || 0);
};

$.getFieldPreviousStacks = function(field) {
    return $.getFieldPreviousStacksX(field, 0);
};

$.getFieldPreviousStacksAll = function(field) {
    if (!field) return [];
    $.ensureFieldStackState(field);
    const out = [];
    const length = Math.max(field._stacks.length, field._previousStacks.length);
    for (let i = 0; i < length; ++i) {
        out[i] = $.getFieldPreviousStacksX(field, i);
    }
    return out;
};

$.getFieldAuxVal = function(field) {
    if (!field) return 0;
    $.ensureFieldStackState(field);
    return Number(field._auxVal || 0);
};

$.setFieldAuxVal = function(field, value) {
    if (!field) return 0;
    $.ensureFieldStackState(field);
    const parsed = Number(value);
    field._auxVal = Number.isNaN(parsed) ? $.getFieldAuxVal(field) : parsed;
    return field._auxVal;
};

$.addFieldAuxVal = function(field, value) {
    return $.setFieldAuxVal(field, $.getFieldAuxVal(field) + Number(value || 0));
};

$.normalizeStacksForFieldIndex = function(field, stackIndex, stacks) {
    const normalized = $.normalizeStacksValue(stacks);
    if (!field || !field.fieldId) return normalized;
    const index = $.normalizeStacksIndex(stackIndex);
    if (!$.isFieldStacksIndexUsable(field, index)) return 0;
    const maxStacks = $.fieldMaxStacksAtIndex(field.fieldId(), index);
    if (maxStacks > 0) return Math.min(normalized, maxStacks);
    return normalized;
};

$.normalizeStacksForField = function(field, stacks) {
    return $.normalizeStacksForFieldIndex(field, 0, stacks);
};

$.activeFieldCopyCount = function(fieldId) {
    if (!$gameMap || !$gameMap.fields) return 0;
    const list = $gameMap.fields();
    if (!Array.isArray(list) || list.length <= 0) return 0;

    let count = 0;
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (field && field.fieldId && Number(field.fieldId()) === Number(fieldId)) {
            count += 1;
        }
    }
    return count;
};

$.canAddFieldCopy = function(fieldId) {
    const maxCopies = $.fieldMaxCopies(fieldId);
    if (maxCopies <= 0) return true;
    return $.activeFieldCopyCount(fieldId) < maxCopies;
};

$.addFieldRespectingMaxCopies = function(fieldId, turns, subject, item) {
    if (!$gameMap || !$gameMap.addField) return false;
    const hasExistingCopy = $.activeFieldCopyCount(fieldId) > 0;
    if ($.fieldForceCopiesToStacks(fieldId) && hasExistingCopy && $gameMap.addStacksFirstFieldMatch) {
        const stacksIndex = $.fieldCopyToStacksIndex(fieldId);
        const result = $gameMap.addStacksXFirstFieldMatch(fieldId, stacksIndex, 1, subject || null, item || null);
        return !!(result && result.changed > 0);
    }
    if (!$.canAddFieldCopy(fieldId)) return false;
    return $gameMap.addField(fieldId, turns);
};

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
            evals.stackIncrease = '';
            evals.stackDecrease = '';
            return evals;
        }

        evals = Horsti.FieldEffects.parseFieldEvals(raw) || {};
        evalsData = Horsti.Utils.parseJson(raw);
    }

    evals.fieldStart = Horsti.FieldEffects.parseNote(evalsData ? evalsData.fieldStart : null);
    evals.stackIncrease = Horsti.FieldEffects.parseNote(evalsData ? evalsData.stackIncrease : null);
    evals.stackDecrease = Horsti.FieldEffects.parseNote(evalsData ? evalsData.stackDecrease : null);
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
    $.ensureFieldCategoryState(fieldObj);
    $.ensureFieldStackState(fieldObj);

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

    const getFieldStacks = function() {
        return $.getFieldStacks(fieldObj);
    };

    const getFieldStacksX = function(stackIndex) {
        return $.getFieldStacksX(fieldObj, stackIndex);
    };

    const getFieldStacksArray = function() {
        return $.getFieldStacksAll(fieldObj);
    };

    const getPreviousStacks = function() {
        return $.getFieldPreviousStacks(fieldObj);
    };

    const getPreviousStacksX = function(stackIndex) {
        return $.getFieldPreviousStacksX(fieldObj, stackIndex);
    };

    const getPreviousStacksArray = function() {
        return $.getFieldPreviousStacksAll(fieldObj);
    };

    const getFieldMaxCopies = function() {
        return $.fieldMaxCopies(fieldId);
    };

    const getFieldMaxStacks = function() {
        return $.fieldMaxStacks(fieldId);
    };

    const getFieldForceCopiesToStacks = function() {
        return $.fieldForceCopiesToStacks(fieldId);
    };

    const setFieldStacks = function(stacks) {
        if (!fieldObj) return 0;
        const result = $.processFieldStacksXChange(fieldObj, 0, stacks, subject || null, item || null);
        if (result.removed && $gameMap && $gameMap.fields && $gameMap._removeAtIndex) {
            const list = $gameMap.fields();
            const index = list.indexOf(fieldObj);
            if (index >= 0) {
                const removed = $gameMap._removeAtIndex(index);
                if (removed) {
                    $.evalFieldDestructionForField(removed, subject || null, item || null);
                }
            }
            return 0;
        }
        return $.getFieldStacks(fieldObj);
    };

    const setFieldStacksX = function(stackIndex, stacks) {
        if (!fieldObj) return 0;
        const result = $.processFieldStacksXChange(fieldObj, stackIndex, stacks, subject || null, item || null);
        if (result.removed && $gameMap && $gameMap.fields && $gameMap._removeAtIndex) {
            const list = $gameMap.fields();
            const index = list.indexOf(fieldObj);
            if (index >= 0) {
                const removed = $gameMap._removeAtIndex(index);
                if (removed) {
                    $.evalFieldDestructionForField(removed, subject || null, item || null);
                }
            }
            return 0;
        }
        return $.getFieldStacksX(fieldObj, stackIndex);
    };

    const getFieldAuxVal = function() {
        return $.getFieldAuxVal(fieldObj);
    };

    const setFieldAuxVal = function(value) {
        return $.setFieldAuxVal(fieldObj, value);
    };

    const addFieldAuxVal = function(value) {
        return $.addFieldAuxVal(fieldObj, value);
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

    const getFieldCategories = function() {
        $.ensureFieldCategoryState(fieldObj);
        return fieldObj ? fieldObj.Categories : [];
    };

    const getFieldTempCategories = function() {
        $.ensureFieldCategoryState(fieldObj);
        return fieldObj ? fieldObj.TempCategories : [];
    };

    const getFieldAllCategories = function() {
        $.ensureFieldCategoryState(fieldObj);
        return fieldObj ? fieldObj.AllCategories : [];
    };

    const refreshFieldCategories = function() {
        $.ensureFieldCategoryState(fieldObj);
        return getFieldAllCategories();
    };

    const hasFieldCategory = function(category) {
        return $.fieldHasCategory(fieldObj, category);
    };

    const addTempFieldCategory = function(category) {
        if (!fieldObj || !fieldObj.tempAddCategory) return false;
        return fieldObj.tempAddCategory(category);
    };

    const removeTempFieldCategory = function(category) {
        if (!fieldObj || !fieldObj.tempRemoveCategory) return false;
        return fieldObj.tempRemoveCategory(category);
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
        fieldStacks: getFieldStacks(),
        stacks: getFieldStacksArray(),
        previousStacks: getPreviousStacksArray(),
        Categories: getFieldCategories(),
        TempCategories: getFieldTempCategories(),
        AllCategories: getFieldAllCategories(),
        categories: getFieldCategories(),
        tempCategories: getFieldTempCategories(),
        allCategories: getFieldAllCategories(),
        fieldAuxVal: getFieldAuxVal(),
        auxVal: getFieldAuxVal(),
        fieldMaxCopies: getFieldMaxCopies(),
        maxCopies: getFieldMaxCopies(),
        fieldMaxStacks: getFieldMaxStacks(),
        maxStacks: getFieldMaxStacks(),
        fieldForceCopiesToStacks: getFieldForceCopiesToStacks(),
        forceCopiesToStacks: getFieldForceCopiesToStacks(),
        fieldIsExpiring: isFieldExpiring(),
        getFieldName: refreshFieldName,
        setFieldName: setFieldName,
        getFieldCategories: getFieldCategories,
        getFieldTempCategories: getFieldTempCategories,
        getFieldAllCategories: getFieldAllCategories,
        refreshFieldCategories: refreshFieldCategories,
        hasFieldCategory: hasFieldCategory,
        addTempFieldCategory: addTempFieldCategory,
        removeTempFieldCategory: removeTempFieldCategory,
        getFieldTurnsLeft: getFieldTurnsLeft,
        setFieldTurnsLeft: setFieldTurnsLeft,
        addFieldTurns: addFieldTurns,
        resetFieldTurns: resetFieldTurns,
        getFieldStacks: getFieldStacks,
        getFieldStacksX: getFieldStacksX,
        getPreviousStacks: getPreviousStacks,
        getPreviousStacksX: getPreviousStacksX,
        setFieldStacks: setFieldStacks,
        setFieldStacksX: setFieldStacksX,
        getFieldAuxVal: getFieldAuxVal,
        setFieldAuxVal: setFieldAuxVal,
        addFieldAuxVal: addFieldAuxVal,
        getFieldMaxCopies: getFieldMaxCopies,
        getFieldMaxStacks: getFieldMaxStacks,
        getFieldForceCopiesToStacks: getFieldForceCopiesToStacks,
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
        const fieldId = context.fieldId;
        const fieldData = context.fieldData;
        const fieldName = context.fieldName;
        const fieldTurnsLeft = context.fieldTurnsLeft;
        const fieldStacks = context.fieldStacks;
        const stacks = context.stacks;
        const previousStacks = context.previousStacks;
        const Categories = context.Categories;
        const TempCategories = context.TempCategories;
        const AllCategories = context.AllCategories;
        const categories = context.categories;
        const tempCategories = context.tempCategories;
        const allCategories = context.allCategories;
        const fieldAuxVal = context.fieldAuxVal;
        const auxVal = context.auxVal;
        const fieldMaxCopies = context.fieldMaxCopies;
        const maxCopies = context.maxCopies;
        const fieldMaxStacks = context.fieldMaxStacks;
        const maxStacks = context.maxStacks;
        const fieldForceCopiesToStacks = context.fieldForceCopiesToStacks;
        const forceCopiesToStacks = context.forceCopiesToStacks;
        const fieldIsExpiring = context.fieldIsExpiring;
        const getFieldName = context.getFieldName;
        const setFieldName = context.setFieldName;
        const getFieldCategories = context.getFieldCategories;
        const getFieldTempCategories = context.getFieldTempCategories;
        const getFieldAllCategories = context.getFieldAllCategories;
        const refreshFieldCategories = context.refreshFieldCategories;
        const hasFieldCategory = context.hasFieldCategory;
        const addTempFieldCategory = context.addTempFieldCategory;
        const removeTempFieldCategory = context.removeTempFieldCategory;
        const getFieldTurnsLeft = context.getFieldTurnsLeft;
        const setFieldTurnsLeft = context.setFieldTurnsLeft;
        const addFieldTurns = context.addFieldTurns;
        const resetFieldTurns = context.resetFieldTurns;
        const getFieldStacks = context.getFieldStacks;
        const getFieldStacksX = context.getFieldStacksX;
        const getPreviousStacks = context.getPreviousStacks;
        const getPreviousStacksX = context.getPreviousStacksX;
        const setFieldStacks = context.setFieldStacks;
        const setFieldStacksX = context.setFieldStacksX;
        const getFieldAuxVal = context.getFieldAuxVal;
        const setFieldAuxVal = context.setFieldAuxVal;
        const addFieldAuxVal = context.addFieldAuxVal;
        const getFieldMaxCopies = context.getFieldMaxCopies;
        const getFieldMaxStacks = context.getFieldMaxStacks;
        const getFieldForceCopiesToStacks = context.getFieldForceCopiesToStacks;
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

$.parseSetAdvFieldStacksXArgs = function(args) {
    const out = {
        fieldArg: '',
        stackIndex: 0,
        stacks: 1,
        hasStacks: false
    };
    if (!args || args.length <= 0) return out;

    const first = String(args[0] || '');
    if (!first) return out;

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
        out.stackIndex = $.normalizeStacksIndex(args[nextIndex]);
        nextIndex += 1;
    }

    if (nextIndex < args.length) {
        const parsedStacks = Number(args[nextIndex]);
        if (!Number.isNaN(parsedStacks)) {
            out.stacks = parsedStacks;
            out.hasStacks = true;
        }
    }

    return out;
};

$.parseSetAdvFieldCategoryArgs = function(args) {
    const out = {
        category: '',
        turns: 0,
        hasTurns: false
    };
    if (!args || args.length <= 0) return out;
    const first = String(args[0] || '');
    if (!first) return out;

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
        out.category = $.normalizeFieldCategoryName(value);
    } else {
        out.category = $.normalizeFieldCategoryName(first.replace(/,$/, ''));
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

$.parseSetAdvFieldCategoryStacksXArgs = function(args) {
    const out = {
        category: '',
        stackIndex: 0,
        stacks: 1,
        hasStacks: false
    };
    if (!args || args.length <= 0) return out;
    const first = String(args[0] || '');
    if (!first) return out;

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
        out.category = $.normalizeFieldCategoryName(value);
    } else {
        out.category = $.normalizeFieldCategoryName(first.replace(/,$/, ''));
    }

    if (nextIndex < args.length) {
        out.stackIndex = $.normalizeStacksIndex(args[nextIndex]);
        nextIndex += 1;
    }

    if (nextIndex < args.length) {
        const parsedStacks = Number(args[nextIndex]);
        if (!Number.isNaN(parsedStacks)) {
            out.stacks = parsedStacks;
            out.hasStacks = true;
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
    if (!$.isGdnFieldsIntegrationReady()) return false;
    // HO_FieldEffects recreates $dataFields during database load checks.
    // Re-append Adv fields every successful pass so they are not lost.
    this.loadAdvFields($.advFieldDataBlocks);
    $.advFieldsLoaded = true;
    return true;
};

const DataManager_loadDatabase_AdvFields = DataManager.loadDatabase;
DataManager.loadDatabase = function() {
    $.startGdnFieldsIntegrationLoad();
    DataManager_loadDatabase_AdvFields.call(this);
};

DataManager.loadAdvFields = function(rawFieldDataBlocks) {
    const blocks = Array.isArray(rawFieldDataBlocks) ? rawFieldDataBlocks : [rawFieldDataBlocks];
    const mergedFieldData = [];

    for (let b = 0; b < blocks.length; ++b) {
        const rawFieldData = blocks[b];
        if (!rawFieldData) continue;
        const fieldData = Horsti.Utils.parseJson(rawFieldData);
        if (!fieldData || !Array.isArray(fieldData) || fieldData.length <= 0) {
            continue;
        }
        for (let i = 0; i < fieldData.length; ++i) {
            mergedFieldData.push(fieldData[i]);
        }
    }

    if (mergedFieldData.length <= 0) return;

    // Keep Adv IDs appended to base IDs by index.
    // Example: base IDs 1..9 and Adv ID 9 => internal/base ID 18.
    $.advFieldStartId = $dataFields.length;
    $.advFieldCount = mergedFieldData.length;

    for (let i = 0; i < mergedFieldData.length; ++i) {
        const data = mergedFieldData[i];
        if (!data) {
            $dataFields.push(null);
            continue;
        }
        try {
            const fieldDataObj = Horsti.Utils.parseJson(data);
            const rawFieldNote = $.prependGdnFieldsGlobalNote(Horsti.FieldEffects.parseNote(fieldDataObj.note));
            const parsedCategories = $.parseFieldCategoriesFromNote(rawFieldNote);
            const field = {
                id: $dataFields.length,
                name: Horsti.FieldEffects.parseString(fieldDataObj.name),
                message: Horsti.FieldEffects.parseNote(fieldDataObj.message),
                icon: Horsti.FieldEffects.parseNumber(fieldDataObj.icon, 0),
                maxCopies: Math.max(0, Horsti.FieldEffects.parseNumber(fieldDataObj.maxCopies, 0)),
                forceCopiesToStacks: String(fieldDataObj.forceCopiesToStacks || 'false') === 'true',
                stackIndexForCopyStacksConversion: Math.max(0, Horsti.FieldEffects.parseNumber(fieldDataObj.stackIndexForCopyStacksConversion, 0)),
                stackXSettings: $.parseAdvStacksXSettingsList(fieldDataObj.stackXSettings),
                battlebacks: Horsti.FieldEffects.parseBattlebacks(fieldDataObj.battlebacks),
                passives: Horsti.FieldEffects.parsePassives(fieldDataObj.passives),
                skillMods: Horsti.FieldEffects.parseModificationsList(fieldDataObj.skillMods),
                itemMods: Horsti.FieldEffects.parseModificationsList(fieldDataObj.itemMods),
                transitions: Horsti.FieldEffects.parseTransitionsList(fieldDataObj.transitions),
                expiration: Horsti.FieldEffects.parseExpiration(fieldDataObj.expiration),
                evals: $.parseAdvFieldEvals(fieldDataObj.evals),
                description: Horsti.FieldEffects.parseNote(fieldDataObj.description),
                note: rawFieldNote,
                stacksVisual: $.parseFieldStacksVisualSettings(rawFieldNote),
                Categories: parsedCategories.slice(),
                TempCategories: [],
                AllCategories: parsedCategories.slice(),
                categories: parsedCategories.slice(),
                tempCategories: [],
                allCategories: parsedCategories.slice()
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

$.isAdvFieldId = function(fieldId) {
    const id = Number(fieldId || 0);
    if (id <= 0) return false;
    if ($.advFieldStartId <= 0 || $.advFieldCount <= 0) return false;
    return id >= $.advFieldStartId && id < ($.advFieldStartId + $.advFieldCount);
};

$.fieldStacksVisualSettingsForDisplay = function(field, stackIndex) {
    const defaults = $.defaultFieldStacksVisualSettings();
    const index = $.normalizeStacksIndex(stackIndex);
    if (!field || !field.object) return defaults;
    const objectData = field.object();
    let settings = defaults;
    if (objectData && objectData.stacksVisual) {
        settings = $.normalizeFieldStacksVisualSettings(objectData.stacksVisual);
    }
    if (index > 0 && field.fieldId) {
        const stackX = $.getFieldStacksXSettingData(field.fieldId(), index);
        if (stackX && stackX.enabled && stackX.separateVisual) {
            settings = $.normalizeFieldStacksVisualSettings(stackX.visual);
        }
    }
    return settings;
};

$.fieldHudStacksVisualSettingsForDisplay = function(field, stackIndex) {
    const hudAdjust = $.defaultFieldHudStacksVisualSettings();
    const settings = $.cloneFieldStacksVisualSettings($.fieldStacksVisualSettingsForDisplay(field, stackIndex));
    settings.bufferX = Number(settings.bufferX || 0) + Number(hudAdjust.offsetX || 0);
    settings.bufferY = Number(settings.bufferY || 0) + Number(hudAdjust.offsetY || 0);
    if (hudAdjust.alignOverride && hudAdjust.alignOverride !== 'nochange') {
        settings.align = hudAdjust.alignOverride;
    }
    return $.normalizeFieldStacksVisualSettings(settings);
};

$.isFieldStacksIndexDisplayEnabled = function(field, stackIndex) {
    if (!field || !field.fieldId) return false;
    const index = $.normalizeStacksIndex(stackIndex);
    const setting = $.getFieldStacksXSettingData(field.fieldId(), index);
    return !!(setting && setting.enabled);
};

$.shouldDrawFieldStacksForDisplay = function(field, stackIndex) {
    if (!field || !field.fieldId) return false;
    if (!$.isAdvFieldId(field.fieldId())) return false;
    const index = $.normalizeStacksIndex(stackIndex);
    if (!$.isFieldStacksIndexDisplayEnabled(field, index)) return false;
    return $.getFieldStacksX(field, index) > 0;
};

$.fieldDisplayStackIndices = function(field) {
    if (!field) return [];
    $.ensureFieldStackState(field);
    const maxLen = Math.max(field._stacks.length, field._previousStacks.length, 1);
    const out = [];
    for (let i = 0; i < maxLen; ++i) {
        if (!$.isFieldStacksIndexUsable(field, i)) continue;
        if (!$.shouldDrawFieldStacksForDisplay(field, i)) continue;
        out.push(i);
    }
    return out;
};

$.uiTextColor = function(colorIndex) {
    const index = Math.max(0, Math.floor(Number(colorIndex || 0)));
    const windowskin = ImageManager.loadSystem('Window');
    if (windowskin && windowskin.getPixel) {
        const px = 96 + (index % 8) * 12 + 6;
        const py = 144 + Math.floor(index / 8) * 12 + 6;
        return windowskin.getPixel(px, py);
    }
    return '#ffffff';
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
        this.drawFieldStacksCounter(field, rect.x + 2, rect.y + 2);
        this.drawText(name, rect.x + Window_Base._iconWidth + 8, rect.y, nameWidth - Window_Base._iconWidth - 8);
    } else {
        this.drawText(name, rect.x, rect.y, nameWidth);
    }
};

Window_FieldEffectsList.prototype.drawFieldStacksCounter = function(field, wx, wy) {
    const indices = $.fieldDisplayStackIndices(field);
    for (let i = 0; i < indices.length; ++i) {
        const stackIndex = indices[i];
        if (!$.shouldDrawFieldStacksForDisplay(field, stackIndex)) continue;

        const settings = $.fieldStacksVisualSettingsForDisplay(field, stackIndex);
        const stacks = $.getFieldStacksX(field, stackIndex);
        const value = (typeof Yanfly !== 'undefined' && Yanfly.Util && Yanfly.Util.toGroup)
            ? Yanfly.Util.toGroup(stacks)
            : String(stacks);

        this.changePaintOpacity(true);
        this.changeTextColor(this.textColor(settings.color));
        this.contents.fontSize = settings.size;
        this.drawText(value, wx + settings.bufferX, wy + settings.bufferY, Window_Base._iconWidth, settings.align);
        this.resetFontSettings();
        this.resetTextColor();
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

const JakeMSG_FieldEffects_TouchInput_onRightButtonDown = TouchInput._onRightButtonDown;
TouchInput._onRightButtonDown = function(event) {
    JakeMSG_FieldEffects_TouchInput_onRightButtonDown.call(this, event);
    if ($.canPinFieldHudTooltip()) {
        $.pinFieldHudTooltip();
    }
};

const JakeMSG_FieldEffects_Graphics_onKeyDown = Graphics._onKeyDown;
Graphics._onKeyDown = function(event) {
    if (event && event.keyCode === $.getOliviaTooltipPinKeyCode() && $.canPinFieldHudTooltip()) {
        $.pinFieldHudTooltip();
    }
    JakeMSG_FieldEffects_Graphics_onKeyDown.call(this, event);
};

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
    this._fieldRef = null;
    this._stacksCounterSignature = '';
    this.createStacksCounterSprite();
    this.updateField(field);
};

Sprite_FieldEffectIcon.prototype.createStacksCounterSprite = function() {
    this._stacksCounterPadding = 32;
    const width = Window_Base._iconWidth + this._stacksCounterPadding * 2;
    const height = Window_Base._iconHeight + this._stacksCounterPadding * 2;
    this._stacksCounterSprite = new Sprite(new Bitmap(width, height));
    this._stacksCounterSprite.x = -Window_Base._iconWidth * this.anchor.x - this._stacksCounterPadding;
    this._stacksCounterSprite.y = -this._stacksCounterPadding;
    this.addChild(this._stacksCounterSprite);
};

Sprite_FieldEffectIcon.prototype.updateField = function(field) {
    this._fieldRef = field || null;
    this._fieldEffectData = {
        id: field && field.fieldId ? Number(field.fieldId() || 0) : 0,
        icon: $.fieldIconForDisplay(field),
        name: $.fieldNameForDisplay(field),
        description: $.fieldDescriptionForDisplay(field)
    };
    this._stacksCounterSignature = '';
    this.updateFrame();
    this.updateStacksCounterIfNeeded(true);
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

Sprite_FieldEffectIcon.prototype.makeStacksCounterSignature = function() {
    const field = this._fieldRef;
    const indices = $.fieldDisplayStackIndices(field);
    if (!indices || indices.length <= 0) {
        return 'none';
    }
    const parts = [];
    for (let i = 0; i < indices.length; ++i) {
        const index = indices[i];
        const settings = $.fieldHudStacksVisualSettingsForDisplay(field, index);
        parts.push([
            index,
            $.getFieldStacksX(field, index),
            settings.size,
            settings.align,
            settings.bufferX,
            settings.bufferY,
            settings.color
        ].join(':'));
    }
    return parts.join('|');
};

Sprite_FieldEffectIcon.prototype.updateStacksCounterIfNeeded = function(force) {
    if (!this._stacksCounterSprite || !this._stacksCounterSprite.bitmap) return;

    const signature = this.makeStacksCounterSignature();
    if (!force && signature === this._stacksCounterSignature) return;
    this._stacksCounterSignature = signature;

    const bitmap = this._stacksCounterSprite.bitmap;
    bitmap.clear();

    const field = this._fieldRef;
    const indices = $.fieldDisplayStackIndices(field);
    for (let i = 0; i < indices.length; ++i) {
        const stackIndex = indices[i];
        if (!$.shouldDrawFieldStacksForDisplay(field, stackIndex)) continue;
        const settings = $.fieldHudStacksVisualSettingsForDisplay(field, stackIndex);
        const stacks = $.getFieldStacksX(field, stackIndex);
        const value = (typeof Yanfly !== 'undefined' && Yanfly.Util && Yanfly.Util.toGroup)
            ? Yanfly.Util.toGroup(stacks)
            : String(stacks);

        const x = this._stacksCounterPadding + settings.bufferX;
        const y = this._stacksCounterPadding + settings.bufferY;
        bitmap.fontSize = settings.size;
        bitmap.textColor = $.uiTextColor(settings.color);
        bitmap.drawText(String(value), x, y, Window_Base._iconWidth, Math.max(18, settings.size + 4), settings.align);
    }
};

Sprite_FieldEffectIcon.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateStacksCounterIfNeeded(false);
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

$.parseAdvNotetagStackXAction = function(payload, allowStacks) {
    const tokens = $.splitCsvArgs(payload);
    const out = {
        fieldArg: '',
        stackIndex: 0,
        turns: 1,
        hasTurns: false
    };
    if (tokens.length <= 0) return out;

    out.fieldArg = String(tokens[0] || '').trim();
    if (tokens.length >= 2) {
        out.stackIndex = $.normalizeStacksIndex(tokens[1]);
    }
    if (allowStacks && tokens.length >= 3) {
        const parsedStacks = Number(tokens[2]);
        if (!Number.isNaN(parsedStacks)) {
            out.turns = parsedStacks;
            out.hasTurns = true;
        }
    }
    return out;
};

$.parseAdvNotetagAuxValAction = function(payload, allowValue) {
    const parsed = $.parseAdvNotetagAction(payload, allowValue);
    return {
        fieldArg: parsed.fieldArg,
        turns: parsed.turns,
        hasTurns: parsed.hasTurns
    };
};

$.createEmptyAdvActionBuckets = function() {
    return {
        set: null,
        adds: [],
        removes: [],
        removeAll: [],
        remCategory: [],
        customRemCategory: [],
        addTurns: [],
        addTurnsCategory: [],
        setTurns: [],
        setTurnsCategory: [],
        stackAdds: [],
        stacksAddCategory: [],
        stackAddAll: [],
        stackXAdds: [],
        stacksXAddCategory: [],
        stackXAddAll: [],
        stacksSet: [],
        stacksSetCategory: [],
        stacksSetAll: [],
        stacksXSet: [],
        stacksXSetCategory: [],
        stacksXSetAll: [],
        auxValAdds: [],
        auxValAddAll: [],
        auxValSet: [],
        auxValSetAll: [],
        ordered: []
    };
};

$.parseAdvActionLine = function(line) {
    if (!line) return null;

    let match = line.match(/<SET[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'set', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<ADD[-_ ]?ADV[-_ ]?(?:FIELD|ARRAY):\s*([^>]+)>/i);
    if (match) return { type: 'add', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<STACK[-_ ]?ADD[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'stackAddAll', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<STACKS?X[-_ ]?ADD[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'stackXAddAll', entry: $.parseAdvNotetagStackXAction(match[1], true) };

    match = line.match(/<STACK[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'stackAdd', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<STACKS?X[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'stackXAdd', entry: $.parseAdvNotetagStackXAction(match[1], true) };

    match = line.match(/<STACKS[-_ ]?SET[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'stacksSetAll', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<STACKS?X[-_ ]?SET[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'stacksXSetAll', entry: $.parseAdvNotetagStackXAction(match[1], true) };

    match = line.match(/<STACKS[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'stacksSet', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<STACKS?X[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'stacksXSet', entry: $.parseAdvNotetagStackXAction(match[1], true) };

    match = line.match(/<AUXVAL[-_ ]?ADD[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'auxValAddAll', entry: $.parseAdvNotetagAuxValAction(match[1], true) };

    match = line.match(/<AUXVAL[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'auxValAdd', entry: $.parseAdvNotetagAuxValAction(match[1], true) };

    match = line.match(/<AUXVAL[-_ ]?SET[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'auxValSetAll', entry: $.parseAdvNotetagAuxValAction(match[1], true) };

    match = line.match(/<AUXVAL[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'auxValSet', entry: $.parseAdvNotetagAuxValAction(match[1], true) };

    match = line.match(/<REM[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'removeAll', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<REM(?:OVE)?[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY:\s*([^>]+)>/i);
    if (match) return { type: 'remCategory', entry: $.parseAdvCategoryAction(match[1], true) };

    match = line.match(/<REM(?:OVE)?[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'remove', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<ADD[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY:\s*([^>]+)>/i);
    if (match) return { type: 'addTurnsCategory', entry: $.parseAdvCategoryAction(match[1], true) };

    match = line.match(/<ADD[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'addTurns', entry: $.parseAdvNotetagAction(match[1], true) };

    match = line.match(/<SET[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY:\s*([^>]+)>/i);
    if (match) return { type: 'setTurnsCategory', entry: $.parseAdvCategoryAction(match[1], true) };

    match = line.match(/<STACKS?[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY:\s*([^>]+)>/i);
    if (match) return { type: 'stacksAddCategory', entry: $.parseAdvCategoryAction(match[1], true) };

    match = line.match(/<STACKS?[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY:\s*([^>]+)>/i);
    if (match) return { type: 'stacksSetCategory', entry: $.parseAdvCategoryAction(match[1], true) };

    match = line.match(/<STACKS?X[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY:\s*([^>]+)>/i);
    if (match) return { type: 'stacksXAddCategory', entry: $.parseAdvStackXCategoryAction(match[1], true) };

    match = line.match(/<STACKS?X[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY:\s*([^>]+)>/i);
    if (match) return { type: 'stacksXSetCategory', entry: $.parseAdvStackXCategoryAction(match[1], true) };

    match = line.match(/<SET[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD:\s*([^>]+)>/i);
    if (match) return { type: 'setTurns', entry: $.parseAdvNotetagAction(match[1], true) };

    return null;
};

$.parseAdvActionsFromNote = function(noteText) {
    const buckets = $.createEmptyAdvActionBuckets();
    const lines = String(noteText || '').split(/[\r\n]+/);
    let evalMode = 'none';
    let evalLine = '';
    let evalCategory = '';

    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];

        if (line.match(/<CUSTOM REMOVE FIELD CATEGORY:[ ](.*)>/i)) {
            evalMode = 'custom remove field category';
            evalLine = '';
            evalCategory = $.normalizeFieldCategoryName(RegExp.$1);
            continue;
        }

        if (line.match(/<\/CUSTOM REMOVE FIELD CATEGORY:[ ](.*)>/i)) {
            const closeCategory = $.normalizeFieldCategoryName(RegExp.$1);
            const category = closeCategory || evalCategory;
            if (category) {
                const entry = {
                    category: category,
                    turns: 1,
                    hasTurns: true,
                    formula: evalLine
                };
                const action = { type: 'customRemCategory', entry: entry };
                buckets.customRemCategory.push(entry);
                buckets.ordered.push(action);
            }
            evalMode = 'none';
            evalLine = '';
            evalCategory = '';
            continue;
        }

        if (evalMode === 'custom remove field category') {
            evalLine += line + '\n';
            continue;
        }

        const action = $.parseAdvActionLine(line);
        if (!action) continue;
        buckets.ordered.push(action);

        switch (action.type) {
        case 'set':
            buckets.set = action.entry;
            break;
        case 'add':
            buckets.adds.push(action.entry);
            break;
        case 'remove':
            buckets.removes.push(action.entry);
            break;
        case 'removeAll':
            buckets.removeAll.push(action.entry);
            break;
        case 'remCategory':
            buckets.remCategory.push(action.entry);
            break;
        case 'customRemCategory':
            buckets.customRemCategory.push(action.entry);
            break;
        case 'addTurns':
            buckets.addTurns.push(action.entry);
            break;
        case 'addTurnsCategory':
            buckets.addTurnsCategory.push(action.entry);
            break;
        case 'setTurns':
            buckets.setTurns.push(action.entry);
            break;
        case 'setTurnsCategory':
            buckets.setTurnsCategory.push(action.entry);
            break;
        case 'stackAdd':
            buckets.stackAdds.push(action.entry);
            break;
        case 'stacksAddCategory':
            buckets.stacksAddCategory.push(action.entry);
            break;
        case 'stackAddAll':
            buckets.stackAddAll.push(action.entry);
            break;
        case 'stackXAdd':
            buckets.stackXAdds.push(action.entry);
            break;
        case 'stacksXAddCategory':
            buckets.stacksXAddCategory.push(action.entry);
            break;
        case 'stackXAddAll':
            buckets.stackXAddAll.push(action.entry);
            break;
        case 'stacksSet':
            buckets.stacksSet.push(action.entry);
            break;
        case 'stacksSetCategory':
            buckets.stacksSetCategory.push(action.entry);
            break;
        case 'stacksSetAll':
            buckets.stacksSetAll.push(action.entry);
            break;
        case 'stacksXSet':
            buckets.stacksXSet.push(action.entry);
            break;
        case 'stacksXSetCategory':
            buckets.stacksXSetCategory.push(action.entry);
            break;
        case 'stacksXSetAll':
            buckets.stacksXSetAll.push(action.entry);
            break;
        case 'auxValAdd':
            buckets.auxValAdds.push(action.entry);
            break;
        case 'auxValAddAll':
            buckets.auxValAddAll.push(action.entry);
            break;
        case 'auxValSet':
            buckets.auxValSet.push(action.entry);
            break;
        case 'auxValSetAll':
            buckets.auxValSetAll.push(action.entry);
            break;
        }
    }

    return buckets;
};

$.applyAdvMapAction = function(gameMap, actionType, entry) {
    if (!gameMap || !entry) return;
    const baseFieldId = $.resolveAdvActionToBaseFieldId(entry);
    if (!$.isValidLoadedFieldId(baseFieldId)) return;

    switch (actionType) {
    case 'set':
        gameMap.setField(baseFieldId, entry.turns);
        $.runFieldStartEval(baseFieldId, gameMap.field());
        break;
    case 'add':
        if ($.addFieldRespectingMaxCopies(baseFieldId, entry.turns, null, null)) {
            $.runFieldStartEval(baseFieldId);
        }
        break;
    case 'stackAddAll': {
        const stacksAll = entry.hasTurns ? entry.turns : 1;
        gameMap.addStacksAllFieldMatches(baseFieldId, stacksAll, null, null);
        break;
    }
    case 'stackAdd': {
        const stacks = entry.hasTurns ? entry.turns : 1;
        gameMap.addStacksFirstFieldMatch(baseFieldId, stacks, null, null);
        break;
    }
    case 'stacksSetAll': {
        const stacksAll = entry.hasTurns ? entry.turns : 1;
        gameMap.setStacksAllFieldMatches(baseFieldId, stacksAll, null, null);
        break;
    }
    case 'stacksSet': {
        const stacks = entry.hasTurns ? entry.turns : 1;
        gameMap.setStacksFirstFieldMatch(baseFieldId, stacks, null, null);
        break;
    }
    case 'stackXAddAll': {
        const stacksAll = entry.hasTurns ? entry.turns : 1;
        const stackIndex = $.normalizeStacksIndex(entry.stackIndex);
        gameMap.addStacksXAllFieldMatches(baseFieldId, stackIndex, stacksAll, null, null);
        break;
    }
    case 'stackXAdd': {
        const stacks = entry.hasTurns ? entry.turns : 1;
        const stackIndex = $.normalizeStacksIndex(entry.stackIndex);
        gameMap.addStacksXFirstFieldMatch(baseFieldId, stackIndex, stacks, null, null);
        break;
    }
    case 'stacksXSetAll': {
        const stacksAll = entry.hasTurns ? entry.turns : 1;
        const stackIndex = $.normalizeStacksIndex(entry.stackIndex);
        gameMap.setStacksXAllFieldMatches(baseFieldId, stackIndex, stacksAll, null, null);
        break;
    }
    case 'stacksXSet': {
        const stacks = entry.hasTurns ? entry.turns : 1;
        const stackIndex = $.normalizeStacksIndex(entry.stackIndex);
        gameMap.setStacksXFirstFieldMatch(baseFieldId, stackIndex, stacks, null, null);
        break;
    }
    case 'auxValAddAll': {
        if (entry.hasTurns) gameMap.addAuxValAllFieldMatches(baseFieldId, entry.turns);
        break;
    }
    case 'auxValAdd': {
        if (entry.hasTurns) gameMap.addAuxValFirstFieldMatch(baseFieldId, entry.turns);
        break;
    }
    case 'auxValSetAll': {
        if (entry.hasTurns) gameMap.setAuxValAllFieldMatches(baseFieldId, entry.turns);
        break;
    }
    case 'auxValSet': {
        if (entry.hasTurns) gameMap.setAuxValFirstFieldMatch(baseFieldId, entry.turns);
        break;
    }
    case 'removeAll': {
        const removed = gameMap.removeAllFieldMatches(baseFieldId, entry.turns);
        for (let i = 0; i < removed.length; ++i) {
            $.evalFieldDestructionForField(removed[i], null, null);
        }
        break;
    }
    case 'remove': {
        const result = gameMap.removeFirstFieldMatch(baseFieldId, entry.turns);
        if (result.removed && result.field) {
            $.evalFieldDestructionForField(result.field, null, null);
        }
        break;
    }
    case 'remCategory': {
        const removed = gameMap.removeAllFieldMatchesByCategory(entry.category, entry.turns);
        for (let i = 0; i < removed.length; ++i) {
            $.evalFieldDestructionForField(removed[i], null, null);
        }
        break;
    }
    case 'customRemCategory': {
        const removed = gameMap.removeXFieldMatchesByCategory(entry.category, Math.max(0, Math.floor(Number(entry.turns || 0))), 0);
        for (let i = 0; i < removed.length; ++i) {
            $.evalFieldDestructionForField(removed[i], null, null);
        }
        break;
    }
    case 'addTurns':
        if (entry.hasTurns) {
            gameMap.addTurnsAllFieldMatches(baseFieldId, entry.turns);
        }
        break;
    case 'addTurnsCategory':
        if (entry.hasTurns) {
            gameMap.addTurnsAllFieldMatchesByCategory(entry.category, entry.turns);
        }
        break;
    case 'setTurns':
        if (entry.turns >= 0) {
            gameMap.setTurnsAllFieldMatches(baseFieldId, entry.turns);
        }
        break;
    case 'setTurnsCategory':
        if (entry.turns >= 0) {
            gameMap.setTurnsAllFieldMatchesByCategory(entry.category, entry.turns);
        }
        break;
    case 'stacksAddCategory': {
        const stacks = entry.hasTurns ? entry.turns : 1;
        gameMap.addStacksAllFieldMatchesByCategory(entry.category, stacks, null, null);
        break;
    }
    case 'stacksSetCategory': {
        const stacks = entry.hasTurns ? entry.turns : 1;
        gameMap.setStacksAllFieldMatchesByCategory(entry.category, stacks, null, null);
        break;
    }
    case 'stacksXAddCategory': {
        const stacks = entry.hasTurns ? entry.turns : 1;
        gameMap.addStacksXAllFieldMatchesByCategory(entry.category, entry.stackIndex, stacks, null, null);
        break;
    }
    case 'stacksXSetCategory': {
        const stacks = entry.hasTurns ? entry.turns : 1;
        gameMap.setStacksXAllFieldMatchesByCategory(entry.category, entry.stackIndex, stacks, null, null);
        break;
    }
    }
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
        const fieldStacks = context.fieldStacks;
        const stacks = context.stacks;
        const previousStacks = context.previousStacks;
        const Categories = context.Categories;
        const TempCategories = context.TempCategories;
        const AllCategories = context.AllCategories;
        const categories = context.categories;
        const tempCategories = context.tempCategories;
        const allCategories = context.allCategories;
        const fieldAuxVal = context.fieldAuxVal;
        const auxVal = context.auxVal;
        const fieldMaxCopies = context.fieldMaxCopies;
        const maxCopies = context.maxCopies;
        const fieldMaxStacks = context.fieldMaxStacks;
        const maxStacks = context.maxStacks;
        const fieldForceCopiesToStacks = context.fieldForceCopiesToStacks;
        const forceCopiesToStacks = context.forceCopiesToStacks;
        const fieldIsExpiring = context.fieldIsExpiring;
        const getFieldName = context.getFieldName;
        const setFieldName = context.setFieldName;
        const getFieldCategories = context.getFieldCategories;
        const getFieldTempCategories = context.getFieldTempCategories;
        const getFieldAllCategories = context.getFieldAllCategories;
        const refreshFieldCategories = context.refreshFieldCategories;
        const hasFieldCategory = context.hasFieldCategory;
        const addTempFieldCategory = context.addTempFieldCategory;
        const removeTempFieldCategory = context.removeTempFieldCategory;
        const getFieldTurnsLeft = context.getFieldTurnsLeft;
        const setFieldTurnsLeft = context.setFieldTurnsLeft;
        const addFieldTurns = context.addFieldTurns;
        const resetFieldTurns = context.resetFieldTurns;
        const getFieldStacks = context.getFieldStacks;
        const getFieldStacksX = context.getFieldStacksX;
        const getPreviousStacks = context.getPreviousStacks;
        const getPreviousStacksX = context.getPreviousStacksX;
        const setFieldStacks = context.setFieldStacks;
        const setFieldStacksX = context.setFieldStacksX;
        const getFieldAuxVal = context.getFieldAuxVal;
        const setFieldAuxVal = context.setFieldAuxVal;
        const addFieldAuxVal = context.addFieldAuxVal;
        const getFieldMaxCopies = context.getFieldMaxCopies;
        const getFieldMaxStacks = context.getFieldMaxStacks;
        const getFieldForceCopiesToStacks = context.getFieldForceCopiesToStacks;
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

const Game_Field_initialize_JakeMSG_Stacks = Game_Field.prototype.initialize;
Game_Field.prototype.initialize = function(fieldId, turns) {
    Game_Field_initialize_JakeMSG_Stacks.call(this, fieldId, turns);
    this._stacks = [1];
    this._previousStacks = [0];
    this._auxVal = 0;

    const data = this.object ? this.object() : null;
    this.Categories = data && Array.isArray(data.Categories) ? data.Categories.slice() : [];
    this.TempCategories = [];
    this.AllCategories = [];
    this.categories = this.Categories;
    this.tempCategories = this.TempCategories;
    this.allCategories = this.AllCategories;

    $.ensureFieldCategoryState(this);
    $.ensureFieldStackState(this);
};

Game_Field.prototype.getCategories = function() {
    $.ensureFieldCategoryState(this);
    return this.Categories;
};

Game_Field.prototype.getTempCategories = function() {
    $.ensureFieldCategoryState(this);
    return this.TempCategories;
};

Game_Field.prototype.getAllCategories = function() {
    $.ensureFieldCategoryState(this);
    return this.AllCategories;
};

Game_Field.prototype.refreshAllCategories = function() {
    $.ensureFieldCategoryState(this);
    return this.AllCategories;
};

Game_Field.prototype.hasCategory = function(category) {
    return $.fieldHasCategory(this, category);
};

Game_Field.prototype.tempAddCategory = function(category) {
    $.ensureFieldCategoryState(this);
    const normalized = $.normalizeFieldCategoryName(category);
    if (!normalized) return false;
    if (this.TempCategories.contains(normalized)) return false;
    this.TempCategories.push(normalized);
    $.syncFieldAllCategories(this);
    return true;
};

Game_Field.prototype.tempRemoveCategory = function(category) {
    $.ensureFieldCategoryState(this);
    const normalized = $.normalizeFieldCategoryName(category);
    if (!normalized) return false;
    const index = this.TempCategories.indexOf(normalized);
    if (index < 0) return false;
    this.TempCategories.splice(index, 1);
    $.syncFieldAllCategories(this);
    return true;
};

Game_Field.prototype.stacks = function() {
    return $.getFieldStacks(this);
};

Game_Field.prototype.stacksX = function(index) {
    return $.getFieldStacksX(this, index);
};

Game_Field.prototype.previousStacks = function() {
    return $.getFieldPreviousStacks(this);
};

Game_Field.prototype.previousStacksX = function(index) {
    return $.getFieldPreviousStacksX(this, index);
};

Game_Field.prototype.setStacks = function(value) {
    $.ensureFieldStackState(this);
    this._previousStacks[0] = $.getFieldStacksX(this, 0);
    this._stacks[0] = $.normalizeStacksForFieldIndex(this, 0, value);
    return this._stacks[0];
};

Game_Field.prototype.setStacksX = function(index, value) {
    $.ensureFieldStackState(this);
    const stackIndex = $.normalizeStacksIndex(index);
    if (!$.isFieldStacksIndexUsable(this, stackIndex)) return 0;
    this._previousStacks[stackIndex] = $.getFieldStacksX(this, stackIndex);
    this._stacks[stackIndex] = $.normalizeStacksForFieldIndex(this, stackIndex, value);
    return this._stacks[stackIndex];
};

Game_Field.prototype.auxVal = function() {
    return $.getFieldAuxVal(this);
};

Game_Field.prototype.setAuxVal = function(value) {
    return $.setFieldAuxVal(this, value);
};

Game_Map.prototype.fields = function() {
    if (!Array.isArray(this._fields)) this._fields = [];
    for (let i = 0; i < this._fields.length; ++i) {
        $.ensureFieldCategoryState(this._fields[i]);
        $.ensureFieldStackState(this._fields[i]);
    }
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

$.processFieldStacksChange = function(field, newStacks, subject, item) {
    return $.processFieldStacksXChange(field, 0, newStacks, subject, item);
};

$.processFieldStacksXChange = function(field, stackIndex, newStacks, subject, item) {
    if (!field) {
        return {
            changed: false,
            removed: false,
            destroyedField: null,
            stackIndex: $.normalizeStacksIndex(stackIndex),
            previousStacks: 0,
            stacks: 0,
            phase: ''
        };
    }

    $.ensureFieldStackState(field);
    const index = $.normalizeStacksIndex(stackIndex);
    if (!$.isFieldStacksIndexUsable(field, index)) {
        return {
            changed: false,
            removed: false,
            destroyedField: null,
            stackIndex: index,
            previousStacks: 0,
            stacks: 0,
            phase: ''
        };
    }
    const previousStacks = $.getFieldStacksX(field, index);
    const normalizedStacks = $.normalizeStacksForFieldIndex(field, index, newStacks);

    if (normalizedStacks === previousStacks) {
        return {
            changed: false,
            removed: false,
            destroyedField: null,
            stackIndex: index,
            previousStacks: previousStacks,
            stacks: normalizedStacks,
            phase: ''
        };
    }

    field._previousStacks[index] = previousStacks;
    field._stacks[index] = normalizedStacks;

    const phase = normalizedStacks > previousStacks ? 'stackIncrease' : 'stackDecrease';
    $.evalFieldCodeForField(field, phase, subject || null, item || null);

    if (index === 0 && normalizedStacks <= 0) {
        return {
            changed: true,
            removed: true,
            destroyedField: field,
            stackIndex: index,
            previousStacks: previousStacks,
            stacks: normalizedStacks,
            phase: phase
        };
    }

    return {
        changed: true,
        removed: false,
        destroyedField: null,
        stackIndex: index,
        previousStacks: previousStacks,
        stacks: normalizedStacks,
        phase: phase
    };
};

Game_Map.prototype.addStacksXFirstFieldMatch = function(fieldId, stackIndex, stacksDelta, subject, item) {
    const list = this.fields();
    const delta = $.normalizeStacksValue(stacksDelta);
    const index = $.normalizeStacksIndex(stackIndex);
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;

        const result = $.processFieldStacksXChange(field, index, $.getFieldStacksX(field, index) + delta, subject, item);
        if (result.removed) {
            const removed = this._removeAtIndex(i);
            if (removed) {
                $.evalFieldDestructionForField(removed, subject || null, item || null);
            }
        }
        return result;
    }
    return {
        changed: false,
        removed: false,
        destroyedField: null,
        stackIndex: index,
        previousStacks: 0,
        stacks: 0,
        phase: ''
    };
};

Game_Map.prototype.addStacksXAllFieldMatches = function(fieldId, stackIndex, stacksDelta, subject, item) {
    const list = this.fields();
    const delta = $.normalizeStacksValue(stacksDelta);
    const index = $.normalizeStacksIndex(stackIndex);
    let matched = 0;
    let changed = 0;
    let removed = 0;

    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;
        matched += 1;

        const result = $.processFieldStacksXChange(field, index, $.getFieldStacksX(field, index) + delta, subject, item);
        if (!result.changed) continue;
        changed += 1;

        if (result.removed) {
            const removedField = this._removeAtIndex(i);
            if (removedField) {
                removed += 1;
                $.evalFieldDestructionForField(removedField, subject || null, item || null);
            }
        }
    }

    return {
        matched: matched,
        changed: changed,
        removed: removed,
        stackIndex: index
    };
};

Game_Map.prototype.setStacksXFirstFieldMatch = function(fieldId, stackIndex, stacksValue, subject, item) {
    const list = this.fields();
    const index = $.normalizeStacksIndex(stackIndex);
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;

        const result = $.processFieldStacksXChange(field, index, stacksValue, subject, item);
        if (result.removed) {
            const removed = this._removeAtIndex(i);
            if (removed) {
                $.evalFieldDestructionForField(removed, subject || null, item || null);
            }
        }
        return result;
    }
    return {
        changed: false,
        removed: false,
        destroyedField: null,
        stackIndex: index,
        previousStacks: 0,
        stacks: 0,
        phase: ''
    };
};

Game_Map.prototype.setStacksXAllFieldMatches = function(fieldId, stackIndex, stacksValue, subject, item) {
    const list = this.fields();
    const index = $.normalizeStacksIndex(stackIndex);
    let matched = 0;
    let changed = 0;
    let removed = 0;

    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;
        matched += 1;

        const result = $.processFieldStacksXChange(field, index, stacksValue, subject, item);
        if (!result.changed) continue;
        changed += 1;

        if (result.removed) {
            const removedField = this._removeAtIndex(i);
            if (removedField) {
                removed += 1;
                $.evalFieldDestructionForField(removedField, subject || null, item || null);
            }
        }
    }

    return {
        matched: matched,
        changed: changed,
        removed: removed,
        stackIndex: index
    };
};

Game_Map.prototype.addStacksFirstFieldMatch = function(fieldId, stacksDelta, subject, item) {
    return this.addStacksXFirstFieldMatch(fieldId, 0, stacksDelta, subject, item);
};

Game_Map.prototype.addStacksAllFieldMatches = function(fieldId, stacksDelta, subject, item) {
    return this.addStacksXAllFieldMatches(fieldId, 0, stacksDelta, subject, item);
};

Game_Map.prototype.setStacksFirstFieldMatch = function(fieldId, stacksValue, subject, item) {
    return this.setStacksXFirstFieldMatch(fieldId, 0, stacksValue, subject, item);
};

Game_Map.prototype.setStacksAllFieldMatches = function(fieldId, stacksValue, subject, item) {
    return this.setStacksXAllFieldMatches(fieldId, 0, stacksValue, subject, item);
};

Game_Map.prototype.addAuxValFirstFieldMatch = function(fieldId, delta) {
    const list = this.fields();
    const parsedDelta = Number(delta || 0);
    if (Number.isNaN(parsedDelta)) return { changed: false, value: 0 };
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;
        const value = $.addFieldAuxVal(field, parsedDelta);
        return { changed: true, value: value };
    }
    return { changed: false, value: 0 };
};

Game_Map.prototype.addAuxValAllFieldMatches = function(fieldId, delta) {
    const list = this.fields();
    const parsedDelta = Number(delta || 0);
    if (Number.isNaN(parsedDelta)) return { matched: 0, changed: 0 };
    let matched = 0;
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;
        $.addFieldAuxVal(field, parsedDelta);
        matched += 1;
    }
    return { matched: matched, changed: matched };
};

Game_Map.prototype.setAuxValFirstFieldMatch = function(fieldId, value) {
    const list = this.fields();
    const parsed = Number(value || 0);
    if (Number.isNaN(parsed)) return { changed: false, value: 0 };
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;
        const next = $.setFieldAuxVal(field, parsed);
        return { changed: true, value: next };
    }
    return { changed: false, value: 0 };
};

Game_Map.prototype.setAuxValAllFieldMatches = function(fieldId, value) {
    const list = this.fields();
    const parsed = Number(value || 0);
    if (Number.isNaN(parsed)) return { matched: 0, changed: 0 };
    let matched = 0;
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || field.fieldId() !== fieldId) continue;
        $.setFieldAuxVal(field, parsed);
        matched += 1;
    }
    return { matched: matched, changed: matched };
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

Game_Map.prototype.removeXFieldMatchesByCategory = function(category, count, turnsReduction) {
    const list = this.fields();
    const normalized = $.normalizeFieldCategoryName(category);
    const maxCount = Math.max(0, Math.floor(Number(count || 0)));
    const reduction = Number(turnsReduction || 0);
    if (!normalized || maxCount <= 0) return [];

    const removed = [];
    let removedCount = 0;
    for (let i = list.length - 1; i >= 0; --i) {
        if (removedCount >= maxCount) break;
        const field = list[i];
        if (!field || !$.fieldHasCategory(field, normalized)) continue;

        if (reduction > 0) {
            if (!field.isExpiring() || field.turnsLeft() <= 0) continue;
            field._turnsLeft -= reduction;
            if (field.turnsLeft() > 0) continue;
        }

        removed.push(field);
        list.splice(i, 1);
        removedCount += 1;
    }

    if (removed.length > 0) {
        this._syncPrimaryField();
        $.refreshFieldMembers();
    }
    return removed;
};

Game_Map.prototype.removeAllFieldMatchesByCategory = function(category, turnsReduction) {
    return this.removeXFieldMatchesByCategory(category, Infinity, turnsReduction);
};

Game_Map.prototype.addTurnsAllFieldMatchesByCategory = function(category, turnsToAdd) {
    const list = this.fields();
    const normalized = $.normalizeFieldCategoryName(category);
    const delta = Number(turnsToAdd);
    if (!normalized || Number.isNaN(delta)) return { matched: 0, changed: 0, skipped: 0 };

    let matched = 0;
    let changed = 0;
    let skipped = 0;
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || !$.fieldHasCategory(field, normalized)) continue;
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

Game_Map.prototype.setTurnsAllFieldMatchesByCategory = function(category, turnsToSet) {
    const list = this.fields();
    const normalized = $.normalizeFieldCategoryName(category);
    const turns = Number(turnsToSet);
    if (!normalized || Number.isNaN(turns)) return { matched: 0, changed: 0, skipped: 0 };

    const normalizedTurns = Math.max(0, Math.floor(turns));
    let matched = 0;
    let changed = 0;
    let skipped = 0;
    for (let i = 0; i < list.length; ++i) {
        const field = list[i];
        if (!field || !$.fieldHasCategory(field, normalized)) continue;
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

Game_Map.prototype.addStacksXAllFieldMatchesByCategory = function(category, stackIndex, stacksDelta, subject, item) {
    const list = this.fields();
    const normalized = $.normalizeFieldCategoryName(category);
    const delta = $.normalizeStacksValue(stacksDelta);
    const index = $.normalizeStacksIndex(stackIndex);
    if (!normalized) return { matched: 0, changed: 0, removed: 0, stackIndex: index };

    let matched = 0;
    let changed = 0;
    let removed = 0;

    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (!field || !$.fieldHasCategory(field, normalized)) continue;
        matched += 1;

        const result = $.processFieldStacksXChange(field, index, $.getFieldStacksX(field, index) + delta, subject, item);
        if (!result.changed) continue;
        changed += 1;

        if (result.removed) {
            const removedField = this._removeAtIndex(i);
            if (removedField) {
                removed += 1;
                $.evalFieldDestructionForField(removedField, subject || null, item || null);
            }
        }
    }

    return { matched: matched, changed: changed, removed: removed, stackIndex: index };
};

Game_Map.prototype.setStacksXAllFieldMatchesByCategory = function(category, stackIndex, stacksValue, subject, item) {
    const list = this.fields();
    const normalized = $.normalizeFieldCategoryName(category);
    const index = $.normalizeStacksIndex(stackIndex);
    if (!normalized) return { matched: 0, changed: 0, removed: 0, stackIndex: index };

    let matched = 0;
    let changed = 0;
    let removed = 0;

    for (let i = list.length - 1; i >= 0; --i) {
        const field = list[i];
        if (!field || !$.fieldHasCategory(field, normalized)) continue;
        matched += 1;

        const result = $.processFieldStacksXChange(field, index, stacksValue, subject, item);
        if (!result.changed) continue;
        changed += 1;

        if (result.removed) {
            const removedField = this._removeAtIndex(i);
            if (removedField) {
                removed += 1;
                $.evalFieldDestructionForField(removedField, subject || null, item || null);
            }
        }
    }

    return { matched: matched, changed: changed, removed: removed, stackIndex: index };
};

Game_Map.prototype.addStacksAllFieldMatchesByCategory = function(category, stacksDelta, subject, item) {
    return this.addStacksXAllFieldMatchesByCategory(category, 0, stacksDelta, subject, item);
};

Game_Map.prototype.setStacksAllFieldMatchesByCategory = function(category, stacksValue, subject, item) {
    return this.setStacksXAllFieldMatchesByCategory(category, 0, stacksValue, subject, item);
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

        const parsedActions = $.parseAdvActionsFromNote(obj.note || '');
        const parsedCategories = $.parseFieldCategoriesFromNote(obj.note || '');
        obj.Categories = parsedCategories.slice();
        obj.TempCategories = [];
        obj.AllCategories = parsedCategories.slice();
        obj.categories = obj.Categories;
        obj.tempCategories = obj.TempCategories;
        obj.allCategories = obj.AllCategories;
        obj.jakeAdvSet = parsedActions.set;
        obj.jakeAdvAdds = parsedActions.adds;
        obj.jakeAdvRemoves = parsedActions.removes;
        obj.jakeAdvRemoveAll = parsedActions.removeAll;
        obj.jakeAdvRemCategory = parsedActions.remCategory;
        obj.jakeAdvCustomRemCategory = parsedActions.customRemCategory;
        obj.jakeAdvAddTurns = parsedActions.addTurns;
        obj.jakeAdvAddTurnsCategory = parsedActions.addTurnsCategory;
        obj.jakeAdvSetTurns = parsedActions.setTurns;
        obj.jakeAdvSetTurnsCategory = parsedActions.setTurnsCategory;
        obj.jakeAdvStackAdds = parsedActions.stackAdds;
        obj.jakeAdvStacksAddCategory = parsedActions.stacksAddCategory;
        obj.jakeAdvStackAddAll = parsedActions.stackAddAll;
        obj.jakeAdvStackXAdds = parsedActions.stackXAdds;
        obj.jakeAdvStacksXAddCategory = parsedActions.stacksXAddCategory;
        obj.jakeAdvStackXAddAll = parsedActions.stackXAddAll;
        obj.jakeAdvStacksSet = parsedActions.stacksSet;
        obj.jakeAdvStacksSetCategory = parsedActions.stacksSetCategory;
        obj.jakeAdvStacksSetAll = parsedActions.stacksSetAll;
        obj.jakeAdvStacksXSet = parsedActions.stacksXSet;
        obj.jakeAdvStacksXSetCategory = parsedActions.stacksXSetCategory;
        obj.jakeAdvStacksXSetAll = parsedActions.stacksXSetAll;
        obj.jakeAdvAuxValAdds = parsedActions.auxValAdds;
        obj.jakeAdvAuxValAddAll = parsedActions.auxValAddAll;
        obj.jakeAdvAuxValSet = parsedActions.auxValSet;
        obj.jakeAdvAuxValSetAll = parsedActions.auxValSetAll;
    }
};

const Game_Map_processFieldNotetags_Multi = Game_Map.prototype.processFieldNotetags;
Game_Map.prototype.processFieldNotetags = function() {
    Game_Map_processFieldNotetags_Multi.call(this);
    const parsedActions = $.parseAdvActionsFromNote($dataMap.note || '');
    const orderedActions = parsedActions.ordered;
    for (let i = 0; i < orderedActions.length; ++i) {
        const action = orderedActions[i];
        $.applyAdvMapAction(this, action.type, action.entry);
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

BattleManager._applyAdvCategoryActionList = function(actionList, actionType, subject, actionItem) {
    if (!actionList || actionList.length <= 0) return;
    for (let i = 0; i < actionList.length; ++i) {
        const entry = actionList[i];
        const category = $.normalizeFieldCategoryName(entry && entry.category);
        if (!category) continue;

        if (actionType === 'remove') {
            const removed = $gameMap.removeAllFieldMatchesByCategory(category, Number(entry.turns || 0));
            for (let r = 0; r < removed.length; ++r) {
                $.evalFieldDestructionForField(removed[r], subject, actionItem);
            }
        } else if (actionType === 'addTurns') {
            if (entry.hasTurns) {
                $gameMap.addTurnsAllFieldMatchesByCategory(category, Number(entry.turns));
            }
        } else if (actionType === 'setTurns') {
            if (entry.hasTurns && Number(entry.turns) >= 0) {
                $gameMap.setTurnsAllFieldMatchesByCategory(category, Number(entry.turns));
            }
        } else if (actionType === 'stacksAdd') {
            const stacks = entry.hasTurns ? entry.turns : 1;
            $gameMap.addStacksAllFieldMatchesByCategory(category, stacks, subject, actionItem);
        } else if (actionType === 'stacksSet') {
            const stacks = entry.hasTurns ? entry.turns : 1;
            $gameMap.setStacksAllFieldMatchesByCategory(category, stacks, subject, actionItem);
        } else if (actionType === 'stacksXAdd') {
            const stacks = entry.hasTurns ? entry.turns : 1;
            $gameMap.addStacksXAllFieldMatchesByCategory(category, entry.stackIndex, stacks, subject, actionItem);
        } else if (actionType === 'stacksXSet') {
            const stacks = entry.hasTurns ? entry.turns : 1;
            $gameMap.setStacksXAllFieldMatchesByCategory(category, entry.stackIndex, stacks, subject, actionItem);
        }
    }
};

BattleManager._resolveCustomRemoveFieldCategoryValue = function(entry, subject, actionItem) {
    const category = $.normalizeFieldCategoryName(entry && entry.category);
    if (!category) return 0;
    let value = 1;
    const formula = String(entry && entry.formula || '');
    if (!formula) return value;

    const obj = actionItem && actionItem.object ? actionItem.object() : null;
    const item = obj || actionItem || null;
    const skill = item;
    const a = subject || null;
    const user = subject || null;
    const b = null;
    const target = null;
    const s = $gameSwitches ? $gameSwitches._data : [];
    const v = $gameVariables ? $gameVariables._data : [];

    try {
        eval(formula);
    } catch (e) {
        console.error('CUSTOM REMOVE FIELD CATEGORY ERROR');
        console.error(formula);
        console.error(e);
    }
    return Math.max(0, Math.floor(Number(value || 0)));
};

BattleManager._applyAdvCustomCategoryActionList = function(actionList, subject, actionItem) {
    if (!actionList || actionList.length <= 0) return;
    for (let i = 0; i < actionList.length; ++i) {
        const entry = actionList[i];
        const category = $.normalizeFieldCategoryName(entry && entry.category);
        if (!category) continue;
        const count = this._resolveCustomRemoveFieldCategoryValue(entry, subject, actionItem);
        if (count <= 0) continue;
        const removed = $gameMap.removeXFieldMatchesByCategory(category, count, 0);
        for (let r = 0; r < removed.length; ++r) {
            $.evalFieldDestructionForField(removed[r], subject, actionItem);
        }
    }
};

BattleManager._applyAdvStackActionList = function(actionList, isSet, isAll, subject, actionItem) {
    if (!actionList || actionList.length <= 0) return;
    for (let i = 0; i < actionList.length; ++i) {
        const entry = actionList[i];
        const baseFieldId = $.resolveAdvActionToBaseFieldId(entry);
        if (!$.isValidLoadedFieldId(baseFieldId)) continue;

        const rawValue = entry.hasTurns ? entry.turns : 1;
        const stacksValue = $.normalizeStacksValue(rawValue);

        if (isSet) {
            if (isAll) {
                $gameMap.setStacksAllFieldMatches(baseFieldId, stacksValue, subject, actionItem);
            } else {
                $gameMap.setStacksFirstFieldMatch(baseFieldId, stacksValue, subject, actionItem);
            }
        } else if (isAll) {
            $gameMap.addStacksAllFieldMatches(baseFieldId, stacksValue, subject, actionItem);
        } else {
            $gameMap.addStacksFirstFieldMatch(baseFieldId, stacksValue, subject, actionItem);
        }
    }
};

BattleManager._applyAdvStackXActionList = function(actionList, isSet, isAll, subject, actionItem) {
    if (!actionList || actionList.length <= 0) return;
    for (let i = 0; i < actionList.length; ++i) {
        const entry = actionList[i];
        const baseFieldId = $.resolveAdvActionToBaseFieldId(entry);
        if (!$.isValidLoadedFieldId(baseFieldId)) continue;

        const stackIndex = $.normalizeStacksIndex(entry.stackIndex);
        const rawValue = entry.hasTurns ? entry.turns : 1;
        const stacksValue = $.normalizeStacksValue(rawValue);

        if (isSet) {
            if (isAll) {
                $gameMap.setStacksXAllFieldMatches(baseFieldId, stackIndex, stacksValue, subject, actionItem);
            } else {
                $gameMap.setStacksXFirstFieldMatch(baseFieldId, stackIndex, stacksValue, subject, actionItem);
            }
        } else if (isAll) {
            $gameMap.addStacksXAllFieldMatches(baseFieldId, stackIndex, stacksValue, subject, actionItem);
        } else {
            $gameMap.addStacksXFirstFieldMatch(baseFieldId, stackIndex, stacksValue, subject, actionItem);
        }
    }
};

BattleManager._applyAdvAuxValActionList = function(actionList, isSet, isAll) {
    if (!actionList || actionList.length <= 0) return;
    for (let i = 0; i < actionList.length; ++i) {
        const entry = actionList[i];
        const baseFieldId = $.resolveAdvActionToBaseFieldId(entry);
        if (!$.isValidLoadedFieldId(baseFieldId)) continue;
        if (!entry.hasTurns) continue;
        if (isSet) {
            if (isAll) {
                $gameMap.setAuxValAllFieldMatches(baseFieldId, entry.turns);
            } else {
                $gameMap.setAuxValFirstFieldMatch(baseFieldId, entry.turns);
            }
        } else if (isAll) {
            $gameMap.addAuxValAllFieldMatches(baseFieldId, entry.turns);
        } else {
            $gameMap.addAuxValFirstFieldMatch(baseFieldId, entry.turns);
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
        this._applyAdvCategoryActionList(itemObject.jakeAdvRemCategory, 'remove', this._subject, item);
        this._applyAdvCustomCategoryActionList(itemObject.jakeAdvCustomRemCategory, this._subject, item);
        this._applyAdvTurnsActionList(itemObject.jakeAdvAddTurns, false);
        this._applyAdvCategoryActionList(itemObject.jakeAdvAddTurnsCategory, 'addTurns', this._subject, item);
        this._applyAdvTurnsActionList(itemObject.jakeAdvSetTurns, true);
        this._applyAdvCategoryActionList(itemObject.jakeAdvSetTurnsCategory, 'setTurns', this._subject, item);
        this._applyAdvStackActionList(itemObject.jakeAdvStackAddAll, false, true, this._subject, item);
        this._applyAdvStackActionList(itemObject.jakeAdvStackAdds, false, false, this._subject, item);
        this._applyAdvCategoryActionList(itemObject.jakeAdvStacksAddCategory, 'stacksAdd', this._subject, item);
        this._applyAdvStackXActionList(itemObject.jakeAdvStackXAddAll, false, true, this._subject, item);
        this._applyAdvStackXActionList(itemObject.jakeAdvStackXAdds, false, false, this._subject, item);
        this._applyAdvCategoryActionList(itemObject.jakeAdvStacksXAddCategory, 'stacksXAdd', this._subject, item);
        this._applyAdvStackActionList(itemObject.jakeAdvStacksSetAll, true, true, this._subject, item);
        this._applyAdvStackActionList(itemObject.jakeAdvStacksSet, true, false, this._subject, item);
        this._applyAdvCategoryActionList(itemObject.jakeAdvStacksSetCategory, 'stacksSet', this._subject, item);
        this._applyAdvStackXActionList(itemObject.jakeAdvStacksXSetAll, true, true, this._subject, item);
        this._applyAdvStackXActionList(itemObject.jakeAdvStacksXSet, true, false, this._subject, item);
        this._applyAdvCategoryActionList(itemObject.jakeAdvStacksXSetCategory, 'stacksXSet', this._subject, item);
        this._applyAdvAuxValActionList(itemObject.jakeAdvAuxValAddAll, false, true);
        this._applyAdvAuxValActionList(itemObject.jakeAdvAuxValAdds, false, false);
        this._applyAdvAuxValActionList(itemObject.jakeAdvAuxValSetAll, true, true);
        this._applyAdvAuxValActionList(itemObject.jakeAdvAuxValSet, true, false);

        const adds = itemObject.jakeAdvAdds || [];
        for (let i = 0; i < adds.length; ++i) {
            const baseFieldId = $.resolveAdvActionToBaseFieldId(adds[i]);
            if (!$.isValidLoadedFieldId(baseFieldId)) continue;
            if ($.addFieldRespectingMaxCopies(baseFieldId, adds[i].turns, this._subject, item)) {
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

scriptCallScope.fieldStackCount = function(fieldNameOrId) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return 0;

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        return $.getFieldStacksX(field, 0);
    }
    return 0;
};

scriptCallScope.fieldStackXCount = function(fieldNameOrId, stackIndex) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return 0;
    const index = $.normalizeStacksIndex(stackIndex);

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        return $.getFieldStacksX(field, index);
    }
    return 0;
};

scriptCallScope.fieldAuxValCount = function(fieldNameOrId) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return 0;

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        return $.getFieldAuxVal(field);
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

scriptCallScope.tempAddCategToField = function(fieldNameOrId, categ) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return false;
    const category = $.normalizeFieldCategoryName(categ);
    if (!category) return false;

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        return !!(field && field.tempAddCategory && field.tempAddCategory(category));
    }
    return false;
};

scriptCallScope.tempAddCategToAllFields = function(fieldNameOrId, categ) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return 0;
    const category = $.normalizeFieldCategoryName(categ);
    if (!category) return 0;

    const fields = $.getActiveFieldListSafe();
    let changed = 0;
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        if (field && field.tempAddCategory && field.tempAddCategory(category)) {
            changed += 1;
        }
    }
    return changed;
};

scriptCallScope.tempRemCategFromField = function(fieldNameOrId, categ) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return false;
    const category = $.normalizeFieldCategoryName(categ);
    if (!category) return false;

    const fields = $.getActiveFieldListSafe();
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        return !!(field && field.tempRemoveCategory && field.tempRemoveCategory(category));
    }
    return false;
};

scriptCallScope.tempRemCategFromAllFields = function(fieldNameOrId, categ) {
    const query = $.parseFieldQuery(fieldNameOrId);
    if (!query.hasValue) return 0;
    const category = $.normalizeFieldCategoryName(categ);
    if (!category) return 0;

    const fields = $.getActiveFieldListSafe();
    let changed = 0;
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        if (!$.doesFieldMatchQuery(field, query)) continue;
        if (field && field.tempRemoveCategory && field.tempRemoveCategory(category)) {
            changed += 1;
        }
    }
    return changed;
};

scriptCallScope.categoriesOfFieldIndex = function(index) {
    const fields = $.getActiveFieldListSafe();
    if (!Array.isArray(fields) || fields.length <= 0) return [];
    let clampedIndex = Math.floor(Number(index));
    if (Number.isNaN(clampedIndex)) clampedIndex = 0;
    clampedIndex = Math.max(0, Math.min(clampedIndex, fields.length - 1));
    const field = fields[clampedIndex];
    if (!field) return [];
    $.ensureFieldCategoryState(field);
    return field.Categories;
};

scriptCallScope.tempCategoriesOfFieldIndex = function(index) {
    const fields = $.getActiveFieldListSafe();
    if (!Array.isArray(fields) || fields.length <= 0) return [];
    let clampedIndex = Math.floor(Number(index));
    if (Number.isNaN(clampedIndex)) clampedIndex = 0;
    clampedIndex = Math.max(0, Math.min(clampedIndex, fields.length - 1));
    const field = fields[clampedIndex];
    if (!field) return [];
    $.ensureFieldCategoryState(field);
    return field.TempCategories;
};

scriptCallScope.allCategoriesOfFieldIndex = function(index) {
    const fields = $.getActiveFieldListSafe();
    if (!Array.isArray(fields) || fields.length <= 0) return [];
    let clampedIndex = Math.floor(Number(index));
    if (Number.isNaN(clampedIndex)) clampedIndex = 0;
    clampedIndex = Math.max(0, Math.min(clampedIndex, fields.length - 1));
    const field = fields[clampedIndex];
    if (!field) return [];
    $.ensureFieldCategoryState(field);
    return field.AllCategories;
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

scriptCallScope.addTurnsFieldAtIndex = function(index, turns) {
    if (!$gameMap || !$gameMap.fields) return false;

    const list = $gameMap.fields();
    if (!Array.isArray(list) || list.length <= 0) return false;

    const delta = Number(turns);
    if (Number.isNaN(delta)) return false;

    let clampedIndex = Math.floor(Number(index));
    if (Number.isNaN(clampedIndex)) clampedIndex = 0;
    clampedIndex = Math.max(0, Math.min(clampedIndex, list.length - 1));

    const field = list[clampedIndex];
    if (!field || !field.turnsLeft) return false;
    if (field.turnsLeft() <= 0) return false;

    const updatedTurns = Math.max(0, Math.floor(field.turnsLeft() + delta));
    field._turnsLeft = updatedTurns;
    field._isExpiring = updatedTurns > 0 && (field.fieldId() !== $gameMap.defaultFieldId());
    return true;
};

scriptCallScope.addStacksFieldAtIndex = function(index, stacks) {
    return scriptCallScope.addStacksXFieldAtIndex(index, 0, stacks);
};

scriptCallScope.addStacksXFieldAtIndex = function(index, stackIndex, stacks) {
    if (!$gameMap || !$gameMap.fields) return false;

    const list = $gameMap.fields();
    if (!Array.isArray(list) || list.length <= 0) return false;

    const delta = $.normalizeStacksValue(stacks);
    const normalizedStackIndex = $.normalizeStacksIndex(stackIndex);

    let clampedIndex = Math.floor(Number(index));
    if (Number.isNaN(clampedIndex)) clampedIndex = 0;
    clampedIndex = Math.max(0, Math.min(clampedIndex, list.length - 1));

    const field = list[clampedIndex];
    if (!field) return false;

    const result = $.processFieldStacksXChange(field, normalizedStackIndex, $.getFieldStacksX(field, normalizedStackIndex) + delta, null, null);
    if (result.removed) {
        const removedField = $gameMap._removeAtIndex ? $gameMap._removeAtIndex(clampedIndex) : null;
        if (removedField) {
            $.evalFieldDestructionForField(removedField, null, null);
        }
    }
    return !!result.changed;
};

scriptCallScope.setStacksXFieldAtIndex = function(index, stackIndex, stacks) {
    if (!$gameMap || !$gameMap.fields) return false;

    const list = $gameMap.fields();
    if (!Array.isArray(list) || list.length <= 0) return false;

    const normalizedStackIndex = $.normalizeStacksIndex(stackIndex);

    let clampedIndex = Math.floor(Number(index));
    if (Number.isNaN(clampedIndex)) clampedIndex = 0;
    clampedIndex = Math.max(0, Math.min(clampedIndex, list.length - 1));

    const field = list[clampedIndex];
    if (!field) return false;

    const result = $.processFieldStacksXChange(field, normalizedStackIndex, stacks, null, null);
    if (result.removed) {
        const removedField = $gameMap._removeAtIndex ? $gameMap._removeAtIndex(clampedIndex) : null;
        if (removedField) {
            $.evalFieldDestructionForField(removedField, null, null);
        }
    }
    return !!result.changed;
};

scriptCallScope.setStacksFieldAtIndex = function(index, stacks) {
    return scriptCallScope.setStacksXFieldAtIndex(index, 0, stacks);
};

scriptCallScope.addAuxValFieldAtIndex = function(index, value) {
    if (!$gameMap || !$gameMap.fields) return false;
    const list = $gameMap.fields();
    if (!Array.isArray(list) || list.length <= 0) return false;

    let clampedIndex = Math.floor(Number(index));
    if (Number.isNaN(clampedIndex)) clampedIndex = 0;
    clampedIndex = Math.max(0, Math.min(clampedIndex, list.length - 1));

    const field = list[clampedIndex];
    if (!field) return false;
    $.addFieldAuxVal(field, Number(value || 0));
    return true;
};

scriptCallScope.setAuxValFieldAtIndex = function(index, value) {
    if (!$gameMap || !$gameMap.fields) return false;
    const list = $gameMap.fields();
    if (!Array.isArray(list) || list.length <= 0) return false;

    let clampedIndex = Math.floor(Number(index));
    if (Number.isNaN(clampedIndex)) clampedIndex = 0;
    clampedIndex = Math.max(0, Math.min(clampedIndex, list.length - 1));

    const field = list[clampedIndex];
    if (!field) return false;
    $.setFieldAuxVal(field, value);
    return true;
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

    if (command.match(/REM(?:OVE)?[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldCategoryArgs(args);
        if (!parsed.category) {
            console.warn('RemAdvFieldCategory ignored: missing category argument.');
            return;
        }
        const removed = $gameMap.removeAllFieldMatchesByCategory(parsed.category, parsed.turns);
        for (let i = 0; i < removed.length; ++i) {
            $.evalFieldDestructionForField(removed[i], null, null);
        }
        return;
    }

    if (command.match(/ADD[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldCategoryArgs(args);
        if (!parsed.category || !parsed.hasTurns) {
            console.warn('AddTurnsAdvFieldCategory ignored: missing/invalid category or turns argument.');
            return;
        }
        $gameMap.addTurnsAllFieldMatchesByCategory(parsed.category, parsed.turns);
        return;
    }

    if (command.match(/SET[-_ ]?TURNS[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldCategoryArgs(args);
        if (!parsed.category || !parsed.hasTurns || parsed.turns < 0) {
            console.warn('SetTurnsAdvFieldCategory ignored: missing/invalid category or turns argument.');
            return;
        }
        $gameMap.setTurnsAllFieldMatchesByCategory(parsed.category, parsed.turns);
        return;
    }

    if (command.match(/STACKS?[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldCategoryArgs(args);
        if (!parsed.category) {
            console.warn('StacksAddAdvFieldCategory ignored: missing category argument.');
            return;
        }
        const stacks = parsed.hasTurns ? parsed.turns : 1;
        $gameMap.addStacksAllFieldMatchesByCategory(parsed.category, stacks, null, null);
        return;
    }

    if (command.match(/STACKS?[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldCategoryArgs(args);
        if (!parsed.category) {
            console.warn('StacksSetAdvFieldCategory ignored: missing category argument.');
            return;
        }
        const stacks = parsed.hasTurns ? parsed.turns : 1;
        $gameMap.setStacksAllFieldMatchesByCategory(parsed.category, stacks, null, null);
        return;
    }

    if (command.match(/STACKS?X[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldCategoryStacksXArgs(args);
        if (!parsed.category) {
            console.warn('StacksXAddAdvFieldCategory ignored: missing category argument.');
            return;
        }
        const stacks = parsed.hasStacks ? parsed.stacks : 1;
        $gameMap.addStacksXAllFieldMatchesByCategory(parsed.category, parsed.stackIndex, stacks, null, null);
        return;
    }

    if (command.match(/STACKS?X[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD[-_ ]?CATEGORY(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldCategoryStacksXArgs(args);
        if (!parsed.category) {
            console.warn('StacksXSetAdvFieldCategory ignored: missing category argument.');
            return;
        }
        const stacks = parsed.hasStacks ? parsed.stacks : 1;
        $gameMap.setStacksXAllFieldMatchesByCategory(parsed.category, parsed.stackIndex, stacks, null, null);
        return;
    }

    if (command.match(/STACKS?X[-_ ]?ADD[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldStacksXArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('StackXAddAllAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const stacks = parsed.hasStacks ? parsed.stacks : 1;
        $gameMap.addStacksXAllFieldMatches(baseFieldId, parsed.stackIndex, stacks, null, null);
        return;
    }

    if (command.match(/STACKS?X[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldStacksXArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('StackXAddAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const stacks = parsed.hasStacks ? parsed.stacks : 1;
        $gameMap.addStacksXFirstFieldMatch(baseFieldId, parsed.stackIndex, stacks, null, null);
        return;
    }

    if (command.match(/STACKS?X[-_ ]?SET[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldStacksXArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('StacksXSetAllAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const stacks = parsed.hasStacks ? parsed.stacks : 1;
        $gameMap.setStacksXAllFieldMatches(baseFieldId, parsed.stackIndex, stacks, null, null);
        return;
    }

    if (command.match(/STACKS?X[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldStacksXArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('StacksXSetAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const stacks = parsed.hasStacks ? parsed.stacks : 1;
        $gameMap.setStacksXFirstFieldMatch(baseFieldId, parsed.stackIndex, stacks, null, null);
        return;
    }

    if (command.match(/AUXVAL[-_ ]?ADD[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('AuxValAddAllAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        if (!parsed.hasTurns) return;
        $gameMap.addAuxValAllFieldMatches(baseFieldId, parsed.turns);
        return;
    }

    if (command.match(/AUXVAL[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('AuxValAddAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        if (!parsed.hasTurns) return;
        $gameMap.addAuxValFirstFieldMatch(baseFieldId, parsed.turns);
        return;
    }

    if (command.match(/AUXVAL[-_ ]?SET[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('AuxValSetAllAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        if (!parsed.hasTurns) return;
        $gameMap.setAuxValAllFieldMatches(baseFieldId, parsed.turns);
        return;
    }

    if (command.match(/AUXVAL[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('AuxValSetAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        if (!parsed.hasTurns) return;
        $gameMap.setAuxValFirstFieldMatch(baseFieldId, parsed.turns);
        return;
    }

    if (command.match(/STACK[-_ ]?ADD[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('StackAddAllAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const stacks = parsed.hasTurns ? parsed.turns : 1;
        $gameMap.addStacksAllFieldMatches(baseFieldId, stacks, null, null);
        return;
    }

    if (command.match(/STACK[-_ ]?ADD[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('StackAddAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const stacks = parsed.hasTurns ? parsed.turns : 1;
        $gameMap.addStacksFirstFieldMatch(baseFieldId, stacks, null, null);
        return;
    }

    if (command.match(/STACKS[-_ ]?SET[-_ ]?ALL[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('StacksSetAllAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const stacks = parsed.hasTurns ? parsed.turns : 1;
        $gameMap.setStacksAllFieldMatches(baseFieldId, stacks, null, null);
        return;
    }

    if (command.match(/STACKS[-_ ]?SET[-_ ]?ADV[-_ ]?FIELD(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('StacksSetAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        const stacks = parsed.hasTurns ? parsed.turns : 1;
        $gameMap.setStacksFirstFieldMatch(baseFieldId, stacks, null, null);
        return;
    }

    if (command.match(/ADD[-_ ]?ADV[-_ ]?(?:FIELD|ARRAY)(?:[-_ ]?EFFECT)?/i)) {
        const parsed = $.parseSetAdvFieldArgs(args);
        const baseFieldId = $.toBaseFieldId($.resolveAdvFieldArg(parsed.fieldArg));
        if (!$.isValidLoadedFieldId(baseFieldId)) {
            console.warn('AddAdvField ignored: "' + parsed.fieldArg + '" maps to invalid ID ' + baseFieldId + '.');
            return;
        }
        if ($.addFieldRespectingMaxCopies(baseFieldId, parsed.turns, null, null)) {
            $.runFieldStartEval(baseFieldId);
        } else {
            const maxCopies = $.fieldMaxCopies(baseFieldId);
            if (maxCopies > 0) {
                console.warn('AddAdvField ignored: "' + parsed.fieldArg + '" reached Max Copies (' + maxCopies + ').');
            }
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
