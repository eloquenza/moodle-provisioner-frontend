export interface Plugin {
  id: string;
  name: string;
  displayName: string;
  repositoryUrl: string;
  installationPath: string;
  description?: string;
  type: 'activity' | 'block' | 'theme' | 'local' | 'admin' | 'core' | 'other';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PluginVersion {
  ref: string;
  name: string;
  type: 'branch' | 'tag' | 'pr' | 'commit';
}

// Mock plugin data
export const mockPlugins: Plugin[] = [
  {
    id: "plugin-1",
    name: "theme_boost_union",
    displayName: "Boost Union",
    repositoryUrl: "https://github.com/moodle-an-hochschulen/moodle-theme_boost_union",
    installationPath: "theme/boost_union",
    description: "Enhanced Boost theme with additional features",
    type: "theme",
    isActive: true,
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    createdBy: {
      id: "user-1",
      name: "Yvonne W.",
      email: "yvonne.w@example.org"
    }
  },
  {
    id: "plugin-2",
    name: "mod_bookit",
    displayName: "BookIT - Exam Booking",
    repositoryUrl: "https://github.com/melanietreitinger/mod_bookit",
    installationPath: "mod/bookit",
    description: "Calendar and event management activity",
    type: "activity",
    isActive: true,
    createdAt: "2024-01-12T11:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    createdBy: {
      id: "user-7",
      name: "Melanie T.",
      email: "melanie.t@example.org"
    }
  },
];

// Mock plugin versions (git references)
export const mockPluginVersions: Record<string, PluginVersion[]> = {
  "plugin-1": [
    { ref: "main", name: "Main Branch", type: "branch" },
    { ref: "MOODLE_500_STABLE", name: "Moodle 5.0 Stable", type: "branch" },
    { ref: "MOODLE_400_STABLE", name: "Moodle 4.0 Stable", type: "branch" },
    { ref: "MOODLE_401_STABLE", name: "Moodle 4.1 Stable", type: "branch" },
    { ref: "MOODLE_402_STABLE", name: "Moodle 4.2 Stable", type: "branch" },
    { ref: "MOODLE_403_STABLE", name: "Moodle 4.3 Stable", type: "branch" },
    { ref: "MOODLE_404_STABLE", name: "Moodle 4.4 Stable", type: "branch" },
    { ref: "MOODLE_405_STABLE", name: "Moodle 4.5 Stable", type: "branch" },
    { ref: "issue-138", name: "issue-138", type: "branch" },
    { ref: "v5.0-r8", name: "v5.0-r8", type: "tag" },
    { ref: "v4.5-r24", name: "v4.5-r24", type: "tag" },
    { ref: "PR#1026", name: "PR#1026: Resolves Issue #1025: Feature: Add support for filters in custom menu.", type: "pr" }
  ],
  "plugin-2": [
    { ref: "main", name: "Main Branch", type: "branch" },
    { ref: "67-calendar-implement-config-settings-in-event-form", name: "67-calendar-implement-config-settings-in-event-form", type: "branch" },
    { ref: "vadym_neu", name: "vadym_neu", type: "branch" },
    { ref: "PR#93", name: "PR#93: Vadym neu", type: "pr" }
  ],
};
