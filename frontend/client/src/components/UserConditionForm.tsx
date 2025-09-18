import React, {useState} from "react";
import {CONDITION_NAME_VALUE_PAIRS} from "@shared/settings.ts";

interface UserConditionFormProps {
  setUserId: (userId: number) => void;
  setCondition: (condition: number) => void;
  setUserInitialized: (userInitialized: boolean) => void;
  allowNoConditionMode: boolean;
}

const UserConditionForm: React.FC<UserConditionFormProps> = ({
  setUserId,
  setCondition,
  setUserInitialized,
  allowNoConditionMode,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [localId, setLocalId] = useState(-1);
  const [localCondition, setLocalCondition] = useState(-1);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (localId >= 0 && localCondition >= 0) {
      setUserId(localId);
      setCondition(localCondition);
      setUserInitialized(true);
      setSubmitted(true);
    }
  };

  const handleSubmitNoConditionMode = () => {
    setUserId(-1);
    setCondition(-1);
    setUserInitialized(true);
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-4"
    >
      <input
        type="number"
        min="0"
        placeholder="User ID"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={(e) => setLocalId(parseInt(e.target.value, 10))}
        required
      />
      <select
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={(e) => setLocalCondition(Number(e.target.value))}
        defaultValue=""
        required
      >
        <option value="" disabled>
          Select Interaction
        </option>
        {CONDITION_NAME_VALUE_PAIRS.map(([text, value]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
      <button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition duration-200 disabled:opacity-50 shadow-sm"
        disabled={submitted}
      >
        {!submitted ? "Start" : "Loading..."}
      </button>
      {allowNoConditionMode && (
        <div>
        <hr className="mt-4 mb-4"/>
        <button
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition duration-200 disabled:opacity-50 shadow-sm"
          disabled={submitted}
          onClick={handleSubmitNoConditionMode}
        >
          {!submitted ? "Free Mode" : "Loading..."}
        </button>
        </div>
      )}
    </form>
  );
}

export default UserConditionForm;