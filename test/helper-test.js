require("dotenv").config();
const GitHubHelper = require("../github-helper");
const fs = require('fs');

let tester = new GitHubHelper(process.env.token);

// Get Comment Contributors Test
// since: "2020-08-18T11:01:07.000Z"
tester.getCommentContributors({owner: "github", repo: "opensourcefriday"})
    .then(function(res){
        fs.writeFileSync("./data/commenters.json", JSON.stringify(res, null, 2));
    });

// Get Combined Contributors Test
tester.getCombinedContributors({owner: "github", repo: "opensourcefriday"})
    .then(function(res){
        fs.writeFileSync("./data/combined-contributors.json", JSON.stringify(res, null, 2));
    });

// Get Contributors Org Test
tester.getContributorsOrg({org: "Public-Tree-Map"})
.then(function(res){
    fs.writeFileSync("./data/org-contributors.json", JSON.stringify(res, null, 2));
});