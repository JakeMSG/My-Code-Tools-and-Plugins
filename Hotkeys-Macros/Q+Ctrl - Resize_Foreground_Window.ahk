; Resize_Foreground_Window.ahk
; AutoHotkey v2 — Ctrl+Q resizes the current foreground window using Resize_Settings.txt
; (same TARGET_W / TARGET_H file as Resize_Center_Game.ahk) and centers it on its monitor.
; Run this file directly. Do not run it at the same time as Resize_Center_Game.ahk
; (both bind Ctrl+Q).

#Requires AutoHotkey v2.0
#SingleInstance Force
Persistent

DetectHiddenWindows false

SETTINGS_FILE := A_ScriptDir "\Resize_Settings.txt"

; Ctrl+Q — resize & center the foreground window
^q:: ResizeAndCenterForeground()

; Optional: Ctrl+Alt+Q exits this helper
^!q:: ExitApp

; Reads TARGET_W / TARGET_H from Resize_Settings.txt (KEY=VALUE lines).
; Returns true on success; shows a tip and returns false on failure.
LoadResizeSettings(&outW, &outH) {
    global SETTINGS_FILE
    outW := 0
    outH := 0

    if !FileExist(SETTINGS_FILE) {
        TrayTip "Foreground Resize", "Settings file not found:`n" SETTINGS_FILE, 3
        return false
    }

    try {
        text := FileRead(SETTINGS_FILE, "UTF-8")
    } catch {
        TrayTip "Foreground Resize", "Could not read:`n" SETTINGS_FILE, 3
        return false
    }

    for line in StrSplit(text, "`n", "`r") {
        line := Trim(line)
        if (line = "" || SubStr(line, 1, 1) = "#" || SubStr(line, 1, 1) = ";")
            continue
        if !InStr(line, "=")
            continue
        parts := StrSplit(line, "=", , 2)
        key := StrUpper(Trim(parts[1]))
        val := Trim(parts[2])
        if (key = "TARGET_W" && IsInteger(val) && Integer(val) > 0)
            outW := Integer(val)
        else if (key = "TARGET_H" && IsInteger(val) && Integer(val) > 0)
            outH := Integer(val)
    }

    if (outW <= 0 || outH <= 0) {
        TrayTip "Foreground Resize", "Invalid settings in Resize_Settings.txt`nNeed TARGET_W and TARGET_H as positive integers.", 3
        return false
    }
    return true
}

IsSkippableWindow(hwnd) {
    try cls := WinGetClass(hwnd)
    catch
        return true
    ; Desktop / taskbar / Start menu — not useful to resize
    skipClasses := ["Progman", "WorkerW", "Shell_TrayWnd", "Shell_SecondaryTrayWnd",
        "NotifyIconOverflowWindow", "Windows.UI.Core.CoreWindow", "XamlExplorerHostIslandWindow"]
    for c in skipClasses {
        if (cls = c)
            return true
    }
    return false
}

ResizeAndCenterForeground() {
    if !LoadResizeSettings(&TARGET_W, &TARGET_H)
        return

    hwnd := WinExist("A")
    if !hwnd {
        TrayTip "Foreground Resize", "No foreground window found.", 3
        return
    }
    if IsSkippableWindow(hwnd) {
        TrayTip "Foreground Resize", "Foreground window is the desktop or taskbar; skipped.", 3
        return
    }

    ; Prefer the restored (non-maximized) frame so WinMove can set an exact size
    try WinRestore(hwnd)

    ; Center on the monitor that currently contains the window (multi-monitor friendly)
    WinGetPos(&wx, &wy, &ww, &wh, hwnd)
    mon := MonitorGetPrimary()
    monCount := MonitorGetCount()
    loop monCount {
        MonitorGet(A_Index, &ml, &mt, &mr, &mb)
        cx := wx + ww // 2
        cy := wy + wh // 2
        if (cx >= ml && cx < mr && cy >= mt && cy < mb) {
            mon := A_Index
            break
        }
    }

    MonitorGetWorkArea(mon, &workLeft, &workTop, &workRight, &workBottom)
    workW := workRight - workLeft
    workH := workBottom - workTop
    x := workLeft + (workW - TARGET_W) // 2
    y := workTop + (workH - TARGET_H) // 2

    WinMove(x, y, TARGET_W, TARGET_H, hwnd)
    try title := WinGetTitle(hwnd)
    catch
        title := ""
    if (title = "")
        title := "(untitled)"
    TrayTip "Foreground Resize", title "`nSet to " TARGET_W "x" TARGET_H " and centered.", 2
}
