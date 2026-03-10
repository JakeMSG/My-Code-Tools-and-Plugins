//=============================================================================
// JakeMSG_EasierScriptCallsMVMZ
// JakeMSG_EasierScriptCallsMVMZ.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_EasierScriptCallsMVMZ = true;


//=============================================================================
 /*:
 * @plugindesc Easier Script Calls for MV&MZ (method wrappers to make Script Calls 
 * easier to use)
 * @author JakeMSG
 * v1.1
 * 
============ Change Log ============
1.1 - 2.15th.2026
 * Added the Script call for Plugin Commands (useful when using the MZ editor for an MV project)
1.0 - 2.13th.2026
 * initial release
================================
 *
 * @help
 * ======================== Initial Explanations
 * ======== General
 * ==== These Method Wrappers are made to use Script Calls for easier Asset (Audio/Visual) Manipulation
 * ==== For each of these Methods, all parameters have Default Values
 * == Meaning that you can leave those parameters empty/unspecified, to automatically use their default values
 * = This can mean you can have way shorter script calls, if you only modify 1-2 parameters!
 * ==== For Methods that Add (to an existing value), if you specify a negative value, it will Subtract instead
 * ==== Keep in mind, for any Asset Name, you can instead specify a subfolder path to the file (with its name at the end)
 * ======== Root folders used for each Asset type:
 * ====== MV:
 * ==== Visual
 * == Enemy Sprites: "www/img/enemies"
 * == Pictures: "www/img/pictures"
 * ==== Animated
 * == Animations: "www/img/animations"
 * == Movies: "www/movies"
 * ==== Audio
 * == BGM: "www/audio/bgm"
 * == BGS: "www/audio/bgs"
 * == ME: "www/audio/me"
 * == SE: "www/audio/se"
 * ====== MZ:
 * ==== Visual
 * == Enemy Sprites: "img/enemies"
 * == Pictures: "img/pictures"
 * ==== Animated
 * == Animations: "effects"
 * == Movies: "movies"
 * ==== Audio
 * == BGM: "audio/bgm"
 * == BGS: "audio/bgs"
 * == ME: "audio/me"
 * == SE: "audio/se"
 * ======================== Examples of Method usage
 * ======== Full usage of all parameters
 * picChange("Ariel", 1, 0, 0, 0, 100, 100, 255, 0)
 * ======== Partial usage of parameters (empty in the middle)
 * picChange("Ariel", 1, 0, , , , 150, 150, 0)
 * ======== Omitting unused parameters at the end
 * picChange("Ariel", 1)
 * ======== Using Subfolders
 * picChange("Ariel/Standing/Default", 1)
 * 
 * 
 * ======================== The Methods
 * ==================== Functions
 * ================ Plugin Commands
 * ======== Useful if you need to to editing of an MV project in the MZ editor, but can't use the MV Plugin Commands there
 * plugCall(pluginCommands="")
 * 
 * pluginCommands = The string containing the commands you'd normally put into the Plugin Command instruction
 * 
 * ======== If you need to use quotes within a plugin command, instead you can use single quotes for the same effect, and to remain compatible with this script call.
 * 
 * 
 * 
 * ==================== Visual
 * ================ Pictures
 * - Keep in mind, while Picture methods are universal for Map and Battle usage, the Pictures used for each are separate
 * (Pic ID 1 on Map is separate from Pic ID 1 during Battle)
 * - Also, Pics used during Battle are reset on each Battle Start
 * 
 * ============ Show
 * picChange(picName="", picID=1, origin=0, x=0, y=0, scaleX=100, scaleY=100, opacity=255, blendMode=0)
 * 
 * picName = Name of the Pic (leave blank to erase picture)
 * picID = ID of the Picture to modify
 * origin = 0 (X&Y anchor is to the Upper-Left) or 1 (Centered on X&Y anchor) 
 * x/y = The coordinates of the X&Y anchor
 * scaleX/scaleY = scaling, in percentage, on the X/Y axis
 * opacity = Opacity (255 = Solid; 0 = Completely Transparent)
 * blendMode = 0 (Normal), 1 (Additive), 2 (Multiply), or 3 (Screen)
 *
 * 
 * ============ Move
 * picMove(picID=1, origin=0, x=0, y=0, frames=0, scaleX=100, scaleY=100, opacity=255, blendMode=0, easing=0)
 * 
 * picID = ID of the Picture to modify
 * origin = 0 (X&Y anchor is to the Upper-Left) or 1 (Centered on X&Y anchor) 
 * x/y = The coordinates of the X&Y anchor
 * frames = Duration, in frames, of the Movement 
 * scaleX/scaleY = scaling, in percentage, on the X/Y axis
 * opacity = Opacity (255 = Solid; 0 = Completely Transparent)
 * blendMode = 0 (Normal), 1 (Additive), 2 (Multiply), or 3 (Screen)
 * easing [MZ only, ignored in MV] = 1 (Slow start), 2 (Slow end), 3 (Slow start & end), any other value (No Easing)
 * 
 * 
 * ============ Rotate (starts moving by speed)
 * picRotate(picID=1, speed=0)
 * 
 * picID = ID of the Picture to modify
 * speed = Speed to set the Picture to Rotate (clockwise if Positive, counter-Clockwise if Negative), the rotation
 *         being (speed/2) degrees per frame (0 means no rotation / Stop rotation)
 * 
 * 
 * ============ Add Angle (adds to the current angle)
 * picAddAngle(index=1, angle=0)
 * 
 * picID = ID of the Picture to modify
 * angle = Adds to the current angle (turns around the X&Y anchor point; clockwise if Positive, counter-Clockwise if Negative)
 * 
 * ============ Set Angle (sets the angle)
 * picSetAngle(index=1, angle=0)
 * 
 * picID = ID of the Picture to modify
 * angle = Sets the current angle (turns around the X&Y anchor point; clockwise if Positive, counter-Clockwise if Negative)
 * 
 * 
 * 
 * 
 * ================ Enemy Sprites
 * ============ Change Enemy Troop's picture (without switching to another Enemy entry)
 * ==== Warning: Will change the Enemy entry's picture for the rest of the game's runtime!
 * == Recommended: Reset this back to the default picture after the battle
 * troopChangePic(picName = "",troopID = 0)
 *
 * picName = Name of the Pic to change to (leave blank to erase picture)
 * troopID = ID if the Troop member whose Enemy entry is to be changed
 * 
 * 
 * ============ Change Enemy entry picture
 * ==== Warning: Will change the Enemy entry's picture for the rest of the game's runtime!
 * == Recommended: Reset this back to the default picture after the battle
 * enemyChangePic(picName = "",enemyID = 0)
 *
 * picName = Name of the Pic to change to (leave blank to erase picture)
 * enemyID = ID if the Enemy entry to be changed
 * 
 * 
 * 
 * 
 * ==================== Animated
 * ================ Animations
 * ============ Show Animation
 * animShow(eventOrTroopID = -1, animID = 1, mirror = false, wait = false, delay = 0)
 * 
 * eventOrTroopID = On Map => ID if the Map Event to show the Animation on (-1 = Player; 1+ = EventID)
 *                  In Battle => ID if the Troop member whose Enemy entry is to be changed 
 * animID = ID if the Animation to show
 * mirror [Ignored only on Map in MV] = Whether to mirror the animation (False = not mirrored (default); True = mirrored)
 * wait [Map only, ignored in Battle] = Whether to wait for the animation to finish (False = don't wait; True = wait)
 * delay [Battle only, ignored on Map] [MV only, ignored in MZ] = The delay, in frames, before the animation is shown
 * 
 *
 * 
 * 
 * ================ Movies
 * ============ Show Movie
 * movieShow(movieName)
 * 
 * movieName = Name of the Movie to show (leave blank for Nothing) 
 * 
 * 
 * 
 * 
 * ==================== Audio
 * ================ Bgm
 * ============ Play Bgm
 * bgmPlay(bgmName = "", volume = 100, pitch = 100, pan = 0)
 * 
 * bgmName = Name of the Bgm to play (leaving Blank does Nothing)
 * volume = Volume, in percentage, to play the audio at (Default = 100)
 * pitch = Pitch, in parcentage, to play the audio at (Default = 100)
 * pan = The panning of the audio, to be heard from left to right (Between -100 and 100) (Default = 0; Leftmost = -100; Rightmost = 100)
 * 
 * 
 * ================ Bgs
 * ============ Play Bgs
 * bgsPlay(bgsName = "", volume = 100, pitch = 100, pan = 0)
 * 
 * bgsName = Name of the Bgs to play (leaving Blank does Nothing)
 * volume = Volume, in percentage, to play the audio at (Default = 100)
 * pitch = Pitch, in parcentage, to play the audio at (Default = 100)
 * pan = The panning of the audio, to be heard from left, middle, right, or in between (Between -100 and 100) (Default = 0; Leftmost = -100; Rightmost = 100)
 * 
 * 
 * ================ Me
 * ============ Play Me
 * mePlay(meName = "", volume = 100, pitch = 100, pan = 0)
 * 
 * meName = Name of the Me to play (leaving Blank does Nothing)
 * volume = Volume, in percentage, to play the audio at (Default = 100)
 * pitch = Pitch, in parcentage, to play the audio at (Default = 100)
 * pan = The panning of the audio, to be heard from left, middle, right, or in between (Between -100 and 100) (Default = 0; Leftmost = -100; Rightmost = 100)
 * 
 * 
 * ================ Se
 * ============ Play Bgs
 * sePlay(seName = "", volume = 100, pitch = 100, pan = 0) 
 * 
 * seName = Name of the Se to play (leaving Blank does Nothing)
 * volume = Volume, in percentage, to play the audio at (Default = 100)
 * pitch = Pitch, in parcentage, to play the audio at (Default = 100)
 * pan = The panning of the audio, to be heard from left, middle, right, or in between (Between -100 and 100) (Default = 0; Leftmost = -100; Rightmost = 100)
 * 
 */
//=============================================================================


//=============================================================================
// ======== GLOBAL ========
//=============================================================================

// ================================================ Functions
// ================================ Plugin Commands
var plugCall = function() {
    if (arguments[0]){
        var args = arguments[0].split(" ");
        var command = args.shift();
    } else {
        var args = "";
        var commands = "";
    }
    if ($gameParty.inBattle()) { // In Battle (relevant for choosing which Interpreter to use)
        $gameTroop._interpreter.pluginCommand(command, args);
    } else { // On Map (relevant for choosing which Interpreter to use)
        $gameMap._interpreter.pluginCommand(command, args);
    }
}




// ================================================ Visual
// ================================ Pictures
// ================ Show (/Remove (by leaving the picName blank) )
var picChange = function(picName="", picID=1, origin=0, x=0, y=0, scaleX=100, scaleY=100, opacity=255, blendMode=0) {
    $gameScreen.showPicture(picID, picName, origin, x, y, scaleX, scaleY, opacity, blendMode);
}

// ================ Move
var picMove = function(picID=1, origin=0, x=0, y=0, scaleX=100, scaleY=100, opacity=255, blendMode=0, frames=0, easing=0) {
    if (Utils.RPGMAKER_NAME === 'MZ') {
        $gameScreen.movePicture(picID, origin, x, y, scaleX, scaleY, opacity, blendMode, frames, easing);
    } else { // 'MV'
        $gameScreen.movePicture(picID, origin, x, y, scaleX, scaleY, opacity, blendMode, frames);
    }
}

// ================ Rotate (starts moving by speed)
var picRotate = function(picID=1, speed=0) {
    $gameScreen.rotatePicture(picID, speed);
}

// ================ Add Angle (adds to the current angle)
var picAddAngle = function(picID=1, angle=0) {
    $gameScreen.picture(picID)._angle += angle;
}

// ================ Set Angle (sets the angle)
var picSetAngle = function(picID=1, angle=0) {
    $gameScreen.picture(picID)._angle = angle;
}


// ================================ Enemy Sprites
var troopChangePic = function(picName = "", troopID = 0) {
    thisEnemyID = $gameTroop.members()[troopID].enemyId();
    $dataEnemies[thisEnemyID].battlerName = picName;
    $gameTroop.members()[troopID].transform(thisEnemyID);
    $gameTroop.makeUniqueNames();
}
var enemyChangePic = function(picName = "", enemyID = 0) {
    $dataEnemies[enemyID].battlerName = picName;
    $gameTroop.makeUniqueNames();
}




// ================================================ Animated
// ================================ Animations
// ================ Show Animation
var animShow = function(eventOrTroopID = -1, animID = 1, mirror = false, wait = false, delay = 0) {
    if ($gameParty.inBattle()) { // In Battle (relevant for choosing which Interpreter to use)
        if (Utils.RPGMAKER_NAME === 'MZ') {
            $gameTemp.requestAnimation([$gameTroop.members()[eventOrTroopID]], animID, mirror);
        } else { // 'MV'
            $gameTroop.members()[eventOrTroopID].startAnimation(animID, mirror, delay);
        }
    } else { // On Map (relevant for choosing which Interpreter to use)
        if (Utils.RPGMAKER_NAME === 'MZ') {
            $gameTemp.requestAnimation([$gameMap._interpreter.character($gameMap._interpreter._characterId = eventOrTroopID)], animID, mirror);
        } else { // 'MV'
            if (eventOrTroopID == -1){
                $gameMap._interpreter._character = $gamePlayer;
            } else {
                $gameMap._interpreter._character = $gameMap.event(eventOrTroopID);
            }
            $gameMap._interpreter._character.requestAnimation(animID);
        }
        if (wait){
            $gameMap._interpreter.setWaitMode("animation");
        }
    }


}




// ================================ Movies
// ================ Show Movie
var movieShow = function(movieName = "") {
    if (Utils.RPGMAKER_NAME === 'MZ') {
        if ($gameParty.inBattle()) { // In Battle (relevant for choosing which Interpreter to use)
            $gameTroop._interpreter.command261([movieName]);
        } else { // On Map (relevant for choosing which Interpreter to use)
            $gameMap._interpreter.command261([movieName]);
        }
    } else { // 'MV'
        if ($gameParty.inBattle()) { // In Battle (relevant for choosing which Interpreter to use)
            $gameTroop._interpreter._params = [movieName];
            $gameTroop._interpreter.command261();
        } else { // On Map (relevant for choosing which Interpreter to use)
            $gameMap._interpreter._params = [movieName];
            $gameMap._interpreter.command261();
        }
    }

}




// ================================================ Audio
// ================================ Bgm
// ================ Play Bgm
var bgmPlay = function(bgmName = "", volume = 100, pitch = 100, pan = 0) {
    AudioManager.playBgm({ name: bgmName, volume: volume, pitch: pitch, pan: pan});
}

// ================================ Bgs
// ================ Play Bgs
var bgsPlay = function(bgsName = "", volume = 100, pitch = 100, pan = 0) {
    AudioManager.playBgs({ name: bgsName, volume: volume, pitch: pitch, pan: pan});
}

// ================================ Me
// ================ Play Me
var mePlay = function(meName = "", volume = 100, pitch = 100, pan = 0) {
    AudioManager.playMe({ name: meName, volume: volume, pitch: pitch, pan: pan});
}

// ================================ Se
// ================ Play Bgs
var sePlay = function(seName = "", volume = 100, pitch = 100, pan = 0) {
    AudioManager.playSe({ name: seName, volume: volume, pitch: pitch, pan: pan});
}




//=============================================================================
// End of File
//=============================================================================
