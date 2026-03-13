//=============================================================================
// JakeMSG - Skip Movies (MV)
//=============================================================================
/*:
 * @target MV
 * @plugindesc Adds the possibility to skip videos (Movie files) by pressing a key.
 * @author JakeMSG
 *
 * @help JakeMSG_SkipMoviesMV.js
 *
 * Currently, the keys used for Skipping videos are "X" and "Escape". You can change these to any key you prefer by 
 * modifying the condition in the _onKeyDown function. The plugin listens for keydown events while a video is playing, 
 * and if the specified key is pressed, it stops the video immediately.
 *
 * It does not provide plugin commands.
 */
//=============================================================================

/**
 * Stops the currently playing video and restores the game canvas visibility.
 * @static
 * @method _stopVideo
 * @private
 */
Graphics._stopVideo = function() {
    if (this._video && this._isVideoVisible()) {
        this._video.pause();
        this._video.currentTime = 0;
        this._updateVisibility(false);
        this._videoLoading = false;
    }
};

/**
 * Store the original _onKeyDown method
 */
var _Graphics_onKeyDown = Graphics._onKeyDown;
/**
 * Override _onKeyDown to handle video skipping
 * @static
 * @method _onKeyDown
 * @param {KeyboardEvent} event
 * @private
 */
Graphics._onKeyDown = function(event) {
    // Check if a video is currently playing
    if (this.isVideoPlaying()) {
        // Key codes: 27 = Escape, 88 = X, 32 = Space (optional)
        if (event.keyCode === 27 || event.keyCode === 88) { // Here's where you can choose which key to use for skipping   
            event.preventDefault();
            this._stopVideo();
            return;
        }
    }
    
    // Call the original _onKeyDown for other functionality
    _Graphics_onKeyDown.call(this, event);
};
