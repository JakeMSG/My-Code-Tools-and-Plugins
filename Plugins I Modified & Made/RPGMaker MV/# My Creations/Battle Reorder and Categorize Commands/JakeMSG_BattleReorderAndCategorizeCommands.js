//=============================================================================
// JakeMSG_BattleReorderAndCategorizeCommands
// JakeMSG_BattleReorderAndCategorizeCommands.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_BattleReorderAndCategorizeCommands = true;

var JakeMSG = JakeMSG || {};
JakeMSG.BattleReorderAndCategorizeCommands = JakeMSG.BattleReorderAndCategorizeCommands || {};

var TH = TH || {};
TH.ActorBattleCommands = TH.ActorBattleCommands || {};

if (typeof Data_BattlerCommand !== 'function') {
    Data_BattlerCommand = function Data_BattlerCommand() {
        this.initialize.apply(this, arguments);
    };
}

//=============================================================================
 /*:
 * @plugindesc Reorder and categorize the Battle Menu, Actor Battle Commands, and map Skills.
 * Adds nested submenus, skill subcommands, hotkeys, and plugin-parameter overrides.
 * @author JakeMSG
 * v1.0
 *
============ Change Log ============
1.0 - 9.11th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 *
 * This plugin lets you reorder and categorize:
 *   - The Battle Menu (Fight / Escape and commands added by other plugins)
 *   - Each Actor's Battle Commands (Attack, skills, items, custom commands, ...)
 *   - The map Cancel menu's Skills option (per actor), without replacing the
 *     Skills command itself so other plugins can still add to that menu
 *
 * You can nest commands inside other commands. Selecting a parent command opens
 * a submenu that looks like a Skill Type window. Cancel returns to the parent
 * menu, like normal battle menus.
 *
 * It extends "HIME_ActorBattleCommands", "HIME_BattleCommandUseSkill", and
 * "HIME_BattleCommandChangeEquip". If those plugins are missing, this plugin
 * implements their features so it can also run standalone.
 *
 * Plugin Parameters can replace or add to notetags for a given Actor ID /
 * Skill ID. Both kinds are re-applied when a save is loaded, so changing them
 * between play sessions still affects existing saves. Notetag-only commands
 * (no Replacing and no Adding lists for that ID) stay baked into a save the
 * way HIME does (they are not rebuilt from notes on load).
 *
 * Place this plugin below HIME_ActorBattleCommands, HIME_BattleCommandUseSkill,
 * and HIME_BattleCommandChangeEquip when those are used.
 *
 * ============================================================================
 * Actor Battle Commands (notetags)
 * ============================================================================
 *
 * Put these in Actor notes (and Class notes, same HIME priority: Actor notes
 * if any, otherwise Class notes, otherwise the default Attack / Skill Types /
 * Guard / Item list).
 *
 * -------- Simple (inline) format --------
 *
 *   <battle command: SYMBOL />
 *   <battle command: SYMBOL EXT />
 *
 * Hyphens and underscores are also accepted: <battle-command: ... />
 *
 * Built-in SYMBOL values:
 *   attack            - Attack
 *   guard             - Guard
 *   item              - Item window
 *   skill_list        - Every Skill Type the actor currently has
 *   skill_type ID     - One Skill Type (EXT is the Skill Type ID)
 *   use_skill ID      - Use that skill directly (EXT is the Skill ID)
 *   change_equip      - Change equipment in battle (needs Yanfly Change Battle Equip)
 *   auto              - Individual Auto (JakeMSG_BattleAutoModes, if available)
 *   switch            - Switch (YEP_X_ActorPartySwitch, if available)
 *
 * Any other SYMBOL is a custom symbol. By itself it has no battle effect.
 * Use custom symbols for category menus, or as the "final" choice inside a
 * submenu so that parent command/skill effects can still run.
 *
 * Examples:
 *
 *   <battle command: attack />
 *   <battle command: skill_type 1 />
 *   <battle command: use_skill 26 />
 *
 * -------- Advanced (paired) format --------
 *
 *   <battle command>
 *     name: "Display Name"
 *     symbol: "SYMBOL"
 *     ext: EXTRA_DATA
 *     isEnabled: "javascript formula"
 *     isVisible: "javascript formula"
 *     hotkey: KEYCODE
 *     showSkillIcon: true or "javascript formula"
 *     showSkillCost: true or "javascript formula"
 *     description: "Help text.\\nSecond line."
 *   </battle command>
 *
 * You only need the traits you want to use. Formulas can use as helper variables:
 *   a / user  - the actor
 *   s         - $gameSwitches
 *   v         - $gameVariables
 *
 * Example that uses symbol + ext together (use skill 26, shown as "Fire"):
 *
 *   <battle command>
 *     name: "Fire"
 *     symbol: "use_skill"
 *     ext: 26
 *     isEnabled: "a.mp >= 10"
 *     isVisible: "a.level >= 3"
 *     hotkey: 70
 *     showSkillIcon: true
 *     showSkillCost: "a.level >= 5"
 *   </battle command>
 *
 * (70 is the keyboard keycode for F.)
 *
 * -------- use_skill display (name / icon / cost) --------
 *
 * For symbol use_skill (actor battle commands, nested submenus, and skill
 * battle subcommands, including Plugin Parameters):
 *
 *   name           - If set, that text is shown instead of the skill's database
 *                    name. If you leave name uninitialized, the skill name is
 *                    used.
 *   showSkillIcon  - Default true. false, or a JS formula that returns false,
 *                    hides the skill's icon. true (or unset) draws the icon to
 *                    the left of the name (same as a normal Skill Type window).
 *   showSkillCost  - Default true. false, or a JS formula that returns false,
 *                    hides the skill's costs. true (or unset) draws costs on
 *                    the right (MP/TP/HP, Yanfly Skill Core costs, cooldowns,
 *                    etc.).
 *
 * Inline <battle command: use_skill 26 /> has no name trait, so it shows the
 * skill's database name. Icon and cost still show by default; set
 * showSkillIcon / showSkillCost to false in the advanced format (or Plugin
 * Parameters) if you want them hidden.
 *
 * ============================================================================
 * Command descriptions (nested menus / skill subcommands)
 * ============================================================================
 *
 * The battle skill description window (the help window used by the Skill Type
 * list) is used for nested battle commands and for ALL battle subcommands.
 * The un-nested Actor Battle Command list (Attack / Magic / ... on the actor
 * command window) never shows that help window, even for use_skill.
 * The map Skills screen keeps the help window visible when Map Skills replace
 * it; Map Skill entries can use description the same way nested battle
 * commands do.
 *
 * Trait: description  (text; default unset)
 *
 *   Unset + symbol use_skill + that skill has a description
 *                    - Show that skill's description (including extended
 *                      description notetags from other plugins, if any).
 *   Unset otherwise  - Do not show the description window.
 *   Set              - Show this text in the description window. Write \n
 *                      for a new line (also works as a real line break in
 *                      Plugin Parameter note fields).
 *
 * description is ignored on the un-nested actor battle command. Nested
 * commands inside those (and every <battle subcommand>) can use it.
 *
 * Example (nested use_skill with a custom help line):
 *
 *   <battle command>
 *     name: "Fire"
 *     symbol: "use_skill"
 *     ext: 26
 *     description: "Burns the foe.\\nIgnores the skill's database help."
 *   </battle command>
 *
 * ============================================================================
 * Nesting Actor Battle Commands
 * ============================================================================
 *
 * The advanced <battle command> ... </battle command> block can contain more
 * <battle command> tags (simple or advanced) anywhere among the traits.
 * Those inner commands become a submenu of the parent.
 *
 * Selecting a parent opens the submenu. The parent's own symbol effect does
 * NOT run yet. Cancel returns to the parent menu.
 *
 * Nesting can be repeated (submenu inside submenu).
 *
 * A command with no (visible) nested commands is a "final" command. When you
 * pick a final command, effects run from the inside out:
 *   1) The final command itself
 *   2) Then its parent, then that parent, ... up to the outermost menu
 *
 * Custom symbols in that chain do nothing on their own. Skill / attack /
 * guard / use_skill effects in the chain still run, inner first.
 *
 * Example: a Magic category that contains Fire (skill 26) and an Ice submenu:
 *
 *   <battle command>
 *     name: "Magic"
 *     symbol: "magic_menu"
 *     <battle command: use_skill 26 />
 *     <battle command>
 *       name: "Ice"
 *       symbol: "ice_menu"
 *       <battle command>
 *         name: "Ice I"
 *         symbol: "use_skill"
 *         ext: 27
 *       </battle command>
 *       <battle command: use_skill 28 />
 *     </battle command>
 *     isEnabled: "a.mp > 0"
 *   </battle command>
 *
 * "magic_menu" and "ice_menu" are custom symbols (category labels only).
 *
 * ============================================================================
 * Actor Map Skills (notetags)
 * ============================================================================
 *
 * Put these in Actor notes only. They replace that actor's map Skills screen
 * (the Cancel menu's Skills option still opens Scene_Skill; only the screen
 * contents change). They do not change battle commands.
 *
 * <battle command> / <battle subcommand> / <battle menu option> are ignored
 * here. Use <map skill> (hyphens/underscores also accepted: <map-skill>,
 * <map_skill>). <actor map skill> is still accepted.
 *
 * Simple:
 *
 *   <map skill: use_skill 26 />
 *   <map skill: skill_type 1 />
 *   <map skill: skill_list />
 *   <map skill: item />
 *   <map skill: change_equip />
 *   <map skill: mirror_battle_commands />
 *
 * Advanced and nesting use the same traits as <battle command> (name, symbol,
 * ext, isEnabled, isVisible, hotkey, showSkillIcon, showSkillCost,
 * description). Nest more <map skill> tags inside a paired block:
 *
 *   <map skill>
 *     name: "Magic"
 *     symbol: "magic_menu"
 *     <map skill: use_skill 26 />
 *     <map skill>
 *       name: "Ice"
 *       symbol: "ice_menu"
 *       <map skill: use_skill 27 />
 *     </map skill>
 *   </map skill>
 *
 * Dedicated Plugin Parameter lists under "==== Actor Map Skills ====":
 * "== Replace ==" fully replaces that Actor ID's notetags when a list is set.
 * "== Add ==" is appended after notetags (or after Replace, if that ID has
 * one). Script-call mutations still run after both.
 *
 * While a Map Skill menu is in use, the skill description (help) window and
 * the skill list stay visible. Nested Map Skill menus use the skill list
 * window; the type list stays on the root. Root use_skill costs (when shown)
 * appear as the first line of the description window.
 * 
 * ==== New Symbol (only for Map Skills): mirror_battle_commands
 * This symbol is used to mirror the battle commands of the actor to the map skills screen.
 * Be careful with this symbol and where you add it, as some skills may be Battle-only
 * 
 * Also be careful for Map Skills javascript conditions, the some of the helper variables
 * (such as "a") may not be available outside of a battle
 * 
 * Hotkeys for Map Skills only trigger when you're in the Skills screen and have selected
 * the proper Actor for it (and, as before, when that skill is enabled and usable)
 *
 * ============================================================================
 * Skill Battle Subcommands
 * ============================================================================
 *
 * Skills can use the same system with <battle subcommand> (simple or advanced,
 * and nestable the same way). If a skill has any of these notetags, choosing
 * that skill (from a Skill Type window or from use_skill) first opens a
 * submenu of those subcommands instead of using the skill immediately.
 *
 * The skill's normal effects (costs, damage, YEP eval timings, etc.) run only
 * after a final subcommand is chosen, and only after that final command's own
 * effect. Nested skills / use_skill parents then run from innermost to
 * outermost.
 *
 * Simple:
 *
 *   <battle subcommand: use_skill 12 />
 *
 * Advanced with ext:
 *
 *   <battle subcommand>
 *     name: "Burn"
 *     symbol: "use_skill"
 *     ext: 12
 *     isEnabled: "a.hp > 100"
 *     hotkey: 66
 *     showSkillIcon: true
 *     showSkillCost: true
 *     description: "A burning follow-up.\\nUses skill 12."
 *   </battle subcommand>
 *
 * Nested skill example (Skill 100 opens a submenu; picking Fire uses skill 12
 * first, then skill 100):
 *
 *   <battle subcommand>
 *     name: "Fire Path"
 *     symbol: "fire_path"
 *     <battle subcommand>
 *       name: "Fire"
 *       symbol: "use_skill"
 *       ext: 12
 *     </battle subcommand>
 *   </battle subcommand>
 *
 * You can chain different skills this way: a subcommand with symbol use_skill
 * and ext of another skill ID. If THAT skill also has <battle subcommand>
 * tags, it opens its own submenu before it is used.
 *
 * ============================================================================
 * <Before Subcommand Menu> (skill notes)
 * ============================================================================
 *
 * Script eval that runs when the skill is selected, BEFORE its submenu opens.
 * This is separate from the skill's normal eval timings, which still wait
 * until after the final subcommand is chosen.
 *
 *   <Before Subcommand Menu>
 *   v[10] += 1;
 *   console.log(a.name() + ' opened ' + skill.name);
 *   </Before Subcommand Menu>
 *
 * Variables: a / user / subject (the actor), skill / item (the skill),
 * s ($gameSwitches), v ($gameVariables).
 *
 * ============================================================================
 * Hotkeys
 * ============================================================================
 *
 * Trait: hotkey  (number = keyboard keycode)
 * Default: unset (0).
 *
 * If that key is pressed while the matching command/subcommand/option is
 * enabled, visible, and usable the same way it would be if you selected it
 * by hand, it is triggered immediately (no need to cursor to it). Nested
 * entries can be reached from a parent menu. If it has a submenu, that
 * submenu opens. Cancel from a hotkey-opened submenu returns to whatever
 * menu was open BEFORE the hotkey, not to a skipped parent in the tree.
 *
 * Searched in battle: actor command trees, skill subcommand trees, and
 * Battle Menu options (while the Battle Menu is open). Nested hotkeys
 * under a skill you cannot use (cooldown, cost, sealed type, etc.) buzz
 * instead of firing.
 *
 * Searched on the map Skills screen: Actor Map Skills (including nested
 * entries and mirrored battle commands) while that screen is open.
 *
 * A hotkey only fires if that entry could be chosen by hand right now
 * (visible, enabled, and actually usable). That includes restrictions from
 * other plugins, such as YEP Skill Cooldowns and Warmups, limited skill uses,
 * costs, sealed skill types, and having no valid targets. Pressing a hotkey
 * for an unusable entry plays the buzzer and does nothing.
 *
 * Common keycodes: 65-90 = A-Z, 48-57 = 0-9, 112-123 = F1-F12.
 *
 * ============================================================================
 * Dedicated settings (Battle Menu / Actor Map Skills)
 * ============================================================================
 *
 * These live under "======== Dedicated settings ========".
 *
 * -------- Battle Menu Options --------
 *
 * "==== Battle Menu Options ====" is a list. Leave it uninitialized
 * to keep the default Fight / Escape menu (plus other plugins' additions).
 *
 * If you add at least one option, that list REPLACES the Battle Menu.
 *
 * Each option has Name, Symbol, Ext, IsEnabled, IsVisible, Hotkey,
 * Show Skill Icon, Show Skill Cost, Description, Nested Commands, and
 * Nested Commands (Text) (same nesting as actor commands). Show Skill Icon /
 * Show Skill Cost apply when Symbol is use_skill. Description is used when
 * that option is shown inside a nested Battle Menu (not on the small Fight /
 * Escape window).
 *
 * Nested Commands (Text) is an alternative to Nested Commands: paste notetag
 * text using <battle menu option> (hyphens/underscores also accepted). If
 * both Nested Commands and Nested Commands (Text) are filled, the struct
 * list comes first in the submenu, then the text list. At nesting level 100
 * (BRCCCmd100) there is no Nested Commands struct field; only Nested
 * Commands (Text).
 *
 * Supported Battle Menu symbols (if that plugin's command is available;
 * otherwise the symbol is treated as custom / no-op, useful as a submenu
 * parent or a final dummy choice):
 *
 *   fight         - Fight
 *   escape        - Escape
 *   status        - Status parent (JakeMSG_YEP_X_InBattleStatus_Additions)
 *   allystatus    - Ally Status (YEP_X_InBattleStatus)
 *   enemystatus   - Enemy Status (JakeMSG_YEP_X_InBattleStatus_Additions)
 *   auto          - Team Auto (JakeMSG_BattleAutoModes)
 *   passives      - Passives parent (JakeMSG_PassivesForAll)
 *   allypassives  - Party Passives (JakeMSG_PassivesForAll)
 *   enemypassives - Enemy Passives (JakeMSG_PassivesForAll)
 *   fieldeffects  - Field Effects (JakeMSG_HO_FieldEffects_Additions)
 *   formation     - Formation (YEP_PartySystem)
 *
 * Other symbols are custom (no effect of their own).
 *
 * -------- Actor Map Skills --------
 *
 * "==== Actor Map Skills ====" has two child groups:
 *   == Replace ==   (= Actor List 1 (Map) = ... 10)
 *   == Add ==       (= Actor List 1 (Map) (Add) = ... 10)
 * These set the menu each actor sees after choosing Skills on the map (the
 * Cancel menu). The Skills command on that menu is left unchanged so other
 * plugins can still add options; only the Skills screen for that actor is
 * replaced when a Replace/Add list (or notetags / script calls) exists.
 *
 * Each list uses the same shape as Actor Battle Commands:
 *   ID          - Actor database ID
 *   Map Skills  - list of map skills (Name, Symbol, Ext, IsEnabled, IsVisible,
 *                 Hotkey, Show Skill Icon, Show Skill Cost, Nested Commands,
 *                 Nested Commands (Text)). The un-nested Map Skills row has
 *                 no Description field; nested rows do.
 *
 * Actor notes and Nested Commands (Text) / script-call textForm use
 * <map skill> (hyphens/underscores also accepted). <actor map skill> is still
 * accepted:
 *
 *   <map skill: use_skill 26 />
 *   <map skill>;name: "Magic";symbol: "magic";</map skill>
 *
 * If the same ID appears in more than one list of the same group, a later
 * list wins (10 beats 1). Replace and Add are separate: an ID can have both.
 * Replace fully replaces that ID's <map skill> notetags. If that ID has no
 * Replace list, notetags are used. Add lists are appended after that base.
 * These lists also apply to existing save files.
 *
 * Extra symbol for Map Skills only:
 *   mirror_battle_commands
 *     In that slot, insert a copy of this actor's Battle Command tree as it
 *     is set for battle: Actor/Skill notetags plus Plugin Parameters under
 *     "==== Actor Battle Commands ====" and "==== Skill Battle Subcommands ===="
 *     (including Adding lists). use_skill entries that have skill subcommands
 *     are opened as nested Map Skill menus. Script-call changes to Map Skills
 *     do not change the battle copy; battle script-call changes are included
 *     in the mirrored tree.
 *
 * Map Skill symbols that do something on the map:
 *   use_skill ID     - Use that skill from the menu
 *   skill_type ID    - Open the vanilla skill list for that Skill Type
 *   skill_list       - List the actor's Skill Types (then open that list)
 *   item             - Open the Item screen
 *   change_equip     - Open the Equip screen
 * Nested Map Skills open in the Skill List window (the type list stays on
 * the root). The skill description window and the skill list stay visible.
 * On the root type list, use_skill costs are shown as the first line of the
 * description window instead of in the type list. Other symbols are
 * custom / no-op unless they have nested children.
 *
 * ============================================================================
 * Plugin Parameter lists (Actors / Skills)
 * ============================================================================
 *
 * Actor and Skill lists live under two parent groups:
 *
 *   ======== Replacing Notetag settings ========
 *     ==== Actor Battle Commands ====   (== Actor List 1 == ... 10)
 *     ==== Skill Battle Subcommands ==== (== Skill List 1 == ... 10)
 *
 *   ======== Adding to existing settings ========
 *     ==== Actor Battle Commands (Add) ====   (== Actor List 1 (Add) == ... 10)
 *     ==== Skill Battle Subcommands (Add) ==== (== Skill List 1 (Add) == ... 10)
 *
 * The "(Add)" names are required so the Plugin Manager can store Replacing
 * and Adding lists as separate parameters.
 *
 * Replacing lists fully replace that Actor/Skill ID's notetags (same as
 * before). If that ID has no Replacing list, notetags (or the default actor
 * command list) are used.
 *
 * Adding lists are appended AFTER that base (notetags, or the Replacing list
 * if one is set for that ID). Adding lists also apply to existing save files
 * when a save is loaded or a battle starts.
 *
 * Script-call add/remove still runs AFTER notetags and both Plugin Parameter
 * groups, and is stored in the save file.
 *
 * Each list is a list of structs:
 *   ID                 - Actor or Skill database ID
 *   Battle Commands / Battle Subcommands
 *                      - list of commands (Name, Symbol, Ext, IsEnabled,
 *                        IsVisible, Hotkey, Show Skill Icon, Show Skill Cost,
 *                        Description, Nested Commands, Nested Commands (Text)).
 *                        Actor List "Battle Commands" (the un-nested actor
 *                        command row) has no Description field; nested rows
 *                        and Skill List subcommands do.
 *
 * Nested Commands is the same struct again, so you can nest in the Plugin
 * Manager. This plugin provides BRCCCmd through BRCCCmd100 (100 nested
 * struct levels).
 *
 * Nested Commands (Text) is a note box with the same notetag format used in
 * database notes:
 *   Actor / nested actor commands: <battle command>
 *   Skill subcommands:             <battle subcommand>
 *   Battle Menu options:           <battle menu option>
 *   Actor Map Skills:              <map skill>  (also <actor map skill>)
 * If both Nested Commands and Nested Commands (Text) are filled, the struct
 * entries are first in the submenu, then the text entries. At BRCCCmd100
 * there is no Nested Commands struct field; only Nested Commands (Text).
 *
 * If the same ID appears in more than one list of the same group, a later
 * list wins (10 beats 1). Replacing and Adding are separate: an ID can have
 * a Replacing list and an Adding list at the same time.
 *
 * Leave Name empty to use the default name for that symbol (Attack, the
 * skill's name for use_skill, etc.).
 * Show Skill Icon and Show Skill Cost default to on (true). Set them to
 * false or a JS formula that returns false when Symbol is use_skill if you
 * want to hide the skill icon and/or cost.
 * Description defaults to empty (unset). When set on a nested command or
 * any skill subcommand, that text is shown in the skill description window.
 *
 * ============================================================================
 * Effect order (nested skills / commands)
 * ============================================================================
 *
 * After a final command/subcommand is chosen:
 *
 *   Final command effect
 *   -> innermost parent
 *   -> ...
 *   -> outermost parent
 *
 * Parent menus that only use a custom symbol contribute no extra effect.
 * Parent use_skill / skill entries are used as extra actions after the
 * innermost real action, in that same inner-to-outer order, sharing the
 * target when possible.
 *
 * ============================================================================
 * Managing commands with events (HIME script calls)
 * ============================================================================
 *
 * Actor battle commands (un-nested and nested):
 *
 *   hide_actor_command(ID, SYMBOL)
 *   show_actor_command(ID, SYMBOL)
 *   enable_actor_command(ID, SYMBOL)
 *   disable_actor_command(ID, SYMBOL)
 *
 * ID is the Actor database ID. The whole command tree is searched, so nested
 * battle commands are affected the same way as the un-nested actor list.
 *
 * Optional third argument EXT for commands that use extra data:
 *
 *   hide_actor_command(ID, SYMBOL, EXT)
 *
 * If EXT is omitted, every command with that SYMBOL is affected. If EXT is
 * passed, only commands with that extra data are affected (for example
 * hide_actor_command(1, "use_skill", 26) hides Fire if its ext is 26).
 *
 * Skill battle subcommands (un-nested and nested):
 *
 *   hide_skill_subcommand(ID, SYMBOL)
 *   show_skill_subcommand(ID, SYMBOL)
 *   enable_skill_subcommand(ID, SYMBOL)
 *   disable_skill_subcommand(ID, SYMBOL)
 *
 * ID is the Skill database ID. These search that skill's full subcommand tree.
 * Optional EXT works the same way:
 *
 *   hide_skill_subcommand(12, "use_skill", 26)
 *
 * Battle Menu options (un-nested and nested). No Actor/Skill ID:
 *
 *   hide_battlemenu_option(SYMBOL)
 *   show_battlemenu_option(SYMBOL)
 *   enable_battlemenu_option(SYMBOL)
 *   disable_battlemenu_option(SYMBOL)
 *
 * Optional second argument EXT works the same way as the actor/skill calls.
 *
 * Actor Map Skills (un-nested and nested). ID is the Actor database ID:
 *
 *   hide_actor_mapskill(ID, SYMBOL)
 *   show_actor_mapskill(ID, SYMBOL)
 *   enable_actor_mapskill(ID, SYMBOL)
 *   disable_actor_mapskill(ID, SYMBOL)
 *
 * Optional EXT works the same way. These affect Map Skills, not battle
 * commands. The Skills option on the map Cancel menu is not renamed or
 * removed.
 *
 * ============================================================================
 * Adding / removing / printing commands (saved in the save file)
 * ============================================================================
 *
 * These change the command trees AFTER notetags and Plugin Parameters
 * (both Replacing and Adding lists). The operations are stored in the save
 * file and are replayed whenever those lists are rebuilt (including on load).
 *
 * textForm is the inline notetag writing of one command (or a whole nested
 * tree). Write it as you would in notes, but put a ";" where a new line would
 * go. Notetag open/close/inline tags do not need a ";" after them (they are
 * treated as if they stood alone on a line).
 *
 * Actor / skill notetag names stay "battle command" / "battle subcommand".
 * Battle Menu options use "battle menu option". Actor Map Skills use
 * "map skill" (<actor map skill> is still accepted when reading):
 *
 *   <battle command: attack />
 *   <battle command>;name: "Fire";symbol: "use_skill";ext: 26;</battle command>
 *   <battle menu option: fight />
 *   <battle menu option>;name: "Status";symbol: "status";</battle menu option>
 *   <map skill: mirror_battle_commands />
 *   <map skill>;name: "Fire";symbol: "use_skill";ext: 26;</map skill>
 *
 * If SYMBOL is omitted or "" on any add* call, the new element is added at
 * the root (outside any nesting). addbefore / addinsidebegin prepend at root;
 * addafter / addinsideend append at root.
 *
 * Actor (ID = Actor database ID):
 *
 *   addafter_actor_command(ID, SYMBOL, textForm)
 *   addbefore_actor_command(ID, SYMBOL, textForm)
 *   addinsidebegin_actor_command(ID, SYMBOL, textForm)
 *   addinsideend_actor_command(ID, SYMBOL, textForm)
 *   remove_actor_command(ID, SYMBOL)
 *   showintext_actor_command(ID, SYMBOL)
 *   printtoconsole_actor_command(ID, SYMBOL)
 *
 * Actor Map Skills (ID = Actor database ID):
 *
 *   addafter_actor_mapskill(ID, SYMBOL, textForm)
 *   addbefore_actor_mapskill(ID, SYMBOL, textForm)
 *   addinsidebegin_actor_mapskill(ID, SYMBOL, textForm)
 *   addinsideend_actor_mapskill(ID, SYMBOL, textForm)
 *   remove_actor_mapskill(ID, SYMBOL)
 *   showintext_actor_mapskill(ID, SYMBOL)
 *   printtoconsole_actor_mapskill(ID, SYMBOL)
 *
 * Skill (ID = Skill database ID):
 *
 *   addafter_skill_subcommand(ID, SYMBOL, textForm)
 *   addbefore_skill_subcommand(ID, SYMBOL, textForm)
 *   addinsidebegin_skill_subcommand(ID, SYMBOL, textForm)
 *   addinsideend_skill_subcommand(ID, SYMBOL, textForm)
 *   remove_skill_subcommand(ID, SYMBOL)
 *   showintext_skill_subcommand(ID, SYMBOL)
 *   printtoconsole_skill_subcommand(ID, SYMBOL)
 *
 * Battle Menu (no ID):
 *
 *   addafter_battlemenu_option(SYMBOL, textForm)
 *   addbefore_battlemenu_option(SYMBOL, textForm)
 *   addinsidebegin_battlemenu_option(SYMBOL, textForm)
 *   addinsideend_battlemenu_option(SYMBOL, textForm)
 *   remove_battlemenu_option(SYMBOL)
 *   showintext_battlemenu_option(SYMBOL)
 *   printtoconsole_battlemenu_option(SYMBOL)
 *
 * addafter / addbefore insert next to the command whose symbol is SYMBOL.
 * addinsidebegin / addinsideend insert inside that command's submenu (the
 * command becomes a submenu parent if it had no nested commands yet).
 * addinsidebegin is the first child; addinsideend is the last child.
 * remove deletes matching commands (nested included).
 * showintext returns that command's textForm (including nested children).
 * printtoconsole logs that same textForm to the console (it does not return it).
 *
 * Optional EXT on showintext / printtoconsole works like hide/show:
 *   showintext_actor_command(ID, SYMBOL, EXT)
 *   printtoconsole_skill_subcommand(ID, SYMBOL, EXT)
 *   showintext_battlemenu_option(SYMBOL, EXT)
 *   showintext_actor_mapskill(ID, SYMBOL, EXT)
 *
 * ============================================================================
 * Compatible Plugins
 * ============================================================================
 *
 * ======== HIME_ActorBattleCommands (extended; implemented if missing)
 * ======== HIME_BattleCommandUseSkill (extended; implemented if missing)
 * ======== HIME_BattleCommandChangeEquip (extended; implemented if missing)
 * ======== YEP_X_InBattleStatus / JakeMSG_YEP_X_InBattleStatus_Additions
 * ======== JakeMSG_BattleAutoModes
 * ======== JakeMSG_PassivesForAll
 * ======== JakeMSG_HO_FieldEffects_Additions
 * ======== YEP_PartySystem
 * ======== YEP_X_ActorPartySwitch
 * ======== YEP_X_ChangeBattleEquip (needed for change_equip to actually open)
 *
 * ============================================================================
 * Module Plugins
 * ============================================================================
 *
 * None.
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 *
 * @param ======== Dedicated settings ========
 * @desc Battle Menu Options and Actor Map Skills (map Cancel menu Skills screen).
 * @default
 *
 * @param ==== Battle Menu Options ====
 * @parent ======== Dedicated settings ========
 * @type struct<BRCCCmd>[]
 * @desc Replaces the party Battle Menu when at least one option is set.
 * Leave empty to keep the default menu (Fight, Escape, and other plugins).
 * @default
 *
 * @param ==== Actor Map Skills ====
 * @parent ======== Dedicated settings ========
 * @default
 *
 * @param == Replace ==
 * @parent ==== Actor Map Skills ====
 * @desc Fully replaces that Actor ID's <map skill> notetags when a list is set.
 * @default
 *
 * @param = Actor List 1 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 2 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 3 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 4 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 5 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 6 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 7 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 8 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 9 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 10 (Map) =
 * @parent == Replace ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param == Add ==
 * @parent ==== Actor Map Skills ====
 * @desc Appended after notetags or the Replace list for that Actor ID.
 * @default
 *
 * @param = Actor List 1 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 2 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 3 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 4 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 5 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 6 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 7 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 8 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 9 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param = Actor List 10 (Map) (Add) =
 * @parent == Add ==
 * @type struct<BRCCMapActor>[]
 * @default []
 *
 * @param ======== Replacing Notetag settings ========
 * @desc Actor / Skill lists here fully replace that ID's notetags.
 * @default
 *
 * @param ==== Actor Battle Commands ====
 * @parent ======== Replacing Notetag settings ========
 * @default
 *
 * @param == Actor List 1 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 2 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 3 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 4 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 5 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 6 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 7 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 8 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 9 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 10 ==
 * @parent ==== Actor Battle Commands ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param ==== Skill Battle Subcommands ====
 * @parent ======== Replacing Notetag settings ========
 * @default
 *
 * @param == Skill List 1 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 2 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 3 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 4 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 5 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 6 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 7 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 8 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 9 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 10 ==
 * @parent ==== Skill Battle Subcommands ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param ======== Adding to existing settings ========
 * @desc Actor / Skill lists here are appended after notetags or after Replacing lists.
 * @default
 *
 * @param ==== Actor Battle Commands (Add) ====
 * @parent ======== Adding to existing settings ========
 * @default
 *
 * @param == Actor List 1 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 2 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 3 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 4 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 5 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 6 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 7 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 8 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 9 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param == Actor List 10 (Add) ==
 * @parent ==== Actor Battle Commands (Add) ====
 * @type struct<BRCCActor>[]
 * @default []
 *
 * @param ==== Skill Battle Subcommands (Add) ====
 * @parent ======== Adding to existing settings ========
 * @default
 *
 * @param == Skill List 1 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 2 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 3 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 4 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 5 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 6 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 7 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 8 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 9 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
 *
 * @param == Skill List 10 (Add) ==
 * @parent ==== Skill Battle Subcommands (Add) ====
 * @type struct<BRCCSkill>[]
 * @default []
*/

//=============================================================================

(function($) {

    var ABC = TH.ActorBattleCommands;
    var BRCC_HIME_PRESENT = !!Imported.ActorBattleCommands;

    $.PARTY_SYMBOLS = {
        fight: 'fight',
        escape: 'escape',
        status: 'statusCommandGroup',
        allystatus: 'inBattleStatus',
        enemystatus: 'enemyInBattleStatus',
        auto: 'bamAuto',
        passives: 'jakePassivesCommandGroup',
        allypassives: 'jakePartyPassives',
        enemypassives: 'jakeEnemyPassives',
        fieldeffects: 'fieldEffectsStatus',
        formation: 'formation'
    };

    $.ACTOR_SYMBOLS = {
        auto: 'auto',
        switch: 'partyswitch',
        skill: 'skill_type'
    };

    //-------------------------------------------------------------------------
    // Data_BattlerCommand
    //-------------------------------------------------------------------------

    if (!Data_BattlerCommand.prototype.initialize) {
        Data_BattlerCommand.prototype.initialize = function(name, symbol, ext) {
            this._name = name;
            this._symbol = symbol;
            this._ext = ext;
            this._enabled = true;
            this._visible = true;
            this._enableCondition = null;
            this._visibleCondition = null;
            this._hotkey = null;
            this._children = [];
        };
        Data_BattlerCommand.prototype.name = function() { return this._name; };
        Data_BattlerCommand.prototype.setName = function(name) { this._name = name; };
        Data_BattlerCommand.prototype.symbol = function() { return this._symbol; };
        Data_BattlerCommand.prototype.ext = function() { return this._ext; };
        Data_BattlerCommand.prototype.isEnabled = function(user) {
            return this._enabled && (!this._enableCondition || this.evalCondition(this._enableCondition, user));
        };
        Data_BattlerCommand.prototype.setEnabled = function(bool) { this._enabled = bool; };
        Data_BattlerCommand.prototype.isVisible = function(user) {
            return this._visible && (!this._visibleCondition || this.evalCondition(this._visibleCondition, user));
        };
        Data_BattlerCommand.prototype.setVisible = function(bool) { this._visible = bool; };
        Data_BattlerCommand.prototype.evalCondition = function(formula, user) {
            var a = user;
            var s = $gameSwitches;
            var v = $gameVariables;
            try {
                return !!eval(formula);
            } catch (e) {
                console.error('JakeMSG_BattleReorderAndCategorizeCommands isEnabled/isVisible error', e);
                return true;
            }
        };
    }

    Data_BattlerCommand.prototype.hotkey = function() {
        var n = Number(this._hotkey);
        return (n > 0 && isFinite(n)) ? n : 0;
    };

    Data_BattlerCommand.prototype.setHotkey = function(code) {
        var n = Number(code);
        this._hotkey = (n > 0 && isFinite(n)) ? n : 0;
    };

    Data_BattlerCommand.prototype.evalFlagTrait = function(value, user) {
        if (value === true || value === 1) return true;
        if (value == null || value === false || value === 0 || value === '') return false;
        var s0 = String(value).replace(/^\s+|\s+$/g, '');
        if (!s0) return false;
        var lower = s0.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === 'on') return true;
        if (lower === 'false' || lower === 'no' || lower === 'off') return false;
        try {
            return !!this.evalCondition(s0, user);
        } catch (e) {
            return false;
        }
    };

    Data_BattlerCommand.prototype.showSkillIcon = function(user) {
        if (this._showSkillIcon == null || this._showSkillIcon === '') return true;
        return this.evalFlagTrait(this._showSkillIcon, user);
    };

    Data_BattlerCommand.prototype.showSkillCost = function(user) {
        if (this._showSkillCost == null || this._showSkillCost === '') return true;
        return this.evalFlagTrait(this._showSkillCost, user);
    };

    Data_BattlerCommand.prototype.useSkillDisplayName = function() {
        var skill = $dataSkills && $dataSkills[Math.floor(this.ext())];
        if (this._nameWasSet && this._name != null && this._name !== '') {
            return this._name;
        }
        return skill ? skill.name : this._name;
    };

    Data_BattlerCommand.prototype.hasCustomDescription = function() {
        return this._customDescription != null &&
            String(this._customDescription).replace(/^\s+|\s+$/g, '') !== '';
    };

    Data_BattlerCommand.prototype.customDescription = function() {
        return this._customDescription;
    };

    Data_BattlerCommand.prototype.children = function() {
        if (!this._children) this._children = [];
        return this._children;
    };

    Data_BattlerCommand.prototype.setChildren = function(list) {
        this._children = list || [];
    };

    Data_BattlerCommand.prototype.hasChildren = function() {
        return this.children().length > 0;
    };

    Data_BattlerCommand.prototype.visibleChildren = function(user) {
        return this.children().filter(function(cmd) {
            return cmd && cmd.isVisible(user);
        });
    };

    var _DBC_isEnabled = Data_BattlerCommand.prototype.isEnabled;
    Data_BattlerCommand.prototype.isEnabled = function(user) {
        return _DBC_isEnabled.call(this, user);
    };

    //-------------------------------------------------------------------------
    // Standalone HIME_ActorBattleCommands
    //-------------------------------------------------------------------------

    if (!BRCC_HIME_PRESENT) {
        Imported.ActorBattleCommands = 1;

        ABC.defaultBattlerCommands = function(obj) {
            return [
                this.makeCommand('attack'),
                this.makeCommand('skill_list'),
                this.makeCommand('guard'),
                this.makeCommand('item')
            ];
        };

        ABC.battlerCommands = function(obj) {
            if (obj.battlerCommands === undefined) {
                this.loadNotetagBattlerCommands(obj);
            }
            return obj.battlerCommands;
        };

        var TH_GameBattler_initialize = Game_Battler.prototype.initialize;
        Game_Battler.prototype.initialize = function() {
            TH_GameBattler_initialize.call(this);
            this._hiddenSkillTypes = {};
            this._disabledSkillTypes = {};
            this._battleCommands = [];
            this._extraBattleCommands = [];
        };

        Game_Battler.prototype.initBattleCommands = function() {};
        Game_Battler.prototype.battleCommands = function() { return this._battleCommands; };
        Game_Battler.prototype.sortBattleCommands = function() {};

        Game_Battler.prototype.addBattleCommand = function(symbol, ext) {
            var cmd = ABC.makeCommand(symbol, ext);
            this._extraBattleCommands.push(cmd);
            this._battleCommands.push(cmd);
            this.sortBattleCommands();
        };

        Game_Battler.prototype.removeBattleCommand = function(symbol, ext) {
            var cmds = this.battleCommands();
            for (var i = cmds.length - 1; i > -1; i--) {
                var cmd = cmds[i];
                if (cmd.symbol() === symbol && (!ext || cmd.ext() === ext)) {
                    this._battleCommands.splice(i, 1);
                }
            }
        };

        Game_Battler.prototype.setBattleCommandEnabled = function(bool, symbol, ext) {
            this._disabledSkillTypes[ext] = !bool;
            var cmds = this.battleCommands();
            for (var i = 0, len = cmds.length; i < len; i++) {
                var cmd = cmds[i];
                if (cmd.symbol() === symbol && (!ext || cmd.ext() === ext)) {
                    cmd.setEnabled(bool);
                }
            }
        };

        Game_Battler.prototype.setBattleCommandVisible = function(bool, symbol, ext) {
            this._hiddenSkillTypes[ext] = !bool;
            var cmds = this.battleCommands();
            for (var i = 0, len = cmds.length; i < len; i++) {
                var cmd = cmds[i];
                if (cmd.symbol() === symbol && (!ext || cmd.ext() === ext)) {
                    cmd.setVisible(bool);
                }
            }
        };

        Game_Battler.prototype.isSkillTypeHidden = function(id) {
            return !!this._hiddenSkillTypes[id];
        };

        Game_Battler.prototype.isSkillTypeDisabled = function(id) {
            return !!this._disabledSkillTypes[id];
        };

        Game_Battler.prototype.refreshBattleCommands = function() {};

        Game_Actor.prototype.initBattleCommands = function() {
            Game_Battler.prototype.initBattleCommands.call(this);
            var cmds = ABC.battlerCommands(this.actor());
            if (cmds.length === 0) cmds = ABC.battlerCommands(this.currentClass());
            if (cmds.length === 0) cmds = ABC.defaultBattlerCommands(this.actor());
            this._battleCommands = JsonEx.makeDeepCopy(cmds);
        };

        var TH_GameActor_setup = Game_Actor.prototype.setup;
        Game_Actor.prototype.setup = function(actorId) {
            TH_GameActor_setup.call(this, actorId);
            this.initBattleCommands();
        };

        Game_Actor.prototype.refreshBattleCommands = function() {
            this.initBattleCommands();
            this._battleCommands = this._battleCommands.concat(this._extraBattleCommands);
        };

        var TH_GameActor_changeClass = Game_Actor.prototype.changeClass;
        Game_Actor.prototype.changeClass = function(classId, keepExp) {
            TH_GameActor_changeClass.call(this, classId, keepExp);
            this.refreshBattleCommands();
        };

        var TH_WindowActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
        Window_ActorCommand.prototype.makeCommandList = function() {
            if (this._actor) {
                var cmds = this._actor.battleCommands();
                var len = cmds.length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        var cmd = cmds[i];
                        if (this.isVisible(cmd)) this.addBattleCommand(cmd);
                    }
                } else {
                    TH_WindowActorCommand_makeCommandList.call(this);
                }
            }
        };

        Window_ActorCommand.prototype.isVisible = function(cmd) {
            return cmd.isVisible(this._actor);
        };

        Window_ActorCommand.prototype.addBattleCommand_attack = function(cmd) {
            var enabled = cmd.isEnabled(this._actor) && this._actor.canAttack();
            this.addCommand(cmd.name(), cmd.symbol(), enabled);
        };

        Window_ActorCommand.prototype.addBattleCommand_guard = function(cmd) {
            var enabled = cmd.isEnabled(this._actor) && this._actor.canGuard();
            this.addCommand(cmd.name(), cmd.symbol(), enabled);
        };

        Window_ActorCommand.prototype.addBattleCommand_item = function(cmd) {
            this.addCommand(cmd.name(), cmd.symbol(), cmd.isEnabled(this._actor));
        };

        Window_ActorCommand.prototype.addBattleCommand_skill_list = function(cmd) {
            var skillTypes = this._actor.addedSkillTypes();
            skillTypes.sort(function(a, b) { return a - b; });
            skillTypes.forEach(function(stypeId) {
                if (!this._actor.isSkillTypeHidden(stypeId)) {
                    var name = $dataSystem.skillTypes[stypeId];
                    var enabled = !this._actor.isSkillTypeDisabled(stypeId);
                    this.addCommand(name, 'skill_type', enabled, stypeId);
                }
            }, this);
        };

        Window_ActorCommand.prototype.addBattleCommand_skill_type = function(cmd) {
            this.addCommand(cmd.name(), cmd.symbol(), cmd.isEnabled(this._actor), cmd.ext());
        };

        var TH_SceneBattle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
        Scene_Battle.prototype.createActorCommandWindow = function() {
            TH_SceneBattle_createActorCommandWindow.call(this);
            this._actorCommandWindow.setHandler('skill_type', this.commandSkill.bind(this));
        };

        var TH_SceneBattle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
        Scene_Battle.prototype.onEnemyCancel = function() {
            TH_SceneBattle_onEnemyCancel.call(this);
            switch (this._actorCommandWindow.currentSymbol()) {
            case 'skill_type':
                this._skillWindow.show();
                this._skillWindow.activate();
                break;
            }
        };

        var TH_SceneBattle_onActorCancel = Scene_Battle.prototype.onActorCancel;
        Scene_Battle.prototype.onActorCancel = function() {
            TH_SceneBattle_onActorCancel.call(this);
            switch (this._actorCommandWindow.currentSymbol()) {
            case 'skill_type':
                this._skillWindow.show();
                this._skillWindow.activate();
                break;
            }
        };

        hide_actor_command = function(id, symbol, ext) {
            $gameActors.actor(id).setBattleCommandVisible(false, symbol, ext);
        };
        show_actor_command = function(id, symbol, ext) {
            $gameActors.actor(id).setBattleCommandVisible(true, symbol, ext);
        };
        enable_actor_command = function(id, symbol, ext) {
            $gameActors.actor(id).setBattleCommandEnabled(true, symbol, ext);
        };
        disable_actor_command = function(id, symbol, ext) {
            $gameActors.actor(id).setBattleCommandEnabled(false, symbol, ext);
        };
    }

    //-------------------------------------------------------------------------
    // makeCommand (custom symbols allowed)
    //-------------------------------------------------------------------------

    ABC.makeCommand_attack = ABC.makeCommand_attack || function(symbol, ext) {
        return new Data_BattlerCommand(TextManager.attack, symbol);
    };
    ABC.makeCommand_guard = ABC.makeCommand_guard || function(symbol, ext) {
        return new Data_BattlerCommand(TextManager.guard, symbol);
    };
    ABC.makeCommand_item = ABC.makeCommand_item || function(symbol, ext) {
        return new Data_BattlerCommand(TextManager.item, symbol);
    };
    ABC.makeCommand_skill_list = ABC.makeCommand_skill_list || function(symbol, ext) {
        return new Data_BattlerCommand('', symbol);
    };
    ABC.makeCommand_skill_type = ABC.makeCommand_skill_type || function(symbol, ext) {
        var stypeId = Math.floor(ext);
        var name = ($dataSystem && $dataSystem.skillTypes) ? $dataSystem.skillTypes[stypeId] : String(ext);
        return new Data_BattlerCommand(name, symbol, stypeId);
    };
    ABC.makeCommand_skill = ABC.makeCommand_skill || ABC.makeCommand_skill_type;

    ABC.makeCommand_use_skill = function(symbol, ext) {
        ext = Math.floor(ext);
        var skill = $dataSkills && $dataSkills[ext];
        var name = skill ? skill.name : ('Skill ' + ext);
        return new Data_BattlerCommand(name, symbol, ext);
    };

    ABC.makeCommand_change_equip = ABC.makeCommand_change_equip || function(symbol, ext) {
        return new Data_BattlerCommand('Equip', symbol, ext);
    };

    ABC.makeCommand_auto = function(symbol, ext) {
        return new Data_BattlerCommand('Auto', symbol, ext);
    };

    ABC.makeCommand_switch = function(symbol, ext) {
        var name = (typeof Yanfly !== 'undefined' && Yanfly.Param && Yanfly.Param.PartySwitchCmd) ?
            Yanfly.Param.PartySwitchCmd : 'Switch';
        return new Data_BattlerCommand(name, symbol, ext);
    };

    ABC.makeCommand_fight = function(symbol, ext) {
        return new Data_BattlerCommand(TextManager.fight, symbol, ext);
    };
    ABC.makeCommand_mirror_battle_commands = function(symbol, ext) {
        return new Data_BattlerCommand('Battle Commands', symbol, ext);
    };
    ABC.makeCommand_escape = function(symbol, ext) {
        return new Data_BattlerCommand(TextManager.escape, symbol, ext);
    };
    ABC.makeCommand_formation = function(symbol, ext) {
        return new Data_BattlerCommand(TextManager.formation, symbol, ext);
    };
    ABC.makeCommand_status = function(symbol, ext) {
        var name = (typeof Yanfly !== 'undefined' && Yanfly.Param && Yanfly.Param.ParentStatusCmdText) ?
            Yanfly.Param.ParentStatusCmdText : 'Status';
        return new Data_BattlerCommand(name, symbol, ext);
    };
    ABC.makeCommand_allystatus = function(symbol, ext) {
        var name = (typeof Yanfly !== 'undefined' && Yanfly.Param && Yanfly.Param.IBSCmdName) ?
            Yanfly.Param.IBSCmdName : 'Status';
        return new Data_BattlerCommand(name, symbol, ext);
    };
    ABC.makeCommand_enemystatus = function(symbol, ext) {
        var name = (typeof Yanfly !== 'undefined' && Yanfly.Param && Yanfly.Param.EnemyIBSCmdName) ?
            Yanfly.Param.EnemyIBSCmdName : 'Enemy Status';
        return new Data_BattlerCommand(name, symbol, ext);
    };
    ABC.makeCommand_passives = function(symbol, ext) {
        return new Data_BattlerCommand('Passives', symbol, ext);
    };
    ABC.makeCommand_allypassives = function(symbol, ext) {
        return new Data_BattlerCommand('Party Passives', symbol, ext);
    };
    ABC.makeCommand_enemypassives = function(symbol, ext) {
        return new Data_BattlerCommand('Enemy Passives', symbol, ext);
    };
    ABC.makeCommand_fieldeffects = function(symbol, ext) {
        return new Data_BattlerCommand('Field Effects', symbol, ext);
    };

    ABC.makeCommand = function(symbol, ext) {
        symbol = String(symbol == null ? 'custom' : symbol).toLowerCase();
        var methodName = 'makeCommand_' + symbol;
        if (this[methodName]) {
            var cmd = this[methodName](symbol, ext);
            if (!cmd._children) cmd._children = [];
            return cmd;
        }
        var fallback = new Data_BattlerCommand(symbol, symbol, ext);
        fallback._children = [];
        return fallback;
    };

    //-------------------------------------------------------------------------
    // Nested notetag parser
    //-------------------------------------------------------------------------

    $.kindWord = function(kind) {
        if (kind === 'subcommand') return 'subcommand';
        if (kind === 'option') return 'menu[-_ ]option';
        if (kind === 'mapskill') return 'map[-_ ]skill';
        return 'command';
    };

    $.kindTagHeads = function(kind) {
        if (kind === 'mapskill') return ['map[-_ ]skill', 'actor[-_ ]map[-_ ]skill'];
        return ['battle[-_ ]' + this.kindWord(kind)];
    };

    $.matchAt = function(text, i, regex) {
        var slice = text.slice(i);
        var m = slice.match(regex);
        if (!m) return null;
        m.end = i + m[0].length;
        m.bodyStart = i + m[0].length;
        return m;
    };

    $.matchInline = function(text, i, kind) {
        var heads = this.kindTagHeads(kind);
        for (var h = 0; h < heads.length; h++) {
            var m = this.matchAt(text, i, new RegExp(
                '^<' + heads[h] + ':\\s*(\\w+)(?:\\s+([^>\\s]+))?\\s*\\/>', 'i'));
            if (m) return { inline: true, kind: kind, symbol: m[1], ext: m[2], end: m.end };
        }
        return null;
    };

    $.matchOpen = function(text, i, kind) {
        if (this.matchInline(text, i, kind)) return null;
        var heads = this.kindTagHeads(kind);
        for (var h = 0; h < heads.length; h++) {
            var m = this.matchAt(text, i, new RegExp('^<' + heads[h] + '>', 'i'));
            if (m) return { inline: false, kind: kind, end: m.end };
        }
        return null;
    };

    $.matchClose = function(text, i, kind) {
        var heads = this.kindTagHeads(kind);
        for (var h = 0; h < heads.length; h++) {
            var m = this.matchAt(text, i, new RegExp('^<\\/' + heads[h] + '>', 'i'));
            if (m) return { end: m.end };
        }
        return null;
    };

    $.matchAnyOpen = function(text, i, preferredKind) {
        var order;
        if (preferredKind === 'mapskill') order = ['mapskill'];
        else if (preferredKind === 'subcommand') order = ['subcommand', 'command', 'option'];
        else if (preferredKind === 'option') order = ['option', 'command', 'subcommand'];
        else order = ['command', 'subcommand', 'option'];
        for (var n = 0; n < order.length; n++) {
            var inline = this.matchInline(text, i, order[n]);
            if (inline) return inline;
            var open = this.matchOpen(text, i, order[n]);
            if (open) return open;
        }
        return null;
    };

    $.findClose = function(text, start, kind) {
        var depth = 1;
        var i = start;
        while (i < text.length) {
            if (text.charAt(i) !== '<') { i++; continue; }
            var inline = this.matchInline(text, i, kind);
            if (inline) { i = inline.end; continue; }
            var open = this.matchOpen(text, i, kind);
            if (open) { depth++; i = open.end; continue; }
            var close = this.matchClose(text, i, kind);
            if (close) {
                depth--;
                if (depth === 0) return i;
                i = close.end;
                continue;
            }
            i++;
        }
        return -1;
    };

    $.coerceTraitValue = function(val) {
        if (val == null) return val;
        var s = String(val).replace(/^\s+|\s+$/g, '');
        if ((s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') ||
            (s.charAt(0) === "'" && s.charAt(s.length - 1) === "'")) {
            try { return JSON.parse(s.replace(/'/g, '"')); } catch (e) {
                return s.substring(1, s.length - 1);
            }
        }
        if (s !== '' && !isNaN(s) && String(Number(s)) === s) return Number(s);
        return s;
    };

    $.parseTraits = function(text) {
        var data = {};
        var cleaned = String(text || '').replace(/^\s+|\s+$/g, '');
        if (cleaned) {
            try {
                var obj = (new Function('return {' + cleaned + '}'))();
                if (obj && typeof obj === 'object') data = obj;
            } catch (e) {}
        }
        var lines = String(text || '').split(/[\r\n]+/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].replace(/^\s+|\s+$/g, '').replace(/,$/, '');
            if (!line) continue;
            var idx = line.indexOf(':');
            if (idx < 1) continue;
            var key = line.substring(0, idx).replace(/^\s+|\s+$/g, '');
            var val = line.substring(idx + 1).replace(/^\s+|\s+$/g, '').replace(/,$/, '');
            if (!key) continue;
            data[key] = this.coerceTraitValue(val);
        }
        return data;
    };

    $.traitGet = function(traits, names) {
        for (var i = 0; i < names.length; i++) {
            if (traits[names[i]] != null && traits[names[i]] !== '') return traits[names[i]];
            var lower = names[i].toLowerCase();
            for (var k in traits) {
                if (k.toLowerCase() === lower && traits[k] != null && traits[k] !== '') {
                    return traits[k];
                }
            }
        }
        return undefined;
    };

    $.applyTraitsToCommand = function(cmd, traits) {
        var name = this.traitGet(traits, ['name', 'Name']);
        if (name != null && name !== '') {
            cmd.setName(String(name));
            cmd._nameWasSet = true;
        }
        var enabled = this.traitGet(traits, ['isEnabled', 'IsEnabled']);
        if (enabled != null && enabled !== '') cmd._enableCondition = String(enabled);
        var visible = this.traitGet(traits, ['isVisible', 'IsVisible']);
        if (visible != null && visible !== '') cmd._visibleCondition = String(visible);
        var hotkey = this.traitGet(traits, ['hotkey', 'Hotkey']);
        if (hotkey != null && hotkey !== '' && Number(hotkey) > 0) {
            cmd.setHotkey(Number(hotkey));
        }
        var showIcon = this.traitGet(traits, ['showSkillIcon', 'ShowSkillIcon', 'Show Skill Icon']);
        if (showIcon != null && showIcon !== '') cmd._showSkillIcon = showIcon;
        var showCost = this.traitGet(traits, ['showSkillCost', 'ShowSkillCost', 'Show Skill Cost']);
        if (showCost != null && showCost !== '') cmd._showSkillCost = showCost;
        var desc = this.traitGet(traits, ['description', 'Description']);
        if (desc != null && String(desc).replace(/^\s+|\s+$/g, '') !== '') {
            cmd._customDescription = String(desc);
        }
        return cmd;
    };

    $.commandFromInline = function(tag) {
        var symbol = String(tag.symbol || 'custom').toLowerCase();
        var ext = tag.ext;
        var cmd = ABC.makeCommand(symbol, ext);
        cmd._children = cmd._children || [];
        return cmd;
    };

    $.splitBody = function(body, kind) {
        var children = [];
        var traitParts = [];
        var i = 0;
        var last = 0;
        while (i < body.length) {
            if (body.charAt(i) !== '<') { i++; continue; }
            var tag = this.matchAnyOpen(body, i, kind);
            if (!tag) { i++; continue; }
            traitParts.push(body.substring(last, i));
            if (tag.inline) {
                children.push(this.commandFromInline(tag));
                i = tag.end;
            } else {
                var closeAt = this.findClose(body, tag.end, tag.kind);
                if (closeAt < 0) {
                    i = tag.end;
                    last = i;
                    continue;
                }
                var inner = body.substring(tag.end, closeAt);
                children.push(this.commandFromPaired(inner, tag.kind));
                var close = this.matchClose(body, closeAt, tag.kind);
                i = close ? close.end : closeAt;
            }
            last = i;
        }
        traitParts.push(body.substring(last));
        return { children: children, traitsText: traitParts.join('\n') };
    };

    $.commandFromPaired = function(body, kind) {
        var split = this.splitBody(body, kind);
        var traits = this.parseTraits(split.traitsText);
        var symbol = this.traitGet(traits, ['symbol', 'Symbol']);
        symbol = String(symbol == null || symbol === '' ? 'custom' : symbol).toLowerCase();
        var ext = this.traitGet(traits, ['ext', 'Ext']);
        var cmd = ABC.makeCommand(symbol, ext);
        this.applyTraitsToCommand(cmd, traits);
        cmd.setChildren(split.children);
        return cmd;
    };

    $.parseCommandListFromText = function(text, kind) {
        var list = [];
        if (!text) return list;
        var i = 0;
        while (i < text.length) {
            if (text.charAt(i) !== '<') { i++; continue; }
            var tag = this.matchAnyOpen(text, i, kind);
            if (!tag) { i++; continue; }
            if (tag.inline) {
                list.push(this.commandFromInline(tag));
                i = tag.end;
                continue;
            }
            var closeAt = this.findClose(text, tag.end, tag.kind);
            if (closeAt < 0) break;
            var body = text.substring(tag.end, closeAt);
            list.push(this.commandFromPaired(body, tag.kind));
            var close = this.matchClose(text, closeAt, tag.kind);
            i = close ? close.end : closeAt;
        }
        return list;
    };

    ABC.loadNotetagBattlerCommands = function(obj) {
        obj.battlerCommands = $.parseCommandListFromText(obj.note || '', 'command');
    };

    if (!ABC.battlerCommands) {
        ABC.battlerCommands = function(obj) {
            if (obj.battlerCommands === undefined) this.loadNotetagBattlerCommands(obj);
            return obj.battlerCommands;
        };
    }

    if (!ABC.defaultBattlerCommands) {
        ABC.defaultBattlerCommands = function() {
            return [
                this.makeCommand('attack'),
                this.makeCommand('skill_list'),
                this.makeCommand('guard'),
                this.makeCommand('item')
            ];
        };
    }

    //-------------------------------------------------------------------------
    // Plugin parameters
    //-------------------------------------------------------------------------

    $.deepParse = function(value) {
        if (typeof value === 'string') {
            var t = value.replace(/^\s+|\s+$/g, '');
            if ((t.charAt(0) === '{' && t.charAt(t.length - 1) === '}') ||
                (t.charAt(0) === '[' && t.charAt(t.length - 1) === ']')) {
                try { return $.deepParse(JSON.parse(value)); } catch (e) { return value; }
            }
            if ((t.charAt(0) === '"' && t.charAt(t.length - 1) === '"') ||
                t.indexOf('\\n') >= 0) {
                try { return $.deepParse(JSON.parse(value)); } catch (e2) { return value; }
            }
            return value;
        }
        if (Array.isArray(value)) return value.map($.deepParse);
        if (value && typeof value === 'object') {
            var o = {};
            for (var k in value) {
                if (value.hasOwnProperty(k)) o[k] = $.deepParse(value[k]);
            }
            return o;
        }
        return value;
    };

    $.parseParamNestedText = function(text, kind) {
        text = this.deepParse(text);
        if (text == null || text === '' || text === 0) return [];
        var t = this.textFormToNoteText(String(text)).replace(/^\s+|\s+$/g, '');
        if (!t || t.indexOf('<') < 0) return [];
        var cmds = this.parseCommandListFromText(t, kind || 'command');
        if (kind === 'mapskill') {
            if (!cmds.length) cmds = this.parseCommandListFromText(t, 'command');
            if (!cmds.length) cmds = this.parseCommandListFromText(t, 'subcommand');
            if (!cmds.length) cmds = this.parseCommandListFromText(t, 'option');
            return cmds;
        }
        if (!cmds.length && kind !== 'command') cmds = this.parseCommandListFromText(t, 'command');
        if (!cmds.length && kind !== 'subcommand') cmds = this.parseCommandListFromText(t, 'subcommand');
        if (!cmds.length && kind !== 'option') cmds = this.parseCommandListFromText(t, 'option');
        return cmds;
    };

    $.parseParamNested = function(nested, kind) {
        nested = this.deepParse(nested);
        if (nested == null || nested === '' || nested === 0) return [];
        if (typeof nested === 'string') return this.parseParamNestedText(nested, kind);
        if (!Array.isArray(nested)) return [];
        var out = [];
        for (var i = 0; i < nested.length; i++) {
            out.push(this.parseParamCommand(nested[i], kind));
        }
        return out;
    };

    $.parseParamCommand = function(raw, kind) {
        raw = this.deepParse(raw) || {};
        var name = raw.Name || '';
        var symbol = String(raw.Symbol == null || raw.Symbol === '' ? 'custom' : raw.Symbol).toLowerCase();
        var ext = raw.Ext;
        if (ext === '') ext = undefined;
        var cmd = ABC.makeCommand(symbol, ext);
        if (name) {
            cmd.setName(String(name));
            cmd._nameWasSet = true;
        }
        if (raw.IsEnabled) cmd._enableCondition = String(raw.IsEnabled);
        if (raw.IsVisible) cmd._visibleCondition = String(raw.IsVisible);
        if (raw.Hotkey != null && raw.Hotkey !== '' && Number(raw.Hotkey) > 0) {
            cmd.setHotkey(Number(raw.Hotkey));
        }
        if (raw['Show Skill Icon'] != null && raw['Show Skill Icon'] !== '') {
            cmd._showSkillIcon = raw['Show Skill Icon'];
        }
        if (raw['Show Skill Cost'] != null && raw['Show Skill Cost'] !== '') {
            cmd._showSkillCost = raw['Show Skill Cost'];
        }
        if (raw.Description != null && String(raw.Description).replace(/^\s+|\s+$/g, '') !== '') {
            cmd._customDescription = String(raw.Description);
        }
        var kids = this.parseParamNested(raw['Nested Commands'], kind);
        var textKids = this.parseParamNestedText(raw['Nested Commands (Text)'], kind);
        cmd.setChildren(kids.concat(textKids));
        return cmd;
    };

    $.parseIdEntryList = function(raw, commandsKey, kind) {
        var arr = this.deepParse(raw);
        if (!Array.isArray(arr)) return [];
        var out = [];
        for (var i = 0; i < arr.length; i++) {
            var entry = this.deepParse(arr[i]) || {};
            var id = Number(entry.ID || 0);
            if (!id) continue;
            var cmdsRaw = entry[commandsKey];
            var cmds = [];
            if (Array.isArray(this.deepParse(cmdsRaw))) {
                var list = this.deepParse(cmdsRaw);
                for (var j = 0; j < list.length; j++) {
                    cmds.push(this.parseParamCommand(list[j], kind));
                }
            }
            out.push({ id: id, commands: cmds });
        }
        return out;
    };

    $.paramRawValue = function(raw, names) {
        for (var i = 0; i < names.length; i++) {
            var v = raw[names[i]];
            if (v != null && v !== '') return v;
        }
        return '';
    };

    $.loadParameters = function() {
        var raw = PluginManager.parameters('JakeMSG_BattleReorderAndCategorizeCommands');
        this.actorParamMap = {};
        this.skillParamMap = {};
        this.actorAddParamMap = {};
        this.skillAddParamMap = {};
        this.actorMapParamMap = {};
        this.actorMapAddParamMap = {};
        this.partyMenuCommands = null;
        var i, list, n;
        for (i = 1; i <= 10; i++) {
            list = this.parseIdEntryList(this.paramRawValue(raw, [
                '== Actor List ' + i + ' ==',
                '==== Actor List ' + i + ' ===='
            ]), 'Battle Commands', 'command');
            for (n = 0; n < list.length; n++) {
                this.actorParamMap[list[n].id] = list[n].commands;
            }
        }
        for (i = 1; i <= 10; i++) {
            list = this.parseIdEntryList(this.paramRawValue(raw, [
                '== Skill List ' + i + ' ==',
                '==== Skill List ' + i + ' ===='
            ]), 'Battle Subcommands', 'subcommand');
            for (n = 0; n < list.length; n++) {
                this.skillParamMap[list[n].id] = list[n].commands;
            }
        }
        for (i = 1; i <= 10; i++) {
            list = this.parseIdEntryList(raw['== Actor List ' + i + ' (Add) =='] || '',
                'Battle Commands', 'command');
            for (n = 0; n < list.length; n++) {
                this.actorAddParamMap[list[n].id] = list[n].commands;
            }
        }
        for (i = 1; i <= 10; i++) {
            list = this.parseIdEntryList(raw['== Skill List ' + i + ' (Add) =='] || '',
                'Battle Subcommands', 'subcommand');
            for (n = 0; n < list.length; n++) {
                this.skillAddParamMap[list[n].id] = list[n].commands;
            }
        }
        for (i = 1; i <= 10; i++) {
            list = this.parseIdEntryList(this.paramRawValue(raw, [
                '= Actor List ' + i + ' (Map) =',
                '== Actor List ' + i + ' (Map) =='
            ]), 'Map Skills', 'mapskill');
            for (n = 0; n < list.length; n++) {
                this.actorMapParamMap[list[n].id] = list[n].commands;
            }
        }
        for (i = 1; i <= 10; i++) {
            list = this.parseIdEntryList(this.paramRawValue(raw, [
                '= Actor List ' + i + ' (Map) (Add) =',
                '== Actor List ' + i + ' (Map) (Add) =='
            ]), 'Map Skills', 'mapskill');
            for (n = 0; n < list.length; n++) {
                this.actorMapAddParamMap[list[n].id] = list[n].commands;
            }
        }
        var partyRaw = this.paramRawValue(raw, [
            '==== Battle Menu Options ====',
            '======== Battle Menu Options ========'
        ]);
        var partyList = this.deepParse(partyRaw);
        if (Array.isArray(partyList) && partyList.length > 0) {
            this.partyMenuCommands = [];
            for (n = 0; n < partyList.length; n++) {
                this.partyMenuCommands.push(this.parseParamCommand(partyList[n], 'option'));
            }
        } else {
            this.partyMenuCommands = null;
        }
    };

    $.hasPartyMenuOverride = function() {
        if (this.partyMenuCommands && this.partyMenuCommands.length > 0) return true;
        var ops = this.getMutationOps('party', null, false);
        return !!(ops && ops.length);
    };

    $.getActorParamCommands = function(actorId) {
        if (!this.actorParamMap) this.loadParameters();
        if (!this.actorParamMap.hasOwnProperty(actorId)) return null;
        return this.actorParamMap[actorId];
    };

    $.getActorAddCommands = function(actorId) {
        if (!this.actorAddParamMap) this.loadParameters();
        return this.actorAddParamMap[actorId] || [];
    };

    $.hasActorPluginLists = function(actorId) {
        if (this.getActorParamCommands(actorId)) return true;
        return this.getActorAddCommands(actorId).length > 0;
    };

    $.appendActorAddCommands = function(actor) {
        if (!actor) return;
        var add = this.getActorAddCommands(actor.actorId());
        if (!add.length) return;
        actor._battleCommands = (actor._battleCommands || []).concat(JsonEx.makeDeepCopy(add));
    };

    $.getSkillAddCommands = function(skillId) {
        if (!this.skillAddParamMap) this.loadParameters();
        return this.skillAddParamMap[skillId] || [];
    };

    $.getSkillSubcommandBase = function(skill) {
        if (!skill) return [];
        if (!this.skillParamMap) this.loadParameters();
        var cmds;
        if (this.skillParamMap.hasOwnProperty(skill.id)) {
            cmds = JsonEx.makeDeepCopy(this.skillParamMap[skill.id] || []);
        } else {
            if (skill.jakeMSGBattleSubcommands === undefined) {
                skill.jakeMSGBattleSubcommands = this.parseCommandListFromText(skill.note || '', 'subcommand');
            }
            cmds = JsonEx.makeDeepCopy(skill.jakeMSGBattleSubcommands || []);
        }
        var add = this.getSkillAddCommands(skill.id);
        if (add.length) cmds = cmds.concat(JsonEx.makeDeepCopy(add));
        return cmds;
    };

    $.getSkillSubcommands = function(skill) {
        if (!skill) return [];
        var cmds = JsonEx.makeDeepCopy(this.getSkillSubcommandBase(skill));
        this.replayMutations('skill', skill.id, cmds);
        this.reapplySkillSubcommandFlags(skill, cmds);
        return cmds;
    };

    $.skillHasSubcommands = function(skillOrId) {
        var skill = (typeof skillOrId === 'object') ? skillOrId : ($dataSkills && $dataSkills[skillOrId]);
        return this.getSkillSubcommands(skill).length > 0;
    };

    $.getActorMapParamCommands = function(actorId) {
        if (!this.actorMapParamMap) this.loadParameters();
        if (!this.actorMapParamMap.hasOwnProperty(actorId)) return null;
        return this.actorMapParamMap[actorId];
    };

    $.getActorMapAddCommands = function(actorId) {
        if (!this.actorMapAddParamMap) this.loadParameters();
        return this.actorMapAddParamMap[actorId] || [];
    };

    $.getActorMapSkillNoteCommands = function(actor) {
        if (!actor || !actor.actor) return [];
        var obj = actor.actor();
        if (!obj) return [];
        if (obj.jakeMSGMapSkills === undefined) {
            obj.jakeMSGMapSkills = this.parseCommandListFromText(obj.note || '', 'mapskill');
        }
        return obj.jakeMSGMapSkills || [];
    };

    $.hasActorMapSkills = function(actor) {
        if (!actor) return false;
        var id = actor.actorId();
        if (this.getActorMapParamCommands(id)) return true;
        if (this.getActorMapAddCommands(id).length > 0) return true;
        if (this.getActorMapSkillNoteCommands(actor).length > 0) return true;
        var ops = this.getMutationOps('mapskill', id, false);
        return !!(ops && ops.length);
    };

    $.attachSkillSubcommandsForMap = function(cmds, actor) {
        if (!cmds) return;
        for (var i = 0; i < cmds.length; i++) {
            var cmd = cmds[i];
            if (!cmd) continue;
            var kids = this.commandChildren(cmd);
            if (kids.length) {
                this.attachSkillSubcommandsForMap(kids, actor);
            } else if (this.normalizeActorSymbol(cmd.symbol()) === 'use_skill' &&
                    this.skillHasSubcommands(cmd.ext())) {
                var skill = $dataSkills && $dataSkills[Math.floor(cmd.ext())];
                cmd.setChildren(JsonEx.makeDeepCopy(this.getSkillSubcommands(skill)));
                this.attachSkillSubcommandsForMap(this.commandChildren(cmd), actor);
            }
        }
    };

    $.cloneActorBattleCommandsForMap = function(actor) {
        var cmds;
        if (actor && actor.battleCommands && actor.battleCommands().length) {
            cmds = JsonEx.makeDeepCopy(actor.battleCommands());
        } else if (actor) {
            var paramCmds = this.getActorParamCommands(actor.actorId());
            if (paramCmds) {
                cmds = JsonEx.makeDeepCopy(paramCmds);
            } else if (ABC.battlerCommands) {
                var src = ABC.battlerCommands(actor.actor());
                if (!src || src.length === 0) src = ABC.battlerCommands(actor.currentClass());
                if ((!src || src.length === 0) && ABC.defaultBattlerCommands) {
                    src = ABC.defaultBattlerCommands(actor.actor());
                }
                cmds = JsonEx.makeDeepCopy(src || []);
            } else {
                cmds = [];
            }
            var add = this.getActorAddCommands(actor.actorId());
            if (add.length) cmds = cmds.concat(JsonEx.makeDeepCopy(add));
        } else {
            cmds = [];
        }
        this.attachSkillSubcommandsForMap(cmds, actor);
        return cmds;
    };

    $.expandMapSkillMirrors = function(cmds, actor) {
        if (!cmds) return [];
        var out = [];
        for (var i = 0; i < cmds.length; i++) {
            var cmd = cmds[i];
            if (!cmd) continue;
            if (this.normalizeActorSymbol(cmd.symbol()) === 'mirror_battle_commands') {
                var mirrored = this.cloneActorBattleCommandsForMap(actor);
                for (var m = 0; m < mirrored.length; m++) out.push(mirrored[m]);
                continue;
            }
            var kids = this.commandChildren(cmd);
            if (kids.length) cmd.setChildren(this.expandMapSkillMirrors(kids, actor));
            out.push(cmd);
        }
        return out;
    };

    $.reapplyMapSkillFlags = function(actorId, cmds) {
        if (!cmds || !$gameSystem) return;
        var vis = ($gameSystem._jakeMSGMapSkillVis || {})[actorId];
        var en = ($gameSystem._jakeMSGMapSkillEn || {})[actorId];
        if (!vis && !en) return;
        this.applyStoredCommandFlagsToTree(cmds, vis, en);
    };

    $.getActorMapSkillTree = function(actor, expandMirrors) {
        if (!actor) return [];
        var id = actor.actorId();
        var paramCmds = this.getActorMapParamCommands(id);
        var cmds;
        if (paramCmds) {
            cmds = JsonEx.makeDeepCopy(paramCmds);
        } else {
            cmds = JsonEx.makeDeepCopy(this.getActorMapSkillNoteCommands(actor));
        }
        var add = this.getActorMapAddCommands(id);
        if (add.length) cmds = cmds.concat(JsonEx.makeDeepCopy(add));
        this.replayMutations('mapskill', id, cmds);
        this.reapplyMapSkillFlags(id, cmds);
        if (expandMirrors) {
            cmds = this.expandMapSkillMirrors(cmds, actor);
            this.reapplyMapSkillFlags(id, cmds);
        }
        return cmds;
    };

    $.getActorMapSkills = function(actor) {
        return this.getActorMapSkillTree(actor, true);
    };

    $.setMapSkillFlag = function(actorId, kind, bool, symbol, ext) {
        actorId = Math.floor(actorId);
        if ($gameSystem) {
            var bagName = kind === 'visible' ? '_jakeMSGMapSkillVis' : '_jakeMSGMapSkillEn';
            $gameSystem[bagName] = $gameSystem[bagName] || {};
            $gameSystem[bagName][actorId] = $gameSystem[bagName][actorId] || {};
            $gameSystem[bagName][actorId][this.commandFlagKey(symbol, ext)] = !!bool;
        }
    };

    $.getBeforeSubcommandScript = function(skill) {
        if (!skill) return '';
        if (skill.jakeMSGBeforeSubcommandScript === undefined) {
            var scripts = [];
            var re = /<Before\s+Subcommand\s+Menu>([\s\S]*?)<\/Before\s+Subcommand\s+Menu>/gi;
            var m;
            var note = skill.note || '';
            while ((m = re.exec(note))) scripts.push(m[1]);
            skill.jakeMSGBeforeSubcommandScript = scripts.join('\n');
        }
        return skill.jakeMSGBeforeSubcommandScript;
    };

    $.evalBeforeSubcommandMenu = function(user, skill) {
        var code = this.getBeforeSubcommandScript(skill);
        if (!code || !String(code).replace(/\s/g, '')) return;
        try {
            var a = user;
            var actor = user;
            var subject = user;
            var item = skill;
            var s = $gameSwitches;
            var v = $gameVariables;
            eval(code);
        } catch (e) {
            console.error('JakeMSG_BattleReorderAndCategorizeCommands <Before Subcommand Menu> error', e);
        }
    };

    $.evalUser = function() {
        return BattleManager.actor() || ($gameParty && $gameParty.leader());
    };

    //-------------------------------------------------------------------------
    // Symbol helpers
    //-------------------------------------------------------------------------

    $.normalizeActorSymbol = function(symbol) {
        symbol = String(symbol || '').toLowerCase();
        if (symbol === 'skill') return 'skill_type';
        if (symbol === 'bamauto') return 'auto';
        if (symbol === 'partyswitch') return 'switch';
        return symbol;
    };

    $.commandChildren = function(cmd) {
        if (!cmd) return [];
        if (typeof cmd.children === 'function') return cmd.children() || [];
        return cmd._children || [];
    };

    $.commandHotkey = function(cmd) {
        if (!cmd) return 0;
        if (typeof cmd.hotkey === 'function') return cmd.hotkey();
        var n = Number(cmd._hotkey);
        return (n > 0 && isFinite(n)) ? n : 0;
    };

    $.commandExtValue = function(cmd) {
        if (!cmd) return undefined;
        var ext = typeof cmd.ext === 'function' ? cmd.ext() : cmd._ext;
        if (ext && typeof ext === 'object' && typeof ext.ext === 'function') {
            ext = ext.ext();
        }
        return ext;
    };

    $.databaseSkillFromExt = function(ext) {
        var id = Math.floor(ext);
        if (!id || !$dataSkills) return null;
        return $dataSkills[id] || null;
    };

    $.databaseItemFromExt = function(ext) {
        var id = Math.floor(ext);
        if (!id || !$dataItems) return null;
        return $dataItems[id] || null;
    };

    $.skillFromCommand = function(cmd) {
        if (!cmd || this.normalizeActorSymbol(cmd.symbol()) !== 'use_skill') return null;
        return this.databaseSkillFromExt(this.commandExtValue(cmd));
    };

    $.userCanUseSkill = function(user, skill) {
        if (!user || !skill) return false;
        if (typeof user.canUse === 'function' && !user.canUse(skill)) return false;
        if (typeof user.cooldown === 'function' && user.cooldown(skill.id) > 0) return false;
        if (typeof user.warmup === 'function' && user.warmup(skill.id) > 0) return false;
        if (typeof user.isSkillLimitedEmpty === 'function' && user.isSkillLimitedEmpty(skill)) return false;
        try {
            if (typeof Window_SkillList !== 'undefined' && Window_SkillList.prototype.isEnabled) {
                var probe = { _actor: user, _stypeId: skill.stypeId };
                if (!Window_SkillList.prototype.isEnabled.call(probe, skill)) return false;
            }
        } catch (e) {}
        return true;
    };

    $.userCanUseItem = function(user, item) {
        if (!user || !item) return false;
        if (typeof user.canUse === 'function' && !user.canUse(item)) return false;
        try {
            if (typeof Window_ItemList !== 'undefined' && Window_ItemList.prototype.isEnabled) {
                var probe = { _actor: user };
                if (!Window_ItemList.prototype.isEnabled.call(probe, item)) return false;
            }
        } catch (e2) {}
        return true;
    };

    $.sceneMessageIsBusy = function(scene) {
        if ($gameMessage && $gameMessage.isBusy()) return true;
        var win = scene && scene._messageWindow;
        if (!win) return false;
        if (typeof win.isBusy === 'function' && win.isBusy()) return true;
        if (typeof win.isClosing === 'function' && win.isClosing()) return true;
        return false;
    };

    $.commandWindowItemEnabled = function(win, index) {
        if (!win || index == null || index < 0) return false;
        if (typeof win.isCommandEnabled === 'function' && !(win._jakeMSGMapCommands && win._data)) {
            return !!win.isCommandEnabled(index);
        }
        if (win._jakeMSGMapCommands && win._data) {
            return !!(win.isEnabled && win.isEnabled(win._data[index]));
        }
        var item = win._list && win._list[index];
        if (!item) return false;
        if (item.enabled === false) return false;
        return true;
    };

    $.windowCommandEntries = function(win) {
        if (!win) return [];
        if (win._list && win._list.length) return win._list;
        if (win._jakeMSGMapCommands && win._data) {
            var out = [];
            for (var i = 0; i < win._data.length; i++) {
                var cmd = win._data[i];
                if (!cmd || typeof cmd.symbol !== 'function') continue;
                out.push({
                    ext: cmd,
                    enabled: win.isEnabled ? win.isEnabled(cmd) : true,
                    _jakeMSGIndex: i
                });
            }
            return out;
        }
        return [];
    };

    $.tryHotkeyOnCommandWindow = function(win, keyCode, user, context) {
        if (!win || !win.active || !win.visible) return false;
        if (typeof win.processOk !== 'function') return false;
        var entries = this.windowCommandEntries(win);
        if (!entries.length) return false;
        var code = Number(keyCode);
        if (!code) return false;
        for (var i = 0; i < entries.length; i++) {
            var ext = entries[i].ext;
            if (!ext || (typeof ext.hotkey !== 'function' && ext._hotkey == null)) continue;
            if (this.commandHotkey(ext) !== code) continue;
            Input.jakeMSGConsumeInput(code);
            var index = entries[i]._jakeMSGIndex != null ? entries[i]._jakeMSGIndex : i;
            var windowOn = this.commandWindowItemEnabled(win, index);
            var liveOn = windowOn;
            if (ext && typeof ext.symbol === 'function') {
                liveOn = windowOn && this.commandEnabledInContext(ext, user, context || 'actor');
            }
            if (!liveOn) {
                SoundManager.playBuzzer();
                return true;
            }
            win.select(index);
            win.processOk();
            return true;
        }
        return false;
    };

    $.commandExtMatches = function(cmdExt, wantExt) {
        if (wantExt == null || wantExt === '') return true;
        if (cmdExt == null || cmdExt === '') return false;
        if (cmdExt === wantExt) return true;
        if (String(cmdExt) === String(wantExt)) return true;
        var n1 = Number(cmdExt);
        var n2 = Number(wantExt);
        if (!isNaN(n1) && !isNaN(n2) && n1 === n2) return true;
        return false;
    };

    $.commandSymbolMatches = function(cmdSymbol, wantSymbol) {
        return this.normalizeActorSymbol(cmdSymbol) === this.normalizeActorSymbol(wantSymbol);
    };

    $.commandFlagKey = function(symbol, ext) {
        var e = (ext == null || ext === '') ? '' : String(ext);
        return this.normalizeActorSymbol(symbol) + ':' + e;
    };

    $.commandMatchesFlagKey = function(cmd, key) {
        if (!cmd) return false;
        var text = String(key == null ? '' : key);
        var idx = text.indexOf(':');
        var sym = idx < 0 ? text : text.substring(0, idx);
        var ext = idx < 0 ? '' : text.substring(idx + 1);
        if (!this.commandSymbolMatches(cmd.symbol(), sym)) return false;
        if (ext === '') return true;
        return this.commandExtMatches(cmd.ext(), ext);
    };

    $.forEachCommandInTree = function(cmds, callback) {
        if (!cmds) return;
        for (var i = 0; i < cmds.length; i++) {
            var cmd = cmds[i];
            if (!cmd) continue;
            callback(cmd);
            this.forEachCommandInTree(this.commandChildren(cmd), callback);
        }
    };

    $.applyCommandFlagToTree = function(cmds, kind, bool, symbol, ext) {
        var self = this;
        this.forEachCommandInTree(cmds, function(cmd) {
            if (!self.commandSymbolMatches(cmd.symbol(), symbol)) return;
            if (!self.commandExtMatches(cmd.ext(), ext)) return;
            if (kind === 'visible' && cmd.setVisible) cmd.setVisible(bool);
            else if (kind === 'enabled' && cmd.setEnabled) cmd.setEnabled(bool);
        });
    };

    $.applyStoredCommandFlagsToTree = function(cmds, visMap, enMap) {
        var self = this;
        this.forEachCommandInTree(cmds, function(cmd) {
            var key;
            if (visMap) {
                for (key in visMap) {
                    if (visMap.hasOwnProperty(key) && self.commandMatchesFlagKey(cmd, key)) {
                        if (cmd.setVisible) cmd.setVisible(visMap[key]);
                    }
                }
            }
            if (enMap) {
                for (key in enMap) {
                    if (enMap.hasOwnProperty(key) && self.commandMatchesFlagKey(cmd, key)) {
                        if (cmd.setEnabled) cmd.setEnabled(enMap[key]);
                    }
                }
            }
        });
    };

    $.reapplySkillSubcommandFlags = function(skill, cmds) {
        if (!skill || !cmds || !$gameSystem) return;
        var vis = ($gameSystem._jakeMSGSkillSubVis || {})[skill.id];
        var en = ($gameSystem._jakeMSGSkillSubEn || {})[skill.id];
        if (!vis && !en) return;
        this.applyStoredCommandFlagsToTree(cmds, vis, en);
    };

    $.setSkillSubcommandFlag = function(skillId, kind, bool, symbol, ext) {
        skillId = Math.floor(skillId);
        if ($gameSystem) {
            var bagName = kind === 'visible' ? '_jakeMSGSkillSubVis' : '_jakeMSGSkillSubEn';
            $gameSystem[bagName] = $gameSystem[bagName] || {};
            $gameSystem[bagName][skillId] = $gameSystem[bagName][skillId] || {};
            $gameSystem[bagName][skillId][this.commandFlagKey(symbol, ext)] = !!bool;
        }
        var skill = $dataSkills && $dataSkills[skillId];
        if (!skill) return;
        this.applyCommandFlagToTree(this.getSkillSubcommands(skill), kind, bool, symbol, ext);
    };

    $.kindTagName = function(kind) {
        if (kind === 'subcommand') return 'battle subcommand';
        if (kind === 'option') return 'battle menu option';
        if (kind === 'mapskill') return 'map skill';
        return 'battle command';
    };

    $.kindFromScope = function(scope) {
        if (scope === 'skill') return 'subcommand';
        if (scope === 'party') return 'option';
        if (scope === 'mapskill') return 'mapskill';
        return 'command';
    };

    $.isRootSymbol = function(symbol) {
        return symbol == null || String(symbol).replace(/^\s+|\s+$/g, '') === '';
    };

    $.parseSymbolArg = function(symbol) {
        if (this.isRootSymbol(symbol)) return { symbol: '', ext: undefined };
        var s = String(symbol).replace(/^\s+|\s+$/g, '');
        var m = s.match(/^(\S+)\s+(\S+)$/);
        if (m) return { symbol: m[1], ext: m[2] };
        return { symbol: s, ext: undefined };
    };

    $.textFormToNoteText = function(textForm) {
        var s = String(textForm == null ? '' : textForm);
        s = s.replace(/>\s*;?\s*</g, '>\n<');
        var out = '';
        var quote = '';
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            if (quote) {
                out += ch;
                if (ch === '\\' && i + 1 < s.length) {
                    out += s.charAt(++i);
                    continue;
                }
                if (ch === quote) quote = '';
                continue;
            }
            if (ch === '"' || ch === "'") {
                quote = ch;
                out += ch;
                continue;
            }
            out += (ch === ';') ? '\n' : ch;
        }
        return out;
    };

    $.parseTextFormCommands = function(textForm, kind) {
        var text = this.textFormToNoteText(textForm);
        var list = this.parseCommandListFromText(text, kind);
        if (kind === 'mapskill') {
            if (!list.length) list = this.parseCommandListFromText(text, 'command');
            if (!list.length) list = this.parseCommandListFromText(text, 'subcommand');
            if (!list.length) list = this.parseCommandListFromText(text, 'option');
            return list;
        }
        if (!list.length && kind !== 'command') {
            list = this.parseCommandListFromText(text, 'command');
        }
        if (!list.length && kind !== 'subcommand') {
            list = this.parseCommandListFromText(text, 'subcommand');
        }
        if (!list.length && kind !== 'option') {
            list = this.parseCommandListFromText(text, 'option');
        }
        return list;
    };

    $.commandToNoteLines = function(cmd, kind) {
        if (!cmd) return [];
        var tag = this.kindTagName(kind);
        var children = this.commandChildren(cmd);
        var symbol = cmd.symbol ? cmd.symbol() : '';
        var ext = cmd.ext ? cmd.ext() : undefined;
        var hasExtras = !!(cmd._nameWasSet || cmd._enableCondition || cmd._visibleCondition ||
            (cmd.hotkey && cmd.hotkey()) || cmd._showSkillIcon != null || cmd._showSkillCost != null ||
            (cmd.hasCustomDescription && cmd.hasCustomDescription()) || children.length);
        if (!hasExtras) {
            if (ext == null || ext === '') return ['<' + tag + ': ' + symbol + ' />'];
            return ['<' + tag + ': ' + symbol + ' ' + ext + ' />'];
        }
        var lines = ['<' + tag + '>'];
        if (cmd._nameWasSet && cmd.name && cmd.name()) {
            lines.push('name: ' + JSON.stringify(String(cmd.name())));
        }
        lines.push('symbol: ' + JSON.stringify(String(symbol)));
        if (ext != null && ext !== '') lines.push('ext: ' + ext);
        if (cmd._enableCondition) lines.push('isEnabled: ' + JSON.stringify(String(cmd._enableCondition)));
        if (cmd._visibleCondition) lines.push('isVisible: ' + JSON.stringify(String(cmd._visibleCondition)));
        if (cmd.hotkey && cmd.hotkey()) lines.push('hotkey: ' + cmd.hotkey());
        if (cmd._showSkillIcon != null && cmd._showSkillIcon !== '') {
            lines.push('showSkillIcon: ' + (typeof cmd._showSkillIcon === 'string' ?
                JSON.stringify(String(cmd._showSkillIcon)) : cmd._showSkillIcon));
        }
        if (cmd._showSkillCost != null && cmd._showSkillCost !== '') {
            lines.push('showSkillCost: ' + (typeof cmd._showSkillCost === 'string' ?
                JSON.stringify(String(cmd._showSkillCost)) : cmd._showSkillCost));
        }
        if (cmd.hasCustomDescription && cmd.hasCustomDescription()) {
            lines.push('description: ' + JSON.stringify(this.formatDescription(cmd.customDescription())));
        }
        for (var i = 0; i < children.length; i++) {
            var childLines = this.commandToNoteLines(children[i], kind);
            for (var j = 0; j < childLines.length; j++) lines.push(childLines[j]);
        }
        lines.push('</' + tag + '>');
        return lines;
    };

    $.commandToTextForm = function(cmd, kind) {
        return this.commandToNoteLines(cmd, kind).join(';');
    };

    $.findCommandRef = function(cmds, symbol, ext) {
        if (!cmds) return null;
        for (var i = 0; i < cmds.length; i++) {
            var cmd = cmds[i];
            if (!cmd) continue;
            if (this.commandSymbolMatches(cmd.symbol(), symbol) && this.commandExtMatches(cmd.ext(), ext)) {
                return { list: cmds, index: i, cmd: cmd };
            }
            var inner = this.findCommandRef(this.commandChildren(cmd), symbol, ext);
            if (inner) return inner;
        }
        return null;
    };

    $.removeCommandsBySymbol = function(cmds, symbol, ext) {
        if (!cmds) return 0;
        var removed = 0;
        for (var i = cmds.length - 1; i >= 0; i--) {
            removed += this.removeCommandsBySymbol(this.commandChildren(cmds[i]), symbol, ext);
            if (this.commandSymbolMatches(cmds[i].symbol(), symbol) &&
                this.commandExtMatches(cmds[i].ext(), ext)) {
                cmds.splice(i, 1);
                removed++;
            }
        }
        return removed;
    };

    $.ensureCommandChildArray = function(cmd) {
        if (!cmd) return [];
        var kids = this.commandChildren(cmd);
        if (!cmd._children) cmd._children = kids;
        if (typeof cmd.setChildren === 'function') cmd.setChildren(kids);
        return this.commandChildren(cmd);
    };

    $.insertParsedCommands = function(cmds, mode, symbol, ext, parsed) {
        if (!cmds || !parsed || !parsed.length) return false;
        var i;
        if (this.isRootSymbol(symbol)) {
            if (mode === 'addbefore' || mode === 'addinsidebegin') {
                for (i = parsed.length - 1; i >= 0; i--) cmds.unshift(parsed[i]);
            } else {
                for (i = 0; i < parsed.length; i++) cmds.push(parsed[i]);
            }
            return true;
        }
        var ref = this.findCommandRef(cmds, symbol, ext);
        if (!ref) return false;
        if (mode === 'addafter') {
            for (i = parsed.length - 1; i >= 0; i--) ref.list.splice(ref.index + 1, 0, parsed[i]);
            return true;
        }
        if (mode === 'addbefore') {
            for (i = parsed.length - 1; i >= 0; i--) ref.list.splice(ref.index, 0, parsed[i]);
            return true;
        }
        if (mode === 'addinsidebegin' || mode === 'addinsideend') {
            var kids = this.ensureCommandChildArray(ref.cmd);
            if (mode === 'addinsidebegin') {
                for (i = parsed.length - 1; i >= 0; i--) kids.unshift(parsed[i]);
            } else {
                for (i = 0; i < parsed.length; i++) kids.push(parsed[i]);
            }
            if (typeof ref.cmd.setChildren === 'function') ref.cmd.setChildren(kids);
            return true;
        }
        return false;
    };

    $.applyMutationOp = function(cmds, op, kind) {
        if (!op || !cmds) return;
        var parsedSym = this.parseSymbolArg(op.symbol);
        if (op.op === 'remove') {
            this.removeCommandsBySymbol(cmds, parsedSym.symbol, parsedSym.ext);
            return;
        }
        var parsed = this.parseTextFormCommands(op.textForm, kind);
        this.insertParsedCommands(cmds, op.op, parsedSym.symbol, parsedSym.ext, parsed);
    };

    $.getMutationOps = function(scope, id, create) {
        if (!$gameSystem) return create ? [] : null;
        var root = $gameSystem._jakeMSGCmdMutations;
        if (!root) {
            if (!create) return null;
            root = $gameSystem._jakeMSGCmdMutations = { actor: {}, skill: {}, party: [] };
        }
        if (scope === 'party') {
            if (!Array.isArray(root.party)) {
                if (!create) return null;
                root.party = [];
            }
            return root.party;
        }
        if (!root[scope]) {
            if (!create) return null;
            root[scope] = {};
        }
        var key = String(id);
        if (!root[scope][key]) {
            if (!create) return null;
            root[scope][key] = [];
        }
        return root[scope][key];
    };

    $.replayMutations = function(scope, id, cmds) {
        var ops = this.getMutationOps(scope, id, false);
        if (!ops || !ops.length) return;
        var kind = this.kindFromScope(scope);
        for (var i = 0; i < ops.length; i++) {
            this.applyMutationOp(cmds, ops[i], kind);
        }
    };

    $.pushMutation = function(scope, id, op) {
        if (!$gameSystem) return;
        var bag = this.getMutationOps(scope, id, true);
        if (!bag) return;
        bag.push(op);
    };

    $.rebuildActorCommandList = function(actor) {
        if (!actor) return;
        var paramCmds = this.getActorParamCommands(actor.actorId());
        if (paramCmds) {
            actor._battleCommands = JsonEx.makeDeepCopy(paramCmds);
        } else if (ABC.battlerCommands) {
            var cmds = ABC.battlerCommands(actor.actor());
            if (!cmds || cmds.length === 0) cmds = ABC.battlerCommands(actor.currentClass());
            if ((!cmds || cmds.length === 0) && ABC.defaultBattlerCommands) {
                cmds = ABC.defaultBattlerCommands(actor.actor());
            }
            actor._battleCommands = JsonEx.makeDeepCopy(cmds || []);
        }
        this.appendActorAddCommands(actor);
        if (actor._extraBattleCommands && actor._extraBattleCommands.length) {
            actor._battleCommands = (actor._battleCommands || []).concat(actor._extraBattleCommands);
        }
        this.replayMutations('actor', actor.actorId(), actor._battleCommands);
        if (actor.jakeMSGReapplyCommandFlags) actor.jakeMSGReapplyCommandFlags();
    };

    $.defaultPartyMenuCommands = function() {
        return [ABC.makeCommand('fight'), ABC.makeCommand('escape')];
    };

    $.getPartyMenuCommands = function() {
        if (!this.skillParamMap) this.loadParameters();
        var base;
        if (this.partyMenuCommands && this.partyMenuCommands.length > 0) {
            base = JsonEx.makeDeepCopy(this.partyMenuCommands);
        } else {
            base = this.defaultPartyMenuCommands();
        }
        this.replayMutations('party', null, base);
        if ($gameSystem) {
            this.applyStoredCommandFlagsToTree(base, $gameSystem._jakeMSGPartyCmdVis, $gameSystem._jakeMSGPartyCmdEn);
        }
        return base;
    };

    $.setPartyMenuFlag = function(kind, bool, symbol, ext) {
        if (!$gameSystem) return;
        var bagName = kind === 'visible' ? '_jakeMSGPartyCmdVis' : '_jakeMSGPartyCmdEn';
        $gameSystem[bagName] = $gameSystem[bagName] || {};
        $gameSystem[bagName][this.commandFlagKey(symbol, ext)] = !!bool;
        var native = this.partyNativeSymbol(symbol);
        if (native && this.normalizeActorSymbol(native) !== this.normalizeActorSymbol(symbol)) {
            $gameSystem[bagName][this.commandFlagKey(native, ext)] = !!bool;
        }
        this.refreshOpenPartyCommandWindow();
    };

    $.hasPartyMenuFlags = function() {
        if (!$gameSystem) return false;
        var vis = $gameSystem._jakeMSGPartyCmdVis;
        var en = $gameSystem._jakeMSGPartyCmdEn;
        var key;
        if (vis) {
            for (key in vis) {
                if (vis.hasOwnProperty(key)) return true;
            }
        }
        if (en) {
            for (key in en) {
                if (en.hasOwnProperty(key)) return true;
            }
        }
        return false;
    };

    $.applyPartyFlagsToWindowList = function(list) {
        if (!list || !$gameSystem) return list;
        var vis = $gameSystem._jakeMSGPartyCmdVis;
        var en = $gameSystem._jakeMSGPartyCmdEn;
        if (!vis && !en) return list;
        var self = this;
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var hidden = false;
            var key;
            if (vis) {
                for (key in vis) {
                    if (vis.hasOwnProperty(key) && vis[key] === false &&
                        self.windowItemMatchesPartyFlag(item, key)) {
                        hidden = true;
                        break;
                    }
                }
            }
            if (hidden) continue;
            if (en) {
                for (key in en) {
                    if (en.hasOwnProperty(key) && self.windowItemMatchesPartyFlag(item, key)) {
                        item.enabled = !!en[key];
                    }
                }
            }
            out.push(item);
        }
        return out;
    };

    $.refreshOpenPartyCommandWindow = function() {
        if (this._refreshingPartyWindow) return;
        var scene = SceneManager && SceneManager._scene;
        if (!scene || !scene._partyCommandWindow) return;
        var win = scene._partyCommandWindow;
        if (!(win.active || win.visible)) return;
        this._refreshingPartyWindow = true;
        try {
            win.setup();
        } finally {
            this._refreshingPartyWindow = false;
        }
    };

    $.refreshOpenActorCommandWindow = function(actor) {
        if (this._refreshingActorWindow) return;
        var scene = SceneManager && SceneManager._scene;
        if (!scene || !scene._actorCommandWindow) return;
        var win = scene._actorCommandWindow;
        if (!win._actor) return;
        if (actor && win._actor !== actor) return;
        this._refreshingActorWindow = true;
        try {
            win.setup(win._actor);
        } finally {
            this._refreshingActorWindow = false;
        }
    };

    $.windowItemMatchesPartyFlag = function(item, key) {
        if (!item) return false;
        var self = this;
        var fake = {
            symbol: function() { return item.symbol; },
            ext: function() { return item.ext; }
        };
        if (this.commandMatchesFlagKey(fake, key)) return true;
        var k;
        for (k in this.PARTY_SYMBOLS) {
            if (this.PARTY_SYMBOLS[k] === item.symbol) {
                fake.symbol = function() { return k; };
                if (self.commandMatchesFlagKey(fake, key)) return true;
            }
        }
        return false;
    };

    $.normalizeAddArgs = function(scope, a, b, c) {
        var id = null;
        var symbol = '';
        var textForm = '';
        if (scope === 'party') {
            if (c != null) {
                symbol = a;
                textForm = b;
            } else if (b != null) {
                if (this.isRootSymbol(a) || (typeof a === 'string' && a.indexOf('<') < 0)) {
                    symbol = a;
                    textForm = b;
                } else {
                    symbol = '';
                    textForm = a;
                }
            } else {
                symbol = '';
                textForm = a;
            }
        } else {
            id = a;
            if (c != null) {
                symbol = b;
                textForm = c;
            } else {
                symbol = '';
                textForm = b;
            }
        }
        return { id: id, symbol: symbol, textForm: textForm };
    };

    $.runAddMutation = function(scope, mode, a, b, c) {
        var args = this.normalizeAddArgs(scope, a, b, c);
        this.pushMutation(scope, args.id, { op: mode, symbol: args.symbol, textForm: args.textForm });
        this.afterMutation(scope, args.id);
    };

    $.runRemoveMutation = function(scope, id, symbol) {
        this.pushMutation(scope, id, { op: 'remove', symbol: symbol });
        this.afterMutation(scope, id);
    };

    $.afterMutation = function(scope, id) {
        if (scope === 'actor') {
            var actor = $gameActors && $gameActors.actor(id);
            if (actor) {
                this.rebuildActorCommandList(actor);
                this.refreshOpenActorCommandWindow(actor);
            }
            return;
        }
        if (scope === 'party') this.refreshOpenPartyCommandWindow();
    };

    $.showCommandInText = function(scope, id, symbol, ext) {
        var kind = this.kindFromScope(scope);
        var cmds;
        if (scope === 'actor') {
            var actor = $gameActors && $gameActors.actor(id);
            cmds = actor ? (actor.battleCommands() || []) : [];
        } else if (scope === 'skill') {
            cmds = this.getSkillSubcommands($dataSkills && $dataSkills[id]);
        } else if (scope === 'mapskill') {
            var mapActor = $gameActors && $gameActors.actor(id);
            cmds = mapActor ? this.getActorMapSkillTree(mapActor, false) : [];
        } else {
            cmds = this.getPartyMenuCommands() || [];
        }
        if (this.isRootSymbol(symbol)) {
            var parts = [];
            for (var i = 0; i < cmds.length; i++) parts.push(this.commandToTextForm(cmds[i], kind));
            return parts.join(';');
        }
        var ref = this.findCommandRef(cmds, symbol, ext);
        return ref ? this.commandToTextForm(ref.cmd, kind) : '';
    };

    $.printCommandInText = function(scope, id, symbol, ext) {
        console.log(this.showCommandInText(scope, id, symbol, ext));
    };

    $.partyNativeSymbol = function(symbol) {
        symbol = String(symbol || '').toLowerCase();
        return this.PARTY_SYMBOLS[symbol] || symbol;
    };

    $.isKnownActionSymbol = function(symbol) {
        symbol = this.normalizeActorSymbol(symbol);
        var known = {
            attack: 1, guard: 1, item: 1, skill_type: 1, skill_list: 1,
            use_skill: 1, change_equip: 1, auto: 1, switch: 1,
            mirror_battle_commands: 1,
            fight: 1, escape: 1, formation: 1, status: 1, allystatus: 1,
            enemystatus: 1, passives: 1, allypassives: 1, enemypassives: 1,
            fieldeffects: 1
        };
        return !!known[symbol];
    };

    $.partySymbolAvailable = function(symbol) {
        symbol = String(symbol || '').toLowerCase();
        switch (symbol) {
        case 'fight':
        case 'escape':
            return true;
        case 'status':
            return !!(Imported.YEP_X_InBattleStatus && Imported.JakeMSG_YEP_X_InBattleStatus_Additions &&
                typeof Scene_Battle.prototype.commandStatusCommandGroup === 'function');
        case 'allystatus':
            return !!(Imported.YEP_X_InBattleStatus && typeof Scene_Battle.prototype.commandInBattleStatus === 'function');
        case 'enemystatus':
            return !!(Imported.JakeMSG_YEP_X_InBattleStatus_Additions &&
                typeof Scene_Battle.prototype.commandEnemyInBattleStatus === 'function');
        case 'auto':
            return !!(Imported.JakeMSG_BattleAutoModes && typeof BAM !== 'undefined' &&
                BAM.isTeamWideAvailable && BAM.isTeamWideAvailable());
        case 'passives':
            return !!(Imported.JakeMSG_PassivesForAll &&
                typeof Scene_Battle.prototype.commandJakeMSGPassivesCommandGroup === 'function');
        case 'allypassives':
            return !!(Imported.JakeMSG_PassivesForAll &&
                typeof Scene_Battle.prototype.commandJakeMSGPartyPassives === 'function');
        case 'enemypassives':
            return !!(Imported.JakeMSG_PassivesForAll &&
                typeof Scene_Battle.prototype.commandJakeMSGEnemyPassives === 'function');
        case 'fieldeffects':
            return !!(typeof Scene_Battle.prototype.commandFieldEffectsStatus === 'function');
        case 'formation':
            return !!(Imported.YEP_PartySystem && typeof Scene_Battle.prototype.partyCommandFormation === 'function');
        default:
            return false;
        }
    };

    $.actorSymbolAvailable = function(symbol, actor) {
        symbol = this.normalizeActorSymbol(symbol);
        switch (symbol) {
        case 'auto':
            return !!(Imported.JakeMSG_BattleAutoModes && typeof BAM !== 'undefined' &&
                BAM.isIndividualAvailable && BAM.isIndividualAvailable(actor));
        case 'switch':
            return !!(Imported.YEP_X_ActorPartySwitch && $gameSystem &&
                $gameSystem.isShowActorPartySwitch && $gameSystem.isShowActorPartySwitch());
        case 'change_equip':
            return !!(actor && actor.canBattleEquipChange);
        case 'use_skill':
        case 'attack':
        case 'guard':
        case 'item':
        case 'skill_type':
        case 'skill_list':
            return true;
        default:
            return this.isKnownActionSymbol(symbol);
        }
    };

    $.commandEnabledInContext = function(cmd, user, context) {
        if (!cmd || !cmd.isEnabled(user)) return false;
        var symbol = this.normalizeActorSymbol(cmd.symbol());
        if (context === 'party') {
            if (symbol === 'escape') return BattleManager.canEscape();
            if (symbol === 'formation' && $gameSystem && $gameSystem.isBattleFormationEnabled) {
                return $gameSystem.isBattleFormationEnabled();
            }
        }
        if (context === 'map') {
            if (symbol === 'use_skill') {
                return this.userCanUseSkill(user, this.skillFromCommand(cmd));
            }
            if (symbol === 'attack' || symbol === 'guard' || symbol === 'auto' ||
                    symbol === 'switch' || symbol === 'mirror_battle_commands') {
                return cmd.visibleChildren(user).length > 0;
            }
            if (symbol === 'item') {
                var mapItem = this.databaseItemFromExt(this.commandExtValue(cmd));
                if (mapItem) return this.userCanUseItem(user, mapItem);
                return true;
            }
            if (symbol === 'skill_type') {
                var mapStypeId = Math.floor(this.commandExtValue(cmd));
                if (user && user.isSkillTypeDisabled && user.isSkillTypeDisabled(mapStypeId)) return false;
                if (user && user.isSkillTypeSealed && user.isSkillTypeSealed(mapStypeId)) return false;
                return true;
            }
            return true;
        }
        if (symbol === 'attack') return !!(user && user.canAttack());
        if (symbol === 'guard') return !!(user && user.canGuard());
        if (symbol === 'use_skill') {
            return this.userCanUseSkill(user, this.skillFromCommand(cmd));
        }
        if (symbol === 'item') {
            var item = this.databaseItemFromExt(this.commandExtValue(cmd));
            if (item) return this.userCanUseItem(user, item);
            return true;
        }
        if (symbol === 'skill_type') {
            var stypeId = Math.floor(this.commandExtValue(cmd));
            if (user && user.isSkillTypeDisabled && user.isSkillTypeDisabled(stypeId)) return false;
            if (user && user.isSkillTypeSealed && user.isSkillTypeSealed(stypeId)) return false;
            return true;
        }
        if (symbol === 'change_equip') {
            return !user || !user.canBattleEquipChange || user.canBattleEquipChange();
        }
        if (symbol === 'auto') {
            return !Imported.JakeMSG_BattleAutoModes || !BAM || !BAM.isIndividualAvailable ||
                BAM.isIndividualAvailable(user);
        }
        if (symbol === 'switch') {
            if (!Imported.YEP_X_ActorPartySwitch) return true;
            if ($gameSystem && $gameSystem.isActorPartySwitchEnabled && !$gameSystem.isActorPartySwitchEnabled()) {
                return false;
            }
            if (user && user._locked) return false;
            if (user && user._required) return false;
            if (user && user.getPartySwitchCooldown && user.getPartySwitchCooldown() > 0) return false;
            return true;
        }
        return true;
    };

    $.effectHasAction = function(effect) {
        if (!effect) return false;
        if (effect.type === 'skill' && effect.skill) return true;
        if (effect.type !== 'command' || !effect.cmd) return false;
        var symbol = this.normalizeActorSymbol(effect.cmd.symbol());
        return symbol === 'attack' || symbol === 'guard' || symbol === 'use_skill' || symbol === 'item';
    };

    $.effectIsMenu = function(cmd, user) {
        if (!cmd) return false;
        if (cmd.visibleChildren(user).length > 0) return true;
        var symbol = this.normalizeActorSymbol(cmd.symbol());
        if (symbol === 'skill_type' || symbol === 'skill_list' || symbol === 'item') return true;
        if (symbol === 'use_skill' && this.skillHasSubcommands(cmd.ext())) return true;
        return false;
    };

    //-------------------------------------------------------------------------
    // Game_Actor: params overwrite + flag persistence
    //-------------------------------------------------------------------------

    var _GB_setVisible = Game_Battler.prototype.setBattleCommandVisible;
    Game_Battler.prototype.setBattleCommandVisible = function(bool, symbol, ext) {
        _GB_setVisible.call(this, bool, symbol, ext);
        this._jakeMSGCmdVis = this._jakeMSGCmdVis || {};
        this._jakeMSGCmdVis[$.commandFlagKey(symbol, ext)] = bool;
        $.applyCommandFlagToTree(this.battleCommands(), 'visible', bool, symbol, ext);
    };

    var _GB_setEnabled = Game_Battler.prototype.setBattleCommandEnabled;
    Game_Battler.prototype.setBattleCommandEnabled = function(bool, symbol, ext) {
        _GB_setEnabled.call(this, bool, symbol, ext);
        this._jakeMSGCmdEn = this._jakeMSGCmdEn || {};
        this._jakeMSGCmdEn[$.commandFlagKey(symbol, ext)] = bool;
        $.applyCommandFlagToTree(this.battleCommands(), 'enabled', bool, symbol, ext);
    };

    Game_Battler.prototype.jakeMSGReapplyCommandFlags = function() {
        $.applyStoredCommandFlagsToTree(this.battleCommands(), this._jakeMSGCmdVis, this._jakeMSGCmdEn);
    };

    hide_skill_subcommand = function(id, symbol, ext) {
        $.setSkillSubcommandFlag(id, 'visible', false, symbol, ext);
    };
    show_skill_subcommand = function(id, symbol, ext) {
        $.setSkillSubcommandFlag(id, 'visible', true, symbol, ext);
    };
    enable_skill_subcommand = function(id, symbol, ext) {
        $.setSkillSubcommandFlag(id, 'enabled', true, symbol, ext);
    };
    disable_skill_subcommand = function(id, symbol, ext) {
        $.setSkillSubcommandFlag(id, 'enabled', false, symbol, ext);
    };

    hide_battlemenu_option = function(symbol, ext) {
        $.setPartyMenuFlag('visible', false, symbol, ext);
    };
    show_battlemenu_option = function(symbol, ext) {
        $.setPartyMenuFlag('visible', true, symbol, ext);
    };
    enable_battlemenu_option = function(symbol, ext) {
        $.setPartyMenuFlag('enabled', true, symbol, ext);
    };
    disable_battlemenu_option = function(symbol, ext) {
        $.setPartyMenuFlag('enabled', false, symbol, ext);
    };

    addafter_actor_command = function(id, symbol, textForm) {
        $.runAddMutation('actor', 'addafter', id, symbol, textForm);
    };
    addbefore_actor_command = function(id, symbol, textForm) {
        $.runAddMutation('actor', 'addbefore', id, symbol, textForm);
    };
    addinsidebegin_actor_command = function(id, symbol, textForm) {
        $.runAddMutation('actor', 'addinsidebegin', id, symbol, textForm);
    };
    addinsideend_actor_command = function(id, symbol, textForm) {
        $.runAddMutation('actor', 'addinsideend', id, symbol, textForm);
    };
    remove_actor_command = function(id, symbol) {
        $.runRemoveMutation('actor', id, symbol);
    };
    showintext_actor_command = function(id, symbol, ext) {
        return $.showCommandInText('actor', id, symbol, ext);
    };
    printtoconsole_actor_command = function(id, symbol, ext) {
        $.printCommandInText('actor', id, symbol, ext);
    };

    hide_actor_mapskill = function(id, symbol, ext) {
        $.setMapSkillFlag(id, 'visible', false, symbol, ext);
    };
    show_actor_mapskill = function(id, symbol, ext) {
        $.setMapSkillFlag(id, 'visible', true, symbol, ext);
    };
    enable_actor_mapskill = function(id, symbol, ext) {
        $.setMapSkillFlag(id, 'enabled', true, symbol, ext);
    };
    disable_actor_mapskill = function(id, symbol, ext) {
        $.setMapSkillFlag(id, 'enabled', false, symbol, ext);
    };
    addafter_actor_mapskill = function(id, symbol, textForm) {
        $.runAddMutation('mapskill', 'addafter', id, symbol, textForm);
    };
    addbefore_actor_mapskill = function(id, symbol, textForm) {
        $.runAddMutation('mapskill', 'addbefore', id, symbol, textForm);
    };
    addinsidebegin_actor_mapskill = function(id, symbol, textForm) {
        $.runAddMutation('mapskill', 'addinsidebegin', id, symbol, textForm);
    };
    addinsideend_actor_mapskill = function(id, symbol, textForm) {
        $.runAddMutation('mapskill', 'addinsideend', id, symbol, textForm);
    };
    remove_actor_mapskill = function(id, symbol) {
        $.runRemoveMutation('mapskill', id, symbol);
    };
    showintext_actor_mapskill = function(id, symbol, ext) {
        return $.showCommandInText('mapskill', id, symbol, ext);
    };
    printtoconsole_actor_mapskill = function(id, symbol, ext) {
        $.printCommandInText('mapskill', id, symbol, ext);
    };

    addafter_skill_subcommand = function(id, symbol, textForm) {
        $.runAddMutation('skill', 'addafter', id, symbol, textForm);
    };
    addbefore_skill_subcommand = function(id, symbol, textForm) {
        $.runAddMutation('skill', 'addbefore', id, symbol, textForm);
    };
    addinsidebegin_skill_subcommand = function(id, symbol, textForm) {
        $.runAddMutation('skill', 'addinsidebegin', id, symbol, textForm);
    };
    addinsideend_skill_subcommand = function(id, symbol, textForm) {
        $.runAddMutation('skill', 'addinsideend', id, symbol, textForm);
    };
    remove_skill_subcommand = function(id, symbol) {
        $.runRemoveMutation('skill', id, symbol);
    };
    showintext_skill_subcommand = function(id, symbol, ext) {
        return $.showCommandInText('skill', id, symbol, ext);
    };
    printtoconsole_skill_subcommand = function(id, symbol, ext) {
        $.printCommandInText('skill', id, symbol, ext);
    };

    addafter_battlemenu_option = function(symbol, textForm) {
        $.runAddMutation('party', 'addafter', symbol, textForm);
    };
    addbefore_battlemenu_option = function(symbol, textForm) {
        $.runAddMutation('party', 'addbefore', symbol, textForm);
    };
    addinsidebegin_battlemenu_option = function(symbol, textForm) {
        $.runAddMutation('party', 'addinsidebegin', symbol, textForm);
    };
    addinsideend_battlemenu_option = function(symbol, textForm) {
        $.runAddMutation('party', 'addinsideend', symbol, textForm);
    };
    remove_battlemenu_option = function(symbol) {
        $.runRemoveMutation('party', null, symbol);
    };
    showintext_battlemenu_option = function(symbol, ext) {
        return $.showCommandInText('party', null, symbol, ext);
    };
    printtoconsole_battlemenu_option = function(symbol, ext) {
        $.printCommandInText('party', null, symbol, ext);
    };

    var _GA_initBattleCommands = Game_Actor.prototype.initBattleCommands;
    Game_Actor.prototype.initBattleCommands = function() {
        var paramCmds = $.getActorParamCommands(this.actorId());
        if (paramCmds) {
            Game_Battler.prototype.initBattleCommands.call(this);
            this._battleCommands = JsonEx.makeDeepCopy(paramCmds);
        } else {
            _GA_initBattleCommands.call(this);
        }
        $.appendActorAddCommands(this);
    };

    var _GA_refreshBattleCommands = Game_Actor.prototype.refreshBattleCommands;
    Game_Actor.prototype.refreshBattleCommands = function() {
        _GA_refreshBattleCommands.call(this);
        $.replayMutations('actor', this.actorId(), this._battleCommands);
        this.jakeMSGReapplyCommandFlags();
    };

    var _GA_setup_brcc = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _GA_setup_brcc.call(this, actorId);
        $.replayMutations('actor', this.actorId(), this._battleCommands);
        if (this.jakeMSGReapplyCommandFlags) this.jakeMSGReapplyCommandFlags();
    };

    Game_Actor.prototype.jakeMSGApplyParamCommands = function() {
        if ($.hasActorPluginLists(this.actorId())) {
            $.rebuildActorCommandList(this);
            return;
        }
        this.jakeMSGReapplyCommandFlags();
    };

    Game_Battler.prototype.jakeMSGFlushExtraActions = function() {
        var extras = this._jakeMSGExtraActions;
        if (!extras || !extras.length) return;
        this._jakeMSGExtraActions = [];
        var idx = this._actionInputIndex || 0;
        for (var i = 0; i < extras.length; i++) {
            this._actions.splice(idx + 1 + i, 0, extras[i]);
        }
        this._actionInputIndex = idx + extras.length;
    };

    var _GA_selectNextCommand = Game_Actor.prototype.selectNextCommand;
    Game_Actor.prototype.selectNextCommand = function() {
        this.jakeMSGFlushExtraActions();
        return _GA_selectNextCommand.call(this);
    };

    $.refreshAllActorsFromParams = function() {
        this.loadParameters();
        if (!$gameActors || !$gameActors._data) return;
        $gameActors._data.forEach(function(actor) {
            if (actor) actor.jakeMSGApplyParamCommands();
        });
    };

    var _DM_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DM_isDatabaseLoaded.call(this)) return false;
        if (!$._dbReady) {
            $._dbReady = true;
            $.loadParameters();
        }
        return true;
    };

    var _DM_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DM_extractSaveContents.call(this, contents);
        $.refreshAllActorsFromParams();
    };

    var _DM_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DM_createGameObjects.call(this);
        $.loadParameters();
    };

    //-------------------------------------------------------------------------
    // Standalone use_skill / change_equip window pieces
    //-------------------------------------------------------------------------

    Window_ActorCommand.prototype.addBattleCommand_use_skill = function(cmd) {
        var skill = $dataSkills[cmd.ext()];
        var enabled = $.commandEnabledInContext(cmd, this._actor, 'actor');
        var name = cmd.useSkillDisplayName ? cmd.useSkillDisplayName() : cmd.name();
        this.addCommand(name, cmd.symbol(), enabled, cmd);
    };

    Window_ActorCommand.prototype.addBattleCommand_change_equip = function(cmd) {
        var can = !this._actor.canBattleEquipChange || this._actor.canBattleEquipChange();
        var enabled = cmd.isEnabled(this._actor) && can;
        this.addCommand(cmd.name(), cmd.symbol(), enabled, cmd.ext());
    };

    Window_ActorCommand.prototype.addBattleCommand_auto = function(cmd) {
        var enabled = $.commandEnabledInContext(cmd, this._actor, 'actor');
        this.addCommand(cmd.name(), 'auto', enabled, cmd.ext());
    };

    Window_ActorCommand.prototype.addBattleCommand_switch = function(cmd) {
        var enabled = $.commandEnabledInContext(cmd, this._actor, 'actor');
        this.addCommand(cmd.name(), 'partyswitch', enabled, cmd.ext());
    };

    Window_ActorCommand.prototype.addBattleCommand_skill_type = function(cmd) {
        var enabled = $.commandEnabledInContext(cmd, this._actor, 'actor');
        this.addCommand(cmd.name(), cmd.symbol(), enabled, cmd);
    };

    Window_ActorCommand.prototype.addBattleCommand_skill_list = function(cmd) {
        var actor = this._actor;
        if (!actor) return;
        var skillTypes = actor.addedSkillTypes();
        skillTypes.sort(function(a, b) { return a - b; });
        skillTypes.forEach(function(stypeId) {
            if (actor.isSkillTypeHidden && actor.isSkillTypeHidden(stypeId)) return;
            var name = $dataSystem.skillTypes[stypeId];
            var stCmd = ABC.makeCommand('skill_type', stypeId);
            stCmd.setName(name);
            this.addCommand(name, 'skill_type', $.commandEnabledInContext(stCmd, actor, 'actor'), stCmd);
        }, this);
    };

    if (!Imported.BattleCommandUseSkill) {
        Imported.BattleCommandUseSkill = 1;
    }

    Scene_Battle.prototype.commandUseSkill = function() {
        var ext = this._jakeMSGPendingExt != null ? this._jakeMSGPendingExt : this._actorCommandWindow.currentExt();
        this._jakeMSGPendingExt = null;
        if (ext && typeof ext === 'object' && typeof ext.ext === 'function') ext = ext.ext();
        var skill = $dataSkills[Math.floor(ext)];
        var user = BattleManager.actor() || $.evalUser();
        if (!skill || !$.userCanUseSkill(user, skill)) {
            SoundManager.playBuzzer();
            this.jakeMSGReactivateCurrent();
            return;
        }
        if ($.skillHasSubcommands(skill)) {
            this.jakeMSGOpenSkillSubmenu(skill);
            return;
        }
        var action = BattleManager.inputtingAction();
        if (!action) {
            this.jakeMSGReactivateCurrent();
            return;
        }
        action.setSkill(skill.id);
        user.setLastBattleSkill(skill);
        this.onSelectAction();
    };

    //-------------------------------------------------------------------------
    // Window_ActorCommand: nested parents + custom symbols
    //-------------------------------------------------------------------------

    Window_ActorCommand.prototype.addBattleCommand = function(cmd) {
        if (!this._actor || !cmd) return;
        var children = cmd.visibleChildren(this._actor);
        if (children.length > 0) {
            var enabled = $.commandEnabledInContext(cmd, this._actor, 'actor');
            this.addCommand($.commandDisplayName(cmd), 'jakeMSG_nested', enabled, cmd);
            return;
        }
        var symbol = $.normalizeActorSymbol(cmd.symbol());
        if (symbol === 'use_skill' && $.skillHasSubcommands(cmd.ext())) {
            var skill = $dataSkills[Math.floor(cmd.ext())];
            var ok = $.commandEnabledInContext(cmd, this._actor, 'actor');
            var name = cmd.useSkillDisplayName ? cmd.useSkillDisplayName() : cmd.name();
            this.addCommand(name, 'use_skill', ok, cmd);
            return;
        }
        var methodName = 'addBattleCommand_' + cmd.symbol();
        if (this[methodName]) {
            this[methodName](cmd);
            return;
        }
        methodName = 'addBattleCommand_' + symbol;
        if (this[methodName]) {
            this[methodName](cmd);
            return;
        }
        this.addCommand(cmd.name(), cmd.symbol(), $.commandEnabledInContext(cmd, this._actor, 'actor'), cmd.ext());
    };

    var _WAC_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _WAC_makeCommandList.call(this);
        if (this.findSymbol('auto') >= 0) {
            this._list = this._list.filter(function(c) { return c.symbol !== 'bamAuto'; });
        }
        if (this.findSymbol('partyswitch') >= 0) {
            var seen = false;
            this._list = this._list.filter(function(c) {
                if (c.symbol !== 'partyswitch') return true;
                if (seen) return false;
                seen = true;
                return true;
            });
        }
    };

    //-------------------------------------------------------------------------
    // Window_PartyCommand override
    //-------------------------------------------------------------------------

    Window_PartyCommand.prototype.jakeMSGAddPartyCommand = function(cmd) {
        var user = $.evalUser();
        if (!cmd.isVisible(user)) return;
        var children = cmd.visibleChildren(user);
        var enabled = $.commandEnabledInContext(cmd, user, 'party');
        if (children.length > 0) {
            this.addCommand($.commandDisplayName(cmd), 'jakeMSG_nested', enabled, cmd);
            return;
        }
        var symbol = String(cmd.symbol() || '').toLowerCase();
        var native = $.partyNativeSymbol(symbol);
        if (!$.partySymbolAvailable(symbol) && !$.isKnownActionSymbol(symbol)) {
            this.addCommand(cmd.name(), native, enabled, cmd);
            return;
        }
        this.addCommand(cmd.name(), native, enabled, cmd);
    };

    Window_PartyCommand.prototype.jakeMSGMakePartyMenu = function() {
        var cmds = $.getPartyMenuCommands() || [];
        for (var i = 0; i < cmds.length; i++) {
            this.jakeMSGAddPartyCommand(cmds[i]);
        }
    };

    var _WPC_setup = Window_PartyCommand.prototype.setup;
    Window_PartyCommand.prototype.setup = function() {
        _WPC_setup.call(this);
        if ($.hasPartyMenuOverride()) {
            this.clearCommandList();
            this.jakeMSGMakePartyMenu();
            this.refresh();
            this.select(0);
            this.activate();
            this.open();
        } else if ($.hasPartyMenuFlags()) {
            this._list = $.applyPartyFlagsToWindowList(this._list);
            this.refresh();
            this.select(0);
            this.activate();
            this.open();
        }
    };

    $.commandDisplayName = function(cmd) {
        if (!cmd) return '';
        if (this.normalizeActorSymbol(cmd.symbol()) === 'use_skill' && cmd.useSkillDisplayName) {
            return cmd.useSkillDisplayName();
        }
        return cmd.name();
    };

    $.formatDescription = function(text) {
        var s = String(text == null ? '' : text);
        if (s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') {
            try { s = JSON.parse(s); } catch (e) {
                s = s.substring(1, s.length - 1);
            }
        }
        return s.replace(/\\n/g, '\n');
    };

    $.formatHelpWindowText = function(text) {
        var s = this.formatDescription(text);
        if (Imported.YEP_MessageCore && typeof Yanfly !== 'undefined' &&
            Yanfly.Param && Yanfly.Param.MSGDescWrap) {
            try {
                if (eval(Yanfly.Param.MSGDescWrap) && s.indexOf('<WordWrap>') !== 0) {
                    s = '<WordWrap>' + s;
                }
            } catch (e) {}
        }
        return s;
    };

    $.skillHasHelpText = function(skill) {
        if (!skill) return false;
        var d = skill.description;
        if (d != null && String(d).replace(/^\s+|\s+$/g, '') !== '') return true;
        var note = skill.note || '';
        return /<\s*(?:EXTEND(?:ED)?(?:\s+DESCRIPT(?:ION)?)?|EXT(?:ENDED)?DESC(?:RIPT(?:ION)?)?|EXT\s+DESC)\s*>/i.test(note);
    };

    $.helpInfoForCommand = function(cmd) {
        if (!cmd) return null;
        if (cmd.hasCustomDescription && cmd.hasCustomDescription()) {
            return { text: this.formatHelpWindowText(cmd.customDescription()) };
        }
        if (this.normalizeActorSymbol(cmd.symbol()) === 'use_skill') {
            var skill = $dataSkills && $dataSkills[Math.floor(cmd.ext())];
            if (this.skillHasHelpText(skill)) return { item: skill };
        }
        return null;
    };

    $.drawUseSkillCommand = function(win, cmd, actor, rect, hideCost) {
        var skill = $dataSkills && $dataSkills[Math.floor(cmd.ext())];
        var name = cmd.useSkillDisplayName ? cmd.useSkillDisplayName() : cmd.name();
        var showIcon = !!(skill && cmd.showSkillIcon && cmd.showSkillIcon(actor));
        var showCost = !hideCost && !!(skill && cmd.showSkillCost && cmd.showSkillCost(actor));
        var align = 'left';
        if (!showIcon && win.itemTextAlign) align = win.itemTextAlign();
        if (!skill) {
            win.drawText(name, rect.x, rect.y, rect.width, align);
            return;
        }
        var costWidth = 0;
        if (showCost) {
            costWidth = win.costWidth ? win.costWidth() : win.textWidth('000');
        }
        var textWidth = Math.max(0, rect.width - costWidth);
        if (showIcon) {
            var iconBoxWidth = Window_Base._iconWidth + 4;
            win.resetTextColor();
            win.drawIcon(skill.iconIndex, rect.x + 2, rect.y + 2);
            win.drawText(name, rect.x + iconBoxWidth, rect.y, Math.max(0, textWidth - iconBoxWidth), 'left');
        } else {
            win.drawText(name, rect.x, rect.y, textWidth, align);
        }
        if (showCost && actor && win.drawSkillCost) {
            win.drawSkillCost(skill, rect.x, rect.y, rect.width);
        }
    };

    $.shiftHelpContentsDown = function(helpWindow) {
        var bitmap = helpWindow && helpWindow.contents;
        if (!bitmap) return;
        var dy = helpWindow.lineHeight();
        if (dy <= 0) return;
        if (bitmap.height <= dy) {
            bitmap.clear();
            return;
        }
        var tmp = new Bitmap(bitmap.width, bitmap.height);
        tmp.blt(bitmap, 0, 0, bitmap.width, bitmap.height - dy, 0, 0);
        bitmap.clear();
        bitmap.blt(tmp, 0, 0, tmp.width, tmp.height, 0, dy);
    };

    $.drawSkillCostOnHelp = function(helpWindow, skill, actor, costWin) {
        if (!helpWindow || !skill || !actor || !costWin || !costWin.drawSkillCost) return;
        var savedActor = costWin._actor;
        var savedContents = costWin.contents;
        var savedDrawText = costWin.drawText;
        var savedDrawIcon = costWin.drawIcon;
        var savedDrawTextEx = costWin.drawTextEx;
        var cursor = helpWindow.textPadding();
        var gap = 4;
        if (typeof Yanfly !== 'undefined' && Yanfly.Param && Yanfly.Param.SCCCostPadding != null) {
            gap = Number(Yanfly.Param.SCCCostPadding) || 4;
        }
        costWin._actor = actor;
        costWin.contents = helpWindow.contents;
        costWin.drawIcon = function(iconIndex, ix, iy) {
            if (iy >= this.contents.height) return;
            savedDrawIcon.call(this, iconIndex, cursor, iy);
            cursor += Window_Base._iconWidth + 2;
        };
        costWin.drawText = function(text, tx, ty, tw, align) {
            if (ty >= this.contents.height) return;
            var w = this.textWidth(text);
            savedDrawText.call(this, text, cursor, ty, w, 'left');
            cursor += w + gap;
        };
        costWin.drawTextEx = function(text, tx, ty) {
            if (ty >= this.contents.height) return savedDrawTextEx.call(this, text, tx, ty);
            var w = savedDrawTextEx.call(this, text, cursor, ty);
            cursor += w + gap;
            return w;
        };
        try {
            if (costWin.resetFontSettings) costWin.resetFontSettings();
            if (costWin.resetTextColor) costWin.resetTextColor();
            costWin.drawSkillCost(skill, helpWindow.textPadding(), 0,
                helpWindow.contents.width - helpWindow.textPadding());
        } finally {
            costWin.drawText = savedDrawText;
            costWin.drawIcon = savedDrawIcon;
            costWin.drawTextEx = savedDrawTextEx;
            costWin.contents = savedContents;
            costWin._actor = savedActor;
            if (costWin.resetFontSettings) costWin.resetFontSettings();
            if (costWin.resetTextColor) costWin.resetTextColor();
        }
    };

    $.applyMapRootHelp = function(helpWindow, cmd, actor, costWin) {
        if (!helpWindow) return;
        helpWindow.show();
        var info = this.helpInfoForCommand(cmd);
        var skill = null;
        var showCost = false;
        if (cmd && this.normalizeActorSymbol(cmd.symbol()) === 'use_skill') {
            skill = $dataSkills && $dataSkills[Math.floor(cmd.ext())];
            showCost = !!(skill && actor && cmd.showSkillCost && cmd.showSkillCost(actor) &&
                costWin && costWin.drawSkillCost);
        }
        if (info && info.item) helpWindow.setItem(info.item);
        else if (info && info.text) helpWindow.setText(info.text);
        else helpWindow.clear();
        if (!showCost) return;
        helpWindow.refresh();
        if (info) this.shiftHelpContentsDown(helpWindow);
        this.drawSkillCostOnHelp(helpWindow, skill, actor, costWin);
    };

    $.mixSkillListCostDrawers = function(dst) {
        var skip = {
            initialize: true,
            constructor: true,
            refresh: true,
            show: true,
            hide: true,
            drawItem: true,
            drawAllItems: true,
            updateHelp: true,
            makeItemList: true,
            includes: true,
            item: true,
            maxItems: true,
            maxCols: true,
            spacing: true,
            setActor: true,
            setStypeId: true,
            selectLast: true,
            isEnabled: true,
            isCurrentItemEnabled: true,
            pIsHintsAllowed: true,
            pItemForHint: true
        };
        var src = Window_SkillList.prototype;
        for (var key in src) {
            if (!src.hasOwnProperty(key)) continue;
            if (skip[key]) continue;
            if (typeof src[key] !== 'function') continue;
            if (dst.hasOwnProperty(key)) continue;
            if (key.indexOf('_him') === 0 || key.indexOf('pIs') === 0 || key.indexOf('pItem') === 0) {
                continue;
            }
            if (!(/Cost|Cooldown|Warmup|LimitedSkill|SkillItem|SkillLimit/.test(key) ||
                    key.indexOf('runDisplay') === 0 || key === 'costWidth')) {
                continue;
            }
            dst[key] = src[key];
        }
    };

    $.mixSkillListCostDrawers(Window_ActorCommand.prototype);

    var _WAC_drawItem = Window_ActorCommand.prototype.drawItem;
    Window_ActorCommand.prototype.drawItem = function(index) {
        _WAC_drawItem.call(this, index);
        var ext = this._list && this._list[index] ? this._list[index].ext : null;
        if (!ext || typeof ext.symbol !== 'function') return;
        if ($.normalizeActorSymbol(ext.symbol()) !== 'use_skill') return;
        var skill = $dataSkills && $dataSkills[Math.floor(ext.ext())];
        if (!skill) return;
        var showIcon = ext.showSkillIcon && ext.showSkillIcon(this._actor);
        var showCost = ext.showSkillCost && ext.showSkillCost(this._actor);
        if (!showIcon && !showCost) return;
        var rect = this.itemRect(index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        if (showIcon) {
            this.drawIcon(skill.iconIndex, rect.x + 2, rect.y + 2);
        }
        if (showCost && this.drawSkillCost) {
            this.drawSkillCost(skill, rect.x, rect.y, rect.width);
        }
        this.changePaintOpacity(true);
    };

    //-------------------------------------------------------------------------
    // Nested command window (Skill Type look)
    //-------------------------------------------------------------------------

    function Window_JakeMSG_NestedCommand() {
        this.initialize.apply(this, arguments);
    }

    Window_JakeMSG_NestedCommand.prototype = Object.create(Window_Selectable.prototype);
    Window_JakeMSG_NestedCommand.prototype.constructor = Window_JakeMSG_NestedCommand;

    Window_JakeMSG_NestedCommand.prototype.initialize = function(x, y, width, height) {
        this._sourceCommands = [];
        this._list = [];
        this._actor = null;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.hide();
        this.deactivate();
    };

    Window_JakeMSG_NestedCommand.prototype.maxCols = function() { return 2; };
    Window_JakeMSG_NestedCommand.prototype.spacing = function() { return 48; };
    Window_JakeMSG_NestedCommand.prototype.maxItems = function() {
        return this._list ? this._list.length : 0;
    };
    Window_JakeMSG_NestedCommand.prototype.item = function() {
        return this._list && this.index() >= 0 ? this._list[this.index()] : null;
    };
    Window_JakeMSG_NestedCommand.prototype.currentCmd = function() {
        var item = this.item();
        return item ? item.ext : null;
    };
    Window_JakeMSG_NestedCommand.prototype.currentSymbol = function() {
        var item = this.item();
        return item ? item.symbol : null;
    };
    Window_JakeMSG_NestedCommand.prototype.currentExt = function() {
        var cmd = this.currentCmd();
        return cmd && cmd.ext ? cmd.ext() : null;
    };
    Window_JakeMSG_NestedCommand.prototype.isCommandEnabled = function(index) {
        var item = this._list && this._list[index];
        return !!(item && item.enabled);
    };
    Window_JakeMSG_NestedCommand.prototype.isCurrentItemEnabled = function() {
        var item = this.item();
        return item ? item.enabled : false;
    };
    Window_JakeMSG_NestedCommand.prototype.getSourceCommands = function() {
        return this._sourceCommands;
    };

    Window_JakeMSG_NestedCommand.prototype.setCommands = function(commands, actor) {
        this._sourceCommands = commands || [];
        this._actor = actor;
        this.refresh();
        this.select(0);
        this.resetScroll();
    };

    Window_JakeMSG_NestedCommand.prototype.addCommand = function(name, symbol, enabled, ext) {
        if (enabled === undefined) enabled = true;
        this._list.push({ name: name, symbol: symbol, enabled: enabled, ext: ext });
    };

    Window_JakeMSG_NestedCommand.prototype.jakeMSGAddOne = function(cmd, actor) {
        if (!cmd.isVisible(actor)) return;
        var symbol = $.normalizeActorSymbol(cmd.symbol());
        var context = this._jakeMSGContext || 'actor';
        if (symbol === 'skill_list' && cmd.visibleChildren(actor).length === 0 && actor) {
            var skillTypes = actor.addedSkillTypes();
            skillTypes.sort(function(a, b) { return a - b; });
            skillTypes.forEach(function(stypeId) {
                if (actor.isSkillTypeHidden && actor.isSkillTypeHidden(stypeId)) return;
                var name = $dataSystem.skillTypes[stypeId];
                var stCmd = ABC.makeCommand('skill_type', stypeId);
                stCmd.setName(name);
                this.addCommand(name, 'skill_type', $.commandEnabledInContext(stCmd, actor, context), stCmd);
            }, this);
            return;
        }
        this.addCommand($.commandDisplayName(cmd), cmd.symbol(), $.commandEnabledInContext(cmd, actor, context), cmd);
    };

    Window_JakeMSG_NestedCommand.prototype.makeCommandList = function() {
        this._list = [];
        var actor = this._actor || $.evalUser();
        var cmds = this._sourceCommands || [];
        for (var i = 0; i < cmds.length; i++) {
            this.jakeMSGAddOne(cmds[i], actor);
        }
    };

    Window_JakeMSG_NestedCommand.prototype.costWidth = function() {
        return this.textWidth('000');
    };

    Window_JakeMSG_NestedCommand.prototype.drawItem = function(index) {
        var item = this._list[index];
        if (!item) return;
        var cmd = item.ext;
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.changePaintOpacity(item.enabled);
        var symbol = cmd && cmd.symbol ? $.normalizeActorSymbol(cmd.symbol()) : item.symbol;
        if (symbol === 'use_skill' && cmd) {
            $.drawUseSkillCommand(this, cmd, this._actor, rect);
        } else {
            this.drawText(item.name, rect.x + this.textPadding(), rect.y, rect.width);
        }
        this.changePaintOpacity(true);
    };

    Window_JakeMSG_NestedCommand.prototype.updateHelp = function() {
        if (!this._helpWindow) return;
        var info = $.helpInfoForCommand(this.currentCmd());
        if (!info) {
            this._helpWindow.clear();
            this._helpWindow.hide();
            return;
        }
        this._helpWindow.show();
        if (info.item) {
            this.setHelpWindowItem(info.item);
        } else {
            this._helpWindow.setText(info.text);
        }
    };

    Window_JakeMSG_NestedCommand.prototype.refresh = function() {
        this.makeCommandList();
        this.createContents();
        this.drawAllItems();
        this.updateHelp();
    };

    Window_JakeMSG_NestedCommand.prototype.show = function() {
        Window_Selectable.prototype.show.call(this);
        this.updateHelp();
    };

    Window_JakeMSG_NestedCommand.prototype.hide = function() {
        this.hideHelpWindow();
        Window_Selectable.prototype.hide.call(this);
    };

    $.mixSkillListCostDrawers(Window_JakeMSG_NestedCommand.prototype);

    window.Window_JakeMSG_NestedCommand = Window_JakeMSG_NestedCommand;

    //-------------------------------------------------------------------------
    // Input hotkeys
    //-------------------------------------------------------------------------

    Input._jakeMSGPressed = Input._jakeMSGPressed || {};
    Input._jakeMSGTriggered = Input._jakeMSGTriggered || {};

    Input.jakeMSGNoteKeyDown = function(keyCode) {
        var code = Number(keyCode);
        if (!code) return;
        if (!Input._jakeMSGPressed[code]) Input._jakeMSGTriggered[code] = true;
        Input._jakeMSGPressed[code] = true;
    };

    Input.jakeMSGNoteKeyUp = function(keyCode) {
        var code = Number(keyCode);
        Input._jakeMSGPressed[code] = false;
        if (Input._jakeMSGTriggered) delete Input._jakeMSGTriggered[code];
    };

    Input.jakeMSGInstallKeyHook = function() {
        if (Input._jakeMSGHookInstalled) return;
        Input._jakeMSGHookInstalled = true;
        document.addEventListener('keydown', function(event) {
            Input.jakeMSGNoteKeyDown(event.keyCode);
        }, true);
        document.addEventListener('keyup', function(event) {
            Input.jakeMSGNoteKeyUp(event.keyCode);
        }, true);
    };
    Input.jakeMSGInstallKeyHook();

    var _Input_initialize = Input.initialize;
    Input.initialize = function() {
        _Input_initialize.call(this);
        Input.jakeMSGInstallKeyHook();
    };

    var _Input_onKeyDown = Input._onKeyDown;
    Input._onKeyDown = function(event) {
        _Input_onKeyDown.call(this, event);
        Input.jakeMSGNoteKeyDown(event.keyCode);
    };

    var _Input_onKeyUp = Input._onKeyUp;
    Input._onKeyUp = function(event) {
        _Input_onKeyUp.call(this, event);
        Input.jakeMSGNoteKeyUp(event.keyCode);
    };

    Input.jakeMSGClearTriggered = function() {
        Input._jakeMSGTriggered = {};
    };

    Input.jakeMSGResetHotkeys = function() {
        Input._jakeMSGTriggered = {};
        Input._jakeMSGPressed = {};
    };

    Input.jakeMSGTriggeredCodes = function() {
        var codes = [];
        for (var k in Input._jakeMSGTriggered) {
            if (Input._jakeMSGTriggered[k]) codes.push(Number(k));
        }
        return codes;
    };

    Input.jakeMSGConsumeInput = function(keyCode) {
        if (keyCode != null) {
            delete Input._jakeMSGTriggered[keyCode];
        } else {
            Input._jakeMSGTriggered = {};
        }
        Input._latestButton = null;
        Input._pressedTime = 1;
        if (Input._currentState) {
            for (var name in Input._currentState) {
                Input._currentState[name] = false;
            }
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Battle flow
    //-------------------------------------------------------------------------

    Scene_Battle.prototype.jakeMSGResetCommandFlow = function() {
        this._jakeMSGVisualStack = [];
        this._jakeMSGEffectParents = [];
        this._jakeMSGReturnOnTargetCancel = null;
        this._jakeMSGPendingExt = null;
        this._jakeMSGPendingCmd = null;
        this._jakeMSGContext = 'actor';
        this.jakeMSGHideNested();
        this.jakeMSGClearExtraActions();
    };

    Scene_Battle.prototype.jakeMSGHideNested = function() {
        if (this._jakeMSGNestedWindow) {
            this._jakeMSGNestedWindow.hide();
            this._jakeMSGNestedWindow.deactivate();
        }
    };

    Scene_Battle.prototype.jakeMSGClearExtraActions = function() {
        var actor = BattleManager.actor();
        if (actor) actor._jakeMSGExtraActions = [];
    };

    Scene_Battle.prototype.jakeMSGCaptureUiState = function() {
        return {
            party: !!(this._partyCommandWindow && this._partyCommandWindow.active),
            actor: !!(this._actorCommandWindow && this._actorCommandWindow.active),
            skill: !!(this._skillWindow && this._skillWindow.visible),
            skillActive: !!(this._skillWindow && this._skillWindow.active),
            item: !!(this._itemWindow && this._itemWindow.visible),
            nested: !!(this._jakeMSGNestedWindow && this._jakeMSGNestedWindow.visible),
            nestedCommands: this._jakeMSGNestedWindow ? this._jakeMSGNestedWindow.getSourceCommands() : [],
            nestedIndex: this._jakeMSGNestedWindow ? this._jakeMSGNestedWindow.index() : 0,
            nestedContext: this._jakeMSGNestedWindow ? this._jakeMSGNestedWindow._jakeMSGContext : 'actor',
            visualStack: (this._jakeMSGVisualStack || []).slice(),
            effectParents: (this._jakeMSGEffectParents || []).slice(),
            actorIndex: this._actorCommandWindow ? this._actorCommandWindow.index() : 0,
            partyIndex: this._partyCommandWindow ? this._partyCommandWindow.index() : 0,
            skillIndex: this._skillWindow ? this._skillWindow.index() : 0
        };
    };

    Scene_Battle.prototype.jakeMSGRestoreUiState = function(state) {
        if (!state) return;
        this._jakeMSGVisualStack = (state.visualStack || []).slice();
        this._jakeMSGEffectParents = (state.effectParents || []).slice();
        this.jakeMSGHideNested();
        if (this._skillWindow) {
            this._skillWindow.hide();
            this._skillWindow.deactivate();
        }
        if (this._itemWindow) {
            this._itemWindow.hide();
            this._itemWindow.deactivate();
        }
        if (this._partyCommandWindow) this._partyCommandWindow.deactivate();
        if (this._actorCommandWindow) this._actorCommandWindow.deactivate();
        if (state.nested) {
            var actor = BattleManager.actor() || $.evalUser();
            this.jakeMSGOpenNested(state.nestedCommands, actor, state.nestedContext, state.nestedIndex);
        } else if (state.skill) {
            this._skillWindow.show();
            if (state.skillActive) this._skillWindow.activate();
            this._skillWindow.select(state.skillIndex);
        } else if (state.item) {
            this._itemWindow.show();
            this._itemWindow.activate();
        } else if (state.actor) {
            this._actorCommandWindow.activate();
            this._actorCommandWindow.select(state.actorIndex);
        } else if (state.party) {
            this._partyCommandWindow.activate();
            this._partyCommandWindow.select(state.partyIndex);
        } else if (BattleManager.actor() && this._actorCommandWindow) {
            this._actorCommandWindow.activate();
        } else if (this._partyCommandWindow) {
            this._partyCommandWindow.activate();
        }
    };

    Scene_Battle.prototype.jakeMSGDeactivateInputWindows = function() {
        if (this._actorCommandWindow) this._actorCommandWindow.deactivate();
        if (this._partyCommandWindow) this._partyCommandWindow.deactivate();
        if (this._skillWindow) this._skillWindow.deactivate();
        if (this._itemWindow) this._itemWindow.deactivate();
        this.jakeMSGHideNested();
    };

    Scene_Battle.prototype.jakeMSGOpenNested = function(commands, actor, context, index) {
        var win = this._jakeMSGNestedWindow;
        win._jakeMSGContext = context || 'actor';
        win.setCommands(commands, actor);
        if (this._helpWindow) win.setHelpWindow(this._helpWindow);
        win.show();
        win.activate();
        win.select(index == null ? 0 : index);
        win.updateHelp();
    };

    Scene_Battle.prototype.jakeMSGPushEffectParent = function(effect) {
        this._jakeMSGEffectParents = this._jakeMSGEffectParents || [];
        if (effect) this._jakeMSGEffectParents.push(effect);
    };

    Scene_Battle.prototype.jakeMSGParentFromCmd = function(cmd) {
        return { type: 'command', cmd: cmd };
    };

    Scene_Battle.prototype.jakeMSGParentFromSkill = function(skill) {
        return { type: 'skill', skill: skill };
    };

    Scene_Battle.prototype.jakeMSGEnterSubmenu = function(parentCmd, children, fromKind, skillForBefore) {
        var actor = BattleManager.actor() || $.evalUser();
        var win = this._jakeMSGNestedWindow;
        this._jakeMSGVisualStack = this._jakeMSGVisualStack || [];
        if (win && win.visible) {
            this._jakeMSGVisualStack.push({
                kind: 'nested',
                commands: win.getSourceCommands(),
                index: win.index(),
                context: win._jakeMSGContext,
                popEffect: true
            });
        } else if (fromKind) {
            this._jakeMSGVisualStack.push({ kind: fromKind, popEffect: true });
        }
        if (skillForBefore) {
            $.evalBeforeSubcommandMenu(actor, skillForBefore);
            this.jakeMSGPushEffectParent(this.jakeMSGParentFromSkill(skillForBefore));
        } else if (parentCmd) {
            this.jakeMSGPushEffectParent(this.jakeMSGParentFromCmd(parentCmd));
        }
        if (fromKind === 'skill' && this._skillWindow) {
            this._skillWindow.hide();
            this._skillWindow.deactivate();
        }
        if (fromKind === 'actor' && this._actorCommandWindow) {
            this._actorCommandWindow.deactivate();
        }
        if (fromKind === 'party' && this._partyCommandWindow) {
            this._partyCommandWindow.deactivate();
        }
        var context = 'actor';
        if (fromKind === 'party') {
            context = 'party';
        } else if (win && win.visible && win._jakeMSGContext) {
            context = win._jakeMSGContext;
        }
        this.jakeMSGOpenNested(children, actor, context);
    };

    Scene_Battle.prototype.jakeMSGOpenSkillSubmenu = function(skill, extraParentCmd) {
        var actor = BattleManager.actor();
        var children = $.getSkillSubcommands(skill);
        if (extraParentCmd) this.jakeMSGPushEffectParent(this.jakeMSGParentFromCmd(extraParentCmd));
        var fromKind;
        if (this._jakeMSGNestedWindow && this._jakeMSGNestedWindow.visible) {
            fromKind = null;
        } else if (this._skillWindow && this._skillWindow.visible) {
            fromKind = 'skill';
        } else if (this._partyCommandWindow && this._partyCommandWindow.active) {
            fromKind = 'party';
        } else {
            fromKind = 'actor';
        }
        this.jakeMSGEnterSubmenu(null, children, fromKind, skill);
    };

    Scene_Battle.prototype.jakeMSGPushNestedRestore = function(popEffect) {
        var win = this._jakeMSGNestedWindow;
        if (!win || !win.visible) return false;
        this._jakeMSGVisualStack = this._jakeMSGVisualStack || [];
        this._jakeMSGVisualStack.push({
            kind: 'nested',
            commands: win.getSourceCommands(),
            index: win.index(),
            context: win._jakeMSGContext,
            popEffect: !!popEffect
        });
        this.jakeMSGHideNested();
        return true;
    };

    Scene_Battle.prototype.jakeMSGCreateNestedCommandWindow = function() {
        var wx = 0;
        var wy = this._helpWindow ? this._helpWindow.y + this._helpWindow.height : 0;
        var ww = Graphics.boxWidth;
        var wh = this._statusWindow ? this._statusWindow.y - wy : Graphics.boxHeight / 2;
        if (this._skillWindow) {
            wx = this._skillWindow.x;
            wy = this._skillWindow.y;
            ww = this._skillWindow.width;
            wh = this._skillWindow.height;
        }
        this._jakeMSGNestedWindow = new Window_JakeMSG_NestedCommand(wx, wy, ww, wh);
        if (this._helpWindow) this._jakeMSGNestedWindow.setHelpWindow(this._helpWindow);
        this._jakeMSGNestedWindow.setHandler('ok', this.jakeMSGOnNestedOk.bind(this));
        this._jakeMSGNestedWindow.setHandler('cancel', this.jakeMSGOnNestedCancel.bind(this));
        this.addWindow(this._jakeMSGNestedWindow);
    };

    var _SB_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _SB_createAllWindows.call(this);
        this.jakeMSGCreateNestedCommandWindow();
        this.jakeMSGResetCommandFlow();
    };

    var _SB_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _SB_createActorCommandWindow.call(this);
        var win = this._actorCommandWindow;
        win.setHandler('jakeMSG_nested', this.jakeMSGOnActorNested.bind(this));
        win.setHandler('skill_type', this.commandSkill.bind(this));
        win.setHandler('use_skill', this.commandUseSkill.bind(this));
        win.setHandler('auto', this.jakeMSGCommandActorAuto.bind(this));
        if (this.commandChangeBattleEquip) {
            win.setHandler('change_equip', this.commandChangeBattleEquip.bind(this));
        }
        if (this.commandPartySwitch) {
            win.setHandler('partyswitch', this.commandPartySwitch.bind(this));
        }
        var _callOk = win.callOkHandler;
        var scene = this;
        win.callOkHandler = function() {
            var symbol = this.currentSymbol();
            if (this.isHandled(symbol)) {
                _callOk.call(this);
            } else {
                scene.jakeMSGOnActorCustom(this);
            }
        };
    };

    var _SB_createPartyCommandWindow = Scene_Battle.prototype.createPartyCommandWindow;
    Scene_Battle.prototype.createPartyCommandWindow = function() {
        _SB_createPartyCommandWindow.call(this);
        var win = this._partyCommandWindow;
        win.setHandler('jakeMSG_nested', this.jakeMSGOnPartyNested.bind(this));
        var _callOk = win.callOkHandler;
        var scene = this;
        win.callOkHandler = function() {
            var symbol = this.currentSymbol();
            if (this.isHandled(symbol)) {
                _callOk.call(this);
            } else {
                scene.jakeMSGOnPartyCustom(this);
            }
        };
    };

    Scene_Battle.prototype.jakeMSGCommandActorAuto = function() {
        if (this.commandBamIndividualAuto) this.commandBamIndividualAuto();
    };

    Scene_Battle.prototype.jakeMSGOnActorNested = function() {
        var cmd = this._actorCommandWindow.currentExt();
        var actor = BattleManager.actor();
        if (!cmd || !cmd.visibleChildren) {
            this._actorCommandWindow.activate();
            return;
        }
        this.jakeMSGEnterSubmenu(cmd, cmd.visibleChildren(actor), 'actor');
    };

    Scene_Battle.prototype.jakeMSGOnPartyNested = function() {
        var cmd = this._partyCommandWindow.currentExt();
        var user = $.evalUser();
        if (!cmd || !cmd.visibleChildren) {
            this._partyCommandWindow.activate();
            return;
        }
        this.jakeMSGEnterSubmenu(cmd, cmd.visibleChildren(user), 'party');
    };

    Scene_Battle.prototype.jakeMSGOnActorCustom = function(win) {
        var symbol = win.currentSymbol();
        var ext = win.currentExt();
        var fake = ABC.makeCommand(symbol, ext);
        fake.setName(win.commandName(win.index()));
        this.jakeMSGHandleSelectedCommand(fake, 'actor');
    };

    Scene_Battle.prototype.jakeMSGOnPartyCustom = function(win) {
        var symbol = win.currentSymbol();
        var ext = win.currentExt();
        if (ext && typeof ext === 'object' && ext.symbol) {
            this.jakeMSGHandleSelectedCommand(ext, 'party');
            return;
        }
        var fake = ABC.makeCommand(symbol, ext);
        fake.setName(win.commandName(win.index()));
        this.jakeMSGHandleSelectedCommand(fake, 'party');
    };

    Scene_Battle.prototype.jakeMSGOnNestedOk = function() {
        var cmd = this._jakeMSGNestedWindow.currentCmd();
        var context = this._jakeMSGNestedWindow._jakeMSGContext || 'actor';
        this.jakeMSGHandleSelectedCommand(cmd, context);
    };

    Scene_Battle.prototype.jakeMSGOnNestedCancel = function() {
        var prev = (this._jakeMSGVisualStack || []).pop();
        this._jakeMSGEffectParents = this._jakeMSGEffectParents || [];
        if (!prev || prev.popEffect !== false) {
            this._jakeMSGEffectParents.pop();
        }
        if (!prev) {
            this.jakeMSGHideNested();
            if (BattleManager.actor()) this._actorCommandWindow.activate();
            else this._partyCommandWindow.activate();
            return;
        }
        if (prev.kind === 'hotkey') {
            this.jakeMSGRestoreUiState(prev.state);
            return;
        }
        if (prev.kind === 'nested') {
            var actor = BattleManager.actor() || $.evalUser();
            this.jakeMSGOpenNested(prev.commands, actor, prev.context, prev.index);
            return;
        }
        this.jakeMSGHideNested();
        if (prev.kind === 'actor') this._actorCommandWindow.activate();
        else if (prev.kind === 'party') this._partyCommandWindow.activate();
        else if (prev.kind === 'skill') {
            this._skillWindow.show();
            this._skillWindow.activate();
        } else if (prev.kind === 'item') {
            this._itemWindow.show();
            this._itemWindow.activate();
        }
    };

    Scene_Battle.prototype.jakeMSGHandleSelectedCommand = function(cmd, context) {
        if (!cmd) {
            SoundManager.playBuzzer();
            this.jakeMSGReactivateCurrent();
            return;
        }
        var user = context === 'party' ? $.evalUser() : BattleManager.actor();
        if (!$.commandEnabledInContext(cmd, user, context || 'actor')) {
            SoundManager.playBuzzer();
            this.jakeMSGReactivateCurrent();
            return;
        }
        var children = cmd.visibleChildren(user);
        if (children.length > 0) {
            this.jakeMSGEnterSubmenu(cmd, children, null);
            return;
        }
        var symbol = $.normalizeActorSymbol(cmd.symbol());
        if (symbol === 'use_skill' && $.skillHasSubcommands(cmd.ext())) {
            var skill = $dataSkills[Math.floor(cmd.ext())];
            this.jakeMSGOpenSkillSubmenu(skill);
            return;
        }
        if (symbol === 'skill_type' || symbol === 'skill') {
            this.jakeMSGPushNestedRestore(false);
            this._jakeMSGPendingExt = cmd.ext();
            this.commandSkill();
            return;
        }
        if (symbol === 'item') {
            this.jakeMSGStoreParentExtras();
            this.jakeMSGPushNestedRestore(false);
            this.commandItem();
            return;
        }
        if (context === 'party') {
            this.jakeMSGInvokePartyCommand(cmd);
            return;
        }
        this.jakeMSGCommitLeaf(cmd);
    };

    Scene_Battle.prototype.jakeMSGStoreParentExtras = function() {
        var chain = (this._jakeMSGEffectParents || []).slice().reverse();
        var extras = [];
        for (var i = 0; i < chain.length; i++) {
            if ($.effectHasAction(chain[i])) extras.push(chain[i]);
        }
        this.jakeMSGStoreExtras(extras);
    };

    Scene_Battle.prototype.jakeMSGReactivateCurrent = function() {
        if (this._jakeMSGNestedWindow && this._jakeMSGNestedWindow.visible) {
            this._jakeMSGNestedWindow.activate();
        } else if (this._skillWindow && this._skillWindow.visible) {
            this._skillWindow.activate();
        } else if (BattleManager.actor()) {
            this._actorCommandWindow.activate();
        } else {
            this._partyCommandWindow.activate();
        }
    };

    Scene_Battle.prototype.jakeMSGInvokePartyCommand = function(cmd) {
        var symbol = String(cmd.symbol() || '').toLowerCase();
        this.jakeMSGHideNested();
        this._jakeMSGVisualStack = [];
        this._jakeMSGEffectParents = [];
        if (!$.partySymbolAvailable(symbol)) {
            this._partyCommandWindow.activate();
            return;
        }
        var native = $.partyNativeSymbol(symbol);
        if (native === 'fight') { this.commandFight(); return; }
        if (native === 'escape') { this.commandEscape(); return; }
        if (this._partyCommandWindow.isHandled(native)) {
            this._partyCommandWindow.callHandler(native);
            return;
        }
        if (this._partyCommandWindow.isHandled(symbol)) {
            this._partyCommandWindow.callHandler(symbol);
            return;
        }
        this._partyCommandWindow.activate();
    };

    Scene_Battle.prototype.jakeMSGMakeActionFromEffect = function(actor, effect, targetIndex) {
        var action = new Game_Action(actor);
        if (effect.type === 'skill' && effect.skill) {
            action.setSkill(effect.skill.id);
        } else if (effect.cmd && $.normalizeActorSymbol(effect.cmd.symbol()) === 'use_skill') {
            action.setSkill(Math.floor(effect.cmd.ext()));
        } else if (effect.cmd && $.normalizeActorSymbol(effect.cmd.symbol()) === 'attack') {
            action.setAttack();
        } else if (effect.cmd && $.normalizeActorSymbol(effect.cmd.symbol()) === 'guard') {
            action.setGuard();
        } else {
            return null;
        }
        if (targetIndex != null && targetIndex >= 0) action.setTarget(targetIndex);
        return action;
    };

    Scene_Battle.prototype.jakeMSGStoreExtras = function(extras) {
        var actor = BattleManager.actor();
        if (!actor) return;
        actor._jakeMSGExtraEffects = extras || [];
    };

    Scene_Battle.prototype.jakeMSGBuildExtraActions = function() {
        var actor = BattleManager.actor();
        if (!actor) return;
        var extras = actor._jakeMSGExtraEffects || [];
        actor._jakeMSGExtraEffects = [];
        var primary = BattleManager.inputtingAction();
        var targetIndex = primary ? primary._targetIndex : -1;
        actor._jakeMSGExtraActions = actor._jakeMSGExtraActions || [];
        for (var i = 0; i < extras.length; i++) {
            var action = this.jakeMSGMakeActionFromEffect(actor, extras[i], targetIndex);
            if (action) actor._jakeMSGExtraActions.push(action);
        }
    };

    Scene_Battle.prototype.jakeMSGCommitLeaf = function(leafCmd) {
        var chain = [{ type: 'command', cmd: leafCmd }].concat((this._jakeMSGEffectParents || []).slice().reverse());
        var primary = null;
        var extras = [];
        for (var i = 0; i < chain.length; i++) {
            if (!$.effectHasAction(chain[i])) continue;
            if (!primary) primary = chain[i];
            else extras.push(chain[i]);
        }
        this.jakeMSGStoreExtras(extras);
        if (!primary) {
            this.jakeMSGOnNestedCancel();
            return;
        }
        this.jakeMSGInvokePrimary(primary);
    };

    Scene_Battle.prototype.jakeMSGInvokePrimary = function(effect) {
        if (effect.type === 'skill' && effect.skill) {
            var action = BattleManager.inputtingAction();
            if (!action) return;
            action.setSkill(effect.skill.id);
            BattleManager.actor().setLastBattleSkill(effect.skill);
            this.onSelectAction();
            return;
        }
        var cmd = effect.cmd;
        var symbol = $.normalizeActorSymbol(cmd.symbol());
        this._jakeMSGPendingExt = cmd.ext();
        this._jakeMSGPendingCmd = cmd;
        switch (symbol) {
        case 'attack':
            this.commandAttack();
            break;
        case 'guard':
            this.commandGuard();
            break;
        case 'item':
            this.commandItem();
            break;
        case 'skill_type':
            this.commandSkill();
            break;
        case 'use_skill':
            this.commandUseSkill();
            break;
        case 'change_equip':
            if (this.commandChangeBattleEquip) this.commandChangeBattleEquip();
            else this.jakeMSGReactivateCurrent();
            break;
        case 'switch':
            if (this.commandPartySwitch) this.commandPartySwitch();
            else this.jakeMSGReactivateCurrent();
            break;
        case 'auto':
            this.jakeMSGCommandActorAuto();
            break;
        default:
            if ($.partySymbolAvailable(symbol)) {
                this.jakeMSGInvokePartyCommand(cmd);
            } else {
                this.jakeMSGOnNestedCancel();
            }
            break;
        }
    };

    var _SB_commandSkill = Scene_Battle.prototype.commandSkill;
    Scene_Battle.prototype.commandSkill = function() {
        if (this._jakeMSGPendingExt != null && this._jakeMSGPendingExt !== '') {
            var stypeId = Math.floor(this._jakeMSGPendingExt);
            this._jakeMSGPendingExt = null;
            this._helpWindow.clear();
            this._skillWindow.setActor(BattleManager.actor());
            this._skillWindow.setStypeId(stypeId);
            this._skillWindow.refresh();
            this._skillWindow.show();
            this._skillWindow.activate();
            return;
        }
        _SB_commandSkill.call(this);
    };

    Scene_Battle.prototype.onSkillOk = function() {
        if (this._helpWindow) this._helpWindow.clear();
        var skill = this._skillWindow.item();
        if (!skill) return;
        if ($.skillHasSubcommands(skill)) {
            this.jakeMSGOpenSkillSubmenu(skill);
            return;
        }
        var fake = ABC.makeCommand('use_skill', skill.id);
        fake.setName(skill.name);
        BattleManager.actor().setLastBattleSkill(skill);
        this.jakeMSGCommitLeaf(fake);
    };

    var _SB_onSelectAction = Scene_Battle.prototype.onSelectAction;
    Scene_Battle.prototype.onSelectAction = function() {
        if (!this._jakeMSGReturnOnTargetCancel) {
            this._jakeMSGReturnOnTargetCancel = this.jakeMSGCaptureUiState();
        }
        this.jakeMSGHideNested();
        _SB_onSelectAction.call(this);
        var action = BattleManager.inputtingAction();
        if (action && !action.needsSelection()) {
            this._jakeMSGReturnOnTargetCancel = null;
        }
    };

    var _SB_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
    Scene_Battle.prototype.selectNextCommand = function() {
        this.jakeMSGBuildExtraActions();
        this._jakeMSGReturnOnTargetCancel = null;
        _SB_selectNextCommand.call(this);
    };

    var _SB_onActorOk = Scene_Battle.prototype.onActorOk;
    Scene_Battle.prototype.onActorOk = function() {
        this._jakeMSGReturnOnTargetCancel = null;
        _SB_onActorOk.call(this);
    };

    var _SB_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
    Scene_Battle.prototype.onEnemyOk = function() {
        this._jakeMSGReturnOnTargetCancel = null;
        _SB_onEnemyOk.call(this);
    };

    var _SB_onActorCancel = Scene_Battle.prototype.onActorCancel;
    Scene_Battle.prototype.onActorCancel = function() {
        this.jakeMSGClearExtraActions();
        if (this._jakeMSGReturnOnTargetCancel) {
            this._actorWindow.hide();
            var st = this._jakeMSGReturnOnTargetCancel;
            this._jakeMSGReturnOnTargetCancel = null;
            this.jakeMSGRestoreUiState(st);
            return;
        }
        _SB_onActorCancel.call(this);
    };

    var _SB_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
    Scene_Battle.prototype.onEnemyCancel = function() {
        this.jakeMSGClearExtraActions();
        if (this._jakeMSGReturnOnTargetCancel) {
            this._enemyWindow.hide();
            var st = this._jakeMSGReturnOnTargetCancel;
            this._jakeMSGReturnOnTargetCancel = null;
            this.jakeMSGRestoreUiState(st);
            return;
        }
        _SB_onEnemyCancel.call(this);
    };

    var _SB_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
    Scene_Battle.prototype.onSkillCancel = function() {
        if (this._jakeMSGVisualStack && this._jakeMSGVisualStack.length) {
            this._skillWindow.hide();
            if (this._helpWindow) this._helpWindow.clear();
            if (BattleManager.clearInputtingAction) BattleManager.clearInputtingAction();
            this.jakeMSGOnNestedCancel();
            return;
        }
        _SB_onSkillCancel.call(this);
    };

    var _SB_onItemCancel = Scene_Battle.prototype.onItemCancel;
    Scene_Battle.prototype.onItemCancel = function() {
        if (this._jakeMSGVisualStack && this._jakeMSGVisualStack.length) {
            this._itemWindow.hide();
            if (this._helpWindow) this._helpWindow.clear();
            if (BattleManager.clearInputtingAction) BattleManager.clearInputtingAction();
            this.jakeMSGOnNestedCancel();
            return;
        }
        _SB_onItemCancel.call(this);
    };

    var _SB_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        if (this._jakeMSGNestedWindow && this._jakeMSGNestedWindow.active) return true;
        return _SB_isAnyInputWindowActive.call(this);
    };

    var _SB_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        Input.jakeMSGResetHotkeys();
        this.jakeMSGResetCommandFlow();
        _SB_startActorCommandSelection.call(this);
    };

    var _SB_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        Input.jakeMSGResetHotkeys();
        this.jakeMSGResetCommandFlow();
        _SB_startPartyCommandSelection.call(this);
    };

    var _SB_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        Input.jakeMSGClearTriggered();
        $.loadParameters();
        $.refreshAllActorsFromParams();
        _SB_start.call(this);
    };

    //-------------------------------------------------------------------------
    // Hotkey processing
    //-------------------------------------------------------------------------

    Scene_Battle.prototype.jakeMSGCanProcessHotkeys = function() {
        if (!BattleManager.isInputting()) return false;
        if ($.sceneMessageIsBusy(this)) return false;
        if (this._actorWindow && this._actorWindow.active) return false;
        if (this._enemyWindow && this._enemyWindow.active) return false;
        if (this._bamRootWindow && this._bamRootWindow.active) return false;
        if (this._bamAutoWindow && this._bamAutoWindow.active) return false;
        if (this._inBattleStateList && this._inBattleStateList.active) return false;
        if (this._enemyInBattleStateList && this._enemyInBattleStateList.active) return false;
        if (this._fieldEffectsListWindow && this._fieldEffectsListWindow.active) return false;
        if (this._partyPassivesForAllListWindow && this._partyPassivesForAllListWindow.active) return false;
        if (this._enemyPassivesForAllListWindow && this._enemyPassivesForAllListWindow.active) return false;
        return !!(this._partyCommandWindow.active || this._actorCommandWindow.active ||
            (this._skillWindow && this._skillWindow.active) ||
            (this._itemWindow && this._itemWindow.active) ||
            (this._jakeMSGNestedWindow && this._jakeMSGNestedWindow.active));
    };

    $.findHotkeyInTree = function(commands, keyCode, user, path, context, allowDisabled) {
        if (!commands) return null;
        path = path || [];
        keyCode = Number(keyCode);
        for (var i = 0; i < commands.length; i++) {
            var cmd = commands[i];
            if (!cmd || !cmd.isVisible(user)) continue;
            var next = path.concat([cmd]);
            var enabled = $.commandEnabledInContext(cmd, user, context);
            if ($.commandHotkey(cmd) === keyCode) {
                if (enabled || allowDisabled) return next;
            }
            if (!enabled && !allowDisabled) continue;
            var found = this.findHotkeyInTree(this.commandChildren(cmd), keyCode, user, next, context, allowDisabled);
            if (found) return found;
        }
        return null;
    };

    $.findHotkeyMatch = function(commands, keyCode, user, context) {
        var path = this.findHotkeyInTree(commands, keyCode, user, [], context, false);
        if (path) return { path: path };
        path = this.findHotkeyInTree(commands, keyCode, user, [], context, true);
        if (path) return { blocked: true, path: path };
        return null;
    };

    Scene_Battle.prototype.jakeMSGFindHotkey = function(keyCode) {
        var user;
        if (this._partyCommandWindow && this._partyCommandWindow.active && !BattleManager.actor()) {
            user = $.evalUser();
            var partyMatch = $.findHotkeyMatch($.getPartyMenuCommands(), keyCode, user, 'party');
            if (partyMatch && partyMatch.path && !partyMatch.blocked) {
                return { scope: 'party', path: partyMatch.path };
            }
            if (partyMatch && partyMatch.blocked) return { blocked: true };
            return null;
        }
        var actor = BattleManager.actor();
        if (!actor) return null;
        user = actor;
        var actorMatch = $.findHotkeyMatch(actor.battleCommands(), keyCode, user, 'actor');
        if (actorMatch && actorMatch.path && !actorMatch.blocked) {
            return { scope: 'actor', path: actorMatch.path };
        }
        var blocked = !!(actorMatch && actorMatch.blocked);
        var skills = actor.skills();
        for (var i = 0; i < skills.length; i++) {
            var skill = skills[i];
            var subs = $.getSkillSubcommands(skill);
            if (!subs.length) continue;
            var sm = $.findHotkeyMatch(subs, keyCode, user, 'actor');
            if (!sm) continue;
            if (sm.path && !sm.blocked && $.userCanUseSkill(actor, skill)) {
                return { scope: 'skill', skill: skill, path: sm.path };
            }
            blocked = true;
        }
        if (blocked) return { blocked: true };
        return null;
    };

    Scene_Battle.prototype.jakeMSGTriggerHotkey = function(info) {
        if (!info || info.blocked || !info.path || !info.path.length) {
            SoundManager.playBuzzer();
            return true;
        }
        var path = info.path;
        var leaf = path[path.length - 1];
        var parents = path.slice(0, path.length - 1);
        var state = this.jakeMSGCaptureUiState();
        var user = BattleManager.actor() || $.evalUser();
        var context = info.scope === 'party' ? 'party' : 'actor';
        if (info.scope === 'skill' && info.skill && !$.userCanUseSkill(user, info.skill)) {
            SoundManager.playBuzzer();
            return true;
        }
        if (!$.commandEnabledInContext(leaf, user, context)) {
            SoundManager.playBuzzer();
            return true;
        }
        this._jakeMSGEffectParents = [];
        if (info.scope === 'skill' && info.skill) {
            $.evalBeforeSubcommandMenu(user, info.skill);
            this.jakeMSGPushEffectParent(this.jakeMSGParentFromSkill(info.skill));
        }
        for (var i = 0; i < parents.length; i++) {
            this.jakeMSGPushEffectParent(this.jakeMSGParentFromCmd(parents[i]));
        }
        var children = leaf.visibleChildren(user);
        if (!children.length && $.normalizeActorSymbol(leaf.symbol()) === 'use_skill' &&
            $.skillHasSubcommands(leaf.ext())) {
            var sk = $dataSkills[Math.floor(leaf.ext())];
            if (!(info.skill && sk && info.skill.id === sk.id)) {
                $.evalBeforeSubcommandMenu(user, sk);
                this.jakeMSGPushEffectParent(this.jakeMSGParentFromSkill(sk));
            }
            children = $.getSkillSubcommands(sk);
        }
        if (children.length > 0) {
            this._jakeMSGVisualStack = this._jakeMSGVisualStack || [];
            this._jakeMSGVisualStack.push({ kind: 'hotkey', state: state, popEffect: false });
            if (this._skillWindow) {
                this._skillWindow.hide();
                this._skillWindow.deactivate();
            }
            if (this._itemWindow) {
                this._itemWindow.hide();
                this._itemWindow.deactivate();
            }
            if (this._actorCommandWindow) this._actorCommandWindow.deactivate();
            if (this._partyCommandWindow) this._partyCommandWindow.deactivate();
            this.jakeMSGHideNested();
            this.jakeMSGPushEffectParent(this.jakeMSGParentFromCmd(leaf));
            this.jakeMSGOpenNested(children, user, context);
            return true;
        }
        this.jakeMSGDeactivateInputWindows();
        if (info.scope === 'party') {
            this.jakeMSGInvokePartyCommand(leaf);
            return true;
        }
        this.jakeMSGCommitLeaf(leaf);
        return true;
    };

    Scene_Battle.prototype.jakeMSGBattleHotkeyWindows = function() {
        return [
            this._jakeMSGNestedWindow,
            this._actorCommandWindow,
            this._partyCommandWindow
        ];
    };

    Scene_Battle.prototype.jakeMSGUpdateHotkeys = function() {
        if (this._jakeMSGHotkeyFrame === Graphics.frameCount) return false;
        this._jakeMSGHotkeyFrame = Graphics.frameCount;
        if (!this.jakeMSGCanProcessHotkeys()) return false;
        var codes = Input.jakeMSGTriggeredCodes();
        if (!codes.length) return false;
        for (var i = 0; i < codes.length; i++) {
            var code = codes[i];
            var user = BattleManager.actor() || $.evalUser();
            var windows = this.jakeMSGBattleHotkeyWindows();
            for (var w = 0; w < windows.length; w++) {
                var win = windows[w];
                var ctx = 'actor';
                if (win && win._jakeMSGContext) ctx = win._jakeMSGContext;
                else if (win === this._partyCommandWindow) ctx = 'party';
                if ($.tryHotkeyOnCommandWindow(win, code, user, ctx)) {
                    Input.jakeMSGClearTriggered();
                    return true;
                }
            }
            var info = this.jakeMSGFindHotkey(code);
            if (info) {
                Input.jakeMSGConsumeInput(code);
                Input.jakeMSGClearTriggered();
                if (info.blocked) {
                    SoundManager.playBuzzer();
                    return true;
                }
                return this.jakeMSGTriggerHotkey(info);
            }
        }
        Input.jakeMSGClearTriggered();
        return false;
    };

    var _SB_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        this.jakeMSGUpdateHotkeys();
        _SB_update.call(this);
    };

    var _SM_updateScene = SceneManager.updateScene;
    SceneManager.updateScene = function() {
        if (this._scene && typeof this._scene.jakeMSGUpdateHotkeys === 'function' &&
                this.isCurrentSceneStarted()) {
            this._scene.jakeMSGUpdateHotkeys();
        }
        _SM_updateScene.call(this);
    };

    //-------------------------------------------------------------------------
    // Map Skills (Cancel menu Skills screen)
    //-------------------------------------------------------------------------

    Window_SkillType.prototype.jakeMSGMapCmd = function() {
        var ext = this.currentExt();
        return (ext && typeof ext.symbol === 'function') ? ext : null;
    };

    var _WST_makeCommandList = Window_SkillType.prototype.makeCommandList;
    Window_SkillType.prototype.makeCommandList = function() {
        if (this._actor && $.hasActorMapSkills(this._actor)) {
            this._jakeMSGMapMode = true;
            var cmds = $.getActorMapSkills(this._actor);
            var actor = this._actor;
            for (var i = 0; i < cmds.length; i++) {
                var cmd = cmds[i];
                if (!cmd || !cmd.isVisible(actor)) continue;
                var symbol = $.normalizeActorSymbol(cmd.symbol());
                if (symbol === 'skill_list' && cmd.visibleChildren(actor).length === 0) {
                    var skillTypes = actor.addedSkillTypes();
                    skillTypes.sort(function(a, b) { return a - b; });
                    skillTypes.forEach(function(stypeId) {
                        if (actor.isSkillTypeHidden && actor.isSkillTypeHidden(stypeId)) return;
                        var name = $dataSystem.skillTypes[stypeId];
                        var stCmd = ABC.makeCommand('skill_type', stypeId);
                        stCmd.setName(name);
                        this.addCommand(name, 'skill_type',
                            $.commandEnabledInContext(stCmd, actor, 'map'), stCmd);
                    }, this);
                    continue;
                }
                this.addCommand($.commandDisplayName(cmd), cmd.symbol(),
                    $.commandEnabledInContext(cmd, actor, 'map'), cmd);
            }
            return;
        }
        this._jakeMSGMapMode = false;
        _WST_makeCommandList.call(this);
    };

    var _WST_update = Window_SkillType.prototype.update;
    Window_SkillType.prototype.update = function() {
        if (this._jakeMSGMapMode) {
            Window_Command.prototype.update.call(this);
            if (this._skillWindow && !this._skillWindow._jakeMSGMapCommands) {
                var cmd = this.jakeMSGMapCmd();
                if (cmd && $.normalizeActorSymbol(cmd.symbol()) === 'skill_type') {
                    this._skillWindow.setStypeId(Math.floor(cmd.ext()));
                }
            }
            return;
        }
        _WST_update.call(this);
    };

    var _WST_drawItem = Window_SkillType.prototype.drawItem;
    Window_SkillType.prototype.drawItem = function(index) {
        if (this._jakeMSGMapMode) {
            var rect = this.itemRectForText(index);
            var ext = this._list[index] && this._list[index].ext;
            this.resetTextColor();
            this.changePaintOpacity(this.isCommandEnabled(index));
            if (ext && typeof ext.symbol === 'function' &&
                    $.normalizeActorSymbol(ext.symbol()) === 'use_skill') {
                $.drawUseSkillCommand(this, ext, this._actor, rect, true);
            } else {
                this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'left');
            }
            this.changePaintOpacity(true);
            return;
        }
        _WST_drawItem.call(this, index);
    };

    var _WST_updateHelp = Window_SkillType.prototype.updateHelp;
    Window_SkillType.prototype.updateHelp = function() {
        if (this._jakeMSGMapMode) {
            $.applyMapRootHelp(this._helpWindow, this.jakeMSGMapCmd(), this._actor, this);
            return;
        }
        if (_WST_updateHelp) _WST_updateHelp.call(this);
        else Window_Command.prototype.updateHelp.call(this);
    };

    var _WST_callOkHandler = Window_SkillType.prototype.callOkHandler;
    Window_SkillType.prototype.callOkHandler = function() {
        var scene = SceneManager._scene;
        if (this._jakeMSGMapMode && scene && scene.jakeMSGHandleMapSkill) {
            scene.jakeMSGHandleMapSkill(this.jakeMSGMapCmd(), 'type');
            return;
        }
        _WST_callOkHandler.call(this);
    };

    Window_SkillType.prototype.costWidth = function() {
        return this.textWidth('000');
    };
    $.mixSkillListCostDrawers(Window_SkillType.prototype);

    Window_SkillList.prototype.setJakeMSGMapCommands = function(commands, actor) {
        this._jakeMSGMapCommands = commands || [];
        if (actor) this._actor = actor;
        this.refresh();
        this.resetScroll();
    };

    Window_SkillList.prototype.clearJakeMSGMapCommands = function() {
        if (this._jakeMSGMapCommands == null) return;
        this._jakeMSGMapCommands = null;
        this.refresh();
    };

    var _WSL_makeItemList = Window_SkillList.prototype.makeItemList;
    Window_SkillList.prototype.makeItemList = function() {
        if (this._jakeMSGMapCommands) {
            this._data = [];
            var actor = this._actor;
            var cmds = this._jakeMSGMapCommands;
            for (var i = 0; i < cmds.length; i++) {
                var cmd = cmds[i];
                if (!cmd || !cmd.isVisible(actor)) continue;
                var symbol = $.normalizeActorSymbol(cmd.symbol());
                if (symbol === 'skill_list' && cmd.visibleChildren(actor).length === 0 && actor) {
                    var skillTypes = actor.addedSkillTypes();
                    skillTypes.sort(function(a, b) { return a - b; });
                    skillTypes.forEach(function(stypeId) {
                        if (actor.isSkillTypeHidden && actor.isSkillTypeHidden(stypeId)) return;
                        var name = $dataSystem.skillTypes[stypeId];
                        var stCmd = ABC.makeCommand('skill_type', stypeId);
                        stCmd.setName(name);
                        this._data.push(stCmd);
                    }, this);
                    continue;
                }
                this._data.push(cmd);
            }
            return;
        }
        _WSL_makeItemList.call(this);
    };

    var _WSL_isEnabled = Window_SkillList.prototype.isEnabled;
    Window_SkillList.prototype.isEnabled = function(item) {
        if (this._jakeMSGMapCommands) {
            if (!item || typeof item.symbol !== 'function') return false;
            return $.commandEnabledInContext(item, this._actor, 'map');
        }
        return _WSL_isEnabled.call(this, item);
    };

    var _WSL_drawItem = Window_SkillList.prototype.drawItem;
    Window_SkillList.prototype.drawItem = function(index) {
        if (this._jakeMSGMapCommands) {
            var cmd = this._data[index];
            if (!cmd) return;
            var rect = this.itemRect(index);
            rect.width -= this.textPadding();
            this.changePaintOpacity(this.isEnabled(cmd));
            if (typeof cmd.symbol === 'function' &&
                    $.normalizeActorSymbol(cmd.symbol()) === 'use_skill') {
                $.drawUseSkillCommand(this, cmd, this._actor, rect);
            } else {
                this.drawText($.commandDisplayName(cmd), rect.x + this.textPadding(),
                    rect.y, rect.width);
            }
            this.changePaintOpacity(true);
            return;
        }
        _WSL_drawItem.call(this, index);
    };

    var _WSL_updateHelp = Window_SkillList.prototype.updateHelp;
    Window_SkillList.prototype.updateHelp = function() {
        if (this._jakeMSGMapCommands) {
            if (!this._helpWindow) return;
            this._helpWindow.show();
            var info = $.helpInfoForCommand(this.item());
            if (!info) {
                this._helpWindow.clear();
                return;
            }
            if (info.item) this._helpWindow.setItem(info.item);
            else this._helpWindow.setText(info.text);
            return;
        }
        _WSL_updateHelp.call(this);
    };

    Scene_Skill.prototype.jakeMSGUsingMapSkills = function() {
        return !!(this.actor() && $.hasActorMapSkills(this.actor()));
    };

    Scene_Skill.prototype.jakeMSGSyncSkillList = function() {
        if (this._helpWindow) this._helpWindow.show();
        if (!this._itemWindow) return;
        this._itemWindow.show();
        if (!this.jakeMSGUsingMapSkills()) return;
        if (this._itemWindow._jakeMSGMapCommands) return;
        var cmd = this._skillTypeWindow && this._skillTypeWindow.jakeMSGMapCmd();
        if (cmd && $.normalizeActorSymbol(cmd.symbol()) === 'skill_type') {
            this._itemWindow.setStypeId(Math.floor(cmd.ext()));
            return;
        }
        var actor = this.actor();
        if (!actor) return;
        var types = actor.addedSkillTypes();
        if (!types || !types.length) return;
        var current = this._itemWindow._stypeId;
        var has = false;
        for (var i = 0; i < types.length; i++) {
            if (types[i] === current) { has = true; break; }
        }
        if (!has) {
            types = types.slice().sort(function(a, b) { return a - b; });
            this._itemWindow.setStypeId(types[0]);
        }
    };

    Scene_Skill.prototype.jakeMSGActivateMapSource = function(source) {
        if (source === 'list' && this._itemWindow) {
            this._itemWindow.show();
            this._itemWindow.activate();
            if (this._itemWindow.updateHelp) this._itemWindow.updateHelp();
            return;
        }
        if (this._skillTypeWindow) {
            this._skillTypeWindow.activate();
            this._skillTypeWindow.updateHelp();
        }
    };

    var _SS_createSkillTypeWindow = Scene_Skill.prototype.createSkillTypeWindow;
    Scene_Skill.prototype.createSkillTypeWindow = function() {
        _SS_createSkillTypeWindow.call(this);
        this._skillTypeWindow.setHandler('cancel', this.jakeMSGOnMapTypeCancel.bind(this));
    };

    Scene_Skill.prototype.jakeMSGOnMapTypeCancel = function() {
        this.popScene();
    };

    Scene_Skill.prototype.jakeMSGEnterMapSubmenu = function(children, skillForBefore) {
        this._jakeMSGMapStack = this._jakeMSGMapStack || [];
        var list = this._itemWindow;
        if (list && list._jakeMSGMapCommands) {
            this._jakeMSGMapStack.push({
                commands: list._jakeMSGMapCommands,
                index: list.index()
            });
        } else {
            this._jakeMSGMapStack.push({ commands: null });
        }
        if (skillForBefore) $.evalBeforeSubcommandMenu(this.actor(), skillForBefore);
        if (this._skillTypeWindow) this._skillTypeWindow.deactivate();
        list.setJakeMSGMapCommands(children, this.actor());
        list.show();
        list.activate();
        list.select(0);
        if (list.updateHelp) list.updateHelp();
    };

    Scene_Skill.prototype.jakeMSGHandleMapSkill = function(cmd, source) {
        if (!cmd) {
            SoundManager.playBuzzer();
            this.jakeMSGActivateMapSource(source);
            return;
        }
        var actor = this.actor();
        if (!$.commandEnabledInContext(cmd, actor, 'map')) {
            SoundManager.playBuzzer();
            this.jakeMSGActivateMapSource(source);
            return;
        }
        var symbol = $.normalizeActorSymbol(cmd.symbol());
        var children = cmd.visibleChildren(actor);
        if (children.length) {
            this.jakeMSGEnterMapSubmenu(children);
            return;
        }
        if (symbol === 'use_skill' && $.skillHasSubcommands(cmd.ext())) {
            var sk = $dataSkills[Math.floor(cmd.ext())];
            this.jakeMSGEnterMapSubmenu($.getSkillSubcommands(sk), sk);
            return;
        }
        if (symbol === 'skill_type') {
            if (this._itemWindow) {
                this._itemWindow.show();
                this._itemWindow.setStypeId(Math.floor(cmd.ext()));
            }
            if (source === 'list') {
                this._jakeMSGMapStack = this._jakeMSGMapStack || [];
                this._jakeMSGMapStack.push({
                    commands: this._itemWindow._jakeMSGMapCommands,
                    index: this._itemWindow.index()
                });
                this._itemWindow._jakeMSGMapCommands = null;
                this._itemWindow.refresh();
                this.commandSkill();
            } else {
                this.commandSkill();
            }
            return;
        }
        if (symbol === 'item') {
            SceneManager.push(Scene_Item);
            return;
        }
        if (symbol === 'change_equip') {
            SceneManager.push(Scene_Equip);
            return;
        }
        if (symbol === 'use_skill') {
            var skill = $dataSkills[Math.floor(cmd.ext())];
            if (!$.userCanUseSkill(actor, skill)) {
                SoundManager.playBuzzer();
                this.jakeMSGActivateMapSource(source);
                return;
            }
            this._jakeMSGMapSkillItem = skill;
            this.actor().setLastMenuSkill(skill);
            this.determineItem();
            return;
        }
        SoundManager.playBuzzer();
        this.jakeMSGActivateMapSource(source);
    };

    var _SS_item = Scene_Skill.prototype.item;
    Scene_Skill.prototype.item = function() {
        if (this._jakeMSGMapSkillItem) return this._jakeMSGMapSkillItem;
        return _SS_item.call(this);
    };

    var _SS_onItemOk = Scene_Skill.prototype.onItemOk;
    Scene_Skill.prototype.onItemOk = function() {
        if (this.jakeMSGUsingMapSkills() && this._itemWindow && this._itemWindow._jakeMSGMapCommands) {
            this.jakeMSGHandleMapSkill(this._itemWindow.item(), 'list');
            return;
        }
        _SS_onItemOk.call(this);
    };

    var _SIB_activateItemWindow = Scene_ItemBase.prototype.activateItemWindow;
    Scene_ItemBase.prototype.activateItemWindow = function() {
        var scene = SceneManager._scene;
        if (scene instanceof Scene_Skill && scene._jakeMSGMapSkillItem) {
            scene._jakeMSGMapSkillItem = null;
            if (scene._helpWindow) scene._helpWindow.show();
            if (scene._itemWindow) scene._itemWindow.show();
            if (scene._itemWindow && scene._itemWindow._jakeMSGMapCommands) {
                scene._itemWindow.activate();
                if (scene._itemWindow.updateHelp) scene._itemWindow.updateHelp();
                return;
            }
            if (scene._itemWindow) {
                scene._itemWindow.deselect();
                scene._itemWindow.deactivate();
            }
            if (scene._skillTypeWindow && scene._skillTypeWindow._jakeMSGMapMode) {
                scene._skillTypeWindow.activate();
                scene._skillTypeWindow.updateHelp();
                return;
            }
        }
        _SIB_activateItemWindow.call(this);
    };

    var _SS_onItemCancel = Scene_Skill.prototype.onItemCancel;
    Scene_Skill.prototype.onItemCancel = function() {
        this._jakeMSGMapSkillItem = null;
        if (this.jakeMSGUsingMapSkills() && this._jakeMSGMapStack && this._jakeMSGMapStack.length) {
            var prev = this._jakeMSGMapStack.pop();
            if (prev.commands) {
                this._itemWindow.setJakeMSGMapCommands(prev.commands, this.actor());
                this._itemWindow.select(prev.index);
                this._itemWindow.activate();
                if (this._itemWindow.updateHelp) this._itemWindow.updateHelp();
            } else {
                this._itemWindow.clearJakeMSGMapCommands();
                this._itemWindow.deselect();
                this._itemWindow.deactivate();
                this._skillTypeWindow.activate();
                this.jakeMSGSyncSkillList();
                this._skillTypeWindow.updateHelp();
            }
            return;
        }
        _SS_onItemCancel.call(this);
        if (this.jakeMSGUsingMapSkills()) this.jakeMSGSyncSkillList();
    };

    var _SS_onActorChange = Scene_Skill.prototype.onActorChange;
    Scene_Skill.prototype.onActorChange = function() {
        this._jakeMSGMapSkillItem = null;
        this._jakeMSGMapStack = [];
        if (this._itemWindow && this._itemWindow.clearJakeMSGMapCommands) {
            this._itemWindow.clearJakeMSGMapCommands();
        }
        _SS_onActorChange.call(this);
        if (this.jakeMSGUsingMapSkills()) this.jakeMSGSyncSkillList();
    };

    var _SS_refreshActor = Scene_Skill.prototype.refreshActor;
    Scene_Skill.prototype.refreshActor = function() {
        _SS_refreshActor.call(this);
        if (this.jakeMSGUsingMapSkills()) this.jakeMSGSyncSkillList();
    };

    var _SS_start = Scene_Skill.prototype.start;
    Scene_Skill.prototype.start = function() {
        Input.jakeMSGClearTriggered();
        _SS_start.call(this);
    };

    Scene_Skill.prototype.jakeMSGCanProcessHotkeys = function() {
        if (!this.jakeMSGUsingMapSkills()) return false;
        if (this._actorWindow && this._actorWindow.active) return false;
        if ($.sceneMessageIsBusy(this)) return false;
        return !!(
            (this._skillTypeWindow && this._skillTypeWindow.active) ||
            (this._itemWindow && this._itemWindow.active)
        );
    };

    Scene_Skill.prototype.jakeMSGFindHotkey = function(keyCode) {
        var actor = this.actor();
        if (!actor) return null;
        var match = $.findHotkeyMatch($.getActorMapSkills(actor), keyCode, actor, 'map');
        if (!match) return null;
        if (match.blocked) return { blocked: true };
        return { path: match.path };
    };

    Scene_Skill.prototype.jakeMSGTriggerHotkey = function(info) {
        if (!info || info.blocked || !info.path || !info.path.length) {
            SoundManager.playBuzzer();
            return true;
        }
        var path = info.path;
        var leaf = path[path.length - 1];
        var user = this.actor();
        if (!$.commandEnabledInContext(leaf, user, 'map')) {
            SoundManager.playBuzzer();
            return true;
        }
        var children = leaf.visibleChildren ? leaf.visibleChildren(user) : [];
        if (!children.length && $.normalizeActorSymbol(leaf.symbol()) === 'use_skill' &&
                $.skillHasSubcommands(leaf.ext())) {
            var sk = $dataSkills[Math.floor(leaf.ext())];
            this.jakeMSGEnterMapSubmenu($.getSkillSubcommands(sk), sk);
            return true;
        }
        if (children.length > 0) {
            this.jakeMSGEnterMapSubmenu(children);
            return true;
        }
        this.jakeMSGHandleMapSkill(leaf, this._itemWindow && this._itemWindow.active ? 'list' : 'type');
        return true;
    };

    Scene_Skill.prototype.jakeMSGUpdateHotkeys = function() {
        if (this._jakeMSGHotkeyFrame === Graphics.frameCount) return false;
        this._jakeMSGHotkeyFrame = Graphics.frameCount;
        if (!this.jakeMSGCanProcessHotkeys()) return false;
        var codes = Input.jakeMSGTriggeredCodes();
        if (!codes.length) return false;
        for (var i = 0; i < codes.length; i++) {
            var code = codes[i];
            if ($.tryHotkeyOnCommandWindow(this._skillTypeWindow, code, this.actor(), 'map')) {
                Input.jakeMSGClearTriggered();
                return true;
            }
            if ($.tryHotkeyOnCommandWindow(this._itemWindow, code, this.actor(), 'map')) {
                Input.jakeMSGClearTriggered();
                return true;
            }
            var info = this.jakeMSGFindHotkey(code);
            if (info) {
                Input.jakeMSGConsumeInput(code);
                Input.jakeMSGClearTriggered();
                if (info.blocked) {
                    SoundManager.playBuzzer();
                    return true;
                }
                return this.jakeMSGTriggerHotkey(info);
            }
        }
        Input.jakeMSGClearTriggered();
        return false;
    };

})(JakeMSG.BattleReorderAndCategorizeCommands);

//=============================================================================
// Plugin Parameter structs (BRCCCmd2 ... BRCCCmd100 live here so they do not
// crowd the header. The Plugin Manager still reads them from this file.)
//=============================================================================

/*~struct~BRCCActor:
 * @param ID
 * @type actor
 * @default 0
 *
 * @param Battle Commands
 * @type struct<BRCCActorCmd>[]
 * @desc Un-nested actor commands. No Description field (that list never shows the skill help window). Nested Commands still can.
 * @default []
*/

/*~struct~BRCCActorCmd:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @desc JS formula. a = battler, s = switches, v = variables. Empty = always enabled.
 * @default
 *
 * @param IsVisible
 * @desc JS formula. a = battler, s = switches, v = variables. Empty = always visible.
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @desc Keyboard keycode. 0 = none.
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true. a = battler.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true. a = battler.
 * @default true
 *
 * @param Nested Commands
 * @type struct<BRCCCmd2>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCMapActor:
 * @param ID
 * @type actor
 * @default 0
 *
 * @param Map Skills
 * @type struct<BRCCMapCmd>[]
 * @desc Un-nested map skills. No Description field (that list never shows the skill help window). Nested Commands still can.
 * @default []
*/

/*~struct~BRCCMapCmd:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @desc JS formula. a = battler, s = switches, v = variables. Empty = always enabled.
 * @default
 *
 * @param IsVisible
 * @desc JS formula. a = battler, s = switches, v = variables. Empty = always visible.
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @desc Keyboard keycode. 0 = none.
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true. a = battler.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true. a = battler.
 * @default true
 *
 * @param Nested Commands
 * @type struct<BRCCCmd2>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested map skills. Used after Nested Commands if both are set. <map skill> (also <actor map skill>).
 * @default
*/

/*~struct~BRCCSkill:
 * @param ID
 * @type skill
 * @default 0
 *
 * @param Battle Subcommands
 * @type struct<BRCCCmd>[]
 * @default []
*/

/*~struct~BRCCCmd:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @desc JS formula. a = battler, s = switches, v = variables. Empty = always enabled.
 * @default
 *
 * @param IsVisible
 * @desc JS formula. a = battler, s = switches, v = variables. Empty = always visible.
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @desc Keyboard keycode. 0 = none.
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true. a = battler.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true. a = battler.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text for nested commands / subcommands. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd2>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd2:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd3>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd3:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd4>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd4:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd5>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd5:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd6>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd6:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd7>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd7:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd8>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd8:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd9>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd9:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd10>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd10:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd11>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd11:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd12>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd12:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd13>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd13:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd14>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd14:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd15>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd15:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd16>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd16:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd17>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd17:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd18>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd18:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd19>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd19:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd20>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd20:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd21>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd21:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd22>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd22:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd23>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd23:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd24>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd24:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd25>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd25:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd26>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd26:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd27>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd27:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd28>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd28:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd29>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd29:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd30>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd30:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd31>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd31:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd32>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd32:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd33>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd33:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd34>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd34:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd35>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd35:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd36>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd36:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd37>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd37:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd38>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd38:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd39>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd39:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd40>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd40:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd41>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd41:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd42>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd42:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd43>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd43:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd44>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd44:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd45>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd45:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd46>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd46:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd47>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd47:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd48>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd48:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd49>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd49:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd50>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd50:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd51>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd51:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd52>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd52:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd53>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd53:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd54>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd54:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd55>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd55:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd56>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd56:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd57>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd57:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd58>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd58:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd59>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd59:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd60>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd60:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd61>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd61:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd62>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd62:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd63>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd63:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd64>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd64:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd65>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd65:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd66>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd66:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd67>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd67:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd68>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd68:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd69>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd69:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd70>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd70:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd71>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd71:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd72>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd72:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd73>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd73:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd74>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd74:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd75>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd75:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd76>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd76:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd77>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd77:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd78>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd78:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd79>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd79:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd80>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd80:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd81>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd81:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd82>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd82:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd83>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd83:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd84>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd84:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd85>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd85:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd86>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd86:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd87>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd87:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd88>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd88:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd89>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd89:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd90>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd90:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd91>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd91:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd92>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd92:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd93>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd93:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd94>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd94:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd95>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd95:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd96>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd96:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd97>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd97:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd98>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd98:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd99>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd99:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands
 * @type struct<BRCCCmd100>[]
 * @default []
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Notetag-format nested commands. Used after Nested Commands if both are set. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/

/*~struct~BRCCCmd100:
 * @param Name
 * @default
 *
 * @param Symbol
 * @default
 *
 * @param Ext
 * @default
 *
 * @param IsEnabled
 * @default
 *
 * @param IsVisible
 * @default
 *
 * @param Hotkey
 * @type number
 * @min 0
 * @default 0
 *
 * @param Show Skill Icon
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Show Skill Cost
 * @desc For use_skill: true/false or JS formula. Default true.
 * @default true
 *
 * @param Description
 * @type note
 * @desc Help text. Empty = skill description for use_skill (if any), otherwise no help window. Use \n for new lines.
 * @default
 *
 * @param Nested Commands (Text)
 * @type note
 * @desc Nest further with notetag text. <battle command>, <battle subcommand>, or <battle menu option>.
 * @default
*/
