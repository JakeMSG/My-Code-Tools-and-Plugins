//=============================================================================
// JakeMSG - Skip Movies (MZ)
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Adds the possibility to skip videos (Movie files) by pressing a key.
 * @author JakeMSG
 *
 * @help JakeMSG_SkipMoviesMZ.js
 *
 * Currently, the keys used for Skipping videos are "X" and "Escape". You can change these to any key you prefer by 
 * modifying the condition in the _onKeyDown function. The plugin listens for keydown events while a video is playing, 
 * and if the specified key is pressed, it stops the video immediately. Additionally, it keeps track of the last key 
 * pressed, which can be accessed through the getLastKeyPressed method if needed for other functionalities.
 *
 * It does not provide plugin commands.
 */
//=============================================================================

var _JakeMSG_Video_initialize = Video.initialize;
Video.initialize = function(width, height) {
    _JakeMSG_Video_initialize.call(this,width, height);
    this._lastKeyPressed = null;
    this._onKeyDownBound = this._onKeyDown.bind(this);
};

var _JakeMSG_Video_play = Video.play;
Video.play = function(src) {
    _JakeMSG_Video_play.call(this, src);
    document.addEventListener("keydown", this._onKeyDownBound);
};

/**
 * Stops playback of the video and clears it.
 */
Video.stop = function() {
    if (this._element) {
        document.removeEventListener("keydown", this._onKeyDownBound);
        this._element.onloadeddata = null;
        this._element.onerror = null;
        this._element.onended = null;
        this._element.pause();
        this._element.src = "";
        this._loading = false;
        this._updateVisibility(false);
    }
};

var _JakeMSG_Video_onEnd = Video._onEnd;
Video._onEnd = function() {
    _JakeMSG_Video_onEnd.call(this);
    document.removeEventListener("keydown", this._onKeyDownBound);
};

Video._onKeyDown = function(event) {
    this._lastKeyPressed = event.key;
    console.log(`Key pressed: ${event.key}`);
    if (event.key.toLowerCase() === "x" || event.key === "Escape") { // Here's where you can choose which key to use for skipping   
        Video.stop();
        console.log("Video stopped due to key press.");
    }
};

/**
 * Gets the last key that was pressed.
 *
 * @returns {string} The key code or name of the last pressed key.
 */
Video.getLastKeyPressed = function() {
    return this._lastKeyPressed;
};