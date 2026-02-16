import { BaseStore } from "./store"

export interface Profile {
  userName: string,
  email: string,
  gymId?: string
  gymName?: string,
  gymRank?: number, 
  level?: ClimberLevel,
  projects?: string[],
}

export interface ProfileStore extends BaseStore {
  profile: Profile,
  
}

export enum ClimberLevel {
  beg = 'BEGINNGER',
  inter = 'INTERMEDIATE',
  adv = 'ADVANCED',
  pro = 'PRO'
}
