//=============================================================================
// JakeMSG_WebpAndSubfoldersInMVCommands (MV & MZ compatible)
// JakeMSG_WebpAndSubfoldersInMVCommands.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_WebpAndSubfoldersInMVCommands = true;

// engine detection helpers
var JakeMSG_isMV = (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME === 'MV');
var JakeMSG_isMZ = (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME === 'MZ');


//=============================================================================
 /*:
 * @plugindesc (MV & MZ) Makes both .webp and .png assets possible to load!
 * Also adds, for MV, the possibility for Commands in the editor to read names 
 * that contain subfolders (the "/" sign) (Will still require first opening
 * the project in MZ to set the Assets from the Subfolders!)
 * @author JakeMSG
 * v1.1 (added MZ compatibility, MV fix conditional)
 *
 ============ Change Log ============
1.1 - 2.25th.2026
* (added MZ compatibility, MV fix conditional)
1.0 - 2.17th.2026
* initial release
================================
 *
 * @help
 * ======================== New Feature
 * ======== Allows for loading both .webp and .png assets at once
 * ==== Added Parameter that specifies if .webp should be the main format to load (with .png as a fallback) or not
 * 
 * ======================== How to Use
 * ==== 1. Add this plugin to your list of plugins
 * ==== 2. (MV only) Open the same project in the MZ editor to enable subfolder assets support by copying a "game.rmmzproject" file from any MZ project, and paste it next to your "Game.rpgproject" file from your MV project.
 * ===== For MZ projects you don't need the above step; the plugin works immediately and MZ already handles slashes.
 * ==== 3. After you do all your needed modifications, Save, then load the Project back in MV to Save again in the normal MV format
 * ==== 4. Open the game, and it should work now!
 * ======== If you, instead, want to use Compressed images (.webp) instead of the normal ".png" ones, set in the Parameter
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
 * 
 * 
 * 
 * 
 * ======================================
 * Param Declarations
 * ======================================
 * @param Use .webp as the main format (.png becomes the fallback format)
 * @text Use .webp as the main format (.png becomes the fallback format)
 * @type boolean
 * @on YES
 * @off NO
 * @desc If True, makes the editor use .webp images instead of .png
 * NO - false     YES - true
 * @default false
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

// compute once whether to prefer webp
var JakeMSG_useWebp = !!eval(PluginManager.parameters("JakeMSG_WebpAndSubfoldersInMVCommands")["Use .webp as the main format (.png becomes the fallback format)"]);

// Helper: synchronously check if a URL exists (works for local files / nwjs)
function JakeMSG_urlExists(url) {
    try {
        var xhr = new XMLHttpRequest();
        // Use GET because some environments don't support HEAD for local files
        xhr.open('GET', url, false);
        xhr.send(null);
        return xhr.status === 200 || xhr.status === 0;
    } catch (e) {
        return false;
    }
}

// choose and cache the correct path (checks both extensions once)
function JakeMSG_choosePath(folder, filename, ext1, ext2) {
    var key = folder + '|' + filename;
    var cached = JakeMSG_extCache[key];
    if (cached) {
        return cached;
    }
    // Use Utils.encodeURI when available (MZ) since it handles slashes automatically
    var encodedName = (typeof Utils !== 'undefined' && typeof Utils.encodeURI === 'function') ?
        Utils.encodeURI(filename) :
        encodeURIComponent(filename);
    var path1 = folder + encodedName + ext1;
    if (JakeMSG_isMV) {
        path1 = path1.split('%2F').join('/');
    }
    var path2 = folder + encodedName + ext2;
    if (JakeMSG_isMV) {
        path2 = path2.split('%2F').join('/');
    }
    var chosen = path1;
    if (!JakeMSG_urlExists(path1) && JakeMSG_urlExists(path2)) {
        chosen = path2;
    }
    JakeMSG_extCache[key] = chosen;
    return chosen;
}


// ======== Method Re-initialization
ImageManager.requestBitmap = function(folder, filename, hue, smooth) {
    // MZ does not normally use requestBitmap; just call loadBitmap instead
    if (!JakeMSG_isMV) {
        return this.loadBitmap(folder, filename, hue, smooth);
    }
    if (filename) {
        // ==== Replaces the extension to .webp if Parameter for it is True
        if (JakeMSG_useWebp) var ext1 = ".webp", ext2 = ".png";
        else var ext1 = ".png", ext2 = ".webp";
        // determine the correct path once and cache it
        var chosenPath = JakeMSG_choosePath(folder, filename, ext1, ext2);
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
        // ==== Replaces the extension to .webp if Parameter for it is True
        if (JakeMSG_useWebp) var ext1 = ".webp", ext2 = ".png";
        else var ext1 = ".png", ext2 = ".webp";
        var chosenPath = JakeMSG_choosePath(folder, filename, ext1, ext2);
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
    // ==== Replaces the extension to .webp if Parameter for it is True
    if (JakeMSG_useWebp) var ext1 = ".webp", ext2 = ".png";
    else var ext1 = ".png", ext2 = ".webp";
    var chosenPath = JakeMSG_choosePath(folder, filename, ext1, ext2);
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
JakeMSG_WebpAndSubfoldersInMVCommands_Graphics_setLoadingImage = Graphics.setLoadingImage;
Graphics.setLoadingImage = function(src) {
    // Try preferred extension first, then fallback to the other extension if loading fails
    var extPref = JakeMSG_useWebp ? '.webp' : '.png';
    var extAlt = JakeMSG_useWebp ? '.png' : '.webp';
    var m = String(src).match(/^(.*)\.(png|webp)$/i);
    if (m) {
        var base = m[1];
        var key = 'gfx|' + base;
        // check cache first
        var chosen = JakeMSG_extCache[key];
        if (!chosen) {
            var primary = base + extPref;
            var alt = base + extAlt;
            if (JakeMSG_urlExists(primary)) {
                chosen = primary;
            } else if (JakeMSG_urlExists(alt)) {
                chosen = alt;
            } else {
                chosen = primary; // let Graphics handle error
            }
            JakeMSG_extCache[key] = chosen;
        }
        JakeMSG_WebpAndSubfoldersInMVCommands_Graphics_setLoadingImage.call(Graphics, chosen);
    } else {
        JakeMSG_WebpAndSubfoldersInMVCommands_Graphics_setLoadingImage.call(this, src);
    }
};




//=============================================================================
// ======== AudioManager ========
//=============================================================================

AudioManager.playEncryptedBgm = function(bgm, pos) {
    var ext = this.audioFileExt();
    var nameEnc = (typeof Utils !== 'undefined' && typeof Utils.encodeURI === 'function') ?
        Utils.encodeURI(bgm.name) :
        encodeURIComponent(bgm.name);
    var url = this._path + 'bgm/' + nameEnc + ext;
    if (JakeMSG_isMV) {
        url = url.split('%2F').join('/'); // ==== MV needs slash fix
    }
    url = Decrypter.extToEncryptExt(url);
    Decrypter.decryptHTML5Audio(url, bgm, pos);
};

AudioManager.createBuffer = function(folder, name) {
    var ext = this.audioFileExt();
    var nameEnc = (typeof Utils !== 'undefined' && typeof Utils.encodeURI === 'function') ?
        Utils.encodeURI(name) :
        encodeURIComponent(name);
    // choose folder concatenation style depending on engine
    var url;
    if (JakeMSG_isMV) {
        url = this._path + folder + '/' + nameEnc + ext;
        // MV-only behavior including slash fix and Html5Audio logic
        url = url.split('%2F').join('/'); // ==== MV needs slash fix
        if (this.shouldUseHtml5Audio && this.shouldUseHtml5Audio() && folder === 'bgm') {
            if (this._blobUrl) Html5Audio.setup(this._blobUrl);
            else Html5Audio.setup(url);
            return Html5Audio;
        } else {
            return new WebAudio(url);
        }
    } else {
        // MZ: folder typically already ends with '/'
        url = this._path + folder + nameEnc + ext;
        const buffer = new WebAudio(url);
        buffer.name = name;
        buffer.frameCount = Graphics.frameCount;
        return buffer;
    }
};




//=============================================================================
// End of File
//=============================================================================
