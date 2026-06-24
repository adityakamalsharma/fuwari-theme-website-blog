---
title: Origin vs Site
published: 2026-06-24
updated: 2026-06-24
description: Explanation of Origin vs Site on the Web.
image: origin-vs-site.png
tags:
  - web
  - general
category: Web Hacking
draft: false
---
## TL;DR

- **Origin** (`Scheme` + `Host` + `Port`): The strict boundary for **execution and DOM access**. Governs the Same-Origin Policy (SOP). Defenses are explicitly bypassed via Cross-Origin Resource Sharing (CORS) or `postMessage`.
    
- **Site** (`Scheme` + `eTLD+1`): The broader boundary for **state and session management**. Governs `SameSite` cookie transmission. Defined strictly by the Public Suffix List (PSL).
    
- **Schemeful Same-Site:** Modern browsers now include the scheme in the Site definition. `[http://site.com](http://site.com)` and `[https://site.com](https://site.com)` are Cross-Site.
    
- **The Overlap Vector:** Cookies ignore ports and can be scoped to parent domains. This creates an architectural gap where a Cross-Origin execution context (e.g., a vulnerable subdomain) can manipulate Same-Site state (Cookies), leading to CSRF, Session Fixation, and DOM clobbering via Cookie Tossing.
    
---

Mixing up "Origin" and "Site" is one of the most common reasons security researchers miss critical exploit chains. To a browser, these are two completely different security boundaries that guard different things.

Here is the ground-up explanation of what these boundaries are, how they are enforced, and how to exploit them when they fail.

## Part 1: The Prerequisites (Deconstructing the URL)

Before defining the boundaries, you need to know exactly how a browser breaks down a URL.

Take this URL: `https://api.target.com:443/v1/users`

1. **Scheme:** `https://` (The protocol).
    
2. **Hostname:** `api.target.com` (The exact domain address).
    
3. **Port:** `:443` (The network port).
    
4. **Path:** `/v1/users` (Ignored by boundary rules).
    

### The Concept of eTLD+1

Browsers need to know where a "company" domain ends and a "public" domain begins. They use a hardcoded list called the **Public Suffix List (PSL)**.

- An **eTLD** (Effective Top-Level Domain) is a public suffix where anyone can register a domain. Examples: `.com`, `.co.uk`, `.github.io`.
    
- An **eTLD+1** is the eTLD plus the one specific name registered right beneath it.
    
    - For `api.target.com`, the eTLD is `.com`. The eTLD+1 is `target.com`.
        
    - For `user1.github.io`, the eTLD is `.github.io`. The eTLD+1 is `user1.github.io`.
        

## Part 2: Origin (The Execution Boundary)

### What it is

An **Origin** requires a strictly exact match of three elements:

`Scheme` + `Hostname` + `Port`

If any of these three change, you are **Cross-Origin**.

### Why it is used

It drives the **Same-Origin Policy (SOP)**. The SOP is the browser's primary defense against malicious code. It dictates that JavaScript executing on one Origin cannot read the DOM or the network responses of another Origin. Without it, visiting `evil.com` would allow a malicious script to read your banking details on `bank.com`.

### How it is set

Sometimes, developers _need_ to share data across origins (e.g., `app.target.com` fetching user data from `api.target.com`). To bypass the SOP, they configure **Cross-Origin Resource Sharing (CORS)**.

The server sends an HTTP header: `Access-Control-Allow-Origin: https://app.target.com`. This tells the browser to punch a specific hole in the SOP for that exact origin.

### What Hackers Do When It Fails

If a developer misconfigures CORS, the SOP is functionally broken.

- **The Flaw:** Developers often use lazy regex to check the incoming `Origin` header and reflect it back to the user to allow multiple subdomains dynamically.
    
- **The Exploit:** If the regex only checks if the request _contains_ "target.com", a hacker registers `target.com.evil.com`. The server reflects this malicious origin, allowing the hacker's site to read sensitive API responses across the boundary.
    

## Part 3: Site (The Cookie Boundary)

### What it is

A **Site** is a broader, looser boundary. It requires a match of only two elements:

`Scheme` + `eTLD+1`

Ports do not matter. Subdomains do not matter. `https://api.target.com:8443` and `https://www.target.com:443` are **Cross-Origin**, but they are exactly the **Same-Site** because they share the `https://` scheme and the `target.com` eTLD+1.

### Why it is used

It controls session state and cookies. Browsers use the Site boundary to decide if they should attach a user's session cookie when a request is made. This defends against **Cross-Site Request Forgery (CSRF)**—where an attacker tricks your browser into executing an action on a site where you are currently logged in.

### How it is set

Developers enforce this via the `SameSite` attribute on the `Set-Cookie` HTTP header.

- **Strict:** The cookie is only sent if the request originates from the Same-Site.
    
- **Lax:** (Modern default). The cookie is not sent on cross-site POST requests (blocking most CSRF), but is sent on safe top-level navigations like clicking a standard link.
    
- **None:** The cookie is sent everywhere.
    

### What Hackers Do When It Fails

If `SameSite` is absent (defaulting to Lax) or misconfigured, hackers target the fact that subdomains share the Site boundary.

- **The Flaw:** A company has a forgotten, vulnerable subdomain like `promo.target.com` with a Cross-Site Scripting (XSS) vulnerability.
    
- **The Exploit (Subdomain Takeover to CSRF):** The hacker hosts a CSRF payload on `promo.target.com` that targets `app.target.com`. Because both subdomains are Same-Site, the browser attaches the victim's session cookies. `SameSite` protections are entirely bypassed.
    
- **The Exploit (Cookie Tossing):** The hacker uses the XSS on the subdomain to write a new session cookie scoped to the parent `.target.com`. The victim's browser will now send this attacker-controlled cookie to the main application, resulting in a forced session or account takeover.
    

## Summary Comparison

|**URL 1 (Base)**|**URL 2 (Target)**|**Origin**|**Site**|**Hacker Takeaway**|
|---|---|---|---|---|
|`https://target.com`|`https://api.target.com`|**Cross-Origin**|**Same-Site**|Cannot read data via JS. Can manipulate cookies.|
|`http://target.com`|`https://target.com`|**Cross-Origin**|**Cross-Site**|Scheme mismatch breaks both boundaries.|
|`https://target.com:443`|`https://target.com:8080`|**Cross-Origin**|**Same-Site**|Port mismatch breaks SOP, but cookies are still shared.|