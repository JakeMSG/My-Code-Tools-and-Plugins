; ================ Initial Steps
; ======== Opening Programs
; ==== MTool
If !(WinExist("MTool")) ; Won't try to open if Program is already active
{
  Run "E:\Games\JapaneseGames\SYSTEMS_AND_STUFF\HACKING\RPG\ALL(MZ,MV,VXAce,XP,Wolf,SRPG)\MTool\Tool\Tool\nw.exe"  ; Opens MTool
  Sleep 8000
  WinMove ,,1860, 1225, "MTool" ; Resize the window to defined size (for the Hotkey)

  WinMinimize "MTool"
}
else
{
  WinMove ,,1860, 1225, "MTool" ; Resize the window to defined size (for the Hotkey)

  WinMinimize "MTool"
}

; ======== Initializing Variables
; ==== Game Engine switcher (possible values: "XPVXACE", "MVMZ")
gameEngine := "MVMZ"


; ================ The Hotkey(s)
; ==== Switching between Game Engines (XP/VX/VXAce -OR- MV/MZ)
F1 & F2::
{
  global gameEngine
  If ( gameEngine = "MVMZ" ) ; switches from "MVMZ" to "XPVXACE"
    {
    gameEngine := "XPVXACE"

    gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
    WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
    Sleep 50
    Click 47, 86 ; Click on "Main" Tab
    Sleep 50
    WinActivate "ahk_id " gameID ; Goes back to the game Window
    Sleep 50
	}
  Else ; switches from "XPVXACE" to "MVMZ"
    {
    gameEngine := "MVMZ"

    gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
    WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
    Sleep 50
    Click 47, 86 ; Click on "Main" Tab
    Sleep 50
    WinActivate "ahk_id " gameID ; Goes back to the game Window
    Sleep 50
	}
}

; ==== to Load Screen
F1::
{
  global gameEngine
	If WinExist("MTool") ; will only work if the MTool is already open (previously called "ToolClient")
    {
    If ( gameEngine = "MVMZ" ) ; ==== Version for MV/MZ engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 760, 351 ; Click on "Load" button
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
    Else ; ==== Version for XP/VX/VXAce engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 663, 318 ; Click on "Load" button
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
	}
}

; ==== to Title Screen
F1 & 1::
{
  global gameEngine
	If WinExist("MTool") ; will only work if the MTool is already open (previously called "ToolClient")
    {
    If ( gameEngine = "MVMZ" ) ; ==== Version for MV/MZ engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 981, 418 ; Click on "GOTO Title" button
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
    Else ; ==== Version for XP/VX/VXAce engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 573, 318 ; Click on "Menu" button
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
	}
}

; ==== to Save Screen
F1 & 2::
{
  global gameEngine
	If WinExist("MTool") ; will only work if the MTool is already open (previously called "ToolClient")
    {
    If ( gameEngine = "MVMZ" ) ; ==== Version for MV/MZ engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 853, 351 ; Click on "Save" button
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
    Else ; ==== Version for XP/VX/VXAce engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 757, 318 ; Click on Save button
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
	}
}

; ======== (MV/MZ exclusive) Error fixes
; ==== Fix Crash
F1 & 3::
{
  global gameEngine
	If WinExist("MTool") ; will only work if the MTool is already open (previously called "ToolClient")
    {
    If ( gameEngine = "MVMZ" ) ; ==== Version for MV/MZ engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 1490, 418 ; Click on "Fix Crash" button
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
	}
}

; ==== Erase Picture
F1 & 4::
{
  global gameEngine
	If WinExist("MTool") ; will only work if the MTool is already open (previously called "ToolClient")
    {
    If ( gameEngine = "MVMZ" ) ; ==== Version for MV/MZ engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 213, 418 ; Click on "Erase Picture" button
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
	}
}


; ==== to decrease Font Size
F1 & F3::
{
  global gameEngine
	If WinExist("MTool") ; will only work if the MTool is already open (previously called "ToolClient")
    {
    If ( gameEngine = "MVMZ" ) ; ==== Version for MV/MZ engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 171, 935 ; Click on "Fontsize" section
      Sleep 50
      send "{WheelDown}" ; Scrollwheel Down to increase Font
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
    Else ; ==== Version for XP/VX/VXAce engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 180, 743 ; Click on "Fontsize" section
      Sleep 50
      send "{WheelDown}" ; Scrollwheel Down to increase Font
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
	}
}


; ==== to increase Font Size
F1 & F4::
{
  global gameEngine
	If WinExist("MTool") ; will only work if the MTool is already open (previously called "ToolClient")
    {
    If ( gameEngine = "MVMZ" ) ; ==== Version for MV/MZ engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 171, 935 ; Click on "Fontsize" section
      Sleep 50
      send "{WheelUp}" ; Scrollwheel Down to increase Font
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
    Else ; ==== Version for XP/VX/VXAce engines
      {
      gameID := WinGetID("A") ; Gets the Unique ID of the current game Window
      WinActivate "MTool" ; Switches to MTool Window (previously called "ToolClient")
      Sleep 50
      Click 180, 743 ; Click on "Fontsize" section
      Sleep 50
      send "{WheelUp}" ; Scrollwheel Down to increase Font
      Sleep 50
      WinActivate "ahk_id " gameID ; Goes back to the game Window

      MouseMove -4000, -4000, 0  ; Makes Mouse move to Top-Left corner (Optional Command, to not be annoyed by Cursor mid-screen)
    }
	}
}


Return