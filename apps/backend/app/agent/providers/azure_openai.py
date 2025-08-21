import os
import logging
from typing import Any, Dict

from fastapi.concurrency import run_in_threadpool
from openai import AzureOpenAI

from ..exceptions import ProviderError
from .base import Provider, EmbeddingProvider
from ...core import settings

logger = logging.getLogger(__name__)


class AzureOpenAIProvider(Provider):
    def __init__(
        self,
        api_key: str | None = None,
        model_name: str = settings.LL_MODEL,
        api_endpoint: str | None = None,
        api_version: str | None = None,
        opts: Dict[str, Any] | None = None,
    ):
        if opts is None:
            opts = {}

        api_key = (
            api_key
            or settings.LLM_API_KEY
            or os.getenv("AZURE_OPENAI_API_KEY")
        )
        if not api_key:
            raise ProviderError("Azure OpenAI API key is missing")

        azure_endpoint = (
            api_endpoint
            or settings.LLM_BASE_URL
            or os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        if not azure_endpoint:
            raise ProviderError("Azure OpenAI endpoint is missing")

        api_version = api_version or os.getenv("AZURE_OPENAI_API_VERSION")

        self._client = AzureOpenAI(
            api_version=api_version,
            azure_endpoint=azure_endpoint,
            api_key=api_key,
        )
        logger.info(f"Azure OpenAI Provider initialized with model: {model_name}")
        self.model = model_name
        self.opts = opts
        self.instructions = ""

    def _generate_sync(self, prompt: str, options: Dict[str, Any]) -> str:
        try:
            # Prepare messages with system instructions and user prompt
            messages = []
            
            # Add system message if instructions are provided
            messages.append({
                    "role": "system",
                    "content": prompt,
                })
            
            # Add user prompt
            messages.append({
                "role": "user",
                "content": "Help me with my resume",
            })

            response = self._client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=options.get("temperature", 0),
                top_p=options.get("top_p", 0.9)
            )
            logger.info(f"Azure OpenAI Provider response: {response.choices[0].message.content}")
            return response.choices[0].message.content
        except Exception as e:
            raise ProviderError(f"Azure OpenAI - error generating response: {e}") from e


    async def __call__(self, prompt: str, **generation_args: Any) -> str:
        if generation_args:
            logger.warning(f"AzureOpenAIProvider - generation_args not used {generation_args}")
        myopts = {
            "temperature": self.opts.get("temperature", 0),
            "top_p": self.opts.get("top_p", 0.9),
            # top_k not supported by OpenAI/Azure models; max_tokens omitted to mirror OpenAIProvider
        }
        return await run_in_threadpool(self._generate_sync, prompt, myopts)


class AzureOpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(
        self,
        api_key: str | None = None,
        embedding_model: str = settings.EMBEDDING_MODEL,
        *,
        azure_endpoint: str | None = None,
        api_version: str | None = None,
    ):
        api_key = (
            api_key
            or settings.EMBEDDING_API_KEY
            or os.getenv("AZURE_OPENAI_API_KEY")
            or os.getenv("OPENAI_API_KEY")
        )
        if not api_key:
            raise ProviderError("Azure OpenAI API key is missing")
        azure_endpoint = (
            azure_endpoint
            or settings.EMBEDDING_BASE_URL
            or settings.LLM_BASE_URL
            or os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        if not azure_endpoint:
            raise ProviderError("Azure OpenAI endpoint is missing")
        api_version = api_version or os.getenv("AZURE_OPENAI_API_VERSION") or "2024-12-01-preview"

        self._client = AzureOpenAI(
            api_version=api_version,
            azure_endpoint=azure_endpoint,
            api_key=api_key,
        )
        self._model = embedding_model

    async def embed(self, text: str) -> list[float]:
        try:
            response = await run_in_threadpool(
                self._client.embeddings.create, input=text, model=self._model
            )
            return response.data[0].embedding
        except Exception as e:
            raise ProviderError(f"Azure OpenAI - error generating embedding: {e}") from e