; ================ Variable Initialization
State := 0

; ==== Visual to confirm Toggle is Inactive (shown at start)
; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, n-inactive.png, %A_ScriptDir%\n-inactive.png, 0
; == Sets up the visual (the GUI with it), and shows it
fileInactive = %A_ScriptDir%\n-inactive.png ; Replace as needed
Gui, nSpeedHoldInactive:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, nSpeedHoldInactive:Add, Picture,, %fileInactive%
Gui, nSpeedHoldInactive:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui nSpeedHoldInactive:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, nSpeedHoldInactive:Show, NA w60 h60 x20 y40


~*^n::
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
Gui, nSpeedHold:Destroy

; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, n-inactive.png, %A_ScriptDir%\n-inactive.png, 0
; == Sets up the inactive visual (the GUI with it), and shows it
fileInactive = %A_ScriptDir%\n-inactive.png ; Replace as needed
Gui, nSpeedHoldInactive:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, nSpeedHoldInactive:Add, Picture,, %fileInactive%
Gui, nSpeedHoldInactive:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui nSpeedHoldInactive:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, nSpeedHoldInactive:Show, NA w60 h60 x20 y40

}
else
{
State = 10

; SetTimer SpamKey, %State%

; ==== Turning off the Inactive Visual / showing Active
; == Deletes the inactive visual (the GUI with it)
Gui, nSpeedHoldInactive:Destroy

; == "Installs" (temporarily) the png from the .exe (this is for the Compiled version)
FileInstall, n.png, %A_ScriptDir%\n.png, 0
; == Sets up the active visual (the GUI with it), and shows it
file = %A_ScriptDir%\n.png ; Replace as needed
Gui, nSpeedHold:New,+AlwaysOnTop -SysMenu +ToolWindow -Caption
Gui, nSpeedHold:Add, Picture,, %file%
Gui, nSpeedHold:Color, EEAA99 ; Sets the Color that will be made Transparent
Gui nSpeedHold:+LastFound  ; Make the GUI window the last found window for use by the line below.
WinSet, TransColor, EEAA99 ; Makes the set color to be Transparent
Gui, nSpeedHold:Show, NA w60 h60 x20 y40
}
Return

; ================ The Spam-Loop Sub-Function
SpamKey:
    SendInput {z down}
   	SendInput {z up}
Return
