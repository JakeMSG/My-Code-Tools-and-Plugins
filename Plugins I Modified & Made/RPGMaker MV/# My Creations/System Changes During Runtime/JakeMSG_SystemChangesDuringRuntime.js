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
 * v1.0
============ Change Log ============
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
 * Priority:
 *   1. Save-specific value from systemChangeSave (while a save is loaded)
 *   2. Meta value from systemChangeMetaSave
 *   3. Built-in default
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
 * - Paths start from img/, not from the project root.
 * - Forward slashes and backslashes are both accepted.
 * - File extensions are optional. If omitted, the Webp/PNG plugin chooses the
 *   correct .png or .webp file based on your plugin parameters.
 * - Subfolders are supported when JakeMSG_WebpMP3AndSubfoldersInMVCommands is
 *   enabled.
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
        metaOverrides: {}
    };

    JakeMSG_SCDR.isKnownSetting = function(key) {
        return Object.prototype.hasOwnProperty.call(this.defaults, key);
    };

    JakeMSG_SCDR.normalizePath = function(path) {
        return String(path == null ? '' : path).trim().replace(/\\/g, '/');
    };

    JakeMSG_SCDR.resolveSettingValue = function(key, value) {
        if (value === undefined || value === null) {
            return this.defaults[key];
        }
        return this.normalizePath(value);
    };

    JakeMSG_SCDR.parseImgPath = function(relativePath) {
        var path = this.normalizePath(relativePath);
        if (!path) {
            return null;
        }
        path = path.replace(/\.(png|webp)$/i, '');
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash < 0) {
            return {
                folder: 'img/',
                filename: path
            };
        }
        return {
            folder: 'img/' + path.substring(0, lastSlash + 1),
            filename: path.substring(lastSlash + 1)
        };
    };

    JakeMSG_SCDR.toGraphicsImageSrc = function(relativePath) {
        var parsed = this.parseImgPath(relativePath);
        if (!parsed) {
            return 'img/system/Loading.png';
        }
        return parsed.folder + parsed.filename + '.png';
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

    JakeMSG_SCDR.getEffectivePath = function(key) {
        var saveOverrides = this.getSaveOverrides();
        if (saveOverrides.hasOwnProperty(key)) {
            return saveOverrides[key];
        }
        if (this.metaOverrides.hasOwnProperty(key)) {
            return this.metaOverrides[key];
        }
        return this.defaults[key];
    };

    JakeMSG_SCDR.hasActiveOverride = function(key) {
        var saveOverrides = this.getSaveOverrides();
        if (saveOverrides.hasOwnProperty(key)) {
            return saveOverrides[key] !== this.defaults[key];
        }
        if (this.metaOverrides.hasOwnProperty(key)) {
            return this.metaOverrides[key] !== this.defaults[key];
        }
        return false;
    };

    JakeMSG_SCDR.getSystemOverridePath = function(systemFilename) {
        var key = this.systemFileMap[systemFilename];
        if (!key || !this.hasActiveOverride(key)) {
            return null;
        }
        return this.getEffectivePath(key);
    };

    JakeMSG_SCDR.loadBitmapFromImgPath = function(relativePath, hue, smooth) {
        var parsed = this.parseImgPath(relativePath);
        if (!parsed) {
            return ImageManager.loadEmptyBitmap();
        }
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

    JakeMSG_SCDR.applyAllSettings = function() {
        var self = this;
        this.clearFormatCache();
        Object.keys(this.defaults).forEach(function(key) {
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
            var overridePath = JakeMSG_SCDR.getSystemOverridePath(filename);
            if (overridePath) {
                return JakeMSG_SCDR.loadBitmapFromImgPath(overridePath, hue, false);
            }
            return original.call(this, filename, hue);
        };
    };

    JakeMSG_SCDR.wrapTitleLoader = function(original, settingKey, smooth) {
        return function(filename, hue) {
            if (JakeMSG_SCDR.hasActiveOverride(settingKey)) {
                var overridePath = JakeMSG_SCDR.getEffectivePath(settingKey);
                if (!overridePath) {
                    return ImageManager.loadEmptyBitmap();
                }
                return JakeMSG_SCDR.loadBitmapFromImgPath(overridePath, hue, smooth);
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
        JakeMSG_SCDR.applyAllSettings();
    };

    var _JakeMSG_SCDR_DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _JakeMSG_SCDR_DataManager_setupNewGame.call(this);
        $gameSystem._jakeMSGSystemSettings = {};
        JakeMSG_SCDR.applyAllSettings();
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
            src = JakeMSG_SCDR.toGraphicsImageSrc(JakeMSG_SCDR.getEffectivePath('Img-System-Loading'));
        }
        _JakeMSG_SCDR_Graphics_setLoadingImage.call(this, src);
    };

})();

//=============================================================================
// End of File
//=============================================================================
