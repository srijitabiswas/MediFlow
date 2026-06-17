import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BackButton – place at the top of every page.
 * Props:
 *   to    – string route OR -1 (default) for browser history back
 *   label – button label text (default 'Back')
 */
export default function BackButton({ to = -1, label = 'Back' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (typeof to === 'number' ? navigate(to) : navigate(to))}
      className="back-btn"
    >
      <ChevronLeft size={16} />
      {label}
    </button>
  );
}
