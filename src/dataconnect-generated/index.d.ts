import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddContributionToStoryData {
  contribution_insert: Contribution_Key;
}

export interface AddContributionToStoryVariables {
  storyId: UUIDString;
  word: string;
  orderInStory: number;
}

export interface Contribution_Key {
  id: UUIDString;
  __typename?: 'Contribution_Key';
}

export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface GetContributionsForStoryData {
  contributions: ({
    id: UUIDString;
    word: string;
    orderInStory: number;
    user?: {
      username: string;
    };
  } & Contribution_Key)[];
}

export interface GetContributionsForStoryVariables {
  storyId: UUIDString;
}

export interface GetFirstTenStoriesData {
  stories: ({
    id: UUIDString;
    title: string;
    startingPrompt?: string | null;
  } & Story_Key)[];
}

export interface Story_Key {
  id: UUIDString;
  __typename?: 'Story_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateNewUserData, undefined>;
  operationName: string;
}
export const createNewUserRef: CreateNewUserRef;

export function createNewUser(): MutationPromise<CreateNewUserData, undefined>;
export function createNewUser(dc: DataConnect): MutationPromise<CreateNewUserData, undefined>;

interface GetFirstTenStoriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetFirstTenStoriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetFirstTenStoriesData, undefined>;
  operationName: string;
}
export const getFirstTenStoriesRef: GetFirstTenStoriesRef;

export function getFirstTenStories(): QueryPromise<GetFirstTenStoriesData, undefined>;
export function getFirstTenStories(dc: DataConnect): QueryPromise<GetFirstTenStoriesData, undefined>;

interface AddContributionToStoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddContributionToStoryVariables): MutationRef<AddContributionToStoryData, AddContributionToStoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddContributionToStoryVariables): MutationRef<AddContributionToStoryData, AddContributionToStoryVariables>;
  operationName: string;
}
export const addContributionToStoryRef: AddContributionToStoryRef;

export function addContributionToStory(vars: AddContributionToStoryVariables): MutationPromise<AddContributionToStoryData, AddContributionToStoryVariables>;
export function addContributionToStory(dc: DataConnect, vars: AddContributionToStoryVariables): MutationPromise<AddContributionToStoryData, AddContributionToStoryVariables>;

interface GetContributionsForStoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetContributionsForStoryVariables): QueryRef<GetContributionsForStoryData, GetContributionsForStoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetContributionsForStoryVariables): QueryRef<GetContributionsForStoryData, GetContributionsForStoryVariables>;
  operationName: string;
}
export const getContributionsForStoryRef: GetContributionsForStoryRef;

export function getContributionsForStory(vars: GetContributionsForStoryVariables): QueryPromise<GetContributionsForStoryData, GetContributionsForStoryVariables>;
export function getContributionsForStory(dc: DataConnect, vars: GetContributionsForStoryVariables): QueryPromise<GetContributionsForStoryData, GetContributionsForStoryVariables>;

