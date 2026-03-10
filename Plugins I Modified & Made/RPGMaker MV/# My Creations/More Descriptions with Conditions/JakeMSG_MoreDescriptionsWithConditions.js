//=============================================================================
// JakeMSG_MoreDescriptionsWithConditions
// JakeMSG_MoreDescriptionsWithConditions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_MoreDescriptionsWithConditions = true;


//=============================================================================
 /*:
 * @plugindesc Adds more features to Description windows, such as setting their
 * number of shown lines, writing extended descriptions within Notetags, or
 * even opening up the description in a new "detailed" window by keypress
 * (can set the key used by this in the Parameters)
 * @author JakeMSG
 * v1.0

============ Change Log ============
1.0 - 3.6th.2026
 * initial release
================================
 
 *
 * @help
 * ======================================
 * Compatibilities
 * ======================================
 * ======== If you're using "YEP_MessageCore", you need to place my plugin below it
 * for the Extended Descriptions feature of this plugin to work with it
 * ======== Also compatible with "YEP_X_InBattleStatus", "Olivia_StateTooltipDisplay" plugins, 
 * and even my "JakeMSG_YEP_X_InBattleStatus_Additions" plugin, adding the Condition 
 * subfeature of the Extended Description to those plugins' State Descriptions!
 * ==== For compatibility with these plugins, you'll have to place my plugin below these
 * one, too (like with "YEP_MessageCore")
 * ==== You can now use the <Condition: > and <Resume> tags in the "<Help Description>" pair of tags in State notes
 * ==== The <Help Description> tags work exactly like my <Extended Description> tags, including how you 
 * can use them multiple times in the same State notes, or how you use the <Condition: > and <Resume> tags with them  
 * 
 * 
 * 
 * 
 * ======================================
 * New Features
 * ======================================
 * ================ Set the number of Lines shown in the Description Window (by Parameter)
 * ================ Expand/Collapse Descriptions
 * ======== Pressing a configurable key (from the Parameters), when you have a Description Window on-screen, to fully expand it to Fullscreen
 * ==== Pressing the same key again closes it back
 * ================ Extended Descriptions
 * ======== Put these in the notes of the entry whose Description you want to extend 
 * (the lines in the notes, between the notetags, will be added at the end of the
 * description, on new lines)
 * 
 * <Extended Description>
 * first new extended description line
 * another extended description line
 * </Extended Description>
 * 
 * ======== Accepted tag names (case insensitive): "Extend", "Extended", "Extended Description", "Extend Description", "Extend Descript", "Ext Desc", "ExtDesc" 
 * ======== You can actually have this set of tags multiple times in the same Notes, and it will keep adding the lines to the final description
 * 
 * ================ Conditions to stop reading the Extended Description (tag pair)
 * ======== In the middle of the previously-mentioned tag pair for Extended Description, on a separate line just for it, you can use this tag:
 * 
 * <Condition: javascript_condition_to_evaluate>
 * 
 * ======== Where "javascript_condition_to_evaluate" is a javascript code string to evaluate for True/False value
 * ======== Accepted tag name: "Cond: ", "Condition: "
 * ======== If the Condition evaluates to True, it keeps reading the rest of the Extended Description (until the matching </Extended Description> tag)
 * ======== If it evaluates to False, will stop reading the Extended Description (will behave like it already met the matching </Extended Description> tag)
 * ======== You can place multiple such Condition tags (each on its own line), and at any point one such Condition tag evaluates to False, it will stop reading the rest of the current pair of Extended Description tags
 * ======== However, a new pair of Extended Description tags (a new starter tag) will, once again, start the reading of the Extended Description
 * ==== Thus, you can have segmented parts of a Description not show unless a certain javascript condition becomes true, even if it's in the middle of the description you actually want to show
 * == (such as Spoiler information for a certain part of the story)
 * 
 * ================ Resume reading the Extended Description (after Condition stopped it in the middle of a Extended Description pair of tags)
 * ======== In the middle of the previously-mentioned tag pair for Extended Description, after a Condition tag, on a separate line just for it, you can use this tag:
 * 
 * <Resume>
 * 
 * ======== Accepted tag name: "Resume"
 * ======== This, once again, resumes the reading of the Extended Description, after it was stopped by a previous Condition, during an Extended Description
 * 
 * ======== This feature is also compatible with "Olivia_StateTooltipDisplay" plugin, adding the Condition subfeature of the Extended Description to Olivia's State Descriptions!
 * ==== You can now use the <Condition: > and <Resume> tags in the "<Help Description>" pair of tags in State notes
 * ==== Her <Help Description> tags work exactly like my <Extended Description> tags, including how you 
 * can use them multiple times in the same State notes, or how you use the <Condition: > and <Resume> tags with them  
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ======================================
 * Parameters
 * ======================================
 * ======== Description Window number of Lines
 * ==== Number (Default: 2)
 * ==== Sets the number of (visible) lines for the Description window.
 * ==== CAREFUL! If you use "SRD_SuperToolsEngine" plugin, and you use the Menu Editor in any
 * menu with a Description Window, you will set absolute positions for the windows,
 * and the change in number of Lines may not be reflected!
 * ==== If you use "YEP_X_InBattleStatus", you'll also have to set the "Window Y" parameter
 * (the inside of the "this.fittingHeight()" function) to be equal to this parameter, to 
 * show properly
 * 
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
 * @param Description Window number of Lines
 * @text Description Window number of Lines
 * @type number
 * @min -9999
 * @max 9999
 * @default 2
 * @desc Sets the number of (visible) lines for the Description window.
 * CAREFUL! If you use "SRD_SuperToolsEngine" plugin, and you use the Menu Editor in any
 * menu with a Description Window, you will set absolute positions for the windows,
 * and the change in number of Lines may not be reflected!
 * 
 * 
 * @param Key for Expand Description
 * @text Key for Expand Description
 * @type number
 * @min -9999
 * @max 9999
 * @default 219
 * @desc Key to press to Expand/Collapse a Description Window (Needs to be the Keycode number for it) (Default = 219 ( "[" sign))
 * 
 * 
 * 
 * 
 * 
 */
//=============================================================================


// ================================ Adds the Expand/Collapse of the Description Window (to see it in Fullscreen) via custom Key
// ==== Cache plugin parameters for convenience
var JakeMSG_MoreDescriptionsWithConditions_Params = PluginManager.parameters('JakeMSG_MoreDescriptionsWithConditions');
var JakeMSG_MoreDescriptionsWithConditions_Key = Number(JakeMSG_MoreDescriptionsWithConditions_Params['Key for Expand Description'] || 219);

// ======== Method Alias-ing
JakeMSG_MoreDescriptionsWithConditions_Graphics_onKeyDown = Graphics._onKeyDown;
Graphics._onKeyDown = function(event) {
    // ==== This Expands/Collapses the Description Window (if it's already showing On-Screen)
    if (event.keyCode === JakeMSG_MoreDescriptionsWithConditions_Key) {
        var scene = SceneManager._scene;
        if (scene && scene._helpWindow && scene._helpWindow.visible) {
            // toggle expanded window
            if (scene._helpWindowExpanded) {
                // always remove from the scene root; the expanded window was added
                // there for compatibility with other plugins
                var idx = scene.children.indexOf(scene._helpWindowExpanded);
                if (idx >= 0) {
                    scene.removeChild(scene._helpWindowExpanded);
                }
                scene._helpWindowExpanded = null;
            } else {
                var text = scene._helpWindow._text || '';
                var exp = new Window_Help_Expanded();
                exp.setText(text);
                // add directly to scene root so it is always topmost (important for
                // compatibility with plugins like YEP_X_InBattleStatus which add
                // their own windows outside the window layer)
                scene.addChild(exp);
                scene._helpWindowExpanded = exp;
            }
            // prevent the key from bubbling elsewhere
            event.preventDefault();
        }
    }
    JakeMSG_MoreDescriptionsWithConditions_Graphics_onKeyDown.call(this, event);
};


//=============================================================================
// ======== DERIVED ========
//=============================================================================

// ==== New: Helper class: full‑screen copy of Window_Help
function Window_Help_Expanded() {
    this.initialize.apply(this, arguments);
}

Window_Help_Expanded.prototype = Object.create(Window_Help.prototype);
Window_Help_Expanded.prototype.constructor = Window_Help_Expanded;
Window_Help_Expanded.prototype.initialize = function() {
    // bypass Window_Help.initialize because it sizes the window by numLines
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this._text = '';
    this.refresh();
};



//=============================================================================
// ======== Window_Help ========
//=============================================================================


// ======== Method Alias-ing
// ==== Automatically clear expanded window when the help window hides
JakeMSG_MoreDescriptionsWithConditions_Window_Help_hide = Window_Help.prototype.hide;
Window_Help.prototype.hide = function() {
    JakeMSG_MoreDescriptionsWithConditions_Window_Help_hide.call(this);
    var scene = SceneManager._scene;
    if (scene && scene._helpWindowExpanded) {
        if (scene.children.indexOf(scene._helpWindowExpanded) >= 0) {
            scene.removeChild(scene._helpWindowExpanded);
        }
        scene._helpWindowExpanded = null;
    }
};




// ================================ Sets the number of (visible) lines for the Description window.
// ======== Method Re-initialization
Window_Help.prototype.initialize = function(numLines) {
    var width = Graphics.boxWidth;
    //var height = this.fittingHeight(numLines || 2);
    var height = this.fittingHeight(Number(PluginManager.parameters("JakeMSG_MoreDescriptionsWithConditions")["Description Window number of Lines"]) || 2); // ==== Changed the inside of this
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this._text = '';
};

// Alias setText in order to push updates to any expanded window
JakeMSG_MoreDescriptionsWithConditions_Window_Help_setText = Window_Help.prototype.setText;
Window_Help.prototype.setText = function(text) {
    JakeMSG_MoreDescriptionsWithConditions_Window_Help_setText.call(this, text);
    var scene = SceneManager._scene;
    // Only propagate to expanded window if *this* is not the expanded window itself
    if (scene && scene._helpWindowExpanded && scene._helpWindowExpanded.visible && this !== scene._helpWindowExpanded) {
        scene._helpWindowExpanded.setText(text);
    }
};


// ================================ Adds the extended description to the normal one (at the end of it) + The Condition tag inside of it that can stop reading the rest of it if it evaluates to False
// ======== Method Re-initialization
// ==== I have to re-initialize this function, as we need to insert the text in the ".setText" parameters while retaining the normal description and the extended description separate 
// == (If we, instead, directly modify the "item.description", it will add the extended description at the end of it each time it shows on the screen, resulting in stacking extended description endlessly)
// ==== Because of this, I have a branch that handles "YEP_MessageCore" version of this method (my plugin needs to be placed below it)
Window_Help.prototype.setItem = function(item) {
    if (item){ // ==== Putting the check if the "item" exists at the very beginning, since no instruction should run otherwise on it
        // ==== initalizing needed variables for processing of the Notes of the item, to get only the description between the proper tags
        var extDesc = '';
        var noteArray = item.note.split(/[\r\n]+/);
        var noteLine = 'none';
        var readExtDesc = false;
        var tempStopExtDesc = false;
        for (var i = 0; i < noteArray.length; i++){ // ==== Iterates through each line of the notes, to look for the proper tags
            noteLine = noteArray[i];
            if (noteLine.match(/<(?:EXTEND|EXTENDED|EXTENDED DESCRIPTION|EXTENDEDDESCRIPTION|EXTEND DESCRIPTION|EXTENDDESCRIPTION|EXTEND DESCRIPT|EXTENDDESCRIPT|EXT DESC|EXTDESC)>/i)) {
                readExtDesc = true; // ==== Starts the reading of the Extended Description (with the next line)
                tempStopExtDesc = false;
            } else if (noteLine.match(/<(?:COND:|CONDITION:)[ ]?\s*(.*)>/i)) { // ==== Checks for the Condition that can stop the reading of the current Extended Description tag pair
				try {
					var cond = eval(RegExp.$1); // ==== Evals the javascript condition written
                    if (!cond){
                        tempStopExtDesc = true; // ==== If it evals to False, (temporarily) stops the reading of the ExtDesc
                    } 
				} catch(e) { // ==== Handles erroring on trying to eval
					console.error('JakeMSG_MoreDescriptionWithConditions eval error: ' + e.message);
                    tempStopExtDesc = true; // ==== On error, also (temporarily) stops the reading of the ExtDesc
				}
            } else if (noteLine.match(/<(?:RESUME)>/i)) { 
                tempStopExtDesc = false; // ==== Resumes the reading of the ExtDesc after the temoorary stop caused by a Condition
            } else if (noteLine.match(/<\/(?:EXTEND|EXTENDED|EXTENDED DESCRIPTION|EXTENDEDDESCRIPTION|EXTEND DESCRIPTION|EXTENDDESCRIPTION|EXTEND DESCRIPT|EXTENDDESCRIPT|EXT DESC|EXTDESC)>/i)) {
                readExtDesc = false; // ==== Stops the reading of the Extended Description
            } else if (readExtDesc == true && tempStopExtDesc == false) {
                if (extDesc.length > 0) {
                extDesc += "\n";  // ==== Adds a line break if this is a new line (if it's not the very first line of the Extended Description)
                }
                extDesc += noteLine;  // ==== Adds to the extended Description
            }
        }

        // ==== Checks if the normal description exists, and if it doesn't have a line break at the end, to add it at the beginning of the Extended Description (for the Extended Description to start from a new line)
        if (item.description && item.description[item.description.length - 1] != '\n') {
            extDesc = '\n' + extDesc;
        }
        // ==== Adds the Extended Description at the end of the normal Description, whilst keeping each of them separate (to not stack with each call of the ".setItem" method)
        if(Imported.YEP_MessageCore){ // ==== Handles the "Yep_MessageCore" case
            if (eval(Yanfly.Param.MSGDescWrap)) {
                this.setText('<WordWrap>' + item.description + extDesc); // === YEP Wordwrap case
            } else {
                this.setText(item.description + extDesc); // === Normal case
            }
        } else {
            this.setText(item.description + extDesc); // === Normal case
        }
    } else this.setText(''); // ==== This will only run if no Item is present
};








//=============================================================================
// ======== ORIGINAL ========
//=============================================================================

// ================================ Adds The Condition tag (from the normal Description Windows) to "YEP_X_InBattleStatus" plugin's added State descriptions
if (Imported.YEP_X_InBattleStatus) {
// ======== Method Re-Initialization
Window_InBattleStateList.prototype.makeItemList = function() {
  this._data = [];
  if (this._battler) {
    var states = this._battler.states();
    var length = states.length;
    for (var i = 0; i < length; ++i) {
      var state = states[i];
      // ================ Here we do the state description manipulation
        if (state && this.includes(state)){
            // ======== Need to alter the already-formed Description, as it could already be made by the time this method runs
            // ==== However, we also need to save the previous "unaltered by my plugin" Description, so that we can re-check for the Conditions and have the description lines "added back" if the Conditions change
            if (!state.conditionProcessed){
                state.conditionProcessed = true;
                state.unalteredDescription = state.description;
            }
            var descArray = state.unalteredDescription.split(/[\r\n]+/);
            var descLine = 'none';
            var tempStopExtDesc = false;
            for (var j = 0; j < descArray.length; j++){ // ==== Iterates through each line of the already-formed description, to look for the proper tags
                descLine = descArray[j];
                if (descLine.match(/<(?:COND:|CONDITION:)[ ]?\s*(.*)>/i)) { // ==== Checks for the Condition that can stop the reading of the current State Description tag pair
                    try {
                        var cond = eval(RegExp.$1); // ==== Evals the javascript condition written
                        if (!cond){
                            tempStopExtDesc = true; // ==== If it evals to False, (temporarily) stops the reading of the State Description
                        } 
                    } catch(e) { // ==== Handles erroring on trying to eval
                        console.error('JakeMSG_MoreDescriptionWithConditions eval error: ' + e.message);
                        tempStopExtDesc = true; // ==== On error, also (temporarily) stops the reading of the State Description
                    }
                    // ==== We also delete the lines containing the tags, to not show them
                    descArray.splice(j, 1);
                    j--;
                } else if (descLine.match(/<(?:RESUME)>/i)) { 
                    tempStopExtDesc = false; // ==== Resumes the reading of the State Description after the temoorary stop caused by a Condition
                    // ==== We also delete the lines containing the tags, to not show them
                    descArray.splice(j, 1);
                    j--;
                } else if (tempStopExtDesc == true) { // ==== If the reading of the State Description is "stopped" (and we actually start the "deletion")
                    // ==== Since the description is already written, we need to "delete" the lines after the Condition when it is False (the reverse of Adding it to the description)
                    descArray.splice(j, 1);
                    j--;
                }
            }
            state.description = descArray.join('\n');
        }
      // ================ State description manipulation ends here
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

};




// ================================ Adds The Condition tag (from the normal Description Windows) to "Olivia_StateTooltipDisplay" plugin's added State descriptions
if (Imported.Olivia_StateOlivia_StateTooltipDisplay) {
// ======== Method Alias-ing
JakeMSG_MoreDescriptionsWithConditions_Olivia_SetupStateIconTooltipDescription = Olivia.SetupStateIconTooltipDescription;
Olivia.SetupStateIconTooltipDescription = function (a1) {
    JakeMSG_MoreDescriptionsWithConditions_Olivia_SetupStateIconTooltipDescription.call(this,a1);
    // ======== Need to alter the already-formed Description, as it could already be made by the time this method runs
    // ==== However, we also need to save the previous "unaltered by my plugin" Description, so that we can re-check for the Conditions and have the description lines "added back" if the Conditions change
    if (!a1.conditionProcessed){
        a1.conditionProcessed = true;
        a1.unalteredDescription = a1.description;
    }
    var descArray = a1.unalteredDescription.split(/[\r\n]+/);
    var descLine = 'none';
    var tempStopExtDesc = false;
    for (var i = 0; i < descArray.length; i++){ // ==== Iterates through each line of the already-formed description, to look for the proper tags
        descLine = descArray[i];
        if (descLine.match(/<(?:COND:|CONDITION:)[ ]?\s*(.*)>/i)) { // ==== Checks for the Condition that can stop the reading of the current State Description tag pair
            try {
                var cond = eval(RegExp.$1); // ==== Evals the javascript condition written
                if (!cond){
                    tempStopExtDesc = true; // ==== If it evals to False, (temporarily) stops the reading of the State Description
                } 
            } catch(e) { // ==== Handles erroring on trying to eval
                console.error('JakeMSG_MoreDescriptionWithConditions eval error: ' + e.message);
                tempStopExtDesc = true; // ==== On error, also (temporarily) stops the reading of the State Description
            }
            // ==== We also delete the lines containing the tags, to not show them
            descArray.splice(i, 1);
            i--;
        } else if (descLine.match(/<(?:RESUME)>/i)) { 
            tempStopExtDesc = false; // ==== Resumes the reading of the State Description after the temoorary stop caused by a Condition
            // ==== We also delete the lines containing the tags, to not show them
            descArray.splice(i, 1);
            i--;
        } else if (tempStopExtDesc == true) { // ==== If the reading of the State Description is "stopped" (and we actually start the "deletion")
            // ==== Since the description is already written, we need to "delete" the lines after the Condition when it is False (the reverse of Adding it to the description)
            descArray.splice(i, 1);
            i--;
        }
    }
    a1.description = descArray.join('\n');
};

};




// ================================ Adds The Condition tag (from the normal Description Windows) to my "JakeMSG_YEP_X_InBattleStatus_Additions" plugin's added State descriptions
if (Imported.JakeMSG_YEP_X_InBattleStatus_Additions) {
// ======== Method Re-Initialization
Window_EnemyInBattleStateList.prototype.makeItemList = function() {
  this._data = [];
  if (this._battler) {
    var states = this._battler.states();
    var length = states.length;
    for (var i = 0; i < length; ++i) {
      var state = states[i];
      // ================ Here we do the state description manipulation
        if (state && this.includes(state)){
            // ======== Need to alter the already-formed Description, as it could already be made by the time this method runs
            // ==== However, we also need to save the previous "unaltered by my plugin" Description, so that we can re-check for the Conditions and have the description lines "added back" if the Conditions change
            if (!state.conditionProcessed){
                state.conditionProcessed = true;
                state.unalteredDescription = state.description;
            }
            var descArray = state.unalteredDescription.split(/[\r\n]+/);
            var descLine = 'none';
            var tempStopExtDesc = false;
            for (var j = 0; j < descArray.length; j++){ // ==== Iterates through each line of the already-formed description, to look for the proper tags
                descLine = descArray[j];
                if (descLine.match(/<(?:COND:|CONDITION:)[ ]?\s*(.*)>/i)) { // ==== Checks for the Condition that can stop the reading of the current State Description tag pair
                    try {
                        var cond = eval(RegExp.$1); // ==== Evals the javascript condition written
                        if (!cond){
                            tempStopExtDesc = true; // ==== If it evals to False, (temporarily) stops the reading of the State Description
                        } 
                    } catch(e) { // ==== Handles erroring on trying to eval
                        console.error('JakeMSG_MoreDescriptionWithConditions eval error: ' + e.message);
                        tempStopExtDesc = true; // ==== On error, also (temporarily) stops the reading of the State Description
                    }
                    // ==== We also delete the lines containing the tags, to not show them
                    descArray.splice(j, 1);
                    j--;
                } else if (descLine.match(/<(?:RESUME)>/i)) { 
                    tempStopExtDesc = false; // ==== Resumes the reading of the State Description after the temoorary stop caused by a Condition
                    // ==== We also delete the lines containing the tags, to not show them
                    descArray.splice(j, 1);
                    j--;
                } else if (tempStopExtDesc == true) { // ==== If the reading of the State Description is "stopped" (and we actually start the "deletion")
                    // ==== Since the description is already written, we need to "delete" the lines after the Condition when it is False (the reverse of Adding it to the description)
                    descArray.splice(j, 1);
                    j--;
                }
            }
            state.description = descArray.join('\n');
        }
      // ================ State description manipulation ends here
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

};















//=============================================================================
// End of File
//=============================================================================
