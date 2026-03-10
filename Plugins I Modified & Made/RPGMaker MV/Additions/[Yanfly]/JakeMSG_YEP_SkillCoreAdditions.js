//=============================================================================
// Addition to YEP plugin "Skill Core", made by JakeMSG
// JakeMSG_YEP_SkillCoreAdditions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_SkillCoreAdditions = true;

var Yanfly = Yanfly || {};
Yanfly.Skill_JakeMSGAdd = Yanfly.Skill_JakeMSGAdd || {};
Yanfly.Skill_JakeMSGAdd.version = 1.0;

//=============================================================================
 /*:
 * @plugindesc v1.0 (Requires YEP_SkillCore.js) Additions to the base
 * Skill Core yanfly Plugin
 * @author JakeMSG
 *
 * @param ====Stop showing default skill costs====
 * @default
 * 
 * @param Default hide all (HP,MP,TP) costs
 * @parent ====Stop showing default skill costs====
 * @type boolean
 * @on Hide all
 * @off Keep them shown
 * @desc Makes all default Skill costs hidden by default (can still be
 * shown back manually with Notetags per-skill)
 * @default false
 * 
 * @param Default hide HP costs
 * @parent ====Stop showing default skill costs====
 * @type boolean
 * @on Hide HP costs
 * @off Keep them shown
 * @desc Makes HP default Skill costs hidden by default (can still be
 * shown back manually with Notetags per-skill)
 * @default false
 * 
 * @param Default hide MP costs
 * @parent ====Stop showing default skill costs====
 * @type boolean
 * @on Hide MP costs
 * @off Keep them shown
 * @desc Makes MP default Skill costs hidden by default (can still be
 * shown back manually with Notetags per-skill)
 * @default false
 * 
 * @param Default hide TP costs
 * @parent ====Stop showing default skill costs====
 * @type boolean
 * @on Hide TP costs
 * @off Keep them shown
 * @desc Makes TP default Skill costs hidden by default (can still be
 * shown back manually with Notetags per-skill)
 * @default false
 * 
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_SkillCore.
 * Make sure this plugin is located under YEP_SkillCore in the plugin list.
 *
 * This plugin adds new functionalities to Skill Core. Current Additions:
 * -- Option to manually not display default Skill costs per each skill (useful with 
 * the Custom Cost Display tag)
 * - Includes not showing each default skill cost individually (HP/MP/TP)
 * - Can also re-show them per-skill, if you hid them by default
 * in the plugin parameters
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * For Hiding (or Showing back) Skill Costs:
 *   <Hide all costs>
 *   Hides the default HP&MP&TP costs of the skill.
 *
 *   <Hide HP costs>
 *   Hides the default HP cost of the skill.
 * 
 *   <Hide MP costs>
 *   Hides the default MP cost of the skill.
 * 
 *   <Hide TP costs>
 *   Hides the default TP cost of the skill.
 * 
 *   <Show all costs>
 *   (Useful when the Plugin Parameters to Hide skill costs are enabled)
 *   Shows the default HP&MP&TP costs of the skill.
 *
 *   <Show HP costs>
 *   (Useful when the Plugin Parameters to Hide skill costs are enabled)
 *   Shows the default HP cost of the skill.
 * 
 *   <Show MP costs>
 *   (Useful when the Plugin Parameters to Hide skill costs are enabled)
 *   Shows the default MP cost of the skill.
 * 
 *   <Show TP costs>
 *   (Useful when the Plugin Parameters to Hide skill costs are enabled)
 *   Shows the default TP cost of the skill.
 * 
 * The priority of the Hiding Skill Costs notetags are as follows (in descending order):
 * = From Plugin Parameters to Per-skill, from Show to Hide
 * More Specific:
 * = (Plugin Parameter) Hide All -> (Plugin Parameter) Hide HP/MP/TP -> 
 * (Per-skill) Show All -> (Per-skill) Hide All -> (Per-skill) Show HP/MP/TP
 * -> (Per-skill) Hide HP/MP/TP
 * 
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.05:
 * - Fixed an issue that made the Plugin's parameters not doing anything (not hiding the costs)
 * 
 * Version 1.00:
 * - First release of Plugin.
 */
//=============================================================================


if (Imported.YEP_SkillCore) {

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('JakeMSG_YEP_SkillCoreAdditions');
Yanfly.Param = Yanfly.Param || {};
Yanfly.Icon = Yanfly.Icon || {};

Yanfly.Param.SC_JMSGA_HideAll = String(Yanfly.Parameters['Default hide all (HP,MP,TP) costs']);
Yanfly.Param.SC_JMSGA_HideHP = String(Yanfly.Parameters['Default hide HP costs']);
Yanfly.Param.SC_JMSGA_HideMP = String(Yanfly.Parameters['Default hide MP costs']);
Yanfly.Param.SC_JMSGA_HideTP = String(Yanfly.Parameters['Default hide TP costs']);


Yanfly.SetupParameters = function() {

};
Yanfly.SetupParameters()

//=============================================================================
// DataManager
//=============================================================================

Yanfly.Skill_JakeMSGAdd.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!Yanfly.Skill_JakeMSGAdd.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!Yanfly._loaded_JakeMSG_YEP_SkillCoreAdditions) {
    this.processSC_JMSGA_Notetags($dataSkills);
    Yanfly._loaded_JakeMSG_YEP_SkillCoreAdditions = true;
  }
  return true;
};


DataManager.processSC_JMSGA_Notetags = function(group) {
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);

    obj.defHideAll = eval(Yanfly.Param.SC_JMSGA_HideAll);
    obj.defHideHP = eval(Yanfly.Param.SC_JMSGA_HideHP);
    obj.defHideMP = eval(Yanfly.Param.SC_JMSGA_HideMP);
    obj.defHideTP = eval(Yanfly.Param.SC_JMSGA_HideTP);

    obj.hideAll = false;
    obj.hideHP = false;
    obj.hideMP = false;
    obj.hideTP = false;

    obj.showAll = false;
    obj.showHP = false;
    obj.showMP = false;
    obj.showTP = false;

    for (var i = 0; i < notedata.length; i++) {
      var line = notedata[i];
      if (line.match(/<(?:HIDE ALL COSTS)>/i)) {
        obj.hideAll = true;
      } else if (line.match(/<(?:HIDE HP COSTS)>/i)) {
        obj.hideHP = true;
      } else if (line.match(/<(?:HIDE MP COSTS)>/i)) {
        obj.hideMP = true;
      } else if (line.match(/<(?:HIDE TP COSTS)>/i)) {
        obj.hideTP = true;
      } else if (line.match(/<(?:SHOW ALL COSTS)>/i)) {
        obj.showAll = true;
      } else if (line.match(/<(?:SHOW HP COSTS)>/i)) {
        obj.showHP = true;
      } else if (line.match(/<(?:SHOW MP COSTS)>/i)) {
        obj.showMP = true;
      } else if (line.match(/<(?:SHOW TP COSTS)>/i)) {
        obj.showTP = true;
      }
    }
  }
};

//=============================================================================
// Window_SkillList
//=============================================================================


Yanfly.Skill_JakeMSGAdd.Window_SkillList_drawTPCost = Window_SkillList.prototype.drawTpCost;
Window_SkillList.prototype.drawTpCost = function(skill, wx, wy, dw) {
    if (skill.hideTP) {return dw;} else if (!skill.showTP && skill.hideAll) {return dw;} else if ((!skill.showTP || !skill.showAll) && skill.defHideTP) {return dw;} else if ((!skill.showTP || !skill.showAll) && skill.defHideAll) {return dw;} else {
        return Yanfly.Skill_JakeMSGAdd.Window_SkillList_drawTPCost.call(this, skill, wx, wy, dw);
    }
};

Yanfly.Skill_JakeMSGAdd.Window_SkillList_drawMPCost = Window_SkillList.prototype.drawMpCost;
Window_SkillList.prototype.drawMpCost = function(skill, wx, wy, dw) {
    if (skill.hideMP) {return dw;} else if (!skill.showMP && skill.hideAll) {return dw;} else if ((!skill.showMP || !skill.showAll) && skill.defHideMP) {return dw;} else if ((!skill.showMP || !skill.showAll) && skill.defHideAll) {return dw;} else {
        return Yanfly.Skill_JakeMSGAdd.Window_SkillList_drawMPCost.call(this, skill, wx, wy, dw);
    }
};

Yanfly.Skill_JakeMSGAdd.Window_SkillList_drawHPCost = Window_SkillList.prototype.drawHpCost;
Window_SkillList.prototype.drawHpCost = function(skill, wx, wy, dw) {
    if (skill.hideHP) {return dw;} else if (!skill.showHP && skill.hideAll) {return dw;} else if ((!skill.showHP || !skill.showAll) && skill.defHideHP) {return dw;} else if ((!skill.showHP || !skill.showAll) && skill.defHideAll) {return dw;} else {
        return Yanfly.Skill_JakeMSGAdd.Window_SkillList_drawHPCost.call(this, skill, wx, wy, dw);
    }
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
};
