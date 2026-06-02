import os
import requests
from dotenv import load_dotenv
load_dotenv()

key = os.getenv('OPENROUTER_API_KEY')
print('Key:', key[:20], '...')

resp = requests.post(
    'https://openrouter.ai/api/v1/chat/completions',
    headers={
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
    },
    json={
        'model': 'meta-llama/llama-3.3-70b-instruct',
        'messages': [{'role': 'user', 'content': 'hello'}]
    },
    timeout=15
)
print('Status:', resp.status_code)
print('Response:', resp.json()['choices'][0]['message']['content'])