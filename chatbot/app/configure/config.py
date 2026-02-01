from dotenv import load_dotenv
import os

load_dotenv()

# Load Gemini configuration
gemini_api_key = os.getenv("GEMINI_API_KEY")
gemini_model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set. Please ensure it is defined in your .env file.")

# Store configuration values
GEMINI_API_KEY = gemini_api_key
GEMINI_MODEL_NAME = gemini_model_name

# Import and configure the OpenAI agent SDK
from agents import RunConfig, set_default_openai_client, set_default_openai_api, set_tracing_disabled
from openai import AsyncOpenAI

gemini_base_url = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")

client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=gemini_base_url
)

set_default_openai_client(client)
set_default_openai_api("chat_completions")
set_tracing_disabled(True)

configure = RunConfig(
    model=GEMINI_MODEL_NAME,
)
