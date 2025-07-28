import  { useState } from 'react';
import { ArrowRight, Tag } from 'lucide-react';

const TagToggle = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag);
    setShowModal(false);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-30 flex gap-2 whitespace-nowrap">
           Finally, click TAG <ArrowRight className="h-4 w-4" />
          </div>
          {selectedTag ? (
            <div className="w-24 h-12 flex items-center justify-center rounded-lg bg-indigo-100">
              <span className="text-indigo-700 text-sm">{selectedTag}</span>
            </div>
          ) : (
            <div 
              onClick={() => setShowModal(true)}
              className="w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer hover:bg-indigo-50"
            >
              <Tag className="text-orange-700 border-4 border-orange-700 rounded-md p-2 w-10 h-10" />
            </div>
          )}
          <div className="text-gray-600 whitespace-nowrap">

          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Tag your business deduction:</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <ul className="space-y-2">
              <li className="p-2 rounded hover:bg-gray-50 cursor-pointer">Advertising & Marketing</li>
              <li className="p-2 rounded hover:bg-gray-50 cursor-pointer">Meals & Entertainment</li>
              <li className="p-2 rounded hover:bg-gray-50 cursor-pointer">Office Expenses</li>
              <li 
                className="p-2 rounded bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
                onClick={() => handleSelectTag('Travel')}
              >
                Travel
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagToggle;