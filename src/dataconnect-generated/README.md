# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetFirstTenStories*](#getfirsttenstories)
  - [*GetContributionsForStory*](#getcontributionsforstory)
- [**Mutations**](#mutations)
  - [*CreateNewUser*](#createnewuser)
  - [*AddContributionToStory*](#addcontributiontostory)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetFirstTenStories
You can execute the `GetFirstTenStories` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getFirstTenStories(): QueryPromise<GetFirstTenStoriesData, undefined>;

interface GetFirstTenStoriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetFirstTenStoriesData, undefined>;
}
export const getFirstTenStoriesRef: GetFirstTenStoriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFirstTenStories(dc: DataConnect): QueryPromise<GetFirstTenStoriesData, undefined>;

interface GetFirstTenStoriesRef {
  ...
  (dc: DataConnect): QueryRef<GetFirstTenStoriesData, undefined>;
}
export const getFirstTenStoriesRef: GetFirstTenStoriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFirstTenStoriesRef:
```typescript
const name = getFirstTenStoriesRef.operationName;
console.log(name);
```

### Variables
The `GetFirstTenStories` query has no variables.
### Return Type
Recall that executing the `GetFirstTenStories` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFirstTenStoriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFirstTenStoriesData {
  stories: ({
    id: UUIDString;
    title: string;
    startingPrompt?: string | null;
  } & Story_Key)[];
}
```
### Using `GetFirstTenStories`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFirstTenStories } from '@dataconnect/generated';


// Call the `getFirstTenStories()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFirstTenStories();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFirstTenStories(dataConnect);

console.log(data.stories);

// Or, you can use the `Promise` API.
getFirstTenStories().then((response) => {
  const data = response.data;
  console.log(data.stories);
});
```

### Using `GetFirstTenStories`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFirstTenStoriesRef } from '@dataconnect/generated';


// Call the `getFirstTenStoriesRef()` function to get a reference to the query.
const ref = getFirstTenStoriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFirstTenStoriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.stories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.stories);
});
```

## GetContributionsForStory
You can execute the `GetContributionsForStory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getContributionsForStory(vars: GetContributionsForStoryVariables): QueryPromise<GetContributionsForStoryData, GetContributionsForStoryVariables>;

interface GetContributionsForStoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetContributionsForStoryVariables): QueryRef<GetContributionsForStoryData, GetContributionsForStoryVariables>;
}
export const getContributionsForStoryRef: GetContributionsForStoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getContributionsForStory(dc: DataConnect, vars: GetContributionsForStoryVariables): QueryPromise<GetContributionsForStoryData, GetContributionsForStoryVariables>;

interface GetContributionsForStoryRef {
  ...
  (dc: DataConnect, vars: GetContributionsForStoryVariables): QueryRef<GetContributionsForStoryData, GetContributionsForStoryVariables>;
}
export const getContributionsForStoryRef: GetContributionsForStoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getContributionsForStoryRef:
```typescript
const name = getContributionsForStoryRef.operationName;
console.log(name);
```

### Variables
The `GetContributionsForStory` query requires an argument of type `GetContributionsForStoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetContributionsForStoryVariables {
  storyId: UUIDString;
}
```
### Return Type
Recall that executing the `GetContributionsForStory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetContributionsForStoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetContributionsForStory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getContributionsForStory, GetContributionsForStoryVariables } from '@dataconnect/generated';

// The `GetContributionsForStory` query requires an argument of type `GetContributionsForStoryVariables`:
const getContributionsForStoryVars: GetContributionsForStoryVariables = {
  storyId: ..., 
};

// Call the `getContributionsForStory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getContributionsForStory(getContributionsForStoryVars);
// Variables can be defined inline as well.
const { data } = await getContributionsForStory({ storyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getContributionsForStory(dataConnect, getContributionsForStoryVars);

console.log(data.contributions);

// Or, you can use the `Promise` API.
getContributionsForStory(getContributionsForStoryVars).then((response) => {
  const data = response.data;
  console.log(data.contributions);
});
```

### Using `GetContributionsForStory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getContributionsForStoryRef, GetContributionsForStoryVariables } from '@dataconnect/generated';

// The `GetContributionsForStory` query requires an argument of type `GetContributionsForStoryVariables`:
const getContributionsForStoryVars: GetContributionsForStoryVariables = {
  storyId: ..., 
};

// Call the `getContributionsForStoryRef()` function to get a reference to the query.
const ref = getContributionsForStoryRef(getContributionsForStoryVars);
// Variables can be defined inline as well.
const ref = getContributionsForStoryRef({ storyId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getContributionsForStoryRef(dataConnect, getContributionsForStoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.contributions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.contributions);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewUser
You can execute the `CreateNewUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewUser(): MutationPromise<CreateNewUserData, undefined>;

interface CreateNewUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewUserData, undefined>;
}
export const createNewUserRef: CreateNewUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewUser(dc: DataConnect): MutationPromise<CreateNewUserData, undefined>;

interface CreateNewUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateNewUserData, undefined>;
}
export const createNewUserRef: CreateNewUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewUserRef:
```typescript
const name = createNewUserRef.operationName;
console.log(name);
```

### Variables
The `CreateNewUser` mutation has no variables.
### Return Type
Recall that executing the `CreateNewUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewUserData {
  user_insert: User_Key;
}
```
### Using `CreateNewUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewUser } from '@dataconnect/generated';


// Call the `createNewUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createNewUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateNewUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewUserRef } from '@dataconnect/generated';


// Call the `createNewUserRef()` function to get a reference to the mutation.
const ref = createNewUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## AddContributionToStory
You can execute the `AddContributionToStory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addContributionToStory(vars: AddContributionToStoryVariables): MutationPromise<AddContributionToStoryData, AddContributionToStoryVariables>;

interface AddContributionToStoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddContributionToStoryVariables): MutationRef<AddContributionToStoryData, AddContributionToStoryVariables>;
}
export const addContributionToStoryRef: AddContributionToStoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addContributionToStory(dc: DataConnect, vars: AddContributionToStoryVariables): MutationPromise<AddContributionToStoryData, AddContributionToStoryVariables>;

interface AddContributionToStoryRef {
  ...
  (dc: DataConnect, vars: AddContributionToStoryVariables): MutationRef<AddContributionToStoryData, AddContributionToStoryVariables>;
}
export const addContributionToStoryRef: AddContributionToStoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addContributionToStoryRef:
```typescript
const name = addContributionToStoryRef.operationName;
console.log(name);
```

### Variables
The `AddContributionToStory` mutation requires an argument of type `AddContributionToStoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddContributionToStoryVariables {
  storyId: UUIDString;
  word: string;
  orderInStory: number;
}
```
### Return Type
Recall that executing the `AddContributionToStory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddContributionToStoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddContributionToStoryData {
  contribution_insert: Contribution_Key;
}
```
### Using `AddContributionToStory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addContributionToStory, AddContributionToStoryVariables } from '@dataconnect/generated';

// The `AddContributionToStory` mutation requires an argument of type `AddContributionToStoryVariables`:
const addContributionToStoryVars: AddContributionToStoryVariables = {
  storyId: ..., 
  word: ..., 
  orderInStory: ..., 
};

// Call the `addContributionToStory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addContributionToStory(addContributionToStoryVars);
// Variables can be defined inline as well.
const { data } = await addContributionToStory({ storyId: ..., word: ..., orderInStory: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addContributionToStory(dataConnect, addContributionToStoryVars);

console.log(data.contribution_insert);

// Or, you can use the `Promise` API.
addContributionToStory(addContributionToStoryVars).then((response) => {
  const data = response.data;
  console.log(data.contribution_insert);
});
```

### Using `AddContributionToStory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addContributionToStoryRef, AddContributionToStoryVariables } from '@dataconnect/generated';

// The `AddContributionToStory` mutation requires an argument of type `AddContributionToStoryVariables`:
const addContributionToStoryVars: AddContributionToStoryVariables = {
  storyId: ..., 
  word: ..., 
  orderInStory: ..., 
};

// Call the `addContributionToStoryRef()` function to get a reference to the mutation.
const ref = addContributionToStoryRef(addContributionToStoryVars);
// Variables can be defined inline as well.
const ref = addContributionToStoryRef({ storyId: ..., word: ..., orderInStory: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addContributionToStoryRef(dataConnect, addContributionToStoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.contribution_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.contribution_insert);
});
```

