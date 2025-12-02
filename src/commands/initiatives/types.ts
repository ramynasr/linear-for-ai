/**
 * TypeScript types for Linear Initiative objects
 */

export interface LinearInitiativeOwner {
  id: string;
  displayName: string;
  email: string;
}

export interface LinearInitiativeUpdate {
  id: string;
  body: string;
  createdAt: string;
  user: {
    displayName: string;
  };
}

export interface LinearInitiativeProject {
  id: string;
  name: string;
  status: string;
  url: string;
}

export interface LinearInitiativeSubInitiative {
  id: string;
  name: string;
  status: string;
  health?: string;
  slugId: string;
}

export interface LinearInitiative {
  id: string;
  name: string;
  status: string;
  slugId: string;
  url?: string;
  description?: string;
  content?: string;
  health?: string;
  createdAt?: string;
  owner?: LinearInitiativeOwner;
  creator?: LinearInitiativeOwner;
  lastUpdate?: LinearInitiativeUpdate;
  projects?: {
    nodes: LinearInitiativeProject[];
  };
  subInitiatives?: {
    nodes: LinearInitiativeSubInitiative[];
  };
}
