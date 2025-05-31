type SortType = {
    type: null | 'date' | 'string' | 'natural' | 'number' | 'custom';
    data?: {
        customFunctionName?: string;
    };
};
type SortOrder = null | 'asc' | 'desc';

export type { SortType, SortOrder };
