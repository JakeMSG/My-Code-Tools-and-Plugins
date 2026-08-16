; ================ Variable Initialization
State := 0

; ==== Visual to confirm Toggle is Inactive (shown at start)
; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, a-inactive.png, %A_ScriptDir%\a-inactive.png, 0
; == Sets up the visual (the GUI with it), and shows it
fileInactive = %A_ScriptDir%\a-inactive.png ; Replace as needed
Gui, bSpeedHoldButtonSpamInactive:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, bSpeedHoldButtonSpamInactive:Add, Picture,, %fileInactive%
Gui, bSpeedHoldButtonSpamInactive:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui bSpeedHoldButtonSpamInactive:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, bSpeedHoldButtonSpamInactive:Show, NA w60 h60 x20 y60


~*^a::
; ================ The Main Function (Switch that triggers/stops Loop & Held Buttons)

; ======== Switch instruction
If (State = 10)
{
State = 0
SetTimer SpamKey, Off

; ==== Turning off the Active Visual / showing Inactive
; == Deletes the active visual (the GUI with it)
Gui, bSpeedHoldButtonSpam:Destroy

; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, a-inactive.png, %A_ScriptDir%\a-inactive.png, 0
; == Sets up the inactive visual (the GUI with it), and shows it
fileInactive = %A_ScriptDir%\a-inactive.png ; Replace as needed
Gui, bSpeedHoldButtonSpamInactive:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, bSpeedHoldButtonSpamInactive:Add, Picture,, %fileInactive%
Gui, bSpeedHoldButtonSpamInactive:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui bSpeedHoldButtonSpamInactive:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, bSpeedHoldButtonSpamInactive:Show, NA w60 h60 x20 y60

}
else
{
State = 10
SetTimer SpamKey, %State%

; ==== Turning off the Inactive Visual / showing Active
; == Deletes the inactive visual (the GUI with it)
Gui, bSpeedHoldButtonSpamInactive:Destroy

; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, a.png, %A_ScriptDir%\a.png, 0
; == Sets up the active visual (the GUI with it), and shows it
file = %A_ScriptDir%\a.png ; Replace as needed
Gui, bSpeedHoldButtonSpam:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, bSpeedHoldButtonSpam:Add, Picture,, %file%
Gui, bSpeedHoldButtonSpam:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui bSpeedHoldButtonSpam:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, bSpeedHoldButtonSpam:Show, NA w60 h60 x20 y60
}
Return

; ================ The Spam-Loop Sub-Function
SpamKey:
    SendInput {z down}
   	SendInput {z up}
Return
