`README.md` Code:

```markdown
# 🛡️ CerebraOS: Enterprise AI Firewall & Data Leak Prevention

CerebraOS is a production-ready, B2B Enterprise SaaS that acts as a secure proxy gateway between enterprise employees and Large Language Models (LLMs like ChatGPT, Claude, etc.). It inspects prompts in real-time to prevent data leaks, mask sensitive PII (Personally Identifiable Information), enforce company policies, and optimize AI costs through smart routing.

![CerebraOS Dashboard](https://via.placeholder.com/1200x600/050508/4f46e5?text=CerebraOS+AI+Firewall+Dashboard) 
*(Note: Replace this link with a screenshot of your dashboard later)*

---

## 🚀 The Problem: "The Rogue AI & Data Leak Epidemic"
When employees use public AI tools (ChatGPT, Cursor, etc.) for work, they often inadvertently paste sensitive company data:
- Developers paste proprietary source code.
- HR pastes employee salaries, CNICs, or bank accounts.
- Marketing pastes client emails and phone numbers.

Once sent to public LLMs, this data is stored on their servers, creating massive **GDPR compliance risks**, **security breaches**, and **loss of intellectual property**. Companies have no visibility or control over this "Shadow AI" usage.

## 💡 The Solution: CerebraOS AI Gateway
CerebraOS sits between the employee and the AI. Instead of blocking AI entirely, it acts as a smart firewall:
1. **PII Redaction:** Automatically masks emails, phone numbers, API keys, bank accounts, and CNICs before they reach OpenAI.
2. **Policy Enforcement:** Detects and blocks the sharing of source code.
3. **Smart Routing:** Routes simple prompts to cheaper models (GPT-3.5) and complex ones to expensive models (GPT-4), saving up to 70% in API costs.

---

## ✨ Key Features

### 1. Hybrid AI Scanner Engine (NLP + Regex)
Instead of relying on dumb regex rules, CerebraOS uses a hybrid approach:
- **Layer 1 (Strict Regex):** Instantly catches strict patterns like API Keys, Credit Cards, Pakistani CNICs, and Bank Accounts.
- **Layer 2 (NLP / SpaCy):** Uses Natural Language Processing to understand context and mask Person Names and Geopolitical Locations (Cities/Countries).
- **Layer 3 (Policy Block):** Heuristic-based source code sharing detection.

### 2. Real-Time AI Proxying
Sanitized prompts are securely forwarded to OpenAI (or fallback mock AI) and the response is delivered back to the user seamlessly.

### 3. Dynamic 3D Enterprise Dashboard
A mind-blowing, Awwards-level UI built with Next.js, featuring:
- **React Three Fiber:** A live 3D AI Core that changes color (Indigo -> Red) and vibrates when a threat is detected.
- **Glassmorphism UI:** Premium dark-themed cybersecurity control room aesthetic.
- **Live Data:** Real-time stats showing Total Prompts Scanned, Threats Blocked, and Money Saved.

### 4. Database Logging & Auditing
Every prompt (blocked or passed) is stored in a database (SQLAlchemy/SQLite) with timestamps, allowing security teams to audit employee AI activity later.

---

## 🛠️ Tech Stack

**Frontend (The Dashboard)**
- ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
- ![React](https://img.shields.io/badge/React-19-blue?logo=react)
- ![Three.js](https://img.shields.io/badge/Three.js-3D-green?logo=three.js)
- ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwind-css)

**Backend (The Firewall Engine)**
- ![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
- ![SpaCy](https://img.shields.io/badge/SpaCy-NLP-09A3D5?logo=spacy)
- ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-DB-D71F00?logo=sqlalchemy)
- ![OpenAI](https://img.shields.io/badge/OpenAI-Proxy-412991?logo=openai)

---

## ⚙️ Getting Started (Local Setup)

### 1. Backend Setup (FastAPI)
```bash
cd cerebra-frontend/cerebra-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Setup Environment
echo "OPENAI_API_KEY=your_key_here" > .env

# Run the server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup (Next.js)
```bash
cd cerebra-frontend
npm install

# Setup Environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the development server
npm run dev
```
Visit `http://localhost:3000` to see the dashboard live.

---

## 🧪 Test the Firewall
Try pasting these prompts in the scanner to see CerebraOS in action:

1. **PII Masking:** 
   `"My name is Ahmed Khan, contact me at ahmed@test.com or +92 300 1234567. My CNIC is 35202-1234567-1."`
   *(Result: Names, Emails, Phones, and CNICs will be masked before sending to AI).*

2. **Source Code Block:** 
   `"import fastapi \n class MyApp: \n def run():"`
   *(Result: Request will be blocked entirely due to source code policy).*

---

## 👨‍💻 Author

**Asad Ashraf** - AI/ML Focused Software Engineer
- LinkedIn: [asad-ashraf](https://linkedin.com/in/asad-ashraf-8
4840127a)
- GitHub: [Asduuu](https://github.com/Asduuu)

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
```

---

