//=============================================================================
// Screen_Animation ver 1.0.3 + JakeMSG Addition
// by Pasunna
// version
// ==== JakeMSG: 2/6th/2025 - Added global offsets to the Coordinates used in the functions (useful when you use other Zoom/Scaling plugins at the same time)

// 1.0.3 12/05/2020 add script call to target event player or folower
// 1.0.2 10/03/2020 add animation rating option(fix more help typo)
// 1.0.1 05/03/2020 fix typo and add more option
// 1.0 04/03/2020 release
//=============================================================================

/*:
 * @plugindesc show Animation on screen at x,y coordination and optinal to tweak scale delay mirror fps
 * @author Pasunna
 * @help This plugin does not provide plugin commands.
 *
 * use script call
 * play_screen_animation(aid, x, y, sx, sy, delay, mirror,rating)
 * aid = Animation Id
 * x = x on screen
 * y = y on screen
 * 
 * other than x,y is optional
 * sx = scale of animation in horizontal(1 = 100% default : 1)
 * sy = scale of animation in vertical(1 = 100% default : 1)
 * delay = delay before start the animation  (default : 0)
 * mirror = flip the animation image(true/false default : false)
 * rating = how fast the fps of animation (default : 4)
 * rating 4 = 16 fps there are 1-4 1 = 60 fps
 * 
 * example
 * play_screen_animation(1, 100,250, 1, 1, 100, false, 1)
 * play animation 1 at 100,250 of the screen with scale 1,1 and delay 100 no mirror effect
 * 60 fps animation speed
 * *
 * play_screen_animation(1, 100,250, 2.5, 0.5)
 * 0 delay no mirror default animation speed
 * *
 * play_screen_animation(1, 100,250)
 * scale 1,1 0 delay no mirror
 * *
 * with variable
 * play_screen_animation(1, $gameVariables.value(1), $gameVariables.value(2));
 * play_screen_animation(1, $gameMap.event(12).screenX(), $gameMap.event(12).screenY());
 * 
 * the animation is above all layer
 * (above the parallax or time lighting tint layer if you use one)
 * 
 * ver 1.0.3
 * script
 * PSA_on_event(aid, id, offsetX, offsetY, sx, sy, delay, mirror,rating)
 * play_screen_animation_on_event(aid, id, offsetX, offsetY, sx, sy, delay, mirror,rating)
 * add id
 * id is the id of event you want to play animation on(still above everything)
 * 0 - no event don't run...
 * -1 - player
 * -2+ - follower 
 * offsetX,offsetY - offset position from the event's position
 * 
 *
 * ================ JakeMSG additions (Parameters)
 *
 * @param == For "play_screen_animation" function ==
 * @desc Formula for the global offsets: "(X/yoffset * globalOffsetMultiplier) + globalOffsetAdderSubtracter"
 * @default
 *
 * @param == For "PSA_on_event" function ==
 * @desc Formula for the global offsets: "(X/yoffset * globalOffsetMultiplier) + globalOffsetAdderSubtracter"
 * @default
 *
 * @param PSA X Offset Multiplier
 * @parent == For "play_screen_animation" function ==
 * @desc Sets the multiplier for the X offset (done BEFORE the "Offset Adder/Subtracter");
 * Default: 1 
 * @default 1
 *
 * @param PSA Y Offset Multiplier
 * @parent == For "play_screen_animation" function ==
 * @desc Sets the multiplier for the Y offset (done BEFORE the "Offset Adder/Subtracter");
 * Default: 1 
 * @default 1
 *
 * @param PSA X Offset Adder/Subtracter
 * @parent == For "play_screen_animation" function ==
 * @desc Sets the Adder/Subtracter (if negative number introduced) for the X offset (done AFTER the "Offset Multiplier");
 * Default: 0 
 * @default 0
 *
 * @param PSA Y Offset Adder/Subtracter
 * @parent == For "play_screen_animation" function ==
 * @desc Sets the Adder/Subtracter (if negative number introduced) for the Y offset (done AFTER the "Offset Multiplier");
 * Default: 0 
 * @default 0
 *
 * @param PSAOE X Offset Multiplier
 * @parent == For "PSA_on_event" function ==
 * @desc Sets the multiplier for the X offset (done BEFORE the "Offset Adder/Subtracter");
 * Default: 1 
 * @default 1
 *
 * @param PSAOE Y Offset Multiplier
 * @parent == For "PSA_on_event" function ==
 * @desc Sets the multiplier for the Y offset (done BEFORE the "Offset Adder/Subtracter");
 * Default: 1 
 * @default 1
 *
 * @param PSAOE X Offset Adder/Subtracter
 * @parent == For "PSA_on_event" function ==
 * @desc Sets the Adder/Subtracter (if negative number introduced) for the X offset (done AFTER the "Offset Multiplier");
 * Default: 0
 * @default 0
 *
 * @param PSAOE Y Offset Adder/Subtracter
 * @parent == For "PSA_on_event" function ==
 * @desc Sets the Adder/Subtracter (if negative number introduced) for the Y offset (done AFTER the "Offset Multiplier");
 * Default: 0
 * @default 0
 */ 


(function() {
    var parameters = PluginManager.parameters('Screen_Animation');
    
    var PSA_X_off_mult = Number(parameters['PSA X Offset Multiplier'] || 1);
    var PSA_Y_off_mult = Number(parameters['PSA Y Offset Multiplier'] || 1);
    var PSA_X_off_addsub = Number(parameters['PSA X Offset Adder/Subtracter'] || 0);
    var PSA_Y_off_addsub = Number(parameters['PSA Y Offset Adder/Subtracter'] || 0);
    
    var PSAOE_X_off_mult = Number(parameters['PSAOE X Offset Multiplier'] || 1);
    var PSAOE_Y_off_mult = Number(parameters['PSAOE Y Offset Multiplier'] || 1);
    var PSAOE_X_off_addsub = Number(parameters['PSAOE X Offset Adder/Subtracter'] || 0);
    var PSAOE_Y_off_addsub = Number(parameters['PSAOE Y Offset Adder/Subtracter'] || 0);
    
  
  play_screen_animation_on_player = function(aid, x, y, sx, sy, delay, mirror,rating) {
    var x = $gamePlayer.screenX() + x;
    var y = $gamePlayer.screenY() + y;
    var sx = sx ? sx : 1;
    var sy = sy ? sy : 1;
    var rating = rating ? rating : 4;
    var delay = delay ? delay : 0;
    var mirror = mirror ? mirror : false;
    SceneManager._scene.สร้างอนิเมชั่น(aid, x, y, sx, sy, delay, mirror,rating)
  
  };

  เล่นอนิเมชั่นอีเวนต์ = PSA_on_event = play_screen_animation_on_event = function(aid, id, x, y, sx, sy, delay, mirror,rating) {
    //testtext()
    var target = null;
    if (id >= -1) {
			switch (id) {
				case -1:
					// Player
					target = $gamePlayer;
					break;
				default:
					// Event
					target = $gameMap.event(id);
					break;
			};
		
		} else {
			// Follower
			var f = Math.abs(id) - 2;			
			if (f <= $gameParty.battleMembers().length){
        target = $gamePlayer._followers.follower(f);
      }
    };
    if(target === null) return 
    var x = target.screenX() + x;
    var y = target.screenY() + y;
    
    x = (x * PSAOE_X_off_mult) + PSAOE_X_off_addsub;
    y = (y * PSAOE_Y_off_mult) + PSAOE_Y_off_addsub;
    
    var sx = sx ? sx : 1;
    var sy = sy ? sy : 1;
    var rating = rating ? rating : 4;
    var delay = delay ? delay : 0;
    var mirror = mirror ? mirror : false;
    SceneManager._scene.สร้างอนิเมชั่น(aid, x, y, sx, sy, delay, mirror,rating)
  
  };
  play_screen_animation = function(aid, x, y, sx, sy, delay, mirror,rating) {
    var x = (x * PSA_X_off_mult) + PSA_X_off_addsub;
    var y = (y * PSA_Y_off_mult) + PSA_Y_off_addsub;
    
    var sx = sx ? sx : 1;
    var sy = sy ? sy : 1;
    var rating = rating ? rating : 4;
    var delay = delay ? delay : 0;
    var mirror = mirror ? mirror : false;
    SceneManager._scene.สร้างอนิเมชั่น(aid, x, y, sx, sy, delay, mirror,rating)
  
  };
  อนิเมชั่น_แมพ = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    อนิเมชั่น_แมพ.call(this);
  
  }
  
  Scene_Map.prototype.สร้างอนิเมชั่น = function(aid, x, y, sx, sy, delay, mirror, rating) {
    var อนิเมชั่น = new แมพ_อนิเมชั่น(aid, x, y, sx, sy, delay, mirror, rating);
    this.addChild(อนิเมชั่น) 
  }
  
  function แมพ_อนิเมชั่น() {
    this.initialize.apply(this, arguments);
  }
  แมพ_อนิเมชั่น.prototype = Object.create(Sprite.prototype);
  แมพ_อนิเมชั่น.prototype.constructor = แมพ_อนิเมชั่น;
  
  แมพ_อนิเมชั่น.prototype.initialize = function(aid, x, y, sx, sy, delay, mirror, rating) {
      Sprite.prototype.initialize.call(this);
      this._animationSprites = [];
      this._effectTarget = this;
      this._hiding = false;
      var animation = $dataAnimations[aid];    
      this.startAnimation(animation, mirror, delay, x, y, sx, sy, rating);
  };
  แมพ_อนิเมชั่น.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateVisibility();
    this.updateAnimationSprites();
  };
  
  แมพ_อนิเมชั่น.prototype.hide = function() {
    this._hiding = true;
    this.updateVisibility();
  };
  
  แมพ_อนิเมชั่น.prototype.show = function() {
    this._hiding = false;
    this.updateVisibility();
  };
  
  แมพ_อนิเมชั่น.prototype.updateVisibility = function() {
    this.visible = !this._hiding;
  };
  
  แมพ_อนิเมชั่น.prototype.updateAnimationSprites = function() {
    if (this._animationSprites.length > 0) {
        var sprites = this._animationSprites.clone();
        this._animationSprites = [];
        for (var i = 0; i < sprites.length; i++) {
            var sprite = sprites[i];
            if (sprite.isPlaying()) {
                this._animationSprites.push(sprite);
            } else {
              //testtext(this)
                sprite.remove();
                SceneManager._scene.removeChild(this)
            }
        }
    }
  };
  
  แมพ_อนิเมชั่น.prototype.startAnimation = function(animation, mirror, delay, x, y,sx,sy, rating) {
    var sprite = new แมพ_Sprite_Animation(x, y, sx, sy, rating);
    sprite.setup(this._effectTarget, animation, mirror, delay);
    this.addChild(sprite);
    this._animationSprites.push(sprite);
  };
  
  แมพ_อนิเมชั่น.prototype.isAnimationPlaying = function() {
    return this._animationSprites.length > 0;
  };
  //-----------------------------------------------------------------------------
  // Sprite_Animation
  //
  // The sprite for displaying an animation.
  
  function แมพ_Sprite_Animation() {
    this.initialize.apply(this, arguments);
  }
  
  แมพ_Sprite_Animation.prototype = Object.create(Sprite.prototype);
  แมพ_Sprite_Animation.prototype.constructor = แมพ_Sprite_Animation;
  
  แมพ_Sprite_Animation._checker1 = {};
  แมพ_Sprite_Animation._checker2 = {};
  
  แมพ_Sprite_Animation.prototype.initialize = function(x, y, sx, sy, rating) {
    Sprite.prototype.initialize.call(this);
    this._reduceArtifacts = true;
    this.x = x;
    this.y = y;
    this.scale.x = sx;
    this.scale.y = sy;
    this.mod_rating = rating;
    this.initMembers();
  };
  
  แมพ_Sprite_Animation.prototype.initMembers = function() {
    this._target = null;
    this._animation = null;
    this._mirror = false;
    this._delay = 0;
    this._rate = this.mod_rating//4;
    this._duration = 0;
    this._flashColor = [0, 0, 0, 0];
    this._flashDuration = 0;
    this._screenFlashDuration = 0;
    this._hidingDuration = 0;
    this._bitmap1 = null;
    this._bitmap2 = null;
    this._cellSprites = [];
    this._screenFlashSprite = null;
    this._duplicated = false;
    this.z = 8;
  };
  
  แมพ_Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
    this._target = target;
    this._animation = animation;
    this._mirror = mirror;
    this._delay = delay;
    if (this._animation) {
        this.remove();
        this.setupRate();
        this.setupDuration();
        this.loadBitmaps();
        this.createSprites();
    }
  };
  
  แมพ_Sprite_Animation.prototype.remove = function() {
    if (this.parent && this.parent.removeChild(this)) {
        this._target.setBlendColor([0, 0, 0, 0]);
        this._target.show();
    }
  };
  
  แมพ_Sprite_Animation.prototype.setupRate = function() {
    this._rate = this.mod_rating//4;
  };
  
  แมพ_Sprite_Animation.prototype.setupDuration = function() {
    this._duration = this._animation.frames.length * this._rate + 1;
  };
  
  แมพ_Sprite_Animation.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateMain();
    this.updateFlash();
    this.updateScreenFlash();
    this.updateHiding();
    แมพ_Sprite_Animation._checker1 = {};
    แมพ_Sprite_Animation._checker2 = {};
  };
  
  แมพ_Sprite_Animation.prototype.updateFlash = function() {
    if (this._flashDuration > 0) {
        var d = this._flashDuration--;
        this._flashColor[3] *= (d - 1) / d;
        this._target.setBlendColor(this._flashColor);
    }
  };
  
  แมพ_Sprite_Animation.prototype.updateScreenFlash = function() {
    if (this._screenFlashDuration > 0) {
        var d = this._screenFlashDuration--;
        if (this._screenFlashSprite) {
            this._screenFlashSprite.x = -this.absoluteX();
            this._screenFlashSprite.y = -this.absoluteY();
            this._screenFlashSprite.opacity *= (d - 1) / d;
            this._screenFlashSprite.visible = (this._screenFlashDuration > 0);
        }
    }
  };
  
  แมพ_Sprite_Animation.prototype.absoluteX = function() {
    var x = 0;
    var object = this;
    while (object) {
        x += object.x;
        object = object.parent;
    }
    return x;
  };
  
  แมพ_Sprite_Animation.prototype.absoluteY = function() {
    var y = 0;
    var object = this;
    while (object) {
        y += object.y;
        object = object.parent;
    }
    return y;
  };
  
  แมพ_Sprite_Animation.prototype.updateHiding = function() {
    if (this._hidingDuration > 0) {
        this._hidingDuration--;
        if (this._hidingDuration === 0) {
            this._target.show();
        }
    }
  };
  
  แมพ_Sprite_Animation.prototype.isPlaying = function() {
    return this._duration > 0;
  };
  
  แมพ_Sprite_Animation.prototype.loadBitmaps = function() {
    var name1 = this._animation.animation1Name;
    var name2 = this._animation.animation2Name;
    var hue1 = this._animation.animation1Hue;
    var hue2 = this._animation.animation2Hue;
    this._bitmap1 = ImageManager.loadAnimation(name1, hue1);
    this._bitmap2 = ImageManager.loadAnimation(name2, hue2);
  };
  
  แมพ_Sprite_Animation.prototype.isReady = function() {
    return this._bitmap1 && this._bitmap1.isReady() && this._bitmap2 && this._bitmap2.isReady();
  };
  
  แมพ_Sprite_Animation.prototype.createSprites = function() {
    if (!แมพ_Sprite_Animation._checker2[this._animation]) {
        this.createCellSprites();
        if (this._animation.position === 3) {
            แมพ_Sprite_Animation._checker2[this._animation] = true;
        }
        this.createScreenFlashSprite();
    }
    if (แมพ_Sprite_Animation._checker1[this._animation]) {
        this._duplicated = true;
    } else {
        this._duplicated = false;
        if (this._animation.position === 3) {
            แมพ_Sprite_Animation._checker1[this._animation] = true;
        }
    }
  };
  
  แมพ_Sprite_Animation.prototype.createCellSprites = function() {
    this._cellSprites = [];
    for (var i = 0; i < 16; i++) {
        var sprite = new Sprite();
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        this._cellSprites.push(sprite);
        this.addChild(sprite);
    }
  };
  
  แมพ_Sprite_Animation.prototype.createScreenFlashSprite = function() {
    this._screenFlashSprite = new ScreenSprite();
    this.addChild(this._screenFlashSprite);
  };
  
  แมพ_Sprite_Animation.prototype.updateMain = function() {
    if (this.isPlaying() && this.isReady()) {
        if (this._delay > 0) {
            this._delay--;
        } else {
            this._duration--;
            this.updatePosition();
            if (this._duration % this._rate === 0) {
                this.updateFrame();
            }
        }
    }
  };
  
  แมพ_Sprite_Animation.prototype.updatePosition = function() {
  
    return
    this.x = 300
    this.y = 300
    if (this._animation.position === 3) {
        this.x = this.parent.width / 2;
        this.y = this.parent.height / 2;
    } else {
        var parent = this._target.parent;
        var grandparent = parent ? parent.parent : null;
        this.x = this._target.x;
        this.y = this._target.y;
        if (this.parent === grandparent) {
            this.x += parent.x;
            this.y += parent.y;
        }
        if (this._animation.position === 0) {
            this.y -= this._target.height;
        } else if (this._animation.position === 1) {
            this.y -= this._target.height / 2;
        }
    }
  };
  
  แมพ_Sprite_Animation.prototype.updateFrame = function() {
    if (this._duration > 0) {
        var frameIndex = this.currentFrameIndex();
        this.updateAllCellSprites(this._animation.frames[frameIndex]);
        this._animation.timings.forEach(function(timing) {
            if (timing.frame === frameIndex) {
                this.processTimingData(timing);
            }
        }, this);
    }
  };
  
  แมพ_Sprite_Animation.prototype.currentFrameIndex = function() {
    return (this._animation.frames.length -
            Math.floor((this._duration + this._rate - 1) / this._rate));
  };
  
  แมพ_Sprite_Animation.prototype.updateAllCellSprites = function(frame) {
    for (var i = 0; i < this._cellSprites.length; i++) {
        var sprite = this._cellSprites[i];
        if (i < frame.length) {
            this.updateCellSprite(sprite, frame[i]);
        } else {
            sprite.visible = false;
        }
    }
  };
  
  แมพ_Sprite_Animation.prototype.updateCellSprite = function(sprite, cell) {
    var pattern = cell[0];
    if (pattern >= 0) {
        var sx = pattern % 5 * 192;
        var sy = Math.floor(pattern % 100 / 5) * 192;
        var mirror = this._mirror;
        sprite.bitmap = pattern < 100 ? this._bitmap1 : this._bitmap2;
        sprite.setFrame(sx, sy, 192, 192);
        sprite.x = cell[1];
        sprite.y = cell[2];
        sprite.rotation = cell[4] * Math.PI / 180;
        sprite.scale.x = cell[3] / 100;
  
        if(cell[5]){
            sprite.scale.x *= -1;
        }
        if(mirror){
            sprite.x *= -1;
            sprite.rotation *= -1;
            sprite.scale.x *= -1;
        }
  
        sprite.scale.y = cell[3] / 100;
        sprite.opacity = cell[6];
        sprite.blendMode = cell[7];
        sprite.visible = true;
    } else {
        sprite.visible = false;
    }
  };
  
  แมพ_Sprite_Animation.prototype.processTimingData = function(timing) {
    var duration = timing.flashDuration * this._rate;
    switch (timing.flashScope) {
    case 1:
        this.startFlash(timing.flashColor, duration);
        break;
    case 2:
        this.startScreenFlash(timing.flashColor, duration);
        break;
    case 3:
        this.startHiding(duration);
        break;
    }
    if (!this._duplicated && timing.se) {
        AudioManager.playSe(timing.se);
    }
  };
  
  แมพ_Sprite_Animation.prototype.startFlash = function(color, duration) {
    this._flashColor = color.clone();
    this._flashDuration = duration;
  };
  
  แมพ_Sprite_Animation.prototype.startScreenFlash = function(color, duration) {
    this._screenFlashDuration = duration;
    if (this._screenFlashSprite) {
        this._screenFlashSprite.setColor(color[0], color[1], color[2]);
        this._screenFlashSprite.opacity = color[3];
    }
  };
  
  แมพ_Sprite_Animation.prototype.startHiding = function(duration) {
    this._hidingDuration = duration;
    this._target.hide();
  };
  

})();