//=============================================================================
// Addition to YEP plugin "BuffsStates Core", made by JakeMSG
// JakeMSG_YEP_X_VisualHpGauge_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_X_VisualHpGauge_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.VHG_JakeMSGAdd = Yanfly.VHG_JakeMSGAdd || {};
Yanfly.VHG_JakeMSGAdd.version = 1.0;

//=============================================================================
/*:
 * @plugindesc v1.0 (Requires YEP_X_VisualHpGauge.js) Add MP gauge mirroring Visual HP Gauge settings
 * @author JakeMSG
 * v1.0
 * 
============ Change Log ============
1.0 - 3.16th.2026
 * Added MP gauge that mirrors HP gauge settings and visuals
====================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_X_VisualHpGauge.
 * Make sure this plugin is located under YEP_X_VisualHpGauge in the plugin list.
 * 
 * Fixes the Max display (for both the original plugin and this one), that 
 * would not show depending on the size wrappings
 *
 * Adds an MP gauge that follows the same visibility rules as the HP gauge
 * (Display Actor / Defeat First / Always Visible), with its own appearance
 * and text display parameters grouped under "Visual MP gauge". When both HP
 * and MP gauges are drawn to the same side (both above or both below), the
 * "Below the HP gauge" parameter chooses whether MP is stacked above or below.
 * MP defaults: Color1=22, Color2=23.
 * 
 * Also adds a parameter to set the font size of the text in the gauges (labels and values).
 * 
 * 
 * 
 * 
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @param Gauge Text Font Size
 * @type number
 * @min 1
 * @default 20
 * @desc Font size used for HP/MP gauge text (labels and values) in this window.
 *
 * @param ---Visual MP gauge---
 * @default
 *
 * @param ---MP Appearance---
 * @parent ---Visual MP gauge---
 * @default
 *
 * @param Minimum MP Gauge Width
 * @parent ---MP Appearance---
 * @type number
 * @min 1
 * @default 144
 * @desc Minimum width in pixels for MP gauges.
 *
 * @param MP Gauge Height
 * @parent ---MP Appearance---
 * @type number
 * @min 1
 * @default 18
 * @desc Height in pixels for MP gauges.
 *
 * @param MP Back Color
 * @parent ---MP Appearance---
 * @type number
 * @default 19
 * @desc Text color index used for MP gauge background.
 *
 * @param MP Color 1
 * @parent ---MP Appearance---
 * @type number
 * @min 0
 * @max 31
 * @default 22
 * @desc Text color index for MP gauge gradient color 1.
 *
 * @param MP Color 2
 * @parent ---MP Appearance---
 * @type number
 * @min 0
 * @max 31
 * @default 23
 * @desc Text color index for MP gauge gradient color 2.
 *
 * @param MP Gauge Duration
 * @parent ---MP Appearance---
 * @type number
 * @min 0
 * @default 30
 * @desc Frames the MP gauge remains visible after change.
 *
 * @param MP Gauge Position
 * @parent ---MP Appearance---
 * @type boolean
 * @on Above
 * @off Below
 * @default false
 * @desc Show MP gauge above (true) or below (false) the battler.
 *
 * @param MP Y Buffer
 * @parent ---MP Appearance---
 * @type number
 * @min -9999
 * @max 9999
 * @default -16
 * @desc Y offset applied to MP gauge positioning.
 *
 * @param MP Use Thick Gauges
 * @parent ---MP Appearance---
 * @type boolean
 * @on Thick
 * @off Normal
 * @default true
 * @desc Use thick gauge style for MP gauge when CoreEngine thick gauges are on.
 *
 * @param Below the HP gauge
 * @parent ---MP Appearance---
 * @type boolean
 * @on Below HP
 * @off Above HP
 * @default true
 * @desc When HP/MP share the same side, place MP below (true) or above (false) HP.
 *
 * @param ---MP Text Display---
 * @parent ---Visual MP gauge---
 * @default
 *
 * @param Show MP
 * @parent ---MP Text Display---
 * @type boolean
 * @on YES
 * @off NO
 * @default false
 * @desc Show the MP label on the gauge.
 *
 * @param Show MP Value
 * @parent ---MP Text Display---
 * @type boolean
 * @on YES
 * @off NO
 * @default false
 * @desc Show the MP value on the gauge.
 *
 * @param Show MP Max
 * @parent ---MP Text Display---
 * @type boolean
 * @on YES
 * @off NO
 * @default false
 * @desc Show the MP max value (if value shown).
 */
//=============================================================================

if (Imported.YEP_X_VisualHpGauge) {
//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('JakeMSG_YEP_X_VisualHpGauge_Additions');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.VHGTextFontSize = Number(Yanfly.Parameters['Gauge Text Font Size'] || 20);

// Visual MP Gauge > Appearance
Yanfly.Param.VMGMinMpWidth   = Number(Yanfly.Parameters['Minimum MP Gauge Width'] || 144);
Yanfly.Param.VMGGaugeHeight  = Number(Yanfly.Parameters['MP Gauge Height'] || 18);
Yanfly.Param.VMGBackColor    = Number(Yanfly.Parameters['MP Back Color'] || 19);
Yanfly.Param.VMGMpColor1     = Number(Yanfly.Parameters['MP Color 1'] || 22);
Yanfly.Param.VMGMpColor2     = Number(Yanfly.Parameters['MP Color 2'] || 23);
Yanfly.Param.VMGDuration     = Number(Yanfly.Parameters['MP Gauge Duration'] || 30);
Yanfly.Param.VMGGaugePos     = eval(String(Yanfly.Parameters['MP Gauge Position'] || 'false'));
Yanfly.Param.VMGBufferY      = Number(Yanfly.Parameters['MP Y Buffer'] || -16);
Yanfly.Param.VMGThick        = eval(String(Yanfly.Parameters['MP Use Thick Gauges'] || 'true'));
Yanfly.Param.VMGBelowHp      = eval(String(Yanfly.Parameters['Below the HP gauge'] || 'true'));

// Visual MP Gauge > Text Display
Yanfly.Param.VMGShowMP       = eval(String(Yanfly.Parameters['Show MP'] || 'false'));
Yanfly.Param.VMGShowValue    = eval(String(Yanfly.Parameters['Show MP Value'] || 'false'));
Yanfly.Param.VMGShowMax      = eval(String(Yanfly.Parameters['Show MP Max'] || 'false'));

//=============================================================================
// DataManager
//=============================================================================


//=============================================================================
// Game_Battler
//=============================================================================

Game_Battler.prototype.mpGaugeVisible = function() {
    // mirror hp gauge visibility rules (Display Actor / Defeat First / Always Visible handled in base window logic)
    if (this.isHidden()) return false;
    return this.hpGaugeVisible ? this.hpGaugeVisible() : true;
};

Game_Battler.prototype.mpGaugeWidth = function() {
    var width = Math.max(this.spriteWidth(), Yanfly.Param.VMGMinMpWidth);
    return (width & 1) ? width + 1 : width;
};

Game_Battler.prototype.mpGaugeHeight = function() {
    return Yanfly.Param.VMGGaugeHeight;
};

Game_Battler.prototype.mpGaugeBackColor = function() {
    return Yanfly.Param.VMGBackColor;
};

Game_Battler.prototype.mpGaugeColor1 = function() {
    return Yanfly.Param.VMGMpColor1;
};

Game_Battler.prototype.mpGaugeColor2 = function() {
    return Yanfly.Param.VMGMpColor2;
};

//=============================================================================
// Window_VisualHPGauge
//=============================================================================

JakeMSG_VHG_Add_Window_VisualHPGauge_initialize = Window_VisualHPGauge.prototype.initialize;
Window_VisualHPGauge.prototype.initialize = function() {
    JakeMSG_VHG_Add_Window_VisualHPGauge_initialize.call(this);
    this._currentMpValue = 0;
    this._displayedMpValue = 0;
    this._mpDropSpeed = 0;
};

JakeMSG_VHG_Add_Window_VisualHPGauge_setBattler = Window_VisualHPGauge.prototype.setBattler;
Window_VisualHPGauge.prototype.setBattler = function(battler) {
    JakeMSG_VHG_Add_Window_VisualHPGauge_setBattler.call(this, battler);
    this._currentMpValue = this._battler ? this._battler.mp : 0;
    this._displayedMpValue = this._battler ? this._battler.mp : 0;
};

JakeMSG_VHG_Add_Window_VisualHPGauge_updateWindowSize = Window_VisualHPGauge.prototype.updateWindowSize;
Window_VisualHPGauge.prototype.updateWindowSize = function() {
    var mpEnabled = this.mpGaugeVisible();
    var gaugeCount = mpEnabled ? 2 : 1;
    var spriteWidth = Math.max(this._battler ? this._battler.hpGaugeWidth() : 0, mpEnabled && this._battler ? this._battler.mpGaugeWidth() : 0);
    var width = spriteWidth + this.standardPadding() * 2;
    width = Math.min(width, Graphics.boxWidth + this.standardPadding() * 2);
    var hpH = this._battler ? this._battler.hpGaugeHeight() : this.gaugeHeight();
    var mpH = mpEnabled && this._battler ? this._battler.mpGaugeHeight() : 0;
    var maxGaugeH = mpEnabled ? Math.max(hpH, mpH) : hpH;
    var height = Math.max(this.lineHeight() * gaugeCount, maxGaugeH * gaugeCount + 4);
    height += this.standardPadding() * 2;
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.createContents();
    this._requestRefresh = true;
    this.makeWindowBoundaries();
};

JakeMSG_VHG_Add_Window_VisualHPGauge_updateHpPosition = Window_VisualHPGauge.prototype.updateHpPosition;
Window_VisualHPGauge.prototype.updateHpPosition = function() {
    if (!this._battler) return;
    JakeMSG_VHG_Add_Window_VisualHPGauge_updateHpPosition.call(this);
    // keep visible when MP changes too
};

Window_VisualHPGauge.prototype.updateMpPosition = function() {
    if (!this._battler) return;
    if (this._currentMpValue !== this._battler.mp) {
        this._visibleCounter = Math.max(this._visibleCounter, Yanfly.Param.VMGDuration);
        this._currentMpValue = this._battler.mp;
        var difference = Math.abs(this._displayedMpValue - this._battler.mp);
        this._mpDropSpeed = Math.ceil(difference / Math.max(1, Yanfly.Param.VMGDuration));
        this._requestRefresh = true;
    }
    if (this._displayedMpValue === this._currentMpValue) return;
    var d = this._mpDropSpeed;
    var c = this._currentMpValue;
    if (this._displayedMpValue > this._currentMpValue) {
        this._displayedMpValue = Math.max(this._displayedMpValue - d, c);
    } else if (this._displayedMpValue < this._currentMpValue) {
        this._displayedMpValue = Math.min(this._displayedMpValue + d, c);
    }
    this._requestRefresh = true;
};

JakeMSG_VHG_Add_Window_VisualHPGauge_updateWindowAspects = Window_VisualHPGauge.prototype.updateWindowAspects;
Window_VisualHPGauge.prototype.updateWindowAspects = function() {
    JakeMSG_VHG_Add_Window_VisualHPGauge_updateWindowAspects.call(this);
    this.updateMpPosition();
};

JakeMSG_VHG_Add_Window_VisualHPGauge_updateWindowPosition = Window_VisualHPGauge.prototype.updateWindowPosition;
Window_VisualHPGauge.prototype.updateWindowPosition = function() {
    if (!this._battler) return;
    var battler = this._battler;
    var hpAbove = Yanfly.Param.VHGGaugePos;
    var mpAbove = Yanfly.Param.VMGGaugePos;
    var anchorAbove = hpAbove || mpAbove;
    var buffer = 0;
    if (anchorAbove) {
        if (hpAbove && mpAbove) {
            buffer = Math.min(Yanfly.Param.VHGBufferY, Yanfly.Param.VMGBufferY);
        } else if (hpAbove) {
            buffer = Yanfly.Param.VHGBufferY;
        } else {
            buffer = Yanfly.Param.VMGBufferY;
        }
    } else {
        // both below
        buffer = Math.max(Yanfly.Param.VHGBufferY, Yanfly.Param.VMGBufferY);
    }

    this.x = battler.spritePosX();
    this.x -= Math.ceil(this.width / 2);
    this.x = this.x.clamp(this._minX, this._maxX);

    this.y = battler.spritePosY();
    if (anchorAbove) {
      this.y -= battler.spriteHeight();
    } else {
      this.y -= this.standardPadding();
    }
    this.y = this.y.clamp(this._minY, this._maxY);
    this.y += buffer;
};

JakeMSG_VHG_Add_Window_VisualHPGauge_isShowWindow = Window_VisualHPGauge.prototype.isShowWindow;
Window_VisualHPGauge.prototype.isShowWindow = function() {
    var baseVisible = JakeMSG_VHG_Add_Window_VisualHPGauge_isShowWindow.call(this);
    if (baseVisible) return true;
    // also keep visible while MP value is animating
    if (this._currentMpValue !== this._displayedMpValue) return true;
    return false;
};

Window_VisualHPGauge.prototype.mpGaugeVisible = function() {
    if (!this._battler) return false;
    if (!this._battler.mpGaugeVisible()) return false;
    return true;
};

Window_VisualHPGauge.prototype.refresh = function() {
    this.contents.clear();
    if (!this._battler) return;
    this._requestRefresh = false;

    var mpEnabled = this.mpGaugeVisible();
    var lineH = this.lineHeight();
    var pad = this.textPadding();
    var prevFontSize = this.contents.fontSize;
    this.contents.fontSize = Yanfly.Param.VHGTextFontSize;
    var order = this.mpGaugeDrawOrder();
    for (var i = 0; i < order.length; i++) {
        var entry = order[i];
        if (entry === 'hp') {
            this.drawActorHp(this._battler, pad, pad + lineH * i, this.contents.width - pad * 2);
        } else if (entry === 'mp' && mpEnabled) {
            this.drawJakeMSGActorMp(this._battler, pad, pad + lineH * i, this.contents.width - pad * 2);
        }
    }
    this.contents.fontSize = prevFontSize;
};

Window_VisualHPGauge.prototype.mpGaugeDrawOrder = function() {
    var mpAbove = Yanfly.Param.VMGGaugePos;
    var hpAbove = Yanfly.Param.VHGGaugePos;
    var samePos = (mpAbove === hpAbove);
    if (!this.mpGaugeVisible()) return ['hp'];
    if (!samePos) {
        return mpAbove ? ['mp', 'hp'] : ['hp', 'mp'];
    }
    // same position: decide stacking by Below HP flag
    if (Yanfly.Param.VMGBelowHp) {
        return hpAbove ? ['hp', 'mp'] : ['hp', 'mp']; // below hp means hp then mp
    } else {
        return hpAbove ? ['mp', 'hp'] : ['mp', 'hp'];
    }
};

Window_VisualHPGauge.prototype.drawJakeMSGActorMp = function(actor, x, y, width) {
    width = width || 186;
    var rate = actor.mmp > 0 ? this._displayedMpValue / actor.mmp : 0;
    var backColor = this.textColor(actor.mpGaugeBackColor());
    var color1 = this.textColor(actor.mpGaugeColor1());
    var color2 = this.textColor(actor.mpGaugeColor2());
    var useThick = !!Yanfly.Param.VMGThick;
    var canUseBase = (useThick === !!Yanfly.Param.VHGThick);
    if (canUseBase) {
        var drawGaugeFn = this.drawGauge;
        var oldBack = this.gaugeBackColor;
        var oldHeight = this.gaugeHeight;
        this.gaugeBackColor = function() { return backColor; };
        this.gaugeHeight = function() { return actor.mpGaugeHeight(); };
        drawGaugeFn.call(this, x, y, width, rate, color1, color2);
        this.gaugeBackColor = oldBack;
        this.gaugeHeight = oldHeight;
    } else {
        this.jakeMSGDrawSimpleGauge(x, y, width, rate, backColor, color1, color2, actor.mpGaugeHeight());
    }

    if (Yanfly.Param.VMGShowMP) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.mpA, x, y, 44);
    }
    if (Yanfly.Param.VMGShowValue) {
        var val = this._displayedMpValue;
        var max = actor.mmp;
        var w = width;
        var color = this.mpColor(actor);
        var labelWidth = Yanfly.Param.VMGShowMP ? this.textWidth(TextManager.mpA) : 0;
        this.drawJakeMSGCurrentAndMax(val, max, x, y, w, color, this.normalColor(), {
            showMax: Yanfly.Param.VMGShowMax,
            labelWidth: labelWidth,
            noMaxAlign: Yanfly.Param.VMGShowMP ? 'right' : 'center'
        });
    }
};

// use flexible width so max values always render when requested
Window_VisualHPGauge.prototype.drawCurrentAndMax = function(current, max, x, y, width, color1, color2) {
    var labelWidth = Yanfly.Param.VHGShowHP ? this.textWidth(TextManager.hpA) : 0;
    this.drawJakeMSGCurrentAndMax(current, max, x, y, width, color1, color2, {
        showMax: Yanfly.Param.VHGShowMax,
        labelWidth: labelWidth,
        noMaxAlign: Yanfly.Param.VHGShowHP ? 'right' : 'center'
    });
};

Window_VisualHPGauge.prototype.drawJakeMSGCurrentAndMax = function(current, max, x, y, width, color1, color2, options) {
    options = options || {};
    var showMax = options.showMax !== undefined ? options.showMax : true;
    var labelWidth = options.labelWidth || 0;
    var alignNoMax = options.noMaxAlign || 'right';

    var curText = Yanfly.Util.toGroup(current);
    var maxText = Yanfly.Util.toGroup(max);

    if (!showMax) {
        this.changeTextColor(color1);
        this.drawText(curText, x, y, width, alignNoMax);
        return;
    }

    var curWidth = this.textWidth(curText);
    var slashWidth = this.textWidth('/');
    var maxWidth = this.textWidth(maxText);
    var totalWidth = curWidth + slashWidth + maxWidth;
    var minX = x + labelWidth;

    var curX = x + width - totalWidth;
    if (curX < minX) {
        curX = minX;
        var remaining = x + width - curX;
        if (remaining < totalWidth) {
            // fallback to compact string if space is extremely tight
            this.changeTextColor(color1);
            this.drawText(curText + '/' + maxText, x, y, width, 'right');
            return;
        }
    }

    var slashX = curX + curWidth;
    var maxX = slashX + slashWidth;

    this.changeTextColor(color1);
    this.drawText(curText, curX, y, curWidth, 'left');
    this.changeTextColor(color2);
    this.drawText('/', slashX, y, slashWidth, 'left');
    this.drawText(maxText, maxX, y, maxWidth, 'left');
};

Window_VisualHPGauge.prototype.jakeMSGDrawSimpleGauge = function(dx, dy, dw, rate, backColor, color1, color2, gaugeH) {
    var fillW = Math.floor(dw * rate).clamp(0, dw);
    var h = gaugeH || this.gaugeHeight();
    var gaugeY = dy + this.lineHeight() - h - 2;
    this.contents.fillRect(dx, gaugeY, dw, h, backColor);
    this.contents.gradientFillRect(dx, gaugeY, fillW, h, color1, color2);
};














//=============================================================================
// Utilities
//=============================================================================

Yanfly.Util = Yanfly.Util || {};

if (!Yanfly.Util.toGroup) {
    Yanfly.Util.toGroup = function(inVal) {
        return inVal;
    };
}

//=============================================================================
// End of File
//=============================================================================
}
