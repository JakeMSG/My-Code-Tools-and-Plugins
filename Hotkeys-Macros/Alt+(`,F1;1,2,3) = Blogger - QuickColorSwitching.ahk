~LAlt & `:: ; Extension for Gray Background (Browser Forced Dark Mode)
{
	SendInput {Click 2188 109 }
	Sleep 100
	SendInput {Click 388 152 }
	SendInput {Click 2188 109 }
	SendInput {Click 1600 700 }
}
Return
~LAlt & F1:: ; Extension for Gray Background - Revert back to Normal
{
	SendInput {Click 2188 109 }
	Sleep 100
	SendInput {Click 481 152 }
	SendInput {Click 2188 109 }
	SendInput {Click 1600 700 }
}
Return
; The rest of the Mouse Position depend on the Zoom level of the Blogger page (calibrated at 67% Zoom)
~LAlt & 1:: ; Black Color
{
	SendInput {Click 587 348}
	Sleep 200
    SendInput {Click 1142 523}
	SendInput {Click 1600 700 0}
}
Return
~LAlt & 2:: ; Blue Color
{
	SendInput {Click 587 348}
	Sleep 200
    SendInput {Click 1351 906}
	SendInput {Click 1600 700 0}
}
Return
~LAlt & 3:: ; Red Color
{
	SendInput {Click 587 348}
	Sleep 200
    SendInput {Click 1142 906}
	SendInput {Click 1600 700 0}
}
Return