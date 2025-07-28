import { useState, useEffect } from 'react';
import { PiTag } from "react-icons/pi";
import { TransactionTag } from '../../utils/types';
import { X } from 'lucide-react';
import { useTransactionTags } from '../../hooks/useTransactionTags';

interface TagButtonProps {
  id: number;
  tag: TransactionTag | null;
  business: boolean;
  openTagModal: (id: number, business: boolean) => void;
  onUpdate: () => Promise<void>;
}

const TagButton: React.FC<TagButtonProps> = ({
  id,
  tag,
  business,
  openTagModal,
  onUpdate,
}) => {
  const [currentTag, setCurrentTag] = useState<TransactionTag | null>(tag);
  const { updateTag, isLoading } = useTransactionTags(onUpdate);

  useEffect(() => {
    setCurrentTag(tag);
  }, [tag]);


  const handleDelete = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation(); // Prevent opening the tag modal
      if (isLoading) return;
      
      await updateTag(id, 0); // Pass 0 or null to remove the tag
      setCurrentTag(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <button title="Tag to specify its deduction category"
      onClick={() => openTagModal(id, business)}
      className={`flex items-center space-x-2 px-3 py-1 hover:bg-gray-50 relative group
        ${currentTag?.name && business ? 'bg-blue-50 border rounded-md' : ''}
        ${currentTag?.name && !business ? 'bg-green-50 border rounded-md' : ''}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isLoading}
    >
      {!currentTag?.name && <PiTag size={16} className="text-gray-500 border-gray-500 bg-gray-50 p-1 w-6 h-6 border rounded-md" />}
      <span className="text-left">{currentTag?.name || ''}</span>
      {currentTag?.name && (
        <X
          size={16}
          onClick={handleDelete}
          className={`opacity-0 group-hover:opacity-100 ml-1 hover:text-red-500 transition-opacity
            ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        />
      )}
    </button>
  );
};

export default TagButton;