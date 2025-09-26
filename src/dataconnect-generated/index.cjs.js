const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'softsochackathon',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createNewUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser');
}
createNewUserRef.operationName = 'CreateNewUser';
exports.createNewUserRef = createNewUserRef;

exports.createNewUser = function createNewUser(dc) {
  return executeMutation(createNewUserRef(dc));
};

const getFirstTenStoriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFirstTenStories');
}
getFirstTenStoriesRef.operationName = 'GetFirstTenStories';
exports.getFirstTenStoriesRef = getFirstTenStoriesRef;

exports.getFirstTenStories = function getFirstTenStories(dc) {
  return executeQuery(getFirstTenStoriesRef(dc));
};

const addContributionToStoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddContributionToStory', inputVars);
}
addContributionToStoryRef.operationName = 'AddContributionToStory';
exports.addContributionToStoryRef = addContributionToStoryRef;

exports.addContributionToStory = function addContributionToStory(dcOrVars, vars) {
  return executeMutation(addContributionToStoryRef(dcOrVars, vars));
};

const getContributionsForStoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetContributionsForStory', inputVars);
}
getContributionsForStoryRef.operationName = 'GetContributionsForStory';
exports.getContributionsForStoryRef = getContributionsForStoryRef;

exports.getContributionsForStory = function getContributionsForStory(dcOrVars, vars) {
  return executeQuery(getContributionsForStoryRef(dcOrVars, vars));
};
