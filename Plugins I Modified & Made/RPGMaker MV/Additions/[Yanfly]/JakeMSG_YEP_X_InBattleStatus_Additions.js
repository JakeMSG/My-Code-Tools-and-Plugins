//=============================================================================
// Addition to YEP plugin "YEP_X_InBattleStatus", made by JakeMSG
// JakeMSG_YEP_X_InBattleStatus_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_X_InBattleStatus_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.InBattleStatus_JakeMSGAdd = Yanfly.InBattleStatus_JakeMSGAdd || {};
Yanfly.InBattleStatus_JakeMSGAdd.version = 1.4;

//=============================================================================
 /*:
 * @plugindesc v1.4 (Requires YEP_X_InBattleStatus.js) Adds an Enemy Status 
 * command to view enemy troop status effects, buffs, and debuffs.
 * @author JakeMSG
 * v1.4
 * 
============ Change Log ============
1.4 - 7.10th.2026
 * Added YEP_StatusMenuCore sub-menu cycling in ally and enemy in-battle status.
 * Added configurable small overlay text on in-battle status windows.
 * Enabled Status Menu extension notetags on enemy database entries.
1.3 - 6.19th.2026
 * Added parameters/notetags to show/hide enemy TP gauge.
 * Enabled HP/MP/TP show/hide notetags also for actors (not just for enemies) in ally In-Battle Status window.
1.2 - 6.1st.2026
 * Added option to group the in battle status commands together in the Party Command Window (via Plugin Parameters)
 * Made scrolling through the enemy status menu a bit more intuitive
1.1 - 3.16th.2026
 * Added compatibility for YEP_AbsorptionBarrier.
 * Added parameters to show/hide enemy HP and MP gauges.
 * Added notetags to show/hide enemy HP and MP gauges for specific enemies.
1.0 - 2.27th.2026
 * initial release
====================================
 *
 * @param ---All Status Commands (Ally+Enemy)---
 * @default
 * 
 * @param Group the Status Commands
 * @parent ---All Status Commands (Ally+Enemy)---
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Whether to group the in battle status commands together in the Party Command Window.
 * NO - false     YES - true
 * @default true
 * 
 * @param Parent Status Command Text
 * @parent ---All Status Commands (Ally+Enemy)---
 * @desc (only if "Group the Status Commands" is true) Text used for parent status command.
 * @default Status
 * 
 * @param Key for Cycling shown Menu for the Battler
 * @parent ---All Status Commands (Ally+Enemy)---
 * @text Key for Cycling shown Menu for the Battler
 * @type number
 * @min -9999
 * @max 9999
 * @default 221
 * @desc Key to press to Cycling the shown Menu for the Battler (Needs to be the Keycode number for it) (Default = 221 ( "]" sign))
 * 
 * @param Battler Menus Cycling Order
 * @parent ---All Status Commands (Ally+Enemy)---
 * @desc This is the order in which the battler menus will cycle through, the first one being the one shown initially. Use a space to separate the individual commands.
 * @default General Elements States Attributes Custom Cancel
 * 
 * @param -- Small set text added to the In-Battle Status Window --
 * @parent ---All Status Commands (Ally+Enemy)---
 * @type select
 * @option Yes
 * @value Yes
 * @option No
 * @value No
 * @desc Whether to show a custom small set text message within the In-Battle Status Window
 * (for example, to let the player know of keybindings for Description Expansion)
 * (The rest of the sub-parameters under this one require this one to be set to "Yes" to function)
 * @default Yes
 * 
 * @param Text to show
 * @parent -- Small set text added to the In-Battle Status Window --
 * @desc The custom small set text to show within the In-Battle Status Window (requires parent set to Yes)
 * @default "']' Key to Cycle through Menus"
 * 
 * 
 * @param Text position within the In-Battle Status Window
 * @parent -- Small set text added to the In-Battle Status Window --
 * @type select
 * @option Top-Left
 * @value Top-Left
 * @option Top-Right
 * @value Top-Right
 * @option Bottom-Left
 * @value Bottom-Left
 * @option Bottom-Right
 * @value Bottom-Right
 * @desc The position of the small text to show within the In-Battle Status Window.
 * @default Bottom-Right
 *
 * @param Text color
 * @parent -- Small set text added to the In-Battle Status Window --
 * @desc The text color (CSS/hex, e.g. #1a90b3) for this small text.
 * @default #1a90b3
 *
 * @param Text size
 * @parent -- Small set text added to the In-Battle Status Window --
 * @desc The font size for this small text.
 * @default 20
 *
 * @param Text font
 * @parent -- Small set text added to the In-Battle Status Window --
 * @desc The font family for this element text.
 * @default GameFont
 *
 * @param X offset
 * @parent -- Small set text added to the In-Battle Status Window --
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 * @desc Pixel offset applied to the horizontal position of the small text overlay.
 *
 * @param Y offset
 * @parent -- Small set text added to the In-Battle Status Window --
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 * @desc Pixel offset applied to the vertical position of the small text overlay.
 * 
 * 
 * 
 * @param ---General Enemy Status---
 * @default
 *
 * @param Enemy Command Text
 * @parent ---General Enemy Status---
 * @desc The text used for 'Enemy Status' command text in the Party Window.
 * @default Enemy Status
 *
 * @param Show Enemy Command
 * @parent ---General Enemy Status---
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the in battle 'Enemy Status' command by default?
 * NO - false     YES - true
 * @default true
 *
 * @param Enemy Window X
 * @parent ---General Enemy Status---
 * @desc The default X location used for the in-battle enemy status window.
 * You can use formulas.
 * @default 0
 *
 * @param Enemy Window Y
 * @parent ---General Enemy Status---
 * @desc The default Y location used for the in-battle enemy status window.
 * You can use formulas.
 * @default this.fittingHeight(2)
 *
 * @param Enemy Window Width
 * @parent ---General Enemy Status---
 * @desc The default width used for the in-battle enemy status window.
 * You can use formulas.
 * @default Graphics.boxWidth
 *
 * @param Enemy Window Height
 * @parent ---General Enemy Status---
 * @desc The default height used for the in-battle enemy status window.
 * You can use formulas.
 * @default Graphics.boxHeight - this.fittingHeight(2) - this.fittingHeight(4)
 *
 * @param ---Enemy Status List---
 * @default
 *
 * @param Enemy Status Width
 * @parent ---Enemy Status List---
 * @desc The width of the enemy status list.
 * You can use formulas.
 * @default Math.max(312, Graphics.boxWidth / 4);
 *
 * @param Enemy Healthy Icon
 * @parent ---Enemy Status List---
 * @type number
 * @desc Icon ID used to indicate the enemy is healthy (no states).
 * @default 127
 *
 * @param Enemy Healthy Text
 * @parent ---Enemy Status List---
 * @desc Text used to label the enemy healthy status.
 * @default Healthy
 *
 * @param Enemy Healthy Help
 * @parent ---Enemy Status List---
 * @desc Text displayed in help window when enemy is selected as healthy.
 * @default Enemy is currently unaffected by status effects.
 *
 * @param ---Enemy Status Window---
 * @default
 *
 * @param Show Enemy HP
 * @parent ---Enemy Status Window---
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the enemy's HP in the status window by default?
 * NO - false     YES - true
 * @default true
 *
 * @param Show Enemy MP
 * @parent ---Enemy Status Window---
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the enemy's MP in the status window by default?
 * NO - false     YES - true
 * @default true
 *
 * @param Show Enemy TP
 * @parent ---Enemy Status Window---
 * @type boolean
 * @on Show
 * @off Hide
 * @desc Show the enemy's TP in the status window by default?
 * NO - false     YES - true
 * @default true
 * 
 * 
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_X_InBattleStatus.
 * Make sure this plugin is located under YEP_X_InBattleStatus in the plugin list.
 *
 * In battle, this plugin adds an 'Enemy Status' command to the Party Command 
 * Window. This allows players to view the status of each enemy in the troop,
 * including their current parameters, status effects, buffs, and debuffs.
 * The player can switch between enemies and view their effects in a help window.
 *
 * ============================================================================
 * Compatibility
 * ============================================================================
 *
 * This plugin has compatibility with YEP_AbsorptionBarrier. If you are using
 * YEP_AbsorptionBarrier, make sure this plugin is located under it in the
 * plugin list.
 *
 * For battler sub-menu cycling, this plugin integrates with YEP_StatusMenuCore
 * and its extensions when those plugins are present:
 *   YEP_StatusMenuCore
 *   YEP_X_ActorVariables
 *   YEP_X_BattleStatistics
 *   YEP_X_MoreStatusPages
 *   YEP_X_ProfileStatusPage
 *
 * Place this plugin under all of the above plugins in the Plugin Manager.
 *
 * ============================================================================
 * Battler Sub-Menu Cycling (Ally + Enemy Status)
 * ============================================================================
 *
 * While viewing a battler in either in-battle Status menu, press the key set in
 * the plugin parameter "Key for Cycling shown Menu for the Battler" to cycle
 * through the battler's available sub-menus.
 *
 * The default view is the "General" menu: the left list shows live status
 * effects/buffs/debuffs, and the right panel shows the battler's name, gauges,
 * and parameters.
 *
 * Other menus come from YEP_StatusMenuCore and its extensions. Configure which
 * menus appear and in what order with "Battler Menus Cycling Order". This works
 * like YEP_StatusMenuCore's "Command Order", except menus are cycled with a key
 * instead of a scrollable command list.
 *
 * Supported cycling tokens (space-separated):
 *   General, Elements, States, Attributes, Custom, Cancel
 *   Variables, Statistics, Profile, MorePages
 *   Individual More Status Page titles (from notetags)
 *
 * Notes:
 * - Cancel is ignored in battle.
 * - Parameters is excluded in battle (parameters are already on General).
 * - Custom expands into extension menus (Variables, Statistics, Profile, and
 *   any More Status Pages defined for the current battler).
 * - For allies, extension menus behave like the normal Status menu.
 * - For enemies, Actor-style Status Menu notetags also apply to Enemy database
 *   entries (Variables columns, Profile text/image, More Status Pages, etc.).
 * - Enemy Attributes omit actor-only traits (Pharmacology, EXP rate).
 * - Enemy Statistics omits actor-only battle log stats (battle count, K/D/A,
 *   damage/healing totals). If nothing applies, the menu is skipped.
 *
 * ============================================================================
 * Small Overlay Text
 * ============================================================================
 *
 * When "-- Small set text added to the In-Battle Status Window --" is Yes, a
 * small customizable hint is drawn on the in-battle status panel (ally or enemy).
 * Sub-parameters control the message, corner position, color, size, font, and
 * pixel offsets — the same pattern as JakeMSG_MoreDescriptionsWithConditions.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * You can use the following notetags to adjust how the in-battle status window
 * displays information for certain enemies.
 *
 * Actor/Enemy Notetags:
 *
 *   <Show Status HP>
 *   <Hide Status HP>
 *   - This will show or hide the HP gauge for the battler in the in-battle
 *   status window regardless of the default plugin settings.
 *
 *   <Show Status MP>
 *   <Hide Status MP>
 *   - This will show or hide the MP gauge for the battler in the in-battle
 *   status window regardless of the default plugin settings.
 *
 *   <Show Status TP>
 *   <Hide Status TP>
 *   - This will show or hide the TP gauge for the battler in the in-battle
 *   status window regardless of the default plugin settings.
 *
 * Enemy database entries also accept the Actor notetags from these plugins
 * (when installed) for sub-menu content:
 *   YEP_X_ActorVariables  — <Column x Variables: y>
 *   YEP_X_MoreStatusPages — <Status Menu Page: title> ... </Status Menu Page>
 *   YEP_X_ProfileStatusPage — <Profile Text>, <Profile Image: filename>, etc.
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * For those who would like to change whether the 'Enemy Status' option is shown 
 * or hidden midway through the game, you can use the following plugin commands:
 *
 * Plugin Commands:
 *
 *   ShowEnemyInBattleStatus
 *   - This will cause the 'Enemy Status' command to show.
 *
 *   HideEnemyInBattleStatus
 *   - This will cause the 'Enemy Status' command to not show.
 */
//=============================================================================

if (Imported.YEP_X_InBattleStatus) {

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('JakeMSG_YEP_X_InBattleStatus_Additions');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.EnemyIBSCmdName = String(Yanfly.Parameters['Enemy Command Text']);
Yanfly.Param.EnemyIBSCmdShow = eval(String(Yanfly.Parameters['Show Enemy Command']));
Yanfly.Param.EnemyIBSWinX = String(Yanfly.Parameters['Enemy Window X']);
Yanfly.Param.EnemyIBSWinY = String(Yanfly.Parameters['Enemy Window Y']);
Yanfly.Param.EnemyIBSWinWidth = String(Yanfly.Parameters['Enemy Window Width']);
Yanfly.Param.EnemyIBSWinHeight = String(Yanfly.Parameters['Enemy Window Height']);

Yanfly.Param.EnemyIBSStatusListWidth = String(Yanfly.Parameters['Enemy Status Width']);
Yanfly.Param.EnemyIBSHealthyIcon = Number(Yanfly.Parameters['Enemy Healthy Icon']);
Yanfly.Param.EnemyIBSHealthyText = String(Yanfly.Parameters['Enemy Healthy Text']);
Yanfly.Param.EnemyIBSHealthyHelp = String(Yanfly.Parameters['Enemy Healthy Help']);

Yanfly.Param.ShowEnemyHP = eval(String(Yanfly.Parameters['Show Enemy HP']));
Yanfly.Param.ShowEnemyMP = eval(String(Yanfly.Parameters['Show Enemy MP']));
Yanfly.Param.ShowEnemyTP = eval(String(Yanfly.Parameters['Show Enemy TP'] || 'true'));
Yanfly.Param.GroupStatusCommands =
  eval(String(Yanfly.Parameters['Group the Status Commands']));
Yanfly.Param.ParentStatusCmdText =
  String(Yanfly.Parameters['Parent Status Command Text'] || '');
if (!Yanfly.Param.ParentStatusCmdText ||
/^(?:true|false)$/i.test(Yanfly.Param.ParentStatusCmdText)) {
  Yanfly.Param.ParentStatusCmdText = Yanfly.Param.IBSCmdName || 'Status';
}

Yanfly.Param.IBSMenuCycleKey =
  Number(Yanfly.Parameters['Key for Cycling shown Menu for the Battler'] || 221);
Yanfly.Param.IBSBattlerMenuOrder =
  String(Yanfly.Parameters['Battler Menus Cycling Order'] ||
    'General Elements States Attributes Custom');
Yanfly.Param.IBSShowSmallStatusText =
  String(Yanfly.Parameters['-- Small set text added to the In-Battle Status Window --'] || 'No') === 'Yes';
Yanfly.Param.IBSSmallStatusText = Yanfly.Param.IBSShowSmallStatusText ?
  String(Yanfly.Parameters['Text to show'] || '') : '';
Yanfly.Param.IBSSmallStatusPosition = Yanfly.Param.IBSShowSmallStatusText ?
  String(Yanfly.Parameters['Text position within the In-Battle Status Window'] || 'Bottom-Right') : '';
Yanfly.Param.IBSSmallStatusColor = Yanfly.Param.IBSShowSmallStatusText ?
  String(Yanfly.Parameters['Text color'] || '#1a90b3') : '';
Yanfly.Param.IBSSmallStatusSize = Yanfly.Param.IBSShowSmallStatusText ?
  Number(Yanfly.Parameters['Text size'] || 5) : 0;
Yanfly.Param.IBSSmallStatusFont = Yanfly.Param.IBSShowSmallStatusText ?
  String(Yanfly.Parameters['Text font'] || 'GameFont') : '';
Yanfly.Param.IBSSmallStatusXOffset = Yanfly.Param.IBSShowSmallStatusText ?
  Number(Yanfly.Parameters['X offset'] || 0) : 0;
Yanfly.Param.IBSSmallStatusYOffset = Yanfly.Param.IBSShowSmallStatusText ?
  Number(Yanfly.Parameters['Y offset'] || 0) : 0;

Yanfly.InBattleStatus_JakeMSGAdd.ENEMY_ATTRIBUTE_SKIP = {
  pha: true,
  exr: true
};

//=============================================================================
// Menu Cycling Utilities
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.commandToSymbol = function(command) {
  command = String(command || '').toUpperCase();
  if (['GENERAL', 'MAIN'].contains(command)) return 'inBattleGeneral';
  if (['PARAMETER', 'PARAMETERS'].contains(command)) return null;
  if (['CANCEL', 'FINISH'].contains(command)) return null;
  if (['ELEMENT', 'ELEMENTS'].contains(command)) return 'elements';
  if (['STATE', 'STATES'].contains(command)) return 'states';
  if (['ATTRIBUTE', 'ATTRIBUTES'].contains(command)) return 'attributes';
  if (command === 'VARIABLES') return 'actorVariables';
  if (command === 'STATISTICS') return 'battleStatistics';
  if (command === 'PROFILE') return 'profile';
  if (['MOREPAGES', 'MOREPAGE'].contains(command)) return 'morePages';
  return null;
};

Yanfly.InBattleStatus_JakeMSGAdd.resolveMenuDisplayName = function(entry) {
  if (!entry) return '';
  if (entry.symbol === 'morePages') return entry.ext || entry.label;
  if (Imported.YEP_StatusMenuCore) {
    if (entry.symbol === 'inBattleGeneral') {
      return Yanfly.Param.StatusGeneral || entry.label;
    }
    if (entry.symbol === 'elements') {
      return Yanfly.Param.StatusElements || entry.label;
    }
    if (entry.symbol === 'states') {
      return Yanfly.Param.StatusStates || entry.label;
    }
    if (entry.symbol === 'attributes') {
      return Yanfly.Param.StatusAttributes || entry.label;
    }
  }
  if (entry.symbol === 'actorVariables' && Imported.YEP_X_ActorVariables) {
    return Yanfly.Param.AVarCmdName || entry.label;
  }
  if (entry.symbol === 'battleStatistics' && Imported.YEP_X_BattleStatistics) {
    return Yanfly.Param.BStatsCmdName || entry.label;
  }
  if (entry.symbol === 'profile' && Imported.YEP_X_ProfileStatusPage) {
    return Yanfly.Param.PSPCmdName || entry.label;
  }
  return entry.label;
};

Yanfly.InBattleStatus_JakeMSGAdd.ibsMenuHeaderHeight = function(win) {
  return win.lineHeight();
};

Yanfly.InBattleStatus_JakeMSGAdd.drawIBSMenuHeader = function(win, x, y, width,
  entry, battler) {
  var menuTitle = Yanfly.InBattleStatus_JakeMSGAdd.resolveMenuDisplayName(entry);
  var battlerName = battler ? battler.name() : '';
  var text = battlerName ? menuTitle + ' - ' + battlerName : menuTitle;
  win.changeTextColor(win.systemColor());
  win.drawText(text, x, y, width, 'center');
  win.resetTextColor();
};

Yanfly.InBattleStatus_JakeMSGAdd.battlerDatabaseObject = function(battler) {
  if (!battler) return null;
  return battler.isActor() ? battler.actor() : battler.enemy();
};

Yanfly.InBattleStatus_JakeMSGAdd.isMorePageVisible = function(battler, pageKey) {
  var data = this.battlerDatabaseObject(battler);
  if (!data || !data.customStatusMenuPageRequirement) return true;
  var switches = data.customStatusMenuPageRequirement[pageKey] || [];
  for (var i = 0; i < switches.length; ++i) {
    if (!$gameSwitches.value(switches[i])) return false;
  }
  return true;
};

Yanfly.InBattleStatus_JakeMSGAdd.getMorePageKeys = function(battler) {
  var data = this.battlerDatabaseObject(battler);
  if (!data || !data.customStatusMenuPages) return [];
  var result = [];
  for (var i = 0; i < data.customStatusMenuPages.length; ++i) {
    var pageKey = data.customStatusMenuPages[i];
    if (this.isMorePageVisible(battler, pageKey)) result.push(pageKey);
  }
  return result;
};

Yanfly.InBattleStatus_JakeMSGAdd.addCustomMenus = function(list, battler) {
  if (Imported.YEP_X_ActorVariables &&
      this.isMenuAvailable('actorVariables', battler)) {
    list.push({symbol: 'actorVariables', label: 'Variables', ext: null});
  }
  if (Imported.YEP_X_BattleStatistics &&
      this.isMenuAvailable('battleStatistics', battler)) {
    list.push({symbol: 'battleStatistics', label: 'Statistics', ext: null});
  }
  if (Imported.YEP_X_ProfileStatusPage &&
      this.isMenuAvailable('profile', battler)) {
    list.push({symbol: 'profile', label: 'Profile', ext: null});
  }
  if (Imported.YEP_X_MoreStatusPages) {
    var pages = this.getMorePageKeys(battler);
    for (var i = 0; i < pages.length; ++i) {
      list.push({symbol: 'morePages', label: pages[i], ext: pages[i]});
    }
  }
};

Yanfly.InBattleStatus_JakeMSGAdd.isMenuAvailable = function(symbol, battler) {
  if (!Imported.YEP_StatusMenuCore) return symbol === 'inBattleGeneral';
  if (symbol === 'inBattleGeneral') return true;
  if (symbol === 'actorVariables') return !!Imported.YEP_X_ActorVariables;
  if (symbol === 'battleStatistics') {
    return !!(Imported.YEP_X_BattleStatistics && battler && battler.isActor());
  }
  if (symbol === 'profile') return !!Imported.YEP_X_ProfileStatusPage;
  if (symbol === 'morePages') return !!Imported.YEP_X_MoreStatusPages;
  if (['elements', 'states', 'attributes'].contains(symbol)) return true;
  return false;
};

Yanfly.InBattleStatus_JakeMSGAdd.buildMenuList = function(battler) {
  var tokens = Yanfly.Param.IBSBattlerMenuOrder.split(/\s+/).filter(Boolean);
  var list = [];
  var seen = {};
  for (var i = 0; i < tokens.length; ++i) {
    var token = tokens[i];
    var upper = token.toUpperCase();
    if (['CUSTOM', 'ORIGINAL'].contains(upper)) {
      this.addCustomMenus(list, battler);
      continue;
    }
    if (['MOREPAGES', 'MOREPAGE'].contains(upper)) {
      var pages = this.getMorePageKeys(battler);
      for (var p = 0; p < pages.length; ++p) {
        var pageKey = pages[p];
        var pageId = 'morePages:' + pageKey;
        if (seen[pageId]) continue;
        seen[pageId] = true;
        list.push({symbol: 'morePages', label: pageKey, ext: pageKey});
      }
      continue;
    }
    var symbol = this.commandToSymbol(token);
    if (!symbol) {
      if (Imported.YEP_X_MoreStatusPages && battler) {
        var db = this.battlerDatabaseObject(battler);
        if (db && db.customStatusMenuPages &&
        db.customStatusMenuPages.contains(token) &&
        this.isMorePageVisible(battler, token)) {
          var customPageId = 'morePages:' + token;
          if (!seen[customPageId]) {
            seen[customPageId] = true;
            list.push({symbol: 'morePages', label: token, ext: token});
          }
        }
      }
      continue;
    }
    if (!this.isMenuAvailable(symbol, battler)) continue;
    if (seen[symbol]) continue;
    seen[symbol] = true;
    list.push({symbol: symbol, label: token, ext: null});
  }
  if (list.length <= 0) {
    list.push({symbol: 'inBattleGeneral', label: 'General', ext: null});
  }
  return list;
};

Yanfly.InBattleStatus_JakeMSGAdd.createStatusMenuActor = function(battler) {
  if (!battler) return null;
  if (battler.isActor()) return battler;
  return new Yanfly.InBattleStatus_JakeMSGAdd.EnemyStatusMenuActor(battler);
};

//=============================================================================
// Enemy Status Menu Actor Wrapper
//=============================================================================

function EnemyStatusMenuActor() {
  this.initialize.apply(this, arguments);
}

EnemyStatusMenuActor.prototype.initialize = function(enemyBattler) {
  this._enemyBattler = enemyBattler;
};

EnemyStatusMenuActor.prototype.isActor = function() {
  return false;
};

EnemyStatusMenuActor.prototype.actor = function() {
  return this._enemyBattler.enemy();
};

EnemyStatusMenuActor.prototype.enemy = function() {
  return this._enemyBattler.enemy();
};

EnemyStatusMenuActor.prototype.elementRate = function(eleId) {
  return this._enemyBattler.elementRate(eleId);
};

EnemyStatusMenuActor.prototype.stateRate = function(stateId) {
  return this._enemyBattler.stateRate(stateId);
};

EnemyStatusMenuActor.prototype.isStateResist = function(stateId) {
  return this._enemyBattler.isStateResist(stateId);
};

EnemyStatusMenuActor.prototype.param = function(paramId) {
  return this._enemyBattler.param(paramId);
};

(function() {
  var props = ['hit', 'eva', 'cri', 'cev', 'mev', 'mrf', 'cnt', 'hrg', 'mrg',
    'trg', 'tgr', 'grd', 'rec', 'pha', 'mcr', 'tcr', 'pdr', 'mdr', 'fdr', 'exr'];
  for (var i = 0; i < props.length; i++) {
    (function(prop) {
      Object.defineProperty(EnemyStatusMenuActor.prototype, prop, {
        get: function() { return this._enemyBattler[prop]; },
        configurable: true
      });
    })(props[i]);
  }
})();

EnemyStatusMenuActor.prototype.varColumn1 = function() {
  return this._normalizedVarColumn(this.actor().varColumn1);
};
EnemyStatusMenuActor.prototype.varColumn2 = function() {
  return this._normalizedVarColumn(this.actor().varColumn2);
};
EnemyStatusMenuActor.prototype.varColumn3 = function() {
  return this._normalizedVarColumn(this.actor().varColumn3);
};
EnemyStatusMenuActor.prototype.varColumn4 = function() {
  return this._normalizedVarColumn(this.actor().varColumn4);
};

EnemyStatusMenuActor.prototype._normalizedVarColumn = function(col) {
  if (!col) return [''];
  if (Array.isArray(col)) return col;
  var arr = String(col).split(/\s+/).filter(Boolean);
  return arr.length > 0 ? arr : [''];
};

EnemyStatusMenuActor.prototype.profileStatusText = function() {
  return this._enemyBattler.profileStatusText();
};
EnemyStatusMenuActor.prototype.profileImage = function() {
  return this._enemyBattler.profileImage();
};
EnemyStatusMenuActor.prototype.profileImageAlign = function() {
  return this._enemyBattler.profileImageAlign();
};

Yanfly.InBattleStatus_JakeMSGAdd.EnemyStatusMenuActor = EnemyStatusMenuActor;

//=============================================================================
// DataManager
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.DataManager_isDatabaseLoaded =
    DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!Yanfly.InBattleStatus_JakeMSGAdd.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!Yanfly.InBattleStatus_JakeMSGAdd.ProcesJakeMSGAddEnemyNotetags) {
    this.processJakeMSGAddEnemyNotetags($dataEnemies);
    this.processJakeMSGAddActorNotetags($dataActors);
    this.processJakeMSGAddEnemyStatusMenuNotetags();
    Yanfly.InBattleStatus_JakeMSGAdd.ProcesJakeMSGAddEnemyNotetags = true;
  }
	return true;
};

DataManager.processJakeMSGAddEnemyStatusMenuNotetags = function() {
  this.prepareJakeMSGEnemyStatusMenuData($dataEnemies);
  if (Imported.YEP_X_ActorVariables && DataManager.processAVarNotetags) {
    DataManager.processAVarNotetags($dataEnemies);
  }
  if (Imported.YEP_X_MoreStatusPages &&
      DataManager.processMoreStatusMenuPagesNotetags1) {
    DataManager.processMoreStatusMenuPagesNotetags1($dataEnemies);
  }
  if (Imported.YEP_X_ProfileStatusPage && DataManager.processPSPNotetags) {
    DataManager.processPSPNotetags($dataEnemies);
  }
};

DataManager.prepareJakeMSGEnemyStatusMenuData = function(group) {
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    if (!obj) continue;
    if (obj.note == null) obj.note = '';
    if (obj.profile == null) obj.profile = '';
  }
};

DataManager.processJakeMSGAddEnemyNotetags = function(group) {
	this.processJakeMSGAddGaugeNotetags(group, Yanfly.Param.ShowEnemyHP,
    Yanfly.Param.ShowEnemyMP, Yanfly.Param.ShowEnemyTP);
};

DataManager.processJakeMSGAddActorNotetags = function(group) {
  this.processJakeMSGAddGaugeNotetags(group, true, true,
    !!Yanfly.Param.MenuTpGauge);
};

DataManager.processJakeMSGAddGaugeNotetags = function(group, defaultHp,
  defaultMp, defaultTp) {
	for (var n = 1; n < group.length; n++) {
		var obj = group[n];
		if (!obj) continue;
		var notedata = (obj.note || '').split(/[\r\n]+/);

    obj.showIBSHp = defaultHp;
    obj.showIBSMp = defaultMp;
    obj.showIBSTp = defaultTp;

		for (var i = 0; i < notedata.length; i++) {
			var line = notedata[i];
			if (line.match(/<(?:SHOW STATUS HP)>/i)) {
				obj.showIBSHp = true;
			} else if (line.match(/<(?:HIDE STATUS HP)>/i)) {
        obj.showIBSHp = false;
      } else if (line.match(/<(?:SHOW STATUS MP)>/i)) {
        obj.showIBSMp = true;
      } else if (line.match(/<(?:HIDE STATUS MP)>/i)) {
        obj.showIBSMp = false;
      } else if (line.match(/<(?:SHOW STATUS TP)>/i)) {
        obj.showIBSTp = true;
      } else if (line.match(/<(?:HIDE STATUS TP)>/i)) {
        obj.showIBSTp = false;
      }
		}
	}
};

//=============================================================================
// Game_System
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.Game_System_initialize.call(this);
  this.initEnemyIBSSettings();
};

Game_System.prototype.initEnemyIBSSettings = function() {
  this._showEnemyInBattleStatus = Yanfly.Param.EnemyIBSCmdShow;
};

Game_System.prototype.isShowEnemyInBattleStatus = function() {
  if (this._showEnemyInBattleStatus === undefined) this.initEnemyIBSSettings();
  return this._showEnemyInBattleStatus;
};

Game_System.prototype.setShowEnemyInBattleStatus = function(value) {
  if (this._showEnemyInBattleStatus === undefined) this.initEnemyIBSSettings();
  this._showEnemyInBattleStatus = value;
};

//=============================================================================
// Game_Interpreter
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  Yanfly.InBattleStatus_JakeMSGAdd.Game_Interpreter_pluginCommand.call(this, command, args);
  if (command === 'ShowEnemyInBattleStatus') {
    $gameSystem.setShowEnemyInBattleStatus(true);
  } else if (command === 'HideEnemyInBattleStatus') {
    $gameSystem.setShowEnemyInBattleStatus(false);
  }
};

//=============================================================================
// Game_Enemy
//=============================================================================

if (Imported.YEP_X_ProfileStatusPage) {

Yanfly.InBattleStatus_JakeMSGAdd.Game_Enemy_setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function(enemyId, x, y) {
  Yanfly.InBattleStatus_JakeMSGAdd.Game_Enemy_setup.call(this, enemyId, x, y);
  this.initProfileStatusPage();
};

Game_Enemy.prototype.initProfileStatusPage = function() {
  var data = this.enemy();
  this._profileStatusText = data.profileText ? data.profileText.slice() : [''];
  this._profileImage = data.profileImage || '';
  this._profileImgAlign = data.profileImgAlign || Yanfly.Param.PSPImageAlign;
};

Game_Enemy.prototype.profileStatusText = function() {
  if (this._profileStatusText === undefined) this.initProfileStatusPage();
  return this._profileStatusText;
};

Game_Enemy.prototype.profileImage = function() {
  if (this._profileImage === undefined) this.initProfileStatusPage();
  return this._profileImage;
};

Game_Enemy.prototype.profileImageAlign = function() {
  if (this._profileImgAlign === undefined) this.initProfileStatusPage();
  return this._profileImgAlign;
};

}

if (Imported.YEP_X_ActorVariables) {

Game_Enemy.prototype.varColumn1 = function() {
  return this.enemy().varColumn1;
};
Game_Enemy.prototype.varColumn2 = function() {
  return this.enemy().varColumn2;
};
Game_Enemy.prototype.varColumn3 = function() {
  return this.enemy().varColumn3;
};
Game_Enemy.prototype.varColumn4 = function() {
  return this.enemy().varColumn4;
};

}

//=============================================================================
// Window_PartyCommand
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.Window_PartyCommand_makeCommandList =
  Window_PartyCommand.prototype.makeCommandList;
Window_PartyCommand.prototype.makeCommandList = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.Window_PartyCommand_makeCommandList.call(this);
  if (Yanfly.Param.GroupStatusCommands) {
    this.makeGroupedStatusCommands();
  } else {
    this.makeEnemyInBattleStatusCommand();
  }
};

Window_PartyCommand.prototype.makeEnemyInBattleStatusCommand = function() {
  if (!$gameSystem.isShowEnemyInBattleStatus()) return;
  var index = this.findSymbol('escape');
  if (index < 0) index = this._list.length;
  var text = Yanfly.Param.EnemyIBSCmdName;
  this.addCommandAt(index, text, 'enemyInBattleStatus', true);
};

Window_PartyCommand.prototype.makeGroupedStatusCommands = function() {
  this.removeCommandBySymbol('inBattleStatus');
  this.removeCommandBySymbol('enemyInBattleStatus');
  if (!this.canAddGroupedStatusCommand()) return;
  var index = this.findSymbol('escape');
  if (index < 0) index = this._list.length;
  this.addCommandAt(index, Yanfly.Param.ParentStatusCmdText,
    'statusCommandGroup', true);
};

Window_PartyCommand.prototype.canAddGroupedStatusCommand = function() {
  return $gameSystem.isShowInBattleStatus() ||
    $gameSystem.isShowEnemyInBattleStatus();
};

Window_PartyCommand.prototype.removeCommandBySymbol = function(symbol) {
  this._list = this._list.filter(function(command) {
    return command.symbol !== symbol;
  });
};

//=============================================================================
// Window_StatusCommandGroup
//=============================================================================

function Window_StatusCommandGroup() {
    this.initialize.apply(this, arguments);
}

Window_StatusCommandGroup._lastCommandSymbol = null;

Window_StatusCommandGroup.prototype = Object.create(Window_Command.prototype);
Window_StatusCommandGroup.prototype.constructor = Window_StatusCommandGroup;

Window_StatusCommandGroup.prototype.initialize = function() {
  Window_Command.prototype.initialize.call(this, 0, 0);
  this.deactivate();
  this.hide();
};

Window_StatusCommandGroup.prototype.windowWidth = function() {
  return 280;
};

Window_StatusCommandGroup.prototype.numVisibleRows = function() {
  return Math.max(1, this.maxItems());
};

Window_StatusCommandGroup.prototype.makeCommandList = function() {
  if ($gameSystem && $gameSystem.isShowInBattleStatus()) {
    this.addCommand(Yanfly.Param.IBSCmdName, 'inBattleStatus', true);
  }
  if ($gameSystem && $gameSystem.isShowEnemyInBattleStatus()) {
    this.addCommand(Yanfly.Param.EnemyIBSCmdName, 'enemyInBattleStatus', true);
  }
};

Window_StatusCommandGroup.prototype.selectLast = function() {
  if (this.maxItems() <= 0) return;
  var symbol = Window_StatusCommandGroup._lastCommandSymbol;
  if (symbol) {
    this.selectSymbol(symbol);
  } else {
    this.select(0);
  }
};

Window_StatusCommandGroup.prototype.processOk = function() {
  Window_StatusCommandGroup._lastCommandSymbol = this.currentSymbol();
  Window_Command.prototype.processOk.call(this);
};

//=============================================================================
// In-Battle Status Small Overlay Text
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.applySmallStatusTextMixin = function(target) {
  target.prototype.jakeMSGDestroySmallStatusSprite = function() {
    if (!this._jakeMSGSmallStatusSprite) return;
    if (this._jakeMSGSmallStatusSprite.parent) {
      this._jakeMSGSmallStatusSprite.parent.removeChild(this._jakeMSGSmallStatusSprite);
    }
    this._jakeMSGSmallStatusSprite.bitmap = null;
    this._jakeMSGSmallStatusSprite = null;
  };

  target.prototype.jakeMSGEnsureSmallStatusSprite = function() {
    if (!this._jakeMSGSmallStatusSprite) {
      this._jakeMSGSmallStatusSprite = new Sprite();
      this.addChild(this._jakeMSGSmallStatusSprite);
    }
  };

  target.prototype.jakeMSGDrawSmallStatusText = function() {
    if (!Yanfly.Param.IBSShowSmallStatusText) {
      this.jakeMSGDestroySmallStatusSprite();
      return;
    }
    if (!this.visible) {
      this.jakeMSGDestroySmallStatusSprite();
      return;
    }
    var text = Yanfly.Param.IBSSmallStatusText;
    if (!text) {
      this.jakeMSGDestroySmallStatusSprite();
      return;
    }
    this.jakeMSGEnsureSmallStatusSprite();
    var sprite = this._jakeMSGSmallStatusSprite;
    var fontSize = Yanfly.Param.IBSSmallStatusSize;
    var measureBmp = new Bitmap(1, 1);
    measureBmp.fontFace = Yanfly.Param.IBSSmallStatusFont;
    measureBmp.fontSize = fontSize;
    var textWidth = Math.ceil(measureBmp.measureTextWidth(text));
    var textHeight = fontSize + 8;
    var bmp = new Bitmap(textWidth, textHeight);
    bmp.fontFace = Yanfly.Param.IBSSmallStatusFont;
    bmp.fontSize = fontSize;
    bmp.textColor = Yanfly.Param.IBSSmallStatusColor;
    bmp.drawText(text, 0, 0, textWidth, textHeight, 'left');
    sprite.bitmap = bmp;
    sprite.visible = true;
    var x = 0;
    var y = 0;
    switch (Yanfly.Param.IBSSmallStatusPosition) {
    case 'Top-Left':
      x = 0;
      y = 0;
      break;
    case 'Top-Right':
      x = this.width - textWidth;
      y = 0;
      break;
    case 'Bottom-Left':
      x = 0;
      y = this.height - textHeight;
      break;
    default:
      x = this.width - textWidth;
      y = this.height - textHeight;
      break;
    }
    x += Yanfly.Param.IBSSmallStatusXOffset;
    y += Yanfly.Param.IBSSmallStatusYOffset;
    sprite.move(x, y);
  };
};

Yanfly.InBattleStatus_JakeMSGAdd.wrapWindowShowHideForSmallText = function(target) {
  var aliasShow = target.prototype.show;
  target.prototype.show = function() {
    aliasShow.call(this);
    if (this.jakeMSGDrawSmallStatusText) this.jakeMSGDrawSmallStatusText();
  };
  var aliasHide = target.prototype.hide;
  target.prototype.hide = function() {
    if (this.jakeMSGDestroySmallStatusSprite) this.jakeMSGDestroySmallStatusSprite();
    aliasHide.call(this);
  };
};

//=============================================================================
// In-Battle Status Menu Controller
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController = function() {
  this.initialize.apply(this, arguments);
};

Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController.prototype.initialize =
  function(stateListWindow, statusWindow, infoWindow, listWidthParam) {
  this._stateListWindow = stateListWindow;
  this._statusWindow = statusWindow;
  this._infoWindow = infoWindow;
  this._listWidthParam = listWidthParam;
  this._menuIndex = 0;
  this._menuList = [];
};

Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController.prototype.reset =
  function(battler) {
  this._menuList = Yanfly.InBattleStatus_JakeMSGAdd.buildMenuList(battler);
  this._menuIndex = 0;
  this.applyCurrentMenu(battler);
};

Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController.prototype.currentEntry =
  function() {
  if (!this._menuList.length) return {symbol: 'inBattleGeneral', label: 'General', ext: null};
  return this._menuList[this._menuIndex.clamp(0, this._menuList.length - 1)];
};

Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController.prototype.isGeneralMenu =
  function() {
  return this.currentEntry().symbol === 'inBattleGeneral';
};

Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController.prototype.applyCurrentMenu =
  function(battler) {
  var entry = this.currentEntry();
  if (this._statusWindow) {
    this._statusWindow._ibsMenuSymbol = entry.symbol;
    this._statusWindow._ibsMorePageKey = entry.ext;
    this._statusWindow._ibsMenuEntry = entry;
    this._statusWindow.refresh();
  }
  if (this._infoWindow) {
    this._infoWindow.syncWithController(this, battler);
  }
};

Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController.prototype.cycle =
  function(battler) {
  if (this._menuList.length <= 1) return false;
  this._menuIndex = (this._menuIndex + 1) % this._menuList.length;
  this.applyCurrentMenu(battler);
  return true;
};

Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController.prototype.updateInfoPosition =
  function() {
  if (!this._infoWindow || !this._statusWindow) return;
  this._infoWindow.updatePanelPosition(this._statusWindow, this._listWidthParam);
};

//=============================================================================
// Window_InBattleStatusInfo
//=============================================================================

if (Imported.YEP_StatusMenuCore) {

function Window_InBattleStatusInfo() {
  this.initialize.apply(this, arguments);
}

Window_InBattleStatusInfo.prototype = Object.create(Window_StatusInfo.prototype);
Window_InBattleStatusInfo.prototype.constructor = Window_InBattleStatusInfo;

Window_InBattleStatusInfo.prototype.initialize = function() {
  Window_Selectable.prototype.initialize.call(this, 0, 0, 1, 1);
  this._actor = null;
  this._menuBattler = null;
  this._menuEntry = null;
  this._symbol = 'elements';
  this._morePageKey = null;
  this._isEnemyMenu = false;
  this.opacity = 255;
  this.backOpacity = 0;
  this.contentsOpacity = 255;
  this.openness = 255;
  this.deactivate();
  this.hide();
};

Window_InBattleStatusInfo.prototype.ibsMenuHeaderHeight = function() {
  return Yanfly.InBattleStatus_JakeMSGAdd.ibsMenuHeaderHeight(this);
};

Window_InBattleStatusInfo.prototype.drawIBSMenuHeader = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.drawIBSMenuHeader(this, 0, 0,
    this.contents.width, this._menuEntry, this._menuBattler);
};

Window_InBattleStatusInfo.prototype.ensurePanelContents = function() {
  if (!this.contents || this.contents.width !== this.contentsWidth() ||
  this.contents.height !== this.contentsHeight()) {
    this.createContents();
  }
};

Window_InBattleStatusInfo.prototype.updatePanelPosition = function(parentWindow,
  listWidthParam) {
  var px = parentWindow.x + parentWindow.standardPadding() +
    eval(listWidthParam);
  var py = parentWindow.y;
  var pw = parentWindow.width - (px - parentWindow.x);
  var ph = parentWindow.height;
  var resized = this.width !== pw || this.height !== ph;
  this.move(px, py, pw, ph);
  this.ensurePanelContents();
  if (resized && this.visible && this._symbol &&
  this._symbol !== 'inBattleGeneral') {
    this.refresh();
  }
};

Window_InBattleStatusInfo.prototype.syncWithController = function(controller,
  battler) {
  var entry = controller.currentEntry();
  this._menuEntry = entry;
  this._symbol = entry.symbol;
  this._morePageKey = entry.ext;
  this.setBattler(battler);
  if (controller.isGeneralMenu()) {
    this.hide();
    return;
  }
  this.updatePanelPosition(controller._statusWindow, controller._listWidthParam);
  this.openness = 255;
  this.contentsOpacity = 255;
  this.show();
  this.refresh();
  if (SceneManager._scene) {
    SceneManager._scene.addChild(this);
  }
};

Window_InBattleStatusInfo.prototype.setBattler = function(battler) {
  this._menuBattler = battler;
  this._isEnemyMenu = !!(battler && battler.isEnemy && battler.isEnemy());
  this._actor = Yanfly.InBattleStatus_JakeMSGAdd.createStatusMenuActor(battler);
};

Window_InBattleStatusInfo.prototype.setSymbol = function(symbol) {
  this._symbol = symbol;
};

Window_InBattleStatusInfo.prototype.refresh = function() {
  this.ensurePanelContents();
  this.contents.clear();
  if (!this._actor || !this._symbol || this._symbol === 'inBattleGeneral') return;
  this.drawIBSMenuHeader();
  this.drawInfoContents(this._symbol);
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_getArrayY =
  Window_StatusInfo.prototype.getArrayY;
Window_InBattleStatusInfo.prototype.getArrayY = function() {
  return this.ibsMenuHeaderHeight();
};

Window_InBattleStatusInfo.prototype.nextArrayColumnY = function() {
  return this.getArrayY();
};

Window_InBattleStatusInfo.prototype.drawMultiColumnRects = function(infoArray) {
  var maxCols = this.getMaxArrayCols(infoArray);
  var maxRows = this.getMaxArrayRows(infoArray);
  if (maxCols <= 0) return;
  var dx = this.getArrayX();
  var dy = this.getArrayY();
  var dw = this.getArrayDW(maxCols);
  for (var i = 0; i < maxCols; ++i) {
    for (var j = 0; j < maxRows; ++j) {
      this.drawDarkRect(dx, dy, dw, this.lineHeight());
      dy += this.lineHeight();
    }
    dx += dw;
    dx += (maxCols > 1) ? this.standardPadding() : 0;
    dy = this.nextArrayColumnY();
  }
};

Window_InBattleStatusInfo.prototype.drawMultiColumnData = function(infoArray,
  drawFn) {
  var maxCols = this.getMaxArrayCols(infoArray);
  if (maxCols <= 0) return;
  var dx = this.getArrayX();
  var dy = this.getArrayY();
  var dw = this.getArrayDW(maxCols);
  for (var i = 0; i < maxCols; ++i) {
    for (var j = 0; j < infoArray[i].length; ++j) {
      drawFn.call(this, infoArray[i][j], dx, dy, dw);
      dy += this.lineHeight();
    }
    dx += dw;
    dx += (maxCols > 1) ? this.standardPadding() : 0;
    dy = this.nextArrayColumnY();
  }
};

Window_InBattleStatusInfo.prototype.drawElements = function() {
  var infoArray = this.elementArray();
  this.drawMultiColumnRects(infoArray);
  var self = this;
  this.drawMultiColumnData(infoArray, function(eleId, dx, dy, dw) {
    self.drawElementData(eleId, dx, dy, dw);
  });
};

Window_InBattleStatusInfo.prototype.drawStates = function() {
  var infoArray = this.stateArray();
  this.drawMultiColumnRects(infoArray);
  var self = this;
  this.drawMultiColumnData(infoArray, function(stateId, dx, dy, dw) {
    self.drawStatesData(stateId, dx, dy, dw);
  });
};

Window_InBattleStatusInfo.prototype.drawAttributes = function() {
  var infoArray = this.attributesArray();
  this.drawMultiColumnRects(infoArray);
  this.drawAttributesInfo();
};

Window_InBattleStatusInfo.prototype.drawActorVariables = function() {
  this.resetFontSettings();
  var infoArray = this.actorVariableArray();
  this.drawMultiColumnRects(infoArray);
  var self = this;
  this.drawMultiColumnData(infoArray, function(varId, dx, dy, dw) {
    if ($gameSystem.isHiddenActorStatusVariable(varId)) return;
    self.drawActorVarData(varId, dx, dy, dw);
  });
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_Selectable_itemRectForText =
  Window_Selectable.prototype.itemRectForText;
Window_InBattleStatusInfo.prototype.itemRectForText = function(index) {
  var rect = Yanfly.InBattleStatus_JakeMSGAdd.Window_Selectable_itemRectForText
    .call(this, index);
  rect.y += this.ibsMenuHeaderHeight();
  return rect;
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawBattleStatistics =
  Window_StatusInfo.prototype.drawBattleStatistics;
Window_InBattleStatusInfo.prototype.drawBattleStatistics = function() {
  var shiftY = this.ibsMenuHeaderHeight();
  this.resetFontSettings();
  this.drawBattleCountShifted(shiftY);
  this.drawKDACountShifted(shiftY);
  this.drawKDARatiosShifted(shiftY);
  this.drawTotalDamageHealingShifted(shiftY);
};

Window_InBattleStatusInfo.prototype.drawBattleCountShifted = function(shiftY) {
  this.drawDarkRect(0, shiftY, this.contents.width, this.lineHeight());
  this.changeTextColor(this.systemColor());
  var p = this.textPadding();
  var text = Yanfly.Param.BStatsBCountText;
  this.drawText(text, p, shiftY, this.contents.width - p * 2);
  this.changeTextColor(this.normalColor());
  var fmt = Yanfly.Param.BStatsBCountFmt;
  var n1 = Yanfly.Util.toGroup(this._actor.battleCount());
  var n2 = Yanfly.Util.toGroup($gameSystem.battleCount());
  var n3 = parseInt(100 * this._actor.battleCount() / Math.max(1,
    $gameSystem.battleCount()));
  text = fmt.format(n1, n2, n3);
  this.drawText(text, p, shiftY, this.contents.width - p * 2, 'right');
};

Window_InBattleStatusInfo.prototype.drawKDACountShifted = function(shiftY) {
  var p = this.textPadding();
  var lh = this.lineHeight();
  var dw = this.contents.width / 2;
  this.drawDarkRect(0, shiftY + lh * 1, dw, lh);
  this.drawDarkRect(0, shiftY + lh * 2, dw, lh);
  this.drawDarkRect(0, shiftY + lh * 3, dw, lh);
  this.changeTextColor(this.systemColor());
  this.drawText(Yanfly.Param.BStatsKCountText, p, shiftY + lh * 1,
    this.contents.width - p * 2);
  this.drawText(Yanfly.Param.BStatsDCountText, p, shiftY + lh * 2,
    this.contents.width - p * 2);
  this.drawText(Yanfly.Param.BStatsACountText, p, shiftY + lh * 3,
    this.contents.width - p * 2);
  this.changeTextColor(this.powerUpColor());
  this.drawText(Yanfly.Util.toGroup(this._actor.killCount()), p,
    shiftY + lh * 1, dw - p * 2, 'right');
  this.changeTextColor(this.powerDownColor());
  this.drawText(Yanfly.Util.toGroup(this._actor.deathCount()), p,
    shiftY + lh * 2, dw - p * 2, 'right');
  this.changeTextColor(this.normalColor());
  this.drawText(Yanfly.Util.toGroup(this._actor.assistCount()), p,
    shiftY + lh * 3, dw - p * 2, 'right');
};

Window_InBattleStatusInfo.prototype.drawKDARatiosShifted = function(shiftY) {
  var p = this.textPadding();
  var lh = this.lineHeight();
  var dw = this.contents.width / 2;
  this.drawDarkRect(dw, shiftY + lh * 1, dw, lh);
  this.drawDarkRect(dw, shiftY + lh * 2, dw, lh);
  this.drawDarkRect(dw, shiftY + lh * 3, dw, lh);
  this.changeTextColor(this.normalColor());
  var fmt = Yanfly.Param.BStatsKCountFmt;
  var ratio = Yanfly.Util.toGroup(this._actor.killCountRatio().toFixed(2));
  this.drawText(fmt.format(ratio), dw + p, shiftY + lh * 1, dw - p * 2, 'right');
  fmt = Yanfly.Param.BStatsDCountFmt;
  ratio = Yanfly.Util.toGroup(this._actor.deathCountRatio().toFixed(2));
  this.drawText(fmt.format(ratio), dw + p, shiftY + lh * 2, dw - p * 2, 'right');
  fmt = Yanfly.Param.BStatsACountFmt;
  ratio = Yanfly.Util.toGroup(this._actor.assistCountRatio().toFixed(2));
  this.drawText(fmt.format(ratio), dw + p, shiftY + lh * 3, dw - p * 2, 'right');
};

Window_InBattleStatusInfo.prototype.drawTotalDamageHealingShifted = function(shiftY) {
  var lh = this.lineHeight();
  var p = this.textPadding();
  this.drawDarkRect(0, shiftY + lh * 4, this.contents.width, lh);
  this.drawDarkRect(0, shiftY + lh * 5, this.contents.width, lh);
  this.drawDarkRect(0, shiftY + lh * 6, this.contents.width, lh);
  this.drawDarkRect(0, shiftY + lh * 7, this.contents.width, lh);
  this.changeTextColor(this.systemColor());
  this.drawText(Yanfly.Param.BStatsDmgDealt, p, shiftY + lh * 4,
    this.contents.width - p * 2);
  this.drawText(Yanfly.Param.BStatsDmgTaken, p, shiftY + lh * 5,
    this.contents.width - p * 2);
  this.drawText(Yanfly.Param.BStatsHealDealt, p, shiftY + lh * 6,
    this.contents.width - p * 2);
  this.drawText(Yanfly.Param.BStatsHealTaken, p, shiftY + lh * 7,
    this.contents.width - p * 2);
  this.changeTextColor(this.normalColor());
  this.drawText(Yanfly.Util.toGroup(this._actor.totalDamageDealt()), p,
    shiftY + lh * 4, this.contents.width - p * 2, 'right');
  this.drawText(Yanfly.Util.toGroup(this._actor.totalDamageTaken()), p,
    shiftY + lh * 5, this.contents.width - p * 2, 'right');
  this.drawText(Yanfly.Util.toGroup(this._actor.totalHealingDealt()), p,
    shiftY + lh * 6, this.contents.width - p * 2, 'right');
  this.drawText(Yanfly.Util.toGroup(this._actor.totalHealingTaken()), p,
    shiftY + lh * 7, this.contents.width - p * 2, 'right');
};

Window_InBattleStatusInfo.prototype.drawInfoContents = function(symbol) {
  if (symbol === 'battleStatistics') {
    this.drawBattleStatistics();
    return;
  }
  if (symbol === 'morePages') {
    this.drawAllItems();
    return;
  }
  if (symbol === 'profile') {
    this.drawAllItems();
    return;
  }
  Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawInfoContents.call(
    this, symbol);
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawInfoContents =
  Window_StatusInfo.prototype.drawInfoContents;

Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawAttributeData =
  Window_StatusInfo.prototype.drawAttributeData;
Window_InBattleStatusInfo.prototype.drawAttributeData = function(attr, dx, dy, dw) {
  if (this._isEnemyMenu &&
  Yanfly.InBattleStatus_JakeMSGAdd.ENEMY_ATTRIBUTE_SKIP[attr]) {
    return;
  }
  Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawAttributeData.call(
    this, attr, dx, dy, dw);
};

Window_InBattleStatusInfo.prototype.drawAttributesInfo = function() {
  var infoArray = this.attributesArray();
  var self = this;
  this.drawMultiColumnData(infoArray, function(attribute, dx, dy, dw) {
    attribute = String(attribute).toLowerCase();
    if (self._isEnemyMenu &&
    Yanfly.InBattleStatus_JakeMSGAdd.ENEMY_ATTRIBUTE_SKIP[attribute]) {
      return;
    }
    self.drawAttributeData(attribute, dx, dy, dw);
  });
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_maxItems =
  Window_StatusInfo.prototype.maxItems;
Window_InBattleStatusInfo.prototype.maxItems = function() {
  if (this._symbol === 'morePages') {
    var pageKey = this._morePageKey;
    var data = this._actor.actor();
    if (data && data.customStatusMenuPagesData &&
    data.customStatusMenuPagesData[pageKey]) {
      return data.customStatusMenuPagesData[pageKey].length;
    }
    return 0;
  }
  if (this._symbol === 'profile') {
    return this._actor.profileStatusText().length;
  }
  return Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_maxItems.call(this);
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawAllItems =
  Window_StatusInfo.prototype.drawAllItems;
Window_InBattleStatusInfo.prototype.drawAllItems = function() {
  if (this._symbol === 'profile' && this._actor) {
    if (this._actor.profileImage() !== '') {
      var bitmap = ImageManager.loadPicture(this._actor.profileImage());
      if (bitmap.width <= 0) {
        return setTimeout(this.drawAllItems.bind(this), 5);
      }
      this.drawProfileImage();
    }
  }
  Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawAllItems.call(this);
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawItem =
  Window_StatusInfo.prototype.drawItem;
Window_InBattleStatusInfo.prototype.drawItem = function(index) {
  Yanfly.InBattleStatus_JakeMSGAdd.Window_StatusInfo_drawItem.call(this, index);
  if (this._symbol === 'morePages') {
    this.drawMoreStatusPageContent(index);
  }
  if (this._symbol === 'profile') {
    this.drawProfileItem(index);
  }
};

Window_InBattleStatusInfo.prototype.drawMoreStatusPageContent = function(index) {
  var pageKey = this._morePageKey;
  if (!this._actor.actor().customStatusMenuPagesData) return;
  if (!this._actor.actor().customStatusMenuPagesData[pageKey]) return;
  var data = this._actor.actor().customStatusMenuPagesData[pageKey];
  var text = data[index];
  var rect = this.itemRectForText(index);
  this.drawTextEx(text, rect.x, rect.y);
};

}

//=============================================================================
// Window_EnemyInBattleStatus
//=============================================================================

function Window_EnemyInBattleStatus() {
    this.initialize.apply(this, arguments);
}

Window_EnemyInBattleStatus.prototype = Object.create(Window_Base.prototype);
Window_EnemyInBattleStatus.prototype.constructor = Window_EnemyInBattleStatus;

Window_EnemyInBattleStatus.prototype.initialize = function() {
  var x = eval(Yanfly.Param.EnemyIBSWinX);
  var y = eval(Yanfly.Param.EnemyIBSWinY);
  var w = eval(Yanfly.Param.EnemyIBSWinWidth);
  var h = eval(Yanfly.Param.EnemyIBSWinHeight);
  this._battler = $gameTroop.members()[0];
  this._ibsMenuSymbol = 'inBattleGeneral';
  this._ibsMorePageKey = null;
  this._ibsMenuEntry = {symbol: 'inBattleGeneral', label: 'General', ext: null};
  Window_Base.prototype.initialize.call(this, x, y, w, h);
  this.hide();
};

Window_EnemyInBattleStatus.prototype.setBattler = function(battler) {
  this._battler = battler;
  this.refresh();
};

Window_EnemyInBattleStatus.prototype.isGeneralMenu = function() {
  return !this._ibsMenuSymbol || this._ibsMenuSymbol === 'inBattleGeneral';
};

Window_EnemyInBattleStatus.prototype.refresh = function() {
  this.contents.clear();
  if (!this._battler) return;
  if (!this.isGeneralMenu()) return;
  var x = this.standardPadding() + eval(Yanfly.Param.EnemyIBSStatusListWidth);
  var panelW = this.contents.width - x;
  var headerH = Yanfly.InBattleStatus_JakeMSGAdd.ibsMenuHeaderHeight(this);
  var entry = this._ibsMenuEntry ||
    {symbol: 'inBattleGeneral', label: 'General', ext: null};
  Yanfly.InBattleStatus_JakeMSGAdd.drawIBSMenuHeader(this, x, 0, panelW, entry,
    this._battler);
  var x2 = x + this.standardPadding();
  var w = this.contents.width - x2;
  var y = headerH;
  if (this._battler.enemy().showIBSHp) {
    this.drawEnemyHp(this._battler, x2, y, w);
    y += this.lineHeight();
  }
  if (this._battler.enemy().showIBSMp) {
    this.drawEnemyMp(this._battler, x2, y, w);
    y += this.lineHeight();
  }
  if (this._battler.enemy().showIBSTp) {
    this.drawEnemyTp(this._battler, x2, y, w);
    y += this.lineHeight();
  }
  w = this.contents.width - x;
  y = Math.max(y + this.lineHeight(), headerH + Math.ceil(this.lineHeight() * 1.5));
  var h = this.contents.height - y;
  if (h >= this.lineHeight() * 6) {
    for (var i = 2; i < 8; ++i) {
      this.drawParam(i, x, y, w, this.lineHeight());
      y += this.lineHeight();
    }
  } else {
    w = Math.floor(w / 2);
    x2 = x;
    for (var i = 2; i < 8; ++i) {
      this.drawParam(i, x2, y, w, this.lineHeight());
      if (i % 2 === 0) {
        x2 += w;
      } else {
        x2 = x;
        y += this.lineHeight();
      }
    }
  }
};

Window_EnemyInBattleStatus.prototype.drawEnemyName = function(enemy, x, y, width) {
  this.changeTextColor(this.systemColor());
  this.drawText('Name:', x, y, 80);
  this.resetTextColor();
  this.drawText(enemy.name(), x + 80, y, width - 80);
};

Window_EnemyInBattleStatus.prototype.drawEnemyHp = function(enemy, x, y, width) {
  var hpRate = enemy.hpRate ? enemy.hpRate() : (enemy.mhp > 0 ? enemy.hp / enemy.mhp : 0);
  var canDrawBarrier = Imported.YEP_AbsorptionBarrier &&
    typeof this.drawBarrierGauge === 'function' &&
    typeof enemy.barrierPoints === 'function' && enemy.barrierPoints() > 0;
  if (canDrawBarrier) {
    width = this.drawBarrierGauge(enemy, x, y, width);
  } else {
    this.drawGauge(x, y, width, hpRate, this.hpGaugeColor1(), this.hpGaugeColor2());
  }
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.hpA, x, y, 44);
  this.drawCurrentAndMax(enemy.hp, enemy.mhp, x, y, width,
    this.hpColor(enemy), this.normalColor());
};

Window_EnemyInBattleStatus.prototype.drawEnemyMp = function(enemy, x, y, width) {
  var rate = enemy.mpRate();
  this.drawGauge(x, y, width, rate, this.mpGaugeColor1(), this.mpGaugeColor2());
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.mpA, x, y, 44);
  this.drawCurrentAndMax(enemy.mp, enemy.mmp, x, y, width,
    this.mpColor(enemy), this.normalColor());
};

Window_EnemyInBattleStatus.prototype.drawEnemyTp = function(enemy, x, y, width) {
  var rate = enemy.tpRate();
  this.drawGauge(x, y, width, rate, this.tpGaugeColor1(), this.tpGaugeColor2());
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.tpA, x, y, 44);
  this.changeTextColor(this.tpColor(enemy));
  this.drawText(Yanfly.Util.toGroup(enemy.tp), x + width - 64, y, 64, 'right');
};

Window_EnemyInBattleStatus.prototype.drawParam = function(paramId, dx, dy, dw, dh) {
  this.drawDarkRect(dx, dy, dw, dh);
  var level = this._battler._buffs[paramId];
  var icon = this._battler.buffIconIndex(level, paramId);
  this.drawIcon(icon, dx + 2, dy + 2);
  dx += Window_Base._iconWidth + 4;
  dw -= Window_Base._iconWidth + 4 + this.textPadding() + 2;
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.param(paramId), dx, dy, dw);
  var value = this._battler.param(paramId);
  this.changeTextColor(this.paramchangeTextColor(level));
  this.drawText(Yanfly.Util.toGroup(value), dx, dy, dw, 'right');
};

Window_EnemyInBattleStatus.prototype.drawDarkRect = function(dx, dy, dw, dh) {
  var color = this.gaugeBackColor();
  this.changePaintOpacity(false);
  this.contents.fillRect(dx + 1, dy + 1, dw - 2, dh - 2, color);
  this.changePaintOpacity(true);
};

//=============================================================================
// Window_InBattleStatus
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.Window_InBattleStatus_initialize =
  Window_InBattleStatus.prototype.initialize;
Window_InBattleStatus.prototype.initialize = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.Window_InBattleStatus_initialize.call(this);
  this._ibsMenuSymbol = 'inBattleGeneral';
  this._ibsMorePageKey = null;
  this._ibsMenuEntry = {symbol: 'inBattleGeneral', label: 'General', ext: null};
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_InBattleStatus_refresh =
  Window_InBattleStatus.prototype.refresh;
Window_InBattleStatus.prototype.refresh = function() {
  this.contents.clear();
  if (!this._battler) return;
  if (this._ibsMenuSymbol && this._ibsMenuSymbol !== 'inBattleGeneral') return;
  var x = this.standardPadding() + eval(Yanfly.Param.IBSStatusListWidth);
  var panelW = this.contents.width - x;
  var headerH = Yanfly.InBattleStatus_JakeMSGAdd.ibsMenuHeaderHeight(this);
  var entry = this._ibsMenuEntry ||
    {symbol: 'inBattleGeneral', label: 'General', ext: null};
  Yanfly.InBattleStatus_JakeMSGAdd.drawIBSMenuHeader(this, x, 0, panelW, entry,
    this._battler);
  var contentY = headerH;
  this.drawActorFace(this._battler, x, contentY, Window_Base._faceWidth);
  var x2 = x + Window_Base._faceWidth + this.standardPadding();
  var w = this.contents.width - x2;
  this.drawActorSimpleStatusWithGaugeNotetags(this._battler, x2, contentY, w);
  w = this.contents.width - x;
  var y = Math.max(contentY + Math.ceil(this.lineHeight() * 3.5),
    headerH + Math.ceil(this.lineHeight() * 1.5));
  var h = this.contents.height - y;
  if (h >= this.lineHeight() * 6) {
    for (var i = 2; i < 8; ++i) {
      this.drawParam(i, x, y, w, this.lineHeight());
      y += this.lineHeight();
    }
  } else {
    w = Math.floor(w / 2);
    x2 = x;
    for (var j = 2; j < 8; ++j) {
      this.drawParam(j, x2, y, w, this.lineHeight());
      if (j % 2 === 0) {
        x2 += w;
      } else {
        x2 = x;
        y += this.lineHeight();
      }
    }
  }
};

Window_InBattleStatus.prototype.actorGaugeSettings = function(actor) {
  var data = actor && actor.actor ? actor.actor() : null;
  return {
    showHp: data && data.showIBSHp !== undefined ? data.showIBSHp : true,
    showMp: data && data.showIBSMp !== undefined ? data.showIBSMp : true,
    showTp: data && data.showIBSTp !== undefined ? data.showIBSTp :
      !!Yanfly.Param.MenuTpGauge
  };
};

Window_InBattleStatus.prototype.drawActorSimpleStatusWithGaugeNotetags =
  function(actor, x, y, width) {
  var lineHeight = this.lineHeight();
  var x2 = x + 180;
  var width2 = Math.max(96, width - 180 - this.textPadding());
  var gaugeSettings = this.actorGaugeSettings(actor);
  this.drawActorName(actor, x, y);
  this.drawActorLevel(actor, x, y + lineHeight * 1);
  this.drawActorIcons(actor, x, y + lineHeight * 2);
  this.drawActorClass(actor, x2, y, width2);
  var gaugeY = y + lineHeight;
  if (gaugeSettings.showHp) {
    this.drawActorHp(actor, x2, gaugeY, width2);
    gaugeY += lineHeight;
  }
  if (gaugeSettings.showMp) {
    this.drawActorMp(actor, x2, gaugeY, width2);
    gaugeY += lineHeight;
  }
  if (gaugeSettings.showTp) {
    this.drawActorTp(actor, x2, gaugeY, width2);
  }
};

Yanfly.InBattleStatus_JakeMSGAdd.applySmallStatusTextMixin(Window_EnemyInBattleStatus);
Yanfly.InBattleStatus_JakeMSGAdd.applySmallStatusTextMixin(Window_InBattleStatus);
Yanfly.InBattleStatus_JakeMSGAdd.wrapWindowShowHideForSmallText(Window_EnemyInBattleStatus);
Yanfly.InBattleStatus_JakeMSGAdd.wrapWindowShowHideForSmallText(Window_InBattleStatus);

//=============================================================================
// Window_EnemyInBattleStateList
//=============================================================================

function Window_EnemyInBattleStateList() {
    this.initialize.apply(this, arguments);
}

Window_EnemyInBattleStateList.prototype = Object.create(Window_Selectable.prototype);
Window_EnemyInBattleStateList.prototype.constructor = Window_EnemyInBattleStateList;

Window_EnemyInBattleStateList.prototype.setSelectWindow = function(win) {
    this._enemySelectWindow = win;
};
Window_EnemyInBattleStateList.prototype.initialize = function(parentWindow) {
  this._parentWindow = parentWindow;
  this._battler = $gameTroop.members()[0];
  this._menuController = null;
  var x = parentWindow.x;
  var y = parentWindow.y;
  var width = eval(Yanfly.Param.EnemyIBSStatusListWidth);
  width += this.standardPadding() * 2;
  width = Math.ceil(width);
  var height = parentWindow.height;
  Window_Selectable.prototype.initialize.call(this, x, y, width, height);
  this.deactivate();
  this.backOpacity = 0;
  this.opacity = 0;
  this.hide();
  this._data = [];
};

Window_EnemyInBattleStateList.prototype.setStatusWindow = function(win) {
  this._statusWindow = win;
};

Window_EnemyInBattleStateList.prototype.setStatusInfoWindow = function(win) {
  this._statusInfoWindow = win;
};

Window_EnemyInBattleStateList.prototype.setMenuController = function(controller) {
  this._menuController = controller;
};

Window_EnemyInBattleStateList.prototype.setBattler = function(battler) {
  this._battler = battler;
  if ($gameTroop && $gameTroop.select) {
    $gameTroop.select(battler || null);
  }
  if (this._menuController) this._menuController.reset(battler);
  this._parentWindow.setBattler(battler);
  this.refresh();
  this.select(0);
};

Window_EnemyInBattleStateList.prototype.maxItems = function() {
  return this._data ? this._data.length : 1;
};

Window_EnemyInBattleStateList.prototype.item = function() {
  var index = this.index();
  return this._data && index >= 0 ? this._data[index] : null;
};

Window_EnemyInBattleStateList.prototype.includes = function(item) {
  if (!item) return false;
  if (item.name.length <= 0) return false;
  if (item.iconIndex <= 0) return false;
  return true;
};

Window_EnemyInBattleStateList.prototype.makeItemList = function() {
  this._data = [];
  if (this._battler) {
    var states = this._battler.states();
    var length = states.length;
    for (var i = 0; i < length; ++i) {
      var state = states[i];
      if (this.includes(state)) this._data.push(state);
    }
    for (var i = 0; i < 8; ++i) {
      if (this._battler.isBuffAffected(i) ||
      this._battler.isDebuffAffected(i)) {
        this._data.push('buff ' + i);
      }
    }
  }
  if (this._data.length <= 0) this._data.push(null);
};

Window_EnemyInBattleStateList.prototype.drawItem = function(index) {
  var item = this._data[index];
  var rect = this.itemRect(index);
  rect.width -= this.textPadding();
  if (item === null) {
    var icon = Yanfly.Param.EnemyIBSHealthyIcon;
    var text = Yanfly.Param.EnemyIBSHealthyText;
    var ibw = Window_Base._iconWidth + 4;
    this.resetTextColor();
    this.drawIcon(icon, rect.x + 2, rect.y + 2);
    this.drawText(text, rect.x + ibw, rect.y, rect.width - ibw);
  } else if (typeof item === 'string' && item.match(/BUFF[ ](\d+)/i)) {
    var paramId = parseInt(RegExp.$1);
    var level = this._battler._buffs[paramId];
    var icon = this._battler.buffIconIndex(level, paramId);
    var ibw = Window_Base._iconWidth + 4;
    this.drawIcon(icon, rect.x + 2, rect.y + 2);
    if (level > 0) {
      var text = Yanfly.Param.IBSBuffText[paramId];
    } else {
      var text = Yanfly.Param.IBSDebuffText[paramId];
    }
    this.drawText(text, rect.x + ibw, rect.y, rect.width - ibw);
    if (!Imported.YEP_BuffsStatesCore) return;
    this.drawBuffTurns(this._battler, paramId, rect.x + 2, rect.y);
    if (Yanfly.Param.BSCShowBuffRate) {
      this.drawBuffRate(this._battler, paramId, rect.x + 2, rect.y);
    }
  } else if (item) {
    this.drawItemName(item, rect.x, rect.y, rect.width);
    if (!Imported.YEP_BuffsStatesCore) return;
    if (item.autoRemovalTiming > 0) {
      this.drawStateTurns(this._battler, item, rect.x + 2, rect.y);
    }
    this.drawStateCounter(this._battler, item, rect.x + 2, rect.y);
  }
};

Window_EnemyInBattleStateList.prototype.updateHelp = function() {
  if (this.item() === null) {
    var text = Yanfly.Param.EnemyIBSHealthyHelp;
    this._helpWindow.setText(text);
  } else if (typeof this.item() === 'string' &&
  this.item().match(/BUFF[ ](\d+)/i)) {
    var paramId = parseInt(RegExp.$1);
    var level = this._battler._buffs[paramId];
    if (level > 0) {
      var fmt = Yanfly.Param.IBSBuffHelp[paramId];
    } else {
      var fmt = Yanfly.Param.IBSDebuffHelp[paramId];
    }
    var rate = Math.floor(this._battler.paramBuffRate(paramId) * 100);
    var turns = this._battler._buffTurns[paramId];
    var text = fmt.format(rate, Math.abs(level), turns);
    this._helpWindow.setText(text);
  } else if (this.item()) {
    this.setHelpWindowItem(this.item());
  }
};

Window_EnemyInBattleStateList.prototype.refresh = function() {
  this.makeItemList();
  this.createContents();
  this.drawAllItems();
};

Window_EnemyInBattleStateList.prototype.update = function() {
  Window_Selectable.prototype.update.call(this);
  if (this.active && this._battler) {
    this.updateLeftRight();
    if (this._menuController) this._menuController.updateInfoPosition();
  }
};

Window_EnemyInBattleStateList.prototype.updateLeftRight = function() {
  var members = $gameTroop.members();
  var index = members.indexOf(this._battler);
  var current = index;
  if (Input.isRepeated('left')) {
    index -= 1;
  } else if (Input.isRepeated('right')) {
    index += 1;
  }
  // Only cycle through alive enemies
  while (index >= 0 && index < members.length && !members[index].isAlive()) {
    if (current < index) index -= 1;
    else index += 1;
  }
  index = index.clamp(0, members.length - 1);
  if (current !== index && members[index] && members[index].isAlive()) {
    var battler = members[index];
    this.setBattler(battler);
    if (this._enemySelectWindow) {
      var idx = members.indexOf(battler);
      this._enemySelectWindow.selectEnemy(idx);
    }
    SoundManager.playCursor();
  }
};

//=============================================================================
// Window_EnemySelectList
//=============================================================================

function Window_EnemySelectList() {
    this.initialize.apply(this, arguments);
}

Window_EnemySelectList.prototype = Object.create(Window_Selectable.prototype);
Window_EnemySelectList.prototype.constructor = Window_EnemySelectList;

Window_EnemySelectList.prototype.initialize = function(statusWindow, stateWindow) {
  var x = eval(Yanfly.Param.EnemyIBSWinX);
  var y = eval(Yanfly.Param.EnemyIBSWinY) + eval(Yanfly.Param.EnemyIBSWinHeight) - this.fittingHeight(Math.max(1, $gameTroop.members().length));
  var w = eval(Yanfly.Param.EnemyIBSStatusListWidth) + this.standardPadding() * 2;
  var h = this.fittingHeight(Math.max(1, $gameTroop.members().length));
  Window_Selectable.prototype.initialize.call(this, x, y, w, h);
  this._statusWindow = statusWindow;
  this._stateWindow = stateWindow;
  this.deactivate();
  this.opacity = 255;
  this.backOpacity = 255;
  this.hide();
  this.refresh();
};

Window_EnemySelectList.prototype.maxItems = function() {
  return $gameTroop.members().length;
};

Window_EnemySelectList.prototype.itemHeight = function() {
  return this.lineHeight();
};

Window_EnemySelectList.prototype.drawItem = function(index) {
  var enemy = $gameTroop.members()[index];
  if (!enemy) return;
  var rect = this.itemRect(index);
  var isAlive = enemy.isAlive();
  if (!isAlive) this.changePaintOpacity(false);
  this.drawText(enemy.name(), rect.x, rect.y, rect.width);
  this.changePaintOpacity(true);
};

Window_EnemySelectList.prototype.selectEnemy = function(index) {
  if (index >= 0 && index < $gameTroop.members().length) {
    var enemy = $gameTroop.members()[index];
    if (enemy && enemy.isAlive()) {
      this.select(index);
      this._stateWindow.setBattler(enemy);
    }
  }
};

Window_EnemySelectList.prototype.update = function() {
  Window_Selectable.prototype.update.call(this);
  if (this.active) {
    if (Input.isTriggered('up') || Input.isRepeated('left')) {
      this.selectPreviousAliveEnemy();
    } else if (Input.isTriggered('down') || Input.isRepeated('right')) {
      this.selectNextAliveEnemy();
    }
  }
};

Window_EnemySelectList.prototype.selectNextAliveEnemy = function() {
  var members = $gameTroop.members();
  var startIndex = this.index();
  var index = startIndex + 1;
  while (index < members.length) {
    if (members[index] && members[index].isAlive()) {
      this.selectEnemy(index);
      SoundManager.playCursor();
      return;
    }
    index += 1;
  }
  // Wrap around to beginning
  index = 0;
  while (index < startIndex) {
    if (members[index] && members[index].isAlive()) {
      this.selectEnemy(index);
      SoundManager.playCursor();
      return;
    }
    index += 1;
  }
};

Window_EnemySelectList.prototype.selectPreviousAliveEnemy = function() {
  var members = $gameTroop.members();
  var startIndex = this.index();
  var index = startIndex - 1;
  while (index >= 0) {
    if (members[index] && members[index].isAlive()) {
      this.selectEnemy(index);
      SoundManager.playCursor();
      return;
    }
    index -= 1;
  }
  // Wrap around to end
  index = members.length - 1;
  while (index > startIndex) {
    if (members[index] && members[index].isAlive()) {
      this.selectEnemy(index);
      SoundManager.playCursor();
      return;
    }
    index -= 1;
  }
};

//=============================================================================
// Scene_Battle
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_createAllWindows =
  Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_createAllWindows.call(this);
  this.createEnemyInBattleStatusWindows();
  this.createAllyInBattleStatusInfoWindow();
  this._returnToStatusCommandGroup = false;
};

Scene_Battle.prototype.createAllyInBattleStatusInfoWindow = function() {
  if (!Imported.YEP_StatusMenuCore) return;
  if (!this._inBattleStatusWindow) return;
  this._allyInBattleStatusInfoWindow = new Window_InBattleStatusInfo();
  this.addChild(this._allyInBattleStatusInfoWindow);
  if (this._inBattleStateList) {
    this._inBattleStateList.setStatusInfoWindow(this._allyInBattleStatusInfoWindow);
    this._allyMenuController =
      new Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController(
        this._inBattleStateList, this._inBattleStatusWindow,
        this._allyInBattleStatusInfoWindow, Yanfly.Param.IBSStatusListWidth);
    this._inBattleStateList.setMenuController(this._allyMenuController);
  }
};

Scene_Battle.prototype.createEnemyInBattleStatusWindows = function() {
  this._enemyInBattleStatusWindow = new Window_EnemyInBattleStatus();
  this.addChild(this._enemyInBattleStatusWindow);
  var win = this._enemyInBattleStatusWindow;
  if (Imported.YEP_StatusMenuCore) {
    this._enemyInBattleStatusInfoWindow = new Window_InBattleStatusInfo();
    this.addChild(this._enemyInBattleStatusInfoWindow);
  }
  this._enemyInBattleStateList = new Window_EnemyInBattleStateList(win);
  this._enemyInBattleStateList.setHelpWindow(this._helpWindow);
  if (this._enemyInBattleStatusInfoWindow) {
    this._enemyInBattleStateList.setStatusInfoWindow(
      this._enemyInBattleStatusInfoWindow);
    this._enemyMenuController =
      new Yanfly.InBattleStatus_JakeMSGAdd.InBattleStatusMenuController(
        this._enemyInBattleStateList, win, this._enemyInBattleStatusInfoWindow,
        Yanfly.Param.EnemyIBSStatusListWidth);
    this._enemyInBattleStateList.setMenuController(this._enemyMenuController);
  }
  this.addChild(this._enemyInBattleStateList);
  this._enemySelectList = new Window_EnemySelectList(win, this._enemyInBattleStateList);
  this.addChild(this._enemySelectList);
  // link the two windows so movement stays in sync
  this._enemyInBattleStateList.setSelectWindow(this._enemySelectList);
  // mirror ally status flow: enter state list directly, one cancel exits
  this._enemyInBattleStateList.setHandler('cancel',
    this.onEnemyInBattleStatusCancel.bind(this));
};

Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_createPartyCommandWindow =
  Scene_Battle.prototype.createPartyCommandWindow;
Scene_Battle.prototype.createPartyCommandWindow = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_createPartyCommandWindow.call(this);
  var win = this._partyCommandWindow;
  win.setHandler('statusCommandGroup', this.commandStatusCommandGroup.bind(this));
  win.setHandler('enemyInBattleStatus', this.commandEnemyInBattleStatus.bind(this));
  this.createStatusCommandGroupWindow();
};

Scene_Battle.prototype.createStatusCommandGroupWindow = function() {
  this._statusCommandGroupWindow = new Window_StatusCommandGroup();
  this._statusCommandGroupWindow.setHandler('inBattleStatus',
    this.commandInBattleStatus.bind(this));
  this._statusCommandGroupWindow.setHandler('enemyInBattleStatus',
    this.commandEnemyInBattleStatus.bind(this));
  this._statusCommandGroupWindow.setHandler('cancel',
    this.onStatusCommandGroupCancel.bind(this));
  this.addWindow(this._statusCommandGroupWindow);
};

Scene_Battle.prototype.commandStatusCommandGroup = function() {
  this._returnToStatusCommandGroup = false;
  this.openStatusCommandGroupWindow();
};

Scene_Battle.prototype.openStatusCommandGroupWindow = function() {
  var win = this._statusCommandGroupWindow;
  if (!win) return;
  win.refresh();
  if (win.maxItems() <= 0) {
    this._partyCommandWindow.show();
    this._partyCommandWindow.activate();
    return;
  }
  win.x = this._partyCommandWindow.x;
  win.y = this._partyCommandWindow.y;
  win.show();
  win.activate();
  win.selectLast();
  this._partyCommandWindow.hide();
  this._partyCommandWindow.deactivate();
};

Scene_Battle.prototype.onStatusCommandGroupCancel = function() {
  this._returnToStatusCommandGroup = false;
  this.hideStatusCommandGroupWindow();
  this._partyCommandWindow.activate();
};

Scene_Battle.prototype.hideStatusCommandGroupWindow = function() {
  if (!this._statusCommandGroupWindow) return;
  this._statusCommandGroupWindow.hide();
  this._statusCommandGroupWindow.deactivate();
  this._statusCommandGroupWindow.deselect();
  this._partyCommandWindow.show();
};

Scene_Battle.prototype.prepareStatusCommandGroupChild = function() {
  var win = this._statusCommandGroupWindow;
  if (!win || !win.visible) {
    this._returnToStatusCommandGroup = false;
    return false;
  }
  Window_StatusCommandGroup._lastCommandSymbol = win.currentSymbol();
  this._returnToStatusCommandGroup = true;
  win.deactivate();
  win.hide();
  return true;
};

Scene_Battle.prototype.restoreStatusCommandGroupAfterChild = function() {
  if (!this._returnToStatusCommandGroup) return false;
  this._returnToStatusCommandGroup = false;
  this.openStatusCommandGroupWindow();
  var win = this._statusCommandGroupWindow;
  return !!(win && win.visible && win.active);
};

Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_commandInBattleStatus =
  Scene_Battle.prototype.commandInBattleStatus;
Scene_Battle.prototype.commandInBattleStatus = function() {
  this.prepareStatusCommandGroupChild();
  Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_commandInBattleStatus.call(this);
  if (this._inBattleStatusWindow && this._inBattleStatusWindow.jakeMSGDrawSmallStatusText) {
    this._inBattleStatusWindow.jakeMSGDrawSmallStatusText();
  }
  if (this._allyInBattleStatusInfoWindow) this._allyInBattleStatusInfoWindow.hide();
};

Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_onInBattleStatusCancel =
  Scene_Battle.prototype.onInBattleStatusCancel;
Scene_Battle.prototype.onInBattleStatusCancel = function() {
  if (this._allyInBattleStatusInfoWindow) this._allyInBattleStatusInfoWindow.hide();
  Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_onInBattleStatusCancel.call(this);
  if (this.restoreStatusCommandGroupAfterChild()) return;
  this._partyCommandWindow.show();
};

Scene_Battle.prototype.commandEnemyInBattleStatus = function() {
  this.prepareStatusCommandGroupChild();
  this._helpWindow.show();
  this._enemyInBattleStatusWindow.show();
  this._enemyInBattleStatusWindow.jakeMSGDrawSmallStatusText();
  if (this._enemyInBattleStatusInfoWindow) this._enemyInBattleStatusInfoWindow.hide();
  this._enemyInBattleStateList.show();
  this._enemySelectList.hide();
  this._enemySelectList.deactivate();
  this._enemyInBattleStateList.activate();
  var members = $gameTroop.members();
  var battler = null;
  for (var i = 0; i < members.length; i++) {
    if (members[i] && members[i].isAlive()) {
      battler = members[i];
      break;
    }
  }
  if (!battler) battler = members[0];
  if (battler) {
    this._enemyInBattleStateList.setBattler(battler);
  } else if ($gameTroop && $gameTroop.select) {
    $gameTroop.select(null);
  }
};

Scene_Battle.prototype.onEnemyInBattleStatusCancel = function() {
  this._helpWindow.hide();
  this._enemyInBattleStatusWindow.hide();
  if (this._enemyInBattleStatusInfoWindow) this._enemyInBattleStatusInfoWindow.hide();
  this._enemyInBattleStateList.hide();
  this._enemySelectList.hide();
  this._enemySelectList.deactivate();
  this._enemyInBattleStateList.deactivate();
  if ($gameTroop && $gameTroop.select) {
    $gameTroop.select(null);
  }
  if (this.restoreStatusCommandGroupAfterChild()) return;
  this._partyCommandWindow.show();
  this._partyCommandWindow.activate();
};

Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_isAnyInputWindowActive =
  Scene_Battle.prototype.isAnyInputWindowActive;
Scene_Battle.prototype.isAnyInputWindowActive = function() {
  if (this._statusCommandGroupWindow && this._statusCommandGroupWindow.active) return true;
  if (this._enemySelectList && this._enemySelectList.active) return true;
  if (this._enemyInBattleStateList && this._enemyInBattleStateList.active) return true;
  return Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_isAnyInputWindowActive.call(this);
};
























//=============================================================================
// Window_InBattleStateList
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.Window_InBattleStateList_setBattler =
  Window_InBattleStateList.prototype.setBattler;
Window_InBattleStateList.prototype.setBattler = function(battler) {
  if (this._menuController) this._menuController.reset(battler);
  Yanfly.InBattleStatus_JakeMSGAdd.Window_InBattleStateList_setBattler.call(
    this, battler);
};

Window_InBattleStateList.prototype.setStatusInfoWindow = function(win) {
  this._statusInfoWindow = win;
};

Window_InBattleStateList.prototype.setMenuController = function(controller) {
  this._menuController = controller;
};

Yanfly.InBattleStatus_JakeMSGAdd.Window_InBattleStateList_update =
  Window_InBattleStateList.prototype.update;
Window_InBattleStateList.prototype.update = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.Window_InBattleStateList_update.call(this);
  if (this.active && this._menuController) {
    this._menuController.updateInfoPosition();
  }
};

//=============================================================================
// Scene_Battle Menu Cycling
//=============================================================================

Scene_Battle.prototype.jakeMSGCycleInBattleStatusMenu = function() {
  if (this._inBattleStateList && this._inBattleStateList.active &&
  this._allyMenuController) {
    if (this._allyMenuController.cycle(this._inBattleStateList._battler)) {
      SoundManager.playCursor();
      return true;
    }
  }
  if (this._enemyInBattleStateList && this._enemyInBattleStateList.active &&
  this._enemyMenuController) {
    if (this._enemyMenuController.cycle(this._enemyInBattleStateList._battler)) {
      SoundManager.playCursor();
      return true;
    }
  }
  return false;
};

//=============================================================================
// Graphics Key Handler
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.Graphics_onKeyDown = Graphics._onKeyDown;
Graphics._onKeyDown = function(event) {
  if (event.keyCode === Yanfly.Param.IBSMenuCycleKey) {
    var scene = SceneManager._scene;
    if (scene && scene.jakeMSGCycleInBattleStatusMenu &&
    scene.jakeMSGCycleInBattleStatusMenu()) {
      event.preventDefault();
      return;
    }
  }
  Yanfly.InBattleStatus_JakeMSGAdd.Graphics_onKeyDown.call(this, event);
};

//=============================================================================
// End of File
//=============================================================================
};
