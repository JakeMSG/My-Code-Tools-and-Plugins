KeyDown = 0 ; Starts as False (0)
Ctrl & LShift:: ; * => Can be used with Modifiers (such as Shift pressed); ~ => Retains its original use while triggering the hotkey (will press "a", then execute the hotkey)
{
KeyDown := GetKeyState("LShift") ; Assures that it's "synced" to the LShift state (helpful if Shift is pressed during the "LShift down" state)
KeyDown := !KeyDown ; Switches current state on Key press (0->1 / 1->0)
If KeyDown
	SendInput {LShift down} ; When True (1)
Else
	SendInput {LShift up}  ; When False (0)
}