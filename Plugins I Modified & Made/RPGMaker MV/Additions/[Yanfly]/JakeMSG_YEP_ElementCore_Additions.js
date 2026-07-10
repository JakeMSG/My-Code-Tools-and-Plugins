//=============================================================================
// Addition to YEP plugin "ElementCore", made by JakeMSG
// JakeMSG_YEP_ElementCore_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_ElementCore_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.EML_JakeMSGAdd = Yanfly.EML_JakeMSGAdd || {};
Yanfly.EML_JakeMSGAdd.version = 1.0;

//=============================================================================
 /*:
 * @plugindesc v1.0 (Requires YEP_ElementCore.js) Runtime element script calls,
 * Composite Elements, elemental rate script call & popup element names.
 * @author JakeMSG
 * v1.0
 * 
============ Change Log ============
1.0 - 7.10th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_ElementCore.
 * Make sure this plugin is located UNDER YEP_ElementCore in the plugin list
 * (and, if used, under YEP_ElementReflect, YEP_ElementAbsorb and
 * YEP_BattleEngineCore as well).
 * For the damage-popup feature, place this plugin UNDER the popup plugin that
 * actually draws the popups (YEP_BattleEngineCore and/or
 * SRD_BattlePopupCustomizer) so the element name can hook into them.
 *
 * It adds the following features:
 *
 *   1) Runtime script calls to change/add/remove/reset the elements of
 *      Skills, Items, and of the next action(s) of party/troop members.
 *
 *   2) "Composite Elements": elements (existing or brand new) that carry both
 *      their own elemental rate AND the (derived) elemental rates of their
 *      "component" elements. Composite Elements can also be "combined" into a
 *      Skill/Item/action automatically when their component elements are used
 *      together.
 *
 *   3) Script calls to change (changeElementalRate) or reset
 *      (resetElementalRates) a party/troop member's elemental RATE (how much
 *      damage they take from given elements) at runtime.
 *
 *   4) Showing the element name used in the final damage calculation inside the
 *      HP damage / heal / drain popups (works with the default / YEP_
 *      BattleEngineCore popups and with SRD_BattlePopupCustomizer).
 *
 * All features stay compatible with YEP_ElementReflect and YEP_ElementAbsorb.
 *
 * ============================================================================
 * Script Calls - Runtime Element Modification
 * ============================================================================
 *
 * These are (global) script calls. Use them from an event "Script" command,
 * from a "Conditional Branch > Script", from a damage formula, etc.
 * Every parameter is optional and has a default value.
 *
 * ----------------------------------------------------------------------------
 * changeElements(skillOrItemOrBattler, IDs, elementArray, permanence)
 * ----------------------------------------------------------------------------
 * Overwrites (replaces) the current elements of the affected object(s).
 *
 * ----------------------------------------------------------------------------
 * addElements(skillOrItemOrBattler, IDs, elementArray, permanence)
 * ----------------------------------------------------------------------------
 * Adds elements ON TOP of the current elements (after any changeElements has
 * been applied). Adding an element that already exists is ignored. This call
 * can be repeated to keep adding more elements.
 *
 * ----------------------------------------------------------------------------
 * removeElements(skillOrItemOrBattler, IDs, elementArray)
 * ----------------------------------------------------------------------------
 * Removes the specified elements from the affected object(s). It can only
 * remove elements that were added through these script calls; it can NOT
 * remove the default database elements of an object unless a changeElements
 * call was used on it first (which replaces those defaults). It removes from
 * script-call modifications regardless of their permanence.
 *
 * ----------------------------------------------------------------------------
 * resetElements(skillOrItemOrBattler, IDs)
 * ----------------------------------------------------------------------------
 * Removes ALL modifications made by these script calls on the affected
 * object(s), reverting them to only their default (database) elements. It
 * resets modifications regardless of their permanence.
 *
 * ----------------------------------------------------------------------------
 * Parameters
 * ----------------------------------------------------------------------------
 *
 * skillOrItemOrBattler  (string, default "skill")
 *   Accepts "skill", "item", "partyMem" or "troopMem".
 *     - "skill" / "item" : affects the Skill(s) / Item(s) of the given ID(s).
 *     - "partyMem"       : affects any subsequent action of the party member(s)
 *                          at the given position ID(s).
 *     - "troopMem"       : affects any subsequent action of the troop member(s)
 *                          at the given position ID(s).
 *
 * IDs  (array, default [0])
 *   One or more numeric IDs, enclosed in square brackets and separated by
 *   commas. An interval can be written with a "-" between two numbers, which
 *   includes both ends. May be passed as a real array or as a string.
 *     - For "skill" / "item"          : the database entry ID(s).
 *     - For "partyMem" / "troopMem"   : the position ID(s), STARTING AT 0.
 *   Examples: [1]   [1,3,5]   [1-4]   "[1, 3, 5-8]"
 *
 * elementArray  (array, default [0])
 *   One or more element IDs or element Names (new elements included),
 *   enclosed in square brackets and separated by commas. Numeric intervals
 *   ("-") are supported. May be passed as a real array or as a string.
 *   Examples: [2]   [2,4,6]   [2-5]   "[Fire, Ice, 7-9]"
 *
 * permanence  (string, default "once")
 *   Accepts "once", "temporary" or "permanent".
 *     - "once"      : applies only to the NEXT usage of the Skill/Item, or the
 *                     NEXT action of the party/troop member, then is consumed.
 *     - "temporary" : keeps applying, but is NOT written to the save file.
 *     - "permanent" : keeps applying AND is written to the save file.
 *   (removeElements / resetElements have no permanence; when they edit a
 *   permanent modification, the edited result is what gets saved.)
 *
 * ----------------------------------------------------------------------------
 * Script Call Examples
 * ----------------------------------------------------------------------------
 *
 *   changeElements("skill", [10], ["Fire"], "permanent")
 *     - Skill 10 will permanently deal Fire damage only.
 *
 *   addElements("skill", [10], ["Ice"], "temporary")
 *     - Skill 10 also deals Ice (this session only), on top of the above.
 *
 *   addElements("partyMem", [0], ["Wind"], "once")
 *     - The 1st party member's next action also uses Wind.
 *
 *   removeElements("skill", [10], ["Ice"])
 *     - Removes the Ice modification from Skill 10.
 *
 *   resetElements("item", [5,6,7])
 *     - Items 5, 6 and 7 go back to their database elements.
 *
 * ============================================================================
 * Script Call - Runtime Elemental Rate (changeElementalRate)
 * ============================================================================
 *
 * ----------------------------------------------------------------------------
 * changeElementalRate(Battler, IDs, elementArray, rate, permanence)
 * ----------------------------------------------------------------------------
 * Sets the elemental RATE (how much damage a battler TAKES from the given
 * elements) for the specified party/troop member(s). This is the defender-side
 * rate, unlike the element-modification calls above which change which elements
 * an action HAS.
 *
 * Battler  (string, default "party")
 *   Accepts "party" or "troop": whether to affect a party member or a troop
 *   member.
 *
 * IDs  (array, default [0])
 *   The position ID(s) (STARTING AT 0) of the party/troop member(s) to affect.
 *   Same syntax as the other calls (numbers, commas, "-" intervals, may be a
 *   real array or a string). Examples: [0]   [0,2]   [0-3]   "[0, 2-4]"
 *
 * elementArray  (array, default [0])
 *   Exactly like in the other script calls (element IDs or Names, intervals).
 *
 * rate  (number, default 100)
 *   The rate to set, as a PERCENTAGE without the "%" sign. 100 = normal (x1.0),
 *   50 = half damage taken, 200 = double, 0 = immune, negative = absorb-like.
 *
 * permanence  (string, default "once")
 *   Exactly like in the other script calls ("once", "temporary", "permanent").
 *   For "once", the override lasts until (and is consumed right after) the NEXT
 *   damage calculation performed ON that member. In other words it applies to
 *   the very next hit that computes elemental damage against them, then clears.
 *   (Non-damaging actions targeting the member do NOT consume a "once" rate.)
 *
 * Notes:
 *   - This override takes priority over YEP forced / absorbed element rates for
 *     the listed elements. It becomes the battler's BASE rate for them, so any
 *     Composite Element derivation still builds on top of it.
 *
 * Examples:
 *   changeElementalRate("party", [0], ["Fire"], 50, "temporary")
 *     - The 1st party member takes half Fire damage (this session).
 *   changeElementalRate("troop", [0-2], ["Ice", "Water"], 200, "once")
 *     - The first 3 troop members take double Ice/Water damage on the next hit
 *       that deals elemental damage to each of them.
 *
 * ----------------------------------------------------------------------------
 * resetElementalRates(Battler, IDs)
 * ----------------------------------------------------------------------------
 * Removes ALL changeElementalRate overrides (regardless of their permanence)
 * for the specified party/troop member(s), reverting their elemental rates back
 * to the values set in the database and notetags. Works like resetElements, but
 * for defender-side elemental RATES instead of an action's elements.
 *
 * Battler  (string, default "party")   -> "party" or "troop"
 * IDs      (array,  default [0])        -> member position ID(s), same syntax.
 *
 * Because it also removes "permanent" overrides, saving after a reset persists
 * the reset (it overwrites what was previously written to the save file).
 *
 * Examples:
 *   resetElementalRates("party", [0])       - clear rate overrides on member 0.
 *   resetElementalRates("troop", [0-3])     - clear on the first 4 troop members.
 *
 * ============================================================================
 * Composite Elements
 * ============================================================================
 *
 * A "Composite Element" is an element (existing, or created by this plugin)
 * that is defined as being made of one or more "component" elements. A battler's
 * resistance to a Composite Element automatically imposes a DERIVED elemental
 * rate on each of its component elements:
 *
 *   Component Element's Elemental Rate =
 *       Composite Element's Elemental Rate  *  Component Rate
 *
 * When the same element ends up having more than one elemental rate for the
 * same battler (for example its normal rate, and a rate derived from a
 * composite it is a component of), the plugin keeps one of them based on the
 * "Composites overwriting Component's Elemental Rates" parameter:
 *   - "Overwrite with Lower"       : keep the LOWER rate (less damage taken).
 *   - "Overwrite with Higher"      : keep the HIGHER rate (more damage taken).
 *   - "Closest to neutral (100%)"  : keep whichever rate is CLOSEST to 100%
 *                                    (the least resistant/vulnerable one).
 *   - "Farthest from neutral (100%)": keep whichever rate is FARTHEST from 100%
 *                                    (the most resistant/vulnerable one).
 *   - On an exact tie, nothing changes.
 *
 * (100% = a x1.0 multiplier. "Closest to neutral" compares |rate - 100%| and
 * keeps the smaller distance; "Farthest from neutral" keeps the larger one. So
 * e.g. between 60% and 130%, "Closest" keeps 130% (30 away) and "Farthest"
 * keeps 60% (40 away).)
 *
 * These composite adjustments are ALWAYS in effect for the battler's elemental
 * rates - they do NOT require the composite element to be present in the current
 * action. Any time a component element's rate is queried for a battler, it is
 * derived from that battler's rate for every composite it belongs to.
 *
 * Example: "Frost" is a Composite Element with component "Ice" at Component Rate
 * 0.5, and the parameter is set to "Overwrite with Lower". If a battler's Frost
 * rate is 80% and their Ice rate is 80%, their effective Ice rate becomes
 * min(80%, 80% * 0.5) = 40%.
 *
 * Note: because a newly created element defaults to a 100% rate, defining a
 * composite will influence its components' rates even if you never set the
 * composite's rate explicitly (e.g. with "Overwrite with Lower" and a component
 * rate of 0.5, the component is pulled toward min(base, 50%)). Set the
 * composite's rate (via database/notetags/changeElementalRate) accordingly.
 *
 * ----------------------------------------------------------------------------
 * Defining Composite Elements (plugin parameters)
 * ----------------------------------------------------------------------------
 *
 * Under "-- Existing Elements --" there is the list parameter "Elements".
 * Each entry turns an EXISTING element into a Composite Element and has:
 *   - ID/Name            : the ID or Name of the existing element to convert.
 *                          If it is not found, the entry is ignored.
 *   - Always Combinable  : True/False (see combinations below).
 *   - Component Elements : the list of components, each with:
 *         - ID/Name         : the component element's ID or Name.
 *         - Component Rate  : the conversion rate (see formats below).
 *
 * Under "-- New Elements --" there are 20 list parameters, "NewElements 1"
 * through "NewElements 20". Each entry CREATES a brand new element and then
 * makes it a Composite Element. Their sub-parameters are the same as above,
 * except "ID/Name" is replaced by "Name" (the name of the new element).
 *
 * New elements are appended AFTER the existing elements, in list order:
 * the first new element created gets the ID (last existing element ID + 1),
 * the next gets +2, and so on across NewElements 1..20. From then on, every
 * ID or Name lookup for elements (in this plugin, YEP_ElementCore,
 * YEP_ElementReflect, YEP_ElementAbsorb, and their notetags) also recognises
 * these new elements.
 *
 * Note: because new elements do not exist in the database editor, their base
 * elemental rate is 100% unless you change it via YEP_ElementCore notetags
 * (for example <Force Element NewName Rate: y%>), the changeElementalRate call
 * above, or via composite derivation.
 *
 * ----------------------------------------------------------------------------
 * Component Rate formats
 * ----------------------------------------------------------------------------
 *
 *   Multiplier   :  1.5      3.1      0.6
 *   Percentage   :  75%      120%     (converted to a multiplier automatically)
 *   Script       :  {code}   -> the code is evaluated; its result is used as
 *                              the multiplier. Inside the script, "target" is
 *                              the battler whose rate is being calculated.
 *                              Example: {target.hp < target.mhp/2 ? 2.0 : 1.0}
 *
 * ----------------------------------------------------------------------------
 * Nested Composite Elements
 * ----------------------------------------------------------------------------
 *
 * A component of a Composite Element may itself be a Composite Element. All
 * elemental rate derivations then cascade from the outer composite down to
 * each nested component, still following the Component Rate values and the
 * "Composites overwriting Component's Elemental Rates" parameter.
 *
 * ============================================================================
 * Elemental Combinations
 * ============================================================================
 *
 * When the component elements of a Composite Element are all present together
 * in the same Skill/Item/action, that Composite Element can be "combined": it
 * is automatically ADDED (alongside its components) to the element list of
 * that object.
 *
 * By default, a combination only happens if that Composite Element's
 * "Always Combinable" sub-parameter is True. You can override this with
 * notetags on the Skill, Item, Actor or Enemy involved:
 *
 *   <Allow All Elem. Combinations>
 *     - Forces ALL combinations to be possible, ignoring each composite's own
 *       "Always Combinable" setting.
 *
 *   <Allow Elem. Combinations: [ElementIDsOrNames]>
 *     - Enables combinations only for the listed Composite Elements (existing
 *       or new). Non-composite or unknown elements are ignored.
 *       Example: <Allow Elem. Combinations: [Steam, 42]>
 *
 *   <Deny All Elem. Combinations>
 *     - Forces ALL combinations to be stopped, ignoring "Always Combinable".
 *
 *   <Deny Elem. Combinations: [ElementIDsOrNames]>
 *     - Stops combinations only for the listed Composite Elements.
 *       Example: <Deny Elem. Combinations: [Steam]>
 *
 * Priority (highest first): Deny All > Deny Specific > Allow All >
 * Allow Specific > the composite's own "Always Combinable" setting.
 * Notetags from both the Skill/Item and the acting Actor/Enemy are considered.
 *
 * Combinations are also nest-able: after a Composite Element is combined in, if
 * it (together with other present elements) forms the components of another
 * Composite Element, that one is combined in too, and so on until no more
 * combinations are possible.
 *
 * ============================================================================
 * Element Name in Damage Popups
 * ============================================================================
 *
 * If the parameter '-- Show Element Name in Damage Popups --' is set to "Yes",
 * the HP damage popups (and the HP heal and HP drain popups) will show, right
 * after the damage number, the element name(s) involved in that popup's damage.
 *
 * Which element(s) are shown is controlled by the parameter
 * "Show only Final Damage Element name":
 *   - "Show only Final Damage Element name" (default) -> only the single element
 *     that was decisive in the final damage calculation is shown. That follows
 *     the item's multi-element rule: for the "Lowest" rule it is the element
 *     with the lowest rate, for "Highest" the element with the highest rate, and
 *     for Additive / Multiplicative / Average / custom rules it is the element
 *     whose rate is farthest from neutral (100%).
 *   - "Show all Element Names" -> every element used by the action is shown,
 *     each in order.
 *   - If the damage used NO element (a neutral / "Null" calculation), the popup
 *     shows the 'Name for the Element "Null"' text instead.
 *
 * Two popup back-ends are supported (no configuration needed - the plugin
 * detects which one is active). BOTH honour all the per-element overrides below
 * (Name, Icon, color, size, font, offsets):
 *
 *   A) The DEFAULT RMMV popups / YEP_BattleEngineCore popups
 *      -> the element name is appended as extra popup "digits" right after the
 *         damage number (e.g. "250 Fire"). It is positioned relative to the
 *         number and bounces with it.
 *
 *   B) SRD_BattlePopupCustomizer popups
 *      -> SRD draws its own HP number/text ("HP Damage Text" / "HP Heal Text"),
 *         then the element name is appended right after it as extra styled
 *         sprites that rise, fade and flash together with the popup (e.g. if
 *         your SRD text is "%1 HP" you get "250 HP Fire"). Because these are our
 *         own sprites (not part of SRD's uniform text), the per-element Icon /
 *         color / size / font / offset overrides all apply here too. When an
 *         override is left blank, the element text matches SRD's popup style.
 *
 * If both YEP_BattleEngineCore and SRD_BattlePopupCustomizer are enabled, the
 * one lower in the plugin list draws the visuals. SRD is designed to sit under
 * YEP_BattleEngineCore, so whenever SRD is enabled the plugin routes to the SRD
 * path; otherwise it uses the default / BEC path.
 *
 * By default each element is shown using its database Name. The
 * "- Elemental Texts overwrites -" list parameters ("Name Overwrites 1" through
 * "Name Overwrites 20") let you override, per element:
 *   - ID/Name  : the ID or Name of the element to affect (new elements too).
 *   - Name     : the text to show instead of the element's database name.
 *   - Icon     : an IconSet icon ID to draw with the name.
 *   - Show Icon Before or After Element Name : icon placement.
 *   - Text color : a CSS/hex color, e.g. #ff8800.
 *   - Text size  : a font size number.
 *   - Text font  : a font family name.
 *   - Text Offset X / Text Offset Y : pixel offsets that nudge this element's
 *     text (and its icon); positive X = right, positive Y = down. Only that
 *     element is moved; the following elements keep their position.
 * All of the above apply to BOTH popup back-ends. When a style field is left
 * blank the element text uses that back-end's default style.
 *
 * Notes:
 *   - This feature integrates with everything above: the shown elements are
 *     taken from the FINAL element list of the action (after script-call
 *     modifications, composites and combinations).
 *   - There is no longer a 'Remove the "HP" Text' option. On the SRD back-end
 *     you already control the whole text (including whether "HP" appears) via
 *     SRD's "HP Damage Text" / "HP Heal Text" parameters.
 *
 * IF NOTHING SHOWS UP (troubleshooting):
 *   1) RMMV reads parameter values from js/plugins.js (written by the editor),
 *      NOT from this file's comments. If you added/edited this plugin's params
 *      by hand, OPEN the Plugin Manager, double-click this plugin, confirm the
 *      "-- Show Element Name in Damage Popups --" option shows "Yes", and press
 *      OK so the editor re-saves the parameters. Then playtest again.
 *   2) Make sure the popup plugin that actually draws the popups is enabled and
 *      showing popups, and that THIS plugin is placed UNDER it (and under
 *      YEP_ElementCore).
 *
 * 
 * 
 * 
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * 
 * @param ---- General Settings ----
 * @default
 *
 * @param Composites overwriting Component's Elemental Rates
 * @parent ---- General Settings ----
 * @type select
 * @option Overwrite with Higher
 * @value Overwrite with Higher
 * @option Overwrite with Lower
 * @value Overwrite with Lower
 * @option Closest to neutral (100%)
 * @value Closest to neutral (100%)
 * @option Farthest from neutral (100%)
 * @value Farthest from neutral (100%)
 * @desc When an element has multiple rates (its own vs. derived from a composite), which rate is kept for the same battler.
 * @default Overwrite with Lower
 *
 * @param -- Show Element Name in Damage Popups --
 * @parent ---- General Settings ----
 * @type select
 * @option Yes
 * @value Yes
 * @option No
 * @value No
 * @desc Show the Element Name (used in the final damage calc) in HP damage/heal/drain popups. All params below only apply when set to "Yes".
 * @default No
 *
 * @param Name for the Element "Null"
 * @parent -- Show Element Name in Damage Popups --
 * @desc The name shown in the popup for the "Null" element (neutral rate, i.e. no element in the final damage calc).
 * @default Null
 * 
 * @param Show only Final Damage Element name
 * @parent -- Show Element Name in Damage Popups --
 * @type select
 * @option Show only Final Damage Element name
 * @value Show only Final Damage Element name
 * @option Show all Element Names
 * @value Show all Element Names
 * @desc Whether to show only the Element Name of the final damage element (used in the damage calculation) in the popup or show all the Element names used in the damage calculation.
 * @default Show only Final Damage Element name
 *
 * @param - Elemental Texts overwrites -
 * @parent -- Show Element Name in Damage Popups --
 * @default
 *
 * @param Name Overwrites 1
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 2
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 3
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 4
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 5
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 6
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 7
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 8
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 9
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 10
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 11
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 12
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 13
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 14
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 15
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 16
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 17
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 18
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 19
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param Name Overwrites 20
 * @parent - Elemental Texts overwrites -
 * @type struct<ElementalTextsOverwrite>[]
 * @desc Overwrite the text settings of elements used in the damage popups.
 * @default
 *
 * @param ---- Composite Elements ----
 * @default
 *
 * @param -- Existing Elements --
 * @parent ---- Composite Elements ----
 * @default
 *
 * @param Elements
 * @parent -- Existing Elements --
 * @type struct<CompositeExisting>[]
 * @desc Turn existing elements into Composite Elements.
 * @default
 *
 * @param -- New Elements --
 * @parent ---- Composite Elements ----
 * @default
 *
 * @param NewElements 1
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 2
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 3
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 4
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 5
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 6
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 7
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 8
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 9
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 10
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 11
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 12
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 13
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 14
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 15
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 16
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 17
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 18
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 19
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 *
 * @param NewElements 20
 * @parent -- New Elements --
 * @type struct<CompositeNew>[]
 * @desc Create new elements (appended after the existing ones) as Composite Elements.
 * @default
 * 
 * 
 * 
 */
/*~struct~CompositeExisting:
 * @param ID/Name
 * @desc The ID or Name of an existing element to turn into a Composite Element. If not found, this entry is ignored.
 * @default 0
 *
 * @param Always Combinable
 * @type boolean
 * @on True
 * @off False
 * @desc If True, this composite auto-combines when all its component elements are present.
 * @default false
 *
 * @param Component Elements
 * @type struct<Component>[]
 * @desc The component elements of this Composite Element.
 * @default
 */
/*~struct~CompositeNew:
 * @param Name
 * @desc The Name of the new element to create (and turn into a Composite Element).
 * @default  
 *
 * @param Always Combinable
 * @type boolean
 * @on True
 * @off False
 * @desc If True, this composite auto-combines when all its component elements are present.
 * @default false
 *
 * @param Component Elements
 * @type struct<Component>[]
 * @desc The component elements of this Composite Element.
 * @default
 */
/*~struct~Component:
 * @param ID/Name
 * @desc The ID or Name of this component element. If not found, this component is ignored.
 * @default 0
 *
 * @param Component Rate
 * @desc Multiplier (1.5), percentage (75%), or a {script} returning a multiplier. Component rate = composite rate * this.
 * @default 1.0
 */
/*~struct~ElementalTextsOverwrite:
 * @param ID/Name
 * @desc The ID or Name of the element to overwrite the text of. If not found, this entry is ignored.
 * @default 0
 *
 * @param Name
 * @desc The name to overwrite the element text with. Blank = keep the element's database name.
 * @default  
 *
 * @param Icon
 * @desc IconSet icon ID drawn with the element text (BEC & SRD popups). Blank = no icon.
 * @default 
 *
 * @param Show Icon Before or After Element Name
 * @type select
 * @option Before Name
 * @value Before Name
 * @option After Name
 * @value After Name
 * @desc Whether to draw the icon before or after the element name (BEC & SRD popups).
 * @default After Name
 *
 * @param Text color
 * @desc Text color (CSS/hex, e.g. #ff8800) for this element text (BEC & SRD popups). Blank = default color.
 * @default 
 *
 * @param Text size
 * @desc The font size for this element text (BEC & SRD popups). Blank = default size.
 * @default 
 *
 * @param Text font
 * @desc The font family for this element text (BEC & SRD popups). Blank = default font.
 * @default 
 *
 * @param Text Offset X
 * @type number
 * @min -9999
 * @max 9999
 * @desc Horizontal pixel offset added to this element text (BEC & SRD popups). Positive = right.
 * @default 0
 *
 * @param Text Offset Y
 * @type number
 * @min -9999
 * @max 9999
 * @desc Vertical pixel offset added to this element text (BEC & SRD popups). Positive = down.
 * @default 0
 */
//=============================================================================

if (Imported.YEP_ElementCore) {

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('JakeMSG_YEP_ElementCore_Additions');

Yanfly.EML_JakeMSGAdd.overwriteMode = String(
  Yanfly.Parameters["Composites overwriting Component's Elemental Rates"] ||
  'Overwrite with Lower').trim();

Yanfly.EML_JakeMSGAdd._rawExistingParam = Yanfly.Parameters['Elements'];
Yanfly.EML_JakeMSGAdd._rawNewParams = [];
(function() {
  for (var i = 1; i <= 20; ++i) {
    Yanfly.EML_JakeMSGAdd._rawNewParams.push(
      Yanfly.Parameters['NewElements ' + i]);
  }
})();

// Damage-popup element-name params.
// NOTE: parameter values come from js/plugins.js (written by the RMMV editor),
// NOT from the @param comments. If the plugin was edited without re-registering
// its parameters in the editor, the exact key may be missing - so we also fall
// back to a "contains" match on the parameter keys to stay robust.
Yanfly.EML_JakeMSGAdd.getRawParam = function(exact, contains) {
  var p = Yanfly.Parameters || {};
  if (p[exact] !== undefined) return p[exact];
  if (contains) {
    for (var k in p) {
      if (k && String(k).indexOf(contains) >= 0) return p[k];
    }
  }
  return undefined;
};
Yanfly.EML_JakeMSGAdd.stripQuotes = function(v) {
  v = String(v);
  if (v.length >= 2 && v.charAt(0) === '"' && v.charAt(v.length - 1) === '"') {
    v = v.slice(1, -1);
  }
  return v;
};
Yanfly.EML_JakeMSGAdd.popupShow = (String(
  Yanfly.EML_JakeMSGAdd.getRawParam(
    '-- Show Element Name in Damage Popups --',
    'Show Element Name in Damage Popups') || 'No').trim() === 'Yes');
Yanfly.EML_JakeMSGAdd.popupNullName = (function() {
  var v = Yanfly.EML_JakeMSGAdd.getRawParam(
    'Name for the Element "Null"', 'Name for the Element');
  if (v === undefined || v === null) v = 'Null';
  return Yanfly.EML_JakeMSGAdd.stripQuotes(v);
})();
// 'final' -> only the element decisive in the final damage calc; 'all' -> every
// element of the action. Defaults to 'final' (the parameter's @default).
Yanfly.EML_JakeMSGAdd.popupElementMode = (function() {
  var v = Yanfly.EML_JakeMSGAdd.getRawParam(
    'Show only Final Damage Element name',
    'Show only Final Damage Element name');
  v = (v === undefined || v === null) ? '' :
    Yanfly.EML_JakeMSGAdd.stripQuotes(v).trim();
  return (v === 'Show all Element Names') ? 'all' : 'final';
})();
Yanfly.EML_JakeMSGAdd._rawTextOverwrites = [];
(function() {
  for (var i = 1; i <= 20; ++i) {
    Yanfly.EML_JakeMSGAdd._rawTextOverwrites.push(
      Yanfly.Parameters['Name Overwrites ' + i]);
  }
})();

// composites: elementId -> { alwaysCombinable:Boolean, components:[{id, rate}] }
Yanfly.EML_JakeMSGAdd.composites = {};
// compositeParents: componentElementId -> [compositeElementId, ...]
Yanfly.EML_JakeMSGAdd.compositeParents = {};
// newElementDefs: [{ id:Number, raw:Object }]
Yanfly.EML_JakeMSGAdd.newElementDefs = [];
// elementTexts: elementId -> { name, icon, iconAfter, color, size, font }
Yanfly.EML_JakeMSGAdd.elementTexts = {};

//=============================================================================
// Parsing Helpers
//=============================================================================

Yanfly.EML_JakeMSGAdd.parseList = function(str) {
  if (str === undefined || str === null || String(str).trim() === '') return [];
  var arr;
  try {
    arr = JSON.parse(str);
  } catch (e) {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  var result = [];
  for (var i = 0; i < arr.length; ++i) {
    try {
      var obj = JSON.parse(arr[i]);
      if (obj) result.push(obj);
    } catch (e) {
      // ignore malformed entry
    }
  }
  return result;
};

Yanfly.EML_JakeMSGAdd.toBool = function(v) {
  if (v === undefined || v === null) return false;
  var s = String(v).trim().toLowerCase();
  return (s === 'true' || s === '1' || s === 'on' || s === 'yes');
};

Yanfly.EML_JakeMSGAdd.normType = function(s) {
  if (s === undefined || s === null) return 'skill';
  var t = String(s).trim().toLowerCase();
  if (t === 'item') return 'item';
  if (t === 'partymem' || t === 'party' || t === 'partymember') return 'partyMem';
  if (t === 'troopmem' || t === 'troop' || t === 'troopmember') return 'troopMem';
  return 'skill';
};

Yanfly.EML_JakeMSGAdd.normPerm = function(s) {
  if (s === undefined || s === null) return 'once';
  var t = String(s).trim().toLowerCase();
  if (t === 'temporary' || t === 'temp') return 'temporary';
  if (t === 'permanent' || t === 'perm') return 'permanent';
  return 'once';
};

// For changeElementalRate: "party" (default) or "troop".
Yanfly.EML_JakeMSGAdd.normBattlerType = function(s) {
  if (s === undefined || s === null) return 'party';
  var t = String(s).trim().toLowerCase();
  if (t === 'troop' || t === 'troopmem' || t === 'troopmember' ||
      t === 'enemy' || t === 'enemies') return 'troop';
  return 'party';
};

// Parses numeric IDs / intervals (no element bound checking). Accepts an array
// or a string, e.g. [1,3,5-8] or "1, 3, 5-8".
Yanfly.EML_JakeMSGAdd.parseIdArray = function(val) {
  var result = [];
  if (val === undefined || val === null) return result;
  var s = Array.isArray(val) ? val.join(',') : String(val);
  s = s.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (s.trim() === '') return result;
  var tokens = s.split(',');
  for (var i = 0; i < tokens.length; ++i) {
    var t = tokens[i].trim();
    if (t === '') continue;
    var m = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      var lo = Math.min(parseInt(m[1]), parseInt(m[2]));
      var hi = Math.max(parseInt(m[1]), parseInt(m[2]));
      for (var x = lo; x <= hi; ++x) result.push(x);
    } else if (/^\d+$/.test(t)) {
      result.push(parseInt(t));
    }
  }
  return result;
};

// Parses element IDs / Names / numeric intervals into element IDs. Accepts an
// array or a string. Unknown elements (and 0) are ignored.
Yanfly.EML_JakeMSGAdd.parseElementArray = function(val) {
  var result = [];
  if (val === undefined || val === null) return result;
  var tokens = [];
  if (Array.isArray(val)) {
    for (var a = 0; a < val.length; ++a) tokens.push(String(val[a]));
  } else {
    var s = String(val).trim().replace(/^\[/, '').replace(/\]$/, '');
    if (s.trim() !== '') tokens = s.split(',');
  }
  for (var i = 0; i < tokens.length; ++i) {
    var t = String(tokens[i]).trim();
    if (t === '') continue;
    var m = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      var lo = Math.min(parseInt(m[1]), parseInt(m[2]));
      var hi = Math.max(parseInt(m[1]), parseInt(m[2]));
      for (var x = lo; x <= hi; ++x) {
        if (x > 0 && x < $dataSystem.elements.length) result.push(x);
      }
      continue;
    }
    var id = DataManager.jakeElementId(t);
    if (id !== null) result.push(id);
  }
  return result;
};

// Resolves an "ID/Name" value to an element ID, or null if not found.
DataManager.jakeElementId = function(val) {
  if (val === undefined || val === null) return null;
  var s = String(val).trim();
  if (s === '') return null;
  if (/^\d+$/.test(s)) {
    var id = parseInt(s);
    if (id > 0 && id < $dataSystem.elements.length) return id;
    return null;
  }
  var name = s.toUpperCase();
  if (Yanfly.ElementIdRef && Yanfly.ElementIdRef[name] !== undefined) {
    return Yanfly.ElementIdRef[name];
  }
  return null;
};

// Parses a Component Rate into a Number or a { script:String } object.
DataManager.jakeParseRate = function(val) {
  if (val === undefined || val === null) return 1.0;
  var s = String(val).trim();
  if (s === '') return 1.0;
  if (s.charAt(0) === '{' && s.charAt(s.length - 1) === '}') {
    return { script: s.slice(1, -1) };
  }
  var last = s.charAt(s.length - 1);
  if (last === '%' || last === '\uFF05') {
    var pct = parseFloat(s.slice(0, -1));
    return isNaN(pct) ? 1.0 : pct * 0.01;
  }
  var n = parseFloat(s);
  return isNaN(n) ? 1.0 : n;
};

DataManager.jakeResolveComponentRate = function(rate, target) {
  if (typeof rate === 'number') return rate;
  if (rate && rate.script !== undefined) {
    try {
      var a = target;
      var b = target;
      var user = target;
      var s = $gameSwitches;
      var v = $gameVariables;
      var value = Number(eval(rate.script));
      return isNaN(value) ? 1.0 : value;
    } catch (e) {
      return 1.0;
    }
  }
  return 1.0;
};

//=============================================================================
// DataManager - Registration & Notetag Processing
//=============================================================================

Yanfly.EML_JakeMSGAdd.DataManager_isDatabaseLoaded =
    DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  // New elements must be appended BEFORE YEP builds its element name lookup.
  if ($dataSystem && !Yanfly.EML_JakeMSGAdd._newElementsAdded) {
    DataManager.jakeRegisterNewElements();
    Yanfly.EML_JakeMSGAdd._newElementsAdded = true;
  }
  if (!Yanfly.EML_JakeMSGAdd.DataManager_isDatabaseLoaded.call(this)) {
    return false;
  }
  if (!Yanfly.EML_JakeMSGAdd._loaded) {
    DataManager.jakeProcessComposites();
    DataManager.jakeProcessElementTexts();
    DataManager.jakeProcessCombinationNotetags($dataSkills);
    DataManager.jakeProcessCombinationNotetags($dataItems);
    DataManager.jakeProcessCombinationNotetags($dataActors);
    DataManager.jakeProcessCombinationNotetags($dataEnemies);
    Yanfly.EML_JakeMSGAdd._loaded = true;
  }
  return true;
};

DataManager.jakeRegisterNewElements = function() {
  Yanfly.EML_JakeMSGAdd.newElementDefs = [];
  var lists = Yanfly.EML_JakeMSGAdd._rawNewParams;
  for (var p = 0; p < lists.length; ++p) {
    var entries = Yanfly.EML_JakeMSGAdd.parseList(lists[p]);
    for (var e = 0; e < entries.length; ++e) {
      var obj = entries[e];
      var name = (obj['Name'] !== undefined) ? String(obj['Name']) : ' ';
      var id = $dataSystem.elements.length;
      $dataSystem.elements.push(name);
      Yanfly.EML_JakeMSGAdd.newElementDefs.push({ id: id, raw: obj });
    }
  }
};

DataManager.jakeProcessComposites = function() {
  Yanfly.EML_JakeMSGAdd.composites = {};
  Yanfly.EML_JakeMSGAdd.compositeParents = {};
  var existing = Yanfly.EML_JakeMSGAdd.parseList(
    Yanfly.EML_JakeMSGAdd._rawExistingParam);
  for (var i = 0; i < existing.length; ++i) {
    var id = DataManager.jakeElementId(existing[i]['ID/Name']);
    if (id === null) continue;
    DataManager.jakeAddComposite(id, existing[i]);
  }
  var defs = Yanfly.EML_JakeMSGAdd.newElementDefs || [];
  for (var j = 0; j < defs.length; ++j) {
    DataManager.jakeAddComposite(defs[j].id, defs[j].raw);
  }
};

DataManager.jakeAddComposite = function(id, obj) {
  var always = Yanfly.EML_JakeMSGAdd.toBool(obj['Always Combinable']);
  var comps = [];
  var rawComps = Yanfly.EML_JakeMSGAdd.parseList(obj['Component Elements']);
  for (var k = 0; k < rawComps.length; ++k) {
    var cid = DataManager.jakeElementId(rawComps[k]['ID/Name']);
    if (cid === null) continue;
    var rate = DataManager.jakeParseRate(rawComps[k]['Component Rate']);
    comps.push({ id: cid, rate: rate });
    var parents = Yanfly.EML_JakeMSGAdd.compositeParents;
    if (!parents[cid]) parents[cid] = [];
    if (parents[cid].indexOf(id) < 0) parents[cid].push(id);
  }
  Yanfly.EML_JakeMSGAdd.composites[id] = {
    alwaysCombinable: always,
    components: comps
  };
};

// Builds the element-text overwrite map used by the damage-popup feature.
DataManager.jakeProcessElementTexts = function() {
  Yanfly.EML_JakeMSGAdd.elementTexts = {};
  var lists = Yanfly.EML_JakeMSGAdd._rawTextOverwrites || [];
  for (var p = 0; p < lists.length; ++p) {
    var entries = Yanfly.EML_JakeMSGAdd.parseList(lists[p]);
    for (var e = 0; e < entries.length; ++e) {
      var o = entries[e];
      var id = DataManager.jakeElementId(o['ID/Name']);
      if (id === null) continue;
      var icon = null;
      if (o['Icon'] !== undefined && o['Icon'] !== null) {
        var iconStr = String(o['Icon']).replace(/"/g, '').trim();
        if (iconStr !== '') {
          var iconNum = parseInt(iconStr);
          if (!isNaN(iconNum)) icon = iconNum;
        }
      }
      var iconPos = String(o['Show Icon Before or After Element Name'] ||
        'After Name');
      var iconAfter = (iconPos.toLowerCase().indexOf('before') < 0);
      var offX = parseFloat(String(o['Text Offset X']).replace(/"/g, ''));
      var offY = parseFloat(String(o['Text Offset Y']).replace(/"/g, ''));
      Yanfly.EML_JakeMSGAdd.elementTexts[id] = {
        name: (o['Name'] !== undefined) ? String(o['Name']) : '',
        icon: icon,
        iconAfter: iconAfter,
        color: (o['Text color'] !== undefined) ?
          String(o['Text color']).replace(/^"|"$/g, '').trim() : '',
        size: (o['Text size'] !== undefined) ?
          String(o['Text size']).replace(/"/g, '').trim() : '',
        font: (o['Text font'] !== undefined) ?
          String(o['Text font']).replace(/^"|"$/g, '').trim() : '',
        offsetX: isNaN(offX) ? 0 : offX,
        offsetY: isNaN(offY) ? 0 : offY
      };
    }
  }
};

DataManager.jakeProcessCombinationNotetags = function(group) {
  var allowAll = /<ALLOW ALL ELEM\. COMBINATIONS>/i;
  var denyAll = /<DENY ALL ELEM\. COMBINATIONS>/i;
  var allowList = /<ALLOW ELEM\. COMBINATIONS:[ ]*(.*)>/i;
  var denyList = /<DENY ELEM\. COMBINATIONS:[ ]*(.*)>/i;
  for (var n = 1; n < group.length; ++n) {
    var obj = group[n];
    if (!obj) continue;
    var notedata = obj.note.split(/[\r\n]+/);
    obj.jakeAllowAllCombos = false;
    obj.jakeDenyAllCombos = false;
    obj.jakeAllowCombos = [];
    obj.jakeDenyCombos = [];
    for (var i = 0; i < notedata.length; ++i) {
      var line = notedata[i];
      if (line.match(allowAll)) {
        obj.jakeAllowAllCombos = true;
      } else if (line.match(denyAll)) {
        obj.jakeDenyAllCombos = true;
      } else if (line.match(allowList)) {
        obj.jakeAllowCombos = obj.jakeAllowCombos.concat(
          Yanfly.EML_JakeMSGAdd.parseElementArray(String(RegExp.$1)));
      } else if (line.match(denyList)) {
        obj.jakeDenyCombos = obj.jakeDenyCombos.concat(
          Yanfly.EML_JakeMSGAdd.parseElementArray(String(RegExp.$1)));
      }
    }
  }
};

//=============================================================================
// Runtime Element Modification Store
//=============================================================================
// Store lives on $gameSystem so it is (partially) saved. Each record is:
//   { overwrite:Boolean, overwritePerm:String|null, els:[{id, perm}] }
// On save, only 'permanent' data is written (see saveGameWithoutRescue alias).

Yanfly.EML_JakeMSGAdd.getModStore = function() {
  if (!$gameSystem) return null;
  if (!$gameSystem._jakeElemMods) {
    $gameSystem._jakeElemMods =
      { skill: {}, item: {}, partyMem: {}, troopMem: {} };
  }
  var st = $gameSystem._jakeElemMods;
  st.skill = st.skill || {};
  st.item = st.item || {};
  st.partyMem = st.partyMem || {};
  st.troopMem = st.troopMem || {};
  return st;
};

Yanfly.EML_JakeMSGAdd.getRecord = function(type, id, create) {
  var st = this.getModStore();
  if (!st || !st[type]) return null;
  var rec = st[type][id];
  if (!rec && create) {
    rec = { overwrite: false, overwritePerm: null, els: [] };
    st[type][id] = rec;
  }
  return rec;
};

Yanfly.EML_JakeMSGAdd.doChange = function(type, ids, els, perm) {
  for (var i = 0; i < ids.length; ++i) {
    var rec = this.getRecord(type, ids[i], true);
    if (!rec) continue;
    rec.overwrite = true;
    rec.overwritePerm = perm;
    rec.els = [];
    for (var e = 0; e < els.length; ++e) {
      rec.els.push({ id: els[e], perm: perm });
    }
  }
};

Yanfly.EML_JakeMSGAdd.doAdd = function(type, ids, els, perm) {
  for (var i = 0; i < ids.length; ++i) {
    var rec = this.getRecord(type, ids[i], true);
    if (!rec) continue;
    for (var e = 0; e < els.length; ++e) {
      var eid = els[e];
      var exists = false;
      for (var k = 0; k < rec.els.length; ++k) {
        if (rec.els[k].id === eid) { exists = true; break; }
      }
      if (!exists) rec.els.push({ id: eid, perm: perm });
    }
  }
};

Yanfly.EML_JakeMSGAdd.doRemove = function(type, ids, els) {
  for (var i = 0; i < ids.length; ++i) {
    var rec = this.getRecord(type, ids[i], false);
    if (!rec) continue;
    rec.els = rec.els.filter(function(entry) {
      return els.indexOf(entry.id) < 0;
    });
  }
};

Yanfly.EML_JakeMSGAdd.doReset = function(type, ids) {
  var st = this.getModStore();
  if (!st || !st[type]) return;
  for (var i = 0; i < ids.length; ++i) {
    delete st[type][ids[i]];
  }
};

Yanfly.EML_JakeMSGAdd.consumeOnce = function(type, id) {
  var rec = this.getRecord(type, id, false);
  if (!rec) return;
  rec.els = rec.els.filter(function(e) { return e.perm !== 'once'; });
  if (rec.overwritePerm === 'once') {
    rec.overwrite = false;
    rec.overwritePerm = null;
  }
  if (!rec.overwrite && rec.els.length === 0) {
    var st = this.getModStore();
    if (st && st[type]) delete st[type][id];
  }
};

Yanfly.EML_JakeMSGAdd.consumeOnceForAction = function(action, subject) {
  if (action && action.item()) {
    if (action.isSkill()) this.consumeOnce('skill', action.item().id);
    else if (action.isItem()) this.consumeOnce('item', action.item().id);
  }
  if (subject) {
    if (subject.isActor && subject.isActor()) {
      this.consumeOnce('partyMem', subject.index());
    } else if (subject.isEnemy && subject.isEnemy()) {
      this.consumeOnce('troopMem', subject.index());
    }
  }
};

// Applies one target's stored record to a list of element ids.
Yanfly.EML_JakeMSGAdd.applyModRecord = function(elements, type, id) {
  var rec = this.getRecord(type, id, false);
  if (!rec) return elements;
  var result;
  if (rec.overwrite) {
    result = [];
    for (var i = 0; i < rec.els.length; ++i) result.push(rec.els[i].id);
  } else {
    result = elements.slice();
    for (var j = 0; j < rec.els.length; ++j) {
      if (result.indexOf(rec.els[j].id) < 0) result.push(rec.els[j].id);
    }
  }
  return result;
};

//=============================================================================
// Runtime Elemental Rate Overrides (changeElementalRate)
//=============================================================================
// Store lives on $gameSystem: { party:{ pos:{ elementId:{rate,perm} } }, troop:{...} }
// Only 'permanent' entries are written to save (see saveGameWithoutRescue).

Yanfly.EML_JakeMSGAdd.getRateStore = function() {
  if (!$gameSystem) return null;
  if (!$gameSystem._jakeElemRates) {
    $gameSystem._jakeElemRates = { party: {}, troop: {} };
  }
  var st = $gameSystem._jakeElemRates;
  st.party = st.party || {};
  st.troop = st.troop || {};
  return st;
};

Yanfly.EML_JakeMSGAdd.doChangeRate = function(type, ids, els, rate, perm) {
  var st = this.getRateStore();
  if (!st) return;
  for (var i = 0; i < ids.length; ++i) {
    var pos = ids[i];
    if (!st[type][pos]) st[type][pos] = {};
    for (var e = 0; e < els.length; ++e) {
      st[type][pos][els[e]] = { rate: rate, perm: perm };
    }
  }
};

Yanfly.EML_JakeMSGAdd.getBattlerRateOverride = function(battler, elementId) {
  if (!battler || !$gameSystem || !$gameSystem._jakeElemRates) return undefined;
  var type = null;
  if (battler.isActor && battler.isActor()) type = 'party';
  else if (battler.isEnemy && battler.isEnemy()) type = 'troop';
  if (!type) return undefined;
  var pos = battler.index ? battler.index() : -1;
  if (pos < 0) return undefined;
  var group = $gameSystem._jakeElemRates[type];
  var rec = group ? group[pos] : null;
  if (!rec) return undefined;
  var entry = rec[elementId];
  if (!entry) return undefined;
  return entry.rate;
};

Yanfly.EML_JakeMSGAdd.consumeOnceRate = function(type, pos) {
  if (!$gameSystem || !$gameSystem._jakeElemRates) return;
  var group = $gameSystem._jakeElemRates[type];
  var rec = group ? group[pos] : null;
  if (!rec) return;
  for (var k in rec) {
    if (rec[k] && rec[k].perm === 'once') delete rec[k];
  }
};

// Consumes the "once" rate overrides of the given battler (used AFTER the next
// damage calculation performed on that battler).
Yanfly.EML_JakeMSGAdd.consumeOnceRateForBattler = function(battler) {
  if (!battler) return;
  if (battler.isActor && battler.isActor()) {
    this.consumeOnceRate('party', battler.index());
  } else if (battler.isEnemy && battler.isEnemy()) {
    this.consumeOnceRate('troop', battler.index());
  }
};

// Removes ALL changeElementalRate overrides for the given position(s).
Yanfly.EML_JakeMSGAdd.doResetRate = function(type, ids) {
  var st = this.getRateStore();
  if (!st || !st[type]) return;
  for (var i = 0; i < ids.length; ++i) {
    delete st[type][ids[i]];
  }
};

Yanfly.EML_JakeMSGAdd.filterPermanentRates = function(rates) {
  var out = { party: {}, troop: {} };
  var types = ['party', 'troop'];
  for (var t = 0; t < types.length; ++t) {
    var type = types[t];
    var src = rates[type] || {};
    for (var pos in src) {
      var rec = src[pos];
      if (!rec) continue;
      var kept = {};
      var any = false;
      for (var k in rec) {
        if (rec[k] && rec[k].perm === 'permanent') { kept[k] = rec[k]; any = true; }
      }
      if (any) out[type][pos] = kept;
    }
  }
  return out;
};

//=============================================================================
// Global Script Calls
//=============================================================================

window.changeElements = function(skillOrItemOrBattler, IDs, elementArray,
                                 permanence) {
  var type = Yanfly.EML_JakeMSGAdd.normType(skillOrItemOrBattler);
  var ids = Yanfly.EML_JakeMSGAdd.parseIdArray(IDs === undefined ? [0] : IDs);
  if (ids.length === 0) ids = [0];
  var els = Yanfly.EML_JakeMSGAdd.parseElementArray(
    elementArray === undefined ? [0] : elementArray);
  var perm = Yanfly.EML_JakeMSGAdd.normPerm(permanence);
  Yanfly.EML_JakeMSGAdd.doChange(type, ids, els, perm);
};

window.addElements = function(skillOrItemOrBattler, IDs, elementArray,
                              permanence) {
  var type = Yanfly.EML_JakeMSGAdd.normType(skillOrItemOrBattler);
  var ids = Yanfly.EML_JakeMSGAdd.parseIdArray(IDs === undefined ? [0] : IDs);
  if (ids.length === 0) ids = [0];
  var els = Yanfly.EML_JakeMSGAdd.parseElementArray(
    elementArray === undefined ? [0] : elementArray);
  var perm = Yanfly.EML_JakeMSGAdd.normPerm(permanence);
  Yanfly.EML_JakeMSGAdd.doAdd(type, ids, els, perm);
};

window.removeElements = function(skillOrItemOrBattler, IDs, elementArray) {
  var type = Yanfly.EML_JakeMSGAdd.normType(skillOrItemOrBattler);
  var ids = Yanfly.EML_JakeMSGAdd.parseIdArray(IDs === undefined ? [0] : IDs);
  if (ids.length === 0) ids = [0];
  var els = Yanfly.EML_JakeMSGAdd.parseElementArray(
    elementArray === undefined ? [0] : elementArray);
  Yanfly.EML_JakeMSGAdd.doRemove(type, ids, els);
};

window.resetElements = function(skillOrItemOrBattler, IDs) {
  var type = Yanfly.EML_JakeMSGAdd.normType(skillOrItemOrBattler);
  var ids = Yanfly.EML_JakeMSGAdd.parseIdArray(IDs === undefined ? [0] : IDs);
  if (ids.length === 0) ids = [0];
  Yanfly.EML_JakeMSGAdd.doReset(type, ids);
};

window.changeElementalRate = function(Battler, IDs, elementArray, rate,
                                      permanence) {
  var type = Yanfly.EML_JakeMSGAdd.normBattlerType(Battler);
  var ids = Yanfly.EML_JakeMSGAdd.parseIdArray(IDs === undefined ? [0] : IDs);
  if (ids.length === 0) ids = [0];
  var els = Yanfly.EML_JakeMSGAdd.parseElementArray(
    elementArray === undefined ? [0] : elementArray);
  var r = (rate === undefined || rate === null) ? 100 : Number(rate);
  if (isNaN(r)) r = 100;
  var perm = Yanfly.EML_JakeMSGAdd.normPerm(permanence);
  Yanfly.EML_JakeMSGAdd.doChangeRate(type, ids, els, r * 0.01, perm);
};

window.resetElementalRates = function(Battler, IDs) {
  var type = Yanfly.EML_JakeMSGAdd.normBattlerType(Battler);
  var ids = Yanfly.EML_JakeMSGAdd.parseIdArray(IDs === undefined ? [0] : IDs);
  if (ids.length === 0) ids = [0];
  Yanfly.EML_JakeMSGAdd.doResetRate(type, ids);
};

//=============================================================================
// Save Handling - strip non-permanent modifications
//=============================================================================

Yanfly.EML_JakeMSGAdd.filterPermanent = function(mods) {
  var out = { skill: {}, item: {}, partyMem: {}, troopMem: {} };
  var types = ['skill', 'item', 'partyMem', 'troopMem'];
  for (var t = 0; t < types.length; ++t) {
    var type = types[t];
    var src = mods[type] || {};
    for (var id in src) {
      var rec = src[id];
      if (!rec) continue;
      var els = rec.els.filter(function(e) { return e.perm === 'permanent'; });
      var overwrite = rec.overwrite && rec.overwritePerm === 'permanent';
      if (els.length === 0 && !overwrite) continue;
      out[type][id] = {
        overwrite: overwrite,
        overwritePerm: overwrite ? 'permanent' : null,
        els: els
      };
    }
  }
  return out;
};

Yanfly.EML_JakeMSGAdd.DataManager_saveGameWithoutRescue =
    DataManager.saveGameWithoutRescue;
DataManager.saveGameWithoutRescue = function(savefileId) {
  var backup = null;
  var backupRates = null;
  if ($gameSystem && $gameSystem._jakeElemMods) {
    backup = $gameSystem._jakeElemMods;
    $gameSystem._jakeElemMods =
      Yanfly.EML_JakeMSGAdd.filterPermanent(backup);
  }
  if ($gameSystem && $gameSystem._jakeElemRates) {
    backupRates = $gameSystem._jakeElemRates;
    $gameSystem._jakeElemRates =
      Yanfly.EML_JakeMSGAdd.filterPermanentRates(backupRates);
  }
  var result;
  try {
    result = Yanfly.EML_JakeMSGAdd.DataManager_saveGameWithoutRescue.call(
      this, savefileId);
  } finally {
    if (backup !== null) $gameSystem._jakeElemMods = backup;
    if (backupRates !== null) $gameSystem._jakeElemRates = backupRates;
  }
  return result;
};

//=============================================================================
// "Once" consumption hooks
//=============================================================================

Yanfly.EML_JakeMSGAdd.BattleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function() {
  Yanfly.EML_JakeMSGAdd.consumeOnceForAction(this._action, this._subject);
  Yanfly.EML_JakeMSGAdd.BattleManager_endAction.call(this);
};

if (typeof Scene_ItemBase !== 'undefined') {
  Yanfly.EML_JakeMSGAdd.Scene_ItemBase_applyItem =
      Scene_ItemBase.prototype.applyItem;
  Scene_ItemBase.prototype.applyItem = function() {
    Yanfly.EML_JakeMSGAdd.Scene_ItemBase_applyItem.call(this);
    var item = this.item();
    if (item) {
      if (DataManager.isSkill(item)) {
        Yanfly.EML_JakeMSGAdd.consumeOnce('skill', item.id);
      } else if (DataManager.isItem(item)) {
        Yanfly.EML_JakeMSGAdd.consumeOnce('item', item.id);
      }
    }
    var user = this.user();
    if (user && user.isActor && user.isActor()) {
      Yanfly.EML_JakeMSGAdd.consumeOnce('partyMem', user.index());
    }
  };
}

// changeElementalRate "once": the override applies to (and is consumed after)
// the NEXT damage calculation done ON the specified battler(s). We flag the
// target's result whenever an element rate is computed during apply(), then
// consume the battler's "once" rate overrides at the end of that apply().
Yanfly.EML_JakeMSGAdd.Game_Action_apply_onceRate = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  if (target && target.result) {
    var r0 = target.result();
    if (r0) r0._jakeDamageCalcDone = false;
  }
  Yanfly.EML_JakeMSGAdd.Game_Action_apply_onceRate.call(this, target);
  if (target && target.result) {
    var r = target.result();
    if (r && r._jakeDamageCalcDone) {
      r._jakeDamageCalcDone = false;
      Yanfly.EML_JakeMSGAdd.consumeOnceRateForBattler(target);
    }
  }
};

//=============================================================================
// Game_Action - runtime mods + elemental combinations
//=============================================================================

Yanfly.EML_JakeMSGAdd.Game_Action_getItemElements =
    Game_Action.prototype.getItemElements;
Game_Action.prototype.getItemElements = function() {
  var elements =
    Yanfly.EML_JakeMSGAdd.Game_Action_getItemElements.call(this);
  elements = this.jakeApplyRuntimeMods(elements);
  elements = this.jakeApplyCombinations(elements);
  return elements.filter(Yanfly.Util.onlyUnique);
};

Game_Action.prototype.jakeApplyRuntimeMods = function(elements) {
  var result = elements.slice();
  if (this.item()) {
    var type = this.isSkill() ? 'skill' : (this.isItem() ? 'item' : null);
    if (type) {
      result = Yanfly.EML_JakeMSGAdd.applyModRecord(result, type,
        this.item().id);
    }
  }
  var subject = this.subject();
  if (subject) {
    if (subject.isActor && subject.isActor()) {
      result = Yanfly.EML_JakeMSGAdd.applyModRecord(result, 'partyMem',
        subject.index());
    } else if (subject.isEnemy && subject.isEnemy()) {
      result = Yanfly.EML_JakeMSGAdd.applyModRecord(result, 'troopMem',
        subject.index());
    }
  }
  return result;
};

Game_Action.prototype.jakeApplyCombinations = function(elements) {
  var set = elements.slice();
  var composites = Yanfly.EML_JakeMSGAdd.composites;
  var changed = true;
  var guard = 0;
  while (changed && guard < 100) {
    changed = false;
    guard++;
    for (var cidStr in composites) {
      var cid = parseInt(cidStr);
      if (set.indexOf(cid) >= 0) continue;
      var comp = composites[cid];
      if (!comp.components || comp.components.length === 0) continue;
      if (!this.jakeCombinationAllowed(cid)) continue;
      var allPresent = true;
      for (var i = 0; i < comp.components.length; ++i) {
        if (set.indexOf(comp.components[i].id) < 0) {
          allPresent = false;
          break;
        }
      }
      if (allPresent) {
        set.push(cid);
        changed = true;
      }
    }
  }
  return set;
};

Game_Action.prototype.jakeCombinationAllowed = function(cid) {
  var comp = Yanfly.EML_JakeMSGAdd.composites[cid];
  if (!comp) return false;
  var sources = [];
  if (this.item()) sources.push(this.item());
  var subject = this.subject();
  if (subject) {
    if (subject.isActor && subject.isActor() && subject.actor) {
      sources.push(subject.actor());
    } else if (subject.isEnemy && subject.isEnemy() && subject.enemy) {
      sources.push(subject.enemy());
    }
  }
  var denyAll = false;
  var allowAll = false;
  var denySpecific = false;
  var allowSpecific = false;
  for (var i = 0; i < sources.length; ++i) {
    var o = sources[i];
    if (!o) continue;
    if (o.jakeDenyAllCombos) denyAll = true;
    if (o.jakeAllowAllCombos) allowAll = true;
    if (o.jakeDenyCombos && o.jakeDenyCombos.indexOf(cid) >= 0) {
      denySpecific = true;
    }
    if (o.jakeAllowCombos && o.jakeAllowCombos.indexOf(cid) >= 0) {
      allowSpecific = true;
    }
  }
  if (denyAll) return false;
  if (denySpecific) return false;
  if (allowAll) return true;
  if (allowSpecific) return true;
  return !!comp.alwaysCombinable;
};

Yanfly.EML_JakeMSGAdd.Game_Action_calcElementRate =
    Game_Action.prototype.calcElementRate;
Game_Action.prototype.calcElementRate = function(target) {
  // Flag that a damage calculation happened on this target (used by
  // changeElementalRate "once"), and record the final element list for the
  // damage popup. The flag is set first so "once" consumption never depends on
  // element capture succeeding.
  if (this.item() && target && target.result) {
    var r = target.result();
    if (r) {
      r._jakeDamageCalcDone = true;
      try {
        r._jakeDamageElements = this.getItemElements().slice();
        r._jakeFinalElement = this.jakeFinalDamageElement(target);
      } catch (e) {
        // ignore - popup element list is best-effort
      }
    }
  }
  return Yanfly.EML_JakeMSGAdd.Game_Action_calcElementRate.call(this, target);
};

// Which single element is decisive in the final damage calculation, mirroring
// YEP_ElementCore's elementMultiRule so the popup can show just that one:
//   Lowest -> the min-rate element, Highest -> the max-rate element. For
//   additive / multiplicative / average / custom rules (no single "winner"),
//   the element whose effective rate is farthest from neutral (1.0) is used.
// Returns null for a Null-element action (so the popup shows the Null name).
Game_Action.prototype.jakeFinalDamageElement = function(target) {
  if (!this.item() || !target) return null;
  var elements = this.getItemElements();
  if (!elements || elements.length < 1) return null;
  if (elements.length === 1) return elements[0];
  var rule = this.item().elementMultiRule;
  var best = null, bestRate = null, bestDev = -Infinity;
  for (var i = 0; i < elements.length; ++i) {
    var elementId = elements[i];
    var eleRate = target.elementRate(elementId);
    eleRate *= Math.max(0, this.subject().elementMagnifyRate(elementId));
    eleRate += this.subject().elementAmplifyRate(elementId);
    if (rule === 0) { // Lowest Rate
      if (bestRate === null || eleRate < bestRate) {
        bestRate = eleRate; best = elementId;
      }
    } else if (rule === 3) { // Highest Rate
      if (bestRate === null || eleRate > bestRate) {
        bestRate = eleRate; best = elementId;
      }
    } else { // Additive / Multiplicative / Average / custom -> most impactful
      var dev = Math.abs(eleRate - 1.0);
      if (dev > bestDev) { bestDev = dev; best = elementId; }
    }
  }
  return (best === null) ? elements[0] : best;
};

//=============================================================================
// Game_BattlerBase - composite-adjusted elemental rate + rate overrides
//=============================================================================

Yanfly.EML_JakeMSGAdd.Game_BtlrBase_elementRate =
    Game_BattlerBase.prototype.elementRate;
Game_BattlerBase.prototype.elementRate = function(elementId) {
  // A battler's rate for an element always reflects any Composite Element it is
  // a component of (per the "Composites overwriting..." parameter), regardless
  // of whether that composite is present in the current action.
  return this.jakeCompositeElementRate(elementId, {});
};

Game_BattlerBase.prototype.jakeBaseElementRate = function(elementId) {
  var forced = Yanfly.EML_JakeMSGAdd.getBattlerRateOverride(this, elementId);
  if (forced !== undefined) return forced;
  return Yanfly.EML_JakeMSGAdd.Game_BtlrBase_elementRate.call(this, elementId);
};

// Chooses which of two competing rates to keep, per the
// "Composites overwriting Component's Elemental Rates" parameter. Rates are
// multipliers where 1.0 (= 100%) is neutral. On an exact tie, 'current' wins
// (so nothing changes).
Yanfly.EML_JakeMSGAdd.combineRate = function(current, derived) {
  switch (Yanfly.EML_JakeMSGAdd.overwriteMode) {
    case 'Overwrite with Higher':
      return Math.max(current, derived);
    case 'Closest to neutral (100%)':
      return (Math.abs(derived - 1.0) < Math.abs(current - 1.0)) ?
        derived : current;
    case 'Farthest from neutral (100%)':
      return (Math.abs(derived - 1.0) > Math.abs(current - 1.0)) ?
        derived : current;
    case 'Overwrite with Lower':
    default:
      return Math.min(current, derived);
  }
};

Game_BattlerBase.prototype.jakeCompositeElementRate =
    function(elementId, memo) {
  memo = memo || {};
  if (memo[elementId] !== undefined) return memo[elementId];
  var base = this.jakeBaseElementRate(elementId);
  memo[elementId] = base; // guards against accidental cycles
  var parents = Yanfly.EML_JakeMSGAdd.compositeParents[elementId];
  if (!parents || parents.length === 0) {
    memo[elementId] = base;
    return base;
  }
  var rate = base;
  for (var i = 0; i < parents.length; ++i) {
    var C = parents[i];
    var comp = Yanfly.EML_JakeMSGAdd.composites[C];
    if (!comp) continue;
    var cr = 1.0;
    for (var j = 0; j < comp.components.length; ++j) {
      if (comp.components[j].id === elementId) {
        cr = DataManager.jakeResolveComponentRate(comp.components[j].rate, this);
        break;
      }
    }
    var parentRate = this.jakeCompositeElementRate(C, memo);
    var derived = parentRate * cr;
    rate = Yanfly.EML_JakeMSGAdd.combineRate(rate, derived);
  }
  memo[elementId] = rate;
  return rate;
};

//=============================================================================
// Damage popups - element name in HP damage / heal / drain popups
//=============================================================================
//
// Two popup back-ends are supported. The hooks are installed lazily (see
// installPopupHook) so this works whether this plugin is above or below the
// popup plugin, and regardless of which one owns the visuals:
//   * DEFAULT / YEP_BattleEngineCore popups (digit based) -> after setup builds
//     the HP digits we append the element name as extra popup sprites, placed
//     relative to the number (so they line up with whatever drew the digits).
//   * SRD_BattlePopupCustomizer popups (text based)        -> after SRD draws
//     its HP number/text we append the element name as extra styled sprites
//     that copy SRD's animation model (so per-element styling still applies).
if (typeof Sprite_Damage !== 'undefined') {

Yanfly.EML_JakeMSGAdd.popupEnabled = function() {
  return Yanfly.EML_JakeMSGAdd.popupShow;
};

// True when SRD_BattlePopupCustomizer is the active popup renderer. Evaluated
// lazily (at popup time) so it reflects the final Imported state. SRD is meant
// to sit under YEP_BattleEngineCore, so when it is enabled it owns the visuals.
Yanfly.EML_JakeMSGAdd.isSRDPopupActive = function() {
  return !!(typeof Imported !== 'undefined' &&
    Imported["SumRndmDde Battle Popup Customizer"]);
};

// Strips control codes from a raw element name for clean display.
Yanfly.EML_JakeMSGAdd.cleanElementName = function(name) {
  if (name === undefined || name === null) return '';
  return String(name)
    .replace(/\\[IiCc]\[\d+\]/g, '')
    .replace(/\\[{}<>]/g, '')
    .trim();
};

// Resolves the display name of a single element id (honouring the "Name
// Overwrites" Name; falls back to the database element name).
Yanfly.EML_JakeMSGAdd.resolveElementName = function(id) {
  var dbName = '';
  if (typeof $dataSystem !== 'undefined' && $dataSystem &&
      $dataSystem.elements) {
    dbName = Yanfly.EML_JakeMSGAdd.cleanElementName($dataSystem.elements[id]);
  }
  var ov = Yanfly.EML_JakeMSGAdd.elementTexts[id];
  if (ov && ov.name && String(ov.name).trim() !== '') {
    return String(ov.name).trim();
  }
  return dbName;
};

// The ordered, de-duplicated list of element ids to display for a popup result.
// In 'final' mode only the element decisive in the damage calc is returned; in
// 'all' mode every element of the action is returned.
Yanfly.EML_JakeMSGAdd.popupElementIds = function(result) {
  if (Yanfly.EML_JakeMSGAdd.popupElementMode === 'final') {
    var fid = result ? Number(result._jakeFinalElement) : 0;
    return (fid > 0) ? [fid] : [];
  }
  var els = (result && result._jakeDamageElements) ?
    result._jakeDamageElements : [];
  var ids = [];
  for (var i = 0; i < els.length; ++i) {
    var id = Number(els[i]);
    if (id > 0 && ids.indexOf(id) < 0) ids.push(id);
  }
  return ids;
};

// Builds the styled text segments (shared by both popup paths).
// Supports per-element Name / Icon / color / size / font / offset overrides.
Yanfly.EML_JakeMSGAdd.buildPopupSegments = function(result, defaults) {
  var ids = Yanfly.EML_JakeMSGAdd.popupElementIds(result);
  var segs = [];
  for (var i = 0; i < ids.length; ++i) {
    var id = ids[i];
    var ov = Yanfly.EML_JakeMSGAdd.elementTexts[id];
    var name = Yanfly.EML_JakeMSGAdd.resolveElementName(id);
    if (!name || name.trim() === '') continue;
    var color = defaults.color, size = defaults.size, font = defaults.font;
    var icon = null, iconAfter = true, offsetX = 0, offsetY = 0;
    if (ov) {
      if (ov.color && ov.color !== '') color = ov.color;
      if (ov.size && ov.size !== '') {
        var s = Number(ov.size);
        if (s && !isNaN(s)) size = s;
      }
      if (ov.font && ov.font !== '') font = ov.font;
      if (ov.icon !== null && ov.icon !== undefined) icon = ov.icon;
      iconAfter = ov.iconAfter;
      offsetX = ov.offsetX || 0;
      offsetY = ov.offsetY || 0;
    }
    segs.push({ text: name.trim(), color: color, size: size, font: font,
                icon: icon, iconAfter: iconAfter,
                offsetX: offsetX, offsetY: offsetY });
  }
  if (segs.length === 0) {
    var nn = Yanfly.EML_JakeMSGAdd.popupNullName;
    if (nn && String(nn).trim() !== '') {
      segs.push({ text: String(nn).trim(), color: defaults.color,
                  size: defaults.size, font: defaults.font, icon: null,
                  iconAfter: true, offsetX: 0, offsetY: 0 });
    }
  }
  return segs;
};

// Installs the popup hooks. Safe to call multiple times; only the first
// successful call takes effect.
//   * Sprite_Damage.setup        -> after the active popup system builds the HP
//     digits we append the element name sprite(s) (default / BEC path).
//   * Sprite_Damage.createDigits -> when SRD is the renderer, we fold the
//     element name onto the END of SRD's HP text (SRD path).
Yanfly.EML_JakeMSGAdd.installPopupHook = function() {
  if (Yanfly.EML_JakeMSGAdd._popupHooked) return;
  if (typeof Sprite_Damage === 'undefined') return;
  if (!Sprite_Damage.prototype.setup) return; // popup system not ready yet
  Yanfly.EML_JakeMSGAdd._popupHooked = true;

  // --- Default / YEP_BattleEngineCore path (append sprites after the digits).
  Yanfly.EML_JakeMSGAdd.Sprite_Damage_setup = Sprite_Damage.prototype.setup;
  Sprite_Damage.prototype.setup = function(target) {
    Yanfly.EML_JakeMSGAdd.Sprite_Damage_setup.call(this, target);
    if (Yanfly.EML_JakeMSGAdd.popupEnabled() &&
        !Yanfly.EML_JakeMSGAdd.isSRDPopupActive()) {
      try {
        this.jakeAppendHpElementName(target);
      } catch (e) {
        if (window.console) console.error('[ElementCore_Additions popup]', e);
      }
    }
  };

  // --- SRD_BattlePopupCustomizer path. Let SRD draw the HP number/text, then
  // append our styled element-name sprites just past the last character so
  // Icon / color / size / font / offset overrides all apply (SRD's own text
  // rendering cannot carry them).
  if (Sprite_Damage.prototype.createDigits) {
    Yanfly.EML_JakeMSGAdd.Sprite_Damage_createDigits =
        Sprite_Damage.prototype.createDigits;
    Sprite_Damage.prototype.createDigits = function(baseRow, value, info) {
      Yanfly.EML_JakeMSGAdd.Sprite_Damage_createDigits.call(
        this, baseRow, value, info);
      if (Yanfly.EML_JakeMSGAdd.popupEnabled() &&
          Yanfly.EML_JakeMSGAdd.isSRDPopupActive() &&
          (baseRow === 0 || baseRow === 1)) {
        try {
          this.jakeAppendHpElementNameSRD(baseRow, value);
        } catch (e) {
          if (window.console) console.error('[ElementCore_Additions popup]', e);
        }
      }
    };
  }

  // --- Keep the per-element "Text Offset Y" applied after every animation
  // frame (the base bounce recomputes each child's y from ry, which would
  // otherwise wipe our vertical offset). Only our appended sprites carry
  // _jakeOffsetY, so digits are unaffected.
  if (Sprite_Damage.prototype.updateChild) {
    Yanfly.EML_JakeMSGAdd.Sprite_Damage_updateChild =
        Sprite_Damage.prototype.updateChild;
    Sprite_Damage.prototype.updateChild = function(sprite) {
      Yanfly.EML_JakeMSGAdd.Sprite_Damage_updateChild.call(this, sprite);
      if (sprite && sprite._jakeOffsetY) sprite.y += sprite._jakeOffsetY;
    };
  }
};

// Default text style for the appended element name (default / BEC path). Uses
// the digit height so the element text roughly matches the number size.
Sprite_Damage.prototype.jakePopupDefaults = function(row) {
  var h = 0;
  try { if (this.digitHeight) h = this.digitHeight(); } catch (e) { h = 0; }
  var size = (h && !isNaN(h) && h > 0) ? Math.round(h * 0.9) : 28;
  var color = (row % 2 === 0) ? '#ffffff' : '#80ff80';
  return { size: size, color: color, font: 'GameFont' };
};

Sprite_Damage.prototype.jakeMeasureWidth = function(text, size, font) {
  if (!this._jakeMeasureBmp) this._jakeMeasureBmp = new Bitmap(1, 1);
  var b = this._jakeMeasureBmp;
  b.fontSize = Number(size) || 28;
  b.fontFace = font || 'GameFont';
  return b.measureTextWidth(text);
};

// The rightmost existing child (a digit), used to match the vertical baseline /
// anchor of whatever popup system drew the number so our text lines up with it.
Sprite_Damage.prototype.jakeRefChild = function() {
  if (!this.children || this.children.length === 0) return null;
  return this.children[this.children.length - 1];
};

Sprite_Damage.prototype.jakeApplyRefGeometry = function(sprite, ref) {
  sprite.anchor.x = 0;
  sprite.anchor.y = ref ? ref.anchor.y : 1;
  sprite.y = ref ? ref.y : -40;
  sprite.ry = (ref && ref.ry !== undefined) ? ref.ry : sprite.y;
};

// Renders a styled element-name bitmap (shared by both popup back-ends).
// Returns { bitmap, width }.
Sprite_Damage.prototype.jakeBuildTextBitmap = function(seg) {
  var size = Number(seg.size) || 28;
  var font = seg.font || 'GameFont';
  var pad = Math.ceil(size * 0.36);
  var height = size + pad;
  var tw = Math.ceil(this.jakeMeasureWidth(seg.text, size, font));
  var bmp = new Bitmap(tw + 16, height);
  bmp.fontSize = size;
  bmp.fontFace = font;
  bmp.textColor = seg.color || '#ffffff';
  bmp.outlineColor = '#000000';
  bmp.outlineWidth = 5;
  bmp.drawText(seg.text, 4, 0, tw + 8, height);
  return { bitmap: bmp, width: tw + 8 };
};

Sprite_Damage.prototype.jakeCreateElementTextSprite = function(seg, ref) {
  var built = this.jakeBuildTextBitmap(seg);
  var sprite = new Sprite(built.bitmap);
  this.jakeApplyRefGeometry(sprite, ref);
  sprite._jakeWidth = built.width;
  this.addChild(sprite);
  return sprite;
};

Sprite_Damage.prototype.jakeCreateIconSprite = function(iconIndex, size, ref) {
  var iw = Window_Base._iconWidth || 32;
  var ih = Window_Base._iconHeight || 32;
  var scale = ((Number(size) || 28) * 1.2) / ih;
  var sprite = new Sprite();
  sprite.bitmap = ImageManager.loadSystem('IconSet');
  var sx = (iconIndex % 16) * iw;
  var sy = Math.floor(iconIndex / 16) * ih;
  sprite.setFrame(sx, sy, iw, ih);
  sprite.scale.x = scale;
  sprite.scale.y = scale;
  this.jakeApplyRefGeometry(sprite, ref);
  sprite._jakeWidth = iw * scale;
  this.addChild(sprite);
  return sprite;
};

// Applies a per-element "Text Offset Y". The value is stored so the updateChild
// hook can re-apply it each frame (see installPopupHook).
Sprite_Damage.prototype.jakeApplyOffsetY = function(sprite, oy) {
  if (!oy) return;
  sprite._jakeOffsetY = oy;
  sprite.y += oy;
};

// Lays out the element name segments (with icons) starting at startX. Each
// element's "Text Offset X" / "Text Offset Y" nudges only that element's text
// (and its icon); it does not shift the following elements.
Sprite_Damage.prototype.jakeLayoutSegments = function(startX, dy, row, ref) {
  var defaults = this.jakePopupDefaults(row);
  var segs = Yanfly.EML_JakeMSGAdd.buildPopupSegments(this._result, defaults);
  var x = startX;
  var gap = 4;
  for (var i = 0; i < segs.length; ++i) {
    var seg = segs[i];
    var ox = seg.offsetX || 0, oy = seg.offsetY || 0;
    if (i > 0) x += gap * 2;
    if (seg.icon !== null && seg.icon !== undefined && !seg.iconAfter) {
      var ib = this.jakeCreateIconSprite(seg.icon, seg.size, ref);
      ib.x = x + ox; ib.dy = dy; this.jakeApplyOffsetY(ib, oy);
      x += ib._jakeWidth + gap;
    }
    var sp = this.jakeCreateElementTextSprite(seg, ref);
    sp.x = x + ox; sp.dy = dy; this.jakeApplyOffsetY(sp, oy);
    x += sp._jakeWidth + gap;
    if (seg.icon !== null && seg.icon !== undefined && seg.iconAfter) {
      var ia = this.jakeCreateIconSprite(seg.icon, seg.size, ref);
      ia.x = x + ox; ia.dy = dy; this.jakeApplyOffsetY(ia, oy);
      x += ia._jakeWidth + gap;
    }
  }
  return x;
};

// setup() post-hook path (default / BEC popups). The HP digits already exist;
// we append the element name sprite(s) right after the number.
Sprite_Damage.prototype.jakeAppendHpElementName = function(target) {
  var result = this._result;
  if (!result && target && target.result) result = target.result();
  if (!result || !result.hpAffected) return;
  this._result = result;
  var value = result.hpDamage || 0;
  var row = (value < 0) ? 1 : 0;
  var len = Math.abs(value).toString().length || 1;
  var ref = this.jakeRefChild();
  var w = 0;
  try { if (this.digitWidth) w = this.digitWidth(); } catch (e) { w = 0; }
  if (!w || isNaN(w) || w <= 0) {
    w = (ref && ref.width) ? ref.width : this.jakePopupDefaults(row).size;
  }
  var startX = ((len - 1) / 2) * w + w / 2 + 6;
  this.jakeLayoutSegments(startX, -len, row, ref);
};

//-----------------------------------------------------------------------------
// SRD_BattlePopupCustomizer path. SRD draws its popup text char-by-char with
// plain drawText (no escape codes), so per-element Icon / color / size / font /
// offset overrides cannot ride inside the string. Instead we let SRD render the
// number/HP text, then append our own styled sprites that copy SRD's animation
// model (from a reference digit sprite) so they rise, fade and flash together.
//-----------------------------------------------------------------------------

// Copies SRD's per-child animation state from a reference digit sprite so an
// appended sprite plays in lockstep with the popup.
Sprite_Damage.prototype.jakeSRDApplyRef = function(sprite, ref) {
  sprite.anchor.x = 0; // left-aligned (SRD chars are centre-anchored at 0.5)
  sprite.anchor.y = (ref.anchor && ref.anchor.y != null) ? ref.anchor.y : 0.5;
  sprite.animations = ref.animations ? ref.animations.clone() : ['default'];
  sprite.duration = ref.duration;
  sprite.oriDuration = ref.oriDuration;
  sprite.flashColor = ref.flashColor ? ref.flashColor.clone() : [0, 0, 0, 0];
  sprite.flashDuration = ref.flashDuration || 0;
  sprite.xBase = ref.xBase || 0;
  sprite.yBase = ref.yBase || 0;
  sprite.dy = ref.dy || 0;
  sprite.ry = (ref.ry !== undefined) ? ref.ry : (ref.y || 0);
  sprite.oriY = ref.oriY || 0;
  sprite.y = ref.y || 0;
  sprite.opacity = 255;
};

Sprite_Damage.prototype.jakeCreateTextSpriteSRD = function(seg, ref) {
  var built = this.jakeBuildTextBitmap(seg);
  var sprite = new Sprite(built.bitmap);
  this.jakeSRDApplyRef(sprite, ref);
  sprite._jakeWidth = built.width;
  this.addChild(sprite);
  return sprite;
};

Sprite_Damage.prototype.jakeCreateIconSpriteSRD = function(iconIndex, size,
    ref) {
  var iw = Window_Base._iconWidth || 32;
  var ih = Window_Base._iconHeight || 32;
  var scale = ((Number(size) || 28) * 1.2) / ih;
  var sprite = new Sprite();
  sprite.bitmap = ImageManager.loadSystem('IconSet');
  sprite.setFrame((iconIndex % 16) * iw, Math.floor(iconIndex / 16) * ih,
    iw, ih);
  sprite.scale.x = scale;
  sprite.scale.y = scale;
  this.jakeSRDApplyRef(sprite, ref);
  sprite._jakeWidth = iw * scale;
  this.addChild(sprite);
  return sprite;
};

// SRD "default"-anim children compute y as round(ry)+oriY every frame, so the
// vertical offset is baked into oriY (persists across the bounce). x is static
// after the one-time += xBase, so the horizontal offset goes straight on x.
Sprite_Damage.prototype.jakeSRDApplyOffset = function(sprite, ox, oy) {
  sprite.x += ox;
  sprite.oriX = sprite.x;
  if (oy) { sprite.oriY += oy; sprite.y += oy; }
};

Sprite_Damage.prototype.jakeLayoutSegmentsSRD = function(startX, ref, defaults) {
  var segs = Yanfly.EML_JakeMSGAdd.buildPopupSegments(this._result, defaults);
  var x = startX;
  var gap = 4;
  for (var i = 0; i < segs.length; ++i) {
    var seg = segs[i];
    var ox = seg.offsetX || 0, oy = seg.offsetY || 0;
    if (i > 0) x += gap * 2;
    if (seg.icon !== null && seg.icon !== undefined && !seg.iconAfter) {
      var ib = this.jakeCreateIconSpriteSRD(seg.icon, seg.size, ref);
      ib.x = x; this.jakeSRDApplyOffset(ib, ox, oy);
      x += ib._jakeWidth + gap;
    }
    var sp = this.jakeCreateTextSpriteSRD(seg, ref);
    sp.x = x; this.jakeSRDApplyOffset(sp, ox, oy);
    x += sp._jakeWidth + gap;
    if (seg.icon !== null && seg.icon !== undefined && seg.iconAfter) {
      var ia = this.jakeCreateIconSpriteSRD(seg.icon, seg.size, ref);
      ia.x = x; this.jakeSRDApplyOffset(ia, ox, oy);
      x += ia._jakeWidth + gap;
    }
  }
};

// Appends the styled element name after SRD has drawn the HP number/text.
Sprite_Damage.prototype.jakeAppendHpElementNameSRD = function(baseRow, value) {
  if (!this._result) return;
  var info = (typeof SRD !== 'undefined' && SRD.BattlePopupCustomizer &&
    SRD.BattlePopupCustomizer.popups) ?
    SRD.BattlePopupCustomizer.popups[baseRow] : null;
  if (!info) return;
  var ref = this.jakeRefChild(); // rightmost char SRD just created
  if (!ref) return;
  // Match SRD's per-character cell width, then start just past the last char.
  var w = 20;
  if (this.createChildBitmap && this.digitWidthFromBitmap) {
    try { w = this.digitWidthFromBitmap(this.createChildBitmap(info)); }
    catch (e) { w = ref.width || 20; }
  } else if (ref.width) {
    w = ref.width;
  }
  var startX = (ref.oriX !== undefined ? ref.oriX : ref.x) + w / 2 + 6;
  // Defaults follow SRD's own popup styling so un-overridden names blend in.
  var dummy = this.createChildBitmap ? this.createChildBitmap(info) : null;
  var defaults = {
    size: (dummy && dummy.fontSize) ? dummy.fontSize : 28,
    color: info.color || '#ffffff',
    font: (dummy && dummy.fontFace) ? dummy.fontFace : 'GameFont'
  };
  this.jakeLayoutSegmentsSRD(startX, ref, defaults);
};

// Install the hooks from several independent points so it works no matter the
// plugin load order relative to the popup plugin, and even if another plugin
// overrides Scene_Boot.start:
//   1) right now (works if the popup plugin is already loaded above this one),
//   2) at Scene_Boot.start (works if the popup plugin loads below this plugin),
//   3) at Scene_Battle.start (last-resort, always runs before any popup).
Yanfly.EML_JakeMSGAdd.installPopupHook();
if (typeof Scene_Boot !== 'undefined') {
  Yanfly.EML_JakeMSGAdd.Scene_Boot_start_popup = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function() {
    Yanfly.EML_JakeMSGAdd.installPopupHook();
    Yanfly.EML_JakeMSGAdd.Scene_Boot_start_popup.call(this);
  };
}
if (typeof Scene_Battle !== 'undefined') {
  Yanfly.EML_JakeMSGAdd.Scene_Battle_start_popup = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function() {
    Yanfly.EML_JakeMSGAdd.installPopupHook();
    Yanfly.EML_JakeMSGAdd.Scene_Battle_start_popup.call(this);
  };
}

} // end damage-popup integration

//=============================================================================
// End of File
//=============================================================================

}
