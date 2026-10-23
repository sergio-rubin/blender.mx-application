export type LeadInput = {
  name: string;
  phone: string;
  email: string;
  privacy_consent: true;
  website: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
};

export type LeadPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lead[];
};

export type Session = {
  authenticated: boolean;
  username: string | null;
  csrfToken?: string;
};
