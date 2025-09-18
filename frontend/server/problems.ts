import {InsertMessage, RoleSchema, Session} from "@shared/schema.ts";

const PROBLEM_INDEX_LOOKUP: number[][] = [
  [0, 1] as const,
  [1, 0] as const,
] as const
const PROBLEM_INDEX_LOOKUP_LENGTH: number = PROBLEM_INDEX_LOOKUP.length;

const PROBLEM_LOOKUP: string[] = [
  // Problem 1
  `A circular flower bed has a radius of 3 meters. 
  You want to place a square stone path centered inside the circle, with its corners touching the edge.
  Question: What is the area of the stone path?` as const,

  // Problem 2
  `A coffee shop sells muffins in three flavors: 3 blueberry, 3 strawberry and 4 chocolate. 
  A customer randomly picks two muffins without looking. 
  Question: What is the probability that both muffins are of the same flavor?` as const,

  // Problem 3 (currently not in use)
  `Sarah goes for a morning bike ride. Her speed (in km/h) at time t (in hours) is modeled by the function: 
  v(t)=4t for 0≤t≤2
  Question: How far does Sarah travel during the first 2 hours?` as const,
] as const;

const GREETING_TEMPLATE: string = `Hi there! 👋 I am your MathBuddy tutor. Let's work on a math problem together. Here's the problem:

{problem}

What do you think we should do first? Feel free to ask if you're unsure, I’m here to help!`;

const GENERAL_GREETING: string = `Hi there! 👋 I am your MathBuddy tutor. Is there anything I can help you with?`

export function getProblemStatement(session: Session): InsertMessage {
  const userId = session.userId;
  const condition = session.condition;

  let content: string;
  if (condition >= 0) {
    const problem_indices = PROBLEM_INDEX_LOOKUP[userId % PROBLEM_INDEX_LOOKUP_LENGTH];
    const problem_index = problem_indices[condition];
    const problem = PROBLEM_LOOKUP[problem_index];
    content = GREETING_TEMPLATE.replace("{problem}", problem);
  } else {  // non-condition mode is enabled
    content = GENERAL_GREETING;
  }

  return {
    sessionId: session.sessionId,
    content: content,
    role: RoleSchema.enum.tutor
  }
}