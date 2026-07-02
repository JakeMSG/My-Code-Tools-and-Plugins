//=============================================================================
// JakeMSG_StringSavedReplacements_HugeNumbers
// JakeMSG_StringSavedReplacements_HugeNumbers.js
//=============================================================================

var Imported = Imported || {};
Imported.JakeMSG_StringSavedReplacements_HugeNumbers = true;

var JakeMSG = JakeMSG || {};
JakeMSG.StringSavedReplacements_HugeNumbers = JakeMSG.StringSavedReplacements_HugeNumbers || {};

//=============================================================================
/*:
 * @plugindesc v1.0 Module: shorten huge numbers in on-screen window text.
 * @author JakeMSG
 * @requires JakeMSG_StringSavedReplacements
 * @requires JakeMSG_HugeFunctionalValues
 * v1.0
 *
============ Change Log ============
1.0 - 7.1st.2026
 * initial release
====================================
 *
 * @help
 * ============================================================================
 * Overview
 * ============================================================================
 *
 * Module plugin for JakeMSG_StringSavedReplacements. It registers a text
 * processor that finds numeric values in processed window text and optionally
 * replaces them with shorter abbreviated formats (for example 24.45 Bil.).
 *
 * Requires JakeMSG_StringSavedReplacements (place this plugin below it) and
 * JakeMSG_HugeFunctionalValues for gameplay support of very large numbers.
 *
 * Numbers are sequences of 0-9 and . optionally followed by e+ and more digits.
 * Pre-grouped values such as 24,453,419,435 (comma every 3 whole digits) are also
 * detected as one number. They are bounded by separators such as space,
 * semicolon, &, |, +, -, *, /, %, ^, or = (commas between 3-digit groups are
 * treated as part of the number, not as boundaries).
 *
 * Processing runs after escape-code conversion and after dictionary string
 * replacements from the parent plugin.
 *
 * ============================================================================
 * General Settings
 * ============================================================================
 *
 * Number of digits separated
 *   When Separator Character is set, inserts that character every N digits of
 *   the whole-number portion, counting from right to left.
 *
 * Separator Character
 *   Optional grouping character (comma or space are common choices). When
 *   empty, digit grouping is disabled.
 *
 * Decimal points on Huge number formats
 *   How many decimal digits appear in abbreviated huge-number output.
 *
 * ============================================================================
 * Huge Number Formats
 * ============================================================================
 *
 * One hundred and three brackets from 1.000 (1000^1) through 1000^103 are
 * available. Enable a bracket to abbreviate values that reach at least that
 * threshold. The highest enabled bracket reached by the value is used.
 *
 * Each bracket has a Word replacement string appended after the shortened
 * numeric value (for example k, Mil., Bil.).
 *
 * Example: Bracket - 1.000.000.000 enabled with Word replacement Bil. and
 * 2 decimal places formats 24453419435 as 24.45 Bil.
 *
 * Bracket 103 (Duocenti.) is the top bracket. With it enabled,
 * 1.7976931348623157e+308 (JavaScript Number.MAX_VALUE) shortens to about
 * 1.80 Duocenti. (Bracket 102 alone would show about 179.77 Uncenti.)
 *
 * ============================================================================
 * Param Declarations
 * ============================================================================
 * @param --- General Settings ---
 * @default
 *
 * @param Number of digits separated
 * @parent --- General Settings ---
 * @type number
 * @min 1
 * @default 3
 * @desc Digit-group size for the whole-number portion (right to left).
 *
 * @param Separator Character
 * @parent --- General Settings ---
 * @default
 * @desc If set, inserts this character every N digits of each number's whole part. Try , or (space).
 *
 * @param Decimal points on Huge number formats
 * @parent --- General Settings ---
 * @type number
 * @min 0
 * @default 2
 * @desc Decimal digits shown in abbreviated huge-number formats.
 *
 * @param --- Huge Number Formats ---
 * @default
 *
 * @param == 10^0 - 10^33 (1000^11) ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket01
 * @text - 1.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket01_WR
 * @text Word replacement
 * @parent Bracket01
 * @default k
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket02
 * @text - 1.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket02_WR
 * @text Word replacement
 * @parent Bracket02
 * @default Mil.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket03
 * @text - 1.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket03_WR
 * @text Word replacement
 * @parent Bracket03
 * @default Bil.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket04
 * @text - 1.000.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket04_WR
 * @text Word replacement
 * @parent Bracket04
 * @default Tril.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket05
 * @text - 1.000.000.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket05_WR
 * @text Word replacement
 * @parent Bracket05
 * @default Quad.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket06
 * @text - 1.000.000.000.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket06_WR
 * @text Word replacement
 * @parent Bracket06
 * @default Quin.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket07
 * @text - 1.000.000.000.000.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket07_WR
 * @text Word replacement
 * @parent Bracket07
 * @default Sext.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket08
 * @text - 1.000.000.000.000.000.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket08_WR
 * @text Word replacement
 * @parent Bracket08
 * @default Sept.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket09
 * @text - 1.000.000.000.000.000.000.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket09_WR
 * @text Word replacement
 * @parent Bracket09
 * @default Octi.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket10
 * @text - 1.000.000.000.000.000.000.000.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket10_WR
 * @text Word replacement
 * @parent Bracket10
 * @default Noni.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket11
 * @text - 1.000.000.000.000.000.000.000.000.000.000.000
 * @parent == 10^0 - 10^33 (1000^11) ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket11_WR
 * @text Word replacement
 * @parent Bracket11
 * @default Deci.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^12 - 1000^20 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket12
 * @text - 1000^12
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket12_WR
 * @text Word replacement
 * @parent Bracket12
 * @default Undeci.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket13
 * @text - 1000^13
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket13_WR
 * @text Word replacement
 * @parent Bracket13
 * @default Duodeci.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket14
 * @text - 1000^14
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket14_WR
 * @text Word replacement
 * @parent Bracket14
 * @default Tredeci.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket15
 * @text - 1000^15
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket15_WR
 * @text Word replacement
 * @parent Bracket15
 * @default Quattuordeci.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket16
 * @text - 1000^16
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket16_WR
 * @text Word replacement
 * @parent Bracket16
 * @default Quindeci.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket17
 * @text - 1000^17
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket17_WR
 * @text Word replacement
 * @parent Bracket17
 * @default Sexdeci.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket18
 * @text - 1000^18
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket18_WR
 * @text Word replacement
 * @parent Bracket18
 * @default Septendeci.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket19
 * @text - 1000^19
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket19_WR
 * @text Word replacement
 * @parent Bracket19
 * @default Octodeci.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket20
 * @text - 1000^20
 * @parent == 1000^12 - 1000^20 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket20_WR
 * @text Word replacement
 * @parent Bracket20
 * @default Novemdeci.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^21 - 1000^30 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket21
 * @text - 1000^21
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket21_WR
 * @text Word replacement
 * @parent Bracket21
 * @default Viginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket22
 * @text - 1000^22
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket22_WR
 * @text Word replacement
 * @parent Bracket22
 * @default Unviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket23
 * @text - 1000^23
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket23_WR
 * @text Word replacement
 * @parent Bracket23
 * @default Duoviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket24
 * @text - 1000^24
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket24_WR
 * @text Word replacement
 * @parent Bracket24
 * @default Treviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket25
 * @text - 1000^25
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket25_WR
 * @text Word replacement
 * @parent Bracket25
 * @default Quattuorviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket26
 * @text - 1000^26
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket26_WR
 * @text Word replacement
 * @parent Bracket26
 * @default Quinviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket27
 * @text - 1000^27
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket27_WR
 * @text Word replacement
 * @parent Bracket27
 * @default Sexviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket28
 * @text - 1000^28
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket28_WR
 * @text Word replacement
 * @parent Bracket28
 * @default Septenviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket29
 * @text - 1000^29
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket29_WR
 * @text Word replacement
 * @parent Bracket29
 * @default Octoviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket30
 * @text - 1000^30
 * @parent == 1000^21 - 1000^30 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket30_WR
 * @text Word replacement
 * @parent Bracket30
 * @default Novemviginti.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^31 - 1000^40 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket31
 * @text - 1000^31
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket31_WR
 * @text Word replacement
 * @parent Bracket31
 * @default Triginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket32
 * @text - 1000^32
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket32_WR
 * @text Word replacement
 * @parent Bracket32
 * @default Untriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket33
 * @text - 1000^33
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket33_WR
 * @text Word replacement
 * @parent Bracket33
 * @default Duotriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket34
 * @text - 1000^34
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket34_WR
 * @text Word replacement
 * @parent Bracket34
 * @default Tretriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket35
 * @text - 1000^35
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket35_WR
 * @text Word replacement
 * @parent Bracket35
 * @default Quattuortriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket36
 * @text - 1000^36
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket36_WR
 * @text Word replacement
 * @parent Bracket36
 * @default Quintriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket37
 * @text - 1000^37
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket37_WR
 * @text Word replacement
 * @parent Bracket37
 * @default Sextriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket38
 * @text - 1000^38
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket38_WR
 * @text Word replacement
 * @parent Bracket38
 * @default Septentriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket39
 * @text - 1000^39
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket39_WR
 * @text Word replacement
 * @parent Bracket39
 * @default Octotriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket40
 * @text - 1000^40
 * @parent == 1000^31 - 1000^40 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket40_WR
 * @text Word replacement
 * @parent Bracket40
 * @default Novemtriginti.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^41 - 1000^50 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket41
 * @text - 1000^41
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket41_WR
 * @text Word replacement
 * @parent Bracket41
 * @default Quadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket42
 * @text - 1000^42
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket42_WR
 * @text Word replacement
 * @parent Bracket42
 * @default Unquadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket43
 * @text - 1000^43
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket43_WR
 * @text Word replacement
 * @parent Bracket43
 * @default Duoquadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket44
 * @text - 1000^44
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket44_WR
 * @text Word replacement
 * @parent Bracket44
 * @default Trequadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket45
 * @text - 1000^45
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket45_WR
 * @text Word replacement
 * @parent Bracket45
 * @default Quattuorquadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket46
 * @text - 1000^46
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket46_WR
 * @text Word replacement
 * @parent Bracket46
 * @default Quinquadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket47
 * @text - 1000^47
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket47_WR
 * @text Word replacement
 * @parent Bracket47
 * @default Sexquadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket48
 * @text - 1000^48
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket48_WR
 * @text Word replacement
 * @parent Bracket48
 * @default Septenquadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket49
 * @text - 1000^49
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket49_WR
 * @text Word replacement
 * @parent Bracket49
 * @default Octoquadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket50
 * @text - 1000^50
 * @parent == 1000^41 - 1000^50 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket50_WR
 * @text Word replacement
 * @parent Bracket50
 * @default Novemquadraginti.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^51 - 1000^60 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket51
 * @text - 1000^51
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket51_WR
 * @text Word replacement
 * @parent Bracket51
 * @default Quinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket52
 * @text - 1000^52
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket52_WR
 * @text Word replacement
 * @parent Bracket52
 * @default Unquinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket53
 * @text - 1000^53
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket53_WR
 * @text Word replacement
 * @parent Bracket53
 * @default Duoquinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket54
 * @text - 1000^54
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket54_WR
 * @text Word replacement
 * @parent Bracket54
 * @default Trequinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket55
 * @text - 1000^55
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket55_WR
 * @text Word replacement
 * @parent Bracket55
 * @default Quattuorquinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket56
 * @text - 1000^56
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket56_WR
 * @text Word replacement
 * @parent Bracket56
 * @default Quinquinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket57
 * @text - 1000^57
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket57_WR
 * @text Word replacement
 * @parent Bracket57
 * @default Sexquinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket58
 * @text - 1000^58
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket58_WR
 * @text Word replacement
 * @parent Bracket58
 * @default Septenquinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket59
 * @text - 1000^59
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket59_WR
 * @text Word replacement
 * @parent Bracket59
 * @default Octoquinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket60
 * @text - 1000^60
 * @parent == 1000^51 - 1000^60 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket60_WR
 * @text Word replacement
 * @parent Bracket60
 * @default Novemquinquaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^61 - 1000^70 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket61
 * @text - 1000^61
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket61_WR
 * @text Word replacement
 * @parent Bracket61
 * @default Sexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket62
 * @text - 1000^62
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket62_WR
 * @text Word replacement
 * @parent Bracket62
 * @default Unsexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket63
 * @text - 1000^63
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket63_WR
 * @text Word replacement
 * @parent Bracket63
 * @default Duosexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket64
 * @text - 1000^64
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket64_WR
 * @text Word replacement
 * @parent Bracket64
 * @default Tresexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket65
 * @text - 1000^65
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket65_WR
 * @text Word replacement
 * @parent Bracket65
 * @default Quattuorsexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket66
 * @text - 1000^66
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket66_WR
 * @text Word replacement
 * @parent Bracket66
 * @default Quinsexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket67
 * @text - 1000^67
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket67_WR
 * @text Word replacement
 * @parent Bracket67
 * @default Sexsexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket68
 * @text - 1000^68
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket68_WR
 * @text Word replacement
 * @parent Bracket68
 * @default Septensexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket69
 * @text - 1000^69
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket69_WR
 * @text Word replacement
 * @parent Bracket69
 * @default Octosexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket70
 * @text - 1000^70
 * @parent == 1000^61 - 1000^70 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket70_WR
 * @text Word replacement
 * @parent Bracket70
 * @default Novemsexaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^71 - 1000^80 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket71
 * @text - 1000^71
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket71_WR
 * @text Word replacement
 * @parent Bracket71
 * @default Septuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket72
 * @text - 1000^72
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket72_WR
 * @text Word replacement
 * @parent Bracket72
 * @default Unseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket73
 * @text - 1000^73
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket73_WR
 * @text Word replacement
 * @parent Bracket73
 * @default Duoseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket74
 * @text - 1000^74
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket74_WR
 * @text Word replacement
 * @parent Bracket74
 * @default Treseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket75
 * @text - 1000^75
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket75_WR
 * @text Word replacement
 * @parent Bracket75
 * @default Quattuorseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket76
 * @text - 1000^76
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket76_WR
 * @text Word replacement
 * @parent Bracket76
 * @default Quinseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket77
 * @text - 1000^77
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket77_WR
 * @text Word replacement
 * @parent Bracket77
 * @default Sexseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket78
 * @text - 1000^78
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket78_WR
 * @text Word replacement
 * @parent Bracket78
 * @default Septenseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket79
 * @text - 1000^79
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket79_WR
 * @text Word replacement
 * @parent Bracket79
 * @default Octoseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket80
 * @text - 1000^80
 * @parent == 1000^71 - 1000^80 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket80_WR
 * @text Word replacement
 * @parent Bracket80
 * @default Novemseptuaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^81 - 1000^90 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket81
 * @text - 1000^81
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket81_WR
 * @text Word replacement
 * @parent Bracket81
 * @default Octoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket82
 * @text - 1000^82
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket82_WR
 * @text Word replacement
 * @parent Bracket82
 * @default Unoctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket83
 * @text - 1000^83
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket83_WR
 * @text Word replacement
 * @parent Bracket83
 * @default Duooctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket84
 * @text - 1000^84
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket84_WR
 * @text Word replacement
 * @parent Bracket84
 * @default Treoctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket85
 * @text - 1000^85
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket85_WR
 * @text Word replacement
 * @parent Bracket85
 * @default Quattuoroctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket86
 * @text - 1000^86
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket86_WR
 * @text Word replacement
 * @parent Bracket86
 * @default Quinoctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket87
 * @text - 1000^87
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket87_WR
 * @text Word replacement
 * @parent Bracket87
 * @default Sexoctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket88
 * @text - 1000^88
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket88_WR
 * @text Word replacement
 * @parent Bracket88
 * @default Septenoctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket89
 * @text - 1000^89
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket89_WR
 * @text Word replacement
 * @parent Bracket89
 * @default Octooctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket90
 * @text - 1000^90
 * @parent == 1000^81 - 1000^90 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket90_WR
 * @text Word replacement
 * @parent Bracket90
 * @default Novemoctoginti.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^91 - 1000^100 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket91
 * @text - 1000^91
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket91_WR
 * @text Word replacement
 * @parent Bracket91
 * @default Nonaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket92
 * @text - 1000^92
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket92_WR
 * @text Word replacement
 * @parent Bracket92
 * @default Unnonaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket93
 * @text - 1000^93
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket93_WR
 * @text Word replacement
 * @parent Bracket93
 * @default Duononaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket94
 * @text - 1000^94
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket94_WR
 * @text Word replacement
 * @parent Bracket94
 * @default Trenonaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket95
 * @text - 1000^95
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket95_WR
 * @text Word replacement
 * @parent Bracket95
 * @default Quattuornonaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket96
 * @text - 1000^96
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket96_WR
 * @text Word replacement
 * @parent Bracket96
 * @default Quinnonaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket97
 * @text - 1000^97
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket97_WR
 * @text Word replacement
 * @parent Bracket97
 * @default Sexnonaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket98
 * @text - 1000^98
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket98_WR
 * @text Word replacement
 * @parent Bracket98
 * @default Septennonaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket99
 * @text - 1000^99
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket99_WR
 * @text Word replacement
 * @parent Bracket99
 * @default Octononaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket100
 * @text - 1000^100
 * @parent == 1000^91 - 1000^100 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket100_WR
 * @text Word replacement
 * @parent Bracket100
 * @default Novemnonaginti.
 * @desc Text appended after the shortened number value.
 *
 * @param == 1000^101 - 1000^103 ==
 * @parent --- Huge Number Formats ---
 * @default
 *
 * @param Bracket101
 * @text - 1000^101
 * @parent == 1000^101 - 1000^103 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket101_WR
 * @text Word replacement
 * @parent Bracket101
 * @default Centi.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket102
 * @text - 1000^102
 * @parent == 1000^101 - 1000^103 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket102_WR
 * @text Word replacement
 * @parent Bracket102
 * @default Uncenti.
 * @desc Text appended after the shortened number value.
 *
 * @param Bracket103
 * @text - 1000^103
 * @parent == 1000^101 - 1000^103 ==
 * @type boolean
 * @default false
 * @desc Enable huge-number formatting at this bracket.
 *
 * @param Bracket103_WR
 * @text Word replacement
 * @parent Bracket103
 * @default Duocenti.
 * @desc Text appended after the shortened number value.
 *
 */
//=============================================================================

(function($) {
'use strict';

if (!Imported.JakeMSG_StringSavedReplacements) {
    throw new Error('JakeMSG_StringSavedReplacements_HugeNumbers requires JakeMSG_StringSavedReplacements.');
}
if (!Imported.JakeMSG_HugeFunctionalValues) {
    throw new Error('JakeMSG_StringSavedReplacements_HugeNumbers requires JakeMSG_HugeFunctionalValues.');
}

var SSR = JakeMSG.StringSavedReplacements;

$.version = 1.0;
$.pluginName = 'JakeMSG_StringSavedReplacements_HugeNumbers';
$.paramsRaw = PluginManager.parameters($.pluginName);

$.NUMBER_CHARS = '0123456789.';
$.SEPARATOR_CHARS = ' ,;&|+-*/%^=';

//=============================================================================
// Settings
//=============================================================================

$.digitsSeparated = Math.max(1, Number($.paramsRaw['Number of digits separated'] || 3) || 3);
$.separatorCharacter = String($.paramsRaw['Separator Character'] || '');
if ($.separatorCharacter === 'undefined') {
    $.separatorCharacter = '';
}
$.decimalPoints = Math.max(0, Number($.paramsRaw['Decimal points on Huge number formats'] || 2) || 0);

$.brackets = [];
for (var bi = 1; bi <= 103; bi++) {
    var bKey = bi < 10 ? ('Bracket0' + bi) : ('Bracket' + bi);
    var wrKey = bKey + '_WR';
    var enabled = String($.paramsRaw[bKey] || 'false').toLowerCase() === 'true';
    var word = $.paramsRaw[wrKey];
    if (word === undefined || word === null || word === 'undefined') {
        word = '';
    }
    $.brackets.push({
        index: bi,
        enabled: enabled,
        word: String(word)
    });
}

//=============================================================================
// Number parsing
//=============================================================================

$.isNumberChar = function(ch) {
    return $.NUMBER_CHARS.indexOf(ch) >= 0;
};

$.isSeparatorChar = function(ch) {
    return $.SEPARATOR_CHARS.indexOf(ch) >= 0;
};

$.isDigitGroupingChar = function(ch) {
    if (ch === ',') {
        return true;
    }
    return !!($.separatorCharacter && ch === $.separatorCharacter);
};

$.isValidDigitGroupingAt = function(text, index) {
    var groupSize = $.digitsSeparated;
    var j = index + 1;
    if (j + groupSize - 1 >= text.length) {
        return false;
    }
    for (var k = 0; k < groupSize; k++) {
        var c = text.charAt(j + k);
        if (c < '0' || c > '9') {
            return false;
        }
    }
    return true;
};

$.parseScientificSuffix = function(raw) {
    var match = String(raw).toLowerCase().match(/e([+-]?\d+)$/);
    if (!match) {
        return null;
    }
    return {
        mantissa: raw.slice(0, raw.length - match[0].length),
        suffix: raw.slice(raw.length - match[0].length),
        sciExp: parseInt(match[1], 10) || 0
    };
};

$.stripDigitGrouping = function(numStr) {
    var str = String(numStr);
    var sci = $.parseScientificSuffix(str);
    var mantissa = sci ? sci.mantissa : str;
    var suffix = sci ? sci.suffix : '';
    var dot = mantissa.indexOf('.');
    var whole = dot >= 0 ? mantissa.slice(0, dot) : mantissa;
    var frac = dot >= 0 ? mantissa.slice(dot) : '';
    whole = whole.replace(/,/g, '');
    if ($.separatorCharacter && $.separatorCharacter !== ',') {
        whole = whole.split($.separatorCharacter).join('');
    }
    return whole + frac + suffix;
};

$.readNumberToken = function(text, start) {
    var i = start;
    if (i >= text.length || !$.isNumberChar(text[i])) {
        return null;
    }
    var inSciExp = false;
    while (i < text.length) {
        var ch = text[i];
        if ((ch === 'e' || ch === 'E') && !inSciExp) {
            inSciExp = true;
            i++;
            if (i < text.length && (text[i] === '+' || text[i] === '-')) {
                i++;
            }
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            i++;
            continue;
        }
        if (ch === '.' && !inSciExp) {
            i++;
            continue;
        }
        if (!inSciExp && $.isDigitGroupingChar(ch) && $.isValidDigitGroupingAt(text, i)) {
            i++;
            continue;
        }
        break;
    }
    var token = text.slice(start, i);
    if (!token || !/[0-9]/.test(token)) {
        return null;
    }
    return { token: token, end: i };
};

$.refineTotalExp = function(raw, candidateExp) {
    var n = parseFloat($.stripDigitGrouping(String(raw)));
    if (isFinite(n) && n > 0) {
        return Math.floor(Math.log(n) / Math.LN10);
    }
    return candidateExp;
};

$.normalizeNumberInfo = function(numStr) {
    var raw = $.stripDigitGrouping(String(numStr));
    var sci = $.parseScientificSuffix(raw);
    var mantissa = raw;
    var sciExp = 0;
    if (sci) {
        mantissa = sci.mantissa;
        sciExp = sci.sciExp;
    }
    var dot = mantissa.indexOf('.');
    var left = '';
    var right = '';
    if (dot >= 0) {
        left = mantissa.slice(0, dot);
        right = mantissa.slice(dot + 1);
    } else {
        left = mantissa;
    }
    left = left.replace(/^0+/, '');
    if (!left) {
        if (!right || /^0*$/.test(right)) {
            return { digits: '0', totalExp: 0, isZero: true };
        }
        var leading = right.match(/^0*/)[0].length;
        var mantissaExp = -(leading + 1);
        var digits = right.slice(leading).replace(/0+$/, '') || '0';
        return {
            digits: digits,
            totalExp: mantissaExp + sciExp,
            isZero: digits === '0'
        };
    }
    right = right.replace(/0+$/, '');
    var digits = left + right;
    if (!digits) {
        digits = '0';
    }
    var mantissaExp = left.length - 1;
    var totalExp = mantissaExp + sciExp;
    return {
        digits: digits,
        totalExp: $.refineTotalExp(raw, totalExp),
        isZero: digits === '0'
    };
};

$.bracketThresholdExp = function(bracket) {
    var threshold = bracket.index * 3;
    // Centillion-range brackets (100+) include MAX_VALUE at bracket 103.
    if (bracket.index >= 100) {
        threshold -= 1;
    }
    return threshold;
};

$.findHighestBracket = function(info) {
    if (info.isZero) {
        return null;
    }
    for (var i = $.brackets.length - 1; i >= 0; i--) {
        var bracket = $.brackets[i];
        if (!bracket.enabled) {
            continue;
        }
        if (info.totalExp >= $.bracketThresholdExp(bracket)) {
            return bracket;
        }
    }
    return null;
};

//=============================================================================
// Formatting
//=============================================================================

$.insertDigitSeparators = function(whole) {
    if (!$.separatorCharacter || $.digitsSeparated <= 0 || !whole) {
        return whole;
    }
    var negative = whole.charAt(0) === '-';
    var body = negative ? whole.slice(1) : whole;
    var out = '';
    var count = 0;
    for (var j = body.length - 1; j >= 0; j--) {
        if (count > 0 && count % $.digitsSeparated === 0) {
            out = $.separatorCharacter + out;
        }
        out = body.charAt(j) + out;
        count++;
    }
    return negative ? '-' + out : out;
};

$.roundDecimalDigits = function(whole, remainder, decimalPoints) {
    if (decimalPoints <= 0) {
        if (remainder && remainder.charAt(0) >= '5') {
            whole = String(Number(whole) + 1);
        }
        return { whole: whole, dec: '' };
    }
    var slice = (remainder + '0000000000').slice(0, decimalPoints + 1);
    var dec = slice.slice(0, decimalPoints);
    var next = slice.charAt(decimalPoints);
    if (next >= '5') {
        var inc = (Number(dec) + 1).toString();
        if (inc.length > decimalPoints) {
            whole = String(Number(whole) + 1);
            dec = '0'.repeat(decimalPoints);
        } else {
            dec = inc.padStart(decimalPoints, '0');
        }
    }
    return { whole: whole, dec: dec };
};

$.formatAbbreviated = function(info, bracket) {
    var shift = bracket.index * 3;
    var sig = info.digits;
    var sigLen = sig.length;
    // Full integer magnitude: (totalExp + 1) digits total. "sig" holds the
    // significant digits; any positions beyond sigLen are implied trailing
    // zeros. This is essential for E-notation values (e.g. 1.79...e+301),
    // where sig has few digits but the real magnitude is much larger.
    var wholeDigitCount = info.totalExp + 1;
    // Returns the digit at position i (0 = most significant) of the full
    // integer, treating out-of-range positions as '0'.
    var digitAt = function(i) {
        if (i >= 0 && i < sigLen) {
            return sig.charAt(i);
        }
        return '0';
    };
    var wholeLen = wholeDigitCount - shift;
    if (wholeLen < 1) {
        wholeLen = 1;
    }
    var whole = '';
    var i;
    for (i = 0; i < wholeLen; i++) {
        whole += digitAt(i);
    }
    var remainder = '';
    var remainderLen = $.decimalPoints + 1;
    for (i = 0; i < remainderLen; i++) {
        remainder += digitAt(wholeLen + i);
    }
    if (!whole) {
        whole = '0';
    }
    var rounded = $.roundDecimalDigits(whole, remainder, $.decimalPoints);
    whole = $.insertDigitSeparators(rounded.whole);
    var out = rounded.dec ? whole + '.' + rounded.dec : whole;
    if (bracket.word) {
        out += ' ' + bracket.word;
    }
    return out;
};

$.formatPlainNumber = function(numStr) {
    var stripped = $.stripDigitGrouping(numStr);
    if (!$.separatorCharacter) {
        return stripped;
    }
    if ($.parseScientificSuffix(stripped)) {
        return stripped;
    }
    var dot = stripped.indexOf('.');
    if (dot < 0) {
        return $.insertDigitSeparators(stripped);
    }
    return $.insertDigitSeparators(stripped.slice(0, dot)) + stripped.slice(dot);
};

$.formatNumberToken = function(numStr) {
    var info = $.normalizeNumberInfo(numStr);
    var bracket = $.findHighestBracket(info);
    if (bracket) {
        return $.formatAbbreviated(info, bracket);
    }
    return $.formatPlainNumber(numStr);
};

$.formatNumbersInText = function(text) {
    if (!text) {
        return text;
    }
    var result = '';
    var i = 0;
    while (i < text.length) {
        var ch = text.charAt(i);
        if ($.isNumberChar(ch) && (i === 0 || $.isSeparatorChar(text.charAt(i - 1)))) {
            var read = $.readNumberToken(text, i);
            if (read) {
                result += $.formatNumberToken(read.token);
                i = read.end;
                continue;
            }
        }
        result += ch;
        i++;
    }
    return result;
};

SSR.registerTextProcessor($.formatNumbersInText);

//=============================================================================
// End of File
//=============================================================================

})(JakeMSG.StringSavedReplacements_HugeNumbers);
