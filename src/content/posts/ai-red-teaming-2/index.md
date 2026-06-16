---
title: "AI Red Teaming : Part - 2"
published: 2026-06-16
updated: 2026-06-16
description: AI Red Teaming Series. Blog - 2
image: ai-photo-2.png
tags:
  - ai_red_teaming
  - artificial_intelligence
  - injection
  - red
  - teaming
  - red_team
category: AI Red Teaming
draft: false
---
## Part 1: Refresher of Blog-1  

To successfully execute attacks against live models, you must first understand how these models process data and how attackers categorize vulnerabilities.

### 1. Machine Learning Foundations

Understanding the core terminology prevents confusion when identifying target systems.

- **The Hierarchy:**
    
    - **Artificial Intelligence (AI):** The overarching concept of creating machines that simulate human intelligence.
        
    - **Machine Learning (ML):** A subset of AI. Instead of using explicit programmed rules, ML uses statistical algorithms to identify patterns in data.
        
    - **Deep Learning (DL):** A subset of ML. It utilizes Artificial Neural Networks (ANNs) with multiple layers to automatically extract features from complex, unstructured data like images or audio.
        
- **Learning Types:**
    
    - **Supervised Learning:** The algorithm is trained on data that already contains the correct answers (labels). It is used for Classification (categorizing items, like Spam vs. Not Spam) or Regression (predicting continuous numerical values, like stock prices).
        
    - **Unsupervised Learning:** The algorithm is given raw, unlabelled data and must find hidden structures or groupings on its own. Common uses include Clustering (grouping similar customers) or Anomaly Detection (finding fraudulent transactions).
        
- **Core Algorithms:**
    
    - **Logistic Regression:** A foundational classification algorithm. It processes inputs through a mathematical S-curve (Sigmoid function) to output a probability between 0 and 1, creating a strict dividing line (decision boundary) between two classes.
        
    - **Support Vector Machines (SVM):** This algorithm plots data points in space and calculates a hyperplane—the widest possible "street" that separates different categories. If data cannot be separated by a straight line, it uses a "Kernel Trick" to mathematically project the data into higher dimensions where a straight division becomes possible.
        
    - **Naive Bayes:** A fast, probabilistic classifier based on Bayes' Theorem. It is "naive" because it assumes every feature (e.g., every word in an email) is completely independent of the others, which simplifies the math.
        
    - **Deep Learning (RNNs & Diffusion):** Recurrent Neural Networks (RNNs) and their variants (LSTMs, GRUs) are designed for sequential data like text. They maintain a hidden state that acts as short-term memory. Generative Diffusion models, used for image creation, are trained by systematically destroying an image with static noise (Forward Process) and then learning the exact mathematical steps to reverse that noise and reconstruct the image (Reverse Process).
        

### 2. Core AI Adversarial Concepts

Traditional cybersecurity red teaming targets infrastructure (system access, network persistence). AI red teaming specifically targets the logic, decision-making, and output of the model itself.

- **NVIDIA AI Kill Chain:** A structured framework for mapping AI attacks.
    
    1. **Recon:** Gathering intelligence on the target model's architecture or API parameters.
        
    2. **Poison:** Compromising the initial training data.
        
    3. **Hijack:** Taking control of the model's outputs.
        
    4. **Persist:** Establishing long-term access, often via backdoors.
        
    5. **Impact:** Executing the final objective (e.g., data theft, system sabotage).
        
- **ML OWASP Top 10 Highlights:**
    
    - **ML01 (Input Manipulation):** Modifying the data sent to a live model to cause a misclassification.
        
    - **ML02 (Data Poisoning):** Injecting malicious data points into the training dataset so the model learns incorrect behaviors from the start.
        
    - **ML03 (Model Inversion):** Interrogating the model to extract and reconstruct the sensitive, private data it was originally trained on.
        
    - **ML04 (Membership Inference):** Analyzing model outputs to confirm whether a specific individual's data was used in the training dataset, which is a privacy violation.
        

## Part 2: AI Evasion & Inference Attacks

### 1. The Evasion Paradigm (ML OWASP 01)

Evasion attacks occur exclusively during the **inference phase**. Inference is the period when a model is deployed in production and actively making predictions on new data. You do not alter the training data or the model's internal programming.

- **The Objective:** You introduce controlled mathematical modifications (perturbations) to an input. To a human, the input looks normal (e.g., an image of a stop sign). To the machine, the mathematical noise pushes the data point across the "decision boundary," forcing the model to categorize it incorrectly (e.g., classifying the stop sign as a speed limit sign).
    
- **Transferability:** A vulnerability in one model often exists in similar models. Attackers can download an open-source model, test their attacks locally (a "shadow" model), and deploy the successful attacks against a remote, proprietary production model.
    
- **Traditional ML vs. LLMs:** In systems like spam filters, evasion relies on manipulating fixed mathematical word frequencies. In Large Language Models (LLMs), evasion takes the form of Prompt Injection, where the attacker uses language to manipulate the model's conversational state and bypass its security instructions.
    

### 2. White-Box Evasion: The GoodWords Attack

"White-Box" means the attacker has complete access to the model's internal code, weights, and mathematical parameters. This specific attack targets Naive Bayes spam classifiers.

Instead of hiding spam keywords (like spelling "FREE" as "FR33"), you keep the spam intact. Because Naive Bayes assumes all words are independent, you simply append a long list of highly-rated legitimate words (e.g., "meeting", "thanks") to dilute the spam score.

**The Math (Log Probabilities):**

Naive Bayes calculates the total probability by adding the log-probabilities of individual words. This prevents the numbers from becoming too small for a computer to process (numerical underflow).

$$\log P(\text{spam}|M_{\text{augmented}}) = \log P(\text{spam}) + \sum \log P(w_i|\text{spam}) + \sum \log P(g_j|\text{spam})$$

- $w_i$: Malicious spam words that push the score toward Spam.
    
- $g_j$: Appended "good words" that push the score toward Ham (Benign).
    

|**Spam Evidence**|**Ham (Benign) Evidence**|
|---|---|
|"FREE", "WINNER"|"meeting", "thanks", "tomorrow"|
|Score: 8.0|Score: $3.0 + 3.0 + 3.0 = 9.0$|
|**Result**|**Scale tips. The combined message is marked as safe.**|

Because you have White-Box access, you can calculate the exact numerical weight of every word in the dictionary and perfectly select the combination that guarantees evasion.

### 3. Black-Box Evasion: Query Optimization

"Black-Box" means the attacker has no internal access. You only have an API that takes an input and returns a spam probability score. Every test query costs computing power and increases the risk of the system blocking your IP.

To find the best "good words" efficiently, you apply the **Multi-Armed Bandit** framework. This is a statistical concept named after a gambler facing multiple slot machines with unknown payout rates. The attacker must balance two actions:

1. **Exploration:** Testing completely new words to see if they reduce the spam score.
    
2. **Exploitation:** Re-using the known successful words to guarantee the final attack works.
    

**The Upper Confidence Bound (UCB) Strategy:**

This algorithm calculates a score for every word in your dictionary to decide what to test next:

$$UCB_w = \bar{r}_w + c\sqrt{\frac{\ln(t)}{n_w}}$$

- $\bar{r}_w$: The average amount this word has reduced the spam score so far (Exploitation).
    
- $c\sqrt{\frac{\ln(t)}{n_w}}$: The uncertainty bonus. $n_w$ is the number of times you've tested the word. If $n_w$ is low, this fraction becomes larger. This mathematically forces your script to eventually test words it has ignored (Exploration).
    

**The Three-Phase Discovery Algorithm:**

To maximize efficiency with a strict limit (e.g., 1000 API calls), split your script into phases:

1. **Exploration (40%):** Test a wide variety of words from a dictionary to gather baseline data on what works.
    
2. **Exploitation (40%):** Stop testing new words. Repeatedly test the top-performing words to calculate their exact impact score.
    
3. **Combination Search (20%):** Test the top words grouped together. Words often interact in ways that lower the spam score significantly more than the sum of their individual scores.
    

### 4. Advanced Black-Box GoodWords Nuances

When coding the Black-Box attack, these factors determine success or failure:

- **Message Vulnerability Variance:** Not all messages are equally difficult to push past the filter. A borderline spam message (probability 0.75) may require appending 5 words to drop below the 0.5 safe threshold. A severe spam message (probability 0.99) containing currency symbols and heavy capitalization requires overwhelming evidence (15+ words) to bypass the math.
    
- **Candidate Vocabulary Building:** A dictionary of formal English is insufficient. Attackers merge formal words with conversational terms (like "tomorrow") and informal contractions ("dont", "ill"). This mimics legitimate human communication patterns, which spam filters are explicitly trained to allow through.
    
- **Exponential Moving Average (EMA) Alpha Tuning:** When refining a word's score in the Exploitation phase, use an EMA. Set the learning rate ($\alpha$) to 0.3. This means a new API result influences the current score by 30%, while the historical average retains 70% of the influence. This prevents a single strange API response from ruining your data.
    

### 5. Tactical Evasion: Algorithms & Tooling

To execute evasion attacks on complex, high-dimensional data like images, audio, or network packets, raw text manipulation fails. You must use specialized Python libraries designed to calculate mathematical gradients.

**Key Libraries:**

- Adversarial Robustness Toolbox (ART)
    
- CleverHans
    
- Foolbox
    

**Core Algorithms:**

A "gradient" is a mathematical vector that points in the direction of the steepest slope. In AI attacks, you calculate the gradient of the model's error rate to find out exactly how to alter the input to cause a failure.

- **FGSM (Fast Gradient Sign Method):** A white-box attack. It calculates the gradient once and applies a single, fast mathematical change (perturbation) to the entire input file. It is computationally cheap but less precise.
    
- **PGD (Projected Gradient Descent):** The standard white-box evasion attack. It is an iterative loop. It calculates the gradient, takes a tiny step to increase the error, re-evaluates the gradient, and repeats. After every step, it projects the data back into a constrained boundary to guarantee the modifications remain entirely invisible to the human eye.
    

## Part 3: Practical Execution

### 1. GoodWords Challenge API Surface

To execute evasion programs via automation, scripts must be configured to interact with predefined endpoints. An API (Application Programming Interface) allows your Python code to communicate directly with the target server.

- `GET /challenge`: Retrieves the parameters for the attack. It outputs the base spam message, the exact number of words you are allowed to add (`max_added_words`), and the required classification target ("ham").
    
- `POST /predict`: The testing endpoint (the oracle). You send individual words or combinations here. The server responds with the current classification label and the exact numerical spam probability.
    
- `POST /submit`: The final execution endpoint. The server validates that the payload text strictly equals the original message plus the appended words. If evasion is successful, the server returns the capture flag.
    

### 2. Results Persistence

Professional AI security assessments require strict documentation. Black-Box discovery scripts must automatically log all data to a structured format like JSON (JavaScript Object Notation). The `results.json` file must capture:

- White-box mathematical baselines.
    
- Total black-box API queries consumed.
    
- The final list of optimal "good words."
    
- The individual numerical impact of each tested word.
    

This ensures the attack path is mathematically reproducible by the defensive Blue Team.

### 3. Required Reading

To understand the mathematical proofs behind the implemented algorithms, review the foundational literature:

- **Textbook:** Sotiropoulos, _Adversarial AI Attacks, Mitigations and Defense Strategies_, Chapters 5–7.
    
- **Research Paper (FGSM):** Goodfellow et al. (2015), outlining the underlying logic of the Fast Gradient Sign Method.
    
- **Research Paper (PGD):** Madry et al. (2018), establishing Projected Gradient Descent as the most reliable first-order evasion technique.