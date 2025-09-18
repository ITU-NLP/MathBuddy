[Overview](../README.md) | [Frontend](../frontend/README.md) | [Backend](./README.md)
___

# Backend

This project implements the all the logic concerned with processing student conversations and generating tutor responses, including a simple REST API to access all this functionality via HTTP requests.


## Requirements 

- Python 3.12 (https://www.python.org/downloads/release/python-3128/)
- A HuggingFace Token
- A Google AI Studio API Key
- A valid ENV file
- The pre-trained MathBuddy models (https://drive.google.com/file/d/118xOblV49wwhwhkuGZ4o45w2w5JsVGOi)


## PyTorch

If CUDA is to be utilized, torch has to be installed with the correct CUDA version to function correctly.
For example, for CUDA 11.8 install Torch via ```pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118```
If the system does not support CUDA or CUDA should not be used, just ignore this step and the non-CUDA version of torch will be used automatically.


## Environment file (ENV)

The environment file should define the following values:
  - HF_TOKEN="<your HuggingFace Token>"
  - GOOGLE_AI_API_KEY="<your Google API Token>"
  - MODELS_ROOT="<path to the directory containing the pre-trained models>"


## Pre-trained Models

The pre-trained models employed by the system can be downloaded here: https://drive.google.com/file/d/118xOblV49wwhwhkuGZ4o45w2w5JsVGOi.
This ZIP file contains the folder structure and models expected by the backend.
The MODELS_ROOT environment variable should point at he extracted models directory, which can be placed anywhere on the system. 
Changing the internal folder structure of this models directory will cause the backend to not function.


## Initial Setup


1. Create a virtual environment of choice
2. Activate the environment
3. Navigate to the backend directory
4. Install the project as a package via `pip install .`

## Starting the Backend Server

Run the backend script `python src/tutor/backend/backend.py`
