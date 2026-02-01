from langchain_core.messages import HumanMessage, AIMessage

def preprocess_messages(messages):
    """
    Preprocess a list of messages by trimming whitespace and normalizing text.
    Return messages in a format compatible with the frontend ChatInterface.
    """
    processed = []
    for msg in messages:
        # Convert to frontend-compatible format
        processed_msg = {
            "content": msg["content"],
            "type": msg["role"],  # human/assistant
            "role": "user" if msg["role"] == "human" else "assistant",
            "id": str(msg.get("id", "")),
            "timestamp": msg.get("created_at", msg.get("timestamp", ""))
        }
        processed.append(processed_msg)
    return processed