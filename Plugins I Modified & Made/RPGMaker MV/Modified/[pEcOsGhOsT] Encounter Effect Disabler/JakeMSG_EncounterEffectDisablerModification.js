//-----------------------------------------------------------------------------
// Encounter Effect (Battle Start) Disabler
//----------------------------------------------------------------------------

/*:
@plugindesc	Disables the Encounter Zoom & Flash Effect when entering a battle (for the most part) and skips battler entrance (from right)
@author		pEcOsGhOsT+JakeMSG
@help		
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * Improved upon pEcOsGhOsT initial plugin, by first making it toggle-able (via script call methods), then making the Disabling of Visual Effects
 * now also get rid of the last FadeIn&Out transitions that were not found before.
 * Finally, I added a few more things to disable separatedly about Battle Encounters, including the Snapshot Blur effect, hiding/showing Map Characters on Snapshot, Battle BGM&SEs, and Battle Text Messages.
 * Disabling all of them at once makes the Battle seamlessly transition from Map Screen, and back to it at the end.
 * 
 * (I personally use this since I improvise a QTE system via SumRndmDde's TimedAttack plugins, that only work within a battle, to make on-map QTEs)
 * 
 * ======================================
 * (Java)Script Methods
 * ======================================
 * 
 * ======== This toggles the Disabling of Encounter (Transition) Effects 
 *     $gameMap.disableEncounterEffects(disableEffects)
 * ==== "disableEffects" should be "true" if you want them disabled, and "false" if not
 * == Usage Example: "$gameMap.disableEncounterEffects(true)"
 * ==== Default: false (effects show)
 *
 * ======== This method (added by me) toggles the Disabling of the Blur effect on Snapshotting the Background (done for Battle Background, if left blank in the Troop entry)
 *     $gameMap.disableBlurPicEffects(disableEffects)
 * ==== "disableEffects" should be "true" if you want them disabled, and "false" if not
 * == Usage Example: "$gameMap.disableBlurPicEffects(true)"
 * ==== Default: false (blurred)
 * 
 * ======== This method (added by me) toggles the hiding of the Characters (map event imgs) on Snapshotting the Background (done for Battle Background, if left blank in the Troop entry)
 *     $gameMap.hideCharactersOnPic(hideChars)
 * ==== "hideChars" should be "true" if you want them hidden, and "false" if not
 * == Usage Example: "$gameMap.hideCharactersOnPic(true)"
 * ==== Default: false (characters show)
 *
 * ======== This method (added by me) toggles the Disabling of the Sound effects (Bgm, Se) related to Encounters
 *     $gameMap.disableSoundEncEffects(disableEffects)
 * ==== "disableEffects" should be "true" if you want them disabled, and "false" if not
 * == Usage Example: "$gameMap.disableSoundEncEffects(true)"
 * ==== Default: false (sounds play)
 *
 * ======== This method (added by me) toggles the Disabling of the Text Messages (Victory/Loss/Escapes) related to Encounters
 *     $gameMap.disableTextEncMsgs(disableText)
 * ==== "disableText" should be "true" if you want them disabled, and "false" if not
 * == Usage Example: "$gameMap.disableTextEncMsgs(true)"
 * ==== Default: false (messages show)
 * 
 * ======== This method (added by me) toggles the Disabling of the Skill Names shown on using Skills during a Battle
 *     $gameMap.disableSkillNames(disableSkillNames)
 * ==== "disableSkillNames" should be "true" if you want them disabled, and "false" if not
 * == Usage Example: "$gameMap.disableSkillNames(true)"
 * ==== Default: false (skill names show)
 * 
 * ======== This method (added by me) toggles the Disabling of the Battle Box (the UI showing your HP, MP etc.) during a Battle
 *     $gameMap.disableBattleBox(disableBattleBox)
 * ==== "disableBattleBox" should be "true" if you want them disabled, and "false" if not
 * == Usage Example: "$gameMap.disableBattleBox(true)"
 * ==== Default: false (battle box ui shows)
 * 
 * ======== This method (added by me) toggles all the previous toggles mentioned to create a "seamless Battle" (all the values are the opposite of the default ones, EXCEPT Hide characters)
 *     $gameMap.seamlessBattle(seamless)
 * ==== "seamless" should be "true" if you want all these toggles switched, and "false" to revert them all back to Default values
 * == Usage Example: "$gameMap.disableBattleBox(true)"
 * ==== Default: false (a.k.a. the "Default" values)
 * 
 */


//=============================================================================
// Game_Map 
//=============================================================================

// ======== New Method made for Script Calls
// ==== $gameMap.disableEncounterEffects(disableEffects)
Game_Map.prototype.disableEncounterEffects = function(disableEffects) {
	if (disableEffects) $gameSystem.disabledEncounterEffects = true;
    else $gameSystem.disabledEncounterEffects = false;
}

// ======== New Method made for Script Calls
// ==== $gameMap.disableBlurPicEffects(disableEffects)
Game_Map.prototype.disableBlurPicEffects = function(disableEffects) {
	if (disableEffects) $gameSystem.disabledBlurPicEffects = true;
    else $gameSystem.disabledBlurPicEffects = false;
}

// ======== New Method made for Script Calls
// ==== $gameMap.hideCharactersOnPic(hideChars)
Game_Map.prototype.hideCharactersOnPic = function(hideChars) {
	if (hideChars) $gameSystem.hiddenCharactersOnPic = true;
    else $gameSystem.hiddenCharactersOnPic = false;
}

// ======== New Method made for Script Calls
// ==== $gameMap.disableSoundEncEffects(disableEffects)
Game_Map.prototype.disableSoundEncEffects = function(disableEffects) {
	if (disableEffects) $gameSystem.disabledSoundEncEffects = true;
    else $gameSystem.disabledSoundEncEffects = false;
}

// ======== New Method made for Script Calls
// ==== $gameMap.disableTextEncMsgs(disableText)
Game_Map.prototype.disableTextEncMsgs = function(disableText) {
	if (disableText) $gameSystem.disabledTextEncMsgs = true;
    else $gameSystem.disabledTextEncMsgs = false;
}

// ======== New Method made for Script Calls
// ==== $gameMap.disableSkillNames(disableSkillNames)
Game_Map.prototype.disableSkillNames = function(disableSkillNames) {
	if (disableSkillNames) $gameSystem.disabledSkillNames = true;
    else $gameSystem.disabledSkillNames = false;
}

// ======== New Method made for Script Calls
// ==== $gameMap.disableBattleBox(disableBattleBox)
Game_Map.prototype.disableBattleBox = function(disableBattleBox) {
	if (disableBattleBox) $gameSystem.disabledBattleBox = true;
    else $gameSystem.disabledBattleBox = false;
}

// ======== New Method made for Script Calls
// ==== $gameMap.seamlessBattle(seamless)
Game_Map.prototype.seamlessBattle = function(seamless) {
	if (seamless) {
        $gameSystem.disabledEncounterEffects = true;
        $gameSystem.disabledBlurPicEffects = true;
        $gameSystem.hiddenCharactersOnPic = false;
        $gameSystem.disabledSoundEncEffects = true;
        $gameSystem.disabledTextEncMsgs = true;
        $gameSystem.disabledSkillNames = true;
        $gameSystem.disabledBattleBox = true;
    } else {
        $gameSystem.disabledEncounterEffects = false;
        $gameSystem.disabledBlurPicEffects = false;
        $gameSystem.hiddenCharactersOnPic = true;
        $gameSystem.disabledSoundEncEffects = false;
        $gameSystem.disabledTextEncMsgs = false;
        $gameSystem.disabledSkillNames = false;
        $gameSystem.disabledBattleBox = false;
    }
}



//=============================================================================
// Scene_Map
//=============================================================================

// ======== Related to: Hiding Characters
// ==== Extends original function
var _startEncounterEffect = Scene_Map.prototype.startEncounterEffect;
Scene_Map.prototype.startEncounterEffect = function() {
    if ($gameSystem.hiddenCharactersOnPic){
        this._spriteset.hideCharacters();
        this._encounterEffectDuration = this.encounterEffectSpeed();
    } else _startEncounterEffect.call(this);
};

// ======== Related to: Visual Effects; Sound Effects
// ==== Extends original function
var _updateEncounterEffect = Scene_Map.prototype.updateEncounterEffect;
Scene_Map.prototype.updateEncounterEffect = function() {
    // ==== Adding this for support for the "DP_MapZoom" plugin
    if(Imported.DP_MapZoom) {
        if ($gameSystem.disabledEncounterEffects){
            if (this._encounterEffectDuration > 0) {
                this._encounterEffectDuration--;
                var speed = this.encounterEffectSpeed();
                var n = speed - this._encounterEffectDuration;
                var p = n / speed;
                var q = ((p - 1) * 20 * p + 5) * p + 1;
                var zoomPos = dp_getZoomPos();
                if (n === 3) {
                    this.snapForBattleBackground();
                }
                if (n === Math.floor(speed / 6)) {
                }
                if (n === Math.floor(speed / 2)) {
                    // ==== Added the conditional to disable SoundEffects (if variable is true)
                    if (!$gameSystem.disabledSoundEncEffects){BattleManager.playBattleBgm();}
                    this.startFadeOut(this.fadeSpeed());
                }
            }
        // ==== Disable SoundEffects (This branch happens when Sound Effects are disabled, but Visual Effects aren't)        
        } else if (!$gameSystem.disabledSoundEncEffects){
            if (this._encounterEffectDuration > 0) {
                this._encounterEffectDuration--;
                var speed = this.encounterEffectSpeed();
                var n = speed - this._encounterEffectDuration;
                var p = n / speed;
                var q = ((p - 1) * 20 * p + 5) * p + 1;
                var zoomPos = dp_getZoomPos();
                
                if (n === 2) {
                    $gameScreen.setZoom(zoomPos.x, zoomPos.y, dp_renderSize.scale);
                    this.snapForBattleBackground();
                    this.startFlashForEncounter(speed / 2);
                }
                
                $gameScreen.setZoom(zoomPos.x, zoomPos.y, (q * dp_renderSize.scale));
                if (n === Math.floor(speed / 6)) {
                    this.startFlashForEncounter(speed / 2);
                }
                if (n === Math.floor(speed / 2)) {
                    //==== Disabled Sound Effects
                    //BattleManager.playBattleBgm();
                    this.startFadeOut(this.fadeSpeed());
                }
            }
        } else _updateEncounterEffect.call(this);
    } else{
        if ($gameSystem.disabledEncounterEffects){
            if (this._encounterEffectDuration > 0) {
                this._encounterEffectDuration--;
                var speed = this.encounterEffectSpeed();
                var n = speed - this._encounterEffectDuration;
                var p = n / speed;
                var q = ((p - 1) * 20 * p + 5) * p + 1;
                var zoomX = $gamePlayer.screenX();
                var zoomY = $gamePlayer.screenY() - 1;
                if (n === 3) {

                    this.snapForBattleBackground();

                }

                if (n === Math.floor(speed / 6)) {

                }
                if (n === Math.floor(speed / 2)) {
                    // ==== Added the conditional to disable SoundEffects (if variable is true)
                    if (!$gameSystem.disabledSoundEncEffects){BattleManager.playBattleBgm();}
                }
            }
        // ==== Disable SoundEffects (This branch happens when Sound Effects are disabled, but Visual Effects aren't)    
        } else if ($gameSystem.disabledSoundEncEffects){
            if (this._encounterEffectDuration > 0) {
                this._encounterEffectDuration--;
                var speed = this.encounterEffectSpeed();
                var n = speed - this._encounterEffectDuration;
                var p = n / speed;
                var q = ((p - 1) * 20 * p + 5) * p + 1;
                var zoomX = $gamePlayer.screenX();
                var zoomY = $gamePlayer.screenY() - 24;
                if (n === 2) {
                    $gameScreen.setZoom(zoomX, zoomY, 1);
                    this.snapForBattleBackground();
                    this.startFlashForEncounter(speed / 2);
                }
                $gameScreen.setZoom(zoomX, zoomY, q);
                if (n === Math.floor(speed / 6)) {
                    this.startFlashForEncounter(speed / 2);
                }
                if (n === Math.floor(speed / 2)) {
                    //==== Disabled Sound Effects
                    //BattleManager.playBattleBgm();
                    this.startFadeOut(this.fadeSpeed());
                }
            }
        } else _updateEncounterEffect.call(this);   
    }

};

// ======== Related to: Visual Effects
// ==== Extends original function
var _snapForBattleBackground = Scene_Map.prototype.snapForBattleBackground;
Scene_Map.prototype.snapForBattleBackground = function() {
    if ($gameSystem.disabledEncounterEffects){
        this._windowLayer.visible = false;
        SceneManager.snapForBackground();
        this._windowLayer.visible = true;
    } else _snapForBattleBackground.call(this);   
};

// ======== Related to: Visual Effects
// ==== Extends original function
var _startFlashForEncounter = Scene_Map.prototype.startFlashForEncounter;
Scene_Map.prototype.startFlashForEncounter = function(duration) {
    if ($gameSystem.disabledEncounterEffects){
        var color = [255, 255, 255, 255];
    } else _startFlashForEncounter.call(this,duration);  
};

// ======== Related to: Visual Effects
// ==== CHANGES original function
Scene_Map.prototype.encounterEffectSpeed = function() {
    if ($gameSystem.disabledEncounterEffects){
        return 3;
    } else return 60;
};

// ======== Related to: Visual Effects
// ==== CHANGES original function
Scene_Map.prototype.needsFadeIn = function() {
    // ==== This is one of the Visual Effect parts that weren't found before
    if ($gameSystem.disabledEncounterEffects){
    return (SceneManager.isPreviousScene(Scene_Load));
    } else return (SceneManager.isPreviousScene(Scene_Battle) || SceneManager.isPreviousScene(Scene_Load));
};

// ======== Related to: Sound Effects
// ==== CHANGES original function
Scene_Map.prototype.launchBattle = function() {
    BattleManager.saveBgmAndBgs();
    // ==== Added the conditional to disable SoundEffects (if variable is true)
    if (!$gameSystem.disabledSoundEncEffects){
        this.stopAudioOnBattleStart();
        SoundManager.playBattleStart();
    }

    this.startEncounterEffect();
    this._mapNameWindow.hide();
};




//=============================================================================
// BattleManager
//=============================================================================

// ======== Related to: Sound Effects
// ==== CHANGES original function
BattleManager.playVictoryMe = function() {
    // ==== Added the conditional to disable SoundEffects (if variable is true)
    if (!$gameSystem.disabledSoundEncEffects){AudioManager.playMe($gameSystem.victoryMe());}
};

// ======== Related to: Sound Effects
// ==== CHANGES original function
BattleManager.playDefeatMe = function() {
    // ==== Added the conditional to disable SoundEffects (if variable is true)
    if (!$gameSystem.disabledSoundEncEffects){AudioManager.playMe($gameSystem.defeatMe());}
};

// ======== Related to: Text Message
// ==== CHANGES original function
BattleManager.displayVictoryMessage = function() {
    // ==== Added the conditional to disable Text Messages (if variable is true)
    if (!$gameSystem.disabledTextEncMsgs){$gameMessage.add(TextManager.victory.format($gameParty.name()));}
};

// ======== Related to: Text Message
// ==== CHANGES original function
BattleManager.displayDefeatMessage = function() {
    // ==== Added the conditional to disable Text Messages (if variable is true)
    if (!$gameSystem.disabledTextEncMsgs){$gameMessage.add(TextManager.defeat.format($gameParty.name()));}
    
};

// ======== Related to: Text Message
// ==== CHANGES original function
BattleManager.displayEscapeSuccessMessage = function() {
    // ==== Added the conditional to disable Text Messages (if variable is true)
    if (!$gameSystem.disabledTextEncMsgs){$gameMessage.add(TextManager.escapeStart.format($gameParty.name()));}
    
};

// ======== Related to: Text Message
// ==== CHANGES original function
BattleManager.displayEscapeFailureMessage = function() {
    // ==== Added the conditional to disable Text Messages (if variable is true)
    if (!$gameSystem.disabledTextEncMsgs){
        $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
        $gameMessage.add('\\.' + TextManager.escapeFailure);
    }
};




//=============================================================================
// Scene_Battle
//=============================================================================

// ======== Related to: Visual Effects; Sound Effects
// ==== CHANGES original function
Scene_Battle.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    // ==== This is one of the Visual Effect parts that weren't found before
    if (!$gameSystem.disabledEncounterEffects){ this.startFadeIn(this.fadeSpeed(), false);}
    // ==== Added the conditional to disable SoundEffects (if variable is true)
    if (!$gameSystem.disabledSoundEncEffects){BattleManager.playBattleBgm();}
    BattleManager.startBattle();


};

// ======== Related to: Visual Effects
// ==== CHANGES original function
Scene_Battle.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
    // ==== This is one of the Visual Effect parts that weren't found before
    if (!$gameSystem.disabledEncounterEffects){
        if (this.needsSlowFadeOut()) {
            this.startFadeOut(this.slowFadeSpeed(), false);
        } else {
            this.startFadeOut(this.fadeSpeed(), false);
        }
    } 
};


// ======== Related to: Battle Box (UI)
// ==== CHANGES original function
Scene_Battle.prototype.update = function() {
    var active = this.isActive();
    $gameTimer.update(active);
    $gameScreen.update();
    // ==== Added the conditional to disable Battle Box UI (if variable is true)
    if ($gameSystem.disabledBattleBox){} 
    else {
            this.updateStatusWindow();
            this.updateWindowPositions();
    }
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
    }
    Scene_Base.prototype.update.call(this);
};





//=============================================================================
// SceneManager 
//=============================================================================

// ======== Related to: Blur on Snapshot
// ==== CHANGES original function
SceneManager.snapForBackground = function() {
    if ($gameSystem.disabledBlurPicEffects){
        this._backgroundBitmap = this.snap();
    } else {
        this._backgroundBitmap = this.snap();
        this._backgroundBitmap.blur();
    }

};




//=============================================================================
// Scene_Base
//=============================================================================

// ======== Related to: Visual Effects
// ==== Extends original function
var _quickFadeSpeed = Scene_Base.prototype.quickFadeSpeed;
Scene_Base.prototype.quickFadeSpeed = function() {
    if ($gameSystem.disabledEncounterEffects){
        return 1;
    } else _quickFadeSpeed.call(this);  
};




//=============================================================================
// Sprite_Actor
//=============================================================================

// ======== Related to: Visual Effects
// ==== Extends original function
var _startEntryMotion = Sprite_Actor.prototype.startEntryMotion;
Sprite_Actor.prototype.startEntryMotion = function() {
    if ($gameSystem.disabledEncounterEffects){
        if (this._actor && this._actor.canMove()) {
            this.startMotion('walk');
            this.startMove(0, 0, 0);
        } else if (!this.isMoving()) {
            this.refreshMotion();
            this.startMove(0, 0, 0);
        }
    } else _startEntryMotion.call(this);  
};




//=============================================================================
// SoundManager
//=============================================================================

// ======== Related to: Sound Effects
// ==== CHANGES original function
SoundManager.playEscape = function() {
    // ==== Added the conditional to disable SoundEffects (if variable is true)
    if (!$gameSystem.disabledSoundEncEffects){this.playSystemSound(8);}
};



//=============================================================================
// Window_BattleLog
//=============================================================================

// ======== Related to: Skill Names
// ==== Extends original function

var _displayAction = Window_BattleLog.prototype.displayAction;
Window_BattleLog.prototype.displayAction = function(subject, item) {
    // ==== Added the conditional to disable Skill Name (if variable is true)
    if ($gameSystem.disabledSkillNames) {}
    else {
        _displayAction.call(this,subject,item);
    }
};



/**/