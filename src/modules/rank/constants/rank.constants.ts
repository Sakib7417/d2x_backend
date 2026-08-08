import { RankLevel } from '@prisma/client';

export interface RankDefinition {
  level: RankLevel;
  name: string;
  directReferralCount: number;
  minDirectDeposit: number;
  directLv1Count: number;
  teamSize: number;
  rankBonus: number;
  cycleBonus: number;
}

export const RANK_DEFINITIONS: Record<RankLevel, RankDefinition> = {
  [RankLevel.LV1]: {
    level: RankLevel.LV1,
    name: 'Level 1',
    directReferralCount: 5,
    minDirectDeposit: 300,
    directLv1Count: 0,
    teamSize: 0,
    rankBonus: 100,
    cycleBonus: 30,
  },
  [RankLevel.LV2]: {
    level: RankLevel.LV2,
    name: 'Level 2',
    directReferralCount: 0,
    minDirectDeposit: 0,
    directLv1Count: 2,
    teamSize: 25,
    rankBonus: 300,
    cycleBonus: 150,
  },
  [RankLevel.LV3]: {
    level: RankLevel.LV3,
    name: 'Level 3',
    directReferralCount: 0,
    minDirectDeposit: 0,
    directLv1Count: 3,
    teamSize: 125,
    rankBonus: 800,
    cycleBonus: 500,
  },
  [RankLevel.LV4]: {
    level: RankLevel.LV4,
    name: 'Level 4',
    directReferralCount: 0,
    minDirectDeposit: 0,
    directLv1Count: 4,
    teamSize: 500,
    rankBonus: 2000,
    cycleBonus: 1200,
  },
  [RankLevel.LV5]: {
    level: RankLevel.LV5,
    name: 'Level 5',
    directReferralCount: 0,
    minDirectDeposit: 0,
    directLv1Count: 5,
    teamSize: 1000,
    rankBonus: 5000,
    cycleBonus: 2400,
  },
  [RankLevel.LV6]: {
    level: RankLevel.LV6,
    name: 'Level 6',
    directReferralCount: 0,
    minDirectDeposit: 0,
    directLv1Count: 6,
    teamSize: 2000,
    rankBonus: 12000,
    cycleBonus: 5000,
  },
  [RankLevel.LV7]: {
    level: RankLevel.LV7,
    name: 'Level 7',
    directReferralCount: 0,
    minDirectDeposit: 0,
    directLv1Count: 7,
    teamSize: 5000,
    rankBonus: 25000,
    cycleBonus: 10000,
  },
};

export const RANK_ORDER: RankLevel[] = [
  RankLevel.LV1,
  RankLevel.LV2,
  RankLevel.LV3,
  RankLevel.LV4,
  RankLevel.LV5,
  RankLevel.LV6,
  RankLevel.LV7,
];
