# Overview

This project provides a helper tool to fetch contribution data for GitHub projects and organizations using the [octokit/rest.js](https://octokit.github.io/rest.js/v18/) package. The methods for the helper tool are asynchronous, so it can be used as promises or with JavaScripts `await` keyword.

The motivation for this project stemmed from an issue within development for the Hack for LA website, where we wanted to reflect contributions of those who commit code as well as those who provide their contributions through issue comments. The GitHub API currently does not have an endpoint that can resolve this issue, but instead requires the aggregation of data from 2 different API endpoints (Contributors and Issue Comments). This project does that work for you and allows you to access that data through a single method call.

## Usage
### Installation
As of right now, this is not a package available on npm. So to use, you would have to download the `github-helper.js` file locally as well as have the npm package `@octokit/rest` installed sine it is a dependency of the `GitHubHelper` class provided by `github-helper.js`.

### Example
The `GitHubHelper` class takes a GitHub API token in it's constructor. This is used to authenticate API request.

```javascript
require('dotenv').config();
const GitHubHelper = require('../github-helper');

let tester = new GitHubHelper(process.env.token);
tester.getContributorsOrg({org: "hackforla"})
    .then(function(res){
        console.log(res);
    });
```

All methods that fetch contributors return an array of contributors of the same structure (see "Example of a user object" below). The methods that fetch contribution data are:
- **GitHubHelper.getContributorsOrg()**: Reflects contributions from the [Contributors](https://developer.github.com/v3/repos/#list-repository-contributors) and [Repo Issue Comments](https://developer.github.com/v3/issues/comments/#list-issue-comments-for-a-repository) endpoints from the GitHub API across all repositories in an organization.
- **GitHubHelper.getCombinedContributors()**: Reflects contributions from the [Contributors](https://developer.github.com/v3/repos/#list-repository-contributors) and [Repo Issue Comments](https://developer.github.com/v3/issues/comments/#list-issue-comments-for-a-repository) endpoints from the GitHub API for a single repository.
- **GitHubHelper.getCommentContributors()**: Reflects contributions from the [Repo Issue Comments](https://developer.github.com/v3/issues/comments/#list-issue-comments-for-a-repository) endpoints from the GitHub API for a single repository.

Example of a user object: 
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
