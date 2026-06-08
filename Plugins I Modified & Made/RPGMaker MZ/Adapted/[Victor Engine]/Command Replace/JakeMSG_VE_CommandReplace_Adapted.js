/*
 * ==============================================================================
 * ** JakeMSG - VE Command Replace Adapted (MZ)
 * ------------------------------------------------------------------------------
 * Version History:
 *  v 1.00 - 2016.01.19 > First release.
 *  v 1.01 - 2016.02.02 > Compatibility with Mix Actions.
 *  v 1.02 - 2016.03.15 > Improved code for better handling script codes.
 *  v 1.03 - 2016.04.21 > Added remove and add command options.
 * ==============================================================================
 */

var Imported = Imported || {};
Imported['JakeMSG_VE_CommandReplace_Adapted'] = '1.03';
Imported['VE - Command Replace'] = Imported['VE - Command Replace'] || Imported['JakeMSG_VE_CommandReplace_Adapted'];

var VictorEngine = VictorEngine || {};
VictorEngine.CommandReplace = VictorEngine.CommandReplace || {};

(function() {

	VictorEngine.CommandReplace.loadDatabase = DataManager.loadDatabase;
	DataManager.loadDatabase = function() {
		VictorEngine.CommandReplace.loadDatabase.call(this);
		PluginManager.requiredPlugin.call(PluginManager, 'JakeMSG_VE_CommandReplace_Adapted', 'JakeMSG_VE_BasicModule_Adapted', '1.18');
	};

	VictorEngine.CommandReplace.requiredPlugin = PluginManager.requiredPlugin;
	PluginManager.requiredPlugin = function(name, required, version) {
		if (!VictorEngine.BasicModule) {
			var msg = 'The plugin ' + name + ' requires the plugin ' + required;
			msg += ' v' + version + ' or higher installed to work properly.';
			msg += ' Go to http://victorenginescripts.wordpress.com/ to download the plugin.';
			throw new Error(msg);
		} else {
			VictorEngine.CommandReplace.requiredPlugin.call(this, name, required, version)
		};
	};
	
})();

/*:
 * ------------------------------------------------------------------------------
 * @target MZ
 * @plugindesc v1.03 - Replace actor commands with another under certain conditions.
 * @author Victor Sant
 *
 * ------------------------------------------------------------------------------
 * @help 
 * ------------------------------------------------------------------------------
 * Actors, Classes, Weapons, Armors and States Notetags:
 * ------------------------------------------------------------------------------
 *  
 *  <command replace: 'replace', 'name'[, type]>
 *   result = code
 *  </command replace>
 *   This tag allows to replace the command with another command.
 *   This setting is divided on 4 parts:
 *     'replace' : name of the command to be replaced, always in quotations.
 *     'name' : name of the new command,always in quotations.
 *     type   : type of the command. (see bellow)
 *     code   : code that will enable or disable the replace.
 *
 * ------------------------------------------------------------------------------
 * Additional Information:
 * ------------------------------------------------------------------------------
 * 
 *  The code uses the same values as the damage formula, so you can use "a" for
 *  the user, "v[x]" for variable. The 'result' must return a true/false value.
 *
 * ---------------
 *
 *  - Command to Replace
 *  The name must be exactly the same as the command to be replaced, it is case
 *  sensitive and must be always in quotations. 
 *
 *  You can leave it blank (keep the quotations), if you do, the new command will
 *  be added, instead of replacing an old command.
 *
 * ---------------
 *
 *  - Command Name
 *  Name of the new command, must be always in quotations.
 *
 *  You can leave it blank (keep the quotations), if you do, you will remove the
 *  old command, without adding any new command.
 *
 * ---------------
 *
 *  - Command Type 
 *  The type of the command must be one of the follower values:
 *  attack, guard, skill, item, direct skill, direct item.
 *    attack : the new command is a physical attack.
 *    guard  : the new command is a guard action.
 *    skill type id : the new command is a skill list, id is the skill type Id.
 *    item type id  : the new command is a item list, id is the item type Id.
 *    skill id : the new command is a direct skill, id is the skill Id. *
 *    item id  : the new command is a direct item, id is the item Id. *
 *    mix action : the new command is a mix action. **
 *  *  The 'skill' and 'item' requres the plugin 'Direct Commands'.
 *  ** The 'mix action' requres the plugin 'Mix Actions'. The new mix command
 *     must be the same as the command name set here.
 *
 *  You can ommit the type, if you do, only the command name will be changed
 *  but it will keep the same function.
 * 
 * ------------------------------------------------------------------------------
 * Example Notetags:
 * ------------------------------------------------------------------------------
 *
 *  <command replace: 'Attack', 'Limit', skill type 4>
 *   result = a.tp == 100;
 *  </command replace>
 *   Replace the 'Attack' command with the command 'Limit', wich allows to select
 *   skills from the skill type 4, when the actor tp is equal 100.
 *
 * ---------------
 *
 *  <command replace: 'Magic', 'Sorcery', skill type 3>
 *   result = a.isDying();
 *  </command replace>
 *   Replace the Magic command with the command 'Sorcery' wich allows to select
 *   skills from the skill type 3, while the actor have less than 1/4 of the HP.
 *
 * ---------------
 *
 *  <command replace: 'Steal', 'Mug', skill 100>
 *   result = true;
 *  </command replace>
 *   Replace the 'Steal' command with the command 'Mug' wich allows use the skill
 *   id 100 directly from the command menu (require plugin "Direct Commands").
 *   The result is always true so this command will replace the steal command
 *   whenever it is available.
 *
 * ---------------
 *
 *  <command replace: 'Item', 'Mix', mix action>
 *   if (a.actorId() === 1 || a.actorId() === 2) {
 *       result = true;
 *   } else {
 *       result = false;
 *   }
 *  </command replace>
 *   Replace the 'Item' command with the command 'Mix' wich allows use the mix
 *   command name 'Mix' menu (require plugin "Mix Actions"), if the actor id is
 *   equal 1 or 2.
 *
 * ---------------
 *
 *  <command replace: '', 'Meditate', skill type 5>
 *   result = a.mpRate() < 0.5;
 *  </command replace>
 *   Adds the command 'Meditate', wich allows to select skills from the skill
 *  type 5, when the actor mp is lower than 50%.
 *
 * ---------------
 *
 *  <command replace: 'Passive', ''>
 *   result = $gameParty.inBattle();
 *  </command replace>
 *   Remove the command 'Paasive' while on battle.
 *
 * ------------------------------------------------------------------------------
 */

(function() {
	
	//=============================================================================
	// VictorEngine
	//=============================================================================
	
	VictorEngine.CommandReplace.loadNotetagsValues = VictorEngine.loadNotetagsValues;
	VictorEngine.loadNotetagsValues = function(data, index) {
		VictorEngine.CommandReplace.loadNotetagsValues.call(this, data, index);
		var list = ['actor', 'class', 'weapon', 'armor', 'state'];
		if (this.objectSelection(index, list)) VictorEngine.CommandReplace.loadNotes(data);
	};
	
	VictorEngine.CommandReplace.loadNotes = function(data) {
		this.ensureNotes(data);
	};
	
	VictorEngine.CommandReplace.ensureNotes = function(data) {
		if (!data) {
			return [];
		}
		if (!data._jakeCommandReplaceLoaded) {
			data.commandReplace = [];
			this.processNotes(data);
			data._jakeCommandReplaceLoaded = true;
		} else {
			data.commandReplace = data.commandReplace || [];
		}
		return data.commandReplace;
	};
	
	VictorEngine.CommandReplace.processNotes = function(data) {
		var match;
		var regex = /<command replace[ ]*:[ ]*('[^']*'|"[^"]*")[ ]*,[ ]*('[^']*'|"[^"]*")(?:[ ]*,[ ]*(attack|guard|skill type|item type|skill|item|mix action)[ ]*(\d+)?[ ]*)?>([\s\S]*?)<\/command replace>/gi;
		while ((match = regex.exec(data.note)) !== null) { this.processValues(data, match) };
	};
		
	VictorEngine.CommandReplace.processValues = function(data, match) {
		var value;
		var result = {};
		result.replace = match[1].slice(1, -1).trim();
		result.name = match[2].slice(1, -1).trim();
		result.type = match[3] ? match[3].toLowerCase() : '';
		result.id   = Number(match[4]) || 0;
		result.code = match[5].trim();
		data.commandReplace.push(result);
	};
		
	//=============================================================================
	// Game_Actor
	//=============================================================================
	
	Game_Actor.prototype.getAllCommandReplace = function() {
		return this.traitObjects().reduce(function(r, data) {
			return r.concat(VictorEngine.CommandReplace.ensureNotes(data));
		}, []);
	};
	
	//=============================================================================
	// Window_Command
	//=============================================================================
	
	Window_Command.prototype.replaceCommands = function() {
		var newCommands = this.newCommandsList();
		for (var i = 0; i < newCommands.length; i++) {
			var command = newCommands[i]
			if (command.replace === '') {
				command._jakeCommandReplace = true;
				this._list.splice(this._list.length - 1, 0, command);
			} else {
				this.replaceNewCommand(command);
			}
		};
	};
	
	Window_Command.prototype.newCommandsList = function() {
		var object   = this;
		return this._actor.getAllCommandReplace().reduce(function(r, command) {
			var condition = object.commandCondition(command);
			return condition ? r.concat(object.setupNewCommand(command)) : r;
		}, []).sort(function(a, b) { return b.priority - a.priority });
	};
	
	Window_Command.prototype.replaceNewCommand = function(newCommand) {
		var replaceName = this.commandReplaceName(newCommand.replace);
		for (var i = 0; i < this._list.length; i++) {
			var command = this._list[i];
			if (replaceName === this.commandReplaceName(command.name)) {
				if (newCommand.name === '') {
					this._list.splice(i, 1);
					i--;
				} else if (newCommand.type === '') {
					command.name = newCommand.name;
					command._jakeCommandReplace = true;
				} else {
					this._list.splice(i, 1, this.setupReplacedCommand(command, newCommand));
				}
			}
		}
	};
	
	Window_Command.prototype.setupReplacedCommand = function(baseCommand, newCommand) {
		var result = {};
		for (var key in baseCommand) {
			if (baseCommand.hasOwnProperty(key)) {
				result[key] = baseCommand[key];
			}
		}
		for (var newKey in newCommand) {
			if (newCommand.hasOwnProperty(newKey)) {
				result[newKey] = newCommand[newKey];
			}
		}
		result._jakeCommandReplace = true;
		result.align = result.align || this.itemTextAlign();
		result.textAlign = result.textAlign || this.itemTextAlign();
		return result;
	};

	Window_Command.prototype.commandReplaceName = function(name) {
		var text = String(name || '');
		text = text.replace(/\x1b[A-Z]+(?:\[[^\]]*\])?/gi, '');
		text = text.replace(/\\[A-Z]+(?:\[[^\]]*\])?/gi, '');
		return text.replace(/\s+/g, ' ').trim().toLowerCase();
	};
	
	Window_Command.prototype.commandCondition = function(command) {
		if (!command || !command.code) {
			return false;
		}
		var result = false;
		var a = this._actor;
		var v = $gameVariables._data;
		eval(command.code);
		return result;
	};
	
	Window_Command.prototype.setupNewCommand = function(command) {
		var result = {}
		result.replace = command.replace;
		result.name    = command.name;
		result.ext     = command.id || command.name || 0;
		result.symbol  = this.setupCommandSymbol(command);
		result.enabled = this.setupUsableCommand(command);
		result._jakeCommandReplace = true;
		result.align = this.itemTextAlign();
		result.textAlign = this.itemTextAlign();
		result.priority = command.replace === '' ? 2 : command.name === '' ? 0 : 1;
		return result;
	};
		
	Window_Command.prototype.setupUsableCommand = function(command) {
		switch (command.type) {
		case 'attack':
			return this._actor.canAttack();
		case 'guard':
			return this._actor.canGuard();
		case 'skill':
			return this._actor.canUse($dataSkills[command.id]);
		case 'item':
			return this._actor.canUse($dataItems[command.id]);
		case 'item type': case 'skill type': case 'mix action':
			return true;
		default:
			return false;
		};
	};
		
	Window_Command.prototype.setupCommandSymbol = function(command) {
		switch (command.type) {
		case 'skill':
			return 'direct skill';
		case 'item':
			return 'direct item';
		case 'item type': 
			return 'item';
		case 'skill type':
			return 'skill';
		default:
			return command.type;
		};
	};
	
	Window_Command.prototype.applyCommandReplace = function() {
		if (!this._actor || !this.replaceCommands || this._jakeApplyingCommandReplace || this._jakeCommandReplaceApplied) {
			return;
		}
		this._jakeApplyingCommandReplace = true;
		this.replaceCommands();
		if (this.index && this.maxItems && this.index() >= this.maxItems()) {
			this.select(Math.max(this.maxItems() - 1, 0));
		}
		Window_Selectable.prototype.refresh.call(this);
		this._jakeApplyingCommandReplace = false;
		this._jakeCommandReplaceApplied = true;
	};
	
	Window_Command.prototype.isCommandReplaceEntry = function(index) {
		var command = this._list && this._list[index];
		return !!(command && command._jakeCommandReplace);
	};
	
	Window_Command.prototype.drawCommandReplaceItem = function(index) {
		var rect = this.itemLineRect(index);
		this.resetTextColor();
		this.changePaintOpacity(this.isCommandEnabled(index));
		this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
	};
	//=============================================================================
	// Window_ActorCommand
	//=============================================================================
	
	VictorEngine.CommandReplace.wrapActorCommand = function() {
		var original = Window_ActorCommand.prototype.refresh;
		if (original._jakeCommandReplaceWrapped) {
			return;
		}
		var wrapped = function() {
			this._jakeCommandReplaceApplied = false;
			original.call(this);
			this.applyCommandReplace();
		};
		wrapped._jakeCommandReplaceWrapped = true;
		Window_ActorCommand.prototype.refresh = wrapped;
	};
	
	VictorEngine.CommandReplace.wrapActorCommandDrawItem = function() {
		var original = Window_ActorCommand.prototype.drawItem;
		if (original._jakeCommandReplaceWrapped) {
			return;
		}
		var wrapped = function(index) {
			if (this.isCommandReplaceEntry(index)) {
				this.drawCommandReplaceItem(index);
			} else {
				original.call(this, index);
			}
		};
		wrapped._jakeCommandReplaceWrapped = true;
		Window_ActorCommand.prototype.drawItem = wrapped;
	};
	
	//=============================================================================
	// Window_SkillType
	//=============================================================================
	
	VictorEngine.CommandReplace.wrapSkillType = function() {
		var original = Window_SkillType.prototype.refresh;
		if (original._jakeCommandReplaceWrapped) {
			return;
		}
		var wrapped = function() {
			this._jakeCommandReplaceApplied = false;
			original.call(this);
			this.applyCommandReplace();
		};
		wrapped._jakeCommandReplaceWrapped = true;
		Window_SkillType.prototype.refresh = wrapped;
	};
	
	VictorEngine.CommandReplace.applyCommandReplaceHooks = function() {
		this.wrapActorCommand();
		this.wrapActorCommandDrawItem();
		this.wrapSkillType();
	};
	
	VictorEngine.CommandReplace.applyCommandReplaceHooks();
	
	VictorEngine.CommandReplace.sceneBootStart = Scene_Boot.prototype.start;
	Scene_Boot.prototype.start = function() {
		VictorEngine.CommandReplace.applyCommandReplaceHooks();
		VictorEngine.CommandReplace.sceneBootStart.call(this);
	};
	
	VictorEngine.CommandReplace.startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
	Scene_Battle.prototype.startActorCommandSelection = function() {
		VictorEngine.CommandReplace.startActorCommandSelection.call(this);
		if (this._actorCommandWindow) {
			this._actorCommandWindow.applyCommandReplace();
		}
	};
	
})();