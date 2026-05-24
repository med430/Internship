import { Offer } from './offer.entity';
export declare class RecruiterProfile {
    readonly id: string;
    readonly userId: string;
    company: string;
    companyDescription?: string | undefined;
    website?: string | undefined;
    offers: Offer[];
    constructor(id: string, userId: string, company: string, companyDescription?: string | undefined, website?: string | undefined, offers?: Offer[]);
}
