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

    // trueContributors endpoint that accounts for commits
    let trueContributors = await octokit.listCommitContributorsForOrg(parameters);
    console.log(`listCommitContributorsForOrg returned ${trueContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommitContributorsForOrg.json`, JSON.stringify(trueContributors, null, 2));

    // Fetching commit contributors since a given date
    let since = "2020-09-11T11:01:06.000Z"
    let trueContributorsSince = await octokit.listCommitContributorsForOrg({ ...parameters, since });
    console.log(`listCommitContributorsForOrg since ${since} returned ${trueContributorsSince.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommitContributorsForOrgSince.json`, JSON.stringify(trueContributorsSince, null, 2));

})();