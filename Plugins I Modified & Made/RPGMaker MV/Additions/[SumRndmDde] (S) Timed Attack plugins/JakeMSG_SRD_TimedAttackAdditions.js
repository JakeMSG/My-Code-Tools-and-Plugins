//=============================================================================
// JakeMSG_SRD_TimedAttackAdditions
// JakeMSG_SRD_TimedAttackAdditions.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_SRD_TimedAttackAdditions = true;


//=============================================================================
 /*:
 * @plugindesc Adds a method to modify TimedAttack properties within the game events
 * @author SumRndmDde+JakeMSG
 *
 * @param Is the Battle Sideview?
 * @desc If set to 'true', visuals of TimedAttacks are shown for the Sideview Battle (how SRD intended the plugins).
 * If set 'false', will instead show at the middle of the screen (to work for non-Sideview and be more visually-pleasing)
 * (This does not affect the Default (Bar) Timed Attack)
 * If Non-sideview, default 0,0 position of the Visuals is the Center of the screen
 * Default, in this plugin, is 'false' (since I don't use Sideview as much)
 * @default false
 *
 *
 * @param Global Non-Sideview X Offset
 * @desc A value added to the X of the "Timed Attack" visuals, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 *
 * @param Global Non-Sideview Y Offset
 * @desc A value added to the Y of the "Timed Attack" visuals, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 * 
 * 
 * @param Global Default (Bar) Non-Sideview X Offset
 * @desc A value added to the X of the "Timed Attack" visuals specific to the Default (Bar) TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 *
 * @param Global Default (Bar) Non-Sideview Y Offset
 * @desc A value added to the Y of the "Timed Attack" visuals specific to the Default (Bar) TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 * 
 * 
 * @param Global Clock Non-Sideview X Offset
 * @desc A value added to the X of the "Timed Attack" visuals specific to the Clock TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 *
 * @param Global Clock Non-Sideview Y Offset
 * @desc A value added to the Y of the "Timed Attack" visuals specific to the Clock TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 * 
 * 
 * @param Global Arrows Non-Sideview X Offset
 * @desc A value added to the X of the "Timed Attack" visuals specific to the Arrows TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 *
 * @param Global Arrows Non-Sideview Y Offset
 * @desc A value added to the Y of the "Timed Attack" visuals specific to the Arrows TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 * 
 * 
 * @param Global Circle Non-Sideview X Offset
 * @desc A value added to the X of the "Timed Attack" visuals specific to the Circle TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 *
 * @param Global Circle Non-Sideview Y Offset
 * @desc A value added to the Y of the "Timed Attack" visuals specific to the Circle TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 * 
 * 
 * @param Global Mash Non-Sideview X Offset
 * @desc A value added to the X of the "Timed Attack" visuals specific to the Mash TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 *
 * @param Global Mash Non-Sideview Y Offset
 * @desc A value added to the Y of the "Timed Attack" visuals specific to the Mash TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 * 
 * 
 * @param Global Wheel Non-Sideview X Offset
 * @desc A value added to the X of the "Timed Attack" visuals specific to the Wheel TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 *
 * @param Global Wheel Non-Sideview Y Offset
 * @desc A value added to the Y of the "Timed Attack" visuals specific to the Wheel TimedAttack, when Non-Sideview (when above parameter is 'false')
 * This can be a Number or JavaScript eval.
 * The Default (0) is the Center of the Screen
 * @default 0
 * 
 * 
 *
 * @help
 * SRD TimedAttack Additions
 * Version 1.0
 * JakeMSG
 * ============================================================================
 * Introduction
 * ============================================================================
 * (This plugin needs to be loaded next to the other TimedAttack ones (preferably below them))
 * 
 * This plugins makes it possible to modify, for already-prepared TimedAttack on data entries, their properties, via a new GameMap method.
 * Compatible with ALL SRD Timed Attack plugins!
 * 
 * Can be used both in and out of Combat.
 * Can also modify multiple properties at once, within the same method (split by ";").
 * 
 * Keep in mind to first prepare the TimedAttack on the data entry of your choice by placing the tags in the Editor first.
 * Also keep in mind this method WON'T be able to change the TimedAttack type (eg: from Default to Clock), you'll still have to use
 * different skills per each TimedAttack type.
 * 
 * 
 * Also adds support (Parameters) for Non-Sideview battles, when it comes to the visuals of the Timed Attacks (which are normally alligned with Sideview characters)
 * On this point, adds Properties for individual visual X&Y offsets for the TimedAttacks (usable by any type of TimedAttacks)
 * 
 * 
 * ==========================================================================
 *  New Parameters
 * ==========================================================================
 * 
 * New Parameters, first to set if Battle system is Sideview or not (to then use the rest of the parameters), 
 * then parameters for the X&Y offsets per Timed Attacks (both all TimedAttacks, and each type separatedly)
 * If Non-sideview, default 0,0 position of the Visuals is the Center of the screen
 * 
 * ==========================================================================
 *  New Properties
 * ==========================================================================
 * 
 * ======== Individual Visual X/Y Offsets (for a specific TimedAttack, instead of for All) 
 * Visual X Offset: (Input a Positive Number or JavaScript Formula)*
 * Visual Y Offset: (Input a Positive Number or JavaScript Formula)*
 * 
 * *The JavaScript Formula can use 'f' to represent "Frame Count".
 * **Leave blank to use rectangle or circle image
 * 
 * ======================================
 * (Java)Script Methods
 * ======================================
 * 
 *   $gameMap.changeTA(objectType, objectID, notesTA)
 * 
 *   objectType = (String) The type of the data entry to change the TimedAttack of (written between quotes) 
 *                Possible values: - "skill" (the most common type to use)
 *                                 - "weapon"
 *                                 - "class"
 *                                 - "armor"
 *   objectID = (Integer) The ID of the data entry to change, from the database (can be seen from the editor)
 *   notesTA = (String) The Property(/ies) to change, written between quotes.
 *             - Should be written exactly as you'd normally write them between the Tags.
 *             - If you write multiple Properties within the same String, make sure to put ";" IMMEDIATELY AFTER each of their Values (unless at the end of the String)
 *               (the ";" sign is essential to delimit the properties' values)
 *               eg: "Speed: 5; Width: 200;Direction:  Left;   Opacity:100"
 *             - If you write the same Property multiple times within the same string, ONLY THE 1ST INSTANCE WILL BE USED
 *             - Invalid text within the String will be ignored (so long as it doesn't get in between the Properties, their values, or the ";" at the end of each Value)
 */
//=============================================================================

// ======== Parameters of the Plugin
    var params = PluginManager.parameters('JakeMSG_SRD_TimedAttackAdditions');
var isSideview = String(params['Is the Battle Sideview?']).trim().toLowerCase() === 'true';
var globalNonSideXOffset = eval(String(params['Global Non-Sideview X Offset']));
var globalNonSideYOffset = eval(String(params['Global Non-Sideview Y Offset']));
var globalNonSideXOffsetBar = eval(String(params['Global Default (Bar) Non-Sideview X Offset']));
var globalNonSideYOffsetBar = eval(String(params['Global Default (Bar) Non-Sideview Y Offset']));
var globalNonSideXOffsetClock = eval(String(params['Global Clock Non-Sideview X Offset']));
var globalNonSideYOffsetClock = eval(String(params['Global Clock Non-Sideview Y Offset']));
var globalNonSideXOffsetArrows = eval(String(params['Global Arrows Non-Sideview X Offset']));
var globalNonSideYOffsetArrows = eval(String(params['Global Arrows Non-Sideview Y Offset']));
var globalNonSideXOffsetCircle = eval(String(params['Global Circle Non-Sideview X Offset']));
var globalNonSideYOffsetCircle = eval(String(params['Global Circle Non-Sideview Y Offset']));
var globalNonSideXOffsetMash = eval(String(params['Global Mash Non-Sideview X Offset']));
var globalNonSideYOffsetMash = eval(String(params['Global Mash Non-Sideview Y Offset']));
var globalNonSideXOffsetWheel = eval(String(params['Global Wheel Non-Sideview X Offset']));
var globalNonSideYOffsetWheel = eval(String(params['Global Wheel Non-Sideview Y Offset']));

//=============================================================================
// Game_Map
//=============================================================================
// ==== This function is copied from the "SRD_TimedAttack" plugins (to be used within this context)
Game_Map.prototype.loadImage = function(file, hue) {
	return ImageManager.loadBitmap('img/SumRndmDde/tas/', file, hue, true);
};


// ================ ChangeTA
// ======== This method Changes the already-specified TimeAttack on given entry (does NOT do anything to unspecified Properties)
// $gameMap.changeTA(objectType, objectID, notesTA)
Game_Map.prototype.changeTA = function(objectType, objectID, notesTA) {
	if (objectType.match(/skill(s)*/im)) {$gameMap.NotesProcChangeTA($dataSkills[objectID].meta["SRD TAS"],notesTA);}
    else if (objectType.match(/weapon(s)*/im)) {$gameMap.NotesProcChangeTA($dataWeapons[objectID].meta["SRD TAS"],notesTA);}
    else if (objectType.match(/class(es)*/im)) {$gameMap.NotesProcChangeTA($dataClasses[objectID].meta["SRD TAS"],notesTA);}
    else if (objectType.match(/actor(s)*/im)) {$gameMap.NotesProcChangeTA($dataActors[objectID].meta["SRD TAS"],notesTA);}
}
// ==== Method used to process the "notesTA" specified to change the properties of the TimeAttack, from the previous method
Game_Map.prototype.NotesProcChangeTA = function(o,notesTA) {
    // ==== Slightly modified the RegEx used to be able to check multiple properties within the same string
	// == Replaced "\s*(.*)/" with "\s*([^;]*|.*$)/"
    // == If using the same property multiple times within the same string (within the same method), ONLY THE FIRST USE WILL TAKE EFFECT

    // ==== "Default" (Bar) TimeAttack - Standard Properties
    if(notesTA.match(/Sound[ ]?Effect:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
    if(notesTA.match(/Cursor[ ]?Image:\s*([^;]*|.*$)/im)) o.image = String(RegExp.$1);
    if(notesTA.match(/Background[ ]?Image:\s*([^;]*|.*$)/im)) o.bi = String(RegExp.$1);
    if(notesTA.match(/Window[ ]?Opacity:\s*([^;]*|.*$)/im)) o.opacity = parseInt(RegExp.$1);
    if(notesTA.match(/Target[ ]?Location:\s*([^;]*|.*$)/im)) o.target = String(RegExp.$1);
    if(notesTA.match(/Repeat[ ]?Type:\s*([^;]*|.*$)/im)) o.rt = String(RegExp.$1).trim().toLowerCase();
    if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) {o.speed = String(RegExp.$1);}
    if(notesTA.match(/Main[ ]?Color:\s*([^;]*|.*$)/im)) o.color = String(RegExp.$1);
    if(notesTA.match(/Shape:\s*([^;]*|.*$)/im)) o.shape = String(RegExp.$1).trim().toLowerCase();
    if(notesTA.match(/Width:\s*([^;]*|.*$)/im)) o.width = parseInt(RegExp.$1);
    if(notesTA.match(/Outline[ ]?Color:\s*([^;]*|.*$)/im)) o.outline = String(RegExp.$1);
    if(notesTA.match(/Outline[ ]?Size:\s*([^;]*|.*$)/im)) o.size = parseInt(RegExp.$1);
    if(notesTA.match(/Direction:\s*([^;]*|.*$)/im)) o.direction = String(RegExp.$1).trim().toLowerCase();
    if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);

    // ==== "Clock" TimeAttack - Unique Properties
    // if(notesTA.match(/Length:\s*([^;]*|.*$)/im)) o.length = parseInt(RegExp.$1);
	if(notesTA.match(/Length:\s*([^;]*|.*$)/im)) o.length = parseInt(RegExp.$1);
    if(notesTA.match(/Height:\s*([^;]*|.*$)/im)) o.height = parseInt(RegExp.$1);
    if(notesTA.match(/Hand\s*Color:\s*([^;]*|.*$)/im)) o.color = String(RegExp.$1);
    if(notesTA.match(/Base\s*Color:\s*([^;]*|.*$)/im)) o.baseColor = String(RegExp.$1);
    if(notesTA.match(/Fade\s*Color:\s*([^;]*|.*$)/im)) o.fadeColor = String(RegExp.$1);
    if(notesTA.match(/Background\s*Color:\s*([^;]*|.*$)/im)) o.backColor = String(RegExp.$1);
    if(notesTA.match(/Outline\s*Width:\s*([^;]*|.*$)/im)) o.outWidth = parseInt(RegExp.$1);
    if(notesTA.match(/Start[ ]?Position:\s*([^;]*|.*$)/im)) o.start = parseInt(RegExp.$1);
    if(notesTA.match(/End[ ]?Position:\s*([^;]*|.*$)/im)) o.finish = parseInt(RegExp.$1);
    if(notesTA.match(/Thickness:\s*([^;]*|.*$)/im)) o.thickness = parseInt(RegExp.$1);
    if(notesTA.match(/Cooldown:\s*([^;]*|.*$)/im)) o.cool = parseInt(RegExp.$1);
    if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);
    if(notesTA.match(/Target[ ]?1:\s*([^;]*|.*$)/im)) o.targets[0] = String(RegExp.$1);
    if(notesTA.match(/Target[ ]?2:\s*([^;]*|.*$)/im)) o.targets[1] = String(RegExp.$1);
    if(notesTA.match(/Target[ ]?3:\s*([^;]*|.*$)/im)) {o.targets[2] = String(RegExp.$1);}
    if(notesTA.match(/Target[ ]?4:\s*([^;]*|.*$)/im)) o.targets[3] = String(RegExp.$1);
    if(notesTA.match(/Target[ ]?5:\s*([^;]*|.*$)/im)) o.targets[4] = String(RegExp.$1);

    // ==== "Arrows" TimeAttack - Unique Properties
	if(notesTA.match(/Normal[ ]?SE:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
	if(notesTA.match(/Miss[ ]?SE:\s*([^;]*|.*$)/im)) o.fse = String(RegExp.$1);
	if(notesTA.match(/Success[ ]?SE:\s*([^;]*|.*$)/im)) o.vse = String(RegExp.$1);
	if(notesTA.match(/Fail[ ]?SE:\s*([^;]*|.*$)/im)) o.f2se = String(RegExp.$1);
	if(notesTA.match(/Phrase:\s*([^;]*|.*$)/im)) o.phrase = String(RegExp.$1);
	if(notesTA.match(/Command[ ]?Amount:\s*([^;]*|.*$)/im)) o.amount = parseInt(RegExp.$1);
	if(notesTA.match(/Randomize[ ]?Commands:\s*([^;]*|.*$)/im)) o.random = String(RegExp.$1);
	if(notesTA.match(/Image:\s*([^;]*|.*$)/im)) o.image = String(RegExp.$1);
	if(notesTA.match(/Frames:\s*([^;]*|.*$)/im)) o.frames = parseInt(RegExp.$1);
	if(notesTA.match(/Penalty:\s*([^;]*|.*$)/im)) o.penatly = parseInt(RegExp.$1);
	if(notesTA.match(/Success[ ]?Power:\s*([^;]*|.*$)/im)) o.successPower = String(RegExp.$1);
	if(notesTA.match(/Fail[ ]?Power:\s*([^;]*|.*$)/im)) o.failPower = String(RegExp.$1);
	if(notesTA.match(/Above[ ]?Height:\s*([^;]*|.*$)/im)) o.aboveHeight = parseInt(RegExp.$1);
	if(notesTA.match(/Animation:\s*([^;]*|.*$)/im)) o.animation = String(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);

	// ==== "Circle" TimeAttack - Unique Properties
	if(notesTA.match(/Sound[ ]?Effect:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
	if(notesTA.match(/Circle[ ]?Image:\s*([^;]*|.*$)/im)) o.image = String(RegExp.$1);
	if(notesTA.match(/Background[ ]?Image:\s*([^;]*|.*$)/im)) o.back = String(RegExp.$1);
	if(notesTA.match(/Repeat[ ]?Type:\s*([^;]*|.*$)/im)) o.rt = String(RegExp.$1).trim().toLowerCase();
	if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) o.speed = String(RegExp.$1);
	if(notesTA.match(/Color:\s*([^;]*|.*$)/im)) o.color = String(RegExp.$1);
	if(notesTA.match(/Initial[ ]?Radius:\s*([^;]*|.*$)/im)) o.radius = parseInt(RegExp.$1);
	if(notesTA.match(/Ring[ ]?Thickness:\s*([^;]*|.*$)/im)) o.thickness = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);
	if(notesTA.match(/Time[ ]?Limit:\s*([^;]*|.*$)/im)) o.timeLimit = parseInt(RegExp.$1);

	// ==== "Mash" TimeAttack - Unique Properties
	if(notesTA.match(/Normal[ ]?SE:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
	if(notesTA.match(/Success[ ]?SE:\s*([^;]*|.*$)/im)) o.vse = String(RegExp.$1);
	if(notesTA.match(/Fail[ ]?SE:\s*([^;]*|.*$)/im)) o.fse = String(RegExp.$1);
	if(notesTA.match(/Phrase:\s*([^;]*|.*$)/im)) o.phrase = String(RegExp.$1);
	if(notesTA.match(/Smooth[ ]?Mode:\s*([^;]*|.*$)/im)) o.mode = String(RegExp.$1).trim().toLowerCase() === 'true';
	if(notesTA.match(/Start[ ]?Amount:\s*([^;]*|.*$)/im)) o.start = String(RegExp.$1);
	if(notesTA.match(/Max[ ]?Amount:\s*([^;]*|.*$)/im)) o.max = String(RegExp.$1);
	if(notesTA.match(/Seconds:\s*([^;]*|.*$)/im)) o.seconds = parseInt(RegExp.$1);
	if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) o.speed = String(RegExp.$1);
	if(notesTA.match(/Tap[ ]?Gain:\s*([^;]*|.*$)/im)) o.tap = String(RegExp.$1);
	if(notesTA.match(/Width:\s*([^;]*|.*$)/im)) o.width = parseInt(RegExp.$1);
	if(notesTA.match(/Height:\s*([^;]*|.*$)/im)) o.height = parseInt(RegExp.$1);
	if(notesTA.match(/Above[ ]?Height:\s*([^;]*|.*$)/im)) o.aboveHeight = parseInt(RegExp.$1);
	if(notesTA.match(/Color[ ]?1:\s*([^;]*|.*$)/im)) o.color1 = String(RegExp.$1);
	if(notesTA.match(/Color[ ]?2:\s*([^;]*|.*$)/im)) o.color2 = String(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);

	// ==== "Wheel" TimeAttack - Unique Properties
	if(notesTA.match(/Normal[ ]?SE:\s*([^;]*|.*$)/im)) o.se = String(RegExp.$1);
	if(notesTA.match(/Miss[ ]?SE:\s*([^;]*|.*$)/im)) o.fse = String(RegExp.$1);
	if(notesTA.match(/Success[ ]?SE:\s*([^;]*|.*$)/im)) o.vse = String(RegExp.$1);
	if(notesTA.match(/Fail[ ]?SE:\s*([^;]*|.*$)/im)) o.f2se = String(RegExp.$1);
	if(notesTA.match(/Command[ ]?Amount:\s*([^;]*|.*$)/im)) o.amount = parseInt(RegExp.$1);
	if(notesTA.match(/Randomize[ ]?Commands:\s*([^;]*|.*$)/im)) o.random = String(RegExp.$1);
	if(notesTA.match(/Button[ ]?Image:\s*([^;]*|.*$)/im)) o.button = String(RegExp.$1);
	if(notesTA.match(/Ring[ ]?Image:\s*([^;]*|.*$)/im)) o.button = String(RegExp.$1);
	if(notesTA.match(/Target[ ]?Image:\s*([^;]*|.*$)/im)) o.button = String(RegExp.$1);
	if(notesTA.match(/Speed:\s*([^;]*|.*$)/im)) o.speed = Number(RegExp.$1);
	if(notesTA.match(/Penalty:\s*([^;]*|.*$)/im)) o.penatly = Number(RegExp.$1);
	if(notesTA.match(/Radius:\s*([^;]*|.*$)/im)) o.radius = parseInt(RegExp.$1);
	if(notesTA.match(/Above[ ]?Height:\s*([^;]*|.*$)/im)) o.aboveHeight = parseInt(RegExp.$1);
	if(notesTA.match(/Animation:\s*([^;]*|.*$)/im)) o.animation = String(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Rate:\s*([^;]*|.*$)/im)) o.flash = parseInt(RegExp.$1);
	if(notesTA.match(/Flash[ ]?Time:\s*([^;]*|.*$)/im)) o.time = parseInt(RegExp.$1);


    // ==== These properties need to be loaded through LoadImage (if they are directly set through the method)
	// == Default (Bar)
    if(o.image) $gameMap.loadImage(o.image);
    if(o.bi) $gameMap.loadImage(o.bi)
    if(o.image.trim().length > 0) o.shape = 'image';
    // == Wheel
	if(o.button) $.loadImage(o.button);
	if(o.ring) $.loadImage(o.ring);
	if(o.target) $.loadImage(o.target);




	// ==== My own added Properties
	// == Individual X/Y Offsets (for specific TimedAttacks, instead of for All)
	if(notesTA.match(/Visual[ ]?X[ ]?Offset:\s*([^;]*|.*$)/im)) {o.visualXOffset = eval(String(RegExp.$1));}
	if(notesTA.match(/Visual[ ]?Y[ ]?Offset:\s*([^;]*|.*$)/im)) {o.visualYOffset = eval(String(RegExp.$1));}
}



// o.type === 'default'
// o.type === 'arrows' || o.type === 'circle' || o.type === 'clock' || o.type === 'mash' || o.type === 'wheel'


// ================ [General] Methods (that Apply for all the other Timed Attacks)
// ======== Adds the new properties to the Notetag Loading
var _JakeMSG_organizeInfo = SRD.TimedAttack.organizeInfo;
SRD.TimedAttack.organizeInfo = function(o) {
	_JakeMSG_organizeInfo.call(this, o);
    if(o.info.match(/Visual[ ]?X[ ]?Offset:\s*(.*)/im)) {o.visualXOffset = eval(String(RegExp.$1));}
	else {o.visualXOffset = 0;}
	if(o.info.match(/Visual[ ]?Y[ ]?Offset:\s*(.*)/im)) {o.visualYOffset = eval(String(RegExp.$1));}
	else {o.visualYOffset = 0;}
};




// ================ Default (Bar) Timed Attack methods
// ======== Does the "insert X&Y position", for the Default (Bar) TimedAttack
// ======== Also Creates the "_"-prefixed variables for use of the "Individual X/Y Offsets" for the other types of Timed Attack
// (For use within the "TimedAttackSystem" scope) 
var _TimedAttackSystem_loadItem = TimedAttackSystem.prototype.loadItem;
TimedAttackSystem.prototype.loadItem = function(item) {
	_TimedAttackSystem_loadItem.call(this, item);
	
	// ==== Creating the Variables for use with the other types of Timed Attack
    this._visualXOffset = item.visualXOffset;
	this._visualYOffset = item.visualYOffset;

    // ==== Re-does the initialization of the X/Y, present in the "createAllWindows" aliased method from the TimedAttackCore plugin,
	// so that uses of multiple consecutive skills don't end up adding up to previous X/Y values, instead of having separate ones
	if(SRD.TimedAttack.xAlign === 'left') this._window.x = 0;
	else if(SRD.TimedAttack.xAlign === 'right') this._window.x = Graphics.width - this._window.width;
	else this._window.x = (Graphics.width/2) - (this._window.width/2); // 'center'
	if(SRD.TimedAttack.yAlign === 'top') this._window.y = 0;
	else if(SRD.TimedAttack.yAlign === 'bottom') this._window.y = Graphics.height - this._window.height;
	else this._window.y = (Graphics.height/2) - (this._window.height/2); // 'center'
    // ==== The Insert for Individual Offsets
	this._window.x += item.visualXOffset;
	this._window.y += item.visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._window.x += globalNonSideXOffset + globalNonSideXOffsetBar;
		this._window.y += globalNonSideYOffset + globalNonSideYOffsetBar;
	}
}




// ================ Circle Timed Attack methods
// ======== Does the "insert X&Y position", for the Circle TimedAttack
// ==== The inserts for Individual Offset are NOT done if it's Sideview, since it doesn't work well with that
// (so only works with my Non-Sideview mode)
var _TimedAttackSystem_playCircleGame = TimedAttackSystem.prototype.playCircleGame;
TimedAttackSystem.prototype.playCircleGame = function() {
	// ==== All the Inserts (done only if Non-Sideview)
	if (!isSideview){
		// == Re-initializes the arrays for X&Y as mono-element, for the Offsets to work properly
        // = First, sets the Default (Offset 0) to the Center of the screen
	    this._x = [(Graphics.width/2)];
	    this._y = [(Graphics.height/2)];
		// = Now, adds the Offsets themselves
		this._x[0] += this._visualXOffset + globalNonSideXOffset + globalNonSideXOffsetCircle;
		this._y[0] += this._visualYOffset + globalNonSideYOffset + globalNonSideYOffsetCircle;
	}

	_TimedAttackSystem_playCircleGame.call(this);
}


// ================ Arrow Timed Attack methods
// ======== Does the "insert X&Y position", for the Arrows TimedAttack
var _TimedAttackSystem_drawArrowGame = TimedAttackSystem.prototype.drawArrowGame;
TimedAttackSystem.prototype.drawArrowGame = function() {
	// ==== First, sets the Default (Offset 0) to the Center of the screen
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
    // ==== The Insert for Individual Offsets
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetArrows;
		this._y += globalNonSideYOffset + globalNonSideYOffsetArrows;
	}

	_TimedAttackSystem_drawArrowGame.call(this);
};




// ================ Clock Timed Attack methods
// ======== Does the "insert X&Y position", for the Clock TimedAttack
// ==== Have to replace the whole method since the "this._x" and "this._y" are used in the middle
TimedAttackSystem.prototype.playClockGame = function() {
	//Movement
	if(this._notPressed) {
		var f = this._frame;
		this._xPosition += Number(eval(this._item.speed) * this._mul);
		if(this._xPosition <= this._startRadius || this._xPosition >= this._endRadius) {
			if(this._rt === 'repeat') {
				this._xPosition = this._startRadius;
			} else if(this._rt === 'reverse') {
				this._mul *= (-1);
			} else {
				this.setPower(0);
				this._flashTime = this._time;
				this._notPressed = false;
			}
		}
	} else {
		this._flashTime++;
	}

	//Draw
	// ======== This is where we insert the X&Y position 
	// ==== First, sets the Default (Offset 0) to the Center of the screen
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
	// ==== The Insert for Individual Offsets
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetClock;
		this._y += globalNonSideYOffset + globalNonSideYOffsetClock;
	}

	this._content.bitmap.clear();
	if(this._image.trim().length > 0 && this._xPosition > 0) {
		var bitmap = SRD.TimedAttack.loadImage(this._image);
		this._content.bitmap.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 
			this._x - (bitmap.width/2), this._y - (bitmap.height/2));
	} else {
		this._content.bitmap.drawCircle(this._x, this._y, this._length + this._outWidth, this._outColor);
		this._content.bitmap.drawCircle(this._x, this._y, this._length, this._backColor);
	}
	for(var i = 0; i < this._targets.length; i++) {
		this._content.bitmap.drawPizzaSlice(this._x, this._y, this._length, this._targets[i][0] * (Math.PI / 180), this._targets[i][1] * (Math.PI / 180), this._targets[i][2]);
	}
	if(this._flashTime % this._flash < Math.floor(this._flash / 2)) {
		this._content.bitmap.drawHand(this._x, this._y, this._xPosition, this._length, this._thickness, this._color);
		for(var i = 0; i < this._setTargets.length; i++) {
			this._content.bitmap.drawHand(this._x, this._y, this._setTargets[i], this._length, this._thickness, this._fadeColor);
		}
	}
	this._content.bitmap.drawCircle(this._x, this._y, this._length / 10, this._baseColor)

	if(this._flashTime >= this._time && !this._notPressed) {
		this._content.bitmap.clear();
		BattleManager.endTASAttackThing();
		this.close();
	}

	//Input
	if(eval(SRD.TimedAttack.activateCondition) && this._notPressed && this._cooldown === 0) {
		if(this._targetCount > 0) this._targetCount--;
		this._setTargets.push(this._xPosition);
		AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
		if(this._targetCount <= 0) {
			this._notPressed = false;
			var temp = 0;
			for(var i = 0; i < this._setTargets.length; i++) {
				for(var j = 0; j < this._targets.length; j++) {
					if(this._setTargets[i] > this._targets[j][0] && this._setTargets[i] < this._targets[j][1]) {
						temp += this._targets[j][3];
					}
				}
			}
			this.setPower(temp / this._setTargets.length);
		}
	}
	if(this._cooldown > 0) this._cooldown--;
};




// ================ Mash Timed Attack methods
// ======== Does the "insert X&Y position", for the Mash TimedAttack
// ==== Have to replace the whole method since the "this._x" and "this._y" are used in the middle
TimedAttackSystem.prototype.playMashGame = function() {
	//Movement
	if(this._notPressed) {
		var f = this._frame;
		this._xPosition -= Number(eval(this._item.speed)) - this._tempSpeed;
		if(this._xPosition <= 0 || this._xPosition > this._maxPosition) {
			if(this._xPosition > this._maxPosition) {
				AudioManager.playSe({"name":this._item.vse,"pan":0,"pitch":100,"volume":100});
				this._xPosition = this._maxPosition;
				this.setPower(1);
			} else {
				AudioManager.playSe({"name":this._item.fse,"pan":0,"pitch":100,"volume":100});
				this._xPosition = 0;
				this.setPower(0);
			}
			this._notPressed = false;
		}
	} else {
		this._flashTime++;
	}

	//Draw
	// ======== This is where we insert the X&Y position 
	// ==== First, sets the Default (Offset 0) to the Center of the screen
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
	// ==== The Insert for Individual Offsets
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetMash;
		this._y += globalNonSideYOffset + globalNonSideYOffsetMash;
	}

	this._content.bitmap.clear();
	this.drawGaugeUpgrade(this._x, this._y, this._width, this._height, this._xPosition / this._maxPosition, this._color1, this._color2);
	if(this._flashTime % this._flash < Math.floor(this._flash / 2)) {
		var text = this._phrase.replace(/%1/g, this._seconds);
		this._content.bitmap.drawText(text, this._x + (this._width/2) - (this.textWidth(text)/2), this._y - this._height, this.textWidth(text), this.lineHeight(), 'left');
	}

	if(this._flashTime >= this._time && !this._notPressed) {
		this._content.bitmap.clear();
		BattleManager.endTASAttackThing();
		this.close();
	}

	if(this._notPressed) {

		if(eval(SRD.TimedAttack.activateCondition)) {
			if(this._mode) {
				this._tempSpeed = eval(this._item.tap);
			} else {
				this._xPosition += eval(this._item.tap);
			}
		}

		if(this._frame % 60 === 0) {
			this._seconds--;
		}

		//Input
		if(this._seconds === 0) {
			this._notPressed = false;
			AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
			this.setPower(this._xPosition / this._maxPosition);
		}

		if(this._tempSpeed > 0) this._tempSpeed--;
	}
};




// ================ Wheel Timed Attack methods
// ======== Does the "insert X&Y position", for the Wheel TimedAttack
// ==== Have to replace the whole method since the "this._x" and "this._y" are used in the middle
TimedAttackSystem.prototype.playWheelGame = function() {
	//Initialise
	if(this._oneUpdate) {
		this._sprites = [];
		for(var i = 0; i < this._commands.length; i++) {
			var bit = SRD.TimedAttack.loadImage(this._button);
			this._bitWidth = bit.width;
			var h = bit.height;
			this._sprites[i] = new Sprite(new Bitmap(h, h));
			this._sprites[i].bitmap.blt(bit, this._commands[i] * (this._bitWidth/2), 0, h, h, 0, 0);
			this._sprites[i].opacity = 0;
			this.addChild(this._sprites[i]);
		}
		this._backSprite = new Sprite(new Bitmap((this._radius*2) + (this._ringThickness*2), (this._radius*2) + (this._ringThickness*2)));
		var bit2 = SRD.TimedAttack.loadImage(this._ring);
		this._backSprite.bitmap.blt(bit2, 0, 0, bit2.width, bit2.height, 0, 0, (this._radius*2) + (this._ringThickness), (this._radius*2) + (this._ringThickness));
		this._backSprite.x = this._x - (this._backSprite.width/2) + (this._ringThickness*3);
		this._backSprite.y = this._y - (this._backSprite.height/2) + (this._ringThickness*3);
		this.addChildAt(this._backSprite, 0);

		this._targetSprite = new Sprite(SRD.TimedAttack.loadImage(this._target));
		this._targetSprite.x = this._x - ((this._targetSprite.width/2) - (this._sprites[0].width/2));
		this._targetSprite.y = this._y - this._radius - ((this._targetSprite.height/2) - (this._sprites[0].height/2));
		this.addChildAt(this._targetSprite, 1);
		this._oneUpdate = false;
	} else {
		for(var i = 0; i < this._commands.length; i++) {
			if(this._maxCount - this._countDown > i) {
				if(this._sprites[i].opacity > 0) {
					this._sprites[i].opacity += this._ani[0];
					this._sprites[i].scale.x += this._ani[1];
					this._sprites[i].scale.y += this._ani[2];
					this._sprites[i].x += this._ani[3];
					this._sprites[i].y += this._ani[4];
				}
			} else {
				var coods = this.getWheelCoordinates(i);
				this._sprites[i].x = this._x + coods.x;
				this._sprites[i].y = this._y + coods.y;
				if(this._sprites[i].opacity === 0) this._sprites[i].opacity = 255;
			}
		}
		this._backSprite.x = this._x - (this._backSprite.width/2) + (this._ringThickness*3);
		this._backSprite.y = this._y - (this._backSprite.height/2) + (this._ringThickness*3);

		this._targetSprite.x = this._x - ((this._targetSprite.width/2) - (this._sprites[0].width/2));
		this._targetSprite.y = this._y - this._radius - ((this._targetSprite.height/2) - (this._sprites[0].height/2));
	}


	//Movement
	if(this._notPressed) {
		var f = this._frame;
	} else {
		this._flashTime++;
	}

	if(this._flashTime >= this._time && !this._notPressed) {
		this._content.bitmap.clear();
		for(var i = 0; i < this._sprites.length; i++) {
			this.removeChild(this._sprites[i]);
		}
		this.removeChild(this._backSprite);
		this.removeChild(this._targetSprite);
		BattleManager.endTASAttackThing();
		this.close();
	}

	//Draw
	// ======== This is where we insert the X&Y position 
	// ==== First, sets the Default (Offset 0) to the Center of the screen
	this._x = (Graphics.width/2);
	this._y = (Graphics.height/2);
	// ==== The Insert for Individual Offsets
	this._x += this._visualXOffset;
	this._y += this._visualYOffset;
	// ==== The Inserts for NonSideview case
	if (!isSideview){
		this._x += globalNonSideXOffset + globalNonSideXOffsetWheel;
		this._y += globalNonSideYOffset + globalNonSideYOffsetWheel;
	}

	if(this._notPressed) {

		if(eval(this._evals[this._commands[this._maxCount - this._countDown]])) {
			var power = Math.abs(this._animationCycle - this._moments[this._maxCount - this._countDown]) / 1;
			this._powers.push(Math.max(1 - power, 0));
			this._countDown--;
			if(this._countDown === 0) {
				AudioManager.playSe({"name":this._item.vse,"pan":0,"pitch":100,"volume":100});
				var tasPower = 0;
				for(var i = 0; i < this._powers.length; i++) {
					tasPower += this._powers[i];
				}
				tasPower /= this._powers.length;
				this.setPower(tasPower);
				this._notPressed = false;
			} else {
				AudioManager.playSe({"name":this._item.se,"pan":0,"pitch":100,"volume":100});
				
			}
			if(!this._startMovement && this._countDown > 0) this._startMovement = true;
		} else if(eval(this._evals[0]) || eval(this._evals[1])) {
			this._speed += this._penatly;
			if(!this._startMovement) this._startMovement = true;
			AudioManager.playSe({"name":this._item.fse,"pan":0,"pitch":100,"volume":100});
		}

		if(this._startMovement) this._animationCycle += (this._speed);

		if(this._animationCycle > Math.PI * 2) {
			this._notPressed = false;
			AudioManager.playSe({"name":this._item.f2se,"pan":0,"pitch":100,"volume":100});
			this.setPower(0);
		}
	}
};


//=============================================================================
// End of File
//=============================================================================
