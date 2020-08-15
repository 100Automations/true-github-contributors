require('dotenv').config();
const GitHubHelper = require('../github-helper');
const fs = require('fs');

let tester = new GitHubHelper(process.env.token);
tester.getContributorsOrg("Public-Tree-Map")
    .then(function(res){
        fs.writeFileSync("./org-contributors.json", JSON.stringify(res, null, 2));
    });