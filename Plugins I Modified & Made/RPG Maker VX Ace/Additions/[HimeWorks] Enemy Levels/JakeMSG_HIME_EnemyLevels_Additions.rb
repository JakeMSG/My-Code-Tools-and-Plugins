=begin
#===============================================================================
# Title: JakeMSG HIME Enemy Levels Additions
# Author: JakeMSG
#-------------------------------------------------------------------------------
# ================ Description
#
# Extension script for:
#   HIME - Enemy Levels (required)
#   HIME - Enemy Classes (optional)
#
# ================ Features
#
# ======== Level 0 support per-enemy
#    Notetag:
#      <Level 0 Possible>
#
#    Effect:
#      - Enemy minimum level can be 0.
#      - If computed level goes below 0, it is clamped to 0.
#      - If no <min enemy level: ...> is set, default minimum becomes 0.
#
# ==== Enemy Classes + <add enemy params> behavior at level 0
#    Requires:
#      147 - HIME - Enemy Classes
#
#    Effect:
#      - If enemy has class assigned and uses <add enemy params>,
#        class parameter addition is skipped when enemy level == 0.
#      - Enemy base params remain unchanged in that case.
#
# ======== Custom enemy name suffix formula
#    Single-line notetag (String expression):
#      <Enemy Name Suffix: "FORMULA">
#      <Enemy Name Suffix: "FORMULA" + VALUE + "FORMULA">
#
#    Multi-line notetag:
#      <Enemy Name Suffix>
#        FORMULA
#      </Enemy Name Suffix>
#
#    FORMULA supports same variables as <enemy level: ...>:
#      e - current enemy (Game_Enemy)
#      p - game party
#      t - game troop
#      s - game switches
#      v - game variables
#
#    Notes:
#      - Single-line formula must start with a quoted String.
#      - In single-line formula, each + segment is converted to String.
#      - This allows numeric values (e.level, v[x], etc.) in + chains.
#      - Multi-line formula should return a String value at the end.
#      - Multi-line + chains also support automatic segment-to-String conversion.
#      - Use e.level to include current enemy level in suffix text.
#      - If this notetag exists, it replaces default level suffix display.
#
# Example suffix formulas:
#   <Enemy Name Suffix: "Lvl #{e.level}">
#   <Enemy Name Suffix: "Lv " + e.level + " - V" + v[12]>
#   <Enemy Name Suffix>
#     "Rank #{e.level} - Wave #{v[3]}"
#   </Enemy Name Suffix>
#   <Enemy Name Suffix>
#     "Lv " + e.level + " - V" + v[12]
#   </Enemy Name Suffix>
#
#-------------------------------------------------------------------------------
# ** Install
#
# Place below:
#   HIME - Enemy Levels
#   HIME - Enemy Classes (if used)
#===============================================================================
=end

$imported = {} if $imported.nil?
$imported["JakeMSG_HIME_EnemyLevels_Additions"] = true

if $imported["TH_EnemyLevels"]
  module TH
    module Enemy_Levels
      Level_Zero_Possible_Regex = /<level[-_ ]0[-_ ]possible>/i
      Name_Suffix_Regex = /<enemy[-_ ]name[-_ ]suffix:\s*(.*)\s*>/i
      Name_Suffix_Ext_Regex = /<enemy[-_ ]name[-_ ]suffix>(.*?)<\/enemy[-_ ]name[-_ ]suffix>/im
    end
  end

  module RPG
    class Enemy < BaseItem

      alias :jakemsg_enemy_levels_additions_load_notetag_enemy_levels :load_notetag_enemy_levels
      def load_notetag_enemy_levels
        jakemsg_enemy_levels_additions_load_notetag_enemy_levels
        @level_zero_possible = false
        @custom_name_suffix = false
        @name_suffix_formula = nil
        @name_suffix_is_multiline = false

        if self.note =~ TH::Enemy_Levels::Level_Zero_Possible_Regex
          @level_zero_possible = true
        end

        if self.note =~ TH::Enemy_Levels::Name_Suffix_Regex
          formula = $1.to_s.strip
          if valid_single_line_name_suffix_formula?(formula)
            @name_suffix_formula = formula
            @custom_name_suffix = true
            @name_suffix_is_multiline = false
          end
        end

        if self.note =~ TH::Enemy_Levels::Name_Suffix_Ext_Regex
          @name_suffix_formula = $1
          @custom_name_suffix = true
          @name_suffix_is_multiline = true
        end

        if @level_zero_possible && self.note !~ TH::Enemy_Levels::Min_Regex
          @min_level_formula = "0"
        end
      end

      alias :jakemsg_enemy_levels_additions_min_level :min_level
      def min_level(enemy)
        min = jakemsg_enemy_levels_additions_min_level(enemy)
        return [min, 0].max if level_zero_possible?
        min
      end

      def level_zero_possible?
        load_notetag_enemy_levels if @level_zero_possible.nil?
        @level_zero_possible
      end

      def custom_name_suffix?
        load_notetag_enemy_levels if @custom_name_suffix.nil?
        @custom_name_suffix
      end

      def name_suffix_formula
        load_notetag_enemy_levels if @custom_name_suffix.nil?
        @name_suffix_formula
      end

      def name_suffix_is_multiline?
        load_notetag_enemy_levels if @name_suffix_is_multiline.nil?
        @name_suffix_is_multiline
      end

      def eval_name_suffix_formula(e, p=$game_party, t=$game_troop, s=$game_switches, v=$game_variables)
        formula = name_suffix_formula
        return nil if formula.nil? || formula.strip.empty?
        if name_suffix_is_multiline?
          return eval_multiline_name_suffix_formula(formula, e, p, t, s, v)
        end
        eval_single_line_name_suffix_formula(formula, e, p, t, s, v)
      rescue StandardError
        nil
      end

      def valid_single_line_name_suffix_formula?(formula)
        stripped = formula.to_s.strip
        return false if stripped.empty?
        stripped.start_with?('"', "'")
      end

      def eval_single_line_name_suffix_formula(formula, e, p, t, s, v)
        eval_name_suffix_formula_with_auto_concat(formula, e, p, t, s, v)
      end

      def eval_multiline_name_suffix_formula(formula, e, p, t, s, v)
        eval(formula).to_s
      rescue TypeError
        # Ruby version can raise different TypeError messages for "String + Number".
        # Any TypeError here gets one retry using auto string-conversion concat.
        eval_name_suffix_formula_with_auto_concat(formula, e, p, t, s, v)
      end

      def eval_name_suffix_formula_with_auto_concat(formula, e, p, t, s, v)
        parts = split_name_suffix_formula_parts(formula)
        return eval(formula).to_s if parts.empty?
        parts.inject("") { |result, part| result + eval(part).to_s }
      end

      def split_name_suffix_formula_parts(formula)
        parts = []
        current = ""
        quote = nil
        escaped = false
        depth_parentheses = 0
        depth_brackets = 0
        depth_braces = 0

        formula.each_char do |char|
          if quote
            current << char
            if escaped
              escaped = false
            elsif char == "\\"
              escaped = true
            elsif char == quote
              quote = nil
            end
            next
          end

          case char
          when "'", '"'
            quote = char
            current << char
          when "("
            depth_parentheses += 1
            current << char
          when ")"
            depth_parentheses -= 1 if depth_parentheses > 0
            current << char
          when "["
            depth_brackets += 1
            current << char
          when "]"
            depth_brackets -= 1 if depth_brackets > 0
            current << char
          when "{"
            depth_braces += 1
            current << char
          when "}"
            depth_braces -= 1 if depth_braces > 0
            current << char
          when "+"
            if depth_parentheses == 0 && depth_brackets == 0 && depth_braces == 0
              token = current.strip
              return [] if token.empty?
              parts << token
              current = ""
            else
              current << char
            end
          else
            current << char
          end
        end

        token = current.strip
        return [] if token.empty?
        parts << token
        parts
      end
    end
  end

  class Game_Enemy < Game_Battler

    alias :jakemsg_enemy_levels_additions_name :name
    def name
      return jakemsg_enemy_levels_additions_name unless enemy.custom_name_suffix?
      base_name = respond_to?(:th_enemy_levels_name) ? th_enemy_levels_name : jakemsg_enemy_levels_additions_name
      suffix = enemy.eval_name_suffix_formula(self)
      suffix = suffix.nil? ? "" : suffix.to_s.strip
      return base_name if suffix.empty?
      sprintf("%s %s", base_name, suffix)
    end
  end

  if $imported["TH_EnemyClass"]
    class Game_Enemy < Game_Battler

      alias :jakemsg_enemy_levels_additions_param_base :param_base
      def param_base(param_id)
        if self.class && enemy.add_base_params? && self.level == 0
          return th_enemy_class_param_base(param_id)
        end
        jakemsg_enemy_levels_additions_param_base(param_id)
      end
    end
  end
end
