---
title: Graph-QL Hacking
published: 2026-06-09
updated: 2026-06-09
description: Blog on GraphQL and its pentesting methodology.
image: graphql.png
tags:
  - graphql
  - methodology
  - api
  - web
category: Web Hacking
draft: false
---
# Hacking GraphQL

If you are transitioning from traditional REST API pentesting to GraphQL, the rules of engagement have fundamentally changed. REST forces you to query multiple endpoints (e.g., `/users`, `/posts`, `/comments`) to piece together data. GraphQL operates on a single endpoint, allowing the client to dictate exactly what data it wants and in what format.

This is incredibly efficient for developers, but flexibility introduces severe security risks. **GraphQL does not include authentication or authorization mechanisms by default**. If developers fail to explicitly secure the underlying functions, the API will happily hand over the keys to the kingdom.

Here is a comprehensive breakdown of how GraphQL works, methodologies for tearing it apart, and strategies for securing it.

## 1. Deconstructing GraphQL: Properties and Functions

Before hacking a target, you must understand its anatomy. A GraphQL API is defined by a **Schema**, which is a strictly typed contract between the client and the server.

### The Core Operations

GraphQL relies on three primary operation types:

- **Queries (The Readers):** Equivalent to REST `GET` requests. Used to fetch data without modifying the server state.
    
    - _Example:_ Asking for a user's ID, email, and their last 5 login IPs.
        
- **Mutations (The Writers):** Equivalent to REST `POST`, `PUT`, or `DELETE`. Used to create, update, or delete data.
    
    - _Example:_ Changing a password or creating a new administrative user.
        
- **Subscriptions (The Listeners):** Maintains an active connection (usually WebSockets) to push real-time updates from the server to the client.
    

### Structural Components

- **Types:** The objects available in the database (e.g., `User`, `Product`, `Order`).
    
- **Resolvers:** The backend functions written by developers. When you query a user's `email`, the server executes the specific _resolver function_ tied to that `email` field to fetch the data. **This is where authorization bugs live.** If the resolver checks _if_ you are logged in, but fails to check _who_ you are, you have an Insecure Direct Object Reference (IDOR).
    
- **Fragments:** Reusable units of a query. Attackers often abuse recursive fragments to bypass query depth limits and cause Denial of Service (DoS).
    
- **Variables:** Used to pass dynamic arguments into queries securely, preventing injection attacks if implemented correctly.
    

## 2. Black-Box Methodology: The Outside-In Approach

When testing without source code, your priority is to find the endpoint, dump the schema, and map the attack surface.

### Endpoint Discovery & Fingerprinting

GraphQL typically sits at predictable paths. In directory brute-forcing, look for:

- `/graphql`, `/graphiql`, `/api/graphql`, `/graphql.php`
    

To confirm the endpoint, send a universal query:

```GraphQL
query{__typename}
```

If the server returns `{"data": {"__typename": "Query"}}`, you have a live target.

### Introspection: The Keys to the Castle

GraphQL has a built-in feature called **Introspection**. If left enabled, you can ask the API to document itself, returning every type, query, mutation, and argument it supports. The generation of introspection payload can be automated in burpsuite by going to the **GraphQL tab** in **Repeater** and then: **Right click > Set introspection query**.


```GraphQL
query={__schema{types{name,fields{name,args{name,description,type{name,kind,ofType{name, kind}}}}}}}
```

**Visualizing the Schema with GraphQL Voyager:**

Reading massive JSON introspection responses is a waste of time. Copy the introspection output and paste it into **GraphQL Voyager**. Voyager renders the entire API into an interactive, visual graph. You can physically see the relationships between a `User` node and a `BillingDetails` node, instantly highlighting high-value targets.

### Bypassing Disabled Introspection

If developers block the `__schema` keyword, try to bypass it:

1. **Regex Bypasses:** Add spaces or newlines: `query{__schema \n {queryType{name}}}`
    
2. **Error-Based Reconstruction:** Modern engines are overly helpful. If you query `query { use }`, the server replies: `Did you mean "user"?` Tools like **InQL** brute-force wordlists to map the schema purely via these error messages.
    

## 3. White-Box Methodology: The Source Review

If you have access to the source code, stop guessing and start auditing logic.

1. **Static Schema Review:** Search the `.graphql` or `.gql` files. Look for fields marked `@deprecated`. Deprecated fields are often legacy code that developers forgot to wrap in modern security middleware.
    
2. **Auditing Resolvers:** Trace the execution of critical mutations (like `updatePassword` or `deleteAccount`). Ensure the resolver actively verifies that the session token matches the `userID` being modified. Authorization must happen at the business logic layer, not the GraphQL controller.
    

## 4. Exploitation & Vulnerability Classes

Once the schema is mapped, move to exploitation.

|**Attack Vector**|**Description**|**Example Payload / Concept**|
|---|---|---|
|**Information Disclosure**|Extracting sensitive data via exposed queries without adequate access controls.|`query { user(uid:1) { username, password, ssn } }`|
|**Authorization Bypass**|Forcing state changes on objects you do not own via mutations (IDOR/Privilege Escalation).|`mutation { updateProfile(username: "admin", role: "superuser") { success } }`|
|**Alias Overloading (DoS)**|Requesting the same expensive query thousands of times using aliases to exhaust CPU/RAM.|`query { a1: __typename a2: __typename ... a1000: __typename }`|
|**Array-Based Batching (DoS)**|Sending a JSON array of identical complex queries to force concurrent backend resolution.|`[{"query":"..."}, {"query":"..."}]`|
|**Directive Overloading (DoS)**|Spamming a query with recursive directives to crash the execution parser.|`query { __typename @include(if:true) @include(if:true)... }`|
|**CSRF**|Abusing endpoints that accept `application/x-www-form-urlencoded` or `GET` requests without CSRF tokens.|Sending state-changing mutations via malicious HTML forms.|
|**WebSocket Hijacking**|Exploiting unprotected cookies during GraphQL WebSocket handshakes to perform actions as the victim.|Forging a Cross-Site WebSocket connection to a `subscriptions` endpoint.|

## 5. The Hacker's Arsenal: CLI Tools & Burp Suite

Keep your workflow terminal-centric for speed, but leverage Burp Suite for deep inspection.

### External CLI Tooling

- **InQL (v6.1+):** Automates error-based schema reconstruction and generates syntactically valid attack payloads. Essential for blind targeting.
    
- **graphw00f:** Command-line fingerprinting to identify the specific GraphQL engine (e.g., Apollo, Hasura) and map it to known CVEs.
    
- **graphql-cop:** Automated scanning script for common misconfigurations like array batching, alias limits, and trace mode leaks.
    

### Maximizing Burp Suite In-Built Features

- **Introspection Query Automation:** Burp's GraphQL parser allows you to set and send introspection queries directly from the Repeater tab. If supported, you pull the schema instantly.
    
- **Site Map Integration:** Traditional web crawlers fail at GraphQL because every request hits a single `/graphql` URL. Burp circumvents this by parsing operation names and saving each unique query as a distinct node in the Target Site Map. This allows you to track tested queries and run active scans on specific mutations.
    
- **CSRF PoC Generator:** If you find a state-changing mutation, right-click the request in Burp and select **Engagement Tools -> Generate CSRF PoC**. Burp builds an HTML page that automatically submits the mutation. Open this in an authenticated browser to prove the vulnerability.
    

## 6. Defensive Measures: Securing the Endpoint

If you are tasked with fixing these vulnerabilities, implement the following controls:

1. **Disable Introspection in Production:** This is the absolute bare minimum. Do not hand attackers a map of your database.
    
2. **Enforce Query Depth and Complexity Limits:** Prevent DoS attacks by restricting how deep a query can nest and calculating a maximum "cost" for each request. Middleware like `graphql-armor` handles this seamlessly.
    
3. **Implement Authorization at the Business Logic Layer:** Do not rely on GraphQL to handle permissions. Pass the user context to the resolver, and let the underlying business logic verify if User A is allowed to modify Object B.
    
4. **Strict Content-Type Validation:** Only accept `application/json` to mitigate CSRF attacks. Reject `x-www-form-urlencoded` and `GET` requests for mutations.
    
5. **Disable Array Batching:** Unless explicitly required by the frontend application, disable the ability to send arrays of queries in a single HTTP request.