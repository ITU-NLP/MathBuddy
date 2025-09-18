import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  return (
    <form 
      className="flex flex-grow flex-col"
      onSubmit={onSubmit}
    >
      <div className="relative flex-grow">
        <textarea
          className="chat-input w-full h-full rounded-lg p-4 pr-12 border border-neutral-300 resize-none focus:border-[#4A6FFF] focus:outline-none focus:ring-2 focus:ring-[#4A6FFF]/20 transition-all duration-200"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        ></textarea>
        <button 
          type="submit" 
          className="absolute right-3 bottom-3 text-[#4A6FFF] hover:text-[#4A6FFF]/80 text-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || !value.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </form>
  );
};

export default TextInput;
