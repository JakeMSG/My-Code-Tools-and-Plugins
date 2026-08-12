//=============================================================================
// JakeMSG_SystemChangesDuringRuntime
// JakeMSG_SystemChangesDuringRuntime.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_SystemChangesDuringRuntime = true;

//=============================================================================
 /*:
 * @plugindesc Change system image settings at runtime and persist them to save or meta files.
 * @author JakeMSG
 * v1.1
============ Change Log ============
1.1 - 8.3rd.2026
 * Added missing-file fallback logic
1.0 - 7.14th.2026
 * initial release
================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * This plugin adds script calls that let you change certain system image
 * settings while the game is running. Changes can be stored either in the
 * current save file or in a separate meta save file shared across all saves.
 *
 * Asset paths are relative to the project's img/ folder. They work with
 * JakeMSG_WebpMP3AndSubfoldersInMVCommands: you may omit the file extension
 * and use either .png or .webp, and you may use subfolder paths such as
 * "custom/ui/Window".
 *
 * Place this plugin below JakeMSG_WebpMP3AndSubfoldersInMVCommands in the
 * Plugin Manager so image-format and subfolder handling stay active.
 *
 * Keep in mind, all script calls have default values for their parameters, so
 * you can choose to only specify the ones you want to change.
 *
 * ============================================================================
 * Script Calls
 * ============================================================================
 *
 * ------------------------------------------------
 * systemChangeSave(SettingChanged, NewSetting)
 * ------------------------------------------------
 * Changes a supported system setting for the current playthrough and stores
 * the value in the save file the next time the game is saved.
 *
 *   SettingChanged - String. Required. One of the setting names listed below.
 *   NewSetting     - String. Optional. New img/ path for that setting.
 *                    Defaults to the setting's built-in default when omitted.
 *
 * Example:
 *   systemChangeSave("Img-System-Window", "custom/ui/Window")
 *   systemChangeSave("Img-System-IconSet")   // resets IconSet to default
 *
 *
 * 
 * 
 * ------------------------------------------------
 * systemChangeMetaSave(SettingChanged, NewSetting)
 * ------------------------------------------------
 * Changes a supported system setting and immediately writes it to the meta
 * save file "JakeMSG_MetaSettings.rpgsave" in the save folder. Meta settings
 * apply to all playthroughs unless a save-specific value overrides them.
 *
 *   SettingChanged - String. Required. One of the setting names listed below.
 *   NewSetting     - String. Optional. New img/ path for that setting.
 *                    Defaults to the setting's built-in default when omitted.
 *
 * Example:
 *   systemChangeMetaSave("Img-System-Loading", "custom/ui/Loading")
 *
 *
 * Priority (value selection, then missing-file fallback):
 *   1. Save-specific value from systemChangeSave (while a save is loaded)
 *   2. Meta value from systemChangeMetaSave
 *   3. Built-in default
 *
 * If a chosen image file is missing, the plugin falls back in the same order:
 *   Save-specified file missing -> Meta-specified file (if any) -> Default
 *
 * The provided path is checked exactly as stored (under img/). The plugin does
 * not rewrite, shorten, or relocate it. If that exact path's folder is missing,
 * or the file at that path is missing, it skips to the next fallback.
 *
 * On every game launch, meta settings are loaded automatically from
 * JakeMSG_MetaSettings.rpgsave before gameplay begins. When you load a save
 * file, that save's settings replace the meta values for the rest of that
 * session. Starting a new game also clears save-specific settings so meta
 * applies again. Closing and reopening the game reloads meta settings from
 * the meta save file.
 *
 *
 * ============================================================================
 * Supported Settings
 * ============================================================================
 *
 * Img-System-Window
 *   Window.png used by windows.
 *   Default: "system/Window.png"
 *
 * Img-System-IconSet
 *   IconSet.png used for icons in windows and elsewhere.
 *   Default: "system/IconSet.png"
 *
 * Img-System-Balloon
 *   Balloon.png used for speech balloons over characters/events.
 *   Default: "system/Balloon.png"
 *
 * Img-System-GameOver
 *   GameOver.png used on the game over screen.
 *   Default: "system/GameOver.png"
 *
 * Img-System-Loading
 *   Loading.png shown while the game loads.
 *   Default: "system/Loading.png"
 *
 * Img-System-Title1
 *   Title 1 background picture on the title screen.
 *   Default: "titles1/Castle.png"
 *   When overridden, this replaces the database Title 1 image.
 *
 * Img-System-Title2
 *   Title 2 frame picture on the title screen.
 *   Default: "" (empty, no override; database Title 2 is used)
 *   When set to a non-empty path, this replaces the database Title 2 image.
 *
 *
 * ============================================================================
 * Path Notes
 * ============================================================================
 * - Paths are relative to img/ and are used exactly as provided.
 *   Example: "system/Replacement/Window.png" checks img/system/Replacement/Window.png
 * - Do not omit required subfolders. A bare name like "WindowRele.png" means
 *   img/WindowRele.png (img root), not a file inside img/system/.
 * - Forward slashes and backslashes are both accepted.
 * - A leading "img/" is optional and ignored if present.
 * - File extensions are optional. If omitted, .png/.webp at that same exact
 *   path are checked (WebP plugin compatibility). No other path is tried.
 *
 *
 * ============================================================================
 * Meta Save File
 * ============================================================================
 * Meta settings are stored in:
 *   save/JakeMSG_MetaSettings.rpgsave
 *
 * In browser play without NW.js, the same data is stored in localStorage under
 * the key "JakeMSG_MetaSettings".
 *
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 *
 *
 *
 */
//=============================================================================

(function() {
    'use strict';

    var JakeMSG_SCDR = {
        metaFileName: 'JakeMSG_MetaSettings.rpgsave',
        webStorageKey: 'JakeMSG_MetaSettings',
        defaults: {
            'Img-System-Window': 'system/Window.png',
            'Img-System-IconSet': 'system/IconSet.png',
            'Img-System-Balloon': 'system/Balloon.png',
            'Img-System-GameOver': 'system/GameOver.png',
            'Img-System-Loading': 'system/Loading.png',
            'Img-System-Title1': 'titles1/Castle.png',
            'Img-System-Title2': ''
        },
        systemFileMap: {
            'Window': 'Img-System-Window',
            'IconSet': 'Img-System-IconSet',
            'Balloon': 'Img-System-Balloon',
            'GameOver': 'Img-System-GameOver'
        },
        metaOverrides: {},
        // Paths that already failed to load at runtime; never try them again.
        failedPaths: {}
    };

    JakeMSG_SCDR.isKnownSetting = function(key) {
        return Object.prototype.hasOwnProperty.call(this.defaults, key);
    };

    JakeMSG_SCDR.normalizePath = function(path) {
        return String(path == null ? '' : path).trim().replace(/\\/g, '/');
    };

    // Keep the provided img-relative path exact. Only normalize slashes and an
    // optional leading "img/" — never relocate or strip subfolders.
    JakeMSG_SCDR.normalizeSettingPath = function(path) {
        var normalized = this.normalizePath(path);
        if (!normalized) {
            return '';
        }
        while (normalized.indexOf('./') === 0) {
            normalized = normalized.substring(2);
        }
        if (normalized.toLowerCase().indexOf('img/') === 0) {
            normalized = normalized.substring(4);
        }
        while (normalized.charAt(0) === '/') {
            normalized = normalized.substring(1);
        }
        return normalized;
    };

    JakeMSG_SCDR.resolveSettingValue = function(key, value) {
        if (value === undefined || value === null) {
            return this.defaults[key];
        }
        return this.normalizeSettingPath(value);
    };

    JakeMSG_SCDR.parseImgPath = function(relativePath) {
        var path = this.normalizeSettingPath(relativePath);
        if (!path) {
            return null;
        }
        path = path.replace(/\.(png|webp)$/i, '');
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash < 0) {
            return {
                folder: 'img/',
                filename: path,
                relativeDir: ''
            };
        }
        return {
            folder: 'img/' + path.substring(0, lastSlash + 1),
            filename: path.substring(lastSlash + 1),
            relativeDir: path.substring(0, lastSlash)
        };
    };

    JakeMSG_SCDR.toGraphicsImageSrc = function(relativePath) {
        var exact = this.exactImgFileCandidates(relativePath);
        return exact.length ? exact[0] : 'img/system/Loading.png';
    };

    JakeMSG_SCDR.gameBasePath = function() {
        try {
            if (typeof require === 'function' && typeof process !== 'undefined' &&
                    process.mainModule && process.mainModule.filename) {
                var path = require('path');
                return path.dirname(process.mainModule.filename);
            }
        } catch (e) {
        }
        return '';
    };

    JakeMSG_SCDR.urlToFsPath = function(url) {
        var clean = String(url || '').split('?')[0].split('#')[0];
        try {
            clean = decodeURIComponent(clean);
        } catch (e) {
        }
        if (clean.indexOf('file://') === 0) {
            clean = clean.replace(/^file:\/\//i, '');
        }
        if (/^\/[A-Za-z]:\//.test(clean)) {
            clean = clean.substring(1);
        }
        if (/^[A-Za-z]:[\\/]/.test(clean) || clean.indexOf('/') === 0) {
            return clean;
        }
        try {
            if (typeof require === 'function') {
                var path = require('path');
                var base = this.gameBasePath() || (typeof process !== 'undefined' && process.cwd ? process.cwd() : '');
                if (base) {
                    return path.join(base, clean.split('/').join(path.sep));
                }
            }
        } catch (e2) {
        }
        return clean;
    };

    // Strict existence check. Never treat XHR status 0 as "exists".
    JakeMSG_SCDR.urlExists = function(url) {
        try {
            if (typeof require === 'function') {
                var fs = require('fs');
                return fs.existsSync(this.urlToFsPath(url));
            }
        } catch (e) {
        }
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send(null);
            return xhr.status === 200;
        } catch (e2) {
            return false;
        }
    };

    JakeMSG_SCDR.directoryExists = function(url) {
        try {
            if (typeof require === 'function') {
                var fs = require('fs');
                var fsPath = this.urlToFsPath(url);
                return fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory();
            }
        } catch (e) {
        }
        // Browser: cannot reliably stat directories; treat as unknown/ok and
        // let the file check decide.
        return true;
    };

    // Exact files only at the provided path location (no relocated fallbacks).
    // Extension alternatives stay on that same path for WebP plugin support.
    JakeMSG_SCDR.exactImgFileCandidates = function(relativePath) {
        var path = this.normalizeSettingPath(relativePath);
        var urls = [];
        if (!path) {
            return urls;
        }
        var extMatch = path.match(/\.(png|webp)$/i);
        var base = path.replace(/\.(png|webp)$/i, '');
        var primaryExt = (typeof JakeMSG_primaryImageExt === 'function') ?
            JakeMSG_primaryImageExt() : '.png';
        var fallbackExt = (typeof JakeMSG_fallbackImageExt === 'function') ?
            JakeMSG_fallbackImageExt() : '.webp';
        var onlyMain = (typeof JakeMSG_onlyMainNoFallback !== 'undefined') ?
            JakeMSG_onlyMainNoFallback : false;
        if (extMatch) {
            urls.push('img/' + base + extMatch[0].toLowerCase());
            if (!onlyMain) {
                urls.push('img/' + base + (extMatch[0].toLowerCase() === '.png' ? '.webp' : '.png'));
            }
        } else {
            urls.push('img/' + base + primaryExt);
            if (!onlyMain) {
                urls.push('img/' + base + fallbackExt);
            }
        }
        urls.push('img/' + base + '.rpgmvp');
        return urls;
    };

    JakeMSG_SCDR.candidateUrlsForImgPath = function(relativePath) {
        return this.exactImgFileCandidates(relativePath);
    };

    JakeMSG_SCDR.markPathFailed = function(relativePath) {
        var normalized = this.normalizeSettingPath(relativePath);
        if (normalized) {
            this.failedPaths[normalized] = true;
        }
    };

    JakeMSG_SCDR.isPathMarkedFailed = function(relativePath) {
        return !!this.failedPaths[this.normalizeSettingPath(relativePath)];
    };

    // True only if the provided path's folder exists and a file exists there.
    // Never rewrites the path to a different folder.
    JakeMSG_SCDR.imgPathExists = function(relativePath) {
        if (!relativePath && relativePath !== '') {
            return false;
        }
        if (relativePath === '') {
            return true;
        }
        if (this.isPathMarkedFailed(relativePath)) {
            return false;
        }
        var parsed = this.parseImgPath(relativePath);
        if (!parsed || !parsed.filename) {
            return false;
        }
        // Missing subfolder path => fail this candidate and use fallback chain.
        if (parsed.relativeDir && !this.directoryExists(parsed.folder)) {
            return false;
        }
        var urls = this.exactImgFileCandidates(relativePath);
        var i;
        for (i = 0; i < urls.length; i++) {
            if (this.urlExists(urls[i])) {
                return true;
            }
        }
        return false;
    };

    JakeMSG_SCDR.urlToRelativeImgPath = function(url) {
        var clean = this.normalizePath(String(url || '').split('?')[0].split('#')[0]);
        try {
            clean = decodeURIComponent(clean);
        } catch (e) {
        }
        var idx = clean.toLowerCase().lastIndexOf('/img/');
        if (idx >= 0) {
            clean = clean.substring(idx + 5);
        } else if (clean.toLowerCase().indexOf('img/') === 0) {
            clean = clean.substring(4);
        } else {
            return '';
        }
        return clean;
    };

    // If a missing override still somehow gets requested, swallow the Loading Error
    // and fall back instead of freezing the game.
    JakeMSG_SCDR.suppressOverrideLoadError = function(url) {
        var relative = this.urlToRelativeImgPath(url);
        if (!relative) {
            return false;
        }
        var relativeNoExt = relative.replace(/\.(png|webp|rpgmvp)$/i, '');
        var keys = Object.keys(this.defaults);
        var matched = false;
        var i, j, k, key, candidates, candidate, urls, candidateNoExt;
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            candidates = this.getCandidatePaths(key);
            for (j = 0; j < candidates.length; j++) {
                candidate = candidates[j];
                if (!candidate || candidate === this.defaults[key]) {
                    continue;
                }
                candidateNoExt = this.normalizeSettingPath(candidate).replace(/\.(png|webp)$/i, '');
                if (candidateNoExt === relativeNoExt ||
                        this.normalizeSettingPath(candidate) === this.normalizeSettingPath(relative)) {
                    this.markPathFailed(candidate);
                    matched = true;
                    continue;
                }
                urls = this.exactImgFileCandidates(candidate);
                for (k = 0; k < urls.length; k++) {
                    if (this.normalizePath(urls[k]) === this.normalizePath(url) ||
                            this.normalizeSettingPath(this.urlToRelativeImgPath(urls[k])) ===
                                this.normalizeSettingPath(relative)) {
                        this.markPathFailed(candidate);
                        matched = true;
                        break;
                    }
                }
            }
        }
        if (matched) {
            var self = this;
            setTimeout(function() {
                self.applyAllSettings({ skipTitleRefresh: true });
            }, 0);
        }
        return matched;
    };

    JakeMSG_SCDR.getSaveOverrides = function() {
        if (!$gameSystem) {
            return {};
        }
        if (!$gameSystem._jakeMSGSystemSettings) {
            $gameSystem._jakeMSGSystemSettings = {};
        }
        return $gameSystem._jakeMSGSystemSettings;
    };

    JakeMSG_SCDR.getCandidatePaths = function(key) {
        var candidates = [];
        var seen = {};
        var pushUnique = function(path) {
            var normalized = JakeMSG_SCDR.normalizeSettingPath(path);
            if (seen.hasOwnProperty(normalized)) {
                return;
            }
            seen[normalized] = true;
            candidates.push(normalized);
        };
        var saveOverrides = this.getSaveOverrides();
        if (saveOverrides.hasOwnProperty(key)) {
            pushUnique(saveOverrides[key]);
        }
        if (this.metaOverrides.hasOwnProperty(key)) {
            pushUnique(this.metaOverrides[key]);
        }
        pushUnique(this.defaults[key]);
        return candidates;
    };

    // Save path (if file exists) -> Meta path (if file exists) -> Default.
    // Missing override files are skipped so older saves cannot crash the game.
    JakeMSG_SCDR.getEffectivePath = function(key) {
        var candidates = this.getCandidatePaths(key);
        var i;
        for (i = 0; i < candidates.length; i++) {
            var path = candidates[i];
            // Empty path is a valid Title2 "use database default" value.
            if (path === '') {
                return '';
            }
            if (this.imgPathExists(path)) {
                return path;
            }
        }
        return this.defaults[key];
    };

    JakeMSG_SCDR.hasActiveOverride = function(key) {
        var effective = this.getEffectivePath(key);
        return !!effective && effective !== this.defaults[key] && this.imgPathExists(effective);
    };

    JakeMSG_SCDR.getSystemOverridePath = function(systemFilename) {
        var key = this.systemFileMap[systemFilename];
        if (!key || !this.hasActiveOverride(key)) {
            return null;
        }
        return this.getEffectivePath(key);
    };

    JakeMSG_SCDR.loadBitmapFromImgPath = function(relativePath, hue, smooth) {
        if (!relativePath || !this.imgPathExists(relativePath)) {
            return null;
        }
        var parsed = this.parseImgPath(relativePath);
        if (!parsed) {
            return null;
        }
        // ImageManager API needs folder + filename, but both come from the
        // exact provided path — no alternate folder is substituted here.
        return ImageManager.loadBitmap(parsed.folder, parsed.filename, hue || 0, smooth);
    };

    JakeMSG_SCDR.clearFormatCache = function() {
        if (typeof JakeMSG_extCache !== 'undefined') {
            JakeMSG_extCache = {};
        }
    };

    JakeMSG_SCDR.metaFilePath = function() {
        return StorageManager.localFileDirectoryPath() + this.metaFileName;
    };

    JakeMSG_SCDR.loadMetaSettings = function() {
        var json = null;
        try {
            if (StorageManager.isLocalMode()) {
                var fs = require('fs');
                var filePath = this.metaFilePath();
                if (fs.existsSync(filePath)) {
                    var data = fs.readFileSync(filePath, { encoding: 'utf8' });
                    json = LZString.decompressFromBase64(data);
                }
            } else {
                var stored = localStorage.getItem(this.webStorageKey);
                if (stored) {
                    json = LZString.decompressFromBase64(stored);
                }
            }
        } catch (e) {
            console.error(e);
        }
        this.metaOverrides = {};
        if (json) {
            try {
                var parsed = JsonEx.parse(json);
                if (parsed && typeof parsed === 'object') {
                    this.metaOverrides = parsed;
                }
            } catch (e2) {
                console.error(e2);
            }
        }
    };

    JakeMSG_SCDR.saveMetaSettings = function() {
        var json = JsonEx.stringify(this.metaOverrides);
        try {
            if (StorageManager.isLocalMode()) {
                var data = LZString.compressToBase64(json);
                var fs = require('fs');
                var dirPath = StorageManager.localFileDirectoryPath();
                var filePath = this.metaFilePath();
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
                fs.writeFileSync(filePath, data);
            } else {
                localStorage.setItem(this.webStorageKey, LZString.compressToBase64(json));
            }
        } catch (e) {
            console.error(e);
        }
    };

    JakeMSG_SCDR.setOverride = function(storage, key, value) {
        var resolved = this.resolveSettingValue(key, value);
        if (resolved === this.defaults[key]) {
            delete storage[key];
        } else {
            storage[key] = resolved;
        }
    };

    JakeMSG_SCDR.applyAllSettings = function(options) {
        var self = this;
        options = options || {};
        this.clearFormatCache();
        Object.keys(this.defaults).forEach(function(key) {
            // Leaving Title (New Game / Load Game): keep the current title visuals
            // so the normal fade-out is not interrupted by a rebuild/rescale flash.
            if (options.skipTitleRefresh &&
                    (key === 'Img-System-Title1' || key === 'Img-System-Title2')) {
                return;
            }
            self.applySetting(key);
        });
    };

    JakeMSG_SCDR.reloadMetaAndApply = function() {
        this.loadMetaSettings();
        this.applyAllSettings();
    };

    JakeMSG_SCDR.applySetting = function(key) {
        switch (key) {
        case 'Img-System-Window':
            this.refreshAllWindowskins();
            break;
        case 'Img-System-IconSet':
            this.refreshAllWindows();
            break;
        case 'Img-System-Balloon':
            this.refreshBalloonSprites();
            break;
        case 'Img-System-Loading':
            Graphics.setLoadingImage(this.toGraphicsImageSrc(this.getEffectivePath(key)));
            break;
        case 'Img-System-Title1':
        case 'Img-System-Title2':
            this.refreshTitleBackground();
            break;
        }
    };

    JakeMSG_SCDR.refreshAllWindowskins = function() {
        var scene = SceneManager._scene;
        if (!scene || !scene._windowLayer) {
            return;
        }
        scene._windowLayer.children.forEach(function(window) {
            if (window.loadWindowskin) {
                window.loadWindowskin();
            }
            if (window._refreshAllParts) {
                window._refreshAllParts();
            } else if (window.refresh) {
                window.refresh();
            }
        });
    };

    JakeMSG_SCDR.refreshAllWindows = function() {
        var scene = SceneManager._scene;
        if (!scene || !scene._windowLayer) {
            return;
        }
        scene._windowLayer.children.forEach(function(window) {
            if (window.refresh) {
                window.refresh();
            }
        });
    };

    JakeMSG_SCDR.refreshBalloonSprites = function() {
        var scene = SceneManager._scene;
        if (!scene || !scene._spriteset || !scene._spriteset._characterSprites) {
            return;
        }
        scene._spriteset._characterSprites.forEach(function(sprite) {
            if (sprite._balloonSprite && sprite._balloonSprite.loadBitmap) {
                sprite._balloonSprite.loadBitmap();
            }
        });
    };

    JakeMSG_SCDR.refreshTitleBackground = function() {
        var scene = SceneManager._scene;
        if (!(scene instanceof Scene_Title)) {
            return;
        }
        if (scene._backSprite1) {
            scene.removeChild(scene._backSprite1);
        }
        if (scene._backSprite2) {
            scene.removeChild(scene._backSprite2);
        }
        scene.createBackground();
        if (scene.centerSprite) {
            scene.centerSprite(scene._backSprite1);
            scene.centerSprite(scene._backSprite2);
        }
    };

    JakeMSG_SCDR.systemChangeSave = function(settingChanged, newSetting) {
        var key = String(settingChanged || '').trim();
        if (!this.isKnownSetting(key)) {
            console.warn('JakeMSG_SystemChangesDuringRuntime: Unknown setting "' + key + '".');
            return;
        }
        if (!$gameSystem) {
            console.warn('JakeMSG_SystemChangesDuringRuntime: systemChangeSave requires an active playthrough.');
            return;
        }
        this.setOverride(this.getSaveOverrides(), key, newSetting);
        this.applySetting(key);
    };

    JakeMSG_SCDR.systemChangeMetaSave = function(settingChanged, newSetting) {
        var key = String(settingChanged || '').trim();
        if (!this.isKnownSetting(key)) {
            console.warn('JakeMSG_SystemChangesDuringRuntime: Unknown setting "' + key + '".');
            return;
        }
        this.setOverride(this.metaOverrides, key, newSetting);
        this.saveMetaSettings();
        this.applySetting(key);
    };

    JakeMSG_SCDR.wrapSystemLoader = function(original) {
        return function(filename, hue) {
            var key = JakeMSG_SCDR.systemFileMap[filename];
            if (key) {
                var candidates = JakeMSG_SCDR.getCandidatePaths(key);
                var i, path, bitmap;
                for (i = 0; i < candidates.length; i++) {
                    path = candidates[i];
                    if (!path || path === JakeMSG_SCDR.defaults[key]) {
                        break;
                    }
                    if (!JakeMSG_SCDR.imgPathExists(path)) {
                        JakeMSG_SCDR.markPathFailed(path);
                        continue;
                    }
                    bitmap = JakeMSG_SCDR.loadBitmapFromImgPath(path, hue, false);
                    if (bitmap) {
                        return bitmap;
                    }
                    JakeMSG_SCDR.markPathFailed(path);
                }
            }
            return original.call(this, filename, hue);
        };
    };

    JakeMSG_SCDR.wrapTitleLoader = function(original, settingKey, smooth) {
        return function(filename, hue) {
            var candidates = JakeMSG_SCDR.getCandidatePaths(settingKey);
            var i, path, bitmap;
            for (i = 0; i < candidates.length; i++) {
                path = candidates[i];
                if (!path) {
                    return ImageManager.loadEmptyBitmap();
                }
                if (path === JakeMSG_SCDR.defaults[settingKey]) {
                    break;
                }
                if (!JakeMSG_SCDR.imgPathExists(path)) {
                    JakeMSG_SCDR.markPathFailed(path);
                    continue;
                }
                bitmap = JakeMSG_SCDR.loadBitmapFromImgPath(path, hue, smooth);
                if (bitmap) {
                    return bitmap;
                }
                JakeMSG_SCDR.markPathFailed(path);
            }
            return original.call(this, filename, hue);
        };
    };

    window.systemChangeSave = function(settingChanged, newSetting) {
        JakeMSG_SCDR.systemChangeSave(settingChanged, newSetting);
    };

    window.systemChangeMetaSave = function(settingChanged, newSetting) {
        JakeMSG_SCDR.systemChangeMetaSave(settingChanged, newSetting);
    };

    JakeMSG_SCDR.loadMetaSettings();

    var _JakeMSG_SCDR_Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _JakeMSG_SCDR_Game_System_initialize.call(this);
        this._jakeMSGSystemSettings = {};
    };

    var _JakeMSG_SCDR_DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _JakeMSG_SCDR_DataManager_extractSaveContents.call(this, contents);
        if (!$gameSystem._jakeMSGSystemSettings) {
            $gameSystem._jakeMSGSystemSettings = {};
        }
        JakeMSG_SCDR.applyAllSettings({ skipTitleRefresh: true });
    };

    var _JakeMSG_SCDR_DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _JakeMSG_SCDR_DataManager_setupNewGame.call(this);
        $gameSystem._jakeMSGSystemSettings = {};
        JakeMSG_SCDR.applyAllSettings({ skipTitleRefresh: true });
    };

    var _JakeMSG_SCDR_Scene_Boot_create = Scene_Boot.prototype.create;
    Scene_Boot.prototype.create = function() {
        JakeMSG_SCDR.loadMetaSettings();
        _JakeMSG_SCDR_Scene_Boot_create.call(this);
        JakeMSG_SCDR.applyAllSettings();
    };

    var _JakeMSG_SCDR_SceneManager_initGraphics = SceneManager.initGraphics;
    SceneManager.initGraphics = function() {
        JakeMSG_SCDR.loadMetaSettings();
        _JakeMSG_SCDR_SceneManager_initGraphics.call(this);
    };

    var _JakeMSG_SCDR_ImageManager_loadSystem = ImageManager.loadSystem;
    ImageManager.loadSystem = JakeMSG_SCDR.wrapSystemLoader(_JakeMSG_SCDR_ImageManager_loadSystem);

    if (ImageManager.reserveSystem) {
        var _JakeMSG_SCDR_ImageManager_reserveSystem = ImageManager.reserveSystem;
        ImageManager.reserveSystem = JakeMSG_SCDR.wrapSystemLoader(_JakeMSG_SCDR_ImageManager_reserveSystem);
    }

    if (ImageManager.requestSystem) {
        var _JakeMSG_SCDR_ImageManager_requestSystem = ImageManager.requestSystem;
        ImageManager.requestSystem = JakeMSG_SCDR.wrapSystemLoader(_JakeMSG_SCDR_ImageManager_requestSystem);
    }

    var _JakeMSG_SCDR_ImageManager_loadTitle1 = ImageManager.loadTitle1;
    ImageManager.loadTitle1 = JakeMSG_SCDR.wrapTitleLoader(
        _JakeMSG_SCDR_ImageManager_loadTitle1,
        'Img-System-Title1',
        true
    );

    var _JakeMSG_SCDR_ImageManager_loadTitle2 = ImageManager.loadTitle2;
    ImageManager.loadTitle2 = JakeMSG_SCDR.wrapTitleLoader(
        _JakeMSG_SCDR_ImageManager_loadTitle2,
        'Img-System-Title2',
        true
    );

    if (ImageManager.reserveTitle1) {
        var _JakeMSG_SCDR_ImageManager_reserveTitle1 = ImageManager.reserveTitle1;
        ImageManager.reserveTitle1 = JakeMSG_SCDR.wrapTitleLoader(
            _JakeMSG_SCDR_ImageManager_reserveTitle1,
            'Img-System-Title1',
            true
        );
    }

    if (ImageManager.reserveTitle2) {
        var _JakeMSG_SCDR_ImageManager_reserveTitle2 = ImageManager.reserveTitle2;
        ImageManager.reserveTitle2 = JakeMSG_SCDR.wrapTitleLoader(
            _JakeMSG_SCDR_ImageManager_reserveTitle2,
            'Img-System-Title2',
            true
        );
    }

    if (ImageManager.requestTitle1) {
        var _JakeMSG_SCDR_ImageManager_requestTitle1 = ImageManager.requestTitle1;
        ImageManager.requestTitle1 = JakeMSG_SCDR.wrapTitleLoader(
            _JakeMSG_SCDR_ImageManager_requestTitle1,
            'Img-System-Title1',
            true
        );
    }

    if (ImageManager.requestTitle2) {
        var _JakeMSG_SCDR_ImageManager_requestTitle2 = ImageManager.requestTitle2;
        ImageManager.requestTitle2 = JakeMSG_SCDR.wrapTitleLoader(
            _JakeMSG_SCDR_ImageManager_requestTitle2,
            'Img-System-Title2',
            true
        );
    }

    var _JakeMSG_SCDR_Graphics_setLoadingImage = Graphics.setLoadingImage;
    Graphics.setLoadingImage = function(src) {
        if (JakeMSG_SCDR.hasActiveOverride('Img-System-Loading')) {
            var loadingPath = JakeMSG_SCDR.getEffectivePath('Img-System-Loading');
            if (loadingPath && JakeMSG_SCDR.imgPathExists(loadingPath)) {
                src = JakeMSG_SCDR.toGraphicsImageSrc(loadingPath);
            }
        }
        _JakeMSG_SCDR_Graphics_setLoadingImage.call(this, src);
    };

    var _JakeMSG_SCDR_ResourceHandler_createLoader = ResourceHandler.createLoader;
    ResourceHandler.createLoader = function(url, retryMethod, resignMethod, retryInterval) {
        retryInterval = retryInterval || this._defaultRetryInterval;
        var reloaders = this._reloaders;
        var retryCount = 0;
        return function() {
            if (retryCount < retryInterval.length) {
                setTimeout(retryMethod, retryInterval[retryCount]);
                retryCount++;
            } else if (JakeMSG_SCDR.suppressOverrideLoadError(url)) {
                if (resignMethod) {
                    resignMethod();
                }
            } else {
                if (resignMethod) {
                    resignMethod();
                }
                if (url) {
                    if (reloaders.length === 0) {
                        Graphics.printLoadingError(url);
                        SceneManager.stop();
                    }
                    reloaders.push(function() {
                        retryCount = 0;
                        retryMethod();
                    });
                }
            }
        };
    };
    // Keep a reference so minifiers / later audits can see the original alias.
    JakeMSG_SCDR._originalCreateLoader = _JakeMSG_SCDR_ResourceHandler_createLoader;

})();

//=============================================================================
// End of File
//=============================================================================
