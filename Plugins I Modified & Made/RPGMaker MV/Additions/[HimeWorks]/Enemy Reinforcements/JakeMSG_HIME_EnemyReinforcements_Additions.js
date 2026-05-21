//=============================================================================
// Addition to YEP plugin "Message Core", made by JakeMSG
// JakeMSG_HIME_EnemyReinforcements_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_HIME_EnemyReinforcements_Additions = true;

//=============================================================================
 /*:
 * @plugindesc v1.0 (Requires YEP_MessageCore.js) Additions to the base
 * Hime EnemyReinforcements plugin
 * @author JakeMSG
 * v1.0
 * 
============ Change Log ============
1.1 - 5.21th.2026
 * added plugin commands for adding tracking tags when adding reinforcement enemies (for use with the new script call)
 * added "is_reinforcement_alive("TagName")" script call for checking if any living reinforcement enemy exists with the specified Tag
1.0 - 5.19th.2026
 * initial release
====================================
 * 
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires Hime EnemyReinforcements.
 * Make sure this plugin is located under Hime EnemyReinforcements in the plugin list.
 *
 * ============================================================================
 * Script Calls
 * ============================================================================
 *
 * $gameTroop.countEnemiesTotal()
 *  - Returns total number of currently-living enemies in battle.
 *  - Includes base troop enemies and reinforcement enemies.
 *
 * $gameTroop.countEnemyReinforcements()
 *  - Returns total number of currently-living reinforcement enemies only.
 *
 * is_reinforcement_alive("TagName")
 *  - Returns true if at least one currently-living reinforcement exists with
 *    matching tag.
 *  - Returns false if none exist, tag was never used, or tagged enemy died.
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * Add specific troop member using troop database position:
 *   add_enemy_troop N from M
 *   add_enemy_troop N from troop M
 *
 * Add specific troop member at custom screen position:
 *   add_enemy_troop N from M position (X, Y)
 *   add_enemy_troop N from troop M position (X, Y)
 *   add_enemy N from M position (X, Y)
 *   add_enemy N from troop M position (X, Y)
 *
 * Add tagged reinforcement (tracking tag):
 *   add_enemy_troop N from M tagged <TagName>
 *   add_enemy_troop N from troop M tagged <TagName>
 *   add_enemy_troop N from M position (X, Y) tagged <TagName>
 *   add_enemy_troop N from troop M position (X, Y) tagged <TagName>
 *   add_enemy N from M tagged <TagName>
 *   add_enemy N from troop M tagged <TagName>
 *   add_enemy N from M position (X, Y) tagged <TagName>
 *   add_enemy N from troop M position (X, Y) tagged <TagName>
 *
 * N = troop member ID (from the database)
 * M = the enemy from the troop ID, in order of appearance (starting from 1)
 * X = screen X coordinate (in the battle screen)
 * Y = screen Y coordinate (in the battle screen)
 * TagName = user-defined reinforcement tag (written between "<>" signs)
 *
 * Example:
 *   add_enemy_troop 2 from 4 position (640, 380)
 *
 * Note:
 *   Base Hime command for whole troop still works unchanged:
 *   add_enemy_troop TROOP_ID
 *
 * ======================================
 * Param Declarations
 * ======================================
 * 
 * 
 * 
 */
//=============================================================================




if (TH.EnemyReinforcements) {
(function() {
	var JAKE_HIME_Game_Troop_addReinforcementMember = Game_Troop.prototype.addReinforcementMember;
	Game_Troop.prototype.addReinforcementMember = function(troopId, memberId, member) {
		var oldCount = this._enemies.length;
		JAKE_HIME_Game_Troop_addReinforcementMember.call(this, troopId, memberId, member);
		for (var i = oldCount; i < this._enemies.length; i++) {
			this._enemies[i]._jakeIsReinforcement = true;
		}
	};

	Game_Troop.prototype.countEnemiesTotal = function() {
		return this.members().filter(function(enemy) {
			return enemy && enemy.isAlive();
		}).length + 1;
	};

	Game_Troop.prototype.countEnemyReinforcements = function() {
		return this.members().filter(function(enemy) {
			return !!(enemy && enemy.isAlive() && enemy._jakeIsReinforcement);
		}).length;
	};

	Game_Troop.prototype.tagNewestReinforcement = function(tagName, oldCount) {
		var tag = String(tagName);
		for (var i = this._enemies.length - 1; i >= 0; i--) {
			var enemy = this._enemies[i];
			if (!enemy || !enemy._jakeIsReinforcement) {
				continue;
			}
			if (oldCount !== undefined && i < oldCount) {
				continue;
			}
			enemy._jakeReinforcementTag = tag;
			return enemy;
		}
		return null;
	};

	Game_Troop.prototype.isReinforcementAliveByTag = function(tagName) {
		if (tagName === undefined || tagName === null) {
			return false;
		}
		var tag = String(tagName);
		return this.members().some(function(enemy) {
			return !!(enemy && enemy.isAlive() && enemy._jakeIsReinforcement &&
				enemy._jakeReinforcementTag === tag);
		});
	};

	var isReinforcementAliveScriptCall = function(tagName) {
		if (!$gameTroop || typeof $gameTroop.isReinforcementAliveByTag !== "function") {
			return false;
		}
		return $gameTroop.isReinforcementAliveByTag(tagName);
	};

	if (typeof window !== "undefined") {
		window.is_reinforcement_alive = isReinforcementAliveScriptCall;
	} else {
		this.is_reinforcement_alive = isReinforcementAliveScriptCall;
	}

	Game_Troop.prototype.addEnemyReinforcementAtPosition = function(troopId, memberId, x, y) {
		var troop = $dataTroops[troopId];
		if (!troop || !troop.members) {
			return false;
		}
		var member = troop.members[memberId - 1];
		if (!member || !$dataEnemies[member.enemyId]) {
			return false;
		}

		var overrideMember = {
			enemyId: member.enemyId,
			x: x,
			y: y,
			hidden: member.hidden
		};

		this.addReinforcementMember(troopId, memberId, overrideMember);
		this.makeUniqueNames();
		BattleManager.refreshEnemyReinforcements();
		return true;
	};

	var JAKE_HIME_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		var cmd = String(command || "").toLowerCase();
		if (cmd === "add_enemy_troop" || cmd === "add_enemy") {
			var parsed = this.parseJakeEnemyMemberCommandArgs(args);
			if (parsed) {
				var troop = $dataTroops[parsed.troopId];
				if (!troop || !troop.members || !troop.members[parsed.memberId - 1]) {
					console.warn("JakeMSG_HIME_EnemyReinforcements_Additions: invalid troop/member", command, args);
					return;
				}

				var oldCount = $gameTroop.members().length;
				var added = false;
				if (parsed.hasPosition) {
					added = !!$gameTroop.addEnemyReinforcementAtPosition(parsed.troopId, parsed.memberId, parsed.x, parsed.y);
				} else {
					$gameTroop.addEnemyReinforcement(parsed.troopId, parsed.memberId);
					added = true;
				}

				if (added && parsed.tagName) {
					$gameTroop.tagNewestReinforcement(parsed.tagName, oldCount);
				}
				return;
			}

			if (this.jakeHasArgToken(args, "from")) {
				console.warn("JakeMSG_HIME_EnemyReinforcements_Additions: invalid enemy-member command format", command, args);
				return;
			}
		}
		JAKE_HIME_Game_Interpreter_pluginCommand.call(this, command, args);
	};

	Game_Interpreter.prototype.jakeHasArgToken = function(args, token) {
		if (!args || !token) {
			return false;
		}
		token = String(token).toLowerCase();
		for (var i = 0; i < args.length; i++) {
			if (String(args[i]).toLowerCase() === token) {
				return true;
			}
		}
		return false;
	};

	Game_Interpreter.prototype.parseJakeEnemyMemberCommandArgs = function(args) {
		if (!args || args.length < 3) {
			return null;
		}

		var index = 0;
		var memberId = Number(args[index++]);
		if (!isFinite(memberId)) {
			return null;
		}

		if (String(args[index++] || "").toLowerCase() !== "from") {
			return null;
		}

		if (String(args[index] || "").toLowerCase() === "troop") {
			index++;
		}

		var troopId = Number(args[index++]);
		if (!isFinite(troopId)) {
			return null;
		}

		var tagIndex = -1;
		for (var i = index; i < args.length; i++) {
			if (String(args[i]).toLowerCase() === "tagged") {
				tagIndex = i;
				break;
			}
		}
		var tailEnd = tagIndex === -1 ? args.length : tagIndex;

		var hasPosition = false;
		var x = 0;
		var y = 0;
		if (index < tailEnd && String(args[index]).toLowerCase() === "position") {
			index++;
			var coordText = args.slice(index, tailEnd).join(" ").trim();
			var coordMatch = coordText.match(/^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/);
			if (!coordMatch) {
				return null;
			}
			hasPosition = true;
			x = Number(coordMatch[1]);
			y = Number(coordMatch[2]);
			index = tailEnd;
		} else if (index < tailEnd) {
			return null;
		}

		var tagName = null;
		if (tagIndex >= 0) {
			var tagText = args.slice(tagIndex + 1).join(" ").trim();
			var tagMatch = tagText.match(/^<\s*(.+?)\s*>$/);
			if (!tagMatch) {
				return null;
			}
			tagName = tagMatch[1];
		}

		return {
			memberId: memberId,
			troopId: troopId,
			hasPosition: hasPosition,
			x: x,
			y: y,
			tagName: tagName
		};
	};
})();
}

//=============================================================================
// End of File
//=============================================================================
