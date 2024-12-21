export type Organization = {
  name: string;
  avatarUrl?: string;
  id: string;
  projects: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
};

export type OrganizationsResponse = {
  organizations: {
    data: Organization[];
  };
} | null;
