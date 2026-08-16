; ================ Initial Steps (Opens the required Program(s)
; ==== Opening HyperX NGENUITY (at its page for Keyboard Profiles)
If !(WinExist("HyperX NGENUITY")) ; Won't try to open if Program is already active
{
  Run "explorer.exe `"shell:appsFolder\33C30B79.HyperXNGenuity_0a78dr3hq0pvt!App`" "  ; Opens HyperX NGENUITY (Windows App method through CMD)
  Sleep 2000
}
else
{
  WinActivate "HyperX NGENUITY"
}
  WinMove ,,1540, 1000, "HyperX NGENUITY" ; Resize the window to defined size (for the Hotkey)
  Sleep 1000
  WinActivate "HyperX NGENUITY"
  ;
  Click 120, 193 ;
  Sleep 2000
  WinActivate "HyperX NGENUITY"
  WinMove -1129, 454, ,, "HyperX NGENUITY" ; Moves the window of the program to the side
  Sleep 1000
  WinActivate "HyperX NGENUITY"
  Click 1493, 76 ;
  Sleep 1000
  WinMinimize "HyperX NGENUITY"


; ================ The Hotkey(s)
;==== Switch to "Base Settings"
; CTRL + Numpad 4
^Numpad4::
{
	If WinExist("HyperX NGENUITY") ; will only work if the HyperX NGENUITY is already open
    {
		gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
    WinActivate "HyperX NGENUITY" ; Switches to HyperX NGENUITY Window
		Sleep 50
		Click 1332, 176 ; Click on "Base Settings" button
		Sleep 50
    WinMinimize "HyperX NGENUITY" ; Minimizes the HyperX NGENUITY Window
		WinActivate "ahk_id " gameID ; Goes back to the game Window
	}

}

;==== Switch to "RPG Maker"
; CTRL + Numpad 5
^Numpad5::
{
	If WinExist("HyperX NGENUITY") ; will only work if the HyperX NGENUITY is already open
    {
		gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
    WinActivate "HyperX NGENUITY" ; Switches to HyperX NGENUITY Window
		Sleep 50
		Click 1228, 307 ; Click on "RPG Maker" button
		Sleep 50
    WinMinimize "HyperX NGENUITY" ; Minimizes the HyperX NGENUITY Window
		WinActivate "ahk_id " gameID ; Goes back to the game Window
	}
}

;==== Switch to "K-Shoot Mania"
; CTRL + Numpad 6
^Numpad6::
{
	If WinExist("HyperX NGENUITY") ; will only work if the HyperX NGENUITY is already open
    {
		gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
    WinActivate "HyperX NGENUITY" ; Switches to HyperX NGENUITY Window
		Sleep 50
		Click 1228, 435 ; Click on "K-Shoot Mania" button
		Sleep 50
    WinMinimize "HyperX NGENUITY" ; Minimizes the HyperX NGENUITY Window
		WinActivate "ahk_id " gameID ; Goes back to the game Window
	}
}

;==== Switch to "RPG Maker (Alternate)"
; CTRL + Numpad 9
^Numpad9::
{
	If WinExist("HyperX NGENUITY") ; will only work if the HyperX NGENUITY is already open
    {
		gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
    WinActivate "HyperX NGENUITY" ; Switches to HyperX NGENUITY Window
		Sleep 50
		Click 1228, 563 ; Click on "RPG Maker (Alternate)" button
		Sleep 50
    WinMinimize "HyperX NGENUITY" ; Minimizes the HyperX NGENUITY Window
		WinActivate "ahk_id " gameID ; Goes back to the game Window
	}
}

;==== Switch to "RPG Maker (Alternate 2)"
; CTRL + Numpad 8
^Numpad8::
{
	If WinExist("HyperX NGENUITY") ; will only work if the HyperX NGENUITY is already open
    {
		gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
    WinActivate "HyperX NGENUITY" ; Switches to HyperX NGENUITY Window
		Sleep 50
		Click 1228, 691 ; Click on "RPG Maker (Alternate 2)" button
		Sleep 50
    WinMinimize "HyperX NGENUITY" ; Minimizes the HyperX NGENUITY Window
		WinActivate "ahk_id " gameID ; Goes back to the game Window
	}
}

;==== Switch to "Arrow Keys over WASD"
; CTRL + Numpad 7
^Numpad7::
{
	If WinExist("HyperX NGENUITY") ; will only work if the HyperX NGENUITY is already open
    {
		gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
    WinActivate "HyperX NGENUITY" ; Switches to HyperX NGENUITY Window
		Sleep 50
		Click 1228, 819 ; Click on "Arrow Keys over WASD" button
		Sleep 50
    WinMinimize "HyperX NGENUITY" ; Minimizes the HyperX NGENUITY Window
		WinActivate "ahk_id " gameID ; Goes back to the game Window
	}
}

Return