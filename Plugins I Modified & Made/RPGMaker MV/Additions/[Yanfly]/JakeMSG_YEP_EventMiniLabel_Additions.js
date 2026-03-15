//=============================================================================
// Addition to YEP plugin "Event Mini Label", made by JakeMSG
// JakeMSG_YEP_EventMiniLabel_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_EventMiniLabel_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.EML_JakeMSGAdd = Yanfly.EML_JakeMSGAdd || {};
Yanfly.EML_JakeMSGAdd.version = 1.2;

//=============================================================================
 /*:
 * @plugindesc v1.2 (Requires YEP_EventMiniLabel.js) Additions to YEP Event Mini Label.
 * @author JakeMSG
 *
============ Change Log ============
1.2 - 3.15th.2026
 * Added <Mini Label Angle: x> to rotate mini labels by x degrees.
 * Default angle is 0 when not set.
1.1 - 3.15th.2026
 * Added multiline support for Event Mini Labels:
 *   - Supports <br> and \n in <Mini Label: ...>.
 *   - Added <Multi-Line Mini Label> ... </Multi-Line Mini Label> tags.
1.0 - 3.15th.2026
 * initial release
====================================
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_EventMiniLabel.
 * Make sure this plugin is located under YEP_EventMiniLabel in the plugin list.
 * 
 * 
 * ============================================================================
 * New Features
 * ============================================================================
 *
 * ================================
 * Support for Line breaks
 * ================================
 *   <Mini Label: text>
 *   - Now supports <br> and \n for line breaks.
 *
 * ================================
 * New (Comment) Notetags
 * ================================
 * ============ Multi-Line Mini Label
 *   <Multi-Line Mini Label>
 *   line 1
 *   line 2
 *   </Multi-Line Mini Label>
 *   - Works exactly like <Mini Label: text>, but allows for multiple lines of text
 *   - Reads all lines in between as the mini label text.
 *   - Can be split between multiple consecutive Comments
 *   - Also supports <br> and \n inside those lines.
 *
 * ============ Mini Label Angle 
 *   <Mini Label Angle: x>
 *   - Rotates the mini label by x degrees.
 *   - Supports positive and negative values.
 *   - If omitted, angle defaults to 0.
 * 
 */
//=============================================================================

if (Imported.YEP_EventMiniLabel) {

//=============================================================================
// Utilities
//=============================================================================

Yanfly.EML_JakeMSGAdd.convertMiniLabelLineBreaks = function(text) {
    if (text === undefined || text === null) return '';
    text = String(text);
    text = text.replace(/\\n/g, '\n');
    text = text.replace(/<br\s*\/?\s*>/gi, '\n');
    return text;
};

Yanfly.Util = Yanfly.Util || {};

if (!Yanfly.Util.toGroup) {
    Yanfly.Util.toGroup = function(inVal) {
        return inVal;
    };
}

//=============================================================================
// Window_EventMiniLabel
//=============================================================================

Window_EventMiniLabel.prototype.extractNotedata = function(comment) {
    if (comment === '') return;
    var tag1 = /<(?:MINI WINDOW|MINI LABEL):[ ](.*)>/i;
    var tag2 = /<(?:MINI WINDOW FONT SIZE|MINI LABEL FONT SIZE):[ ](\d+)>/i;
    var tag3 = /<(?:MINI WINDOW Y BUFFER|MINI LABEL Y BUFFER):[ ]([\+\-]\d+)>/i;
    var tag4 = /<(?:ALWAYS SHOW MINI WINDOW|ALWAYS SHOW MINI LABEL)>/i;
    var tag5 = /<(?:MINI WINDOW RANGE|MINI LABEL RANGE):[ ](\d+)>/i;
    var tag6 = /<(?:MINI WINDOW X BUFFER|MINI LABEL X BUFFER):[ ]([\+\-]\d+)>/i;
    var tag7 = /<(?:MINI WINDOW REQUIRE FACING|MINI LABEL REQUIRE FACING)>/i;
    var tag8 = /<(?:MULTI\-LINE MINI WINDOW|MULTI\-LINE MINI LABEL|ML MINI WINDOW|ML MINI LABEL)>/i;
    var tag9 = /<\/(?:MULTI\-LINE MINI WINDOW|MULTI\-LINE MINI LABEL|ML MINI WINDOW|ML MINI LABEL)>/i;
    var tag10 = /<(?:MINI WINDOW ANGLE|MINI LABEL ANGLE|MINI WINDOW ROTATION|MINI LABEL ROTATION):[ ]([\+\-]?\d+(?:\.\d+)?)>/i;
    var notedata = comment.split(/\r?\n/);
    var text = '';
    var readMultiLineText = false;
    var multiLineText = [];
    this._angle = 0;

    for (var i = 0; i < notedata.length; ++i) {
        var line = notedata[i];
        if (readMultiLineText) {
            if (line.match(tag9)) {
                text = multiLineText.join('\n');
                readMultiLineText = false;
            } else {
                multiLineText.push(line);
            }
            continue;
        }

        if (line.match(tag8)) {
            readMultiLineText = true;
            multiLineText = [];
        } else if (line.match(tag1)) {
            text = String(RegExp.$1);
        } else if (line.match(tag2)) {
            this._fontSize = parseInt(RegExp.$1);
        } else if (line.match(tag3)) {
            this._bufferY = parseInt(RegExp.$1);
        } else if (line.match(tag4)) {
            this._alwaysShow = true;
        } else if (line.match(tag5)) {
            this._range = parseInt(RegExp.$1);
        } else if (line.match(tag6)) {
            this._bufferX = parseInt(RegExp.$1);
        } else if (line.match(tag7)) {
            this._reqFacing = true;
        } else if (line.match(tag10)) {
            this._angle = parseFloat(RegExp.$1);
        }
    }

    if (readMultiLineText) {
        text = multiLineText.join('\n');
    }

    text = Yanfly.EML_JakeMSGAdd.convertMiniLabelLineBreaks(text);
    this.setText(text);
    if (this._text === '' || !$gameSystem.isShowEventMiniLabel()) {
        this.visible = false;
        this.contentsOpacity = 0;
    } else {
        this.visible = true;
        if (this._reqFacing) {
            this.contentsOpacity = 0;
        } else {
            this.contentsOpacity = 255;
        }
    }
};

Window_EventMiniLabel.prototype.miniLabelAngle = function() {
    if (this._angle === undefined) return 0;
    return this._angle;
};

Window_EventMiniLabel.prototype.miniLabelLines = function() {
    var text = this._text || '';
    var lines = text.split('\n');
    if (lines.length <= 0) lines = [''];
    return lines;
};

Window_EventMiniLabel.prototype.miniLabelLineHeight = function(line) {
    if (line === '') return this.lineHeight();
    var textState = {
        index: 0,
        x: 0,
        y: 0,
        left: 0,
        text: this.convertEscapeCharacters(line)
    };
    return this.calcTextHeight(textState, false);
};

Window_EventMiniLabel.prototype.miniLabelMaxLineWidth = function(lines) {
    var maxWidth = 0;
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];
        var width = (line === '') ? 0 : this.textWidthEx(line);
        if (width > maxWidth) maxWidth = width;
    }
    return maxWidth;
};

Window_EventMiniLabel.prototype.miniLabelTotalTextHeight = function(lines) {
    var height = 0;
    for (var i = 0; i < lines.length; ++i) {
        height += this.miniLabelLineHeight(lines[i]);
    }
    return Math.max(height, this.lineHeight());
};

Window_EventMiniLabel.prototype.refresh = function() {
    if (Imported.YEP_SelfSwVar) {
        $gameTemp.setSelfSwVarEvent(this._character._mapId, this._character._eventId);
    }
    this.contents.clear();
    var lines = this.miniLabelLines();
    var txWidth = this.miniLabelMaxLineWidth(lines);
    txWidth += this.textPadding() * 2;
    var width = txWidth;
    this.width = Math.max(width, Yanfly.Param.EMWMinWidth);
    this.width += this.standardPadding() * 2;
    var textHeight = this.miniLabelTotalTextHeight(lines);
    this.height = textHeight + this.standardPadding() * 2;
    this.createContents();
    var wx = (this.contents.width - txWidth) / 2 + this.textPadding();
    var wy = 0;
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];
        if (line !== '') {
            this.drawTextEx(line, wx, wy);
        }
        wy += this.miniLabelLineHeight(line);
    }
    if (Imported.YEP_SelfSwVar) $gameTemp.clearSelfSwVarEvent();
};

//=============================================================================
// Sprite_Character
//=============================================================================

Yanfly.EML_JakeMSGAdd.Sprite_Character_positionMiniLabel =
    Sprite_Character.prototype.positionMiniLabel;
Sprite_Character.prototype.positionMiniLabel = function() {
    Yanfly.EML_JakeMSGAdd.Sprite_Character_positionMiniLabel.call(this);
    if (!this._miniLabel) return;
    var degrees = this._miniLabel.miniLabelAngle();
    this._miniLabel.rotation = degrees * Math.PI / 180;
};

//=============================================================================
// End of File
//=============================================================================

}
