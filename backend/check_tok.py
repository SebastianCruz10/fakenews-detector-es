from huggingface_hub import hf_hub_download 
import json 
path = hf_hub_download('SebastianCruz10/fakenews-mrbert-es-E1', 'tokenizer_config.json') 
config = json.load(open(path)) 
print(config.get('tokenizer_class')) 
print(config.get('model_type')) 
