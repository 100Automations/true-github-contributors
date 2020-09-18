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

    // trueContributors endpoint that accounts for issue comments across an org
    let trueContributors = await octokit.listCommentContributorsForOrg(parameters);
    console.log(`listCommentContributorsForOrg returned ${trueContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommentContributorsForOrg.json`, JSON.stringify(trueContributors, null, 2));

    // Fetching comment contributors in an org since a given date
    let since = "2019-09-11T11:01:06.000Z";
    let trueContributorsSince = await octokit.listCommentContributorsForOrg({ ...parameters, since });
    console.log(`listCommentContributorsForOrg since ${since} returned ${trueContributorsSince.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommentContributorsForOrgSince.json`, JSON.stringify(trueContributorsSince, null, 2));
    
})();