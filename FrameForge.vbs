Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetAbsolutePathName(".")
WshShell.Run """" & strPath & "\venv\Scripts\pythonw.exe"" """ & strPath & "\launcher.py""", 0, False
