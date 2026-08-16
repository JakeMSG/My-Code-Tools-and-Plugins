; ================ Variable Initialization
State := 0

; ==== Visual to confirm Toggle is Inactive (shown at start)
; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, b-inactive.png, %A_ScriptDir%\b-inactive.png, 0
; == Sets up the visual (the GUI with it), and shows it
fileInactive = %A_ScriptDir%\b-inactive.png ; Replace as needed
Gui, bSpeedHoldButtonSpamInactive:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, bSpeedHoldButtonSpamInactive:Add, Picture,, %fileInactive%
Gui, bSpeedHoldButtonSpamInactive:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui bSpeedHoldButtonSpamInactive:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, bSpeedHoldButtonSpamInactive:Show, NA w60 h60 x20 y20


~*^b::
; ================ The Main Function (Switch that triggers/stops Loop & Held Buttons)
; ======== Held Buttons
; ==== Starts to hold the "skip/fast" buttons (LControl works if you use MTool, otherwise it is ignored)
; == If you press the automatically-held buttons, you stop their automated Holding (until you press the Hotkey again to Turn Off, then to Turn On again)
SendInput {LShift down}
SendInput {LControl down}
SendInput {a down}

; ======== Switch instruction
If (State = 10)
{
State = 0
SetTimer SpamKey, Off
SendInput {LShift up}
SendInput {LControl up}
SendInput {a up}

; ==== Turning off the Active Visual / showing Inactive
; == Deletes the active visual (the GUI with it)
Gui, bSpeedHoldButtonSpam:Destroy

; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, b-inactive.png, %A_ScriptDir%\b-inactive.png, 0
; == Sets up the inactive visual (the GUI with it), and shows it
fileInactive = %A_ScriptDir%\b-inactive.png ; Replace as needed
Gui, bSpeedHoldButtonSpamInactive:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, bSpeedHoldButtonSpamInactive:Add, Picture,, %fileInactive%
Gui, bSpeedHoldButtonSpamInactive:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui bSpeedHoldButtonSpamInactive:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, bSpeedHoldButtonSpamInactive:Show, NA w60 h60 x20 y20

}
else
{
State = 10
SetTimer SpamKey, %State%

; ==== Turning off the Inactive Visual / showing Active
; == Deletes the inactive visual (the GUI with it)
Gui, bSpeedHoldButtonSpamInactive:Destroy

; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, b.png, %A_ScriptDir%\b.png, 0
; == Sets up the active visual (the GUI with it), and shows it
file = %A_ScriptDir%\b.png ; Replace as needed
Gui, bSpeedHoldButtonSpam:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, bSpeedHoldButtonSpam:Add, Picture,, %file%
Gui, bSpeedHoldButtonSpam:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui bSpeedHoldButtonSpam:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, bSpeedHoldButtonSpam:Show, NA w60 h60 x20 y20
}
Return

; ================ The Spam-Loop Sub-Function
SpamKey:
    SendInput {z down}
   	SendInput {z up}
Return
