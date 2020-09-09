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

### Current State
Currently, the Hack for LA website uses GitHub Actions to run a [script](https://github.com/hackforla/website/blob/gh-pages/github-actions/get-project-data.js). The script uses a HTTP request library to make calls to the API directly and performs the aggregation of the data in way that could be cleaner.

In this repository, I have developed a mixin for octokit/rest.js that fetches the desired data sets and more. This will allow users of the mixin to still use octokit/rest.js as they normally do and extend it's functionality with a minimal footprint. 

### Future Development
The endpoints created with this mixin are currently being tested. I would also like this mixin to be available through [npm](https://www.npmjs.com/). This would make the process of using the mixin more convenient for those in node environments.

### Anticipated technical outcomes
For developers to have an easier/quicker way to access the contribution data created through this mixin.

### Resources/Instructions
Soon to come

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
