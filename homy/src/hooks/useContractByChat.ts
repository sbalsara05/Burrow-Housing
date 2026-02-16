import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/slices/store';

export interface ChatContract {
    _id: string;
    status: 'DRAFT' | 'PENDING_TENANT_SIGNATURE' | 'PENDING_LISTER_SIGNATURE' | 'COMPLETED';
    property?: { overview?: { title?: string } };
}

export function useContractByChat(propertyId: string | null, counterpartyId: string | null) {
    const [contract, setContract] = useState<ChatContract | null | undefined>(undefined);
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        if (!propertyId || !counterpartyId || !token) {
            setContract(undefined);
            return;
        }

        let cancelled = false;
        const fetchContract = async () => {
            try {
                const res = await axios.get('/api/contracts/by-chat', {
                    params: { propertyId, counterpartyId },
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    setContract(res.data ?? null);
                }
            } catch (err) {
                if (!cancelled) {
                    setContract(null);
                }
            }
        };

        fetchContract();
        return () => { cancelled = true; };
    }, [propertyId, counterpartyId, token]);

    return contract;
}
