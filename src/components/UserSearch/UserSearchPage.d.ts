import React from 'react';
interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    income: number;
    numOfDependents: number;
    status: string;
    observations: string;
    photo?: string;
}
interface UserSearchProps {
    onUserSelect?: (user: User) => void;
    showActions?: boolean;
    maxResults?: number;
}
declare const UserSearch: React.FC<UserSearchProps>;
export default UserSearch;
