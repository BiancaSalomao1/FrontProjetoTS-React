import React from 'react';
interface ClientData {
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
interface ClientFormProps {
    user?: ClientData;
}
declare const ClientRegistrationForm: React.FC<ClientFormProps>;
export default ClientRegistrationForm;
