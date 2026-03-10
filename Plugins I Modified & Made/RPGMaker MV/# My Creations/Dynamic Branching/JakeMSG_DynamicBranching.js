//=============================================================================
// Dynamic Branching - for RPG Maker MV version 1.6.1
// JakeMSG_DynamicBranching.js
//=============================================================================
 /*:
 * @plugindesc <DynamicBranching> for RPG Maker MV version 1.6.1.
 * @author JakeMSG
 *
 * @help
 * With this plugin, you're capable of giving the player the choice to "branch"
 * out, by pressing customizable keys on their keyboard, to go to specific labels.
 * Thus, you're able to "branch dynamically" during event processing, instead
 * of being restricted to branch/label jump only at predetermined positions in the
 * event editor.
 * 
 * With the given Labels, you can enable for the game to wait for specific keys
 * pressed to jump to the specific labels for each key.
 * 
 * There are various uses for this, such as having players interrupt dialogue actively,
 * giving "secret" options during certain events, having improvized semi-qtes,
 * having a "skip story" button for certain sections etc.
 *
 * 
 * ------------------------
 * Instructions: Label Tags
 * ------------------------
 * 
 *     This plugin exclusively uses Labels for its Tags.
 *     All labels are case insensitive and you can use as little/many whitespaces
 * between the words themselves (just make sure the actual numbers are spaced away
 * from the words, to not get mixed up).
 * 
 *     Notations used by all the tags (here, in the examples):
 * ---- X = ASCII code of the key from the keyboard
 * -- You can find the codes for each key here: https://www.toptal.com/developers/keycode
 * -- With these codes, you should be able to assign any key from the keyboard
 * ---- Y = Number (positive or negative) to offset the position (index) 
 * for the "Revert Jump" / "Disable&Revert Jump" label tags to go back to)
 * -- Offset -1 = The instruction right before doing the jump
 * -- Offset works a bit differently (much like the actual Index of the instructions). 
 * Thus, you may need to add/subtract more than the lines shown in the editor to 
 * actually move to the desired position.
 * -- Pro-tip: test out the actual positions the offset will move you to! (dependant on the
 * instructions used)
 * 
 * ------------------------
 *       Label Tags:
 * ------------------------
 *
 * <Enable Jump X>
 * - From this point until the end of the current event page (Game_Interpreter),
 * or until the matching <Disable Jump X> label, you can press the "X" (ASCII-code) 
 * key from the key board to jump to the matching <Jump Target X> label.
 * - If the matching <Jump Target X> label is missing, it will forcefully close 
 * the current Game_Interpreter (event page), without executing anything else! 
 *
 * 
 * <Disable Jump X>
 * - Disables the ability to "Jump" that was previously enabled by the matching
 * label <Enable Jump X>
 * - Does nothing if the <Enable Jump X> was not previously used 
 *
 * 
 * <Jump Target X>
 * - Marks where the execution will "jump" to, upon pressing the "X" (ASCII code)
 * key, after being enabled by a previous matching <Enable Jump X> label
 * - After the "jump", the "jumping" for the specific "X" (ASCII code) key
 * is automatically disabled! (to prevent looping problems)
 * - Can be placed even above the <Enable Jump X> that enabled it to function!
 * - Until a "jump" is triggered, does nothing on its own
 * * This label works much like normal Labels work for the "Jump to Label"
 * instruction, to provide the target for that Jump. The only difference being,
 * the jump can be triggered by the player upon pressing the "X" (ASCII code) key,
 * at his own chosen moment during processing the event page.
 * 
 * 
 * <Revert Jump X>
 * - Will only take effect if the matching "jump" for the "X" (ASCII code) key
 * was previously used
 * - Jumps back to the position from which the initial "jump" was started (in the
 * instructions, will continue from the instruction right after the instructions 
 * after which the initial Jump happened)
 * - Also re-enables the "jumping" for the "X" (ASCII code) key (since you were 
 * able to Jump at the position of the initial Jump)
 *
 * <Revert&Disable Jump X>
 * <Revert,Disable Jump X>
 * <Revert+Disable Jump X>
 * <RevertDisable Jump X>
 * <Disable&Revert Jump X>
 * <Disable,Revert Jump X>
 * <Disable+Revert Jump X>
 * <DisableRevert Jump X>
 * - Does the same as <Revert Jump X>, but also keeps the "jumping" for the "X"
 * (ASCII code) key disabled (won't be able to jump again with that key, until
 * another <Enable Jump X> label is used)
 * 
 * 
 * 
 * ================================ Experimental
 * ======== Offset-ed Revert Jump
 * <Revert Jump X offset Y>
 * - Does the same as <Revert Jump X>, but also provides an offset to the position
 * at which to jump back to (can be Positive or Negative)
 * 
 * 
 * <Revert&Disable Jump X offset Y>
 * <Revert,Disable Jump X offset Y>
 * <Revert+Disable Jump X offset Y>
 * <RevertDisable Jump X offset Y>
 * <Disable&Revert Jump X offset Y>
 * <Disable,Revert Jump X offset Y>
 * <Disable+Revert Jump X offset Y>
 * <DisableRevert Jump X offset Y>
 * - Does the same as <Revert Jump X offset Y>, but also keeps the "jumping" 
 * for the "X"(ASCII code) key disabled (won't be able to jump again with that 
 * key, until another <Enable Jump X> label is used)
 * 
 * 
 * These labels cannot be used in with parallel events. Parallel events will not work
 * with Jumps!
 *
 * 
 * 
 * ------------------------------------------------
 *       Lunatique: Javascript Function 
 * ------------------------------------------------
 * 
 * ======== Call upon a specific keyCode (for "Input" script calls), without having to set a keyName prior
 * aKey(keyCode)
 * ======== "keyCode" = Code of the key to Call upon
 * ==== Use this website to quickly find the keycode for any key pressed: 
 * https://www.toptal.com/developers/keycode
 * ==== Can be used in place of any place within a "Input" or "TouchInput" script call that calls for a keyName (such as "shift" or "escape")
 * == Eg: "Input.isTriggered("shift")" can also be written as "Input.isTriggered(aKey(16))" 
 * = (Since "shift" is code 16)
 * ==== You can also use this even with codes that don't have names assigned to them already (will give them their code as their name, to be able to be called)
 * == Eg: "Input.isTriggered(aKey(72))" would check for key "H", since H is keyCode 72
 * = (And from then on, unless any other script changed the entry for keyCode 72 to give it a name prior, this one would give it the name "72", in string version)
 * 
 * 
 *
 * ------------------------------------------------
 *       Lunatique: Parallel Function capabilities 
 * ------------------------------------------------
 *         The following can be set from any parallel event, which will in turn "manually" trigger the Key specified, which can be used
 * to trigger the key needed for the Dynamic Branching, from said Parallel Event:
 * 
 * Input._currentState[keyNameOrCode] = true;
 * {Wait In-Editor Instruction} = 4 Frames
 * Input._currentState[keyNameOrCode] = false;
 * ==== "keyNameOrCode" can be any keyName (much like all other Input function work), or even use my "aKey" new method
 * ==== The Wait needs to be > 1 frames (safe to use 4 frames), so that it can be detected during main Event processing
 * 
 * 
 * 
 * ------------
 * Terms of Use
 * ------------
 * 
 * 1. These plugins may be used in free or commercial games freely.
 * 2. Say a prayer for my damned soul.
 * 3. If you feel like it, you can provide me a copy of the game you're working on! :D
 *
 * -------
 * Credits
 * -------
 *
 * Just don't forget about me (JakeMSG), that's it fam :D
 * 
 */
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_DynamicBranching = true;
var JakeMSG = JakeMSG || {};
var parameters = $plugins.filter(function (a1) {
  return a1.description.contains('<DynamicBranching>');
})[0].parameters;

JakeMSG.DynamicBranching = {};
JakeMSG.DynamicBranching.___Game_Interpreter_setup___ = Game_Interpreter.prototype.setup;
Game_Interpreter.prototype.setup = function (a2, a3) {
  if (!$gameParty.inBattle() && this._depth === 0) {
    if (a3 && $gameMap.event(a3) && $gameMap.event(a3)._trigger !== 4) {

      // ======== Initialization of variables used
      $gameTemp._duringDBJump = false;
      $gameTemp._jumpStartIndex = 0;
      $gameTemp._currentJumpKeys = [];
      $gameTemp._jumpStartIndexes = [];
      $gameTemp._canRevertJumps= [];
    }
  }
  JakeMSG.DynamicBranching.___Game_Interpreter_setup___.call(this, a2, a3);
};
JakeMSG.DynamicBranching.___Game_Interpreter_terminate___ = Game_Interpreter.prototype.terminate;
Game_Interpreter.prototype.terminate = function () {
  if (!$gameParty.inBattle() && this._depth === 0) {
    if (this._eventId && $gameMap.event(this._eventId) && $gameMap.event(this._eventId)._trigger !== 4) {

      // ======== Resetting of variables used, on finishing the current Game_interpreter (event page)
      $gameTemp._duringDBJump = undefined;
      $gameTemp._jumpStartIndex = 0;
      $gameTemp._currentJumpKeys = [];
      $gameTemp._jumpStartIndexes = [];
      $gameTemp._canRevertJumps= [];
    }
  }
  JakeMSG.DynamicBranching.___Game_Interpreter_terminate___.call(this);
};


// ==== Extends the Label instruction to check for the specific Labels used by the Plugin
JakeMSG.DynamicBranching.___Game_Interpreter_command118___ = Game_Interpreter.prototype.command118;
Game_Interpreter.prototype.command118 = function () {
  if (this._params[0].match(/<\s*Enable\s*Jump\s*(.*)\s*>/im)) {
    var key = parseInt(RegExp.$1);
    $gameTemp._currentJumpKeys.push(key); // Inserts key in the Key array
    $gameTemp._duringDBJump = false;
  } else if (this._params[0].match(/<\s*Disable\s*Jump\s*(.*)\s*>/im)) {
    var key = parseInt(RegExp.$1);
    var keyPos = $gameTemp._currentJumpKeys.indexOf(key); //Finds the key Index in the Key array (needed to remove it)
    if (keyPos > -1) $gameTemp._currentJumpKeys.splice(keyPos,1); //Removes the Key from the Key array (if Key exists in the array)
    $gameTemp._duringDBJump = false;
  } else if (this._params[0].match(/<\s*Jump\s*Target\s*(.*)\s*>/im)) {
    $gameTemp._duringDBJump = false;
  } else if (this._params[0].match(/<\s*Revert\s*Jump\s*(.*)\s*offset\s*(.*)\s*>/im) && $gameTemp._canRevertJumps[parseInt(RegExp.$1)]) {
    var offset = parseInt(RegExp.$2);
    $gameTemp._currentJumpKeys.push(parseInt(RegExp.$1)); // Inserts key back in the Key array
    $gameTemp._canRevertJumps[parseInt(RegExp.$1)] = false;
    $gameTemp._duringDBJump = false;
    this.jumpTo($gameTemp._jumpStartIndexes[parseInt(RegExp.$1)] + offset);
  } else if ((this._params[0].match(/<\s*Disable\s*[&,+\s]*\s*Revert\s*Jump\s*(.*)\s*offset\s*(.*)\s*>/im) || this._params[0].match(/<\s*Revert\s*[&,+\s]*\s*Disable\s*Jump\s*(.*)\s*offset\s*(.*)\s*>/im)) && $gameTemp._canRevertJumps[parseInt(RegExp.$1)]) {
    var offset = parseInt(RegExp.$2);
    $gameTemp._canRevertJumps[parseInt(RegExp.$1)] = false;
    $gameTemp._duringDBJump = false;
    this.jumpTo($gameTemp._jumpStartIndexes[parseInt(RegExp.$1)] + offset);
  } else if (this._params[0].match(/<\s*Revert\s*Jump\s*(.*)\s*>/im) && $gameTemp._canRevertJumps[parseInt(RegExp.$1)]) {
    $gameTemp._currentJumpKeys.push(parseInt(RegExp.$1)); // Inserts key back in the Key array
    $gameTemp._canRevertJumps[parseInt(RegExp.$1)] = false;
    $gameTemp._duringDBJump = false;
    this.jumpTo($gameTemp._jumpStartIndexes[parseInt(RegExp.$1)]);
  } else if ((this._params[0].match(/<\s*Disable\s*[&,+\s]*\s*Revert\s*Jump\s*(.*)\s*>/im) || this._params[0].match(/<\s*Revert\s*[&,+\s]*\s*Disable\s*Jump\s*(.*)\s*>/im)) && $gameTemp._canRevertJumps[parseInt(RegExp.$1)]) {
    $gameTemp._canRevertJumps[parseInt(RegExp.$1)] = false;
    $gameTemp._duringDBJump = false;
    this.jumpTo($gameTemp._jumpStartIndexes[parseInt(RegExp.$1)]);
  } 

  return JakeMSG.DynamicBranching.___Game_Interpreter_command118___.call(this);
};

var canDBJump = function () {
  var areThereJumpKeys = 0;
  if (!($gameTemp._currentJumpKeys === undefined)) $gameTemp._currentJumpKeys.forEach((key) => {areThereJumpKeys++;}); // If Key array has even just one element, the canDBJump is true
  if (areThereJumpKeys > 0) return true;
  return false;
};


// ==== This one starts processing the DBJump (looking for the "Jump Target" to jump to)
Game_Interpreter.prototype.DBJump = function (jumpKey) {
  var a4 = this.getLatestInterpreter();
  if (a4._list) {
    for (var a5 = 0; a5 < a4._list.length; a5++) {
      var a6 = a4._list[a5];
      if (a6.code === 118) {
        if (a6.parameters[0].match(/<\s*Jump\s*Target\s*(.*)\s*>/im) && jumpKey == parseInt(RegExp.$1)) {
          a4.finishDBJump(jumpKey, a4, a5, true);
          return;
        }
      }
    }
  }
  // ======== This only happens if "Jump Target" does not exist (jumps off of the entire Game_Interpreter, basically forcefully ending the instructions)
  if (a4 === this) {
    a4.finishDBJump(jumpKey, a4, this._list.length - 1, false);
  } else {
    a4.terminate();
    this.DBJump();
  }
};
Game_Interpreter.prototype.getLatestInterpreter = function () {
  var a7 = this;
  while (a7._childInterpreter && a7._childInterpreter._list) {
    a7 = a7._childInterpreter;
  }
  return a7;
};

// ==== This one does the actual jump to Jump Target (it already has the Index of the instruction to jump to in variable "a9")
Game_Interpreter.prototype.finishDBJump = function (jumpKey, a8, a9, a10) {
  // ==== index of the actual Label 
  $gameTemp._jumpStartIndexes[jumpKey] = a8._index - 2;
  $gameTemp._canRevertJumps[jumpKey] = true;
  if (a8 === this) {
    var keyPos = $gameTemp._currentJumpKeys.indexOf(jumpKey); //Finds the key Index in the Key array (needed to remove it)
    if (keyPos > -1) $gameTemp._currentJumpKeys.splice(keyPos,1); //Removes the Key from the Key array (if Key exists in the array)
    $gameTemp._duringDBJump = true;
  }
  a8.jumpTo(a9);
  if (!a10) {
    $gameScreen.startFadeIn(a8.fadeSpeed());
    if ($gameTemp.isPlaytest()) {
      alert("<Jump Target X> missing - Game_Interpreter will stop forcefully");
    }
  }
};

// ======== This one starts checking when _canDBJump is True
JakeMSG.DynamicBranching.___Scene_Map_updateMainMultiply___ = Scene_Map.prototype.updateMainMultiply;
Scene_Map.prototype.updateMainMultiply = function () {
  JakeMSG.DynamicBranching.___Scene_Map_updateMainMultiply___.call(this);
  if (canDBJump()) {
    this.updateDBJump();
  }
};


//======== This one triggers the Jump (via key Longpressed)
Scene_Map.prototype.checkForDBJump = function (jumpKey) {
  return $gameMap.isEventRunning() && !SceneManager.isSceneChanging() && Input.isTriggered(aKey(jumpKey));
};

Scene_Map.prototype.updateDBJump = function () {
  $gameTemp._currentJumpKeys.forEach((jumpKey) => {if (this.checkForDBJump(jumpKey)) this.DBJump(jumpKey);} ); 
};

Scene_Map.prototype.DBJump = function (jumpKey) {
  $gameMap._interpreter.DBJump(jumpKey);
};



// ======== Calls upon a key, by its ASCII keycode, for use with "Input" methods (fully compatible with all of them!)
// ==== Use this website to quickly find the keycode for any key pressed: 
// https://www.toptal.com/developers/keycode
var aKey = function (asciiCode) {
  if (Input.keyMapper[asciiCode]) return Input.keyMapper[asciiCode]; // If current Code in keyMapper already has a keyName, it won't overwrite it
  else return Input.keyMapper[asciiCode] = asciiCode.toString(); // If current Code in keyMapper is empty, it will give it a keyName (so that other Input methods will be able to use it), which will be the String version of the Code (to be unique per each Code)
};

// ======== Does the check for the "Input.isTriggered" for all the keys in the Key array
var areKeysInputRepeated = function () {
  $gameTemp._currentJumpKeys.forEach((jumpKey) => {if (Input.isTriggered(aKey(jumpKey))) return true;} ); 
  return false;
}


//================ Additional aliasing for Button Checks
//==== One more canDBJump check and key check
//== This key check is needed so that the Message windows doesn't simply hang (get stuck)!
JakeMSG.DynamicBranching.___Window_Message_isTriggered___ = Window_Message.prototype.isTriggered;
Window_Message.prototype.isTriggered = function () {
  if ($gameTemp._duringDBJump) {
    return true;
  } else if (canDBJump() && areKeysInputRepeated()) {
    return false;
  } else {
    return JakeMSG.DynamicBranching.___Window_Message_isTriggered___.call(this);
  }
};

JakeMSG.DynamicBranching.___Window_Selectable_isOkTriggered___ = Window_Selectable.prototype.isOkTriggered;
Window_Selectable.prototype.isOkTriggered = function () {
  if ($gameTemp._duringDBJump) {
    return true;
  } else {
    return JakeMSG.DynamicBranching.___Window_Selectable_isOkTriggered___.call(this);
  }
};

JakeMSG.DynamicBranching.___Window_ChoiceList_isOkTriggered___ = Window_ChoiceList.prototype.isOkTriggered;
Window_ChoiceList.prototype.isOkTriggered = function () {
  if ($gameTemp._duringDBJump) {
    return true;
  } else {
    return JakeMSG.DynamicBranching.___Window_ChoiceList_isOkTriggered___.call(this);
  }
};
JakeMSG.DynamicBranching.___Window_NumberInput_isOkTriggered___ = Window_NumberInput.prototype.isOkTriggered;
Window_NumberInput.prototype.isOkTriggered = function () {
  if ($gameTemp._duringDBJump) {
    return true;
  } else {
    return JakeMSG.DynamicBranching.___Window_NumberInput_isOkTriggered___.call(this);
  }
};

