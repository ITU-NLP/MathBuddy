// client settings
export const USE_CONDITION_MODE: boolean = true;
export const ALLOW_NO_CONDITION_MODE: boolean = true;  // enables no condition mode option in the user condition form
export const CONDITION_NAME_VALUE_PAIRS: [string, number][] = [
  ["Interaction Saturn",  0],  // no emotions are used
  ["Interaction Neptune", 1],  // text and webcam emotions are used but not shown
  // ["Condition 2", 2],  // text and webcam emotions are used and webcam emotion is visualized
  // these number values are in sync with python backend configuration
  // you can rename the conditions but do not change the numbers
];
export const WEBCAM_EMOTION_DETECTION_DELAY: number = 250; // in ms

// server settings
export const PORT: number = 8000;
export const PYTHON_BACKEND_URL: string = "http://127.0.0.1:5050" as const;