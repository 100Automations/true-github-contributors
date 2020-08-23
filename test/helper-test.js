require("dotenv").config();
const GitHubHelper = require("../github-helper");
const fs = require('fs');

let tester = new GitHubHelper(process.env.token);

// Get Comment Contributors Test
// since: "2020-08-18T11:01:07.000Z"
tester.getCommentContributors({owner: "Public-Tree-Map", repo: "public-tree-map"})
.then(function(res){
    fs.writeFileSync("./data/comments.json", JSON.stringify(res, null, 2));
});

// Get Commit and Comment Contributors Test
tester.getCommitCommentContributors({owner: "Public-Tree-Map", repo: "public-tree-map"})
.then(function(res){
    fs.writeFileSync("./data/commits-comments.json", JSON.stringify(res, null, 2));
});

// Get Commit and Comment Contributors Org Test
tester.getCommitCommentContributorsOrg({org: "Public-Tree-Map"})
.then(function(res){
    fs.writeFileSync("./data/commits-comments-org.json", JSON.stringify(res, null, 2));
});

// Get Comment Contributors Org Test
tester.getCommentContributorsOrg({org: "Public-Tree-Map"})
.then(function(res){
    fs.writeFileSync("./data/comments-org.json", JSON.stringify(res, null, 2));
});

// Get Contributors Org Test
tester.getContributorsOrg({org: "Public-Tree-Map"})
.then(function(res){
    fs.writeFileSync("./data/contributors-org.json", JSON.stringify(res, null, 2));
});

// Get Commit Contributors Test
// since: "2020-08-16T11:01:07.000Z"
tester.getCommitContributors({owner: "Public-Tree-Map", repo: "public-tree-map", since: "2019-08-16T11:01:07.000Z"})
.then(function(res){
    fs.writeFileSync("./data/commits.json", JSON.stringify(res, null, 2));
});

// Get Commit Contributors Org Test
tester.getCommitContributorsOrg({org: "Public-Tree-Map", since: "2019-08-16T11:01:07.000Z"})
.then(function(res){
    fs.writeFileSync("./data/commits-org.json", JSON.stringify(res, null, 2));
});
