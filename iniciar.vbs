Set objShell = CreateObject("WScript.Shell")
objShell.Run "cmd /k ""cd /d """ & Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\")) & """ && python main.py""", 1, False
