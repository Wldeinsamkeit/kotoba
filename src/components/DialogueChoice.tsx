import type { DialogueChoice } from '../types'

export function DialogueChoicePanel({
  choices,
  onSelect,
}: {
  choices: DialogueChoice[]
  onSelect: (choice: DialogueChoice) => void
}) {
  return (
    <div className="dialogue-choice-panel">
      <p className="dialogue-choice-prompt">选择你的回应：</p>
      <div className="dialogue-choice-options">
        {choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            className="dialogue-choice-btn"
            onClick={() => onSelect(choice)}
          >
            <span className="choice-ja">{choice.text}</span>
            <span className="choice-zh">{choice.textZh}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
