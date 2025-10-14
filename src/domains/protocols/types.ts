export interface Protocol {
  id: string;
  name: string;
  logoUrl: string | null;
  summary: string | null;
  createdAt: string;
}

export interface ProtocolContact {
  id: string;
  protocolId: string;
  name: string;
  role: string | null;
  phone: string | null;
  telegram: string | null;
  github: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ProtocolWithContacts extends Protocol {
  contacts: ProtocolContact[];
}