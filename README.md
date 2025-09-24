[Overview](./README.md) | [Frontend](./frontend/README.md) | [Backend](./backend/README.md) | [Dataset](./annotation/README.md)
___

# MathBuddy

[![ArXiv](https://img.shields.io/badge/ArXiv-2508.19993-red?style=flat-square&logo=arxiv)](https://arxiv.org/abs/2508.19993)
[![Apache 2.0](https://img.shields.io/badge/License%20Code-Apache%202.0-blue.svg)][apache-2.0]
[![CC BY-SA 4.0](https://img.shields.io/badge/License%20Dataset-CC%20BY--SA%204.0-lightgrey.svg)][cc-by-sa]
[![Demo Video](https://img.shields.io/badge/YouTube-Demo-red?logo=youtube)](https://youtu.be/ZUjgmOw9GM0)

Public repository of the MathBuddy project.

This project has been conducted by a team of four researches, A, B, C, and D, under the supervision of E, F, G, and H.

Link to the showcase video: https://youtu.be/ZUjgmOw9GM0


## Installation

For installation instructions see:
- [Frontend Instructions](./frontend/README.md)
- [Backend Instructions](./backend/README.md)


## Dataset

The dataset contains 340 entries of the MathDial-Bridge dataset, which have been augmented with emotion ratings. Each sample is associated with one conversation history and adds annotations for the last student utterance in the respective conversation. These annotations consist of one of three emotion classes $C = \{engagement,\ neutral,\ boredom\}$ and a polarity rating within the intensities $I = \{1, 2, 3\}$, where $1$ = low, $2$ = moderate, and $3$ = high.
All annotations were manually created to ensure agreement within the Project Mathbuddy Team.

All data is provided via one JSON file; See the [README](./annotation/README.md) within the annotation directory for more details.


## Citation

✨ If you find our work helpful, please consider citing with:

ArXiv version (till proceedings are released):
```bibtex
@Article{kar2025mathbuddy,
  author  = {Kar, Debanjana and B{\"o}ss, Leopold and Braca, Dacia and Dennerlein, Sebastian Maximilian and Hubig, Nina Christine and Wintersberger, Philipp and Hou, Yufang},
  journal = {arXiv preprint arXiv:2508.19993},
  title   = {MathBuddy: A Multimodal System for Affective Math Tutoring},
  year    = {2025},
}
```

Proceedings placeholder:
```bibtex
@InProceedings{kar2025mathbuddy,
  author    = {Kar, Debanjana and B{\"o}ss, Leopold and Braca, Dacia and Dennerlein, Sebastian Maximilian and Hubig, Nina Christine and Wintersberger, Philipp and Hou, Yufang},
  booktitle = {Findings of the Association for Computational Linguistics: EMNLP 2025},
  title     = {MathBuddy: A Multimodal System for Affective Math Tutoring},
  year      = {2025},
  address   = {Suzhou, China},
  editor    = {},
  month     = {nov},
  pages     = {},
  publisher = {Association for Computational Linguistics},
  abstract  = {The rapid adoption of LLM-based conversational systems is already transforming the landscape of educational technology. However, the current state-of-the-art learning models do not take into account the student’s affective states. Multiple studies in educational psychology support the claim that positive or negative emotional states can impact a student’s learning capabilities. To bridge this gap, we present MathBuddy, an emotionally aware LLM-powered Math Tutor, which dynamically models the student’s emotions and maps them to relevant pedagogical strategies, making the tutor-student conversation a more empathetic one. The student’s emotions are captured from the conversational text as well as from their facial expressions. The student’s emotions are aggregated from both modalities to confidently prompt our LLM Tutor for an emotionally-aware response. We have effectively evaluated our model using automatic evaluation metrics across eight pedagogical dimensions and user studies. We report a massive 23 point performance gain using the win rate and a 3 point gain at an overall level using DAMR scores which strongly supports our hypothesis of improving LLM-based tutor’s pedagogical abilities by modeling students’ emotions. Our dataset and code is open sourced here: https://github.com/ITU-NLP/MathBuddy.},
  doi       = {},
  url       = {https://aclanthology.org/2025.emnlp-demo.1/},
}

```


## License

All code is licensed under the [Apache 2.0 License][apache-2.0]. 
You are free to use, modify, and distribute this software under the terms of the Apache 2.0 License.
See the LICENSE file for details.

[apache-2.0]: http://www.apache.org/licenses/LICENSE-2.0

The provided dataset is licensed under the
[Creative Commons Attribution-ShareAlike 4.0 International License][cc-by-sa]. It is based on the MathDialBridge Dataset by Macina et al., available as part of the [MathTutorBench GitHub repository](https://github.com/eth-lre/mathtutorbench/tree/main), licensed under [Creative Commons Attribution-ShareAlike 4.0 International][cc-by-sa].
Modifications were made by the Project MathBuddy Team.

[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/
