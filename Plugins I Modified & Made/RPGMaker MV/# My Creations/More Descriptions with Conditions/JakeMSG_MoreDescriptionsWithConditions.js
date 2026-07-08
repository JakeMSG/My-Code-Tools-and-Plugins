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
 * v1.3
 *
============ Change Log ============
1.3 - 7.8th.2026
 * Added optional small custom text line within the Description Window (customizable via plugin parameters)
1.2 - 6.19th.2026
 * Added the TP gauge (both with Plugin Parameters and notetags for it)
1.1 - 3.16th.2026
 * Enemy target help now shows HP/MP gauges (per-parameter and per-enemy notetags; supports YEP_AbsorptionBarrier overlay)
 * Enemy expanded help (fullscreen) now displays enemy <Extended Description> with <Condition>/<Resume>
 * Added new parameter to set the number of lines in the enemy-targeting help window, and if should show the HP/MP gauges
1.0 - 3.10th.2026
 * initial release
====================================
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
 * ======== Enemy help gauges keep compatibility with "YEP_AbsorptionBarrier" (barrier fill and colors)
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
 * ================ Enemy Targeting Description Gauges
 * ======== When targeting an enemy, the help window now shows that enemy's HP/MP/TP gauges under the name and state icons
 * ======== Plugin params (below) toggle HP/MP/TP globally; per-enemy notetags override them: <Show Description HP>, <Hide Description HP>, <Show Description MP>, <Hide Description MP>, <Show Description TP>, <Hide Description TP>
 * ======== If using YEP_AbsorptionBarrier, the barrier overlay and colors still draw on the HP gauge
 * ======== You can also set how many lines tall the targeting help window is via the "Number of Lines" enemy-targeting parameter
 * 
 * ================ Enemy Expanded Description (Extended Description for enemies)
 * ======== Enemy notes can now use <Extended Description>... </Extended Description> with <Condition: js> and <Resume>
 * ======== This only appears in the fullscreen/expanded help (press the configured key while an enemy help window is visible); the normal targeting help stays unchanged
 * 
 * ================ Small custom text within the Description Window
 * ======== Optional overlay line separate from the normal description content (for example, a keybinding hint for Expand/Collapse)
 * ======== Controlled by the parent parameter "-- Small set text added to the Description Window --" (Yes/No); sub-parameters apply only when set to Yes
 * ======== "Text to show" — the message drawn on that line
 * ======== "Text position within the Description Window" — Top-Left, Top-Right, Bottom-Left, or Bottom-Right
 * ======== "Text color", "Text size", and "Text font" — styling for the overlay (color accepts CSS/hex, e.g. #1a90b3)
 * ======== "X offset" and "Y offset" — pixel nudges applied after corner placement (can move the text outside the window bounds)
 * ======== Drawn as a separate child sprite on the Help Window (not on the padded contents bitmap), flush to the window edge
 * ======== Shown on the normal Description Window only (not on the fullscreen expanded copy)
 * 
 * 
 * 
 * 
 * 
 * 
 * ======================================
 * Parameters
 * ======================================
 * ======== -- Small set text added to the Description Window --
 * ==== Yes/No (Default: Yes) — whether to draw the optional small overlay text in the Description Window
 * ==== Sub-parameters below only take effect when this is set to Yes
 * ==== Text to show (Default: "'[' Key to Expand/Collapse") — overlay message
 * ==== Text position within the Description Window (Default: Bottom-Right) — Top-Left, Top-Right, Bottom-Left, Bottom-Right
 * ==== Text color (Default: #1a90b3) — CSS/hex color for the overlay
 * ==== Text size (Default: 5) — font size for the overlay
 * ==== Text font (Default: GameFont) — font family for the overlay
 * ==== X offset (Default: 0) — horizontal pixel offset from the chosen corner
 * ==== Y offset (Default: 0) — vertical pixel offset from the chosen corner
 * ======== Description Window number of Lines
 * ==== Number (Default: 2)
 * ==== Sets the number of (visible) lines for the Description window.
 * ==== CAREFUL! If you use "SRD_SuperToolsEngine" plugin, and you use the Menu Editor in any
 * menu with a Description Window, you will set absolute positions for the windows,
 * and the change in number of Lines may not be reflected!
 * ==== If you use "YEP_X_InBattleStatus", you'll also have to set the "Window Y" parameter
 * (the inside of the "this.fittingHeight()" function) to be equal to this parameter, to 
 * show properly
 * ======== Enemy targeting Description
 * ==== Show Enemy HP (Default: true) — show the enemy HP gauge in the targeting help
 * ==== Show Enemy MP (Default: true) — show the enemy MP gauge in the targeting help
 * ==== Show Enemy TP (Default: true) — show the enemy TP gauge in the targeting help
 * ==== Number of Lines (Default: 2) — number of visible lines in the targeting help window
 * ==== Per-enemy overrides via notetags: 
 * <Show Description HP>
 * <Hide Description HP> 
 * 
 * <Show Description MP> 
 * <Hide Description MP>
 * 
 * <Show Description TP> 
 * <Hide Description TP>
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ======================================
 * JavaScript - Lunatic
 * ======================================
 * ================ Running Script calls in Descriptions
 * ======== In the Description text (including Extended Description), using the "<Condition ...>" notetag, you can actually run JavaScript code, such as using script calls
 * ==== Just be sure that the last instruction of the javascript code returns True/False, for the Condition (if you need it)
 * ==== This will make the javascript code run each time the description is shown
 * == This includes loading each time you use the key to expand the description to fullscreen, as it re-evaluates the javascript upon showing the full description
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
 * 
 * @param -- Small set text added to the Description Window --
 * @type select
 * @option Yes
 * @value Yes
 * @option No
 * @value No
 * @desc Whether to show a custom small set text message within the Description Window
 * (for example, to let the player know of keybindings for Description Expansion)
 * (The rest of the sub-parameters under this one require this one to be set to "Yes" to function)
 * @default Yes
 * 
 * @param Text to show
 * @parent -- Small set text added to the Description Window --
 * @desc The custom small set text to show within the Description Window (requires parent set to Yes)
 * @default "'[' Key to Expand/Collapse"
 * 
 * 
 * @param Text position within the Description Window
 * @parent -- Small set text added to the Description Window --
 * @type select
 * @option Top-Left
 * @value Top-Left
 * @option Top-Right
 * @value Top-Right
 * @option Bottom-Left
 * @value Bottom-Left
 * @option Bottom-Right
 * @value Bottom-Right
 * @desc The position of the small text to show within the Description Window.
 * @default Bottom-Right
 *
 * @param Text color
 * @parent -- Small set text added to the Description Window --
 * @desc The text color (CSS/hex, e.g. #1a90b3) for this small text.
 * @default #1a90b3
 *
 * @param Text size
 * @parent -- Small set text added to the Description Window --
 * @desc The font size for this small text.
 * @default 5
 *
 * @param Text font
 * @parent -- Small set text added to the Description Window --
 * @desc The font family for this element text.
 * @default GameFont
 *
 * @param X offset
 * @parent -- Small set text added to the Description Window --
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 * @desc Pixel offset applied to the horizontal position of the small text overlay.
 *
 * @param Y offset
 * @parent -- Small set text added to the Description Window --
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 * @desc Pixel offset applied to the vertical position of the small text overlay.
 * 
 * 
 * 
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
 * @param ---Enemy targeting Description---
 * @default
 * 
 * @param Show Enemy HP
 * @parent ---Enemy targeting Description---
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 * @desc Show the enemy HP gauge in the enemy targeting description window.
 * 
 * @param Show Enemy MP
 * @parent ---Enemy targeting Description---
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 * @desc Show the enemy MP gauge in the enemy targeting description window.
 * 
 * @param Show Enemy TP
 * @parent ---Enemy targeting Description---
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 * @desc Show the enemy TP gauge in the enemy targeting description window.
 * 
 * @param Number of Lines
 * @parent ---Enemy targeting Description---
 * @type number
 * @min -9999
 * @max 9999
 * @default 4
 * @desc Number of visible lines in the enemy targeting help window.
 * 
 */
//=============================================================================

// ================================ Adds the Expand/Collapse of the Description Window (to see it in Fullscreen) via custom Key
// ==== Cache plugin parameters for convenience
var JakeMSG_MoreDescriptionsWithConditions_Params = PluginManager.parameters('JakeMSG_MoreDescriptionsWithConditions');
var JakeMSG_MoreDescriptionsWithConditions_Key = Number(JakeMSG_MoreDescriptionsWithConditions_Params['Key for Expand Description'] || 219);
var JakeMSG_MoreDescriptionsWithConditions_ShowEnemyHp = eval(String(JakeMSG_MoreDescriptionsWithConditions_Params['Show Enemy HP'] || 'true'));
var JakeMSG_MoreDescriptionsWithConditions_ShowEnemyMp = eval(String(JakeMSG_MoreDescriptionsWithConditions_Params['Show Enemy MP'] || 'true'));
var JakeMSG_MoreDescriptionsWithConditions_ShowEnemyTp = eval(String(JakeMSG_MoreDescriptionsWithConditions_Params['Show Enemy TP'] || 'true'));
var JakeMSG_MoreDescriptionsWithConditions_DefaultLines = Number(JakeMSG_MoreDescriptionsWithConditions_Params['Description Window number of Lines'] || 2);
var JakeMSG_MoreDescriptionsWithConditions_EnemyLines = Number(JakeMSG_MoreDescriptionsWithConditions_Params['Number of Lines'] || 2);
var JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText = String(JakeMSG_MoreDescriptionsWithConditions_Params['-- Small set text added to the Description Window --'] || 'No') === 'Yes';
var JakeMSG_MoreDescriptionsWithConditions_SmallHelpText = JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText ? String(JakeMSG_MoreDescriptionsWithConditions_Params['Text to show'] || '') : '';
var JakeMSG_MoreDescriptionsWithConditions_SmallHelpPosition = JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText ? String(JakeMSG_MoreDescriptionsWithConditions_Params['Text position within the Description Window'] || 'Bottom-Right') : '';
var JakeMSG_MoreDescriptionsWithConditions_SmallHelpColor = JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText ? String(JakeMSG_MoreDescriptionsWithConditions_Params['Text color'] || '#1a90b3') : '';
var JakeMSG_MoreDescriptionsWithConditions_SmallHelpSize = JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText ? Number(JakeMSG_MoreDescriptionsWithConditions_Params['Text size'] || 5) : 0;
var JakeMSG_MoreDescriptionsWithConditions_SmallHelpFont = JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText ? String(JakeMSG_MoreDescriptionsWithConditions_Params['Text font'] || 'GameFont') : '';
var JakeMSG_MoreDescriptionsWithConditions_SmallHelpXOffset = JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText ? Number(JakeMSG_MoreDescriptionsWithConditions_Params['X offset'] || 0) : 0;
var JakeMSG_MoreDescriptionsWithConditions_SmallHelpYOffset = JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText ? Number(JakeMSG_MoreDescriptionsWithConditions_Params['Y offset'] || 0) : 0;
var JakeMSG_MoreDescriptionsWithConditions_ActiveSmallHelpSprite = null;

function JakeMSG_MoreDescriptionsWithConditions_cleanupOrphanSmallHelpSprite(exceptSprite) {
    var active = JakeMSG_MoreDescriptionsWithConditions_ActiveSmallHelpSprite;
    if (!active || active === exceptSprite) return;
    if (active.parent) active.parent.removeChild(active);
    active.bitmap = null;
    JakeMSG_MoreDescriptionsWithConditions_ActiveSmallHelpSprite = null;
}

function JakeMSG_MoreDescriptionsWithConditions_buildExtendedDescription(noteText) {
    if (!noteText) return '';
    var extDesc = '';
    var noteArray = noteText.split(/[\r\n]+/);
    var noteLine = 'none';
    var readExtDesc = false;
    var tempStopExtDesc = false;
    for (var i = 0; i < noteArray.length; i++) {
        noteLine = noteArray[i];
        if (noteLine.match(/<(?:EXTEND|EXTENDED|EXTENDED DESCRIPTION|EXTENDEDDESCRIPTION|EXTEND DESCRIPTION|EXTENDDESCRIPTION|EXTEND DESCRIPT|EXTENDDESCRIPT|EXT DESC|EXTDESC)>/i)) {
            readExtDesc = true;
            tempStopExtDesc = false;
        } else if (noteLine.match(/<(?:COND:|CONDITION:)[ ]?\s*(.*)>/i)) {
            try {
                var cond = eval(RegExp.$1);
                if (!cond) {
                    tempStopExtDesc = true;
                }
            } catch (e) {
                console.error('JakeMSG_MoreDescriptionWithConditions eval error: ' + e.message);
                tempStopExtDesc = true;
            }
        } else if (noteLine.match(/<(?:RESUME)>/i)) {
            tempStopExtDesc = false;
        } else if (noteLine.match(/<\/(?:EXTEND|EXTENDED|EXTENDED DESCRIPTION|EXTENDEDDESCRIPTION|EXTEND DESCRIPTION|EXTENDDESCRIPTION|EXTEND DESCRIPT|EXTENDDESCRIPT|EXT DESC|EXTDESC)>/i)) {
            readExtDesc = false;
        } else if (readExtDesc === true && tempStopExtDesc === false) {
            if (extDesc.length > 0) {
                extDesc += "\n";
            }
            extDesc += noteLine;
        }
    }
    return extDesc;
}

// ======== Notetag processing for enemy specific description gauges
var JakeMSG_MoreDescriptionsWithConditions_NotetagsProcessed = false;
var JakeMSG_MoreDescriptionsWithConditions_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!JakeMSG_MoreDescriptionsWithConditions_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!JakeMSG_MoreDescriptionsWithConditions_NotetagsProcessed) {
        this.processJakeMSGMoreDescEnemyNotetags($dataEnemies);
        JakeMSG_MoreDescriptionsWithConditions_NotetagsProcessed = true;
    }
    return true;
};

DataManager.processJakeMSGMoreDescEnemyNotetags = function(group) {
    if (!group) return;
    for (var n = 1; n < group.length; n++) {
        var obj = group[n];
        if (!obj) continue;
        obj.showDescHp = JakeMSG_MoreDescriptionsWithConditions_ShowEnemyHp;
        obj.showDescMp = JakeMSG_MoreDescriptionsWithConditions_ShowEnemyMp;
        obj.showDescTp = JakeMSG_MoreDescriptionsWithConditions_ShowEnemyTp;
        var notedata = obj.note.split(/[\r\n]+/);
        for (var i = 0; i < notedata.length; i++) {
            var line = notedata[i];
            if (line.match(/<(?:SHOW DESCRIPTION HP)>/i)) {
                obj.showDescHp = true;
            } else if (line.match(/<(?:HIDE DESCRIPTION HP)>/i)) {
                obj.showDescHp = false;
            } else if (line.match(/<(?:SHOW DESCRIPTION MP)>/i)) {
                obj.showDescMp = true;
            } else if (line.match(/<(?:HIDE DESCRIPTION MP)>/i)) {
                obj.showDescMp = false;
            } else if (line.match(/<(?:SHOW DESCRIPTION TP)>/i)) {
                obj.showDescTp = true;
            } else if (line.match(/<(?:HIDE DESCRIPTION TP)>/i)) {
                obj.showDescTp = false;
            }
        }
    }
};

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
                var text = scene._helpWindow.jakeMSGExpandedText ? scene._helpWindow.jakeMSGExpandedText() : (scene._helpWindow._text || '');
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
JakeMSG_MoreDescriptionsWithConditions_Scene_Base_terminate = Scene_Base.prototype.terminate;
Scene_Base.prototype.terminate = function() {
    if (this._helpWindow && this._helpWindow.jakeMSGDestroySmallHelpSprite) {
        this._helpWindow.jakeMSGDestroySmallHelpSprite();
    }
    JakeMSG_MoreDescriptionsWithConditions_cleanupOrphanSmallHelpSprite(null);
    JakeMSG_MoreDescriptionsWithConditions_Scene_Base_terminate.call(this);
};

JakeMSG_MoreDescriptionsWithConditions_Window_Help_hide = Window_Help.prototype.hide;
Window_Help.prototype.hide = function() {
    JakeMSG_MoreDescriptionsWithConditions_Window_Help_hide.call(this);
    this.jakeMSGDestroySmallHelpSprite();
    var scene = SceneManager._scene;
    if (scene && scene._helpWindowExpanded) {
        if (scene.children.indexOf(scene._helpWindowExpanded) >= 0) {
            scene.removeChild(scene._helpWindowExpanded);
        }
        scene._helpWindowExpanded = null;
    }
};

// Track battler that was rendered into the help window (for enemy expanded text)
if (Window_Help.prototype.setBattler) {
    JakeMSG_MoreDescriptionsWithConditions_Window_Help_setBattler = Window_Help.prototype.setBattler;
    Window_Help.prototype.setBattler = function(battler) {
        this._jakeMSGEnemyForDesc = (battler && battler.isEnemy && $gameParty && $gameParty.inBattle()) ? battler : null;
        this.jakeMSGApplyHelpLinesForBattler(this._jakeMSGEnemyForDesc);
        JakeMSG_MoreDescriptionsWithConditions_Window_Help_setBattler.call(this, battler);
        this.jakeMSGDrawSmallHelpText();
    };
}

Window_Help.prototype.jakeMSGIsActiveHelpWindow = function() {
    var scene = SceneManager._scene;
    return !!(scene && scene._helpWindow === this);
};

Window_Help.prototype.jakeMSGDestroySmallHelpSprite = function() {
    if (!this._jakeMSGSmallHelpSprite) return;
    if (JakeMSG_MoreDescriptionsWithConditions_ActiveSmallHelpSprite === this._jakeMSGSmallHelpSprite) {
        JakeMSG_MoreDescriptionsWithConditions_ActiveSmallHelpSprite = null;
    }
    if (this._jakeMSGSmallHelpSprite.parent) {
        this._jakeMSGSmallHelpSprite.parent.removeChild(this._jakeMSGSmallHelpSprite);
    }
    this._jakeMSGSmallHelpSprite.bitmap = null;
    this._jakeMSGSmallHelpSprite = null;
};

Window_Help.prototype.jakeMSGEnsureSmallHelpSprite = function() {
    JakeMSG_MoreDescriptionsWithConditions_cleanupOrphanSmallHelpSprite(null);
    if (this._jakeMSGSmallHelpSprite && this._jakeMSGSmallHelpSprite.parent !== this) {
        this.jakeMSGDestroySmallHelpSprite();
    }
    if (!this._jakeMSGSmallHelpSprite) {
        this._jakeMSGSmallHelpSprite = new Sprite();
        this.addChild(this._jakeMSGSmallHelpSprite);
    }
};

Window_Help.prototype.jakeMSGDrawSmallHelpText = function() {
    if (!JakeMSG_MoreDescriptionsWithConditions_ShowSmallHelpText) {
        this.jakeMSGDestroySmallHelpSprite();
        return;
    }
    if (this instanceof Window_Help_Expanded) {
        this.jakeMSGDestroySmallHelpSprite();
        return;
    }
    if (!this.jakeMSGIsActiveHelpWindow() || !this.visible) {
        this.jakeMSGDestroySmallHelpSprite();
        return;
    }
    var text = JakeMSG_MoreDescriptionsWithConditions_SmallHelpText;
    if (!text) {
        this.jakeMSGDestroySmallHelpSprite();
        return;
    }

    this.jakeMSGEnsureSmallHelpSprite();
    var sprite = this._jakeMSGSmallHelpSprite;
    JakeMSG_MoreDescriptionsWithConditions_cleanupOrphanSmallHelpSprite(sprite);
    var fontSize = JakeMSG_MoreDescriptionsWithConditions_SmallHelpSize;
    var measureBmp = new Bitmap(1, 1);
    measureBmp.fontFace = JakeMSG_MoreDescriptionsWithConditions_SmallHelpFont;
    measureBmp.fontSize = fontSize;
    var textWidth = Math.ceil(measureBmp.measureTextWidth(text));
    var textHeight = fontSize + 8;
    var bmp = new Bitmap(textWidth, textHeight);
    bmp.fontFace = JakeMSG_MoreDescriptionsWithConditions_SmallHelpFont;
    bmp.fontSize = fontSize;
    bmp.textColor = JakeMSG_MoreDescriptionsWithConditions_SmallHelpColor;
    bmp.drawText(text, 0, 0, textWidth, textHeight, 'left');

    sprite.bitmap = bmp;
    sprite.visible = true;
    JakeMSG_MoreDescriptionsWithConditions_ActiveSmallHelpSprite = sprite;

    var x = 0;
    var y = 0;
    switch (JakeMSG_MoreDescriptionsWithConditions_SmallHelpPosition) {
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
    x += JakeMSG_MoreDescriptionsWithConditions_SmallHelpXOffset;
    y += JakeMSG_MoreDescriptionsWithConditions_SmallHelpYOffset;
    sprite.move(x, y);
};

JakeMSG_MoreDescriptionsWithConditions_Window_Help_update = Window_Help.prototype.update;
Window_Help.prototype.update = function() {
    JakeMSG_MoreDescriptionsWithConditions_Window_Help_update.call(this);
    if (this._jakeMSGSmallHelpSprite && (!this.visible || !this.jakeMSGIsActiveHelpWindow())) {
        this.jakeMSGDestroySmallHelpSprite();
    }
};

JakeMSG_MoreDescriptionsWithConditions_Window_Help_refresh = Window_Help.prototype.refresh;
Window_Help.prototype.refresh = function() {
    JakeMSG_MoreDescriptionsWithConditions_Window_Help_refresh.call(this);
    this.jakeMSGDrawSmallHelpText();
};

Window_Help.prototype.jakeMSGApplyHelpLinesForBattler = function(enemyBattler) {
    var targetLines = enemyBattler ? JakeMSG_MoreDescriptionsWithConditions_EnemyLines : JakeMSG_MoreDescriptionsWithConditions_DefaultLines;
    var targetHeight = this.fittingHeight(targetLines);
    if (this.height !== targetHeight) {
        this.height = targetHeight;
        this.createContents();
        this.jakeMSGDrawSmallHelpText();
    }
};




// ================================ Sets the number of (visible) lines for the Description window.
// ======== Method Re-initialization
Window_Help.prototype.initialize = function(numLines) {
    var width = Graphics.boxWidth;
    var height = this.fittingHeight(JakeMSG_MoreDescriptionsWithConditions_DefaultLines);
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

Window_Help.prototype.jakeMSGExpandedText = function() {
    if (this._jakeMSGEnemyForDesc && this._jakeMSGEnemyForDesc.enemy) {
        var enemyData = this._jakeMSGEnemyForDesc.enemy();
        var baseText = this._jakeMSGEnemyForDesc.name();
        var extDesc = JakeMSG_MoreDescriptionsWithConditions_buildExtendedDescription(enemyData.note);
        if (extDesc.length > 0) {
            baseText += "\n" + extDesc;
        }
        return baseText;
    }
    return this._text || '';
};

// ======== Enemy target description: add HP/MP/TP gauges under name + state icons
JakeMSG_MoreDescriptionsWithConditions_Window_Help_drawBattler = Window_Help.prototype.drawBattler || function(battler) {
    if (battler && battler.name) {
        var wy = (this.contents.height - this.lineHeight()) / 2;
        this.drawText(battler.name(), 0, wy, this.contents.width, 'center');
    }
};
Window_Help.prototype.drawBattler = function(battler) {
    if (battler && battler.isEnemy && $gameParty && $gameParty.inBattle()) {
        this.drawJakeMSGEnemyDescription(battler);
    } else {
        JakeMSG_MoreDescriptionsWithConditions_Window_Help_drawBattler.call(this, battler);
    }
};

Window_Help.prototype.drawJakeMSGEnemyDescription = function(battler) {
    this.resetFontSettings();
    var y = 0;
    var w = this.contents.width;
    this.drawText(battler.name(), 0, y, w, 'center');
    y += this.lineHeight();
    var icons = battler.allIcons ? battler.allIcons() : [];
    if (icons.length > 0) {
        var ww = Math.min(icons.length * Window_Base._iconWidth, w);
        var wx = (w - ww) / 2;
        this.drawActorIcons(battler, wx, y, ww);
        y += this.lineHeight();
    }
    this.drawJakeMSGEnemyGauges(battler, y);
};

Window_Help.prototype.drawJakeMSGEnemyGauges = function(battler, startY) {
    var enemyData = battler.enemy ? battler.enemy() : null;
    if (!enemyData) return;
    var x = this.textPadding();
    var w = this.contents.width - this.textPadding() * 2;
    var y = startY;
    if (enemyData.showDescHp) {
        this.drawJakeMSGEnemyHp(battler, x, y, w);
        y += this.lineHeight();
    }
    if (enemyData.showDescMp) {
        this.drawJakeMSGEnemyMp(battler, x, y, w);
        y += this.lineHeight();
    }
    if (enemyData.showDescTp) {
        this.drawJakeMSGEnemyTp(battler, x, y, w);
    }
};

Window_Help.prototype.drawJakeMSGEnemyHp = function(enemy, x, y, width) {
    var canDrawBarrier = Imported.YEP_AbsorptionBarrier && typeof this.drawBarrierGauge === 'function' && typeof enemy.barrierPoints === 'function' && enemy.barrierPoints() > 0;
    if (canDrawBarrier) {
        width = this.drawBarrierGauge(enemy, x, y, width);
    } else {
        this.drawGauge(x, y, width, enemy.hpRate ? enemy.hpRate() : (enemy.mhp > 0 ? enemy.hp / enemy.mhp : 0), this.hpGaugeColor1(), this.hpGaugeColor2());
    }
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.hpA, x, y, 44);
    this.drawCurrentAndMax(enemy.hp, enemy.mhp, x, y, width, this.hpColor(enemy), this.normalColor());
};

Window_Help.prototype.drawJakeMSGEnemyMp = function(enemy, x, y, width) {
    var rate = enemy.mpRate ? enemy.mpRate() : (enemy.mmp > 0 ? enemy.mp / enemy.mmp : 0);
    this.drawGauge(x, y, width, rate, this.mpGaugeColor1(), this.mpGaugeColor2());
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.mpA, x, y, 44);
    this.drawCurrentAndMax(enemy.mp, enemy.mmp, x, y, width, this.mpColor(enemy), this.normalColor());
};

Window_Help.prototype.drawJakeMSGEnemyTp = function(enemy, x, y, width) {
    var maxTp = enemy.maxTp ? enemy.maxTp() : 100;
    var rate = enemy.tpRate ? enemy.tpRate() : (maxTp > 0 ? enemy.tp / maxTp : 0);
    this.drawGauge(x, y, width, rate, this.tpGaugeColor1(), this.tpGaugeColor2());
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.tpA, x, y, 44);
    this.changeTextColor(this.tpColor(enemy));
    this.drawText(enemy.tp, x + width - 64, y, 64, 'right');
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
