import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq
from dotenv import load_dotenv
import uvicorn


load_dotenv()

app = FastAPI()


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_PATH = os.path.join(BASE_DIR, "dist")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
ENV = os.environ.get("ENV")
MAX_CHAT_HISTORY = 3


if ENV != "production":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )


client = Groq(api_key=os.environ.get(GROQ_API_KEY))


class HistoryMessage(BaseModel):
    sender: str
    text: str


class ChatRequest(BaseModel):
    name: str
    message: str
    history: list[HistoryMessage] = Field(default_factory=list)


@app.post("/api/chat")
async def chat(req: ChatRequest):
    print(req)
    if not req.name or not req.message:
        raise HTTPException(status_code=400, detail="Cat name and message are required.")


    llm_messages = [
        {
            "role": "system",
            "content": (
                "You are a talking cat speaking to your caretaker owner. "
                "Keep your response in character. "
                "Respond ONLY with a JSON object with two fields: "
                '"response" (string): your response as a cat and '
                '"happiness" (integer 0-10): how much you like your owners message.'
            ),
        }
    ]

    for msg in req.history[-MAX_CHAT_HISTORY:]:
        llm_messages.append({
            "role": "assistant" if msg.sender == "cat" else "user",
            "content": msg.text,
        })

    llm_messages.append({
        "role": "user",
        "content": f'you are a cat that might get eaten, your name is: "{req.name}", owner sends you this message: "{req.message}"',
    })

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=llm_messages,
        )

        text = completion.choices[0].message.content
        if not text:
            raise ValueError("Empty response from Groq API")

        return json.loads(text.strip())

    except Exception as err:
        print(err)
        err_str = str(err).lower()
        if any(w in err_str for w in ["overloaded", "high demand", "busy", "capacity", "temporary", "unavailable"]):
            error_msg = "the model is experiencing high demand"
        elif any(w in err_str for w in ["quota", "exhausted", "limit", "rate", "429"]):
            error_msg = "quota reached"
        else:
            error_msg = "unknown error"
        raise HTTPException(status_code=500, detail=error_msg)


if ENV == "production" and os.path.isdir(DIST_PATH):
    app.mount(
        "/",
        StaticFiles(directory=DIST_PATH, html=True),
        name="dist",
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    is_dev = ENV != "production"
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=is_dev)