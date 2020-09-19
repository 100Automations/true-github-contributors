# True GitHub Contributors
## Overview
This project provides a helper tool to fetch contributor data sets for GitHub repositories and organizations using by extending the [octokit/rest.js](https://octokit.github.io/rest.js/v18/) package.

### Problem Being Solved
On the Hack for LA website we wanted to show all Project team contributors (not just people who commit code).  In order to do that we needed to capture the contributions made by those who provide content (images, comments) on issues.  GitHub currently does not have this as an aggregated endpoint.

### Value Created from Solution
The benefit of including issue comments in contribution data is that a more complete data set of contributors is given. With GitHub having features like project boards and issue comments, GitHub has opened up more ways for different roles to contribute code. Designers post screenshots of mock ups, project managers communicate critical information to team members, and even developers have productive discussions about the code they are writing. By including these comments as contributions, a clearer picture of who is/has been active in the project is shown.

### Solution (simplified explanation):
We created a script that 
1. Fetched the data from the GitHub API Repository Contributors  endpoint which returns a pre deduped list of all GithHub handles from code commits and the number of contributions.
2. Fetched the data from the GitHub API Repository Issue Comments endpoint which returns all issue comments in a repository
3. Created a list a list of handles and number of contributions to entire repository (same format as the contributors api).
4. Aggregated the responses from the two lists.

There is more to it then the above, e.g. how to deal with pagination of results issues, etc.  read below for more technical details.

This repo/tool also makes use of the octokit/rest.js package and then extends it. 

### Stakeholders
- Project Leadership: Able to see who is contributing to repositories and organizations.
- Project contributors: Efforts made through issue comments will be reflected in contributor sets. 

## Technical Details

### Installation
Install with npm using `npm install true-github-contributors`

### Current State
Currently, the Hack for LA website uses GitHub Actions to run a [script](https://github.com/hackforla/website/blob/gh-pages/github-actions/get-project-data.js). The script uses a HTTP request library to make calls to the API directly and performs the aggregation of the data in way that could be cleaner.

In this repository, I have developed a mixin for octokit/rest.js that fetches the desired data sets and more. This will allow users of the mixin to still use octokit/rest.js as they normally do and extend it's functionality with a minimal footprint. 

The mixin uses `octokit/rest` `[pagination]`(https://octokit.github.io/rest.js/v18#pagination) endpoint to fetch relevant commit/issue comment data. Because commit/issue comment data can be large, this results in long wait times for the `paginate` endpoint to return commit/issue comment data. This, in turn, results  in the endpoints of this mixin to have long wait times when the specified repository/organization has large amounts of commits/issue comments. Please keep this in mind if it is necessary for your project to be as fast as possible.

### Future Development
The endpoints created with this mixin are currently being tested. I would also like this mixin to be available through [npm](https://www.npmjs.com/). This would make the process of using the mixin more convenient for those in node environments.

### Anticipated technical outcomes
For developers to have an easier/quicker way to access the contribution data created through this mixin.

### Resources/Instructions
See [API documentaion](#api) below for documentation on how to use the API. If you would like to see usage examples for each of the API endpoints, refer to the [examples](https://github.com/100Automations/true-github-contributors/tree/mixin/examples) directory in this repo.

### Language
JavaScript

### Platform
Any JavaScript enviroment that is using octokit/rest.js.

### Automation triggers
Because this is an extension of octokit/rest.js, it is used in a way that is identical to octokit/rest.js. That is, the API Client can be used in single use scripts, automated scripts, or in any JavaScript environment.

### Input required
The goal of this mixin is to make it feel like it's naturally a part of octokit/rest.js. Because of that, it also takes input similarly to how octokit/rest.js: a set of parameters that define the desired organiation/repo and additional parameters to further define what you want the data set to represent. In the future, there will be detailed documentation on how to use the mixin.

### Output
Each of the endpoints will return an arraay of contributor objects that mimic the structure of the "List Repository Contributors" [endpoint](https://developer.github.com/v3/repos/#list-repository-contributors) of the GitHub API:
```javascript
{
    login: 'KianBadie',
    id: 18221058,
    node_id: 'MDQ6VXNlcjE4MjIxMDU4',
    avatar_url: 'https://avatars1.githubusercontent.com/u/18221058?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/KianBadie',
    html_url: 'https://github.com/KianBadie',
    followers_url: 'https://api.github.com/users/KianBadie/followers',
    following_url: 'https://api.github.com/users/KianBadie/following{/other_user}',
    gists_url: 'https://api.github.com/users/KianBadie/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/KianBadie/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/KianBadie/subscriptions',
    organizations_url: 'https://api.github.com/users/KianBadie/orgs',
    repos_url: 'https://api.github.com/users/KianBadie/repos',
    events_url: 'https://api.github.com/users/KianBadie/events{/privacy}',
    received_events_url: 'https://api.github.com/users/KianBadie/received_events',
    type: 'User',
    site_admin: false,
    contributions: 160
  }
```
Every user object will have additional endpoints that can give more data about each contributor, as well as a `contribution` property that represents the number of contributions a user has made to a repository or organization.

## API
### Configuration
As mentioned previously, this mixin is an extension of GitHub's [octokit/rest.js](https://octokit.github.io/rest.js/v18/) API Client. In order to use the features of this mixin, the octokit/rest.js package is required.
```javascript
require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const trueGitHubContributors = require("true-github-contributors");

Object.assign(Octokit.prototype, trueGitHubContributors);
const octokit = new Octokit({ auth: process.env.token });
```
While using an API token to construct an `Octokit` instance is not required, I highly recommend it with the use of this mixin (like I did in the above code snippet). Endpoints that access data like commits and comments have the potentional of fetching a large amount of data. Using an API token will decrease the chances of you exceeding the GitHub API rate limits.

### Usage
The endpoints of the mixin are accessed a bit differently than how endpoints are normally accessed with `octokit/rest`. API endpoints are called directly on the `octokit` object, as in:
```javascript
octokit.listCommitContributors(parameters) // Mixin endpoint for fetching commit contributors
octokit.listContributorsForOrg(parameters) // Mixin endpoint for fetching contributors across an organization
```
As opposed to `octokit/rest`, where endpoints are nested into property specific groupings
```javascript
octokit.repos.listContributors(parameters) // Octokit endpoint for fetching contributors
octokit.repos.listForOrg(parameters) // Octokit endpoint for fetching repos in an organization
```

### Endpoint Documentation
#### `listCommentContributors(parameters)`
Fetches GitHub contributors list for a repository with contributions based on the number of issue comments a user has made and sorts them by the number of issue comments per contributor in descending order. 

**Parameters**: JSON object that reads the following
- `owner`: String login name of the owner of the repository.
- `repo`: String repository name.
- `[since]`: String [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp denoting which date to start fetching comments from.

#### `listCommitContributors(parameters)`
Fetches GitHub contributors list for a repository with contributions based on the number of commits a user has made and sorts them by the number of commits per contributor in descending order. 

**Parameters**: JSON object that reads the following
- `owner`: String login name of the owner of the repository.
- `repo`: String repository name.
- `[sha]`: String SHA or branch to start listing commits from. Default: the repository’s default branch.
- `[path]`: String file path to fetch contributions only to this file.
- `[since]`: String [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp denoting which date to start fetching commits from.
- `[until]`: String [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp denoting which date to stop fetching commits before.

#### `listCommitCommentContributors(parameters)`
Fetches GitHub contributors list for a repository with contributions based on the number of issue comments and commits a user has made and sorts them by the number of total contributions per contributor in descending order.

**Parameters**: JSON object that reads the following
- `owner`: String login name of the owner of the repository.
- `repo`: String repository name.
- `[since]`: String [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp denoting which date to start fetching comments from.

#### `listContributorsForOrg(parameters)`
Fetches contributors to a specified organization using `octokit/rest`'s native [`repos.listContributors`](https://octokit.github.io/rest.js/v18#repos-list-contributors) endpoint and sorts them by the number of commits per contributor in descending order.

**Parameters**: JSON object that reads the following
- `org`: String login name of the owner of the organization.
- `type`: String type of repository to fetch from. Can be one of `all`, `public`, `private`, `forks`, `sources`, `member`, `internal`. Default: `all`. If your organization is associated with an enterprise account using GitHub Enterprise Cloud or GitHub Enterprise Server 2.20+, type can also be `internal`.
- `[anon]`: Boolean or Int to denote if anonymous contributors (no existing GitHub accounts associated with commit author email) should be included in results. 

#### `listCommitContributorsForOrg(parameters)`
Fetches GitHub contributors list for an organization with contributions based on the number of commits a user has made and sorts them by the number of commits per contributor in descending order.

**Parameters**: JSON object that reads the following
- `org`: String login name of the owner of the organization.
- `type`: String type of repository to fetch from. Can be one of `all`, `public`, `private`, `forks`, `sources`, `member`, `internal`. Default: `all`. If your organization is associated with an enterprise account using GitHub Enterprise Cloud or GitHub Enterprise Server 2.20+, type can also be `internal`.
- `[sha]`: String SHA or branch to start listing commits from. Default: the repository’s default branch.
- `[path]`: String file path to fetch contributions only to this file.
- `[since]`: String [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp denoting which date to start fetching commits from.
- `[until]`: String [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp denoting which date to stop fetching commits before.

#### `listCommentContributorsForOrg(parameters)`
Fetches GitHub contributors list for an organization with contributions based on the number of issue comments a user has made and sorts them by the number of issue comments per contributor in descending order. 

**Parameters**: JSON object that reads the following
- `org`: String login name of the owner of the organization.
- `type`: String type of repository to fetch from. Can be one of `all`, `public`, `private`, `forks`, `sources`, `member`, `internal`. Default: `all`. If your organization is associated with an enterprise account using GitHub Enterprise Cloud or GitHub Enterprise Server 2.20+, type can also be `internal`.
- `[since]`: String [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp denoting which date to start fetching comments from.

#### `listCommitCommentContributorsForOrg(parameters)`
Fetches GitHub contributors list for an organization with contributions based on the number of issue comments and commits a user has made and sorts them by the number of total contributions per contributor in descending order.


**Parameters**: JSON object that reads the following
- `org`: String login name of the owner of the organization.
- `type`: String type of repository to fetch from. Can be one of `all`, `public`, `private`, `forks`, `sources`, `member`, `internal`. Default: `all`. If your organization is associated with an enterprise account using GitHub Enterprise Cloud or GitHub Enterprise Server 2.20+, type can also be `internal`.
- `[since]`: String [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp denoting which date to start fetching comments from.
