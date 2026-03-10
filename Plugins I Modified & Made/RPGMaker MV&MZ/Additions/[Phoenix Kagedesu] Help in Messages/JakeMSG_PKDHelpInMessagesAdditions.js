//=============================================================================
// JakeMSG_PKDHelpInMessagesAdditions
// JakeMSG_PKDHelpInMessagesAdditions.js
//=============================================================================

var JakeMSG = JakeMSG || {};
JakeMSG.PKDHelpInMessages = JakeMSG.PKDHelpInMessages || {};
JakeMSG.PKDHelpInMessages.Param = JakeMSG.PKDHelpInMessages.Param || {};


//=============================================================================
 /*:
 * @plugindesc Adds compatibilities for this plugin with other existing Plugins
 * Also adds new features!
 * REQUIRES: "PKD_HelpInMessages" plugin (Basic/Pro)!
 * @author JakeMSG
 * v1.1
 * 
============ Change Log ============
1.1 - 2.26th.2026
 * Added Clear Key parameter to manually clear all pinned Help Messages
1.0 - 2.15th.2026
 * initial release
====================================
 * @help
 * ======================== New Features:
 * ================ Right-Click to Pin Help message
 * ======== If you Right-Click while a Help message is showing, said latest message will be "Pinned", remaining on the screen even when you hover off of the Help Message's keyword
 * ==== You can pin multiple Help messages, consecutively!
 * ==== After you open another Help message, then let it close, or when you move to the next Message Box, all Pinned Messages will also be closed
 * ==== Added a Parameter to set an Alternative Key for pinning Help Messages (set via KeyCode)
 * ================ Clear Key to Clear All Pinned Help Messages
 * ======== Added a Parameter to set a Key for clearing all remaining pinned Help Messages on the screen (set via KeyCode)
 * ==== This is useful if Help Messages remain on screen after windows are closed
 * ================ Adds the Key Link functionality to ANY WINDOW (that extends the "Window_Base" class), not just Message Boxes!
 * !!!!!!!! Warning: if you want this to work, you will have to edit the original plugin, to comment out 1 line. If you have:
 * ==== Basic version: insert "//" at the beginning of line 1427
 * ==== Pro version: insert "//" at the beginning of line 1297 
 * ======== You can test the Key Link's code to see which Windows support it. Includes:
 * ==== Descriptions of Items/Equipments
 * ==== Status Windows
 * ==== Text in most windows
 * == So long as you can hover your mouse over it, it should work (including other Plugins)
 * ==== Yanfly's Event Mini Labels
 * ==== THE HELP MESSAGES THEMSELVES (Nested Help Messages):
 * == To be able to use this, you will have to first Pin the Help Message, to be able to hover the mouse over the Help Link
 * 
 * 
 * ======================== Current Compatibility Fixes
 * ================ Yanfly - Message Core
 * ======== If the Word used by the Help link had a Space in between, the Message wouldn't show upon hover
 * ==== Issue was with the way the AutoWrap of Yanfly checked for going over the width, specifically when checking for the blank space (" ") character.
 * **** I added a new check within it, checking for the "TM" tags around said space
 * ================ Yanfly - Core Engine
 * ============ Font Size
 * ======== Font used within the Help Message Window would be the same as the one set in the parameters of the Core Engine plugin
 * ==== You can now add Help Message, from this (my) plugin instead, to be able to also set, per each Help Message, its individual Font Size
 * == Help Messages from the original plugin's parameters will still work, too! (Though they will use the Font Size set by Yanfly)
 * = (This is true for the original plugin, too) If 2 help message entries have the same ID, the first one will have priority
 * = If a help message in the parameters of this (my) plugin has the same ID as one from the original plugin's parameters, mine will take priority
 * == I split my Help Messages in 20 different parameter entries, to allow you to organize them better (they all still load, in order)
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ========================= New Parameters
 * @param Alt-key for Pinning Help Message 
 * @text Alt-key for Pinning Help Message 
 * @type number
 * @min -9999
 * @max 9999
 * @default 80
 * @desc Alternative key that can be used for Pinning Help Message (Needs to be the Keycode number for it) (Default = 80 (p))
 * 
 * @param Clear Key for Help Messages
 * @text Clear Key for Help Messages
 * @type number
 * @min -9999
 * @max 9999
 * @default 76
 * @desc Key that can be used to clear all remaining pinned Help Messages (Needs to be the Keycode number for it) (Default = 76 (l))
 * 
 * 
 * @param 1 - Help Messages with Font Size
 * @text 1 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default ["{\"Id\":\"test\",\"Width\":\"220\",\"Height\":\"120\",\"Font Size\":\"28\",\"Background Type\":\"Window\",\"Windowskin\":\"HelpWindowSkin\",\"Text\":\"\\\"\\\\\\\\C[1]Magic Shard \\\\\\\\I[312]\\\\\\\\C[0]\\\\n\\\\\\\\}Some cool and rare item...\\\\nMagic shard used for....\\\\n\\\"\"}", "{\"Id\":\"test2\",\"Width\":\"280\",\"Height\":\"120\",\"Font Size\":\"28\",\"Background Type\":\"Window\",\"Windowskin\":\"HelpWindowSkin\",\"Text\":\"\\\"\\\\\\\\C[2]Slime \\\\\\\\I[320]\\\\\\\\C[0]\\\\n\\\\\\\\}Some monster description...\\\\nBe aware of slimes water attacks\\\\n\\\\n\\\"\"}"]
 * 
 * @param 2 - Help Messages with Font Size
 * @text 2 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 3 - Help Messages with Font Size
 * @text 3 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 4 - Help Messages with Font Size
 * @text 4 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 5 - Help Messages with Font Size
 * @text 5 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 6 - Help Messages with Font Size
 * @text 6 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 7 - Help Messages with Font Size
 * @text 7 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 8 - Help Messages with Font Size
 * @text 8 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 9 - Help Messages with Font Size
 * @text 9 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 10 - Help Messages with Font Size
 * @text 10 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 11 - Help Messages with Font Size
 * @text 11 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 12 - Help Messages with Font Size
 * @text 12 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 13 - Help Messages with Font Size
 * @text 13 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 14 - Help Messages with Font Size
 * @text 14 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 15 - Help Messages with Font Size
 * @text 15 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 16 - Help Messages with Font Size
 * @text 16 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 17 - Help Messages with Font Size
 * @text 17 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 18 - Help Messages with Font Size
 * @text 18 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 19 - Help Messages with Font Size
 * @text 19 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * @param 20 - Help Messages with Font Size
 * @text 20 - Help Messages with Font Size
 * @type struct<LinkInfoMine>[]
 * @default []
 * 
 * 
 * 
 * 
*/ 
/*~struct~LinkInfoMine:
 * @param Id
 * @type text
 * @default new
 * @desc Any word, but should be unique for each Help message!
 *
 * @param Width
 * @type number
 * @min 1
 * @max 1000
 * @default 320
 * @desc Text window width
 * 
 * @param Height
 * @type number
 * @min 1
 * @max 1000
 * @default 140
 * @desc Text window height
 * 
 * @param Font Size
 * @type number
 * @min 1
 * @max 9999
 * @default 28
 * @desc Text Font Size
 * 
 * @param Background Type
 * @type combo
 * @option Window
 * @option Dim
 * @option Transparent
 * @default Window
 * 
 * @param Windowskin
 * @type file
 * @dir img/pictures/
 * @require 1
 * @default HelpWindowSkin
 * 
 * @param Text
 * @type note
 * @desc Message text, support escape symbols
 * @default Some text...
 *
 * @param Txt
 * @desc Message text from .txt file. Have priority. Filename without extension. File should be in data\Hints\NAME.txt
 * @default
 */
//=============================================================================

if (Imported.PKD_HelpInMsg) {




// ================================ Compatibility for: Yanfly - Message Core
if (Imported.YEP_MessageCore) {
// ======== Method Re-initialization
Window_Base.prototype.checkWordWrap = function(textState) {
    if (!textState) return false;
    if (!this._wordWrap) return false;
    if (textState.text[textState.index] === ' ') {
      // ==== The following code sequence makes sure the Spaces within the Help Keywords are ignored
      var size = textState.text.length;
      for(var i = textState.index-2; i>=0; i--){
        if(textState.text[i] === "T" && textState.text[i+1] === "M" && textState.text[i+2] === "[") break; // Looks for the beinning tag of the Help Keyword
      }
      for(var j = textState.index+1; j<=size; j++){
        if(textState.text[j] === "M" && textState.text[j-1] === "T") break; // Looks for the end tag of the Help Keyword
      }
      if (i != -1 && j != size+1) return false;
      // ====

      var nextSpace = textState.text.indexOf(' ', textState.index + 1);
      var nextBreak = textState.text.indexOf('\n', textState.index + 1);
      if (nextSpace < 0) nextSpace = textState.text.length + 1;
      if (nextBreak > 0) nextSpace = Math.min(nextSpace, nextBreak);
      var word = textState.text.substring(textState.index, nextSpace);
      var size = this.textWidthExCheck(word);
    }
    return (size + textState.x > this.wordwrapWidth());
    
};

};




// ================================ Compatibility for: Yanfly - Core Engine
// ======================== Adds Separate Font Size per each Help message 
// ======== Method Re-initialization
PKD_HelpInMsg.loadParams = function(){
        PKD_HelpInMsg.initTxtDB();
        const pluginName = "PKD_HelpInMessages";
        const params = PluginManager.parameters(pluginName);

        let ParsePluginHelpData = () => {
            let lines = JsonEx.parse(params["Help Messages"]);
            let newLines = JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["1 - Help Messages with Font Size"]);
            // ==== Added the next  lines to append the Help Messages from this plugin's parameters to the the original ones (to be able to use both))
            // == Separated my Help Messages into 20 different entries, for better organization
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["2 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["3 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["4 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["5 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["6 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["7 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["8 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["9 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["10 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["11 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["12 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["13 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["14 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["15 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["16 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["17 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["18 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["19 - Help Messages with Font Size"]));
            newLines = newLines.concat(JsonEx.parse(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["20 - Help Messages with Font Size"]));
            lines = newLines.concat(lines);
            // ====

            let parsed = lines.map((l) => JsonEx.parse(l));
            parsed.forEach(element => {
                if(element.Text)
                    element.Text = JsonEx.parse(element.Text);
                else
                    element.Text = "";
                PKD_HelpInMsg.loadTxt(element.Txt);
                element.Width = parseInt(element.Width);
                element.Height = parseInt(element.Height);
            });
            return parsed;
        };

        let ParsePluginAutoWrapData = () => {
            let lines = JsonEx.parse(params["Auto Wrap Sentences"]);
            let parsed = lines.map((l) => JsonEx.parse(l));
            return parsed;
        };

        PKD_HelpInMsg.HelpMessagesData = ParsePluginHelpData();
        PKD_HelpInMsg.AutoWrapWords = ParsePluginAutoWrapData();
        PKD_HelpInMsg.WordsCollection = PKD_HelpInMsg.AutoWrapWords.map((element) => element.Sentence);
        PKD_HelpInMsg.TIME_TO_SHOW = parseInt(params["Show Delay"]) || 20;
        PKD_HelpInMsg.LINK_SYMBOL = 'TM';

        // * ITEMS HINTS
        PKD_HelpInMsg.IsShowItemHints = eval(params.IsShowItemHints || 'true');
        PKD_HelpInMsg.ShowItemHintTimeDelay = parseInt(params.ShowItemHintTimeDelay || 10);
        PKD_HelpInMsg.ItemHelpWindowPosToCursor = eval(params.ItemHelpWindowPosToCursor || 'false');
        PKD_HelpInMsg.ItemHelpWindowPosMargins = JsonEx.parse(params.ItemHelpWindowPosMargins || '{"x":"0","y":"0"}');
        PKD_HelpInMsg.ItemHelpWindowPosMargins.x = parseInt(PKD_HelpInMsg.ItemHelpWindowPosMargins.x);
        PKD_HelpInMsg.ItemHelpWindowPosMargins.y = parseInt(PKD_HelpInMsg.ItemHelpWindowPosMargins.y);

        if(!PKD_HelpInMsg.isMV()) {
            PluginManager.registerCommand(pluginName, 'SetWrap', args => {
                try {
                    let value = eval(args.active);
                    $gameSystem.him_autoWW = value;
                } catch (e) {
                    console.warn(e);
                }
            });

            PluginManager.registerCommand(pluginName, 'SetHints', args => {
                try {
                    let value = eval(args.active);
                    $gameSystem.him_hints = value;
                } catch (e) {
                    console.warn(e);
                }
            });
        }
};

// ======== Method Re-initialization
PKD_HelpInMsg.getHelpMessage = function (id) {
    var infodata = PKD_HelpInMsg.getJDataById(id, PKD_HelpInMsg.HelpMessagesData);
    // ==== The following, when Help Message data exists, does the temporary Font change needed for said Message
    if (infodata){
      if (infodata["Font Size"]){ // Checks if current Help Message has a separate Font Size (Message from my plugin's parameters) or not (Message from the original plugin's parameters)
        JakeMSG.PKDHelpInMessages.Param.FontSize = Number(infodata["Font Size"]); // This changes the Font used by "Window_Base.prototype.standardFontSize", temporarily, to the Font for the given Help Message
        JakeMSG.PKDHelpInMessages.Param.FontUse = true; // This marks that Temporary Font is in use
      }
    }
    return infodata;
};

// ================ Also adds the Pin by Right-Click ("__helpLinkInfoWindow" becomes an array)
// ======== Method Re-initialization
Window_Message.prototype._hideHelpLinksInfo = function() {
    JakeMSG.PKDHelpInMessages.Param.FontUse = false; // This stops the usage of the Temporary Font
    if (JakeMSG.PKDHelpInMessages.clickPin){
      // ==== If Hide is triggered while clickPin is true, it's turned to false and "pinned" is turned true
      JakeMSG.PKDHelpInMessages.clickPin = false;
      JakeMSG.PKDHelpInMessages.pinned = true;
    }
    // ==== If "pinned" is false, will Hide, otherwise it will not
    if (!JakeMSG.PKDHelpInMessages.pinned){
      // ==== "__helpLinkInfoWindow" becomes an array
      if (this.__helpLinkInfoWindow[this._currentHelpLink] == null) {
        return;
      }
      for(var i = this._currentHelpLink; i > -1; i--){
        if (this.__helpLinkInfoWindow[i]){
          this.__helpLinkInfoWindow[i].close();
          this.__helpLinkInfoWindow[i].removeFromParent();
        }
      }
      this._currentHelpLink = -1;
      this.__helpLinkInfoWindow = [];
      // ==== Resets this previous Help Info variables
      this.__prev3LinkHelpInfo = null;
      this.__prev2LinkHelpInfo = null;
      this.__prev1LinkHelpInfo = null;
      return this.__lastLinkHelpInfo = null;
    }
  };

// ======== Method Re-initialization
var Yanfly = Yanfly || {};
Window_Base.prototype.standardFontSize = function() {
  if (JakeMSG.PKDHelpInMessages.Param.FontUse) return JakeMSG.PKDHelpInMessages.Param.FontSize; // Only uses Help Message font when such a message is in use, otherwise uses normal font
     if (Yanfly.Core) return Yanfly.Param.FontSize;
     // This is in case you're using Yanfly Core Engine
  return 28; // This is the No-Plugin Default
};




// ================================ Adds: Right-Click to (temporarily) Pin the recently-opened Help Message 
// ======== Method Re-initialization
// ==== Using two variables, to track the Pin via Right-click in sequence, so that if it's clicked while no Message is shown yet, it won't just auto-pin the next one
JakeMSG.PKDHelpInMessages.clickPin = false;
JakeMSG.PKDHelpInMessages.pinned = false;



Window_Message.prototype._showHelpLinkInfo = function() {

    var e, info, infoData, underMouse;
    underMouse = this._tLinks.find(function(l) {
      return l.isMouseIn();
    });
    if (underMouse == null) {
      return;
    }
    info = underMouse != null ? underMouse.info : void 0;
    if (info == null) {
      return;
    }
    // ==== Adds the checks for the Previous Help Infos, so that you don't immediately get the small black window issue when switching immediately between Links  
    if (this.__lastLinkHelpInfo === info || this.__prev1LinkHelpInfo === info || this.__prev2LinkHelpInfo === info || this.__prev3LinkHelpInfo === info ) {
      return;
    }
    try {
      // ==== Pushes back the Help Info on the previous variables by 1
      this.__prev3LinkHelpInfo = this.__prev2LinkHelpInfo;
      this.__prev2LinkHelpInfo = this.__prev1LinkHelpInfo;
      this.__prev1LinkHelpInfo = this.__lastLinkHelpInfo;
      this.__lastLinkHelpInfo = info;
      // ==== Does not trigger the Hide on hovering over new Links when "Pinned" is on
      if (JakeMSG.PKDHelpInMessages.pinned) {
        JakeMSG.PKDHelpInMessages.pinned = false;
      } else {
        this._hideHelpLinksInfo();
      }
      infoData = PKD_HelpInMsg.getHelpMessage(info);
      if (infoData == null) {
        return;
      }
      // ==== "__helpLinkInfoWindow" becomes an array
      this.__helpLinkInfoWindow[++this._currentHelpLink] = new PKD_HelpInMsg.Window_EventHelpInfo(infoData);
      SceneManager._scene.addChild(this.__helpLinkInfoWindow[this._currentHelpLink]);
      this.__helpLinkInfoWindow[this._currentHelpLink].moveToCursor();
      return this.__helpLinkInfoWindow[this._currentHelpLink].open();
    } catch (error) {
      e = error;
      console.warn(e);
      return this._hideHelpLinksInfo();
    }
  };

// ======== Method Alias-ing
  JakeMSG_PKDHelpInMsg_Window_Message__startMessage = Window_Message.prototype.startMessage;
  Window_Message.prototype.startMessage = function() {
    // ==== Adds the initialization of the array-made "__helpLinkInfoWindow", and its index
    this._currentHelpLink = -1;
    this.__helpLinkInfoWindow = [];
    return JakeMSG_PKDHelpInMsg_Window_Message__startMessage.call(this);
  };

// ======== Method Alias-ing
  JakeMSG_PKDHelpInMsg_TouchInput_onRightButtonDown = TouchInput._onRightButtonDown;
  TouchInput._onRightButtonDown = function(event) {
    JakeMSG_PKDHelpInMsg_TouchInput_onRightButtonDown.call(this,event);
    // ==== Upon Right-Click, triggers clickPin
    JakeMSG.PKDHelpInMessages.clickPin = true;
  };

// ======== Method Alias-ing
JakeMSG_PKDHelpInMsg_Graphics_onKeyDown = Graphics._onKeyDown;
Graphics._onKeyDown = function(event) {
    var pinKeyCode = Number(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["Alt-key for Pinning Help Message"]);
    var clearKeyCode = Number(PluginManager.parameters("JakeMSG_PKDHelpInMessagesAdditions")["Clear Key for Help Messages"]);
    // ==== This adds the Alt-key to pin messages (helps for other windows, when Right-click would just cancel the window / open the menu)
    if (event.keyCode == pinKeyCode) JakeMSG.PKDHelpInMessages.clickPin = true;
    // ==== This adds the Clear key to clear all pinned help messages
    if (event.keyCode == clearKeyCode) {
        // Clear all help messages
        var scene = SceneManager._scene;
        if (scene) {
            var children = scene.children.slice(); // copy to avoid issues during removal
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child instanceof PKD_HelpInMsg.Window_EventHelpInfo) {
                    scene.removeChild(child);
                }
            }
        }
        // Reset pinning variables
        JakeMSG.PKDHelpInMessages.pinned = false;
        JakeMSG.PKDHelpInMessages.clickPin = false;
    }
    JakeMSG_PKDHelpInMsg_Graphics_onKeyDown.call(this,event);
};



// ======== Method Alias-ing
  JakeMSG_PKDHelpInMsg_Window_Message_terminateHelpLinks = Window_Message.prototype.terminateHelpLinks;
  Window_Message.prototype.terminateHelpLinks = function() {
    // ==== Makes sure "clickPin" and "pinned" are reset, and all active Help Messages are hidden, upon changing Window Messages
    JakeMSG.PKDHelpInMessages.clickPin = false;
    JakeMSG.PKDHelpInMessages.pinned = false;
    this._hideHelpLinksInfo();
    // ====
    JakeMSG_PKDHelpInMsg_Window_Message_terminateHelpLinks.call(this);
  };












// ================================================================ Adds: Help Links to ANY WINDOW (to Window_Base) (This includes THE HELP MESSAGE ITSELF (can Nest itself))


// ======== Method Alias-ing
  JakeMSG_PKDHelpInMsg_Window_Base__processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
  Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    JakeMSG_PKDHelpInMsg_Window_Base__processEscapeCharacter.call(this, code, textState);
    // ==== Adds the "_workWithLink" method to this method ("processEscapeCharacter"), similarly to how it's added to the same method of the "Window_Message" class 
    // ==== Skip for Window_Message since the original plugin handles it at line 1297
    if (code === PKD_HelpInMsg.LINK_SYMBOL && !(this instanceof Window_Message)){ this._workWithLink(textState);}
  };

  Window_Message.prototype._workWithLink = function(textState) {
    var value;
    value = this._obtainEscapeTextCodeX(textState);
    if (value !== "") {
      return this._startHelpLink(value, textState);
    } else {
      return this._stopHelpLink(textState);
    }
    
  };








// ================================ The Next 2 IICE sections are copied from the original plugin, but "Window_Message" replaced with "Window_Base"

(function() {
  var ALIAS__processEscapeCharacter, ALIAS__startMessage, ALIAS__terminateMessage, ALIAS__update, _;
  //@[DEFINES]
  _ = Window_Base.prototype;
  //@[ALIAS]
  // ======== This is the one instruction that was changed, from "startMessage" to this, since Window_Base does not have a "startMessage", but "creatContents" similarly happens at the start of a Window
  ALIAS__createContents = _.createContents;
  _.createContents = function() {
    this._tLinks = [];
    this._showLInfoTimer = 0;
    return ALIAS__createContents.call(this);
  };
  
  //@[ALIAS]
  ALIAS__processEscapeCharacter = _.processEscapeCharacter;
  _.processEscapeCharacter = function(code, textState) {
    ALIAS__processEscapeCharacter.call(this, ...arguments);
    if (code === PKD_HelpInMsg.LINK_SYMBOL) {
      //this._workWithLink(textState);
    }
  };
  //@[ALIAS]
  ALIAS__update = _.update;
  _.update = function() {
    ALIAS__update.call(this);
    if (this._tLinks == null) {
      return;
    }
    if (!$gameSystem.pkdIsHintsEnabled()) {
      return;
    }
    if (this._isAnyHelpLinkUnderCursor()) {
      this._showLInfoTimer += 1;
      if (this._showLInfoTimer >= PKD_HelpInMsg.TIME_TO_SHOW) {
        return this._showHelpLinkInfo();
      }
    } else {
      this._showLInfoTimer = 0;
      this._hideHelpLinksInfo();
    }
  };
  //@[ALIAS]


})();



(function() {
  var _;
  //@[DEFINES]
  _ = Window_Base.prototype;
  _.terminateHelpLinks = function() {
    var i, l, len, ref;
    if (this._tLinks == null) {
      return;
    }
    ref = this._tLinks;
    for (i = 0, len = ref.length; i < len; i++) {
      l = ref[i];
      l.removeFromParent();
    }
  };
  _._isAnyHelpLinkUnderCursor = function() {
    if (this._tLinks == null) {
      return false;
    }
    return this._tLinks.some(function(l) {
      return l.isMouseIn();
    });
  };
  _._showHelpLinkInfo = function() {
    var e, info, infoData, underMouse;
    underMouse = this._tLinks.find(function(l) {
      return l.isMouseIn();
    });
    if (underMouse == null) {
      return;
    }
    info = underMouse != null ? underMouse.info : void 0;
    if (info == null) {
      return;
    }
    if (this.__lastLinkHelpInfo === info) {
      return;
    }
    try {
      this.__lastLinkHelpInfo = info;
      this._hideHelpLinksInfo();
      infoData = PKD_HelpInMsg.getHelpMessage(info);
      if (infoData == null) {
        return;
      }
      this.__helpLinkInfoWindow = new PKD_HelpInMsg.Window_EventHelpInfo(infoData);
      SceneManager._scene.addChild(this.__helpLinkInfoWindow);
      this.__helpLinkInfoWindow.moveToCursor();
      return this.__helpLinkInfoWindow.open();
    } catch (error) {
      e = error;
      console.warn(e);
      return this._hideHelpLinksInfo();
    }
  };
  _._hideHelpLinksInfo = function() {
    if (this.__helpLinkInfoWindow == null) {
      return;
    }
    this.__helpLinkInfoWindow.close();
    this.__helpLinkInfoWindow.removeFromParent();
    this.__helpLinkInfoWindow = null;
    return this.__lastLinkHelpInfo = null;
  };
  _._workWithLink = function(textState) {
    var value;
    value = this._obtainEscapeTextCodeX(textState);
    if (value !== "") {
      return this._startHelpLink(value, textState);
    } else {
      return this._stopHelpLink(textState);
    }
  };
  _._startHelpLink = function(value, textState) {
    if (this.__tLink != null) {
      return;
    }
    this.__tLink = {};
    this.__tLink.startX = textState.x;
    this.__tLink.y = textState.y;
    this.__tLink.endX = 0;
    this.__tLink.StartIndex = textState.index;
    this.__tLink.value = value;
    // * Предзагрузка картинки
    PKD_HelpInMsg.prepareHelpMessageSkin(value);
  };
  _._stopHelpLink = function(textState) {
    if (this.__tLink == null) {
      return;
    }
    this.__tLink.endX = textState.x;
    this.__tLink.EndIndex = textState.index;
    this._createTLinkHoverZone();
    return this.__tLink = null;
  };
  _._createTLinkHoverZone = function() {
    var h, spr, w;
    w = this.__tLink.endX - this.__tLink.startX;
    h = this.lineHeight();
    spr = new PKD_HelpInMsg.Sprite_HoverLinkZone(w, h, this.__tLink.value);
    //spr.bitmap.fillAll KDCore.Color.RED
    spr.move(this.__tLink.startX + 14, this.__tLink.y + 16);
    this.addChild(spr);
    return this._tLinks.push(spr);
  };
  //?[NEW]
  _._obtainEscapeTextCodeX = function(textState) {
    var arr;
    arr = /^\[(\w+)\]/.exec(textState.text.slice(textState.index));
    if (arr != null) {
      textState.index += arr[0].length;
      return arr[1];
    } else {
      return '';
    }
  };
})();








// ================================ The Next sections is the code that I already used in this plugin, but with "Window_Message" replaced with "Window_Base"

// ================ Also adds the Pin by Right-Click ("__helpLinkInfoWindow" becomes an array)
// ======== Method Re-initialization
Window_Base.prototype._hideHelpLinksInfo = function() {
    JakeMSG.PKDHelpInMessages.Param.FontUse = false; // This stops the usage of the Temporary Font
    if (JakeMSG.PKDHelpInMessages.clickPin){
      // ==== If Hide is triggered while clickPin is true, it's turned to false and "pinned" is turned true
      JakeMSG.PKDHelpInMessages.clickPin = false;
      JakeMSG.PKDHelpInMessages.pinned = true;
    }
    // ==== If "pinned" is false, will Hide, otherwise it will not
    if (!JakeMSG.PKDHelpInMessages.pinned){
      // ==== "__helpLinkInfoWindow" becomes an array
      if (this.__helpLinkInfoWindow[this._currentHelpLink] == null) {
        return;
      }
      for(var i = this._currentHelpLink; i > -1; i--){
        if (this.__helpLinkInfoWindow[i]){
          this.__helpLinkInfoWindow[i].close();
          this.__helpLinkInfoWindow[i].removeFromParent();
        }
      }
      this._currentHelpLink = -1;
      this.__helpLinkInfoWindow = [];
      // ==== Resets this previous Help Info variables
      this.__prev3LinkHelpInfo = null;
      this.__prev2LinkHelpInfo = null;
      this.__prev1LinkHelpInfo = null;
      return this.__lastLinkHelpInfo = null;
    }
  };




// ================================ Adds: Right-Click to (temporarily) Pin the recently-opened Help Message 
// ======== Method Re-initialization
// ==== Using two variables, to track the Pin via Right-click in sequence, so that if it's clicked while no Message is shown yet, it won't just auto-pin the next one
Window_Base.prototype._showHelpLinkInfo = function() {

    var e, info, infoData, underMouse;
    underMouse = this._tLinks.find(function(l) {
      return l.isMouseIn();
    });
    if (underMouse == null) {
      return;
    }
    info = underMouse != null ? underMouse.info : void 0;
    if (info == null) {
      return;
    }
    // ==== Adds the checks for the Previous Help Infos, so that you don't immediately get the small black window issue when switching immediately between Links  
    if (this.__lastLinkHelpInfo === info || this.__prev1LinkHelpInfo === info || this.__prev2LinkHelpInfo === info || this.__prev3LinkHelpInfo === info ) {
      return;
    }
    try {
      // ==== Pushes back the Help Info on the previous variables by 1
      this.__prev3LinkHelpInfo = this.__prev2LinkHelpInfo;
      this.__prev2LinkHelpInfo = this.__prev1LinkHelpInfo;
      this.__prev1LinkHelpInfo = this.__lastLinkHelpInfo;
      this.__lastLinkHelpInfo = info;
      // ==== Does not trigger the Hide on hovering over new Links when "Pinned" is on
      if (JakeMSG.PKDHelpInMessages.pinned) {
        JakeMSG.PKDHelpInMessages.pinned = false;
      } else {
        this._hideHelpLinksInfo();
      }
      infoData = PKD_HelpInMsg.getHelpMessage(info);
      if (infoData == null) {
        return;
      }
      // ==== "__helpLinkInfoWindow" becomes an array
      this.__helpLinkInfoWindow[++this._currentHelpLink] = new PKD_HelpInMsg.Window_EventHelpInfo(infoData);
      SceneManager._scene.addChild(this.__helpLinkInfoWindow[this._currentHelpLink]);
      this.__helpLinkInfoWindow[this._currentHelpLink].moveToCursor();
      return this.__helpLinkInfoWindow[this._currentHelpLink].open();
    } catch (error) {
      e = error;
      console.warn(e);
      return this._hideHelpLinksInfo();
    }
  };

// ======== Method Alias-ing
  JakeMSG_PKDHelpInMsg_Window_Base__createContents = Window_Base.prototype.createContents;
  Window_Base.prototype.createContents = function() {
    // ==== Adds the initialization of the array-made "__helpLinkInfoWindow", and its index
    this._currentHelpLink = -1;
    this.__helpLinkInfoWindow = [];
    return JakeMSG_PKDHelpInMsg_Window_Base__createContents.call(this);
  };


// ======== Method Alias-ing
  JakeMSG_PKDHelpInMsg_Window_Base_terminateHelpLinks = Window_Base.prototype.terminateHelpLinks;
  Window_Base.prototype.terminateHelpLinks = function() {
    // ==== Makes sure "clickPin" and "pinned" are reset, and all active Help Messages are hidden, upon changing Window Messages
    JakeMSG.PKDHelpInMessages.clickPin = false;
    JakeMSG.PKDHelpInMessages.pinned = false;
    this._hideHelpLinksInfo();
    // ====
    JakeMSG_PKDHelpInMsg_Window_Base_terminateHelpLinks.call(this);
  };







  
//=============================================================================
// ======== PATCHING ORIGINAL PLUGIN'S FUNCTIONS VIA "STRINGIFY" TEMP. CONVERSION!
//=============================================================================

// ======== Patch PKD_HelpInMessages Window_Message.prototype.update at runtime
// ==== This removes early return statements while preserving alias chains from other plugins
(function() {
  // Wait for next frame to ensure PKD has fully loaded
  var originalUpdate = Window_Message.prototype.update;
  var patchAttempts = 0;
  var maxAttempts = 100;
  
  function applyPatch() {
    try {
      var updateFuncString = Window_Message.prototype.update.toString();
      
      // Check if this is actually PKD's version (contains the help link logic)
      if (!updateFuncString.includes('_tLinks')) {
        // Not yet loaded or not PKD, try again next frame
        if (patchAttempts < maxAttempts) {
          patchAttempts++;
          setTimeout(applyPatch, 0);
        }
        return;
      }
      
      // Remove early return statements:
      // "return this._showHelpLinkInfo();" -> "this._showHelpLinkInfo();"
      updateFuncString = updateFuncString.replace(
        /return\s+this\._showHelpLinkInfo\(\);?/g,
        'this._showHelpLinkInfo();'
      );
      
      // "return this._hideHelpLinksInfo();" -> "this._hideHelpLinksInfo();"
      updateFuncString = updateFuncString.replace(
        /return\s+this\._hideHelpLinksInfo\(\);?/g,
        'this._hideHelpLinksInfo();'
      );
      
      // Only apply the patch if changes were made
      if (updateFuncString !== Window_Message.prototype.update.toString()) {
        // Create a new function from the modified source
        // ==== First, re-declare the initial Closure Variables that were used outside of the "update" function, in PKD's IIFE
        // == (since "ALIAS__update" is used inside the "update" function defined by PKD in his IIFE, but that variable is defined outside of said function)
        _ = Window_Message.prototype;
        ALIAS__update = _.update;
        // ==== Now, we proceed with creating the new function from the modified string
        var modifiedUpdate = eval('(' + updateFuncString + ')');
        // Replace the method (preserves the alias chain from other plugins)
        Window_Message.prototype.update = modifiedUpdate;
      }
    } catch (e) {
      // If something fails, log it but don't break
      console.error('JakeMSG addon: Failed to patch PKD update:', e);
    }
  }
  
  // Apply patch on next frame to ensure PKD is fully loaded
  setTimeout(applyPatch, 0);
})();

//=============================================================================
// End of File
//=============================================================================
};