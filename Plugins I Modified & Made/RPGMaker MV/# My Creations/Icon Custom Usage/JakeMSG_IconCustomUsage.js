//=============================================================================
// JakeMSG_IconCustomUsage
// JakeMSG_IconCustomUsage.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_IconCustomUsage = true;

var JakeMSG = JakeMSG || {};
JakeMSG.IconCustomUsage = JakeMSG.IconCustomUsage || {};

//=============================================================================
/*:
 * @plugindesc Adds extra IconSet files with continued IDs, plus Icon Override
 * notetags for Skills, Items, Weapons, Armors, and States.
 * @author JakeMSG
 * v1.0
 *
============ Change Log ============
1.0 - 08.25th.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 *
 * This plugin extends how Icons and IconSets are used by RPG Maker MV, since
 * by default, it could be cumbersome at times to handle just the one big
 * IconSet file (the plugin does not change the default uses, it simply adds
 * new ways to use Icons and IconSets).
 *
 * IconSet format (main file "IconSet.png", or "IconSet.webp" if
 * JakeMSG_WebpMP3AndSubfoldersInMVCommands is used and WebP is the main
 * picture format):
 *   - Each icon is a 32x32 pixel square
 *   - 16 icons per row, left to right
 *   - The file can extend downwards for as many rows as it has
 *   - IDs start at 0 and count row by row
 *     Row 1 = IDs 0-15, Row 2 = IDs 16-31, and so on
 *   - Empty cells in later rows still occupy IDs
 *
 * This plugin adds:
 *   1) Additional IconSet files whose IDs and X,Y positions continue after
 *      the main IconSet (as if they were appended below it)
 *   2) Notetags that override the database Icon of Skills, Items, Weapons,
 *      Armors, and States (static override and runtime JavaScript override)
 *
 * Place this plugin below JakeMSG_WebpMP3AndSubfoldersInMVCommands and
 * JakeMSG_SystemChangesDuringRuntime, and below the Yanfly / JakeMSG plugins
 * listed in Compatible Plugins.
 * 
 * This plugin pairs well with using my standalone program "Icon Manipulator for RPG Maker (IARM)":
 * https://mega.nz/folder/azR0nQQQ#NPRcD6Zr3zRRuOZTNYheeQ
 *
 *
 * ============================================================================
 * Plugin Parameters
 * ============================================================================
 *
 * Additional IconSets
 *   Type: list of strings. Default: empty.
 *   Each list entry is one extra IconSet file under img/system
 *   (www\img\system). You may give a file name, or a path + name using
 *   subfolders. Extensions (.png / .webp) are optional.
 *
 *   Examples:
 *     ExtraIcons
 *     ExtraIcons.png
 *     icons/SetB
 *     subfolder/MoreIcons.webp
 *
 *   Rules:
 *   - The main IconSet is still IconSet (possibly remapped by
 *     JakeMSG_SystemChangesDuringRuntime).
 *   - IDs of extra files start after EVERY row of the main file, including
 *     empty rows at the bottom.
 *   - Extra files are appended in list order, one after another.
 *   - X stays 0-15. Y keeps increasing as if all sheets were one tall file.
 *   - Empty rows inside an extra file also occupy IDs.
 *   - Missing / unloadable entries in the list are skipped.
 *   - Other plugins that use Icon IDs, or Icon X,Y positions, keep working
 *     with these extra IDs and rows (plugin parameters, functions, script
 *     calls, \I[n] / \i[n] text codes, and drawing code).
 *
 *   ID example:
 *     Main IconSet has 20 rows -> IDs 0-319
 *     First extra file has 2 rows -> IDs 320-351
 *     Second extra file starts at ID 352
 *
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * Usable in the notes of: Skills, Items, Weapons, Armors, States.
 *
 * These override the Icon set in the database for that entry. They change
 * the shown Icon everywhere that entry's iconIndex is read (menus, battle
 * status, popups, messages, NextTurn preview icons, and so on).
 *
 * -------- <Icon Override: ...> --------
 * Provides a static Icon override. If this notetag is used more than once
 * in the same entry, the last usage is the one used.
 *
 * Accepted values inside the tag (before ">"):
 *
 *   One number (Icon ID):
 *     <Icon Override: 16>
 *     <Icon Override: 320>
 *   - Must be a valid ID in the main IconSet plus Additional IconSets.
 *   - If the ID is invalid, the tag is ignored.
 *
 *   Two numbers with a comma (Icon X, Y). Any amount of spaces is allowed:
 *     <Icon Override: 0, 1>
 *     <Icon Override: 3,5>
 *     <Icon Override:  2  ,  20  >
 *   - X is the column (0-15). Y is the row (0 = first row of the main file).
 *   - Y can point into Additional IconSets, because rows continue downward.
 *   - If X,Y is invalid, the tag is ignored.
 *
 *   A quoted file name / path (single 32x32 picture under img/system):
 *     <Icon Override: "PoisonIcon">
 *     <Icon Override: 'icons/PoisonIcon.png'>
 *     <Icon Override: "folder/My Icon.webp">
 *   - .png, or .webp if JakeMSG_WebpMP3AndSubfoldersInMVCommands is used and
 *     set to use WebP (fallback still follows that plugin).
 *   - The file must exist and must be 32x32 pixels.
 *   - If the file is missing, unloadable, or not 32x32, the tag is ignored.
 *   - To create such a file, I recommend using my new Standalone Program
 *   "Icon Manipulator for RPG Maker (IARM)"
 *
 * -------- <Icon Custom Override> ... </Icon Custom Override> --------
 * Runs JavaScript each time this entry's Icon is supposed to be shown, so
 * the override can change at runtime. This notetag overrides
 * <Icon Override: ...>. If multiple pairs are used in the same entry, the
 * last pair is the one used.
 *
 * Write code on the lines between the paired tags.
 *
 * Helper used to set the override:
 *   iconOverride  Default: (unset, use database Icon or <Icon Override: ...> if set)
 *     Same value kinds as <Icon Override: ...>:
 *       iconOverride = 16;
 *       iconOverride = "3, 5";
 *       iconOverride = [3, 5];
 *       iconOverride = "PoisonIcon";
 *       iconOverride = null;
 *     null (the default) means no override: the database Icon is used.
 *     Invalid IDs, invalid X,Y, or invalid/missing files are ignored, and
 *     the database Icon is used.
 *
 * Also available to your conditions (when known):
 *   item     The database entry (skill / item / weapon / armor / state)
 *   data     Same as item
 *   user     The battler currently showing this icon, or null
 *   battler  Same as user
 *   a        Same as user
 *   s        $gameSwitches._data
 *   v        $gameVariables._data
 *
 * Example:
 *   <Icon Custom Override>
 *   iconOverride = 16;
 *   if (user && user.hpRate && user.hpRate() <= 0.25) {
 *     iconOverride = "DangerIcon";
 *   }
 *   if ($gameSwitches.value(12)) {
 *     iconOverride = [0, 21];
 *   }
 *   </Icon Custom Override>
 *
 * NextTurn (YEP_BuffsStatesCore + JakeMSG_YEP_BuffsStatesCore_Additions):
 *   State icon overrides apply to NextTurn preview states too. Those preview
 *   icons still use the lower NextTurn Icon Opacity when they are drawn.
 *
 *
 * ============================================================================
 * Script Calls
 * ============================================================================
 *
 * JakeMSG.IconCustomUsage.iconIndexToXY(iconIndex)
 *   Returns {x: column, y: row} for an Icon ID.
 *
 * JakeMSG.IconCustomUsage.xyToIconIndex(x, y)
 *   Returns the Icon ID for column x, row y.
 *
 * JakeMSG.IconCustomUsage.isValidIconIndex(iconIndex)
 *   True if this ID exists on the main IconSet plus Additional IconSets
 *   (single-icon override files that were already assigned an ID count too).
 *
 * JakeMSG.IconCustomUsage.isValidIconXY(x, y)
 *   True if that cell exists on the combined sheets.
 *
 * JakeMSG.IconCustomUsage.totalRows()
 *   Number of 32px rows in the combined main + additional sheets
 *   (does not include rows reserved only for single-icon override files).
 *
 * JakeMSG.IconCustomUsage.maxIconIndex()
 *   Highest valid ID currently available on the combined IconSet.
 *
 * JakeMSG.IconCustomUsage.originalIconIndex(item)
 *   The database Icon ID, ignoring override notetags.
 *
 *
 * ============================================================================
 * Compatible Plugins
 * ============================================================================
 *
 * Additional IconSets keep working with plugins that draw or store Icon IDs
 * (and X,Y positions), including:
 *   YEP_CoreEngine
 *   YEP_SkillCore
 *   YEP_BuffsStatesCore
 *   JakeMSG_YEP_BuffsStatesCore_Additions
 *   YEP_ClassChangeCore
 *   YEP_ItemCore
 *   YEP_EquipCore
 *   YEP_ShopMenuCore
 *   YEP_SaveCore
 *   YEP_X_MoreCurrencies
 *   YEP_EnhancedTP
 *   YEP_X_SkillCooldowns
 *   YEP_X_LimitedSkillUses
 *   YEP_InstantCast
 *   YEP_X_TurnOrderDisplay
 *   YEP_BattleStatusWindow
 *   JakeMSG_SRD_BattlePopupCustomizer_Additions
 *   JakeMSG_YEP_ElementCore_Additions
 *   YEP_X_InBattleStatus
 *   JakeMSG_YEP_X_InBattleStatus_Additions
 *   JakeMSG_SRD_TimedAttackAdditions
 *   JakeMSG_WebpMP3AndSubfoldersInMVCommands
 *   JakeMSG_SystemChangesDuringRuntime
 *
 * Icon Override notetags stay compatible with NextTurn preview states and
 * their lower icon opacity:
 *   YEP_BuffsStatesCore
 *   JakeMSG_YEP_BuffsStatesCore_Additions
 *   JakeMSG_SRD_BattlePopupCustomizer_Additions
 *
 *
 * ============================================================================
 * Module Plugins
 * ============================================================================
 *
 * None.
 *
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 *
 * Additional IconSets
 *   string list, default empty. Extra IconSet files under img/system.
 *
 * @param Additional IconSets
 * @type string[]
 * @desc Extra IconSet files under img/system. IDs and rows continue after the main IconSet, in list order.
 * @default []
 */
//=============================================================================

(function() {

'use strict';

var ICU = JakeMSG.IconCustomUsage;
ICU.version = 1.0;

var ICON_W = 32;
var ICON_H = 32;
var ICONS_PER_ROW = 16;

//=============================================================================
// Parameters
//=============================================================================

var parameters = PluginManager.parameters('JakeMSG_IconCustomUsage') || {};

ICU.parseStringList = function(raw) {
    if (Array.isArray(raw)) return raw.slice();
    var parsed;
    try {
        parsed = JSON.parse(raw || '[]');
    } catch (e) {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    var result = [];
    for (var i = 0; i < parsed.length; i++) {
        var entry = parsed[i];
        if (typeof entry === 'string') {
            try {
                var inner = JSON.parse(entry);
                entry = typeof inner === 'string' ? inner : entry;
            } catch (e2) {
            }
        }
        result.push(String(entry == null ? '' : entry));
    }
    return result;
};

ICU.normalizeSystemName = function(raw) {
    var name = String(raw == null ? '' : raw).trim().replace(/\\/g, '/');
    if (!name) return '';
    name = name.replace(/^["']|["']$/g, '');
    name = name.replace(/^\/+/, '');
    if (/^www\//i.test(name)) name = name.substring(4);
    name = name.replace(/^\/+/, '');
    if (/^img\/system\//i.test(name)) name = name.substring(11);
    name = name.replace(/^\/+/, '');
    name = name.replace(/\.(png|webp)$/i, '');
    return name;
};

ICU.isIconSetName = function(filename) {
    return ICU.normalizeSystemName(filename).toLowerCase() === 'iconset';
};

ICU.isFolderIconSet = function(folder, filename) {
    if (!filename) return false;
    var fold = String(folder || '').replace(/\\/g, '/').toLowerCase();
    if (fold.indexOf('img/system') < 0) return false;
    return ICU.isIconSetName(filename);
};

ICU.extraNames = [];
(function parseExtraNames() {
    var list = ICU.parseStringList(parameters['Additional IconSets']);
    var seen = {};
    for (var i = 0; i < list.length; i++) {
        var name = ICU.normalizeSystemName(list[i]);
        if (!name) continue;
        if (ICU.isIconSetName(name)) continue;
        var key = name.toLowerCase();
        if (seen[key]) continue;
        seen[key] = true;
        ICU.extraNames.push(name);
    }
})();

//=============================================================================
// File existence (WebP / NW.js / XHR)
//=============================================================================

ICU.primaryImageExt = function() {
    if (typeof JakeMSG_primaryImageExt === 'function') {
        return JakeMSG_primaryImageExt();
    }
    return '.png';
};

ICU.fallbackImageExt = function() {
    if (typeof JakeMSG_fallbackImageExt === 'function') {
        return JakeMSG_fallbackImageExt();
    }
    return '.webp';
};

ICU.onlyMainImageFormat = function() {
    return !!((typeof JakeMSG_onlyMainNoFallback !== 'undefined') &&
        JakeMSG_onlyMainNoFallback);
};

ICU.urlExists = function(url) {
    if (typeof JakeMSG_urlExists === 'function') {
        return !!JakeMSG_urlExists(url);
    }
    try {
        if (typeof require === 'function') {
            var fs = require('fs');
            var path = require('path');
            var clean = String(url || '').split('?')[0].split('#')[0];
            try {
                clean = decodeURIComponent(clean);
            } catch (e) {
            }
            if (clean.indexOf('file://') === 0) {
                clean = clean.replace(/^file:\/\//i, '');
            }
            if (/^\/[A-Za-z]:\//.test(clean)) clean = clean.substring(1);
            var fsPath = clean;
            if (!(/^[A-Za-z]:[\\/]/.test(clean) || clean.indexOf('/') === 0)) {
                var base = (typeof process !== 'undefined' && process.mainModule &&
                    process.mainModule.filename) ?
                    path.dirname(process.mainModule.filename) :
                    (typeof process !== 'undefined' && process.cwd ? process.cwd() : '');
                fsPath = path.join(base, clean.split('/').join(path.sep));
            }
            return fs.existsSync(fsPath);
        }
    } catch (e2) {
    }
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        return xhr.status === 200 || xhr.status === 0;
    } catch (e3) {
        return false;
    }
};

ICU.encodeSystemPath = function(name) {
    var encoded = encodeURIComponent(String(name || ''));
    return encoded.split('%2F').join('/');
};

ICU.systemAssetExists = function(name) {
    name = ICU.normalizeSystemName(name);
    if (!name) return false;
    var folder = 'img/system/';
    var encoded = ICU.encodeSystemPath(name);
    var primary = ICU.primaryImageExt();
    var fallback = ICU.fallbackImageExt();
    if (ICU.urlExists(folder + encoded + primary)) return true;
    if (!ICU.onlyMainImageFormat() && fallback && fallback !== primary) {
        if (ICU.urlExists(folder + encoded + fallback)) return true;
    }
    if (primary !== '.png' && ICU.urlExists(folder + encoded + '.png')) return true;
    if (primary !== '.webp' && ICU.urlExists(folder + encoded + '.webp')) return true;
    return false;
};

//=============================================================================
// Combined IconSet
//=============================================================================

ICU._passthrough = 0;
ICU._composites = {};
ICU._failedFiles = {};
ICU._uidSeed = 1;
ICU._contextStack = [];
ICU._started = false;

ICU.iconW = function() {
    return ICON_W;
};

ICU.iconH = function() {
    return ICON_H;
};

ICU.sheetRowsOf = function(bitmap) {
    if (!bitmap || !bitmap.isReady() || bitmap.isError()) return 0;
    return Math.max(0, Math.floor(Number(bitmap.height || 0) / ICON_H));
};

ICU.xyToIconIndex = function(x, y) {
    x = Number(x);
    y = Number(y);
    if (!isFinite(x) || !isFinite(y)) return -1;
    x = Math.floor(x);
    y = Math.floor(y);
    return y * ICONS_PER_ROW + x;
};

ICU.iconIndexToXY = function(iconIndex) {
    iconIndex = Number(iconIndex);
    if (!isFinite(iconIndex)) return {x: 0, y: 0};
    iconIndex = Math.floor(iconIndex);
    return {
        x: ((iconIndex % ICONS_PER_ROW) + ICONS_PER_ROW) % ICONS_PER_ROW,
        y: Math.floor(iconIndex / ICONS_PER_ROW)
    };
};

ICU.createCompositeBitmap = function() {
    var bitmap = Object.create(Bitmap.prototype);
    bitmap._defer = true;
    bitmap.initialize();
    bitmap._loadingState = 'requesting';
    bitmap.smooth = false;
    return bitmap;
};

ICU.refreshBitmapTexture = function(bitmap) {
    if (!bitmap) return;
    var canvas = bitmap.__canvas;
    if (!canvas) return;
    if (!bitmap.__baseTexture) {
        bitmap._createBaseTexture(canvas);
    } else {
        var bt = bitmap.__baseTexture;
        bt.width = canvas.width;
        bt.height = canvas.height;
        if (typeof bt.update === 'function') bt.update();
    }
    bitmap._setDirty();
};

ICU.ensureEntry = function(hue) {
    hue = hue || 0;
    var entry = ICU._composites[hue];
    if (!entry) {
        entry = {
            hue: hue,
            bitmap: ICU.createCompositeBitmap(),
            main: null,
            sheets: [],
            totalSheetRows: 0,
            stamps: [],
            fileIdMap: {},
            composing: false
        };
        ICU._composites[hue] = entry;
    }
    return entry;
};

ICU.drawBitmapSource = function(ctx, src, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!ctx || !src || sw <= 0 || sh <= 0) return;
    var from = src.__canvas || src._image;
    if (!from) {
        try {
            from = src._canvas;
        } catch (e) {
            return;
        }
    }
    if (!from) return;
    try {
        ctx.drawImage(from, sx, sy, sw, sh, dx, dy, dw || sw, dh || sh);
    } catch (e2) {
    }
};

ICU.paintComposite = function(entry) {
    if (!entry || !entry.bitmap) return;
    var width = ICONS_PER_ROW * ICON_W;
    var stampRows = Math.ceil(entry.stamps.length / ICONS_PER_ROW);
    var totalRows = Math.max(1, entry.totalSheetRows + stampRows);
    var height = totalRows * ICON_H;
    var bmp = entry.bitmap;
    bmp._image = null;
    if (!bmp.__canvas) {
        bmp._createCanvas(width, height);
    } else {
        bmp.__canvas.width = width;
        bmp.__canvas.height = height;
        bmp.__context = bmp.__canvas.getContext('2d');
    }
    var ctx = bmp._context;
    ctx.clearRect(0, 0, width, height);
    var destY = 0;
    var i;
    for (i = 0; i < entry.sheets.length; i++) {
        var sheet = entry.sheets[i];
        if (!sheet || sheet.rows <= 0 || !sheet.bitmap) continue;
        var sh = sheet.rows * ICON_H;
        var sw = Math.min(sheet.bitmap.width || width, width);
        var srcH = Math.min(sh, sheet.bitmap.height || sh);
        ICU.drawBitmapSource(ctx, sheet.bitmap, 0, 0, sw, srcH, 0, destY, sw, srcH);
        destY += sh;
    }
    for (i = 0; i < entry.stamps.length; i++) {
        var stamp = entry.stamps[i];
        if (!stamp || !stamp.bitmap) continue;
        var pos = ICU.iconIndexToXY(stamp.id);
        ICU.drawBitmapSource(
            ctx, stamp.bitmap,
            0, 0, ICON_W, ICON_H,
            pos.x * ICON_W, pos.y * ICON_H,
            ICON_W, ICON_H
        );
    }
    ICU.refreshBitmapTexture(bmp);
    if (bmp._loadingState !== 'loaded') {
        bmp._loadingState = 'loaded';
        bmp._callLoadListeners();
    } else {
        bmp._setDirty();
    }
};

ICU.reindexStamps = function(entry) {
    if (!entry) return;
    var start = entry.totalSheetRows * ICONS_PER_ROW;
    entry.fileIdMap = {};
    for (var i = 0; i < entry.stamps.length; i++) {
        var stamp = entry.stamps[i];
        stamp.id = start + i;
        entry.fileIdMap[stamp.key] = stamp.id;
    }
};

ICU.rebuildSheets = function(entry, main, extraBitmaps) {
    var sheets = [];
    var totalRows = 0;
    function addSheet(bitmap) {
        if (!bitmap || !bitmap.isReady() || bitmap.isError()) return;
        var rows = ICU.sheetRowsOf(bitmap);
        sheets.push({bitmap: bitmap, rows: rows});
        totalRows += rows;
    }
    addSheet(main);
    extraBitmaps = extraBitmaps || [];
    for (var i = 0; i < extraBitmaps.length; i++) {
        addSheet(extraBitmaps[i]);
    }
    entry.main = main;
    entry.sheets = sheets;
    entry.totalSheetRows = totalRows;
    ICU.reindexStamps(entry);
    ICU.paintComposite(entry);
};

ICU.whenBitmapsSettled = function(bitmaps, callback) {
    var list = [];
    var i;
    for (i = 0; i < bitmaps.length; i++) {
        if (bitmaps[i]) list.push(bitmaps[i]);
    }
    if (list.length <= 0) {
        callback();
        return;
    }
    var left = list.length;
    var done = false;
    var finish = function() {
        if (done) return;
        left--;
        if (left <= 0) {
            done = true;
            callback();
        }
    };
    var watchBitmap = function(bmp) {
        if (bmp.isReady() || bmp.isError()) {
            finish();
            return;
        }
        bmp.addLoadListener(finish);
        var originalOnError = bmp._onError;
        bmp._onError = function() {
            if (originalOnError) originalOnError.apply(this, arguments);
            finish();
        };
    };
    for (i = 0; i < list.length; i++) {
        watchBitmap(list[i]);
    }
};

ICU.acquireComposite = function(hue, main, extraBitmaps) {
    ICU._started = true;
    hue = hue || 0;
    var entry = ICU.ensureEntry(hue);
    extraBitmaps = extraBitmaps || [];
    if (entry.bitmap.isReady() && entry.main === main && !entry.composing) {
        return entry.bitmap;
    }
    if (entry.composing && entry.bitmap) {
        return entry.bitmap;
    }
    entry.composing = true;
    var waitList = [main].concat(extraBitmaps);
    ICU.whenBitmapsSettled(waitList, function() {
        ICU.rebuildSheets(entry, main, extraBitmaps);
        entry.composing = false;
    });
    return entry.bitmap;
};

ICU.preloadExtraBitmaps = function(loader, owner, hue, reservationId) {
    var extras = [];
    for (var i = 0; i < ICU.extraNames.length; i++) {
        var name = ICU.extraNames[i];
        if (!ICU.systemAssetExists(name)) continue;
        extras.push(loader.call(owner, name, hue, reservationId));
    }
    return extras;
};

ICU.isCompositeReady = function() {
    if (!ICU._started) return true;
    var entry = ICU._composites[0] || ICU._composites[Object.keys(ICU._composites)[0]];
    return !!(entry && entry.bitmap && entry.bitmap.isReady());
};

ICU.resetComposites = function() {
    var keys = Object.keys(ICU._composites);
    for (var i = 0; i < keys.length; i++) {
        var entry = ICU._composites[keys[i]];
        if (!entry) continue;
        entry.main = null;
        entry.sheets = [];
        entry.composing = false;
        entry._extraRef = null;
    }
};

ICU.activeEntry = function() {
    return ICU._composites[0] || ICU._composites[Object.keys(ICU._composites)[0]] || null;
};

ICU.totalSheetRows = function() {
    var entry = ICU.activeEntry();
    return entry ? Number(entry.totalSheetRows || 0) : 0;
};

ICU.totalRows = function() {
    return ICU.totalSheetRows();
};

ICU.maxIconIndex = function() {
    var entry = ICU.activeEntry();
    if (!entry) return -1;
    var rows = entry.totalSheetRows + Math.ceil(entry.stamps.length / ICONS_PER_ROW);
    return rows * ICONS_PER_ROW - 1;
};

ICU.isValidIconXY = function(x, y, includeStamps) {
    x = Number(x);
    y = Number(y);
    if (!isFinite(x) || !isFinite(y)) return false;
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= ICONS_PER_ROW || y < 0) return false;
    var entry = ICU.activeEntry();
    if (!entry || !entry.bitmap || !entry.bitmap.isReady()) return false;
    var rows = entry.totalSheetRows;
    if (includeStamps !== false) {
        rows += Math.ceil(entry.stamps.length / ICONS_PER_ROW);
    }
    return y < rows;
};

ICU.isValidIconIndex = function(iconIndex, includeStamps) {
    iconIndex = Number(iconIndex);
    if (!isFinite(iconIndex)) return false;
    iconIndex = Math.floor(iconIndex);
    if (iconIndex < 0) return false;
    var xy = ICU.iconIndexToXY(iconIndex);
    return ICU.isValidIconXY(xy.x, xy.y, includeStamps);
};

ICU.isValidSheetIconIndex = function(iconIndex) {
    return ICU.isValidIconIndex(iconIndex, false);
};

ICU.is32x32 = function(bitmap) {
    return !!(bitmap && bitmap.isReady() && !bitmap.isError() &&
        Number(bitmap.width) === ICON_W && Number(bitmap.height) === ICON_H);
};

ICU.loadSystemPassthrough = function(name, hue) {
    hue = hue || 0;
    ICU._passthrough++;
    try {
        return ICU._loadSystem.call(ImageManager, name, hue);
    } finally {
        ICU._passthrough--;
    }
};

ICU.allocateFileIcon = function(name) {
    name = ICU.normalizeSystemName(name);
    if (!name) return null;
    var key = name.toLowerCase();
    if (ICU._failedFiles[key]) return null;
    var entry = ICU.ensureEntry(0);
    if (entry.fileIdMap[key] !== undefined) return entry.fileIdMap[key];
    if (!ICU.systemAssetExists(name)) {
        ICU._failedFiles[key] = true;
        return null;
    }
    var fileBmp = ICU.loadSystemPassthrough(name, 0);
    if (!fileBmp) {
        ICU._failedFiles[key] = true;
        return null;
    }
    if (!fileBmp.isReady()) {
        fileBmp.addLoadListener(function() {
            ICU.allocateFileIcon(name);
        });
        return null;
    }
    if (fileBmp.isError() || !ICU.is32x32(fileBmp)) {
        ICU._failedFiles[key] = true;
        return null;
    }
    if (entry.fileIdMap[key] !== undefined) return entry.fileIdMap[key];
    var stamp = {key: key, name: name, bitmap: fileBmp, id: 0};
    entry.stamps.push(stamp);
    ICU.reindexStamps(entry);
    if (entry.bitmap.isReady()) ICU.paintComposite(entry);
    return stamp.id;
};

//=============================================================================
// ImageManager hooks
//=============================================================================

ICU._loadSystem = ImageManager.loadSystem;
ICU._reserveSystem = ImageManager.reserveSystem;
ICU._requestSystem = ImageManager.requestSystem;
ICU._loadBitmap = ImageManager.loadBitmap;
ICU._isReady = ImageManager.isReady;
ICU._clear = ImageManager.clear;

ICU.wrapSystemLoader = function(original) {
    return function(filename, hue, reservationId) {
        if (!ICU.isIconSetName(filename)) {
            return original.apply(this, arguments);
        }
        hue = hue || 0;
        ICU._passthrough++;
        var extras;
        var main;
        try {
            extras = ICU.preloadExtraBitmaps(original, this, hue, reservationId);
            main = original.apply(this, arguments);
        } finally {
            ICU._passthrough--;
        }
        return ICU.acquireComposite(hue, main, extras);
    };
};

ImageManager.loadSystem = ICU.wrapSystemLoader(ICU._loadSystem);
if (ImageManager.reserveSystem) {
    ImageManager.reserveSystem = ICU.wrapSystemLoader(ICU._reserveSystem);
}
if (ImageManager.requestSystem) {
    ImageManager.requestSystem = ICU.wrapSystemLoader(ICU._requestSystem);
}

ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
    if (!ICU._passthrough && ICU.isFolderIconSet(folder, filename)) {
        return ImageManager.loadSystem('IconSet', hue);
    }
    return ICU._loadBitmap.call(this, folder, filename, hue, smooth);
};

if (ImageManager.reserveBitmap) {
    ICU._reserveBitmap = ImageManager.reserveBitmap;
    ImageManager.reserveBitmap = function(folder, filename, hue, smooth, reservationId) {
        if (!ICU._passthrough && ICU.isFolderIconSet(folder, filename)) {
            return ImageManager.reserveSystem('IconSet', hue, reservationId);
        }
        return ICU._reserveBitmap.apply(this, arguments);
    };
}

if (ImageManager.requestBitmap) {
    ICU._requestBitmap = ImageManager.requestBitmap;
    ImageManager.requestBitmap = function(folder, filename, hue, smooth) {
        if (!ICU._passthrough && ICU.isFolderIconSet(folder, filename)) {
            return ImageManager.requestSystem('IconSet', hue);
        }
        return ICU._requestBitmap.apply(this, arguments);
    };
}

ImageManager.isReady = function() {
    if (!ICU._isReady.call(this)) return false;
    return ICU.isCompositeReady();
};

ImageManager.clear = function() {
    ICU._clear.call(this);
    ICU.resetComposites();
};

//=============================================================================
// Override parsing / resolving
//=============================================================================

ICU.parseOverrideValue = function(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === 'number') {
        if (!isFinite(raw)) return null;
        return {type: 'id', value: Math.floor(raw)};
    }
    if (Array.isArray(raw)) {
        if (raw.length < 2) return null;
        return {type: 'xy', x: Math.floor(Number(raw[0])), y: Math.floor(Number(raw[1]))};
    }
    if (typeof raw === 'object') {
        if (raw.type) return raw;
        if (raw.id !== undefined) return {type: 'id', value: Math.floor(Number(raw.id))};
        if (raw.x !== undefined && raw.y !== undefined) {
            return {type: 'xy', x: Math.floor(Number(raw.x)), y: Math.floor(Number(raw.y))};
        }
        if (raw.file || raw.name || raw.path) {
            return {type: 'file', value: String(raw.file || raw.name || raw.path)};
        }
        return null;
    }
    var text = String(raw).trim();
    if (!text) return null;
    var quoted = text.match(/^(["'])([\s\S]*)\1$/);
    if (quoted) {
        var quotedName = ICU.normalizeSystemName(quoted[2]);
        if (!quotedName) return null;
        return {type: 'file', value: quotedName};
    }
    var xy = text.match(/^(\d+)\s*,\s*(\d+)$/);
    if (xy) {
        return {type: 'xy', x: parseInt(xy[1], 10), y: parseInt(xy[2], 10)};
    }
    if (/^\d+$/.test(text)) {
        return {type: 'id', value: parseInt(text, 10)};
    }
    var fileName = ICU.normalizeSystemName(text);
    if (!fileName) return null;
    return {type: 'file', value: fileName};
};

ICU.parseOverrideTagInner = function(inner) {
    inner = String(inner == null ? '' : inner).trim();
    if (!inner) return null;
    var quoted = inner.match(/^(["'])([\s\S]*)\1$/);
    if (quoted) {
        var fileName = ICU.normalizeSystemName(quoted[2]);
        if (!fileName) return null;
        return {type: 'file', value: fileName};
    }
    var xy = inner.match(/^(\d+)\s*,\s*(\d+)$/);
    if (xy) {
        return {type: 'xy', x: parseInt(xy[1], 10), y: parseInt(xy[2], 10)};
    }
    if (/^\d+$/.test(inner)) {
        return {type: 'id', value: parseInt(inner, 10)};
    }
    return null;
};

ICU.resolvedIdFromSpec = function(spec) {
    if (!spec) return null;
    if (spec.type === 'id') {
        var id = Math.floor(Number(spec.value));
        if (!isFinite(id) || id < 0) return null;
        if (!ICU.isValidSheetIconIndex(id)) return null;
        return id;
    }
    if (spec.type === 'xy') {
        var x = Math.floor(Number(spec.x));
        var y = Math.floor(Number(spec.y));
        if (!ICU.isValidIconXY(x, y, false)) return null;
        return ICU.xyToIconIndex(x, y);
    }
    if (spec.type === 'file') {
        var fileId = ICU.allocateFileIcon(spec.value);
        return (fileId === null || fileId === undefined) ? null : fileId;
    }
    return null;
};

ICU.originalIconIndex = function(obj) {
    if (!obj) return 0;
    if (obj._jakeIconIndexOriginal !== undefined) {
        return Number(obj._jakeIconIndexOriginal) || 0;
    }
    var desc = Object.getOwnPropertyDescriptor(obj, 'iconIndex');
    if (desc && desc.get) return 0;
    return Number(obj.iconIndex) || 0;
};

ICU.pushContext = function(ctx) {
    ICU._contextStack.push(ctx || {});
};

ICU.popContext = function() {
    ICU._contextStack.pop();
};

ICU.currentContext = function() {
    if (ICU._contextStack.length <= 0) return {};
    return ICU._contextStack[ICU._contextStack.length - 1] || {};
};

ICU.contextBattler = function() {
    var ctx = ICU.currentContext();
    return ctx.battler || ctx.user || ctx.actor || null;
};

ICU.evalCustomOverride = function(obj, code) {
    var iconOverride = null;
    var item = obj;
    var data = obj;
    var user = ICU.contextBattler();
    var battler = user;
    var a = user;
    var s = ($gameSwitches && $gameSwitches._data) ? $gameSwitches._data : [];
    var v = ($gameVariables && $gameVariables._data) ? $gameVariables._data : [];
    try {
        eval(code);
    } catch (e) {
        if (typeof Yanfly !== 'undefined' && Yanfly.Util && Yanfly.Util.displayError) {
            Yanfly.Util.displayError(e, code, 'ICON CUSTOM OVERRIDE ERROR');
        } else {
            console.error('JakeMSG_IconCustomUsage Icon Custom Override error:', e);
        }
        return null;
    }
    if (iconOverride === undefined || iconOverride === null || iconOverride === '') {
        return null;
    }
    return ICU.parseOverrideValue(iconOverride);
};

ICU.cacheKeyFor = function(obj, battler) {
    var uid = obj._jakeIcuUid || ('id' + String(obj.id || 0));
    var extra = obj._jakeNextTurnPreview ? 'N' : '';
    var battlerKey = 'n';
    if (battler) {
        if (!battler._jakeIcuBattlerId) battler._jakeIcuBattlerId = ICU._uidSeed++;
        battlerKey = String(battler._jakeIcuBattlerId);
    }
    return uid + extra + ':' + battlerKey;
};

ICU.resolveIconIndex = function(obj) {
    if (!obj) return 0;
    if (obj._jakeResolvingIcon) {
        return Number(obj._jakeIconIndexOriginal) || 0;
    }
    var original = Number(obj._jakeIconIndexOriginal) || 0;
    var battler = ICU.contextBattler();
    var frame = (typeof Graphics !== 'undefined') ? Graphics.frameCount : 0;
    var cacheKey = ICU.cacheKeyFor(obj, battler);
    if (obj._jakeIcuFrame === frame && obj._jakeIcuCacheKey === cacheKey) {
        return obj._jakeIcuValue;
    }
    obj._jakeResolvingIcon = true;
    var resolved = original;
    try {
        var spec = null;
        if (obj._jakeIconCustomEval) {
            spec = ICU.evalCustomOverride(obj, obj._jakeIconCustomEval);
        } else if (obj._jakeIconOverrideRaw) {
            spec = obj._jakeIconOverrideRaw;
        }
        if (spec) {
            var id = ICU.resolvedIdFromSpec(spec);
            if (id !== null && id !== undefined) resolved = id;
        }
    } finally {
        obj._jakeResolvingIcon = false;
    }
    obj._jakeIcuFrame = frame;
    obj._jakeIcuCacheKey = cacheKey;
    obj._jakeIcuValue = resolved;
    return resolved;
};

ICU.copyIconMeta = function(src, dest) {
    if (!src || !dest) return;
    dest._jakeIconOverrideRaw = src._jakeIconOverrideRaw || null;
    dest._jakeIconCustomEval = src._jakeIconCustomEval || '';
    dest._jakeIconIndexOriginal = src._jakeIconIndexOriginal !== undefined ?
        src._jakeIconIndexOriginal : ICU.originalIconIndex(src);
};

ICU.installIconProxy = function(obj) {
    if (!obj) return;
    var desc = Object.getOwnPropertyDescriptor(obj, 'iconIndex');
    if (desc && desc.get && obj._jakeIconProxy) return;
    var original;
    if (obj._jakeIconIndexOriginal !== undefined) {
        original = Number(obj._jakeIconIndexOriginal) || 0;
    } else if (desc && desc.get) {
        original = 0;
    } else {
        original = Number(obj.iconIndex) || 0;
    }
    obj._jakeIconIndexOriginal = original;
    if (!obj._jakeIcuUid) obj._jakeIcuUid = ICU._uidSeed++;
    obj._jakeIconProxy = true;
    Object.defineProperty(obj, 'iconIndex', {
        configurable: true,
        enumerable: true,
        get: function() {
            return ICU.resolveIconIndex(this);
        },
        set: function(value) {
            this._jakeIconIndexOriginal = Number(value) || 0;
            this._jakeIcuFrame = -1;
        }
    });
};

ICU.installIconProxyOnGroup = function(group) {
    if (!group) return;
    for (var i = 1; i < group.length; i++) {
        if (group[i]) ICU.installIconProxy(group[i]);
    }
};

ICU.parseIconNotetags = function(obj) {
    if (!obj) return;
    obj._jakeIconOverrideRaw = null;
    obj._jakeIconCustomEval = '';
    var note = String(obj.note || '');
    if (!note) {
        ICU.installIconProxy(obj);
        return;
    }
    var overrideRe = /<Icon\s*Override\s*:\s*([^>]+)>/gi;
    var match;
    var lastInner = null;
    while ((match = overrideRe.exec(note))) {
        lastInner = match[1];
    }
    if (lastInner !== null) {
        obj._jakeIconOverrideRaw = ICU.parseOverrideTagInner(lastInner);
        if (obj._jakeIconOverrideRaw && obj._jakeIconOverrideRaw.type === 'file') {
            ICU.allocateFileIcon(obj._jakeIconOverrideRaw.value);
        }
    }
    var lines = note.split(/[\r\n]+/);
    var collecting = false;
    var block = '';
    var lastBlock = '';
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.match(/<Icon\s*Custom\s*Override>/i)) {
            collecting = true;
            block = '';
            continue;
        }
        if (line.match(/<\/Icon\s*Custom\s*Override>/i)) {
            if (collecting) lastBlock = block;
            collecting = false;
            block = '';
            continue;
        }
        if (collecting) block += line + '\n';
    }
    obj._jakeIconCustomEval = lastBlock;
    if (lastBlock) {
        var quoteRe = /(["'])([^"']+)\1/g;
        var quoteMatch;
        while ((quoteMatch = quoteRe.exec(lastBlock))) {
            var quotedInner = quoteMatch[2];
            if (/^\d+$/.test(quotedInner) || /^\d+\s*,\s*\d+$/.test(quotedInner)) continue;
            var customFile = ICU.normalizeSystemName(quotedInner);
            if (customFile && ICU.systemAssetExists(customFile)) {
                ICU.allocateFileIcon(customFile);
            }
        }
    }
    ICU.installIconProxy(obj);
};

ICU.processIconNotetags = function(group) {
    if (!group) return;
    for (var n = 1; n < group.length; n++) {
        ICU.parseIconNotetags(group[n]);
    }
};

//=============================================================================
// DataManager
//=============================================================================

ICU._DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!ICU._DataManager_isDatabaseLoaded.call(this)) return false;
    if (!ICU._loadedNotetags) {
        ICU.processIconNotetags($dataSkills);
        ICU.processIconNotetags($dataItems);
        ICU.processIconNotetags($dataWeapons);
        ICU.processIconNotetags($dataArmors);
        ICU.processIconNotetags($dataStates);
        ICU._loadedNotetags = true;
    }
    return true;
};

if (DataManager.registerNewItem) {
    ICU._registerNewItem = DataManager.registerNewItem;
    DataManager.registerNewItem = function(item) {
        var newItem = ICU._registerNewItem.call(this, item);
        if (newItem && item) {
            ICU.copyIconMeta(item, newItem);
            ICU.installIconProxy(newItem);
        }
        return newItem;
    };
}

if (typeof ItemManager !== 'undefined' && ItemManager.setNewIndependentItem) {
    ICU._setNewIndependentItem = ItemManager.setNewIndependentItem;
    ItemManager.setNewIndependentItem = function(baseItem, newItem) {
        ICU._setNewIndependentItem.call(this, baseItem, newItem);
        if (baseItem && newItem) {
            ICU.copyIconMeta(baseItem, newItem);
            if (baseItem._jakeIconIndexOriginal !== undefined) {
                newItem.baseItemIconIndex = baseItem._jakeIconIndexOriginal;
            }
            ICU.installIconProxy(newItem);
        }
    };
}

if (DataManager.loadIndependentItems) {
    ICU._loadIndependentItems = DataManager.loadIndependentItems;
    DataManager.loadIndependentItems = function() {
        ICU._loadIndependentItems.call(this);
        ICU.installIconProxyOnGroup($dataItems);
        ICU.installIconProxyOnGroup($dataWeapons);
        ICU.installIconProxyOnGroup($dataArmors);
    };
}

//=============================================================================
// Display context (so Custom Override can see the battler)
//=============================================================================

ICU.wrapMethod = function(obj, name, wrapper) {
    if (!obj || typeof obj[name] !== 'function') return;
    var original = obj[name];
    obj[name] = wrapper(original);
};

ICU.wrapMethod(Game_BattlerBase.prototype, 'stateIcons', function(original) {
    return function() {
        ICU.pushContext({battler: this});
        try {
            return original.call(this);
        } finally {
            ICU.popContext();
        }
    };
});

ICU.wrapMethod(Game_BattlerBase.prototype, 'allIcons', function(original) {
    return function() {
        ICU.pushContext({battler: this});
        try {
            return original.call(this);
        } finally {
            ICU.popContext();
        }
    };
});

ICU.wrapMethod(Game_BattlerBase.prototype, 'statesAndBuffs', function(original) {
    return function() {
        ICU.pushContext({battler: this});
        try {
            return original.call(this);
        } finally {
            ICU.popContext();
        }
    };
});

ICU.wrapMethod(Game_BattlerBase.prototype, 'getStateIconEntriesWithPreview', function(original) {
    return function() {
        ICU.pushContext({battler: this});
        try {
            return original.call(this);
        } finally {
            ICU.popContext();
        }
    };
});

ICU.wrapMethod(Window_Base.prototype, 'drawItemName', function(original) {
    return function(item, x, y, width) {
        var battler = this._battler || this._actor ||
            (this._statusWindow && (this._statusWindow._battler || this._statusWindow._actor)) ||
            null;
        ICU.pushContext({item: item, battler: battler});
        try {
            return original.call(this, item, x, y, width);
        } finally {
            ICU.popContext();
        }
    };
});

ICU.wrapMethod(Window_Base.prototype, 'drawActorIcons', function(original) {
    return function(actor, x, y, width) {
        ICU.pushContext({battler: actor});
        try {
            return original.call(this, actor, x, y, width);
        } finally {
            ICU.popContext();
        }
    };
});

if (typeof Sprite_StateIcon !== 'undefined') {
    ICU.wrapMethod(Sprite_StateIcon.prototype, 'updateIcon', function(original) {
        return function() {
            ICU.pushContext({battler: this._battler});
            try {
                return original.call(this);
            } finally {
                ICU.popContext();
            }
        };
    });
}

if (typeof Window_InBattleStateList !== 'undefined') {
    ICU.wrapMethod(Window_InBattleStateList.prototype, 'makeItemList', function(original) {
        return function() {
            ICU.pushContext({battler: this._battler});
            try {
                return original.call(this);
            } finally {
                ICU.popContext();
            }
        };
    });
}

if (typeof Window_EnemyInBattleStateList !== 'undefined') {
    ICU.wrapMethod(Window_EnemyInBattleStateList.prototype, 'makeItemList', function(original) {
        return function() {
            ICU.pushContext({battler: this._battler});
            try {
                return original.call(this);
            } finally {
                ICU.popContext();
            }
        };
    });
}

if (typeof Window_StateIconTooltip !== 'undefined') {
    ICU.wrapMethod(Window_StateIconTooltip.prototype, 'setupStateText', function(original) {
        return function() {
            ICU.pushContext({battler: this._battler});
            try {
                return original.call(this);
            } finally {
                ICU.popContext();
            }
        };
    });
}

if (typeof Game_Battler !== 'undefined') {
    ICU.wrapMethod(Game_Battler.prototype, 'addState', function(original) {
        return function(stateId) {
            ICU.pushContext({battler: this});
            try {
                return original.apply(this, arguments);
            } finally {
                ICU.popContext();
            }
        };
    });
    ICU.wrapMethod(Game_Battler.prototype, 'removeState', function(original) {
        return function(stateId) {
            ICU.pushContext({battler: this});
            try {
                return original.apply(this, arguments);
            } finally {
                ICU.popContext();
            }
        };
    });
}

})();

//=============================================================================
// End of File
//=============================================================================
