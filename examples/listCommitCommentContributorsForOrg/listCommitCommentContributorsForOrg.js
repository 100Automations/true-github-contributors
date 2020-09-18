require("dotenv").config();
const fs = require('fs');
const { Octokit } = require("@octokit/rest");
const trueContributors = require("../../contributors-mixin");

Object.assign(Octokit.prototype, trueContributors);
const octokit = new Octokit({ auth: process.env.token });

(async ()=> {
    const parameters = {
        org: "Public-Tree-Map"
    };

    // trueContributors endpoint that accounts for commits and issue comments in an org
    let trueContributors = await octokit.listCommitCommentContributorsForOrg(parameters);
    console.log(`listCommitCommentContributorsForOrg returned ${trueContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommitCommentContributorsForOrg.json`, JSON.stringify(trueContributors, null, 2));

    // Fetching commit and comment contributors in an org since a given date
    let since = "2019-09-11T11:01:06.000Z";
    let trueContributorsSince = await octokit.listCommitCommentContributorsForOrg({ ...parameters, since });
    console.log(`listCommitCommentContributorsForOrg since ${since} returned ${trueContributorsSince.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommitCommentContributorsSinceForOrg.json`, JSON.stringify(trueContributorsSince, null, 2));
    
})();