from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func # NAYA: Stats count karne ke liye
import regex
import spacy # NLP Library
import os
from dotenv import load_dotenv

from database import engine, Base, get_db
from models import PromptLog

# .env file load karna
load_dotenv()

# NLP Model Load karna (Startup par ek dafa load hoga)
nlp = spacy.load("en_core_web_sm")

app = FastAPI(title="CerebraOS AI Firewall")
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Data Models ---
class PromptRequest(BaseModel):
    user_id: str
    prompt: str
    target_ai: str = "openai"

class PromptResponse(BaseModel):
    original_prompt: str
    sanitized_prompt: str
    action_taken: str
    blocked: bool
    message: str

# --- 2. The AI Scanner Engine (Hybrid Regex + NLP) ---
def scan_and_sanitize(text: str):
    sanitized_text = text
    actions = []
    
    # LAYER 1: Strict Regex (NLP se pehle yeh sab mask karna)
    
    # 1. URLs (LinkedIn, GitHub, etc.)
    url_regex = r'(https?://[^\s]+|www\.[^\s]+|linkedin\.com/[^\s]+|github\.com/[^\s]+)'
    if regex.search(url_regex, sanitized_text):
        sanitized_text = regex.sub(url_regex, '[URL_MASKED]', sanitized_text)
        actions.append("Social/URL Masked")

    # 2. Emails (Improved)
    email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    if regex.search(email_regex, sanitized_text):
        sanitized_text = regex.sub(email_regex, '[EMAIL_MASKED]', sanitized_text)
        actions.append("Email Masked")

    # 3. Phone Numbers (Strict International - +92 300 1234567 catch karega)
    phone_regex = r'(\+?\d{1,3}[-.\s]??\d{3}[-.\s]??\d{7})'
    if regex.search(phone_regex, sanitized_text):
        sanitized_text = regex.sub(phone_regex, '[PHONE_MASKED]', sanitized_text)
        actions.append("Phone Number Masked")

    # 4. CNIC (Pakistani Format - 35202-1234567-1)
    cnic_regex = r'\b\d{5}-\d{7}-\d{1}\b'
    if regex.search(cnic_regex, sanitized_text):
        sanitized_text = regex.sub(cnic_regex, '[CNIC_MASKED]', sanitized_text)
        actions.append("CNIC Masked")

    # 5. Bank Accounts (12-16 digits sequence)
    bank_regex = r'\b\d{12,16}\b'
    if regex.search(bank_regex, sanitized_text):
        sanitized_text = regex.sub(bank_regex, '[BANK_ACC_MASKED]', sanitized_text)
        actions.append("Bank Account Masked")

    # 6. API Keys
    api_key_regex = r'sk-[A-Za-z0-9]{20,}'
    if regex.search(api_key_regex, sanitized_text):
        sanitized_text = regex.sub(api_key_regex, '[API_KEY_MASKED]', sanitized_text)
        actions.append("API Key Masked")

    # LAYER 2: Restricted NLP (Sirf Naam aur Location dhoondhna)
    doc = nlp(sanitized_text)
    entities_found = []
    
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            entities_found.append((ent.start_char, ent.end_char, "[NAME_MASKED]", "Person Name"))
        elif ent.label_ == "GPE": # Geopolitical Entity (Countries, Cities)
            entities_found.append((ent.start_char, ent.end_char, "[LOCATION_MASKED]", "Location"))

    # NLP entities ko reverse order mein replace karna
    for start, end, mask, action in sorted(entities_found, key=lambda x: x[0], reverse=True):
        sanitized_text = sanitized_text[:start] + mask + sanitized_text[end:]
        actions.append(action + " Masked")

    # LAYER 3: Policy Block (Source Code)
    if "def " in text and "class " in text and "import " in text:
        return None, ["Source Code Sharing Blocked"]

    if not actions:
        actions.append("No sensitive data found. Passed through.")

    return sanitized_text, actions

# --- 3. The Proxy Endpoint (With Real AI Forwarding) ---
@app.post("/api/v1/process-prompt", response_model=PromptResponse)
async def process_prompt(request: PromptRequest, db: Session = Depends(get_db)):
    sanitized_prompt, actions = scan_and_sanitize(request.prompt)
    
    if sanitized_prompt is None:
        db_log = PromptLog(
            user_id=request.user_id,
            original_prompt=request.prompt,
            sanitized_prompt="",
            action_taken="; ".join(actions),
            blocked=True
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        
        return PromptResponse(
            original_prompt=request.prompt,
            sanitized_prompt="",
            action_taken="; ".join(actions),
            blocked=True,
            message="🚨 CerebraOS Policy Violation: Sharing source code is strictly prohibited!"
        )
    
    # Smart Routing Logic
    model_used = "gpt-3.5-turbo" if len(sanitized_prompt) < 50 else "gpt-4o"
    actions.append(f"Routed to {model_used} (Cost Saving)")

    # DB Save
    db_log = PromptLog(
        user_id=request.user_id,
        original_prompt=request.prompt,
        sanitized_prompt=sanitized_prompt,
        action_taken="; ".join(actions),
        blocked=False
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    # --- Real AI Forwarding Logic ---
    ai_response_text = ""
    api_key = os.getenv("OPENAI_API_KEY")
    
    # Agar user ne asli API key .env mein di hai
    if api_key and api_key != "your_openai_api_key_here":
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            completion = client.chat.completions.create(
                model=model_used,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": sanitized_prompt}
                ]
            )
            ai_response_text = completion.choices[0].message.content
        except Exception as e:
            ai_response_text = f"AI Error: {str(e)}"
    else:
        # Agar API key nahi hai, toh dummy response (Mocking)
        ai_response_text = f"[MOCK AI RESPONSE] I received your safe prompt: '{sanitized_prompt}'. How can I help you with this today?"

    # AI Response ko action mein add kar dena taake frontend par dikhe
    actions.append(f"AI Replied: {ai_response_text[:50]}...") 

    return PromptResponse(
        original_prompt=request.prompt,
        sanitized_prompt=sanitized_prompt,
        action_taken="; ".join(actions),
        blocked=False,
        message=ai_response_text # Yahan asli AI ka jawab jayega
    )

# --- 4. Logs Fetch Endpoint ---
@app.get("/api/v1/logs")
def get_logs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(PromptLog).order_by(PromptLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs

# --- 5. Stats Endpoint (Dynamic Dashboard Data) --- NAYA ADD KIYA
@app.get("/api/v1/stats")
def get_stats(db: Session = Depends(get_db)):
    total_prompts = db.query(PromptLog).count()
    threats_blocked = db.query(PromptLog).filter(PromptLog.blocked == True).count()
    
    # Dummy calculation for money saved (e.g., $3.5 saved per smart routing)
    money_saved = total_prompts * 3.5 
    
    return {
        "total_scanned": total_prompts,
        "threats_blocked": threats_blocked,
        "money_saved": round(money_saved, 2)
    }

@app.get("/")
def read_root():
    return {"status": "CerebraOS AI Firewall is Active 🛡️"}