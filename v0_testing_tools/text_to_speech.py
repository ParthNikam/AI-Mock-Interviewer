import os
import requests
import subprocess
import time
from dotenv import load_dotenv

load_dotenv()
DG_API_KEY = os.getenv("DEEPGRAM_API_KEY")


def send_tts_request(text):
    url = "https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=linear16&sample_rate=24000"
    headers = {
        "Authorization": f"Token {DG_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"text": text}

    # 1. We change stderr to PIPE so we can read the error
    cmd = [
        "ffplay",
        "-autoexit",
        "-",
        "-nodisp",
        "-f",
        "s16le",
        "-ar",
        "24000",
    ]
    proc = subprocess.Popen(
        cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE
    )

    try:
        with requests.post(url, stream=True, headers=headers, json=payload) as r:
            if r.status_code != 200:
                print(f"API Error: {r.text}")
                return

            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    # 2. Check if proc is still alive before writing
                    if proc.poll() is not None:
                        # If it died, grab the error message
                        stderr_output = proc.stderr.read().decode()
                        print(f"ffplay died with error:\n{stderr_output}")
                        return

                    proc.stdin.write(chunk)
                    proc.stdin.flush()
    except BrokenPipeError:
        print("Broken pipe: ffplay closed unexpectedly.")
    finally:
        if proc.stdin:
            proc.stdin.close()
        proc.wait()


send_tts_request("Testing one two three. If you hear this, the stream is working.")
