//=============================================================================
// JakeMSG_Debuggings.js
//=============================================================================
/*:
 * @plugindesc v1.0 - Debug options (MV & MZ compatible)
 * @author JakeMSG
 * @target MV MZ
 * v1.0
 * 
============ Change Log ============
1.0 - 3.13rd.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * Useful debugging options for developers. You can show the console on launch,
 * skip the title screen, draw event names on-map, and log every asset that is
 * used during gameplay.
 *
 * Compatible with RPG Maker MV and RPG Maker MZ.
 *
 * ============================================================================
 * Asset Usage Logging
 * ============================================================================
 * When "Log Asset Usages" is enabled, each asset load/play request prints a
 * line to the developer console, for example:
 *   [Asset:enemies]  Slime
 *   [Asset:bgm]      Battle1
 *
 * Asset types correspond to the folder the asset resides in:
 *   Images : animations, battlebacks1, battlebacks2, characters, enemies,
 *            faces, parallaxes, pictures, sv_actors, sv_enemies, system,
 *            tilesets, titles1, titles2, movies,
 *            effects (MZ only)
 *   Audio  : bgm, bgs, me, se
 * 
 * You can also enable/disable logging for the entire categories, by using "images" or "audio" as the type.
 * You can also enable/disable logging for all types at once with "all".
 *
 * ── Script-call API ─────────────────────────────────────────────────────────
 * logAsset(type)             Enable logging for <type>.
 * logAsset(type, true/false) Enable or disable logging for <type>.
 * logAsset("all")            Enable logging for every type at once.
 * logAsset("all", false)     Disable logging for every type at once.
 * logAsset("images")         Enable logging for all image/visual types.
 * logAsset("images", false)  Disable logging for all image/visual types.
 * logAsset("audio")          Enable logging for all audio types.
 * logAsset("audio", false)   Disable logging for all audio types.
 *
 * Examples (use in an event Script call):
 *   logAsset("enemies")        // start logging enemy image loads
 *   logAsset("bgm", false)     // stop logging BGM plays
 *   logAsset("images", false)  // silence all visual asset logging
 *   logAsset("audio")          // start logging all audio
 *   logAsset("all", false)     // silence all asset logging at runtime
 *   logAsset("all")            // re-enable all asset logging at runtime
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @param console
 * @text Show Console?
 * @type boolean
 * @on Show
 * @off No
 * @desc Open the development console when the game starts?
 * @default true
 *
 * @param drawEventsNames
 * @text Draw Events Names?
 * @type boolean
 * @on Yes, draw
 * @off No
 * @desc If true, events with a custom name (not "EV...") show their name above them on the map.
 * @default false
 *
 * @param noPlayTest
 * @text No PlayTest mode?
 * @type boolean
 * @on Cancel PlayTest
 * @off Keep PlayTest
 * @desc Force the game out of PlayTest mode when play testing.
 * @default false
 *
 * @param skipTitle
 * @text Skip Title?
 * @type boolean
 * @on Skip
 * @off No
 * @desc Skip the title screen and start a new game directly?
 * @default false
 *
 * @param focusGame
 * @text Focus Game Window?
 * @type boolean
 * @on Require
 * @off No
 * @desc If enabled, the game is always treated as focused and never pauses in the background.
 * @default false
 *
 * @param logAssets
 * @text Log Asset Usages?
 * @type boolean
 * @on Log
 * @off No
 * @desc Sets the initial logging state for all asset types. Can be changed per-type at runtime with logAsset() script call
 * @default false
 *
 */

(function () {

    // ── Parameters ────────────────────────────────────────────────────────────
    const parameters     = PluginManager.parameters('Debuggings');
    const IsShowConsole = eval(parameters.console         || 'true');
    const IsDrawEvNames = eval(parameters.drawEventsNames || 'false');
    const IsNoPlayTest  = eval(parameters.noPlayTest      || 'false');
    const IsSkipTitle   = eval(parameters.skipTitle       || 'false');
    const IsFocusGame   = eval(parameters.focusGame       || 'false');
    const IsLogAssets   = eval(parameters.logAssets       || 'false');


    // ═════════════════════════════════════════════════════════════════════════
    // SKIP TITLE  (MV & MZ)
    // ═════════════════════════════════════════════════════════════════════════
    (function () {
        if (!IsSkipTitle) return;

        //$[OVER]
        Scene_Boot.prototype.startNormalGame = function () {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Map);
        };
    })();

    // ═════════════════════════════════════════════════════════════════════════
    // NO PLAY TEST  (MV & MZ)
    // ═════════════════════════════════════════════════════════════════════════
    (function () {
        if (!IsNoPlayTest) return;

        //$[OVER]
        Game_Temp.prototype.isPlaytest = function () {
            return false;
        };
    })();

    // ═════════════════════════════════════════════════════════════════════════
    // FORCE FOCUS  (MV & MZ)
    // ═════════════════════════════════════════════════════════════════════════
    (function () {
        if (!IsFocusGame) return;

        //$[OVER]
        SceneManager.isGameActive = function () {
            return true;
        };
    })();

    // ═════════════════════════════════════════════════════════════════════════
    // SHOW CONSOLE ON GAME START  (MV & MZ)
    // ═════════════════════════════════════════════════════════════════════════
    (function () {
        if (!IsShowConsole) return;

        //@[ALIAS]
        const _SceneManager_run = SceneManager.run;
        SceneManager.run = function (sceneClass) {
            _SceneManager_run.call(this, sceneClass);
            this.showConsole();
        };
        //?NEW
        SceneManager.showConsole = function () {
            if (Utils.isNwjs()) {
                nw.Window.get().showDevTools();
                window.focus();
            }
        };
    })();

    // ═════════════════════════════════════════════════════════════════════════
    // ASSET USAGE LOGGING  (MV & MZ)
    // ═════════════════════════════════════════════════════════════════════════
    (function () {

        // Image/visual types (folder names). 'effects' is MZ-only; 'movies' exists in both.
        const _imageTypes = [
            'animations',  'battlebacks1', 'battlebacks2', 'characters',
            'enemies',     'faces',        'parallaxes',   'pictures',
            'sv_actors',   'sv_enemies',   'system',       'tilesets',
            'titles1',     'titles2',      'movies',       'effects'
        ];
        // Audio types.
        const _audioTypes = ['bgm', 'bgs', 'me', 'se'];
        const _types = _imageTypes.concat(_audioTypes);

        // Per-type enable flags — initial state is set by the plugin parameter.
        const _enabled = {};
        _types.forEach(t => { _enabled[t] = IsLogAssets; });

        /**
         * Script-call API exposed as a global:  logAsset(type [, enabled])
         *   type    – folder/type name, "all", "images", or "audio"
         *   enabled – boolean, default true
         */
        window.logAsset = function (type, enabled) {
            if (enabled === undefined) enabled = true;
            type = String(type).toLowerCase();
            if (type === 'all') {
                _types.forEach(t => { _enabled[t] = enabled; });
            } else if (type === 'images') {
                _imageTypes.forEach(t => { _enabled[t] = enabled; });
            } else if (type === 'audio') {
                _audioTypes.forEach(t => { _enabled[t] = enabled; });
            } else if (Object.prototype.hasOwnProperty.call(_enabled, type)) {
                _enabled[type] = enabled;
            } else {
                console.warn('[Debuggings] logAsset: unknown type "' + type + '". ' +
                    'Valid types: ' + _types.join(', ') + ', all, images, audio');
            }
        };

        var _recentLogKeys = [];
        function _log(type, name) {
            if (_enabled[type] && name) {
                var category = _audioTypes.indexOf(type) >= 0 ? 'Audio' : 'Image';
                var key = category + '|' + type + '|' + name;
                if (_recentLogKeys.indexOf(key) >= 0) return;
                _recentLogKeys.push(key);
                if (_recentLogKeys.length > 3) _recentLogKeys.shift();
                console.log('[' + category + ':' + type + '] ' + name);
            }
        }

        // ── Image hooks (same method names in MV and MZ) ──────────────────
        const _imgHooks = [
            { type: 'animations',   method: 'loadAnimation'   },
            { type: 'battlebacks1', method: 'loadBattleback1'  },
            { type: 'battlebacks2', method: 'loadBattleback2'  },
            { type: 'characters',   method: 'loadCharacter'    },
            { type: 'enemies',      method: 'loadEnemy'        },
            { type: 'faces',        method: 'loadFace'         },
            { type: 'parallaxes',   method: 'loadParallax'     },
            { type: 'pictures',     method: 'loadPicture'      },
            { type: 'sv_actors',    method: 'loadSvActor'      },
            { type: 'sv_enemies',   method: 'loadSvEnemy'      },
            { type: 'system',       method: 'loadSystem'       },
            { type: 'tilesets',     method: 'loadTileset'      },
            { type: 'titles1',      method: 'loadTitle1'       },
            { type: 'titles2',      method: 'loadTitle2'       }
        ];

        _imgHooks.forEach(function (hook) {
            if (typeof ImageManager[hook.method] !== 'function') return;
            const _orig = ImageManager[hook.method];
            const _type = hook.type;
            ImageManager[hook.method] = function (filename) {
                _log(_type, filename);
                return _orig.apply(this, arguments);
            };
        });

        // ── Audio hooks (same method names and audio.name in MV and MZ) ──
        const _audioHooks = [
            { type: 'bgm', method: 'playBgm' },
            { type: 'bgs', method: 'playBgs' },
            { type: 'me',  method: 'playMe'  },
            { type: 'se',  method: 'playSe'  }
        ];

        _audioHooks.forEach(function (hook) {
            if (typeof AudioManager[hook.method] !== 'function') return;
            const _orig = AudioManager[hook.method];
            const _type = hook.type;
            AudioManager[hook.method] = function (audio) {
                if (audio && audio.name) _log(_type, audio.name);
                return _orig.apply(this, arguments);
            };
        });

        // ── Movie/video hooks ─────────────────────────────────────────────
        // Strips path and extension from a video src string to get the bare name.
        function _videoName(src) {
            return String(src).replace(/\\/g, '/').split('/').pop().replace(/\.[^.]*$/, '');
        }
        // MV: Graphics.playVideo(src)
        if (typeof Graphics !== 'undefined' && typeof Graphics.playVideo === 'function') {
            const _origPlayVideo = Graphics.playVideo;
            Graphics.playVideo = function (src) {
                _log('movies', _videoName(src));
                return _origPlayVideo.apply(this, arguments);
            };
        }
        // MZ: Video.play(src)
        if (typeof Video !== 'undefined' && typeof Video.play === 'function') {
            const _origVideoPlay = Video.play;
            Video.play = function (src) {
                _log('movies', _videoName(src));
                return _origVideoPlay.apply(this, arguments);
            };
        }

        // ── Effects hook (MZ: EffectManager.load) ────────────────────────
        if (typeof EffectManager !== 'undefined' && typeof EffectManager.load === 'function') {
            const _origLoadEffect = EffectManager.load;
            EffectManager.load = function (filename) {
                _log('effects', filename);
                return _origLoadEffect.apply(this, arguments);
            };
        }

    })();

    // ═════════════════════════════════════════════════════════════════════════
    // DRAW EVENTS NAMES  (MV & MZ)
    // ═════════════════════════════════════════════════════════════════════════
    (function () {
        if (!IsDrawEvNames) return;

        let FONT_NAME = 'Arial';
        let FONT_SIZE = 15;

        let EventMessages = {
            structAlias: {
                Game_CharacterBase: {
                    initialize: Game_CharacterBase.prototype.initialize
                },
                Game_Event: {
                    setupPageSettings: Game_Event.prototype.setupPageSettings,
                    initialize: Game_Event.prototype.initialize
                },
                Sprite_Character: {
                    initialize: Sprite_Character.prototype.initialize,
                    update: Sprite_Character.prototype.update
                }
            }
        };

        Game_CharacterBase.prototype.initialize = function () {
            EventMessages.structAlias.Game_CharacterBase.initialize.apply(this);
            this.eText = null;
        };

        Game_Event.prototype.initialize = function (a, b) {
            EventMessages.structAlias.Game_Event.initialize.call(this, a, b);
            let name = this.event().name;
            if (name[0] == 'E' && name[1] == 'V') {
                // * Default Name, nothing
            } else {
                this.eText = name;
            }
        };

        Game_Event.prototype.setupPageSettings = function () {
            EventMessages.structAlias.Game_Event.setupPageSettings.apply(this);
            if (this.list != null) {
                var lst = this.page().list;
                for (var i = 0; i < lst.length; i++) {
                    var element = lst[i];
                    if (element.code == 108) {
                        var comment = element.parameters[0];
                        if (comment.indexOf("[@") >= 0) {
                            var regular = /\[@([^>]*)\]/;
                            var match = regular.exec(comment);
                            if (match) {
                                this.eText = match[1];
                            }
                            break;
                        }
                    }
                }
            }
        };

        Sprite_Character.prototype.initialize = function (character) {
            EventMessages.structAlias.Sprite_Character.initialize.apply(this, arguments);
            this._charText = "";
            this._eventText = null; //Sprite
            this.createEventText();
        };

        Sprite_Character.prototype.update = function () {
            EventMessages.structAlias.Sprite_Character.update.apply(this);
            this.createEventText();
            this.updateEventText();
        };

        //NEW
        Sprite_Character.prototype.createEventText = function () {
            if (!this._character) return;
            if (!this._character.eText) return;
            if (this._character.eText == this._charText) return;

            if (this._eventText != null) {
                this.removeChild(this._eventText);
            }

            this._eventText = new Sprite_Character_Text(this._character, this);
            this._charText = this._character.eText;
            this.addChild(this._eventText);
        };

        //NEW
        Sprite_Character.prototype.updateEventText = function () {
            if (this._eventText == null) return;
            this._eventText.updatePosition(this._character, this);
        };

        //------------------------------------------------------------------------------
        //Sprite_Character_Text
        class Sprite_Character_Text extends Sprite {
            constructor(character, sprite) {
                super();
                var textSize = character.eText || "";
                var w = 48 + ((FONT_SIZE / 2) * textSize.length);
                if (w < 48) w = 48;
                this.bitmap = new Bitmap(w, 48);
                this.bitmap.addLoadListener(function () {
                    this.bitmap.fontFace = FONT_NAME;
                    this.bitmap.fontSize = FONT_SIZE;
                    this.bitmap.drawText(textSize, 0, 0, this.width, this.height, 'center');
                }.bind(this));
                this.updatePosition(character, sprite);
            }

            updatePosition(character, sprite) {
                if (character._erased) {
                    this.visible = false;
                    return;
                }
                this.x = 0 - this.width / 2;
                this.y = 0 - (sprite.height + this.height);
                this.z = character.screenZ();
                this.visible = character.isTransparent() ? false : true;
                this.opacity = character._opacity;
            }
        }

    })();

})();