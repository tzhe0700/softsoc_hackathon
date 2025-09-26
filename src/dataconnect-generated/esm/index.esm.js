import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'softsochackathon',
  location: 'us-central1'
};

export const createNewUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser');
}
createNewUserRef.operationName = 'CreateNewUser';

export function createNewUser(dc) {
  return executeMutation(createNewUserRef(dc));
}

export const getFirstTenStoriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFirstTenStories');
}
getFirstTenStoriesRef.operationName = 'GetFirstTenStories';

export function getFirstTenStories(dc) {
  return executeQuery(getFirstTenStoriesRef(dc));
}

export const addContributionToStoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddContributionToStory', inputVars);
}
addContributionToStoryRef.operationName = 'AddContributionToStory';

export function addContributionToStory(dcOrVars, vars) {
  return executeMutation(addContributionToStoryRef(dcOrVars, vars));
}

export const getContributionsForStoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetContributionsForStory', inputVars);
}
getContributionsForStoryRef.operationName = 'GetContributionsForStory';

export function getContributionsForStory(dcOrVars, vars) {
  return executeQuery(getContributionsForStoryRef(dcOrVars, vars));
}

