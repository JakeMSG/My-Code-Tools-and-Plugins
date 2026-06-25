//=============================================================================
// Addition to YEP plugin "Visual HP Gauge", made by JakeMSG
// JakeMSG_YEP_X_VisualHpGauge_Additions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_YEP_X_VisualHpGauge_Additions = true;

var Yanfly = Yanfly || {};
Yanfly.VHG_JakeMSGAdd = Yanfly.VHG_JakeMSGAdd || {};
Yanfly.VHG_JakeMSGAdd.version = 1.2;

//=============================================================================
/*:
 * @plugindesc v1.2 (Requires YEP_X_VisualHpGauge.js) Adds MP/TP gauges, shared ordering, and enemy override settings
 * @author JakeMSG
 * v1.2
 *
 * ============ Change Log ============
 * 1.2 - 6.25th.2026
 * Renamed "Bars order" to "Bars Shown & Order"
 * Bars omitted from that parameter now stay hidden by default
 * Enemy show-notetags can force omitted bars to appear
 * Forced missing bars use fallback order HP, MP, TP
 * Added global "Y Buffer" under All Bars Settings for whole shown bar group
 * Added plugin-side "HP Gauge Height" parameter wiring
 * "HP Gauge Height" now overwrites base plugin "Gauge Height" behavior
 *
 * 1.1 - 6.19th.2026
 * Added TP gauge support that mirrors MP gauge behavior and visuals
 * Added global bar positioning/order settings for HP/MP/TP
 * Added optional hide behavior for bars with max value 0
 * Added enemy notetag override block for plugin parameters
 * Gauge text font size now applies to TP text too
 * Added <Hide/Show MP Gauge> and <Hide/Show TP Gauge> notetags
 * Enemy override block now also supports HP settings from YEP_X_VisualHpGauge
 * 
 * 1.0 - 3.16th.2026
 * * Added MP gauge that mirrors HP gauge settings and visuals
 * ====================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_X_VisualHpGauge.
 * Make sure this plugin is located under YEP_X_VisualHpGauge in the plugin list.
 *
 * This plugin extends the original Visual HP Gauge with configurable MP and TP
 * enemy gauges, keeps text rendering readable when showing current/max values,
 * and applies one shared placement/order system across HP/MP/TP bars.
 *
 * ============================================================================
 * Plugin Parameters
 * ============================================================================
 * ==================================== MP/TP Gauges
 * ======== There are parameters for each, resembling those for HP gauge from the original plugin
 * 
 * ==================================== All Bars Settings
 * ======== "Bars positioning" controls whether all three bars are shown above or below
 *   the battler. This setting overrides YEP_X_VisualHpGauge's "Gauge Position".
 * ======== "Y Buffer" applies one shared Y offset to whole shown bar group.
 *   Positive moves down, negative moves up, for both Above and Below modes.
 * ======== "Bars Shown & Order" decides which bars are shown and their
 * top-to-bottom order inside the gauge window.
 *   Accepted tokens: HP, MP, TP.
 *   Split tokens with commas, spaces, or both.
 *   Example: "TP HP MP" or "MP, HP, TP".
 *   Any bar not listed here is hidden by default.
 *   Exception: if an enemy has a "Show <bar> Gauge" notetag, missing bars can
 *   still appear for that enemy, and missing forced bars use fallback order
 *   HP -> MP -> TP.
 * ======== "Don't show bars with a Max of 0" hides only the individual gauge(s) whose
 *   max stat is 0 (HP max 0 hides HP bar, MP max 0 hides MP bar, TP max 0 hides
 *   TP bar), while leaving other bars visible.
 * ======== "Gauge Text Font Size" applies to HP, MP, and TP gauge labels/values.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 * ==================================== Hide/Show Notetags
 * ========Class and Enemy notetags:
 * <Hide MP Gauge>
 * <Show MP Gauge>
 * <Hide TP Gauge>
 * <Show TP Gauge>
 * ==== These mirror YEP_X_VisualHpGauge's HP hide/show notetag behavior, but for
 * MP/TP gauges respectively.
 * ==================================== Enemy Notetag Overrides
 * ======== Place the following notetag block in an enemy's notebox:
 * <VisualGauge Override Settings>
 * Parameter Name: Value
 * Parameter Name: Value; Another Parameter: Value
 * </VisualGauge Override Settings>
 * ======== Multiple entries can be split by:
 * ==== New lines
 * ==== Semicolons (;)
 * ==== Or both
 * ======== "Parameter Name" can be any parameter from this plugin
 * (for example: Bars positioning, Bars Shown & Order, Show TP, TP Color 1, etc.)
 * ======== Parameters can also be HP parameters from YEP_X_VisualHpGauge
 * (for example: Minimum Gauge Width, Gauge Height, Back Color, HP Color 1,
 * HP Color 2, Gauge Duration, HP Y Buffer, Show HP, Show Value, Show Max).
 * ======== The enemy will then use those values instead of plugin defaults.
 *
 * 
 * 
 * 
 * ============================================================================
 * Param Declarations
 * ============================================================================
 *
 * @param ---All bars Settings---
 * @default
 *
 * @param Gauge Text Font Size
 * @parent ---All bars Settings---
 * @type number
 * @min 1
 * @default 20
 * @desc Font size used for HP/MP/TP gauge text (labels and values) in this window.
 *
 * @param Bars positioning
 * @parent ---All bars Settings---
 * @type select
 * @option Above
 * @option Below
 * @default Below
 * @desc Show all bars above or below battler. Overrides base plugin HP gauge position.
 *
 * @param Y Buffer
 * @parent ---All bars Settings---
 * @type number
 * @min -9999
 * @max 9999
 * @default -16
 * @desc Shared Y offset for whole shown bar group (works for both Above and Below).
 *
 * @param Bars Shown & Order
 * @parent ---All bars Settings---
 * @type text
 * @default HP, MP, TP
 * @desc Bars to show + top-to-bottom order. Include HP/MP/TP split by commas/spaces.
 *
 * @param Don't show bars with a Max of 0
 * @parent ---All bars Settings---
 * @type boolean
 * @on True
 * @off False
 * @default true
 * @desc If true, any bar with max value 0 is hidden.
 *
 * @param ---Visual HP gauge---
 * @default
 * 
 * @param ---HP Appearance---
 * @parent ---Visual HP gauge---
 * @default
 * 
 * @param HP Gauge Height
 * @parent ---HP Appearance---
 * @type number
 * @min 1
 * @default 18
 * @desc Height in pixels for HP gauges (overwrites YEP_X_VisualHpGauge's HP Gauge Height)
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
 * @default 9
 * @desc Text color index for MP gauge gradient color 1.
 *
 * @param MP Color 2
 * @parent ---MP Appearance---
 * @type number
 * @min 0
 * @max 31
 * @default 22
 * @desc Text color index for MP gauge gradient color 2.
 *
 * @param MP Gauge Duration
 * @parent ---MP Appearance---
 * @type number
 * @min 0
 * @default 30
 * @desc Frames the MP gauge remains visible after change.
 *
 * @param MP Y Buffer
 * @parent ---MP Appearance---
 * @type number
 * @min -9999
 * @max 9999
 * @default -16
 * @desc Y offset used by MP when computing shared bar positioning.
 *
 * @param MP Use Thick Gauges
 * @parent ---MP Appearance---
 * @type boolean
 * @on Thick
 * @off Normal
 * @default true
 * @desc Use thick gauge style for MP gauge when CoreEngine thick gauges are on.
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
 *
 * @param ---Visual TP gauge---
 * @default
 *
 * @param ---TP Appearance---
 * @parent ---Visual TP gauge---
 * @default
 *
 * @param Minimum TP Gauge Width
 * @parent ---TP Appearance---
 * @type number
 * @min 1
 * @default 144
 * @desc Minimum width in pixels for TP gauges.
 *
 * @param TP Gauge Height
 * @parent ---TP Appearance---
 * @type number
 * @min 1
 * @default 18
 * @desc Height in pixels for TP gauges.
 *
 * @param TP Back Color
 * @parent ---TP Appearance---
 * @type number
 * @default 19
 * @desc Text color index used for TP gauge background.
 *
 * @param TP Color 1
 * @parent ---TP Appearance---
 * @type number
 * @min 0
 * @max 31
 * @default 3
 * @desc Text color index for TP gauge gradient color 1.
 *
 * @param TP Color 2
 * @parent ---TP Appearance---
 * @type number
 * @min 0
 * @max 31
 * @default 11
 * @desc Text color index for TP gauge gradient color 2.
 *
 * @param TP Gauge Duration
 * @parent ---TP Appearance---
 * @type number
 * @min 0
 * @default 30
 * @desc Frames the TP gauge remains visible after change.
 *
 * @param TP Y Buffer
 * @parent ---TP Appearance---
 * @type number
 * @min -9999
 * @max 9999
 * @default -16
 * @desc Y offset used by TP when computing shared bar positioning.
 *
 * @param TP Use Thick Gauges
 * @parent ---TP Appearance---
 * @type boolean
 * @on Thick
 * @off Normal
 * @default true
 * @desc Use thick gauge style for TP gauge when CoreEngine thick gauges are on.
 *
 * @param ---TP Text Display---
 * @parent ---Visual TP gauge---
 * @default
 *
 * @param Show TP
 * @parent ---TP Text Display---
 * @type boolean
 * @on YES
 * @off NO
 * @default false
 * @desc Show the TP label on the gauge.
 *
 * @param Show TP Value
 * @parent ---TP Text Display---
 * @type boolean
 * @on YES
 * @off NO
 * @default false
 * @desc Show the TP value on the gauge.
 *
 * @param Show TP Max
 * @parent ---TP Text Display---
 * @type boolean
 * @on YES
 * @off NO
 * @default false
 * @desc Show the TP max value (if value shown).
 */
//=============================================================================

if (Imported.YEP_X_VisualHpGauge) {
//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('JakeMSG_YEP_X_VisualHpGauge_Additions');
Yanfly.Param = Yanfly.Param || {};

Yanfly.VHG_JakeMSGAdd.readBool = function(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    var text = String(value).trim().toLowerCase();
    if (['true', 'on', 'yes', '1'].contains(text)) return true;
    if (['false', 'off', 'no', '0'].contains(text)) return false;
    return fallback;
};

Yanfly.VHG_JakeMSGAdd.readBarsPosition = function(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    var text = String(value).trim().toLowerCase();
    if (text === 'above') return true;
    if (text === 'below') return false;
    return this.readBool(text, fallback);
};

Yanfly.VHG_JakeMSGAdd.normalizeParamName = function(name) {
    return String(name || '').replace(/\s+/g, ' ').trim().toUpperCase();
};

Yanfly.VHG_JakeMSGAdd.parseBarsOrder = function(value) {
    var tokens = String(value || '')
        .toUpperCase()
        .replace(/,/g, ' ')
        .split(/\s+/)
        .filter(function(token) {
            return !!token;
        });
    var order = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (['HP', 'MP', 'TP'].contains(token) && !order.contains(token)) {
            order.push(token);
        }
    }
    return order;
};

Yanfly.VHG_JakeMSGAdd.castOverrideValue = function(type, rawValue, fallback) {
    var value = String(rawValue || '').trim();
    if (type === 'number') {
        var num = Number(value);
        return isNaN(num) ? fallback : num;
    }
    if (type === 'bool') {
        return this.readBool(value, fallback);
    }
    if (type === 'barsPosition') {
        return this.readBarsPosition(value, fallback);
    }
    if (type === 'barsOrder') {
        return value || fallback;
    }
    return value || fallback;
};

Yanfly.Param.VHGTextFontSize = Number(Yanfly.Parameters['Gauge Text Font Size'] || 20);
Yanfly.Param.VMGAllBarsPosition = Yanfly.VHG_JakeMSGAdd.readBarsPosition(
    Yanfly.Parameters['Bars positioning'],
    false
);
Yanfly.Param.VMGAllBarsBufferY = Number(Yanfly.Parameters['Y Buffer'] || -16);
Yanfly.Param.VMGAllBarsOrder = String(
    Yanfly.Parameters['Bars Shown & Order'] ||
    Yanfly.Parameters['Bars order'] ||
    'HP, MP, TP'
);
Yanfly.Param.VMGHideZeroMax = Yanfly.VHG_JakeMSGAdd.readBool(
    Yanfly.Parameters["Don't show bars with a Max of 0"],
    true
);

// overwrite base plugin HP position setting with this plugin's all-bar setting
Yanfly.Param.VHGGaugePos = Yanfly.Param.VMGAllBarsPosition;
Yanfly.Param.VHGBufferY = Yanfly.Param.VMGAllBarsBufferY;
Yanfly.Param.VHGGaugeHeight = Number(
    Yanfly.Parameters['HP Gauge Height'] ||
    Yanfly.Param.VHGGaugeHeight ||
    18
);

// Visual MP Gauge > Appearance
Yanfly.Param.VMGMinMpWidth = Number(Yanfly.Parameters['Minimum MP Gauge Width'] || 144);
Yanfly.Param.VMGGaugeHeight = Number(Yanfly.Parameters['MP Gauge Height'] || 18);
Yanfly.Param.VMGBackColor = Number(Yanfly.Parameters['MP Back Color'] || 19);
Yanfly.Param.VMGMpColor1 = Number(Yanfly.Parameters['MP Color 1'] || 22);
Yanfly.Param.VMGMpColor2 = Number(Yanfly.Parameters['MP Color 2'] || 23);
Yanfly.Param.VMGDuration = Number(Yanfly.Parameters['MP Gauge Duration'] || 30);
Yanfly.Param.VMGBufferY = Number(Yanfly.Parameters['MP Y Buffer'] || -16);
Yanfly.Param.VMGThick = Yanfly.VHG_JakeMSGAdd.readBool(
    Yanfly.Parameters['MP Use Thick Gauges'],
    true
);

// Visual MP Gauge > Text Display
Yanfly.Param.VMGShowMP = Yanfly.VHG_JakeMSGAdd.readBool(Yanfly.Parameters['Show MP'], false);
Yanfly.Param.VMGShowValue = Yanfly.VHG_JakeMSGAdd.readBool(
    Yanfly.Parameters['Show MP Value'],
    false
);
Yanfly.Param.VMGShowMax = Yanfly.VHG_JakeMSGAdd.readBool(
    Yanfly.Parameters['Show MP Max'],
    false
);

// Visual TP Gauge > Appearance
Yanfly.Param.VMTMinTpWidth = Number(Yanfly.Parameters['Minimum TP Gauge Width'] || 144);
Yanfly.Param.VMTGaugeHeight = Number(Yanfly.Parameters['TP Gauge Height'] || 18);
Yanfly.Param.VMTBackColor = Number(Yanfly.Parameters['TP Back Color'] || 19);
Yanfly.Param.VMTTpColor1 = Number(Yanfly.Parameters['TP Color 1'] || 28);
Yanfly.Param.VMTTpColor2 = Number(Yanfly.Parameters['TP Color 2'] || 29);
Yanfly.Param.VMTDuration = Number(Yanfly.Parameters['TP Gauge Duration'] || 30);
Yanfly.Param.VMTBufferY = Number(Yanfly.Parameters['TP Y Buffer'] || -16);
Yanfly.Param.VMTThick = Yanfly.VHG_JakeMSGAdd.readBool(
    Yanfly.Parameters['TP Use Thick Gauges'],
    true
);

// Visual TP Gauge > Text Display
Yanfly.Param.VMTShowTP = Yanfly.VHG_JakeMSGAdd.readBool(Yanfly.Parameters['Show TP'], false);
Yanfly.Param.VMTShowValue = Yanfly.VHG_JakeMSGAdd.readBool(
    Yanfly.Parameters['Show TP Value'],
    false
);
Yanfly.Param.VMTShowMax = Yanfly.VHG_JakeMSGAdd.readBool(
    Yanfly.Parameters['Show TP Max'],
    false
);

Yanfly.VHG_JakeMSGAdd.OverrideParamInfo = {};
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo = function(paramName, key, type) {
    var normalized = this.normalizeParamName(paramName);
    this.OverrideParamInfo[normalized] = { key: key, type: type };
};

Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Gauge Text Font Size', 'VHGTextFontSize', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Bars positioning', 'VMGAllBarsPosition', 'barsPosition');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Y Buffer', 'VMGAllBarsBufferY', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Bars Shown & Order', 'VMGAllBarsOrder', 'barsOrder');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Bars order', 'VMGAllBarsOrder', 'barsOrder');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo("Don't show bars with a Max of 0", 'VMGHideZeroMax', 'bool');

Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Always Visible', 'VHGAlwaysShow', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Minimum Gauge Width', 'VHGMinHpWidth', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Gauge Height', 'VHGGaugeHeight', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('HP Gauge Height', 'VHGGaugeHeight', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Back Color', 'VHGBackColor', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('HP Color 1', 'VHGHpColor1', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('HP Color 2', 'VHGHpColor2', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Gauge Duration', 'VHGGaugeDuration', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Gauge Position', 'VMGAllBarsPosition', 'barsPosition');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('HP Y Buffer', 'VHGBufferY', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Use Thick Gauges', 'VHGThick', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show HP', 'VHGShowHP', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show Value', 'VHGShowValue', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show Max', 'VHGShowMax', 'bool');

Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Minimum MP Gauge Width', 'VMGMinMpWidth', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('MP Gauge Height', 'VMGGaugeHeight', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('MP Back Color', 'VMGBackColor', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('MP Color 1', 'VMGMpColor1', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('MP Color 2', 'VMGMpColor2', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('MP Gauge Duration', 'VMGDuration', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('MP Y Buffer', 'VMGBufferY', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('MP Use Thick Gauges', 'VMGThick', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show MP', 'VMGShowMP', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show MP Value', 'VMGShowValue', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show MP Max', 'VMGShowMax', 'bool');

Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Minimum TP Gauge Width', 'VMTMinTpWidth', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('TP Gauge Height', 'VMTGaugeHeight', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('TP Back Color', 'VMTBackColor', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('TP Color 1', 'VMTTpColor1', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('TP Color 2', 'VMTTpColor2', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('TP Gauge Duration', 'VMTDuration', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('TP Y Buffer', 'VMTBufferY', 'number');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('TP Use Thick Gauges', 'VMTThick', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show TP', 'VMTShowTP', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show TP Value', 'VMTShowValue', 'bool');
Yanfly.VHG_JakeMSGAdd.addOverrideParamInfo('Show TP Max', 'VMTShowMax', 'bool');

//=============================================================================
// DataManager
//=============================================================================

Yanfly.VHG_JakeMSGAdd.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!Yanfly.VHG_JakeMSGAdd.DataManager_isDatabaseLoaded.call(this)) return false;
    if (!Yanfly._loaded_JakeMSG_YEP_X_VisualHpGauge_Additions) {
        this.processJakeMSGGaugeVisibilityNotetags($dataClasses);
        this.processJakeMSGGaugeVisibilityNotetags($dataEnemies);
        this.processJakeMSGVisualGaugeOverrideNotetags($dataEnemies);
        Yanfly._loaded_JakeMSG_YEP_X_VisualHpGauge_Additions = true;
    }
    return true;
};

DataManager.processJakeMSGGaugeVisibilityNotetags = function(group) {
    for (var n = 1; n < group.length; n++) {
        var obj = group[n];
        if (!obj) continue;
        var notedata = obj.note ? obj.note.split(/[\r\n]+/) : [];
        obj.hideMpGauge = false;
        obj.showMpGauge = false;
        obj.hideTpGauge = false;
        obj.showTpGauge = false;
        for (var i = 0; i < notedata.length; i++) {
            var line = notedata[i];
            if (line.match(/<(?:HIDE MP GAUGE)>/i)) {
                obj.hideMpGauge = true;
            } else if (line.match(/<(?:SHOW MP GAUGE)>/i)) {
                obj.showMpGauge = true;
            } else if (line.match(/<(?:HIDE TP GAUGE)>/i)) {
                obj.hideTpGauge = true;
            } else if (line.match(/<(?:SHOW TP GAUGE)>/i)) {
                obj.showTpGauge = true;
            }
        }
    }
};

DataManager.processJakeMSGVisualGaugeOverrideNotetags = function(group) {
    for (var n = 1; n < group.length; n++) {
        var obj = group[n];
        if (!obj) continue;
        obj.jakeMSGVisualGaugeOverrides = {};
        var notedata = obj.note ? obj.note.split(/[\r\n]+/) : [];
        var evalMode = false;
        var blockLines = [];
        for (var i = 0; i < notedata.length; i++) {
            var line = notedata[i];
            if (line.match(/<(?:VISUALGAUGE OVERRIDE SETTINGS)>/i)) {
                evalMode = true;
                blockLines = [];
                continue;
            }
            if (line.match(/<\/(?:VISUALGAUGE OVERRIDE SETTINGS)>/i)) {
                evalMode = false;
                this.applyJakeMSGVisualGaugeOverrideBlock(obj, blockLines.join('\n'));
                blockLines = [];
                continue;
            }
            if (evalMode) blockLines.push(line);
        }
        if (evalMode && blockLines.length > 0) {
            this.applyJakeMSGVisualGaugeOverrideBlock(obj, blockLines.join('\n'));
        }
    }
};

DataManager.applyJakeMSGVisualGaugeOverrideBlock = function(obj, blockText) {
    var entries = String(blockText || '').split(/[\r\n;]+/);
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i].trim();
        if (!entry) continue;
        var match = entry.match(/^([^:]+):\s*(.+)$/);
        if (!match) continue;
        var paramName = match[1].trim();
        var rawValue = match[2].trim();
        this.applyJakeMSGVisualGaugeOverrideValue(obj, paramName, rawValue);
    }
};

DataManager.applyJakeMSGVisualGaugeOverrideValue = function(obj, paramName, rawValue) {
    var normalized = Yanfly.VHG_JakeMSGAdd.normalizeParamName(paramName);
    var info = Yanfly.VHG_JakeMSGAdd.OverrideParamInfo[normalized];
    if (!info) return;
    var fallback = Yanfly.Param[info.key];
    var parsed = Yanfly.VHG_JakeMSGAdd.castOverrideValue(info.type, rawValue, fallback);
    obj.jakeMSGVisualGaugeOverrides[info.key] = parsed;
};

//=============================================================================
// Game_Battler
//=============================================================================

Game_Battler.prototype.jakeMSGVisualGaugeParam = function(key) {
    return Yanfly.Param[key];
};

Game_Battler.prototype.jakeMSGVisualGaugeOverride = function(key) {
    return undefined;
};

Game_Enemy.prototype.jakeMSGVisualGaugeParam = function(key) {
    var enemyData = this.enemy ? this.enemy() : null;
    var overrides = enemyData && enemyData.jakeMSGVisualGaugeOverrides;
    if (overrides && overrides.hasOwnProperty(key)) {
        return overrides[key];
    }
    return Game_Battler.prototype.jakeMSGVisualGaugeParam.call(this, key);
};

Game_Enemy.prototype.jakeMSGVisualGaugeOverride = function(key) {
    var enemyData = this.enemy ? this.enemy() : null;
    var overrides = enemyData && enemyData.jakeMSGVisualGaugeOverrides;
    if (overrides && overrides.hasOwnProperty(key)) return overrides[key];
    return undefined;
};

Game_Battler.prototype.mpGaugeVisible = function() {
    if (this.isHidden()) return false;
    return this.hpGaugeVisible ? this.hpGaugeVisible() : true;
};

Game_Battler.prototype.mpGaugeWidth = function() {
    var minWidth = Number(this.jakeMSGVisualGaugeParam('VMGMinMpWidth') || 0);
    var width = Math.max(this.spriteWidth(), minWidth);
    return (width & 1) ? width + 1 : width;
};

Game_Battler.prototype.mpGaugeHeight = function() {
    return Number(this.jakeMSGVisualGaugeParam('VMGGaugeHeight') || 0);
};

Game_Battler.prototype.mpGaugeBackColor = function() {
    return Number(this.jakeMSGVisualGaugeParam('VMGBackColor') || 0);
};

Game_Battler.prototype.mpGaugeColor1 = function() {
    return Number(this.jakeMSGVisualGaugeParam('VMGMpColor1') || 0);
};

Game_Battler.prototype.mpGaugeColor2 = function() {
    return Number(this.jakeMSGVisualGaugeParam('VMGMpColor2') || 0);
};

Game_Battler.prototype.tpGaugeVisible = function() {
    if (this.isHidden()) return false;
    return this.hpGaugeVisible ? this.hpGaugeVisible() : true;
};

Game_Battler.prototype.tpGaugeWidth = function() {
    var minWidth = Number(this.jakeMSGVisualGaugeParam('VMTMinTpWidth') || 0);
    var width = Math.max(this.spriteWidth(), minWidth);
    return (width & 1) ? width + 1 : width;
};

Game_Battler.prototype.tpGaugeHeight = function() {
    return Number(this.jakeMSGVisualGaugeParam('VMTGaugeHeight') || 0);
};

Game_Battler.prototype.tpGaugeBackColor = function() {
    return Number(this.jakeMSGVisualGaugeParam('VMTBackColor') || 0);
};

Game_Battler.prototype.tpGaugeColor1 = function() {
    return Number(this.jakeMSGVisualGaugeParam('VMTTpColor1') || 0);
};

Game_Battler.prototype.tpGaugeColor2 = function() {
    return Number(this.jakeMSGVisualGaugeParam('VMTTpColor2') || 0);
};

Game_Actor.prototype.mpGaugeVisible = function() {
    if (this.isHidden()) return false;
    if (this.currentClass().showMpGauge) return true;
    if (this.currentClass().hideMpGauge) return false;
    return Game_Battler.prototype.mpGaugeVisible.call(this);
};

Game_Actor.prototype.tpGaugeVisible = function() {
    if (this.isHidden()) return false;
    if (this.currentClass().showTpGauge) return true;
    if (this.currentClass().hideTpGauge) return false;
    return Game_Battler.prototype.tpGaugeVisible.call(this);
};

Game_Enemy.prototype.mpGaugeVisible = function() {
    if (this.isHidden()) return false;
    if (this.enemy().hideMpGauge) return false;
    if (BattleManager.isBattleTest()) return true;
    if (this.enemy().showMpGauge) return true;
    if (!$gameSystem.showHpGaugeEnemy(this._enemyId)) return false;
    return Game_Battler.prototype.mpGaugeVisible.call(this);
};

Game_Enemy.prototype.tpGaugeVisible = function() {
    if (this.isHidden()) return false;
    if (this.enemy().hideTpGauge) return false;
    if (BattleManager.isBattleTest()) return true;
    if (this.enemy().showTpGauge) return true;
    if (!$gameSystem.showHpGaugeEnemy(this._enemyId)) return false;
    return Game_Battler.prototype.tpGaugeVisible.call(this);
};

Game_Enemy.prototype.hpGaugeWidth = function() {
    if (this.enemy().hpGaugeWidth > 0) {
        var width = this.enemy().hpGaugeWidth;
    } else {
        var width = this.spriteWidth();
    }
    width = Math.max(width, Number(this.jakeMSGVisualGaugeParam('VHGMinHpWidth') || 0));
    return (width & 1) ? width + 1 : width;
};

var JakeMSG_VHG_Add_Game_Enemy_hpGaugeHeight = Game_Enemy.prototype.hpGaugeHeight;
Game_Enemy.prototype.hpGaugeHeight = function() {
    var override = this.jakeMSGVisualGaugeOverride('VHGGaugeHeight');
    if (override !== undefined) return Number(override || 0);
    return JakeMSG_VHG_Add_Game_Enemy_hpGaugeHeight.call(this);
};

var JakeMSG_VHG_Add_Game_Enemy_hpGaugeBackColor = Game_Enemy.prototype.hpGaugeBackColor;
Game_Enemy.prototype.hpGaugeBackColor = function() {
    var override = this.jakeMSGVisualGaugeOverride('VHGBackColor');
    if (override !== undefined) return Number(override || 0);
    return JakeMSG_VHG_Add_Game_Enemy_hpGaugeBackColor.call(this);
};

var JakeMSG_VHG_Add_Game_Enemy_hpGaugeColor1 = Game_Enemy.prototype.hpGaugeColor1;
Game_Enemy.prototype.hpGaugeColor1 = function() {
    var override = this.jakeMSGVisualGaugeOverride('VHGHpColor1');
    if (override !== undefined) return Number(override || 0);
    return JakeMSG_VHG_Add_Game_Enemy_hpGaugeColor1.call(this);
};

var JakeMSG_VHG_Add_Game_Enemy_hpGaugeColor2 = Game_Enemy.prototype.hpGaugeColor2;
Game_Enemy.prototype.hpGaugeColor2 = function() {
    var override = this.jakeMSGVisualGaugeOverride('VHGHpColor2');
    if (override !== undefined) return Number(override || 0);
    return JakeMSG_VHG_Add_Game_Enemy_hpGaugeColor2.call(this);
};

//=============================================================================
// Window_VisualHPGauge
//=============================================================================

var JakeMSG_VHG_Add_Window_VisualHPGauge_initialize = Window_VisualHPGauge.prototype.initialize;
Window_VisualHPGauge.prototype.initialize = function() {
    JakeMSG_VHG_Add_Window_VisualHPGauge_initialize.call(this);
    this._currentMpValue = 0;
    this._displayedMpValue = 0;
    this._mpDropSpeed = 0;
    this._currentTpValue = 0;
    this._displayedTpValue = 0;
    this._tpDropSpeed = 0;
};

var JakeMSG_VHG_Add_Window_VisualHPGauge_setBattler = Window_VisualHPGauge.prototype.setBattler;
Window_VisualHPGauge.prototype.setBattler = function(battler) {
    JakeMSG_VHG_Add_Window_VisualHPGauge_setBattler.call(this, battler);
    this._currentMpValue = this._battler ? this._battler.mp : 0;
    this._displayedMpValue = this._battler ? this._battler.mp : 0;
    this._currentTpValue = this._battler ? this._battler.tp : 0;
    this._displayedTpValue = this._battler ? this._battler.tp : 0;
};

Window_VisualHPGauge.prototype.jakeMSGGaugeParam = function(key) {
    if (this._battler && this._battler.jakeMSGVisualGaugeParam) {
        return this._battler.jakeMSGVisualGaugeParam(key);
    }
    return Yanfly.Param[key];
};

Window_VisualHPGauge.prototype.jakeMSGHideZeroMaxBars = function() {
    return !!this.jakeMSGGaugeParam('VMGHideZeroMax');
};

Window_VisualHPGauge.prototype.hpGaugeVisible = function() {
    if (!this._battler) return false;
    if (!this._battler.hpGaugeVisible()) return false;
    if (this.jakeMSGHideZeroMaxBars() && this._battler.mhp <= 0) return false;
    return true;
};

Window_VisualHPGauge.prototype.mpGaugeVisible = function() {
    if (!this._battler) return false;
    if (!this._battler.mpGaugeVisible()) return false;
    if (this.jakeMSGHideZeroMaxBars() && this._battler.mmp <= 0) return false;
    return true;
};

Window_VisualHPGauge.prototype.tpGaugeVisible = function() {
    if (!this._battler) return false;
    if (!this._battler.tpGaugeVisible()) return false;
    var tpMax = this._battler.maxTp ? this._battler.maxTp() : 0;
    if (this.jakeMSGHideZeroMaxBars() && tpMax <= 0) return false;
    return true;
};

Window_VisualHPGauge.prototype.jakeMSGBarVisible = function(entry) {
    if (entry === 'hp') return this.hpGaugeVisible();
    if (entry === 'mp') return this.mpGaugeVisible();
    if (entry === 'tp') return this.tpGaugeVisible();
    return false;
};

Window_VisualHPGauge.prototype.jakeMSGIsEnemyForceShowBar = function(entry) {
    if (!this._battler || !this._battler.isEnemy || !this._battler.isEnemy()) return false;
    var enemyData = this._battler.enemy ? this._battler.enemy() : null;
    if (!enemyData) return false;
    if (entry === 'hp') return !!enemyData.showHpGauge;
    if (entry === 'mp') return !!enemyData.showMpGauge;
    if (entry === 'tp') return !!enemyData.showTpGauge;
    return false;
};

Window_VisualHPGauge.prototype.jakeMSGVisibleBarsInOrder = function() {
    var rawOrder = this.jakeMSGGaugeParam('VMGAllBarsOrder');
    var tokenOrder = Yanfly.VHG_JakeMSGAdd.parseBarsOrder(rawOrder);
    var order = [];
    var seen = {};
    for (var i = 0; i < tokenOrder.length; i++) {
        var token = tokenOrder[i];
        var bar = token.toLowerCase();
        if (!['hp', 'mp', 'tp'].contains(bar)) continue;
        if (seen[bar]) continue;
        seen[bar] = true;
        order.push(bar);
    }

    // Missing bars are hidden by default, unless enemy show-notetag force-shows them.
    var fallbackOrder = ['hp', 'mp', 'tp'];
    for (var n = 0; n < fallbackOrder.length; n++) {
        var missingBar = fallbackOrder[n];
        if (seen[missingBar]) continue;
        if (!this.jakeMSGIsEnemyForceShowBar(missingBar)) continue;
        seen[missingBar] = true;
        order.push(missingBar);
    }

    var visibleOrder = [];
    for (var j = 0; j < order.length; j++) {
        if (this.jakeMSGBarVisible(order[j])) {
            visibleOrder.push(order[j]);
        }
    }
    return visibleOrder;
};

Window_VisualHPGauge.prototype.jakeMSGAnyGaugeVisible = function() {
    return this.jakeMSGVisibleBarsInOrder().length > 0;
};

Window_VisualHPGauge.prototype.jakeMSGGaugeWidthFor = function(entry) {
    if (!this._battler) return 0;
    var width = 0;
    if (entry === 'hp') {
        width = this._battler.hpGaugeWidth();
    } else if (entry === 'mp') {
        width = this._battler.mpGaugeWidth();
    } else if (entry === 'tp') {
        width = this._battler.tpGaugeWidth();
    }
    return Math.max(0, width);
};

Window_VisualHPGauge.prototype.jakeMSGGaugeHeightFor = function(entry) {
    if (!this._battler) return this.gaugeHeight();
    if (entry === 'hp') return this._battler.hpGaugeHeight();
    if (entry === 'mp') return this._battler.mpGaugeHeight();
    if (entry === 'tp') return this._battler.tpGaugeHeight();
    return this.gaugeHeight();
};

Window_VisualHPGauge.prototype.updateWindowSize = function() {
    if (!this._battler) return;
    var bars = this.jakeMSGVisibleBarsInOrder();
    var gaugeCount = Math.max(1, bars.length);
    var widths = [];
    for (var i = 0; i < bars.length; i++) {
        widths.push(this.jakeMSGGaugeWidthFor(bars[i]));
    }
    if (widths.length <= 0) widths.push(this._battler.hpGaugeWidth());
    var spriteWidth = Math.max.apply(null, widths);
    var width = spriteWidth + this.standardPadding() * 2;
    width = Math.min(width, Graphics.boxWidth + this.standardPadding() * 2);
    var heights = [];
    for (var j = 0; j < bars.length; j++) {
        heights.push(this.jakeMSGGaugeHeightFor(bars[j]));
    }
    if (heights.length <= 0) heights.push(this.gaugeHeight());
    var maxGaugeH = Math.max.apply(null, heights);
    var height = Math.max(this.lineHeight() * gaugeCount, maxGaugeH * gaugeCount + 4);
    height += this.standardPadding() * 2;
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.createContents();
    this._requestRefresh = true;
    this.makeWindowBoundaries();
};

Window_VisualHPGauge.prototype.updateHpPosition = function() {
    if (!this._battler) return;
    var durationRaw = Number(this.jakeMSGGaugeParam('VHGGaugeDuration') || 0);
    var duration = Math.max(1, durationRaw);
    if (this._currentHpValue !== this._battler.hp) {
        this._visibleCounter = Math.max(this._visibleCounter, durationRaw);
        this._currentHpValue = this._battler.hp;
        var difference = Math.abs(this._displayedValue - this._battler.hp);
        this._dropSpeed = Math.ceil(difference / duration);
    }
    this.updateDisplayCounter();
};

Window_VisualHPGauge.prototype.updateMpPosition = function() {
    if (!this._battler) return;
    var durationRaw = Number(this.jakeMSGGaugeParam('VMGDuration') || 0);
    var duration = Math.max(1, durationRaw);
    if (this._currentMpValue !== this._battler.mp) {
        this._visibleCounter = Math.max(this._visibleCounter, durationRaw);
        this._currentMpValue = this._battler.mp;
        var difference = Math.abs(this._displayedMpValue - this._battler.mp);
        this._mpDropSpeed = Math.ceil(difference / duration);
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

Window_VisualHPGauge.prototype.updateTpPosition = function() {
    if (!this._battler) return;
    var durationRaw = Number(this.jakeMSGGaugeParam('VMTDuration') || 0);
    var duration = Math.max(1, durationRaw);
    if (this._currentTpValue !== this._battler.tp) {
        this._visibleCounter = Math.max(this._visibleCounter, durationRaw);
        this._currentTpValue = this._battler.tp;
        var difference = Math.abs(this._displayedTpValue - this._battler.tp);
        this._tpDropSpeed = Math.ceil(difference / duration);
        this._requestRefresh = true;
    }
    if (this._displayedTpValue === this._currentTpValue) return;
    var d = this._tpDropSpeed;
    var c = this._currentTpValue;
    if (this._displayedTpValue > this._currentTpValue) {
        this._displayedTpValue = Math.max(this._displayedTpValue - d, c);
    } else if (this._displayedTpValue < this._currentTpValue) {
        this._displayedTpValue = Math.min(this._displayedTpValue + d, c);
    }
    this._requestRefresh = true;
};

var JakeMSG_VHG_Add_Window_VisualHPGauge_updateWindowAspects = Window_VisualHPGauge.prototype.updateWindowAspects;
Window_VisualHPGauge.prototype.updateWindowAspects = function() {
    JakeMSG_VHG_Add_Window_VisualHPGauge_updateWindowAspects.call(this);
    this.updateMpPosition();
    this.updateTpPosition();
};

Window_VisualHPGauge.prototype.updateWindowPosition = function() {
    if (!this._battler) return;
    var battler = this._battler;
    var anchorAbove = !!this.jakeMSGGaugeParam('VMGAllBarsPosition');
    var buffer = Number(this.jakeMSGGaugeParam('VMGAllBarsBufferY') || 0);

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

Window_VisualHPGauge.prototype.isShowWindow = function() {
    if (!this._battler.isAppeared()) return false;
    var bars = this.jakeMSGVisibleBarsInOrder();
    if (bars.length <= 0) return false;
    if (!!this.jakeMSGGaugeParam('VHGAlwaysShow') && !this._battler.isDead()) return true;
    if (bars.contains('hp') && this._currentHpValue !== this._displayedValue) return true;
    if (bars.contains('mp') && this._currentMpValue !== this._displayedMpValue) return true;
    if (bars.contains('tp') && this._currentTpValue !== this._displayedTpValue) return true;
    if (this._battler.isSelected()) return true;
    --this._visibleCounter;
    return this._visibleCounter > 0;
};

Window_VisualHPGauge.prototype.refresh = function() {
    this.contents.clear();
    if (!this._battler) return;
    this._requestRefresh = false;
    var bars = this.jakeMSGVisibleBarsInOrder();
    if (bars.length <= 0) return;
    var lineH = this.lineHeight();
    var pad = this.textPadding();
    var innerWidth = this.contents.width - pad * 2;
    var prevFontSize = this.contents.fontSize;
    this.contents.fontSize = Number(this.jakeMSGGaugeParam('VHGTextFontSize') || 20);
    for (var i = 0; i < bars.length; i++) {
        var entry = bars[i];
        var y = pad + lineH * i;
        var barWidth = this.jakeMSGGaugeWidthFor(entry);
        barWidth = Math.min(innerWidth, Math.max(1, barWidth));
        var x = pad + Math.max(0, Math.floor((innerWidth - barWidth) / 2));
        if (entry === 'hp') {
            this.drawActorHp(this._battler, x, y, barWidth);
        } else if (entry === 'mp') {
            this.drawJakeMSGActorMp(this._battler, x, y, barWidth);
        } else if (entry === 'tp') {
            this.drawJakeMSGActorTp(this._battler, x, y, barWidth);
        }
    }
    this.contents.fontSize = prevFontSize;
};

Window_VisualHPGauge.prototype.drawActorHp = function(actor, x, y, width) {
    width = width || 186;
    var color1 = this.hpGaugeColor1();
    var color2 = this.hpGaugeColor2();
    var rate = actor.mhp > 0 ? this._displayedValue / actor.mhp : 0;
    if (Imported.YEP_AbsorptionBarrier && actor.barrierPoints() > 0) {
        this.drawBarrierGauge(actor, x, y, width);
    } else {
        this.drawGauge(x, y, width, rate, color1, color2);
    }
    var showHp = !!this.jakeMSGGaugeParam('VHGShowHP');
    var showValue = !!this.jakeMSGGaugeParam('VHGShowValue');
    if (showHp) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.hpA, x, y, 44);
    }
    if (showValue) {
        var val = this._displayedValue;
        var max = actor.mhp;
        var w = width;
        var color = this.hpColor(actor);
        this.drawCurrentAndMax(val, max, x, y, w, color, this.normalColor());
    }
};

Window_VisualHPGauge.prototype.drawJakeMSGActorMp = function(actor, x, y, width) {
    width = width || 186;
    var maxMp = actor.mmp;
    var rate = maxMp > 0 ? this._displayedMpValue / maxMp : 0;
    var backColor = this.textColor(actor.mpGaugeBackColor());
    var color1 = this.textColor(actor.mpGaugeColor1());
    var color2 = this.textColor(actor.mpGaugeColor2());
    var useThick = !!this.jakeMSGGaugeParam('VMGThick');
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

    var showLabel = !!this.jakeMSGGaugeParam('VMGShowMP');
    var showValue = !!this.jakeMSGGaugeParam('VMGShowValue');
    var showMax = !!this.jakeMSGGaugeParam('VMGShowMax');
    if (showLabel) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.mpA, x, y, 44);
    }
    if (showValue) {
        var val = this._displayedMpValue;
        var max = maxMp;
        var w = width;
        var color = this.mpColor(actor);
        var labelWidth = showLabel ? this.textWidth(TextManager.mpA) : 0;
        this.drawJakeMSGCurrentAndMax(val, max, x, y, w, color, this.normalColor(), {
            showMax: showMax,
            labelWidth: labelWidth,
            noMaxAlign: showLabel ? 'right' : 'center'
        });
    }
};

Window_VisualHPGauge.prototype.drawJakeMSGActorTp = function(actor, x, y, width) {
    width = width || 186;
    var maxTp = actor.maxTp ? actor.maxTp() : 0;
    var rate = maxTp > 0 ? this._displayedTpValue / maxTp : 0;
    var backColor = this.textColor(actor.tpGaugeBackColor());
    var color1 = this.textColor(actor.tpGaugeColor1());
    var color2 = this.textColor(actor.tpGaugeColor2());
    var useThick = !!this.jakeMSGGaugeParam('VMTThick');
    var canUseBase = (useThick === !!Yanfly.Param.VHGThick);
    if (canUseBase) {
        var drawGaugeFn = this.drawGauge;
        var oldBack = this.gaugeBackColor;
        var oldHeight = this.gaugeHeight;
        this.gaugeBackColor = function() { return backColor; };
        this.gaugeHeight = function() { return actor.tpGaugeHeight(); };
        drawGaugeFn.call(this, x, y, width, rate, color1, color2);
        this.gaugeBackColor = oldBack;
        this.gaugeHeight = oldHeight;
    } else {
        this.jakeMSGDrawSimpleGauge(x, y, width, rate, backColor, color1, color2, actor.tpGaugeHeight());
    }

    var showLabel = !!this.jakeMSGGaugeParam('VMTShowTP');
    var showValue = !!this.jakeMSGGaugeParam('VMTShowValue');
    var showMax = !!this.jakeMSGGaugeParam('VMTShowMax');
    if (showLabel) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.tpA, x, y, 44);
    }
    if (showValue) {
        var val = this._displayedTpValue;
        var max = maxTp;
        var w = width;
        var color = this.tpColor(actor);
        var labelWidth = showLabel ? this.textWidth(TextManager.tpA) : 0;
        this.drawJakeMSGCurrentAndMax(val, max, x, y, w, color, this.normalColor(), {
            showMax: showMax,
            labelWidth: labelWidth,
            noMaxAlign: showLabel ? 'right' : 'center'
        });
    }
};

// use flexible width so max values always render when requested
Window_VisualHPGauge.prototype.drawCurrentAndMax = function(current, max, x, y, width, color1, color2) {
    var showHp = !!this.jakeMSGGaugeParam('VHGShowHP');
    var showMax = !!this.jakeMSGGaugeParam('VHGShowMax');
    var labelWidth = showHp ? this.textWidth(TextManager.hpA) : 0;
    this.drawJakeMSGCurrentAndMax(current, max, x, y, width, color1, color2, {
        showMax: showMax,
        labelWidth: labelWidth,
        noMaxAlign: showHp ? 'right' : 'center'
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
