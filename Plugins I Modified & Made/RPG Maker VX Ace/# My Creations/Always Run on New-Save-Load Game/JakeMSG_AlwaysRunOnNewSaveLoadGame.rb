#==============================================================================
# ** Always Run on New-Save-Load Game
#------------------------------------------------------------------------------
#  Lets you run custom Script Call blocks at 3 timings:
#    - New Game
#    - Save Game
#    - Load Game
#
#  Put your code inside config blocks below 
#  Each block runs in Game_Interpreter context, same as event "Script" command.
#==============================================================================

module JakeMSG_AlwaysRunOnNewSaveLoadGame
  #--------------------------------------------------------------------------
  # * USER CONFIG - NEW GAME
  #   Put Script Call code below.
  #--------------------------------------------------------------------------
  NEW_GAME_SCRIPT = <<-'SCRIPT'
# ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ Insert Here ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

# Example:
# $game_switches[1] = true

# ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ Insert Here ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  SCRIPT

  #--------------------------------------------------------------------------
  # * USER CONFIG - SAVE GAME
  #   Runs before save data is written.
  #--------------------------------------------------------------------------
  SAVE_GAME_SCRIPT = <<-'SCRIPT'
# ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ Insert Here ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

# Example:
# $game_variables[1] = Graphics.frame_count

# ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ Insert Here ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
 p "SAVE GAME!"
  SCRIPT

  #--------------------------------------------------------------------------
  # * USER CONFIG - LOAD GAME
  #   Runs after save data is loaded.
  #--------------------------------------------------------------------------
  LOAD_GAME_SCRIPT = <<-'SCRIPT'
# ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ Insert Here ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

# Example:
# p "LOAD GAME!"

# ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ Insert Here ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  SCRIPT
  #--------------------------------------------------------------------------
  # * Run one configured script block
  #--------------------------------------------------------------------------
  def self.run_script(text)
    return if text.nil? || text.strip.empty?
    lines = text.gsub("\r\n", "\n").split("\n")
    return if lines.all? {|line| line.strip.empty? }
    commands = []
    lines.each_with_index do |line, i|
      code = (i == 0 ? 355 : 655)
      commands << RPG::EventCommand.new(code, 0, [line])
    end
    commands << RPG::EventCommand.new(0, 0, [])
    interpreter = Game_Interpreter.new
    interpreter.instance_variable_set(:@list, commands)
    interpreter.instance_variable_set(:@index, 0)
    interpreter.command_355
  end

  #--------------------------------------------------------------------------
  # * Run by timing symbol
  #--------------------------------------------------------------------------
  def self.run_timing(timing)
    case timing
    when :new_game
      run_script(NEW_GAME_SCRIPT)
    when :save_game
      run_script(SAVE_GAME_SCRIPT)
    when :load_game
      run_script(LOAD_GAME_SCRIPT)
    end
  end
end

module DataManager
  class << self
    alias jakemsg_timed_sc_setup_new_game setup_new_game
    alias jakemsg_timed_sc_save_game_without_rescue save_game_without_rescue
    alias jakemsg_timed_sc_load_game_without_rescue load_game_without_rescue
  end

  #--------------------------------------------------------------------------
  # * Set Up New Game + custom timing block
  #--------------------------------------------------------------------------
  def self.setup_new_game
    jakemsg_timed_sc_setup_new_game
    JakeMSG_AlwaysRunOnNewSaveLoadGame.run_timing(:new_game)
  end

  #--------------------------------------------------------------------------
  # * Save + custom timing block (before writing save data)
  #--------------------------------------------------------------------------
  def self.save_game_without_rescue(index)
    JakeMSG_AlwaysRunOnNewSaveLoadGame.run_timing(:save_game)
    jakemsg_timed_sc_save_game_without_rescue(index)
  end

  #--------------------------------------------------------------------------
  # * Load + custom timing block (after loading save data)
  #--------------------------------------------------------------------------
  def self.load_game_without_rescue(index)
    result = jakemsg_timed_sc_load_game_without_rescue(index)
    JakeMSG_AlwaysRunOnNewSaveLoadGame.run_timing(:load_game) if result
    result
  end
end
