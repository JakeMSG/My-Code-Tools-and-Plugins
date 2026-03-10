#============================================================================
# DYNAMIC FEATURES
# v1.00 by Shaz
#----------------------------------------------------------------------------
# This script allows you to add and delete features for Actors, Classes,
# Weapons, Armors and States, dynamically, without requiring custom states
# set up for the sole purpose of granting or changing features.
# Skills and Items also have features due to inheritance, but they're not
# used by Ace, so while the script will allow you to set them up, there's
# really not much of a point in doing it.
#----------------------------------------------------------------------------
# To Install:
# Copy and paste into a new slot in materials, below all other scripts
#----------------------------------------------------------------------------
# To Use:
# Enter one of the following as a Call Script event command
#
# add_feature(class, id, feature_code, data_id[, value])
# remove_feature(class, id, feature_code, data_id[, value])
# get_feature(class, id, feature_code, data_id)
#
# Parameters:
# class - this is a symbol, and should be one of :actor, :class, :skill, :item,
#         :weapon, :armor, :state
# id    - this is the id of the object you want to change (an actor id, or a
#         weapon id, for example)
# feature_code - this is a code to indicate what feature to change.  It is a
#                symbol, and should be one of :element_rate, :debuff_rate,
#                :state_rate, :state_resist, :param, :xparam, :sparam,
#                :atk_element, :atk_state, :atk_speed, :atk_times, :stype_add,
#                :stype_seal, :skill_add, :skill_seal, :equip_wtype,
#                :equip_atype, :equip_fix, :equip_seal, :slot_type,
#                :action_plus, :special_flag, :collapse_type, :party_ability
# data_id - this id refers to the drop-down list when adding features.  When
#           adjusting something represented in the database (actors, weapons,
#           etc, including elements and types in the Terms tab), it is the id
#           of that item.  When it is not something in the database (like the
#           selections on the Other tab in features), it is the number of the
#           item in the drop-down list, starting at 0 for the top item (so the
#           Party Ability for Gold Double has a data id of 4)
# value - this is only necessary for features where you set a numeric value.
#         Percentages should be sent as a decimal (so 75% is 0.75, not 75).
#         This is optional for the remove_feature call, and when left out, ANY
#         features for that code and data id will be removed.
#
# get_feature will return nil if a value is not found for that feature.
#
# ================ JakeMSG - My Findings ================
# ======== General
# ==== The "Features" added by this Script are all separate percentage multipliers
# == Thus, all "Values" are Percentage multipliers 
# ==== How they "stack":
# == For Parameters: Multiplicatively with one another
# = Eg.: two "10"s = "100"
# == For X and S Parameters: Cumulatively with one another
# = Eg.: two "10"s = "20"
# * This is because the X and S parameters, themselves, are multipliers  
# ==== The Parameters are still bound by the their Min and Max values, as determined in the "Game_BattlerBase" class
# ** Change those with your own Script if you wish for different Min/Max values
# ==== The added "Features" are Saved to the Save File upon Saving
# ======== Values
# ==== Values are percentage multipliers, in Float form
# ** If you try to use Integers for those values (such as engine Variables), use a ".to_f" to convert them to Float values
# ==== Value "1" = "100%"
# == "0.5" = "50%"; "0.22" = "22%" etc.
# == "2" = "200%"; "4.554" = "455.4%" etc.
# == Eg.: "add_feature(...,10)" won't be a "+10", rather an "*10"
# ==== Negative values can also be used
# == Eg.: "add_feature(...,-10)"
# == This is relevant either for X and S Parameters, or for multiple usages of Features
# ======== "add_features()"
# ==== Each call of this function adds its own, separate, "feature" multiplier
# ====
# ======== "get_features()"
# ==== Will only return a feature if any was previously created (via "add_features()"
# == Will not return the innate X or S parameters (of the engine itself)
# ==== Will return only the first feature for each "data_id"
# == Eg: Having multiple features for TPRegen Xparameter will only return the value of the first one
# ======== "remove_features()"
# ==== Will remove all and only the features equal in Value to the Value specified, for the specified "data_id"
# == Eg.: If you have (for the same "data_id") the Features "10", "4" and "10", calling the function foor the Value 10 will remove the 2 Features that have the Value 10 (and leave the one with Value 4)
# == The function distinguishes between Positive and Negative numbers
# = Eg: For Features "-10" and "10", trying to Remove with Value "10" will only remove the 2nd Feature (not the "-10" one)
#
#----------------------------------------------------------------------------
# Terms:
# Use in free and commercial games
# Credit Shaz
#============================================================================
# <<<<<<<<<<<<<<<<==================================== JakeMSG Expansion
# ================ Functions Added: 
# get_feature_array(class, id, feature_code, data_id)
# get_feature_on_position(class, id, feature_code, data_id, position_id)
# get_feature_repetitions(class, id, feature_code, data_id[, value])
#
# remove_feature_on_position(class, id, feature_code, data_id, position_id)
# remove_feature_once(class, id, feature_code, data_id[, value])
#
#
# ================ New Parameter added:
# position_id - Used in the functions that require a specific "Position" of a 
#               parameter (out of the Array of Features for a specific "data_id")
#               The count starts at position 0 
#
#
# ================ How to use each Function
# ======== "get_feature_array(class, id, feature_code, data_id)"
# ==== Returns an Array of all the Features present, or Nil if none are found
# ======== "get_feature_on_position(class, id, feature_code, data_id, position_id)"
# ==== "position_id" - The position of the feature to be shown (from the features present)
# ==== Returns the feature present at the "position_id", or Nil if none is found
# ======== "get_feature_repetitions(class, id, feature_code, data_id[, value])"
# ==== Returns the number of repetitions of the Feature equal to the Value given
# ==== If no Value is given, will instead return the total number of Features present
#
# ======== "remove_feature_on_position(class, id, feature_code, data_id, position_id)"
# ==== "position_id" - The position of the feature to be shown (from the features present)
# ==== Removes only the Feature on the given position, from those present
# ======== "remove_feature_once(class, id, feature_code, data_id[, value])"
# ==== Removes only one of the Features equal to the Value given
# ==== If no Value is given, will instead remove the first Feature from those present
# ====================================>>>>>>>>>>>>>>>> JakeMSG Expansion
#============================================================================
=begin
================================ Parameters' ID / Names
================ Fluctuant parameters
.level # Normally, only for Actor 
.hp
.mp
.tp
.hp_rate # = Current_HP / Max_HP
.mp_rate # = Current_MP / Max_MP
.tp_rate # = Current_TP / Max_TP
================ (Normal) Parameters
.mhp #    param(0)     # MHP  Maximum Hit Points
.mmp #    param(1)     # MMP  Maximum Magic Points
.atk #    param(2)     # ATK  ATtacK power
.def #    param(3)     # DEF  DEFense power
.mat #    param(4)     # MAT  Magic ATtack power
.mdf #    param(5)     # MDF  Magic DeFense power
.agi #    param(6)     # AGI  AGIlity
.luk #    param(7)     # LUK  LUcK
================ X Parameters (percentage values)
.hit #    xparam(0)    # HIT  HIT rate
.eva #    xparam(1)    # EVA  EVAsion rate
.cri #    xparam(2)    # CRI  CRItical rate
.cev #    xparam(3)    # CEV  Critical EVasion rate
.mev #    xparam(4)    # MEV  Magic EVasion rate
.mrf #    xparam(5)    # MRF  Magic ReFlection rate
.cnt #    xparam(6)    # CNT  CouNTer attack rate
.hrg #    xparam(7)    # HRG  Hp ReGeneration rate
.mrg #    xparam(8)    # MRG  Mp ReGeneration rate
.trg #    xparam(9)    # TRG  Tp ReGeneration rate
================ S Parameters (percentage values)
.tgr #    sparam(0)    # TGR  TarGet Rate
.grd #    sparam(1)    # GRD  GuaRD effect rate
.rec #    sparam(2)    # REC  RECovery effect rate
.pha #    sparam(3)    # PHA  PHArmacology
.mcr #    sparam(4)    # MCR  Mp Cost Rate
.tcr #    sparam(5)    # TCR  Tp Charge Rate
.pdr #    sparam(6)    # PDR  Physical Damage Rate
.mdr #    sparam(7)    # MDR  Magical Damage Rate
.fdr #    sparam(8)    # FDR  Floor Damage Rate
.exr #    sparam(9)    # EXR  EXperience Rate
=end
#============================================================================



module DataManager
  class << self; 
    alias shaz_dynamic_features_create_game_objects create_game_objects
    alias shaz_dynamic_features_make_save_contents make_save_contents
    alias shaz_dynamic_features_extract_save_contents extract_save_contents
  end
  #--------------------------------------------------------------------------
  # * Create Game Objects
  #--------------------------------------------------------------------------
  def self.create_game_objects
    shaz_dynamic_features_create_game_objects
    $game_features      = {}
  end
  #--------------------------------------------------------------------------
  # * Create Save Contents
  #--------------------------------------------------------------------------
  def self.make_save_contents
    contents = shaz_dynamic_features_make_save_contents
    contents[:features]      = $game_features ? $game_features : {}
    contents
  end
  #--------------------------------------------------------------------------
  # * Extract Save Contents
  #--------------------------------------------------------------------------
  def self.extract_save_contents(contents)
    shaz_dynamic_features_extract_save_contents(contents)
    $game_features      = contents[:features] ? contents[:features] : {}
  end
end

class RPG::BaseItem
  @@feature_code = {
    :element_rate  => 11,              # Element Rate
    :debuff_rate   => 12,              # Debuff Rate
    :state_rate    => 13,              # State Rate
    :state_resist  => 14,              # State Resist
    :param         => 21,              # Parameter
    :xparam        => 22,              # Ex-Parameter
    :sparam        => 23,              # Sp-Parameter
    :atk_element   => 31,              # Atk Element
    :atk_state     => 32,              # Atk State
    :atk_speed     => 33,              # Atk Speed
    :atk_times     => 34,              # Atk Times+
    :stype_add     => 41,              # Add Skill Type
    :stype_seal    => 42,              # Disable Skill Type
    :skill_add     => 43,              # Add Skill
    :skill_seal    => 44,              # Disable Skill
    :equip_wtype   => 51,              # Equip Weapon
    :equip_atype   => 52,              # Equip Armor
    :equip_fix     => 53,              # Lock Equip
    :equip_seal    => 54,              # Seal Equip
    :slot_type     => 55,              # Slot Type
    :action_plus   => 61,              # Action Times+
    :special_flag  => 62,              # Special Flag
    :collapse_type => 63,              # Collapse Effect
    :party_ability => 64,              # Party Ability
  }
  
  def features
    if $game_features && $game_features[class_symbol] && 
        $game_features[class_symbol][@id]
      $game_features[class_symbol][@id]
    else
      @features
    end
  end
  
  def clone_features
    $game_features = {} if !$game_features
    $game_features[class_symbol] = {} if !$game_features[class_symbol]
    $game_features[class_symbol][@id] = @features.dup if 
      !$game_features[class_symbol][@id]
  end
  
  def add_feature(code, data_id, value)
    clone_features
    $game_features[class_symbol][@id].push(RPG::BaseItem::Feature.new(
      @@feature_code[code], data_id, value))
  end
  
  def remove_feature(code, data_id, value)
    clone_features
    i = $game_features[class_symbol][@id].length - 1
    while i >= 0
      f = $game_features[class_symbol][@id][i]
      $game_features[class_symbol][@id].delete_at(i) if 
        f.code == @@feature_code[code] && f.data_id == data_id && 
          (f.value == value || value.nil?)
      i -= 1
    end
  end

  def get_feature(code, data_id)
    features.each { |feature|
      return feature.value if feature.code == @@feature_code[code] && 
        feature.data_id == data_id
    }
    return nil
  end
  
# <<<<================ JakeMSG Expansion

  def get_feature_array(code, data_id)
    @it = 0
    $fetArr = [0]
    features.each { |feature|
      if ( feature.code == @@feature_code[code] && feature.data_id == data_id )
        $fetArr[@it] = feature.value
        @it += 1
      end 
    }
    if (@it > 0)
      return $fetArr
    else
      return nil
    end
  end
  
  def get_feature_on_position(code, data_id, position)
    @it = 0
    features.each { |feature|
      if (feature.code == @@feature_code[code] && feature.data_id == data_id)
        if ( @it == position )
          return feature.value
        else
          @it += 1
        end
      end 
    }
    return nil
  end
  
  def get_feature_repetitions(code, data_id, value)
    @it = 0
    features.each { |feature|
      if (feature.code == @@feature_code[code] && feature.data_id == data_id)
        if ( feature.value == value || value.nil?)
          @it += 1
        end
      end 
    }
    return @it
  end
  
  def remove_feature_on_position(code, data_id, position)
    clone_features
    i = $game_features[class_symbol][@id].length - 1
    @it = 0
    @il = 0
    while @it <= i
      f = $game_features[class_symbol][@id][@it]
      if (f.code == @@feature_code[code] && f.data_id == data_id)
        if ( @il == position )
          $game_features[class_symbol][@id].delete_at(@it)
          break
        else
          @il += 1
        end
      end
      @it += 1
    end
  end
  
  def remove_feature_once(code, data_id, value)
    clone_features
    i = $game_features[class_symbol][@id].length - 1
    @it = 0
    while @it <= i
      f = $game_features[class_symbol][@id][@it]
      if (f.code == @@feature_code[code] && f.data_id == data_id)
        if ( f.value == value || value.nil? )
          $game_features[class_symbol][@id].delete_at(@it)
          break
        end
      end
      @it += 1
    end
  end
  
# ================>>>> JakeMSG Expansion


  def class_symbol
    case self.class.to_s
      when /Actor/i;  :actor
      when /Class/i;  :class
      when /Skill/i;  :skill
      when /Item/i;   :item
      when /Weapon/i; :weapon
      when /Armor/i;  :armor
      when /State/i;  :state
        
      when /Enemy/i;  :enemy
    end
  end
end

class Game_Interpreter
  def get_class_object(cls, id)
    obj = nil
    case cls
      when :actor;  obj = $data_actors[id]
      when :class;  obj = $data_classes[id]
      when :skill;  obj = $data_skills[id]
      when :item;   obj = $data_items[id]
      when :weapon; obj = $data_weapons[id]
      when :armor;  obj = $data_armors[id]
      when :state;  obj = $data_states[id]
        
      when :enemy;  obj = $data_enemies[id]
    end
    obj
  end
    
  def add_feature(cls, id, feature_code, data_id, value = 0)
    get_class_object(cls, id).add_feature(feature_code, data_id, value)
  end
  
  def remove_feature(cls, id, feature_code, data_id, value = nil)
    get_class_object(cls, id).remove_feature(feature_code, data_id, value)
  end
  
  def get_feature(cls, id, feature_code, data_id)
    get_class_object(cls, id).get_feature(feature_code, data_id)
  end
  
# <<<<================ JakeMSG Expansion

  def get_feature_array(cls, id, feature_code, data_id)
    get_class_object(cls, id).get_feature_array(feature_code, data_id)
  end
  
  def get_feature_on_position(cls, id, feature_code, data_id, position_id)
    get_class_object(cls, id).get_feature_on_position(feature_code, data_id, position_id)
  end
  
  def get_feature_repetitions(cls, id, feature_code, data_id, value = nil)
    get_class_object(cls, id).get_feature_repetitions(feature_code, data_id, value)
  end
  
  def remove_feature_on_position(cls, id, feature_code, data_id, position_id)
    get_class_object(cls, id).remove_feature_on_position(feature_code, data_id, position_id)
  end
  
  def remove_feature_once(cls, id, feature_code, data_id, value = nil)
    get_class_object(cls, id).remove_feature_once(feature_code, data_id, value)
  end
# ================>>>> JakeMSG Expansion

end
