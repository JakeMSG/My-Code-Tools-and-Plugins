//=============================================================================
// JakeMSG_AudioMultiChannels
// JakeMSG_AudioMultiChannels.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_AudioMultiChannels = true;


//=============================================================================
 /*:
 * @plugindesc v1.0 Adds multi-channels to all audio types (BGM/BGS/ME/SE) for independent simultaneous playback
   and control, plus new features for "YEP_FootstepSounds" plugin (for MV),
   or "ToshA_Footsteps" plugin (for MZ) if present.
   Plugin works for both MV and MZ, but the footstep features only apply if you 
   have the respective footstep plugin for your engine.
 * @author JakeMSG
 * v1.0
============ Change Log ============
1.1 - 5.3rd.2026
 * added event-page comment tags for event-local footsteps:
 *   <Footsteps: ...>
 *   <Footstep Cycle: ...>
 * tag-based event footsteps now take priority over plugin/default map-region-
 * terrain sources for that specific event only (channel 0 / This Event).
1.0 - 3.17th.2026
 * initial release
================================
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * Extends MV&MZ audio handling so each audio type (BGM/BGS/ME/SE) is managed as
 * an array of channels. Legacy engine calls still control channel 0 so older
 * script calls and events keep working.
 * 
 * Keep in mind, all the script calls have default values for all their parameters, so you can choose to only specify the ones you want to change.
 * 
 * 
 * ============================================================================
 * Script Calls (legacy)
 * ============================================================================
 * bgmPlay(name, volume = 100, pitch = 100, pan = 0)
 * bgsPlay(name, volume = 100, pitch = 100, pan = 0)
 * mePlay(name,  volume = 100, pitch = 100, pan = 0)
 * sePlay(name,  volume = 100, pitch = 100, pan = 0)
 * - unchanged; operate on channel 0 of each array.
 * 
 * ============================================================================
 * New Indexed Script Calls
 * ============================================================================
 * bgmXPlay(index = 1, name = "", volume = 100, pitch = 100, pan = 0)
 * bgsXPlay(index = 1, name = "", volume = 100, pitch = 100, pan = 0)
 * meXPlay(index = 1,  name = "", volume = 100, pitch = 100, pan = 0)
 * seXPlay(index = 1,  name = "", volume = 100, pitch = 100, pan = 0)
 * - Plays the specified audio on the given channel without affecting others.
 * - Channel 0 remains the engine/default channel.
 * - Leaving the name empty ("") stops the audio on that channel without affecting others (this can be used to stop sound for any given channel)
 * 
 * bgsXFade(index = 1, seconds = 1)
 * - Fades out only the specified BGS channel.
 * 
 * seXStop(index = 1)
 * - Stops only the specified SE channel.
 * 
 * bgsXAllFade(seconds = 1)
 * bgsXOnlyFade(seconds = 1)
 * - Fade all BGS channels; OnlyFade skips channel 0.
 * 
 * seXAllStop()
 * seXOnlyStop()
 * - Stop all SE channels; OnlyStop skips channel 0.
 * 
 * ============================================================================
 * Footstep Extras (For MV: "YEP_FootstepSounds" addition; For MZ: "ToshA_Footsteps" addition)
 * ============================================================================
 * setXFootstep(index = 1, name = "", volume = 20, pitch = 150, scope = "All",
 *             maxPitch = 0, distance = 0)
 *   - Sets/overwrites only slot 0 (one footstep Sound, not a cycle) of the chosen footstep set (clears others).
 *          - If this index previously had a footstep cycle with multiple sounds, those are cleared and replaced with the single sound specified here.
 *   - Leaving name empty ("") silences that index (the entirety of the footstep cycle) without affecting others (can be used to stop sound for that index).
 *   * This is used when you only use one SE for the footstep chosen
 * setXFootstepElement(index = 1, elementIndex = 1, name = "", scope = "All",
 *                    maxPitch = 0, distance = 0)
 *   - Sets a specific element (slot in the footstep Sound cycle) inside the chosen footstep set (shared vol/pitch with all other sounds of the same footstep sound cycle).
 *   * This is used when you want to use multiple SEs for the footstep chosen and cycle between them.
 * setXFootstepCycle(index = 1, names = [], volume = 20, pitch = 150,
 *                   cycleType = "Cycle", scope = "All", maxPitch = 0,
 *                   distance = 0)
 *   - Bulk-sets the list for a footstep set and its cycling mode.
 * setXFootstepMode(index = 1, mode = "Cycle", scope = "All")
 *   - Changes the cycling mode ("Cycle" or "Random") of a footstep set.
 * clearAllXFootsteps(scope = "All")
 *   - Clears all extra footstep channels except channel 0 for the scope.
 * clearAllFootsteps(scope = "All")
 *   - Clears every footstep channel including channel 0 for the scope.
 *
 * ============================================================================
 * Event Comment Tags (Map Event comments)
 * ============================================================================
 * Put these tags inside Comment event commands (same style as plugins like
 * YEP_EventMiniLabel).
 *
 * These tags affect only event that owns comment tag, and target scope
 * "This Event" on channel 0.
 *
 * Comment Tags take the highest priority for footstep SFX for that event (except additional script calls that target the same channel/scope)
 *
 * If multiple matching tags exist in active page comments, last matching tag
 * on that page is the one used.
 *
 * <Footsteps: name, volume, pitch, maxPitch, distance>
 *   - Same parameter behavior/defaults as setXFootstep (for channel 0,
 *     This Event scope).
 *   - Defaults: name="", volume=20, pitch=150, maxPitch=0, distance=0.
 *
 * <Footstep Cycle: names, volume, pitch, cycleType, maxPitch, distance>
 *   - Same parameter behavior/defaults as setXFootstepCycle (for channel 0,
 *     This Event scope).
 *   - names can be one sound (Step1) or array (["Step1","Step2"]).
 *   - Defaults: names=[], volume=20, pitch=150, cycleType="Cycle",
 *     maxPitch=0, distance=0.
 *
 * Event Comment Tag Examples:
 *   <Footsteps: Step_Stone, 30, 120>
 *   <Footsteps: Step_Grass, 28, 110, 150, 6>
 *   <Footstep Cycle: ["StepA","StepB"], 22, 130, Random>
 *   <Footstep Cycle: Step_Sand, 20, 125, Cycle, 145, 4>
 * 
 * Notes:
 *   - Clearing channel 0 via any script call that can clear it or set it to "", will keep it silent
 *     only until the next notetag/region/tileset change updates it. 
 *             - This can be used as a way to implement "sneaking" as audio
 *   - Channel 0 is now also cycle-capable (Cycle/Random), using the same slot model.
 *   - MV + YEP only ("ToshA_Footsteps" innately supports cycles): YEP default/map/tileset footstep data can now be single name
 *     or list of names, plus optional cycleType (Cycle/Random).
 *   - MV + YEP only ("ToshA_Footsteps" innately supports cycles): notetag now supports optional cycleType at the end:
 *       <Terrain Tag x Footstep Sound: ["A","B"], 80, 120, Random>
 *       <Region x Footstep Sound: Step1, 90, 130, Cycle>
 *   - maxPitch: if > pitch, pitch is treated as min pitch and random pitch in
 *     [pitch, maxPitch] is used. If 0 or <= pitch, fixed pitch is used.
 *   - distance: for event footsteps only, if > 0 the slot is only heard inside
 *     that distance from player, with linear volume falloff to 0 at max distance.
 *   - MV uses YEP for base slot data; MZ uses ToshA_Footsteps base playback and
 *     this plugin adds channel/scoped multi-footstep behavior.
 *   - Clearing channel 0 via setXFootstep("") or clearAllFootsteps() keeps
 *     it silent until the next notetag/region/tileset change updates it.
 *   - Each footstep set stores: list of SE entries, shared volume/pitch,
 *     and cycling mode. Modes:
 *       Cycle  – iterate through list in order (looping).
 *       Random – pick a random entry each step.
 *   - scope options: "All" (default, affects everyone); "Player" or -1;
 *     a specific event id number; or keywords "This", "ThisEvent" to target
 *     the calling event. Unrecognized scope falls back to All.
 *   - Event comment tags (<Footsteps: ...> / <Footstep Cycle: ...>) use
 *     channel 0 and "This Event" semantics automatically.
 *
 * Examples:
 *   setXFootstep(2, "Step_Grass", 30, 120)              // channel 2, affects All (Player and events)
 *   setXFootstep(1, "", 20, 150, "Player")              // silence (resets channel1), for Player only
 *   setXFootstepElement(3, 2, "Stone2", "5")           // event id 5, slot2
 *   setXFootstepCycle(1, ["Rock1","Rock2"], 25, 140, "Cycle", "All")
 *   setXFootstepCycle(1, ["Rock1","Rock2"], 25, 120, "Random", "All", 150, 7)
 *   setXFootstepMode(1, "Random", "Player")
 *   setXFootstep(2, "Step_Grass", 35, 110, "All", 140, 6)
 *   setXFootstepElement(2, 2, "Step_Grass_Alt", "All", 150, 4)
 *   clearAllXFootsteps()                                 // all scopes
 *   clearAllFootsteps("Player")                         // player only
 * 
 * 
 * 
 * 
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @plugindesc Audio Multi Channels - Adds the ability to play multiple BGM/BGS/ME/SE 
 * at the same time, with independent control over each of them.
 * Also new features for "YEP_FootstepSounds" plugin if present.
 * @author JakeMSG
 * v1.2
 *
 * @param YEP Parameters Overwrite
 * @default 
 * @desc Parent parameter label for YEP_FootstepSounds overwrite settings.
 *
 * @param Use this plugin's parameter for Default Footstep Sound
 * @parent YEP Parameters Overwrite
 * @type boolean
 * @default false
 * @desc Use the following parameter for the Default Footstep Sound (which also supports footstep Cycle), instead of "YEP_FootstepSounds"'s "Default Sound" parameter.
 *
 * @param Default Footstep Sound
 * @parent YEP Parameters Overwrite
 * @type string[]
 * @default ["Move1"]
 * @desc Default footstep sound list used when overwrite is enabled. Supports cycles.
 *
 * @param Cycling type
 * @parent YEP Parameters Overwrite
 * @type select
 * @option Cycle
 * @value Cycle
 * @option Random
 * @value Random
 * @default Cycle
 * @desc Cycling type for the overwrite Default Footstep Sound.
 */
//=============================================================================


//=============================================================================
// ======== INTERNAL HELPERS ========
//=============================================================================
(function() {
    var JakeMSG_AMC = window.JakeMSG_AMC || {};
    window.JakeMSG_AMC = JakeMSG_AMC;

    var isMZ = (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME === 'MZ');
    var audioFolder = function(kind) { return isMZ ? kind + '/' : kind; };
    var audioPath = function(kind) { return kind + '/'; };
    var pluginParams = (typeof PluginManager !== 'undefined' && PluginManager.parameters)
        ? (PluginManager.parameters('JakeMSG_AudioMultiChannels') || {}) : {};

    var parseStringArray = function(value) {
        if (Array.isArray(value)) {
            return value.map(function(x) { return String(x || '').trim(); }).filter(function(x) { return !!x; });
        }
        if (value === undefined || value === null || value === '') return [];
        try {
            var parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map(function(x) { return String(x || '').trim(); }).filter(function(x) { return !!x; });
            }
        } catch (e) {
            // Fallback to single string below.
        }
        var single = String(value || '').trim();
        return single ? [single] : [];
    };

    var normalizeCycleMode = function(mode) {
        var m = String(mode || 'Cycle').toLowerCase();
        return m === 'random' ? 'Random' : 'Cycle';
    };

    var toNumberOr = function(value, fallback) {
        var num = Number(value);
        return isNaN(num) ? fallback : num;
    };

    // ---------------------------------------------------------------------
    // Audio slot helpers
    // ---------------------------------------------------------------------
    var toIndex = function(value, fallback) {
        var num = Number(value);
        return isNaN(num) ? fallback : Math.max(0, Math.floor(num));
    };

    var ensureSlot = function(store, index, initializer) {
        if (!AudioManager[store]) AudioManager[store] = [];
        if (!AudioManager[store][index]) AudioManager[store][index] = initializer();
        return AudioManager[store][index];
    };

    var ensureBgmSlot = function(index) {
        return ensureSlot('_bgmSlots', index, function() { return { buffer: null, current: null }; });
    };

    var ensureBgsSlot = function(index) {
        return ensureSlot('_bgsSlots', index, function() { return { buffer: null, current: null }; });
    };

    var ensureMeSlot = function(index) {
        return ensureSlot('_meSlots', index, function() { return { buffer: null, current: null }; });
    };

    var ensureSeSlot = function(index) {
        return ensureSlot('_seSlots', index, function() { return { buffers: [] }; });
    };

    var syncAliases = function() {
        var bgm0 = ensureBgmSlot(0);
        var bgs0 = ensureBgsSlot(0);
        var me0  = ensureMeSlot(0);
        var se0  = ensureSeSlot(0);
        AudioManager._currentBgm = bgm0.current;
        AudioManager._bgmBuffer  = bgm0.buffer;
        AudioManager._currentBgs = bgs0.current;
        AudioManager._bgsBuffer  = bgs0.buffer;
        AudioManager._meBuffer   = me0.buffer;
        AudioManager._currentMe  = me0.current;
        AudioManager._seBuffers  = se0.buffers;
    };

    // Initialize slot containers if they do not exist yet.
    AudioManager._bgmSlots = AudioManager._bgmSlots || [];
    AudioManager._bgsSlots = AudioManager._bgsSlots || [];
    AudioManager._meSlots  = AudioManager._meSlots  || [];
    AudioManager._seSlots  = AudioManager._seSlots  || [];
    syncAliases();

    // ---------------------------------------------------------------------
    // BGM overrides
    // ---------------------------------------------------------------------
    AudioManager.playBgm = function(bgm, pos, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgmSlot(slotId);
        var meSlot = ensureMeSlot(0);
        if (this.isCurrentBgm(bgm, slotId)) {
            this.updateBgmParameters(bgm, slotId);
        } else {
            this.stopBgm(slotId);
            if (bgm && bgm.name) {
                var canEncrypted = (typeof Decrypter !== 'undefined' && Decrypter.hasEncryptedAudio && typeof this.shouldUseHtml5Audio === 'function');
                if (canEncrypted && this.shouldUseHtml5Audio() && slotId === 0) {
                    this.playEncryptedBgm(bgm, pos);
                } else {
                    slot.buffer = this.createBuffer(audioFolder('bgm'), bgm.name);
                    this.updateBgmParameters(bgm, slotId);
                    if (!(slotId === 0 && meSlot.buffer)) {
                        slot.buffer.play(true, pos || 0);
                    }
                }
            }
        }
        this.updateCurrentBgm(bgm, pos, slotId);
        syncAliases();
    };

    AudioManager.playEncryptedBgm = function(bgm, pos) {
        var ext = this.audioFileExt();
        var url = this._path + audioPath('bgm') + encodeURIComponent(bgm.name) + ext;
        url = Decrypter.extToEncryptExt(url);
        Decrypter.decryptHTML5Audio(url, bgm, pos);
    };

    AudioManager.replayBgm = function(bgm, index) {
        var slotId = toIndex(index, 0);
        if (this.isCurrentBgm(bgm, slotId)) {
            this.updateBgmParameters(bgm, slotId);
        } else {
            this.playBgm(bgm, bgm.pos, slotId);
            var slot = ensureBgmSlot(slotId);
            if (slot.buffer) {
                slot.buffer.fadeIn(this._replayFadeTime);
            }
        }
    };

    AudioManager.isCurrentBgm = function(bgm, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgmSlot(slotId);
        return (slot.current && slot.buffer && slot.current.name === bgm.name);
    };

    AudioManager.updateBgmParameters = function(bgm, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgmSlot(slotId);
        this.updateBufferParameters(slot.buffer, this._bgmVolume, bgm);
        syncAliases();
    };

    AudioManager.updateCurrentBgm = function(bgm, pos, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgmSlot(slotId);
        slot.current = bgm ? {
            name: bgm.name,
            volume: bgm.volume,
            pitch: bgm.pitch,
            pan: bgm.pan,
            pos: pos
        } : null;
        syncAliases();
    };

    AudioManager.stopBgm = function(index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgmSlot(slotId);
        if (slot.buffer) {
            slot.buffer.stop();
            slot.buffer = null;
            slot.current = null;
        }
        syncAliases();
    };

    AudioManager.fadeOutBgm = function(duration, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgmSlot(slotId);
        if (slot.buffer && slot.current) {
            slot.buffer.fadeOut(duration);
            slot.current = null;
        }
        syncAliases();
    };

    AudioManager.fadeInBgm = function(duration, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgmSlot(slotId);
        if (slot.buffer && slot.current) {
            slot.buffer.fadeIn(duration);
        }
    };

    // ---------------------------------------------------------------------
    // BGS overrides
    // ---------------------------------------------------------------------
    AudioManager.playBgs = function(bgs, pos, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgsSlot(slotId);
        if (this.isCurrentBgs(bgs, slotId)) {
            this.updateBgsParameters(bgs, slotId);
        } else {
            this.stopBgs(slotId);
            if (bgs && bgs.name) {
                slot.buffer = this.createBuffer(audioFolder('bgs'), bgs.name);
                this.updateBgsParameters(bgs, slotId);
                slot.buffer.play(true, pos || 0);
            }
        }
        this.updateCurrentBgs(bgs, pos, slotId);
        syncAliases();
    };

    AudioManager.replayBgs = function(bgs, index) {
        var slotId = toIndex(index, 0);
        if (this.isCurrentBgs(bgs, slotId)) {
            this.updateBgsParameters(bgs, slotId);
        } else {
            this.playBgs(bgs, bgs.pos, slotId);
            var slot = ensureBgsSlot(slotId);
            if (slot.buffer) {
                slot.buffer.fadeIn(this._replayFadeTime);
            }
        }
    };

    AudioManager.isCurrentBgs = function(bgs, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgsSlot(slotId);
        return (slot.current && slot.buffer && slot.current.name === bgs.name);
    };

    AudioManager.updateBgsParameters = function(bgs, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgsSlot(slotId);
        this.updateBufferParameters(slot.buffer, this._bgsVolume, bgs);
        syncAliases();
    };

    AudioManager.updateCurrentBgs = function(bgs, pos, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgsSlot(slotId);
        slot.current = bgs ? {
            name: bgs.name,
            volume: bgs.volume,
            pitch: bgs.pitch,
            pan: bgs.pan,
            pos: pos
        } : null;
        syncAliases();
    };

    AudioManager.stopBgs = function(index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgsSlot(slotId);
        if (slot.buffer) {
            slot.buffer.stop();
            slot.buffer = null;
            slot.current = null;
        }
        syncAliases();
    };

    AudioManager.fadeOutBgs = function(duration, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgsSlot(slotId);
        if (slot.buffer && slot.current) {
            slot.buffer.fadeOut(duration);
            slot.current = null;
        }
        syncAliases();
    };

    AudioManager.fadeInBgs = function(duration, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureBgsSlot(slotId);
        if (slot.buffer && slot.current) {
            slot.buffer.fadeIn(duration);
        }
    };

    // ---------------------------------------------------------------------
    // ME overrides (channel 0 keeps legacy bgm pause/resume behavior)
    // ---------------------------------------------------------------------
    AudioManager.playMe = function(me, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureMeSlot(slotId);
        if (slotId === 0) {
            this.stopMe(0);
            if (me && me.name) {
                var bgmSlot = ensureBgmSlot(0);
                if (bgmSlot.buffer && bgmSlot.current) {
                    bgmSlot.current.pos = bgmSlot.buffer.seek();
                    bgmSlot.buffer.stop();
                }
                slot.buffer = this.createBuffer(audioFolder('me'), me.name);
                this.updateMeParameters(me, slotId);
                slot.buffer.play(false);
                slot.buffer.addStopListener(this.stopMe.bind(this, 0));
                slot.current = { name: me.name, volume: me.volume, pitch: me.pitch, pan: me.pan };
            }
        } else {
            if (slot.buffer) slot.buffer.stop();
            if (me && me.name) {
                slot.buffer = this.createBuffer(audioFolder('me'), me.name);
                this.updateMeParameters(me, slotId);
                slot.buffer.play(false);
                slot.buffer.addStopListener(this.stopMe.bind(this, slotId));
                slot.current = { name: me.name, volume: me.volume, pitch: me.pitch, pan: me.pan };
            } else {
                slot.current = null;
            }
        }
        syncAliases();
    };

    AudioManager.updateMeParameters = function(me, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureMeSlot(slotId);
        this.updateBufferParameters(slot.buffer, this._meVolume, me);
        syncAliases();
    };

    AudioManager.fadeOutMe = function(duration, index) {
        var slotId = toIndex(index, 0);
        var slot = ensureMeSlot(slotId);
        if (slot.buffer) {
            slot.buffer.fadeOut(duration);
        }
    };

    AudioManager.stopMe = function(index) {
        var slotId = toIndex(index, 0);
        var slot = ensureMeSlot(slotId);
        if (slot.buffer) {
            slot.buffer.stop();
            slot.buffer = null;
            if (slotId === 0) {
                var bgmSlot = ensureBgmSlot(0);
                if (bgmSlot.buffer && bgmSlot.current && !bgmSlot.buffer.isPlaying()) {
                    bgmSlot.buffer.play(true, bgmSlot.current.pos);
                    bgmSlot.buffer.fadeIn(this._replayFadeTime);
                }
            }
        }
        slot.current = null;
        syncAliases();
    };

    // ---------------------------------------------------------------------
    // SE overrides
    // ---------------------------------------------------------------------
    AudioManager.playSe = function(se, index) {
        var slotId = toIndex(index, 0);
        if (JakeMSG_AMC && typeof JakeMSG_AMC.onBeforePlaySe === 'function' && !JakeMSG_AMC._playSeHookGuard) {
            var hookResult = JakeMSG_AMC.onBeforePlaySe(se, slotId);
            if (hookResult && hookResult.consumeOriginal) {
                return;
            }
            if (hookResult && hookResult.overrideSe) {
                se = hookResult.overrideSe;
            }
        }
        var slot = ensureSeSlot(slotId);
        if (se && se.name) {
            slot.buffers = slot.buffers.filter(function(audio) {
                return audio.isPlaying();
            });
            var latest = slot.buffers.filter(function(audio) {
                return audio.frameCount === Graphics.frameCount;
            });
            if (latest.some(function(audio) { return audio.name === se.name; })) {
                return;
            }
            var buffer = this.createBuffer(audioFolder('se'), se.name);
            buffer.name = se.name;
            buffer.frameCount = Graphics.frameCount;
            this.updateSeParameters(buffer, se, slotId);
            buffer.play(false);
            slot.buffers.push(buffer);
        }
        if (slotId === 0) AudioManager._seBuffers = slot.buffers;
    };
    AudioManager.playSe._JakeMSG_AMC_Override = true;

    AudioManager.updateSeParameters = function(buffer, se) {
        this.updateBufferParameters(buffer, this._seVolume, se);
    };

    AudioManager.stopSe = function(index) {
        if (index === undefined) {
            // backwards-compatible stop for channel 0 only
            index = 0;
        }
        var slotId = toIndex(index, 0);
        var slot = ensureSeSlot(slotId);
        slot.buffers.forEach(function(buffer) {
            buffer.stop();
        });
        slot.buffers = [];
        if (slotId === 0) AudioManager._seBuffers = slot.buffers;
    };

    // ---------------------------------------------------------------------
    // All-stop override
    // ---------------------------------------------------------------------
    AudioManager.stopAll = function() {
        var stopArray = function(arr, fnName) {
            if (!arr) return;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i]) AudioManager[fnName](i);
            }
        };
        stopArray(AudioManager._meSlots, 'stopMe');
        stopArray(AudioManager._bgmSlots, 'stopBgm');
        stopArray(AudioManager._bgsSlots, 'stopBgs');
        stopArray(AudioManager._seSlots, 'stopSe');
        syncAliases();
    };

    // ---------------------------------------------------------------------
    // Save helpers (legacy channel 0)
    // ---------------------------------------------------------------------
    AudioManager.saveBgm = function() {
        var slot = ensureBgmSlot(0);
        if (slot.current) {
            return {
                name: slot.current.name,
                volume: slot.current.volume,
                pitch: slot.current.pitch,
                pan: slot.current.pan,
                pos: slot.buffer ? slot.buffer.seek() : 0
            };
        } else {
            return this.makeEmptyAudioObject();
        }
    };

    AudioManager.saveBgs = function() {
        var slot = ensureBgsSlot(0);
        if (slot.current) {
            return {
                name: slot.current.name,
                volume: slot.current.volume,
                pitch: slot.current.pitch,
                pan: slot.current.pan,
                pos: slot.buffer ? slot.buffer.seek() : 0
            };
        } else {
            return this.makeEmptyAudioObject();
        }
    };

    // keep aliases in sync after bootstrap
    syncAliases();

    // ---------------------------------------------------------------------
    // Global script-call helpers for indexed audio
    // ---------------------------------------------------------------------
    window.bgmXPlay = function(index, bgmName, volume, pitch, pan) {
        var slotId = toIndex(index, 1);
        AudioManager.playBgm({ name: bgmName || '', volume: volume || 100, pitch: pitch || 100, pan: pan || 0 }, 0, slotId);
    };

    window.bgsXPlay = function(index, bgsName, volume, pitch, pan) {
        var slotId = toIndex(index, 1);
        AudioManager.playBgs({ name: bgsName || '', volume: volume || 100, pitch: pitch || 100, pan: pan || 0 }, 0, slotId);
    };

    window.meXPlay = function(index, meName, volume, pitch, pan) {
        var slotId = toIndex(index, 1);
        AudioManager.playMe({ name: meName || '', volume: volume || 100, pitch: pitch || 100, pan: pan || 0 }, slotId);
    };

    window.seXPlay = function(index, seName, volume, pitch, pan) {
        var slotId = toIndex(index, 1);
        AudioManager.playSe({ name: seName || '', volume: volume || 100, pitch: pitch || 100, pan: pan || 0 }, slotId);
    };

    window.bgsXFade = function(index, seconds) {
        var slotId = toIndex(index, 1);
        AudioManager.fadeOutBgs(seconds || 1, slotId);
    };

    window.seXStop = function(index) {
        var slotId = toIndex(index, 1);
        AudioManager.stopSe(slotId);
    };

    window.bgsXAllFade = function(seconds) {
        var duration = seconds || 1;
        var list = AudioManager._bgsSlots || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i]) AudioManager.fadeOutBgs(duration, i);
        }
    };

    window.bgsXOnlyFade = function(seconds) {
        var duration = seconds || 1;
        var list = AudioManager._bgsSlots || [];
        for (var i = 1; i < list.length; i++) {
            if (list[i]) AudioManager.fadeOutBgs(duration, i);
        }
    };

    window.seXAllStop = function() {
        var list = AudioManager._seSlots || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i]) AudioManager.stopSe(i);
        }
    };

    window.seXOnlyStop = function() {
        var list = AudioManager._seSlots || [];
        for (var i = 1; i < list.length; i++) {
            if (list[i]) AudioManager.stopSe(i);
        }
    };

    // ---------------------------------------------------------------------
    // Footstep multi-channel support
    // ---------------------------------------------------------------------
    var hasMVFootsteps = Imported.YEP_FootstepSounds && !isMZ;
    // Keep MZ API available regardless of plugin load order; ToshA-specific
    // behavior is checked again at runtime.
    var hasMZFootsteps = isMZ;

    if (hasMVFootsteps || hasMZFootsteps) {
        var defaultFootstepSlot = function() {
            return { list: [], mode: 'Cycle', cursor: 0, volume: 20, pitch: 150, maxPitch: 0, distance: 0 };
        };

        var normalizeFootstepSlot = function(slot) {
            if (!slot || typeof slot !== 'object') slot = defaultFootstepSlot();
            if (!Array.isArray(slot.list)) slot.list = [];
            slot.mode = normalizeCycleMode(slot.mode);
            slot.cursor = toIndex(slot.cursor, 0);
            slot.volume = toNumberOr(slot.volume, 20);
            slot.pitch = toNumberOr(slot.pitch, 150);
            slot.maxPitch = toNumberOr(slot.maxPitch, 0);
            slot.distance = Math.max(0, toNumberOr(slot.distance, 0));
            return slot;
        };

        JakeMSG_AMC.resetFootstepsStorage = function() {
            JakeMSG_AMC.footstepScopes = {};
            JakeMSG_AMC.footstepStateByScope = {};
        };

        JakeMSG_AMC.resetFootstepsStorage();

        JakeMSG_AMC.saveFootsteps = function() {
            return {
                scopes: JakeMSG_AMC.footstepScopes,
                states: JakeMSG_AMC.footstepStateByScope
            };
        };

        JakeMSG_AMC.loadFootsteps = function(payload) {
            JakeMSG_AMC.resetFootstepsStorage();
            if (payload && payload.scopes) JakeMSG_AMC.footstepScopes = payload.scopes;
            if (payload && payload.states) JakeMSG_AMC.footstepStateByScope = payload.states;
            normalizeLegacyGlobal();
        };

        var scopeKeyAll = 'all';

        var normalizeLegacyGlobal = function() {
            if (JakeMSG_AMC.footstepSfx) {
                JakeMSG_AMC.footstepScopes[scopeKeyAll] = (JakeMSG_AMC.footstepSfx || []).map(function(slot) {
                    if (!slot || Array.isArray(slot)) return normalizeFootstepSlot(defaultFootstepSlot());
                    if (slot.list && slot.mode) return normalizeFootstepSlot(slot);
                    var migrated = defaultFootstepSlot();
                    if (slot.name) migrated.list = [{ name: slot.name }];
                    return normalizeFootstepSlot(migrated);
                });
                delete JakeMSG_AMC.footstepSfx;
            }
            if (!JakeMSG_AMC.footstepScopes[scopeKeyAll]) {
                JakeMSG_AMC.footstepScopes[scopeKeyAll] = [normalizeFootstepSlot(defaultFootstepSlot())];
            }
            if (!JakeMSG_AMC.footstepStateByScope[scopeKeyAll]) {
                JakeMSG_AMC.footstepStateByScope[scopeKeyAll] = { lastKey: null, suppressBase: false };
            }
        };

        normalizeLegacyGlobal();

        var _Jake_AMC_setupNewGame = DataManager.setupNewGame;
        DataManager.setupNewGame = function() {
            JakeMSG_AMC.resetFootstepsStorage();
            normalizeLegacyGlobal();
            _Jake_AMC_setupNewGame.call(this);
        };

        var _Jake_AMC_makeSaveContents = DataManager.makeSaveContents;
        DataManager.makeSaveContents = function() {
            var contents = _Jake_AMC_makeSaveContents.call(this);
            contents.JakeMSG_AMC_Footsteps = JakeMSG_AMC.saveFootsteps();
            return contents;
        };

        var _Jake_AMC_extractSaveContents = DataManager.extractSaveContents;
        DataManager.extractSaveContents = function(contents) {
            _Jake_AMC_extractSaveContents.call(this, contents);
            JakeMSG_AMC.loadFootsteps(contents.JakeMSG_AMC_Footsteps);
        };

        var resolveScopeKey = function(scope, interpreterEventId) {
            if (scope === undefined || scope === null || scope === '' || scope === 'All') return scopeKeyAll;
            if (typeof scope === 'number') {
                if (scope === -1) return 'player';
                if (scope === 0) return interpreterEventId ? 'event:' + interpreterEventId : scopeKeyAll;
                return 'event:' + Math.max(0, Math.floor(scope));
            }
            var s = String(scope).trim();
            if (s.toLowerCase() === 'all') return scopeKeyAll;
            if (s.toLowerCase() === 'player' || s === '-1') return 'player';
            if (s === '0' || s.toLowerCase() === 'this' || s.toLowerCase() === 'thisevent' || s.toLowerCase() === 'this event') {
                return interpreterEventId ? 'event:' + interpreterEventId : scopeKeyAll;
            }
            var num = Number(s);
            if (!isNaN(num)) return resolveScopeKey(num, interpreterEventId);
            return scopeKeyAll;
        };

        var ensureScope = function(scopeKey) {
            if (!JakeMSG_AMC.footstepScopes[scopeKey]) JakeMSG_AMC.footstepScopes[scopeKey] = [normalizeFootstepSlot(defaultFootstepSlot())];
            if (!JakeMSG_AMC.footstepStateByScope[scopeKey]) JakeMSG_AMC.footstepStateByScope[scopeKey] = { lastKey: null, suppressBase: false };
        };

        var ensureFootstepSlot = function(scopeKey, index) {
            ensureScope(scopeKey);
            var slots = JakeMSG_AMC.footstepScopes[scopeKey];
            if (!slots[index]) slots[index] = normalizeFootstepSlot(defaultFootstepSlot());
            slots[index] = normalizeFootstepSlot(slots[index]);
            return slots[index];
        };

        var collectScopeKeys = function(scopeKey) {
            var keys = [];
            if (scopeKey === scopeKeyAll) {
                keys = Object.keys(JakeMSG_AMC.footstepScopes);
                if (keys.indexOf(scopeKeyAll) === -1) keys.push(scopeKeyAll);
            } else {
                keys = [scopeKey];
                // If caller requested player but only the all scope exists, include all so it actually clears/sets what player hears.
                if (scopeKey === 'player' && !JakeMSG_AMC.footstepScopes[scopeKey] && JakeMSG_AMC.footstepScopes[scopeKeyAll]) {
                    keys.push(scopeKeyAll);
                }
            }
            return keys;
        };

        var getSlotsForCharacter = function(character) {
            var key = scopeKeyAll;
            if (character === $gamePlayer) {
                key = 'player';
            } else if (character && typeof character.eventId === 'function' && character.eventId() > 0) {
                key = 'event:' + character.eventId();
            }
            if (!JakeMSG_AMC.footstepScopes[key]) {
                key = scopeKeyAll;
            }
            ensureScope(key);
            return { slots: JakeMSG_AMC.footstepScopes[key], state: JakeMSG_AMC.footstepStateByScope[key], key: key };
        };

        var setSlotVolumePitch = function(slot, volume, pitch, maxPitch, distance) {
            slot.volume = isNaN(Number(volume)) ? slot.volume : Number(volume);
            slot.pitch = isNaN(Number(pitch)) ? slot.pitch : Number(pitch);
            slot.maxPitch = isNaN(Number(maxPitch)) ? slot.maxPitch : Number(maxPitch);
            slot.distance = isNaN(Number(distance)) ? slot.distance : Math.max(0, Number(distance));
        };

        var resetSlot = function(scopeKey, index, volume, pitch, maxPitch, distance) {
            ensureScope(scopeKey);
            var fresh = defaultFootstepSlot();
            setSlotVolumePitch(fresh, volume !== undefined ? volume : fresh.volume,
                pitch !== undefined ? pitch : fresh.pitch,
                maxPitch !== undefined ? maxPitch : fresh.maxPitch,
                distance !== undefined ? distance : fresh.distance);
            // Ensure the list is fully cleared so no prior elements linger.
            fresh.list = [];
            fresh.cursor = 0;
            fresh.mode = 'Cycle';
            JakeMSG_AMC.footstepScopes[scopeKey][index] = normalizeFootstepSlot(fresh);
            return JakeMSG_AMC.footstepScopes[scopeKey][index];
        };

        var wipeScope = function(scopeKey) {
            var prevState = JakeMSG_AMC.footstepStateByScope[scopeKey] || {};
            JakeMSG_AMC.footstepScopes[scopeKey] = [normalizeFootstepSlot(defaultFootstepSlot())];
            JakeMSG_AMC.footstepScopes[scopeKey][0].list = [];
            JakeMSG_AMC.footstepScopes[scopeKey][0].cursor = 0;
            JakeMSG_AMC.footstepScopes[scopeKey][0].mode = 'Cycle';
            JakeMSG_AMC.footstepStateByScope[scopeKey] = {
                lastKey: prevState.lastKey || null,
                suppressBase: true
            };
        };

        var normalizeNamesInput = function(names) {
            if (Array.isArray(names)) {
                return names.map(function(n) { return String(n || '').trim(); }).filter(function(n) { return !!n; });
            }
            return parseStringArray(names);
        };

        var splitFootstepArgs = function(raw) {
            var source = String(raw || '');
            var parts = [];
            var token = '';
            var bracketDepth = 0;
            var quote = null;
            for (var i = 0; i < source.length; i++) {
                var ch = source[i];
                if ((ch === '"' || ch === "'") && source[i - 1] !== '\\') {
                    if (quote === ch) quote = null;
                    else if (!quote) quote = ch;
                }
                if (!quote) {
                    if (ch === '[') bracketDepth++;
                    if (ch === ']') bracketDepth = Math.max(0, bracketDepth - 1);
                    if (ch === ',' && bracketDepth === 0) {
                        parts.push(token.trim());
                        token = '';
                        continue;
                    }
                }
                token += ch;
            }
            if (token.length > 0) parts.push(token.trim());
            return parts;
        };

        var stripWrappingQuotes = function(text) {
            var value = String(text || '').trim();
            if (value.length >= 2) {
                var first = value.charAt(0);
                var last = value.charAt(value.length - 1);
                if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
                    value = value.substring(1, value.length - 1).trim();
                }
            }
            return value;
        };

        var argAsNumber = function(parts, index, fallback) {
            if (!parts || index >= parts.length) return fallback;
            var token = parts[index];
            if (token === undefined || token === null) return fallback;
            if (String(token).trim() === '') return fallback;
            var num = Number(token);
            return isNaN(num) ? fallback : num;
        };

        var parseNamesFromToken = function(token, fallbackNames) {
            var fallback = fallbackNames ? fallbackNames.slice() : [];
            if (token === undefined || token === null) return fallback;
            var t = String(token).trim();
            if (!t) return fallback;
            if (t[0] === '[') {
                var arr = parseStringArray(t);
                return arr.length > 0 ? arr : fallback;
            }
            var single = stripWrappingQuotes(t);
            return single ? [single] : fallback;
        };

        var buildEventSingleFootstepConfig = function(rawArgs) {
            var parts = splitFootstepArgs(rawArgs);
            var name = stripWrappingQuotes(parts.length > 0 ? parts[0] : '');
            return {
                mode: 'Cycle',
                list: name ? [{ name: name }] : [],
                slotVolume: argAsNumber(parts, 1, 20),
                slotPitch: argAsNumber(parts, 2, 150),
                slotMaxPitch: argAsNumber(parts, 3, 0),
                slotDistance: Math.max(0, argAsNumber(parts, 4, 0))
            };
        };

        var buildEventCycleFootstepConfig = function(rawArgs) {
            var parts = splitFootstepArgs(rawArgs);
            var names = parseNamesFromToken(parts.length > 0 ? parts[0] : '', []);
            return {
                mode: normalizeCycleMode(parts.length > 3 && String(parts[3]).trim() !== '' ? parts[3] : 'Cycle'),
                list: names.map(function(name) { return { name: name }; }),
                slotVolume: argAsNumber(parts, 1, 20),
                slotPitch: argAsNumber(parts, 2, 150),
                slotMaxPitch: argAsNumber(parts, 4, 0),
                slotDistance: Math.max(0, argAsNumber(parts, 5, 0))
            };
        };

        var parseEventFootstepCommentConfig = function(commentText) {
            var text = String(commentText || '');
            if (!text) return null;
            var lines = text.split(/[\r\n]+/);
            var config = null;
            for (var i = 0; i < lines.length; i++) {
                var line = String(lines[i] || '').trim();
                if (!line) continue;
                if (line.match(/<FOOTSTEP[ ]CYCLE:[ ]*(.*)>/i)) {
                    config = buildEventCycleFootstepConfig(RegExp.$1);
                } else if (line.match(/<FOOTSTEPS:[ ]*(.*)>/i)) {
                    config = buildEventSingleFootstepConfig(RegExp.$1);
                }
            }
            return config;
        };

        var collectEventCommentText = function(list) {
            if (!Array.isArray(list)) return '';
            var lines = [];
            for (var i = 0; i < list.length; i++) {
                var cmd = list[i];
                if (!cmd) continue;
                if ((cmd.code === 108 || cmd.code === 408) && cmd.parameters && cmd.parameters.length > 0) {
                    lines.push(String(cmd.parameters[0] || ''));
                }
            }
            return lines.join('\n');
        };

        var getEventFootstepCommentConfig = function(character) {
            if (!character || typeof character.eventId !== 'function') return null;
            if (character.eventId() <= 0) return null;
            if (typeof character.list !== 'function') return null;
            var pageIndex = toNumberOr(character._pageIndex, -1);
            if (pageIndex < 0) return null;

            var list = character.list();
            var cache = character._JakeMSG_AMC_EventFootstepComment;
            if (cache && cache.pageIndex === pageIndex && cache.listRef === list) {
                return cache.config;
            }

            var commentText = collectEventCommentText(list);
            var config = parseEventFootstepCommentConfig(commentText);
            character._JakeMSG_AMC_EventFootstepComment = {
                pageIndex: pageIndex,
                listRef: list,
                config: config
            };
            return config;
        };

        var copyFootstepList = function(list) {
            return (list || []).map(function(entry) {
                if (!entry || !entry.name) return null;
                var out = { name: entry.name };
                if (entry.volume !== undefined) out.volume = entry.volume;
                if (entry.pitch !== undefined) out.pitch = entry.pitch;
                return out;
            }).filter(function(entry) { return !!entry; });
        };

        var applyBaseConfigToSlot = function(slot, baseConfig) {
            slot.list = copyFootstepList(baseConfig.list);
            slot.mode = normalizeCycleMode(baseConfig.mode || 'Cycle');
            slot.cursor = 0;
            if (baseConfig.slotVolume !== undefined) slot.volume = toNumberOr(baseConfig.slotVolume, slot.volume);
            if (baseConfig.slotPitch !== undefined) slot.pitch = toNumberOr(baseConfig.slotPitch, slot.pitch);
            if (baseConfig.slotMaxPitch !== undefined) slot.maxPitch = toNumberOr(baseConfig.slotMaxPitch, slot.maxPitch);
            if (baseConfig.slotDistance !== undefined) slot.distance = Math.max(0, toNumberOr(baseConfig.slotDistance, slot.distance));
        };

        var resolvePitchValue = function(slot, basePitch) {
            var minPitch = Math.max(0, toNumberOr(slot.pitch, basePitch));
            var maxPitch = toNumberOr(slot.maxPitch, 0);
            if (maxPitch > minPitch) {
                return Math.floor(Math.random() * (maxPitch - minPitch + 1)) + minPitch;
            }
            return minPitch;
        };

        var resolveDistanceFactor = function(character, slot) {
            var maxDistance = Math.max(0, toNumberOr(slot.distance, 0));
            if (maxDistance <= 0) return 1;
            if (!character || character === $gamePlayer || !$gamePlayer || $gamePlayer.x === undefined) return 1;
            var dx = $gamePlayer.x - character.x;
            var dy = $gamePlayer.y - character.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > maxDistance) return 0;
            return Math.max(0, 1 - (distance / maxDistance));
        };

        var pickFootstep = function(slot, fallbackList) {
            var list = (slot.list || []).filter(function(entry) { return entry && entry.name; });
            if (list.length === 0) list = (fallbackList || []).filter(function(entry) { return entry && entry.name; });
            if (list.length === 0) return null;

            if (slot.mode === 'Random') {
                var r = Math.floor(Math.random() * list.length);
                return list[r];
            }
            var c = slot.cursor || 0;
            var chosen = list[c % list.length];
            slot.cursor = (c + 1) % list.length;
            return chosen;
        };

        var buildOutputSe = function(character, slot, chosen, basePan, fallbackVolume, fallbackPitch) {
            if (!chosen || !chosen.name) return null;
            var factor = resolveDistanceFactor(character, slot);
            if (factor <= 0) return null;
            var baseVolume = chosen.volume !== undefined ? chosen.volume : toNumberOr(slot.volume, fallbackVolume);
            var resolvedPitch = chosen.pitch !== undefined ? chosen.pitch : resolvePitchValue(slot, fallbackPitch);
            var out = {
                name: chosen.name,
                volume: Math.max(0, Math.min(100, Math.round(baseVolume * factor))),
                pitch: resolvedPitch,
                pan: basePan
            };
            if (out.volume <= 0 || out.pitch <= 0) return null;
            return out;
        };

        window.setXFootstep = function(index, name, volume, pitch, scope, maxPitch, distance) {
            var evId = $gameMap && $gameMap._interpreter ? $gameMap._interpreter._eventId : 0;
            var scopeKey = resolveScopeKey(scope, evId);
            var slotId = toIndex(index, 1);
            var keys = collectScopeKeys(scopeKey);
            keys.forEach(function(key) {
                var slot = resetSlot(key, slotId, volume !== undefined ? volume : 20,
                    pitch !== undefined ? pitch : 150,
                    maxPitch !== undefined ? maxPitch : 0,
                    distance !== undefined ? distance : 0);
                if (name) {
                    slot.list = [{ name: name }];
                } else {
                    slot.list = [];
                }
                slot.mode = 'Cycle';
                slot.cursor = 0;
                if (slotId === 0) {
                    var state = JakeMSG_AMC.footstepStateByScope[key];
                    state.suppressBase = !name;
                }
            });
        };

        window.setXFootstepElement = function(index, elementIndex, name, scope, maxPitch, distance) {
            var evId = $gameMap && $gameMap._interpreter ? $gameMap._interpreter._eventId : 0;
            var scopeKey = resolveScopeKey(scope, evId);
            var slotId = toIndex(index, 1);
            var elemId = Math.max(0, toIndex(elementIndex, 1) - 1);
            var keys = collectScopeKeys(scopeKey);
            keys.forEach(function(key) {
                var slot = ensureFootstepSlot(key, slotId);
                slot.list[elemId] = { name: name || '' };
                if (maxPitch !== undefined) slot.maxPitch = toNumberOr(maxPitch, slot.maxPitch);
                if (distance !== undefined) slot.distance = Math.max(0, toNumberOr(distance, slot.distance));
            });
        };

        window.setXFootstepCycle = function(index, names, volume, pitch, cycleType, scope, maxPitch, distance) {
            var evId = $gameMap && $gameMap._interpreter ? $gameMap._interpreter._eventId : 0;
            var scopeKey = resolveScopeKey(scope, evId);
            var slotId = toIndex(index, 1);
            var keys = collectScopeKeys(scopeKey);
            keys.forEach(function(key) {
                var slot = resetSlot(key, slotId, volume !== undefined ? volume : 20,
                    pitch !== undefined ? pitch : 150,
                    maxPitch !== undefined ? maxPitch : 0,
                    distance !== undefined ? distance : 0);
                slot.mode = normalizeCycleMode(cycleType || 'Cycle');
                var listNames = normalizeNamesInput(names);
                if (listNames.length > 0) {
                    slot.list = listNames.map(function(n) {
                        return { name: n || '' };
                    });
                } else {
                    slot.list = [];
                }
                slot.cursor = 0;
            });
        };

        window.setXFootstepMode = function(index, mode, scope) {
            var evId = $gameMap && $gameMap._interpreter ? $gameMap._interpreter._eventId : 0;
            var scopeKey = resolveScopeKey(scope, evId);
            var slotId = toIndex(index, 1);
            var keys = collectScopeKeys(scopeKey);
            keys.forEach(function(key) {
                var slot = ensureFootstepSlot(key, slotId);
                slot.mode = normalizeCycleMode(mode || 'Cycle');
                slot.cursor = 0;
            });
        };

        window.clearAllXFootsteps = function(scope) {
            var evId = $gameMap && $gameMap._interpreter ? $gameMap._interpreter._eventId : 0;
            var scopeKey = resolveScopeKey(scope, evId);
            var keys = [];
            if (scope === undefined || scope === null || scope === '' || scope === 'All') {
                keys = Object.keys(JakeMSG_AMC.footstepScopes);
            } else {
                keys = [scopeKey];
            }
            keys.forEach(function(key) {
                ensureScope(key);
                var slots = JakeMSG_AMC.footstepScopes[key];
                for (var i = 1; i < slots.length; i++) {
                    slots[i] = normalizeFootstepSlot(defaultFootstepSlot());
                    slots[i].list = [];
                    slots[i].cursor = 0;
                    slots[i].mode = 'Cycle';
                }
            });
        };

        window.clearAllFootsteps = function(scope) {
            var evId = $gameMap && $gameMap._interpreter ? $gameMap._interpreter._eventId : 0;
            var scopeKey = resolveScopeKey(scope, evId);
            var keys = collectScopeKeys(scopeKey);
            if (scope === undefined || scope === null || scope === '' || scope === 'All') {
                keys = Object.keys(JakeMSG_AMC.footstepScopes);
                if (keys.indexOf(scopeKeyAll) === -1) keys.push(scopeKeyAll);
            }
            if (keys.length === 0) keys = [scopeKeyAll];
            keys.forEach(function(key) { wipeScope(key); });
        };

        if (hasMVFootsteps) {
            var useParamDefault = String(pluginParams["Use this plugin's parameter for Default Footstep Sound"] || 'false').toLowerCase() === 'true';
            var customDefaultNames = parseStringArray(pluginParams['Default Footstep Sound']);
            var customDefaultMode = normalizeCycleMode(pluginParams['Cycling type'] || 'Cycle');

            var resolveMvDefaultConfig = function() {
                var names = [];
                if (useParamDefault && customDefaultNames.length > 0) {
                    names = customDefaultNames.slice();
                } else {
                    names = parseStringArray(Yanfly.Param.Footsteps.defaultSound);
                    if (names.length === 0 && Yanfly.Param.Footsteps.defaultSound) {
                        names = [String(Yanfly.Param.Footsteps.defaultSound).trim()];
                    }
                }
                if (names.length === 0) names = ['Move1'];
                return {
                    names: names,
                    volume: Number(Yanfly.Param.Footsteps.defaultVolume),
                    pitch: Number(Yanfly.Param.Footsteps.defaultPitch),
                    mode: useParamDefault ? customDefaultMode : 'Cycle'
                };
            };

            var parseFootstepDefinition = function(raw, defaults) {
                var parts = splitFootstepArgs(String(raw || ''));
                var names = parseNamesFromToken(parts[0], defaults.names);
                var volume = parts.length > 1 && parts[1] !== '' ? Number(parts[1]) : defaults.volume;
                var pitch = parts.length > 2 && parts[2] !== '' ? Number(parts[2]) : defaults.pitch;
                var mode = parts.length > 3 ? normalizeCycleMode(parts[3]) : normalizeCycleMode(defaults.mode);
                return {
                    names: names,
                    volume: isNaN(volume) ? defaults.volume : volume,
                    pitch: isNaN(pitch) ? defaults.pitch : pitch,
                    mode: mode
                };
            };

            DataManager.processFootstepNotetags = function(group) {
                var defaultCfg = resolveMvDefaultConfig();
                for (var n = 1; n < group.length; n++) {
                    var obj = group[n];
                    var notedata = obj.note.split(/[\r\n]+/);

                    obj.terrainTagFootstepSounds = {
                        0: {
                            names: defaultCfg.names.slice(),
                            volume: defaultCfg.volume,
                            pitch: defaultCfg.pitch,
                            mode: defaultCfg.mode
                        }
                    };

                    for (var i = 0; i < notedata.length; i++) {
                        var line = notedata[i];
                        if (line.match(/<TERRAIN[ ]TAG[ ](\d+)[ ]FOOTSTEP SOUND:[ ](.*)>/i)) {
                            var tagId = parseInt(RegExp.$1).clamp(1, 7);
                            obj.terrainTagFootstepSounds[tagId] = parseFootstepDefinition(RegExp.$2, defaultCfg);
                        }
                    }
                }
            };

            DataManager.processMapFootstepNotetags = function() {
                if (!$dataMap) return;
                var defaultCfg = resolveMvDefaultConfig();

                $dataMap.regionFootstepSounds = {
                    0: {
                        names: defaultCfg.names.slice(),
                        volume: defaultCfg.volume,
                        pitch: defaultCfg.pitch,
                        mode: defaultCfg.mode
                    }
                };

                if (!$dataMap.note) return;
                var notedata = $dataMap.note.split(/[\r\n]+/);
                for (var i = 0; i < notedata.length; i++) {
                    var line = notedata[i];
                    if (line.match(/<REGION[ ](\d+)[ ]FOOTSTEP SOUND:[ ](.*)>/i)) {
                        var regionId = parseInt(RegExp.$1).clamp(0, 255);
                        $dataMap.regionFootstepSounds[regionId] = parseFootstepDefinition(RegExp.$2, defaultCfg);
                    }
                }
            };

            var toFootstepConfigFromMvData = function(data, volumeScale, pitchScale) {
                var names = [];
                var volume = 100;
                var pitch = 100;
                var mode = 'Cycle';
                if (Array.isArray(data)) {
                    names = parseNamesFromToken(data[0], []);
                    volume = Number(data[1] || 100);
                    pitch = Number(data[2] || 100);
                } else if (data && typeof data === 'object') {
                    if (Array.isArray(data.names)) names = data.names.slice();
                    else if (Array.isArray(data.list)) {
                        names = data.list.map(function(entry) { return entry && entry.name ? String(entry.name) : ''; }).filter(function(x) { return !!x; });
                    }
                    volume = Number(data.volume || 100);
                    pitch = Number(data.pitch || 100);
                    mode = normalizeCycleMode(data.mode || 'Cycle');
                }
                if (names.length === 0) names = [''];
                var out = {
                    mode: mode,
                    list: names.map(function(name) {
                        return {
                            name: name,
                            volume: volume * volumeScale,
                            pitch: pitch * pitchScale
                        };
                    })
                };
                return out;
            };

            var toFootstepConfigFromEventComment = function(config) {
                var list = copyFootstepList(config && config.list ? config.list : []);
                return {
                    mode: normalizeCycleMode(config && config.mode ? config.mode : 'Cycle'),
                    list: list,
                    slotVolume: config && config.slotVolume !== undefined ? config.slotVolume : 20,
                    slotPitch: config && config.slotPitch !== undefined ? config.slotPitch : 150,
                    slotMaxPitch: config && config.slotMaxPitch !== undefined ? config.slotMaxPitch : 0,
                    slotDistance: config && config.slotDistance !== undefined ? config.slotDistance : 0
                };
            };

            Game_CharacterBase.prototype.playFootstepSound = function(volume, pitch, pan) {
                if (volume <= 0) return;
                if (pitch <= 0) return;
                if (!$dataMap) return;
                if (!$dataMap.regionFootstepSounds) DataManager.processMapFootstepNotetags();
                var x = this.x;
                if (this.x === 6) {
                    x += 1;
                } else if (this.x === 4) {
                    x -= 1;
                }
                var y = this.y;
                if (this.y === 2) {
                    y += 1;
                } else if (this.y === 8) {
                    y -= 1;
                }
                var regionId = $gameMap.regionId(x, y);
                var terrainTag = $gameMap.terrainTag(x, y);
                var footstepData = null;
                if (regionId > 0) footstepData = $dataMap.regionFootstepSounds[regionId];
                if (!footstepData && terrainTag > 0) footstepData = $gameMap.tileset().terrainTagFootstepSounds[terrainTag];
                if (!footstepData) footstepData = $dataMap.regionFootstepSounds[0];
                var eventCommentConfig = getEventFootstepCommentConfig(this);
                var baseConfig = eventCommentConfig
                    ? toFootstepConfigFromEventComment(eventCommentConfig)
                    : toFootstepConfigFromMvData(footstepData, volume, pitch);
                var basePan = pan.clamp(-100, 100);

                var scoped = getSlotsForCharacter(this);
                var slots = scoped.slots;
                var state = scoped.state;
                var baseSlot = ensureFootstepSlot(scoped.key, 0);
                var key = [
                    baseConfig.mode,
                    baseConfig.list.map(function(entry) { return [entry.name, entry.volume, entry.pitch].join(':'); }).join('|'),
                    baseConfig.slotVolume !== undefined ? baseConfig.slotVolume : '',
                    baseConfig.slotPitch !== undefined ? baseConfig.slotPitch : '',
                    baseConfig.slotMaxPitch !== undefined ? baseConfig.slotMaxPitch : '',
                    baseConfig.slotDistance !== undefined ? baseConfig.slotDistance : '',
                    basePan
                ].join('|');
                var baseChanged = key !== state.lastKey;

                if (state.suppressBase) {
                    if (state.lastKey === null) {
                        state.lastKey = key;
                    } else if (baseChanged) {
                        applyBaseConfigToSlot(baseSlot, baseConfig);
                        state.lastKey = key;
                        state.suppressBase = false;
                    }
                } else if (baseChanged) {
                    applyBaseConfigToSlot(baseSlot, baseConfig);
                    state.lastKey = key;
                }

                for (var i = 0; i < slots.length; i++) {
                    var slot = ensureFootstepSlot(scoped.key, i);
                    var chosen = pickFootstep(slot, baseConfig.list);
                    if (!chosen || !chosen.name) continue;
                    if (i === 0 && state.suppressBase) continue;
                    var outSe = buildOutputSe(this, slot, chosen, basePan, slot.volume, slot.pitch);
                    if (!outSe) continue;
                    AudioManager.playSe(outSe, i);
                }
            };
        }

        if (hasMZFootsteps) {
            JakeMSG_AMC._currentFootstepCharacter = null;
            JakeMSG_AMC.isToshAFootstepsPresent = function() {
                if (typeof Imported !== 'undefined' && Imported && Imported.ToshA_Footsteps) return true;
                if (typeof PluginManager !== 'undefined' && PluginManager.parameters) {
                    var params = PluginManager.parameters('ToshA_Footsteps') || {};
                    if (Object.keys(params).length > 0) return true;
                }
                return false;
            };

            JakeMSG_AMC._mzPatternWrapped = false;
            JakeMSG_AMC._lastMZFallbackStepFrame = -1;
            JakeMSG_AMC.processMZFootstepFallback = function(character, prevPattern, newPattern) {
                if (!character) return;
                if (!JakeMSG_AMC.isToshAFootstepsPresent()) return;
                if (prevPattern === newPattern) return;
                if (!character.isMoving || !character.isMoving()) return;
                if (JakeMSG_AMC._lastMZFallbackStepFrame === Graphics.frameCount) return;

                var scoped = getSlotsForCharacter(character);
                var slots = scoped.slots || [];
                if (slots.length <= 1) return;

                var anyConfigured = false;
                for (var idx = 1; idx < slots.length; idx++) {
                    var chk = ensureFootstepSlot(scoped.key, idx);
                    if ((chk.list || []).some(function(entry) { return entry && entry.name; })) {
                        anyConfigured = true;
                        break;
                    }
                }
                if (!anyConfigured) return;

                JakeMSG_AMC._lastMZFallbackStepFrame = Graphics.frameCount;

                for (var i = 1; i < slots.length; i++) {
                    var extraSlot = ensureFootstepSlot(scoped.key, i);
                    var chosen = pickFootstep(extraSlot, []);
                    if (!chosen || !chosen.name) continue;
                    var outSe = buildOutputSe(character, extraSlot, chosen, 0, extraSlot.volume, extraSlot.pitch);
                    if (!outSe) continue;
                    AudioManager.playSe(outSe, i);
                }
            };

            JakeMSG_AMC.wrapMZFootstepPatternHook = function() {
                if (!Game_CharacterBase || !Game_CharacterBase.prototype) return;
                var current = Game_CharacterBase.prototype.updatePattern;
                if (!current || current._JakeMSG_AMC_Wrapped) return;
                Game_CharacterBase.prototype.updatePattern = function() {
                    var prevPattern = this._pattern;
                    JakeMSG_AMC._currentFootstepCharacter = this;
                    try {
                        current.call(this);
                        JakeMSG_AMC.processMZFootstepFallback(this, prevPattern, this._pattern);
                    } finally {
                        JakeMSG_AMC._currentFootstepCharacter = null;
                    }
                };
                Game_CharacterBase.prototype.updatePattern._JakeMSG_AMC_Wrapped = true;
            };

            // Try immediately, then enforce once more at boot after all plugins are loaded.
            JakeMSG_AMC.wrapMZFootstepPatternHook();
            if (typeof Scene_Boot !== 'undefined') {
                var _Jake_AMC_SceneBootStart = Scene_Boot.prototype.start;
                Scene_Boot.prototype.start = function() {
                    JakeMSG_AMC.wrapMZFootstepPatternHook();
                    _Jake_AMC_SceneBootStart.call(this);
                };
            }

            JakeMSG_AMC.onBeforePlaySe = function(se, slotId) {
                if (!JakeMSG_AMC.isToshAFootstepsPresent()) {
                    return null;
                }
                if (slotId !== 0) return null;
                if (!se || !se.name) return null;
                if (!JakeMSG_AMC._currentFootstepCharacter) return null;

                var character = JakeMSG_AMC._currentFootstepCharacter;
                var scoped = getSlotsForCharacter(character);
                var slots = scoped.slots;
                var state = scoped.state;
                var baseSlot = ensureFootstepSlot(scoped.key, 0);
                var basePan = toNumberOr(se.pan, 0);
                var eventCommentConfig = getEventFootstepCommentConfig(character);
                var baseEntry = {
                    name: se.name,
                    volume: toNumberOr(se.volume, 90),
                    pitch: toNumberOr(se.pitch, 100)
                };
                var baseSource = eventCommentConfig ? {
                    mode: normalizeCycleMode(eventCommentConfig.mode || 'Cycle'),
                    list: copyFootstepList(eventCommentConfig.list || []),
                    slotVolume: eventCommentConfig.slotVolume,
                    slotPitch: eventCommentConfig.slotPitch,
                    slotMaxPitch: eventCommentConfig.slotMaxPitch,
                    slotDistance: eventCommentConfig.slotDistance
                } : {
                    mode: 'Cycle',
                    list: [baseEntry]
                };
                var fallbackListForExtra = baseSource.list;
                var baseKey = [
                    eventCommentConfig ? 'comment' : 'native',
                    baseSource.mode,
                    baseSource.list.map(function(entry) { return [entry.name, entry.volume, entry.pitch].join(':'); }).join('|'),
                    baseSource.slotVolume !== undefined ? baseSource.slotVolume : '',
                    baseSource.slotPitch !== undefined ? baseSource.slotPitch : '',
                    baseSource.slotMaxPitch !== undefined ? baseSource.slotMaxPitch : '',
                    baseSource.slotDistance !== undefined ? baseSource.slotDistance : '',
                    basePan
                ].join('|');
                var baseChanged = baseKey !== state.lastKey;

                if (state.suppressBase) {
                    if (state.lastKey === null) {
                        state.lastKey = baseKey;
                    } else if (baseChanged) {
                        applyBaseConfigToSlot(baseSlot, baseSource);
                        state.lastKey = baseKey;
                        state.suppressBase = false;
                    }
                } else if (baseChanged || baseSlot.list.length === 0) {
                    applyBaseConfigToSlot(baseSlot, baseSource);
                    state.lastKey = baseKey;
                }

                JakeMSG_AMC._playSeHookGuard = true;
                try {
                    for (var i = 1; i < slots.length; i++) {
                        var extraSlot = ensureFootstepSlot(scoped.key, i);
                        var extraChosen = pickFootstep(extraSlot, fallbackListForExtra);
                        if (!extraChosen || !extraChosen.name) continue;
                        var extraOut = buildOutputSe(character, extraSlot, extraChosen, basePan, extraSlot.volume, extraSlot.pitch);
                        if (!extraOut) continue;
                        AudioManager.playSe(extraOut, i);
                    }

                    if (state.suppressBase) {
                        return { consumeOriginal: true };
                    }

                    var chosen0 = pickFootstep(baseSlot, fallbackListForExtra);
                    var out0 = buildOutputSe(character, baseSlot, chosen0, basePan, baseSlot.volume, baseSlot.pitch);
                    if (!out0) {
                        return { consumeOriginal: true };
                    }

                    if (eventCommentConfig) {
                        AudioManager.playSe(out0, 0);
                        return { consumeOriginal: true };
                    }

                    var needsOverride = out0.name !== baseEntry.name ||
                        out0.volume !== baseEntry.volume ||
                        out0.pitch !== baseEntry.pitch ||
                        out0.pan !== basePan;

                    if (needsOverride) {
                        AudioManager.playSe(out0, 0);
                        return { consumeOriginal: true };
                    }
                    return null;
                } finally {
                    JakeMSG_AMC._playSeHookGuard = false;
                }
            };
        }
    }
})();

// Ensure script-call identifiers are resolvable by MZ event eval context.
var bgmXPlay = window.bgmXPlay;
var bgsXPlay = window.bgsXPlay;
var meXPlay = window.meXPlay;
var seXPlay = window.seXPlay;
var bgsXFade = window.bgsXFade;
var seXStop = window.seXStop;
var bgsXAllFade = window.bgsXAllFade;
var bgsXOnlyFade = window.bgsXOnlyFade;
var seXAllStop = window.seXAllStop;
var seXOnlyStop = window.seXOnlyStop;
var setXFootstep = window.setXFootstep;
var setXFootstepElement = window.setXFootstepElement;
var setXFootstepCycle = window.setXFootstepCycle;
var setXFootstepMode = window.setXFootstepMode;
var clearAllXFootsteps = window.clearAllXFootsteps;
var clearAllFootsteps = window.clearAllFootsteps;


//=============================================================================
// ======== GLOBAL ========
//=============================================================================



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
