# Replace Streamlit with HTML/CSS/JS Frontend

## Complete Setup Guide

## 📋 What We're using

**Frontend:** HTML/CSS/JS (modern web UI)
**Backend:** Keeping FastAPI
**Result:** Professional web interface for your RAG chatbot

## 📂Project Structure

```
RAG-scheduler/
├── api/
│   └── main.py              ← UPDATED (new CORS + endpoints)
├── app/
│   ├── config.py
│   ├── ingestor.py
│   ├── retriever.py
│   └── rag_chain.py
├── data/
│   └── Course_schedule.csv
├── vectorstore/             ← Auto-created after ingest
├── schedule_rag.html        ← NEW! (your HTML UI)
├── ingest.py
└── requirements.txt
```

---

## **Instructions**

### **Step 1: Prepare Your Project**

```bash
cd RAG-scheduler

# Make sure all Python packages installed
pip install -r requirements.txt

# Add CORS to requirements (if not already there)
pip install fastapi
```

### **Step 2: Start Everything**

**Terminal 1 - Start Ollama (if not running):**

```bash
ollama serve
```

**Terminal 2 - Start FastAPI Backend:**

```bash
cd /path/to/RAG-scheduler
uvicorn api.main:app --reload
```

Should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 3 - Open HTML File:**

Option A - Simple (recommended for development):

````bash
# Just open the file in your browser
open schedule_rag.html

## ✅ Testing the Setup

1. **Open the HTML file in browser**
   - You should see: "📚 Schedule RAG" header
   - Upload button should be enabled
   - Chat area should show welcome message

2. **Check Backend is Running**
   - Open browser console (F12)
   - Try to upload a CSV
   - Watch for network requests in Network tab

3. **Check API Connection**
   - Open http://localhost:8000 in browser
   - Should see JSON response with endpoints
   - Open http://localhost:8000/status
   - Should return: `{"vectorstore_exists": false, ...}`

4. **Test Upload**
   - Click "📤 Upload CSV" button
   - Select your `Course_schedule.csv`
   - Wait for "Loading Schedule..." modal to finish
   - You should see success message

5. **Test Chat**
   - Type a question: "When is my AI class?"
   - Click Send
   - You should get a response!

---

## 🔧 File Upload Behavior

The HTML frontend supports two scenarios:

### **Scenario A: First Time Using**
1. Click "📤 Upload CSV"
2. Select your schedule file
3. Backend processes it and creates vectorstore
4. Chat becomes enabled
5. Start asking questions

### **Scenario B: CSV Already Processed**
1. Open the HTML file
2. Page automatically detects vectorstore exists
3. Chat is immediately enabled
4. Start asking questions

---

## 🎨 Customizing the HTML

### **Change Colors**

In the `<style>` section, modify these variables:

```css
:root {
    --primary: #6366f1;        /* Main color */
    --secondary: #ec4899;      /* Accent color */
    --bg: #0f172a;             /* Dark background */
    --text: #f1f5f9;           /* Light text */
}
````

Example - Change to green theme:

```css
--primary: #10b981; /* Green */
--secondary: #34d399; /* Light green */
```

### **Change Title and Greeting**

```html
<h1>📚 My Course Assistant</h1>
<p>Ask me about my schedule</p>
```

### **Change Placeholder Text**

```html
<input
  type="text"
  placeholder="Ask about your schedule... (your custom text)"
/>
```

---

## 🔌 API Endpoints Reference

Your backend now has these endpoints:

### **GET /status**

Check if CSV is already loaded

```javascript
fetch("http://localhost:8000/status")
  .then((r) => r.json())
  .then((data) => console.log(data));
// {"vectorstore_exists": true, "message": "..."}
```

### **POST /ingest**

Upload and process a CSV file

```javascript
const formData = new FormData();
formData.append("file", file);

fetch("http://localhost:8000/ingest", {
  method: "POST",
  body: formData,
})
  .then((r) => r.json())
  .then((data) => console.log(data));
```

### **POST /ask**

Ask a question about the schedule

```javascript
fetch("http://localhost:8000/ask", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "When is my AI class?" }),
})
  .then((r) => r.json())
  .then((data) => console.log(data));
// {"response": "...", "source_documents": [...]}
```

---

## 🐛 Troubleshooting

### **Problem: CORS Error**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix:** Make sure you updated `api/main.py` with the CORS middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    ...
)
```

### **Problem: Backend Not Found**

```
Failed to fetch from http://localhost:8000
```

**Fix:**

1. Check if FastAPI is running: `uvicorn api.main:app --reload`
2. Check port 8000 is not blocked: `lsof -i :8000`
3. Try different port: `uvicorn api.main:app --port 8001`
4. Update API_URL in HTML: `const API_URL = 'http://localhost:8001'`

### **Problem: CSV Upload Fails**

```
Error loading file: HTTP 500
```

**Fix:**

1. Check if vectorstore path exists: `mkdir -p vectorstore`
2. Check CSV format is correct
3. Check Ollama is running: `ollama serve`
4. Look at backend terminal for error messages

### **Problem: No Response from LLM**

```
Timeout or no answer received
```

**Fix:**

1. Check if Ollama is running
2. Check if model is downloaded: `ollama list`
3. Try pulling model again: `ollama pull llama2`
4. Check if Ollama can respond: `ollama run llama2 "hello"`

### **Problem: File Upload Progress Stuck**

**Fix:**

1. Check backend terminal for errors
2. Close browser, try again
3. Check file size (should be small)
4. Try with different CSV file

---

## 📱 Mobile Support

The HTML interface is responsive and works on mobile!

**On mobile:**

- Sidebar is hidden
- Input area is full width
- Touch-friendly buttons
- Optimized chat layout

Test on mobile:

1. Open developer tools (F12)
2. Click device toggle (phone icon)
3. Select iPhone or Android
4. Test chat and file upload

---

## 🚀 Deploy to the Internet

Once working locally, you can deploy!

### **Option 1: Deploy Frontend to Vercel (Free)**

1. Create a GitHub repo with your HTML file
2. Go to vercel.com
3. Import GitHub repo
4. Done! It's live

Update API_URL to your backend:

```javascript
const API_URL = "https://your-backend.fly.dev"; // or wherever you host FastAPI
```

### **Option 2: Deploy Backend to Fly.io (Free)**

1. Install flyctl: https://fly.io/docs/getting-started/
2. Run: `fly launch`
3. Run: `fly deploy`
4. Get URL from fly.io
5. Update API_URL in HTML

### **Option 3: Deploy Both to Railway.app**

1. Create Railway.app account
2. Connect GitHub
3. Deploy both frontend and backend
4. Set environment variables

---

## 📝 Next Steps

1. ✅ Update `api/main.py` with new code
2. ✅ Save `schedule_rag.html` to project
3. ✅ Run `uvicorn api.main:app --reload`
4. ✅ Open `schedule_rag.html` in browser
5. ✅ Upload CSV and test chat
6. ✅ Customize colors and text
7. 🚀 Deploy online (optional)

---

## 💡 Pro Tips

1. **Save API_URL as environment variable** (for production)
2. **Add authentication** (if needed)
3. **Add analytics** (track usage)
4. **Cache responses** (faster subsequent queries)
5. **Add dark/light mode toggle** (user preference)
6. **Export chat history** (allow users to download)
7. **Rate limiting** (protect backend from spam)
8. **Use WebSocket for real-time** (if lots of users)

---

Good luck! 🎉 Let me know if you hit any issues!
