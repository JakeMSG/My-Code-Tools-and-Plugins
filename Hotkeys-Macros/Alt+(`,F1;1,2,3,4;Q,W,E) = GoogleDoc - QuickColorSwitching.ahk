; ======== Extension for Gray Background
~LAlt & `:: ; Extension for Gray Background (Browser Forced Dark Mode)
{
	SendInput {Click 2124 120 }
	Sleep 100
	SendInput {Click 388 152 }
	SendInput {Click 2188 109 }
	SendInput {Click 1600 700 }
}
Return
~LAlt & F1:: ; Extension for Gray Background - Revert back to Normal
{
	SendInput {Click 2124 120 }
	Sleep 100
	SendInput {Click 481 152 }
	SendInput {Click 2188 109 }
	SendInput {Click 1600 700 }
}
Return


; ======== The rest of the Mouse Position depend on the Zoom level of the Google Doc page (calibrated at 80% Zoom) (Buttons are 50px apart horizontally)
; ==== Colors
~LAlt & 1:: ; Black Color
{
	SendInput {Click 1211 269}  ; 1210 350
	Sleep 200
    SendInput {Click 1219 325}
	SendInput {Click 1600 700 0}
}
Return
~LAlt & 2:: ; Red Color
{
	SendInput {Click 1211 269}
	Sleep 200
    SendInput {Click 1250 357}
	SendInput {Click 1600 700 0}
}
Return
~LAlt & 3:: ; Cyan Color
{
	SendInput {Click 1211 269}
	Sleep 200
    SendInput {Click 1378 357}
	SendInput {Click 1600 700 0}
}
Return
~LAlt & 4:: ; Magenta Color
{
	SendInput {Click 1211 269}
	Sleep 200
    SendInput {Click 1507 357}
	SendInput {Click 1600 700 0}
}
Return
~LAlt & 5:: ; Dark Green 1 Color
{
	SendInput {Click 1211 269}
	Sleep 200
    SendInput {Click 1347 487}
	SendInput {Click 1600 700 0}
}
Return

; ==== Highlighters
~LAlt & q:: ; None (no highlighting)
{
	SendInput {Click 1260 269}
	Sleep 200
    SendInput {Click 1413 333}
	SendInput {Click 1600 700 0}
}
Return
~LAlt & w:: ; Yellow
{
	SendInput {Click 1260 269}
	Sleep 200
    SendInput {Click 1364 407}
	SendInput {Click 1600 700 0}
}
Return
~LAlt & e:: ; Light Magenta 3
{
	SendInput {Click 1260 269}
	Sleep 200
    SendInput {Click 1556 436}
	SendInput {Click 1600 700 0}
}
Return