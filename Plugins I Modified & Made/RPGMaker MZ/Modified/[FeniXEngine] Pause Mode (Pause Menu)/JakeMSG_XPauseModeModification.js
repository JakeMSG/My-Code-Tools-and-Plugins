/*:
 * @pluginname JakeMSG_XPauseModeModification
 * @plugindesc v1.2.0 - A customizable pause scene, enhancing mobile game-play and increasing accessibility
 * @target MZ
 * @modulename JakeMSG_XPauseModeModification
 * @required
 * @external
 *
 * @author FeniXEngine Contributors
 * @url https://fenixenginemv.gitlab.io/
 *
 * @param Scene Options
 *
 * @param pauseKey
 * @parent Scene Options
 * @text Pause Key
 * @type Number
 * @desc  The key used to pause the game (Default P key)
 * @type number
 * @default 80
 *
 * @param pausePlaytime
 * @parent Scene Options
 * @text Pause Playtime
 * @type boolean
 * @desc  Whether or not to pause the playtime in the pause the mode scene.
 * @default true
 *
 * @param pauseText
 * @parent Scene Options
 * @text Pause Text
 * @type struct<Element>
 * @desc  The text displayed on screen when paused
 * @default {"enable":"true","text":"Pause Mode","x":"Graphics.width / 2 - 100","y":"Graphics.height / 2 - 90","align":"left","font":"GameFont","fontSize":"50"}
 *
 * @param pauseBackground
 * @text Pause Background
 * @parent Scene Options
 * @desc  The background used for the pause mode scene.
 * @type struct<Background>
 * @default {"blur":"true","darkRect":"true","custom":"","x":"0","y":"0"}
 *
 * @param overrideMenuAccess
 * @text Override Menu Access
 * @parent Scene Options
 * @desc Overriding menu access will open the pause mode scene instead of the menu. The menu can be accessed from the pause mode scene.
 * @type boolean
 * @default false
 * @type Boolean
 *
 *
 * @param Sound Options
 *
 * @param exitEnterSe
 * @text Enter/Exit Sound
 * @parent Sound Options
 * @desc  The sound to play when entering or exiting the pause mode scene.
 * @type struct<SoundEffect>
 * @default {"name":"Flash1","volume":"40","pitch":"100","pan":"0.5"}
 *
 * @param buttonsTouchSound
 * @text Buttons Touch Sound
 * @parent Sound Options
 * @desc  Sound effect when a button is touched
 * @type struct<SoundEffect>
 * @default {"name":"Cursor1","volume":"100","pitch":"100","pan":"0.5"}
 *
 *
 * @param Buttons
 *
 * @param buttonsContainer
 * @text Buttons Container
 * @parent Buttons
 * @type struct<ButtonContainer>
 * @desc  All burtons are in one container, changing settings here affect all buttons.
 * @default {"containerX":"Graphics.width / 2 - 150","containerY":"Graphics.height / 2 - 30","spacing":"75"}
 *
 * @param returnButton
 * @text Return Button
 * @parent Buttons
 * @desc  The return button continues gameplay
 * @type struct<Button>
 * @default {"pos":"0","enable":"true","image":"exitLeft","commonEvent":"0","offsetX":"0","offsetY":"0"}
 *
 * @param menuButton
 * @text Menu Button
 * @parent Buttons
 * @type struct<Button>
 * @desc  The menu button will open the main menu
 * @default {"pos":"1","enable":"true","image":"menuList","commonEvent":"0","offsetX":"0","offsetY":"0"}
 *
 * @param optionsButton
 * @text Options Button
 * @parent Buttons
 * @type struct<Button>
 * @desc  The options button opens the default options menu
 * @default {"pos":"2","enable":"true","image":"options","commonEvent":"0","offsetX":"0","offsetY":"0"}
 *
 * @param audioButton
 * @text Mute Button
 * @parent Buttons
 * @type struct<Button>
 * @desc  The mute button mutes all audio
 * @default {"pos":"3","enable":"true","image":"audio","commonEvent":"0","offsetX":"0","offsetY":"0"}
 *
 * @param saveButton
 * @text Save Button
 * @parent Buttons
 * @type struct<Button>
 * @desc  The mute button mutes all audio
 * @default {"pos":"4","enable":"true","image":"save","commonEvent":"0","offsetX":"0","offsetY":"0"}
 *
 * @param commonEventButtons
 * @text Common Event Buttons
 * @type struct<Button>[]
 * @desc  An extra common event button.
 * @default ["{\"pos\":\"0\",\"enable\":\"false\",\"image\":\"\",\"commonEvent\":\"0\",\"offsetX\":\"0\",\"offsetY\":\"0\"}"]
 *
 * @param buttonSpriteFrames
 * @text Button Sprite Frames
 * @parent Buttons
 * @type struct<ButtonFrames>
 * @desc  Basic details about your buttons spritesheet frames.
 * @default {"size":"64","normal":"0","touched":"1","disabled":"2"}
 *
 *
 * @param Addons/Extras
 *
 * @param mapName
 * @text Location
 * @parent Addons/Extras
 * @desc  Add the current map name with an icon.
 * @type struct<Addon>
 * @default {"enable":"true","containerX":"5","containerY":"0","icon":"190","el":"{\"enable\":\"true\",\"text\":\"\",\"x\":\"0\",\"y\":\"0\",\"align\":\"left\",\"font\":\"GameFont\",\"fontSize\":\"26\"}","el1":"","el2":""}
 *
 * @param playtime
 * @text Play Time
 * @parent Addons/Extras
 * @desc  Add the playtime with an icon.
 * @type struct<Addon>
 * @default {"enable":"true","containerX":"5","containerY":"Graphics.height","icon":"220","el":"{\"enable\":\"false\",\"text\":\"Playtime: \",\"x\":\"0\",\"y\":\"0\",\"align\":\"left\",\"font\":\"GameFont\",\"fontSize\":\"26\"}","el1":"","el2":""}
 *
 * @param socialButtons
 * @text Social Media Buttons Addon
 * @parent Addons/Extras
 * @desc  Adds Social Media Buttons - Contains No Elements
 * @type struct<Addon>
 * @default {"enable":"false","containerX":"Graphics.width","containerY":"Graphics.height","icon":"0","el":"{\"x\":\"0\",\"y\":\"0\",\"align\":\"left\",\"font\":\"0\"}","el1":"{\"x\":\"0\",\"y\":\"0\",\"align\":\"left\",\"font\":\"0\"}","el2":"{\"x\":\"0\",\"y\":\"0\",\"align\":\"left\",\"font\":\"0\"}"}
 *
 *
 * @command setLocationName
 * @text Set Location Name
 * @desc Set the name of the location on the pause menu. This will override the default location name.
 *
 * @arg name
 * @text Name
 * @type text
 * @default
 *
 *
 * @command pause
 * @text Pause
 * @desc Pause the gamee and display the pause menu.
 *
 * @arg isBattlePause
 * @text Pause Battle
 * @desc This need to be true if you are in a battle.
 * @type boolean
 * @default false
 *
 * @command disablePause
 * @text Disable Pause
 * @desc Disable access to the pause men, preventing the user from pausing.
 *
 * @arg disabled
 * @text Disabled
 * @desc Set to true to disable access to the pause menu, set to false to enable
 * access to the pause menu again.
 * @type boolean
 * @default true
 *
 *
 *@help
 ------------------------------------------------------------------------------
 # TERMS OF USE

--------------------------------------------------------------------------------
 MIT License -

 * Free for use in any RPG Maker MV game project, commercial or otherwise

 * Credit may go to FeniXEngine Contributors or FeniXEngine

 * Though not required, you may provide a link back to the original source code,
   repository or website.

------------------------------------------------------------------------------
 # Instructions

 ------------------------------------------------------------------------------
 ## About Button Sprite Sheets

 * All buttons require you to use an image, this image should contain 3 frames.

 * Button frames can only be 1 line long and only require 3 frames.
   * Each frame is a button state. Normal, Touched and Disabled.
   * Keep a consistent pattern for all buttons. If  your image is in the order of
   "Normal | Touched | Disabled", make sure all you images are the same way.
 * You can freely adjust the frame size in the plugin parameters and
 choose which frame should be which state.

------------------------------------------------------------------------------
 ## About Add-Ons

 ------------------------------------------------------------------------------
Social Media Buttons add-on requires you to have the corresponding plugin
installed and turned on.

=> Playtime - contains 1 element
  Main: The playtime and prefix

=> Location - contains 1 element
  Main: The location and prefix

=> Social Media Buttons - Contains no elements
  -------------------------------------------------------------------------------
 # Plugin Commands

 ------------------------------------------------------------------------------
  PauseMode Pause [isBattlePause]
 - Open the pause menu. If isBattlePause needs to be true if you are in a battle.

  PauseMode DisablePause
 - Disable access to the pause menu

  PauseMode SetLocationName
 - Set the name of the location in the pause menu. This will override the
   default location name.
*/

/* eslint-disable spaced-comment */

/*~struct~SoundEffect:
  @param name
  @text Name
  @type file
  @dir audio/se/
  @desc The name of the sound effect

  @param volume
  @text Volume
  @type number
  @min 1
  @max 100
  @default 50
  @desc The volume of this sound effect. This controls the loudness and softness of the audio.

  @param pitch
  @text Pitch
  @type number
  @min 1
  @max 200
  @default 100
  @desc The pitch of this sound effect. This controls the highs and lows of the audio.

  @param pan
  @text Pan
  @type number
  @default 0.5
  @decimals 0.1
  @min 0
  @max 1
  @desc The pan of this sound effect.
*/

/*~struct~Addon:
  @param enable
  @text Enable Addon
  @type boolean
  @default false
  @desc Turn on this addon to add it to the pause mode scene

  @param containerX
  @text Container's X Position(eval)
  @default 0
  @desc The x position of the container which holds all of this add ons elements

  @param containerY
  @text Container's Y Position(eval)
  @default 0
  @desc The y position of the container which holds all of this add ons elements

  @param icon
  @text Icon
  @default 0
  @desc If this add-on contain an icon, then input the iconId of the icon you'd like displayed

  @param el
  @text Main Element
  @type struct<Element>
  @default {"x":"0","y":"0","align":"left","font":"0"}
  @desc All add-ons contain one element, these are the options for changing the element within the add-ons container.

  @param el1
  @text Element 2
  @type  struct<Element>
  @default {"x":"0","y":"0","align":"left","font":"0"}
  @desc If this add-on contains a 2nd element, you can change it's options here (See Help For More Information)

  @param el2
  @text Element 3
  @type  struct<Element>
  @default {"x":"0","y":"0","align":"left","font":"0"}
  @desc If this add-on contains a 3rd element, you can change it's options here (See Help For More Information)
*/

/*~struct~Element:
  @param enable
  @text Enable
  @type boolean
  @default
  @desc Hide or show the element.

  @param text
  @text Text
  @default
  @desc If the element contains a customizable text element, you can change it here.

  @param x
  @text X Position
  @type number
  @default 0
  @desc The x position of of this element

  @param y
  @text Y Position
  @type number
  @default 0
  @desc The y position of this element

  @param font
  @text Font Face
  @default GameFont
  @desc The font face for the text within this element

  @param fontSize
  @text Font Size
  @default 24
  @desc The font size for the text within this element
*/

/*~struct~ButtonContainer:
  @param containerX
  @text Container's X Position(eval)
  @default 0
  @desc The x position of the container which holds all of the button elements

  @param containerY
  @text Container's Y Position(eval)
  @default 0
  @desc The y position of the container which holds all of the buttons elements

  @param spacing
  @text Spacing
  @type number
  @default 25
  desc The spacing between all the elements within the container. If applicable. (See Help For More Info)
  */

/*~struct~Button:
  @param pos
  @text Position
  @type number
  @default 0
  @desc The position the element should appear within the button container

  @param enable
  @text Enable
  @type boolean
  @default false
  @desc Choose to enable this button, so it appears on the pause mode scene

  @param image
  @text Button Image
  @type file
  @dir img\system
  @default
  @desc The button-sheet image to use for this button.

  @param commonEvent
  @text Common Event
  @type common_event
  @default 0
  @desc The common event to run when this button is pressed.

  @param offsetX
  @text Offset X
  @type number
  @max 999999
  @min -999999
  @default 0
  @desc The X Offset of this specific button.

  @param offsetY
  @text Offset Y
  @type number
  @max 999999
  @min -999999
  @default 0
  @desc The Y Offset of this specific button.
*/

/*~struct~ButtonFrames:
  @param size
  @type number
  @text Size Of Button Sheet
  @default 64
  @desc The size of one frame on the button-sheet sprite-sheet

  @param normal
  @text Normal Frame
  @type number
  @default 0
  @desc The frame to use on the button-sheet sprite-sheet when the button is not being touched..

  @param touched
  @text On Touch Frame
  @type number
  @default 1
  @desc The frame to use on the button-sheet sprite-sheet when the button is touched.

  @param disabled
  @type number
  @text Disabled Frame
  @default 2
  @desc The frame to use on the button-sheet sprite-sheet when the button is disabled
  */

/*~struct~Background:
  @param blur
  @type boolean
  @text Blurred Background
  @default true
  @desc Create a blurred background of the previous scene.

  @param darkRect
  @type boolean
  @text Darken Background
  @default true
  @desc Create a darkened transparent sprite to cover the background.

  @param custom
  @type file
  @dir img
  @text Custom Background
  @default
  @desc You can use a custom background instead.

  @param x
  @type number
  @text Custom Background X
  @default 0
  @desc Custom backgrounds x position on the scene.

  @param y
  @type number
  @text Custom Background Y
  @default 0
  @desc Custom backgrounds y position on the scene.
  */

(function () {
'use strict';

/**
 * Recursive method that will convert all string values in an object to a more
 * appropriate type.
 *
 * In MV there are a lot of objects filled with strings of different values, a lot
 * of times we need to convert each value manually, instead use this to quickly
 * deep parse each value from string to the correct type.
 *
 * @function convertParameters
 * @since 1.0.0
 * @memberof module:Utils
 *
 * @param {object} parameters - The string filled object you want converted
 *
 * @returns An object with it's string values converted
 * @example
 *
 * const myParams = { p1: '22', p2: 'true' }
 * convertParameters(myParams) // => { p1: 22, p2: true }
 *
 * const myParams = { p1: '{a: 1'1, c: '2'}', p2: '[{}, {}, {}]' }
 * convertParameters(myParams) // => { p1: {a: 1, c: 2}, p2: [{}, {}, {}] }
 *
 */
function convertParameters (parameters) {
  function parseParameters (string) {
    try {
      return JSON.parse(string, (key, value) => {
        try {
          return parseParameters(value)
        } catch (e) {
          return value
        }
      })
    } catch (e) {
      return string
    }
  }
  return parseParameters(JSON.stringify(parameters))
}

const pluginName = document.currentScript.src.match(/.+\/(.+).js/)[1];

const rawParameters = PluginManager.parameters(pluginName);

const _Params = convertParameters(rawParameters);

_Params.buttons = {
  return: _Params.returnButton,
  menu: _Params.menuButton,
  audio: _Params.audioButton,
  options: _Params.optionsButton,
  save: _Params.saveButton
};

_Params.buttonOptions = {
  container: _Params.buttonsContainer,
  frames: _Params.buttonSpriteFrames,
  sound: _Params.buttonsTouchSound
};

Object.assign(Input.keyMapper, {
  [_Params.pauseKey]: 'pause'
});

class VortexSceneManager {
  constructor (ticker) {
    this.scene = null;
    this.nextScene = null;
    this._stack = [];
    this._ticker = ticker;
    this._ticker.autoStart = true;
    this._ticker.add(this.update.bind(this));
    this._mvRender = false;
  }

  push (sceneClass) {
    if (this.scene) {
      this._stack.push(this.scene.constructor);
    }
    this.load(sceneClass);
  }

  pop () {
    if (this.scene) {
      this.scene.terminate();
      this.scene = null;
    }
    if (this._stack.length > 0) {
      this.load(this._stack.pop());
    }
  }

  load (sceneClass) {
    if (this.scene) {
      this.scene.stop();
      this.scene.terminate();
      this.scene = null;
    }
    this.scene = new sceneClass(); // eslint-disable-line new-cap
    this.scene.isVortex = true;
    this.overridePopScene();
    this.scene.start();
    this.scene.create();
    Graphics.setStage(this.scene);

  }

  unload (resetDefaultSceneMAnager = true) {
    if (this.scene) {
      this.scene.stop();
      this.scene.terminate();
      this.scene = null;
      this._stack = [];
      if (resetDefaultSceneMAnager) {
        Graphics.setStage(SceneManager._scene);

      }
    }
  }

  update (delta) {
    if (this._mvRender) {
      SceneManager.updateInputData();
      Graphics.render(this.scene);
    }
    if (this.scene) {
      this.scene.update(delta);
    }
    if (this.nextScene) {
      this.load(this.nextScene);
      this.nextScene = null;
    }
  }

  // Overrides default MZ/MV classes popScene methods so we can pop scene in Vortex
  overridePopScene () {
    if (this.scene && typeof this.scene.popScene === 'function') {
      this.scene.popScene = () => {
        this.pop();
      };
    }
  }
}

const Vortex = new VortexSceneManager(PIXI.Ticker.shared);

AudioManager._isMuted = false;

AudioManager._savedVolume = {};

AudioManager.isMute = function () {
  return this._isMuted === true
};

AudioManager.saveVolume = function () {
  this._savedVolume = {
    bgm: AudioManager.bgmVolume,
    bgs: AudioManager.bgsVolume,
    me: AudioManager.meVolume,
    se: AudioManager.seVolume
  };
};

AudioManager.restoreVolume = function () {
  this.bgmVolume = this._savedVolume.bgm || 15;
  this.bgsVolume = this._savedVolume.bgs || 15;
  this.meVolume = this._savedVolume.me || 15;
  this.seVolume = this._savedVolume.se || 15;
};

AudioManager.muteAudio = function () {
  if (!this._isMuted) {
    this.saveVolume();
    this.bgmVolume = 0;
    this.bgsVolume = 0;
    this.meVolume = 0;
    this.seVolume = 0;
    this._isMuted = true;
  } else if (this._isMuted) {
    this.restoreVolume();
    this._isMuted = false;
  }
};

Object.defineProperty(ConfigManager, 'isMuted', {
  get: function () {
    return AudioManager.isMute()
  },
  set: function (value) {
    AudioManager._isMuted = value;
  },
  configurable: true
});

Object.defineProperty(ConfigManager, 'volumeBeforeMute', {
  get: function () {
    return AudioManager._savedVolume
  },
  set: function (value) {
    AudioManager._savedVolume = value;
  },
  configurable: true
});

const ConfigManager_makeData = ConfigManager.makeData;
ConfigManager.makeData = function () {
  const config = ConfigManager_makeData.call(this);
  config.isMuted = this.isMuted;
  config.volumeBeforeMute = this.volumeBeforeMute;
  return config
};

const ConfigManager_applyData = ConfigManager.applyData;
ConfigManager.applyData = function (config) {
  ConfigManager_applyData.call(this, config);
  this.isMuted = config.isMuted;
  this.volumeBeforeMute = config.volumeBeforeMute;
};

class PauseModeButton extends Sprite_Button {
  constructor (options, x, y) {
    super();
    this._emitter = new PIXI.utils.EventEmitter();
    this._size = _Params.buttonOptions.frames.size;
    this._data = options;
    this.menuPosition = options.menuPosition;
    this.bitmap = options.src;
    this.setClickHandler(options.action);
    this._isTouched = false;
    this._mousePos = {};
    this._isEnabled = true;
    this.forceSelect = false;
    this.initializeFrames();
  }

  type () {
    return this._data.type
  }

  on (event, callback) {
    this._emitter.on(event, callback);
  }

  maxFrames () {
    return 3
  }

  updateOpacity () {
    this.opacity = 255;
  }

  buttonData () {
    return {
      x: this.x,
      y: this.y
    }
  }

  blockWidth () {
    return _Params.buttonSpriteFrames.size / this.maxFrames() || 48
  }

  blockHeight () {
    return _Params.buttonSpriteFrames.size / this.maxFrames() || 48
  }

  checkBitmap () {
    if (this.bitmap.isReady() && this.bitmap.width < this.blockWidth() * this.maxFrames()) {
      // Probably MV image is used
      throw new Error('ButtonSet image is too small')
    }
  }

  onClick () {
    if (this._clickHandler) {
      this._clickHandler(this._data.type, this);
    } else {
      Input.virtualClick(this._buttonType);
    }
  }

  initializeFrames () {
    this._touchedFrame = _Params.buttonOptions.frames.touched * this._size;
    this._disabledFrame = _Params.buttonOptions.frames.disabled * this._size;
    this._normalFrame = _Params.buttonOptions.frames.normal * this._size;
    this.setColdFrame(this._normalFrame, 0, this._size, this._size);
    this.setHotFrame(this._touchedFrame, 0, this._size, this._size);
    this.setFrame(this._normalFrame, 0, this._size, this._size);
  }

  callClickHandler () {
    if (this._clickHandler) {
      this._clickHandler(this._data.type, this);
    }
  }

  updateMousePosition (event) {
    this._mousePos.x = event.pageX;
    this._mousePos.y = event.pageY;
  }

  update () {
    super.update();
  }

  commonEvent () {
    return this._data.commonEvent
  }

  updateFrame (event) {
    let frame = null;

    if (this.forceSelect === true && !this._isTouched) {
      AudioManager.playSe(_Params.buttonOptions.sound);
      frame = this._hotFrame;
      this._isTouched = true;
      this.setFrame(frame.x, frame.y, frame.width, frame.height);
      return
    }

    if (this.forceSelect === false) {
      if (this.isButtonTouching() && !this._isTouched && this._isEnabled) {
        AudioManager.playSe(_Params.buttonOptions.sound);
        frame = this._hotFrame;
        this._isTouched = true;
        this._emitter.emit('touched', this._data.type, this);
      } else if (this._isTouched && !this.isButtonTouching()) {
        frame = this._coldFrame;
        this._isTouched = false;
      }

      if (frame && this._isEnabled) {
        this.setFrame(frame.x, frame.y, frame.width, frame.height);
      }
    }
  }

  isButtonTouching () {
    if (!this._mousePos.x || !this._mousePos.y) { return false }
    const touchPos = new Point(TouchInput.x, TouchInput.y);
    const localPos = this.worldTransform.applyInverse(touchPos);
    return this.hitTest(localPos.x, localPos.y)
  }

  hitTest (x, y) {
    const rect = new Rectangle(
      -this.anchor.x * this.width,
      -this.anchor.y * this.height,
      this.width,
      this.height
    );
    return rect.contains(x, y)
  }

  setDisabled () {
    this.setFrame(this._disabledFrame, 0, this._size, this._size);
    this._isEnabled = false;
  }

  setEnabled () {
    this.setFrame(this._normalFrame, 0, this._size, this._size);
    this._isEnabled = true;
  }

  setForceHotFrame () {
    this.forceSelect = true;
  }

  setPosition (x, y) {
    this.x = x;
    this.y = y;
  }
}

class ButtonContainer extends Sprite_Button {
  constructor (x, y, onPress) {
    super();
    this.buttons = [];
    this._onPress = onPress;
    this._listener = this.processButtonTouching.bind(this);
    document.addEventListener('mousemove', this._listener);
    this.createButtons();
  }

  buttonData () {
    return {
      x: this.x,
      y: this.y
    }
  }

  blockWidth () {
    return this.width
  }

  blockHeight () {
    return this.height
  }

  updateOpacity () {
    this.opacity = 255;
  }
  processButtonTouching (event) {
    this.children.forEach(button => button.updateMousePosition(event));
  }

  createButtons () {
    const ceButtons = _Params.commonEventButtons;
    const gameButtons = _Params.buttons;

    const ceButtonsArray = Object.entries(ceButtons).map(([type, value]) => ({ type: 'common', ...value }));
    const gameButtonsArray = Object.entries(gameButtons).map(([type, value]) => ({ type, ...value }));
    const allButtons = [...ceButtonsArray, ...gameButtonsArray];

    const enabledButtons = allButtons.filter(button => {
      return button.enable && button.image
    });
    const sortedButtons = enabledButtons.sort((a, b) => {
      return a.pos - b.pos
    });

    sortedButtons.forEach((button, index) => {
      let position = index;
      if (!button.enable) {
        return
      }

      const spacing = _Params.buttonOptions.container.spacing;
      const x = position === 1 ? 0 : position === 2 ? spacing : spacing * (position - 1);
      const spriteButton = new PauseModeButton({
        /* Common events are #s, so ensure type = 'common' */
        type: button.type,
        src: ImageManager.loadSystem(button.image),
        action: this._onPress,
        commonEvent: button.commonEvent,
        menuPosition: position
      });

      this.addChild(spriteButton);
      this.buttons.push(spriteButton);

      // ======== This is needed, since the default values of the offsets, for some reason, shows up as Undefined, so I need to set them as 0 in that case (since 0 is default)
      if(!button.offsetX){
        button.offsetX = 0;
      }
      if(!button.offsetY){
        button.offsetY = 0;
      }

      // ======== Inserted the Offsets here
      spriteButton.bitmap.addLoadListener(() => {
        spriteButton.setPosition(x + spriteButton.width + button.offsetX, 0 + button.offsetY);
        this.resize();

        if (!$gameSystem.isMenuEnabled() && button === 'menu') {
          spriteButton.setDisabled();
        }

        if (AudioManager.isMute() && button === 'audio') {
          spriteButton.setDisabled();
        }

        if (!$gameSystem.isSaveEnabled() && button === 'save') {
          spriteButton.setDisabled();
        }
      });
    });
  }

  setPosition () {
    const opts = _Params.buttonOptions.container;
    const x = this._tryEval(opts.containerX);
    const y = this._tryEval(opts.containerY);
    this.x = this.x >= Graphics.width ? x - this.getBounds().width : x;
    this.y = this.y >= Graphics.height ? y - this.getBounds().height : y;
  }

  resize () {
    this.calculateBounds();
    this.setPosition();
  }

  removeListener () {
    document.removeEventListener('mousemove', this._listener);
  }

  _tryEval (expression) {
    try {
      // eslint-disable-next-line no-eval
      return eval(expression)
    } catch (error) {
      console.error('An error occurred from running an expression', expression);
    }
  }
}

class Scene_GamePause extends Scene_MenuBase {
  constructor () {
    super();
    this._selectedButtonPosition = -1;
    this._timeTextSprite = null;
    this._mapTextSprite = null;
    this._iconSet = ImageManager.loadSystem('IconSet');
    this._initialPlaytimeDrawn = false;

    // For now we just check if Vortex has a scene since we only use Vortex in battles
    this.isBattlePause = null;
  }

  iconSize () {
    return { width: ImageManager.iconWidth, height: ImageManager.iconHeight }
  }

  savePlaytime () {
    this.playtimeOnPause = Graphics.frameCount;
  }

  restorePlaytime () {
    Graphics.frameCount = this.playtimeOnPause;
  }

  backgroundSnapBitmap () {
    if (this.isBattlePause) {
      return SceneManager.snap()
    } else {
      return SceneManager.backgroundBitmap()
    }
  }

  start () {
    super.start();
    this.isBattlePause = Vortex.scene;
    this.savePlaytime();
  }

  terminate () {
    super.terminate();
    this._buttonContainer.removeListener();
    ConfigManager.save();
    if (_Params.pausePlaytime) {
      this.restorePlaytime();
    }
  }

  create () {
    this.createPauseBackground();
    this.createInfoContainer();
    this.createButtonContainer();
    this.createPauseText();
    this.createMapName();
    this.createPlaytime();
    this.createSocialMediaButtons();
  }

  createButtonContainer () {
    this._buttonContainer = new ButtonContainer(0, 0, this.onButtonPress.bind(this));
    this._buttonContainer.buttons.forEach(button => {
      button.on('touched', this._onButtonTouched.bind(this));
    });

    if (this.isBattlePause) {
      this._buttonContainer.buttons.forEach(button => {
        if (button.type() === 'menu') {
          button.setDisabled(true);
        }
        if (button.type() === 'save') {
          button.setDisabled(true);
        }
      });
    }
    this.addChild(this._buttonContainer);
  }

  createInfoContainer () {
    this._infoContainer = new PIXI.Container();
    this.addChild(this._infoContainer);
  }

  createSocialMediaButtons () {
    const options = _Params.socialButtons;
    if (!options.enable) { return }
    if (typeof window.X_SocialMediaButtons === 'undefined') {
      throw new Error('X Pause Mode: Cannot find plugin "Social Media Buttons"')
    }
    const x = this._tryEval(options.containerX);
    const y = this._tryEval(options.containerY);
    const container = new window.X_SocialMediaButtons.Container(x, y);
    this.addChild(container);
  }

  createPlaytime () {
    const options = _Params.playtime;
    if (!options.enable) {
      return
    }
    const element = options.el;
    const playtime = $gameSystem.playtimeText();
    const x = this._tryEval(options.containerX) || 0;
    const y = this._tryEval(options.containerY) || 0;
    const text = element.text;
    const font = element.fontSize || 18;
    this._timeTextSprite = this.createTextSprite(text + playtime, options.icon, x, y, font);
  }

  createMapName () {
    const options = _Params.mapName;
    if (!options.enable) {
      return
    }
    const element = options.el;
    const mapName = $gameTemp.pauseSceneLocation || $gameMap.displayName();
    const x = this._tryEval(options.containerX) || 0;
    const y = this._tryEval(options.containerY) || 0;
    const text = element.text;
    const font = element.fontSize || 18;
    if (mapName && mapName !== '') {
      this._mapTextSprite = this.createTextSprite(text + mapName, options.icon, x, y, font);
    }
  }

  createPauseText () {
    const options = _Params.pauseText;
    if (!options.enable) {
      return
    }
    const x = this._tryEval(options.x);
    const y = this._tryEval(options.y);
    this.createTextSprite(options.text, null, x, y, options.fontSize);
  }

  createTextSprite (text, icon = null, x, y, fontSize) {
    const bitmap = new Bitmap(Graphics.width, Graphics.height);
    bitmap.outlineColor = 'black';
    bitmap.outlineWidth = 2;
    this._drawText(bitmap, icon, text, fontSize);

    const textWidth = bitmap.measureTextWidth(text);
    const sprite = new Sprite(bitmap);

    sprite.x = x >= Graphics.width ? Graphics.width - textWidth : x;
    sprite.y = y >= Graphics.height ? Graphics.height - fontSize * 2 : y;

    this._infoContainer.addChild(sprite);

    return sprite
  }

  _drawText (bitmap, icon, text, fontSize) {
    bitmap.fontSize = fontSize || bitmap.fontSize;
    if (icon) {
      const iconSize = this.iconSize();
      this._drawIcon(bitmap, icon, 0, iconSize.height / 2 - 8);
      bitmap.drawText(text, iconSize.width + 5, 0, Graphics.width, 50, 'left');
    } else {
      bitmap.drawText(text, 0, 0, Graphics.width, 50, 'left');
    }
  }

  _drawIcon (bitmap, iconIndex, x, y) {
    const pw = this.iconSize().width;
    const ph = this.iconSize().height;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    bitmap.blt(this._iconSet, sx, sy, pw, ph, x, y);
  }

  createDarkRect (x, y, width, height) {
    const bitmap = new Bitmap(width, height);
    const sprite = new Sprite(bitmap);
    const color1 = 'rgba(0, 0, 0, 0.6)';
    const color2 = 'rgba(0, 0, 0, 0.3)';
    bitmap.gradientFillRect(x, y, width, height / 2, color2, color1, true);
    bitmap.gradientFillRect(x, y + height / 2, width, height / 2, color1, color2, true);
    this.addChild(sprite);
  }

  createPauseBackground () {
    const options = _Params.pauseBackground;
    let customBg = null;
    if (options.custom) {
      customBg = ImageManager.loadBitmap('img/', options.custom);
    }
    const sceneSnapBitmap = this.backgroundSnapBitmap();
    const bitmap = options.blur ? sceneSnapBitmap : customBg;
    this._pauseSprite = new Sprite(bitmap);
    this.addChild(this._pauseSprite);

    if (options.darkRect) {
      this.createDarkRect(0, 0, Graphics.width, Graphics.height);
    }
  }

  returnToMap () {
    AudioManager.playSe(_Params.exitEnterSe);
    SceneManager.goto(Scene_Map);
  }

  returnToBattle () {
    Vortex.unload(true);
  }

  getButton (position) {
    return this._buttonContainer.buttons.find(button => button.menuPosition === position)
  }

  lastButton () {
    const buttons = this._buttonContainer.buttons;
    return buttons.sort((a, b) => b.menuPosition - a.menuPosition)[0]
  }

  findAdjacentButtonPosition (position, direction) {
    let newPosition = position;

    if (newPosition === -1) {
      newPosition = 0;
    } else {
      while (true) {
        if (direction === 'next') {
          newPosition++;
          if (newPosition > this.lastButton().menuPosition) {
            newPosition = 0;
          }
        } else if (direction === 'previous') {
          newPosition--;
          if (newPosition < 0) {
            newPosition = this.lastButton().menuPosition;
          }
        }

        if (newPosition !== position) {
          const button = this.getButton(newPosition);
          if (button) {
            return newPosition
          }
        }
      }
    }

    return newPosition
  }

  selectButton (position) {
    this.getButton(position).forceSelect = true;
    this._selectedButtonPosition = position;
  }

  deselectButton (position) {
    const button = this.getButton(position);
    if (!button) return
    this.getButton(position).forceSelect = false;
  }

  selectedButton () {
    return this.getButton(this._selectedButtonPosition)
  }

  selectPrevButton () {
    let adjacentPosition = this.findAdjacentButtonPosition(this._selectedButtonPosition, 'previous');
    this.deselectButton(this._selectedButtonPosition);
    this.selectButton(adjacentPosition);
  }

  selectNextButton () {
    let adjacentPosition = this.findAdjacentButtonPosition(this._selectedButtonPosition, 'next');
    this.deselectButton(this._selectedButtonPosition);
    this.selectButton(adjacentPosition);
  }

  _onButtonTouched (button) {
    // Reset index and disable force select if button is touched
    if (this.getButton(this._selectedButtonPosition)) {
      this.deselectButton(this._selectedButtonPosition);
      this._selectedButtonPosition = -1;
    }
  }

  updateTimeText () {
    if (this._timeTextSprite) {
      const options = _Params.playtime;
      if (!this._initialPlaytimeDrawn || !_Params.pausePlaytime) {
        this._timeTextSprite.bitmap.clear();
        const text = `${options.el.text}${$gameSystem.playtimeText()}`;
        this._drawText(this._timeTextSprite.bitmap, options.icon, text);
        this._initialPlaytimeDrawn = true;
      }
    }
  }

  update () {
    super.update();
    this.updateTimeText();
    if (((Input.isTriggered('menu') || TouchInput.isCancelled()) || Input.isTriggered('pause')) && !this.isBattlePause) {
      this.returnToMap();
    }

    if (Input.isTriggered('left') || Input.isRepeated('left')) {
      this.selectPrevButton();
    }

    if (Input.isTriggered('right') || Input.isRepeated('right')) {
      this.selectNextButton();
    }

    if (Input.isTriggered('ok')) {
      if (this.selectedButton()) {
        this.selectedButton().callClickHandler();
      }
    }
  }

  onButtonPress (type, button) {
    switch (type) {
      case 'menu':
        if (this.isMenuEnabled()) {
          SceneManager.push(Scene_Menu);
        } else {
          SoundManager.playBuzzer();
        }
        break

      case 'audio':
        if (ConfigManager.isMuted) {
          button.setEnabled();
        } else {
          button.setDisabled();
        }
        AudioManager.muteAudio();
        break

      case 'options':
        if (this.isBattlePause) {
          Vortex.push(Scene_Options);
          break
        }
        SceneManager.push(Scene_Options);
        break

      case 'save':
        if ($gameSystem.isSaveEnabled() && !this.isBattlePause) {
          SceneManager.push(Scene_Save);
        } else {
          SoundManager.playBuzzer();
        }
        break

      case 'return':
        if (this.isBattlePause) {
          this.returnToBattle();
        } else {
          this.returnToMap();
        }
        break

      case 'common':
        this.returnToMap();
        setTimeout(() => {
          $gameTemp.reserveCommonEvent(button.commonEvent());
          $gameMap.requestRefresh();
        }, 300);
        break
    }
  }

  isMenuEnabled () {
    return $gameSystem.isMenuEnabled() && !this.isBattlePause
  }

  _tryEval (expression) {
    try {
      // eslint-disable-next-line no-eval
      return eval(expression)
    } catch (error) {
      console.error('An error occurred from running an expression', expression);
    }
  }
}

const isScene = function (scene) {
  return SceneManager._scene.constructor === scene
};

const updateKeypress$1 = function keyPress () {
  if (Input.isTriggered('pause')) {
    if (isScene(Scene_Map) && !$gameTemp.pauseDisabled) {
      SceneManager.push(Scene_GamePause);
    }
  }
};

const Scene_Map_Update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () {
  Scene_Map_Update.call(this);
  updateKeypress$1();
};

const Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
Scene_Map.prototype.updateCallMenu = function () {
  if (_Params.overrideMenuAccess && this.isMenuCalled() && !$gameTemp.pauseDisabled) {
    AudioManager.playSe(_Params.exitEnterSe);
    SceneManager.push(Scene_GamePause);
  } else {
    Scene_Map_updateCallMenu.call(this);
  }
};

const updateKeypress = function keyPress () {
  if (Input.isTriggered('pause') && !$gameTemp.pauseDisabled) {
    Vortex.load(Scene_GamePause);
    Vortex.scene.isBattlePause = true;
  }
};

const Scene_Battle_Update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function () {
  updateKeypress();
  if (Vortex.scene) {
    return
  }
  Scene_Battle_Update.call(this);
};

PluginManager.registerCommand(pluginName, 'pause', (args) => {
  const isBattlePause = JSON.parse(args.isBattlePause);
  if ($gameTemp.pauseDisabled) {
    return
  }
  if (isBattlePause) {
    Vortex.load(Scene_GamePause);
    Vortex.scene.isBattlePause = true;
    return
  }
  SceneManager.push(Scene_GamePause);
});

PluginManager.registerCommand(pluginName, 'setLocationName', (args) => {
  $gameTemp.pauseSceneLocation = args.name;
});

PluginManager.registerCommand(pluginName, 'disablePause', (args) => {
  $gameTemp.pauseDisabled = JSON.parse(args.disabled);
});

})();
