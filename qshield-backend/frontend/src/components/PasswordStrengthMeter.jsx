/**
 * PasswordStrengthMeter
 * Displays a 4-bar color-coded strength indicator below a password field.
 * Props: password (string)
 */
export default function PasswordStrengthMeter({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    '',
    'bg-red-500',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-green-500',
  ];
  const textColors = [
    '',
    'text-red-500',
    'text-orange-400',
    'text-yellow-500',
    'text-green-600',
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              strength >= level ? colors[strength] : 'bg-[#e1bebe]'
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-xs font-semibold ${textColors[strength]}`}>
          {labels[strength]} password
          {strength < 4 && (
            <span className="text-[#8d7070] font-normal ml-1">
              — {strength === 1 && 'add uppercase, numbers & symbols'}
              {strength === 2 && 'add numbers & symbols'}
              {strength === 3 && 'add a special symbol'}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
