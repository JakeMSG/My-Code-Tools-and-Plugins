//=============================================================================
// JakeMSG_WebpMP3AndSubfoldersInMVCommands.js (MV & MZ compatible)
// JakeMSG_WebpMP3AndSubfoldersInMVCommands.js.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_WebpMP3AndSubfoldersInMVCommands = true;

// engine detection helpers
var JakeMSG_isMV = (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME === 'MV');
var JakeMSG_isMZ = (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME === 'MZ');


//=============================================================================
 /*:
 * @plugindesc (MV & MZ) Makes both .webp and .png assets possible to load!
 * New: also makes both .mp3 and .ogg audio files possible to load at the same time!
 * Also adds, for MV, the possibility for Commands in the editor to read names 
 * that contain subfolders (the "/" sign) (Will still require first opening
 * the project in MZ to set the Assets from the Subfolders!)
 * @author JakeMSG
 * v1.3 (main-format selector params + optional no-fallback mode)
============ Change Log ============
1.3 - 3.23th.2026
 *   Replaced old boolean "use as main" params with dropdown params:
 * "Main picture format" and "Main audio format".
 *   Added "Only load the Main format (no Fallback)" parameter.
 *   Added backward compatibility for old saved boolean parameter names.
 *   Reduced double-loading behavior by switching existence checks to filesystem
 * checks in NW.js (fallback to lightweight request checks only when needed).
1.2 - 3.13th.2026
* Added MP3 functionality for audio files as alternative to OGG, much like Webp is the possible alternative to PNG! (still compatible with MZ too)
1.1 - 2.25th.2026
* added MZ compatibility, MV fix conditional
1.0 - 2.17th.2026
* initial release
====================================
 * @help
 * ======================== New Feature
 * ======== Allows for loading both .webp and .png assets at once
 * ==== Added "Main picture format" parameter (.png/.webp)
 * ======== Allows for loading both .mp3 and .ogg assets at once
 * ==== Added "Main audio format" parameter (.ogg/.mp3)
 * ======== Added "Only load the Main format (no Fallback)" parameter
 * ==== If enabled, fallback format checks are skipped even when main files are missing
 * ======== Optimized format checks to avoid file-content loading during existence tests
 * ==== Uses filesystem existence checks in NW.js instead of synchronous GET loading
 * 
 * ======================== How to Use
 * ==== 1. Add this plugin to your list of plugins
 * ==== 2. (MV only) Open the same project in the MZ editor to enable subfolder assets support by copying a "game.rmmzproject" file from any MZ project, and paste it next to your "Game.rpgproject" file from your MV project.
 * ===== For MZ projects you don't need the above step; the plugin works immediately and MZ already handles slashes.
 * ==== 3. After you do all your needed modifications, Save, then load the Project back in MV to Save again in the normal MV format
 * ==== 4. Open the game, and it should work now!
 * ======== You can choose the preferred image/audio format with the Main format parameters
 * ======== If needed, you can force no fallback checks with the dedicated boolean parameter
 * 
 * 
 * ======================== Warning
 * ==== Since I do replace the "%2F" string in the names of Assets (to fix the "/" sign in MV only), you should refrain from using it yourself in said names normally
 * == Shouldn't be that difficult, you'd normally not use this sequence of symbols yourself
 * 
 * 
 * ======================== Explanations
 * ======== The Problem (that this Plugin solves)
 * ==== For Assets (Pictures, Sounds etc), you normally can't provide Subfolder paths in the editor Commands
 * == Instead, you have to use the Script call equivalents for said commands, which do accept Subfolder paths (in the Asset names)
 * ==== Said function has been added in MZ (in v1.3.0), and you can try to open the MV project with the MZ editor to be able to add Assets from Subfolders
 * == You would need to use a "game.rmmzproject" file (from any MZ project) in the MV project, place it right next to the normal "Game.rpgproject" file of the project
 * ==== However, upon loading the game after the change, after adding Assets from Subfolders, it would give out an error
 * == Error is caused by the MV code being unable to parse the "/" sign in strings, when called by editor Command
 * ======== The Solution
 * ==== I re-declare the methods used by MV that parse the name strings, and manually replace the URIencoding it leaves instead of the "/" sign ("%2F") with the "/" sign
 * 
 * 
 * 
 * 
 * ======================================
 * Param Declarations
 * ======================================
 * @param Only load the Main format (no Fallback)
 * @type boolean
 * @on YES
 * @off NO
 * @desc if set to True, only the Main format for each asset type will be loaded.
 * @default false
 * 
 * @param Main picture format
 * @type select
 * @option .png
 * @value .png
 * @option .webp
 * @value .webp
 * @desc Choose the main format to load (the other becomes the Fallback format)
 * @default .png
 * 
 * @param Main audio format
 * @type select
 * @option .ogg
 * @value .ogg
 * @option .mp3
 * @value .mp3
 * @desc Choose the main format to load (the other becomes the Fallback format)
 * @default .ogg
 * 

 * 
 * 

 * 
 */
//=============================================================================

//=============================================================================
// ======== ImageManager ========
//=============================================================================

// cache for chosen paths by folder+filename
var JakeMSG_extCache = {};

var JakeMSG_pluginName = "JakeMSG_WebpMP3AndSubfoldersInMVCommands";
var JakeMSG_params = PluginManager.parameters(JakeMSG_pluginName) || {};
if (!JakeMSG_params || Object.keys(JakeMSG_params).length === 0) {
    JakeMSG_params = PluginManager.parameters(JakeMSG_pluginName + ".js") || {};
}

// New params (with backward compatibility for old boolean params).
var JakeMSG_onlyMainNoFallback =
    String(JakeMSG_params["Only load the Main format (no Fallback)"] || "false") === "true";

var JakeMSG_oldUseWebp =
    String(JakeMSG_params["Use .webp as the main format (.png becomes the fallback format)"] || "false") === "true";
var JakeMSG_oldUseMp3 =
    String(JakeMSG_params["Use .mp3 as the main format (.ogg becomes the fallback format)"] || "false") === "true";

var JakeMSG_mainPictureFormat = String(JakeMSG_params["Main picture format"] || "").trim().toLowerCase();
if (JakeMSG_mainPictureFormat !== '.png' && JakeMSG_mainPictureFormat !== '.webp') {
    JakeMSG_mainPictureFormat = JakeMSG_oldUseWebp ? '.webp' : '.png';
}

var JakeMSG_mainAudioFormat = String(JakeMSG_params["Main audio format"] || "").trim().toLowerCase();
if (JakeMSG_mainAudioFormat !== '.ogg' && JakeMSG_mainAudioFormat !== '.mp3') {
    JakeMSG_mainAudioFormat = JakeMSG_oldUseMp3 ? '.mp3' : '.ogg';
}

function JakeMSG_primaryImageExt() {
    return JakeMSG_mainPictureFormat;
}

function JakeMSG_fallbackImageExt() {
    return JakeMSG_mainPictureFormat === '.webp' ? '.png' : '.webp';
}

// Helper: synchronously check if a URL exists.
// In NW.js, use filesystem checks to avoid loading file content just to test existence.
var JakeMSG_fs = null;
var JakeMSG_path = null;
try {
    if (typeof require === 'function') {
        JakeMSG_fs = require('fs');
        JakeMSG_path = require('path');
    }
} catch (e) {
    JakeMSG_fs = null;
    JakeMSG_path = null;
}

function JakeMSG_urlToFsPath(url) {
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
    if (JakeMSG_path && typeof process !== 'undefined' && process.cwd) {
        return JakeMSG_path.join(process.cwd(), clean.split('/').join(JakeMSG_path.sep));
    }
    return clean;
}

function JakeMSG_urlExists(url) {
    if (JakeMSG_fs && JakeMSG_path) {
        try {
            return JakeMSG_fs.existsSync(JakeMSG_urlToFsPath(url));
        } catch (e) {
        }
    }
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, false);
        xhr.send(null);
        if (xhr.status === 405 || xhr.status === 0) {
            // Fallback for environments that do not support HEAD.
            xhr.open('GET', url, false);
            xhr.send(null);
        }
        return xhr.status === 200 || xhr.status === 0;
    } catch (e) {
        return false;
    }
}

// choose and cache the correct path (checks both extensions once)
function JakeMSG_choosePath(folder, filename, primaryExt, fallbackExt) {
    var key = 'img|' + folder + '|' + filename + '|' + primaryExt + '|' + fallbackExt + '|' + (JakeMSG_onlyMainNoFallback ? 'mainOnly' : 'withFallback');
    var cached = JakeMSG_extCache[key];
    if (cached) {
        return cached;
    }
    // Use Utils.encodeURI when available (MZ) since it handles slashes automatically
    var encodedName = (typeof Utils !== 'undefined' && typeof Utils.encodeURI === 'function') ?
        Utils.encodeURI(filename) :
        encodeURIComponent(filename);
    var path1 = folder + encodedName + primaryExt;
    if (JakeMSG_isMV) {
        path1 = path1.split('%2F').join('/');
    }
    var chosen = path1;
    if (!JakeMSG_onlyMainNoFallback) {
        var path2 = folder + encodedName + fallbackExt;
        if (JakeMSG_isMV) {
            path2 = path2.split('%2F').join('/');
        }
        if (!JakeMSG_urlExists(path1) && JakeMSG_urlExists(path2)) {
            chosen = path2;
        }
    }
    JakeMSG_extCache[key] = chosen;
    return chosen;
}

function JakeMSG_chooseAudioPath(folder, filename, primaryExt, fallbackExt) {
    var key = 'aud|' + folder + '|' + filename + '|' + primaryExt + '|' + fallbackExt + '|' + (JakeMSG_onlyMainNoFallback ? 'mainOnly' : 'withFallback');
    var cached = JakeMSG_extCache[key];
    if (cached) {
        return cached;
    }
    var encodedName = (typeof Utils !== 'undefined' && typeof Utils.encodeURI === 'function') ?
        Utils.encodeURI(filename) :
        encodeURIComponent(filename);
    var normalizedFolder = folder;
    if (normalizedFolder.charAt(normalizedFolder.length - 1) !== '/') {
        normalizedFolder += '/';
    }
    var path1 = AudioManager._path + normalizedFolder + encodedName + primaryExt;
    if (JakeMSG_isMV) {
        path1 = path1.split('%2F').join('/');
    }
    var chosen = path1;
    if (!JakeMSG_onlyMainNoFallback) {
        var path2 = AudioManager._path + normalizedFolder + encodedName + fallbackExt;
        if (JakeMSG_isMV) {
            path2 = path2.split('%2F').join('/');
        }
        if (!JakeMSG_urlExists(path1) && JakeMSG_urlExists(path2)) {
            chosen = path2;
        }
    }
    JakeMSG_extCache[key] = chosen;
    return chosen;
}

function JakeMSG_primaryAudioExt() {
    return JakeMSG_mainAudioFormat;
}

function JakeMSG_fallbackAudioExt() {
    return JakeMSG_mainAudioFormat === '.mp3' ? '.ogg' : '.mp3';
}


// ======== Method Re-initialization
ImageManager.requestBitmap = function(folder, filename, hue, smooth) {
    // MZ does not normally use requestBitmap; just call loadBitmap instead
    if (!JakeMSG_isMV) {
        return this.loadBitmap(folder, filename, hue, smooth);
    }
    if (filename) {
        var chosenPath = JakeMSG_choosePath(
            folder,
            filename,
            JakeMSG_primaryImageExt(),
            JakeMSG_fallbackImageExt()
        );
        var bitmap = this.requestNormalBitmap(chosenPath, hue || 0);
        bitmap.smooth = smooth;
        return bitmap;
    } else {
        return this.loadEmptyBitmap();
    }
};

// ======== Method Re-initialization
ImageManager.reserveBitmap = function(folder, filename, hue, smooth, reservationId) {
    // MZ does not have reservations; just delegate to loadBitmap so it works harmlessly
    if (!JakeMSG_isMV) {
        return this.loadBitmap(folder, filename, hue, smooth);
    }
    if (filename) {
        var chosenPath = JakeMSG_choosePath(
            folder,
            filename,
            JakeMSG_primaryImageExt(),
            JakeMSG_fallbackImageExt()
        );
        var bitmap = this.reserveNormalBitmap(chosenPath, hue || 0, reservationId || this._defaultReservationId);
        bitmap.smooth = smooth;
        return bitmap;
    } else {
        return this.loadEmptyBitmap();
    }
};

// ======== Method Re-initialization
ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
    if (!filename) {
        // MZ stores an empty bitmap property, MV uses method
        return (this.loadEmptyBitmap ? this.loadEmptyBitmap() : this._emptyBitmap);
    }
    var chosenPath = JakeMSG_choosePath(
        folder,
        filename,
        JakeMSG_primaryImageExt(),
        JakeMSG_fallbackImageExt()
    );
    if (JakeMSG_isMV) {
        var bitmap = this.loadNormalBitmap(chosenPath, hue || 0);
        bitmap.smooth = smooth;
        return bitmap;
    } else {
        // MZ uses loadBitmapFromUrl and has no hue/smooth parameters
        return this.loadBitmapFromUrl(chosenPath);
    }
};




//=============================================================================
// ======== Graphics ========
//=============================================================================

// ======== Method Alias-ing
var JakeMSG_Graphics_setLoadingImage = Graphics.setLoadingImage;
Graphics.setLoadingImage = function(src) {
    // Try preferred extension first, then fallback to the other extension if loading fails
    var extPref = JakeMSG_primaryImageExt();
    var extAlt = JakeMSG_fallbackImageExt();
    var m = String(src).match(/^(.*)\.(png|webp)$/i);
    if (m) {
        var base = m[1];
        var key = 'gfx|' + base + '|' + extPref + '|' + extAlt + '|' + (JakeMSG_onlyMainNoFallback ? 'mainOnly' : 'withFallback');
        // check cache first
        var chosen = JakeMSG_extCache[key];
        if (!chosen) {
            var primary = base + extPref;
            if (JakeMSG_onlyMainNoFallback || JakeMSG_urlExists(primary)) {
                chosen = primary;
            } else {
                var alt = base + extAlt;
                chosen = JakeMSG_urlExists(alt) ? alt : primary;
            }
            JakeMSG_extCache[key] = chosen;
        }
        JakeMSG_Graphics_setLoadingImage.call(Graphics, chosen);
    } else {
        JakeMSG_Graphics_setLoadingImage.call(this, src);
    }
};




//=============================================================================
// ======== AudioManager ========
//=============================================================================

AudioManager.audioFileExt = function() {
    return JakeMSG_primaryAudioExt();
};

AudioManager.playEncryptedBgm = function(bgm, pos) {
    var url = JakeMSG_chooseAudioPath('bgm', bgm.name, JakeMSG_primaryAudioExt(), JakeMSG_fallbackAudioExt());
    url = Decrypter.extToEncryptExt(url);
    Decrypter.decryptHTML5Audio(url, bgm, pos);
};

AudioManager.createBuffer = function(folder, name) {
    var url = JakeMSG_chooseAudioPath(folder, name, JakeMSG_primaryAudioExt(), JakeMSG_fallbackAudioExt());
    if (JakeMSG_isMV) {
        // MV-only behavior including slash fix and Html5Audio logic
        if (this.shouldUseHtml5Audio && this.shouldUseHtml5Audio() && folder === 'bgm') {
            if (this._blobUrl) Html5Audio.setup(this._blobUrl);
            else Html5Audio.setup(url);
            return Html5Audio;
        } else {
            return new WebAudio(url);
        }
    } else {
        // MZ: url already selected with primary/fallback logic
        const buffer = new WebAudio(url);
        buffer.name = name;
        buffer.frameCount = Graphics.frameCount;
        return buffer;
    }
};




//=============================================================================
// End of File
//=============================================================================
