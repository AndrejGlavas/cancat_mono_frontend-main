import React from 'react';
import { X as LuX, Loader } from "lucide-react";
import { Tag, TransactionType } from '../../utils/types';

interface TagModalProps {
    isOpen: boolean;
    tags: Tag[];
    selectedTagTransId: number | null;
    setShowTagModal: (show: boolean) => void;
    handleTagChange: (transactionId: number, tagId: number, callback?: () => void) => void;
    transactionType: TransactionType;
    isLoading?: boolean;
    error?: string | null;
}

const TagModal: React.FC<TagModalProps> = ({
    isOpen,
    tags = [],
    selectedTagTransId,
    setShowTagModal,
    handleTagChange,
    transactionType,
    isLoading = false,
    error = null
}) => {
    if (!isOpen) return null;

    const handleSelection = (tagId: number) => {
        if (selectedTagTransId !== null) {
            handleTagChange(selectedTagTransId, tagId, () => setShowTagModal(false));
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-[#4338CA]">
                        Select {transactionType === TransactionType.BUSINESS ? 'Business' : 'Personal'} Tag
                    </h3>
                    <button 
                        onClick={() => setShowTagModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <LuX size={20} />
                    </button>
                </div>
                
                <div className="overflow-y-auto max-h-80">
                    {isLoading ? (
                        <div className="flex justify-center items-center p-4">
                            <Loader className="animate-spin" size={24} />
                        </div>
                    ) : error ? (
                        <div className="text-red-500 p-4 text-center">
                            {error}
                        </div>
                    ) : tags.length === 0 ? (
                        <div className="text-gray-500 p-4 text-center">
                            No tags available
                        </div>
                    ) : (
                        tags.map(tag => (
                            <div
                                key={tag.id}
                                onClick={() => handleSelection(tag.id)}
                                className="cursor-pointer p-2 hover:bg-gray-100 rounded flex items-center"
                            >
                                
                                {tag.name}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TagModal;