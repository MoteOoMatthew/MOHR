!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro customInit
  ; Set installer branding
  BrandingText "MOHR HR System"
  
  ; Set installer icon
  !define MUI_ICON "${BUILD_RESOURCES_DIR}\icon.ico"
  !define MUI_UNICON "${BUILD_RESOURCES_DIR}\icon.ico"
  
  ; Welcome page
  !define MUI_WELCOMEPAGE_TITLE "Welcome to MOHR HR System"
  !define MUI_WELCOMEPAGE_TEXT "This will install MOHR HR System on your computer.$\r$\n$\r$\nMOHR is a comprehensive HR management system designed for small to medium businesses.$\r$\n$\r$\nClick Next to continue."
  
  ; License page
  !define MUI_LICENSEPAGE_TEXT_TOP "Please review the license terms before installing MOHR HR System."
  
  ; Components page
  !define MUI_COMPONENTSPAGE_TEXT_TOP "Select the components you want to install:"
  
  ; Directory page
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Setup will install MOHR HR System in the following folder.$\r$\n$\r$\nTo install in a different folder, click Browse and select another folder. Click Next to continue."
  
  ; Instfiles page
  !define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "Installation Complete"
  !define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "MOHR HR System has been installed on your computer."
  
  ; Finish page
  !define MUI_FINISHPAGE_TITLE "Installation Complete"
  !define MUI_FINISHPAGE_TEXT "MOHR HR System has been successfully installed on your computer.$\r$\n$\r$\nYou can now launch the application from the Start Menu or Desktop shortcut."
  !define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXECUTABLE}"
  !define MUI_FINISHPAGE_RUN_TEXT "Launch MOHR HR System"
  !define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\README.txt"
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Show README"
  
  ; Uninstaller
  !define MUI_UNCONFIRMPAGE_TEXT_TOP "MOHR HR System will be removed from your computer. Click Uninstall to continue."
!macroend

!macro customInstall
  ; Create README file
  FileOpen $0 "$INSTDIR\README.txt" w
  FileWrite $0 "MOHR HR System$\r$\n"
  FileWrite $0 "================$\r$\n$\r$\n"
  FileWrite $0 "A comprehensive HR management system for small to medium businesses.$\r$\n$\r$\n"
  FileWrite $0 "Features:$\r$\n"
  FileWrite $0 "- Employee management$\r$\n"
  FileWrite $0 "- User management with role-based access$\r$\n"
  FileWrite $0 "- Leave request management$\r$\n"
  FileWrite $0 "- Mobile-responsive design$\r$\n"
  FileWrite $0 "- Desktop application$\r$\n$\r$\n"
  FileWrite $0 "Default login:$\r$\n"
  FileWrite $0 "Username: admin$\r$\n"
  FileWrite $0 "Password: admin123$\r$\n$\r$\n"
  FileWrite $0 "For support, visit: https://github.com/your-username/mohr-hr-system$\r$\n"
  FileClose $0
  
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\MOHR HR System.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
  
  ; Create start menu shortcut
  CreateDirectory "$SMPROGRAMS\MOHR HR System"
  CreateShortCut "$SMPROGRAMS\MOHR HR System\MOHR HR System.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
  CreateShortCut "$SMPROGRAMS\MOHR HR System\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
  
  ; Write registry information for add/remove programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System" "DisplayName" "MOHR HR System"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System" "UninstallString" "$\"$INSTDIR\Uninstall.exe$\""
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System" "DisplayIcon" "$INSTDIR\${APP_EXECUTABLE}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System" "Publisher" "MOHR Team"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System" "URLInfoAbout" "https://github.com/your-username/mohr-hr-system"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System" "DisplayVersion" "${VERSION}"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System" "NoRepair" 1
!macroend

!macro customUnInit
  ; Remove shortcuts
  Delete "$DESKTOP\MOHR HR System.lnk"
  RMDir /r "$SMPROGRAMS\MOHR HR System"
  
  ; Remove registry entries
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MOHR HR System"
!macroend 