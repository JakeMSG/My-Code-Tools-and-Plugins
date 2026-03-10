//=============================================================================
// Addition to YEP plugin "Skill Rewards", made by JakeMSG
// YEP_JakeMSG_SkillRewardsAdditions.js
//=============================================================================


var Imported = Imported || {};
Imported.YEP_JakeMSG_SkillRewardsAdditions = true;

var Yanfly = Yanfly || {};
Yanfly.LunSkRew_JakeMSGAdd = Yanfly.LunSkRew_JakeMSGAdd || {};
Yanfly.LunSkRew_JakeMSGAdd.version = 1.0;

//=============================================================================
 /*:
 * @plugindesc v1.0 (Requires YEP_Z_SkillRewards.js UNDER it) Additions to the base
 * Skill Rewards yanfly plugin
 * @author JakeMSG
 *
 *
 * @help
  * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_Z_SkillRewards.
 * Make sure this plugin is located OVER YEP_Z_SkillRewards in the plugin list.
 * (It implements functions to be used within the Skill Rewards plugin)
 *
 * This plugin adds new functionalities to Skill Rewards. Current Additions:
 * -- (Requires YEP_SkillCooldowns) effect: Global change of skill cooldowns
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 *   <Reward Animation Delay: x>
 *   - If there's a reward tied to this skill/item effect and conditions are
 *   met, adds a Delay (In Frames) to the Reward Animation
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.00:
 * - First release of Plugin.
 */
//=============================================================================


//=============================================================================
// Skill Effect - Cooldown change Implements
//=============================================================================

if (Imported.YEP_X_SkillCooldowns) {

// ==== Applies a Direct global cooldown Change (independent of the "globalCooldownChange" variable set within the skill)
// == Useful for using this function outside of its usual use ("applyCooldownEffect" function)
Game_BattlerBase.prototype.applyDirectGlobalCooldownChange = function(mainSkill, directChange) {
    for (var i = 0; i < this.allSkills().length; ++i) {
      var skill = this.allSkills()[i];
      if (!skill) continue;
      //var value = mainSkill.globalCooldownChange;
      var value = directChange;
      this.addCooldown(skill.id, value);
    }
};

// ==== Directy Sets a global cooldown (independent of the "globalCooldown" variable set within the skill)
// == Useful for using this function outside of its usual use ("paySkillCost" function)
Game_BattlerBase.prototype.payDirectGlobalCooldown = function(mainSkill, directSet) {
  for (var i = 0; i < this.allSkills().length; ++i) {
    var skill = this.allSkills()[i];
    if (!skill) continue;
    // var value = mainSkill.globalCooldown;
    var value = directSet;
    value *= this.cooldownDuration(mainSkill);
    value = Math.max(value, this.cooldown(skill.id));
    this.setCooldown(skill.id, value);
  }
};

};




//=============================================================================
// Utilities
//=============================================================================

Yanfly.Util = Yanfly.Util || {};

if (!Yanfly.Util.toGroup) {
    Yanfly.Util.toGroup = function(inVal) {
        return inVal;
    }
};

//=============================================================================
// End of File
//=============================================================================
