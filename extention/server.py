from flask import Flask, request, jsonify
from flask_cors import CORS
from llama_cpp import Llama
import time

# ============================================================
# CONFIG
# ============================================================

MODEL_PATH = "/home/souvik/Desktop/AI-for-exam-main/qwen7b/qwen2.5-7b-instruct-q3_k_m.gguf"

SYSTEM_PROMPT = """You are a Java programming expert.
Analyze the Java MCQ carefully. Think about Java syntax, rules, and behavior.
Reply with ONLY one letter: A, B, C, or D. Nothing else."""

# ============================================================
# LOAD MODEL
# ============================================================

print("Loading model...")
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=4,
    n_gpu_layers=0,
    verbose=False,
)
print("Model ready!")

# ============================================================
# FLASK SERVER
# ============================================================

app = Flask(__name__)
CORS(app)   # allow Chrome extension to connect

@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "No question"}), 400

    prompt = f"""<|im_start|>system
{SYSTEM_PROMPT}<|im_end|>
<|im_start|>user
{question}

Correct answer (A/B/C/D):<|im_end|>
<|im_start|>assistant
"""

    start = time.perf_counter()

    response = llm(
        prompt,
        max_tokens=8,
        temperature=0.0,
        stop=["<|im_end|>", "\n\n"],
        echo=False,
    )

    elapsed = time.perf_counter() - start
    raw = response["choices"][0]["text"].strip().upper()

    answer = "?"
    for ch in raw:
        if ch in ("A", "B", "C", "D"):
            answer = ch
            break

    print(f"Q: {question[:60]}...")
    print(f"A: {answer} ({elapsed:.2f}s)")

    return jsonify({"answer": answer, "time": round(elapsed, 2)})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    print("Server running at http://localhost:5000")
    app.run(host="127.0.0.1", port=5000)