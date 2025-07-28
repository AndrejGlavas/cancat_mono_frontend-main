import { useState } from "react";
import { transactionsApi } from "../services/transactionsApi";
import { Tag, TransactionTag, TransactionType } from "../utils/types";
import { useToast } from "../components/ToastModule";

export const useTransactionTags = (onUpdate: () => Promise<void>) => {
  const { showToast } = useToast();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [assignedTag, setAssignedTag] = useState<TransactionTag | null>(null);
  const [selectedTagTransId, setSelectedTagTransId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTypeForApi = (type: TransactionType): string => {
    return type === TransactionType.BUSINESS ? "business" : "personal";
  };

  const standardizeTagType = (tagType: string): TransactionType => {
    return tagType.toUpperCase() === "BUSINESS"
      ? TransactionType.BUSINESS
      : TransactionType.PERSONAL;
  };

  const fetchTags = async (type: TransactionType) => {
    try {
      setIsLoading(true);
      setError(null);
      const apiType = formatTypeForApi(type);
      const tags = await transactionsApi.getTags(apiType);

      const formattedTags = tags.map((tag) => ({
        ...tag,
        type: standardizeTagType(tag.type),
      }));

      setAvailableTags(formattedTags);
    } catch (error) {
      console.error("Error fetching available tags:", error);
      setError("Failed to fetch available tags");
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionTag = async (
    transactionId: number
  ): Promise<TransactionTag | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const tag = await transactionsApi.getTransactionTag(transactionId);

      if (!tag) {
        setAssignedTag(null);
        return null;
      }

      const formattedTag = {
        ...tag,
        type: standardizeTagType(tag.type),
      };

      setAssignedTag(formattedTag);
      return formattedTag;
    } catch (error) {
      console.error("Error fetching transaction tag:", error);
      setError("Failed to fetch transaction tag");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTag = async (
    transactionId: number,
    tagId: number,
    callback?: () => void
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await transactionsApi.updateTransactionTag(transactionId, tagId);
      await getTransactionTag(transactionId);
      await onUpdate();
      showToast("Deduction tagged successfully");
      if (callback) callback();
    } catch (error) {
      console.error("Error updating tag:", error);
      setError("Failed to update tag");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    availableTags,
    assignedTag,
    selectedTagTransId,
    setSelectedTagTransId,
    fetchTags,
    getTransactionTag,
    updateTag,
    isLoading,
    error,
  };
};
