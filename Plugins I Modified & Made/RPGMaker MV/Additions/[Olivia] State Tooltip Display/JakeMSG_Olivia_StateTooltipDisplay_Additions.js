//=============================================================================
// JakeMSG_Olivia_StateTooltipDisplay_Additions
// JakeMSG_Olivia_StateTooltipDisplay_Additions
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_Olivia_StateTooltipDisplay_Additions = true;

var JakeMSG = JakeMSG || {};
JakeMSG.Olivia_StateTooltipDisplay = JakeMSG.Olivia_StateTooltipDisplay || {};


//=============================================================================
 /*:
 * @plugindesc Adds new features to this plugin:
 * - Ability to Pin Tooltips to the screen (until the next hover)
 * - Also adds alternative Pin key, customizable via Parameter
 * REQUIRES: "Olivia_StateTooltipDisplay" plugin!
 * @author JakeMSG
 * v1.1
 * 
============ Change Log ============
1.1 - 3.12th.2026
 * Made sure Pinned tooltips get cleared on Action end, Battle end and Battle abort, to avoid
stuck tooltips lingering
1.0 - 2.26th.2026
 * initial release
====================================
 * @help
 * ======================== New Features:
 * ================ Right-Click to Pin Tooltip message
 * ======== If you Right-Click while a Tooltip is showing, said tooltip will be "Pinned", remaining on the screen even when you hover off the state that triggered it
 * ==== Hovering on a different State, or away and back to the initial one, will unpin the Tooltip
 * ==== Also added a Parameter to set an Alternative Key for pinning Help Messages (set via KeyCode)
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ======================================
 * Param Declarations
 * ======================================
 * @param Alt-key for Pinning Tooltip
 * @text Alt-key for Pinning Tooltip
 * @type number
 * @min -9999
 * @max 9999
 * @default 79
 * @desc Alternative key that can be used for Pinning the Tooltip (Needs to be the Keycode number for it) (Default = 79 (o))
 * 
 */
//=============================================================================

if (Imported.Olivia_StateOlivia_StateTooltipDisplay) {


// ======== Method Alias-ing
JakeMSG_OliviaStateTooltipDisplay_TouchInput_onRightButtonDown = TouchInput._onRightButtonDown;
TouchInput._onRightButtonDown = function (event) {
  JakeMSG_OliviaStateTooltipDisplay_TouchInput_onRightButtonDown.call(this, event);
  // ==== Only Pins if the Tooltip is already visible
  if (SceneManager._scene._stateIconTooltipWindow && SceneManager._scene._stateIconTooltipWindow.visible) {
    SceneManager._scene._stateIconTooltipWindow._pinned = true;
  }
  event.preventDefault();
};

// ======== Method Alias-ing
JakeMSG_OliviaStateTooltipDisplay_Graphics_onKeyDown = Graphics._onKeyDown;
Graphics._onKeyDown = function(event) {
    keyCode = Number(PluginManager.parameters("JakeMSG_Olivia_StateTooltipDisplay_Additions")["Alt-key for Pinning Tooltip"]);
    // ==== This adds the Alt-key to pin tooltip (helps for other windows, when Right-click would just cancel the window / open the menu)
    if (event.keyCode == keyCode) {
      // ==== Only Pins if the Tooltip is already visible
      if (SceneManager._scene._stateIconTooltipWindow && SceneManager._scene._stateIconTooltipWindow.visible) {
        SceneManager._scene._stateIconTooltipWindow._pinned = true;
      }
    }
    JakeMSG_OliviaStateTooltipDisplay_Graphics_onKeyDown.call(this,event);
};



// ======== Method Alias-ing
JakeMSG_OliviaStateTooltipDisplay_Window_StateIconTooltip_prototype_initialize = Window_StateIconTooltip.prototype.initialize;
Window_StateIconTooltip.prototype.initialize = function () {
  this._pinned = false; // ==== Just adds this variable to the initialization
  JakeMSG_OliviaStateTooltipDisplay_Window_StateIconTooltip_prototype_initialize.call(this);
};


// ======== Method Re-initialization
Window_StateIconTooltip.prototype.updateVisibility = function () {
  visible = this.visible;
  this.visible = this._visibilityTimer > 0 || this._pinned; // ==== Added the "_pinned" to the check
  this._visibilityTimer--;
  if (visible !== this.visible && this.visible) {
    this.updateNewData();
  }
};

// ======== Method Re-initialization
Window_StateIconTooltip.prototype.updateCoordinates = function () {
  if (this.visible && this._targetHost && !this._pinned) { // ==== Added the "_pinned" to the check
    this.x = TouchInput._mouseOverX;
    if (this.x + this.width >= Graphics.boxWidth) {
      this.x = Graphics.boxWidth - this.width;
    }
    this.y = TouchInput._mouseOverY;
    if (this.y + this.height >= Graphics.boxHeight) {
      this.y = Graphics.boxHeight - this.height;
    }
  }
};

// ======== Method Re-initialization
Window_StateIconTooltip.prototype.setTargetHost = function (a30) {
  if (this._targetHost !== a30 && this._visibilityTimer !== 0) {
    this._targetHost = a30;
    this.updateNewData();
    // ==== Added the check for "_pinned", to be able to disable it if it's been pinned from before
    if (this._pinned) {
      this._pinned = false;
    }
  }
  this._visibilityTimer = 1;
};

// ======== Utility
JakeMSG.Olivia_StateTooltipDisplay.clearPinnedTooltip = function (forceClear) {
  if (!forceClear && (!$gameParty || !$gameParty.inBattle())) {
    return;
  }
  var scene = SceneManager._scene;
  if (!scene || !scene._stateIconTooltipWindow) {
    return;
  }
  var tooltip = scene._stateIconTooltipWindow;
  tooltip._pinned = false;
  tooltip._visibilityTimer = 0;
  tooltip._targetHost = undefined;
};

// ======== Method Alias-ing
JakeMSG_OliviaStateTooltipDisplay_BattleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function () {
  JakeMSG.Olivia_StateTooltipDisplay.clearPinnedTooltip();
  JakeMSG_OliviaStateTooltipDisplay_BattleManager_endAction.call(this);
};

// ======== Method Alias-ing
JakeMSG_OliviaStateTooltipDisplay_BattleManager_endBattle = BattleManager.endBattle;
BattleManager.endBattle = function (result) {
  JakeMSG.Olivia_StateTooltipDisplay.clearPinnedTooltip(true);
  JakeMSG_OliviaStateTooltipDisplay_BattleManager_endBattle.call(this, result);
};

// ======== Method Alias-ing
if (BattleManager.abort) {
  JakeMSG_OliviaStateTooltipDisplay_BattleManager_abort = BattleManager.abort;
  BattleManager.abort = function () {
    JakeMSG.Olivia_StateTooltipDisplay.clearPinnedTooltip(true);
    JakeMSG_OliviaStateTooltipDisplay_BattleManager_abort.call(this);
  };
}








  
//=============================================================================
// End of File
//=============================================================================
};