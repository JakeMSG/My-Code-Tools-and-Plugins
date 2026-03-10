//=============================================================================
// Addition to YEP plugin "Item Core", made by JakeMSG
// JakeMSG_YEP_MessageCore_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_MessageCore_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.Message_JakeMSGAdd = Yanfly.Message_JakeMSGAdd || {};
Yanfly.Message_JakeMSGAdd.version = 1.0;

//=============================================================================
 /*:
 * @plugindesc v1.0 (Requires YEP_MessageCore.js) Additions to the base
 * Message Core yanfly Plugin
 * @author JakeMSG
 * v1.0
 * 
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_MessageCore.
 * Make sure this plugin is located under YEP_MessageCore in the plugin list.
 *
 * This plugin simply allows the use of normal line breaks within Message commands
 * at the same time with Word Wrapping turned On.
 * 
 * Keep in mind, if you also use <br>, both that, and the normal line breaks,
 * will create new lines
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
 * @param Line Breaks in Messages enabled while Word Wrapping is On
 * @text Line Breaks in Messages enabled while Word Wrapping is On
 * @type boolean
 * @on YES
 * @off NO
 * @desc If True, Line Breaks in Messages are also enabled, even with Word Wrapping On
 * NO - false     YES - true
 * @default true
 * 
 * 
 * 
 */
//=============================================================================




if (Imported.YEP_MessageCore) {

//=============================================================================
// Window_Base
//=============================================================================

// ======== Method Re-initialization
Window_Base.prototype.setWordWrap = function(text) {
    // ======== Adds back the line break, even during Word Wrap
    // ==== "$1" = the 1st (the only) regex capture group
    if (eval(PluginManager.parameters("JakeMSG_YEP_MessageCore_Additions")["Line Breaks in Messages enabled while Word Wrapping is On"])) var lineBreakWhileWordWrap = "$1";
    else var lineBreakWhileWordWrap = "";
    this._wordWrap = false;
    if (text.match(/<(?:WordWrap)>/i)) {
      this._wordWrap = true;
      text = text.replace(/<(?:WordWrap)>/gi, '');
    }
    if (this._wordWrap) {
      var replace = Yanfly.Param.MSGWrapSpace ? ' ' : '';
      text = text.replace(/([\n\r])+/g, replace+lineBreakWhileWordWrap); // ==== Addded the possible Line Break back here
    }
    if (this._wordWrap) {
      text = text.replace(/<(?:BR|line break)>/gi, '\n');
    } else {
      text = text.replace(/<(?:BR|line break)>/gi, '');
    }
    return text;
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
