; ================ The Hotkey
;==== Resize (dimensions: w:1700 h:1053)
; Q
q::
{
	windID := WinGetID("A") ; Gets the Unique ID of the current foreground Window
	Sleep 50
	WinMove ,,1700, 1053, "ahk_id " windID ; Resize the window to defined size
}

Return