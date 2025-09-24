[Overview](../README.md) | [Frontend](../frontend/README.md) | [Backend](./README.md) | [Dataset](../annotation/README.md)
___

# Backend

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg?style=flat&logo=python)](https://www.python.org/)

This component implements all the logic concerned with processing student conversations and generating tutor responses, including a simple REST API to access all this functionality via HTTP requests.


## Requirements 

- Python 3.12 (https://www.python.org/downloads/release/python-3120/)
- An active HuggingFace token
- An active Google AI Studio API key
- A valid `ENV` file (see the [Environment file section](#environment-file-env) for details)
- The pre-trained MathBuddy models (https://drive.google.com/file/d/118xOblV49wwhwhkuGZ4o45w2w5JsVGOi)


## Environment file (ENV)

The environment file specifies constants that the backend needs to operate correctly.
These constants either depend on the target machine or are too sensitive to be strictly defined within code.

The environment file should be placed within the backend directory (`backend/.env`) and needs to define the following values:
  - HF_TOKEN="\<Your HuggingFace Token\>"
  - GOOGLE_AI_API_KEY="\<Your Google API Token\>"
  - MODELS_ROOT="\<path to the directory containing the pre-trained models\>"

An environment file including placeholder values is included in this repository.


## Pre-trained Models

The pre-trained models employed by the system can be downloaded here: https://drive.google.com/file/d/118xOblV49wwhwhkuGZ4o45w2w5JsVGOi.
This ZIP file contains the folder structure and models expected by the backend.
The `MODELS_ROOT` environment variable should point to he extracted models directory, which can be placed anywhere on the system. 
Changing the internal folder structure of this model's directory will cause the backend to not function.


## Initial Setup

1. Create a virtual environment of choice
2. Activate the environment
3. Navigate to the backend directory
4. _(Optional)_ Install PyTorch to support a desired device (see the [PyTorch section](#pytorch) for details)
4. Install the project as a package via `pip install .`


## PyTorch

If CUDA is to be utilized, PyTorch must be installed with the correct CUDA version to function properly.
For example, for CUDA 11.8 install Torch via ```pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118```
If the system does not support CUDA or CUDA should not be used, this step can be ignored as the non-CUDA version of torch will be used automatically.


## Starting the Backend Server

Run the backend script `python src/tutor/backend/backend.py`.
