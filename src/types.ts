export type Role = 'Student' | 'Faculty / Responder';

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  roleBadge: string;
  avatar: string;
  actionText: string;
  heroCredits?: number;
  heroBadgeTitle?: string;
  incidentsHelpedCount?: number;
}

export type EmergencyType =
  | 'Medical emergency'
  | 'Fire Alarm / Burn'
  | 'Suspicious Activity'
  | 'Fall / Physical Injury'
  | 'Electrical Hazard'
  | 'Other Safety Emergency';

export type UrgencyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'URGENT';
export type IncidentStatus = 'ACTIVE' | 'RESPONDING' | 'HELP PROVIDED' | 'RESOLVED';

export interface PollVotes {
  needsImmediateHelp: number;
  helpBeingProvided: number;
  situationUnclear: number;
  userVotes: Record<string, string>; // userId -> voteOption
}

export interface AiTriageResult {
  incidentType: string;
  urgency: UrgencyLevel;
  severityScore: number;
  whatWeObserve: string;
  immediateSteps: string[];
  thingsToAvoid: string[];
  warningSigns: string[];
  recommendedHumanHelp: string[];
  responderBrief: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Incident {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  type: EmergencyType;
  location: string;
  note?: string;
  timestamp: string; // ISO or readable
  status: IncidentStatus;
  responders: string[]; // List of responder names
  firstResponder?: string;
  poll: PollVotes;
  aiTriage?: AiTriageResult;
  hasImage?: boolean;
  imageUrl?: string;
}

export interface AccessibilityConfig {
  language: 'English' | 'Hindi';
  simpleLanguage: boolean;
  largerText: boolean;
  highContrast: boolean;
}
