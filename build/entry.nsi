; example1.nsi
;
; This script is perhaps one of the simplest NSIs you can make. All of the
; optional settings are left to their default settings. The installer simply 
; prompts the user asking them where to install, and drops a copy of example1.nsi
; there. 

!include MUI2.nsh


; MUI Settings / Icons
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
 
; MUI Settings / Header
;!define MUI_HEADERIMAGE
;!define MUI_HEADERIMAGE_RIGHT
;!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\orange-r-nsis.bmp"
;!define MUI_HEADERIMAGE_UNBITMAP "${NSISDIR}\Contrib\Graphics\Header\orange-uninstall-r-nsis.bmp"
 
; MUI Settings / Wizard
;!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange-nsis.bmp"
;!define MUI_UNWELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange-uninstall-nsis.bmp"

;--------------------------------

; The name of the installer
Name "��Ʈ��"

; The file to write
OutFile "Entry_1.2.0_Setup.exe"

; The default installation directory
InstallDir "C:\Entry"

; Registry key to check for directory (so if you install again, it will 
; overwrite the old one automatically)
InstallDirRegKey HKLM "Software\Entry" "Install_Dir"

; Request application privileges for Windows Vista
RequestExecutionLevel admin


;--------------------------------

; Pages

!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
;--------------------------------

; �ٱ��� ����
!insertmacro MUI_LANGUAGE "Korean" ;first language is the default language

LangString TEXT_ENTRY_TITLE ${LANG_KOREAN} "��Ʈ�� (�ʼ�)"
LangString TEXT_START_MENU_TITLE ${LANG_KOREAN} "���۸޴��� �ٷΰ���"
LangString TEXT_DESKTOP_TITLE ${LANG_KOREAN} "����ȭ�鿡 �ٷΰ���"
LangString DESC_ENTRY ${LANG_KOREAN} "��Ʈ�� �⺻ ���α׷�"
LangString DESC_START_MENU ${LANG_KOREAN} "���۸޴��� �ٷΰ��� �������� �����˴ϴ�."
LangString DESC_DESKTOP ${LANG_KOREAN} "����ȭ�鿡 �ٷΰ��� �������� �����˴ϴ�."
LangString SETUP_UNINSTALL_MSG ${LANG_ENGLISTH} "��Ʈ���� �̹� ��ġ�Ǿ� �ֽ��ϴ�. $\n$\r'Ȯ��' ��ư�� ������ ���� ������ ���� �� �缳ġ�ϰ� '���' ��ư�� ������ ���׷��̵带 ����մϴ�."


!insertmacro MUI_LANGUAGE "English"

LangString TEXT_ENTRY_TITLE ${LANG_ENGLISTH} "Entry (required)"
LangString TEXT_START_MENU_TITLE ${LANG_ENGLISTH} "Start menu shortcut"
LangString TEXT_DESKTOP_TITLE ${LANG_ENGLISTH} "Desktop shortcut"
LangString DESC_ENTRY ${LANG_ENGLISTH} "Entry Program"
LangString DESC_START_MENU ${LANG_ENGLISTH} "Create shortcut on start menu"
LangString DESC_DESKTOP ${LANG_ENGLISTH} "Create shortcut on desktop"
LangString SETUP_UNINSTALL_MSG ${LANG_ENGLISTH} "Entry is already installed. $\n$\nClick 'OK' to remove the previous version or 'Cancel' to cancel this upgrade."



; The stuff to install
Section $(TEXT_ENTRY_TITLE) SectionEntry

  SectionIn RO
  
  ; Set output path to the installation directory.
  ;SetOutPath $INSTDIR
  

  ; Put file there
  SetOutPath "$INSTDIR\locales"
  File "..\locales\*.*"
  
  SetOutPath "$INSTDIR\resources"
  File /r "..\resources\*.*"
  
  SetOutPath "$INSTDIR"
  File "..\*.*"
  File "icon.ico"
  
  WriteRegStr HKCR ".ent" "" "Entry"
  WriteRegStr HKCR ".ent" "Content Type" "application/x-entryapp"
  WriteRegStr HKCR "Entry\DefaultIcon" "" "$INSTDIR\icon.ico"
  WriteRegStr HKCR "Entry\Shell\Open" "" "&Open"
  WriteRegStr HKCR "Entry\Shell\Open\Command" "" '"$INSTDIR\Entry.exe" "%1"'
  WriteRegStr HKCR "MIME\DataBase\Content Type\application/x-entryapp" "Extestion" ".ent"
  
  ; Write the installation path into the registry
  WriteRegStr HKLM "SOFTWARE\Entry" "Install_Dir" "$INSTDIR"
  
  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Entry" "DisplayName" "��Ʈ��"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Entry_HW" "DisplayVersion" "1.2.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Entry" "UninstallString" '"$INSTDIR\��Ʈ�� ����.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Entry" "DisplayIcon" '"$INSTDIR\icon.ico"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Entry" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Entry" "NoRepair" 1
  WriteUninstaller "��Ʈ�� ����.exe"
  
SectionEnd

; Optional section (can be disabled by the user)
Section $(TEXT_START_MENU_TITLE) SectionStartMenu

  CreateDirectory "$SMPROGRAMS\EntryLabs\Entry"
  CreateShortCut "$SMPROGRAMS\EntryLabs\Entry\��Ʈ�� ����.lnk" "$INSTDIR\��Ʈ�� ����.exe" "" "$INSTDIR\��Ʈ�� ����.exe" 0
  CreateShortCut "$SMPROGRAMS\EntryLabs\Entry\��Ʈ��.lnk" "$INSTDIR\Entry.exe" "" "$INSTDIR\icon.ico" 0
  
SectionEnd

;--------------------------------

; Optional section (can be disabled by the user)
Section $(TEXT_DESKTOP_TITLE) SectionDesktop

  CreateShortCut "$DESKTOP\��Ʈ��.lnk" "$INSTDIR\Entry.exe" "" "$INSTDIR\icon.ico" 0
  
SectionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
	!insertmacro MUI_DESCRIPTION_TEXT ${SectionEntry} $(DESC_ENTRY)
    !insertmacro MUI_DESCRIPTION_TEXT ${SectionStartMenu} $(DESC_START_MENU)
    !insertmacro MUI_DESCRIPTION_TEXT ${SectionDesktop} $(DESC_DESKTOP)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

;--------------------------------

; Uninstaller

Section "Uninstall"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Entry"
  DeleteRegKey HKLM "SOFTWARE\Entry"
  DeleteRegKey HKCR ".ent"
  DeleteRegKey HKCR "Entry"
  DeleteRegKey HKCR "MIME\DataBase\Content Type\application/x-entryapp"

  ; Remove files and uninstaller
  Delete $INSTDIR\*

  ; Remove shortcuts, if any
  Delete "$SMPROGRAMS\EntryLabs\Entry\*.*"
  
  Delete "$DESKTOP\��Ʈ��.lnk"

  ; Remove directories used
  RMDir "$SMPROGRAMS\EntryLabs\Entry"
  RMDir /r "$INSTDIR"

SectionEnd

Function .onInit
 
  ReadRegStr $R0 HKLM \
  "Software\Microsoft\Windows\CurrentVersion\Uninstall\Entry" \
  "UninstallString"
  StrCmp $R0 "" done
 
  MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
  $(SETUP_UNINSTALL_MSG) \
  IDOK uninst
  Abort
 
;Run the uninstaller
uninst:
  ClearErrors
  ExecWait '$R0 _?=$INSTDIR'
  ;ExecWait '$R0 _?=$R1'
 
  ;IfErrors no_remove_uninstaller done
  ;no_remove_uninstaller:
  IfErrors 0 +2
	Abort
	RMDir /r /REBOOTOK $R1
 
done:
 
FunctionEnd