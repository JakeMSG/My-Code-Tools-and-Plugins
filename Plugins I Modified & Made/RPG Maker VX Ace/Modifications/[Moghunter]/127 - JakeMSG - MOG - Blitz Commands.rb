#==============================================================================
# +++ JakeMSG - MOG - Blitz Commands (v1.7) +++
#==============================================================================
# By Moghunter, edited by JakeMSG
# https://atelierrgss.wordpress.com/
#==============================================================================
# Allows you to activate actions through a sequence of commands.
#==============================================================================
# USE
#==============================================================================
# In the skills or items database, place the following comment in the
# notes box. 
#
# <Blitz Command>
#
# * Remember to set the button sequence in the script editor before
# using the skill.
#
# To set a specific speed in the button sequence, use the comment
# below.
#
# <Blitz Speed = X>
#
# ===============================================================================
# NEW FEATURES (JakeMSG)
# ==============================================================================
# 
# ================ Global Script Call (usable outside battle skills/items; Even outside Battles!):
#
# call_blitz_qte(sequence, duration = nil, name = "")
#
# sequence : Array of key tokens (example: ["Left", "Right", "Z"])
# duration : Optional input duration in frames.
#            nil or omitted = DEFAULT_INPUT_DURATION
# name     : Optional displayed QTE name.
#            If omitted or "", it stays empty.
#
# Result variable:
#
# $blitz_qte_result
#   true  = QTE succeeded
#   false = QTE failed
#
# The script call runs the QTE immediately and sets $blitz_qte_result when done.
# 
# 
# ================ Ability to add separate Random pools (aside from the default RANDOM_KEYS) and use them in sequences.
# ======== Add them as constants in the MOG_BLITZ_COMMANDS module, and use their constant name directly in the sequences.
#
# Example:
#   ARROW_KEYS = ["Up", "Down", "Left", "Right"]
#   FACE_KEYS  = ["Z", "X", "A", "S", "D"]
#
#
#   Key Sequence to use (in Skills or the global Script Call): ["ARROW_KEYS", "FACE_KEYS", "Random"]
#
#
#
#
#==============================================================================
# Required files. Graphics/System/
#==============================================================================
#
# Blitz_Background.png
# Blitz_Flash.png
# Blitz_Layout.png
# Blitz_Meter.png
# Chain_Command.png
#
#==============================================================================
# History
#==============================================================================
# v1.7 - JakeMSG - Added the Global Script Call and the ability to define separate Random pools.
#==============================================================================

$imported = {} if $imported.nil?
$imported[:mog_blitz_commands] = true

module MOG_BLITZ_COMMANDS
  #Setting the time to enter commands. (time X number of commands)
  DEFAULT_INPUT_DURATION = 180   #
 #==============================================================================
 # BLITZ_INPUT = { SKILL_ID => [COMMAND] }
 #
 # SKILL_ID = Skill ID in the database.
 # COMMANDS = Define the button sequence here.
 #            (To create the sequence, use the commands below)   
 #  
 # "Down" ,"Up" ,"Left" ,"Right" ,"Shift" ,"D" ,"S" ,"A" ,"Z" ,"X" ,"Q" ,"W"
 #
 # Example of use
 #
 # BLITZ_INPUT = { 
 # 25=>["Down","D","S","Right"],
 # 59=>["Down","Up","Left","Right","Shift","D","S","A","Z","X","Q","W"],
 # 80=>["Shift","D"]
 # }   
 #==============================================================================
  BLITZ_INPUT = {
   
#    166=>["Random","Random","Random","Random","Random"],
#    167=>["Random","Random","Random","Random","Random","Random"],
#    168=>["Random","Random","Random","Random","Random","Random","Random"],
#    131=>["X","Right","Left","Z","Z"], 
#    136=>["Down","Right","Down","Right","A"], 
   
 }  
 #Enable background image animation. 
 BACKGROUND_ENABLE = false   #false
 #Sliding speed of the background image.
 BACKGROUND_SCROLL_SPEED = [30,0]
 #Layout position.
 BLITZ_POSITION = [0,0]
 #Button position.
 BUTTON_POSITION = [265,190]    # [265,170]           #[307,205]
 #Position of the time meter.
 METER_POSITION = [64,249]  #[63,249]     
 #Position of the Flash sprite.
 FLASH_POSITION = [0,146]   # [0,146]
 #Icon position.
 ICON_POSITION = [-15,2] # [0,0]
 #Skill name position
 SKILL_NAME_POSITION = [220,126]   # [180,140]    [226,168]
 #Definition of words used in the blitz system.
 BLITZ_WORDS = ["Missed!", "Timeover", "Success!"]
 #Font configuration. 
 FONT_SIZE = 28  #22
 FONT_COLOR = Color.new(255,255,255)
 #Sprite priority.
 BLITZ_Z = 10500 
 #Sound when hitting the target. 
 RIGHT_SE = "Chime2"  #Chime1
 #Sound when making a mistake.
 WRONG_SE = "Buzzer1"  
 #Sound setting when activating the system.
 BLITZ_START_SE = "Saint9"
 
 
 # Random pool tokens usable in sequences.
 # - "Random" always uses RANDOM_KEYS.
 # - You can define additional *_KEYS arrays and use their constant name
 #   directly in sequences (example token: "ARROW_KEYS").
 # Example:
 #   ARROW_KEYS = ["Up", "Down", "Left", "Right"]
 #   FACE_KEYS  = ["Z", "X", "A", "S", "D"]
 #   Sequence: ["ARROW_KEYS", "FACE_KEYS", "Random"]
 #
 # Possible Key Tokens: "Up", "Down", "Left", "Right", "Shift", "D", "S", "A", "Z", "X", "Q", "W"
 # Note: The actual keys used in the script are determined by the RPG Maker's Input module, so make sure to use the correct tokens corresponding to the keys you want to use.
 #
 RANDOM_KEYS = ["Left","Right","Up","Down","Z","X"]   
 
 ARROW_KEYS = ["Up", "Down", "Left", "Right"]
 FACE_KEYS  = ["Z", "X", "A", "S", "D"]
 ALL_KEYS = ["Up", "Down", "Left", "Right", "Shift", "D", "S", "A", "Z", "X", "Q", "W"]
 
end

#==============================================================================
# ■ Game Temp
#==============================================================================
class Game_Temp
  attr_accessor :blitz_commands
  attr_accessor :blitz_commands_phase
  #--------------------------------------------------------------------------
  # ● Initialize
  #--------------------------------------------------------------------------      
  alias mog_blits_commands_initialize initialize
  def initialize
      @blitz_commands = [false,0] ; @blitz_commands_phase = false
      mog_blits_commands_initialize
  end
  
end

#==============================================================================
# ■ Scene_Battle
#==============================================================================
class Scene_Battle < Scene_Base
  
  #--------------------------------------------------------------------------
  # ● Use Item
  #--------------------------------------------------------------------------  
  alias mog_blitz_commands_use_item use_item
  def use_item
      if can_execute_blitz_input?
         blitz_before_action
         execute_blitz_input
         blitz_after_action
         unless $game_temp.blitz_commands[1] == nil
             return if !$game_temp.blitz_commands[0]
         end
      end
      mog_blitz_commands_use_item     
  end 
  
  #--------------------------------------------------------------------------
  # ● Blitz Before Action
  #--------------------------------------------------------------------------  
  def blitz_before_action
      record_window_data if $imported[:mog_atb_system]
      if $imported[:mog_menu_cursor]    
         @chain_curor_x = $game_temp.menu_cursor[2] 
         $game_temp.menu_cursor[2] = -999
         force_cursor_visible(false)
      end             
  end      
  
  #--------------------------------------------------------------------------
  # ● Blitz After ACtion
  #--------------------------------------------------------------------------  
  def blitz_after_action
      restore_window_data if $imported[:mog_atb_system]
      if $imported[:mog_menu_cursor] and @chain_curor_x != nil
         $game_temp.menu_cursor[2] = @chain_curor_x 
         
       end

  end    
  
  #--------------------------------------------------------------------------
  # ● Can Execute Blitz Input
  #--------------------------------------------------------------------------    
  def can_execute_blitz_input?
      return false if !@subject.is_a?(Game_Actor)
      return false if @subject.restriction != 0
      return true
  end
  
  #--------------------------------------------------------------------------
  # ● Execute Blitz Input
  #--------------------------------------------------------------------------   
  def execute_blitz_input 
      $game_temp.blitz_commands[0] = false
      action_id = @subject.current_action.item.note =~ /<Blitz Command>/ ? @subject.current_action.item.id : nil
      $game_temp.blitz_commands[1] = action_id
      return if action_id == nil
      blitz_command_sequence = MOG_BLITZ_COMMANDS::BLITZ_INPUT[action_id]
      if $imported[:mog_menu_cursor]    
         valor_x = $game_temp.menu_cursor[2] ; $game_temp.menu_cursor[2] = -999
         force_cursor_visible(false)
      end      
      if blitz_command_sequence != nil  
         blitz_sq = Blitz_Commands.new(blitz_command_sequence, @subject ,action_id)
         loop do
              $game_temp.blitz_commands_phase = true
              (blitz_sq.update ; Input.update) unless @spriteset.animation?
              @spriteset.update ; Graphics.update ; update_info_viewport
              break if blitz_sq.phase == 9
         end
         blitz_sq.dispose
      end        
      $game_temp.menu_cursor[2] = valor_x if $imported[:mog_menu_cursor]
      $game_temp.blitz_commands_phase = false
  end
  
end

#==============================================================================
# Game Temp
#==============================================================================
class Game_Temp
  
  attr_accessor :cache_blitz_command
  
  #--------------------------------------------------------------------------
  # ● Initialize
  #--------------------------------------------------------------------------
  alias mog_blitz_command_initialize initialize   
  def initialize
      mog_blitz_command_initialize
      cache_blt_cmd
  end
  
  #--------------------------------------------------------------------------
  # ● Cache Blt Cmd
  #--------------------------------------------------------------------------  
  def cache_blt_cmd
      @cache_blitz_command = []
      @cache_blitz_command.push(Cache.system("Blitz_Background"))
      @cache_blitz_command.push(Cache.system("IconSet"))
      @cache_blitz_command.push(Cache.system("Blitz_Flash"))
      @cache_blitz_command.push(Cache.system("Blitz_Meter"))
      @cache_blitz_command.push(Cache.system("Blitz_Layout"))
      @cache_blitz_command.push(Cache.system("Chain_Battle_Command"))
  end
  
end


#==============================================================================
# ■ Spriteset Battle
#==============================================================================
class Spriteset_Battle
   
  #--------------------------------------------------------------------------
  # ● Initialize
  #--------------------------------------------------------------------------    
  alias mog_blitz_commands_initialize initialize
  def initialize
      $game_temp.cache_blt_cmd
      mog_blitz_commands_initialize     
  end
end  
#==============================================================================
# Blitz Commands
#==============================================================================
class Blitz_Commands
  include MOG_BLITZ_COMMANDS
  attr_accessor :phase
  
  #--------------------------------------------------------------------------
  # ● Initialize
  #--------------------------------------------------------------------------      
    def initialize(sequence, subject, action_id, global_options = nil)
        @chain_command_original = sequence
        @phase = 0
        @actor = subject
        @skill = $data_skills[action_id]
        if @skill.nil?
            # Create a dummy skill for global QTE
            @skill = RPG::Skill.new
            @skill.name = "QTE"
            @skill.icon_index = 0
            @skill.note = ""
        end
        @skillname = @skill.name
        @action_id = action_id
        @chain_command = sequence.dup
        @end = false
        if global_options
            custom_name = global_options[:name]
            @skillname = custom_name.nil? ? "" : custom_name.to_s
            custom_duration = global_options[:duration]
            duration = custom_duration.nil? ? DEFAULT_INPUT_DURATION : custom_duration.to_i
            duration = DEFAULT_INPUT_DURATION if duration <= 0
        else
            duration = @skill.note =~ /<Blitz Speed = (\d+)>/i ? $1.to_i : DEFAULT_INPUT_DURATION
        end
        random_sequence
        @timer_max = duration
        @timer = @timer_max
        @com = 0
        @com_index = 0
        @new_x = 0
        Audio.se_play("Audio/SE/" + BLITZ_START_SE, 100, 100) rescue nil
        create_sprites
    end
    

  
        def random_sequence
            @chain_command_original.each_with_index do |command, index|
                pool = random_key_pool_for(command)
                next if pool.nil? || pool.empty?
                @chain_command[index] = pool[rand(pool.size)]
            end
        end

        def random_key_pool_for(command)
            token = command.to_s
            return RANDOM_KEYS if token == "Random"
            const_name = token.upcase
            return nil unless MOG_BLITZ_COMMANDS.const_defined?(const_name)
            pool = MOG_BLITZ_COMMANDS.const_get(const_name)
            return nil unless pool.is_a?(Array)
            pool
        end

  
  
  
  #--------------------------------------------------------------------------
  # ● Create Sprites
  #--------------------------------------------------------------------------        
  def create_sprites
      create_background ; create_layout ; create_buttons ; create_meter
      create_flash ; create_skill_name ; create_icon      
      

  end
  
  #--------------------------------------------------------------------------
  # ● Create Background
  #--------------------------------------------------------------------------        
  def create_background
      @background = Plane.new ; @background.opacity = 0
      @background.bitmap = $game_temp.cache_blitz_command[0]
      @background.z = BLITZ_Z ; @background.visible = BACKGROUND_ENABLE
  end
  
  #--------------------------------------------------------------------------
  # ● Create Icon
  #--------------------------------------------------------------------------      
  def create_icon
      @icon_image = $game_temp.cache_blitz_command[1]
      @icon_sprite = Sprite.new ; @icon_sprite.bitmap = Bitmap.new(24,24)
      @icon_sprite.z = BLITZ_Z + 3
      @org_x2 = 80 + ICON_POSITION[0] - @center + SKILL_NAME_POSITION[0]
      @icon_sprite.x = @org_x2 ; @icon_sprite.opacity = 0
      @icon_sprite.y = ICON_POSITION[1] + SKILL_NAME_POSITION[1]     
      icon_rect = Rect.new(@skill.icon_index % 16 * 24, @skill.icon_index / 16 * 24, 24, 24)
      @icon_sprite.bitmap.blt(0,0, @icon_image, icon_rect)
  end  
  
  #--------------------------------------------------------------------------
  # ● Initialize
  #--------------------------------------------------------------------------      
  def create_skill_name
      @skill_name = Sprite.new ; @skill_name.bitmap = Bitmap.new(200,32)
      @skill_name.bitmap.font.size = FONT_SIZE
      @skill_name.z = BLITZ_Z + 3 ; @skill_name.y = SKILL_NAME_POSITION[1]
      @skill_name.opacity = 0 ; refresh_skill_name
  end
  
  #--------------------------------------------------------------------------
  # ● Refresh Skill Name
  #--------------------------------------------------------------------------        
  def refresh_skill_name
      cm = @skillname.to_s.split(//).size
      @center = ((200 / @skill_name.bitmap.font.size) * cm / 2) + 5
      @org_x = SKILL_NAME_POSITION[0] ; @skill_name.x = @org_x  
      @skill_name.bitmap.font.color = Color.new(0,0,0)
      @skill_name.bitmap.draw_text(1,1,200,32,@skillname.to_s,1)  
      @skill_name.bitmap.font.color = FONT_COLOR
      @skill_name.bitmap.draw_text(0,0,200,32,@skillname.to_s,1)  
  end  
  
  #--------------------------------------------------------------------------
  # ● Create Flash
  #--------------------------------------------------------------------------          
  def create_flash
      @flash_type = 0 ; @flash_image = $game_temp.cache_blitz_command[2]
      @flash_cw = @flash_image.width ; @flash_ch = @flash_image.height / 2
      @flash = Sprite.new ; @flash.bitmap = Bitmap.new(@flash_cw,@flash_ch)
      @flash.x = FLASH_POSITION[0] ; @flash.y = FLASH_POSITION[1]
      @flash.z = BLITZ_Z + 2 ; @flash.opacity = 0 ; @flash.blend_type = 1
      refresh_flash
  end
  
  #--------------------------------------------------------------------------
  # ● Refresh Flash
  #--------------------------------------------------------------------------            
  def refresh_flash
      @flash.bitmap.clear
      f_scr = Rect.new(0,@flash_type * @flash_ch,@flash_cw,@flash_ch)
      @flash.bitmap.blt(0,0,@flash_image,f_scr)
  end

  #--------------------------------------------------------------------------
  # ● Create Meter
  #--------------------------------------------------------------------------          
  def create_meter
      @meter_image = $game_temp.cache_blitz_command[3]
      @meter_cw = @meter_image.width ; @meter_ch = @meter_image.height
      @meter_sprite = Sprite.new
      @meter_sprite.bitmap = Bitmap.new(@meter_cw,@meter_ch)
      @meter_sprite.x = METER_POSITION[0] ; @meter_sprite.y = METER_POSITION[1]
      @meter_sprite.z = BLITZ_Z + 2 ; @meter_sprite.opacity = 0 ; update_meter
  end
  
  #--------------------------------------------------------------------------
  # ● Update Meter
  #--------------------------------------------------------------------------            
  def update_meter
      return if @meter_sprite == nil
      @meter_sprite.bitmap.clear ; m_width = @meter_cw * @timer / @timer_max
      m_scr = Rect.new(0,0,m_width,@meter_ch)
      @meter_sprite.bitmap.blt(0,0,@meter_image, m_scr)
  end
  
  #--------------------------------------------------------------------------
  # ● Create Layout
  #--------------------------------------------------------------------------          
  def create_layout
      @layout = Sprite.new ; @layout.bitmap = $game_temp.cache_blitz_command[4]
      @layout.x = BLITZ_POSITION[0] ; @layout.y = BLITZ_POSITION[1]
      @layout.z = BLITZ_Z + 1 ; @layout.opacity = 0
  end
  
  #--------------------------------------------------------------------------
  # ● Create Buttons
  #--------------------------------------------------------------------------       
  def create_buttons   
    
    @image = $game_temp.cache_blitz_command[5]  
    @image_cw = @image.width / 13 ; @image_ch = @image.height  
    @image_cw_max = (@image_cw + 5) * @chain_command.size
    @sprite = Sprite.new ; @sprite.bitmap = Bitmap.new(@image_cw_max,@image_ch * 2)

    if @chain_command.size <= 15
        @sprite.x = (Graphics.width / 2) - ((@image_cw + 5) * @chain_command.size) / 2
        @new_x = 0
     else   
        @sprite.x = (Graphics.width / 2) ; @new_x = @sprite.x 
     end   
     @sprite.x =  BUTTON_POSITION[0] 
     @sprite.y = BUTTON_POSITION[1] 
     @sprite.z = BLITZ_Z + 1 ; @sprite.opacity = 0 ; refresh_button
     

  end  
  
  #--------------------------------------------------------------------------
  # ● Refresh Button
  #--------------------------------------------------------------------------         
  def refresh_button
     return if @sprite == nil
     @sprite.bitmap.clear
     @chain_command.each_with_index do |i, index|
        command_list_check(i) 
         bitmap_src_rect = Rect.new(@com * @image_cw, 0, @image_cw, @image_ch)
         if @com_index == index
            @sprite.bitmap.blt(index * (@image_cw + 5) , 0 , @image, bitmap_src_rect)
         else
            @sprite.bitmap.blt(index * (@image_cw + 5) , @image_ch - 15 , @image, bitmap_src_rect)    ##  @image_ch -15
        end     
     end  
      @new_x = BUTTON_POSITION[0] - ((@image_cw + 5) * @com_index)  
  end
 
  #--------------------------------------------------------------------------
  # ● Dispose
  #--------------------------------------------------------------------------        
  def dispose
      dispose_background ; dispose_layout ; dispose_buttons ; dispose_meter
      dispose_flash ; dispose_name ; dispose_icon_sprite      
  end
  
  #--------------------------------------------------------------------------
  # ● Dispose Background
  #--------------------------------------------------------------------------          
  def dispose_background
      return if @background == nil
      @background.dispose ; @background = nil
  end  
  
  #--------------------------------------------------------------------------
  # ● Dispose Icon Sprite
  #--------------------------------------------------------------------------        
  def dispose_icon_sprite
      return if @icon_sprite == nil
      @icon_sprite.bitmap.dispose ; @icon_sprite.dispose ; @icon_sprite = nil
  end  
  
  #--------------------------------------------------------------------------
  # ● Dispose Name
  #--------------------------------------------------------------------------        
  def dispose_name
      return if @skill_name == nil
      @skill_name.bitmap.dispose ; @skill_name.dispose ; @skill_name = nil
  end  
  
  #--------------------------------------------------------------------------
  # ● Dispose Flash
  #--------------------------------------------------------------------------            
  def dispose_flash
      return if @flash == nil
      @flash.bitmap.dispose ; @flash.dispose ; @flash = nil
  end    
  
  #--------------------------------------------------------------------------
  # ● Dispose Meter
  #--------------------------------------------------------------------------            
  def dispose_meter
      return if @meter_sprite == nil
      @meter_sprite.bitmap.dispose ; @meter_sprite.dispose ; @meter_sprite = nil
  end  
  
  #--------------------------------------------------------------------------
  # ● Dispose Buttons
  #--------------------------------------------------------------------------         
  def dispose_buttons
      return if @sprite == nil
      @sprite.bitmap.dispose ; @sprite.dispose ; @sprite = nil
  end  
  
  #--------------------------------------------------------------------------
  # ● Dispose Layout
  #--------------------------------------------------------------------------            
  def dispose_layout
      return if @layout == nil
      @layout.dispose ; @layout = nil
  end  
  
  #--------------------------------------------------------------------------
  # ● Update
  #--------------------------------------------------------------------------        
  def update
      if @end  and @sprite.x == @new_x
         update_flash ; update_background ; update_end
         return 
      end
      update_background ; update_timer ; update_command ; update_slide_command
      update_meter ; update_flash ; update_opacity

  end
  
  #--------------------------------------------------------------------------
  # ● Update Opacity
  #--------------------------------------------------------------------------          
  def update_opacity 
      return if @sprite.opacity == nil
      @sprite.opacity += 10 ; @layout.opacity += 50                    #10
      @meter_sprite.opacity += 10 ; @skill_name.opacity += 10
      @background.opacity += 10 ; @icon_sprite.opacity += 10   
  end
    
  #--------------------------------------------------------------------------
  # ● Update End
  #--------------------------------------------------------------------------          
  def update_end
      fs = 6 ; @icon_sprite.opacity -= fs ; @background.opacity -= fs
      @skill_name.opacity -= fs ; @sprite.opacity -= fs ; @layout.opacity -= fs
      @meter_sprite.opacity -= fs ; @phase = 9 if @background.opacity == 0
  end
  
  #--------------------------------------------------------------------------
  # ● Update Background
  #--------------------------------------------------------------------------          
  def update_background
      return if @background == nil
      @background.ox += BACKGROUND_SCROLL_SPEED[0]
      @background.oy += BACKGROUND_SCROLL_SPEED[1]
  end    
  
  #--------------------------------------------------------------------------
  # ● Update Flash
  #--------------------------------------------------------------------------              
  def update_flash
      return if @flash == nil or @flash.opacity == 0
      @flash.opacity -= 10
  end  
  
  #--------------------------------------------------------------------------
  # ● Update Timer
  #--------------------------------------------------------------------------          
  def update_timer
#      return if @timer <= 0
      return if @end
      @timer -= 1 # ; @end = true if @timer <= 0  # wrong_command(1) if @timer == 0
      
      if @timer <= 0
         @flash_type = 1
         Audio.se_play("Audio/SE/" + WRONG_SE , 80, 100) ; @flash.opacity = 255   #
          @skill_name.bitmap.clear
          @end =true
 #        wname = type == 0 ? BLITZ_WORDS[0] : BLITZ_WORDS[1]
          $game_temp.blitz_commands[0] = false
          @skill_name.bitmap.draw_text(0,0,200,32,BLITZ_WORDS[1].to_s,1)    #wname
          @icon_sprite.visible = false ; refresh_flash
      
     end
      
  end
  
  #--------------------------------------------------------------------------
  # ● Update Slide Command
  #--------------------------------------------------------------------------          
  def update_slide_command
      return if @sprite == nil or @sprite.x == @new_x
      slide_speed = 5 + ((@sprite.x - @new_x).abs / 5)      
      @sprite.x -= slide_speed ; @sprite.x = @new_x if @sprite.x < @new_x
  end
  
end

#==============================================================================
# Blitz Commands
#==============================================================================
class Blitz_Commands
  
 #--------------------------------------------------------------------------
 # ● Update Command
 #--------------------------------------------------------------------------       
 def update_command
     return if @end
     if Input.trigger?(Input::X) ; check_command(0)
     elsif Input.trigger?(:Z) ; check_command(1)
     elsif Input.trigger?(:Y) ; check_command(2)
     elsif Input.trigger?(:A) ; check_command(3)
     elsif Input.trigger?(:C) ; check_command(4)
     elsif Input.trigger?(:B) ; check_command(5)
     elsif Input.trigger?(:L) ; check_command(6)
     elsif Input.trigger?(:R) ; check_command(7)        
     elsif Input.trigger?(:RIGHT) ; check_command(8)
     elsif Input.trigger?(:LEFT) ; check_command(9)
     elsif Input.trigger?(:DOWN) ; check_command(10)
     elsif Input.trigger?(:UP) ; check_command(11)
     end   
 end  
   
 #--------------------------------------------------------------------------
 # ● command_list_check
 #--------------------------------------------------------------------------       
 def command_list_check(command) 
     case command
         when "A" ; @com = 0  
         when "D" ; @com = 1  
         when "S" ; @com = 2
         when "Shift" ; @com = 3
         when "Z" ; @com = 4
         when "X" ; @com = 5
         when "Q" ; @com = 6
         when "W" ; @com = 7            
         when "Right" ; @com = 8
         when "Left" ; @com = 9
         when "Down" ; @com = 10
         when "Up" ; @com = 11
         else ; @com = 12           
     end 
 end   
 
 #--------------------------------------------------------------------------
 # ● check_command
 #--------------------------------------------------------------------------            
 def check_command(com)
     if com != -1
        right_input = false
        @chain_command.each_with_index do |i, index|
        if index == @com_index
           command_list_check(i) ; right_input = true if @com == com
        end end
     else  
       command_list_check(@com_index) ; right_input = true
     end  
     if right_input 
        next_command
     else  
        wrong_command(0)
     end  
 end  
   
 #--------------------------------------------------------------------------
 # ● Next Command
 #--------------------------------------------------------------------------            
 def next_command   
     @flash.opacity = 255 ; @flash_type = 2 ; @com_index += 1   
     Audio.se_play("Audio/SE/" + RIGHT_SE, 80, 100)
     refresh_button   ; refresh_flash
     if @com_index == @chain_command.size

        @flash_type = 0
        refresh_button   ; refresh_flash

        @end = true ; @skill_name.bitmap.clear
        @skill_name.bitmap.draw_text(0,0,200,32,BLITZ_WORDS[2].to_s,1)
        @icon_sprite.visible = false ; $game_temp.blitz_commands[0] = true
     end
 end     
 
 #--------------------------------------------------------------------------
 # ● wrong_command
 #--------------------------------------------------------------------------              
 def wrong_command(type)
     Audio.se_play("Audio/SE/" + "Parry", 70, 100) ; @flash.opacity = 255  #WRONG_SE
     @flash_type = 1 ;    #@skill_name.bitmap.clear    ;   @end = true    
     
     
#         @end =true
#        wname = type == 0 ? BLITZ_WORDS[0] : BLITZ_WORDS[1]
#        $game_temp.blitz_commands[0] = false
#      @skill_name.bitmap.draw_text(0,0,200,32,wname.to_s,1)
#        @icon_sprite.visible = false ; refresh_flash
         
          @timer -= 15
          refresh_flash


   end
  
  
   
   
   
end







#==============================================================================
# Global Blitz QTE Script Call
#==============================================================================
# Usage: call_blitz_qte(["Left", "Right", "Z"], duration = nil, name = "")
# After QTE, $blitz_qte_result will be true (success) or false (fail)
#==============================================================================

module BlitzQTE
    def self.run(sequence, duration = nil, name = "")
        sequence = [sequence] unless sequence.is_a?(Array)
        sequence = sequence.compact
        $blitz_qte_result = false
        return false if sequence.empty?

        $game_temp.blitz_commands[0] = false
        $game_temp.blitz_commands_phase = true
        blitz = Blitz_Commands.new(sequence, nil, 0, {:duration => duration, :name => name})
        begin
            loop do
                blitz.update
                Input.update
                Graphics.update
                break if blitz.phase == 9
            end
        ensure
            blitz.dispose if blitz
            $game_temp.blitz_commands_phase = false
        end
        $blitz_qte_result = !!$game_temp.blitz_commands[0]
        $blitz_qte_result
  end
end

def call_blitz_qte(sequence, duration = nil, name = "")
        BlitzQTE.run(sequence, duration, name)
end