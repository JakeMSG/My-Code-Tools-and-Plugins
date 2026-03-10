//=============================================================================
// Addition to YEP plugin "YEP_X_InBattleStatus", made by JakeMSG
// JakeMSG_YEP_X_InBattleStatus_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_X_InBattleStatus_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.InBattleStatus_JakeMSGAdd = Yanfly.InBattleStatus_JakeMSGAdd || {};
Yanfly.InBattleStatus_JakeMSGAdd.version = 1.0;

//=============================================================================
 /*:
 * @plugindesc v1.0 (Requires YEP_X_InBattleStatus.js) Adds an Enemy Status 
 * command to view enemy troop status effects, buffs, and debuffs.
 * @author JakeMSG
 * v1.0
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
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.0:
 * - Finished Plugin!
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
// Window_PartyCommand
//=============================================================================

Yanfly.InBattleStatus_JakeMSGAdd.Window_PartyCommand_makeCommandList =
  Window_PartyCommand.prototype.makeCommandList;
Window_PartyCommand.prototype.makeCommandList = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.Window_PartyCommand_makeCommandList.call(this);
  this.makeEnemyInBattleStatusCommand();
};

Window_PartyCommand.prototype.makeEnemyInBattleStatusCommand = function() {
  if (!$gameSystem.isShowEnemyInBattleStatus()) return;
  var index = this.findSymbol('escape');
  var text = Yanfly.Param.EnemyIBSCmdName;
  this.addCommandAt(index, text, 'enemyInBattleStatus', true);
};

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
  Window_Base.prototype.initialize.call(this, x, y, w, h);
  this.hide();
};

Window_EnemyInBattleStatus.prototype.setBattler = function(battler) {
  this._battler = battler;
  this.refresh();
};

Window_EnemyInBattleStatus.prototype.refresh = function() {
  this.contents.clear();
  if (!this._battler) return;
  var x = this.standardPadding() + eval(Yanfly.Param.EnemyIBSStatusListWidth);
  var x2 = x + this.standardPadding();
  var w = this.contents.width - x2;
  this.drawEnemyName(this._battler, x2, 0, w);
  this.drawEnemyHp(this._battler, x2, this.lineHeight(), w);
  this.drawEnemyMp(this._battler, x2, this.lineHeight() * 2, w);
  w = this.contents.width - x;
  var y = Math.ceil(this.lineHeight() * 4.5);
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
  this.changeTextColor(this.systemColor());
  this.drawText('HP:', x, y, 80);
  var gaugeX = x + 80;
  var gaugeWidth = width - 80;
  var rate = enemy.mhp > 0 ? enemy.hp / enemy.mhp : 0;
  this.drawGauge(gaugeX, y, gaugeWidth, rate, this.hpGaugeColor1(), this.hpGaugeColor2());
  this.changeTextColor(this.normalColor());
  var text = enemy.hp + '/' + enemy.mhp;
  this.drawText(text, gaugeX, y, gaugeWidth, 'right');
};

Window_EnemyInBattleStatus.prototype.drawEnemyMp = function(enemy, x, y, width) {
  this.changeTextColor(this.systemColor());
  this.drawText('MP:', x, y, 80);
  var gaugeX = x + 80;
  var gaugeWidth = width - 80;
  var rate = enemy.mmp > 0 ? enemy.mp / enemy.mmp : 0;
  this.drawGauge(gaugeX, y, gaugeWidth, rate, this.mpGaugeColor1(), this.mpGaugeColor2());
  this.changeTextColor(this.normalColor());
  var text = enemy.mp + '/' + enemy.mmp;
  this.drawText(text, gaugeX, y, gaugeWidth, 'right');
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

Window_EnemyInBattleStateList.prototype.setBattler = function(battler) {
  this._battler = battler;
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
  if (this.active && this._battler) this.updateLeftRight();
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
};

Scene_Battle.prototype.createEnemyInBattleStatusWindows = function() {
  this._enemyInBattleStatusWindow = new Window_EnemyInBattleStatus();
  this.addChild(this._enemyInBattleStatusWindow);
  var win = this._enemyInBattleStatusWindow;
  this._enemyInBattleStateList = new Window_EnemyInBattleStateList(win);
  this._enemyInBattleStateList.setHelpWindow(this._helpWindow);
  this.addChild(this._enemyInBattleStateList);
  this._enemySelectList = new Window_EnemySelectList(win, this._enemyInBattleStateList);
  this.addChild(this._enemySelectList);
  // link the two windows so movement stays in sync
  this._enemyInBattleStateList.setSelectWindow(this._enemySelectList);
  // handlers
  this._enemySelectList.setHandler('ok', this.onEnemySelectOk.bind(this));
  this._enemySelectList.setHandler('cancel', 
    this.onEnemyInBattleStatusCancel.bind(this));
  this._enemyInBattleStateList.setHandler('cancel', 
    this.onEnemyStateCancel.bind(this));
};

Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_createPartyCommandWindow =
  Scene_Battle.prototype.createPartyCommandWindow;
Scene_Battle.prototype.createPartyCommandWindow = function() {
  Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_createPartyCommandWindow.call(this);
  var win = this._partyCommandWindow;
  win.setHandler('enemyInBattleStatus', this.commandEnemyInBattleStatus.bind(this));
};

Scene_Battle.prototype.commandEnemyInBattleStatus = function() {
  this._helpWindow.show();
  this._enemyInBattleStatusWindow.show();
  this._enemyInBattleStateList.show();
  this._enemySelectList.show();
  // start with the enemy list active so player can choose one
  this._enemySelectList.activate();
  this._enemyInBattleStateList.deactivate();
  var members = $gameTroop.members();
  var firstAliveEnemy = members.find(function(enemy) { return enemy.isAlive(); });
  if (firstAliveEnemy) {
    this._enemySelectList.selectEnemy(members.indexOf(firstAliveEnemy));
  }
};

Scene_Battle.prototype.onEnemyInBattleStatusCancel = function() {
  this._helpWindow.hide();
  this._enemyInBattleStatusWindow.hide();
  this._enemyInBattleStateList.hide();
  this._enemySelectList.hide();
  this._enemySelectList.deactivate();
  this._enemyInBattleStateList.deactivate();
  this._partyCommandWindow.activate();
};

// navigate from enemy list into state list
Scene_Battle.prototype.onEnemySelectOk = function() {
  var index = this._enemySelectList.index();
  var enemy = $gameTroop.members()[index];
  if (enemy && enemy.isAlive()) {
    this._enemyInBattleStateList.setBattler(enemy);
  }
  this._enemySelectList.deactivate();
  this._enemyInBattleStateList.activate();
};

// return from state list back to enemy list
Scene_Battle.prototype.onEnemyStateCancel = function() {
  this._enemyInBattleStateList.deactivate();
  this._enemySelectList.activate();
};

Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_isAnyInputWindowActive =
  Scene_Battle.prototype.isAnyInputWindowActive;
Scene_Battle.prototype.isAnyInputWindowActive = function() {
  if (this._enemySelectList && this._enemySelectList.active) return true;
  if (this._enemyInBattleStateList && this._enemyInBattleStateList.active) return true;
  return Yanfly.InBattleStatus_JakeMSGAdd.Scene_Battle_isAnyInputWindowActive.call(this);
};
























//=============================================================================
// End of File
//=============================================================================
};
